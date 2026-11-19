import { ErrorParametros } from '../core/errores.js';

/**
 * Evalúa un polinomio usando el algoritmo de Horner.
 *
 * Para P(x) = a₀xⁿ + a₁xⁿ⁻¹ + ... + aₙ se calcula en forma anidada:
 * P(x) = (...((a₀·x + a₁)·x + a₂)·x + ...) + aₙ, que necesita solo n
 * multiplicaciones y n sumas.
 *
 * @param {number[]} coefficients - Coeficientes del polinomio, del mayor grado al menor.
 * @param {number} x - Valor donde evaluar.
 * @returns {number} Valor del polinomio en x.
 * @throws {ErrorParametros} Si coefficients no es un arreglo, está vacío o contiene
 *   valores no finitos, si x no es un número finito o si el resultado desborda.
 *
 * @example
 * polyEval([2, 3, 1], 2); // 15, porque P(x) = 2x² + 3x + 1
 */
export function polyEval(coefficients, x) {
  if (!Array.isArray(coefficients)) {
    throw new ErrorParametros(
      `ChuspaNumeric.polyEval: 'coefficients' debe ser un arreglo. Se recibió: ${typeof coefficients}.`
    );
  }

  if (coefficients.length === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.polyEval: El array de coeficientes no puede estar vacío'
    );
  }

  for (let i = 0; i < coefficients.length; i++) {
    if (typeof coefficients[i] !== 'number' || !Number.isFinite(coefficients[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.polyEval: 'coefficients' debe contener solamente números finitos. ` +
          `coefficients[${i}] es ${coefficients[i]}.`
      );
    }
  }

  if (typeof x !== 'number' || !Number.isFinite(x)) {
    throw new ErrorParametros(
      `ChuspaNumeric.polyEval: 'x' debe ser un número finito. Se recibió: ${x}.`
    );
  }

  let result = coefficients[0];

  for (let i = 1; i < coefficients.length; i++) {
    result = result * x + coefficients[i];
  }

  // Con datos muy grandes Horner puede desbordar: el resultado no sería confiable.
  if (!Number.isFinite(result)) {
    throw new ErrorParametros(
      'ChuspaNumeric.polyEval: el cálculo excede el rango numérico representable ' +
        'para los datos recibidos.'
    );
  }

  return result;
}
