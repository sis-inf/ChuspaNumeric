# Número de condición de matrices

## ¿Qué mide el número de condición?

El **número de condición** `κ(A)` de una matriz cuadrada `A` mide cuánto puede amplificarse el error de los datos de entrada al resolver el sistema lineal `A·x = b`. En términos prácticos: si los datos de entrada `b` tienen un error relativo de `ε`, la solución `x` puede tener un error relativo de hasta `κ(A) · ε`.

- `κ(A) ≈ 1` → matriz **bien condicionada**: pequeños errores en `b` producen pequeños errores en `x`.
- `κ(A) >> 1` → matriz **mal condicionada**: pequeños errores en `b` producen errores mucho mayores en `x`.
- `κ(A) = ∞` → matriz singular: el sistema no tiene solución única.

Esto es relevante para ChuspaNumeric porque todos los métodos numéricos trabajan con aritmética de punto flotante (IEEE 754, ≈15 dígitos de precisión). Si `κ(A) ≈ 1e10`, se pierden aproximadamente 10 dígitos de precisión en la solución, lo que puede llevar a resultados completamente incorrectos incluso cuando el algoritmo funciona "sin errores".

---

## Definición matemática

El número de condición se define como:

```
κ(A) = ||A|| · ||A⁻¹||
```

donde `||·||` es cualquier norma matricial consistente. El valor exacto de `κ(A)` depende de la norma elegida, pero el **orden de magnitud** es el mismo para normas razonables.

En ChuspaNumeric, la norma disponible para matrices es la **norma de Frobenius** (`normaFrobenius` en `src/matricial/norma_matriz.js`):

```
||A||_F = sqrt( Σ aᵢⱼ² )
```

Por lo tanto, el número de condición estimado con norma de Frobenius es:

```
κ_F(A) = ||A||_F · ||A⁻¹||_F
```

> **Nota sobre implementación**: ChuspaNumeric no tiene una función `numeroCondicion` dedicada al momento de escribir este documento. El cálculo se hace combinando `normaFrobenius` (disponible en `src/matricial/norma_matriz.js`) con la inversa de `A`, que puede obtenerse resolviendo `n` sistemas lineales con vectores canónicos como términos independientes. El ejemplo de código más abajo muestra exactamente cómo hacerlo.

---

## Cómo interpretarlo

| Rango de κ(A) | Interpretación |
|---|---|
| `1` a `10` | Excelente condicionamiento — solución confiable |
| `10` a `1e3` | Buen condicionamiento — precisión completa con IEEE 754 |
| `1e3` a `1e6` | Condicionamiento moderado — posible pérdida de 3–6 dígitos |
| `1e6` a `1e10` | Mal condicionamiento — resultados con precaución |
| `> 1e10` | Muy mal condicionamiento — resultados probablemente sin sentido |
| `∞` | Matriz singular — sistema sin solución única |

La regla práctica es: si `κ(A) ≈ 10^k`, se pierden aproximadamente `k` dígitos de precisión. Con aritmética de doble precisión (≈15 dígitos significativos), una matriz con `κ ≈ 1e12` deja solo 3 dígitos confiables en la solución.

---

## Ejemplo: la matriz de Hilbert

La **matriz de Hilbert** de orden `n` es un ejemplo clásico de matriz mal condicionada. Sus elementos son:

```
Hᵢⱼ = 1 / (i + j - 1)
```

Por ejemplo, para `n = 3`:

```
H₃ = | 1     1/2   1/3  |
     | 1/2   1/3   1/4  |
     | 1/3   1/4   1/5  |
```

### Código para calcular κ(H)

```js
import { normaFrobenius } from 'ChuspaNumeric/src/matricial/norma_matriz.js';
import { gauss } from 'ChuspaNumeric/src/lineales/gauss.js';

// Generar la matriz de Hilbert de orden n
function hilbert(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => 1 / (i + j + 1))
  );
}

// Calcular la inversa de A resolviendo n sistemas con vectores canónicos
function invertir(A) {
  const n = A.length;
  const inv = Array.from({ length: n }, () => new Array(n));
  for (let col = 0; col < n; col++) {
    const e = Array(n).fill(0);
    e[col] = 1;
    const res = gauss({ A: A.map(fila => [...fila]), b: e });
    res.resultado.forEach((val, row) => { inv[row][col] = val; });
  }
  return inv;
}

// Número de condición con norma de Frobenius
function numeroCondicion(A) {
  return normaFrobenius(A) * normaFrobenius(invertir(A));
}

// Comparar condicionamiento para distintos tamaños
const H3 = hilbert(3);
const H4 = hilbert(4);
const H5 = hilbert(5);

console.log('κ(H₃) ≈', numeroCondicion(H3).toExponential(3));  // 5.262e+2
console.log('κ(H₄) ≈', numeroCondicion(H4).toExponential(3));  // 1.561e+4
console.log('κ(H₅) ≈', numeroCondicion(H5).toExponential(3));  // 4.808e+5
```

### Resultados reales

| n | `||H||_F` | `κ(H)` estimado | Dígitos perdidos |
|---|---|---|---|
| 3 | 1.413624 | 5.26 × 10² | ~2 |
| 4 | 1.509734 | 1.56 × 10⁴ | ~4 |
| 5 | 1.580906 | 4.81 × 10⁵ | ~5 |

El número de condición crece drásticamente con el tamaño: pasar de `n=3` a `n=5` multiplica `κ` por casi 1000. Para `n=10`, la matriz de Hilbert tiene `κ ≈ 10¹³`, lo que significa que la solución puede no tener ningún dígito confiable con aritmética estándar.

---

## Contraste: matrices bien condicionadas

Para que el concepto sea concreto, vale la pena comparar con matrices que tienen buen condicionamiento:

```js
import { normaFrobenius } from 'ChuspaNumeric/src/matricial/norma_matriz.js';

// La identidad tiene κ = 1 (caso ideal)
const I3 = [[1,0,0],[0,1,0],[0,0,1]];
// κ_F(I) = √3 · √3 = 3 (por la norma de Frobenius)

// Una matriz diagonal también está bien condicionada
const D = [[2,0,0],[0,3,0],[0,0,4]];
// κ_F(D) ≈ 3.5 — relación entre el mayor y menor elemento diagonal
```

| Matriz | `κ(A)` | Interpretación |
|---|---|---|
| Identidad 3×3 | 3.00 | Condicionamiento perfecto |
| Diagonal [2,3,4] | 3.51 | Condicionamiento excelente |
| Hilbert 3×3 | 526 | Condicionamiento moderado |
| Hilbert 5×5 | 480 800 | Mal condicionado (~5 dígitos perdidos) |

---

## Relación con Cholesky y sistemas lineales en ChuspaNumeric

La razón por la que el número de condición es especialmente importante en ChuspaNumeric es que varios métodos del módulo `lineales/` pueden producir resultados incorrectos con matrices mal condicionadas sin lanzar ningún error:

- `gauss` y `gaussJordan` — sin pivoteo parcial, matrices casi-singulares pueden pasar el umbral de pivote y producir soluciones con error grande sin advertencia.
- `jacobi` y `gaussSeidel` — convergen según el radio espectral; un mal condicionamiento severo puede hacer que converjan a una solución incorrecta.
- `descomposicionCholesky` + `resolverCholesky` — como se muestra en `docs/casos-de-uso-avanzados.md` (Escenario 2), la matriz de Hilbert 3×3 se resuelve con error `1e-14` usando Cholesky porque `n=3` es pequeño; para `n≥10`, el error acumulado sería apreciable.

El número de condición permite anticipar estos problemas **antes** de ejecutar el método, no descubrirlos después de obtener un resultado sospechoso.

---

## Cuándo calcular el número de condición

Calcular `κ(A)` tiene sentido cuando:

- La solución obtenida parece razonable pero no coincide con valores de referencia o con la física del problema.
- Se trabaja con matrices provenientes de discretización de ecuaciones diferenciales (donde el mal condicionamiento es común).
- Se comparan resultados de distintos métodos y difieren significativamente entre sí.
- Se usa una tolerancia muy pequeña (`1e-10` o menor) y el método no converge.

No es necesario calcularlo para sistemas pequeños con matrices con estructura conocida (diagonales, tridiagonales, diagonalmente dominantes).
