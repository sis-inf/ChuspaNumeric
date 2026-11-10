/**
 * Norma euclideana de un vector.
 * ||v|| = sqrt(sum(v_i^2))
 */
export function normaEuclideana(v) {
  if (!Array.isArray(v) || v.length === 0) {
    throw new Error("El vector no puede estar vacío");
  }

  const suma = v.reduce((acc, x) => acc + x * x, 0);
  return Math.sqrt(suma);
}

/**
 * Norma infinita de un vector.
 * max(|v_i|)
 */
export function normaInfinita(v) {
  if (!Array.isArray(v) || v.length === 0) {
    throw new Error("El vector no puede estar vacío");
  }

  return Math.max(...v.map(Math.abs));
}

/**
 * Norma de Frobenius de una matriz.
 * sqrt(sum(a_ij^2))
 */
export function normaFrobenius(A) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new Error("La matriz no puede estar vacía");
  }

  const suma = A.flat().reduce((acc, x) => acc + x * x, 0);
  return Math.sqrt(suma);
}

/**
 * Valida que A sea una matriz (array bidimensional) no vacía, con filas no
 * vacías de igual longitud y elementos numéricos finitos.
 * @param {number[][]} A - Matriz a validar
 * @throws {Error} Si la matriz no es válida
 */
function validarMatriz(A) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new Error('La matriz no puede estar vacía');
  }

  if (!Array.isArray(A[0]) || A[0].length === 0) {
    throw new Error('Las filas de la matriz no pueden estar vacías');
  }

  const columnas = A[0].length;
  for (const fila of A) {
    if (!Array.isArray(fila) || fila.length !== columnas) {
      throw new Error('Todas las filas de la matriz deben ser arrays de igual longitud');
    }
    if (!fila.every((x) => typeof x === 'number' && Number.isFinite(x))) {
      throw new Error('Todos los elementos de la matriz deben ser números finitos');
    }
  }
}

/**
 * Norma 1 de una matriz (máxima suma de columnas en valor absoluto).
 * max_j(sum_i |a_ij|)
 *
 * @param {number[][]} A - Matriz
 * @returns {number} La norma 1 de A
 * @throws {Error} Si la matriz no es válida
 *
 * @example
 * norma1Matriz([[1, -2], [-3, 4]]) // 6
 */
export function norma1Matriz(A) {
  validarMatriz(A);

  const sumasColumnas = A[0].map((_, j) => A.reduce((acc, fila) => acc + Math.abs(fila[j]), 0));
  return Math.max(...sumasColumnas);
}

/**
 * Norma infinito de una matriz (máxima suma de filas en valor absoluto).
 * max_i(sum_j |a_ij|)
 *
 * @param {number[][]} A - Matriz
 * @returns {number} La norma infinito de A
 * @throws {Error} Si la matriz no es válida
 *
 * @example
 * normaInfinitaMatriz([[1, -2], [-3, 4]]) // 7
 */
export function normaInfinitaMatriz(A) {
  validarMatriz(A);

  const sumasFilas = A.map((fila) => fila.reduce((acc, x) => acc + Math.abs(x), 0));
  return Math.max(...sumasFilas);
}
