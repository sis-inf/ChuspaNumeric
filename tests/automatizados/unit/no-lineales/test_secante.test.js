import { describe, expect, test } from '@jest/globals';
import { ErrorDominio, ErrorParametros } from '../../../../src/core/errores.js';
import { secante } from '../../../../src/no-lineales/secante.js';

describe('secante', () => {
  test('converge a una raiz negativa y deja un residuo pequeno', () => {
    const f = x => x ** 3 + 8;
    const { resultado, convergio } = secante({ f, x0: -3, x1: -1, tolerancia: 1e-9 });
    expect(convergio).toBe(true);
    expect(resultado).toBeCloseTo(-2, 8);
    expect(Math.abs(f(resultado))).toBeLessThan(1e-8);
  });

  test('conserva la raiz cuando la segunda aproximacion ya es exacta', () => {
    const { resultado, iteraciones, convergio } = secante({ f: x => x - 3, x0: 0, x1: 3 });
    expect(convergio).toBe(true);
    expect(resultado).toBe(3);
    expect(iteraciones).toHaveLength(1);
    expect(iteraciones[0].error).toBe(0);
  });

  test('detecta una pendiente nula que aparece despues del primer paso', () => {
    const f = x => (x === 0 ? 2 : 1);
    expect(() => secante({ f, x0: 0, x1: 1 })).toThrow(ErrorDominio);
    expect(() => secante({ f, x0: 0, x1: 1 })).toThrow(/2/);
  });

  test.each([{ x0: Infinity }, { tolerancia: NaN }, { maxIter: 2.5 }])(
    'rechaza parametros no finitos o fraccionarios %j',
    cambios => {
      expect(() => secante({ f: x => x - 3, x0: 0, x1: 2, ...cambios })).toThrow(
        ErrorParametros,
      );
    },
  );
});
