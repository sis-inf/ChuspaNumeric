import { secante } from '../../../src/no-lineales/secante.js';

describe('secante', () => {
  const f = (x) => x ** 3 - x - 2;

  test('encuentra raíz de x^3 - x - 2 desde x0=1, x1=2 con tolerancia 1e-5', () => {
    const res = secante({ f, x0: 1, x1: 2, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(1.5214, 4);
    expect(res.iteraciones).toBeInstanceOf(Array);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.meta.metodo).toBe('secante');
  });

  test('lanza error con parámetros inválidos', () => {
    expect(() => secante(null)).toThrow();
    expect(() => secante({})).toThrow();
    expect(() => secante({ f: null, x0: 1, x1: 2 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const res = secante({ f, x0: 1, x1: 2, tolerancia: 1e-12, maxIter: 1 });
    expect(res.convergio).toBe(false);
  });

  test('encuentra raíz en caso exitoso adicional (x^2 - 4 = 0)', () => {
    const f2 = (x) => x ** 2 - 4;
    const res = secante({ f: f2, x0: 0, x1: 3, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 4);
  });
});