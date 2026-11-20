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


describe('Lagrange baricéntrica: precisión y refinamiento de nodos', () => {
  test.each([1e-4, 1e-8, 1e-12])(
    'reproduce un polinomio con error relativo menor que %p',
    (tolerancia) => {
      const polinomio = (x) => 2 * x ** 3 - 3 * x + 5;
      const nodos = [-2, -0.5, 1, 3];

      for (const x of [-1.5, 0.25, 2.5]) {
        const exacto = polinomio(x);
        const res = lagrangeBaricentrica({
          nodos,
          valores: nodos.map(polinomio),
          x,
        });

        expect(res.convergio).toBe(true);
        expect(Math.abs(res.resultado - exacto) / Math.abs(exacto)).toBeLessThan(
          tolerancia
        );
      }
    }
  );

  test.each([0.4, 0.2, 0.1])(
    'aproxima exp(0) con nodos simétricos y paso %p',
    (paso) => {
      const nodos = [-paso, paso];
      const res = lagrangeBaricentrica({
        nodos,
        valores: nodos.map(Math.exp),
        x: 0,
      });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado - 1)).toBeLessThan(paso ** 2);
    }
  );

  test('el refinamiento lineal presenta orden dos y el cúbico orden cuatro', () => {
    const pasos = [0.2, 0.1, 0.05];
    const errores = (multiplicadores) => pasos.map((paso) => {
      const nodos = multiplicadores.map((valor) => valor * paso);
      const res = lagrangeBaricentrica({
        nodos,
        valores: nodos.map(Math.exp),
        x: 0,
      });
      expect(res.convergio).toBe(true);
      return Math.abs(res.resultado - 1);
    });
    const lineales = errores([-1, 1]);
    const cubicos = errores([-1.5, -0.5, 0.5, 1.5]);

    for (let indice = 0; indice < pasos.length - 1; indice++) {
      const ordenLineal = Math.log2(lineales[indice] / lineales[indice + 1]);
      const ordenCubico = Math.log2(cubicos[indice] / cubicos[indice + 1]);
      expect(ordenLineal).toBeGreaterThan(1.9);
      expect(ordenLineal).toBeLessThan(2.1);
      expect(ordenCubico).toBeGreaterThan(3.9);
      expect(ordenCubico).toBeLessThan(4.1);
    }
  });

  test.each([1e-8, 1, 1e8])(
    'preserva la precisión relativa al escalar las ordenadas por %p',
    (escala) => {
      const nodos = [-1, 0, 1];
      const funcion = (x) => escala * (x * x + 2);
      const x = 0.375;
      const exacto = funcion(x);
      const res = lagrangeBaricentrica({ nodos, valores: nodos.map(funcion), x });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado - exacto) / exacto).toBeLessThan(1e-14);
    }
  );

  test('rechaza nodos que se vuelven indistinguibles por redondeo', () => {
    const primero = 1;
    const segundo = primero + Number.EPSILON / 4;

    expect(segundo).toBe(primero);
    expect(() => lagrangeBaricentrica({
      nodos: [primero, segundo],
      valores: [2, 3],
      x: 0.5,
    })).toThrow(ErrorParametros);
  });

  test.each([NaN, Infinity, -Infinity])(
    'rechaza el punto de evaluación no finito %p',
    (x) => {
      expect(() => lagrangeBaricentrica({
        nodos: [0, 1],
        valores: [1, 2],
        x,
      })).toThrow(ErrorParametros);
    }
  );

  test('la interpolación conserva los nodos y valores originales', () => {
    const nodos = [-1, 0, 1];
    const valores = [3, 2, 3];

    lagrangeBaricentrica({ nodos, valores, x: 0.5 });

    expect(nodos).toEqual([-1, 0, 1]);
    expect(valores).toEqual([3, 2, 3]);
  });
});
