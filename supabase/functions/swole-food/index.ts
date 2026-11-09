// Calorías desde una foto: recibe la foto del plato (achicada en el celu), le pregunta a Claude qué hay
// y cuántos gramos de cada cosa, y devuelve opciones para que el usuario confirme y corrija.
// La clave de la IA vive en los secretos de Supabase (ANTHROPIC_API_KEY), nunca en la app.
// La foto no se guarda en ningún lado.
import Anthropic from 'npm:@anthropic-ai/sdk';
import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 2 });
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
const DAILY = 20;

const OPTION = {
  type: 'object', additionalProperties: false,
  required: ['name', 'match_id', 'kcal_100', 'prot_100', 'carb_100', 'fat_100'],
  properties: {
    name: { type: 'string', description: 'Nombre corto en español rioplatense' },
    match_id: { type: 'string', description: 'id de la lista de la app si coincide; si no, cadena vacía' },
    kcal_100: { type: 'number' }, prot_100: { type: 'number' }, carb_100: { type: 'number' }, fat_100: { type: 'number' },
  },
};
const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['is_food', 'items', 'scale', 'tip'],
  properties: {
    is_food: { type: 'boolean' },
    items: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['options', 'grams', 'grams_low', 'grams_high'],
        properties: {
          options: { type: 'array', items: OPTION, description: 'La más probable primero; 2 o 3 opciones' },
          grams: { type: 'number', description: 'Gramos estimados de la porción visible (cocida, como se ve)' },
          grams_low: { type: 'number' }, grams_high: { type: 'number' },
        },
      },
    },
    scale: { type: 'string', description: 'Qué usaste para calcular el tamaño (plato, cubiertos, mano, envase)' },
    tip: { type: 'string', description: 'Si la foto no deja calcular bien el tamaño, un consejo corto para la próxima; si no, cadena vacía' },
  },
};

const SYSTEM = `Sos un nutricionista que estima porciones a partir de fotos para una app de entrenamiento uruguaya/argentina.
Tu trabajo es identificar cada alimento visible y estimar su peso en gramos con la mayor precisión posible.

Para el tamaño:
- Usá referencias de escala que se vean: un plato llano común mide ~26 cm, uno de postre ~20 cm, un tenedor ~19 cm, una cuchara sopera ~17 cm, una mano adulta ~18 cm, una lata 12 cm de alto, un vaso común 250 ml.
- Pensá en el volumen (superficie × altura) y la densidad de cada alimento antes de dar los gramos. Las porciones grandes se suelen subestimar: no achiques.
- Si no hay ninguna referencia de escala, asumí un plato llano de 26 cm, ampliá el rango (grams_low a grams_high) y pedí en "tip" que la próxima incluya el plato entero o un tenedor.

Para los alimentos:
- Un ítem por alimento distinto (ej: milanesa, puré y ensalada son 3 ítems). No inventes cosas que no se ven; si algo está claramente frito o con salsa, reflejalo en los valores del alimento (ej: "papas fritas", no "papa").
- Dá 2 o 3 opciones por ítem, la más probable primero, para que el usuario elija si te equivocaste (ej: "Milanesa de carne", "Milanesa de pollo").
- Si una opción coincide con un alimento de la lista de la app, poné su id en match_id; si no, cadena vacía.
- Los valores son cada 100 g del alimento tal como se ve (cocido), de tablas confiables (USDA, ARGENFOODS).
- Si la foto no es de comida, is_food = false e items vacío.`;

function userId(req: Request): string | null {
  try {
    const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    const p = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(p + '='.repeat((4 - p.length % 4) % 4)));
    return claims.role === 'authenticated' && claims.sub ? claims.sub : null;
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  const uid = userId(req);
  if (!uid) return json({ error: 'login' }, 401);
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return json({ error: 'nokey' });

  let body: any;
  try { body = await req.json(); } catch { return json({ error: 'bad' }, 400); }
  const img = String(body?.img || '');
  if (!img || img.length > 3_000_000 || !/^[A-Za-z0-9+/=]+$/.test(img)) return json({ error: 'bad' }, 400);
  const foods = Array.isArray(body?.foods) ? body.foods.slice(0, 160).map((f: any) => [String(f?.[0] || '').slice(0, 20), String(f?.[1] || '').slice(0, 60)]) : [];
  const hint = String(body?.hint || '').slice(0, 120);

  // límite por día (cuenta intentos, así un error no sale gratis para abusar)
  const day = new Date().toISOString().slice(0, 10);
  const [row] = await sql`insert into swole_priv.food_use (user_id, day, n) values (${uid}, ${day}, 1)
    on conflict (user_id, day) do update set n = swole_priv.food_use.n + 1 returning n`;
  if (row.n > DAILY) return json({ error: 'limit', limit: DAILY });

  const client = new Anthropic({ apiKey: key });
  try {
    const r: any = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 8000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'medium', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: img } },
          { type: 'text', text: 'Lista de alimentos de la app (id: nombre):\n' + foods.map((f: string[]) => f[0] + ': ' + f[1]).join('\n') +
            (hint ? '\n\nEl usuario aclara: ' + hint : '') + '\n\nIdentificá lo que hay en la foto y estimá los gramos.' },
        ],
      }],
    } as any);
    if (r.stop_reason === 'refusal') return json({ error: 'refusal' });
    if (r.stop_reason === 'max_tokens') return json({ error: 'api', msg: 'respuesta incompleta' });
    const txt = (r.content || []).find((b: any) => b.type === 'text');
    const out = JSON.parse(txt?.text || '{}');
    return json({ ok: true, left: Math.max(0, DAILY - row.n), ...out });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: 'busy' });
    if (e instanceof Anthropic.AuthenticationError) return json({ error: 'nokey' });
    if (e instanceof Anthropic.APIError) return json({ error: 'api', msg: String(e.status) });
    return json({ error: 'api', msg: String((e as Error)?.message || e).slice(0, 120) });
  }
});
