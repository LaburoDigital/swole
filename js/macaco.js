/* ============ SW-9: macaco nuevo (esqueleto con ángulos) ============
   Cada pose son ÁNGULOS de articulación (no coordenadas) y la animación interpola esos ángulos, así los cuadros
   intermedios también son humanos. Los huesos tienen largo fijo. Las manos y los pies que tocan algo (barra, piso,
   polea, banco) se resuelven con cinemática inversa de 2 huesos hacia el punto de contacto, en cada cuadro.
   Dos vistas: de costado (v:'side', la mayoría) y de frente (v:'front': laterales, aperturas, abductores, banderas...).

   DE COSTADO. Un ángulo φ apunta hacia abajo con 0, hacia adelante con 90 y hacia arriba con 180.
   "Adelante" es el sentido d (1 = derecha, -1 = izquierda). Ángulos relativos:
     t  = dirección cadera → cuello (180 = parado derecho)          nk = flexión del cuello (mentón al pecho, +)
     s  = hombro (0 = brazo colgando junto al torso, 90 = al frente, 180 = arriba, - = atrás)
     e  = codo (0 = estirado, + = dobla hacia el frente del brazo)  w = muñeca
     h  = cadera (0 = muslo en línea con el torso, + = hacia adelante)
     k  = rodilla (0 = estirada, + = dobla hacia atrás)              a = tobillo (0 = pie a 90° de la pierna, + = punta arriba)
     ab = cuánto sale el brazo del plano del dibujo (codos abiertos) y abf el antebrazo con la mano (agarre ancho);
     lt = cuánto sale el muslo del plano (sentado de costado al banco): se ven más cortos, el largo real no cambia.
   DE FRENTE. φ: 0 abajo, 90 a la derecha de la pantalla, 180 arriba. Lado L (izquierda de la pantalla) y R:
     a  = abducción del hombro (0 = brazo al costado, 90 = horizontal hacia afuera, 180 = arriba, - = cruza el cuerpo)
     e  = codo visto de frente (+ = el antebrazo sigue abriéndose hacia afuera/arriba, - = hacia adentro)
     h  = abducción de la cadera (0 = pierna abajo, + = hacia afuera), k = rodilla vista de frente
     ls = escorzo por tramo (ej. muslos hacia quien mira al estar sentado); tw/sw/tk = torso que gira, ancho de hombros, torso acostado. */
const MK=(()=>{
  /* el esqueleto (largos, límites, cinemática, IK, fases) vive en js/esqueleto.js (SW-11 fase 2) */
  const {LEN,HEAD,FLOOR,LIM,rad,deg,nrm,V,add,phi,dist,lerp,lp,ease,SIDE,FSIDE,FTOP,angAt,target,tLen,fkSide,VF,phF,lsOf,fkFront,solve2,ikArm,ikLeg,frame,angles,N,frames}=ESQ;
  /* ---------- dibujo ---------- */
  const f1=x=>Math.round(x*10)/10;
  const KT=(()=>{const a=[];for(let i=0;i<=N;i++)a.push(+(.45*i/N).toFixed(4));for(let i=0;i<=N;i++)a.push(+(.55+.45*i/N).toFixed(4));return a.join(';');})();
  /* fwd: los movimientos que se desplazan (saltos, caminatas) van solo de ida; la figura se funde y vuelve a arrancar (no se rebobina en el aire) */
  const KTF=(()=>{const a=[];for(let i=0;i<=N;i++)a.push(+(.8*i/N).toFixed(4));a.push(.87,.87,1);return a.join(';');})();let FWD=false;
  const kt=()=>FWD?KTF:KT;
  function seq(F,fn){const v=F.map(fn);return FWD?v.concat([v[v.length-1],v[0],v[0]]):v.concat(v.slice().reverse());}
  function anim(F,attr,fn){const v=seq(F,fn);if(v.every(x=>x===v[0]))return '';return '<animate attributeName="'+attr+'" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';}
  const pt=(R,a)=>typeof a==='function'?a(R):Array.isArray(a)?a:R.P[a];
  function line(F,a,b,cls,w,one){const g=k=>R=>f1(pt(R,a)[k]),h=k=>R=>f1(pt(R,b)[k]),R0=F[0];
    return '<line class="'+cls+'"'+(w?' stroke-width="'+w+'"':'')+' x1="'+g(0)(R0)+'" y1="'+g(1)(R0)+'" x2="'+h(0)(R0)+'" y2="'+h(1)(R0)+'">'+(one?'':anim(F,'x1',g(0))+anim(F,'y1',g(1))+anim(F,'x2',h(0))+anim(F,'y2',h(1)))+'</line>';}
  function dot(F,j,r,cls,one){const g=k=>R=>f1(pt(R,j)[k]);return '<circle class="'+cls+'" cx="'+g(0)(F[0])+'" cy="'+g(1)(F[0])+'" r="'+r+'">'+(one?'':anim(F,'cx',g(0))+anim(F,'cy',g(1)))+'</circle>';}
  /* cada tramo con un borde del color del fondo: así el brazo se ve aunque pase por delante del torso */
  const seg=(F,a,b,cls,w,one)=>line(F,a,b,'mk-hl',w+2.2,one)+line(F,a,b,cls,w,one);
  /* torso de costado: recto, o curvo si alguna pose redondea la columna (cv): una curva que se arquea hacia la espalda, más arriba que en el medio */
  function torsoS(F,one){if(!F.some(R=>R.g&&Math.abs(R.g.cv||0)>.05))return seg(F,'P','N','mk-tr',10,one);
    const d=R=>{const P=R.P.P,N=R.P.N,bk=V(R.phi.t+90,R.d),c=R.g.cv||0,m=[P[0]+(N[0]-P[0])*.62+bk[0]*2*c,P[1]+(N[1]-P[1])*.62+bk[1]*2*c]; /* el punto más curvo queda en la parte alta de la espalda, no en la cintura */return 'M'+f1(P[0])+' '+f1(P[1])+' Q'+f1(m[0])+' '+f1(m[1])+' '+f1(N[0])+' '+f1(N[1]);};
    const v=seq(F,d),an=one||v.every(x=>x===v[0])?'':'<animate attributeName="d" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';
    const p=(cls,w)=>'<path class="'+cls+'" fill="none" stroke-linecap="round" stroke-width="'+w+'" d="'+d(F[0])+'">'+an+'</path>';return p('mk-hl',12.2)+p('mk-tr',10);}
  function limbs(F,sd,one){return seg(F,'Hp'+sd,'K'+sd,'mk-th',6.5,one)+seg(F,'K'+sd,'A'+sd,'mk-sh',5.5,one)+seg(F,'L'+sd,'T'+sd,'mk-ft',3.5,one);}
  function arm(F,sd,one){return seg(F,'S'+sd,'E'+sd,'mk-ua',5.5,one)+seg(F,'E'+sd,'W'+sd,'mk-fa',4.8,one)+seg(F,'W'+sd,'G'+sd,'mk-hd',4.2,one);}
  function limbsF(F,sd,one){return seg(F,'H'+sd,'K'+sd,'mk-th',6.5,one)+seg(F,'K'+sd,'A'+sd,'mk-sh',5.5,one)+seg(F,'L'+sd,'T'+sd,'mk-ft',3.5,one);}
  function armF(F,sd,one){return seg(F,'S'+sd,'E'+sd,'mk-ua',5.5,one)+seg(F,'E'+sd,'W'+sd,'mk-fa',4.8,one)+seg(F,'W'+sd,'G'+sd,'mk-hd',4.2,one);}
  /* agarre visto de frente, con su nombre: dorso oscuro (prono), palma clara (supino), manijas paradas (neutro) o manos apoyadas */
  const GW={cerrado:7,medio:10,pocoabierto:11.5,abierto:13},GN={prono:'Prono',supino:'Supino',neutro:'Neutro',mixto:'Mixto',apoyo:'Apoyadas'};
  function gripGlyph(gr,box){if(!gr)return '';box=box||{x:2,y:2,s:1};const w=GW[gr.w]||10,cx=19,hand=(x,t)=>{const pal=t==='supino',neu=t==='neutro',sgn=x<cx?-1:1;
      if(t==='apoyo')return '<rect class="mk-gp" x="'+(x-3.4)+'" y="10" width="6.8" height="5.4" rx="1.8"/><line class="mk-gt" x1="'+(x+3.4*-sgn)+'" y1="13" x2="'+(x+5.8*-sgn)+'" y2="11"/>';
      if(neu)return '<line class="mk-gb" x1="'+x+'" y1="3" x2="'+x+'" y2="16"/><rect class="mk-gd" x="'+(x-3)+'" y="5.8" width="6" height="8" rx="1.8"/><line class="mk-gt" x1="'+x+'" y1="6" x2="'+x+'" y2="3.4"/>';
      return '<rect class="'+(pal?'mk-gp':'mk-gd')+'" x="'+(x-3.2)+'" y="5" width="6.4" height="9" rx="2"/>'+(pal?'':'<line class="mk-gk" x1="'+(x-2.3)+'" y1="7" x2="'+(x+2.3)+'" y2="7"/>')+
        '<line class="mk-gt" x1="'+(x+sgn*(pal?3.2:-3.2))+'" y1="10.6" x2="'+(x+sgn*(pal?5.8:-5.4))+'" y2="'+(pal?8.4:9)+'"/>';};
    const tl=gr.t2?[gr.t,gr.t2]:gr.t==='mixto'?['prono','supino']:[gr.t,gr.t], /* t2: el agarre cambia en el recorrido (curl con giro): la mano izquierda muestra el inicio y la derecha el final */dbs=gr.db&&gr.t!=='neutro'?[cx-w,cx+w].map(x=>'<line class="mk-gb" x1="'+(x-6.5)+'" y1="9.5" x2="'+(x+6.5)+'" y2="9.5"/><rect class="mk-gw" x="'+(x-8)+'" y="6.5" width="2.4" height="6" rx=".8"/><rect class="mk-gw" x="'+(x+5.6)+'" y="6.5" width="2.4" height="6" rx=".8"/>').join(''):'';
    return '<g class="mk-grip" transform="translate('+f1(box.x)+' '+f1(box.y)+') scale('+box.s+')"><rect class="mk-gbg" x="0" y="0" width="38" height="26" rx="4"/>'+(gr.t==='neutro'||gr.t==='apoyo'||gr.db?dbs:'<line class="mk-gb" x1="3" y1="9.5" x2="35" y2="9.5"/>')+(gr.t==='apoyo'?'<line class="mk-gb" x1="3" y1="16" x2="35" y2="16"/>':'')+
      hand(cx-w,tl[0])+hand(cx+w,tl[1])+(gr.t2?'<line class="mk-gb" x1="'+(cx-3)+'" y1="9.5" x2="'+(cx+3)+'" y2="9.5"/><polyline class="mk-gb" fill="none" points="'+(cx+1)+',7.5 '+(cx+3.2)+',9.5 '+(cx+1)+',11.5"/>':'')+'<text class="mk-gl" x="19" y="23.2" text-anchor="middle"'+(gr.t2?' font-size="4.6"':'')+'>'+(gr.t2?(GN[gr.t]||'')+' → '+(GN[gr.t2]||'').toLowerCase():(GN[gr.t]||''))+'</text></g>';}
  /* ---------- equipo ---------- */
  function hexDb(F,at,one,rot){const g=k=>R=>f1(pt(R,at)[k]),x=g(0)(F[0]),y=g(1)(F[0]);
    const anT=one?'':(()=>{const v=seq(F,R=>g(0)(R)+' '+g(1)(R));return v.every(s=>s===v[0])?'':'<animateTransform attributeName="transform" type="translate" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';})();
    const body=rot!=null?'<g transform="rotate('+rot+')"><rect class="tq-dbh" x="-5.5" y="-1.1" width="11" height="2.2" rx="1.1"/><rect class="tq-plate" x="-8.5" y="-4.6" width="3.6" height="9.2" rx="1.3"/><rect class="tq-plate" x="4.9" y="-4.6" width="3.6" height="9.2" rx="1.3"/></g>'
      :'<polygon class="tq-plate" points="4.6,0 2.3,4 -2.3,4 -4.6,0 -2.3,-4 2.3,-4"/><circle class="tq-hub" r="1.4"/>';
    return '<g transform="translate('+x+' '+y+')">'+anT+body+'</g>';}
  /* mount:'v': soporte vertical corto (se ve de punta, como en las dominadas, y queda detrás del cuerpo cuando pasa por encima) */
  /* soporte en diagonal de la barra fija (mount:'d'): sube a 45° hacia adelante, lejos del cuerpo que pasa por encima de la barra */
  function strut(p){const k=Math.min(p[1]-2,116-p[0]);return [p[0]+k,p[1]-k];}
  function eqSVG(F,D,one,layer){let h='';(D.eq||[]).forEach((e,i)=>{if(e.t==='pullbar'&&!e.front&&D.v!=='front'&&layer==='top'){h+='<circle class="mk-hl" fill="none" stroke-width="1.6" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="3.5"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>';return;} /* de costado la barra fija (de punta) se ve en todos los cuadros: se repite arriba de todo, con un borde del color del fondo */const at=R=>R.eq[i].at,L=e.layer||(['bar','db','kb','ball','handle','ring','pad'].includes(e.t)?(e.t==='bar'&&D.v!=='front'?'top':e.behind?'back2':'mid'):'back'); /* de costado el disco cercano queda más cerca de quien mira que la pierna y el brazo cercanos: va arriba de todo (el lejano lo tapa el cuerpo) */if(L!==layer)return;
      switch(e.t){
        case 'floor':h+='<line class="tq-floor" x1="4" y1="'+FLOOR+'" x2="116" y2="'+FLOOR+'"/>';break;
        /* piso en perspectiva (vistas 3/4 o desde arriba): el paralelogramo del piso proyectado; sombra: la de contacto de una mano, un pie o la cola, achatada por la altura de la cámara */
        case 'piso':h+='<polygon class="tq-piso" points="'+e.p.map(q=>f1(q[0])+','+f1(q[1])).join(' ')+'"/>';break;
        case 'sombra':{const g=k=>R=>f1(R.eq[i].at[k]),R0=F[0];if(!R0.eq[i].at)break;h+='<ellipse class="tq-sombra" cx="'+g(0)(R0)+'" cy="'+g(1)(R0)+'" rx="'+(e.r||5)+'" ry="'+f1((e.r||5)*(e.k||.4))+'">'+(one?'':anim(F,'cx',g(0))+anim(F,'cy',g(1)))+'</ellipse>';break;}
        case 'block':h+='<rect class="tq-eq" x="'+e.r[0]+'" y="'+e.r[1]+'" width="'+e.r[2]+'" height="'+e.r[3]+'" rx="2.5"/>';break;
        case 'wall':h+='<rect class="tq-wall" x="'+e.r[0]+'" y="'+e.r[1]+'" width="'+e.r[2]+'" height="'+e.r[3]+'" rx="2"/>';break;
        case 'post':h+='<line class="tq-'+(e.pad?'pad':'eq')+'" x1="'+e.p[0]+'" y1="'+e.p[1]+'" x2="'+e.p[2]+'" y2="'+e.p[3]+'"/>';break;
        case 'pullbar':h+=(e.mount==='v'?'<line class="tq-eq" x1="'+e.p[0]+'" y1="'+(e.p[1]-12)+'" x2="'+e.p[0]+'" y2="'+(e.p[1]-2.5)+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>':e.mount==='d'?(()=>{const q=strut(e.p);return '<line class="tq-eq" x1="'+(e.p[0]+1.85)+'" y1="'+(e.p[1]-1.85)+'" x2="'+q[0]+'" y2="'+q[1]+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>';})():e.mount==='h'?'<line class="tq-eq" x1="4" y1="'+e.p[1]+'" x2="'+(e.p[0]-2.6)+'" y2="'+e.p[1]+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>':e.front?'<line class="tq-eq" x1="'+e.p[0]+'" y1="'+e.p[1]+'" x2="'+e.p[2]+'" y2="'+e.p[1]+'"/>':'<line class="tq-eq" x1="'+e.p[0]+'" y1="2" x2="'+e.p[0]+'" y2="'+(e.p[1]-2.5)+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>');break;
        case 'roll':h+='<circle class="tq-roll" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="4.6"/>';break;
        /* cable: sale de la polea y termina exactamente en la mano (o en la articulación que lleva la tobillera) */
        case 'pulley':h+=line(F,e.p,R=>R.P[e.to],'tq-cab',1.6,one)+'<circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="3.2"/>';break;
        /* palanca de máquina: del eje a la articulación que empuja; el rodillo va en la punta */
        case 'lever':h+=line(F,e.pv,R=>R.P[e.to],'tq-lv',null,one)+'<circle class="tq-eq" cx="'+e.pv[0]+'" cy="'+e.pv[1]+'" r="3.5"/>'+(e.stand?'<line class="tq-eq" x1="'+e.pv[0]+'" y1="'+e.pv[1]+'" x2="'+e.stand+'" y2="110"/>':'');break;
        /* plataforma que se mueve con el pie (prensa): perpendicular al riel */
        case 'plat':{const dd=[Math.cos(rad(e.ang)),Math.sin(rad(e.ang))],Ln=e.len||9;h+=line(F,R=>{const q=R.P[e.to];return[q[0]-dd[0]*Ln,q[1]-dd[1]*Ln];},R=>{const q=R.P[e.to];return[q[0]+dd[0]*Ln,q[1]+dd[1]*Ln];},'tq-pad',null,one);break;}
        /* banco que sigue al torso (plano, inclinado o declinado) */
        case 'tbench':{/* el respaldo bajo la espalda (del otro lado del pecho), con dos patas al piso */
          const ends=R=>{const P=R.P,v=[P.P[0]-P.N[0],P.P[1]-P.N[1]],l=Math.hypot(v[0],v[1]),n=[-v[1]/l,v[0]/l],s=n[1]<0?-1:1;return[[P.N[0]-v[0]/l*9+n[0]*s*6.5,P.N[1]-v[1]/l*9+n[1]*s*6.5],[P.P[0]+v[0]/l*3+n[0]*s*6.5,P.P[1]+v[1]/l*3+n[1]*s*6.5]];};
          h+=line(F,R=>ends(R)[0],R=>ends(R)[1],'tq-pad',null,one);const e0=ends(F[0]);[.2,.85].forEach(k=>{const p=[f1(lerp(e0[0][0],e0[1][0],k)),f1(lerp(e0[0][1],e0[1][1],k)+3)];h+='<line class="tq-eq" x1="'+p[0]+'" y1="'+p[1]+'" x2="'+p[0]+'" y2="110"/>';});break;}
        case 'rope':{const d=R=>{const a=R.P.GL,b=R.P.GR,y=lerp(e.y[0],e.y[1],R.u);return 'M'+f1(a[0])+' '+f1(a[1])+' Q60 '+f1(y)+' '+f1(b[0])+' '+f1(b[1]);};h+='<path class="tq-cab" fill="none" d="'+d(F[0])+'">'+(one?'':anim(F,'d',d))+'</path>';break;}
        case 'bar':h+=dot(F,at,e.r||6.5,'tq-plate',one)+dot(F,at,2,'tq-hub',one);break;
        case 'db':h+=hexDb(F,at,one,e.rot);break;
        case 'kb':h+=dot(F,at,6,'tq-kb',one);break;
        case 'ball':h+=dot(F,at,7,'tq-ball',one);break;
        case 'handle':h+=dot(F,at,2.4,'tq-eq',one);break;
        case 'pad':h+=dot(F,at,e.r||4.6,'tq-roll',one);break;
        case 'ring':h+=line(F,R=>[pt(R,at)[0]-2,0],R=>[pt(R,at)[0],pt(R,at)[1]-7],'tq-cab',1.6,one)+dot(F,R=>[pt(R,at)[0],pt(R,at)[1]-3.5],3.5,'tq-eq',one);break;
      }});return h;}
  function shadow(F,D,one){if(!(D.eq||[]).some(e=>e.t==='floor')||D.noShadow)return '';const fx=R=>{const ks=R.v==='front'?['AL','AR']:['An','Af'];return[(R.P[ks[0]][0]+R.P[ks[1]][0])/2,111];};
    return '<ellipse class="tq-sh" cx="'+f1(fx(F[0])[0])+'" cy="111" rx="16" ry="2.5">'+(one?'':anim(F,'cx',R=>f1(fx(R)[0])))+'</ellipse>';}
  /* lo que ocupa la figura y el equipo en un cuadro: tramos (con su grosor), círculos y rectángulos */
  function shapes(D,R){const P=R.P,fr=R.v==='front',S=[],sg=(a,b,w)=>{if(a&&b)S.push({s:[a,b],r:w/2+1});},ci=(c,rr)=>{if(c)S.push({c,r:rr+1});};
    const SD=fr?['L','R']:['n','f'];SD.forEach(sd=>{sg(P[(fr?'H':'Hp')+sd],P['K'+sd],6.5);sg(P['K'+sd],P['A'+sd],5.5);sg(P['L'+sd],P['T'+sd],3.5);sg(P['S'+sd],P['E'+sd],5.5);sg(P['E'+sd],P['W'+sd],4.8);sg(P['W'+sd],P['G'+sd],4.2);});
    sg(P.P,P.N,11);ci(P.H,HEAD);
    (D.eq||[]).forEach((e,i)=>{const at=R.eq[i].at;switch(e.t){case 'floor':sg([4,FLOOR],[116,FLOOR],2);break;case 'block':case 'wall':S.push({q:e.r});break;case 'post':sg([e.p[0],e.p[1]],[e.p[2],e.p[3]],3);break;
      case 'pullbar':if(e.mount==='v'){ci(e.p,2.6);}else if(e.mount==='d'){sg(e.p,strut(e.p),3);ci(e.p,2.6);}else if(e.mount==='h'){sg([4,e.p[1]],e.p,3);ci(e.p,2.6);}else if(e.front)sg([e.p[0],e.p[1]],[e.p[2],e.p[1]],3);else{sg([e.p[0],2],[e.p[0],e.p[1]],3);ci(e.p,2.6);}break;case 'roll':ci(e.p,4.6);break;
      case 'pulley':ci(e.p,3.2);sg(e.p,P[e.to],1.6);break;case 'lever':sg(e.pv,P[e.to],4);ci(e.pv,3.5);if(e.stand)sg(e.pv,[e.stand,110],3);break;
      case 'plat':ci(P[e.to],e.len||9);break;case 'tbench':sg(P.N,P.P,24);break;case 'rope':sg(P.GL,[60,(e.y[0]+e.y[1])/2],2);sg(P.GR,[60,(e.y[0]+e.y[1])/2],2);sg([60,e.y[0]],[60,e.y[1]],2);break;
      case 'bar':ci(at,e.r||6.5);break;case 'db':ci(at,e.rot!=null?8.5:4.6);break;case 'kb':ci(at,6);break;case 'ball':ci(at,7);break;case 'handle':ci(at,2.4);break;case 'pad':ci(at,e.r||4.6);break;
      case 'ring':if(at){ci([at[0],at[1]-3.5],3.5);sg([at[0]-2,0],[at[0],at[1]-7],1.6);}break;}});return S;}
  const segBox=(a,b,x0,y0,x1,y1)=>{for(let i=0;i<=20;i++){const t=i/20,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;if(x>=x0&&x<=x1&&y>=y0&&y<=y1)return true;}return false;};
  function hits(S,b,pad){const [x0,y0,x1,y1]=[b[0]-pad,b[1]-pad,b[0]+b[2]+pad,b[1]+b[3]+pad];return S.some(o=>{
    if(o.q)return !(o.q[0]>x1||o.q[0]+o.q[2]<x0||o.q[1]>y1||o.q[1]+o.q[3]<y0);
    if(o.c){const cx=Math.max(x0,Math.min(o.c[0],x1)),cy=Math.max(y0,Math.min(o.c[1],y1));return Math.hypot(o.c[0]-cx,o.c[1]-cy)<o.r;}
    return segBox(o.s[0],o.s[1],x0-o.r,y0-o.r,x1+o.r,y1+o.r);});}
  /* busca esquina (arriba izq., arriba der., abajo izq., abajo der.) y tamaño (100 %, 80 %, 65 %) donde el recuadro no tape nada */
  const GB={};function gripBox(D){if(!D.grip)return null;const key=JSON.stringify([D.A,D.M,D.fases,D.B,D.ik,D.eq,D.root,D.ag]);if(GB[key]!==undefined)return GB[key];
    const SS=[];for(let i=0;i<=20;i++)SS.push(...shapes(D,frame(D,i/20)));let res=null;
    for(const s of [1,.8,.65]){const w=(D.ag?46:38)*s,h=(D.ag?40:26)*s; /* ag:1 (SW-11): el cuadradito con las manos y los dedos es más alto */for(const [x,y] of [[2,2],[118-w,2],[2,108-h],[118-w,108-h],[60-w/2,2]])if(!hits(SS,[x,y,w,h],.5)){res={x,y,s};break;}if(res)break;}
    return GB[key]=res;}
  /* SW-11 visor: la caja que ocupa la figura y su equipo en TODOS los cuadros (u crudo de 0 a 1), con margen, para el zoom.
     No cuentan el piso, la pared ni los soportes y cables largos (la barra sí): si hay piso, la caja baja hasta el piso. */
  const CJ={};function caja(D,m){m=m==null?6:m;const key=JSON.stringify([D.A,D.M,D.fases,D.B,D.ik,D.eq,D.root,m]);if(CJ[key])return CJ[key];
    let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const pon=(x,y,r)=>{x0=Math.min(x0,x-r);x1=Math.max(x1,x+r);y0=Math.min(y0,y-r);y1=Math.max(y1,y+r);};
    const sop=(D.eq||[]).map(e=>e.t==='floor'||e.t==='wall'||e.t==='rope'||(e.t==='pullbar'&&!e.front)||e.t==='ring'||e.t==='pulley');
    for(let i=0;i<=40;i++){const R=frame(D,i/40);const S=shapes(D,R),nEq=S.length;
      /* shapes pone el cuerpo primero y después el equipo en orden: para saber de qué equipo es cada forma, se recalcula sin el equipo */
      const nB=shapes(Object.assign({},D,{eq:[]}),Object.assign({},R,{eq:[]})).length;S.forEach((o,k)=>{if(k>=nB&&skipEq(D,R,k-nB,sop))return;
        if(o.q){pon(o.q[0],o.q[1],0);pon(o.q[0]+o.q[2],o.q[1]+o.q[3],0);}else if(o.c)pon(o.c[0],o.c[1],o.r);else{pon(o.s[0][0],o.s[0][1],o.r);pon(o.s[1][0],o.s[1][1],o.r);}});
      (D.eq||[]).forEach((e,j)=>{if(e.t==='pullbar'&&!e.front)pon(e.p[0],e.p[1],3.6);if(e.t==='ring'&&R.eq[j].at)pon(R.eq[j].at[0],R.eq[j].at[1]-3.5,4.5);if(e.t==='pulley')pon(e.p[0],e.p[1],4.2);if(e.t==='piso')e.p.forEach(q=>pon(q[0],q[1],1));});}
    if((D.eq||[]).some(e=>e.t==='floor'))y1=Math.max(y1,FLOOR+1);
    x0-=m;y0-=m;x1+=m;y1+=m;return CJ[key]={x:+x0.toFixed(1),y:+y0.toFixed(1),w:+(x1-x0).toFixed(1),h:+(y1-y0).toFixed(1)};}
  /* las formas del equipo k (en el orden de shapes): cuántas pone cada equipo, para saltear los soportes */
  function skipEq(D,R,idx,sop){let n=0;for(let j=0;j<(D.eq||[]).length;j++){const one=Object.assign({},D,{eq:[D.eq[j]]}),c=shapes(one,Object.assign({},R,{eq:[R.eq[j]]})).length-shapes(Object.assign({},D,{eq:[]}),Object.assign({},R,{eq:[]})).length;if(idx<n+c)return sop[j];n+=c;}return false;}
  const idDe=D=>{for(const k in MKD)if(MKD[k]===D)return k;return '';};
  /* ---------- capas del cuerpo (SW-11 fase 2): músculos, ropa y pelo ----------
     Orden de las capas en cada grupo: piel (los tramos del esqueleto) → ropa (remera, short) → músculos. Los colores son variables
     de app.css (--mk-piel, --mk-pelo, --mk-remera, --mk-short, --mk-mp, --mk-ms, --mk-m0), para poder cambiarlas después.
     Los músculos son formas pegadas a cada hueso (un tramo grueso de puntas redondas, corrido hacia la cara del hueso donde está el
     músculo). Cambian según la vista: de costado se ve casi todo; de frente, pecho y abdomen; de atrás, dorsal, trapecio y glúteo.
     En la app se pintan solo los del ejercicio (principales en color fuerte, secundarios en suave); con opt.detalle, todos. */
  const MUS=['pecho','hombros','biceps','triceps','antebrazos','abs','oblicuos','trapecio','dorsales','lumbar','gluteos','cuadriceps','isquios','gemelos','tibial','aductores'];
  /* qué músculos se ven en cada vista (de costado, los aductores se ven en la cara interna de la pierna lejana) */
  const MVIS={costado:MUS.slice(),
    frente:['pecho','hombros','biceps','antebrazos','abs','oblicuos','trapecio','dorsales','cuadriceps','aductores','tibial','triceps','gemelos','gluteos'], /* de frente asoman el tríceps (borde de afuera del brazo), el gemelo (borde de adentro de la pierna) y el glúteo medio (costado de la cadera) */
    atras:['dorsales','trapecio','lumbar','gluteos','triceps','hombros','isquios','gemelos','antebrazos','oblicuos','aductores']};
  const vistaDe=D=>D.v==='front'?(D.back?'atras':'frente'):'costado';
  const un=(a,b)=>{const x=b[0]-a[0],y=b[1]-a[1],l=Math.hypot(x,y)||1;return [x/l,y/l];};
  /* punto a una fracción t del hueso A→B, corrido o unidades hacia su normal n(R, dirección) */
  const sobre=(A,B,t,o,nf)=>R=>{const a=R.P[A],b=R.P[B],q=lp(a,b,t);if(!o)return q;const n=nf(R,un(a,b));return [q[0]+n[0]*o,q[1]+n[1]*o];};
  /* de costado: la cara de adelante de un miembro (bíceps, cuádriceps, tibial) es el hueso girado hacia donde mira la figura */
  const adel=(R,b)=>[R.d*b[1],-R.d*b[0]];
  /* el torso: su cara de adelante (pecho, abdomen) es la opuesta */
  const adelT=R=>{const b=un(R.P.P,R.P.N);return [-R.d*b[1],R.d*b[0]];};
  const lado=(R,b)=>[-b[1],b[0]];
  /* ---------- formas de los músculos: paths que se deforman con el hueso (SW-11 fase 2, jefe-musculos-1.md) ----------
     Cada músculo es una lista de puntos de control y cada punto está anclado a un hueso:
       [A, B, t, o, normal]  → el punto a la fracción t del hueso A→B (A y B, puntos del cuadro), corrido o unidades hacia la normal.
     La forma es una curva cerrada suave (Catmull-Rom) que pasa por esos puntos. Como cada punto sigue a su hueso, el músculo se estira,
     se acorta y gira con el cuerpo, y una forma puede cruzar dos huesos (el pectoral va del esternón al hombro: puntos en el torso y
     en el brazo). Atajo para los de un solo hueso: perfil [[t, ancho hacia la normal, ancho hacia el otro lado, desvío], …].
     Normales: 'adel' (de costado: la cara de adelante del miembro), 'torso' (de costado: adelante del torso), 'afuera' (de frente:
     hacia afuera de ese lado), 'lat' (de frente: a lo ancho del torso, con el signo s de cada mitad).
     En los nombres de los puntos, '#' es el lado (n/f de costado, L/R de frente). Las formas viven en FORMAS (datos): para cambiar
     un músculo se cambia su entrada, no el motor. */
  const NORM={adel:(R,b)=>[R.d*b[1],-R.d*b[0]],torso:R=>adelT(R),afuera:(R,b,sd)=>{const l=lado(R,b),k=sd==='L'?1:-1;return [l[0]*k,l[1]*k];},lat:(R,b,sd,s)=>{const l=lado(R,b);return [l[0]*s,l[1]*s];}};
  /* perfil → puntos: ida por un lado del hueso y vuelta por el otro */
  const perfilApuntos=(A,B,perfil,n)=>perfil.map(([t,wa,,o])=>[A,B,t,(o||0)+wa,n]).concat(perfil.slice().reverse().map(([t,,wb,o])=>[A,B,t,(o||0)-wb,n]));
  /* el diseño de sw-diseno (.equipo/SW-11/diseno-musculos: formas.json, aprobado por el jefe). Fuente editable: musref.js (corrimientos en
     medios anchos del tramo) y boceto.js la pasa a este formato. De costado, el pectoral y el glúteo son los de diseno-v102.md (M1: el pecho más alto, para que no parezca panza; M2: glúteo
     redondo con el muslo). De frente, el glúteo medio sale hasta 1,8 medios anchos (B2). De frente, el glúteo medio sale del costado
     de la pelvis (puntos en el torso, N→P con la normal 'afuera') para que asome afuera del short (jefe-musculos-2.md, B). De costado, el glúteo va entero con el muslo cercano
     (antes la mitad de arriba iba con la pelvis y, con la cadera muy flexionada, quedaba del lado de adelante: jefe-musculos-2.md, A). */
  const FORMAS={
    costado:[
      {"m":"lumbar","g":"torso","puntos":[["P","N",0.04,-1.5,"torso"],["P","N",0.06,-5.5,"torso"],["P","N",0.24,-5.8,"torso"],["P","N",0.4,-5,"torso"],["P","N",0.42,-1.5,"torso"],["P","N",0.22,-1,"torso"]]},
      {"m":"oblicuos","g":"torso","puntos":[["P","N",0.1,-1.5,"torso"],["P","N",0.12,2,"torso"],["P","N",0.3,2.25,"torso"],["P","N",0.46,2,"torso"],["P","N",0.52,0,"torso"],["P","N",0.44,-1.5,"torso"],["P","N",0.24,-1.75,"torso"]]},
      {"m":"abs","g":"torso","puntos":[["P","N",0.1,1.5,"torso"],["P","N",0.11,5.2,"torso"],["P","N",0.3,5.7,"torso"],["P","N",0.46,5.6,"torso"],["P","N",0.5,4.5,"torso"],["P","N",0.48,2,"torso"],["P","N",0.3,1.4,"torso"]],"lineas":[[["P","N",0.26,3,"torso"],["P","N",0.26,5.5,"torso"]],[["P","N",0.42,2.9,"torso"],["P","N",0.42,5.5,"torso"]]]},
      {"m":"dorsales","g":"torso","puntos":[["P","N",0.32,-2.5,"torso"],["P","N",0.5,-5.4,"torso"],["P","N",0.7,-6.7,"torso"],["P","N",0.86,-6.1,"torso"],["P","N",0.9,-3,"torso"],["P","N",0.72,-1.5,"torso"],["P","N",0.5,-1.5,"torso"]]},
      {"m":"pecho","g":"torso","puntos":[["P","N",0.56,2.5,"torso"],["P","N",0.6,6.4,"torso"],["P","N",0.7,7.4,"torso"],["P","N",0.82,7.2,"torso"],["P","N",0.92,5.8,"torso"],["P","N",0.98,3,"torso"],["P","N",0.84,1.5,"torso"],["P","N",0.66,1.6,"torso"]]},
      {"m":"trapecio","g":"torso","puntos":[["P","N",0.82,-2.25,"torso"],["P","N",0.88,-5.6,"torso"],["P","N",1,-5.4,"torso"],["P","N",1.1,-2.5,"torso"],["P","N",1.06,-0.5,"torso"],["P","N",0.94,-0.9,"torso"]]},
      {"m":"gluteos","g":"torso","puntos":[["Hpn","Kn",-0.16,-0.97,"adel"],["Hpn","Kn",-0.2,-4.23,"adel"],["Hpn","Kn",-0.12,-6.83,"adel"],["Hpn","Kn",0.06,-7.8,"adel"],["Hpn","Kn",0.24,-6.66,"adel"],["Hpn","Kn",0.36,-4.06,"adel"],["Hpn","Kn",0.34,-0.97,"adel"],["Hpn","Kn",0.1,0.33,"adel"]]},
      {"m":"triceps","g":"brazo","puntos":[["S#","E#",0.22,-0.28,"adel"],["S#","E#",0.34,-3.16,"adel"],["S#","E#",0.5,-3.85,"adel"],["S#","E#",0.68,-3.16,"adel"],["S#","E#",0.88,-1.04,"adel"],["S#","E#",0.9,-0.14,"adel"],["S#","E#",0.5,-0.28,"adel"]]},
      {"m":"biceps","g":"brazo","puntos":[["S#","E#",0.3,0.28,"adel"],["S#","E#",0.42,3.03,"adel"],["S#","E#",0.58,3.91,"adel"],["S#","E#",0.74,3.08,"adel"],["S#","E#",0.9,0.88,"adel"],["S#","E#",0.88,-0.11,"adel"],["S#","E#",0.5,0,"adel"]]},
      {"m":"antebrazos","g":"brazo","puntos":[["E#","W#",0.02,-2.28,"adel"],["E#","W#",0.04,2.28,"adel"],["E#","W#",0.2,3.07,"adel"],["E#","W#",0.46,2.4,"adel"],["E#","W#",0.76,1.2,"adel"],["E#","W#",0.76,-1.2,"adel"],["E#","W#",0.46,-2.4,"adel"],["E#","W#",0.2,-2.93,"adel"]]},
      {"m":"hombros","g":"brazo","puntos":[["S#","E#",-0.14,0,"adel"],["S#","E#",-0.08,2.53,"adel"],["S#","E#",0.1,3.3,"adel"],["S#","E#",0.3,2.34,"adel"],["S#","E#",0.42,0.22,"adel"],["S#","E#",0.3,-2.34,"adel"],["S#","E#",0.1,-3.3,"adel"],["S#","E#",-0.08,-2.53,"adel"]]},
      {"m":"isquios","g":"pierna","puntos":[["Hp#","K#",0.16,-0.32,"adel"],["Hp#","K#",0.34,-3.9,"adel"],["Hp#","K#",0.55,-4.29,"adel"],["Hp#","K#",0.8,-3.31,"adel"],["Hp#","K#",0.94,-1.17,"adel"],["Hp#","K#",0.9,0,"adel"],["Hp#","K#",0.5,0,"adel"]]},
      {"m":"aductores","g":"pierna","puntos":[["Hp#","K#",0.04,-0.97,"adel"],["Hp#","K#",0.08,1.63,"adel"],["Hp#","K#",0.3,1.79,"adel"],["Hp#","K#",0.52,0.98,"adel"],["Hp#","K#",0.5,-0.32,"adel"],["Hp#","K#",0.3,-1.24,"adel"]],"solo":"f"},
      {"m":"cuadriceps","g":"pierna","puntos":[["Hp#","K#",0.1,0.49,"adel"],["Hp#","K#",0.3,3.74,"adel"],["Hp#","K#",0.58,4.48,"adel"],["Hp#","K#",0.82,3.64,"adel"],["Hp#","K#",0.97,1.46,"adel"],["Hp#","K#",0.95,-0.16,"adel"],["Hp#","K#",0.6,-0.32,"adel"],["Hp#","K#",0.14,-0.26,"adel"]]},
      {"m":"gemelos","g":"pierna","puntos":[["K#","A#",0.04,-0.55,"adel"],["K#","A#",0.12,-3.3,"adel"],["K#","A#",0.28,-4.35,"adel"],["K#","A#",0.46,-3.24,"adel"],["K#","A#",0.64,-1.27,"adel"],["K#","A#",0.64,0,"adel"],["K#","A#",0.1,0,"adel"]]},
      {"m":"tibial","g":"pierna","puntos":[["K#","A#",0.1,0.14,"adel"],["K#","A#",0.16,2.61,"adel"],["K#","A#",0.42,2.53,"adel"],["K#","A#",0.74,1.43,"adel"],["K#","A#",0.74,0.14,"adel"]]}],
    frente:[
      {"m":"oblicuos","g":"torso","puntos":[["P","N",0.1,3.63,"lat"],["P","N",0.12,5.61,"lat"],["P","N",0.32,6.05,"lat"],["P","N",0.5,5.61,"lat"],["P","N",0.5,3.85,"lat"],["P","N",0.3,3.41,"lat"]],"bil":1},
      {"m":"abs","g":"torso","puntos":[["P","N",0.1,-3.3,"lat"],["P","N",0.1,3.3,"lat"],["P","N",0.34,3.63,"lat"],["P","N",0.58,3.41,"lat"],["P","N",0.6,0,"lat"],["P","N",0.58,-3.41,"lat"],["P","N",0.34,-3.63,"lat"]],"s":1,"lineas":[[["P","N",0.1,0,"lat"],["P","N",0.58,0,"lat"]],[["P","N",0.26,-3.41,"lat"],["P","N",0.26,3.41,"lat"]],[["P","N",0.42,-3.41,"lat"],["P","N",0.42,3.41,"lat"]]]},
      {"m":"dorsales","g":"torso","puntos":[["P","N",0.5,5.83,"lat"],["P","N",0.56,7.15,"lat"],["P","N",0.72,8.69,"lat"],["P","N",0.8,7.92,"lat"],["P","N",0.74,6.16,"lat"],["P","N",0.6,5.5,"lat"]],"bil":1},
      {"m":"pecho","g":"torso","puntos":[["P","N",0.58,0.22,"lat"],["P","N",0.6,4.51,"lat"],["P","N",0.66,7.81,"lat"],["P","N",0.76,9.13,"lat"],["P","N",0.88,8.25,"lat"],["P","N",0.92,4.95,"lat"],["P","N",0.9,0.22,"lat"]],"bil":1,"lineas":[[["P","N",0.6,0,"lat"],["P","N",0.9,0,"lat"]]]},
      {"m":"trapecio","g":"torso","puntos":[["P","N",0.9,1.65,"lat"],["P","N",0.94,6.6,"lat"],["P","N",0.98,8.25,"lat"],["P","N",1.06,4.95,"lat"],["P","N",1.08,1.76,"lat"]],"bil":1},
      {"m":"gluteos","g":"pierna","puntos":[["N","P",0.8,5.6,"afuera"],["N","P",0.84,8.8,"afuera"],["N","P",0.97,9.9,"afuera"],["H#","K#",0.12,5.85,"afuera"],["H#","K#",0.16,3.4,"afuera"],["N","P",0.96,4.4,"afuera"],["N","P",0.86,4.4,"afuera"]]},
      {"m":"hombros","g":"brazo","puntos":[["S#","E#",-0.16,-1.65,"afuera"],["S#","E#",-0.12,1.65,"afuera"],["S#","E#",0.04,4.13,"afuera"],["S#","E#",0.28,3.24,"afuera"],["S#","E#",0.44,0.55,"afuera"],["S#","E#",0.3,-2.47,"afuera"],["S#","E#",0.06,-3.16,"afuera"]]},
      {"m":"biceps","g":"brazo","puntos":[["S#","E#",0.3,-0.28,"afuera"],["S#","E#",0.4,-2.89,"afuera"],["S#","E#",0.58,-3.3,"afuera"],["S#","E#",0.76,-2.61,"afuera"],["S#","E#",0.9,-0.82,"afuera"],["S#","E#",0.9,0.83,"afuera"],["S#","E#",0.7,2.34,"afuera"],["S#","E#",0.5,2.48,"afuera"],["S#","E#",0.36,1.65,"afuera"]]},
      {"m":"triceps","g":"brazo","puntos":[["S#","E#",0.32,2.34,"afuera"],["S#","E#",0.46,3.52,"afuera"],["S#","E#",0.64,3.24,"afuera"],["S#","E#",0.76,2.48,"afuera"],["S#","E#",0.56,2.26,"afuera"]]},
      {"m":"antebrazos","g":"brazo","puntos":[["E#","W#",0.02,-2.28,"afuera"],["E#","W#",0.04,2.28,"afuera"],["E#","W#",0.2,3.07,"afuera"],["E#","W#",0.46,2.4,"afuera"],["E#","W#",0.76,1.2,"afuera"],["E#","W#",0.76,-1.2,"afuera"],["E#","W#",0.46,-2.4,"afuera"],["E#","W#",0.2,-2.93,"afuera"]]},
      {"m":"aductores","g":"pierna","puntos":[["H#","K#",0.02,-1.14,"afuera"],["H#","K#",0.04,-3.9,"afuera"],["H#","K#",0.2,-4.29,"afuera"],["H#","K#",0.46,-3.41,"afuera"],["H#","K#",0.52,-1.95,"afuera"],["H#","K#",0.3,-1.3,"afuera"]]},
      {"m":"cuadriceps","g":"pierna","puntos":[["H#","K#",0.06,0.98,"afuera"],["H#","K#",0.1,3.64,"afuera"],["H#","K#",0.38,4.29,"afuera"],["H#","K#",0.66,3.64,"afuera"],["H#","K#",0.88,2.02,"afuera"],["H#","K#",0.94,0,"afuera"],["H#","K#",0.86,-2.92,"afuera"],["H#","K#",0.74,-3.9,"afuera"],["H#","K#",0.56,-2.66,"afuera"],["H#","K#",0.34,-1.79,"afuera"],["H#","K#",0.14,-0.65,"afuera"]]},
      {"m":"tibial","g":"pierna","puntos":[["K#","A#",0.1,0.28,"afuera"],["K#","A#",0.14,2.26,"afuera"],["K#","A#",0.42,2.42,"afuera"],["K#","A#",0.74,1.51,"afuera"],["K#","A#",0.74,0.22,"afuera"],["K#","A#",0.4,0.14,"afuera"]]},
      {"m":"gemelos","g":"pierna","puntos":[["K#","A#",0.1,-2.34,"afuera"],["K#","A#",0.16,-3.71,"afuera"],["K#","A#",0.3,-3.9,"afuera"],["K#","A#",0.46,-2.89,"afuera"],["K#","A#",0.44,-2.25,"afuera"]]}],
    atras:[
      {"m":"lumbar","g":"torso","puntos":[["P","N",0.04,0.66,"lat"],["P","N",0.04,3.19,"lat"],["P","N",0.2,3.41,"lat"],["P","N",0.36,2.75,"lat"],["P","N",0.36,0.66,"lat"]],"bil":1,"lineas":[[["P","N",0.04,0,"lat"],["P","N",0.4,0,"lat"]]]},
      {"m":"oblicuos","g":"torso","puntos":[["P","N",0.08,4.13,"lat"],["P","N",0.12,6.16,"lat"],["P","N",0.34,6.05,"lat"],["P","N",0.42,5.06,"lat"],["P","N",0.3,4.13,"lat"]],"bil":1},
      {"m":"dorsales","g":"torso","puntos":[["P","N",0.26,1.65,"lat"],["P","N",0.3,4.4,"lat"],["P","N",0.44,7.15,"lat"],["P","N",0.62,8.8,"lat"],["P","N",0.8,9.13,"lat"],["P","N",0.86,7.15,"lat"],["P","N",0.74,3.03,"lat"],["P","N",0.55,1.76,"lat"]],"bil":1},
      {"m":"trapecio","g":"torso","puntos":[["P","N",1.06,0,"lat"],["P","N",1.02,3.03,"lat"],["P","N",0.96,7.04,"lat"],["P","N",0.9,8.91,"lat"],["P","N",0.84,6.6,"lat"],["P","N",0.68,2.75,"lat"],["P","N",0.5,0,"lat"],["P","N",0.68,-2.75,"lat"],["P","N",0.84,-6.6,"lat"],["P","N",0.9,-8.91,"lat"],["P","N",0.96,-7.04,"lat"],["P","N",1.02,-3.03,"lat"]],"s":1},
      {"m":"gluteos","g":"torso","puntos":[["P","N",0.02,0.22,"lat"],["P","N",0.04,3.96,"lat"],["P","N",-0.04,5.5,"lat"],["P","N",-0.17,5.61,"lat"],["P","N",-0.26,4.4,"lat"],["P","N",-0.28,1.65,"lat"],["P","N",-0.22,0.22,"lat"]],"bil":1},
      {"m":"hombros","g":"brazo","puntos":[["S#","E#",-0.16,-1.65,"afuera"],["S#","E#",-0.12,1.65,"afuera"],["S#","E#",0.04,4.13,"afuera"],["S#","E#",0.28,3.24,"afuera"],["S#","E#",0.44,0.55,"afuera"],["S#","E#",0.3,-2.47,"afuera"],["S#","E#",0.06,-3.16,"afuera"]]},
      {"m":"triceps","g":"brazo","puntos":[["S#","E#",0.22,-0.55,"afuera"],["S#","E#",0.3,-2.89,"afuera"],["S#","E#",0.5,-3.44,"afuera"],["S#","E#",0.72,-2.61,"afuera"],["S#","E#",0.88,-0.69,"afuera"],["S#","E#",0.88,0.69,"afuera"],["S#","E#",0.72,2.61,"afuera"],["S#","E#",0.5,3.44,"afuera"],["S#","E#",0.3,2.89,"afuera"],["S#","E#",0.22,0.55,"afuera"]]},
      {"m":"antebrazos","g":"brazo","puntos":[["E#","W#",0.02,-2.28,"afuera"],["E#","W#",0.04,2.28,"afuera"],["E#","W#",0.2,3.07,"afuera"],["E#","W#",0.46,2.4,"afuera"],["E#","W#",0.76,1.2,"afuera"],["E#","W#",0.76,-1.2,"afuera"],["E#","W#",0.46,-2.4,"afuera"],["E#","W#",0.2,-2.93,"afuera"]]},
      {"m":"aductores","g":"pierna","puntos":[["H#","K#",0.04,-1.46,"afuera"],["H#","K#",0.06,-3.74,"afuera"],["H#","K#",0.26,-3.9,"afuera"],["H#","K#",0.4,-2.76,"afuera"],["H#","K#",0.3,-1.62,"afuera"]]},
      {"m":"isquios","g":"pierna","puntos":[["H#","K#",0.14,-2.76,"afuera"],["H#","K#",0.12,2.76,"afuera"],["H#","K#",0.36,3.74,"afuera"],["H#","K#",0.66,3.32,"afuera"],["H#","K#",0.9,1.63,"afuera"],["H#","K#",0.92,-1.62,"afuera"],["H#","K#",0.66,-3.41,"afuera"],["H#","K#",0.36,-3.64,"afuera"]],"lineas":[[["H#","K#",0.18,0,"afuera"],["H#","K#",0.86,0,"afuera"]]]},
      {"m":"gemelos","g":"pierna","puntos":[["K#","A#",0.04,-2.2,"afuera"],["K#","A#",0.04,2.2,"afuera"],["K#","A#",0.18,3.91,"afuera"],["K#","A#",0.34,3.85,"afuera"],["K#","A#",0.56,1.65,"afuera"],["K#","A#",0.62,0,"afuera"],["K#","A#",0.56,-1.65,"afuera"],["K#","A#",0.34,-3.9,"afuera"],["K#","A#",0.18,-3.99,"afuera"]]}]};
  /* tope de volumen (jefe, músculos v2): el músculo es parte del brazo, no algo puesto encima. Deltoides hasta 1,2× el grosor del brazo y
     bíceps y tríceps hasta 1,15× (medido de cada lado del hueso: medio grosor = 2,75); el deltoides no se pasa del hombro más de 0,06 del
     brazo, y ninguno llega al codo. El margen (0,9) es para la curva, que se pasa un poco de sus puntos. Lo controla tests/musculos.test.js. */
  const TOPE={hombros:1.2,biceps:1.15,triceps:1.15},MEDIO_BRAZO=2.75;
  function topeVolumen(e,pts){const k=TOPE[e.m];if(!k||e.g!=='brazo')return pts;const o=k*MEDIO_BRAZO*.9;
    return pts.map(p=>/^[SE]#$/.test(p[0])&&/^[EW]#$/.test(p[1])?[p[0],p[1],Math.min(.94,Math.max(-.06,p[2])),Math.max(-o,Math.min(o,p[3])),p[4]]:p);}
  /* las formas de una definición, ya con el lado y el grupo de dibujo (lejos / lejosP / torso / piernaN / brazoN) */
  const FCACHE=new WeakMap();
  function formas(D){if(FCACHE.has(D))return FCACHE.get(D);const v=vistaDe(D),fr=v!=='costado',out=[];
    for(const e of FORMAS[v]){const base=topeVolumen(e,e.puntos||perfilApuntos(e.A,e.B,e.perfil,e.n));
      if(e.g==='torso'){for(const s of e.bil?[-1,1]:[e.s||1])out.push({m:e.m,g:'torso',sd:null,s,pts:base,lineas:e.lineas});continue;}
      for(const sd of fr?['L','R']:['n','f']){if(e.solo&&e.solo!==sd)continue;const cerca=fr?sd==='R':sd==='n';
        const g=cerca?(e.g==='brazo'?'brazoN':'piernaN'):(fr&&e.g==='pierna'?'lejosP':'lejos');
        const rp=p=>[p[0].replace('#',sd),p[1].replace('#',sd),p[2],p[3],p[4]];out.push({m:e.m,g,sd,s:1,pts:base.map(rp),lineas:e.lineas&&e.lineas.map(l=>l.map(rp))});}}
    FCACHE.set(D,out);return out;}
  /* el contorno de una forma en un cuadro */
  const contorno=(R,f)=>{const P=f.pts.map(p=>ptoCtl(R,p,f.sd,f.s));return P.some(q=>!q)?'':curvaCerrada(P);};
  const ptoCtl=(R,[A,B,t,o,n],sd,s)=>{const a=R.P[A],b=R.P[B];if(!a||!b)return null;const q=lp(a,b,t);if(!o)return q;const v=NORM[n](R,un(a,b),sd,s);return [q[0]+v[0]*o,q[1]+v[1]*o];};
  /* curva cerrada suave por los puntos (Catmull-Rom pasada a Bézier cúbica) */
  function curvaCerrada(P){const n=P.length;if(n<3)return '';let d='M'+f1(P[0][0])+' '+f1(P[0][1]);
    for(let i=0;i<n;i++){const p0=P[(i-1+n)%n],p1=P[i],p2=P[(i+1)%n],p3=P[(i+2)%n];
      d+='C'+f1(p1[0]+(p2[0]-p0[0])/6)+' '+f1(p1[1]+(p2[1]-p0[1])/6)+' '+f1(p2[0]-(p3[0]-p1[0])/6)+' '+f1(p2[1]-(p3[1]-p1[1])/6)+' '+f1(p2[0])+' '+f1(p2[1]);}
    return d+'Z';}
  /* músculos tapados por la ropa: si no trabajan, no se dibujan (la ropa no se pinta de anatomía); si trabajan, van encima */
  /* musculosa (solo en el modo detalle o el juego; en la app, solo short): forma de diseno (boceto.js, TANK), sisa amplia y escote */
  const MUSCULOSA={costado:[['P','N',.06,-5.4,'torso'],['P','N',.06,5.4,'torso'],['P','N',.56,5.6,'torso'],['P','N',.8,4.2,'torso'],['P','N',.9,2,'torso'],['P','N',.98,-1,'torso'],['P','N',.9,-4.4,'torso'],['P','N',.6,-5.4,'torso']],
    frente:[['P','N',.06,0,'lat'],['P','N',.06,6,'lat'],['P','N',.5,6.2,'lat'],['P','N',.72,6.6,'lat'],['P','N',.86,5.6,'lat'],['P','N',1,4.4,'lat'],['P','N',1,2.4,'lat'],['P','N',.84,0,'lat']]};MUSCULOSA.atras=MUSCULOSA.frente;
  /* los músculos del ejercicio: principales (p) y secundarios (s) de EX */
  const MUSC_EX=new WeakMap();
  function muscDe(D,id){if(MUSC_EX.has(D))return MUSC_EX.get(D);id=id||idDe(D);const e=typeof EX!=='undefined'&&EX.find(x=>x.id===id),r={p:(e&&e.p)||[],s:((e&&e.s)||[]).filter(m=>!(e.p||[]).includes(m))};MUSC_EX.set(D,r);return r;}
  const pathAnim=(F,fn,cls,one)=>{const v=seq(F,fn),an=one||v.every(x=>x===v[0])?'':'<animate attributeName="d" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';return '<path class="'+cls+'" d="'+fn(F[0])+'">'+an+'</path>';};
  /* dibuja los músculos de un grupo (lejos, lejosP, torso, piernaN, brazoN): los que trabajan en color (principal fuerte, secundario
     suave) y el resto en un tono apenas más oscuro que la piel, para que el cuerpo se lea musculoso (jefe-musculos-1.md, punto 2).
     Los tapados por la ropa solo se dibujan si trabajan (o con opt.detalle). Cada uno es un path animado: el mismo número de
     puntos en todos los cuadros, así el navegador interpola la forma. */
  function musSVG(F,D,grupo,one,opt){const M=muscDe(D,opt.id),vis=MVIS[vistaDe(D)],fr=D.v==='front';let h='';
    /* de frente, los de las piernas que trabajan se pintan al final del torso: si no, el short de la cadera los tapa (abductores, aductores; jefe-musculos-2.md, B) */
    if(fr&&opt.solo==='w'&&(grupo==='lejosP'||grupo==='piernaN')&&!opt.tarde)return '';if(opt.tarde&&!fr)return '';
    /* entre los que trabajan, primero los secundarios y arriba los principales (diseno-v102.md, M2: el isquio tapaba el glúteo del hip thrust) */
    const orden=opt.solo==='w'?formas(D).slice().sort((a,b)=>(M.p.includes(a.m)?1:0)-(M.p.includes(b.m)?1:0)):formas(D);
    for(const f of orden){if(f.g!==grupo||!vis.includes(f.m))continue;const st=M.p.includes(f.m)?'mp':M.s.includes(f.m)?'ms':'m0';
      if(opt.solo==='m0'&&st!=='m0')continue;if(opt.lite)continue;if(opt.solo==='w'&&st==='m0')continue; /* capas: los que no trabajan van debajo de la ropa y los que trabajan, encima */
      const v=seq(F,R=>contorno(R,f)),an=one||v.every(x=>x===v[0])?'':'<animate attributeName="d" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';
      h+='<path class="mk-m mk-'+st+' m-'+f.m+'" d="'+contorno(F[0],f)+'">'+an+'</path>';
      /* líneas de definición (abdomen, esternón, isquios, lumbar): segmentos con los mismos puntos anclados */
      if(f.lineas)for(const [p,q] of f.lineas){const ln=R=>{const a=ptoCtl(R,p,f.sd,f.s),b=ptoCtl(R,q,f.sd,f.s);return a&&b?'M'+f1(a[0])+' '+f1(a[1])+'L'+f1(b[0])+' '+f1(b[1]):'';},v2=seq(F,ln);
        h+='<path class="mk-ml mk-l'+st+'" d="'+ln(F[0])+'">'+(one||v2.every(x=>x===v2[0])?'':'<animate attributeName="d" values="'+v2.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>')+'</path>';}}
    return h;}
  /* ropa (jefe-musculos-1.md, punto 3): musculosa (el torso, sin mangas) y short (cadera y muslos). Pelo: un casquete detrás de la cabeza */
  function ropaSVG(F,D,grupo,one,opt){opt=opt||{};const fr=D.v==='front',sds=grupo==='lejos'&&!fr?['f']:grupo==='lejosP'?['L']:grupo==='piernaN'?[fr?'R':'n']:[];let h='';
    for(const sd of sds)h+=line(F,(fr?'H':'Hp')+sd,R=>lp(R.P[(fr?'H':'Hp')+sd],R.P['K'+sd],.3),'mk-short',fr?7.2:7,one);
    if(grupo==='torso'){h+=line(F,R=>lp(R.P.P,R.P.N,-.06),R=>lp(R.P.P,R.P.N,.14),'mk-short',fr?11.6:10.6,one);
      for(const f of formas(D))if(f.m==='gluteos'&&f.g==='torso')h+=pathAnim(F,R=>contorno(R,f),'mk-shortf',one);
      if(opt.detalle)for(const s2 of fr?[-1,1]:[1]){const ff={pts:MUSCULOSA[vistaDe(D)],sd:null,s:s2};h+=pathAnim(F,R=>contorno(R,ff),'mk-tank',one);}}
    return h;}
  /* nariz de costado: un bulto chico adelante de la cara, para que se lea hacia dónde mira el cuerpo (sin cara, en los fondos o los
     levers el pecho parecía la espalda: jefe-musculos-2.md, A) */
  function narizSVG(F,D,one){if(D.v==='front')return '';return dot(F,R=>{const H=R.P.H,b=un(R.P.N,H),n=[-R.d*b[1],R.d*b[0]];return [H[0]+n[0]*(HEAD-.4)+b[0]*.6,H[1]+n[1]*(HEAD-.4)+b[1]*.6];},1.9,'mk-nariz',one);}
  function peloSVG(F,D,one){const fr=D.v==='front';
    if(fr&&D.back)return dot(F,R=>{const u=un(R.P.N,R.P.H);return [R.P.H[0]+u[0]*.5,R.P.H[1]+u[1]*.5];},HEAD-1.1,'mk-pelo',one);
    return dot(F,R=>{const u=un(R.P.N,R.P.H),bk=fr?[0,0]:(()=>{const b=un(R.P.P,R.P.N);return [R.d*b[1],-R.d*b[0]];})();return [R.P.H[0]+u[0]*1.7+bk[0]*1.4,R.P.H[1]+u[1]*1.7+bk[1]*1.4];},HEAD-.5,'mk-pelo',one);}
  function svg(D,opt){opt=opt||{};
    /* figura quieta chica (árbol, logros, listas: stat sin u): sin músculos, sin pelo ni nariz (qa fase 2, B1: el árbol pasó de 201 a 561 KB; el jefe:
       a 44 px van quietas y sin músculos, como antes) */
    if(opt.stat&&opt.u==null&&!opt.detalle&&opt.lite==null)opt=Object.assign({},opt,{lite:1});const lite=!!opt.lite;const one=opt.u!=null||opt.stat,F=one?[frame(D,opt.raw?(opt.u||0):ease(opt.u||0))]:frames(D),fr=D.v==='front';FWD=!one&&!!D.fwd;try{
    const nearF=fr?'<g class="mk-near">'+limbsF(F,'R',one)+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'piernaN',one,opt)+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'w'}))+'</g>':''; /* yaw (vista 3/4): la pierna cercana viene hacia quien mira y pasa por delante del torso */
    const body=fr?'<g class="mk-far">'+limbsF(F,'L',one)+musSVG(F,D,'lejosP',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'lejosP',one,opt)+musSVG(F,D,'lejosP',one,Object.assign({},opt,{solo:'w'}))+'</g>'+(D.yaw&&!D.back?'':nearF)+eqSVG(F,D,one,'back2')+'<g class="mk-near">'+seg(F,'P','N','mk-tr',11,one)+(D.back?line(F,R=>lp(R.P.P,R.P.N,.08),R=>lp(R.P.P,R.P.N,.92),'mk-hl',1.3,one):'')+musSVG(F,D,'torso',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'torso',one,opt)+musSVG(F,D,'torso',one,Object.assign({},opt,{solo:'w'}))+musSVG(F,D,'lejosP',one,Object.assign({},opt,{solo:'w',tarde:1}))+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'w',tarde:1}))+'</g>'+(D.yaw&&!D.back?nearF:'')+(D.back?'':(lite?'':peloSVG(F,D,one)))+dot(F,'H',HEAD,'tq-h',one)+(D.back?(lite?'':peloSVG(F,D,one)):'')+
        '<g class="mk-far">'+armF(F,'L',one)+musSVG(F,D,'lejos',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'lejos',one,opt)+musSVG(F,D,'lejos',one,Object.assign({},opt,{solo:'w'}))+'</g><g class="mk-near">'+armF(F,'R',one)+musSVG(F,D,'brazoN',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'brazoN',one,opt)+musSVG(F,D,'brazoN',one,Object.assign({},opt,{solo:'w'}))+dot(F,'ER',2,'tq-j',one)+dot(F,'EL',2,'tq-j',one)+'</g>'
      :eqSVG(F,D,one,'back2')+'<g class="mk-far">'+limbs(F,'f',one)+arm(F,'f',one)+musSVG(F,D,'lejos',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'lejos',one,opt)+musSVG(F,D,'lejos',one,Object.assign({},opt,{solo:'w'}))+'</g>'+eqSVG(F,D,one,'mid')+
        '<g class="mk-near">'+torsoS(F,one)+musSVG(F,D,'torso',one,Object.assign({},opt,{solo:'m0'}))+limbs(F,'n',one)+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'torso',one,opt)+ropaSVG(F,D,'piernaN',one,opt)+musSVG(F,D,'torso',one,Object.assign({},opt,{solo:'w'}))+musSVG(F,D,'lejosP',one,Object.assign({},opt,{solo:'w',tarde:1}))+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'w',tarde:1}))+musSVG(F,D,'piernaN',one,Object.assign({},opt,{solo:'w'}))+dot(F,'Kn',2.2,'tq-j',one)+'</g>'+(D.headFront?'':(lite?'':peloSVG(F,D,one))+(lite?'':narizSVG(F,D,one))+dot(F,'H',HEAD,'tq-h',one))+'<g class="mk-near">'+arm(F,'n',one)+musSVG(F,D,'brazoN',one,Object.assign({},opt,{solo:'m0'}))+ropaSVG(F,D,'brazoN',one,opt)+musSVG(F,D,'brazoN',one,Object.assign({},opt,{solo:'w'}))+dot(F,'En',2,'tq-j',one)+'</g>'+(D.headFront?(lite?'':peloSVG(F,D,one))+(lite?'':narizSVG(F,D,one))+dot(F,'H',HEAD,'tq-h',one):''); /* headFront: las manos pasan detrás de la cabeza */
    return '<svg class="tq mk'+(fr?' mk-fr':'')+(one?' st':'')+'" viewBox="'+(opt.vb||'0 0 120 120')+'" role="img" aria-label="Cómo se hace'+(D.back?' (vista de atrás)':'')+'">'+eqSVG(F,D,one,'back')+(FWD?'<g><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.8;.86;.9;1" dur="2.8s" repeatCount="indefinite"/>':'')+shadow(F,D,one)+body+(FWD?'</g>':'')+(fr?eqSVG(F,D,one,'mid'):eqSVG(F,D,one,'top'))+
      (opt.noGrip?'':D.ag&&typeof agMini==='function'?agMini(D,gripBox(D),opt.id||idDe(D)):gripGlyph(D.grip,gripBox(D)))+'</svg>';}finally{FWD=false;}}
  /* ---------- validador ---------- */
  function check(D,steps){steps=steps||40; /* cada 2,5 % del movimiento */const acc=new Map(),add1=m=>{const i=m.lastIndexOf(' en '),k=m.slice(0,i).replace(/ \(-?\d+°\)/,''),p=m.slice(i+4);if(!acc.has(k))acc.set(k,[]);acc.get(k).push(p);};
    const fr=D.v==='front',SDS=fr?['L','R']:['n','f'],lado=(sd,fem)=>fr?(sd==='L'?' izquierd':' derech')+(fem?'a':'o'):(sd==='n'?(fem?' cercana':' cercano'):(fem?' lejana':' lejano'));
    const NM={HpK:['el muslo',1],HK:['el muslo',1],KA:['la pierna',0],AT:['el pie',1],LA:['el pie',1],LT:['el pie',1],SE:['el brazo',1],EW:['el antebrazo',1],WG:['la mano',0]},part=n=>{if(n==='torso')return 'el torso';if(n==='cabeza')return 'la cabeza';const m=NM[n.slice(0,-1)]||['el cuerpo',1];return m[0]+lado(n.slice(-1),!m[1]);};
    const blocks=(D.eq||[]).filter(e=>e.t==='block'&&!e.soft);
    /* 0. la barra fija de costado se ve de punta (un círculo con su soporte), nunca a lo largo */
    if(!fr)(D.eq||[]).forEach(e=>{if(e.t==='pullbar'&&(e.front||e.mount==='h'))add1('la barra fija se ve a lo largo en una vista de costado en 0%');});
    for(let i=0;i<=steps;i++){const u=i/steps,R=frame(D,u),P=R.P,g=angles(R),pc=Math.round(u*100)+'%';
      /* 1. articulaciones dentro del rango humano */
      /* de frente, un tramo muy en escorzo (menos del 60 % de su largo: viene hacia quien mira) no muestra su ángulo real: ahí se controlan largo y contacto */
      /* yaw: vista 3/4 armada en 3D (.equipo/SW-10/tres-cuartos.js): los ángulos de pantalla son proyecciones, no los del plano frontal; se controlan largos, apoyos y piso */
      if(fr){for(const sd of (D.yaw?[]:SDS)){const q=g[sd],esc=s=>lsOf(R.g,s,sd)<.6;[['a','fa','hombro',0,'ua'],['e','fe','codo',0,'ua'],['h','fh','cadera',1,'th'],['k','fk','rodilla',1,'th']].forEach(([k,l,n,fem,sg])=>{if(esc(sg))return;const v=q[k],L=(D.lim&&D.lim[l])||LIM[l];if(v<L[0]-.5||v>L[1]+.5)add1(n+lado(sd,fem)+' fuera de rango ('+Math.round(v)+'°) en '+pc);});}}
      else{if(g.nk<LIM.nk[0]-.5||g.nk>LIM.nk[1]+.5)add1('cuello fuera de rango ('+Math.round(g.nk)+'°) en '+pc);
        for(const sd of SDS)for(const k of ['s','e','w','h','k','a','ab','abf','lt','el']){if('sew'.includes(k)&&g[sd].ab>=45)continue;if('ew'.includes(k)&&g[sd].abf>=45)continue; /* con el antebrazo hacia quien mira (abf ≥ 45) el codo y la muñeca proyectados no muestran su ángulo real */const v=g[sd][k],L=(D.lim&&D.lim[k])||LIM[k]; /* lim: rango propio de un ejercicio, con su motivo en la definición */if(v<L[0]-.5||v>L[1]+.5)add1({s:'hombro',e:'codo',w:'muñeca',h:'cadera',k:'rodilla',a:'tobillo',ab:'apertura del brazo',abf:'apertura del antebrazo',lt:'apertura del muslo',el:'elevación del hombro'}[k]+lado(sd,['w','h','k','ab','abf','lt'].includes(k))+' fuera de rango ('+Math.round(v)+'°) en '+pc);}}
      /* 1b. bilateral: los dos lados con los mismos ángulos (salvo ejercicios a una mano o pierna, o alternados: uni) */
      if(!D.uni&&!(fr&&D.yaw)){const ks=fr?['a','e','h','k']:['s','e','h','k','a'],[x,y]=fr?['L','R']:['n','f'];ks.forEach(k=>{const dv=Math.abs(nrm(g[x][k]-g[y][k]));if(dv>6)add1({s:'brazo',a:'brazo',e:'codo',h:'muslo',k:'rodilla'}[k]+(fr?' derecho distinto del izquierdo':' lejano distinto del cercano')+' ('+Math.round(dv)+'°) en '+pc);});}
      /* 1d. de frente y de pie: la rodilla en la línea cadera–pie (sin piernas en O), salvo rodillas dobladas declaradas (bentKnees) */
      if(fr&&!D.bentKnees)for(const sd of SDS){const H=P['H'+sd],A=P['A'+sd],K=P['K'+sd],v=[A[0]-H[0],A[1]-H[1]],l=Math.hypot(v[0],v[1])||1,dk=Math.abs((K[0]-H[0])*v[1]-(K[1]-H[1])*v[0])/l;if(dk>1.5)add1('la rodilla'+lado(sd,1)+' se sale de la línea cadera–pie ('+dk.toFixed(1)+') en '+pc);}
      /* 1c. al final de un empuje o una extensión el codo o la rodilla llegan casi estirados (≥165°): lock = [{u:0|1, j:'e'|'k'}].
         En las posiciones isométricas de brazos estirados (planches, banderas, levers, vertical, soportes) u:'all' lo exige en todo el recorrido;
         sd elige los lados (por defecto los dos, o solo el cercano si es unilateral) */
      (D.lock||[]).forEach(L=>{const all=L.u==='all';if(!all&&Math.abs(u-L.u)>.001)return;for(const sd of (L.sd||(D.uni?SDS.slice(0,1):SDS))){const v=Math.abs(g[sd][L.j]);if(v>15.5)add1((L.j==='e'?'el codo':'la rodilla')+lado(sd,L.j!=='e')+(all?' no está estirado':' no llega a estirarse al final')+' ('+Math.round(180-v)+'°) en '+pc);}});
      /* 2. huesos con largo fijo (el escorzo achica lo que se ve, no el hueso) */
      for(const sd of SDS){let L;if(fr){const ls=(s)=>lsOf(R.g,s,sd);L=[['S','E',LEN.ua*ls('ua'),'brazo'],['E','W',LEN.fa*ls('fa'),'antebrazo'],['H','K',LEN.th*ls('th'),'muslo'],['K','A',LEN.sh*ls('sh'),'pierna']];}
        else{const q=R.g[sd],cf=Math.cos(rad(q.abf));L=[['S','E',LEN.ua*Math.cos(rad(q.ab)),'brazo'],['E','W',LEN.fa*cf,'antebrazo'],['W','G',LEN.hd*cf,'mano'],['Hp','K',LEN.th*Math.cos(rad(q.lt)),'muslo'],['K','A',LEN.sh,'pierna'],['A','T',Math.hypot(LEN.ft,LEN.sole),'pie']];}
        L.forEach(([a,b,l,n])=>{if(Math.abs(dist(P[a+sd],P[b+sd])-Math.abs(l))>.15)add1(n+' cambia de largo en '+pc);});} /* ls negativo: el tramo apunta al revés (gira pasando por quien mira, como el antebrazo en la rotación externa) */
      if(!fr&&Math.abs(dist(P.P,P.N)-tLen(R.g.cv))>.15)add1('torso cambia de largo en '+pc);
      /* 3. manos y pies en su contacto; el cable termina en la mano */
      for(const k in (R.tg||{})){const sd=k.slice(-1),j=k[0],got=P[j+sd],dd=dist(got,R.tg[k]);if(dd>.8)add1((j==='A'||j==='T'?'el pie':'la mano')+lado(sd,!(j==='A'||j==='T'))+' no llega a su apoyo ('+dd.toFixed(1)+') en '+pc);}
      (D.eq||[]).forEach((e,ix)=>{if((e.t==='pulley'||e.t==='lever'||e.t==='plat')&&!P[e.to])add1('el '+(e.t==='pulley'?'cable':'equipo')+' no tiene a dónde llegar');if(['bar','db','kb','ball','handle','ring','pad'].includes(e.t)&&R.eq[ix].at==null)add1('equipo sin lugar ('+e.t+')');});
      /* 4. nada atraviesa el piso ni el equipo; nada sale del dibujo */
      /* r: medio grosor del trazo (para piso y equipo); cr: contorno dibujado con su borde (para no salirse del dibujo) */
      const pts=[],CR={K:4.35,A:3.85,T:2.85,E:3.85,W:3.5,G:3.2},SEG=fr?[['H','K',3.2],['K','A',2.7],['L','T',1.7],['S','E',2.6],['E','W',2.3],['W','G',2]]:[['Hp','K',3.2],['K','A',2.7],['A','T',1.7],['L','A',1.7],['S','E',2.6],['E','W',2.3],['W','G',2]];
      for(const sd of SDS)SEG.forEach(([a,b,r])=>{const q=R.g[sd]||{},side=!fr&&((a==='S'&&q.ab>25)||((a==='E'||a==='W')&&(q.ab>25||q.abf>25))||((a==='Hp'||a==='K')&&q.lt>25));for(let s=0;s<=6;s++)pts.push({p:lp(P[a+sd],P[b+sd],s/6),r,cr:CR[b]||CR[a]||r+1.1,n:a+b+sd,side,arm:'SEW'.includes(a)});});
      for(let s=0;s<=6;s++)pts.push({p:lp(P.P,P.N,s/6),r:5,cr:6.1,n:'torso'});pts.push({p:P.H,r:HEAD,cr:HEAD,n:'cabeza'});
      const floor=(D.eq||[]).some(e=>e.t==='floor');
      pts.forEach(o=>{if(floor&&o.p[1]+o.r>FLOOR+.8)add1(part(o.n)+' se mete en el piso en '+pc);
        if(o.p[0]-o.cr<-.3||o.p[0]+o.cr>120.3||o.p[1]-o.cr<-.3||o.p[1]+o.cr>120.3)add1(part(o.n)+' se sale del dibujo en '+pc);
        if(!o.side&&!(fr&&o.arm))blocks.forEach(b=>{if(b.only&&o.n!=='torso'&&o.n!=='cabeza'&&o.n.slice(-1)!==b.only)return;const r=b.r,inX=o.p[0]>r[0]+.5&&o.p[0]<r[0]+r[2]-.5,inY=o.p[1]+o.r>r[1]+1&&o.p[1]-o.r<r[1]+r[3];if(inX&&inY)add1(part(o.n)+' atraviesa el banco o el equipo en '+pc);});});
      /* 5. pies apoyados: ni flotan ni se hunden (talón y punta en la superficie) */
      for(const sd of Object.keys(D.feet||{})){const y=D.feet[sd]==='floor'?FLOOR:D.feet[sd],lim=y-1.75;[['T','punta'],['L','talón']].forEach(([j,n])=>{if(!P[j+sd])return;const dy=P[j+sd][1]-lim;if(dy>1)add1('el pie'+lado(sd,0)+' se hunde ('+n+') en '+pc);if(dy<-1.2&&!(D.tiptoe&&j==='L'))add1('el pie'+lado(sd,0)+' flota ('+n+') en '+pc);});}
      /* 6. manos y equipo fuera de la cabeza */
      for(const sd of SDS){const q=R.g[sd]||{},lat=fr?0:14*Math.sin(rad(q.ab||0))+18*Math.sin(rad(q.abf||0));if(lat<HEAD+2&&!D.handHead&&dist(P['G'+sd],P.H)<HEAD+1.5)add1('la mano'+lado(sd,1)+' se mete en la cabeza en '+pc);}
      /* 7. ningún equipo (barra, mancuerna, manija, cable, palanca) a menos de 2 de la cabeza, salvo contacto declarado: headOK (con su motivo), detrás o al costado */
      R.eq.forEach(e=>{if(e.headOK||e.behind||e.lateral)return;const at=e.at,H=P.H,lim=HEAD+2,NMq={bar:'la barra',db:'la mancuerna',kb:'la pesa rusa',ball:'el balón',handle:'la manija',pad:'el rodillo',ring:'la anilla',pulley:'el cable',lever:'la palanca'};let dd=1e9;
        if(['bar','db','kb','ball','handle','pad'].includes(e.t)&&at)dd=dist(at,H)-({bar:(e.r||6.5)+.75,db:e.rot!=null?9.25:5.35,kb:6.75,ball:7.75,handle:3.9,pad:(e.r||4.6)+.75})[e.t]; /* hasta el contorno dibujado (con su aro) */
        else if(e.t==='ring'&&at)dd=dist([at[0],at[1]-3.5],H)-5;
        else if((e.t==='pulley'||e.t==='lever')&&P[e.to]){const a=e.t==='pulley'?e.p:e.pv,b=P[e.to],v=[b[0]-a[0],b[1]-a[1]],L2=v[0]*v[0]+v[1]*v[1]||1,t=Math.max(0,Math.min(1,((H[0]-a[0])*v[0]+(H[1]-a[1])*v[1])/L2));dd=dist(H,[a[0]+v[0]*t,a[1]+v[1]*t])-(e.t==='lever'?1.75:.8);}
        if(dd<lim)add1((NMq[e.t]||'el equipo')+' pasa a menos de 2 de la cabeza en '+pc);});}
    if(D.grip&&!gripBox(D))add1('el recuadro del agarre no tiene una esquina libre: tapa la figura o el equipo en 0%');
    return [...acc].map(([k,ps])=>k+' en '+(ps.length>1?ps[0]+'–'+ps[ps.length-1]:ps[0]));}
  return{LEN,LIM,frame,angles,svg,check,gripGlyph,gripBox,caja,shapes,phi,V,nrm,MUS,MVIS,vistaDe,formas,muscDe,FORMAS,contorno,MUSCULOSA};
})();

/* ---------- los ejercicios con el macaco nuevo ---------- */
const MKD={
  /* press de banca: acostado (cabeza a la izquierda), la barra baja vertical al pecho y sube sobre los hombros; pies apoyados */
  bench:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[12,90,47,6]},{t:'post',p:[18,96,18,110]},{t:'post',p:[53,96,53,110]},{t:'bar',at:'Gn'}],
    root:{j:'P',p:[62,85]},
    A:{t:-90,nk:16,n:{s:95,e:5,ab:0,h:30,k:80,a:0}},B:{t:-90,nk:16,n:{s:20,e:100,ab:55,w:-90,h:30,k:80,a:0}},
    ik:{Gn:{A:[36.1,53.3],B:[42.5,78]},An:{to:[82,107.45],flat:1},Af:{to:[78,107.45],flat:1}}},
  /* flexiones con pies elevados: boca abajo (cabeza a la izquierda), puntas en el cajón, manos apoyadas al ancho de hombros, codos a ~45° */
  declpushup:{d:-1,lock:[{u:0,j:'e'}],grip:{t:'apoyo',w:'medio'},handPhi:90,tiptoe:1,
    eq:[{t:'floor'},{t:'block',r:[84,72,30,39]}],
    root:{j:'Tn',p:[95,70.25]},
    A:{t:76,nk:-5,n:{s:85,e:0,ab:0,h:0,k:0,a:-30}},B:{t:65,nk:-5,n:{s:30,e:90,ab:40,h:0,k:0,a:-30}},
    ik:{Wn:[27,108.6],Wf:[27,108.6]}},
  /* curl con barra: de pie, el codo queda quieto al costado y la barra describe un arco alrededor del codo */
  curl:{d:1,grip:{t:'supino',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],
    root:{j:'Tn',p:[66,109.25]},
    A:{t:180,nk:0,n:{s:8,e:8,w:0,h:0,k:3,a:0}},B:{t:180,nk:0,n:{s:12,e:126,w:-10,h:0,k:3,a:0}}},
  /* jalón al pecho: sentado con los muslos bajo el rodillo; el cable baja de la polea y termina en la barra que agarran las manos */
  latpull:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'pocoabierto'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[38,95,28,6]},{t:'post',p:[52,101,52,110]},{t:'post',p:[30,3,100,3]},{t:'post',p:[100,3,100,110]},{t:'roll',p:[71,81.2]},{t:'pulley',p:[57,7],to:'Gn'},{t:'handle',at:'Gn'}],
    root:{j:'P',p:[52,90]},
    A:{t:188,nk:0,n:{s:170,e:10,h:82,k:90,a:0}},B:{t:192,nk:-5,n:{s:20,e:130,ab:30,h:78,k:90,a:0}},
    ik:{Gn:{A:[58.4,29.8],B:[58.5,61]},An:{to:[72,107.45],flat:1},Af:{to:[69,107.45],flat:1}}},
  /* sentadilla con barra: la barra apoyada atrás en los trapecios, pies planos; cadera atrás y rodillas adelante */
  squat:{d:1,lock:[{u:0,j:'k'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',behind:1,at:{rel:'N',bo:[-5,-3]}}],
    root:{j:'Tn',p:[68,109.25]},
    A:{t:180,nk:0,n:{s:0,e:0,w:-60,ab:50,abf:50,h:0,k:2,a:2}},B:{t:140,nk:-10,n:{s:0,e:0,w:-60,ab:50,abf:50,h:122,k:118,a:30}},
    ik:{Gn:{rel:'N',bo:[-5,-3],elbow:'down'},Gf:{rel:'N',bo:[-5,-3],elbow:'down'}}},
  /* dominadas (SW-10, Juan: vista de atrás, para que se lean el ancho del agarre y los codos): abajo colgado con los brazos estirados; arriba el mentón pasa la barra y los codos bajan a los costados del torso; piernas cruzadas */
  pullup:{v:'front',back:1,bentKnees:1,grip:{t:'prono',w:'pocoabierto'},eq:[{t:'pullbar',front:1,p:[26,26,94]}],root:{j:'N',p:{A:[60,53],B:[60,25]}},A:{t:180,tk:1,L:{a:170,e:0,h:4,k:-22},R:{a:170,e:0,h:4,k:-22},ls:{shL:0.55,shR:0.55}},B:{t:180,tk:1,L:{a:30,e:140,h:4,k:-22},R:{a:30,e:140,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaL:0.86,uaR:0.86,faL:0.83,faR:0.83}},ik:{GL:{to:[43,26],elbow:'down'},GR:{to:[77,26],elbow:'down'}},lock:[{u:0,j:'e',sd:['L','R']}]}
};
ESQ.usar(MKD); /* exportPose(id, u) busca acá los ejercicios */
/* texto del agarre para la ficha */
const GRIP_T={prono:'Agarre prono',supino:'Agarre supino',neutro:'Agarre neutro (martillo)',mixto:'Agarre mixto',apoyo:'Manos apoyadas'},GRIP_W={cerrado:'cerrado',medio:'al ancho de los hombros',pocoabierto:'un poco más abierto que los hombros',variable:'las manos se abren y se cierran en el recorrido',abierto:'abierto'};
const gripTxt=g=>g?(GRIP_T[g.t]||'')+(g.w?', '+(GRIP_W[g.w]||g.w):'')+(g.txt?' '+g.txt:''):'';
/* engancha el macaco nuevo a la app: cada ejercicio con definición usa su figura "mk_id" (lo corre de nuevo cada lote que se suma) */
function mkHook(){Object.keys(MKD).forEach(id=>{const D=MKD[id],k='mk_'+id;if(TECH[k])return;const pick=P=>{const o={};for(const j in P)o[j]=P[j].map(v=>Math.round(v*10)/10);return o;};
  /* la técnica sale de la figura vieja del ejercicio (como la busca la app), antes de cambiarla por la nueva */
  const X=XT[id]||{},ex=EX.find(e=>e.id===id),old=ex&&techOf(ex),T0=(old&&!/^mk_/.test(old)&&TECH[old])||TECH[X.k]||TECH[id]||{};TECH[k]={eq:['mk'],mk:id,A:pick(MK.frame(D,0).P),B:pick(MK.frame(D,1).P),cues:X.cues||T0.cues,err:X.err||T0.err};XT[id]=Object.assign({},X,{k,cues:X.cues||T0.cues,err:X.err||T0.err});});}
mkHook();
{const techSVG0=techSVG;techSVG=function(k,stat){const T=TECH[k];if(T&&T.mk)return MK.svg(MKD[T.mk],{stat});return techSVG0(k,stat);};}
{const techCard0=techCard;techCard=function(ex){const h=techCard0(ex),D=ex&&MKD[ex.id];return D&&D.grip?h.replace('<h4>Cómo se hace</h4>','<h4>Cómo se hace</h4><p class="tech-grip">'+esc(gripTxt(D.grip))+'</p>'):h;};}
/* SW-11 fase 2: leyenda chica de los músculos pintados (principales en color fuerte, secundarios en suave) */
{const techCard1=techCard;techCard=function(ex){const h=techCard1(ex),D=ex&&MKD[ex.id];if(!D||!h)return h;const M=MK.muscDe(D,ex.id),vis=MK.MVIS[MK.vistaDe(D)],nm=l=>l.filter(m=>vis.includes(m)).map(m=>MUSC[m]||m).join(', ');
  const p=nm(M.p),q=nm(M.s);if(!p&&!q)return h;const leg='<p class="tech-leg">'+(p?'<span><i class="lp"></i>'+esc(p)+'</span>':'')+(q?'<span><i class="ls"></i>'+esc(q)+'</span>':'')+'</p>';
  return h.replace('<h4>Cómo se hace</h4>','<h4>Cómo se hace</h4>'+leg);};}
