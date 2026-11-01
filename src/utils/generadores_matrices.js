/**
 * @fileoverview Generadores de matrices de prueba con propiedades matematicas garantizadas.
 * Utiles para tests, ejemplos y validacion de metodos numericos.
 */

import { ErrorDominio } from "../core/errores.js";
import { crearGeneradorAleatorio } from "./prng.js";

/**
 * Crea una matriz identidad de tamano n*n.
 * @param {number} n - Dimension de la matriz (entero positivo)
 * @returns {number[][]} Matriz identidad I_n
 * @throws {ErrorDominio} Si n no es un entero positivo
 */
export function matrizIdentidad(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.matrizIdentidad: n debe ser un entero positivo. Recibido: ${n}`
    );
  }
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}

/**
 * Crea una matriz de Hilbert de tamano n*n.
 * Clasico ejemplo de matriz mal condicionada.
 * H[i][j] = 1 / (i + j + 1)
 *
 * @param {number} n - Dimension de la matriz (entero positivo)
 * @returns {number[][]} Matriz de Hilbert
 * @throws {ErrorDominio} Si n no es un entero positivo
 */
export function matrizHilbert(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.matrizHilbert: n debe ser un entero positivo. Recibido: ${n}`
    );
  }
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => 1 / (i + j + 1))
  );
}

/**
 * Crea una matriz aleatoria diagonalmente dominante de tamano n*n.
 * Util para garantizar convergencia de Jacobi y Gauss-Seidel.
 *
 * @param {number} n - Dimension de la matriz (entero positivo)
 * @param {number|null} [semilla=null] - Semilla para reproducibilidad
 * @returns {number[][]} Matriz diagonalmente dominante
 * @throws {ErrorDominio} Si n no es un entero positivo
 */
export function matrizDiagonalDominante(n, semilla = null) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.matrizDiagonalDominante: n debe ser un entero positivo. Recibido: ${n}`
    );
  }

  const random = crearGeneradorAleatorio(semilla);

  return Array.from({ length: n }, (_, i) => {
    const fila = Array.from({ length: n }, (_, j) => {
      if (i === j) return 0;
      return random() * 10 - 5;
    });

    const sumaOffDiagonal = fila.reduce(
      (s, v, j) => s + (i !== j ? Math.abs(v) : 0),
      0
    );
    fila[i] = sumaOffDiagonal + random() * 5 + 1;

    return fila;
  });
}

/**
 * Crea una matriz simetrica definida positiva de tamano n*n.
 * Util para Cholesky (requiere A = A^T y x^T A x > 0).
 * Construida como A = B^T * B + n * I, garantizando definida positiva.
 *
 * @param {number} n - Dimension de la matriz (entero positivo)
 * @param {number|null} [semilla=null] - Semilla para reproducibilidad
 * @returns {number[][]} Matriz simetrica definida positiva
 * @throws {ErrorDominio} Si n no es un entero positivo
 */
export function matrizSimetricaDefinidaPositiva(n, semilla = null) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.matrizSimetricaDefinidaPositiva: n debe ser un entero positivo. Recibido: ${n}`
    );
  }

  const random = crearGeneradorAleatorio(semilla);

  const B = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => random() * 10 - 5)
  );

  const BTB = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => {
      let suma = 0;
      for (let k = 0; k < n; k++) {
        suma += B[k][i] * B[k][j];
      }
      return suma;
    })
  );

  for (let i = 0; i < n; i++) {
    BTB[i][i] += n;
  }

  return BTB;
}

/**
 * Verifica si una matriz es diagonalmente dominante.
 * @param {number[][]} A
 * @returns {boolean}
 */
export function esDiagonalDominante(A) {
  return A.every((fila, i) => {
    const diagonal = Math.abs(fila[i]);
    const sumaResto = fila.reduce(
      (s, v, j) => s + (i !== j ? Math.abs(v) : 0),
      0
    );
    return diagonal > sumaResto;
  });
}

/**
 * Verifica si una matriz es simetrica.
 * @param {number[][]} A
 * @returns {boolean}
 */
export function esSimetrica(A) {
  const n = A.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[i][j] - A[j][i]) > 1e-12) return false;
    }
  }
  return true;
}