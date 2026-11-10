# Métodos de Integración Numérica

Este documento describe los métodos de integración numérica implementados en **ChuspaNumeric** para aproximar integrales definidas de la forma:

```
∫[a, b] f(x) dx
```

Se cubren el error de truncación, el grado de exactitud polinomial, el análisis de cómo elegir `n` y una comparación de precisión entre métodos.

---

## ¿Por qué integración numérica?

Muchas funciones no tienen primitiva analítica (ej. `e^(-x²)`, `sin(x)/x`), o provienen de datos experimentales sin fórmula explícita. En esos casos, los métodos numéricos permiten aproximar el valor de la integral dividiendo el intervalo `[a, b]` en `n` subintervalos de ancho `h = (b-a)/n` y sumando áreas de figuras geométricas simples.

---

## Regla del Trapecio

### Idea

Aproxima el área bajo la curva usando trapecios. En cada subintervalo, la función se reemplaza por una línea recta entre los extremos:

```
∫[a,b] f(x) dx ≈ (h/2) · [f(x₀) + 2f(x₁) + 2f(x₂) + ... + 2f(xₙ₋₁) + f(xₙ)]
```

### Error de truncación

- **Local** (por subintervalo): O(h³)
- **Global** (total): O(h²) — al duplicar `n`, el error se divide entre 4

La fórmula exacta del error global es:

```
E = -(b-a)³ / (12n²) · f''(ξ),   ξ ∈ [a, b]
```

### Grado de exactitud polinomial

**1** — integra exactamente polinomios de grado ≤ 1 (líneas rectas). Para funciones cuadráticas o superiores introduce error.

### Uso en ChuspaNumeric

```javascript
import { trapezoidal } from 'ChuspaNumeric';
const resultado = trapezoidal(f, 0, 1, 100);
```

---

## Simpson 1/3

### Idea

Ajusta parábolas (polinomios de grado 2) en cada par de subintervalos. Los coeficientes alternan 4 y 2:

```
∫[a,b] f(x) dx ≈ (h/3) · [f(x₀) + 4f(x₁) + 2f(x₂) + 4f(x₃) + ... + 4f(xₙ₋₁) + f(xₙ)]
```

**Requisito:** `n` debe ser par.

### Error de truncación

- **Local**: O(h⁵)
- **Global**: O(h⁴) — al duplicar `n`, el error se divide entre 16

La fórmula exacta del error global es:

```
E = -(b-a)⁵ / (180n⁴) · f⁽⁴⁾(ξ),   ξ ∈ [a, b]
```

### Grado de exactitud polinomial

**3** — aunque usa parábolas, integra exactamente polinomios de grado ≤ 3 (propiedad especial de los coeficientes de Simpson). Es el doble que el Trapecio.

### Uso en ChuspaNumeric

```javascript
import { simpson13 } from 'ChuspaNumeric';
const { resultado } = simpson13({ f, a: 0, b: 1, n: 100 });
```

---

## Simpson 3/8

### Idea

Variante de Simpson que ajusta polinomios de grado 3 en grupos de tres subintervalos. Los coeficientes son 3 y 2 alternando:

```
∫[a,b] f(x) dx ≈ (3h/8) · [f(x₀) + 3f(x₁) + 3f(x₂) + 2f(x₃) + 3f(x₄) + ... + f(xₙ)]
```

**Requisito:** `n` debe ser múltiplo de 3.

### Error de truncación

- **Local**: O(h⁵)
- **Global**: O(h⁴) — igual que Simpson 1/3

La fórmula exacta del error global es:

```
E = -(b-a)⁵ / (80n⁴) · f⁽⁴⁾(ξ),   ξ ∈ [a, b]
```

Nótese que la constante es mayor que en Simpson 1/3 (`80` vs `180`), por lo que Simpson 1/3 es ligeramente más preciso para el mismo `n`.

### Grado de exactitud polinomial

**3** — igual que Simpson 1/3.

### Uso en ChuspaNumeric

```javascript
import { simpson38 } from 'ChuspaNumeric';
const { resultado } = simpson38({ f, a: 0, b: 1, n: 99 });
```

---

## Cuadratura de Gauss-Legendre

### Idea

A diferencia de los métodos anteriores que usan puntos igualmente espaciados, Gauss-Legendre elige los puntos de evaluación (`nodos`) y sus pesos de forma óptima para maximizar la precisión con el menor número de evaluaciones posible:

```
∫[-1,1] f(t) dt ≈ Σ wᵢ · f(tᵢ)
```

Para integrar en `[a, b]` se aplica el cambio de variable `x = ((b-a)t + (b+a)) / 2`.

### Error de truncación

Con `n` puntos de Gauss, el error es:

```
E = (b-a)^(2n+1) · (n!)⁴ / ((2n+1)·((2n)!)³) · f^(2n)(ξ)
```

En la práctica, con solo **5 puntos** Gauss-Legendre integra exactamente polinomios de hasta grado 9.

### Grado de exactitud polinomial

**2n - 1** para `n` puntos de Gauss. Es el más alto posible para cualquier fórmula que use `n` evaluaciones.

| Puntos n | Grado de exactitud |
|---|---|
| 1 | 1 |
| 2 | 3 |
| 3 | 5 |
| 4 | 7 |
| 5 | 9 |

---

## Tabla Comparativa

| Método | Error global | Grado de exactitud | Requisito de n | Evaluaciones de f |
|---|---|---|---|---|
| Trapecio | O(h²) | 1 | n ≥ 1 | n + 1 |
| Simpson 1/3 | O(h⁴) | 3 | n par | n + 1 |
| Simpson 3/8 | O(h⁴) | 3 | n múltiplo de 3 | n + 1 |
| Gauss-Legendre (n pts) | O(h^(2n)) | 2n - 1 | — | n |

---

## ¿Cómo elegir n?

El número de subintervalos `n` determina directamente la precisión. La regla práctica es:

### Por error deseado

Despejando `n` de la fórmula de error:

**Trapecio** — para error `ε`:
```
n ≥ √( (b-a)³ · max|f''| / (12ε) )
```

**Simpson 1/3** — para error `ε`:
```
n ≥ ⁴√( (b-a)⁵ · max|f⁽⁴⁾| / (180ε) )
```

### Reglas empíricas

| Precisión deseada | Trapecio | Simpson 1/3 |
|---|---|---|
| 1 decimal (ε ≈ 0.05) | n ≈ 10 | n ≈ 4 |
| 3 decimales (ε ≈ 0.0005) | n ≈ 100 | n ≈ 10 |
| 6 decimales (ε ≈ 1e-6) | n ≈ 1000 | n ≈ 100 |

Simpson 1/3 requiere **10 veces menos subintervalos** que el Trapecio para la misma precisión.

### Verificación por duplicación

Una forma confiable es comparar el resultado con `n` y `2n`. Si la diferencia es menor que la tolerancia deseada, `n` es suficiente.

---

## Comparación de Precisión: ∫₀¹ x² dx = 1/3

| n | Trapecio | Error | Simpson 1/3 | Error | Simpson 3/8 | Error |
|---|---|---|---|---|---|---|
| 4 | 0.343750 | 0.010417 | 0.333333 | ~0 | 0.333333 | ~0 |
| 10 | 0.335000 | 0.001667 | 0.333333 | ~0 | 0.333333 | ~0 |
| 100 | 0.333350 | 0.000017 | 0.333333 | ~0 | 0.333333 | ~0 |

Para `f(x) = x²` (polinomio de grado 2), Simpson integra exactamente desde `n = 2` porque su grado de exactitud es 3. El Trapecio siempre tiene error porque su grado de exactitud es solo 1.

