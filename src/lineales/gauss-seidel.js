import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from "../core/errores.js";

const METODO = "gaussSeidel";

/**
 * Valida que `valor` sea un número finito.
 * @param {*} valor
 * @param {string} nombre - Nombre del parámetro para el mensaje.
 * @throws {ErrorParametros}
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito, se recibió ${String(valor)} (${typeof valor}).`
    );
  }
}

/**
 * Valida la matriz de coeficientes: no vacía, cuadrada y con valores finitos.
 * @param {*} A
 * @throws {ErrorParametros}
 */
function validarMatriz(A) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'A' debe ser una matriz no vacía (arreglo de arreglos), se recibió ${
        Array.isArray(A) ? "un arreglo vacío" : typeof A
      }.`
    );
  }

  const n = A.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: la fila A[${i}] debe ser un arreglo, se recibió ${typeof A[i]}.`
      );
    }
    if (A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: 'A' debe ser cuadrada (${n}x${n}), pero la fila A[${i}] tiene ${A[i].length} elementos.`
      );
    }
    for (let j = 0; j < n; j++) {
      if (typeof A[i][j] !== "number" || !Number.isFinite(A[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.${METODO}: A[${i}][${j}] debe ser un número finito, se recibió ${String(A[i][j])}.`
        );
      }
    }
  }
}

/**
 * Valida un vector de longitud `n` con valores finitos.
 * @param {*} v
 * @param {number} n - Longitud esperada.
 * @param {string} nombre - Nombre del parámetro para el mensaje.
 * @throws {ErrorParametros}
 */
function validarVectorLocal(v, n, nombre) {
  if (!Array.isArray(v)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un arreglo de números, se recibió ${typeof v}.`
    );
  }
  if (v.length !== n) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe tener longitud ${n} (igual al orden de A), se recibió longitud ${v.length}.`
    );
  }
  for (let i = 0; i < n; i++) {
    if (typeof v[i] !== "number" || !Number.isFinite(v[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: ${nombre}[${i}] debe ser un número finito, se recibió ${String(v[i])}.`
      );
    }
  }
}

/**
 * Valida la tolerancia: número finito estrictamente positivo.
 * @param {*} tolerancia
 * @throws {ErrorParametros}
 */
function validarToleranciaLocal(tolerancia) {
  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser mayor que 0, se recibió ${tolerancia}.`
    );
  }
}

/**
 * Valida el máximo de iteraciones: entero positivo.
 * @param {*} maxIter
 * @throws {ErrorParametros}
 */
function validarMaxIter(maxIter) {
  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor o igual a 1, se recibió ${String(maxIter)}.`
    );
  }
}

/**
 * Verifica la finitud de la solución y arma el resultado según el contrato.
 * @throws {ErrorDivergencia} Si la solución contiene valores no finitos.
 */
function finalizar({
  x,
  iteraciones,
  convergio,
  A,
  b,
  xInicial,
  tolerancia,
  maxIter,
  tiempo_ms,
}) {
  if (!x.every(Number.isFinite)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el método divergió, la solución contiene valores no finitos tras ${iteraciones.length} iteraciones. ` +
        `Verifica que A sea diagonalmente dominante.`
    );
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
      parametros: { A, b, x0: xInicial, tolerancia, maxIter },
      tiempo_ms,
    },
  });
}

/**
 * Resuelve un sistema lineal A·x = b mediante el método iterativo de Gauss-Seidel.
 * Converge para matrices diagonalmente dominantes.
 *
 * En cada iteración utiliza los valores ya actualizados x_j^(k+1) para j < i
 * y los valores anteriores x_j^(k) para j > i.
 *
 * @param {Object} opciones
 * @param {number[][]} opciones.A                 - Matriz de coeficientes cuadrada (n×n), con valores finitos.
 * @param {number[]} opciones.b                   - Vector de términos independientes (longitud n).
 * @param {number[]} [opciones.x0]                - Vector inicial (longitud n). Por defecto vector de ceros.
 * @param {number} [opciones.tolerancia=1e-6]     - Criterio de parada (norma euclidiana del error). Debe ser > 0.
 * @param {number} [opciones.maxIter=100]         - Número máximo de iteraciones (entero >= 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si `opciones` no es un objeto o algún parámetro tiene tipo, valor o dimensión inválidos.
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 * @throws {ErrorDivergencia} Si la solución resultante contiene valores no finitos.
 */
function gaussSeidel(opciones) {
  if (
    opciones === null ||
    typeof opciones !== "object" ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b, x0, tolerancia, maxIter }, se recibió ${
        opciones === null ? "null" : Array.isArray(opciones) ? "un arreglo" : typeof opciones
      }.`
    );
  }

  const { A, b, x0, tolerancia = 1e-6, maxIter = 100 } = opciones;

  validarMatriz(A);

  const n = A.length;

  validarVectorLocal(b, n, "b");
  validarToleranciaLocal(tolerancia);
  validarMaxIter(maxIter);

  const xInicial = x0 ?? new Array(n).fill(0);

  validarVectorLocal(xInicial, n, "x0");

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    for (let i = 0; i < n; i++) {
      if (A[i][i] === 0) {
        throw new ErrorDominio(
          `ChuspaNumeric.${METODO}: el elemento diagonal A[${i}][${i}] es cero. ` +
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

    return { x, iteraciones, convergio };
  });

  return finalizar({
    ...calculo,
    A,
    b,
    xInicial,
    tolerancia,
    maxIter,
    tiempo_ms,
  });
}

export { gaussSeidel };
