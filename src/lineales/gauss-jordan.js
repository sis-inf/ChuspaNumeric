import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from "../core/errores.js";

const METODO = "gaussJordan";

/**
 * Valida que `valor` sea un número finito.
 * @param {*} valor
 * @param {string} nombre - Descripción del parámetro para el mensaje de error.
 * @throws {ErrorParametros}
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: ${nombre} debe ser un número finito (recibido: ${String(valor)}).`,
    );
  }
}

/**
 * Valida el sistema A·x = b: tipos, finitud y dimensiones compatibles.
 * @param {*} A
 * @param {*} b
 * @throws {ErrorParametros}
 */
function validarSistema(A, b) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: A debe ser una matriz (arreglo de arreglos) no vacía.`,
    );
  }

  const n = A.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: la fila ${i} de A debe ser un arreglo.`,
      );
    }
    if (A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: A debe ser cuadrada (${n}x${n}); la fila ${i} tiene ${A[i].length} columnas.`,
      );
    }
    for (let j = 0; j < n; j++) {
      validarNumeroFinito(A[i][j], `A[${i}][${j}]`);
    }
  }

  if (!Array.isArray(b)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: b debe ser un arreglo de números.`,
    );
  }
  if (b.length !== n) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: dimensiones incompatibles, A es ${n}x${n} pero b tiene longitud ${b.length}.`,
    );
  }
  for (let i = 0; i < n; i++) {
    validarNumeroFinito(b[i], `b[${i}]`);
  }
}

/**
 * Centraliza verificación de finitud y armado del contrato.
 * @param {Object} datos
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorDivergencia} Si la solución contiene valores no finitos.
 */
function finalizar({ resultado, iteraciones, numPaso, A, b, tiempo_ms }) {
  if (!resultado.every(Number.isFinite)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: la solución contiene valores no finitos (posible inestabilidad numérica).`,
    );
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Sistema resuelto en ${numPaso} pasos de reducción.`,
    meta: {
      metodo: METODO,
      parametros: { A, b },
      tiempo_ms,
    },
  });
}

/**
 * Resuelve un sistema lineal A·x = b mediante el Método de Gauss-Jordan.
 * Lleva la matriz aumentada a la forma identidad eliminando hacia adelante y hacia atrás.
 *
 * @param {Object}     opciones
 * @param {number[][]} opciones.A - Matriz de coeficientes cuadrada (n×n) con valores finitos.
 * @param {number[]}   opciones.b - Vector de términos independientes (longitud n) con valores finitos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si A o b no son válidos o sus dimensiones son incompatibles.
 * @throws {ErrorDominio} Si se encuentra un pivote nulo y no puede resolverse.
 * @throws {ErrorDivergencia} Si la solución contiene valores no finitos.
 *
 * @example
 * const A = [[2,1,-1],[-3,-1,2],[-2,1,2]];
 * const b = [8, -11, -3];
 * const { resultado } = gaussJordan({ A, b });
 * // resultado ≈ [2, 3, -1]
 */
function gaussJordan(opciones) {
  if (opciones === null || typeof opciones !== "object") {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b }.`,
    );
  }

  const { A, b } = opciones;
  validarSistema(A, b);

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    const n = A.length;

    // Construir matriz aumentada [A | b]
    const M = A.map((fila, i) => [...fila, b[i]]);
    const iteraciones = [];
    let numPaso = 0;

    for (let k = 0; k < n; k++) {
      // Pivoteo parcial si el pivote es cero
      if (M[k][k] === 0) {
        let filaPivote = -1;
        for (let i = k + 1; i < n; i++) {
          if (M[i][k] !== 0) {
            filaPivote = i;
            break;
          }
        }

        if (filaPivote === -1) {
          throw new ErrorDominio(
            `ChuspaNumeric.${METODO}: pivote nulo en la columna ${k}. ` +
              `El sistema puede ser singular o no tener solución única.`,
          );
        }

        [M[k], M[filaPivote]] = [M[filaPivote], M[k]];

        iteraciones.push({
          n: ++numPaso,
          paso: `intercambio`,
          descripcion: `Intercambio de fila ${k} con fila ${filaPivote}`,
          matriz: M.map((fila) => [...fila]),
          vector: M.map((fila) => fila[n]),
        });
      }

      // Normalizar fila pivote
      const pivote = M[k][k];
      for (let j = 0; j <= n; j++) M[k][j] /= pivote;

      iteraciones.push({
        n: ++numPaso,
        paso: `normalizacion`,
        descripcion: `Normalización de fila ${k} (pivote = ${pivote.toFixed(4)})`,
        matriz: M.map((fila) => [...fila]),
        vector: M.map((fila) => fila[n]),
      });

      // Eliminar columna k en todas las demás filas (arriba y abajo)
      for (let i = 0; i < n; i++) {
        if (i !== k) {
          const factor = M[i][k];
          for (let j = 0; j <= n; j++) M[i][j] -= factor * M[k][j];

          iteraciones.push({
            n: ++numPaso,
            paso: `eliminacion`,
            descripcion: `Eliminación en fila ${i} usando fila ${k} (factor = ${factor.toFixed(4)})`,
            matriz: M.map((fila) => [...fila]),
            vector: M.map((fila) => fila[n]),
          });
        }
      }
    }

    return { resultado: M.map((fila) => fila[n]), iteraciones, numPaso };
  });

  return finalizar({ ...calculo, A, b, tiempo_ms });
}

export { gaussJordan };
