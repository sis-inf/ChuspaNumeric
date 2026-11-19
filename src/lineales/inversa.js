import { crearResultado, medirTiempo } from '../core/contrato.js';
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from '../core/errores.js';
import { gaussJordan } from './gauss-jordan.js';

const METODO = 'calcularInversa';

function describir(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  return typeof valor;
}

/**
 * Valida que la entrada sea una matriz A o un objeto { A } y devuelve A.
 */
function obtenerMatriz(entrada) {
  if (entrada === null || typeof entrada !== 'object') {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: debe proporcionar una matriz cuadrada usando ${METODO}({ A }) o ${METODO}(A). Se recibió: ${describir(entrada)}.`
    );
  }

  const A = Array.isArray(entrada) ? entrada : entrada.A;

  if (!Array.isArray(A)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'A' debe ser una matriz (array de arrays). Se recibió: ${describir(A)}.`
    );
  }

  return A;
}

/**
 * Valida que A sea cuadrada, no vacía y con todos sus valores finitos.
 */
function validarMatrizCuadrada(A) {
  if (A.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'A' debe ser una matriz cuadrada no vacía.`
    );
  }

  const n = A.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: la fila ${i} de 'A' debe ser un array. Se recibió: ${describir(A[i])}.`
      );
    }

    if (A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: 'A' debe ser cuadrada (${n}x${n}). La fila ${i} tiene longitud ${A[i].length}.`
      );
    }

    for (let j = 0; j < n; j++) {
      if (typeof A[i][j] !== 'number' || !Number.isFinite(A[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.${METODO}: A[${i}][${j}] debe ser un número finito. Se recibió: ${String(A[i][j])}.`
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
 * Verifica que la inversa sea finita y arma el resultado del contrato.
 * No llama a medirTiempo: recibe tiempo_ms ya medido.
 */
function finalizar({ A, inversa, iteraciones, n, tiempo_ms }) {
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!Number.isFinite(inversa[i][j])) {
        throw new ErrorDivergencia(
          `ChuspaNumeric.${METODO}: la inversa contiene un valor no finito en [${i}][${j}] (${inversa[i][j]}).`
        );
      }
    }
  }

  return crearResultado({
    resultado: inversa,
    iteraciones,
    convergio: true,
    mensaje: `Matriz inversa calculada resolviendo ${n} sistema(s) con Gauss-Jordan.`,
    meta: {
      metodo: METODO,
      parametros: { A },
      tiempo_ms,
    },
  });
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
 * @param {number[][]} entrada.A - Matriz cuadrada a invertir (valores finitos).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si la entrada no es objeto/matriz, o A no es una
 *   matriz cuadrada no vacía de números finitos.
 * @throws {ErrorDominio} Si A es singular y no tiene inversa.
 * @throws {ErrorDivergencia} Si la inversa calculada contiene valores no finitos.
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

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
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
          `ChuspaNumeric.${METODO}: la matriz es singular o no tiene inversa. ${error.message}`
        );
      }

      throw error;
    }

    return { inversa, iteraciones };
  });

  return finalizar({
    A,
    inversa: calculo.inversa,
    iteraciones: calculo.iteraciones,
    n,
    tiempo_ms,
  });
}

export { calcularInversa };
