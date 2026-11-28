'use strict';
/* SW-11 fase 2 (encargo.md, punto 5): el esqueleto en su propio módulo, sin DOM, para reusarlo en un juego 3D.
   - js/esqueleto.js carga en Node sin DOM y exporta los huesos estándar de humanoide y exportPose(id, u).
   - exportPose de los 154 da los 17 huesos, cuaterniones válidos y ángulos dentro de sus límites.
   - macaco.js dibuja con el módulo: no duplica la cinemática. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { appConPerfil, RAIZ } = require('./cargar.js');

const NOMBRES = ['hips', 'spine', 'chest', 'neck', 'head'].concat(...['L', 'R'].map(s => ['upperArm', 'lowerArm', 'hand', 'upperLeg', 'lowerLeg', 'foot'].map(b => b + '.' + s)));

test('esqueleto: carga en Node sin DOM y tiene los huesos estándar de humanoide', () => {
  const src = fs.readFileSync(path.join(RAIZ, 'js/esqueleto.js'), 'utf8');
  assert.doesNotMatch(src.replace(/\/\*[\s\S]*?\*\//g, ''), /\b(document|window|navigator|localStorage)\b/, 'el esqueleto no toca el DOM');
  const ESQ = require(path.join(RAIZ, 'js/esqueleto.js'));
  assert.equal(typeof ESQ.exportPose, 'function'); assert.equal(typeof ESQ.frame, 'function'); assert.equal(typeof ESQ.solve2, 'function');
  assert.deepEqual(ESQ.HUESOS.map(h => h[0]).sort(), NOMBRES.slice().sort());
  for (const [n, padre] of ESQ.HUESOS) assert.ok(padre === null || ESQ.HUESOS.some(h => h[0] === padre), n + ': padre desconocido');
  assert.ok(ESQ.LIM.k && ESQ.LIM.e && ESQ.LEN.t, 'límites y largos');
  /* sin las definiciones de la app, avisa claro */
  assert.throws(() => ESQ.exportPose('bench', 0), /no existe el ejercicio/);
});

test('esqueleto: macaco.js dibuja con el módulo (no duplica la cinemática)', () => {
  const mac = fs.readFileSync(path.join(RAIZ, 'js/macaco.js'), 'utf8');
  for (const f of ['frame', 'fkSide', 'fkFront', 'solve2', 'ikArm', 'ikLeg', 'angAt']) assert.doesNotMatch(mac, new RegExp('function ' + f + '\\('), 'macaco.js vuelve a definir ' + f);
  assert.match(mac, /=ESQ;/);
  const { g } = appConPerfil();
  assert.equal(g('MK').frame, g('ESQ').frame);
  const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  assert.ok(html.indexOf('js/esqueleto.js') > 0 && html.indexOf('js/esqueleto.js') < html.indexOf('js/macaco.js'), 'esqueleto.js carga antes que macaco.js');
  assert.match(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8'), /esqueleto/);
});

test('esqueleto: exportPose de los 154 da los 17 huesos, cuaterniones válidos y ángulos dentro de sus límites', () => {
  const { g } = appConPerfil(), ESQ = g('ESQ'), MKD = g('MKD'), EX = g('EX'), fuera = [];
  const ids = EX.filter(e => MKD[e.id]).map(e => e.id);
  assert.equal(ids.length, 154);
  for (const id of ids) for (let i = 0; i <= 20; i++) {
    const p = ESQ.exportPose(id, i / 20);
    assert.deepEqual(JSON.parse(JSON.stringify(Object.keys(p.huesos).sort())), NOMBRES.slice().sort(), id + ': faltan huesos');
    assert.equal(p.raiz.pos.length, 3);
    for (const [n, h] of Object.entries(p.huesos)) {
      for (const q of [h.q, h.qLocal]) assert.ok(Math.abs(Math.hypot(...q) - 1) < 1e-3, id + ' ' + n + ': cuaternión no unitario');
      if (h.lim && !h.proyectado && (h.ang < h.lim[0] - .5 || h.ang > h.lim[1] + .5)) fuera.push(id + ' ' + n + ' ' + h.ang + ' en u=' + i / 20);
    }
  }
  assert.deepEqual(fuera.slice(0, 10), [], fuera.length + ' huesos fuera de su límite');
});

test('esqueleto: docs/esqueleto.md explica cómo mapearlo a un rig 3D (Mixamo, Unity Humanoid y glTF) y qué se reusa', () => {
  const md = fs.readFileSync(path.join(RAIZ, 'docs/esqueleto.md'), 'utf8');
  for (const k of ['Mixamo', 'Unity Humanoid', 'glTF', 'exportPose', 'Qué se reusa']) assert.ok(md.includes(k), 'falta ' + k);
  for (const n of NOMBRES) assert.ok(md.includes('`' + n.split('.')[0]), 'falta el hueso ' + n);
});

test('esqueleto: la rotación local compone con la del padre (sirve para un rig jerárquico)', () => {
  const { g } = appConPerfil(), ESQ = g('ESQ');
  const p = ESQ.exportPose('squat', .5);
  for (const [n, padre] of ESQ.HUESOS) {
    if (!padre) continue;
    const w = ESQ.qMul(p.huesos[padre].q, p.huesos[n].qLocal), q = p.huesos[n].q;
    const igual = w.every((x, i) => Math.abs(x - q[i]) < 2e-3) || w.every((x, i) => Math.abs(x + q[i]) < 2e-3);
    assert.ok(igual, n + ': padre × local ≠ mundo');
  }
  /* de pie al empezar la sentadilla: columna hacia arriba y muslos hacia abajo */
  const p0 = ESQ.exportPose('squat', 0);
  assert.ok(p0.huesos.spine.dir[1] > .9 && p0.huesos['upperLeg.L'].dir[1] < -.9);
});
