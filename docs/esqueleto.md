# El esqueleto del macaco (`js/esqueleto.js`)

Este es el esqueleto que mueve al macaco de la app (los dibujos de los 154 ejercicios). Está separado del dibujo para poder reusarlo en otro lado, por ejemplo en un juego 3D. El archivo no usa el DOM: carga en el navegador (`ESQ`) y en Node (`require('js/esqueleto.js')`).

`js/macaco.js` dibuja con este módulo y no repite la lógica.

## Qué tiene

| Parte | Qué es |
|---|---|
| `LEN` | Largos de los huesos en unidades del dibujo: torso 30, cuello 9, brazo 14, antebrazo 13, mano 5, muslo 20, pierna 19 y pie 8. `HEAD` = 7,5 es el radio de la cabeza. |
| `LIM` | Rangos articulares normales, con fuente: AAOS, Norkin y White, y Hemmerich y otros 2006 para la rodilla y el tobillo en sentadilla profunda. Cada ejercicio puede ampliarlos con `D.lim`, siempre con el motivo escrito en su definición. |
| `angAt`, `target` | Las fases: A → (fases intermedias) → B y la interpolación a un instante `u` (0 = A, 1 = B). |
| `fkSide`, `fkFront` | Cinemática directa de costado (lado cercano `n` y lejano `f`) y de frente o de atrás (`L` y `R` de la pantalla). |
| `solve2`, `ikArm`, `ikLeg` | IK de 2 huesos (codo y rodilla) para que las manos y los pies lleguen a su punto: barra, piso, manija. |
| `frame(D, u)` | Un cuadro completo: los puntos de cada articulación en el instante `u`. |
| `angles(R)` | Los ángulos clínicos de un cuadro: hombro, codo, muñeca, cadera, rodilla, tobillo y cuello. |
| `HUESOS` | Los 17 huesos estándar de humanoide, cada uno con su padre. |
| `exportPose(id, u)` | La pose lista para un rig 3D (ver abajo). |

## Los huesos

```
hips
├─ spine ─ chest ─┬─ neck ─ head
│                 ├─ upperArm.L ─ lowerArm.L ─ hand.L
│                 └─ upperArm.R ─ lowerArm.R ─ hand.R
├─ upperLeg.L ─ lowerLeg.L ─ foot.L
└─ upperLeg.R ─ lowerLeg.R ─ foot.R
```

Para usarlos en otro motor, así se llaman en cada uno:

| Swole (`ESQ.HUESOS`) | Mixamo | Unity Humanoid | glTF (VRM humanoid) |
|---|---|---|---|
| `hips` | `mixamorig:Hips` | `Hips` | `hips` |
| `spine` | `mixamorig:Spine` | `Spine` | `spine` |
| `chest` | `mixamorig:Spine1` (y `Spine2`) | `Chest` (y `UpperChest`) | `chest` |
| `neck` | `mixamorig:Neck` | `Neck` | `neck` |
| `head` | `mixamorig:Head` | `Head` | `head` |
| `upperArm.L` / `.R` | `mixamorig:LeftArm` / `RightArm` | `LeftUpperArm` / `RightUpperArm` | `leftUpperArm` / `rightUpperArm` |
| `lowerArm.L` / `.R` | `mixamorig:LeftForeArm` / `RightForeArm` | `LeftLowerArm` / `RightLowerArm` | `leftLowerArm` / `rightLowerArm` |
| `hand.L` / `.R` | `mixamorig:LeftHand` / `RightHand` | `LeftHand` / `RightHand` | `leftHand` / `rightHand` |
| `upperLeg.L` / `.R` | `mixamorig:LeftUpLeg` / `RightUpLeg` | `LeftUpperLeg` / `RightUpperLeg` | `leftUpperLeg` / `rightUpperLeg` |
| `lowerLeg.L` / `.R` | `mixamorig:LeftLeg` / `RightLeg` | `LeftLowerLeg` / `RightLowerLeg` | `leftLowerLeg` / `rightLowerLeg` |
| `foot.L` / `.R` | `mixamorig:LeftFoot` / `RightFoot` | `LeftFoot` / `RightFoot` | `leftFoot` / `rightFoot` |

- En Mixamo, el hombro (`LeftShoulder`, la clavícula) queda en reposo.
- Los dedos y los dedos del pie no están en el esqueleto: el agarre se dibuja aparte (`js/visor.js`).

## `exportPose(id, u)`

```js
const pose = ESQ.exportPose('squat', 1);   // u crudo, sin curva: 0 = arriba (A), 1 = abajo (B)
// {
//   id: 'squat', u: 1, vista: 'costado', mPorU: 0.018,
//   raiz: { pos: [0, 22.53, -9.91], posM: [0, 0.405, -0.178] },
//   huesos: {
//     spine:        { dir: [0, .766, .643], q: [.342, 0, 0, .940], qLocal: [.342, 0, 0, .940] },
//     'upperLeg.L': { dir: [0, -.139, .990], q: [-.656, 0, 0, .755], qLocal: [...], ang: 122, lim: [-30, 135] },
//     ...
//   }
// }
```

**Ejes y unidades:**
- Los ejes son los de glTF: **X = izquierda del personaje, Y = arriba, Z = adelante del personaje**.
- `pos` va en unidades del dibujo; `posM`, en metros, con `mPorU` (para una persona de 1,75 m).
- La raíz se mide desde el piso: `y` es la altura de la cadera.

**Rotaciones:**
- `q` es el cuaternión `[x, y, z, w]` del mundo: lleva la dirección de reposo del hueso a su dirección actual (`dir`).
- `qLocal` es la rotación respecto del padre: `q(padre) × qLocal = q`. Es la que se aplica en un rig jerárquico.

**Pose de reposo (todo en cero): de pie con los brazos al costado, en pose "I".**
- La columna, el cuello y la cabeza miran hacia arriba (+Y).
- Los brazos y las piernas miran hacia abajo (−Y).
- Los pies miran hacia adelante (+Z).

**Ángulos:**
- `ang` y `lim` son el ángulo clínico de la articulación y su rango (los mismos que controla el validador del dibujo).
- `proyectado: true` marca los ángulos que el dibujo 2D no muestra de verdad (vista 3/4, un tramo que apunta hacia quien mira, el brazo abierto más de 45°). Esos no se controlan.

### Rigs en pose "T" (Mixamo, la mayoría de Unity)

Esos rigs tienen los brazos horizontales en reposo. Hay que sumar una corrección fija en los brazos (las piernas no cambian):

```js
const offL = ESQ.qDesde([1, 0, 0], [0, -1, 0]);   // brazo izquierdo: de +X (T) a −Y (I)
const offR = ESQ.qDesde([-1, 0, 0], [0, -1, 0]);  // brazo derecho
// rotación del mundo para el rig: qRig = q × off   (y la local se vuelve a sacar con el padre)
```

### Ejemplo con three.js

```js
const pose = ESQ.exportPose('pullup', u);
for (const [nombre, h] of Object.entries(pose.huesos)) {
  const hueso = rig.getObjectByName(MAPA_MIXAMO[nombre]);   // la tabla de arriba
  if (hueso) hueso.quaternion.set(...h.qLocal);
}
rig.position.set(...pose.raiz.posM);
```

## Lado izquierdo y derecho

- **De costado:** si la figura mira a la derecha de la pantalla (`d = 1`), se ve su lado izquierdo, así que el cercano (`n`) es `.L`. Si mira a la izquierda, el cercano es `.R`.
- **De frente:** la izquierda de la pantalla es la derecha del personaje.
- **De atrás (`back`):** coinciden.

## Qué se reusa y qué no

**Se reusa tal cual:**
- los largos y sus proporciones;
- los rangos articulares con sus fuentes;
- las poses A y B y las fases intermedias de los 154 ejercicios;
- la interpolación por instante;
- el IK de 2 huesos;
- los nombres y la jerarquía de los huesos.

**No se reusa o hay que completarlo:**
- **Es 2D.** Cada ejercicio está armado en un plano: de costado (sagital) o de frente (frontal). De costado, `x = 0` en todos los huesos; de frente, `z = 0`. Las aperturas fuera del plano (`ab`, `abf`, `lt`) se informan en el ángulo, pero no mueven la dirección 3D. Para un juego hay que sumarles la profundidad o elegir la vista que corresponda.
- **No hay giro sobre el eje del hueso** (pronación y supinación, rotación del húmero): el cuaternión es el arco más corto. La mano y el agarre se resuelven aparte.
- **La vista 3/4 (`yaw`)** es una proyección hecha para el dibujo: sus ángulos de pantalla no son los reales.
- **El equipo** (barras, mancuernas, bancos, poleas) y el dibujo (piel, ropa, músculos, sombras, piso en perspectiva) viven en `js/macaco.js` y no forman parte del esqueleto.

## Pruebas

`tests/esqueleto.test.js` controla cuatro cosas:
- que el módulo cargue en Node sin DOM;
- que estén los 17 huesos con su padre;
- que macaco.js no repita la cinemática;
- que `exportPose` de los 154, en 21 instantes cada uno, dé cuaterniones unitarios, que la local compuesta con la del padre dé la del mundo, y que los ángulos estén dentro de sus límites (salvo los proyectados).
