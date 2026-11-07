# Swole: plan v4 (después de mirar la competencia)

El objetivo no cambia: **entrenar y saber qué tan fuerte sos**. Todo lo de abajo suma a eso.

## Qué tienen las apps parecidas

| App | Lo fuerte | Lo que Swole ya tiene | Lo que nos falta |
|---|---|---|---|
| **Hevy** | Feed social, rutinas compartidas, nivel de fuerza con percentil, timer automático, calculadora de discos | Timer, discos, superseries, calentamiento, nivel por ejercicio | Amigos, feed, percentil "más fuerte que el X %", compartir rutinas |
| **Strong** | Anotar rapidísimo, minimalista | Anotar, rutinas | Más velocidad: menos toques por serie |
| **Fitbod** | Te arma el entreno de HOY según qué músculos están recuperados | Mapa de recuperación, generador semanal | "Entreno de hoy" automático según recuperación |
| **Liftoff / WeLift** | Rangos, XP, rachas, misiones, ranking con amigos y global | Rangos, rachas, logros, carta | Misiones semanales, ranking con amigos, temporadas |
| **Strength Level / StrengthLog** | Comparar tu 1RM con estándares por peso y edad | Niveles por ejercicio, alometría | Mostrarlo como percentil y por edad |

## La lista, por tandas (de más impacto a menos)

### Tanda A: lo que hace que la uses todos los días (hecha en v22)
1. **Entreno de hoy automático** (como Fitbod): un botón en Inicio arma la sesión con los músculos más recuperados, tu objetivo y tu deporte de mañana.
2. **Anotar más rápido** (como Strong):
   - tocar "✓" copia el peso de la serie anterior;
   - +2,5 / −2,5 con un toque;
   - el timer arranca solo y vibra al terminar.
3. **Esfuerzo por serie (RIR)**: opcional, "me quedaban 0-1-2-3+". Lo usa la progresión: si te sobró mucho, la próxima sube el peso.
4. **Resumen al terminar**: tarjeta lindísima con volumen, récords y músculos trabajados, lista para compartir en historias.

### Tanda B: saber qué tan fuerte sos, mejor (hecha en v23)
5. **Percentil**: "Sos más fuerte que el 72 % de los hombres de 17 años y 72 kg" en cada ejercicio y en general.
6. **Gráficos de progreso por ejercicio**:
   - 1RM estimado en el tiempo;
   - mejor serie;
   - volumen semanal por músculo, como mapa de calor.
7. **Próximo rango**: "Para Oro III te faltan 7,5 kg en sentadilla o 3 repes". Ya existe en partes; hacerlo protagonista.
8. **Medidas y fotos de progreso**: cintura, brazo, pecho y fotos privadas, con comparador antes/después.

### Tanda C: lo social (hecha en v24)
9. **Amigos**: agregar por código o link, ver su carta y sus rangos.
10. **Ranking entre amigos** por ejercicio y general, con el puntaje relativo al peso corporal para que sea justo.
11. **Temporadas mensuales**: ganás puntos por progresar (no por ser el más fuerte), así compite el que recién empieza.
12. **Feed simple**: "Tomi subió a Platino I", "Juan hizo récord en banca".

### Tanda D: gamificación con criterio
13. **Misiones semanales**: "3 entrenos", "1 récord", "15 series de espalda". Dan XP y la racha.
14. **Racha semanal** en vez de diaria: cumplir tus días planeados, sin castigar el descanso.
15. **Periodización en el generador**:
    - bloques de 4 semanas que suben carga;
    - semana 5 de descarga, con aviso.

### Tanda E: confianza y comodidad
16. **Importar de Hevy / Strong (CSV)**: traés todo tu historial en un toque. Es la mejor forma de que alguien se cambie a Swole.
17. **Recuperar contraseña por email** que funcione de verdad (Resend con dominio propio).
18. **Recordatorios**: "hoy te toca piernas" y "tomá creatina", con notificaciones de la app instalada.
19. **Biblioteca de ejercicios con técnica**: dibujos propios (SVG) de cada movimiento, músculos y errores comunes.

### Fuera de alcance (por ser web/PWA)
- Apple Health / Google Fit y relojes: necesitan una app nativa. Se puede pensar más adelante con Capacitor.

## Fuentes
- Comparativas 2026: [Jefit](https://www.jefit.com/blog/fitbod-vs-strong-vs-jefit-vs-hevy), [Sensai](https://www.sensai.fit/blog/hevy-vs-strong-vs-fitbod)
- Hevy: [timer](https://www.hevyapp.com/features/workout-rest-timer/), [discos](https://www.hevyapp.com/features/weight-plate-calculator/), [nivel de fuerza y percentil](https://help.hevyapp.com/hc/en-us/articles/38001696749335)
- Fitbod: [recuperación muscular](https://help.fitbod.me/hc/en-us/articles/360006269014-Muscle-Recovery)
- Liftoff: [rangos, XP y rankings](https://apps.apple.com/us/app/liftoff-ranked-gym-workouts/id6448081563)
- Otros: [Strength Club (DOTS, ranking)](https://mwm.ai/apps/strength-club/6760890099), [Repolve (temporadas)](https://www.producthunt.com/products/repolve), [StrengthLog](https://help.strengthlog.com/?p=1656)

### Extra (v22)
- **Árbol de habilidades de calistenia**: 10 ramas, 39 habilidades, requisitos entre ramas.
- **Camino a una habilidad**: elegís una y te arma una rutina de 3 días que se actualiza sola con tu progreso.
