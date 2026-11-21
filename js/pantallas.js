'use strict';
/* ============ Inicio: tu nivel primero ============ */
function greet(){const h=new Date().getHours();return h<6?'Buenas noches':h<13?'Buen día':h<20?'Buenas tardes':'Buenas noches';}
function levelHero(){
  const ov=overall(),L=ov?ov.L:-1,col=lvlColor(L),st=ov?cardStats():null;
  const pct=ov?(L>=18?1:clamp(ov.pct,0,1)):0,C=2*Math.PI*58;
  const ring='<svg class="lh-ring" viewBox="0 0 132 132" aria-hidden="true"><circle cx="66" cy="66" r="58" class="lh-bg"/><circle cx="66" cy="66" r="58" class="lh-fg" style="stroke:'+col+';stroke-dasharray:'+C.toFixed(1)+';--off:'+(C*(1-pct)).toFixed(1)+'"/></svg>';
  if(!ov)return '<div class="lvl-hero none"><div class="lh-badge">'+ring+badge(-1,84)+'</div><div class="lh-txt"><span class="lh-k">Tu rango</span><h2>Sin rango todavía</h2><p class="mut">Cargá tu primera marca y te digo en qué nivel estás.</p>'+
   '<div class="lh-btns"><button class="btn pri sm" data-a="markOpen">'+ic('bolt',16)+' Cargar marca</button><button class="btn sm" data-a="startFree">'+ic('play',16)+' Entrenar</button></div></div></div>';
  const top=rankedList().filter(x=>x.info.L>=0)[0];
  return '<div class="lvl-hero" style="--c:'+col+'"><div class="lh-badge" data-a="cardOpen">'+ring+badge(L,84)+'</div><div class="lh-txt"><span class="lh-k">Tu rango general</span><h2 style="color:'+col+'">'+lvlName(L)+'</h2>'+
   '<p class="mut sm-t">'+(L<18?Math.round(pct*100)+' % hacia '+lvlName(L+1):'Nivel máximo')+'</p>'+
   '<div class="lh-chips"><span class="lh-ovr"><b data-n="'+st.OVR+'">'+st.OVR+'</b> puntaje</span>'+(top?'<span>'+ic('trophy',14)+' '+esc(top.ex.n)+'</span>':'')+'</div>'+
   '<p class="lh-pct">Más fuerte que el <b>'+pctFromV(ov.L+ov.pct)+' %</b> de '+whoTxt()+' <span class="mut">(estimado)</span></p>'+
   (()=>{const nh=nextRankHint();return nh?'<p class="lh-next">'+ic('up',14)+' <span>Más cerca de subir: <b>'+esc(shortN(nh.ex.n))+'</b> a '+lvlName(nh.L)+' con '+esc(nh.txt)+'</span></p>':'';})()+
   '<div class="lh-btns"><button class="btn pri sm" data-a="cardOpen">Ver mi carta</button><button class="btn sm" data-a="markOpen">'+ic('bolt',16)+' Marca</button></div></div></div>';
}
const QUICK=[
  {i:'play',l:'Entrenar',a:'quickTrain',c:'#7A66FF'},
  {i:'bolt',l:'Cargar marca',a:'markOpen',c:'#FF4F93'},
  {i:'dumb',l:'Rutinas',a:'tab',v:'rutinas',c:'#1F9E95'},
  {i:'tree',l:'Habilidades',a:'treeOpen',c:'#2F73E0'},
  {i:'flame',l:'Nutrición',a:'tab',v:'nutri',c:'#CC8A12'},
  {i:'spark',l:'Armar rutina',a:'genOpen',c:'#8F43EA'}
];
const qTile=q=>'<button class="qtile" data-a="'+q.a+'"'+(q.v?' data-v="'+q.v+'"':'')+' style="--qc:'+q.c+'"><span class="qi">'+ic(q.i,22)+'</span><span>'+q.l+'</span></button>';
const SLEEP=[[1,'Muy mal'],[2,'Mal'],[3,'Normal'],[4,'Bien'],[5,'Bárbaro']];
function sleepCard(){
  const t=today(),sl=(db.settings.sleep||{})[t];
  if(!db.profile||doneOn(t).length||!db.logs.length)return '';
  if(sl)return '<div class="card sleep-c done"><span class="sleep-i">'+ic('moon',18)+'</span><span class="grow">Dormiste <b>'+SLEEP[sl-1][1].toLowerCase()+'</b>'+(sl<=2?': si entrenás hoy, te bajo un poco la carga.':sl===5?': buen día para un récord.':'.')+'</span><button class="ib flat" data-a="sleepSet" data-v="0" aria-label="Cambiar">'+ic('edit',15)+'</button></div>';
  return '<div class="card sleep-c"><div class="row" style="gap:10px;margin-bottom:10px"><span class="sleep-i">'+ic('moon',18)+'</span><b class="grow">¿Cómo dormiste anoche?</b></div><div class="sleep-o">'+SLEEP.map(([v,n])=>'<button data-a="sleepSet" data-v="'+v+'"><b>'+v+'</b><small>'+n+'</small></button>').join('')+'</div></div>';
}
function viewInicio(){
  const p=db.profile||{};
  return '<div class="home"><div class="home-l"><div class="hello"><span class="mut">'+greet()+(p.nick?',':'')+'</span><h1 class="pg">'+(p.nick?esc(p.nick):'Swole')+'</h1></div>'+
   (db.logs.length<3?todayCard():'')+levelHero()+seasonCard()+missionsCard()+skillGoalCard()+goalsCard(true)+'<div class="qgrid">'+QUICK.map(qTile).join('')+'</div></div><div class="home-r">'+sleepCard()+(db.logs.length<3?'':todayCard())+friendsFeedCard()+coachCard()+stripTitle(viewHoy())+'</div></div>';
}
/* botón central: lo que más se usa, a un toque */
function quickHTML(){
  const t=today(),pl=plannedFor(t).filter(r=>!doneOn(t).some(l=>l.routineId===r.id)),taken=!!db.creatine[t];
  const items=[{i:'play',l:'Entreno libre',a:'startFree',c:'#7A66FF'}];
  pl.slice(0,2).forEach(r=>items.push({i:'dumb',l:r.name,a:'startR',v:r.id,c:'#1F9E95'}));
  items.push({i:'bolt',l:'Cargar marca',a:'markOpen',c:'#FF4F93'},{i:'food',l:'Anotar comida',a:'foodOpen',c:'#E8722A'},{i:'drop',l:'+1 vaso de agua',a:'water',v:'1',c:'#2F73E0'},{i:'pill',l:taken?'Creatina: tomada':'Tomé creatina',a:'creaToggle',v:t,c:'#CC8A12'},{i:'spark',l:'Armar rutina',a:'genOpen',c:'#8F43EA'},{i:'timer',l:'Intervalos',a:'toolsOpen',v:'iv',c:'#2F73E0'},{i:'weight',l:'1RM y %',a:'toolsOpen',v:'rm',c:'#1F9E95'},{i:'users',l:'Amigos',a:'socOpen',v:'auto',c:'#FF4F6A'});
  return '<div class="qgrid big">'+items.map(q=>'<button class="qtile" data-a="'+q.a+'"'+(q.v?' data-v="'+esc(q.v)+'"':'')+' data-close="1" style="--qc:'+q.c+'"><span class="qi">'+ic(q.i,24)+'</span><span>'+esc(q.l)+'</span></button>').join('')+'</div>';
}
function avatarHTML(){
  const p=db.profile||{},ov=db.profile?overall():null,col=ov?lvlColor(ov.L):'var(--line)';
  const ini=(p.nick||'').trim().slice(0,1).toUpperCase();
  return '<button class="avatar" data-a="tab" data-v="perfil" aria-label="Perfil" style="--ac:'+col+'">'+(ini?'<b>'+esc(ini)+'</b>':ic('user',20))+'</button>';
}

/* ============ Bienvenida paso a paso ============ */
const ONB_SLIDES=[
  {t:'Entrená. Medí. Subí.',p:'Swole es tu app para entrenar y saber, de verdad, qué tan fuerte sos.'},
  {t:'Tu carta de atleta',p:'Sumá puntaje, desbloqueá logros y compartí tu carta.'}
];
const ONB_N=ONB_SLIDES.length+7; /* 2 diapositivas + apodo + cuerpo + medidas + objetivo + semana + cuenta + el final */
function onbHTML(m){
  const s=m.step||0,d=m.d;
  const bars='<div class="onb-bars">'+Array.from({length:ONB_N},(_,k)=>'<i class="'+(k<=s?'on':'')+'"></i>').join('')+'</div>';
  const back=s>0&&s<ONB_N?'<button class="ib flat onb-back" data-a="onbBack" aria-label="Atrás">'+ic('left')+'</button>':'';
  let body='',btn='Siguiente',alt='';
  if(s<ONB_SLIDES.length){
    const w=ONB_SLIDES[s];
    const demo={pecho:8,hombros:10,biceps:6,triceps:7,abs:4,oblicuos:3,cuadriceps:12,gemelos:5,dorsales:13,trapecio:9,lumbar:7,gluteos:11,isquios:9,antebrazos:5,aductores:6};
    const art=s===0?rankStairs()
      :'<div class="onb-card"><div class="carta">'+demoCard()+'<i class="holo"></i><i class="glare"></i></div></div>';
    body='<div class="onb-art">'+art+'</div><h2 class="onb-t">'+w.t+'</h2><p class="onb-p">'+w.p+'</p>';
    alt='<button class="btn line wide" data-a="welLogin">Ya uso Swole: entrar con mi cuenta</button>';
    if(s===ONB_SLIDES.length-1)btn='Crear mi perfil';
  }else{
    const q=s-ONB_SLIDES.length;
    if(q===0)body='<h2 class="onb-t left">¿Cómo te dicen?</h2><p class="onb-p left">Va a aparecer en tu carta.</p><input class="onb-in" type="text" maxlength="20" placeholder="Tu apodo" value="'+esc(d.nick||'')+'" data-i="onb" data-f="nick" autocomplete="nickname">';
    else if(q===1)body='<h2 class="onb-t left">Contame de vos</h2><p class="onb-p left">Para comparar tu fuerza con gente como vos.</p>'+
      '<div class="onb-opts">'+[['m','Hombre'],['f','Mujer'],['x','Prefiero no decir']].map(x=>'<button class="'+(d.sex===x[0]?'on':'')+'" data-a="onbSet" data-f="sex" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div>'+
      '<label class="onb-lbl">Edad<input class="onb-in" type="number" inputmode="numeric" min="10" max="90" placeholder="años" value="'+esc(d.age||'')+'" data-i="onb" data-f="age"></label>';
    else if(q===2)body='<h2 class="onb-t left">Tus medidas</h2><p class="onb-p left">Con esto calculo tus niveles y tus calorías.</p>'+
      '<div class="g2"><label class="onb-lbl">Altura<input class="onb-in" type="number" inputmode="numeric" min="120" max="230" placeholder="cm" value="'+esc(d.height||'')+'" data-i="onb" data-f="height"></label>'+
      '<label class="onb-lbl">Peso<input class="onb-in" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="kg" value="'+esc(d.weight||'')+'" data-i="onb" data-f="weight"></label></div>';
    else if(q===3){d.goals=d.goals||[];body='<h2 class="onb-t left">¿Qué querés lograr?</h2><p class="onb-p left">Podés elegir varios. Con esto armo tus rutinas y tus calorías.</p><div class="ptiles">'+Object.keys(GEN_GOALS).map(k=>photoTile(k,GEN_GOALS[k].n,GEN_GOALS[k].i,d.goals.includes(k),'onbGoal',k)).join('')+'</div>';btn='Siguiente';}
    else if(q===4){body='<h2 class="onb-t left">Tu semana</h2><p class="onb-p left">Así tus rutinas caen en los días justos. Lo podés cambiar cuando quieras en Perfil.</p>'+weekEditor();}
    else if(q===5){const u=Sync.user();
      body='<div class="onb-art"><div class="onb-cloud">'+ic(u?'check':'cloud',54)+'</div></div><h2 class="onb-t">'+(u?'Tu cuenta está lista':'Guardá tu progreso')+'</h2><p class="onb-p">'+(u?'Todo lo que hagas se guarda en la nube como <b>'+esc(u.email||'')+'</b>.':'Con una cuenta gratis tus entrenos quedan en la nube y usás Swole en el celu y la compu. Si no, todo queda solo en este dispositivo.')+'</p>';
      if(u)btn='Siguiente';else{btn='Crear cuenta';alt='<button class="btn line wide" data-a="onbNext">Ahora no</button>';}}
    else{
      if(!m.planned){m.planned=1;autoPlan();}
      const gr=db.routines.filter(x=>x.gen),dw=new Date().getDay(),tr=gr.find(x=>(x.days||[]).includes(dw));
      body='<div class="onb-art"><div class="onb-final">'+badge(0,110)+'</div></div><h2 class="onb-t">¡Bienvenid'+(d.sex==='f'?'a':'o')+', '+esc(d.nick||'atleta')+'!</h2>'+
       (gr.length?'<p class="onb-p">Te armé tu plan con lo que me contaste:</p><div class="onb-plan">'+gr.map(x=>'<div><b>'+esc(x.name)+'</b><span>'+(x.days||[]).map(k=>DIAS3[k]).join(' · ')+(x.min?' · ~'+x.min+' min':'')+'</span></div>').join('')+'</div>'
        :'<p class="onb-p">Todos arrancan en Bronce. Cargá tu primera marca y descubrí tu nivel real.</p>');
      m.rid=tr?tr.id:null;
      if(tr){btn='Empezar el entreno de hoy';alt='<button class="btn line wide" data-a="onbFirst">Cargar mi primera marca</button><button class="onb-skip" data-a="onbDone">Ir al inicio</button>';}
      else if(gr.length){btn='Ver mi plan';alt='<button class="btn line wide" data-a="onbFirst">Cargar mi primera marca</button>';}
      else{btn='Cargar mi primera marca';alt='<button class="btn line wide" data-a="onbDone">Ir al inicio</button>';}
    }
  }
  return '<div class="mback onb"><div class="onb-in-wrap">'+bars+back+'<div class="onb-c" key="'+s+'">'+body+'</div>'+
   '<div class="onb-foot"><button class="btn pri wide big-btn" data-a="'+(s===ONB_N-1?(m.rid?'onbStart':db.routines.some(x=>x.gen)?'onbPlan':'onbFirst'):s===ONB_SLIDES.length+5&&!Sync.user()?'onbAcct':'onbNext')+'">'+btn+' '+ic('right',18)+'</button>'+alt+'</div></div></div>';
}
/* al terminar la bienvenida: si no tiene rutinas, se las armo con lo que contestó (objetivos, días, si ya entrena) */
function autoPlan(){
  try{if(db.routines.length||!db.profile)return;
    const g=db.settings.gen||{},goals=(g.goals&&g.goals.length?g.goals:['hip']),only=goals.includes('cali');
    const d={goals:goals.slice(),eq:only?'home':'gym',lvl:db.profile.trains?'int':'beg',days:3,min:g.min||60,seed:0};
    const plan=genPlan(d);if(!plan||!plan.length)return;
    db.settings.gen=Object.assign({},g,{goals:d.goals,eq:d.eq,lvl:d.lvl,min:d.min});
    plan.forEach(r=>{const o={id:uid(),name:r.name,days:r.days,since:today(),items:r.items,rest:r.rest,note:r.note,gen:1,min:r.min};if(r.pl)o.pl=1;db.routines.push(o);});save();
  }catch(e){console.warn(e);}
}
/* carta de muestra para la bienvenida (sin datos del usuario) */
function demoCard(){
  const keep=db.profile,tests=db.tests,lg=db.logs;
  try{
    db.profile=Object.assign({sex:'m',age:24,height:178,weight:78,activity:2,goal:'recomp'},keep||{},{nick:(keep&&keep.nick)||'Vos'});
    db.tests=[{id:'d1',date:today(),ex:'bench',kg:100,reps:5},{id:'d2',date:today(),ex:'squat',kg:140,reps:5},{id:'d3',date:today(),ex:'pullup',kg:20,reps:6},{id:'d4',date:today(),ex:'deadlift',kg:170,reps:3},{id:'d5',date:today(),ex:'lsit',kg:0,reps:20}];
    db.logs=[];
    return cardSVG();
  }finally{db.profile=keep;db.tests=tests;db.logs=lg;}
}

/* ============ Objetivos ============ */
/* un objetivo = llegar a un nivel en un ejercicio. El progreso va desde dónde estabas al fijarlo hasta la meta. */
const curV=ex=>{const b=bestE1(ex.id);return b?Math.max(-1,levelVal(ex,b.e)):-1;};
function goalProg(g){const ex=exById(g.ex);if(!ex)return null;const v=curV(ex),v0=Math.min(g.v0,g.L-.01);return{ex,v,pct:clamp((v-v0)/(g.L-v0),0,1)};}
function goalSuggest(){
  const have=new Set((db.goals||[]).filter(g=>!g.done).map(g=>g.ex)),out=[];
  /* el próximo nivel de tus mejores ejercicios y del grupo más flojo */
  const r=rankedList().filter(x=>x.info.L>=0&&x.info.L<18&&!have.has(x.ex.id));
  const gl=groupLevels(),weak=Object.keys(gl).filter(g=>gl[g]).sort((a,b)=>gl[a].v-gl[b].v)[0];
  if(weak){const x=r.find(y=>groupOf(y.ex)===weak);if(x)out.push({ex:x.ex,L:x.info.L+1,why:'Tu grupo más flojo: '+weak.toLowerCase()});}
  r.forEach(x=>{if(out.length<3&&!out.some(o=>o.ex.id===x.ex.id))out.push({ex:x.ex,L:x.info.L+1,why:'Estás a '+Math.round((1-x.info.pct)*100)+' % del próximo rango'});});
  return out;
}
function goalRow(g){
  const p=goalProg(g);if(!p)return '';
  return '<div class="goal-row'+(g.done?' done':'')+'">'+badge(g.L,40)+'<div class="grow"><b>'+esc(p.ex.n)+'</b> → '+lvlSpan(g.L)+
   '<div class="bar" style="margin:6px 0 4px"><i style="width:'+Math.round((g.done?1:p.pct)*100)+'%;background:'+lvlColor(g.L)+'"></i></div>'+
   '<span class="mut sm-t">'+(g.done?'¡Cumplido el '+esc(shortDate(parseK(g.done).getTime()))+'!':'Te falta: '+needTxt(p.ex,g.L))+'</span></div>'+
   '<button class="ib flat" data-a="goalDel" data-v="'+g.id+'" aria-label="Quitar objetivo">'+ic('x',16)+'</button></div>';
}
function goalsCard(home){
  const act=(db.goals||[]).filter(g=>!g.done),done=(db.goals||[]).filter(g=>g.done).slice(-3).reverse();
  if(home&&!act.length)return '';
  let h='<div class="card"><div class="hd"><div><h3>Tus objetivos</h3><span class="mut sm-t">'+(act.length?'Hasta 3 a la vez':'Elegí qué rango querés alcanzar')+'</span></div><span class="tag">'+act.length+'/3</span></div><div class="gap">'+act.map(goalRow).join('')+'</div>';
  if(!home){
    const sug=act.length<3?goalSuggest():[];
    if(sug.length)h+='<p class="mut sm-t" style="margin:12px 0 6px;font-weight:700">Sugeridos para vos</p><div class="gap">'+sug.map(s=>'<div class="row goal-sug">'+badge(s.L,34)+'<div class="grow"><b>'+esc(s.ex.n)+'</b> → '+lvlSpan(s.L)+'<br><span class="mut sm-t">'+esc(s.why)+' · '+needTxt(s.ex,s.L)+'</span></div><button class="btn sm" data-a="goalAdd" data-v="'+s.ex.id+'" data-l="'+s.L+'">'+ic('plus',14)+' Fijar</button></div>').join('')+'</div>';
    else if(!act.length)h+='<p class="mut sm-t" style="margin-top:8px">Cargá alguna marca y te sugiero objetivos.</p>';
    if(done.length)h+='<p class="mut sm-t" style="margin:12px 0 6px;font-weight:700">Cumplidos</p><div class="gap">'+done.map(goalRow).join('')+'</div>';
  }
  return h+'</div>';
}
/* revisa si cumpliste algún objetivo (después de entrenar o cargar una marca) */
function checkGoals(){
  let hit=[];
  (db.goals||[]).forEach(g=>{if(g.done)return;const p=goalProg(g);if(p&&p.v>=g.L){g.done=today();hit.push(p.ex.n+' → '+lvlName(g.L));}});
  if(hit.length){save();setTimeout(()=>{confetti(60);toast('¡Objetivo cumplido! '+hit.join(', '));buzz([30,50,30,50,120]);},1200);}
}
/* ============ Logros ============ */
const ACH=[
 {id:'first',i:'flag',t:0,n:'Primer entreno',ok:s=>s.logs>=1},
 {id:'w10',i:'dumb',t:1,n:'10 entrenos',ok:s=>s.logs>=10},
 {id:'w50',i:'flame',t:3,n:'50 entrenos',ok:s=>s.logs>=50},
 {id:'w100',i:'trophy',t:5,n:'100 entrenos',ok:s=>s.logs>=100},
 {id:'s7',i:'cal',t:1,n:'Racha de 7 días',ok:s=>s.streak>=7},
 {id:'s30',i:'bolt',t:4,n:'Racha de 30 días',ok:s=>s.streak>=30},
 {id:'plata',i:'medal',t:1,n:'Primer Plata',ok:s=>s.maxL>=3},
 {id:'oro',i:'medal',t:2,n:'Primer Oro',ok:s=>s.maxL>=6},
 {id:'platino',i:'medal',t:3,n:'Primer Platino',ok:s=>s.maxL>=9},
 {id:'diamante',i:'gem',t:4,n:'Primer Diamante',ok:s=>s.maxL>=12},
 {id:'campeon',i:'shield',t:5,n:'Primer Campeón',ok:s=>s.maxL>=15},
 {id:'elite',i:'crown',t:6,n:'Élite',ok:s=>s.maxL>=18},
 {id:'all6',i:'body',t:3,n:'Rango en los 6 grupos',ok:s=>s.groups>=6},
 {id:'cali',i:'acro',t:1,n:'Primera habilidad de calistenia',ok:s=>s.sk>=1},
 {id:'mu',i:'rocket',t:3,n:'Primer muscle-up',ok:s=>!!s.has.muscleup},
 {id:'hs',i:'acro',t:4,n:'Vertical libre',ok:s=>!!s.has.freehs},
 {id:'fl',i:'lever',t:5,n:'Front lever completo',ok:s=>!!s.has.fullfl},
 {id:'pl',i:'planche',t:6,n:'Planche completa',ok:s=>!!s.has.fullpl},
 {id:'ton10',i:'weight',t:2,n:'10 toneladas movidas',ok:s=>s.vol>=1e4},
 {id:'ton100',i:'weight',t:5,n:'100 toneladas movidas',ok:s=>s.vol>=1e5},
 {id:'var20',i:'list',t:2,n:'20 ejercicios distintos',ok:s=>s.distinct>=20},
 {id:'crea30',i:'pill',t:2,n:'30 días de creatina',ok:s=>s.crea>=30},
 {id:'agua7',i:'drop',t:1,n:'7 días con el agua completa',ok:s=>s.water>=7},
 {id:'plan',i:'spark',t:3,n:'Primera rutina armada a medida',ok:s=>s.gen>=1},
 {id:'goal1',i:'flag',t:2,n:'Primer objetivo cumplido',ok:s=>s.goals>=1},
 {id:'goal5',i:'trophy',t:4,n:'5 objetivos cumplidos',ok:s=>s.goals>=5}
];
function achStats(){
  const bw=weightNow()||70,has={},ex=new Set();let vol=0;
  allSess().forEach(l=>l.entries.forEach(en=>{const e=exById(en.ex);ex.add(en.ex);if(l.test)return;en.sets.forEach(s=>{if(s.w)return;if(+s.reps>0)has[en.ex]=1;if(e&&!e.time)vol+=((e.bw||0)*bw+(+s.kg||0))*(+s.reps||0);});}));
  const r=rankedList(),wg=waterGoal();
  return{logs:db.logs.length,streak:streak(),maxL:r.reduce((m,x)=>Math.max(m,x.info.L),-1),groups:(overall()||{n:0}).n,
    sk:r.filter(x=>x.ex.sk&&x.info.L>=0).length,has,vol,distinct:ex.size,crea:Object.keys(db.creatine).length,
    water:Object.keys(db.water).filter(k=>db.water[k]>=wg).length,gen:db.routines.filter(x=>x.gen).length,goals:(db.goals||[]).filter(g=>g.done).length};
}
/* revisa logros nuevos; silent = marcarlos sin festejo (al abrir la app) */
function checkAch(silent){
  const s=achStats(),fresh=[];
  ACH.forEach(a=>{if(!db.ach[a.id]&&a.ok(s)){db.ach[a.id]=today();fresh.push(a);if(!silent)addEv({k:'ach',n:a.n});}});
  if(fresh.length){save();if(!silent){S.newAch=fresh.map(a=>a.id);setTimeout(()=>{confetti();toast((fresh.length>1?fresh.length+' logros nuevos: ':'Logro nuevo: ')+fresh.map(a=>a.n).join(', '));},350);}}
  return fresh;
}
function confetti(n){
  const ov=db.profile?overall():null,col=ov?TCOL[Math.min(6,Math.floor(ov.L/3))]:'#7A66FF';
  const c=document.createElement('div');c.className='sparks';c.setAttribute('aria-hidden','true');
  const cols=[col,'#FFFFFF','#FFE7A3'],k=Math.min(26,Math.max(12,Math.round((n||40)/2.5)));let h='<b class="spark-ring" style="--c:'+col+'"></b>';
  for(let i=0;i<k;i++){const a=i/k*Math.PI*2+Math.random()*.4,d=90+Math.random()*150,s=(3+Math.random()*4).toFixed(1);
    h+='<i style="--x:'+(Math.cos(a)*d).toFixed(0)+'px;--y:'+(Math.sin(a)*d).toFixed(0)+'px;--s:'+s+'px;--c:'+cols[i%3]+';--t:'+(1+Math.random()*.6).toFixed(2)+'s;--dl:'+(Math.random()*.15).toFixed(2)+'s"></i>';}
  c.innerHTML=h;document.body.appendChild(c);setTimeout(()=>c.remove(),2200);
}

/* medalla hexagonal del logro: color de su tier, ícono blanco adentro; gris si está bloqueado */
function achBadge(a,on){
  const c=on?TCOL[a.t||0]:'var(--muscle)';
  return '<svg class="medal" viewBox="0 0 48 52" aria-hidden="true"><path d="M24 2 44 13.5v25L24 50 4 38.5v-25z" fill="'+(on?'url(#bm'+(a.t||0)+')':c)+'"/>'+
   '<path d="M24 7 39.5 16v20L24 45 8.5 36V16z" fill="#10131E" opacity="'+(on?.55:0)+'"/><path d="M24 7 39.5 16v20L24 45 8.5 36V16z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.2"/>'+
   '<g transform="translate(12 14)" fill="none" stroke="'+(on?MET_L[a.t||0]:'#fff')+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+IC[a.i]+'</g></svg>';
}
/* ============ Vista: Niveles ============ */
function tierLegend(){return '<div class="tiers">'+TIERS.map((t,i)=>'<span><i style="background:'+TCOL[i]+'"></i>'+t+'</span>').join('')+'<span><i style="background:var(--muscle)"></i>Sin rango</span></div>';}
function viewNiveles(){
  let h='<h1 class="pg">Nivel</h1>';
  if(!db.profile)return h+'<div class="card empty">'+emptyArt()+'<b>Completá tu perfil</b>Necesito sexo, edad y peso para calcular tus niveles.<button class="btn pri e-cta" data-a="tab" data-v="perfil">Completar perfil</button></div>';
  const r=rankedList(),ov=overall(),ml=muscleLevels();
  h+=caminosCard();
  h+='<button class="gen-cta soc-cta" data-a="socOpen"><span class="gen-ic">'+ic('user',22)+'</span><span class="grow"><b>Amigos</b><span>'+(Social.on()?(S.social&&S.social.friends.length?S.social.friends.length+(S.social.friends.length===1?' amigo':' amigos')+' · ranking y temporada':'Invitá a tus amigos con tu código'):'Rankings justos y una temporada por mes')+'</span></span>'+ic('right',18)+'</button>';
  h+='<button class="gen-cta mark-cta" data-a="markOpen"><span class="gen-ic">'+ic('bolt',22)+'</span><span class="grow"><b>Cargar marca</b><span>Poné tu peso y reps, y mirá tu nivel al instante</span></span>'+ic('right',18)+'</button>';
  /* rango de cada grupo muscular */
  const gl=groupLevels();
  h+='<div class="card"><div class="hd"><div><h3>Por grupo muscular</h3><span class="mut sm-t">Manda tu mejor ejercicio de cada grupo; los demás ajustan poco. El general pesa más piernas y espalda.</span></div></div><div class="glist">'+
   Object.keys(GROUPS).map(g=>{const x=gl[g],L=x?Math.min(18,Math.floor(x.v)):-1;return '<div class="grow-row">'+badge(x?L:-1,40)+'<div class="grow"><div class="row" style="justify-content:space-between"><b>'+g+'</b>'+(x?lvlSpan(L):'<span class="mut sm-t">Sin datos</span>')+'</div>'+
    '<div class="bar" style="margin:6px 0 3px"><i style="width:'+(x?Math.round((L>=18?1:x.v-L)*100):0)+'%;background:'+lvlColor(L)+'"></i></div>'+(x?'<span class="g-used"><span class="mut sm-t">Según </span>'+x.used.map(e=>'<button class="chip sm" data-a="exInfo" data-v="'+e.id+'">'+esc(e.n)+'</button>').join('')+'</span>':'<span class="mut sm-t">Cargá un ejercicio de '+g.toLowerCase()+' para ver tu rango</span>')+'</div></div>';}).join('')+'</div></div>';
  {const zl=zoneLevels();if(Object.values(zl).some(v=>v!=null))h+='<div class="card"><div class="hd"><div><h3>Por zona</h3><span class="mut sm-t">Tren superior, inferior y core</span></div></div><div class="zones">'+
    Object.keys(zl).map(z=>{const v=zl[z],L=v==null?-1:Math.min(18,Math.floor(v));return '<div class="zone">'+badge(L,46)+'<b>'+z+'</b>'+(v==null?'<span class="mut sm-t">Sin datos</span>':lvlSpan(L))+'</div>';}).join('')+'</div></div>';}
  h+=goalsCard(false)+improveCard()+recordsCard()+heatCard();
  /* tu carta */
  h+='<div class="card carta-card">'+cartaHTML(false)+'<div class="carta-side"><h3>Tu carta</h3><p class="mut sm-t">'+(cardStats().OVR==null?'Todavía está vacía: cargá marcas o entrená para que se llene con tus números reales.':'Tu rango, tu cuerpo y 6 atributos del 40 al 99. Movela con el dedo.')+'</p>'+
   '<div class="attr-list">'+(()=>{const s=cardStats();return ATTRS.map(([k,n])=>'<div><span>'+n+'</span><b>'+(s[k]==null?'--':s[k])+'</b><i style="width:'+(s[k]==null?0:Math.round((s[k]-40)/59*100))+'%"></i></div>').join('');})()+'</div>'+
   '<div class="row" style="margin-top:12px;gap:8px"><button class="btn pri sm grow" data-a="cardOpen">Ver grande</button><button class="btn sm grow" data-a="cardShare">Compartir</button></div></div></div>';
  /* el cuerpo pintado por nivel */
  h+='<div class="card" style="padding-bottom:18px"><div class="hd"><div><h3>Tu cuerpo</h3><span class="mut sm-t">Cada músculo con el color de su mejor ejercicio. Tocá uno.</span></div>'+(ov?badge(ov.L,48):'')+'</div>'+
   '<div class="body-hero">'+bodyMap(null,{levels:ml,labels:1,cls:'live',tap:1})+'</div>'+tierLegend()+
   (ov?'<p class="tc" style="margin-top:12px"><span class="mut sm-t">Rango general </span>'+lvlSpan(ov.L)+'</p>':'')+'</div>';
  if(!r.length){
    h+='<div class="card empty">'+emptyArt()+'<b>Todavía no hay series registradas</b>Cargá una marca y ves tu nivel al instante, o entrená y se calcula solo.<div class="g2 e-cta"><button class="btn pri" data-a="markOpen">Cargar una marca</button><button class="btn" data-a="startFree">Entrenar ahora</button></div></div>';
  }else{
    h+='<h3 style="font:800 19px var(--f-d);margin:22px 0 10px">Tus ejercicios</h3><div class="gap" style="margin-bottom:14px">'+r.map(x=>{
      const i=x.info;
      return '<button class="ex" data-a="exInfo" data-v="'+x.ex.id+'" style="align-items:flex-start">'+badge(i.L,52)+'<span class="grow"><h4>'+esc(x.ex.n)+'</h4><span class="sm-t">'+lvlSpan(i.L)+'<span class="mut"> · '+bestTxt(x.ex,x.b)+'</span></span>'+
       '<div class="bar" style="margin:8px 0 4px"><i style="width:'+Math.round(clamp(i.pct,0,1)*100)+'%;background:'+lvlColor(i.L)+'"></i></div>'+
       '<span class="mut sm-t">'+(i.next==null?'Nivel máximo alcanzado':'Para '+lvlName(i.next||0)+': '+needTxt(x.ex,i.next||0))+'</span>'+(x.ex.st||REPS[x.ex.id]?pctLine(pctStronger(x.ex,x.b.e)):'')+'</span></button>';
    }).join('')+'</div>';
  }
  /* calistenia: progresiones */
  h+='<div class="card"><div class="hd"><div><h3>Calistenia</h3><span class="mut sm-t">Tu nivel sale de la variante que dominás, no de los kilos.</span></div><button class="btn sm" data-a="treeOpen">'+ic('tree',16)+' Árbol</button></div><div class="gap">'+
   Object.keys(SKFAM).map(f=>{
     const vs=skFam(f);let best=-1,bestEx=null;
     vs.forEach(e=>{const b=bestE1(e.id);if(b){const v=levelVal(e,b.e);if(v>best){best=v;bestEx=e;}}});
     const L=best<0?-1:Math.min(18,Math.floor(best));
     const nx=vs.find(e=>e.sk.b>(bestEx?bestEx.sk.b:-1));
     return '<div class="row">'+badge(L,38)+'<div class="grow"><b>'+SKFAM[f]+'</b><br><span class="sm-t">'+(bestEx?lvlSpan(L)+'<span class="mut"> · '+esc(bestEx.n)+'</span>':'<span class="mut">Empezá con '+esc(vs[0].n)+'</span>')+'</span>'+
      (nx&&bestEx?'<br><span class="mut sm-t">Siguiente: '+esc(nx.n)+' ('+lvlName(nx.sk.b)+')</span>':'')+'</div><button class="ib flat" data-a="exInfo" data-v="'+(nx||bestEx||vs[0]).id+'" aria-label="Ver '+esc(SKFAM[f])+'">'+ic('right',18)+'</button></div>';
   }).join('')+'</div></div>';
  /* logros */
  const got=ACH.filter(a=>db.ach[a.id]).length,nw=S.newAch||[];
  h+='<div class="card"><div class="hd"><h3>Logros</h3><span class="tag">'+got+' de '+ACH.length+'</span></div><div class="ach">'+
   ACH.map(a=>'<div class="'+(db.ach[a.id]?(nw.includes(a.id)?'new':''):'off')+'" title="'+esc(a.n)+(db.ach[a.id]?' · '+esc(longDate(db.ach[a.id])):'')+'">'+achBadge(a,!!db.ach[a.id])+'<span>'+esc(a.n)+'</span></div>').join('')+'</div></div>';
  S.newAch=null;
  const prs=[];
  db.logs.slice().sort((a,b)=>a.date<b.date?1:-1).forEach(l=>(l.prs||[]).forEach(id=>{const ex=exById(id);if(ex&&prs.length<5)prs.push({ex,l});}));
  if(prs.length)h+='<div class="card"><h3 style="margin-bottom:6px">Récords recientes</h3>'+prs.map(p=>'<div class="rowline"><span>'+esc(p.ex.n)+'</span><span class="mut">'+shortDate(parseK(p.l.date).getTime())+'</span></div>').join('')+'</div>';
  h+='<div class="card"><h3 style="margin-bottom:8px">Cómo se calcula</h3><p class="mut sm-t">En pesas estimo tu 1RM (la fuerza máxima en una repetición) y lo comparo con una tabla de cada ejercicio que depende de tu peso, tu edad y tu sexo: Bronce 1 es un principiante, Oro 1 alguien intermedio (por ejemplo, press banca con tu propio peso) y Élite es nivel de competencia. En calistenia cuenta la variante que dominás y cuántas repeticiones o segundos hacés, así no te comparan con los kilos de nadie. Tu rango general toma tu mejor ejercicio de cada grupo muscular y los promedia: probar uno nuevo nunca te baja.</p></div>';
  return h;
}

/* ============ Vista: Nutrición ============ */
function viewNutri(){
  const p=db.profile;
  let h='<h1 class="pg">Nutrición</h1>';
  if(!p)return h+'<div class="card empty">'+emptyArt()+'<b>Completá tu perfil</b>Con tus datos calculo tus calorías y proteína.<button class="btn pri e-cta" data-a="tab" data-v="perfil">Completar perfil</button></div>';
  const n=nutri(p),t=today();
  h+=mealsCard(n);
  h+='<div class="card"><div class="hd"><h3>Tu objetivo</h3></div><div class="seg">'+Object.keys(GOALS).map(k=>'<button class="'+(p.goal===k?'on':'')+'" data-a="goal" data-v="'+k+'">'+GOALS[k]+'</button>').join('')+'</div>'+
   '<div class="field" style="margin-top:12px"><span>Actividad física</span><select data-a="act" aria-label="Actividad física"><option value="auto"'+(n.af.auto?' selected':'')+'>Automática: según lo que entrenás y tus deportes</option>'+ACT.map((a,i)=>'<option value="'+i+'"'+(!n.af.auto&&p.activity===i?' selected':'')+'>'+a.l+'</option>').join('')+'</select></div>'+
   (n.af.auto?(()=>{const wl=weeklyLoad();return '<p class="mut sm-t" style="margin-top:6px">Esta semana cuento '+num(wl.gym,1)+' de entreno, '+wl.prac+' práctica'+(wl.prac===1?'':'s')+' y '+wl.match+' partido'+(wl.match===1?'':'s')+'.</p>';})():'')+
   '<div class="div"></div><div class="big-n">'+nf(n.kcal)+'<span class="mut" style="font:700 18px var(--f-b);letter-spacing:0"> kcal al día</span></div>'+
   '<p class="mut sm-t" style="margin:6px 0 16px">Mantenimiento estimado: '+nf(n.tdee)+' kcal</p>'+
   (n.ad?'<div class="goal'+(n.ad.kcal?'':' hit')+'" style="margin:0 0 14px"><span class="grow"><span class="mut sm-t">Ajuste por tu peso ('+n.ad.trend.days+' días, '+n.ad.trend.n+' registros)</span><br><b>'+(n.ad.kcal>0?'+':'')+n.ad.kcal+' kcal</b> <span class="mut sm-t">· vas '+(n.ad.trend.perWeek>=0?'+':'')+num(n.ad.trend.perWeek,2)+' kg/sem, la meta es '+(n.ad.target>=0?'+':'')+num(n.ad.target,2)+'</span></span>'+ic('weight',22)+'</div>'
    :'<p class="mut sm-t" style="margin:-8px 0 14px">Cargá tu peso 1 o 2 veces por semana: con 2 semanas de datos ajusto las calorías solo.</p>')+'<div class="gap">'+
   macro('Proteína',n.prot,'#',n.prot*4,n.kcal)+macro('Carbohidratos',n.carbs,'#',n.carbs*4,n.kcal)+macro('Grasas',n.fat,'#',n.fat*9,n.kcal)+'</div>'+
   (p.age<18?'<div class="warn" style="margin-top:14px">Si tenés menos de 18 años, el cuerpo todavía está creciendo: un déficit fuerte no es recomendable. Consultalo con un profesional antes de hacer cut.</div>':'')+
   (p.goal==='cut'&&n.kcal<=Math.round(n.bmr/10)*10?'<div class="warn" style="margin-top:14px">Las calorías quedaron en tu metabolismo basal: no conviene bajar de ahí.</div>':'')+
   '<details class="why"><summary>¿De dónde sale esto?</summary><div class="mut sm-t">'+
   '<p><b>Metabolismo basal:</b> '+nf(n.bmr)+' kcal (fórmula Mifflin-St Jeor, con tu peso, altura, edad y sexo).</p>'+
   '<p><b>Actividad:</b> × '+num(n.af.f,3)+(n.af.auto?' calculado con tus entrenos de las últimas 4 semanas, tus prácticas y tus partidos (un partido cuenta 1,5).':' elegido a mano.')+'</p>'+
   '<p><b>Objetivo:</b> '+(n.adjPct>0?'+':'')+Math.round(n.adjPct*100)+' % sobre el mantenimiento'+(p.goal==='cut'&&p.age<18?' (más suave por ser menor de 18)':'')+'.</p>'+
   (n.ad?'<p><b>Ajuste por tu peso:</b> '+(n.ad.kcal>0?'+':'')+n.ad.kcal+' kcal. Si tu peso se mueve más lento o más rápido que la meta, se corrige (máximo ±300).</p>':'')+
   '<p><b>Proteína:</b> '+num(n.prot/p.weight,1)+' g por kg (la evidencia recomienda 1,6 a 2,2; más alta en definición para cuidar el músculo). <b>Grasas:</b> ~0,9 g por kg. <b>Carbohidratos:</b> el resto, que es tu combustible para entrenar.</p>'+
   '<p>Es una guía, no una dieta médica.</p></div></details></div>';
  /* peso */
  const ws=db.weights.slice().sort((a,b)=>a.date<b.date?-1:1),last=ws[ws.length-1],first=ws.length>1?ws[0]:null;
  h+='<div class="card"><div class="hd"><h3>Peso corporal</h3><span class="mut sm-t">'+(last?num(last.kg,1)+' kg':num(p.weight,1)+' kg')+(first?', '+(last.kg-first.kg>=0?'+':'')+num(last.kg-first.kg,1)+' kg total':'')+'</span></div>'+
   chart(ws.map(w=>({t:parseK(w.date).getTime(),y:w.kg})),'kg',wTrend(ws))+(()=>{const tr=wTrend(ws);if(tr.length<2)return '';const a=tr[0],b=tr[tr.length-1],wk=(b.t-a.t)/(7*864e5);if(wk<1)return '';const r=(b.y-a.y)/wk;
     return '<p class="w-trend">'+ic(r<-.05?'down':r>.05?'up':'right',14)+' Tendencia: <b>'+(r>0?'+':'')+num(r,2)+' kg por semana</b> <span class="mut sm-t">(promedio que suaviza los días de más o menos agua)</span></p>';})()+
   '<div class="w-row"><div class="field" style="margin:0"><input id="wIn" type="number" inputmode="decimal" step="0.1" min="30" max="250" placeholder="Peso en kg" aria-label="Peso"></div>'+
   '<div class="field" style="margin:0"><input id="wDate" type="date" max="'+t+'" value="'+t+'" aria-label="Fecha del peso"></div><button class="btn pri" data-a="addW">Guardar</button></div>'+
   (ws.length?'<div class="wlist">'+ws.slice().reverse().slice(0,S.wAll?999:6).map(w=>'<div class="rowline"><span>'+esc(longDate(w.date))+'</span><span class="row" style="gap:6px"><b>'+num(w.kg,1)+' kg</b><button class="ib flat" style="width:32px;height:32px" data-a="editW" data-v="'+w.date+'" aria-label="Corregir">'+ic('edit',15)+'</button><button class="ib flat" style="width:32px;height:32px" data-a="delW" data-v="'+w.date+'" aria-label="Borrar">'+ic('trash',15)+'</button></span></div>').join('')+'</div>'+
   (ws.length>6?'<button class="btn sm line wide" style="margin-top:8px" data-a="wAll">'+(S.wAll?'Ver menos':'Ver los '+ws.length+' registros')+'</button>':''):'')+'</div>';
  h+=measCard()+photoCard();
  /* creatina */
  const cm=S.crM,cnt=Object.keys(db.creatine).filter(k=>k.startsWith(cm.getFullYear()+'-'+pad(cm.getMonth()+1))).length;
  const rm=db.settings.remind;
  h+='<div class="card"><div class="hd"><h3>Creatina</h3><span class="mut sm-t">'+cnt+' '+(cnt===1?'día':'días')+' este mes</span></div>'+monthNav(cm,'crMove')+
   monthGrid(cm,(dk,d)=>'<button class="day'+(db.creatine[dk]?' ck':'')+(dk===t?' td':'')+'" data-a="creaToggle" data-v="'+dk+'" aria-pressed="'+(!!db.creatine[dk])+'" aria-label="'+esc(longDate(dk))+'">'+d+'</button>')+
   '<div class="div"></div><div class="row"><div class="grow"><b>Recordatorio diario</b><br><span class="mut sm-t">Funciona mientras Swole esté abierta</span></div><button class="chip '+(rm.on?'on':'')+'" data-a="remind" aria-pressed="'+rm.on+'">'+(rm.on?'Activado':'Desactivado')+'</button></div>'+
   '<div class="row" style="margin-top:10px"><div class="field grow" style="margin:0"><input id="rTime" type="time" value="'+rm.time+'" aria-label="Hora del recordatorio"></div><button class="btn sm" data-a="remindTime">Guardar hora</button></div></div>';
  /* agua */
  const wa=db.water[t]||0,wg=waterGoal();
  h+='<div class="card"><div class="hd"><h3>Agua de hoy</h3><span class="mut sm-t">'+wa+' de '+wg+' vasos de 250 ml</span></div><div class="glasses" style="margin-bottom:12px">'+Array.from({length:Math.max(wg,wa)},(_,i)=>'<span class="glass'+(i<wa?' f':'')+'"></span>').join('')+'</div><div class="row"><button class="btn sm grow" data-a="water" data-v="-1" aria-label="Quitar un vaso">'+ic('minus',18)+'</button><button class="btn pri sm grow" data-a="water" data-v="1">'+ic('plus',18)+' Vaso</button></div></div>';
  return h;
}
function macro(name,g,_,kcal,total){
  const pc=total?Math.round(kcal/total*100):0;
  return '<div class="macro"><div class="row"><b class="grow">'+name+'</b><span><b>'+g+' g</b> <span class="mut sm-t">'+pc+'% de las kcal</span></span></div><div class="bar"><i style="width:'+pc+'%"></i></div></div>';
}

/* ============ Sesión de entrenamiento ============ */
function mkEntry(id,n,reps,warm){
  const ls=(lastSets(id)||[]).filter(s=>!s.w),sets=[];
  /* series de calentamiento: ~50% y ~70% del peso de trabajo, no cuentan para el volumen */
  if(warm){const l0=ls[0]&&+ls[0].kg;[[.5,10],[.7,5]].slice(0,warm).forEach(x=>sets.push({kg:l0?Math.max(0,Math.round(l0*x[0]/2.5)*2.5):'',reps:x[1],done:false,w:1}));}
  for(let i=0;i<n;i++){const l=ls.length?(ls[i]||ls[ls.length-1]):null;sets.push({kg:l&&l.kg?l.kg:'',reps:reps,done:false});}
  return{ex:id,sets,note:''};
}
function startSession(rid,dk,adhoc){
  if(db.active){S.sessOpen=true;render();toast('Ya tenés un entrenamiento en curso');return;}
  if(dk&&dk>today()){toast('No podés registrar un entrenamiento en un día que todavía no llegó');return;}
  const r=adhoc||(rid?db.routines.find(x=>x.id===rid):null);
  /* rutina de habilidad: se recalcula con tu progreso de hoy */
  if(r&&r.skill&&!adhoc){const sp=skillPlan(r.skill);if(sp)r.items=sp.items;}
  if(r&&r.rest)db.settings.rest=r.rest;
  const bw=adhoc||(r&&r.pl)?null:blockWeek(r);
  const its=(r?r.items:[]).map(it=>bw&&bw.deload?Object.assign({},it,{sets:Math.max(2,Math.round(it.sets*.6))}):it);
  db.active={id:uid(),date:dk||today(),routineId:r&&!adhoc?r.id:null,name:r?r.name+(bw&&bw.deload?' · descarga':''):'Entrenamiento libre',t0:Date.now(),note:'',entries:its.map(it=>mkEntry(it.ex,it.sets,it.reps,it.warm))};
  if(r&&r.pl&&!adhoc)plApply(r,db.active);
  if(r&&r.p531&&!adhoc)apply531(r,db.active);
  /* si dormiste mal: un poco menos de peso y una serie menos; si dormiste bárbaro, a buscar récord */
  const sl=(db.settings.sleep||{})[db.active.date];
  if(sl&&sl<=2&&!(bw&&bw.deload)&&r){db.active.tired=1;db.active.entries.forEach(en=>{en.goal=null;const eff=en.sets.filter(s=>!s.w);if(eff.length>2)en.sets.splice(en.sets.lastIndexOf(eff[eff.length-1]),1);en.sets.forEach(s=>{if(+s.kg)s.kg=Math.round(+s.kg*.9/2.5)*2.5;});});
    setTimeout(()=>toast('Dormiste mal: hoy bajé un 10 % el peso y una serie por ejercicio. Venir ya suma.'),400);}
  else if(sl===5)setTimeout(()=>toast('Dormiste bárbaro: buen día para ir por un récord'),400);
  /* semana de descarga: ~90 % del peso y sin meta de subir */
  if(bw&&bw.deload){db.active.deload=1;db.active.entries.forEach(en=>{en.goal=null;en.sets.forEach(s=>{if(+s.kg)s.kg=Math.round(+s.kg*.9/2.5)*2.5;});});setTimeout(()=>toast('Semana de descarga: menos series y un poco menos de peso para recuperar'),400);}
  save();S.sessOpen=true;render();
}
const isBarbell=ex=>/^Barra( Z)?$/.test(ex.eq);
/* cuánto sube cada toque: mancuernas de a 1 kg, barra y máquinas de a 2,5 */
const kgStep=ex=>ex.ph||/Mancuerna|Pesa rusa|Kettlebell/.test(ex.eq)?1:/Máquina/.test(ex.eq)?5:2.5;
/* atajos para la serie que toca: repetir la anterior o lo que hiciste la última vez en esa serie */
function quickSet(en,ex,i,j){
  const s=en.sets[j],p=en.sets[j-1],ls=lastSets(en.ex),l=ls&&ls.filter(x=>!x.w)[en.sets.slice(0,j).filter(x=>!x.w).length],b=[];
  const same=a=>a&&(ex.time||String(+a.kg||0)===String(+s.kg||0))&&String(a.reps)===String(s.reps);
  if(p&&p.done&&!same(p))b.push('<button data-a="setCopy" data-e="'+i+'" data-s="'+j+'" data-v="prev">Igual a la anterior</button>');
  if(l&&!s.w&&!same(l))b.push('<button data-a="setCopy" data-e="'+i+'" data-s="'+j+'" data-v="last">Última vez: '+esc(setTxt(ex,l))+'</button>');
  return b.length?'<div class="stepr q">'+b.join('')+'</div>':'';
}
const kgLbl=ex=>ex.ph?'kg c/mano':ex.bw||ex.sk?'kg extra':'kg';
const setTxt=(ex,s)=>(s.w?'C ':'')+(ex.time?s.reps+' s':(s.kg?num(s.kg,1)+' kg'+(ex.ph?' c/u':'')+' × '+s.reps:s.reps+' reps'));
function entryHTML(en,i){
  const ex=exById(en.ex);if(!ex)return '';
  const n=db.active.entries.length;
  const ls=lastSets(en.ex);
  const prev=ls?'<p class="mut sm-t" style="margin-top:6px">Última vez: '+ls.map(s=>setTxt(ex,s)).join(', ')+'</p>':'';
  if(en.goal===undefined)en.goal=goalFor(en.ex);
  const g=en.goal,goal=g?'<div class="goal'+(en.hit?' hit':'')+'"><span class="grow"><span class="mut sm-t">'+(en.hit?'¡Meta cumplida!':'Meta de hoy · '+esc(g.why))+'</span><br><b>'+goalTxt(ex,g)+'</b></span>'+(en.hit?ic('check',22):'<button class="btn sm" data-a="goalUse" data-e="'+i+'">Usar</button>')+'</div>':'';
  const ssPrev=i>0&&db.active.entries[i-1].ss,ssNext=en.ss&&i<n-1;
  const aj=en.sets.findIndex(s=>!s.done),inc=kgStep(ex);
  const rows=en.sets.map((s,j)=>'<div class="set'+(s.done?' done':'')+(s.w?' warm':'')+(S.justDone===i+':'+j?' just':'')+'">'+
    '<button class="sn" data-a="setW" data-e="'+i+'" data-s="'+j+'" aria-pressed="'+!!s.w+'" aria-label="'+(s.w?'Serie de calentamiento: tocá para hacerla efectiva':'Marcar serie '+(j+1)+' como calentamiento')+'">'+(s.w?'C':(j+1-en.sets.slice(0,j).filter(x=>x.w).length))+'</button>'+
    (ex.time?'<span></span>':'<label><input class="num" type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(s.kg)+'" data-i="set" data-e="'+i+'" data-s="'+j+'" data-f="kg" aria-label="Peso de la serie '+(j+1)+'"><small>'+kgLbl(ex)+'</small></label>')+
    '<label><input class="num" type="number" inputmode="numeric" min="0" value="'+esc(s.reps)+'" data-i="set" data-e="'+i+'" data-s="'+j+'" data-f="reps" aria-label="Repeticiones de la serie '+(j+1)+'"><small>'+(ex.time?'segundos':'reps')+'</small></label>'+
    '<button class="chk" data-a="setDone" data-e="'+i+'" data-s="'+j+'" aria-pressed="'+s.done+'" aria-label="Marcar serie '+(j+1)+'">'+ic('check',22)+'</button></div>'+
    (S.rirAsk===i+':'+j&&s.done&&!s.w?'<div class="rir"><span>¿Cuántas más podías?</span>'+[0,1,2,3].map(v=>'<button data-a="rirSet" data-e="'+i+'" data-s="'+j+'" data-v="'+v+'">'+(v===3?'3+':v)+'</button>').join('')+'</div>':'')+
    (j===aj?'<div class="stepr">'+(ex.time?'':'<button data-a="stepKg" data-e="'+i+'" data-s="'+j+'" data-v="-'+inc+'">−'+num(inc,2)+' kg</button><button data-a="stepKg" data-e="'+i+'" data-s="'+j+'" data-v="'+inc+'">+'+num(inc,2)+' kg</button><i></i>')+
      '<button data-a="stepRep" data-e="'+i+'" data-s="'+j+'" data-v="-'+(ex.time?5:1)+'">−'+(ex.time?'5 s':'1')+'</button><button data-a="stepRep" data-e="'+i+'" data-s="'+j+'" data-v="'+(ex.time?5:1)+'">+'+(ex.time?'5 s':'1 rep')+'</button></div>'+quickSet(en,ex,i,j):'')).join('');
  return (ssNext&&!ssPrev?'<p class="ss-tag">'+ic('swap',14)+' Superserie</p>':'')+'<div class="card entry'+(ssNext?' ss-a':'')+(ssPrev?' ss-b':'')+'" data-di="'+i+'" data-lp="'+i+'"><div class="row"><span class="dh" role="button" aria-label="Arrastrar '+esc(ex.n)+' para cambiarlo de lugar">'+ic('list',18)+'</span>'+miniMap(mapOf(ex)).replace('mini','mini" style="width:52px')+'<button class="grow" style="text-align:left" data-a="exInfo" data-v="'+ex.id+'"><h3 style="font-size:17px">'+esc(ex.n)+'</h3><span class="mut sm-t">'+esc(ex.eq)+'</span></button>'+
   '<button class="ib flat" data-a="replEx" data-e="'+i+'" aria-label="Cambiar por otro ejercicio">'+ic('swap',18)+'</button>'+
   (i<n-1?'<button class="ib flat'+(en.ss?' on-ss':'')+'" data-a="ssTog" data-e="'+i+'" aria-pressed="'+!!en.ss+'" aria-label="Superserie con el siguiente">'+ic('link',18)+'</button>':'')+
   '<button class="ib flat" data-a="delEntry" data-e="'+i+'" aria-label="Quitar ejercicio">'+ic('trash',18)+'</button></div>'+prev+
   goal+'<div class="sets">'+rows+'</div>'+
   '<div class="field" style="margin-top:10px"><input type="text" maxlength="120" placeholder="Nota (agarre, máquina, cómo te sentiste…)" value="'+esc(en.note||'')+'" data-i="enote" data-e="'+i+'" aria-label="Nota del ejercicio" style="padding:9px 12px;font-size:14px"></div>'+
   '<div class="row" style="margin-top:10px"><button class="btn sm grow" data-a="addSet" data-e="'+i+'">'+ic('plus',16)+' Serie</button><button class="btn sm grow" data-a="delSet" data-e="'+i+'">'+ic('minus',16)+' Serie</button>'+
   (isBarbell(ex)?'<button class="btn sm" data-a="plates" data-e="'+i+'" aria-label="Calculadora de discos">'+ic('disc',16)+'</button>':'')+'</div></div>';
}
/* ============ Música: abrir tu app de música y, si conectás Spotify, manejarla desde el entreno ============
   Spotify (2026): las apps en "modo desarrollo" solo pueden usarlo hasta 5 cuentas con Premium que el dueño agrega a mano.
   Para activarlo, poné acá el Client ID de la app que creaste en developer.spotify.com (no es secreto). */
const SPOTIFY_CLIENT_ID='';
const SP_SCOPES='user-read-playback-state user-modify-playback-state user-read-currently-playing';
const MUSIC_APPS=[['spotify','Spotify','https://open.spotify.com/'],['ytm','YouTube Music','https://music.youtube.com/'],['apple','Apple Music','https://music.apple.com/']];
const Music=(()=>{
  let tok=null,now=null,timer=0,busy=false;
  try{tok=JSON.parse(localStorage.getItem('swole.sp')||'null');}catch(e){}
  const keep=()=>{try{tok?localStorage.setItem('swole.sp',JSON.stringify(tok)):localStorage.removeItem('swole.sp');}catch(e){}};
  const redirect=()=>location.origin+location.pathname;
  const b64u=buf=>btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  async function connect(){
    if(!SPOTIFY_CLIENT_ID)return toast('Spotify todavía no está activado en Swole');
    const v=b64u(crypto.getRandomValues(new Uint8Array(48))),ch=b64u(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(v))),st='sp_'+b64u(crypto.getRandomValues(new Uint8Array(12)));
    try{sessionStorage.setItem('swole.spv',JSON.stringify({v,st}));}catch(e){}
    location.href='https://accounts.spotify.com/authorize?'+new URLSearchParams({client_id:SPOTIFY_CLIENT_ID,response_type:'code',redirect_uri:redirect(),code_challenge_method:'S256',code_challenge:ch,scope:SP_SCOPES,state:st});
  }
  async function token(body){
    const r=await fetch('https://accounts.spotify.com/api/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(Object.assign({client_id:SPOTIFY_CLIENT_ID},body))});
    const j=await r.json();if(!r.ok)throw new Error(j.error_description||j.error||'token');
    tok={a:j.access_token,r:j.refresh_token||(tok&&tok.r),exp:Date.now()+(j.expires_in-60)*1000};keep();
  }
  /* volviste de Spotify con ?code=...&state=sp_... */
  async function fromLink(){
    const q=new URLSearchParams(location.search),code=q.get('code'),st=q.get('state');
    if(!code||!st||!st.startsWith('sp_'))return;
    history.replaceState(null,'',location.pathname+location.hash);
    let s=null;try{s=JSON.parse(sessionStorage.getItem('swole.spv')||'null');sessionStorage.removeItem('swole.spv');}catch(e){}
    if(!s||s.st!==st)return toast('No se pudo conectar Spotify: probá de nuevo');
    try{await token({grant_type:'authorization_code',code,redirect_uri:redirect(),code_verifier:s.v});toast('Spotify conectado');if(db.active){S.sessOpen=true;render();}poll();}
    catch(e){toast(/user may not be registered|not registered/i.test(e.message)?'Tu cuenta de Spotify no está habilitada en Swole (Spotify limita a 5 cuentas)':'No se pudo conectar Spotify');}
  }
  async function api(path,method){
    if(!tok)throw new Error('off');
    if(Date.now()>tok.exp){try{await token({grant_type:'refresh_token',refresh_token:tok.r});}catch(e){tok=null;keep();throw e;}}
    const r=await fetch('https://api.spotify.com/v1/me/player'+path,{method:method||'GET',headers:{Authorization:'Bearer '+tok.a}});
    if(r.status===401){tok.exp=0;keep();throw new Error('401');}
    if(r.status===204||r.status===202)return null;
    const j=await r.json().catch(()=>null);if(!r.ok){const e=new Error(j&&j.error&&j.error.reason||String(r.status));e.status=r.status;throw e;}
    return j;
  }
  async function refresh(){
    if(!tok)return;
    try{const j=await api('/currently-playing');const it=j&&j.item;
      now=it?{n:it.name,a:(it.artists||[]).map(x=>x.name).join(', ')||(it.show&&it.show.name)||'',img:((it.album||it).images||[]).slice(-1)[0]?.url||'',on:!!j.is_playing}:{none:1};}
    catch(e){now={err:1};}
    const el=document.getElementById('musicBar');if(el)el.outerHTML=musicHTML();
  }
  function poll(){clearInterval(timer);if(!tok)return;refresh();timer=setInterval(()=>{if(db.active&&S.sessOpen&&document.visibilityState==='visible')refresh();},8000);}
  async function ctl(what){
    if(busy)return;busy=true;
    try{
      if(what==='toggle')await api(now&&now.on?'/pause':'/play','PUT');
      else await api('/'+what,'POST');
      if(now&&what==='toggle')now.on=!now.on;
      const el=document.getElementById('musicBar');if(el)el.outerHTML=musicHTML();
      setTimeout(refresh,450);
    }catch(e){toast(e.status===404||/NO_ACTIVE_DEVICE/.test(e.message)?'Abrí Spotify y poné algo: después lo manejás desde acá':e.status===403?'Para manejar la música, Spotify pide Premium':'No pude hablar con Spotify');}
    busy=false;
  }
  function off(){tok=null;now=null;keep();clearInterval(timer);}
  return{connect,fromLink,refresh,poll,ctl,off,on:()=>!!tok,now:()=>now,ready:()=>!!SPOTIFY_CLIENT_ID};
})();
function musicHTML(){
  const on=Music.on(),n=Music.now(),app=db.settings.musicApp||'';
  if(on&&n&&n.n)return '<div class="mus on" id="musicBar">'+(n.img?'<img src="'+esc(n.img)+'" alt="">':'<span class="mus-i">'+ic('music',18)+'</span>')+'<span class="grow mus-t"><b>'+esc(n.n)+'</b><small>'+esc(n.a)+'</small></span>'+
    '<button class="ib flat" data-a="musCtl" data-v="previous" aria-label="Anterior">'+ic('prev',20)+'</button><button class="ib mus-pp" data-a="musCtl" data-v="toggle" aria-label="'+(n.on?'Pausa':'Play')+'">'+ic(n.on?'pause':'play',20)+'</button><button class="ib flat" data-a="musCtl" data-v="next" aria-label="Siguiente">'+ic('next',20)+'</button></div>';
  if(on)return '<div class="mus" id="musicBar"><span class="mus-i">'+ic('music',18)+'</span><span class="grow mus-t"><b>Spotify conectado</b><small>'+(n&&n.err?'No pude leer qué suena':'Poné algo en Spotify y lo manejás desde acá')+'</small></span><a class="btn sm" href="https://open.spotify.com/" target="_blank" rel="noopener">Abrir</a></div>';
  const a=MUSIC_APPS.find(x=>x[0]===app);
  return '<div class="mus" id="musicBar"><span class="mus-i">'+ic('music',18)+'</span>'+
   (a?'<span class="grow mus-t"><b>Tu música</b><small>'+a[1]+'</small></span><a class="btn sm" href="'+a[2]+'" target="_blank" rel="noopener">Abrir</a><button class="ib flat" data-a="musPick" aria-label="Cambiar app">'+ic('edit',15)+'</button>'
     :'<span class="grow mus-t"><b>Música</b><small>Abrí tu app sin salir del entreno</small></span><button class="btn sm" data-a="musPick">Elegir</button>')+'</div>';
}
function musicPickHTML(){
  const cur=db.settings.musicApp||'';
  return '<p class="mut sm-t">Elegí con qué escuchás música. En el entreno vas a tener un botón para abrirla al toque.</p><div class="gap">'+
   MUSIC_APPS.map(([k,n])=>'<button class="fd-row'+(cur===k?' on':'')+'" data-a="musSet" data-v="'+k+'"><span class="grow"><b>'+n+'</b></span>'+(cur===k?ic('check',18):'')+'</button>').join('')+'</div>'+
   (Music.ready()?'<div class="card" style="margin:14px 0 0"><h4 style="margin-bottom:4px">Manejar Spotify desde el entreno</h4><p class="mut sm-t">Ves qué suena y tenés play, pausa y siguiente sin salir de Swole. Necesita Spotify Premium.</p>'+
     (Music.on()?'<button class="btn line wide" data-a="musOff">Desconectar Spotify</button>':'<button class="btn pri wide" data-a="musConnect">Conectar Spotify</button>')+'</div>':'');
}
/* modo grande: una serie a la vez, botones enormes para usar con las manos transpiradas */
function bigCur(){const a=db.active,E=a.entries;if(S.bigE!=null&&E[S.bigE])return S.bigE;const i=E.findIndex(en=>en.sets.some(s=>!s.done));return i<0?E.length-1:i;}
function bigHTML(){
  const a=db.active,E=a.entries;if(!E.length)return '';
  const ci=bigCur(),en=E[ci],ex=exById(en.ex);if(!ex)return '';
  if(en.goal===undefined)en.goal=goalFor(en.ex);
  const j=en.sets.findIndex(s=>!s.done),inc=kgStep(ex),allDone=E.every(x=>x.sets.every(s=>s.done)),ls=lastSets(en.ex);
  const eff=en.sets.filter(s=>!s.w).length,num_=j<0?0:en.sets.slice(0,j+1).filter(s=>!s.w).length;
  let h='<div class="bigm"><div class="big-nav"><button class="ib" data-a="bigNav" data-v="-1" aria-label="Ejercicio anterior"'+(ci?'':' disabled')+'>'+ic('left',22)+'</button><span>Ejercicio '+(ci+1)+' de '+E.length+'</span><button class="ib" data-a="bigNav" data-v="1" aria-label="Ejercicio siguiente"'+(ci<E.length-1?'':' disabled')+'>'+ic('right',22)+'</button></div>'+
   '<button class="big-name" data-a="exInfo" data-v="'+ex.id+'"><b>'+esc(ex.n)+'</b><span>'+(ls?'Última vez: '+ls.slice(0,3).map(s=>setTxt(ex,s)).join(', '):esc(ex.eq))+'</span></button>'+
   (en.goal&&!en.hit?'<p class="big-goal">'+ic('target',15)+' Meta: <b>'+goalTxt(ex,en.goal)+'</b></p>':en.hit?'<p class="big-goal ok">'+ic('check',15)+' ¡Meta cumplida!</p>':'');
  if(j>=0){const s=en.sets[j];
    h+='<p class="big-set">'+(s.w?'Calentamiento':'Serie '+num_+' de '+eff)+'</p><div class="big-steps">'+
     (ex.time?'':'<div class="big-st"><button data-a="stepKg" data-e="'+ci+'" data-s="'+j+'" data-v="-'+inc+'" aria-label="Menos peso">−</button><label><input class="num" type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(s.kg)+'" data-i="set" data-e="'+ci+'" data-s="'+j+'" data-f="kg" aria-label="Peso"><small>'+kgLbl(ex)+'</small></label><button data-a="stepKg" data-e="'+ci+'" data-s="'+j+'" data-v="'+inc+'" aria-label="Más peso">+</button></div>')+
     '<div class="big-st"><button data-a="stepRep" data-e="'+ci+'" data-s="'+j+'" data-v="-'+(ex.time?5:1)+'" aria-label="Menos">−</button><label><input class="num" type="number" inputmode="numeric" min="0" value="'+esc(s.reps)+'" data-i="set" data-e="'+ci+'" data-s="'+j+'" data-f="reps" aria-label="'+(ex.time?'Segundos':'Repeticiones')+'"><small>'+(ex.time?'segundos':'reps')+'</small></label><button data-a="stepRep" data-e="'+ci+'" data-s="'+j+'" data-v="'+(ex.time?5:1)+'" aria-label="Más">+</button></div></div>'+
     '<button class="big-done" data-a="setDone" data-e="'+ci+'" data-s="'+j+'">'+ic('check',30)+' Serie hecha</button>';
  }else h+='<div class="big-fin">'+ic('check',34)+'<b>Listo este ejercicio</b></div>'+(allDone?'<button class="big-done" data-a="sessFinish">'+ic('trophy',26)+' Terminar entrenamiento</button>':ci<E.length-1?'<button class="big-done" data-a="bigNav" data-v="1">Siguiente ejercicio '+ic('right',24)+'</button>':'');
  const pj=j<0?en.sets.length-1:j-1;
  if(pj>=0&&S.rirAsk===ci+':'+pj&&en.sets[pj].done&&!en.sets[pj].w)h+='<div class="rir big-rir"><span>¿Cuántas más podías?</span>'+[0,1,2,3].map(v=>'<button data-a="rirSet" data-e="'+ci+'" data-s="'+pj+'" data-v="'+v+'">'+(v===3?'3+':v)+'</button>').join('')+'</div>';
  const dn=en.sets.filter(s=>s.done);
  if(dn.length)h+='<div class="big-log">'+dn.map(s=>'<span>'+ic('check',13)+' '+setTxt(ex,s)+'</span>').join('')+'</div>';
  return h+'<button class="btn line wide" style="margin-top:14px" data-a="bigTog">'+ic('list',16)+' Ver la lista completa</button></div>';
}
function sessHTML(){
  const a=db.active,big=!!db.settings.big&&a.entries.length;
  if(big)return '<div class="sess"><div class="sess-in"><header class="sess-top"><button class="ib" data-a="sessMin" aria-label="Minimizar">'+ic('down')+'</button><div class="grow"><h2>'+esc(a.name)+'</h2><span class="mut sm-t" id="elapsed">'+fmtT((Date.now()-a.t0)/1000)+'</span></div><button class="ib on" data-a="bigTog" aria-label="Salir del modo grande">'+ic('big',20)+'</button><button class="btn pri sm" data-a="sessFinish">Terminar</button></header>'+musicHTML()+bigHTML()+'</div></div>';
  return '<div class="sess"><div class="sess-in"><header class="sess-top"><button class="ib" data-a="sessMin" aria-label="Minimizar">'+ic('down')+'</button><div class="grow"><h2>'+esc(a.name)+'</h2><span class="mut sm-t" id="elapsed">'+fmtT((Date.now()-a.t0)/1000)+'</span></div><button class="ib" data-a="bigTog" aria-label="Modo grande: una serie a la vez">'+ic('big',20)+'</button><button class="btn pri sm" data-a="sessFinish">Terminar</button></header>'+musicHTML()+
   '<div class="row" style="margin:0 0 12px;gap:8px"><span class="mut sm-t" style="font-weight:700">'+ic('timer',16)+'</span><span class="mut sm-t" style="font-weight:700">Descanso</span><div class="scroll-x grow" style="padding:0">'+
   [45,60,90,120,180,240].map(s=>'<button class="chip '+(db.settings.rest===s?'on':'')+'" data-a="restSet" data-v="'+s+'" aria-pressed="'+(db.settings.rest===s)+'">'+(s<60?s+' s':fmtT(s))+'</button>').join('')+'</div></div>'+
   '<p class="mut sm-t" style="margin:-4px 0 12px">Tocá el número de una serie para marcarla como calentamiento (C): no cuenta para niveles ni récords.</p>'+
   (a.entries.length?'<p class="mut sm-t lp-hint">Mantené apretado un ejercicio para más opciones, o arrastralo de la manija.</p><div class="dlist" data-dl="sess" data-noswipe>'+a.entries.map(entryHTML).join('')+'</div>':'<div class="card empty">'+emptyArt()+'<b>Sin ejercicios</b>Agregá el primero para empezar.</div>')+
   '<button class="btn wide" data-a="pickEx" data-v="sess">'+ic('plus',18)+' Agregar ejercicio</button>'+
   (a.entries.some(en=>en.sets.some(s=>s.done))?'<div class="sess-fin stick"><button class="btn pri wide" data-a="sessFinish">'+ic('trophy',18)+' Terminar entrenamiento</button></div>':'')+
   '<div class="field" style="margin-top:14px"><span>Nota del entrenamiento</span><textarea data-i="anote" maxlength="400" placeholder="Cómo dormiste, energía, molestias…" style="min-height:70px;font:500 14px var(--f-b)">'+esc(a.note||'')+'</textarea></div>'+
   '<button class="btn wide bad" style="margin-top:10px" data-a="sessCancel">Cancelar entrenamiento</button></div></div>';
}
function finishSession(){
  const a=db.active;
  const entries=a.entries.map(en=>{const o={ex:en.ex,sets:en.sets.filter(s=>s.done&&(+s.reps)>0).map(s=>{const r={kg:+s.kg||0,reps:+s.reps};if(s.w)r.w=1;if(s.rir!=null)r.rir=s.rir;return r;})};if((en.note||'').trim())o.note=en.note.trim();return o;}).filter(en=>en.sets.length);
  if(!entries.length){toast('Marcá al menos una serie como hecha');return;}
  const before={};
  entries.forEach(en=>{const ex=exById(en.ex),b=bestE1(en.ex);before[en.ex]={e:b?b.e:0,L:hasRank(ex)?(b?levelIdx(ex,b.e):-1):null};});
  const log={id:a.id,date:a.date,name:a.name,routineId:a.routineId,dur:Math.max(1,Math.round((Date.now()-a.t0)/60000)),entries,prs:[]};
  if((a.note||'').trim())log.note=a.note.trim();
  /* la vez anterior: la misma rutina, o el último entreno con esos ejercicios */
  const prevLog=db.logs.slice().sort((a,b)=>a.date<b.date?1:-1).find(l=>a.routineId?l.routineId===a.routineId:l.entries.some(en=>entries.some(x=>x.ex===en.ex)));
  db.logs.push(log);
  const prs=[],ups=[];
  entries.forEach(en=>{
    const ex=exById(en.ex),b=bestE1(en.ex),bf=before[en.ex];
    if(!ex||!b)return;
    if(bf.e>0&&b.e>bf.e+.01){prs.push({ex:ex.id,e:b.e});log.prs.push(ex.id);}
    if(hasRank(ex)&&bf.L!=null){const L=levelIdx(ex,b.e);if(L>bf.L&&L>=0)ups.push({ex:ex.id,from:bf.L,to:L});}
  });
  let vol=0,sets=0;
  /* en ejercicios con peso corporal (dominadas, fondos...) también cuenta la parte del cuerpo que movés; el calentamiento no suma */
  const bwKg=weightNow()||70;
  entries.forEach(en=>{const ex=exById(en.ex);en.sets.forEach(s=>{if(s.w)return;sets++;if(ex&&!ex.time)vol+=((ex.bw||0)*bwKg+s.kg)*s.reps;});});
  const gTot=a.entries.filter(en=>en.goal).length,gHit=a.entries.filter(en=>en.hit).length;
  addEv({k:'w',n:log.name,d:log.date});prs.forEach(p=>addEv({k:'pr',x:p.ex,d:log.date}));ups.forEach(u=>addEv({k:'up',x:u.ex,L:u.to,d:log.date}));
  db.active=null;save();endRest(false);S.sessOpen=false;
  const posted=Social.share(log,{vol,sets,prs,ups});
  const vs=prevLog?entries.map(en=>{const ex=exById(en.ex),p=prevLog.entries.find(x=>x.ex===en.ex);if(!ex||!p)return null;
    const top=ss=>ss.filter(s=>!s.w).reduce((b,s)=>!b||e1(ex,s.kg,s.reps)>e1(ex,b.kg,b.reps)?s:b,null),a1=top(p.sets),b1=top(en.sets);if(!a1||!b1)return null;
    const ea=e1(ex,a1.kg,a1.reps),eb=e1(ex,b1.kg,b1.reps);return{ex:en.ex,a:setTxt(ex,a1),b:setTxt(ex,b1),d:ea?eb/ea-1:0};}).filter(Boolean):[];
  S.modal={t:'summary',log,prs,ups,vol,sets,goals:{hit:gHit,tot:gTot},posted,vs,vsD:prevLog&&prevLog.date};render();countUp($('#modal'));buzz([20,40,60]);
  checkGoals();checkRankUp(900);checkMissions();
  if(ups.length||prs.length)setTimeout(()=>confetti(ups.length?70:36),250);
  checkAch();
}
/* calculadora de discos: cuántos discos por lado para llegar al peso */
const PLATES=[25,20,15,10,5,2.5,1.25];
const PCOL={25:'#D6334F',20:'#2F73E0',15:'#E0B000',10:'#17935C',5:'#EEF0FF',2.5:'#14172B',1.25:'#8794AC'};
function platesFor(total,bar){
  let side=(total-bar)/2;const out=[];
  if(side<0)return null;
  PLATES.forEach(p=>{while(side>=p-1e-9){out.push(p);side=Math.round((side-p)*100)/100;}});
  return{plates:out,left:side*2};
}
function platesHTML(d){
  const total=+d.kg||0,bar=+d.bar||20,r=total?platesFor(total,bar):null;
  let vis='';
  if(r&&r.plates.length){
    vis='<div class="barbell"><span class="sleeve"></span>'+r.plates.slice().reverse().map((p,i)=>'<i style="--h:'+(30+p*2.4).toFixed(0)+'px;background:'+PCOL[p]+';animation-delay:'+(i*60)+'ms" title="'+num(p,2)+' kg"></i>').join('')+'<span class="shaft"></span>'+r.plates.map((p,i)=>'<i style="--h:'+(30+p*2.4).toFixed(0)+'px;background:'+PCOL[p]+';animation-delay:'+(i*60)+'ms"></i>').join('')+'<span class="sleeve"></span></div>';
  }
  return '<div class="g2"><label class="field">Peso total (kg)<input type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(d.kg)+'" data-i="pl" data-f="kg"></label>'+
   '<label class="field">Barra<select data-i="pl" data-f="bar">'+[20,15,10,7].map(b=>'<option value="'+b+'"'+(bar===b?' selected':'')+'>'+b+' kg</option>').join('')+'</select></label></div>'+
   '<div id="plOut">'+(!total?'<p class="mut sm-t">Poné el peso total que querés en la barra.</p>':!r?'<div class="warn">Es menos que la barra sola.</div>':
   vis+'<p class="tc" style="margin-top:12px"><b>Por lado:</b> '+(r.plates.length?r.plates.map(p=>num(p,2)).join(' + ')+' kg':'nada, solo la barra')+'</p>'+
   (r.left>0.01?'<p class="tc mut sm-t">No se llega justo: quedan '+num(r.left,2)+' kg sin cubrir con discos estándar.</p>':''))+'</div>'+
   (d.e!=null?'<button class="btn pri wide" data-a="platesUse">Usar '+num(total,1)+' kg en las series que faltan</button>':'');
}

/* ============ Descanso ============ */
let restT=null,audioCtx=null;
function unlockAudio(){try{if(!audioCtx){const A=window.AudioContext||window.webkitAudioContext;if(A)audioCtx=new A();}if(audioCtx&&audioCtx.state==='suspended')audioCtx.resume();}catch(e){}}
function beep(){
  try{if(audioCtx){const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.connect(g);g.connect(audioCtx.destination);o.frequency.value=880;const n=audioCtx.currentTime;g.gain.setValueAtTime(.001,n);g.gain.exponentialRampToValueAtTime(.3,n+.03);g.gain.exponentialRampToValueAtTime(.001,n+.6);o.start();o.stop(n+.65);}}catch(e){}
  buzz([200,80,200]);
}
function startRest(sec){S.rest={end:Date.now()+sec*1000,total:sec};clearInterval(restT);restT=setInterval(restTick,250);renderRest();}
function restTick(){
  if(!S.rest)return;
  const left=Math.ceil((S.rest.end-Date.now())/1000);
  if(left<=0){endRest(true);return;}
  const b=$('#restT'),f=$('#restF'),w=$('.restb');
  if(b)b.textContent=fmtT(left);
  if(f)f.style.strokeDashoffset=(163.4*(1-left/S.rest.total)).toFixed(1);
  if(w)w.classList.toggle('last',left<=3);
}
function restNote(title,body,silent){try{if(!('Notification' in window)||Notification.permission!=='granted'||!navigator.serviceWorker)return;
  navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,tag:'swole-rest',renotify:!silent,silent:!!silent,icon:'icons/icon-192.png',badge:'icons/icon-192.png',vibrate:silent?undefined:[200,80,200],data:{url:'./'}})).catch(()=>{});}catch(e){}}
function restNoteClear(){try{navigator.serviceWorker&&navigator.serviceWorker.ready.then(r=>r.getNotifications({tag:'swole-rest'})).then(l=>l&&l.forEach(n=>n.close())).catch(()=>{});}catch(e){}}
/* si salís de la app durante el descanso, el celu te avisa a qué hora termina y cuando termina */
document.addEventListener('visibilitychange',()=>{if(!S.rest)return;if(document.hidden){const hm=new Date(S.rest.end).toTimeString().slice(0,5);restNote('Descansando','Termina a las '+hm,true);clearTimeout(S.restN);S.restN=setTimeout(()=>{if(S.rest&&document.hidden)restNote('Descanso terminado','Volvé a la siguiente serie',false);},Math.max(0,S.rest.end-Date.now()));}else{clearTimeout(S.restN);restNoteClear();}});
function endRest(alarm){clearInterval(restT);clearTimeout(S.restN);const hid=document.hidden;S.rest=null;$('#restbar').innerHTML='';if(alarm){beep();toast('Descanso terminado');if(hid)restNote('Descanso terminado','Volvé a la siguiente serie',false);}else restNoteClear();}
function renderRest(){
  if(!S.rest){$('#restbar').innerHTML='';return;}
  const left=Math.max(0,Math.ceil((S.rest.end-Date.now())/1000));
  $('#restbar').innerHTML='<div class="restb"><div class="row"><div class="ring"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="rbg"/><circle id="restF" cx="30" cy="30" r="26" class="rfg" style="stroke-dashoffset:'+(163.4*(1-left/S.rest.total)).toFixed(1)+'"/></svg><b id="restT">'+fmtT(left)+'</b></div>'+
   '<span class="grow"><span style="font-size:12px;font-weight:700;opacity:.7">Descanso</span><br><span style="font-weight:700">'+fmtT(S.rest.total)+'</span></span><button class="btn" data-a="restAdd" data-v="-15">-15</button><button class="btn" data-a="restAdd" data-v="15">+15</button><button class="btn" data-a="restSkip">Saltar</button></div></div>';
}

/* ============ Capas: modales ============ */
function exDetail(id){
  const ex=exById(id);if(!ex)return '';
  let h=techCard(ex)+'<div class="big-map" style="max-width:300px;width:100%">'+bodyMap(mapOf(ex),{labels:1,cls:'live'})+'</div><div class="chips">'+chipsMus(ex)+'</div>';
  if(ex.d)h+='<p>'+esc(ex.d)+'</p>';
  if(ex.ph)h+='<div class="warn"><b>Peso por mano:</b> anotá lo que pesa UNA mancuerna, no la suma de las dos.</div>';
  h+='<p class="mut sm-t">Equipo: '+esc(ex.eq)+'. Los músculos resaltados son los principales y los claros, los secundarios.</p>';
  h+='<div class="row" style="gap:8px;flex-wrap:wrap">'+(hasRank(ex)?'<button class="btn sm pri" data-a="markOpen" data-v="'+ex.id+'">'+ic('bolt',16)+' Cargar marca</button>':'')+(isBarbell(ex)?'<button class="btn sm line" data-a="platesOpen">'+ic('disc',16)+' Calculadora de discos</button>':'')+'</div>';
  const b=bestE1(id);
  {const sx=stallOf(id),fx=fixOf(id);
    if(fx)h+='<div class="stall on"><span class="ct-ic">'+ic('target',16)+'</span><div class="grow"><b>Plan: '+FIX_N[fx.k]+'</b><span class="mut sm-t">Hasta el '+esc(longDate(fx.until))+(fx.k==='vary'?'':'. La meta de cada serie ya lo tiene en cuenta')+'</span></div><button class="btn sm line" data-a="stallFix" data-v="off" data-e="'+id+'">Quitar</button></div>';
    else if(sx)h+='<div class="stall"><span class="ct-ic">'+ic('swap',16)+'</span><div class="grow"><b>Estancado desde el '+esc(longDate(sx.since))+'</b><span class="mut sm-t">Las últimas 3 sesiones no superaron a las anteriores. Elegí cómo destrabarlo:</span>'+
      '<div class="stall-o"><button class="btn sm" data-a="stallFix" data-v="deload" data-e="'+id+'">Semana liviana</button><button class="btn sm" data-a="stallFix" data-v="reps" data-e="'+id+'">Cambiar repeticiones</button><button class="btn sm" data-a="stallFix" data-v="vary" data-e="'+id+'">Probar variante</button></div></div></div>';
    if(fx&&fx.k==='vary'){const sim=similarEx(id,{lv:2}).slice(0,4);if(sim.length)h+='<div class="chips" style="margin-top:-4px">'+sim.map(e=>'<button class="chip sm" data-a="exInfo" data-v="'+e.id+'">'+esc(e.n)+'</button>').join('')+'</div>';}}
  if(hasRank(ex)&&db.profile){const off=noRank(id);
    h+='<button class="pref" data-a="rankTog" data-v="'+id+'" role="switch" aria-checked="'+!off+'"><span class="grow"><b>Cuenta para mi nivel</b><small>'+(off?'Apagado: no suma ni resta en tu rango por grupo ni en el general':'Si una marca vieja o un ejercicio que hacés poco te baja el grupo, apagalo')+'</small></span><i class="sw'+(off?'':' on')+'"></i></button>';
    const cur=curV(ex),nextL=Math.max(0,Math.min(18,Math.floor(cur)+1)),has=(db.goals||[]).find(g=>g.ex===id&&!g.done);
    if(cur<18)h+=has?'<div class="goal hit" style="border-style:dashed"><span class="grow"><span class="mut sm-t">Tu objetivo</span><br><b>'+lvlName(has.L)+'</b></span>'+ic('flag',20)+'</div>'
      :'<div class="goal"><span class="grow"><span class="mut sm-t">Próximo objetivo</span><br><b>'+lvlName(nextL)+'</b> <span class="mut sm-t">· '+needTxt(ex,nextL)+'</span></span><button class="btn sm" data-a="goalAdd" data-v="'+id+'" data-l="'+nextL+'">'+ic('flag',14)+' Fijar</button></div>';
    if(b){
      const i=lvlInfo(ex,b.e);
      h+='<div class="card" style="margin:0"><div class="row">'+badge(i.L,60)+'<div class="grow"><div style="font:800 24px var(--f-d)">'+lvlSpan(i.L)+'</div><span class="mut sm-t">Mejor serie: '+(b.kg?num(b.kg,1)+' kg × ':'')+b.reps+(ex.time?' s':'')+' · '+bestTxt(ex,b)+'</span></div></div>'+pctTxt(pctStronger(ex,b.e))+
       (i.next!=null?'<div class="bar" style="margin:12px 0 6px"><i style="width:'+Math.round(clamp(i.pct,0,1)*100)+'%;background:'+lvlColor(i.L)+'"></i></div><span class="sm-t mut">Para '+lvlName(i.next||0)+': '+needTxt(ex,i.next||0)+'</span>':'')+(ex.st?'<p class="sm-t" style="margin-top:8px">'+pctLine(pctStronger(ex,b.e))+' <span class="mut">de '+whoTxt()+' (estimado)</span></p>':'')+'</div>';
    }else h+='<div class="warn">Todavía no registraste este ejercicio. '+(ex.sk?'Con '+needTxt(ex,ex.sk.b)+' ya entrás en '+lvlName(ex.sk.b)+'.':'Para llegar a Bronce 1 necesitás un 1RM estimado de '+num(stdFor(ex).lo,1)+' kg.')+'</div>';
    if(ex.sk){
      /* la escalera de la progresión */
      h+='<div><h4 style="margin-bottom:8px">Progresión: '+esc(SKFAM[ex.sk.f])+'</h4><div class="gap">'+skFam(ex.sk.f).map(v=>{
        const bb=bestE1(v.id),L=bb?levelIdx(v,bb.e):null;
        return '<button class="row" style="text-align:left;padding:8px 10px;border-radius:12px;background:'+(v.id===id?'var(--raise)':'transparent')+'" data-a="exInfo" data-v="'+v.id+'"><span class="lvl-t" style="color:'+lvlColor(v.sk.b)+';min-width:82px;font-size:13px">'+lvlName(v.sk.b)+'</span><span class="grow">'+esc(v.n)+'</span>'+(bb?'<span style="color:var(--ok)">'+ic('check',18)+'</span>':'')+'</button>';
      }).join('')+'</div></div>';
    }else h+='<div><h4 style="margin-bottom:8px">1RM estimado para cada rango (según tu perfil)</h4><div class="ladder">'+TIERS.map((t,k)=>'<div style="color:'+TCOL[k]+'">'+t+'<b>'+Math.round(thr(ex,k===6?18:k*3))+'</b></div>').join('')+'</div></div>';
  }else if(!hasRank(ex))h+='<p class="mut sm-t">Este ejercicio no tiene escala de rangos, pero igual podés registrarlo y ver su progreso.</p>';
  const pts=e1Points(id);
  if(hasRank(ex)||ex.time)h+='<div><h4 style="margin-bottom:8px">Progreso ('+(ex.sk||ex.time?'mejor serie':'1RM estimado')+')</h4>'+exChart(ex,pts,ex.sk||ex.time?(ex.time?'s':'reps'):'kg')+'</div>';
  /* historial: todas las veces que lo hiciste */
  const hist=allSess().filter(l=>l.entries.some(en=>en.ex===id)).sort((a,b)=>a.date<b.date?1:-1);
  if(hist.length)h+='<div><h4 style="margin-bottom:6px">Historial ('+hist.length+(hist.length===1?' vez':' veces')+')</h4><div class="hist">'+hist.slice(0,30).map(l=>{const en=l.entries.find(x=>x.ex===id);
    return '<div class="rowline"><span><b>'+shortDate(parseK(l.date).getTime())+'</b>'+(l.test?' <span class="tag" style="color:var(--acc)">Marca</span>':'')+(en.note?'<br><span class="mut sm-t">'+esc(en.note)+'</span>':'')+'</span><span class="mut" style="text-align:right">'+en.sets.map(s=>setTxt(ex,s)).join(', ')+'</span><button class="ib flat hist-del" data-a="delRec" data-v="'+l.id+'|'+id+'" aria-label="Borrar este registro">'+ic('trash',14)+'</button></div>';}).join('')+'</div></div>';
  if(ex.custom&&!ex.hidden)h+='<button class="btn bad wide" data-a="delEx" data-v="'+id+'">Eliminar ejercicio</button>';
  return h;
}
function profileHTML(d){
  const sexo=[['m','Hombre'],['f','Mujer'],['x','Prefiero no decir']],first=!db.profile;
  return '<p class="mut sm-t">'+(first?'Con estos datos calculo tus niveles de fuerza y tus calorías. Quedan en tu dispositivo, y en la nube si entrás con tu cuenta.':'Se usan para tus niveles y tus calorías.')+'</p>'+
   '<div class="field"><span>Sexo</span><div class="seg">'+sexo.map(x=>'<button class="'+(d.sex===x[0]?'on':'')+'" data-a="pfSex" data-v="'+x[0]+'">'+x[1]+'</button>').join('')+'</div></div>'+
   '<div class="g3"><label class="field">Edad<input type="number" inputmode="numeric" min="10" max="90" value="'+esc(d.age)+'" data-i="d" data-f="age" placeholder="años"></label>'+
   '<label class="field">Altura<input type="number" inputmode="numeric" min="120" max="230" value="'+esc(d.height)+'" data-i="d" data-f="height" placeholder="cm"></label>'+
   '<label class="field">Peso<input type="number" inputmode="decimal" step="0.1" min="30" max="250" value="'+esc(d.weight)+'" data-i="d" data-f="weight" placeholder="kg"></label></div>'+
   '<div class="g2"><label class="field">Apodo<input type="text" maxlength="20" value="'+esc(d.nick||'')+'" data-i="d" data-f="nick" placeholder="Cómo te dicen"></label>'+
   '</div>'+
   '<label class="field">Actividad física<select data-i="d" data-f="activity">'+ACT.map((a,i)=>'<option value="'+i+'"'+(+d.activity===i?' selected':'')+'>'+a.l+'</option>').join('')+'</select></label>'+
   '<div class="field"><span>Objetivo</span><div class="seg">'+Object.keys(GOALS).map(k=>'<button class="'+(d.goal===k?'on':'')+'" data-a="pfGoal" data-v="'+k+'">'+GOALS[k]+'</button>').join('')+'</div></div>'+
   '<button class="btn pri wide" data-a="pfSave">Guardar perfil</button>'+
   (first?'<button class="btn line wide" data-a="loginOpen">'+ic('cloud',18)+' Ya uso Swole: entrar con mi cuenta</button>':'<div class="div" style="margin:0"></div>'+accountHTML())+
   (first?'':'<div class="div" style="margin:0"></div><p class="mut sm-t">'+(Sync.user()?'También podés guardar una copia en un archivo.':'Tus datos viven solo en este dispositivo. Hacé una copia cada tanto.')+' Última copia: <b>'+(db.settings.lastBackup?esc(longDate(db.settings.lastBackup)):'nunca')+'</b></p><div class="g2"><button class="btn sm" data-a="export">Exportar datos</button><button class="btn sm" data-a="importOpen">Importar datos</button></div><button class="btn sm wide" data-a="exportCSV" style="margin-top:8px">'+ic('list',15)+' Bajar mis entrenos para Excel (CSV)</button><button class="btn sm bad line" data-a="wipeAsk">Borrar todos los datos</button><p class="mut tc" style="font-size:11px">Figura anatómica adaptada de react-body-highlighter (MIT).</p>');
}
function accountHTML(){
  const u=Sync.user(),st=Sync.state;
  if(!u)return '<div><h4 style="margin-bottom:4px">Cuenta y sincronización</h4><p class="mut sm-t" style="margin-bottom:10px">Entrá con tu email para guardar todo en la nube y usar Swole en el celular y la compu a la vez.</p><div class="g2"><button class="btn pri" data-a="loginOpen" data-v="up">'+ic('cloud',16)+' Crear cuenta</button><button class="btn line" data-a="loginOpen">Ya tengo cuenta</button></div></div>';
  const txt={busy:'Sincronizando…',ok:'Sincronizado '+agoTxt(st.at),off:'Sin conexión: se sincroniza cuando vuelva internet',err:'No se pudo sincronizar'+(st.msg?': '+st.msg:''),idle:'Esperando para sincronizar'}[st.s]||'';
  const col=st.s==='ok'?'var(--ok)':st.s==='err'?'var(--bad)':'var(--mut)';
  return '<div><h4 style="margin-bottom:4px">Cuenta y sincronización</h4><p class="sm-t" style="margin-bottom:2px">Conectado como <b>'+esc(u.email||'')+'</b></p><p class="sm-t" id="syncTxt" style="color:'+col+';margin-bottom:10px">'+esc(txt)+'</p>'+
   '<div class="g2"><button class="btn sm" data-a="syncNow">'+ic('cloud',16)+' Sincronizar</button><button class="btn sm" data-a="logoutAsk">Cerrar sesión</button></div><button class="del-acc" data-a="delAccAsk">Eliminar mi cuenta</button></div>';
}
function agoTxt(t){if(!t)return '';const s=Math.round((Date.now()-t)/1000);if(s<60)return 'recién';if(s<3600)return 'hace '+Math.round(s/60)+' min';if(s<86400)return 'hace '+Math.round(s/3600)+' h';return 'el '+shortDate(t);}
const LOGIN_T={in:'Entrar',up:'Crear cuenta',forgot:'Recuperar contraseña',newpw:'Contraseña nueva',sent:'Revisá tu email'};
function loginHTML(d){
  const dis=d.busy?' disabled':'';
  const em='<label class="field">Email<input type="email" inputmode="email" autocomplete="email" value="'+esc(d.email)+'" data-i="d" data-f="email" placeholder="vos@ejemplo.com"></label>';
  const pw=(lbl,f,ac)=>'<label class="field">'+lbl+'<input type="password" autocomplete="'+ac+'" value="'+esc(d[f]||'')+'" data-i="d" data-f="'+f+'" placeholder="Mínimo 6 caracteres"></label>';
  if(d.mode==='sent')return '<p>'+esc(d.msg||'')+'</p><p class="mut sm-t">Si no lo ves en un par de minutos, fijate en spam.</p><button class="btn pri wide" data-a="loginMode" data-v="in">Ya está, entrar</button>';
  if(d.mode==='forgot')return '<p class="mut sm-t">Te mando un link para elegir una contraseña nueva.</p>'+em+
   '<button class="btn pri wide" data-a="loginGo"'+dis+'>'+(d.busy?'Mandando…':'Mandarme el link')+'</button><button class="btn line wide" data-a="loginMode" data-v="in">Volver</button>';
  if(d.mode==='newpw')return '<p class="mut sm-t">Elegí tu contraseña nueva para <b>'+esc(d.email)+'</b>.</p>'+pw('Contraseña nueva','pw','new-password')+
   '<button class="btn pri wide" data-a="loginGo"'+dis+'>'+(d.busy?'Guardando…':'Guardar contraseña')+'</button>';
  const up=d.mode==='up';
  return '<p class="mut sm-t">'+(up?'Guardá todo en la nube y usá Swole en el celular y la compu a la vez.':'Lo que ya tenés en este dispositivo se une con lo de la nube.')+'</p>'+
   em+pw('Contraseña','pw',up?'new-password':'current-password')+
   '<button class="btn pri wide" data-a="loginGo"'+dis+'>'+(d.busy?(up?'Creando…':'Entrando…'):(up?'Crear cuenta':'Entrar'))+'</button>'+
   (d.unconf&&!up?'<div class="warn">Tu cuenta todavía no está confirmada. Buscá el email de Swole (fijate en spam) o pedí otro.</div><button class="btn wide" data-a="loginResend">Reenviar email de confirmación</button>':'')+
   (up?'':'<button class="btn line wide" data-a="loginMode" data-v="forgot">Me olvidé la contraseña</button>')+
   '<p class="tc sm-t login-sw">'+(up?'¿Ya tenés cuenta? <button class="lnk" data-a="loginMode" data-v="in">Entrar</button>':'¿Primera vez? <button class="lnk" data-a="loginMode" data-v="up">Crear cuenta</button>')+'</p>';
}
function routineHTML(d){
  const days=[1,2,3,4,5,6,0];
  return '<label class="field">Nombre<input type="text" maxlength="40" value="'+esc(d.name)+'" data-i="d" data-f="name" placeholder="Ej: Empuje, Piernas, Torso"></label>'+
   '<div class="field"><span>Días fijos (opcional)</span><div class="chips">'+days.map(x=>'<button class="chip '+(d.days.includes(x)?'on':'')+'" data-a="rDay" data-v="'+x+'" aria-pressed="'+d.days.includes(x)+'">'+DIAS3[x]+'</button>').join('')+'</div></div>'+
   '<div class="field"><span>Ejercicios</span></div>'+
   (d.items.length?'<div class="dlist" data-dl="rt" data-noswipe>'+d.items.map((it,i)=>{const ex=exById(it.ex);if(!ex)return '';
     return '<div class="card ritem" data-di="'+i+'" style="margin:0;padding:12px"><div class="row"><span class="dh" role="button" aria-label="Arrastrar '+esc(ex.n)+' para cambiarlo de lugar">'+ic('list',18)+'</span>'+miniMap(mapOf(ex)).replace('mini','mini" style="width:44px')+'<b class="grow" style="font-size:15px">'+esc(ex.n)+'</b>'+
      '<button class="ib flat" data-a="rSwap" data-v="'+i+'" aria-label="Cambiar '+esc(ex.n)+' por otro">'+ic('swap',18)+'</button><button class="ib flat" data-a="rUp" data-v="'+i+'" aria-label="Subir">'+ic('up',18)+'</button><button class="ib flat" data-a="rDel" data-v="'+i+'" aria-label="Quitar">'+ic('x',18)+'</button></div>'+
      '<div class="g2" style="margin-top:10px"><label class="field">Series<input type="number" inputmode="numeric" min="1" max="12" value="'+it.sets+'" data-i="item" data-e="'+i+'" data-f="sets"></label><label class="field">'+(ex.time?'Segundos':'Repeticiones')+'<input type="number" inputmode="numeric" min="1" max="200" value="'+it.reps+'" data-i="item" data-e="'+i+'" data-f="reps"></label></div></div>';}).join('')+'</div>':'<p class="mut sm-t">Todavía no agregaste ejercicios.</p>')+
   '<button class="btn wide" data-a="pickEx" data-v="routine">'+ic('plus',18)+' Agregar ejercicio</button>'+
   '<button class="btn pri wide stick" data-a="rSave">Guardar rutina</button>'+(d.id?'<button class="btn bad wide line" data-a="rDelAsk">Eliminar rutina</button>':'');
}
function summaryHTML(m){
  return '<div class="sum-hero"><svg viewBox="0 0 64 64" aria-hidden="true"><circle class="sh-c" cx="32" cy="32" r="28"/><path class="sh-k" d="M20 33l8 8 16-17"/></svg><b>¡Entreno guardado!</b><span class="mut sm-t">'+esc(m.log.name)+'</span></div>'+(m.posted?'<div class="sum-post">'+ic('user',16)+'<span class="grow">Tus amigos lo ven en Novedades y te pueden dar fuego.</span><button class="btn sm line" data-a="postUndo" data-v="'+esc(m.log.id)+'">No publicar</button></div>':'')+'<div class="g3"><div class="stat"><b data-n="'+m.log.dur+'">'+m.log.dur+'</b><span>minutos</span></div><div class="stat"><b data-n="'+m.sets+'">'+m.sets+'</b><span>series</span></div><div class="stat"><b data-n="'+Math.round(m.vol)+'" data-fmt="1">'+nf(m.vol)+'</b><span>kg movidos</span></div></div>'+
   (m.ups.length?m.ups.map(u=>{const ex=exById(u.ex);return '<div class="card row pop" style="margin:0">'+badge(u.to,64)+'<div class="grow"><span class="mut sm-t">¡Subiste de nivel!</span><div style="font:800 20px var(--f-d)">'+esc(ex.n)+'</div><span class="sm-t">'+lvlName(u.from)+' a '+lvlSpan(u.to)+'</span></div></div>';}).join(''):'')+
   (m.prs.length?'<div class="card" style="margin:0"><h4 style="margin-bottom:6px">Récords personales</h4>'+m.prs.map(p=>{const ex=exById(p.ex);if(!ex)return '';return '<div class="rowline"><span>'+esc(ex.n)+'</span><span class="mut">'+(ex.time||ex.sk?'Mejor: '+Math.round(p.e)+unitOf(ex):ex.st?'1RM est. '+num(p.e,1)+' kg':'Mejor serie superada')+'</span></div>';}).join('')+'</div>':'')+
   (m.vs&&m.vs.length?'<div class="card vs-card" style="margin:0"><h4 style="margin-bottom:6px">Contra la vez anterior <span class="mut sm-t">('+esc(shortDate(parseK(m.vsD).getTime()))+')</span></h4>'+m.vs.map(x=>{const ex=exById(x.ex),c=x.d>.005?'up':x.d<-.005?'down':'eq';
      return '<div class="rowline vs-r"><span>'+esc(shortN(ex.n))+'</span><span class="vs-v"><small>'+esc(x.a)+'</small>'+ic(c==='up'?'up':c==='down'?'down':'right',13)+'<b class="'+c+'">'+esc(x.b)+'</b></span></div>';}).join('')+'</div>':'')+
   (m.goals&&m.goals.tot?'<div class="goal'+(m.goals.hit?' hit':'')+'"><span class="grow"><span class="mut sm-t">Sobrecarga progresiva</span><br><b>'+m.goals.hit+' de '+m.goals.tot+' metas cumplidas</b></span>'+ic(m.goals.hit===m.goals.tot?'trophy':'bolt',22)+'</div>':'')+
   (!m.log.routineId&&!m.saved?'<button class="btn line wide" data-a="saveAsR" data-v="'+esc(m.log.id)+'">'+ic('plus',16)+' Guardar este entreno como rutina</button>':m.saved?'<p class="fd-ok">'+ic('check',15)+' Guardado en tus rutinas</p>':'')+'<div class="g2 stick"><button class="btn" data-a="sumShare">'+ic('share',16)+' Compartir</button><button class="btn pri" data-a="close" data-v="modal">Listo</button></div>';
}
function logEditHTML(d){
  return '<label class="field">Nombre<input type="text" maxlength="40" value="'+esc(d.name)+'" data-i="d" data-f="name"></label>'+
   '<label class="field">Duración (minutos)<input type="number" inputmode="numeric" min="1" max="600" value="'+esc(d.dur)+'" data-i="d" data-f="dur"></label>'+
   (d.entries.length?d.entries.map((en,i)=>{
     const ex=exById(en.ex);if(!ex)return '';
     return '<div class="card" style="margin:0;padding:12px"><div class="row"><b class="grow">'+esc(ex.n)+'</b><button class="ib flat" data-a="leDelEntry" data-e="'+i+'" aria-label="Quitar ejercicio">'+ic('trash',18)+'</button></div><div class="sets">'+
      en.sets.map((s,j)=>'<div class="set"><span class="sn">'+(j+1)+'</span>'+
        (ex.time?'<span></span>':'<label><input class="num" type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(s.kg)+'" data-i="lset" data-e="'+i+'" data-s="'+j+'" data-f="kg" aria-label="Peso de la serie '+(j+1)+'"><small>'+kgLbl(ex)+'</small></label>')+
        '<label><input class="num" type="number" inputmode="numeric" min="0" value="'+esc(s.reps)+'" data-i="lset" data-e="'+i+'" data-s="'+j+'" data-f="reps" aria-label="Repeticiones de la serie '+(j+1)+'"><small>'+(ex.time?'segundos':'reps')+'</small></label>'+
        '<button class="chk" data-a="leDelSet" data-e="'+i+'" data-s="'+j+'" aria-label="Borrar serie '+(j+1)+'">'+ic('x',20)+'</button></div>').join('')+
      '</div><button class="btn sm wide" style="margin-top:8px" data-a="leAddSet" data-e="'+i+'">'+ic('plus',16)+' Serie</button></div>';
   }).join(''):'<p class="mut sm-t">Este entrenamiento se quedó sin ejercicios.</p>')+
   '<button class="btn pri wide stick" data-a="leSave">Guardar cambios</button>';
}
/* el logo animado se guarda al arrancar (la pantalla de carga después se borra) */
const LOGO_SVG=(document.getElementById('splash')||{innerHTML:''}).innerHTML.split('<b>')[0];
const WEL=[
 {t:'Entrená y registrá cada serie',p:'Rutinas, timer de descanso y tu historial completo. Rápido, en el gym, sin vueltas.'},
 {t:'Descubrí qué tan fuerte sos',p:'Cada músculo se pinta con su rango: de Bronce a Élite. Pesas o calistenia, cada uno con su escala.'},
 {t:'Subí de rango',p:'Desbloqueá logros, rompé récords y llevá tu progreso en el celu y la compu.'}
];
function welcomeHTML(m){
  const i=m.step||0,w=WEL[i];
  const demo={pecho:8,hombros:10,biceps:6,triceps:7,abs:4,oblicuos:3,cuadriceps:12,gemelos:5,dorsales:13,trapecio:9,lumbar:7,gluteos:11,isquios:9,antebrazos:5,aductores:6};
  const art=i===0?'<div class="wel-logo">'+LOGO_SVG+'</div>'
   :i===1?'<div class="wel-body">'+bodyMap(null,{levels:demo,cls:'live'})+'</div>'
   :'<div class="wel-badges">'+[0,3,6,9,12,15,18].map((L,k)=>'<span style="animation-delay:'+(k*110)+'ms">'+badge(L,k===6?78:44)+'</span>').join('')+'</div>';
  return '<div class="mback wel"><div class="msheet" role="dialog" aria-modal="true" aria-label="Bienvenida"><div class="mbody">'+
   '<div class="wel-art" key="'+i+'">'+art+'</div><h2 class="wel-t">'+w.t+'</h2><p class="mut wel-p">'+w.p+'</p>'+
   '<div class="steps">'+WEL.map((_,k)=>'<i class="'+(k<=i?'on':'')+'"></i>').join('')+'</div>'+
   '<button class="btn pri wide" data-a="welNext">'+(i<WEL.length-1?'Siguiente':'Empezar')+' '+ic('right',18)+'</button>'+
   '<button class="btn line wide" data-a="welLogin">Ya uso Swole: entrar con mi cuenta</button></div></div></div>';
}
/* ---- Cargar marca ---- */
function markList(d){
  const l=filterEx(d.q,d.g).filter(hasRank);
  return l.length?l.map(e=>{const b=bestE1(e.id),L=b?levelIdx(e,b.e):null;
    return '<button class="ex" data-a="markPick" data-v="'+e.id+'">'+miniMap(mapOf(e))+'<span class="grow"><h4>'+esc(e.n)+'</h4><span class="mut sm-t">'+(b?lvlName(L)+' · '+bestTxt(e,b):esc(e.eq))+'</span></span>'+(b?badge(L,36):ic('right',18))+'</button>';}).join('')
   :'<div class="empty">Ningún ejercicio coincide.</div>';
}
/* qué nivel daría lo que estás escribiendo */
function markPrev(d){
  const ex=exById(d.ex);if(!ex)return '';
  const e=e1(ex,+d.kg||0,+d.reps||0);if(!(e>0))return '<p class="mut sm-t tc">Completá los datos para ver tu nivel.</p>';
  const L=levelIdx(ex,e),b=bestE1(ex.id),bl=b?levelIdx(ex,b.e):null;
  return '<div class="row mark-prev">'+badge(L,44)+'<div class="grow"><span class="mut sm-t">Esto sería</span><br>'+lvlSpan(L)+(ex.sk||ex.time?'':'<span class="mut sm-t"> · 1RM estimado '+num(e,1)+' kg</span>')+'</div>'+
   (b?'<span class="tag" style="color:'+(e>b.e?'var(--ok)':'var(--mut)')+'">'+(e>b.e?'Récord':'Tu mejor: '+lvlName(bl))+'</span>':'')+'</div>'+skCapTxt(ex,e);
}
/* cuando ya sacaste todo lo que da una variante: decir cuál sigue */
function skCapTxt(ex,e){
  if(!ex.sk||e<ex.sk.t)return '';
  const nx=skFam(ex.sk.f).find(x=>x.sk.b>ex.sk.b);
  return '<p class="mark-cap">'+ic('up',14)+' <span>Con '+esc(shortN(ex.n).toLowerCase())+' el máximo es <b>'+lvlName(Math.min(18,ex.sk.b+ex.sk.g))+'</b>'+'. '+(nx?'Para subir más, probá <b>'+esc(nx.n)+'</b>.':'Ya estás en lo más alto.')+'</span></p>';
}
function markHTML(d){
  if(d.step==='pick')return '<div class="field"><input type="search" placeholder="Buscar ejercicio" value="'+esc(d.q)+'" data-i="mq" aria-label="Buscar ejercicio"></div>'+
   '<div class="scroll-x">'+GROUP_TABS().filter(g=>g!=='Deporte').map(g=>'<button class="chip '+((d.g||'Todos')===g?'on':'')+'" data-a="markG" data-v="'+g+'">'+g+'</button>').join('')+'</div><div class="gap" id="markList">'+markList(d)+'</div>';
  const ex=exById(d.ex);
  if(d.step==='form'){
    const noKg=ex.time&&!ex.bw;
    return '<div class="row">'+miniMap(mapOf(ex))+'<div class="grow"><h3 style="font:800 20px var(--f-d)">'+esc(ex.n)+'</h3><span class="mut sm-t">'+esc(ex.eq)+(ex.sk?' · '+esc(SKFAM[ex.sk.f]):'')+'</span></div><button class="btn sm line" data-a="markBack">Cambiar</button></div>'+
     '<div class="g2">'+(noKg?'':'<label class="field">'+(ex.ph?'Peso de UNA mancuerna (kg)':ex.bw||ex.sk?'Peso extra (kg)':'Peso (kg)')+'<input class="big-in" type="number" inputmode="decimal" step="any" min="0" value="'+esc(d.kg)+'" data-i="mk" data-f="kg" placeholder="0" enterkeyhint="next"></label>')+
     '<label class="field"'+(noKg?' style="grid-column:1/-1"':'')+'>'+(ex.time?'Segundos':'Repeticiones')+'<input class="big-in" type="number" inputmode="numeric" min="1" value="'+esc(d.reps)+'" data-i="mk" data-f="reps" placeholder="'+(ex.time?'30':'5')+'" enterkeyhint="done"></label></div>'+
     '<div id="markPrev">'+markPrev(d)+'</div><button class="btn pri wide big-btn stick" data-a="markGo">'+ic('bolt',18)+' Guardar y ver mi nivel</button>'+
     '<label class="mark-date">'+ic('cal',16)+'<span class="grow">¿Cuándo la hiciste?</span><input type="date" max="'+today()+'" value="'+esc(d.date)+'" data-i="mk" data-f="date"></label>';
  }
  /* reveal */
  const r=d.res,up=r.L>r.L0,first=r.L0==null||r.L0<0&&r.e0===0;
  const name=lvlName(r.L),col=lvlColor(r.L);
  const msg=r.L<0?'Todavía no llegás a Bronce 1. ¡Seguí así!':up&&!first?'¡Subiste de '+lvlName(r.L0)+'!':r.rec&&!first?'¡Récord personal!':first?'Tu primer nivel en este ejercicio':r.eq?'Igualaste tu mejor marca':'Tu mejor marca sigue siendo la anterior';
  return '<div class="reveal'+(up?' up':'')+'" style="--c:'+col+'"><div class="rv-rays"></div><div class="rv-badge">'+badge(r.L,132)+'</div>'+
   '<div class="rv-name" style="color:'+col+'">'+[...name].map((ch,i)=>'<span style="animation-delay:'+(700+i*45)+'ms">'+(ch===' '?'&nbsp;':esc(ch))+'</span>').join('')+'</div>'+
   '<p class="rv-msg">'+msg+'</p>'+(ex.st||REPS[ex.id]?'<div class="rv-pct">'+pctTxt(pctStronger(ex,(bestE1(ex.id)||{e:0}).e))+'</div>':'')+'<p class="mut sm-t tc">'+esc(ex.n)+' · '+((+d.kg?num(+d.kg,1)+' kg × ':'')+d.reps+(ex.time?' s':' reps'))+'</p>'+
   (r.L>=0&&r.L<18?'<div class="bar rv-bar"><i style="width:'+Math.round((r.L0===r.L?r.p0:0)*100)+'%;background:'+col+'" data-to="'+Math.round(r.pct*100)+'"></i></div><p class="mut sm-t tc">Para '+lvlName(r.L+1)+': '+needTxt(ex,r.L+1)+'</p>':'')+
   '</div><div class="g2"><button class="btn" data-a="markAgain">Cargar otra</button><button class="btn pri" data-a="close" data-v="m2">Listo</button></div>';
}
function exCreateHTML(d){
  return '<label class="field">Nombre<input type="text" maxlength="40" value="'+esc(d.n)+'" data-i="d" data-f="n" placeholder="Ej: Remo en máquina"></label>'+
   '<label class="field">Músculo principal<select data-i="d" data-f="p">'+Object.keys(MUSC).map(k=>'<option value="'+k+'"'+(d.p===k?' selected':'')+'>'+MUSC[k]+'</option>').join('')+'</select></label>'+
   '<div class="field"><span>Músculos secundarios</span><div class="chips">'+Object.keys(MUSC).filter(k=>k!==d.p).map(k=>'<button class="chip '+(d.s.includes(k)?'on':'')+'" data-a="cxS" data-v="'+k+'" aria-pressed="'+d.s.includes(k)+'">'+MUSC[k]+'</button>').join('')+'</div></div>'+
   '<div class="field"><span>Tipo</span><div class="seg"><button class="'+(d.type==='w'?'on':'')+'" data-a="cxT" data-v="w">Con peso</button><button class="'+(d.type==='b'?'on':'')+'" data-a="cxT" data-v="b">Peso corporal</button><button class="'+(d.type==='t'?'on':'')+'" data-a="cxT" data-v="t">Tiempo</button></div></div>'+
   '<button class="btn pri wide" data-a="cxSave">Crear ejercicio</button>';
}
function modalBody(m,l2){
  if(!m)return '';
  switch(m.t){
    case 'profile':return sheet(db.profile?'Tu perfil':'Bienvenido a Swole',profileHTML(m.d),{noClose:!db.profile});
    case 'routine':return sheet(m.d.id?'Editar rutina':'Nueva rutina',routineHTML(m.d));
    case 'ex':{const ex=exById(m.id);return sheet(ex?ex.n:'Ejercicio',exDetail(m.id));}
    case 'summary':return sheet('Resumen',summaryHTML(m));
    case 'exmenu':{const i=m.d.e,Ac=db.active,en=Ac&&Ac.entries[i],ex=en&&exById(en.ex);if(!ex)return '';const n=Ac.entries.length;
      const b=(a,icn,l,x)=>'<button class="fd-row" data-a="exMenuGo" data-v="'+a+'" data-e="'+i+'"'+(x||'')+'><span class="fd-ic">'+ic(icn,18)+'</span><span class="grow"><b>'+l+'</b></span></button>';
      return sheet(ex.n,'<div class="gap">'+b('exInfo','play','Técnica e historial',' data-x="'+ex.id+'"')+b('replEx','swap','Cambiar por uno parecido')+b('addSet','plus','Agregar una serie')+
        (i<n-1?b('ssTog','link',en.ss?'Quitar la superserie':'Superserie con el siguiente'):'')+(i>0?b('moveEntry','up','Subir'):'')+(i<n-1?b('moveDown','down','Bajar'):'')+b('delEntry','trash','Quitar del entreno')+'</div>',{l2:true});}
    case 'phcmp':return sheet('Antes y después',photoCmpHTML(m));
    case 'phview':return sheet('Foto de progreso',photoViewHTML(m),{l2:true});
    case 'friends':return sheet('Amigos',friendsHTML(m));
    case 'delacc':return sheet('Eliminar mi cuenta','<p>Se borra <b>para siempre</b>: tu cuenta, todos tus datos en la nube, tus amigos, solicitudes, torneos y recordatorios. También se borra lo que hay en este dispositivo.</p><p class="mut sm-t">No se puede deshacer. Si querés conservar algo, antes hacé una copia en Perfil → Copia de seguridad. Después podés crear una cuenta nueva con el mismo mail.</p><label class="field">Escribí <b>ELIMINAR</b> para confirmar<input id="delAccIn" type="text" autocomplete="off" autocapitalize="characters" placeholder="ELIMINAR"></label><div class="g2"><button class="btn" data-a="close" data-v="m2">Cancelar</button><button class="btn bad" data-a="delAccGo"'+(m.busy?' disabled':'')+'>'+(m.busy?'Borrando…':'Eliminar para siempre')+'</button></div>',{l2:true});
    case 'progs':return sheet('Programas',progsHTML(m.d||{}),{l2:true});
    case 'music':return sheet('Música',musicPickHTML(),{l2:true});
    case 'notif':return sheet('Avisos',notifHTML(),{l2:true});
    case 'podium':return sheet('Podio',podiumHTML(m.id),{l2:true});
    case 'skmark':return sheet('Ya la logro',skMarkHTML(m),{l2:true});
    case 'comp':return sheet('Nuevo torneo',compNewHTML(m),{l2:true});
    case 'fcard':return sheet('Perfil',friendCardHTML(S.social&&S.social.friends.concat(S.social.me?[S.social.me]:[]).find(r=>r.user_id===m.id)),{l2:true});
    case 'cmd':return cmdHTML(m);
    case 'tools':return sheet('Herramientas',toolsHTML(m));
    case 'rimport':return sheet('Rutina compartida',rimportHTML(m));
    case 'pl':return sheet('Powerlifting',plHTML(),{full:true});
    case 'joints':return sheet('Articulaciones de acero',jointsHTML(),{full:true});
    case 'ath':return sheet('Atleta',athHTML(),{full:true});
    case 'tree':return sheet('Árbol de habilidades',treeWrap(m),{full:true});
    case 'skplan':return sheet('Tu camino',skPlanHTML(skillPlan(m.id)),{l2:true});
    case 'excreate':return sheet('Ejercicio propio',exCreateHTML(m.d),{l2:true});
    case 'confirm':return sheet(m.title,'<p>'+esc(m.msg)+'</p><div class="g2"><button class="btn" data-a="close" data-v="m2">'+esc(m.no||'Cancelar')+'</button><button class="btn pri" data-a="'+m.act+'" data-v="'+esc(m.arg||'')+'">'+esc(m.ok||'Confirmar')+'</button></div>',{l2:true});
    case 'mark':return sheet(m.d.step==='reveal'?'Tu nivel':m.d.step==='form'?'Tu marca':'Elegí el ejercicio',markHTML(m.d),{l2:true});
    case 'carta':return '<div class="mback carta-back" data-a="back" data-v="modal"><div class="msheet carta-sheet" role="dialog" aria-modal="true" aria-label="Tu carta"><div class="mh-bar"><h3>Tu carta</h3><button class="ib flat" data-a="close" data-v="modal" aria-label="Cerrar">'+ic('x')+'</button></div>'+cartaHTML(true)+
     '<p class="mut sm-t tc" style="margin-top:12px">Tocala o deslizala para darla vuelta</p><div class="cbtns" style="margin-top:10px"><button class="btn" data-a="cardFlip">'+ic('swap',16)+' Dar vuelta</button><button class="btn pri" data-a="cardShare">Compartir</button>'+(window.DeviceOrientationEvent&&DeviceOrientationEvent.requestPermission?'<button class="btn" data-a="cardGyro">Moverla con el celu</button>':'<button class="btn" data-a="close" data-v="modal">Listo</button>')+'</div>'+
     '<p class="mut sm-t tc" style="margin-top:10px">FUE es tu fuerza en los básicos con barra; el resto, tu mejor ejercicio de cada zona. Suben a medida que subís de rango.</p></div></div>';
    case 'recap':return recapHTML(m);
    case 'quick':return sheet('¿Qué hacemos?',quickHTML());
    case 'food':return sheet(m.d.step==='photo'?'Tu plato':m.d.step==='bar'?'Código de barras':m.d.step==='new'?'Alimento propio':m.d.step==='quick'?'Anotar calorías':m.d.edit?'Editar':'Agregar a '+MEAL_N[m.d.m].toLowerCase(),foodHTML(m.d),{l2:true});
    case 'onb':return onbHTML(m);
    case 'plates':return sheet('Calculadora de discos',platesHTML(m.d),{l2:true});
    case 'gen':return sheet('Armame una rutina',genHTML(m.d),{l2:true});
    case 'logedit':return sheet('Editar entrenamiento',logEditHTML(m.d));
    case 'welcome':return welcomeHTML(m);
    case 'login':return sheet(LOGIN_T[m.d.mode]||'Tu cuenta',loginHTML(m.d),{l2:true,noClose:m.d.mode==='newpw'});
    case 'import':return sheet('Importar datos',csvHTML(m)+'<h4 style="margin:4px 0 6px">Desde una copia de Swole</h4><p class="mut sm-t">Pegá el contenido de un archivo exportado de Swole o elegí el archivo. Esto reemplaza lo que tenés ahora.</p><label class="field">Archivo<input type="file" accept=".json,application/json" data-i="file"></label><label class="field">O pegá el texto<textarea id="impTxt" spellcheck="false">'+esc(m.text||'')+'</textarea></label><button class="btn pri wide" data-a="importGo">Importar</button>',{l2:true});
  }
  return '';
}
/* al redibujar, cada hoja mantiene su scroll (antes volvía arriba de todo) */
function keepScroll(el,fn){const q='.msheet,.sess,.pick',k=[...el.querySelectorAll(q)].map(x=>x.scrollTop);keepX(el,fn);el.querySelectorAll(q).forEach((x,i)=>{if(k[i])x.scrollTop=k[i];});}
/* las tiras que se deslizan de costado (filtros) tampoco vuelven al principio, y el filtro elegido queda a la vista */
function keepX(el,fn,fresh){const q='.scroll-x',k=fresh?[]:[...el.querySelectorAll(q)].map(x=>[x.scrollLeft,x.children.length]);fn();
  el.querySelectorAll(q).forEach((x,i)=>{if(k[i]&&k[i][0]&&k[i][1]===x.children.length)x.scrollLeft=k[i][0];
    const on=x.querySelector('.on');if(!on)return;const c=x.getBoundingClientRect();if(!c.width)return;const r=on.getBoundingClientRect();
    if(r.left<c.left)x.scrollLeft-=c.left-r.left+14;else if(r.right>c.right)x.scrollLeft+=r.right-c.right+14;});}
/* onda desde el punto donde tocás (se ve como un botón real) */
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest('.btn,.chip,.opt button,.qtile,.ptile,.gen-cta,.onb-opts button,.seg button');if(!b||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const r=b.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2,i=document.createElement('i');
  i.className='rip';i.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(e.clientX-r.left-s/2)+'px;top:'+(e.clientY-r.top-s/2)+'px';
  if(getComputedStyle(b).position==='static')b.style.position='relative';b.style.overflow='hidden';b.style.overflow='clip';b.appendChild(i);setTimeout(()=>i.remove(),600);
},{passive:true});
/* ¿había un campo con el teclado abierto cuando empezó este toque? */
document.addEventListener('pointerdown',e=>{const a=document.activeElement;S.kbT=e.pointerType==='touch'&&a&&/^(INPUT|TEXTAREA)$/.test(a.tagName)&&!/^(checkbox|radio|range|file|button|submit|date|time|color)$/.test(a.type||'')?performance.now():0;},{capture:true,passive:true});
/* el teclado no tapa el botón de guardar: las hojas suben lo que ocupa el teclado */
if(window.visualViewport){const vv=visualViewport,rt=document.documentElement;const kbUpd=()=>{const kb=Math.max(0,Math.round(innerHeight-vv.height-vv.offsetTop)),on=kb>90;rt.style.setProperty('--kb',(on?kb:0)+'px');
  if(on!==rt.classList.contains('kb')){rt.classList.toggle('kb',on);if(on)setTimeout(()=>{const a=document.activeElement;if(a&&a.closest&&a.closest('.msheet,.pick'))try{a.scrollIntoView({block:'nearest'});}catch(x){}},80);}};
  vv.addEventListener('resize',kbUpd);vv.addEventListener('scroll',kbUpd);}
/* al tocar un número se selecciona entero: escribís encima sin tener que borrar */
document.addEventListener('focusin',e=>{const t=e.target;if(t&&t.tagName==='INPUT'&&t.type==='number'&&t.value!=='')setTimeout(()=>{try{if(document.activeElement===t)t.select();}catch(x){}},0);});
/* si la ventana ya estaba abierta y solo cambió su contenido, no repite la animación de entrada (evita el parpadeo) */
function renderModal(){syncLayers();
  const put=(el,m,l2,k)=>{
    /* al cerrar, la hoja baja y se desvanece antes de irse */
    if(!m){if(el.querySelector(':scope>.mback')&&!el.querySelector(':scope>.mback.leaving')){S[k]=null;if(S[k+'s']){S[k+'s']='';S.layT=performance.now();}leaveLayer(el,':scope>.mback',()=>!(k==='_mk'?S.modal:S.m2));return;}if(el.querySelector(':scope>.mback.leaving'))return;}
    else clearTimeout(el._lv);
    if(m&&m.d&&typeof m.d==='object'&&(m._s==null||m._ss!==m.d.step)){m._ss=m.d.step;m._s=snapOf(m);}keepScroll(el,()=>{el.innerHTML=m?modalBody(m,l2):'';});const t=m?m.t:null,ke=el.querySelector('[key]'),kk=t?t+'|'+(ke?ke.getAttribute('key'):''):null,prev=S[k]||'';{const dg=el.querySelector('[role=dialog]'),sg=t?t+'|'+(dg?dg.getAttribute('aria-label'):''):'';if(sg!==(S[k+'s']||'')){S[k+'s']=sg;S.layT=performance.now();}}
    /* misma ventana: sin fundido; mismo paso: el contenido no vuelve a animarse */
    if(t&&prev.split('|')[0]===t)el.querySelectorAll('.mback').forEach(x=>x.classList.add('stay'));if(kk&&prev===kk)el.querySelectorAll('.mback').forEach(x=>x.classList.add('same'));S[k]=kk;};
  put($('#modal'),S.modal,false,'_mk');put($('#modal2'),S.m2,true,'_m2k');
  if(window.rtApply&&document.getElementById('rtSvg'))rtApply();
}
/* capas que entran y salen con movimiento: solo la primera vez entran (redibujar no repite la animación) y al cerrarse salen antes de borrarse */
const calmMotion=()=>!!(db.settings&&db.settings.calm)||matchMedia('(prefers-reduced-motion: reduce)').matches;
function leaveLayer(el,sel,still){const x=el.querySelector(sel);if(!x||calmMotion()){el.innerHTML='';return;}if(x.classList.contains('leaving'))return;x.classList.remove('stay','same');x.classList.add('leaving');clearTimeout(el._lv);el._lv=setTimeout(()=>{if(still())el.innerHTML='';},280);}
function enterLayer(el,sel,draw){const had=el.querySelector(sel+':not(.leaving)');clearTimeout(el._lv);draw();const x=el.querySelector(sel);if(x&&had)x.classList.add('stay');}
function renderSess(){
  const el=$('#sess');
  if(db.active&&S.sessOpen){enterLayer(el,'.sess',()=>keepScroll(el,()=>{el.innerHTML=sessHTML();}));document.body.classList.add('sessopen');}
  else{leaveLayer(el,'.sess',()=>!(db.active&&S.sessOpen));document.body.classList.remove('sessopen');}
}
/* en Inicio, la rutina planeada de hoy queda abajo, al alcance del pulgar */
function todayGoHTML(){
  if(db.active||S.tab!=='inicio'||openLayers()||!db.profile)return '';
  const t=today(),pl=plannedFor(t).filter(r=>!doneOn(t).some(l=>l.routineId===r.id));if(!pl.length)return '';
  return '<button class="pillb go" data-a="startR" data-v="'+pl[0].id+'">'+ic('play',20)+'<span class="grow"><small>Entreno de hoy</small><b>'+esc(pl[0].name)+'</b></span>'+ic('right',18)+'</button>';
}
function renderPill(){
  const el=$('#pill');
  if(db.active&&!S.sessOpen)el.innerHTML='<button class="pillb" data-a="sessOpen">'+ic('timer')+'<span class="grow">'+esc(db.active.name)+'</span><span id="pillT">'+fmtT((Date.now()-db.active.t0)/1000)+'</span></button>';
  else el.innerHTML=todayGoHTML();
}
/* Selector de ejercicios */
/* las tarjetas que están más abajo aparecen suaves cuando llegan a la pantalla */
const REV=('IntersectionObserver' in window)&&!matchMedia('(prefers-reduced-motion: reduce)').matches?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');REV.unobserve(e.target);}}),{rootMargin:'0px 0px -6% 0px'}):null;
function revealSoon(v){if(!REV||db.settings.calm)return;requestAnimationFrame(()=>{const vh=innerHeight;v.querySelectorAll(':scope>.card,:scope>.subview>.card,:scope>section').forEach(c=>{if(c.dataset.rv)return;c.dataset.rv=1;if(c.getBoundingClientRect().top>vh*.92){c.classList.add('rv');REV.observe(c);}});});}
function renderPicker(){
  const el=$('#picker');syncLayers();
  if(!S.picker){leaveLayer(el,'.pick',()=>!S.picker);return;}
  const had=el.querySelector('.pick:not(.leaving)');clearTimeout(el._lv);
  keepScroll(el,()=>{el.innerHTML='<div class="pick'+(S.picker.target==='gen'?' ptop':'')+'"><div class="pick-in"><div class="pick-top"><div class="row"><h2 class="grow" style="font:800 24px var(--f-d)">'+(pickCtx()?'Cambiar ejercicio':'Elegir ejercicios')+'</h2><button class="btn pri sm" data-a="pickDone">Listo</button></div>'+
   '<div class="field"><input id="pq" type="search" placeholder="Buscar ejercicio" value="'+esc(S.picker.q)+'" data-i="pq" aria-label="Buscar ejercicio"></div><div class="scroll-x" id="pg">'+pickChips()+'</div></div>'+pickSimilar()+'<div class="gap" id="pres">'+pickResults()+'</div>'+(S.picker.target==='gen'||S.picker.target==='rswap'?'':'<button class="btn wide" style="margin-top:14px" data-a="newEx">'+ic('plus',18)+' Crear ejercicio propio</button>')+'</div></div>';});
  if(had){const x=el.querySelector('.pick');if(x)x.classList.add('stay');}
}
function pickChips(){return GROUP_TABS().map(g=>'<button class="chip '+((S.picker.g||'Todos')===g?'on':'')+'" data-a="pgrp" data-v="'+g+'">'+g+'</button>').join('');}
function pickCtx(){const P=S.picker;if(!P)return null;
  if(P.target==='gen'){const d=S.m2&&S.m2.d,r=d&&d.plan&&d.plan[P.ri],it=r&&r.items[P.ii];return it?{id:it.ex,eq:d.goals.includes('cali')?'bw':d.eq,inj:d.inj,lv:{beg:0,int:1,adv:2}[d.lvl],skip:r.items.map(x=>x.ex)}:null;}
  if(P.target==='replace'){const en=db.active&&db.active.entries[P.idx];return en?{id:en.ex,skip:db.active.entries.map(x=>x.ex),lv:2}:null;}
  if(P.target==='rswap'){const it=S.modal&&S.modal.d&&S.modal.d.items[P.idx];return it?{id:it.ex,skip:S.modal.d.items.map(x=>x.ex),lv:2}:null;}
  return null;}
function pickSimilar(){const c=pickCtx();if(!c)return '';const src=exById(c.id),l=similarEx(c.id,c);if(!src||!l.length)return '';
  return '<div class="psim"><h3>Trabajan lo mismo que '+esc(src.n)+'</h3><span class="mut sm-t">Mismos músculos y movimiento, con lo que tenés a mano</span><div class="gap" style="margin-top:10px">'+
    l.map((e,i)=>exRow(e,'pickAdd',(i===0?'<span class="tag rec">Recomendado</span>':'')+'<span class="chip on">'+ic('swap',14)+'</span>')).join('')+'</div><h3 style="margin-top:18px">Todos los ejercicios</h3></div>';}
function pickResults(){const l=filterEx(S.picker.q,S.picker.g);return l.length?l.map(e=>exRow(e,'pickAdd','<span class="chip on">'+ic('plus',14)+'</span>')).join(''):'<div class="empty">Ningún ejercicio coincide.</div>';}

/* ============ Render principal ============ */
const SUBV={rutinas:viewRutinas,cal:viewCal};
const stripTitle=x=>x.replace(/^<h1 class="pg">[^<]*<\/h1>/,'');
function viewEntrenar(){
  const e=SUBV[S.etab]?S.etab:'rutinas';
  return '<h1 class="pg">Entrenar</h1><div class="seg zone-seg" style="margin-bottom:16px">'+ETABS.map(t=>'<button class="'+(e===t.id?'on':'')+'" data-a="etab" data-v="'+t.id+'">'+t.l+'</button>').join('')+'</div><div class="subview">'+stripTitle(SUBV[e]())+'</div>';
}
/* cómo se siente la app: vibración, botones abajo, animaciones */
function prefsCard(){
  const s=db.settings,row=(k,t,d,on)=>'<button class="pref" data-a="prefTog" data-v="'+k+'" role="switch" aria-checked="'+on+'"><span class="grow"><b>'+t+'</b><small>'+d+'</small></span><i class="sw'+(on?' on':'')+'"></i></button>';
  return '<div class="card"><div class="hd"><div><h3>Preferencias</h3><span class="mut sm-t">Cómo se siente la app</span></div></div>'+
    row('haptics','Vibración','Al marcar series, terminar el descanso y subir de rango',s.haptics!==false)+
    row('oneHand','Modo una mano','Guardar y terminar quedan fijos abajo, al alcance del pulgar',s.oneHand!==false)+
    row('calm','Menos animaciones','Para celulares lentos o si te marean',!!s.calm)+'</div>';
}
function applyPrefs(){const r=document.documentElement,s=db.settings||{};r.classList.toggle('oneh',s.oneHand!==false);r.classList.toggle('calm',!!s.calm);}
function viewPerfil(){
  let h='<h1 class="pg">Perfil</h1>';
  if(!S.pf)S.pf=Object.assign({sex:'m',age:'',height:'',weight:'',activity:2,goal:'recomp',nick:'',sport:''},db.profile||{});
  h+='<div class="card"><div class="hd"><div><h3>Color de la app</h3><span class="mut sm-t">Elegí el que más te guste</span></div></div><div class="acc-row">'+ACCENTS.map(([k,n,a,b,need])=>{const lock=need&&frCount()<need;return '<button class="acc-sw'+((db.settings.accent||'aurora')===k?' on':'')+(lock?' lock':'')+'" data-a="accent" data-v="'+k+'" style="--a:'+a+';--b:'+b+'" aria-pressed="'+((db.settings.accent||'aurora')===k)+'"><i>'+(lock?ic('lock',14):'')+'</i>'+n+(lock?'<small>'+need+(need===1?' amigo':' amigos')+'</small>':'')+'</button>';}).join('')+'</div>'+
   (frCount()<3?'<button class="inv-cta" data-a="invite">'+ic('share',16)+'<span class="grow"><b>Invitá amigos y desbloqueá colores</b><small>Tenés '+frCount()+' de 3 · con 1 se abre Oro, con 3 Élite</small></span>'+ic('right',16)+'</button>':'')+'</div>';
  h+=pushCard();
  h+=prefsCard();
  return h+'<div class="card"><div class="hd"><div><h3>Deportes y semana</h3><span class="mut sm-t">Lo usan tus rutinas, la recuperación y las calorías</span></div></div><div class="mbody">'+(db.profile?weekEditor():'')+'</div></div><div class="card"><div class="mbody">'+profileHTML(S.pf)+'</div></div><div class="card row"><div class="grow"><b>Tema</b><br><span class="mut sm-t">'+(effTheme()==='dark'?'Oscuro':'Claro')+'</span></div><button class="btn sm" data-a="theme">'+ic(effTheme()==='dark'?'sun':'moon',16)+' Cambiar</button></div>';
}
const VIEWS={inicio:viewInicio,entrenar:viewEntrenar,niveles:viewNiveles,nutri:viewNutri,perfil:viewPerfil};
function render(){
  const tb=t=>'<button class="'+(S.tab===t.id?'on':'')+'" data-a="tab" data-v="'+t.id+'" '+(S.tab===t.id?'aria-current="page"':'')+'>'+ic(t.i,22)+'<span>'+t.l+'</span></button>';
  const ti=TABS.findIndex(t=>t.id===S.tab),slot=ti<0?-1:ti<2?ti:ti+1;
  $('#nav').innerHTML='<span class="nav-ind" style="--s:'+slot+';opacity:'+(slot<0?0:1)+'"></span>'+tb(TABS[0])+tb(TABS[1])+'<button class="fab'+(db.active?' live':'')+'" data-a="'+(db.active?'sessOpen':'quickOpen')+'" aria-label="'+(db.active?'Volver al entreno':'Acción rápida')+'">'+ic(db.active?'timer':'plus',26)+'<span class="fab-l">'+(db.active?'Volver al entreno':'Acción rápida')+'</span></button>'+tb(TABS[2])+tb(TABS[3]);
  const av=$('#avatarSlot');if(av)av.innerHTML=avatarHTML();
  const v=$('#view'),key=S.tab+'/'+(S.tab==='entrenar'?S.etab||'hoy':''),changed=S.lastTab!==key;
  if(changed&&S.lastTab&&!db.settings.calm){const nb=document.querySelector('#nav button.on');if(nb)nb.classList.add('pop');}
  const order=['inicio/','entrenar/rutinas','entrenar/cal','niveles/','nutri/','perfil/'],dir=order.indexOf(key)>=order.indexOf(S.lastTab||'')?'fwd':'back';S.lastTab=key;
  try{keepX(v,()=>{v.innerHTML=VIEWS[S.tab]();},changed);}
  catch(err){console.error(err);v.innerHTML='<div class="card"><h3>Algo falló en esta pantalla</h3><p class="mut sm-t" style="margin-top:6px">Tus datos siguen guardados. Probá recargar; si vuelve a pasar, bajá una copia y avisanos.</p><div class="g2" style="margin-top:12px"><button class="btn" data-a="export">Bajar una copia</button><button class="btn pri" data-a="reload">Recargar</button></div></div>';}
  revealSoon(v);
  if(changed&&!S.vt){v.classList.remove('enter','fwd','back');void v.offsetWidth;v.classList.add('enter',dir);countUp(v);clearTimeout(S.enterT);S.enterT=setTimeout(()=>v.classList.remove('enter'),1400);}
  applyTheme();applyPrefs();renderModal();renderSess();renderPicker();renderPill();renderRest();syncLayers();
  /* el fondo toma el color de tu rango general */
  try{const ov=db.profile?overall():null;document.documentElement.style.setProperty('--tier',ov?TCOL[Math.min(6,Math.floor(ov.L/3))]:'#5B43F0');}catch(e){}
}
function countUp(root){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  root.querySelectorAll('[data-n]').forEach(el=>{const to=+el.dataset.n;if(!(to>0))return;const t0=performance.now(),d=700;
    const step=t=>{const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=el.dataset.fmt?nf(to*e):Math.round(to*e);if(p<1)requestAnimationFrame(step);};requestAnimationFrame(step);});
}
/* ============ Gestos: arrastrar para ordenar, mover rutinas de día y mantener apretado ============
   Listas [data-dl]: el ítem [data-di] se agarra de la manija .dh y los demás se corren para hacerle lugar.
   Semana: la rutina [data-wkr] se suelta sobre un día [data-wkday]. Ejercicio del entreno [data-lp]: mantener apretado abre su menú. */
const DLISTS={
  rt:(a,b)=>{const it=S.modal&&S.modal.d&&S.modal.d.items;if(!it)return;it.splice(b,0,it.splice(a,1)[0]);renderModal();},
  sess:(a,b)=>{const Es=db.active&&db.active.entries;if(!Es)return;Es.splice(b,0,Es.splice(a,1)[0]);save();renderSess();}
};
(()=>{
  let L=null,W=null,lp=null,lpFired=false;
  const scroller=el=>el.closest('.msheet,.sess')||document.scrollingElement;
  document.addEventListener('pointerdown',e=>{
    if(e.button>0)return;
    const h=e.target.closest('.dh'),it=h&&h.closest('[data-di]'),list=it&&it.closest('[data-dl]');
    if(list){e.preventDefault();const items=[...list.querySelectorAll(':scope>[data-di]')],sc=scroller(list),rects=items.map(x=>x.getBoundingClientRect());
      L={list,items,rects,el:it,sc,from:items.indexOf(it),y0:e.clientY,s0:sc.scrollTop,gap:items.length>1?Math.max(0,rects[1].top-rects[0].bottom):10};L.to=L.from;
      it.classList.add('dragging');list.classList.add('dragging');try{h.setPointerCapture(e.pointerId);}catch(x){}buzz(8);return;}
    const c=e.target.closest('[data-wkr]');
    if(c){W={c,x0:e.clientX,y0:e.clientY,on:false};return;}
    const card=e.target.closest('[data-lp]');
    if(card&&e.target.closest('.entry>.row')&&!e.target.closest('input,.dh')){const i=+card.dataset.lp;
      lp={x0:e.clientX,y0:e.clientY,t:setTimeout(()=>{lp=null;lpFired=true;buzz(12);S.m2={t:'exmenu',d:{e:i}};render();},460)};}
  },true);
  document.addEventListener('pointermove',e=>{
    if(lp&&Math.hypot(e.clientX-lp.x0,e.clientY-lp.y0)>10){clearTimeout(lp.t);lp=null;}
    if(L){e.preventDefault();const r=L.rects,f=L.from,H=r[f].height+L.gap,v=e.clientY,doc=L.sc===document.scrollingElement;
      const sr=doc?{top:0,bottom:innerHeight}:L.sc.getBoundingClientRect();
      if(v<sr.top+60)L.sc.scrollTop-=8;else if(v>sr.bottom-60)L.sc.scrollTop+=8;
      const dy=v-L.y0+(L.sc.scrollTop-L.s0),mid=r[f].top+r[f].height/2+dy;let to=0;r.forEach((x,i)=>{if(i!==f&&x.top+x.height/2<mid)to++;});L.to=to;
      L.el.style.transform='translateY('+dy+'px)';
      L.items.forEach((x,i)=>{if(i===f)return;const s=f<to&&i>f&&i<=to?-H:to<f&&i>=to&&i<f?H:0;x.style.transform=s?'translateY('+s+'px)':'';});return;}
    if(W){if(!W.on&&Math.hypot(e.clientX-W.x0,e.clientY-W.y0)>8){W.on=true;const b=W.c.getBoundingClientRect(),g=W.c.cloneNode(true);
        g.classList.add('wk-ghost');g.removeAttribute('data-a');g.removeAttribute('data-wkr');g.style.left=b.left+'px';g.style.top=b.top+'px';g.style.width=b.width+'px';document.body.appendChild(g);W.g=g;W.c.classList.add('ghosted');buzz(8);}
      if(W.on){e.preventDefault();W.g.style.transform='translate('+(e.clientX-W.x0)+'px,'+(e.clientY-W.y0)+'px) rotate(-2deg) scale(1.05)';
        const o=document.elementFromPoint(e.clientX,e.clientY),day=o&&o.closest('[data-wkday]');
        document.querySelectorAll('.wkp-d.over').forEach(x=>{if(x!==day)x.classList.remove('over');});if(day)day.classList.add('over');W.day=day;}}
  },{passive:false});
  const end=()=>{
    if(lp){clearTimeout(lp.t);lp=null;}
    /* el toque que suelta el dedo no puede activar lo que quedó abajo */
    if(lpFired){lpFired=false;S.layT=performance.now();}
    if(L){const{from,to,items,list,el}=L,name=list.dataset.dl;L=null;items.forEach(x=>x.style.transform='');el.classList.remove('dragging');list.classList.remove('dragging');
      if(to!==from&&DLISTS[name]){DLISTS[name](from,to);buzz(10);}}
    if(W){const w=W;W=null;if(!w.on)return;w.g.remove();w.c.classList.remove('ghosted');document.querySelectorAll('.wkp-d.over').forEach(x=>x.classList.remove('over'));S.layT=performance.now();
      if(w.day){const[id,from]=w.c.dataset.wkr.split('|');S.wkSel=null;wkMove(id,+from,+w.day.dataset.wkday);}}
  };
  document.addEventListener('pointerup',end,true);document.addEventListener('pointercancel',end,true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest('[data-lp]>.row,.dh,[data-wkr]'))e.preventDefault();});
})();
/* gráficos: tocar o arrastrar muestra el valor del día más cercano */
document.addEventListener('pointerdown',e=>{const sv=e.target.closest('svg.chart[data-pts]');if(!sv)return;const pts=JSON.parse(sv.dataset.pts||'[]');if(!pts.length)return;
  const show=ev2=>{const r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal,x=(ev2.clientX-r.left)/r.width*vb.width;let b=pts[0];pts.forEach(p=>{if(Math.abs(p[0]-x)<Math.abs(b[0]-x))b=p;});
    let g=sv.querySelector('.ch-tip');if(!g){g=document.createElementNS('http://www.w3.org/2000/svg','g');g.setAttribute('class','ch-tip');sv.appendChild(g);}
    const tx=Math.min(vb.width-60,Math.max(60,b[0]));g.innerHTML='<line x1="'+b[0]+'" x2="'+b[0]+'" y1="8" y2="'+(vb.height-22)+'"/><circle cx="'+b[0]+'" cy="'+b[1]+'" r="5"/><rect x="'+(tx-56)+'" y="0" width="112" height="20" rx="6"/><text x="'+tx+'" y="14" text-anchor="middle">'+b[2]+' · '+b[3]+'</text>';};
  show(e);const mv=ev2=>show(ev2),up=()=>{document.removeEventListener('pointermove',mv);document.removeEventListener('pointerup',up);};document.addEventListener('pointermove',mv);document.addEventListener('pointerup',up);},{passive:true});
/* ============ Capas como en una app nativa ============ */
/* Cada ventana abierta suma una entrada al historial: el botón atrás de Android la cierra en vez de salir de la app. */
let hDepth=0,ignorePop=0,layerQ=false,wakeLock=null;
const openLayers=()=>(S.sessOpen&&db.active?1:0)+(S.modal?1:0)+(S.picker?1:0)+(S.m2?1:0);
/* estar fuera de Inicio cuenta como un paso más del historial: atrás en Android vuelve a Inicio en vez de cerrar la app */
const histDepth=()=>openLayers()+(S.tab!=='inicio'?1:0);
/* hojas donde estás armando algo: tocar afuera o deslizar hacia abajo no las cierra (para eso está la X) */
const DRAFT_T=['routine','logedit','gen','excreate','comp','import','login','delacc'];
const isDraft=w=>{const m=w==='m2'?S.m2:S.modal;return !!m&&(DRAFT_T.includes(m.t)||(m.t==='mark'&&m.d.step==='form')||(m.t==='food'&&['new','quick'].includes(m.d.step)));};
function syncLayers(){if(layerQ)return;layerQ=true;queueMicrotask(()=>{layerQ=false;
  const d=histDepth();
  while(hDepth<d){try{history.pushState({sw:hDepth+1},'');}catch(e){}hDepth++;}
  if(hDepth>d){const n=hDepth-d;hDepth=d;ignorePop++;try{history.go(-n);}catch(e){ignorePop--;}}
  lockScroll(openLayers()>0);
  keepAwake(!!db.active);
});}
window.addEventListener('popstate',()=>{
  if(ignorePop>0){ignorePop--;return;}
  hDepth=Math.max(0,hDepth-1);
  if(S.modal&&S.modal.t==='recap')clearTimeout(S.recapT);
  /* en la marca, atrás vuelve del formulario a la lista en vez de cerrar todo */
  if(S.m2&&S.m2.t==='mark'&&S.m2.d.step==='form'&&!S.m2.d.direct&&!S.picker&&!isDirty('m2')){S.m2.d.step='pick';try{history.pushState({sw:hDepth+1},'');hDepth++;}catch(e){}renderModal();return;}
  /* el selector abierto desde el asistente está arriba de todo: se cierra primero */
  if(S.picker&&(S.picker.target==='gen'||!S.m2))S.picker=null;
  /* atrás sobre una ventana con cambios sin guardar pregunta antes de tirarlos (el render de abajo repone el paso del historial) */
  else if(S.m2){if(!askDiscard('m2'))S.m2=null;}
  else if(S.modal){if((S.modal.t==='profile'&&!db.profile)||S.modal.t==='welcome'||S.modal.t==='onb'){try{history.pushState({sw:hDepth+1},'');hDepth++;}catch(e){}return;}if(!askDiscard('modal')){if(S.modal.t==='tools'&&S.iv){S.modal=null;ACTIONS.ivStop();}S.modal=null;}}
  else if(S.sessOpen)S.sessOpen=false;
  else if(S.tab!=='inicio'){goTab('inicio');window.scrollTo(0,0);}
  render();
});
function lockScroll(on){
  const r=document.documentElement,b=document.body,isOn=r.classList.contains('locked');
  /* en compu alcanza con ocultar el desborde (la barra reserva su lugar); el truco de fijar el body es solo para celulares */
  const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(on&&!isOn){S.lockY=window.scrollY;if(!fine)Object.assign(b.style,{position:'fixed',top:(-S.lockY)+'px',left:'0',right:'0',width:'100%'});r.classList.add('locked');}
  else if(!on&&isOn){r.classList.remove('locked');if(b.style.position==='fixed'){Object.assign(b.style,{position:'',top:'',left:'',right:'',width:''});window.scrollTo(0,S.lockY||0);}}
}
/* la pantalla no se apaga mientras hay un entreno en curso */
async function keepAwake(on){
  try{
    if(on&&!wakeLock&&'wakeLock' in navigator&&document.visibilityState==='visible'){wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}
    else if(!on&&wakeLock){const w=wakeLock;wakeLock=null;await w.release();}
  }catch(e){wakeLock=null;}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')keepAwake(!!db.active);});
/* deslizar una ventana hacia abajo la cierra */
(()=>{let sh=null,y0=0,dy=0,which=null;
  document.addEventListener('touchstart',e=>{
    const s=e.target.closest('.msheet');if(!s||s.classList.contains('full'))return;
    const bar=e.target.closest('.mh-bar');if(!bar&&s.scrollTop>0)return;
    if(!s.querySelector('[data-a="close"]'))return;
    if(e.target.closest('input,textarea,select,.dh,[data-wkr]')||isDraft(s.parentElement.dataset.v))return;
    sh=s;y0=e.touches[0].clientY;dy=0;which=s.parentElement.dataset.v;sh.style.transition='none';
  },{passive:true});
  document.addEventListener('touchmove',e=>{if(!sh)return;dy=Math.max(0,e.touches[0].clientY-y0);if(dy>4)sh.style.transform='translateY('+dy+'px)';},{passive:true});
  document.addEventListener('touchend',()=>{if(!sh)return;const s=sh;sh=null;s.style.transition='transform .25s cubic-bezier(.2,.8,.2,1)';
    if(dy>110){s.style.transform='translateY(110%)';setTimeout(()=>closeLayer(which),200);}else s.style.transform='';});
})();
