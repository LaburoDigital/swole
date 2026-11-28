'use strict';
/* SW-11 fase 2: el esqueleto del macaco, separado del dibujo (para reusarlo en un juego 3D). Sin DOM: carga en Node y en el navegador.
   Tiene los largos de los huesos, los límites articulares (con fuente), la cinemática directa (de costado y de frente), el IK de 2 huesos,
   las fases y la interpolación. macaco.js dibuja con esto (no duplica la lógica). Al final: los nombres de huesos estándar de humanoide
   y exportPose(id, u). Ver docs/esqueleto.md. */
const ESQ=(()=>{
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
  function angAt(D,u){if(D.fases&&D.fases.length){const K=[{u:0,p:D.A}].concat(D.fases.map(p=>({u:p.u,p})),[{u:1,p:D.B}]);let i=0;while(i<K.length-2&&u>K[i+1].u)i++;const a=K[i],b=K[i+1];
      return angAt(Object.assign({},D,{A:a.p,B:b.p,fases:null,M:null}),Math.max(0,Math.min(1,(u-a.u)/(b.u-a.u))));} /* fases: poses intermedias en orden, cada una en su instante u (A → fase 1 → fase 2 → … → B): el movimiento va por etapas, no todo junto */
    if(D.M){const h=u<.5;return angAt(Object.assign({},D,{A:h?D.A:D.M,B:h?D.M:D.B,M:null}),h?u*2:(u-.5)*2);} /* M: pose intermedia (A → M → B) */
    const A=D.A,B=D.B;
    if(D.v==='front'){const o={};FTOP.forEach(k=>{const dv=k==='sw'||k==='tk'?1:k==='t'?180:0;o[k]=lerp(A[k]!=null?A[k]:dv,B[k]!=null?B[k]:(A[k]!=null?A[k]:dv),u);});
      for(const sd of ['L','R']){const a=Object.assign({},A.x,A[sd]),b=Object.assign({},a,B.x,B[sd]);o[sd]={};FSIDE.forEach(k=>o[sd][k]=lerp(a[k]||0,b[k]||0,u));}
      if(A.rr!=null||B.rr!=null){const ra=A.rr!=null?A.rr:B.rr;o.rr=lerp(ra,B.rr!=null?B.rr:ra,u);}
      const la=A.ls||{},lb=B.ls||la;o.ls={};new Set(Object.keys(la).concat(Object.keys(lb))).forEach(k=>o.ls[k]=lerp(la[k]!=null?la[k]:1,lb[k]!=null?lb[k]:1,u));return o;}
    const o={t:lerp(A.t,B.t,u),nk:lerp(A.nk||0,B.nk!=null?B.nk:(A.nk||0),u),cv:lerp(A.cv||0,B.cv!=null?B.cv:(A.cv||0),u)}; /* cv: la columna redondeada (cuánto se curva la espalda hacia atrás, en unidades del dibujo) */
    for(const sd of ['n','f']){const a=Object.assign({},A.n,A[sd]),b=Object.assign({},a,B.n,B[sd]);o[sd]={};SIDE.forEach(k=>o[sd][k]=lerp(a[k]||0,b[k]||0,u));}return o;}
  /* punto de contacto: fijo, que va de A a B, o pegado al cuerpo (bo = [adelante, arriba] medidos sobre el torso) */
  function target(T,u,P,R){if(!T)return null;if(Array.isArray(T))return T;if(T.seq){const K=T.seq;let i=0;while(i<K.length-2&&u>K[i+1][0])i++;return lp(K[i][1],K[i+1][1],Math.max(0,Math.min(1,(u-K[i][0])/(K[i+1][0]-K[i][0]))));} /* seq: [[u, punto], …] por etapas, a la par de las fases */if(T.A&&T.M)return u<.5?lp(T.A,T.M,u*2):lp(T.M,T.B,(u-.5)*2); /* M: punto intermedio (la barra rodea la cara) */
    if(T.A)return lp(T.A,T.B,u);
    if(T.rel){const q=P[T.rel];if(!q)return null;if(T.bo&&R){const t=R.phi.t,a=V(t-90,R.d),b=V(t,R.d);return[q[0]+a[0]*T.bo[0]+b[0]*T.bo[1],q[1]+a[1]*T.bo[0]+b[1]*T.bo[1]];}const o=T.off||[0,0];return[q[0]+o[0],q[1]+o[1]];}return null;}
  /* largo de cadera a cuello: el torso mide 30 por la columna; si se redondea (cv = flecha del arco), la cuerda se acorta */
  const tLen=cv=>LEN.t-8*(cv||0)*(cv||0)/(3*LEN.t);
  /* ---------- de costado: cinemática directa desde la cadera ---------- */
  function fkSide(D,g){
    const d=D.d,P={},R={d,ang:g,v:'side'};P.P=[0,0];const ft=g.t;P.N=add(P.P,V(ft,d),tLen(g.cv)); /* con la columna redondeada, la cadera y el cuello quedan más cerca (la cuerda del arco) */P.H=add(P.N,V(ft-g.nk,d),LEN.nk);R.phi={t:ft,hd:ft-g.nk};
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
    P.H=[P.N[0]+g.tw+up[0]*0,P.N[1]-LEN.nk];P.H=add([P.N[0]+g.tw,P.N[1]],VF(g.t-g.nk),LEN.nk*(g.ls&&g.ls.nk!=null?g.ls.nk:1)); /* ls.nk: el cuello en escorzo (inclinado hacia quien mira, la cabeza queda delante del pecho) */
    /* el cuerpo de frente puede estar inclinado (plancha lateral): hombros, caderas y miembros giran con el torso (rt) */
    const rt=g.t-180,rr=g.rr!=null?g.rr:rt,hw=g.rr!=null?5*g.sw:5,ro=(v)=>{const c=Math.cos(rad(-rr)),s=Math.sin(rad(-rr));return[v[0]*c-v[1]*s,v[0]*s+v[1]*c];},ad=(p,v)=>{const w=ro(v);return[p[0]+w[0],p[1]+w[1]];};R.rot=rt;
    P.SL=ad(P.N,[-9*g.sw+g.tw,3]);P.SR=ad(P.N,[9*g.sw+g.tw,3]);P.HL=ad(P.P,[-hw,0]);P.HR=ad(P.P,[hw,0]); /* rr: en 3/4 o mirando desde arriba la línea de hombros y caderas va como la proyecta la cámara, no perpendicular al torso dibujado */
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
  /* ---------- huesos estándar de humanoide y exportPose (SW-11 fase 2, para un rig 3D) ----------
     Ejes como glTF: X = izquierda del personaje, Y = arriba, Z = adelante del personaje. Unidades: las del dibujo (el torso mide 30);
     M_POR_U pasa a metros (una persona de 1,75 m). La pose de descanso (todas las rotaciones en cero) es de pie con los brazos al
     costado (pose "I"): columna, cuello y cabeza hacia arriba; brazos y piernas hacia abajo; pies hacia adelante. */
  const M_POR_U=1.75/(2*HEAD+LEN.nk+LEN.t+LEN.th+LEN.sh+LEN.sole+LEN.heel);
  const HUESOS=[['hips',null],['spine','hips'],['chest','spine'],['neck','chest'],['head','neck'],
    ['upperArm.L','chest'],['lowerArm.L','upperArm.L'],['hand.L','lowerArm.L'],['upperArm.R','chest'],['lowerArm.R','upperArm.R'],['hand.R','lowerArm.R'],
    ['upperLeg.L','hips'],['lowerLeg.L','upperLeg.L'],['foot.L','lowerLeg.L'],['upperLeg.R','hips'],['lowerLeg.R','upperLeg.R'],['foot.R','lowerLeg.R']];
  const REPOSO={hips:[0,1,0],spine:[0,1,0],chest:[0,1,0],neck:[0,1,0],head:[0,1,0],upperArm:[0,-1,0],lowerArm:[0,-1,0],hand:[0,-1,0],upperLeg:[0,-1,0],lowerLeg:[0,-1,0],foot:[0,0,1]};
  /* qué ángulo clínico (de angles()) y qué límite (LIM) le corresponde a cada hueso, de costado y de frente */
  const ANG_S={neck:'nk',upperArm:'s',lowerArm:'e',hand:'w',upperLeg:'h',lowerLeg:'k',foot:'a'},ANG_F={upperArm:['a','fa'],lowerArm:['e','fe'],upperLeg:['h','fh'],lowerLeg:['k','fk']};
  const nv=v=>{const l=Math.hypot(v[0],v[1],v[2])||1;return [v[0]/l,v[1]/l,v[2]/l];},cruz=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],pto=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  /* cuaternión [x,y,z,w] que lleva la dirección a hacia la b (el arco más corto) */
  function qDesde(a,b){a=nv(a);b=nv(b);const d=pto(a,b);if(d<-0.999999){let ax=cruz([1,0,0],a);if(Math.hypot(...ax)<1e-6)ax=cruz([0,0,1],a);ax=nv(ax);return [ax[0],ax[1],ax[2],0];}
    const c=cruz(a,b),q=[c[0],c[1],c[2],1+d],l=Math.hypot(...q);return q.map(x=>x/l);}
  const qMul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];
  const qInv=q=>[-q[0],-q[1],-q[2],q[3]],r4=a=>a.map(x=>Math.round(x*1e4)/1e4);
  /* definiciones de los ejercicios (macaco.js las registra: ESQ.defs = MKD) */
  let defs={};const usar=o=>{defs=o||{};};
  /* la pose de un ejercicio en el instante u (0 = A, 1 = B; u crudo, sin curva): huesos con su dirección, su rotación (cuaternión del
     mundo y local respecto del padre), el ángulo articular clínico y su límite, y la posición de la raíz (hips) */
  function exportPose(id,u){const D=typeof id==='string'?defs[id]:id;if(!D)throw new Error('exportPose: no existe el ejercicio '+id);
    const R=frame(D,u==null?0:u),P=R.P,fr=R.v==='front',A=angles(R);
    /* lado de la pantalla → lado del personaje. De costado: si mira a la derecha (d = 1) se ve su lado izquierdo (cercano = L).
       De frente mirando a quien mira, la izquierda de la pantalla es su derecha; de atrás (back), coincide */
    const lado=fr?(D.back?{L:'L',R:'R'}:{L:'R',R:'L'}):(R.d>0?{n:'L',f:'R'}:{n:'R',f:'L'});
    const a3=(p,q)=>{const dx=q[0]-p[0],dy=q[1]-p[1];return fr?[D.back?-dx:dx,-dy,0]:[0,-dy,dx*R.d];};
    const sdDe=nom=>Object.keys(lado).find(k=>lado[k]===nom.slice(-1));
    const mid=lp(P.P,P.N,.5),cad=fr?lp(P.HL,P.HR,.5):lp(P.Hpn,P.Hpf,.5);
    const seg={hips:[cad,P.P],spine:[P.P,mid],chest:[mid,P.N],neck:[P.N,P.H],head:[P.N,P.H]};
    for(const sd of Object.keys(lado)){const L=lado[sd];
      seg['upperArm.'+L]=[P['S'+sd],P['E'+sd]];seg['lowerArm.'+L]=[P['E'+sd],P['W'+sd]];seg['hand.'+L]=[P['W'+sd],P['G'+sd]];
      seg['upperLeg.'+L]=[P[(fr?'H':'Hp')+sd],P['K'+sd]];seg['lowerLeg.'+L]=[P['K'+sd],P['A'+sd]];seg['foot.'+L]=[P['L'+sd]||P['A'+sd],P['T'+sd]];}
    const out={id:typeof id==='string'?id:'',u:u==null?0:u,vista:fr?(D.back?'atras':'frente'):'costado',ejes:'X izquierda, Y arriba, Z adelante (glTF)',mPorU:+M_POR_U.toFixed(5),
      raiz:{pos:null,posM:null},huesos:{}};
    const mundo={};
    for(const [nom,padre] of HUESOS){const s=seg[nom],base=nom.split('.')[0];if(!s||!s[0]||!s[1])continue;
      const dir=nom==='hips'?[0,1,0]:nv(a3(s[0],s[1])),qw=nom==='hips'?[0,0,0,1]:qDesde(REPOSO[base],dir);
      /* las caderas: de costado, el personaje mira a +Z (en la pantalla mira hacia d); la inclinación del tronco va en spine */
      mundo[nom]=qw;const ql=padre&&mundo[padre]?qMul(qInv(mundo[padre]),qw):qw;
      const h={dir:r4(dir),q:r4(qw),qLocal:r4(ql)},sd=nom.includes('.')?sdDe(nom):null;
      /* el límite de cada articulación (el ejercicio puede ampliarlo con D.lim). proyectado: el dibujo 2D no muestra el ángulo real
         (vista 3/4, tramo acortado porque apunta hacia quien mira, brazo abierto 45° o más fuera del plano); el validador tampoco lo controla */
      if(fr){const k=ANG_F[base];if(k&&sd&&A[sd]){h.ang=+A[sd][k[0]].toFixed(1);h.lim=(D.lim&&D.lim[k[1]])||LIM[k[1]];const sg=base.endsWith('Arm')?'ua':'th';if(D.yaw||lsOf(R.g,sg,sd)<.6)h.proyectado=true;}}
      else{const k=ANG_S[base];if(k==='nk'){h.ang=+A.nk.toFixed(1);h.lim=(D.lim&&D.lim.nk)||LIM.nk;}else if(k&&sd&&A[sd]){h.ang=+A[sd][k].toFixed(1);h.lim=(D.lim&&D.lim[k])||LIM[k];
        if(('sew'.includes(k)&&A[sd].ab>=45)||('ew'.includes(k)&&A[sd].abf>=45))h.proyectado=true;}}
      out.huesos[nom]=h;}
    const piso=FLOOR,pos=fr?[(D.back?-1:1)*(cad[0]-60),piso-cad[1],0]:[0,piso-cad[1],(cad[0]-60)*R.d];
    out.raiz.pos=r4(pos);out.raiz.posM=r4(pos.map(x=>x*M_POR_U));return out;}
  return {M_POR_U,HUESOS,REPOSO,exportPose,usar,qDesde,qMul,qInv,LEN,HEAD,FLOOR,LIM,rad,deg,nrm,V,add,phi,dist,lerp,lp,ease,SIDE,FSIDE,FTOP,angAt,target,tLen,fkSide,VF,phF,lsOf,fkFront,solve2,ikArm,ikLeg,frame,angles,N,frames};
})();
/* en Node (juego, herramientas, tests): require('js/esqueleto.js') */
if(typeof module!=='undefined'&&module.exports)module.exports=ESQ;
