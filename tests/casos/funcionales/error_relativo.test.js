import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';

describe('error relativo - newton-raphson', () => {
  test('el error en cada iteración decrece hasta ser menor a tolerancia', () => {
    const f  = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;
    const tolerancia = 1e-5;

    const res = newtonRaphson({ f, df, x0: 1, tolerancia });

    expect(res.convergio).toBe(true);

    // El error de la última iteración debe ser menor a la tolerancia
    const ultimaIter = res.iteraciones.at(-1);
    expect(ultimaIter.error).toBeLessThan(tolerancia);

    // El resultado debe estar muy cerca de √2
    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(tolerancia);
  });

  test('lanza error con parámetros inválidos', () => {
    expect(() => newtonRaphson(null)).toThrow();
    expect(() => newtonRaphson({})).toThrow();
    expect(() => newtonRaphson({ f: (x) => x, df: 'no es funcion', x0: 1 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const f = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;
    const res = newtonRaphson({ f, df, x0: 100, tolerancia: 1e-12, maxIter: 1 });

    expect(res.convergio).toBe(false);
  });

  test('evalúa error relativo en un caso exitoso adicional (x^3 - 8 = 0)', () => {
    const f = (x) => x ** 3 - 8;
    const df = (x) => 3 * (x ** 2);
    const tolerancia = 1e-5;

    const res = newtonRaphson({ f, df, x0: 3, tolerancia });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 4);

    const ultimaIter = res.iteraciones.at(-1);
    expect(ultimaIter.error).toBeLessThan(tolerancia);
  });
});