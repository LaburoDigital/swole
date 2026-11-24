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
    A:{t:-90,nk:16,n:{s:90,e:4,h:-30,k:64.8,a:4.8}},B:{t:-90,nk:16,n:{s:-40,e:130,ab:50,h:-30,k:64.8,a:4.8}},
    ik:{An:{to:[77.7,107.45],flat:1},Af:{to:[74.7,107.45],flat:1}}},
  /* aperturas: acostado en el banco, de costado como el press con mancuernas; arriba las mancuernas sobre el pecho, abajo los brazos abren en arco (hacia afuera, en escorzo) hasta la línea del pecho, con el codo fijo a ~160° */
  dbfly:{d:1,grip:{t:'neutro',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'tbench'},{t:'db',at:'Gf',lateral:1},{t:'db',at:'Gn',lateral:1}],
    root:{j:'P',p:[62,79]},
    A:{t:-90,nk:16,n:{s:90,e:20,ab:0,abf:0,h:-30,k:64.8,a:4.8}},B:{t:-90,nk:16,n:{s:90,e:20,ab:75,abf:75,h:-30,k:64.8,a:4.8}},
    ik:{An:{to:[77.7,107.45],flat:1},Af:{to:[74.7,107.45],flat:1}}},
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
    A:{t:-70,nk:16,n:{s:95,e:5,h:0,k:90,a:0}},B:{t:-70,nk:16,n:{s:20,e:100,ab:45,h:0,k:90,a:0}},
    ik:{Gn:{A:[38,58.4],B:[43,76.5]},An:[88,92],Af:[85,92]}},
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
    ik:{Gn:{A:[58,62],B:[71.5,61]},An:{to:[72,107.45],flat:1},Af:{to:[69,107.45],flat:1}}},
  /* pec deck: de frente, sentado contra el respaldo; los brazos abiertos se cierran adelante del pecho (en escorzo) */
  pecdeck:{v:'front',bentKnees:1,grip:{t:'neutro',w:'medio'},feet:{L:'floor',R:'floor'},
    eq:[{t:'floor'},{t:'wall',r:[47,26,26,54]},{t:'post',p:[60,80,60,110]},{t:'handle',at:'GL',headOK:'al cerrar, las manijas quedan delante de la cara (más cerca de quien mira)'},{t:'handle',at:'GR',headOK:'al cerrar, las manijas quedan delante de la cara (más cerca de quien mira)'}],
    root:{j:'P',p:[60,80]},
    /* las manos viajan derecho hacia el centro a la altura de los hombros y los brazos se acortan al venir hacia quien mira */
    /* codo fijo a 90° con los antebrazos verticales contra las almohadillas; los brazos se cierran hacia adelante (en escorzo) a la altura de los hombros */
    A:{L:{a:90,e:90,h:20,k:-20},R:{a:90,e:90,h:20,k:-20},ls:{th:.55,ua:.95,fa:1}},
    B:{L:{a:90,e:90,h:20,k:-20},R:{a:90,e:90,h:20,k:-20},ls:{th:.55,ua:.2,fa:1}},
    ik:{AL:[47,107.45],AR:[73,107.45]}}
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
  /* dominadas supinas: palmas hacia vos */
  chinup:{lock:[{u:0,j:'e'}],d:1,grip:{t:'supino',w:'medio'},
    eq:[{t:'pullbar',p:[64,16]}],root:{j:'Gn',p:[64,16]},
    A:{t:182,nk:0,n:{s:172,e:4,h:0,k:60,a:-20}},B:{t:180,nk:-15,n:{s:20,e:140,h:12,k:55,a:-20}},
    ik:{Gf:{rel:'Gn',off:[-3,-2.2]}}},
  /* dominadas asistidas en máquina: las rodillas en la almohadilla que empuja hacia arriba */
  assistpull:{lock:[{u:0,j:'e'}],d:1,grip:{t:'prono',w:'medio'},
    eq:[{t:'pullbar',p:[64,16]},{t:'lever',pv:[44,110],to:'Kn'},{t:'pad',at:'Kn'}],root:{j:'Gn',p:[64,16]},
    A:{t:182,nk:0,n:{s:172,e:4,h:-5,k:100,a:30}},B:{t:188,nk:-15,n:{s:0,e:148,h:-5,k:100,a:30}},
    ik:{Gf:{rel:'Gn',off:[-3,-2.2]}}},
  /* remo sentado en máquina: el pecho contra el apoyo, las manijas de la palanca vienen hacia las costillas */
  machrow:{lock:[{u:0,j:'e'}],d:1,grip:{t:'neutro',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[28,86,19,5]},{t:'post',p:[38,91,38,110]},{t:'block',soft:1,r:[50,58,4,24]},{t:'post',p:[52,82,52,110]},{t:'lever',pv:[100,58],to:'Gn',stand:100},{t:'handle',at:'Gn'}],
    root:{j:'P',p:[44,81]},
    A:{t:185,n:{s:80,e:4,h:85,k:92,a:2}},B:{t:185,n:{s:-40,e:105,h:85,k:92,a:2}},
    ik:{An:{to:[70,107.45],flat:1},Af:{to:[67,107.45],flat:1}}},
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
    A:{t:180,nk:-22,n:{s:30,e:120,ab:30,h:0,k:2,a:0}},B:{t:180,nk:0,n:{s:170,e:5,ab:0,h:0,k:2,a:0}},
    ik:{Gn:{A:[71,40.6],M:[70.5,23],B:[61.5,6.8]},An:{to:[60,107.45],flat:1}}},
  /* press de hombros con mancuernas: sentado con respaldo, las mancuernas al costado de la cabeza y arriba */
  dbohp:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[26,88,22,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[37,94,37,110]},{t:'db',at:'Gf',lateral:1},{t:'db',at:'Gn',lateral:1}],root:{j:'P',p:[44,83]},
    A:{t:182,nk:-15,n:{s:60,e:110,ab:60,h:88,k:88,a:0}},B:{t:182,nk:0,n:{s:170,e:5,ab:0,h:88,k:88,a:0}},
    ik:{Gn:{A:[45,42],B:[44.5,21.2]},An:{to:[66,107.45],flat:1}}},
  /* elevaciones laterales: de frente, los brazos suben hasta la altura de los hombros con los codos apenas doblados */
  lateral:{v:'front',grip:{t:'prono',w:'medio',db:1},feet:{L:'floor',R:'floor'},
    eq:[{t:'floor'},{t:'db',at:'GL'},{t:'db',at:'GR'}],root:{j:'P',p:[60,68.6]},
    A:{L:{a:11,e:-3,h:5,k:0},R:{a:11,e:-3,h:5,k:0},ls:{faL:.765,faR:.765}},B:{L:{a:92,e:-4,h:5,k:0},R:{a:92,e:-4,h:5,k:0},ls:{faL:.765,faR:.765}}},
  /* press de hombros en máquina: sentado, las manijas de la palanca van de los hombros a arriba */
  machpress:{d:1,lock:[{u:1,j:'e'}],grip:{t:'prono',w:'medio'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'block',r:[26,88,22,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[37,94,37,110]},{t:'lever',pv:[80,40],to:'Gn',stand:84},{t:'handle',at:'Gn'}],root:{j:'P',p:[44,83]},
    A:{t:182,nk:-22,n:{s:30,e:120,ab:30,h:88,k:88,a:0}},B:{t:182,nk:0,n:{s:170,e:5,ab:0,h:88,k:88,a:0}},
    ik:{Gn:{A:[54,54.7],M:[55,35],B:[44.5,21.2]},An:{to:[66,107.45],flat:1}}},
  /* elevaciones frontales: brazos estirados hasta la altura de los hombros */
  frontraise:{d:1,grip:{t:'prono',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf'},{t:'db',at:'Gn'}],root:{j:'P',p:[60,68.6]},
    A:{t:180,n:{s:5,e:3,h:0,k:2,a:0}},B:{t:180,n:{s:88,e:3,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1}}},
  /* vuelos posteriores: inclinado, los brazos se abren hacia los costados (de costado se ven en escorzo) */
  /* vuelos posteriores: de frente, inclinado hacia adelante (torso en escorzo); los brazos cuelgan y abren hasta la horizontal con el codo fijo a ~165° */
  reardelt:{v:'front',bentKnees:1,grip:{t:'neutro',w:'medio',db:1},feet:{L:'floor',R:'floor'},
    eq:[{t:'floor'},{t:'db',at:'GL'},{t:'db',at:'GR'}],root:{j:'P',p:[60,73]}, /* inclinado: torso y cuello en escorzo (la cabeza queda delante del pecho, a la altura de los hombros) y rodillas dobladas (muslo en escorzo) */
    A:{tk:.3,L:{a:12,e:-15,h:8,k:-14},R:{a:12,e:-15,h:8,k:-14},ls:{th:.8,nk:-.2}},B:{tk:.3,L:{a:90,e:-15,h:8,k:-14},R:{a:90,e:-15,h:8,k:-14},ls:{th:.8,nk:-.2}}},
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
    A:{t:175,n:{s:0,e:5,h:-18,k:95,a:20}},B:{t:195,n:{s:-55,e:90,h:-25,k:95,a:20}}},
  /* curl con mancuernas alternado: sube una mientras la otra baja; el codo queda quieto al costado */
  dbcurl:{d:1,uni:1,grip:{t:'supino',w:'medio',db:1},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'db',at:'Gf'},{t:'db',at:'Gn'}],root:{j:'P',p:[60,68.6]},
    A:{t:180,n:{s:4,e:5,h:0,k:2,a:0},f:{s:10,e:118,h:0,k:2,a:0}},B:{t:180,n:{s:10,e:118,h:0,k:2,a:0},f:{s:4,e:5,h:0,k:2,a:0}},
    ik:{An:{to:[60,107.45],flat:1},Af:{to:[57,107.45],flat:1}}},
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
  /* curl femoral sentado: el apoyo traba los muslos, la palanca gira en la rodilla y los talones van debajo del asiento */
  seatlegcurl:{d:1,lock:[{u:0,j:'k'}],grip:{t:'neutro',w:'abierto',txt:'(manijas del asiento)'},
    eq:[{t:'floor'},{t:'block',r:[30,85,24,6]},{t:'block',soft:1,r:[30,44,6,44]},{t:'post',p:[42,91,42,110]},{t:'block',soft:1,r:[48,71.5,14,4]},{t:'lever',pv:[62,79.5],to:'An'},{t:'pad',at:{rel:'An',off:[0,4.6]}}],root:{j:'P',p:[42,79.5]},
    A:{t:178,n:{s:12,e:10,h:92,k:2,a:-30}},B:{t:178,n:{s:12,e:10,h:92,k:100,a:10}}},
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
  /* elevación de piernas colgado: brazos estirados, las piernas rectas suben hasta la cadera */
  legraise:{d:1,lock:[{u:0,j:'e'},{u:1,j:'e'}],grip:{t:'prono',w:'medio'},
    eq:[{t:'pullbar',p:[60,10]}],root:{j:'Gn',p:[60,10]},
    A:{t:182,n:{s:172,e:4,h:2,k:25,a:-30}},B:{t:174,n:{s:165,e:4,h:95,k:5,a:-20}},
    ik:{Gf:{rel:'Gn',off:[-3,-2.2]}}},
  /* plancha: sobre los antebrazos, cuerpo en línea */
  plank:{d:-1,grip:{t:'apoyo',w:'medio',txt:'(antebrazos)'},
    eq:[{t:'floor'}],root:{j:'P',p:{A:[61.7,96.2],B:[61.8,95.7]}},
    A:{t:98,n:{s:82,e:90,h:0,k:0,a:7}},B:{t:97,n:{s:83,e:90,h:1,k:0,a:5}},
    ik:{Wn:{to:[19,108.6],hand:90}}},
  /* giro ruso: de frente, sentado con el torso atrás y las rodillas arriba; las manos juntas van de un costado de la cadera al otro */
  russian:{v:'front',uni:1,bentKnees:1,
    eq:[{t:'floor'}],root:{j:'P',p:[60,104]},
    A:{tk:.8,tw:-10,sw:.5,L:{a:30,e:-60,h:160,k:-140},R:{a:30,e:-60,h:160,k:-140},ls:{th:.5,sh:.6,ua:.55}},B:{tk:.8,tw:10,sw:.5,L:{a:30,e:-60,h:160,k:-140},R:{a:30,e:-60,h:160,k:-140},ls:{th:.5,sh:.6,ua:.55}},
    ik:{GL:{to:{A:[42,102],B:[78,102]}},GR:{to:{A:[44,102],B:[76,102]}}}},
  /* press Pallof: de frente, la polea al costado; las manos salen del pecho al frente (brazos en escorzo) sin que el torso gire */
  pallof:{v:'front',grip:{t:'neutro',w:'cerrado'},
    eq:[{t:'floor'},{t:'post',p:[10,14,10,110]},{t:'pulley',p:[10,56],to:'GL'},{t:'handle',at:'GL'}],root:{j:'P',p:[60,68.6]},
    A:{L:{a:30,e:-120,h:5,k:0},R:{a:30,e:-120,h:5,k:0}},B:{L:{a:30,e:-120,h:5,k:0},R:{a:30,e:-120,h:5,k:0},ls:{ua:.4,fa:.4}},
    ik:{GL:{to:{A:[57,52],B:[57,52]},elbow:'down'},GR:{to:{A:[63,52],B:[63,52]},elbow:'down'}}},
  /* balón medicinal contra el piso: arriba estirado con el balón sobre la cabeza, abajo cadera y rodillas dobladas y el balón en el piso */
  medslam:{d:1,lock:[{u:0,j:'e'}],grip:{t:'neutro',w:'medio',txt:'(balón)'},feet:{n:'floor',f:'floor'},
    eq:[{t:'floor'},{t:'ball',at:'Gn'}],root:{j:'P',p:{A:[58,68.6],B:[44,82]}},
    A:{t:184,n:{s:172,e:4,h:0,k:2,a:0}},B:{t:115,nk:-10,n:{s:55,e:5,h:100,k:75,a:15}},
    ik:{An:{to:[58,107.45],flat:1}}},
  /* crunch en polea alta: de rodillas frente a la polea, la soga junto a la cara; enrolla el torso */
  cablecrunch:{d:1,grip:{t:'neutro',w:'cerrado',txt:'(soga)'},
    eq:[{t:'floor'},{t:'post',p:[108,4,108,110]},{t:'pulley',p:[104,8],to:'Gn',headOK:'la soga va junto a la cara'},{t:'handle',at:'Gn',headOK:'la soga va junto a la cara'}],root:{j:'Kn',p:[56,107]},
    A:{t:168,n:{s:100,e:120,ab:60,h:12,k:110,a:20}},B:{t:125,nk:-15,n:{s:100,e:120,ab:60,h:55,k:110,a:20}}},
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
  diamond:{eq:[{t:'floor'}],d:-1,A:{t:111.3,nk:0.4,n:{s:49.5,e:8.6,h:-0.1,k:0,a:35}},B:{t:106.9,nk:0,n:{s:19.1,e:65.1,h:-0.1,k:0.3,a:35}},ik:{An:{to:[94.3,107.45],flat:1},Af:{to:[94.3,107.45],flat:1},Wn:{to:[37,108.6],hand:90},Wf:{to:[37,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[58,92.9],B:[56.9,95.7]}},grip:{t:'apoyo',w:'cerrado'}},
  archerpush:{eq:[{t:'floor'}],d:-1,A:{t:111.9,nk:-0.3,n:{s:68.1,e:0,h:0,k:0,a:35},f:{s:143.1,e:14.9,h:0,k:0,a:35}},B:{t:103.9,nk:-0.1,n:{s:31.1,e:80.3,h:1.2,k:0.1,a:35},f:{s:146.5,e:17.4,h:1.2,k:0.1,a:35}},ik:{An:{to:{A:[100,107.45],B:[100.3,107.45]},flat:1},Af:{to:{A:[100,107.45],B:[100.3,107.45]},flat:1},Wn:{to:[36,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[63.8,92.2],B:[62.7,94.7]}},grip:{t:'apoyo',w:'abierto'},uni:1},
  pppush:{eq:[{t:'floor'}],d:-1,A:{t:107.9,nk:-0.1,n:{s:42.1,e:10.2,h:2.3,k:0.1,a:35}},B:{t:101.9,nk:-0.2,n:{s:8,e:80.2,h:3.1,k:0,a:35}},ik:{An:{to:{A:[101.7,107.45],B:[104.1,107.45]},flat:1},Af:{to:{A:[101.7,107.45],B:[104.1,107.45]},flat:1},Wn:{to:[48,108.6],hand:90},Wf:{to:[48,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[65.1,92.9],B:[66.4,96.6]}},grip:{t:'apoyo',w:'medio',txt:'(dedos hacia atrás)'}},
  oapush:{eq:[{t:'floor'}],d:-1,A:{t:111.9,nk:-0.3,n:{s:68.1,e:0,h:0,k:0,a:35},f:{s:-12.1,e:0,h:4.1,k:0.2,a:35}},B:{t:103.9,nk:-0.1,n:{s:31.1,e:80.3,h:1.2,k:0.1,a:35},f:{s:-10.2,e:0,h:6,k:0,a:35}},ik:{An:{to:{A:[90,107.45],B:[90.3,107.45]},flat:1},Af:{to:{A:[88.9,107.45],B:[89.3,107.45]},flat:1},Wn:{to:[26,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[53.8,92.2],B:[52.7,94.7]}},grip:{t:'apoyo',w:'cerrado',txt:'(una mano)'},uni:1},
  planchepush:{eq:[{t:'floor'}],d:-1,A:{t:92,nk:-24,n:{s:60,e:0,h:0,k:0,a:35}},B:{t:90,nk:-8.7,n:{s:0,e:90,h:-0.6,k:3.2,a:35}},root:{j:'Wn',p:[36,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:0,j:'e'}],ik:{Wn:{to:[36,108.6],hand:-90}}},
  austrow:{eq:[{t:'floor'},{t:'post',p:[20,46,54,46]},{t:'post',p:[24,46,24,111]}],d:1,A:{t:-115,nk:-40,n:{s:139.7,e:0,h:1.2,k:0,a:0}},B:{t:-115,nk:-40,n:{s:35.8,e:148,h:-1.3,k:0,a:0}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[36,46]},grip:{t:'prono',w:'medio'}},
  lpullup:{eq:[{t:'pullbar',p:[64,21]}],d:1,A:{t:174.8,nk:-0.7,n:{s:155.1,e:10.2,h:98,k:0,a:-45}},B:{t:175,nk:0.1,n:{s:35,e:139.8,h:98.1,k:0.1,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[64,21]},grip:{t:'prono',w:'medio'}},
  archerpull:{eq:[{t:'pullbar',front:1,p:[20,21,100]}],v:'front',A:{t:180,tk:1,L:{a:145.2,e:3.3,h:6,k:-3.9},R:{a:145.2,e:3.3,h:6,k:-3.9},ls:{faL:0.7659999999999999,faR:0.767}},B:{t:180,tk:1,L:{a:50,e:120,h:6,k:-3.9},R:{a:92,e:13.6,h:6,k:-3.9},ls:{faL:0.762,faR:0.764},tw:-6},root:{j:'GL',p:[30,21]},ik:{GL:[30,21],GR:[78,21]},grip:{t:'prono',w:'abierto'},uni:1,lock:[{u:0,j:'e',sd:['L','R']}]},
  muscleup:{eq:[{t:'pullbar',mount:'v',p:[60,48]}],d:1,A:{t:178,nk:0,n:{s:175,e:4,h:95,k:0,a:0}},B:{t:165,nk:20,n:{s:4,e:3,h:10,k:25,a:-20}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[60,48]},grip:{t:'prono',w:'medio'},lock:[{u:0,j:'e'},{u:1,j:'e'}],M:{t:185,nk:-10,n:{s:40,e:90,h:60,k:30,a:-20}}},
  oapull:{eq:[{t:'pullbar',front:1,p:[20,21,100]}],v:'front',A:{t:180,tk:1,L:{a:180,e:0,h:6,k:-3.9},R:{a:-4.9,e:2.7,h:6,k:-3.9},ls:{faL:0.765,faR:0.765}},B:{t:180,tk:1,L:{a:60,e:140,h:6,k:-3.9},R:{a:9.9,e:-69.7,h:6,k:-3.9},ls:{faL:0.763,faR:0.762}},root:{j:'GL',p:[58,21]},ik:{},grip:{t:'prono',w:'cerrado',txt:'(una mano)'},uni:1},
  /* fondos en banco: abajo el hombro llega a ~85° de extensión con la escápula inclinada (lim s −90); por eso el tope del codo es 90° y no más */
  benchdip:{eq:[{t:'floor'},{t:'block',r:[4,83,24,6]},{t:'post',p:[9,89,9,110]},{t:'post',p:[23,89,23,110]}],d:1,A:{t:-178.1,nk:0,n:{s:-20,e:5.5,h:88.1,k:90,a:0}},B:{t:-176,nk:0.2,n:{s:-58,e:89.9,h:95.9,k:103.2,a:5.1}},root:{j:'P',p:{A:[34,80],B:[40,91]}},grip:{t:'prono',w:'medio',txt:'(manos en el banco)'},ik:{Gn:[27.5,81.2]},lim:{s:[-90,180]}},
  ringdip:{eq:[{t:'ring',at:'Gn'}],d:1,A:{t:175,nk:0.1,n:{s:0.1,e:4.9,h:-5.1,k:49.8,a:35}},B:{t:195.1,nk:0.2,n:{s:-58,e:90,h:-20.2,k:54.7,a:35}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[60,63]},grip:{t:'neutro',w:'medio',txt:'(anillas)'}},
  airsquat:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-6.2,e:4.4,h:0,k:0,a:0}},B:{t:144.9,nk:-0.5,n:{s:115.2,e:9.9,h:119.9,k:94.8,a:10}},ik:{An:{to:[60,107.45],flat:1},Af:{to:[60,107.45],flat:1}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[60,69],B:[43.4,91]}}},
  shrimp:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:70,e:10.2,h:0,k:0,a:0},f:{s:70,e:10.2,h:-20,k:150,a:35}},B:{t:150,nk:-0.6,n:{s:95.1,e:9.6,h:100,k:110,a:14.9},f:{s:95.1,e:9.6,h:0,k:155,a:35}},ik:{An:{to:[60,107.45],flat:1},Gf:{own:1,rel:'Af',off:[4,-2]}},feet:{n:'floor'},root:{j:'P',p:{A:[60,69],B:[46,88]}},uni:1},
  pistol:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-6.2,e:4.4,h:0,k:0,a:0},f:{s:-6.2,e:4.4,h:25.2,k:15.1,a:-20.2}},B:{t:150,nk:0.1,n:{s:115,e:0,h:125,k:135,a:30},f:{s:115,e:0,h:119.9,k:0,a:-24.9}},ik:{An:{to:{A:[60,107.45],B:[58,107.45]},flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[58,69],B:[48,96]}},uni:1},
  dragon:{v:'front',uni:1,bentKnees:1,eq:[{t:'floor'}],feet:{R:'floor'},root:{j:'P',p:{A:[56,68.6],B:[56,93]}},A:{t:180,L:{a:20,e:0,h:-20,k:-30},R:{a:20,e:0,h:5,k:0},ls:{uaL:0.4,uaR:0.4,faL:0.4,faR:0.4,thL:0.85,shL:0.85}},B:{t:180,tk:0.75,L:{a:25,e:0,h:-78,k:-10},R:{a:25,e:0,h:5,k:10},ls:{uaL:0.4,uaR:0.4,faL:0.4,faR:0.4,thR:0.15,thL:0.8,shL:0.8,shR:0.65}},lim:{fh:[-80,60]}},
  tucklsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:124.6,k:107.1,a:-21}},B:{t:-176.4,nk:9.3,n:{s:-9.6,e:0,h:124.6,k:107.1,a:-21}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  lsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:86.4,k:0,a:-45}},B:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:89,k:0,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  vsit:{eq:[{t:'floor'},{t:'post',p:[40,93,66,93]},{t:'post',p:[46,93,46,111]}],d:1,A:{t:-172.9,nk:1.4,n:{s:-13.8,e:0,h:132,k:0,a:-45}},B:{t:-172.9,nk:1.9,n:{s:-13.8,e:0,h:132,k:0,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,92]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},lock:[{u:'all',j:'e'}]},
  wallhs:{eq:[{t:'floor'},{t:'post',p:[64,4,64,111]}],d:-1,A:{t:4,nk:0.2,n:{s:176,e:0,h:2,k:0,a:35}},B:{t:5,nk:-0.1,n:{s:175,e:0,h:2.2,k:0,a:35}},ik:{Wn:{to:[54,108.6],hand:90},Wf:{to:[54,108.6],hand:90}},root:{j:'P',p:{A:[56.1,51.1],B:[56.6,51.1]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  freehs:{eq:[{t:'floor'}],d:-1,A:{t:0,nk:0,n:{s:178,e:0,h:0,k:0,a:35}},B:{t:1.9,nk:0,n:{s:178,e:0,h:0.1,k:0,a:35}},ik:{Wn:{to:[60,108.6],hand:90},Wf:{to:[60,108.6],hand:90}},root:{j:'P',p:{A:[60,51],B:[61,51]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  hspu:{eq:[{t:'floor'},{t:'post',p:[64,4,64,111]}],d:-1,A:{t:4,nk:0.2,n:{s:176,e:0,h:2,k:0,a:35}},B:{t:6.1,nk:0.4,n:{s:123.7,e:90.2,h:0.8,k:0,a:35,ab:45}},ik:{Wn:{to:[54,108.6],hand:90},Wf:{to:[54,108.6],hand:90}},root:{j:'P',p:{A:[56.1,51.1],B:[54.8,59.2]}},grip:{t:'apoyo',w:'medio'}},
  freehspu:{eq:[{t:'floor'}],d:-1,A:{t:0,nk:0,n:{s:178,e:0,h:0,k:0,a:35}},B:{t:2.1,nk:0.2,n:{s:127.7,e:90.2,h:-0.1,k:0.2,a:35,ab:55}},ik:{Wn:{to:[60,108.6],hand:90},Wf:{to:[60,108.6],hand:90}},root:{j:'P',p:{A:[60,51],B:[58.7,59.1]}},grip:{t:'apoyo',w:'medio'}},
  tuckfl:{eq:[{t:'pullbar',p:[48,12]}],d:1,A:{t:-93.8,nk:-15.1,n:{s:78.6,e:0,h:132,k:144.2,a:-45}},B:{t:-95.7,nk:-17,n:{s:80.5,e:0,h:132,k:144.2,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  advfl:{eq:[{t:'pullbar',p:[48,12]}],d:1,A:{t:-91.7,nk:-13,n:{s:76.4,e:0,h:84.1,k:86,a:-45}},B:{t:-93.4,nk:-14.7,n:{s:78.1,e:0,h:85.8,k:86,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  straddlefl:{eq:[{t:'pullbar',p:[48,12]}],d:1,A:{t:-91.7,nk:-13,n:{s:76.4,e:0,h:-1.5,k:0.4,a:-45},f:{s:76.4,e:0,h:22.2,k:2.1,a:-45}},B:{t:-93.4,nk:-14.7,n:{s:78.1,e:0,h:0.2,k:3.9,a:-45},f:{s:78.1,e:0,h:27,k:5.2,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,12]},grip:{t:'prono',w:'medio'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  fullfl:{eq:[{t:'pullbar',p:[48,12]}],d:1,A:{t:-91.7,nk:-13,n:{s:76.4,e:0,h:-1.5,k:0.4,a:-45}},B:{t:-93.4,nk:-14.7,n:{s:78.1,e:0,h:0.2,k:3.9,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  tuckbl:{eq:[{t:'pullbar',p:[57,12]}],d:-1,A:{t:93.8,nk:20.5,n:{s:-43.3,e:0,h:132,k:132.3,a:35}},B:{t:95.7,nk:22.4,n:{s:-45.2,e:0,h:132,k:132.3,a:35}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  straddlebl:{eq:[{t:'pullbar',p:[57,12]}],d:-1,A:{t:91.6,nk:18.3,n:{s:-41.1,e:0,h:-1.6,k:0,a:35},f:{s:-41.1,e:0,h:22,k:4,a:35}},B:{t:93.2,nk:19.9,n:{s:-42.7,e:0,h:-3.2,k:0,a:35},f:{s:-42.7,e:0,h:17.4,k:0.9,a:35}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  fullbl:{eq:[{t:'pullbar',p:[57,12]}],d:1,A:{t:-91.6,nk:-18.3,n:{s:41.1,e:0,h:1.6,k:0,a:-45}},B:{t:-93.2,nk:-19.9,n:{s:42.7,e:0,h:0,k:0.4,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  tuckpl:{eq:[{t:'floor'}],d:-1,A:{t:88,nk:-15.7,n:{s:74,e:0,h:132,k:150,a:35,w:-62}},B:{t:86,nk:-13.5,n:{s:77,e:0,h:132,k:150,a:35,w:-65}},root:{j:'Wn',p:[40,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  advpl:{eq:[{t:'floor'}],d:-1,A:{t:88.2,nk:-13.1,n:{s:98.1,e:0,h:83,k:81.3,a:35}},B:{t:90,nk:-11.3,n:{s:96.3,e:0,h:81.3,k:81.3,a:35}},ik:{Wn:{to:[40,108.6],hand:90}},root:{j:'P',p:{A:[70,80],B:[70,81]}},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  straddlepl:{eq:[{t:'floor'}],d:-1,A:{t:92,nk:-24,n:{s:60,e:0,h:0,k:0,a:35,w:-60},f:{s:60,e:0,h:10,k:6.9,a:35,w:-60}},B:{t:90,nk:-22.2,n:{s:64,e:0,h:-1.8,k:0,a:35,w:-64},f:{s:64,e:0,h:10,k:3.5,a:35,w:-64}},root:{j:'Wn',p:[28,108.6]},grip:{t:'apoyo',w:'medio'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  fullpl:{eq:[{t:'floor'}],d:-1,A:{t:92,nk:-24,n:{s:60,e:0,h:0,k:0,a:35,w:-60}},B:{t:90,nk:-22.2,n:{s:64,e:0,h:-1.8,k:0,a:35,w:-64}},root:{j:'Wn',p:[28,108.6]},grip:{t:'apoyo',w:'medio'},lock:[{u:'all',j:'e'}]},
  pikepush:{eq:[{t:'floor'}],d:1,A:{t:-41.3,nk:-5.8,n:{s:-58,e:5.4,h:-28,k:3.2,a:-26.6}},B:{t:-34,nk:-2,n:{s:-58,e:106.2,h:-28,k:5.9,a:-26.6}},ik:{An:{to:[102,107.45],flat:1},Af:{to:[102,107.45],flat:1},Wn:{to:[36,108.6],hand:90},Wf:{to:[36,108.6],hand:90}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[72,52],B:[74,58]}},grip:{t:'apoyo',w:'medio'}},
  crow:{eq:[{t:'floor'}],d:-1,A:{t:57.5,nk:-1.5,n:{s:85.6,e:48.2,h:132,k:121,a:35}},B:{t:55.7,nk:-1.8,n:{s:87.4,e:48.2,h:132,k:121,a:35}},ik:{Wn:{to:[42,108.6],hand:90},Wf:{to:[42,108.6],hand:90}},root:{j:'P',p:{A:[60,78],B:[60,77]}},grip:{t:'apoyo',w:'medio'}},
  onelegfl:{eq:[{t:'pullbar',p:[48,12]}],d:1,A:{t:-91.7,nk:-13,n:{s:76.4,e:0,h:1.7,k:0,a:-45},f:{s:76.4,e:0,h:83.6,k:85.4,a:-45}},B:{t:-93.4,nk:-14.7,n:{s:78.1,e:0,h:0.2,k:0.4,a:-45},f:{s:78.1,e:0,h:85.8,k:86,a:-45}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[48,12]},grip:{t:'prono',w:'medio'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  /* skin the cat: colgado → invertido encogido (cadera sobre los hombros, rodillas entre los brazos) → german hang (lim hombro −140: los hombros en extensión extrema con los brazos detrás del cuerpo, que es la posición final del ejercicio) */
  skincat:{eq:[{t:'pullbar',p:[60,18]}],d:-1,A:{t:-180,nk:0,n:{s:178,e:0,h:60,k:140,a:35}},B:{t:160,nk:20,n:{s:-140,e:0,h:-10,k:20,a:20}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[60,18]},grip:{t:'prono',w:'medio'},lim:{s:[-140,180]},M:{t:0,nk:0,n:{s:20,e:0,h:135,k:140,a:20}}},
  advbl:{eq:[{t:'pullbar',p:[57,12]}],d:-1,A:{t:91.6,nk:18.3,n:{s:-41.1,e:0,h:88.4,k:90,a:35}},B:{t:93.2,nk:19.9,n:{s:-42.7,e:0,h:86.8,k:90,a:35}},ik:{Gf:{rel:'Gn',off:[3,-2.2]}},root:{j:'Gn',p:[57,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  onelegl:{eq:[{t:'floor'},{t:'post',p:[40,76,66,76]},{t:'post',p:[46,76,46,111]}],d:1,A:{t:-176.4,nk:9.3,n:{s:-9.9,e:0,h:86.4,k:0,a:-45},f:{s:-9.9,e:0,h:63.2,k:76.3,a:9.5}},B:{t:-176.4,nk:9.3,n:{s:-9.6,e:0,h:89,k:0,a:-45},f:{s:-9.6,e:0,h:59.9,k:72.9,a:9.5}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[52,76]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'},uni:1,lock:[{u:'all',j:'e',sd:['n','f']}]},
  russiandip:{eq:[{t:'floor'},{t:'post',p:[44,63,76,63]},{t:'post',p:[70,63,70,111]}],d:1,A:{t:175,nk:0.1,n:{s:0.1,e:4.9,h:-5.1,k:74.8,a:35}},B:{t:190,nk:-0.3,n:{s:-29.9,e:110,h:-20,k:94.9,a:35}},ik:{Gn:{A:[60,63],B:[72,63]},Gf:{A:[60,63],B:[72,63]}},root:{j:'P',p:{A:[58.6,65.9],B:[69,79.4]}},grip:{t:'neutro',w:'medio',txt:'(paralelas)'}},
  impdip:{eq:[{t:'floor'},{t:'post',p:[44,63,76,63]},{t:'post',p:[70,63,70,111]}],d:1,A:{t:178.1,nk:0,n:{s:1.9,e:90,h:-8.2,k:89.9,a:35}},B:{t:178.1,nk:0,n:{s:1.9,e:0,h:-8.2,k:89.9,a:35}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[65,63]},grip:{t:'neutro',w:'medio',txt:'(paralelas)'}},
  boxpistol:{eq:[{t:'floor'},{t:'block',r:[36,90,18,20]}],d:1,A:{t:180,nk:0,n:{s:90,e:0,h:0,k:0,a:0},f:{s:90,e:0,h:25.2,k:15.1,a:-20.2}},B:{t:164.9,nk:-0.2,n:{s:105.1,e:0,h:95.3,k:95.1,a:14.9},f:{s:105.1,e:0,h:110.2,k:0.4,a:-24.6}},ik:{An:{to:{A:[60,107.45],B:[64,107.45]},flat:1}},feet:{n:'floor'},root:{j:'P',p:{A:[60,69],B:[48,84.5]}},uni:1},
  vflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[30,6,30,111]}],root:{j:'GR',p:[30,32]},A:{t:-30,L:{a:180,e:0,h:0,k:0},R:{a:30,e:0,h:0,k:0}},B:{t:-30,L:{a:180,e:0,h:4,k:0},R:{a:30,e:0,h:4,k:0}}},
  tuckflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:0,k:-150},R:{a:150,e:0,h:0,k:150},ls:{thL:0.45,thR:0.45}},B:{t:-88,L:{a:150,e:0,h:0,k:-150},R:{a:150,e:0,h:0,k:150},ls:{thL:0.45,thR:0.45}},bentKnees:1},
  straddleflag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:25,k:0},R:{a:150,e:0,h:25,k:0}},B:{t:-88,L:{a:150,e:0,h:25,k:0},R:{a:150,e:0,h:25,k:0}}},
  flag:{v:'front',uni:1,lock:[{u:'all',j:'e',sd:['L','R']}],grip:{t:'mixto',w:'abierto',txt:'(poste)'},eq:[{t:'floor'},{t:'post',p:[14,6,14,111]}],root:{j:'GR',p:[14,40]},A:{t:-90,L:{a:150,e:0,h:0,k:0},R:{a:150,e:0,h:0,k:0}},B:{t:-88,L:{a:150,e:0,h:0,k:0},R:{a:150,e:0,h:0,k:0}}},
  negpull:{eq:[{t:'pullbar',p:[64,21]}],d:1,A:{t:175,nk:0.1,n:{s:35,e:139.8,h:-4.8,k:50.3,a:35}},B:{t:174.8,nk:-0.7,n:{s:155.1,e:10.2,h:0.3,k:25.2,a:30.1}},ik:{Gf:{rel:'Gn',off:[-3,-2.2]}},root:{j:'Gn',p:[64,21]},grip:{t:'prono',w:'medio'}},
  hollow:{eq:[{t:'floor'}],d:1,A:{t:-106.1,nk:-0.7,n:{s:36.2,e:0,h:31.2,k:0.2,a:-45}},B:{t:-109,nk:-0.2,n:{s:40.8,e:0.2,h:38.9,k:0,a:-45}},root:{j:'P',p:[64,104]},lock:[{u:'all',j:'e'}]},
  clappush:{eq:[{t:'floor'}],d:-1,A:{t:103.9,nk:-0.1,n:{s:31.1,e:80.3,h:1.2,k:0.1,a:35}},B:{t:117,nk:-0.1,n:{s:77.9,e:0,h:-5,k:0,a:35}},ik:{An:{to:{A:[90.3,107.45],B:[89.9,107.45]},flat:1},Af:{to:{A:[90.3,107.45],B:[89.9,107.45]},flat:1}},feet:{n:'floor',f:'floor'},root:{j:'P',p:{A:[52.7,94.7],B:[53.7,92.2]}},grip:{t:'apoyo',w:'medio'}},
  sissy:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:69.9,e:10.4,h:0,k:0,a:-45}},B:{t:225,nk:0.4,n:{s:90,e:0,h:-0.1,k:95,a:25}},root:{j:'Tn',p:[66,109.25]},tiptoe:1}
});
mkHook();
/* Lote 9: variantes de flexión armadas sobre la flexión base (que ya valida), cada una con lo que la distingue */
(()=>{const P=MKD.pushup,cl=o=>JSON.parse(JSON.stringify(o)),v=(over,f)=>{const d=cl(P);delete d.lock;Object.assign(d,over);if(f)f(d);return d;};
  Object.assign(MKD,{
    /* diamante: manos juntas debajo del pecho, codos pegados hacia atrás */
    diamond:v({lock:[{u:0,j:'e'}],grip:{t:'apoyo',w:'cerrado'}},d=>{d.ik={Wn:[29,108.6]};d.B.n.ab=0;d.A.t=107;d.B.t=96;}),
    /* arquero: baja hacia un lado; el brazo de afuera queda estirado y abierto al costado */
    archerpush:v({uni:1,lock:[{u:0,j:'e'}],grip:{t:'apoyo',w:'abierto'}},d=>{d.A.t=108;d.B.t=94;d.A.n.ab=0;d.A.f={s:80,e:0,ab:0,h:0,k:0,a:-40};d.B.f={s:40,e:0,ab:30,h:0,k:0,a:-40};d.ik={Wn:[24,108.6],Wf:{own:1,to:[27,106.4]}};}),
    /* pseudo planche: manos a la altura de la cintura, hombros bien adelante */
    pppush:v({lock:[{u:0,j:'e'}],grip:{t:'apoyo',w:'medio',txt:'(dedos hacia afuera)'}},d=>{d.ik={Wn:{to:[34,108.6],hand:-90}};d.A.t=106;d.B.t=92;}),
    /* a un brazo: la otra mano en la espalda, piernas abiertas */
    oapush:v({uni:1,grip:{t:'apoyo',w:'cerrado',txt:'(una mano)'}},d=>{d.ik={Wn:[26,108.6]};d.A.f={s:-40,e:100,h:0,k:0,a:-40};d.B.f={s:-40,e:100,h:0,k:0,a:-40};}),
    /* con palmada: empuja tan fuerte que las manos despegan del piso */
    clappush:v({grip:{t:'apoyo',w:'medio'}},d=>{d.A=cl(P.B);d.B=cl(P.A);d.B.t=112;d.B.n.s=70;d.B.n.e=40;d.ik={Wn:{to:{A:[24,108.6],B:[30,99]}}};}),
    /* planche lean: posición de flexión con los brazos estirados y los hombros bien adelante de las manos (dedos hacia atrás) */
    pllean:v({lock:[{u:'all',j:'e'}],grip:{t:'apoyo',w:'medio',txt:'(dedos hacia afuera)'}},d=>{d.ik={Wn:{to:[37,108.6],hand:-90}};d.A.t=104;d.B=cl(d.A);})
  });})();
mkHook();
/* Lote 9: variantes de dominada armadas sobre la dominada base (que ya valida) */
(()=>{const P=MKD.pullup,cl=o=>JSON.parse(JSON.stringify(o)),v=(over,f)=>{const d=cl(P);Object.assign(d,over);if(f)f(d);return d;};
  Object.assign(MKD,{
    /* dominadas en L: las piernas rectas a 90° todo el recorrido */
    lpullup:v({grip:{t:'prono',w:'medio'}},d=>{d.A.n.h=90;d.A.n.k=0;d.A.n.a=-20;d.B.n.h=90;d.B.n.k=0;d.B.n.a=-20;}),
    /* negativas: arranca arriba (mentón sobre la barra) y baja lento hasta colgar */
    negpull:v({grip:{t:'prono',w:'medio'},lock:[{u:1,j:'e'}]},d=>{const a=d.A;d.A=d.B;d.B=a;})
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
  sidepl:{v:'front',uni:1,bentKnees:1,grip:{t:'apoyo',w:'cerrado',txt:'(antebrazo)'},eq:[{t:'floor'}],root:{j:'EL',p:[30,105]},feet:{L:'floor'},A:{t:-106,L:{a:80,e:-90,h:0,k:0},R:{a:20,e:-5,h:0,k:0},ls:{faL:0.3}},B:{t:-105,L:{a:80,e:-90,h:3,k:0},R:{a:20,e:-5,h:0,k:0},ls:{faL:0.3}},tiptoe:1},
  birddog:{eq:[{t:'floor'}],d:-1,A:{t:101.5,nk:0,n:{s:78.5,e:0,h:78.5,k:95,a:-45},f:{s:70,e:0,h:78.5,k:95,a:-45}},B:{t:101.5,nk:0,n:{s:78.5,e:0,h:-11.5,k:0,a:-45},f:{s:168.5,e:0,h:78.5,k:95,a:-45}},ik:{Wn:{to:[34,108.6],hand:90},Wf:{own:1,to:{A:[37,106.4],M:[24,98],B:[10,79]},hand:90}},root:{j:'P',p:[63.4,87]},grip:{t:'apoyo',w:'medio'},uni:1},
  curlup:{eq:[{t:'floor'}],d:1,A:{t:-90,nk:10,n:{s:12,e:-41.5,h:0,k:0,a:0},f:{s:12,e:-41.5,h:55,k:120,a:-24.9}},B:{t:-98,nk:10,n:{s:6.8,e:-33.4,h:8,k:0,a:0},f:{s:6.8,e:-33.4,h:63,k:120,a:-24.9}},ik:{Af:{to:[79.5,107.45],flat:1},Wn:{to:[56,106.5],hand:90},Wf:{to:[53,104.3],hand:90}},feet:{f:'floor'},root:{j:'P',p:[60,104]},grip:{t:'apoyo',w:'cerrado',txt:'(manos bajo la zona lumbar)'},uni:1},
  biering:{eq:[{t:'floor'},{t:'block',r:[56,75,52,6]},{t:'block',r:[62,81,4,29]},{t:'block',r:[100,81,4,29]},{t:'pad',r:4,at:'An'}],d:-1,A:{t:90,nk:0,n:{s:60,e:120,h:0,k:0,a:-50}},B:{t:86.9,nk:-0.5,n:{s:59.7,e:120.3,h:3.1,k:0,a:-50}},root:{j:'P',p:[56,70]}},
  deadhang:{eq:[{t:'pullbar',front:1,p:[30,12,90]}],v:'front',A:{t:180,tk:1,L:{a:174,e:4,h:6,k:-4.2},R:{a:174,e:4,h:6,k:-4.2},ls:{faL:0.7659999999999999,faR:0.7659999999999999}},B:{t:180,tk:1,L:{a:174,e:4,h:6,k:-3.9},R:{a:174,e:4,h:6,k:-3.9},ls:{faL:0.763,faR:0.763}},root:{j:'GL',p:[51,12]},grip:{t:'prono',w:'medio'},lock:[{u:'all',j:'e'}]},
  extrot:{eq:[{t:'floor'},{t:'post',p:[10,20,10,110],pad:0},{t:'pulley',p:[10,58],to:'GR'}],v:'front',A:{t:180,tk:1,L:{a:4.9,e:-4.9,h:5,k:0},R:{a:0,e:90,h:5,k:0},ls:{faL:0.765,faR:-1}},B:{t:180,tk:1,L:{a:4.9,e:-4.9,h:5,k:0},R:{a:0,e:90,h:5,k:0},ls:{faL:0.765,faR:1}},root:{j:'P',p:[60,68.6]},feet:{L:'floor',R:'floor'},uni:1,grip:{t:'neutro',w:'cerrado',txt:'(banda)'}},
  wallslide:{eq:[{t:'floor'},{t:'wall',r:[36,6,48,101]}],v:'front',A:{t:180,tk:1,L:{a:70,e:98,h:5,k:0},R:{a:70,e:98,h:5,k:0},ls:{faL:0.764,faR:0.764}},B:{t:180,tk:1,L:{a:152,e:-0.1,h:5,k:0},R:{a:152,e:-0.1,h:5,k:0},ls:{faL:0.7609999999999999,faR:0.7609999999999999}},root:{j:'P',p:[60,68.6]},feet:{L:'floor',R:'floor'},grip:{t:'apoyo',w:'abierto',txt:'(contra la pared)'}},
  cmj:{eq:[{t:'floor'}],d:1,A:{t:149.7,nk:-18.9,n:{s:-40,e:1.8,h:83.4,k:71.6,a:18.4}},B:{t:178.1,nk:3.8,n:{s:122.9,e:7.7,h:4.8,k:2.9,a:0}},root:{j:'P',p:{A:[48,78],B:[59,54]}}},
  broadjump:{eq:[{t:'floor'}],d:1,A:{t:144,nk:0.8,n:{s:-40,e:0,h:94,k:84.6,a:26.6}},B:{t:149.7,nk:6.6,n:{s:68.9,e:88.2,h:96.3,k:92.6,a:26.6}},root:{j:'Tn',p:{A:[38,109.25],M:[62,96],B:[96,109.25]}},M:{t:165,nk:0,n:{s:140,e:10,h:45,k:70,a:-10}},fwd:1},
  pogo:{eq:[{t:'floor'}],d:1,A:{t:180,nk:0,n:{s:-10.3,e:20.5,h:0,k:0,a:-50}},B:{t:180,nk:0,n:{s:-6.2,e:12.4,h:0,k:0,a:-50}},root:{j:'P',p:{A:[59.3,62.5],B:[60.9,53.1]}}},
  skater:{eq:[{t:'floor'}],v:'front',A:{t:-174.3,tk:1.005,L:{a:-30,e:10.1,h:4.9,k:-14.9},R:{a:30,e:-10.2,h:-22.1,k:-19.7},ls:{faL:0.7659999999999999,faR:0.763}},B:{t:-185.7,tk:1.005,L:{a:30,e:-10.2,h:-22.1,k:-19.7},R:{a:-30,e:10.1,h:4.9,k:-14.9},ls:{faL:0.763,faR:0.7659999999999999}},root:{j:'P',p:{A:[44,68.8],M:[60,60],B:[76,68.8]}},uni:1,bentKnees:1},
  sprint:{eq:[{t:'floor'}],d:1,A:{t:168.7,nk:0,n:{s:-24.2,e:62.1,h:60.1,k:65.5,a:16.7},f:{s:56.3,e:104,h:-8.7,k:16.9,a:36.9}},B:{t:168.7,nk:0,n:{s:56.3,e:104,h:-8.7,k:16.9,a:36.9},f:{s:-24.2,e:62.1,h:60.1,k:65.5,a:16.7}},root:{j:'P',p:[58,66]},uni:1},
  burpee:{eq:[{t:'floor'}],d:-1,tiptoe:1,A:{t:108,nk:-5,n:{s:72,e:0,w:-90,h:0,k:0,a:-40}},B:{t:176,nk:0,n:{s:125,e:4,w:0,h:0,k:2,a:-40}},root:{j:'Tn',p:{A:[91,109.25],M:[66,109.25],B:[62,99]}},grip:{t:'apoyo',w:'medio'},M:{t:105,nk:-5,n:{s:65,e:0,w:-90,h:125,k:140,a:25}}},
  jumprope:{eq:[{t:'floor'},{t:'rope',y:[152,-40]}],v:'front',A:{t:180,tk:1,L:{a:20,e:60.3,h:6,k:-3.9},R:{a:20,e:60.3,h:6,k:-3.9},ls:{faL:0.764,faR:0.764}},B:{t:180,tk:1,L:{a:20,e:62.1,h:6,k:-3.9},R:{a:20,e:62.1,h:6,k:-3.9},ls:{faL:0.7659999999999999,faR:0.7659999999999999}},root:{j:'P',p:{A:[60,69],B:[60,62]}},grip:{t:'neutro',w:'cerrado',txt:'(soga)'}},
  bearcrawl:{eq:[{t:'floor'}],d:-1,uni:1,tiptoe:1,A:{t:92,nk:-5,n:{s:80,e:0,h:100,k:100,a:-30},f:{s:80,e:0,h:80,k:100,a:-30}},B:{t:92,nk:-5,n:{s:80,e:0,h:80,k:100,a:-30},f:{s:80,e:0,h:100,k:100,a:-30}},ik:{Wn:{to:{A:[30,108.6],M:[27,103],B:[24,108.6]},hand:90},Wf:{own:1,to:{A:[25,106.4],M:[27,101],B:[30,106.4]},hand:90},Tn:{to:{A:[78,109.25],M:[82,106],B:[86,109.25]}},Tf:{own:1,to:{A:[88,109.25],M:[84,106],B:[80,109.25]}}},root:{j:'P',p:[62,84]},grip:{t:'apoyo',w:'medio'}},
  highknees:{eq:[{t:'floor'}],d:1,A:{t:-177.9,nk:0.2,n:{s:-32.1,e:50.3,h:87.9,k:90,a:-19.8},f:{s:28,e:129.7,h:-2.1,k:0,a:-50}},B:{t:-177.9,nk:0.2,n:{s:28,e:129.7,h:-2.1,k:0,a:-50},f:{s:-32.1,e:50.3,h:87.9,k:90,a:-19.8}},root:{j:'P',p:[59.3,62.5]},uni:1}
});
mkHook();
