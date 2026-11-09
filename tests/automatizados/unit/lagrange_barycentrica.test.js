import { lagrangeBaricentrica } from '../../../src/interpolacion/lagrange_barycentrica.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('lagrangeBaricentrica', () => {
  const nodos = [-1, 0, 2, 3];
  const cubica = (x) => x ** 3 - 2 * x + 1;
  const valores = nodos.map(cubica);

  test.each(nodos.map((nodo, i) => [nodo, i]))(
    'reproduce el valor de entrada en el nodo %p',
    (nodo, i) => {
      const res = lagrangeBaricentrica({ nodos, valores, x: nodo });

      expect(res.convergio).toBe(true);
      expect(res.resultado).toBeCloseTo(valores[i], 10);
    }
  );

  test.each([[-0.5], [1], [1.75], [2.5]])(
    'recupera una cúbica conocida en x = %p',
    (x) => {
      // Cuatro nodos determinan de forma única un polinomio de grado 3
      const res = lagrangeBaricentrica({ nodos, valores, x });

      expect(res.resultado).toBeCloseTo(cubica(x), 10);
    }
  );

  test('recupera una recta con dos nodos', () => {
    // y = 2x + 1
    const res = lagrangeBaricentrica({
      nodos: [0, 4],
      valores: [1, 9],
      x: 1,
    });

    expect(res.resultado).toBeCloseTo(3, 10);
  });

  test('no depende del orden de los nodos', () => {
    const res = lagrangeBaricentrica({
      nodos: [3, -1, 2, 0],
      valores: [3, -1, 2, 0].map(cubica),
      x: 1.75,
    });

    expect(res.resultado).toBeCloseTo(cubica(1.75), 10);
  });

  test('rechaza nodos repetidos', () => {
    expect(() =>
      lagrangeBaricentrica({ nodos: [0, 1, 1], valores: [0, 1, 2], x: 0.5 })
    ).toThrow(ErrorParametros);
  });

  test('rechaza dimensiones incompatibles', () => {
    expect(() =>
      lagrangeBaricentrica({ nodos: [0, 1, 2], valores: [0, 1], x: 0.5 })
    ).toThrow(ErrorParametros);
  });

  test.each([
    [undefined, [0, 1], 0.5],
    [[0], [1], 0.5],
    [[0, 1], undefined, 0.5],
    [[0, NaN], [0, 1], 0.5],
    [[0, 1], [0, Infinity], 0.5],
    [[0, 1], [0, 1], NaN],
    [[0, 1], [0, 1], '0.5'],
  ])('rechaza parámetros no válidos: %p, %p, %p', (n, v, x) => {
    expect(() =>
      lagrangeBaricentrica({ nodos: n, valores: v, x })
    ).toThrow(ErrorParametros);
  });
});
