# Criterios de Salida

## Para pasar de dev a main

- [ ] Cobertura de tests >= \_\_\_%
- [ ] Cero bugs de severidad Crítica o Alta abiertos
- [ ] Todos los casos de prueba del sprint ejecutados
- [ ] Informe de pruebas generado y aprobado
- [ ] Revisión de seguridad completada
- [ ] Documentación actualizada

## Tolerancias numéricas máximas admisibles

Un método numérico cumple el criterio de salida cuando el error absoluto de su resultado, frente a un valor de referencia conocido (solución analítica o un caso de `tests/datos/esperados/casos_referencia.json`), no supera la tolerancia de su categoría.

| Categoría de algoritmo | Tolerancia máxima admisible | Qué se compara                                                  |
| ---------------------- | --------------------------- | --------------------------------------------------------------- |
| Integración numérica   | 1e-4                        | Valor aproximado de la integral definida frente al valor exacto |
| Búsqueda de raíces     | 1e-6                        | Raíz aproximada frente a la raíz conocida                       |
| Sistemas lineales      | 1e-5                        | Cada componente de la solución frente a la solución conocida    |

- Las tolerancias de la tabla son cotas máximas: una prueba puede exigir un error menor, pero nunca aceptar uno mayor.
- La tolerancia con la que se ejecuta el método (criterio de parada) y la tolerancia con la que se compara el resultado en la prueba son valores distintos; ambos deben quedar indicados en el caso de prueba.

## Criterios de convergencia y control de iteraciones

### Criterios de convergencia

- Búsqueda de raíces: el método converge cuando el valor absoluto de f(x) en la aproximación, o el cambio entre dos aproximaciones consecutivas (el ancho del intervalo en bisección), es menor o igual que la tolerancia del método.
- Sistemas lineales iterativos (Jacobi, Gauss-Seidel): el método converge cuando la diferencia máxima entre dos iteraciones consecutivas es menor o igual que la tolerancia del método. Los métodos directos (eliminación de Gauss, LU) no iteran: se comprueba que el residuo (A por x menos b) esté dentro de la tolerancia.
- Integración: los métodos de paso fijo (trapecio, Simpson) se evalúan contra el valor exacto con la tolerancia de la tabla; los adaptativos (Simpson adaptativo, Romberg) se detienen cuando la estimación del error entre dos refinamientos consecutivos es menor o igual que la tolerancia del método.

### Control de iteraciones

1. Todo método iterativo recibe un máximo de iteraciones y siempre termina; no se aceptan bucles sin tope.
2. Si se alcanza el máximo sin cumplir el criterio de convergencia, el resultado indica `convergio: false` e incluye un `mensaje` que lo explica; nunca se presenta como convergido.
3. Si se cumple el criterio antes del máximo, el resultado indica `convergio: true` y `iteraciones` registra los pasos realizados, sin superar el máximo.
4. Si aparecen valores no finitos (NaN o infinito) o divergencia, el método se detiene e informa el motivo en el `mensaje` con `convergio: false`.
5. Los parámetros inválidos (tolerancia menor o igual que cero, máximo de iteraciones no entero o no positivo) se rechazan con un mensaje de error en español.
