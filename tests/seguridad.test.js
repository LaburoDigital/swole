'use strict';
/* SEG-A1: una copia preparada no puede meter HTML ni código en la app
   (código de amigo, IDs de objetivos, marcas, comidas y alimentos, fechas). */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');
const { nube, celu } = require('./nube.js');

const X = 'x"><img src=x onerror=alert(1)>';
const PERFIL = { sex: 'm', age: 25, height: 178, weight: 75, goal: 'recomp', nick: 'prueba', sports: [], week: {}, activity: 'auto' };

function app() {
  const a = cargarApp();
  const run = code => vm.runInContext(code, a.ctx);
  run('db.profile=' + JSON.stringify(PERFIL));
  return run;
}
function copiaMala(run) {
  const hoy = run('today()');
  return {
    logs: [{ id: 'l1', date: hoy, name: 'E', dur: 30, prs: [], entries: [{ ex: 'bench', sets: [{ kg: 60, reps: 8 }] }] }],
    goals: [{ id: X, ex: 'bench', L: 9, v0: 0, since: hoy }],
    tests: [{ id: X, date: hoy, ex: 'bench', kg: 70, reps: 5 }],
    meals: [{ id: X, date: hoy, m: 'alm', n: 'Pollo', g: 100, k: 150, p: 30, c: 0, f: 3, fid: X }],
    foods: [{ id: X, n: 'Barrita rara', k: 400, p: 10, c: 50, f: 15, u: [] }],
    weights: [{ date: X, kg: 80 }],
    settings: { social: { code: 'AB<img src=x onerror=alert(1)>', since: hoy } },
  };
}
const pantallas = run => [
  'VIEWS.inicio()', 'VIEWS.entrenar()', 'VIEWS.nutri()',
  '(S.ntab="res",VIEWS.niveles())', '(S.ntab="ej",VIEWS.niveles())', '(S.ntab="prog",VIEWS.niveles())',
  'modalBody({t:"food",d:{m:"alm",q:"Barrita",step:"list",date:today()}},true)',
  'modalBody({t:"mark",d:{step:"pick",direct:false,q:"",g:"",ex:null,kg:"",reps:"",date:today()}},true)',
].map(c => { try { return run(c); } catch (e) { return 'ERROR ' + e.message; } }).join('\n');

test('copia preparada: los IDs con HTML se limpian y ninguna pantalla lo dibuja', () => {
  const run = app();
  run('importData(' + JSON.stringify(copiaMala(run)) + ')');
  const html = pantallas(run);
  // (la palabra puede quedar como texto dentro del ID limpio; lo peligroso es la etiqueta o salirse del atributo)
  assert.ok(!/<img[^>]*onerror/i.test(html), 'quedó un <img onerror> en alguna pantalla');
  assert.ok(!html.includes('"><img'), 'un ID se salió de su atributo');
  assert.ok(!html.includes('ERROR'), html.split('\n').filter(l => l.startsWith('ERROR')).join(' | '));
  // los datos válidos siguen ahí, con el ID limpio
  const db = JSON.parse(run('JSON.stringify(db)'));
  assert.equal(db.goals.length, 1);
  assert.match(db.goals[0].id, /^[\w-]+$/);
  assert.equal(db.tests.length, 1);
  assert.match(db.tests[0].id, /^[\w-]+$/);
  assert.match(db.meals[0].id, /^[\w-]+$/);
  assert.match(db.meals[0].fid, /^[\w-]+$/);
  assert.match(db.foods[0].id, /^[\w-]+$/);
  // un peso con una fecha que no es fecha no entra
  assert.equal(db.weights.filter(w => !/^\d{4}-\d{2}-\d{2}$/.test(w.date)).length, 0);
});

test('copia preparada: el código de amigo nunca se importa', () => {
  const run = app();
  run('importData(' + JSON.stringify(copiaMala(run)) + ')');
  assert.equal(run('db.settings.social==null'), true);
});

test('código de amigo con HTML que llega por la nube o por datos viejos: se descarta', () => {
  const run = app();
  const o = run('JSON.stringify(normalize({logs:[],settings:{social:{code:"AB<img src=x onerror=alert(1)>"}}}).settings.social)');
  assert.equal(o, 'null');
  // los códigos que crea la app siguen siendo válidos
  assert.equal(run('normalize({logs:[],settings:{social:{code:"K7QZ3M",since:"2026-11-01"}}}).settings.social.code'), 'K7QZ3M');
});

test('Amigos escapa el código aunque llegue sucio a la memoria', () => {
  const c = celu(nube()); // con sesión iniciada
  c.run('db.settings.social={code:"AB<img src=x onerror=alert(1)>"};');
  const h = c.run('friendsHTML({t:"friends",tab:"fr",met:"ovr"})');
  assert.ok(!/<img[^>]*onerror/i.test(h), 'el código se dibujó como HTML');
});

test('IDs y fechas que la app escribe no cambian al limpiar', () => {
  const run = app();
  const d = {
    logs: [{ id: 'mhx1a2b3c', date: '2026-11-21', entries: [] }],
    tests: [{ id: 'mhx1a2b3d', date: '2026-11-20', ex: 'pullup', kg: 0, reps: 10 }],
    goals: [{ id: 'mhx1a2b3e', ex: 'bench', L: 9, since: '2026-11-01' }],
    meals: [{ id: 'mhx1a2b3f', date: '2026-11-21', m: 'alm', n: 'x', fid: 'b7790001234567' }],
    foods: [{ id: 'b7790001234567', n: 'x' }, { id: 'f_mi-barra', n: 'y' }],
    weights: [{ date: '2026-11-21', kg: 75 }],
  };
  const o = JSON.parse(run('JSON.stringify(normalize(' + JSON.stringify(d) + '))'));
  const pick = a => JSON.stringify(a.map(i => [i.id, i.date, i.ex, i.fid, i.since, i.m]));
  for (const k of Object.keys(d)) assert.equal(pick(o[k]), pick(d[k]), k + ' cambió');
});
