'use strict';
/* SW-7 (arreglos de QA): lesiones, niveles de las máquinas de aislamiento y buscador por palabras. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil({ sex: 'm', age: 25, weight: 80 });
const exById = g('exById'), injBad = g('injBad'), patsOf = g('patsOf'), levelVal = g('levelVal'), e1 = g('e1'), filterEx = g('filterEx'), allo = g('allo');

const bloquea = (id, z) => injBad(id, null, [z]) || [...patsOf(id)].some(pt => injBad(id, pt, [z]));

/* cada ejercicio nuevo carga la zona igual que su equivalente viejo: si el viejo queda afuera con esa lesión, el nuevo también */
const PARES = {
  hom: [['declbench', 'bench'], ['incdbpress', 'incbench'], ['chestpress', 'bench'], ['ohtri', 'skull'], ['kickback', 'skull']],
  mun: [['declpushup', 'pushup'], ['clappush', 'pushup'], ['burpee', 'pushup'], ['bearcrawl', 'pushup'], ['mtclimb', 'pushup'], ['abwheel', 'pushup'], ['goblet', 'frontsquat']],
  lum: [['goblet', 'squat'], ['hacksquat', 'squat'], ['smithsquat', 'squat'], ['uprightrow', 'ohp'], ['machpress', 'ohp']],
  cad: [['hacksquat', 'squat'], ['smithsquat', 'squat'], ['goblet', 'squat'], ['sissy', 'pistol']],
  tob: [['sissy', 'pistol'], ['stepup', 'lunge']],
  cue: [['uprightrow', 'ohp'], ['machpress', 'ohp']]
};
test('lesiones: los ejercicios nuevos quedan afuera igual que su equivalente', () => {
  for (const [z, pares] of Object.entries(PARES)) for (const [nuevo, viejo] of pares) {
    assert.ok(exById(nuevo) && exById(viejo), 'no existe ' + nuevo + ' o ' + viejo);
    assert.ok(bloquea(viejo, z), viejo + ' debería cargar ' + z);
    assert.ok(bloquea(nuevo, z), nuevo + ' carga ' + z + ' como ' + viejo + ', pero no está bloqueado');
  }
});

/* misma posición relativa → mismo rango: la marca de "intermedio" de StrengthLevel (1RM ÷ peso, hombre ~80 kg)
   da un rango de la zona Oro tanto en el básico como en la máquina de aislamiento */
const INTERMEDIO = { bench: 1.21, squat: 1.6, pecdeck: 1.07, hipabd: 1.16, hipadd: 1.25, legext: 1.25 };
test('niveles: con la misma marca relativa, una máquina de aislamiento no da más rango que el básico', () => {
  const L = {};
  for (const [id, r] of Object.entries(INTERMEDIO)) { L[id] = levelVal(exById(id), r * allo(80)); assert.ok(L[id] >= 4.5 && L[id] <= 8, id + ': ' + L[id].toFixed(1)); }
  for (const iso of ['pecdeck']) assert.ok(L[iso] <= L.bench + 1, iso + ' da más que la banca');
  for (const iso of ['hipabd', 'hipadd', 'legext']) assert.ok(L[iso] <= L.squat + 1, iso + ' da más que la sentadilla');
});
test('niveles: cargas comunes de intermedio no dan Campeón (casos de QA)', () => {
  const nivel = (id, kg, r) => { const ex = exById(id); return levelVal(ex, e1(ex, kg, r)); };
  assert.ok(nivel('pecdeck', 60, 10) < 12, 'pec deck 60×10');
  assert.ok(nivel('hipabd', 80, 12) < 12, 'abductores 80×12');
  assert.ok(nivel('hipadd', 80, 12) < 12, 'aductores 80×12');
  assert.ok(nivel('pecdeck', 60, 10) <= nivel('bench', 80, 5) + 2, 'pec deck 60×10 frente a banca 80×5');
});

test('buscador: todas las palabras, sin acentos, y primero lo que coincide con el nombre', () => {
  const ids = q => filterEx(q, 'Todos').map(e => e.id);
  assert.ok(ids('press banca').includes('bench'), 'press banca');
  assert.ok(ids('remo maquina').includes('machrow'), 'remo maquina');
  assert.ok(ids('extensión cuádriceps').includes('legext'), 'con acentos');
  assert.equal(ids('press banca zzz').length, 0, 'todas las palabras tienen que estar');
  const ab = filterEx('abdominales', 'Todos');
  assert.ok(ab.length && ab[0].id === 'crunch', 'abdominales: primero el crunch, no ' + (ab[0] && ab[0].id));
});
