import { ErrorParametros } from '../core/errores.js';

/**
 * Redondea un número a n decimales.
 * Ejemplo: 3.14159 -> 3.142
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
 */
function cifrasSignificativas(x, n) {
  return Number(x.toPrecision(n));
}

/**
 * Compara dos números usando una tolerancia.
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
