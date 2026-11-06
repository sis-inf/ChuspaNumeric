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

export function formatearTabla(tabla) {
    return tabla
        .map(fila => fila.join('\t'))
        .join('\n');
}