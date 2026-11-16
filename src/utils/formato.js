
/**
 * Utilidades para el redondeo y el cálculo de errores numéricos.
 *
 * Este módulo contiene funciones para redondear números,
 * calcular errores absolutos, relativos y porcentuales,
 * y comparar valores numéricos mediante una tolerancia.
 *
 * @module utils/formato
 */

/**
 * Redondea un número a la cantidad de decimales indicada.
 *
 * @param {number} valor - Número que se desea redondear.
 * @param {number} decimales - Cantidad de decimales deseados.
 * @returns {number} El número redondeado.
 *
 * @example
 * redondear(3.14159, 2); // 3.14
 */
export function redondear(valor, decimales) {
    const factor = Math.pow(10, decimales);
    return Math.round(valor * factor) / factor;
}

/**
 * Calcula el error absoluto entre dos valores numéricos.
 *
 * @param {number} actual - Valor actual de la iteración.
 * @param {number} anterior - Valor de la iteración anterior.
 * @returns {number} La diferencia absoluta entre ambos valores.
 *
 * @example
 * errorAbsoluto(5, 3); // 2
 */
export function errorAbsoluto(actual, anterior) {
    return Math.abs(actual - anterior);
}

/**
 * Calcula el error relativo entre dos valores numéricos.
 *
 * Si el valor actual es cero, devuelve Infinity para evitar
 * una división entre cero.
 *
 * @param {number} actual - Valor actual utilizado como referencia.
 * @param {number} anterior - Valor de la iteración anterior.
 * @returns {number} El error relativo o Infinity si actual es cero.
 *
 * @example
 * errorRelativo(4, 3); // 0.25
 * errorRelativo(0, 1); // Infinity
 */
export function errorRelativo(actual, anterior) {
    if (actual === 0) return Infinity;
    return Math.abs((actual - anterior) / actual);
}

/**
 * Calcula el error porcentual entre dos valores numéricos.
 *
 * El resultado se obtiene multiplicando el error relativo por 100.
 *
 * @param {number} actual - Valor actual utilizado como referencia.
 * @param {number} anterior - Valor de la iteración anterior.
 * @returns {number} El error porcentual expresado como porcentaje.
 *
 * @example
 * errorPorcentual(4, 3); // 25
 */
export function errorPorcentual(actual, anterior) {
    return errorRelativo(actual, anterior) * 100;
}

/**
 * Verifica si dos valores son aproximadamente iguales
 * dentro de una tolerancia dada.
 *
 * La diferencia absoluta debe ser estrictamente menor
 * que la tolerancia indicada.
 *
 * @param {number} a - Primer valor numérico.
 * @param {number} b - Segundo valor numérico.
 * @param {number} tolerancia - Margen de tolerancia aceptado.
 * @returns {boolean} true si la diferencia es menor que la
 * tolerancia; false en caso contrario.
 *
 * @example
 * aproximadamenteIgual(1, 1.0001, 0.001); // true
 */
export function aproximadamenteIgual(a, b, tolerancia) {
    return Math.abs(a - b) < tolerancia;
}
