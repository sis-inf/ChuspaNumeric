import { simpsonAdaptativo } from '../../../src/integracion/simpson_adaptativo.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('simpsonAdaptativo', () => {
  describe('precision con polinomios', () => {
    test('integra x^3 en [0, 2] con valor exacto 4', () => {
      const tolerancia = 1e-8;
      const res = simpsonAdaptativo({ f: (x) => x ** 3, a: 0, b: 2, tolerancia });

      expect(Math.abs(res.resultado - 4)).toBeLessThanOrEqual(tolerancia);
      expect(res.convergio).toBe(true);
    });

    test('integra x^4 en [0, 1] dentro de la tolerancia (valor exacto 0.2)', () => {
      const tolerancia = 1e-8;
      const res = simpsonAdaptativo({ f: (x) => x ** 4, a: 0, b: 1, tolerancia });

      expect(Math.abs(res.resultado - 0.2)).toBeLessThanOrEqual(tolerancia);
      expect(res.convergio).toBe(true);
    });
  });

  describe('funcion con variacion localizada', () => {
    // Gaussiana estrecha centrada en 0.5: su integral en [0, 1] es
    // sqrt(pi / 1000) * erf(sqrt(1000) / 2), y erf(15.8...) = 1 en doble precision.
    const f = (x) => Math.exp(-1000 * (x - 0.5) ** 2);
    const valorExacto = Math.sqrt(Math.PI / 1000);

    test('aproxima la integral dentro de la tolerancia y reporta convergencia', () => {
      const tolerancia = 1e-6;
      const res = simpsonAdaptativo({ f, a: 0, b: 1, tolerancia });

      expect(Math.abs(res.resultado - valorExacto)).toBeLessThanOrEqual(tolerancia);
      expect(res.convergio).toBe(true);
      expect(res.warnings).toBeUndefined();
      expect(res.meta.metodo).toBe('Simpson Adaptativo');
    });

    test('subdivide mas cerca del pico que en los extremos', () => {
      const res = simpsonAdaptativo({ f, a: 0, b: 1, tolerancia: 1e-6 });
      const profundidadEn = (x) =>
        Math.max(...res.iteraciones.filter((it) => it.a <= x && x <= it.b).map((it) => it.profundidad));

      expect(profundidadEn(0.5)).toBeGreaterThan(profundidadEn(0.01));
    });

    test('reporta que no convergio si se alcanza la profundidad maxima', () => {
      const res = simpsonAdaptativo({ f, a: 0, b: 1, tolerancia: 1e-10, profundidadMaxima: 1 });

      expect(res.convergio).toBe(false);
      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.mensaje).toContain('advertencia');
    });
  });

  describe('parametros invalidos', () => {
    const base = { f: (x) => x, a: 0, b: 1 };

    test('rechaza f que no es una funcion', () => {
      expect(() => simpsonAdaptativo({ ...base, f: 42 })).toThrow(ErrorParametros);
    });

    test.each([
      ['a no numerico', { a: '0' }],
      ['b no numerico', { b: null }],
      ['a no finito', { a: -Infinity }],
      ['b NaN', { b: NaN }],
      ['a igual a b', { a: 1, b: 1 }],
      ['a mayor que b', { a: 2, b: 1 }],
    ])('rechaza intervalo invalido: %s', (_caso, cambio) => {
      expect(() => simpsonAdaptativo({ ...base, ...cambio })).toThrow(ErrorParametros);
    });

    test.each([0, -1e-6, NaN, Infinity, '1e-6'])('rechaza tolerancia invalida: %p', (tolerancia) => {
      expect(() => simpsonAdaptativo({ ...base, tolerancia })).toThrow(ErrorParametros);
    });

    test.each([-1, 1.5])('rechaza profundidad maxima invalida: %p', (profundidadMaxima) => {
      expect(() => simpsonAdaptativo({ ...base, profundidadMaxima })).toThrow(ErrorParametros);
    });

    test('rechaza que f devuelva un valor no finito', () => {
      expect(() => simpsonAdaptativo({ ...base, f: () => NaN })).toThrow(ErrorParametros);
    });
  });
});
