/**
 * Módulo para cálculo de errores numéricos
 * @module utils/error_relativo
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
