'use strict';
/* Nube de mentira (imita lo que usa la sync de Supabase: login, leer/crear/actualizar swole_data con rev)
   y "celus": cada uno es la app cargada aparte, con su propio almacenamiento, red y reloj. */
const vm = require('vm');
const { cargarApp } = require('./cargar.js');

function nube() {
  const filas = new Map(); // user_id -> { data, rev }
  const usuarios = { 'a@b.c': 'u1', 'otro@b.c': 'u2' };
  const n = {
    filas,
    caida: false,
    /* se llama entre leer y escribir: sirve para meter otro celu en el medio */
    entreLeerYEscribir: null,
    datos: uid => (filas.has(uid) ? JSON.parse(JSON.stringify(filas.get(uid).data)) : null),
    async fetch(url, o) {
      o = o || {};
      if (n.caida) throw new TypeError('Failed to fetch');
      const u = new URL(url), m = o.method || 'GET', body = o.body ? JSON.parse(o.body) : null;
      const resp = (status, j) => ({ ok: status < 400, status, text: async () => (j == null ? '' : JSON.stringify(j)) });
      const quien = () => { const t = ((o.headers || {}).Authorization || '').replace('Bearer ', ''); return t.replace('tok-', ''); };
      if (u.pathname === '/auth/v1/token') {
        const id = usuarios[body.email];
        return id ? resp(200, { access_token: 'tok-' + id, refresh_token: 'ref-' + id, expires_in: 3600, user: { id, email: body.email } }) : resp(400, { error_code: 'invalid_credentials' });
      }
      if (u.pathname === '/rest/v1/swole_data') {
        const uid = quien(), f = filas.get(uid);
        if (m === 'GET') {
          const r = f ? [{ data: JSON.parse(JSON.stringify(f.data)), rev: f.rev }] : [];
          if (n.entreLeerYEscribir) { const h = n.entreLeerYEscribir; n.entreLeerYEscribir = null; await h(); }
          return resp(200, r);
        }
        if (m === 'POST') {
          if (f) return resp(409, { message: 'duplicate' });
          filas.set(uid, { data: body.data, rev: 1 });
          return resp(201, null);
        }
        if (m === 'PATCH') {
          const rev = +u.searchParams.get('rev').replace('eq.', '');
          if (!f || f.rev !== rev) return resp(200, []);
          f.data = body.data; f.rev++;
          return resp(200, [{ user_id: uid, rev: f.rev }]);
        }
      }
      return resp(200, []); // el resto (social, avisos…) no importa acá
    },
  };
  return n;
}

const DIA = 864e5;

/* opts.uid: con sesión iniciada (por defecto 'u1'); null = sin cuenta. opts.reloj: corrimiento en ms. */
function celu(n, opts) {
  opts = opts || {};
  const uid = opts.uid === undefined ? 'u1' : opts.uid;
  let sb, app;
  app = cargarApp({
    antes(s) {
      sb = s;
      s.__reloj = opts.reloj || 0;
      s.fetch = (url, o) => n.fetch(url, o).catch(e => { throw e instanceof TypeError ? new (app.g('TypeError'))(e.message) : e; });
      if (uid) s.localStorage.setItem('swole.auth', JSON.stringify({ access_token: 'tok-' + uid, refresh_token: 'ref-' + uid, expires_at: 4e9, user: { id: uid, email: 'a@b.c' } }));
    },
  });
  sb.navigator.onLine = true; // arrancó "sin red" para que la sync del arranque no corra sola
  const run = code => vm.runInContext(code, app.ctx);
  const c = {
    run,
    g: app.g,
    async sync() { await run('Sync.run(false)'); return run('Sync.state.s'); },
    db: () => JSON.parse(run('JSON.stringify(db)')),
    sinRed() { sb.navigator.onLine = false; },
    conRed() { sb.navigator.onLine = true; },
    reloj(ms) { sb.__reloj = ms; },
    entreno(id, extra) {
      const l = Object.assign({ id, date: '2026-11-0' + (1 + (id.length % 9)), name: 'Entreno ' + id, dur: 40, prs: [], entries: [{ ex: 'bench', sets: [{ kg: 60, reps: 8 }] }] }, extra || {});
      run('db.logs.push(' + JSON.stringify(l) + ');save();');
    },
    borrar(id) { run('db.logs=db.logs.filter(l=>l.id!==' + JSON.stringify(id) + ');save();'); },
    ids: () => c.db().logs.map(l => l.id).sort(),
    perfil(campos) { run('db.profile=Object.assign({sex:"m",age:25,height:178,weight:75,goal:"recomp",nick:"",sports:[],week:{}},db.profile||{},' + JSON.stringify(campos) + ');save();'); },
    async entrar(email) {
      run('S.m2={t:"login",d:{email:' + JSON.stringify(email || 'a@b.c') + ',pw:"123456",mode:"in",busy:false}}');
      await run('Sync.loginGo()');
    },
  };
  return c;
}

const idsNube = (n, uid) => ((n.datos(uid || 'u1') || {}).logs || []).map(l => l.id).sort();

module.exports = { nube, celu, idsNube, DIA };
