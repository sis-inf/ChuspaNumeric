import { crearResultado } from "../core/contrato.js";
import { ErrorDominio, ErrorParametros } from "../core/errores.js";
import {
  validarNumero,
  validarMatrizCuadrada,
  validarVector,
  validarTolerancia,
  validarIteraciones,
} from "../utils/validaciones.js";

/**
 * Resuelve un sistema lineal A·x = b mediante el método de sobre-relajación
 * sucesiva (SOR).
 *
 * Es una variante de Gauss-Seidel que pondera cada actualización con un factor
 * de relajación omega:
 *
 *   x_i^(k+1) = (1 - omega) · x_i^(k) + omega · x_i^(GS)
 *
 * donde x_i^(GS) es el valor que calcularía Gauss-Seidel en ese paso.
 * Con omega = 1 el método coincide con Gauss-Seidel; con 1 < omega < 2 se
 * sobre-relaja y puede acelerar la convergencia; con 0 < omega < 1 se
 * sub-relaja. Fuera del intervalo (0, 2) el método no converge.
 *
 * @param {Object} params
 * @param {number[][]} params.A                 - Matriz de coeficientes cuadrada (n×n).
 * @param {number[]} params.b                   - Vector de términos independientes (longitud n).
 * @param {number[]} [params.x0]                - Vector inicial. Por defecto vector de ceros.
 * @param {number} [params.omega=1]             - Factor de relajación, en el intervalo abierto (0, 2).
 * @param {number} [params.tolerancia=1e-6]     - Criterio de parada basado en la norma euclidiana del error.
 * @param {number} [params.maxIter=100]         - Número máximo de iteraciones.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si omega está fuera del intervalo (0, 2) o algún parámetro es inválido.
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 */
function sor({ A, b, x0, omega = 1, tolerancia = 1e-6, maxIter = 100 }) {
  validarMatrizCuadrada(A);

  const n = A.length;

  validarVector(b, n);
  validarNumero(omega, "omega");
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  if (omega <= 0 || omega >= 2) {
    throw new ErrorParametros(
      `ChuspaNumeric.sor: el factor de relajación omega debe estar en el intervalo (0, 2). Se recibió: ${omega}.`
    );
  }

  const xInicial = x0 ?? new Array(n).fill(0);

  validarVector(xInicial, n);

  for (let i = 0; i < n; i++) {
    if (A[i][i] === 0) {
      throw new ErrorDominio(
        `ChuspaNumeric.sor: el elemento diagonal A[${i}][${i}] es cero. ` +
          `Considera reordenar las filas para que la diagonal sea no nula.`
      );
    }
  }

  const x = [...xInicial];
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

      const xGaussSeidel = (b[i] - sumaActualizada - sumaAnterior) / A[i][i];

      x[i] = (1 - omega) * xAnterior[i] + omega * xGaussSeidel;
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
      metodo: "sor",
      parametros: {
        A,
        b,
        x0: xInicial,
        omega,
        tolerancia,
        maxIter,
      },
      tiempo_ms: 0,
    },
  });
}

export { sor };
