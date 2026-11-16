'use strict';
/* ============ Carta de atleta ============
   Una carta coleccionable con tu rango, tu figura pintada por nivel y 6 atributos del 0 al 99.
   Es un SVG completo (sin depender del CSS de la página) para poder exportarlo como imagen. */
const CARD_BG=[['#D49A62','#5E2F10'],['#F2F5FA','#76839C'],['#FFE07A','#A86600'],['#6BE6D5','#0B5F5A'],['#7DB8FF','#173A9E'],['#CF9BFF','#43168F'],['#FF7896','#6E0820']];
const CARD_NONE=['#3A4270','#141830'];
const ATTRS=[['FUE','Fuerza'],['EMP','Empuje'],['TIR','Tirón'],['PIE','Piernas'],['COR','Core'],['CAL','Calistenia']];
/* nivel continuo (0-18) → puntaje de carta (40-99) */
const rating=v=>v==null||v<0?null:Math.round(40+Math.min(18,v)/18*59);
function cardStats(){
  const r=rankedList().filter(x=>x.info.L>=0).map(x=>({ex:x.ex,v:x.info.L+clamp(x.info.pct,0,.999)}));
  const best=f=>{const l=r.filter(f);return l.length?Math.max(...l.map(x=>x.v)):null;};
  const top3=r.filter(x=>x.ex.st&&/^Barra/.test(x.ex.eq)).map(x=>x.v).sort((a,b)=>b-a).slice(0,3);
  const has=(x,ks)=>ks.includes(x.ex.p[0]);
  const v={
    FUE:top3.length?top3.reduce((s,x)=>s+x,0)/top3.length:null,
    EMP:best(x=>has(x,['pecho','hombros','triceps'])),
    TIR:best(x=>has(x,['dorsales','biceps','trapecio','antebrazos'])),
    PIE:best(x=>has(x,['cuadriceps','gluteos','isquios','gemelos','aductores'])),
    COR:best(x=>has(x,['abs','oblicuos','lumbar'])),
    CAL:best(x=>!!x.ex.sk)
  };
  const out={};ATTRS.forEach(([k])=>out[k]=rating(v[k]));
  const vals=Object.values(out).filter(x=>x!=null);
  out.OVR=vals.length?Math.round(vals.reduce((s,x)=>s+x,0)/vals.length):null;
  return out;
}
/* la figura con colores puestos a mano (la imagen exportada no tiene el CSS de la página) */
function bodyInline(levels,dark){
  const base=dark?'rgba(20,23,43,.55)':'rgba(255,255,255,.5)',off=dark?'rgba(20,23,43,.22)':'rgba(255,255,255,.2)';
  let h='';
  ['front','back'].forEach((view,vi)=>{
    h+='<g transform="translate('+(vi*110)+' 0)">';
    const V=BODY[view];
    for(const k in V){
      const L=levels[k];
      const fill=k[0]==='_'?base:L!=null?TCOL[Math.min(6,Math.floor(L/3))]:off;
      h+='<g fill="'+fill+'"'+(L!=null&&k[0]!=='_'?' stroke="rgba(255,255,255,.55)" stroke-width=".6"':'')+'>'+V[k].map(p=>'<polygon points="'+p+'"/>').join('')+'</g>';
    }
    h+='</g>';
  });
  return h;
}
function cardSVG(){
  const ov=overall(),L=ov?ov.L:-1,t=L<0?-1:Math.min(6,Math.floor(L/3));
  const bg=t<0?CARD_NONE:CARD_BG[t],dark=t===1||t===2,fg=dark?'#1B1D2E':'#FFFFFF',sub=dark?'rgba(27,29,46,.7)':'rgba(255,255,255,.8)';
  const st=cardStats(),p=db.profile||{},sp=SPORTS[(p.sports||[])[0]||p.sport];
  const nick=(p.nick||'Atleta').toUpperCase().slice(0,14);
  const defs=(document.querySelector('svg[focusable="false"] defs')||{innerHTML:''}).innerHTML;
  const F='Archivo,Arial Black,Arial,sans-serif';
  const badgeSvg=badge(L,132).replace('<svg class="badge"','<svg x="432" y="40"');
  const attr=(k,i)=>{const x=110+(i%3)*190,y=i<3?716:780,v=st[k];
    return '<text x="'+x+'" y="'+y+'" font-family="'+F+'" font-weight="800" font-size="44" fill="'+fg+'" text-anchor="end">'+(v==null?'--':v)+'</text>'+
     '<text x="'+(x+12)+'" y="'+y+'" font-family="'+F+'" font-weight="800" font-size="26" fill="'+sub+'">'+k+'</text>';};
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" class="carta-svg"><defs>'+defs+
   '<linearGradient id="cbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+bg[0]+'"/><stop offset="1" stop-color="'+bg[1]+'"/></linearGradient>'+
   '<radialGradient id="cgl" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>'+
   '<pattern id="cpt" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(32)"><rect width="9" height="22" fill="#fff" opacity=".06"/></pattern>'+
   '<clipPath id="ccl"><rect width="600" height="840" rx="38"/></clipPath></defs>'+
   '<g clip-path="url(#ccl)"><rect width="600" height="840" fill="url(#cbg)"/><rect width="600" height="840" fill="url(#cpt)"/><rect width="600" height="840" fill="url(#cgl)"/>'+
   '<path d="M0 560 L600 470 L600 840 L0 840Z" fill="rgba(0,0,0,'+(dark?.08:.22)+')"/></g>'+
   '<rect x="16" y="16" width="568" height="808" rx="28" fill="none" stroke="'+(dark?'rgba(27,29,46,.35)':'rgba(255,255,255,.45)')+'" stroke-width="3"/>'+
   '<rect x="28" y="28" width="544" height="784" rx="20" fill="none" stroke="'+(dark?'rgba(27,29,46,.18)':'rgba(255,255,255,.2)')+'" stroke-width="1.5"/>'+
   '<text x="60" y="152" font-family="'+F+'" font-weight="800" font-size="124" letter-spacing="-6" fill="'+fg+'">'+(st.OVR==null?'--':st.OVR)+'</text>'+
   '<text x="64" y="196" font-family="'+F+'" font-weight="800" font-size="28" letter-spacing="1" fill="'+sub+'">'+esc(lvlName(L).toUpperCase())+'</text>'+
   (sp?'<g transform="translate(64 222)"><circle cx="26" cy="26" r="26" fill="'+(dark?'rgba(27,29,46,.15)':'rgba(255,255,255,.18)')+'"/><g transform="translate(9 9) scale(1.42)" fill="none" stroke="'+fg+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+IC[sp.i]+'</g></g>':'')+
   badgeSvg+
   '<svg x="110" y="226" width="380" height="362" viewBox="0 0 210 200">'+bodyInline(muscleLevels(),dark)+'</svg>'+
   '<text x="300" y="660" font-family="'+F+'" font-weight="800" font-size="54" letter-spacing="2" fill="'+fg+'" text-anchor="middle">'+esc(nick)+'</text>'+
   '<rect x="90" y="678" width="420" height="2" fill="'+sub+'" opacity=".5"/>'+
   ATTRS.map(([k],i)=>attr(k,i)).join('')+
   '<text x="300" y="806" font-family="'+F+'" font-weight="800" font-size="20" letter-spacing="3" fill="'+sub+'" text-anchor="middle">SWOLE · '+streak()+' DÍAS DE RACHA</text></svg>';
}
/* Dorso: tus 5 mejores marcas, el rango de cada grupo y tus números. Mismo material que el frente. */
function cardBackSVG(){
  const ov=overall(),L=ov?ov.L:-1,t=L<0?-1:Math.min(6,Math.floor(L/3));
  const bg=t<0?CARD_NONE:CARD_BG[t],dark=t===1||t===2,fg=dark?'#1B1D2E':'#FFFFFF',sub=dark?'rgba(27,29,46,.68)':'rgba(255,255,255,.78)',line=dark?'rgba(27,29,46,.22)':'rgba(255,255,255,.25)';
  const F='Archivo,Arial Black,Arial,sans-serif',B='Geist,Arial,sans-serif',p=db.profile||{};
  const cut=(s,n)=>s.length>n?s.slice(0,n-1)+'…':s;
  const top=rankedList().filter(x=>x.info.L>=0).slice(0,5),gl=groupLevels();
  const sess=allSess(),dates=sess.map(x=>x.date).sort(),since=dates[0];
  const lastPr=db.logs.slice().sort((a,b)=>a.date<b.date?1:-1).find(l=>(l.prs||[]).length),prEx=lastPr?exById(lastPr.prs[0]):null;
  const sp=(p.sports||[]).filter(k=>SPORTS[k]).slice(0,3);
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" class="carta-svg"><defs>'+
   '<linearGradient id="cbb" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+bg[0]+'"/><stop offset="1" stop-color="'+bg[1]+'"/></linearGradient>'+
   '<pattern id="cbp" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(-32)"><rect width="9" height="22" fill="#fff" opacity=".05"/></pattern>'+
   '<clipPath id="cbc"><rect width="600" height="840" rx="38"/></clipPath></defs>'+
   '<g clip-path="url(#cbc)"><rect width="600" height="840" fill="url(#cbb)"/><rect width="600" height="840" fill="url(#cbp)"/><rect width="600" height="840" fill="rgba(0,0,0,'+(dark?.06:.2)+')"/></g>'+
   '<rect x="16" y="16" width="568" height="808" rx="28" fill="none" stroke="'+line+'" stroke-width="3"/>'+
   '<text x="52" y="78" font-family="'+F+'" font-weight="800" font-size="30" letter-spacing="3" fill="'+fg+'">'+esc((p.nick||'ATLETA').toUpperCase().slice(0,14))+'</text>'+
   '<text x="548" y="78" font-family="'+F+'" font-weight="800" font-size="18" letter-spacing="3" fill="'+sub+'" text-anchor="end">SWOLE</text>'+
   sp.map((k,i)=>'<g transform="translate('+(52+i*34)+' 94)" fill="none" stroke="'+sub+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><g transform="scale(1.1)">'+IC[SPORTS[k].i]+'</g></g>').join('')+
   '<rect x="52" y="132" width="496" height="2" fill="'+line+'"/>';
  /* mejores marcas */
  s+='<text x="52" y="170" font-family="'+B+'" font-weight="700" font-size="16" letter-spacing="3" fill="'+sub+'">MEJORES MARCAS</text>';
  if(!top.length)s+='<text x="52" y="212" font-family="'+B+'" font-size="20" fill="'+sub+'">Todavía no hay marcas.</text>';
  top.forEach((x,i)=>{const y=210+i*42,b=x.b,ex=x.ex;
    const val=ex.sk||ex.time?Math.round(b.e)+(ex.time?' s':' reps'):'1RM '+Math.round(b.e)+' kg';
    s+='<text x="52" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="21" fill="'+fg+'">'+esc(cut(ex.n,24))+'</text>'+
     '<text x="420" y="'+y+'" font-family="'+F+'" font-weight="800" font-size="21" fill="'+fg+'" text-anchor="end">'+val+'</text>'+
     '<text x="548" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="16" fill="'+sub+'" text-anchor="end">'+esc(lvlName(x.info.L))+'</text>';});
  /* por grupo */
  s+='<rect x="52" y="412" width="496" height="2" fill="'+line+'"/><text x="52" y="448" font-family="'+B+'" font-weight="700" font-size="16" letter-spacing="3" fill="'+sub+'">POR GRUPO</text>';
  Object.keys(GROUPS).forEach((g,i)=>{const col=i%2,row=Math.floor(i/2),x=52+col*258,y=490+row*58,gv=gl[g],Lg=gv?Math.min(18,Math.floor(gv.v)):-1,w=gv?Math.round(214*(Lg>=18?1:gv.v-Lg)):0;
    s+='<text x="'+x+'" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="19" fill="'+fg+'">'+g+'</text>'+
     '<text x="'+(x+238)+'" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="15" fill="'+sub+'" text-anchor="end">'+(gv?esc(lvlName(Lg)):'—')+'</text>'+
     '<rect x="'+x+'" y="'+(y+10)+'" width="238" height="5" rx="2.5" fill="'+line+'"/>'+(w?'<rect x="'+x+'" y="'+(y+10)+'" width="'+w+'" height="5" rx="2.5" fill="'+fg+'"/>':'');});
  /* tus números */
  const stat=(x,v,l)=>'<text x="'+x+'" y="700" font-family="'+F+'" font-weight="800" font-size="44" fill="'+fg+'" text-anchor="middle">'+v+'</text><text x="'+x+'" y="728" font-family="'+B+'" font-weight="700" font-size="15" letter-spacing="2" fill="'+sub+'" text-anchor="middle">'+l+'</text>';
  s+='<rect x="52" y="648" width="496" height="2" fill="'+line+'" transform="translate(0 -14)"/>'+stat(135,db.logs.length,'ENTRENOS')+stat(300,(db.tests||[]).length,'MARCAS')+stat(465,ACH.filter(a=>db.ach[a.id]).length+'/'+ACH.length,'LOGROS');
  s+='<text x="300" y="782" font-family="'+B+'" font-weight="700" font-size="16" fill="'+sub+'" text-anchor="middle">'+(since?'Desde el '+esc(shortDate(parseK(since).getTime()))+' '+parseK(since).getFullYear():'Recién empezando')+(prEx?' · Último récord: '+esc(cut(prEx.n,20)):'')+'</text>';
  return s+'</svg>';
}
function cartaHTML(big){
  const ov=overall(),t=ov?Math.min(6,Math.floor(ov.L/3)):-1;
  const holo='--holo:'+(t<0?.12:(.18+t*.07)).toFixed(2);
  if(!big)return '<div class="carta-wrap"><div class="carta" style="'+holo+'" data-a="cardOpen" role="img" aria-label="Tu carta de atleta">'+cardSVG()+'<i class="holo"></i><i class="glare"></i></div></div>';
  return '<div class="carta-wrap big"><div class="carta dual" style="'+holo+'" data-a="cardFlip" role="button" aria-label="Tu carta: tocá para darla vuelta"><div class="cflip'+(S.cardBack?' flipped':'')+'">'+
   '<div class="cface front">'+cardSVG()+'<i class="holo"></i><i class="glare"></i></div><div class="cface back">'+cardBackSVG()+'<i class="holo"></i><i class="glare"></i></div></div></div></div>';
}
/* exporta la carta como imagen para historias (1080×1920) */
async function shareCard(){
  try{
    const ov=overall(),t=ov?Math.min(6,Math.floor(ov.L/3)):-1,c=t<0?'#5B43F0':TCOL[t];
    const card=(S.modal&&S.modal.t==='carta'&&S.cardBack?cardBackSVG():cardSVG()).replace('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 840" class="carta-svg">','<svg x="120" y="300" width="840" height="1176" viewBox="0 0 600 840">');
    const F='Archivo,Arial Black,Arial,sans-serif';
    const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">'+
     '<defs><radialGradient id="sbg" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="'+c+'" stop-opacity=".55"/><stop offset="1" stop-color="#0D1020" stop-opacity="0"/></radialGradient></defs>'+
     '<rect width="1080" height="1920" fill="#0D1020"/><rect width="1080" height="1920" fill="url(#sbg)"/>'+
     '<text x="540" y="200" font-family="'+F+'" font-weight="800" font-size="64" fill="#FFFFFF" text-anchor="middle">Mi carta de Swole</text>'+
     '<text x="540" y="252" font-family="Arial,sans-serif" font-size="32" fill="rgba(255,255,255,.7)" text-anchor="middle">Rango general: '+esc(lvlName(ov?ov.L:-1))+'</text>'+
     card+
     '<text x="540" y="1640" font-family="'+F+'" font-weight="800" font-size="44" fill="#FFFFFF" text-anchor="middle">¿Qué tan fuerte sos vos?</text>'+
     '<text x="540" y="1700" font-family="Arial,sans-serif" font-size="32" fill="rgba(255,255,255,.7)" text-anchor="middle">laburodigital.github.io/swole</text></svg>';
    const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
    const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;cv.getContext('2d').drawImage(img,0,0);
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));const name='swole-carta.png';
    const file=new File([blob],name,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'Mi carta de Swole'});return;}
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
    toast('Imagen descargada: '+name);
  }catch(e){if(e&&e.name==='AbortError')return;toast('No se pudo crear la imagen');}
}
/* la carta se inclina con el dedo, el mouse o el giroscopio */
(()=>{
  const setV=(el,px,py)=>{el.style.setProperty('--rx',((.5-py)*22).toFixed(1)+'deg');el.style.setProperty('--ry',((px-.5)*26).toFixed(1)+'deg');el.style.setProperty('--mx',(px*100).toFixed(0)+'%');el.style.setProperty('--my',(py*100).toFixed(0)+'%');};
  let fx=null;
  document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.carta.dual'))fx=e.clientX;},{passive:true});
  document.addEventListener('pointerup',e=>{if(fx==null)return;const dx=e.clientX-fx;fx=null;if(Math.abs(dx)>50){ACTIONS.cardFlip();S.flipBlock=true;setTimeout(()=>S.flipBlock=false,350);}},{passive:true});
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.carta');if(!c)return;const r=c.getBoundingClientRect();c.classList.add('live');setV(c,clamp((e.clientX-r.left)/r.width,0,1),clamp((e.clientY-r.top)/r.height,0,1));},{passive:true});
  document.addEventListener('pointerout',e=>{const c=e.target.closest&&e.target.closest('.carta');if(c&&!c.contains(e.relatedTarget)){c.classList.remove('live');['--rx','--ry','--mx','--my'].forEach(k=>c.style.removeProperty(k));}});
  window.addEventListener('deviceorientation',e=>{if(e.beta==null)return;const px=clamp(.5+(e.gamma||0)/50,0,1),py=clamp(.5+((e.beta||0)-45)/50,0,1);document.querySelectorAll('.carta').forEach(c=>{c.classList.add('live','gyro');setV(c,px,py);});});
})();
/* ============ Escena de subida de rango ============ */
function checkRankUp(delay){
  if(!db.profile)return;
  const ov=overall(),L=ov?ov.L:-1,prev=db.settings.lastOvL;
  if(prev==null||L<prev){db.settings.lastOvL=L;save();return;}
  if(L>prev){db.settings.lastOvL=L;addEv({k:'rank',L});save();setTimeout(()=>rankUpScene(prev,L),delay==null?500:delay);}
}
function rankUpScene(from,to){
  const col=lvlColor(to),name=lvlName(to);
  const el=document.createElement('div');el.id='rankup';el.setAttribute('role','dialog');el.setAttribute('aria-label','Nuevo rango: '+name);
  el.style.setProperty('--c',col);
  el.innerHTML='<div class="ru-rays"></div><div class="ru-flash"></div>'+
   '<div class="ru-old"><span class="ru-half l">'+badge(from,150)+'</span><span class="ru-half r">'+badge(from,150)+'</span></div>'+
   '<div class="ru-new">'+badge(to,180)+'</div>'+
   '<p class="ru-kicker">Nuevo rango general</p>'+
   '<h2 class="ru-name">'+[...name].map((ch,i)=>'<span style="animation-delay:'+(2150+i*60)+'ms">'+(ch===' '?'&nbsp;':esc(ch))+'</span>').join('')+'</h2>'+
   '<p class="ru-from">Antes: '+esc(lvlName(from))+'</p>'+
   '<div class="ru-btns"><button class="btn pri" data-ru="card">Ver mi carta</button><button class="btn" data-ru="close">Seguir</button></div>';
  document.body.appendChild(el);
  setTimeout(()=>{confetti(90);buzz([40,40,40,40,200]);},2000);
  el.addEventListener('click',e=>{const b=e.target.closest('[data-ru]');if(!b)return;el.classList.add('out');setTimeout(()=>el.remove(),400);if(b.dataset.ru==='card'){S.m2=null;S.modal={t:'carta'};goTab('niveles');render();}});
}
/* ============ Mapa de recuperación ============ */
const REC_COL={red:'#FF5C7A',yellow:'#FFC34D',green:'#3CCB8A'};
function recovery(){
  const now=Date.now(),last={};
  db.logs.forEach(l=>{const t=parseK(l.date).getTime()+18*36e5;l.entries.forEach(en=>{const ex=exById(en.ex);if(!ex)return;const n=en.sets.filter(s=>!s.w).length;if(n<2)return;ex.p.forEach(k=>{if(!last[k]||t>last[k])last[k]=t;});});});
  /* tu semana: partido de ayer = piernas recién trabajadas; práctica = carga media */
  [1,2].forEach(back=>{const dk=addDays(today(),-back),di=dayInfo(parseK(dk).getDay());if(!di.type)return;
    const t=parseK(dk).getTime()+20*36e5-(di.type==='prac'?24*36e5:0),ms=['cuadriceps','isquios','gluteos','gemelos','aductores'].concat(['rugby','combate'].includes(di.sport)&&di.type==='match'?['trapecio','hombros','pecho','dorsales']:[]);
    ms.forEach(k=>{if(!last[k]||t>last[k])last[k]=t;});});
  const st={},hrs={};
  Object.keys(MUSC).forEach(k=>{const hh=last[k]?Math.max(0,(now-last[k])/36e5):Infinity;hrs[k]=hh;st[k]=hh<30?'red':hh<54?'yellow':'green';});
  /* grupos listos: todos sus músculos en verde, primero los que hace más que no entrenás */
  const ready=Object.keys(GROUPS).filter(g=>GROUPS[g].every(k=>st[k]==='green')).sort((a,b)=>Math.min(...GROUPS[b].map(k=>hrs[k]))-Math.min(...GROUPS[a].map(k=>hrs[k])));
  return{st,hrs,ready};
}
function recoveryCard(){
  const dT=dayInfo(new Date().getDay()),dM=dayInfo((new Date().getDay()+1)%7);
  if(!db.logs.length&&!dT.type)return '<div class="card"><div class="hd"><div><h3>Recuperación</h3><span class="mut sm-t">Qué músculos están listos para entrenar</span></div></div>'+
   '<div class="big-map" style="opacity:.55">'+bodyMap(null,{labels:1})+'</div><div class="row rec-sug"><span class="grow">Todavía no registraste entrenos. Cuando entrenes, acá vas a ver qué músculos están listos y qué te conviene hacer.</span><button class="btn pri sm" data-a="startFree">'+ic('play',16)+' Entrenar</button></div></div>';
  const r=recovery(),fills={};Object.keys(r.st).forEach(k=>fills[k]=REC_COL[r.st[k]]);
  const pick=r.ready.slice(0,2);
  let sug,act='';
  if(dT.type==='match'){sug='Hoy tenés <b>'+actName(dT).toLowerCase()+'</b>: nada de entrenar pesado. ¡Suerte!';}
  else if(dM.type==='match'){sug='Mañana tenés <b>'+actName(dM).toLowerCase()+'</b>: si entrenás hoy, que sea torso y liviano.';}
  else if(pick.length){
    const ms=[].concat(...pick.map(g=>GROUPS[g]));
    let bestR=null,bs=0;db.routines.forEach(rt=>{const m=mapOfRoutine(rt);const s=ms.reduce((a,k)=>a+(m[k]||0),0)-Object.keys(m).filter(k=>r.st[k]==='red').length;if(s>bs){bs=s;bestR=rt;}});
    sug='Hoy te toca <b>'+pick.map(g=>g.toLowerCase()).join(' y ')+'</b>';
    act=bestR&&bs>.5?'<button class="btn pri sm" data-a="startR" data-v="'+bestR.id+'">'+ic('play',16)+' '+esc(bestR.name)+'</button>':'<button class="btn pri sm" data-a="startFree">'+ic('play',16)+' Entrenar</button>';
  }else sug='Todo está recuperándose: hoy conviene descansar o hacer algo suave.';
  return '<div class="card"><div class="hd"><div><h3>Recuperación</h3><span class="mut sm-t">Qué músculos están listos para entrenar</span></div></div>'+
   '<div class="big-map">'+bodyMap(null,{fills,labels:1,cls:'live'})+'</div>'+
   '<div class="legend" style="gap:14px;justify-content:center"><span class="row" style="gap:6px"><u class="dot" style="background:'+REC_COL.green+'"></u>Listo</span><span class="row" style="gap:6px"><u class="dot" style="background:'+REC_COL.yellow+'"></u>Casi</span><span class="row" style="gap:6px"><u class="dot" style="background:'+REC_COL.red+'"></u>Recuperándose</span></div>'+
   '<div class="row rec-sug"><span class="grow">'+sug+'</span>'+act+'</div></div>';
}


/* ============ Entreno de hoy (según qué músculos están recuperados) ============ */
Object.assign(IC,{
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  tree:'<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="6" r="2.5"/><path d="M6 8.5v7M8.5 6h7M7.8 16.2 16.2 7.8"/>',
  share:'<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'
});
/* lo que elegiste la última vez que armaste rutina (objetivos, equipo, nivel) */
const genPrefs=()=>{const g=db.settings.gen||{},ov=overall();return{goals:g.goals&&g.goals.length?g.goals:['hip'],eq:g.eq||'gym',lvl:g.lvl||(!ov||ov.L<6?'beg':ov.L<12?'int':'adv')};};
const REC_SC={green:1,yellow:.2,red:-1.5};
const heavyEq=ex=>!ex.time&&!ex.sk&&ex.st&&!/Peso corporal|Barra fija|Paralelas|Anillas/.test(ex.eq);
function todayPlan(seed){
  const r=recovery(),p=db.profile||{},age=p.age||25,P=genPrefs(),gs=P.goals,onlyCali=gs.includes('cali');
  const dow=new Date().getDay(),dT=dayInfo(dow),dM=dayInfo((dow+1)%7);
  const pool=POOL[onlyCali?'bw':P.eq]||POOL.gym;
  const musOf=pt=>{const ex=exById((pool[pt]||[])[0]);return ex?ex.p:[];};
  const cands=onlyCali?['skPush','skPull','skLegs']:['fullA','fullB','upA','upB','lowA','lowB','push','pull','legs'];
  /* puntaje de cada tipo de día: músculos frescos suman, los cansados restan; piernas no antes de un partido */
  const score=t=>{const T=DAYT[t];let s=0,n=0;T.p.slice(0,5).forEach(pt=>musOf(pt).forEach(k=>{s+=REC_SC[r.st[k]]||0;n++;}));let v=n?s/n:0;
    if(T.low&&(dM.type==='match'||dT.type==='match'))v-=3;if(T.low&&dT.type==='prac')v-=.6;return v;};
  const ranked=cands.filter(t=>DAYT[t]).map(t=>({t,s:score(t)})).sort((a,b)=>b.s-a.s);
  const pick=ranked[(seed||0)%Math.min(3,ranked.length)];
  const T=DAYT[pick.t],lvlI={beg:0,int:1,adv:2}[P.lvl],used=new Set(),items=[];
  let first=true;
  T.p.forEach((pt,pi)=>{
    const ms=musOf(pt);if(ms.length&&ms.every(k=>r.st[k]==='red'))return;
    const list=(pool[pt]||[]).filter(id=>exById(id)&&!used.has(id));if(!list.length)return;
    const id=list[Math.min(list.length-1,lvlI)];used.add(id);
    const ex=exById(id),ds=genDose(ex,gs,P.lvl,pt,pi<4,age),it={ex:id,sets:ds[0],reps:ds[1]};
    if(first&&pi<4&&heavyEq(ex)){it.warm=2;first=false;}
    items.push(it);
  });
  const its=items.slice(0,6);
  const fresh=[...new Set([].concat(...its.map(it=>exById(it.ex).p)))].filter(k=>r.st[k]==='green');
  let why=!db.logs.length?'Arrancá por acá: una sesión completa para tu objetivo':fresh.length?'Están frescos: '+fresh.slice(0,4).map(k=>(MUSC[k]||k).toLowerCase()).join(', '):'Sesión suave: casi todo se está recuperando';
  if(dM.type==='match')why='Mañana tenés '+actName(dM).toLowerCase()+': nada de piernas pesadas';
  return fitTime({name:'Hoy: '+T.n,items:its,rest:GEN_GOALS[primGoal(gs)].rest||120,why},(db.settings.gen&&db.settings.gen.min)||0);
}
function todayCard(){
  if(!db.profile)return '';
  const t=today(),dT=dayInfo(new Date().getDay());
  if(dT.type==='match'||plannedFor(t).length||doneOn(t).length)return '';
  const pl=todayPlan(S.todaySeed||0);if(!pl.items.length)return '';
  return '<div class="card today"><div class="hd"><div class="grow"><span class="lh-k">Entreno de hoy</span><h3>'+esc(pl.name.replace('Hoy: ',''))+'</h3><span class="mut sm-t">'+esc(pl.why)+'</span></div>'+miniMap(mapOfRoutine(pl)).replace('mini','mini" style="width:54px')+'</div>'+
   '<div class="td-list">'+pl.items.map(it=>{const ex=exById(it.ex);return '<div class="rowline"><span>'+esc(ex.n)+(it.warm?' <span class="tag" style="font-size:10.5px">+'+it.warm+' de calentamiento</span>':'')+'</span><span class="mut">'+it.sets+' × '+it.reps+(ex.time?' s':'')+'</span></div>';}).join('')+'</div>'+
   '<div class="row" style="gap:8px;margin-top:12px"><button class="btn pri grow" data-a="todayGo">'+ic('play',16)+' Empezar</button><button class="btn" data-a="todayAlt">'+ic('swap',16)+' Otra opción</button></div></div>';
}

/* ============ Resumen para compartir ============ */
async function pngShare(svg,name,title){
  try{
    const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
    const cv=document.createElement('canvas');cv.width=1080;cv.height=1920;cv.getContext('2d').drawImage(img,0,0);
    const blob=await new Promise(r=>cv.toBlob(r,'image/png')),file=new File([blob],name,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title});return;}
    const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);
    toast('Imagen descargada: '+name);
  }catch(e){if(e&&e.name==='AbortError')return;toast('No se pudo crear la imagen');}
}
function summarySVG(m){
  const F='Archivo,Arial Black,Arial,sans-serif',B='Geist,Arial,sans-serif',acc='#8B7DFF',log=m.log;
  const ov=overall(),c=ov?lvlColor(ov.L):acc;
  const ms={};log.entries.forEach(en=>{const ex=exById(en.ex);if(!ex)return;const n=en.sets.filter(s=>!s.w).length;ex.p.forEach(k=>ms[k]=(ms[k]||0)+n);});
  const top=Object.keys(ms).sort((a,b)=>ms[b]-ms[a]).slice(0,5).map(k=>MUSC[k]||k);
  const stat=(x,v,l)=>'<rect x="'+x+'" y="560" width="300" height="200" rx="28" fill="#15171B" stroke="#24272D" stroke-width="2"/><text x="'+(x+150)+'" y="670" font-family="'+F+'" font-weight="800" font-size="76" fill="#ECEDEF" text-anchor="middle">'+esc(v)+'</text><text x="'+(x+150)+'" y="720" font-family="'+B+'" font-size="30" fill="#8B9098" text-anchor="middle">'+l+'</text>';
  let y=860,rows='';
  const line=(l,r,col)=>{rows+='<text x="90" y="'+y+'" font-family="'+B+'" font-weight="600" font-size="38" fill="#ECEDEF">'+esc(l)+'</text><text x="990" y="'+y+'" font-family="'+B+'" font-weight="600" font-size="34" fill="'+(col||'#8B9098')+'" text-anchor="end">'+esc(r)+'</text>';y+=72;};
  if(m.ups.length){rows+='<text x="90" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="28" fill="'+acc+'" letter-spacing="3">SUBÍ DE RANGO</text>';y+=60;m.ups.slice(0,3).forEach(u=>{const ex=exById(u.ex);line(ex.n.replace(' (segundos)',''),lvlName(u.to),lvlColor(u.to));});y+=24;}
  if(m.prs.length){rows+='<text x="90" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="28" fill="'+acc+'" letter-spacing="3">RÉCORDS</text>';y+=60;m.prs.slice(0,4).forEach(p=>{const ex=exById(p.ex);if(ex)line(ex.n.replace(' (segundos)',''),ex.time||ex.sk?Math.round(p.e)+unitOf(ex):'1RM '+num(p.e,1)+' kg');});y+=24;}
  if(y<1400){rows+='<text x="90" y="'+y+'" font-family="'+B+'" font-weight="700" font-size="28" fill="'+acc+'" letter-spacing="3">EJERCICIOS</text>';y+=60;log.entries.slice(0,Math.max(1,Math.floor((1560-y)/72))).forEach(en=>{const ex=exById(en.ex);if(ex)line(ex.n.replace(' (segundos)',''),(()=>{const ws=en.sets.filter(s=>!s.w),b=ws.reduce((a,s)=>e1(ex,s.kg,s.reps)>e1(ex,a.kg,a.reps)?s:a,ws[0]);return ws.length+' × '+(ex.time?b.reps+' s':(+b.kg?num(+b.kg,1)+' kg × ':'')+b.reps);})());});}
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920"><defs><radialGradient id="g" cx=".5" cy="0" r=".9"><stop offset="0" stop-color="'+c+'" stop-opacity=".35"/><stop offset="1" stop-color="#0B0C0E" stop-opacity="0"/></radialGradient></defs>'+
   '<rect width="1080" height="1920" fill="#0B0C0E"/><rect width="1080" height="1100" fill="url(#g)"/>'+
   '<text x="90" y="170" font-family="'+F+'" font-weight="800" font-size="52" fill="#ECEDEF">swole</text>'+
   '<text x="990" y="170" font-family="'+B+'" font-size="32" fill="#8B9098" text-anchor="end">'+esc(longDate(log.date))+'</text>'+
   '<text x="90" y="360" font-family="'+B+'" font-weight="700" font-size="30" fill="'+acc+'" letter-spacing="4">ENTRENAMIENTO</text>'+
   '<text x="90" y="450" font-family="'+F+'" font-weight="800" font-size="'+(log.name.length>22?62:84)+'" fill="#ECEDEF" letter-spacing="-2">'+esc(log.name.slice(0,34))+'</text>'+
   (top.length?'<text x="90" y="510" font-family="'+B+'" font-size="32" fill="#8B9098">'+esc(top.join(' · '))+'</text>':'')+
   stat(90,String(log.dur),'minutos')+stat(390,String(m.sets),'series')+stat(690,nf(m.vol),'kg movidos')+rows+
   (ov?'<text x="540" y="1700" font-family="'+B+'" font-size="32" fill="#8B9098" text-anchor="middle">Rango general</text><text x="540" y="1770" font-family="'+F+'" font-weight="800" font-size="60" fill="'+c+'" text-anchor="middle">'+esc(lvlName(ov.L))+'</text>':'')+
   '<text x="540" y="1860" font-family="'+B+'" font-size="28" fill="#5E636B" text-anchor="middle">laburodigital.github.io/swole</text></svg>';
}

/* ============ Árbol de habilidades de calistenia ============ */
/* cada rama va de lo más fácil a lo más difícil; "id:n" = ejercicio con meta propia de n repeticiones */
const TREE=[
  {f:'push',n:'Empuje',ids:['kneepush','pushup','diamond','archerpush','pppush','oapush','planchepush']},
  {f:'pull',n:'Tirón',ids:['austrow','pullup:10','lpullup','archerpull','muscleup','oapull']},
  {f:'dip',n:'Fondos',ids:['benchdip','dips:15','ringdip','russiandip','impdip']},
  {f:'legs',n:'Piernas',ids:['airsquat','shrimp','boxpistol','pistol','dragon']},
  {f:'lsit',n:'L-sit',ids:['tucklsit','onelegl','lsit','vsit']},
  {f:'hs',n:'Vertical',ids:['pikepush','wallhs','freehs','hspu','freehspu']},
  {f:'fl',n:'Front lever',ids:['tuckfl','advfl','onelegfl','straddlefl','fullfl']},
  {f:'bl',n:'Back lever',ids:['skincat','tuckbl','advbl','straddlebl','fullbl']},
  {f:'pl',n:'Planche',ids:['crow','pllean','tuckpl','advpl','straddlepl','fullpl']},
  {f:'flag',n:'Bandera',ids:['vflag','tuckflag','straddleflag','flag']}
];
/* requisitos de otras ramas (la fuerza base que hace falta antes) */
const XREQ={muscleup:[['dips',10]],lpullup:[['tucklsit',15]],tuckfl:[['pullup',8]],skincat:[['pullup',5]],tuckbl:[['pullup',6],['dips',8]],tuckpl:[['pppush',10],['dips',15]],freehs:[['wallhs',45]],vflag:[['pullup',10],['wallhs',30]],ringdip:[['dips',12]]};
const shortN=n=>n.replace(/ \(segundos\)/,'');
function bestRep(id){let b=0;allSess().forEach(l=>l.entries.forEach(en=>{if(en.ex===id)en.sets.forEach(s=>{if(!s.w&&+s.reps>b)b=+s.reps;});}));return b;}
function treeNode(s){const [id,t]=s.split(':'),ex=exById(id);return ex?{id,ex,t:+t||(ex.sk?ex.sk.t:10),time:!!ex.time}:null;}
const branches=()=>TREE.map(b=>Object.assign({},b,{nodes:b.ids.map(treeNode).filter(Boolean)}));
/* dominada = llegaste a la meta de esta o de cualquier variante más difícil de la misma rama */
/* si hacés una variante más difícil, las más fáciles se estiman solas: cada escalón hacia abajo duplica el avance (tope: 125 % de la meta) */
function estBest(b,i){let fr=0;for(let j=i+1;j<b.nodes.length;j++){const m=b.nodes[j],r=bestRep(m.id);if(r>0)fr=Math.max(fr,r/m.t*Math.pow(2,j-i));}return fr>0?Math.round(b.nodes[i].t*Math.min(1.25,fr)):0;}
function effBest(id){const f=findNode(id),o=bestRep(id);return f?Math.max(o,estBest(f.b,f.i)):o;}
const nodeDone=(b,i)=>b.nodes.slice(i).some(n=>bestRep(n.id)>=n.t)||estBest(b,i)>=b.nodes[i].t;
function nodeState(b,i){
  const n=b.nodes[i],own=bestRep(n.id),best=Math.max(own,estBest(b,i)),done=nodeDone(b,i);
  const prevOk=i===0||nodeDone(b,i-1)||best>0;
  const reqs=(XREQ[n.id]||[]).map(([id,t])=>{const bb=bestRep(id);return{id,t,best:bb,ok:bb>=t};});
  const ok=prevOk&&reqs.every(r=>r.ok);
  return{n,best,est:best>own,done,pct:Math.min(1,best/n.t),avail:!done&&ok,locked:!done&&!ok,reqs,prevOk};
}
function findNode(id){const bs=branches();for(const b of bs){const i=b.nodes.findIndex(n=>n.id===id);if(i>=0)return{b,i};}return null;}
const nodeTier=ex=>ex.sk?Math.min(6,Math.floor(ex.sk.b/3)):1;
function treeHTML(m){
  const bs=branches(),goal=db.settings.skillGoal;let tot=0,dn=0;
  const rows=bs.map(b=>{
    const st=b.nodes.map((_,i)=>nodeState(b,i)),d=st.filter(x=>x.done).length;tot+=st.length;dn+=d;
    return '<div class="tb"><div class="tb-h"><b>'+b.n+'</b><span class="mut sm-t">'+d+' de '+st.length+'</span></div><div class="tb-row">'+st.map((s,i)=>{
      const cls=s.done?'done':s.avail?'avail':'lock',col=TCOL[nodeTier(s.n.ex)];
      return (i?'<i class="tb-ln'+(s.done||s.avail?' on':'')+'"></i>':'')+
       '<button class="tn '+cls+(m.sel===s.n.id?' sel':'')+(goal&&goal.id===s.n.id?' goal':'')+'" style="--c:'+col+';--p:'+Math.round(s.pct*100)+'" data-a="treeSel" data-v="'+s.n.id+'" aria-pressed="'+(m.sel===s.n.id)+'">'+
       '<span class="tn-c">'+(s.done?ic('check',18):!s.best&&s.locked?ic('lock',15):'<small>'+(s.best?Math.round(s.pct*100)+'%':'0%')+'</small>')+'</span><span class="tn-l">'+esc(shortN(s.n.ex.n))+'</span></button>';
    }).join('')+'</div>'+(m.sel&&b.nodes.some(n=>n.id===m.sel)?nodeDetail(m.sel):'')+'</div>';
  }).join('');
  return '<div class="tree-top"><div><b style="font:800 30px var(--f-d)">'+dn+'</b><span class="mut"> de '+tot+' habilidades dominadas</span></div><div class="bar" style="margin-top:8px"><i style="width:'+Math.round(dn/tot*100)+'%;background:var(--acc)"></i></div>'+
   '<p class="mut sm-t" style="margin-top:8px">Cada rama va de lo más fácil a lo más difícil. Dominás una cuando llegás a su meta. Tocá cualquiera para ver qué te falta.</p></div>'+
   rows;
}
/* marcar a mano que ya hacés una habilidad: se guarda como marca y se desbloquea lo que sigue */
function skMarkHTML(m){
  const f=findNode(m.id);if(!f)return '';const n=f.b.nodes[f.i],u=n.time?'segundos':'repeticiones';
  return '<p>¿Cuánto hacés de <b>'+esc(shortN(n.ex.n))+'</b> seguido, con buena técnica?</p>'+
   '<div class="fd-amt" style="margin:12px 0"><button class="ib" data-a="skMarkStep" data-v="-1" aria-label="Menos">'+ic('minus',18)+'</button><input class="num" id="skMarkN" type="text" inputmode="numeric" value="'+m.n+'" aria-label="'+u+'"><span class="mut">'+(n.time?'s':'reps')+'</span><button class="ib" data-a="skMarkStep" data-v="1" aria-label="Más">'+ic('plus',18)+'</button></div>'+
   '<p class="mut sm-t">La meta para dominarla es '+n.t+' '+u+'. Si llegás, queda dominada y se desbloquea la siguiente de la rama.</p>'+
   '<button class="btn pri wide" data-a="skMarkSave">Guardar</button>';
}
function nodeDetail(id){
  const f=findNode(id);if(!f)return '';
  const s=nodeState(f.b,f.i),ex=s.n.ex,u=s.n.time?' s':' reps',prev=f.i>0?f.b.nodes[f.i-1]:null;
  const req=(prev&&!s.best&&!nodeDone(f.b,f.i-1)?[{id:prev.id,t:prev.t,best:bestRep(prev.id),ok:false}]:[]).concat(s.reqs);
  return '<div class="td-det" id="tdDet"><div class="row" style="gap:12px"><div class="td-fig">'+(techOf(ex)?techSVG(techOf(ex)):badge(ex.sk?ex.sk.b:3,46))+'</div><div class="grow">'+badge(ex.sk?ex.sk.b:3,26).replace('<svg class="badge"','<svg class="badge td-b"')+' <b style="font:800 18px var(--f-d)">'+esc(shortN(ex.n))+'</b><br>'+
   '<span class="mut sm-t">Meta: '+s.n.t+u+' seguid'+(s.n.time?'os':'as')+' · Tu mejor: '+(s.best?s.best+u+(s.est?' (estimado por una variante más difícil)':''):'sin registrar')+'</span></div></div>'+
   '<div class="bar" style="margin:10px 0 4px"><i style="width:'+Math.round(s.pct*100)+'%;background:'+TCOL[nodeTier(ex)]+'"></i></div>'+
   '<p class="sm-t" style="margin-top:8px">'+esc(ex.d)+'</p>'+
   (req.length?'<div class="reqs"><span class="mut sm-t" style="font-weight:600">Antes necesitás</span>'+req.map(r=>{const e=exById(r.id),ru=e&&e.time?' s':' reps';return '<div class="rq'+(r.ok?' ok':'')+'">'+ic(r.ok?'check':'lock',14)+'<span class="grow">'+esc(shortN(e?e.n:r.id))+' · '+r.t+ru+'</span><span class="mut sm-t">'+(r.best?r.best+ru:'—')+'</span></div>';}).join('')+'</div>':'')+
   '<div class="row" style="gap:8px;margin-top:12px">'+(s.done?'<span class="tag" style="color:var(--ok)">'+ic('check',14)+' Dominada</span><span class="grow"></span>':'<button class="btn pri grow" data-a="skMark" data-v="'+id+'">'+ic('check',16)+' Ya la logro</button>')+
   (s.done?'':'<button class="btn" data-a="skGoal" data-v="'+id+'">'+ic('target',16)+' Plan</button>')+
   '<button class="btn" data-a="exInfo" data-v="'+id+'">Ver</button></div></div>';
}
/* fuerza que ayuda a cada habilidad (si entrenás sin equipo, se cambia por su versión con peso corporal) */
const SK_ACC={push:['dips','plank'],pull:['row','legraise'],dip:['pushup','plank'],legs:['bulgarian','calf'],lsit:['legraise','plank'],hs:['ohp','plank'],fl:['row','legraise'],bl:['dips','plank'],pl:['dips','plank'],flag:['legraise','ohp']};
const BW_ALT={row:'austrow',ohp:'pushup',bulgarian:'shrimp',calf:'airsquat'};
function skillPlan(id){
  const f=findNode(id);if(!f)return null;
  const b=f.b,ti=f.i,st=b.nodes.map((_,i)=>nodeState(b,i));
  /* arranca en la variante más difícil que ya venís practicando; si no, en la primera que te falta */
  const open=st.map((s,i)=>i).filter(i=>i<=ti&&!st[i].done),worked=open.filter(i=>st[i].best>0);
  let si=worked.length?worked[worked.length-1]:open.length?open[0]:ti;
  const step=st[si],P=genPrefs(),bw=P.eq==='bw'||P.goals.includes('cali');
  /* práctica de habilidad: series cortas y de calidad, a ~70 % de tu máximo (lejos del fallo) */
  const dose=(n,best,main)=>{
    if(n.time){const h=best?Math.max(5,Math.min(n.t,Math.round(best*.7))):Math.max(5,Math.round(n.t*.4));return[main?6:3,h];}
    const r=best?Math.max(2,Math.min(n.t,Math.round(best*.7))):Math.max(3,Math.round(n.t*.3));return[main?5:3,r];
  };
  const items=[],d0=dose(step.n,step.best,true);
  items.push({ex:step.n.id,sets:d0[0],reps:d0[1]});
  if(si>0){const pv=st[si-1],d=dose(pv.n,pv.best,false);items.push({ex:pv.n.id,sets:d[0],reps:Math.max(d[1],pv.n.time?15:5)});}
  const reqs=(XREQ[step.n.id]||[]).concat(si!==ti?(XREQ[id]||[]):[]).filter(([rid,t])=>bestRep(rid)<t);
  reqs.forEach(([rid,t])=>{const e=exById(rid);if(!e||items.some(x=>x.ex===rid))return;const bb=bestRep(rid);items.push({ex:rid,sets:4,reps:e.time?Math.max(10,Math.round((bb||t*.5)*.8)):Math.max(3,Math.round((bb||t*.5)*.75))});});
  (SK_ACC[b.f]||[]).forEach(a=>{const aid=bw&&BW_ALT[a]?BW_ALT[a]:a,e=exById(aid);if(!e||items.some(x=>x.ex===aid))return;items.push({ex:aid,sets:3,reps:e.time?40:LOWER.includes(e.p[0])?10:8});});
  const tg=b.nodes[ti].ex,from=si>0?st[si-1].n.ex:null;
  const gap=Math.max(1,(tg.sk?tg.sk.b:4)-(from&&from.sk?from.sk.b:from?3:0));
  return{target:id,tg,b,path:st.slice(si,ti+1),done:st.slice(0,si),step:step.n,stepBest:step.best,items:items.slice(0,6),weeks:[Math.max(3,Math.round(gap*1.5)),Math.max(5,Math.round(gap*3))]};
}
function skPlanHTML(p){
  if(!p)return '<p class="mut">No encontré esa habilidad.</p>';
  const u=n=>n.time?' s':' reps';
  return '<p class="mut sm-t">Tu camino a <b style="color:var(--text)">'+esc(shortN(p.tg.n))+'</b>, paso por paso:</p>'+
   '<div class="skpath">'+p.done.slice(-1).map(s=>'<span class="ok">'+ic('check',13)+' '+esc(shortN(s.n.ex.n))+'</span>').join('')+p.path.map((s,i)=>(i||p.done.length?'<i>'+ic('right',14)+'</i>':'')+'<span class="'+(i===0?'cur':'')+'">'+esc(shortN(s.n.ex.n))+' · '+s.n.t+u(s.n)+'</span>').join('')+'</div>'+
   '<div class="card" style="margin:12px 0 0"><div class="hd"><div><h4>Cada sesión</h4><span class="mut sm-t">3 veces por semana · se actualiza sola cuando progresás</span></div></div>'+
   p.items.map((it,k)=>{const e=exById(it.ex);return '<div class="rowline" style="padding:6px 0"><span>'+esc(shortN(e.n))+(k===0?' <span class="tag" style="font-size:10.5px;color:var(--acc)">habilidad</span>':'')+'</span><span class="mut">'+it.sets+' × '+it.reps+(e.time?' s':'')+'</span></div>';}).join('')+'</div>'+
   '<div class="goal" style="margin-top:12px"><span class="grow"><span class="mut sm-t">Estimado (aproximado)</span><br><b>'+p.weeks[0]+' a '+p.weeks[1]+' semanas</b></span>'+ic('cal',22)+'</div>'+
   '<details class="why"><summary>¿Cómo funciona?</summary><div class="mut sm-t">'+
   '<p><b>Calidad antes que cantidad:</b> la habilidad va primero, fresco. Series cortas al 70 % de tu máximo: cortá antes de perder la forma.</p>'+
   '<p><b>Frecuencia:</b> las habilidades se aprenden practicándolas seguido, por eso son 3 veces por semana con descansos de 2 a 3 minutos.</p>'+
   '<p><b>Progresión:</b> cada sesión intentá +1 repetición o +2 a 3 segundos. Cuando llegás a la meta, el plan pasa solo a la siguiente variante.</p>'+
   '<p><b>Base de fuerza:</b> los ejercicios de abajo construyen la fuerza que la habilidad necesita (y cuidan hombros, codos y muñecas).</p></div></details>'+
   '<div class="g2" style="margin-top:12px"><button class="btn" data-a="skStart" data-v="'+p.target+'">'+ic('play',16)+' Empezar hoy</button><button class="btn pri" data-a="skSave" data-v="'+p.target+'">Agregar a mi semana</button></div>';
}
function pick3(wk){
  const o=wk.slice().sort((a,b)=>((a+6)%7)-((b+6)%7));
  if(o.length>=3)return[o[0],o[Math.floor(o.length/2)],o[o.length-1]];
  return[1,3,5];
}
/* tu habilidad objetivo, en Inicio */
function skillGoalCard(){
  const g=db.settings.skillGoal;if(!g)return '';
  const p=skillPlan(g.id);if(!p)return '';
  const done=bestRep(g.id)>=findNode(g.id).b.nodes[findNode(g.id).i].t;
  const s=p.path[0],pct=Math.round(s.pct*100);
  return '<div class="card skg"><div class="hd"><div class="grow"><span class="lh-k">Tu habilidad objetivo</span><h3>'+esc(shortN(p.tg.n))+'</h3>'+
   '<span class="mut sm-t">'+(done?'¡La lograste! Elegí la próxima en el árbol.':'Paso '+(p.done.length+1)+' de '+(p.done.length+p.path.length)+': '+esc(shortN(s.n.ex.n))+' · '+(s.best||0)+' de '+s.n.t+(s.n.time?' s':' reps'))+'</span></div>'+badge(p.tg.sk?p.tg.sk.b:3,44)+'</div>'+
   '<div class="bar" style="margin:4px 0 12px"><i style="width:'+(done?100:pct)+'%;background:'+TCOL[nodeTier(p.tg)]+'"></i></div>'+
   '<div class="row" style="gap:8px">'+(done?'':'<button class="btn pri grow" data-a="skStart" data-v="'+g.id+'">'+ic('play',16)+' Entrenar</button>')+'<button class="btn'+(done?' pri grow':'')+'" data-a="treeOpen">'+ic('tree',16)+' Árbol</button></div></div>';
}

/* ============ Qué tan fuerte sos: percentil, próximo rango y progreso ============ */
/* percentil a partir de un nivel con decimales (misma tabla que pctStronger) */
function pctFromV(v){
  if(v<0)return 3;
  return Math.min(99,Math.max(1,Math.round(LToP(v))));
}
const whoTxt=()=>{const p=db.profile||{};return (p.sex==='f'?'mujeres':p.sex==='m'?'hombres':'personas')+' que entrenan, con tu edad y tu peso';};
const pctLine=p=>p==null?'':'<span class="pctl">Más fuerte que el <b>'+p+' %</b></span>';
/* el ejercicio que tenés más cerca de subir de rango (de los que cuentan para tu rango general) */
function nextRankHint(){
  const gl=groupLevels(),used=new Set([].concat(...Object.values(gl).filter(Boolean).map(x=>x.used.map(e=>e.id))));
  let best=null;
  rankedList().forEach(x=>{
    if(!used.has(x.ex.id)||x.info.next==null)return;
    const gap=1-clamp(x.info.pct,0,1);
    if(!best||gap<best.gap)best={ex:x.ex,gap,L:x.info.next};
  });
  if(!best)return null;
  /* el grupo más flojo: subirlo es lo que más mueve el promedio */
  const weak=Object.keys(gl).filter(g=>gl[g]).sort((a,b)=>gl[a].v-gl[b].v)[0];
  return{ex:best.ex,L:best.L,txt:needTxt(best.ex,best.L),weak:weak&&Object.values(gl).filter(Boolean).length>1?weak:null};
}
/* series efectivas por grupo en las últimas 8 semanas (de lunes a domingo) */
function weeklyGroupSets(n){
  const mon=d=>{const x=parseK(d),w=(x.getDay()+6)%7;return addDays(d,-w);};
  const w0=mon(today()),weeks=[];for(let i=n-1;i>=0;i--)weeks.push(addDays(w0,-7*i));
  const grid={};Object.keys(GROUPS).forEach(g=>grid[g]=weeks.map(()=>0));
  db.logs.forEach(l=>{const wi=weeks.indexOf(mon(l.date));if(wi<0)return;
    l.entries.forEach(en=>{const ex=exById(en.ex);if(!ex)return;const g=groupOf(ex),s=en.sets.filter(x=>!x.w).length;if(grid[g])grid[g][wi]+=s;});});
  return{weeks,grid};
}
function heatCard(){
  if(!db.logs.length)return '';
  const {weeks,grid}=weeklyGroupSets(8),[lo,hi]=volTarget(genPrefs().goals);
  const lvl=x=>x===0?0:x<lo*.5?1:x<lo?2:x<=hi*1.3?3:4;
  return '<div class="card"><div class="hd"><div><h3>Series por semana</h3><span class="mut sm-t">Cada cuadrado es una semana. Más intenso = más series.</span></div></div>'+
   '<div class="heat" style="--n:'+weeks.length+'"><span></span>'+weeks.map((w,i)=>'<small>'+(i===weeks.length-1?'Esta':parseK(w).getDate()+'/'+(parseK(w).getMonth()+1))+'</small>').join('')+
   Object.keys(GROUPS).map(g=>'<b>'+g+'</b>'+grid[g].map((x,i)=>'<i class="h'+lvl(x)+'" title="'+g+': '+x+' series la semana del '+esc(longDate(weeks[i]))+'">'+(x||'')+'</i>').join('')).join('')+'</div>'+
   '<div class="heat-leg"><span>Poco</span><i class="h1"></i><i class="h2"></i><i class="h3"></i><i class="h4"></i><span>Mucho</span></div></div>';
}
/* lo que más mejoraste en las últimas 4 semanas */
function improvements(){
  const cut=addDays(today(),-28),out=[];
  rankedList().forEach(x=>{
    let before=0,after=0;
    allSess().forEach(l=>l.entries.forEach(en=>{if(en.ex!==x.ex.id)return;en.sets.forEach(s=>{if(s.w)return;const e=e1(x.ex,s.kg,s.reps);if(l.date<cut)before=Math.max(before,e);else after=Math.max(after,e);});}));
    if(before>0&&after>before*1.005)out.push({ex:x.ex,d:after-before,rel:after/before-1});
  });
  return out.sort((a,b)=>b.rel-a.rel).slice(0,4);
}
function improveCard(){
  const im=improvements();if(!im.length)return '';
  return '<div class="card"><div class="hd"><div><h3>Lo que más mejoraste</h3><span class="mut sm-t">Últimas 4 semanas contra antes</span></div>'+ic('trophy',20)+'</div>'+
   im.map(x=>'<div class="rowline"><span>'+esc(shortN(x.ex.n))+'</span><span class="up-t">+'+(x.ex.sk||x.ex.time?Math.round(x.d)+unitOf(x.ex):num(x.d,1)+' kg')+' <small>('+Math.round(x.rel*100)+' %)</small></span></div>').join('')+'</div>';
}

/* ============ Medidas del cuerpo ============ */
const MEAS=[['cintura','Cintura'],['cadera','Cadera'],['pecho','Pecho'],['brazo','Brazo'],['muslo','Muslo']];
function measCard(){
  const ms=(db.meas||[]).slice().sort((a,b)=>a.date<b.date?-1:1),last=ms[ms.length-1],first=ms[0];
  const val=k=>{for(let i=ms.length-1;i>=0;i--)if(ms[i][k])return ms[i][k];return null;},fst=k=>{for(const m of ms)if(m[k])return m[k];return null;};
  return '<div class="card"><div class="hd"><div><h3>Medidas</h3><span class="mut sm-t">En centímetros. Medí siempre en el mismo lugar y a la misma hora.</span></div></div>'+
   '<div class="meas">'+MEAS.map(([k,n])=>{const v=val(k),f0=fst(k),d=v&&f0&&ms.length>1?v-f0:null;
     return '<label><span>'+n+'</span><input type="text" inputmode="decimal" autocomplete="off" placeholder="'+(v?num(v,1):'cm')+'" data-mk="'+k+'" aria-label="'+n+' en centímetros">'+
      (v?'<small>'+num(v,1)+(d?' <em class="'+(d>0?'p':'n')+'">'+(d>0?'+':'')+num(d,1)+'</em>':'')+'</small>':'<small class="mut">—</small>')+'</label>';}).join('')+'</div>'+
   '<button class="btn pri wide" style="margin-top:10px" data-a="measSave">Guardar medidas de hoy</button>'+
   (ms.length?'<p class="mut sm-t" style="margin-top:8px">'+ms.length+(ms.length===1?' registro':' registros')+(first&&last&&first!==last?', desde el '+esc(longDate(first.date)):'')+'. Los números en color son el cambio desde la primera vez.</p>':'')+'</div>';
}

/* ============ Fotos de progreso (solo en este dispositivo) ============ */
const PhotoDB={
  db:null,
  open(){return this.db?Promise.resolve(this.db):new Promise((ok,ko)=>{const r=indexedDB.open('swole-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p',{keyPath:'id'});r.onsuccess=()=>{this.db=r.result;ok(r.result);};r.onerror=()=>ko(r.error);});},
  async all(){const d=await this.open();return new Promise((ok,ko)=>{const q=d.transaction('p').objectStore('p').getAll();q.onsuccess=()=>ok(q.result.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:a.t-b.t));q.onerror=()=>ko(q.error);});},
  async put(o){const d=await this.open();return new Promise((ok,ko)=>{const t=d.transaction('p','readwrite');t.objectStore('p').put(o);t.oncomplete=ok;t.onerror=()=>ko(t.error);});},
  async del(id){const d=await this.open();return new Promise((ok,ko)=>{const t=d.transaction('p','readwrite');t.objectStore('p').delete(id);t.oncomplete=ok;t.onerror=()=>ko(t.error);});}
};
let photoCache=null,photoURLs={};
async function loadPhotos(){
  try{photoCache=await PhotoDB.all();}catch(e){photoCache=[];}
  Object.values(photoURLs).forEach(u=>URL.revokeObjectURL(u));photoURLs={};
  photoCache.forEach(p=>photoURLs[p.id]=URL.createObjectURL(p.blob));
  const el=document.getElementById('photoBox');if(el)el.innerHTML=photoGrid();
}
/* achica la foto a 1080 px de alto como máximo antes de guardarla */
async function shrinkPhoto(file){
  const bmp=await createImageBitmap(file),k=Math.min(1,1080/Math.max(bmp.width,bmp.height));
  const cv=document.createElement('canvas');cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);
  return new Promise(r=>cv.toBlob(r,'image/jpeg',.82));
}
function photoGrid(){
  if(!photoCache)return '<p class="mut sm-t">Cargando…</p>';
  if(!photoCache.length)return '<p class="mut sm-t">Todavía no hay fotos. Sacate una de frente y otra de costado, con la misma luz cada vez.</p>';
  return '<div class="pgrid">'+photoCache.slice().reverse().map(p=>'<button class="ph" data-a="photoView" data-v="'+p.id+'"><img src="'+photoURLs[p.id]+'" alt="Foto de progreso del '+esc(longDate(p.date))+'"><span>'+esc(shortDate(parseK(p.date).getTime()))+'</span></button>').join('')+'</div>'+
   (photoCache.length>1?'<button class="btn wide" style="margin-top:10px" data-a="photoCompare">'+ic('swap',16)+' Comparar antes y después</button>':'');
}
function photoCard(){
  if(photoCache===null)setTimeout(loadPhotos,0);
  return '<div class="card"><div class="hd"><div><h3>Fotos de progreso</h3><span class="mut sm-t">Se guardan solo en este dispositivo: no se suben a ningún lado.</span></div></div>'+
   '<div id="photoBox">'+photoGrid()+'</div>'+
   '<label class="btn pri wide" style="margin-top:10px;cursor:pointer">'+ic('plus',16)+' Agregar foto<input type="file" accept="image/*" data-i="photoAdd" hidden></label></div>';
}
function photoCmpHTML(m){
  const ps=photoCache||[],a=ps.find(p=>p.id===m.a),b=ps.find(p=>p.id===m.b);
  if(!a||!b)return '<p class="mut">Necesitás al menos dos fotos.</p>';
  const days=Math.round((parseK(b.date)-parseK(a.date))/864e5);
  const sel=(f,cur)=>'<select data-i="phSel" data-f="'+f+'">'+ps.map(p=>'<option value="'+p.id+'"'+(p.id===cur?' selected':'')+'>'+esc(longDate(p.date))+'</option>').join('')+'</select>';
  return '<div class="cmp" style="--x:'+(m.x||50)+'%"><img src="'+photoURLs[a.id]+'" alt="Antes"><div class="cmp-b"><img src="'+photoURLs[b.id]+'" alt="Después"></div><i class="cmp-h"></i>'+
   '<span class="cmp-l">Antes</span><span class="cmp-r">Después</span><input type="range" min="0" max="100" value="'+(m.x||50)+'" data-i="phX" aria-label="Deslizá para comparar"></div>'+
   '<p class="tc mut sm-t" style="margin-top:8px">'+(days>0?days+' días de diferencia':'Mismo día')+'. Deslizá para comparar.</p>'+
   '<div class="g2"><label class="field">Antes'+sel('a',a.id)+'</label><label class="field">Después'+sel('b',b.id)+'</label></div>';
}
function photoViewHTML(m){
  const p=(photoCache||[]).find(x=>x.id===m.id);if(!p)return '';
  return '<img class="ph-big" src="'+photoURLs[p.id]+'" alt="Foto de progreso del '+esc(longDate(p.date))+'"><p class="tc mut sm-t" style="margin:8px 0 12px">'+esc(longDate(p.date))+'</p>'+
   '<button class="btn bad wide" data-a="photoDel" data-v="'+p.id+'">'+ic('trash',16)+' Borrar foto</button>';
}

/* ============ Amigos: ranking, temporada y novedades ============ */
/* novedades propias (se publican a tus amigos): entrenos, récords, subidas de nivel, logros, habilidades */
function addEv(o){o.d=o.d||today();db.settings.ev=[o].concat(db.settings.ev||[]).slice(0,40);}
const monthKey=d=>(d||today()).slice(0,7);
/* puntos de la temporada (mes): premian progresar, no ser el más fuerte */
const SEASON_PTS={w:10,pr:15,up:25,rank:60,sk:40,ach:10,mis:0};
function seasonStats(){
  const m=monthKey(),days=new Set(db.logs.filter(l=>l.date.slice(0,7)===m).map(l=>l.date));
  const ev=(db.settings.ev||[]).filter(e=>e.d&&e.d.slice(0,7)===m);
  const c={w:days.size,pr:0,up:0,rank:0,sk:0,ach:0};
  ev.forEach(e=>{if(c[e.k]!=null&&e.k!=='w')c[e.k]++;});
  c.mis=ev.filter(e=>e.k==='mis').length;
  const pts=Object.keys(c).reduce((s,k)=>s+c[k]*SEASON_PTS[k],0)+ev.filter(e=>e.k==='mis').reduce((s,e)=>s+(+e.p||0),0);
  return Object.assign({m,pts},c);
}
const COMP_MET={w:['Entrenos','días entrenados'],sets:['Series','series hechas'],pts:['Puntos','puntos']};
function compScore(c){
  const a=c.start_day,b=c.end_day,logs=db.logs.filter(l=>l.date>=a&&l.date<=b),days=new Set(logs.map(l=>l.date)).size;
  if(c.metric==='w')return days;
  if(c.metric==='sets')return logs.reduce((s,l)=>s+l.entries.reduce((t,en)=>t+en.sets.filter(x=>!x.w).length,0),0);
  return (db.settings.ev||[]).filter(e=>e.d&&e.d>=a&&e.d<=b).reduce((p,e)=>p+(e.k==='mis'?(+e.p||0):e.k!=='w'&&SEASON_PTS[e.k]?SEASON_PTS[e.k]:0),days*SEASON_PTS.w);
}
const SK_IDS=()=>[].concat(...TREE.map(b=>b.ids.map(s=>s.split(':')[0])));
function skillsMastered(){const out=[];branches().forEach(b=>b.nodes.forEach((n,i)=>{if(bestRep(n.id)>=n.t)out.push(n.id);}));return out;}
/* lo que ven tus amigos: rangos y niveles (ya ajustados por tu peso, edad y sexo), nunca tu peso, edad ni mail */
function publicSummary(){
  const ov=overall(),st=cardStats(),gl=groupLevels(),lifts={};
  rankedList().slice(0,24).forEach(x=>{const v=Math.max(-1,x.info.L+clamp(x.info.pct,0,.999));const o={v:Math.round(v*100)/100};
    if(x.ex.st&&!x.ex.sk&&db.profile&&db.profile.weight)o.r=Math.round(x.b.e/db.profile.weight*100)/100;lifts[x.ex.id]=o;});
  const groups={};Object.keys(gl).forEach(g=>{if(gl[g])groups[g]=Math.round(gl[g].v*100)/100;});
  return{v:1,ovr:ov?{L:ov.L,p:Math.round(ov.pct*100)/100}:null,pctl:ov?pctFromV(ov.L+ov.pct):null,card:st,groups,lifts,sk:skillsMastered(),
    season:seasonStats(),ev:(db.settings.ev||[]).slice(0,20),streak:streak(),sports:(db.profile&&db.profile.sports)||[],goal:db.settings.skillGoal?db.settings.skillGoal.id:null};
}
function afterSocial(){
  try{
    const fc=S.social.friends.length,was=db.settings.frCount||0;
    if(fc!==was){db.settings.frCount=fc;save();const un=ACCENTS.filter(a=>a[4]&&a[4]>was&&a[4]<=fc);if(un.length)setTimeout(()=>{toast('Desbloqueaste el color '+un.map(a=>a[1]).join(' y ')+': elegilo en Perfil');confetti(40);},600);}
    /* ¿alguien te pasó en la temporada? */
    const rows=rankRows('season'),i=rows.findIndex(x=>x.me),m=monthKey(),old=db.settings.seasonPos;
    if(i>=0){if(old&&old.m===m&&i>old.i&&rows[i-1]&&rows[i-1].v>0)db.settings.seasonPass={m,by:rows[i-1].r.nick||'Un amigo',seen:0};db.settings.seasonPos={m,i};save();}
    /* torneo terminado que no viste: podio (una vez) */
    const me=S.social.me&&S.social.me.user_id,seen=db.settings.compSeen||[],t=today();
    const c=(S.social.comps||[]).find(c=>c.end_day<t&&!seen.includes(c.id)&&(c.swole_comp_member||[]).some(x=>x.user_id===me&&x.joined));
    if(c&&!S.modal&&!S.m2&&!db.active&&!S.podShown){S.podShown=1;setTimeout(()=>ACTIONS.podium(c.id),700);}
  }catch(e){}
  updNotif();
}
/* lo que escribieron otros entra sin < ni > (y con largo acotado): así nunca puede terminar pintado como HTML */
const cleanJ=(x,d)=>{d=d||0;if(typeof x==='string')return x.replace(/</g,'‹').replace(/>/g,'›').slice(0,400);if(x==null||typeof x!=='object')return x;if(d>8)return null;
  if(Array.isArray(x))return x.slice(0,300).map(v=>cleanJ(v,d+1));const o={};Object.keys(x).slice(0,300).forEach(k=>{const kk=k.replace(/[<>"'&]/g,'');if(kk==='__proto__'||kk==='toString'||kk==='valueOf')return;o[kk]=cleanJ(x[k],d+1);});return o;};
const addMsg=r=>r==='sent'?'Solicitud enviada: cuando la acepte, ya son amigos':r==='already'?'Ya son amigos':'¡Listo! Ya son amigos';
const Social=(()=>{
  let pub='',timer=null;
  const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const mkCode=()=>{let s='';const r=crypto.getRandomValues(new Uint8Array(6));r.forEach(x=>s+=A[x%A.length]);return s;};
  const on=()=>!!(db.settings.social&&db.settings.social.code&&Sync.user());
  const nick=()=>String((db.profile&&db.profile.nick)||'Atleta').slice(0,24);
  const errTxt=e=>{const m=String(e&&e.message||'');return /too_many_req/.test(m)?'Tenés demasiadas solicitudes sin responder':/too_many_comps/.test(m)?'Ya tenés 5 torneos activos':/no_members/.test(m)?'Elegí al menos un amigo':/no_request/.test(m)?'Esa solicitud ya no existe':/code_not_found/.test(m)?'No encontré ese código':/own_code/.test(m)?'Ese es tu propio código':/too_many/.test(m)?'Llegaste al máximo de 100 amigos':/no_profile/.test(m)?'Primero activá amigos':!navigator.onLine?'Sin conexión: probá más tarde':'No se pudo: '+m;};
  async function publish(force){
    if(!on())return;
    /* nuevas habilidades dominadas también son novedades */
    const sk=skillsMastered(),seen=db.settings.skSeen||null;
    if(seen){sk.filter(id=>!seen.includes(id)).forEach(id=>addEv({k:'sk',x:id}));}
    if(!seen||sk.length!==seen.length){db.settings.skSeen=sk;save();}
    const data=publicSummary(),body={user_id:Sync.user().id,code:db.settings.social.code,nick:nick(),data,updated_at:new Date().toISOString()};
    const h=JSON.stringify([body.code,body.nick,data]);if(!force&&h===pub)return;
    await Sync.req('/rest/v1/swole_public?on_conflict=user_id',{method:'POST',auth:true,headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body});
    pub=h;
  }
  function schedule(){if(!on())return;clearTimeout(timer);timer=setTimeout(()=>publish().catch(()=>{}),5000);}
  async function load(){
    if(!on())return null;
    try{await publish();}catch(e){}
    const rows=cleanJ(await Sync.req('/rest/v1/swole_public?select=user_id,code,nick,data,updated_at',{auth:true}));
    const me=Sync.user().id;
    S.social={at:Date.now(),me:(rows||[]).find(r=>r.user_id===me)||null,friends:(rows||[]).filter(r=>r.user_id!==me),req:[],comps:[]};
    try{S.social.req=cleanJ(await Sync.req('/rest/v1/rpc/swole_requests',{method:'POST',auth:true,body:{}}))||[];}catch(e){}
    try{await loadComps();}catch(e){}
    try{await flush();}catch(e){}
    try{await loadPosts();}catch(e){}
    afterSocial();
    return S.social;
  }
  async function enable(){
    if(!Sync.user()){S.m2={t:'login',d:{email:'',pw:'',mode:'up',busy:false}};render();toast('Para tener amigos necesitás una cuenta (así se guardan tus datos en la nube)');return;}
    for(let i=0;i<5;i++){
      const code=mkCode();db.settings.social={code,since:today()};
      try{await publish(true);save();await load();await addPending();return true;}
      catch(e){if(e.status!==409&&!/duplicate|unique/i.test(e.message)){db.settings.social=null;throw e;}}
    }
    db.settings.social=null;throw new Error('No se pudo crear el código');
  }
  async function disable(){
    if(Sync.user())await Sync.req('/rest/v1/swole_public?user_id=eq.'+Sync.user().id,{method:'DELETE',auth:true});
    db.settings.social=null;pub='';S.social=null;save();
  }
  async function add(code){
    code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(code.length!==6)throw new Error('code_len');
    const r=await Sync.req('/rest/v1/rpc/swole_add_friend',{method:'POST',auth:true,body:{p_code:code}});
    await load();return r;
  }
  /* torneos: cada uno sube su propio puntaje, calculado en su celu */
  async function loadComps(){
    const me=Sync.user().id,t=today();
    const rows=cleanJ(await Sync.req('/rest/v1/swole_comp?select=*,swole_comp_member(*)&end_day=gte.'+addDays(t,-30)+'&order=end_day.desc',{auth:true}))||[];
    for(const c of rows){
      const m=(c.swole_comp_member||[]).find(x=>x.user_id===me);if(!m||!m.joined||t>addDays(c.end_day,1))continue;
      const sc=compScore(c);if(+m.score===sc&&m.nick===nick())continue;
      try{await Sync.req('/rest/v1/swole_comp_member?comp_id=eq.'+c.id+'&user_id=eq.'+me,{method:'PATCH',auth:true,headers:{Prefer:'return=minimal'},body:{score:sc,nick:nick(),updated_at:new Date().toISOString()}});m.score=sc;m.nick=nick();}catch(e){}
    }
    if(S.social)S.social.comps=rows;return rows;
  }
  async function answer(from,ok){await Sync.req('/rest/v1/rpc/swole_answer_request',{method:'POST',auth:true,body:{p_from:from,p_ok:!!ok}});await load();}
  async function cancel(to){await Sync.req('/rest/v1/rpc/swole_cancel_request',{method:'POST',auth:true,body:{p_to:to}});await load();}
  async function compCreate(name,metric,days,members){await Sync.req('/rest/v1/rpc/swole_comp_create',{method:'POST',auth:true,body:{p_name:name,p_metric:metric,p_days:days,p_members:members}});await load();}
  async function compJoin(id,ok){
    const me=Sync.user().id,q='/rest/v1/swole_comp_member?comp_id=eq.'+id+'&user_id=eq.'+me;
    if(ok)await Sync.req(q,{method:'PATCH',auth:true,headers:{Prefer:'return=minimal'},body:{joined:true,nick:nick()}});
    else await Sync.req(q,{method:'DELETE',auth:true});
    await load();
  }
  async function compDel(id){await Sync.req('/rest/v1/swole_comp?id=eq.'+id,{method:'DELETE',auth:true});await load();}
  /* entreno → post (cola por si no hay internet) */
  function share(log,x){
    if(!on()||db.settings.autoPost===false)return false;
    const exs=log.entries.map(en=>{const ex=exById(en.ex);if(!ex)return null;const ss=en.sets.filter(s=>!s.w);if(!ss.length)return null;
      const b=ss.reduce((a,s)=>e1(ex,s.kg,s.reps)>e1(ex,a.kg,a.reps)?s:a,ss[0]);return{n:shortN(ex.n),s:ss.length,b:setTxt(ex,b)};}).filter(Boolean);
    const data={v:1,n:String(log.name||'Entrenamiento').slice(0,40),dur:log.dur,sets:x.sets,vol:Math.round(x.vol),
      prs:x.prs.map(p=>{const e=exById(p.ex);return e?shortN(e.n):'';}).filter(Boolean).slice(0,6),
      ups:x.ups.map(u=>{const e=exById(u.ex);return e?{n:shortN(e.n),L:u.to}:null;}).filter(Boolean).slice(0,4),ex:exs.slice(0,6),more:Math.max(0,exs.length-6)};
    db.settings.postQ=(db.settings.postQ||[]).concat({log_id:String(log.id),day:log.date,data}).slice(-20);save();flush().catch(()=>{});return true;
  }
  async function flush(){
    const q=db.settings.postQ||[];if(!q.length||!on())return;
    for(const p of q.slice()){
      await Sync.req('/rest/v1/swole_post?on_conflict=user_id,log_id',{method:'POST',auth:true,headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:Object.assign({user_id:Sync.user().id},p)});
      db.settings.postQ=(db.settings.postQ||[]).filter(x=>x.log_id!==p.log_id);save();
    }
  }
  async function unshare(logId){
    db.settings.postQ=(db.settings.postQ||[]).filter(x=>x.log_id!==String(logId));save();
    await Sync.req('/rest/v1/swole_post?user_id=eq.'+Sync.user().id+'&log_id=eq.'+encodeURIComponent(logId),{method:'DELETE',auth:true});
    if(S.social&&S.social.posts)S.social.posts=S.social.posts.filter(p=>!(p.user_id===Sync.user().id&&p.log_id===String(logId)));
  }
  async function loadPosts(){
    const r=await Sync.req('/rest/v1/swole_post?select=id,user_id,log_id,nick,day,data,created_at,swole_like(user_id),swole_comment(id,user_id,nick,body,created_at)&order=created_at.desc&limit=40',{auth:true})||[];
    r.forEach((p,i)=>{r[i]=p=cleanJ(p);p.likes=(p.swole_like||[]).map(x=>x.user_id);p.cmts=(p.swole_comment||[]).sort((a,b)=>a.created_at<b.created_at?-1:1);delete p.swole_like;delete p.swole_comment;});
    if(S.social)S.social.posts=r;return r;
  }
  async function fire(id){
    const p=(S.social.posts||[]).find(x=>x.id===id),me=Sync.user().id;if(!p)return;
    const had=p.likes.includes(me);p.likes=had?p.likes.filter(x=>x!==me):p.likes.concat(me);
    try{if(had)await Sync.req('/rest/v1/swole_like?post_id=eq.'+id+'&user_id=eq.'+me,{method:'DELETE',auth:true});
      else await Sync.req('/rest/v1/swole_like',{method:'POST',auth:true,headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:{post_id:id,user_id:me}});}
    catch(e){p.likes=had?p.likes.concat(me):p.likes.filter(x=>x!==me);throw e;}
  }
  async function comment(id,body){
    const p=(S.social.posts||[]).find(x=>x.id===id);if(!p)return;
    const r=await Sync.req('/rest/v1/swole_comment',{method:'POST',auth:true,headers:{Prefer:'return=representation'},body:{post_id:id,user_id:Sync.user().id,body}});
    if(r&&r[0])p.cmts.push(r[0]);
  }
  async function uncomment(pid,cid){
    await Sync.req('/rest/v1/swole_comment?id=eq.'+cid,{method:'DELETE',auth:true});
    const p=(S.social.posts||[]).find(x=>x.id===pid);if(p)p.cmts=p.cmts.filter(c=>c.id!==cid);
  }
  async function remove(id){await Sync.req('/rest/v1/rpc/swole_remove_friend',{method:'POST',auth:true,body:{p_friend:id}});await load();}
  /* código que llegó por link (?amigo=XXXXXX) */
  async function addPending(){
    let c=null;try{c=localStorage.getItem('swole.pendFriend');}catch(e){}
    if(!c||!on())return;
    try{localStorage.removeItem('swole.pendFriend');}catch(e){}
    try{const r=await add(c);toast(addMsg(r));render();}catch(e){toast(errTxt(e));}
  }
  return{on,publish,schedule,load,enable,disable,add,remove,addPending,errTxt,answer,cancel,compCreate,compJoin,compDel,share,unshare,loadPosts,fire,comment,uncomment,link:()=>location.origin+location.pathname+'?amigo='+(db.settings.social?db.settings.social.code:'')};
})();

/* textos */
const evTxt=e=>{const ex=e.x?exById(e.x):null,n=ex?shortN(ex.n):'';
  return e.k==='w'?'entrenó '+(e.n||'')
   :e.k==='pr'?'hizo récord en '+n
   :e.k==='up'?'subió a <b style="color:'+lvlColor(e.L)+'">'+lvlName(e.L)+'</b> en '+n
   :e.k==='rank'?'subió a <b style="color:'+lvlColor(e.L)+'">'+lvlName(e.L)+'</b> de rango general'
   :e.k==='sk'?'dominó '+n
   :e.k==='ach'?'desbloqueó el logro "'+esc(e.n||'')+'"'
   :e.k==='mis'?'cumplió la misión "'+esc(e.n||'')+'"':'';};
const evIc=k=>({w:'dumb',pr:'trophy',up:'up',rank:'crown',sk:'acro',ach:'medal',mis:'flag'})[k]||'spark';
const plu=(n,a,b)=>n+' '+(n===1?a:b);
const dayAgo=d=>{const n=Math.round((parseK(today())-parseK(d))/864e5);return n<=0?'hoy':n===1?'ayer':n<7?'hace '+n+' días':shortDate(parseK(d).getTime());};
const RANK_OPTS=[['ovr','Rango general'],['season','Temporada'],['OVR','Puntaje'],['bench','Banca'],['squat','Sentadilla'],['deadlift','Peso muerto'],['ohp','Press militar'],['pullup','Dominadas']];
function rankRows(metric){
  const me=S.social&&S.social.me,all=(S.social?S.social.friends:[]).concat(me?[me]:[]);
  const val=r=>{const d=r.data||{};
    if(metric==='ovr')return d.ovr?d.ovr.L+d.ovr.p:null;
    if(metric==='season')return d.season&&d.season.m===monthKey()?d.season.pts:0;
    if(metric==='OVR')return d.card&&d.card.OVR!=null?d.card.OVR:null;
    return d.lifts&&d.lifts[metric]?d.lifts[metric].v:null;};
  return all.map(r=>({r,v:val(r),me:me&&r.user_id===me.user_id})).filter(x=>x.v!=null).sort((a,b)=>b.v-a.v);
}
function friendsHTML(m){
  const tab=m.tab||'rank';
  if(!Sync.user())return '<div class="soc-hero">'+ic('user',28)+'<h3>Entrená con tus amigos</h3><p class="mut">Rankings justos (ajustados por peso, edad y sexo), una temporada por mes y las novedades de tus amigos.</p></div>'+
    '<p class="mut sm-t">Para usar amigos necesitás una cuenta: así tus datos quedan guardados en la nube.</p><div class="g2"><button class="btn pri" data-a="loginOpen" data-v="up">Crear cuenta</button><button class="btn line" data-a="loginOpen">Ya tengo cuenta</button></div>';
  if(!Social.on())return '<div class="soc-hero">'+ic('user',28)+'<h3>Entrená con tus amigos</h3><p class="mut">Rankings justos, una temporada por mes y las novedades de tus amigos.</p></div>'+
    '<div class="card" style="margin:0"><h4 style="margin-bottom:6px">Qué ven tus amigos</h4><p class="sm-t">Tu apodo, tus rangos y niveles, tu carta, tus habilidades, tus puntos de la temporada y tus novedades (entrenos, récords, subidas de rango).</p>'+
    '<h4 style="margin:10px 0 6px">Qué NO ven</h4><p class="sm-t">Tu mail, tu peso, tu edad, tus medidas, tus fotos ni tus comidas. Solo te ven las personas que agregás (o que te agregan con tu código).</p></div>'+
    '<button class="btn pri wide" style="margin-top:12px" data-a="socOn">Activar amigos</button>';
  const sc=db.settings.social.code,sv=S.social;
  const head='<div class="soc-code"><div><span class="mut sm-t">Tu código</span><b>'+sc+'</b></div><button class="btn sm" data-a="socShare">'+ic('share',16)+' Invitar</button></div>'+
    '<div class="row" style="gap:8px;margin:10px 0 4px"><input class="soc-in" id="socCode" maxlength="7" placeholder="Código de un amigo" autocomplete="off" autocapitalize="characters" aria-label="Código de un amigo"><button class="btn pri" data-a="socAdd">Agregar</button></div>';
  const rin=sv?(sv.req||[]).filter(r=>r.dir==='in'):[],cinv=sv?(sv.comps||[]).filter(c=>{const me=(c.swole_comp_member||[]).find(x=>sv.me&&x.user_id===sv.me.user_id);return me&&!me.joined&&c.end_day>=today();}):[];
  const dot=n=>n?' <span class="soc-dot">'+n+'</span>':'';
  const tabs='<div class="seg soc-tabs">'+[['rank','Ranking',0],['comp','Torneos',cinv.length],['feed','Novedades',0],['list','Amigos',rin.length]].map(([k,n,c])=>'<button class="'+(tab===k?'on':'')+'" data-a="socTab" data-v="'+k+'">'+n+dot(c)+'</button>').join('')+'</div>';
  if(!sv)return head+tabs+'<p class="mut tc" style="padding:30px 0">Cargando…</p>';
  const reqBox=rin.length&&tab!=='list'?'<button class="soc-alert" data-a="socTab" data-v="list">'+ic('user',18)+'<span class="grow"><b>'+(rin.length===1?esc(rin[0].nick)+' quiere ser tu amigo':rin.length+' solicitudes de amistad')+'</b><small>Tocá para responder</small></span>'+ic('right',16)+'</button>':'';
  const nf0=!sv.friends.length?'<div class="card empty" style="margin:0">'+ic('user',30)+'<b>Todavía no tenés amigos en Swole</b>Pasales tu código o tocá Invitar para mandarles el link.</div>':'';
  let body='';
  if(tab==='rank'){
    const met=m.met||'ovr',rows=rankRows(met);
    body='<div class="chips" style="margin:4px 0 12px">'+RANK_OPTS.filter(o=>o[0]!=='season').map(([k,n])=>'<button class="chip '+(met===k?'on':'')+'" data-a="socMet" data-v="'+k+'">'+n+'</button>').join('')+'</div>'+
     (rows.length?'<div class="lb">'+rows.map((x,i)=>{const d=x.r.data||{},L=met==='ovr'||met==='OVR'?(d.ovr?d.ovr.L:-1):Math.floor(x.v),li=d.lifts&&d.lifts[met];
       const val=met==='OVR'?'<b>'+(+x.v||0)+'</b> pts':met==='ovr'?lvlSpan(L)+(d.pctl?'<small>Top '+(100-d.pctl)+' %</small>':''):lvlSpan(Math.max(-1,Math.floor(x.v)))+(li&&li.r?'<small>'+num(li.r,2)+'× su peso</small>':'');
       return '<button class="lb-r'+(x.me?' me':'')+'" data-a="socCard" data-v="'+x.r.user_id+'"><span class="lb-n">'+(i+1)+'</span>'+badge(L,36)+'<span class="grow"><b>'+esc(x.r.nick||'Atleta')+(x.me?' <span class="tag">vos</span>':'')+'</b></span><span class="lb-v">'+val+'</span></button>';}).join('')+'</div>'
      :'<p class="mut sm-t">Nadie cargó este ejercicio todavía.</p>')+
     '<p class="mut sm-t" style="margin-top:10px">Se compara el nivel, que ya está ajustado por peso, edad y sexo: así es justo entre cuerpos distintos.</p>'+nf0;
  }else if(tab==='comp'){
    const rows=rankRows('season'),d0=new Date(),left=new Date(d0.getFullYear(),d0.getMonth()+1,0).getDate()-d0.getDate();
    body=compsHTML(sv)+'<h4 class="soc-h">Temporada del mes</h4><p class="mut sm-t" style="margin:-4px 0 10px">Un torneo con todos tus amigos que arranca de cero cada mes.</p><div class="soc-season"><span class="lh-k">Temporada de '+MESES[d0.getMonth()]+'</span><b>'+(left?'Quedan '+left+' días':'Último día')+'</b></div>'+
     '<div class="lb">'+rows.map((x,i)=>{const s=(x.r.data||{}).season||{};return '<button class="lb-r'+(x.me?' me':'')+(i<3&&x.v>0?' top'+(i+1):'')+'" data-a="socCard" data-v="'+x.r.user_id+'"><span class="lb-n">'+(i+1)+'</span><span class="grow"><b>'+esc(x.r.nick||'Atleta')+(x.me?' <span class="tag">vos</span>':'')+'</b><small class="mut">'+plu(+s.w||0,'entreno','entrenos')+' · '+plu(+s.pr||0,'récord','récords')+' · '+plu((+s.up||0)+(+s.rank||0),'subida','subidas')+'</small></span><span class="lb-v"><b>'+(+x.v||0)+'</b> pts</span></button>';}).join('')+'</div>'+
     '<details class="why"><summary>¿Cómo se suman puntos?</summary><div class="mut sm-t"><p>Entreno (uno por día): '+SEASON_PTS.w+' · Misiones semanales: 20 a 40 cada una · Récord: '+SEASON_PTS.pr+' · Subir de nivel en un ejercicio: '+SEASON_PTS.up+' · Dominar una habilidad: '+SEASON_PTS.sk+' · Subir de rango general: '+SEASON_PTS.rank+' · Logro: '+SEASON_PTS.ach+'.</p><p>Gana el que más progresa en el mes, no el más fuerte: el que recién empieza puede ganarle a cualquiera. Cada mes arranca de cero.</p></div></details>'+nf0;
  }else if(tab==='feed'){
    body=feedHTML(sv)+nf0;
  }else if(tab==='feedOld'){
    const all=[];sv.friends.concat(sv.me?[sv.me]:[]).forEach(r=>((r.data||{}).ev||[]).forEach(e=>all.push({e,r,me:sv.me&&r.user_id===sv.me.user_id})));
    all.sort((a,b)=>a.e.d<b.e.d?1:a.e.d>b.e.d?-1:0);
    body=all.length?'<div class="feed">'+all.slice(0,50).map(x=>'<div class="fd"><span class="fd-ic">'+ic(evIc(x.e.k),16)+'</span><span class="grow"><b>'+(x.me?'Vos':esc(x.r.nick||'Atleta'))+'</b> '+evTxt(x.e)+'</span><small class="mut">'+dayAgo(x.e.d)+'</small></div>').join('')+'</div>':'<p class="mut sm-t">Todavía no hay novedades.</p>'+nf0;
  }else{
    const rout=(sv.req||[]).filter(r=>r.dir==='out');
    body=(rin.length?'<h4 class="soc-h">Solicitudes</h4><div class="lb">'+rin.map(r=>'<div class="lb-r soc-req"><span class="grow"><b>'+esc(r.nick)+'</b><small class="mut">Quiere ser tu amigo</small></span><button class="btn sm" data-a="socNo" data-v="'+r.user_id+'">Rechazar</button><button class="btn sm pri" data-a="socYes" data-v="'+r.user_id+'">Aceptar</button></div>').join('')+'</div>':'')+
     (sv.friends.length?'<h4 class="soc-h">Tus amigos ('+sv.friends.length+')</h4><div class="lb">'+sv.friends.map(r=>{const d=r.data||{};return '<div class="lb-r"><button class="row grow" style="gap:10px;text-align:left;min-width:0" data-a="socCard" data-v="'+r.user_id+'">'+badge(d.ovr?d.ovr.L:-1,36)+'<span class="grow"><b>'+esc(r.nick||'Atleta')+'</b><small class="mut">Activo '+dayAgo(String(r.updated_at).slice(0,10))+'</small></span></button><button class="btn sm line" data-a="socDel" data-v="'+r.user_id+'">Eliminar</button></div>';}).join('')+'</div>':nf0)+
     (rout.length?'<h4 class="soc-h">Enviadas</h4><div class="lb">'+rout.map(r=>'<div class="lb-r"><span class="grow"><b>'+esc(r.nick)+'</b><small class="mut">Esperando que acepte</small></span><button class="btn sm line" data-a="socCancel" data-v="'+r.user_id+'">Cancelar</button></div>').join('')+'</div>':'');
    body+='<button class="btn line wide bad" style="margin-top:14px" data-a="socOff">Dejar de compartir</button>';
  }
  return head+tabs+reqBox+body;
}
/* torneos entre amigos */
/* lo que tenés pendiente con amigos: solicitudes, invitaciones, torneos terminados y quién te pasó */
function notifItems(){
  const sv=S.social;if(!sv||!Social.on())return [];
  const me=sv.me&&sv.me.user_id,t=today(),seen=db.settings.compSeen||[],out=[];
  (sv.req||[]).filter(r=>r.dir==='in').forEach(r=>out.push({k:'req',id:r.user_id,i:'user',txt:'<b>'+esc(r.nick)+'</b> quiere ser tu amigo'}));
  (sv.comps||[]).forEach(c=>{const ms=c.swole_comp_member||[],mine=ms.find(x=>x.user_id===me);if(!mine)return;
    if(!mine.joined&&c.end_day>=t)out.push({k:'inv',id:c.id,i:'flag',txt:'Te invitaron al torneo <b>'+esc(c.name)+'</b>'});
    else if(mine.joined&&c.end_day<t&&!seen.includes(c.id))out.push({k:'end',id:c.id,i:'trophy',txt:'Terminó el torneo <b>'+esc(c.name)+'</b>: mirá el podio'});});
  const sp=db.settings.seasonPass;if(sp&&sp.m===monthKey()&&!sp.seen)out.push({k:'pass',i:'up',txt:'<b>'+esc(sp.by)+'</b> te pasó en la temporada. ¡A recuperar el lugar!'});
  return out;
}
function notifHTML(){
  const it=notifItems();
  if(!Social.on())return '<div class="card empty" style="margin:0">'+ic('bell',30)+'<b>Sin avisos</b>Cuando actives Amigos, acá te avisamos de solicitudes, torneos y quién te pasó.</div>';
  return (it.length?'<div class="nt-list">'+it.map(n=>'<div class="nt"><span class="nt-i">'+ic(n.i,17)+'</span><span class="grow">'+n.txt+'</span>'+
    (n.k==='req'?'<button class="btn sm" data-a="socNo" data-v="'+n.id+'">No</button><button class="btn sm pri" data-a="socYes" data-v="'+n.id+'">Aceptar</button>':
     n.k==='inv'?'<button class="btn sm pri" data-a="compYes" data-v="'+n.id+'">Sumarme</button>':
     n.k==='end'?'<button class="btn sm pri" data-a="podium" data-v="'+n.id+'">Ver</button>':'<button class="btn sm" data-a="passSeen">Ok</button>')+'</div>').join('')+'</div>'
    :'<div class="card empty" style="margin:0">'+ic('bell',30)+'<b>Estás al día</b>No tenés avisos nuevos.</div>')+
   '<p class="mut sm-t" style="margin-top:12px">'+(db.settings.push&&db.settings.push.on?'Con los recordatorios activados, estos avisos también te llegan al celular aunque Swole esté cerrada.':'Activá los recordatorios en Perfil y estos avisos te llegan al celular aunque Swole esté cerrada.')+'</p>'+
   '<button class="btn line wide" data-a="socOpen" data-v="rank">Ir a Amigos</button>';
}
function updNotif(){const b=document.getElementById('notifBtn');if(!b)return;const on=Social.on();b.hidden=!on;const n=on?notifItems().length:0;b.classList.toggle('has',n>0);b.setAttribute('data-n',n>9?'9+':String(n));}
function podiumHTML(id){
  const c=(S.social&&S.social.comps||[]).find(x=>x.id===id);if(!c)return '';
  const me=S.social.me&&S.social.me.user_id,ms=(c.swole_comp_member||[]).filter(x=>x.joined).sort((a,b)=>b.score-a.score),met=COMP_MET[c.metric]||COMP_MET.w;
  const pos=ms.findIndex(x=>x.user_id===me),top=[ms[1],ms[0],ms[2]];
  return '<div class="pod-h"><b>'+esc(c.name)+'</b><span class="mut sm-t">'+met[0]+' · terminó el '+shortDate(parseK(c.end_day).getTime())+'</span></div>'+
   '<div class="podium">'+top.map((x,k)=>{const place=[2,1,3][k];return x?'<div class="pod p'+place+(x.user_id===me?' me':'')+'"><span class="pod-n">'+esc(x.user_id===me?'Vos':x.nick)+'</span><span class="pod-s">'+nf(+x.score)+'</span><div class="pod-b">'+(place===1?ic('crown',22):'')+'<b>'+place+'</b></div></div>':'<div class="pod p'+place+' empty"></div>';}).join('')+'</div>'+
   '<p class="pod-msg">'+(pos===0?'¡Ganaste! Nadie te paró.':pos>0&&pos<3?'Quedaste '+(pos+1)+'º: en el podio.':pos>=0?'Quedaste '+(pos+1)+'º de '+ms.length+'. El próximo es tuyo.':'')+'</p>'+
   (ms.length>3?'<div class="trn-rows">'+ms.slice(3).map((x,i)=>'<div class="trn-r'+(x.user_id===me?' me':'')+'"><span class="lb-n">'+(i+4)+'</span><span class="grow">'+esc(x.user_id===me?'Vos':x.nick)+'</span><b>'+nf(+x.score)+'</b></div>').join('')+'</div>':'')+
   '<div class="g2" style="margin-top:14px"><button class="btn" data-a="compNew">Revancha</button><button class="btn pri" data-a="close" data-v="m2">Listo</button></div>';
}
/* el feed: entrenos de tus amigos (y los tuyos) con fuego y comentarios, más otras novedades */
const AV_COL=['#7A66FF','#FF4F93','#1F9E95','#E8A23C','#4FA8FF','#7BE35A','#D77BFF','#FF6B6B'];
const avatar=(nick,uid,sz)=>'<span class="av" style="width:'+(sz||38)+'px;height:'+(sz||38)+'px;background:'+AV_COL[hashStr(String(uid||nick))%AV_COL.length]+'">'+esc(String(nick||'A').trim().charAt(0).toUpperCase())+'</span>';
function postHTML(p,full){
  const me=Sync.user()&&Sync.user().id,mine=p.user_id===me,d=p.data||{},liked=p.likes.includes(me),open=S.cOpen===p.id;
  const ago=agoTxt(new Date(p.created_at).getTime());
  const likers=p.likes.map(u=>u===me?'vos':((S.social.friends.find(f=>f.user_id===u)||{}).nick||'')).filter(Boolean);
  const cm=open?p.cmts:p.cmts.slice(-2);
  return '<article class="post" id="post-'+p.id+'"><header class="post-h">'+avatar(mine?'Vos':p.nick,p.user_id)+'<span class="grow"><b>'+esc(mine?'Vos':p.nick)+'</b><small>'+ago+'</small></span>'+(mine?'<button class="ib flat" data-a="postDel" data-v="'+p.id+'" aria-label="Borrar publicación">'+ic('trash',16)+'</button>':'')+'</header>'+
   '<h4 class="post-t">'+esc(d.n||'Entrenamiento')+'</h4>'+
   '<div class="post-s"><span>'+ic('timer',14)+' '+(+d.dur||0)+' min</span><span>'+(+d.sets||0)+' series</span>'+(+d.vol?'<span>'+nf(+d.vol)+' kg</span>':'')+'</div>'+
   ((d.prs||[]).length||(d.ups||[]).length?'<div class="post-pr">'+(d.ups||[]).map(u=>'<span class="up" style="--c:'+lvlColor(u.L)+'">'+ic('up',13)+' '+esc(u.n)+': '+lvlName(u.L)+'</span>').join('')+(d.prs||[]).map(n=>'<span>'+ic('trophy',13)+' Récord en '+esc(n)+'</span>').join('')+'</div>':'')+
   ((d.ex||[]).length?'<div class="post-ex">'+d.ex.slice(0,full?6:4).map(e=>'<div><span>'+esc(e.n)+'</span><span class="mut">'+(+e.s||0)+' × · '+esc(e.b)+'</span></div>').join('')+((d.ex.length>4&&!full)||d.more?'<small class="mut">y '+((d.ex.length>4&&!full?d.ex.length-4:0)+(+d.more||0))+' más</small>':'')+'</div>':'')+
   '<div class="post-a"><button class="fire'+(liked?' on':'')+'" data-a="postFire" data-v="'+p.id+'" aria-pressed="'+liked+'" aria-label="Dar fuego">'+ic('flame',18)+'<b>'+(p.likes.length||'')+'</b></button>'+
   '<button data-a="postCmt" data-v="'+p.id+'" aria-label="Comentar">'+ic('chat',18)+'<b>'+(p.cmts.length||'')+'</b></button>'+
   (likers.length?'<span class="post-lk">'+ic('flame',12)+' '+esc(likers.slice(0,3).join(', '))+(likers.length>3?' y '+(likers.length-3)+' más':'')+'</span>':'')+'</div>'+
   (cm.length?'<div class="cmts">'+(p.cmts.length>cm.length?'<button class="cm-more" data-a="postCmt" data-v="'+p.id+'">Ver los '+p.cmts.length+' comentarios</button>':'')+cm.map(c=>'<div class="cm"><b>'+esc(c.user_id===me?'Vos':c.nick)+'</b> <span class="sel-ok">'+esc(c.body)+'</span>'+(c.user_id===me||mine?'<button class="cm-x" data-a="cmtDel" data-v="'+p.id+'|'+c.id+'" aria-label="Borrar comentario">'+ic('x',12)+'</button>':'')+'</div>').join('')+'</div>':'')+
   (open?'<div class="cm-in"><input id="cmt-'+p.id+'" maxlength="200" placeholder="Escribí algo (¡bien ahí!, ¿cuánto levantaste?…)" data-i="cmt" data-e="'+p.id+'" autocomplete="off"><button class="ib" data-a="cmtSend" data-v="'+p.id+'" aria-label="Enviar">'+ic('send',18)+'</button></div>':'')+
   '</article>';
}
function feedHTML(sv){
  const posts=sv.posts||[];
  const evs=[];sv.friends.concat(sv.me?[sv.me]:[]).forEach(r=>((r.data||{}).ev||[]).forEach(e=>{if(e.k!=='w'&&e.k!=='pr')evs.push({e,r,me:sv.me&&r.user_id===sv.me.user_id});}));
  evs.sort((a,b)=>a.e.d<b.e.d?1:a.e.d>b.e.d?-1:0);
  return '<label class="auto-post"><input type="checkbox" data-a="autoPost"'+(db.settings.autoPost!==false?' checked':'')+'><span>Publicar mis entrenos para mis amigos</span></label>'+
   (posts.length?'<div class="feed-p">'+posts.map(p=>postHTML(p)).join('')+'</div>':'<div class="card empty" style="margin:0 0 12px">'+ic('flame',30)+'<b>Todavía no hay entrenos</b>Cuando vos o tus amigos terminen un entreno, aparece acá para darle fuego.</div>')+
   (evs.length?'<h4 class="soc-h">Más novedades</h4><div class="feed">'+evs.slice(0,25).map(x=>'<div class="fd"><span class="fd-ic">'+ic(evIc(x.e.k),16)+'</span><span class="grow"><b>'+(x.me?'Vos':esc(x.r.nick||'Atleta'))+'</b> '+evTxt(x.e)+'</span><small class="mut">'+dayAgo(x.e.d)+'</small></div>').join('')+'</div>':'');
}
/* en Inicio: lo último de tus amigos */
function friendsFeedCard(){
  if(!Social.on()||!S.social||!S.social.posts)return '';
  const me=Sync.user().id,ps=S.social.posts.filter(p=>p.user_id!==me&&Date.now()-new Date(p.created_at).getTime()<3*864e5);
  if(!ps.length)return '';
  return '<div class="card ffc"><div class="hd"><div><h3>Tus amigos entrenaron</h3><span class="mut sm-t">Dales fuego para que no aflojen</span></div><button class="btn sm" data-a="socOpen" data-v="feed">Ver todo</button></div>'+
   ps.slice(0,2).map(p=>{const d=p.data||{},liked=p.likes.includes(me);return '<div class="ffc-r">'+avatar(p.nick,p.user_id,34)+'<span class="grow"><b>'+esc(p.nick)+'</b> · '+esc(d.n||'Entreno')+'<small>'+agoTxt(new Date(p.created_at).getTime())+((d.prs||[]).length?' · '+ic('trophy',11)+' '+d.prs.length+(d.prs.length===1?' récord':' récords'):'')+'</small></span><button class="fire sm'+(liked?' on':'')+'" data-a="postFire" data-v="'+p.id+'" aria-label="Dar fuego">'+ic('flame',17)+'<b>'+(p.likes.length||'')+'</b></button></div>';}).join('')+'</div>';
}
function compsHTML(sv){
  const me=sv.me&&sv.me.user_id,t=today(),cs=sv.comps||[];
  const card=c=>{
    const ms=c.swole_comp_member||[],mine=ms.find(x=>x.user_id===me)||{},fin=c.end_day<t,left=Math.round((parseK(c.end_day)-parseK(t))/864e5)+1,met=COMP_MET[c.metric]||COMP_MET.w;
    const on=ms.filter(x=>x.joined).sort((a,b)=>b.score-a.score),wait=ms.filter(x=>!x.joined&&x.user_id!==me);
    const inv=!mine.joined&&!fin;
    return '<div class="trn'+(fin?' fin':'')+'"><div class="row" style="gap:10px"><span class="trn-ic">'+ic(fin?'trophy':'flag',18)+'</span><span class="grow"><b>'+esc(c.name)+'</b><small class="mut">'+met[0]+' · '+(fin?'Terminó':left===1?'Último día':'Quedan '+left+' días')+'</small></span></div>'+
     (fin&&on.length?'<p class="trn-win">'+ic('crown',15)+(on[0].user_id===me?' <b>¡Ganaste!</b> Con ':' Ganó <b>'+esc(on[0].nick)+'</b> con ')+nf(+on[0].score)+' '+met[1]+'</p>':'')+
     '<div class="trn-rows">'+on.map((x,i)=>'<div class="trn-r'+(x.user_id===me?' me':'')+'"><span class="lb-n">'+(i+1)+'</span><span class="grow">'+esc(x.user_id===me?'Vos':x.nick)+'</span><b>'+nf(+x.score)+'</b></div>').join('')+
     (wait.length?'<p class="mut sm-t" style="margin:6px 0 0">Invitados: '+wait.map(x=>esc(x.nick)).join(', ')+'</p>':'')+'</div>'+
     (inv?'<div class="g2" style="margin-top:10px"><button class="btn sm" data-a="compNo" data-v="'+c.id+'">No, gracias</button><button class="btn sm pri" data-a="compYes" data-v="'+c.id+'">Sumarme</button></div>':
      c.owner===me?'<button class="trn-x" data-a="compDel" data-v="'+c.id+'">Borrar torneo</button>':'<button class="trn-x" data-a="compLeave" data-v="'+c.id+'">Salir</button>')+'</div>';};
  const act=cs.filter(c=>c.end_day>=t),old=cs.filter(c=>c.end_day<t);
  return '<button class="btn pri wide" data-a="compNew" style="margin-bottom:12px">'+ic('plus',16)+' Crear torneo</button>'+
   (act.length?act.map(card).join(''):'<p class="mut sm-t" style="margin:0 0 6px">Armá un torneo con los amigos que quieras: quién entrena más días, quién hace más series o quién suma más puntos en una semana o un mes.</p>')+
   (old.length?'<h4 class="soc-h">Terminados</h4>'+old.map(card).join(''):'');
}
function compNewHTML(m){
  const fr=(S.social&&S.social.friends)||[];
  if(!fr.length)return '<p>Primero agregá amigos: el torneo es entre ustedes.</p><button class="btn wide" data-a="close" data-v="m2">Volver</button>';
  return '<label class="field">Nombre<input id="cmpName" type="text" maxlength="40" value="'+esc(m.name||'')+'" placeholder="Ej: Semana de piernas"></label>'+
   '<div class="field"><span>¿Qué cuenta?</span><div class="seg">'+Object.keys(COMP_MET).map(k=>'<button class="'+(m.metric===k?'on':'')+'" data-a="compSet" data-v="metric|'+k+'">'+COMP_MET[k][0]+'</button>').join('')+'</div>'+
   '<small class="mut sm-t">'+(m.metric==='w'?'Gana el que entrena más días distintos.':m.metric==='sets'?'Gana el que hace más series (sin contar el calentamiento).':'Entrenos, récords, subidas de nivel y misiones: premia progresar, no ser el más fuerte.')+'</small></div>'+
   '<div class="field"><span>Duración</span><div class="seg">'+[[7,'1 semana'],[14,'2 semanas'],[30,'1 mes']].map(([d,n])=>'<button class="'+(m.days===d?'on':'')+'" data-a="compSet" data-v="days|'+d+'">'+n+'</button>').join('')+'</div></div>'+
   '<div class="field"><span>¿Con quién?</span><div class="chips" style="flex-wrap:wrap">'+fr.map(r=>'<button class="chip '+(m.mem.includes(r.user_id)?'on':'')+'" data-a="compMem" data-v="'+r.user_id+'">'+(m.mem.includes(r.user_id)?ic('check',13)+' ':'')+esc(r.nick||'Atleta')+'</button>').join('')+'</div></div>'+
   '<p class="mut sm-t">Arranca hoy. A tus amigos les llega la invitación en Amigos → Torneos.</p>'+
   '<button class="btn pri wide" data-a="compSave">Crear torneo</button>';
}
function friendCardHTML(r){
  if(!r)return '';
  const d=r.data||{},L=d.ovr?d.ovr.L:-1,c=d.card||{};
  return '<div class="row" style="gap:14px">'+badge(L,72)+'<div class="grow"><h3 style="font:800 24px var(--f-d)">'+esc(r.nick||'Atleta')+'</h3><div>'+lvlSpan(L)+'</div>'+(d.pctl?'<span class="mut sm-t">Más fuerte que el '+d.pctl+' % (estimado)</span>':'')+'</div></div>'+
   (c.OVR!=null?'<div class="attr-list" style="margin-top:14px">'+ATTRS.map(([k,n])=>'<div><span>'+n+'</span><b>'+(c[k]==null?'--':c[k])+'</b><i style="width:'+(c[k]==null?0:Math.round((c[k]-40)/59*100))+'%"></i></div>').join('')+'</div>':'')+
   (d.groups&&Object.keys(d.groups).length?'<h4 style="margin:16px 0 8px">Por grupo muscular</h4>'+Object.keys(GROUPS).filter(g=>d.groups[g]!=null).map(g=>{const v=d.groups[g],l=Math.min(18,Math.floor(v));return '<div class="rowline"><span>'+g+'</span>'+lvlSpan(l)+'</div>';}).join(''):'')+
   (d.sk&&d.sk.length?'<h4 style="margin:16px 0 8px">Habilidades dominadas ('+d.sk.length+')</h4><div class="chips">'+d.sk.slice(-12).map(id=>{const e=exById(id);return e?'<span class="chip">'+esc(shortN(e.n))+'</span>':'';}).join('')+'</div>':'')+
   (d.streak?'<p class="mut sm-t" style="margin-top:12px">Racha: '+d.streak+' días</p>':'');
}
/* tarjeta en Inicio: tu lugar en la temporada */
function seasonCard(){
  if(!Social.on()||!S.social||!S.social.friends.length)return '';
  const rows=rankRows('season'),i=rows.findIndex(x=>x.me);if(i<0)return '';
  return '<button class="card soc-mini" data-a="socOpen" data-v="season"><span class="lh-k">Temporada de '+MESES[new Date().getMonth()]+'</span><span class="row" style="gap:10px;margin-top:6px"><b class="soc-pos">'+(i+1)+'º</b><span class="grow">de '+rows.length+' · <b>'+rows[i].v+'</b> pts'+(i>0?'<br><span class="mut sm-t">'+(rows[i-1].v-rows[i].v)+' pts para pasar a '+esc(rows[i-1].r.nick||'Atleta')+'</span>':'<br><span class="mut sm-t">Vas primero</span>')+'</span>'+ic('right',18)+'</span></button>';
}

