import { simpson13 } from '../../../src/integracion/simpson-13.js';
import { simpson38 } from '../../../src/integracion/simpson-38.js';

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
