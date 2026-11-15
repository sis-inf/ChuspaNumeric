/**
 * Índice de operaciones matriciales.
 *
 * Las operaciones de álgebra de matrices (suma, resta, multiplicación,
 * transpuesta y producto por escalar) validan sus parámetros (tipos, números
 * finitos y dimensiones), lanzan ErrorParametros ante entradas no válidas y
 * retornan el resultado estructurado del contrato de ChuspaNumeric
 * (crearResultado).
 *
 * El resto de funciones ya implementan ese contrato en su propio archivo y se
 * reexportan directamente.
 */
import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import {
  sumaMatrices as sumaMatricesBase,
  restaMatrices as restaMatricesBase,
  multiplicarMatrices as multiplicarMatricesBase,
  transpuesta as transpuestaBase,
  multiplicarEscalar as multiplicarEscalarBase,
} from './algebra_matrices.js';

export { normaEuclideana, normaInfinita, normaFrobenius } from './norma_matriz.js';
export { determinanteSarrus } from './determinante_sarrus.js';
export { calcularRango } from './rango.js';
export { calcularNumeroCondicion } from './numero_condicion.js';

function validarMatriz(M, funcion, nombre) {
  if (!Array.isArray(M) || M.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: '${nombre}' debe ser una matriz no vacía (arreglo de arreglos).`,
    );
  }
  if (!Array.isArray(M[0]) || M[0].length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: las filas de '${nombre}' deben ser arreglos no vacíos.`,
    );
  }
  const columnas = M[0].length;
  for (let i = 0; i < M.length; i++) {
    if (!Array.isArray(M[i]) || M[i].length !== columnas) {
      throw new ErrorParametros(
        `ChuspaNumeric.${funcion}: todas las filas de '${nombre}' deben tener la misma longitud (${columnas}). La fila ${i} no cumple.`,
      );
    }
    for (let j = 0; j < columnas; j++) {
      if (typeof M[i][j] !== 'number' || !Number.isFinite(M[i][j])) {
        throw new ErrorParametros(
          `ChuspaNumeric.${funcion}: ${nombre}[${i}][${j}] debe ser un número finito. Se recibió: ${M[i][j]}.`,
        );
      }
    }
  }
}

function validarEscalar(x, funcion, nombre) {
  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: '${nombre}' debe ser un número finito. Se recibió: ${x}.`,
    );
  }
}

function validarMismasDimensiones(A, B, funcion) {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: dimensiones incompatibles. A es ${A.length}x${A[0].length} y B es ${B.length}x${B[0].length}; deben ser iguales.`,
    );
  }
}

function envolver(metodo, parametros, calcular, mensaje) {
  const { valor, tiempo_ms } = medirTiempo(calcular);
  return crearResultado({
    resultado: valor,
    iteraciones: [],
    convergio: true,
    mensaje,
    meta: { metodo, parametros, tiempo_ms },
  });
}

export function sumaMatrices(A, B) {
  validarMatriz(A, 'sumaMatrices', 'A');
  validarMatriz(B, 'sumaMatrices', 'B');
  validarMismasDimensiones(A, B, 'sumaMatrices');
  return envolver(
    'suma-matrices',
    { filas: A.length, columnas: A[0].length },
    () => sumaMatricesBase(A, B),
    'Suma de matrices completada.',
  );
}

export function restaMatrices(A, B) {
  validarMatriz(A, 'restaMatrices', 'A');
  validarMatriz(B, 'restaMatrices', 'B');
  validarMismasDimensiones(A, B, 'restaMatrices');
  return envolver(
    'resta-matrices',
    { filas: A.length, columnas: A[0].length },
    () => restaMatricesBase(A, B),
    'Resta de matrices completada.',
  );
}

export function multiplicarMatrices(A, B) {
  validarMatriz(A, 'multiplicarMatrices', 'A');
  validarMatriz(B, 'multiplicarMatrices', 'B');
  if (A[0].length !== B.length) {
    throw new ErrorParametros(
      `ChuspaNumeric.multiplicarMatrices: dimensiones incompatibles. A es ${A.length}x${A[0].length} y B es ${B.length}x${B[0].length}; las columnas de A deben igualar las filas de B.`,
    );
  }
  return envolver(
    'multiplicar-matrices',
    { filasA: A.length, columnasA: A[0].length, filasB: B.length, columnasB: B[0].length },
    () => multiplicarMatricesBase(A, B),
    'Multiplicación de matrices completada.',
  );
}

export function transpuesta(A) {
  validarMatriz(A, 'transpuesta', 'A');
  return envolver(
    'transpuesta',
    { filas: A.length, columnas: A[0].length },
    () => transpuestaBase(A),
    'Transpuesta calculada.',
  );
}

export function multiplicarEscalar(escalar, A) {
  validarEscalar(escalar, 'multiplicarEscalar', 'escalar');
  validarMatriz(A, 'multiplicarEscalar', 'A');
  return envolver(
    'multiplicar-escalar',
    { filas: A.length, columnas: A[0].length, escalar },
    () => multiplicarEscalarBase(escalar, A),
    'Multiplicación por escalar completada.',
  );
}