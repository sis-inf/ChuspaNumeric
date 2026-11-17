# Benchmarks

Este documento registra los tiempos de ejecución de los 20 métodos numéricos de ChuspaNumeric, medidos con el script [`scripts/benchmark.js`](../scripts/benchmark.js).

## Entorno de referencia

| Campo | Valor |
|---|---|
| Node.js | v22.22.2 |
| Sistema operativo | Linux x64 (contenedor) |
| CPU | Intel(R) Xeon(R) Processor @ 2.80GHz (1 vCPU asignada) |
| RAM | 4 GB |
| Repeticiones por método | 1000 (con 5 ejecuciones de calentamiento previas, descartadas) |
| Medición | `medirTiempo()` de `src/core/contrato.js`, basado en `performance.now()` |

> ⚠️ Los tiempos se midieron en un contenedor compartido, no en hardware dedicado. Los valores absolutos pueden variar entre ejecuciones y entre máquinas; lo relevante es el orden de magnitud y la comparación relativa entre métodos. Para volver a medir en tu propio entorno, ejecuta:
>
> ```bash
> node scripts/benchmark.js
> ```

## Metodología

Cada método se ejecuta con un caso de prueba representativo de tamaño fijo (ver el script para los parámetros exactos de cada caso: sistemas de 3×3, búsqueda de raíces de `x² - 4`, 4 puntos de interpolación, integrales en `[0, 1]` con 100 subintervalos, y EDOs con paso `h = 0.01` en `[0, 1]`). Se realizan 5 ejecuciones de calentamiento (para evitar medir la compilación JIT inicial) seguidas de 1000 repeticiones, de las cuales se reporta el tiempo promedio.

Las **iteraciones/segundo** se calculan como `1000 / tiempo_promedio_ms` y representan cuántas veces podría ejecutarse el método completo en un segundo, no el número de iteraciones internas del algoritmo (bisección, Jacobi, etc.).

## Resultados

### Sistemas de ecuaciones lineales

| Método | Función | Tiempo promedio (ms) | Iteraciones/segundo |
|---|---|---|---|
| Eliminación de Gauss | `gauss` | 0.0181 | 55 123 |
| Gauss-Jordan | `gaussJordan` | 0.0327 | 30 575 |
| Jacobi | `jacobi` | 0.0526 | 19 029 |
| Gauss-Seidel | `gaussSeidel` | 0.0150 | 66 845 |
| Descomposición LU | `lu` | 0.0250 | 40 065 |

### Ecuaciones no lineales

| Método | Función | Tiempo promedio (ms) | Iteraciones/segundo |
|---|---|---|---|
| Bisección | `biseccion` | 0.0189 | 52 937 |
| Falsa posición | `falsaPosicion` | 0.0119 | 84 264 |
| Newton-Raphson | `newtonRaphson` | 0.0148 | 67 522 |
| Secante | `secante` | 0.0148 | 67 592 |
| Punto fijo | `puntoFijo` | 0.0032 | 317 386 |
| Müller | `muller` | 0.0107 | 93 633 |

### Interpolación

| Método | Función | Tiempo promedio (ms) | Iteraciones/segundo |
|---|---|---|---|
| Lagrange | `lagrange` | 0.0070 | 143 040 |
| Diferencias divididas de Newton | `newtonDD` | 0.0096 | 104 632 |
| Splines cúbicos | `splines` | 0.0059 | 169 858 |

### Integración numérica

| Método | Función | Tiempo promedio (ms) | Iteraciones/segundo |
|---|---|---|---|
| Regla del trapecio | `trapecio` | 0.0168 | 59 673 |
| Simpson 1/3 | `simpson13` | 0.0089 | 111 999 |
| Simpson 3/8 | `simpson38` | 0.0110 | 90 771 |

### Ecuaciones diferenciales ordinarias (EDO)

| Método | Función | Tiempo promedio (ms) | Iteraciones/segundo |
|---|---|---|---|
| Euler | `euler` | 0.0092 | 108 383 |
| Euler mejorado (Heun) | `eulerMejorado` | 0.0128 | 78 108 |
| Runge-Kutta 4 | `rungeKutta4` | 0.0155 | 64 593 |

## Observaciones

- Todos los métodos resuelven sus respectivos casos de prueba en **menos de 0.06 ms en promedio**, suficientemente rápido para uso interactivo o en lote.
- Los métodos iterativos para sistemas lineales (`jacobi`) son más lentos que los directos (`gauss`, `lu`) para matrices pequeñas como la usada en este benchmark, lo cual es esperado: su ventaja aparece en sistemas grandes y dispersos, no reflejados en este caso de prueba de 3×3.
- `puntoFijo` resultó el método más rápido en este benchmark, ya que el caso de prueba converge en muy pocas iteraciones para la función de iteración utilizada.
- Las EDO (`euler`, `eulerMejorado`, `rungeKutta4`) muestran tiempos crecientes en ese orden, consistente con que cada método evalúa la función `f` más veces por paso (Euler: 1 vez, Euler mejorado: 2 veces, RK4: 4 veces).
