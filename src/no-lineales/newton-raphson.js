// METODO DE NEWTON-RAPHSON

import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorDominio, ErrorParametros, ErrorTimeout } from "../core/errores.js";
import {
  validarFuncion,
  validarNumero,
  validarTolerancia,
  validarIteraciones,
  verificarDivergencia,
} from "../utils/validaciones.js";

/**
 * Encuentra una raíz mediante el método de Newton-Raphson.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f Función objetivo.
 * @param {Function} opciones.df Derivada de la función.
 * @param {number} opciones.x0 Aproximación inicial.
 * @param {number} [opciones.tolerancia=1e-6]
 * @param {number} [opciones.maxIter=100]
 * @param {number|null} [opciones.timeoutMs=null] - Tiempo máximo de ejecución en milisegundos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorTimeout} Si se excede el tiempo máximo de ejecución configurado.
 * @throws {ErrorDivergencia} Si los valores se vuelven NaN o Infinity durante la iteración.
 */
function newtonRaphson({
  f,
  df,
  x0,
  tolerancia = 1e-6,
  maxIter = 100,
  timeoutMs = null,
}) {
  validarFuncion(f, "f");
  validarFuncion(df, "df");
  validarNumero(x0, "x0");
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  if (timeoutMs !== null) {
    if (typeof timeoutMs !== "number" || !isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new ErrorParametros(
        `ChuspaNumeric.newtonRaphson: 'timeoutMs' debe ser un número finito mayor a cero o null. Se recibió: ${timeoutMs}.`
      );
    }
  }

  const { valor, tiempo_ms } = medirTiempo(() => {
    let x = x0;
    const iteraciones = [];
    let convergio = false;

    const inicio = timeoutMs !== null ? performance.now() : null;
    const INTERVALO_VERIFICACION = 5;

    for (let n = 1; n <= maxIter; n++) {
      if (timeoutMs !== null && (n - 1) % INTERVALO_VERIFICACION === 0) {
        if (performance.now() - inicio > timeoutMs) {
          throw new ErrorTimeout(
            `ChuspaNumeric.newtonRaphson: excedió el timeout de ${timeoutMs}ms después de ${n - 1} iteraciones.`
          );
        }
      }

      const fx = f(x);
      const dfx = df(x);

      if (dfx === 0) {
        throw new ErrorDominio(
          `ChuspaNumeric.newtonRaphson: la derivada es cero en x = ${x}.`
        );
      }

      const siguiente = x - fx / dfx;

      // Verificar divergencia numérica inmediatamente después del cálculo
      verificarDivergencia(siguiente, "newtonRaphson", n);

      const error = Math.abs(siguiente - x);

      iteraciones.push({
        n,
        x,
        fx,
        dfx,
        error,
      });

      if (error < tolerancia) {
        convergio = true;
        x = siguiente;
        break;
      }

      x = siguiente;
    }

    return {
      resultado: x,
      iteraciones,
      convergio,
    };
  });

  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: valor.convergio,
    mensaje: valor.convergio
      ? "Método convergió correctamente."
      : "Se alcanzó el máximo de iteraciones sin converger.",
    meta: {
      metodo: "newton-raphson",
      parametros: {
        x0,
        tolerancia,
        maxIter,
        timeoutMs,
      },
      tiempo_ms,
    },
  });
}

export { newtonRaphson };