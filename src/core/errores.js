/**
 * Clases de error de ChuspaNumeric.
 *
 * Es un módulo ES (el paquete declara "type": "module") y solo tiene exportaciones
 * con nombre, una por clase. No usa `module.exports`: en un módulo ES no existe.
 *
 * @module core/errores
 * @example
 * // ESM
 * import { ErrorParametros } from "./core/errores.js";
 * @example
 * // CommonJS: un módulo ES se carga con import() dinámico
 * const { ErrorParametros } = await import("./core/errores.js");
 */

/**
 * Error para parámetros inválidos en la entrada.
 * @extends Error
 * @property {string} name - Siempre "ErrorParametros".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorParametros("El intervalo [a, b] no contiene una raíz.");
 */
export class ErrorParametros extends Error {
  /**
   * @param {string} [mensaje] - Descripción del parámetro inválido.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorParametros";
  }
}

/**
 * Error cuando un método no converge en las iteraciones permitidas.
 * @extends Error
 * @property {string} name - Siempre "ErrorConvergencia".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorConvergencia("Se alcanzó el máximo de iteraciones sin converger.");
 */
export class ErrorConvergencia extends Error {
  /**
   * @param {string} [mensaje] - Descripción de la falta de convergencia.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorConvergencia";
  }
}

/**
 * Error cuando una operación no está definida (división por cero, raíz negativa, etc.).
 * @extends Error
 * @property {string} name - Siempre "ErrorDominio".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorDominio("División por cero detectada en el pivote.");
 */
export class ErrorDominio extends Error {
  /**
   * @param {string} [mensaje] - Descripción de la operación no definida.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDominio";
  }
}

/**
 * Error cuando las dimensiones de matrices o vectores no coinciden.
 * @extends Error
 * @property {string} name - Siempre "ErrorTamano".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorTamano("La matriz A debe ser n×n y el vector b de tamaño n.");
 */
export class ErrorTamano extends Error {
  /**
   * @param {string} [mensaje] - Descripción de las dimensiones que no coinciden.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorTamano";
  }
}

/**
 * Error cuando un método iterativo excede el tiempo máximo de ejecución configurado.
 * @extends Error
 * @property {string} name - Siempre "ErrorTimeout".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorTimeout("Bisección excedió el timeout de 500ms después de 42 iteraciones.");
 */
export class ErrorTimeout extends Error {
  /**
   * @param {string} [mensaje] - Descripción del tiempo excedido.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorTimeout";
  }
}

/**
 * Error cuando un método iterativo produce valores NaN o Infinity,
 * indicando divergencia numérica durante la ejecución.
 *
 * A diferencia de ErrorConvergencia (que indica que se agotaron las iteraciones
 * sin alcanzar la tolerancia), ErrorDivergencia señala que los valores se volvieron
 * no numéricos, lo cual indica que el método no converge para los parámetros dados.
 *
 * @extends Error
 * @property {string} name - Siempre "ErrorDivergencia".
 * @property {string} message - Mensaje recibido en el constructor.
 * @example throw new ErrorDivergencia("Newton-Raphson divergió: x se volvió NaN en la iteración 5.");
 */
export class ErrorDivergencia extends Error {
  /**
   * @param {string} [mensaje] - Descripción de la divergencia detectada.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDivergencia";
  }
}

/**
 * Clase base de los errores numéricos del proyecto.
 * Permite capturar con un solo instanceof los errores específicos de los métodos numéricos.
 *
 * @extends Error
 * @property {string} name - "ErrorNumerico", o el nombre de la subclase.
 * @property {string} message - Mensaje recibido en el constructor.
 * @example
 * try {
 *   resolver(A, b);
 * } catch (error) {
 *   if (error instanceof ErrorNumerico) console.error(error.message);
 * }
 */
export class ErrorNumerico extends Error {
  /**
   * @param {string} [mensaje] - Descripción del error numérico.
   */
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorNumerico";
  }
}

/**
 * Mensaje por defecto de ErrorNoConvergencia.
 * @type {string}
 */
const MENSAJE_NO_CONVERGENCIA = "ChuspaNumeric: el método no convergió dentro del número máximo de iteraciones permitido.";

/**
 * Error cuando un método iterativo no converge dentro de las iteraciones permitidas.
 * Puede lanzarse sin argumentos: usa un mensaje por defecto descriptivo.
 *
 * @extends ErrorNumerico
 * @property {string} name - Siempre "ErrorNoConvergencia".
 * @property {string} message - Mensaje recibido o el mensaje por defecto.
 * @example throw new ErrorNoConvergencia();
 * @example throw new ErrorNoConvergencia("Newton-Raphson no convergió en 50 iteraciones.");
 */
export class ErrorNoConvergencia extends ErrorNumerico {
  /**
   * @param {string} [mensaje] - Descripción del error; si se omite, se usa el mensaje por defecto.
   */
  constructor(mensaje = MENSAJE_NO_CONVERGENCIA) {
    super(mensaje);
    this.name = "ErrorNoConvergencia";
  }
}

/**
 * Mensaje por defecto de ErrorMatrizSingular.
 * @type {string}
 */
const MENSAJE_MATRIZ_SINGULAR = "ChuspaNumeric: la matriz es singular (su determinante es cero) y no se puede resolver ni invertir.";

/**
 * Error cuando una matriz es singular y no se puede resolver el sistema
 * ni calcular su inversa.
 * Puede lanzarse sin argumentos: usa un mensaje por defecto descriptivo.
 *
 * @extends ErrorNumerico
 * @property {string} name - Siempre "ErrorMatrizSingular".
 * @property {string} message - Mensaje recibido o el mensaje por defecto.
 * @example throw new ErrorMatrizSingular();
 * @example throw new ErrorMatrizSingular("La matriz A es singular: pivote nulo en la columna 2.");
 */
export class ErrorMatrizSingular extends ErrorNumerico {
  /**
   * @param {string} [mensaje] - Descripción del error; si se omite, se usa el mensaje por defecto.
   */
  constructor(mensaje = MENSAJE_MATRIZ_SINGULAR) {
    super(mensaje);
    this.name = "ErrorMatrizSingular";
  }
}
