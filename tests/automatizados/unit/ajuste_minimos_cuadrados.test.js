import { ErrorParametros } from '../../../src/core/errores.js';

import {
  regresionLineal,
  regresionPolinomial
} from '../../../src/analisis/ajuste_minimos_cuadrados.js';

describe('ajuste por mínimos cuadrados', () => {

  test('regresionLineal recupera pendiente e intercepto de una recta exacta', () => {

    const xs = [0, 1, 2, 3];
    const ys = [1, 3, 5, 7];

    const res = regresionLineal(xs, ys);

    expect(res.pendiente).toBeCloseTo(2, 10);
    expect(res.intercepto).toBeCloseTo(1, 10);
    expect(res.r2).toBeCloseTo(1, 10);
    // La recta es y = 2x + 1
    // Para x = 4, el resultado esperado es 9.
    expect(res.prediccion(4)).toBeCloseTo(9, 10);

  });

  test('regresionPolinomial recupera los coeficientes de un polinomio conocido', () => {

    const xs = [0, 1, 2, 3];
    const ys = [1, 6, 17, 34];

    const res = regresionPolinomial(xs, ys, 2);

    expect(res.coeficientes[0]).toBeCloseTo(1, 10);
    expect(res.coeficientes[1]).toBeCloseTo(2, 10);
    expect(res.coeficientes[2]).toBeCloseTo(3, 10);
    expect(res.r2).toBeCloseTo(1, 10);

  });

  test('regresionLineal rechaza menos de dos observaciones', () => {
    expect(() => regresionLineal([1], [3])).toThrow(ErrorParametros);
    expect(() => regresionLineal([1], [3])).toThrow(
      'se necesitan al menos 2 puntos'
    );
  });

  test('regresionLineal rechaza arreglos de distinta longitud', () => {
    const xs = [1, 2, 3];
    const ys = [2, 4];

    expect(() => regresionLineal(xs, ys)).toThrow(ErrorParametros);
    expect(() => regresionLineal(xs, ys)).toThrow(
      'xs e ys deben tener la misma longitud'
    );
  });
});
