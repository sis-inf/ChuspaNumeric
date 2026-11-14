import { describe, expect, test } from '@jest/globals';
import { ErrorDominio, ErrorParametros } from '../../../../src/core/errores.js';
import { sor } from '../../../../src/lineales/sor.js';

describe('sor', () => {
  const A = [[4, 1], [1, 3]];
  const b = [6, 7];

  test.each([0.75, 1.25])('resuelve el sistema con omega=%s y conserva el vector inicial', omega => {
    const x0 = [1, 0];
    const { resultado, convergio } = sor({ A, b, x0, omega, tolerancia: 1e-9 });
    expect(convergio).toBe(true);
    expect(resultado[0]).toBeCloseTo(1, 8);
    expect(resultado[1]).toBeCloseTo(2, 8);
    expect(x0).toEqual([1, 0]);
  });

  test('usa el componente actualizado durante la misma iteracion', () => {
    const { resultado, iteraciones } = sor({ A, b, omega: 0.5, maxIter: 1 });
    expect(iteraciones).toHaveLength(1);
    expect(resultado[0]).toBe(0.75);
    expect(resultado[1]).toBeCloseTo((7 - 0.75) / 6, 12);
  });

  test('resuelve un sistema de una incognita con solucion inicial exacta', () => {
    const { resultado, iteraciones, convergio } = sor({ A: [[2]], b: [6], x0: [3], omega: 0.5 });
    expect(convergio).toBe(true);
    expect(resultado).toEqual([3]);
    expect(iteraciones[0].error).toBe(0);
  });

  test('rechaza un valor inicial no finito', () => {
    expect(() => sor({ A, b, x0: [0, Infinity] })).toThrow(ErrorParametros);
  });

  test('rechaza una diagonal nula aunque el termino independiente sea cero', () => {
    expect(() => sor({ A: [[0]], b: [0] })).toThrow(ErrorDominio);
  });
});
