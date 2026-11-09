import { derivadaRichardson } from '../../../src/diferencias/richardson.js';
import { diferenciaCentrada } from '../../../src/diferencias/diferencia_centrada.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('derivadaRichardson', () => {
  test('mejora a la diferencia centrada inicial en sen(x)', () => {
    // d/dx sen(x) = cos(x)
    const exacta = Math.cos(1);
    const h = 0.1;
    const centrada = diferenciaCentrada(Math.sin, 1, h);

    const res = derivadaRichardson({ f: Math.sin, x: 1, h });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - exacta)).toBeLessThan(
      Math.abs(centrada - exacta)
    );
    expect(res.resultado).toBeCloseTo(exacta, 8);
  });

  test('es exacta en un polinomio cúbico', () => {
    // f(x) = x³, f'(2) = 12; el error centrado es h², y Richardson lo cancela
    const res = derivadaRichardson({ f: (x) => x ** 3, x: 2 });

    expect(res.resultado).toBeCloseTo(12, 8);
  });

  test('reduce el paso a la mitad en cada refinamiento', () => {
    const res = derivadaRichardson({
      f: Math.exp,
      x: 0,
      h: 0.4,
      tolerancia: 1e-10,
    });

    expect(res.iteraciones.length).toBeGreaterThan(1);
    res.iteraciones.forEach((iteracion, indice) => {
      expect(iteracion.h).toBeCloseTo(0.4 / 2 ** (indice + 1), 12);
    });
  });

  test('se detiene al alcanzar el máximo sin converger', () => {
    const res = derivadaRichardson({
      f: Math.exp,
      x: 0,
      h: 0.4,
      tolerancia: 1e-14,
      maxIter: 2,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(2);
  });

  test.each([[undefined], [null], [5], ['x']])(
    'rechaza f no válida: %p',
    (f) => {
      expect(() => derivadaRichardson({ f, x: 1 })).toThrow(ErrorParametros);
    }
  );

  test.each([[undefined], [NaN], [Infinity], ['1']])(
    'rechaza x no válido: %p',
    (x) => {
      expect(() => derivadaRichardson({ f: Math.sin, x })).toThrow(
        ErrorParametros
      );
    }
  );

  test.each([[0], [NaN], [Infinity], ['0.1']])(
    'rechaza h no válido: %p',
    (h) => {
      expect(() => derivadaRichardson({ f: Math.sin, x: 1, h })).toThrow(
        ErrorParametros
      );
    }
  );

  test.each([[0], [-1e-6], [NaN], ['1e-6']])(
    'rechaza tolerancia no válida: %p',
    (tolerancia) => {
      expect(() =>
        derivadaRichardson({ f: Math.sin, x: 1, tolerancia })
      ).toThrow(ErrorParametros);
    }
  );

  test.each([[0], [-1], [1.5], ['10']])(
    'rechaza maxIter no válido: %p',
    (maxIter) => {
      expect(() => derivadaRichardson({ f: Math.sin, x: 1, maxIter })).toThrow(
        ErrorParametros
      );
    }
  );
});
