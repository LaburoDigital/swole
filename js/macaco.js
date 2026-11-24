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
  const LEN={t:30,nk:9,ua:14,fa:13,hd:5,th:20,sh:19,ft:8,heel:2.5,sole:1.8},HEAD=7.5,FLOOR=111;
  /* Rangos de movimiento normales (AAOS, "Joint Motion: Method of Measuring and Recording"; Norkin y White, "Measurement of Joint Motion").
     Rodilla y tobillo en sentadilla profunda: Hemmerich y otros 2006 (rodilla hasta ~155°, dorsiflexión con carga hasta ~40°).
     Muñeca: la mano apoyada en el piso pide ~90° de extensión, con los dedos hacia adelante o hacia atrás (por eso ±95). De frente: abducción de hombro 180 y aducción 40,
     abducción de cadera 45 (60 con la pelvis) y aducción 30. */
  const LIM={s:[-60,180],e:[0,150],w:[-95,95],h:[-30,135],k:[0,155],a:[-50,40],nk:[-45,50],ab:[0,80],abf:[0,80],lt:[0,80],el:[0,5],
    fa:[-40,180],fe:[-150,150],fh:[-30,60],fk:[-155,155]};
  const rad=x=>x*Math.PI/180,deg=x=>x*180/Math.PI,nrm=a=>{a=((a+180)%360+360)%360-180;return a===-180?180:a;};
  const V=(f,d)=>[d*Math.sin(rad(f)),Math.cos(rad(f))],add=(p,v,l)=>[p[0]+v[0]*l,p[1]+v[1]*l],phi=(v,d)=>deg(Math.atan2(d*v[0],v[1])),dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  const lerp=(a,b,u)=>a+(b-a)*u,lp=(a,b,u)=>[lerp(a[0],b[0],u),lerp(a[1],b[1],u)],ease=u=>u*u*(3-2*u);
  const SIDE=['s','e','w','ab','abf','lt','el','h','k','a'],FSIDE=['a','e','h','k'],FTOP=['t','nk','tw','sw','tk'];
  /* ángulos de una pose a un instante u (0 = A, 1 = B) */
  function angAt(D,u){if(D.M){const h=u<.5;return angAt(Object.assign({},D,{A:h?D.A:D.M,B:h?D.M:D.B,M:null}),h?u*2:(u-.5)*2);} /* M: pose intermedia (A → M → B) */
    const A=D.A,B=D.B;
    if(D.v==='front'){const o={};FTOP.forEach(k=>{const dv=k==='sw'||k==='tk'?1:k==='t'?180:0;o[k]=lerp(A[k]!=null?A[k]:dv,B[k]!=null?B[k]:(A[k]!=null?A[k]:dv),u);});
      for(const sd of ['L','R']){const a=Object.assign({},A.x,A[sd]),b=Object.assign({},a,B.x,B[sd]);o[sd]={};FSIDE.forEach(k=>o[sd][k]=lerp(a[k]||0,b[k]||0,u));}
      const la=A.ls||{},lb=B.ls||la;o.ls={};new Set(Object.keys(la).concat(Object.keys(lb))).forEach(k=>o.ls[k]=lerp(la[k]!=null?la[k]:1,lb[k]!=null?lb[k]:1,u));return o;}
    const o={t:lerp(A.t,B.t,u),nk:lerp(A.nk||0,B.nk!=null?B.nk:(A.nk||0),u)};
    for(const sd of ['n','f']){const a=Object.assign({},A.n,A[sd]),b=Object.assign({},a,B.n,B[sd]);o[sd]={};SIDE.forEach(k=>o[sd][k]=lerp(a[k]||0,b[k]||0,u));}return o;}
  /* punto de contacto: fijo, que va de A a B, o pegado al cuerpo (bo = [adelante, arriba] medidos sobre el torso) */
  function target(T,u,P,R){if(!T)return null;if(Array.isArray(T))return T;if(T.A&&T.M)return u<.5?lp(T.A,T.M,u*2):lp(T.M,T.B,(u-.5)*2); /* M: punto intermedio (la barra rodea la cara) */
    if(T.A)return lp(T.A,T.B,u);
    if(T.rel){const q=P[T.rel];if(!q)return null;if(T.bo&&R){const t=R.phi.t,a=V(t-90,R.d),b=V(t,R.d);return[q[0]+a[0]*T.bo[0]+b[0]*T.bo[1],q[1]+a[1]*T.bo[0]+b[1]*T.bo[1]];}const o=T.off||[0,0];return[q[0]+o[0],q[1]+o[1]];}return null;}
  /* ---------- de costado: cinemática directa desde la cadera ---------- */
  function fkSide(D,g){
    const d=D.d,P={},R={d,ang:g,v:'side'};P.P=[0,0];const ft=g.t;P.N=add(P.P,V(ft,d),LEN.t);P.H=add(P.N,V(ft-g.nk,d),LEN.nk);R.phi={t:ft,hd:ft-g.nk};
    /* el lado lejano, apenas corrido hacia atrás y arriba para que se vea */
    const off=[-3*d,-2.2],offH=[-3*d,0],foot=(A,fo)=>[add(add(A,V(fo,d),LEN.ft),V(fo-90,d),LEN.sole),add(add(A,V(fo+180,d),LEN.heel),V(fo-90,d),LEN.sole)];R.foot=foot;
    for(const sd of ['n','f']){const q=g[sd],S=sd==='f'?add(P.N,off,1):P.N,Hp=sd==='f'?add(P.P,offH,1):P.P,cf=Math.cos(rad(q.abf)),ct=Math.cos(rad(q.lt)),u=ft-180+q.s,f=u+q.e,h=f+q.w,th=ft-180+q.h,sh=th-q.k,fo=sh+90+q.a;
      const S2=add(S,V(ft,d),q.el);P['S'+sd]=S2;P['Hp'+sd]=Hp;P['E'+sd]=add(S2,V(u,d),LEN.ua*Math.cos(rad(q.ab)));P['W'+sd]=add(P['E'+sd],V(f,d),LEN.fa*cf);P['G'+sd]=add(P['W'+sd],V(h,d),LEN.hd*cf);
      P['K'+sd]=add(Hp,V(th,d),LEN.th*ct);P['A'+sd]=add(P['K'+sd],V(sh,d),LEN.sh);[P['T'+sd],P['L'+sd]]=foot(P['A'+sd],fo);
      R.phi[sd]={u,f,h,th,sh,fo};}
    R.P=P;return R;}
  /* ---------- de frente ---------- */
  const VF=f=>V(f,1),phF=v=>phi(v,1);
  function lsOf(g,seg,sd){const l=g.ls||{};return l[seg+sd]!=null?l[seg+sd]:l[seg]!=null?l[seg]:1;}
  function fkFront(D,g){const P={},R={d:1,ang:g,v:'front',phi:{}};P.P=[0,0];P.N=add(P.P,VF(g.t),LEN.t*g.tk);const up=VF(g.t+180);
    P.H=[P.N[0]+g.tw+up[0]*0,P.N[1]-LEN.nk];P.H=add([P.N[0]+g.tw,P.N[1]],VF(g.t-g.nk),LEN.nk);
    /* el cuerpo de frente puede estar inclinado (plancha lateral): hombros, caderas y miembros giran con el torso (rt) */
    const rt=g.t-180,ro=(v)=>{const c=Math.cos(rad(-rt)),s=Math.sin(rad(-rt));return[v[0]*c-v[1]*s,v[0]*s+v[1]*c];},ad=(p,v)=>{const w=ro(v);return[p[0]+w[0],p[1]+w[1]];};R.rot=rt;
    P.SL=ad(P.N,[-9*g.sw+g.tw,3]);P.SR=ad(P.N,[9*g.sw+g.tw,3]);P.HL=ad(P.P,[-5,0]);P.HR=ad(P.P,[5,0]);
    for(const sd of ['L','R']){const m=sd==='L'?-1:1,q=g[sd],fu=m*q.a+rt,ff=m*(q.a+q.e)+rt,fth=m*q.h+rt,fsh=m*(q.h+q.k)+rt;
      P['E'+sd]=add(P['S'+sd],VF(fu),LEN.ua*lsOf(g,'ua',sd));P['W'+sd]=add(P['E'+sd],VF(ff),LEN.fa*lsOf(g,'fa',sd));P['G'+sd]=add(P['W'+sd],VF(ff),4*lsOf(g,'fa',sd));
      P['K'+sd]=add(P['H'+sd],VF(fth),LEN.th*lsOf(g,'th',sd));P['A'+sd]=add(P['K'+sd],VF(fsh),LEN.sh*lsOf(g,'sh',sd));
      P['T'+sd]=ad(P['A'+sd],[m*3.2,LEN.sole]);P['L'+sd]=ad(P['A'+sd],[-m*1.2,LEN.sole]);
      R.phi[sd]={u:fu,f:ff,th:fth,sh:fsh};}
    R.P=P;return R;}
  /* cinemática inversa de 2 huesos: el codo o la rodilla doblan solo para su lado */
  function solve2(S,Q,L1,L2,d,pref,isKnee,lim){const D=[Q[0]-S[0],Q[1]-S[1]],L=Math.max(1e-6,Math.hypot(D[0],D[1])),c=Math.max(-1,Math.min(1,(L1*L1+L*L-L2*L2)/(2*L1*Math.min(L,L1+L2)))),al=deg(Math.acos(c)),fD=phi(D,d);
    const opts=[fD+al,fD-al].map(f1=>{const E=add(S,V(f1,d),L1),f2=phi([Q[0]-E[0],Q[1]-E[1]],d),j=isKnee?nrm(f1-f2):nrm(f2-f1);return{f1,f2,E,j};});
    lim=lim||(isKnee?LIM.k:LIM.e);const bad=o=>o.j<lim[0]?lim[0]-o.j:o.j>lim[1]?o.j-lim[1]:0;
    if(pref==='down')opts.sort((a,b)=>b.E[1]-a.E[1]);else if(pref==='up')opts.sort((a,b)=>a.E[1]-b.E[1]);else if(pref==='out'||pref==='in'){const cx=(S[0]+Q[0])/2,dir=pref==='out'?1:-1;opts.sort((a,b)=>dir*(Math.abs(b.E[0]-cx+(b.E[0]-cx>0?0:0))-Math.abs(a.E[0]-cx)));opts.sort((a,b)=>dir*((b.E[0]-S[0])*Math.sign(S[0]-60||1)-(a.E[0]-S[0])*Math.sign(S[0]-60||1)));}
    else if(pref==='back'||pref==='fwd'){const s=pref==='fwd'?1:-1;opts.sort((a,b)=>s*(b.E[0]-a.E[0])*d);}else opts.sort((a,b)=>bad(a)-bad(b));return opts[0];}
  function ikArm(R,sd,Q,mode,D,g,spec){const pref=spec&&spec.elbow,P=R.P,d=R.d;
    if(R.v==='front'){const L1=LEN.ua*lsOf(g,'ua',sd),L2=(LEN.fa+4)*lsOf(g,'fa',sd),o=solve2(P['S'+sd],Q,L1,L2,1,pref||'out',false,[-180,180]);
      P['E'+sd]=o.E;P['W'+sd]=add(o.E,VF(o.f2),LEN.fa*lsOf(g,'fa',sd));P['G'+sd]=add(P['W'+sd],VF(o.f2),4*lsOf(g,'fa',sd));R.phi[sd].u=o.f1;R.phi[sd].f=o.f2;return;}
    const q=g[sd],S=P['S'+sd],L1=LEN.ua*Math.cos(rad(q.ab)),cf=Math.cos(rad(q.abf)),FA=LEN.fa*cf,HD=LEN.hd*cf;
    if(mode==='W'){/* la muñeca en el punto (manos apoyadas): la mano queda en el ángulo que pida la pose */
      const o=solve2(S,Q,L1,FA,d,pref);P['E'+sd]=o.E;P['W'+sd]=add(o.E,V(o.f2,d),FA);const hf=(spec&&spec.hand!=null)?spec.hand:D.handPhi!=null?D.handPhi:o.f2+q.w;P['G'+sd]=add(P['W'+sd],V(hf,d),HD);R.phi[sd].u=o.f1;R.phi[sd].f=o.f2;R.phi[sd].h=hf;return;}
    const z=[FA+HD*Math.cos(rad(q.w)),HD*Math.sin(rad(q.w))],L2=Math.hypot(z[0],z[1]),dl=deg(Math.atan2(z[1],z[0]));
    const o=solve2(S,Q,L1,L2,d,pref),ff=o.f2-dl;P['E'+sd]=o.E;P['W'+sd]=add(o.E,V(ff,d),FA);P['G'+sd]=add(P['W'+sd],V(ff+q.w,d),HD);R.phi[sd].u=o.f1;R.phi[sd].f=ff;R.phi[sd].h=ff+q.w;}
  function ikLeg(R,sd,Q,spec,g){const P=R.P,d=R.d,flat=spec&&spec.flat,pref=spec&&spec.knee;
    if(R.v==='front'){const L1=LEN.th*lsOf(g,'th',sd),L2=LEN.sh*lsOf(g,'sh',sd),o=solve2(P['H'+sd],Q,L1,L2,1,pref||'out',false,[-180,180]),m=sd==='L'?-1:1;
      P['K'+sd]=o.E;P['A'+sd]=add(o.E,VF(o.f2),L2);P['T'+sd]=add(add(P['A'+sd],[m,0],3.2),[0,1],LEN.sole);P['L'+sd]=add(add(P['A'+sd],[-m,0],1.2),[0,1],LEN.sole);R.phi[sd].th=o.f1;R.phi[sd].sh=o.f2;return;}
    const ct=Math.cos(rad(g[sd].lt)),Hp=P['Hp'+sd],o=solve2(Hp,Q,LEN.th*ct,LEN.sh,d,pref,true);P['K'+sd]=o.E;P['A'+sd]=add(o.E,V(o.f2,d),LEN.sh);
    let fo=o.f2+90+g[sd].a;if(flat){const c=[90,-90].map(x=>({x,a:nrm(x-o.f2-90)})).sort((p,r)=>Math.abs(p.a)-Math.abs(r.a));fo=c[0].x;}
    [P['T'+sd],P['L'+sd]]=R.foot(P['A'+sd],fo);R.phi[sd].th=o.f1;R.phi[sd].sh=o.f2;R.phi[sd].fo=fo;}
  /* un cuadro completo en el instante u (0..1, ya con la curva suave) */
  function frame(D,u){const g=angAt(D,u),R=D.v==='front'?fkFront(D,g):fkSide(D,g),P=R.P,pin=D.root,pp=target(pin.p,u,P,R),q=P[pin.j],dx=pp[0]-q[0],dy=pp[1]-q[1];
    for(const k in P)P[k]=[P[k][0]+dx,P[k][1]+dy];
    /* pies planos sin cinemática inversa (de costado): el tobillo acomoda el pie paralelo al piso */
    const ik=Object.assign({},D.ik||{});
    if(D.v!=='front'&&!D.uni)for(const k of Object.keys(ik))if(k.slice(-1)==='n'){const kf=k.slice(0,-1)+'f',sf=ik[kf]&&ik[kf].own;if(!sf){const sp=ik[k].to?ik[k]:{to:ik[k]},o=(k[0]==='A'||k[0]==='T')?[-3*R.d,0]:[-3*R.d,-2.2];ik[kf]=Object.assign({},sp,{to:{rel:'__',fn:(Q)=>[Q[0]+o[0],Q[1]+o[1]],src:sp.to}});}}
    for(const k in ik){if(ik[k]==null)continue;const sp=ik[k].to?ik[k]:{to:ik[k]},Q=sp.to&&sp.to.rel==='__'?(q=>q&&sp.to.fn(q))(target(sp.to.src,u,P,R)):target(sp.to,u,P,R);if(!Q)continue;const sd=k.slice(-1),j=k[0];
      if(j==='G'||j==='W')ikArm(R,sd,Q,j,D,g,sp);else if(j==='A')ikLeg(R,sd,Q,sp,g);
      else if(j==='T'){/* punta del pie en el punto (en puntas de pie): se ajusta el tobillo en tres pasadas */let A=[Q[0]-3*R.d,Q[1]-6];for(let it=0;it<4;it++){ikLeg(R,sd,A,{},g);const T=R.P['T'+sd];A=[A[0]+Q[0]-T[0],A[1]+Q[1]-T[1]];}ikLeg(R,sd,A,{},g);}
      R.tg=R.tg||{};R.tg[k]=Q;}
    R.eq=(D.eq||[]).map(e=>Object.assign({},e,{at:e.at!=null?(typeof e.at==='string'?P[e.at]:target(e.at,u,P,R)):null}));
    R.u=u;R.g=g;return R;}
  /* ángulos reales de un cuadro (después de la cinemática inversa), para el validador */
  function angles(R){if(R.v==='front'){const o={};for(const sd of ['L','R']){const m=sd==='L'?-1:1,q=R.phi[sd];const rt=R.rot||0,w=x=>{x=nrm(x);return x<-90?x+360:x;},ua=w(m*(q.u-rt)),fa=w(m*(q.f-rt)),th=nrm(m*(q.th-rt)),sh=nrm(m*(q.sh-rt));o[sd]={a:ua,e:nrm(fa-ua),h:th,k:nrm(sh-th)};}return o;}
    const p=R.phi,t=p.t,o={nk:nrm(t-p.hd)};for(const sd of ['n','f']){const q=p[sd];o[sd]={s:nrm(q.u-(t-180)),e:nrm(q.f-q.u),w:nrm(q.h-q.f),h:nrm(q.th-(t-180)),k:nrm(q.th-q.sh),a:nrm(q.fo-q.sh-90),ab:R.g[sd].ab,abf:R.g[sd].abf,lt:R.g[sd].lt,el:R.g[sd].el};}return o;}
  const N=12,frames=D=>{const out=[];for(let i=0;i<=N;i++)out.push(frame(D,ease(i/N)));return out;};
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
  function limbs(F,sd,one){return seg(F,'Hp'+sd,'K'+sd,'mk-th',6.5,one)+seg(F,'K'+sd,'A'+sd,'mk-sh',5.5,one)+seg(F,'L'+sd,'T'+sd,'mk-ft',3.5,one);}
  function arm(F,sd,one){return seg(F,'S'+sd,'E'+sd,'mk-ua',5.5,one)+seg(F,'E'+sd,'W'+sd,'mk-fa',4.8,one)+seg(F,'W'+sd,'G'+sd,'mk-hd',4.2,one);}
  function limbsF(F,sd,one){return seg(F,'H'+sd,'K'+sd,'mk-th',6.5,one)+seg(F,'K'+sd,'A'+sd,'mk-sh',5.5,one)+seg(F,'L'+sd,'T'+sd,'mk-ft',3.5,one);}
  function armF(F,sd,one){return seg(F,'S'+sd,'E'+sd,'mk-ua',5.5,one)+seg(F,'E'+sd,'W'+sd,'mk-fa',4.8,one)+seg(F,'W'+sd,'G'+sd,'mk-hd',4.2,one);}
  /* agarre visto de frente, con su nombre: dorso oscuro (prono), palma clara (supino), manijas paradas (neutro) o manos apoyadas */
  const GW={cerrado:7,medio:10,abierto:13},GN={prono:'Prono',supino:'Supino',neutro:'Neutro',mixto:'Mixto',apoyo:'Apoyadas'};
  function gripGlyph(gr,box){if(!gr)return '';box=box||{x:2,y:2,s:1};const w=GW[gr.w]||10,cx=19,hand=(x,t)=>{const pal=t==='supino',neu=t==='neutro',sgn=x<cx?-1:1;
      if(t==='apoyo')return '<rect class="mk-gp" x="'+(x-3.4)+'" y="10" width="6.8" height="5.4" rx="1.8"/><line class="mk-gt" x1="'+(x+3.4*-sgn)+'" y1="13" x2="'+(x+5.8*-sgn)+'" y2="11"/>';
      if(neu)return '<line class="mk-gb" x1="'+x+'" y1="3" x2="'+x+'" y2="16"/><rect class="mk-gd" x="'+(x-3)+'" y="5.8" width="6" height="8" rx="1.8"/><line class="mk-gt" x1="'+x+'" y1="6" x2="'+x+'" y2="3.4"/>';
      return '<rect class="'+(pal?'mk-gp':'mk-gd')+'" x="'+(x-3.2)+'" y="5" width="6.4" height="9" rx="2"/>'+(pal?'':'<line class="mk-gk" x1="'+(x-2.3)+'" y1="7" x2="'+(x+2.3)+'" y2="7"/>')+
        '<line class="mk-gt" x1="'+(x+sgn*(pal?3.2:-3.2))+'" y1="10.6" x2="'+(x+sgn*(pal?5.8:-5.4))+'" y2="'+(pal?8.4:9)+'"/>';};
    const tl=gr.t==='mixto'?['prono','supino']:[gr.t,gr.t],dbs=gr.db&&gr.t!=='neutro'?[cx-w,cx+w].map(x=>'<line class="mk-gb" x1="'+(x-6.5)+'" y1="9.5" x2="'+(x+6.5)+'" y2="9.5"/><rect class="mk-gw" x="'+(x-8)+'" y="6.5" width="2.4" height="6" rx=".8"/><rect class="mk-gw" x="'+(x+5.6)+'" y="6.5" width="2.4" height="6" rx=".8"/>').join(''):'';
    return '<g class="mk-grip" transform="translate('+f1(box.x)+' '+f1(box.y)+') scale('+box.s+')"><rect class="mk-gbg" x="0" y="0" width="38" height="26" rx="4"/>'+(gr.t==='neutro'||gr.t==='apoyo'||gr.db?dbs:'<line class="mk-gb" x1="3" y1="9.5" x2="35" y2="9.5"/>')+(gr.t==='apoyo'?'<line class="mk-gb" x1="3" y1="16" x2="35" y2="16"/>':'')+
      hand(cx-w,tl[0])+hand(cx+w,tl[1])+'<text class="mk-gl" x="19" y="23.2" text-anchor="middle">'+(GN[gr.t]||'')+'</text></g>';}
  /* ---------- equipo ---------- */
  function hexDb(F,at,one,rot){const g=k=>R=>f1(pt(R,at)[k]),x=g(0)(F[0]),y=g(1)(F[0]);
    const anT=one?'':(()=>{const v=seq(F,R=>g(0)(R)+' '+g(1)(R));return v.every(s=>s===v[0])?'':'<animateTransform attributeName="transform" type="translate" values="'+v.join(';')+'" keyTimes="'+kt()+'" dur="2.8s" repeatCount="indefinite"/>';})();
    const body=rot!=null?'<g transform="rotate('+rot+')"><rect class="tq-dbh" x="-5.5" y="-1.1" width="11" height="2.2" rx="1.1"/><rect class="tq-plate" x="-8.5" y="-4.6" width="3.6" height="9.2" rx="1.3"/><rect class="tq-plate" x="4.9" y="-4.6" width="3.6" height="9.2" rx="1.3"/></g>'
      :'<polygon class="tq-plate" points="4.6,0 2.3,4 -2.3,4 -4.6,0 -2.3,-4 2.3,-4"/><circle class="tq-hub" r="1.4"/>';
    return '<g transform="translate('+x+' '+y+')">'+anT+body+'</g>';}
  /* soporte en diagonal de la barra fija (mount:'d'): sube a 45° hacia adelante, lejos del cuerpo que pasa por encima de la barra */
  function strut(p){const k=Math.min(p[1]-2,116-p[0]);return [p[0]+k,p[1]-k];}
  function eqSVG(F,D,one,layer){let h='';(D.eq||[]).forEach((e,i)=>{const at=R=>R.eq[i].at,L=e.layer||(['bar','db','kb','ball','handle','ring','pad'].includes(e.t)?(e.behind?'back2':'mid'):'back');if(L!==layer)return;
      switch(e.t){
        case 'floor':h+='<line class="tq-floor" x1="4" y1="'+FLOOR+'" x2="116" y2="'+FLOOR+'"/>';break;
        case 'block':h+='<rect class="tq-eq" x="'+e.r[0]+'" y="'+e.r[1]+'" width="'+e.r[2]+'" height="'+e.r[3]+'" rx="2.5"/>';break;
        case 'wall':h+='<rect class="tq-wall" x="'+e.r[0]+'" y="'+e.r[1]+'" width="'+e.r[2]+'" height="'+e.r[3]+'" rx="2"/>';break;
        case 'post':h+='<line class="tq-'+(e.pad?'pad':'eq')+'" x1="'+e.p[0]+'" y1="'+e.p[1]+'" x2="'+e.p[2]+'" y2="'+e.p[3]+'"/>';break;
        case 'pullbar':h+=(e.mount==='d'?(()=>{const q=strut(e.p);return '<line class="tq-eq" x1="'+(e.p[0]+1.85)+'" y1="'+(e.p[1]-1.85)+'" x2="'+q[0]+'" y2="'+q[1]+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>';})():e.mount==='h'?'<line class="tq-eq" x1="4" y1="'+e.p[1]+'" x2="'+(e.p[0]-2.6)+'" y2="'+e.p[1]+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>':e.front?'<line class="tq-eq" x1="'+e.p[0]+'" y1="'+e.p[1]+'" x2="'+e.p[2]+'" y2="'+e.p[1]+'"/>':'<line class="tq-eq" x1="'+e.p[0]+'" y1="2" x2="'+e.p[0]+'" y2="'+(e.p[1]-2.5)+'"/><circle class="tq-eq" cx="'+e.p[0]+'" cy="'+e.p[1]+'" r="2.6"/>');break;
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
        case 'bar':h+=dot(F,at,6.5,'tq-plate',one)+dot(F,at,2,'tq-hub',one);break;
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
      case 'pullbar':if(e.mount==='d'){sg(e.p,strut(e.p),3);ci(e.p,2.6);}else if(e.mount==='h'){sg([4,e.p[1]],e.p,3);ci(e.p,2.6);}else if(e.front)sg([e.p[0],e.p[1]],[e.p[2],e.p[1]],3);else{sg([e.p[0],2],[e.p[0],e.p[1]],3);ci(e.p,2.6);}break;case 'roll':ci(e.p,4.6);break;
      case 'pulley':ci(e.p,3.2);sg(e.p,P[e.to],1.6);break;case 'lever':sg(e.pv,P[e.to],4);ci(e.pv,3.5);if(e.stand)sg(e.pv,[e.stand,110],3);break;
      case 'plat':ci(P[e.to],e.len||9);break;case 'tbench':sg(P.N,P.P,24);break;case 'rope':sg(P.GL,[60,(e.y[0]+e.y[1])/2],2);sg(P.GR,[60,(e.y[0]+e.y[1])/2],2);sg([60,e.y[0]],[60,e.y[1]],2);break;
      case 'bar':ci(at,6.5);break;case 'db':ci(at,e.rot!=null?8.5:4.6);break;case 'kb':ci(at,6);break;case 'ball':ci(at,7);break;case 'handle':ci(at,2.4);break;case 'pad':ci(at,e.r||4.6);break;
      case 'ring':if(at){ci([at[0],at[1]-3.5],3.5);sg([at[0]-2,0],[at[0],at[1]-7],1.6);}break;}});return S;}
  const segBox=(a,b,x0,y0,x1,y1)=>{for(let i=0;i<=20;i++){const t=i/20,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;if(x>=x0&&x<=x1&&y>=y0&&y<=y1)return true;}return false;};
  function hits(S,b,pad){const [x0,y0,x1,y1]=[b[0]-pad,b[1]-pad,b[0]+b[2]+pad,b[1]+b[3]+pad];return S.some(o=>{
    if(o.q)return !(o.q[0]>x1||o.q[0]+o.q[2]<x0||o.q[1]>y1||o.q[1]+o.q[3]<y0);
    if(o.c){const cx=Math.max(x0,Math.min(o.c[0],x1)),cy=Math.max(y0,Math.min(o.c[1],y1));return Math.hypot(o.c[0]-cx,o.c[1]-cy)<o.r;}
    return segBox(o.s[0],o.s[1],x0-o.r,y0-o.r,x1+o.r,y1+o.r);});}
  /* busca esquina (arriba izq., arriba der., abajo izq., abajo der.) y tamaño (100 %, 80 %, 65 %) donde el recuadro no tape nada */
  const GB={};function gripBox(D){if(!D.grip)return null;const key=JSON.stringify([D.A,D.M,D.B,D.ik,D.eq,D.root]);if(GB[key]!==undefined)return GB[key];
    const SS=[];for(let i=0;i<=20;i++)SS.push(...shapes(D,frame(D,i/20)));let res=null;
    for(const s of [1,.8,.65]){const w=38*s,h=26*s;for(const [x,y] of [[2,2],[118-w,2],[2,108-h],[118-w,108-h],[60-w/2,2]])if(!hits(SS,[x,y,w,h],.5)){res={x,y,s};break;}if(res)break;}
    return GB[key]=res;}
  function svg(D,opt){opt=opt||{};const one=opt.u!=null||opt.stat,F=one?[frame(D,ease(opt.u||0))]:frames(D),fr=D.v==='front';FWD=!one&&!!D.fwd;try{
    const body=fr?'<g class="mk-far">'+limbsF(F,'L',one)+'</g>'+'<g class="mk-near">'+limbsF(F,'R',one)+'</g>'+eqSVG(F,D,one,'back2')+'<g class="mk-near">'+seg(F,'P','N','mk-tr',11,one)+'</g>'+dot(F,'H',HEAD,'tq-h',one)+
        '<g class="mk-far">'+armF(F,'L',one)+'</g><g class="mk-near">'+armF(F,'R',one)+dot(F,'ER',2,'tq-j',one)+dot(F,'EL',2,'tq-j',one)+'</g>'
      :eqSVG(F,D,one,'back2')+'<g class="mk-far">'+limbs(F,'f',one)+arm(F,'f',one)+'</g>'+eqSVG(F,D,one,'mid')+
        '<g class="mk-near">'+seg(F,'P','N','mk-tr',10,one)+limbs(F,'n',one)+dot(F,'Kn',2.2,'tq-j',one)+'</g>'+(D.headFront?'':dot(F,'H',HEAD,'tq-h',one))+'<g class="mk-near">'+arm(F,'n',one)+dot(F,'En',2,'tq-j',one)+'</g>'+(D.headFront?dot(F,'H',HEAD,'tq-h',one):''); /* headFront: las manos pasan detrás de la cabeza */
    return '<svg class="tq mk'+(one?' st':'')+'" viewBox="0 0 120 120" role="img" aria-label="Cómo se hace">'+eqSVG(F,D,one,'back')+(FWD?'<g><animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;.8;.86;.9;1" dur="2.8s" repeatCount="indefinite"/>':'')+shadow(F,D,one)+body+(FWD?'</g>':'')+(fr?eqSVG(F,D,one,'mid'):eqSVG(F,D,one,'top'))+
      (opt.noGrip?'':gripGlyph(D.grip,gripBox(D)))+'</svg>';}finally{FWD=false;}}
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
      if(fr){for(const sd of SDS){const q=g[sd],esc=s=>lsOf(R.g,s,sd)<.6;[['a','fa','hombro',0,'ua'],['e','fe','codo',0,'ua'],['h','fh','cadera',1,'th'],['k','fk','rodilla',1,'th']].forEach(([k,l,n,fem,sg])=>{if(esc(sg))return;const v=q[k],L=(D.lim&&D.lim[l])||LIM[l];if(v<L[0]-.5||v>L[1]+.5)add1(n+lado(sd,fem)+' fuera de rango ('+Math.round(v)+'°) en '+pc);});}}
      else{if(g.nk<LIM.nk[0]-.5||g.nk>LIM.nk[1]+.5)add1('cuello fuera de rango ('+Math.round(g.nk)+'°) en '+pc);
        for(const sd of SDS)for(const k of ['s','e','w','h','k','a','ab','abf','lt','el']){if('sew'.includes(k)&&g[sd].ab>=45)continue;const v=g[sd][k],L=(D.lim&&D.lim[k])||LIM[k]; /* lim: rango propio de un ejercicio, con su motivo en la definición */if(v<L[0]-.5||v>L[1]+.5)add1({s:'hombro',e:'codo',w:'muñeca',h:'cadera',k:'rodilla',a:'tobillo',ab:'apertura del brazo',abf:'apertura del antebrazo',lt:'apertura del muslo',el:'elevación del hombro'}[k]+lado(sd,['w','h','k','ab','abf','lt'].includes(k))+' fuera de rango ('+Math.round(v)+'°) en '+pc);}}
      /* 1b. bilateral: los dos lados con los mismos ángulos (salvo ejercicios a una mano o pierna, o alternados: uni) */
      if(!D.uni){const ks=fr?['a','e','h','k']:['s','e','h','k','a'],[x,y]=fr?['L','R']:['n','f'];ks.forEach(k=>{const dv=Math.abs(nrm(g[x][k]-g[y][k]));if(dv>6)add1({s:'brazo',a:'brazo',e:'codo',h:'muslo',k:'rodilla'}[k]+(fr?' derecho distinto del izquierdo':' lejano distinto del cercano')+' ('+Math.round(dv)+'°) en '+pc);});}
      /* 1d. de frente y de pie: la rodilla en la línea cadera–pie (sin piernas en O), salvo rodillas dobladas declaradas (bentKnees) */
      if(fr&&!D.bentKnees)for(const sd of SDS){const H=P['H'+sd],A=P['A'+sd],K=P['K'+sd],v=[A[0]-H[0],A[1]-H[1]],l=Math.hypot(v[0],v[1])||1,dk=Math.abs((K[0]-H[0])*v[1]-(K[1]-H[1])*v[0])/l;if(dk>1.5)add1('la rodilla'+lado(sd,1)+' se sale de la línea cadera–pie ('+dk.toFixed(1)+') en '+pc);}
      /* 1c. al final de un empuje o una extensión el codo o la rodilla llegan casi estirados (≥165°): lock = [{u:0|1, j:'e'|'k'}].
         En las posiciones isométricas de brazos estirados (planches, banderas, levers, vertical, soportes) u:'all' lo exige en todo el recorrido;
         sd elige los lados (por defecto los dos, o solo el cercano si es unilateral) */
      (D.lock||[]).forEach(L=>{const all=L.u==='all';if(!all&&Math.abs(u-L.u)>.001)return;for(const sd of (L.sd||(D.uni?SDS.slice(0,1):SDS))){const v=Math.abs(g[sd][L.j]);if(v>15.5)add1((L.j==='e'?'el codo':'la rodilla')+lado(sd,L.j!=='e')+(all?' no está estirado':' no llega a estirarse al final')+' ('+Math.round(180-v)+'°) en '+pc);}});
      /* 2. huesos con largo fijo (el escorzo achica lo que se ve, no el hueso) */
      for(const sd of SDS){let L;if(fr){const ls=(s)=>lsOf(R.g,s,sd);L=[['S','E',LEN.ua*ls('ua'),'brazo'],['E','W',LEN.fa*ls('fa'),'antebrazo'],['H','K',LEN.th*ls('th'),'muslo'],['K','A',LEN.sh*ls('sh'),'pierna']];}
        else{const q=R.g[sd],cf=Math.cos(rad(q.abf));L=[['S','E',LEN.ua*Math.cos(rad(q.ab)),'brazo'],['E','W',LEN.fa*cf,'antebrazo'],['W','G',LEN.hd*cf,'mano'],['Hp','K',LEN.th*Math.cos(rad(q.lt)),'muslo'],['K','A',LEN.sh,'pierna'],['A','T',Math.hypot(LEN.ft,LEN.sole),'pie']];}
        L.forEach(([a,b,l,n])=>{if(Math.abs(dist(P[a+sd],P[b+sd])-l)>.15)add1(n+' cambia de largo en '+pc);});}
      if(!fr&&Math.abs(dist(P.P,P.N)-LEN.t)>.15)add1('torso cambia de largo en '+pc);
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
        if(['bar','db','kb','ball','handle','pad'].includes(e.t)&&at)dd=dist(at,H)-({bar:7.25,db:e.rot!=null?9.25:5.35,kb:6.75,ball:7.75,handle:3.9,pad:(e.r||4.6)+.75})[e.t]; /* hasta el contorno dibujado (con su aro) */
        else if(e.t==='ring'&&at)dd=dist([at[0],at[1]-3.5],H)-5;
        else if((e.t==='pulley'||e.t==='lever')&&P[e.to]){const a=e.t==='pulley'?e.p:e.pv,b=P[e.to],v=[b[0]-a[0],b[1]-a[1]],L2=v[0]*v[0]+v[1]*v[1]||1,t=Math.max(0,Math.min(1,((H[0]-a[0])*v[0]+(H[1]-a[1])*v[1])/L2));dd=dist(H,[a[0]+v[0]*t,a[1]+v[1]*t])-(e.t==='lever'?1.75:.8);}
        if(dd<lim)add1((NMq[e.t]||'el equipo')+' pasa a menos de 2 de la cabeza en '+pc);});}
    if(D.grip&&!gripBox(D))add1('el recuadro del agarre no tiene una esquina libre: tapa la figura o el equipo en 0%');
    return [...acc].map(([k,ps])=>k+' en '+(ps.length>1?ps[0]+'–'+ps[ps.length-1]:ps[0]));}
  return{LEN,LIM,frame,angles,svg,check,gripGlyph,gripBox,phi,V,nrm};
})();

/* ---------- los ejercicios con el macaco nuevo ---------- */
const MKD={
  /* press de banca: acostado (cabeza a la izquierda), la barra baja vertical al pecho y sube sobre los hombros; pies apoyados */
  bench:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[12,90,47,6]},{t:'post',p:[18,96,18,110]},{t:'post',p:[53,96,53,110]},{t:'bar',at:'Gn'}],
    root:{j:'P',p:[62,85]},
    A:{t:-90,nk:16,n:{s:95,e:5,ab:0,h:30,k:80,a:0}},B:{t:-90,nk:16,n:{s:20,e:100,ab:45,h:30,k:80,a:0}},
    ik:{Gn:{A:[36.1,53.3],B:[43,73.5]},An:{to:[82,107.45],flat:1},Af:{to:[78,107.45],flat:1}}},
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
  latpull:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'abierto'},feet:{n:'floor',f:'floor'},
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
  /* dominadas: colgado de la barra, sube hasta pasar el mentón; el cuerpo se mueve, las manos quedan en la barra */
  pullup:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'medio'},
    eq:[{t:'pullbar',p:[60,16]}],
    root:{j:'Gn',p:[60,16]},
    A:{t:182,nk:0,n:{s:172,e:4,w:0,h:0,k:60,a:-20}},B:{t:188,nk:-15,n:{s:0,e:148,w:0,h:12,k:55,a:-20}},
    ik:{Gf:{rel:'Gn',off:[-3,-2.2]}}}
};
/* texto del agarre para la ficha */
const GRIP_T={prono:'Agarre prono',supino:'Agarre supino',neutro:'Agarre neutro (martillo)',mixto:'Agarre mixto',apoyo:'Manos apoyadas'},GRIP_W={cerrado:'cerrado',medio:'al ancho de los hombros',abierto:'abierto'};
const gripTxt=g=>g?(GRIP_T[g.t]||'')+(g.w?', '+(GRIP_W[g.w]||g.w):'')+(g.txt?' '+g.txt:''):'';
/* engancha el macaco nuevo a la app: cada ejercicio con definición usa su figura "mk_id" (lo corre de nuevo cada lote que se suma) */
function mkHook(){Object.keys(MKD).forEach(id=>{const D=MKD[id],k='mk_'+id;if(TECH[k])return;const pick=P=>{const o={};for(const j in P)o[j]=P[j].map(v=>Math.round(v*10)/10);return o;};
  /* la técnica sale de la figura vieja del ejercicio (como la busca la app), antes de cambiarla por la nueva */
  const X=XT[id]||{},ex=EX.find(e=>e.id===id),old=ex&&techOf(ex),T0=(old&&!/^mk_/.test(old)&&TECH[old])||TECH[X.k]||TECH[id]||{};TECH[k]={eq:['mk'],mk:id,A:pick(MK.frame(D,0).P),B:pick(MK.frame(D,1).P),cues:X.cues||T0.cues,err:X.err||T0.err};XT[id]=Object.assign({},X,{k,cues:X.cues||T0.cues,err:X.err||T0.err});});}
mkHook();
{const techSVG0=techSVG;techSVG=function(k,stat){const T=TECH[k];if(T&&T.mk)return MK.svg(MKD[T.mk],{stat});return techSVG0(k,stat);};}
{const techCard0=techCard;techCard=function(ex){const h=techCard0(ex),D=ex&&MKD[ex.id];return D&&D.grip?h.replace('<h4>Cómo se hace</h4>','<h4>Cómo se hace</h4><p class="tech-grip">'+esc(gripTxt(D.grip))+'</p>'):h;};}
