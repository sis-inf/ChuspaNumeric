import { ErrorParametros } from '../core/errores.js';
import { crearResultado, medirTiempo } from '../core/contrato.js';
import { normaFrobenius } from './norma_matriz.js';

/**
 * Obtiene el valor numérico de una norma, ya sea un número o un resultado estructurado.
 *
 * @param {number|{resultado: number}} norma Valor devuelto por normaFrobenius
 * @returns {number} Valor numérico de la norma
 */
function valorNorma(norma) {
    return typeof norma === 'number' ? norma : norma.resultado;
}

function describir(valor) {
    if (Array.isArray(valor)) {
        return `un arreglo de longitud ${valor.length}`;
    }
    if (valor === null) {
        return 'null';
    }
    return `un valor de tipo ${typeof valor}`;
}

function validarMatriz(M, nombre) {
    const prefijo = 'ChuspaNumeric.calcularNumeroCondicion';
    if (!Array.isArray(M) || M.length === 0) {
        throw new ErrorParametros(
            `${prefijo}: ${nombre} debe ser una matriz (arreglo de arreglos) no vacía, se recibió ${describir(M)}`
        );
    }
    const columnas = Array.isArray(M[0]) ? M[0].length : 0;
    for (let i = 0; i < M.length; i++) {
        const fila = M[i];
        if (!Array.isArray(fila) || fila.length === 0) {
            throw new ErrorParametros(
                `${prefijo}: la fila ${i} de ${nombre} debe ser un arreglo no vacío, se recibió ${describir(fila)}`
            );
        }
        if (fila.length !== columnas) {
            throw new ErrorParametros(
                `${prefijo}: ${nombre} tiene filas de distinta longitud (la fila 0 tiene ${columnas} y la fila ${i} tiene ${fila.length})`
            );
        }
        for (let j = 0; j < fila.length; j++) {
            if (typeof fila[j] !== 'number' || !Number.isFinite(fila[j])) {
                throw new ErrorParametros(
                    `${prefijo}: ${nombre}[${i}][${j}] debe ser un número finito, se recibió ${String(fila[j])}`
                );
            }
        }
    }
    if (columnas !== M.length) {
        throw new ErrorParametros(
            `${prefijo}: ${nombre} debe ser cuadrada, se recibió ${M.length}x${columnas}`
        );
    }
}

/**
 * Calcula el número de condición de una matriz.
 *
 * cond(A) = ||A|| * ||A^-1||
 *
 * @param {number[][]} A Matriz original (cuadrada, valores finitos)
 * @param {number[][]} inversaA Matriz inversa de A (mismas dimensiones que A)
 * @returns {object} Resultado estructurado: resultado (número de condición),
 *   iteraciones, convergio y meta con metodo, parametros y tiempo_ms
 * @throws {ErrorParametros} Si las entradas no son matrices cuadradas válidas,
 *   tienen valores no finitos o dimensiones incompatibles
 */
export function calcularNumeroCondicion(A, inversaA) {
    validarMatriz(A, 'A');
    validarMatriz(inversaA, 'inversaA');
    if (A.length !== inversaA.length) {
        throw new ErrorParametros(
            `ChuspaNumeric.calcularNumeroCondicion: A e inversaA deben tener las mismas dimensiones, se recibió ${A.length}x${A.length} y ${inversaA.length}x${inversaA.length}`
        );
    }

    const { valor, tiempo_ms } = medirTiempo(
        () => valorNorma(normaFrobenius(A)) * valorNorma(normaFrobenius(inversaA))
    );

    return crearResultado({
        resultado: valor,
        iteraciones: [],
        convergio: true,
        mensaje: 'Número de condición calculado con la norma de Frobenius',
        meta: {
            metodo: 'numero-condicion',
            parametros: { filas: A.length, columnas: A.length },
            tiempo_ms
        }
    });
}