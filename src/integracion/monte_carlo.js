/**
 * Módulo de integración numérica por el método de Monte Carlo.
 *
 * Utiliza muestreo aleatorio para estimar integrales definidas.
 * Incluye reporte del error estándar estimado usando utilidades estadísticas.
 */

import { media, desviacionEstandar } from '../utils/estadistica.js';

/**
 * Realiza integración numérica por el método de Monte Carlo.
 *
 * Estima la integral de una función f en el intervalo [a, b] generando
 * puntos aleatorios uniformemente distribuidos y evaluando la función.
 *
 * @param {Function} f - Función a integrar. Recibe un número y devuelve un número.
 * @param {number} a - Límite inferior de integración
 * @param {number} b - Límite superior de integración
 * @param {number} [n=10000] - Número de muestras aleatorias
 * @returns {Object} Resultado con la estimación de la integral y error estándar
 * @returns {number} resultado.valor - Estimación de la integral
 * @returns {number} resultado.errorEstandar - Error estándar estimado de la aproximación
 * @returns {number} resultado.n - Número de muestras utilizadas
 * @returns {number} resultado.intervaloA - Límite inferior del intervalo
 * @returns {number} resultado.intervaloB - Límite superior del intervalo
 *
 * @example
 * // Integrar f(x) = x^2 en [0, 1]
 * // Resultado teórico: 1/3 ≈ 0.333...
 * const resultado = integracionMonteCarlo(x => x * x, 0, 1, 100000);
 * console.log(resultado.valor); // ≈ 0.333
 * console.log(resultado.errorEstandar); // Error estándar estimado
 */
export function integracionMonteCarlo(f, a, b, n = 10000) {
  // Validaciones
  if (typeof f !== 'function') {
    throw new Error('El primer argumento debe ser una función');
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Los límites de integración deben ser números');
  }
  if (a >= b) {
    throw new Error('El límite inferior debe ser menor que el superior');
  }
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error('El número de muestras debe ser un entero positivo');
  }

  const muestras = [];
  const ancho = b - a;

  // Generar muestras y evaluar función
  for (let i = 0; i < n; i++) {
    const x = a + Math.random() * ancho;
    const fx = f(x);

    if (typeof fx !== 'number' || !isFinite(fx)) {
      throw new Error(`La función devolvió un valor no numérico o infinito para x=${x}`);
    }

    muestras.push(fx);
  }

  // Calcular estadísticos usando las utilidades del issue #659
  const mediaMuestral = media(muestras);
  const desviacionMuestral = desviacionEstandar(muestras, false); // muestral

  // Error estándar de la media: s / sqrt(n)
  const errorEstandar = desviacionMuestral / Math.sqrt(n);

  // La integral estimada es la media de f(x) multiplicada por el ancho del intervalo
  const valorIntegral = mediaMuestral * ancho;
  const errorEstandarIntegral = errorEstandar * ancho;

  return {
    valor: valorIntegral,
    errorEstandar: errorEstandarIntegral,
    n: n,
    intervaloA: a,
    intervaloB: b
  };
}
/**
 * @file monte_carlo.js
 * @description Integración numérica por el método de Monte Carlo.
 *
 * ## ¿Por qué Monte Carlo para integración?
 *
 * Los métodos de cuadratura clásicos (trapecio, Simpson, Gauss-Legendre)
 * funcionan bien para integrales de una sola variable, pero su costo
 * computacional crece **exponencialmente** con la dimensión del dominio:
 * para una cuadrícula de N puntos por dimensión, una integral d-dimensional
 * requiere N^d evaluaciones de f. Esto se conoce como la "maldición de la
 * dimensionalidad".
 *
 * Monte Carlo resuelve este problema usando muestreo aleatorio: evalúa f en N
 * puntos aleatorios dentro del dominio de integración y promedia los valores.
 * Su costo es O(N) independientemente de la dimensión — el mismo número de
 * muestras para d=1 que para d=100.
 *
 * ## Convergencia
 *
 * A diferencia de los métodos de cuadratura (que convergen como O(h^p) con
 * h el tamaño del paso y p el orden del método), Monte Carlo converge como
 * **O(1/√N)** — para duplicar la precisión hay que cuadruplicar el número de
 * muestras. Esto lo hace más lento que los métodos clásicos para integrales
 * 1D, pero es la única opción práctica para integrales de alta dimensión
 * (d ≥ 4) donde los métodos de cuadratura son computacionalmente inviables.
 *
 * ## Reproducibilidad
 *
 * Se incluye un PRNG (Generador de Números Pseudoaleatorios) con semilla
 * basado en el algoritmo mulberry32 (fuente: https://github.com/bryc/code/blob/master/jshash/PRNGs.md),
 * un PRNG de 32 bits con buen período y distribución uniforme. Con la misma
 * semilla, la función produce **exactamente el mismo resultado** en cualquier
 * entorno JavaScript, sin depender de Math.random().
 */

import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

// ---------------------------------------------------------------------------
// PRNG con semilla (mulberry32)
// ---------------------------------------------------------------------------

/**
 * Crea un generador de números pseudoaleatorios con semilla (mulberry32).
 * Devuelve valores en [0, 1) con distribución uniforme.
 *
 * @param {number} semilla - Semilla entera. Con la misma semilla siempre
 *   produce la misma secuencia.
 * @returns {() => number} Función que devuelve el siguiente número aleatorio.
 */
function crearPRNG(semilla) {
  let s = semilla >>> 0; // asegurar entero de 32 bits sin signo
  return function siguiente() {
    s += 0x6d2b79f5;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 0x100000000;
  };
}

// ---------------------------------------------------------------------------
// Integración Monte Carlo
// ---------------------------------------------------------------------------

/**
 * Estima la integral de f sobre un hipercubo d-dimensional
 * [a₁,b₁] × [a₂,b₂] × ... × [aₐ,bₐ] mediante muestreo aleatorio uniforme.
 *
 * La estimación es:
 *   ∫f dx ≈ Volumen × (1/N) × Σ f(xᵢ)
 *
 * donde xᵢ son N puntos aleatorios uniformes en el dominio.
 *
 * @param {Object}   params
 * @param {Function} params.f - Función a integrar. Recibe un array de d
 *   coordenadas `[x₁, x₂, ..., xₐ]` y devuelve un número. Para integrales
 *   1D, recibe `[x]` (array de un elemento).
 * @param {number[]} params.limitesInferiores - Array de d valores `[a₁, ..., aₐ]`
 *   con el límite inferior de cada dimensión.
 * @param {number[]} params.limitesSuperiores - Array de d valores `[b₁, ..., bₐ]`
 *   con el límite superior de cada dimensión. Cada bᵢ debe ser > aᵢ.
 * @param {number}   [params.nMuestras=10000] - Número de puntos aleatorios a
 *   generar. La precisión mejora aproximadamente como 1/√nMuestras.
 * @param {number|null} [params.semilla=null] - Semilla para el PRNG. Si es
 *   `null`, usa `Math.random()` (no reproducible). Si es un número, usa el
 *   PRNG interno determinista (reproducible).
 *
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric:
 *   - `resultado`: estimación de la integral (number).
 *   - `iteraciones`: array con un único elemento que contiene la estimación,
 *     el error estándar estimado y el volumen del dominio.
 *   - `convergio`: siempre `true` (Monte Carlo no tiene criterio de convergencia
 *     iterativo — se ejecuta exactamente nMuestras veces).
 *   - `mensaje`: descripción con la estimación, el error estándar y las
 *     dimensiones del dominio.
 *   - `meta.metodo`: `'monte-carlo'`.
 *
 * @throws {ErrorParametros} Si f no es una función, los límites tienen
 *   dimensiones inconsistentes, algún límite superior ≤ inferior, o nMuestras
 *   no es un entero positivo.
 *
 * @example
 * import { integracionMonteCarlo } from 'ChuspaNumeric/src/integracion/monte_carlo.js';
 *
 * // Integral 1D: ∫₀¹ x² dx = 1/3 ≈ 0.333...
 * const r1 = integracionMonteCarlo({
 *   f: ([x]) => x ** 2,
 *   limitesInferiores: [0],
 *   limitesSuperiores: [1],
 *   nMuestras: 100000,
 *   semilla: 42,
 * });
 * console.log(r1.resultado); // ≈ 0.333
 *
 * // Integral 3D: ∫₀¹∫₀¹∫₀¹ (x+y+z) dxdydz = 3/2 = 1.5
 * const r3 = integracionMonteCarlo({
 *   f: ([x, y, z]) => x + y + z,
 *   limitesInferiores: [0, 0, 0],
 *   limitesSuperiores: [1, 1, 1],
 *   nMuestras: 100000,
 *   semilla: 42,
 * });
 * console.log(r3.resultado); // ≈ 1.5
 */
export function integracionMonteCarlo({
  f,
  limitesInferiores,
  limitesSuperiores,
  nMuestras = 10000,
  semilla = null,
}) {
  // --- Validación ---
  if (typeof f !== 'function') {
    throw new ErrorParametros(
      'ChuspaNumeric.integracionMonteCarlo: "f" debe ser una función que recibe un array de coordenadas.'
    );
  }

  if (!Array.isArray(limitesInferiores) || limitesInferiores.length === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.integracionMonteCarlo: "limitesInferiores" debe ser un array no vacío.'
    );
  }

  if (!Array.isArray(limitesSuperiores) || limitesSuperiores.length === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.integracionMonteCarlo: "limitesSuperiores" debe ser un array no vacío.'
    );
  }

  const d = limitesInferiores.length;

  if (limitesSuperiores.length !== d) {
    throw new ErrorParametros(
      `ChuspaNumeric.integracionMonteCarlo: "limitesInferiores" (longitud ${d}) y ` +
      `"limitesSuperiores" (longitud ${limitesSuperiores.length}) deben tener la misma longitud.`
    );
  }

  for (let i = 0; i < d; i++) {
    if (typeof limitesInferiores[i] !== 'number' || !isFinite(limitesInferiores[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.integracionMonteCarlo: limitesInferiores[${i}] = ${limitesInferiores[i]} no es un número finito.`
      );
    }
    if (typeof limitesSuperiores[i] !== 'number' || !isFinite(limitesSuperiores[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.integracionMonteCarlo: limitesSuperiores[${i}] = ${limitesSuperiores[i]} no es un número finito.`
      );
    }
    if (limitesSuperiores[i] <= limitesInferiores[i]) {
      throw new ErrorParametros(
        `ChuspaNumeric.integracionMonteCarlo: limitesSuperiores[${i}] (${limitesSuperiores[i]}) ` +
        `debe ser mayor que limitesInferiores[${i}] (${limitesInferiores[i]}).`
      );
    }
  }

  if (!Number.isInteger(nMuestras) || nMuestras < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.integracionMonteCarlo: "nMuestras" debe ser un entero positivo. Se recibió: ${nMuestras}.`
    );
  }

  // --- Configurar PRNG ---
  const aleatorio = semilla !== null
    ? crearPRNG(semilla)
    : () => Math.random();

  // Longitudes de cada dimensión: bᵢ - aᵢ
  const longitudes = limitesSuperiores.map((b, i) => b - limitesInferiores[i]);

  // Volumen del hipercubo de integración
  const volumen = longitudes.reduce((acc, l) => acc * l, 1);

  // --- Muestreo Monte Carlo ---
  let suma = 0;
  let sumaCuadrados = 0;
  const punto = new Array(d);

  for (let k = 0; k < nMuestras; k++) {
    // Generar punto aleatorio uniforme en el dominio
    for (let i = 0; i < d; i++) {
      punto[i] = limitesInferiores[i] + aleatorio() * longitudes[i];
    }

    const valor = f(punto);
    suma += valor;
    sumaCuadrados += valor * valor;
  }

  // Estimación de la integral: Volumen × media de f
  const mediaF = suma / nMuestras;
  const estimacion = volumen * mediaF;

  // Error estándar estimado: Volumen × std(f) / √N
  const varianzaF = sumaCuadrados / nMuestras - mediaF * mediaF;
  const errorEstandar = volumen * Math.sqrt(Math.max(0, varianzaF) / nMuestras);

  return crearResultado({
    resultado: estimacion,
    iteraciones: [
      {
        n: 1,
        estimacion,
        errorEstandar,
        volumen,
        nMuestras,
        dimensiones: d,
        mediaF,
      },
    ],
    convergio: true,
    mensaje:
      `Integración Monte Carlo completada. ` +
      `Estimación: ${estimacion.toFixed(8)}, ` +
      `Error estándar: ±${errorEstandar.toExponential(3)}, ` +
      `Dimensión: ${d}D, N: ${nMuestras}.`,
    meta: {
      metodo: 'monte-carlo',
      parametros: { d, nMuestras, semilla, volumen },
      tiempo_ms: 0,
    },
  });
}