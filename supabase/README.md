# Servidor de Swole (Supabase)

Esto es una copia de referencia de lo que corre en Supabase (proyecto `couuuvckplstgksanzgr`):

- **Tablas**: `swole_data` (tus datos sincronizados), `swole_public` + `swole_friends` (amigos), `swole_push` (recordatorios).
- **Esquema privado** `swole_priv.config`: claves de notificación y secreto del cron (la app no lo puede leer).
- **Función** `swole-remind` (`functions/swole-remind/index.ts`): la llama `pg_cron` cada 15 minutos y manda los recordatorios del día.

Si cambiás la función, volvé a desplegarla en Supabase (Edge Functions).
