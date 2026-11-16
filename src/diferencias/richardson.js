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
 * Valida el paso utilizado en cada refinamiento.
 */
function validarPaso(x, paso, iteracion) {
  validarNumero(paso, 'h');

  if (paso === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.derivadaRichardson: el paso h es cero en la iteración ${iteracion}.`
    );
  }

  const denominador = 2 * paso;
  const xMasPaso = x + paso;
  const xMenosPaso = x - paso;

  if (
    !Number.isFinite(denominador) ||
    denominador === 0 ||
    !Number.isFinite(xMasPaso) ||
    !Number.isFinite(xMenosPaso)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.derivadaRichardson: paso o puntos de evaluación no válidos en la iteración ${iteracion}.`
    );
  }
}

/**
 * Obtiene el valor numérico de la diferencia centrada.
 * Admite tanto el retorno numérico anterior como el resultado estructurado.
 */
function obtenerValorCentrado(resultadoCentrado, paso) {
  const valor =
    typeof resultadoCentrado === 'number'
      ? resultadoCentrado
      : resultadoCentrado !== null &&
          typeof resultadoCentrado === 'object'
        ? resultadoCentrado.resultado
        : undefined;

  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.derivadaRichardson: la diferencia centrada devolvió un resultado no válido para h=${paso}.`
    );
  }

  return valor;
}

/**
 * Calcula la diferencia centrada y obtiene su valor numérico.
 */
function calcularDiferenciaCentrada(f, x, paso, iteracion) {
  validarPaso(x, paso, iteracion);

  const resultado = diferenciaCentrada(f, x, paso);

  return obtenerValorCentrado(resultado, paso);
}

/**
 * Estima la primera derivada de f en x con extrapolación de Richardson.
 *
 * Fórmula:
 * R(h) = (4 · D(h / 2) - D(h)) / 3
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {Function} params.f - Función a derivar.
 * @param {number} params.x - Punto donde se estima la derivada.
 * @param {number} [params.h=0.1] - Paso inicial.
 * @param {number} [params.tolerancia=1e-8] - Diferencia máxima entre estimaciones.
 * @param {number} [params.maxIter=10] - Número máximo de refinamientos.
 * @returns {Object} Resultado estructurado de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros o resultados no son válidos.
 */
function derivadaRichardson(params = {}) {
  if (
    params === null ||
    typeof params !== 'object' ||
    Array.isArray(params)
  ) {
    throw new ErrorParametros(
      'ChuspaNumeric.derivadaRichardson: los parámetros deben proporcionarse mediante un objeto.'
    );
  }

  const {
    f,
    x,
    h = 0.1,
    tolerancia = 1e-8,
    maxIter = 10,
  } = params;

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
  validarPaso(x, h, 0);

  const { valor, tiempo_ms } = medirTiempo(() => {
    const iteraciones = [];
    let paso = h;

    let centradaAnterior = calcularDiferenciaCentrada(
      f,
      x,
      paso,
      0
    );

    let estimacion = centradaAnterior;
    let convergio = false;

    for (let i = 1; i <= maxIter && !convergio; i++) {
      paso /= 2;

      const centrada = calcularDiferenciaCentrada(
        f,
        x,
        paso,
        i
      );

      const extrapolada = (4 * centrada - centradaAnterior) / 3;

      if (!Number.isFinite(extrapolada)) {
        throw new ErrorParametros(
          `ChuspaNumeric.derivadaRichardson: resultado extrapolado no finito en la iteración ${i}.`
        );
      }

      const error = Math.abs(extrapolada - estimacion);

      if (!Number.isFinite(error)) {
        throw new ErrorParametros(
          `ChuspaNumeric.derivadaRichardson: error de aproximación no finito en la iteración ${i}.`
        );
      }

      iteraciones.push({
        i,
        h: paso,
        centrada,
        extrapolada,
        error,
      });

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
