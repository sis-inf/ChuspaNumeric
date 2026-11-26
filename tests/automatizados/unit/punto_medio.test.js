import { puntoMedio } from '../../../src/integracion/punto_medio.js';
import {
  ErrorParametros,
  ErrorDivergencia
} from '../../../src/core/errores.js';

describe('puntoMedio - integración numérica', () => {
  const cuadrado = (x) => x * x;

  test('integra exactamente una función constante', () => {
    // ∫₁³ 5 dx = 10
    const res = puntoMedio({ f: () => 5, a: 1, b: 3, n: 4 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(10, 10);
  });

  test('integra exactamente un polinomio lineal con un subintervalo', () => {
    // ∫₀² (3x + 1) dx = 8
    const res = puntoMedio({ f: (x) => 3 * x + 1, a: 0, b: 2, n: 1 });

    expect(res.resultado).toBeCloseTo(8, 10);
  });

  test('coincide con la fórmula cerrada de x² con n=10', () => {
    // Para f(x) = x² en [0,1], la regla da 1/3 − 1/(12n²)
    const res = puntoMedio({ f: cuadrado, a: 0, b: 1, n: 10 });

    expect(res.resultado).toBeCloseTo(1 / 3 - 1 / 1200, 10);
  });

  test('se acerca a la integral exacta de x² con n=1000', () => {
    // ∫₀¹ x² dx = 1/3
    const res = puntoMedio({ f: cuadrado, a: 0, b: 1, n: 1000 });

    expect(res.resultado).toBeCloseTo(1 / 3, 6);
  });

  test('el resultado cambia de signo al invertir los límites', () => {
    const directo = puntoMedio({ f: cuadrado, a: 0, b: 2, n: 8 });
    const invertido = puntoMedio({ f: cuadrado, a: 2, b: 0, n: 8 });

    expect(invertido.resultado).toBeCloseTo(-directo.resultado, 10);
  });

  test.each([[undefined], [null], [5], ['x']])(
    'rechaza f no válida: %p',
    (f) => {
      expect(() => puntoMedio({ f, a: 0, b: 1, n: 4 })).toThrow(
        ErrorParametros
      );
    }
  );

  test.each([[0], [-1], [1.5], [NaN], ['10']])('rechaza n = %p', (n) => {
    expect(() => puntoMedio({ f: cuadrado, a: 0, b: 1, n })).toThrow(
      ErrorParametros
    );
  });

  test.each([
    [NaN, 1],
    [0, Infinity],
    ['0', 1],
    [2, 2],
  ])('rechaza los límites a = %p y b = %p', (a, b) => {
    expect(() => puntoMedio({ f: cuadrado, a, b, n: 4 })).toThrow(
      ErrorParametros
    );
  });
});

describe('puntoMedio - precisión y convergencia', () => {
  const integralExacta = 1 / 3;

  // Calcula el error relativo respecto a la integral exacta de x² en [0, 1].
  const obtenerErrorRelativo = (n) => {
    const res = puntoMedio({
      f: (x) => x * x,
      a: 0,
      b: 1,
      n
    });

    return Math.abs(
      (res.resultado - integralExacta) / integralExacta
    );
  };

  test.each([4, 8, 16, 32])(
    'reduce el error relativo al aumentar los subintervalos a %i',
    (n) => {
      const error = obtenerErrorRelativo(n);

      expect(error).toBeGreaterThan(0);
      expect(error).toBeLessThan(1 / (4 * (n / 2) ** 2));
    }
  );

  test('presenta convergencia de segundo orden al reducir el tamaño del paso', () => {
    const error4 = obtenerErrorRelativo(4);
    const error8 = obtenerErrorRelativo(8);
    const error16 = obtenerErrorRelativo(16);

    const orden1 = error4 / error8;
    const orden2 = error8 / error16;

    expect(error8).toBeLessThan(error4);
    expect(error16).toBeLessThan(error8);

    expect(orden1).toBeGreaterThan(3.9);
    expect(orden1).toBeLessThan(4.1);

    expect(orden2).toBeGreaterThan(3.9);
    expect(orden2).toBeLessThan(4.1);
  });

  test('disminuye el error relativo al reducir el tamaño del paso', () => {
    const tamanosPaso = [0.25, 0.125, 0.0625];

    const errores = tamanosPaso.map((h) => {
      const n = 1 / h;
      return obtenerErrorRelativo(n);
    });

    expect(errores[1]).toBeLessThan(errores[0]);
    expect(errores[2]).toBeLessThan(errores[1]);
  });
});

describe('puntoMedio - detección de divergencia', () => {
  test('lanza ErrorDivergencia cuando el área calculada desborda', () => {
    expect(() =>
      puntoMedio({
        f: () => Number.MAX_VALUE,
        a: 0,
        b: 2,
        n: 1
      })
    ).toThrow(ErrorDivergencia);
  });
});