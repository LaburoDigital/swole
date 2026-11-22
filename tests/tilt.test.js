'use strict';
/* SW-5: movimiento con el celu (Tilt). iPhone: el permiso se pide una vez con el botón; después, solo en el primer toque. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');

/* opts.ios: undefined = Android/compu; 'granted'|'denied' = lo que contesta iOS. opts.guardado: lo anotado en el celu. */
function app(opts) {
  opts = opts || {};
  const pedidos = { n: 0 };
  const a = cargarApp({
    antes(s) {
      if (opts.ios) s.DeviceOrientationEvent = { requestPermission: () => { pedidos.n++; return Promise.resolve(opts.ios); } };
      if (opts.guardado) s.localStorage.setItem('swole.tilt', opts.guardado);
      if (opts.quieto) s.matchMedia = q => ({ matches: /reduce/.test(q), addEventListener() {}, addListener() {} });
    },
  });
  const run = c => vm.runInContext(c, a.ctx);
  return { run, pedidos, estado: () => JSON.parse(run('JSON.stringify(Tilt.state())')) };
}
const espera = () => new Promise(r => setImmediate(r));

test('Android / compu: anda solo, sin botón ni permiso', () => {
  const { run, estado } = app();
  assert.equal(estado().on, true);
  assert.equal(run('Tilt.needsButton()'), false);
});

test('iPhone, primera vez: botón en la carta; al aceptar queda anotado y se activa', async () => {
  const { run, estado, pedidos } = app({ ios: 'granted' });
  assert.equal(run('Tilt.needsButton()'), true);
  assert.equal(estado().on, false);
  assert.equal(estado().armed, false, 'no pide solo si nunca aceptó');
  run('Tilt.ask()'); await espera();
  assert.equal(pedidos.n, 1);
  assert.equal(estado().on, true);
  assert.equal(run('localStorage.getItem("swole.tilt")'), 'granted');
  assert.equal(run('Tilt.needsButton()'), false, 'ya no muestra el botón');
});

test('iPhone que ya aceptó: sin botón, se pide solo en el primer toque (una sola vez)', async () => {
  const { run, estado, pedidos } = app({ ios: 'granted', guardado: 'granted' });
  assert.equal(run('Tilt.needsButton()'), false);
  assert.equal(estado().armed, true);
  assert.equal(pedidos.n, 0, 'no pide nada antes de un toque');
  run('Tilt._tap()'); await espera();
  run('Tilt._tap()'); await espera();
  assert.equal(pedidos.n, 1);
  assert.equal(estado().on, true);
});

test('iPhone que dijo que no: no se vuelve a pedir solo; el botón queda para reintentar', async () => {
  const { run, estado, pedidos } = app({ ios: 'denied', guardado: 'denied' });
  assert.equal(estado().armed, false);
  run('Tilt._tap()'); await espera();
  assert.equal(pedidos.n, 0);
  assert.equal(run('Tilt.needsButton()'), true);
  // y si el permiso guardado ya no vale (lo sacó en Ajustes), queda anotado como "no"
  const b = app({ ios: 'denied', guardado: 'granted' });
  b.run('Tilt._tap()'); await espera();
  assert.equal(b.run('localStorage.getItem("swole.tilt")'), 'denied');
  assert.equal(b.run('Tilt.needsButton()'), true);
});

test('el ángulo se reparte a quien escucha, en -1…1; con "reducir movimiento" no se mueve', () => {
  const { run } = app();
  run('globalThis.__v=null;Tilt.on((x,y)=>{__v=[x,y];});Tilt._ori({beta:57.5,gamma:-12.5});');
  assert.equal(run('JSON.stringify(__v)'), '[-0.5,0.5]');
  run('Tilt._ori({beta:200,gamma:90});');
  assert.equal(run('JSON.stringify(__v)'), '[1,1]');
  const q = app({ quieto: true });
  q.run('globalThis.__v=null;Tilt.on((x,y)=>{__v=[x,y];});Tilt._ori({beta:80,gamma:20});');
  assert.equal(q.run('JSON.stringify(__v)'), '[0,0]');
});
