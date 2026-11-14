import { describe, expect, test } from '@jest/globals';
import { ErrorParametros, ErrorTamano } from '../../../../src/core/errores.js';
import { calcularNumeroCondicion } from '../../../../src/matricial/numero_condicion.js';

describe('calcularNumeroCondicion', () => {
  test('usa la norma de Frobenius para una matriz triangular y su inversa', () => {
    const matriz = [[1, 1], [0, 1]];
    const inversa = [[1, -1], [0, 1]];
    expect(calcularNumeroCondicion(matriz, inversa)).toBeCloseTo(3, 12);
  });

  test('conserva el numero de condicion al escalar la matriz y la inversa', () => {
    expect(calcularNumeroCondicion([[4, 4], [0, 4]], [[0.25, -0.25], [0, 0.25]])).toBeCloseTo(3, 12);
  });

  test('calcula uno para una matriz invertible de orden uno', () => {
    expect(calcularNumeroCondicion([[-4]], [[-0.25]])).toBe(1);
  });

  test.each([
    [[[1, 2]], [[1]]],
    [[[1]], [[1, 0], [0, 1]]],
    [[[1, 0], [0]], [[1, 0], [0, 1]]],
  ])('rechaza formas incompatibles (%j, %j)', (matriz, inversa) => {
    expect(() => calcularNumeroCondicion(matriz, inversa)).toThrow(ErrorTamano);
  });

  test.each([{ inversa: [] }, { inversa: [[]] }])('rechaza una inversa sin datos %j', ({ inversa }) => {
    expect(() => calcularNumeroCondicion([[1]], inversa)).toThrow(ErrorParametros);
  });
});
