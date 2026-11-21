'use strict';
/* Generador de rutinas: días, tiempo, lesiones, objetivos, equipo. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const genPlan = g('genPlan'), exById = g('exById'), routineMinutes = g('routineMinutes'), INJ = g('INJ');
const base = { days: 3, goals: ['hip'], eq: 'gym', lvl: 'beg' };
const plan = d => genPlan(Object.assign({}, base, d));

function sano(p, etiqueta) {
  assert.ok(p.length > 0, `${etiqueta}: plan vacío`);
  for (const r of p) {
    assert.ok(r.items.length >= 3, `${etiqueta}: "${r.name}" tiene ${r.items.length} ejercicios`);
    for (const it of r.items) {
      assert.ok(exById(it.ex), `${etiqueta}: ejercicio inexistente ${it.ex}`);
      assert.ok(it.sets >= 1 && it.sets <= 6, `${etiqueta}: ${it.ex} con ${it.sets} series`);
      assert.ok(+String(it.reps).split('-')[0] > 0, `${etiqueta}: ${it.ex} sin repeticiones`);
    }
    assert.equal(new Set(r.items.map(i => i.ex)).size, r.items.length, `${etiqueta}: ejercicio repetido en "${r.name}"`);
  }
}

test('cantidad de días pedida', () => {
  for (const days of [2, 3, 4, 5]) {
    const p = plan({ days });
    assert.equal(p.length, days, `pedí ${days} días`);
    sano(p, `${days} días`);
  }
});

test('todas las combinaciones de objetivo, equipo y nivel dan un plan sano', () => {
  for (const goals of [['hip'], ['fuerza'], ['dep'], ['grasa'], ['salud'], ['hip', 'cali'], ['pl']])
    for (const eq of ['gym', 'dumb', 'bw'])
      for (const lvl of ['beg', 'int', 'adv'])
        sano(plan({ goals, eq, lvl }), `${goals}/${eq}/${lvl}`);
});

test('el tiempo pedido se respeta (hasta 5 min de más, hasta 15 de menos)', () => {
  for (const min of [30, 45, 60, 75, 90]) {
    for (const r of plan({ min })) {
      const m = routineMinutes(r);
      assert.ok(m <= min + 5, `${min} min pedidos y "${r.name}" dura ${m}`);
      assert.ok(m >= min - 15, `${min} min pedidos y "${r.name}" dura solo ${m}`);
    }
  }
});

test('con una lesión no aparece ningún ejercicio que cargue esa zona', () => {
  for (const k of Object.keys(INJ)) {
    for (const eq of ['gym', 'dumb', 'bw']) {
      const p = plan({ inj: [k], eq, days: 4 });
      for (const r of p) for (const it of r.items) {
        const ex = exById(it.ex);
        assert.ok(!INJ[k].ids.includes(it.ex), `lesión ${k}/${eq}: apareció ${it.ex}`);
        assert.ok(!(ex.p || []).some(m => INJ[k].m.includes(m)), `lesión ${k}/${eq}: ${it.ex} trabaja ${ex.p}`);
      }
      assert.ok(p.every(r => /Cuidando/.test(r.note)), `lesión ${k}: falta la nota "Cuidando"`);
    }
  }
});

test('fuerza descansa más que bajar grasa y hace menos repeticiones', () => {
  const f = plan({ goals: ['fuerza'] }), gr = plan({ goals: ['grasa'] });
  assert.ok(f[0].rest > gr[0].rest, `descanso fuerza ${f[0].rest} vs grasa ${gr[0].rest}`);
  const reps = p => p[0].items.filter(i => !exById(i.ex).time).map(i => +String(i.reps).split('-')[0]);
  assert.ok(Math.min(...reps(f)) < Math.min(...reps(gr)));
});

test('sin equipo: nada de barras con discos, máquinas, poleas ni mancuernas', () => {
  for (const lvl of ['beg', 'int', 'adv'])
    for (const r of plan({ eq: 'bw', lvl }))
      for (const it of r.items)
        assert.ok(!/^(Barra|Barra Z|Máquina|Polea|Mancuernas?)$/.test(exById(it.ex).eq), `${lvl}: ${it.ex} usa ${exById(it.ex).eq}`);
});

test('menores: nota de priorizar técnica', () => {
  const { g: g2 } = appConPerfil({ age: 15 });
  for (const r of g2('genPlan')(base)) assert.match(r.note, /técnica/);
});

test('mismo pedido, mismo plan', () => {
  const a = JSON.stringify(plan({ days: 4, min: 60 })), b = JSON.stringify(plan({ days: 4, min: 60 }));
  assert.equal(a, b);
});
