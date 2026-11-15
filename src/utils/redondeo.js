import { ErrorParametros } from '../core/errores.js';

/**
 * Redondea un número a n decimales.
 * Ejemplo: 3.14159 -> 3.142
 *
 * @param {number} x - Número a redondear.
 * @param {number} n - Cantidad de decimales a conservar (entero mayor o igual a 0).
 * @returns {number} El número redondeado a n decimales.
 * @throws {ErrorParametros} Si n no es un entero mayor o igual a 0.
 */
function redondearDecimales(x, n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new ErrorParametros('n debe ser un entero mayor o igual a 0');
  }
  const factor = Math.pow(10, n);
  return Math.round(x * factor) / factor;
}

/**
 * Trunca un número a n decimales sin redondear.
 * Ejemplo: 3.14159 -> 3.141
 *
 * @param {number} x - Número a truncar.
 * @param {number} n - Cantidad de decimales a conservar (entero mayor o igual a 0).
 * @returns {number} El número truncado a n decimales.
 * @throws {ErrorParametros} Si n no es un entero mayor o igual a 0.
 */
function truncarDecimales(x, n) {
  if (!Number.isInteger(n) || n < 0) {
    throw new ErrorParametros('n debe ser un entero mayor o igual a 0');
  }
  const factor = Math.pow(10, n);
  return Math.trunc(x * factor) / factor;
}

/**
 * Mantiene n cifras significativas.
 * Ejemplo: 0.001234 -> 0.00123
 *
 * @param {number} x - Número a redondear.
 * @param {number} n - Cantidad de cifras significativas a mantener (entero entre 1 y 100).
 * @returns {number} El número con n cifras significativas.
 * @throws {RangeError} Si n está fuera del rango 1 a 100 (lo lanza Number.prototype.toPrecision).
 */
function cifrasSignificativas(x, n) {
  return Number(x.toPrecision(n));
}

/**
 * Compara dos números usando una tolerancia.
 *
 * @param {number} a - Primer número.
 * @param {number} b - Segundo número.
 * @param {number} tol - Tolerancia máxima permitida para la diferencia absoluta.
 * @returns {boolean} true si |a - b| es menor o igual que tol; false en caso contrario.
 */
function esIgualConTolerancia(a, b, tol) {
  return Math.abs(a - b) <= tol;
}

export {
  redondearDecimales,
  truncarDecimales,
  cifrasSignificativas,
  esIgualConTolerancia
};
