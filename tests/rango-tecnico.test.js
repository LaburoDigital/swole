'use strict';
/* SW-10: rango técnico. El validador de SW-9 controla que el movimiento sea posible para un humano;
   esto controla que sea la técnica que se entrena: dónde empieza y dónde termina la repetición de verdad.
   Los rangos se declaran por patrón, con su fuente, y se miden en todos los cuadros (cada 2,5 %) de la figura de costado.

   Medidas (en unidades del dibujo; el torso mide 30 y su superficie está a ~5 del eje):
   - pecho: cuánto queda la barra o la mano por delante del eje del torso (la barra toca el pecho en ~6-8; menos = se mete en el pecho)
   - codo:  cuánto queda el codo por delante (+) o por detrás (−) del eje del torso (−5 = a la altura de la espalda; más negativo = el brazo se va muy por detrás)
   - alto:  altura de la barra o la mano sobre la base del cuello, medida a lo largo del torso (0 = clavícula; −10 = mitad del pecho; +10 = orejas)
   - e:     flexión del codo en grados (0 = estirado), de costado
   - cadera: cuánto queda la cadera por debajo de la rodilla (+ = por debajo; 0 = muslo paralelo al piso) */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const MK = g('MK'), MKD = g('MKD'), EX = g('EX');

/* Cada patrón: ids, fuente y reglas.
   min/max: el valor no puede pasar ese límite en ningún cuadro.
   fondo: el punto más bajo de la repetición (el mínimo de esa medida) tiene que caer en [desde, hasta].
   llega: el máximo de esa medida tiene que caer en [desde, hasta] (llega al tope técnico y no lo pasa). */
const ROM = [
  { patron: 'press de banca plano con barra', ids: ['bench'],
    fuente: 'NSCA, Essentials of Strength Training and Conditioning (4.ª ed.), cap. 15: la barra baja hasta tocar el pecho a la altura de los pezones; codos a ~45–75° del torso',
    reglas: { pecho: { min: 6 }, codo: { min: -8 }, fondo: { alto: [-14, -7] } } },
  { patron: 'press inclinado con barra', ids: ['incbench'],
    fuente: 'NSCA (4.ª ed.), cap. 15: en el inclinado la barra toca la parte alta del pecho, entre las clavículas y los pezones',
    reglas: { pecho: { min: 6 }, codo: { min: -8 }, fondo: { alto: [-8, -2] } } },
  { patron: 'press declinado con barra', ids: ['declbench'],
    fuente: 'ExRx, Barbell Decline Bench Press: la barra baja a la parte baja del pecho',
    reglas: { pecho: { min: 6 }, codo: { min: -8 }, fondo: { alto: [-16, -9] } } },
  { patron: 'press con mancuernas (plano e inclinado)', ids: ['dbpress', 'incdbpress'],
    fuente: 'ExRx, Dumbbell Bench Press / Incline Dumbbell Press: las mancuernas bajan hasta los costados del pecho; el brazo, apenas por debajo de la línea del torso',
    reglas: { pecho: { min: 6 }, codo: { min: -8 } } },
  { patron: 'press de pecho en máquina', ids: ['chestpress'],
    fuente: 'ExRx, Lever Chest Press: las manijas vuelven hasta la altura del pecho, el brazo apenas detrás de la línea del torso',
    reglas: { codo: { min: -8 } } },
  { patron: 'press vertical con barra o máquina', ids: ['ohp', 'machpress'],
    fuente: 'NSCA (4.ª ed.), cap. 15, press de hombros: la barra baja hasta tocar las clavículas y la parte delantera de los hombros, no al pecho',
    reglas: { fondo: { alto: [-4, 4] } } },
  { patron: 'press de hombros con mancuernas', ids: ['dbohp'],
    fuente: 'ExRx, Dumbbell Shoulder Press: las mancuernas bajan hasta la altura de los hombros u orejas, con el brazo cerca de la horizontal',
    reglas: { fondo: { alto: [0, 13] } } },
  { patron: 'fondos (paralelas, anillas, banco)', ids: ['dips', 'ringdip', 'benchdip'],
    fuente: 'ExRx, Triceps Dip / Chest Dip: se baja hasta que el brazo queda paralelo al piso (codo ~90°), no más',
    reglas: { llega: { e: [85, 95] } } },
  { patron: 'sentadilla al paralelo (barra, frontal, goblet, Smith, hack)', ids: ['squat', 'frontsquat', 'goblet', 'smithsquat', 'hacksquat'],
    fuente: 'NSCA (4.ª ed.), cap. 15, sentadilla: se baja hasta que los muslos quedan paralelos al piso (cadera a la altura de la rodilla)',
    reglas: { llega: { cadera: [-4, 5] } } },
  { patron: 'sentadilla sin peso, rompiendo el paralelo', ids: ['airsquat'],
    fuente: 'ExRx, Bodyweight Squat / técnica estándar: la cadera baja apenas por debajo de la rodilla',
    reglas: { llega: { cadera: [1.5, 5] } } },
  { patron: 'sentadilla pistol completa', ids: ['pistol'],
    fuente: 'técnica estándar de calistenia (Overcoming Gravity, S. Low): sentadilla completa a una pierna, la cadera bien por debajo de la rodilla',
    reglas: { llega: { cadera: [3, 12] } } }
];

/* Ejercicios del mismo tipo que quedan afuera a propósito, con su motivo */
const EXCEPCIONES = {
  russiandip: 'fondo ruso: baja hasta apoyar los antebrazos en las paralelas; pasar los 90° de codo es el ejercicio',
  impdip: 'fondo imposible: arranca con los antebrazos apoyados y empuja hasta estirar; el rango lo marca el apoyo',
  skull: 'press francés: es una extensión de codo, no un press de pecho ni de hombros',
  legpress: 'prensa de piernas: es de piernas (su rango va con las sentadillas)',
  presscalf: 'gemelos en prensa: es de tobillo',
  smithsquat: 'sentadilla en Smith: es de piernas',
  pallof: 'press Pallof: es antirrotación; los brazos van y vuelven al pecho de frente'
};

function medir(D) {
  const m = { pecho: [1e9, -1e9], codo: [1e9, -1e9], alto: [1e9, -1e9], e: [1e9, -1e9], cadera: [1e9, -1e9] }, mm = (k, v) => { m[k][0] = Math.min(m[k][0], v); m[k][1] = Math.max(m[k][1], v); };
  for (let i = 0; i <= 40; i++) {
    const R = MK.frame(D, i / 40); if (R.v === 'front') continue;
    const P = R.P, fw = MK.V(R.phi.t - 90, R.d), up = MK.V(R.phi.t, R.d), N = P.N, G = P.Gn || P.Wn, E = P.En;
    const f = (X, v) => (X[0] - N[0]) * v[0] + (X[1] - N[1]) * v[1];
    mm('pecho', f(G, fw)); mm('codo', f(E, fw)); mm('alto', f(G, up)); mm('e', MK.angles(R).n.e); mm('cadera', P.Hpn[1] - P.Kn[1]);
  }
  return m;
}

function problemas(D, reglas) {
  const m = medir(D), out = [];
  for (const k of Object.keys(reglas)) {
    if (k === 'llega') { for (const [mk, [a, b]] of Object.entries(reglas.llega)) { const v = m[mk][1]; if (v < a - .5 || v > b + .5) out.push(`${mk} llega a ${v.toFixed(1)}; tiene que llegar a entre ${a} y ${b}`); } continue; }
    if (k === 'fondo') { for (const [mk, [a, b]] of Object.entries(reglas.fondo)) { const v = m[mk][0]; if (v < a - .5 || v > b + .5) out.push(`el punto más bajo (${mk} ${v.toFixed(1)}) tiene que caer entre ${a} y ${b}`); } continue; }
    const r = reglas[k];
    if (r.min != null && m[k][0] < r.min - .5) out.push(`${k} llega a ${m[k][0].toFixed(1)} (mínimo técnico ${r.min})`);
    if (r.max != null && m[k][1] > r.max + .5) out.push(`${k} llega a ${m[k][1].toFixed(1)} (máximo técnico ${r.max})`);
  }
  return out;
}

test('rango técnico: cada patrón tiene fuente y sus ejercicios existen', () => {
  for (const p of ROM) { assert.ok(p.fuente && p.fuente.length > 20, p.patron + ' sin fuente'); for (const id of p.ids) assert.ok(MKD[id], p.patron + ': no existe ' + id); }
});

test('rango técnico: ningún cuadro sale del rango que se entrena', () => {
  for (const p of ROM) for (const id of p.ids) {
    const pr = problemas(MKD[id], p.reglas);
    assert.equal(pr.length, 0, id + ' (' + p.patron + '): ' + pr.join('; '));
  }
});

test('rango técnico: todos los press y fondos están en un patrón o en las excepciones', () => {
  const cubiertos = new Set(ROM.flatMap(p => p.ids));
  const tipo = EX.filter(e => MKD[e.id] && /press|fondo|dip/i.test(e.id + ' ' + e.n));
  for (const e of tipo) assert.ok(cubiertos.has(e.id) || EXCEPCIONES[e.id], e.id + ' (' + e.n + '): falta declarar su rango técnico o su excepción');
});

test('rango técnico: detecta un press que baja de más', () => {
  /* el press inclinado como estaba antes de SW-10: la barra bajaba casi hasta la panza */
  const D = JSON.parse(JSON.stringify(MKD.incbench)); D.ik.Gn.B = [50, 68]; D.B.n.ab = 40; delete D.B.n.w;
  const p = ROM.find(r => r.ids.includes('incbench'));
  assert.ok(problemas(D, p.reglas).length > 0);
});

/* SW-10, parte 2: el dibujo hace lo que dice la ficha */
test('ficha = dibujo: dragon pistol, la pierna libre cruza por detrás de la de apoyo hacia el otro lado', () => {
  const D = MKD.dragon, B = MK.frame(D, 1).P;
  assert.equal(D.v, 'front', 'de costado no se ve el cruce');
  assert.ok(B.AL[0] > B.AR[0] + 8, 'el pie libre (izquierdo) tiene que terminar del otro lado del pie de apoyo');
  assert.ok(B.P[1] - MK.frame(D, 0).P.P[1] > 10, 'tiene que bajar (pistol)');
  /* "por detrás": la pierna libre se dibuja en la capa lejana, detrás de la de apoyo */
  const s = MK.svg(D, { stat: 1 }), iFar = s.indexOf('mk-far'), iNear = s.indexOf('mk-near');
  assert.ok(iFar >= 0 && iFar < iNear);
});

test('ficha = dibujo: pistol a un cajón, cajón detrás, se sienta y la otra pierna va estirada adelante', () => {
  const D = MKD.boxpistol, B = MK.frame(D, 1), P = B.P, box = D.eq.find(e => e.t === 'block').r;
  assert.ok(box[0] < P.P[0] && P.P[0] < box[0] + box[2], 'la cadera queda arriba del cajón');
  assert.ok(Math.abs(P.P[1] + 5 - box[1]) < 2, 'se sienta en el cajón (la cadera apoya arriba)');
  assert.ok(box[0] + box[2] / 2 < P.An[0], 'el cajón está detrás del pie de apoyo');
  assert.ok(Math.abs(MK.angles(B).f.k) < 10 && P.Af[0] > P.An[0] + 15, 'la pierna libre va estirada adelante');
});
