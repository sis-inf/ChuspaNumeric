import { falsaPosicion } from '../../../src/no-lineales/falsa-posicion.js';
import { ErrorParametros, ErrorConvergencia } from '../../../src/core/errores.js';

describe('falsaPosicion', () => {

  test('encuentra la raíz de x² - 2 en el intervalo [1, 2]', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(1e-4);
  });

  test('la primera iteración tiene n igual a 1 y error igual a null', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.iteraciones[0].n).toBe(1);
    expect(res.iteraciones[0].error).toBeNull();
  });

  test('lanza ErrorParametros cuando el intervalo no tiene cambio de signo', () => {
    const f = (x) => x * x + 1;

    expect(() =>
      falsaPosicion({
        f,
        a: 0,
        b: 1
      })
    ).toThrow(ErrorParametros);
  });

  test('lanza ErrorConvergencia cuando se alcanza el máximo de iteraciones', () => {
    const f = (x) => x * x - 2;

    expect(() =>
      falsaPosicion({
        f,
        a: 1,
        b: 2,
        tolerancia: 1e-12,
        maxIter: 1
      })
    ).toThrow(ErrorConvergencia);
  });

  test('el resultado incluye el nombre del método en meta', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.meta.metodo).toBe('Falsa Posición');
  });

});