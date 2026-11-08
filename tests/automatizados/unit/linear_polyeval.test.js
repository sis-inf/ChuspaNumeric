import { linearInterpolation } from '../../../src/interpolacion/linear.js';
import { polyEval } from '../../../src/interpolacion/polyEval.js';

describe('linearInterpolation', () => {
  test('interpola correctamente entre dos puntos conocidos', () => {
    // Puntos: (2, 4) y (6, 12)
    // y = 4 + (4 - 2) * (12 - 4) / (6 - 2) = 8

    const resultado = linearInterpolation(2, 4, 6, 12, 4);

    expect(resultado).toBeCloseTo(8, 10);
  });
});

describe('polyEval', () => {
  test('evalúa correctamente un polinomio cuadrático mediante Horner', () => {
    // P(x) = 2x² + 3x + 1
    // P(2) = 15
    const coeficientes = [2, 3, 1];

    const resultado = polyEval(coeficientes, 2);

    expect(resultado).toBeCloseTo(15, 10);
  });

  test('evalúa correctamente un polinomio constante', () => {
    // P(x) = 5
    const resultado = polyEval([5], 3);

    expect(resultado).toBeCloseTo(5, 10);
  });

  test('evalúa correctamente un polinomio lineal', () => {
    // P(x) = 3x + 2
    // P(4) = 14
    const resultado = polyEval([3, 2], 4);

    expect(resultado).toBeCloseTo(14, 10);
  });

  test('evalúa correctamente un polinomio en x igual a cero', () => {
    // P(x) = 2x² + 3x + 1
    // P(0) = 1
    const resultado = polyEval([2, 3, 1], 0);

    expect(resultado).toBeCloseTo(1, 10);
  });

  test('rechaza una lista vacía de coeficientes', () => {
    expect(() => polyEval([], 2)).toThrow(
      'El array de coeficientes no puede estar vacío'
    );
  });
});
