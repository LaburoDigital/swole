/* SW-9 fase B: el resto de los ejercicios con el macaco nuevo, por los lotes de SW-7 (ver .equipo/SW-9/progreso.md).
   Mismo formato que MKD en macaco.js. Al final se engancha a la app con mkHook(). */
Object.assign(MKD,{
  /* ===== Lote 1: Pecho ===== */
  /* press inclinado con barra: respaldo a ~35°, la barra baja vertical a la parte alta del pecho */
  incbench:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'tbench'},{t:'block',r:[42,87,18,6]},{t:'post',p:[51,93,51,110]},{t:'bar',at:'Gn',headOK:'los discos van a los costados de la cabeza'}],
    root:{j:'P',p:[58,82]},
    A:{t:-125,nk:16,n:{s:95,e:5,ab:0,h:30,k:80,a:0}},B:{t:-125,nk:16,n:{s:20,e:100,ab:55,w:-90,h:30,k:80,a:0}},
    ik:{Gn:{A:[36.1,33],B:[43.3,62]},An:{to:[82,107.45],flat:1},Af:{to:[78,107.45],flat:1}}},
  /* press plano con mancuernas: una mancuerna en cada mano, de punta (de costado se ve el extremo) */
  dbpress:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'tbench'},{t:'db',at:'Gf',lateral:1},{t:'db',at:'Gn',lateral:1}],
    root:{j:'P',p:[62,79]},
    A:{t:-90,nk:16,n:{s:90,e:4,h:-30,k:64.8,a:4.8}},B:{t:-90,nk:16,n:{s:-40,e:140,ab:50,w:-60,h:-30,k:64.8,a:4.8}},
    ik:{An:{to:[77.7,107.45],flat:1},Af:{to:[74.7,107.45],flat:1}}},
  /* aperturas con mancuernas (SW-10, decisión de SW-8 recuperada): vistas desde los pies del banco y desde arriba (pitch 65), para que se vea cómo los brazos se abren hacia los costados; codos apenas doblados */
  dbfly:{A:{t:180,tk:0.91,sw:1,L:{h:15.42,k:-15.42,a:154.67,e:44.87},R:{h:15.42,k:-15.42,a:154.67,e:44.87},ls:{thL:0.91,shL:0.51,uaL:0.46,faL:0.44,thR:0.91,shR:0.51,uaR:0.46,faR:0.44,nk:0.91},nk:0},B:{t:180,tk:0.91,sw:1,L:{h:15.42,k:-15.42,a:86.37,e:8.46},R:{h:15.42,k:-15.42,a:86.37,e:8.46},ls:{thL:0.91,shL:0.51,uaL:0.99,faL:0.98,thR:0.91,shR:0.51,uaR:0.99,faR:0.98,nk:0.91},nk:0},v:'front',pies:1,bentKnees:1,grip:{t:'neutro',w:'medio',db:1},eq:[{t:'block',soft:1,r:[49,22.4,22,52.6]},{t:'db',at:'GL',lateral:1},{t:'db',at:'GR',lateral:1}],root:{j:'P',p:[60,62]},vista:'pies'},
  /* cruce de poleas: de frente, los cables bajan de las poleas altas y terminan en las manos */
  cablefly:{v:'front',grip:{t:'neutro',w:'medio'},feet:{L:'floor',R:'floor'},
    eq:[{t:'floor'},{t:'post',p:[8,4,8,110]},{t:'post',p:[112,4,112,110]},{t:'pulley',p:[8,14],to:'GL'},{t:'pulley',p:[112,14],to:'GR'},{t:'handle',at:'GL'},{t:'handle',at:'GR'}],
    root:{j:'P',p:[60,68.6]},
    A:{L:{a:114.9,e:-20,h:5,k:0},R:{a:114.9,e:-20,h:5,k:0},ls:{faL:.765,faR:.765}},B:{L:{a:-30,e:-20,h:5,k:0},R:{a:-30,e:-20,h:5,k:0},ls:{faL:.765,faR:.765}}},
  /* flexiones: boca abajo (cabeza a la izquierda), en puntas de pie, manos apoyadas al ancho de hombros, codos a ~45° */
  pushup:{lock:[{u:0,j:'e'}],d:-1,grip:{t:'apoyo',w:'medio'},handPhi:90,tiptoe:1,feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'}],
    root:{j:'Tn',p:[94,109.25]},
    A:{t:108,nk:-5,n:{s:80,e:0,h:0,k:0,a:-40}},B:{t:96,nk:-5,n:{s:30,e:90,ab:40,h:0,k:0,a:-40}},
    ik:{Wn:[24,108.6],Wf:[24,108.6]}},
  /* press declinado: la cabeza más baja que la cadera, piernas trabadas en el rodillo */
  declbench:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio'},
    eq:[{t:'floor'},{t:'tbench'},{t:'pad',at:{rel:'An',off:[3.5,-4]}},{t:'bar',at:'Gn'}],
    root:{j:'P',p:[64,80]},
    A:{t:-70,nk:16,n:{s:95,e:5,h:0,k:90,a:0}},B:{t:-70,nk:16,n:{s:20,e:100,ab:45,w:-90,h:0,k:90,a:0}},
    ik:{Gn:{A:[38,58.4],B:[45.2,79.4]},An:[88,92],Af:[85,92]}},
  /* press inclinado con mancuernas */
  incdbpress:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'tbench'},{t:'block',r:[42,87,18,6]},{t:'post',p:[51,93,51,110]},{t:'db',at:'Gf',lateral:1},{t:'db',at:'Gn',lateral:1}],
    root:{j:'P',p:[58,82]},
    A:{t:-125,nk:16,n:{s:95,e:5,ab:0,h:30,k:80,a:0}},B:{t:-125,nk:16,n:{s:20,e:100,ab:55,w:-90,h:30,k:80,a:0}},
    ik:{Gn:{A:[36,33],B:[43.9,61.1]},An:{to:[82,107.45],flat:1},Af:{to:[78,107.45],flat:1}}},
  /* press de pecho en máquina: sentado contra el respaldo, las manijas van del pecho al frente */
  chestpress:{lock:[{u:1,j:'e'}],d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[30,88,20,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[40,94,40,110]},{t:'lever',pv:[94,26],to:'Gn',stand:100},{t:'handle',at:'Gn'}],
    root:{j:'P',p:[46,83]},
    A:{t:184,nk:0,n:{s:20,e:110,ab:40,h:88,k:90,a:0}},B:{t:184,nk:0,n:{s:85,e:8,h:88,k:90,a:0}},
    ik:{Gn:{A:[55,62.2],B:[71.5,61]},An:{to:[72,107.45],flat:1},Af:{to:[69,107.45],flat:1}}},
  /* pec deck en 3/4 desde arriba (yaw 20, pitch 55): los brazos, con el codo a 90° y el antebrazo vertical en las almohadillas, se cierran adelante en el plano horizontal */
  pecdeck:{v:'front',bentKnees:1,grip:{t:'neutro',w:'medio'},eq:[{t:'block',soft:1,r:[50,71,22,7]},{t:'block',soft:1,r:[63,40,8,32]},{t:'pad',at:'EL'},{t:'pad',at:'ER'}],root:{j:'P',p:[60,70]},A:{t:180,tk:0.57,sw:0.94,L:{h:39.51,k:-39.51,a:118.95,e:61.05},R:{h:-7.27,k:7.27,a:85.11,e:94.89},ls:{thL:0.88,shL:0.57,uaL:0.95,faL:0.57,thR:0.82,shR:0.57,uaR:1,faR:0.57,nk:0.57},nk:0},B:{t:180,tk:0.57,sw:0.94,L:{h:39.51,k:-39.51,a:39.51,e:140.49},R:{h:-7.27,k:7.27,a:-7.27,e:187.27},ls:{thL:0.88,shL:0.57,uaL:0.88,faL:0.57,thR:0.82,shR:0.57,uaR:0.82,faR:0.57,nk:0.57},nk:0},yaw:20,handHead:1}
});
Object.assign(MKD,{
  /* ===== Lote 2: Espalda ===== */
  /* remo con barra: inclinado con la espalda recta, la barra sube al abdomen */
  row:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],root:{j:'P',p:[63.8,69.6]},
    A:{t:130,n:{s:50,e:0,h:60,k:20,a:10}},B:{t:130,n:{s:-25,e:85,h:60,k:20,a:10}},
    ik:{An:{to:[64,107.45],flat:1},Af:{to:[61,107.45],flat:1}}},
  /* remo con mancuerna a una mano: rodilla y mano de apoyo en el banco (lado lejano), la otra pierna en el piso; el banco queda detrás de la pierna de adelante */
  dbrow:{lock:[{u:0,j:'e'}],d:1,uni:1,grip:{t:'neutro',w:'medio'},feet:{n:'floor'},
    eq:[{t:'floor'},{t:'block',only:'f',r:[30,92,54,6]},{t:'post',p:[36,98,36,110]},{t:'post',p:[78,98,78,110]},{t:'db',at:'Gn'}],
    root:{j:'P',p:[44,68.5]},
    A:{t:95,nk:-10,n:{s:85,e:5,h:85,k:5,a:0},f:{s:85,e:0,h:88,k:95,a:-40}},B:{t:95,nk:-10,n:{s:-25,e:95,h:85,k:5,a:0},f:{s:85,e:0,h:88,k:95,a:-40}},
    ik:{An:{to:[42,107.45],flat:1},Wf:{to:[78,88.4],hand:90}}},
  /* remo sentado en polea baja: el cable sale de la polea baja y termina en la manija */
  cablerow:{lock:[{u:0,j:'e'}],d:1,grip:{t:'neutro',w:'cerrado'},
    eq:[{t:'floor'},{t:'block',r:[18,92,30,6]},{t:'post',p:[33,98,33,110]},{t:'block',r:[80,80,4,30]},{t:'pulley',p:[100,96],to:'Gn'},{t:'post',p:[100,96,100,110]},{t:'handle',at:'Gn'}],
    root:{j:'P',p:[36,87]},
    A:{t:172,n:{s:75,e:5,h:80,k:30,a:20}},B:{t:182,n:{s:-40,e:115,h:85,k:30,a:20}},
    ik:{An:[75,93],Af:[71.5,93]}},
  /* peso muerto: arranca con la barra en el piso sobre el medio del pie (cadera más alta que las rodillas) y sube vertical, pegada a las piernas, hasta quedar parado */
  deadlift:{lock:[{u:1,j:'k'},{u:'all',j:'e'}],d:1,grip:{t:'mixto',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',r:10,at:'Gn'}],root:{j:'P',p:{A:[35,82.5],M:[42,77],B:[56,68.8]}}, /* disco de 45 cm (r 10): la barra queda a la altura real */
    A:{t:119,nk:-15,n:{s:61,e:0,h:100,k:70,a:20}},M:{t:138,nk:-8,n:{s:42,e:0,h:75,k:25,a:8}},B:{t:180,n:{s:0,e:0,h:0,k:0,a:0}},
    ik:{An:{to:[56,107.45],flat:1},Af:{to:[53,107.45],flat:1}}},
  /* encogimientos: los hombros suben hacia las orejas con los brazos estirados */
  shrug:{lock:[{u:0,j:'e'},{u:1,j:'e'}],d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],root:{j:'P',p:[59,68.6]},
    A:{t:180,n:{s:4,e:0,el:0,h:0,k:2,a:0}},B:{t:180,n:{s:4,e:0,el:4.5,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1},Af:{to:[57,107.45],flat:1}}},
  /* hiperextensiones en banco a 45°: cadera en la almohadilla, tobillos trabados; el torso baja y sube hasta la línea de las piernas */
  hyper:{d:1,
    eq:[{t:'floor'},{t:'roll',p:[66,68]},{t:'roll',p:[34,95]},{t:'post',p:[34,95,48,110]},{t:'post',p:[66,72,66,110]},{t:'post',p:[34,104,66,104]}],
    root:{j:'P',p:[60,64]},
    A:{t:45,nk:-20,n:{s:30,e:130,h:100,k:5,a:0}},B:{t:145,nk:-5,n:{s:30,e:130,h:0,k:5,a:0}},
    ik:{An:[38,96],Af:[36,96]}},
  /* isométrico de cuello: la mano en la frente, la cabeza empuja sin moverse */
  neckiso:{d:1,handHead:1,feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'}],root:{j:'P',p:[59,68.6]},
    A:{t:180,nk:4,n:{s:82,e:115,h:0,k:2,a:0}},B:{t:180,nk:-2,n:{s:82,e:116,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1},Af:{to:[57,107.45],flat:1}}},
  /* dominadas supinas (vista de atrás): agarre al ancho de los hombros, más angosto que la prona; arriba los codos van adelante (escorzo 0,55) */
  chinup:{v:'front',back:1,bentKnees:1,grip:{t:'supino',w:'medio'},eq:[{t:'pullbar',front:1,p:[26,26,94]}],root:{j:'N',p:{A:[60,54],B:[60,25]}},A:{t:180,tk:1,L:{a:170,e:0,h:4,k:-22},R:{a:170,e:0,h:4,k:-22},ls:{shL:0.55,shR:0.55}},B:{t:180,tk:1,L:{a:30,e:140,h:4,k:-22},R:{a:30,e:140,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaL:0.55,uaR:0.55,faL:0.55,faR:0.55}},ik:{GL:{to:[50,26],elbow:'down'},GR:{to:[70,26],elbow:'down'}},lock:[{u:0,j:'e',sd:['L','R']}]},
  /* dominadas asistidas en máquina (vista de atrás): de rodillas en la almohadilla, que empuja hacia arriba; las canillas van hacia atrás (en escorzo) */
  assistpull:{v:'front',back:1,bentKnees:1,grip:{t:'prono',w:'medio'},eq:[{t:'pullbar',front:1,p:[26,26,94]},{t:'lever',pv:[96,110],to:'KR'},{t:'pad',at:'KL'},{t:'pad',at:'KR'}],root:{j:'N',p:{A:[60,53],B:[60,25]}},A:{t:180,tk:1,L:{a:170,e:0,h:2,k:0},R:{a:170,e:0,h:2,k:0},ls:{shL:0.3,shR:0.3}},B:{t:180,tk:1,L:{a:30,e:140,h:2,k:0},R:{a:30,e:140,h:2,k:0},ls:{shL:0.3,shR:0.3,uaL:0.86,uaR:0.86,faL:0.83,faR:0.83}},ik:{GL:{to:[43,26],elbow:'down'},GR:{to:[77,26],elbow:'down'}},lock:[{u:0,j:'e',sd:['L','R']}]},
  /* remo sentado en máquina: el pecho apoyado contra la almohadilla (se dibuja arriba de todo, delante del brazo); las manijas vienen hacia las costillas */
  machrow:{lock:[{u:0,j:'e'}],d:1,grip:{t:'neutro',w:'medio'},feet:{n:'floor',f:'floor'},eq:[{t:'floor'},{t:'block',r:[28,86,19,5]},{t:'post',p:[38,91,38,110]},{t:'block',soft:1,layer:'top',r:[48.5,55,5.5,22]},{t:'post',p:[51.5,77,51.5,110]},{t:'lever',pv:[100,58],to:'Gn',stand:100},{t:'handle',at:'Gn'}],root:{j:'P',p:[44,81]},A:{t:185,n:{s:80,e:4,h:85,k:92,a:2}},B:{t:185,n:{s:-40,e:105,h:85,k:92,a:2}},ik:{An:{to:[70,107.45],flat:1},Af:{to:[67,107.45],flat:1}}},
  /* pullover en polea alta: brazos estirados de arriba hasta los muslos; el cable baja de la polea a las manos */
  pullover:{lock:[{u:0,j:'e'},{u:1,j:'e'}],d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'post',p:[104,2,104,110]},{t:'pulley',p:[104,6],to:'Gn'},{t:'handle',at:'Gn'}],root:{j:'P',p:[52,69]},
    A:{t:165,n:{s:160,e:5,h:15,k:5,a:0}},B:{t:165,n:{s:20,e:5,h:15,k:5,a:0}},
    ik:{An:{to:[52,107.45],flat:1},Af:{to:[49,107.45],flat:1}}}
});
Object.assign(MKD,{
  /* ===== Lote 3: Hombros ===== */
  /* face pull: de frente a la polea (a la altura de la cara); termina con las manos al costado de la cabeza y los codos altos y abiertos */
  facepull:{d:1,lock:[{u:0,j:'e'}],grip:{t:'neutro',w:'cerrado',txt:'(soga)'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'post',p:[110,4,110,110]},{t:'pulley',p:[108,34],to:'Gn',headOK:'la soga llega a la cara'},{t:'handle',at:'Gn',headOK:'la soga llega a la cara'}],root:{j:'P',p:[48,68.6]},
    A:{t:180,n:{s:88,e:5,ab:0,h:0,k:3,a:0}},B:{t:182,n:{s:92,e:100,ab:78,h:0,k:3,a:0}},
    ik:{An:{to:[49,107.45],flat:1}}},
  /* press militar: de la clavícula a arriba de la cabeza, con la barra en línea con los pies */
  ohp:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn',headOK:'la barra pasa rozando la cara; los discos van al costado'}],root:{j:'P',p:[60,68.6]},
    A:{t:180,nk:-20,n:{s:70,e:105,w:90,ab:0,h:0,k:2,a:0}},B:{t:180,nk:0,n:{s:170,e:5,w:0,ab:0,h:0,k:2,a:0}}, /* SW-10 (Juan): abajo la barra delante de la cara a la altura de la nariz, antebrazo vertical y codo a 105° (no doblado como un curl); la muñeca atrás sostiene la barra */
    ik:{An:{to:[60,107.45],flat:1}}},
  /* press de hombros con mancuernas: sentado con respaldo, las mancuernas al costado de la cabeza y arriba */
  dbohp:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[26,88,22,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[37,94,37,110]},{t:'db',at:'Gf',lateral:1},{t:'db',at:'Gn',lateral:1}],root:{j:'P',p:[44,83]},
    A:{t:182,nk:-10,n:{s:63,e:110,w:90,ab:55,h:88,k:88,a:0}},B:{t:182,nk:0,n:{s:170,e:5,w:0,ab:0,h:88,k:88,a:0}}, /* SW-10 (Juan): abajo las mancuernas al costado de la cabeza, a la altura del centro de la cabeza (orejas), antebrazo vertical y codo a 110° */
    ik:{An:{to:[66,107.45],flat:1}}},
  /* elevaciones laterales: de frente, los brazos suben hasta la altura de los hombros con los codos apenas doblados */
  lateral:{v:'front',grip:{t:'prono',w:'medio',db:1},feet:{L:'floor',R:'floor'},
    eq:[{t:'floor'},{t:'db',at:'GL'},{t:'db',at:'GR'}],root:{j:'P',p:[60,68.6]},
    A:{L:{a:11,e:-3,h:5,k:0},R:{a:11,e:-3,h:5,k:0},ls:{faL:.765,faR:.765}},B:{L:{a:92,e:-4,h:5,k:0},R:{a:92,e:-4,h:5,k:0},ls:{faL:.765,faR:.765}}},
  /* press de hombros en máquina: sentado, las manijas de la palanca van de los hombros a arriba */
  machpress:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[26,88,22,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[37,94,37,110]},{t:'lever',pv:[80,40],to:'Gn',stand:84},{t:'handle',at:'Gn'}],root:{j:'P',p:[44,83]},
    A:{t:182,nk:-25,n:{s:67,e:105,w:90,ab:0,h:88,k:88,a:0}},B:{t:182,nk:0,n:{s:170,e:5,w:0,ab:0,h:88,k:88,a:0}}, /* SW-10 (Juan): igual que el militar, las manijas delante de la cara a la altura de la nariz */
    ik:{An:{to:[66,107.45],flat:1}}},
  /* elevaciones frontales: brazos estirados hasta la altura de los hombros */
  frontraise:{d:1,grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf'},{t:'db',at:'Gn'}],root:{j:'P',p:[60,68.6]},
    A:{t:180,n:{s:5,e:3,h:0,k:2,a:0}},B:{t:180,n:{s:88,e:3,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1}}},
  /* vuelos posteriores: inclinado, los brazos se abren hacia los costados (de costado se ven en escorzo) */
  /* vuelos posteriores en 3/4 (yaw 40): inclinado a 70°, los brazos van de colgando a abiertos a los costados */
  reardelt:{v:'front',bentKnees:1,grip:{t:'neutro',w:'medio',db:1},feet:{L:'floor',R:'floor'},eq:[{t:'floor'},{t:'db',at:'GL',lateral:1},{t:'db',at:'GR',lateral:1}],root:{j:'P',p:[66,69.65]},A:{t:240.48,tk:0.69,sw:0.77,L:{h:75.56,k:-22.41,a:64.86,e:-0.35},R:{h:-67.11,k:13.96,a:-56.1,e:-4.03},ls:{thL:0.99,shL:0.99,uaL:1,faL:1,thR:0.96,shR:0.99,uaR:1,faR:1,nk:0.69},rr:0,nk:0},B:{t:240.48,tk:0.69,sw:0.77,L:{h:75.56,k:-22.41,a:146.75,e:-16.13},R:{h:-67.11,k:13.96,a:25.79,e:-19.41},ls:{thL:0.99,shL:0.99,uaL:0.77,faL:0.84,thR:0.96,shR:0.99,uaR:0.77,faR:0.73,nk:0.69},rr:0,nk:0},yaw:40},
  /* remo al mentón: la barra sube pegada al cuerpo hasta el pecho alto, con los codos altos y abiertos */
  uprightrow:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'cerrado'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],root:{j:'P',p:[60,68.6]},
    A:{t:180,n:{s:8,e:0,ab:0,h:0,k:2,a:0}},B:{t:180,n:{s:60,e:120,ab:80,h:0,k:2,a:0}},
    ik:{Gn:{A:[64.5,70],B:[65,54.5],elbow:'up'},An:{to:[60,107.45],flat:1}}}
});
Object.assign(MKD,{
  /* ===== Lote 4: Brazos ===== */
  /* fondos en paralelas: arriba brazos estirados, baja con los codos atrás; rodillas dobladas para no tocar el piso */
  dips:{d:1,lock:[{u:0,j:'e'}],grip:{t:'neutro',w:'medio',txt:'(paralelas)'},
    eq:[{t:'floor'},{t:'post',p:[44,56,76,56]},{t:'post',p:[70,56,70,111]}],root:{j:'Gn',p:[60,56]},
    A:{t:170,nk:0,n:{s:10,e:0,w:0,h:12,k:75,a:20}},B:{t:150,nk:-10,n:{s:-60,e:90,w:0,h:32,k:75,a:20}}}, /* SW-10 (Juan): manos sobre las barras, antebrazo vertical todo el recorrido; abajo el brazo paralelo al piso (hombro a la altura del codo, codo 90°), torso 30° adelante; arriba brazos bloqueados; muslos colgando y rodillas dobladas atrás */
  /* curl con mancuernas alternado: el agarre arranca neutro y termina supino (girando la muñeca), como muestra el recuadro */
  dbcurl:{d:1,uni:1,grip:{t:'neutro',t2:'supino',w:'medio',db:1},feet:{n:'floor',f:'floor'},eq:[{t:'floor'},{t:'db',at:'Gf'},{t:'db',at:'Gn'}],root:{j:'P',p:[60,68.6]},A:{t:180,n:{s:4,e:5,h:0,k:2,a:0},f:{s:10,e:118,h:0,k:2,a:0}},B:{t:180,n:{s:10,e:118,h:0,k:2,a:0},f:{s:4,e:5,h:0,k:2,a:0}},ik:{An:{to:[60,107.45],flat:1},Af:{to:[57,107.45],flat:1}}},
  /* curl martillo: mancuerna parada (agarre neutro), el codo quieto */
  hammer:{d:1,grip:{t:'neutro',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf',rot:90,lateral:1},{t:'db',at:'Gn',rot:90,lateral:1}],root:{j:'P',p:[60,68.6]}, /* lateral: las mancuernas suben al costado de los hombros, a los lados de la cara */
    A:{t:180,n:{s:4,e:5,h:0,k:2,a:0}},B:{t:180,n:{s:20,e:120,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1}}},
  /* extensión de tríceps en polea alta: el cable baja de la polea a la barra, los codos quietos al costado */
  pushdown:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'cerrado'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'post',p:[84,2,84,110]},{t:'pulley',p:[80,6],to:'Gn'},{t:'handle',at:'Gn'}],root:{j:'P',p:[56,68.6]},
    A:{t:175,n:{s:5,e:120,h:5,k:5,a:0}},B:{t:175,n:{s:5,e:3,h:5,k:5,a:0}},
    ik:{An:{to:[57,107.45],flat:1}}},
  /* press francés: acostado, los brazos quietos apuntando arriba; la barra baja hacia la frente */
  skull:{d:1,lock:[{u:0,j:'e'}],grip:{t:'prono',w:'cerrado'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'tbench'},{t:'bar',at:'Gn'}],root:{j:'P',p:[62,79]},
    A:{t:-90,nk:16,n:{s:100,e:4,h:-30,k:65,a:5}},B:{t:-90,nk:16,n:{s:100,e:78,h:-30,k:65,a:5}},
    ik:{An:{to:[77.7,107.45],flat:1}}},
  /* curl de muñeca: sentado, antebrazos apoyados en los muslos, solo se mueve la muñeca */
  wrist:{d:1,grip:{t:'supino',w:'cerrado'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[24,89,22,6]},{t:'post',p:[35,95,35,110]},{t:'bar',at:'Gn'}],root:{j:'P',p:[44,84]},
    A:{t:155,n:{s:30,e:60,w:-55,h:70,k:75,a:0}},B:{t:155,n:{s:30,e:60,w:55,h:70,k:75,a:0}},
    ik:{Wn:{to:[60.5,77.5]},An:{to:[68,107.45],flat:1}}},
  /* paseo del granjero: caminando con una mancuerna en cada mano, brazos estirados */
  farmer:{d:1,uni:1,grip:{t:'neutro',w:'medio',db:1},
    eq:[{t:'floor'},{t:'db',at:'Gf',rot:90},{t:'db',at:'Gn',rot:90}],root:{j:'P',p:{A:[62,65.9],M:[62,65],B:[62,65.9]}},
    A:{t:182,n:{s:2,e:3,h:18,k:8,a:-5},f:{s:-2,e:3,h:-14,k:22,a:-25}},B:{t:182,n:{s:-2,e:3,h:-14,k:22,a:-25},f:{s:2,e:3,h:18,k:8,a:-5}}},
  /* curl en banco Scott: el brazo apoyado en la almohadilla inclinada, sube la barra */
  preacher:{d:1,grip:{t:'supino',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[22,90,22,6]},{t:'post',p:[33,96,33,110]},{t:'post',pad:1,p:[54,68,66,82]},{t:'post',p:[62,82,62,110]},{t:'bar',at:'Gn'}],root:{j:'P',p:[38,85]},
    A:{t:168,n:{s:58,e:15,h:80,k:85,a:0}},B:{t:168,n:{s:58,e:104,h:80,k:85,a:0}},
    ik:{An:{to:[60,107.45],flat:1}}},
  /* curl en polea baja: el cable sale de la polea baja (adelante, en el piso) y termina en la barra */
  cablecurl:{d:1,grip:{t:'supino',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'pulley',p:[80,104],to:'Gn'},{t:'post',p:[84,90,84,110]},{t:'handle',at:'Gn'}],root:{j:'P',p:[52,68.6]},
    A:{t:178,n:{s:8,e:8,h:2,k:3,a:0}},B:{t:178,n:{s:12,e:138,h:2,k:3,a:0}},
    ik:{An:{to:[53,107.45],flat:1}}},
  /* extensión de tríceps sobre la cabeza: la mancuerna baja detrás de la cabeza y sube hasta estirar */
  ohtri:{d:1,lock:[{u:0,j:'e'}],headFront:1,handHead:1,grip:{t:'neutro',w:'cerrado',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gn',rot:0,behind:1}],root:{j:'P',p:[60,68.6]},
    A:{t:180,n:{s:172,e:4,h:0,k:2,a:0}},B:{t:180,n:{s:168,e:140,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1}}},
  /* patada de tríceps: inclinado, el brazo paralelo al torso queda quieto y el antebrazo se estira hacia atrás */
  kickback:{d:1,lock:[{u:1,j:'e'}],grip:{t:'neutro',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf'},{t:'db',at:'Gn'}],root:{j:'P',p:[61.8,69.6]},
    A:{t:110,n:{s:-20,e:90,h:80,k:20,a:10}},B:{t:110,n:{s:-20,e:4,h:80,k:20,a:10}},
    ik:{An:{to:[62,107.45],flat:1}}}
});
Object.assign(MKD,{
  /* ===== Lote 5: Piernas (cuádriceps) ===== */
  /* sentadilla frontal: la barra adelante sobre los hombros, codos altos, torso más derecho */
  frontsquat:{d:1,lock:[{u:0,j:'k'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',headOK:'la barra apoya adelante sobre los hombros, junto al cuello',at:{rel:'N',bo:[5,-1.5]}}],root:{j:'Tn',p:[68,109.25]},
    A:{t:180,n:{s:0,e:0,w:30,ab:0,abf:60,h:0,k:2,a:2}},B:{t:155,nk:-5,n:{s:0,e:0,w:30,ab:0,abf:60,h:112,k:122,a:34}},
    ik:{Gn:{rel:'N',bo:[5,-1.5],elbow:'up'}}},
  /* prensa de piernas: recostado, los pies empujan la plataforma que corre por el riel a 45° */
  legpress:{d:1,lock:[{u:0,j:'k'}],
    eq:[{t:'floor'},{t:'tbench'},{t:'post',p:[44,100,86,58]},{t:'plat',to:'An',ang:135,len:10}],root:{j:'P',p:[40,90]},
    A:{t:-130,n:{s:-40,e:20,h:85,k:0,a:-50}},B:{t:-130,n:{s:-40,e:20,h:133,k:100,a:-50}}},
  /* extensión de cuádriceps: sentado, la palanca gira en la rodilla y el rodillo empuja desde el tobillo */
  legext:{d:1,lock:[{u:1,j:'k'}],grip:{t:'neutro',w:'abierto',txt:'(manijas del asiento)'},
    eq:[{t:'floor'},{t:'block',r:[30,85,28,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[44,91,44,110]},{t:'lever',pv:[62,79.5],to:'An'},{t:'pad',at:{rel:'An',off:[2,-3.5]}}],root:{j:'P',p:[42,79.5]},
    A:{t:178,n:{s:12,e:10,h:92,k:90,a:0}},B:{t:178,n:{s:12,e:10,h:92,k:2,a:-30}}},
  /* zancadas: una pierna adelante, baja hasta que la rodilla de atrás casi toca el piso */
  lunge:{d:1,uni:1,tiptoe:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf',rot:90},{t:'db',at:'Gn',rot:90}],root:{j:'P',p:{A:[74.2,68.8],B:[57.7,87.3]}},
    A:{t:180,n:{s:-6,e:4,h:6,k:6,a:5},f:{s:-6,e:4,h:-10,k:5,a:-15}},B:{t:180,n:{s:-6,e:4,h:85,k:90,a:5},f:{s:-6,e:4,h:-10,k:70,a:-30}},
    ik:{An:{to:[76,107.45],flat:1},Tf:{own:1,to:{A:[72,109.25],B:[40,109.25]}}}},
  /* sentadilla búlgara: el pie de atrás apoyado en el banco */
  bulgarian:{d:1,uni:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'medio',db:1},feet:{n:'floor'},
    eq:[{t:'floor'},{t:'block',only:'f',r:[14,92,24,6]},{t:'post',p:[19,98,19,110]},{t:'post',p:[33,98,33,110]},{t:'db',at:'Gf',rot:90},{t:'db',at:'Gn',rot:90}],root:{j:'P',p:{A:[68,68.7],B:[55,87.5]}},
    A:{t:175,n:{s:3,e:2,h:3,k:3,a:5},f:{s:3,e:2,h:-20,k:60,a:-40}},B:{t:170,n:{s:8,e:2,h:95,k:95,a:10},f:{s:8,e:2,h:0,k:150,a:-40}},
    ik:{An:{to:[66,107.45],flat:1},Tf:{own:1,to:[32,90.25]}}},
  /* saltos al cajón: desde agachado con los brazos atrás, salta y cae suave arriba del cajón */
  boxjump:{d:1,fwd:1, /* va solo de ida: no salta de espaldas para bajar del cajón */
    eq:[{t:'floor'},{t:'block',r:[64,82,38,28]}],root:{j:'P',p:{A:[30,86],M:[54,48],B:[74,57]}},
    A:{t:145,nk:-5,n:{s:-45,e:10,h:110,k:105,a:30}},B:{t:160,n:{s:50,e:20,h:70,k:75,a:15}},
    ik:{An:{to:{A:[38,107.45],M:[60,72],B:[84,79.3]},flat:1}}},
  /* sentadilla con salto: abajo con los brazos atrás, arriba en el aire con los brazos arriba y las puntas estiradas */
  jumpsquat:{d:1,
    eq:[{t:'floor'}],root:{j:'Tn',p:{A:[68,109.25],B:[66,97]}},
    A:{t:140,nk:-5,n:{s:-40,e:10,h:115,k:110,a:32}},B:{t:180,n:{s:110,e:8,h:0,k:2,a:-35}}},
  /* sentadilla hack: la espalda contra el respaldo que corre por el riel, los hombros bajo las almohadillas, pies en la plataforma */
  hacksquat:{d:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'medio',txt:'(manijas)'},
    eq:[{t:'floor'},{t:'tbench'},{t:'post',p:[30,40,62,110]},{t:'block',r:[66,104,26,5]},{t:'pad',r:4,headOK:'la almohadilla apoya en los hombros',at:{rel:'N',off:[1,-3]}}],root:{j:'P',p:{A:[58.8,67.8],B:[64.7,87.4]}},
    A:{t:195,n:{s:15,e:115,h:12,k:5,a:0}},B:{t:195,n:{s:15,e:115,h:80,k:112,a:20}},
    ik:{An:{to:[78,101.45],flat:1}}},
  /* sentadilla goblet: la mancuerna parada contra el pecho, torso derecho */
  goblet:{d:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'cerrado',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gn',rot:90}],root:{j:'Tn',p:[68,109.25]},
    A:{t:180,n:{s:0,e:0,ab:30,h:0,k:2,a:2}},B:{t:155,nk:-5,n:{s:0,e:0,ab:30,h:112,k:120,a:32}},
    ik:{Gn:{rel:'N',bo:[8,-10],elbow:'down'}}},
  /* subida al cajón: un pie arriba del cajón, sube hasta quedar parado arriba */
  stepup:{d:1,uni:1,lock:[{u:1,j:'k'}],grip:{t:'neutro',w:'medio',db:1},
    eq:[{t:'floor'},{t:'block',r:[62,94,32,16]},{t:'db',at:'Gf',rot:90},{t:'db',at:'Gn',rot:90}],root:{j:'P',p:{A:[52,77],B:[72,52.6]}},
    A:{t:172,n:{s:3,e:2,h:95,k:100,a:10},f:{s:3,e:2,h:-5,k:5,a:-20}},B:{t:180,n:{s:0,e:2,h:0,k:2,a:0},f:{s:0,e:2,h:40,k:60,a:-10}},
    ik:{An:{to:[72,91.4],flat:1},Tf:{own:1,to:{A:[48,109.25],M:[56,90],B:[66,86]}}}},
  /* sentadilla en Smith: la barra corre derecho por los rieles; los pies un poco adelante */
  smithsquat:{d:1,lock:[{u:0,j:'k'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'post',p:[42,4,42,110]},{t:'post',p:[48,4,48,110]},{t:'bar',behind:1,at:{rel:'N',off:[-5,-3]}}],root:{j:'N',p:{A:[50,39],B:[50,62]}},
    A:{t:180,n:{s:0,e:0,w:-60,ab:50,abf:50,h:0,k:2,a:2}},B:{t:165,nk:-8,n:{s:0,e:0,w:-60,ab:50,abf:50,h:100,k:110,a:25}},
    ik:{Gn:{rel:'N',off:[-5,-3],elbow:'down'},An:{to:[56,107.45],flat:1}}}
});
Object.assign(MKD,{
  /* ===== Lote 6: Piernas (femoral y glúteo) ===== */
  /* curl femoral acostado: boca abajo, la palanca gira en la rodilla y el rodillo empuja detrás del tobillo; manos en las manijas */
  legcurl:{d:-1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'medio',txt:'(manijas del banco)'},
    eq:[{t:'floor'},{t:'block',r:[27,83,56,5]},{t:'post',p:[33,88,33,110]},{t:'post',p:[77,88,77,110]},{t:'lever',pv:[81,78],to:'An'},{t:'pad',at:{rel:'An',off:[0,-4.6]}},{t:'handle',at:'Gn'}],root:{j:'P',p:[60,78]},
    A:{t:90,nk:22,n:{s:150,e:20,ab:60,h:0,k:0,a:-30}},B:{t:90,nk:22,n:{s:150,e:20,ab:60,h:0,k:110,a:0}},
    ik:{Gn:[38,90]}},
  /* peso muerto rumano: rodillas casi rectas, cadera atrás y la barra pegada a las piernas hasta media canilla */
  rdl:{d:1,lock:[{u:0,j:'k'},{u:0,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],root:{j:'P',p:{A:[62,68.6],B:[44,74]}},
    A:{t:180,n:{s:0,e:0,h:0,k:0,a:0}},B:{t:100,nk:-10,n:{s:70,e:0,h:110,k:20,a:-10}},
    ik:{An:{to:[62,107.45],flat:1}}},
  /* hip thrust: la espalda alta en el banco, la barra sobre la cadera agarrada con las manos, pies planos */
  hipthrust:{d:1,grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[8,92,26,6]},{t:'post',p:[13,98,13,110]},{t:'post',p:[29,98,29,110]},{t:'bar',at:{rel:'P',off:[0,-6]}}],root:{j:'N',p:[28,85]},
    A:{t:-118,nk:20,n:{s:30,e:20,ab:40,h:70,k:120,a:0}},B:{t:-90,nk:20,n:{s:30,e:20,ab:40,h:-5,k:100,a:0}},
    ik:{Gn:{rel:'P',off:[-3,-5]},An:{to:[72,107.45],flat:1}}},
  /* swing con pesa rusa: de la bisagra con la pesa entre las piernas a parado con la pesa a la altura del pecho */
  kbswing:{d:1,lock:[{u:1,j:'e'},{u:1,j:'k'}],grip:{t:'neutro',w:'cerrado',txt:'(manija de la pesa)'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'kb',at:'Gn'}],root:{j:'P',p:{A:[56,72],B:[62,68.6]}},
    A:{t:125,nk:-10,n:{s:5,e:3,h:65,k:22,a:10}},B:{t:180,n:{s:88,e:3,h:0,k:0,a:0}},
    ik:{An:{to:[62,107.45],flat:1}}},
  /* curl nórdico: de rodillas con los tobillos trabados, el cuerpo cae recto hacia adelante girando en las rodillas */
  nordic:{d:1,grip:{t:'apoyo',w:'medio',txt:'(listas para frenar la caída)'},
    eq:[{t:'floor'},{t:'roll',p:[18,94]},{t:'post',p:[22,94,22,110]}],root:{j:'Kn',p:[36,107]},
    A:{t:180,n:{s:20,e:60,h:0,k:110,a:20}},B:{t:110,nk:-10,n:{s:70,e:75,h:0,k:40,a:20}}},
  /* plancha Copenhague: de costado sobre el antebrazo, los pies arriba del banco, la cadera sube y baja */
  copenhagen:{v:'front',uni:1,bentKnees:1,grip:{t:'apoyo',w:'cerrado',txt:'(antebrazo)'},
    eq:[{t:'floor'},{t:'block',only:'R',r:[84,75,26,6]},{t:'post',p:[89,81,89,110]},{t:'post',p:[105,81,105,110]}],root:{j:'EL',p:[34,105]},ik:{AR:[89,72.4]},
    A:{t:-86,L:{a:60,e:-90,h:-10,k:0},R:{a:10,e:-5,h:0,k:0},ls:{faL:.3}},B:{t:-82,L:{a:60,e:-90,h:-8,k:0},R:{a:10,e:-5,h:0,k:0},ls:{faL:.3}}},
  /* curl femoral sentado: el rodillo traba los muslos arriba, cerca de la rodilla; la canilla baja hasta atrás */
  seatlegcurl:{d:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'abierto',txt:'(manijas del asiento)'},eq:[{t:'floor'},{t:'block',r:[30,85,24,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[42,91,42,110]},{t:'block',soft:1,r:[48,71.5,14,4]},{t:'lever',pv:[62,79.5],to:'An'},{t:'pad',at:{rel:'An',off:[0,4.6]}},{t:'pad',r:4.2,at:{rel:'Kn',off:[-6,-6.4]}}],root:{j:'P',p:[42,79.5]},A:{t:178,n:{s:12,e:10,h:92,k:2,a:-30}},B:{t:178,n:{s:12,e:10,h:92,k:100,a:10}}},
  /* abductores en máquina: de frente, sentado, las rodillas abren contra las almohadillas de afuera */
  hipabd:{v:'front',bentKnees:1,grip:{t:'neutro',w:'abierto',txt:'(manijas del asiento)'},
    eq:[{t:'floor'},{t:'wall',r:[47,26,26,54]},{t:'post',p:[60,80,60,110]},{t:'pad',r:4,at:{rel:'KL',off:[-4,0]}},{t:'pad',r:4,at:{rel:'KR',off:[4,0]}}],root:{j:'P',p:[60,78]},
    A:{L:{a:10,e:-10,h:5,k:-3},R:{a:10,e:-10,h:5,k:-3},ls:{faL:.765,faR:.765,th:.55}},B:{L:{a:10,e:-10,h:40,k:-30},R:{a:10,e:-10,h:40,k:-30},ls:{faL:.765,faR:.765,th:.55}}},
  /* aductores en máquina: de frente, sentado, las rodillas cierran contra las almohadillas de adentro */
  hipadd:{v:'front',bentKnees:1,grip:{t:'neutro',w:'abierto',txt:'(manijas del asiento)'},
    eq:[{t:'floor'},{t:'wall',r:[47,26,26,54]},{t:'post',p:[60,80,60,110]},{t:'pad',r:4,at:{rel:'KL',off:[4,0]}},{t:'pad',r:4,at:{rel:'KR',off:[-4,0]}}],root:{j:'P',p:[60,78]},
    A:{L:{a:10,e:-10,h:40,k:-30},R:{a:10,e:-10,h:40,k:-30},ls:{faL:.765,faR:.765,th:.55}},B:{L:{a:10,e:-10,h:5,k:-3},R:{a:10,e:-10,h:5,k:-3},ls:{faL:.765,faR:.765,th:.55}}},
  /* patada de glúteo en polea: con tobillera, una pierna va estirada hacia atrás */
  glutekick:{d:1,uni:1,feet:{n:'floor'},
    eq:[{t:'floor'},{t:'post',p:[94,36,94,110]},{t:'pulley',p:[98,104],to:'Af'}],root:{j:'P',p:[57.4,69]},
    A:{t:170,n:{s:82,e:10,h:8,k:0,a:2},f:{s:82,e:10,h:8,k:3,a:5}},B:{t:170,n:{s:82,e:10,h:8,k:0,a:2},f:{s:82,e:10,h:-28,k:8,a:30}},
    ik:{An:{to:[56,107.45],flat:1}}}
});
Object.assign(MKD,{
  /* ===== Lote 7: Pantorrilla ===== */
  /* gemelos de pie en máquina: la punta fija en el borde del escalón, el talón baja y sube; la palanca apoya en los hombros */
  calf:{d:1,tiptoe:1,lock:[{u:0,j:'k'},{u:1,j:'k'}],grip:{t:'neutro',w:'abierto',txt:'(manijas de la palanca)'},
    eq:[{t:'floor'},{t:'block',r:[66,104,22,6]},{t:'lever',pv:[96,40],to:'N',stand:96,headOK:'las almohadillas apoyan en los hombros'}],root:{j:'Tn',p:[67,102.25]},
    A:{t:180,n:{s:30,e:120,ab:70,h:0,k:2,a:22}},B:{t:180,n:{s:30,e:120,ab:70,h:0,k:2,a:-38}}},
  /* gemelos sentado: la almohadilla sobre las rodillas sube con los talones */
  seatedcalf:{d:1,tiptoe:1,grip:{t:'neutro',w:'medio',txt:'(sobre la almohadilla)'},
    eq:[{t:'floor'},{t:'block',r:[14,82,34,6]},{t:'post',p:[30,88,30,110]},{t:'block',r:[68,96,14,6]},{t:'post',p:[76,102,76,110]},{t:'pad',r:4,at:{rel:'Kn',off:[0,-6]}}],root:{j:'P',p:[37,77]},
    A:{t:182,n:{s:45,e:40,h:88,k:80,a:22}},B:{t:182,n:{s:45,e:40,h:88,k:80,a:-35}},
    ik:{Tn:[69,94.25]}},
  /* gemelos en prensa: piernas estiradas, solo el tobillo empuja la plataforma */
  presscalf:{d:1,lock:[{u:0,j:'k'},{u:1,j:'k'}],
    eq:[{t:'floor'},{t:'tbench'},{t:'post',p:[44,100,86,58]},{t:'plat',to:'Tn',ang:135,len:10}],root:{j:'P',p:[40,90]},
    A:{t:-130,n:{s:-40,e:20,h:85,k:0,a:15}},B:{t:-130,n:{s:-40,e:20,h:85,k:0,a:-40}}}
});
Object.assign(MKD,{
  /* ===== Lote 8: Core ===== */
  /* abdominales (crunch): acostado, rodillas dobladas y pies apoyados; despegan solo los hombros */
  crunch:{d:1,feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'}],root:{j:'P',p:[60,106]},
    A:{t:-90,nk:16,n:{s:10,e:140,h:55,k:110,a:0}},B:{t:-112,nk:30,n:{s:10,e:135,h:55,k:110,a:0}},
    ik:{An:{to:[80,107.45],flat:1}}},
  /* elevación de piernas colgado: piernas rectas todo el recorrido (rodillas a 0°), de colgando a la horizontal */
  legraise:{d:1,lock:[{u:0,j:'e'},{u:1,j:'e'}],grip:{t:'prono',w:'medio'},eq:[{t:'pullbar',p:[60,10]}],root:{j:'Gn',p:[60,10]},A:{t:182,n:{s:172,e:4,h:5,k:0,a:-45}},B:{t:174,n:{s:165,e:4,h:95,k:0,a:-20}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}}},
  /* plancha: sobre los antebrazos, cuerpo en línea */
  plank:{d:-1,grip:{t:'apoyo',w:'medio',txt:'(antebrazos)'},
    eq:[{t:'floor'}],root:{j:'P',p:{A:[61.7,96.2],B:[61.8,95.7]}},
    A:{t:98,n:{s:82,e:90,h:0,k:0,a:7}},B:{t:97,n:{s:83,e:90,h:1,k:0,a:5}},
    ik:{Wn:{to:[19,108.6],hand:90}}},
  /* giro ruso en 3/4 (yaw 30, pitch 30), sentado en V sobre el piso en perspectiva: torso 35° atrás, piernas arriba; el torso gira y el balón va de un costado de la cadera al otro */
  russian:{v:'front',uni:1,bentKnees:1,eq:[{t:'piso',p:[[61.5,68.3],[89.3,76.3],[67.3,95.3],[39.5,87.3]]},{t:'sombra',at:'P',k:0.5},{t:'ball',at:'GR',headOK:'el balón va adelante, a la altura de la cadera'}],root:{j:'P',p:[64.4,81.8]},A:{t:163.33,tk:1,sw:0.58,L:{h:106.48,k:-10.77,a:11.2,e:29.29},R:{h:-119.44,k:21.25,a:-14,e:-62.22},ls:{thL:0.58,shL:0.51,uaL:0.98,faL:0.8,thR:0.34,shR:0.36,uaR:0.99,faR:1,nk:1},rr:-53.95,nk:0},B:{t:163.33,tk:1,sw:0.99,L:{h:106.48,k:-10.77,a:-14.59,e:-55.95},R:{h:-119.44,k:21.25,a:-0.78,e:-11.04},ls:{thL:0.58,shL:0.51,uaL:0.99,faL:0.67,thR:0.34,shR:0.36,uaR:0.96,faR:0.62,nk:1},rr:5.04,nk:0},yaw:30,handHead:1,cam:{yaw:30,pitch:30},apoyo:['P']},
  /* press Pallof en 3/4 (yaw 40): de costado a la polea, las manos salen del pecho hacia adelante y vuelven sin que el cuerpo gire */
  pallof:{v:'front',grip:{t:'neutro',w:'cerrado'},eq:[{t:'floor'},{t:'post',p:[100,14,100,111]},{t:'pulley',p:[100,48],to:'GR'},{t:'handle',at:'GR'}],root:{j:'P',p:[58,68.6]},A:{t:180,tk:1,sw:0.77,L:{h:6.55,k:-6.55,a:13.45,e:-164.02},R:{h:6.55,k:-6.55,a:16.42,e:-127.87},ls:{thL:1,shL:1,uaL:0.97,faL:0.42,thR:1,shR:1,uaR:0.98,faR:1,nk:1},rr:0,nk:0},B:{t:180,tk:1,sw:0.77,L:{h:6.55,k:-6.55,a:70.22,e:0.05},R:{h:6.55,k:-6.55,a:-78.51,e:-0.04},ls:{thL:1,shL:1,uaL:0.47,faL:0.47,thR:1,shR:1,uaR:0.81,faR:0.81,nk:1},rr:0,nk:0},yaw:40,bentKnees:1,feet:{L:'floor',R:'floor'},lock:[{u:1,j:'e',sd:['L','R']}]},
  /* balón medicinal contra el piso: arriba estirado con el balón sobre la cabeza, abajo cadera y rodillas dobladas y el balón en el piso */
  medslam:{d:1,lock:[{u:0,j:'e'}],grip:{t:'neutro',w:'medio',txt:'(balón)'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'ball',at:'Gn'}],root:{j:'P',p:{A:[58,68.6],B:[44,82]}},
    A:{t:184,n:{s:172,e:4,h:0,k:2,a:0}},B:{t:115,nk:-10,n:{s:55,e:5,h:100,k:75,a:15}},
    ik:{An:{to:[58,107.45],flat:1}}},
  /* crunch en polea (SW-10, jefe-v100): de rodillas con la cadera encima de las rodillas (muslos verticales); se enrolla la parte alta de la espalda (cv) llevando los codos a los muslos y la cabeza abajo */
  cablecrunch:{d:1,grip:{t:'neutro',w:'cerrado',txt:'(soga)'},eq:[{t:'floor'},{t:'post',p:[108,4,108,110]},{t:'pulley',p:[104,8],to:'Gn',headOK:'la soga va junto a la cara'},{t:'handle',at:'Gn',headOK:'la soga va junto a la cara'}],root:{j:'Kn',p:[56,107]},A:{t:170,nk:0,cv:0,n:{s:100,e:120,ab:50,h:8,k:100,a:-20}},B:{t:125,nk:-40,cv:13,n:{s:100,e:120,ab:50,h:55,k:100,a:-20}},ik:{Gn:{to:{rel:'H',off:[3,2]},elbow:'down'},Gf:{to:{rel:'H',off:[0,2]},elbow:'down'}}},
  /* rueda abdominal: de rodillas, rueda hacia adelante con el cuerpo firme y vuelve */
  abwheel:{d:1,lock:[{u:0,j:'e'},{u:1,j:'e'}],grip:{t:'prono',w:'cerrado',txt:'(rueda)'},
    eq:[{t:'floor'},{t:'bar',at:'Gn'}],root:{j:'Kn',p:[30,107]},
    A:{t:120,n:{s:60,e:0,h:60,k:110,a:20}},B:{t:104,nk:-5,n:{s:150,e:0,h:25,k:55,a:20}},
    ik:{Gn:{A:[52,104.5],B:[102,104.5]}}},
  /* escaladores: plancha alta, una rodilla al pecho y cambia (alternado) */
  mtclimb:{d:-1,uni:1,tiptoe:1,lock:[{u:0,j:'e'}],grip:{t:'apoyo',w:'medio'},feet:{f:'floor'},eq:[{t:'floor'}],root:{j:'Tf',p:[94,109.25]},A:{t:88,nk:-5,n:{s:80,e:0,h:115,k:150,a:-20},f:{s:80,e:0,h:35,k:0,a:-40}},B:{t:108,nk:-5,n:{s:80,e:0,h:0,k:0,a:-40},f:{s:80,e:0,h:0,k:0,a:-40}},ik:{Wn:{to:[21,108.6],hand:90},Wf:{own:1,to:[24,106.4],hand:90}}},
  /* dead bug: boca arriba, brazos al techo y rodillas a 90°; estira brazo y pierna contrarios */
  deadbug:{d:1,uni:1,
    eq:[{t:'floor'}],root:{j:'P',p:[66,106]},
    A:{t:-90,nk:16,n:{s:90,e:0,h:90,k:90,a:-20},f:{s:90,e:0,h:90,k:90,a:-20}},B:{t:-90,nk:16,n:{s:172,e:0,h:90,k:90,a:-20},f:{s:90,e:0,h:10,k:0,a:-30}}}
});
Object.assign(MKD,{
  /* ===== Lote 9: Calistenia y habilidades (convertidos de la figura vieja y ajustados) ===== */
  kneepush:{eq:[{t:'floor'}],d:-1,A:{t:119,nk:0,n:{s:60,e:0,h:0,k:55,a:35}},B:{t:102,nk:-0.1,n:{s:0,e:110,h:0,k:55,a:35}},ik:{Wn:{to:[28,108.6],hand:90},Wf:{to:[28,108.6],hand:90}},root:{j:'Kn',p:[71.5,105.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:0,j:'e'}]},
  /* flexiones diamante en 3/4 (yaw 35, desde arriba), sobre el piso en perspectiva con sombras de apoyo: manos juntas debajo del pecho y codos pegados, que van hacia atrás */
  diamond:{A:{t:280.95,tk:0.57,sw:0.84,L:{h:-5.11,k:2.42,a:85.82,e:0.02},R:{h:0.61,k:2.08,a:-110.54,e:-0.02},ls:{thL:0.54,shL:0.58,uaL:0.96,faL:0.96,thR:0.63,shR:0.58,uaR:0.85,faR:0.85,nk:0.57},rr:-13.47,nk:0},B:{t:292.92,tk:0.62,sw:0.84,L:{h:-2.11,k:2.91,a:7.94,e:101.49},R:{h:-3.35,k:2.55,a:-3.41,e:-146.07},ls:{thL:0.58,shL:0.62,uaL:0.64,faL:0.95,thR:0.66,shR:0.62,uaR:0.56,faR:0.99,nk:0.62},rr:-13.47,nk:0},fases:[{u:0.25,t:284.08,tk:0.59,sw:0.84,L:{h:-4.32,k:2.57,a:62.76,e:38.08},R:{h:-0.46,k:2.21,a:-85.93,e:-40.76},ls:{thL:0.55,shL:0.59,uaL:0.79,faL:1,thR:0.63,shR:0.59,uaR:0.54,faR:0.97,nk:0.59},rr:-13.47,nk:0},{u:0.5,t:287.13,tk:0.6,sw:0.84,L:{h:-3.55,k:2.7,a:45.91,e:60.82},R:{h:-1.48,k:2.34,a:-57.6,e:-77.58},ls:{thL:0.56,shL:0.6,uaL:0.7,faL:0.99,thR:0.64,shR:0.6,uaR:0.41,faR:0.99,nk:0.6},rr:-13.47,nk:0},{u:0.75,t:290.08,tk:0.61,sw:0.84,L:{h:-2.81,k:2.81,a:27.75,e:81.89},R:{h:-2.45,k:2.45,a:-24.62,e:-117.8},ls:{thL:0.57,shL:0.61,uaL:0.65,faL:0.97,thR:0.65,shR:0.61,uaR:0.42,faR:0.99,nk:0.61},rr:-13.47,nk:0}],yaw:35,v:'front',bentKnees:1,grip:{t:'apoyo',w:'cerrado'},lock:[{u:0,j:'e',sd:['L','R']}],eq:[{t:'piso',p:[[74.2,39.3],[119.4,50.1],[46.8,85.6],[1.6,74.8]]},{t:'sombra',at:'GL',k:0.34},{t:'sombra',at:'GR',k:0.34},{t:'sombra',at:'TL',k:0.34},{t:'sombra',at:'TR',k:0.34}],root:{j:'GR',p:[46.5,82.2]},ik:{GL:{to:[44,81.4]}},cam:{yaw:35,pitch:20},apoyo:['GL','GR','TL','TR']},
  /* flexiones arquero en 3/4 sobre el piso en perspectiva: manos bien abiertas; baja hacia un lado con ese brazo doblado y el otro estirado al costado todo el recorrido */
  archerpush:{A:{t:280.95,tk:0.57,sw:0.84,L:{h:-5.11,k:2.42,a:127.88,e:3.07},R:{h:0.61,k:2.08,a:-76.36,e:-2.22},ls:{thL:0.54,shL:0.58,uaL:0.83,faL:0.82,thR:0.63,shR:0.58,uaR:1,faR:1,nk:0.57},rr:-13.47,nk:0},B:{t:292.12,tk:0.62,sw:0.84,L:{h:-2.91,k:2.91,a:178.51,e:2.66},R:{h:-2.55,k:2.55,a:-27.69,e:-116.11},ls:{thL:0.58,shL:0.62,uaL:0.77,faL:0.77,thR:0.66,shR:0.62,uaR:0.79,faR:0.96,nk:0.62},rr:-13.47,nk:0},fases:[{u:0.125,t:282.42,tk:0.58,sw:0.84,L:{h:-4.82,k:2.49,a:132.98,e:3.1},R:{h:0.18,k:2.15,a:-63.85,e:-29.68},ls:{thL:0.54,shL:0.59,uaL:0.82,faL:0.81,thR:0.63,shR:0.59,uaR:0.97,faR:0.99,nk:0.58},rr:-13.47,nk:0},{u:0.25,t:283.86,tk:0.58,sw:0.84,L:{h:-4.54,k:2.57,a:138.32,e:3.12},R:{h:-0.24,k:2.21,a:-58.73,e:-43.39},ls:{thL:0.55,shL:0.59,uaL:0.81,faL:0.8,thR:0.63,shR:0.59,uaR:0.94,faR:0.99,nk:0.58},rr:-13.47,nk:0},{u:0.375,t:285.29,tk:0.59,sw:0.84,L:{h:-4.26,k:2.63,a:143.92,e:3.13},R:{h:-0.65,k:2.28,a:-54.52,e:-55.12},ls:{thL:0.55,shL:0.6,uaL:0.8,faL:0.79,thR:0.64,shR:0.6,uaR:0.91,faR:0.98,nk:0.59},rr:-13.47,nk:0},{u:0.5,t:286.7,tk:0.59,sw:0.84,L:{h:-3.98,k:2.7,a:149.84,e:3.11},R:{h:-1.05,k:2.34,a:-50.43,e:-66.26},ls:{thL:0.56,shL:0.6,uaL:0.79,faL:0.78,thR:0.64,shR:0.6,uaR:0.88,faR:0.98,nk:0.59},rr:-13.47,nk:0},{u:0.625,t:288.09,tk:0.6,sw:0.84,L:{h:-3.71,k:2.76,a:156.14,e:3.07},R:{h:-1.45,k:2.39,a:-46.07,e:-77.44},ls:{thL:0.56,shL:0.6,uaL:0.78,faL:0.78,thR:0.65,shR:0.6,uaR:0.85,faR:0.97,nk:0.6},rr:-13.47,nk:0},{u:0.75,t:289.46,tk:0.61,sw:0.84,L:{h:-3.44,k:2.81,a:162.91,e:2.99},R:{h:-1.83,k:2.45,a:-41.11,e:-89.13},ls:{thL:0.57,shL:0.61,uaL:0.78,faL:0.77,thR:0.65,shR:0.61,uaR:0.83,faR:0.97,nk:0.61},rr:-13.47,nk:0},{u:0.875,t:290.8,tk:0.61,sw:0.84,L:{h:-3.17,k:2.86,a:170.29,e:2.86},R:{h:-2.19,k:2.5,a:-35.17,e:-101.81},ls:{thL:0.57,shL:0.61,uaL:0.77,faL:0.77,thR:0.65,shR:0.61,uaR:0.8,faR:0.96,nk:0.61},rr:-13.47,nk:0}],yaw:35,v:'front',uni:1,bentKnees:1,grip:{t:'apoyo',w:'abierto'},lock:[{u:0,j:'e',sd:['L','R']},{u:'all',j:'e',sd:['L']}],eq:[{t:'piso',p:[[71.5,38.1],[131.3,52.5],[60.8,86.9],[1,72.6]]},{t:'sombra',at:'GL',k:0.34},{t:'sombra',at:'GR',k:0.34},{t:'sombra',at:'TL',k:0.34},{t:'sombra',at:'TR',k:0.34}],root:{j:'GR',p:[60.5,83.5]},ik:{GL:{to:[21.3,74]}},cam:{yaw:35,pitch:20},apoyo:['GL','GR','TL','TR']},
  /* flexiones pseudo planche: de costado, dedos hacia atrás y las manos a la altura de la cintura (8–10 de la cadera); los hombros bien adelante de las manos; en puntas de pie */
  pppush:{eq:[{t:'floor'}],d:-1,A:{t:102.3,nk:-15,n:{s:37.7,e:0,h:0,k:0,a:-50}},B:{t:92.9,nk:-10,n:{s:-5.6,e:54.6,h:0,k:0,a:-50}},ik:{Wn:{to:[50,108.6],hand:-90}},root:{j:'Wn',p:[50,108.6]},grip:{t:'apoyo',w:'medio',txt:'(dedos hacia atrás)'},lock:[{u:0,j:'e'}],tiptoe:1},
  /* flexión a un brazo en 3/4 desde arriba (yaw 60, pitch 35) sobre el piso en perspectiva: piernas abiertas, la otra mano en la espalda; la mano de apoyo debajo del pecho */
  oapush:{A:{t:279.14,tk:0.86,sw:0.7,L:{h:-24.65,k:10.19,a:-62.36,e:93.75},R:{h:-13.47,k:5.17,a:-97.5,e:-9.16},ls:{thL:0.66,shL:0.74,uaL:0.96,faL:0.96,thR:0.99,shR:0.96,uaR:0.69,faR:0.69,nk:0.86},rr:-44.81,nk:0},B:{t:286.35,tk:0.9,sw:0.7,L:{h:-22.39,k:9.86,a:-55.15,e:93.75},R:{h:-16.48,k:5.57,a:-24.79,e:-145.11},ls:{thL:0.71,shL:0.78,uaL:0.96,faL:0.96,thR:1,shR:0.98,uaR:0.94,faR:0.82,nk:0.9},rr:-44.81,nk:0},fases:[{u:0.25,t:280.98,tk:0.87,sw:0.7,L:{h:-24.11,k:10.12,a:-60.52,e:93.75},R:{h:-14.26,k:5.27,a:-58.88,e:-79.21},ls:{thL:0.67,shL:0.75,uaL:0.96,faL:0.96,thR:0.99,shR:0.97,uaR:0.74,faR:0.76,nk:0.87},rr:-44.81,nk:0},{u:0.5,t:282.8,tk:0.88,sw:0.7,L:{h:-23.55,k:10.04,a:-58.71,e:93.75},R:{h:-15.03,k:5.38,a:-43.44,e:-108.09},ls:{thL:0.68,shL:0.76,uaL:0.96,faL:0.96,thR:0.99,shR:0.97,uaR:0.81,faR:0.8,nk:0.88},rr:-44.81,nk:0},{u:0.75,t:284.59,tk:0.89,sw:0.7,L:{h:-22.97,k:9.96,a:-56.92,e:93.75},R:{h:-15.77,k:5.48,a:-32.82,e:-128.67},ls:{thL:0.69,shL:0.77,uaL:0.96,faL:0.96,thR:1,shR:0.97,uaR:0.88,faR:0.82,nk:0.89},rr:-44.81,nk:0}],yaw:60,v:'front',uni:1,bentKnees:1,grip:{t:'apoyo',w:'cerrado',txt:'(una mano)'},lock:[{u:0,j:'e',sd:['R']}],eq:[{t:'piso',p:[[80.8,32.8],[112.8,64.5],[30.8,91.7],[-1.2,59.9]]},{t:'sombra',at:'GR',k:0.57},{t:'sombra',at:'TL',k:0.57},{t:'sombra',at:'TR',k:0.57}],root:{j:'GR',p:[34.7,86.4]},cam:{yaw:60,pitch:35},apoyo:['GR','TL','TR']},
  /* flexión en planche: los pies en el aire todo el recorrido (16 sobre el piso abajo) */
  planchepush:{eq:[{t:'floor'}],d:-1,A:{t:92,nk:-24,n:{s:60,e:0,h:-4,k:0,a:-40}},B:{t:90,nk:-8.7,n:{s:0,e:90,h:-8,k:3.2,a:-40}},root:{j:'Wn',p:[36,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:0,j:'e'}],ik:{Wn:{to:[36,108.6],hand:-90}}},
  austrow:{eq:[{t:'floor'},{t:'post',p:[20,46,54,46]},{t:'post',p:[24,46,24,111]}],d:1,A:{t:-115,nk:-40,n:{s:139.7,e:0,h:1.2,k:0,a:0}},B:{t:-115,nk:-40,n:{s:35.8,e:148,h:-1.3,k:0,a:0}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[36,46]},grip:{t:'prono',w:'medio'}},
  /* dominadas en L de costado (excepción a la vista de atrás, decisión del jefe: la L es lo que define el ejercicio): piernas rectas, juntas y horizontales, pies en punta (lim tobillo −70: flexión plantar de gimnasta); arriba el mentón pasa la barra */
  lpullup:{grip:{t:'prono',w:'medio'},eq:[{t:'pullbar',p:[64,21]}],root:{j:'Gn',p:[64,21]},A:{t:175,nk:0,n:{s:155,e:10,h:95,k:0,a:-65}},B:{t:180,nk:-10,n:{s:-5,e:140,h:90,k:0,a:-65}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},lock:[{u:0,j:'e'}],d:1,lim:{a:[-70,40]}},
  /* dominada arquero (vista de atrás): agarre muy ancho (manos en 36 y 86); sube hacia la mano derecha y el brazo izquierdo queda estirado sobre la barra todo el recorrido (los hombros giran alrededor de esa mano: root seq). Arriba el mentón pasa la barra junto a la mano que trabaja (10 al costado, media espalda); ese codo va adelante, por eso el brazo y el antebrazo se ven en escorzo (ls 0,55) */
  archerpull:{eq:[{t:'pullbar',front:1,p:[20,26,100]}],v:'front',A:{t:180,tk:1,L:{a:150,e:0,h:4,k:-22},R:{a:150,e:0,h:4,k:-22},ls:{shL:0.55,shR:0.55}},B:{t:180,tk:1,L:{a:90,e:0,h:4,k:-22},R:{a:30,e:150,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:0.55,faR:0.55}},root:{j:'N',p:{seq:[[0,[61,49.73]],[0.125,[64.11,47.6]],[0.25,[66.93,45.12]],[0.375,[69.44,42.32]],[0.5,[71.59,39.23]],[0.625,[73.35,35.91]],[0.75,[74.7,32.39]],[0.875,[75.62,28.74]],[1,[76.08,25.01]]]}},ik:{GL:{to:[36,26],elbow:'down'},GR:{to:[86,26],elbow:'down'}},grip:{t:'prono',w:'abierto'},lock:[{u:0,j:'e',sd:['L','R']},{u:'all',j:'e',sd:['L']}],back:1,bentKnees:1,uni:1},
  /* muscle-up (SW-10, Juan): fases separadas y en orden (fases): colgado con los brazos estirados → tirón hasta que la barra toca la parte baja del pecho (40 %) → transición: las muñecas giran sobre la barra y el pecho pasa por encima, abajo de un fondo (65 %) → fondo hasta estirar. Va solo de ida (fwd) */
  muscleup:{eq:[{t:'pullbar',mount:'v',p:[60,50]}],d:1,A:{t:178,nk:0,n:{s:175,e:4,w:0,h:95,k:0,a:0}},B:{t:170,nk:10,n:{s:10,e:0,w:0,h:10,k:25,a:-20}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[60,50]},grip:{t:'prono',w:'medio'},lock:[{u:0,j:'e'},{u:1,j:'e'}],fwd:1,fases:[{u:0.4,t:205,nk:-10,n:{s:-50,e:140,w:0,h:40,k:40,a:-20}},{u:0.65,t:150,nk:-10,n:{s:-60,e:90,w:0,h:40,k:60,a:-20}}]},
  /* dominada a un brazo (vista de atrás, juan-4): el antebrazo queda quieto y vertical debajo de la barra todo el recorrido y el cuerpo pegado debajo de la mano; el codo va hacia adelante (el brazo se ve en escorzo a mitad de camino); el otro brazo cuelga. lim codo 170: arriba el brazo queda casi pegado al antebrazo */
  oapull:{eq:[{t:'pullbar',front:1,p:[26,26,98]}],v:'front',A:{t:180,tk:1,L:{a:8,e:10,h:4,k:-22},R:{a:175,e:0,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:1,faR:1}},B:{t:180,tk:1,L:{a:15,e:30,h:4,k:-22},R:{a:30,e:150,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:1,faR:1}},root:{j:'N',p:{seq:[[0,[55,54]],[0.25,[54.27,47.08]],[0.5,[53.55,40.15]],[0.75,[52.83,33.23]],[1,[52.1,26.3]]]}},ik:{GR:{to:[64,26],elbow:'down'}},grip:{t:'prono',w:'cerrado',txt:'(una mano)'},uni:1,back:1,bentKnees:1,lock:[{u:0,j:'e',sd:['R']}],lim:{fe:[-170,170]},fases:[{u:0.25,t:180,tk:1,L:{a:15,e:30,h:4,k:-22},R:{a:30,e:150,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:0.508,faR:1}},{u:0.5,t:180,tk:1,L:{a:15,e:30,h:4,k:-22},R:{a:30,e:150,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:0.104,faR:1}},{u:0.75,t:180,tk:1,L:{a:15,e:30,h:4,k:-22},R:{a:30,e:150,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaR:0.508,faR:1}}]},
  /* fondos en banco (SW-10, Juan): manos en el borde detrás de la cadera, antebrazo casi vertical (10°); arriba las piernas casi estiradas con los talones lejos (no se lee sentado); abajo el brazo paralelo al piso con el codo a 100° y el hombro a 90° de extensión (lim s −90). Talones en el piso */
  benchdip:{eq:[{t:'floor'},{t:'block',r:[4,83,24,6]},{t:'post',p:[9,89,9,110]},{t:'post',p:[23,89,23,110]}],d:1,A:{t:198,nk:0,n:{s:-18,e:0,w:0,h:70,k:10,a:0}},B:{t:180,nk:5,n:{s:-90,e:100,w:0,h:90,k:60,a:0}},root:{j:'Gn',p:[27.5,81.2]},grip:{t:'prono',w:'medio',txt:'(manos en el banco)'},ik:{An:{to:[62.5,107.45],flat:1},Af:{to:[59,107.45],flat:1}},lim:{s:[-90,180]},lock:[{u:0,j:'e'}],feet:{n:'floor',f:'floor'}},
  ringdip:{eq:[{t:'ring',at:'Gn'}],d:1,A:{t:170,nk:0,n:{s:10,e:0,w:0,h:12,k:75,a:20}},B:{t:150,nk:-10,n:{s:-60,e:90,w:0,h:32,k:75,a:20}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[60,63]},grip:{t:'neutro',w:'medio',txt:'(anillas)'},lock:[{u:0,j:'e'}]},
  airsquat:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-6.2,e:4.4,h:0,k:0,a:0}},B:{t:144.9,nk:-0.5,n:{s:115.2,e:9.9,h:119.9,k:94.8,a:10}},ik:{An:{to:[60,107.45],flat:1},Af:{to:[60,107.45],flat:1}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[60,69],B:[43.4,91]}}},
  shrimp:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:70,e:10.2,h:0,k:0,a:0},f:{s:70,e:10.2,h:-20,k:150,a:35}},B:{t:150,nk:-0.6,n:{s:95.1,e:9.6,h:100,k:110,a:14.9},f:{s:95.1,e:9.6,h:0,k:155,a:35}},ik:{An:{to:[60,107.45],flat:1},Gf:{own:1,rel:'Af',off:[4,-2]}},feet:{n:'floor'},root:{j:'P',p:{A:[60,69],B:[46,88]}},uni:1},
  pistol:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-6.2,e:4.4,h:0,k:0,a:0},f:{s:-6.2,e:4.4,h:25.2,k:15.1,a:-20.2}},B:{t:150,nk:0.1,n:{s:115,e:0,h:125,k:135,a:30},f:{s:115,e:0,h:119.9,k:0,a:-24.9}},ik:{An:{to:{A:[60,107.45],B:[58,107.45]},flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[58,69],B:[48,96]}},uni:1},
  /* dragon pistol en vista 3/4 (yaw 40): la pose se arma en 3D y se proyecta (.equipo/SW-10/tres-cuartos.js con dragon-3q.json). Brazos adelante,
     torso inclinado, la rodilla de apoyo bien flexionada hacia adelante y la pierna libre cruzando por detrás de la de apoyo hasta el otro lado */
  /* dragon pistol en vista 3/4 (yaw 40): la pose se arma en 3D y se proyecta (.equipo/SW-10/tres-cuartos.js con dragon-3q.json). Brazos adelante, torso inclinado, la rodilla de apoyo bien flexionada hacia adelante y la pierna libre cruzando por detrás de la de apoyo hasta el otro lado, en el aire (15 sobre el piso al final) */
  dragon:{v:'front',yaw:40,uni:1,bentKnees:1,eq:[{t:'floor'}],feet:{R:'floor'},root:{j:'P',p:{A:[59.5,68.6],B:[60,99.5]}},A:{t:180,tk:1,sw:0.77,L:{h:-17.43,k:-35.99,a:81.16,e:0},R:{h:0,k:0,a:-81.16,e:0},ls:{thL:1,shL:0.9,uaL:0.65,faL:0.65,thR:1,shR:1,uaR:0.65,faR:0.65,nk:1},rr:0,nk:0},B:{t:200.36,tk:0.92,sw:0.77,L:{h:-71.16,k:-23.03,a:101.52,e:8.84},R:{h:-135.7,k:143.58,a:-101.52,e:-8.84},ls:{thL:0.98,shL:0.79,uaL:0.65,faL:0.64,thR:0.56,shR:0.87,uaR:0.65,faR:0.64,nk:0.92},rr:0,nk:0},ik:{AR:{to:[64.5,107.45],knee:'back'}}},
  tucklsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:124.6,k:107.1,a:-21}},B:{t:-176.4,nk:9.3,n:{s:-9.6,e:0,h:124.6,k:107.1,a:-21}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  lsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:86.4,k:0,a:-45}},B:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:89,k:0,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  vsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-172.9,nk:1.4,n:{s:-13.8,e:0,h:132,k:0,a:-45}},B:{t:-172.9,nk:1.9,n:{s:-13.8,e:0,h:132,k:0,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  wallhs:{eq:[{t:'floor'},{t:'post',p:[64,4,64,111]}],d:-1,A:{t:4,nk:0.2,n:{s:176,e:0,h:2,k:0,a:35}},B:{t:5,nk:-0.1,n:{s:175,e:0,h:2.2,k:0,a:35}},ik:{Wn:{to:[54,108.6],hand:90},Wf:{to:[54,108.6],hand:90}},root:{j:'P',p:{A:[56.1,51.1],B:[56.6,51.1]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  freehs:{eq:[{t:'floor'}],d:-1,A:{t:0,nk:0,n:{s:178,e:0,h:0,k:0,a:35}},B:{t:1.9,nk:0,n:{s:178,e:0,h:0.1,k:0,a:35}},ik:{Wn:{to:[60,108.6],hand:90},Wf:{to:[60,108.6],hand:90}},root:{j:'P',p:{A:[60,51],B:[61,51]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  hspu:{eq:[{t:'floor'},{t:'post',p:[64,4,64,111]}],d:-1,A:{t:4,nk:0.2,n:{s:176,e:0,h:2,k:0,a:35}},B:{t:6.1,nk:0.4,n:{s:123.7,e:90.2,h:0.8,k:0,a:35,ab:45}},ik:{Wn:{to:[54,108.6],hand:90},Wf:{to:[54,108.6],hand:90}},root:{j:'P',p:{A:[56.1,51.1],B:[54.8,59.2]}},grip:{t:'apoyo',w:'medio'}},
  freehspu:{eq:[{t:'floor'}],d:-1,A:{t:0,nk:0,n:{s:178,e:0,h:0,k:0,a:35}},B:{t:2.1,nk:0.2,n:{s:127.7,e:90.2,h:-0.1,k:0.2,a:35,ab:55}},ik:{Wn:{to:[60,108.6],hand:90},Wf:{to:[60,108.6],hand:90}},root:{j:'P',p:{A:[60,51],B:[58.7,59.1]}},grip:{t:'apoyo',w:'medio'}},
  /* front lever encogido: brazos rectos con la barra encima del pecho, la espalda horizontal, rodillas al pecho y la cabeza en línea */
  tuckfl:{eq:[{t:'pullbar',p:[48,37]}],d:1,A:{t:-93.8,nk:0,n:{s:68.6,e:0,h:132,k:144.2,a:-45}},B:{t:-95.7,nk:0,n:{s:70.5,e:0,h:132,k:144.2,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,37]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  /* front lever avanzado: brazos rectos con la barra encima del pecho, la espalda horizontal, las piernas dobladas a 90° y la cabeza en línea */
  advfl:{eq:[{t:'pullbar',p:[48,37]}],d:1,A:{t:-91.7,nk:0,n:{s:66.4,e:0,h:84.1,k:86,a:-45}},B:{t:-93.4,nk:0,n:{s:68.1,e:0,h:85.8,k:86,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,37]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  /* front lever abierto en 3/4 baja (yaw 32, pitch 8): el cuerpo se lee horizontal y las piernas se abren en profundidad (en V); la barra pasa por las dos manos */
  straddlefl:{A:{t:105.58,tk:0.55,sw:0.85,L:{h:10.72,k:0,a:112.85,e:3.96},R:{h:40.06,k:0,a:-116.1,e:-3.85},ls:{thL:0.86,shL:0.86,uaL:0.99,faL:0.97,thR:0.17,shR:0.17,uaR:1,faR:0.98,nk:0.55},rr:-4.97,nk:0},B:{t:105.58,tk:0.55,sw:0.85,L:{h:11.9,k:0,a:112.85,e:3.96},R:{h:36.33,k:0,a:-116.1,e:-3.85},ls:{thL:0.85,shL:0.85,uaL:0.99,faL:0.97,thR:0.15,shR:0.15,uaR:1,faR:0.98,nk:0.55},rr:-4.97,nk:0},yaw:32,v:'front',bentKnees:1,uni:1,grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e',sd:['L','R']}],eq:[{t:'post',barra:1,p:[68.5,41.3,105.5,44.2]}],root:{j:'GR',p:[95.5,43.4]},ik:{GL:{to:[78.5,42.1]}},cam:{yaw:32,pitch:8}},
  /* front lever completo: colgado de la barra con los brazos rectos y la barra encima del pecho; el cuerpo horizontal boca arriba y la cabeza en línea */
  fullfl:{eq:[{t:'pullbar',p:[48,37]}],d:1,A:{t:-91.7,nk:0,n:{s:66.4,e:0,h:-1.5,k:0.4,a:-45}},B:{t:-93.4,nk:0,n:{s:68.1,e:0,h:0.2,k:3.9,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,37]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  tuckbl:{eq:[{t:'pullbar',p:[57,12]}],d:-1,A:{t:93.8,nk:20.5,n:{s:-43.3,e:0,h:132,k:132.3,a:35}},B:{t:95.7,nk:22.4,n:{s:-45.2,e:0,h:132,k:132.3,a:35}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  /* back lever abierto en 3/4 baja (yaw 32, pitch 8): boca abajo, los brazos van hacia atrás hasta la barra; las piernas se abren en profundidad (en V) */
  straddlebl:{A:{t:99.46,tk:0.54,sw:0.85,L:{h:4.6,k:0,a:68.48,e:6.26},R:{h:46.18,k:0,a:-71.81,e:-6.59},ls:{thL:0.86,shL:0.86,uaL:0.75,faL:0.81,thR:0.17,shR:0.17,uaR:0.72,faR:0.78,nk:0.54},rr:-4.97,nk:0},B:{t:99.46,tk:0.54,sw:0.85,L:{h:5.78,k:0,a:68.48,e:6.26},R:{h:42.45,k:0,a:-71.81,e:-6.59},ls:{thL:0.85,shL:0.85,uaL:0.75,faL:0.81,thR:0.15,shR:0.15,uaR:0.72,faR:0.78,nk:0.54},rr:-4.97,nk:0},yaw:32,v:'front',bentKnees:1,uni:1,grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e',sd:['L','R']}],eq:[{t:'post',barra:1,p:[54.8,46.2,91.8,49.5]}],root:{j:'GR',p:[81.8,48.6]},ik:{GL:{to:[64.8,47.1]}},cam:{yaw:32,pitch:8}},
  fullbl:{eq:[{t:'pullbar',p:[57,12]}],d:1,A:{t:-91.6,nk:-18.3,n:{s:41.1,e:0,h:1.6,k:0,a:-45}},B:{t:-93.2,nk:-19.9,n:{s:42.7,e:0,h:0,k:0.4,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  tuckpl:{eq:[{t:'floor'}],d:-1,A:{t:88,nk:-15.7,n:{s:74,e:0,h:132,k:150,a:35,w:-62}},B:{t:86,nk:-13.5,n:{s:77,e:0,h:132,k:150,a:35,w:-65}},root:{j:'Wn',p:[40,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  advpl:{eq:[{t:'floor'}],d:-1,A:{t:88.2,nk:-13.1,n:{s:98.1,e:0,h:83,k:81.3,a:35}},B:{t:90,nk:-11.3,n:{s:96.3,e:0,h:81.3,k:81.3,a:35}},ik:{Wn:{to:[40,108.6],hand:90}},root:{j:'P',p:{A:[70,80],B:[70,81]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  /* planche abierta en 3/4 baja (yaw 32, pitch 8) sobre el piso en perspectiva: las manos en el piso a la altura de la cadera y las piernas abiertas en V */
  straddlepl:{A:{t:99.46,tk:0.54,sw:0.85,L:{h:4.6,k:0,a:-54.75,e:-4.49},R:{h:46.18,k:0,a:57.93,e:4.75},ls:{thL:0.86,shL:0.86,uaL:0.89,faL:0.93,thR:0.17,shR:0.17,uaR:0.87,faR:0.92,nk:0.54},rr:-4.97,nk:0},B:{t:99.46,tk:0.54,sw:0.85,L:{h:5.78,k:0,a:-54.75,e:-4.49},R:{h:42.45,k:0,a:57.93,e:4.75},ls:{thL:0.85,shL:0.85,uaL:0.89,faL:0.93,thR:0.15,shR:0.15,uaR:0.87,faR:0.92,nk:0.54},rr:-4.97,nk:0},yaw:32,v:'front',bentKnees:1,uni:1,grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e',sd:['L','R']}],eq:[{t:'piso',p:[[63.9,76.6],[91.1,79],[82.5,80.9],[55.3,78.5]]},{t:'sombra',at:'GL',k:0.15},{t:'sombra',at:'GR',k:0.15}],root:{j:'GR',p:[81.7,79.5]},cam:{yaw:32,pitch:8},apoyo:['GL','GR'],ik:{GL:{to:[64.8,78]}}},
  fullpl:{eq:[{t:'floor'}],d:-1,A:{t:92,nk:-24,n:{s:60,e:0,h:0,k:0,a:35,w:-60}},B:{t:90,nk:-22.2,n:{s:64,e:0,h:-1.8,k:0,a:35,w:-64}},root:{j:'Wn',p:[28,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  pikepush:{eq:[{t:'floor'}],d:1,A:{t:-41.3,nk:-5.8,n:{s:-58,e:5.4,h:-28,k:3.2,a:-26.6}},B:{t:-34,nk:-2,n:{s:-58,e:106.2,h:-28,k:5.9,a:-26.6}},ik:{An:{to:[102,107.45],flat:1},Af:{to:[102,107.45],flat:1},Wn:{to:[36,108.6],hand:90},Wf:{to:[36,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[72,52],B:[74,58]}},grip:{t:'apoyo',w:'medio'}},
  crow:{eq:[{t:'floor'}],d:-1,A:{t:57.5,nk:-1.5,n:{s:85.6,e:48.2,h:132,k:121,a:35}},B:{t:55.7,nk:-1.8,n:{s:87.4,e:48.2,h:132,k:121,a:35}},ik:{Wn:{to:[42,108.6],hand:90},Wf:{to:[42,108.6],hand:90}},root:{j:'P',p:{A:[60,78],B:[60,77]}},grip:{t:'apoyo',w:'medio'}},
  /* front lever a una pierna: brazos rectos con la barra encima del pecho, una pierna estirada y la otra doblada, la cabeza en línea */
  onelegfl:{eq:[{t:'pullbar',p:[48,37]}],d:1,A:{t:-91.7,nk:0,n:{s:66.4,e:0,h:1.7,k:0,a:-45},f:{s:76.4,e:0,h:83.6,k:85.4,a:-45}},B:{t:-93.4,nk:0,n:{s:68.1,e:0,h:0.2,k:0.4,a:-45},f:{s:78.1,e:0,h:85.8,k:86,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,37]},grip:{t:'prono',w:'medio'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  /* skin the cat: colgado → invertido encogido (cadera sobre los hombros, rodillas entre los brazos) → german hang (lim hombro −140: los hombros en extensión extrema con los brazos detrás del cuerpo, que es la posición final del ejercicio) */
  skincat:{eq:[{t:'pullbar',p:[60,18]}],d:-1,A:{t:-180,nk:0,n:{s:178,e:0,h:60,k:140,a:35}},B:{t:160,nk:20,n:{s:-140,e:0,h:-10,k:20,a:20}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[60,18]},grip:{t:'prono',w:'medio'},lim:{s:[-140,180]},M:{t:0,nk:0,n:{s:20,e:0,h:135,k:140,a:20}}},
  advbl:{eq:[{t:'pullbar',p:[57,12]}],d:-1,A:{t:91.6,nk:18.3,n:{s:-41.1,e:0,h:88.4,k:90,a:35}},B:{t:93.2,nk:19.9,n:{s:-42.7,e:0,h:86.8,k:90,a:35}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  onelegl:{eq:[{t:'floor'},{t:'post',p:[40,76,66,76]},{t:'post',p:[46,76,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:86.4,k:0,a:-45},f:{s:-9.9,e:0,h:63.2,k:76.3,a:9.5}},B:{t:-176.4,nk:9.3,n:{s:-9.6,e:0,h:89,k:0,a:-45},f:{s:-9.6,e:0,h:59.9,k:72.9,a:9.5}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,76]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  russiandip:{eq:[{t:'floor'},{t:'post',p:[44,63,76,63]},{t:'post',p:[70,63,70,111]}],d:1,A:{t:172,nk:0,n:{s:8,e:0,w:0,h:15,k:80,a:20}},B:{t:178,nk:-5,n:{s:-18,e:110,w:0,h:60,k:110,a:20}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[72,63]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},M:{t:152,nk:-10,n:{s:-60,e:90,w:0,h:32,k:80,a:20}},lock:[{u:0,j:'e'}]},
  impdip:{eq:[{t:'floor'},{t:'post',p:[44,63,76,63]},{t:'post',p:[70,63,70,111]}],d:1,A:{t:178.1,nk:0,n:{s:1.9,e:90,h:-8.2,k:89.9,a:35}},B:{t:178.1,nk:0,n:{s:1.9,e:0,h:-8.2,k:89.9,a:35}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[65,63]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'}},
  boxpistol:{eq:[{t:'floor'},{t:'block',r:[36,90,18,20]}],d:1,A:{t:180,nk:0,n:{s:90,e:0,h:0,k:0,a:0},f:{s:90,e:0,h:25.2,k:15.1,a:-20.2}},B:{t:164.9,nk:-0.2,n:{s:105.1,e:0,h:95.3,k:95.1,a:14.9},f:{s:105.1,e:0,h:110.2,k:0.4,a:-24.6}},ik:{An:{to:{A:[60,107.45],B:[64,107.45]},flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[60,69],B:[48,84.5]}},uni:1},
  vflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[30,6,30,111]}],root:{j:'GR',p:[30,32]},A:{t:-30,L:{a:180,e:0,h:0,k:0},R:{a:30,e:0,h:0,k:0}},B:{t:-30,L:{a:180,e:0,h:4,k:0},R:{a:30,e:0,h:4,k:0}}},
  tuckflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:0,k:-150},R:{a:150,e:0,h:0,k:150},ls:{thL:0.45,thR:0.45}},B:{t:-88,L:{a:150,e:0,h:0,k:-150},R:{a:150,e:0,h:0,k:150},ls:{thL:0.45,thR:0.45}},bentKnees:1},
  straddleflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:25,k:0},R:{a:150,e:0,h:25,k:0}},B:{t:-88,L:{a:150,e:0,h:25,k:0},R:{a:150,e:0,h:25,k:0}}},
  flag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:0,k:0},R:{a:150,e:0,h:0,k:0}},B:{t:-88,L:{a:150,e:0,h:0,k:0},R:{a:150,e:0,h:0,k:0}}},
  /* dominadas negativas (vista de atrás): arrancan arriba con el mentón sobre la barra y bajan lento hasta colgar con los brazos estirados */
  negpull:{v:'front',back:1,bentKnees:1,grip:{t:'prono',w:'medio'},eq:[{t:'pullbar',front:1,p:[26,26,94]}],root:{j:'N',p:{A:[60,25],B:[60,53]}},A:{t:180,tk:1,L:{a:30,e:140,h:4,k:-22},R:{a:30,e:140,h:4,k:-22},ls:{shL:0.55,shR:0.55,uaL:0.86,uaR:0.86,faL:0.83,faR:0.83}},B:{t:180,tk:1,L:{a:170,e:0,h:4,k:-22},R:{a:170,e:0,h:4,k:-22},ls:{shL:0.55,shR:0.55}},ik:{GL:{to:[43,26],elbow:'down'},GR:{to:[77,26],elbow:'down'}},lock:[{u:1,j:'e',sd:['L','R']}]},
  hollow:{eq:[{t:'floor'}],d:1,A:{t:-106.1,nk:-0.7,n:{s:36.2,e:0,h:31.2,k:0.2,a:-45}},B:{t:-109,nk:-0.2,n:{s:40.8,e:0.2,h:38.9,k:0,a:-45}},root:{j:'P',p:[64,104]},lock:[{u:'all',j:'e'}]},
  /* flexiones con palmada, por fases y solo de ida: abajo → empuje hasta estirar → vuelo corto (las manos despegan ~6, el cuerpo casi recto, y se juntan debajo del pecho) → manos de nuevo al piso → abajo */
  clappush:{eq:[{t:'floor'}],d:-1,A:{t:97,nk:-5,n:{s:5,e:110,ab:40,h:0,k:0,a:-40,w:58}},B:{t:97,nk:-5,n:{s:5,e:110,ab:40,h:0,k:0,a:-40,w:58}},feet:{n:'floor',f:'floor'},root:{j:'Tn',p:[94,109.25]},grip:{t:'apoyo',w:'medio'},fwd:1,tiptoe:1,fases:[{u:0.12,t:101,nk:-5,n:{s:25,e:90,w:54,h:0,k:0,a:-40}},{u:0.22,t:105.4,nk:-5,n:{s:40,e:60,w:64.6,h:0,k:0,a:-40}},{u:0.26,t:106.6,nk:-5,n:{s:56,e:30,w:77.4,h:0,k:0,a:-40}},{u:0.3,t:107.6,nk:-5,n:{s:72,e:0,w:90.4,h:0,k:0,a:-40}},{u:0.5,t:111,nk:-5,n:{s:50,e:40,w:20,h:0,k:0,a:-40}},{u:0.7,t:107.6,nk:-5,n:{s:72,e:0,w:90.4,h:0,k:0,a:-40}},{u:0.74,t:106.6,nk:-5,n:{s:56,e:30,w:77.4,h:0,k:0,a:-40}},{u:0.78,t:105.4,nk:-5,n:{s:40,e:60,w:64.6,h:0,k:0,a:-40}},{u:0.88,t:101,nk:-5,n:{s:25,e:90,w:54,h:0,k:0,a:-40}}],lock:[{u:0.3,j:'e'}],handPhi:90},
  sissy:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:69.9,e:10.4,h:0,k:0,a:-45}},B:{t:225,nk:0.4,n:{s:90,e:0,h:-0.1,k:95,a:25}},root:{j:'Tn',p:[66,109.25]},tiptoe:1}
});
mkHook();
/* Lote 9: variantes de flexión armadas sobre la flexión base (que ya valida), cada una con lo que la distingue */
(()=>{const P=MKD.pushup,cl=o=>JSON.parse(JSON.stringify(o)),v=(over,f)=>{const d=cl(P);delete d.lock;Object.assign(d,over);if(f)f(d);return d;};
  Object.assign(MKD,{
    /* planche lean: posición de flexión con los brazos estirados y los hombros bien adelante de las manos (dedos hacia atrás) */
    pllean:v({lock:[{u:'all',j:'e'}],grip:{t:'apoyo',w:'medio',txt:'(dedos hacia afuera)'}},d=>{d.ik={Wn:{to:[37,108.6],hand:-90}};d.A.t=104;d.B=cl(d.A);})
  });})();
mkHook();
/* Lote 9: flexiones en pica (V invertida), armadas sobre la flexión base */
(()=>{const d=JSON.parse(JSON.stringify(MKD.pushup));delete d.lock;
  Object.assign(d,{grip:{t:'apoyo',w:'medio'},lock:[{u:0,j:'e'}],root:{j:'Tn',p:[84,109.25]},
    A:{t:55,nk:-30,n:{s:150,e:0,h:105,k:0,a:-10}},B:{t:40,nk:-30,n:{s:110,e:90,ab:40,h:105,k:0,a:-10}},ik:{Wn:{to:[40,108.6],hand:90}}});
  MKD.pikepush=d;})();
Object.assign(MKD,{
  /* ===== Lote 10: Articulaciones y atleta (convertidos de la figura vieja y ajustados) ===== */
  spansq:{eq:[{t:'floor'},{t:'post',p:[104,50,104,110],pad:0},{t:'pulley',p:[104,90],to:'Kn'}],d:1,A:{t:175,nk:0.1,n:{s:90.1,e:4.9,h:59.9,k:57.1,a:2.1}},B:{t:172.9,nk:0,n:{s:91.7,e:5.3,h:72,k:70.1,a:5.1}},ik:{An:{to:[60,107.45],flat:1},Af:{to:[60,107.45],flat:1}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[44.3,77.5],B:[43.5,80.6]}}},
  tibraise:{eq:[{t:'floor'},{t:'post',p:[24.5,4,24.5,110],pad:0}],d:1,A:{t:-167.1,nk:-0.5,n:{s:-23.2,e:5.4,h:6.1,k:0,a:-19}},B:{t:-167.1,nk:-0.5,n:{s:-23.2,e:5.4,h:6.1,k:0,a:4}},root:{j:'Ln',p:[51.5,109.25]}},
  slcalf:{eq:[{t:'floor'},{t:'block',r:[66,104,22,6]},{t:'post',p:[84,24,84,104],pad:0}],d:1,A:{t:180,nk:0,n:{s:48.5,e:51.7,h:0,k:2,a:22},f:{s:48.5,e:51.7,h:-4.9,k:115.2,a:-45}},B:{t:180,nk:0,n:{s:43,e:61.7,h:0,k:2,a:-38},f:{s:43,e:61.7,h:-5.2,k:114.9,a:-45}},root:{j:'Tn',p:[71,102.25]},uni:1,tiptoe:1,lock:[{u:0,j:'k'},{u:1,j:'k'}],ik:{Gn:{to:[84,40]}},grip:{t:'neutro',w:'medio',txt:'(manos en el poste)'}},
  slbal:{eq:[{t:'floor'}],d:1,uni:1,feet:{n:'floor'},root:{j:'P',p:[60,68.6]},A:{t:180,n:{s:10,e:20,h:0,k:2,a:0},f:{s:10,e:20,h:90,k:90,a:-20}},B:{t:178,n:{s:14,e:25,h:0,k:3,a:0},f:{s:14,e:25,h:92,k:92,a:-20}},ik:{An:{to:[60,107.45],flat:1}}},
  kneewall:{eq:[{t:'floor'},{t:'post',p:[92,8,92,110],pad:0}],d:1,A:{t:175,nk:0.1,n:{s:37.4,e:74.6,h:35,k:30,a:0},f:{s:37.4,e:74.6,h:-7.7,k:42.3,a:-4.8}},B:{t:175,nk:0.1,n:{s:17.4,e:103.1,h:44.9,k:64.9,a:24.9},f:{s:17.4,e:103.1,h:-19,k:39.8,a:3.9}},ik:{An:{to:[78,107.45],flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[68,71.7],B:[73.2,75.5]}},uni:1,grip:{t:'apoyo',w:'medio',txt:'(en la pared)'}},
  slbridge:{eq:[{t:'floor'}],d:1,A:{t:-90,nk:0,n:{s:0,e:0,h:48.4,k:142.4,a:3.9},f:{s:0,e:0,h:48.4,k:0,a:-9.5}},B:{t:-78,nk:25,n:{s:-25,e:0,h:0,k:110.2,a:15.6},f:{s:-25,e:0,h:-20.4,k:0.1,a:-9.5}},ik:{An:{to:[75,107.45],flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[60,103],B:[57.2,90.3]}},uni:1},
  /* plancha lateral de frente al pecho: cuerpo recto en diagonal, apoyada en el antebrazo (codo debajo del hombro, antebrazo sobre el piso) y el otro brazo arriba */
  sidepl:{v:'front',uni:1,bentKnees:1,grip:{t:'apoyo',w:'cerrado',txt:'(antebrazo)'},eq:[{t:'floor'}],root:{j:'ER',p:[84,108.3]},feet:{R:'floor'},A:{t:102.5,L:{a:102.5,e:0,h:0,k:0},R:{a:77.5,e:90,h:0,k:0},ls:{faR:0.8}},B:{t:102.5,L:{a:102.5,e:0,h:2,k:0},R:{a:77.5,e:90,h:2,k:0},ls:{faR:0.8}},tiptoe:1},
  birddog:{eq:[{t:'floor'}],d:-1,A:{t:101.5,nk:0,n:{s:78.5,e:0,h:78.5,k:95,a:-45},f:{s:70,e:0,h:78.5,k:95,a:-45}},B:{t:101.5,nk:0,n:{s:78.5,e:0,h:-11.5,k:0,a:-45},f:{s:168.5,e:0,h:78.5,k:95,a:-45}},ik:{Wn:{to:[34,108.6],hand:90},Wf:{own:1,to:{A:[37,106.4],M:[24,98],B:[10,79]},hand:90}},root:{j:'P',p:[63.4,87]},grip:{t:'apoyo',w:'medio'},uni:1},
  curlup:{eq:[{t:'floor'}],d:1,A:{t:-90,nk:10,n:{s:12,e:-41.5,h:0,k:0,a:0},f:{s:12,e:-41.5,h:55,k:120,a:-24.9}},B:{t:-98,nk:10,n:{s:6.8,e:-33.4,h:8,k:0,a:0},f:{s:6.8,e:-33.4,h:63,k:120,a:-24.9}},ik:{Af:{to:[79.5,107.45],flat:1},Wn:{to:[56,106.5],hand:90},Wf:{to:[53,104.3],hand:90}},feet:{f:'floor'},root:{j:'P',p:[60,104]},grip:{t:'apoyo',w:'cerrado',txt:'(manos bajo la zona lumbar)'},uni:1},
  biering:{eq:[{t:'floor'},{t:'block',r:[56,75,52,6]},{t:'block',r:[62,81,4,29]},{t:'block',r:[100,81,4,29]},{t:'pad',r:4,at:'An'}],d:-1,A:{t:90,nk:0,n:{s:60,e:120,h:0,k:0,a:-50}},B:{t:86.9,nk:-0.5,n:{s:59.7,e:120.3,h:3.1,k:0,a:-50}},root:{j:'P',p:[56,70]}},
  deadhang:{eq:[{t:'pullbar',front:1,p:[30,12,90]}],v:'front',A:{t:180,tk:1,L:{a:174,e:4,h:6,k:-4.2},R:{a:174,e:4,h:6,k:-4.2},ls:{faL:0.7659999999999999,faR:0.7659999999999999}},B:{t:180,tk:1,L:{a:174,e:4,h:6,k:-3.9},R:{a:174,e:4,h:6,k:-3.9},ls:{faL:0.763,faR:0.763}},root:{j:'GL',p:[51,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}],back:1},
  /* rotación externa con banda: codo fijo a 90° y la mano a la altura del codo; la banda cruza por delante del cuerpo hasta la mano */
  extrot:{eq:[{t:'floor'},{t:'post',p:[10,20,10,110],pad:0},{t:'pulley',p:[10,58],to:'GR',layer:'mid'}],v:'front',A:{t:180,tk:1,L:{a:4.9,e:-4.9,h:5,k:0},R:{a:0,e:90,h:5,k:0},ls:{faL:0.765,faR:-1}},B:{t:180,tk:1,L:{a:4.9,e:-4.9,h:5,k:0},R:{a:0,e:90,h:5,k:0},ls:{faL:0.765,faR:1}},root:{j:'P',p:[60,68.6]},feet:{L:'floor',R:'floor'},uni:1,grip:{t:'neutro',w:'cerrado',txt:'(banda)'}},
  wallslide:{eq:[{t:'floor'},{t:'wall',r:[36,6,48,101]}],v:'front',A:{t:180,tk:1,L:{a:70,e:98,h:5,k:0},R:{a:70,e:98,h:5,k:0},ls:{faL:0.764,faR:0.764}},B:{t:180,tk:1,L:{a:152,e:-0.1,h:5,k:0},R:{a:152,e:-0.1,h:5,k:0},ls:{faL:0.7609999999999999,faR:0.7609999999999999}},root:{j:'P',p:[60,68.6]},feet:{L:'floor',R:'floor'},grip:{t:'apoyo',w:'abierto',txt:'(contra la pared)'}},
  cmj:{eq:[{t:'floor'}],d:1,A:{t:149.7,nk:-18.9,n:{s:-40,e:1.8,h:83.4,k:71.6,a:18.4}},B:{t:178.1,nk:3.8,n:{s:122.9,e:7.7,h:4.8,k:2.9,a:0}},root:{j:'P',p:{A:[48,78],B:[59,54]}}},
  broadjump:{eq:[{t:'floor'}],d:1,A:{t:144,nk:0.8,n:{s:-40,e:0,h:94,k:84.6,a:26.6}},B:{t:149.7,nk:6.6,n:{s:68.9,e:88.2,h:96.3,k:92.6,a:26.6}},root:{j:'Tn',p:{A:[38,109.25],M:[62,96],B:[96,109.25]}},M:{t:165,nk:0,n:{s:140,e:10,h:45,k:70,a:-10}},fwd:1},
  pogo:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-10.3,e:20.5,h:0,k:0,a:-50}},B:{t:180,nk:0,n:{s:-6.2,e:12.4,h:0,k:0,a:-50}},root:{j:'P',p:{A:[59.3,62.5],B:[60.9,53.1]}}},
  skater:{eq:[{t:'floor'}],v:'front',A:{t:-174.3,tk:1.005,L:{a:-30,e:10.1,h:4.9,k:-14.9},R:{a:30,e:-10.2,h:-22.1,k:-19.7},ls:{faL:0.7659999999999999,faR:0.763}},B:{t:-185.7,tk:1.005,L:{a:30,e:-10.2,h:-22.1,k:-19.7},R:{a:-30,e:10.1,h:4.9,k:-14.9},ls:{faL:0.763,faR:0.7659999999999999}},root:{j:'P',p:{A:[44,68.8],M:[60,60],B:[76,68.8]}},uni:1,bentKnees:1},
  sprint:{eq:[{t:'floor'}],d:1,A:{t:168.7,nk:0,n:{s:-24.2,e:62.1,h:60.1,k:65.5,a:16.7},f:{s:56.3,e:104,h:-8.7,k:16.9,a:36.9}},B:{t:168.7,nk:0,n:{s:56.3,e:104,h:-8.7,k:16.9,a:36.9},f:{s:-24.2,e:62.1,h:60.1,k:65.5,a:16.7}},root:{j:'P',p:[58,66]},uni:1},
  /* burpee completo, por fases y solo de ida: parado → agachado con las manos al piso → salto atrás a plancha → pies adentro → salto arriba con los brazos sobre la cabeza */
  burpee:{eq:[{t:'floor'}],d:-1,tiptoe:1,A:{t:180,nk:0,n:{s:0,e:5,w:0,h:0,k:2,a:0}},B:{t:176,nk:0,n:{s:140,e:4,w:0,h:0,k:2,a:-40}},root:{j:'Tn',p:{seq:[[0,[66,109.25]],[0.2,[66,109.25]],[0.33,[90,104]],[0.45,[91,109.25]],[0.58,[79,104]],[0.7,[66,109.25]],[0.85,[64,109.25]],[1,[62,106]]]}},grip:{t:'apoyo',w:'medio'},fwd:1,fases:[{u:0.2,t:105,nk:-5,n:{s:65,e:0,w:-90,h:125,k:140,a:25}},{u:0.45,t:108,nk:-5,n:{s:72,e:0,w:-90,h:0,k:0,a:-40}},{u:0.7,t:105,nk:-5,n:{s:65,e:0,w:-90,h:125,k:140,a:25}},{u:0.85,t:160,nk:0,n:{s:30,e:10,w:0,h:60,k:80,a:20}}]},
  jumprope:{eq:[{t:'floor'},{t:'rope',y:[152,-40]}],v:'front',A:{t:180,tk:1,L:{a:20,e:60.3,h:6,k:-3.9},R:{a:20,e:60.3,h:6,k:-3.9},ls:{faL:0.764,faR:0.764}},B:{t:180,tk:1,L:{a:20,e:62.1,h:6,k:-3.9},R:{a:20,e:62.1,h:6,k:-3.9},ls:{faL:0.7659999999999999,faR:0.7659999999999999}},root:{j:'P',p:{A:[60,69],B:[60,62]}},grip:{t:'neutro',w:'cerrado',txt:'(soga)'}},
  bearcrawl:{eq:[{t:'floor'}],d:-1,uni:1,tiptoe:1,A:{t:92,nk:-5,n:{s:80,e:0,h:100,k:100,a:-30},f:{s:80,e:0,h:80,k:100,a:-30}},B:{t:92,nk:-5,n:{s:80,e:0,h:80,k:100,a:-30},f:{s:80,e:0,h:100,k:100,a:-30}},ik:{Wn:{to:{A:[30,108.6],M:[27,103],B:[24,108.6]},hand:90},Wf:{own:1,to:{A:[25,106.4],M:[27,101],B:[30,106.4]},hand:90},Tn:{to:{A:[78,109.25],M:[82,106],B:[86,109.25]}},Tf:{own:1,to:{A:[88,109.25],M:[84,106],B:[80,109.25]}}},root:{j:'P',p:[62,84]},grip:{t:'apoyo',w:'medio'}},
  highknees:{eq:[{t:'floor'}],d:1,A:{t:-177.9,nk:0.2,n:{s:-32.1,e:50.3,h:87.9,k:90,a:-19.8},f:{s:28,e:129.7,h:-2.1,k:0,a:-50}},B:{t:-177.9,nk:0.2,n:{s:28,e:129.7,h:-2.1,k:0,a:-50},f:{s:-32.1,e:50.3,h:87.9,k:90,a:-19.8}},root:{j:'P',p:[59.3,62.5]},uni:1}
});
mkHook();
