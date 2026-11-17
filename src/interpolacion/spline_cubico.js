import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Implementa interpolación por splines cúbicos naturales.
 * Condiciones de frontera naturales: segunda derivada = 0 en los extremos.
 *
 * @param {number[]} xs - Arreglo de valores x (nodos), debe estar ordenado ascendentemente.
 * @param {number[]} ys - Arreglo de valores y correspondientes a cada x.
 * @param {number}   x  - Punto donde se desea interpolar.
 * @returns {Object} Objeto con la forma definida en contrato.js.
 * @throws {ErrorParametros} Si xs.length < 3, xs no está ordenado o longitudes no coinciden.
 *
 * @example
 * const res = splineCubicoNatural([0, 1, 2], [0, 1, 4], 1.5);
 * // res.resultado ≈ 2.25
 */
// eslint-disable-next-line complexity
export function splineCubicoNatural(xs, ys, x) {

    // Validaciones
    if (!Array.isArray(xs) || !Array.isArray(ys)) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'xs' y 'ys' deben ser arreglos.`
        );
    }

    if (xs.length < 3) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'xs' debe tener al menos 3 elementos. Se recibió: ${xs.length}.`
        );
    }

    if (xs.length !== ys.length) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'xs' y 'ys' deben tener la misma longitud.`
        );
    }

    // Verificar que xs está ordenado ascendentemente
    for (let i = 1; i < xs.length; i++) {
        if (xs[i] <= xs[i - 1]) {
            throw new ErrorParametros(
                `ChuspaNumeric: 'xs' debe estar ordenado ascendentemente. ` +
                `xs[${i - 1}]=${xs[i - 1]} >= xs[${i}]=${xs[i]}.`
            );
        }
    }

    const n = xs.length;
    const m = n - 1; // número de intervalos

    // Calcular diferencias h
    const h = [];
    for (let i = 0; i < m; i++) {
        h[i] = xs[i + 1] - xs[i];
    }

    // Sistema tridiagonal para calcular momentos M
    // Condiciones naturales: M[0] = 0, M[n-1] = 0
    const M = new Array(n).fill(0);

    // Construir sistema de ecuaciones para M[1]...M[n-2]
    const size = n - 2;

    if (size > 0) {
        const diag  = new Array(size).fill(0);
        const upper = new Array(size - 1).fill(0);
        const lower = new Array(size - 1).fill(0);
        const rhs   = new Array(size).fill(0);

        for (let i = 0; i < size; i++) {
            const idx = i + 1;
            diag[i] = 2 * (h[idx - 1] + h[idx]);
            rhs[i]  = 6 * (
                (ys[idx + 1] - ys[idx]) / h[idx] -
                (ys[idx] - ys[idx - 1]) / h[idx - 1]
            );
            if (i < size - 1) {
                upper[i] = h[idx];
                lower[i] = h[idx];
            }
        }

        // Eliminación hacia adelante (Thomas algorithm)
        for (let i = 1; i < size; i++) {
            const factor = lower[i - 1] / diag[i - 1];
            diag[i] -= factor * upper[i - 1];
            rhs[i]  -= factor * rhs[i - 1];
        }

        // Sustitución hacia atrás
        const sol = new Array(size).fill(0);
        sol[size - 1] = rhs[size - 1] / diag[size - 1];
        for (let i = size - 2; i >= 0; i--) {
            sol[i] = (rhs[i] - upper[i] * sol[i + 1]) / diag[i];
        }

        for (let i = 0; i < size; i++) {
            M[i + 1] = sol[i];
        }
    }

    // Encontrar intervalo donde cae x
    let idx = m - 1;
    for (let i = 0; i < m; i++) {
        if (x <= xs[i + 1]) {
            idx = i;
            break;
        }
    }

    // Evaluar spline en x
    const hi  = h[idx];
    const dx1 = xs[idx + 1] - x;
    const dx2 = x - xs[idx];

    const resultado =
        (M[idx] * dx1 ** 3) / (6 * hi) +
        (M[idx + 1] * dx2 ** 3) / (6 * hi) +
        (ys[idx] - M[idx] * hi ** 2 / 6) * (dx1 / hi) +
        (ys[idx + 1] - M[idx + 1] * hi ** 2 / 6) * (dx2 / hi);

    const iteraciones = xs.map((xi, i) => ({ i, xi, yi: ys[i], Mi: M[i] }));

    return crearResultado({
        resultado,
        iteraciones,
        convergio: true,
        mensaje: `Spline cúbico natural evaluado en x=${x}.`,
        meta: {
            metodo: 'Spline Cúbico Natural',
            parametros: { xs, ys, x },
            tiempo_ms: 0,
        },
    });
}