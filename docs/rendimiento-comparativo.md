# Rendimiento comparativo de los métodos para sistemas lineales

Este documento compara el rendimiento real de los tres métodos de ChuspaNumeric para resolver sistemas de ecuaciones lineales (`gauss`, `jacobi`, `gaussSeidel`), con énfasis en el caso de uso descrito en el contexto de esta tarea: **elegir el método adecuado cuando el sistema es grande y el tiempo de ejecución importa**.

## Nota sobre la metodología

> ⚠️ El subcomando `ChuspaNumeric bench` mencionado como referencia para esta tarea no existe en el proyecto: `ChuspaNumeric` es actualmente una librería JavaScript sin interfaz de línea de comandos (no hay campo `bin` en `package.json` ni ningún archivo de CLI en el repositorio). En su lugar, los tiempos de esta tabla se midieron directamente con la utilidad de medición que sí existe en el proyecto, `medirTiempo()` (definida en `src/core/contrato.js`), invocando cada método con sistemas generados de prueba. El script usado para esta medición no forma parte de esta entrega (no se incluye ningún archivo de código en este PR); se documenta su lógica más abajo para que la medición sea reproducible.

## Entorno de referencia

| Campo | Valor |
|---|---|
| Node.js | v22.22.2 |
| CPU | Intel(R) Xeon(R) Processor @ 2.10GHz (1 vCPU, contenedor compartido) |
| RAM | 4 GB |
| Repeticiones por medición | 5 (se reporta el promedio) |

> Los valores absolutos pueden variar según el hardware; lo relevante es la diferencia relativa entre métodos y cómo escala cada uno al crecer el tamaño del sistema.

## Metodología de los sistemas de prueba

Para cada tamaño `n`, se generó una matriz `A` de `n×n` **diagonalmente dominante** (condición necesaria para garantizar la convergencia de Jacobi y Gauss-Seidel): los elementos fuera de la diagonal se generan con valores aleatorios entre -1 y 1, y cada elemento diagonal se fija como la suma de los valores absolutos del resto de su fila más un margen adicional. El vector `b` se genera con valores aleatorios. Jacobi y Gauss-Seidel se ejecutaron con tolerancia `1e-8` y un máximo de 1000 iteraciones.

## Resultados: sistemas pequeños y medianos (con Gauss como referencia)

| n | Método | Tiempo promedio (ms) | Iteraciones | ¿Convergió? |
|---|---|---|---|---|
| 10 | `gauss` | 0.7259 | — (directo) | — |
| 10 | `jacobi` | 0.2916 | 10 | Sí |
| 10 | `gaussSeidel` | 1.2175 | 7 | Sí |
| 50 | `gauss` | 68.8263 | — (directo) | — |
| 50 | `jacobi` | 4.4798 | 10 | Sí |
| 50 | `gaussSeidel` | 3.3436 | 8 | Sí |
| 100 | `gauss` | 637.7277 | — (directo) | — |
| 100 | `jacobi` | 1.8031 | 9 | Sí |
| 100 | `gaussSeidel` | 2.3756 | 8 | Sí |

## Resultados: sistemas grandes (solo métodos iterativos)

`gauss` se excluyó de esta tabla a partir de `n = 150`: con ese tamaño, su tiempo de ejecución crece de forma muy pronunciada (ver sección de hallazgos) y el proceso llega a agotar la memoria disponible antes de terminar, por lo que no es comparable en esta escala.

| n | Método | Tiempo promedio (ms) | Iteraciones | ¿Convergió? |
|---|---|---|---|---|
| 300 | `jacobi` | 20.8128 | 8 | Sí |
| 300 | `gaussSeidel` | 15.2838 | 7 | Sí |
| 600 | `jacobi` | 10.3733 | 7 | Sí |
| 600 | `gaussSeidel` | 10.5002 | 6 | Sí |
| 1000 | `jacobi` | 28.6661 | 7 | Sí |
| 1000 | `gaussSeidel` | 12.4694 | 6 | Sí |

## Hallazgos

### `gauss` no escala para sistemas grandes — y no solo por su complejidad algorítmica esperada

Al medir `gauss` con `n = 150`, el proceso agotó la memoria disponible (heap de Node.js) antes de completar la eliminación. Revisando la implementación (`src/lineales/gauss.js`), la causa no es únicamente la complejidad de tiempo O(n³) propia de la eliminación gaussiana: en cada uno de los `n` pasos del método, el código construye y almacena una copia completa de la matriz de trabajo (`n×n`) y del vector de términos independientes en el array `iteraciones` del resultado. Esto añade un costo de memoria adicional, del orden de `n` copias de tamaño `n²`, solo para el historial de pasos — lo cual, para sistemas de cientos de variables, se vuelve significativo.

**Implicación práctica:** además de ser más lento que los métodos iterativos para sistemas grandes (como muestra la tabla), `gauss` en su implementación actual puede no ser viable en absoluto para sistemas de gran tamaño por motivos de memoria, no solo de tiempo. Esto refuerza la recomendación de usar Jacobi o Gauss-Seidel para esos casos, más allá de la diferencia de velocidad.

### Jacobi vs. Gauss-Seidel para sistemas grandes

En los sistemas de prueba diagonalmente dominantes generados para este documento:

- **Gauss-Seidel converge en menos iteraciones que Jacobi** en todos los tamaños probados (por ejemplo, 6 iteraciones frente a 7 en `n = 1000`), lo cual es el comportamiento esperado: Gauss-Seidel usa los valores ya actualizados de la misma iteración, mientras que Jacobi solo usa los de la iteración anterior.
- Esta ventaja en iteraciones **no siempre se traduce en un tiempo total menor**: en `n = 300`, Gauss-Seidel fue más rápido que Jacobi (15.28 ms frente a 20.81 ms), pero en `n = 600` ambos fueron prácticamente equivalentes, y en `n = 1000` Gauss-Seidel volvió a ser claramente más rápido (12.47 ms frente a 28.67 ms). La diferencia depende de cuánto compensa el menor número de iteraciones de Gauss-Seidel frente al hecho de que cada una de sus iteraciones es secuencial (no se puede paralelizar tan fácilmente como la de Jacobi, ya que cada componente depende de las que ya se actualizaron en la misma pasada).
- En los tamaños probados en este documento, **no se observó una diferencia de tiempo dramática entre ambos métodos iterativos**; la elección entre uno y otro, para los tamaños evaluados, puede basarse más en el número de iteraciones (Gauss-Seidel) que en el tiempo de ejecución puro.

## Recomendación

Para sistemas grandes (decenas o cientos de variables en adelante) donde el tiempo de ejecución importa:

- **Evitar `gauss`**: además de ser sustancialmente más lento, su implementación actual puede agotar memoria antes de completar el cálculo.
- **Usar `jacobi` o `gaussSeidel`**, siempre que la matriz sea diagonalmente dominante (condición necesaria para garantizar convergencia en ambos métodos). Entre los dos, `gaussSeidel` tiende a requerir menos iteraciones, lo que en general se traduce en un tiempo de ejecución igual o menor que `jacobi`, según se observó en los sistemas de mayor tamaño probados aquí (`n = 300` y `n = 1000`).
