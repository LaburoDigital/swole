'use strict';
/* Todo lo que sw.js guarda para abrir sin internet (CORE) y las fotos (PICS) tiene que existir en el repo:
   si falta uno, la instalación del service worker falla entera (addAll) y la app deja de andar sin conexión. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { RAIZ } = require('./cargar.js');

function listasDelSW() {
  const s = { self: { addEventListener() {} }, URL };
  vm.createContext(s);
  vm.runInContext(fs.readFileSync(path.join(RAIZ, 'sw.js'), 'utf8') + ';globalThis.__L={CORE,PICS};', s);
  return s.__L;
}
const aDisco = u => (u.split('?')[0].replace(/^\.\//, '') || 'index.html');

test('sw.js: existen todos los archivos de CORE y PICS', () => {
  const { CORE, PICS } = listasDelSW();
  assert.ok(CORE.length >= 10 && PICS.length >= 10);
  const faltan = CORE.concat(PICS).map(aDisco).filter(f => !fs.existsSync(path.join(RAIZ, f)));
  assert.equal(faltan.length, 0, 'faltan en el repo: ' + faltan.join(', '));
});
