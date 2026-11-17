# Métodos Numéricos para Ecuaciones Diferenciales Ordinarias (EDOs)

Este documento describe los métodos numéricos implementados en **ChuspaNumeric** para resolver ecuaciones diferenciales ordinarias (EDOs) de primer orden de la forma:

```
dy/dx = f(x, y),   y(x₀) = y₀
```

Se cubren los fundamentos teóricos, el error de truncación, los criterios de estabilidad y el paso máximo recomendado para cada método.

---

## ¿Qué es una EDO y por qué resolverla numéricamente?

Una ecuación diferencial ordinaria expresa la relación entre una función desconocida `y(x)` y su derivada. En la práctica, la mayoría de EDOs que aparecen en ingeniería, física y biología **no tienen solución analítica cerrada**, por lo que se recurre a métodos numéricos que construyen una aproximación paso a paso desde la condición inicial `y(x₀) = y₀`.

Todos los métodos de ChuspaNumeric siguen este esquema general:

```
Dado (xₙ, yₙ), calcular yₙ₊₁ ≈ y(xₙ + h)
```

donde `h` es el tamaño del paso.

---

## Método de Euler

### Idea

Es el método más simple. Aproxima la solución avanzando en la dirección de la pendiente al inicio del intervalo:

```
yₙ₊₁ = yₙ + h · f(xₙ, yₙ)
```

### Error de truncación

- **Local** (por paso): O(h²) — el error en un solo paso es proporcional a h²
- **Global** (acumulado): O(h) — al reducir h a la mitad, el error global se reduce a la mitad

### Estabilidad

Para la ecuación de prueba `dy/dx = λy` con `λ < 0`, el método de Euler es estable cuando:

```
|1 + hλ| ≤ 1
```

Esto impone la condición:

```
h ≤ 2 / |λ|
```

Si se viola esta condición, la solución numérica diverge aunque la solución exacta converja a cero.

### Paso máximo recomendado

```
h_max = 2 / |λ|
```

Para problemas sin parámetro `λ` explícito, se recomienda empezar con `h = 0.1` y reducirlo hasta que los resultados sean estables.

### Uso en ChuspaNumeric

```javascript
import { euler } from 'ChuspaNumeric';

const res = euler({ f: (x, y) => -y, x0: 0, y0: 1, h: 0.1, xFinal: 2 });
// res.resultado: array de pares [x, y]

```

## Método de Euler Mejorado (Heun / RK2)

### Idea

Corrige la aproximación de Euler promediando la pendiente al inicio y al final del paso:

```
k₁ = f(xₙ, yₙ)                        ← pendiente al inicio
k₂ = f(xₙ + h, yₙ + h·k₁)            ← pendiente al final (predictor)
yₙ₊₁ = yₙ + (h/2) · (k₁ + k₂)        ← corrector
```

Este esquema predictor-corrector lo convierte en un método de **Runge-Kutta de orden 2**.

### Error de truncación

- **Local**: O(h³) — significativamente mejor que Euler
- **Global**: O(h²) — al reducir h a la mitad, el error global se divide entre 4

### Estabilidad

Para `dy/dx = λy` con `λ < 0`, la región de estabilidad es más amplia que la de Euler:

```
h ≤ 2 / |λ|
```

En la práctica, Euler mejorado tolera pasos más grandes que Euler simple para la misma precisión.

### Paso máximo recomendado

```
h_max ≈ 2 / |λ|
```

Para obtener errores menores a `1e-4`, se recomienda `h ≤ 0.01` en problemas típicos de ingeniería.

### Uso en ChuspaNumeric

```javascript
import { eulerMejorado } from 'ChuspaNumeric';

const res = eulerMejorado({ f: (x, y) => -y, x0: 0, y0: 1, h: 0.1, xFinal: 2 });
```

---

## Método de Runge-Kutta de Orden 4 (RK4)

### Idea

RK4 es el método más popular para EDOs. Calcula cuatro pendientes por paso y las combina con pesos optimizados para lograr alta precisión sin requerir pasos muy pequeños:

```
k₁ = f(xₙ, yₙ)
k₂ = f(xₙ + h/2, yₙ + (h/2)·k₁)
k₃ = f(xₙ + h/2, yₙ + (h/2)·k₂)
k₄ = f(xₙ + h,   yₙ + h·k₃)

yₙ₊₁ = yₙ + (h/6) · (k₁ + 2k₂ + 2k₃ + k₄)
```

Los pesos `1/6, 2/6, 2/6, 1/6` provienen de la regla de Simpson y son óptimos para polinomios de grado hasta 3.

### Error de truncación

- **Local**: O(h⁵) — excelente precisión por paso
- **Global**: O(h⁴) — al reducir h a la mitad, el error global se divide entre 16

### Estabilidad

Para `dy/dx = λy` con `λ < 0`:

```
h ≤ 2.785 / |λ|
```

RK4 tiene la región de estabilidad más amplia de los tres métodos, lo que permite usar pasos más grandes.

### Paso máximo recomendado

```
h_max ≈ 2.785 / |λ|
```

En la práctica, `h = 0.1` suele ser suficiente para la mayoría de problemas de ingeniería con RK4.

---

## Tabla Comparativa de Métodos

| Característica | Euler | Euler Mejorado (RK2) | Runge-Kutta 4 (RK4) |
|---|---|---|---|
| **Error local** | O(h²) | O(h³) | O(h⁵) |
| **Error global** | O(h) | O(h²) | O(h⁴) |
| **Evaluaciones de f por paso** | 1 | 2 | 4 |
| **Estabilidad (`dy/dt = -y`)** | h ≤ 2 | h ≤ 2 | h ≤ 2.785 |
| **Paso máximo recomendado** | h ≤ 2/\|λ\| | h ≤ 2/\|λ\| | h ≤ 2.785/\|λ\| |
| **Precisión** | Baja | Media | Alta |
| **Costo computacional** | Mínimo | Bajo | Moderado |
| **Recomendado para** | Estimaciones rápidas | Balance precisión/costo | Uso general |

---

## Criterio de Paso Máximo

El tamaño del paso `h` es el parámetro más importante en todos los métodos. Un paso demasiado grande produce resultados inexactos o inestables; uno demasiado pequeño aumenta el tiempo de cómputo y acumula errores de redondeo.

### Regla general

Para la ecuación de prueba `dy/dt = λy`:

```
h_max = C / |λ|
```

donde `C` depende del método:

| Método | Constante C |
|---|---|
| Euler | 2.000 |
| Euler Mejorado (RK2) | 2.000 |
| RK4 | 2.785 |

### ¿Cómo estimar λ en problemas reales?

En problemas no lineales, `λ` se puede estimar como:

```
λ ≈ ∂f/∂y  evaluado en el punto de interés
```

### Verificación práctica

Una forma confiable de verificar que `h` es adecuado es comparar los resultados con `h` y `h/2`. Si los resultados no cambian significativamente, `h` es suficientemente pequeño.

---

## Comparación visual: dy/dt = -y, y(0) = 1

La solución exacta es `y(t) = e⁻ᵗ`. Para `t ∈ [0, 2]` con `h = 0.5`:

| t | Exacto | Euler | Euler Mejorado | RK4 |
|---|---|---|---|---|
| 0.0 | 1.0000 | 1.0000 | 1.0000 | 1.0000 |
| 0.5 | 0.6065 | 0.5000 | 0.6250 | 0.6065 |
| 1.0 | 0.3679 | 0.2500 | 0.3906 | 0.3679 |
| 1.5 | 0.2231 | 0.1250 | 0.2441 | 0.2231 |
| 2.0 | 0.1353 | 0.0625 | 0.1526 | 0.1353 |

RK4 coincide con la solución exacta hasta 4 decimales con `h = 0.5`, mientras que Euler tiene un error del 54% en `t = 2`.
