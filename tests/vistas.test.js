'use strict';
/* SW-10 (jefe-154.md, P1, P2 y P5): tres reglas para que un arreglo nuevo no deshaga uno viejo y el dibujo muestre el ejercicio.
   1. Vista registrada: cada ejercicio tiene anotada la vista que se decidió. Si el dibujo cambia de vista sin actualizar este
      registro, falla (así se perdió en su momento la decisión de SW-8 de ver las aperturas desde los pies del banco).
   2. Movimiento invisible: en la vista dibujada, lo que se mueve (mano, pie, codo, rodilla o cuello) tiene que recorrer al menos
      el 40 % de su largo; y en las vistas de frente o de atrás sin 3/4, un brazo o una pierna no puede pasar de entero a casi un
      punto (eso es moverse hacia quien mira: no se ve). Las excepciones van con su motivo.
   3. Variante igual a su base: cada variante declara su base y su dibujo tiene que distinguirse (diferencia media ≥ 3 o, en algún
      cuadro, alguna articulación a 6 o más). Si no, falla, salvo excepción con motivo. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const MK = g('MK'), MKD = g('MKD'), EX = g('EX');

/* vista de cada ejercicio: costado, frente, atrás, 3/4 (cámara girada, a veces desde arriba) o pies del banco */
const vista = D => D.v !== 'front' ? 'costado' : D.back ? 'atrás' : D.yaw ? '3/4' : D.vista === 'pies' ? 'pies del banco' : 'frente';
const VISTAS = {
  'costado': [
    'bench incbench dbpress pushup declbench incdbpress chestpress declpushup dips latpull row dbrow cablerow deadlift',
    'facepull shrug machrow pullover ohp dbohp machpress frontraise uprightrow curl dbcurl hammer pushdown skull',
    'wrist preacher cablecurl ohtri kickback squat frontsquat legpress legext legcurl rdl hipthrust seatlegcurl glutekick',
    'lunge bulgarian hacksquat goblet stepup smithsquat calf seatedcalf presscalf crunch legraise plank cablecrunch abwheel',
    'mtclimb deadbug hyper kneepush pppush planchepush austrow lpullup muscleup benchdip ringdip airsquat shrimp pistol',
    'tucklsit lsit vsit wallhs freehs hspu freehspu tuckfl advfl fullfl tuckbl fullbl tuckpl advpl',
    'fullpl pikepush crow pllean onelegfl skincat advbl onelegl russiandip impdip boxpistol hollow clappush sissy',
    'boxjump jumpsquat kbswing nordic medslam farmer neckiso spansq tibraise slcalf slbal kneewall slbridge birddog',
    'curlup biering cmj broadjump pogo burpee bearcrawl highknees sprint'
  ].join(' '),
  'frente': [
    'cablefly lateral hipabd hipadd vflag tuckflag straddleflag flag copenhagen sidepl extrot wallslide skater jumprope'
  ].join(' '),
  'atrás': [
    'pullup chinup assistpull archerpull oapull negpull deadhang'
  ].join(' '),
  '3/4': [
    'pecdeck reardelt russian diamond archerpush oapush dragon straddlefl straddlebl straddlepl pallof'
  ].join(' '),
  'pies del banco': [
    'dbfly'
  ].join(' ')
};

/* recorrido en el dibujo, como fracción del largo del segmento: mano/brazo entero 31, pie/pierna 39, codo/brazo 14, rodilla/muslo 20, cuello y cabeza/torso 30 */
const PARTES = [[['Gn', 'Gf', 'GL', 'GR'], 31], [['An', 'Af', 'AL', 'AR'], 39], [['En', 'Ef', 'EL', 'ER'], 14], [['Kn', 'Kf', 'KL', 'KR'], 20], [['N', 'H'], 30]];
function recorrido(D) {
  const P0 = MK.frame(D, 0).P; let r = 0;
  for (let i = 1; i <= 40; i++) { const P = MK.frame(D, i / 40).P; for (const [js, L] of PARTES) for (const j of js) if (P[j] && P0[j]) r = Math.max(r, Math.hypot(P[j][0] - P0[j][0], P[j][1] - P0[j][1]) / L); }
  return r;
}
/* cuánto cambia el largo visible (|escorzo|) de brazo, antebrazo, muslo o pierna en una vista de frente o de atrás sin 3/4 */
function escorzo(D) {
  let mx = 0, seg = '';
  for (const k of ['ua', 'fa', 'th', 'sh']) for (const sd of ['L', 'R']) {
    let lo = 9, hi = 0;
    for (let i = 0; i <= 40; i++) { const l = MK.frame(D, i / 40).g.ls || {}, v = Math.abs(l[k + sd] != null ? l[k + sd] : l[k] != null ? l[k] : 1); lo = Math.min(lo, v); hi = Math.max(hi, v); }
    if (hi - lo > mx) { mx = hi - lo; seg = k + sd; }
  }
  return { mx, seg };
}

const SIN_RECORRIDO = {
  calf: 'gemelos: es de tobillo, el movimiento es corto',
  seatedcalf: 'gemelos sentado: de tobillo',
  presscalf: 'gemelos en prensa: de tobillo (las piernas quedan quietas)',
  slcalf: 'gemelos a una pierna: de tobillo',
  tibraise: 'elevación de tibial: de tobillo',
  wrist: 'curl de muñeca: es de muñeca',
  shrug: 'encogimientos: solo suben los hombros',
  hipabd: 'abductores en máquina: abren las rodillas un tercio del muslo; la cadera tiene poco rango en abducción',
  hipadd: 'aductores en máquina: igual que los abductores, al revés',
  curlup: 'curl-up de McGill: a propósito se levantan apenas la cabeza y los hombros',
  kneewall: 'rodilla a la pared: es de tobillo (la rodilla avanza sobre el pie)'
};
const CON_ESCORZO = {
  extrot: 'rotación externa: el antebrazo gira pasando por delante (hacia quien mira) entre dos puntas que se ven enteras; así se lee el giro',
  dbfly: 'aperturas desde los pies del banco: arriba los brazos apuntan hacia la cámara, pero el abrirse hacia los costados se ve entero',
  chinup: 'supinas de atrás: arriba los codos van adelante (escorzo del brazo), mientras el cuerpo sube en el plano',
  archerpull: 'arquero de atrás: el codo que trabaja va adelante arriba; el cuerpo y el brazo de apoyo se mueven en el plano',
  oapull: 'a un brazo de atrás: el codo va adelante a mitad del tirón y el antebrazo queda quieto; el cuerpo sube en el plano'
};

/* cada variante y su base */
const BASE = {
  diamond: 'pushup', archerpush: 'pushup', pppush: 'pushup', oapush: 'pushup', planchepush: 'pushup', clappush: 'pushup', declpushup: 'pushup', kneepush: 'pushup',
  chinup: 'pullup', lpullup: 'pullup', negpull: 'pullup', archerpull: 'pullup', oapull: 'pullup', assistpull: 'pullup',
  incbench: 'bench', declbench: 'bench', dbpress: 'bench', incdbpress: 'dbpress',
  frontsquat: 'squat', goblet: 'squat', smithsquat: 'squat', hacksquat: 'squat',
  pistol: 'airsquat', shrimp: 'airsquat', dragon: 'pistol', boxpistol: 'pistol'
};
const IGUAL_A_SU_BASE = {
  assistpull: 'dominada asistida: es la misma dominada; lo que cambia es la máquina (las rodillas en la almohadilla que empuja), que se dibuja'
};
function diferencia(A, B) {
  if (vista(A) !== vista(B)) return { media: Infinity, max: Infinity };
  let s = 0, n = 0, mx = 0;
  for (const u of [0, .25, .5, .75, 1]) {
    const P = MK.frame(A, u).P, Q = MK.frame(B, u).P;
    for (const k of Object.keys(P)) if (Array.isArray(P[k]) && Q[k]) { const d = Math.hypot(P[k][0] - Q[k][0], P[k][1] - Q[k][1]); s += d; n++; mx = Math.max(mx, d); }
  }
  return { media: s / n, max: mx };
}

test('vista registrada: cada ejercicio está en el registro y se dibuja en la vista que se decidió', () => {
  const reg = {};
  for (const [v, ids] of Object.entries(VISTAS)) for (const id of ids.split(' ')) { assert.ok(!reg[id], id + ' está dos veces en el registro'); reg[id] = v; }
  for (const e of EX) {
    if (!MKD[e.id]) continue;
    assert.ok(reg[e.id], e.id + ' (' + e.n + '): falta registrar su vista');
    assert.equal(vista(MKD[e.id]), reg[e.id], e.id + ' (' + e.n + '): el dibujo cambió de vista; si es a propósito, actualizá el registro');
  }
});

test('movimiento invisible en la vista: lo que se mueve recorre al menos el 40 % de su largo', () => {
  for (const e of EX) {
    const D = MKD[e.id]; if (!D || e.time || SIN_RECORRIDO[e.id]) continue;
    const r = recorrido(D);
    assert.ok(r >= .4, e.id + ' (' + e.n + '): movimiento invisible en esta vista (recorre ' + Math.round(r * 100) + ' % de su largo)');
  }
  for (const id of Object.keys(SIN_RECORRIDO)) assert.ok(MKD[id], 'excepción de un ejercicio que no existe: ' + id);
});

test('movimiento invisible en la vista: de frente o de atrás, un brazo o una pierna no pasa de entero a un punto (iría hacia quien mira)', () => {
  for (const e of EX) {
    const D = MKD[e.id]; if (!D || D.v !== 'front' || D.yaw || e.time || CON_ESCORZO[e.id]) continue;
    const { mx, seg } = escorzo(D);
    assert.ok(mx <= .5, e.id + ' (' + e.n + '): movimiento invisible en esta vista (' + seg + ' cambia de largo ' + Math.round(mx * 100) + ' %: va hacia quien mira; usá 3/4 o la vista del plano)');
  }
});

test('variante igual a su base: cada variante se distingue de su ejercicio base', () => {
  for (const [v, b] of Object.entries(BASE)) {
    assert.ok(MKD[v] && MKD[b], v + ' o su base ' + b + ' no existe');
    if (IGUAL_A_SU_BASE[v]) continue;
    const d = diferencia(MKD[v], MKD[b]);
    assert.ok(d.media >= 3 || d.max >= 6, v + ': se dibuja casi igual que ' + b + ' (diferencia media ' + d.media.toFixed(1) + ', máxima ' + d.max.toFixed(1) + ')');
  }
});

/* SW-10 v100 (jefe-v100.md, punto 1): en 3/4 o desde arriba, lo que se apoya en el piso se dibuja sobre el piso en perspectiva.
   Sin ese plano, la figura se lee flotando (como un salto). */
const EN_EL_PISO_3Q = ['diamond', 'archerpush', 'oapush', 'straddlepl', 'russian'];
function dentro(q, poly, tol) {
  /* adentro del paralelogramo o a menos de tol de su borde */
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > q[1]) !== (yj > q[1]) && q[0] < (xj - xi) * (q[1] - yi) / (yj - yi) + xi) inside = !inside;
  }
  if (inside) return true;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], b = poly[i], v = [b[0] - a[0], b[1] - a[1]], l2 = v[0] * v[0] + v[1] * v[1] || 1;
    const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * v[0] + (q[1] - a[1]) * v[1]) / l2));
    if (Math.hypot(q[0] - a[0] - v[0] * t, q[1] - a[1] - v[1] * t) <= tol) return true;
  }
  return false;
}
test('en 3/4, lo que se apoya en el piso cae sobre el piso dibujado, con su sombra, y la figura va centrada', () => {
  for (const id of EN_EL_PISO_3Q) {
    const D = MKD[id];
    assert.ok(D.apoyo && D.apoyo.length, id + ': declara sus apoyos en el piso');
    const piso = (D.eq || []).find(e => e.t === 'piso');
    assert.ok(piso, id + ': tiene el piso en perspectiva');
    for (const j of D.apoyo) assert.ok(D.eq.some(e => e.t === 'sombra' && e.at === j), id + ': sombra de contacto en ' + j);
  }
  for (const id of Object.keys(MKD)) {
    const D = MKD[id], piso = (D.eq || []).find(e => e.t === 'piso'); if (!piso || !D.apoyo) continue;
    let x0 = 1e9, x1 = -1e9;
    for (let i = 0; i <= 20; i++) {
      const P = MK.frame(D, i / 20).P;
      for (const j of D.apoyo) assert.ok(dentro(P[j], piso.p, 1), id + ': ' + j + ' no cae sobre el piso en ' + i * 5 + ' %');
      for (const q of Object.values(P)) if (Array.isArray(q)) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); }
    }
    assert.ok(Math.abs((x0 + x1) / 2 - 60) <= 12, id + ': la figura no está centrada (centro en ' + ((x0 + x1) / 2).toFixed(0) + ')');
  }
});

test('las tres reglas detectan lo que encontró el jefe (como estaba en la v97)', () => {
  /* pec deck de frente: los brazos venían hacia quien mira */
  const pd = { v: 'front', bentKnees: 1, eq: [{ t: 'floor' }], root: { j: 'P', p: [60, 80] },
    A: { L: { a: 90, e: -90, h: 90, k: -90 }, R: { a: 90, e: -90, h: 90, k: -90 }, ls: { ua: .95, th: .4 } },
    B: { L: { a: 90, e: -90, h: 90, k: -90 }, R: { a: 90, e: -90, h: 90, k: -90 }, ls: { ua: .2, th: .4 } } };
  assert.ok(escorzo(pd).mx > .5);
  /* una variante armada igual que su base (como las flexiones de la v97) */
  assert.ok(diferencia(JSON.parse(JSON.stringify(MKD.pushup)), MKD.pushup).media < 3);
  /* las aperturas pasadas de nuevo a costado: deja de ser la vista registrada */
  const F = JSON.parse(JSON.stringify(MKD.dbfly)); delete F.v; assert.notEqual(vista(F), 'pies del banco');
});
