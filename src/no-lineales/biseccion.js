import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros, ErrorTimeout, ErrorDivergencia } from "../core/errores.js";

const METODO = "biseccion";

/**
 * Valida que un valor sea un número finito.
 * @param {*} valor - Valor a validar.
 * @param {string} nombre - Nombre del parámetro (para el mensaje).
 * @throws {ErrorParametros} Si no es un número finito.
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito. Se recibió: ${String(valor)} (${typeof valor}).`
    );
  }
}

/**
 * Valida todos los parámetros de entrada de la bisección.
 * @throws {ErrorParametros} Si algún parámetro es inválido.
 */
function validarEntrada({ f, a, b, tolerancia, maxIter, timeoutMs }) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'f' debe ser una función. Se recibió: ${typeof f}.`
    );
  }

  validarNumeroFinito(a, "a");
  validarNumeroFinito(b, "b");
  if (a >= b) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: el intervalo es inválido, se requiere a < b. Se recibió: a = ${a}, b = ${b}.`
    );
  }

  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser mayor a cero. Se recibió: ${tolerancia}.`
    );
  }

  validarNumeroFinito(maxIter, "maxIter");
  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor o igual a 1. Se recibió: ${maxIter}.`
    );
  }

  if (timeoutMs !== null) {
    if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
      throw new ErrorParametros(
        `ChuspaNumeric.${METODO}: 'timeoutMs' debe ser un número finito mayor a cero o null. Se recibió: ${String(timeoutMs)}.`
      );
    }
  }
}

/**
 * Verifica la finitud del resultado y arma el resultado estructurado.
 * @throws {ErrorDivergencia} Si la raíz calculada no es finita.
 */
function finalizar({ c, iteraciones, convergio, maxIter, parametros, tiempo_ms }) {
  if (!Number.isFinite(c)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el resultado no es finito. Se obtuvo: ${c}.`
    );
  }

  return crearResultado({
    resultado: c,
    iteraciones,
    convergio,
    mensaje: convergio
      ? `Convergió en ${iteraciones.length} iteraciones.`
      : `Se alcanzó el máximo de ${maxIter} iteraciones sin converger.`,
    meta: {
      metodo: METODO,
      parametros,
      tiempo_ms,
    },
  });
}

/**
 * Encuentra una raíz de f(x) = 0 en [a, b] usando el Método de Bisección.
 *
 * @param {Object} opciones - Parámetros de entrada del método.
 * @param {Function} opciones.f - Función continua a evaluar. Debe recibir un número y devolver un número.
 * @param {number} opciones.a - Extremo izquierdo del intervalo inicial (finito, a < b).
 * @param {number} opciones.b - Extremo derecho del intervalo inicial (finito).
 * @param {number} [opciones.tolerancia=1e-6] - Criterio de parada basado en el error absoluto (> 0).
 * @param {number} [opciones.maxIter=100] - Número máximo de iteraciones permitidas (entero >= 1).
 * @param {number|null} [opciones.timeoutMs=null] - Tiempo máximo de ejecución en milisegundos.
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
 * @throws {ErrorParametros} Si `opciones` no es un objeto, si f no es función, si el intervalo,
 * la tolerancia, maxIter o timeoutMs no son válidos, si f(a) o f(b) no son finitos, o si f(a) · f(b) >= 0.
 * @throws {ErrorTimeout} Si se excede el tiempo máximo de ejecución configurado.
 * @throws {ErrorDivergencia} Si el resultado calculado no es finito.
 */
function biseccion(opciones) {
  if (opciones === null || typeof opciones !== "object" || Array.isArray(opciones)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, a, b, tolerancia, maxIter, timeoutMs }. Se recibió: ${
        opciones === null ? "null" : Array.isArray(opciones) ? "array" : typeof opciones
      }.`
    );
  }

  const { f, a, b, tolerancia = 1e-6, maxIter = 100, timeoutMs = null } = opciones;

  validarEntrada({ f, a, b, tolerancia, maxIter, timeoutMs });

  const fa0 = f(a);
  const fb0 = f(b);
  if (typeof fa0 !== "number" || !Number.isFinite(fa0) || typeof fb0 !== "number" || !Number.isFinite(fb0)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: f debe devolver números finitos en los extremos. f(${a}) = ${fa0}, f(${b}) = ${fb0}.`
    );
  }
  if (fa0 * fb0 >= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: f(a) · f(b) >= 0. ` +
        `f(${a}) = ${fa0}, f(${b}) = ${fb0}. ` +
        `El intervalo [a, b] debe contener un cambio de signo.`
    );
  }

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
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
            `ChuspaNumeric.${METODO}: excedió el timeout de ${timeoutMs}ms después de ${n} iteraciones.`
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

    return { c, iteraciones, convergio };
  });

  return finalizar({
    ...calculo,
    maxIter,
    parametros: { a, b, tolerancia, maxIter, timeoutMs },
    tiempo_ms,
  });
}

export { biseccion };
