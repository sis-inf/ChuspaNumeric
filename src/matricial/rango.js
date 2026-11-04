import { ErrorParametros } from '../core/errores.js';

/**
 * Valida que A sea una matriz no vacía de m filas por n columnas: todas las
 * filas deben ser arreglos de la misma longitud con números finitos.
 *
 * @param {*} A - Valor a verificar.
 * @throws {ErrorParametros} Si A no es una matriz rectangular válida.
 */
function validarMatrizRectangular(A) {
    if (!Array.isArray(A) || A.length === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'A' debe ser una matriz no vacía (arreglo de arreglos). Se recibió: ${typeof A}.`
        );
    }
    if (!Array.isArray(A[0]) || A[0].length === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: las filas de 'A' deben ser arreglos no vacíos.`
        );
    }
    const n = A[0].length;
    for (let i = 0; i < A.length; i++) {
        if (!Array.isArray(A[i]) || A[i].length !== n) {
            throw new ErrorParametros(
                `ChuspaNumeric: todas las filas de 'A' deben tener la misma longitud (${n}). La fila ${i} no cumple.`
            );
        }
        for (let j = 0; j < n; j++) {
            if (typeof A[i][j] !== 'number' || !Number.isFinite(A[i][j])) {
                throw new ErrorParametros(
                    `ChuspaNumeric: A[${i}][${j}] debe ser un número finito. Se recibió: ${A[i][j]} (${typeof A[i][j]}).`
                );
            }
        }
    }
}

/**
 * Calcula el rango de una matriz mediante eliminación gaussiana.
 *
 * @param {Object} params
 * @param {number[][]} params.A - Matriz de m filas por n columnas (puede ser rectangular).
 * @returns {number} Rango de la matriz.
 */
export function calcularRango({ A }) {
    validarMatrizRectangular(A);

    const m = A.length;
    const n = A[0].length;
    const EPSILON = 1e-12;

    // Trabajar sobre una copia para no modificar la matriz original
    const M = A.map(fila => [...fila]);

    let filaPivoteActual = 0;

    for (let col = 0; col < n && filaPivoteActual < m; col++) {

        // Buscar el mejor pivote en la columna actual
        let filaPivote = filaPivoteActual;

        for (let i = filaPivoteActual + 1; i < m; i++) {
            if (Math.abs(M[i][col]) > Math.abs(M[filaPivote][col])) {
                filaPivote = i;
            }
        }

        // Si toda la columna es cero, continuar con la siguiente
        if (Math.abs(M[filaPivote][col]) < EPSILON) {
            continue;
        }

        // Intercambiar filas si es necesario
        if (filaPivote !== filaPivoteActual) {
            [M[filaPivoteActual], M[filaPivote]] = [
                M[filaPivote],
                M[filaPivoteActual]
            ];
        }

        const pivote = M[filaPivoteActual][col];

        // Eliminar los elementos debajo del pivote
        for (let fila = filaPivoteActual + 1; fila < m; fila++) {
            const factor = M[fila][col] / pivote;

            for (let k = col; k < n; k++) {
                M[fila][k] -= factor * M[filaPivoteActual][k];
            }
        }

        filaPivoteActual++;
    }

    // Contar filas no nulas de la matriz escalonada
    let rango = 0;

    for (const fila of M) {
        const tieneElementoNoNulo = fila.some(
            valor => Math.abs(valor) > EPSILON
        );

        if (tieneElementoNoNulo) {
            rango++;
        }
    }

    return rango;
}
