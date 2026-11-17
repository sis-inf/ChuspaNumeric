import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Calcula el determinante de una matriz 3x3 mediante la regla de Sarrus.
 *
 * @param {number[][]} A - Matriz 3x3 de números finitos.
 * @returns {Object} Resultado uniforme del contrato de ChuspaNumeric:
 *   `resultado` es el determinante, `convergio` es true (cálculo directo)
 *   y `meta.metodo` es 'sarrus'.
 * @throws {ErrorParametros} Si A no es una matriz 3x3 de números finitos.
 */
export function determinanteSarrus(A) {
  if (!Array.isArray(A)) {
    throw new ErrorParametros(
      'ChuspaNumeric.determinanteSarrus: la matriz debe ser un arreglo de arreglos.',
    );
  }
  if (A.length !== 3) {
    throw new ErrorParametros(
      `ChuspaNumeric.determinanteSarrus: la matriz debe ser 3x3. Se recibieron ${A.length} filas.`,
    );
  }
  for (const fila of A) {
    if (!Array.isArray(fila)) {
      throw new ErrorParametros(
        'ChuspaNumeric.determinanteSarrus: cada fila de la matriz debe ser un arreglo.',
      );
    }
    if (fila.length !== 3) {
      throw new ErrorParametros(
        `ChuspaNumeric.determinanteSarrus: la matriz debe ser 3x3. Se recibió una fila de ${fila.length} elementos.`,
      );
    }
    for (const elemento of fila) {
      if (typeof elemento !== 'number' || !Number.isFinite(elemento)) {
        throw new ErrorParametros(
          'ChuspaNumeric.determinanteSarrus: todos los elementos de la matriz deben ser números finitos.',
        );
      }
    }
  }

  const { valor, tiempo_ms } = medirTiempo(() => {
    const principal =
      A[0][0] * A[1][1] * A[2][2] +
      A[0][1] * A[1][2] * A[2][0] +
      A[0][2] * A[1][0] * A[2][1];

    const secundaria =
      A[0][2] * A[1][1] * A[2][0] +
      A[0][0] * A[1][2] * A[2][1] +
      A[0][1] * A[1][0] * A[2][2];

    return principal - secundaria;
  });

  return crearResultado({
    resultado: valor,
    iteraciones: [],
    convergio: true,
    mensaje: 'Determinante calculado con la regla de Sarrus.',
    meta: {
      metodo: 'sarrus',
      parametros: { filas: 3, columnas: 3 },
      tiempo_ms,
    },
  });
}