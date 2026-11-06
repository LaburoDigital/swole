# Swole: cómo publicarla

Esta carpeta es la app entera. Para que sea instalable, funcione sin internet y sincronice, tiene que estar en una web con **https**.

## 1. Dónde está publicada
**https://laburodigital.github.io/swole/**

La sirve GitHub Pages desde el repo https://github.com/LaburoDigital/swole (rama `main`).

## 2. Configurar Supabase (una sola vez, 3 minutos)
El proyecto se llama **swole**: https://supabase.com/dashboard/project/couuuvckplstgksanzgr

**a) Decirle a Supabase dónde vive la app**
Authentication → URL Configuration:
- **Site URL:** `https://laburodigital.github.io/swole/`
- **Redirect URLs:** agregá `https://laburodigital.github.io/swole/**`

**b) Que el email traiga el código de 6 números**
Authentication → Emails (Templates). Editá **"Magic Link"** y también **"Confirm signup"**, y pegá esto en el cuerpo de los dos:

```html
<h2>Tu código de Swole</h2>
<p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
<p>Ponelo en la app. Vence en 1 hora.</p>
<p>O tocá este link desde el navegador: <a href="{{ .ConfirmationURL }}">Entrar</a></p>
```

Hacen falta las dos plantillas: la primera vez que alguien entra, Supabase manda "Confirm signup"; las siguientes, "Magic Link".

**c) Si querés que otras personas la usen**
El email que trae Supabase de fábrica **solo manda a los emails de tu organización** (o sea, a vos) y como mucho unos pocos por hora. Para amigos, conectá un servicio de email gratis como Resend en Authentication → Emails → SMTP Settings.

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
2. En `sw.js`, subí la versión (`swole-v3` → `swole-v4`). Si no la subís, los celulares siguen mostrando la versión vieja.
3. Subí los cambios (en 1 o 2 minutos GitHub Pages publica la versión nueva):
   ```bash
   git add -A && git commit -m "Cambios" && git push
   ```
