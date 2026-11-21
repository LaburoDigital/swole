'use strict';
/* Sync: dos celus, sin red, borrados, reinstalación, reloj desfasado, otra cuenta, copias.
   Regla de oro: ningún caso puede borrar o pisar un entreno que no se borró a propósito. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { nube, celu, idsNube, DIA } = require('./nube.js');

test('dos celus: lo que se carga en uno aparece en el otro', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.entreno('a1');
  assert.equal(await A.sync(), 'ok');
  assert.equal(await B.sync(), 'ok');
  assert.deepEqual(B.ids(), ['a1']);
  B.entreno('b1');
  await B.sync(); await A.sync();
  assert.deepEqual(A.ids(), ['a1', 'b1']);
  assert.deepEqual(idsNube(n), ['a1', 'b1']);
});

test('dos celus: cambios en campos distintos del perfil no se pisan', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.perfil({ nick: 'juan', weight: 75 });
  await A.sync(); await B.sync();
  A.perfil({ nick: 'juancho' });
  B.perfil({ weight: 80 });
  await A.sync(); await B.sync(); await A.sync();
  for (const c of [A, B]) {
    assert.equal(c.db().profile.nick, 'juancho');
    assert.equal(c.db().profile.weight, 80);
  }
});

test('sin red: lo cargado offline se sube después y no pisa lo del otro celu', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.sinRed();
  A.entreno('off1'); A.entreno('off2');
  assert.equal(await A.sync(), 'off');
  B.entreno('b1'); await B.sync();
  A.conRed(); await A.sync(); await B.sync();
  assert.deepEqual(A.ids(), ['b1', 'off1', 'off2']);
  assert.deepEqual(B.ids(), ['b1', 'off1', 'off2']);
});

test('nube caída a mitad de camino: no se pierde nada y después sincroniza', async () => {
  const n = nube(), A = celu(n);
  A.entreno('x1');
  n.caida = true;
  assert.equal(await A.sync(), 'off');
  assert.deepEqual(A.ids(), ['x1']);
  n.caida = false;
  assert.equal(await A.sync(), 'ok');
  assert.deepEqual(idsNube(n), ['x1']);
});

test('borrado: lo borrado en un celu no revive desde el otro', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.entreno('k1'); A.entreno('k2');
  await A.sync(); await B.sync();
  A.borrar('k1'); await A.sync();
  await B.sync();
  assert.deepEqual(B.ids(), ['k2']);
  await A.sync();
  assert.deepEqual(A.ids(), ['k2']);
  assert.deepEqual(idsNube(n), ['k2']);
});

test('borrado: no se lleva puesto nada más', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.entreno('k1'); await A.sync(); await B.sync();
  B.entreno('b1');
  A.borrar('k1');
  await A.sync(); await B.sync(); await A.sync();
  assert.deepEqual(A.ids(), ['b1']);
  assert.deepEqual(B.ids(), ['b1']);
});

test('dos celus escribiendo a la vez: el que llegó tarde vuelve a unir y no pisa', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.entreno('a1'); await A.sync(); await B.sync();
  A.entreno('a2');
  B.entreno('b2');
  n.entreLeerYEscribir = () => B.sync(); // B escribe justo después de que A leyó
  await A.sync();
  await B.sync();
  assert.deepEqual(idsNube(n), ['a1', 'a2', 'b2']);
  assert.deepEqual(B.ids(), ['a1', 'a2', 'b2']);
});

test('reinstalación: celu nuevo sin datos recupera todo al entrar', async () => {
  const n = nube(), A = celu(n);
  A.perfil({ nick: 'juan' });
  A.entreno('h1'); A.entreno('h2'); A.entreno('h3');
  await A.sync();
  const R = celu(n, { uid: null });
  assert.deepEqual(R.ids(), []);
  await R.entrar();
  assert.deepEqual(R.ids(), ['h1', 'h2', 'h3']);
  assert.equal(R.db().profile.nick, 'juan');
  assert.deepEqual(idsNube(n), ['h1', 'h2', 'h3']);
});

test('reinstalación: hacer la bienvenida antes de entrar no pisa el perfil ni el calendario de la nube', async () => {
  const n = nube(), A = celu(n);
  A.perfil({ nick: 'juan', weight: 82 });
  A.run('db.plan={1:["r1"],3:["r2"]};save();');
  A.entreno('h1');
  await A.sync();
  const R = celu(n, { uid: null });
  R.perfil({ nick: '', weight: 70 }); // bienvenida completa en el celu nuevo
  R.run('db.plan={2:["rx"]};save();');
  R.entreno('nuevo');
  await R.entrar();
  assert.equal(R.db().profile.nick, 'juan');
  assert.equal(R.db().profile.weight, 82);
  assert.deepEqual(R.db().plan, { 1: ['r1'], 3: ['r2'] });
  assert.deepEqual(R.ids(), ['h1', 'nuevo']); // el entreno nuevo no se pierde
  await A.sync();
  assert.equal(A.db().profile.weight, 82);
});

test('reloj desfasado: un cambio hecho después de ver el otro celu gana, aunque su reloj esté atrasado', async () => {
  const n = nube(), A = celu(n, { reloj: 2 * 3600e3 }), B = celu(n); // A adelantado 2 h
  A.perfil({ nick: 'desde A' }); await A.sync();
  await B.sync();
  B.perfil({ nick: 'desde B' }); await B.sync();
  await A.sync();
  assert.equal(A.db().profile.nick, 'desde B');
  assert.equal(B.db().profile.nick, 'desde B');
});

test('reloj desfasado: borrar en un celu atrasado borra de verdad', async () => {
  const n = nube(), A = celu(n, { reloj: DIA }), B = celu(n); // A adelantado un día
  A.entreno('z1'); A.entreno('z2'); await A.sync();
  A.run('db.logs.find(l=>l.id==="z1").name="editado";save();'); await A.sync();
  await B.sync();
  B.borrar('z1'); await B.sync();
  await A.sync();
  assert.deepEqual(A.ids(), ['z2']);
  assert.deepEqual(idsNube(n), ['z2']);
});

test('reloj desfasado: un celu con la fecha muy adelantada no deja al otro sin poder cambiar nada', async () => {
  const n = nube(), A = celu(n, { reloj: 400 * DIA }), B = celu(n);
  A.perfil({ nick: 'futuro' }); A.entreno('f1'); await A.sync();
  await B.sync();
  B.perfil({ nick: 'presente' }); B.borrar('f1'); B.entreno('p1'); await B.sync();
  await A.sync();
  assert.equal(A.db().profile.nick, 'presente');
  assert.deepEqual(A.ids(), ['p1']);
});

test('otra cuenta en el mismo celu: los entrenos de una no se suben a la otra', async () => {
  const n = nube(), A = celu(n);
  A.entreno('de-u1'); await A.sync();
  A.run('Sync.logout()');
  await A.entrar('otro@b.c');
  assert.deepEqual(idsNube(n, 'u2'), []);
  assert.deepEqual(idsNube(n, 'u1'), ['de-u1']);
  assert.ok(!A.ids().includes('de-u1'), 'el celu muestra los datos de la cuenta nueva');
});

test('sin cuenta y después crea una: lo que tenía se sube', async () => {
  const n = nube(), A = celu(n, { uid: null });
  A.entreno('local1'); A.entreno('local2');
  await A.entrar();
  assert.deepEqual(idsNube(n), ['local1', 'local2']);
});

/* ---------- Copias (exportar / importar) ---------- */
const copia = c => c.run('JSON.stringify(exportJSON())');

test('copia: exportar e importar en un celu vacío devuelve todo', async () => {
  const n = nube(), A = celu(n, { uid: null });
  A.perfil({ nick: 'juan' });
  A.entreno('c1'); A.entreno('c2');
  A.run('db.weights.push({date:"2026-11-01",kg:75});db.meals.push({id:"m1",date:"2026-11-01",n:"Arroz",k:200});db.creatine["2026-11-01"]=1;db.water["2026-11-01"]=6;db.tests.push({id:"t1",date:"2026-11-01",entries:[]});save();');
  const txt = copia(A);
  const B = celu(n, { uid: null });
  const r = B.run('importData(' + txt + ')');
  assert.ok(r > 0);
  const d = B.db(), o = A.db();
  for (const k of ['logs', 'weights', 'meals', 'tests', 'creatine', 'water', 'profile', 'routines', 'plan'])
    assert.deepEqual(d[k], o[k], k);
});

test('copia: importar una copia vieja no borra lo que se cargó después', async () => {
  const n = nube(), A = celu(n);
  A.entreno('v1'); A.entreno('v2'); await A.sync();
  const vieja = copia(A);
  A.entreno('v3'); await A.sync();
  A.run('importData(' + vieja + ')');
  await A.sync();
  assert.deepEqual(A.ids(), ['v1', 'v2', 'v3']);
  assert.deepEqual(idsNube(n), ['v1', 'v2', 'v3']);
});

test('copia: restaurar trae de vuelta lo borrado y gana en los otros celus', async () => {
  const n = nube(), A = celu(n), B = celu(n);
  A.entreno('r1'); A.entreno('r2'); await A.sync(); await B.sync();
  const txt = copia(A);
  A.borrar('r1'); await A.sync(); await B.sync();
  assert.deepEqual(B.ids(), ['r2']);
  A.run('importData(' + txt + ')'); await A.sync(); await B.sync();
  assert.deepEqual(B.ids(), ['r1', 'r2']);
});

test('copia: después de "Borrar todos los datos" se restaura entera', async () => {
  const n = nube(), A = celu(n, { uid: null });
  A.perfil({ nick: 'juan' }); A.entreno('w1');
  const txt = copia(A);
  A.run('ACTIONS.wipeGo()');
  assert.deepEqual(A.ids(), []);
  A.run('importData(' + txt + ')');
  assert.deepEqual(A.ids(), ['w1']);
  assert.equal(A.db().profile.nick, 'juan');
});

test('copia: un archivo que no es de Swole no toca nada', async () => {
  const n = nube(), A = celu(n, { uid: null });
  A.entreno('s1');
  assert.throws(() => A.run('importData({hola:1})'));
  assert.throws(() => A.run('importData(null)'));
  assert.deepEqual(A.ids(), ['s1']);
});

test('copia: no lleva la sesión ni lo que es solo de este celu', async () => {
  const n = nube(), A = celu(n);
  A.run('db.settings.push={endpoint:"x"};db.active={entries:[]};save();');
  const o = JSON.parse(A.run('JSON.stringify(exportJSON())'));
  assert.equal(o.settings.push, undefined);
  assert.equal(o.active, undefined);
  assert.ok(!JSON.stringify(o).includes('tok-u1'));
  assert.equal(o.app, 'swole');
});
