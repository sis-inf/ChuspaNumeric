import { describe, expect, test } from '@jest/globals';
import { ErrorParametros } from '../../../../src/core/errores.js';
import { calcularNumeroCondicion } from '../../../../src/matricial/numero_condicion.js';

describe('calcularNumeroCondicion', () => {
  test('usa la norma de Frobenius para una matriz triangular y su inversa', () => {
    const matriz = [[1, 1], [0, 1]];
    const inversa = [[1, -1], [0, 1]];
    expect(calcularNumeroCondicion(matriz, inversa).resultado).toBeCloseTo(3, 12);
  });

  test('conserva el numero de condicion al escalar la matriz y la inversa', () => {
    expect(calcularNumeroCondicion([[4, 4], [0, 4]], [[0.25, -0.25], [0, 0.25]]).resultado).toBeCloseTo(3, 12);
  });

  test('devuelve el resultado estructurado con sus metadatos', () => {
    const salida = calcularNumeroCondicion([[1, 1], [0, 1]], [[1, -1], [0, 1]]);
    expect(salida.resultado).toBeCloseTo(3, 12);
    expect(salida.convergio).toBe(true);
    expect(salida.iteraciones).toEqual([]);
    expect(salida.meta.metodo).toBe('numero-condicion');
    expect(salida.meta.parametros).toEqual({ filas: 2, columnas: 2 });
    expect(typeof salida.meta.tiempo_ms).toBe('number');
  });

  test('calcula uno para una matriz invertible de orden uno', () => {
    expect(calcularNumeroCondicion([[-4]], [[-0.25]]).resultado).toBe(1);
  });

  test.each([
    [[[1, 2]], [[1]]],
    [[[1]], [[1, 0], [0, 1]]],
    [[[1, 0], [0]], [[1, 0], [0, 1]]],
  ])('rechaza formas incompatibles (%j, %j)', (matriz, inversa) => {
    expect(() => calcularNumeroCondicion(matriz, inversa)).toThrow(ErrorParametros);
  });

  test.each([{ inversa: [] }, { inversa: [[]] }])('rechaza una inversa sin datos %j', ({ inversa }) => {
    expect(() => calcularNumeroCondicion([[1]], inversa)).toThrow(ErrorParametros);
  });
});
