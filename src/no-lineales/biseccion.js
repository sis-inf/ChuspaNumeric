import { crearResultado } from "../core/contrato.js";
import { ErrorParametros, ErrorTimeout } from "../core/errores.js";
import {
  validarFuncion,
  validarIntervalo,
  validarTolerancia,
  validarIteraciones,
} from "../utils/validaciones.js";

/**
 * Encuentra una raíz de f(x) = 0 en [a, b] usando el Método de Bisección.
 *
 * @param {Object} parametros - Parámetros de entrada del método.
 * @param {Function} parametros.f - Función continua a evaluar. Debe recibir un número y devolver un número.
 * @param {number} parametros.a - Extremo izquierdo del intervalo inicial.
 * @param {number} parametros.b - Extremo derecho del intervalo inicial.
 * @param {number} [parametros.tolerancia=1e-6] - Criterio de parada basado en el error absoluto.
 * @param {number} [parametros.maxIter=100] - Número máximo de iteraciones permitidas.
 * @param {number|null} [parametros.timeoutMs=null] - Tiempo máximo de ejecución en milisegundos.
 * @returns {{
 *   resultado: number,
 *   iteraciones: Array<{
 *     n: number,
 *     a: number,
 *     b: number,
 *     c: number,
 *     fa: number,
 *     fb: number,
 *     fc: number,
 *     error: number
 *   }>,
 *   convergio: boolean,
 *   mensaje: string,
 *   meta: {
 *     metodo: string,
 *     parametros: {
 *       a: number,
 *       b: number,
 *       tolerancia: number,
 *       maxIter: number,
 *       timeoutMs: number|null
 *     },
 *     tiempo_ms: number
 *   }
 * }} Objeto de resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si la función no es válida, el intervalo es inválido, la tolerancia o el máximo de iteraciones no son válidos, o si f(a) · f(b) >= 0.
 * @throws {ErrorTimeout} Si se excede el tiempo máximo de ejecución configurado.
 */
function biseccion({ f, a, b, tolerancia = 1e-6, maxIter = 100, timeoutMs = null }) {
  validarFuncion(f, "f");
  validarIntervalo(a, b);
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  if (timeoutMs !== null) {
    if (typeof timeoutMs !== "number" || !isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new ErrorParametros(
        `ChuspaNumeric.biseccion: 'timeoutMs' debe ser un número finito mayor a cero o null. Se recibió: ${timeoutMs}.`
      );
    }
  }

  if (f(a) * f(b) >= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.biseccion: f(a) · f(b) >= 0. ` +
      `f(${a}) = ${f(a)}, f(${b}) = ${f(b)}. ` +
      `El intervalo [a, b] debe contener un cambio de signo.`
    );
  }

  let izq = a;
  let der = b;
  let c = izq;
  const iteraciones = [];
  let convergio = false;

  const inicio = timeoutMs !== null ? performance.now() : null;
  const INTERVALO_VERIFICACION = 10;

  for (let n = 0; n < maxIter; n++) {
    if (timeoutMs !== null && n % INTERVALO_VERIFICACION === 0) {
      if (performance.now() - inicio > timeoutMs) {
        throw new ErrorTimeout(
          `ChuspaNumeric.biseccion: excedió el timeout de ${timeoutMs}ms después de ${n} iteraciones.`
        );
      }
    }

    c = (izq + der) / 2;

    const fa = f(izq);
    const fb = f(der);
    const fc = f(c);
    const error = Math.abs(der - izq) / 2;

    iteraciones.push({ n: n + 1, a: izq, b: der, c, fa, fb, fc, error });

    if (error < tolerancia) {
      convergio = true;
      break;
    }

    if (fa * fc < 0) {
      der = c;
    } else {
      izq = c;
    }
  }

  return crearResultado({
    resultado: c,
    iteraciones,
    convergio,
    mensaje: convergio
      ? `Convergió en ${iteraciones.length} iteraciones.`
      : `Se alcanzó el máximo de ${maxIter} iteraciones sin converger.`,
    meta: {
      metodo: "biseccion",
      parametros: { a, b, tolerancia, maxIter, timeoutMs },
      tiempo_ms: 0,
    },
  });
}

export { biseccion };