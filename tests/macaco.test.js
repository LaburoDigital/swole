'use strict';
/* SW-9: el macaco nuevo. Cada ejercicio migrado pasa el validador en todos los cuadros (cada 5 %, incluidos los intermedios):
   articulaciones en rango humano, huesos de largo fijo, manos y pies en su apoyo, el cable termina en la mano,
   nada atraviesa el piso ni el equipo, manos fuera de la cabeza y la figura dentro del dibujo. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const MK = g('MK'), MKD = g('MKD'), EX = g('EX'), TECH = g('TECH'), techOf = g('techOf'), techSVG = g('techSVG'), techCard = g('techCard');

/* Excepciones del validador, una por una y con su motivo. Hoy ninguna. Formato: 'id': 'por qué' */
const EXCEPCIONES = {};

test('fase A: están los 6 ejercicios testigo', () => {
  for (const id of ['bench', 'declpushup', 'curl', 'latpull', 'squat', 'pullup']) assert.ok(MKD[id], 'falta ' + id);
});

for (const id of Object.keys(MKD)) {
  test(`validador: ${id} sin problemas en ningún cuadro`, () => {
    const p = MK.check(MKD[id]);
    if (EXCEPCIONES[id]) return;
    assert.deepEqual(JSON.parse(JSON.stringify(p)), [], id + ': ' + p.join(' | '));
  });
}

test('validador: detecta una articulación fuera de rango y una mano que no llega', () => {
  const D = JSON.parse(JSON.stringify(MKD.curl));
  D.B.n.e = 175; /* codo pasado de 150° */
  assert.ok(MK.check(D).some(m => m.includes('codo')), 'no detectó el codo');
  const D2 = JSON.parse(JSON.stringify(MKD.latpull));
  D2.ik.Gn = { A: [57, -20], B: [57, -20] }; /* la barra fuera de alcance */
  assert.ok(MK.check(D2).some(m => m.includes('no llega')), 'no detectó la mano lejos de la barra');
  const D3 = JSON.parse(JSON.stringify(MKD.curl));
  D3.root.p = [66, 116]; /* el pie hundido en el piso */
  assert.ok(MK.check(D3).some(m => m.includes('piso') || m.includes('hunde')), 'no detectó el pie en el piso');
});

test('la animación interpola ángulos: los huesos no cambian de largo en ningún cuadro', () => {
  /* de costado: torso, muslo (con su escorzo) y pierna; de frente el validador mide cada tramo con su escorzo */
  for (const id of Object.keys(MKD)) { if (MKD[id].v === 'front') continue; for (let i = 0; i <= 20; i++) {
    const R = MK.frame(MKD[id], i / 20), P = R.P, d = (a, b) => Math.hypot(P[a][0] - P[b][0], P[a][1] - P[b][1]), th = 20 * Math.cos(R.g.n.lt * Math.PI / 180);
    assert.ok(Math.abs(d('P', 'N') - 30) < .01, id + ' torso');
    assert.ok(Math.abs(d('Hpn', 'Kn') - th) < .01 && Math.abs(d('Kn', 'An') - 19) < .01, id + ' pierna');
  } }
});

test('el cable de la polea termina exactamente en la mano en cada cuadro', () => {
  for (const id of Object.keys(MKD)) (MKD[id].eq || []).filter(e => e.t === 'pulley').forEach(e => {
    for (let i = 0; i <= 20; i++) { const R = MK.frame(MKD[id], i / 20); assert.ok(R.P[e.to], id + ': el cable no tiene mano'); }
    const s = MK.svg(MKD[id], { u: 1 }), R = MK.frame(MKD[id], 1), G = R.P[e.to];
    assert.ok(s.includes('x2="' + Math.round(G[0] * 10) / 10 + '" y2="' + Math.round(G[1] * 10) / 10 + '"'), id + ': el cable no termina en la mano');
  });
});

test('la app usa el macaco nuevo y la ficha dice el agarre', () => {
  for (const id of Object.keys(MKD)) {
    const ex = EX.find(e => e.id === id), k = techOf(ex);
    assert.equal(k, 'mk_' + id);
    const s = techSVG(k);
    assert.ok(s.includes('class="tq mk') && !/NaN|undefined/.test(s), id + ': figura');
    if (MKD[id].grip) assert.ok(techCard(ex).includes('tech-grip'), id + ': la ficha no dice el agarre');
  }
});

test('isométricos de brazos estirados (planches, banderas, levers, vertical, soportes): declaran el codo trabado en todo el recorrido', () => {
  const BRAZOS = /(brazos?|codos?)[^"]{0,15}(estirad|rect|bloquead|extendid)/i;
  const pide = EX.filter(e => e.time && MKD[e.id] && BRAZOS.test(JSON.stringify(TECH['mk_' + e.id] || '')));
  assert.ok(pide.length >= 20, 'se esperaban las planches, banderas, levers, verticales y soportes');
  for (const e of pide) assert.ok((MKD[e.id].lock || []).some(L => L.u === 'all' && L.j === 'e'), e.id + ': la técnica pide brazos estirados y no declara lock:[{u:"all",j:"e"}]');
  /* y el validador lo exige: una planche con los codos doblados no pasa */
  const D = JSON.parse(JSON.stringify(MKD.fullpl)); D.A.n.e = 60; D.B.n.e = 60;
  assert.ok(MK.check(D).some(p => p.includes('no está estirado')));
});

test('todo ejercicio que no es de segundos se mueve: A y B no son la misma pose', () => {
  for (const e of EX) { if (e.time || !MKD[e.id]) continue;
    const a = MK.frame(MKD[e.id], 0).P, b = MK.frame(MKD[e.id], 1).P;
    const mov = Math.max(...Object.keys(a).filter(k => Array.isArray(a[k]) && b[k]).map(k => Math.hypot(a[k][0] - b[k][0], a[k][1] - b[k][1])));
    assert.ok(mov >= 3, e.id + ': no se mueve (lo que más se desplaza recorre ' + mov.toFixed(1) + ')'); }
});

test('los saltos que se desplazan van solo de ida (no se rebobinan en el aire)', () => {
  for (const id of ['broadjump', 'boxjump']) { assert.ok(MKD[id].fwd, id + ' sin fwd'); const s = MK.svg(MKD[id]); assert.ok(s.includes('attributeName="opacity"'), id + ': sin fundido al volver'); }
  assert.ok(!MK.svg(MKD.skater).includes('attributeName="opacity"'), 'el patinador va y vuelve: es el ejercicio');
});

test('la barra fija de costado se ve de punta, nunca a lo largo', () => {
  for (const id of Object.keys(MKD)) if (MKD[id].v !== 'front') for (const e of MKD[id].eq || []) if (e.t === 'pullbar') assert.ok(!e.front && e.mount !== 'h', id + ': barra a lo largo en vista de costado');
  const D = JSON.parse(JSON.stringify(MKD.muscleup)); D.eq[0].mount = 'h';
  assert.ok(MK.check(D).some(p => p.includes('a lo largo')));
});

test('pose intermedia M: a mitad del movimiento la figura pasa por M (A → M → B)', () => {
  const conM = Object.keys(MKD).filter(id => MKD[id].M);
  assert.ok(conM.length > 0);
  for (const id of conM) {
    const D = MKD[id], g0 = MK.frame(D, 0).g, g5 = MK.frame(D, .5).g, g1 = MK.frame(D, 1).g;
    assert.ok(Math.abs(g0.t - D.A.t) < .01 && Math.abs(g5.t - D.M.t) < .01 && Math.abs(g1.t - D.B.t) < .01, id + ': el torso no pasa por A, M y B');
  }
});

test('migración completa: los 154 ejercicios usan el macaco nuevo', () => {
  const faltan = EX.filter(e => !MKD[e.id]).length;
  assert.equal(faltan, 0, 'faltan ' + EX.filter(e => !MKD[e.id]).map(e => e.id).join(', '));
  console.log('  macaco nuevo: ' + Object.keys(MKD).length + ' de ' + EX.length + ' ejercicios; faltan ' + faltan);
});
