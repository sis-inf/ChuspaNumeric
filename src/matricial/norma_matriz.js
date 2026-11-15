import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Valida que v sea un vector (arreglo) no vacío de números finitos.
 * @param {number[]} v - Vector a validar
 * @param {string} nombre - Nombre de la función que valida (para el mensaje)
 * @throws {ErrorParametros} Si el vector no es válido
 */
function validarVector(v, nombre) {
  if (!Array.isArray(v)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombre}: el vector debe ser un arreglo. Se recibió: ${typeof v}.`,
    );
  }
  if (v.length === 0) {
    throw new ErrorParametros(`ChuspaNumeric.${nombre}: el vector no puede estar vacío.`);
  }
  if (!v.every((x) => typeof x === 'number' && Number.isFinite(x))) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombre}: todos los elementos del vector deben ser números finitos.`,
    );
  }
}

/**
 * Valida que A sea una matriz (array bidimensional) no vacía, con filas no
 * vacías de igual longitud y elementos numéricos finitos.
 * @param {number[][]} A - Matriz a validar
 * @param {string} nombre - Nombre de la función que valida (para el mensaje)
 * @throws {ErrorParametros} Si la matriz no es válida
 */
function validarMatriz(A, nombre) {
  if (!Array.isArray(A)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombre}: la matriz debe ser un arreglo de arreglos. Se recibió: ${typeof A}.`,
    );
  }
  if (A.length === 0) {
    throw new ErrorParametros(`ChuspaNumeric.${nombre}: la matriz no puede estar vacía.`);
  }
  if (!Array.isArray(A[0]) || A[0].length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombre}: las filas de la matriz no pueden estar vacías.`,
    );
  }

  const columnas = A[0].length;
  for (const fila of A) {
    if (!Array.isArray(fila) || fila.length !== columnas) {
      throw new ErrorParametros(
        `ChuspaNumeric.${nombre}: todas las filas de la matriz deben ser arreglos de igual longitud (${columnas}).`,
      );
    }
    if (!fila.every((x) => typeof x === 'number' && Number.isFinite(x))) {
      throw new ErrorParametros(
        `ChuspaNumeric.${nombre}: todos los elementos de la matriz deben ser números finitos.`,
      );
    }
  }
}

/**
 * Arma el resultado uniforme de una norma (cálculo directo, sin iteraciones).
 */
function resultadoNorma(valor, tiempo_ms, mensaje, metodo, parametros) {
  return crearResultado({
    resultado: valor,
    iteraciones: [],
    convergio: true,
    mensaje,
    meta: { metodo, parametros, tiempo_ms },
  });
}

/**
 * Norma euclideana de un vector.
 * ||v|| = sqrt(sum(v_i^2))
 *
 * @param {number[]} v - Vector de números finitos, no vacío.
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es la norma, `convergio` es true (cálculo directo) y
 *   `meta.metodo` es 'norma-euclideana'.
 * @throws {ErrorParametros} Si v no es un vector no vacío de números finitos.
 */
export function normaEuclideana(v) {
  validarVector(v, 'normaEuclideana');

  const { valor, tiempo_ms } = medirTiempo(() => Math.sqrt(v.reduce((acc, x) => acc + x * x, 0)));

  return resultadoNorma(valor, tiempo_ms, 'Norma euclideana calculada.', 'norma-euclideana', {
    longitud: v.length,
  });
}

/**
 * Norma infinita de un vector.
 * max(|v_i|)
 *
 * @param {number[]} v - Vector de números finitos, no vacío.
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es la norma, `convergio` es true (cálculo directo) y
 *   `meta.metodo` es 'norma-infinita'.
 * @throws {ErrorParametros} Si v no es un vector no vacío de números finitos.
 */
export function normaInfinita(v) {
  validarVector(v, 'normaInfinita');

  const { valor, tiempo_ms } = medirTiempo(() => Math.max(...v.map(Math.abs)));

  return resultadoNorma(valor, tiempo_ms, 'Norma infinita calculada.', 'norma-infinita', {
    longitud: v.length,
  });
}

/**
 * Norma de Frobenius de una matriz.
 * sqrt(sum(a_ij^2))
 *
 * @param {number[][]} A - Matriz de números finitos, no vacía.
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es la norma, `convergio` es true (cálculo directo) y
 *   `meta.metodo` es 'norma-frobenius'.
 * @throws {ErrorParametros} Si A no es una matriz válida.
 */
export function normaFrobenius(A) {
  validarMatriz(A, 'normaFrobenius');

  const { valor, tiempo_ms } = medirTiempo(() =>
    Math.sqrt(A.flat().reduce((acc, x) => acc + x * x, 0)),
  );

  return resultadoNorma(valor, tiempo_ms, 'Norma de Frobenius calculada.', 'norma-frobenius', {
    filas: A.length,
    columnas: A[0].length,
  });
}

/**
 * Norma 1 de una matriz (máxima suma de columnas en valor absoluto).
 * max_j(sum_i |a_ij|)
 *
 * @param {number[][]} A - Matriz
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es la norma 1, `convergio` es true (cálculo directo) y
 *   `meta.metodo` es 'norma-1-matriz'.
 * @throws {ErrorParametros} Si la matriz no es válida
 *
 * @example
 * norma1Matriz([[1, -2], [-3, 4]]).resultado // 6
 */
export function norma1Matriz(A) {
  validarMatriz(A, 'norma1Matriz');

  const { valor, tiempo_ms } = medirTiempo(() => {
    const sumasColumnas = A[0].map((_, j) => A.reduce((acc, fila) => acc + Math.abs(fila[j]), 0));
    return Math.max(...sumasColumnas);
  });

  return resultadoNorma(valor, tiempo_ms, 'Norma 1 de la matriz calculada.', 'norma-1-matriz', {
    filas: A.length,
    columnas: A[0].length,
  });
}

/**
 * Norma infinito de una matriz (máxima suma de filas en valor absoluto).
 * max_i(sum_j |a_ij|)
 *
 * @param {number[][]} A - Matriz
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es la norma infinito, `convergio` es true (cálculo directo) y
 *   `meta.metodo` es 'norma-infinita-matriz'.
 * @throws {ErrorParametros} Si la matriz no es válida
 *
 * @example
 * normaInfinitaMatriz([[1, -2], [-3, 4]]).resultado // 7
 */
export function normaInfinitaMatriz(A) {
  validarMatriz(A, 'normaInfinitaMatriz');

  const { valor, tiempo_ms } = medirTiempo(() => {
    const sumasFilas = A.map((fila) => fila.reduce((acc, x) => acc + Math.abs(x), 0));
    return Math.max(...sumasFilas);
  });

  return resultadoNorma(
    valor,
    tiempo_ms,
    'Norma infinito de la matriz calculada.',
    'norma-infinita-matriz',
    { filas: A.length, columnas: A[0].length },
  );
}
