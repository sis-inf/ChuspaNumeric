import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarIntervalo } from '../utils/validaciones.js';

/**
 * Aproxima una integral definida usando la regla de Simpson 1/3 compuesta.
 * Aplica el método a n subintervalos para mayor precisión.
 * La fórmula es: h/3 * [f(x0) + 4f(x1) + 2f(x2) + ... + 4f(x_{n-1}) + f(xn)]
 *
 * @param {Function} f  - Función a integrar.
 * @param {number}   a  - Extremo inferior del intervalo.
 * @param {number}   b  - Extremo superior del intervalo.
 * @param {number}   n  - Número de subintervalos (debe ser par y >= 2).
 * @returns {Object} Objeto con la forma definida en contrato.js.
 * @throws {ErrorParametros} Si n es impar o menor que 2.
 *
 * @example
 * const res = simpsonCompuesto(x => x**4, 0, 1, 4);
 * // res.resultado ≈ 0.2
 */
export function simpsonCompuesto(f, a, b, n) {

    // Validaciones
    validarFuncion(f, 'f');
    validarIntervalo(a, b);

    if (!Number.isInteger(n) || n < 2) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'n' debe ser un entero mayor o igual a 2. Se recibió: ${n}.`
        );
    }

    if (n % 2 !== 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'n' debe ser par. Se recibió: ${n}.`
        );
    }

    const h = (b - a) / n;
    const iteraciones = [];
    let suma = 0;

    for (let i = 0; i <= n; i++) {
        const xi  = a + i * h;
        const fxi = f(xi);
        let coeficiente;

        if (i === 0 || i === n) {
            coeficiente = 1;
        } else if (i % 2 !== 0) {
            coeficiente = 4;
        } else {
            coeficiente = 2;
        }

        suma += coeficiente * fxi;
        iteraciones.push({ i, xi, fxi, coeficiente });
    }

    const resultado = (h / 3) * suma;

    return crearResultado({
        resultado,
        iteraciones,
        convergio: true,
        mensaje: `Simpson 1/3 compuesto completado con ${n} subintervalos.`,
        meta: {
            metodo: 'Simpson 1/3 Compuesto',
            parametros: { a, b, n },
            tiempo_ms: 0,
        },
    });
}