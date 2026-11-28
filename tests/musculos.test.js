'use strict';
/* SW-11 fase 2 (encargo.md, puntos 3 y 4): músculos pegados a los huesos, que se pintan según el ejercicio, y piel, pelo y ropa en capas.
   - Cada músculo de EX tiene su forma en las vistas donde se ve.
   - Cada ejercicio pinta al menos un músculo visible en su vista; su músculo principal se ve, salvo excepción con motivo.
   - La ropa y el pelo son capas aparte (colores en variables) y no tapan el agarre ni los músculos pintados. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { appConPerfil, RAIZ } = require('./cargar.js');
const { g } = appConPerfil(), MK = g('MK'), MKD = g('MKD'), EX = g('EX'), MUSC = g('MUSC');
const ejs = EX.filter(e => MKD[e.id]);

/* principales que no se ven en la vista elegida, con su motivo */
const EXCEPCION = {
  chinup: ['biceps', 'de atrás (SW-10, Juan: se lee el agarre y los codos); el bíceps es la cara de adelante del brazo'],
  oapull: ['biceps', 'de atrás, como las dominadas; el dorsal (principal) sí se pinta'],
  negpull: ['biceps', 'de atrás, como las dominadas; el dorsal (principal) sí se pinta']
};

test('músculos: cada músculo de EX tiene su forma en las vistas donde se ve', () => {
  const vistas = Object.keys(MK.MVIS);
  for (const m of Object.keys(MUSC)) assert.ok(vistas.some(v => MK.MVIS[v].includes(m)), m + ' no se ve en ninguna vista');
  /* una definición de cada vista: todas las formas de los músculos visibles están */
  const muestra = { costado: MKD.bench, frente: MKD.dbfly, atras: MKD.pullup };
  for (const [v, D] of Object.entries(muestra)) {
    assert.equal(MK.vistaDe(D), v);
    const hay = new Set(MK.formas(D).map(s => s.m));
    for (const m of MK.MVIS[v]) assert.ok(hay.has(m), m + ' no tiene forma en la vista ' + v);
  }
});

test('músculos: cada ejercicio pinta al menos un músculo visible, y el principal se ve (o tiene excepción con motivo)', () => {
  const mal = [];
  for (const e of ejs) {
    const D = MKD[e.id], v = MK.vistaDe(D), s = MK.svg(D, { u: 0 });
    if (!/class="mk-m mk-m[ps] /.test(s)) mal.push(e.id + ': no pinta ningún músculo');
    for (const m of e.p) if (!MK.MVIS[v].includes(m) && !(EXCEPCION[e.id] && EXCEPCION[e.id][0] === m)) mal.push(e.id + ': el principal ' + m + ' no se ve de ' + v);
  }
  assert.deepEqual(mal, []);
  for (const [id, [m, motivo]] of Object.entries(EXCEPCION)) {
    assert.ok(motivo.length > 20, id + ': la excepción necesita motivo');
    assert.ok(!MK.MVIS[MK.vistaDe(MKD[id])].includes(m), id + ': la excepción ya no hace falta');
  }
});

test('músculos: principales en color fuerte, secundarios en suave, y solo los del ejercicio', () => {
  const s = MK.svg(MKD.bench, { u: 0 });
  assert.match(s, /mk-mp m-pecho/); assert.match(s, /mk-ms m-triceps/); assert.match(s, /mk-ms m-hombros/);
  assert.match(s, /mk-m0 m-cuadriceps/, 'los que no trabajan también se dibujan, apenas más oscuros que la piel (jefe-musculos-1.md)');
  assert.match(s, /<path class="mk-m mk-mp m-pecho" d="M[^"]+Z"/, 'cada músculo es un path cerrado');
  assert.match(s, /mk-ml mk-lm0/, 'líneas de definición (abdomen)');
  /* en la app, solo short; la musculosa queda para el modo detalle (jefe) */
  assert.doesNotMatch(s, /mk-tank/); assert.match(MK.svg(MKD.bench, { stat: 1, detalle: 1 }), /mk-tank/);
  const css = fs.readFileSync(path.join(RAIZ, 'app.css'), 'utf8');
  for (const v of ['--mk-mp', '--mk-ms', '--mk-m0', '--mk-piel', '--mk-pelo', '--mk-short', '--mk-tank', '--mk-borde']) assert.match(css, new RegExp(v + ':'), v + ' en app.css');
  /* la piel no puede ser del mismo tono que el secundario (jefe): azul contra piel cálida */
  assert.match(css, /--mk-ms:#[0-9A-F]{6}/i); assert.doesNotMatch(css.match(/--mk-ms:(#[0-9A-F]{6})/i)[1], /^#(F|E)[0-9A-F]{5}$/i, 'el secundario no es un tono claro cálido');
  assert.match(css, /\.mk \.mk-mp\{fill:var\(--mk-mp\)/); assert.match(css, /\.mk \.mk-ms\{fill:var\(--mk-ms\)/);
});

test('piel, pelo y ropa: capas aparte que no tapan el agarre ni los músculos pintados', () => {
  for (const e of ejs) {
    const D = MKD[e.id], s = MK.svg(D, { u: 0 });
    for (const c of ['mk-tr', 'mk-short', 'mk-pelo']) assert.ok(s.includes(c), e.id + ': falta la capa ' + c);
    /* el agarre va arriba de todo */
    if (D.grip && MK.gripBox(D)) assert.ok(s.lastIndexOf('mk-grip') > s.lastIndexOf('mk-short') && s.lastIndexOf('mk-grip') > s.lastIndexOf('mk-remera'), e.id + ': la ropa tapa el agarre');
    /* en cada grupo del cuerpo: piel → los que no trabajan → ropa → los que trabajan (diseno-musculos.md, aprobado por el jefe) */
    for (const grp of s.split(/<g class="mk-(?:near|far)">/).slice(1)) {
      const m0 = grp.lastIndexOf('mk-m mk-m0'), r0 = grp.search(/class="mk-short/), r1 = Math.max(grp.lastIndexOf('"mk-short"'), grp.lastIndexOf('"mk-shortf"')), w = grp.search(/mk-m mk-m[ps]/);
      if (m0 >= 0 && r0 >= 0) assert.ok(m0 < r0, e.id + ': un músculo que no trabaja quedó encima del short');
      if (w >= 0 && r1 >= 0) assert.ok(r1 < w, e.id + ': el short tapa un músculo que trabaja');
    }
  }
});

test('ficha: leyenda chica con los músculos pintados', () => {
  const h = g('techCard')(EX.find(e => e.id === 'bench'));
  assert.match(h, /class="tech-leg"/); assert.match(h, /class="lp"><\/i>Pecho/); assert.match(h, /class="ls"><\/i>Tríceps, Hombros/);
});

test('motor de formas: cada músculo es un path que sigue a su hueso en todos los cuadros, y una forma puede cruzar dos huesos', () => {
  const D = MKD.squat, f = MK.formas(D).find(x => x.m === 'cuadriceps' && x.sd === 'n');
  const cen = d => { const n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1); return [xs.reduce((a, b) => a + b) / xs.length, ys.reduce((a, b) => a + b) / ys.length]; };
  const dSeg = (p, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / (vx * vx + vy * vy))); return Math.hypot(p[0] - a[0] - vx * t, p[1] - a[1] - vy * t); };
  const vistos = new Set();
  for (let i = 0; i <= 10; i++) {
    const R = MK.frame(D, i / 10), d = MK.contorno(R, f);
    assert.match(d, /^M[^Z]+Z$/); vistos.add(d);
    assert.ok(dSeg(cen(d), R.P.Hpn, R.P.Kn) < 4, 'el cuádriceps se despega del muslo en u=' + i / 10);
  }
  assert.ok(vistos.size > 5, 'la forma cambia con el movimiento');
  /* una forma con puntos en dos huesos (como el pectoral, del esternón al hombro) */
  const fx = { m: 'pecho', g: 'torso', sd: 'n', s: 1, pts: [['P', 'N', .9, 3, 'torso'], ['Sn', 'En', .1, 0, 'adel'], ['P', 'N', .6, 3, 'torso']] };
  const R = MK.frame(MKD.bench, .5), d = MK.contorno(R, fx);
  assert.match(d, /^M[\d. -]+C/); assert.equal((d.match(/C/g) || []).length, 3, 'una curva por punto');
});

/* ---------- jefe-musculos-2.md ---------- */
/* A. cada músculo en su cara: el centro de cada forma cae del lado que le toca, respecto de su hueso y según hacia dónde mira el
   cuerpo en ese cuadro (de costado; de frente y de atrás cada vista ya tiene su lado) */
const CARA = { pecho: 1, abs: 1, dorsales: -1, trapecio: -1, lumbar: -1, gluteos: -1, biceps: 1, triceps: -1, cuadriceps: 1, isquios: -1, gemelos: -1, tibial: 1 };
test('músculos (A): cada músculo queda en su cara (el pecho adelante, el dorsal atrás, el gemelo atrás…) en los 154 y en todos los cuadros', () => {
  const mal = [];
  const lado = (c, A, B, torso, d) => { const bx = B[0] - A[0], by = B[1] - A[1], l = Math.hypot(bx, by) || 1, b = [bx / l, by / l], nf = torso ? [-d * b[1], d * b[0]] : [d * b[1], -d * b[0]], t = (c[0] - A[0]) * b[0] + (c[1] - A[1]) * b[1]; return (c[0] - A[0] - b[0] * t) * nf[0] + (c[1] - A[1] - b[1] * t) * nf[1]; };
  for (const e of ejs) {
    const D = MKD[e.id]; if (MK.vistaDe(D) !== 'costado') continue;
    for (const f of MK.formas(D)) {
      if (!(f.m in CARA)) continue;
      for (let i = 0; i <= 10; i++) {
        const R = MK.frame(D, i / 10), d = MK.contorno(R, f), n = (d.match(/-?\d+(\.\d+)?/g) || []).map(Number);
        const c = [n.filter((_, k) => k % 2 === 0), n.filter((_, k) => k % 2 === 1)].map(a => a.reduce((x, y) => x + y) / a.length);
        const torso = f.g === 'torso' && f.m !== 'gluteos', [A, B] = f.m === 'gluteos' ? [R.P.Hpn, R.P.Kn] : torso ? [R.P.P, R.P.N] : [R.P[f.pts[0][0]], R.P[f.pts[0][1]]];
        if (lado(c, A, B, torso, R.d) * CARA[f.m] <= 0) { mal.push(e.id + ' ' + f.m + (f.sd ? '.' + f.sd : '') + ' en u=' + i / 10); break; }
      }
    }
  }
  assert.deepEqual(mal.slice(0, 10), [], mal.length + ' músculos del lado equivocado');
});

test('cara (A): de costado la cabeza tiene nariz, del lado hacia donde mira el cuerpo', () => {
  for (const id of ['dips', 'muscleup', 'tuckbl', 'bench']) {
    const s = MK.svg(MKD[id], { u: .5, noGrip: 1 }), m = s.match(/<circle class="mk-nariz" cx="([-\d.]+)" cy="([-\d.]+)"/);
    assert.ok(m, id + ': sin nariz');
    const R = MK.frame(MKD[id], g('ESQ').ease(.5)), H = R.P.H, b = [R.P.N[0] - R.P.P[0], R.P.N[1] - R.P.P[1]], nf = [-R.d * b[1], R.d * b[0]];
    assert.ok((+m[1] - H[0]) * nf[0] + (+m[2] - H[1]) * nf[1] > 0, id + ': la nariz mira para atrás');
  }
  assert.doesNotMatch(MK.svg(MKD.pullup, { stat: 1 }), /mk-nariz/, 'de frente o de atrás no hay nariz');
});

/* B. área visible mínima del principal: rasterizando el dibujo (tests/raster.js), lo que queda sin tapar en algún momento del
   recorrido. Si no llega, va en esta lista con su motivo (y la hoja de los 154 lo marca "(no se ve)") */
const { visiblesPrincipales } = require('./raster.js');
const AREA_MIN = 20;   /* unidades² del dibujo: ~23 px² a 130 px (la ficha) y ~140 px² en el visor */
const TRAPECIO_COSTADO = 'de costado el trapecio queda detrás del hombro y de la cabeza: asoma poco';
const NO_SE_VE = {
  'row trapecio': TRAPECIO_COSTADO, 'cablerow trapecio': TRAPECIO_COSTADO, 'facepull trapecio': TRAPECIO_COSTADO, 'shrug trapecio': TRAPECIO_COSTADO,
  'machrow trapecio': TRAPECIO_COSTADO, 'uprightrow trapecio': TRAPECIO_COSTADO, 'farmer trapecio': TRAPECIO_COSTADO, 'neckiso trapecio': TRAPECIO_COSTADO,
  'chinup biceps': 'de atrás (SW-10, Juan: se lee el agarre y los codos); el bíceps es la cara de adelante del brazo',
  'oapull biceps': 'de atrás, como las dominadas', 'negpull biceps': 'de atrás, como las dominadas',
  'ohtri triceps': 'con el brazo arriba de la cabeza, el tríceps queda detrás de la cabeza',
  'diamond triceps': 'vista 3/4 de frente: el tríceps es la cara de atrás del brazo y asoma por el borde',
  'oapush triceps': 'vista 3/4 de frente: el tríceps es la cara de atrás del brazo y asoma por el borde',
  'lsit oblicuos': 'con las piernas al frente, los muslos tapan los costados del abdomen',
  'straddlefl dorsales': 'de frente y horizontal, el torso se ve de canto', 'straddlefl abs': 'de frente y horizontal, el torso se ve de canto',
  'straddlebl dorsales': 'de frente y horizontal, el torso se ve de canto',
  'jumprope gemelos': 'de frente el gemelo es la cara de atrás de la pierna',
  'fullbl pecho': 'back lever completo: el pecho mira al piso y los brazos, estirados hacia atrás, pasan por delante'
};
test('músculos (B): cada principal se ve (área visible mínima en algún momento) o tiene su motivo', () => {
  const mal = [], sobran = new Set(Object.keys(NO_SE_VE));
  for (const e of ejs) {
    const v = visiblesPrincipales(MK, MKD[e.id]);
    for (const m of e.p) {
      const k = e.id + ' ' + m, a = v[m] || 0;
      if (a >= AREA_MIN) { if (NO_SE_VE[k]) mal.push(k + ': ya se ve (' + a + '), sacalo de NO_SE_VE'); }
      else if (!NO_SE_VE[k]) mal.push(k + ': se ven ' + a + ' unidades² (mínimo ' + AREA_MIN + ')');
      sobran.delete(k);
    }
  }
  assert.deepEqual(mal, []);
  assert.deepEqual([...sobran], [], 'excepciones de ejercicios o músculos que ya no son principales');
  for (const id of ['hipabd', 'hipadd', 'copenhagen']) assert.ok(!Object.keys(NO_SE_VE).some(k => k.startsWith(id + ' ')), id + ' tiene que verse (jefe)');
});

/* C. el dibujo de las manos queda dentro del marco del cuadradito */
test('agarre (C): en el cuadradito (ag:1) las manos quedan dentro del marco', () => {
  const agCaja = g('agCaja'), manosSVG = g('manosSVG'), AG = g('AG');
  const T = (x, y, cx, cy, sx, sy, r) => { const c = Math.cos(r * Math.PI / 180), s = Math.sin(r * Math.PI / 180), X = x * c - y * s, Y = x * s + y * c; return [cx + X * sx, cy + Y * sy]; };
  for (const id of Object.keys(AG)) {
    const gr = MKD[id].grip, [x0, y0, w, h] = agCaja(gr, id), svg = manosSVG(gr, id), pts = [];
    /* manos apoyadas: cada grupo con su transform (las esquinas de la mano en su sistema) */
    for (const m of svg.matchAll(/<g transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([-\d.]+) ([-\d.]+)\) rotate\(([-\d.]+)\)">/g)) {
      const [cx, cy, sx, sy, r] = m.slice(1).map(Number);
      for (const [lx, ly] of [[-12.5, -28.5], [12.5, -28.5], [12.5, 16], [-12.5, 16], [24, -6]]) pts.push(T(lx, ly, cx, cy, sx, sy, r));
    }
    /* manos en la barra: el dorso o la palma (rectángulos de 30 o 28 de ancho) */
    for (const m of svg.matchAll(/<rect class="ag-(?:back|palm) ag-o" x="([-\d.]+)" y="([-\d.]+)" width="(30|28)" height="([-\d.]+)"/g)) {
      const [x, y, W, H] = m.slice(1).map(Number); pts.push([x, y], [x + W, y + H]);
    }
    assert.ok(pts.length >= 2, id + ': no encontré las manos');
    for (const [x, y] of pts) assert.ok(x >= x0 - .5 && x <= x0 + w + .5 && y >= y0 - .5 && y <= y0 + h + .5, id + ': una mano se sale del cuadradito (' + x.toFixed(1) + ', ' + y.toFixed(1) + ')');
  }
  assert.match(g('agMini')(MKD.pppush, { x: 2, y: 2, s: 1 }, 'pppush'), /class="ag-mini" overflow="hidden"/, 'lo que sobra se recorta');
});

/* D. sin secundarios, la leyenda no muestra el cuadrado azul */
test('leyenda (D): sin secundarios no se muestra esa línea', () => {
  const sin = ejs.find(e => !(e.s || []).filter(m => !e.p.includes(m)).length);
  assert.ok(sin, 'hay ejercicios sin secundarios');
  const h = g('techCard')(sin);
  assert.match(h, /class="tech-leg"/); assert.doesNotMatch(h, /class="ls"/);
});

/* jefe (músculos v2): tope de volumen en el brazo, para que el músculo se lea como parte del brazo y no como algo puesto encima */
test('músculos: deltoides hasta 1,2× y bíceps y tríceps hasta 1,15× el grosor del brazo; se ven el hombro y el codo', () => {
  const MEDIO = 2.75, TOPE = { hombros: 1.2, biceps: 1.15, triceps: 1.15 }, mal = [];
  const curva = d => { const t = d.match(/-?\d*\.?\d+/g).map(Number), P = []; let p = [t[0], t[1]]; P.push(p);
    for (let i = 2; i + 5 < t.length; i += 6) { const a = [t[i], t[i + 1]], b = [t[i + 2], t[i + 3]], c = [t[i + 4], t[i + 5]];
      for (let k = 1; k <= 8; k++) { const s = k / 8, u = 1 - s; P.push([u * u * u * p[0] + 3 * u * u * s * a[0] + 3 * u * s * s * b[0] + s * s * s * c[0], u * u * u * p[1] + 3 * u * u * s * a[1] + 3 * u * s * s * b[1] + s * s * s * c[1]]); }
      p = c; }
    return P; };
  for (const e of ejs) {
    const D = MKD[e.id];
    for (const f of MK.formas(D)) {
      if (!TOPE[f.m]) continue;
      for (let i = 0; i <= 4; i++) {
        const R = MK.frame(D, i / 4), A = R.P[f.pts[0][0]], B = R.P[f.pts[0][1]], L = Math.hypot(B[0] - A[0], B[1] - A[1]), b = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
        for (const p of curva(MK.contorno(R, f))) {
          const t = ((p[0] - A[0]) * b[0] + (p[1] - A[1]) * b[1]) / L, o = Math.abs((p[0] - A[0]) * b[1] - (p[1] - A[1]) * b[0]);
          if (o > TOPE[f.m] * MEDIO + .05) { mal.push(e.id + ' ' + f.m + ': ' + (o / MEDIO / 2 * 2).toFixed(2) + '× el medio grosor'); break; }
          if (t > .97) { mal.push(e.id + ' ' + f.m + ': tapa el codo'); break; }
          if (t < -.1) { mal.push(e.id + ' ' + f.m + ': se pasa del hombro'); break; }
        }
      }
    }
  }
  assert.deepEqual([...new Set(mal)].slice(0, 10), [], mal.length + ' fuera de tope');
});

test('músculos: el pectoral de costado sobresale del pecho, pero con tope (1,85× el medio grosor del torso)', () => {
  const f = MK.FORMAS.costado.find(e => e.m === 'pecho');
  assert.ok(Math.max(...f.puntos.map(p => p[3])) <= 1.85 * 5, 'el pectoral se pasa del tope');
  assert.ok(Math.max(...f.puntos.map(p => p[3])) >= 1.4 * 5, 'el pectoral tiene que sobresalir del pecho (se ve en los press)');
});

test('miniaturas quietas (qa fase 2, B1; jefe): sin músculos, sin pelo ni nariz, para que el árbol vuelva a su peso', () => {
  const chica = MK.svg(MKD.bench, { stat: 1 }), grande = MK.svg(MKD.bench, { u: 0 });
  assert.doesNotMatch(chica, /class="mk-m |mk-pelo|mk-nariz|mk-ml/, 'a 44 px, sin músculos ni pelo (jefe)');
  assert.match(grande, /mk-m0/); assert.match(grande, /mk-pelo/); assert.match(grande, /mk-nariz/);
  let antes = 0, ahora = 0;
  for (const e of ejs) { antes += MK.svg(MKD[e.id], { stat: 1, lite: 0 }).length; ahora += MK.svg(MKD[e.id], { stat: 1 }).length; }
  assert.ok(ahora < antes * .6, 'las miniaturas pesan menos (' + Math.round(ahora / 1024) + ' KB contra ' + Math.round(antes / 1024) + ' KB)');
});
