'use strict';
/* SW-2: los Medios de la revisión general. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { cargarApp, RAIZ } = require('./cargar.js');

const PERFIL = { sex: 'm', age: 25, height: 178, weight: 75, goal: 'recomp', nick: 'prueba', sports: [], week: {}, activity: 'auto' };
function app(conPerfil) {
  const a = cargarApp();
  const run = code => vm.runInContext(code, a.ctx);
  if (conPerfil !== false) run('db.profile=' + JSON.stringify(PERFIL));
  return run;
}
const el = (e, s) => '{dataset:{e:"' + e + '",s:"' + s + '"}}';

/* ---------- 1. Escudo con nivel decimal ---------- */
test('escudo: un nivel con decimales (calistenia) muestra su número romano, nunca "undefined"', () => {
  const run = app();
  for (const L of [0.2, 2.2, 5.7, 13.2, 15.7, 17.8]) {
    const h = run('badge(' + L + ',44)');
    assert.ok(!h.includes('undefined'), 'badge(' + L + ')');
    const sinId = s => s.replace(/b[ms]x\d+/g, 'id');
    assert.equal(sinId(h), sinId(run('badge(' + Math.floor(L) + ',44)')));
  }
  // la tarjeta de Inicio y el detalle de un nodo del árbol
  run('db.settings.skillGoal="muscleup";');
  assert.ok(!run('skillGoalCard()').includes('undefined'));
  const ids = JSON.parse(run('JSON.stringify(branches().flatMap(b=>b.nodes.map(n=>n.id)))'));
  for (const id of ids) assert.ok(!run('nodeDetail(' + JSON.stringify(id) + ')').includes('undefined'), id);
});

/* ---------- 2. Bienvenida: volver atrás y corregir ---------- */
function bienvenida(run, d) {
  run('S.modal={t:"onb",step:ONB_SLIDES.length,d:' + JSON.stringify(Object.assign({ sex: 'm', goal: 'recomp', sports: [], nick: '' }, d)) + '}');
}
test('bienvenida: corregir edad, peso y apodo después de crear el perfil se guarda', () => {
  const run = app(false);
  bienvenida(run, { nick: 'Juan', age: 16, height: 175, weight: 70, goals: ['fuerza'] });
  for (let k = 0; k < 4; k++) run('ACTIONS.onbNext()');       // q0..q3: crea el perfil
  assert.equal(run('db.profile.weight'), 70);
  run('ACTIONS.onbBack();ACTIONS.onbBack();');                // vuelve a "altura y peso"
  run('S.modal.d.weight=90;S.modal.d.age=12;S.modal.d.nick="Juancho";S.modal.d.sex="f";');
  run('ACTIONS.onbNext();ACTIONS.onbNext();');                 // q2 → q3 → sigue
  assert.equal(run('db.profile.weight'), 90);
  assert.equal(run('db.profile.age'), 12);
  assert.equal(run('db.profile.nick'), 'Juancho');
  assert.equal(run('db.profile.sex'), 'f');
  assert.equal(run('db.weights.slice().sort((a,b)=>a.date<b.date?-1:1).pop().kg'), 90);
});
test('bienvenida: si el perfil vino de la nube (entraste a mitad de camino), no se pisa', () => {
  const run = app(false);
  bienvenida(run, { nick: 'x', age: 30, height: 170, weight: 60, goals: ['fuerza'] });
  for (let k = 0; k < 3; k++) run('ACTIONS.onbNext()');
  run('db.profile=' + JSON.stringify(Object.assign({}, PERFIL, { nick: 'nube', weight: 82, sex: 'f' })));
  run('ACTIONS.onbNext()');                                    // q3 con perfil que no creó la bienvenida
  assert.equal(run('db.profile.nick'), 'nube');
  assert.equal(run('db.profile.weight'), 82);
  assert.equal(run('db.profile.sex'), 'f');
});

/* ---------- 3. Calentamiento ---------- */
test('entreno: el peso de un calentamiento no pasa a las series de trabajo y el descanso es corto', () => {
  const run = app();
  run('db.routines.push({id:"r",name:"R",days:[],items:[{ex:"squat",sets:2,reps:5}]});save();startSession("r");S.sessOpen=true;');
  run('const en=db.active.entries[0];en.sets.unshift({kg:40,reps:10,w:1,done:false});en.sets.forEach((s,k)=>{if(k)s.kg="";});');
  run('ACTIONS.setDone("",' + el(0, 0) + ')');
  assert.equal(run('JSON.stringify(db.active.entries[0].sets.slice(1).map(s=>s.kg))'), '["",""]');
  assert.ok(run('S.rest.total') <= 45, 'descanso tras calentamiento: ' + run('S.rest.total'));
  // una serie de trabajo sí copia su peso y usa el descanso normal
  run('db.active.entries[0].sets[1].kg=100;ACTIONS.setDone("",' + el(0, 1) + ')');
  assert.equal(run('db.active.entries[0].sets[2].kg'), 100);
  assert.equal(run('S.rest.total'), run('restFor(exById("squat"))'));
});

/* ---------- 6. Corte de "Más opciones" ---------- */
test('entreno: "Más opciones" reemplaza los 3 íconos hasta 440 px (Pixel, Galaxy S, iPhone Plus/Pro Max)', () => {
  const css = fs.readFileSync(path.join(RAIZ, 'app.css'), 'utf8');
  assert.match(css, /@media \(max-width:440px\)\{\.entry>\.row \.ex-x\{display:none\}\}/);
  assert.match(css, /@media \(min-width:441px\)\{\.entry>\.row \.ex-more\{display:none\}\}/);
  assert.ok(!/max-width:400px\)\{\.entry/.test(css));
});

/* ---------- 8 y 9. Service worker ---------- */
function swDePrueba(opts) {
  opts = opts || {};
  const BASE = 'https://x.test/swole/';
  const abs = u => new URL(typeof u === 'string' ? u : u.url, BASE).href;
  const store = new Map(); // nombre de caja → Map(url → respuesta)
  const pedidos = [];
  const resp = (u, ok) => ({ ok: ok !== false, type: 'basic', url: u, clone() { return this; }, body: 'red:' + u });
  const caja = name => {
    if (!store.has(name)) store.set(name, new Map());
    const m = store.get(name);
    return {
      match: async (r, o) => { const u = abs(r); if (m.has(u)) return m.get(u); if (o && o.ignoreSearch) { const k = [...m.keys()].find(x => x.split('?')[0] === u.split('?')[0]); return k ? m.get(k) : undefined; } return undefined; },
      put: async (r, res) => { m.set(abs(r), res); },
      addAll: async list => { for (const r of list) { const res = await sandbox.fetch(r); m.set(abs(r), res); } },
    };
  };
  const L = {};
  const sandbox = {
    console, URL, Promise,
    Request: class { constructor(u, o) { this.url = abs(u); this.cache = o && o.cache; this.method = 'GET'; } },
    Response: { error: () => ({ ok: false, type: 'error' }) },
    fetch: r => { const u = abs(r); pedidos.push({ url: u, cache: r && r.cache }); return opts.redColgada ? new Promise(() => {}) : Promise.resolve(resp(u)); },
    caches: {
      open: async n => caja(n),
      keys: async () => [...store.keys()],
      delete: async n => store.delete(n),
      match: async r => { for (const n of store.keys()) { const h = await caja(n).match(r); if (h) return h; } },
    },
    setTimeout, clearTimeout,
  };
  sandbox.self = { location: new URL(BASE + 'sw.js'), addEventListener: (t, f) => { L[t] = f; }, skipWaiting: async () => {}, clients: { claim: async () => {} }, registration: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8'), sandbox);
  const V = vm.runInContext('VERSION', sandbox);
  const evento = (url, mode) => { const e = { request: { method: 'GET', url: abs(url), mode: mode || 'no-cors' }, p: null, respondWith(p) { this.p = p; }, waitUntil() {} }; L.fetch(e); return e; };
  return { L, store, pedidos, V, evento, caja, BASE, abs };
}
test('sw: al instalar, todo se baja directo de la red (sin la caché de 10 min de Pages)', async () => {
  const sw = swDePrueba();
  let p; sw.L.install({ waitUntil(x) { p = x; } }); await p;
  const core = sw.pedidos.filter(r => !r.url.includes('/img/'));
  assert.ok(core.length >= 10);
  for (const r of core) assert.equal(r.cache, 'reload', r.url);
  assert.ok(sw.store.get(sw.V).has(sw.BASE + 'index.html'));
});
test('sw: la app abre desde la copia guardada al instante, aunque la red no conteste', async () => {
  const sw = swDePrueba({ redColgada: true });
  await sw.caja(sw.V).put('./index.html', { ok: true, body: 'copia' });
  const e = sw.evento(sw.BASE + '?amigo=ABC123', 'navigate');
  const r = await Promise.race([e.p, new Promise(ok => setTimeout(() => ok('TARDÓ'), 200))]);
  assert.equal(r.body, 'copia');
  assert.equal(sw.pedidos.length, 0, 'no tendría que esperar a la red');
});
test('sw: nunca abre el index de otra versión (no se mezclan archivos)', async () => {
  const sw = swDePrueba();
  await sw.caja('swole-v1').put('./index.html', { ok: true, body: 'vieja' });
  const r = await sw.evento(sw.BASE, 'navigate').p;
  assert.notEqual(r.body, 'vieja');
  assert.equal(sw.pedidos.length, 1); // sin copia propia: va a la red
});
test('sw: un archivo con ?v= sale de la caja sin volver a pedirlo; si falta, se baja una vez', async () => {
  const sw = swDePrueba();
  const u = sw.BASE + 'js/datos.js?v=' + sw.V.replace('swole-v', '');
  await sw.caja(sw.V).put(u, { ok: true, body: 'guardado' });
  assert.equal((await sw.evento(u).p).body, 'guardado');
  assert.equal(sw.pedidos.length, 0);
  const u2 = sw.BASE + 'icons/apple-touch-icon.png?v=99';
  await sw.evento(u2).p; await sw.evento(u2).p;
  assert.equal(sw.pedidos.filter(r => r.url === u2).length, 1);
});
test('sw: lo que no tiene ?v= (datos, manifiesto) sigue actualizándose por detrás', async () => {
  const sw = swDePrueba();
  const u = sw.BASE + 'data/comida-ia.json';
  await sw.caja(sw.V).put(u, { ok: true, body: 'guardado' });
  assert.equal((await sw.evento(u).p).body, 'guardado');
  assert.equal(sw.pedidos.filter(r => r.url === u).length, 1);
});

/* ---------- 10. Hoja del entreno por tarjeta = hoja entera ---------- */
test('entreno: actualizar solo las tarjetas tocadas da exactamente la misma hoja que rearmarla entera', () => {
  const run = app();
  run('db.logs.push({id:"old",date:"2026-11-01",name:"x",dur:30,prs:[],entries:[{ex:"bench",sets:[{kg:60,reps:8},{kg:60,reps:8}]}]});save();');
  run('db.routines.push({id:"r",name:"R",days:[],items:[{ex:"bench",sets:3,reps:8,warm:1},{ex:"squat",sets:3,reps:5},{ex:"pullup",sets:2,reps:8},{ex:"plank",sets:2,reps:30}]});save();startSession("r");S.sessOpen=true;');
  // hoja "modelo": cada tarjeta guarda el HTML con el que se dibujó; el resto de la hoja, el de la última vez que se rearmó entera
  run(`globalThis.__M={cards:[],outer:null,fin:false,full:0,patch:0};
    globalThis.__norm=h=>h.replace(/id="elapsed">[^<]*</,'id="elapsed"><');
    renderSess=function(){S._sessTr=sessTransient();const c=db.active.entries.map((en,i)=>entryHTML(en,i)),h=__norm(sessHTML()),j=c.join(''),k=h.indexOf(j);
      __M.cards=c;__M.outer=[h.slice(0,k),h.slice(k+j.length)];__M.fin=db.active.entries.some(en=>en.sets.some(s=>s.done));__M.full++;};
    sessPatch=function(idx){const p=sessPatchPlan(idx,__M.cards.length,__M.fin);if(!p){renderSess();return;}p.forEach(i=>{__M.cards[i]=entryHTML(db.active.entries[i],i);});__M.patch++;__chk();};
    /* se compara en el momento de dibujar (igual que hacía la hoja entera: con la serie recién tildada marcada) */
    globalThis.__bad=0;globalThis.__chk=()=>{if(__M.outer[0]+__M.cards.join('')+__M.outer[1]!==__norm(sessHTML()))__bad++;};
    globalThis.__undo=null;toast=(m,u)=>{if(u)__undo=u;};
    renderSess();`);
  const pasos = [
    ['tildar la primera serie (aparece Terminar: hoja entera)', 'ACTIONS.setDone("",' + el(0, 1) + ')'],
    ['+2.5 kg', 'ACTIONS.stepKg("2.5",' + el(1, 0) + ')'],
    ['−1 rep', 'ACTIONS.stepRep("-1",' + el(1, 0) + ')'],
    ['tildar en otro ejercicio (la pregunta de RIR se muda)', 'ACTIONS.setDone("",' + el(1, 0) + ')'],
    ['responder RIR', 'ACTIONS.rirSet("2",' + el(1, 0) + ')'],
    ['marcar calentamiento', 'ACTIONS.setW("",' + el(2, 0) + ')'],
    ['agregar serie', 'ACTIONS.addSet("",' + el(2, 0) + ')'],
    ['quitar serie', 'ACTIONS.delSet("",' + el(2, 0) + ')'],
    ['deshacer quitar serie', '__undo&&__undo()'],
    ['igual a la anterior', 'ACTIONS.setCopy("prev",' + el(1, 1) + ')'],
    ['destildar', 'ACTIONS.setDone("",' + el(1, 0) + ')'],
    ['superserie (hoja entera)', 'ACTIONS.ssTog("",' + el(1, 0) + ')'],
    ['tildar dentro de la superserie', 'ACTIONS.setDone("",' + el(1, 1) + ')'],
    ['tiempo: +5 s', 'ACTIONS.stepRep("5",' + el(3, 0) + ')'],
    ['destildar todo (desaparece Terminar: hoja entera)', 'db.active.entries.forEach((en,i)=>en.sets.forEach((s,j)=>{if(s.done)ACTIONS.setDone("",{dataset:{e:String(i),s:String(j)}});}))'],
  ];
  for (const [nombre, code] of pasos) {
    run(code);
    assert.equal(run('__bad'), 0, 'la hoja quedó distinta después de: ' + nombre);
  }
  assert.ok(run('__M.patch') >= 10, 'casi todo tendría que ir por tarjeta: ' + run('__M.patch'));
});
