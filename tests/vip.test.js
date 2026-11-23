'use strict';
/* SW-6: cuenta VIP (app_metadata.vip en el servidor) → colores Oro y Élite desbloqueados. */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { cargarApp } = require('./cargar.js');

const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const jwt = claims => b64u({ alg: 'HS256', typ: 'JWT' }) + '.' + b64u(Object.assign({ sub: 'u1', exp: 4e9 }, claims)) + '.firma';

/* sesion: null = sin cuenta; si no, { user, token } guardados como los guarda Sync */
function app(sesion) {
  const a = cargarApp({
    antes(s) {
      if (sesion) s.localStorage.setItem('swole.auth', JSON.stringify({ access_token: sesion.token, refresh_token: 'r', expires_at: 4e9, user: sesion.user }));
    },
  });
  const run = c => vm.runInContext(c, a.ctx);
  run('db.profile={sex:"m",age:25,height:178,weight:75,goal:"recomp",nick:"x",sports:[],week:{},activity:"auto"};db.settings.frCount=0;S.social=null;');
  return run;
}
const bloqueados = run => JSON.parse(run('JSON.stringify(ACCENTS.filter(a=>a[4]&&!isVip()&&frCount()<a[4]).map(a=>a[0]))'));

test('sin cuenta: no es VIP y Oro/Élite siguen bloqueados (como hoy)', () => {
  const run = app(null);
  assert.equal(run('isVip()'), false);
  assert.equal(JSON.stringify(bloqueados(run)), '["oro","elite"]');
  run('globalThis.__t=[];toast=m=>__t.push(m);ACTIONS.accent("oro")');
  assert.match(run('__t.join("|")'), /Se desbloquea con 1 amigo/);
  assert.notEqual(run('db.settings.accent'), 'oro');
});

test('cuenta sin la marca: no es VIP', () => {
  const run = app({ user: { id: 'u1', email: 'a@b.c', app_metadata: { provider: 'email' } }, token: jwt({ app_metadata: { provider: 'email' } }) });
  assert.equal(run('isVip()'), false);
  assert.equal(bloqueados(run).length, 2);
});

test('cuenta VIP (marca en el usuario de la sesión): Oro y Élite desbloqueados', () => {
  const run = app({ user: { id: 'u1', email: 'a@b.c', app_metadata: { vip: true } }, token: jwt({ app_metadata: { vip: true } }) });
  assert.equal(run('isVip()'), true);
  assert.equal(bloqueados(run).length, 0);
  run('globalThis.__t=[];toast=m=>__t.push(m);ACTIONS.accent("elite")');
  assert.ok(!/Se desbloquea/.test(run('__t.join("|")')));
});

test('sesión vieja guardada sin app_metadata: lo toma del token', () => {
  const run = app({ user: { id: 'u1', email: 'a@b.c' }, token: jwt({ app_metadata: { vip: true } }) });
  assert.equal(run('isVip()'), true);
  const run2 = app({ user: { id: 'u1', email: 'a@b.c' }, token: jwt({ app_metadata: {} }) });
  assert.equal(run2('isVip()'), false);
});

test('la marca tiene que ser true de verdad; un token roto no rompe nada', () => {
  assert.equal(app({ user: { id: 'u1', app_metadata: { vip: 'si' } }, token: jwt({ app_metadata: { vip: 'si' } }) })('isVip()'), false);
  assert.equal(app({ user: { id: 'u1' }, token: 'esto.no-es-un.token' })('isVip()'), false);
});

test('el código no nombra a nadie ni tiene mails', () => {
  const fs = require('fs'), path = require('path');
  const { RAIZ } = require('./cargar.js');
  for (const f of fs.readdirSync(path.join(RAIZ, 'js'))) {
    const c = fs.readFileSync(path.join(RAIZ, 'js', f), 'utf8');
    assert.ok(!/@gmail\.com/i.test(c), f + ' tiene un mail');
  }
});
