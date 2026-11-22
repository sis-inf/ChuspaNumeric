import gaussLegendre from '../../../src/integracion/gauss_legendre.js';

describe('gaussLegendre - cuadratura de Gauss-Legendre', () => {
  // Propiedad: Gauss-Legendre con n puntos es exacta para polinomios de grado <= 2n-1

  describe('con 2 puntos (exacto para polinomios grado <= 3)', () => {
    test('integra f(x) = x (grado 1) exactamente en [-1, 1]', () => {
      const f = (x) => x;
      const valorExacto = 0; // ∫₋₁¹ x dx = 0
      const resultado = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x² (grado 2) exactamente en [-1, 1]', () => {
      const f = (x) => x * x;
      const valorExacto = 2 / 3; // ∫₋₁¹ x² dx = 2/3
      const resultado = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x³ (grado 3) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 3;
      const valorExacto = 0; // ∫₋₁¹ x³ dx = 0
      const resultado = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x² en [0, 1] (transformación de intervalo)', () => {
      const f = (x) => x * x;
      const valorExacto = 1 / 3; // ∫₀¹ x² dx = 1/3
      const resultado = gaussLegendre(f, 0, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });
  });

  describe('con 3 puntos (exacto para polinomios grado <= 5)', () => {
    test('integra f(x) = x⁴ (grado 4) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 4;
      const valorExacto = 2 / 5; // ∫₋₁¹ x⁴ dx = 2/5
      const resultado = gaussLegendre(f, -1, 1, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x⁵ (grado 5) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 5;
      const valorExacto = 0; // ∫₋₁¹ x⁵ dx = 0
      const resultado = gaussLegendre(f, -1, 1, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra polinomio mixto en [0, 2]', () => {
      // f(x) = x³ + 2x² + x + 1
      const f = (x) => x ** 3 + 2 * x ** 2 + x + 1;
      // ∫₀² (x³ + 2x² + x + 1) dx = [x⁴/4 + 2x³/3 + x²/2 + x]₀² = 40/3
      const valorExacto = 40 / 3;
      const resultado = gaussLegendre(f, 0, 2, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });
  });

  describe('con 4 y 5 puntos (grados altos, tamaños de intervalo y tolerancias)', () => {
    test('integra x⁷ exactamente con 4 puntos en [-1, 1]', () => {
      const f = (x) => x ** 7;
      const resultado = gaussLegendre(f, -1, 1, 4);

      expect(resultado).toBeCloseTo(0, 13);
    });

    test('integra x⁹ exactamente con 5 puntos en [-1, 1]', () => {
      const f = (x) => x ** 9;
      const resultado = gaussLegendre(f, -1, 1, 5);

      expect(resultado).toBeCloseTo(0, 12);
    });

    test('evalúa distintos tamaños de paso/intervalo y tolerancias para e^x', () => {
      const f = (x) => Math.exp(x);

      // Intervalo pequeño [0, 0.5] con tolerancia estricta
      const exactoPequeno = Math.exp(0.5) - Math.exp(0);
      const resPequeno = gaussLegendre(f, 0, 0.5, 4);
      const errorRelPequeno = Math.abs(resPequeno - exactoPequeno) / Math.abs(exactoPequeno);
      expect(errorRelPequeno).toBeLessThan(1e-9);

      // Intervalo más amplio [0, 4] con tolerancia más amplia (4 puntos)
      const exactoAmplio = Math.exp(4) - Math.exp(0);
      const resAmplio = gaussLegendre(f, 0, 4, 4);
      const errorRelAmplio = Math.abs(resAmplio - exactoAmplio) / Math.abs(exactoAmplio);
      expect(errorRelAmplio).toBeLessThan(1e-2);
    });

    test('disminuye el error relativo al aumentar la cantidad de puntos en [0, 3]', () => {
      const f = (x) => Math.exp(x);
      const valorExacto = Math.exp(3) - 1;

      const err2 = Math.abs(gaussLegendre(f, 0, 3, 2) - valorExacto) / valorExacto;
      const err3 = Math.abs(gaussLegendre(f, 0, 3, 3) - valorExacto) / valorExacto;
      const err4 = Math.abs(gaussLegendre(f, 0, 3, 4) - valorExacto) / valorExacto;
      const err5 = Math.abs(gaussLegendre(f, 0, 3, 5) - valorExacto) / valorExacto;

      expect(err3).toBeLessThan(err2);
      expect(err4).toBeLessThan(err3);
      expect(err5).toBeLessThan(err4);
    });
  });

  describe('casos de no convergencia / singularidad y errores', () => {
    test('puntos inválido lanza error', () => {
      const f = (x) => x * x;

      expect(() => gaussLegendre(f, 0, 1, 1)).toThrow('puntos debe ser 2, 3, 4 o 5');
      expect(() => gaussLegendre(f, 0, 1, 6)).toThrow('puntos debe ser 2, 3, 4 o 5');
      expect(() => gaussLegendre(f, 0, 1, 0)).toThrow('puntos debe ser 2, 3, 4 o 5');
    });

    test('más puntos dan mejor precisión para polinomios de alto grado', () => {
      // f(x) = x⁶ (grado 6) - fuera del rango de exactitud para 2 y 3 puntos
      const f = (x) => x ** 6;
      const valorExacto = 2 / 7; // ∫₋₁¹ x⁶ dx = 2/7

      const resultado2Puntos = gaussLegendre(f, -1, 1, 2);
      const resultado3Puntos = gaussLegendre(f, -1, 1, 3);

      const error2Puntos = Math.abs(resultado2Puntos - valorExacto);
      const error3Puntos = Math.abs(resultado3Puntos - valorExacto);

      // 3 puntos deben ser más precisos que 2 puntos para polinomios de alto grado
      expect(error3Puntos).toBeLessThan(error2Puntos);
    });

    test('detecta no convergencia / divergencia en singularidades o valores no finitos', () => {
      // Singularidad en x = 0 dentro de [-1, 1]: ∫₋₁¹ (1/x) dx es divergente en sentido ordinario
      const singular = (x) => 1 / x;
      const resSingular = gaussLegendre(singular, -1, 1, 3);
      expect(Number.isFinite(resSingular)).toBe(false);

      // Función que produce NaN en parte del dominio (ej. raíz cuadrada de negativo)
      const dominioInvalido = (x) => Math.sqrt(x);
      const resNaN = gaussLegendre(dominioInvalido, -2, 1, 2);
      expect(Number.isNaN(resNaN)).toBe(true);
    });
  });
});