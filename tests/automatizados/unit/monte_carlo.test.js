
import { jest } from '@jest/globals';
import { integracionMonteCarlo } from '../../../src/integracion/monte_carlo.js';

describe('integracionMonteCarlo', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('integra una función constante', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const resultado = integracionMonteCarlo(
      () => 5, 0, 2, 4
    );

    expect(resultado.valor).toBe(10);
    expect(resultado.errorEstandar).toBe(0);
    expect(resultado.n).toBe(4);
    expect(resultado.intervaloA).toBe(0);
    expect(resultado.intervaloB).toBe(2);
  });

  test('integra en un intervalo no unitario', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const resultado = integracionMonteCarlo(
      x => x, 2, 6, 4
    );

    expect(resultado.valor).toBe(16);
    expect(resultado.errorEstandar).toBe(0);
  });

  test('usa muestras aleatorias controladas', () => {
    jest.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.25)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.75);

    const resultado = integracionMonteCarlo(
      x => x, 0, 4, 4
    );

    expect(resultado.valor).toBe(6);
    expect(resultado.errorEstandar)
      .toBeGreaterThan(0);
  });

  test.each([
    [null, 0, 1, 4],
    [5, 0, 1, 4],
    [x => x, '0', 1, 4],
    [x => x, 0, '1', 4],
    [x => x, 2, 1, 4],
    [x => x, 1, 1, 4],
    [x => x, 0, 1, 0],
    [x => x, 0, 1, -1],
    [x => x, 0, 1, 2.5],
  ])('rechaza parámetros inválidos %#', (f, a, b, n) => {
    expect(() => integracionMonteCarlo(f, a, b, n))
      .toThrow();
  });

  test('rechaza resultados no finitos', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    expect(() =>
      integracionMonteCarlo(() => NaN, 0, 1, 4)
    ).toThrow();

    expect(() =>
      integracionMonteCarlo(() => Infinity, 0, 1, 4)
    ).toThrow();
  });
});
