import { crearResultado } from '../core/contrato.js';
import { ErrorConvergencia } from '../core/errores.js';

/**
 * Encuentra la raíz de una función utilizando el método de punto fijo.
 *
 * @param {Object} params
 * @param {Function} params.g - Función de iteración g(x)
 * @param {number} params.x0 - Aproximación inicial
 * @param {number} params.tolerancia - Criterio de parada para la precisión (por defecto 1e-6)
 * @param {number} params.maxIter - Número máximo de iteraciones permitidas (por defecto 100)
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric
 * @throws {ErrorConvergencia} Si se alcanza maxIter sin lograr la convergencia
 */
export function puntoFijo({ g, x0, tolerancia = 1e-6, maxIter = 100 }) {
    const iteraciones = [];
    let xActual = x0;

    for (let n = 1; n <= maxIter; n++) {
        const gx = g(xActual);
        const error = Math.abs(gx - xActual);

        iteraciones.push({
            n,
            x: xActual,
            gx,
            error
        });

        if (error < tolerancia) {
            return crearResultado({
                resultado: gx,
                iteraciones,
                convergio: true,
                mensaje: "El método de punto fijo convergió con éxito.",
                meta: {
                    metodo: "Punto Fijo",
                    parametros: { x0, tolerancia, maxIter }
                }
            });
        }

        // El resultado evaluado pasa a ser el x del siguiente turno
        xActual = gx;
    }

    throw new ErrorConvergencia(`Se alcanzó el máximo de iteraciones (${maxIter}) sin lograr la convergencia.`);
}