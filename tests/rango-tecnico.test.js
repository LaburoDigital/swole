'use strict';
/* SW-10: rango técnico. El validador de SW-9 controla que el movimiento sea posible para un humano;
   esto controla que sea la técnica que se entrena: dónde empieza y dónde termina la repetición de verdad.
   Cada patrón del catálogo declara su fuente y su regla de INICIO (cuadro 0 %) y de FIN (cuadro 100 %); si hace falta,
   también reglas sobre todo el recorrido (cada 2,5 %). Las medidas están explicadas en tests/medir-rango.js. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');
const { medidas, manoQuieta } = require('./medir-rango.js');

const { g } = appConPerfil();
const MK = g('MK'), MKD = g('MKD'), EX = g('EX');

/* Cada patrón: ids, fuente, inicio y fin ({medida: [desde, hasta]}, null = sin tope de ese lado) y, si hace falta:
   recorrido: {medida: {min, max}} en todos los cuadros;
   mano: la mano no se mueve de su apoyo (barra, banco, piso) en todo el recorrido. */
const ROM = [
  { patron: 'press de banca plano con barra', ids: ['bench'],
    fuente: 'NSCA, Essentials of Strength Training and Conditioning (4.ª ed.), cap. 15: arranca con los codos estirados; la barra baja hasta tocar el pecho a la altura de los pezones; codos a ~45–75° del torso',
    inicio: { e: [0, 15] }, fin: { pecho: [6, 8], alto: [-14, -7] }, recorrido: { codo: { min: -8 } } },
  { patron: 'press inclinado con barra', ids: ['incbench'],
    fuente: 'NSCA (4.ª ed.), cap. 15: en el inclinado la barra toca la parte alta del pecho, entre las clavículas y los pezones',
    inicio: { e: [0, 15] }, fin: { pecho: [6, 8], alto: [-8, -2] }, recorrido: { codo: { min: -8 } } },
  { patron: 'press declinado con barra', ids: ['declbench'],
    fuente: 'ExRx, Barbell Decline Bench Press: la barra baja a la parte baja del pecho',
    inicio: { e: [0, 15] }, fin: { pecho: [6, 8], alto: [-16, -9] }, recorrido: { codo: { min: -8 } } },
  { patron: 'press con mancuernas (plano e inclinado)', ids: ['dbpress', 'incdbpress'],
    fuente: 'ExRx, Dumbbell Bench Press / Incline Dumbbell Press: las mancuernas bajan hasta los costados del pecho; el brazo, apenas por debajo de la línea del torso. La mano queda un poco más arriba que una barra por el ancho de la mancuerna (hasta 10,5)',
    inicio: { e: [0, 15] }, fin: { pecho: [6, 10.5] }, recorrido: { codo: { min: -8 } } },
  { patron: 'press de pecho en máquina', ids: ['chestpress'],
    fuente: 'ExRx, Lever Chest Press: las manijas vuelven hasta el costado del pecho y se empuja hasta estirar',
    inicio: { pecho: [6, 10.5] }, fin: { e: [0, 15] }, recorrido: { codo: { min: -8 } } },
  { patron: 'press vertical con barra o máquina', ids: ['ohp', 'machpress'],
    fuente: 'NSCA (4.ª ed.), cap. 15, press de hombros, y pedido de Juan (juan-2.md): abajo la barra delante de la cara entre la boca y la nariz (en el dibujo, alto 5–9), con el antebrazo vertical (≤15°) y el codo a 85–110°, no doblado como un curl; arriba los brazos estirados sobre la cabeza',
    inicio: { alto: [5, 9], ante: [0, 15], e: [85, 110] }, fin: { e: [0, 15], alto: [25, null] } },
  { patron: 'press de hombros con mancuernas', ids: ['dbohp'],
    fuente: 'ExRx, Dumbbell Shoulder Press, y juan-2.md: abajo las mancuernas al costado de la cabeza a la altura de las orejas (en el dibujo, alto 6–12), antebrazo vertical y codo a ~90–110°; arriba los brazos estirados',
    inicio: { alto: [6, 12], ante: [0, 15], e: [85, 110] }, fin: { e: [0, 15] } },
  { patron: 'fondos (paralelas, anillas, banco)', ids: ['dips', 'ringdip', 'benchdip'],
    fuente: 'ExRx, Triceps Dip / Chest Dip, y juan-2.md: las manos quietas en el apoyo y el antebrazo casi vertical (≤20°); arriba los brazos bloqueados; abajo el hombro a la altura del codo (±3) con el codo a 85–100°, ni más ni menos',
    inicio: { e: [0, 15] }, fin: { e: [85, 100], hc: [-3, 3] }, recorrido: { ante: { max: 20 } }, mano: true },
  { patron: 'fondo ruso', ids: ['russiandip'],
    fuente: 'técnica estándar de calistenia (Overcoming Gravity, S. Low): desde el apoyo con los brazos bloqueados, baja al fondo y rueda hacia atrás hasta apoyar los antebrazos en las barras, con las manos quietas',
    inicio: { e: [0, 15] }, fin: { ante: [70, 110] }, mano: true },
  { patron: 'fondo imposible', ids: ['impdip'],
    fuente: 'técnica estándar de calistenia: arranca con los antebrazos apoyados en las barras y empuja hasta los brazos bloqueados, con las manos quietas',
    inicio: { ante: [70, 110] }, fin: { e: [0, 15] }, mano: true },
  { patron: 'dominadas (prona, supina, en L, asistida), vistas de atrás', ids: ['pullup', 'chinup', 'lpullup', 'assistpull'],
    fuente: 'NSCA (4.ª ed.), cap. 15, y juan-2.md: arranca colgado con los brazos estirados (codo ≥165°) y sube hasta que el mentón pasa la barra; las manos no se mueven',
    inicio: { eMax: [0, 15] }, fin: { menton: [1, 15] }, mano: true },
  { patron: 'dominadas negativas', ids: ['negpull'],
    fuente: 'técnica estándar: arranca con el mentón sobre la barra y baja lento hasta colgar con los brazos estirados',
    inicio: { menton: [1, 15] }, fin: { eMax: [0, 15] }, mano: true },
  { patron: 'dominada arquero', ids: ['archerpull'],
    fuente: 'Overcoming Gravity (S. Low) y juan-2.md: agarre muy ancho; sube hacia una mano y el brazo de apoyo queda casi estirado sobre la barra (≥150°, flexión ≤30) todo el recorrido; arriba el mentón pasa la barra',
    inicio: { eMax: [0, 15] }, fin: { menton: [1, 15] }, recorrido: { eL: { max: 30 } }, mano: true },
  { patron: 'dominada a un brazo', ids: ['oapull'],
    fuente: 'Overcoming Gravity (S. Low): colgado de una mano con el brazo estirado, sube hasta pasar el mentón sobre la barra',
    inicio: { eR: [0, 15] }, fin: { menton: [1, 15] }, mano: true },
  { patron: 'jalón al pecho', ids: ['latpull'],
    fuente: 'NSCA (4.ª ed.), cap. 15, jalón: arranca con los brazos estirados arriba y baja la barra hasta la parte alta del pecho',
    inicio: { e: [0, 15] }, fin: { alto: [-8, 2] } },
  { patron: 'muscle-up', ids: ['muscleup'],
    fuente: 'Overcoming Gravity (S. Low) y juan-2.md: colgado con los brazos estirados → tirón hasta el pecho → transición sobre la barra → fondo hasta estirar; las manos no se mueven de la barra',
    inicio: { e: [0, 15], hombroBarra: [null, -20] }, fin: { e: [0, 15], hombroBarra: [20, null] }, mano: true },
  { patron: 'colgado de la barra (agarre, core y levers)', ids: ['deadhang', 'legraise', 'skincat', 'tuckfl', 'advfl', 'straddlefl', 'fullfl', 'onelegfl', 'tuckbl', 'advbl', 'straddlebl', 'fullbl'],
    fuente: 'Overcoming Gravity (S. Low): en los colgados y los levers los brazos van bloqueados de principio a fin y la barra no se suelta',
    inicio: { e: [0, 15], eMax: [0, 15] }, fin: { e: [0, 15], eMax: [0, 15] }, mano: true, unaVista: true },
  { patron: 'sentadilla al paralelo (barra, frontal, goblet, Smith, hack)', ids: ['squat', 'frontsquat', 'goblet', 'smithsquat', 'hacksquat'],
    fuente: 'NSCA (4.ª ed.), cap. 15, sentadilla: arranca de pie (cadera bien arriba de la rodilla) y baja hasta que los muslos quedan paralelos al piso (cadera a la altura de la rodilla)',
    inicio: { cadera: [null, -12] }, fin: { cadera: [-4, 5] } },
  { patron: 'sentadilla sin peso, rompiendo el paralelo', ids: ['airsquat'],
    fuente: 'ExRx, Bodyweight Squat / técnica estándar: de pie, baja hasta que la cadera queda apenas por debajo de la rodilla',
    inicio: { cadera: [null, -12] }, fin: { cadera: [1.5, 5] } },
  { patron: 'sentadilla pistol completa', ids: ['pistol'],
    fuente: 'técnica estándar de calistenia (Overcoming Gravity, S. Low): de pie en una pierna, sentadilla completa con la cadera bien por debajo de la rodilla',
    inicio: { cadera: [null, -12] }, fin: { cadera: [3, 12] } }
];

/* Ejercicios de las mismas familias que quedan afuera a propósito, con su motivo */
const EXCEPCIONES = {
  skull: 'press francés: es una extensión de codo acostado, no un press de pecho ni de hombros (su rango lo da el codo)',
  legpress: 'prensa de piernas: es de piernas (su rango va con las sentadillas)',
  presscalf: 'gemelos en prensa: es de tobillo',
  pallof: 'press Pallof: es antirrotación; los brazos van y vuelven al pecho de frente'
};

/* familias que tienen que estar cubiertas: press, fondos, dominadas, jalones, muscle-up y todo lo que se hace en barra fija o anillas */
const familia = e => /press|fondo|dip|(^|\s)domin|jal[oó]n|muscle/i.test(e.id + ' ' + e.n) || (MKD[e.id].eq || []).some(q => q.t === 'pullbar' || q.t === 'ring');

const fuera = (v, [a, b]) => (a != null && v < a - .5) || (b != null && v > b + .5);
const rango = ([a, b]) => a == null ? 'hasta ' + b : b == null ? 'desde ' + a : 'entre ' + a + ' y ' + b;
/* unaVista: el patrón mezcla vistas (de costado se mide e; de frente o de atrás, eMax): se controla la que se puede medir */
function problemas(D, p) {
  const out = [], m0 = medidas(MK, D, 0), m1 = medidas(MK, D, 1);
  const mira = (m, reglas, cuando) => { for (const [k, r] of Object.entries(reglas || {})) { const v = m[k]; if (v == null) { if (!p.unaVista) out.push(cuando + ' no se puede medir ' + k); } else if (fuera(v, r)) out.push(`${cuando} ${k} = ${v.toFixed(1)}; tiene que estar ${rango(r)}`); } };
  mira(m0, p.inicio, 'al inicio'); mira(m1, p.fin, 'al final');
  const todos = []; for (let i = 0; i <= 40; i++) todos.push(medidas(MK, D, i / 40));
  for (const [k, r] of Object.entries(p.recorrido || {})) {
    const vs = todos.map(m => m[k]).filter(v => v != null); if (!vs.length) { out.push('no se puede medir ' + k); continue; }
    const lo = Math.min(...vs), hi = Math.max(...vs);
    if (r.min != null && lo < r.min - .5) out.push(`${k} llega a ${lo.toFixed(1)} (mínimo técnico ${r.min})`);
    if (r.max != null && hi > r.max + .5) out.push(`${k} llega a ${hi.toFixed(1)} (máximo técnico ${r.max})`);
  }
  if (p.mano) { const d = manoQuieta(MK, D); if (d > .8) out.push('la mano se mueve ' + d.toFixed(1) + ' de su apoyo'); }
  return out;
}

test('rango técnico: cada patrón tiene fuente, regla de inicio y de fin, y sus ejercicios existen', () => {
  for (const p of ROM) {
    assert.ok(p.fuente && p.fuente.length > 20, p.patron + ' sin fuente');
    assert.ok(p.inicio && Object.keys(p.inicio).length, p.patron + ': falta la regla de inicio');
    assert.ok(p.fin && Object.keys(p.fin).length, p.patron + ': falta la regla de fin');
    for (const id of p.ids) assert.ok(MKD[id], p.patron + ': no existe ' + id);
  }
});

test('rango técnico: cada ejercicio empieza y termina donde dice su patrón', () => {
  for (const p of ROM) for (const id of p.ids) {
    const pr = problemas(MKD[id], p);
    assert.equal(pr.length, 0, id + ' (' + p.patron + '): ' + pr.join('; '));
  }
});

test('rango técnico: press, fondos, dominadas, jalones, muscle-up y barra fija están todos en un patrón o en las excepciones', () => {
  const cubiertos = new Set(ROM.flatMap(p => p.ids));
  for (const e of EX.filter(e => MKD[e.id] && familia(e))) assert.ok(cubiertos.has(e.id) || EXCEPCIONES[e.id], e.id + ' (' + e.n + '): falta declarar su patrón (inicio y fin) o su excepción');
  for (const id of Object.keys(EXCEPCIONES)) assert.ok(!cubiertos.has(id), id + ' está en un patrón y en las excepciones');
});

test('rango técnico: detecta lo que Juan marcó (banca corta, militar doblado como curl, fondo que no llega, dominada sin pasar el mentón)', () => {
  const regla = id => ROM.find(r => r.ids.includes(id));
  const cl = id => JSON.parse(JSON.stringify(MKD[id]));
  /* la banca de la v95: la barra quedaba a 11,5 del eje, sin tocar el pecho */
  const B = cl('bench'); B.ik.Gn.B = [43, 73.5]; assert.ok(problemas(B, regla('bench')).some(t => t.includes('pecho')));
  /* el militar de la v95: abajo en la clavícula con el codo a 150° */
  const O = cl('ohp'); O.A.n = Object.assign({}, O.A.n, { s: 30, e: 150, w: 0 }); assert.ok(problemas(O, regla('ohp')).some(t => t.includes('al inicio')));
  /* fondo que frena con el codo a 70° */
  const F = cl('dips'); F.B.n = Object.assign({}, F.B.n, { s: -40, e: 70 }); assert.ok(problemas(F, regla('dips')).length > 0);
  /* dominada que no pasa el mentón */
  const P = cl('pullup'); P.root.p.B = [60, 34]; assert.ok(problemas(P, regla('pullup')).some(t => t.includes('menton')));
  /* press inclinado que baja de más (como antes de SW-10) */
  const I = cl('incbench'); I.ik.Gn.B = [50, 68]; I.B.n.ab = 40; delete I.B.n.w; assert.ok(problemas(I, regla('incbench')).length > 0);
});

test('muscle-up: fases separadas y en orden (primero tira hasta el pecho, después pasa los hombros y empuja)', () => {
  const D = MKD.muscleup, ms = []; for (let i = 0; i <= 40; i++) ms.push(medidas(MK, D, i / 40));
  const uPecho = ms.findIndex(m => m.pecho <= 9 && m.alto <= -4 && m.hombroBarra < 10);
  const uHombro = ms.findIndex(m => m.hombroBarra >= 10);
  assert.ok(uPecho > 0, 'el pecho nunca llega a la barra');
  assert.ok(uHombro > uPecho, 'los hombros pasan la barra antes de que el pecho llegue (todo junto)');
  assert.ok(ms[uPecho].e >= 120, 'al llegar el pecho a la barra el codo tiene que estar bien doblado (tirón)');
  const iMax = ms.reduce((b, m, i) => m.e > ms[b].e ? i : b, 0);
  assert.ok(ms.slice(0, iMax + 1).every((m, i, a) => !i || m.e >= a[i - 1].e - 1), 'el codo se dobla de corrido en el tirón');
  assert.ok(ms.slice(iMax).every((m, i, a) => !i || m.e <= a[i - 1].e + 1), 'y después se estira de corrido en el fondo');
  assert.ok(D.fases && D.fases.length >= 2, 'las fases van declaradas (tirón y transición)');
});

test('dominadas: todas vistas de atrás (pedido de Juan)', () => {
  for (const id of ['pullup', 'chinup', 'lpullup', 'assistpull', 'negpull', 'archerpull', 'oapull']) {
    assert.ok(MKD[id].v === 'front' && MKD[id].back, id + ' tiene que verse de atrás');
    assert.match(MK.svg(MKD[id], { stat: 1 }), /vista de atrás/);
  }
});

/* SW-10, parte 2: el dibujo hace lo que dice la ficha */
test('ficha = dibujo: dragon pistol, la pierna libre cruza por detrás de la de apoyo hacia el otro lado', () => {
  const D = MKD.dragon, B = MK.frame(D, 1).P;
  assert.equal(D.v, 'front', 'de costado no se ve el cruce');
  assert.ok(D.yaw > 0, 'en 3/4: de frente no se leía la flexión de la rodilla de apoyo');
  const P1 = MK.frame(D, 1).P; assert.ok(P1.KR[0] < P1.HR[0] - 5, 'la rodilla de apoyo va hacia adelante, bien flexionada');
  assert.ok(P1.GR[0] < P1.N[0] - 5, 'los brazos van adelante para equilibrar');
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
