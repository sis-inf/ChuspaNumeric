import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia,
} from "../core/errores.js";

const METODO = "secante";

/**
 * Valida un número finito.
 * @param {*} valor
 * @param {string} nombre
 * @throws {ErrorParametros}
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito; se recibió ${String(valor)} (${typeof valor}).`
    );
  }
}

/**
 * Valida que f sea una función.
 * @param {*} f
 * @throws {ErrorParametros}
 */
function validarFuncionObjetivo(f) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'f' debe ser una función; se recibió ${typeof f}.`
    );
  }
}

/**
 * Valida que la tolerancia sea un número finito estrictamente positivo.
 * @param {*} tolerancia
 * @throws {ErrorParametros}
 */
function validarToleranciaLocal(tolerancia) {
  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser mayor que 0; se recibió ${tolerancia}.`
    );
  }
}

/**
 * Valida que maxIter sea un entero positivo.
 * @param {*} maxIter
 * @throws {ErrorParametros}
 */
function validarMaxIter(maxIter) {
  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor o igual a 1; se recibió ${String(maxIter)}.`
    );
  }
}

/**
 * Verifica la finitud del resultado y arma el resultado estructurado.
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 */
function finalizar({
  resultado,
  iteraciones,
  convergio,
  mensaje,
  parametros,
  tiempo_ms,
}) {
  if (!Number.isFinite(resultado)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el resultado no es finito (${String(resultado)}); el método divergió.`
    );
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio,
    mensaje,
    meta: {
      metodo: METODO,
      parametros,
      tiempo_ms,
    },
  });
}

/**
 * Encuentra una raíz mediante el método de la secante.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f Función objetivo.
 * @param {number} opciones.x0 Primera aproximación inicial (finita).
 * @param {number} opciones.x1 Segunda aproximación inicial (finita).
 * @param {number} [opciones.tolerancia=1e-6] Tolerancia (> 0).
 * @param {number} [opciones.maxIter=100] Máximo de iteraciones (entero >= 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si opciones no es un objeto o algún parámetro es inválido.
 * @throws {ErrorDominio} Si el denominador se anula (división por cero).
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 */
function secante(opciones) {
  if (
    opciones === null ||
    typeof opciones !== "object" ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, x0, x1, tolerancia, maxIter }; se recibió ${opciones === null ? "null" : Array.isArray(opciones) ? "array" : typeof opciones}.`
    );
  }

  const { f, x0, x1, tolerancia = 1e-6, maxIter = 100 } = opciones;

  validarFuncionObjetivo(f);
  validarNumeroFinito(x0, "x0");
  validarNumeroFinito(x1, "x1");
  validarToleranciaLocal(tolerancia);
  validarMaxIter(maxIter);

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
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
          `ChuspaNumeric.${METODO}: división por cero en la iteración ${n}.`
        );
      }

      const xNuevo = xActual - (fxActual * (xActual - xPrev)) / denominador;

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

    return {
      resultado: xActual,
      iteraciones,
      convergio,
      mensaje: convergio
        ? "Método convergió correctamente."
        : "Se alcanzó el máximo de iteraciones sin converger.",
    };
  });

  return finalizar({
    ...calculo,
    parametros: { x0, x1, tolerancia, maxIter },
    tiempo_ms,
  });
}

export { secante };
