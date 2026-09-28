# Métodos implementados

Este documento consolida el estado de los métodos y utilidades numéricas disponibles en el proyecto.

La tabla reemplaza los documentos separados `metodos.md` y `metodos-implementados.md`, unificando la información de estado, archivo fuente, categoría y cobertura de prueba.

| Método | Categoría | Archivo | Descripción breve | Estado | Cobertura de prueba |
|---|---|---|---|---|---|
| `regresionLineal` | Análisis | `src/analisis/ajuste_minimos_cuadrados.js` | Ajuste lineal por mínimos cuadrados. | Implementado | Pendiente |
| `regresionPolinomial` | Análisis | `src/analisis/ajuste_minimos_cuadrados.js` | Ajuste polinomial por mínimos cuadrados. | Implementado | Pendiente |
| `regresionNoLineal` | Análisis | `src/analisis/regresion_no_lineal.js` | Regresión no lineal mediante Gauss-Newton. | Implementado | Pendiente |
| `diferenciaCentrada` | Diferencias finitas | `src/diferencias/diferencia_centrada.js` | Aproxima derivadas usando diferencia centrada. | Implementado | Pendiente |
| `diferenciaCentradaSegundaDerivada` | Diferencias finitas | `src/diferencias/diferencia_centrada.js` | Aproxima segundas derivadas con diferencia centrada. | Implementado | Pendiente |
| `diferenciasAdelanteGrado1` | Diferencias finitas | `src/diferencias/diferencia_hacia_adelante.js` | Aproxima derivadas con diferencia hacia adelante. | Implementado | Pendiente |
| `euler` | EDO | `src/edo/euler.js` | Resuelve EDOs mediante el método de Euler. | Implementado | Pendiente |
| `eulerMejorado` | EDO | `src/edo/euler-mejorado.js` | Método de Euler mejorado. | Implementado | Pendiente |
| `metodHeun` | EDO | `src/edo/runge_kutta_2.js` | Método de Heun de segundo orden. | Implementado | Sí |
| `metodoPuntoMedio` | EDO | `src/edo/runge_kutta_2.js` | Método del punto medio de segundo orden. | Implementado | Sí |
| `rungeKutta4` | EDO | `src/edo/runge_kutta_4.js` | Método clásico de Runge-Kutta de cuarto orden. | Implementado | Pendiente |
| `derivative` | Integración/derivación | `src/integracion/derivative.js` | Cálculo numérico de derivadas. | Implementado | Pendiente |
| `trapecio` | Integración | `src/integracion/trapecio.js` | Integración numérica por regla del trapecio. | Implementado | Pendiente |
| `simpson13` | Integración | `src/integracion/simpson-13.js` | Integración por regla de Simpson 1/3. | Implementado | Pendiente |
| `simpson38` | Integración | `src/integracion/simpson-38.js` | Integración por regla de Simpson 3/8. | Implementado | Pendiente |
| `simpsonCompuesto` | Integración | `src/integracion/simpson_compuesto.js` | Variante compuesta del método de Simpson. | Implementado | Pendiente |
| `romberg` | Integración | `src/integracion/romberg.js` | Integración de Romberg usando extrapolación de Richardson. | Implementado | Sí |
| `integracionMonteCarlo` | Integración | `src/integracion/monte_carlo.js` | Integración multidimensional por Monte Carlo. | Implementado | Pendiente |
| `gaussLegendre` | Integración | `src/integracion/gauss_legendre.js` | Cuadratura de Gauss-Legendre para integración numérica. | Implementado | Sí |
| `lagrange` | Interpolación | `src/interpolacion/lagrange.js` | Interpolación polinómica de Lagrange. | Implementado | Sí |
| `linearInterpolation` | Interpolación | `src/interpolacion/linear.js` | Interpolación lineal entre puntos. | Implementado | Pendiente |
| `newtonDD` | Interpolación | `src/interpolacion/newton-dd.js` | Interpolación por diferencias divididas de Newton. | Implementado | Pendiente |
| `splines` | Interpolación | `src/interpolacion/splines.js` | Interpolación mediante splines. | Implementado | Pendiente |
| `splineCubicoNatural` | Interpolación | `src/interpolacion/spline_cubico.js` | Spline cúbico natural. | Implementado | Pendiente |
| `polyEval` | Interpolación/polinomios | `src/interpolacion/polyEval.js` | Evaluación de polinomios. | Implementado | Pendiente |
| `gauss` | Lineales | `src/lineales/gauss.js` | Eliminación gaussiana para sistemas lineales. | Implementado | Pendiente |
| `gaussPivoteoParcial` | Lineales | `src/lineales/gauss-pivoteo-parcial.js` | Eliminación de Gauss con pivoteo parcial. | Implementado | Pendiente |
| `gaussJordan` | Lineales | `src/lineales/gauss-jordan.js` | Resolución de sistemas por Gauss-Jordan. | Implementado | Pendiente |
| `jacobi` | Lineales | `src/lineales/jacobi.js` | Método iterativo de Jacobi. | Implementado | Pendiente |
| `gaussSeidel` | Lineales | `src/lineales/gauss-seidel.js` | Método iterativo de Gauss-Seidel. | Implementado | Pendiente |
| `lu` | Lineales | `src/lineales/lu.js` | Factorización LU. | Implementado | Pendiente |
| `descomposicionCholesky` | Lineales | `src/lineales/cholesky.js` | Descomposición de Cholesky. | Implementado | Pendiente |
| `resolverCholesky` | Lineales | `src/lineales/cholesky.js` | Resolución de sistemas usando Cholesky. | Implementado | Pendiente |
| `det2x2` | Lineales | `src/lineales/determinant.js` | Determinante de matrices 2x2. | Implementado | Pendiente |
| `det3x3` | Lineales | `src/lineales/determinant.js` | Determinante de matrices 3x3. | Implementado | Pendiente |
| `calcularInversa` | Lineales | `src/lineales/inversa.js` | Cálculo de la matriz inversa. | Implementado | Pendiente |
| `determinanteSarrus` | Matricial | `src/matricial/determinante_sarrus.js` | Determinante 3x3 mediante regla de Sarrus. | Implementado | Sí |
| `rango` | Matricial | `src/matricial/rango.js` | Cálculo del rango de una matriz. | Implementado | Pendiente |
| `normaEuclideana` | Matricial | `src/matricial/norma_matriz.js` | Norma euclidiana de matriz/vector. | Implementado | Sí |
| `normaInfinita` | Matricial | `src/matricial/norma_matriz.js` | Norma infinito. | Implementado | Sí |
| `normaFrobenius` | Matricial | `src/matricial/norma_matriz.js` | Norma de Frobenius. | Implementado | Sí |
| `sumaMatrices` | Matricial | `src/matricial/algebra_matrices.js` | Suma de matrices. | Implementado | Pendiente |
| `restaMatrices` | Matricial | `src/matricial/algebra_matrices.js` | Resta de matrices. | Implementado | Pendiente |
| `multiplicarMatrices` | Matricial | `src/matricial/algebra_matrices.js` | Producto de matrices. | Implementado | Pendiente |
| `transpuesta` | Matricial | `src/matricial/algebra_matrices.js` | Matriz transpuesta. | Implementado | Pendiente |
| `multiplicarEscalar` | Matricial | `src/matricial/algebra_matrices.js` | Multiplicación de matriz por escalar. | Implementado | Pendiente |
| `calcularNumeroCondicion` | Matricial | `src/matricial/numero_condicion.js` | Estimación del número de condición. | Implementado | Pendiente |
| `biseccion` | No lineales | `src/no-lineales/biseccion.js` | Búsqueda de raíces por bisección. | Implementado | Pendiente |
| `falsaPosicion` | No lineales | `src/no-lineales/falsa-posicion.js` | Método de falsa posición. | Implementado | Pendiente |
| `newtonRaphson` | No lineales | `src/no-lineales/newton-raphson.js` | Método de Newton-Raphson. | Implementado | Pendiente |
| `secante` | No lineales | `src/no-lineales/secante.js` | Método de la secante. | Implementado | Pendiente |
| `puntoFijo` | No lineales | `src/no-lineales/punto-fijo.js` | Iteración de punto fijo. | Implementado | Pendiente |
| `muller` | No lineales | `src/no-lineales/muller.js` | Método de Müller. | Implementado | Pendiente |
| `buscarTodasLasRaices` | No lineales | `src/no-lineales/buscar_raices.js` | Búsqueda de múltiples raíces por subintervalos. | Implementado | Pendiente |
| `evaluarHorner` | Polinomios | `src/polinomios/horner.js` | Evaluación de polinomios mediante Horner. | Implementado | Pendiente |
| `media` | Estadística | `src/utils/estadistica.js` | Media aritmética. | Implementado | Pendiente |
| `varianza` | Estadística | `src/utils/estadistica.js` | Varianza. | Implementado | Pendiente |
| `desviacionEstandar` | Estadística | `src/utils/estadistica.js` | Desviación estándar. | Implementado | Pendiente |
| `mediana` | Estadística | `src/utils/estadistica.js` | Mediana. | Implementado | Pendiente |
| `convertirLongitud` | Utilidades | `src/utils/unidades.js` | Conversión de unidades de longitud. | Implementado | Pendiente |
| `convertirTemperatura` | Utilidades | `src/utils/unidades.js` | Conversión de temperatura. | Implementado | Pendiente |
| `convertirPresion` | Utilidades | `src/utils/unidades.js` | Conversión de presión. | Implementado | Pendiente |
| `convertirEnergia` | Utilidades | `src/utils/unidades.js` | Conversión de energía. | Implementado | Pendiente |
| `sumaComplejos` | Utilidades | `src/utils/numeros_complejos.js` | Suma de números complejos. | Implementado | Pendiente |
| `productoComplejos` | Utilidades | `src/utils/numeros_complejos.js` | Producto de números complejos. | Implementado | Pendiente |
| `moduloComplejo` | Utilidades | `src/utils/numeros_complejos.js` | Módulo de un número complejo. | Implementado | Pendiente |
| `conjugadoComplejo` | Utilidades | `src/utils/numeros_complejos.js` | Conjugado de un número complejo. | Implementado | Pendiente |
| `divisionComplejos` | Utilidades | `src/utils/numeros_complejos.js` | División de números complejos. | Implementado | Pendiente |
| `memoizarFuncion` | Utilidades | `src/utils/memoizar.js` | Memoización opcional para funciones costosas. | Implementado | Pendiente |
| `crearGeneradorAleatorio` | Utilidades | `src/utils/prng.js` | Generador pseudoaleatorio reproducible con semilla. | Implementado | Pendiente |
| `exportarMarkdown` | IO | `src/io/exportar_markdown.js` | Exportación de resultados a Markdown. | Implementado | Pendiente |

## Nota de mantenimiento

Esta tabla debe actualizarse cada vez que se agregue, elimine o reorganice un método público del proyecto. La columna de cobertura debe mantenerse alineada con los tests automatizados disponibles.
