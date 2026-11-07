// Recordatorios de Swole: el cron la llama cada 15 minutos; también sirve para mandarte una notificación de prueba.
import webpush from 'npm:web-push@3.6.7';
import postgres from 'https://deno.land/x/postgresjs@v3.4.5/mod.js';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 2 });
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-cron', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

async function cfg() {
  const rows = await sql`select k, v from swole_priv.config`;
  const m: Record<string, string> = {};
  for (const r of rows) m[r.k] = r.v;
  return m;
}
async function keys() {
  let c = await cfg();
  if (!c.vapid_pub || !c.vapid_priv) {
    const k = webpush.generateVAPIDKeys();
    await sql`insert into swole_priv.config (k, v) values ('vapid_pub', ${k.publicKey}), ('vapid_priv', ${k.privateKey}) on conflict (k) do nothing`;
    c = await cfg();
  }
  webpush.setVapidDetails('https://laburodigital.github.io/swole/', c.vapid_pub, c.vapid_priv);
  return c;
}

const DOW: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function localNow(tz: string) {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short' }).formatToParts(new Date());
  } catch { return localNow('America/Montevideo'); }
  const g = (t: string) => (parts.find(p => p.type === t) || { value: '' }).value;
  const h = +g('hour') % 24, mi = +g('minute');
  return { dk: `${g('year')}-${g('month')}-${g('day')}`, min: h * 60 + mi, dow: DOW[g('weekday')] ?? 0 };
}

// arma el mensaje del día a partir de los datos sincronizados del usuario
function message(data: any, kinds: any, dk: string, dow: number) {
  data = data || {};
  const lines: string[] = [];
  let title = 'Swole';
  if (kinds?.train) {
    const routines: any[] = Array.isArray(data.routines) ? data.routines : [];
    const ids = new Set<string>(((data.plan || {})[dk]) || []);
    routines.forEach(r => { if (Array.isArray(r.days) && r.days.includes(dow) && dk >= (r.since || '0000-00-00')) ids.add(r.id); });
    const planned = routines.filter(r => ids.has(r.id));
    const done = (Array.isArray(data.logs) ? data.logs : []).some((l: any) => l.date === dk);
    if (planned.length && !done) { title = 'Hoy te toca entrenar'; lines.push(planned.map(r => r.name).join(' + ') + '. Vamos que se puede.'); }
  }
  if (kinds?.crea && !((data.creatine || {})[dk])) lines.push('Acordate de tomar la creatina.');
  return lines.length ? { title, body: lines.join(' ') } : null;
}

async function send(row: any, payload: unknown) {
  try { await webpush.sendNotification(row.sub, JSON.stringify(payload), { TTL: 6 * 3600 }); return true; }
  catch (e: any) {
    if (e?.statusCode === 404 || e?.statusCode === 410) await sql`delete from public.swole_push where id = ${row.id}`;
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const c = await keys();
    // prueba: el usuario logueado se manda una notificación a sus dispositivos
    const auth = req.headers.get('authorization') || '';
    if (!req.headers.get('x-cron') && auth.startsWith('Bearer ')) {
      const u = await fetch(Deno.env.get('SUPABASE_URL') + '/auth/v1/user', { headers: { apikey: Deno.env.get('SUPABASE_ANON_KEY')!, Authorization: auth } });
      if (!u.ok) return json({ error: 'auth' }, 401);
      const user = await u.json();
      const rows = await sql`select id, sub from public.swole_push where user_id = ${user.id}`;
      let n = 0;
      for (const r of rows) if (await send(r, { title: 'Swole', body: 'Listo: así te van a llegar los recordatorios.', tag: 'swole-test' })) n++;
      return json({ ok: true, sent: n, devices: rows.length });
    }
    if (req.headers.get('x-cron') !== c.cron) return json({ error: 'forbidden' }, 403);
    const subs = await sql`select p.id, p.sub, p.tz, p.at, p.kinds, p.last_sent, d.data from public.swole_push p left join public.swole_data d on d.user_id = p.user_id`;
    let sent = 0, checked = 0;
    for (const s of subs) {
      const t = localNow(s.tz || 'America/Montevideo');
      if (s.last_sent === t.dk) continue;
      const [ah, am] = String(s.at || '18:00').split(':').map(Number), at = ah * 60 + am;
      if (t.min < at || t.min > at + 120) continue;
      checked++;
      await sql`update public.swole_push set last_sent = ${t.dk} where id = ${s.id}`;
      const m = message(s.data, s.kinds, t.dk, t.dow);
      if (m && await send(s, { ...m, tag: 'swole-' + t.dk })) sent++;
    }
    return json({ ok: true, subs: subs.length, checked, sent });
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
