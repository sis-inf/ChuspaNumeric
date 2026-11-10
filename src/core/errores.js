/**
 * Error para parámetros inválidos en la entrada.
 * @example throw new ErrorParametros("El intervalo [a, b] no contiene una raíz.");
 */
export class ErrorParametros extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorParametros";
  }
}

/**
 * Error cuando un método no converge en las iteraciones permitidas.
 * @example throw new ErrorConvergencia("Se alcanzó el máximo de iteraciones sin converger.");
 */
export class ErrorConvergencia extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorConvergencia";
  }
}

/**
 * Error cuando una operación no está definida (división por cero, raíz negativa, etc.).
 * @example throw new ErrorDominio("División por cero detectada en el pivote.");
 */
export class ErrorDominio extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDominio";
  }
}

/**
 * Error cuando las dimensiones de matrices o vectores no coinciden.
 * @example throw new ErrorTamano("La matriz A debe ser n×n y el vector b de tamaño n.");
 */
export class ErrorTamano extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorTamano";
  }
}

/**
 * Error cuando un método iterativo excede el tiempo máximo de ejecución configurado.
 * @example throw new ErrorTimeout("Bisección excedió el timeout de 500ms después de 42 iteraciones.");
 */
export class ErrorTimeout extends Error {
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
 * @example throw new ErrorDivergencia("Newton-Raphson divergió: x se volvió NaN en la iteración 5.");
 */
export class ErrorDivergencia extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorDivergencia";
  }
}

/**
 * Clase base de los errores numéricos del proyecto.
 * Permite capturar con un solo instanceof los errores específicos de los métodos numéricos.
 *
 * @example
 * try {
 *   resolver(A, b);
 * } catch (error) {
 *   if (error instanceof ErrorNumerico) console.error(error.message);
 * }
 */
export class ErrorNumerico extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ErrorNumerico";
  }
}

const MENSAJE_NO_CONVERGENCIA = "ChuspaNumeric: el método no convergió dentro del número máximo de iteraciones permitido.";

/**
 * Error cuando un método iterativo no converge dentro de las iteraciones permitidas.
 * Puede lanzarse sin argumentos: usa un mensaje por defecto descriptivo.
 *
 * @example throw new ErrorNoConvergencia();
 * @example throw new ErrorNoConvergencia("Newton-Raphson no convergió en 50 iteraciones.");
 */
export class ErrorNoConvergencia extends ErrorNumerico {
  constructor(mensaje = MENSAJE_NO_CONVERGENCIA) {
    super(mensaje);
    this.name = "ErrorNoConvergencia";
  }
}

const MENSAJE_MATRIZ_SINGULAR = "ChuspaNumeric: la matriz es singular (su determinante es cero) y no se puede resolver ni invertir.";

/**
 * Error cuando una matriz es singular y no se puede resolver el sistema
 * ni calcular su inversa.
 * Puede lanzarse sin argumentos: usa un mensaje por defecto descriptivo.
 *
 * @example throw new ErrorMatrizSingular();
 * @example throw new ErrorMatrizSingular("La matriz A es singular: pivote nulo en la columna 2.");
 */
export class ErrorMatrizSingular extends ErrorNumerico {
  constructor(mensaje = MENSAJE_MATRIZ_SINGULAR) {
    super(mensaje);
    this.name = "ErrorMatrizSingular";
  }
}
