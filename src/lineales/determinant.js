// DETERMINANTES 2x2 Y 3x3

import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros, ErrorDivergencia } from "../core/errores.js";

function validarMatrizCuadradaN(matriz, n, funcion) {
  const p = `ChuspaNumeric.${funcion}`;

  if (!Array.isArray(matriz) || matriz.length === 0) {
    throw new ErrorParametros(
      `${p}: 'm' debe ser una matriz no vacía (arreglo de arreglos). Se recibió: ${typeof matriz}.`
    );
  }

  for (let i = 0; i < matriz.length; i++) {
    if (!Array.isArray(matriz[i])) {
      throw new ErrorParametros(`${p}: 'm[${i}]' no es un arreglo.`);
    }
  }

  const filas = matriz.length;
  const columnas = matriz[0].length;

  if (filas !== n) {
    throw new ErrorParametros(
      `${p}: dimensión incorrecta. Se esperaba una matriz ${n}x${n} y se recibió ${filas}x${columnas}.`
    );
  }

  for (let i = 0; i < n; i++) {
    if (matriz[i].length !== n) {
      throw new ErrorParametros(
        `${p}: dimensión incorrecta. Se esperaba una matriz ${n}x${n}, pero la fila ${i} tiene ${matriz[i].length} columnas (se esperaban ${n}).`
      );
    }
    for (let j = 0; j < n; j++) {
      if (typeof matriz[i][j] !== "number" || !Number.isFinite(matriz[i][j])) {
        throw new ErrorParametros(
          `${p}: 'm[${i}][${j}]' no es un número finito. Se recibió: ${matriz[i][j]}.`
        );
      }
    }
  }
}

/**
 * Ejecuta el cálculo midiendo tiempo y arma el resultado según el contrato.
 * `calculo` debe devolver el determinante (número).
 */
function finalizar(funcion, metodo, dimension, calculo) {
  const { valor, tiempo_ms } = medirTiempo(calculo);

  if (!Number.isFinite(valor)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${funcion}: el resultado no es finito (desbordamiento numérico).`
    );
  }

  return crearResultado({
    resultado: valor,
    iteraciones: [],
    convergio: true,
    mensaje: "Operación directa completada correctamente (no iterativa).",
    meta: {
      metodo,
      parametros: { dimension: [dimension, dimension] },
      tiempo_ms,
    },
  });
}

/**
 * Calcula el determinante de una matriz 2x2.
 *
 * El valor del determinante se obtiene en la propiedad `resultado` del objeto
 * devuelto (antes la función devolvía directamente el número).
 *
 * @param {number[][]} m Matriz 2x2 de números finitos.
 * @returns {Object} Resultado según el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si m no es una matriz, no es 2x2 o contiene valores no finitos.
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 */
export function det2x2(m) {
  const f = "det2x2";
  validarMatrizCuadradaN(m, 2, f);

  return finalizar(f, "determinante-2x2", 2, () => {
    const [[a, b], [c, d]] = m;
    return a * d - b * c;
  });
}

/**
 * Calcula el determinante de una matriz 3x3 (regla de Sarrus / cofactores).
 *
 * El valor del determinante se obtiene en la propiedad `resultado` del objeto
 * devuelto (antes la función devolvía directamente el número).
 *
 * @param {number[][]} m Matriz 3x3 de números finitos.
 * @returns {Object} Resultado según el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si m no es una matriz, no es 3x3 o contiene valores no finitos.
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 */
export function det3x3(m) {
  const f = "det3x3";
  validarMatrizCuadradaN(m, 3, f);

  return finalizar(f, "determinante-3x3", 3, () => {
    const [
      [a, b, c],
      [d, e, g],
      [h, i, j],
    ] = m;
    return a * (e * j - g * i) - b * (d * j - g * h) + c * (d * i - e * h);
  });
}
