import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from "../core/errores.js";

const METODO = "lu";

/**
 * Valida que `valor` sea una matriz cuadrada no vacía de números finitos.
 * @param {*} valor - Valor a validar.
 * @param {string} nombre - Nombre del parámetro (para el mensaje).
 * @returns {number} Dimensión n de la matriz.
 * @throws {ErrorParametros}
 */
function validarMatrizCuadradaLocal(valor, nombre) {
  if (!Array.isArray(valor) || valor.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "${nombre}" debe ser una matriz cuadrada no vacía (number[][]), se recibió ${
        Array.isArray(valor) ? "un arreglo vacío" : typeof valor
      }.`
    );
  }
  const n = valor.length;
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(valor[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: "${nombre}[${i}]" debe ser un arreglo de números, se recibió ${typeof valor[i]}.`
      );
    }
    if (valor[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: "${nombre}" debe ser cuadrada (${n}×${n}), pero la fila ${i} tiene ${valor[i].length} elementos.`
      );
    }
    for (let j = 0; j < n; j++) {
      if (!Number.isFinite(valor[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.${METODO}: "${nombre}[${i}][${j}]" debe ser un número finito, se recibió ${String(
            valor[i][j]
          )}.`
        );
      }
    }
  }
  return n;
}

/**
 * Valida que `valor` sea un vector de números finitos de longitud `n`.
 * @param {*} valor - Valor a validar.
 * @param {number} n - Longitud esperada.
 * @param {string} nombre - Nombre del parámetro (para el mensaje).
 * @throws {ErrorParametros}
 */
function validarVectorLocal(valor, n, nombre) {
  if (!Array.isArray(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "${nombre}" debe ser un arreglo de números (number[]), se recibió ${typeof valor}.`
    );
  }
  if (valor.length !== n) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: dimensiones incompatibles, "${nombre}" tiene longitud ${valor.length} pero "A" es ${n}×${n}.`
    );
  }
  for (let i = 0; i < n; i++) {
    if (!Number.isFinite(valor[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: "${nombre}[${i}]" debe ser un número finito, se recibió ${String(
          valor[i]
        )}.`
      );
    }
  }
}

/**
 * Verifica finitud del resultado y arma el resultado estructurado.
 */
function finalizar({ x, L, U, iteraciones, pasos, A, b, tiempo_ms }) {
  for (let i = 0; i < x.length; i++) {
    if (!Number.isFinite(x[i])) {
      throw new ErrorDivergencia(
        `ChuspaNumeric.${METODO}: la solución no es finita (x[${i}] = ${String(
          x[i]
        )}).`
      );
    }
  }

  return crearResultado({
    resultado: { x, L, U },
    iteraciones,
    convergio: true,
    mensaje: `Descomposición LU completada. Sistema resuelto en ${pasos} pasos.`,
    meta: {
      metodo: METODO,
      parametros: { A, b },
      tiempo_ms,
    },
  });
}

/**
 * Resuelve un sistema lineal A·x = b mediante Descomposición LU (Doolittle).
 * Factoriza A = L·U donde L es triangular inferior unitaria y U triangular superior,
 * luego resuelve L·y = b (sustitución adelante) y U·x = y (sustitución atrás).
 *
 * @param {Object}     opciones - Opciones del método.
 * @param {number[][]} opciones.A - Matriz de coeficientes cuadrada (n×n) con valores finitos.
 * @param {number[]}   opciones.b - Vector de términos independientes (longitud n) con valores finitos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si `opciones` no es un objeto, o `A`/`b` tienen tipo, valores o dimensiones inválidos.
 * @throws {ErrorDominio} Si aparece un pivote nulo durante la descomposición.
 * @throws {ErrorDivergencia} Si la solución obtenida no es finita.
 *
 * @example
 * const A = [[4,3],[6,3]];
 * const b = [10, 12];
 * const { resultado } = lu({ A, b });
 * // resultado.x ≈ [1, 2]
 * // resultado.L · resultado.U ≈ A
 */
function lu(opciones) {
  // Validaciones (antes de medir tiempo)
  if (
    opciones === null ||
    typeof opciones !== "object" ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b }, se recibió ${
        opciones === null ? "null" : Array.isArray(opciones) ? "array" : typeof opciones
      }.`
    );
  }

  const { A, b } = opciones;
  const n = validarMatrizCuadradaLocal(A, "A");
  validarVectorLocal(b, n, "b");

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
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
          `ChuspaNumeric.${METODO}: pivote nulo en U[${k}][${k}]. ` +
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

    // Sustitución hacia atrás: U·x = y

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

    return { x, L, U, iteraciones, pasos: numPaso };
  });

  return finalizar({ ...calculo, A, b, tiempo_ms });
}

export { lu };
