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
2. En `sw.js`, subí la versión (`swole-v51` → `swole-v52`). Si no la subís, los celulares siguen mostrando la versión vieja.
3. Subí los cambios (en 1 o 2 minutos GitHub Pages publica la versión nueva):
   ```bash
   git add -A && git commit -m "Cambios" && git push
   ```

## Subir Swole a App Store / Play Store (cuando llegue el momento)

Swole es una web app (PWA). Para las tiendas se "envuelve" con **Capacitor**: es la misma app adentro de una app nativa.

1. En una compu (para iPhone hace falta una **Mac con Xcode** y la cuenta de Apple Developer, US$99 por año; Google Play cobra US$25 una vez):
   ```
   npm init -y
   npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android @capacitor-mlkit/barcode-scanning
   npx cap init Swole uy.swole.app --web-dir=www
   ```
2. Copiá `index.html`, `sw.js`, `manifest.webmanifest`, `icons/` e `img/` adentro de la carpeta `www/`.
3. `npx cap add ios` y `npx cap add android`, después `npx cap sync`.
4. En iOS agregá en `Info.plist` el permiso de cámara: `NSCameraUsageDescription` = "Para leer el código de barras de los alimentos y sacarle foto a tu plato."
5. **El escáner ya está preparado**: si la app corre adentro de Capacitor y existe el plugin `BarcodeScanner`, usa el escáner nativo de Google ML Kit (más rápido y anda en iPhone). Afuera de la tienda sigue usando la cámara del navegador (BarcodeDetector en Android, ZXing en iPhone).
6. Ojo: Apple pide que la app "se sienta nativa" (no una web metida en una caja). Swole ya tiene navegación propia, modo sin internet, notificaciones y cámara, que es lo que suelen mirar.

## Música (Spotify)

Desde 2026 Spotify solo deja manejar la música desde apps de terceros en "modo desarrollo": **hasta 5 cuentas con Premium**, agregadas a mano por el dueño. Para activarlo:

1. Entrá a developer.spotify.com con tu cuenta (Premium) → **Create app**.
2. Redirect URI: `https://laburodigital.github.io/swole/` · API: **Web API**.
3. En **User Management** agregá el mail de cada amigo que lo quiera usar (máximo 5 contando la tuya).
4. Copiá el **Client ID** (no es secreto) y pegalo en `index.html`, en `const SPOTIFY_CLIENT_ID=''`.

Sin eso, el entreno igual tiene el botón para abrir tu app de música (Spotify, YouTube Music o Apple Music).
