import { crearResultado } from "../core/contrato.js";
import { ErrorParametros, ErrorDominio } from "../core/errores.js";
import {
  validarMatrizCuadrada,
  validarVector,
} from "../utils/validaciones.js";

function validarSimetria(A, n) {
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(A[i][j] - A[j][i]) > 1e-10) {
        throw new ErrorParametros(
          `Cholesky: la matriz no es simétrica. ` +
          `A[${i}][${j}] = ${A[i][j]}, A[${j}][${i}] = ${A[j][i]}.`
        );
      }
    }
  }
}

/**
 * Factoriza una matriz simétrica definida positiva A = L·Lᵀ
 * usando la descomposición de Cholesky.
 *
 * @param {number[][]} A - Matriz simétrica definida positiva (n×n).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si A no es cuadrada o no es simétrica.
 * @throws {ErrorDominio}    Si A no es definida positiva.
 *
 * @example
 * const { resultado } = descomposicionCholesky([[4,2],[2,3]]);
 * // resultado.L ≈ [[2,0],[1,1.414]]
 */
function descomposicionCholesky(A) {
  validarMatrizCuadrada(A);
  const n = A.length;
  validarSimetria(A, n);

  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  const iteraciones = [];

  for (let j = 0; j < n; j++) {
    let suma = 0;
    for (let k = 0; k < j; k++) suma += L[j][k] ** 2;

    const diagonal = A[j][j] - suma;

    if (diagonal <= 0) {
      throw new ErrorDominio(
        `Cholesky:La matriz no es definida positiva. ` +
        `El elemento diagonal en [${j}][${j}] resultó ${diagonal} ≤ 0 al factorizar.`
      );
    }

    L[j][j] = Math.sqrt(diagonal);

    for (let i = j + 1; i < n; i++) {
      let sumaFila = 0;
      for (let k = 0; k < j; k++) sumaFila += L[i][k] * L[j][k];
      L[i][j] = (A[i][j] - sumaFila) / L[j][j];
    }

    iteraciones.push({
      n: j + 1,
      paso: "factorizacion",
      descripcion: `Columna ${j} completada. L[${j}][${j}] = ${L[j][j].toFixed(6)}`,
      L: L.map((fila) => [...fila]),
    });
  }

  return crearResultado({
    resultado: { L },
    iteraciones,
    convergio: true,
    mensaje: `Descomposición de Cholesky completada en ${n} pasos.`,
    meta: {
      metodo: "cholesky",
      parametros: { A },
      tiempo_ms: 0,
    },
  });
}

/**
 * Resuelve el sistema A·x = b dado la factorización A = L·Lᵀ.
 *
 * @param {number[][]} L - Matriz triangular inferior de Cholesky (n×n).
 * @param {number[]}   b - Vector de términos independientes (longitud n).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 *
 * @example
 * const { resultado } = resolverCholesky([[2,0],[1,1.414]], [8, 7]);
 * // resultado.x ≈ [1, 2]
 */
function resolverCholesky(L, b) {
  validarMatrizCuadrada(L);
  const n = L.length;
  validarVector(b, n);

  const iteraciones = [];
  let numPaso = 0;

  // Sustitución hacia adelante: L·y = b
  const y = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let suma = 0;
    for (let j = 0; j < i; j++) suma += L[i][j] * y[j];
    y[i] = (b[i] - suma) / L[i][i];

    iteraciones.push({
      n: ++numPaso,
      paso: "sustitucion-adelante",
      descripcion: `y[${i}] = ${y[i].toFixed(6)}`,
    });
  }

  // Sustitución hacia atrás: Lᵀ·x = y
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += L[j][i] * x[j];
    x[i] = (y[i] - suma) / L[i][i];

    iteraciones.push({
      n: ++numPaso,
      paso: "sustitucion-atras",
      descripcion: `x[${i}] = ${x[i].toFixed(6)}`,
    });
  }

  return crearResultado({
    resultado: { x },
    iteraciones,
    convergio: true,
    mensaje: `Sistema resuelto mediante Cholesky en ${numPaso} pasos.`,
    meta: {
      metodo: "cholesky-solver",
      parametros: { b },
      tiempo_ms: 0,
    },
  });
}

export { descomposicionCholesky, resolverCholesky };