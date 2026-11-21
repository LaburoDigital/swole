'use strict';
/* ============ Acciones ============ */
function setWeight(kg,date){
  date=date||today();
  db.weights=db.weights.filter(w=>w.date!==date);
  db.weights.push({date,kg});
  syncProfileWeight();
}
/* el peso del perfil es siempre el último registrado */
function syncProfileWeight(){if(!db.profile||!db.weights.length)return;const last=db.weights.slice().sort((a,b)=>a.date<b.date?-1:1).pop();db.profile.weight=last.kg;}
/* el formulario de perfil vive en la ventana de bienvenida o en la pestaña Perfil */
function pfDirty(){if(!S.pf)return false;const b=Object.assign({sex:'m',age:'',height:'',weight:'',activity:2,goal:'recomp',nick:'',sport:''},db.profile||{});return Object.keys(S.pf).some(k=>String(S.pf[k]==null?'':S.pf[k])!==String(b[k]==null?'':b[k]));}
function pfD(){return S.modal&&S.modal.t==='profile'?S.modal.d:(S.pf||(S.pf=Object.assign({},db.profile||{})));}
function openProfile(){
  S.modal={t:'profile',d:Object.assign({sex:'m',age:'',height:'',weight:'',activity:2,goal:'recomp'},db.profile||{})};
  render();
}
/* foto de lo que tenía la ventana al abrirse (o al entrar a ese paso), para saber si cambiaste algo */
const snapOf=m=>{try{return JSON.stringify(m.d,(k,v)=>k==='q'||k==='step'||k==='res'||v===''?undefined:typeof v==='number'?String(v):v);}catch(e){return '';}};
function isDirty(which){const m=which==='m2'?S.m2:S.modal;if(!m||!m.d)return false;
  if(m.t==='gen')return !!m.d.plan; /* el asistente: importa cuando ya hay un plan armado */
  if(!(['routine','logedit','excreate'].includes(m.t)||(m.t==='mark'&&m.d.step==='form')||(m.t==='food'&&['new','quick'].includes(m.d.step))))return false;
  return m._s!=null&&snapOf(m)!==m._s;}
/* devuelve true si en vez de cerrar hay que quedarse (preguntando, o volviendo de la pregunta a lo que estabas editando) */
function askDiscard(which){const m=which==='m2'?S.m2:S.modal;
  if(which==='m2'&&m&&m.t==='confirm'&&m.prev){S.m2=m.prev;return true;}
  if(!isDirty(which))return false;
  S.m2={t:'confirm',title:'¿Descartar los cambios?',msg:'Lo que cargaste en esta ventana todavía no se guardó.',act:'discardGo',arg:which,ok:'Descartar',no:'Seguir editando',prev:which==='m2'?m:null};return true;}
function closeLayer(which){
  if(askDiscard(which)){render();return;}
  if(which==='modal'&&S.modal&&S.modal.t==='tools'&&S.iv)ACTIONS.ivStop();
  if(which==='m2')S.m2=null;
  else{if(!db.profile&&S.modal&&S.modal.t==='profile')return;S.modal=null;}
  render();
}
function newRoutineFrom(name,items){
  db.routines.push({id:uid(),name:name,days:[],since:today(),items:items.map(i=>({ex:i[0],sets:i[1],reps:i[2]}))});
  save();
}
function remindCheck(){
  const r=db.settings.remind;if(!r.on)return;
  const n=new Date(),hm=pad(n.getHours())+':'+pad(n.getMinutes()),t=today();
  if(hm>=r.time&&!db.creatine[t]&&db.settings.lastRemind!==t){
    db.settings.lastRemind=t;save();
    toast('Creatina: todavía no la marcaste hoy');
    notify('Swole','Es hora de tu creatina.');
    if(S.tab==='entrenar'&&S.etab==='hoy'&&!S.modal&&!S.m2&&!S.picker&&!S.sessOpen)render();
  }
}
/* En Android las notificaciones solo funcionan a través del service worker */
function notify(title,body){
  try{
    if(!('Notification' in window)||Notification.permission!=='granted')return;
    if(navigator.serviceWorker&&navigator.serviceWorker.controller){
      navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,icon:'icons/icon-192.png',badge:'icons/icon-192.png',tag:'swole-crea'})).catch(()=>{});
    }else new Notification(title,{body,icon:'icons/icon-192.png'});
  }catch(e){}
}
/* entrenos en CSV: una fila por serie, se abre directo en Excel o Google Sheets */
function exportCSV(){
  const q=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"',rows=[['Fecha','Entrenamiento','Ejercicio','Serie','Peso (kg)','Repeticiones o segundos','Calentamiento','Minutos','Nota']];
  allSess().slice().sort((a,b)=>a.date<b.date?-1:1).forEach(l=>l.entries.forEach(en=>{const ex=exById(en.ex);en.sets.forEach((s,i)=>rows.push([l.date,l.test?'Marca':(l.name||''),ex?ex.n:en.ex,i+1,String(s.kg||0).replace('.',','),s.reps,s.w?'sí':'',l.dur||'',en.note||'']));}));
  if(rows.length<2)return toast('Todavía no hay entrenos para exportar');
  const blob=new Blob(['\ufeff'+rows.map(r=>r.map(q).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='swole-entrenos-'+today()+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
  toast('Listo: '+(rows.length-1)+' series exportadas');
}
/* Copia completa de lo que viaja a la nube (entrenos, marcas, rutinas, comidas, peso, medidas, perfil, ajustes…).
   No lleva lo que es solo de este celu (entreno en curso, avisos, fotos y videos de progreso) ni la sesión. */
function exportJSON(){const o=JSON.parse(JSON.stringify(syncPayload(db)));delete o.clock;delete o.del;o.app='swole';o.exported=new Date().toISOString();return o;}
/* Restaurar una copia SUMA: agrega lo que falta (aunque se haya borrado después) y no borra ni pisa nada de lo que hay.
   Devuelve cuántas cosas agregó. Tira error si no es una copia de Swole. */
function importData(o){
  if(!o||typeof o!=='object'||!Array.isArray(o.logs))throw new Error('formato');
  const x=normalize(JSON.parse(JSON.stringify(o))),def=defaults().settings,same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);let n=0;
  for(const c in SYNC_COLL){const k=SYNC_COLL[c],have=new Set(db[c].map(i=>String(i&&i[k])));
    x[c].forEach(i=>{if(i&&i[k]!=null&&!have.has(String(i[k]))){db[c].push(i);have.add(String(i[k]));n++;}});}
  SYNC_MAP.forEach(c=>{for(const k in x[c])if(!(k in db[c])){db[c][k]=x[c][k];n++;}});
  if(x.profile&&typeof x.profile==='object'){if(!db.profile){db.profile=x.profile;n++;}else for(const f in x.profile)if(db.profile[f]==null||db.profile[f]===''){db.profile[f]=x.profile[f];n++;}}
  for(const k in x.plan)if(!(k in db.plan)){db.plan[k]=x.plan[k];n++;}
  for(const f in x.settings)if(!LOCAL_SET.includes(f)&&(db.settings[f]===undefined||same(db.settings[f],def[f]))&&!same(db.settings[f],x.settings[f])){db.settings[f]=x.settings[f];n++;}
  save();return n;
}
async function exportData(){
  const json=JSON.stringify(exportJSON(),null,1),name='swole-'+today()+'.json';
  /* En celular (sobre todo iPhone instalado) la descarga directa no anda: uso el menú de compartir */
  try{
    if(matchMedia('(pointer:coarse)').matches&&navigator.canShare&&window.File){
      const f=new File([json],name,{type:'application/json'});
      if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});db.settings.lastBackup=today();save();toast('Copia guardada');return;}
    }
  }catch(e){if(e&&e.name==='AbortError')return;}
  try{
    if(window.claude&&claude.use){
      const dl=await claude.use('downloads');
      if(dl){await dl.save({filename:name,data:json});toast('Archivo listo: '+name);return;}
    }
  }catch(e){if(e&&e.code==='declined')return;}
  try{
    const b=new Blob([json],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
    db.settings.lastBackup=today();save();
    toast('Descargando '+name);
  }catch(e){
    try{await navigator.clipboard.writeText(json);toast('Datos copiados al portapapeles');}
    catch(e2){S.m2={t:'import',text:json};render();toast('Copiá este texto para guardar tus datos');}
  }
}

const ACTIONS={
  tab(v){navTo(v);},
  cmdOpen(){S.modal={t:'cmd',q:'',i:0};render();setTimeout(()=>{const i=$('#cmdQ');if(i)i.focus();},60);},
  cmdGo(v){cmdRun(+v);},
  etab(v){S.etab=v;window.scrollTo(0,0);render();},
  theme(){db.settings.theme=effTheme()==='dark'?'light':'dark';save();applyTheme();},
  profile(){goTab('perfil');render();},
  pfSex(v){pfD().sex=v;render();},
  pfGoal(v){pfD().goal=v;render();},
  pfSave(){
    const d=pfD(),age=+d.age,h=+d.height,w=+d.weight;
    if(!(age>=10&&age<=90))return toast('Poné una edad entre 10 y 90');
    if(!(h>=120&&h<=230))return toast('Poné una altura entre 120 y 230 cm');
    if(!(w>=30&&w<=250))return toast('Poné un peso entre 30 y 250 kg');
    const prev=db.profile;
    db.profile=Object.assign({},prev||{},{sex:d.sex,age:Math.round(age),height:Math.round(h),weight:w,activity:d.activity==='auto'?'auto':+d.activity,goal:d.goal,nick:String(d.nick||'').trim().slice(0,20)});
    if(!prev||prev.weight!==w)setWeight(w);
    if(S.modal&&S.modal.t==='profile')S.modal=null;S.pf=null;save();render();toast('Perfil guardado');
  },
  goal(v){db.profile.goal=v;save();render();},
  addW(){
    const w=parseFloat(($('#wIn')||{}).value),d=(($('#wDate')||{}).value)||today();
    if(!(w>=30&&w<=250))return toast('Poné un peso entre 30 y 250 kg');
    if(d>today())return toast('No podés cargar un peso a futuro');
    setWeight(w,d);save();render();toast('Peso guardado: '+num(w,1)+' kg');
  },
  editW(v){const w=db.weights.find(x=>x.date===v);if(!w)return;const i=$('#wIn'),d=$('#wDate');if(i){i.value=w.kg;i.focus();}if(d)d.value=v;toast('Corregí el número y tocá Guardar');},
  delW(v){S.m2={t:'confirm',title:'Borrar peso',msg:'Se borra el peso del '+longDate(v)+'. El gráfico y tus calorías se recalculan.',act:'delWGo',arg:v,ok:'Borrar'};render();},
  delWGo(v){db.weights=db.weights.filter(w=>w.date!==v);syncProfileWeight();S.m2=null;save();render();toast('Peso borrado');},
  wAll(){S.wAll=!S.wAll;render();},
  creaToggle(v){if(db.creatine[v])delete db.creatine[v];else db.creatine[v]=1;save();render();checkAch();},
  water(v){const t=today();db.water[t]=clamp((db.water[t]||0)+(+v),0,40);save();render();if(+v>0&&db.water[t]===waterGoal()){toast('¡Agua del día completa!');}checkAch();},
  remind(){
    const r=db.settings.remind;
    if(r.on){r.on=false;save();render();toast('Recordatorio de las '+r.time+' desactivado');return;}
    r.on=true;db.settings.lastRemind='';save();render();
    try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission();}catch(e){}
    toast('Recordatorio activado: todos los días a las '+r.time);
  },
  remindTime(){
    const t=($('#rTime')||{}).value;
    if(!t)return toast('Elegí una hora');
    const r=db.settings.remind;r.time=t;db.settings.lastRemind='';save();render();
    toast(r.on?'Recordatorio guardado: todos los días a las '+t:'Hora guardada: '+t+'. Activá el recordatorio para recibirlo');
  },
  calMove(v){S.calM=new Date(S.calM.getFullYear(),S.calM.getMonth()+(+v),1);render();},
  crMove(v){S.crM=new Date(S.crM.getFullYear(),S.crM.getMonth()+(+v),1);render();},
  calSel(v){S.calSel=v;render();},
  plan(v){
    const id=($('#addRt')||{}).value;if(!id)return;
    const l=db.plan[v]||[];if(!l.includes(id))l.push(id);
    db.plan[v]=l;save();render();toast('Rutina agregada al '+longDate(v));
  },
  unplan(v){const k=S.calSel,l=(db.plan[k]||[]).filter(x=>x!==v);if(l.length)db.plan[k]=l;else delete db.plan[k];save();render();},
  markOpen(v){S.m2={t:'mark',d:{step:v?'form':'pick',direct:!!v,q:'',g:'',ex:v||null,kg:'',reps:'',date:today()}};render();},
  markG(v){const d=S.m2.d;d.g=v==='Todos'?'':v;renderModal();},
  markPick(v){const d=S.m2.d,ls=(lastSets(v)||[]).filter(s=>!s.w),b=bestE1(v);d.ex=v;d.step='form';const s=b||ls[0]||{};d.kg=s.kg||'';d.reps=s.reps||'';renderModal();},
  markBack(){S.m2.d.step='pick';renderModal();},
  markAgain(){const d=S.m2.d;d.step='pick';d.res=null;d.ex=null;d.kg='';d.reps='';renderModal();const sh=document.querySelector('#modal2 .msheet');if(sh)sh.scrollTop=0;},
  markGo(){
    const d=S.m2.d,ex=exById(d.ex);if(!ex)return;
    const noKg=ex.time&&!ex.bw,reps=Math.min(ex.time?900:200,Math.round(+d.reps||0)),kg=noKg?0:Math.min(300,Math.max(0,+d.kg||0));
    if(!(reps>0))return toast(ex.time?'Poné los segundos':'Poné las repeticiones');
    if(!db.profile)return toast('Completá tu perfil primero');
    /* sin peso en un ejercicio con carga no hay nivel que calcular: antes se guardaba igual y la pantalla quedaba trabada */
    if(!(e1(ex,kg,reps)>0))return toast(ex.ph?'Poné el peso de una mancuerna':'Poné el peso');
    const b0=bestE1(ex.id),e0=b0?b0.e:0,L0=b0?levelIdx(ex,e0):null,i0=b0?lvlInfo(ex,e0):null;
    const date=d.date&&d.date<=today()?d.date:today();
    /* la misma marca el mismo día se guarda una sola vez */
    if(!db.tests.some(t=>t.ex===ex.id&&t.date===date&&(+t.kg||0)===kg&&+t.reps===reps)){db.tests.push({id:uid(),date,ex:ex.id,kg,reps});save();}
    d.kg=kg||'';d.reps=String(reps);
    const e=e1(ex,kg,reps),b=bestE1(ex.id)||{e},L=levelIdx(ex,b.e),i=lvlInfo(ex,b.e);
    d.res={L,L0,p0:i0?clamp(i0.pct,0,1):0,pct:clamp(i.pct,0,1),rec:e0>0&&e>e0+.01,eq:e0>0&&Math.abs(e-e0)<=.01,e0};
    if(L>(L0==null?-1:L0)&&L>=0)addEv({k:'up',x:ex.id,L});else if(d.res.rec)addEv({k:'pr',x:ex.id});save();
    d.step='reveal';renderModal();
    setTimeout(()=>{const bi=document.querySelector('.rv-bar i');if(bi)bi.style.width=bi.dataset.to+'%';},900);
    if(L>(L0==null?-1:L0)&&L>=0)setTimeout(()=>{confetti(L0!=null&&L0>=0?70:40);buzz([30,60,30,60,120]);},950);
    checkGoals();checkAch();checkRankUp(2800);checkMissions();
  },
  /* borra un registro del historial: una marca entera, o las series de ese ejercicio en ese entreno (con Deshacer) */
  delRec(v){const[lid,ex]=v.split('|');const ti=db.tests.findIndex(t=>t.id===lid);
    if(ti>=0){const t=db.tests.splice(ti,1)[0];save();render();buzz(8);toast('Marca borrada',()=>{db.tests.splice(Math.min(ti,db.tests.length),0,t);save();render();});checkRankUp();return;}
    const li=db.logs.findIndex(l=>l.id===lid);if(li<0)return;const l=db.logs[li],ei=l.entries.findIndex(en=>en.ex===ex);if(ei<0)return;
    const en=l.entries.splice(ei,1)[0],gone=!l.entries.length;if(gone)db.logs.splice(li,1);save();render();buzz(8);
    toast(gone?'Entreno borrado (era lo único)':'Series borradas de ese día',()=>{if(gone)db.logs.splice(Math.min(li,db.logs.length),0,l);l.entries.splice(Math.min(ei,l.entries.length),0,en);save();render();});},
  saveAsR(v){const l=db.logs.find(x=>x.id===v);if(!l)return;
    const items=l.entries.map(en=>{const ss=en.sets.filter(s=>!s.w);return ss.length?{ex:en.ex,sets:ss.length,reps:Math.max(...ss.map(s=>+s.reps||0))||10}:null;}).filter(Boolean);
    if(!items.length)return toast('Ese entreno no tiene series para copiar');
    const nm=l.name&&!/^Entreno libre/i.test(l.name)?l.name:'Mi rutina '+shortDate(parseK(l.date).getTime());
    const r={id:uid(),name:nm,days:[],since:today(),items,rest:db.settings.rest||90};db.routines.push(r);l.routineId=r.id;save();
    if(S.modal&&S.modal.t==='summary')S.modal.saved=r.id;render();buzz(10);toast('Guardada como rutina: '+nm);},
  stallFix(v,el){const id=el.dataset.e,s=db.settings;s.fix=Object.assign({},s.fix||{});if(v==='off'){delete s.fix[id];save();render();toast('Plan quitado');return;}
    s.fix[id]={k:v,from:today(),until:addDays(today(),v==='deload'?7:21)};save();render();buzz(10);
    toast(v==='deload'?'Esta semana vas al 90 %: la meta del entreno ya lo tiene en cuenta':v==='reps'?'3 semanas con otras repeticiones: la meta del entreno te guía':'Probá una de las variantes parecidas en tu próximo entreno');},
  ntab(v){S.ntab=v;render();window.scrollTo({top:0});},
  exMet(v){S.exM=v;renderModal();},
  rankTog(v){const s=db.settings,l=(s.noRank||[]).slice(),i=l.indexOf(v);if(i>=0)l.splice(i,1);else l.push(v);s.noRank=l;save();render();toast(i>=0?'Vuelve a contar para tu nivel':'Ya no cuenta para tu nivel');},
  delTest(v){S.m2={t:'confirm',title:'Borrar marca',msg:'Se borra esta marca. Tu nivel en este ejercicio se recalcula.',act:'delTestGo',arg:v,ok:'Borrar'};render();},
  delTestGo(v){db.tests=db.tests.filter(t=>t.id!==v);S.m2=null;save();render();toast('Marca borrada');checkRankUp();},
  cardOpen(){S.cardBack=false;S.modal={t:'carta'};render();},
  cardFlip(){if(S.flipBlock)return;S.cardBack=!S.cardBack;const c=document.querySelector('.cflip');if(c)c.classList.toggle('flipped',S.cardBack);buzz(10);},
  cardShare(){shareCard();},
  cardGyro(){try{DeviceOrientationEvent.requestPermission().then(r=>toast(r==='granted'?'Mové el celu para inclinarla':'Sin permiso de movimiento'));}catch(e){}},
  quickOpen(){S.modal={t:'quick'};render();},
  /* comidas */
  foodOpen(v){S.m2={t:'food',d:{m:MEAL_N[v]?v:mealNow(),q:'',step:'list',date:S.tab==='nutri'&&S.fd?S.fd:today()}};render();setTimeout(()=>{const i=document.getElementById('foodQ');if(i&&matchMedia('(pointer:fine)').matches)i.focus();},300);},
  foodPick(v){const d=S.m2.d,f=foodById(v);if(!f)return;d.sel=v;d.step='amt';d.unit=f.u.length?0:-1;d.qty=f.u.length?1:100;renderModal();},
  foodStep(v){if(v!=='bar')barStop();const d=S.m2.d;d.step=v;delete d.edit;renderModal();},
  foodUnit(v){const d=S.m2.d,g=foodGrams(d);d.unit=+v;d.qty=+v<0?Math.round(g)||100:1;renderModal();},
  foodQty(v){const d=S.m2.d,q=+String(d.qty).replace(',','.')||0,st=d.unit<0?(q>=100?25:10):(q<1||(q===1&&+v<0)?.5:1);d.qty=Math.max(0,Math.round((q+st*(+v))*100)/100);renderModal();},
  foodMeal(v){S.m2.d.m=v;renderModal();},
  foodSave(){const d=S.m2.d,f=foodById(d.sel);if(!f)return;const g=foodGrams(d);if(!(g>0))return toast('Poné cuánto comiste');
    const q=+String(d.qty).replace(',','.'),un=d.unit>=0&&f.u[d.unit]?f.u[d.unit].n.toLowerCase():'';
    const e=Object.assign({id:d.edit||uid(),date:d.date,m:d.m,n:f.n,g:Math.round(g),fid:f.id,u:un?num(q,q%1?1:0)+' '+(q===1?un:plural(un)):''},foodCalc(f,g));
    if(!e.u)delete e.u;
    if(d.edit){const i=db.meals.findIndex(x=>x.id===d.edit);if(i>=0)db.meals[i]=e;}else db.meals.push(e);
    save();S.m2=null;render();toast((d.edit?'Guardado: ':'Anotado: ')+e.k+' kcal en '+MEAL_N[e.m].toLowerCase());},
  foodEdit(v){const e=db.meals.find(x=>x.id===v);if(!e)return;
    if(e.fid&&foodById(e.fid))S.m2={t:'food',d:{step:'amt',edit:v,sel:e.fid,unit:-1,qty:e.g,m:e.m,date:e.date}};
    else S.m2={t:'food',d:{step:'quick',edit:v,m:e.m,date:e.date,qk:{n:e.n,k:e.k,p:e.p||''}}};render();},
  foodDel(){const d=S.m2.d,i=db.meals.findIndex(x=>x.id===d.edit);if(i<0)return;const m=db.meals.splice(i,1)[0];save();S.m2=null;render();
    toast('Comida borrada',()=>{db.meals.splice(Math.min(i,db.meals.length),0,m);save();render();});},
  foodNew(){const d=S.m2.d;d.nf={n:String(d.q||'').trim(),per:'100'};d.step='new';renderModal();},
  foodPer(v){S.m2.d.nf.per=v;renderModal();},
  foodNewSave(){const d=S.m2.d,n=d.nf,num_=x=>Math.max(0,+String(x||'').replace(',','.')||0);
    if(!String(n.n||'').trim())return toast('Ponele un nombre');
    const k=num_(n.k);if(!k&&!num_(n.p)&&!num_(n.c))return toast('Poné al menos las calorías');
    let mul=1,u=[];if(n.per==='por'){const pg=num_(n.pg);if(!pg)return toast('Poné cuánto pesa la porción');mul=100/pg;u=[{n:'Porción',g:Math.round(pg)}];}
    const f={id:'u'+uid(),n:String(n.n).trim().slice(0,40),k:r1(k*mul),p:r1(num_(n.p)*mul),c:r1(num_(n.c)*mul),f:r1(num_(n.f)*mul),u};
    db.foods.push(f);save();d.sel=f.id;d.step='amt';d.unit=u.length?0:-1;d.qty=u.length?1:100;renderModal();toast('Alimento guardado');},
  foodQuick(){const d=S.m2.d;d.qk={n:String(d.q||'').trim()};d.step='quick';renderModal();},
  foodQuickSave(){const d=S.m2.d,k=Math.round(+String(d.qk.k||'').replace(',','.')||0),p=r1(+String(d.qk.p||'').replace(',','.')||0);
    if(!(k>0))return toast('Poné las calorías');
    const o=d.edit&&db.meals.find(x=>x.id===d.edit),sc=o&&o.k>0?k/o.k:1,e=Object.assign({},o||{},{id:d.edit||uid(),date:d.date,m:d.m,n:String(d.qk.n||'').trim().slice(0,40)||MEAL_N[d.m],g:o?r1((+o.g||0)*sc):0,k,p,c:o?r1((+o.c||0)*sc):0,f:o?r1((+o.f||0)*sc):0});
    if(d.edit){const i=db.meals.findIndex(x=>x.id===d.edit);if(i>=0)db.meals[i]=e;}else db.meals.push(e);
    save();S.m2=null;render();toast('Anotado: '+k+' kcal');},
  phOpt(v){const[i,j]=v.split('|').map(Number),it=S.m2.d.ph.items[i];it.sel=j;it.other=null;renderModal();},
  phOther(v){const it=S.m2.d.ph.items[+v];it.other=it.other?null:{q:'',f:null};renderModal();if(it.other)setTimeout(()=>{const x=document.querySelector('#modal2 [data-i=pho][data-e="'+v+'"]');if(x)x.focus();},50);},
  phPick(v){const[i,id]=v.split('|'),it=S.m2.d.ph.items[+i],f=foodById(id);if(!f)return;it.other={q:f.n,f:{n:f.n,id:f.id,k:f.k,p:f.p,c:f.c,f:f.f}};renderModal();},
  phSize(v){const[i,s]=v.split('|'),it=S.m2.d.ph.items[+i];it.g=s==='lo'?it.lo:s==='hi'?it.hi:it.g0;renderModal();},
  phStep(v){const[i,s]=v.split('|').map(Number),it=S.m2.d.ph.items[i],st=it.g>=200?20:10;it.g=Math.max(0,Math.round((it.g+s*st)/st)*st);renderModal();},
  phOn(v){const it=S.m2.d.ph.items[+v];it.on=!it.on;renderModal();},
  phSave(){const d=S.m2.d,its=d.ph.items.filter(x=>x.on&&x.g>0);if(!its.length)return toast('No quedó nada para agregar');
    its.forEach(it=>{const o=phCur(it),v=foodCalc(o,it.g);const e=Object.assign({id:uid(),date:d.date,m:d.m,n:o.n,g:it.g,ai:1},v);if(o.id)e.fid=o.id;db.meals.push(e);if(d.ph.local&&o.id)FoodMem.learn(it.e,o.id,it.g);});
    save();const k=its.reduce((s,x)=>s+phItemKcal(x),0);S.m2=null;render();toast('Anotado: '+nf(k)+' kcal en '+MEAL_N[d.m].toLowerCase());},
  foodDay(v){const t=today(),n=addDays(S.fd||t,+v);S.fd=n>t?t:n;render();},
  foodRepeat(){const dk=S.fd||today(),prev=mealsOn(addDays(dk,-1));prev.forEach(e=>db.meals.push(Object.assign({},e,{id:uid(),date:dk})));save();render();toast('Copié '+prev.length+(prev.length===1?' comida':' comidas'));},
  quickTrain(){const t=today(),pl=plannedFor(t).filter(r=>!doneOn(t).some(l=>l.routineId===r.id));if(pl.length===1)startSession(pl[0].id);else{S.modal={t:'quick'};render();}},
  /* bienvenida */
  onbNext(){
    const m=S.modal,d=m.d,q=m.step-ONB_SLIDES.length;
    if(q===0&&!String(d.nick||'').trim())return toast('Poné un apodo (podés cambiarlo después)');
    if(q===1&&!(+d.age>=10&&+d.age<=90))return toast('Poné una edad entre 10 y 90');
    if(q===2&&!(+d.height>=120&&+d.height<=230))return toast('Poné una altura entre 120 y 230 cm');
    if(q===2&&!(+d.weight>=30&&+d.weight<=250))return toast('Poné un peso entre 30 y 250 kg');
    if(q===3&&!(d.goals||[]).length)return toast('Elegí al menos un objetivo');
    if(q===4&&weekPend().length)return toast(weekPendMsg());
    if(q===3&&!db.profile){const g=d.goals,goal=g.includes('grasa')?(g.some(x=>x==='hip'||x==='fuerza')?'recomp':'cut'):(g.includes('hip')||g.includes('fuerza'))?'bulk':'recomp';
      db.profile={sex:d.sex,age:Math.round(+d.age),height:Math.round(+d.height),weight:+d.weight,goal,nick:String(d.nick).trim().slice(0,20),sports:[],week:{},activity:'auto'};setWeight(+d.weight);db.settings.welcomed=1;db.settings.gen={goals:g.slice(),eq:'gym',lvl:'beg'};save();}
    else if(q===3&&db.profile){db.settings.gen=Object.assign({},db.settings.gen||{eq:'gym',lvl:'beg'},{goals:d.goals.slice()});save();}
    m.step++;renderModal();const i=document.querySelector('#modal .onb-in');if(i)setTimeout(()=>i.focus(),350);
  },
  onbBack(){const m=S.modal;if(m.step>0&&!(db.profile&&m.step>=ONB_SLIDES.length+6)){m.step--;renderModal();}},
  onbAcct(){ACTIONS.loginOpen('up');},
  onbGoal(v){const g=S.modal.d.goals=S.modal.d.goals||[],i=g.indexOf(v);if(i>=0)g.splice(i,1);else g.push(v);renderModal();},
  onbSet(v,el){S.modal.d[el.dataset.f]=v;renderModal();},
  onbDone(){S.modal=null;goTab('inicio');render();checkAch();},
  onbStart(){const id=S.modal&&S.modal.rid;S.modal=null;goTab('inicio');render();if(id)startSession(id);},
  onbPlan(){S.modal=null;goTab('rutinas');S.rtab='rut';render();},
  onbFirst(){S.modal=null;goTab('niveles');render();ACTIONS.markOpen();},
  goalAdd(v,el){
    const act=(db.goals||[]).filter(g=>!g.done);if(act.length>=3)return toast('Ya tenés 3 objetivos: quitá uno para sumar otro');
    const ex=exById(v),L=+el.dataset.l;if(!ex)return;
    db.goals=(db.goals||[]).filter(g=>!(g.ex===v&&!g.done));
    db.goals.push({id:uid(),ex:v,L,v0:curV(ex),since:today()});save();render();toast('Objetivo: '+ex.n+' → '+lvlName(L));
  },
  goalDel(v){db.goals=(db.goals||[]).filter(g=>g.id!==v);save();render();},
  sportTog(v){const p=db.profile;if(!p)return;p.sports=p.sports||[];const i=p.sports.indexOf(v);if(i>=0){p.sports.splice(i,1);Object.keys(p.week||{}).forEach(d=>{if((p.week[d].act||'').endsWith(':'+v))p.week[d].act='';});}else p.sports.push(v);save();render();},
  weekAct(v){const[d,a]=v.split('|'),p=db.profile;p.week=p.week||{};const w=p.week[d]=p.week[d]||{};w.act=a;if(a&&w.gym==='solo')w.gym='ask';if(!a&&w.gym&&w.gym!=='solo')w.gym='solo';save();render();},
  weekTrains(v){const p=db.profile;if(!p)return;p.trains=+v;save();render();},
  weekDay(v){const p=db.profile;if(!p)return;p.week=p.week||{};const w=p.week[v]=p.week[v]||{};w.gym=w.gym?'':(w.act?'ask':'solo');save();render();},
  weekGym(v){const[d,g]=v.split('|'),p=db.profile;p.week=p.week||{};const w=p.week[d]=p.week[d]||{};w.gym=g;save();render();},
  onbSport(v){const d=S.modal.d;d.sports=d.sports||[];if(!v)d.sports=[];else{const i=d.sports.indexOf(v);if(i>=0)d.sports.splice(i,1);else d.sports.push(v);}renderModal();},
  delLog(v){const i=db.logs.findIndex(l=>l.id===v);if(i<0)return;const l=db.logs.splice(i,1)[0];if(S.modal&&S.modal.t==='logedit')S.modal=null;save();render();buzz(10);
    toast('Entrenamiento borrado',()=>{db.logs.splice(Math.min(i,db.logs.length),0,l);save();render();});},
  delLogGo(v){db.logs=db.logs.filter(l=>l.id!==v);S.m2=null;if(S.modal&&S.modal.t==='logedit')S.modal=null;save();render();},
  editLog(v){const l=db.logs.find(x=>x.id===v);if(!l)return;S.modal={t:'logedit',d:JSON.parse(JSON.stringify(l))};render();},
  leAddSet(v,el){const en=S.modal.d.entries[+el.dataset.e],l=en.sets[en.sets.length-1]||{kg:0,reps:10};en.sets.push({kg:l.kg,reps:l.reps});renderModal();},
  leDelSet(v,el){const en=S.modal.d.entries[+el.dataset.e];en.sets.splice(+el.dataset.s,1);if(!en.sets.length)S.modal.d.entries.splice(+el.dataset.e,1);renderModal();},
  leDelEntry(v,el){S.modal.d.entries.splice(+el.dataset.e,1);renderModal();},
  leSave(){
    const d=S.modal.d;
    const entries=d.entries.map(en=>({ex:en.ex,sets:en.sets.map(s=>{const r={kg:Math.max(0,+s.kg||0),reps:Math.max(0,Math.round(+s.reps||0))};if(s.w)r.w=1;return r;}).filter(s=>s.reps>0),note:en.note})).filter(en=>en.sets.length);
    if(!entries.length){S.m2={t:'confirm',title:'Entrenamiento vacío',msg:'No quedó ninguna serie. ¿Querés borrar este entrenamiento?',act:'delLogGo',arg:d.id,ok:'Borrar'};render();return;}
    const l=db.logs.find(x=>x.id===d.id);if(!l){S.modal=null;render();return;}
    l.name=(d.name||'').trim()||l.name;l.dur=clamp(Math.round(+d.dur||l.dur),1,600);l.entries=entries;
    l.prs=(l.prs||[]).filter(id=>entries.some(en=>en.ex===id));
    S.modal=null;save();render();toast('Entrenamiento actualizado');checkAch();checkRankUp();
  },
  startR(v,el){startSession(v,el.dataset.d);},
  startFree(v,el){startSession(null,el.dataset.d);},
  sessOpen(){S.sessOpen=true;render();},
  sessMin(){S.sessOpen=false;render();},
  sessFinish(){const a=db.active;if(!a)return;const p=a.entries.reduce((n,en)=>n+en.sets.filter(s=>!s.done&&!s.w).length,0),dn=a.entries.some(en=>en.sets.some(s=>s.done));
    if(p&&dn){S.m2={t:'confirm',title:'Terminar entrenamiento',msg:(p===1?'Queda 1 serie sin tildar: no se guarda.':'Quedan '+p+' series sin tildar: no se guardan.')+' ¿Terminamos igual?',act:'sessFinishGo',ok:'Terminar'};render();}
    else finishSession();},
  sessFinishGo(){S.m2=null;renderModal();finishSession();},
  discardGo(v){S.m2=null;if(v==='modal'){if(S.modal&&S.modal.t==='tools'&&S.iv){S.modal=null;ACTIONS.ivStop();}S.modal=null;}render();},
  reload(){location.reload();},
  sessCancel(){S.m2={t:'confirm',title:'Cancelar entrenamiento',msg:'Se descartan las series de este entrenamiento.',act:'sessCancelGo',ok:'Descartar'};render();},
  sessCancelGo(){db.active=null;save();S.sessOpen=false;S.m2=null;endRest(false);render();},
  setDone(v,el){
    const s=db.active.entries[+el.dataset.e].sets[+el.dataset.s];
    const ei=+el.dataset.e,en=db.active.entries[ei],ex=exById(en.ex),nx=db.active.entries[ei+1];
    s.done=!s.done;
    if(s.done){
      S.justDone=el.dataset.e+':'+el.dataset.s;buzz(18);
      /* la primera vez: el peso de esta serie pasa a las que siguen */
      const j=+el.dataset.s;en.sets.forEach((x,k)=>{if(k>j&&!x.done&&!x.w&&(x.kg===''||x.kg==null)&&s.kg!=='')x.kg=s.kg;});
      if(!s.w&&!ex.time)S.rirAsk=ei+':'+j;
      if(db.settings.big&&en.sets.every(x=>x.done))S.bigE=null;
      if(!s.w&&!en.hit&&hitGoal(en.goal,s)){en.hit=1;setTimeout(()=>{toast('¡Meta cumplida en '+(ex?ex.n:'')+'!');confetti(24);},150);}
      if(en.ss&&nx){endRest(false);const nxe=exById(nx.ex);toast('Superserie: ahora '+(nxe?nxe.n:'el siguiente'));}
      else startRest(restFor(ex));
    }
    save();
    render();S.justDone=null;
  },
  stepKg(v,el){buzz(5);const en=db.active.entries[+el.dataset.e],j=+el.dataset.s,s=en.sets[j],old=s.kg;s.kg=Math.max(0,Math.round(((+s.kg||0)+(+v))*4)/4);
    en.sets.forEach((x,k)=>{if(k>j&&!x.done&&!x.w&&String(x.kg)===String(old))x.kg=s.kg;});save();renderSess();},
  stepRep(v,el){buzz(5);const s=db.active.entries[+el.dataset.e].sets[+el.dataset.s];s.reps=Math.max(0,(+s.reps||0)+(+v));save();renderSess();},
  rirSet(v,el){const s=db.active.entries[+el.dataset.e].sets[+el.dataset.s];s.rir=+v;S.rirAsk=null;save();renderSess();},
  measSave(){
    const o={date:today()};let n=0;
    document.querySelectorAll('[data-mk]').forEach(i=>{const v=parseFloat(String(i.value).replace(',','.'));if(v>=10&&v<=250){o[i.dataset.mk]=Math.round(v*10)/10;n++;}});
    if(!n){toast('Poné al menos una medida en centímetros');return;}
    db.meas=db.meas||[];const old=db.meas.find(m=>m.date===o.date);
    if(old)Object.assign(old,o);else db.meas.push(o);
    save();render();toast('Medidas guardadas');
  },
  photoView(v){S.m2={t:'phview',id:v};render();},
  photoDel(v){PhotoDB.del(v).then(()=>{S.m2=null;if(S.modal&&S.modal.t==='phcmp')S.modal=null;render();loadPhotos();toast('Foto borrada');});},
  photoCompare(){const ps=photoCache||[];if(ps.length<2)return;S.modal={t:'phcmp',a:ps[0].id,b:ps[ps.length-1].id,x:50};render();},
  socOpen(v){if(v==='auto')v=frCount()>0?'feed':'list';S.modal={t:'friends',tab:v==='season'?'comp':v||'rank',met:'ovr'};render();if(Social.on())Social.load().then(()=>renderModal()).catch(e=>toast(Social.errTxt(e)));},
  socTab(v){S.modal.tab=v==='season'?'comp':v;renderModal();},
  socYes(v){Social.answer(v,true).then(()=>{renderModal();toast('¡Listo! Ya son amigos');confetti(30);}).catch(e=>toast(Social.errTxt(e)));},
  socNo(v){Social.answer(v,false).then(()=>{renderModal();toast('Solicitud rechazada');}).catch(e=>toast(Social.errTxt(e)));},
  socCancel(v){Social.cancel(v).then(()=>{renderModal();toast('Solicitud cancelada');}).catch(e=>toast(Social.errTxt(e)));},
  compNew(){S.m2={t:'comp',name:'',metric:'w',days:7,mem:[]};render();},
  compSet(v){const[k,x]=v.split('|');const n=$('#cmpName');if(n)S.m2.name=n.value;S.m2[k]=k==='days'?+x:x;renderModal();},
  compMem(v){const n=$('#cmpName');if(n)S.m2.name=n.value;const a=S.m2.mem,i=a.indexOf(v);if(i<0)a.push(v);else a.splice(i,1);renderModal();},
  compSave(){const m=S.m2,n=$('#cmpName'),name=(n?n.value:m.name).trim()||(COMP_MET[m.metric][0]+' en '+(m.days===7?'1 semana':m.days===14?'2 semanas':'1 mes'));
    if(!m.mem.length)return toast('Elegí al menos un amigo');
    toast('Creando…');Social.compCreate(name,m.metric,m.days,m.mem).then(()=>{S.m2=null;if(S.modal&&S.modal.t==='friends')S.modal.tab='comp';render();toast('Torneo creado: ya les llegó la invitación');}).catch(e=>toast(Social.errTxt(e)));},
  compYes(v){Social.compJoin(v,true).then(()=>{renderModal();toast('¡Adentro! Que gane el mejor');}).catch(e=>toast(Social.errTxt(e)));},
  compNo(v){Social.compJoin(v,false).then(()=>{renderModal();toast('Listo');}).catch(e=>toast(Social.errTxt(e)));},
  compLeave(v){S.m2={t:'confirm',title:'Salir del torneo',msg:'Dejás de aparecer en la tabla de este torneo.',act:'compNo',arg:v,ok:'Salir'};render();},
  compDel(v){S.m2={t:'confirm',title:'Borrar torneo',msg:'Se borra para todos los que están adentro.',act:'compDelGo',arg:v,ok:'Borrar'};render();},
  compDelGo(v,el){const id=el&&el.dataset.v||v;S.m2=null;Social.compDel(id).then(()=>{render();toast('Torneo borrado');}).catch(e=>toast(Social.errTxt(e)));},
  socMet(v){S.modal.met=v;renderModal();},
  socOn(){toast('Activando…');Social.enable().then(ok=>{if(ok){render();toast('Listo: invitá a tus amigos con tu código');}}).catch(e=>toast(Social.errTxt(e)));},
  socOff(){S.m2={t:'confirm',title:'Dejar de compartir',msg:'Tus amigos dejan de ver tus rangos y novedades. Podés volver a activarlo cuando quieras (con un código nuevo).',act:'socOffGo',ok:'Dejar de compartir'};render();},
  socOffGo(){S.m2=null;Social.disable().then(()=>{render();toast('Ya no compartís nada');}).catch(e=>toast(Social.errTxt(e)));},
  socAdd(){const i=$('#socCode');const c=i?i.value:'';if(!c.trim())return toast('Escribí el código de tu amigo');
    Social.add(c).then(r=>{if(i)i.value='';renderModal();toast(addMsg(r));if(r==='friends')confetti(30);}).catch(e=>toast(/code_len/.test(e.message)?'El código tiene 6 letras y números':Social.errTxt(e)));},
  socUser(v,el){S.m2={t:'socuser',id:v,nick:el&&el.dataset.x||'',ctx:(el&&el.dataset.e)||''};render();},
  socDelU(){ACTIONS.socDel(S.m2.id);},
  blockAsk(){const m=S.m2;S.m2={t:'confirm',title:'Bloquear a '+(m.nick||'esta persona'),msg:'Dejan de ser amigos, se borran las solicitudes y los torneos que comparten, y no te puede volver a agregar. No recibe ningún aviso.',act:'blockGo',arg:m.id,ok:'Bloquear'};render();},
  blockGo(v,el){const id=el&&el.dataset.v||v;S.m2=null;Social.block(id).then(()=>{render();toast('Bloqueado');}).catch(e=>toast(Social.errTxt(e)));},
  reportOpen(){const m=S.m2,[kind,ref]=(m.ctx||'').split('|');S.m2={t:'report',d:{target:m.id,nick:m.nick,kind:kind==='post'||kind==='comment'?kind:'user',ref:ref||null,reason:'',note:'',blk:true}};render();},
  contactOpen(){S.m2={t:'report',d:{kind:'other',reason:'otro',note:''}};render();},
  repReason(v){S.m2.d.reason=v;renderModal();},
  repBlk(v,el){S.m2.d.blk=!!(el&&el.checked);},
  reportGo(){const d=S.m2&&S.m2.d;if(!d||d.busy)return;
    if(!d.reason)return toast('Elegí qué pasa');
    if(d.kind==='other'&&!String(d.note||'').trim())return toast('Escribí tu mensaje');
    d.busy=true;renderModal();
    Social.report(d).then(()=>d.blk&&d.target?Social.block(d.target):null).then(()=>{S.m2=null;render();
      toast(d.kind==='other'?'Mensaje enviado. Te respondemos al mail de tu cuenta.':'Denuncia enviada. Gracias por avisar'+(d.blk?': también lo bloqueaste':''));})
     .catch(e=>{d.busy=false;renderModal();toast(Social.errTxt(e));});},
  blockedOpen(){S.m2={t:'blocked',list:null};render();Social.blocked().then(l=>{if(S.m2&&S.m2.t==='blocked'){S.m2.list=l;renderModal();}}).catch(e=>toast(Social.errTxt(e)));},
  unblock(v){Social.unblock(v).then(()=>{if(S.m2&&S.m2.list)S.m2.list=S.m2.list.filter(r=>r.user_id!==v);renderModal();toast('Desbloqueado');}).catch(e=>toast(Social.errTxt(e)));},
  socNewCode(){S.m2={t:'confirm',title:'Cambiar mi código',msg:'Tu código y tu link de invitación actuales dejan de andar. Tus amigos siguen siendo tus amigos.',act:'socNewCodeGo',ok:'Cambiar'};render();},
  socNewCodeGo(){S.m2=null;Social.newCode().then(c=>{render();toast('Tu código nuevo: '+c);}).catch(e=>toast(Social.errTxt(e)));},
  termsTog(v,el){if(S.m2&&S.m2.d)S.m2.d.ok=!!(el&&el.checked);},
  socDel(v){const r=S.social&&S.social.friends.find(x=>x.user_id===v);S.m2={t:'confirm',title:'Sacar amigo',msg:'Dejan de verse los dos. '+(r?r.nick:'')+' no recibe ningún aviso.',act:'socDelGo',arg:v,ok:'Sacar'};render();},
  socDelGo(v,el){const id=el&&el.dataset.v||v;S.m2=null;Social.remove(id).then(()=>{render();toast('Listo');}).catch(e=>toast(Social.errTxt(e)));},
  socCard(v){S.m2={t:'fcard',id:v};render();},
  async socShare(){const url=Social.link(),txt='Sumate a Swole y comparemos quién progresa más. Mi código: '+db.settings.social.code;
    try{if(navigator.share){await navigator.share({title:'Swole',text:txt,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(txt+' '+url);toast('Link copiado');}catch(e){toast('Tu código: '+db.settings.social.code);}},
  pushTog(){const on=db.settings.push&&db.settings.push.on;toast(on?'Desactivando…':'Activando…');(on?Push.disable():Push.enable()).then(()=>{render();toast(on?'Recordatorios desactivados':'Listo: te aviso los días que te toca entrenar');}).catch(e=>{render();toast(Push.errTxt(e));});},
  pushKind(v){const st=db.settings.push=db.settings.push||{};if(v==='train')st.train=st.train===false;else st.crea=!st.crea;save();render();Push.update().catch(e=>toast(Push.errTxt(e)));},
  pushAt(){const i=$('#pushAt');if(!i||!/^\d{2}:\d{2}$/.test(i.value))return toast('Elegí una hora');db.settings.push=Object.assign(db.settings.push||{},{at:i.value});save();Push.update().then(()=>toast('Te aviso a las '+i.value)).catch(e=>toast(Push.errTxt(e)));},
  pushTest(){toast('Mandando…');Push.update().then(()=>Push.test()).then(r=>toast(r&&r.sent?'Te llegó una notificación de prueba':'No llegó: revisá los permisos de notificaciones')).catch(e=>toast(Push.errTxt(e)));},
  coachHide(v){db.settings.coachHide=db.settings.coachHide||{};db.settings.coachHide[v]=weekStart();save();render();},
  recAll(){S.recAll=!S.recAll;render();},
  toolsOpen(v){S.modal={t:'tools',tab:v==='iv'?'iv':'rm',pr:'tabata'};render();},
  toolTab(v){S.modal.tab=v;renderModal();},
  ivPreset(v){if(S.iv)return toast('Terminá el timer actual primero');S.modal.pr=v;renderModal();},
  ivStart(){const m=S.modal,P={tabata:[20,10,8],emom:[60,0,10],hiit:[40,20,10],custom:[+m.w||30,m.r===''||m.r==null?15:Math.max(0,+m.r||0),+m.n||8]}[m.pr||'tabata'];
    S.iv={w:Math.max(5,P[0]),r:Math.max(0,P[1]),n:Math.max(1,P[2]),round:1,ph:'pre',end:Date.now()+5000};unlockAudio();keepAwake(true);clearInterval(ivT);ivT=setInterval(ivTick,200);renderModal();},
  ivPause(){const iv=S.iv;if(!iv)return;if(iv.paused){iv.end+=Date.now()-iv.pauseAt;iv.paused=false;}else{iv.paused=true;iv.pauseAt=Date.now();}renderModal();},
  ivStop(){clearInterval(ivT);S.iv=null;keepAwake(!!db.active);renderModal();},
  async shareR(v){const r=db.routines.find(x=>x.id===v);if(!r)return;const url=routineLink(r),txt='Te paso mi rutina "'+r.name+'" de Swole';
    try{if(navigator.share){await navigator.share({title:r.name,text:txt,url});return;}}catch(e){if(e&&e.name==='AbortError')return;}
    try{await navigator.clipboard.writeText(url);toast('Link copiado: pegalo en WhatsApp');}catch(e){toast('No se pudo copiar el link');}},
  rimportGo(){const o=S.modal&&S.modal.o;if(!o)return;const ids={};
    o.c.forEach(c=>{const same=db.customEx.find(e=>normTxt(e.n)===normTxt(c.n));if(same){ids[c.id]=same.id;return;}const ex={id:'c_'+uid(),n:c.n,eq:'Personalizado',p:c.p,s:c.s,d:'De una rutina compartida.',st:null,reg:LOWER.includes(c.p[0])?'l':'u',custom:1};if(c.t)ex.time=1;else if(c.b)ex.bw=1;db.customEx.push(ex);ids[c.id]=ex.id;});
    const items=o.i.map(x=>({ex:ids[x[0]]||x[0],sets:x[1],reps:x[2],warm:x[3]||undefined})).filter(it=>exById(it.ex));
    if(!items.length)return toast('La rutina no trae ejercicios válidos');
    db.routines.push({id:uid(),name:o.n,days:[],since:today(),items,rest:Math.min(600,Math.max(30,+o.r||90))});
    S.modal=null;goTab('rutinas');save();render();confetti(30);toast('Rutina agregada: elegí qué días hacerla en Editar');},
  accent(v){const a=ACCENTS.find(x=>x[0]===v);if(a&&a[4]&&frCount()<a[4])return toast('Se desbloquea con '+a[4]+(a[4]===1?' amigo':' amigos')+' en Swole. Tocá "Invitá amigos".');db.settings.accent=v;save();applyTheme();render();},
  invite(){if(Social.on())return ACTIONS.socShare();ACTIONS.socOpen('list');toast('Activá Amigos y compartí tu código');},
  plOpen(){S.modal={t:'pl'};render();},
  plPlanGo(){S.modal=null;ACTIONS.genOpen();const d=S.m2&&S.m2.d;if(d){d.goals=['pl'];d.step=1;renderModal();}},
  soon(){toast('Próximamente: lo estamos armando');},
  jOpen(){S.modal={t:'joints'};render();},
  jSave(v){const i=document.querySelector('[data-jt="'+v+'"]'),n=parseFloat(String(i&&i.value||'').replace(',','.'));
    if(!(n>0&&n<1000))return toast('Poné tu resultado (un número)');
    db.tests.push({id:uid(),date:today(),ex:v,kg:0,reps:Math.round(n*10)/10});save();renderModal();toast('Guardado');checkMissions();},
  jPick(v){const a=db.settings.jz=db.settings.jz||[],i=a.indexOf(v);if(i>=0)a.splice(i,1);else{if(a.length>=3)return toast('Elegí hasta 3 zonas');a.push(v);}
    if(db.settings.jointBlock)jApplyBlock(true);else save();renderModal();},
  jBlock(v){jApplyBlock(v==='1');renderModal();toast(v==='1'?'Listo: tus rutinas arrancan con el bloque de articulaciones':'Bloque quitado de tus rutinas');},
  jNow(){const items=[];JZ.forEach(z=>{const [id,s,r]=z.ex[0];if(exById(id))items.push({ex:id,sets:2,reps:r});});S.modal=null;startSession(null,null,{name:'Articulaciones de acero',items,rest:45});},
  aOpen(){S.modal={t:'ath'};render();},
  aSave(v){const i=document.querySelector('[data-at="'+v+'"]'),n=parseFloat(String(i&&i.value||'').replace(',','.')),t=ATH_T.find(x=>x.k===v);
    if(!t||!(n>0&&n<(t.u==='s'?20:400)))return toast(t&&t.u==='s'?'Poné el tiempo en segundos (ej: 3,2)':'Poné tu resultado en centímetros');
    const a=db.settings.ath=db.settings.ath||{};(a[v]=a[v]||[]).push([today(),Math.round(n*100)/100]);
    const prev=athList(v).slice(0,-1).map(x=>x[1]),rec=prev.length&&(t.low?n<Math.min(...prev):n>Math.max(...prev));
    if(rec)addEv({k:'pr',x:v==='sprint'?'sprint':v==='broad'?'broadjump':v==='box'?'boxjump':'cmj'});
    save();renderModal();toast(rec?'¡Récord!':'Guardado');if(rec)confetti(30);},
  aBlock(v){aApplyBlock(v==='1');renderModal();toast(v==='1'?'Listo: tus rutinas suman el bloque de potencia (menos las del día antes de un partido)':'Bloque de potencia quitado');},
  aNow(){S.modal=null;startSession(null,null,{name:'Potencia de atleta',items:[{ex:'cmj',sets:3,reps:3},{ex:'broadjump',sets:3,reps:3},{ex:'sprint',sets:1,reps:5},{ex:'skater',sets:2,reps:6},{ex:'medslam',sets:3,reps:5}],rest:120});},
  todayGo(){const pl=todayPlan(S.todaySeed||0);startSession(null,null,pl);},
  todayAlt(){S.todaySeed=(S.todaySeed||0)+1;render();},
  sumShare(){if(S.modal&&S.modal.t==='summary')pngShare(summarySVG(S.modal),'swole-entreno.png','Mi entreno en Swole');},
  treeOpen(){S.rt={x:0,y:0,w:1600,fit:1};S.modal={t:'tree',sel:null,view:'game'};render();
    /* al abrir: que se vea por dónde vas (la primera habilidad disponible) */
    setTimeout(()=>{const n=document.querySelector('.gt-n.avail')||document.querySelector('.gt-base');if(n)n.scrollIntoView({block:'center',inline:'center'});},60);},
  treeView(v){S.modal.view=v;renderModal();},
  rtZoom(v){S.rt=S.rt||{x:0,y:0,w:820};if(v==='home')rtFocus(0,0,820);else rtFocus(S.rt.x,S.rt.y,clamp(S.rt.w*(v==='in'?.72:1.38),320,1800));},
  treeSel(v){S.modal.sel=S.modal.sel===v?null:v;renderModal();if(S.modal.view==='radial'&&S.modal.sel){const p=rtLayout().find(q=>q.n.id===v);if(p)rtFocus(p.x*.85,p.y*.85+60);}const d=document.getElementById('tdDet');if(d)d.scrollIntoView({block:'nearest',behavior:'smooth'});},
  postFire(v){const rr=()=>{if(S.modal&&S.modal.t==='friends')renderModal();else render();};const p=(S.social&&S.social.posts||[]).find(x=>x.id===v);const was=p&&p.likes.includes(Sync.user().id);
    Social.fire(v).then(()=>{rr();if(!was)buzz(15);}).catch(e=>{rr();toast(Social.errTxt(e));});rr();},
  postCmt(v){S.cOpen=S.cOpen===v?null:v;renderModal();if(S.cOpen)setTimeout(()=>{const i=document.getElementById('cmt-'+v);if(i){i.focus();i.scrollIntoView({block:'center'});}},80);},
  cmtSend(v){const i=document.getElementById('cmt-'+v),t=(i?i.value:'').trim();if(!t)return;if(i)i.value='';
    Social.comment(v,t.slice(0,200)).then(()=>{renderModal();const n=document.getElementById('cmt-'+v);if(n)n.focus();}).catch(e=>toast(Social.errTxt(e)));},
  cmtDel(v){const[p,c]=v.split('|');Social.uncomment(p,c).then(()=>renderModal()).catch(e=>toast(Social.errTxt(e)));},
  postDel(v){S.m2={t:'confirm',title:'Borrar publicación',msg:'Tus amigos dejan de verla (se borran el fuego y los comentarios). El entreno sigue guardado en tu historial.',act:'postDelGo',arg:v,ok:'Borrar'};render();},
  postDelGo(v,el){const id=el&&el.dataset.v||v;S.m2=null;const p=(S.social.posts||[]).find(x=>x.id===id);if(!p)return render();Social.unshare(p.log_id).then(()=>{render();toast('Publicación borrada');}).catch(e=>toast(Social.errTxt(e)));},
  postUndo(v){Social.unshare(v).then(()=>{if(S.modal&&S.modal.t==='summary')S.modal.posted=false;renderModal();toast('No se publicó');}).catch(e=>toast(Social.errTxt(e)));},
  autoPost(v,el){db.settings.autoPost=!!(el&&el.checked);save();toast(db.settings.autoPost?'Tus próximos entrenos se publican para tus amigos':'Tus entrenos ya no se publican');},
  progsOpen(){S.m2={t:'progs',d:{}};render();},
  progSel(v){S.m2.d.sel=v||null;renderModal();const s=document.querySelector('#modal2 .msheet');if(s)s.scrollTop=0;},
  progUse(v){const p=PROGRAMS.find(x=>x.id===v);if(!p)return;const rp=$('#progRep');
    if(rp&&rp.checked){const old=db.routines.filter(r=>r.gen||r.prog).map(r=>r.id);db.routines=db.routines.filter(r=>!(r.gen||r.prog));Object.keys(db.plan).forEach(k=>{db.plan[k]=db.plan[k].filter(x=>!old.includes(x));if(!db.plan[k].length)delete db.plan[k];});}
    p.r.forEach(x=>{const o={id:uid(),name:x.n,days:x.days.slice(),since:today(),items:x.it.map(it=>Object.assign({},it)),prog:p.id,min:p.min,note:p.how};if(p.id==='531')o.p531=1;db.routines.push(o);});
    S.m2=null;goTab('rutinas');S.rtab='rut';save();render();confetti(40);toast('Listo: '+p.n+' en tu semana');checkAch();},
  musPick(){S.m2={t:'music'};render();},
  musSet(v){db.settings.musicApp=v;save();S.m2=null;render();const a=MUSIC_APPS.find(x=>x[0]===v);if(a)toast('Listo: '+a[1]);},
  musConnect(){Music.connect();},
  musOff(){Music.off();S.m2=null;render();toast('Spotify desconectado');},
  musCtl(v){Music.ctl(v);},
  bigTog(){db.settings.big=!db.settings.big;S.bigE=null;save();render();toast(db.settings.big?'Modo grande: una serie a la vez':'Lista completa');},
  bigNav(v){const n=db.active.entries.length;S.bigE=clamp(bigCur()+(+v),0,n-1);renderSess();const s=document.querySelector('.sess');if(s)s.scrollTop=0;},
  sleepSet(v){db.settings.sleep=db.settings.sleep||{};const t=today();if(+v)db.settings.sleep[t]=+v;else delete db.settings.sleep[t];
    const ks=Object.keys(db.settings.sleep).sort();ks.slice(0,Math.max(0,ks.length-45)).forEach(k=>delete db.settings.sleep[k]);save();render();
    if(+v)toast(+v<=2?'Anotado. Hoy te bajo un poco la carga si entrenás.':+v===5?'¡Bien! Buen día para un récord.':'Anotado');},
  exRange(v){S.exR=v;renderModal();},
  barOpen(){const d=S.m2.d;d.step='bar';d.bar={};renderModal();setTimeout(barScan,60);},
  barManual(){barStop();S.m2.d.bar={manual:1};renderModal();setTimeout(()=>{const i=$('#barIn');if(i)i.focus();},100);},
  barGo(){const i=$('#barIn');barLookup(i?i.value:'');},
  notifOpen(){S.m2={t:'notif'};render();if(Social.on())Social.load().then(()=>{if(S.m2&&S.m2.t==='notif')renderModal();updNotif();}).catch(()=>{});},
  passSeen(){if(db.settings.seasonPass)db.settings.seasonPass.seen=1;save();renderModal();updNotif();},
  podium(v){const c=(S.social&&S.social.comps||[]).find(x=>x.id===v);if(!c)return;db.settings.compSeen=(db.settings.compSeen||[]).concat(v).slice(-60);save();
    S.m2={t:'podium',id:v};render();updNotif();const me=S.social.me&&S.social.me.user_id,ms=(c.swole_comp_member||[]).filter(x=>x.joined).sort((a,b)=>b.score-a.score);if(ms.slice(0,3).some(x=>x.user_id===me))setTimeout(()=>confetti(60),350);},
  skMark(v){const f=findNode(v);if(!f)return;const n=f.b.nodes[f.i];S.m2={t:'skmark',id:v,n:Math.max(n.t,bestRep(v))};render();},
  skMarkStep(v){const i=$('#skMarkN'),m=S.m2;m.n=Math.max(1,(parseInt(i&&i.value,10)||m.n)+(+v));renderModal();},
  skMarkSave(){const i=$('#skMarkN'),m=S.m2,n=Math.round(+String(i?i.value:m.n).replace(',','.'));if(!(n>0))return toast('Poné cuánto hacés');
    const f=findNode(m.id);if(!f)return;const node=f.b.nodes[f.i],was=nodeDone(f.b,f.i);
    db.tests.push({id:uid(),date:today(),ex:m.id,kg:0,reps:Math.min((exById(m.id)||{}).time?900:200,n)});save();S.m2=null;render();checkMissions();try{checkGoals();checkAch();checkRankUp(2200);}catch(e){}Social.schedule();
    const now=nodeDone(f.b,f.i),nx=f.b.nodes[f.i+1];
    if(now&&!was){confetti(40);toast('¡Dominada!'+(nx?' Se desbloqueó '+shortN(nx.ex.n):' Terminaste la rama'));if(nx&&S.modal&&S.modal.t==='tree'){S.modal.sel=nx.id;renderModal();}}
    else toast(now?'Guardado':'Guardado: te faltan '+(node.t-n)+(node.time?' s':' reps')+' para dominarla');},
  skGoal(v){S.m2={t:'skplan',id:v};render();},
  skStart(v){const p=skillPlan(v);if(!p)return;db.settings.skillGoal={id:v,since:today()};S.m2=null;S.modal=null;save();startSession(null,null,{name:'Camino a '+shortN(p.tg.n),items:p.items,rest:150});},
  skSave(v){const p=skillPlan(v);if(!p)return;
    db.routines=db.routines.filter(r=>!r.skill);
    db.routines.push({id:uid(),name:'Camino a '+shortN(p.tg.n),days:pick3(weekGymDays()),since:today(),items:p.items,rest:150,skill:v,note:'Se actualiza sola a medida que progresás'});
    db.settings.skillGoal={id:v,since:today()};S.m2=null;S.modal=null;goTab('rutinas');S.rtab='rut';save();render();confetti(30);toast('Listo: Camino a '+shortN(p.tg.n)+' en tu semana');},
  addSet(v,el){
    const en=db.active.entries[+el.dataset.e],l=en.sets[en.sets.length-1]||{kg:'',reps:10};
    en.sets.push({kg:l.kg,reps:l.reps,done:false});save();renderSess();
  },
  delSet(v,el){const en=db.active.entries[+el.dataset.e];if(en.sets.length<2)return;if(en.sets[en.sets.length-1].done)return toast('La última serie ya está hecha: destildala si la querés borrar');const gone=en.sets.pop();save();renderSess();buzz(6);toast('Serie quitada',()=>{en.sets.push(gone);save();renderSess();});},
  goalUse(v,el){const en=db.active.entries[+el.dataset.e];const g=en.goal;if(!g)return;en.sets.forEach(s=>{if(!s.done&&!s.w){if(g.kg)s.kg=g.kg;s.reps=g.reps;}});save();renderSess();toast('Meta puesta en las series que faltan');},
  ssTog(v,el){const en=db.active.entries[+el.dataset.e];en.ss=en.ss?0:1;save();renderSess();if(en.ss)toast('Superserie: alternás este ejercicio con el siguiente, sin descanso entre medio');},
  recapOpen(){openRecap();},
  recapNext(){const m=S.modal;if(m.i<RECAP_N-1){m.i++;renderModal();recapTimer();countUp($('#modal'));}else ACTIONS.recapClose();},
  recapPrev(){const m=S.modal;if(m.i>0){m.i--;renderModal();recapTimer();countUp($('#modal'));}},
  recapClose(){clearTimeout(S.recapT);S.modal=null;render();},
  delEntry(v,el){const i=+el.dataset.e,Ac=db.active,en=Ac&&Ac.entries[i];if(!en)return;const ex=exById(en.ex);
    Ac.entries.splice(i,1);save();renderSess();buzz(10);
    toast('Quitaste '+(ex?ex.n:'el ejercicio'),()=>{if(db.active!==Ac)return;Ac.entries.splice(Math.min(i,Ac.entries.length),0,en);save();renderSess();});},
  moveDown(v,el){const Es=db.active.entries,i=+el.dataset.e;if(i<Es.length-1){Es.splice(i+1,0,Es.splice(i,1)[0]);save();renderSess();}},
  delEntryGo(v){S.m2=null;if(db.active&&db.active.entries[+v]){db.active.entries.splice(+v,1);save();}render();},
  setW(v,el){const s=db.active.entries[+el.dataset.e].sets[+el.dataset.s];s.w=s.w?0:1;save();renderSess();},
  moveEntry(v,el){const a=db.active.entries,i=+el.dataset.e;if(i>0){const t=a[i];a[i]=a[i-1];a[i-1]=t;save();renderSess();}},
  replEx(v,el){S.picker={target:'replace',idx:+el.dataset.e,q:'',g:''};renderPicker();},
  plates(v,el){const en=db.active.entries[+el.dataset.e],s=en.sets.find(x=>!x.done)||en.sets[en.sets.length-1]||{};S.m2={t:'plates',d:{kg:s.kg||'',bar:20,e:+el.dataset.e}};render();},
  platesOpen(){S.m2={t:'plates',d:{kg:'',bar:20,e:null}};render();},
  platesUse(){const d=S.m2.d,en=db.active&&db.active.entries[d.e];if(en)en.sets.forEach(s=>{if(!s.done)s.kg=+d.kg||0;});S.m2=null;save();render();toast('Peso puesto en las series que faltan');},
  genOpen(){const ov=overall();S.m2={t:'gen',d:{step:1,sports:[],sdays:[],goals:genGoals0(),skills:genSkills0(),min:(db.settings.gen&&db.settings.gen.min)||60,days:3,inj:(db.settings.gen&&db.settings.gen.inj||[]).slice(),eq:'gym',lvl:!ov||ov.L<6?'beg':ov.L<12?'int':'adv',plan:null,seed:0,replace:true}};render();},
  genTog(v,el){const a=S.m2.d[el.dataset.f];const i=a.indexOf(v);if(i>=0)a.splice(i,1);else a.push(v);if(!S.m2.d.sports.length)S.m2.d.sdays=[];renderModal();},
  genSD(v){const a=S.m2.d.sdays,n=+v,i=a.indexOf(n);if(i>=0)a.splice(i,1);else a.push(n);renderModal();},
  genGoal(v){let g=S.m2.d.goals;
    /* powerlifting arma su propia semana: no se mezcla con los otros objetivos */
    if(v==='pl'&&!g.includes('pl')){S.m2.d.goals=['pl'];renderModal();toast('Powerlifting arma su propia semana (con accesorios incluidos)');return;}
    if(v!=='pl'&&g.includes('pl')){S.m2.d.goals=g=[];}
    const i=g.indexOf(v);if(i>=0){if(g.filter(x=>x!=='cali').length>1)g.splice(i,1);else toast('Elegí al menos un objetivo');}else g.push(v);renderModal();},
  genSet(v,el){const d=S.m2.d;d[el.dataset.f]=el.dataset.f==='days'?+v:v;renderModal();},
  genStep(v){const d=S.m2.d,n=+v;if(d.step===1&&n===2&&weekPend().length)return toast(weekPendMsg());if(n===4){if(d.step===4)d.seed=(d.seed||0)+1;d.plan=genPlan(d);}d.step=n;renderModal();const s=document.querySelector('#modal2 .msheet');if(s)s.scrollTop=0;},
  genWay(v){const d=S.m2.d;let g=d.goals.filter(x=>x!=='cali'&&(v!=='cali'||x!=='pl'));if(!g.length)g=['hip'];if(v==='cali')g.push('cali');d.goals=g;renderModal();},
  genMin(v){const d=S.m2.d;d.min=Math.max(20,Math.min(180,(+d.min||60)+(+v)));renderModal();},
  genDel(v){const d=S.m2.d,[ri,ii]=v.split('|').map(Number),r=d.plan&&d.plan[ri];if(!r||!r.items[ii])return;if(r.items.length<2)return toast('Dejá al menos un ejercicio en el día');
    const it=r.items.splice(ii,1)[0],ex=exById(it.ex);r.min=routineMinutes(r);d.plan.vol=weekVolume(d.plan);renderModal();buzz(8);
    toast('Quitaste '+(ex?ex.n:'el ejercicio'),()=>{r.items.splice(Math.min(ii,r.items.length),0,it);r.min=routineMinutes(r);d.plan.vol=weekVolume(d.plan);renderModal();});},
  genSwap(v){const[ri,ii]=v.split('|').map(Number);S.picker={target:'gen',ri,ii,q:'',g:''};renderPicker();},
  genSave(){
    const d=S.m2.d;if(!d.plan||!d.plan.length)return;
    if(d.replace){const old=db.routines.filter(r=>r.gen).map(r=>r.id);db.routines=db.routines.filter(r=>!r.gen);Object.keys(db.plan).forEach(k=>{db.plan[k]=db.plan[k].filter(x=>!old.includes(x));if(!db.plan[k].length)delete db.plan[k];});}
    db.settings.gen={v2:1,goals:d.goals.slice(),skills:(d.skills||[]).slice(),eq:d.eq,lvl:d.lvl,min:+d.min||60,inj:(d.inj||[]).slice()};
    d.plan.forEach(r=>{const o={id:uid(),name:r.name,days:r.days,since:today(),items:r.items,rest:r.rest,note:r.note,gen:1,min:r.min};if(r.pl)o.pl=1;db.routines.push(o);});
    S.m2=null;goTab('rutinas');S.rtab='rut';save();render();confetti(40);toast('Listo: '+d.plan.length+' rutinas en tu semana');checkAch();
  },
  muscle(v){const m=muscleLevels()[v];const best=rankedList().filter(x=>x.ex.p.includes(v)&&x.info.L>=0)[0];toast((MUSC[v]||v)+': '+(m==null?'todavía sin rango':lvlName(Math.floor(m))+(best?' con '+best.ex.n:'')));},
  pickEx(v){S.picker={target:v,q:'',g:''};renderPicker();},
  undo(){const f=S.undo;S.undo=null;clearTimeout(toastT);$('#toast').classList.remove('on','act');if(f){f();buzz(10);}},
  setCopy(v,el){const en=db.active.entries[+el.dataset.e],j=+el.dataset.s,s=en.sets[j],ex=exById(en.ex);
    const src=v==='prev'?en.sets[j-1]:(lastSets(en.ex)||[]).filter(x=>!x.w)[en.sets.slice(0,j).filter(x=>!x.w).length];if(!s||!src)return;
    if(!ex.time)s.kg=src.kg;s.reps=src.reps;save();renderSess();buzz(6);},
  exMenuGo(v,el){const e=el.dataset.e;S.m2=null;if(v==='exInfo'){render();ACTIONS.exInfo(el.dataset.x);return;}const f=ACTIONS[v];if(f)f('',{dataset:{e}});render();},
  wkPick(v){S.wkSel=S.wkSel===v?null:v;render();if(S.wkSel)toast('Ahora tocá el día al que la querés pasar');},
  wkDrop(v){if(!S.wkSel)return;const[id,from]=S.wkSel.split('|');S.wkSel=null;wkMove(id,+from,+v);},
  prefTog(v){const s=db.settings;if(v==='calm')s.calm=!s.calm;else s[v]=s[v]===false;save();render();if(v==='haptics'&&s.haptics!==false)buzz(20);},
  rSwap(v){S.picker={target:'rswap',idx:+v,q:'',g:''};renderPicker();},
  pickAdd(v){
    const ex=exById(v);if(!ex)return;
    if(S.picker.last===v&&Date.now()-S.picker.lastT<1500)return;S.picker.last=v;S.picker.lastT=Date.now();
    const reps=ex.time?45:10;
    if(S.picker.target==='gen'){const d=S.m2&&S.m2.d,r=d&&d.plan&&d.plan[S.picker.ri],it=r&&r.items[S.picker.ii];
      if(it){if(r.items.some(x=>x!==it&&x.ex===v)){toast('Ese ya está en esta rutina');return;}const old=exById(it.ex);it.ex=v;delete it.warm;if(!!ex.time!==!!(old&&old.time))it.reps=ex.time?30:10;d.plan.vol=weekVolume(d.plan);}
      S.picker=null;renderPicker();renderModal();toast('Cambiado por '+ex.n+(canDo(v)?'':' (ojo: todavía no la tenés desbloqueada)'));return;}
    if(S.picker.target==='rswap'){const it=S.modal&&S.modal.d.items[S.picker.idx];if(it){if(S.modal.d.items.some(x=>x!==it&&x.ex===v)){toast('Ese ya está en esta rutina');return;}it.ex=v;}S.picker=null;renderPicker();renderModal();toast('Cambiado por '+ex.n);return;}
    if(S.picker.target==='routine'){S.modal.d.items.push({ex:v,sets:3,reps:reps});renderModal();}
    else if(S.picker.target==='replace'){const old=db.active.entries[S.picker.idx];const ne=mkEntry(v,old?Math.max(1,old.sets.filter(s=>!s.done).length||old.sets.length):3,reps);if(old){const dn=old.sets.filter(s=>s.done);/* lo que ya hiciste del anterior queda anotado */if(dn.length){old.sets=dn;db.active.entries.splice(S.picker.idx+1,0,ne);}else db.active.entries[S.picker.idx]=ne;}S.picker=null;save();renderPicker();renderSess();toast('Cambiado por '+ex.n);return;}
    else{db.active.entries.push(mkEntry(v,3,reps));save();renderSess();}
    toast('Agregado: '+ex.n);
  },
  pickDone(){S.picker=null;renderPicker();},
  pgrp(v){S.picker.g=v;$('#pg').innerHTML=pickChips();$('#pres').innerHTML=pickResults();},
  rtab(v){S.rtab=v;render();},
  grp(v){S.grp=v==='Todos'?'':v;render();},
  newR(){S.modal={t:'routine',d:{id:null,name:'',days:[],items:[]}};render();},
  editR(v){const r=db.routines.find(x=>x.id===v);if(!r)return;S.modal={t:'routine',d:JSON.parse(JSON.stringify(r))};render();},
  rDay(v){const d=S.modal.d,n=+v;d.days=d.days.includes(n)?d.days.filter(x=>x!==n):d.days.concat(n);renderModal();},
  rUp(v){const it=S.modal.d.items,i=+v;if(i>0){const t=it[i];it[i]=it[i-1];it[i-1]=t;renderModal();}},
  rDel(v){S.modal.d.items.splice(+v,1);renderModal();},
  rSave(){
    const d=S.modal.d,name=(d.name||'').trim();
    if(!name)return toast('Ponele un nombre a la rutina');
    if(!d.items.length)return toast('Agregá al menos un ejercicio');
    const items=d.items.map(i=>({ex:i.ex,sets:clamp(parseInt(i.sets)||3,1,12),reps:clamp(parseInt(i.reps)||10,1,200)}));
    if(d.id){
      const r=db.routines.find(x=>x.id===d.id);
      if(r){const same=JSON.stringify((r.days||[]).slice().sort())===JSON.stringify(d.days.slice().sort());r.name=name;r.items=items;if(!same){r.days=d.days;r.since=today();}}
    }else db.routines.push({id:uid(),name:name,days:d.days,since:today(),items:items});
    save();S.modal=null;render();toast('Rutina guardada');
  },
  rDelAsk(){const id=S.modal.d.id,i=db.routines.findIndex(r=>r.id===id);if(i<0)return;const r=db.routines[i],pl=JSON.parse(JSON.stringify(db.plan));
    ACTIONS.rDelGo(id);buzz(10);toast('Rutina eliminada',()=>{if(db.routines.some(x=>x.id===id))return;db.routines.splice(Math.min(i,db.routines.length),0,r);db.plan=pl;save();render();});},
  rDelGo(v){
    db.routines=db.routines.filter(r=>r.id!==v);
    Object.keys(db.plan).forEach(k=>{db.plan[k]=db.plan[k].filter(x=>x!==v);if(!db.plan[k].length)delete db.plan[k];});
    S.m2=null;S.modal=null;save();render();toast('Rutina eliminada');
  },
  addTpl(v){const t=TPL[+v];newRoutineFrom(t.name,t.items);render();toast('Rutina agregada: '+t.name);},
  exInfo(v){if(S.picker){S.picker.view=v;renderPicker();return;}S.modal={t:'ex',id:v};render();},
  pickView(v){S.picker.view=v;renderPicker();},
  pickBack(){S.picker.view=null;renderPicker();},
  genView(v){const[ri,ii]=v.split('|').map(Number),d=S.m2&&S.m2.d,it=d&&d.plan&&d.plan[ri]&&d.plan[ri].items[ii];if(!it)return;S.picker={target:'gen',ri,ii,q:'',g:'',view:it.ex};renderPicker();},
  newEx(){S.m2={t:'excreate',d:{n:'',p:'pecho',s:[],type:'w'}};render();},
  cxS(v){const d=S.m2.d;d.s=d.s.includes(v)?d.s.filter(x=>x!==v):d.s.concat(v);renderModal();},
  cxT(v){S.m2.d.type=v;renderModal();},
  cxSave(){
    const d=S.m2.d,n=(d.n||'').trim();
    if(!n)return toast('Ponele un nombre al ejercicio');
    const ex={id:'c_'+uid(),n:n,eq:'Personalizado',p:[d.p],s:d.s.slice(),d:'',st:null,reg:LOWER.includes(d.p)?'l':'u',custom:1};
    if(d.type==='b')ex.bw=1;if(d.type==='t')ex.time=1;
    db.customEx.push(ex);save();S.m2=null;render();toast('Ejercicio creado: '+n);
  },
  delEx(v){S.m2={t:'confirm',title:'Eliminar ejercicio',msg:'Se elimina de la biblioteca y de tus rutinas. Tus entrenamientos registrados se mantienen.',act:'delExGo',arg:v,ok:'Eliminar'};render();},
  delExGo(v){
    /* si ya lo registraste, queda oculto (no borrado) para que tu historial lo siga mostrando */
    const used=db.logs.some(l=>l.entries.some(en=>en.ex===v));
    if(used)db.customEx.forEach(e=>{if(e.id===v)e.hidden=1;});
    else db.customEx=db.customEx.filter(e=>e.id!==v);
    db.routines.forEach(r=>r.items=r.items.filter(i=>i.ex!==v));
    S.m2=null;S.modal=null;save();render();
  },
  export(){exportData();},
  exportCSV(){exportCSV();},
  vidDel(v){VidDB.del(v).then(()=>{renderModal();toast('Video borrado');});},
  importOpen(){S.m2={t:'import',text:''};render();},
  csvGo(){const m=S.m2;if(!m||!m.csv||!m.csv.ws)return;const n=csvImport(m.csv);S.m2=null;save();checkAch(true);render();toast(n?'Listo: '+n+(n===1?' entreno importado':' entrenos importados'):'No había entrenos nuevos para importar');if(n)confetti(40);},
  importGo(){
    try{
      const n=importData(JSON.parse(($('#impTxt')||{}).value||''));
      S.m2=null;S.modal=null;render();toast(n?'Copia restaurada: '+n+(n===1?' cosa recuperada':' cosas recuperadas'):'Ya tenías todo lo de esa copia');checkAch(true);
      if(!db.profile)ACTIONS.startOnb();
    }catch(e){toast('Ese texto no parece un archivo de Swole');}
  },
  delAccAsk(){S.m2={t:'delacc',busy:false};render();},
  delAccGo(){const i=$('#delAccIn'),v=(i?i.value:'').trim().toUpperCase();if(v!=='ELIMINAR')return toast('Escribí ELIMINAR para confirmar');
    S.m2.busy=true;renderModal();Sync.req('/rest/v1/rpc/swole_delete_me',{method:'POST',auth:true,body:{p_confirm:'ELIMINAR'}}).then(()=>{Sync.forget();Store.wipe();db=normalize(null);snap=syncKeys(db);S.m2=null;S.modal=null;S.social=null;goTab('inicio');endRest(false);toast('Tu cuenta y tus datos se borraron para siempre');ACTIONS.startOnb();})
      .catch(e=>{if(S.m2)S.m2.busy=false;renderModal();toast(!navigator.onLine?'Sin conexión: probá de nuevo con internet':'No se pudo borrar: '+e.message);});},
  wipeAsk(){S.m2={t:'confirm',title:'Borrar todos los datos',msg:Sync.user()?'Se borran tus datos de este dispositivo y se cierra la sesión. Tu copia en la nube no se toca: si volvés a entrar, se recupera.':'Se borran tu perfil, rutinas, entrenamientos y registros de este dispositivo. No se puede deshacer.',act:'wipeGo',ok:'Borrar todo'};render();},
  wipeGo(){Sync.forget();Store.wipe();db=normalize(null);snap=syncKeys(db);S.m2=null;S.modal=null;goTab('inicio');endRest(false);ACTIONS.startOnb();},
  welNext(){const m=S.modal;if(m.step<WEL.length-1){m.step++;renderModal();}else{db.settings.welcomed=1;save();openProfile();}},
  /* entrar con tu cuenta: el login se abre encima; si lo cerrás, volvés a la bienvenida donde estabas */
  welLogin(){if(!S.modal||S.modal.t!=='onb')ACTIONS.startOnb();ACTIONS.loginOpen();},
  startOnb(){warmPhotos();S.modal={t:'onb',step:db.settings.welcomed?ONB_SLIDES.length:0,d:{sex:'m',goal:'recomp',sports:[],nick:''}};render();},
  loginOpen(v){S.m2={t:'login',d:{email:(Sync.user()||{}).email||'',pw:'',mode:v==='up'?'up':'in',busy:false}};render();},
  loginMode(v){const d=S.m2.d;d.mode=v;d.pw='';renderModal();const i=document.querySelector('#modal2 input');if(i)i.focus();},
  loginGo(){Sync.loginGo();},
  loginResend(){const d=S.m2.d;d.mode='resend';Sync.loginGo().then(()=>{if(S.m2&&S.m2.d===d&&d.mode==='resend'){d.mode='in';renderModal();}});},
  syncNow(){Sync.run(true);},
  logoutAsk(){S.m2={t:'confirm',title:'Cerrar sesión',msg:'Tus datos quedan en este dispositivo y en la nube. Este dispositivo deja de sincronizarse hasta que vuelvas a entrar.',act:'logoutGo',ok:'Cerrar sesión'};render();},
  logoutGo(){Sync.logout();S.m2=null;render();toast('Sesión cerrada');},
  restAdd(v){
    if(!S.rest)return;
    S.rest.end+=(+v)*1000;if(+v>0)S.rest.total+=(+v);
    if(S.rest.end<=Date.now()){endRest(false);return;}
    renderRest();
  },
  restSkip(){endRest(false);},
  restSet(v){db.settings.rest=clamp(+v||90,15,600);save();renderSess();toast('Descanso: '+(+v<60?v+' s':fmtT(+v)));}
};

document.addEventListener('click',e=>{
  const mk=e.target.closest('.mark');if(mk)setTimeout(()=>{const s=mk.querySelector('svg');if(s)s.replaceWith(s.cloneNode(true));},0);
  unlockAudio();
  const el=e.target.closest('[data-a]');
  if(!el)return;
  /* doble toque: el segundo no puede caer en lo que recién apareció bajo el dedo (cerraba el resultado o repetía la acción) */
  if(e.isTrusted&&performance.now()-(S.layT||0)<350)return;
  const a=el.dataset.a;
  /* tocar afuera con el teclado abierto solo baja el teclado: no cierra la ventana ni pierde lo escrito */
  if(a==='back'){if(e.target===el&&!isDraft(el.dataset.v)&&!(performance.now()-(S.kbT||0)<800))closeLayer(el.dataset.v);return;}
  if(a==='close'){closeLayer(el.dataset.v);return;}
  if(a==='act')return;
  const f=ACTIONS[a];
  if(el.dataset.close&&S.modal&&S.modal.t==='quick'){S.modal=null;if(!['startFree','startR','markOpen','genOpen','socOpen'].includes(a)){render();}}
  if(f)f(el.dataset.v,el);
});
document.addEventListener('input',e=>{
  const el=e.target,i=el.dataset&&el.dataset.i;
  if(!i)return;
  const f=el.dataset.f;
  if(i==='q'){S.q=el.value;const r=$('#exres');if(r)r.innerHTML=exResults();}
  else if(i==='pq'){S.picker.q=el.value;const r=$('#pres');if(r)r.innerHTML=pickResults();}
  else if(i==='set'){const s=db.active.entries[+el.dataset.e].sets[+el.dataset.s],mx=f==='kg'?600:900;
    /* un dedo de más (600 en vez de 60) no puede inventar un récord */
    if(+el.value<0)el.value='';else if(+el.value>mx){el.value=mx;toast(f==='kg'?'Máximo 600 kg':'Máximo 900');}
    s[f]=el.value===''?'':+el.value;saveSoon();}
  else if(i==='d'){
    if(el.closest('#view')){pfD()[f]=el.value;return;}
    const m=el.closest('#modal2')?S.m2:S.modal;
    m.d[f]=el.value;
    if(m.t==='excreate'&&f==='p'){m.d.s=m.d.s.filter(k=>k!==el.value);renderModal();}
  }
  else if(i==='item'){S.modal.d.items[+el.dataset.e][f]=el.value;}
  else if(i==='lset'){S.modal.d.entries[+el.dataset.e].sets[+el.dataset.s][f]=el.value;}
  else if(i==='genRep'){S.m2.d.replace=el.checked;}
  else if(i==='tool'){S.modal[f]=el.value;if(S.modal.tab==='rm'){const o=$('#rmOut'),kg=+S.modal.kg||0,rp=Math.min(15,+S.modal.reps||0);if(o)o.innerHTML=rmOut(kg>0&&rp>0?kg*(1+rp/30):0);}}
  else if(i==='csv'){const file=el.files&&el.files[0];if(!file)return;const rd=new FileReader();rd.onload=()=>{S.m2.csvText=String(rd.result);S.m2.csv=csvPlan(S.m2.csvText,false);renderModal();};rd.readAsText(file);}
  else if(i==='csvLbs'){S.m2.csv=csvPlan(S.m2.csvText||'',el.checked);S.m2.csv.lbs=el.checked;renderModal();}
  else if(i==='cmdq'){S.modal.q=el.value;S.modal.i=0;const l=$('#cmdList');if(l)l.innerHTML=cmdList(S.modal);}
  else if(i==='phX'){S.modal.x=+el.value;const c=el.closest('.cmp');if(c)c.style.setProperty('--x',el.value+'%');}
  else if(i==='phSel'){S.modal[f]=el.value;renderModal();}
  else if(i==='photoAdd'){const file=el.files&&el.files[0];el.value='';if(!file)return;
    shrinkPhoto(file).then(blob=>PhotoDB.put({id:uid(),date:today(),t:Date.now(),blob})).then(()=>{loadPhotos();toast('Foto guardada en este dispositivo');}).catch(()=>toast('No se pudo guardar la foto'));}
  else if(i==='mq'){S.m2.d.q=el.value;const l=$('#markList');if(l)l.innerHTML=markList(S.m2.d);}
  else if(i==='mk'){const ex0=exById(S.m2.d.ex),mx=f==='kg'?300:ex0&&ex0.time?900:200;
    if(f!=='date'&&+el.value<0)el.value='';
    if(f!=='date'&&+el.value>mx){el.value=mx;toast(f==='kg'?'Máximo 300 kg':ex0&&ex0.time?'Máximo 900 segundos (15 minutos)':'Máximo 200 repeticiones seguidas');}
    S.m2.d[f]=el.value;const p=$('#markPrev');if(p)p.innerHTML=markPrev(S.m2.d);}
  else if(i==='onb'){S.modal.d[f]=el.value;}
  else if(i==='foodPhoto'){const file=el.files&&el.files[0];el.value='';if(file)foodPhotoGo(file);}
  else if(i==='pho'){const d=S.m2.d,it=d.ph.items[+el.dataset.e];it.other=it.other||{};it.other.q=el.value;it.other.f=el.value.trim()?{n:el.value.trim().slice(0,40),id:'',k:it.opts[0].k,p:it.opts[0].p,c:it.opts[0].c,f:it.opts[0].f}:null;
    const s=$('#phs'+el.dataset.e);if(s)s.innerHTML=phSug(it,+el.dataset.e);const k=$('#phk'+el.dataset.e);if(k)k.textContent=phItemKcal(it)+' kcal';const t=$('#phTot');if(t)t.innerHTML=phTotHTML(d);}
  else if(i==='phg'){const d=S.m2.d,it=d.ph.items[+el.dataset.e];it.g=Math.max(0,Math.round(+el.value.replace(',','.')||0));const k=$('#phk'+el.dataset.e);if(k)k.textContent=phItemKcal(it)+' kcal';const t=$('#phTot');if(t)t.innerHTML=phTotHTML(d);}
  else if(i==='vid'){const f=el.files&&el.files[0],id=el.dataset.e;el.value='';if(!f)return;if(f.size>120e6)return toast('El video es muy largo: grabá una sola serie (hasta ~1 minuto)');
    VidDB.put(id,{blob:f,t:Date.now()}).then(()=>{renderModal();toast('Video guardado en tu celu');}).catch(()=>toast('No pude guardar el video (poco espacio)'));}
  else if(i==='pushAt'){clearTimeout(window.__pat);window.__pat=setTimeout(()=>{if(/^\d{2}:\d{2}$/.test(el.value))ACTIONS.pushAt();},700);}
  else if(i==='fq'){S.m2.d.q=el.value;const l=$('#foodList');if(l){l.innerHTML=foodList(S.m2.d);l.scrollTop=0;}}
  else if(i==='fa'){S.m2.d.qty=el.value;const p=$('#foodPrev');if(p)p.innerHTML=foodPrev(S.m2.d);}
  else if(i==='fn'){S.m2.d.nf[f]=el.value;}
  else if(i==='fk'){S.m2.d.qk[f]=el.value;}
  else if(i==='enote'){db.active.entries[+el.dataset.e].note=el.value;saveSoon();}
  else if(i==='anote'){db.active.note=el.value;saveSoon();}
  else if(i==='pl'){S.m2.d[f]=el.value;const o=document.createElement('div');o.innerHTML=platesHTML(S.m2.d);const n=o.querySelector('#plOut'),c=$('#plOut');if(n&&c)c.replaceWith(n);const b=$('#modal2 [data-a="platesUse"]'),nb=o.querySelector('[data-a="platesUse"]');if(b&&nb)b.replaceWith(nb);}
  else if(i==='file'){
    const file=el.files&&el.files[0];if(!file)return;
    const r=new FileReader();
    r.onload=()=>{const t=$('#impTxt');if(t)t.value=String(r.result);};
    r.readAsText(file);
  }
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset&&el.dataset.a==='act'&&db.profile){db.profile.activity=el.value==='auto'?'auto':+el.value;save();render();}
});
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();if(S.modal&&S.modal.t==='cmd')closeLayer('modal');else if(!S.m2)ACTIONS.cmdOpen();return;}
  if(e.key==='/'&&!S.modal&&!S.m2&&!/INPUT|TEXTAREA|SELECT/.test((document.activeElement||{}).tagName||'')){e.preventDefault();ACTIONS.cmdOpen();return;}
  if(S.modal&&S.modal.t==='cmd'&&!S.m2){
    if(e.key==='ArrowDown'){e.preventDefault();cmdMove(1);return;}
    if(e.key==='ArrowUp'){e.preventDefault();cmdMove(-1);return;}
    if(e.key==='Enter'){e.preventDefault();cmdRun(S.modal.i||0);return;}
  }
  if(e.key==='Enter'&&S.m2&&S.m2.t==='login'&&e.target.tagName==='INPUT'){e.preventDefault();Sync.loginGo();return;}
  /* en la marca: "siguiente" pasa del peso a las repeticiones y "listo" guarda */
  if(e.key==='Enter'&&e.target.tagName==='INPUT'&&S.m2&&S.m2.t==='mark'&&S.m2.d.step==='form'){e.preventDefault();const nx=e.target.dataset.f==='kg'&&document.querySelector('#modal2 input[data-f=reps]');if(nx){nx.focus();return;}e.target.blur();ACTIONS.markGo();return;}
  /* en cualquier campo de números, la tecla "ir" del teclado lo cierra */
  if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type==='number'){e.target.blur();return;}
  if(e.key!=='Escape')return;
  if(S.picker&&(S.picker.target==='gen'||!S.m2)){S.picker=null;renderPicker();}
  else if(S.m2)closeLayer('m2');
  else if(S.modal)closeLayer('modal');
});

let curDay=today();
setInterval(()=>{
  /* si la app queda abierta pasada la medianoche, todo pasa al día nuevo */
  const nd=today();
  if(nd!==curDay){
    if(S.calSel===curDay)S.calSel=nd;
    curDay=nd;
    const typing=document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if(!S.modal&&!S.m2&&!S.picker&&!S.sessOpen&&!typing)render();
  }
  if(db.active){
    const t=fmtT((Date.now()-db.active.t0)/1000),a=$('#elapsed'),p=$('#pillT');
    if(a)a.textContent=t;if(p)p.textContent=t;
  }
  remindCheck();
},1000);

