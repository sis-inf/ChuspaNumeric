# Parser seguro de expresiones matemáticas

## ¿Qué problema resuelve?

Los métodos numéricos de ChuspaNumeric reciben la función matemática como una **función JavaScript nativa**:

```js
biseccion({ f: (x) => x**3 - 2*x - 5, a: 2, b: 3 })
```

Esto funciona bien cuando el código lo escribe un desarrollador, pero no cuando la función viene del **input de un usuario** en una interfaz de texto (CLI o playground): el usuario escribe `"x^3 - 2*x - 5"` como cadena, no como código JavaScript.

El parser de expresiones resuelve este problema: convierte ese string en una función JavaScript evaluable, lista para pasarse a cualquier método de ChuspaNumeric.

---

## Por qué mathjs y no `eval()`

La alternativa más directa para evaluar un string como código sería `eval()` de JavaScript:

```js
// NO HACER ESTO — inseguro
const f = (x) => eval(expresion.replace(/x/g, x));
```

`eval()` ejecuta **cualquier código JavaScript** contenido en el string, lo que representa un riesgo de seguridad crítico si la expresión viene de input de usuario: un atacante podría inyectar código malicioso (`"x + (process.exit(1))"`, acceso al sistema de archivos, etc.).

[mathjs](https://mathjs.org/) es la alternativa segura: implementa su propio intérprete de expresiones matemáticas que solo reconoce operaciones y funciones matemáticas predefinidas, sin acceso al scope de JavaScript ni a ninguna API del entorno. Cualquier expresión que no sea matemáticamente válida lanza un error descriptivo en lugar de ejecutarse.

---

## Precedente en el proyecto: `src/root/`

El directorio `src/root/` contiene las primeras implementaciones de ChuspaNumeric (`bisection.js`, `newtonRaphson.js`) y muestra exactamente cómo mathjs permite este paradigma. Ambos archivos usan `math.evaluate(expression, { x })` para evaluar la expresión en cada iteración:

```js
// src/root/bisection.js (fragmento)
import { create, all } from 'mathjs';
const math = create(all);

function bisection(expression, a, b, tolerance = 0.001, maxIterations = 100) {
  const f = (x) => math.evaluate(expression, { x });
  // ...
}
```

El paradigma de `src/root/` fue **descartado como API principal** de ChuspaNumeric (ver `docs/arquitectura-decisiones.md`, ADR-004) porque llama a `math.evaluate` en cada iteración del bucle, reparsando el string en cada paso. Para un método que converge en 50 iteraciones, esto significa 50 parseos de la misma expresión.

---

## Diseño recomendado: `parsearExpresion`

La forma correcta de usar mathjs en ChuspaNumeric es compilar la expresión **una sola vez** con `math.compile()` y devolver una función ya lista, pagando el costo de parseo una sola vez:

```js
import { create, all } from 'mathjs';

const math = create(all);

/**
 * Convierte una expresión matemática en string en una función JavaScript
 * evaluable, lista para pasarse a cualquier método de ChuspaNumeric.
 *
 * @param {string} expresion - Expresión matemática. Ej: "x^3 - 2*x - 5".
 * @param {string} [variable='x'] - Nombre de la variable en la expresión.
 * @returns {(valor: number) => number} Función evaluable.
 */
export function parsearExpresion(expresion, variable = 'x') {
  if (typeof expresion !== 'string' || expresion.trim() === '') {
    throw new Error('parsearExpresion: la expresión debe ser un string no vacío.');
  }

  let compilada;
  try {
    compilada = math.compile(expresion);
  } catch (e) {
    throw new Error(
      `parsearExpresion: expresión inválida "${expresion}". ${e.message}`
    );
  }

  // La expresión ya está compilada — esta función solo la evalúa
  return function evaluar(valor) {
    return compilada.evaluate({ [variable]: valor });
  };
}
```

La diferencia clave respecto a `src/root/` es que `math.compile()` parsea el string **una sola vez** al construir la función, mientras que `math.evaluate()` lo parsearía en cada llamada.

---

## Ejemplo de uso con bisección

```js
import { parsearExpresion } from './src/utils/parsear_expresion.js';
import { biseccion } from './src/no-lineales/biseccion.js';

// El usuario escribe esto como texto — viene de un input de CLI o formulario
const expresionUsuario = 'x^3 - 2*x - 5';

const f = parsearExpresion(expresionUsuario);

const resultado = biseccion({
  f,
  a: 2,
  b: 3,
  tolerancia: 1e-8,
  maxIter: 100,
});

console.log('Raíz:', resultado.resultado);   // 2.094551481542327
console.log('Convergió:', resultado.convergio);  // true
```

---

## Sintaxis de expresiones soportada

mathjs acepta la notación matemática estándar. Algunos ejemplos:

| Expresión | Equivalente en JS nativo |
|---|---|
| `x^2 - 4` | `x**2 - 4` |
| `sin(x) + cos(x)` | `Math.sin(x) + Math.cos(x)` |
| `exp(-x)` | `Math.exp(-x)` |
| `sqrt(abs(x))` | `Math.sqrt(Math.abs(x))` |
| `log(x)` | `Math.log(x)` (logaritmo natural) |
| `log(x, 10)` | `Math.log10(x)` |
| `pi * x^2` | `Math.PI * x**2` |

---

## Manejo de errores

El error se lanza **al construir la función** (al llamar a `parsearExpresion`), no al evaluarla. Esto permite validar la expresión antes de iniciar el cómputo iterativo:

```js
try {
  const f = parsearExpresion('x^^2'); // sintaxis inválida
} catch (e) {
  console.error(e.message);
  // parsearExpresion: expresión inválida "x^^2". Value expected (char 3)
}

try {
  const f = parsearExpresion(''); // string vacío
} catch (e) {
  console.error(e.message);
  // parsearExpresion: la expresión debe ser un string no vacío.
}
```

---

## Variable con nombre distinto a `x`

Si la expresión usa una variable con nombre distinto, se pasa como segundo argumento:

```js
// EDO: y' = -2t  — la variable es 't', no 'x'
const f = parsearExpresion('-2 * t', 't');
console.log(f(3));  // -6
```

---

## Dónde ubicar esta función en el proyecto

`parsearExpresion` pertenece a `src/utils/parsear_expresion.js`. No debe exportarse desde `src/index.js` junto con los métodos numéricos, ya que introduce una dependencia externa (mathjs) que no forma parte del bundle principal de la librería. En su lugar, se importa explícitamente solo en las capas que la necesitan (CLI, playground).

mathjs debe declararse como dependencia de producción en `package.json` antes de publicar cualquier capa que use este parser:

```bash
npm install mathjs
```
