import { simpson13 } from '../../../src/integracion/simpson-13.js';
import { simpson38 } from '../../../src/integracion/simpson-38.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

describe('simpson13 y simpson38 - reglas de Simpson', () => {
  const valorExacto = 1 / 3; // ∫₀¹ x² dx = 1/3

  describe('simpson13', () => {
    test('integra f(x) = x² en [0,1] con n=2', () => {
      const f = (x) => x * x;
      const res = simpson13({ f, a: 0, b: 1, n: 2 });

      expect(res.resultado).toBeCloseTo(valorExacto, 1);
    });

    test('integra f(x) = x² en [0,1] con n=4', () => {
      const f = (x) => x * x;
      const res = simpson13({ f, a: 0, b: 1, n: 4 });

      expect(res.resultado).toBeCloseTo(valorExacto, 2);
    });

    test('integra f(x) = x² en [0,1] con n=100', () => {
      const f = (x) => x * x;
      const res = simpson13({ f, a: 0, b: 1, n: 100 });

      expect(res.resultado).toBeCloseTo(valorExacto, 8);
    });

    test('n impar lanza error', () => {
      const f = (x) => x * x;

      expect(() => simpson13({ f, a: 0, b: 1, n: 3 })).toThrow(
        'n debe ser un entero positivo y par'
      );
      expect(() => simpson13({ f, a: 0, b: 1, n: 5 })).toThrow(
        'n debe ser un entero positivo y par'
      );
    });

    test('n <= 0 lanza error', () => {
      const f = (x) => x * x;

      expect(() => simpson13({ f, a: 0, b: 1, n: 0 })).toThrow(
        'n debe ser un entero positivo y par'
      );
      expect(() => simpson13({ f, a: 0, b: 1, n: -2 })).toThrow(
        'n debe ser un entero positivo y par'
      );
    });

    test('intervalo inválido lanza error', () => {
      const f = (x) => x * x;

      expect(() => simpson13({ f, a: 1, b: 1, n: 2 })).toThrow(
        'Intervalo inválido'
      );
      expect(() => simpson13({ f, a: 2, b: 1, n: 2 })).toThrow(
        'Intervalo inválido'
      );
    });
  });

  describe('simpson38', () => {
    test('integra f(x) = x² en [0,1] con n=3 (múltiplo de 3)', () => {
      const f = (x) => x * x;
      const res = simpson38({ f, a: 0, b: 1, n: 3 });

      expect(res.resultado).toBeCloseTo(valorExacto, 1);
    });

    test('integra f(x) = x² en [0,1] con n=6 (múltiplo de 3)', () => {
      const f = (x) => x * x;
      const res = simpson38({ f, a: 0, b: 1, n: 6 });

      expect(res.resultado).toBeCloseTo(valorExacto, 2);
    });

    test('integra f(x) = x² en [0,1] con n=99 (múltiplo de 3)', () => {
      const f = (x) => x * x;
      const res = simpson38({ f, a: 0, b: 1, n: 99 });

      expect(res.resultado).toBeCloseTo(valorExacto, 8);
    });

    test('n no múltiplo de 3 lanza error', () => {
      const f = (x) => x * x;

      expect(() => simpson38({ f, a: 0, b: 1, n: 2 })).toThrow(
        "ChuspaNumeric: 'n' debe ser múltiplo de 3"
      );
      expect(() => simpson38({ f, a: 0, b: 1, n: 4 })).toThrow(
        "ChuspaNumeric: 'n' debe ser múltiplo de 3"
      );
      expect(() => simpson38({ f, a: 0, b: 1, n: 5 })).toThrow(
        "ChuspaNumeric: 'n' debe ser múltiplo de 3"
      );
      expect(() => simpson38({ f, a: 0, b: 1, n: 10 })).toThrow(
        "ChuspaNumeric: 'n' debe ser múltiplo de 3"
      );
    });

    test('n <= 0 lanza error', () => {
      const f = (x) => x * x;

      expect(() => simpson38({ f, a: 0, b: 1, n: 0 })).toThrow(
        "ChuspaNumeric: 'n' debe ser un entero positivo"
      );
      expect(() => simpson38({ f, a: 0, b: 1, n: -3 })).toThrow(
        "ChuspaNumeric: 'n' debe ser un entero positivo"
      );
    });

    test('valor por defecto de n es 99', () => {
      const f = (x) => x * x;
      const res = simpson38({ f, a: 0, b: 1 });

      expect(res.meta.parametros.n).toBe(99);
      expect(res.resultado).toBeCloseTo(valorExacto, 8);
    });
  });

  describe('comparación entre simpson13 y simpson38', () => {
    test('ambos métodos integran la misma función con precisión similar', () => {
      const f = (x) => x * x;

      const res13 = simpson13({ f, a: 0, b: 1, n: 6 });
      const res38 = simpson38({ f, a: 0, b: 1, n: 6 });

      expect(res13.resultado).toBeCloseTo(valorExacto, 2);
      expect(res38.resultado).toBeCloseTo(valorExacto, 2);
    });

    test('simpson13 requiere n par, simpson38 requiere n múltiplo de 3', () => {
      const f = (x) => x * x;

      // n=6 es válido para ambos (par y múltiplo de 3)
      expect(() => simpson13({ f, a: 0, b: 1, n: 6 })).not.toThrow();
      expect(() => simpson38({ f, a: 0, b: 1, n: 6 })).not.toThrow();

      // n=4 es válido solo para simpson13 (par pero no múltiplo de 3)
      expect(() => simpson13({ f, a: 0, b: 1, n: 4 })).not.toThrow();
      expect(() => simpson38({ f, a: 0, b: 1, n: 4 })).toThrow();

      // n=3 es válido solo para simpson38 (múltiplo de 3 pero impar)
      expect(() => simpson13({ f, a: 0, b: 1, n: 3 })).toThrow();
      expect(() => simpson38({ f, a: 0, b: 1, n: 3 })).not.toThrow();
    });
  });
});

describe('simpson13 y simpson38 - precisión y convergencia', () => {
  const f = (x) => Math.exp(x);
  const integralExacta = Math.E - 1;

  const errorRelativo = (aproximacion) =>
    Math.abs((aproximacion - integralExacta) / integralExacta);

  describe('simpson13', () => {
    test.each([2, 4, 8, 16])(
      'reduce el error relativo al aumentar n=%i',
      (n) => {
        const res = simpson13({ f, a: 0, b: 1, n });

        expect(res.convergio).toBe(true);
        expect(errorRelativo(res.resultado)).toBeLessThan(1e-3);
      }
    );

    test('presenta convergencia de orden cuatro al reducir el paso', () => {
      const res2 = simpson13({ f, a: 0, b: 1, n: 2 });
      const res4 = simpson13({ f, a: 0, b: 1, n: 4 });
      const res8 = simpson13({ f, a: 0, b: 1, n: 8 });

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

  describe('simpson38', () => {
    test.each([3, 6, 12, 24])(
      'reduce el error relativo al aumentar n=%i',
      (n) => {
        const res = simpson38({ f, a: 0, b: 1, n });

        expect(res.convergio).toBe(true);
        expect(errorRelativo(res.resultado)).toBeLessThan(1e-3);
      }
    );

    test('presenta convergencia de orden cuatro al reducir el paso', () => {
      const res3 = simpson38({ f, a: 0, b: 1, n: 3 });
      const res6 = simpson38({ f, a: 0, b: 1, n: 6 });
      const res12 = simpson38({ f, a: 0, b: 1, n: 12 });

      const error3 = errorRelativo(res3.resultado);
      const error6 = errorRelativo(res6.resultado);
      const error12 = errorRelativo(res12.resultado);

      const orden1 = error3 / error6;
      const orden2 = error6 / error12;

      expect(error6).toBeLessThan(error3);
      expect(error12).toBeLessThan(error6);

      expect(orden1).toBeGreaterThan(14);
      expect(orden1).toBeLessThan(18);
      expect(orden2).toBeGreaterThan(14);
      expect(orden2).toBeLessThan(18);
    });
  });
});

describe('simpson38 - detección de divergencia', () => {
  test('lanza ErrorDivergencia cuando la función produce Infinity', () => {
    const f = () => Infinity;

    expect(() => simpson38({
      f,
      a: 0,
      b: 1,
      n: 3
    })).toThrow(ErrorDivergencia);
  });
});