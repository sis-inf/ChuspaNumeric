import { ErrorParametros, ErrorTamano } from "../core/errores.js";

/**
 * Calcula el determinante de una matriz 2x2
 * @param {number[][]} m - matriz 2x2
 * @returns {number}
 */
export function det2x2(m) {
  if (!Array.isArray(m) || !m.every(row => Array.isArray(row))) {
    throw new ErrorParametros("La matriz debe ser un arreglo de arreglos");
  }
  if (m.length !== 2 || m.some(row => row.length !== 2)) {
    throw new ErrorTamano("La matriz debe ser 2x2");
  }

  const [[a, b], [c, d]] = m;

  return a * d - b * c;
}

/**
 * Calcula el determinante de una matriz 3x3
 * @param {number[][]} m - matriz 3x3
 * @returns {number}
 */
export function det3x3(m) {
  if (!Array.isArray(m) || !m.every(row => Array.isArray(row))) {
    throw new ErrorParametros("La matriz debe ser un arreglo de arreglos");
  }
  if (m.length !== 3 || m.some(row => row.length !== 3)) {
    throw new ErrorTamano("La matriz debe ser 3x3");
  }

  const [
    [a, b, c],
    [d, e, f],
    [g, h, i]
  ] = m;

  return (
    a * (e * i - f * h) -
    b * (d * i - f * g) +
    c * (d * h - e * g)
  );
}