import { ErrorParametros, ErrorTamano } from '../core/errores.js';

export function determinanteSarrus(A) {
  if (!Array.isArray(A)) {
    throw new ErrorParametros('La matriz debe ser un arreglo de arreglos');
  }
  if (A.length !== 3) {
    throw new ErrorTamano('La matriz debe ser 3x3');
  }
  for (const fila of A) {
    if (!Array.isArray(fila)) {
      throw new ErrorParametros('Cada fila de la matriz debe ser un arreglo');
    }
    if (fila.length !== 3) {
      throw new ErrorTamano('La matriz debe ser 3x3');
    }
    for (const elemento of fila) {
      if (typeof elemento !== 'number' || !Number.isFinite(elemento)) {
        throw new ErrorParametros('Todos los elementos de la matriz deben ser números finitos');
      }
    }
  }

  const principal =
    A[0][0] * A[1][1] * A[2][2] +
    A[0][1] * A[1][2] * A[2][0] +
    A[0][2] * A[1][0] * A[2][1];

  const secundaria =
    A[0][2] * A[1][1] * A[2][0] +
    A[0][0] * A[1][2] * A[2][1] +
    A[0][1] * A[1][0] * A[2][2];

  return principal - secundaria;
}
