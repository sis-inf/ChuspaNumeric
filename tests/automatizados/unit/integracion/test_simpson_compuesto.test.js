import { describe, expect, test } from '@jest/globals';
import { ErrorParametros } from '../../../../src/core/errores.js';
import { simpsonCompuesto } from '../../../../src/integracion/simpson_compuesto.js';

describe('simpsonCompuesto', () => {
  test('integra exactamente una cubica en un intervalo que cruza cero', () => {
    const { resultado } = simpsonCompuesto(x => x ** 3, -2, 1, 6);
    expect(resultado).toBeCloseTo(-15 / 4, 12);
  });

  test('combina los pesos de los nodos en cuatro subintervalos', () => {
    const { resultado, iteraciones } = simpsonCompuesto(x => x ** 3 + x, 0, 2, 4);
    expect(resultado).toBeCloseTo(6, 12);
    expect(iteraciones.map(paso => paso.coeficiente)).toEqual([1, 4, 2, 4, 1]);
    expect(iteraciones.map(paso => paso.xi)).toEqual([0, 0.5, 1, 1.5, 2]);
  });

  test.each([
    [2, 1, 4],
    [1, 1, 4],
    [0, Infinity, 4],
    [0, 1, 2.5],
  ])('rechaza a=%s, b=%s, n=%s', (a, b, n) => {
    expect(() => simpsonCompuesto(x => x, a, b, n)).toThrow(ErrorParametros);
  });
});
