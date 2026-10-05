import { biseccion } from '../../../src/no-lineales/biseccion.js';

describe('biseccion', () => {
  const f = (x) => x ** 3 - x - 2;

  test('encuentra raíz de x^3 - x - 2 en [1, 2] con tolerancia 1e-5', () => {
    const res = biseccion({ f, a: 1, b: 2, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(1.5214, 4);
    expect(res.iteraciones).toBeInstanceOf(Array);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.meta.metodo).toBe('biseccion');
  });

  test('lanza error con parámetros inválidos o intervalo sin cambio de signo', () => {
    expect(() => biseccion(null)).toThrow();
    // f(1) = -2 y f(1.5) = -0.125 (mismo signo, no hay cambio de signo)
    expect(() => biseccion({ f, a: 1, b: 1.5, tolerancia: 1e-5 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const res = biseccion({ f, a: 1, b: 2, tolerancia: 1e-12, maxIter: 1 });
    expect(res.convergio).toBe(false);
  });

  test('encuentra raíz en caso exitoso adicional (x^2 - 4 = 0 en [0, 3])', () => {
    const f2 = (x) => x ** 2 - 4;
    const res = biseccion({ f: f2, a: 0, b: 3, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 4);
  });
});