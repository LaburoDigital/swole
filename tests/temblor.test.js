'use strict';
/* SW-10 (temblor-raiz.md, tercera vez que Juan lo reporta): al scrollear, lo pegado arriba temblaba y, al tocar Nivel, la barra
   de abajo quedaba en el medio y el encabezado se iba de la pantalla.
   Causa A: el encabezado y el segmento eran dos stickies separados, con un alto medido con decimales (hueco de 1 px que iba y venía).
   Causa B: scrolleaba la ventana y la app la movía por código (scrollTo al cambiar de pestaña, body fijo con las hojas): en iOS eso
   desalinea los elementos fijos.
   Arreglo de raíz: cáscara fija (html y body quietos), un único #scroller, la cabecera como bloque con el segmento adentro y la barra
   de abajo como un hijo más. Estas pruebas fallan si alguna de esas piezas vuelve. */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { cargarApp, RAIZ } = require('./cargar.js');

const leer = f => fs.readFileSync(path.join(RAIZ, f), 'utf8');
const JS = fs.readdirSync(path.join(RAIZ, 'js')).filter(f => f.endsWith('.js')).map(f => ['js/' + f, leer('js/' + f)]);
const CSS = leer('app.css'), HTML = leer('index.html');

/* reglas del css: [selectores, declaraciones] (sin comentarios; las de @media también cuentan) */
function reglas(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [], re = /([^{}]+)\{([^{}]*)\}/g; let m;
  while ((m = re.exec(css))) out.push([m[1].trim(), m[2]]);
  return out;
}
/* el sujeto de un selector es su último compuesto: en ".top .mark" el sujeto es .mark */
const sujeto = sel => sel.trim().split(/\s+|>|\+|~/).filter(Boolean).pop() || '';

test('temblor (estático): ningún código mueve el scroll de la ventana ni fija el body', () => {
  for (const [f, src] of JS) {
    assert.doesNotMatch(src, /window\.scroll(To|By)\s*\(/, f + ': mueve el scroll de la ventana (usá SC(), el contenedor)');
    assert.doesNotMatch(src, /window\.scrollY|pageYOffset/, f + ': lee el scroll de la ventana (usá SC().scrollTop)');
    assert.doesNotMatch(src, /position\s*:\s*['"]fixed['"]/, f + ': fija el body por código (lockScroll ya no lo hace)');
    assert.doesNotMatch(src, /function vpFix|vpFixSoon\(/, f + ': volvió vpFix (con la ventana quieta no hay nada que realinear)');
  }
});

test('temblor (estático): .top y .nav no son fixed ni sticky; html y body no scrollean', () => {
  for (const [sel, decl] of reglas(CSS)) for (const s of sel.split(',')) {
    const suj = sujeto(s);
    if (/\.(top|nav)(?![\w-])/.test(suj)) assert.doesNotMatch(decl, /position\s*:\s*(fixed|sticky)/, '"' + s.trim() + '" vuelve a ser fixed o sticky');
    if (/\.(zone-seg|nv-seg)(?![\w-])/.test(suj)) assert.doesNotMatch(decl, /position\s*:\s*sticky/, '"' + s.trim() + '": el segmento no es un segundo sticky (va en la cabecera)');
  }
  assert.ok(reglas(CSS).some(([sel, d]) => /(^|,)\s*html\s*,\s*body\s*(,|$)/.test(sel) && /overflow\s*:\s*hidden/.test(d)), 'html y body con overflow:hidden');
  assert.ok(reglas(CSS).some(([sel, d]) => /#scroller/.test(sel) && /overflow-y\s*:\s*auto/.test(d)), '#scroller es el que scrollea');
  assert.doesNotMatch(CSS.replace(/\/\*[\s\S]*?\*\//g, ''), /--toph/, 'ya no hay un alto medido para pegar el segmento');
  /* la zona del reloj y la del indicador de inicio las rellenan .cab y .nav: si :root también las suma, se duplican y la barra
     queda sobre el indicador (diseno-cascara.md, A1). Vale la última declaración de :root */
  const ult = k => { let v = null; for (const [sel, d] of reglas(CSS)) if (sel === ':root') { const m = d.match(new RegExp(k + '\\s*:\\s*([^;]+)')); if (m) v = m[1].trim(); } return v; };
  assert.equal(ult('padding-top'), '0', ':root sin relleno arriba');
  assert.equal(ult('padding-bottom'), '0', ':root sin relleno abajo');
  /* el espacio para la píldora y el descanso se mide al dibujarlos (Chrome no recalcula :has(:empty) al vaciarse; qa-cascara.md) */
  assert.doesNotMatch(CSS.replace(/\/\*[\s\S]*?\*\//g, ''), /:has\([^)]*:empty/, 'sin :has(:empty) para el espacio del dock');
  const pant = JS.find(([f]) => f === 'js/pantallas.js')[1];
  for (const fn of ['renderPill', 'renderRest']) { const i = pant.indexOf('function ' + fn + '('), j = pant.indexOf('\n}', i); assert.match(pant.slice(i, j), /ajustaDock\(\)/, fn + ' ajusta el espacio del dock'); }
});

test('temblor (estructura): la cabecera es un bloque arriba con el segmento adentro, el contenido en #scroller y la barra abajo', () => {
  const i = k => HTML.indexOf(k);
  assert.ok(i('id="app"') > 0 && i('id="cab"') > i('id="app"'), 'la cabecera está dentro de #app');
  assert.ok(i('<header class="top"') > i('id="cab"') && i('id="topSeg"') > i('<header class="top"') && i('id="topSeg"') < i('id="scroller"'), 'el encabezado y el lugar del segmento van dentro del bloque de cabecera');
  assert.ok(i('id="view"') > i('id="scroller"') && i('id="nav"') > i('id="view"'), 'el contenido va en #scroller y la barra después');
  /* después de cada render el segmento de Entrenar o de Nivel pasa al bloque de cabecera */
  const pant = JS.find(([f]) => f === 'js/pantallas.js')[1];
  assert.match(pant, /function syncTopSeg\(v\)\{[^]*?querySelector\('\.zone-seg,\.nv-seg'\)[^]*?appendChild\(seg\)/);
  assert.match(pant, /v\.innerHTML=VIEWS\[S\.tab\]\(\);\},changed\);syncTopSeg\(v\);/);
});

function app() {
  const ev = { vv: {}, win: {} }, on = m => (t, f) => { (m[t] = m[t] || []).push(f); };
  const llamadas = { scrollTo: 0 }, timers = [];
  const vv = { height: 800, width: 400, offsetTop: 0, offsetLeft: 0, addEventListener: on(ev.vv) };
  const sc = { style: {}, scrollTop: 300, scrollTo() {}, addEventListener() {}, getBoundingClientRect: () => ({ top: 0, bottom: 700 }), attrs: {}, toggleAttribute(k, v) { this.attrs[k] = v; } };
  const a = cargarApp({ antes(sb) {
    sb.visualViewport = vv; sb.innerHeight = 800;
    sb.setTimeout = f => { timers.push(f); return timers.length; };
    sb.scrollTo = () => { llamadas.scrollTo++; };
    sb.addEventListener = on(ev.win);
    sb.document.getElementById = id => id === 'scroller' ? sc : sb.document.querySelector();
    sb.document.documentElement.classList.contains = () => false;
  } });
  const fire = (m, t) => (m[t] || []).forEach(f => f({ type: t }));
  const correr = () => { for (let i = 0; i < 50 && timers.length; i++) timers.splice(0).forEach(f => { try { f(); } catch (e) {} }); };
  return { a, vv, ev, fire, correr, llamadas, sc };
}

test('temblor: el teclado, la inercia y volver de segundo plano nunca mueven la ventana', () => {
  const { vv, ev, fire, correr, llamadas } = app();
  for (let i = 0; i < 30; i++) { vv.offsetTop = 2 + (i % 5); fire(ev.vv, 'scroll'); }
  vv.height = 450; fire(ev.vv, 'resize'); vv.height = 800; vv.offsetTop = 3; fire(ev.vv, 'resize');
  fire(ev.win, 'pageshow'); fire(ev.win, 'orientationchange');
  correr();
  assert.equal(llamadas.scrollTo, 0);
});

test('temblor: abrir y cerrar una hoja no fija el body ni mueve la ventana; el contenido de atrás queda sin scroll', () => {
  const { a, correr, llamadas, sc } = app();
  const lock = a.g('lockScroll');
  lock(true); assert.equal(sc.attrs.inert, true, 'con la hoja abierta el contenido de atrás no se toca');
  lock(false); assert.equal(sc.attrs.inert, false);
  correr();
  assert.equal(llamadas.scrollTo, 0);
  assert.notEqual(String(a.g('document.body.style.position')), 'fixed');
});

test('temblor: cambiar de pestaña lleva arriba el contenedor, no la ventana', () => {
  const { a, llamadas, sc, correr } = app();
  sc.scrollTop = 500; a.g('ACTIONS').etab('cal'); assert.equal(sc.scrollTop, 0);
  /* en iOS, para frenar la inercia que seguía, el scroll se corta un instante y después se devuelve */
  assert.equal(sc.style.overflowY, 'hidden'); correr(); assert.equal(sc.style.overflowY, '');
  sc.scrollTop = 500; a.g('ACTIONS').ntab('ej'); assert.equal(sc.scrollTop, 0);
  assert.equal(llamadas.scrollTo, 0);
});

test('temblor: "scrolled" tiene margen respecto del borde de la cabecera (no va y viene)', () => {
  const { a } = app(), sig = a.g('topScrolled');
  for (const borde of [64, 118]) {     /* con y sin segmento en la cabecera */
    let s = false; const cambios = [];
    for (const d of [16, 6, -4, -7, -9, -6, -1, 2, -3, 1, 6, 8, 9, 16]) { const n = sig(s, borde + d, borde); if (n !== s) cambios.push(d); s = n; }
    assert.deepEqual(cambios, [-9, 9], 'cerca del borde (±8) no va y viene');
  }
});
