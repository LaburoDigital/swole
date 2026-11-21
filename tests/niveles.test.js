'use strict';
/* Niveles: percentiles → rango (Bronce I … Élite) para pesas y calistenia. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const EX = g('EX'), exById = g('exById'), levelVal = g('levelVal'), pctOf = g('pctOf'),
  pToL = g('pToL'), thr = g('thr'), lvlName = g('lvlName'), hasRank = g('hasRank');

test('nombres de rango', () => {
  assert.equal(lvlName(-1), 'Sin rango');
  assert.equal(lvlName(null), 'Sin rango');
  assert.equal(lvlName(0), 'Bronce I');
  assert.equal(lvlName(2.9), 'Bronce III');
  assert.equal(lvlName(3), 'Plata I');
  assert.equal(lvlName(17), 'Campeón III');
  assert.equal(lvlName(18), 'Élite');
});

test('percentil → nivel: puntos fijos y siempre subiendo', () => {
  assert.equal(pToL(2), 0);
  assert.equal(pToL(50), 6);
  assert.equal(pToL(99.5), 18);
  assert.equal(pToL(100), 18);
  let prev = -Infinity;
  for (let p = 0; p <= 100; p += 0.5) {
    const L = pToL(p);
    assert.ok(L >= prev, `pToL baja en p=${p}`);
    prev = L;
  }
});

test('banca 100 kg, hombre 75 kg 25 años: entre la mediana y el percentil 80', () => {
  const bench = exById('bench');
  const p = pctOf(bench, 100);
  assert.ok(p > 50 && p < 80, `percentil ${p}`);
  const L = levelVal(bench, 100);
  assert.ok(L > 6 && L < 12, `nivel ${L}`);
});

test('todo ejercicio con rango: más marca nunca baja el nivel, y queda entre -1 y 18', () => {
  const ranked = EX.filter(hasRank);
  assert.ok(ranked.length > 50, 'muy pocos ejercicios con rango');
  for (const ex of ranked) {
    const top = ex.sk ? (ex.time ? 900 : 200) : 400;
    let prev = -Infinity;
    for (let i = 0; i <= 80; i++) {
      const e = (top * i) / 80;
      const v = levelVal(ex, e);
      assert.ok(Number.isFinite(v), `${ex.id}: nivel no numérico con marca ${e}`);
      assert.ok(v >= -1 && v <= 18, `${ex.id}: nivel ${v} fuera de rango con marca ${e}`);
      assert.ok(v >= prev - 1e-9, `${ex.id}: el nivel baja de ${prev} a ${v} con marca ${e}`);
      prev = v;
    }
  }
});

test('pesas: la marca para cada nivel sube con el nivel y le corresponde ese nivel', () => {
  for (const ex of EX.filter(e => e.st && !e.sk)) {
    let prev = -Infinity;
    for (let L = 0; L <= 18; L++) {
      const e = thr(ex, L);
      assert.ok(e > prev, `${ex.id}: marca para nivel ${L} no sube`);
      prev = e;
      assert.ok(Math.abs(levelVal(ex, e) - L) < 0.05, `${ex.id}: con la marca del nivel ${L} da ${levelVal(ex, e)}`);
    }
  }
});

test('la misma marca vale más para una mujer, un adolescente o alguien de 60', () => {
  const base = levelVal(exById('bench'), 80);
  for (const perfil of [{ sex: 'f' }, { age: 15 }, { age: 60 }]) {
    const { g: g2 } = appConPerfil(perfil);
    const v = g2('levelVal')(g2("exById('bench')"), 80);
    assert.ok(v > base, `${JSON.stringify(perfil)}: ${v} no supera ${base}`);
  }
});
