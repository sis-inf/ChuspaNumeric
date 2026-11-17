import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

function validarTabla(tabla) {
    if (!Array.isArray(tabla) || tabla.length === 0) {
        throw new ErrorParametros('tabla debe ser un arreglo no vacío de filas.');
    }
    for (let i = 0; i < tabla.length; i++) {
        if (!Array.isArray(tabla[i])) {
            throw new ErrorParametros(`La fila ${i} de tabla debe ser un arreglo.`);
        }
        if (!tabla[i].every(valor => typeof valor === 'number' && Number.isFinite(valor))) {
            throw new ErrorParametros(`La fila ${i} de tabla debe contener solo números finitos.`);
        }
    }
}

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
 * El campo `resultado` es la matriz triangular de órdenes de diferencia: la fila 0
 * es la serie original y la fila k contiene las diferencias de orden k (n - k valores),
 * hasta el orden n - 1.
 *
 * @param {number[]} y - Valores de la serie (al menos 2, números finitos).
 * @param {string} [tipo='adelante'] - 'adelante' (progresivas) o 'atras' (regresivas).
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric:
 *   - `resultado`: matriz triangular de diferencias finitas (number[][]).
 *   - `convergio`: true (es un cálculo directo, sin iteraciones).
 *   - `mensaje`: descripción del resultado.
 *   - `meta.metodo`: 'tabla-diferencias-adelante' o 'tabla-diferencias-atras'.
 *   - `meta.parametros`: { tipo, n, ordenMaximo }.
 * @throws {ErrorParametros} Si y no es válido, tipo no es 'adelante' ni 'atras', o
 *   alguna diferencia desborda el rango numérico (deja de ser finita).
 *
 * @example
 * generarTablaDiferencias([1, 4, 9, 16]).resultado;
 * // [[1, 4, 9, 16], [3, 5, 7], [2, 2], [0]]
 */
export function generarTablaDiferencias(y, tipo = 'adelante') {
    if (tipo !== 'adelante' && tipo !== 'atras') {
        throw new ErrorParametros(
            `tipo debe ser 'adelante' o 'atras'. Se recibió: ${tipo}.`
        );
    }

    const { valor, tiempo_ms } = medirTiempo(() =>
        tipo === 'adelante' ? construirTablaAdelante(y) : construirTablaAtras(y)
    );

    if (!valor.every(fila => fila.every(diferencia => Number.isFinite(diferencia)))) {
        throw new ErrorParametros(
            'Las diferencias de y exceden el rango numérico representable.'
        );
    }

    return crearResultado({
        resultado: valor,
        convergio: true,
        mensaje: `Tabla de diferencias hacia ${tipo === 'adelante' ? 'adelante' : 'atrás'} completada.`,
        meta: {
            metodo: `tabla-diferencias-${tipo}`,
            parametros: { tipo, n: y.length, ordenMaximo: y.length - 1 },
            tiempo_ms,
        },
    });
}

export function formatearTabla(tabla) {
    validarTabla(tabla);

    return tabla
        .map(fila => fila.join('\t'))
        .join('\n');
}