import { halley } from '../../../src/no-lineales/halley.js';
import {
  ErrorDivergencia,
  ErrorDominio,
  ErrorParametros,
} from '../../../src/core/errores.js';

describe('halley', () => {
  const cuadratica = {
    f: (x) => x * x - 2,
    df: (x) => 2 * x,
    d2f: () => 2,
  };

  test('converge a la raíz de x² − 2', () => {
    const res = halley({ ...cuadratica, x0: 1, tolerancia: 1e-10 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.SQRT2, 10);
  });

  test('converge a la raíz de x³ − 8', () => {
    const res = halley({
      f: (x) => x ** 3 - 8,
      df: (x) => 3 * x * x,
      d2f: (x) => 6 * x,
      x0: 3,
      tolerancia: 1e-10,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 10);
  });

  test('converge a la raíz de eˣ − 2', () => {
    const res = halley({
      f: (x) => Math.exp(x) - 2,
      df: Math.exp,
      d2f: Math.exp,
      x0: 1,
      tolerancia: 1e-10,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.LN2, 10);
  });

  test('informa que no convergió al agotar maxIter', () => {
    const res = halley({
      ...cuadratica,
      x0: 10,
      tolerancia: 1e-12,
      maxIter: 1,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(1);
  });

  test('lanza ErrorDominio si el denominador es cero', () => {
    // f(x) = 1/x en x = 1: 2·f′² − f·f″ = 2 − 2 = 0
    expect(() =>
      halley({
        f: (x) => 1 / x,
        df: (x) => -1 / (x * x),
        d2f: (x) => 2 / x ** 3,
        x0: 1,
      })
    ).toThrow(ErrorDominio);
  });

  test.each([
    ['f', NaN],
    ['df', NaN],
    ['df', Infinity],
    ['d2f', NaN],
    ['d2f', -Infinity],
  ])('lanza ErrorDivergencia si %s devuelve %p', (nombre, valor) => {
    expect(() =>
      halley({ ...cuadratica, [nombre]: () => valor, x0: 1 })
    ).toThrow(ErrorDivergencia);
  });

  test.each([
    ['f', 5],
    ['df', undefined],
    ['d2f', null],
    ['x0', NaN],
    ['x0', '1'],
    ['tolerancia', 0],
    ['tolerancia', -1e-6],
    ['maxIter', 0],
    ['maxIter', 1.5],
  ])('rechaza %s = %p', (nombre, valor) => {
    expect(() => halley({ ...cuadratica, x0: 1, [nombre]: valor })).toThrow(
      ErrorParametros
    );
  });
});
