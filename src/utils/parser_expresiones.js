/**
 * parser_expresiones.js
 * ChuspaNumeric — Librería de Métodos Numéricos
 *
 * Convierte expresiones matemáticas en formato string a funciones
 * JavaScript evaluables de forma segura, usando mathjs.
 *
 * ─── DECISIÓN ARQUITECTÓNICA ───────────────────────────────────────────────
 * Este módulo usa mathjs de forma INTENCIONAL y declarada, a diferencia del
 * uso accidental y no declarado que existía en root/bisection.js y
 * root/newtonRaphson.js (eliminados en el lote de fix correspondiente).
 *
 * Razón para usar mathjs aquí:
 *   - El caso de uso es exactamente para el que mathjs fue diseñado: parsear
 *     expresiones matemáticas escritas como texto por usuarios finales.
 *   - El CLI y el playground reciben fórmulas como strings (ej. 'x^2 - 4'),
 *     no como funciones JS. Convertirlas sin mathjs requeriría un parser
 *     propio complejo y propenso a errores de seguridad (eval sin sandboxing).
 *   - mathjs provee sandboxing interno, soporte para operadores matemáticos
 *     estándar (^, raíces, trigonométricas, logaritmos) y detección de
 *     expresiones inválidas antes de evaluarlas.
 *
 * Por qué NO se usa eval directamente:
 *   - eval ejecuta código arbitrario sin restricciones, lo que representa
 *     un riesgo de seguridad en contextos donde el usuario controla el input.
 *   - mathjs.evaluate() opera sobre un scope restringido, no sobre el
 *     contexto global de Node.js.
 * ───────────────────────────────────────────────────────────────────────────
 */

import { compile } from 'mathjs';

/**
 * Convierte una expresión matemática en string a una función JS evaluable.
 *
 * Soporta operadores y funciones matemáticas comunes:
 *   - Potencias: `x^2`, `x**2`
 *   - Trigonométricas: `sin(x)`, `cos(x)`, `tan(x)`
 *   - Inversas: `asin(x)`, `acos(x)`, `atan(x)`
 *   - Exponencial y logaritmo: `exp(x)`, `log(x)`, `log10(x)`
 *   - Raíz cuadrada: `sqrt(x)`
 *   - Valor absoluto: `abs(x)`
 *   - Constantes: `pi`, `e`
 *
 * @param {string} expresionString - Expresión matemática en formato string.
 *                                   La variable independiente debe ser `x`.
 * @returns {Function} Función JS de la forma `(x) => number` lista para
 *                     pasarse a cualquier método numérico de ChuspaNumeric.
 *
 * @throws {Error} Si la expresión está vacía o no es un string.
 * @throws {Error} Si la expresión contiene sintaxis inválida.
 * @throws {Error} Si la evaluación produce un resultado no numérico.
 *
 * @example
 * // Expresión simple
 * const f = parsearExpresion('x^2 - 4');
 * f(2);  // 0
 * f(-2); // 0
 *
 * @example
 * // Con funciones trigonométricas
 * const g = parsearExpresion('sin(x) + x^2 - 1');
 * g(0); // -1
 *
 * @example
 * // Uso con métodos de ChuspaNumeric
 * import { biseccion } from 'chuspanumeric';
 * const f = parsearExpresion('x^3 - x - 1');
 * const res = biseccion({ f, a: 1, b: 2 });
 */
function parsearExpresion(expresionString) {
  if (typeof expresionString !== 'string') {
    throw new Error(
      `parsearExpresion: se esperaba un string. Se recibió: ${typeof expresionString}.`
    );
  }

  const expr = expresionString.trim();

  if (expr.length === 0) {
    throw new Error(
      'parsearExpresion: la expresión no puede estar vacía.'
    );
  }

  // Compilar la expresión con mathjs — detecta sintaxis inválida en este paso
  let exprCompilada;
  try {
    exprCompilada = compile(expr);
  } catch (e) {
    throw new Error(
      `parsearExpresion: expresión inválida "${expr}". ${e.message}`
    );
  }

  // Retornar función JS evaluable con scope restringido a { x }
  return function (x) {
    if (typeof x !== 'number' || !isFinite(x)) {
      throw new Error(
        `parsearExpresion: x debe ser un número finito. Se recibió: ${x}.`
      );
    }

    const resultado = exprCompilada.evaluate({ x });

    if (typeof resultado !== 'number' || !isFinite(resultado)) {
      throw new Error(
        `parsearExpresion: la expresión produjo un resultado no numérico en x=${x}. ` +
        `Resultado: ${resultado}.`
      );
    }

    return resultado;
  };
}

export { parsearExpresion };