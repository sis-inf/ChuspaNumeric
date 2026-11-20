import { crearResultado } from '../core/contrato.js';
import { ErrorConvergencia, ErrorParametros } from '../core/errores.js';
import {
  validarFuncion,
  validarNumero,
  validarTolerancia,
  validarIteraciones,
  verificarDivergencia,
} from '../utils/validaciones.js';

/**
 * Encuentra la raíz de una función utilizando el método de punto fijo.
 *
 * @param {Object} params - Parámetros de entrada del método.
 * @param {(x: number) => number} params.g - Función de iteración g(x).
 * @param {number} params.x0 - Aproximación inicial finita.
 * @param {number} [params.tolerancia=1e-6] - Tolerancia finita y positiva.
 * @param {number} [params.maxIter=100] - Número máximo de iteraciones, entero positivo.
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros de entrada no son válidos.
 * @throws {ErrorDivergencia} Si una iteración produce un valor que no es un número finito.
 * @throws {ErrorConvergencia} Si se alcanza maxIter sin lograr la convergencia.
 */
export function puntoFijo(params) {
  if (params === null || typeof params !== 'object' || Array.isArray(params)) {
    throw new ErrorParametros('ChuspaNumeric.puntoFijo: se requiere un objeto de parámetros.');
  }

  const { g, x0, tolerancia = 1e-6, maxIter = 100 } = params;
  validarFuncion(g, 'g');

  // Los validadores interpolan el valor recibido al generar sus mensajes de error.
  for (const [nombre, valor] of Object.entries({ x0, tolerancia, maxIter })) {
    if (typeof valor !== 'number') {
      throw new ErrorParametros(
        `ChuspaNumeric.puntoFijo: '${nombre}' debe ser un número. Se recibió: ${typeof valor}.`,
      );
    }
  }

  validarNumero(x0, 'x0');
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  const iteraciones = [];
  let xActual = x0;

  for (let n = 1; n <= maxIter; n++) {
    const gx = g(xActual);
    verificarDivergencia(typeof gx === 'number' ? gx : `[tipo ${typeof gx}]`, 'puntoFijo', n);

    const error = Math.abs(gx - xActual);
    verificarDivergencia(error, 'puntoFijo', n);

    iteraciones.push({
      n,
      x: xActual,
      gx,
      error,
    });

    if (error < tolerancia) {
      return crearResultado({
        resultado: gx,
        iteraciones,
        convergio: true,
        mensaje: 'El método de punto fijo convergió con éxito.',
        meta: {
          metodo: 'Punto Fijo',
          parametros: { x0, tolerancia, maxIter },
        },
      });
    }

    // El resultado evaluado pasa a ser el x del siguiente turno
    xActual = gx;
  }

  throw new ErrorConvergencia(
    `Se alcanzó el máximo de iteraciones (${maxIter}) sin lograr la convergencia.`,
  );
}
