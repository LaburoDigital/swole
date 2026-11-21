'use strict';
/* ============ Tutorial: recorrido guiado por la app real ============
   Un foco se mueve y se agranda de una parte de la pantalla a la otra, con una tarjeta que explica qué hace.
   Primero "Cómo funciona Swole" (lo esencial) y después cada tema a fondo, desde un menú.
   Cada paso: t = pestaña (y sub-pestaña), q = qué resaltar (selector o función), h = título, p = texto. Sin q: tarjeta centrada. */
const Tour=(()=>{
  const card=txt=>()=>[...document.querySelectorAll('#view .card,#view .lvl-hero,#view .gen-cta,#view .qgrid')].find(e=>e.textContent.includes(txt));
  const nav=v=>'#nav button[data-v="'+v+'"]';
  const go=(tab,extra)=>()=>{if(extra)extra();goTab(tab);render();window.scrollTo(0,0);};
  const TOPICS=[
    ['inicio','Inicio','home','Tu rango, misiones, el entreno de hoy y tu coach'],
    ['entrenar','Entrenar','dumb','Rutinas, el generador, el entreno en vivo y el calendario'],
    ['nivel','Nivel','rank','Cómo se calcula tu rango, tus ejercicios y la carta'],
    ['nutri','Nutrición','flame','Comidas, foto del plato, calorías y peso'],
    ['social','Amigos y más','users','Amigos, torneos, buscador, avisos y tu perfil']
  ];
  const T={
    main:[
      {h:'Bienvenido a Swole',p:'Entrenás, medís y subís de rango. En dos minutos te muestro dónde está cada cosa. Podés salir cuando quieras y volver desde Perfil.',big:'home'},
      {t:go('inicio'),q:'.lvl-hero',h:'Tu rango general',p:'De Bronce a Élite. Sale de tus mejores marcas de cada grupo muscular, comparadas con gente de tu edad, peso y sexo.'},
      {q:'#nav',h:'Las cuatro secciones',p:'Inicio, Entrenar, Nivel y Nutrición. Tocás o deslizás de costado para pasar de una a otra.'},
      {q:'.fab',h:'El botón del medio',p:'Lo que más usás a un toque: empezar a entrenar, cargar una marca, anotar comida, agua o creatina.'},
      {t:go('rutinas'),q:card('Armame una rutina'),h:'Rutinas a tu medida',p:'Le decís tu objetivo, tus días, tu tiempo, tu equipo y si tenés alguna lesión, y te arma la semana.'},
      {t:go('niveles',()=>{S.ntab='res';}),q:'.nv-seg',h:'Tu nivel, ordenado',p:'Resumen, cada ejercicio, tu progreso y tu carta de atleta.'},
      {t:go('nutri'),q:'.meals-card',h:'Comidas y calorías',p:'Anotás lo que comés: buscando, con el código de barras o sacándole una foto al plato.'},
      {t:go('inicio'),q:'#socBtn',h:'Amigos',p:'Rankings justos (ajustados por peso, edad y sexo), torneos y los entrenos de tus amigos.'},
      {topics:1,h:'¿Querés ver cada parte a fondo?',p:'Elegí un tema. Lo podés repetir cuando quieras desde Perfil → Ver el tutorial.'}
    ],
    inicio:[
      {t:go('inicio'),q:'.lvl-hero',h:'Rango general',p:'Tocá "Ver mi carta" para tu carta de atleta, o "Marca" para cargar un récord y ver cuánto subís.'},
      {q:'.card.mis',h:'Misiones de la semana',p:'Tres objetivos chicos que se renuevan cada semana. Cumplirlos suma puntos a tu temporada.'},
      {q:card('Entreno de hoy'),h:'Entreno de hoy',p:'Según qué músculos ya se recuperaron y tu semana. Si tenés una rutina planeada, también aparece el botón abajo para arrancarla.'},
      {q:'.card.coach',h:'Tu coach',p:'Lee tu historial: te avisa si un ejercicio se estancó, si te falta tirón o piernas, o si venís bárbaro.'},
      {q:card('Recuperación'),h:'Recuperación',p:'Cada músculo con cuánto le falta para estar listo, según lo que entrenaste y cuánto.'},
      {q:'.qgrid',h:'Accesos rápidos',p:'Lo de todos los días: agua, creatina, sueño y más.'}
    ],
    entrenar:[
      {t:go('rutinas',()=>{S.rtab='rut';}),q:'.zone-seg',h:'Rutinas y Calendario',p:'Arriba elegís entre tus rutinas y el calendario.'},
      {q:card('Armame una rutina'),h:'El generador',p:'Objetivos, habilidades de calistenia, tiempo por sesión y lesiones. En la vista previa podés tocar cada ejercicio para verlo, cambiarlo o quitarlo.'},
      {q:card('Programas famosos'),h:'Programas famosos',p:'5×5, PPL, 5/3/1 y más, listos para usar.'},
      {q:()=>document.querySelector('#view .rcard,#view [data-a="startR"]')?.closest('.card'),h:'Tus rutinas',p:'Empezar, editar o compartir. En el editor arrastrás los ejercicios de la manija para ordenarlos.'},
      {h:'Durante el entreno',p:'Tildás cada serie y arranca el descanso. Mantené apretado un ejercicio para cambiarlo, ver la técnica o quitarlo. "Igual a la anterior" y "Última vez" completan la serie de un toque.',big:'timer'},
      {t:go('cal'),q:'.wkp',h:'Tu semana',p:'Arrastrá una rutina a otro día (o tocala y después tocá el día).'},
      {q:()=>document.querySelectorAll('#view .card')[1],h:'Calendario',p:'Cada día entrenado, lo planeado y la creatina. Tocá un día para ver o editar lo que hiciste.'}
    ],
    nivel:[
      {t:go('niveles',()=>{S.ntab='res';}),q:card('Por grupo muscular'),h:'Por grupo muscular',p:'Manda tu mejor ejercicio de cada grupo. Tocá un ejercicio para ver o borrar sus registros, o para que no cuente.'},
      {q:card('Tu cuerpo'),h:'Tu cuerpo',p:'Cada músculo pintado con su rango. Tocá uno para ver de qué ejercicio sale.'},
      {q:'.mark-cta',h:'Cargar una marca',p:'Poné peso y repeticiones de tu mejor serie y ves tu nivel al instante.'},
      {t:go('niveles',()=>{S.ntab='ej';}),q:()=>document.querySelector('#view .ex'),h:'Cada ejercicio',p:'Tu nivel, cuánto te falta para el siguiente y qué porcentaje de gente que entrena superás.'},
      {q:card('Calistenia'),h:'Calistenia',p:'En calistenia tu nivel sale de la variante que dominás. El árbol muestra todas las progresiones.'},
      {t:go('niveles',()=>{S.ntab='prog';}),q:()=>document.querySelector('#view .card'),h:'Progreso',p:'Objetivos, lo que más mejoró, tus récords y tu constancia.'},
      {t:go('niveles',()=>{S.ntab='carta';}),q:'.carta-card',h:'Tu carta',p:'Tu rango, tu cuerpo y seis atributos. La podés compartir.'}
    ],
    nutri:[
      {t:go('nutri'),q:'.meals-card',h:'Comidas del día',p:'Agregás a cada comida buscando, con el código de barras o con una foto: el celu reconoce el plato gratis y aprende de tus correcciones.'},
      {q:card('Tu objetivo'),h:'Tu objetivo',p:'Calorías y proteína según tu cuerpo, tu actividad y lo que entrenaste.'},
      {q:card('Peso corporal'),h:'Peso con tendencia',p:'La línea suave muestra hacia dónde vas de verdad, sin el ruido del agua de cada día.'},
      {q:card('Creatina'),h:'Creatina y agua',p:'Un toque por día. Te puede avisar con un recordatorio.'}
    ],
    social:[
      {t:go('inicio'),q:'#socBtn',h:'Amigos y torneos',p:'Agregás amigos con su código, ves el ranking por ejercicio y armás torneos de un mes.'},
      {q:'header.top .tools .ib[data-a="cmdOpen"]',h:'Buscador',p:'Encontrá cualquier ejercicio, pantalla o acción escribiendo.'},
      {q:'#avatarSlot',h:'Tu perfil',p:'Tus datos, tu semana y deportes, el color de la app, recordatorios, copia de seguridad y preferencias.'},
      {t:go('perfil'),q:card('Preferencias'),h:'Preferencias',p:'Vibración, modo una mano (botones abajo) y menos animaciones.'}
    ]
  };
  let st=null;
  const el=()=>document.getElementById('tour');
  function start(name){
    const cont=el()||Object.assign(document.createElement('div'),{id:'tour'});
    if(!cont.parentNode)document.body.appendChild(cont);
    cont.innerHTML='<div class="t-spot"></div><div class="t-card" role="dialog" aria-live="polite"></div>';
    const sp=cont.querySelector('.t-spot');Object.assign(sp.style,{left:'0px',top:'0px',width:innerWidth+'px',height:innerHeight+'px',borderRadius:'0px'});
    S.modal=null;S.m2=null;S.picker=null;S.sessOpen=false;render();
    st={name,i:0};document.documentElement.classList.add('touring');requestAnimationFrame(()=>cont.classList.add('on'));show();
  }
  function end(){const c=el();db.settings.tourSeen=1;save();st=null;document.documentElement.classList.remove('touring');if(c){c.classList.remove('on');setTimeout(()=>{if(!st)c.remove();},300);}goTab('inicio');render();window.scrollTo(0,0);}
  function show(){
    const steps=T[st.name],s=steps[st.i];if(!s){if(st.name==='main')return end();st={name:'main',i:T.main.length-1};return show();}
    if(s.t)s.t();
    const target=typeof s.q==='function'?s.q():s.q?document.querySelector(s.q):null;
    if(target&&!target.closest('#nav,header.top')){const r=target.getBoundingClientRect();if(r.top<80||r.bottom>innerHeight-140)target.scrollIntoView({block:r.height>innerHeight*.6?'start':'center',behavior:calmMotion()?'auto':'smooth'});}
    setTimeout(()=>place(s,target),target?380:30);
  }
  function place(s,target){
    const c=el();if(!c||!st)return;const sp=c.querySelector('.t-spot'),cd=c.querySelector('.t-card'),steps=T[st.name],n=steps.length;
    let r=target&&target.getBoundingClientRect();if(r&&(!r.width||!r.height))r=null;
    if(r){const pad=8,top=Math.max(6,r.top-pad),h=Math.min(innerHeight-12,r.height+pad*2);Object.assign(sp.style,{left:Math.max(6,r.left-pad)+'px',top:top+'px',width:Math.min(innerWidth-12,r.width+pad*2)+'px',height:h+'px',borderRadius:'20px'});sp.classList.remove('none');}
    else{Object.assign(sp.style,{left:innerWidth/2+'px',top:innerHeight/2+'px',width:'0px',height:'0px',borderRadius:'50%'});sp.classList.add('none');}
    const dots=n>1?'<div class="t-dots">'+steps.map((_,i)=>'<i class="'+(i===st.i?'on':i<st.i?'done':'')+'"></i>').join('')+'</div>':'';
    const big=s.big?'<div class="t-big">'+ic(s.big,30)+'</div>':'';
    const topics=s.topics?'<div class="t-topics">'+TOPICS.map(([k,nm,i,d])=>'<button data-a="tourGo" data-v="'+k+'"><span class="t-ti">'+ic(i,18)+'</span><span class="grow"><b>'+nm+'</b><small>'+d+'</small></span>'+ic('right',16)+'</button>').join('')+'</div>':'';
    cd.innerHTML=big+'<b class="t-h">'+esc(s.h)+'</b><p>'+esc(s.p)+'</p>'+topics+dots+
      '<div class="t-btns"><button class="btn sm line" data-a="tourEnd">'+(s.topics?'Terminar':'Saltar')+'</button><span class="grow"></span>'+(st.i>0?'<button class="ib" data-a="tourPrev" aria-label="Anterior">'+ic('left',18)+'</button>':'')+
      (s.topics?'':'<button class="btn pri sm" data-a="tourNext">'+(st.i===n-1?(st.name==='main'?'Listo':'Otro tema'):'Siguiente')+'</button>')+'</div>';
    /* la tarjeta va donde no tape lo resaltado */
    const W=Math.min(360,innerWidth-24);cd.style.width=W+'px';cd.style.left=Math.round((innerWidth-W)/2)+'px';
    cd.classList.remove('in');void cd.offsetWidth;cd.classList.add('in');
    const ch=cd.offsetHeight;
    if(!r)cd.style.top=Math.max(20,Math.round((innerHeight-ch)/2))+'px';
    else if(r.bottom+16+ch<innerHeight-10)cd.style.top=Math.round(r.bottom+16)+'px';
    else if(r.top-16-ch>10)cd.style.top=Math.round(r.top-16-ch)+'px';
    else cd.style.top=Math.max(10,innerHeight-ch-16)+'px';
    const nb=cd.querySelector('[data-a=tourNext]');if(nb)try{nb.focus({preventScroll:true});}catch(e){}
  }
  function next(){if(!st)return;st.i++;const steps=T[st.name];if(st.i>=steps.length&&st.name!=='main'){st={name:'main',i:T.main.length-1};}show();buzz(6);}
  function prev(){if(!st||st.i===0)return;st.i--;show();}
  function topic(k){if(!T[k])return;if(!el())start('main');st={name:k,i:0};show();buzz(6);}
  addEventListener('resize',()=>{if(st){const s=T[st.name][st.i];const target=typeof s.q==='function'?s.q():s.q?document.querySelector(s.q):null;place(s,target);}});
  document.addEventListener('keydown',e=>{if(!st)return;if(e.key==='Escape')end();else if(e.key==='ArrowRight')next();else if(e.key==='ArrowLeft')prev();});
  return{start,end,next,prev,topic,on:()=>!!st};
})();
Object.assign(ACTIONS,{
  tourOpen(){Tour.start('main');},
  tourNext(){Tour.next();},tourPrev(){Tour.prev();},tourEnd(){Tour.end();},
  tourGo(v){Tour.topic(v);}
});
/* la primera vez que entrás con tu perfil completo, el recorrido arranca solo */
setTimeout(()=>{try{if(db.profile&&!db.settings.tourSeen&&!openLayers()&&!db.active)Tour.start('main');}catch(e){}},1600);
