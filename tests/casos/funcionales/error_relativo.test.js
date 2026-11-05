import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';
import { errorRelativo, errorPorcentual } from '../../../src/utils/error_relativo.js';

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

describe('error relativo y porcentual - cálculo y bordes', () => {
  test('calcula el error relativo y porcentual', () => {
    expect(errorRelativo(4, 3)).toBe(0.25);
    expect(errorPorcentual(4, 3)).toBe(25);
  });

  test('devuelve un error positivo cuando el valor verdadero es negativo', () => {
    expect(errorRelativo(-4, -3)).toBe(0.25);
    expect(errorPorcentual(-4, -3)).toBe(25);
  });

  test('lanza error cuando el valor verdadero es exactamente cero', () => {
    expect(() => errorRelativo(0, 1)).toThrow(
      'El valor verdadero no puede ser 0 para calcular error relativo'
    );
    expect(() => errorPorcentual(0, 1)).toThrow(
      'El valor verdadero no puede ser 0 para calcular error porcentual'
    );
  });

  test('trata -0 igual que cero', () => {
    expect(() => errorRelativo(-0, 1)).toThrow();
    expect(() => errorPorcentual(-0, 1)).toThrow();
  });

  test('calcula un resultado finito cuando el valor verdadero es muy cercano a cero', () => {
    expect(errorRelativo(1e-300, 2e-300)).toBeCloseTo(1, 10);
    expect(errorPorcentual(1e-300, 2e-300)).toBeCloseTo(100, 10);
    expect(Number.isFinite(errorRelativo(1e-300, 1))).toBe(true);
  });
});