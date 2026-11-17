/**
 * @file numeros_complejos.js
 * @description Utilidades básicas para operar con números complejos en ChuspaNumeric.
 *
 * Un número complejo se representa como un objeto plano { re, im } donde:
 * - `re` es la parte real (número)
 * - `im` es la parte imaginaria (número)
 *
 * Por ejemplo, el número complejo 3 + 4i se representa como { re: 3, im: 4 }.
 * Un número real puro n se representa como { re: n, im: 0 }.
 * La unidad imaginaria i se representa como { re: 0, im: 1 }.
 *
 * ## Motivación
 *
 * El método de Müller (`src/no-lineales/muller.js`) puede encontrar raíces
 * complejas de polinomios, pero en su implementación actual usa
 * `Math.abs(discriminante)` cuando el discriminante es negativo, devolviendo
 * solo la parte real de la raíz compleja y perdiendo la parte imaginaria.
 * Extender muller.js para retornar números complejos correctamente requeriría
 * cambiar el tipo de `resultado` de `number` a `{ re, im }`, lo que rompe el
 * contrato actual del método. Esa extensión queda como trabajo futuro (ver
 * issue de seguimiento en el repositorio).
 *
 * Este módulo provee las utilidades de aritmética compleja necesarias para
 * cuando esa extensión se implemente, y para cualquier otro uso en el proyecto
 * que requiera aritmética compleja.
 */

import { ErrorParametros } from '../core/errores.js';

// ---------------------------------------------------------------------------
// Validación interna
// ---------------------------------------------------------------------------

/**
 * Verifica que el argumento sea un número complejo válido { re, im }.
 * @param {*} z
 * @param {string} nombre - Nombre del parámetro para el mensaje de error.
 * @throws {ErrorParametros}
 */
function _validarComplejo(z, nombre) {
  if (
    z === null ||
    typeof z !== 'object' ||
    typeof z.re !== 'number' ||
    typeof z.im !== 'number' ||
    !isFinite(z.re) ||
    !isFinite(z.im)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.numeros_complejos: "${nombre}" debe ser un objeto { re, im } con ` +
      `valores numéricos finitos. Se recibió: ${JSON.stringify(z)}.`
    );
  }
}

// ---------------------------------------------------------------------------
// Operaciones
// ---------------------------------------------------------------------------

/**
 * Suma dos números complejos: (a + bi) + (c + di) = (a+c) + (b+d)i
 *
 * @param {{ re: number, im: number }} z1 - Primer operando.
 * @param {{ re: number, im: number }} z2 - Segundo operando.
 * @returns {{ re: number, im: number }} La suma z1 + z2.
 * @throws {ErrorParametros} Si algún operando no es un complejo válido.
 *
 * @example
 * sumaComplejos({ re: 3, im: 2 }, { re: 1, im: -5 });
 * // { re: 4, im: -3 }
 *
 * sumaComplejos({ re: 0, im: 1 }, { re: 0, im: 1 });
 * // { re: 0, im: 2 }  (i + i = 2i)
 */
export function sumaComplejos(z1, z2) {
  _validarComplejo(z1, 'z1');
  _validarComplejo(z2, 'z2');
  return { re: z1.re + z2.re, im: z1.im + z2.im };
}

/**
 * Multiplica dos números complejos:
 * (a + bi)(c + di) = (ac - bd) + (ad + bc)i
 *
 * @param {{ re: number, im: number }} z1 - Primer operando.
 * @param {{ re: number, im: number }} z2 - Segundo operando.
 * @returns {{ re: number, im: number }} El producto z1 · z2.
 * @throws {ErrorParametros} Si algún operando no es un complejo válido.
 *
 * @example
 * productoComplejos({ re: 0, im: 1 }, { re: 0, im: 1 });
 * // { re: -1, im: 0 }  (i · i = -1)
 *
 * productoComplejos({ re: 3, im: 2 }, { re: 1, im: -1 });
 * // { re: 5, im: 1 }
 */
export function productoComplejos(z1, z2) {
  _validarComplejo(z1, 'z1');
  _validarComplejo(z2, 'z2');
  return {
    re: z1.re * z2.re - z1.im * z2.im,
    im: z1.re * z2.im + z1.im * z2.re,
  };
}

/**
 * Calcula el módulo (valor absoluto) de un número complejo:
 * |a + bi| = sqrt(a² + b²)
 *
 * @param {{ re: number, im: number }} z - El número complejo.
 * @returns {number} El módulo de z (siempre ≥ 0).
 * @throws {ErrorParametros} Si z no es un complejo válido.
 *
 * @example
 * moduloComplejo({ re: 3, im: 4 });  // 5
 * moduloComplejo({ re: 1, im: 0 });  // 1
 * moduloComplejo({ re: 0, im: 1 });  // 1
 * moduloComplejo({ re: 0, im: 0 });  // 0
 */
export function moduloComplejo(z) {
  _validarComplejo(z, 'z');
  return Math.sqrt(z.re * z.re + z.im * z.im);
}

/**
 * Calcula el conjugado de un número complejo:
 * conj(a + bi) = a - bi
 *
 * @param {{ re: number, im: number }} z - El número complejo.
 * @returns {{ re: number, im: number }} El conjugado de z.
 * @throws {ErrorParametros} Si z no es un complejo válido.
 *
 * @example
 * conjugadoComplejo({ re: 3, im: 4 });   // { re: 3, im: -4 }
 * conjugadoComplejo({ re: 5, im: 0 });   // { re: 5, im: 0 }
 * conjugadoComplejo({ re: 0, im: -2 });  // { re: 0, im: 2 }
 */
export function conjugadoComplejo(z) {
  _validarComplejo(z, 'z');
  return { re: z.re, im: -z.im };
}

/**
 * Divide dos números complejos:
 * (a + bi) / (c + di) = [(ac + bd) + (bc - ad)i] / (c² + d²)
 *
 * La división se implementa multiplicando numerador y denominador por el
 * conjugado del denominador, lo que garantiza un denominador real.
 *
 * @param {{ re: number, im: number }} z1 - Numerador.
 * @param {{ re: number, im: number }} z2 - Denominador.
 * @returns {{ re: number, im: number }} El cociente z1 / z2.
 * @throws {ErrorParametros} Si algún operando no es un complejo válido.
 * @throws {ErrorParametros} Si z2 es el complejo cero (módulo = 0).
 *
 * @example
 * divisionComplejos({ re: 1, im: 0 }, { re: 0, im: 1 });
 * // { re: 0, im: -1 }  (1 / i = -i)
 *
 * divisionComplejos({ re: 4, im: 2 }, { re: 3, im: -1 });
 * // { re: 1, im: 1 }
 */
export function divisionComplejos(z1, z2) {
  _validarComplejo(z1, 'z1');
  _validarComplejo(z2, 'z2');

  const denominador = z2.re * z2.re + z2.im * z2.im;

  if (denominador === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.divisionComplejos: el denominador es el complejo cero { re: 0, im: 0 }. ' +
      'La división por cero no está definida.'
    );
  }

  return {
    re: (z1.re * z2.re + z1.im * z2.im) / denominador,
    im: (z1.im * z2.re - z1.re * z2.im) / denominador,
  };
}

/**
 * Resta dos números complejos: (a + bi) - (c + di) = (a-c) + (b-d)i
 *
 * @param {{ re: number, im: number }} z1 - Minuendo.
 * @param {{ re: number, im: number }} z2 - Sustraendo.
 * @returns {{ re: number, im: number }} La resta z1 - z2.
 * @throws {ErrorParametros} Si algún operando no es un complejo válido.
 *
 * @example
 * restaComplejos({ re: 5, im: 4 }, { re: 2, im: 1 });
 * // { re: 3, im: 3 }
 */
export function restaComplejos(z1, z2) {
  _validarComplejo(z1, 'z1');
  _validarComplejo(z2, 'z2');
  return { re: z1.re - z2.re, im: z1.im - z2.im };
}

/**
 * Calcula el argumento (ángulo polar en radianes) de un número complejo:
 * arg(a + bi) = atan2(b, a), en el intervalo [-π, π].
 *
 * @param {{ re: number, im: number }} z - El número complejo.
 * @returns {number} El argumento de z en radianes.
 * @throws {ErrorParametros} Si z no es un complejo válido.
 *
 * @example
 * argumentoComplejo({ re: 0, im: 1 });   // Math.PI / 2
 * argumentoComplejo({ re: -1, im: 0 });  // Math.PI
 */
export function argumentoComplejo(z) {
  _validarComplejo(z, 'z');
  return Math.atan2(z.im, z.re);
}
