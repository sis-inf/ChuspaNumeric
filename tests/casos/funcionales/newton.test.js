import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';

describe('newton-raphson', () => {
  const f  = (x) => x ** 2 - 2;
  const df = (x) => 2 * x;

  test('encuentra raíz de x^2 - 2 desde x0=1 con tolerancia 1e-5', () => {
    const res = newtonRaphson({ f, df, x0: 1, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(1.4142, 4);
    expect(res.iteraciones).toBeInstanceOf(Array);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.meta.metodo).toBe('newton-raphson');
  });

  test('lanza error si los parámetros son inválidos', () => {
    expect(() => newtonRaphson(null)).toThrow();
    expect(() => newtonRaphson({})).toThrow();
    expect(() => newtonRaphson({ f, df: null, x0: 1 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const res = newtonRaphson({ f, df, x0: 10, tolerancia: 1e-12, maxIter: 1 });
    expect(res.convergio).toBe(false);
  });

  test('encuentra raíz en caso exitoso adicional (x^3 - 27 = 0)', () => {
    const f3 = (x) => x ** 3 - 27;
    const df3 = (x) => 3 * (x ** 2);

    const res = newtonRaphson({ f: f3, df: df3, x0: 5, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(3, 4);
  });
});