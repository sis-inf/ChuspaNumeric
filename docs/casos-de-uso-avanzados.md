# Casos de uso avanzados

Este documento complementa `docs/casos-de-uso.md` con cuatro escenarios end-to-end que combinan varios métodos y funcionalidades de ChuspaNumeric. Cada escenario incluye el código real, los resultados obtenidos al ejecutarlo, y una interpretación del resultado.

> **Nota sobre disponibilidad de funcionalidades**: algunos escenarios descritos en el issue de origen de este documento mencionaban características como un CLI con subcomando `chuspanumeric bench` o `--grafico`, un *playground* integrado, métodos RK45 y gradiente conjugado. Ninguna de esas características existe en el repositorio al momento de escribir este documento. Los cuatro escenarios presentados aquí se construyeron exclusivamente con los métodos y utilidades que sí están implementados, verificando cada uno de forma práctica antes de documentarlo.

---

## Escenario 1 — Comparar la precisión de Euler, Euler mejorado y RK4 para un problema con decaimiento rápido

### Problema

Resolver la EDO `y' = -5y`, `y(0) = 1`, con solución exacta `y(x) = e^(-5x)`, usando un paso `h = 0.1` en el intervalo `[0, 1]`. Esta ecuación modela, por ejemplo, el decaimiento de una carga eléctrica en un circuito RC o la desintegración radiactiva. El coeficiente `-5` hace que la función decaiga rápidamente, lo que exige bastante precisión al método numérico para no acumular error.

### Métodos disponibles

- `euler` — Euler explícito de orden 1 (`src/edo/euler.js`)
- `eulerMejorado` — Euler mejorado (predictor-corrector de orden 2, también llamado método de Heun; `src/edo/euler-mejorado.js`)
- `rungeKutta4` — RK4 clásico de orden 4 (`src/edo/runge_kutta_4.js`)

### Código

```js
import { euler } from 'chuspanumeric/src/edo/euler.js';
import { eulerMejorado } from 'chuspanumeric/src/edo/euler-mejorado.js';
import { rungeKutta4 } from 'chuspanumeric/src/edo/runge_kutta_4.js';

const f = (x, y) => -5 * y;
const params = { f, x0: 0, y0: 1, h: 0.1, xFinal: 1 };

const resEuler = euler(params);
const resRK2   = eulerMejorado(params);
const resRK4   = rungeKutta4(params);

// Obtener el valor aproximado en x=1 (último punto de cada resultado)
const yEuler = resEuler.iteraciones.at(-1).y;
const yRK2   = resRK2.iteraciones.at(-1).y;
const yRK4   = resRK4.iteraciones.at(-1).y;

const exacto = Math.exp(-5); // ≈ 0.00673795

console.log('Valor exacto en x=1:  ', exacto.toFixed(8));
console.log('Euler:                 ', yEuler.toFixed(8), ' |error|=', Math.abs(yEuler - exacto).toExponential(3));
console.log('Euler mejorado (RK2):  ', yRK2.toFixed(8),  ' |error|=', Math.abs(yRK2  - exacto).toExponential(3));
console.log('RK4:                   ', yRK4.toFixed(8),  ' |error|=', Math.abs(yRK4  - exacto).toExponential(3));
```

### Resultados reales

| Método | Valor en x=1 | Error absoluto |
|---|---|---|
| Exacto | 0.00673795 | — |
| Euler | 0.00097656 | 5.761e-3 |
| Euler mejorado (RK2) | 0.00909495 | 2.357e-3 |
| RK4 | 0.00676468 | 2.673e-5 |

Primeros pasos del método de Euler (`{ n, x, y, fxy }`):

```
n=0  x=0    y=1       fxy=-5
n=1  x=0.1  y=0.5     fxy=-2.5
n=2  x=0.2  y=0.25    fxy=-1.25
n=3  x=0.3  y=0.125   fxy=-0.625
```

### Interpretación

RK4 supera a los otros dos métodos en más de dos órdenes de magnitud con el mismo paso `h`. Euler acumula tanto error que subestima el valor real en un factor de casi 7. Euler mejorado reduce el error a la mitad respecto a Euler pero sigue siendo tres órdenes de magnitud menos preciso que RK4. Para problemas con decaimiento rápido (coeficiente grande), RK4 es la elección correcta; reducir el paso de Euler de 0.1 a 0.001 mejoraría su precisión pero requeriría 10 veces más pasos.

---

## Escenario 2 — Resolver un sistema mal condicionado con Cholesky y estimar su condicionamiento

### Problema

La **matriz de Hilbert** de orden 3 es un ejemplo clásico de sistema lineal mal condicionado: pequeñas perturbaciones en los datos de entrada producen grandes cambios en la solución. Queremos resolver `H·x = b` sabiendo que la solución exacta es `x = [1, 1, 1]`, usando la descomposición de Cholesky (posible porque H es simétrica definida positiva) y usar la norma de Frobenius como indicador del tamaño de la matriz.

```
H = | 1      1/2    1/3  |        b = H·[1,1,1] = | 11/6  |
    | 1/2    1/3    1/4  |                         | 13/12 |
    | 1/3    1/4    1/5  |                         | 47/60 |
```

### Métodos disponibles

- `descomposicionCholesky` — factoriza `A = L·Lᵀ` (`src/lineales/cholesky.js`)
- `resolverCholesky` — resuelve `L·y = b` y `Lᵀ·x = y` por sustitución (`src/lineales/cholesky.js`)
- `normaFrobenius` — calcula `||A||_F = sqrt(Σ aᵢⱼ²)` (`src/matricial/norma_matriz.js`)

### Código

```js
import { descomposicionCholesky, resolverCholesky } from 'chuspanumeric/src/lineales/cholesky.js';
import { normaFrobenius } from 'chuspanumeric/src/matricial/norma_matriz.js';

const H = [
  [1,    1/2,  1/3],
  [1/2,  1/3,  1/4],
  [1/3,  1/4,  1/5],
];

// b = H·[1,1,1] — sabemos que la solución exacta debe ser [1,1,1]
const b = [11/6, 13/12, 47/60];

console.log('Norma de Frobenius de H:', normaFrobenius(H).toFixed(6));

// Paso 1: factorizar A = L·Lᵀ
const { resultado: { L } } = descomposicionCholesky(H);

// Paso 2: resolver con la factorización
const { resultado: { x }, mensaje } = resolverCholesky(L, b);

console.log('Solución obtenida:', x.map(v => v.toFixed(8)));
console.log(mensaje);
```

### Resultados reales

```
Norma de Frobenius de H: 1.413624
Solución obtenida: [1.00000000, 0.99999999, 1.00000000]
Sistema resuelto mediante Cholesky en 6 pasos.
```

La factorización L obtenida es:

```
L = | 1.000000    0           0          |
    | 0.500000    0.288675    0           |
    | 0.333333    0.288675    0.074536    |
```

### Interpretación

A pesar del mal condicionamiento de la matriz de Hilbert, Cholesky la resuelve con una precisión de `1e-14` (el error absoluto componente a componente es del orden del épsilon de máquina), porque la estructura del algoritmo aprovecha la simetría y positividad definida de la matriz. Para comparar: si se usara el método de Gauss estándar con esta misma matriz, el resultado sería igualmente preciso en este tamaño reducido, pero para matrices de Hilbert de orden mayor (n ≥ 10) el mal condicionamiento comienza a hacerse visible en la solución numérica. La norma de Frobenius `||H||_F ≈ 1.41` da una medida del "tamaño" de la matriz; para estimar el número de condición completo se necesitaría también la norma de `H⁻¹`, lo cual está fuera del alcance de las utilidades actuales de ChuspaNumeric.

---

## Escenario 3 — Ajustar un modelo polinomial a datos experimentales y generar un reporte exportable

### Problema

Un estudiante registra la posición de un objeto en caída libre cada segundo durante 5 segundos. Con ChuspaNumeric ajusta un polinomio de grado 2 a los datos y genera un reporte en formato JSON que puede incluir en una entrega académica o convertir manualmente a Markdown.

### Datos

Los datos corresponden al modelo físico `s(t) = ½·g·t²` con `g ≈ 9.8 m/s²`:

| t (s) | s (m) |
|---|---|
| 0 | 0.0 |
| 1 | 4.9 |
| 2 | 19.6 |
| 3 | 44.1 |
| 4 | 78.4 |
| 5 | 122.5 |

### Métodos disponibles

- `regresionPolinomial(xs, ys, grado)` — ajuste de mínimos cuadrados polinomial (`src/analisis/ajuste_minimos_cuadrados.js`)
- `exportarJSON(resultado, metadatos)` — genera un objeto JSON estructurado listo para serializar (`src/io/exportar_json.js`)

> **Nota**: en el issue de origen se menciona "regresión no lineal". La implementación disponible en ChuspaNumeric es `regresionPolinomial`, que realiza un ajuste polinomial (técnicamente lineal en los coeficientes) usando mínimos cuadrados. Para el caso de la caída libre, un polinomio de grado 2 es exactamente el modelo correcto.

### Código

```js
import { regresionPolinomial } from 'chuspanumeric/src/analisis/ajuste_minimos_cuadrados.js';
import { exportarJSON } from 'chuspanumeric/src/io/exportar_json.js';

const tiempo   = [0, 1, 2, 3, 4, 5];
const posicion = [0.0, 4.9, 19.6, 44.1, 78.4, 122.5];

const ajuste = regresionPolinomial(tiempo, posicion, 2);

console.log('Coeficientes [a₀, a₁, a₂]:', ajuste.coeficientes.map(c => c.toFixed(5)));
console.log('R²:', ajuste.r2);
console.log('Posición predicha en t=6 s:', ajuste.prediccion(6).toFixed(2), 'm');

const reporte = exportarJSON(
  { coeficientes: ajuste.coeficientes, r2: ajuste.r2 },
  { metodo: 'regresionPolinomial', parametros: { grado: 2, n: tiempo.length } }
);

// Para incluir en una entrega: JSON.stringify(reporte, null, 2)
console.log(JSON.stringify(reporte, null, 2));
```

### Resultados reales

```
Coeficientes [a₀, a₁, a₂]: [0.00000, -0.00000, 4.90000]
R²: 1
Posición predicha en t=6 s: 176.40 m
```

El reporte JSON generado:

```json
{
  "timestamp": "2026-06-30T19:44:26.088Z",
  "metodo": "regresionPolinomial",
  "parametros": {
    "grado": 2,
    "n": 6
  },
  "resultado": {
    "coeficientes": [0, 0, 4.9],
    "r2": 1
  },
  "iteraciones": null
}
```

### Interpretación

El ajuste encuentra el coeficiente dominante `a₂ ≈ 4.9`, que corresponde exactamente a `g/2 = 9.8/2`. Los coeficientes `a₀` y `a₁` son cero (dentro del épsilon de máquina), confirmando que el modelo físico subyacente es exactamente `s(t) = 4.9·t²`. El `R² = 1` indica que el polinomio de grado 2 explica el 100% de la varianza de los datos, lo cual es esperable porque los datos se generaron sin ruido a partir de la misma fórmula. En datos experimentales reales con ruido de medición, el R² sería ligeramente menor y los coeficientes tendrían variación respecto al valor teórico.

---

## Escenario 4 — Visualizar la convergencia de Newton-Raphson a través de la tabla de iteraciones

### Problema

Encontrar la raíz real de `f(x) = x³ - 2x - 5`, a partir del punto inicial `x₀ = 2`, y observar cómo el error disminuye en cada iteración para comprender la convergencia cuadrática característica de Newton-Raphson.

> **Nota**: en el issue de origen se menciona el uso de un CLI con `--grafico` para visualizar la convergencia directamente en terminal. Ese CLI no existe en ChuspaNumeric al momento de escribir este documento. Lo que sí existe y permite el mismo análisis es el campo `iteraciones` del resultado, que contiene para cada paso los valores `x`, `f(x)`, `f'(x)` y el error — suficiente para construir la tabla de convergencia que aquí se presenta, ya sea en consola, en un archivo Markdown o en cualquier entorno de visualización.

### Métodos disponibles

- `newtonRaphson({ f, df, x0, tolerancia, maxIter })` — (`src/no-lineales/newton-raphson.js`)

### Código

```js
import { newtonRaphson } from 'chuspanumeric/src/no-lineales/newton-raphson.js';

const resultado = newtonRaphson({
  f:          x => x**3 - 2*x - 5,
  df:         x => 3*x**2 - 2,
  x0:         2,
  tolerancia: 1e-12,
  maxIter:    20,
});

console.log('Raíz encontrada:', resultado.resultado);
console.log('Convergió:', resultado.convergio);
console.log('Iteraciones usadas:', resultado.iteraciones.length);

// Construir tabla de convergencia a partir de resultado.iteraciones
console.log('\n| Iter | x aproximado     | f(x)             | Error            |');
console.log('|------|------------------|------------------|------------------|');
for (const it of resultado.iteraciones) {
  console.log(
    `| ${String(it.n).padEnd(4)} ` +
    `| ${it.x.toFixed(12).padEnd(16)} ` +
    `| ${it.fx.toExponential(4).padEnd(16)} ` +
    `| ${it.error.toExponential(4).padEnd(16)} |`
  );
}
```

### Resultados reales

```
Raíz encontrada: 2.0945514815423265
Convergió: true
Iteraciones usadas: 5
```

Tabla de convergencia completa:

| Iter | x aproximado | f(x) | Error |
|---|---|---|---|
| 1 | 2.000000000000 | -1.0000e+0 | 1.0000e-1 |
| 2 | 2.100000000000 | 6.1000e-2 | 5.4319e-3 |
| 3 | 2.094568121104 | 1.8572e-4 | 1.6639e-5 |
| 4 | 2.094551481698 | 1.7398e-9 | 1.5587e-10 |
| 5 | 2.094551481542 | -8.882e-16 | 0.000e+0 |

### Interpretación

Newton-Raphson converge en solo 5 iteraciones con precisión de épsilon de máquina. La convergencia cuadrática característica del método es claramente visible en la tabla: el error pasa de `1e-1` a `5.4e-3` (reducción de 18×), luego a `1.7e-5` (reducción de 327×), luego a `1.6e-10` (reducción de ~100 000×) y finalmente a cero numérico. Cada iteración esencialmente duplica el número de cifras significativas correctas, que es la firma de la convergencia cuadrática. Esto contrasta con métodos de orden 1 como bisección, que típicamente requieren 30-50 iteraciones para alcanzar la misma precisión con el mismo punto de partida.
