'use strict';
/* SW-1, arreglos vuelta 1:
   - lo que se calcula de todo el historial (récords) queda en memoria pero se vacía cuando cambian los datos;
   - con el entreno abierto la pestaña de atrás no se rearma, y al cerrarlo o terminarlo queda al día;
   - una copia o una nube con entrenos/rutinas mal formados se repara y no rompe las pantallas;
   - editar y guardar una rutina conserva los datos internos de cada ejercicio (5/3/1, calentamiento, bloques). */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');
const { nube, celu } = require('./nube.js');

const PERFIL = { sex: 'm', age: 25, height: 178, weight: 75, goal: 'recomp', nick: 'prueba', sports: [], week: {}, activity: 'auto' };

/* app con perfil y con un DOM donde cada selector devuelve siempre el mismo elemento (se puede leer #view) */
function app() {
  const a = cargarApp({
    antes(s) {
      const orig = s.document.querySelector, cache = {};
      s.document.querySelector = sel => cache[sel] || (cache[sel] = orig(sel));
    },
  });
  const run = code => vm.runInContext(code, a.ctx);
  run('db.profile=' + JSON.stringify(PERFIL));
  return { g: a.g, run };
}
const log = (id, kg, reps, ex) => ({ id, date: '2026-11-10', name: 'E ' + id, dur: 40, prs: [], entries: [{ ex: ex || 'bench', sets: [{ kg, reps }] }] });

test('récords en memoria: una marca nueva los actualiza', () => {
  const { run } = app();
  run('db.logs.push(' + JSON.stringify(log('a', 60, 8)) + ');save();');
  const b1 = run('bestE1("bench")');
  assert.equal(b1.kg, 60);
  run('db.tests.push({id:"t1",date:"2026-11-12",ex:"bench",kg:100,reps:5});save();');
  assert.equal(run('bestE1("bench")').kg, 100);
});

test('récords en memoria: borrar un registro o editarlo los actualiza', () => {
  const { run } = app();
  run('db.logs.push(' + JSON.stringify(log('a', 60, 8)) + ',' + JSON.stringify(log('b', 80, 5)) + ');save();');
  assert.equal(run('bestE1("bench")').kg, 80);
  run('db.logs=db.logs.filter(l=>l.id!=="b");save();');
  assert.equal(run('bestE1("bench")').kg, 60);
  run('db.logs[0].entries[0].sets[0].kg=70;save();');
  assert.equal(run('bestE1("bench")').kg, 70);
  run('db.logs=[];save();');
  assert.equal(run('bestE1("bench")'), null);
});

test('récords en memoria: cambiar el peso corporal recalcula (la calistenia depende del peso)', () => {
  const { run } = app();
  run('db.logs.push(' + JSON.stringify(log('a', 20, 10, 'pullup')) + ');save();');
  const e75 = run('bestE1("pullup").e');
  run('db.profile.weight=100;save();');
  assert.notEqual(run('bestE1("pullup").e'), e75);
});

test('récords en memoria: devolver una copia (quien la cambie no toca la memoria)', () => {
  const { run } = app();
  run('db.logs.push(' + JSON.stringify(log('a', 60, 8)) + ');save();');
  run('bestE1("bench").kg=999;allSess().length=0;');
  assert.equal(run('bestE1("bench").kg'), 60);
  assert.equal(run('allSess().length'), 1);
});

test('"la última vez" en memoria: un entreno nuevo o editado la actualiza', () => {
  const { run } = app();
  run('db.logs.push(' + JSON.stringify(log('a', 60, 8)) + ');save();');
  assert.equal(run('lastSets("bench")[0].kg'), 60);
  assert.equal(run('lastSets("squat")'), null);
  run('db.logs.push(Object.assign(' + JSON.stringify(log('b', 70, 6)) + ',{date:"2026-11-15"}));save();');
  assert.equal(run('lastSets("bench")[0].kg'), 70);
  run('db.logs[1].entries[0].sets[0].kg=72;save();');
  assert.equal(run('lastSets("bench")[0].kg'), 72);
});

test('récords en memoria: un entreno que llega por la sync los actualiza', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  assert.equal(B.run('bestE1("bench")'), null); // B ya calculó (y guardó en memoria) que no hay récord
  A.entreno('a1');
  await A.sync(); await B.sync();
  assert.equal(B.run('bestE1("bench").kg'), 60);
});

test('con el entreno abierto no se rearma la pestaña de atrás, y al terminar queda al día', () => {
  const { run } = app();
  run('db.routines.push({id:"r1",name:"Pecho",days:[],items:[{ex:"bench",sets:2,reps:8}]});save();');
  run('S.tab="inicio";render();startSession("r1");');
  assert.equal(run('!!db.active&&S.sessOpen'), true);
  run('$("#view").innerHTML="VIEJA";render();');
  assert.equal(run('$("#view").innerHTML'), 'VIEJA', 'se rearmó Inicio detrás del entreno');
  assert.equal(run('S.viewDirty'), true);
  // minimizar el entreno: la pestaña de atrás se rearma
  run('ACTIONS.sessMin();');
  assert.notEqual(run('$("#view").innerHTML'), 'VIEJA');
  // volver a abrirlo y terminarlo: Inicio queda al día
  run('ACTIONS.sessOpen();$("#view").innerHTML="VIEJA";db.active.entries.forEach(en=>en.sets.forEach(s=>{s.kg=50;s.reps=8;s.done=true;}));save();render();');
  assert.equal(run('$("#view").innerHTML'), 'VIEJA');
  run('ACTIONS.sessFinishGo();');
  assert.equal(run('db.active'), null);
  assert.notEqual(run('$("#view").innerHTML'), 'VIEJA');
  assert.equal(run('S.viewDirty'), false);
});

test('copia con un entreno sin ejercicios: se repara y las pantallas siguen andando', () => {
  const { run } = app();
  const n = run('importData({"logs":[{"id":"zz1","date":"2026-11-19"}]})');
  assert.equal(n, 1);
  assert.deepEqual(run('JSON.stringify(db.logs.find(l=>l.id==="zz1").entries)'), '[]');
  for (const t of ['inicio', 'entrenar', 'niveles', 'nutri']) {
    assert.doesNotThrow(() => run('VIEWS.' + t + '()'), 'se rompe ' + t);
  }
  assert.doesNotThrow(() => run('avatarHTML();render();'));
});

test('copia con una rutina sin ejercicios y comidas con números rotos: se reparan', () => {
  const { run } = app();
  run('importData({"logs":[{"id":"l1","date":"2026-11-19","entries":[{"ex":"bench"}]}],"routines":[{"id":"rq","name":"x"}],"meals":[{"id":"m1","date":"2026-11-19","m":"al","n":"x","k":"abc"}]})');
  assert.equal(run('JSON.stringify(db.routines.find(r=>r.id==="rq").items)'), '[]');
  assert.equal(run('JSON.stringify(db.logs[0].entries[0].sets)'), '[]');
  assert.equal(run('db.meals[0].k'), 0);
  for (const t of ['inicio', 'entrenar', 'nutri']) assert.doesNotThrow(() => run('VIEWS.' + t + '()'), 'se rompe ' + t);
});

test('copia rota: lo que sí sirve no se pierde', () => {
  const { run } = app();
  run('importData({"logs":[' + JSON.stringify(log('ok', 90, 3)) + ',null,7,{"id":"zz","date":"2026-11-01","entries":"x"}]})');
  assert.equal(run('JSON.stringify(db.logs.map(l=>l.id).sort())'), '["ok","zz"]');
  assert.equal(run('bestE1("bench").kg'), 90);
});

test('importGo: si la copia es buena pero algo falla al dibujar, no dice "no parece un archivo"', () => {
  const { run } = app();
  run('globalThis.__t=[];const t0=toast;toast=m=>__t.push(m);');
  run('$("#impTxt").value=' + JSON.stringify(JSON.stringify({ logs: [log('x1', 60, 5)] })) + ';ACTIONS.importGo();');
  assert.match(run('__t.join("|")'), /Copia restaurada/);
  run('$("#impTxt").value="esto no es json";ACTIONS.importGo();');
  assert.match(run('__t.join("|")'), /no parece un archivo/);
});

test('entreno roto que llega desde la nube: el otro celu lo repara y sigue andando', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.run('db.logs.push({id:"roto",date:"2026-11-19"});save();');
  await A.sync(); await B.sync();
  assert.equal(B.run('JSON.stringify(db.logs.find(l=>l.id==="roto").entries)'), '[]');
  assert.doesNotThrow(() => B.run('VIEWS.inicio();VIEWS.entrenar();'));
});

test('editar y guardar una rutina conserva 5/3/1, calentamiento y bloques', () => {
  const { run } = app();
  const r = { id: 'r531', name: '5/3/1 · Banca', days: [], prog: '531', items: [
    { ex: 'bench', sets: 3, reps: 5, w531: 1, main: 1 },
    { ex: 'bench', sets: 5, reps: 10, bbb: 1, pct: 0.5 },
    { ex: 'pushup', sets: 2, reps: 10, warm: 2, prehab: 1, power: 1, skill: 'x', sec: 1 },
  ] };
  run('db.routines.push(' + JSON.stringify(r) + ');save();ACTIONS.editR("r531");S.modal.d.name="Banca nueva";ACTIONS.rSave();');
  const it = JSON.parse(run('JSON.stringify(db.routines.find(x=>x.id==="r531"))'));
  assert.equal(it.name, 'Banca nueva');
  assert.equal(it.items[0].w531, 1);
  assert.equal(it.items[0].main, 1);
  assert.equal(it.items[1].bbb, 1);
  assert.equal(it.items[1].pct, 0.5);
  assert.equal(it.items[2].warm, 2);
  for (const k of ['prehab', 'power', 'skill', 'sec']) assert.ok(k in it.items[2], 'perdió ' + k);
  // series y reps se siguen corrigiendo
  run('ACTIONS.editR("r531");S.modal.d.items[0].sets="99";S.modal.d.items[0].reps="0";ACTIONS.rSave();');
  const i0 = JSON.parse(run('JSON.stringify(db.routines.find(x=>x.id==="r531").items[0])'));
  assert.equal(i0.sets, 12);
  assert.equal(i0.reps, 10);
  assert.equal(i0.w531, 1);
});

test('entreno en vivo: "Más opciones" abre el menú del ejercicio con Cambiar, Superserie y Quitar', () => {
  const { run } = app();
  run('db.routines.push({id:"r2",name:"Dos",days:[],items:[{ex:"bench",sets:2,reps:8},{ex:"squat",sets:2,reps:8}]});save();startSession("r2");');
  const h = run('entryHTML(db.active.entries[0],0)');
  assert.match(h, /data-a="exMenu" data-e="0" aria-label="Más opciones"/);
  // los 3 íconos siguen en el HTML (se ven arriba de 400 px)
  for (const a of ['replEx', 'ssTog', 'delEntry']) assert.match(h, new RegExp('ex-x[^"]*" data-a="' + a + '"'));
  run('ACTIONS.exMenu("",{dataset:{e:"0"}});');
  assert.equal(run('S.m2&&S.m2.t'), 'exmenu');
  assert.equal(run('S.m2.d.e'), 0);
  const menu = run('modalBody(S.m2,true)');
  for (const a of ['replEx', 'ssTog', 'delEntry']) assert.match(menu, new RegExp('data-v="' + a + '"'), 'falta ' + a);
  // y desde el menú, Quitar funciona (pide deshacer, no confirma)
  run('ACTIONS.exMenuGo("delEntry",{dataset:{e:"0"}});');
  assert.equal(run('db.active.entries.length'), 1);
  assert.equal(run('db.active.entries[0].ex'), 'squat');
});
