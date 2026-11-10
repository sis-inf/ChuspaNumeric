import { ErrorParametros } from "../core/errores.js";

function validarDimension(valor, nombre) {
  if (!Number.isInteger(valor) || valor <= 0) {
    throw new ErrorParametros(
      `${nombre} debe ser un entero positivo (recibido: ${valor})`,
    );
  }
}

function validarIndices(m, i, j) {
  const enRango =
    Number.isInteger(i) &&
    Number.isInteger(j) &&
    i >= 0 &&
    i < m.filas &&
    j >= 0 &&
    j < m.columnas;
  if (!enRango) {
    throw new ErrorParametros(
      `Índice fuera de rango: (${i}, ${j}) en una matriz de ${m.filas}x${m.columnas}`,
    );
  }
}

/**
 * Crea una matriz densa almacenada en un Float64Array (orden por filas).
 * @param {number} filas Número de filas (entero > 0).
 * @param {number} columnas Número de columnas (entero > 0).
 * @returns {{filas: number, columnas: number, datos: Float64Array}}
 * @throws {ErrorParametros} Si alguna dimensión no es un entero positivo.
 */
export function crearMatrizTyped(filas, columnas) {
  validarDimension(filas, "filas");
  validarDimension(columnas, "columnas");
  return { filas, columnas, datos: new Float64Array(filas * columnas) };
}

/**
 * Convierte un arreglo de arreglos en una matriz tipada.
 * @param {number[][]} matriz Arreglo de filas, todas de la misma longitud.
 * @returns {{filas: number, columnas: number, datos: Float64Array}}
 * @throws {ErrorParametros} Si no es un arreglo de arreglos o las filas difieren.
 */
export function desdeArreglo(matriz) {
  if (!Array.isArray(matriz) || matriz.length === 0) {
    throw new ErrorParametros("La matriz debe ser un arreglo de filas no vacío");
  }
  if (!Array.isArray(matriz[0])) {
    throw new ErrorParametros("Cada fila de la matriz debe ser un arreglo");
  }
  const columnas = matriz[0].length;
  for (let i = 0; i < matriz.length; i++) {
    if (!Array.isArray(matriz[i]) || matriz[i].length !== columnas) {
      throw new ErrorParametros(
        `Las filas deben tener la misma longitud (fila ${i} distinta de ${columnas})`,
      );
    }
  }
  const m = crearMatrizTyped(matriz.length, columnas);
  for (let i = 0; i < m.filas; i++) {
    for (let j = 0; j < m.columnas; j++) {
      m.datos[i * m.columnas + j] = matriz[i][j];
    }
  }
  return m;
}

/**
 * Convierte una matriz tipada en un arreglo de arreglos.
 * @param {{filas: number, columnas: number, datos: Float64Array}} m
 * @returns {number[][]}
 */
export function aArreglo(m) {
  const resultado = [];
  for (let i = 0; i < m.filas; i++) {
    const fila = [];
    for (let j = 0; j < m.columnas; j++) {
      fila.push(m.datos[i * m.columnas + j]);
    }
    resultado.push(fila);
  }
  return resultado;
}

/**
 * Lee el elemento (i, j) de la matriz.
 * @throws {ErrorParametros} Si el índice está fuera de rango.
 */
export function obtener(m, i, j) {
  validarIndices(m, i, j);
  return m.datos[i * m.columnas + j];
}

/**
 * Escribe `valor` en el elemento (i, j) de la matriz.
 * @throws {ErrorParametros} Si el índice está fuera de rango.
 */
export function asignar(m, i, j, valor) {
  validarIndices(m, i, j);
  m.datos[i * m.columnas + j] = valor;
}
