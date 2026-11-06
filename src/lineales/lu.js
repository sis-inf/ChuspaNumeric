import { crearResultado } from "../core/contrato.js";
import { ErrorDominio } from "../core/errores.js";
import {
  validarMatrizCuadrada,
  validarVector,
} from "../utils/validaciones.js";

/**
 * Resuelve un sistema lineal A·x = b mediante Descomposición LU (Doolittle).
 * Factoriza A = L·U donde L es triangular inferior unitaria y U triangular superior,
 * luego resuelve L·y = b (sustitución adelante) y U·x = y (sustitución atrás).
 *
 * @param {number[][]} A - Matriz de coeficientes cuadrada (n×n).
 * @param {number[]}   b - Vector de términos independientes (longitud n).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorDominio} Si aparece un pivote nulo durante la descomposición.
 *
 * @example
 * const A = [[4,3],[6,3]];
 * const b = [10, 12];
 * const { resultado } = lu({ A, b });
 * // resultado.x ≈ [1, 2]
 * // resultado.L · resultado.U ≈ A
 */
function lu({ A, b }) {
  // Validaciones 

  validarMatrizCuadrada(A);
  const n = A.length;
  validarVector(b, n);

  // Descomposición de Doolittle: A = L · U 

  // Inicializar L como identidad y U como copia de A
  const L = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
  const U = A.map((fila) => [...fila]);

  const iteraciones = [];
  let numPaso = 0;

  for (let k = 0; k < n; k++) {
    if (U[k][k] === 0) {
      throw new ErrorDominio(
        `ChuspaNumeric.lu: pivote nulo en U[${k}][${k}]. ` +
        `La descomposición LU no puede continuar sin pivoteo.`
      );
    }

    for (let i = k + 1; i < n; i++) {
      L[i][k] = U[i][k] / U[k][k];

      for (let j = k; j < n; j++) {
        U[i][j] -= L[i][k] * U[k][j];
      }
    }

    iteraciones.push({
      n: ++numPaso,
      paso: "descomposicion",
      descripcion: `Descomposición completada hasta columna ${k}`,
      L: L.map((fila) => [...fila]),
      U: U.map((fila) => [...fila]),
    });
  }

  // Sustitución hacia adelante: L·y = b 

  const y = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    let suma = 0;
    for (let j = 0; j < i; j++) suma += L[i][j] * y[j];
    y[i] = (b[i] - suma) / L[i][i]; // L[i][i] = 1 en Doolittle

    iteraciones.push({
      n: ++numPaso,
      paso: "sustitucion-adelante",
      descripcion: `y[${i}] = ${y[i].toFixed(6)}`,
      L: L.map((fila) => [...fila]),
      U: U.map((fila) => [...fila]),
    });
  }

  //  Sustitución hacia atrás: U·x = y 

  const x = new Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += U[i][j] * x[j];
    x[i] = (y[i] - suma) / U[i][i];

    iteraciones.push({
      n: ++numPaso,
      paso: "sustitucion-atras",
      descripcion: `x[${i}] = ${x[i].toFixed(6)}`,
      L: L.map((fila) => [...fila]),
      U: U.map((fila) => [...fila]),
    });
  }

  return crearResultado({
    resultado: { x, L, U },
    iteraciones,
    convergio: true,
    mensaje: `Descomposición LU completada. Sistema resuelto en ${numPaso} pasos.`,
    meta: {
      metodo: "lu",
      parametros: { A, b },
      tiempo_ms: 0,
    },
  });
}

export { lu };