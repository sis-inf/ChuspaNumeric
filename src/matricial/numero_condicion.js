import { ErrorParametros, ErrorTamano } from '../core/errores.js';
import { normaFrobenius } from './norma_matriz.js';

function esMatrizValida(M) {
    return (
        Array.isArray(M) &&
        M.length > 0 &&
        M.every(fila => Array.isArray(fila) && fila.length > 0)
    );
}

function esCuadrada(M) {
    return M.every(fila => fila.length === M.length);
}

/**
 * Calcula el número de condición de una matriz.
 *
 * cond(A) = ||A|| * ||A^-1||
 *
 * @param {number[][]} A Matriz original
 * @param {number[][]} inversaA Matriz inversa de A
 * @returns {number} Número de condición
 */
export function calcularNumeroCondicion(A, inversaA) {
    if (!esMatrizValida(A) || !esMatrizValida(inversaA)) {
        throw new ErrorParametros('Las entradas deben ser matrices');
    }
    if (!esCuadrada(A) || !esCuadrada(inversaA)) {
        throw new ErrorTamano('Las matrices deben ser cuadradas');
    }
    if (A.length !== inversaA.length) {
        throw new ErrorTamano('Las matrices deben tener las mismas dimensiones');
    }

    const normaA = normaFrobenius(A);
    const normaInversa = normaFrobenius(inversaA);

    return normaA * normaInversa;
}
