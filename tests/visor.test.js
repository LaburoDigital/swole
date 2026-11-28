'use strict';
/* SW-11 fase 1 (encargo.md): visor del ejercicio a pantalla completa y agarre en grande.
   - Los 154 ejercicios con dibujo tienen fases con nombre y cada clave de técnica tiene su fase (o "todo el recorrido").
   - El zoom del visor (MK.caja) no corta ningún cuadro: todo el cuerpo y el equipo de mano quedan adentro en 101 cuadros.
   - El visor abre y cierra sin mover nada de atrás (ni la hoja de la ficha ni el scroll del contenido).
   - Los ejercicios con ag:1 llevan el cuadradito de manos y todos los agarres se dibujan en grande. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp, appConPerfil } = require('./cargar.js');

const app = appConPerfil(), { g } = app;
const MKD = g('MKD'), VFASES = g('VFASES'), XT = g('XT'), MK = g('MK'), EX = g('EX');
const L = x => JSON.parse(JSON.stringify(x));   /* los arreglos que vienen de la app (otro contexto de vm) se comparan como datos */
const ids = EX.filter(e => MKD[e.id]).map(e => e.id);

test('visor: los 154 ejercicios con dibujo tienen fases con nombre', () => {
  assert.equal(ids.length, 154);
  for (const id of ids) {
    const F = VFASES[id];
    assert.ok(F && Array.isArray(F.s) && F.s.length >= 1, id + ': sin fases');
    for (const [n, u0, u1] of F.s) {
      assert.ok(typeof n === 'string' && n.trim().length > 1, id + ': fase sin nombre');
      assert.ok(u0 >= 0 && u0 <= 1 && u1 >= 0 && u1 <= 1, id + ': la fase "' + n + '" se sale del recorrido');
    }
    /* el recorrido se cubre entero: alguna fase pasa por el principio y alguna por el final */
    assert.ok(F.s.some(s => Math.min(s[1], s[2]) === 0) && F.s.some(s => Math.max(s[1], s[2]) === 1), id + ': las fases no cubren todo el recorrido');
  }
  /* los isométricos tienen una sola fase, "Posición"; los de varias fases usan sus nombres */
  for (const e of EX.filter(e => MKD[e.id] && e.time)) assert.deepEqual(L([...new Set(VFASES[e.id].s.map(s => s[0]))]), ['Posición'], e.id);
  assert.deepEqual(L(VFASES.muscleup.s.map(s => s[0])), ['Colgado', 'Tirón', 'Transición', 'Fondo', 'Arriba']);
  assert.deepEqual(L([...new Set(VFASES.bench.s.map(s => s[0]))]), ['Arriba', 'Bajada', 'Abajo', 'Subida']);
  assert.deepEqual(L([...new Set(VFASES.pullup.s.map(s => s[0]))]), ['Colgado', 'Tirón', 'Arriba', 'Bajada']);
  assert.deepEqual(L([...new Set(VFASES.curl.s.map(s => s[0]))]), ['Abajo', 'Subida', 'Arriba', 'Bajada']);
});

test('visor: cada clave de técnica tiene su fase (o "todo el recorrido")', () => {
  for (const id of ids) {
    const F = VFASES[id], cues = (XT[id] || {}).cues || [], nombres = F.s.map(s => s[0]);
    assert.equal(F.c.length, cues.length, id + ': hay ' + cues.length + ' claves y ' + F.c.length + ' fases asignadas');
    F.c.forEach((f, i) => assert.ok(f === 'todo' || nombres.includes(f), id + ': la clave "' + cues[i] + '" apunta a una fase que no existe (' + f + ')'));
  }
  /* algunas a mano: lo que la heurística tiene que acertar */
  const fase = (id, txt) => VFASES[id].c[XT[id].cues.findIndex(c => c.startsWith(txt))];
  assert.equal(fase('bench', 'Bajá'), 'Bajada');
  assert.equal(fase('bench', 'Empujá'), 'Subida');
  assert.equal(fase('pullup', 'Tirá'), 'Tirón');
  assert.equal(fase('rdl', 'Llevá la cadera atrás'), 'Bajada');
  assert.equal(fase('pushdown', 'Empujá hacia abajo'), 'Bajada');
  assert.equal(fase('latpull', 'Subí lento'), 'Vuelta');
});

test('visor: el zoom no corta ningún cuadro de los 154', () => {
  const cortes = [];
  for (const id of ids) {
    const D = MKD[id], b = MK.caja(D), x1 = b.x + b.w, y1 = b.y + b.h;
    assert.ok(b.w > 10 && b.h > 10, id + ': caja vacía');
    for (let i = 0; i <= 100; i++) {
      const R = MK.frame(D, i / 100);
      for (const [k, q] of Object.entries(R.P)) {
        if (!Array.isArray(q)) continue;
        const r = k === 'H' ? 7.5 : 2.5;
        if (q[0] - r < b.x - .01 || q[0] + r > x1 + .01 || q[1] - r < b.y - .01 || q[1] + r > y1 + .01) { cortes.push(id + ' ' + k + ' en u=' + i / 100); break; }
      }
      /* el equipo que va en la mano (barra, mancuernas, pesa, balón, manija) también queda adentro */
      (D.eq || []).forEach((e, j) => { const at = R.eq[j].at; if (!at || !['bar', 'db', 'kb', 'ball', 'handle'].includes(e.t)) return;
        if (at[0] < b.x || at[0] > x1 || at[1] < b.y || at[1] > y1) cortes.push(id + ' ' + e.t + ' en u=' + i / 100); });
    }
  }
  assert.deepEqual(cortes.slice(0, 10), [], cortes.length + ' cortes');
});

test('visor: el dibujo del visor usa la caja como viewBox y no repite el recuadro del agarre', () => {
  const visFig = g('visFig'), b = MK.caja(MKD.squat);
  const s = visFig('squat', .5);
  assert.match(s, new RegExp('viewBox="' + [b.x, b.y, b.w, b.h].join(' ') + '"'));
  assert.doesNotMatch(s, /mk-grip/);
});

test('visor: la línea de tiempo y la barra de fases van y vuelven sin saltos', () => {
  const visTL = g('visTL'), visU = g('visU'), visX = g('visX'), visTfromX = g('visTfromX'), visG = g('visG');
  for (const id of ids) {
    const tl = visTL(id);
    assert.ok(tl.T > 0 && tl.G.length >= 1, id);
    for (let i = 0; i < 200; i++) { const t = tl.T * i / 200, u = visU(tl, t); assert.ok(u >= 0 && u <= 1, id + ': u fuera de rango');
      /* tocar o arrastrar la barra lleva al mismo lugar */
      const x = visX(tl, t); assert.ok(Math.abs(visTfromX(tl, x) - t) < 1e-6 || x >= .9999, id + ': la barra no coincide con el tiempo'); assert.equal(visG(tl, visTfromX(tl, x)), visG(tl, t)); }
  }
});

function appVisor() {
  const llamadas = { scrollTo: 0 };
  const sc = { style: {}, scrollTop: 300, scrollTo() { llamadas.scrollTo++; }, addEventListener() {}, getBoundingClientRect: () => ({ top: 0, bottom: 700 }), attrs: {}, toggleAttribute(k, v) { this.attrs[k] = v; } };
  const a = cargarApp({ antes(sb) {
    sb.scrollTo = () => { llamadas.scrollTo++; };
    const gid = sb.document.getElementById; sb.document.getElementById = id => id === 'scroller' ? sc : gid(id);
    sb.document.documentElement.classList.contains = () => false;
  } });
  vm.runInContext('db.profile = {sex:"m",age:25,height:178,weight:75,goal:"recomp",nick:"prueba",sports:[],week:{},activity:"auto"}', a.ctx);
  return { a, sc, llamadas };
}

test('visor: abre y cierra encima de la ficha sin mover nada de atrás', () => {
  const { a, sc, llamadas } = appVisor(), S = a.g('S'), A = a.g('ACTIONS');
  S.modal = { t: 'ex', id: 'pullup' };
  A.visor('pullup');
  assert.equal(S.m2.t, 'visor'); assert.equal(S.modal.t, 'ex', 'la ficha sigue abajo');
  const html = a.g('modalBody')(S.m2, true);
  assert.match(html, /class="msheet full vis-sh"/, 'pantalla completa');
  assert.match(html, /data-a="close" data-v="m2"/, 'se cierra con la X');
  assert.match(html, /class="vis-seg/, 'barra de fases');
  assert.match(html, /data-a="visVel" data-v="0.25"/, 'velocidad 0,25×');
  assert.match(html, /Error común/);
  assert.match(html, /data-a="visGrip"/, 'el recuadro del agarre se puede tocar');
  /* el lock de la v99: con la hoja abierta el contenido de atrás no se toca */
  a.g('lockScroll')(true); assert.equal(sc.attrs.inert, true);
  a.g('closeLayer')('m2');
  assert.equal(S.m2, null); assert.equal(S.modal.t, 'ex', 'cerrar el visor deja la ficha como estaba');
  assert.equal(sc.scrollTop, 300); assert.equal(llamadas.scrollTo, 0);
});

test('visor: con movimiento reducido arranca en pausa; tocar una fase pausa ahí', () => {
  const a = appConPerfil(), S = a.g('S'), A = a.g('ACTIONS'), VIS = a.g('VIS');
  vm.runInContext('db.settings=db.settings||{};db.settings.calm=true', a.ctx);
  A.visor('bench'); assert.equal(VIS.play, false);
  vm.runInContext('db.settings.calm=false', a.ctx);
  A.visor('squat'); assert.equal(VIS.play, true);
  A.visFase('2'); assert.equal(VIS.play, false);
  assert.equal(a.g('visG')(VIS.tl, VIS.t), 2);
  assert.equal(VIS.tl.G[2].n, 'Abajo');
});

test('agarre: cada agarre se dibuja en grande con las dos manos (o una) y una línea de cómo agarrar', () => {
  const manosSVG = g('manosSVG'), comoAgarrar = g('comoAgarrar'), agarreHTML = g('agarreHTML');
  for (const id of ids) {
    const gr = MKD[id].grip; if (!gr) continue;
    const h = manosSVG(gr, id);
    const manos = (h.match(/class="ag-(back|palm) ag-o" x="[^"]*" y="[^"]*" width="(30|28|25|22)"/g) || []).length;
    assert.ok(manos === 2 || (/una mano|antebrazo\)/.test(gr.txt || '') && manos === 1), id + ': ' + manos + ' manos');
    assert.ok(comoAgarrar(gr, id).length > 20, id + ': sin línea de cómo agarrar');
    assert.match(agarreHTML(id), /hombro/, id + ': sin la marca de los hombros');
  }
  /* la diamante: manos juntas con el rombo; la pseudo planche: dedos hacia atrás */
  assert.match(manosSVG(MKD.diamond.grip, 'diamond'), /ag-rombo/);
  assert.match(comoAgarrar(MKD.pppush.grip, 'pppush'), /hacia atrás/);
  assert.match(comoAgarrar(MKD.chinup.grip, 'chinup'), /hacia vos/);
});

test('agarre: los ejercicios con ag:1 llevan el cuadradito de manos en el dibujo, sin tapar la figura', () => {
  const AG = g('AG');
  for (const id of Object.keys(AG)) {
    assert.ok(MKD[id], id + ' no existe');
    assert.equal(MKD[id].ag, 1, id);
    const s = MK.svg(MKD[id], { stat: 1 });
    assert.match(s, /mk-ag/, id + ': sin el cuadradito');
    assert.ok(MK.gripBox(MKD[id]), id + ': no hay esquina libre para el cuadradito');
  }
  for (const id of ['diamond', 'archerpush', 'pppush', 'oapush', 'chinup', 'pullup', 'hammer']) assert.ok(AG[id], id + ' tiene que tener ag:1 (encargo)');
});

/* jefe (SW-11): el ancho que dice el texto tiene que coincidir con el dibujo. Se mide la distancia entre las manos contra la de los
   hombros en la figura (vista de frente, donde se ve el ancho) y contra las marcas de los hombros de la hoja del agarre; en las
   vistas de costado (las manos se tapan) manda lo que dice la clave de técnica sobre el ancho. */
const BANDA = r => r < .9 ? 'cerrado' : r < 1.35 ? 'medio' : r < 2.2 ? 'pocoabierto' : 'abierto';
test('agarre: la categoría del ancho coincide con la distancia entre las manos del dibujo, contra los hombros', () => {
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), mal = [];
  for (const id of ids) {
    const D = MKD[id], gr = D.grip;
    if (!gr) continue;
    assert.ok(['cerrado', 'medio', 'pocoabierto', 'abierto', 'variable'].includes(gr.w), id + ': ancho desconocido ' + gr.w);
    if (D.v !== 'front' || /una mano|antebrazo/.test(gr.txt || '')) continue;
    const rs = [];
    for (let i = 0; i <= 20; i++) { const P = MK.frame(D, i / 20).P, r = d(P.GL, P.GR) / d(P.SL, P.SR); if (isFinite(r)) rs.push(r); }
    const mn = Math.min(...rs), mx = Math.max(...rs), m = rs.reduce((a, b) => a + b) / rs.length, fijo = mx - mn < .35;
    /* manos siempre juntas: cerrado; manos quietas: la banda de la distancia; manos que se abren y se cierran (aperturas, elevaciones): "variable" */
    const debe = mx < .9 ? 'cerrado' : fijo ? BANDA(m) : 'variable';   /* si nunca pasan del ancho de cerrado, es cerrado (pallof: una sola manija) */
    if (gr.w !== debe) mal.push(id + ': dice ' + gr.w + ' y el dibujo da ' + debe + ' (manos/hombros ' + m.toFixed(2) + ')');
  }
  assert.deepEqual(mal, []);
});
test('agarre: lo que dicen las claves sobre el ancho coincide con la categoría (también en las vistas de costado)', () => {
  const FR = [[/(agarre|manos)[^,.;]*un poco más abiert/i, 'pocoabierto'], [/(agarre|manos)[^,.;]*(muy|bien) abiert/i, 'abierto'],
    [/(agarre|manos)[^,.;]*al ancho de (los )?hombros/i, 'medio'], [/(agarre|manos)[^,.;]*(juntas|cerrad)/i, 'cerrado']], mal = [];
  for (const id of ids) {
    const gr = MKD[id].grip; if (!gr) continue;
    for (const c of (XT[id] || {}).cues || []) { const f = FR.find(([re]) => re.test(c)); if (f && f[1] !== gr.w) mal.push(id + ': la clave "' + c + '" y el dato dice ' + gr.w); }
  }
  assert.deepEqual(mal, []);
  /* el caso que vio el jefe: pronas más abiertas que las supinas, y cada texto lo dice */
  assert.equal(MKD.pullup.grip.w, 'pocoabierto'); assert.equal(MKD.chinup.grip.w, 'medio');
  assert.match(g('gripTxt')(MKD.pullup.grip), /un poco más abierto que los hombros/);
  assert.match(g('comoAgarrar')(MKD.pullup.grip, 'pullup'), /un poco más abiertas que los hombros/);
});
test('agarre: en la hoja grande las manos quedan donde dice el ancho, contra las marcas de los hombros', () => {
  const AGX = g('AGX'), SHX = g('SHX');
  const lado = { cerrado: r => r < .9, medio: r => r >= .9 && r < 1.1, pocoabierto: r => r >= 1.1 && r < 1.45, abierto: r => r >= 1.45 };
  for (const [w, ok] of Object.entries(lado)) assert.ok(ok(AGX[w] / SHX), w + ': las manos están a ' + (AGX[w] / SHX).toFixed(2) + ' de los hombros');
  /* y el dibujo las pone ahí: la mano derecha de las pronas va en 120 + AGX */
  assert.match(g('manosSVG')(MKD.pullup.grip, 'pullup'), new RegExp('x="' + (120 + AGX.pocoabierto - 15) + '"'));
});
test('visor: los nombres de las fases nunca se cortan (se achica la letra o la fila scrollea)', () => {
  const fs = require('fs'), path = require('path'), css = fs.readFileSync(path.join(require('./cargar.js').RAIZ, 'app.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of css.matchAll(/([^{}]*\.vis-seg[^{}]*)\{([^}]*)\}/g)) assert.doesNotMatch(m[2], /text-overflow\s*:\s*ellipsis/, m[1].trim() + ' corta el nombre con puntos suspensivos');
  assert.match(css, /\.vis-segs\.scroll\{[^}]*overflow-x:auto/, 'si no entra, la fila scrollea de costado');
  assert.equal(typeof g('visFitSegs'), 'function');
});
test('visor (qa): abrir el visor o el agarre no redibuja el selector de atrás (no lo lleva arriba)', () => {
  const A = g('ACTIONS'), src = (A.visor.toString() + A.agarre.toString()).replace(/\/\*[\s\S]*?\*\//g, '');   /* sin comentarios */
  assert.doesNotMatch(src, /(^|[^a-zA-Z])render\(\)/, 'usa render(): redibuja el selector y lo lleva a 0');
  assert.match(src, /renderModal\(\)/);
});
