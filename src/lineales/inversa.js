import { crearResultado } from '../core/contrato.js';
import { ErrorParametros, ErrorDominio } from '../core/errores.js';
import { gaussJordan } from './gauss-jordan.js';

function obtenerMatriz(entrada) {
  if (Array.isArray(entrada)) {
    return entrada;
  }

  if (entrada && Array.isArray(entrada.A)) {
    return entrada.A;
  }

  throw new ErrorParametros(
    "ChuspaNumeric.calcularInversa: debe proporcionar una matriz cuadrada usando calcularInversa({ A }) o calcularInversa(A)."
  );
}

function validarMatrizCuadrada(A) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new ErrorParametros(
      "ChuspaNumeric.calcularInversa: 'A' debe ser una matriz cuadrada no vacía."
    );
  }

  const n = A.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i]) || A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.calcularInversa: 'A' debe ser cuadrada. La fila ${i} no tiene longitud ${n}.`
      );
    }

    for (let j = 0; j < n; j++) {
      if (typeof A[i][j] !== 'number' || !Number.isFinite(A[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.calcularInversa: A[${i}][${j}] debe ser un número finito.`
        );
      }
    }
  }
}

function clonarMatriz(A) {
  return A.map((fila) => [...fila]);
}

function columnaIdentidad(n, columna) {
  return Array.from({ length: n }, (_, i) => (i === columna ? 1 : 0));
}

/**
 * Calcula la matriz inversa A^-1 resolviendo A·x = e_i para cada columna
 * de la matriz identidad.
 *
 * Esta implementación reutiliza el método público `gaussJordan`, evitando
 * duplicar la lógica de eliminación. Para cada columna e_i de la identidad,
 * se resuelve el sistema A·x = e_i; cada solución x forma una columna de A^-1.
 *
 * @param {Object|number[][]} entrada - Objeto { A } o matriz A directamente.
 * @param {number[][]} entrada.A - Matriz cuadrada a invertir.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si A no es una matriz cuadrada válida.
 * @throws {ErrorDominio} Si A es singular y no tiene inversa.
 *
 * @example
 * const { resultado } = calcularInversa({
 *   A: [
 *     [4, 7],
 *     [2, 6],
 *   ],
 * });
 *
 * // resultado ≈ [
 * //   [0.6, -0.7],
 * //   [-0.2, 0.4],
 * // ]
 */
function calcularInversa(entrada) {
  const A = obtenerMatriz(entrada);
  validarMatrizCuadrada(A);

  const n = A.length;
  const inversa = Array.from({ length: n }, () => Array(n).fill(0));
  const iteraciones = [];

  try {
    for (let columna = 0; columna < n; columna++) {
      const b = columnaIdentidad(n, columna);
      const resultadoColumna = gaussJordan({
        A: clonarMatriz(A),
        b,
      });

      for (let fila = 0; fila < n; fila++) {
        inversa[fila][columna] = resultadoColumna.resultado[fila];
      }

      iteraciones.push({
        n: columna + 1,
        paso: 'resolver_columna_identidad',
        descripcion: `Resolución de A·x = e_${columna} para construir la columna ${columna} de A^-1.`,
        vectorIdentidad: b,
        solucion: resultadoColumna.resultado,
        iteracionesGaussJordan: resultadoColumna.iteraciones,
      });
    }
  } catch (error) {
    if (error instanceof ErrorDominio) {
      throw new ErrorDominio(
        `ChuspaNumeric.calcularInversa: la matriz es singular o no tiene inversa. ${error.message}`
      );
    }

    throw error;
  }

  return crearResultado({
    resultado: inversa,
    iteraciones,
    convergio: true,
    mensaje: `Matriz inversa calculada resolviendo ${n} sistema(s) con Gauss-Jordan.`,
    meta: {
      metodo: 'calcularInversa',
      parametros: { A },
      tiempo_ms: 0,
    },
  });
}

export { calcularInversa };