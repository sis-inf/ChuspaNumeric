import { simpsonCompuesto } from '../../../src/integracion/simpson_compuesto.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

describe('simpsonCompuesto - integración numérica', () => {
  const valorExacto = 1 / 3; // ∫₀¹ x² dx = 1/3

  test('integra f(x) = x² en [0,1] con n=2', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 2);

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(valorExacto, 1);
  });

  test('integra f(x) = x² en [0,1] con n=4', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 4);

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(valorExacto, 2);
  });

  test('integra f(x) = x² en [0,1] con n=10', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 10);

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(valorExacto, 4);
  });

  test('integra f(x) = x² en [0,1] con n=100', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 100);

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(valorExacto, 8);
  });

  test('mayor n produce mejor precisión (para x⁴)', () => {
    const f = (x) => x ** 4;
    const valorExactoX4 = 1 / 5; // ∫₀¹ x⁴ dx = 1/5

    const resN2 = simpsonCompuesto(f, 0, 1, 2);
    const resN4 = simpsonCompuesto(f, 0, 1, 4);
    const resN100 = simpsonCompuesto(f, 0, 1, 100);

    const errorN2 = Math.abs(resN2.resultado - valorExactoX4);
    const errorN4 = Math.abs(resN4.resultado - valorExactoX4);
    const errorN100 = Math.abs(resN100.resultado - valorExactoX4);

    expect(errorN4).toBeLessThan(errorN2);
    expect(errorN100).toBeLessThan(errorN4);
  });

  test('n impar lanza error', () => {
    const f = (x) => x * x;

    expect(() => simpsonCompuesto(f, 0, 1, 3)).toThrow();
    expect(() => simpsonCompuesto(f, 0, 1, 5)).toThrow();
  });

  test('n < 2 lanza error', () => {
    const f = (x) => x * x;

    expect(() => simpsonCompuesto(f, 0, 1, 1)).toThrow();
    expect(() => simpsonCompuesto(f, 0, 1, 0)).toThrow();
    expect(() => simpsonCompuesto(f, 0, 1, -2)).toThrow();
  });

  test('las iteraciones contienen i, xi, fxi y coeficiente', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 4);

    const iteracion = res.iteraciones[0];

    expect(iteracion).toHaveProperty('i');
    expect(iteracion).toHaveProperty('xi');
    expect(iteracion).toHaveProperty('fxi');
    expect(iteracion).toHaveProperty('coeficiente');
  });

  test('el resultado contiene meta con método y parámetros', () => {
    const f = (x) => x * x;
    const res = simpsonCompuesto(f, 0, 1, 4);

    expect(res.meta).toHaveProperty('metodo');
    expect(res.meta).toHaveProperty('parametros');
    expect(res.meta.metodo).toBe('Simpson 1/3 Compuesto');
    expect(res.meta.parametros).toEqual({ a: 0, b: 1, n: 4 });
  });
});

describe('simpsonCompuesto - precisión y convergencia', () => {
  const f = (x) => Math.exp(x);
  const valorExacto = Math.E - 1;

  const errorRelativo = (aproximacion) =>
    Math.abs((aproximacion - valorExacto) / valorExacto);

  test.each([
    [2, 1e-3],
    [4, 1e-4],
    [16, 1e-6],
  ])(
    'alcanza un error relativo menor que %i con tolerancia %s',
    (n, tolerancia) => {
      const res = simpsonCompuesto(f, 0, 1, n);

      expect(res.convergio).toBe(true);
      expect(errorRelativo(res.resultado)).toBeLessThan(tolerancia);
    }
  );

  test('presenta convergencia de orden cuatro al reducir el paso', () => {
    const res2 = simpsonCompuesto(f, 0, 1, 2);
    const res4 = simpsonCompuesto(f, 0, 1, 4);
    const res8 = simpsonCompuesto(f, 0, 1, 8);

    const error2 = errorRelativo(res2.resultado);
    const error4 = errorRelativo(res4.resultado);
    const error8 = errorRelativo(res8.resultado);

    const orden1 = error2 / error4;
    const orden2 = error4 / error8;

    expect(error4).toBeLessThan(error2);
    expect(error8).toBeLessThan(error4);

    expect(orden1).toBeGreaterThan(14);
    expect(orden1).toBeLessThan(18);

    expect(orden2).toBeGreaterThan(14);
    expect(orden2).toBeLessThan(18);
  });
});

describe('simpsonCompuesto - detección de divergencia', () => {
  test('lanza ErrorDivergencia cuando la función produce Infinity', () => {
    const f = () => Infinity;

    expect(() => simpsonCompuesto(f, 0, 1, 2))
      .toThrow(ErrorDivergencia);
  });

  test('lanza ErrorDivergencia cuando la función produce NaN', () => {
    const f = () => NaN;

    expect(() => simpsonCompuesto(f, 0, 1, 2))
      .toThrow(ErrorDivergencia);
  });
});