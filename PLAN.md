# Swole — Plan
Última actualización: 2026-11-23 · Etapa actual: 4 (cerrando: faltan tus OK)

## Visión
App web instalable (PWA) en español rioplatense para entrenar (gym o calistenia) y saber qué tan fuerte sos: registrás entrenos y tus marcas se convierten en un rango de Bronce a Élite comparado con gente de tu sexo, edad y peso. Además: rutinas generadas, nutrición, árbol de calistenia, amigos y rankings. Público: gente que entrena, sobre todo adolescentes y jóvenes que hacen deporte.

**Terminado para la versión actual (v1 "pública"):** la PWA funciona entera en un Android y un iPhone reales (entreno en vivo, niveles, nutrición, sync, sin conexión), hay pruebas automáticas que cubren niveles, sync y generador, la sync no puede borrar historiales, y hay términos/privacidad aptos para menores. Las tiendas (Play / App Store) son la versión siguiente.

Publicada en https://laburodigital.github.io/swole/ · versión v92 (2026-11-23) · repo LaburoDigital/swole (main).

## Estado
**Hecho y probado en el preview (casi nada en celu real desde v60):**
- Entrenar: rutinas, plantillas, programas famosos; generador (objetivos, habilidades, tiempo, lesiones, cambiar ejercicios); entreno en vivo (descanso con aviso, atajos, modo grande, menú al mantener, arrastrar, deshacer, superseries, discos, resumen, guardar como rutina); calendario y "Tu semana".
- Niveles: percentiles StrengthLevel con ajuste por peso/edad/sexo, reps hasta Élite, rango por grupo y zona, borrar registros, excluir ejercicios, plan para estancamientos, 4 secciones, árbol de calistenia, carta de atleta, logros, misiones, temporada.
- Nutrición: buscador, código de barras (Open Food Facts), foto reconocida en el celu (MobileCLIP S0), calorías, peso con tendencia, medidas, fotos de progreso, creatina, agua.
- Otros: amigos, ranking, torneos, feed; recordatorios web push; importar Hevy/Strong; exportar CSV; tutorial; tema claro; preferencias; versión escritorio.

**A medias / pendiente:**
- APK Android compila en GitHub Actions; nadie lo instaló; sin push nativo; sin cuenta Play ni firma final.
- App Store: necesita Mac y cuenta Apple; no empezado.
- Foto de comida con servidor: falta ANTHROPIC_API_KEY en Supabase (verificado: `swole-food` la lee de los secretos).
- Spotify: `SPOTIFY_CLIENT_ID=''` en js/pantallas.js (verificado).
- Mail de recuperar contraseña: necesita dominio propio (Gmail SMTP rechaza la clave).
- Capturas reales para info/.
- PLAN-v5: **no existen** en el código el ciclo menstrual opcional ni los desafíos 1 contra 1 (verificado con búsqueda). Pasan a "Después".

**Resultados celu real (Etapa 1, v83, 2026-11-21):**
- iPhone: los 12 ítems de docs/checklist-celu.md ✓ ("todo anda", según Juan). Sin detalle por ítem: no quedaron anotados ni el modelo ni la versión de iOS, ni con qué segundo dispositivo se probó la sync.
- Android: **sin probar**, porque Juan no tiene uno. Queda pendiente (ver Decisiones).

**Bugs conocidos / sin verificar:**
- Android sin probar en celu real: atrás dos veces, sin conexión, fluidez en un Android medio, foto de comida.
- Figuras de técnica (SW-7: las 154 revisadas, ninguna repetida). Pendientes: aperturas de costado se parecen al press con mancuernas (propuesta: vista desde los pies del banco); el curl martillo roza 1,2 la cabeza; la zona del tibial queda siempre gris en Nivel (su único ejercicio no tiene niveles).
- Foto de comida: no estima porción, falla con asado y la tercera cosa; lo aprendido queda solo en ese celu.
- Lesiones: cambiar a mano un ejercicio por uno que carga la zona no avisa.
- Pruebas automáticas: 192 en `npm test` (11 de SW-2; 1 de SW-3: existen todos los archivos de CORE/PICS del SW; 3 de SW-4; 9 de SW-5: escudo y Tilt; 6 de SW-6: VIP; SW-7: figura única por ejercicio y QA del catálogo; total 251) (7 de la Etapa 4: edad, casilla de términos, hojas de seguridad; 19 de SW-1: copias mal formadas o con código inyectado, editar rutina 5/3/1, velocidad) y en GitHub Actions ("Pruebas", cada push). Cubren niveles, generador, técnica/detalle de los 154 ejercicios y, desde la Etapa 3, la sync y las copias: 20 pruebas con nube y celus de mentira (`tests/nube.js`). Todavía no cubren nutrición, pantallas fuera del detalle de ejercicio ni humo con navegador.
- Backups de Supabase: **sin verificar**. El plan gratis no tendría backups descargables [Probable]: hoy la copia en archivo es el único respaldo fuera de la nube.
- Puede quedar algún dato de prueba en el navegador del preview.
- iPhone (SW-4, v89): la barra de abajo y el encabezado se vuelven a acomodar tras cerrar el teclado o volver a la app (vpFix), **sin probar en iPhone real**. Bajos: con una hoja abierta, si iOS corre la vista al cerrar el teclado se corrige recién al cerrar la hoja; contraste bajo (2,6–2,9) de Diamante/Campeón/Élite en la fila de rangos.
- Movimiento con el celu (SW-5, v90, módulo Tilt): en iPhone, después del primer "sí" se activa solo con el primer toque; **sin probar en iPhone real**.
- VIP (SW-6, v91), Bajos: isVip() en el celu lee el token sin verificar la firma, así que se puede falsear; sirve solo para cosas cosméticas, y todo lo VIP de valor tiene que controlarlo el servidor con auth.jwt(). El mail del dueño figura como autor en los commits públicos (posible arreglo: mail noreply de GitHub para los commits futuros; lo decide Juan).
- Medios de SW-1: los 11 arreglados en SW-2 (v87). Quedan los Bajos de SW-1 (detalle en .equipo/SW-1/paquete-cierre.md).
- Pendientes de SW-2 (los elige Juan; detalle en .equipo/SW-2/paquete-cierre.md): [Medio] Swole comparte dirección y almacenamiento con jarvis-app y pedido-listo, y el SW de jarvis-app borra la caché de Swole al actualizarse (arreglo de fondo: dominio propio, Etapa 8). Bajos: caja sin index.html no se vuelve a guardar; las 16 fotos se vuelven a bajar con cada versión; cambiar objetivos volviendo en la bienvenida no recalcula calorías; CSP permite jsdelivr entero y no protege contra iframes; dos @keyframes glow (el brillo Élite no anda).

## Aspectos

### Producto
- Objetivo: que la tarea principal (entrenar → ver tu rango subir) sea obvia y rápida; frenar la suma de features hasta estabilizar.
- Plan: congelar features nuevas hasta cerrar Etapas 1–4. Medir con 3–5 usuarios reales de la edad objetivo qué usan.
- Terminado: lista de "lo que la gente usa" basada en uso real, no en ideas.
- Riesgos: demasiadas funciones para un público joven; cosas que nadie usa sumando bugs.
- Referentes: Hevy (registro en 2 toques), Strength Level (comparación clara). Superarlos: el rango por grupo + plan para subir de rango, que ninguno de los dos tiene integrado.

### Diseño
- Objetivo: consistencia y fluidez en celulares medios, sin lag.
- Plan: revisión de diseño con revisar-web después de las pruebas en celu; limpiar capas de app.css que se pisan.
- Terminado: revisor de diseño sin problemas graves; 60 fps aprox. en un Android medio en Inicio y entreno en vivo.
- Riesgos: app.css de 1.700 líneas con capas "Estética v3/v4/v5" superpuestas.
- Referentes: Apple Fitness, Strong (sobriedad, una mano).

### Funciones
- Objetivo: lo que existe, andando en celu real. Lo nuevo va a "Después".
- Pendientes chicos que sí entran: aviso de lesión al cambiar ejercicio (Etapa 5).

### Datos y sincronización
- Objetivo: que ningún caso de sync borre o pise un historial.
- Plan: pruebas automáticas de la sync (dos celus, sin red, borrar, reinstalar); respaldo/exportación completa del usuario; backups de Supabase verificados.
- Terminado: pruebas de sync pasando; procedimiento probado de "recuperar datos de un usuario".
- Riesgos: sync casera last-write-wins por campo; proyecto gratis que se pausa a la semana sin uso.
- Referentes: Linear/Things (local primero), CRDT livianos. Superar: exportación en un toque con importación de vuelta.

### Rendimiento
- Objetivo: arranque rápido y sin conexión confiable.
- Plan: medir arranque y peso (modelo de foto 23 MB solo bajo demanda); probar sin red en celu.
- Terminado: abre en <2 s con caché en un Android medio; abre en modo avión.

### Calidad y pruebas
- Objetivo: red de seguridad automática.
- Plan: pruebas con Node (sin framework) para niveles, generador, sync y "todos los ejercicios abren su detalle"; humo con Playwright que recorre todas las pestañas y ventanas; correr todo en GitHub Actions en cada push.
- Terminado: `npm test` + humo en CI en verde; una rotura como la de los 27 ejercicios hace fallar el CI.
- Riesgos: todo son globales compartidos entre scripts → hay que cargarlos en un contexto (vm) para probar.

### Seguridad y privacidad
- Objetivo: que lo compartido entre amigos sea seguro para menores.
- Plan: revisar RLS de todas las tablas (advisors de Supabase), límites a textos públicos (apodo, comentarios), bloquear/denunciar usuarios, revisar qué ve un desconocido.
- Terminado: advisors sin alertas inesperadas; un usuario no puede leer datos de otro que no sea su amigo; se puede bloquear y denunciar.
- Referentes: Strava (controles de privacidad por actividad).

### Publicación (web / tiendas)
- Objetivo: web estable primero; después Play; App Store al final.
- Plan: APK instalado y probado → firma y AAB → ficha de Play → (Mac) iOS con funciones nativas para no ser "una web en una caja".
- Riesgos: rechazo de Apple (guía 4.2), cuentas que Juan no tiene.

### Legal y usuarios menores
- Objetivo: cumplir lo mínimo antes de sumar usuarios fuera del círculo de amigos.
- Plan: términos y política de privacidad en español, edad mínima declarada (13+), consentimiento de padres si corresponde, mail de soporte, borrar cuenta (ya existe).
- Terminado: páginas publicadas y enlazadas desde el registro; social apagado por defecto o limitado para menores.
- Riesgos: rankings, fotos y comentarios entre menores; políticas de Play "Families".

## Riesgos (pre-mortem)
*Es noviembre 2027 y Swole fracasó. ¿Por qué?*

| Riesgo | Prob. | Impacto | Señal temprana | Cómo evitarlo | Plan B |
|---|---|---|---|---|---|
| Un cambio rompe algo grande y nadie lo ve por semanas | Alta | Alto | Bugs que aparecen "de la nada" tras un push | Etapa 2–3: pruebas + humo en CI | Volver a la versión anterior (git revert + subir versión) |
| La sync borra o pisa el historial de alguien | Media | Muy alto | Un amigo dice "se me borraron entrenos" | Etapa 3: pruebas de sync + exportación completa | Restaurar desde backup de Supabase |
| Anda en el preview pero no en celus reales (iPhone sobre todo) | Alta | Alto | Reportes vagos de lag o toques que no responden | Etapa 1: checklist en Android + iPhone reales | Recortar efectos en iPhone |
| Problema con menores (contenido entre desconocidos, datos) | Media | Muy alto | Usuarios que no son amigos de Juan | Etapa 4: términos, bloquear/denunciar, social limitado | Apagar social para menores |
| Apple rechaza la app / no hay Mac ni cuentas | Alta | Medio | — | Priorizar PWA y Play | Quedarse con PWA en iPhone |
| Proyecto Supabase gratis se pausa o se llena | Media | Medio | Sin uso una semana | Uso real o plan pago cuando haya usuarios | Reactivar a mano |
| Demasiadas funciones, nadie usa la mayoría | Media | Medio | Feedback de 3–5 usuarios | Congelar features | Esconder lo que no se usa |

**Veredicto:** puede salir bien como PWA para un grupo chico de usuarios reales **[Probable]**, si: (1) se frena la suma de features hasta tener pruebas automáticas y prueba en celu real, (2) la sync queda cubierta por pruebas y hay exportación completa, (3) se resuelve lo legal antes de abrir a desconocidos. Llegar a App Store en los próximos meses: **[Adivinando]**, depende de Mac, cuentas y de agregar funciones nativas. El fallo principal del plan actual: hay muchísimo hecho y casi nada probado en celulares reales.

## Etapas

### Etapa 1 — Prueba en celu real  [hecha en iPhone · Android pendiente]
- Objetivo: saber qué anda y qué no en un Android y un iPhone reales.
- Checklist: docs/checklist-celu.md (12 ítems, armado 2026-11-21). Resultados van a "Resultados celu real" en Estado.
- Tareas: armar checklist corto (arranque, sin conexión, entreno en vivo completo, descanso con pantalla bloqueada, teclado al cargar marca, barra de abajo, atrás de Android, Agregar a inicio, sync entre 2 celus, foto de comida); Juan lo corre; anotar resultados en Estado y bugs.
- Archivos: PLAN.md, docs/checklist-celu.md (nuevo).
- Terminado cuando: el checklist está corrido en los dos celus y cada ítem dice ✓ / ✗ con detalle.
- Te toca a vos: correr el checklist en tu celu y en un iPhone (tuyo o prestado), mandar capturas de lo que falle.
- Depende de: nada.

### Etapa 2 — Pruebas automáticas base  [hecha 2026-11-21]
- Objetivo: red de seguridad para niveles, generador y ejercicios.
- Tareas: cargar los js/ en un contexto Node (vm); pruebas de niveles (percentiles, rangos), generador (tiempo, lesiones, objetivos), "todo ejercicio tiene técnica y detalle"; `npm test`; correrlo en GitHub Actions.
- Archivos: tests/ (nuevo), package.json (nuevo, raíz), .github/workflows/test.yml.
- Terminado cuando: CI en verde y una rotura introducida a propósito hace fallar el CI.
- Te toca a vos: nada.
- Depende de: nada (puede ir en paralelo con la 1).
- Resultado: tests/cargar.js levanta los js/ en el orden de index.html con un DOM de mentira; niveles.test.js (6), generador.test.js (8), ejercicios.test.js (1 + uno por ejercicio). CI verde en main (run 44925404636); rotura a propósito en la rama prueba-rotura (sacar las claves de técnica de dominadas) → CI rojo (run 44925479298), rama borrada.

### Etapa 3 — Sync segura  [hecha 2026-11-21]
- Objetivo: que la sync no pueda borrar historiales.
- Tareas: pruebas de la sync (dos dispositivos, sin red, borrado, reinstalación, reloj desfasado); arreglar lo que falle; exportación/importación completa de datos del usuario; verificar backups de Supabase.
- Archivos: js/sync.js, js/datos.js, tests/.
- Terminado cuando: pruebas de sync pasando y una restauración probada de punta a punta en celu real.
- Te toca a vos: probar en 2 celus.
- Depende de: 2.
- Prueba de restauración en el celu (v84): 1) Perfil → Exportar datos y guardar el archivo. 2) Anotar cuántos entrenos hay. 3) Perfil → Borrar todos los datos. 4) Perfil → Importar datos → elegir el archivo. 5) Mismos entrenos, perfil y comidas que antes. 6) Entrar con la cuenta y, en otro celu o en otro navegador, ver que esté todo.

### Etapa 4 — Menores, privacidad y social  [publicada (v85, v86) · faltan tus OK]
- Objetivo: poder abrir la app a gente fuera de tu círculo sin riesgo.
- Tareas: términos y privacidad; edad mínima; bloquear/denunciar; revisar RLS con advisors; social limitado para menores.
- Archivos: info/, js/sync.js, js/progreso.js, migraciones de Supabase.
- Terminado cuando: páginas enlazadas desde el registro; advisors revisados; un menor no puede ser encontrado por desconocidos.
- Te toca a vos: decidir edad mínima y mail de soporte; leer y aprobar los textos.
- Depende de: 1.
- Resultado (2026-11-21):
  - Edad mínima 13 (decidida por Juan). Menos de 13: la app anda en el celu sin cuenta ni Amigos. De 13 a 17: cuenta con permiso de los padres, avisos de "solo gente que conocés" en Amigos y en la denuncia.
  - Páginas info/terminos.html e info/privacidad.html (+ legal.css, legal.js). Enlazadas desde la casilla obligatoria de "Crear cuenta" y desde Perfil → Privacidad y ayuda.
  - Servidor (supabase/etapa4-privacidad.sql, 4 migraciones): tablas swole_block y swole_report; RPC swole_block_user / swole_unblock_user / swole_blocked_list / swole_report_add (máx. 10 denuncias por día, guarda copia de lo denunciado); swole_add_friend con tope de 15 códigos inexistentes por día y bloqueados que "parecen enviados"; ayudantes de RLS movidos a swole_rls (fuera de la API); comentarios y fuego de bloqueados ocultos.
  - App: bandera en solicitudes, publicaciones y comentarios → Bloquear / Denunciar; "Opciones" en cada amigo; "Cambiar mi código" y "Bloqueados" en Amigos → Amigos; "Contacto y pedidos" en Perfil (va a swole_report como 'other').
  - Prueba "un menor no puede ser encontrado": con 3 usuarios de mentira en una transacción deshecha, el desconocido ve 0 perfiles, 0 posts, 0 comentarios y 0 amistades; no puede comentar; el código 16 inexistente se frena; si el menor lo bloquea, su solicitud no llega. El amigo sí ve todo. No existe buscador ni lista de usuarios: solo se llega con el código exacto.
  - Advisors: quedan 12 funciones con permisos elevados que la app usa a propósito, swole_vapid_public pública a propósito (clave pública), swole_report sin políticas a propósito. Falta "Leaked password protection" (ajuste de Auth, lo prende Juan; puede requerir plan pago).
  - Las denuncias se leen en Supabase → Table editor → swole_report (status nueva/vista/resuelta). No hay aviso automático a Juan.
  - Falta: mail de soporte en info/legal.js (SOPORTE_MAIL), que Juan lea y apruebe los textos, y probarlo en el celu. (v85 ya está publicada; v86 suma la revisión SW-1.)

### Etapa 5 — Arreglos del celu  [pendiente]
- Objetivo: arreglar lo que falle en Android cuando se pruebe (en iPhone no falló nada) + aviso de lesiones al cambiar ejercicio.
- Archivos: según resultados.
- Terminado cuando: checklist corrido en un Android real (prestado) con todo ✓; revisar-web (diseño) sin problemas graves.
- Te toca a vos: conseguir un Android prestado ~20 min.
- Depende de: 1, 2.

### Etapa 6 — Ordenar app.css  [pendiente]
- Objetivo: quitar capas de estilo que se pisan sin cambiar el look.
- Terminado cuando: humo visual en CI igual antes/después; revisor de diseño ok; prueba en celu.
- Depende de: 2 (humo con capturas).

### Etapa 7 — APK en Google Play (prueba interna)  [pendiente]
- Objetivo: APK instalado, firmado y en prueba interna de Play.
- Tareas: instalar el APK del CI; probar login, sin conexión, escáner; firma y AAB; avisos nativos.
- Archivos: native/, .github/workflows/android.yml.
- Te toca a vos: cuenta de Google Play (25 USD), guardar la clave de firma.
- Depende de: 4, 5.

### Etapa 8 — Claves pendientes  [pendiente]
- Objetivo: activar foto con servidor, Spotify y mail de contraseña.
- Te toca a vos: ANTHROPIC_API_KEY en Supabase Secrets, Client ID de Spotify, comprar dominio.
- Depende de: nada (cuando tengas las cuentas).

## Decisiones
| Fecha | Decisión | Por qué | Reemplaza a |
|---|---|---|---|
| nov 2026 (v55) | Datos locales primero, sync campo por campo; datos de un solo celu (sesión activa, fotos, video, lo aprendido por la foto) no se suben | Anda sin internet y dos celus no se pisan | Sync de documento entero |
| nov 2026 | Limpieza de textos compartidos en el servidor (swole_priv.clean_shared) | No confiar en el cliente | — |
| nov 2026 (v60) | Partir el archivo único en index.html + app.css + js/; sigue sin framework ni compilación | ~7.000 líneas, cada cambio rompía otra zona | Archivo único |
| nov 2026 (v46) | Niveles por percentiles StrengthLevel con ajuste por peso, edad y sexo | Comparación justa y explicable | Tablas de 1RM fijas |
| nov 2026 (v61) | En cada grupo manda el mejor ejercicio; los demás restan como mucho medio nivel; el general pesa más piernas y espalda | El promedio castigaba probar ejercicios nuevos | PLAN-v3 (promedio top 3) |
| nov 2026 (v62) | Calistenia = habilidades que elegís, no un objetivo | Combina con cualquier objetivo | v20 (calistenia como objetivo) |
| nov 2026 (v64) | Foto de comida gratis en el celu con MobileCLIP S0 fp16 (23 MB); servidor solo de respaldo | Gratis y privado; la de 12 MB daba basura, la de 72 MB no acertaba más | PLAN-v5 (foto al servidor) |
| nov 2026 | Android con Capacitor compilado en GitHub Actions | La PC no tiene herramientas de Android | — |
| nov 2026 | Contar calorías existe | Pedido de Juan | PLAN-v2 (dejaba afuera calorías) |
| nov 2026 (v81) | Fondo quieto, sin desenfoque, menos elementos | Lag en celulares | PLAN-v2 (fondos en movimiento y vidrio) |
| nov 2026 (v14) | Perfil se abre desde el avatar | Barra con 4 zonas | PLAN-v2 (Perfil en la barra) |
| nov 2026 | "Deshacer" en vez de confirmar; barra de abajo fija; sin pull-to-refresh ni rebote; sin emojis; tutorial con foco sobre la pantalla real | Más rápido y menos errores en el celu | v26 (pull-to-refresh) |
| 2026-11-21 | Congelar features nuevas hasta cerrar Etapas 1–4 | Calidad y menores son los riesgos mayores | — |
| 2026-11-21 | Pruebas con `node:test` y `vm`, sin dependencias; el cargador lee el orden de scripts de index.html | Nada que instalar ni mantener; un js/ nuevo entra solo en las pruebas | — |
| 2026-11-21 | La prueba de técnica exige claves propias de la figura (no acepta el respaldo con la descripción) | Es lo que falló en v83; el respaldo esconde el error | — |
| 2026-11-21 | Hora de cada cambio = la del celu, pero nunca menor que la última que ya vio (reloj lógico) | Con un reloj atrasado, un cambio o borrado hecho después de sincronizar perdía (3 pruebas fallaban) | Hora del celu sola |
| 2026-11-21 | Importar una copia **suma** lo que falta y no borra ni pisa nada | Importar una copia vieja reemplazaba todo y borraba en todos los celus lo cargado después | "Importar reemplaza lo que tenés" |
| 2026-11-21 | La primera vez que un celu se une a la cuenta, perfil, calendario y ajustes vienen de la nube (los entrenos se suman) | Hacer la bienvenida antes de entrar pisaba el perfil y el calendario de la nube | — |
| 2026-11-21 | Cada celu recuerda de qué cuenta son sus datos (`swole.owner`); si entra otra cuenta, arranca vacío | Los entrenos de una cuenta se subían a la otra | — |
| 2026-11-21 | La copia lleva lo que viaja a la nube; no lleva entreno en curso, avisos, fotos ni videos de progreso | Las fotos y videos son solo de ese celu (decisión v55) y pesan mucho | — |
| 2026-11-21 | Edad mínima 13 para cuenta y Amigos; menos de 13 usa la app solo en el celu; 13 a 17 con permiso de los padres | Lo decidió Juan; estándar de la mayoría de las apps y el público son adolescentes | — |
| 2026-11-21 | Social sin buscador: solo se llega con el código exacto; códigos con tope de intentos y que se pueden cambiar; bloqueo silencioso | "Un menor no puede ser encontrado por desconocidos" lo garantiza el servidor, no la app | — |
| 2026-11-21 | La edad la declara el usuario y vive en el celu; el servidor no la conoce | No hay forma real de verificarla; las reglas que protegen a todos (código, aceptar, bloquear) no dependen de la edad | — |
| 2026-11-21 | Denuncias y contacto en una tabla que solo se lee desde el panel de Supabase | No hay mail de soporte todavía y no hace falta otro servicio | — |
| 2026-11-21 | Etapa 1 se da por cerrada con iPhone; la prueba en Android pasa a la Etapa 5 y es obligatoria antes de la 7 (Play) | Juan no tiene Android; no frenar el plan por eso | Etapa 1 "en los dos celus" |
| 2026-11-22 | Escudo de nivel = disco de pesas (opción A de swole-escudos.html), con brillo del aro que sigue el celu; mismo dibujo en los 31 lugares y en la carta que se comparte | Lo eligió Juan; une con el logo (la "o" es un disco) | v18 (escudo facetado) |
| 2026-11-22 | La cuenta del dueño tiene todo lo VIP; se marca en el servidor (app_metadata.vip en su fila de auth.users), nunca en el código | No exponer datos del dueño en el repo público; el usuario no puede cambiar app_metadata | — |

## Después / fuera de alcance
App Store (necesita Mac + cuenta Apple); widget de inicio; Apple Health y Google Fit; comparar dos entrenos cualquiera; lector de pantalla; capturas reales para info/; estimar porción en la foto; vista de espaldas para más ejercicios; desafíos 1 contra 1 (PLAN-v5, no hecho); incluir fotos y videos de progreso en la copia; historial de versiones en el servidor (red de seguridad si la sync falla); ciclo menstrual opcional (PLAN-v5, no hecho); que lo aprendido por la foto se comparta entre celus; aviso automático a Juan cuando entra una denuncia (push o mail); pantalla de moderación dentro de la app; verificación de edad real; aviso en la app cuando cambien los términos.

## Bitácora de sesiones
| Fecha | Etapa | Qué se hizo | Qué quedó |
|---|---|---|---|
| 2026-11-21 | 0 | Se armó este plan desde el resumen del chat original + verificación del repo (v83, git limpio). | Arrancar Etapa 1 y 2. |
| 2026-11-21 | 1 | Checklist de 12 ítems en docs/checklist-celu.md; Etapa 1 en curso. | Juan corre el checklist en Android y iPhone; anotar ✓/✗ en Estado. |
| 2026-11-21 | 1 | iPhone: 12/12 ✓ según Juan (sin detalle). No hay Android disponible. Etapa cerrada; Android pasa a la Etapa 5. | Etapa 2: pruebas automáticas. |
| 2026-11-21 | 2 | tests/ + package.json + .github/workflows/test.yml; 131 pruebas verdes; CI verde en main y rojo con rotura a propósito (rama borrada). Sin cambios en la app. | Etapa 3: sync segura (sumar pruebas de sync al mismo cargador). Humo con navegador sigue pendiente (Etapa 6). |
| 2026-11-21 | 3 | 20 pruebas de sync y copias (tests/nube.js: nube y celus de mentira con su reloj). Fallaban 11: reloj desfasado (3), bienvenida antes de entrar, otra cuenta, copias (5) y 1 del entorno de prueba. Arreglado en js/datos.js, js/sync.js y js/acciones.js; 151/151 en local; v84. | CI verde en b893ba2 (v84 publicada). Backups de Supabase sin verificar. |
| 2026-11-21 | 3 | Restauración probada en celu real con v84 (exportar → borrar todo → importar → entrar con la cuenta): "anduvo bien", según Juan (sin detalle de modelo ni de cantidades). Etapa cerrada. | Etapa 4: menores, privacidad y social. Backups de Supabase siguen sin verificar. |
| 2026-11-21 | 4 | Edad 13+, términos y privacidad enlazados desde el registro, bloquear/denunciar/cambiar código, tope a probar códigos, RLS revisado con advisors y probado con usuarios de mentira (un desconocido no ve nada). La prueba encontró 2 errores, ya arreglados: los avisos de fuego y comentarios usaban una función movida, y el tope de códigos no frenaba. 158/158 pruebas; v85 en local. | Mail de soporte; Juan lee los textos; publicar v85 (el servidor ya cambió: la v84 publicada dice "ya son amigos" ante un código inexistente hasta que salga la v85); prueba en el celu. |
| 2026-11-22 | 4 (SW-1) | Primera mejora con el equipo de sesiones: revisión general de v85 (programación, diseño, QA, rendimiento, seguridad). 0 Críticos, 7 Altos arreglados y re-revisados: toque de serie y abrir Inicio rápidos aunque haya mucho historial; fondo quieto (v81); copias mal formadas se reparan; copias con código inyectado se limpian; editar rutina conserva pesos 5/3/1/powerlifting y calentamientos; "Tu semana" no salta; entreno en vivo a ≤400 px con "Más opciones". 177/177; v86 publicada (d8f8b50, CI verde). | Medios/Bajos para que elija Juan (ver Estado → Bugs); mail de soporte y OK de los textos de la Etapa 4. |
| 2026-11-22 | 4 (SW-2) | Los 11 Medios de SW-1 arreglados y revisados por rendimiento, diseño, QA y seguridad (0 Críticos, 0 Altos): escudo sin "undefined", bienvenida guarda peso/edad al volver, calentamiento no copia el peso, sin palabras cortadas, "…" hasta 440 px, mapa sin animaciones infinitas, abre al instante con mala señal, no rebaja todo en cada apertura, tocar una serie redibuja solo su tarjeta (10–25 ms), CSP. 188/188; v87 publicada (b154f79, CI verde; la versión publicada carga sin errores de CSP). | Pendientes nuevos de SW-2 (ver Estado → Bugs); Bajos de SW-1; mail de soporte y OK de los textos. |
| 2026-11-22 | 4 (SW-3) | Modo ahorro, sin revisores (pedido de Juan): prueba que falla si falta un archivo de CORE/PICS del SW; pestaña "Carta" de Nivel entera a 320 px. 189/189; v88 publicada (f125e86, CI verde). | Sigue el Medio del origen compartido (dominio propio, Etapa 8) y los Bajos. |
| 2026-11-22 | 4 (SW-4) | Modo ahorro. Arreglos de las capturas del iPhone de Juan en toda la app: barra/encabezado se reacomodan tras teclado o volver (vpFix, sin probar en iPhone real), nada tiembla al scrollear (sin desenfoque en encabezado y hojas), ningún botón sobre un campo (320/390/430/1280), gráfico de peso con eje y leyenda, rangos en 2 filas, escudos con color de su rango, nada bajo la hora/batería. Revisaron qa y diseno (0 Críticos/Altos; el Medio de diseno arreglado). 192/192; v89 publicada (9cd18ac, CI verde). | Probar en iPhone; 2 Bajos nuevos; idea guardada de revisión ejercicio por ejercicio (en "Después"). |
| 2026-11-22 | 4 (SW-5) | Modo ahorro. Escudo propio "disco de pesas" en toda la app (31 lugares vía badge(), incluida la carta compartida), brillo que sigue el celu (solo visibles, ~30 fps, 1,5 ms por cuadro). Movimiento con el celu siempre (Tilt): en iPhone se activa solo tras el primer "sí"; respeta reducir movimiento. Revisó diseno (0 Críticos/Altos; Bajo y nota de rendimiento arreglados). 201/201; v90 publicada (dadaf9d, CI verde). | Probar Tilt en iPhone real. |
| 2026-11-22 | 4 (SW-6) | Modo ahorro. Cuenta del dueño VIP: app_metadata.vip=true en una sola fila de auth.users (con OK de Juan); isVip() en el cliente; colores Oro/Élite desbloqueados con VIP. Revisó seg (0 Críticos/Altos, 2 Bajos). 207/207; v91 publicada (483e88c, CI verde). | 2 Bajos de VIP (ver Estado → Bugs). |
| 2026-11-23 | 4 (SW-7) | Revisión ejercicio por ejercicio (la idea guardada): 116 revisados + 38 nuevos = 154, cada uno con nombre, equipo, músculos, técnica y figura propia (bancos con su ángulo, barra/mancuernas/máquinas/poleas en su lugar; extensión de cuádriceps en su máquina). Buscador por palabras y sinónimos; músculo nuevo tibial anterior; extensión de cuádriceps recalibrada (puede bajar un poco ese nivel). Revisaron diseno por lote y qa (0 Críticos/Altos; Medios arreglados). 251/251; v92 publicada (f1103c0, CI verde); en la publicada los 154 detalles se arman sin errores y las hojas reales abren con figura. | 3 pendientes de figuras/tibial (ver Estado → Bugs). |
