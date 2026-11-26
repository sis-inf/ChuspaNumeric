
import { jest } from '@jest/globals';
import { integracionMonteCarlo } from '../../../src/integracion/monte_carlo.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

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

describe('integracionMonteCarlo - precision y convergencia', () => {
  test('el error estándar disminuye aproximadamente con 1/√N', () => {
    const calcularErrorEstandar = (n) => {
      let indice = 0;

      jest.spyOn(Math, 'random').mockImplementation(() => {
        const valor = indice % 2 === 0 ? 0.25 : 0.75;
        indice++;
        return valor;
      });

      const resultado = integracionMonteCarlo(
        x => x * x, 0, 1, n
      );

      jest.restoreAllMocks();

      return resultado.errorEstandar;
    };

    const error400 = calcularErrorEstandar(400);
    const error1600 = calcularErrorEstandar(1600);

    const relacion = error400 / error1600;

    expect(error1600).toBeLessThan(error400);
    expect(relacion).toBeCloseTo(2, 2);
  });

  test('mantiene un error relativo acotado respecto al error estándar', () => {
    const resultado = integracionMonteCarlo({
      f: ([x]) => x * x,
      limitesInferiores: [0],
      limitesSuperiores: [1],
      nMuestras: 50000,
      semilla: 12345
    });

    const valorExacto = 1 / 3;

    const errorRelativo = Math.abs(
      (resultado.resultado - valorExacto) / valorExacto
    );

    const errorRelativoEstimado =
      5 * resultado.iteraciones[0].errorEstandar / valorExacto;

    expect(errorRelativo).toBeLessThan(errorRelativoEstimado);
  });

  test('produce el mismo resultado con la misma semilla', () => {
    const opciones = {
      f: ([x, y]) => x * x + y * y,
      limitesInferiores: [0, 0],
      limitesSuperiores: [1, 1],
      nMuestras: 1000,
      semilla: 42
    };

    const primero = integracionMonteCarlo(opciones);
    const segundo = integracionMonteCarlo(opciones);

    expect(primero.resultado).toBe(segundo.resultado);
    expect(primero.errorEstandar).toBe(segundo.errorEstandar);
  });

  test('mejora la precisión estimada al aumentar las muestras', () => {
    const opciones = {
      f: ([x]) => x * x,
      limitesInferiores: [0],
      limitesSuperiores: [1],
      semilla: 9876
    };

    const resultadoPequeno = integracionMonteCarlo({
      ...opciones,
      nMuestras: 1000
    });

    const resultadoGrande = integracionMonteCarlo({
      ...opciones,
      nMuestras: 10000
    });

    expect(resultadoGrande.iteraciones[0].errorEstandar)
      .toBeLessThan(resultadoPequeno.iteraciones[0].errorEstandar);
  });
});

describe('integracionMonteCarlo - detección de divergencia', () => {
  test('lanza ErrorDivergencia cuando la estimación desborda', () => {
    expect(() =>
      integracionMonteCarlo(
        () => Number.MAX_VALUE,
        0,
        2,
        4
      )
    ).toThrow(ErrorDivergencia);
  });
});