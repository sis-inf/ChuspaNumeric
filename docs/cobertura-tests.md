# Cobertura de Tests

## Estado actual

El error de configuración ESM en `jest.config.js` fue corregido en #1119. Este documento registra el estado real de la ejecución de cobertura posterior a esa corrección.

**Fecha de ejecución:** 2026-11-12
**Entorno:** Node v26.13.1, Jest 30.5.2

### Ejecución con `npm run test:cov` (script actual)

El script `test:cov` en `package.json` es `jest --coverage`, sin el flag `--experimental-vm-modules`. Ejecutado así, 69 de 72 suites fallan al cargarse (`Test Suites: 69 failed, 3 passed, 72 total`) con el error:

```
Must use import to load ES Module: .../tests/automatizados/unit/horner.test.js
The file contains ESM syntax (import/export) that could not be executed as CommonJS.
```

Esta causa es independiente de `jest.config.js`: el flag falta en el script. El script `test` sí lo incluye.

### Ejecución con `node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage`

| Métrica | Resultado |
|---|---|
| Suites | 67 pasan, 5 fallan, 72 en total |
| Tests | 707 pasan, 8 fallan, 715 en total |

### Fallos observados (no relacionados con ESM)

| Suite | Test / error | Causa observada |
|---|---|---|
| `tests/automatizados/unit/trazo-cli.test.js` | 3 tests (`biseccion`, `newtonRaphson`, comando desconocido) | `Cannot find module '.../src/cli/chuspanumeric-cli.js'`. El test invoca un archivo que no existe con ese nombre; la cobertura muestra `src/cli/trazo-cli.js`. |
| `tests/casos/funcionales/diferencias_finitas.test.js` | 3 tests (`diferenciaCentrada`, `diferenciaCentradaSegundaDerivada`, `diferenciasAdelanteGrado1`) | Precisión numérica: recibió `12.0001` y `12.0601` con `toBeCloseTo(12, 4)`; en la segunda derivada el error con h pequeño (`2.80e-11`) supera al error con h grande (`8.88e-15`). |
| `tests/automatizados/unit/runge_kutta.test.js` | `valida que f sea una función` | Esperaba `"El argumento debe ser una función"`, recibió `"ChuspaNumeric: 'f' debe ser una función. Se recibió: string."` |
| `tests/automatizados/unit/gauss_legendre.test.js` | `puntos inválido lanza error` | Esperaba `"puntos debe ser 2 o 3"`, recibió `"puntos debe ser 2, 3, 4 o 5"`. |
| `tests/build/tree-shaking.test.js` | `Your test suite must contain at least one test` | El archivo usa `node:test`, no Jest. Sus `import()` dinámicos fallan con `You are trying to import a file after the Jest environment has been torn down`. |

### Cobertura global

| Métrica | Obtenido | Umbral | Estado |
|---|---|---|---|
| Statements | 69.93% | 70% | No cumple |
| Branches | 62.57% | 70% | No cumple |
| Functions | 70.70% | 70% | Cumple |
| Lines | 69.21% | 70% | No cumple |

Mensajes de Jest:

```
Jest: Coverage for statements (69.93%) does not meet "global" threshold (70%)
Jest: Coverage for branches (62.57%) does not meet "global" threshold (70%)
Jest: Coverage for lines (69.21%) does not meet "global" threshold (70%)
```

El incumplimiento de umbrales es un error aparte de los tests fallidos.

## Inventario de suites

Total: 72 suites (715 tests).

| Carpeta | Suites | Estado |
|---|---|---|
| `tests/automatizados/unit/` | 62 | 59 pasan, 3 fallan (`trazo-cli`, `runge_kutta`, `gauss_legendre`) |
| `tests/casos/funcionales/` | 8 | 7 pasan, 1 falla (`diferencias_finitas`) |
| `tests/build/` | 1 | Falla (`tree-shaking`) |
| `tests/` (raíz) | 1 | Pasa (`integracion-cruzada.test.js`) |

### Módulos sin cobertura (0%)

Ningún test los ejecuta:

- `src/cli/trazo-cli.js`
- `src/integracion/index.js`
- `src/matricial/index.js`
- `src/no-lineales/buscar_raices.js`
- `src/no-lineales/muller.js`
- `src/utils/ejecutar_paralelo.js`
- `src/utils/index.js`
- `src/utils/math.js`
- `src/utils/matriz_typed.js`
- `src/utils/parser_expresiones.js`
- `src/utils/redondeo.js`
- `src/utils/tabla_resultado.js`

### Módulos con cobertura muy baja (menos del 40% de statements)

`src/lineales/gauss-pivoteo-parcial.js` (2.04%), `src/interpolacion/linear.js` (19.51%), `src/io/exportar_json.js` (16.66%), `src/matricial/norma_matriz.js` (29.41%), `src/integracion/monte_carlo.js` (32.89%), `src/diferencias/diferencia_hacia_atras.js` (33.33%), `src/edo/runge_kutta_4.js` (38.37%), `src/cli/grafico_ascii.js` (32.69%).
## Tabla de cobertura por módulo

| Módulo | Archivo de test | Cobertura estimada | Estado |
|---|---|---|---|
| biseccion | tests/automatizados/unit/biseccion.test.js | desconocida | Con tests |
| convergencia | tests/automatizados/unit/convergencia.test.js | desconocida | Con tests |
| float_tolerance | tests/automatizados/unit/float_tolerance.test.js | desconocida | Con tests |
| interpolacion | tests/automatizados/unit/interpolacion.test.js | desconocida | Con tests |
| runge_kutta | tests/automatizados/unit/runge_kutta.test.js | desconocida | Con tests |
| validaciones | tests/automatizados/unit/validaciones.test.js | desconocida | Con tests |
| analisis | — | 0% | Sin tests |
| diferencias | — | 0% | Sin tests |
| edo | — | 0% | Sin tests |
| errors | — | 0% | Sin tests |
| integracion | — | 0% | Sin tests |
| lineales | — | 0% | Sin tests |
| matricial | — | 0% | Sin tests |
| no-lineales | — | 0% | Sin tests |
| polinomios | — | 0% | Sin tests |
| utils | — | 0% | Sin tests |

## Módulos con cobertura menor al 60%

Los siguientes módulos no tienen tests y su cobertura es **0%**:

- `analisis`
- `diferencias`
- `edo`
- `errors`
- `integracion`
- `lineales`
- `matricial`
- `no-lineales`
- `polinomios`
- `utils`

## Nota

La cobertura real deberá medirse una vez que la configuración de Jest sea corregida en la estructura base del proyecto.
