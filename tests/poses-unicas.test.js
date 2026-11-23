'use strict';
/* SW-7: cada ejercicio tiene su propio dibujo. Dos ejercicios no pueden mostrar exactamente la misma figura
   (mismas posiciones A y B y mismo equipo), salvo las variantes justificadas de la lista de abajo. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { appConPerfil } = require('./cargar.js');

const { g } = appConPerfil();
const EX = g('EX'), TECH = g('TECH'), techOf = g('techOf');

/* Variantes que pueden compartir figura, cada una con su motivo. Hoy no hay ninguna.
   Formato: 'idA=idB': 'por qué se ven igual' */
const VARIANTES_JUSTIFICADAS = {};

const firma = k => { const T = TECH[k]; return JSON.stringify([T.A, Object.assign({}, T.A, T.B), T.eq, !!T.front]); };

test('ningún par de ejercicios comparte exactamente la misma figura', () => {
  const por = {};
  for (const e of EX) { const k = techOf(e); assert.ok(TECH[k], e.id + ' sin figura'); (por[firma(k)] = por[firma(k)] || []).push(e.id); }
  const repetidos = [];
  for (const ids of Object.values(por)) for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
    const par = ids[i] + '=' + ids[j], par2 = ids[j] + '=' + ids[i];
    if (!VARIANTES_JUSTIFICADAS[par] && !VARIANTES_JUSTIFICADAS[par2]) repetidos.push(par);
  }
  assert.deepEqual(repetidos, [], 'figuras repetidas: ' + repetidos.join(', '));
});

test('las variantes justificadas existen y de verdad comparten figura', () => {
  for (const par of Object.keys(VARIANTES_JUSTIFICADAS)) {
    const [a, b] = par.split('=').map(id => EX.find(e => e.id === id));
    assert.ok(a && b, 'variante con id que no existe: ' + par);
    assert.equal(firma(techOf(a)), firma(techOf(b)), 'la variante ya no comparte figura, sacala de la lista: ' + par);
  }
});
