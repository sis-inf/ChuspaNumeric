# Métodos para Sistemas de Ecuaciones Lineales

Esta guía explica los métodos disponibles en ChuspaNumeric para resolver sistemas de la forma **Ax = b**, donde `A` es una matriz de coeficientes, `x` es el vector de incógnitas y `b` es el vector de términos independientes.

---

## Métodos directos vs. métodos iterativos

Los métodos para resolver sistemas lineales se dividen en dos grandes familias:

| Característica | Métodos directos | Métodos iterativos |
|---|---|---|
| Estrategia | Transforman el sistema mediante operaciones exactas | Parten de una aproximación inicial y refinan en cada paso |
| Resultado | Solución exacta (salvo errores de redondeo) | Solución aproximada dentro de una tolerancia |
| Costo computacional | O(n³) operaciones | Depende de la velocidad de convergencia |
| Sensibilidad al tamaño | Costosos para sistemas grandes (n > 1000) | Más eficientes en sistemas grandes y dispersos |
| Requisito especial | Ninguno adicional | La matriz debe satisfacer criterios de convergencia |
| Ejemplos en ChuspaNumeric | `gauss`, `gaussJordan` | `jacobi` |

**¿Cuándo usar cada uno?**

- Usa un **método directo** cuando el sistema es de tamaño moderado (n ≤ varios cientos), la matriz es densa y necesitas una solución exacta en un solo paso.
- Usa un **método iterativo** cuando el sistema es grande y disperso (muchos ceros), o cuando una aproximación con tolerancia controlada es suficiente.

---

## Métodos directos

### Eliminación de Gauss

La eliminación de Gauss transforma la matriz aumentada `[A|b]` en una forma triangular superior mediante operaciones de fila. Luego resuelve el sistema por **sustitución hacia atrás**.

**Costo:** O(n³) operaciones en la fase de eliminación, O(n²) en la sustitución.

**Limitación:** Si un pivote es cero, el método falla sin pivoteo. La implementación actual lanza un error en ese caso.

**Cuándo usarlo:** Sistema general de tamaño moderado donde no se requiere resolver múltiples sistemas con la misma matriz.

**Ejemplo:**

```js
import { gauss } from 'ChuspaNumeric';

const A = [
  [2, 1, -1],
  [-3, -1, 2],
  [-2, 1, 2]
];
const b = [8, -11, -3];

const { resultado, iteraciones } = gauss({ A, b });
console.log(resultado); // [2, 3, -1]
```

---

### Gauss-Jordan

Gauss-Jordan extiende la eliminación de Gauss hasta reducir la matriz aumentada a la **forma escalonada reducida** (matriz identidad). La solución se lee directamente de la última columna, sin necesidad de sustitución.

**Costo:** Aproximadamente 50 % más operaciones que Gauss estándar, pero elimina la fase de sustitución.

**Ventaja sobre Gauss:** Produce la solución directamente y puede usarse para calcular la inversa de una matriz aumentando con la identidad.

**Cuándo usarlo:** Cuando se necesita la inversa de la matriz o se prefiere evitar la sustitución hacia atrás.

**Ejemplo:**

```js
import { gaussJordan } from 'ChuspaNumeric';

const A = [
  [1, 2,  1],
  [2, 3,  0],
  [-1, 1, 3]
];
const b = [9, 10, 5];

const { resultado } = gaussJordan({ A, b });
console.log(resultado); // [1, 2, 4]
```

---

### LU (descomposición)

La descomposición LU factoriza la matriz `A` en el producto de una matriz triangular inferior `L` y una triangular superior `U`, de modo que `A = LU`. El sistema original se reduce a dos sistemas triangulares:

1. `Ly = b` → se resuelve por sustitución hacia adelante.
2. `Ux = y` → se resuelve por sustitución hacia atrás.

**Ventaja clave:** Una vez calculada la factorización LU (costo O(n³)), resolver para un nuevo vector `b` cuesta solo O(n²). Esto la hace ideal cuando se necesita resolver múltiples sistemas con la misma matriz `A` pero diferentes vectores `b`.

**Cuándo usarlo:** Análisis de sensibilidad, simulaciones con variación del término independiente, sistemas de control donde `A` es fija y `b` cambia en cada paso.

**Ejemplo:**

```js
import { lu } from 'ChuspaNumeric';

const A = [[4, 3], [6, 3]];
const b = [10, 12];

const { resultado } = lu({ A, b });
console.log(resultado.x); // [1, 2]
console.log(resultado.L); // matriz triangular inferior
console.log(resultado.U); // matriz triangular superior
```

La función devuelve `x` (solución), `L` y `U` (factores), lo que permite verificar que `L · U = A` y reutilizar la factorización para resolver con otros vectores `b`.

---

### Cholesky

Cholesky es una variante de LU especializada para matrices **simétricas definidas positivas (SPD)**. Factoriza `A = LLᵀ`, donde `L` es triangular inferior. Aprovecha la simetría para reducir el costo a la mitad respecto a LU general.

**Requisito:** La matriz `A` debe ser:
- Simétrica: `A[i][j] = A[j][i]`
- Definida positiva: todos los valores propios son positivos (equivalentemente, todos los pivotes de Gauss son positivos)

**Cuándo usarlo:** Sistemas que provienen de modelos de elementos finitos, mínimos cuadrados o cualquier problema donde la matriz es naturalmente SPD.

> **Estado:** Pendiente de implementación en ChuspaNumeric.

---

## Métodos iterativos

### Jacobi

El método de Jacobi parte de una aproximación inicial `x0` y actualiza **todas las incógnitas simultáneamente** usando los valores de la iteración anterior:

```
xᵢ⁽ᵏ⁺¹⁾ = (bᵢ - Σⱼ≠ᵢ Aᵢⱼ · xⱼ⁽ᵏ⁾) / Aᵢᵢ
```

Itera hasta que la norma del error entre dos aproximaciones consecutivas sea menor que la tolerancia especificada.

**Ejemplo:**

```js
import { jacobi } from 'ChuspaNumeric';

const A = [
  [10, -1, 2],
  [-1,  11, -1],
  [2,  -1, 10]
];
const b = [6, 25, -11];
const x0 = [0, 0, 0];

const { resultado, iteraciones, convergio } = jacobi({
  A,
  b,
  x0,
  tolerancia: 1e-6,
  maxIter: 100
});

console.log(convergio);  // true
console.log(resultado);  // aprox. [1, 2, -1]
```

---

### Gauss-Seidel

Gauss-Seidel es una mejora del método de Jacobi. En lugar de usar solo los valores de la iteración anterior, **usa inmediatamente** cada valor recién calculado dentro de la misma iteración:

```
xᵢ⁽ᵏ⁺¹⁾ = (bᵢ - Σⱼ<ᵢ Aᵢⱼ · xⱼ⁽ᵏ⁺¹⁾ - Σⱼ>ᵢ Aᵢⱼ · xⱼ⁽ᵏ⁾) / Aᵢᵢ
```

**Comparación con Jacobi:**

| Aspecto | Jacobi | Gauss-Seidel |
|---|---|---|
| Actualización | Todas al final de cada iteración | Inmediata al calcular cada componente |
| Velocidad de convergencia | Más lenta | Generalmente el doble de rápida |
| Memoria | Requiere dos vectores (`x` actual y `x` nuevo) | Trabaja sobre un solo vector |
| Paralelización | Fácilmente paralelizable | Más difícil de paralelizar |

En la mayoría de los casos prácticos, Gauss-Seidel converge en aproximadamente la mitad de iteraciones que Jacobi para la misma tolerancia.

> **Estado:** Pendiente de implementación en ChuspaNumeric.

---

## Criterio de convergencia para métodos iterativos

Los métodos iterativos no siempre convergen. El criterio más común que **garantiza** la convergencia es la **diagonal dominante estricta**:

> Una matriz `A` es diagonal dominante estricta si, para cada fila `i`, el valor absoluto del elemento diagonal es mayor que la suma de los valores absolutos del resto de elementos en esa fila:
>
> `|Aᵢᵢ| > Σⱼ≠ᵢ |Aᵢⱼ|`  para todo `i`

Si tu matriz cumple esta condición, tanto Jacobi como Gauss-Seidel convergerán desde cualquier punto inicial.

**Ejemplo de matriz diagonal dominante:**

```
|10| > |-1| + |2|   →  10 > 3  ✓
|11| > |-1| + |-1|  →  11 > 2  ✓
|10| > |2|  + |-1|  →  10 > 3  ✓
```

**¿Qué pasa si la matriz no es diagonal dominante?**

La convergencia no está garantizada, pero puede ocurrir de todas formas dependiendo del punto de partida y de la estructura de la matriz. Si el método diverge o converge muy lento, considera:

1. Reordenar las ecuaciones para intentar obtener diagonal dominante.
2. Usar un método directo (Gauss o Gauss-Jordan) en su lugar.

---

## Tabla comparativa de métodos

| Método | Tipo | Costo | Múltiples `b` | Requisito de la matriz | Estado |
|---|---|---|---|---|---|
| Gauss | Directo | O(n³) | Ineficiente | General (pivote ≠ 0) | Implementado |
| Gauss-Jordan | Directo | O(n³) | Ineficiente | General (pivote ≠ 0) | Implementado |
| LU | Directo | O(n³) factorización + O(n²) por sistema | Muy eficiente | General | Implementado |
| Cholesky | Directo | ~O(n³/2) | Muy eficiente | Simétrica definida positiva (SPD) | Pendiente |
| Jacobi | Iterativo | O(n²) por iteración | Requiere reiniciar | Diagonal dominante recomendada | Implementado |
| Gauss-Seidel | Iterativo | O(n²) por iteración | Requiere reiniciar | Diagonal dominante recomendada |Pendiente |
---

## Recomendaciones prácticas

Antes de resolver un sistema de ecuaciones lineales se recomienda:

1. Verificar que la matriz no sea singular.
2. Revisar si existe diagonal dominante cuando se utilicen métodos iterativos.
3. Utilizar LU cuando se resolverán varios sistemas con la misma matriz.
4. Aprovechar Cholesky cuando la matriz sea simétrica definida positiva.
5. Comparar los resultados obtenidos con diferentes métodos cuando sea posible.

---

## Aplicaciones

Los sistemas de ecuaciones lineales aparecen en numerosas áreas de la ciencia e ingeniería:

- Análisis de circuitos eléctricos.
- Modelado de estructuras mecánicas.
- Simulación de fenómenos físicos.
- Ajuste de datos mediante regresión.
- Problemas de optimización.
- Computación gráfica y procesamiento de imágenes.

La elección adecuada del método puede reducir significativamente el tiempo de cálculo y mejorar la estabilidad numérica de la solución.
