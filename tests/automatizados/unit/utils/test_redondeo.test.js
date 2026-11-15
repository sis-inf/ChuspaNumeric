import { describe, expect, test } from '@jest/globals';
import { cifrasSignificativas } from '../../../../src/utils/redondeo.js';

describe('cifrasSignificativas', () => {
  test.each([
    [0, 3, 0],
    [0.001234, 3, 0.00123],
    [-0.001256, 3, -0.00126],
    [999.5, 3, 1000],
    [12345, 2, 12000],
    [0.5, 100, 0.5],
  ])('redondea %s a %s cifras significativas y devuelve %s', (valor, cifras, esperado) => {
    expect(cifrasSignificativas(valor, cifras)).toBe(esperado);
  });

  test.each([0, -1, 101, NaN, Infinity])('rechaza la precision fuera de rango %s', cifras => {
    expect(() => cifrasSignificativas(1, cifras)).toThrow(RangeError);
  });
});
