import { crearResultado } from "../core/contrato.js";
import { ErrorDominio } from "../core/errores.js";
import {
  validarMatrizCuadrada,
  validarVector,
  validarTolerancia,
  validarIteraciones,
} from "../utils/validaciones.js";

/**
 * Resuelve un sistema lineal A·x = b mediante el Método iterativo de Jacobi.
 * Converge para matrices diagonalmente dominantes.
 *
 * @param {number[][]} A                - Matriz de coeficientes cuadrada (n×n).
 * @param {number[]}   b                - Vector de términos independientes (longitud n).
 * @param {number[]}   [x0]             - Vector inicial. Por defecto vector de ceros.
 * @param {number}     [tolerancia=1e-6] - Criterio de parada (norma euclidiana del error).
 * @param {number}     [maxIter=100]     - Número máximo de iteraciones.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 */
function jacobi({ A, b, x0, tolerancia = 1e-6, maxIter = 100 }) {
  // Validaciones

  validarMatrizCuadrada(A);
  const n = A.length;
  validarVector(b, n);
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  // x0 por defecto: vector de ceros
  const xInicial = x0 ?? new Array(n).fill(0);
  validarVector(xInicial, n);

  // Verificar que no haya ceros en la diagonal
  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) {
      throw new ErrorDominio(
        `ChuspaNumeric.jacobi: el elemento diagonal A[${i}][${i}] es cero. ` +
        `Considera reordenar las filas para que la diagonal sea no nula.`
      );
    }
  }

  // Iteraciones de Jacobi 

  let x = [...xInicial];
  const iteraciones = [];
  let convergio = false;

  for (let iter = 0; iter < maxIter; iter++) {
    const xNuevo = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let suma = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) suma += A[i][j] * x[j];
      }
      xNuevo[i] = (b[i] - suma) / A[i][i];
    }

    const error = Math.sqrt(
      xNuevo.reduce((acum, val, i) => acum + (val - x[i]) ** 2, 0)
    );

    iteraciones.push({ n: iter + 1, x: [...xNuevo], error });

    x = xNuevo;

    if (error < tolerancia) {
      convergio = true;
      break;
    }
  }

  return crearResultado({
    resultado: x,
    iteraciones,
    convergio,
    mensaje: convergio
      ? `Convergió en ${iteraciones.length} iteraciones.`
      : `Se alcanzó el máximo de ${maxIter} iteraciones sin converger.`,
    meta: {
      metodo: "jacobi",
      parametros: { A, b, x0: xInicial, tolerancia, maxIter },
      tiempo_ms: 0,
    },
  });
}

export { jacobi };
