'use strict';
/* ============ Sincronización con Supabase ============ */
/* o.remoteFirst: primera vez que este celu se une con la cuenta (instalación nueva): lo que se eligió en la
   bienvenida antes de entrar no pisa el perfil, el calendario ni los ajustes que ya estaban en la nube. */
function mergeDb(L,R,o){
  const cl={},dl={},clone=x=>x==null?x:JSON.parse(JSON.stringify(x));
  [L.clock,R.clock].forEach(o=>{for(const k in o)cl[k]=Math.max(cl[k]||0,+o[k]||0);});
  [L.del,R.del].forEach(o=>{for(const k in o)dl[k]=Math.max(dl[k]||0,+o[k]||0);});
  /* elige entre la versión local (a) y la remota (b) de una clave */
  const pick=(k,a,b)=>{
    const ta=a!==undefined?(L.clock[k]||0):-1,tb=b!==undefined?(R.clock[k]||0):-1;
    const v=tb>ta?b:(a!==undefined?a:b),t=Math.max(ta,tb),d=dl[k]||0;
    return d&&d>=t?undefined:clone(v);
  };
  const out=normalize(clone(L));
  for(const c in SYNC_COLL){
    const key=SYNC_COLL[c],la=new Map(),ra=new Map();
    (L[c]||[]).forEach(x=>la.set(String(x[key]),x));(R[c]||[]).forEach(x=>ra.set(String(x[key]),x));
    const ids=[...la.keys()];ra.forEach((_,id)=>{if(!la.has(id))ids.push(id);});
    out[c]=ids.map(id=>pick(c+':'+id,la.get(id),ra.get(id))).filter(x=>x!==undefined);
  }
  SYNC_MAP.forEach(c=>{
    const m={},ks=new Set(Object.keys(L[c]||{}).concat(Object.keys(R[c]||{})));
    ks.forEach(k=>{const v=pick(c+':'+k,(L[c]||{})[k],(R[c]||{})[k]);if(v!==undefined)m[k]=v;});
    out[c]=m;
  });
  const empty=v=>v==null||(typeof v==='object'&&!Object.keys(v).length);
  /* El reloj de un campo es el suyo o, si todavía no tiene (datos de antes de este cambio, u otro celu con la versión vieja), el del bloque entero. */
  const ck=(D,k,c)=>Math.max(+D.clock[k]||0,+D.clock[c]||0);
  SYNC_FIELDS.forEach(c=>{
    const A=L[c]&&typeof L[c]==='object'?L[c]:null,B=R[c]&&typeof R[c]==='object'?R[c]:null;
    if(!A&&!B){out[c]=c==='profile'?null:{};return;}
    if(o&&o.remoteFirst&&B&&c!=='settings'&&Object.keys(B).length){out[c]=clone(B);return;}
    const m={},ks=new Set(Object.keys(A||{}).concat(Object.keys(B||{})));
    ks.forEach(f=>{
      const a=A?A[f]:undefined,b=B?B[f]:undefined;
      /* lo que es de este dispositivo no se toca */
      if(c==='settings'&&LOCAL_SET.includes(f)){if(a!==undefined)m[f]=clone(a);return;}
      const k=c+':'+f,ta=a!==undefined?ck(L,k,c):-1,tb=b!==undefined?ck(R,k,c):-1,d=dl[k]||0;
      /* empate (datos de antes de sincronizar): gana la nube, salvo que venga vacía */
      const v=tb>ta||(tb===ta||o&&o.remoteFirst)&&b!==undefined&&!empty(b)?b:(a!==undefined?a:b);
      if(v!==undefined&&!(d&&d>=Math.max(ta,tb)))m[f]=clone(v);
    });
    out[c]=c==='profile'&&!Object.keys(m).length?null:m;
  });
  out.settings=normalize({settings:out.settings}).settings;
  /* los borrados de hace más de un año ya no hacen falta */
  const old=Date.now()-365*864e5;for(const k in dl)if(dl[k]<old)delete dl[k];
  out.clock=cl;out.del=dl;out.active=L.active;
  return out;
}
const syncPayload=d=>{const o=Object.assign({},d);delete o.active;o.settings=Object.assign({},d.settings);LOCAL_SET.forEach(f=>{delete o.settings[f];});return o;};
/* misma información = misma firma, aunque cada celu la tenga guardada en otro orden (si no, cada sincronización reescribía la nube sin que hubiera nada nuevo) */
const syncSig=d=>{const p=syncPayload(d),o={};Object.keys(p).forEach(k=>{o[k]=p[k];});
  for(const c in SYNC_COLL){const key=SYNC_COLL[c];o[c]=(Array.isArray(p[c])?p[c]:[]).slice().sort((a,b)=>String(a&&a[key])<String(b&&b[key])?-1:1);}
  return JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((r,x)=>{r[x]=v[x];return r;},{}):v);};

const Sync=(()=>{
  const URL_='https://couuuvckplstgksanzgr.supabase.co',KEY='sb_publishable_labsOx_gAy1Njn6mHAuhuw_jWBRPkgB',AK='swole.auth';
  let sess=null,refreshing=null,timer=null,running=false,again=false,pendingRender=false;
  const st={s:'idle',at:0,msg:''};
  const OW='swole.owner',owner=()=>{try{return localStorage.getItem(OW);}catch(e){return null;}},setOwner=u=>{try{localStorage.setItem(OW,u);}catch(e){}};
  try{sess=JSON.parse(localStorage.getItem(AK)||'null');}catch(e){}
  /* celus que ya estaban conectados antes de este cambio: sus datos son de esa cuenta */
  if(sess&&sess.user&&!owner())setOwner(sess.user.id);
  const keep=()=>{try{sess?localStorage.setItem(AK,JSON.stringify(sess)):localStorage.removeItem(AK);}catch(e){}};
  const setSess=j=>{
    if(!j||!j.access_token)throw new Error('Respuesta inválida');
    sess={access_token:j.access_token,refresh_token:j.refresh_token,expires_at:j.expires_at||Math.floor(Date.now()/1000)+(j.expires_in||3600),user:{id:j.user.id,email:j.user.email,app_metadata:j.user.app_metadata||{}}};
    keep();
  };
  async function req(path,o){
    o=o||{};
    const h=Object.assign({apikey:KEY,'Content-Type':'application/json'},o.headers||{});
    if(o.auth)h.Authorization='Bearer '+await token();
    const r=await fetch(URL_+path,{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined});
    const txt=await r.text();let j=null;try{j=txt?JSON.parse(txt):null;}catch(e){}
    if(!r.ok){const e=new Error((j&&(j.msg||j.message||j.error_description||j.error))||('Error '+r.status));e.status=r.status;e.code=j&&(j.error_code||j.code);throw e;}
    return j;
  }
  async function token(){
    if(!sess)throw Object.assign(new Error('Sin sesión'),{status:401});
    if(sess.expires_at*1000-60000>Date.now())return sess.access_token;
    if(!refreshing)refreshing=(async()=>{
      try{
        try{setSess(await req('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:sess.refresh_token}}));}
        catch(e){
          /* otra pestaña puede haber renovado la sesión: la releo y pruebo de nuevo */
          let s2=null;try{s2=JSON.parse(localStorage.getItem(AK)||'null');}catch(_){}
          if(s2&&s2.refresh_token!==sess.refresh_token&&s2.expires_at*1000-60000>Date.now()){sess=s2;return;}
          if(e.status>=400&&e.status<500){sess=null;keep();toast('Tu sesión venció: volvé a entrar para sincronizar');}
          throw e;
        }
      }finally{refreshing=null;}
    })();
    await refreshing;
    return sess.access_token;
  }
  const typing=()=>document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
  /* actualiza el estado en el perfil sin romper lo que se esté escribiendo */
  function paint(){if(!$('#syncTxt')||S.m2||typing())return;if(S.modal&&S.modal.t==='profile')renderModal();else if(S.tab==='perfil'&&!S.modal)render();}
  const set=(s,msg)=>{st.s=s;st.msg=msg||'';if(s==='ok')st.at=Date.now();paint();};
  function applyRemote(merged){
    const before=JSON.stringify(syncPayload(db));
    merged.active=db.active;db=merged;snap=syncKeys(db);Store.save(db);
    if(JSON.stringify(syncPayload(db))===before)return false;
    if(typing())pendingRender=true;else render();
    return true;
  }
  async function run(manual){
    if(!sess)return;
    if(running){again=true;return;}
    if(!navigator.onLine){set('off');return;}
    running=true;clearTimeout(timer);set('busy');
    try{
      const uid=sess.user.id,ow=owner(),first=ow!==uid;
      /* los datos de este celu son de OTRA cuenta: no se mezclan (esa cuenta ya los tiene en su nube) */
      if(ow&&first){const keep={};['theme','accent','big'].forEach(f=>{if(db.settings[f]!==undefined)keep[f]=db.settings[f];});
        db=normalize({settings:keep});snap=syncKeys(db);Store.save(db);setOwner(uid);render();}
      for(let i=0;i<4;i++){
        const rows=await req('/rest/v1/swole_data?select=data,rev&user_id=eq.'+uid,{auth:true});
        const row=rows&&rows[0];
        if(row)applyRemote(mergeDb(db,normalize(row.data),{remoteFirst:first}));
        const data=syncPayload(db);
        if(!row){
          try{await req('/rest/v1/swole_data',{method:'POST',auth:true,headers:{Prefer:'return=minimal'},body:{user_id:uid,data}});break;}
          catch(e){if(e.status===409)continue;throw e;}
        }
        if(syncSig(db)===syncSig(normalize(row.data)))break;
        /* solo escribe si nadie más escribió desde que leí (rev igual); si no, vuelvo a unir */
        const up=await req('/rest/v1/swole_data?user_id=eq.'+uid+'&rev=eq.'+row.rev,{method:'PATCH',auth:true,headers:{Prefer:'return=representation'},body:{data}});
        if(up&&up.length)break;
      }
      setOwner(uid);set('ok');if(manual)toast('Todo sincronizado');
    }catch(e){
      if(!sess){set('idle');}
      else if(!navigator.onLine||e instanceof TypeError)set('off');
      else{set('err',e.message);if(manual)toast('No se pudo sincronizar: '+e.message);}
    }finally{
      running=false;
      if(again){again=false;schedule(500);}
    }
  }
  function schedule(ms){if(!sess)return;clearTimeout(timer);timer=setTimeout(()=>run(false),ms==null?2500:ms);}
  const redir=()=>/^https?:$/.test(location.protocol)?'?redirect_to='+encodeURIComponent(location.origin+location.pathname):'';
  function authMsg(e){
    const m=String(e.message||''),c=e.code||'';
    if(c==='invalid_credentials'||/invalid login/i.test(m))return 'Email o contraseña incorrectos. Si es tu primera vez, tocá Crear cuenta';
    if(c==='email_not_confirmed'||/not confirmed/i.test(m))return 'Primero confirmá tu email con el link que te mandamos';
    if(c==='user_already_exists'||/already registered/i.test(m))return 'Ese email ya tiene cuenta: entrá con tu contraseña';
    if(c==='weak_password'||/password should/i.test(m))return 'La contraseña tiene que tener al menos 6 caracteres';
    if(c==='same_password')return 'Elegí una contraseña distinta a la anterior';
    if(e.status===429||/rate limit/i.test(m))return 'Muchos intentos: esperá un rato y probá de nuevo';
    if(/sending.*email|email.*send|smtp/i.test(m))return 'No pudimos mandarte el email. Probá de nuevo en un rato';
    if(e instanceof TypeError)return 'Sin conexión a internet';
    return m||'Algo falló';
  }
  async function loginGo(){
    const d=S.m2&&S.m2.d;if(!d||d.busy)return;
    const email=(d.email||'').trim().toLowerCase(),pw=d.pw||'';
    if(d.mode!=='newpw'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return toast('Revisá el email');
    if(d.mode==='up'&&tooYoung())return toast('Para crear una cuenta tenés que tener '+MIN_AGE+' años o más. Podés seguir usando Swole en este dispositivo sin cuenta.');
    if(d.mode==='up'&&!d.ok)return toast('Marcá la casilla de edad y términos para seguir');
    if(d.mode!=='forgot'&&d.mode!=='resend'&&pw.length<6)return toast('La contraseña tiene que tener al menos 6 caracteres');
    d.email=d.mode==='newpw'?d.email:email;d.busy=true;renderModal();
    try{
      if(d.mode==='in'){
        try{setSess(await req('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password:pw}}));}
        catch(e){if(e.code==='email_not_confirmed'||/not confirmed/i.test(e.message))d.unconf=true;throw e;}
        d.busy=false;return afterLogin();
      }
      if(d.mode==='resend'){
        await req('/auth/v1/resend'+redir(),{method:'POST',body:{type:'signup',email}});
        d.mode='sent';d.unconf=false;d.msg='Te mandamos de nuevo el email de confirmación a '+email+'. Tocá el link y después entrá acá.';
      }else
      if(d.mode==='up'){
        const j=await req('/auth/v1/signup'+redir(),{method:'POST',body:{email,password:pw}});
        if(j&&j.access_token){setSess(j);d.busy=false;return afterLogin();}
        /* Supabase no avisa si el email ya existía: devuelve un usuario sin identidades */
        if(j&&Array.isArray(j.identities)&&!j.identities.length)throw Object.assign(new Error('x'),{code:'user_already_exists'});
        d.mode='sent';d.msg='Te mandamos un email a '+email+' para confirmar la cuenta. Tocá el link y después entrá acá con tu contraseña.';
      }else if(d.mode==='forgot'){
        await req('/auth/v1/recover'+redir(),{method:'POST',body:{email}});
        d.mode='sent';d.msg='Si '+email+' tiene cuenta, te llega un link para elegir una contraseña nueva.';
      }else if(d.mode==='newpw'){
        await req('/auth/v1/user',{method:'PUT',auth:true,body:{password:pw}});
        S.m2=null;toast('Contraseña guardada');render();return;
      }
    }catch(e){toast(authMsg(e));}
    if(S.m2&&S.m2.d===d){d.busy=false;d.pw='';renderModal();}
  }
  async function afterLogin(){
    S.m2=null;
    await run(false);
    if(S.modal&&(S.modal.t==='profile'&&!S.modal.d.age||S.modal.t==='onb')&&db.profile)S.modal=null;
    render();
    toast(st.s==='ok'?'Conectado: tus datos están en la nube':'Conectado. Se sincroniza cuando haya conexión');
    if(Social.on())Social.load().then(()=>{Social.addPending();render();}).catch(()=>{});
  }
  /* links de los emails (confirmar cuenta o recuperar contraseña) vuelven acá con la sesión en el #hash */
  async function fromLink(){
    const h=location.hash.slice(1);if(!h)return;
    const p=new URLSearchParams(h);
    if(p.get('error_description')){toast(p.get('error_description').replace(/\+/g,' '));history.replaceState(null,'',location.pathname);return;}
    if(!p.get('access_token'))return;
    history.replaceState(null,'',location.pathname+location.search);
    try{
      const u=await fetch(URL_+'/auth/v1/user',{headers:{apikey:KEY,Authorization:'Bearer '+p.get('access_token')}}).then(r=>r.ok?r.json():Promise.reject(new Error('link')));
      setSess({access_token:p.get('access_token'),refresh_token:p.get('refresh_token'),expires_at:+p.get('expires_at')||0,expires_in:+p.get('expires_in')||3600,user:u});
      await afterLogin();
      if(p.get('type')==='recovery'){S.m2={t:'login',d:{email:u.email,pw:'',mode:'newpw',busy:false}};render();}
    }catch(e){toast('El link venció o ya se usó: pedí uno nuevo');}
  }
  function logout(){
    const t=sess&&sess.access_token;
    if(t)fetch(URL_+'/auth/v1/logout',{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+t}}).catch(()=>{});
    sess=null;keep();clearTimeout(timer);set('idle');
  }
  document.addEventListener('focusout',()=>setTimeout(()=>{if(pendingRender&&!typing()){pendingRender=false;render();}},0));
  window.addEventListener('online',()=>schedule(300));
  document.addEventListener('visibilitychange',()=>{if(!sess)return;if(document.visibilityState==='visible')schedule(300);else if(timer)run(false);});
  setInterval(()=>{if(sess&&document.visibilityState==='visible')run(false);},120000);
  return{run,schedule,loginGo,logout,fromLink,req,forget:logout,user:()=>sess&&sess.user,token:()=>sess&&sess.access_token,state:st};
})();
/* Cuenta VIP: la marca vive en el servidor (app_metadata.vip en Supabase: el usuario no la puede cambiar y viaja en el token).
   Se lee del usuario de la sesión o, si la sesión guardada es vieja y no la trae, del token. Sin cuenta o sin la marca: false.
   Hoy desbloquea los colores Oro y Élite; queda lista para lo VIP que venga. */
function isVip(){try{const u=Sync.user();if(!u)return false;if(u.app_metadata&&u.app_metadata.vip===true)return true;
  const t=Sync.token();if(!t)return false;const p=t.split('.')[1];if(!p)return false;
  const j=JSON.parse(decodeURIComponent(escape(atob(p.replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((p.length+3)%4)))));
  return !!(j&&j.app_metadata&&j.app_metadata.vip===true);}catch(e){return false;}}

/* ============ Inicio ============ */
applyTheme();
try{render();}catch(e){console.error(e);}
/* un error suelto no deja la app muda */
{let errT=0;window.addEventListener('error',e=>{if(!e.message||!e.filename||e.filename.indexOf(location.origin)!==0||Date.now()-errT<8000)return;errT=Date.now();try{toast('Algo falló. Si se repite, recargá la app.');}catch(x){}});}
if(!db.profile)ACTIONS.startOnb();
/* el resumen de la semana pasada se abre solo una vez por semana */
setTimeout(()=>{try{if(db.profile&&!S.modal&&!S.m2&&!S.sessOpen){const d=recapData();if(d.n&&db.settings.recapSeen!==d.key)openRecap();}}catch(e){}},1400);
/* la pantalla de carga se va sola */
setTimeout(()=>{const s=$('#splash');if(s){s.classList.add('out');setTimeout(()=>s.remove(),600);}},matchMedia('(prefers-reduced-motion: reduce)').matches?150:1150);
try{checkAch(true);checkRankUp();checkMissions();}catch(e){}
Sync.fromLink();
Music.fromLink();
document.addEventListener('keydown',e=>{const t=e.target;if(e.key==='Enter'&&t&&t.dataset&&t.dataset.i==='cmt'){e.preventDefault();ACTIONS.cmtSend(t.dataset.e);}});if(Music.on())Music.poll();
/* rutina compartida por link */
try{const q=new URLSearchParams(location.search),rr=q.get('rutina');if(rr){history.replaceState(null,'',location.pathname+location.hash);const o=parseRoutineLink(rr);
  if(o)setTimeout(()=>{if(db.profile){S.modal={t:'rimport',o};render();}else toast('Te pasaron una rutina: creá tu perfil y volvé a abrir el link');},1500);else toast('El link de la rutina está roto');}}catch(e){}
/* accesos directos del ícono y toques en notificaciones */
function goAction(g){
  if(!db.profile)return;
  if(g==='entreno')ACTIONS.quickTrain();else if(g==='comida')ACTIONS.foodOpen();else if(g==='marca')ACTIONS.markOpen();else if(g==='amigos')ACTIONS.socOpen(S.social&&notifItems().length?'list':'feed');
}
try{const q=new URLSearchParams(location.search),g=q.get('go');if(g){history.replaceState(null,'',location.pathname+location.hash);setTimeout(()=>goAction(g),900);}}catch(e){}
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{if(e.data&&e.data.go)goAction(e.data.go);});
/* invitación de un amigo por link */
try{const q=new URLSearchParams(location.search),c=q.get('amigo');if(c&&/^[A-Za-z0-9]{6}$/.test(c)){localStorage.setItem('swole.pendFriend',c.toUpperCase());history.replaceState(null,'',location.pathname+location.hash);
  setTimeout(()=>{if(Social.on())Social.addPending();else if(db.profile)toast('Te invitaron a Swole: activá Amigos en Nivel para sumarte');},1600);}}catch(e){}
if(Social.on())Social.load().then(()=>{if(S.tab==='inicio'&&!S.modal)render();}).catch(()=>{});
/* si los datos se borraron de este dispositivo pero hay sesión, se recuperan de la nube */
if(Sync.user())Sync.run(false).then(()=>{if(db.profile&&S.modal&&S.modal.t==='profile'&&!S.modal.d.age){S.modal=null;render();}});
/* Pide al navegador que no borre los datos (Safari los borra si la web no se usa por un tiempo) */
try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
/* App instalable y offline */
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
  window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(r=>{setInterval(()=>r.update().catch(()=>{}),30*60*1000);}).catch(()=>{}));
  const hadSW=!!navigator.serviceWorker.controller;let swReload=false;
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadSW||swReload)return;swReload=true;
    /* no recarga encima de algo que estás cargando: espera a que salgas de la app */
    if(db.active||S.modal||S.m2||S.picker){if(db.active)toast('Hay una versión nueva: se aplica cuando cierres la app');document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&!db.active)location.reload();});return;}location.reload();});
}
