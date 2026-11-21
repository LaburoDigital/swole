'use strict';
/* Carga los js/ de la app en un contexto de Node (vm), en el mismo orden que index.html,
   con un navegador de mentira: todo lo que la app toca del DOM existe y no hace nada.
   Devuelve una función `g(nombre)` que lee cualquier global de la app (incluidas las let/const). */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RAIZ = path.join(__dirname, '..');

/* Objeto "comodín": cualquier propiedad devuelve otro comodín, se puede llamar y construir. */
function comodin() {
  const f = function () { return comodin(); };
  return new Proxy(f, {
    get(t, k) {
      if (k === Symbol.toPrimitive) return () => '';
      if (k === Symbol.iterator) return function* () {};
      if (k === 'then') return undefined; // que no parezca una promesa
      if (k === 'length') return 0;
      if (!(k in t)) t[k] = comodin();
      return t[k];
    },
    set(t, k, v) { t[k] = v; return true; },
    apply() { return comodin(); },
    construct() { return comodin(); },
  });
}

function memoria() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    clear: () => m.clear(),
    key: i => [...m.keys()][i] ?? null,
    get length() { return m.size; },
  };
}

/* Orden de carga: el mismo de index.html (así una página nueva entra sola en las pruebas). */
function scriptsDeIndex() {
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  const out = [...html.matchAll(/<script[^>]+src="(js\/[^"?]+)/g)].map(m => m[1]);
  if (!out.length) throw new Error('index.html no tiene <script src="js/...">');
  return out;
}

function cargarApp() {
  const document = comodin();
  document.querySelector = () => comodin();
  document.querySelectorAll = () => [];
  document.getElementById = () => comodin();
  const sandbox = {
    console,
    document,
    navigator: { userAgent: 'node', language: 'es-AR', onLine: false, storage: undefined },
    location: { search: '', hash: '', pathname: '/', protocol: 'file:', href: 'file:///', origin: 'null', reload() {} },
    history: { replaceState() {}, pushState() {}, back() {} },
    localStorage: memoria(),
    sessionStorage: memoria(),
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    requestAnimationFrame: () => 0,
    cancelAnimationFrame() {},
    setTimeout: () => 0, clearTimeout() {},
    setInterval: () => 0, clearInterval() {},
    fetch: () => Promise.reject(new Error('sin red en las pruebas')),
    Image: function () { return comodin(); },
    URLSearchParams, URL, TextEncoder, TextDecoder, Intl, structuredClone, performance,
    queueMicrotask: () => {}, crypto: globalThis.crypto, atob, btoa,
    getComputedStyle: () => comodin(),
    addEventListener() {}, removeEventListener() {},
    innerWidth: 400, innerHeight: 800, devicePixelRatio: 2,
  };
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  sandbox.globalThis = sandbox;
  const ctx = vm.createContext(sandbox);

  for (const rel of scriptsDeIndex()) {
    const code = fs.readFileSync(path.join(RAIZ, rel), 'utf8');
    try {
      vm.runInContext(code, ctx, { filename: rel });
    } catch (e) {
      e.message = `Al cargar ${rel}: ${e.message}`;
      throw e;
    }
  }
  /* let/const de nivel superior no quedan en el objeto global: se leen evaluando su nombre */
  const g = nombre => vm.runInContext(nombre, ctx);
  return { g, ctx };
}

/* App cargada con un perfil puesto (por defecto: hombre de 25 años, 75 kg). */
function appConPerfil(perfil) {
  const app = cargarApp();
  const p = Object.assign({ sex: 'm', age: 25, height: 178, weight: 75, goal: 'recomp', nick: 'prueba', sports: [], week: {}, activity: 'auto' }, perfil || {});
  vm.runInContext('db.profile = ' + JSON.stringify(p), app.ctx);
  return app;
}

module.exports = { cargarApp, appConPerfil, RAIZ };
