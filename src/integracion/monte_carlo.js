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

import { media, desviacionEstandar } from '../utils/estadistica.js';
import { crearResultado, medirTiempo } from '../core/contrato.js';
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from '../core/errores.js';

const METODO = 'integracionMonteCarlo';
const PREFIJO = `ChuspaNumeric.${METODO}:`;
const N_MUESTRAS_POR_DEFECTO = 10000;

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
// Validadores locales
// ---------------------------------------------------------------------------

/**
 * Valida los parámetros de la forma 1D posicional (f, a, b, n).
 * Se conservan las mismas reglas y textos de error que tenía el original.
 *
 * @param {*} f
 * @param {*} a
 * @param {*} b
 * @param {*} n
 * @throws {ErrorParametros}
 */
function validarParametros1D(f, a, b, n) {
  if (typeof f !== 'function') {
    throw new ErrorParametros(
      `${PREFIJO} El primer argumento debe ser una función. Se recibió: ${typeof f}.`
    );
  }
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new ErrorParametros(
      `${PREFIJO} Los límites de integración deben ser números. Se recibió: a=${a}, b=${b}.`
    );
  }
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new ErrorParametros(
      `${PREFIJO} Los límites de integración deben ser números finitos. Se recibió: a=${a}, b=${b}.`
    );
  }
  if (a >= b) {
    throw new ErrorParametros(
      `${PREFIJO} El límite inferior debe ser menor que el superior. Se recibió: a=${a}, b=${b}.`
    );
  }
  if (!Number.isInteger(n) || n < 2) {
    throw new ErrorParametros(
      `${PREFIJO} El número de muestras debe ser un entero mayor o igual a 2. Se recibió: ${n}.`
    );
  }
}

/**
 * Valida que un valor sea un número finito.
 *
 * @param {*} valor
 * @param {string} nombre - Nombre descriptivo para el mensaje.
 * @throws {ErrorParametros}
 */
function validarNumeroFinitoMC(valor, nombre) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(`${PREFIJO} ${nombre} = ${valor} no es un número finito.`);
  }
}

/**
 * Valida que un valor sea un arreglo no vacío.
 *
 * @param {*} valor
 * @param {string} nombre
 * @throws {ErrorParametros}
 */
function validarArregloNoVacioMC(valor, nombre) {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new ErrorParametros(`${PREFIJO} "${nombre}" debe ser un array no vacío.`);
  }
}

/**
 * Valida que opciones sea un objeto plano (no null, no arreglo).
 *
 * @param {*} opciones
 * @throws {ErrorParametros}
 */
function validarObjetoOpcionesMC(opciones) {
  if (opciones !== null && typeof opciones === 'object' && !Array.isArray(opciones)) {
    return;
  }
  let recibido = typeof opciones;
  if (opciones === null) recibido = 'null';
  else if (Array.isArray(opciones)) recibido = 'array';
  throw new ErrorParametros(
    `${PREFIJO} se esperaba un objeto de opciones { f, limitesInferiores, limitesSuperiores, nMuestras, semilla }. Se recibió: ${recibido}.`
  );
}

/**
 * Valida los pares de límites de cada dimensión.
 *
 * @param {number[]} inferiores
 * @param {number[]} superiores
 * @throws {ErrorParametros}
 */
function validarLimitesMC(inferiores, superiores) {
  for (let i = 0; i < inferiores.length; i++) {
    validarNumeroFinitoMC(inferiores[i], `limitesInferiores[${i}]`);
    validarNumeroFinitoMC(superiores[i], `limitesSuperiores[${i}]`);
    if (superiores[i] <= inferiores[i]) {
      throw new ErrorParametros(
        `${PREFIJO} limitesSuperiores[${i}] (${superiores[i]}) ` +
          `debe ser mayor que limitesInferiores[${i}] (${inferiores[i]}).`
      );
    }
  }
}

/**
 * Valida el número de muestras (ya con su valor por defecto aplicado).
 *
 * @param {*} nMuestras
 * @throws {ErrorParametros}
 */
function validarNMuestrasMC(nMuestras) {
  if (!Number.isInteger(nMuestras) || nMuestras < 1) {
    throw new ErrorParametros(
      `${PREFIJO} "nMuestras" debe ser un entero positivo. Se recibió: ${nMuestras}.`
    );
  }
}

/**
 * Valida la semilla del PRNG. `null` (ya normalizado desde `undefined`)
 * significa "usar Math.random()"; cualquier otro valor debe ser un número finito.
 *
 * @param {*} semilla
 * @throws {ErrorParametros}
 */
function validarSemillaMC(semilla) {
  if (semilla === null) return;
  if (typeof semilla !== 'number' || !Number.isFinite(semilla)) {
    throw new ErrorParametros(
      `${PREFIJO} "semilla" debe ser null o un número finito. Se recibió: ${semilla}.`
    );
  }
}

/**
 * Valida los parámetros de integración multidimensional.
 * Aplica los mismos valores por defecto que la función de integración
 * (nMuestras = 10000, semilla = null), de modo que omitirlos es válido.
 *
 * @param {*} opciones - Objeto de opciones.
 * @returns {number} Número de dimensiones.
 * @throws {ErrorParametros}
 */
function validarParametrosMonteCarlo(opciones) {
  validarObjetoOpcionesMC(opciones);

  const {
    f,
    limitesInferiores,
    limitesSuperiores,
    nMuestras = N_MUESTRAS_POR_DEFECTO,
    semilla = null,
  } = opciones;

  if (typeof f !== 'function') {
    throw new ErrorParametros(
      `${PREFIJO} "f" debe ser una función que recibe un array de coordenadas.`
    );
  }

  validarArregloNoVacioMC(limitesInferiores, 'limitesInferiores');
  validarArregloNoVacioMC(limitesSuperiores, 'limitesSuperiores');

  const d = limitesInferiores.length;

  if (limitesSuperiores.length !== d) {
    throw new ErrorParametros(
      `${PREFIJO} "limitesSuperiores" debe tener la misma longitud que "limitesInferiores" ` +
        `(esperada: ${d}, recibida: ${limitesSuperiores.length}).`
    );
  }

  validarLimitesMC(limitesInferiores, limitesSuperiores);
  validarNMuestrasMC(nMuestras);
  validarSemillaMC(semilla);

  return d;
}

// ---------------------------------------------------------------------------
// Cierre común
// ---------------------------------------------------------------------------

/**
 * Verifica finitud del resultado y arma el objeto de contrato.
 *
 * @param {Object} datos
 * @param {number} datos.estimacion
 * @param {number} datos.errorEstandar
 * @param {number} datos.volumen
 * @param {number} datos.mediaF
 * @param {number} datos.nMuestras
 * @param {number} datos.d
 * @param {number|null} datos.semilla
 * @param {number} datos.tiempo_ms
 * @returns {Object} Resultado de `crearResultado`.
 * @throws {ErrorDivergencia} Si la estimación o el error no son finitos.
 */
function finalizar({
  estimacion,
  errorEstandar,
  volumen,
  mediaF,
  nMuestras,
  d,
  semilla,
  tiempo_ms,
}) {
  if (!Number.isFinite(estimacion) || !Number.isFinite(errorEstandar)) {
    throw new ErrorDivergencia(
      `${PREFIJO} la estimación no es finita (estimación=${estimacion}, error estándar=${errorEstandar}).`
    );
  }

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
      tiempo_ms,
    },
  });
}

// ---------------------------------------------------------------------------
// Forma 1D posicional
// ---------------------------------------------------------------------------

/**
 * Integración Monte Carlo 1D (f, a, b, n).
 *
 * @param {Function} f - Función a integrar. Recibe un número y devuelve un número.
 * @param {number} a - Límite inferior (finito).
 * @param {number} b - Límite superior (finito, mayor que a).
 * @param {number} [n=10000] - Número de muestras (entero, mínimo 2).
 * @returns {Object} Objeto del contrato de ChuspaNumeric, más los campos
 *   históricos `valor`, `errorEstandar`, `n`, `intervaloA` e `intervaloB`
 *   para compatibilidad con los llamadores existentes.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 * @throws {ErrorDominio} Si f devuelve un valor no numérico o no finito.
 * @throws {ErrorDivergencia} Si la estimación no es finita.
 */
function integracionMonteCarlo1D(f, a, b, n = N_MUESTRAS_POR_DEFECTO) {
  validarParametros1D(f, a, b, n);

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    const muestras = [];
    const ancho = b - a;

    for (let i = 0; i < n; i++) {
      const x = a + Math.random() * ancho;
      const fx = f(x);

      if (typeof fx !== 'number' || !isFinite(fx)) {
        throw new ErrorDominio(
          `${PREFIJO} La función devolvió un valor no numérico o infinito para x=${x}.`
        );
      }

      muestras.push(fx);
    }

    const mediaMuestral = media(muestras);
    const desviacionMuestral = desviacionEstandar(muestras, false); // muestral

    // Error estándar de la media: s / sqrt(n)
    const errorEstandar = (desviacionMuestral / Math.sqrt(n)) * ancho;

    return {
      estimacion: mediaMuestral * ancho,
      errorEstandar,
      volumen: ancho,
      mediaF: mediaMuestral,
    };
  });

  const contrato = finalizar({
    ...calculo,
    nMuestras: n,
    d: 1,
    semilla: null,
    tiempo_ms,
  });

  // Campos históricos de la interfaz 1D (compatibilidad con llamadores).
  return {
    ...contrato,
    valor: calculo.estimacion,
    errorEstandar: calculo.errorEstandar,
    n,
    intervaloA: a,
    intervaloB: b,
  };
}

// ---------------------------------------------------------------------------
// Forma multidimensional (objeto de opciones)
// ---------------------------------------------------------------------------

/**
 * Estima la integral de f sobre un hipercubo d-dimensional
 * [a₁,b₁] × [a₂,b₂] × ... × [aₐ,bₐ] mediante muestreo aleatorio uniforme.
 *
 * La estimación es:
 *   ∫f dx ≈ Volumen × (1/N) × Σ f(xᵢ)
 *
 * @param {Object}   params
 * @param {Function} params.f - Función a integrar. Recibe un array de d
 *   coordenadas `[x₁, ..., xₐ]` y devuelve un número. Para 1D recibe `[x]`.
 * @param {number[]} params.limitesInferiores - Límite inferior de cada dimensión.
 * @param {number[]} params.limitesSuperiores - Límite superior de cada
 *   dimensión. Cada bᵢ debe ser > aᵢ.
 * @param {number}   [params.nMuestras=10000] - Número de puntos aleatorios
 *   (entero positivo). Si se omite, se usa 10000.
 * @param {number|null} [params.semilla=null] - Semilla del PRNG. Si es `null`
 *   o se omite, usa `Math.random()` (no reproducible); si es un número
 *   finito, usa el PRNG interno determinista.
 *
 * @returns {Object} Objeto de resultado según el contrato de ChuspaNumeric:
 *   - `resultado`: estimación de la integral (number).
 *   - `iteraciones`: arreglo con un único registro `{ n, estimacion,
 *     errorEstandar, volumen, nMuestras, dimensiones, mediaF }`.
 *   - `convergio`: siempre `true` (se ejecuta exactamente nMuestras veces).
 *   - `mensaje`: descripción con estimación, error estándar y dimensión.
 *   - `meta`: `{ metodo: 'monte-carlo', parametros, tiempo_ms }`.
 *
 * @throws {ErrorParametros} Si las opciones no son un objeto, f no es función,
 *   los límites son inconsistentes o no finitos, algún límite superior ≤
 *   inferior, nMuestras no es un entero positivo, o semilla no es null ni un
 *   número finito.
 * @throws {ErrorDominio} Si f devuelve un valor no numérico o no finito.
 * @throws {ErrorDivergencia} Si la estimación no es finita.
 */
function integracionMonteCarloMultidimensional(opciones) {
  const d = validarParametrosMonteCarlo(opciones);
  const {
    f,
    limitesInferiores,
    limitesSuperiores,
    nMuestras = N_MUESTRAS_POR_DEFECTO,
    semilla = null,
  } = opciones;

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    const aleatorio = semilla !== null ? crearPRNG(semilla) : () => Math.random();

    // Longitudes de cada dimensión: bᵢ - aᵢ
    const longitudes = limitesSuperiores.map((b, i) => b - limitesInferiores[i]);

    // Volumen del hipercubo de integración
    const volumen = longitudes.reduce((acc, l) => acc * l, 1);

    let suma = 0;
    let sumaCuadrados = 0;
    const punto = new Array(d);

    for (let k = 0; k < nMuestras; k++) {
      for (let i = 0; i < d; i++) {
        punto[i] = limitesInferiores[i] + aleatorio() * longitudes[i];
      }

      const valor = f(punto);

      if (typeof valor !== 'number' || !Number.isFinite(valor)) {
        throw new ErrorDominio(
          `${PREFIJO} f devolvió un valor no numérico o no finito (${valor}) en el punto [${punto.join(', ')}].`
        );
      }

      suma += valor;
      sumaCuadrados += valor * valor;
    }

    const mediaF = suma / nMuestras;
    const varianzaF = sumaCuadrados / nMuestras - mediaF * mediaF;

    return {
      estimacion: volumen * mediaF,
      errorEstandar: volumen * Math.sqrt(Math.max(0, varianzaF) / nMuestras),
      volumen,
      mediaF,
    };
  });

  return finalizar({ ...calculo, nMuestras, d, semilla, tiempo_ms });
}

// ---------------------------------------------------------------------------
// API pública
// ---------------------------------------------------------------------------

/**
 * Integra mediante Monte Carlo conservando ambas interfaces públicas.
 * Ambas devuelven el objeto del contrato de ChuspaNumeric
 * (`resultado`, `iteraciones` [arreglo], `convergio`, `mensaje`, `meta`).
 * La forma 1D añade además `valor`, `errorEstandar`, `n`, `intervaloA` e
 * `intervaloB` por compatibilidad.
 *
 * @overload
 * @param {Function} f - Función unidimensional f(x).
 * @param {number} a - Límite inferior.
 * @param {number} b - Límite superior.
 * @param {number} [n=10000] - Número de muestras.
 * @returns {Object}
 *
 * @overload
 * @param {Object} params - Parámetros multidimensionales.
 * @param {Function} params.f - Función que recibe coordenadas.
 * @param {number[]} params.limitesInferiores
 * @param {number[]} params.limitesSuperiores
 * @param {number} [params.nMuestras=10000]
 * @param {number|null} [params.semilla=null]
 * @returns {Object}
 *
 * @throws {ErrorParametros} Si los argumentos no cumplen los requisitos.
 * @throws {ErrorDominio} Si f devuelve un valor no numérico o no finito.
 * @throws {ErrorDivergencia} Si la estimación no es finita.
 *
 * @example
 * // 1D: ∫₀¹ x² dx = 1/3
 * const r1 = integracionMonteCarlo(x => x * x, 0, 1, 100000);
 * console.log(r1.resultado, r1.valor, r1.errorEstandar);
 *
 * // 3D: ∫₀¹∫₀¹∫₀¹ (x+y+z) = 1.5 (nMuestras omitido: usa 10000)
 * const r3 = integracionMonteCarlo({
 *   f: ([x, y, z]) => x + y + z,
 *   limitesInferiores: [0, 0, 0],
 *   limitesSuperiores: [1, 1, 1],
 *   semilla: 42,
 * });
 * console.log(r3.resultado);
 */
export function integracionMonteCarlo(f, a, b, n) {
  if (typeof f === 'function' || arguments.length > 1) {
    return integracionMonteCarlo1D(f, a, b, n);
  }

  return integracionMonteCarloMultidimensional(f);
}
