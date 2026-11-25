'use strict';
/* SW-10 (juan-4.md, bug repetido de SW-4): al scrollear en Ejercicios, Entrenar y Nivel, lo pegado arriba temblaba en el iPhone.
   Causa: el scroll de visualViewport (con offsetTop > 1 durante la inercia o el rebote de iOS) llamaba a vpFix, que hace
   window.scrollTo y corta la inercia; y "scrolled" iba y venía con un solo umbral.
   Acá se carga la app con un visualViewport, un reloj y temporizadores de mentira, y se mira cuándo se llama a scrollTo. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { cargarApp } = require('./cargar.js');

function appConViewport() {
  const ev = { vv: {}, win: {}, doc: {} }, on = (m) => (t, f) => { (m[t] = m[t] || []).push(f); };
  const reloj = { t: 1000 }, timers = [], llamadas = { scrollTo: 0 };
  const vv = { height: 800, width: 400, offsetTop: 0, offsetLeft: 0, addEventListener: on(ev.vv) };
  const app = cargarApp({ antes(sb) {
    sb.visualViewport = vv;
    sb.innerHeight = 800;
    sb.performance = { now: () => reloj.t };
    sb.setTimeout = (f, ms) => { timers.push({ f, at: reloj.t + (ms || 0) }); return timers.length; };
    sb.clearTimeout = (id) => { if (timers[id - 1]) timers[id - 1].f = null; };
    sb.scrollTo = () => { llamadas.scrollTo++; };
    sb.scrollX = 0; sb.scrollY = 500;
    sb.addEventListener = on(ev.win);
    sb.document.addEventListener = on(ev.doc);
    sb.document.documentElement.classList.contains = () => false; /* sin teclado abierto ni pantalla trabada */
    sb.document.activeElement = { tagName: 'BODY' };
  } });
  const fire = (m, t, e) => (m[t] || []).forEach(f => f(Object.assign({ type: t }, e || {})));
  /* avanza el reloj y corre los temporizadores que vencen (y los que esos agenden) */
  const pasar = (ms) => { const fin = reloj.t + ms; for (;;) { const i = timers.findIndex(x => x.f && x.at <= fin); if (i < 0) break; const x = timers[i]; reloj.t = Math.max(reloj.t, x.at); const f = x.f; x.f = null; f(); } reloj.t = fin; };
  return { app, vv, ev, fire, pasar, llamadas, reloj };
}

test('temblor: el scroll de visualViewport con offsetTop > 1 (inercia de iOS) no llama a scrollTo', () => {
  const { vv, ev, fire, pasar, llamadas } = appConViewport();
  assert.ok((ev.vv.scroll || []).length, 'la app escucha el scroll de visualViewport (para el teclado)');
  for (let i = 0; i < 30; i++) {           /* 30 cuadros de scroll con inercia: la página y visualViewport se mueven */
    vv.offsetTop = 2 + (i % 5);
    fire(ev.win, 'scroll'); fire(ev.vv, 'scroll');
    pasar(16);
  }
  pasar(2000);                              /* ya quieto: tampoco después (no quedó nada agendado desde el scroll) */
  assert.equal(llamadas.scrollTo, 0, 'scrollTo corta la inercia y hace saltar lo pegado arriba');
});

test('temblor: vpFix nunca toca el scroll mientras el usuario scrollea; espera a que termine', () => {
  const { app, ev, fire, pasar, llamadas } = appConViewport();
  app.g('vpFixSoon')();                     /* p. ej. se cerró el teclado justo mientras scrolleaba */
  for (let i = 0; i < 40; i++) { fire(ev.doc, 'touchmove'); fire(ev.win, 'scroll'); pasar(16); }
  assert.equal(llamadas.scrollTo, 0, 'durante el scroll no se llama a scrollTo');
  pasar(2000);
  assert.ok(llamadas.scrollTo > 0, 'cuando el scroll termina, vpFix sí realinea (lo que arregló SW-4 sigue andando)');
});

test('temblor: al cerrar el teclado (sin scroll) vpFix sigue realineando la pantalla', () => {
  const { vv, ev, fire, pasar, llamadas } = appConViewport();
  vv.height = 450; fire(ev.vv, 'resize');   /* teclado abierto */
  vv.height = 800; vv.offsetTop = 3; fire(ev.vv, 'resize');   /* se cierra y iOS deja la vista corrida */
  pasar(1000);
  assert.ok(llamadas.scrollTo > 0);
});

test('temblor: "scrolled" tiene margen (entra por debajo de 56 y sale recién por encima de 72)', () => {
  const { app } = appConViewport(), sig = app.g('topScrolled');
  let s = false; const cambios = [];
  for (const b of [80, 70, 60, 57, 55, 58, 63, 66, 61, 65, 70, 72, 73, 80]) { const n = sig(s, b); if (n !== s) cambios.push(b); s = n; }
  assert.deepEqual(cambios, [55, 73], 'cerca del borde (55–72) no va y viene');
});
