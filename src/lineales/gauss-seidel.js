import { crearResultado } from "../core/contrato.js";
import { ErrorDominio } from "../core/errores.js";
import {
  validarMatrizCuadrada,
  validarVector,
  validarTolerancia,
  validarIteraciones,
} from "../utils/validaciones.js";

/**
 * Resuelve un sistema lineal A·x = b mediante el método iterativo de Gauss-Seidel.
 * Converge para matrices diagonalmente dominantes.
 *
 * En cada iteración utiliza los valores ya actualizados x_j^(k+1) para j < i
 * y los valores anteriores x_j^(k) para j > i.
 *
 * @param {Object} params
 * @param {number[][]} params.A                 - Matriz de coeficientes cuadrada (n×n).
 * @param {number[]} params.b                   - Vector de términos independientes (longitud n).
 * @param {number[]} [params.x0]                - Vector inicial. Por defecto vector de ceros.
 * @param {number} [params.tolerancia=1e-6]     - Criterio de parada basado en la norma euclidiana del error.
 * @param {number} [params.maxIter=100]         - Número máximo de iteraciones.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 */
function gaussSeidel({
  A,
  b,
  x0,
  tolerancia = 1e-6,
  maxIter = 100,
}) {
  validarMatrizCuadrada(A);

  const n = A.length;

  validarVector(b, n);
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  const xInicial = x0 ?? new Array(n).fill(0);

  validarVector(xInicial, n);

  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) {
      throw new ErrorDominio(
        `ChuspaNumeric.gaussSeidel: el elemento diagonal A[${i}][${i}] es cero. ` +
        `Considera reordenar las filas para que la diagonal sea no nula.`
      );
    }
  }

  let x = [...xInicial];
  const iteraciones = [];
  let convergio = false;

  for (let iter = 0; iter < maxIter; iter++) {
    const xAnterior = [...x];

    for (let i = 0; i < n; i++) {
      let sumaActualizada = 0;
      let sumaAnterior = 0;

      for (let j = 0; j < i; j++) {
        sumaActualizada += A[i][j] * x[j];
      }

      for (let j = i + 1; j < n; j++) {
        sumaAnterior += A[i][j] * xAnterior[j];
      }

      x[i] = (b[i] - sumaActualizada - sumaAnterior) / A[i][i];
    }

    const error = Math.sqrt(
      x.reduce((acum, val, i) => acum + (val - xAnterior[i]) ** 2, 0)
    );

    iteraciones.push({
      n: iter + 1,
      x: [...x],
      error,
    });

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
      metodo: "gauss-seidel",
      parametros: {
        A,
        b,
        x0: xInicial,
        tolerancia,
        maxIter,
      },
      tiempo_ms: 0,
    },
  });
}

export { gaussSeidel };