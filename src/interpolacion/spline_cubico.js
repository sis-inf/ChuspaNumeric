import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Valida los parámetros de entrada del spline cúbico natural (uso interno).
 *
 * @param {number[]} xs - Nodos.
 * @param {number[]} ys - Valores en los nodos.
 * @param {number}   x  - Punto de evaluación.
 * @throws {ErrorParametros} Si los tipos, dimensiones, valores o el orden no son válidos.
 */
function _validarEntradas(xs, ys, x) {
    if (!Array.isArray(xs) || !Array.isArray(ys)) {
        throw new ErrorParametros(
            `ChuspaNumeric.splineCubicoNatural: 'xs' y 'ys' deben ser arreglos.`
        );
    }

    if (xs.length < 3) {
        throw new ErrorParametros(
            `ChuspaNumeric.splineCubicoNatural: 'xs' debe tener al menos 3 elementos. ` +
            `Se recibió: ${xs.length}.`
        );
    }

    if (xs.length !== ys.length) {
        throw new ErrorParametros(
            `ChuspaNumeric.splineCubicoNatural: 'xs' y 'ys' deben tener la misma longitud. ` +
            `Se recibió: xs=${xs.length}, ys=${ys.length}.`
        );
    }

    for (let i = 0; i < xs.length; i++) {
        if (!Number.isFinite(xs[i])) {
            throw new ErrorParametros(
                `ChuspaNumeric.splineCubicoNatural: 'xs' debe contener solamente números finitos. ` +
                `xs[${i}] es ${xs[i]}.`
            );
        }
        if (!Number.isFinite(ys[i])) {
            throw new ErrorParametros(
                `ChuspaNumeric.splineCubicoNatural: 'ys' debe contener solamente números finitos. ` +
                `ys[${i}] es ${ys[i]}.`
            );
        }
    }

    if (!Number.isFinite(x)) {
        throw new ErrorParametros(
            `ChuspaNumeric.splineCubicoNatural: 'x' debe ser un número finito. Se recibió: ${x}.`
        );
    }

    // Nodos estrictamente crecientes: evita h = 0 (división por cero) en el sistema tridiagonal.
    for (let i = 1; i < xs.length; i++) {
        if (xs[i] <= xs[i - 1]) {
            throw new ErrorParametros(
                `ChuspaNumeric.splineCubicoNatural: 'xs' debe estar ordenado ascendentemente ` +
                `y sin repetidos. xs[${i - 1}]=${xs[i - 1]} >= xs[${i}]=${xs[i]}.`
            );
        }
    }
}

/**
 * Calcula los momentos M del spline natural y evalúa el spline en x (uso interno).
 *
 * @param {number[]} xs - Nodos (ya validados).
 * @param {number[]} ys - Valores en los nodos (ya validados).
 * @param {number}   x  - Punto de evaluación (ya validado).
 * @returns {{ resultado: number, M: number[] }} Valor del spline en x y los momentos.
 */
function _calcularSpline(xs, ys, x) {
    const n = xs.length;
    const m = n - 1; // número de intervalos

    // Diferencias h
    const h = [];
    for (let i = 0; i < m; i++) {
        h[i] = xs[i + 1] - xs[i];
    }

    // Sistema tridiagonal para los momentos M (naturales: M[0] = M[n-1] = 0)
    const M = new Array(n).fill(0);
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

        // Eliminación hacia adelante (algoritmo de Thomas)
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

    // Intervalo donde cae x
    let idx = m - 1;
    for (let i = 0; i < m; i++) {
        if (x <= xs[i + 1]) {
            idx = i;
            break;
        }
    }

    // Evaluar el spline en x
    const hi  = h[idx];
    const dx1 = xs[idx + 1] - x;
    const dx2 = x - xs[idx];

    const resultado =
        (M[idx] * dx1 ** 3) / (6 * hi) +
        (M[idx + 1] * dx2 ** 3) / (6 * hi) +
        (ys[idx] - M[idx] * hi ** 2 / 6) * (dx1 / hi) +
        (ys[idx + 1] - M[idx + 1] * hi ** 2 / 6) * (dx2 / hi);

    return { resultado, M };
}

/**
 * Implementa interpolación por splines cúbicos naturales.
 * Condiciones de frontera naturales: segunda derivada = 0 en los extremos.
 *
 * @param {number[]} xs - Arreglo de nodos x, finitos y estrictamente crecientes.
 * @param {number[]} ys - Arreglo de valores y correspondientes a cada x (finitos).
 * @param {number}   x  - Punto finito donde se desea interpolar.
 * @returns {Object} Objeto con la forma definida en contrato.js. Si x está fuera de
 *   [xs[0], xs[n-1]] se extrapola y se agrega una advertencia en `warnings`.
 * @throws {ErrorParametros} Si xs o ys no son arreglos, si xs.length < 3, si las
 *   longitudes no coinciden, si hay valores no finitos, si x no es finito o si xs
 *   no es estrictamente creciente.
 *
 * @example
 * const res = splineCubicoNatural([0, 1, 2], [0, 1, 4], 1.5);
 * // res.resultado ≈ 2.3125
 */
export function splineCubicoNatural(xs, ys, x) {
    _validarEntradas(xs, ys, x);

    const { valor, tiempo_ms } = medirTiempo(() => _calcularSpline(xs, ys, x));
    const { resultado, M } = valor;

    // Si los datos son tan grandes que el cálculo desborda, el resultado no es confiable.
    if (!Number.isFinite(resultado)) {
        throw new ErrorParametros(
            `ChuspaNumeric.splineCubicoNatural: los cálculos exceden el rango numérico ` +
            `representable para los datos recibidos.`
        );
    }

    const warnings = [];
    const xMin = xs[0];
    const xMax = xs[xs.length - 1];
    if (x < xMin || x > xMax) {
        warnings.push(
            `x=${x} está fuera del rango de los nodos [${xMin}, ${xMax}]: ` +
            `se extrapola con el polinomio del tramo más cercano y el resultado puede ser poco fiable.`
        );
    }

    const iteraciones = xs.map((xi, i) => ({ i, xi, yi: ys[i], Mi: M[i] }));

    return crearResultado({
        resultado,
        iteraciones,
        convergio: true,
        mensaje: `Spline cúbico natural evaluado en x=${x}.`,
        meta: {
            metodo: 'Spline Cúbico Natural',
            parametros: { xs, ys, x },
            tiempo_ms,
        },
        warnings,
    });
}
