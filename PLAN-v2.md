# Swole v2: plan

## El objetivo (para no perderlo)
**Swole es la app para entrenar y saber qué tan fuerte sos.** Todo lo que entra tiene que ayudar a una de estas dos cosas:
1. **Entrenar mejor:** registrar rápido en el gym, saber qué hacer hoy, progresar semana a semana.
2. **Ver tu nivel:** entender en qué rango estás, qué te falta para subir, y querer mostrarlo.

Lo que no suma a eso (redes sociales completas, recetas, contar calorías comida por comida) queda afuera.

---

## Fase 1: Que se sienta una app moderna
*Antes de agregar cosas, que lo que ya hay se vea y se sienta de primera.*

### Problemas que encontré al revisarla
| Problema | Arreglo |
|---|---|
| Con el perfil (o cualquier ventana) abierto, **la pantalla de atrás se scrollea** | Bloquear el scroll del fondo mientras haya una ventana abierta |
| En Android, el **botón "atrás" cierra la app** en vez de cerrar la ventana abierta | Que "atrás" cierre ventanas, el selector y el entreno minimizado, igual que una app nativa |
| Las ventanas no se cierran deslizando hacia abajo | Gesto de arrastrar para cerrar, como en iPhone |
| **39 emojis** (logros, generador, deportes) que se ven distintos en cada celular y quedan baratos | Reemplazarlos por **íconos propios** dibujados en el estilo de Swole |
| Los íconos son estáticos | **Íconos animados:** se dibujan al aparecer, la pestaña activa hace un pequeño gesto (la pesa sube, el rayo destella, la estrella gira) |
| La pantalla se apaga en medio del entreno | Mantener la pantalla prendida mientras hay un entreno en curso |
| Abrir la app es "pum, formulario de perfil" | **Bienvenida** de 3 pantallas animadas antes del perfil |
| Los estados vacíos son solo texto gris | **Ilustraciones propias** (barra, figura, calendario) con animación suave |
| El perfil es un botoncito arriba | Tiene su propio lugar en la barra de abajo |

### Estética nueva
- **Modo oscuro de base**, con fondos en degradé que se mueven lento y cambian según tu rango.
- **Tarjetas con profundidad:** vidrio esmerilado sutil, bordes con luz, sombras suaves.
- **Tipografía con más carácter:** números grandes y gruesos, rangos con presencia.
- **Imágenes facheras sin copiar a nadie:** ilustraciones vectoriales propias (insignias tipo escudo con relieve por tier, figura atlética, fondos geométricos). Livianas, nítidas en cualquier pantalla y animables.
- **Transiciones:** cambiar de zona desliza la pantalla; las ventanas suben con rebote; las listas entran en cascada; al tocar un ejercicio, su tarjeta "crece" hasta convertirse en la ficha.
- **Micro-interacciones:** botones que se hunden, vibración corta al marcar series, chispas al completar, anillos que se llenan.
- **Pantalla de carga** con el logo animado.
- Todo respeta la opción "reducir movimiento" del celular.

---

## Fase 2: Dos zonas bien claras

Barra de abajo con 4 botones animados:

| Zona | Qué tiene |
|---|---|
| **Entrenar** | Hoy, rutinas, calendario, generador de rutinas y el entreno en curso |
| **Nivel** | Tu Carta, tu cuerpo por rango, **Cargar marca**, ejercicios con su nivel, calistenia, logros y récords |
| **Nutrición** | Calorías, macros, peso, creatina y agua |
| **Perfil** | Datos, apodo, deporte, cuenta, sincronización y backup |

### Cargar marca
Botón grande en Nivel: elegís el ejercicio, ponés el peso y las reps (o la variante y las reps/segundos en calistenia), tocás **"Ver mi nivel"** y aparece el **reveal**: la insignia gira, se llena la barra y se muestra el rango. Se guarda como "prueba": cuenta para el nivel y el historial, pero no ensucia el calendario.

---

## Fase 3: Lo que la hace única

### 🃏 Tu Carta de atleta
- Rango general en grande, con el material de tu tier (bronce, plata, oro, platino, diamante, campeón y élite con brillo).
- Tu figura con los músculos pintados por nivel.
- **6 atributos del 0 al 99:** FUE (fuerza), EMP (empuje), TIR (tirón), PIE (piernas), COR (core) y CAL (calistenia).
- Tu apodo, tu deporte y tu racha.
- **Efecto holográfico:** se inclina en 3D al mover el celu, con brillo arcoíris (más fuerte en rangos altos).
- **Compartir:** imagen lista para una historia de Instagram.
- Al subir de rango, la carta se rompe y aparece la nueva.

### Escena de subida de rango
Pantalla negra → la insignia vieja tiembla y se parte → destello del color nuevo → la nueva cae girando → el nombre aparece letra por letra → papelitos del color del tier → vibración.

### Mapa de recuperación (qué entrenar hoy)
Tu figura en **Entrenar** muestra cada músculo según cuánto descansó: verde = listo, amarillo = recuperándose, rojo = lo entrenaste ayer. Abajo, una sugerencia: *"Hoy te toca espalda y bíceps"*, con un botón para arrancar.

---

## Fase 4: Entrenar mejor (sin perder el foco)

- **Sobrecarga progresiva automática:** en cada ejercicio, Swole te sugiere la meta de hoy según la última vez: *"La vez pasada 60 × 8. Hoy probá 62,5 × 8"*. Si la cumplís, chispa y +1 en tu racha de progreso.
- **Timer de descanso en anillo grande**, con el tiempo propio de cada ejercicio (los básicos más largo, los accesorios más corto) y latido en los últimos 3 segundos.
- **Superseries:** juntar dos ejercicios y alternarlos.
- **"Más fuerte que el X %"**: además del rango, una referencia estimada de cuánta gente de tu edad, peso y sexo levanta menos que vos. Marcado como estimación, para que se entienda que es aproximado.
- **Resumen semanal animado** (estilo historia): entrenos, kilos movidos, récords, músculo más trabajado, rango ganado. Se abre solo el lunes y se puede compartir.

---

## Fase 5: Pruebas y publicación
- Pruebas automáticas de la lógica nueva (atributos de la carta, marcas, recuperación, sugerencias) y de que lo viejo siga andando.
- Revisión en pantalla de celular: que nada se salga, que las animaciones no traben y que respeten "reducir movimiento".
- Cada fase se publica cuando está probada, así la vas usando en el celu mientras avanzo.

---

## Para más adelante (cuando haya más gente)
- **Amigos y ranking** por ejercicio y por rango general. Necesita que el email funcione bien (Resend con dominio).
- **Temporadas mensuales** con desafíos.

---

## Decisiones
- **Nombre en la carta:** cada usuario pone su apodo en el perfil. *(Si no decís nada, va así.)*
- **Orden:** Fase 1 → 2 → 3 → 4, publicando cada una.
