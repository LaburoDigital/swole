/* Service worker de Swole: hace que la app abra sin internet.
   Con cada cambio subí el número V (y el ?v= de index.html): lo hace solo  node tools/version.js N  */
const V = 89;
const VERSION = 'swole-v' + V;
// Las fotos van en su propia caja, que NO se borra con cada versión (antes se bajaban de nuevo en cada actualización).
const IMG = 'swole-img-1';
const PICS = 'basquet cali ciclismo combate dep fuerza futbol grasa hip hockey natacion rugby running salud tenis voley'.split(' ').map(k => './img/' + k + '.jpg');
const APP = ['app.css'].concat('datos entreno progreso extras pantallas acciones tour sync'.split(' ').map(k => 'js/' + k + '.js')).map(f => './' + f + '?v=' + V);
const CORE = ['./', './index.html'].concat(APP, ['./data/comida-ia.json', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png?v=2', './icons/logo.svg']);

self.addEventListener('install', e => {
  e.waitUntil(Promise.all([
    // cache:'reload' = directo de la red, sin pasar por la caché del navegador (Pages guarda 10 min):
    // así una versión nueva nunca se arma con el index.html de la anterior
    caches.open(VERSION).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))),
    caches.open(IMG).then(c => c.addAll(PICS)).catch(() => {})
  ]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== IMG).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // La página: SIEMPRE la copia guardada de esta versión, al instante (antes esperaba hasta 3 s a la red:
  // con señal mala en el gym se veía la pantalla de carga). La versión nueva llega sola: cada vez que abrís,
  // el navegador revisa sw.js; si cambió, el SW nuevo guarda TODO lo suyo (index + archivos ?v=N), toma el control
  // y la app se recarga (controllerchange en js/sync.js). Como cada SW sirve solo su propia caja, nunca se mezclan
  // archivos de dos versiones. Sin copia guardada (primera vez), va a la red.
  if (url.pathname.includes('/info/')) return; // la página de presentación no pasa por la caché de la app
  if (req.mode === 'navigate') {
    e.respondWith(caches.open(VERSION).then(c => c.match('./index.html')).then(hit => hit || fetch(req)).catch(() => Response.error()));
    return;
  }

  // Fotos: de la caja de fotos al instante; si falta, se baja y se guarda.
  if (url.origin === self.location.origin && url.pathname.includes('/img/')) {
    e.respondWith(caches.open(IMG).then(c => c.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }))));
    return;
  }

  // Archivos propios y fuentes de Google: la copia guardada al instante y se actualiza por detrás.
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

  // Archivos con ?v=N (css, js, íconos): no cambian dentro de una versión, así que salen de la caja sin volver
  // a pedirlos (antes se bajaban los ~260 KB en cada apertura). Si faltan, se bajan una vez y se guardan.
  if (sameOrigin && url.searchParams.has('v')) {
    e.respondWith(caches.open(VERSION).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }))));
    return;
  }

  e.respondWith(
    caches.open(VERSION).then(cache =>
      cache.match(req).then(hit => {
        const net = fetch(req)
          .then(res => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});

// Tocar la notificación abre (o enfoca) la app.
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const url = (e.notification.data && e.notification.data.url) || './';
    for (const c of list) if ('focus' in c) { const m = /[?&]go=([a-z]+)/.exec(url); if (m) c.postMessage({ go: m[1] }); return c.focus(); }
      return self.clients.openWindow(url);
    })
  );
});

// Recordatorios: muestra la notificación que manda el servidor y abre la app al tocarla.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Swole', {
    body: d.body || '', tag: d.tag || 'swole', icon: './icons/icon-192.png', badge: './icons/icon-192.png', data: { url: d.url || './' }
  }));
});

