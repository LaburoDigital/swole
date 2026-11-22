'use strict';
/* SW-4: escudos con su propio metal (color por rango) y eje del gráfico con marcas distintas. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');

const a = cargarApp();
const run = c => vm.runInContext(c, a.ctx);

test('escudo: cada uno lleva su propio degradado (no depende del <svg> compartido) y el color es el de su rango', () => {
  const stops = JSON.parse(run('JSON.stringify(BM_STOPS)'));
  const vistos = new Set();
  for (let t = 0; t <= 6; t++) {
    const h = run('badge(' + (t * 3 + 1) + ',44)');
    const id = (h.match(/<linearGradient id="(bmx\d+)"/) || [])[1];
    assert.ok(id, 'rango ' + t + ': sin degradado propio');
    assert.ok(h.includes('url(#' + id + ')'), 'rango ' + t + ': no usa su degradado');
    assert.ok(!/url\(#bm\d\)/.test(h), 'rango ' + t + ': todavía usa el degradado compartido');
    for (const s of stops[t]) assert.ok(h.includes('stop-color="' + s + '"'), 'rango ' + t + ': falta ' + s);
    assert.ok(!vistos.has(id), 'id repetido'); vistos.add(id);
  }
  // el frente tiene el color del rango bien visible
  assert.match(run('badge(13,44)'), /fill="#2F73E0" opacity="\.34"/);
});

test('medalla de logro: también con su propio metal', () => {
  const h = run('achBadge({t:3,i:"trophy"},true)');
  assert.ok(!/url\(#bm\d\)/.test(h));
  assert.match(h, /<linearGradient id="bmx\d+"/);
});

test('gráfico: las marcas del eje Y nunca se repiten (69,5 ya no muestra "70, 70, 69")', () => {
  for (const [lo, hi] of [[68.85, 70.15], [69.4, 69.6], [2, 3], [60, 95], [100, 400], [0, 1], [74.2, 75.1]]) {
    const l = JSON.parse(run('JSON.stringify(chartTicks(' + lo + ',' + hi + ').map(x=>x[1]))'));
    assert.ok(l.length >= 2 && l.length <= 5, lo + '-' + hi + ': ' + l);
    assert.equal(new Set(l).size, l.length, 'repetidas en ' + lo + '-' + hi + ': ' + l);
  }
  // el gráfico de peso real: 70 → 69 kg
  run('db.profile={sex:"m",age:25,height:178,weight:70};');
  const svg = run('chart([{t:Date.parse("2026-11-06"),y:70},{t:Date.parse("2026-11-10"),y:69}],"kg",[{t:Date.parse("2026-11-06"),y:70},{t:Date.parse("2026-11-10"),y:69.6}])');
  const ys = [...svg.matchAll(/text-anchor="end">([^<]+)</g)].map(m => m[1]).filter(x => /^\d/.test(x));
  assert.equal(new Set(ys).size, ys.length, 'etiquetas: ' + ys);
  assert.match(svg, /class="ch-leg"/, 'con tendencia hay leyenda');
});
