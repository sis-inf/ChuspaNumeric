import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero } from '../utils/validaciones.js';

/**
 * Resuelve una EDO y' = f(x, y) mediante el método de Euler.
 *
 * @param {Object} opciones - Parámetros del método.
 * @returns {Object} Resultado estructurado.
 * @throws {ErrorParametros} Si los parámetros o cálculos no son válidos.
 */
export function euler(opciones = {}) {
    if (
        opciones === null ||
        typeof opciones !== 'object' ||
        Array.isArray(opciones)
    ) {
        throw new ErrorParametros(
            'ChuspaNumeric.euler: las opciones deben ser un objeto válido.'
        );
    }

    const { f, x0, y0, h, xFinal } = opciones;

    validarFuncion(f, 'f');
    validarNumero(x0, 'x0');
    validarNumero(y0, 'y0');
    validarNumero(h, 'h');
    validarNumero(xFinal, 'xFinal');

    if (h <= 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.euler: el paso 'h' debe ser mayor que cero.`
        );
    }

    if (xFinal <= x0) {
        throw new ErrorParametros(
            `ChuspaNumeric.euler: 'xFinal' debe ser mayor que 'x0'.`
        );
    }

    const { valor, tiempo_ms } = medirTiempo(() => {
        const iteraciones = [];
        const resultado = [];

        let x = x0;
        let y = y0;
        let n = 0;

        while (x <= xFinal + 1e-10) {
            const fxy = f(x, y);

            if (!Number.isFinite(fxy)) {
                throw new ErrorParametros(
                    `ChuspaNumeric.euler: f(x, y) debe devolver un número finito en la iteración ${n}.`
                );
            }

            iteraciones.push({ n, x, y, fxy });
            resultado.push([x, y]);

            const xSiguiente = x + h;

            if (!Number.isFinite(xSiguiente) || xSiguiente <= x) {
                throw new ErrorParametros(
                    'ChuspaNumeric.euler: el paso h no permite avanzar numéricamente.'
                );
            }

            if (xSiguiente > xFinal + 1e-10) {
                break;
            }

            const ySiguiente = y + h * fxy;

            if (!Number.isFinite(ySiguiente)) {
                throw new ErrorParametros(
                    `ChuspaNumeric.euler: resultado no finito en la iteración ${n}.`
                );
            }

            x = xSiguiente;
            y = ySiguiente;
            n++;
        }

        return { resultado, iteraciones };
    });

    return crearResultado({
        resultado: valor.resultado,
        iteraciones: valor.iteraciones,
        convergio: true,
        mensaje: `Método de Euler completado con ${valor.iteraciones.length} iteraciones.`,
        meta: {
            metodo: 'Euler',
            parametros: { x0, y0, h, xFinal },
            tiempo_ms,
        },
    });
}
