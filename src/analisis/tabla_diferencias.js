import { ErrorParametros } from '../core/errores.js';

function validarSerie(ys) {
    if (!Array.isArray(ys)) {
        throw new ErrorParametros('ys debe ser un arreglo.');
    }
    if (ys.length < 2) {
        throw new ErrorParametros('ys debe tener al menos 2 elementos.');
    }
    if (!ys.every(y => typeof y === 'number' && Number.isFinite(y))) {
        throw new ErrorParametros('ys debe contener solo números finitos.');
    }
}

export function construirTablaAdelante(ys) {
    validarSerie(ys);

    const tabla = [ys.slice()];
    let actual = ys.slice();

    while (actual.length > 1) {
        const siguiente = [];

        for (let i = 0; i < actual.length - 1; i++) {
            siguiente.push(actual[i + 1] - actual[i]);
        }

        tabla.push(siguiente);
        actual = siguiente;
    }

    return tabla;
}

export function construirTablaAtras(ys) {
    validarSerie(ys);

    const tabla = [ys.slice()];
    let actual = ys.slice();

    while (actual.length > 1) {
        const siguiente = [];

        for (let i = 1; i < actual.length; i++) {
            siguiente.push(actual[i] - actual[i - 1]);
        }

        tabla.push(siguiente);
        actual = siguiente;
    }

    return tabla;
}

/**
 * Genera la tabla de diferencias finitas de una serie de datos equiespaciados.
 *
 * Devuelve la matriz triangular de órdenes de diferencia: la fila 0 es la
 * serie original y la fila k contiene las diferencias de orden k (n - k valores),
 * hasta el orden n - 1.
 *
 * @param {number[]} y - Valores de la serie (al menos 2, números finitos).
 * @param {string} [tipo='adelante'] - 'adelante' (progresivas) o 'atras' (regresivas).
 * @returns {number[][]} Matriz triangular de diferencias finitas.
 * @throws {ErrorParametros} Si y no es válido o tipo no es 'adelante' ni 'atras'.
 *
 * @example
 * generarTablaDiferencias([1, 4, 9, 16]);
 * // [[1, 4, 9, 16], [3, 5, 7], [2, 2], [0]]
 */
export function generarTablaDiferencias(y, tipo = 'adelante') {
    if (tipo !== 'adelante' && tipo !== 'atras') {
        throw new ErrorParametros(
            `tipo debe ser 'adelante' o 'atras'. Se recibió: ${tipo}.`
        );
    }

    if (tipo === 'adelante') {
        return construirTablaAdelante(y);
    }

    return construirTablaAtras(y);
}

export function formatearTabla(tabla) {
    return tabla
        .map(fila => fila.join('\t'))
        .join('\n');
}