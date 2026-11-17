/**
 * Módulo para el cálculo de errores numéricos.
 *
 * Proporciona funciones para calcular el error absoluto, relativo,
 * porcentual y relativo aproximado entre valores numéricos.
 *
 * @module utils/error_relativo
 */

/**
 * Calcula el error absoluto entre un valor verdadero y uno aproximado.
 *
 * @param {number} valorVerdadero - Valor verdadero o exacto.
 * @param {number} valorAproximado - Valor aproximado que se desea comparar.
 * @returns {number} Diferencia absoluta entre ambos valores.
 * @throws {TypeError} Si alguno de los argumentos no es un número.
 * @throws {Error} Si alguno de los valores es NaN.
 *
 * @example
 * errorAbsoluto(10, 8) // 2
 */
export function errorAbsoluto(valorVerdadero, valorAproximado) {
    if (typeof valorVerdadero !== 'number' || typeof valorAproximado !== 'number') {
        throw new TypeError('Ambos argumentos deben ser números');
    }
    if (isNaN(valorVerdadero) || isNaN(valorAproximado)) {
        throw new Error('Los valores no pueden ser NaN');
    }
    return Math.abs(valorVerdadero - valorAproximado);
}

/**
 * Calcula el error relativo entre un valor verdadero y uno aproximado.
 *
 * @param {number} valorVerdadero - Valor verdadero o exacto, distinto de cero.
 * @param {number} valorAproximado - Valor aproximado que se desea comparar.
 * @returns {number} Error relativo expresado como un valor decimal.
 * @throws {TypeError} Si alguno de los argumentos no es un número.
 * @throws {Error} Si alguno de los valores es NaN o si el valor verdadero es cero.
 *
 * @example
 * errorRelativo(10, 8) // 0.2
 */
export function errorRelativo(valorVerdadero, valorAproximado) {
    if (typeof valorVerdadero !== 'number' || typeof valorAproximado !== 'number') {
        throw new TypeError('Ambos argumentos deben ser números');
    }
    if (isNaN(valorVerdadero) || isNaN(valorAproximado)) {
        throw new Error('Los valores no pueden ser NaN');
    }
    if (valorVerdadero === 0) {
        throw new Error('El valor verdadero no puede ser 0 para calcular error relativo');
    }
    return Math.abs((valorVerdadero - valorAproximado) / valorVerdadero);
}

/**
 * Calcula el error porcentual entre un valor verdadero y uno aproximado.
 *
 * @param {number} valorVerdadero - Valor verdadero o exacto, distinto de cero.
 * @param {number} valorAproximado - Valor aproximado que se desea comparar.
 * @returns {number} Error relativo expresado en porcentaje.
 * @throws {TypeError} Si alguno de los argumentos no es un número.
 * @throws {Error} Si alguno de los valores es NaN o si el valor verdadero es cero.
 *
 * @example
 * errorPorcentual(10, 8) // 20
 */
export function errorPorcentual(valorVerdadero, valorAproximado) {
    if (typeof valorVerdadero !== 'number' || typeof valorAproximado !== 'number') {
        throw new TypeError('Ambos argumentos deben ser números');
    }
    if (isNaN(valorVerdadero) || isNaN(valorAproximado)) {
        throw new Error('Los valores no pueden ser NaN');
    }
    if (valorVerdadero === 0) {
        throw new Error('El valor verdadero no puede ser 0 para calcular error porcentual');
    }
    return Math.abs(((valorVerdadero - valorAproximado) / valorVerdadero) * 100);
}

/**
 * Calcula el error relativo aproximado entre dos valores de iteraciones consecutivas.
 *
 * @param {number} xNuevo - Valor obtenido en la iteración actual, distinto de cero.
 * @param {number} xAnterior - Valor obtenido en la iteración anterior.
 * @returns {number} Error relativo aproximado expresado como un valor decimal.
 * @throws {TypeError} Si alguno de los argumentos no es un número.
 * @throws {Error} Si alguno de los valores es NaN o si el valor nuevo es cero.
 *
 * @example
 * errorRelativoAproximado(10, 8) // 0.2
 */
export function errorRelativoAproximado(xNuevo, xAnterior) {
    if (typeof xNuevo !== 'number' || typeof xAnterior !== 'number') {
        throw new TypeError('Ambos argumentos deben ser números');
    }
    if (isNaN(xNuevo) || isNaN(xAnterior)) {
        throw new Error('Los valores no pueden ser NaN');
    }
    if (xNuevo === 0) {
        throw new Error('El valor nuevo no puede ser 0 para calcular error relativo aproximado');
    }
    return Math.abs((xNuevo - xAnterior) / xNuevo);
}