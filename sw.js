/* Service worker de Swole: hace que la app abra sin internet.
   Cuando cambies index.html, subí el número de VERSION para que los celulares bajen la nueva. */
const VERSION = 'swole-v40';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/logo.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // La página: primero la red (para tener siempre la última versión). Si no hay internet,
  // o la red tarda más de 3 segundos (señal mala en el gym), abre la copia guardada y la
  // versión nueva se guarda por detrás para la próxima vez.
  if (req.mode === 'navigate') {
    const net = fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); }
      return res;
    });
    e.waitUntil(net.catch(() => {}));
    e.respondWith(new Promise(resolve => {
      let done = false;
      const fallback = () => caches.match('./index.html').then(hit => {
        if (hit && !done) { done = true; resolve(hit); }
        return hit;
      });
      const t = setTimeout(fallback, 3000);
      net.then(res => { clearTimeout(t); if (!done) { done = true; resolve(res); } })
        .catch(() => { clearTimeout(t); fallback().then(hit => { if (!hit && !done) { done = true; resolve(Response.error()); } }); });
    }));
    return;
  }

  // Archivos propios y fuentes de Google: la copia guardada al instante y se actualiza por detrás.
  const sameOrigin = url.origin === self.location.origin;
  const fonts = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !fonts) return;

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
      for (const c of list) if ('focus' in c) return c.focus();
      return self.clients.openWindow('./');
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
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) if ('focus' in c) return c.focus();
    return self.clients.openWindow((e.notification.data && e.notification.data.url) || './');
  }));
});
