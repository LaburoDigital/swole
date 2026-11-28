'use strict';
/* DATOS-FASES (generado por .equipo/SW-11/genera-fases.js; se puede corregir a mano): s = segmentos [nombre, u0, u1] (u0 = u1: quieto),
   c = la fase de cada clave de técnica (en el orden de la ficha) o "todo" (vale para todo el recorrido) */
const VFASES={
  bench:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  incbench:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  dbpress:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  dbfly:{s:[["Cerrado",0,0],["Apertura",0,1],["Abierto",1,1],["Cierre",1,0]],c:["Cerrado","Apertura","Apertura","Cierre"]},
  cablefly:{s:[["Abierto",0,0],["Cierre",0,1],["Cerrado",1,1],["Apertura",1,0]],c:["todo","todo","Cierre","Apertura"]},
  pushup:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","todo"]},
  declbench:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  incdbpress:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Subida","Bajada"]},
  chestpress:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  pecdeck:{s:[["Abierto",0,0],["Cierre",0,1],["Cerrado",1,1],["Apertura",1,0]],c:["todo","todo","Cierre","Apertura"]},
  declpushup:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","todo"]},
  dips:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  pullup:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Colgado","Tirón","Bajada"]},
  latpull:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  row:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  dbrow:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  cablerow:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  deadlift:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Arriba"]},
  facepull:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","Tirón","todo","Vuelta"]},
  shrug:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","Arriba","Bajada"]},
  chinup:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Colgado","Tirón","Bajada"]},
  assistpull:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Tirón","Bajada"]},
  machrow:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  pullover:{s:[["Estirado",0,0],["Tirón",0,1],["Contraído",1,1],["Vuelta",1,0]],c:["todo","todo","Tirón","Vuelta"]},
  ohp:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Arriba"]},
  dbohp:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  lateral:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","todo","Bajada"]},
  machpress:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  frontraise:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  reardelt:{s:[["Cerrado",0,0],["Apertura",0,1],["Abierto",1,1],["Cierre",1,0]],c:["todo","todo","Apertura","Cierre"]},
  uprightrow:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","todo","Bajada"]},
  curl:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  dbcurl:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","todo","Bajada"]},
  hammer:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  pushdown:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Arriba","Bajada","Subida"]},
  skull:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  wrist:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  preacher:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Abajo","Subida","Bajada"]},
  cablecurl:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  ohtri:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  kickback:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  squat:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  frontsquat:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  legpress:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Bajada","Subida"]},
  legext:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  legcurl:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  rdl:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  hipthrust:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Arriba"]},
  seatlegcurl:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  hipabd:{s:[["Cerrado",0,0],["Apertura",0,1],["Abierto",1,1],["Cierre",1,0]],c:["todo","Apertura","Abierto","Cierre"]},
  hipadd:{s:[["Abierto",0,0],["Cierre",0,1],["Cerrado",1,1],["Apertura",1,0]],c:["todo","Abierto","Cierre","Apertura"]},
  glutekick:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  lunge:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Bajada","todo","Subida"]},
  bulgarian:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  hacksquat:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  goblet:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  stepup:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","todo","Bajada"]},
  smithsquat:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  calf:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  seatedcalf:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  presscalf:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  crunch:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","todo"]},
  legraise:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Subida","Subida","Bajada"]},
  plank:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  cablecrunch:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  abwheel:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","Abajo","Subida"]},
  mtclimb:{s:[["Un lado",0,0],["Cambio",0,1],["Otro lado",1,1],["Cambio",1,0]],c:["todo","Cambio","todo","todo"]},
  deadbug:{s:[["Inicio",0,0],["Extensión",0,1],["Estirado",1,1],["Vuelta",1,0]],c:["todo","Extensión","todo","Vuelta"]},
  russian:{s:[["Un lado",0,0],["Giro",0,1],["Otro lado",1,1],["Vuelta",1,0]],c:["todo","todo","Giro","todo"]},
  hyper:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Bajada","Subida"]},
  kneepush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  diamond:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","todo","Subida"]},
  archerpush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","todo"]},
  pppush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","todo","Bajada"]},
  oapush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  planchepush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["Arriba","Bajada","todo","Subida"]},
  austrow:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Tirón","Arriba","todo"]},
  lpullup:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Tirón","todo","Bajada"]},
  archerpull:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Tirón","todo","todo"]},
  muscleup:{s:[["Colgado",0,0],["Tirón",0,0.4],["Transición",0.4,0.65],["Fondo",0.65,1],["Arriba",1,1]],c:["Tirón","Transición","Transición","Fondo"]},
  oapull:{s:[["Colgado",0,0],["Tirón",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Tirón","Bajada"]},
  benchdip:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  ringdip:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  airsquat:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Bajada","todo","Bajada"]},
  shrimp:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  pistol:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  dragon:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Subida"]},
  tucklsit:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  lsit:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  vsit:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  wallhs:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  freehs:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  hspu:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["Arriba","Bajada","todo","Subida"]},
  freehspu:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","Subida","todo"]},
  tuckfl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  advfl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  straddlefl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  fullfl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  tuckbl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  straddlebl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  fullbl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  tuckpl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  advpl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  straddlepl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  fullpl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  pikepush:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","todo"]},
  crow:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  pllean:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  onelegfl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  skincat:{s:[["Colgado",0,0],["Vuelta",0,1],["Atrás",1,1],["Regreso",1,0]],c:["Colgado","Vuelta","Atrás","Regreso"]},
  advbl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  onelegl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  russiandip:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["Bajada","Bajada","Subida","todo"]},
  impdip:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  boxpistol:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Bajada","todo","Subida"]},
  vflag:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  tuckflag:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  straddleflag:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  flag:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  negpull:{s:[["Arriba",0,0],["Bajada lenta",0,1],["Colgado",1,1],["Vuelta arriba",1,0]],c:["Arriba","Bajada lenta","todo","Vuelta arriba"]},
  hollow:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  clappush:{s:[["Abajo",0,0],["Empuje",0,0.3],["Vuelo y palmada",0.3,0.5],["Caída",0.5,0.7],["Bajada",0.7,1]],c:["Bajada","Empuje","Vuelo y palmada","Caída"]},
  sissy:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","Bajada","todo","Bajada"]},
  boxjump:{s:[["Carga",0,0],["Salto",0,1],["Arriba del cajón",1,1]],c:["Carga","Carga","Salto","Arriba del cajón"]},
  jumpsquat:{s:[["Carga",0,0],["Impulso",0,1],["Arriba",1,1],["Caída",1,0]],c:["Carga","Impulso","Caída","Caída"]},
  kbswing:{s:[["Atrás",0,0],["Impulso",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Atrás","Impulso","todo"]},
  nordic:{s:[["Arriba",0,0],["Bajada",0,1],["Abajo",1,1],["Subida",1,0]],c:["todo","todo","Bajada","Subida"]},
  copenhagen:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  pallof:{s:[["Al pecho",0,0],["Empuje",0,1],["Brazos estirados",1,1],["Vuelta",1,0]],c:["todo","Empuje","todo","todo"]},
  medslam:{s:[["Arriba",0,0],["Lanzamiento",0,1],["Abajo",1,1],["Vuelta",1,0]],c:["Arriba","Lanzamiento","Lanzamiento","Vuelta"]},
  farmer:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  neckiso:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  spansq:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  tibraise:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  slcalf:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Bajada"]},
  slbal:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  kneewall:{s:[["Atrás",0,0],["Rodilla adelante",0,1],["Contra la pared",1,1],["Vuelta",1,0]],c:["todo","Rodilla adelante","todo","todo"]},
  slbridge:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  sidepl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  birddog:{s:[["Inicio",0,0],["Extensión",0,1],["Estirado",1,1],["Vuelta",1,0]],c:["todo","Extensión","todo","Estirado"]},
  curlup:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","todo","Subida","Arriba"]},
  biering:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  deadhang:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  extrot:{s:[["Adentro",0,0],["Rotación",0,1],["Afuera",1,1],["Vuelta",1,0]],c:["todo","todo","Rotación","Vuelta"]},
  wallslide:{s:[["Abajo",0,0],["Subida",0,1],["Arriba",1,1],["Bajada",1,0]],c:["todo","Abajo","Subida","Bajada"]},
  cmj:{s:[["Carga",0,0],["Impulso",0,1],["Arriba",1,1],["Caída",1,0]],c:["todo","Impulso","Impulso","Caída"]},
  broadjump:{s:[["Carga",0,0],["Impulso",0,0.5],["Vuelo",0.5,1],["Aterrizaje",1,1]],c:["Carga","Impulso","Aterrizaje","todo"]},
  pogo:{s:[["Carga",0,0],["Impulso",0,1],["Arriba",1,1],["Caída",1,0]],c:["todo","todo","todo","todo"]},
  skater:{s:[["Un lado",0,0],["Cambio",0,1],["Otro lado",1,1],["Cambio",1,0]],c:["Cambio","todo","Cambio","todo"]},
  burpee:{s:[["Parado",0,0],["Agacharse",0,0.2],["Salto atrás",0.2,0.45],["Pies adentro",0.45,0.7],["Pararse",0.7,0.85],["Salto",0.85,1],["Arriba",1,1]],c:["Agacharse","Salto atrás","Pies adentro","Salto"]},
  jumprope:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  bearcrawl:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  highknees:{s:[["Posición",0,1],["Posición",1,0]],c:["todo","todo","todo","todo"]},
  sprint:{s:[["Zancada",0,0],["Zancada",0,1],["Zancada",1,1],["Zancada",1,0]],c:["todo","todo","todo","todo"]}
};
/* FIN-DATOS-FASES */

/* ================= SW-11 fase 1: visor del ejercicio a pantalla completa y agarre en grande =================
   - Tocar el macaco de la ficha abre el visor (S.m2 = {t:'visor'}): figura con zoom a la caja de todos sus cuadros (MK.caja),
     barra de fases con nombre (VFASES) que se toca y se arrastra, play/pausa, velocidad 1× / 0,5× / 0,25× y la clave de técnica
     de la fase actual resaltada. Se cierra con la X, deslizando hacia abajo, con atrás o con Escape (sistema de capas de la v99).
   - Tocar el agarre (en la ficha, en el dibujo o en el visor) muestra las dos manos en grande con los dedos y el pulgar.
   - En los ejercicios donde el agarre es lo importante (AG), el dibujo lleva un cuadradito con las manos y los dedos. */

/* ---------- ejercicios con el cuadradito de manos (ag:1) y por qué ---------- */
const AG={
  diamond:'los índices y los pulgares forman el rombo', archerpush:'manos muy abiertas, una sola hace la fuerza', pppush:'dedos hacia atrás',
  oapush:'una sola mano', oapull:'una sola mano', chinup:'supinas: palmas hacia vos', pullup:'pronas: dorso hacia vos', latpull:'pronas, un poco más abiertas que los hombros',
  archerpull:'pronas y abiertas', hammer:'neutro: palmas enfrentadas', cablerow:'neutro y cerrado (manija en V)', dbrow:'neutro: palma hacia el cuerpo',
  pllean:'dedos hacia afuera (prog: sin eso no se puede inclinar)', deadlift:'mixto: una palma de cada lado (prog: es lo que más se pregunta)',
  dbcurl:'el agarre gira en el recorrido (prog: de neutro a supino)'
};
Object.keys(AG).forEach(id=>{if(MKD[id]&&MKD[id].grip)MKD[id].ag=1;});
/* hacia dónde apuntan los dedos en las apoyadas (vistas desde arriba) */
const AGDIR={diamond:'diamante',pppush:'atras',pllean:'afuera',archerpush:'afuera'};
const unaMano=gr=>/una mano/.test(gr.txt||'');
const antebrazo=gr=>/antebrazo/.test(gr.txt||'');

/* ---------- manos en SVG (viewBox 0 0 240 132), vistas por quien agarra ---------- */
/* dónde van las manos según el ancho (la marca de los hombros está en ±SHX): cerrado adentro, medio sobre la marca, un poco más abierto apenas afuera, abierto bien afuera */
let AGM=false; /* dibujando el cuadradito de la ficha: dos dedos gruesos en vez de cuatro finos (diseno, M2) */
const AGX={cerrado:30,medio:48,pocoabierto:60,abierto:76},AGY=62,SHX=48;
/* mano en la barra: el dorso (prono) o la palma (supino). s = -1 izquierda, 1 derecha */
function manoBarra(cx,t,s){
  const f=AGM?[-7.2,7.2]:[-11.1,-3.7,3.7,11.1],fw=AGM?13:6.6,arm='<rect class="ag-arm" x="'+(cx-10)+'" y="86" width="20" height="46" rx="6"/>';
  if(t==='prono'){/* dorso a la vista; los dedos pasan por arriba de la barra hacia el otro lado y el pulgar la rodea por abajo, del lado de adentro */
    return arm+f.map(x=>'<rect class="ag-back ag-o" x="'+(cx+x-fw/2)+'" y="'+(AGY-17)+'" width="'+fw+'" height="16" rx="3.3"/>').join('')+
      '<rect class="ag-back ag-o" x="'+(cx-15)+'" y="'+(AGY-8)+'" width="30" height="36" rx="9"/>'+
      f.map(x=>'<path class="ag-k" d="M'+(cx+x-2.4)+' '+(AGY-3.5)+'q2.4 -2.4 4.8 0"/>').join('')+
      '<g transform="translate('+(cx-s*12)+' '+(AGY+21)+') rotate('+(s*27)+')"><rect class="ag-back ag-o" x="-4.2" y="-19" width="8.4" height="22" rx="4.2"/><ellipse class="ag-nail" cx="0" cy="-14" rx="2.2" ry="2.8"/></g>';}
  /* supino: la palma a la vista; los dedos vienen por arriba de la barra hacia vos y el pulgar la rodea del lado de afuera */
  return arm+'<rect class="ag-palm ag-o" x="'+(cx-15)+'" y="'+(AGY+1)+'" width="30" height="34" rx="9"/>'+
    '<path class="ag-k" d="M'+(cx-9)+' '+(AGY+16)+'q9 6 18 -2M'+(cx-6)+' '+(AGY+25)+'q6 3 12 0"/>'+
    f.map(x=>'<rect class="ag-palm ag-o" x="'+(cx+x-fw/2)+'" y="'+(AGY-12)+'" width="'+fw+'" height="22" rx="3.3"/><line class="ag-k" x1="'+(cx+x-2)+'" y1="'+(AGY-2)+'" x2="'+(cx+x+2)+'" y2="'+(AGY-2)+'"/>').join('')+
    '<g transform="translate('+(cx+s*15)+' '+(AGY+22)+') rotate('+(-s*24)+')"><rect class="ag-palm ag-o" x="-4.2" y="-20" width="8.4" height="23" rx="4.2"/></g>';
}
/* agarre neutro (manija parada): se ve el lado del pulgar; el pulgar cierra arriba de los dedos */
function manoNeutra(cx,s){
  return '<rect class="ag-arm" x="'+(cx-9)+'" y="88" width="18" height="44" rx="6"/>'+
    '<rect class="ag-back ag-o" x="'+(cx-14)+'" y="'+(AGY-14)+'" width="28" height="40" rx="9"/>'+
    [-8,0,8].map(d=>'<line class="ag-k" x1="'+(cx-s*2)+'" y1="'+(AGY+d+6)+'" x2="'+(cx+s*12)+'" y2="'+(AGY+d+6)+'"/>').join('')+
    '<rect class="ag-back ag-o" x="'+(cx-13)+'" y="'+(AGY-11)+'" width="26" height="8.4" rx="4.2"/><ellipse class="ag-nail" cx="'+(cx-s*8)+'" cy="'+(AGY-6.8)+'" rx="2.8" ry="2.1"/>';
}
/* mano apoyada vista desde arriba (dorso): dedos hacia arriba del dibujo si rot = 0. Base: la izquierda (pulgar hacia adentro, +x) */
function manoArriba(cx,cy,rot,s,pul){pul=pul==null?-38:pul;
  const L=AGM?[16,19]:[13,17,19.5,17],X=AGM?[-5.6,5.6]:[-8.4,-2.8,2.8,8.4],FW=AGM?10.6:5.4;
  return '<g transform="translate('+cx+' '+cy+') scale('+(s*1.3)+' 1.3) rotate('+rot+')">'+
    X.map((x,i)=>'<rect class="ag-back ag-o" x="'+(x-FW/2)+'" y="'+(-9-L[i])+'" width="'+FW+'" height="'+(L[i]+4)+'" rx="'+FW/2+'"/><ellipse class="ag-nail" cx="'+x+'" cy="'+(-6.5-L[i])+'" rx="'+(AGM?3:1.6)+'" ry="'+(AGM?2.6:2)+'"/>').join('')+
    '<rect class="ag-back ag-o" x="-12.5" y="-11" width="25" height="27" rx="8.5"/>'+
    '<g transform="translate(9 5) rotate('+pul+')"><rect class="ag-back ag-o" x="-2" y="-3.3" width="18" height="6.6" rx="3.3"/><ellipse class="ag-nail" cx="13.2" cy="0" rx="2" ry="1.6"/></g>'+
    X.map(x=>'<path class="ag-k" d="M'+(x-1.8)+' -9q1.8 -1.6 3.6 0"/>').join('')+'</g>';
}
function antebrazoArriba(cx,cy,s){
  return '<g transform="translate('+cx+' '+cy+') scale('+s+' 1)"><rect class="ag-arm ag-o" x="-9" y="-6" width="18" height="52" rx="8"/><rect class="ag-back ag-o" x="-11" y="-22" width="22" height="22" rx="9"/><path class="ag-k" d="M-6 -16h12M-6 -10h12"/></g>';
}
/* el dibujo completo: barra o piso, marcas de los hombros y las dos manos (o una) */
function manosSVG(gr,id){
  if(!gr)return '';const w=AGX[gr.w]||48,uno=unaMano(gr);let h='';
  const hombros='<g class="ag-sh"><line x1="'+(120-SHX)+'" y1="12" x2="'+(120-SHX)+'" y2="126"/><line x1="'+(120+SHX)+'" y1="12" x2="'+(120+SHX)+'" y2="126"/></g>'+
    '<text class="ag-tx" x="'+(120-SHX)+'" y="9" text-anchor="middle">hombro</text><text class="ag-tx" x="'+(120+SHX)+'" y="9" text-anchor="middle">hombro</text>';
  if(gr.t==='apoyo'){
    h+='<rect class="ag-floor" x="2" y="14" width="236" height="116" rx="10"/>'+hombros+'<path class="ag-fw" d="M18 48V26M12 32l6-6 6 6"/><text class="ag-tx" x="18" y="58" text-anchor="middle">cabeza</text>';
    const dir=AGDIR[id]||(/atrás/.test(gr.txt||'')?'atras':/afuera/.test(gr.txt||'')?'afuera':'adelante');
    if(antebrazo(gr))return h+antebrazoArriba(120-w,72,1)+(uno||/antebrazo\)/.test(gr.txt)?'':antebrazoArriba(120+w,72,-1));
    if(dir==='diamante'){/* las dos manos juntas, giradas hacia adentro: los índices (arriba) y los pulgares (abajo) se tocan */
      return h+'<path class="ag-rombo" d="M120 52L133 73L120 91L107 73Z"/>'+manoArriba(95.8,74,25,1,5)+manoArriba(144.2,74,25,-1,5);}
    const rot={adelante:-6,atras:205,afuera:-95}[dir];
    if(uno)return h+manoArriba(120,74,rot,1);
    return h+manoArriba(120-w,74,rot,1)+manoArriba(120+w,74,rot,-1);
  }
  const db=gr.db,neu=gr.t==='neutro',tl=gr.t2?[gr.t,gr.t2]:gr.t==='mixto'?['prono','supino']:[gr.t,gr.t],xs=uno?[120]:[120-w,120+w];
  h+=hombros;
  /* la barra (o las manijas de cada mancuerna) */
  if(db)xs.forEach(x=>{h+=neu&&!gr.t2?'<rect class="ag-plate" x="'+(x-15)+'" y="'+(AGY-44)+'" width="30" height="11" rx="3"/><rect class="ag-plate" x="'+(x-15)+'" y="'+(AGY+33)+'" width="30" height="11" rx="3"/><rect class="ag-bar" x="'+(x-3.5)+'" y="'+(AGY-34)+'" width="7" height="68" rx="3"/>'
      :'<rect class="ag-bar" x="'+(x-26)+'" y="'+(AGY-3.5)+'" width="52" height="7" rx="3"/><rect class="ag-plate" x="'+(x-34)+'" y="'+(AGY-15)+'" width="10" height="30" rx="3"/><rect class="ag-plate" x="'+(x+24)+'" y="'+(AGY-15)+'" width="10" height="30" rx="3"/>';});
  else if(neu)xs.forEach(x=>{h+='<rect class="ag-bar" x="'+(x-3.5)+'" y="'+(AGY-30)+'" width="7" height="62" rx="3"/>';});
  else h+='<rect class="ag-bar" x="6" y="'+(AGY-3.5)+'" width="228" height="7" rx="3"/>';
  xs.forEach((x,i)=>{const s=uno?-1:i?1:-1,t=uno?tl[0]:tl[i];h+=t==='neutro'?manoNeutra(x,s):manoBarra(x,t,s);});
  if(gr.t2)h+='<path class="ag-fw" d="M108 120h24M126 114l6 6-6 6"/>';
  /* el ancho cambia en el recorrido (aperturas, elevaciones, banda): flechas para los dos lados */
  if(gr.w==='variable')xs.forEach(x=>{const y=AGY-28;h+='<path class="ag-fw" d="M'+(x-20)+' '+y+'h40M'+(x-15)+' '+(y-5)+'l-5 5 5 5M'+(x+15)+' '+(y-5)+'l5 5-5 5"/>';});
  return h;
}
const AGN={prono:'Prono',supino:'Supino',neutro:'Neutro',mixto:'Mixto',apoyo:'Apoyadas'};
const agNombre=(gr,id)=>gr.t==='apoyo'&&AGDIR[id]==='diamante'?'Diamante':gr.t2?(AGN[gr.t]||'')+' → '+(AGN[gr.t2]||'').toLowerCase():unaMano(gr)?'Una mano':(AGN[gr.t]||'');
/* el cuadradito mide AGW × AGH unidades del dibujo (120): ~50 px de ancho en la ficha (diseno, M2) */
const AGW=46,AGH=40;
/* el recuadro del dibujo de la ficha para los ejercicios con ag:1: las manos con los dedos (recorte del dibujo grande) y el nombre */
function agCaja(gr,id){const w=AGX[gr.w]||48;
  if(gr.t==='apoyo'){if(unaMano(gr)||AGDIR[id]==='diamante')return [72,30,96,66];const x0=120-w-26;return [x0,36,240-2*x0,(240-2*x0)*.69];}
  const x0=unaMano(gr)?82:120-w-24,ww=240-2*x0;return [x0,AGY-26-Math.max(0,ww*.69-62)/2,ww,Math.max(62,ww*.69)];}
function agMini(D,box,id){box=box||{x:2,y:2,s:1};const gr=D.grip,c=agCaja(gr,id).map(v=>+v.toFixed(1));AGM=true;let man;try{man=manosSVG(gr,id);}finally{AGM=false;}
  return '<g class="mk-grip mk-ag" transform="translate('+(+box.x).toFixed(1)+' '+(+box.y).toFixed(1)+') scale('+box.s+')"><rect class="mk-gbg" x="0" y="0" width="'+AGW+'" height="'+AGH+'" rx="4"/>'+
    '<svg x="1" y="1" width="'+(AGW-2)+'" height="'+(AGH-9)+'" viewBox="'+c.join(' ')+'" class="ag-mini">'+man+'</svg><text class="mk-gl" x="'+AGW/2+'" y="'+(AGH-2.4)+'" text-anchor="middle">'+esc(agNombre(gr,id))+'</text></g>';}
/* el ancho, en palabras (tiene que coincidir con el dibujo: tests/visor.test.js mide las manos contra los hombros) */
const AGW_TXT={cerrado:'más juntas que los hombros',medio:'al ancho de los hombros',pocoabierto:'un poco más abiertas que los hombros',abierto:'bien más abiertas que los hombros',variable:'que se abren y se cierran en el recorrido'};
const AGW_T={cerrado:'Cerrado',medio:'Al ancho de los hombros',pocoabierto:'Un poco más abierto que los hombros',abierto:'Abierto',variable:'El ancho cambia en el recorrido'};
/* cómo agarrar, en una línea */
function comoAgarrar(gr,id){
  if(!gr)return '';const W=AGW_TXT[gr.w]||'';
  if(gr.t==='apoyo'){const d=AGDIR[id];
    if(d==='diamante')return 'Juntá las manos debajo del pecho: los índices y los pulgares se tocan y forman un rombo.';
    if(antebrazo(gr))return 'Apoyá '+(/antebrazos/.test(gr.txt)?'los antebrazos':'el antebrazo')+' debajo del hombro, con el puño cerrado y el codo justo abajo.';
    if(unaMano(gr))return 'Una sola mano apoyada debajo del pecho, con los dedos abiertos; la otra, atrás de la espalda.';
    if(d==='atras')return 'Dedos hacia atrás (hacia los pies) y un poco afuera, con las manos a la altura de la cintura, '+W+'.';
    if(d==='afuera')return 'Dedos hacia afuera, bien abiertos, con las manos '+W+'.';
    return 'Manos apoyadas con los dedos abiertos y hacia adelante, '+W+(gr.txt?' '+gr.txt:'')+'.';}
  const db=gr.db?'una mancuerna en cada mano, ':'',sub=gr.txt?' '+gr.txt:'';
  if(gr.t2)return 'Arrancá con las palmas enfrentadas (neutro) y girá la palma hacia vos mientras subís; '+db+W+'.';
  if(unaMano(gr))return 'Una sola mano en la barra, '+(gr.t==='supino'?'con la palma hacia vos':'con el dorso hacia vos')+' y el pulgar rodeándola; la otra, suelta o en el pecho.';
  const t={prono:'Palmas hacia afuera (ves el dorso de tus manos), el pulgar rodeando la barra por abajo',supino:'Palmas mirando hacia vos, el pulgar rodeando la barra',
    neutro:'Palmas enfrentadas, mirándose entre sí, con el pulgar arriba cerrando la mano',mixto:'Una palma hacia vos y la otra hacia afuera (alterná cuál entre series), los pulgares rodeando la barra'}[gr.t]||'';
  return t+sub+', '+db+'manos '+W+'.';
}
function agarreHTML(id){const D=MKD[id],gr=D&&D.grip;if(!gr)return '<p class="mut">Este ejercicio no usa las manos.</p>';
  const W=AGW_T[gr.w]||'';
  return '<div class="ag"><div class="ag-fig"><svg viewBox="0 0 240 132" role="img" aria-label="Las manos en el agarre '+esc(agNombre(gr,id).toLowerCase())+'">'+manosSVG(gr,id)+'</svg></div>'+
    '<p class="ag-t"><b>'+esc(agNombre(gr,id))+'</b><span>'+esc(W)+'</span></p><p class="ag-how">'+esc(comoAgarrar(gr,id))+'</p>'+
    '<p class="ag-ley mut">'+(gr.t==='apoyo'?'Vistas desde arriba, como si miraras tus manos en el piso. La flecha apunta hacia la cabeza.':'Vistas como las ves vos al agarrar. Claro: la palma; oscuro: el dorso. Las líneas punteadas son tus hombros.')+'</p></div>';}

/* ---------- el visor ---------- */
const VIS={id:null,t:0,play:true,vel:1,raf:0,last:0,cache:new Map(),tl:null,drag:null,noClick:0,wasPlay:false};
function visTL(id){const F=VFASES[id];if(!F)return null;
  const segs=F.s.map(([n,u0,u1])=>({n,u0,u1,dur:u0===u1?.5:.55+1.1*Math.abs(u1-u0)}));let t=0;segs.forEach(s=>{s.t0=t;t+=s.dur;});
  /* en la barra, los tramos seguidos con el mismo nombre son una sola fase (isométricos: "Posición") */
  const G=[];segs.forEach((s,i)=>{const g=G[G.length-1];if(g&&g.n===s.n){g.i1=i;g.dur+=s.dur;}else G.push({n:s.n,i0:i,i1:i,t0:s.t0,dur:s.dur});});
  return {segs,G,T:t};}
const smooth=p=>p*p*(3-2*p);
function visU(tl,t){const s=tl.segs.find(x=>t<x.t0+x.dur)||tl.segs[tl.segs.length-1],p=Math.min(1,Math.max(0,(t-s.t0)/s.dur));return s.u0+(s.u1-s.u0)*smooth(p);}
const visG=(tl,t)=>{const g=tl.G.findIndex(x=>t<x.t0+x.dur);return g<0?tl.G.length-1:g;};
const visX=(tl,t)=>{const g=visG(tl,t),G=tl.G[g];return (g+Math.min(1,(t-G.t0)/G.dur))/tl.G.length;};
const visTfromX=(tl,x)=>{x=Math.min(.9999,Math.max(0,x));const n=tl.G.length,g=Math.floor(x*n),G=tl.G[g];return G.t0+(x*n-g)*G.dur;};
function visFig(id,u){const q=Math.round(u*200)/200,k=id+':'+q;let s=VIS.cache.get(k);
  if(!s){const D=MKD[id],b=MK.caja(D);s=MK.svg(D,{u:q,raw:1,noGrip:1,vb:b.x+' '+b.y+' '+b.w+' '+b.h});if(VIS.cache.size>600)VIS.cache.clear();VIS.cache.set(k,s);}return s;}
function visorHTML(m){const id=m.d.id,D=MKD[id],tl=VIS.id===id&&VIS.tl?VIS.tl:visTL(id);if(!D||!tl)return '<p class="mut">Este ejercicio no tiene dibujo.</p>';
  const F=VFASES[id],X=XT[id]||{},cues=X.cues||[],gi=visG(tl,VIS.t),gn=tl.G[gi].n,x=visX(tl,VIS.t);
  const gIdx=n=>tl.G.findIndex(g=>g.n===n);
  const gripBtn=D.grip?'<button class="vis-grip'+(D.ag?' ag1':'')+'" data-a="visGrip" aria-label="Ver el agarre en grande: '+esc(agNombre(D.grip,id))+'"><svg viewBox="0 0 '+(D.ag?AGW+' '+AGH:'38 26')+'" aria-hidden="true">'+(D.ag?agMini(D,{x:0,y:0,s:1},id):MK.gripGlyph(D.grip,{x:0,y:0,s:1}))+'</svg></button>':'';
  return '<div class="vis" id="vis" data-g="'+gi+'">'+
    '<div class="vis-stage"><div class="vis-fig" id="visFig" data-q="">'+visFig(id,visU(tl,VIS.t))+'</div></div>'+
    '<div class="vis-ph"><div><b id="visPh">'+esc(gn)+'</b><span class="mut" id="visN">'+(tl.G.length>1?(gi+1)+' de '+tl.G.length:'Se sostiene')+'</span></div>'+gripBtn+'</div>'+
    '<div class="vis-bar" id="visBar"><div class="vis-segs">'+tl.G.map((g,i)=>'<button class="vis-seg'+(i===gi?' on':'')+'" data-a="visFase" data-v="'+i+'" aria-label="Ir a la fase '+esc(g.n)+'" aria-pressed="'+(i===gi)+'"><span>'+esc(g.n)+'</span></button>').join('')+'</div>'+
      '<div class="vis-track" role="slider" tabindex="0" aria-label="Recorrido del movimiento" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(x*100)+'" aria-valuetext="'+esc(gn)+'">'+tl.G.slice(1).map((_,i)=>'<i class="vis-tick" style="left:'+((i+1)/tl.G.length*100).toFixed(2)+'%"></i>').join('')+'<i class="vis-head" id="visHead" style="left:'+(x*100).toFixed(2)+'%"></i></div></div>'+
    '<div class="vis-ctl"><button class="vis-play" id="visPlay" data-a="visPlay" aria-label="'+(VIS.play?'Pausa':'Reproducir')+'">'+ic(VIS.play?'pause':'play',22)+'</button>'+
      '<div class="seg vis-vel" role="group" aria-label="Velocidad">'+[[1,'1×'],[.5,'0,5×'],[.25,'0,25×']].map(([v,l])=>'<button class="'+(VIS.vel===v?'on':'')+'" data-a="visVel" data-v="'+v+'" aria-pressed="'+(VIS.vel===v)+'">'+l+'</button>').join('')+'</div></div>'+
    '<ul class="vis-cues" id="visCues">'+cues.map((c,i)=>{const f=F.c[i]||'todo',g=gIdx(f),todo1=f==='todo'&&F.c.indexOf('todo')===i;return '<li class="'+(f==='todo'?'all':f===gn?'on':'')+'" data-f="'+esc(f)+'">'+(g>=0?'<button data-a="visFase" data-v="'+g+'">':'<span>')+(f==='todo'&&!todo1?'':'<small>'+(f==='todo'?'Todo el recorrido':esc(f))+'</small>')+esc(c)+(g>=0?'</button>':'</span>')+'</li>';}).join('')+'</ul>'+
    (X.err?'<p class="tech-err vis-err">'+ic('x',14)+'<span><b>Error común:</b> '+esc(X.err)+'</span></p>':'')+
    (m.d.grip?'<div class="vis-gp" role="dialog" aria-label="Agarre">'+agarreHTML(id)+'<button class="btn wide" data-a="visGripX">Volver al visor</button></div>':'')+
  '</div>';}
/* pinta el cuadro actual sin redibujar la hoja (busca los elementos cada vez: sobrevive a un render() de la app) */
function visPaint(){const tl=VIS.tl,id=VIS.id;if(!tl||typeof document==='undefined')return;const fig=document.getElementById('visFig');if(!fig)return;
  const u=visU(tl,VIS.t),q=String(Math.round(u*200)/200);if(fig.dataset.q!==q){fig.innerHTML=visFig(id,u);fig.dataset.q=q;}
  const x=visX(tl,VIS.t),hd=document.getElementById('visHead');if(hd){hd.style.left=(x*100).toFixed(2)+'%';hd.parentElement.setAttribute('aria-valuenow',Math.round(x*100));}
  const w=document.getElementById('vis'),gi=visG(tl,VIS.t);if(w&&w.dataset.g!==String(gi)){w.dataset.g=gi;const gn=tl.G[gi].n;
    w.querySelectorAll('.vis-seg').forEach((b,i)=>{b.classList.toggle('on',i===gi);b.setAttribute('aria-pressed',i===gi);});
    const ph=document.getElementById('visPh');if(ph)ph.textContent=gn;const n=document.getElementById('visN');if(n&&tl.G.length>1)n.textContent=(gi+1)+' de '+tl.G.length;
    if(hd)hd.parentElement.setAttribute('aria-valuetext',gn);
    w.querySelectorAll('.vis-cues li').forEach(li=>li.classList.toggle('on',li.dataset.f===gn));visCueVer();visSegVer();}}
/* jefe (SW-11): ningún nombre de fase cortado. Si no entra, la letra se achica hasta 10 px; si aun así no entra, la fila scrollea de costado */
function visFitSegs(){const row=document.querySelector('.vis-segs');if(!row)return;row.classList.remove('scroll');row.style.fontSize='';
  const sobra=()=>[...row.querySelectorAll('.vis-seg span')].some(x=>x.scrollWidth>x.clientWidth+.5);
  for(let fs=12;sobra()&&fs>10;){fs-=.5;row.style.fontSize=fs+'px';}
  if(sobra()){row.style.fontSize='';row.classList.add('scroll');visSegVer();}}
function visSegVer(){const row=document.querySelector('.vis-segs.scroll'),b=row&&row.querySelector('.vis-seg.on');if(!b)return;
  /* medido con rectángulos (offsetLeft es desde .vis, no desde la fila: qa, B4) */const r=row.getBoundingClientRect(),q=b.getBoundingClientRect();
  if(q.left<r.left+6)row.scrollLeft+=q.left-r.left-6;else if(q.right>r.right-6)row.scrollLeft+=q.right-r.right+6;}
if(typeof addEventListener==='function')addEventListener('resize',()=>{if(S.m2&&S.m2.t==='visor')visFitSegs();});
/* la clave de la fase actual queda a la vista en la lista (scrollea solo la lista, nunca la pantalla) */
/* si hay varias claves de la misma fase, se muestran todas las que entren desde la primera (qa, B5) */
function visCueVer(){const ul=document.getElementById('visCues'),on=ul?[...ul.querySelectorAll('li.on')]:[];if(!on.length)return;const r=ul.getBoundingClientRect(),y=el=>el.getBoundingClientRect().top-r.top+ul.scrollTop;
  const top=y(on[0]),bot=y(on[on.length-1])+on[on.length-1].offsetHeight;
  if(top<ul.scrollTop||bot>ul.scrollTop+ul.clientHeight)ul.scrollTop=Math.max(0,bot-top<=ul.clientHeight-8?Math.min(top-4,bot-ul.clientHeight+4):top-4);}
function visTick(now){VIS.raf=0;if(!S.m2||S.m2.t!=='visor'||S.m2.d.id!==VIS.id||!VIS.play){VIS.last=0;return;}
  const dt=VIS.last?Math.min(.1,(now-VIS.last)/1000):0;VIS.last=now;if(!VIS.drag&&!document.hidden)VIS.t=(VIS.t+dt*VIS.vel)%VIS.tl.T;
  visPaint();VIS.raf=requestAnimationFrame(visTick);}
function visRun(){if(!VIS.raf&&VIS.play&&typeof requestAnimationFrame==='function'){VIS.last=0;VIS.raf=requestAnimationFrame(visTick);}}
function visSetPlay(on){VIS.play=on;const b=typeof document!=='undefined'&&document.getElementById('visPlay');if(b){b.innerHTML=ic(on?'pause':'play',22);b.setAttribute('aria-label',on?'Pausa':'Reproducir');}if(on)visRun();else visPaint();}
/* tocar una fase: pausa ahí (en la pose si es un tramo quieto, en el medio del recorrido si es un movimiento) */
function visIrFase(g){const G=VIS.tl&&VIS.tl.G[g];if(!G)return;VIS.t=G.t0+G.dur*.5;visSetPlay(false);if(typeof document!=='undefined')visCueVer();}
Object.assign(ACTIONS,{
  visor(v){if(!MKD[v]||!VFASES[v])return;if(VIS.id!==v){VIS.id=v;VIS.tl=visTL(v);VIS.t=0;VIS.vel=1;}
    VIS.play=!calmMotion();S.m2={t:'visor',d:{id:v}};renderModal(); /* solo las hojas: render() redibujaba el selector y lo llevaba arriba (qa, B1) */if(typeof document!=='undefined'&&document.querySelector('.vis-segs')){visFitSegs();visCueVer();}visRun();},
  visPlay(){visSetPlay(!VIS.play);},
  visVel(v){VIS.vel=+v||1;document.querySelectorAll('.vis-vel button').forEach(b=>{const on=+b.dataset.v===VIS.vel;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});},
  visFase(v){if(performance.now()-VIS.noClick<400)return;visIrFase(+v);},
  visGrip(){if(!S.m2||S.m2.t!=='visor')return;S.m2.d.grip=true;VIS.wasPlay=VIS.play;visSetPlay(false);renderModal();},
  visGripX(){if(!S.m2||S.m2.t!=='visor')return;S.m2.d.grip=false;renderModal();if(VIS.wasPlay)visSetPlay(true);},
  agarre(v){if(!MKD[v]||!MKD[v].grip)return;S.m2={t:'agarre',d:{id:v}};renderModal();}
});
if(typeof document!=='undefined'&&document.addEventListener)(()=>{
  /* arrastrar en la barra de fases: mueve el recorrido y queda en pausa */
  /* si el visor se cerró en medio del arrastre (Escape, atrás), se corta el arrastre (qa, B2) */
  const pos=e=>{const tr=document.querySelector('#visBar .vis-track');if(!tr){VIS.drag=null;return null;}const r=tr.getBoundingClientRect();return (e.clientX-r.left)/r.width;};
  document.addEventListener('pointerdown',e=>{const bar=e.target.closest&&e.target.closest('#visBar');if(!bar||!VIS.tl)return;if(e.target.closest('.vis-segs.scroll'))return; /* la fila que scrollea de costado no arrastra el recorrido */VIS.drag={x0:e.clientX,moved:false};
    if(e.target.closest('.vis-track')){const x=pos(e);if(x==null)return;VIS.drag.moved=true;VIS.t=visTfromX(VIS.tl,x);visSetPlay(false);}});
  document.addEventListener('pointermove',e=>{const d=VIS.drag;if(!d)return;if(!d.moved&&Math.abs(e.clientX-d.x0)<6)return;const x=pos(e);if(x==null)return;d.moved=true;if(VIS.play)visSetPlay(false);VIS.t=visTfromX(VIS.tl,x);visPaint();});
  const fin=()=>{const d=VIS.drag;VIS.drag=null;if(d&&d.moved){VIS.noClick=performance.now();visPaint();}};
  document.addEventListener('pointerup',fin);document.addEventListener('pointercancel',fin);
  /* teclado: flechas para pasar de fase, espacio para pausar; Escape con el agarre abierto vuelve al visor */
  document.addEventListener('keydown',e=>{if(!S.m2||S.m2.t!=='visor'||!VIS.tl)return;if(e.key==='Escape'&&S.m2.d.grip){e.stopImmediatePropagation();ACTIONS.visGripX();return;}
    if(e.target&&/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;const g=visG(VIS.tl,VIS.t),n=VIS.tl.G.length;
    if(e.key==='ArrowRight'){e.preventDefault();visIrFase((g+1)%n);}else if(e.key==='ArrowLeft'){e.preventDefault();visIrFase((g-1+n)%n);}
    else if(e.key===' '&&!(e.target.closest&&e.target.closest('button'))){e.preventDefault();ACTIONS.visPlay();}},true);
  /* deslizar hacia abajo cierra el visor (es de pantalla completa: el gesto común no la toma). La barra, las claves y los botones no cuentan */
  let sh=null,y0=0,x0=0,dy=0;
  document.addEventListener('touchstart',e=>{const s=e.target.closest&&e.target.closest('.msheet.vis-sh');if(!s||e.target.closest('#visBar,.vis-cues,.vis-gp,.vis-ctl'))return;const mb=s.querySelector('.mbody');if(mb&&mb.scrollTop>0)return; /* con la hoja scrolleada, deslizar hacia abajo la sube (no la cierra) */
    sh=s;y0=e.touches[0].clientY;x0=e.touches[0].clientX;dy=0;sh.style.transition='none';},{passive:true});
  document.addEventListener('touchmove',e=>{if(!sh)return;dy=Math.max(0,e.touches[0].clientY-y0);if(dy>4)sh.style.transform='translateY('+dy+'px)';},{passive:true});
  document.addEventListener('touchend',()=>{if(!sh)return;const s=sh;sh=null;s.style.transition='transform .25s cubic-bezier(.2,.8,.2,1)';
    if(dy>110){s.style.transform='translateY(110%)';setTimeout(()=>closeLayer('m2'),200);}else s.style.transform='';});
  /* tocar el recuadro del agarre dentro del dibujo de la ficha abre el agarre (y no el visor) */
  document.addEventListener('click',e=>{const g=e.target.closest&&e.target.closest('.tech-fig .mk-grip');if(!g)return;const b=g.closest('[data-v]');if(!b)return;
    e.stopPropagation();e.preventDefault();ACTIONS.agarre(b.dataset.v);},true);
})();
/* la ficha: el dibujo es un botón que abre el visor y la línea del agarre abre el agarre */
{const techCard1=techCard;techCard=function(ex){let h=techCard1(ex);const id=ex&&ex.id;if(!id||!MKD[id]||!VFASES[id])return h;
  h=h.replace('<div class="tech-fig">','<button type="button" class="tech-fig" data-a="visor" data-v="'+id+'" aria-label="Ver el movimiento en grande, por fases">').replace('</div><div class="tech-txt">','<span class="tech-zoom" aria-hidden="true">'+ic('search',14)+'</span></button><div class="tech-txt">');
  return h.replace(/<p class="tech-grip">([^<]*)<\/p>/,'<button type="button" class="tech-grip" data-a="agarre" data-v="'+id+'">$1 <span class="tech-grip-v">Ver las manos</span></button>');};}
/* las hojas nuevas en el sistema de capas (segundo nivel: se abren encima de la ficha) */
{const modalBody0=modalBody;modalBody=function(m,l2){
  if(m&&m.t==='visor'){const ex=exById(m.d.id);if(typeof requestAnimationFrame==='function')requestAnimationFrame(()=>{visFitSegs();visCueVer();});return sheet(ex?ex.n:'Ejercicio',visorHTML(m),{l2:true,full:true}).replace('class="msheet full"','class="msheet full vis-sh"');}
  if(m&&m.t==='agarre'){const ex=exById(m.d.id);return sheet('Agarre'+(ex?': '+ex.n:''),agarreHTML(m.d.id),{l2:true});}
  return modalBody0(m,l2);};}
