/**
 * Índice de operaciones matriciales.
 *
 * Cada operación valida sus parámetros (tipos, números finitos y dimensiones),
 * lanza ErrorParametros ante entradas no válidas y retorna el resultado
 * estructurado del contrato de ChuspaNumeric (crearResultado).
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
import {
  normaEuclideana as normaEuclideanaBase,
  normaInfinita as normaInfinitaBase,
  normaFrobenius as normaFrobeniusBase,
} from './norma_matriz.js';
import { determinanteSarrus as determinanteSarrusBase } from './determinante_sarrus.js';
import { calcularRango as calcularRangoBase } from './rango.js';
import { calcularNumeroCondicion as calcularNumeroCondicionBase } from './numero_condicion.js';

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

function validarVector(v, funcion, nombre) {
  if (!Array.isArray(v) || v.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: '${nombre}' debe ser un vector (arreglo) no vacío.`,
    );
  }
  for (let i = 0; i < v.length; i++) {
    if (typeof v[i] !== 'number' || !Number.isFinite(v[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${funcion}: ${nombre}[${i}] debe ser un número finito. Se recibió: ${v[i]}.`,
      );
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

function validarCuadrada(M, funcion, nombre) {
  if (M.length !== M[0].length) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: '${nombre}' debe ser cuadrada. Es ${M.length}x${M[0].length}.`,
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

export function normaEuclideana(v) {
  validarVector(v, 'normaEuclideana', 'v');
  return envolver(
    'norma-euclideana',
    { longitud: v.length },
    () => normaEuclideanaBase(v),
    'Norma euclideana calculada.',
  );
}

export function normaInfinita(v) {
  validarVector(v, 'normaInfinita', 'v');
  return envolver(
    'norma-infinita',
    { longitud: v.length },
    () => normaInfinitaBase(v),
    'Norma infinita calculada.',
  );
}

export function normaFrobenius(A) {
  validarMatriz(A, 'normaFrobenius', 'A');
  return envolver(
    'norma-frobenius',
    { filas: A.length, columnas: A[0].length },
    () => normaFrobeniusBase(A),
    'Norma de Frobenius calculada.',
  );
}

export function determinanteSarrus(A) {
  validarMatriz(A, 'determinanteSarrus', 'A');
  if (A.length !== 3 || A[0].length !== 3) {
    throw new ErrorParametros(
      `ChuspaNumeric.determinanteSarrus: la matriz debe ser 3x3. Es ${A.length}x${A[0].length}.`,
    );
  }
  return envolver(
    'sarrus',
    { filas: 3, columnas: 3 },
    () => determinanteSarrusBase(A),
    'Determinante calculado con la regla de Sarrus.',
  );
}

export function calcularRango(params) {
  if (params === null || typeof params !== 'object') {
    throw new ErrorParametros(
      'ChuspaNumeric.calcularRango: se esperaba un objeto con la propiedad A.',
    );
  }
  validarMatriz(params.A, 'calcularRango', 'A');
  return envolver(
    'rango',
    { filas: params.A.length, columnas: params.A[0].length },
    () => calcularRangoBase({ A: params.A }),
    'Rango calculado.',
  );
}

export function calcularNumeroCondicion(A, inversaA) {
  validarMatriz(A, 'calcularNumeroCondicion', 'A');
  validarMatriz(inversaA, 'calcularNumeroCondicion', 'inversaA');
  validarCuadrada(A, 'calcularNumeroCondicion', 'A');
  validarCuadrada(inversaA, 'calcularNumeroCondicion', 'inversaA');
  if (A.length !== inversaA.length) {
    throw new ErrorParametros(
      `ChuspaNumeric.calcularNumeroCondicion: las matrices deben tener las mismas dimensiones. A es ${A.length}x${A.length} e inversaA es ${inversaA.length}x${inversaA.length}.`,
    );
  }
  return envolver(
    'numero-condicion',
    { orden: A.length },
    () => calcularNumeroCondicionBase(A, inversaA),
    'Número de condición calculado.',
  );
}