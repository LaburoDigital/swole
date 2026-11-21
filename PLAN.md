# Swole — Plan
Última actualización: 2026-11-21 · Etapa actual: 2

## Visión
App web instalable (PWA) en español rioplatense para entrenar (gym o calistenia) y saber qué tan fuerte sos: registrás entrenos y tus marcas se convierten en un rango de Bronce a Élite comparado con gente de tu sexo, edad y peso. Además: rutinas generadas, nutrición, árbol de calistenia, amigos y rankings. Público: gente que entrena, sobre todo adolescentes y jóvenes que hacen deporte.

**Terminado para la versión actual (v1 "pública"):** la PWA funciona entera en un Android y un iPhone reales (entreno en vivo, niveles, nutrición, sync, sin conexión), hay pruebas automáticas que cubren niveles, sync y generador, la sync no puede borrar historiales, y hay términos/privacidad aptos para menores. Las tiendas (Play / App Store) son la versión siguiente.

Publicada en https://laburodigital.github.io/swole/ · versión v83 · repo LaburoDigital/swole (main).

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
- Figuras de técnica: las de pie se parecen; solo dominadas tiene vista de espaldas.
- Foto de comida: no estima porción, falla con asado y la tercera cosa; lo aprendido queda solo en ese celu.
- Lesiones: cambiar a mano un ejercicio por uno que carga la zona no avisa.
- Sin pruebas automáticas (una falla de 27 ejercicios estuvo semanas sin verse, arreglada en v83).
- Puede quedar algún dato de prueba en el navegador del preview.

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

### Etapa 2 — Pruebas automáticas base  [pendiente]
- Objetivo: red de seguridad para niveles, generador y ejercicios.
- Tareas: cargar los js/ en un contexto Node (vm); pruebas de niveles (percentiles, rangos), generador (tiempo, lesiones, objetivos), "todo ejercicio tiene técnica y detalle"; `npm test`; correrlo en GitHub Actions.
- Archivos: tests/ (nuevo), package.json (nuevo, raíz), .github/workflows/test.yml.
- Terminado cuando: CI en verde y una rotura introducida a propósito hace fallar el CI.
- Te toca a vos: nada.
- Depende de: nada (puede ir en paralelo con la 1).

### Etapa 3 — Sync segura  [pendiente]
- Objetivo: que la sync no pueda borrar historiales.
- Tareas: pruebas de la sync (dos dispositivos, sin red, borrado, reinstalación, reloj desfasado); arreglar lo que falle; exportación/importación completa de datos del usuario; verificar backups de Supabase.
- Archivos: js/sync.js, js/datos.js, tests/.
- Terminado cuando: pruebas de sync pasando y una restauración probada de punta a punta en celu real.
- Te toca a vos: probar en 2 celus.
- Depende de: 2.

### Etapa 4 — Menores, privacidad y social  [pendiente]
- Objetivo: poder abrir la app a gente fuera de tu círculo sin riesgo.
- Tareas: términos y privacidad; edad mínima; bloquear/denunciar; revisar RLS con advisors; social limitado para menores.
- Archivos: info/, js/sync.js, js/progreso.js, migraciones de Supabase.
- Terminado cuando: páginas enlazadas desde el registro; advisors revisados; un menor no puede ser encontrado por desconocidos.
- Te toca a vos: decidir edad mínima y mail de soporte; leer y aprobar los textos.
- Depende de: 1.

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
| 2026-11-21 | Etapa 1 se da por cerrada con iPhone; la prueba en Android pasa a la Etapa 5 y es obligatoria antes de la 7 (Play) | Juan no tiene Android; no frenar el plan por eso | Etapa 1 "en los dos celus" |

## Después / fuera de alcance
App Store (necesita Mac + cuenta Apple); widget de inicio; Apple Health y Google Fit; comparar dos entrenos cualquiera; lector de pantalla; capturas reales para info/; estimar porción en la foto; vista de espaldas para más ejercicios; desafíos 1 contra 1 (PLAN-v5, no hecho); ciclo menstrual opcional (PLAN-v5, no hecho); que lo aprendido por la foto se comparta entre celus.

## Bitácora de sesiones
| Fecha | Etapa | Qué se hizo | Qué quedó |
|---|---|---|---|
| 2026-11-21 | 0 | Se armó este plan desde el resumen del chat original + verificación del repo (v83, git limpio). | Arrancar Etapa 1 y 2. |
| 2026-11-21 | 1 | Checklist de 12 ítems en docs/checklist-celu.md; Etapa 1 en curso. | Juan corre el checklist en Android y iPhone; anotar ✓/✗ en Estado. |
| 2026-11-21 | 1 | iPhone: 12/12 ✓ según Juan (sin detalle). No hay Android disponible. Etapa cerrada; Android pasa a la Etapa 5. | Etapa 2: pruebas automáticas. |
