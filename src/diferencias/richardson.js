/**
 * @fileoverview Primera derivada por diferencias centradas con extrapolación
 * de Richardson. Combina estimaciones con pasos h y h/2 para cancelar el
 * término de error O(h²) de la fórmula centrada.
 */

import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { diferenciaCentrada } from './diferencia_centrada.js';
import {
  validarFuncion,
  validarIteraciones,
  validarNumero,
  validarTolerancia,
} from '../utils/validaciones.js';

/**
 * Estima la primera derivada de f en x con extrapolación de Richardson.
 *
 * Fórmula, con D(h) la diferencia centrada de paso h:
 * R(h) = (4 · D(h / 2) − D(h)) / 3
 *
 * En cada refinamiento el paso se reduce a la mitad, hasta que dos
 * estimaciones consecutivas difieren menos que la tolerancia o se alcanza maxIter.
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {Function} params.f - Función a derivar.
 * @param {number} params.x - Punto donde se estima la derivada.
 * @param {number} [params.h=0.1] - Paso inicial, finito y distinto de cero.
 * @param {number} [params.tolerancia=1e-8] - Diferencia máxima entre estimaciones.
 * @param {number} [params.maxIter=10] - Número máximo de refinamientos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 *
 * @example
 * const res = derivadaRichardson({ f: Math.sin, x: 0 });
 * console.log(res.resultado); // ≈ 1
 */
function derivadaRichardson({
  f,
  x,
  h = 0.1,
  tolerancia = 1e-8,
  maxIter = 10,
}) {
  validarFuncion(f, 'f');
  validarNumero(x, 'x');
  validarNumero(h, 'h');
  if (h === 0) {
    throw new ErrorParametros(
      "ChuspaNumeric.derivadaRichardson: 'h' debe ser distinto de cero."
    );
  }
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  const { valor, tiempo_ms } = medirTiempo(() => {
    const iteraciones = [];
    let paso = h;
    let centradaAnterior = diferenciaCentrada(f, x, paso);
    let estimacion = centradaAnterior;
    let convergio = false;

    for (let i = 1; i <= maxIter && !convergio; i++) {
      paso /= 2;
      const centrada = diferenciaCentrada(f, x, paso);
      const extrapolada = (4 * centrada - centradaAnterior) / 3;
      const error = Math.abs(extrapolada - estimacion);

      iteraciones.push({ i, h: paso, centrada, extrapolada, error });
      estimacion = extrapolada;
      centradaAnterior = centrada;
      convergio = error < tolerancia;
    }

    return { estimacion, iteraciones, convergio };
  });

  return crearResultado({
    resultado: valor.estimacion,
    iteraciones: valor.iteraciones,
    convergio: valor.convergio,
    mensaje: valor.convergio
      ? `Derivada por Richardson: convergió en ${valor.iteraciones.length} refinamientos (tolerancia ${tolerancia}).`
      : `Derivada por Richardson: no alcanzó la tolerancia ${tolerancia} tras ${maxIter} refinamientos.`,
    meta: {
      metodo: 'derivadaRichardson',
      parametros: { f, x, h, tolerancia, maxIter },
      tiempo_ms,
    },
  });
}

export { derivadaRichardson };
