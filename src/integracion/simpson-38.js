import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarIntervalo } from '../utils/validaciones.js';

/**
 * Aproxima una integral definida usando la regla de Simpson 3/8.
 * Requiere que el número de subintervalos sea múltiplo de 3.
 *
 * @param {Object}   opciones
 * @param {Function} opciones.f  
 * @param {number}   opciones.a  
 * @param {number}   opciones.b  
 * @param {number}   [opciones.n=99] 
 * @returns {Object} 
 * @throws {ErrorParametros} 
 *
 * @example
 * const res = simpson38({ f: (x) => x ** 2, a: 0, b: 1, n: 9 });
 * // res.resultado ≈ 0.3333
 */
export function simpson38({ f, a, b, n = 99 }) {

    // Validaciones
    validarFuncion(f, 'f');
    validarIntervalo(a, b);

    if (!Number.isInteger(n) || n <= 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'n' debe ser un entero positivo. Se recibió: ${n}.`
        );
    }

    if (n % 3 !== 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'n' debe ser múltiplo de 3. Se recibió: ${n}.`
        );
    }

    const h = (b - a) / n;
    const iteraciones = [];

    // Calcular puntos y coeficientes
    let suma = 0;

    for (let i = 0; i <= n; i++) {
        const xi  = a + i * h;
        const fxi = f(xi);
        let coeficiente;

        if (i === 0 || i === n) {
            coeficiente = 1;
        } else if (i % 3 === 0) {
            coeficiente = 2;
        } else {
            coeficiente = 3;
        }

        suma += coeficiente * fxi;

        iteraciones.push({ i, xi, fxi, coeficiente });
    }

    const resultado = (3 * h / 8) * suma;

    return crearResultado({
        resultado,
        iteraciones,
        convergio: true,
        mensaje: `Simpson 3/8 completado con ${n} subintervalos.`,
        meta: {
            metodo: 'Simpson 3/8',
            parametros: { a, b, n },
            tiempo_ms: 0,
        },
    });
}