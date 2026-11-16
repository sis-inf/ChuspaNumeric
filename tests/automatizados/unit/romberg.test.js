import { romberg } from '../../../src/integracion/romberg.js';

describe('romberg - integración numérica', () => {
  const valorExacto = 1 / 3; // ∫₀¹ x² dx = 1/3

  test('integra f(x) = x² en [0,1]', () => {
    const f = (x) => x * x;

    const res = romberg({
      f,
      a: 0,
      b: 1
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(valorExacto, 8);
  });

  test('devuelve la tabla completa de Romberg', () => {
    const f = (x) => x * x;

    const res = romberg({
      f,
      a: 0,
      b: 1
    });

    expect(Array.isArray(res.iteraciones)).toBe(true);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(Array.isArray(res.iteraciones[0])).toBe(true);
  });

  test('incluye meta con método y parámetros', () => {
    const f = (x) => x * x;

    const res = romberg({
      f,
      a: 0,
      b: 1
    });

    expect(res.meta).toHaveProperty('metodo');
    expect(res.meta).toHaveProperty('parametros');

    expect(res.meta.metodo).toBe('romberg');

    expect(res.meta.parametros).toEqual({
      a: 0,
      b: 1,
      nMax: 10,
      tolerancia: 1e-8
    });
  });

  test.each([1e-3, 1e-11])('integra seno con error relativo menor que %p', (tolerancia) => {
    const res = romberg({ f: Math.sin, a: 0, b: Math.PI, tolerancia });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - 2) / 2).toBeLessThan(tolerancia);
  });

  test('reducir a la mitad el paso mejora el error según el orden de cada columna', () => {
    const exacto = Math.expm1(1);
    const res = romberg({ f: Math.exp, a: 0, b: 1, nMax: 3, tolerancia: 1e-14 });
    const [, pasoInicial, mitadDelPaso] = res.iteraciones;
    const factorDeMejora = (columna) =>
      Math.abs(pasoInicial[columna] - exacto) / Math.abs(mitadDelPaso[columna] - exacto);

    expect(factorDeMejora(0)).toBeGreaterThan(3.9);
    expect(factorDeMejora(0)).toBeLessThan(4.1);
    expect(factorDeMejora(1)).toBeGreaterThan(15);
    expect(factorDeMejora(1)).toBeLessThan(17);
  });

  test('reporta no convergencia y devuelve la mejor aproximación disponible', () => {
    const exacto = Math.expm1(1);
    const res = romberg({ f: Math.exp, a: 0, b: 1, nMax: 2, tolerancia: 1e-14 });

    expect(res.convergio).toBe(false);
    expect(res.mensaje).toContain('no alcanzó la tolerancia');
    expect(res.iteraciones.map((fila) => fila.length)).toEqual([1, 2]);
    expect(res.resultado).toBe(res.iteraciones[1][1]);
    expect(Math.abs(res.resultado - exacto)).toBeLessThan(
      Math.abs(res.iteraciones[0][0] - exacto),
    );
  });
});
