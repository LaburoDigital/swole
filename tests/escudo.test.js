'use strict';
/* SW-5: el escudo de nivel es el disco (opción A de swole-escudos.html) en todos los rangos y divisiones. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');

const a = cargarApp();
const run = c => vm.runInContext(c, a.ctx);
const ROM = ['I', 'II', 'III'];
const aros = h => (h.match(/<circle cx="50" cy="50" r="(3[0-6]|2[0-9])(\.\d)?" fill="none"/g) || []).length;

test('disco A: cada rango y división tiene su metal, sus aros, su número y sus muescas', () => {
  const stops = JSON.parse(run('JSON.stringify(BM_STOPS)'));
  for (let L = 0; L < 18; L++) {
    const t = Math.floor(L / 3), d = L % 3;
    for (const size of [40, 120]) {
      const h = run('badge(' + L + ',' + size + ')');
      assert.ok(!/undefined|NaN/.test(h), 'L' + L + ' ' + size + 'px');
      assert.match(h, /viewBox="0 0 100 100"/);
      assert.match(h, /<circle cx="50" cy="50" r="46" fill="url\(#bmx\d+\)"/, 'borde de metal propio');
      assert.ok(h.includes('stop-color="' + stops[t][1] + '"'), 'metal del rango ' + t);
      assert.equal(aros(h), t + 1, 'L' + L + ': ' + (t + 1) + ' aros');
      assert.ok(h.includes('>' + ROM[d] + '</text>'), 'L' + L + ': número ' + ROM[d]);
      assert.equal((h.match(/<rect [^>]*fill="#0C0E16"/g) || []).length, d + 1, 'L' + L + ': ' + (d + 1) + ' muescas marcadas');
      assert.match(h, /class="bdg-sh"/, 'brillo que sigue al celu');
    }
  }
  // en chico el número es más grande, para que se lea a 40 px
  assert.match(run('badge(4,40)'), /font-size="33"/);
  assert.match(run('badge(4,120)'), /font-size="30"/);
});

test('disco A: Élite lleva la barra en S, una muesca y ningún número', () => {
  for (const size of [40, 120]) {
    const h = run('badge(18,' + size + ')');
    assert.ok(h.includes('M80 24 H50 C35 24'), 'la S del logo');
    assert.ok(!/<text/.test(h), 'sin número');
    assert.equal(aros(h), 7);
    assert.equal((h.match(/<rect [^>]*fill="#0C0E16"/g) || []).length, 1);
  }
});

test('disco A: sin rango, un disco vacío punteado; ids propios en cada dibujo', () => {
  const h = run('badge(-1,40)');
  assert.match(h, /stroke-dasharray/);
  assert.ok(!/url\(#bm\d\)/.test(h));
  const a1 = run('badge(9,40)'), a2 = run('badge(9,40)');
  const ids = s => [...s.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  for (const id of ids(a1)) assert.ok(!ids(a2).includes(id), 'id repetido: ' + id);
});

test('disco A: a 30 px o menos el número va sin contorno (si no, "III" se empasta)', () => {
  const h = run('badge(5,26)');
  assert.match(h, /font-size="35"[^>]*>III<\/text>/);
  assert.ok(!/<text[^>]*stroke=/.test(h), 'sin contorno');
  assert.match(run('badge(5,40)'), /<text[^>]*stroke="rgba\(0,0,0,\.6\)"/, 'a 40 px sigue con contorno');
});
