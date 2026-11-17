# Logging y observación de métodos iterativos

## ¿Qué es `onIteracion`?

Todos los métodos iterativos de ChuspaNumeric registran el progreso de cada paso en el campo `iteraciones` del resultado — un array con un objeto por cada iteración ejecutada. Esto permite inspeccionar cómo evolucionó el cálculo una vez terminado.

El callback `onIteracion` es la extensión natural de este mecanismo: en lugar de esperar a que el método termine para leer `iteraciones`, `onIteracion` es una función que el usuario puede pasar como parámetro y que el método llama **en tiempo real** al completar cada paso, con el mismo objeto que luego aparecerá en `iteraciones`.

Esto es útil para:

- Mostrar el progreso de un cálculo largo en una interfaz de usuario.
- Detener la ejecución cuando una condición externa se cumple (por ejemplo, cuando el error cae por debajo de un umbral personalizado antes de que el método haya convergido formalmente).
- Registrar (`log`) pasos intermedios sin necesidad de guardar todo el historial en memoria.

> **Nota**: al momento de escribir este documento, `onIteracion` no está implementado como parámetro en los métodos de ChuspaNumeric — el mecanismo disponible es el array `iteraciones` del resultado. Este documento describe el diseño propuesto para `onIteracion` y cómo se usaría una vez implementado, con ejemplos basados en la estructura real de `iteraciones` que ya existe en el proyecto.

---

## La estructura real de `iteraciones`

Antes de usar `onIteracion`, es útil conocer el formato exacto del objeto que el callback recibirá en cada llamada. Este formato ya existe hoy en el array `iteraciones` de cada método.

### Bisección

```js
import { biseccion } from 'ChuspaNumeric/src/no-lineales/biseccion.js';

const r = biseccion({ f: x => x**3 - 2*x - 5, a: 2, b: 3, tolerancia: 1e-4 });
console.log(r.iteraciones[0]);
// { n: 1, a: 2, b: 3, c: 2.5, fa: -1, fb: 16, fc: 5.625, error: 0.5 }
console.log(r.iteraciones[1]);
// { n: 2, a: 2, b: 2.5, c: 2.25, fa: -1, fb: 5.625, fc: 1.890625, error: 0.25 }
```

| Campo | Significado |
|---|---|
| `n` | Número de iteración (desde 1) |
| `a`, `b` | Extremos actuales del intervalo |
| `c` | Punto medio del intervalo |
| `fa`, `fb`, `fc` | Valor de `f` en `a`, `b` y `c` |
| `error` | Longitud del intervalo actual (`b - a`) |

### Jacobi y Gauss-Seidel

```js
import { jacobi } from 'ChuspaNumeric/src/lineales/jacobi.js';

const A = [[10, -1, 2], [-1, 11, -1], [2, -1, 10]];
const b = [6, 25, -11];
const r = jacobi({ A, b, tolerancia: 1e-4, maxIter: 20 });
console.log(r.iteraciones[0]);
// { n: 1, x: [0.6, 2.272727272727273, -1.1], error: 2.5952435832110923 }
```

| Campo | Significado |
|---|---|
| `n` | Número de iteración |
| `x` | Vector solución aproximado en esta iteración |
| `error` | Error relativo respecto a la iteración anterior |

### EDO (Euler, Euler mejorado, RK4)

```js
import { euler } from 'ChuspaNumeric/src/edo/euler.js';

const r = euler({ f: (x, y) => y, x0: 0, y0: 1, h: 0.5, xFinal: 2 });
console.log(r.iteraciones[0]);
// { n: 0, x: 0, y: 1, fxy: 1 }
console.log(r.iteraciones[1]);
// { n: 1, x: 0.5, y: 1.5, fxy: 1.5 }
```

| Campo | Significado |
|---|---|
| `n` | Número de paso |
| `x` | Valor de la variable independiente |
| `y` | Valor aproximado de la solución en `x` |
| `fxy` | Pendiente `f(x, y)` evaluada en ese punto |

---

## Uso de `onIteracion` (diseño propuesto)

Cuando `onIteracion` esté implementado, se pasará como un parámetro adicional al método, y será llamado automáticamente con el objeto de cada iteración:

```js
import { biseccion } from 'ChuspaNumeric/src/no-lineales/biseccion.js';

const r = biseccion({
  f: x => x**3 - 2*x - 5,
  a: 2,
  b: 3,
  tolerancia: 1e-8,
  maxIter: 100,
  onIteracion: (paso) => {
    console.log(`Iter ${paso.n}: c = ${paso.c.toFixed(8)}, error = ${paso.error.toFixed(2e-3)}`);
  },
});
```

Salida esperada durante la ejecución:

```
Iter 1: c = 2.50000000, error = 0.50
Iter 2: c = 2.25000000, error = 0.25
Iter 3: c = 2.12500000, error = 0.12
Iter 4: c = 2.06250000, error = 0.06
...
```

---

## Casos de uso comunes

### 1. Mostrar progreso en consola

El caso más simple: imprimir el error en cada iteración para ver cómo converge el método.

```js
import { jacobi } from 'ChuspaNumeric/src/lineales/jacobi.js';

const A = [[10, -1, 2], [-1, 11, -1], [2, -1, 10]];
const b = [6, 25, -11];

const r = jacobi({
  A,
  b,
  tolerancia: 1e-10,
  maxIter: 100,
  onIteracion: (paso) => {
    console.log(`Iteración ${paso.n} | error = ${paso.error.toExponential(4)}`);
  },
});

console.log('Solución:', r.resultado);
```

### 2. Construir una tabla de convergencia en tiempo real

Acumular las iteraciones en un array propio para construir una tabla antes de que el método termine (útil si el cálculo puede tardar y se quiere visualización parcial):

```js
import { newtonRaphson } from 'ChuspaNumeric/src/no-lineales/newton-raphson.js';

const tabla = [];

const r = newtonRaphson({
  f:  x => x**3 - 2*x - 5,
  df: x => 3*x**2 - 2,
  x0: 2,
  tolerancia: 1e-12,
  maxIter: 20,
  onIteracion: (paso) => {
    tabla.push({ iter: paso.n, x: paso.x, fx: paso.fx, error: paso.error });
  },
});

console.table(tabla);
```

### 3. Detención anticipada con condición externa

Aunque el método tiene su propio criterio de parada (`tolerancia`), `onIteracion` permite reaccionar a condiciones externas — por ejemplo, detener la visualización cuando el error cae por debajo de un umbral visual, sin esperar la convergencia matemática completa:

```js
import { euler } from 'ChuspaNumeric/src/edo/euler.js';

let ultimoY;

const r = euler({
  f: (x, y) => -5 * y,
  x0: 0,
  y0: 1,
  h: 0.01,
  xFinal: 2,
  onIteracion: (paso) => {
    ultimoY = paso.y;
    // Actualizar una barra de progreso, un gráfico, etc.
    if (paso.n % 50 === 0) {
      console.log(`x = ${paso.x.toFixed(2)}, y ≈ ${paso.y.toFixed(6)}`);
    }
  },
});
```

---

## Alternativa disponible hoy: procesar `iteraciones` al finalizar

Mientras `onIteracion` no esté implementado como parámetro, el mismo efecto puede lograrse procesando el array `iteraciones` del resultado una vez que el método ha terminado:

```js
import { biseccion } from 'ChuspaNumeric/src/no-lineales/biseccion.js';

const r = biseccion({
  f: x => x**3 - 2*x - 5,
  a: 2,
  b: 3,
  tolerancia: 1e-8,
});

// Procesar las iteraciones después de que el método terminó
for (const paso of r.iteraciones) {
  console.log(`Iter ${paso.n}: c = ${paso.c.toFixed(8)}, error = ${paso.error.toExponential(3)}`);
}

console.log(`\nRaíz encontrada: ${r.resultado}`);
console.log(`Convergió en ${r.iteraciones.length} iteraciones`);
```

La diferencia respecto a `onIteracion` es que este enfoque requiere que el método **termine primero** antes de poder observar los pasos. Para métodos rápidos (milisegundos) esto no importa; para métodos con muchas iteraciones o funciones `f` costosas, `onIteracion` permitiría retroalimentación durante la ejecución.

---

## Métodos compatibles con `onIteracion`

Todos los métodos que producen un array `iteraciones` no vacío son candidatos naturales para `onIteracion`:

| Categoría | Métodos |
|---|---|
| Ecuaciones no lineales | `biseccion`, `falsaPosicion`, `newtonRaphson`, `secante`, `puntoFijo`, `muller` |
| Sistemas lineales (iterativos) | `jacobi`, `gaussSeidel` |
| EDO | `euler`, `eulerMejorado`, `rungeKutta4` |

Los métodos directos (`gauss`, `gaussJordan`, `lu`, `cholesky`) producen pasos en `iteraciones` pero no son iterativos en el sentido matemático — su número de pasos es fijo y determinado por el tamaño del sistema, no por un criterio de convergencia.
