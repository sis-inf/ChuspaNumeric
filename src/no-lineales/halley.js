// METODO DE HALLEY

import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorDominio } from '../core/errores.js';
import {
  validarFuncion,
  validarNumero,
  validarTolerancia,
  validarIteraciones,
  verificarDivergencia,
} from '../utils/validaciones.js';

/**
 * Encuentra una raíz mediante el método de Halley.
 *
 * Fórmula:
 * xₙ₊₁ = xₙ − 2 · f · f′ / (2 · f′² − f · f″)
 *
 * @param {Object} opciones
 * @param {Function} opciones.f Función objetivo.
 * @param {Function} opciones.df Primera derivada de la función.
 * @param {Function} opciones.d2f Segunda derivada de la función.
 * @param {number} opciones.x0 Aproximación inicial.
 * @param {number} [opciones.tolerancia=1e-6]
 * @param {number} [opciones.maxIter=100]
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 * @throws {ErrorDominio} Si el denominador de la actualización es cero.
 * @throws {ErrorDivergencia} Si f, sus derivadas o la iteración no son finitas.
 */
function halley({ f, df, d2f, x0, tolerancia = 1e-6, maxIter = 100 }) {
  validarFuncion(f, 'f');
  validarFuncion(df, 'df');
  validarFuncion(d2f, 'd2f');
  validarNumero(x0, 'x0');
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  const { valor, tiempo_ms } = medirTiempo(() => {
    let x = x0;
    const iteraciones = [];
    let convergio = false;

    for (let n = 1; n <= maxIter; n++) {
      const fx = f(x);
      const dfx = df(x);
      const d2fx = d2f(x);

      verificarDivergencia(fx, 'halley', n);
      verificarDivergencia(dfx, 'halley', n);
      verificarDivergencia(d2fx, 'halley', n);

      const denominador = 2 * dfx * dfx - fx * d2fx;

      if (denominador === 0) {
        throw new ErrorDominio(
          `ChuspaNumeric.halley: el denominador de la actualización es cero en x = ${x}.`
        );
      }

      const siguiente = x - (2 * fx * dfx) / denominador;

      verificarDivergencia(siguiente, 'halley', n);

      const error = Math.abs(siguiente - x);

      iteraciones.push({ n, x, fx, dfx, d2fx, error });
      x = siguiente;

      if (error < tolerancia) {
        convergio = true;
        break;
      }
    }

    return { resultado: x, iteraciones, convergio };
  });

  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: valor.convergio,
    mensaje: valor.convergio
      ? 'Método convergió correctamente.'
      : 'Se alcanzó el máximo de iteraciones sin converger.',
    meta: {
      metodo: 'halley',
      parametros: { x0, tolerancia, maxIter },
      tiempo_ms,
    },
  });
}

export { halley };
