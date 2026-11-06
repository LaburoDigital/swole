# Swole: cómo publicarla

Esta carpeta es la app entera. Para que sea instalable, funcione sin internet y sincronice, tiene que estar en una web con **https**.

## 1. Dónde está publicada
**https://laburodigital.github.io/swole/**

La sirve GitHub Pages desde el repo https://github.com/LaburoDigital/swole (rama `main`).

## 2. Supabase (ya configurado)
El proyecto se llama **swole**: https://supabase.com/dashboard/project/couuuvckplstgksanzgr

- **URL Configuration:** Site URL `https://laburodigital.github.io/swole/` y Redirect URL `https://laburodigital.github.io/swole/**`. Así los links de los emails vuelven a la app.
- **Login:** email + contraseña. Al crear la cuenta llega un email para confirmarla una sola vez; después se entra con la contraseña. "Me olvidé la contraseña" manda un link para elegir una nueva.

**Para que otras personas se puedan registrar:** el email que trae Supabase de fábrica **solo manda a los emails de tu organización** (o sea, a vos), y sin email no pueden confirmar la cuenta. Hay dos caminos:
- Conectar un servicio de email (por ejemplo Resend, gratis) en Authentication → Emails → SMTP Settings. Es lo recomendado y además permite personalizar los emails.
- O apagar "Confirm email" en Authentication → Sign In / Providers. Es más fácil, pero cualquiera podría registrarse con un email que no es suyo.

## 3. Instalarla en el celular
- **iPhone (Safari):** abrí el link → Compartir → "Agregar a inicio".
- **Android (Chrome):** abrí el link → menú ⋮ → "Instalar app".

Después, en la app: Perfil → **Entrar o crear cuenta**. En un celular nuevo, en la pantalla de bienvenida tocá **"Ya uso Swole: entrar con mi cuenta"** y te trae todo.

## Cómo funciona la sincronización
- Todo se guarda primero en el dispositivo, así que la app anda igual sin internet. Cuando hay conexión, se sincroniza sola un par de segundos después de cada cambio, al volver a abrir la app y cada 2 minutos.
- Si usaste dos dispositivos sin internet, se unen los dos: cada entreno, rutina, peso, creatina o agua queda con su versión más reciente. Lo que borraste en uno también se borra en el otro.
- El entrenamiento en curso no se sincroniza: queda en el dispositivo donde lo empezaste.
- Cada persona solo puede ver sus propios datos (Row Level Security en la tabla `swole_data`).

## Cuando cambies algo
1. Editá `index.html`.
2. En `sw.js`, subí la versión (`swole-v9` → `swole-v10`). Si no la subís, los celulares siguen mostrando la versión vieja.
3. Subí los cambios (en 1 o 2 minutos GitHub Pages publica la versión nueva):
   ```bash
   git add -A && git commit -m "Cambios" && git push
   ```
