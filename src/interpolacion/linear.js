import { ErrorParametros } from "../core/errores.js";

/**
 * Interpolación lineal. Admite dos formas de uso:
 *  - linearInterpolation(x0, y0, x1, y1, x): recta que pasa por (x0, y0) y (x1, y1).
 *  - linearInterpolation(puntos, x): interpolación por tramos con un arreglo de pares [x, y].
 *    Los pares se ordenan internamente por x (sin modificar el arreglo recibido).
 *
 * @throws {ErrorParametros} Si hay parámetros inválidos, abscisas repetidas
 *   o x queda fuera del rango de los puntos.
 */
export function linearInterpolation(x0, y0, x1, y1, x) {
    if (Array.isArray(x0)) {
        return interpolarPorTramos(x0, y0);
    }

    const parametros = { x0, y0, x1, y1, x };

    for (const [nombre, valor] of Object.entries(parametros)) {
        if (typeof valor !== "number" || !Number.isFinite(valor)) {
            throw new ErrorParametros(`${nombre} debe ser un número finito`);
        }
    }

    if (x0 === x1) {
        throw new ErrorParametros("x0 y x1 no pueden ser iguales");
    }

    return y0 + ((y1 - y0) / (x1 - x0)) * (x - x0);
}

function esParValido(punto) {
    return (
        Array.isArray(punto) &&
        punto.length === 2 &&
        punto.every((valor) => typeof valor === "number" && Number.isFinite(valor))
    );
}

function validarEntradaPorTramos(puntos, x) {
    if (!Array.isArray(puntos) || puntos.length < 2) {
        throw new ErrorParametros("puntos debe ser un arreglo con al menos dos pares [x, y]");
    }

    if (!puntos.every(esParValido)) {
        throw new ErrorParametros("cada punto debe ser un par [x, y] de números finitos");
    }

    if (typeof x !== "number" || !Number.isFinite(x)) {
        throw new ErrorParametros("x debe ser un número finito");
    }
}

function ordenarPorAbscisa(puntos) {
    const ordenados = puntos.map(([px, py]) => [px, py]).sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < ordenados.length - 1; i++) {
        if (ordenados[i + 1][0] <= ordenados[i][0]) {
            throw new ErrorParametros(`hay dos puntos con la misma abscisa x = ${ordenados[i][0]}`);
        }
    }

    return ordenados;
}

function interpolarPorTramos(puntos, x) {
    validarEntradaPorTramos(puntos, x);
    const ordenados = ordenarPorAbscisa(puntos);

    const xMin = ordenados[0][0];
    const xMax = ordenados[ordenados.length - 1][0];
    if (x < xMin || x > xMax) {
        throw new ErrorParametros(`x (${x}) está fuera del rango de los puntos [${xMin}, ${xMax}]`);
    }

    let i = 0;
    while (x > ordenados[i + 1][0]) {
        i++;
    }

    const [xa, ya] = ordenados[i];
    const [xb, yb] = ordenados[i + 1];
    if (x === xa) return ya;
    if (x === xb) return yb;

    return linearInterpolation(xa, ya, xb, yb, x);
}
