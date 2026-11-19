/**
 * Funciones auxiliares para operaciones matemáticas.
 *
 * Proporciona utilidades para calcular el error relativo
 * y redondear números a una cantidad determinada de decimales.
 *
 * @module utils/math
 */

/**
 * Calcula el error relativo porcentual entre dos valores consecutivos.
 *
 * Si el valor anterior es cero, devuelve 0 para evitar una división
 * entre cero.
 *
 * @param {number} valorActual - Valor obtenido en la iteración actual.
 * @param {number} valorAnterior - Valor obtenido en la iteración anterior.
 * @returns {number} Error relativo expresado como porcentaje.
 *
 * @example
 * calcularErrorRelativo(12, 10); // 20
 * calcularErrorRelativo(10, 0); // 0
 */
function calcularErrorRelativo(valorActual, valorAnterior) {
  if (valorAnterior === 0) return 0;

  return Math.abs((valorActual - valorAnterior) / valorAnterior) * 100;
}

/**
 * Redondea un número a la cantidad de decimales indicada.
 *
 * @param {number} numero - Número que se desea redondear.
 * @param {number} decimales - Cantidad de decimales que se conservarán.
 * @returns {number} Número redondeado a la cantidad de decimales indicada.
 *
 * @example
 * redondear(3.14159, 2); // 3.14
 * redondear(5.678, 1); // 5.7
 */
function redondear(numero, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(numero * factor) / factor;
}

export { calcularErrorRelativo, redondear };
