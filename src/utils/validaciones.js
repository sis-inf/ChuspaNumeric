/**
 ErrorParametros cuando la validación falla:
 */

import { ErrorParametros } from "../core/errores.js";
import { ErrorDivergencia } from "../core/errores.js";

/**
 * Verifica que un valor sea un número finito.
 *
 * @param {*}      valor  - Valor a verificar.
 * @param {string} nombre - Nombre del parámetro (para el mensaje de error).
 * @throws {ErrorParametros} Si el valor no es un número finito.
 *
 * @example
 * validarNumero(3.14, "x");     // OK
 * validarNumero("hola", "x");   // lanza ErrorParametros
 * validarNumero(Infinity, "x"); // lanza ErrorParametros
 * validarNumero(NaN, "x");      // lanza ErrorParametros
 */
function validarNumero(valor, nombre) {
  if (typeof valor !== "number" || !isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric: '${nombre}' debe ser un número finito. Se recibió: ${valor} (${typeof valor}).`
    );
  }
}

/**
 * Verifica que un valor sea de tipo function.
 *
 * @param {*}      fn     - Valor a verificar.
 * @param {string} nombre - Nombre del parámetro (para el mensaje de error).
 * @throws {ErrorParametros} Si el valor no es una función.
 *
 * @example
 * validarFuncion((x) => x * 2, "f");  // OK
 * validarFuncion(42, "f");             // lanza ErrorParametros
 */
function validarFuncion(fn, nombre) {
  if (typeof fn !== "function") {
    throw new ErrorParametros(
      `ChuspaNumeric: '${nombre}' debe ser una función. Se recibió: ${typeof fn}.`
    );
  }
}

/**
 * Verifica que una tolerancia sea un número finito mayor a cero.
 *
 * @param {*} tol - Valor de tolerancia a verificar.
 * @throws {ErrorParametros} Si tol no es un número finito o no es mayor a cero.
 *
 * @example
 * validarTolerancia(1e-6);   // OK
 * validarTolerancia(0);      // lanza ErrorParametros
 * validarTolerancia(-0.001); // lanza ErrorParametros
 */
function validarTolerancia(tol) {
  if (typeof tol !== "number" || !isFinite(tol) || tol <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric: 'tolerancia' debe ser un número finito mayor a cero. Se recibió: ${tol}.`
    );
  }
}

/**
 * Verifica que maxIter sea un entero mayor a cero.
 *
 * @param {*} maxIter - Valor del número máximo de iteraciones a verificar.
 * @throws {ErrorParametros} Si maxIter no es un entero mayor a cero.
 *
 * @example
 * validarIteraciones(100);   // OK
 * validarIteraciones(0);     // lanza ErrorParametros
 * validarIteraciones(1.5);   // lanza ErrorParametros
 * validarIteraciones(-10);   // lanza ErrorParametros
 */
function validarIteraciones(maxIter) {
  if (
    typeof maxIter !== "number" ||
    !Number.isInteger(maxIter) ||
    maxIter <= 0
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric: 'maxIter' debe ser un entero mayor a cero. Se recibió: ${maxIter}.`
    );
  }
}

/**
 * Verifica que a y b sean números finitos y que a < b.
 *
 * @param {*} a - Límite inferior del intervalo.
 * @param {*} b - Límite superior del intervalo.
 * @throws {ErrorParametros} Si a o b no son números finitos, o si a >= b.
 *
 * @example
 * validarIntervalo(0, 3);    // OK
 * validarIntervalo(3, 0);    // lanza ErrorParametros
 * validarIntervalo(2, 2);    // lanza ErrorParametros
 * validarIntervalo("a", 3);  // lanza ErrorParametros
 */
function validarIntervalo(a, b) {
  if (typeof a !== "number" || !isFinite(a)) {
    throw new ErrorParametros(
      `ChuspaNumeric: el límite inferior 'a' debe ser un número finito. Se recibió: ${a}.`
    );
  }
  if (typeof b !== "number" || !isFinite(b)) {
    throw new ErrorParametros(
      `ChuspaNumeric: el límite superior 'b' debe ser un número finito. Se recibió: ${b}.`
    );
  }
  if (a >= b) {
    throw new ErrorParametros(
      `ChuspaNumeric: el límite inferior 'a' (${a}) debe ser estrictamente menor que 'b' (${b}).`
    );
  }
}

/**
 * Verifica que una matriz sea un array bidimensional cuadrado de n × n.
 *
 * @param {*} matriz - Valor a verificar.
 * @throws {ErrorParametros} Si el valor no es un array bidimensional cuadrado.
 *
 * @example
 * validarMatrizCuadrada([[1, 2], [3, 4]]);       // OK
 * validarMatrizCuadrada([[1, 2, 3], [4, 5, 6]]); // lanza ErrorParametros (2×3 no es cuadrada)
 * validarMatrizCuadrada([1, 2, 3]);               // lanza ErrorParametros
 */
function validarMatrizCuadrada(matriz) {
  if (!Array.isArray(matriz) || matriz.length === 0) {
    throw new ErrorParametros(
      `ChuspaNumeric: la matriz debe ser un array bidimensional no vacío. Se recibió: ${typeof matriz}.`
    );
  }

  const n = matriz.length;

  if (!matriz.every(Array.isArray)) {
    throw new ErrorParametros(
      `ChuspaNumeric: la matriz debe ser un array bidimensional (array de arrays).`
    );
  }

  if (matriz.some((fila) => fila.length !== n)) {
    throw new ErrorParametros(
      `ChuspaNumeric: la matriz debe ser cuadrada (${n}×${n}). ` +
      `Algunas filas tienen longitud diferente a ${n}.`
    );
  }
}

/**
 * Verifica que un vector sea un array de números finitos con la dimensión esperada.
 *
 * @param {*}      vector    - Valor a verificar.
 * @param {number} dimension - Longitud esperada del vector.
 * @throws {ErrorParametros} Si el valor no es un array, no tiene la dimensión correcta,
 *                            o contiene elementos no numéricos o no finitos.
 *
 * @example
 * validarVector([1, 2, 3], 3);       // OK
 * validarVector([1, 2], 3);          // lanza ErrorParametros (dimensión incorrecta)
 * validarVector([1, "a", 3], 3);     // lanza ErrorParametros (elemento no numérico)
 * validarVector([1, Infinity, 3], 3);// lanza ErrorParametros (elemento no finito)
 */
function validarVector(vector, dimension) {
  if (!Array.isArray(vector)) {
    throw new ErrorParametros(
      `ChuspaNumeric: el vector debe ser un array. Se recibió: ${typeof vector}.`
    );
  }

  if (vector.length !== dimension) {
    throw new ErrorParametros(
      `ChuspaNumeric: el vector debe tener longitud ${dimension}. Se recibió longitud ${vector.length}.`
    );
  }

  for (let i = 0; i < vector.length; i++) {
    if (typeof vector[i] !== "number" || !isFinite(vector[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric: el elemento vector[${i}] debe ser un número finito. Se recibió: ${vector[i]}.`
      );
    }
  }
}

/**
 * Verifica que un valor numérico no sea NaN ni Infinity durante la iteración
 * de un método numérico. Lanza ErrorDivergencia si el valor es no numérico.
 *
 * A diferencia de validarNumero (que valida parámetros de entrada),
 * esta función detecta divergencia numérica durante la ejecución iterativa.
 *
 * @param {number} valor - Valor a verificar (ej. resultado de una iteración).
 * @param {string} metodo - Nombre del método para el mensaje de error.
 * @param {number} iteracion - Número de iteración donde se detectó el valor.
 * @throws {ErrorDivergencia} Si el valor es NaN o no finito.
 *
 * @example
 * verificarDivergencia(3.14, "newtonRaphson", 5);  // OK, no lanza nada
 * verificarDivergencia(NaN, "newtonRaphson", 5);   // lanza ErrorDivergencia
 * verificarDivergencia(Infinity, "puntoFijo", 10); // lanza ErrorDivergencia
 */
function verificarDivergencia(valor, metodo, iteracion) {
  if (typeof valor !== "number" || Number.isNaN(valor) || !isFinite(valor)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${metodo}: divergencia numérica detectada en la iteración ${iteracion}. ` +
      `El valor calculado es ${valor}, lo cual indica que el método no converge ` +
      `numéricamente para los parámetros dados.`
    );
  }
}

export {
  validarNumero,
  validarFuncion,
  validarTolerancia,
  validarIteraciones,
  validarIntervalo,
  validarMatrizCuadrada,
  validarVector,
  verificarDivergencia,
};