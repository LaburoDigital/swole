# Servidor de Swole (Supabase)

Esto es una copia de referencia de lo que corre en Supabase (proyecto `couuuvckplstgksanzgr`):

- **Tablas**: `swole_data` (tus datos sincronizados), `swole_public` + `swole_friends` (amigos), `swole_push` (recordatorios).
- **Esquema privado** `swole_priv.config`: claves de notificación y secreto del cron (la app no lo puede leer).
- **Función** `swole-remind` (`functions/swole-remind/index.ts`): la llama `pg_cron` cada 15 minutos y manda los recordatorios del día.

Si cambiás la función, volvé a desplegarla en Supabase (Edge Functions).

## Comida desde foto (`swole-food`)
- **Función** `swole-food` (`functions/swole-food/index.ts`, requiere sesión iniciada): recibe la foto achicada, le pregunta a Claude (claude-opus-5-5) qué hay y cuántos gramos, y devuelve 2-3 opciones por alimento. La foto no se guarda.
- **Límite**: 20 fotos por día por usuario (tabla `swole_priv.food_use`).
- **Para activarla**: en Supabase → Edge Functions → Secrets, agregar `ANTHROPIC_API_KEY` con una clave de console.anthropic.com. Sin la clave, la app avisa que todavía no está activada.
