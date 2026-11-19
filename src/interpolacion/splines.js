import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Calcula la interpolación por trazadores cúbicos (splines cúbicos naturales).
 *
 * @param {Object} params
 * @param {Array<Array<number>>} params.puntos - Array de pares [[xi, yi], ...]
 * @param {number} params.x - El punto a evaluar
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric
 * @throws {ErrorParametros} Si los parámetros son inválidos o los cálculos no son finitos
 */
function validarParametros(params) {
    if (!params || typeof params !== 'object' || Array.isArray(params)) {
        throw new ErrorParametros("El parámetro debe ser un objeto con 'puntos' y 'x'.");
    }

    const { puntos, x } = params;

    if (!Array.isArray(puntos) || puntos.length < 3) {
        throw new ErrorParametros("El parámetro 'puntos' debe ser un array con al menos tres pares [xi, yi].");
    }

    if (!Number.isFinite(x)) {
        throw new ErrorParametros("El parámetro 'x' debe ser un número finito.");
    }

    for (let i = 0; i < puntos.length; i++) {
        if (!Array.isArray(puntos[i]) || puntos[i].length !== 2) {
            throw new ErrorParametros(`El punto en la posición ${i} debe contener exactamente dos valores [xi, yi].`);
        }

        if (!Number.isFinite(puntos[i][0]) || !Number.isFinite(puntos[i][1])) {
            throw new ErrorParametros(`Las coordenadas del punto en la posición ${i} deben ser números finitos.`);
        }

        if (i > 0 && puntos[i][0] <= puntos[i - 1][0]) {
            throw new ErrorParametros("Los valores de x en los puntos deben estar en orden estrictamente creciente.");
        }
    }

    return { puntos, x };
}

function validarRango(x, xMin, xMax) {
    if (x < xMin || x > xMax) {
        throw new ErrorParametros(`El valor x (${x}) a evaluar está fuera del rango de los puntos [${xMin}, ${xMax}].`);
    }
}

export function splines(params) {
    const { puntos, x } = validarParametros(params);

    const n = puntos.length - 1;

    const xMin = puntos[0][0];
    const xMax = puntos[n][0];

    validarRango(x, xMin, xMax);

    const h = new Array(n);
    const alpha = new Array(n);

    for (let i = 0; i < n; i++) {
        h[i] = puntos[i + 1][0] - puntos[i][0];

        if (!Number.isFinite(h[i]) || h[i] <= 0) {
            throw new ErrorParametros("Los intervalos entre puntos deben ser positivos y finitos.");
        }
    }

    for (let i = 1; i < n; i++) {
        alpha[i] = (3 / h[i]) * (puntos[i + 1][1] - puntos[i][1]) - (3 / h[i - 1]) * (puntos[i][1] - puntos[i - 1][1]);
    }

    const l = new Array(puntos.length);
    const mu = new Array(puntos.length);
    const z = new Array(puntos.length);
    const c = new Array(puntos.length);

    l[0] = 1;
    mu[0] = 0;
    z[0] = 0;

    for (let i = 1; i < n; i++) {
        l[i] = 2 * (puntos[i + 1][0] - puntos[i - 1][0]) - h[i - 1] * mu[i - 1];
        mu[i] = h[i] / l[i];
        z[i] = (alpha[i] - h[i - 1] * z[i - 1]) / l[i];

        if (![l[i], mu[i], z[i]].every(Number.isFinite) || l[i] === 0) {
            throw new ErrorParametros("Los parámetros producen valores intermedios no válidos en el cálculo del spline.");
        }
    }

    l[n] = 1;
    z[n] = 0;
    c[n] = 0;

    const b = new Array(n);
    const d = new Array(n);
    const a = new Array(n);
    const iteraciones = [];

    for (let j = n - 1; j >= 0; j--) {
        c[j] = z[j] - mu[j] * c[j + 1];
        b[j] = (puntos[j + 1][1] - puntos[j][1]) / h[j] - h[j] * (c[j + 1] + 2 * c[j]) / 3;
        d[j] = (c[j + 1] - c[j]) / (3 * h[j]);
        a[j] = puntos[j][1];

        if (![a[j], b[j], c[j], d[j]].every(Number.isFinite)) {
            throw new ErrorParametros("Los parámetros producen coeficientes no finitos.");
        }

        iteraciones.push({
            tramo: j + 1,
            xi: puntos[j][0],
            xisig: puntos[j + 1][0],
            a: Math.round(a[j] * 1e12) / 1e12,
            b: Math.round(b[j] * 1e12) / 1e12,
            c: Math.round(c[j] * 1e12) / 1e12,
            d: Math.round(d[j] * 1e12) / 1e12
        });
    }

    iteraciones.reverse();

    let resultado = 0;
    for (let i = 0; i < n; i++) {
        if (x >= puntos[i][0] && x <= puntos[i + 1][0]) {
            const dx = x - puntos[i][0];
            resultado = a[i] + b[i] * dx + c[i] * Math.pow(dx, 2) + d[i] * Math.pow(dx, 3);
            resultado = Math.round(resultado * 1e12) / 1e12;
            break;
        }
    }

    if (!Number.isFinite(resultado)) {
        throw new ErrorParametros("El cálculo del spline produjo un resultado no finito.");
    }

    return crearResultado({
        resultado,
        iteraciones,
        convergio: true,
        mensaje: "Trazadores cúbicos calculados y evaluados con éxito.",
        meta: {
            metodo: "Splines Cúbicos Naturales",
            parametros: { puntos, x }
        }
    });
}
