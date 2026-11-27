'use strict';
/* ============ Navegación moderna ============ */
const reducedMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const TAB_ORDER=['inicio','entrenar','niveles','nutri'];
/* SW-10 (temblor-raiz.md): la página scrollea en #scroller, nunca la ventana */
function SC(){return document.getElementById('scroller')||document.scrollingElement;}
/* al cambiar de pestaña el contenido vuelve arriba. En algunos iOS, poner scrollTop=0 no frena el deslizamiento con inercia que
   seguía: se corta el scroll un instante (overflow hidden) y se devuelve (qa.md) */
function scArriba(){const s=SC();if(!s)return;const st=s.style;if(st)st.overflowY='hidden';s.scrollTop=0;if(st)setTimeout(()=>{st.overflowY='';},0);}
/* cambio de pestaña con transición nativa del navegador (View Transitions); si no hay soporte, la animación de siempre */
function navTo(v,dir){
  const go=()=>{goTab(v);scArriba();render();};
  const cur=TAB_ORDER.indexOf(S.tab),nx=TAB_ORDER.indexOf(v==='hoy'?'inicio':['rutinas','cal'].includes(v)?'entrenar':v);
  if(cur===nx&&!['rutinas','cal'].includes(v)){if(SC().scrollTop>40)SC().scrollTo({top:0,behavior:'smooth'});else go();return;}
  buzz(8);
  if(!document.startViewTransition||reducedMotion()||document.visibilityState!=='visible'){go();return;}
  const back=dir?dir<0:nx>=0&&cur>=0&&nx<cur;
  document.documentElement.classList.toggle('vt-back',back);
  S.vt=true;
  const t=document.startViewTransition(()=>{go();});
  t.finished.finally(()=>{S.vt=false;document.documentElement.classList.remove('vt-back');});
}
/* barra de abajo: responde al levantar el dedo, aunque la página venga deslizándose (en iPhone ese toque solo la frenaba) */
(()=>{let b=null,x0=0,y0=0;
  document.addEventListener('touchstart',e=>{b=e.target.closest('.nav button[data-a]');if(b){x0=e.touches[0].clientX;y0=e.touches[0].clientY;}},{passive:true});
  document.addEventListener('touchend',e=>{if(!b)return;const t=e.changedTouches[0],el=b;b=null;if(Math.hypot(t.clientX-x0,t.clientY-y0)>14)return;
    if(document.elementFromPoint(t.clientX,t.clientY)?.closest('.nav button')!==el)return;e.preventDefault();S.layT=0;el.click();},{passive:false});
})();
/* deslizar a los costados cambia de pestaña (en el celu) */
(()=>{let x0=0,y0=0,t0=0,ok=false,dx=0,lock=null;
  const blocked=t=>t.closest('.scroll-x,.tb-row,.carta,.cmp,input,textarea,select,.set,.week,.chips,.seg,.heat,.qgrid.big,.ptiles,[data-noswipe]');
  document.addEventListener('touchstart',e=>{
    ok=false;lock=null;dx=0;
    if(window.innerWidth>=900||openLayers()||e.touches.length>1)return;
    if(!e.target.closest('#view')||blocked(e.target))return;
    ok=true;x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now();
  },{passive:true});
  document.addEventListener('touchmove',e=>{
    if(!ok)return;const x=e.touches[0].clientX-x0,y=e.touches[0].clientY-y0;
    if(!lock){if(Math.abs(x)>18||Math.abs(y)>18)lock=Math.abs(x)>Math.abs(y)*2.2?'x':'y';else return;}
    if(lock!=='x'){ok=false;return;}
    const i=TAB_ORDER.indexOf(S.tab),edge=(x>0&&i<=0)||(x<0&&i>=TAB_ORDER.length-1);
    dx=edge?x*.15:x;const v=$('#view');v.style.transition='none';v.style.transform='translateX('+(dx*.35)+'px)';v.style.opacity=String(1-Math.min(.35,Math.abs(dx)/600));
  },{passive:true});
  document.addEventListener('touchend',()=>{
    if(!ok)return;ok=false;const v=$('#view');v.style.transition='transform .25s cubic-bezier(.22,1,.36,1),opacity .25s';v.style.transform='';v.style.opacity='';
    if(lock!=='x')return;
    const i=TAB_ORDER.indexOf(S.tab),fast=Date.now()-t0<450;
    if(Math.abs(dx)>(fast?80:140)){const j=i+(dx<0?1:-1);if(j>=0&&j<TAB_ORDER.length){setTimeout(()=>{v.style.transition='';navTo(TAB_ORDER[j],dx<0?1:-1);},10);}}
  },{passive:true});
})();
/* al bajar: el título grande pasa al encabezado. La barra de abajo queda siempre fija (esconderla hacía saltar la pantalla).
   Con margen (histéresis): entra cuando el título queda por arriba de 56 px y sale recién por debajo de 72. Con un solo umbral,
   si en el borde algo cambiaba de alto, "scrolled" iba y venía y lo pegado arriba temblaba (SW-10, juan-4.md) */
function topScrolled(prev,bottom,edge){const e=edge==null?64:edge;return prev?bottom<=e+8:bottom<e-8;}
(()=>{let tick=false;
  const upd=()=>{tick=false;
    const b=document.body,t=$('#view .pg'),tt=$('#topT'),cab=$('#cab');
    /* con segmento el título ya está fijo en la cabecera: "scrolled" (la línea de abajo) es solo si el contenido se movió */
    if(document.documentElement.classList.contains('conseg')){const y=SC().scrollTop;b.classList.toggle('scrolled',b.classList.contains('scrolled')?y>1:y>4);}
    /* el borde es el de abajo de la cabecera */
    else if(t&&tt){const gone=topScrolled(b.classList.contains('scrolled'),t.getBoundingClientRect().bottom,cab?cab.getBoundingClientRect().bottom:64);b.classList.toggle('scrolled',gone);if(gone&&tt.textContent!==t.textContent)tt.textContent=t.textContent;}
    else b.classList.remove('scrolled');
    b.classList.remove('navhide');
  };
  const sc=SC();if(sc)sc.addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(upd);}},{passive:true});
})();
/* (se sacó "tirar para actualizar": se disparaba solo al llegar arriba scrolleando; la sincronización ya es automática) */

/* ============ Buscador: acciones, pantallas, rutinas y ejercicios ============ */
const normTxt=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
function cmdItems(){
  const t=today(),A=[
    {g:'Acciones',i:'play',n:'Empezar entrenamiento libre',a:'startFree',k:'entreno empezar libre'},
    {g:'Acciones',i:'spark',n:'Entreno de hoy (según recuperación)',a:'todayGo',k:'hoy recuperacion automatico'},
    {g:'Acciones',i:'bolt',n:'Cargar marca',a:'markOpen',k:'marca record nivel 1rm'},
    {g:'Acciones',i:'spark',n:'Armar una rutina',a:'genOpen',k:'generar rutina plan'},
    {g:'Acciones',i:'tree',n:'Árbol de habilidades',a:'treeOpen',k:'calistenia skills habilidades'},
    {g:'Acciones',i:'user',n:'Amigos y ranking',a:'socOpen',k:'amigos ranking temporada social'},
    {g:'Acciones',i:'bolt',n:'Atleta: salto, velocidad y potencia',a:'aOpen',k:'atleta salto vertical sprint velocidad potencia pliometria'},
    {g:'Acciones',i:'heart',n:'Articulaciones de acero',a:'jOpen',k:'articulaciones rodilla tobillo hombro espalda tendon cartilago prevencion lesiones'},
    {g:'Acciones',i:'weight',n:'Powerlifting: total y DOTS',a:'plOpen',k:'powerlifting total dots sentadilla banca peso muerto'},
    {g:'Acciones',i:'rank',n:'Ver mi carta',a:'cardOpen',k:'carta tarjeta compartir'},
    {g:'Acciones',i:'disc',n:'Calculadora de discos',a:'platesOpen',k:'discos barra calculadora'},
    {g:'Acciones',i:'weight',n:'Calculadora de 1RM y porcentajes',a:'toolsOpen',v:'rm',k:'1rm maximo porcentaje calculadora'},
    {g:'Acciones',i:'timer',n:'Timer de intervalos (Tabata, EMOM)',a:'toolsOpen',v:'iv',k:'timer tabata emom hiit intervalos cronometro'},
    {g:'Acciones',i:'food',n:'Anotar comida',a:'foodOpen',k:'comida comer calorias desayuno almuerzo cena merienda'},
    {g:'Acciones',i:'drop',n:'+1 vaso de agua',a:'water',v:'1',k:'agua tomar'},
    {g:'Acciones',i:'pill',n:db.creatine[t]?'Creatina: ya la tomaste hoy':'Tomé creatina',a:'creaToggle',v:t,k:'creatina'},
    {g:'Acciones',i:'cal',n:'Resumen de la semana',a:'recapOpen',k:'resumen semana recap'},
    {g:'Acciones',i:effTheme()==='dark'?'sun':'moon',n:effTheme()==='dark'?'Pasar a tema claro':'Pasar a tema oscuro',a:'theme',k:'tema oscuro claro modo'},
    {g:'Pantallas',i:'home',n:'Inicio',a:'tab',v:'inicio',k:'inicio home'},
    {g:'Pantallas',i:'dumb',n:'Rutinas',a:'tab',v:'rutinas',k:'rutinas entrenar'},
    {g:'Pantallas',i:'cal',n:'Calendario',a:'tab',v:'cal',k:'calendario historial'},
    {g:'Pantallas',i:'rank',n:'Nivel',a:'tab',v:'niveles',k:'nivel rangos'},
    {g:'Pantallas',i:'flame',n:'Nutrición y cuerpo',a:'tab',v:'nutri',k:'nutricion calorias peso medidas fotos'},
    {g:'Pantallas',i:'user',n:'Perfil y cuenta',a:'tab',v:'perfil',k:'perfil cuenta ajustes sincronizar'}
  ];
  db.routines.forEach(r=>A.push({g:'Rutinas',i:'play',n:'Empezar '+r.name,a:'startR',v:r.id,k:'rutina '+r.name}));
  allEx().filter(e=>!e.hidden).forEach(e=>A.push({g:'Ejercicios',i:e.sk?'acro':'dumb',n:shortN(e.n),a:'exInfo',v:e.id,k:e.eq+' '+e.p.map(k=>MUSC[k]||k).join(' ')+(e.kw?' '+e.kw:''),ex:e}));
  return A;
}
function cmdFilter(q){
  const all=cmdItems(),tk=normTxt(q).split(/\s+/).filter(Boolean);
  if(!tk.length)return all.filter(x=>x.g==='Acciones').slice(0,7).concat(all.filter(x=>x.g==='Rutinas').slice(0,3));
  return all.map(x=>{const n=normTxt(x.n),h=n+' '+normTxt(x.k);if(!tk.every(t=>h.includes(t)))return null;
    let s=0;tk.forEach(t=>{if(n.startsWith(t))s+=6;else if(n.includes(' '+t))s+=4;else if(n.includes(t))s+=2;});if(x.g==='Acciones')s+=1;return{x,s};})
   .filter(Boolean).sort((a,b)=>b.s-a.s).slice(0,30).map(o=>o.x);
}
function cmdList(m){
  const its=cmdFilter(m.q);m.its=its;
  if(!its.length)return '<div class="cmd-empty">'+ic('search',26)+'<b>No encontré "'+esc(m.q)+'"</b><span class="mut sm-t">Probá con otra palabra, o creá el ejercicio desde Rutinas.</span></div>';
  let g='',h='';
  its.forEach((x,i)=>{if(x.g!==g){g=x.g;h+='<div class="cmd-g">'+(m.q?g:g==='Acciones'?'Sugeridos':g)+'</div>';}
    h+='<button class="cmd-it'+(i===m.i?' on':'')+'" data-a="cmdGo" data-v="'+i+'" role="option" aria-selected="'+(i===m.i)+'"><span class="cmd-ic">'+ic(x.i,17)+'</span><span class="grow">'+esc(x.n)+(x.ex?'<small class="mut"> · '+esc(x.ex.eq)+'</small>':'')+'</span>'+(i===m.i?'<kbd>↵</kbd>':'')+'</button>';});
  return h;
}
function cmdHTML(m){
  return '<div class="mback cmdb" data-a="back" data-v="modal"><div class="msheet cmd" role="dialog" aria-modal="true" aria-label="Buscar">'+
   '<div class="cmd-bar">'+ic('search',20)+'<input id="cmdQ" data-i="cmdq" type="search" placeholder="Buscá ejercicios, rutinas o acciones" value="'+esc(m.q)+'" autocomplete="off" enterkeyhint="go" aria-label="Buscar"><button class="ib flat" data-a="close" data-v="modal" aria-label="Cerrar">'+ic('x')+'</button></div>'+
   '<div class="cmd-list" id="cmdList" role="listbox">'+cmdList(m)+'</div>'+
   '<div class="cmd-foot mut"><span><kbd>↑</kbd><kbd>↓</kbd> moverte</span><span><kbd>↵</kbd> abrir</span><span><kbd>Esc</kbd> cerrar</span></div></div></div>';
}
function cmdRun(i){
  const m=S.modal;if(!m||m.t!=='cmd')return;const x=(m.its||[])[i];if(!x)return;
  S.modal=null;
  if(x.a==='tab'){navTo(x.v);return;}
  render();
  const el={dataset:{v:x.v==null?'':String(x.v),d:''},closest:()=>null};
  try{ACTIONS[x.a](x.v==null?'':x.v,el);}catch(e){}
}
function cmdMove(d){const m=S.modal;if(!m||!m.its||!m.its.length)return;m.i=(m.i+d+m.its.length)%m.its.length;const l=$('#cmdList');if(l){l.innerHTML=cmdList(m);const on=l.querySelector('.cmd-it.on');if(on)on.scrollIntoView({block:'nearest'});}}

/* ============ Misiones semanales y racha por semana ============ */
const weekStart=d=>{d=d||today();const w=(parseK(d).getDay()+6)%7;return addDays(d,-w);};
const weekTarget=()=>{const g=weekGymDays().length;return Math.max(1,g||db.settings.weekGoal||3);};
const trainDays=(a,b)=>new Set(db.logs.filter(l=>l.date>=a&&l.date<=b).map(l=>l.date)).size;
/* semanas seguidas cumpliendo tu meta de días (descansar no la corta; la semana en curso no la rompe) */
function weekStreak(){
  const T=weekTarget();let ws=weekStart(),n=0;
  if(trainDays(ws,addDays(ws,6))>=T)n++;
  for(let i=0;i<200;i++){ws=addDays(ws,-7);if(trainDays(ws,addDays(ws,6))>=T)n++;else break;}
  return n;
}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function missions(){
  const ws=weekStart(),we=addDays(ws,6),inW=d=>d&&d>=ws&&d<=we,T=weekTarget();
  const logs=db.logs.filter(l=>inW(l.date)),ev=(db.settings.ev||[]).filter(e=>inW(e.d));
  const sets={};Object.keys(GROUPS).forEach(g=>sets[g]=0);
  logs.forEach(l=>l.entries.forEach(en=>{const ex=exById(en.ex);if(ex)sets[groupOf(ex)]+=en.sets.filter(s=>!s.w).length;}));
  /* el grupo que menos venís entrenando (últimas 4 semanas) */
  const past={};Object.keys(GROUPS).forEach(g=>past[g]=0);
  db.logs.filter(l=>l.date>=addDays(ws,-28)&&l.date<ws).forEach(l=>l.entries.forEach(en=>{const ex=exById(en.ex);if(ex)past[groupOf(ex)]+=en.sets.length;}));
  const weak=Object.keys(past).filter(g=>g!=='Core').sort((a,b)=>past[a]-past[b])[0]||'Espalda';
  const before=new Set();db.logs.filter(l=>l.date<ws).forEach(l=>l.entries.forEach(en=>before.add(en.ex)));
  const newEx=new Set();logs.forEach(l=>l.entries.forEach(en=>{if(!before.has(en.ex))newEx.add(en.ex);}));
  const usesCrea=Object.keys(db.creatine).some(k=>k>=addDays(ws,-30));
  const wg=waterGoal(),waterDays=[0,1,2,3,4,5,6].filter(i=>(db.water[addDays(ws,i)]||0)>=wg).length;
  const sg=db.settings.skillGoal,sp=sg?skillPlan(sg.id):null;
  const pool=[
    {id:'pr',i:'trophy',n:'Hacé 1 récord personal',goal:1,cur:ev.filter(e=>e.k==='pr'||e.k==='up').length,p:30},
    {id:'weak',i:'muscle',n:'Hacé 10 series de '+weak.toLowerCase(),goal:10,cur:sets[weak]||0,p:30},
    {id:'mark',i:'bolt',n:'Cargá una marca',goal:1,cur:(db.tests||[]).filter(t=>inW(t.date)).length,p:20},
    {id:'new',i:'spark',n:'Probá un ejercicio nuevo',goal:1,cur:db.logs.length?newEx.size:0,p:20},
    {id:'water',i:'drop',n:'Llegá a tu meta de agua 4 días',goal:4,cur:waterDays,p:20}
  ];
  if(usesCrea)pool.push({id:'crea',i:'pill',n:'Tomá creatina 5 días',goal:5,cur:[0,1,2,3,4,5,6].filter(i=>db.creatine[addDays(ws,i)]).length,p:20});
  if(sp)pool.push({id:'skill',i:'acro',n:'Practicá '+shortN(sp.step.ex.n)+' 2 veces',goal:2,cur:logs.filter(l=>l.entries.some(en=>en.ex===sp.step.id)).length,p:30});
  /* la de días siempre está; las otras dos cambian cada semana */
  const r=hashStr(ws+(db.profile&&db.profile.nick||'')),pick=pool.map((x,k)=>({x,k:hashStr(r+':'+x.id)})).sort((a,b)=>a.k-b.k).slice(0,2).map(o=>o.x);
  return[{id:'days',i:'cal',n:'Entrená '+T+(T===1?' día':' días'),goal:T,cur:trainDays(ws,we),p:40}].concat(pick).map(m=>Object.assign(m,{done:m.cur>=m.goal,ws}));
}
/* cuando cumplís una misión: novedad + puntos de temporada (una sola vez por semana) */
function checkMissions(){
  if(!db.profile)return;
  const ms=missions(),ws=ms[0].ws,dn=db.settings.misDone||{};
  const got=dn[ws]||[];let fresh=[];
  ms.forEach(m=>{if(m.done&&!got.includes(m.id)){got.push(m.id);fresh.push(m);addEv({k:'mis',n:m.n,p:m.p});}});
  if(!fresh.length)return;
  Object.keys(dn).forEach(k=>{if(k<addDays(ws,-35))delete dn[k];});
  dn[ws]=got;db.settings.misDone=dn;save();
  setTimeout(()=>{toast('Misión cumplida: '+fresh[0].n+' (+'+fresh[0].p+' pts)');confetti(30);},700);
}
function missionsCard(){
  if(!db.profile)return '';
  const ms=missions(),left=7-((new Date().getDay()+6)%7),dn=ms.filter(m=>m.done).length;
  return '<div class="card mis"><div class="hd"><div><span class="lh-k">Misiones de la semana</span><h3>'+dn+' de '+ms.length+' cumplidas</h3><span class="mut sm-t">'+(left>1?'Se renuevan en '+left+' días':'Se renuevan mañana')+' · suman puntos a tu temporada</span></div></div>'+
   ms.map(m=>'<div class="mi'+(m.done?' done':'')+'"><span class="mi-ic">'+ic(m.done?'check':m.i,16)+'</span><span class="grow"><b>'+esc(m.n)+'</b><span class="bar"><i style="width:'+Math.round(Math.min(1,m.cur/m.goal)*100)+'%"></i></span></span><span class="mi-p">'+(m.done?'+'+m.p:Math.min(m.cur,m.goal)+'/'+m.goal)+'</span></div>').join('')+'</div>';
}

/* ============ Bloques de 4 semanas con descarga ============ */
/* rutinas armadas por la app: 4 semanas subiendo y la 5.ª de descarga (menos series, ~90 % del peso) */
function blockWeek(r){
  if(!r||!r.gen||r.skill||!r.since)return null;
  const w=Math.max(0,Math.floor((parseK(today())-parseK(r.since))/864e5/7));
  return{w:w%5,n:Math.floor(w/5)+1,deload:w%5===4};
}
const blockTxt=b=>b?(b.deload?'Semana de descarga':'Semana '+(b.w+1)+' de 4'+(b.w===3?' · la próxima es de descarga':'')):'';

/* ============ Importar desde Hevy o Strong (CSV) ============ */
function parseCSV(text){
  const first=text.split(/\r?\n/)[0]||'',del=(first.match(/;/g)||[]).length>(first.match(/,/g)||[]).length?';':',';
  const rows=[];let row=[],f='',q=false;
  for(let i=0;i<text.length;i++){const c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}
    else if(c==='"')q=true;else if(c===del){row.push(f);f='';}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(f);f='';if(row.length>1||row[0])rows.push(row);row=[];}
    else f+=c;}
  if(f||row.length){row.push(f);rows.push(row);}
  const head=(rows.shift()||[]).map(h=>h.trim().toLowerCase());
  return rows.map(r=>{const o={};head.forEach((h,k)=>o[h]=(r[k]||'').trim());return o;});
}
const MON={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11,ene:0,abr:3,ago:7,dic:11};
function parseWhen(s){
  s=String(s||'').trim();let m;
  if((m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/)))return new Date(+m[1],+m[2]-1,+m[3],+(m[4]||0),+(m[5]||0));
  if((m=s.match(/^(\d{1,2}) ([A-Za-z]{3})[a-z]* (\d{4}),? ?(\d{1,2})?:?(\d{2})?/))&&MON[m[2].toLowerCase()]!=null)return new Date(+m[3],MON[m[2].toLowerCase()],+m[1],+(m[4]||0),+(m[5]||0));
  const t=Date.parse(s);return isNaN(t)?null:new Date(t);
}
const dkOf=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
/* nombres en inglés de Hevy/Strong a los ejercicios de Swole */
function mapExName(raw){
  const n=normTxt(raw),has=(...w)=>w.every(x=>n.includes(x)),db_=/dumbbell/.test(n),cable=/cable/.test(n),mach=/machine|smith/.test(n);
  const id=
    has('incline','bench')?'incbench':has('bench press')&&db_?'dbpress':has('bench press')?'bench':
    has('front squat')?'frontsquat':has('bulgarian')?'bulgarian':has('leg press')?'legpress':has('squat')&&!db_&&!/goblet|split|jump|air|body/.test(n)?'squat':
    has('romanian')||has('rdl')||has('stiff')?'rdl':has('deadlift')?'deadlift':has('hip thrust')||has('glute bridge')?'hipthrust':
    (has('overhead press')||has('military'))&&!db_?'ohp':has('shoulder press')&&db_?'dbohp':has('shoulder press')?'ohp':
    has('lat pulldown')||has('pulldown')?'latpull':has('pull up')||has('pull-up')||has('pullup')||has('chin up')||has('chin-up')?'pullup':
    (has('row')&&(has('seated')||cable))?'cablerow':has('row')&&db_?'dbrow':has('row')&&has('inverted')?'austrow':has('row')&&!mach?'row':
    has('lateral raise')?'lateral':has('face pull')?'facepull':(has('pushdown')||has('push down'))?'pushdown':
    has('hammer curl')?'hammer':has('leg curl')||has('hamstring curl')?'legcurl':has('curl')&&db_?'dbcurl':has('curl')&&!/wrist/.test(n)?'curl':
    has('leg extension')?'legext':has('seated calf')?'seatedcalf':has('calf')?'calf':has('shrug')?'shrug':
    has('dip')&&!has('bench dip')?'dips':has('push up')||has('push-up')||has('pushup')?'pushup':has('plank')&&!has('side')?'plank':
    has('lunge')?'lunge':has('leg raise')?'legraise':has('russian twist')?'russian':has('farmer')?'farmer':null;
  return id&&exById(id)?id:null;
}
function guessMuscle(raw){
  const n=normTxt(raw);
  return /bench|chest|fly|pec/.test(n)?'pecho':/row|pull|lat|back/.test(n)?'dorsales':/curl/.test(n)&&!/leg/.test(n)?'biceps':/tricep|skull|extension/.test(n)&&!/leg/.test(n)?'triceps':
   /shoulder|lateral|raise|press/.test(n)?'hombros':/deadlift|hamstring|leg curl/.test(n)?'isquios':/calf/.test(n)?'gemelos':/glute|hip/.test(n)?'gluteos':
   /squat|leg|lunge|step/.test(n)?'cuadriceps':/ab|crunch|plank|core|sit/.test(n)?'abs':'pecho';
}
/* arma la vista previa a partir del archivo */
function csvPlan(text,lbs){
  const rows=parseCSV(text);if(!rows.length)return{err:'El archivo está vacío'};
  const k=Object.keys(rows[0]),hevy=k.includes('exercise_title'),strong=k.includes('exercise name');
  if(!hevy&&!strong)return{err:'No reconozco el archivo: tiene que ser el CSV que exportan Hevy o Strong'};
  const W={};
  rows.forEach(o=>{
    const when=parseWhen(hevy?o.start_time:o.date);if(!when)return;
    const name=hevy?o.title:o['workout name'],key=dkOf(when)+'|'+name+'|'+(hevy?o.start_time:o.date);
    const w=W[key]=W[key]||{date:dkOf(when),name:name||'Entreno importado',dur:0,ex:{},order:[]};
    if(hevy&&o.end_time){const e=parseWhen(o.end_time);if(e)w.dur=Math.max(1,Math.round((e-when)/60000));}
    if(strong&&o.duration){const h=/(\d+)\s*h/.exec(o.duration),mi=/(\d+)\s*m/.exec(o.duration);w.dur=(h?+h[1]*60:0)+(mi?+mi[1]:0)||(+o.duration>0?Math.round(+o.duration/60):0);}
    const exN=hevy?o.exercise_title:o['exercise name'];if(!exN)return;
    /* el cardio (cinta, bici, remo de máquina...) no se importa */
    const dist=parseFloat(hevy?o.distance_km:o.distance)||0;if(/treadmill|running|run|walk|cycling|bike|elliptical|stair|rowing machine|row (machine)|jump rope|swim/i.test(exN)||dist>0&&!(parseFloat(o.reps)>0))return;
    let kg=parseFloat(String(hevy?o.weight_kg:o.weight).replace(',','.'))||0;if(lbs&&!hevy)kg=Math.round(kg*0.4536*4)/4;
    const reps=parseFloat(hevy?o.reps:o.reps)||0,secs=parseFloat(hevy?o.duration_seconds:o.seconds)||0;
    if(!(reps>0)&&!(secs>0))return;
    const warm=hevy?/warm/i.test(o.set_type||''):/^w$/i.test(o['set order']||'');
    if(!w.ex[exN]){w.ex[exN]=[];w.order.push(exN);}
    w.ex[exN].push({kg,reps:reps>0?reps:secs,t:!(reps>0)&&secs>0,w:warm?1:0});
  });
  const ws=Object.values(W).filter(w=>w.order.length).sort((a,b)=>a.date<b.date?-1:1);
  const names=new Set();ws.forEach(w=>w.order.forEach(n=>names.add(n)));
  const map={},unknown=[];names.forEach(n=>{const id=mapExName(n);if(id)map[n]=id;else unknown.push(n);});
  const dup=ws.filter(w=>db.logs.some(l=>l.date===w.date&&l.name===w.name)).length;
  return{fmt:hevy?'Hevy':'Strong',ws,map,unknown,dup,sets:ws.reduce((s,w)=>s+w.order.reduce((a,n)=>a+w.ex[n].length,0),0)};
}
function csvImport(p){
  const made={},fresh=p.ws.filter(w=>!db.logs.some(l=>l.date===w.date&&l.name===w.name));
  p.unknown.forEach(n=>{
    if(!fresh.some(w=>w.ex[n]))return;
    const same=db.customEx.find(e=>normTxt(e.n)===normTxt(n.slice(0,40)));if(same){made[n]=same.id;return;}
    const sets=[].concat(...p.ws.map(w=>w.ex[n]||[])),time=sets.every(s=>s.t),bw=!time&&sets.every(s=>!s.kg),pm=guessMuscle(n);
    const ex={id:'c_'+uid(),n:n.slice(0,40),eq:'Personalizado',p:[pm],s:[],d:'Importado de '+p.fmt+'.',st:null,reg:LOWER.includes(pm)?'l':'u',custom:1};
    if(time)ex.time=1;else if(bw)ex.bw=1;db.customEx.push(ex);made[n]=ex.id;
  });
  let n=0;
  p.ws.forEach(w=>{
    if(db.logs.some(l=>l.date===w.date&&l.name===w.name))return;
    const entries=w.order.map(nm=>({ex:p.map[nm]||made[nm],sets:w.ex[nm].map(s=>{const o={kg:s.kg,reps:s.reps};if(s.w)o.w=1;return o;})})).filter(e=>e.ex&&e.sets.length);
    if(!entries.length)return;
    db.logs.push({id:uid(),date:w.date,name:w.name,routineId:null,dur:w.dur||60,entries,prs:[],imp:p.fmt});n++;
  });
  return n;
}
function csvHTML(m){
  const c=m.csv;
  let h='<div class="card" style="margin:0 0 12px"><h4 style="margin-bottom:6px">Desde Hevy o Strong</h4><p class="mut sm-t">En la app: Ajustes → Exportar datos (CSV). Elegí ese archivo acá: se suman tus entrenos sin borrar nada.</p>'+
   '<label class="btn wide" style="margin-top:10px;cursor:pointer">'+ic('plus',16)+' Elegir archivo CSV<input type="file" accept=".csv,text/csv" data-i="csv" hidden></label>';
  if(c&&c.err)h+='<div class="warn" style="margin-top:10px">'+esc(c.err)+'</div>';
  else if(c&&c.ws){
    const from=c.ws[0],to=c.ws[c.ws.length-1];
    h+='<div class="imp-sum"><div><b>'+c.ws.length+'</b><span>entrenos</span></div><div><b>'+nf(c.sets)+'</b><span>series</span></div><div><b>'+Object.keys(c.map).length+'</b><span>ejercicios reconocidos</span></div></div>'+
     '<p class="sm-t mut">De '+esc(c.fmt)+', del '+esc(longDate(from.date))+' al '+esc(longDate(to.date))+'.'+(c.dup?' '+c.dup+' ya estaban y se saltean.':'')+'</p>'+
     (c.unknown.length?'<p class="sm-t" style="margin-top:6px">Estos '+c.unknown.length+' se crean como ejercicios propios: <span class="mut">'+esc(c.unknown.slice(0,8).join(', '))+(c.unknown.length>8?'…':'')+'</span></p>':'')+
     (c.fmt==='Strong'?'<label class="row sm-t" style="gap:8px;margin-top:8px"><input type="checkbox" data-i="csvLbs" '+(c.lbs?'checked':'')+'> Mis pesos están en libras</label>':'')+
     '<button class="btn pri wide" style="margin-top:10px" data-a="csvGo">Importar '+(c.ws.length-c.dup)+' entrenos</button>';
  }
  return h+'</div>';
}

/* ============ Técnica: figura animada + claves por tipo de movimiento ============ */
/* poses de perfil (mirando a la derecha) en un cuadro de 120×120; el piso está en y=110.
   h cabeza, n cuello/hombro, p cadera, k rodilla, f pie, e codo, a mano; k2/f2 y e2/a2 = la otra pierna/brazo (más tenue); b = barra */
const TECH={
  invrow:{eq:['lowbar'],A:{h:[30,66],n:[40,63],p:[72,86],k:[88,97],f:[104,108],e:[38,55],a:[36,46]},B:{h:[29,53],n:[39,52],p:[71,79],k:[88,94],e:[52,53]}},
  flfull:{eq:['pullbar'],A:{h:[32,36],n:[42,34],p:[76,35],k:[94,36],f:[110,37],e:[45,23],a:[48,12]},B:{p:[76,36],k:[94,37],f:[110,39]}},
  /* variantes de habilidades: cada una con su postura (encogida, avanzada, abierta...) */
  fltuck:{eq:['pullbar'],A:{h:[32,36],n:[42,34],p:[72,36],k:[58,23],f:[74,25],e:[45,23],a:[48,12]},B:{p:[72,37],k:[58,24],f:[74,26]}},
  fladv:{eq:['pullbar'],A:{h:[32,36],n:[42,34],p:[76,35],k:[78,20],f:[94,21],e:[45,23],a:[48,12]},B:{p:[76,36],k:[78,21],f:[94,22]}},
  flone:{eq:['pullbar'],A:{h:[32,36],n:[42,34],p:[76,35],k:[94,35],f:[110,35],k2:[78,21],f2:[94,22],e:[45,23],a:[48,12]},B:{p:[76,36],k:[94,37],f:[110,38]}},
  flstr:{eq:['pullbar'],A:{h:[32,36],n:[42,34],p:[76,35],k:[94,36],f:[110,37],k2:[92,29],f2:[107,24],e:[45,23],a:[48,12]},B:{p:[76,36],k:[94,37],f:[110,39]}},
  skincat:{eq:['pullbar'],A:{h:[60,30],n:[60,40],p:[60,70],k:[56,86],f:[66,98],e:[60,26],a:[60,12]},B:{h:[40,44],n:[48,40],p:[74,44],k:[58,56],f:[74,60],e:[54,26],a:[60,12]}},
  bltuck:{eq:['pullbar'],A:{h:[30,29],n:[40,26],p:[70,28],k:[56,40],f:[72,42],e:[48.5,19],a:[57,12]},B:{p:[70,29],k:[56,41],f:[72,43]}},
  bladv:{eq:['pullbar'],A:{h:[30,29],n:[40,26],p:[76,27],k:[76,42],f:[92,42],e:[48.5,19],a:[57,12]},B:{p:[76,28],k:[76,43],f:[92,43]}},
  blstr:{eq:['pullbar'],A:{h:[30,29],n:[40,26],p:[76,27],k:[94,27],f:[110,27],k2:[92,34],f2:[106,39],e:[48.5,19],a:[57,12]},B:{p:[76,28],k:[94,28],f:[110,29]}},
  blfull:{eq:['pullbar'],A:{h:[30,29],n:[40,26],p:[76,27],k:[94,27],f:[110,27],e:[48.5,19],a:[57,12]},B:{p:[76,28],k:[94,29],f:[110,30]}},
  crow:{eq:['floor'],A:{h:[28,98],n:[38,92],p:[60,78],k:[47,92],f:[66,96],e:[44,100],a:[42,110]},B:{h:[27,99],p:[60,77],k:[47,91],f:[66,95]}},
  pllean:{eq:['floor'],A:{h:[22,82],n:[31,86],p:[66,96],k:[84,102],f:[102,108],e:[37,98],a:[42,110]},B:{h:[18,81],n:[27,85],e:[35,97]}},
  pltuck:{eq:['floor'],A:{h:[34,90],n:[44,92],p:[70,90],k:[56,100],f:[72,102],e:[43,101],a:[42,110]},B:{p:[70,91],k:[56,101],f:[72,103]}},
  pladv:{eq:['floor'],A:{h:[34,90],n:[44,92],p:[76,91],k:[78,104],f:[94,104],e:[43,101],a:[42,110]},B:{p:[76,92],k:[78,105],f:[94,105]}},
  plstr:{eq:['floor'],A:{h:[37,88],n:[46,92],p:[78,92],k:[94,92],f:[110,92],k2:[92,99],f2:[106,104],e:[43,101],a:[40,110]},B:{p:[78,93],k:[94,93],f:[110,94]}},
  lsittuck:{eq:['bars'],A:{h:[57,48],n:[56,58],p:[58,90],k:[72,79],f:[77,92],e:[54,76],a:[52,92]},B:{h:[57,47],n:[56,57],p:[58,89],k:[72,78],f:[77,91]}},
  lsitone:{eq:['bars'],A:{h:[57,48],n:[56,58],p:[58,90],k:[80,90],f:[100,90],k2:[72,96],f2:[70,108],e:[54,76],a:[52,92]},B:{h:[57,47],n:[56,57],p:[58,89],k:[80,88],f:[100,87]}},
  vsit:{eq:['bars'],A:{h:[55,50],n:[56,60],p:[60,92],k:[75,73],f:[88,55],e:[54,77],a:[52,92]},B:{h:[55,49],k:[75,72],f:[88,53]}},
  pike:{eq:['floor'],A:{h:[38,92],n:[43,85],p:[72,52],k:[88,80],f:[102,108],e:[39,97],a:[36,110]},B:{h:[44,103],n:[49,95],p:[74,58],e:[30,101]}},
  wallhs:{eq:['floor','wall'],A:{h:[61,96],n:[60,86],p:[60,56],k:[60,36],f:[60,16],e:[60,98],a:[60,110]},B:{p:[61,56],k:[62,36],f:[63,16]}},
  hspu:{eq:['floor','wall'],A:{h:[61,96],n:[60,86],p:[60,56],k:[60,36],f:[60,16],e:[60,98],a:[60,110]},B:{h:[61,103],n:[60,95],p:[60,65],k:[60,45],f:[60,25],e:[48,101]}},
  freehspu:{eq:['floor'],A:{h:[61,96],n:[60,86],p:[60,56],k:[60,36],f:[60,16],e:[60,98],a:[60,110]},B:{h:[61,103],n:[60,95],p:[60,65],k:[60,45],f:[60,25],e:[48,101]}},
  vflag:{eq:['pole'],A:{h:[36,54],n:[40,46],p:[58,22],k:[68,10],f:[78,3],e:[34,42],a:[30,38],e2:[34,58],a2:[30,64]},B:{p:[59,23],k:[70,11],f:[80,5]}},
  flagtuck:{eq:['pole'],A:{h:[38,44],n:[40,46],p:[74,50],k:[62,36],f:[77,34],e:[34,42],a:[30,38],e2:[34,58],a2:[30,64]},B:{p:[74,51],k:[62,37],f:[77,35]}},
  flagstr:{eq:['pole'],A:{h:[38,44],n:[40,46],p:[76,50],k:[94,53],f:[110,56],k2:[92,44],f2:[106,37],e:[34,42],a:[30,38],e2:[34,58],a2:[30,64]},B:{p:[76,51],k:[94,54],f:[110,58]}},
  squat:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[58,66],k:[60,88],f:[60,110],e:[50,42],a:[56,34],b:[58,34]},B:{h:[69,50],n:[65,59],p:[46,86],k:[74,90],f:[60,110],e:[55,64],a:[61,57],b:[63,57]},
    cues:['Pies al ancho de hombros, puntas un poco afuera','Bajá sentándote atrás y abajo, con el pecho arriba','Las rodillas siguen la línea de los pies','Bajá al menos hasta que la cadera quede a la altura de las rodillas'],err:'Que las rodillas se vayan hacia adentro o que se levanten los talones'},
  pistol:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[58,66],k:[60,88],f:[60,110],k2:[66,86],f2:[72,106],e:[70,46],a:[82,48]},B:{h:[70,52],n:[65,60],p:[48,88],k:[72,92],f:[60,110],k2:[76,88],f2:[100,86],e:[80,62],a:[94,62]},
    cues:['Brazos al frente para equilibrar','Bajá lento sobre una pierna, con el talón apoyado','La otra pierna estirada adelante','Subí empujando con todo el pie'],err:'Derrumbarse abajo sin control'},
  hinge:{eq:['floor'],A:{h:[63,26],n:[62,36],p:[60,66],k:[62,88],f:[62,110],e:[62,51],a:[62,66],b:[63,68]},B:{h:[85,52],n:[77,57],p:[45,73],k:[66,91],f:[62,110],e:[77,77],a:[75,96],b:[75,98]},
    cues:['La barra pegada a las piernas todo el recorrido','Espalda neutra: el movimiento sale de la cadera','Empujá la cadera atrás, rodillas apenas flexionadas','Arriba, apretá los glúteos sin tirarte para atrás'],err:'Redondear la espalda baja'},
  thrust:{eq:['bench'],A:{h:[20,72],n:[28,76],p:[56,100],k:[80,86],f:[84,110],e:[40,90],a:[52,96],b:[56,94]},B:{h:[20,72],n:[28,76],p:[56,78],k:[80,78],f:[84,110],e:[40,80],a:[54,74],b:[56,72]},
    cues:['La espalda alta apoyada en el banco','Pies firmes; arriba, las rodillas a 90°','Subí con los glúteos hasta que el cuerpo quede recto','Pausa de 1 segundo arriba'],err:'Arquear la espalda baja en vez de usar la cadera'},
  bench:{eq:['bench'],A:{h:[24,76],n:[33,78],p:[70,80],k:[88,82],f:[96,110],e:[34,64],a:[35,50],b:[35,49]},B:{h:[24,76],n:[33,78],p:[70,80],k:[88,82],f:[96,110],e:[27,88],a:[37,72],b:[37,71]},
    cues:['Omóplatos juntos y apretados contra el banco','Bajá la barra controlada hasta el pecho','Codos a unos 45° del cuerpo, no abiertos','Pies firmes en el piso'],err:'Rebotar la barra en el pecho o levantar la cadera'},
  press:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[70,46],a:[64,34],b:[63,33]},B:{h:[60,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[63,20],a:[61,6],b:[61,5]},
    cues:['Abdomen y glúteos apretados: el cuerpo no se arquea','La barra sube en línea recta, cerca de la cara','Arriba, la cabeza pasa "a través" de los brazos','Bajá controlado hasta el pecho alto'],err:'Arquear la espalda para empujar'},
  row:{eq:['floor'],A:{h:[87,52],n:[78,56],p:[48,72],k:[66,92],f:[62,110],e:[78,72],a:[78,88],b:[78,89]},B:{h:[87,52],n:[78,56],p:[48,72],k:[66,92],f:[62,110],e:[64,62],a:[70,76],b:[70,77]},
    cues:['Torso inclinado y espalda recta, quieta','Tirá con los codos hacia la cadera','Juntá los omóplatos arriba','Bajá controlado sin perder la postura'],err:'Usar impulso con la espalda'},
  pullup:{eq:['pullbar'],A:{h:[60,30],n:[60,40],p:[60,72],k:[60,90],f:[60,106],e:[60,26],a:[60,12]},B:{h:[64,13],n:[60,24],p:[58,56],k:[58,74],f:[56,90],e:[50,30],a:[60,12]},
    cues:['Arrancá colgado con los brazos estirados','Bajá los hombros y tirá con la espalda','Subí hasta pasar el mentón sobre la barra','Bajá controlado, sin balancearte'],err:'Hacer medias repeticiones o patear para subir'},
  pushup:{eq:['floor'],A:{h:[24,76],n:[32,80],p:[66,92],k:[84,100],f:[102,108],e:[31,94],a:[30,108]},B:{h:[23,95],n:[32,98],p:[66,101],k:[84,104],f:[102,108],e:[42,99],a:[30,108]},
    cues:['El cuerpo en línea recta, de la cabeza a los talones','Manos un poco más abiertas que los hombros','Bajá hasta casi tocar el piso con el pecho','Codos a 45°, no abiertos en cruz'],err:'Dejar caer la cadera'},
  dip:{eq:['bars'],A:{h:[61,26],n:[60,36],p:[58,66],k:[66,84],f:[56,92],e:[60,50],a:[60,62]},B:{h:[60,42],n:[56,52],p:[54,82],k:[62,98],f:[52,104],e:[44,58],a:[60,62]},
    cues:['Arrancá con los brazos estirados y los hombros abajo','Bajá hasta que los codos lleguen a 90°','Torso un poco inclinado adelante','Subí empujando hasta estirar'],err:'Bajar demasiado y forzar el hombro'},
  lunge:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[60,66],k:[60,88],f:[60,110],k2:[60,88],f2:[60,110],e:[60,51],a:[60,64]},B:{h:[61,48],n:[60,58],p:[60,88],k:[80,90],f:[80,110],k2:[50,108],f2:[34,108],e:[60,73],a:[60,86]},
    cues:['Paso largo, torso derecho','Bajá hasta que la rodilla de atrás casi toque el piso','La rodilla de adelante sobre el pie','Empujá con el talón de adelante para subir'],err:'Que la rodilla de adelante se vaya hacia adentro'},
  curl:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[60,56],a:[61,74],b:[61,75]},B:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[60,56],a:[72,44],b:[72,45]},
    cues:['Codos pegados al cuerpo y quietos','Subí apretando el bíceps, sin balancear','Bajá lento, hasta estirar del todo','Muñecas firmes'],err:'Usar el cuerpo para mover el peso'},
  lateral:{front:1,eq:['floor'],A:{h:[60,26],n:[60,36],p:[60,68],k:[54,88],f:[54,110],k2:[66,88],f2:[66,110],e:[52,50],a:[50,64],e2:[68,50],a2:[70,64]},B:{h:[60,26],n:[60,36],p:[60,68],k:[54,88],f:[54,110],k2:[66,88],f2:[66,110],e:[44,40],a:[32,40],e2:[76,40],a2:[88,40]},
    cues:['Codos apenas flexionados','Subí hasta la altura de los hombros, no más','Pensá en llevar los codos hacia afuera','Bajá controlado'],err:'Subir con impulso o encoger los hombros'},
  plank:{eq:['floor'],A:{h:[26,84],n:[34,88],p:[68,93],k:[86,100],f:[104,108],e:[34,108],a:[48,108]},B:{h:[26,84],n:[34,88],p:[68,91],k:[86,99],f:[104,108],e:[34,108],a:[48,108]},
    cues:['Codos debajo de los hombros','Cuerpo recto: apretá abdomen y glúteos','Respirá normal, sin aguantar el aire','Mirada al piso, cuello neutro'],err:'Subir o hundir la cadera'},
  calf:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[60,51],a:[60,64]},B:{h:[61,20],n:[60,30],p:[59,60],k:[60,82],f:[62,106],e:[60,45],a:[60,58]},
    cues:['Subí lo más alto que puedas','Pausa arriba de 1 segundo','Bajá lento hasta estirar el gemelo','Rodillas estiradas pero no trabadas'],err:'Rebotar rápido sin recorrido completo'},
  fl:{eq:['pullbar'],A:{h:[33,18],n:[42,16],p:[78,18],k:[94,18],f:[110,18],e:[40,14],a:[40,12]},B:{h:[33,19],n:[42,17],p:[78,20],k:[94,20],f:[110,20],e:[40,14],a:[40,12]},
    cues:['Brazos estirados y hombros bajos','Cuerpo rígido como una tabla','Empujá la barra hacia la cadera con los dorsales','Arrancá con la versión encogida (rodillas al pecho)'],err:'Doblar los codos o dejar caer la cadera'},
  planche:{eq:['floor'],A:{h:[37,88],n:[46,92],p:[78,92],k:[94,92],f:[110,92],e:[43,101],a:[40,110]},B:{h:[37,89],n:[46,93],p:[78,94],k:[94,94],f:[110,94],e:[43,101],a:[40,110]},
    cues:['Brazos completamente estirados','Inclinate adelante: los hombros pasan las manos','Espalda alta redondeada, empujando el piso','Arrancá encogido y con mucha paciencia'],err:'Doblar los codos'},
  hs:{eq:['floor'],A:{h:[61,96],n:[60,86],p:[60,56],k:[60,36],f:[60,16],e:[60,98],a:[60,110]},B:{h:[61,96],n:[60,86],p:[61,56],k:[62,36],f:[63,16],e:[60,98],a:[60,110]},
    cues:['Manos al ancho de hombros, dedos abiertos','Empujá el piso: hombros al lado de las orejas','Cuerpo en línea, glúteos y piernas apretados','Corregí el equilibrio con los dedos'],err:'Arquear mucho la espalda (forma de banana)'},
  lsit:{eq:['bars'],A:{h:[57,48],n:[56,58],p:[58,90],k:[80,90],f:[100,90],e:[54,76],a:[52,92]},B:{h:[57,47],n:[56,57],p:[58,89],k:[80,88],f:[100,87],e:[54,75],a:[52,92]},
    cues:['Brazos estirados y hombros bien abajo','Piernas juntas y estiradas a 90°','Apuntá los pies','Arrancá con las rodillas encogidas'],err:'Hombros encogidos hacia las orejas'}
};
/* figuras que faltaban (mismo sistema: perfil, piso en y=110; c = punto fijo de una polea) */
Object.assign(TECH,{
  fly:{front:1,eq:['floor','cables'],A:{h:[60,26],n:[60,36],p:[60,68],k:[54,88],f:[52,110],k2:[66,88],f2:[68,110],e:[44,44],a:[30,48],e2:[76,44],a2:[90,48]},B:{h:[60,26],n:[60,36],p:[60,68],k:[54,88],f:[52,110],k2:[66,88],f2:[68,110],e:[50,52],a:[58,62],e2:[70,52],a2:[62,62]},
    cues:['Codos apenas flexionados todo el recorrido','Juntá las manos adelante como abrazando un árbol','Apretá el pecho en el centro','Volvé lento hasta sentir el estiramiento'],err:'Doblar y estirar los codos (se vuelve un press)'},
  shrug:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[60,51],a:[60,66],b:[61,68]},B:{h:[61,22],n:[60,31],p:[59,66],k:[60,88],f:[60,110],e:[60,46],a:[60,61],b:[61,63]},
    cues:['Brazos estirados: solo se mueven los hombros','Subí los hombros hacia las orejas','Pausa de 1 segundo arriba','Sin girar los hombros en círculo'],err:'Doblar los codos para ayudar'},
  pushdown:{eq:['floor'],A:{h:[63,27],n:[62,37],p:[58,66],k:[60,88],f:[60,110],e:[64,57],a:[72,44],c:[78,4]},B:{h:[63,27],n:[62,37],p:[58,66],k:[60,88],f:[60,110],e:[64,57],a:[67,76],c:[78,4]},
    cues:['Codos pegados al cuerpo y quietos','Empujá hasta estirar del todo','Volvé controlado hasta 90°','Torso apenas inclinado y firme'],err:'Mover los codos o usar el cuerpo'},
  skull:{eq:['bench'],A:{h:[24,76],n:[33,78],p:[70,80],k:[88,82],f:[96,110],e:[36,58],a:[37,40],b:[37,39]},B:{h:[24,76],n:[33,78],p:[70,80],k:[88,82],f:[96,110],e:[36,58],a:[24,62],b:[23,61]},
    cues:['Brazos apuntando al techo y quietos','Bajá la barra hacia la frente doblando solo los codos','Estirá apretando el tríceps','Peso moderado: es un ejercicio de control'],err:'Abrir los codos hacia los costados'},
  wrist:{eq:['seat'],A:{h:[48,44],n:[48,54],p:[50,84],k:[72,84],f:[72,110],e:[66,80],a:[80,84],b:[81,85]},B:{h:[48,44],n:[48,54],p:[50,84],k:[72,84],f:[72,110],e:[66,80],a:[80,74],b:[81,73]},
    cues:['Antebrazo apoyado en el muslo','Solo se mueve la muñeca','Subí y bajá en todo el recorrido','Peso liviano y muchas repeticiones'],err:'Levantar el antebrazo del muslo'},
  legext:{eq:['seat'],A:{h:[45,40],n:[46,50],p:[50,80],k:[72,80],f:[74,104],e:[52,66],a:[58,80]},B:{h:[45,40],n:[46,50],p:[50,80],k:[72,80],f:[96,76],e:[52,66],a:[58,80]},
    cues:['Espalda apoyada en el respaldo','Estirá las rodillas del todo','Pausa arriba apretando el cuádriceps','Bajá lento, sin soltar'],err:'Patear rápido y dejar caer el peso'},
  legcurl:{eq:['bench'],A:{h:[20,74],n:[29,78],p:[64,80],k:[84,80],f:[104,80],e:[30,90],a:[40,84]},B:{h:[20,74],n:[29,78],p:[64,80],k:[84,80],f:[88,58],e:[30,90],a:[40,84]},
    cues:['Cadera pegada al banco','Llevá los talones hacia los glúteos','Pausa arriba','Bajá controlado hasta estirar'],err:'Levantar la cadera para ayudar'},
  crunch:{eq:['floor'],A:{h:[21,103],n:[30,104],p:[60,104],k:[76,86],f:[90,108],e:[34,96],a:[24,98]},B:{h:[30,84],n:[38,91],p:[60,104],k:[76,86],f:[90,108],e:[42,82],a:[33,80]},
    cues:['Pies apoyados y rodillas dobladas','Subí enrollando la espalda, sin tirar del cuello','Exhalá al subir','Bajá lento hasta apoyar los hombros'],err:'Tirar de la cabeza con las manos'},
  legraise:{eq:['pullbar'],A:{h:[63,31],n:[60,38],p:[60,70],k:[60,88],f:[60,106],e:[60,25],a:[60,12]},B:{h:[63,31],n:[60,38],p:[58,70],k:[78,70],f:[96,68],e:[60,25],a:[60,12]},
    cues:['Colgado con los hombros activos','Subí las piernas estiradas hasta 90°','Sin balancearte','Bajá lento'],err:'Usar impulso y balancearse'},
  russian:{eq:['floor'],A:{h:[44,62],n:[48,72],p:[62,100],k:[80,86],f:[94,94],e:[60,84],a:[70,80]},B:{h:[45,62],n:[48,72],p:[62,100],k:[80,86],f:[94,94],e:[50,86],a:[42,92]},
    cues:['Torso inclinado atrás, espalda recta','Pies apenas levantados (o apoyados para empezar)','Girá el torso de lado a lado','Las manos acompañan el giro'],err:'Mover solo los brazos sin girar el torso'},
  flag:{eq:['pole'],A:{h:[38,44],n:[40,46],p:[76,50],k:[94,52],f:[110,52],e:[34,42],a:[30,38],e2:[34,58],a2:[30,64]},B:{h:[38,45],n:[40,47],p:[76,52],k:[94,54],f:[110,55],e:[34,42],a:[30,38],e2:[34,58],a2:[30,64]},
    cues:['Mano de arriba tira, mano de abajo empuja','Brazos estirados','Cuerpo rígido y horizontal','Arrancá con piernas encogidas o abiertas'],err:'Doblar el brazo de abajo'},
  jump:{eq:['box'],A:{h:[52,52],n:[48,62],p:[34,86],k:[50,96],f:[40,110],e:[40,76],a:[30,84]},B:{h:[79,20],n:[78,30],p:[76,58],k:[84,70],f:[82,82],e:[86,40],a:[92,48]},
    cues:['Bajá un poco y usá los brazos para impulsarte','Caé suave, con las rodillas dobladas','Pararte del todo arriba','Bajá caminando, no saltando'],err:'Caer con las rodillas trabadas'},
  nordic:{eq:['floor'],A:{h:[60,40],n:[60,50],p:[60,80],k:[60,108],f:[84,106],e:[64,58],a:[60,62]},B:{h:[13,61],n:[20,68],p:[41,89],k:[60,108],f:[84,106],e:[24,82],a:[22,94]},
    cues:['Rodillas apoyadas y talones trabados','Bajá lo más lento que puedas','Cuerpo recto de las rodillas a la cabeza','Frená la caída con las manos'],err:'Doblar la cadera para no caer'},
  sideplank:{eq:['bench'],A:{h:[24,84],n:[32,88],p:[60,92],k:[78,86],f:[96,82],e:[30,108],a:[44,108],e2:[44,82],a2:[56,88]},B:{h:[24,82],n:[32,86],p:[60,86],k:[78,84],f:[96,82],e:[30,108],a:[44,108],e2:[44,78],a2:[56,82]},
    cues:['Pierna de arriba apoyada en el banco','Codo debajo del hombro','Cadera arriba, cuerpo en línea','Aguantá respirando normal'],err:'Dejar caer la cadera'},
  pallof:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[66,52],a:[68,46],c:[4,46]},B:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[76,46],a:[90,46],c:[4,46]},
    cues:['Parado de costado a la polea','Llevá las manos del pecho hacia adelante','No dejes que el cuerpo gire','Abdomen apretado todo el tiempo'],err:'Rotar el torso hacia la polea'},
  slam:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[62,18],a:[62,6],b:[62,2]},B:{h:[72,44],n:[66,52],p:[50,78],k:[66,92],f:[60,110],e:[72,70],a:[74,98],b:[74,102]},
    cues:['Subí la pelota bien arriba','Tirala al piso con todo el cuerpo','Doblá las piernas al lanzar','Agarrala del rebote y repetí'],err:'Lanzar solo con los brazos'},
  carry:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[60,66],k:[66,88],f:[70,110],k2:[54,88],f2:[50,110],e:[60,51],a:[60,66],b:[60,68]},B:{h:[61,28],n:[60,38],p:[60,68],k:[54,88],f:[50,110],k2:[66,88],f2:[70,110],e:[60,53],a:[60,68],b:[60,70]},
    cues:['Peso pesado en cada mano','Pecho arriba y hombros atrás','Pasos cortos y firmes','Abdomen apretado'],err:'Encorvarse o inclinarse para un lado'},
  vjump:{eq:['floor'],A:{h:[64,46],n:[62,56],p:[48,80],k:[64,92],f:[58,110],e:[52,70],a:[44,82]},B:{h:[61,14],n:[60,24],p:[59,54],k:[60,74],f:[60,94],e:[70,18],a:[80,10]},
    cues:['Bajada rápida a un cuarto de sentadilla','Usá los brazos: tiralos hacia arriba','Extendé tobillos, rodillas y cadera juntos','Caé suave, con las rodillas dobladas'],err:'Bajar demasiado lento (se pierde el rebote)'},
  broad:{eq:['floor'],A:{h:[44,54],n:[38,62],p:[22,84],k:[38,94],f:[30,110],e:[28,74],a:[20,82]},B:{h:[98,54],n:[92,62],p:[78,86],k:[96,94],f:[88,110],e:[100,72],a:[108,66]},
    cues:['Balanceá los brazos atrás y adelante','Empujá con todo hacia adelante y arriba','Caé con los dos pies y aguantá la posición','Descansá bien entre saltos'],err:'Caer con las rodillas hacia adentro'},
  sprint:{eq:['floor'],A:{h:[66,26],n:[64,36],p:[58,66],k:[74,80],f:[68,100],k2:[50,88],f2:[38,104],e:[54,50],a:[60,62],e2:[74,46],a2:[80,36]},B:{h:[66,26],n:[64,36],p:[58,66],k:[50,88],f:[38,104],k2:[74,80],f2:[68,100],e:[74,46],a:[80,36],e2:[54,50],a2:[60,62]},
    cues:['Primeros pasos cortos y potentes, inclinado','Brazos fuertes, de la cadera a la cara','Pisá debajo del cuerpo, no adelante','Descanso completo entre sprints'],err:'Hacerlos cansado: pierde el sentido'},
  hang:{eq:['pullbar'],A:{h:[60,30],n:[60,40],p:[60,72],k:[60,90],f:[60,106],e:[60,26],a:[60,12]},B:{h:[61,31],n:[60,41],p:[61,73],k:[62,91],f:[62,107],e:[60,26],a:[60,12]},
    cues:['Agarre firme, brazos estirados','Hombros activos (alejalos un poco de las orejas)','Cuerpo quieto, sin balancearte','Respirá tranquilo'],err:'Soltar los hombros del todo'},
  neck:{eq:['floor'],A:{h:[61,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[72,38],a:[68,24]},B:{h:[60,26],n:[60,36],p:[59,66],k:[60,88],f:[60,110],e:[71,38],a:[67,24]},
    cues:['Mano en la frente (o en el costado de la cabeza)','Empujá la cabeza contra la mano sin moverla','10 a 20 segundos por lado','Fuerza suave y progresiva'],err:'Hacer fuerza de golpe'}
});
/* qué figura usa cada ejercicio */
function techOf(ex){
  if(!ex)return null;const id=ex.id,f=ex.sk&&ex.sk.f;
  /* SW-7: cada ejercicio con su propia figura (XT, más abajo) */
  if(XT[id]&&XT[id].k&&TECH[XT[id].k])return XT[id].k;
  const SKX={tuckfl:'fltuck',advfl:'fladv',onelegfl:'flone',straddlefl:'flstr',fullfl:'flfull',austrow:'invrow',airsquat:'airsq',skincat:'skincat',tuckbl:'bltuck',advbl:'bladv',straddlebl:'blstr',fullbl:'blfull',
    crow:'crow',pllean:'pllean',tuckpl:'pltuck',advpl:'pladv',straddlepl:'plstr',fullpl:'planche',tucklsit:'lsittuck',onelegl:'lsitone',lsit:'lsit',vsit:'vsit',
    pikepush:'pike',wallhs:'wallhs',freehs:'hs',hspu:'hspu',freehspu:'freehspu',vflag:'vflag',tuckflag:'flagtuck',straddleflag:'flagstr',flag:'flag',russiandip:'russiandip',impdip:'russiandip',boxpistol:'boxpistol',
    kneepush:'kneepush',diamond:'diamond',archerpush:'archerpush',pppush:'pppush',oapush:'oapush',lpullup:'lpullup',archerpull:'archerpull',oapull:'oapull',muscleup:'muscleup',
    benchdip:'benchdip',ringdip:'ringdip',shrimp:'shrimp',dragon:'dragon'};
  if(SKX[id])return SKX[id];
  if(f==='fl'||f==='bl')return 'fl';if(f==='pl')return 'planche';if(id==='pppush')return 'pushup';if(f==='hs')return 'hs';if(f==='lsit')return 'lsit';
  const M={squat:'squat',frontsquat:'squat',legpress:'squat',airsquat:'squat',jumpsquat:'squat',shrimp:'pistol',pistol:'pistol',dragon:'pistol',
    deadlift:'hinge',rdl:'hinge',kbswing:'hinge',hyper:'hinge',hipthrust:'thrust',bench:'bench',incbench:'bench',dbpress:'bench',dbfly:'bench',
    ohp:'press',dbohp:'press',row:'row',dbrow:'row',cablerow:'row',facepull:'row',pullup:'pullup',latpull:'pullup',lpullup:'pullup',archerpull:'pullup',
    muscleup:'pullup',oapull:'pullup',austrow:'row',pushup:'pushup',kneepush:'pushup',diamond:'pushup',archerpush:'pushup',oapush:'pushup',
    planchepush:'planche',dips:'dip',benchdip:'dip',ringdip:'dip',lunge:'lunge',bulgarian:'lunge',curl:'curl',dbcurl:'curl',hammer:'curl',
    lateral:'lateral',plank:'plank',calf:'calf',seatedcalf:'calf',pppush:'pushup',
    cablefly:'fly',dbfly:'bench',shrug:'shrug',pushdown:'pushdown',skull:'skull',wrist:'wrist',legext:'legext',legcurl:'legcurl',crunch:'crunch',legraise:'legraise',
    russian:'russian',flag:'flag',spansq:'squat',tibraise:'calf',slcalf:'calf',slbal:'calf',kneewall:'lunge',slbridge:'thrust',sidepl:'sideplank',birddog:'plank',curlup:'crunch',biering:'hinge',deadhang:'hang',extrot:'pallof',wallslide:'press',cmj:'vjump',broadjump:'broad',pogo:'calf',skater:'lunge',sprint:'sprint',boxjump:'jump',nordic:'nordic',copenhagen:'sideplank',pallof:'pallof',medslam:'slam',farmer:'carry',neckiso:'neck'};
  if(M[id])return M[id];
  /* ejercicios propios: la figura del músculo principal */
  const BYM={pecho:'bench',dorsales:'row',trapecio:'shrug',hombros:'press',biceps:'curl',triceps:'pushdown',antebrazos:'wrist',cuadriceps:'squat',isquios:'legcurl',gluteos:'thrust',gemelos:'calf',tibial:'x_tibraise',aductores:'sideplank',lumbar:'hinge',abs:'crunch',oblicuos:'russian'};
  return (ex.p&&BYM[ex.p[0]])||'plank';
}
/* sentadilla sin peso: la misma postura pero sin la barra */
if(TECH.squat&&!TECH.airsq){const nb=o=>{const c=Object.assign({},o);delete c.b;return c;};TECH.airsq={eq:TECH.squat.eq,A:Object.assign(nb(TECH.squat.A),{e:[70,42],a:[82,40]}),B:Object.assign(nb(TECH.squat.B||{}),{e:[78,62],a:[92,60]})};}
/* ============ Poses armadas con articulaciones ============
   Cada pose se describe con ángulos (grados: 0 derecha, 90 abajo, 180 izquierda, 270 arriba; la figura mira a la derecha)
   y largos de cuerpo fijos, así las proporciones siempre dan bien. "at" dice qué punto queda fijo y dónde (el pie en el piso,
   la mano en la barra...). t torso (cuello→cadera), th muslo, sh pierna, ua brazo, fa antebrazo; th2/sh2/ua2/fa2 la otra pierna o brazo.
   b: dónde va el peso (disco o mancuerna); c: anclaje de la polea. */
const PZ=(()=>{
  const LB={t:30,hd:9,th:20,sh:19,ua:14,fa:13,ft:8},dir=a=>[Math.cos(a*Math.PI/180),Math.sin(a*Math.PI/180)],go=(p,a,l)=>{const d=dir(a);return[p[0]+d[0]*l,p[1]+d[1]*l];};
  return s=>{
    /* ls: escala de un tramo para dibujar en perspectiva (ej. el brazo que se abre hacia el costado en las aperturas) */
    const L=s.ls?Object.fromEntries(Object.entries(LB).map(([k,v])=>[k,v*(s.ls[k]||1)])):LB,L2=k=>s.ls&&s.ls[k+'2']!=null?LB[k]*s.ls[k+'2']:L[k]; /* L2: largo propio del brazo o la pierna de atrás */
    const P={n:[0,0]};P.h=go(P.n,s.hd!=null?s.hd:s.t+180,L.hd); /* hd: ángulo propio de la cabeza */P.p=go(P.n,s.t,L.t);P.k=go(P.p,s.th,L.th);P.f=go(P.k,s.sh,L.sh);P.e=go(P.n,s.ua,L.ua);P.a=go(P.e,s.fa,L.fa);
    if(s.th2!=null){P.k2=go(P.p,s.th2,L2('th'));P.f2=go(P.k2,s.sh2!=null?s.sh2:s.th2,L2('sh'));}
    /* ft: el pie (tobillo → punta), para que se vea apoyado en el piso o en el borde del escalón */
    if(s.ft!=null)P.t=go(P.f,s.ft,L.ft);if(s.ft2!=null&&P.f2)P.t2=go(P.f2,s.ft2,L.ft);
    if(s.ua2!=null){P.e2=go(P.n,s.ua2,L2('ua'));P.a2=go(P.e2,s.fa2!=null?s.fa2:s.ua2,L2('fa'));}
    const an=P[s.at[0]],dx=s.at[1]-an[0],dy=s.at[2]-an[1],o={},r=v=>Math.round(v*10)/10;
    for(const k in P)o[k]=[r(P[k][0]+dx),r(P[k][1]+dy)];
    if(s.b){const q=typeof s.b==='string'?o[s.b]:s.b,bd=s.bd||[0,0];o.b=[r(q[0]+bd[0]),r(q[1]+bd[1])];}
    if(s.c)o.c=s.c;return o;
  };
})();
/* de pie, brazos al costado */
const ST={t:90,th:90,sh:90,ua:96,fa:92,at:['f',60,108]};
const HANG={t:95,th:95,sh:112,ua:300,fa:290,at:['a',64,12]},PUTOP={t:95,th:100,sh:115,ua:60,fa:280,at:['a',64,12]};
const PU_A={t:22,th:22,sh:22,ua:90,fa:90,at:['a',26,108]},PU_B={t:14,th:15,sh:15,ua:45,fa:125,at:['a',26,108]};
const DIP_A={t:95,th:100,sh:150,ua:95,fa:90,at:['a',60,63]},DIP_B={t:75,th:95,sh:150,ua:135,fa:60,at:['a',60,63]};
const HS_A={t:270,th:270,sh:270,ua:90,fa:90,at:['a',60,108]};
const POSE={
  squat:{A:Object.assign({},ST,{ua:150,fa:300,b:'n',bd:[-3,-2]}),B:{t:125,th:5,sh:100,ua:150,fa:300,at:['f',60,108],b:'n',bd:[-3,-2]}},
  airsq:{A:Object.assign({},ST,{ft:0}),B:{t:125,th:5,sh:100,ft:0,ua:10,fa:0,at:['f',60,108]}},
  hinge:{A:Object.assign({},ST,{ua:92,fa:90,b:'a',bd:[0,2]}),B:{t:150,th:75,sh:100,ua:90,fa:90,at:['f',62,108],b:'a',bd:[0,2]}},
  thrust:{A:{t:28,th:-28,sh:95,ua:180,fa:170,at:['n',28,88],b:'p',bd:[0,-6]},B:{t:0,th:-3,sh:110,ua:180,fa:170,at:['n',28,88],b:'p',bd:[0,-6]}},
  bench:{A:{t:0,th:10,sh:85,ua:275,fa:270,at:['n',32,79],b:'a'},B:{t:0,th:10,sh:85,ua:110,fa:290,at:['n',32,79],b:'a'}},
  press:{A:Object.assign({},ST,{ua:70,fa:280,b:'a'}),B:Object.assign({},ST,{ua:275,fa:272,b:'a'})},
  row:{A:{t:140,th:80,sh:100,ua:90,fa:90,at:['f',64,108],b:'a',bd:[0,2]},B:{t:140,th:80,sh:100,ua:165,fa:80,at:['f',64,108],b:'a',bd:[0,2]}},
  pullup:{A:HANG,B:PUTOP},
  hang:{A:HANG,B:Object.assign({},HANG,{t:97})},
  legraise:{A:HANG,B:Object.assign({},HANG,{t:97,th:-5,sh:-5})},
  pushup:{A:PU_A,B:PU_B},
  plank:{A:{t:12,th:12,sh:12,ua:90,fa:180,at:['e',32,106]},B:{t:11,th:12,sh:12,ua:90,fa:180,at:['e',32,106]}},
  calf:{A:ST,B:Object.assign({},ST,{at:['f',60,103]})},
  curl:{A:Object.assign({},ST,{ua:95,fa:90,b:'a'}),B:Object.assign({},ST,{ua:95,fa:300,b:'a'})},
  pushdown:{A:Object.assign({},ST,{ua:95,fa:330,at:['f',56,108],c:[96,6]}),B:Object.assign({},ST,{ua:95,fa:95,at:['f',56,108],c:[96,6]})},
  skull:{A:{t:0,th:10,sh:85,ua:280,fa:275,at:['n',32,79],b:'a'},B:{t:0,th:10,sh:85,ua:280,fa:160,at:['n',32,79],b:'a'}},
  dip:{A:DIP_A,B:DIP_B},
  lunge:{A:{t:90,th:80,sh:95,th2:100,sh2:95,ua:96,fa:92,at:['f',76,108]},B:{t:90,th:5,sh:95,th2:100,sh2:170,ua:96,fa:92,at:['f',76,108]}},
  hs:{A:HS_A,B:Object.assign({},HS_A,{t:272,th:272,sh:274})},
  wallhs:{A:Object.assign({},HS_A,{t:274,th:276,sh:276,at:['a',54,108]}),B:Object.assign({},HS_A,{t:275,th:277,sh:278,at:['a',54,108]})},
  hspu:{A:Object.assign({},HS_A,{t:274,th:276,sh:276,at:['a',54,108]}),B:{t:276,th:277,sh:278,ua:40,fa:130,at:['a',54,108]}},
  freehspu:{A:HS_A,B:{t:272,th:272,sh:272,ua:40,fa:130,at:['a',60,108]}},
  pistol:{A:Object.assign({},ST,{th2:65,sh2:80,ft:0,ft2:10}),B:{t:115,th:20,sh:110,th2:-5,sh2:-5,ft:0,ft2:-70,ua:0,fa:0,at:['f',58,108]}},
  /* variantes del árbol: cada una con su dibujo */
  kneepush:{A:{t:30,th:30,sh:-25,ua:90,fa:90,at:['a',28,108]},B:{t:20,th:22,sh:-25,ua:45,fa:125,at:['a',28,108]}},
  diamond:{A:PU_A,B:Object.assign({},PU_B,{ua:70,fa:112})},
  archerpush:{A:Object.assign({},PU_A,{ua2:165,fa2:180}),B:Object.assign({},PU_B,{ua2:160,fa2:178})},
  pppush:{A:{t:18,th:20,sh:20,ua:60,fa:70,at:['a',48,108]},B:{t:12,th:15,sh:15,ua:20,fa:100,at:['a',48,108]}},
  oapush:{A:Object.assign({},PU_A,{ua2:10,fa2:4,th2:30,sh2:30}),B:Object.assign({},PU_B,{ua2:4,fa2:0,th2:22,sh2:22})},
  lpullup:{A:Object.assign({},HANG,{th:-3,sh:-3}),B:Object.assign({},PUTOP,{th:-3,sh:-3})},
  archerpull:{A:Object.assign({},HANG,{ua2:300,fa2:290}),B:Object.assign({},PUTOP,{ua2:315,fa2:315})},
  oapull:{A:Object.assign({},HANG,{ua2:100,fa2:95}),B:Object.assign({},PUTOP,{ua2:100,fa2:95})},
  muscleup:{A:HANG,B:{t:70,th:110,sh:100,ua:150,fa:330,at:['a',64,12]}},
  benchdip:{A:{t:88,th:0,sh:90,ua:100,fa:95,at:['a',30,83]},B:{t:88,th:-8,sh:95,ua:150,fa:60,at:['a',30,83]}},
  ringdip:{A:DIP_A,B:DIP_B},
  russiandip:{A:DIP_A,B:{t:80,th:100,sh:150,ua:110,fa:0,at:['a',72,63]}},
  shrimp:{A:Object.assign({},ST,{th2:100,sh2:200,ft:0,ua:20,fa:10}),B:{t:110,th:25,sh:105,ft:0,th2:110,sh2:190,ua:15,fa:5,at:['f',60,108]}},
  dragon:{A:Object.assign({},ST,{th2:110,sh2:120,ft:0,ua:10,fa:0}),B:{t:115,th:20,sh:110,ft:0,th2:120,sh2:175,ua:0,fa:0,at:['f',60,108]}},
  boxpistol:{A:Object.assign({},ST,{th2:65,sh2:80,ft:0,ft2:10,ua:0,fa:0}),B:{t:105,th:10,sh:105,ft:0,ft2:-70,th2:-5,sh2:-5,ua:0,fa:0,at:['f',64,108]}}
};
/* figuras nuevas: equipo y claves propias */
const NEWTQ={
  kneepush:{eq:['floor'],cues:['Rodillas apoyadas, cuerpo recto de rodillas a cabeza','Manos un poco más abiertas que los hombros','Bajá el pecho hasta casi tocar el piso','Empujá sin aflojar la cadera'],err:'Sacar la cola para arriba'},
  diamond:{eq:['floor'],cues:['Manos juntas formando un rombo','Codos pegados al cuerpo al bajar','Cuerpo en línea recta','Empujá con los tríceps'],err:'Abrir los codos hacia afuera'},
  archerpush:{eq:['floor'],cues:['Manos bien abiertas','Bajá hacia un lado, el otro brazo queda estirado','Cuerpo recto, sin rotar','Alterná los lados'],err:'Doblar el brazo que tiene que quedar estirado'},
  pppush:{eq:['floor'],cues:['Manos a la altura de la cintura, dedos hacia atrás','Hombros bien adelante de las manos','Cuerpo rígido como una tabla','Bajá sin perder la inclinación'],err:'Volver los hombros atrás de las manos'},
  oapush:{eq:['floor'],cues:['Piernas abiertas para equilibrar','La otra mano en la espalda','Bajá sin rotar la cadera','Empujá con el pecho y el tríceps'],err:'Girar el cuerpo para ayudarte'},
  lpullup:{eq:['pullbar'],cues:['Piernas rectas a 90° todo el recorrido','Subí hasta pasar el mentón','Sin balancear las piernas','Bajá controlado'],err:'Dejar caer las piernas al subir'},
  archerpull:{eq:['pullbar'],cues:['Agarre muy abierto','Subí hacia una mano','El otro brazo queda casi recto','Alterná los lados'],err:'Doblar los dos brazos por igual'},
  oapull:{eq:['pullbar'],cues:['Colgado de una mano, hombro activo','La otra mano libre o en el pecho','Subí hasta pasar el mentón','Bajá lento'],err:'Girar el cuerpo para llegar'},
  muscleup:{eq:['pullbar'],cues:['Dominada explosiva, bien alta','Llevá el pecho por encima de la barra','Pasá los codos rápido arriba','Terminá con un fondo arriba de la barra'],err:'Pasar un brazo antes que el otro'},
  benchdip:{eq:['bench'],cues:['Manos en el banco detrás tuyo','Bajá doblando los codos a 90°','Espalda cerca del banco','Empujá hasta estirar los brazos'],err:'Bajar demasiado y forzar el hombro'},
  ringdip:{eq:['rings'],cues:['Anillas pegadas al cuerpo arriba','Bajá controlando que no se abran','Codos atrás hasta 90°','Empujá hasta trabar los brazos'],err:'Dejar que las anillas se abran'},
  russiandip:{eq:['bars'],cues:['Bajá en el fondo hasta apoyar los antebrazos','Pasá el peso a los antebrazos','Volvé a subir a brazos rectos','Movimiento controlado'],err:'Caer de golpe sobre los antebrazos'},
  shrimp:{eq:['floor'],cues:['Agarrá el pie de atrás con la mano','Bajá hasta apoyar la rodilla de atrás','Torso un poco inclinado adelante','Subí empujando con la pierna de adelante'],err:'Golpear la rodilla contra el piso'},
  dragon:{eq:['floor'],cues:['La pierna libre cruza por detrás','Bajá con control sobre una pierna','Rodilla de apoyo en la línea del pie','Subí sin apoyar la otra pierna'],err:'Apoyarte en la pierna de atrás'},
  boxpistol:{eq:['floor','boxl'],cues:['Cajón o banco bajo detrás tuyo','Bajá en una pierna hasta sentarte','La otra pierna estirada adelante','Subí sin impulso'],err:'Dejarte caer sobre el cajón'}
};
Object.keys(NEWTQ).forEach(k=>{if(!TECH[k])TECH[k]=NEWTQ[k];});
Object.keys(POSE).forEach(k=>{const T=TECH[k];if(!T)return;T.A=PZ(POSE[k].A);T.B=PZ(POSE[k].B);});
/* figura de espaldas: hombros y cadera con ancho, brazos y piernas de los dos lados (para los ejercicios que de costado no se distinguen) */
const FZ=(()=>{const LB={ua:14,fa:13,th:20,sh:19},dir=a=>[Math.cos(a*Math.PI/180),Math.sin(a*Math.PI/180)],go=(p,a,l)=>{const d=dir(a);return[p[0]+d[0]*l,p[1]+d[1]*l];};
  return s=>{const L=s.ls?Object.fromEntries(Object.entries(LB).map(([k,v])=>[k,v*(s.ls[k]||1)])):LB,S=(k,sd)=>s.ls&&s.ls[k+sd]!=null?LB[k]*s.ls[k+sd]:L[k]; /* S: largo por lado (ls.faR, ls.thR) */ /* ls: perspectiva (muslos hacia adelante al estar sentado) */
    const tw=s.tw||0,sw=s.sw||1,tk=s.tk||1; /* tw/sw: el torso que gira (giro ruso); tk: torso inclinado atrás, se ve más corto */
    const P={n:[tw,0],h:[tw,-9],p:[0,30*tk],sL:[-9*sw+tw,3],sR:[9*sw+tw,3],hL:[-5,30*tk],hR:[5,30*tk]};
    P.eL=go(P.sL,s.uaL,S('ua','L'));P.aL=go(P.eL,s.faL,S('fa','L'));P.eR=go(P.sR,s.uaR,S('ua','R'));P.aR=go(P.eR,s.faR,S('fa','R'));
    P.kL=go(P.hL,s.thL,S('th','L'));P.fL=go(P.kL,s.shL,S('sh','L'));P.kR=go(P.hR,s.thR,S('th','R'));P.fR=go(P.kR,s.shR,S('sh','R'));
    const an=P[s.at[0]],dx=s.at[1]-an[0],dy=s.at[2]-an[1],o={},r=v=>Math.round(v*10)/10;for(const k in P)o[k]=[r(P[k][0]+dx),r(P[k][1]+dy)];if(s.b)o.b=typeof s.b==='string'?o[s.b]:s.b;return o;};})();
const BK_LEGS={thL:96,shL:92,thR:84,shR:88};
const BK={
  pullup:{A:Object.assign({uaL:232,faL:252,uaR:308,faR:288,at:['aL',41,12]},BK_LEGS),B:Object.assign({uaL:168,faL:282,uaR:12,faR:258,at:['aL',41,12]},BK_LEGS)},
  hang:{A:Object.assign({uaL:232,faL:252,uaR:308,faR:288,at:['aL',41,12]},BK_LEGS),B:Object.assign({uaL:234,faL:254,uaR:306,faR:286,at:['aL',41,12]},BK_LEGS)},
  archerpull:{A:Object.assign({uaL:224,faL:224,uaR:316,faR:316,at:['aL',36,12]},BK_LEGS),B:Object.assign({uaL:168,faL:282,uaR:350,faR:352,at:['aL',36,12]},BK_LEGS)},
  oapull:{A:Object.assign({uaL:262,faL:268,uaR:80,faR:88,at:['aL',58,12]},BK_LEGS),B:Object.assign({uaL:205,faL:300,uaR:60,faR:95,at:['aL',58,12]},BK_LEGS)}
};
Object.keys(BK).forEach(k=>{const T=TECH[k];if(!T)return;T.front=1;T.A=FZ(BK[k].A);T.B=FZ(BK[k].B);});
function techSVG(k,stat){
  const T=TECH[k];if(!T)return '';
  /* que la figura se lea: el brazo que cae sobre el cuerpo se corre un poco adelante, y si la pose no trae el brazo y la pierna de atrás, se dibujan levemente corridos */
  const A0=Object.assign({},T.A),B0=Object.assign({},T.A,T.B),dseg=(q,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/L));return Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy);};
  /* el brazo se corre adelante solo en la posición donde de verdad tapa el torso (antes se decidía con A y se aplicaba también a B) */
  const armOver=P=>P.e&&P.n&&P.p&&(dseg(P.e,P.n,P.p)<5||(P.a&&dseg(P.a,P.n,P.p)<5)),mv=(p,dx)=>p&&[p[0]+dx,p[1]];
  const fix=P=>{if(armOver(P)){const inHand=P.b&&P.a&&Math.hypot(P.b[0]-P.a[0],P.b[1]-P.a[1])<10;P.e=mv(P.e,5);P.a=mv(P.a,5);if(inHand)P.b=mv(P.b,5);} /* el peso que va en la mano se corre con ella */if(!T.A.k2&&P.k&&P.f&&P.p){P.k2=mv(P.k,-4);P.f2=mv(P.f,-4);if(P.t)P.t2=mv(P.t,-4);}if(!T.A.e2&&P.e&&P.a&&P.n){P.e2=mv(P.e,-4);P.a2=mv(P.a,-4);}return P;};
  const A=T.front?A0:fix(A0),B=T.front?B0:fix(B0),D='2.8s',ks='keyTimes="0;.45;.55;1" calcMode="spline" keySplines=".45 0 .3 1;0 0 1 1;.45 0 .3 1"';
  const an=(attr,a,b)=>stat||a===b?'':'<animate attributeName="'+attr+'" values="'+a+';'+b+';'+b+';'+a+'" dur="'+D+'" repeatCount="indefinite" '+ks+'/>';
  const bone=(p,q,w,cls)=>A[p]&&A[q]?'<line class="'+(cls||'')+'" style="stroke-width:'+w+'" x1="'+A[p][0]+'" y1="'+A[p][1]+'" x2="'+A[q][0]+'" y2="'+A[q][1]+'">'+an('x1',A[p][0],B[p][0])+an('y1',A[p][1],B[p][1])+an('x2',A[q][0],B[q][0])+an('y2',A[q][1],B[q][1])+'</line>':'';
  const dot=(p,r,cls)=>A[p]?'<circle class="'+cls+'" cx="'+A[p][0]+'" cy="'+A[p][1]+'" r="'+r+'">'+an('cx',A[p][0],B[p][0])+an('cy',A[p][1],B[p][1])+'</circle>':'';
  const has=x=>T.eq.includes(x),fl='<line class="tq-floor" x1="4" y1="111" x2="116" y2="111"/>';
  let eq='';
  if(has('floor'))eq+=fl;
  if(has('bench')){const th=k==='thrust',sp=k==='sideplank';const x=th?8:sp?82:16,w=th?26:sp?30:62;eq+='<rect class="tq-eq" x="'+x+'" y="'+(th?92:sp?84:83)+'" width="'+w+'" height="6" rx="3"/><line class="tq-eq" x1="'+(x+5)+'" y1="88" x2="'+(x+5)+'" y2="110"/><line class="tq-eq" x1="'+(x+w-5)+'" y1="88" x2="'+(x+w-5)+'" y2="110"/>'+fl;}
  if(has('seat'))eq+='<rect class="tq-eq" x="36" y="85" width="40" height="6" rx="3"/><rect class="tq-eq" x="34" y="44" width="6" height="44" rx="3"/><line class="tq-eq" x1="56" y1="91" x2="56" y2="110"/>'+fl;
  const lv=/^(fl|bl|skincat)/.test(k),ls=/^(lsit|vsit)/.test(k);
  if(has('pullbar')){const by=T.barY||11;eq+='<line class="tq-eq" x1="'+(T.front?20:lv?24:36)+'" y1="'+by+'" x2="'+(T.front?100:lv?62:84)+'" y2="'+by+'"/>';} /* barY: barra más baja para que arriba entre la cabeza sobre la barra */
  if(has('lowbar'))eq+='<line class="tq-eq" x1="20" y1="46" x2="54" y2="46"/><line class="tq-eq" x1="24" y1="46" x2="24" y2="111"/>'+fl;
  if(has('wall')){const wx=T.wallX||70;eq+='<line class="tq-eq" x1="'+wx+'" y1="4" x2="'+wx+'" y2="111"/>';}
  if(has('bars'))eq+='<line class="tq-eq" x1="'+(ls?40:44)+'" y1="'+(ls?93:63)+'" x2="'+(ls?66:76)+'" y2="'+(ls?93:63)+'"/><line class="tq-eq" x1="'+(ls?46:70)+'" y1="'+(ls?93:63)+'" x2="'+(ls?46:70)+'" y2="111"/>'+fl;
  if(has('pole'))eq+='<line class="tq-eq" x1="28" y1="6" x2="28" y2="111"/>'+fl;
  if(has('boxl'))eq+='<rect class="tq-eq" x="20" y="90" width="30" height="20" rx="3"/>';
  if(has('rings'))eq+='<line class="tq-cab" x1="'+(A.a[0]-2)+'" y1="0" x2="'+A.a[0]+'" y2="'+(A.a[1]-7)+'">'+an('x2',A.a[0],B.a[0])+an('y2',A.a[1]-7,B.a[1]-7)+'</line><circle class="tq-eq" cx="'+A.a[0]+'" cy="'+(A.a[1]-3.5)+'" r="3.5">'+an('cx',A.a[0],B.a[0])+an('cy',A.a[1]-3.5,B.a[1]-3.5)+'</circle>'; /* la mano agarra el borde de abajo de la anilla */
  if(has('box'))eq+='<rect class="tq-eq" x="64" y="82" width="38" height="28" rx="3"/>'+fl;
  if(has('cables')){const p1=A.aL?'aL':'a',p2=A.aR?'aR':'a2',cy=T.cy||8;
    eq+='<line class="tq-cab" x1="8" y1="'+cy+'" x2="'+A[p1][0]+'" y2="'+A[p1][1]+'">'+an('x2',A[p1][0],B[p1][0])+an('y2',A[p1][1],B[p1][1])+'</line><line class="tq-cab" x1="112" y1="'+cy+'" x2="'+A[p2][0]+'" y2="'+A[p2][1]+'">'+an('x2',A[p2][0],B[p2][0])+an('y2',A[p2][1],B[p2][1])+'</line>';}
  /* SW-7: equipo de cada ejercicio */
  /* banco que sigue al torso (plano, inclinado o declinado): respaldo bajo la espalda, asiento bajo la cola y patas al piso */
  if(has('tbench')&&A.n&&A.p){const dx=A.p[0]-A.n[0],dy=A.p[1]-A.n[1],l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l;let nx=-uy,ny=ux;if(ny<0){nx=-nx;ny=-ny;}
    const o=6.5,x1=A.n[0]-ux*9+nx*o,y1=A.n[1]-uy*9+ny*o,x2=A.p[0]+nx*o,y2=A.p[1]+ny*o,sx=A.p[0]+nx*o,sy=A.p[1]+ny*o;
    eq+='<line class="tq-pad" x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'"/>'+
      (Math.abs(uy)>.15?'<line class="tq-pad" x1="'+(sx-2).toFixed(1)+'" y1="'+sy.toFixed(1)+'" x2="'+(sx+14).toFixed(1)+'" y2="'+sy.toFixed(1)+'"/>':'')+
      '<line class="tq-eq" x1="'+(sx+4).toFixed(1)+'" y1="'+(sy+3).toFixed(1)+'" x2="'+(sx+4).toFixed(1)+'" y2="110"/><line class="tq-eq" x1="'+((x1+x2)/2-6).toFixed(1)+'" y1="'+((y1+y2)/2+3).toFixed(1)+'" x2="'+((x1+x2)/2-6).toFixed(1)+'" y2="110"/>'+fl;}
  /* pared vista de frente, detrás del cuerpo: [x, y, ancho, alto] */
  if(T.wallRect){const w=T.wallRect;eq='<rect class="tq-wall" x="'+w[0]+'" y="'+w[1]+'" width="'+w[2]+'" height="'+w[3]+'" rx="2"/>'+eq;}
  /* bloques fijos (cajón, banco, soporte): [x, y, ancho, alto] */
  (T.blocks||[]).forEach(b=>{eq+='<rect class="tq-eq" x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="2.5"/>';});
  /* almohadillas y soportes en cualquier ángulo: [x1,y1,x2,y2, 'pad'|'eq'] (ej. el banco Scott) */
  (T.lines||[]).forEach(l=>{eq+='<line class="tq-'+(l[4]||'pad')+'" x1="'+l[0]+'" y1="'+l[1]+'" x2="'+l[2]+'" y2="'+l[3]+'"/>';});
  /* respaldo de máquina visto de frente (pec deck) */
  if(has('backrest'))eq+='<rect class="tq-eq" x="47" y="26" width="26" height="54" rx="4"/><line class="tq-eq" x1="60" y1="80" x2="60" y2="110"/>'+fl;
  /* palanca de máquina: va de su eje a la mano o al pie y se mueve con ellos; rodillo/agarre en la punta */
  if(T.lv){const j=T.lv.to||'a',pv=T.lv.pv;eq+='<line class="tq-lv" x1="'+pv[0]+'" y1="'+pv[1]+'" x2="'+A[j][0]+'" y2="'+A[j][1]+'">'+an('x2',A[j][0],B[j][0])+an('y2',A[j][1],B[j][1])+'</line><circle class="tq-eq" cx="'+pv[0]+'" cy="'+pv[1]+'" r="3.5"/>'+
    (T.lv.stand?'<line class="tq-eq" x1="'+pv[0]+'" y1="'+pv[1]+'" x2="'+T.lv.stand[0]+'" y2="110"/>':'');}
  /* cable que va a cualquier articulación (ej. tobillera en la patada de glúteo) */
  if(T.cable&&A[T.cable.to]){const j=T.cable.to,pv=T.cable.pv;eq+='<line class="tq-cab" x1="'+pv[0]+'" y1="'+pv[1]+'" x2="'+A[j][0]+'" y2="'+A[j][1]+'">'+an('x2',A[j][0],B[j][0])+an('y2',A[j][1],B[j][1])+'</line><circle class="tq-eq" cx="'+pv[0]+'" cy="'+pv[1]+'" r="3"/>';}
  /* plataforma que sigue al pie con el ángulo del riel (prensa, hack) */
  if(T.plat&&A[T.plat.j]){const j=T.plat.j,d=[Math.cos(T.plat.ang*Math.PI/180),Math.sin(T.plat.ang*Math.PI/180)],L=T.plat.len||9,e=(P,s)=>[(P[j][0]+s*d[0]*L).toFixed(1),(P[j][1]+s*d[1]*L).toFixed(1)],a1=e(A,-1),a2=e(A,1),b1=e(B,-1),b2=e(B,1);
    eq+='<line class="tq-pad" x1="'+a1[0]+'" y1="'+a1[1]+'" x2="'+a2[0]+'" y2="'+a2[1]+'">'+an('x1',a1[0],b1[0])+an('y1',a1[1],b1[1])+an('x2',a2[0],b2[0])+an('y2',a2[1],b2[1])+'</line>';}
  const cab=A.c?'<line class="tq-cab" x1="'+A.c[0]+'" y1="'+A.c[1]+'" x2="'+A.a[0]+'" y2="'+A.a[1]+'">'+an('x2',A.a[0],B.a[0])+an('y2',A.a[1],B.a[1])+'</line><circle class="tq-eq" cx="'+A.c[0]+'" cy="'+A.c[1]+'" r="3"/>':'';
  const shadow=A.f&&!lv&&!/^(legraise|pullup|flag|vflag|hang|lpullup|archerpull|oapull|muscleup|ringdip)/.test(k)?'<ellipse class="tq-sh" cx="'+A.f[0]+'" cy="111" rx="16" ry="2.5">'+an('cx',A.f[0],B.f[0])+'</ellipse>':'';
  /* mancuerna dibujada como mancuerna (manija con un disco chico en cada punta), que se mueve con la mano: así no se confunde con la barra (disco grande) */
  const dbAt=j=>A[j]?'<g transform="translate('+A[j][0]+' '+A[j][1]+')">'+(stat||(A[j][0]===B[j][0]&&A[j][1]===B[j][1])?'':'<animateTransform attributeName="transform" type="translate" values="'+A[j][0]+' '+A[j][1]+';'+B[j][0]+' '+B[j][1]+';'+B[j][0]+' '+B[j][1]+';'+A[j][0]+' '+A[j][1]+'" dur="'+D+'" repeatCount="indefinite" '+ks+'/>')+
    (T.dbRot?'<g transform="rotate('+T.dbRot+')"><rect class="tq-dbh" x="-5.5" y="-1.1" width="11" height="2.2" rx="1.1"/><rect class="tq-plate" x="-8.5" y="-4.6" width="3.6" height="9.2" rx="1.3"/><rect class="tq-plate" x="4.9" y="-4.6" width="3.6" height="9.2" rx="1.3"/></g>'
      :'<polygon class="tq-plate" points="4.6,0 2.3,4 -2.3,4 -4.6,0 -2.3,-4 2.3,-4"/><circle class="tq-hub" r="1.4"/>')+'</g>':'';
  /* de costado la mancuerna se ve de punta (hexágono chico, distinto del disco redondo de la barra); a lo largo solo cuando se ve así: dbRot (martillo, goblet, sobre la cabeza) */
  const plate=A.b?(k==='slam'||T.ball?'<circle class="tq-ball" cx="'+A.b[0]+'" cy="'+A.b[1]+'" r="7">'+an('cx',A.b[0],B.b[0])+an('cy',A.b[1],B.b[1])+'</circle>':(T.db?dbAt('b'):dot('b',6.5,'tq-plate')+dot('b',2,'tq-hub'))):'',back=T.behind?plate:''; /* behind: el peso se dibuja detrás del cuerpo (detrás de la nuca) */
  /* rodillo de máquina (extensión, femoral) o agarre: sigue al pie o a la mano */
  /* padOff: el rodillo va delante de la canilla (del lado del empeine), no en el tobillo */
  const rollAt=P=>{const j=T.pad,q=P[j];if(!T.padOff||!P.k)return q;const dx=q[0]-P.k[0],dy=q[1]-P.k[1],l=Math.hypot(dx,dy)||1;return[+(q[0]+dy/l*T.padOff).toFixed(1),+(q[1]-dx/l*T.padOff).toFixed(1)];};
  const roll=T.pad&&A[T.pad]?(()=>{const p=rollAt(A),q=rollAt(B);return '<circle class="tq-roll" cx="'+p[0]+'" cy="'+p[1]+'" r="4.6">'+an('cx',p[0],q[0])+an('cy',p[1],q[1])+'</circle>';})():'';
  /* mancuernas en las dos manos (vistas de frente: laterales, curl de frente...) */
  const hold=(T.hold||[]).map(dbAt).join('');
  /* almohadillas en varias articulaciones (rodillas en abductores/aductores) */
  const pads=(T.pads||[]).map(j=>dot(j,4,'tq-roll')).join('');
  /* fists: puños que crecen y bajan cuando las manos se acercan a quien mira (empuje al frente en vista de frente) */
  const rope=T.rope&&A.aL?(()=>{const d=(P,y)=>'M'+P.aL[0]+' '+P.aL[1]+' Q60 '+y+' '+P.aR[0]+' '+P.aR[1];return '<path class="tq-cab" fill="none" d="'+d(A,T.rope[0])+'">'+an('d',d(A,T.rope[0]),d(B,T.rope[1]))+'</path>';})():'';
  const fists=T.fists?['aL','aR'].filter(j=>A[j]).map(j=>'<circle class="tq-h" cx="'+A[j][0]+'" cy="'+A[j][1]+'" r="'+T.fists[0]+'">'+an('cx',A[j][0],B[j][0])+an('cy',A[j][1],B[j][1])+an('r',T.fists[0],T.fists[1])+'</circle>').join(''):'';
  return '<svg class="tq'+(stat?' st':'')+'" viewBox="0 0 120 120" role="img" aria-label="Cómo se hace">'+eq+shadow+cab+back+
   (T.front?'<g class="tq-b">'+bone('n','p',11)+bone('sL','sR',8)+bone('hL','hR',8)+bone('sL','eL',5.5)+bone('eL','aL',5)+bone('sR','eR',5.5)+bone('eR','aR',5)+bone('hL','kL',7)+bone('kL','fL',6)+bone('hR','kR',7)+bone('kR','fR',6)+dot('eL',2,'tq-j')+dot('eR',2,'tq-j')+'</g>':
   '<g class="tq-b2">'+bone('p','k2',6.5)+bone('k2','f2',5.5)+bone('f2','t2',4.5)+bone('n','e2',5)+bone('e2','a2',4.5)+'</g>'+
   '<g class="tq-b">'+bone('n','p',10)+bone('p','k',7.5)+bone('k','f',6)+bone('f','t',5)+bone('n','e',5.5)+bone('e','a',5)+dot('k',2.2,'tq-j')+dot('e',2,'tq-j')+'</g>')+
   dot('h',7.5,'tq-h')+(T.behind?'':plate)+roll+hold+pads+fists+rope+(T.kb&&A.b?dot('b',6,'tq-kb'):'')+'</svg>';
}
/* tu video de cada ejercicio queda solo en este dispositivo (IndexedDB), no se sube a ningún lado */
const VidDB=(()=>{let p=null;const open=()=>p||(p=new Promise((ok,bad)=>{const r=indexedDB.open('swole-vid',1);r.onupgradeneeded=()=>r.result.createObjectStore('v');r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error);}));
  const tx=(m,f)=>open().then(d=>new Promise((ok,bad)=>{const t=d.transaction('v',m),q=f(t.objectStore('v'));t.oncomplete=()=>ok(q.result);t.onerror=()=>bad(t.error);}));
  return{get:id=>tx('readonly',s=>s.get(id)),put:(id,v)=>tx('readwrite',s=>s.put(v,id)),del:id=>tx('readwrite',s=>s.delete(id))};})();
let vidUrl=null;
function vidSlot(ex){
  setTimeout(()=>VidDB.get(ex.id).then(v=>{const el=document.getElementById('vidSlot');if(!el||el.dataset.ex!==ex.id)return;if(vidUrl){URL.revokeObjectURL(vidUrl);vidUrl=null;}
    if(v&&v.blob){vidUrl=URL.createObjectURL(v.blob);el.innerHTML='<div class="vid-cmp"><div class="vid-fig">'+techSVG(techOf(ex))+'<small>Así se hace</small></div><div class="vid-me"><video src="'+vidUrl+'" controls loop muted playsinline></video><small>Vos · '+shortDate(v.t)+'</small></div></div><div class="g2" style="margin-top:8px"><label class="btn sm">'+ic('camera',15)+' Grabar otra<input type="file" accept="video/*" capture="environment" data-i="vid" data-e="'+ex.id+'" hidden></label><button class="btn sm line" data-a="vidDel" data-v="'+ex.id+'">Borrar video</button></div>';}
    else el.innerHTML='<label class="btn wide">'+ic('camera',16)+' Grabar mi técnica<input type="file" accept="video/*" capture="environment" data-i="vid" data-e="'+ex.id+'" hidden></label><p class="mut sm-t tc" style="margin-top:6px">Grabá una serie de costado y comparala con la figura. El video queda solo en tu celu.</p>';}).catch(()=>{}),30);
  return '<div id="vidSlot" data-ex="'+ex.id+'"></div>';
}
/* ============ SW-7: ficha propia de cada ejercicio ============
   XT[id] = { k: su figura (pose en TECH/POSE), cues: cómo se hace (3–4 claves), err: el error común }.
   Se va completando por grupo muscular (ver .equipo/SW-7/progreso.md). */
const XT={};
/* Poses propias (SW-7). Cada una: eq (equipo), A y B (las dos posiciones entre las que se mueve; ángulos como en POSE),
   fr:1 = vista de frente (FZ), x = extras de TECH (db: mancuernas, lv: palanca de máquina, pad: rodillo, blocks: cajones, cy: altura de las poleas). */
const P7={
  /* ---- Lote 1: pecho ---- */
  x_bench:{eq:['tbench','floor'],A:{t:0,th:30,sh:95,ua:272,fa:270,at:['n',32,79],b:'a'},B:{t:0,th:30,sh:95,ua:33.7,fa:270,ls:{ua:.77},at:['n',32,79],b:'a'}},
  x_incbench:{eq:['tbench','floor'],A:{t:30,th:10,sh:92,ua:268,fa:270,at:['p',66,88],b:'a'},B:{t:30,th:10,sh:92,ua:115,fa:285,ls:{ua:.55},at:['p',66,88],b:'a'}},
  x_declbench:{eq:['tbench','floor'],x:{blocks:[[74,98,12,5]]},A:{t:-22,th:20,sh:100,ua:272,fa:270,at:['p',64,78],b:'a'},B:{t:-22,th:20,sh:100,ua:26,fa:270,ls:{ua:.62},at:['p',64,78],b:'a'}},
  x_dbpress:{eq:['tbench','floor'],x:{db:1},A:{t:0,th:30,sh:95,ua:270,fa:266,at:['n',32,79],b:'a'},B:{t:0,th:30,sh:95,ua:49.4,fa:270,ls:{ua:.66},at:['n',32,79],b:'a'}},
  x_incdbpress:{eq:['tbench','floor'],x:{db:1},A:{t:30,th:10,sh:92,ua:266,fa:268,at:['p',66,88],b:'a'},B:{t:30,th:10,sh:92,ua:118,fa:288,ls:{ua:.7},at:['p',66,88],b:'a'}},
  /* aperturas: el brazo se abre hacia el costado (se ve corto, en perspectiva) con el codo apenas doblado */
  /* SW-8: vistas desde los pies del banco: acostado (torso en escorzo), arriba las mancuernas juntas sobre el pecho, abajo los brazos abiertos en arco con los codos apenas doblados, sin pasar la línea del banco */
  x_dbfly:{fr:1,eq:['floor'],x:{hold:['aL','aR'],blocks:[[46,79,28,6],[57,85,6,25]]},A:{tk:.45,uaL:264,faL:292,uaR:276,faR:248,thL:115,shL:95,thR:65,shR:85,ls:{th:.6,sh:.85},at:['n',60,70]},B:{tk:.45,uaL:205,faL:162,uaR:335,faR:18,thL:115,shL:95,thR:65,shR:85,ls:{th:.6,sh:.85},at:['n',60,70]}},
  /* cruces en polea, de frente: de brazos abiertos a juntar las manos adelante */
  x_cablefly:{fr:1,eq:['floor','cables'],x:{cy:14},A:Object.assign({uaL:205,faL:200,uaR:335,faR:340,at:['p',60,71]},BK_LEGS),B:Object.assign({uaL:60,faL:20,uaR:120,faR:160,at:['p',60,71]},BK_LEGS)},
  /* pec deck, de frente y sentado: codos a la altura de los hombros, se cierran adelante */
  x_pecdeck:{fr:1,eq:['backrest'],A:{uaL:180,faL:270,uaR:0,faR:270,thL:100,shL:92,thR:80,shR:88,ls:{th:.4},at:['p',60,78]},B:{uaL:15,faL:275,uaR:165,faR:265,thL:100,shL:92,thR:80,shR:88,ls:{th:.4},at:['p',60,78]}},
  /* press de pecho en máquina: sentado, empuja los agarres al frente (la palanca baja del eje de arriba) */
  x_chestpress:{eq:['seat','floor'],x:{lv:{pv:[100,24],to:'a',stand:[100]}},A:{t:90,th:8,sh:95,ua:0,fa:0,at:['p',44,82]},B:{t:90,th:8,sh:95,ua:125.5,fa:0,ls:{ua:.61},at:['p',44,82]}},
  x_pushup:{eq:['floor'],A:{t:22,th:22,sh:22,ua:90,fa:90,at:['a',26,108]},B:{t:14,th:15,sh:15,ua:45,fa:125,at:['a',26,108]}},
  /* flexiones con pies en un cajón: manos y pies quietos, baja el pecho */
  x_declpushup:{eq:['floor'],x:{blocks:[[88,80,24,30]]},A:{t:-2.5,th:-2.5,sh:-2.5,ua:90,fa:90,at:['a',30,108]},B:{t:-14.3,th:-14.3,sh:-14.3,ua:41.7,fa:163.4,at:['a',30,108]}},
  /* ---- Lote 2: espalda ---- */
  /* jalón: sentado con las rodillas trabadas bajo el apoyo, el cable baja de la polea de arriba */
  x_latpull:{eq:['floor'],x:{blocks:[[34,86,32,5],[48,91,4,19],[66,76,14,4]]},A:{t:80,th:0,sh:90,ua:292,fa:286,at:['p',54,84],c:[63,3]},B:{t:80,th:0,sh:90,ua:95,fa:310,at:['p',54,84],c:[63,3]}},
  x_row:{eq:['floor'],A:{t:140,th:80,sh:100,ua:90,fa:90,at:['f',64,108],b:'a',bd:[0,2]},B:{t:140,th:80,sh:100,ua:165,fa:80,at:['f',64,108],b:'a',bd:[0,2]}},
  /* remo con mancuerna: rodilla y mano del mismo lado en el banco, la otra tira hacia la cadera */
  x_dbrow:{eq:['floor'],x:{db:1,blocks:[[16,93,62,5],[22,98,3,12],[72,98,3,12]]},A:{t:175,th:95,sh:92,th2:88,sh2:180,ua:90,fa:90,ls:{ua:1.15,fa:1.15},ua2:80.9,fa2:80.9,at:['p',40,70],b:'a'},B:{t:175,th:95,sh:92,th2:88,sh2:180,ua:170,fa:95,ua2:80.9,fa2:80.9,at:['p',40,70],b:'a'}},
  /* remo en polea baja: sentado, pies en la plataforma, el cable sale de abajo adelante */
  x_cablerow:{eq:['floor'],x:{blocks:[[22,90,30,5],[35,95,4,15],[80,80,4,22]]},A:{t:90,th:-8,sh:15,ua:20,fa:15,at:['p',40,88],c:[108,96]},B:{t:90,th:-8,sh:15,ua:150,fa:10,at:['p',40,88],c:[108,96]}},
  /* peso muerto: arranca con la barra en el piso (sobre el medio del pie), cadera arriba de las rodillas */
  x_deadlift:{eq:['floor'],A:Object.assign({},ST,{ua:92,fa:90,at:['f',56,108],b:'a',bd:[0,2]}),B:{t:160,th:9,sh:85,ua:90,fa:90,at:['f',56,108],b:'a',bd:[0,1]}},
  /* hiperextensiones en banco romano a 45°: piernas fijas, el torso baja y vuelve a alinearse */
  x_hyper:{eq:['floor'],x:{lv:{pv:[26,110],to:'p'},blocks:[[24,90,12,5],[58,64,9,7]]},A:{t:135,th:135,sh:135,ua:150,fa:330,ls:{ua:.55,fa:.55},at:['f',30,90]},B:{t:255,th:135,sh:135,ua:255,fa:75,ls:{ua:.55,fa:.55},at:['f',30,90]}},
  /* dominadas supinas, de costado (las pronas se ven de espalda) */
  x_chinup:{eq:['pullbar'],A:HANG,B:PUTOP},
  /* dominadas asistidas: de rodillas en la plataforma que empuja hacia arriba */
  x_assistpull:{eq:['pullbar'],x:{pad:'k',lv:{pv:[44,110],to:'k'}},A:Object.assign({},HANG,{th:100,sh:200}),B:Object.assign({},PUTOP,{th:100,sh:200})},
  /* remo en máquina: pecho apoyado, tira de los agarres hacia atrás */
  x_machrow:{eq:['floor'],x:{blocks:[[28,86,30,5],[41,91,4,19],[48,60,4,22]],lv:{pv:[100,60],to:'a',stand:[100]}},A:{t:85,th:0,sh:92,ua:8,fa:4,at:['p',44,84]},B:{t:85,th:0,sh:92,ua:141.4,fa:351.3,ls:{ua:.68},at:['p',44,84]}},
  /* pullover en polea: brazos casi rectos, de arriba adelante hasta los muslos */
  x_pullover:{eq:['floor'],A:Object.assign({},ST,{t:100,ua:300,fa:298,at:['f',52,108],c:[104,6]}),B:Object.assign({},ST,{t:100,ua:80,fa:82,at:['f',52,108],c:[104,6]})},
  /* ---- Lote 3: hombros ---- */
  /* press militar: de pie, la barra sale del frente de los hombros y termina arriba de la cabeza */
  x_ohp:{eq:['floor'],A:Object.assign({},ST,{ua:70,fa:280,b:'a'}),B:Object.assign({},ST,{ua:275,fa:272,b:'a'})},
  /* press con mancuernas: sentado con respaldo, desde los costados de los hombros hasta arriba */
  x_dbohp:{eq:['seat','floor'],x:{db:1},A:{t:90,th:8,sh:95,ua:36.9,fa:285.3,ls:{ua:.71,fa:.88},at:['p',44,82],b:'a'},B:{t:90,th:8,sh:95,ua:272,fa:268,at:['p',44,82],b:'a'}},
  /* press de hombros en máquina: sentado, la palanca va desde atrás de la cabeza a las manos */
  x_machpress:{eq:['seat','floor'],x:{lv:{pv:[22,30],to:'a',stand:[22]}},A:{t:90,th:8,sh:95,ua:85,fa:280,ls:{ua:.6},at:['p',44,82]},B:{t:90,th:8,sh:95,ua:272,fa:270,at:['p',44,82]}},
  /* elevaciones frontales: brazo estirado desde el muslo hasta la altura del hombro */
  x_frontraise:{eq:['floor'],x:{db:1},A:Object.assign({},ST,{ua:88,fa:88,b:'a'}),B:Object.assign({},ST,{ua:2,fa:0,b:'a'})},
  /* vuelos posteriores: inclinado, los brazos se abren hacia los costados (cortos, en perspectiva) */
  x_reardelt:{eq:['floor'],x:{db:1},A:{t:160,th:80,sh:100,ua:90,fa:92,at:['f',62,108],b:'a'},B:{t:160,th:80,sh:100,ua:120,fa:110,ls:{ua:.35,fa:.35},at:['f',62,108],b:'a'}},
  /* face pull: de pie, cuerda desde la polea alta adelante hacia la cara, codos altos */
  x_facepull:{eq:['floor'],A:Object.assign({},ST,{ua:338,fa:338,at:['f',46,108],c:[108,30]}),B:Object.assign({},ST,{ua:225,fa:337.4,ls:{ua:.2},at:['f',46,108],c:[108,30]})},
  /* remo al mentón: la barra sube pegada al cuerpo con los codos altos y abiertos */
  x_uprightrow:{eq:['floor'],A:Object.assign({},ST,{ua:90,fa:88,b:'a'}),B:Object.assign({},ST,{ua:180,fa:29.3,ls:{ua:.55,fa:.95},b:'a'})},
  /* ---- Lote 4: brazos ---- */
  x_curl:{eq:['floor'],A:Object.assign({},ST,{ua:95,fa:90,b:'a'}),B:Object.assign({},ST,{ua:95,fa:304,b:'a'})},
  /* curl con mancuernas: alternado, mientras una sube la otra baja */
  x_dbcurl:{eq:['floor'],x:{hold:['a','a2']},A:Object.assign({},ST,{ua:96,fa:92,ua2:94,fa2:304}),B:Object.assign({},ST,{ua:96,fa:304,ua2:94,fa2:92})},
  /* martillo: la mancuerna parada (palmas enfrentadas) */
  x_hammer:{eq:['floor'],x:{db:1,dbRot:90},A:Object.assign({},ST,{ua:95,fa:90,b:'a'}),B:Object.assign({},ST,{ua:90,fa:310,b:'a'})} /* SW-8: arriba el antebrazo un poco adelante: la mancuerna queda a 2,4 de la cabeza */,
  /* curl en polea baja: igual de prolijo que con barra, el cable sale de abajo adelante */
  x_cablecurl:{eq:['floor'],A:Object.assign({},ST,{ua:95,fa:88,at:['f',50,108],c:[60,108]}),B:Object.assign({},ST,{ua:95,fa:300,at:['f',50,108],c:[60,108]})},
  /* banco Scott: sentado, el brazo apoyado en la almohadilla inclinada; solo se mueve el antebrazo */
  x_preacher:{eq:['floor'],x:{blocks:[[26,88,30,5],[39,93,4,17]],lines:[[35,66,48,79],[47,78,56,110,'eq']]},A:{t:95,th:-2,sh:92,ua:45,fa:55,at:['p',40,86],b:'a'},B:{t:95,th:-2,sh:92,ua:45,fa:296,at:['p',40,86],b:'a'}},
  x_pushdown:{eq:['floor'],A:Object.assign({},ST,{ua:95,fa:330,at:['f',56,108],c:[70,6]}),B:Object.assign({},ST,{ua:95,fa:95,at:['f',56,108],c:[70,6]})},
  /* tríceps sobre la cabeza: brazo vertical, la mancuerna baja detrás de la cabeza y sube */
  x_ohtri:{eq:['floor'],x:{db:1,dbRot:90,behind:1},A:Object.assign({},ST,{ua:268,fa:268,b:'a'}),B:Object.assign({},ST,{ua:268,fa:127.7,ls:{fa:1.07},b:'a'})},
  /* patada de tríceps: inclinado, el brazo pegado al cuerpo y el antebrazo se estira hacia atrás */
  x_kickback:{eq:['floor'],x:{db:1},A:{t:160,th:80,sh:100,ua:150,fa:90,at:['f',62,108],b:'a'},B:{t:160,th:80,sh:100,ua:150,fa:155,at:['f',62,108],b:'a'}},
  /* press francés: acostado, la barra baja hacia la frente con los brazos fijos */
  x_skull:{eq:['tbench','floor'],A:{t:0,th:30,sh:95,ua:282,fa:276,at:['n',32,79],b:'a'},B:{t:0,th:30,sh:95,ua:282,fa:190.3,ls:{fa:.77},at:['n',32,79],b:'a'}},
  /* granjero: caminando con una mancuerna pesada en cada mano */
  x_farmer:{eq:['floor'],x:{hold:['a','a2']},A:{t:90,th:75,sh:95,th2:105,sh2:85,ua:92,fa:90,ua2:88,fa2:90,at:['f',70,108]},B:{t:90,th:105,sh:85,th2:75,sh2:95,ua:88,fa:90,ua2:92,fa2:90,at:['f2',70,108]}},
  /* ---- Lote 5: piernas, cuádriceps ---- */
  x_squat:{eq:['floor'],A:Object.assign({},ST,{ua:150,fa:300,b:'n',bd:[-8,3]}),B:{t:125,th:5,sh:100,ua:150,fa:300,at:['f',60,108],b:'n',bd:[-8,3]}},
  /* frontal: la barra adelante sobre los hombros, codos altos y el torso más derecho */
  x_frontsquat:{eq:['floor'],A:Object.assign({},ST,{ua:345,fa:122.8,ls:{ua:.8,fa:.54},b:'a'}),B:{t:108,th:2,sh:104,ua:345,fa:122.8,ls:{ua:.8,fa:.54},at:['f',60,108],b:'a'}},
  /* en Smith: igual que la sentadilla pero la barra corre por el riel vertical */
  x_smithsquat:{eq:['floor'],x:{lines:[[49,6,49,110,'eq'],[55,6,55,110,'eq']]},A:Object.assign({},ST,{ua:150,fa:300,at:['f',62,108],b:'n',bd:[-8,3]}),B:{t:118,th:8,sh:96,ua:150,fa:300,at:['f',62,108],b:'n',bd:[-8,3]}},
  /* prensa a 45°: recostado, los pies en la plataforma que corre por el riel */
  x_legpress:{eq:['tbench','floor'],x:{plat:{j:'f',ang:135,len:10},lines:[[44,100,86,58,'eq']]},A:{t:40,th:-45,sh:-45,ua:80,fa:60,at:['p',40,90]},B:{t:40,th:-93.2,sh:7.3,ua:80,fa:60,at:['p',40,90]}},
  /* hack: la espalda contra el respaldo inclinado, los pies adelante en la plataforma */
  x_hacksquat:{eq:['tbench'],x:{blocks:[[68,104,22,5]]},A:{t:75,th:62.1,sh:62.1,ua:60,fa:300,at:['f',78.3,104.5]},B:{t:75,th:-2.4,sh:109.7,ua:60,fa:300,at:['f',78.3,104.5]}},
  /* goblet: la mancuerna parada contra el pecho, bajada profunda con el torso derecho */
  x_goblet:{eq:['floor'],x:{db:1,dbRot:90},A:Object.assign({},ST,{ua:70,fa:290.6,ls:{fa:.26},b:'a',bd:[0,2]}),B:{t:112,th:3,sh:103,ua:70,fa:290.6,ls:{fa:.26},at:['f',60,108],b:'a',bd:[0,2]}},
  /* extensión de cuádriceps: sentado en la máquina, palanca desde la rodilla y rodillo en el tobillo; la cadera no se mueve */
  x_legext:{eq:['floor'],x:{blocks:[[34,85,24,6],[33,44,6,44],[46,91,4,19]],lv:{pv:[62,82],to:'f'},pad:'f',padOff:4},A:{t:92,th:0,sh:90,ua:80,fa:85,at:['p',42,82]},B:{t:92,th:0,sh:2,ua:80,fa:85,at:['p',42,82]}},
  x_lunge:{eq:['floor'],x:{hold:['a']},A:{t:90,th:80,sh:95,th2:100,sh2:95,ua:96,fa:92,at:['f',76,108]},B:{t:90,th:5,sh:95,th2:100,sh2:170,ua:96,fa:92,at:['f',76,108]}},
  /* búlgara: el pie de atrás queda fijo en el banco; baja la cadera */
  x_bulgarian:{eq:['floor'],x:{hold:['a'],blocks:[[30,92,24,6],[34,98,3,12],[48,98,3,12]]},A:{t:95,th:92,sh:95,th2:115,sh2:175,ua:92,fa:90,at:['f',72,108]},B:{t:100,th:5,sh:100,th2:100,sh2:255.4,ua:92,fa:90,at:['f',72,108]}},
  /* subida al cajón: de un pie en el cajón a quedar parado arriba */
  x_stepup:{eq:['floor'],x:{hold:['a'],blocks:[[62,94,32,16]]},A:{t:95,th:-5,sh:100,th2:84.2,sh2:144.2,ua:92,fa:90,at:['f',74,94]},B:{t:92,th:95,sh:95,th2:60,sh2:100,ua:92,fa:90,at:['f',74,94]}},
  /* sentadilla con salto: abajo con los brazos atrás, arriba en el aire con los brazos arriba */
  x_jumpsquat:{eq:['floor'],A:{t:125,th:5,sh:100,ua:120,fa:110,at:['f',60,108]},B:Object.assign({},ST,{ua:305,fa:300,at:['f',60,100]})},
  /* ---- Lote 6: femoral y glúteo ---- */
  /* curl femoral acostado en la máquina: boca abajo, palanca desde la rodilla, rodillo detrás del tobillo, manos en las manijas */
  x_legcurl:{eq:['floor'],x:{blocks:[[18,83,64,5],[26,88,3,22],[70,88,3,22],[4,90,7,4]],lv:{pv:[80,78],to:'f'},pad:'f',padOff:4},A:{t:0,th:0,sh:0,ua:160,fa:130,at:['n',30,78]},B:{t:0,th:0,sh:-110,ua:160,fa:130,at:['n',30,78]}},
  /* curl femoral sentado: la pierna estirada adelante baja hasta quedar bajo el asiento; rodillo detrás de la pierna */
  x_seatlegcurl:{eq:['floor'],x:{blocks:[[34,85,28,6],[33,44,6,44],[46,91,4,19],[48,72,14,4]],lv:{pv:[62,82],to:'f'},pad:'f',padOff:-4},A:{t:92,th:0,sh:0,ua:80,fa:85,at:['p',42,82]},B:{t:92,th:0,sh:100,ua:80,fa:85,at:['p',42,82]}},
  /* rumano: rodillas casi rectas, la cadera va atrás y la barra baja pegada a las piernas */
  x_rdl:{eq:['floor'],A:Object.assign({},ST,{ua:92,fa:90,ft:0,at:['f',62,108],b:'a',bd:[0,1]}),B:{t:175,th:52.9,sh:71.8,ft:0,ua:126.9,fa:83.3,at:['f',62,108],b:'a',bd:[0,1]}},
  /* swing: la pesa rusa pasa entre las piernas y sube con la cadera hasta la altura del pecho */
  x_kbswing:{eq:['floor'],x:{kb:1},A:{t:145,th:80,sh:100,ua:128,fa:132,at:['f',62,108],b:'a'},B:Object.assign({},ST,{ua:2,fa:0,at:['f',62,108],b:'a'})},
  /* hip thrust: espalda alta en el banco, la barra sobre la cadera sube hasta alinear el cuerpo */
  x_hipthrust:{eq:['floor'],x:{blocks:[[8,92,26,6],[12,98,3,12],[28,98,3,12]]},A:{t:28,th:319.2,sh:88.8,ft:0,ua:0.8,fa:43.1,at:['n',28,88],b:'p',bd:[0,-6]},B:{t:0,th:7.7,sh:114.3,ft:0,ua:348,fa:351.1,at:['n',28,88],b:'p',bd:[0,-6]}},
  /* abductores en máquina, de frente y sentado: las rodillas se abren contra las almohadillas */
  x_hipabd:{fr:1,eq:['backrest'],x:{pads:['kL','kR']},A:{uaL:100,faL:90,uaR:80,faR:90,thL:95,shL:92,thR:85,shR:88,ls:{th:.6},at:['p',60,78]},B:{uaL:100,faL:90,uaR:80,faR:90,thL:130,shL:100,thR:50,shR:80,ls:{th:.6},at:['p',60,78]}},
  /* aductores en máquina: al revés, las rodillas se cierran */
  x_hipadd:{fr:1,eq:['backrest'],x:{pads:['kL','kR']},A:{uaL:100,faL:90,uaR:80,faR:90,thL:130,shL:100,thR:50,shR:80,ls:{th:.6},at:['p',60,78]},B:{uaL:100,faL:90,uaR:80,faR:90,thL:95,shL:92,thR:85,shR:88,ls:{th:.6},at:['p',60,78]}},
  /* patada de glúteo en polea: parado en una pierna, la otra (con tobillera) se estira hacia atrás */
  x_glutekick:{eq:['floor'],x:{lines:[[94,36,94,110,'eq']],cable:{pv:[98,104],to:'f2'}},A:{t:100,th:92,sh:92,th2:92,sh2:95,ua:18,fa:8,at:['f',56,108]},B:{t:100,th:92,sh:92,th2:128,sh2:120,ua:18,fa:8,at:['f',56,108]}},
  /* ---- Lote 7: pantorrilla ---- */
  /* de pie en la máquina: puntas en el escalón, las almohadillas suben con los hombros */
  x_calf:{eq:['floor'],x:{blocks:[[66,104,22,6]],lv:{pv:[96,40],to:'n',stand:[96]}},A:Object.assign({},ST,{ft:-25,th2:90,sh2:90,ft2:-25,ua:78.2,fa:304.6,at:['t',67,103]}),B:Object.assign({},ST,{ft:40,th2:90,sh2:90,ft2:40,ua:81.9,fa:303.4,at:['t',67,103]})},
  /* sentado: rodillas a 90°, la almohadilla sobre las rodillas sube cuando suben los talones */
  x_seatedcalf:{eq:['floor'],x:{blocks:[[16,82,34,6],[30,88,4,22],[68,96,14,6],[74,102,4,8]],pads:['k']},A:{t:92,th:360,sh:75.5,ft:-25,th2:360,sh2:75.5,ft2:-25,ua:50,fa:10,at:['p',37,80]},B:{t:92,th:337.5,sh:67.1,ft:40,th2:337.5,sh2:67.1,ft2:40,ua:50,fa:10,at:['p',37,80]}},
  /* en la prensa: piernas estiradas, solo se mueven los tobillos */
  x_presscalf:{eq:['tbench','floor'],x:{plat:{j:'f',ang:135,len:10},lines:[[44,100,86,58,'eq']]},A:{t:40,th:-45,sh:-45,ua:80,fa:60,at:['p',40,90]},B:{t:40,th:-45,sh:-45,ls:{sh:1.18},ua:80,fa:60,at:['p',40,90]}},
  /* lote 8: core */
  x_crunch:{eq:['floor'],A:{t:0,th:-55,sh:65,ft:0,ua:-15,fa:190,at:['p',60,105]},B:{t:25,th:-55,sh:65,ft:0,ua:10,fa:215,at:['p',60,105]}},
  x_legraise:{eq:['pullbar'],A:Object.assign({},HANG,{ft:80}),B:Object.assign({},HANG,{t:97,th:-5,sh:-5,ft:-20})},
  x_plank:{eq:['floor'],A:{t:8,th:8,sh:8,ft:105,ua:90,fa:180,at:['e',32,106]},B:{t:7,th:8.5,sh:8.5,ft:104,ua:90,fa:180,at:['e',32,106]}},
  /* de frente: el torso gira y las manos juntas van de un costado de la cadera al otro */
  x_russian:{fr:1,eq:['floor'],A:{tw:-10,sw:.5,tk:.8,uaL:140,faL:67,uaR:97,faR:147,thL:242,shL:105,thR:298,shR:75,ls:{th:.8,sh:.7},at:['p',60,104]},B:{tw:10,sw:.5,tk:.8,uaL:83,faL:33,uaR:40,faR:113,thL:242,shL:105,thR:298,shR:75,ls:{th:.8,sh:.7},at:['p',60,104]}},
  /* de frente: la polea al costado tira hacia ella; las manos salen del pecho al frente (brazos en escorzo) */
  x_pallof:{fr:1,eq:['floor'],x:{fists:[2.6,4.6],lines:[[10,14,10,110,'eq']],cable:{pv:[10,56],to:'aL'}},A:Object.assign({uaL:120,faL:359,uaR:60,faR:181,at:['p',60,71]},BK_LEGS),B:Object.assign({uaL:95,faL:35,uaR:85,faR:145,ls:{ua:.7,fa:.7},at:['p',60,71]},BK_LEGS)},
  x_medslam:{eq:['floor'],x:{ball:1},A:{t:84,th:90,sh:90,ft:0,ua:278,fa:280,at:['f',58,108],b:'a',bd:[0,-5]},B:{t:155,th:20,sh:100,ft:0,ua:80,fa:80,at:['f',58,108],b:'a',bd:[3,6]}},
  x_cablecrunch:{eq:['floor'],x:{lines:[[108,4,108,110,'eq']],cable:{pv:[104,8],to:'a'}},A:{t:105,th:90,sh:180,ft:180,ua:30,fa:270,at:['k',60,107]},B:{t:140,th:90,sh:180,ft:180,ua:65,fa:305,at:['k',60,107]}},
  x_abwheel:{eq:['floor'],A:{t:160,th:80,sh:180,ft:180,ua:90,fa:90,at:['k',34,107],b:'a'},B:{t:175,th:150,sh:180,ft:180,ua:20,fa:25,at:['k',34,107],b:'a'}},
  x_mtclimb:{eq:['floor'],A:{t:18,th:150,sh:15,ft:160,th2:18,sh2:18,ft2:110,ua:90,fa:90,at:['a',26,108]},B:{t:18,th:18,sh:18,ft:110,th2:150,sh2:15,ft2:160,ua:90,fa:90,at:['a',26,108]}},
  /* lote 9: calistenia */
  x_archerpush:{eq:['floor'],A:Object.assign({},PU_A,{ua2:165,fa2:180,at:['a',36,108]}),B:Object.assign({},PU_B,{ua2:160,fa2:178,at:['a',36,108]})},
  x_oapush:{eq:['floor'],A:Object.assign({},PU_A,{ua2:10,fa2:4,th2:26,sh2:26}),B:Object.assign({},PU_B,{ua2:4,fa2:0,th2:20,sh2:20})},
  /* fondo imposible: de antebrazos apoyados en las paralelas (cuerpo vertical) a brazos estirados, sin pasar por el fondo */
  x_impdip:{eq:['bars'],A:{t:92,th:100,sh:190,ua:90,fa:0,at:['a',65,63]},B:{t:92,th:100,sh:190,ua:90,fa:90,at:['a',65,63]}},
  x_negpull:{eq:['pullbar'],x:{barY:21},A:Object.assign({},PUTOP,{sh:150,at:['a',64,21]}),B:Object.assign({},HANG,{sh:120,at:['a',64,21]})},
  x_deadhang:{fr:1,eq:['pullbar'],A:Object.assign({uaL:232,faL:252,uaR:308,faR:288,at:['aL',41,12]},BK_LEGS),B:Object.assign({uaL:236,faL:250,uaR:304,faR:290,at:['aL',41,12]},BK_LEGS)},
  x_hollow:{eq:['floor'],A:{t:16,th:-15,sh:-15,ft:-15,ua:-20,fa:-20,at:['p',64,104]},B:{t:19,th:-20,sh:-20,ft:-20,ua:-22,fa:-22,at:['p',64,104]}},
  x_clappush:{eq:['floor'],A:{t:14,th:15,sh:15,ua:45,fa:125,at:['a',26,108]},B:{t:27,th:22,sh:22,ua:105,fa:60,at:['f',89.9,106.8]}},
  x_sissy:{eq:['floor'],A:{t:90,th:90,sh:90,ft:70,ua:20,fa:10,at:['t',66,109]},B:{t:62,th:62,sh:125,ft:20,ua:0,fa:0,at:['t',66,109]}},
  /* lote 10: articulaciones y atleta */
  x_kneewall:{eq:['floor'],x:{lines:[[92,8,92,110,'eq']]},A:{t:95,th:60,sh:90,ft:0,th2:102.8,sh2:145,ft2:60,ua:57.8,fa:342.8,at:['f',78,108]},B:{t:95,th:50,sh:115,ft:0,th2:113.9,sh2:154,ft2:60,ua:77.6,fa:334.1,at:['f',78,108]}},
  x_slbridge:{eq:['floor'],A:{t:0,th:311.6,sh:93.9,ft:0,th2:311.6,sh2:311.6,ft2:231.6,ua:0,fa:0,at:['n',30,103]},B:{t:-25,th:355.4,sh:105.6,ft:0,th2:355.4,sh2:355.4,ft2:275.4,ua:0,fa:0,hd:180,at:['n',30,103]}},
  x_curlup:{eq:['floor'],A:{t:0,th:0,sh:0,ft:-90,th2:-55,sh2:65,ft2:0,ua:348,fa:29.6,at:['p',60,105]},B:{t:8,th:0,sh:0,ft:-90,th2:-55,sh2:65,ft2:0,ua:1.3,fa:34.5,at:['p',60,105]}},
  x_slcalf:{eq:['floor'],x:{blocks:[[66,104,22,6]],lines:[[84,24,84,104,'eq']]},A:{t:90,th:90,sh:90,ft:-25,th2:95,sh2:210,ft2:200,ua:41.7,fa:349.8,at:['t',67,103]},B:{t:90,th:90,sh:90,ft:40,th2:95,sh2:210,ft2:200,ua:47,fa:345.5,at:['t',67,103]}},
  x_bearcrawl:{eq:['floor'],A:{t:4,th:90,sh:0,ft:70,th2:90,sh2:0,ft2:70,ua:90,fa:90,ua2:90,fa2:90,at:['a2',34,108]},B:{t:4,th:356.7,sh:108.1,ft:60,th2:90,sh2:0,ft2:70,ua:132.9,fa:78.7,ua2:90,fa2:90,at:['a2',34,108]}},
  x_spansq:{eq:['floor'],x:{lines:[[104,50,104,110,'eq']],cable:{pv:[104,90],to:'k'}},A:{t:95,th:35,sh:92,ft:0,ua:5,fa:0,at:['f',60,108]},B:{t:97,th:25,sh:95,ft:0,ua:5,fa:0,at:['f',60,108]}},
  x_tibraise:{eq:['floor'],x:{lines:[[24.5,4,24.5,110,'eq']]},A:{t:77,th:71,sh:71,ft:0,ua:100,fa:95,at:['f',54,108]},B:{t:77,th:71,sh:71,ft:-35,ua:100,fa:95,at:['f',54,108]}},
  x_slbal:{fr:1,eq:['floor'],A:{uaL:180,faL:180,uaR:0,faR:0,thL:92,shL:90,thR:84,shR:92,ls:{thR:.4},at:['p',60,69.6]},B:{tw:1.5,uaL:172,faL:176,uaR:6,faR:4,thL:92,shL:90,thR:82,shR:94,ls:{thR:.4},at:['p',60,69.6]}},
  x_sidepl:{eq:['floor'],A:{t:13,th:13,sh:13,ft:13,ua:90,fa:180,ua2:270,fa2:270,ls:{fa:.4,fa2:1},at:['e',32,106]},B:{t:16,th:11,sh:11,ft:11,ua:90,fa:180,ua2:268,fa2:268,ls:{fa:.4,fa2:1},at:['e',32,106]}},
  x_birddog:{eq:['floor'],A:{t:11.5,th:90,sh:0,ft:0,th2:90,sh2:0,ft2:0,ua:90,fa:90,ua2:90,fa2:90,at:['a',34,108]},B:{t:11.5,th:0,sh:0,ft:0,th2:90,sh2:0,ft2:0,ua:90,fa:90,ua2:180,fa2:180,at:['a',34,108]}},
  x_biering:{eq:['floor'],x:{blocks:[[56,75,52,6],[62,81,4,29],[100,81,4,29]],pads:['f']},A:{t:0,th:0,sh:0,ft:30,ua:60,fa:180,at:['p',56,70]},B:{t:-3,th:0,sh:0,ft:30,ua:57,fa:177,at:['p',56,70]}},
  x_extrot:{fr:1,eq:['floor'],x:{lines:[[10,20,10,110,'eq']],cable:{pv:[10,58],to:'aR'}},A:Object.assign({uaL:95,faL:90,uaR:90,faR:180,at:['p',60,71]},BK_LEGS),B:Object.assign({uaL:95,faL:90,uaR:90,faR:0,at:['p',60,71]},BK_LEGS)},
  x_wallslide:{fr:1,eq:['floor'],x:{wallRect:[26,4,68,107]},A:Object.assign({uaL:160,faL:258,uaR:20,faR:282,at:['p',60,71]},BK_LEGS),B:Object.assign({uaL:242,faL:242,uaR:298,faR:298,at:['p',60,71]},BK_LEGS)},
  x_pogo:{eq:['floor'],A:{t:90,th:90,sh:90,ft:70,ua:100,fa:80,at:['t',62,109]},B:{t:90,th:90,sh:90,ft:82,ua:96,fa:84,at:['t',62,100]}},
  x_skater:{fr:1,eq:['floor'],A:{tw:-3,uaL:15,faL:25,uaR:60,faR:70,thL:95,shL:80,thR:112,shR:132,at:['p',44,69.4]},B:{tw:3,uaL:120,faL:110,uaR:165,faR:155,thL:68,shL:48,thR:85,shR:100,at:['p',76,69.4]}},
  x_burpee:{eq:['floor'],A:{t:22,th:22,sh:22,ua:90,fa:90,at:['a',30,108]},B:{t:90,th:88,sh:92,ft:80,ua:265,fa:268,at:['f',52,100]}},
  x_jumprope:{fr:1,eq:['floor'],x:{rope:[152,-40]},A:Object.assign({uaL:110,faL:170,uaR:70,faR:10,at:['p',60,69]},BK_LEGS),B:Object.assign({uaL:110,faL:172,uaR:70,faR:8,at:['p',60,62]},BK_LEGS)},
  x_highknees:{eq:['floor'],A:{t:88,th:0,sh:90,ft:20,th2:90,sh2:90,ft2:70,ua:120,fa:70,ua2:60,fa2:290,at:['t2',62,109]},B:{t:88,th:90,sh:90,ft:70,th2:0,sh2:90,ft2:20,ua:60,fa:290,ua2:120,fa2:70,at:['t',62,109]}},
  /* arreglos lote 9 */
  x_muscleup:{eq:['pullbar'],x:{barY:50},A:{t:95,th:140,sh:220,ft:230,ua:4,fa:270,at:['a',64,50]},B:{t:100,th:100,sh:95,ft:20,ua:90,fa:90,at:['a',64,50]}},
  x_diamond:{eq:['floor'],A:{t:21.2,th:21.2,sh:21.2,ua:70.8,fa:79.3,at:['a',37,108]},B:{t:16.8,th:16.8,sh:16.8,ua:36.1,fa:101.2,at:['a',37,108]}},
  x_russiandip:{eq:['bars'],A:Object.assign({},DIP_A,{sh:175}),B:{t:80,th:100,sh:195,ua:110,fa:0,at:['a',72,63]}},
  x_lpullup:{eq:['pullbar'],x:{barY:21},A:Object.assign({},HANG,{th:-3,sh:-3,at:['a',64,21]}),B:Object.assign({},PUTOP,{th:-3,sh:-3,at:['a',64,21]})},
  x_oapull:{fr:1,eq:['pullbar'],x:{barY:21},A:Object.assign({uaL:270,faL:270,uaR:95,faR:92,at:['aL',58,21]},BK_LEGS),B:Object.assign({uaL:202.6,faL:6.1,uaR:80,faR:150,at:['aL',58,21]},BK_LEGS)},
  x_archerpull:{fr:1,eq:['pullbar'],x:{barY:21},A:Object.assign({uaL:235.3,faL:238.4,uaR:306,faR:299.8,at:['aL',30,21]},BK_LEGS),B:Object.assign({uaL:164.9,faL:324,uaR:358.1,faR:344.2,at:['aL',30,21]},BK_LEGS)},
  x_deadbug:{eq:['floor'],A:{t:0,th:270,sh:0,ft:-30,th2:270,sh2:0,ft2:-30,ua:270,fa:270,ua2:270,fa2:270,at:['p',60,105]},B:{t:0,th:270,sh:0,ft:-30,th2:-8,sh2:-8,ft2:-20,ua:245,fa:245,ua2:270,fa2:270,at:['p',60,105]}}
};
Object.keys(P7).forEach(k=>{const p=P7[k],T=TECH[k]=Object.assign({eq:p.eq},p.x||{});const Z=p.fr?FZ:PZ;if(p.fr)T.front=1;T.A=Z(p.A);T.B=Z(p.B);});
/* laterales: la figura de frente que ya había, ahora con una mancuerna en cada mano */
/* laterales, de frente (la figura vieja venía con puntos de costado y no dibujaba brazos ni piernas) */
/* nórdico: la figura que ya había, con el apoyo que sostiene los tobillos */
TECH.x_nordic=Object.assign({},TECH.nordic,{blocks:[[78,98,14,6]]});
TECH.x_lateral={eq:['floor'],front:1,hold:['aL','aR'],A:FZ(Object.assign({uaL:101,faL:98,uaR:79,faR:82,at:['p',60,71]},BK_LEGS)),B:FZ(Object.assign({uaL:182,faL:178,uaR:358,faR:2,at:['p',60,71]},BK_LEGS))};
Object.assign(XT,{
  bench:{k:'x_bench',cues:['Acostado con los ojos debajo de la barra y los pies firmes en el piso','Omóplatos juntos y hacia abajo, con un leve arco en la espalda','Bajá la barra controlada hasta tocar la parte baja del pecho','Empujá hacia arriba y un poco hacia atrás hasta estirar los brazos'],err:'Rebotar la barra en el pecho o despegar la cola del banco'},
  incbench:{k:'x_incbench',cues:['Banco a 30–45°, la cola bien atrás en el asiento','Agarre un poco más abierto que los hombros','Bajá la barra a la parte alta del pecho, debajo de la clavícula','Empujá en línea recta hacia arriba'],err:'Inclinar demasiado el banco: se vuelve un press de hombros'},
  declbench:{k:'x_declbench',cues:['Banco declinado, con las piernas trabadas en el soporte','Bajá la barra a la parte baja del pecho','Codos a unos 45° del cuerpo','Empujá hasta estirar los brazos'],err:'Bajar la barra hacia el cuello'},
  dbpress:{k:'x_dbpress',cues:['Sentate con las mancuernas en los muslos y acostate llevándolas al pecho','Codos a unos 45° del cuerpo, no abiertos en cruz','Bajá hasta sentir el pecho estirado','Empujá juntándolas arriba sin chocarlas'],err:'Abrir los codos a 90° y cargar el hombro'},
  incdbpress:{k:'x_incdbpress',cues:['Banco a 30°, mancuernas a la altura de los hombros','Codos un poco por debajo de los hombros','Empujá hacia arriba y adentro hasta casi juntarlas','Bajá lento hasta sentir el pecho estirado'],err:'Arquear de más la espalda para empujar'},
  dbfly:{k:'x_dbfly',cues:['Mancuernas arriba con los codos apenas doblados','Abrí los brazos en arco sin cambiar el ángulo del codo','Bajá hasta la altura del pecho, sin pasarte','Volvé apretando el pecho, como abrazando un árbol'],err:'Doblar los codos y convertirlo en un press'},
  cablefly:{k:'x_cablefly',cues:['Poleas altas, un paso adelante y el torso apenas inclinado','Codos levemente doblados y fijos','Juntá las manos adelante, a la altura del pecho o un poco más abajo','Volvé lento hasta sentir el estiramiento'],err:'Tirar doblando los codos en vez de cerrar con el pecho'},
  pecdeck:{k:'x_pecdeck',cues:['Asiento a la altura justa: codos a la altura de los hombros','Antebrazos o manos en las almohadillas','Juntá adelante apretando el pecho y pausá un segundo','Volvé lento sin que el peso golpee'],err:'Empujar con las manos en vez de cerrar con el pecho'},
  chestpress:{k:'x_chestpress',cues:['Regulá el asiento: los agarres a la altura del medio del pecho','Espalda apoyada en el respaldo todo el recorrido','Empujá hasta estirar los brazos sin trabar los codos','Volvé lento hasta que las manos lleguen al pecho'],err:'Despegar la espalda del respaldo para empujar'},
  pushup:{k:'x_pushup',cues:['Manos un poco más abiertas que los hombros','Cuerpo recto de la cabeza a los talones, abdomen firme','Bajá hasta que el pecho casi toque el piso','Codos a unos 45° del cuerpo al bajar'],err:'Dejar caer la cadera o sacar la cola para arriba'},
  declpushup:{k:'x_declpushup',cues:['Pies arriba de un banco o cajón, manos en el piso','Cuerpo recto, abdomen y glúteos firmes','Bajá hasta que el pecho casi toque el piso','Más alto el cajón, más trabajo de pecho alto y hombro'],err:'Doblar la cadera en vez de bajar el pecho'}
});
/* Lote 2: espalda */
Object.assign(XT,{
  pullup:{k:'pullup',cues:['Agarre un poco más abierto que los hombros, palmas hacia adelante','Arrancá colgado con los brazos estirados y los hombros activos','Tirá llevando los codos hacia abajo y atrás hasta pasar el mentón','Bajá controlado hasta estirar los brazos'],err:'Balancearse o hacer medio recorrido'},
  chinup:{k:'x_chinup',cues:['Agarre al ancho de hombros, palmas hacia vos','Arrancá colgado con los brazos estirados','Tirá hasta pasar el mentón, con el pecho hacia la barra','Bajá lento, sin soltar de golpe'],err:'Patear o balancearse para subir'},
  latpull:{k:'x_latpull',cues:['Sentado, con las rodillas trabadas bajo el apoyo','Agarre un poco más abierto que los hombros','Tirá la barra a la parte alta del pecho, con el torso apenas atrás','Subí lento hasta estirar los brazos'],err:'Tirar la barra detrás de la nuca o tirarse muy para atrás'},
  assistpull:{k:'x_assistpull',cues:['Rodillas en la plataforma; más peso = más ayuda','Agarre un poco más abierto que los hombros','Tirá hasta pasar el mentón llevando los codos abajo','Bajá lento hasta estirar los brazos'],err:'Dejar que la plataforma haga todo el trabajo'},
  row:{k:'x_row',cues:['Rodillas apenas dobladas y torso inclinado a unos 45°','Espalda neutra, la barra cuelga con los brazos estirados','Llevá la barra al abdomen juntando los omóplatos','Bajá controlado sin redondear la espalda'],err:'Redondear la espalda o pararse con el impulso'},
  dbrow:{k:'x_dbrow',cues:['Rodilla y mano del mismo lado apoyadas en el banco','Espalda plana, paralela al piso','Tirá la mancuerna hacia la cadera, con el codo pegado al cuerpo','Bajá hasta estirar el brazo sin girar el torso'],err:'Girar el torso para subir más peso'},
  cablerow:{k:'x_cablerow',cues:['Sentado, pies en la plataforma y rodillas apenas dobladas','Torso derecho, sin hamacarte','Tirá el agarre hacia el abdomen juntando los omóplatos','Volvé estirando los brazos sin redondear la espalda'],err:'Tirar con el cuerpo hacia atrás en cada repetición'},
  machrow:{k:'x_machrow',cues:['Regulá el asiento para que el pecho quede contra el apoyo','Agarrá las manijas con los brazos estirados','Tirá hacia atrás juntando los omóplatos','Volvé lento sin despegar el pecho'],err:'Despegar el pecho del apoyo para tirar'},
  pullover:{k:'x_pullover',cues:['Polea alta, un paso atrás y el torso apenas inclinado','Brazos casi rectos, codos apenas doblados','Bajá la barra en arco hasta los muslos con la espalda','Volvé lento hasta arriba de la cabeza'],err:'Doblar los codos y convertirlo en un tríceps'},
  deadlift:{k:'x_deadlift',cues:['Barra sobre el medio del pie, canillas casi tocándola','Cadera arriba de las rodillas, espalda neutra y pecho arriba','Empujá el piso con las piernas y llevá la barra pegada al cuerpo','Terminá parado derecho, sin tirarte para atrás'],err:'Redondear la espalda o alejar la barra del cuerpo'},
  shrug:{k:'shrug',cues:['Parado derecho, la barra colgando con los brazos estirados','Subí los hombros derecho hacia las orejas','Pausá un segundo arriba','Bajá lento, sin girar los hombros'],err:'Doblar los codos o hacer círculos con los hombros'},
  hyper:{k:'x_hyper',cues:['Cadera apoyada en el borde del banco, pies trabados','Brazos cruzados en el pecho','Bajá el torso con la espalda recta','Subí hasta alinear el cuerpo, sin pasarte para atrás'],err:'Arquear de más la espalda arriba'},
  neckiso:{k:'neck',cues:['Mano contra la frente, la nuca o el costado de la cabeza','Empujá con la cabeza contra la mano sin moverla','Sostené los segundos y cambiá de dirección','Fuerza media, sin dolor'],err:'Empujar de golpe o al máximo'}
});
/* Lote 3: hombros */
Object.assign(XT,{
  ohp:{k:'x_ohp',cues:['De pie, la barra apoyada adelante de los hombros','Abdomen y glúteos firmes, sin arquear la espalda','Empujá la barra derecho hacia arriba, corriendo la cabeza apenas atrás','Terminá con la barra arriba de la cabeza y los brazos estirados'],err:'Arquear la espalda baja para empujar'},
  dbohp:{k:'x_dbohp',cues:['Sentado con la espalda apoyada en el respaldo','Mancuernas a los costados de los hombros, codos un poco adelante','Empujá hacia arriba hasta casi juntarlas','Bajá controlado hasta la altura de las orejas'],err:'Despegar la espalda del respaldo'},
  machpress:{k:'x_machpress',cues:['Regulá el asiento: los agarres a la altura de los hombros','Espalda apoyada todo el recorrido','Empujá hacia arriba sin trabar los codos','Bajá lento hasta la altura de los hombros'],err:'Despegar la espalda o bajar de golpe'},
  lateral:{k:'x_lateral',cues:['De pie, mancuernas al costado y codos apenas doblados','Subí los brazos hacia los costados hasta la altura de los hombros','Pensá en llevar los codos hacia afuera, no las manos','Bajá lento, sin balancear el cuerpo'],err:'Subir con impulso o encoger los hombros'},
  frontraise:{k:'x_frontraise',cues:['De pie, mancuernas adelante de los muslos','Brazos casi estirados','Subí hacia adelante hasta la altura de los hombros','Bajá lento sin hamacarte'],err:'Tirarse para atrás para subir el peso'},
  reardelt:{k:'x_reardelt',cues:['Inclinado con la espalda recta, casi paralela al piso','Mancuernas colgando, codos apenas doblados','Abrí los brazos hacia los costados apretando la parte de atrás del hombro','Bajá lento sin levantar el torso'],err:'Juntar los omóplatos y convertirlo en un remo'},
  facepull:{k:'x_facepull',cues:['Polea alta con cuerda, un paso atrás','Tirá la cuerda hacia la cara separando las manos','Codos altos, a la altura de los hombros o más','Volvé lento estirando los brazos'],err:'Tirar hacia el pecho con los codos bajos'},
  uprightrow:{k:'x_uprightrow',cues:['Barra adelante de los muslos, agarre al ancho de hombros','Subí la barra pegada al cuerpo hasta el pecho','Los codos van arriba y hacia afuera, por encima de las manos','Bajá controlado'],err:'Subir más allá del pecho si molesta el hombro'}
});
/* Lote 4: brazos */
Object.assign(XT,{
  dips:{k:'dip',cues:['Brazos estirados sobre las paralelas, hombros abajo','Bajá doblando los codos hasta unos 90°','Torso derecho para tríceps, un poco adelante para pecho','Subí hasta estirar los brazos sin balancearte'],err:'Bajar de más y forzar el hombro'},
  curl:{k:'x_curl',cues:['De pie, la barra con las palmas hacia adelante','Codos pegados al costado del cuerpo','Subí la barra doblando solo los codos','Bajá lento hasta estirar los brazos'],err:'Balancear el cuerpo o adelantar los codos'},
  dbcurl:{k:'x_dbcurl',cues:['De pie, una mancuerna en cada mano','Subí una girando la palma hacia vos','Codo quieto al costado del cuerpo','Bajá lento y alterná con la otra'],err:'Hamacar el cuerpo para subir'},
  hammer:{k:'x_hammer',cues:['Palmas enfrentadas todo el recorrido (agarre martillo)','Codos pegados al cuerpo','Subí la mancuerna sin girar la muñeca','Bajá controlado'],err:'Adelantar los codos para ayudarte'},
  cablecurl:{k:'x_cablecurl',cues:['Polea baja, de pie frente a la máquina','Codos pegados al cuerpo','Subí el agarre doblando solo los codos','Bajá lento: el cable tira todo el recorrido'],err:'Inclinarse atrás para subir'},
  preacher:{k:'x_preacher',cues:['Sentado, la parte de atrás del brazo bien apoyada en la almohadilla','Arrancá con el brazo casi estirado','Subí doblando el codo sin despegar el brazo','Bajá lento, sin trabar el codo abajo'],err:'Levantar la cola o los codos de la almohadilla'},
  pushdown:{k:'x_pushdown',cues:['Polea alta, codos pegados al cuerpo','Arrancá con los antebrazos a la altura del pecho','Empujá hacia abajo hasta estirar los brazos','Volvé lento sin que se muevan los codos'],err:'Abrir los codos o empujar con el cuerpo'},
  ohtri:{k:'x_ohtri',cues:['Una mancuerna con las dos manos arriba de la cabeza','Brazos verticales, codos apuntando al techo','Bajá la mancuerna detrás de la cabeza doblando solo los codos','Estirá los brazos sin arquear la espalda'],err:'Abrir los codos hacia los costados'},
  kickback:{k:'x_kickback',cues:['Inclinado con la espalda recta','Brazo pegado al cuerpo, paralelo al piso','Estirá el codo llevando la mancuerna hacia atrás','Volvé lento sin mover el brazo'],err:'Bajar el codo y hacer un péndulo'},
  skull:{k:'x_skull',cues:['Acostado, la barra arriba con los brazos un poco hacia atrás','Bajá la barra hacia la frente doblando solo los codos','Codos cerrados, apuntando al techo','Estirá los brazos sin mover los hombros'],err:'Abrir los codos o mover los hombros'},
  wrist:{k:'wrist',cues:['Sentado, antebrazos apoyados en los muslos','Las muñecas quedan por fuera de las rodillas','Subí la barra flexionando solo las muñecas','Bajá lento hasta estirar'],err:'Levantar los antebrazos de las piernas'},
  farmer:{k:'x_farmer',cues:['Una mancuerna pesada en cada mano','Parado derecho, hombros atrás y abdomen firme','Caminá a pasos cortos sin que se balanceen','Anotá los segundos que aguantás'],err:'Inclinarse hacia un lado o encorvarse'}
});
/* Lote 5: piernas, cuádriceps */
Object.assign(XT,{
  squat:{k:'x_squat',cues:['Barra en la espalda alta, no en el cuello','Pies al ancho de hombros, puntas un poco afuera','Bajá sentándote atrás y abajo, rodillas en la línea de los pies','Subí empujando el piso, con el pecho arriba'],err:'Que las rodillas se vayan hacia adentro o levantar los talones'},
  frontsquat:{k:'x_frontsquat',cues:['Barra adelante sobre los hombros, codos bien altos','Torso lo más derecho posible','Bajá profundo con las rodillas hacia adelante','Subí sin dejar caer los codos'],err:'Bajar los codos y que la barra se vaya para adelante'},
  smithsquat:{k:'x_smithsquat',cues:['La barra del Smith en la espalda alta','Pies un poco adelante de la barra','Bajá controlado hasta que los muslos queden paralelos al piso','Subí empujando con todo el pie'],err:'Pies justo debajo de la barra: carga de más las rodillas'},
  legpress:{k:'x_legpress',cues:['Espalda y cola bien apoyadas en el respaldo','Pies al ancho de hombros en el medio de la plataforma','Bajá hasta que las rodillas lleguen cerca del pecho sin despegar la cola','Empujá sin trabar las rodillas arriba'],err:'Despegar la cola del asiento al bajar'},
  hacksquat:{k:'x_hacksquat',cues:['Espalda contra el respaldo, hombros bajo las almohadillas','Pies al ancho de hombros en la plataforma','Bajá profundo con las rodillas en la línea de los pies','Subí empujando sin trabar las rodillas'],err:'Levantar los talones de la plataforma'},
  goblet:{k:'x_goblet',cues:['Una mancuerna parada contra el pecho','Codos adentro, entre las rodillas al bajar','Bajá profundo con el torso derecho','Subí empujando el piso'],err:'Inclinarse adelante y redondear la espalda'},
  legext:{k:'x_legext',cues:['Sentado con la espalda apoyada y la rodilla en el borde del asiento','El rodillo apoyado en el tobillo, adelante','Estirá las rodillas y pausá un segundo arriba','Bajá lento sin que el peso golpee'],err:'Levantar la cola del asiento o patear con impulso'},
  lunge:{k:'x_lunge',cues:['Da un paso largo adelante, torso derecho','Bajá la rodilla de atrás hasta casi tocar el piso','La rodilla de adelante, en la línea del pie','Empujá con la pierna de adelante para volver'],err:'Que la rodilla de adelante se vaya hacia adentro'},
  bulgarian:{k:'x_bulgarian',cues:['El empeine del pie de atrás apoyado en el banco','El pie de adelante a un paso largo del banco','Bajá la cadera derecho hasta que el muslo de adelante quede paralelo','Subí empujando con la pierna de adelante'],err:'Pie de adelante demasiado cerca del banco'},
  stepup:{k:'x_stepup',cues:['Pie entero arriba del cajón','Subí empujando con la pierna de arriba, sin impulsarte con la de abajo','Pará derecho arriba del cajón','Bajá controlado y alterná'],err:'Impulsarte con el pie de abajo'},
  boxjump:{k:'jump',cues:['Pies al ancho de cadera frente al cajón','Bajá un poco y llevá los brazos atrás','Saltá con los dos pies y caé suave arriba, con las rodillas dobladas','Bajá caminando, no saltando'],err:'Caer con las piernas rectas'},
  jumpsquat:{k:'x_jumpsquat',cues:['Bajá a media sentadilla con los brazos atrás','Saltá lo más alto que puedas llevando los brazos arriba','Caé suave en la punta de los pies','Amortiguá doblando las rodillas y repetí'],err:'Caer con las rodillas trabadas'}
});
/* Lote 6: femoral y glúteo */
Object.assign(XT,{
  legcurl:{k:'x_legcurl',cues:['Boca abajo, las rodillas justo pasando el borde del banco','El rodillo apoyado detrás de los tobillos','Llevá los talones hacia los glúteos sin levantar la cadera','Bajá lento hasta estirar casi del todo'],err:'Levantar la cadera del banco para ayudarte'},
  seatlegcurl:{k:'x_seatlegcurl',cues:['Sentado con la espalda apoyada y el apoyo trabando los muslos','El rodillo detrás de los tobillos, piernas estiradas','Llevá los talones hacia abajo y atrás, debajo del asiento','Volvé lento sin que el peso golpee'],err:'Despegar la cola del asiento'},
  rdl:{k:'x_rdl',cues:['De pie, la barra pegada a los muslos','Rodillas apenas dobladas y fijas','Llevá la cadera atrás bajando la barra pegada a las piernas hasta media canilla','Volvé empujando la cadera adelante, sin redondear la espalda'],err:'Doblar las rodillas y convertirlo en un peso muerto común'},
  kbswing:{k:'x_kbswing',cues:['Pies un poco más abiertos que los hombros','Llevá la pesa atrás entre las piernas, con la cadera hacia atrás','Empujá la cadera adelante con fuerza: la pesa sube sola hasta el pecho','Los brazos solo acompañan, no levantan'],err:'Hacer una sentadilla o levantar la pesa con los brazos'},
  hipthrust:{k:'x_hipthrust',cues:['Parte alta de la espalda apoyada en el banco','Barra sobre la cadera (con almohadilla), pies firmes en el piso','Subí la cadera hasta alinear rodillas, cadera y hombros','Apretá los glúteos arriba y bajá controlado'],err:'Arquear la espalda baja en vez de subir con la cadera'},
  hipabd:{k:'x_hipabd',cues:['Sentado con la espalda apoyada, almohadillas por fuera de las rodillas','Abrí las piernas empujando hacia afuera','Pausá un segundo bien abierto','Volvé lento sin que se junten de golpe'],err:'Tirarse adelante para empujar'},
  hipadd:{k:'x_hipadd',cues:['Sentado con la espalda apoyada, almohadillas por dentro de las rodillas','Arrancá con las piernas abiertas, sin forzar','Cerrá las piernas apretando la parte interna del muslo','Volvé lento'],err:'Abrir de más al volver y forzar la ingle'},
  glutekick:{k:'x_glutekick',cues:['Tobillera en la polea baja, de frente a la máquina','Agarrate de la máquina con el torso apenas inclinado','Llevá la pierna estirada hacia atrás apretando el glúteo','Volvé lento sin arquear la espalda'],err:'Arquear la espalda baja para subir más la pierna'},
  nordic:{k:'x_nordic',cues:['De rodillas, con los tobillos sujetos por un compañero o un apoyo','Cuerpo recto de las rodillas a la cabeza','Bajá lo más lento que puedas frenando con la parte de atrás de los muslos','Poné las manos al final y volvé empujando un poco'],err:'Doblar la cadera en vez de bajar con el cuerpo recto'},
  copenhagen:{k:'sideplank',cues:['De costado, apoyado en el antebrazo','La pierna de arriba sobre un banco, a la altura de la rodilla o del tobillo','Subí la cadera hasta alinear el cuerpo','Sostené los segundos y cambiá de lado'],err:'Dejar caer la cadera'}
});
/* Lote 7: pantorrilla */
Object.assign(XT,{
  calf:{k:'x_calf',cues:['Las puntas de los pies en el borde del escalón, hombros bajo las almohadillas','Rodillas estiradas pero sin trabar','Subí lo más alto que puedas en puntas de pie y pausá arriba','Bajá lento hasta sentir el estiramiento abajo'],err:'Rebotar abajo o hacer medio recorrido'},
  seatedcalf:{k:'x_seatedcalf',cues:['Sentado, rodillas a 90° y la almohadilla sobre los muslos','Las puntas de los pies en el escalón','Subí los talones lo más alto posible y pausá','Bajá lento hasta estirar'],err:'Rebotar con impulso'},
  presscalf:{k:'x_presscalf',cues:['En la prensa, las puntas de los pies en el borde de abajo de la plataforma','Piernas estiradas sin trabar las rodillas','Empujá la plataforma solo con los tobillos','Volvé lento hasta sentir el estiramiento'],err:'Doblar las rodillas para empujar'}
});
/* lote 8: core */
Object.assign(XT,{
  crunch:{k:'x_crunch',cues:['Rodillas dobladas y pies apoyados','Brazos cruzados sobre el pecho (o manos en las sienes, sin tirar)','Despegá los hombros enrollando la parte alta de la espalda','La zona lumbar queda pegada al piso'],err:'Tirar de la cabeza con las manos o subir el torso entero con impulso'},
  legraise:{k:'x_legraise',cues:['Colgado de la barra, hombros activos','Subí las piernas rectas hasta la altura de la cadera o más','Al final, llevá la pelvis hacia arriba','Bajá lento, sin balancearte'],err:'Balancearse y subir las piernas con impulso en vez de con el abdomen'},
  plank:{k:'x_plank',cues:['Antebrazos en el piso, codos debajo de los hombros','Cuerpo en línea recta de la cabeza a los talones','Apretá glúteos y abdomen','Respirá parejo mientras sostenés'],err:'Dejar caer la cadera o subirla en pico'},
  russian:{k:'x_russian',cues:['Sentado, torso inclinado atrás y pies despegados (apoyalos para hacerlo más fácil)','Manos juntas (o con un disco)','Girá el torso entero y llevá las manos al costado de la cadera','Espalda larga, sin encorvarte'],err:'Mover solo los brazos sin girar el torso'},
  pallof:{k:'x_pallof',cues:['De costado a la polea, el agarre pegado al pecho','Empujá los brazos al frente y sostené un segundo','El torso no gira hacia la polea','Pies al ancho de los hombros y glúteos firmes'],err:'Dejar que la polea te gire o arquear la espalda'},
  medslam:{k:'x_medslam',cues:['Subí el balón bien arriba, con el cuerpo estirado','Estrellalo contra el piso delante de los pies con todo el cuerpo','Flexioná cadera y rodillas al bajar','Levantalo con la espalda recta'],err:'Tirarlo solo con los brazos, sin usar el abdomen ni la cadera'},
  cablecrunch:{k:'x_cablecrunch',cues:['De rodillas frente a la polea alta, la soga junto a la cara','La cadera queda quieta','Enrollá el torso llevando los codos hacia los muslos','Volvé lento sin soltar la tensión'],err:'Sentarse sobre los talones y tirar con los brazos en vez de enrollar el abdomen'},
  abwheel:{k:'x_abwheel',cues:['De rodillas, la rueda debajo de los hombros','Rodá adelante estirando cadera y brazos a la vez','Llegá hasta donde puedas sin arquear la espalda','Volvé tirando con el abdomen'],err:'Hundir la zona lumbar al estirarse'},
  mtclimb:{k:'x_mtclimb',cues:['Plancha alta, manos debajo de los hombros','Llevá una rodilla al pecho y cambiá de pierna rápido','La cadera queda baja y quieta','Mantené el ritmo respirando'],err:'Subir la cadera en pico o rebotar con todo el cuerpo'},
  deadbug:{k:'x_deadbug',cues:['Boca arriba, brazos al techo y rodillas a 90°','Estirá un brazo hacia atrás y la pierna contraria hacia adelante','La zona lumbar pegada al piso todo el tiempo','Volvé y cambiá de lado, lento'],err:'Arquear la espalda al estirar la pierna'}
});
TECH.x_planchepush={eq:['floor'],A:{h:[37,88],n:[46,92],p:[78,92],k:[94,92],f:[110,92],e:[43,101],a:[40,110]},B:{h:[27,95],n:[36,97],p:[66,99],k:[84,100],f:[102,100],e:[49.4,101],a:[40,110]}};
/* lote 9: calistenia y habilidades (las variantes de cada familia con su clave propia) */
Object.assign(XT,{
  archerpush:{k:'x_archerpush',cues:['Manos bien abiertas','Bajá hacia un lado, el otro brazo queda estirado','Cuerpo recto, sin rotar','Alterná los lados'],err:'Doblar el brazo que tiene que quedar estirado'},
  oapush:{k:'x_oapush',cues:['Piernas abiertas para equilibrar','La otra mano en la espalda','Bajá sin rotar la cadera','Empujá con el pecho y el tríceps'],err:'Girar el cuerpo para ayudarte'},
  planchepush:{k:'x_planchepush',cues:['Arrancá en planche con los brazos estirados','Bajá doblando los codos hacia atrás, pegados al cuerpo','Los hombros siguen adelante de las manos','Empujá hasta trabar los brazos sin apoyar los pies'],err:'Abrir los codos o bajar la cadera'},
  impdip:{k:'x_impdip',cues:['Antebrazos apoyados en las paralelas, codos debajo de los hombros','Cuerpo vertical y firme','Empujá hasta estirar los brazos sin balancearte','Volvé lento a los antebrazos'],err:'Tirarte adelante para usar el impulso'},
  tuckfl:{k:'fltuck',cues:['Brazos estirados y hombros bajos','Cuerpo rígido, boca arriba y horizontal','Empujá la barra hacia la cadera con los dorsales','Rodillas al pecho y la espalda plana'],err:'Doblar los codos o dejar caer la cadera'},
  advfl:{k:'fladv',cues:['Brazos estirados y hombros bajos','Cuerpo rígido, boca arriba y horizontal','Empujá la barra hacia la cadera con los dorsales','Muslos a 90° del torso, espalda plana (no redonda)'],err:'Doblar los codos o dejar caer la cadera'},
  straddlefl:{k:'flstr',cues:['Brazos estirados y hombros bajos','Cuerpo rígido, boca arriba y horizontal','Empujá la barra hacia la cadera con los dorsales','Piernas estiradas y bien abiertas para acortar la palanca'],err:'Doblar los codos o dejar caer la cadera'},
  fullfl:{k:'flfull',cues:['Brazos estirados y hombros bajos','Cuerpo rígido, boca arriba y horizontal','Empujá la barra hacia la cadera con los dorsales','Piernas juntas y estiradas, en línea con el torso'],err:'Doblar los codos o dejar caer la cadera'},
  onelegfl:{k:'flone',cues:['Brazos estirados y hombros bajos','Cuerpo rígido, boca arriba y horizontal','Empujá la barra hacia la cadera con los dorsales','Una pierna estirada y la otra al pecho; alterná'],err:'Doblar los codos o dejar caer la cadera'},
  tuckbl:{k:'bltuck',cues:['Brazos rectos detrás del cuerpo, boca abajo','Escápulas juntas y hombros abajo','Abdomen y glúteos firmes','Rodillas al pecho, cadera a la altura de los hombros'],err:'Doblar los codos o forzar el hombro'},
  advbl:{k:'bladv',cues:['Brazos rectos detrás del cuerpo, boca abajo','Escápulas juntas y hombros abajo','Abdomen y glúteos firmes','Muslos a 90° y espalda plana'],err:'Doblar los codos o forzar el hombro'},
  straddlebl:{k:'blstr',cues:['Brazos rectos detrás del cuerpo, boca abajo','Escápulas juntas y hombros abajo','Abdomen y glúteos firmes','Piernas estiradas y abiertas'],err:'Doblar los codos o forzar el hombro'},
  fullbl:{k:'blfull',cues:['Brazos rectos detrás del cuerpo, boca abajo','Escápulas juntas y hombros abajo','Abdomen y glúteos firmes','Piernas juntas, cuerpo en línea horizontal'],err:'Doblar los codos o forzar el hombro'},
  tuckpl:{k:'pltuck',cues:['Brazos completamente estirados','Hombros bien adelante de las manos','Espalda alta redondeada, empujando el piso','Rodillas al pecho, cadera a la altura de los hombros'],err:'Doblar los codos'},
  advpl:{k:'pladv',cues:['Brazos completamente estirados','Hombros bien adelante de las manos','Espalda alta redondeada, empujando el piso','Espalda plana y rodillas detrás de la cadera'],err:'Doblar los codos'},
  straddlepl:{k:'plstr',cues:['Brazos completamente estirados','Hombros bien adelante de las manos','Espalda alta redondeada, empujando el piso','Piernas estiradas y abiertas, cuerpo horizontal'],err:'Doblar los codos'},
  fullpl:{k:'planche',cues:['Brazos completamente estirados','Hombros bien adelante de las manos','Espalda alta redondeada, empujando el piso','Piernas juntas, el cuerpo entero horizontal'],err:'Doblar los codos'},
  vflag:{k:'vflag',cues:['Mano de arriba tira, mano de abajo empuja','Brazos estirados','Cuerpo vertical y apretado, piernas juntas arriba','Es el paso previo a bajar a la bandera'],err:'Doblar el brazo de abajo'},
  tuckflag:{k:'flagtuck',cues:['Mano de arriba tira, mano de abajo empuja','Brazos estirados','Cuerpo horizontal con las rodillas al pecho','Hombros firmes, sin girar'],err:'Doblar el brazo de abajo'},
  straddleflag:{k:'flagstr',cues:['Mano de arriba tira, mano de abajo empuja','Brazos estirados','Piernas estiradas y abiertas','Cuerpo horizontal'],err:'Doblar el brazo de abajo'},
  flag:{k:'flag',cues:['Mano de arriba tira, mano de abajo empuja','Brazos estirados','Piernas juntas y estiradas','Cuerpo horizontal y rígido'],err:'Doblar el brazo de abajo'},
  negpull:{k:'x_negpull',cues:['Subí saltando o desde un cajón, con el mentón arriba de la barra','Bajá lo más lento que puedas (3 a 5 segundos)','Hombros activos hasta abajo','Volvé arriba sin tirar'],err:'Dejarte caer en la última parte'},
  deadhang:{k:'x_deadhang',cues:['Agarre al ancho de los hombros, brazos estirados','Hombros activos, lejos de las orejas','Cuerpo quieto, sin balancearte','Respirá parejo'],err:'Colgarte flojo con los hombros en las orejas'},
  hollow:{k:'x_hollow',cues:['Boca arriba, la zona lumbar pegada al piso','Despegá los hombros y las piernas estiradas','Brazos estirados hacia los pies (atrás de la cabeza es más difícil)','Sostené sin arquear'],err:'Despegar la zona lumbar del piso'},
  clappush:{k:'x_clappush',cues:['Bajá como en una flexión común','Empujá explosivo para despegar las manos','Aplaudí rápido y volvé a apoyar','Caé con los codos blandos'],err:'Caer con los brazos trabados o hundir la cadera'},
  sissy:{k:'x_sissy',cues:['En puntas de pie, brazos adelante para el equilibrio (o agarrate de algo)','Llevá las rodillas adelante y el cuerpo atrás','Línea recta de las rodillas a la cabeza','Bajá hasta donde controles y volvé'],err:'Doblar la cadera y sentarte atrás'}});
/* lote 10: articulaciones y atleta */
Object.assign(XT,{
  spansq:{k:'x_spansq',cues:['Banda detrás de las rodillas, atada a algo firme adelante','Sentate atrás: las canillas quedan verticales','Torso derecho y el peso en los talones','Sostené a media sentadilla respirando'],err:'Dejar que las rodillas se vayan adelante con la banda'},
  tibraise:{k:'x_tibraise',cues:['Espalda contra la pared y los talones un paso adelante','Piernas estiradas','Subí las puntas de los pies lo más que puedas','Bajá lento sin apoyar del todo'],err:'Despegar la espalda de la pared o doblar las rodillas'},
  slcalf:{k:'x_slcalf',cues:['La punta de un pie en el borde del escalón','La otra pierna doblada atrás; apoyá una mano para el equilibrio','Subí bien alto en puntas','Bajá lento hasta que el talón pase el borde'],err:'Rebotar abajo sin recorrido completo'},
  slbal:{k:'x_slbal',cues:['Parado en una pierna, la rodilla apenas flexionada','La otra rodilla arriba, a la altura de la cadera','Brazos a los costados y la mirada en un punto fijo','Cuando sea fácil, cerrá los ojos'],err:'Trabar la rodilla de apoyo o dejar caer la cadera'},
  kneewall:{k:'x_kneewall',cues:['El pie de adelante a unos centímetros de la pared','Llevá la rodilla a tocar la pared','El talón no se despega del piso','Alejá el pie de a poco cuando llegues fácil'],err:'Levantar el talón para llegar a la pared'},
  slbridge:{k:'x_slbridge',cues:['Boca arriba, un pie apoyado cerca de la cola','La otra pierna estirada en línea con el muslo','Subí la cadera con el glúteo hasta alinear el cuerpo','Sostené sin que la cadera se incline'],err:'Arquear la espalda baja en vez de usar el glúteo'},
  sidepl:{k:'x_sidepl',cues:['De costado sobre el antebrazo, codo debajo del hombro','Pies juntos y la cadera arriba, cuerpo en línea','El otro brazo arriba o en la cintura','Aguantá respirando normal; hacé los dos lados'],err:'Dejar caer la cadera'},
  birddog:{k:'x_birddog',cues:['En cuatro patas: manos debajo de los hombros, rodillas debajo de la cadera','Estirá un brazo adelante y la pierna contraria atrás','La cadera no se mueve ni gira','Pausa de 5 segundos y cambiá'],err:'Arquear la espalda o subir la pierna de más'},
  curlup:{k:'x_curlup',cues:['Boca arriba, una pierna doblada y la otra estirada','Manos debajo de la zona lumbar','Despegá apenas la cabeza y los hombros, sin mover la espalda baja','Pausa de 8 a 10 segundos y bajá'],err:'Flexionar el cuello o la espalda baja para subir más'},
  biering:{k:'x_biering',cues:['Cadera en el borde del banco, tobillos trabados','Brazos cruzados sobre el pecho','Cuerpo recto en línea con las piernas','Sostené sin arquear ni dejar caer el torso'],err:'Arquear la espalda baja para subir de más'},
  extrot:{k:'x_extrot',cues:['Banda atada del otro lado, a la altura del codo','Codo pegado al cuerpo y doblado a 90°','Llevá la mano hacia afuera sin despegar el codo','Volvé lento contra la banda'],err:'Despegar el codo del cuerpo o girar el torso'},
  wallslide:{k:'x_wallslide',cues:['Espalda, cabeza y brazos contra la pared','Arrancá con los brazos en W, codos a la altura de los hombros','Deslizá los brazos arriba hasta una Y sin despegarlos','Bajá lento a la W'],err:'Arquear la espalda baja o despegar los brazos de la pared'},
  cmj:{k:'vjump',cues:['Bajada rápida a un cuarto de sentadilla','Tirá los brazos hacia arriba','Extendé tobillos, rodillas y cadera juntos','Caé suave, con las rodillas dobladas'],err:'Bajar demasiado lento (se pierde el rebote)'},
  broadjump:{k:'broad',cues:['Balanceá los brazos atrás y adelante','Empujá con todo hacia adelante y arriba','Caé con los dos pies y aguantá la posición','Descansá bien entre saltos'],err:'Caer con las rodillas hacia adentro'},
  pogo:{k:'x_pogo',cues:['Saltos cortos y rápidos en puntas de pie','Rodillas casi estiradas: el resorte es el tobillo','Tocá el piso lo menos posible','Brazos relajados al costado'],err:'Doblar las rodillas y caer con el talón'},
  skater:{k:'x_skater',cues:['Saltá de costado de una pierna a la otra','La pierna libre cruza por detrás','Caé suave sobre una pierna y frená firme','La rodilla de apoyo en línea con el pie'],err:'Caer con la rodilla hacia adentro'},
  sprint:{k:'sprint',cues:['Primeros pasos cortos y potentes, inclinado','Brazos fuertes, de la cadera a la cara','Pisá debajo del cuerpo, no adelante','Descanso completo entre sprints'],err:'Hacerlos cansado: pierde el sentido'},
  burpee:{k:'x_burpee',cues:['Agachate y apoyá las manos en el piso','Saltá atrás a plancha con el cuerpo recto','Volvé los pies a las manos','Saltá arriba con los brazos sobre la cabeza'],err:'Hundir la cadera en la plancha'},
  jumprope:{k:'x_jumprope',cues:['Manos a los costados de la cadera','El giro sale de las muñecas, no de los brazos','Saltitos bajos en puntas de pie','Mirá adelante y respirá parejo'],err:'Saltar demasiado alto o girar la soga con los hombros'},
  bearcrawl:{k:'x_bearcrawl',cues:['Manos debajo de los hombros y rodillas debajo de la cadera','Rodillas a un par de centímetros del piso','Avanzá mano y pie contrarios a la vez','Espalda plana y cadera baja'],err:'Subir la cadera o apoyar las rodillas'},
  highknees:{k:'x_highknees',cues:['Corré en el lugar en puntas de pie','Subí las rodillas a la altura de la cadera','Brazos contrarios a las piernas','Torso derecho, ritmo rápido'],err:'Echarte atrás o subir poco las rodillas'}});
TECH.wallhs.wallX=64;TECH.hspu.wallX=64;
/* arreglos lote 9: figura propia, con la técnica que ya tenían */
[['muscleup','muscleup'],['diamond','diamond'],['russiandip','russiandip'],['lpullup','lpullup'],['oapull','oapull'],['archerpull','archerpull']].forEach(([id,o])=>{XT[id]=Object.assign({cues:TECH[o].cues,err:TECH[o].err},XT[id]||{},{k:'x_'+o});});
/* la figura propia también lleva las claves de su ejercicio (para quien lea TECH directo) */
Object.keys(XT).forEach(id=>{const x=XT[id],T=TECH[x.k];if(T&&x.cues&&!T.cues){T.cues=x.cues;T.err=x.err;}});
/* claves propias de cada variante de habilidad (antes no tenían y su detalle no abría) */
const VAR_CUES={
  invrow:[['Cuerpo recto de los talones a la cabeza','Tirá del pecho hacia la barra','Juntá las escápulas arriba','Más horizontal = más difícil'],'Dejar caer la cadera'],
  airsq:[['Pies al ancho de hombros','Bajá con el pecho arriba','Rodillas en la línea de los pies','Bajá al menos a la altura de las rodillas'],'Levantar los talones'],
  lsittuck:[['Brazos rectos, hombros bien abajo','Rodillas al pecho','Sostené sin balancearte','Respirá tranquilo'],'Encoger los hombros'],
  lsitone:[['Una pierna estirada, la otra al pecho','Brazos rectos','Alterná las piernas en cada serie','Hombros abajo'],'Doblar la pierna estirada'],
  vsit:[['Piernas estiradas lo más arriba posible','Cadera adelante de las manos','Hombros muy deprimidos','Es un paso más allá del L-sit'],'Redondear la espalda sin empujar'],
  wallhs:[['Manos a un palmo de la pared','Brazos estirados y trabados','Cuerpo recto, abdomen firme','Mirá entre las manos'],'Arquear la espalda baja'],
  hspu:[['Arrancá en vertical contra la pared','Bajá la cabeza hasta casi tocar el piso','Codos un poco hacia adelante','Empujá hasta estirar los brazos'],'Abrir los codos hacia los costados'],
  freehspu:[['Vertical sin pared, equilibrio en los dedos','Bajá controlado','Empujá derecho hacia arriba','Primero dominá la vertical libre'],'Perder la línea al bajar'],
  pike:[['Cadera bien arriba, cuerpo en V invertida','Bajá la cabeza hacia adelante de las manos','Codos hacia atrás','Es la base para la vertical'],'Bajar con la cabeza entre las manos'],
  skincat:[['Colgado, subí las rodillas al pecho','Pasá las piernas entre los brazos','Bajá lento hasta donde el hombro lo permita','Volvé por el mismo camino'],'Soltarte de golpe abajo'],
  crow:[['Manos al ancho de hombros, dedos abiertos','Rodillas apoyadas arriba de los codos','Inclinate adelante hasta despegar los pies','Mirá un poco adelante'],'Tirar el peso atrás y no despegar'],
  bltuck:[['Colgado boca abajo, brazos rectos detrás del cuerpo','Escápulas juntas y hombros abajo','Cuerpo horizontal, abdomen y glúteos firmes','Arrancá encogido y estirá de a poco'],'Doblar los codos o forzar el hombro'],bladv:[['Colgado boca abajo, brazos rectos detrás del cuerpo','Escápulas juntas y hombros abajo','Cuerpo horizontal, abdomen y glúteos firmes','Arrancá encogido y estirá de a poco'],'Doblar los codos o forzar el hombro'],blstr:[['Colgado boca abajo, brazos rectos detrás del cuerpo','Escápulas juntas y hombros abajo','Cuerpo horizontal, abdomen y glúteos firmes','Arrancá encogido y estirá de a poco'],'Doblar los codos o forzar el hombro'],blfull:[['Colgado boca abajo, brazos rectos detrás del cuerpo','Escápulas juntas y hombros abajo','Cuerpo horizontal, abdomen y glúteos firmes','Arrancá encogido y estirá de a poco'],'Doblar los codos o forzar el hombro'],
  pllean:[['Posición de flexión con manos a la cintura','Llevá los hombros bien adelante de las manos','Brazos rectos y escápulas abiertas','Sostené'],'Doblar los codos']
};
[['fltuck','fl'],['fladv','fl'],['flone','fl'],['flstr','fl'],['flfull','fl'],['pltuck','planche'],['pladv','planche'],['plstr','planche'],['vflag','flag'],['flagtuck','flag'],['flagstr','flag']].forEach(([k,b])=>{if(TECH[k]&&!TECH[k].cues&&TECH[b]){TECH[k].cues=TECH[b].cues;TECH[k].err=TECH[b].err;}});
Object.keys(VAR_CUES).forEach(k=>{if(TECH[k]&&!TECH[k].cues){TECH[k].cues=VAR_CUES[k][0];TECH[k].err=VAR_CUES[k][1];}});
function techCard(ex){
  const k=techOf(ex),T=k&&TECH[k];if(!T)return '';
  /* respaldo: si una figura no trae claves, se usa la descripción del ejercicio */
  /* SW-7: primero la técnica propia del ejercicio (XT); si no, la del tipo de movimiento */
  const X=XT[ex.id]||{},cues=X.cues||T.cues||(ex.d?[ex.d]:[]),err=X.err||T.err;
  return '<div class="tech"><div class="tech-fig">'+techSVG(k)+'</div><div class="tech-txt"><h4>Cómo se hace</h4><ul>'+cues.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul>'+
   (err?'<p class="tech-err">'+ic('x',14)+'<span><b>Error común:</b> '+esc(err)+'</span></p>':'')+'</div></div>'+vidSlot(ex);
}

/* ============ Recordatorios en el celular (notificaciones push) ============ */
const Push=(()=>{
  const ok=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window;
  const ios=()=>/iPhone|iPad|iPod/.test(navigator.userAgent),standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  const b64=s=>{const p='='.repeat((4-s.length%4)%4),r=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...r].map(c=>c.charCodeAt(0)));};
  async function current(){if(!ok())return null;const r=await navigator.serviceWorker.getRegistration();return r?r.pushManager.getSubscription():null;}
  async function saveSub(sub){
    const st=db.settings.push||{},body={endpoint:sub.endpoint,sub:sub.toJSON(),tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'America/Montevideo',at:st.at||'18:00',kinds:{train:st.train!==false,crea:!!st.crea},user_id:Sync.user().id};
    await Sync.req('/rest/v1/swole_push?on_conflict=endpoint',{method:'POST',auth:true,headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body});
  }
  async function enable(){
    if(!Sync.user())throw new Error('login');
    if(!ok())throw new Error(ios()&&!standalone()?'ios':'nosupport');
    const perm=await Notification.requestPermission();if(perm!=='granted')throw new Error('denied');
    const reg=await navigator.serviceWorker.ready;
    const key=await Sync.req('/rest/v1/rpc/swole_vapid_public',{method:'POST',body:{}});
    if(!key)throw new Error('nokey');
    let sub=await reg.pushManager.getSubscription();
    if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64(String(key))});
    db.settings.push=Object.assign({at:'18:00',train:true,crea:!!db.settings.remind.on},db.settings.push||{},{on:true});save();
    await saveSub(sub);
  }
  async function update(){const s=await current();if(s&&Sync.user())await saveSub(s);}
  async function disable(){
    const s=await current();
    if(s){try{if(Sync.user())await Sync.req('/rest/v1/swole_push?endpoint=eq.'+encodeURIComponent(s.endpoint),{method:'DELETE',auth:true});}catch(e){}await s.unsubscribe();}
    db.settings.push=Object.assign({},db.settings.push||{},{on:false});save();
  }
  async function test(){
    const t=await Sync.req('/functions/v1/swole-remind',{method:'POST',auth:true,body:{test:true}});
    return t;
  }
  const errTxt=e=>{const m=String(e&&e.message||e);return m==='login'?'Primero entrá con tu cuenta (Perfil → Cuenta)':m==='ios'?'En iPhone: agregá Swole a la pantalla de inicio (Compartir → Agregar a inicio) y activalo desde ahí':m==='nosupport'?'Este navegador no permite notificaciones':m==='denied'?'Bloqueaste las notificaciones: habilitalas en los ajustes del navegador para este sitio':'No se pudo: '+m;};
  return{ok,ios,standalone,enable,disable,update,test,current,errTxt};
})();
function pushCard(){
  const st=db.settings.push||{},on=!!st.on;
  return '<div class="card" id="pushCard"><div class="hd"><div><h3>Recordatorios en el celular</h3><span class="mut sm-t">Te llegan aunque Swole esté cerrada</span></div>'+
   '<button class="chip '+(on?'on':'')+'" data-a="pushTog" aria-pressed="'+on+'">'+(on?'Activados':'Activar')+'</button></div>'+
   (on?'<div class="opt" style="margin:4px 0 10px"><button class="'+(st.train!==false?'on':'')+'" data-a="pushKind" data-v="train" aria-pressed="'+(st.train!==false)+'">'+ic('dumb',16)+' Días de entreno</button><button class="'+(st.crea?'on':'')+'" data-a="pushKind" data-v="crea" aria-pressed="'+!!st.crea+'">'+ic('pill',16)+' Creatina</button></div>'+
     '<div class="push-at"><label class="field" style="margin:0"><span>Hora del aviso</span><input id="pushAt" type="time" value="'+(st.at||'18:00')+'" data-i="pushAt" aria-label="Hora del recordatorio"></label><button class="btn sm" data-a="pushTest">'+ic('bolt',15)+' Probar</button></div>'+
     '<p class="mut sm-t" style="margin-top:8px">Solo te avisa los días que tenés una rutina planeada y todavía no entrenaste. Puede llegar hasta 15 minutos después de la hora.</p>'
    :'<p class="mut sm-t">'+(Push.ios()&&!Push.standalone()?'En iPhone, primero agregá Swole a la pantalla de inicio (Compartir → Agregar a inicio) y abrila desde ahí.':'Por ejemplo: "Hoy te toca entrenar: Piernas A" a la hora que elijas.')+'</p>')+'</div>';
}

/* ============ Coach: lee tu historial y te dice qué ajustar ============ */
/* estancado: 4+ sesiones en 6 semanas y las últimas 3 no superan a las anteriores (con al menos 10 días entre la primera y la última) */
function stallOf(id){
  const ex=exById(id);if(!ex||ex.time||!hasRank(ex))return null;
  const from=addDays(today(),-42),ses=[];
  db.logs.filter(l=>l.date>=from).sort((a,b)=>a.date<b.date?-1:1).forEach(l=>{const en=l.entries.find(e=>e.ex===id);if(!en)return;const m=Math.max(0,...en.sets.filter(s=>!s.w).map(s=>e1(ex,s.kg,s.reps)));if(m>0)ses.push({d:l.date,m});});
  if(ses.length<4)return null;
  const rec=ses.slice(-3),old=ses.slice(0,-3),bestOld=Math.max(...old.map(s=>s.m)),bestRec=Math.max(...rec.map(s=>s.m));
  return bestRec<=bestOld*1.005&&(parseK(rec[2].d)-parseK(rec[0].d))/864e5>=10?{ex,since:rec[0].d,n:ses.length}:null;
}
/* el plan que elegiste para salir del estancamiento, si sigue vigente */
const fixOf=id=>{const f=(db.settings.fix||{})[id];return f&&f.until>=today()?f:null;};
const FIX_N={deload:'Semana liviana',reps:'Cambio de repeticiones',vary:'Variante parecida'};
const PUSH_M=['pecho','hombros','triceps'],PULL_M=['dorsales','trapecio','biceps'];
function coachTips(){
  const out=[],t=today(),ws=weekStart(),hide=db.settings.coachHide||{};
  const logs=db.logs.slice().sort((a,b)=>a.date<b.date?-1:1);
  if(!db.profile||logs.length<2)return out;
  const last=logs[logs.length-1],gap=Math.round((parseK(t)-parseK(last.date))/864e5);
  /* 0. sueño: varias noches malas seguidas */
  {const sl=db.settings.sleep||{},last=[0,1,2,3,4,5,6].map(i=>sl[addDays(t,-i)]).filter(Boolean);
   if(last.length>=3&&last.filter(v=>v<=2).length>=3&&!hide.sleep)out.push({id:'sleep',i:'moon',tone:'warn',txt:'Dormiste mal '+last.filter(v=>v<=2).length+' de las últimas noches. El músculo crece cuando descansás: probá acostarte 30 minutos antes esta semana.'});}
  /* sin cuenta y sin copia hace rato: tus datos viven solo en este celu */
  if(!Sync.user()&&logs.length>=5&&!hide.bkp){const lb=db.settings.lastBackup,dd=lb?Math.round((parseK(t)-parseK(String(lb).slice(0,10)))/864e5):999;
    if(dd>=21)out.push({id:'bkp',i:'cloud',tone:'warn',txt:'Tus '+logs.length+' entrenos están solo en este dispositivo'+(lb?' y la última copia es de hace '+dd+' días':'')+'. Creá una cuenta gratis o bajá una copia desde Perfil.',a:'profile',al:'Ir a Perfil'});}
  /* 1. hace mucho que no entrenás */
  if(gap>=8)out.push({id:'gap',i:'play',tone:'warn',txt:'Hace '+gap+' días que no entrenás. Volvé con una sesión corta y liviana: lo importante es retomar.',a:'todayGo',al:'Entreno de hoy'});
  /* 2. estancado: 4+ sesiones en 6 semanas y las últimas 3 no superan a las anteriores */
  const st=rankedList().map(x=>stallOf(x.ex.id)).filter(x=>x&&!fixOf(x.ex.id)).map(x=>x.ex);
  if(st.length)out.push({id:'stall-'+st[0].id,i:'swap',tone:'warn',txt:shortN(st[0].n)+' no sube hace un par de semanas. Elegí un plan para destrabarlo: una semana liviana, cambiar las repeticiones o probar una variante.',a:'exInfo',v:st[0].id,al:'Elegir un plan'});
  /* 3. desbalance empuje / tirón (últimas 4 semanas) */
  let pu=0,pl=0,up=0,lo=0;
  logs.filter(l=>l.date>=addDays(t,-28)).forEach(l=>l.entries.forEach(en=>{const ex=exById(en.ex);if(!ex)return;const n=en.sets.filter(s=>!s.w).length,p=ex.p[0];
    if(PUSH_M.includes(p))pu+=n;if(PULL_M.includes(p))pl+=n;if(LOWER.includes(p))lo+=n;else if(!['abs','oblicuos'].includes(p))up+=n;}));
  if(pu>=12&&pu>pl*1.5)out.push({id:'pp',i:'swap',tone:'warn',txt:'Hacés '+num(pu/Math.max(1,pl),1)+' series de empuje por cada una de tirón. Sumá remos o dominadas: equilibra la postura y cuida los hombros.',a:'exInfo',v:'row',al:'Ver remo'});
  /* 4. piernas que quedan cortas */
  if(up>=20&&lo<up*.3&&!(db.profile.sports||[]).some(s=>['futbol','rugby','running','ciclismo','hockey','basquet'].includes(s)))
    out.push({id:'legs',i:'muscle',tone:'warn',txt:'Las piernas tienen '+Math.round(lo/(up+lo)*100)+' % de tus series. Sumá un día de piernas: son tus músculos más grandes y suben mucho tu rango general.',a:'genOpen',al:'Armar rutina'});
  /* 5. venís bien */
  const im=improvements();
  if(im.length&&out.length<3)out.push({id:'good',i:'trophy',tone:'ok',txt:'Venís subiendo: '+shortN(im[0].ex.n)+' +'+Math.round(im[0].rel*100)+' % en 4 semanas. Mantené lo que estás haciendo.'});
  /* 6. dormir y comer: si la racha semanal es buena pero no hay récords en 5 semanas */
  if(weekStreak()>=4&&!(db.settings.ev||[]).some(e=>(e.k==='pr'||e.k==='up')&&e.d>=addDays(t,-35))&&out.length<3)
    out.push({id:'plateau',i:'heart',tone:'warn',txt:'Entrenás seguido pero hace 5 semanas que no hay récords. Revisá sueño (7-9 h), proteína (1,6-2,2 g por kg) y probá una semana de descarga.'});
  return out.filter(x=>hide[x.id]!==ws).slice(0,3);
}
function coachCard(){
  const tips=coachTips();if(!tips.length)return '';
  return '<div class="card coach"><div class="hd"><div><span class="lh-k">Tu coach</span><h3>'+(tips.length===1?'Un consejo':tips.length+' consejos')+' para esta semana</h3></div>'+ic('spark',20)+'</div>'+
   tips.map(x=>'<div class="ct '+x.tone+'"><span class="ct-ic">'+ic(x.i,16)+'</span><div class="grow"><p>'+esc(x.txt)+'</p>'+(x.a?'<button class="btn sm" data-a="'+x.a+'"'+(x.v?' data-v="'+x.v+'"':'')+'>'+esc(x.al)+'</button>':'')+'</div><button class="ib flat" data-a="coachHide" data-v="'+x.id+'" aria-label="Ocultar este consejo">'+ic('x',16)+'</button></div>').join('')+'</div>';
}

/* ============ Herramientas: 1RM y porcentajes, timer de intervalos ============ */
const pctRows=[100,95,90,85,80,75,70,65,60,50];
function toolsHTML(m){
  const tab=m.tab||'rm';
  let h='<div class="seg" style="margin-bottom:12px"><button class="'+(tab==='rm'?'on':'')+'" data-a="toolTab" data-v="rm">1RM y porcentajes</button><button class="'+(tab==='iv'?'on':'')+'" data-a="toolTab" data-v="iv">Intervalos</button></div>';
  if(tab==='rm'){
    const kg=+m.kg||0,reps=Math.min(15,+m.reps||0),rm=kg>0&&reps>0?kg*(1+reps/30):0;
    h+='<div class="g2"><label class="field">Peso (kg)<input type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(m.kg||'')+'" data-i="tool" data-f="kg"></label><label class="field">Repeticiones<input type="number" inputmode="numeric" min="1" max="15" value="'+esc(m.reps||'')+'" data-i="tool" data-f="reps"></label></div>'+
     '<div id="rmOut">'+rmOut(rm)+'</div>';
  }else{
    const iv=S.iv,pr=m.pr||'tabata',P={tabata:{w:20,r:10,n:8,l:'Tabata 20/10 × 8'},emom:{w:60,r:0,n:10,l:'EMOM 10 minutos'},hiit:{w:40,r:20,n:10,l:'40/20 × 10'},custom:{w:+m.w||30,r:m.r===''||m.r==null?15:Math.max(0,+m.r||0),n:+m.n||8,l:'A medida'}}[pr];
    h+='<div class="opt" style="margin-bottom:10px">'+[['tabata','Tabata'],['emom','EMOM'],['hiit','40/20'],['custom','A medida']].map(([k,n])=>'<button class="'+(pr===k?'on':'')+'" data-a="ivPreset" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
     (pr==='custom'?'<div class="g3"><label class="field">Trabajo (s)<input type="number" inputmode="numeric" min="5" max="600" value="'+P.w+'" data-i="tool" data-f="w"></label><label class="field">Descanso (s)<input type="number" inputmode="numeric" min="0" max="600" value="'+P.r+'" data-i="tool" data-f="r"></label><label class="field">Rondas<input type="number" inputmode="numeric" min="1" max="50" value="'+P.n+'" data-i="tool" data-f="n"></label></div>':'')+
     '<div class="ivbox '+(iv?iv.ph:'idle')+'" id="ivBox">'+ivInner(iv,P)+'</div>'+
     '<div class="g2" style="margin-top:12px">'+(iv?'<button class="btn" data-a="ivStop">Terminar</button><button class="btn pri" data-a="ivPause">'+(iv.paused?'Seguir':'Pausa')+'</button>':'<span></span><button class="btn pri" data-a="ivStart">'+ic('play',16)+' Empezar</button>')+'</div>'+
     '<p class="mut sm-t" style="margin-top:10px">Suena y vibra en cada cambio. La pantalla no se apaga mientras corre.</p>';
  }
  return h;
}
function rmOut(rm){
  if(!rm)return '<p class="mut sm-t">Poné un peso y cuántas repeticiones hiciste (hasta 15) y te calculo tu máximo estimado.</p>';
  return '<div class="rm-big"><span class="mut sm-t">1RM estimado</span><b>'+num(rm,1)+' kg</b></div><div class="rm-tab">'+pctRows.map(p=>{const w=Math.round(rm*p/100/2.5)*2.5,r=p>=100?1:Math.max(1,Math.round((100/p-1)*30));return '<div><span>'+p+' %</span><b>'+num(w,1)+' kg</b><small>~'+r+(r===1?' rep':' reps')+'</small></div>';}).join('')+'</div>'+
   '<p class="mut sm-t" style="margin-top:8px">Fórmula de Epley. Para trabajar lejos del fallo, usá el peso de unas 2 repeticiones más de las que vas a hacer.</p>';
}
function ivInner(iv,P){
  if(!iv)return '<span class="iv-ph">Listo</span><b class="iv-t">'+fmtT(P.w)+'</b><span class="iv-r">'+P.l+'</span>';
  const left=Math.max(0,Math.ceil((iv.end-(iv.paused?iv.pauseAt:Date.now()))/1000));
  return '<span class="iv-ph">'+(iv.ph==='w'?'Trabajá':iv.ph==='r'?'Descansá':iv.ph==='pre'?'Preparate':'¡Terminado!')+'</span><b class="iv-t">'+(iv.ph==='done'?'✓':fmtT(left))+'</b><span class="iv-r">Ronda '+Math.min(iv.round,iv.n)+' de '+iv.n+'</span>';
}
let ivT=null;
function ivTick(){
  const iv=S.iv;if(!iv||iv.paused)return;
  if(Date.now()>=iv.end){
    if(iv.ph==='pre'||iv.ph==='r'){iv.ph='w';iv.end=Date.now()+iv.w*1000;beep();}
    else if(iv.ph==='w'){if(iv.round>=iv.n){iv.ph='done';clearInterval(ivT);keepAwake(!!db.active);beep();setTimeout(beep,350);buzz([200,100,200,100,400]);}
      else if(iv.r>0){iv.ph='r';iv.end=Date.now()+iv.r*1000;iv.round++;beep();}else{iv.round++;iv.end=Date.now()+iv.w*1000;beep();}}
    buzz(120);
  }
  const b=$('#ivBox');if(b){b.className='ivbox '+iv.ph;b.innerHTML=ivInner(iv);}
}

/* ============ Récords personales ============ */
function recordsList(){
  const out=[];
  rankedList().concat(allEx().filter(e=>!hasRank(e)&&bestE1(e.id)).map(ex=>({ex,b:bestE1(ex.id)}))).forEach(x=>{if(x.b)out.push({ex:x.ex,b:x.b});});
  return out.sort((a,b)=>a.b.date<b.b.date?1:a.b.date>b.b.date?-1:0);
}
function recordsCard(){
  const rs=recordsList();if(!rs.length)return '';
  const all=S.recAll,list=all?rs:rs.slice(0,6);
  return '<div class="card"><div class="hd"><div><h3>Récords personales</h3><span class="mut sm-t">Tu mejor serie en cada ejercicio, del más reciente al más viejo</span></div>'+ic('trophy',20)+'</div>'+
   list.map(x=>{const u=x.ex.time?' s':' reps',set=(+x.b.kg?num(+x.b.kg,1)+' kg × ':'')+x.b.reps+(x.ex.time?' s':' reps');
     return '<button class="rec-r" data-a="exInfo" data-v="'+x.ex.id+'"><span class="grow"><b>'+esc(shortN(x.ex.n))+'</b><small class="mut">'+set+(x.ex.st&&!x.ex.sk?' · 1RM '+num(x.b.e,1)+' kg':'')+'</small></span><span class="rec-d">'+dayAgo(x.b.date)+'</span></button>';}).join('')+
   (rs.length>6?'<button class="btn sm line wide" style="margin-top:8px" data-a="recAll">'+(all?'Ver menos':'Ver los '+rs.length+' récords')+'</button>':'')+'</div>';
}

/* ============ Compartir una rutina por link ============ */
const b64u=s=>btoa(unescape(encodeURIComponent(s))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64u=s=>decodeURIComponent(escape(atob(s.replace(/-/g,'+').replace(/_/g,'/'))));
function routineLink(r){
  const cx=r.items.map(i=>exById(i.ex)).filter(e=>e&&e.custom).map(e=>({id:e.id,n:e.n,p:e.p,s:e.s,t:e.time?1:0,b:e.bw?1:0}));
  const o={v:1,n:r.name,r:r.rest||90,i:r.items.map(i=>[i.ex,i.sets,i.reps,i.warm||0]),c:cx,by:(db.profile&&db.profile.nick)||''};
  return location.origin+location.pathname+'?rutina='+b64u(JSON.stringify(o));
}
function parseRoutineLink(s){
  try{const o=JSON.parse(unb64u(s));if(!o||!o.n||!Array.isArray(o.i)||o.i.length>30)return null;
    o.n=String(o.n).slice(0,40);o.by=String(o.by||'').slice(0,24);
    o.i=o.i.filter(x=>Array.isArray(x)&&typeof x[0]==='string').map(x=>[String(x[0]).slice(0,40),Math.min(10,Math.max(1,+x[1]||3)),Math.min(600,Math.max(1,+x[2]||10)),+x[3]?2:0]);
    o.c=(Array.isArray(o.c)?o.c:[]).slice(0,30).map(c=>({id:String(c.id).slice(0,40),n:String(c.n||'Ejercicio').slice(0,40),p:Array.isArray(c.p)&&MUSC[c.p[0]]?[c.p[0]]:['pecho'],s:(Array.isArray(c.s)?c.s:[]).filter(k=>MUSC[k]).slice(0,6),t:+c.t?1:0,b:+c.b?1:0}));
    return o;}catch(e){return null;}
}
function rimportHTML(m){
  const o=m.o,nm=id=>{const e=exById(id)||(o.c.find(c=>c.id===id)||{});return shortN(e.n||id);};
  return '<p class="mut sm-t">'+(o.by?esc(o.by)+' te pasó esta rutina.':'Te pasaron esta rutina.')+'</p><h3 style="font:800 22px var(--f-d);margin:6px 0 10px">'+esc(o.n)+'</h3>'+
   '<div class="card" style="margin:0">'+o.i.map(x=>'<div class="rowline"><span>'+esc(nm(x[0]))+'</span><span class="mut">'+x[1]+' × '+x[2]+'</span></div>').join('')+'</div>'+
   '<button class="btn pri wide" style="margin-top:12px" data-a="rimportGo">Agregar a mis rutinas</button>';
}


/* ============ Árbol radial: de vos (el centro) hacia afuera ============ */
const RT_IC={push:'dumb',pull:'up',dip:'down',legs:'muscle',lsit:'acro',hs:'up',fl:'lever',bl:'lever',pl:'planche',flag:'flag'};
const RT_SHORT={kneepush:'De rodillas',pushup:'Flexiones',diamond:'Diamante',archerpush:'Arquero',pppush:'Pseudo planche',oapush:'A un brazo',planchepush:'En planche',austrow:'Remo invertido',pullup:'Dominadas',lpullup:'En L',archerpull:'Arquero',muscleup:'Muscle-up',oapull:'A un brazo',benchdip:'En banco',dips:'Paralelas',ringdip:'Anillas',airsquat:'Sentadilla',shrimp:'Shrimp',pistol:'Pistol',dragon:'Dragon pistol',tucklsit:'Encogido',lsit:'L-sit',vsit:'V-sit',wallhs:'En pared',freehs:'Libre',hspu:'Flexión en pared',freehspu:'Flexión libre',tuckfl:'Encogido',advfl:'Avanzado',straddlefl:'Abierto',fullfl:'Completo',tuckbl:'Encogido',straddlebl:'Abierto',fullbl:'Completo',tuckpl:'Encogida',advpl:'Avanzada',straddlepl:'Abierta',fullpl:'Completa',flag:'Completa',
  pikepush:'Pica',crow:'Cuervo',pllean:'Lean',onelegfl:'Una pierna',skincat:'Skin the cat',advbl:'Avanzado',onelegl:'Una pierna',russiandip:'Rusos',impdip:'Imposible',boxpistol:'Al cajón',vflag:'Vertical',tuckflag:'Encogida',straddleflag:'Abierta'};

function rtLayout(){
  const bs=branches(),N=bs.length,out=[];
  bs.forEach((b,bi)=>{const ang=-Math.PI/2+bi*2*Math.PI/N;
    b.nodes.forEach((n,i)=>{const r=150+i*94,a=ang+i*0.16+Math.sin(i*1.7+bi)*0.03;out.push({b,bi,i,n,ang:a,x:Math.cos(a)*r,y:Math.sin(a)*r,s:nodeState(b,i)});});});
  return out;
}
const RT_HUE={push:'#A78BFF',pull:'#4FA8FF',dip:'#2FE0C8',legs:'#7BE35A',lsit:'#FFD36B',hs:'#FF9F43',fl:'#FF5FA2',bl:'#D77BFF',pl:'#FF6B6B',flag:'#5AE0FF'};
function rtSky(){
  let s='<g class="rt-sky">',seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  for(let i=0;i<90;i++){const a=rnd()*Math.PI*2,d=120+rnd()*860,r=rnd()<.15?2.2:1+rnd();s+='<circle cx="'+(Math.cos(a)*d).toFixed(0)+'" cy="'+(Math.sin(a)*d).toFixed(0)+'" r="'+r.toFixed(1)+'" style="animation-delay:-'+(rnd()*5).toFixed(1)+'s;animation-duration:'+(3+rnd()*4).toFixed(1)+'s"/>';}
  return s+'</g><circle class="rt-neb a" cx="-260" cy="-200" r="420"/><circle class="rt-neb b" cx="300" cy="260" r="460"/>';
}
function radialHTML(m){
  const L=rtLayout(),goal=db.settings.skillGoal,C=2*Math.PI*36;
  let edges='',nodes='',labels='',arms='';
  const byB={};L.forEach(p=>(byB[p.bi]=byB[p.bi]||[]).push(p));
  Object.values(byB).forEach(ps=>{
    const a=ps[0].ang,hue=RT_HUE[ps[0].b.f]||'var(--acc)',lp=ps[ps.length-1],lr=Math.hypot(lp.x,lp.y)+82,la=lp.ang+.05;
    labels+='<text class="rt-bl" x="'+(Math.cos(la)*lr).toFixed(1)+'" y="'+(Math.sin(la)*lr+5).toFixed(1)+'" text-anchor="middle" style="fill:'+hue+'">'+esc(ps[0].b.n)+'</text>';
    let full='',done='';
    ps.forEach((p,i)=>{const px=i?ps[i-1].x:Math.cos(a)*58,py=i?ps[i-1].y:Math.sin(a)*58,on=p.s.done||p.s.avail;
      /* punto de control corrido hacia un costado: el camino se curva (alternando, como una onda) */
      const mx=(px+p.x)/2,my=(py+p.y)/2,dx=p.x-px,dy=p.y-py,L=Math.hypot(dx,dy)||1,k=(i%2?-1:1)*Math.min(26,L*.22);
      const cx=mx-dy/L*k,cy=my+dx/L*k,seg='Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+p.x.toFixed(1)+' '+p.y.toFixed(1);
      const d='M'+px.toFixed(1)+' '+py.toFixed(1)+seg;full+=(i?'':'M'+px.toFixed(1)+' '+py.toFixed(1))+seg;if(p.s.done)done+=(i?'':'M'+px.toFixed(1)+' '+py.toFixed(1))+seg;
      edges+='<path class="rt-e'+(p.s.done?' done':on?' on':'')+'" d="'+d+'" pathLength="1" style="--d:'+(i*90+p.bi*25)+'ms;--h:'+hue+'"/>'+(on?'<path class="rt-flow'+(p.s.done?'':' weak')+'" d="'+d+'" pathLength="1" style="--h:'+hue+'"/>':'');
    });
    /* partículas de luz que viajan por lo que ya dominás */
    arms+='<path class="rt-arm" d="'+full+'" style="--h:'+hue+'"/>';
    if(done){const id='rtp'+ps[0].bi;edges+='<path id="'+id+'" d="'+done+'" fill="none" stroke="none"/>'+[0,1,2].map(j=>'<circle class="rt-pt" r="'+(j?2.6:3.6)+'" style="--h:'+hue+'"><animateMotion dur="'+(3.2+j*.4)+'s" begin="'+(-j*1.1)+'s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines=".4 0 .6 1"><mpath href="#'+id+'"/></animateMotion><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="'+(3.2+j*.4)+'s" begin="'+(-j*1.1)+'s" repeatCount="indefinite"/></circle>').join('');}
  });
  L.forEach(p=>{
    const s=p.s,ex=p.n.ex,col=TCOL[nodeTier(ex)],cls=s.done?'done':s.avail?'avail':'lock',sel=m.sel===p.n.id,id='rc'+p.bi+'_'+p.i;
    nodes+='<g class="rt-n '+cls+(sel?' sel':'')+(goal&&goal.id===p.n.id?' goal':'')+'" data-a="treeSel" data-v="'+p.n.id+'" transform="translate('+p.x.toFixed(1)+' '+p.y.toFixed(1)+')" style="--c:'+col+';--d:'+(p.i*90+p.bi*25+120)+'ms;--fx:'+(-p.x).toFixed(0)+'px;--fy:'+(-p.y).toFixed(0)+'px" tabindex="0" role="button" aria-label="'+esc(shortN(ex.n))+'">'+
     '<g class="rt-in">'+(sel?'<circle class="rt-rip" r="36"/><circle class="rt-rip b" r="36"/>':'')+'<circle class="rt-halo" r="46"/>'+(s.avail?'<circle class="rt-orb" r="45"/>':'')+(s.done?'<g class="rt-spk"><path d="M-40 -30l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M38 26l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z" style="animation-delay:-1.2s"/></g>':'')+'<circle class="rt-bg" r="36"/>'+
     (techOf(ex)?techSVG(techOf(ex),true).replace('<svg class="tq st"','<svg class="tq st rt-fig" x="-27" y="-29" width="54" height="54"')
        :'<g class="rt-ic" transform="translate(-13 -13) scale(1.1)">'+ic(RT_IC[p.b.f]||'acro',24).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'')+'</g>')+
     '<circle class="rt-ring" r="36" style="stroke-dasharray:'+(C*s.pct).toFixed(1)+' '+C.toFixed(1)+'"/>'+
     (s.done?'<g class="rt-ok" transform="translate(24 -24)"><circle r="11"/><path d="M-5 0l3.5 3.5L5-4"/></g>':s.locked&&!s.best?'<g class="rt-lk" transform="translate(24 -24)"><circle r="11"/><rect x="-4.5" y="-1.5" width="9" height="7" rx="1.5"/><path d="M-2.6-1.5v-2.2a2.6 2.6 0 0 1 5.2 0v2.2"/></g>':'')+
     '<text class="rt-t" y="56" text-anchor="middle">'+esc(RT_SHORT[p.n.id]||shortN(ex.n).slice(0,16))+'</text></g></g>';
  });
  const mastered=L.filter(p=>p.s.done).length,ini=((db.profile&&db.profile.nick)||'V').trim().slice(0,1).toUpperCase(),ovr=db.profile?overall():null;
  const ctr='<g class="rt-c"><g class="rt-rays">'+Array.from({length:24},(_,i)=>{const a=i*Math.PI/12,l=i%2?120:170;return '<line x1="'+(Math.cos(a)*58).toFixed(1)+'" y1="'+(Math.sin(a)*58).toFixed(1)+'" x2="'+(Math.cos(a)*l).toFixed(1)+'" y2="'+(Math.sin(a)*l).toFixed(1)+'"/>';}).join('')+'</g><circle class="rt-c-orbit" r="82"/><circle class="rt-c-trk" r="62"/><circle class="rt-c-prog" r="62" pathLength="1" style="stroke-dasharray:'+(mastered/L.length).toFixed(3)+' 1"/><circle class="rt-c-glow" r="70"/><circle class="rt-c-bg" r="52"/>'+(ovr?badge(ovr.L,58).replace('<svg class="badge"','<svg class="badge rt-c-b" x="-29" y="-40"'):'<text class="rt-c-i" y="-2" text-anchor="middle">'+esc(ini)+'</text>')+'<text class="rt-c-n" y="'+(ovr?32:22)+'" text-anchor="middle">'+mastered+' de '+L.length+'</text></g>';
  return '<div class="rt-wrap" id="rtWrap" data-noswipe><svg id="rtSky" class="rt-layer" viewBox="-1000 -1000 2000 2000" aria-hidden="true">'+rtSky()+'<line class="rt-shoot" x1="-700" y1="-600" x2="-560" y2="-540"/><line class="rt-shoot b" x1="300" y1="-750" x2="440" y2="-690"/></svg>'+
   '<svg id="rtSvg" class="rt-layer" viewBox="-1000 -1000 2000 2000" aria-label="Árbol de habilidades">'+
   '<defs><radialGradient id="rtNebA"><stop offset="0" stop-color="var(--acc)" stop-opacity=".28"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></radialGradient><radialGradient id="rtNebB"><stop offset="0" stop-color="var(--acc2)" stop-opacity=".2"/><stop offset="1" stop-color="var(--acc2)" stop-opacity="0"/></radialGradient><radialGradient id="rtBgG"><stop offset="0" stop-color="var(--acc)" stop-opacity=".22"/><stop offset="1" stop-color="var(--acc)" stop-opacity="0"/></radialGradient></defs>'+
   '<circle r="900" fill="url(#rtBgG)"/>'+[185,293,401,509,617,725,833].map(r=>'<circle class="rt-ring-bg" r="'+r+'"/>').join('')+
   arms+edges+labels+ctr+nodes+'</svg>'+
   '<div class="rt-ctrl"><button class="ib" data-a="rtZoom" data-v="in" aria-label="Acercar">'+ic('plus',18)+'</button><button class="ib" data-a="rtZoom" data-v="out" aria-label="Alejar">'+ic('minus',18)+'</button><button class="ib" data-a="rtZoom" data-v="home" aria-label="Centrar">'+ic('home',18)+'</button></div>'+
   '<p class="rt-hint">Arrastrá para moverte · pellizcá o usá + y − para el zoom</p></div>';
}
/* mover y hacer zoom: el árbol es un lienzo fijo y se mueve con transform (va por la placa de video, no se redibuja) */
(()=>{const pts=new Map();let start=null,moved=false,vel=null,last=null,raf=0,idle=0;
  const wrap=()=>$('#rtWrap'),svg=()=>$('#rtSvg'),sky=()=>$('#rtSky');
  const st=()=>(S.rt=S.rt||{x:0,y:0,w:1600,fit:1});
  /* al abrir: que entre el árbol entero (el radio llega a ~900 con los nombres de las ramas) */
  const fitW=()=>{const w=wrap();if(!w||!w.clientHeight)return 1600;const W=w.clientWidth,H=w.clientHeight;
    /* entra el árbol entero, salvo en pantallas angostas: ahí no achico tanto que los círculos queden ilegibles */
    return Math.round(Math.min(1600*Math.max(1,W/H),Math.max(1000,W*2.7)));};
  const apply=()=>{const w=wrap(),s=svg();if(!w||!s)return;const v=st();if(v.fit){v.w=fitW();v.x=0;v.y=0;delete v.fit;}const W=w.clientWidth,Hh=w.clientHeight,k=W/v.w;
    s.style.transform='translate3d('+(W/2-(v.x+1000)*k).toFixed(2)+'px,'+(Hh/2-(v.y+1000)*k).toFixed(2)+'px,0) scale('+k.toFixed(4)+')';
    const y=sky();if(y)y.style.transform='translate3d('+(W/2-(v.x*.55+1000)*k).toFixed(2)+'px,'+(Hh/2-(v.y*.55+1000)*k).toFixed(2)+'px,0) scale('+k.toFixed(4)+')';
    /* mientras se mueve, capa aparte; al quedarse quieto se vuelve a dibujar nítido */
    s.style.willChange='transform';if(y)y.style.willChange='transform';clearTimeout(idle);idle=setTimeout(()=>{s.style.willChange='auto';if(y)y.style.willChange='auto';},260);};
  const unit=()=>{const w=wrap();return w?st().w/w.clientWidth:1;};
  const center=()=>{const r=wrap().getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,W:r.width};};
  /* zoom alrededor de un punto de la pantalla */
  const zoomAt=(cx,cy,nw)=>{const v=st(),c=center(),u0=v.w/c.W,wx=v.x+(cx-c.x)*u0,wy=v.y+(cy-c.y)*u0;v.w=clamp(nw,320,Math.max(1900,fitW()));const u1=v.w/c.W;v.x=wx-(cx-c.x)*u1;v.y=wy-(cy-c.y)*u1;};
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('#rtWrap')||e.target.closest('.rt-ctrl'))return;cancelAnimationFrame(raf);vel=null;
    pts.set(e.pointerId,{x:e.clientX,y:e.clientY});moved=false;last={x:e.clientX,y:e.clientY,t:performance.now()};
    start={v:Object.assign({},st()),p:[...pts.values()].map(p=>({...p}))};},{passive:true});
  document.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)||!start)return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});const P=[...pts.values()],v=st();
    if(P.length===1&&start.p.length===1){const dx=P[0].x-start.p[0].x,dy=P[0].y-start.p[0].y,u=start.v.w/center().W;if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
      v.x=start.v.x-dx*u;v.y=start.v.y-dy*u;const t=performance.now();if(last){const dt=Math.max(1,t-last.t);vel={x:(e.clientX-last.x)/dt,y:(e.clientY-last.y)/dt};}last={x:e.clientX,y:e.clientY,t};}
    else if(P.length>=2&&start.p.length>=2){const d0=Math.hypot(start.p[0].x-start.p[1].x,start.p[0].y-start.p[1].y),d1=Math.hypot(P[0].x-P[1].x,P[0].y-P[1].y);
      if(d0>10){Object.assign(v,start.v);zoomAt((start.p[0].x+start.p[1].x)/2,(start.p[0].y+start.p[1].y)/2,start.v.w*d0/d1);
        const u=v.w/center().W;v.x-=((P[0].x+P[1].x)-(start.p[0].x+start.p[1].x))/2*u;v.y-=((P[0].y+P[1].y)-(start.p[0].y+start.p[1].y))/2*u;moved=true;vel=null;}}
    else{start={v:Object.assign({},v),p:P.map(p=>({...p}))};}
    apply();},{passive:true});
  const end=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);
    if(!pts.size){start=null;
      /* inercia: sigue deslizando y frena de a poco */
      if(vel&&last&&performance.now()-last.t<80&&Math.hypot(vel.x,vel.y)>.05&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let t0=performance.now();
        const step=t=>{const dt=t-t0;t0=t;const u=unit(),v=st();v.x-=vel.x*dt*u;v.y-=vel.y*dt*u;const f=Math.pow(.92,dt/16);vel.x*=f;vel.y*=f;apply();if(Math.hypot(vel.x,vel.y)>.02)raf=requestAnimationFrame(step);};
        raf=requestAnimationFrame(step);}}
    else start={v:Object.assign({},st()),p:[...pts.values()].map(p=>({...p}))};};
  document.addEventListener('pointerup',end,{passive:true});document.addEventListener('pointercancel',end,{passive:true});
  /* si arrastraste, no cuenta como toque en un nodo */
  document.addEventListener('click',e=>{if(moved&&e.target.closest('#rtSvg')){e.stopPropagation();e.preventDefault();moved=false;}},true);
  document.addEventListener('wheel',e=>{if(!e.target.closest('#rtWrap'))return;e.preventDefault();cancelAnimationFrame(raf);zoomAt(e.clientX,e.clientY,st().w*(e.deltaY>0?1.12:.89));apply();},{passive:false});
  window.addEventListener('resize',()=>apply());
  window.rtApply=apply;
})();

/* árbol estilo videojuego: una columna por rama, de lo fácil (abajo) a lo difícil (arriba) */
function gameTreeHTML(m){
  const bs=branches(),goal=db.settings.skillGoal;let tot=0,dn=0;
  const cols=bs.map(b=>{
    const st=b.nodes.map((_,i)=>nodeState(b,i)),d=st.filter(x=>x.done).length;tot+=st.length;dn+=d;
    const node=(s,i)=>{const cls=s.done?'done':s.avail?'avail':'lock',id=s.n.id,fig=techOf(s.n.ex);
      return '<button class="gt-n '+cls+(m.sel===id?' sel':'')+'" data-a="treeSel" data-v="'+id+'" aria-label="'+esc(s.n.ex.n)+'">'+
       '<span class="gt-d"><span class="gt-fig">'+(fig?techSVG(fig,1):'')+'</span></span>'+
       (s.done?'<i class="gt-b ok">'+ic('check',11)+'</i>':s.locked?'<i class="gt-b">'+ic('lock',10)+'</i>':s.best?'<i class="gt-b pc">'+Math.round(s.pct*100)+'%</i>':'')+
       (goal&&goal.id===id?'<i class="gt-goal">'+ic('target',11)+'</i>':'')+
       '<span class="gt-l">'+esc(RT_SHORT[id]||shortN(s.n.ex.n))+'</span></button>';};
    let col='';
    for(let i=st.length-1;i>=0;i--){col+=node(st[i],i);col+='<i class="gt-ln'+(i===0||st[i-1].done?(st[i].done?' on':' next'):'')+'"></i>';}
    return '<div class="gt-col'+(d===st.length?' full':'')+'" style="--c:'+(RT_HUE[b.f]||'var(--acc)')+'"><div class="gt-h"><b>'+esc(b.n)+'</b><small>'+d+' / '+st.length+'</small></div>'+col+
     '<span class="gt-base">'+ic(RT_IC[b.f]||'spark',15)+'</span></div>';
  }).join('');
  return '<div class="gt-top"><div><b>'+dn+'</b><span class="mut"> de '+tot+' dominadas</span></div><div class="bar"><i style="width:'+Math.round(dn/tot*100)+'%;background:var(--acc)"></i></div>'+
   '<p class="mut sm-t">Arrancás abajo y subís. Deslizá para ver todas las ramas.</p></div>'+
   '<div class="gt-scroll"><div class="gt">'+cols+'</div></div>'+(m.sel?'<div class="gt-det">'+nodeDetail(m.sel)+'</div>':'');
}
function treeWrap(m){
  const v=m.view==='lista'?'lista':'game';
  return '<div key="tree-'+v+'"><div class="seg" style="margin-bottom:10px"><button class="'+(v==='game'?'on':'')+'" data-a="treeView" data-v="game">'+ic('tree',16)+' Árbol</button><button class="'+(v==='lista'?'on':'')+'" data-a="treeView" data-v="lista">'+ic('list',16)+' Lista</button></div>'+
   (v==='lista'?treeHTML(m):gameTreeHTML(m))+'</div>';
}
/* centrar suavemente en un nodo */
function rtFocus(x,y,w){
  S.rt=S.rt||{x:0,y:0,w:820};const a=Object.assign({},S.rt),b={x,y,w:w||Math.min(a.w,700)},t0=performance.now(),D=520;
  const step=t=>{const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);S.rt={x:a.x+(b.x-a.x)*e,y:a.y+(b.y-a.y)*e,w:a.w+(b.w-a.w)*e};window.rtApply&&window.rtApply();if(p<1)requestAnimationFrame(step);};
  requestAnimationFrame(step);
}
/* ============ Tiempo por sesión: cada rutina entra en el tiempo que tenés ============ */
const BIGMOV=['squat','bench','deadlift','ohp','row','frontsquat','incbench','rdl','hipthrust','legpress','pullup','dips','muscleup'];
function itemMin(it,rest){
  const ex=exById(it.ex);if(!ex)return 0;
  const big=BIGMOV.includes(ex.id)||it.main,work=ex.time?(+it.reps||30):(+it.reps||10)*3.2,rs=big?Math.max(rest,150):Math.min(rest,105);
  return ((+it.sets||3)*(work+rs)+(it.warm?it.warm*75:0)+40)/60;
}
const routineMinutes=r=>Math.round(6+(r.items||[]).reduce((s,it)=>s+itemMin(it,r.rest||90),0));
function fitTime(r,target){
  if(!target)return r;let g=0;
  while(routineMinutes(r)>target+4&&g++<40){
    const np=r.items.filter(it=>!it.prehab&&!it.power),acc=np.map((it,i)=>({it,i})).filter(x=>x.i>=2&&!x.it.main);
    const c=acc.filter(x=>x.it.sets>2).sort((a,b)=>b.it.sets-a.it.sets)[0];
    if(c)c.it.sets--;else if(r.items.length>3&&!r.items[r.items.length-1].main)r.items.pop();
    else{const m=r.items.find(it=>it.sets>3);if(m)m.sets--;else break;}
  }
  g=0;while(routineMinutes(r)<target-10&&g++<20){const c=r.items.filter(it=>!it.prehab&&!it.power).filter((it,i)=>i>=1&&!it.main&&it.sets<4).sort((a,b)=>a.sets-b.sets)[0];if(!c)break;c.sets++;}
  r.min=routineMinutes(r);return r;
}

/* ============ Powerlifting ============ */
/* bloque de 5 semanas para los básicos: sube la intensidad y la 5.ª es liviana (series, reps, % del máximo) */
const PL_MAIN=[[5,5,.75],[4,4,.80],[4,3,.85],[3,2,.90],[3,5,.65]],PL_SEC=[[3,6,.70],[3,6,.72],[3,5,.75],[3,5,.75],[2,6,.60]];
const PL_MAIN_TEEN=[[4,6,.65],[4,5,.70],[4,5,.72],[3,4,.75],[3,6,.60]];
const PL_DAYS={2:[['squat','bench'],['deadlift','incbench']],3:[['squat','bench'],['deadlift','bench'],['squat','incbench']],4:[['squat'],['bench'],['deadlift'],['bench','frontsquat']]};
const PL_ACC={squat:['bulgarian','legcurl','plank'],deadlift:['row','hipthrust','legraise'],bench:['dbrow','dbohp','pushdown'],incbench:['pullup','lateral','curl'],frontsquat:['rdl','facepull','pushdown']};
const PL_LIFT={squat:{n:'Sentadilla',c:'#E5484D'},bench:{n:'Banca',c:'#3E7BFA'},deadlift:{n:'Peso muerto',c:'#F2B33D'}};
const plWeek=r=>r&&r.since?Math.max(0,Math.floor((parseK(today())-parseK(r.since))/864e5/7))%5:0;
function plPlan(d){
  const p=db.profile||{},age=p.age||25,wk=weekGymDays(),act=[0,1,2,3,4,5,6].filter(x=>dayInfo(x).type);
  const all=wk.length?wk:genDays(+d.days||3,act),n=Math.max(2,Math.min(4,all.length));
  const days=all.slice().sort((a,b)=>((a+6)%7)-((b+6)%7)).slice(0,n);
  const plan=PL_DAYS[n].map((lifts,i)=>{
    const items=[];
    lifts.forEach((id,j)=>items.push(j===0?{ex:id,sets:5,reps:5,pct:.75,main:1,warm:2}:{ex:id,sets:3,reps:6,pct:.7,sec:1}));
    (PL_ACC[lifts[0]]||[]).concat(lifts[1]?(PL_ACC[lifts[1]]||[]).slice(0,1):[]).filter(x=>exById(x)&&!items.some(it=>it.ex===x)).slice(0,3)
      .forEach(x=>{const ds=genDose(exById(x),['hip'],d.lvl||'int','acc',false,age);items.push({ex:x,sets:3,reps:ds[1]});});
    const notes=['Los básicos van por porcentaje de tu máximo: la app te dice los kilos'];if(age<18)notes.push('Sos menor: nada de máximos, primero la técnica');
    return{name:'Powerlifting · '+lifts.map(x=>PL_LIFT[x]?PL_LIFT[x].n:shortN(exById(x).n)).join(' + '),days:[days[i]],items,rest:180,note:notes.join(' · '),pl:1};
  });
  if(db.settings.jointBlock)plan.forEach(r=>{r.items=jBlock().concat(r.items);});
  if(db.settings.athBlock)plan.forEach(r=>{if(!preMatch(r)){const k=r.items.filter(it=>it.prehab).length;r.items.splice(k,0,...aBlock());}});
  if(d.min)plan.forEach(r=>fitTime(r,+d.min));else plan.forEach(r=>r.min=routineMinutes(r));
  plan.vol=weekVolume(plan);plan.gs=['pl'];plan.extra=all.length>4?all.length-4:0;
  return plan;
}
/* al empezar una rutina de powerlifting: series, reps y kilos de la semana del bloque */
function plApply(r,act){
  const w=plWeek(r),teen=(db.profile&&db.profile.age||25)<18,M=(teen?PL_MAIN_TEEN:PL_MAIN)[w],SC=PL_SEC[w];
  act.name=r.name+' · semana '+(w+1)+(w===4?' (liviana)':'');
  act.entries.forEach((en,k)=>{const it=r.items[k];if(!it||it.ex!==en.ex||!(it.main||it.sec))return;
    const [s,rp,pct]=it.main?M:SC,b=bestE1(it.ex),kg=b?Math.round(b.e*pct/2.5)*2.5:0;
    const warm=en.sets.filter(x=>x.w);en.sets=warm.map((x,i)=>({kg:kg?Math.round(kg*(i?.7:.5)/2.5)*2.5:'',reps:i?3:5,done:false,w:1}));
    for(let i=0;i<s;i++)en.sets.push({kg:kg||'',reps:rp,done:false});
    en.goal=kg?{kg,reps:rp,prev:Math.round(pct*100)+' %',why:Math.round(pct*100)+' % de tu máximo'}:null;
    if(!kg)en.note='Todavía no tengo tu máximo: hacé una serie pesada de 3-5 y cargala como marca';
  });
}
/* ============ Programas famosos, listos para usar ============
   Las rutinas suben solas con la meta de cada ejercicio (si completás todas las series, la próxima sube el peso).
   5/3/1 usa porcentajes de tu máximo de entrenamiento (90 % de tu 1RM estimado) por semana. */
const PI_=(ex,sets,reps,o)=>Object.assign({ex,sets,reps},o||{});
const PROGRAMS=[
 {id:'fb3',n:'Full Body 3 días',lv:'Principiante',min:55,src:'Clásico de cuerpo completo',
  d:'Todo el cuerpo en cada sesión, alternando A y B. La mejor forma de arrancar: cada músculo se entrena 3 veces por semana.',
  how:'Cuando completás todas las series con un peso, la próxima subís (la meta te dice cuánto).',
  r:[{n:'Full Body A',days:[1,5],it:[PI_('squat',3,8),PI_('bench',3,8),PI_('row',3,8),PI_('lateral',2,12),PI_('plank',3,40)]},
     {n:'Full Body B',days:[3],it:[PI_('deadlift',3,5),PI_('ohp',3,8),PI_('latpull',3,10),PI_('legcurl',2,12),PI_('curl',2,12)]}]},
 {id:'sl5',n:'StrongLifts 5×5',lv:'Principiante',min:50,src:'Mehdi Hadim, basado en el 5×5 de Bill Starr',
  d:'Tres básicos por sesión, 5 series de 5. Simple y brutal para ganar fuerza los primeros meses.',
  how:'Si hacés 5×5 completo, la próxima +2,5 kg (+5 kg en peso muerto). Si fallás 3 veces seguidas, bajá 10 %.',
  r:[{n:'5×5 A',days:[1,5],it:[PI_('squat',5,5),PI_('bench',5,5),PI_('row',5,5)]},
     {n:'5×5 B',days:[3],it:[PI_('squat',5,5),PI_('ohp',5,5),PI_('deadlift',1,5)]}]},
 {id:'ul4',n:'Upper / Lower',lv:'Intermedio',min:60,src:'Split clásico de 4 días',
  d:'Tren superior e inferior dos veces por semana: un día pesado (pocas reps) y uno de volumen.',
  how:'Doble progresión: subí reps hasta el número de la meta en todas las series y después subí el peso.',
  r:[{n:'Upper pesado',days:[1],it:[PI_('bench',4,6),PI_('row',4,6),PI_('ohp',3,8),PI_('latpull',3,10),PI_('curl',3,12),PI_('pushdown',3,12)]},
     {n:'Lower pesado',days:[2],it:[PI_('squat',4,6),PI_('rdl',3,8),PI_('legpress',3,10),PI_('legcurl',3,12),PI_('calf',4,12)]},
     {n:'Upper volumen',days:[4],it:[PI_('incbench',3,8),PI_('pullup',4,8),PI_('dbohp',3,10),PI_('cablerow',3,10),PI_('lateral',3,15),PI_('hammer',3,12)]},
     {n:'Lower volumen',days:[5],it:[PI_('deadlift',3,5),PI_('frontsquat',3,8),PI_('bulgarian',3,10),PI_('legext',3,12),PI_('hipthrust',3,10)]}]},
 {id:'gzclp',n:'GZCLP',lv:'Intermedio',min:60,src:'Cody Lefever (GZCL)',
  d:'Tres niveles por día: T1 pesado (5×3), T2 de volumen (3×10) y T3 de bombeo (3×15). Muy bien pensado para seguir progresando.',
  how:'T1 y T2: si completás todo, la próxima +2,5 kg (+5 kg en piernas). T3: cuando hagas 25+ en la última serie, subí.',
  r:[{n:'GZCLP 1',days:[1],it:[PI_('squat',5,3),PI_('bench',3,10),PI_('latpull',3,15)]},
     {n:'GZCLP 2',days:[2],it:[PI_('ohp',5,3),PI_('deadlift',3,10),PI_('dbrow',3,15)]},
     {n:'GZCLP 3',days:[4],it:[PI_('bench',5,3),PI_('squat',3,10),PI_('latpull',3,15)]},
     {n:'GZCLP 4',days:[5],it:[PI_('deadlift',5,3),PI_('ohp',3,10),PI_('dbrow',3,15)]}]},
 {id:'ppl',n:'Push Pull Legs',lv:'Intermedio',min:65,src:'Split de empuje, tirón y piernas',
  d:'Empuje, tirón y piernas, dos veces por semana. Mucho volumen para ganar músculo si podés entrenar 6 días.',
  how:'Doble progresión en todo: cuando llegás a las reps en todas las series, subís el peso.',
  r:[{n:'Push',days:[1,4],it:[PI_('bench',4,6),PI_('ohp',3,8),PI_('dbpress',3,10),PI_('lateral',4,15),PI_('pushdown',3,12),PI_('skull',3,10)]},
     {n:'Pull',days:[2,5],it:[PI_('deadlift',3,5),PI_('pullup',4,8),PI_('row',3,8),PI_('facepull',3,15),PI_('curl',3,12),PI_('hammer',3,12)]},
     {n:'Legs',days:[3,6],it:[PI_('squat',4,6),PI_('rdl',3,8),PI_('legpress',3,10),PI_('legcurl',3,12),PI_('calf',4,15)]}]},
 {id:'531',n:'5/3/1 Boring But Big',lv:'Intermedio',min:60,src:'Jim Wendler',
  d:'Un básico por día con la ola 5/3/1 (semanas de 5, 3 y 1 repeticiones) y después 5×10 livianas del mismo ejercicio.',
  how:'Los pesos salen solos: porcentajes de tu máximo de entrenamiento. La última serie es AMRAP (todas las que puedas). Cada 4 semanas, una liviana.',
  r:[{n:'5/3/1 · Press militar',days:[1],it:[PI_('ohp',3,5,{w531:1}),PI_('ohp',5,10,{bbb:1}),PI_('latpull',5,10)]},
     {n:'5/3/1 · Peso muerto',days:[2],it:[PI_('deadlift',3,5,{w531:1}),PI_('deadlift',5,10,{bbb:1}),PI_('legraise',5,12)]},
     {n:'5/3/1 · Banca',days:[4],it:[PI_('bench',3,5,{w531:1}),PI_('bench',5,10,{bbb:1}),PI_('dbrow',5,10)]},
     {n:'5/3/1 · Sentadilla',days:[5],it:[PI_('squat',3,5,{w531:1}),PI_('squat',5,10,{bbb:1}),PI_('legcurl',5,10)]}]}
];
/* 5/3/1: semana 1 (5s), 2 (3s), 3 (5/3/1), 4 (liviana) */
const W531=[[[.65,5],[.75,5],[.85,5,1]],[[.70,3],[.80,3],[.90,3,1]],[[.75,5],[.85,3],[.95,1,1]],[[.40,5],[.50,5],[.60,5]]];
const week531=r=>r&&r.since?Math.max(0,Math.floor((parseK(today())-parseK(r.since))/864e5/7))%4:0;
function apply531(r,act){
  const w=week531(r);act.name=r.name+' · semana '+(w+1)+(w===3?' (liviana)':'');
  act.entries.forEach((en,k)=>{const it=r.items[k];if(!it||it.ex!==en.ex||!(it.w531||it.bbb))return;
    const b=bestE1(it.ex),tm=b?b.e*.9:0,R=v=>tm?Math.round(tm*v/2.5)*2.5:'';
    if(it.w531){en.sets=W531[w].map(([p,rp,amrap])=>({kg:R(p),reps:rp,done:false}));
      const last=W531[w][2];en.goal=tm?{kg:R(last[0]),reps:last[1],prev:Math.round(last[0]*100)+' %',why:(last[2]?'última serie: todas las que puedas':'semana liviana')}:null;}
    else{en.sets=Array.from({length:w===3?3:5},()=>({kg:R(.5),reps:10,done:false}));en.goal=null;}
    if(!tm)en.note='Todavía no tengo tu máximo: hacé una serie pesada de 3-5 y cargala como marca';
  });
}
function progsHTML(m){
  if(m.sel){const p=PROGRAMS.find(x=>x.id===m.sel);if(!p)return '';
    const hasGen=db.routines.some(r=>r.gen||r.prog);
    return '<button class="btn sm line" data-a="progSel" data-v="" style="margin-bottom:10px">'+ic('left',14)+' Todos los programas</button>'+
     '<h3 style="font:800 24px var(--f-d)">'+esc(p.n)+'</h3><p class="mut sm-t" style="margin:2px 0 10px">'+esc(p.lv)+' · '+p.r.reduce((s,x)=>s+x.days.length,0)+' días por semana · ~'+p.min+' min · '+esc(p.src)+'</p>'+
     '<p>'+esc(p.d)+'</p><div class="prog-how">'+ic('up',16)+'<span>'+esc(p.how)+'</span></div>'+
     p.r.map(x=>'<div class="prog-day"><div class="row"><b class="grow">'+esc(x.n)+'</b><span class="mut sm-t">'+x.days.map(k=>DIAS3[k]).join(' · ')+'</span></div>'+
       x.it.map(it=>{const e=exById(it.ex);return '<div class="prog-it"><span>'+esc(e?e.n:it.ex)+(it.bbb?' <small class="mut">(5×10 livianas)</small>':'')+'</span><span class="mut">'+(it.w531?'5/3/1':it.sets+' × '+(e&&e.time?it.reps+' s':it.reps))+'</span></div>';}).join('')+'</div>').join('')+
     (hasGen?'<label class="auto-post" style="margin-top:12px"><input type="checkbox" id="progRep" checked><span>Reemplazar mis rutinas a medida y de otros programas</span></label>':'')+
     '<button class="btn pri wide" data-a="progUse" data-v="'+p.id+'">'+ic('check',16)+' Usar este programa</button><p class="mut sm-t tc" style="margin-top:6px">Los días los podés mover después en cada rutina.</p>';}
  return '<p class="mut sm-t" style="margin-bottom:10px">Los programas más usados del mundo, con su progresión ya armada. Elegí uno y Swole te va diciendo qué peso poner.</p><div class="gap">'+
   PROGRAMS.map(p=>'<button class="prog" data-a="progSel" data-v="'+p.id+'"><span class="grow"><b>'+esc(p.n)+'</b><small>'+esc(p.d)+'</small><span class="prog-m"><span class="tag">'+esc(p.lv)+'</span><span>'+p.r.reduce((s,x)=>s+x.days.length,0)+' días</span><span>~'+p.min+' min</span></span></span>'+ic('right',18)+'</button>').join('')+'</div>';
}
/* total, DOTS y clase */
function dots(total,w,sex){
  const C=sex==='f'?[-0.0000010706,0.0005158568,-0.1126655495,13.6175032,-57.96288]:[-0.0000010930,0.0007391293,-0.1918759221,24.0900756,-307.75076];
  const x=Math.min(Math.max(w,40),sex==='f'?150:210),den=C[0]*x**4+C[1]*x**3+C[2]*x**2+C[3]*x+C[4];
  return den>0?total*500/den:0;
}
const PL_CLASS=[[0,'Principiante'],[200,'Intermedio'],[275,'Avanzado'],[350,'Élite'],[425,'Nivel internacional']];
function plStats(){
  const bw=weightNow()||(db.profile&&db.profile.weight)||75,L={};let total=0;
  ['squat','bench','deadlift'].forEach(id=>{const b=bestE1(id);L[id]=b?b.e:0;total+=L[id];});
  const all3=L.squat&&L.bench&&L.deadlift,d=all3?dots(total,bw,db.profile&&db.profile.sex):0;
  const cls=PL_CLASS.filter(c=>d>=c[0]).pop();
  return{bw,L,total,dots:d,cls:all3?cls[1]:null,all3};
}
const PL_HITOS=[['bench',1,'Banca con tu peso'],['squat',1.5,'Sentadilla 1,5× tu peso'],['deadlift',2,'Peso muerto 2× tu peso'],['total',300,'Club de los 300 kg'],
  ['bench',1.5,'Banca 1,5× tu peso'],['squat',2,'Sentadilla 2× tu peso'],['deadlift',2.5,'Peso muerto 2,5× tu peso'],['total',400,'Club de los 400 kg'],['total',500,'Club de los 500 kg']];
function plHTML(){
  const s=plStats(),plate=(id,big)=>'<span class="pl-plate'+(big?' big':'')+'" style="--pc:'+PL_LIFT[id].c+'"></span>';
  const h='<div class="pl-hero"><div class="pl-bar"><i></i>'+['squat','bench','deadlift'].map(id=>plate(id,1)).join('')+'</div>'+
   '<span class="lh-k">Tu total</span><b class="pl-total">'+(s.total?num(s.total,1)+' kg':'—')+'</b>'+
   (s.all3?'<div class="pl-dots"><b>'+Math.round(s.dots)+'</b> DOTS · <span>'+s.cls+'</span></div>':'<p class="mut sm-t">Cargá sentadilla, banca y peso muerto para ver tu total y tu puntaje DOTS.</p>')+'</div>'+
   '<div class="pl-lifts">'+['squat','bench','deadlift'].map(id=>{const e=s.L[id],r=e/s.bw,nxt=PL_HITOS.filter(x=>x[0]===id&&r<x[1])[0];
     return '<div class="pl-l" style="--pc:'+PL_LIFT[id].c+'">'+plate(id)+'<div class="grow"><b>'+PL_LIFT[id].n+'</b><span class="mut sm-t">'+(e?num(e,1)+' kg · '+num(r,2)+'× tu peso':'Sin marca todavía')+'</span>'+
      (nxt?'<span class="bar" style="margin-top:6px"><i style="width:'+Math.round(Math.min(1,r/nxt[1])*100)+'%;background:'+PL_LIFT[id].c+'"></i></span><small class="mut">Próximo: '+esc(nxt[2])+' ('+num(nxt[1]*s.bw,1)+' kg)</small>':'')+
      '</div><button class="btn sm" data-a="markOpen" data-v="'+id+'">'+ic('bolt',14)+'</button></div>';}).join('')+'</div>'+
   '<h4 style="margin:14px 0 8px">Hitos</h4><div class="pl-hitos">'+PL_HITOS.map(x=>{const v=x[0]==='total'?s.total:s.L[x[0]]/s.bw,ok=v>=x[1],pc=Math.min(1,v/x[1]);
     return '<div class="plh'+(ok?' ok':'')+'"><span class="plh-ic">'+ic(ok?'check':'flag',14)+'</span><span class="grow">'+esc(x[2])+'</span><small>'+(ok?'¡Listo!':Math.round(pc*100)+' %')+'</small></div>';}).join('')+'</div>'+
   '<details class="why"><summary>¿Qué es DOTS?</summary><div class="mut sm-t"><p>Es el puntaje que usan las competencias para comparar levantadores de distinto peso corporal: tu total ajustado por tu peso.</p><p>Como referencia: 200 intermedio, 275 avanzado, 350 élite, 425 o más es nivel internacional.</p><p>Tus máximos son estimados a partir de tus series (fórmula de Epley), no de un máximo real.</p></div></details>'+
   '<button class="btn pri wide" style="margin-top:12px" data-a="plPlanGo">'+ic('spark',16)+' Armar mi plan de powerlifting</button>';
  return h;
}
/* caminos: lo que podés dominar */
function caminosCard(){
  const t=(k,img,n,sub,a,soon)=>'<button class="cam'+(soon?' soon':'')+'" data-a="'+a+'" style="--img:url(\''+img+'\')"><span class="cam-t"><b>'+n+'</b><small>'+sub+'</small></span>'+(soon?'<span class="tag">Pronto</span>':ic('right',18))+'</button>';
  const s=plStats(),sk=skillsMastered().length;
  return '<div class="card"><div class="hd"><div><h3>Caminos</h3><span class="mut sm-t">Elegí qué querés dominar: cada camino tiene su progreso y su plan</span></div></div><div class="cams">'+
   t('cali','img/cali.jpg','Calistenia',sk+' de 39 habilidades','treeOpen')+
   t('pl','img/fuerza.jpg','Powerlifting',s.total?'Total '+num(s.total,0)+' kg'+(s.all3?' · '+Math.round(s.dots)+' DOTS':''):'Sentadilla, banca y peso muerto','plOpen')+
   t('art','img/salud.jpg','Articulaciones de acero','Índice '+jScore()+' de 100'+(db.settings.jointBlock?' · bloque activo':''),'jOpen')+
   t('atl','img/dep.jpg','Atleta',(athIndex()==null?'Salto, velocidad y potencia':'Índice '+athIndex()+' · '+athLvl(athIndex()))+(db.settings.athBlock?' · bloque activo':''),'aOpen')+'</div></div>';
}

/* ============ Articulaciones de acero ============
   Lo que respalda la evidencia (resumen):
   - Tendón: isométricos (sostener 30-45 s) calman el dolor a corto plazo; la carga lenta y pesada y los excéntricos lo fortalecen a largo plazo.
   - Cartílago: cargarlo de forma progresiva no lo daña; lo que importa es subir de a poco.
   - Isquios: el curl nórdico baja las lesiones a la mitad o menos. Ingle: el Copenhague bajó 41 % los problemas en futbolistas.
   - Tobillo: el equilibrio a una pierna baja ~35 % los esguinces (sobre todo si ya tuviste uno).
   - Hombro: fortalecer la rotación externa. Espalda baja: resistencia del tronco (evidencia más débil: mantenimiento). */
const JZ=[
  {k:'rod',n:'Rodillas',i:'muscle',m:['cuadriceps'],tests:[['spansq',60,'s'],['pistol',5,'reps']],ex:[['spansq',4,45],['tibraise',2,15],['bulgarian',3,8]],tip:'Isométricos para el tendón y fuerza lenta para la rodilla.'},
  {k:'tob',n:'Tobillos',i:'run',m:['gemelos'],tests:[['kneewall',10,'cm'],['slcalf',25,'reps'],['slbal',30,'s']],ex:[['slbal',3,30],['slcalf',3,15],['kneewall',2,10]],tip:'Equilibrio y gemelo fuerte: menos esguinces.'},
  {k:'isq',n:'Isquios',i:'bolt',m:['isquios'],tests:[['nordic',6,'reps'],['slbridge',60,'s']],ex:[['nordic',2,5],['slbridge',3,30]],tip:'El nórdico es lo que más protege de desgarros.'},
  {k:'ing',n:'Ingle',i:'acro',m:['aductores'],tests:[['copenhagen',30,'s']],ex:[['copenhagen',3,20]],tip:'El Copenhague previene la pubalgia.'},
  {k:'esp',n:'Espalda baja',i:'body',m:['lumbar','abs','oblicuos'],tests:[['sidepl',90,'s'],['biering',120,'s']],ex:[['sidepl',3,30],['birddog',2,8],['curlup',2,8]],tip:'Un tronco resistente sostiene la espalda.'},
  {k:'hom',n:'Hombros',i:'up',m:['hombros','trapecio'],tests:[['deadhang',60,'s']],ex:[['extrot',3,15],['facepull',3,15],['deadhang',2,30]],tip:'Rotadores fuertes cuidan el hombro en tackles y caídas.'}
];
const jUnit=u=>u==='s'?' s':u==='cm'?' cm':' reps';
function jZoneScore(z){const v=z.tests.map(([id,t])=>Math.min(1,bestRep(id)/t));return v.reduce((a,b)=>a+b,0)/v.length;}
function jScore(){const s=JZ.map(jZoneScore);return Math.round(s.reduce((a,b)=>a+b,0)/s.length*100);}
const jCol=s=>s<.4?'#F0626A':s<.75?'#FFC34D':'#4CC38A';
/* zonas para el bloque: las que elegiste, o las 2 más flojas */
function jZones(){const pick=db.settings.jz;if(pick&&pick.length)return JZ.filter(z=>pick.includes(z.k));return JZ.slice().sort((a,b)=>jZoneScore(a)-jZoneScore(b)).slice(0,2);}
/* bloque corto (unos 10 minutos) para el principio de tus rutinas */
function jBlock(){
  const its=[];jZones().forEach(z=>z.ex.slice(0,2).forEach(([id,s,r])=>{if(exById(id)&&!its.some(x=>x.ex===id))its.push({ex:id,sets:Math.min(2,s),reps:r,prehab:1});}));
  return its.slice(0,4);
}
function jApplyBlock(on){
  db.routines.forEach(r=>{r.items=r.items.filter(it=>!it.prehab);if(on&&!r.skill)r.items=jBlock().concat(r.items);});
  db.settings.jointBlock=!!on;save();
}
function jointsHTML(){
  const sc=jScore(),fills={};JZ.forEach(z=>{const s=jZoneScore(z);z.m.forEach(k=>fills[k]=jCol(s));});
  const C=2*Math.PI*42,on=!!db.settings.jointBlock,zs=jZones().map(z=>z.n.toLowerCase());
  let h='<div class="jt-hero"><div class="jt-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="jt-trk"/><circle cx="50" cy="50" r="42" class="jt-prog" style="stroke-dasharray:'+(C*sc/100).toFixed(1)+' '+C.toFixed(1)+'"/></svg><b>'+sc+'</b><small>de 100</small></div>'+
   '<div class="jt-body">'+bodyMap(null,{fills})+'</div></div>'+
   '<p class="mut sm-t tc" style="margin:8px 0 12px">Tu índice de articulaciones. Hacé las pruebas de cada zona y cargá tu resultado: el mapa se pinta de rojo a verde.</p>';
  h+='<div class="card jt-block'+(on?' on':'')+'" style="margin:0 0 12px"><div class="row" style="gap:10px"><span class="mi-ic">'+ic('heart',16)+'</span><div class="grow"><b>Bloque de articulaciones en tus rutinas</b><br><span class="mut sm-t">'+(on?'Activo: ':'Se suma al principio, como calentamiento (~10 min): ')+esc(zs.join(' y '))+'</span></div></div>'+
   '<div class="g2" style="margin-top:10px">'+(on?'<button class="btn" data-a="jBlock" data-v="0">Quitar</button><button class="btn pri" data-a="jBlock" data-v="1">Actualizar</button>':'<button class="btn" data-a="jNow">'+ic('play',16)+' Sesión 15 min</button><button class="btn pri" data-a="jBlock" data-v="1">Sumar a rutinas</button>')+'</div></div>';
  h+=JZ.map(z=>{const s=jZoneScore(z),pick=(db.settings.jz||[]).includes(z.k);
    return '<div class="jz" style="--zc:'+jCol(s)+'"><div class="jz-h"><span class="mi-ic">'+ic(z.i,16)+'</span><div class="grow"><b>'+z.n+'</b><span class="bar"><i style="width:'+Math.round(s*100)+'%;background:var(--zc)"></i></span></div><b class="jz-p">'+Math.round(s*100)+'</b>'+
     '<button class="chip sm'+(pick?' on':'')+'" data-a="jPick" data-v="'+z.k+'" aria-pressed="'+pick+'">'+(pick?'En mi bloque':'Priorizar')+'</button></div>'+
     '<p class="mut sm-t" style="margin:6px 0 8px">'+esc(z.tip)+'</p>'+
     z.tests.map(([id,t,u])=>{const e=exById(id),b=bestRep(id),ok=b>=t;return '<div class="jtest'+(ok?' ok':'')+'"><button class="grow jt-n" data-a="exInfo" data-v="'+id+'"><b>'+esc(shortN(e?e.n:id))+'</b><small class="mut">Meta: '+t+jUnit(u)+' · Tu mejor: '+(b?b+jUnit(u):'—')+'</small></button>'+
       '<input type="text" inputmode="decimal" placeholder="'+(u==='s'?'seg':u)+'" data-jt="'+id+'" aria-label="Resultado de '+esc(e?e.n:id)+'"><button class="btn sm" data-a="jSave" data-v="'+id+'">Guardar</button></div>';}).join('')+
     '<div class="chips" style="margin-top:8px">'+z.ex.map(([id,se,r])=>{const e=exById(id);return e?'<button class="chip" data-a="exInfo" data-v="'+id+'">'+esc(shortN(e.n))+' '+se+'×'+r+(e.time?'s':'')+'</button>':'';}).join('')+'</div></div>';}).join('');
  h+='<details class="why"><summary>¿Por qué funciona?</summary><div class="mut sm-t">'+
   '<p><b>Tendones:</b> sostener 30 a 45 segundos (isométricos) calma el dolor; la carga lenta y pesada y bajar lento (excéntricos) los fortalece a largo plazo.</p>'+
   '<p><b>Cartílago:</b> cargarlo no lo gasta: se adapta si la carga sube de a poco. Lo que lastima son los saltos bruscos.</p>'+
   '<p><b>Lo más probado:</b> el curl nórdico baja a la mitad o menos los desgarros de isquios; el Copenhague bajó 41 % los problemas de ingle en futbolistas; el equilibrio a una pierna baja ~35 % los esguinces de tobillo.</p>'+
   '<p><b>Hombro y espalda:</b> rotadores fuertes y un tronco resistente ayudan, aunque la evidencia es más débil: son de mantenimiento.</p>'+
   '<p>Esto es prevención, no tratamiento: si tenés dolor fuerte o una lesión, consultá a un profesional.</p></div></details>';
  return h;
}

/* ============ Atleta: salto, potencia y velocidad ============
   Evidencia: la pliometría mejora el salto vertical y el sprint (efectos chicos a moderados), más en programas de 7+ semanas;
   calidad antes que cantidad, descansos largos y nada de saltos pesados el día antes de un partido.
   Las escalas son referencias aproximadas para adultos (las mujeres y los menores de 16 se ajustan). */
const ATH_T=[
  {k:'cmj',n:'Salto vertical',u:'cm',i:'up',g:'Salto',S:[[25,0],[35,30],[45,60],[55,80],[65,95],[70,100]],how:'Marcá en la pared lo más alto que llegás parado y después saltando: la diferencia.'},
  {k:'box',n:'Salto al cajón',u:'cm',i:'up',g:'Salto',S:[[30,0],[50,40],[70,75],[90,100]],how:'La altura del cajón más alto al que subís saltando con los dos pies.'},
  {k:'broad',n:'Salto en largo',u:'cm',i:'right',g:'Potencia',S:[[160,0],[200,30],[230,60],[260,85],[290,100]],how:'Desde una línea, con los dos pies, hasta el talón de atrás.'},
  {k:'sprint',n:'Sprint 20 m',u:'s',i:'run',g:'Velocidad',low:1,S:[[4,0],[3.5,30],[3.2,60],[3,80],[2.85,95],[2.75,100]],how:'Con salida parada, tomá el tiempo con alguien o con el cronómetro del celu.'}
];
function athAdj(t,v){const p=db.profile||{},f=p.sex==='f',y=(p.age||25)<16;
  if(t.low)return v-(f?.3:0)-(y?.2:0);return v/((f?.82:1)*(y?.9:1));}
function athScore(t,v){
  if(!(v>0))return null;const x=athAdj(t,v),S=t.S;
  if(t.low){if(x>=S[0][0])return 0;for(let i=1;i<S.length;i++)if(x>=S[i][0]){const a=S[i-1],b=S[i];return a[1]+(b[1]-a[1])*(a[0]-x)/(a[0]-b[0]);}return 100;}
  if(x<=S[0][0])return 0;for(let i=1;i<S.length;i++)if(x<=S[i][0]){const a=S[i-1],b=S[i];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}return 100;
}
const athList=k=>((db.settings.ath||{})[k]||[]);
function athBest(t){const l=athList(t.k).map(x=>x[1]);return l.length?(t.low?Math.min(...l):Math.max(...l)):0;}
function athIndex(){const s=ATH_T.map(t=>athScore(t,athBest(t))).filter(x=>x!=null);return s.length?Math.round(s.reduce((a,b)=>a+b,0)/s.length):null;}
const athLvl=s=>s==null?'Sin medir':s<30?'En desarrollo':s<55?'Bueno':s<75?'Muy bueno':s<90?'Excelente':'Élite';
/* bloque de potencia según tu deporte (~10 min, después del calentamiento y antes de los básicos) */
function aBlock(){
  const sp=(db.profile&&db.profile.sports)||[],its=[{ex:'cmj',sets:3,reps:3,power:1}];
  const add=(ex,s,r)=>{if(exById(ex)&&!its.some(i=>i.ex===ex)&&its.length<3)its.push({ex,sets:s,reps:r,power:1});};
  if(sp.some(x=>['rugby','futbol','hockey'].includes(x)))add('sprint',1,5);
  if(sp.some(x=>['basquet','voley'].includes(x)))add('boxjump',3,3);
  if(sp.includes('tenis'))add('skater',3,6);
  if(sp.includes('combate'))add('medslam',3,5);
  if(sp.some(x=>['running','ciclismo'].includes(x)))add('pogo',2,15);
  add('broadjump',3,3);add('pogo',2,15);
  return its;
}
/* no va en rutinas que caen todas el día antes de un partido */
const preMatch=r=>(r.days||[]).length&&r.days.every(d=>dayInfo((d+1)%7).type==='match');
function aApplyBlock(on){
  db.routines.forEach(r=>{r.items=r.items.filter(it=>!it.power);if(on&&!r.skill&&!preMatch(r)){const k=r.items.filter(it=>it.prehab).length;r.items.splice(k,0,...aBlock());}});
  db.settings.athBlock=!!on;save();
}
function athHTML(){
  const idx=athIndex(),C=2*Math.PI*42,on=!!db.settings.athBlock;
  const grp={};ATH_T.forEach(t=>{const s=athScore(t,athBest(t));if(s!=null)(grp[t.g]=grp[t.g]||[]).push(s);});
  const bars=['Salto','Potencia','Velocidad'].map(g=>{const v=grp[g]?Math.round(grp[g].reduce((a,b)=>a+b,0)/grp[g].length):null;return '<div class="ab"><span>'+g+'</span><span class="bar"><i style="width:'+(v||0)+'%"></i></span><b>'+(v==null?'—':v)+'</b></div>';}).join('');
  let h='<div class="ath-hero"><div class="jt-ring"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="jt-trk"/><circle cx="50" cy="50" r="42" class="jt-prog ath" style="stroke-dasharray:'+(C*(idx||0)/100).toFixed(1)+' '+C.toFixed(1)+'"/></svg><b>'+(idx==null?'—':idx)+'</b><small>'+athLvl(idx)+'</small></div><div class="ath-bars">'+bars+'</div></div>';
  h+='<div class="card jt-block'+(on?' on':'')+'" style="margin:12px 0"><div class="row" style="gap:10px"><span class="mi-ic">'+ic('bolt',16)+'</span><div class="grow"><b>Bloque de potencia en tus rutinas</b><br><span class="mut sm-t">'+(on?'Activo: ':'~10 min antes de los básicos, según tu deporte: ')+esc(aBlock().map(i=>shortN(exById(i.ex).n)).join(', '))+'</span></div></div>'+
   '<div class="g2" style="margin-top:10px">'+(on?'<button class="btn" data-a="aBlock" data-v="0">Quitar</button><button class="btn pri" data-a="aBlock" data-v="1">Actualizar</button>':'<button class="btn" data-a="aNow">'+ic('play',16)+' Sesión</button><button class="btn pri" data-a="aBlock" data-v="1">Sumar a rutinas</button>')+'</div></div>';
  h+=ATH_T.map(t=>{const b=athBest(t),s=athScore(t,b);
    return '<div class="jz" style="--zc:'+(s==null?'var(--line)':jCol(s/100))+'"><div class="jz-h"><span class="mi-ic">'+ic(t.i,16)+'</span><div class="grow"><b>'+t.n+'</b><span class="mut sm-t">'+(b?'Tu mejor: '+num(b,t.u==='s'?2:0)+' '+t.u+' · '+athLvl(s):'Sin medir')+'</span></div>'+(s!=null?'<b class="jz-p">'+Math.round(s)+'</b>':'')+'</div>'+
     '<p class="mut sm-t" style="margin:6px 0 8px">'+esc(t.how)+'</p>'+
     '<div class="jtest"><span class="grow mut sm-t">Cargá tu resultado</span><input type="text" inputmode="decimal" placeholder="'+t.u+'" data-at="'+t.k+'" aria-label="'+esc(t.n)+'"><button class="btn sm" data-a="aSave" data-v="'+t.k+'">Guardar</button></div></div>';}).join('');
  h+='<details class="why"><summary>¿Cómo se entrena la potencia?</summary><div class="mut sm-t">'+
   '<p><b>Pliometría:</b> saltos y rebotes mejoran el salto vertical y el sprint. El efecto es real pero gradual: se nota más después de 7 semanas o más.</p>'+
   '<p><b>Calidad, no cantidad:</b> pocas repeticiones al máximo, con descanso completo (2-3 minutos). Si se vuelven lentas, cortá.</p>'+
   '<p><b>Cuándo:</b> al principio de la sesión, fresco. Nada de saltos fuertes el día antes de un partido (por eso el bloque no se suma ahí).</p>'+
   '<p><b>Fuerza primero:</b> una buena sentadilla y peso muerto hacen que los saltos rindan más.</p>'+
   '<p>Las escalas son aproximadas para adultos y se ajustan para mujeres y menores de 16.</p></div></details>';
  return h;
}

/* ============ Entrenar mejor ============ */
/* Meta de hoy (sobrecarga progresiva): mira la última vez y propone un poquito más. */
function goalFor(id){
  const ex=exById(id),ls=(lastSets(id)||[]).filter(s=>!s.w&&+s.reps>0);
  if(!ex||!ls.length)return null;
  if(ex.time){const best=Math.max(...ls.map(s=>+s.reps));return{kg:0,reps:best+5,prev:best+' s',why:'+5 segundos'};}
  const top=ls.reduce((a,s)=>e1(ex,s.kg,s.reps)>e1(ex,a.kg,a.reps)?s:a,ls[0]);
  const prev=(+top.kg?num(+top.kg,1)+' kg × ':'')+top.reps;
  /* plan para destrabar un estancamiento */
  const fx=typeof fixOf==='function'&&fixOf(id),r25=v=>Math.round(v/2.5)*2.5;
  if(fx&&fx.k==='deload')return{kg:+top.kg?r25(+top.kg*.9):0,reps:+top.reps,prev,why:'semana liviana: 90 % para recargar'};
  if(fx&&fx.k==='reps'){const hi=+top.reps>=8;return{kg:+top.kg?r25(+top.kg*(hi?1.1:.85)):0,reps:hi?5:10,prev,why:hi?'más pesado a 5 repeticiones (3 semanas)':'más liviano a 10 repeticiones (3 semanas)'};}
  if(ex.sk||ex.bw&&!+top.kg)return{kg:+top.kg||0,reps:+top.reps+1,prev,why:'+1 repetición'};
  const allHit=ls.every(s=>+s.reps>=+top.reps);
  if(!allHit)return{kg:+top.kg,reps:+top.reps,prev,why:'completá todas las series con este peso'};
  const kg=+top.kg,low=LOWER.includes(ex.p[0]);
  let inc=ex.ph?(kg>=12?2:1):low?(kg>=60?5:2.5):(kg>=20?2.5:1);
  /* si la última vez te sobraban 3 o más, el salto es doble; si llegaste al fallo, se mantiene el peso */
  const rr=ls.filter(s=>s.rir!=null).map(s=>+s.rir);
  if(rr.length&&Math.min(...rr)>=3)return{kg:Math.round((kg+inc*2)*4)/4,reps:+top.reps,prev,why:'+'+num(inc*2,2)+' kg (te sobraba)'};
  if(rr.length&&Math.max(...rr)===0)return{kg,reps:+top.reps+1,prev,why:'+1 repetición (llegaste al fallo)'};
  return{kg:Math.round((kg+inc)*4)/4,reps:+top.reps,prev,why:'+'+num(inc,2)+' kg'};
}
const goalTxt=(ex,g)=>ex.time?g.reps+' s':(g.kg?num(g.kg,2)+' kg × ':'')+g.reps+(ex.time?'':' reps');
const hitGoal=(g,s)=>g&&+s.reps>=g.reps&&(+s.kg||0)>=g.kg-1e-9;
/* descanso propio: los básicos piden más */
const BIG=['squat','bench','deadlift','ohp','row','frontsquat','incbench','rdl','hipthrust','legpress','pullup','dips','muscleup'];
const restFor=ex=>ex&&(BIG.includes(ex.id)||ex.st&&isBarbell(ex))?Math.max(db.settings.rest,150):db.settings.rest;
/* "más fuerte que el X %": estimación a partir del nivel (tablas de referencia de gente que entrena) */
function pctStronger(ex,e){
  if(ex&&ex.sk&&REPS[ex.id]&&!ex.time&&db.profile)return Math.min(99,Math.max(1,Math.round(pGen(repPct(ex,e)))));
  if(!ex||!ex.st||!db.profile)return null;
  const v=levelVal(ex,e);
  return Math.min(99,Math.max(1,Math.round(pGen(pctOf(ex,e)))));
}
const pctTxt=p=>p==null?'':'<p class="pct">Más fuerte que el <b>'+p+' %</b> de la gente que entrena <span class="mut">(estimado)</span></p>';

/* ============ Resumen semanal ============ */
const monday=dk=>{const d=parseK(dk);return addDays(dk,-((d.getDay()+6)%7));};
function recapData(){
  const from=addDays(monday(today()),-7),to=addDays(from,6);
  const logs=db.logs.filter(l=>l.date>=from&&l.date<=to),m={},bw=weightNow()||70;
  let sets=0,vol=0,min=0;const prs=[];
  logs.forEach(l=>{min+=+l.dur||0;(l.prs||[]).forEach(id=>{const ex=exById(id);if(ex&&!prs.includes(ex))prs.push(ex);});
    l.entries.forEach(en=>{const ex=exById(en.ex);if(!ex)return;en.sets.forEach(s=>{if(s.w)return;sets++;if(!ex.time)vol+=((ex.bw||0)*bw+(+s.kg||0))*(+s.reps||0);ex.p.forEach(k=>m[k]=(m[k]||0)+1);ex.s.forEach(k=>m[k]=(m[k]||0)+.5);});});});
  const top=Object.keys(m).sort((a,b)=>m[b]-m[a])[0];
  const ach=ACH.filter(a=>db.ach[a.id]&&db.ach[a.id]>=from&&db.ach[a.id]<=to);
  return{from,to,key:from,n:logs.length,sets,vol,min,prs,m,top,ach};
}
const RECAP_N=5;
function recapHTML(m){
  const d=recapData(),i=m.i||0,ov=overall();
  const I={};Object.keys(d.m).forEach(k=>I[k]=Math.min(1,d.m[k]/10));
  const range=parseK(d.from).getDate()+' al '+parseK(d.to).getDate()+' de '+MESES[parseK(d.to).getMonth()];
  const slides=[
    ()=>'<p class="rc-k">Tu semana · '+range+'</p><div class="rc-big" data-n="'+d.n+'">'+d.n+'</div><p class="rc-l">'+(d.n===1?'entreno':'entrenos')+'</p><p class="rc-s">'+d.min+' minutos entrenando</p>',
    ()=>'<p class="rc-k">Movida total</p><div class="rc-big" data-fmt="1" data-n="'+Math.round(d.vol)+'">'+nf(d.vol)+'</div><p class="rc-l">kilos movidos</p><p class="rc-s">en '+d.sets+' series efectivas</p>',
    ()=>'<p class="rc-k">Récords</p>'+(d.prs.length?'<div class="rc-big" data-n="'+d.prs.length+'">'+d.prs.length+'</div><p class="rc-l">'+(d.prs.length===1?'récord personal':'récords personales')+'</p><div class="rc-list">'+d.prs.slice(0,4).map((ex,k)=>'<span style="animation-delay:'+(400+k*120)+'ms">'+ic('trophy',16)+' '+esc(ex.n)+'</span>').join('')+'</div>':'<div class="rc-big">0</div><p class="rc-l">récords esta vez</p><p class="rc-s">La semana que viene es tuya.</p>'),
    ()=>'<p class="rc-k">Lo que más laburaste</p><div class="rc-map">'+bodyMap(I,{cls:'live'})+'</div><p class="rc-l" style="font-size:30px">'+(d.top?MUSC[d.top]:'—')+'</p>',
    ()=>'<p class="rc-k">Tu rango general</p><div class="rc-badge">'+badge(ov?ov.L:-1,140)+'</div><p class="rc-l" style="color:'+lvlColor(ov?ov.L:-1)+'">'+lvlName(ov?ov.L:-1)+'</p>'+(d.ach.length?'<p class="rc-s">+'+d.ach.length+(d.ach.length===1?' logro desbloqueado':' logros desbloqueados')+'</p>':'<p class="rc-s">¡Vamos por más esta semana!</p>')+'<button class="btn pri" data-a="recapClose" style="margin-top:18px">Arrancar la semana</button>'
  ];
  const hues=['#5B43F0','#E8337A','#CC8A12','#1F9E95',lvlColor(ov?ov.L:-1)];
  return '<div class="mback recap" style="--rc:'+hues[i]+'"><div class="rc-bars">'+slides.map((_,k)=>'<i class="'+(k<i?'done':k===i?'on':'')+'"></i>').join('')+'</div>'+
   '<button class="ib flat rc-x" data-a="recapClose" aria-label="Cerrar">'+ic('x')+'</button>'+
   '<button class="rc-prev" data-a="recapPrev" aria-label="Anterior"></button><button class="rc-next" data-a="recapNext" aria-label="Siguiente"></button>'+
   '<div class="rc-slide" key="'+i+'">'+slides[i]()+'</div></div>';
}
function recapTimer(){clearTimeout(S.recapT);if(S.modal&&S.modal.t==='recap'&&(S.modal.i||0)<RECAP_N-1)S.recapT=setTimeout(()=>{if(S.modal&&S.modal.t==='recap'){S.modal.i++;renderModal();recapTimer();countUp($('#modal'));}},5000);}
function openRecap(){S.modal={t:'recap',i:0};db.settings.recapSeen=recapData().key;save();render();recapTimer();countUp($('#modal'));}

