import { crearResultado } from "../core/contrato.js";
import { ErrorDominio } from "../core/errores.js";
 
/**
 * Resuelve un sistema lineal A·x = b mediante el Método de Gauss-Jordan.
 * Lleva la matriz aumentada a la forma identidad eliminando hacia adelante y hacia atrás.
 *
 * @param {number[][]} A - Matriz de coeficientes cuadrada (n×n).
 * @param {number[]}   b - Vector de términos independientes (longitud n).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorDominio} Si se encuentra un pivote nulo y no puede resolverse.
 *
 * @example
 * const A = [[2,1,-1],[-3,-1,2],[-2,1,2]];
 * const b = [8, -11, -3];
 * const { resultado } = gaussJordan({ A, b });
 * // resultado ≈ [2, 3, -1]
 */
function gaussJordan({ A, b }) {
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
        if (M[i][k] !== 0) { filaPivote = i; break; }
      }
 
      if (filaPivote === -1) {
        throw new ErrorDominio(
          `ChuspaNumeric.gaussJordan: pivote nulo en la columna ${k}. ` +
          `El sistema puede ser singular o no tener solución única.`
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
 
  const resultado = M.map((fila) => fila[n]);
 
  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Sistema resuelto en ${numPaso} pasos de reducción.`,
    meta: {
      metodo: "gaussJordan",
      parametros: { A, b },
      tiempo_ms: 0,
    },
  });
}
 
export { gaussJordan };