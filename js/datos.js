'use strict';
/* ============ Datos fijos ============ */
const TIERS=['Bronce','Plata','Oro','Platino','Diamante','Campeón','Élite'];
const TCOL=['#C27A3F','#8794AC','#CC8A12','#1F9E95','#2F73E0','#8F43EA','#DA2A52'];
const MUSC={pecho:'Pecho',hombros:'Hombros',biceps:'Bíceps',triceps:'Tríceps',antebrazos:'Antebrazos',abs:'Abdominales',oblicuos:'Oblicuos',trapecio:'Trapecio',dorsales:'Dorsales',lumbar:'Espalda baja',gluteos:'Glúteos',cuadriceps:'Cuádriceps',isquios:'Isquiotibiales',gemelos:'Gemelos',aductores:'Aductores'};
const LOWER=['cuadriceps','gluteos','isquios','gemelos','lumbar','aductores'];
const GROUPS={Pecho:['pecho'],Espalda:['dorsales','trapecio','lumbar'],Hombros:['hombros'],Brazos:['biceps','triceps','antebrazos'],Piernas:['cuadriceps','gluteos','isquios','gemelos','aductores'],Core:['abs','oblicuos']};
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const DIAS=['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const DIAS3={1:'Lun',2:'Mar',3:'Mié',4:'Jue',5:'Vie',6:'Sáb',0:'Dom'};
const ACT=[{f:1.2,l:'Sedentario (poco ejercicio)'},{f:1.375,l:'Ligero (1-3 días por semana)'},{f:1.55,l:'Moderado (3-5 días por semana)'},{f:1.725,l:'Alto (6-7 días por semana)'}];
const GOALS={bulk:'Volumen',recomp:'Recomp',cut:'Cut'};

function E(id,n,eq,p,s,d,st,o){return Object.assign({id,n,eq,p,s,d,st:st||null,reg:LOWER.includes(p[0])?'l':'u'},o||{});}
/* st = [razón 1RM/peso corporal en Bronce 1, razón en Élite] para un hombre adulto.
   Las filas con ph usan peso por mancuerna. bw = fracción del peso corporal que se mueve. */
const EX=[
E('bench','Press banca','Barra',['pecho'],['triceps','hombros'],'Bajá la barra hasta el pecho y empujá sin despegar la espalda del banco.',[.30,2.10]),
E('incbench','Press inclinado','Barra',['pecho'],['hombros','triceps'],'Banco a 30°. Bajá la barra a la parte alta del pecho y empujá.',[.25,1.75]),
E('dbpress','Press con mancuernas','Mancuernas',['pecho'],['triceps','hombros'],'Empujá las mancuernas hacia arriba juntándolas sin chocarlas.',[.12,.85],{ph:1}),
E('dbfly','Aperturas con mancuernas','Mancuernas',['pecho'],['hombros'],'Abrí los brazos con codos semiflexionados y volvé apretando el pecho.',[.04,.38],{ph:1}),
E('cablefly','Cruces en polea','Polea',['pecho'],['hombros'],'Juntá las manos al frente con los codos levemente flexionados.',[.08,.55],{ph:1}),
E('pushup','Flexiones','Peso corporal',['pecho'],['triceps','hombros','abs'],'Cuerpo en línea recta. Bajá el pecho al piso y empujá.',null,{sk:{f:'push',b:2.2,u:11.1,t:30}}),
E('dips','Fondos en paralelas','Peso corporal',['triceps','pecho'],['hombros'],'Bajá hasta que el codo llegue a 90° y subí sin balancearte.',[1.03,2.20],{bw:1}),
E('pullup','Dominadas','Barra fija',['dorsales'],['biceps','trapecio','antebrazos'],'Colgate y llevá el mentón sobre la barra tirando con la espalda.',[1.03,2.0],{bw:1}),
E('latpull','Jalón al pecho','Polea',['dorsales'],['biceps','trapecio'],'Tirá la barra hacia la parte alta del pecho con el torso firme.',[.35,1.50]),
E('row','Remo con barra','Barra',['dorsales','trapecio'],['biceps','lumbar','hombros'],'Torso inclinado y espalda neutra. Llevá la barra hacia el abdomen.',[.30,1.70]),
E('dbrow','Remo con mancuerna','Mancuerna',['dorsales'],['biceps','trapecio'],'Apoyá una mano en el banco y tirá la mancuerna hacia la cadera.',[.12,.85],{ph:1}),
E('cablerow','Remo en polea baja','Polea',['dorsales','trapecio'],['biceps'],'Sentado, tirá del agarre hacia el abdomen juntando los omóplatos.',[.35,1.50]),
E('deadlift','Peso muerto','Barra',['lumbar','gluteos','isquios'],['trapecio','antebrazos','cuadriceps'],'Barra pegada al cuerpo. Empujá el piso con las piernas y extendé la cadera.',[.50,3.0]),
E('facepull','Face pull','Polea',['hombros','trapecio'],['dorsales'],'Tirá la cuerda hacia la cara abriendo los codos.',[.10,.60]),
E('shrug','Encogimientos','Barra',['trapecio'],['antebrazos'],'Subí los hombros hacia las orejas y bajá controlado.',[.40,2.20]),
E('ohp','Press militar','Barra',['hombros'],['triceps','trapecio','abs'],'De pie, empujá la barra sobre la cabeza con el abdomen firme.',[.20,1.35]),
E('dbohp','Press de hombros con mancuernas','Mancuernas',['hombros'],['triceps'],'Empujá las mancuernas hacia arriba hasta extender los brazos.',[.10,.65],{ph:1}),
E('lateral','Elevaciones laterales','Mancuernas',['hombros'],['trapecio'],'Subí los brazos a los costados hasta la altura de los hombros.',[.03,.28],{ph:1}),
E('curl','Curl con barra','Barra',['biceps'],['antebrazos'],'Flexioná los codos sin balancear el cuerpo.',[.15,.95]),
E('dbcurl','Curl con mancuernas','Mancuernas',['biceps'],['antebrazos'],'Subí cada mancuerna girando la muñeca y bajá lento.',[.07,.50],{ph:1}),
E('hammer','Curl martillo','Mancuernas',['biceps','antebrazos'],[],'Agarre neutro: palmas enfrentadas durante todo el movimiento.',[.07,.50],{ph:1}),
E('pushdown','Extensión de tríceps en polea','Polea',['triceps'],[],'Codos pegados al cuerpo. Extendé los brazos hacia abajo.',[.15,1.0]),
E('skull','Press francés','Barra Z',['triceps'],[],'Acostado, bajá la barra hacia la frente y extendé los codos.',[.15,.95]),
E('wrist','Curl de muñeca','Barra',['antebrazos'],[],'Antebrazos apoyados, flexioná solo las muñecas.',[.08,.60]),
E('squat','Sentadilla','Barra',['cuadriceps','gluteos'],['isquios','lumbar','abs'],'Barra en la espalda alta. Bajá con la espalda firme y subí empujando el piso.',[.40,2.60]),
E('frontsquat','Sentadilla frontal','Barra',['cuadriceps'],['gluteos','abs'],'Barra sobre los hombros al frente, codos altos y torso erguido.',[.30,2.0]),
E('legpress','Prensa de piernas','Máquina',['cuadriceps','gluteos'],['isquios'],'Bajá la plataforma controlado y empujá sin bloquear las rodillas.',[.80,5.0]),
E('legext','Extensión de cuádriceps','Máquina',['cuadriceps'],[],'Extendé las rodillas y pausá arriba un segundo.',[.30,1.40]),
E('legcurl','Curl femoral','Máquina',['isquios'],['gemelos'],'Llevá los talones hacia los glúteos de forma controlada.',[.25,1.20]),
E('rdl','Peso muerto rumano','Barra',['isquios','gluteos'],['lumbar'],'Llevá la cadera hacia atrás con las rodillas casi rectas y la espalda neutra.',[.40,2.40]),
E('hipthrust','Hip thrust','Barra',['gluteos'],['isquios'],'Espalda alta en el banco. Subí la cadera y apretá los glúteos.',[.50,3.0]),
E('lunge','Zancadas','Mancuernas',['cuadriceps','gluteos'],['isquios'],'Da un paso largo y bajá la rodilla de atrás hacia el piso.',[.10,.80],{ph:1}),
E('bulgarian','Sentadilla búlgara','Mancuernas',['cuadriceps','gluteos'],['isquios'],'Pie de atrás elevado en un banco. Bajá con el torso firme.',[.10,.90],{ph:1}),
E('calf','Elevación de gemelos de pie','Máquina',['gemelos'],[],'Subí en puntas de pie con pausa arriba y bajá estirando.',[.50,2.80]),
E('seatedcalf','Gemelos sentado','Máquina',['gemelos'],[],'Subí los talones con las rodillas a 90° y pausá arriba.',[.30,1.80]),
E('crunch','Abdominales (crunch)','Peso corporal',['abs'],['oblicuos'],'Subí los hombros del piso contrayendo el abdomen, sin tirar del cuello.',null,{bw:.3}),
E('legraise','Elevación de piernas','Barra fija',['abs'],['antebrazos'],'Colgado, subí las piernas rectas sin balancearte.',null,{bw:.35}),
E('plank','Plancha (segundos)','Peso corporal',['abs','oblicuos'],['lumbar','hombros'],'Cuerpo en línea recta apoyado en antebrazos. Anotá los segundos como repeticiones.',null,{time:1}),
E('russian','Giro ruso','Peso corporal',['oblicuos'],['abs'],'Sentado con el torso inclinado, girá de lado a lado.',null,{bw:.3}),
E('hyper','Hiperextensiones','Banco romano',['lumbar','gluteos'],['isquios'],'Bajá el torso con la espalda recta y subí hasta alinear el cuerpo.'),
/* ---- Calistenia: progresiones. sk = {f: familia, b: nivel donde empieza la variante, t: reps o segundos para llegar a la siguiente} ---- */
E('kneepush','Flexiones de rodillas','Peso corporal',['pecho'],['triceps','hombros'],'Rodillas apoyadas, cuerpo recto de rodillas a cabeza. La base para llegar a la flexión completa.',null,{sk:{f:'push',b:0.2,u:3.7,t:20}}),
E('diamond','Flexiones diamante','Peso corporal',['triceps','pecho'],['hombros'],'Manos juntas formando un rombo debajo del pecho. Codos pegados al cuerpo.',null,{sk:{f:'push',b:5.1,u:12.2,t:20}}),
E('archerpush','Flexiones arquero','Peso corporal',['pecho'],['triceps','hombros'],'Manos bien abiertas: bajás hacia un lado con ese brazo flexionado y el otro estirado.',null,{sk:{f:'push',b:11.1,u:15.2,t:12}}),
E('pppush','Flexiones pseudo planche','Peso corporal',['hombros','pecho'],['triceps','abs'],'Manos a la altura de la cintura, dedos hacia atrás y el cuerpo inclinado hacia adelante.',null,{sk:{f:'push',b:14.7,u:16.7,t:15}}),
E('oapush','Flexión a un brazo','Peso corporal',['pecho','triceps'],['hombros','oblicuos'],'Piernas abiertas, una mano en la espalda. Bajá sin rotar la cadera.',null,{sk:{f:'push',b:15.7,u:16.9,t:10}}),
E('planchepush','Flexión en planche','Peso corporal',['hombros','pecho'],['triceps','abs'],'Sin apoyar los pies: flexión completa sostenido en planche.',null,{sk:{f:'push',b:18,u:18,t:5}}),
E('austrow','Remo australiano','Barra fija',['dorsales'],['biceps','trapecio'],'Debajo de una barra baja, cuerpo recto, tirá del pecho hacia la barra.',null,{sk:{f:'pull',b:1.4,u:8.9,t:20}}),
E('lpullup','Dominadas en L','Barra fija',['dorsales','abs'],['biceps'],'Dominada con las piernas rectas a 90° todo el recorrido.',null,{sk:{f:'pull',b:12.2,u:15.7,t:12}}),
E('archerpull','Dominada arquero','Barra fija',['dorsales'],['biceps','hombros'],'Agarre muy abierto: subís hacia una mano con el otro brazo casi recto.',null,{sk:{f:'pull',b:15.2,u:16.7,t:10}}),
E('muscleup','Muscle-up','Barra fija',['dorsales','triceps'],['pecho','biceps','hombros'],'Dominada explosiva que termina pasando el pecho por encima de la barra en un fondo.',null,{sk:{f:'pull',b:15.7,u:17.3,t:10}}),
E('oapull','Dominada a un brazo','Barra fija',['dorsales','biceps'],['antebrazos','abs'],'Colgado de una mano, subí hasta pasar el mentón.',null,{sk:{f:'pull',b:17.8,u:18,t:5}}),
E('benchdip','Fondos en banco','Peso corporal',['triceps'],['pecho','hombros'],'Manos en un banco detrás tuyo, bajá doblando los codos a 90°.',null,{sk:{f:'dip',b:0.6,u:5.7,t:25}}),
E('ringdip','Fondos en anillas','Anillas',['triceps','pecho'],['hombros','abs'],'Como el fondo en paralelas pero en anillas: hay que estabilizar todo el recorrido.',null,{sk:{f:'dip',b:13.2,u:16.9,t:40}}),
E('airsquat','Sentadilla sin peso','Peso corporal',['cuadriceps','gluteos'],['isquios'],'Bajá hasta romper el paralelo con el pecho arriba.',null,{sk:{f:'legs',b:0.1,u:4.4,t:40}}),
E('shrimp','Sentadilla shrimp','Peso corporal',['cuadriceps','gluteos'],['isquios','abs'],'Sobre una pierna, agarrás el pie de atrás y bajás hasta tocar la rodilla al piso.',null,{sk:{f:'legs',b:8.9,u:14.2,t:10}}),
E('pistol','Pistol squat','Peso corporal',['cuadriceps','gluteos'],['abs','gemelos'],'Sentadilla completa a una pierna con la otra estirada adelante.',null,{sk:{f:'legs',b:13.2,u:15.9,t:15}}),
E('dragon','Dragon pistol','Peso corporal',['cuadriceps','gluteos'],['abs','aductores'],'Pistol con la pierna libre cruzada por detrás de la de apoyo.',null,{sk:{f:'legs',b:16.9,u:17.8,t:8}}),
E('tucklsit','L-sit encogido (segundos)','Paralelas',['abs'],['triceps','hombros'],'Sostenete con los brazos rectos y las rodillas al pecho.',null,{time:1,sk:{f:'lsit',b:5.7,u:8.9,t:20}}),
E('lsit','L-sit (segundos)','Paralelas',['abs','oblicuos'],['triceps','hombros','cuadriceps'],'Brazos rectos y piernas estiradas a 90° del torso.',null,{time:1,sk:{f:'lsit',b:13.2,u:15.9,t:30}}),
E('vsit','V-sit (segundos)','Paralelas',['abs'],['hombros','triceps'],'Como el L-sit pero con las piernas subiendo hacia la cara.',null,{time:1,sk:{f:'lsit',b:16.9,u:17.8,t:15}}),
E('wallhs','Vertical contra la pared (segundos)','Peso corporal',['hombros'],['triceps','trapecio','abs'],'Parado de manos con el pecho mirando a la pared.',null,{time:1,sk:{f:'hs',b:8.2,u:13.2,t:60}}),
E('freehs','Vertical libre (segundos)','Peso corporal',['hombros'],['triceps','trapecio','abs','antebrazos'],'Parado de manos sin apoyo, cuerpo alineado.',null,{time:1,sk:{f:'hs',b:14.7,u:16.9,t:30}}),
E('hspu','Flexión de vertical en pared','Peso corporal',['hombros','triceps'],['trapecio'],'Parado de manos contra la pared, bajá la cabeza al piso y empujá.',null,{sk:{f:'hs',b:15.4,u:16.7,t:12}}),
E('freehspu','Flexión de vertical libre','Peso corporal',['hombros','triceps'],['trapecio','abs'],'Flexión completa en vertical sin pared.',null,{sk:{f:'hs',b:17.8,u:18,t:8}}),
E('tuckfl','Front lever encogido (segundos)','Barra fija',['dorsales'],['abs','biceps'],'Colgado, cuerpo horizontal boca arriba con las rodillas al pecho.',null,{time:1,sk:{f:'fl',b:12.2,u:14.7,t:20}}),
E('advfl','Front lever avanzado (segundos)','Barra fija',['dorsales'],['abs','biceps','lumbar'],'Como el encogido pero con la espalda plana.',null,{time:1,sk:{f:'fl',b:14.7,u:16.2,t:15}}),
E('straddlefl','Front lever abierto (segundos)','Barra fija',['dorsales','abs'],['biceps','lumbar'],'Piernas estiradas y abiertas, cuerpo horizontal.',null,{time:1,sk:{f:'fl',b:16.9,u:17.6,t:10}}),
E('fullfl','Front lever completo (segundos)','Barra fija',['dorsales','abs'],['biceps','lumbar','gluteos'],'Cuerpo totalmente recto y horizontal colgado de la barra.',null,{time:1,sk:{f:'fl',b:17.6,u:18,t:10}}),
E('tuckbl','Back lever encogido (segundos)','Barra fija',['dorsales','pecho'],['biceps','hombros'],'Horizontal boca abajo con las rodillas al pecho.',null,{time:1,sk:{f:'bl',b:11.1,u:13.6,t:20}}),
E('straddlebl','Back lever abierto (segundos)','Barra fija',['dorsales','pecho'],['biceps','hombros','lumbar'],'Piernas abiertas y estiradas, cuerpo horizontal boca abajo.',null,{time:1,sk:{f:'bl',b:15.9,u:16.9,t:15}}),
E('fullbl','Back lever completo (segundos)','Barra fija',['dorsales','pecho'],['biceps','hombros','gluteos'],'Cuerpo recto y horizontal boca abajo.',null,{time:1,sk:{f:'bl',b:16.9,u:17.8,t:30}}),
E('tuckpl','Planche encogida (segundos)','Paralelas',['hombros'],['pecho','triceps','abs'],'Brazos rectos, cuerpo en el aire con las rodillas al pecho.',null,{time:1,sk:{f:'pl',b:15.2,u:16.4,t:20}}),
E('advpl','Planche avanzada (segundos)','Paralelas',['hombros'],['pecho','triceps','abs'],'Como la encogida pero con la espalda plana.',null,{time:1,sk:{f:'pl',b:16.7,u:17.6,t:15}}),
E('straddlepl','Planche abierta (segundos)','Paralelas',['hombros','pecho'],['triceps','abs','gluteos'],'Piernas abiertas y estiradas, cuerpo horizontal sobre las manos.',null,{time:1,sk:{f:'pl',b:17.9,u:18,t:10}}),
E('fullpl','Planche completa (segundos)','Paralelas',['hombros','pecho'],['triceps','abs','gluteos'],'Cuerpo totalmente recto y horizontal sobre las manos. Nivel élite.',null,{time:1,sk:{f:'pl',b:18,u:18,t:5}}),
E('pikepush','Flexiones en pica','Peso corporal',['hombros'],['triceps','trapecio'],'Cadera bien arriba, cuerpo en V invertida: bajás la cabeza hacia el piso entre las manos. La base para la vertical.',null,{sk:{f:'hs',b:3.7,u:8.9,t:15}}),
E('crow','Cuervo (segundos)','Peso corporal',['hombros','abs'],['triceps','antebrazos'],'Manos en el piso, rodillas apoyadas arriba de los codos y los pies en el aire.',null,{time:1,sk:{f:'pl',b:7.3,u:11.1,t:30}}),
E('pllean','Planche lean (segundos)','Peso corporal',['hombros'],['pecho','abs','antebrazos'],'En plancha de flexión con los brazos rectos, llevá los hombros bien adelante de las manos.',null,{time:1,sk:{f:'pl',b:8.2,u:11.1,t:30}}),
E('onelegfl','Front lever a una pierna (segundos)','Barra fija',['dorsales','abs'],['biceps','lumbar'],'Cuerpo horizontal boca arriba con una pierna estirada y la otra encogida.',null,{time:1,sk:{f:'fl',b:15.9,u:16.9,t:12}}),
E('skincat','Skin the cat','Barra fija',['dorsales','hombros'],['pecho','biceps','abs'],'Colgado, pasás las piernas entre los brazos y girás hasta quedar colgado de espaldas. Volvés despacio.',null,{sk:{f:'bl',b:8.9,u:12.2,t:5}}),
E('advbl','Back lever avanzado (segundos)','Barra fija',['dorsales','pecho'],['biceps','hombros','lumbar'],'Horizontal boca abajo con la espalda plana y las rodillas dobladas a 90°.',null,{time:1,sk:{f:'bl',b:13.6,u:15.7,t:15}}),
E('onelegl','L-sit a una pierna (segundos)','Paralelas',['abs'],['triceps','hombros','cuadriceps'],'Como el L-sit pero con una pierna estirada y la otra doblada.',null,{time:1,sk:{f:'lsit',b:10,u:13.2,t:20}}),
E('russiandip','Fondos rusos','Paralelas',['triceps','pecho'],['hombros','abs'],'Bajás en el fondo hasta apoyar los antebrazos en las barras y volvés a subir a brazos rectos.',null,{sk:{f:'dip',b:15.2,u:16.7,t:10}}),
E('impdip','Fondo imposible','Paralelas',['triceps'],['pecho','hombros','abs'],'Bajás hasta apoyar los antebrazos y subís a brazos rectos sin que los codos se separen de la barra.',null,{sk:{f:'dip',b:17.3,u:18,t:5}}),
E('boxpistol','Pistol a un cajón','Cajón',['cuadriceps','gluteos'],['abs'],'Pistol bajando hasta sentarte en un cajón o banco bajo y volviendo a subir con una pierna.',null,{sk:{f:'legs',b:11.1,u:14.2,t:12}}),
E('vflag','Bandera vertical (segundos)','Barra vertical',['oblicuos','dorsales'],['hombros','abs'],'Agarrado del poste, el cuerpo queda casi vertical con los pies arriba. El primer paso hacia la bandera.',null,{time:1,sk:{f:'flag',b:15.7,u:16.4,t:15}}),
E('tuckflag','Bandera encogida (segundos)','Barra vertical',['oblicuos','dorsales'],['hombros','abs'],'Cuerpo horizontal de costado con las rodillas al pecho.',null,{time:1,sk:{f:'flag',b:16.2,u:16.9,t:10}}),
E('straddleflag','Bandera abierta (segundos)','Barra vertical',['oblicuos','dorsales'],['hombros','abs'],'Horizontal de costado con las piernas estiradas y abiertas.',null,{time:1,sk:{f:'flag',b:17.1,u:17.7,t:10}}),
E('flag','Bandera humana (segundos)','Barra vertical',['oblicuos','dorsales'],['hombros','abs'],'Agarrado de un poste, cuerpo horizontal de costado.',null,{time:1,sk:{f:'flag',b:17.8,u:18,t:10}}),
/* ---- Deporte: potencia, prevención y estabilidad ---- */
E('boxjump','Saltos al cajón','Cajón',['cuadriceps','gluteos'],['gemelos','isquios'],'Saltá con los dos pies y caé suave arriba del cajón. Bajá caminando.',null,{sport:1}),
E('jumpsquat','Sentadilla con salto','Peso corporal',['cuadriceps','gluteos'],['gemelos'],'Sentadilla y salto explosivo. Caé amortiguando con las rodillas.',null,{sport:1}),
E('kbswing','Swing con pesa rusa','Pesa rusa',['gluteos','isquios'],['lumbar','hombros','abs'],'Bisagra de cadera: la pesa sube por la fuerza de la cadera, no de los brazos.',null,{sport:1}),
E('nordic','Curl nórdico','Peso corporal',['isquios'],['gluteos'],'De rodillas con los tobillos sujetos, bajá el torso lo más lento posible. Previene desgarros.',null,{sport:1}),
E('copenhagen','Plancha Copenhague (segundos)','Banco',['aductores'],['oblicuos','abs'],'Plancha lateral con la pierna de arriba apoyada en un banco. Previene pubalgia.',null,{time:1,sport:1}),
E('pallof','Press Pallof','Polea',['oblicuos','abs'],['hombros'],'De costado a la polea, empujá el agarre al frente sin dejar que te gire.',null,{sport:1}),
E('medslam','Lanzamiento de balón medicinal','Balón medicinal',['abs','dorsales'],['hombros','triceps'],'Subí el balón sobre la cabeza y estrellalo contra el piso con todo.',null,{sport:1}),
E('farmer','Paseo del granjero (segundos)','Mancuernas',['antebrazos','trapecio'],['abs','gluteos'],'Caminá con una mancuerna pesada en cada mano, torso firme.',null,{time:1,sport:1}),
E('neckiso','Isométrico de cuello (segundos)','Peso corporal',['trapecio'],['hombros'],'Empujá la cabeza contra tu mano en las 4 direcciones sin moverla. Clave en rugby.',null,{time:1,sport:1}),
E('spansq','Sentadilla española (segundos)','Banda',['cuadriceps'],['gluteos'],'Una banda atrás de las rodillas sujeta a algo firme. Bajá a media sentadilla con el torso derecho y sostené. Cuida el tendón de la rodilla.',null,{time:1,joint:1}),
E('tibraise','Elevación de tibial','Peso corporal',['gemelos'],['cuadriceps'],'Espalda contra la pared y talones adelante: subí las puntas de los pies lo más que puedas y bajá lento.',null,{joint:1}),
E('slcalf','Gemelo a una pierna','Peso corporal',['gemelos'],[],'Parado en un escalón sobre una pierna: subí bien alto y bajá lento hasta estirar.',null,{joint:1}),
E('slbal','Equilibrio a una pierna (segundos)','Peso corporal',['gemelos'],['abs','gluteos'],'Parado en una pierna, rodilla apenas flexionada. Cuando sea fácil, cerrá los ojos.',null,{time:1,joint:1}),
E('kneewall','Rodilla a la pared','Peso corporal',['gemelos'],[],'Pie a unos centímetros de la pared: llevá la rodilla a tocarla sin levantar el talón. Movilidad de tobillo.',null,{joint:1}),
E('slbridge','Puente a una pierna (segundos)','Peso corporal',['gluteos','isquios'],['lumbar'],'Acostado, una pierna arriba: subí la cadera con la otra y sostené con el cuerpo en línea.',null,{time:1,joint:1}),
E('sidepl','Plancha lateral (segundos)','Peso corporal',['oblicuos'],['abs','gluteos'],'De costado sobre el antebrazo, cuerpo en línea recta. Cada lado.',null,{time:1,joint:1}),
E('birddog','Bird dog','Peso corporal',['lumbar'],['gluteos','abs'],'En cuatro patas: estirá brazo y pierna contrarios sin mover la cadera. Pausa de 5 segundos.',null,{joint:1}),
E('curlup','Curl-up de McGill','Peso corporal',['abs'],['oblicuos'],'Acostado con una pierna doblada y manos bajo la zona lumbar: levantá apenas la cabeza y los hombros, sin flexionar la espalda baja.',null,{joint:1}),
E('biering','Extensión isométrica de espalda (segundos)','Banco romano',['lumbar'],['gluteos','isquios'],'Torso en el aire, cuerpo en línea con las piernas: sostené sin arquear.',null,{time:1,joint:1}),
E('deadhang','Colgarse de la barra (segundos)','Barra fija',['antebrazos'],['dorsales','hombros'],'Colgado con los brazos estirados y los hombros activos. Descomprime y fortalece el agarre.',null,{time:1,joint:1}),
E('extrot','Rotación externa con banda','Banda',['hombros'],['trapecio'],'Codo pegado al cuerpo a 90°: llevá la mano hacia afuera contra la banda, lento.',null,{joint:1}),
E('wallslide','Deslizamiento en la pared','Peso corporal',['hombros'],['trapecio'],'Espalda y brazos contra la pared: subí los brazos sin despegarlos. Movilidad de hombro.',null,{joint:1}),
E('cmj','Salto vertical','Peso corporal',['cuadriceps','gluteos'],['gemelos'],'Bajá rápido a un cuarto de sentadilla y saltá lo más alto que puedas usando los brazos. Caé suave.',null,{power:1}),
E('broadjump','Salto en largo','Peso corporal',['gluteos','cuadriceps'],['isquios','gemelos'],'Desde parado, balanceá los brazos y saltá lo más lejos posible con los dos pies. Aguantá la caída.',null,{power:1}),
E('pogo','Saltitos de tobillo','Peso corporal',['gemelos'],['cuadriceps'],'Saltos cortos y rápidos casi sin doblar las rodillas, rebotando como un resorte.',null,{power:1}),
E('skater','Saltos de patinador','Peso corporal',['gluteos','aductores'],['cuadriceps','gemelos'],'Saltá de costado de una pierna a la otra y frená firme cada caída.',null,{power:1}),
E('sprint','Sprint 20 m','Peso corporal',['isquios','cuadriceps'],['gluteos','gemelos'],'Sprint corto al máximo con descanso completo entre cada uno (1-2 min). Cada repetición es un sprint.',null,{power:1})
];
/* largo de cada variante de calistenia: hasta dónde empieza la siguiente de su familia */
(()=>{const fam={};EX.forEach(e=>{if(e.sk)(fam[e.sk.f]=fam[e.sk.f]||[]).push(e);});
  Object.values(fam).forEach(l=>{l.sort((a,b)=>a.sk.b-b.sk.b);l.forEach((e,i)=>{e.sk.g=e.sk.u!=null?Math.max(.5,e.sk.u-e.sk.b):Math.min(4,i<l.length-1?l[i+1].sk.b-e.sk.b:Math.max(1,18-e.sk.b));});});})();
const SKFAM={push:'Flexiones',pull:'Dominadas y muscle-up',dip:'Fondos',legs:'Piernas a una pierna',lsit:'L-sit',hs:'Vertical',fl:'Front lever',bl:'Back lever',pl:'Planche',flag:'Bandera humana'};
const TPL=[
{name:'Empuje: pecho, hombros y tríceps',items:[['bench',4,8],['dbohp',3,10],['incbench',3,10],['lateral',3,15],['pushdown',3,12]]},
{name:'Tirón: espalda y bíceps',items:[['pullup',4,8],['row',4,8],['cablerow',3,10],['facepull',3,15],['curl',3,10]]},
{name:'Piernas',items:[['squat',4,8],['rdl',3,10],['legpress',3,12],['legcurl',3,12],['calf',4,15]]},
{name:'Cuerpo completo',items:[['squat',3,8],['bench',3,8],['row',3,8],['ohp',3,10],['plank',3,45]]}
];

/* ============ Almacenamiento (capa separada: acá se enchufa Firebase/Google más adelante) ============ */
/* sube cada vez que se guardan datos (save, sync, importar, borrar): vacía lo calculado en memoria (récords, niveles) */
let DATA_V=0;
const Store=(()=>{
  const K='swole.v1';let mem=null;
  return{
    load(){try{const r=localStorage.getItem(K);if(r)return JSON.parse(r);}catch(e){}return mem?JSON.parse(mem):null;},
    save(d){DATA_V++;const s=JSON.stringify(d);mem=s;try{localStorage.setItem(K,s);this.full=0;}catch(e){if(!this.full){this.full=1;setTimeout(()=>{try{toast('No se pudo guardar en este celu (sin espacio). Bajá una copia desde Perfil para no perder nada.');}catch(x){}},60);}}},
    wipe(){DATA_V++;mem=null;try{localStorage.removeItem(K);localStorage.removeItem('swole.owner');}catch(e){}}
  };
})();
const defaults=()=>({v:1,profile:null,routines:[],customEx:[],plan:{},logs:[],weights:[],creatine:{},water:{},settings:{theme:'dark',rest:90,remind:{on:false,time:'09:00'},lastRemind:''},active:null,clock:{},del:{},ach:{},tests:[],goals:[],meas:[],meals:[],foods:[]});
function normalize(x){const d=defaults();const o=Object.assign(d,x||{});o.settings=Object.assign(d.settings,(x&&x.settings)||{});o.settings.remind=Object.assign({on:false,time:'09:00'},o.settings.remind||{});
  ['routines','customEx','logs','weights','tests','goals','meals','foods'].forEach(k=>{if(!Array.isArray(o[k]))o[k]=[];});
  ['plan','creatine','water','clock','del','ach'].forEach(k=>{if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))o[k]={};});
  /* los IDs van dentro de atributos HTML: si vienen de un archivo importado raro, los limpio
     (siempre igual, así las referencias entre rutinas, entrenos y ejercicios siguen coincidiendo) */
  const sid=x=>String(x==null?'':x).replace(/[^\w-]/g,'');
  /* una copia editada a mano, cortada o vieja puede traer entrenos, rutinas o comidas sin sus listas:
     se reparan (listas vacías, números en 0) en vez de borrarse, para que nada rompa las pantallas ni se pierda lo que sí sirve */
  const isO=v=>v&&typeof v==='object'&&!Array.isArray(v),arr=v=>Array.isArray(v)?v.filter(isO):[];
  ['customEx','routines','logs','tests','meals','foods','weights','goals'].forEach(k=>{o[k]=o[k].filter(isO);});
  o.customEx.forEach(e=>{e.id=sid(e.id);});
  o.routines.forEach(r=>{r.id=sid(r.id);r.items=arr(r.items);r.items.forEach(i=>{i.ex=sid(i.ex);});});
  o.logs.forEach(l=>{l.id=sid(l.id);if(l.routineId)l.routineId=sid(l.routineId);l.entries=arr(l.entries);l.entries.forEach(en=>{en.ex=sid(en.ex);en.sets=arr(en.sets);});l.prs=(Array.isArray(l.prs)?l.prs:[]).map(sid);});
  o.meals.forEach(m=>{['g','k','p','c','f'].forEach(f=>{if(m[f]!=null&&!isFinite(+m[f]))m[f]=0;});});
  /* seguridad: todo ID que termina en un atributo HTML pasa por sid(), y toda fecha tiene que ser AAAA-MM-DD
     (una copia preparada podía meter HTML en los IDs de objetivos, marcas, comidas o alimentos). La app siempre escribe
     IDs de letras/números y fechas AAAA-MM-DD, así que lo que ya tenés no cambia (verificado en la nube: 0 cambios). */
  const day=v=>{const m=typeof v==='string'&&v.match(/^\d{4}-\d{2}-\d{2}/);return m?m[0]:null;};
  const dated=a=>a.filter(i=>{const dd=day(i.date);if(!dd)return false;i.date=dd;return true;});
  ['logs','tests','meals','weights'].forEach(k=>{o[k]=dated(o[k]);});
  if(Array.isArray(o.meas))o.meas=dated(o.meas.filter(isO));
  o.tests.forEach(t=>{t.id=sid(t.id);if(t.ex!=null)t.ex=sid(t.ex);});
  o.goals.forEach(g=>{g.id=sid(g.id);if(g.ex!=null)g.ex=sid(g.ex);if(g.since!=null&&!day(g.since))delete g.since;});
  o.meals.forEach(m=>{m.id=sid(m.id);if(m.fid!=null)m.fid=sid(m.fid);if(m.m!=null)m.m=sid(m.m);});
  o.foods.forEach(f=>{f.id=sid(f.id);});
  /* el código de amigo solo puede ser como los que crea la app (6 letras/números en mayúscula) */
  const so=o.settings.social;if(so!=null&&!(isO(so)&&typeof so.code==='string'&&/^[A-Z0-9]{4,8}$/.test(so.code)))o.settings.social=null;
  Object.keys(o.plan).forEach(k=>{o.plan[k]=(Array.isArray(o.plan[k])?o.plan[k]:[]).map(sid);});
  if(o.active&&Array.isArray(o.active.entries))o.active.entries.forEach(en=>{en.ex=sid(en.ex);});
  /* antes había un solo deporte: pasa a la lista */
  if(o.profile){if(!Array.isArray(o.profile.sports))o.profile.sports=o.profile.sport?[o.profile.sport]:[];if(!o.profile.week||typeof o.profile.week!=='object')o.profile.week={};}
  return o;}
let db=normalize(Store.load());
if(!db.settings.look2){if(db.settings.theme==='auto')db.settings.theme='dark';db.settings.look2=1;}

/* ============ Sincronización: marcas de cambio ============
   Cada cosa sincronizable tiene una clave ("logs:abc", "creatine:2026-11-05", "profile"...).
   Al guardar se compara con la foto anterior: lo que cambió recibe la hora en db.clock y
   lo que desapareció queda anotado como borrado en db.del. Al unir dos dispositivos, por
   cada clave gana lo más reciente (y un borrado más nuevo le gana a la cosa). */
const SYNC_COLL={logs:'id',routines:'id',customEx:'id',weights:'date',tests:'id',goals:'id',meas:'date',meals:'id',foods:'id'};
const SYNC_MAP=['creatine','water','ach'];
/* perfil, calendario y ajustes se unen campo por campo (antes iban en bloque: cambiar el descanso en un celu pisaba el apodo cambiado en otro) */
const SYNC_FIELDS=['profile','plan','settings'];
/* cosas de ESTE dispositivo que no viajan a la nube: suscripción a avisos, publicaciones en cola, cachés */
const LOCAL_SET=['push','postQ','frCount','lastBackup'];
function syncKeys(d){
  const m={};
  for(const c in SYNC_COLL){const k=SYNC_COLL[c];(d[c]||[]).forEach(x=>{if(x&&x[k]!=null)m[c+':'+x[k]]=JSON.stringify(x);});}
  SYNC_MAP.forEach(c=>Object.keys(d[c]||{}).forEach(k=>{m[c+':'+k]=JSON.stringify(d[c][k]);}));
  SYNC_FIELDS.forEach(c=>{const o=d[c];if(!o||typeof o!=='object')return;Object.keys(o).forEach(f=>{if(o[f]===undefined||(c==='settings'&&LOCAL_SET.includes(f)))return;m[c+':'+f]=JSON.stringify(o[f]);});});
  return m;
}
let snap=syncKeys(db);
/* Hora de un cambio: la del celu, pero nunca menor ni igual a la última que ya vio (de él o de otro celu).
   Así un cambio hecho después de ver los datos del otro le gana siempre, aunque este reloj esté atrasado. */
function stampNow(){let t=Date.now();[db.clock,db.del].forEach(o=>{for(const k in o)if(+o[k]>=t)t=+o[k]+1;});return t;}
function stamp(){
  const cur=syncKeys(db);let ch=false,now=0;
  for(const k in cur)if(snap[k]!==cur[k]){now=now||stampNow();break;}
  if(!now)for(const k in snap)if(!(k in cur)){now=stampNow();break;}
  for(const k in cur)if(snap[k]!==cur[k]){db.clock[k]=now;delete db.del[k];ch=true;}
  for(const k in snap)if(!(k in cur)){db.del[k]=now;delete db.clock[k];ch=true;}
  snap=cur;return ch;
}
function save(){const ch=stamp();Store.save(db);if(ch){try{Sync.schedule();Social.schedule();}catch(e){}}}
/* al escribir en el entreno se junta y se guarda medio segundo después (antes se grababa toda la base por cada tecla y el teclado se trababa) */
let saveT=0;const saveSoon=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{saveT=0;save();},500);},saveNow=()=>{if(saveT){clearTimeout(saveT);saveT=0;save();}};
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')saveNow();});window.addEventListener('pagehide',saveNow);

/* ============ Fechas y utilidades ============ */
const pad=n=>String(n).padStart(2,'0');
const dkey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dkey(new Date());
const parseK=k=>{const a=k.split('-').map(Number);return new Date(a[0],a[1]-1,a[2]);};
const addDays=(k,n)=>{const d=parseK(k);d.setDate(d.getDate()+n);return dkey(d);};
const longDate=k=>{const d=parseK(k);return DIAS[d.getDay()]+' '+d.getDate()+' de '+MESES[d.getMonth()];};
const shortDate=ms=>{const d=new Date(ms);return d.getDate()+' '+MESES[d.getMonth()].slice(0,3);};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const num=(x,d)=>{const v=Math.round(x*Math.pow(10,d||0))/Math.pow(10,d||0);return String(v).replace('.',',');};
const nf=n=>Math.round(n).toLocaleString('es-UY');
const kgUp=x=>String(Math.ceil(x*2)/2).replace('.',',');
const fmtT=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return(h?h+':'+pad(m):m)+':'+pad(s%60);};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const allEx=()=>EX.concat(db.customEx);
const exById=id=>allEx().find(e=>e.id===id);
const groupOf=ex=>{const p=ex.p[0];for(const g in GROUPS)if(GROUPS[g].includes(p))return g;return 'Core';};

/* ============ Niveles ============
   Dos sistemas, misma escala de 19 niveles (Bronce 1 a Élite):
   - Pesas (ex.st): se estima tu 1RM y se compara con una tabla que depende de tu peso, edad y sexo.
   - Calistenia (ex.sk): cada habilidad es una progresión (flexión → diamante → arquero → un brazo...).
     La variante que dominás te da el piso del nivel y las repeticiones o segundos te suben dentro de ella.
     Así alguien que hace calistenia no queda comparado contra los kilos de un powerlifter. */
const hasRank=ex=>!!(ex&&(ex.st||ex.sk));
/* calibrado con tablas de referencia: Bronce 1 ≈ principiante (press banca 0,5× tu peso), Oro 1 ≈ intermedio (1×), Élite ≈ competitivo (2×) */
function ageF(a){if(a<=13)return .7;if(a<18)return .7+(a-13)*.05;if(a<23)return .95+(a-18)*.01;if(a<=39)return 1;return Math.max(.55,1-(a-39)*.012);}
function sexF(s,reg){const u=reg==='u';if(s==='m')return 1;if(s==='f')return u?.6:.72;return u?.8:.86;}
function e1(ex,kg,reps){
  if(ex.time)return Math.max(0,+reps||0); /* tiempo: el récord son los segundos */
  if(ex.sk){const bw=db.profile&&db.profile.weight||75;return Math.max(0,(+reps||0)*(1+Math.max(0,+kg||0)/bw));} /* calistenia: reps, y el lastre suma */
  const bw=db.profile?db.profile.weight:70;
  const load=(ex.bw||0)*bw+(+kg||0);
  const r=Math.min(+reps||0,ex.bw?45:15);
  return r>0?load*(1+r/30):0;
}
/* La fuerza no crece igual que el peso corporal: crece aprox. con el peso elevado a 2/3 (escala alométrica,
   la idea detrás de las fórmulas de las federaciones). Las tablas están pensadas para 75 kg: a 60 kg te piden
   un poco más por kilo de cuerpo y a 95 kg un poco menos, así todos se miden parejo.
   En ejercicios con el propio cuerpo (dominadas, fondos) la parte del cuerpo sigue siendo lineal: la movés entera. */
const allo=w=>75*Math.pow(w/75,2/3);
const ANCH={bench:[.70,.93,1.22,1.53,1.87],squat:[.94,1.26,1.64,2.09,2.56],deadlift:[1.11,1.48,1.92,2.42,2.96],ohp:[.41,.57,.77,1.0,1.25],
  curl:[.27,.41,.57,.78,1.0],row:[.60,.82,1.09,1.41,1.74],
  /* dominadas 1/7/13/22/34 reps y fondos 2/9/20/33/48 reps (StrengthLevel), pasadas a carga total con Epley */
  pullup:[1.03,1.23,1.43,1.73,2.13],dips:[1.07,1.30,1.67,2.10,2.60]};
/* Repeticiones con tu peso (hombre de 75 kg, 18 a 39 años) en los percentiles 5/20/50/80/95 de gente que entrena.
   Fuente: tablas de StrengthLevel (flexiones 5/19/39/62, sentadilla sin peso 5/23/55/93/137); el resto, proporcional. */
const REPS={pushup:[5,19,39,62,90],kneepush:[10,28,50,75,105],diamond:[2,10,24,42,64],benchdip:[8,20,38,58,85],
  austrow:[3,10,20,32,48],airsquat:[5,23,55,93,137],pistol:[1,3,8,15,25],shrimp:[1,3,8,15,24]};
/* las repeticiones bajan más que la fuerza con el peso (movés todo tu cuerpo), con la edad y entre mujeres en el tren superior */
function repAnch(ex){
  const p=db.profile||{},W=+p.weight||75,lo=ex.reg==='l',sx=p.sex==='f'?(lo?.8:.5):p.sex==='m'?1:(lo?.9:.75);
  const k=sx*ageF(+p.age||25)*clamp(Math.pow(75/W,lo?.33:.6),.6,1.3);
  return REPS[ex.id].map(x=>Math.max(1,x*k));
}
function repPct(ex,r){
  const A=repAnch(ex);
  if(r<A[0])return Math.max(0,5*r/A[0]);
  for(let i=1;i<5;i++)if(r<=A[i])return LV_P[i-1]+(LV_P[i]-LV_P[i-1])*(r-A[i-1])/(A[i]-A[i-1]);
  return Math.min(99.9,95+4.9*Math.min(1,(r-A[4])/(A[4]*.3)));
}
const LV_T=[[0,2],[3,25],[6,50],[9,68],[12,80],[15,92],[16,95],[17,98],[18,99.5]],LV_P=[5,20,50,80,95];
const pGen=p=>p+8*Math.sin(Math.PI*p/100);
function pToL(p){if(p<=LV_T[0][1])return p/LV_T[0][1]-1;for(let i=1;i<LV_T.length;i++)if(p<=LV_T[i][1]){const a=LV_T[i-1],b=LV_T[i];return a[0]+(b[0]-a[0])*(p-a[1])/(b[1]-a[1]);}return 18;}
function LToP(L){if(L<=0)return LV_T[0][1];for(let i=1;i<LV_T.length;i++)if(L<=LV_T[i][0]){const a=LV_T[i-1],b=LV_T[i];return a[1]+(b[1]-a[1])*(L-a[0])/(b[0]-a[0]);}return 99.5;}
function pUngen(q){let lo=0,hi=100;for(let k=0;k<30;k++){const m=(lo+hi)/2;if(pGen(m)<q)lo=m;else hi=m;}return (lo+hi)/2;}
/* las 5 marcas de referencia para tu peso, edad y sexo */
function anchors(ex){
  const p=db.profile,b=ex.bw||0,sf=sexF(p.sex,ex.reg)*ageF(p.age),W=p.weight,Wa=allo(W),f=x=>b*W+(x-b)*sf*Wa;
  const hiR=ex.st[1]*.92,r=ANCH[ex.id]||[.37,.50,.65,.82,1].map(k=>b?b+(hiR-b)*k:hiR*k);
  return r.map(f);
}
/* percentil real (entre quienes entrenan) de una marca */
function pctOf(ex,e){
  const A=anchors(ex);
  if(e<A[0])return Math.max(0,5*Math.pow(e/A[0],2));
  for(let i=1;i<5;i++)if(e<=A[i])return LV_P[i-1]+(LV_P[i]-LV_P[i-1])*(e-A[i-1])/(A[i]-A[i-1]);
  return Math.min(99.9,95+4.9*Math.min(1,(e-A[4])/(A[4]*.25)));
}
/* la marca que hace falta para un percentil */
function eOfPct(ex,p){
  const A=anchors(ex);
  if(p<=5)return A[0]*Math.sqrt(Math.max(0,p)/5);
  for(let i=1;i<5;i++)if(p<=LV_P[i])return A[i-1]+(A[i]-A[i-1])*(p-LV_P[i-1])/(LV_P[i]-LV_P[i-1]);
  return A[4]*(1+.25*Math.min(1,(p-95)/4.9));
}
function thr(ex,L){return eOfPct(ex,pUngen(LToP(L)));}
function stdFor(ex){return{lo:thr(ex,0),hi:thr(ex,18)};}
function stdForOld(ex){
  const p=db.profile,b=ex.bw||0,sf=sexF(p.sex,ex.reg)*ageF(p.age),W=p.weight,Wa=allo(W);
  const f=x=>b*W+(x-b)*sf*Wa;
  return{lo:f(b?ex.st[0]:ex.st[0]*1.6),hi:f(b?ex.st[1]:ex.st[1]*.95)};
}
/* nivel con decimales (puede ser negativo si todavía no llegás a Bronce 1) */
function levelVal(ex,e){
  if(ex.sk){const s=ex.sk;if(!(e>=1))return -1;if(ex.time&&e<3)return Math.max(0,s.b-1+e/3*.99);
    const top=s.b+s.g,x=e/s.t;let v=x<=1?s.b+s.g*x:top+(18-top)*(1-Math.exp(-1.1*(x-1)));
    if(REPS[ex.id]&&!ex.time)v=Math.max(v,pToL(pGen(repPct(ex,e))));
    return Math.min(18,v);}
  return Math.min(18,pToL(pGen(pctOf(ex,e))));
}
function levelIdx(ex,e){
  if(!hasRank(ex)||!db.profile)return null;
  const v=levelVal(ex,e);return v<0?-1:Math.min(18,Math.floor(v));
}

function lvlName(L){if(L==null||L<0)return 'Sin rango';L=Math.floor(L);if(L>=18)return 'Élite';return TIERS[Math.floor(L/3)]+' '+['I','II','III'][L%3];}
function lvlInfo(ex,e){
  const v=levelVal(ex,e),L=v<0?-1:Math.min(18,Math.floor(v));
  if(L<0){if(ex.sk)return{L,pct:0,next:0};const s=stdFor(ex);return{L,pct:e/s.lo,next:0};}
  if(L>=18)return{L,pct:1,next:null};
  return{L,pct:v-L,next:L+1};
}
const unitOf=ex=>ex.time?' s':' reps';
const skFam=f=>EX.filter(e=>e.sk&&e.sk.f===f).sort((a,b)=>a.sk.b-b.sk.b);
/* qué tenés que hacer para llegar al nivel L */
function needTxt(ex,L){
  if(ex.sk){
    const s=ex.sk;
    if(L<=s.b)return '1'+unitOf(ex);
    for(let e=1;e<=Math.max(400,s.t*8);e++)if(levelVal(ex,e)>=L)return e+unitOf(ex);
    const nx=skFam(s.f).find(e=>e.sk.b+e.sk.g>=L&&e.sk.b>s.b);
    return nx?'pasá a '+nx.n:'nivel máximo';
  }
  return equiv(ex,thr(ex,L));
}
function bestTxt(ex,b){return ex.sk||ex.time?'mejor: '+Math.round(b.e)+unitOf(ex):'1RM estimado de '+num(b.e,1)+' kg';}
function equiv(ex,e){
  const bw=db.profile.weight;
  if(ex.bw){
    const base=ex.bw*bw,n=Math.ceil(30*(e/base-1));
    if(n>=1&&n<=25)return n+' repeticiones con tu peso';
    return kgUp(e/(1+5/30)-base)+' kg extra × 5 repeticiones';
  }
  return kgUp(e/(1+5/30))+' kg'+(ex.ph?' por mancuerna':'')+' × 5 repeticiones';
}
/* las series de calentamiento (s.w) no cuentan para niveles ni récords */
/* una marca cargada a mano cuenta como una serie suelta, pero no aparece en el calendario */
/* Lo que sale de todo el historial se calcula una vez y queda en memoria hasta que cambian los datos
   (antes Inicio recorría el historial entero ~900 veces por dibujo y cada toque de serie se trababa).
   Se vacía si: se guardó algo (DATA_V), cambió la lista de entrenos o marcas (otra lista o otro largo), o cambió tu perfil o tu peso. */
let MEMO=null;
function dataMemo(){
  const p=db.profile,k=DATA_V+'|'+db.logs.length+'|'+(db.tests||[]).length+'|'+(p?p.weight:'')+'|'+(db.customEx||[]).length;
  if(!MEMO||MEMO.k!==k||MEMO.l!==db.logs||MEMO.t!==db.tests||MEMO.p!==p||MEMO.c!==db.customEx)MEMO={k,l:db.logs,t:db.tests,p,c:db.customEx,all:null,best:null,last:null};
  return MEMO;
}
function allSess(){const m=dataMemo();
  if(!m.all)m.all=db.logs.concat((db.tests||[]).map(t=>({id:t.id,date:t.date,test:1,entries:[{ex:t.ex,sets:[{kg:t.kg,reps:t.reps}]}]})));
  return m.all.slice();}
/* el mejor 1RM estimado de cada ejercicio, todos en una sola pasada */
function bestE1(id){
  const m=dataMemo();
  if(!m.best){const B=new Map(),X=new Map();
    allSess().forEach(l=>l.entries.forEach(en=>{
      let ex=X.get(en.ex);if(ex===undefined){ex=exById(en.ex)||null;X.set(en.ex,ex);}if(!ex)return;
      let best=B.get(en.ex)||null;
      en.sets.forEach(s=>{if(s.w)return;const e=e1(ex,s.kg,s.reps);if(e>0&&(!best||e>best.e))best={e,kg:s.kg,reps:s.reps,date:l.date};});
      if(best)B.set(en.ex,best);
    }));
    m.best=B;}
  if(!exById(id))return null;
  const b=m.best.get(id);return b?Object.assign({},b):null;
}
/* las series de la última vez que hiciste cada ejercicio: también en memoria (el entreno en vivo lo pide en cada toque) */
function lastSets(id){
  const m=dataMemo();if(!m.last)m.last=new Map();
  if(m.last.has(id))return m.last.get(id);
  const ls=db.logs.filter(l=>l.entries.some(en=>en.ex===id)).sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
  const r=ls.length?ls[ls.length-1].entries.find(en=>en.ex===id).sets:null;
  m.last.set(id,r);return r;
}
/* ejercicios que elegiste no contar para tus niveles */
const noRank=id=>(db.settings.noRank||[]).includes(id);
function rankedList(){
  const out=[];
  if(!db.profile)return out;
  allEx().forEach(ex=>{
    if(!hasRank(ex)||noRank(ex.id))return;
    const b=bestE1(ex.id);if(!b)return;
    out.push({ex,b,info:lvlInfo(ex,b.e)});
  });
  return out.sort((a,b)=>(b.info.L-a.info.L)||(b.info.pct-a.info.pct));
}
/* Rango general: el mejor ejercicio de cada grupo muscular, promediado.
   Así probar un ejercicio nuevo nunca te baja el rango; entrenar un grupo nuevo sí cuenta. */
/* Rango de cada grupo muscular: promedio de sus (hasta) 3 mejores ejercicios.
   Así cuenta más de un ejercicio, pero probar uno nuevo y flojo no te hunde el grupo. */
/* v61: el ejercicio cuenta en cada grupo donde es principal (la diamante suma a pecho y a brazos).
   Tu mejor ejercicio del grupo manda; los otros (hasta 2, si no están 3 niveles abajo) restan como mucho medio nivel.
   Antes era un promedio parejo y un ejercicio flojo o recién empezado te hundía el grupo. */
/* mientras dura un mismo render(), niveles por grupo y rango general se calculan una sola vez */
let RC=null;
function groupLevels(){
  if(RC&&RC.gl)return RC.gl;
  const out=groupLevels0();if(RC)RC.gl=out;return out;
}
function groupLevels0(){
  const by={};
  rankedList().filter(x=>x.info.L>=0).forEach(x=>{const v=x.info.L+clamp(x.info.pct,0,.999),gs=new Set(x.ex.p.map(k=>Object.keys(GROUPS).find(g=>GROUPS[g].includes(k))).filter(Boolean));
    if(!gs.size)gs.add(groupOf(x.ex));gs.forEach(g=>(by[g]=by[g]||[]).push({ex:x.ex,v}));});
  const out={};
  Object.keys(GROUPS).forEach(g=>{const l=(by[g]||[]).sort((a,b)=>b.v-a.v);if(!l.length){out[g]=null;return;}
    const best=l[0].v,rest=l.slice(1,3).filter(x=>best-x.v<3),gap=rest.length?rest.reduce((s,x)=>s+best-x.v,0)/rest.length:0;
    out[g]={v:Math.max(0,best-Math.min(.5,gap*.15)),n:l.length,used:[l[0].ex].concat(rest.map(x=>x.ex))};});
  return out;
}
/* peso de cada grupo en el rango general: piernas y espalda pesan más que brazos o core */
const GROUP_W={Pecho:1,Espalda:1.2,Hombros:.9,Brazos:.7,Piernas:1.4,Core:.6};
const ZONES={'Tren superior':['Pecho','Espalda','Hombros','Brazos'],'Tren inferior':['Piernas'],Core:['Core']};
function zoneLevels(){const gl=groupLevels(),out={};Object.keys(ZONES).forEach(z=>{const l=ZONES[z].filter(g=>gl[g]);out[z]=l.length?l.reduce((s,g)=>s+gl[g].v*GROUP_W[g],0)/l.reduce((s,g)=>s+GROUP_W[g],0):null;});return out;}
/* Rango general: promedio de los grupos que tienen datos */
function overall(){
  if(RC&&'ov' in RC)return RC.ov;
  const r=overall0();if(RC)RC.ov=r;return r;
}
function overall0(){
  const gl=groupLevels(),ks=Object.keys(gl).filter(g=>gl[g]),vals=ks.map(g=>gl[g].v);
  if(!vals.length)return null;
  const avg=ks.reduce((s,g)=>s+gl[g].v*GROUP_W[g],0)/ks.reduce((s,g)=>s+GROUP_W[g],0);
  const L=Math.min(18,Math.floor(avg));
  return{L,pct:L>=18?1:avg-L,n:vals.length};
}
/* nivel de cada músculo: el mejor ejercicio donde ese músculo es principal */
function muscleLevels(){
  const m={};
  const sec={};
  rankedList().forEach(x=>{if(x.info.L<0)return;const v=x.info.L+clamp(x.info.pct,0,.999);x.ex.p.forEach(k=>{if(m[k]==null||v>m[k])m[k]=v;});x.ex.s.forEach(k=>{if(sec[k]==null||v>sec[k])sec[k]=v;});});
  /* un músculo que solo trabajó como secundario muestra un rango estimado más bajo, en vez de quedar vacío */
  Object.keys(sec).forEach(k=>{if(m[k]==null)m[k]=Math.max(0,sec[k]-2);});
  return m;
}
function e1Points(id){
  const ex=exById(id),map={};
  allSess().forEach(l=>l.entries.forEach(en=>{
    if(en.ex!==id)return;
    en.sets.forEach(s=>{if(s.w)return;const e=e1(ex,s.kg,s.reps);if(e>(map[l.date]||0))map[l.date]=e;});
  }));
  return Object.keys(map).sort().map(d=>({t:parseK(d).getTime(),y:map[d]}));
}

/* ============ Nutrición ============ */
function nutri(p){
  const bmr=10*p.weight+6.25*p.height-5*p.age+(p.sex==='m'?5:p.sex==='f'?-161:-78);
  const af=actFactor(p),tdee=bmr*af.f;
  const adj={bulk:.12,recomp:0,cut:p.age<18?-.08:-.18}[p.goal];
  let kcal=tdee*(1+adj);
  const ad=adaptAdj(p);if(ad)kcal+=ad.kcal;
  if(p.goal==='cut')kcal=Math.max(kcal,bmr);
  const prot=p.weight*{bulk:1.8,recomp:2.0,cut:2.2}[p.goal];
  let fat=p.weight*.9;
  let carbs=(kcal-prot*4-fat*9)/4;
  if(carbs<0){fat=p.weight*.7;carbs=Math.max(0,(kcal-prot*4-fat*9)/4);}
  return{bmr,tdee,af,ad,adjPct:adj,kcal:Math.round(kcal/10)*10,prot:Math.round(prot),fat:Math.round(fat),carbs:Math.round(carbs)};
}

/* ============ Comidas: registro del día ============
   db.meals = [{id,date,m:'des'|'alm'|'mer'|'cen'|'col',n,g,k,p,c,f,fid}] (k,p,c,f = totales de esa entrada)
   db.foods = alimentos propios [{id,n,k,p,c,f,u:[{n,g}]}] (valores cada 100 g)
   Valores aproximados cada 100 g (tablas USDA / ARGENFOODS). Es una guía, no un análisis de laboratorio. */
const FOOD_RAW=[
 /* proteínas */
 ['pech','Pechuga de pollo (cocida)',165,31,0,3.6,'Porción:150'],
 ['muslo','Muslo de pollo sin piel (cocido)',209,26,0,10.9,'Unidad:120'],
 ['bife','Carne vacuna magra (bife, nalga, cuadril)',220,30,0,10,'Bife:200'],
 ['picada','Carne picada común (cocida)',250,26,0,17,'Porción:150'],
 ['asado','Asado de tira',330,24,0,26,'Porción:250'],
 ['vacio','Vacío',290,26,0,20,'Porción:250'],
 ['bondiola','Cerdo (bondiola o lomo, cocido)',240,27,0,14,'Porción:180'],
 ['milc','Milanesa de carne (frita)',260,20,12,15,'Unidad:150'],
 ['milp','Milanesa de pollo (al horno)',210,24,11,8,'Unidad:150'],
 ['milnapo','Milanesa napolitana',250,19,10,15,'Unidad:220'],
 ['hamb','Hamburguesa casera (sin pan)',250,24,0,17,'Unidad:110'],
 ['chori','Chorizo',330,17,2,28,'Unidad:100'],
 ['jamon','Jamón cocido',120,18,2,4,'Feta:20'],
 ['atun','Atún al natural',116,26,0,1,'Lata:120'],
 ['salmon','Salmón (cocido)',206,22,0,12,'Porción:150'],
 ['merluza','Merluza (cocida)',90,19,0,1.3,'Filet:150'],
 ['huevo','Huevo',143,12.6,0.7,9.5,'Unidad:50'],
 ['clara','Clara de huevo',52,11,0.7,0.2,'Unidad:33'],
 ['whey','Proteína en polvo (whey)',400,78,8,6,'Scoop:30'],
 /* lácteos */
 ['leche','Leche entera',61,3.2,4.8,3.3,'Vaso:250'],
 ['lechedes','Leche descremada',35,3.4,5,0.1,'Vaso:250'],
 ['yogur','Yogur natural',61,3.5,4.7,3.3,'Pote:190'],
 ['yogurf','Yogur con fruta o bebible',90,3,14,2.5,'Pote:190'],
 ['griego','Yogur griego natural',97,9,4,5,'Pote:170'],
 ['cremoso','Queso cremoso o de máquina',300,20,0.5,25,'Porción:30'],
 ['muzza','Muzzarella',280,22,2,20,'Porción:30'],
 ['rallado','Queso rallado',400,36,3,28,'Cucharada:10'],
 ['untable','Queso untable',150,11,4,10,'Cucharada:15'],
 ['ddl','Dulce de leche',315,7,55,7.5,'Cucharada:20'],
 ['manteca','Manteca',717,0.9,0.1,81,'Cucharadita:5'],
 /* harinas, cereales y legumbres */
 ['arroz','Arroz blanco (cocido)',130,2.7,28,0.3,'Taza:160|Plato:250'],
 ['arrozi','Arroz integral (cocido)',123,2.7,26,1,'Taza:160|Plato:250'],
 ['fideos','Fideos (cocidos)',158,5.8,31,0.9,'Plato:250'],
 ['noquis','Ñoquis',160,4,33,1,'Plato:250'],
 ['papa','Papa hervida',87,1.9,20,0.1,'Unidad:170'],
 ['fritas','Papas fritas',312,3.4,41,15,'Porción:120'],
 ['pure','Puré de papa',100,2,15,4,'Porción:200'],
 ['batata','Batata (asada o hervida)',90,2,21,0.2,'Unidad:180'],
 ['pan','Pan francés',270,9,55,1.5,'Pancito:50|Rebanada:30'],
 ['lactal','Pan lactal',265,8,49,3.5,'Rebanada:25'],
 ['panint','Pan integral',250,10,43,4,'Rebanada:28'],
 ['arrozt','Galletas de arroz',387,8,81,3,'Unidad:9'],
 ['agua','Galletitas de agua',420,10,70,10,'Unidad:6'],
 ['avena','Avena',389,17,66,7,'Cucharada:10|Taza:80'],
 ['granola','Granola',450,10,64,17,'Taza:60'],
 ['copos','Copos de maíz',375,7,84,0.9,'Taza:30'],
 ['polenta','Polenta (cocida)',70,1.6,15,0.3,'Plato:250'],
 ['choclo','Choclo',96,3.4,21,1.5,'Unidad:100'],
 ['lentejas','Lentejas (cocidas)',116,9,20,0.4,'Plato:200'],
 ['garbanzo','Garbanzos (cocidos)',164,8.9,27,2.6,'Taza:160'],
 ['porotos','Porotos (cocidos)',132,8.9,24,0.5,'Taza:170'],
 ['wrap','Tortilla de trigo (wrap)',310,8,52,8,'Unidad:40'],
 /* comidas armadas */
 ['empa','Empanada de carne (al horno)',290,11,28,15,'Unidad:90'],
 ['pizza','Pizza de muzzarella',270,11,32,11,'Porción:120'],
 ['tarta','Tarta de verdura',230,7,20,13,'Porción:150'],
 ['tortilla','Tortilla de papa',170,6,14,10,'Porción:200'],
 ['guiso','Guiso de lentejas',120,7,15,3.5,'Plato:300'],
 ['sandjq','Sándwich de jamón y queso',260,14,25,12,'Unidad:150'],
 ['hambc','Hamburguesa completa (con pan)',250,13,24,11,'Unidad:250'],
 ['pancho','Pancho',270,10,25,15,'Unidad:120'],
 ['sushi','Sushi',150,5,28,2,'Pieza:30'],
 ['fideosalsa','Fideos con salsa',140,5,24,3,'Plato:350'],
 ['ensp','Ensalada con pollo',110,12,5,5,'Plato:300'],
 /* frutas */
 ['banana','Banana',89,1.1,23,0.3,'Unidad:120'],
 ['manzana','Manzana',52,0.3,14,0.2,'Unidad:180'],
 ['naranja','Naranja',47,0.9,12,0.1,'Unidad:180'],
 ['mandarina','Mandarina',53,0.8,13,0.3,'Unidad:90'],
 ['frutilla','Frutillas',32,0.7,7.7,0.3,'Taza:150'],
 ['uva','Uvas',69,0.7,18,0.2,'Taza:150'],
 ['pera','Pera',57,0.4,15,0.1,'Unidad:180'],
 ['durazno','Durazno',39,0.9,10,0.3,'Unidad:150'],
 ['kiwi','Kiwi',61,1.1,15,0.5,'Unidad:75'],
 ['palta','Palta',160,2,8.5,15,'Media:70'],
 /* verduras */
 ['ensalada','Ensalada de lechuga y tomate',18,1,3.5,0.2,'Plato:150'],
 ['tomate','Tomate',18,0.9,3.9,0.2,'Unidad:120'],
 ['zanahoria','Zanahoria',41,0.9,10,0.2,'Unidad:70'],
 ['brocoli','Brócoli',35,2.4,7,0.4,'Taza:90'],
 ['zapallo','Zapallo o calabaza',26,1,6.5,0.1,'Porción:150'],
 ['espinaca','Espinaca (cocida)',23,3,3.8,0.3,'Porción:100'],
 ['salteado','Verduras salteadas',60,2,8,2.5,'Porción:150'],
 /* grasas, frutos secos y salsas */
 ['aceite','Aceite (oliva o girasol)',884,0,0,100,'Cucharada:13|Cucharadita:5'],
 ['mani','Maní',567,26,16,49,'Puñado:30'],
 ['pmani','Mantequilla de maní',588,25,20,50,'Cucharada:16'],
 ['nuez','Nueces',654,15,14,65,'Puñado:30'],
 ['almendra','Almendras',579,21,22,50,'Puñado:30'],
 ['mayo','Mayonesa',680,1,1,75,'Cucharada:15'],
 ['ketchup','Ketchup',112,1.7,26,0.1,'Cucharada:15'],
 /* dulces */
 ['medialuna','Medialuna o factura',410,7,46,22,'Unidad:40'],
 ['alfajor','Alfajor',450,6,65,19,'Unidad:50'],
 ['galled','Galletitas dulces',470,6,70,18,'Unidad:10'],
 ['choco','Chocolate con leche',535,7.6,59,30,'Cuadradito:8'],
 ['helado','Helado',207,3.5,24,11,'Bocha:70'],
 ['miel','Miel',304,0.3,82,0,'Cucharada:20'],
 ['azucar','Azúcar',400,0,100,0,'Cucharadita:5'],
 ['mermelada','Mermelada',250,0.4,62,0.1,'Cucharada:20'],
 ['barrac','Barra de cereal',400,6,70,11,'Unidad:25'],
 ['barrap','Barra de proteína',360,30,35,12,'Unidad:50'],
 /* bebidas (100 ml ≈ 100 g) */
 ['gaseosa','Gaseosa común',42,0,10.6,0,'Vaso:250|Lata:354'],
 ['zero','Gaseosa sin azúcar',0,0,0,0,'Vaso:250|Lata:354'],
 ['jugo','Jugo de naranja',45,0.7,10,0.2,'Vaso:250'],
 ['cafel','Café con leche',40,2,3.5,1.8,'Taza:250'],
 ['isot','Bebida deportiva',26,0,6.4,0,'Botella:500'],
 ['cerveza','Cerveza',43,0.5,3.6,0,'Vaso:250|Lata:473'],
 ['vino','Vino',85,0.1,2.6,0,'Copa:150']
];
const FOODS=FOOD_RAW.map(r=>({id:r[0],n:r[1],k:r[2],p:r[3],c:r[4],f:r[5],u:r[6]?r[6].split('|').map(x=>{const[a,b]=x.split(':');return{n:a,g:+b};}):[]}));
const MEALS=[['des','Desayuno'],['alm','Almuerzo'],['mer','Merienda'],['cen','Cena'],['col','Colaciones']];
const MEAL_N=Object.fromEntries(MEALS);
const mealNow=()=>{const h=new Date().getHours();return h<11?'des':h<16?'alm':h<20?'mer':'cen';};
const allFoods=()=>(db.foods||[]).map(f=>Object.assign({mine:1},f)).concat(FOODS);
const foodById=id=>allFoods().find(f=>f.id===id);
const fnorm=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
function foodSearch(q){
  const w=fnorm(q).split(/\s+/).filter(Boolean);
  if(!w.length)return allFoods();
  return allFoods().filter(f=>{const n=fnorm(f.n);return w.every(x=>n.includes(x));}).sort((a,b)=>fnorm(a.n).indexOf(w[0])-fnorm(b.n).indexOf(w[0]));
}
/* lo que más comés (últimos 60 días) */
function foodFreq(){
  const from=addDays(today(),-60),cnt={};
  (db.meals||[]).forEach(e=>{if(e.fid&&e.date>=from)cnt[e.fid]=(cnt[e.fid]||0)+1;});
  return Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]).map(foodById).filter(Boolean).slice(0,8);
}
const mealsOn=dk=>(db.meals||[]).filter(e=>e.date===dk);
function mealTot(list){return list.reduce((s,e)=>({k:s.k+(+e.k||0),p:s.p+(+e.p||0),c:s.c+(+e.c||0),f:s.f+(+e.f||0)}),{k:0,p:0,c:0,f:0});}
const r1=x=>Math.round(x*10)/10;
const plural=w=>/ón$/.test(w)?w.slice(0,-2)+"ones":/[aeiou]$/.test(w)?w+"s":w+"es";
/* gramos según la unidad elegida (-1 = gramos) */
function foodGrams(d){const f=foodById(d.sel);if(!f)return 0;const q=Math.max(0,+String(d.qty).replace(',','.')||0);return d.unit<0||!f.u[d.unit]?q:q*f.u[d.unit].g;}
function foodCalc(f,g){const x=g/100;return{k:Math.round(f.k*x),p:r1(f.p*x),c:r1(f.c*x),f:r1(f.f*x)};}
const unitTxt=(g,u)=>u?u:Math.round(g)+' g';
function foodRow(f,act){
  return '<button class="fd-row" data-a="'+(act||'foodPick')+'" data-v="'+f.id+'"><span class="grow"><b>'+esc(f.n)+'</b><span class="mut sm-t">'+(f.u[0]?'1 '+esc(f.u[0].n.toLowerCase())+' ('+f.u[0].g+' g): '+Math.round(f.k*f.u[0].g/100)+' kcal':Math.round(f.k)+' kcal cada 100 g')+(f.mine?' · tuyo':'')+'</span></span>'+ic('plus',18)+'</button>';
}
function foodList(d){
  const q=String(d.q||'').trim();
  if(!q){const fr=foodFreq();
    return (fr.length?'<p class="fd-sec">Lo que más comés</p>'+fr.map(f=>foodRow(f)).join(''):'')+foodAlt()+'<p class="fd-sec">Todos</p>'+allFoods().slice().sort((a,b)=>a.n.localeCompare(b.n,'es')).map(f=>foodRow(f)).join('');}
  const l=foodSearch(q);
  return (l.length?l.slice(0,40).map(f=>foodRow(f)).join(''):'<p class="mut tc" style="padding:14px 8px 0">No encontré "'+esc(q)+'".</p>')+foodAlt();
}
function foodPrev(d){
  const f=foodById(d.sel);if(!f)return '';
  const g=foodGrams(d),v=foodCalc(f,g);
  return '<div class="fd-prev"><div><b>'+v.k+'</b><span>kcal</span></div><div class="pro"><b>'+num(v.p,1)+'</b><span>proteína</span></div><div><b>'+num(v.c,1)+'</b><span>carbos</span></div><div><b>'+num(v.f,1)+'</b><span>grasas</span></div></div><p class="mut sm-t tc" style="margin-top:6px">'+Math.round(g)+' g en total</p>';
}
const mealChips=d=>'<div class="chips fd-meals">'+MEALS.map(m=>'<button class="chip sm '+(d.m===m[0]?'on':'')+'" data-a="foodMeal" data-v="'+m[0]+'">'+m[1]+'</button>').join('')+'</div>';
function foodHTML(d){
  if(d.step==='amt'){
    const f=foodById(d.sel);if(!f)return '<p>No encontré ese alimento.</p>';
    const us=f.u.map((u,i)=>[i,u.n]).concat([[-1,'Gramos']]);
    return '<div class="fd-head"><b>'+esc(f.n)+'</b><span class="mut sm-t">'+Math.round(f.k)+' kcal · '+num(f.p,1)+' g de proteína cada 100 g</span></div>'+
     '<div class="field"><span>¿Cuánto?</span><div class="fd-amt"><button class="ib" data-a="foodQty" data-v="-1" aria-label="Menos">'+ic('minus',18)+'</button><input class="num" type="text" inputmode="decimal" value="'+esc(d.qty)+'" data-i="fa" aria-label="Cantidad"><button class="ib" data-a="foodQty" data-v="1" aria-label="Más">'+ic('plus',18)+'</button></div>'+
     '<div class="chips" style="margin-top:8px">'+us.map(u=>'<button class="chip sm '+(d.unit===u[0]?'on':'')+'" data-a="foodUnit" data-v="'+u[0]+'">'+esc(u[1])+(u[0]>=0?' ('+f.u[u[0]].g+' g)':'')+'</button>').join('')+'</div></div>'+
     '<div id="foodPrev">'+foodPrev(d)+'</div>'+
     '<div class="field"><span>Comida</span>'+mealChips(d)+'</div>'+
     '<button class="btn pri wide" data-a="foodSave">'+(d.edit?'Guardar cambios':'Agregar')+'</button>'+
     (d.edit?'<button class="btn bad line wide" data-a="foodDel">Borrar</button>':'<button class="btn line wide" data-a="foodStep" data-v="list">Elegir otro</button>');
  }
  if(d.step==='photo')return photoHTML(d);
  if(d.step==='bar')return barHTML(d);
  if(d.step==='new'){const n=d.nf;
    const fld=(f,l,ph)=>'<label class="field">'+l+'<input type="text" inputmode="decimal" value="'+esc(n[f]||'')+'" data-i="fn" data-f="'+f+'" placeholder="'+ph+'"></label>';
    return '<p class="mut sm-t">Copiá los valores de la etiqueta del paquete. Queda guardado para la próxima.</p>'+
     '<label class="field">Nombre<input type="text" maxlength="40" value="'+esc(n.n||'')+'" data-i="fn" data-f="n" placeholder="Ej: Barrita de la marca X"></label>'+
     '<div class="field"><span>Los valores son</span><div class="seg"><button class="'+(n.per==='100'?'on':'')+'" data-a="foodPer" data-v="100">Cada 100 g</button><button class="'+(n.per==='por'?'on':'')+'" data-a="foodPer" data-v="por">Por porción</button></div></div>'+
     (n.per==='por'?fld('pg','La porción pesa (g)','Ej: 30'):'')+
     '<div class="g2">'+fld('k','Calorías (kcal)','0')+fld('p','Proteína (g)','0')+fld('c','Carbohidratos (g)','0')+fld('f','Grasas (g)','0')+'</div>'+
     '<button class="btn pri wide" data-a="foodNewSave">Guardar alimento</button><button class="btn line wide" data-a="foodStep" data-v="list">Volver</button>';
  }
  if(d.step==='quick'){const k=d.qk;
    return '<p class="mut sm-t">Si no sabés qué tenía, poné aunque sea las calorías aproximadas.</p>'+
     '<label class="field">¿Qué comiste? (opcional)<input type="text" maxlength="40" value="'+esc(k.n||'')+'" data-i="fk" data-f="n" placeholder="Ej: Almuerzo afuera"></label>'+
     '<div class="g2"><label class="field">Calorías (kcal)<input type="text" inputmode="numeric" value="'+esc(k.k||'')+'" data-i="fk" data-f="k" placeholder="Ej: 700"></label><label class="field">Proteína (g)<input type="text" inputmode="decimal" value="'+esc(k.p||'')+'" data-i="fk" data-f="p" placeholder="Opcional"></label></div>'+
     '<div class="field"><span>Comida</span>'+mealChips(d)+'</div>'+
     '<button class="btn pri wide" data-a="foodQuickSave">'+(d.edit?'Guardar cambios':'Agregar')+'</button>'+
     (d.edit?'<button class="btn bad line wide" data-a="foodDel">Borrar</button>':'<button class="btn line wide" data-a="foodStep" data-v="list">Volver</button>');
  }
  return '<div class="ph-cta">'+photoBtn('Foto del plato')+'<button class="btn wide" data-a="barOpen">'+ic('barcode',18)+' Escanear código de barras</button>'+'<p class="mut sm-t tc">Desde arriba y con el plato entero: así calculo mejor la porción.</p></div>'+
   '<div class="field" style="margin-bottom:6px"><input id="foodQ" type="search" placeholder="Buscá: pollo, arroz, banana…" value="'+esc(d.q||'')+'" data-i="fq" autocomplete="off" aria-label="Buscar alimento"></div>'+
   '<div class="fd-list" id="foodList">'+foodList(d)+'</div>';
}
function foodAlt(){
  return '<p class="fd-alt-h">¿No está en la lista?</p><div class="fd-alt">'+
   '<button data-a="foodQuick"><span class="fd-alt-i">'+ic('flame',18)+'</span><span class="grow"><b>Anotar solo las calorías</b><small>Comiste afuera y no sabés bien qué tenía</small></span>'+ic('right',16)+'</button>'+
   '<button data-a="foodNew"><span class="fd-alt-i">'+ic('plus',18)+'</span><span class="grow"><b>Crear un alimento</b><small>Copiás los datos de la etiqueta del paquete</small></span>'+ic('right',16)+'</button></div>';
}
/* ============ Código de barras: la cámara lee el código y los datos vienen de Open Food Facts (base abierta y gratis) ============ */
let barStream=null,barTimer=0,barZx=null;
/* si algún día Swole se sube a App Store / Play Store con Capacitor, usa el escáner nativo (plugin @capacitor-mlkit/barcode-scanning) */
const barNative=()=>{const c=window.Capacitor;return c&&c.isNativePlatform&&c.isNativePlatform()&&c.Plugins&&c.Plugins.BarcodeScanner||null;};
const barCan=()=>!!(barNative()||navigator.mediaDevices&&navigator.mediaDevices.getUserMedia);
function barStop(){clearInterval(barTimer);barTimer=0;if(barZx){try{barZx.stop();}catch(e){}barZx=null;}if(barStream){barStream.getTracks().forEach(t=>t.stop());barStream=null;}}
/* lector para iPhone (Safari no trae BarcodeDetector): se baja solo cuando hace falta */
function zxLoad(){return window.ZXingBrowser?Promise.resolve(window.ZXingBrowser):new Promise((ok,bad)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/zxing-browser.min.js';s.onload=()=>window.ZXingBrowser?ok(window.ZXingBrowser):bad(new Error('zx'));s.onerror=bad;document.head.appendChild(s);});}
function barHTML(d){
  const b=d.bar||{};
  if(b.busy)return '<div class="ph-wait"><span class="ph-dot"></span>Buscando el producto '+esc(b.code||'')+'…</div>';
  let h=b.err?'<div class="warn">'+esc(b.err)+'</div>':'';
  if(b.err&&b.code)h+='<button class="btn pri wide" data-a="foodNew">'+ic('plus',16)+' Cargarlo con la etiqueta</button>';
  if(!b.manual&&barNative())h+='<div class="ph-wait"><span class="ph-dot"></span>Abriendo la cámara…</div><button class="btn line wide" data-a="barManual">Escribir el número</button>';
  else if(!b.manual&&barCan())h+='<div class="bar-cam"><video id="barVid" playsinline muted autoplay></video><i class="bar-line"></i></div><p class="mut sm-t tc">Apuntá al código de barras del paquete.</p><button class="btn line wide" data-a="barManual">Escribir el número</button>';
  else h+='<p class="mut sm-t">'+(barCan()?'':'Tu navegador no deja leer códigos con la cámara: escribí los números que están abajo de las barras.')+'</p><div class="row" style="gap:8px"><input class="soc-in" id="barIn" inputmode="numeric" maxlength="14" placeholder="7790000000000" style="letter-spacing:.06em" value="'+esc(b.code||'')+'" aria-label="Número del código de barras"><button class="btn pri" data-a="barGo">Buscar</button></div>';
  return h+'<button class="btn line wide" data-a="foodStep" data-v="list">Volver</button><p class="mut tc" style="font-size:11.5px">Datos de Open Food Facts (base abierta, la carga la gente). Revisá que coincidan con la etiqueta.</p>';
}
async function barScan(){
  const d=S.m2&&S.m2.d;if(!d||d.step!=='bar'||d.bar.manual||!barCan())return;
  const nat=barNative();
  if(nat){try{const r=await nat.scan({formats:['EAN_13','EAN_8','UPC_A','UPC_E']}),c=r&&r.barcodes&&r.barcodes[0];if(c)barLookup(c.rawValue||c.displayValue);else{d.bar={manual:1};renderModal();}}
    catch(e){d.bar={manual:1,err:'No pude abrir la cámara. Escribí el número del código.'};renderModal();}return;}
  if(!('BarcodeDetector' in window)){
    try{const ZX=await zxLoad(),v=document.getElementById('barVid');if(!v||!S.m2||S.m2.d!==d||d.step!=='bar')return;
      const rd=new ZX.BrowserMultiFormatReader();
      barZx=await rd.decodeFromVideoDevice(undefined,v,(res)=>{if(res&&barZx){const code=res.getText();barStop();buzz(30);barLookup(code);}});
    }catch(e){barStop();if(S.m2&&S.m2.d===d){d.bar={manual:1,err:'No pude usar la cámara. Escribí el número del código.'};renderModal();}}
    return;}
  try{barStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false});}
  catch(e){d.bar={manual:1,err:'No pude usar la cámara. Escribí el número del código.'};renderModal();return;}
  const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e']});
  barTimer=setInterval(async()=>{
    const dd=S.m2&&S.m2.d,v=document.getElementById('barVid');
    if(!dd||dd.step!=='bar'||!v){barStop();return;}
    if(v.srcObject!==barStream){v.srcObject=barStream;v.play().catch(()=>{});}
    if(v.readyState<2)return;
    try{const c=await det.detect(v);if(c&&c[0]&&c[0].rawValue){barStop();buzz(30);barLookup(c[0].rawValue);}}catch(e){}
  },300);
}
async function barLookup(code){
  const d=S.m2&&S.m2.d;if(!d)return;code=String(code||'').replace(/\D/g,'');
  if(code.length<8){toast('El código tiene entre 8 y 13 números');return;}
  const id='b'+code,have=(db.foods||[]).find(f=>f.id===id);if(have){ACTIONS.foodPick(id);return;}
  d.bar={busy:1,code};renderModal();
  try{
    const r=await fetch('https://world.openfoodfacts.org/api/v2/product/'+code+'.json?fields=product_name,product_name_es,brands,nutriments,serving_quantity');
    const j=await r.json(),p=j&&j.product,nu=p&&p.nutriments||{};
    let k=+nu['energy-kcal_100g'];if(!k&&nu.energy_100g)k=+nu.energy_100g/4.184;
    if(!p||j.status!==1||!(k>0)){if(S.m2&&S.m2.d===d){d.bar={code,err:'No encontré ese producto (o no tiene las calorías cargadas). Podés cargarlo vos con la etiqueta.'};d.q='';renderModal();}return;}
    const name=String(p.product_name_es||p.product_name||'Producto').trim()+(p.brands?' · '+String(p.brands).split(',')[0].trim():'');
    const sq=+p.serving_quantity,f={id,n:name.slice(0,40).trim(),k:r1(k),p:r1(+nu.proteins_100g||0),c:r1(+nu.carbohydrates_100g||0),f:r1(+nu.fat_100g||0),u:sq>0&&sq<2000?[{n:'Porción',g:Math.round(sq)}]:[]};
    db.foods.push(f);save();if(S.m2&&S.m2.d===d){ACTIONS.foodPick(id);toast('Encontrado: '+f.n);}
  }catch(e){if(S.m2&&S.m2.d===d){d.bar={code,manual:1,err:navigator.onLine===false?'Sin conexión: el código necesita internet.':'No pude buscarlo ahora. Probá de nuevo.'};renderModal();}}
}
/* ============ Comida desde una foto ============
   1) Gratis y en el celu: un modelo chico (MobileCLIP S0, 23 MB, se baja una vez y queda guardado) compara la foto con cómo
      "suena" cada alimento de la lista (data/comida-ia.json, calculado de antemano con tools/ia/comida.js). La foto no sale del celu.
   2) Si eso falla y tenés cuenta: la IA del servidor (función swole-food), cuando tenga su clave.
   En los dos casos vos elegís la opción correcta y ajustás el tamaño antes de anotar. */
const FoodAI=(()=>{
  const TJS='https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1';let ready=null;
  function load(onProg){return ready||(ready=(async()=>{
    const[T,j]=await Promise.all([import(TJS),fetch('data/comida-ia.json').then(r=>{if(!r.ok)throw new Error('labels');return r.json();})]);
    const E=j.q.map(b=>{const s=atob(b),a=new Float32Array(j.dim);for(let i=0;i<j.dim;i++){let v=s.charCodeAt(i);if(v>127)v-=256;a[i]=v*j.scale;}return a;});
    const pr=await T.AutoProcessor.from_pretrained(j.model),opt={dtype:'fp16',progress_callback:onProg};
    let vm=null;if(navigator.gpu)try{vm=await T.CLIPVisionModelWithProjection.from_pretrained(j.model,Object.assign({device:'webgpu'},opt));}catch(e){vm=null;}
    if(!vm)vm=await T.CLIPVisionModelWithProjection.from_pretrained(j.model,Object.assign({device:'wasm'},opt));
    return{T,E,ids:j.ids,dim:j.dim,pr,vm};
  })().catch(e=>{ready=null;throw e;}));}
  /* lo que hay en el plato: la foto entera y cinco recortes, en una sola pasada */
  async function guess(url,onProg){const m=await load(onProg),im=await m.T.RawImage.fromURL(url);m.mem=FoodMem.list();return plateItems(await plateScan(m,im));}
  return{guess};
})();
/*<plato> Lo comparte la app con tools/ia/probar.js: un solo lugar para la lógica del plato.
   Familias: dos opciones de la misma familia son la misma cosa vista distinto (milanesa de carne o de pollo), no dos comidas. */
const FOOD_FAM={bife:'carne',asado:'carne',vacio:'carne',picada:'carne',hamb:'carne',pech:'pollo',muslo:'pollo',bondiola:'carne',jamon:'fiambre',chori:'embutido',pancho:'embutido',
  milc:'mila',milp:'mila',milnapo:'mila',atun:'pescado',salmon:'pescado',merluza:'pescado',sushi:'pescado',huevo:'huevo',clara:'huevo',tortilla:'huevo',
  leche:'lacteo',lechedes:'lacteo',yogur:'lacteo',yogurf:'lacteo',griego:'lacteo',whey:'lacteo',cremoso:'queso',muzza:'queso',rallado:'queso',untable:'queso',
  ddl:'untar',manteca:'untar',mermelada:'untar',miel:'untar',pmani:'untar',arroz:'arroz',arrozi:'arroz',fideos:'pasta',noquis:'pasta',fideosalsa:'pasta',
  papa:'papa',fritas:'papa',pure:'papa',batata:'papa',pan:'pan',lactal:'pan',panint:'pan',wrap:'pan',arrozt:'pan',agua:'pan',avena:'cereal',granola:'cereal',copos:'cereal',
  barrac:'barra',barrap:'barra',lentejas:'legumbre',garbanzo:'legumbre',porotos:'legumbre',guiso:'legumbre',polenta:'maiz',choclo:'maiz',
  ensalada:'ensalada',ensp:'ensalada',tomate:'ensalada',zanahoria:'verdura',brocoli:'verdura',zapallo:'verdura',espinaca:'verdura',salteado:'verdura',
  mani:'seco',nuez:'seco',almendra:'seco',mayo:'salsa',ketchup:'salsa',aceite:'salsa',medialuna:'dulce',alfajor:'dulce',galled:'dulce',choco:'dulce',azucar:'dulce',
  gaseosa:'bebida',zero:'bebida',jugo:'bebida',cafel:'bebida',isot:'bebida',cerveza:'bebida',vino:'bebida'};
/* lo que ya viene adentro de un plato armado: no se anota aparte (la pizza ya tiene queso) */
const FOOD_PART={pizza:['queso','salsa','ensalada','fiambre'],milnapo:['queso','fiambre','ensalada','salsa','pizza','empa','tortilla'],milc:['empa','tortilla','pizza'],milp:['empa','tortilla','pizza'],fritas:['tortilla'],hambc:['carne','pan','queso','ensalada','salsa'],sandjq:['pan','queso','fiambre'],
  fideosalsa:['queso','salsa','ensalada'],empa:['carne','pan'],tarta:['verdura','huevo','queso'],ensp:['pollo','verdura'],guiso:['carne','verdura'],pancho:['pan','salsa'],
  sushi:['arroz','pescado'],tortilla:['papa'],wrap:['pollo','carne','ensalada','queso'],yogurf:['dulce'],medialuna:['untar']};
const pFam=id=>FOOD_FAM[id]||id;
/* foto entera + 4 esquinas + centro, todo en una pasada del modelo; devuelve, por imagen, los alimentos ordenados con su probabilidad */
async function plateScan(m,im){
  const W=im.width,H=im.height,cw=Math.round(W*.6),ch=Math.round(H*.6),box=[[0,0],[W-cw,0],[0,H-ch],[W-cw,H-ch],[Math.round((W-cw)/2),Math.round((H-ch)/2)]];
  const ims=[im].concat(await Promise.all(box.map(([x,y])=>im.crop([x,y,x+cw-1,y+ch-1]))));
  const {image_embeds}=await m.vm(await m.pr(ims)),v=image_embeds.data,dim=m.dim;
  const R=ims.map((_,b)=>{let n=0;for(let k=0;k<dim;k++)n+=v[b*dim+k]**2;n=Math.sqrt(n)||1;const e=new Float32Array(dim);for(let k=0;k<dim;k++)e[k]=v[b*dim+k]/n;
    const s=m.E.map((r,i)=>{let d=0;for(let k=0;k<dim;k++)d+=r[k]*e[k];return{id:m.ids[i],d};}).sort((a,c)=>c.d-a.d);
    const ex=s.map(x=>Math.exp((x.d-s[0].d)*100)),z=ex.reduce((a,c)=>a+c,0),l=s.map((x,i)=>({id:x.id,p:ex[i]/z}));l.e=e;
    /* lo que ya corregiste antes: si esta parte se parece mucho a una foto tuya, manda lo que elegiste ahí */
    const mm=(m.mem||[]).reduce((b2,x)=>{let d=0;for(let k=0;k<dim;k++)d+=x.e[k]*e[k];return d>b2.d?{d,id:x.id}:b2;},{d:0,id:null});
    if(mm.id&&mm.d>=.85){const j=l.findIndex(x=>x.id===mm.id);const it=j>=0?l.splice(j,1)[0]:{id:mm.id,p:0};it.p=Math.max(it.p,.9);it.mem=1;l.unshift(it);}
    return l;});
  return R;
}
/* qué se anota: lo principal (la foto entera) y hasta 2 cosas más que se ven claras en alguna parte y no son "lo mismo" ni parte del plato */
function plateItems(R){
  const food=x=>!/^x_/.test(x.id),all=R[0];
  if(!food(all[0])&&all[0].p>.45)return[];
  const top=all.filter(food);if(!top.length)return[];
  const main=top[0].id,used=new Set([pFam(main)].concat(FOOD_PART[main]||[])),rank=new Map(all.map((x,i)=>[x.id,i]));
  const out=[{id:main,opts:top.slice(0,3).map(x=>x.id),p:top[0].p,e:all.e,mem:top[0].mem}],free=x=>food(x)&&!used.has(pFam(x.id))&&!used.has(x.id);
  /* en cada parte del plato, lo más claro que todavía no está anotado; gana lo que aparece en más partes */
  while(out.length<3){
    const cand={};
    R.slice(1).forEach(r=>{const t=r.find(free);if(!t||t.p<.3||!((rank.get(t.id)??99)<=15))return;const c=cand[t.id]||(cand[t.id]={id:t.id,n:0,p:0,r});c.n++;if(t.p>c.p){c.p=t.p;c.r=r;}});
    const c=Object.values(cand).sort((a,b)=>b.n-a.n||b.p-a.p)[0];if(!c)break;
    const f=pFam(c.id);used.add(f);used.add(c.id);(FOOD_PART[c.id]||[]).forEach(x=>used.add(x));
    out.push({id:c.id,opts:[c.id].concat(c.r.filter(x=>food(x)&&x.id!==c.id&&pFam(x.id)===f).slice(0,2).map(x=>x.id)),p:c.p,e:c.r.e,mem:c.r[0].mem});
  }
  return out;
}
/*</plato>*/
/* Lo que aprende de vos, solo en este celu: la "huella" de cada cosa que anotaste por foto (no la foto) y tus porciones.
   Si la próxima foto se parece mucho, propone lo que elegiste vos; y te pone la porción que solés comer. */
const FoodMem=(()=>{
  const K='swole.foodmem',MAX=300;let m=null;
  const get=()=>{if(m)return m;try{m=JSON.parse(localStorage.getItem(K)||'null');}catch(e){}if(!m||!Array.isArray(m.v))m={v:[],g:{}};return m;};
  const put=()=>{try{localStorage.setItem(K,JSON.stringify(m));}catch(e){m.v=m.v.slice(-Math.floor(MAX/2));try{localStorage.setItem(K,JSON.stringify(m));}catch(x){}}};
  const pack=e=>{let s='';for(let k=0;k<e.length;k++)s+=String.fromCharCode((Math.max(-127,Math.min(127,Math.round(e[k]*355)))+256)%256);return btoa(s);};
  const unpack=b=>{const s=atob(b),e=new Float32Array(s.length);for(let k=0;k<s.length;k++){let x=s.charCodeAt(k);if(x>127)x-=256;e[k]=x/355;}return e;};
  return{
    list(){return get().v.map(x=>({id:x.id,e:unpack(x.e)}));},
    learn(e,id,g){const M=get();if(e&&id){M.v.push({id,e:pack(e)});if(M.v.length>MAX)M.v=M.v.slice(-MAX);}
      if(id&&g>0){const o=M.g[id];M.g[id]=o?Math.round(o*.6+g*.4):g;}put();},
    portion(id){return get().g[id]||0;},
    size(){return get().v.length;}
  };
})();
/* porción: la que solés comer de eso, o su primera unidad (1 milanesa, 1 banana, 1 plato), o 150 g */
const foodPortion=f=>{const mine=f&&FoodMem.portion(f.id);if(mine)return mine;const u=(f&&f.u||[])[0];return Math.max(10,Math.round(u&&u.g||150));};
async function foodPhotoLocal(d,pic){
  const found=await FoodAI.guess(pic.thumb,p=>{if(p&&p.status==='progress'&&p.total>2e6&&/onnx/.test(p.file||'')){const el=document.getElementById('phDl');d.ph.dl=Math.round(p.progress||p.loaded/p.total*100);if(el)el.textContent='Bajando el reconocedor de comida (solo la primera vez): '+d.ph.dl+' %';}});
  const items=found.map(it=>{const opts=it.opts.map(foodById).filter(Boolean);if(!opts.length)return null;const g=foodPortion(opts[0]);
    return{opts:opts.map(f=>({n:f.n,id:f.id,k:f.k,p:f.p,c:f.c,f:f.f})),sel:0,g,g0:g,lo:Math.max(5,Math.round(g*.7)),hi:Math.round(g*1.4),other:null,on:true,e:it.e,mem:it.mem};}).filter(Boolean);
  if(!items.length)return{thumb:pic.thumb,items:[],food:false};
  return{thumb:pic.thumb,local:1,food:true,items,scale:'',
    tip:items.some(x=>x.mem)?'Me acordé de lo que elegiste la otra vez.':found[0].p<.5?'No estoy muy seguro de lo principal: fijate si es alguna de las otras opciones.':items.length>1?'Encontré '+items.length+' cosas en el plato. Si alguna no va, sacala con la X.':''};
}
function shrinkB64(file,max){
  return new Promise((ok,bad)=>{const u=URL.createObjectURL(file),im=new Image();
    im.onload=()=>{const s=Math.min(1,(max||1024)/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);const d=c.toDataURL('image/jpeg',.82);ok({b64:d.split(',')[1],thumb:d});};
    im.onerror=()=>{URL.revokeObjectURL(u);bad(new Error('img'));};im.src=u;});
}
const PH_ERR={nokey:'La foto con IA todavía no está activada en el servidor. Mientras tanto, buscá el alimento o anotá solo las calorías.',
  limit:'Llegaste a las 20 fotos de hoy. Mañana se renueva; mientras tanto, buscalo a mano.',login:'Para analizar fotos necesitás una cuenta (así nadie abusa del servicio). Creala gratis en Perfil.',
  refusal:'No pude analizar esa foto. Probá con otra o buscalo a mano.',busy:'El servicio está con mucha demanda. Probá de nuevo en un rato.',bad:'No pude leer la foto. Probá con otra.',
  net:'Sin conexión. La primera vez el reconocedor necesita internet para bajarse (23 MB); después anda sin conexión.',
  ia:'No pude reconocer la foto en este celu. Buscá el alimento a mano o anotá las calorías.',api:'Algo falló al analizar la foto. Probá de nuevo.'};
function phOptOf(o){const m=o.match_id&&foodById(o.match_id);return m?{n:m.n,id:m.id,k:m.k,p:m.p,c:m.c,f:m.f}:{n:o.name,id:'',k:+o.kcal_100||0,p:+o.prot_100||0,c:+o.carb_100||0,f:+o.fat_100||0};}
async function foodPhotoGo(file){
  const d=S.m2&&S.m2.d;if(!d||!file)return;
  d.step='photo';d.ph={busy:true};renderModal();
  let pic;try{pic=await shrinkB64(file,1024);}catch(e){d.ph={err:'bad'};renderModal();return;}
  d.ph.thumb=pic.thumb;renderModal();
  /* primero en el celu, gratis */
  let loc=null;try{loc=await foodPhotoLocal(d,pic);}catch(e){console.error(e);}
  if(!S.m2||S.m2.d!==d)return;
  if(loc){d.ph=loc;renderModal();return;}
  if(!Sync.user()){d.ph={thumb:pic.thumb,err:navigator.onLine===false?'net':'ia'};renderModal();return;}
  let r;
  try{r=await Sync.req('/functions/v1/swole-food',{method:'POST',auth:true,body:{img:pic.b64,foods:allFoods().map(f=>[f.id,f.n]),hint:d.ph.hint||''}});}
  catch(e){r={error:e.status===401?'login':navigator.onLine===false?'net':'api'};}
  if(!S.m2||S.m2.d!==d)return; /* cerraste la hoja mientras esperaba */
  if(!r||r.error){d.ph={thumb:pic.thumb,err:(r&&r.error)||'api'};renderModal();return;}
  const items=(r.items||[]).filter(it=>it.options&&it.options.length).map(it=>{const g=Math.max(1,Math.round(+it.grams||100));
    return{opts:it.options.slice(0,3).map(phOptOf),sel:0,g,g0:g,lo:Math.max(1,Math.round(+it.grams_low||g*.75)),hi:Math.max(g,Math.round(+it.grams_high||g*1.3)),other:null,on:true};});
  d.ph={thumb:pic.thumb,items,scale:r.scale||'',tip:r.tip||'',food:r.is_food!==false,left:r.left};
  renderModal();
}
const phCur=it=>it.other&&it.other.f?it.other.f:it.opts[it.sel];
function phItemKcal(it){const o=phCur(it);return Math.round(o.k*it.g/100);}
function phTotHTML(d){const its=d.ph.items.filter(x=>x.on),k=its.reduce((s,x)=>s+phItemKcal(x),0),p=its.reduce((s,x)=>s+phCur(x).p*x.g/100,0);
  return '<b>'+nf(k)+' kcal</b> · '+num(p,1)+' g de proteína';}
function phSug(it,i){const q=String(it.other&&it.other.q||'').trim();if(!q)return '';
  const l=foodSearch(q).slice(0,4);
  return l.map(f=>'<button class="chip sm" data-a="phPick" data-v="'+i+'|'+f.id+'">'+esc(f.n)+'</button>').join('')+
   (l.length?'':'<span class="mut sm-t">No lo tengo en la lista: lo anoto como "'+esc(q)+'" con los valores de '+esc(it.opts[0].n.toLowerCase())+'.</span>');}
function photoHTML(d){
  const ph=d.ph||{};
  let h=ph.thumb?'<div class="ph-pic"><img src="'+ph.thumb+'" alt="Tu foto">'+(ph.busy?'<div class="ph-scan"><i></i><span>Mirando tu plato…</span></div>':'')+'</div>':
    (ph.busy?'<div class="ph-wait"><span class="ph-dot"></span>Preparando la foto…</div>':'');
  if(ph.busy)return h+'<p class="mut sm-t tc" id="phDl">'+(ph.dl!=null?'Bajando el reconocedor de comida (solo la primera vez): '+ph.dl+' %':'Mirando tu plato en el celu: la foto no sale de acá.')+'</p>';
  if(ph.err)return h+'<div class="warn">'+esc(PH_ERR[ph.err]||PH_ERR.api)+'</div>'+(ph.err==='login'?'<div class="g2"><button class="btn pri" data-a="loginOpen" data-v="up">Crear cuenta</button><button class="btn" data-a="loginOpen">Ya tengo cuenta</button></div>':'')+'<button class="btn wide" data-a="foodStep" data-v="list">Buscar a mano</button>';
  if(!ph.food||!ph.items||!ph.items.length)return h+'<div class="warn">No encontré comida en la foto. Probá sacándola de más cerca, con el plato entero.</div>'+photoBtn('Sacar otra')+'<button class="btn line wide" data-a="foodStep" data-v="list">Buscar a mano</button>';
  h+='<p class="mut sm-t">Revisá cada cosa: tocá la opción correcta y ajustá el tamaño. Si no es ninguna, tocá <b>Otra cosa</b>.</p>';
  ph.items.forEach((it,i)=>{
    const o=phCur(it),nm=it.other&&it.other.f?it.other.f.n:o.n;
    h+='<div class="ph-it'+(it.on?'':' off')+'"><div class="row"><b class="grow">'+esc(nm)+'</b><span class="ph-k" id="phk'+i+'">'+(it.on?phItemKcal(it)+' kcal':'')+'</span><button class="ib flat" data-a="phOn" data-v="'+i+'" aria-label="'+(it.on?'Sacar':'Volver a poner')+'">'+ic(it.on?'x':'plus',16)+'</button></div>';
    if(it.on){
      h+='<div class="chips">'+it.opts.map((x,j)=>'<button class="chip sm '+(!it.other&&it.sel===j?'on':'')+'" data-a="phOpt" data-v="'+i+'|'+j+'">'+esc(x.n)+'</button>').join('')+
       '<button class="chip sm '+(it.other?'on':'')+'" data-a="phOther" data-v="'+i+'">'+ic('edit',12)+' Otra cosa</button></div>';
      if(it.other)h+='<input class="ph-in" type="text" maxlength="40" placeholder="¿Qué era? Ej: tarta de jamón y queso" value="'+esc(it.other.q||'')+'" data-i="pho" data-e="'+i+'"><div class="chips" id="phs'+i+'">'+phSug(it,i)+'</div>';
      h+='<div class="ph-size"><span class="mut sm-t">Tamaño</span><div class="seg">'+[['lo','Más chico',it.lo],['mid','Así',it.g0],['hi','Más grande',it.hi]].map(s=>'<button class="'+(it.g===s[2]?'on':'')+'" data-a="phSize" data-v="'+i+'|'+s[0]+'">'+s[1]+'<small>'+s[2]+' g</small></button>').join('')+'</div>'+
       '<div class="fd-amt"><button class="ib" data-a="phStep" data-v="'+i+'|-1" aria-label="Menos">'+ic('minus',16)+'</button><input class="num" type="text" inputmode="numeric" value="'+it.g+'" data-i="phg" data-e="'+i+'" aria-label="Gramos"><span class="mut">g</span><button class="ib" data-a="phStep" data-v="'+i+'|1" aria-label="Más">'+ic('plus',16)+'</button></div></div>';
    }
    h+='</div>';
  });
  h+='<div class="ph-tot" id="phTot">'+phTotHTML(d)+'</div>'+
   (ph.scale?'<p class="mut sm-t">'+ic('spark',13)+' Tamaño calculado con: '+esc(ph.scale)+'</p>':'')+
   (ph.tip?'<p class="ph-tip">'+ic('bolt',14)+' '+esc(ph.tip)+'</p>':'')+
   '<div class="field"><span>Comida</span>'+mealChips(d)+'</div>'+
   '<button class="btn pri wide" data-a="phSave">Agregar todo</button>'+photoBtn('Sacar otra foto')+
   '<p class="mut tc" style="font-size:11.5px">'+(ph.local?'Reconocido en tu celu, gratis. El tamaño es una porción típica: ajustalo vos.':'Es una estimación: la IA puede errarle al tamaño. Por eso revisalo vos.')+(ph.left!=null?' Te quedan '+ph.left+' fotos hoy.':'')+'</p>';
  return h;
}
const photoBtn=l=>'<label class="btn wide ph-btn">'+ic('camera',18)+' '+esc(l)+'<input type="file" accept="image/*" data-i="foodPhoto" hidden></label>';

/* tarjeta del día en Nutrición */
function mealsCard(n){
  const dk=S.fd||today(),t=today(),list=mealsOn(dk),tot=mealTot(list);
  const left=n.kcal-tot.k,pct=Math.min(100,Math.round(tot.k/n.kcal*100)),pp=Math.min(100,Math.round(tot.p/n.prot*100));
  const dayL=dk===t?'Hoy':dk===addDays(t,-1)?'Ayer':shortDate(parseK(dk).getTime());
  let h='<div class="card meals-card"><div class="hd"><div><h3>Comidas</h3><span class="mut sm-t">'+(list.length?(left>=0?'Te quedan '+nf(left)+' kcal':'Te pasaste '+nf(-left)+' kcal'):'Anotá lo que comés y te muestro cuánto te falta')+'</span></div>'+
   '<div class="row fd-day"><button class="ib flat" data-a="foodDay" data-v="-1" aria-label="Día anterior">'+ic('left',18)+'</button><b>'+esc(dayL)+'</b><button class="ib flat" data-a="foodDay" data-v="1" aria-label="Día siguiente"'+(dk>=t?' disabled':'')+'>'+ic('right',18)+'</button></div></div>'+
   '<div class="fd-sum"><div class="fd-ring" style="--p:'+pct+'"><b>'+nf(tot.k)+'</b><span>de '+nf(n.kcal)+'</span></div><div class="grow gap" style="gap:9px">'+
   [['Proteína',tot.p,n.prot,'pro'],['Carbos',tot.c,n.carbs,''],['Grasas',tot.f,n.fat,'']].map(x=>'<div class="fd-mac '+x[3]+'"><div class="row"><span class="grow">'+x[0]+'</span><b>'+Math.round(x[1])+'</b><span class="mut"> / '+x[2]+' g</span></div><div class="bar"><i style="width:'+Math.min(100,Math.round(x[1]/Math.max(1,x[2])*100))+'%"></i></div></div>').join('')+'</div></div>'+
   (list.length&&pp>=100?'<p class="fd-ok">'+ic('check',15)+' Proteína del día completa</p>':'');
  MEALS.forEach(([k,nm])=>{
    const its=list.filter(e=>e.m===k),s=mealTot(its);
    if(k==='col'&&!its.length)return;
    h+='<div class="fd-meal"><div class="row"><b class="grow">'+nm+'</b>'+(its.length?'<span class="mut sm-t">'+nf(s.k)+' kcal</span>':'')+'<button class="btn sm fd-add" data-a="foodOpen" data-v="'+k+'" aria-label="Agregar a '+nm.toLowerCase()+'">'+ic('plus',15)+' Agregar</button></div>'+
     its.map(e=>'<button class="fd-it" data-a="foodEdit" data-v="'+e.id+'"><span class="grow">'+esc(e.n)+'<span class="mut sm-t">'+(e.g?unitTxt(e.g,e.u):'')+(e.p?(e.g?' · ':'')+num(e.p,1)+' g prot.':'')+'</span></span><b>'+nf(e.k)+'</b></button>').join('')+'</div>';
  });
  if(!list.length&&mealsOn(addDays(dk,-1)).length)h+='<button class="btn line wide" style="margin-top:10px" data-a="foodRepeat">'+ic('swap',16)+' Repetir lo del día anterior</button>';
  if(!list.some(e=>e.m==='col'))h+='<button class="btn line wide fd-col" data-a="foodOpen" data-v="col">'+ic('plus',15)+' Colación</button>';
  return h+'</div>';
}

