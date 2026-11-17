import { crearResultado } from "../core/contrato.js";
import { ErrorDominio } from "../core/errores.js";
import {
  validarFuncion,
  validarNumero,
  validarTolerancia,
  validarIteraciones,
} from "../utils/validaciones.js";

/**
 * Encuentra una raíz mediante el método de la secante.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f Función objetivo.
 * @param {number} opciones.x0 Primera aproximación inicial.
 * @param {number} opciones.x1 Segunda aproximación inicial.
 * @param {number} [opciones.tolerancia=1e-6]
 * @param {number} [opciones.maxIter=100]
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 */
function secante({
  f,
  x0,
  x1,
  tolerancia = 1e-6,
  maxIter = 100,
}) {
  validarFuncion(f, "f");
  validarNumero(x0, "x0");
  validarNumero(x1, "x1");
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  let xPrev = x0;
  let xActual = x1;

  const iteraciones = [];
  let convergio = false;

  for (let n = 1; n <= maxIter; n++) {
    const fxPrev = f(xPrev);
    const fxActual = f(xActual);

    const denominador = fxActual - fxPrev;

    if (denominador === 0) {
      throw new ErrorDominio(
        `ChuspaNumeric.secante: división por cero en la iteración ${n}.`
      );
    }

    const xNuevo =
      xActual -
      (fxActual * (xActual - xPrev)) / denominador;

    const error = Math.abs(xNuevo - xActual);

    iteraciones.push({
      n,
      xPrev,
      xActual,
      xNuevo,
      fxPrev,
      fxActual,
      error,
    });

    if (error < tolerancia) {
      convergio = true;
      xActual = xNuevo;
      break;
    }

    xPrev = xActual;
    xActual = xNuevo;
  }

  return crearResultado({
    resultado: xActual,
    iteraciones,
    convergio,
    mensaje: convergio
      ? "Método convergió correctamente."
      : "Se alcanzó el máximo de iteraciones sin converger.",
    meta: {
      metodo: "secante",
      parametros: {
        x0,
        x1,
        tolerancia,
        maxIter,
      },
      tiempo_ms: 0,
    },
  });
}

export { secante };