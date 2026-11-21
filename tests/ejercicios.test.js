'use strict';
/* Todo ejercicio tiene técnica (figura + claves) y su detalle abre sin errores.
   (En v83, 27 ejercicios de calistenia no abrían su detalle por faltar claves de técnica.) */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const EX = g('EX'), TECH = g('TECH'), techOf = g('techOf'), techSVG = g('techSVG'), exDetail = g('exDetail'), MUSC = g('MUSC');

test('ids únicos y datos básicos completos', () => {
  assert.equal(new Set(EX.map(e => e.id)).size, EX.length, 'hay ids repetidos');
  for (const ex of EX) {
    assert.ok(ex.n && ex.n.trim(), `${ex.id}: sin nombre`);
    assert.ok(ex.d && ex.d.trim(), `${ex.id}: sin descripción`);
    assert.ok(ex.eq, `${ex.id}: sin equipo`);
    assert.ok(ex.p.length > 0, `${ex.id}: sin músculo principal`);
    for (const m of [...ex.p, ...ex.s]) assert.ok(MUSC[m], `${ex.id}: músculo desconocido "${m}"`);
  }
});

for (const ex of EX) {
  test(`${ex.id} (${ex.n}): técnica y detalle`, () => {
    const k = techOf(ex);
    assert.ok(TECH[k], `figura "${k}" no existe en TECH`);
    assert.ok(Array.isArray(TECH[k].cues) && TECH[k].cues.length > 0, `figura "${k}" sin claves de técnica`);
    assert.match(techSVG(k), /<svg/, 'la figura no dibuja');
    const h = exDetail(ex.id);
    assert.match(h, /Cómo se hace/, 'el detalle no muestra la técnica');
  });
}
