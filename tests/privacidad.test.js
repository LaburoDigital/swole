'use strict';
/* Etapa 4: edad mínima, casilla de términos y pantallas de seguridad. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { appConPerfil } = require('./cargar.js');

const conEdad = age => appConPerfil({ age });

test('edad: menos de 13 no puede tener cuenta ni amigos; 13 a 17 es menor', () => {
  for (const [age, joven, teen] of [[10, true, false], [12, true, false], [13, false, true], [17, false, true], [18, false, false], [40, false, false]]) {
    const { g } = conEdad(age);
    assert.equal(g('tooYoung()'), joven, 'tooYoung a los ' + age);
    assert.equal(g('isTeen()'), teen, 'isTeen a los ' + age);
  }
  /* sin perfil todavía (entró directo a crear cuenta): no se bloquea, decide la casilla */
  const { g, ctx } = conEdad(20);
  vm.runInContext('db.profile = null', ctx);
  assert.equal(g('tooYoung()'), false);
});

function intentarRegistro(age, ok) {
  const { g, ctx } = conEdad(age);
  const toasts = [];
  vm.runInContext('toast = m => __t.push(m); renderModal = () => {};', Object.assign(ctx, { __t: toasts }));
  vm.runInContext(`S.m2 = {t:'login', d:{mode:'up', email:'a@b.co', pw:'123456', ok:${ok}}}; Sync.loginGo();`, ctx);
  return { toasts, busy: g('S.m2.d.busy') };
}

test('crear cuenta exige la casilla de edad y términos', () => {
  const r = intentarRegistro(25, false);
  assert.match(r.toasts[0] || '', /casilla/);
  assert.ok(!r.busy, 'no tiene que mandar nada');
});

test('crear cuenta con menos de 13 se frena aunque marque la casilla', () => {
  const r = intentarRegistro(11, true);
  assert.match(r.toasts[0] || '', /13 años/);
  assert.ok(!r.busy);
});

test('con la casilla y 13+ sí intenta crear la cuenta', () => {
  const r = intentarRegistro(14, true);
  assert.equal(r.toasts.length, 0);
  assert.equal(r.busy, true);
});

test('la hoja de registro enlaza términos y privacidad; la de entrar no pide casilla', () => {
  const { g } = conEdad(15);
  const up = g(`loginHTML({mode:'up',email:'',pw:''})`);
  assert.match(up, /info\/terminos\.html/);
  assert.match(up, /info\/privacidad\.html/);
  assert.match(up, /data-a="termsTog"/);
  assert.doesNotMatch(g(`loginHTML({mode:'in',email:'',pw:''})`), /termsTog/);
});

test('las páginas legales existen y se enlazan entre sí', () => {
  const fs = require('node:fs'), path = require('node:path'), raiz = path.join(__dirname, '..');
  const t = fs.readFileSync(path.join(raiz, 'info/terminos.html'), 'utf8');
  const p = fs.readFileSync(path.join(raiz, 'info/privacidad.html'), 'utf8');
  assert.match(t, /href="privacidad\.html"/);
  assert.match(p, /href="terminos\.html"/);
  assert.match(t, /13 años o más/);
  assert.match(p, /13 años o más/);
});

test('denuncia, opciones y bloqueados se dibujan sin romperse', () => {
  const { g, ctx } = conEdad(15);
  vm.runInContext(`S.social = {friends:[{user_id:'u1',nick:'Ana'}], me:null, req:[], comps:[]}`, ctx);
  const op = g(`socUserHTML({id:'u1',nick:'Ana',ctx:'comment|c1'})`);
  assert.match(op, /Sacar de amigos/);
  assert.match(op, /Bloquear/);
  assert.match(op, /Denunciar este comentario/);
  const rep = g(`reportHTML({target:'u1',nick:'Ana',kind:'comment',reason:'acoso',note:'',blk:true})`);
  assert.match(rep, /aria-pressed="true"/);
  assert.match(rep, /adulto de confianza/, 'a un menor le sugiere hablar con un adulto');
  assert.match(g(`blockedHTML({list:[]})`), /No bloqueaste a nadie/);
  assert.match(g(`blockedHTML({list:[{user_id:'u2',nick:'X',created_at:'2026-11-20T00:00:00Z'}]})`), /Desbloquear/);
});
