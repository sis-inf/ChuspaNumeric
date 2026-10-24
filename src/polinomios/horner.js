import { ErrorParametros } from '../core/errores.js';
import { validarNumero } from '../utils/validaciones.js';

/**
 * Evalúa un polinomio en un punto x usando el esquema de Horner.
 * Es más eficiente y numéricamente estable que la evaluación directa.
 *
 * El esquema aplicado es:
 *   b_n = a_n
 *   b_k = a_k + x * b_{k+1}
 *
 * @param {number[]} coeficientes - Coeficientes del polinomio, donde
 *   coeficientes[0] corresponde al término de mayor grado.
 *   Ejemplo: [1, -3, 2] representa x² - 3x + 2.
 * @param {number} x - Punto en el que se evalúa el polinomio.
 * @returns {number} Valor del polinomio evaluado en x.
 * @throws {ErrorParametros} Si coeficientes está vacío o no es un array, si x no es un
 *   número finito o si algún coeficiente no es un número finito.
 *
 * @example
 * evaluarHorner([1, -3, 2], 2); // 0  (raíces en 1 y 2)
 * evaluarHorner([1], 5);        // 1  (polinomio constante)
 */
function evaluarHorner(coeficientes, x) {
  if (!Array.isArray(coeficientes) || coeficientes.length === 0) {
    throw new ErrorParametros(
      `Trazo.evaluarHorner: 'coeficientes' debe ser un array no vacío. Se recibió: ${JSON.stringify(coeficientes)}.`
    );
  }

  validarNumero(x, 'x');
  coeficientes.forEach((coeficiente, i) => validarNumero(coeficiente, `coeficientes[${i}]`));

  let resultado = coeficientes[0];

  for (let i = 1; i < coeficientes.length; i++) {
    resultado = coeficientes[i] + x * resultado;
  }

  return resultado;
}

export { evaluarHorner };