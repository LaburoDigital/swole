# Swole: plan v5 (ideas nuevas + calorías desde fotos)

El objetivo sigue siendo **entrenar y saber qué tan fuerte sos**. Lo que sigue suma a eso sin llenar la app de cosas que nadie usa (según una encuesta de Clutch, 1 de cada 4 usuarios valora más la simplicidad que tener muchas funciones).

## 1. Calorías desde fotos de comida

### Qué dice la evidencia
- Un estudio de 2025 (Universidad de Gotemburgo) probó GPT-4o, Claude y Gemini con fotos de comida: **error promedio de ~36 % en calorías**, y tienden a **subestimar las porciones grandes**.
- Un preprint de Purdue (2025, sin revisión de pares) vio que **dar contexto** (qué es, de dónde, cuánto, qué hora) baja el error a **~15-20 %**.
- Conclusión: la foto sola no alcanza. Tiene que ser **foto + confirmar la porción**.

### Cómo lo haría (en 3 pasos)

**Paso 1: registro de comidas (la base, sin IA)**
- Pestaña Nutrición → "Comidas de hoy": desayuno, almuerzo, merienda, cena y colaciones.
- Agregar rápido: buscador de alimentos comunes (base local con valores por 100 g: arroz, pollo, huevo, pan, milanesa, dulce de leche...), cantidad en gramos o porciones ("1 plato", "2 unidades").
- **Proteína del día** destacada (es lo que más importa para ganar músculo) y barra de calorías contra tu meta.
- **Comidas frecuentes y favoritas**: repetir el desayuno de siempre con un toque.

**Paso 2: código de barras (gratis)**
- Escanear el paquete con la cámara y traer los datos de **Open Food Facts** (base abierta, sin costo ni clave, tiene muchos productos de Uruguay y Argentina).
- Ojo: no todos los productos están, y hay que cuidar las unidades (por 100 g o por porción, kcal o kJ).

**Paso 3: foto con IA**
1. Sacás la foto (la app la achica antes de mandarla).
2. Va a una **función en Supabase** (como la de los recordatorios), que se la pasa a un modelo de visión. La clave de la IA queda guardada en el servidor, nunca en la app.
3. La IA devuelve **qué hay en el plato y cuántos gramos estima** de cada cosa, no las calorías directamente.
4. Las calorías se calculan con la **base de alimentos** (más preciso que dejar que la IA invente el número).
5. Ves la lista y **corregís las porciones** con un deslizador ("¿era más o menos?"). Esto es clave por el error del 36 %.
6. Se guarda en tus comidas. **La foto no se guarda** (privacidad).

**Costos y límites**
- Cada foto cuesta centavos de dólar con la IA. Para que no se dispare: límite de ~20 fotos por día por usuario y la foto achicada a 768 px.
- **Lo que necesito de vos:** crear una cuenta en el proveedor de IA (Anthropic u OpenAI), sacar una clave y cargarla vos en Supabase (Edge Functions → Secrets). Yo no puedo manejar claves.
- Sin conexión, la foto queda en espera y se analiza cuando vuelve internet.

## 2. Otras ideas que sirven (ordenadas por impacto)

1. **Accesos directos de la app instalada**: mantener apretado el ícono → "Empezar entreno", "Cargar marca", "Agua". Rápido de hacer.
2. **Gráficos por ejercicio mejores**: 1RM estimado + volumen por semana + tus récords marcados en la línea.
3. **Programas conocidos listos**: PPL, Upper/Lower, 5/3/1, Full Body 3 días, con la progresión ya armada.
4. **Desafíos 1 contra 1 con amigos** de una semana (más entrenos, más series de espalda, etc.).
5. **Sueño y energía del día** (1 a 5, un toque): el coach ajusta ("dormiste mal: hoy bajá un 10 %").
6. **Exportar a CSV/Excel** (además de importar de Hevy/Strong).
7. **Grabar una serie con la cámara** y verla al lado de la figura de técnica (queda en el celu).
8. **Modo gym**: pantalla de la sesión con botones gigantes para usar con las manos transpiradas.
9. **Opcional para mujeres: ciclo menstrual** para que el coach entienda los días con menos energía.
10. **Arreglar el mail de "recuperar contraseña"** (necesita un dominio propio).

## Fuentes
- [LLMs y nutrición desde fotos (Fridolfsson y col., 2025)](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12513282/)
- [Contexto y prompting reducen el error (arXiv 2507.07048)](https://arxiv.org/html/2507.07048v2)
- [Análisis de Biolayne sobre IA y calorías](https://biolayne.com/reps/issue-44/can-we-use-ai-to-accurately-track-calories-with-a-picture/)
- [Open Food Facts API](https://openfoodfacts.github.io/documentation/docs/Product-Opener/api/tutorials/scanning-cosmetics-pet-food-and-other-products/)
- [APIs de nutrición gratis (2026)](https://dev.to/0012303/8-free-food-nutrition-apis-no-key-tested-2026-3doh)
- [Funciones de apps fitness (Clutch)](https://clutch.co/resources/25-features-health-fitness-app)
- [Funciones de progreso de Hevy](https://www.hevyapp.com/best-workout-tracker-app/)
