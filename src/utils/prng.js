/**
 * @file prng.js
 * @description Generador de números pseudoaleatorios (PRNG) con semilla
 * reproducible para uso en ChuspaNumeric.
 *
 * ## Motivación
 *
 * `Math.random()` de JavaScript no acepta semilla, lo que hace que cualquier
 * código que dependa de aleatoriedad no sea reproducible entre ejecuciones.
 * Esto es un problema serio para:
 *
 * - **Tests deterministas**: un test que genera una matriz aleatoria con
 *   `Math.random()` puede pasar en una ejecución y fallar en otra.
 * - **Reproducibilidad científica/educativa**: dos usuarios ejecutando el
 *   mismo ejemplo deben obtener el mismo resultado para poder comparar.
 * - **Depuración**: un bug que aparece "a veces" es mucho más difícil de
 *   reproducir sin control sobre la semilla.
 *
 * ## Algoritmo: Congruencia Lineal (LCG)
 *
 * Se usa un Generador de Congruencia Lineal (LCG) con los parámetros del
 * compilador de C de Borland, ampliamente usados y documentados:
 *
 *   Xₙ₊₁ = (a · Xₙ + c) mod m
 *
 * donde a = 1664525, c = 1013904223, m = 2³².
 *
 * El LCG tiene período completo (2³² = ~4 mil millones de valores antes de
 * repetirse) y distribución uniforme, suficiente para uso en tests y métodos
 * numéricos de ChuspaNumeric. Para aplicaciones criptográficas o simulaciones de
 * alta calidad estadística, usar algoritmos más avanzados como Mersenne
 * Twister o xoshiro256.
 *
 * ## Uso
 *
 * ```js
 * import { crearGeneradorAleatorio } from 'chuspanumeric/src/utils/prng.js';
 *
 * const random = crearGeneradorAleatorio(42);
 * console.log(random()); // siempre el mismo valor para semilla 42
 * console.log(random()); // siguiente valor de la secuencia
 *
 * // Sin semilla: usa Date.now() → no reproducible
 * const randomNoReproducible = crearGeneradorAleatorio();
 * ```
 */

import { ErrorParametros } from '../core/errores.js';

// Parámetros del LCG (Borland C/C++)
const LCG_A = 1664525;
const LCG_C = 1013904223;
const LCG_M = 2 ** 32;

/**
 * Crea un generador de números pseudoaleatorios con semilla.
 *
 * Devuelve una función que, al llamarse, produce el siguiente número de la
 * secuencia en el intervalo `[0, 1)`. Con la misma semilla, la secuencia es
 * **siempre idéntica** independientemente del entorno o la hora de ejecución.
 *
 * @param {number|null} [semilla=null] - Semilla inicial para el generador.
 *   - Si es un número, el generador es **determinista y reproducible**.
 *   - Si es `null` o se omite, se usa `Date.now()` como semilla (no
 *     reproducible entre ejecuciones).
 * @returns {() => number} Función sin argumentos que devuelve el siguiente
 *   número pseudoaleatorio en `[0, 1)`.
 * @throws {ErrorParametros} Si se pasa una semilla que no es un número
 *   finito (excepto `null`).
 *
 * @example
 * import { crearGeneradorAleatorio } from 'chuspanumeric/src/utils/prng.js';
 *
 * // Reproducible: misma semilla → misma secuencia
 * const r1 = crearGeneradorAleatorio(42);
 * const r2 = crearGeneradorAleatorio(42);
 * console.log(r1() === r2()); // true
 * console.log(r1() === r2()); // true
 *
 * // Secuencia diferente con distinta semilla
 * const r3 = crearGeneradorAleatorio(99);
 * console.log(r1() === r3()); // false (casi siempre)
 *
 * // No reproducible (sin semilla)
 * const rnd = crearGeneradorAleatorio();
 * console.log(rnd()); // valor distinto en cada ejecución
 */
export function crearGeneradorAleatorio(semilla = null) {
  if (semilla !== null && (typeof semilla !== 'number' || !isFinite(semilla))) {
    throw new ErrorParametros(
      `ChuspaNumeric.crearGeneradorAleatorio: la semilla debe ser un número finito o null. ` +
      `Se recibió: ${semilla} (${typeof semilla}).`
    );
  }

  let estado = semilla !== null ? semilla >>> 0 : Date.now() >>> 0;

  return function siguiente() {
    estado = (LCG_A * estado + LCG_C) % LCG_M;
    return estado / LCG_M;
  };
}