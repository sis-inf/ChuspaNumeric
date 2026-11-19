import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from "../core/errores.js";

const METODO = "jacobi";

/** Describe un valor recibido para los mensajes de error. */
function describir(valor) {
  if (typeof valor === "string") return `"${valor}" (string)`;
  if (Array.isArray(valor)) return "un arreglo";
  if (valor === null) return "null";
  return `${String(valor)} (${typeof valor})`;
}

function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito, se recibió ${describir(valor)}.`
    );
  }
}

function validarMatrizCuadrada(A) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'A' debe ser una matriz cuadrada no vacía (arreglo de arreglos), se recibió ${describir(A)}.`
    );
  }
  const n = A.length;
  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i]) || A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: 'A' debe ser cuadrada (${n}×${n}); la fila ${i} ` +
          `${Array.isArray(A[i]) ? `tiene longitud ${A[i].length}` : "no es un arreglo"}.`
      );
    }
    for (let j = 0; j < n; j++) {
      validarNumeroFinito(A[i][j], `A[${i}][${j}]`);
    }
  }
}

function validarVector(v, n, nombre) {
  if (!Array.isArray(v)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un arreglo de longitud ${n}, se recibió ${describir(v)}.`
    );
  }
  if (v.length !== n) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe tener longitud ${n} (dimensión de A), se recibió longitud ${v.length}.`
    );
  }
  for (let i = 0; i < n; i++) {
    validarNumeroFinito(v[i], `${nombre}[${i}]`);
  }
}

function validarTolerancia(tolerancia) {
  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser mayor que 0, se recibió ${tolerancia}.`
    );
  }
}

function validarIteraciones(maxIter) {
  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor o igual a 1, se recibió ${describir(maxIter)}.`
    );
  }
}

/** Verifica finitud del resultado y arma el contrato. No mide tiempo. */
function finalizar({ x, iteraciones, convergio, maxIter, parametros, tiempo_ms }) {
  if (!x.every(Number.isFinite)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el método divergió (la solución contiene valores no finitos). ` +
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
    meta: { metodo: METODO, parametros, tiempo_ms },
  });
}

/**
 * Resuelve un sistema lineal A·x = b mediante el Método iterativo de Jacobi.
 * Converge para matrices diagonalmente dominantes.
 *
 * @param {Object}     opciones
 * @param {number[][]} opciones.A                  - Matriz de coeficientes cuadrada (n×n), con valores finitos.
 * @param {number[]}   opciones.b                  - Vector de términos independientes (longitud n).
 * @param {number[]}   [opciones.x0]               - Vector inicial. Por defecto vector de ceros.
 * @param {number}     [opciones.tolerancia=1e-6]  - Criterio de parada (norma euclidiana del error), > 0.
 * @param {number}     [opciones.maxIter=100]      - Número máximo de iteraciones (entero ≥ 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si opciones no es un objeto, o A, b, x0, tolerancia o maxIter son inválidos
 *                           (tipos, valores no finitos o dimensiones incompatibles).
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 * @throws {ErrorDivergencia} Si la solución contiene valores no finitos (el método diverge).
 */
function jacobi(opciones) {
  if (opciones === null || typeof opciones !== "object" || Array.isArray(opciones)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b, x0, tolerancia, maxIter }, se recibió ${describir(opciones)}.`
    );
  }

  const { A, b, x0, tolerancia = 1e-6, maxIter = 100 } = opciones;

  // Validaciones (antes de medir tiempo)
  validarMatrizCuadrada(A);
  const n = A.length;
  validarVector(b, n, "b");
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  // x0 por defecto: vector de ceros
  const xInicial = x0 ?? new Array(n).fill(0);
  validarVector(xInicial, n, "x0");

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    // Verificar que no haya ceros en la diagonal
    for (let i = 0; i < n; i++) {
      if (A[i][i] === 0) {
        throw new ErrorDominio(
          `ChuspaNumeric.${METODO}: el elemento diagonal A[${i}][${i}] es cero. ` +
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

    return { x, iteraciones, convergio };
  });

  return finalizar({
    ...calculo,
    maxIter,
    parametros: { A, b, x0: xInicial, tolerancia, maxIter },
    tiempo_ms,
  });
}

export { jacobi };
