import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorDivergencia,
  ErrorDominio,
  ErrorParametros,
} from "../core/errores.js";

const METODO = "sor";

/**
 * Describe brevemente un valor recibido para los mensajes de error.
 * @param {*} valor
 * @returns {string}
 */
function describir(valor) {
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "un arreglo";
  if (typeof valor === "string") return `la cadena "${valor}"`;
  if (typeof valor === "object") return "un objeto";
  return String(valor);
}

/**
 * Valida que un valor sea un número finito.
 * @param {*} valor
 * @param {string} nombre - Nombre del parámetro, para el mensaje.
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "${nombre}" debe ser un número finito. Se recibió: ${describir(valor)}.`
    );
  }
}

/**
 * Valida un vector numérico finito de longitud n.
 * @param {*} v
 * @param {number} n
 * @param {string} nombre
 */
function validarVectorFinito(v, n, nombre) {
  if (!Array.isArray(v)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "${nombre}" debe ser un arreglo de números. Se recibió: ${describir(v)}.`
    );
  }
  if (v.length !== n) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "${nombre}" debe tener longitud ${n} (igual al orden de A). Se recibió longitud ${v.length}.`
    );
  }
  for (let i = 0; i < n; i++) {
    if (typeof v[i] !== "number" || !Number.isFinite(v[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: "${nombre}[${i}]" debe ser un número finito. Se recibió: ${describir(v[i])}.`
      );
    }
  }
}

/**
 * Valida el sistema A·x = b y el vector inicial opcional.
 * @param {*} A
 * @param {*} b
 * @param {*} x0 - Opcional (undefined o null para usar ceros).
 */
function validarSistema(A, b, x0) {
  if (!Array.isArray(A) || A.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "A" debe ser una matriz cuadrada no vacía (arreglo de arreglos). Se recibió: ${describir(A)}.`
    );
  }

  const n = A.length;

  for (let i = 0; i < n; i++) {
    if (!Array.isArray(A[i]) || A[i].length !== n) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: "A" debe ser cuadrada (${n}×${n}); la fila ${i} no es un arreglo de longitud ${n}.`
      );
    }
    for (let j = 0; j < n; j++) {
      if (typeof A[i][j] !== "number" || !Number.isFinite(A[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.${METODO}: "A[${i}][${j}]" debe ser un número finito. Se recibió: ${describir(A[i][j])}.`
        );
      }
    }
  }

  validarVectorFinito(b, n, "b");

  if (x0 !== undefined && x0 !== null) {
    validarVectorFinito(x0, n, "x0");
  }
}

/**
 * Valida los parámetros escalares del método.
 */
function validarEscalares({ omega, tolerancia, maxIter }) {
  validarNumeroFinito(omega, "omega");
  if (omega <= 0 || omega >= 2) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: el factor de relajación omega debe estar en el intervalo (0, 2). Se recibió: ${omega}.`
    );
  }

  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "tolerancia" debe ser mayor que 0. Se recibió: ${tolerancia}.`
    );
  }

  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: "maxIter" debe ser un entero mayor o igual a 1. Se recibió: ${describir(maxIter)}.`
    );
  }
}

/**
 * Verifica la finitud del resultado y arma el resultado estructurado.
 * No mide tiempo: recibe tiempo_ms ya calculado.
 */
function finalizar({
  x,
  iteraciones,
  convergio,
  A,
  b,
  xInicial,
  omega,
  tolerancia,
  maxIter,
  tiempo_ms,
}) {
  if (!x.every(Number.isFinite)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el método divergió; la solución contiene valores no finitos tras ${iteraciones.length} iteraciones. ` +
        `Verifica que A sea diagonalmente dominante o definida positiva, o ajusta omega.`
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
      metodo: METODO,
      parametros: { A, b, x0: xInicial, omega, tolerancia, maxIter },
      tiempo_ms,
    },
  });
}

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
 * @param {Object} opciones
 * @param {number[][]} opciones.A                 - Matriz de coeficientes cuadrada (n×n) de valores finitos.
 * @param {number[]} opciones.b                   - Vector de términos independientes (longitud n, valores finitos).
 * @param {number[]} [opciones.x0]                - Vector inicial (longitud n). Por defecto vector de ceros.
 * @param {number} [opciones.omega=1]             - Factor de relajación, en el intervalo abierto (0, 2).
 * @param {number} [opciones.tolerancia=1e-6]     - Criterio de parada (> 0) basado en la norma euclidiana del error.
 * @param {number} [opciones.maxIter=100]         - Número máximo de iteraciones (entero ≥ 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si opciones no es un objeto, algún parámetro tiene tipo incorrecto,
 *   valores no finitos, dimensiones incompatibles u omega fuera de (0, 2).
 * @throws {ErrorDominio} Si algún elemento de la diagonal de A es cero.
 * @throws {ErrorDivergencia} Si la solución obtenida contiene valores no finitos.
 */
function sor(opciones) {
  if (
    opciones === null ||
    typeof opciones !== "object" ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b, x0, omega, tolerancia, maxIter }. Se recibió: ${describir(opciones)}.`
    );
  }

  const { A, b, x0, omega = 1, tolerancia = 1e-6, maxIter = 100 } = opciones;

  validarSistema(A, b, x0);
  validarEscalares({ omega, tolerancia, maxIter });

  const n = A.length;
  const xInicial = x0 ?? new Array(n).fill(0);

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

    return { x, iteraciones, convergio };
  });

  return finalizar({
    ...calculo,
    A,
    b,
    xInicial,
    omega,
    tolerancia,
    maxIter,
    tiempo_ms,
  });
}

export { sor };
