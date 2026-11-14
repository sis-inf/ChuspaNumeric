import { describe, expect, test } from '@jest/globals';
import { ErrorConvergencia, ErrorParametros } from '../../../../src/core/errores.js';
import { rungeKutta4 } from '../../../../src/edo/runge_kutta_4.js';

describe('rungeKutta4', () => {
  const opciones = { f: (_x, y) => y, x0: 0, y0: 1, h: 0.25, xFinal: 1 };

  test('integra una derivada cubica con paso fijo', () => {
    const { resultado, convergio } = rungeKutta4({ ...opciones, f: x => x ** 3, y0: 2 });
    expect(convergio).toBe(true);
    expect(resultado).toHaveLength(5);
    expect(resultado.at(-1)).toEqual([1, 2.25]);
  });

  test('adapta el paso y llega al extremo aunque el paso inicial no lo divida', () => {
    const { resultado, iteraciones, convergio } = rungeKutta4({
      ...opciones,
      xFinal: 0.95,
      tolerancia: 1e-7,
      pasoMinimo: 0.001,
      pasoMaximo: 0.25,
    });
    expect(convergio).toBe(true);
    expect(resultado.at(-1)[0]).toBe(0.95);
    expect(resultado.at(-1)[1]).toBeCloseTo(Math.exp(0.95), 6);
    expect(iteraciones.some(paso => paso.h < opciones.h)).toBe(true);
    for (const paso of iteraciones) {
      expect(paso.h).toBeGreaterThanOrEqual(0.001);
      expect(paso.h).toBeLessThanOrEqual(0.25);
      expect(paso.errorEstimado).toBeLessThanOrEqual(1e-7);
    }
  });

  test('lanza un error de convergencia si el paso minimo impide alcanzar la tolerancia', () => {
    expect(() =>
      rungeKutta4({ ...opciones, tolerancia: 1e-12, pasoMinimo: 0.25, pasoMaximo: 0.25 }),
    ).toThrow(ErrorConvergencia);
  });

  test.each([{ tolerancia: 0 }, { tolerancia: 1e-5, pasoMinimo: 0.5, pasoMaximo: 0.25 }])(
    'rechaza opciones adaptativas invalidas %j',
    cambios => {
      expect(() => rungeKutta4({ ...opciones, ...cambios })).toThrow(ErrorParametros);
    },
  );

  test('rechaza una derivada no finita durante un paso', () => {
    expect(() => rungeKutta4({ ...opciones, f: x => (x === 0 ? 1 : Infinity) })).toThrow(
      ErrorParametros,
    );
  });
});
