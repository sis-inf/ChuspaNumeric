/**
 * Contrato de resultado de ChuspaNumeric: la forma común del objeto que devuelven
 * los métodos numéricos y una utilidad para medir el tiempo de cálculo.
 *
 * Es un módulo ES (el paquete declara "type": "module") y solo tiene exportaciones
 * con nombre. No usa `module.exports`: en un módulo ES no existe.
 *
 * @module core/contrato
 * @example
 * // ESM
 * import { crearResultado, medirTiempo } from "./core/contrato.js";
 * @example
 * // CommonJS: un módulo ES se carga con import() dinámico
 * const { crearResultado, medirTiempo } = await import("./core/contrato.js");
 */

/**
 * Metadatos del cálculo, ya normalizados por crearResultado.
 *
 * @typedef {Object} MetaResultado
 * @property {string} metodo - Nombre del método numérico. Por defecto "".
 * @property {Object} parametros - Parámetros con los que se llamó al método. Por defecto {}.
 * @property {number} tiempo_ms - Tiempo de cálculo en milisegundos. Por defecto 0.
 */

/**
 * Objeto de resultado uniforme que devuelve crearResultado.
 *
 * @typedef {Object} Resultado
 * @property {number|Array|Object|null} resultado - Valor calculado por el método: un número, un array, un objeto con varios valores (por ejemplo { x, L, U }) o null si no hay resultado.
 * @property {Array} iteraciones - Detalle de cada iteración.
 * @property {boolean} convergio - Indica si el método convergió.
 * @property {string} mensaje - Mensaje descriptivo del resultado.
 * @property {MetaResultado} meta - Metadatos del cálculo.
 * @property {string[]} [warnings] - Solo está presente si se recibió al menos una advertencia.
 * @property {number} [tiempoMs] - Solo está presente si se recibió.
 * @property {number} [toleranciaFinal] - Solo está presente si se recibió.
 */

/**
 * Crea un objeto de resultado uniforme para los métodos numéricos de ChuspaNumeric.
 *
 * @param {Object} opciones - Datos del resultado.
 * @param {number|Array|Object|null} opciones.resultado - Valor calculado por el método: un número, un array, un objeto con varios valores (por ejemplo { x, L, U }) o null si no hay resultado.
 * @param {Array}   [opciones.iteraciones=[]] - Detalle de cada iteración.
 * @param {boolean} [opciones.convergio=false] - Indica si el método convergió.
 * @param {string}  [opciones.mensaje=""] - Mensaje descriptivo del resultado.
 * @param {Object}  [opciones.meta={}] - Metadatos del cálculo; los campos que falten toman su valor por defecto.
 * @param {string}  [opciones.meta.metodo=""] - Nombre del método numérico.
 * @param {Object}  [opciones.meta.parametros={}] - Parámetros con los que se llamó al método.
 * @param {number}  [opciones.meta.tiempo_ms=0] - Tiempo de cálculo en milisegundos.
 * @param {string[]} [opciones.warnings=[]] - Advertencias no bloqueantes sobre situaciones límite.
 * @param {number} [opciones.tiempoMs] - Tiempo de cálculo transcurrido en milisegundos. Solo se incluye si se recibe.
 * @param {number} [opciones.toleranciaFinal] - Tolerancia final alcanzada por el método. Solo se incluye si se recibe.
 * @returns {Resultado} Objeto de resultado con la forma común del contrato.
 *
 * @example
 * const r = crearResultado({ resultado: 1.5, convergio: true, meta: { metodo: "biseccion" } });
 * // r.meta → { metodo: "biseccion", parametros: {}, tiempo_ms: 0 }
 */
function crearResultado({
  resultado,
  iteraciones = [],
  convergio = false,
  mensaje = "",
  meta = {},
  warnings = [],
  tiempoMs,
  toleranciaFinal,
}) {
  const resultadoBase = {
    resultado,
    iteraciones,
    convergio,
    mensaje,
    meta: {
      metodo:     meta.metodo     ?? "",
      parametros: meta.parametros ?? {},
      tiempo_ms:  meta.tiempo_ms  ?? 0,
    },
  };

  if (warnings.length > 0) {
    resultadoBase.warnings = warnings;
  }

  if (tiempoMs !== undefined) {
    resultadoBase.tiempoMs = tiempoMs;
  }

  if (toleranciaFinal !== undefined) {
    resultadoBase.toleranciaFinal = toleranciaFinal;
  }

  return resultadoBase;
}
 
/**
 * Ejecuta una función y mide su tiempo de ejecución en milisegundos.
 *
 * @param {Function} fn - Función a ejecutar. Se llama una sola vez y sin argumentos.
 * @returns {{ valor: *, tiempo_ms: number }} El valor devuelto por fn y el tiempo que tardó en milisegundos.
 * @throws {TypeError} Si fn no es una función.
 *
 * @example
 * const { valor, tiempo_ms } = medirTiempo(() => biseccion({ f, a: 0, b: 3 }));
 */
function medirTiempo(fn) {
  if (typeof fn !== "function") {
    throw new TypeError(
      `ChuspaNumeric.medirTiempo: 'fn' debe ser una función. Se recibió: ${typeof fn}`
    );
  }
 
  const inicio    = performance.now();
  const valor     = fn();
  const tiempo_ms = performance.now() - inicio;
 
  return { valor, tiempo_ms };
}
 
export { crearResultado, medirTiempo };