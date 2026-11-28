import { ErrorParametros, ErrorNumerico } from "../core/errores.js";
import { crearResultado, medirTiempo } from "../core/contrato.js";

/**
 * Interpolación lineal.
 *
 * Admite dos formas de uso:
 * - linearInterpolation(x0, y0, x1, y1, x)
 * - linearInterpolation(puntos, x)
 *
 * @returns {Object} Resultado según el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros son inválidos.
 * @throws {ErrorNumerico} Si el cálculo produce un valor no finito.
 */
export function linearInterpolation(x0, y0, x1, y1, x) {
    let parametros;
    let calculo;

    if (Array.isArray(x0)) {
        if (arguments.length !== 2) {
            throw new ErrorParametros(
                "Se requieren dos argumentos: puntos y x"
            );
        }

        parametros = { puntos: x0, x: y0 };
        calculo = () => interpolarPorTramos(x0, y0);
    } else {
        if (arguments.length !== 5) {
            throw new ErrorParametros(
                "Se requieren cinco argumentos: x0, y0, x1, y1, x"
            );
        }

        parametros = { x0, y0, x1, y1, x };

        for (const [nombre, valor] of Object.entries(parametros)) {
            validarNumero(valor, nombre);
        }

        if (x0 === x1) {
            throw new ErrorParametros(
                "x0 y x1 no pueden ser iguales"
            );
        }

        calculo = () => calcularLineal(x0, y0, x1, y1, x);
    }

    const { valor, tiempo_ms } = medirTiempo(calculo);

    return crearResultado({
        resultado: valor,
        iteraciones: [],
        convergio: true,
        mensaje: "Interpolación lineal realizada correctamente.",
        meta: {
            metodo: "linearInterpolation",
            parametros,
            tiempo_ms
        }
    });
}

function validarNumero(valor, nombre) {
    if (typeof valor !== "number" || !Number.isFinite(valor)) {
        throw new ErrorParametros(
            `${nombre} debe ser un número finito`
        );
    }
}

function calcularLineal(x0, y0, x1, y1, x) {
    if (x === x0) return y0;
    if (x === x1) return y1;

    const diferenciaX = x1 - x0;
    const diferenciaY = y1 - y0;
    const desplazamiento = x - x0;

    if (
        !Number.isFinite(diferenciaX) ||
        !Number.isFinite(diferenciaY) ||
        !Number.isFinite(desplazamiento)
    ) {
        throw new ErrorNumerico(
            "La interpolación produjo diferencias no finitas"
        );
    }

    const resultado =
        y0 + (diferenciaY / diferenciaX) * desplazamiento;

    if (!Number.isFinite(resultado)) {
        throw new ErrorNumerico(
            "La interpolación produjo un resultado no finito"
        );
    }

    return resultado;
}

function esParValido(punto) {
    return (
        Array.isArray(punto) &&
        punto.length === 2 &&
        typeof punto[0] === "number" &&
        Number.isFinite(punto[0]) &&
        typeof punto[1] === "number" &&
        Number.isFinite(punto[1])
    );
}

function validarEntradaPorTramos(puntos, x) {
    if (!Array.isArray(puntos) || puntos.length < 2) {
        throw new ErrorParametros(
            "puntos debe ser un arreglo con al menos dos pares [x, y]"
        );
    }

    for (let i = 0; i < puntos.length; i++) {
        if (!esParValido(puntos[i])) {
            throw new ErrorParametros(
                `cada punto debe ser un par [x, y] de números finitos. Punto inválido: ${i}`
            );
        }
    }

    validarNumero(x, "x");
}

function ordenarPorAbscisa(puntos) {
    const ordenados = puntos
        .map(([px, py]) => [px, py])
        .sort((a, b) => a[0] - b[0]);

    for (let i = 0; i < ordenados.length - 1; i++) {
        if (ordenados[i + 1][0] <= ordenados[i][0]) {
            throw new ErrorParametros(
                `hay dos puntos con la misma abscisa x = ${ordenados[i][0]}`
            );
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
        throw new ErrorParametros(
            `x (${x}) está fuera del rango de los puntos [${xMin}, ${xMax}]`
        );
    }

    let i = 0;

    while (x > ordenados[i + 1][0]) {
        i++;
    }

    const [xa, ya] = ordenados[i];
    const [xb, yb] = ordenados[i + 1];

    return calcularLineal(xa, ya, xb, yb, x);
}
