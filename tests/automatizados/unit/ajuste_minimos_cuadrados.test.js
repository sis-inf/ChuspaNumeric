import { ErrorParametros } from '../../../src/core/errores.js';

import {
  regresionLineal,
  regresionPolinomial,
} from '../../../src/analisis/ajuste_minimos_cuadrados.js';

describe('ajuste por mínimos cuadrados', () => {
  test('regresionLineal recupera pendiente e intercepto de una recta exacta', () => {
    const xs = [0, 1, 2, 3];
    const ys = [1, 3, 5, 7];

    const res = regresionLineal(xs, ys);

    expect(res.pendiente).toBeCloseTo(2, 10);
    expect(res.intercepto).toBeCloseTo(1, 10);
    expect(res.r2).toBeCloseTo(1, 10);
    expect(res.convergio).toBe(true);
    expect(res.meta.metodo).toBe('regresion-lineal');
    // La recta es y = 2x + 1
    // Para x = 4, el resultado esperado es 9.
    expect(res.prediccion(4)).toBeCloseTo(9, 10);
  });

  test('regresionPolinomial recupera los coeficientes de un polinomio conocido', () => {
    const xs = [0, 1, 2, 3];
    const ys = [1, 6, 17, 34];

    const res = regresionPolinomial(xs, ys, 2);

    expect(res.coeficientes[0]).toBeCloseTo(1, 10);
    expect(res.coeficientes[1]).toBeCloseTo(2, 10);
    expect(res.coeficientes[2]).toBeCloseTo(3, 10);
    expect(res.r2).toBeCloseTo(1, 10);
    expect(res.convergio).toBe(true);
    expect(res.meta.metodo).toBe('regresion-polinomial');
  });

  test('regresionLineal rechaza menos de dos observaciones', () => {
    expect(() => regresionLineal([1], [3])).toThrow(ErrorParametros);
    expect(() => regresionLineal([1], [3])).toThrow(
      'se necesitan al menos 2 puntos'
    );
  });

  test('regresionLineal rechaza arreglos de distinta longitud', () => {
    const xs = [1, 2, 3];
    const ys = [2, 4];

    expect(() => regresionLineal(xs, ys)).toThrow(ErrorParametros);
    expect(() => regresionLineal(xs, ys)).toThrow(
      'xs e ys deben tener la misma longitud'
    );
  });

  describe('grados, errores relativos, tolerancias y conjuntos de datos', () => {
    test('regresionPolinomial ajusta un polinomio cúbico (grado 3) con sobredeterminación', () => {
      // y = -2 + 3x - x² + 0.5x³
      const xs = [-1, 0, 1, 2, 3, 4];
      const ys = xs.map((x) => -2 + 3 * x - x * x + 0.5 * x ** 3);

      const res = regresionPolinomial(xs, ys, 3);

      expect(res.coeficientes[0]).toBeCloseTo(-2, 8);
      expect(res.coeficientes[1]).toBeCloseTo(3, 8);
      expect(res.coeficientes[2]).toBeCloseTo(-1, 8);
      expect(res.coeficientes[3]).toBeCloseTo(0.5, 8);
      expect(res.r2).toBeCloseTo(1, 8);
      expect(res.prediccion(5)).toBeCloseTo(-2 + 15 - 25 + 62.5, 8);
    });

    test('evalúa errores relativos y tolerancias en regresión lineal con datos ruidosos', () => {
      const xs = [1, 2, 3, 4, 5];
      const ys = [2.1, 3.9, 6.2, 7.8, 10.1];

      const res = regresionLineal(xs, ys);
      const prediccionEsperada = 2 * 6; // tendencia cercana a y = 2x
      const errorRelativo =
        Math.abs(res.prediccion(6) - prediccionEsperada) / prediccionEsperada;

      expect(errorRelativo).toBeLessThan(0.05);
      expect(res.r2).toBeGreaterThan(0.99);
      expect(res.r2).toBeLessThan(1);
      expect(res.desviacionError).toBeGreaterThan(0);
      expect(res.residuos).toHaveLength(xs.length);
    });

    test('compara ajuste lineal frente a polinomial de grado 2 en datos cuadráticos', () => {
      const xs = [-2, -1, 0, 1, 2];
      const ys = xs.map((x) => x * x);

      const lineal = regresionLineal(xs, ys);
      const cuadratico = regresionPolinomial(xs, ys, 2);

      // En puntos simétricos [-2..2] con y = x², la pendiente lineal es 0 y el ajuste cuadrático tiene r² = 1
      expect(lineal.pendiente).toBeCloseTo(0, 10);
      expect(lineal.r2).toBeLessThan(0.5);
      expect(cuadratico.r2).toBeCloseTo(1, 10);
      expect(Math.abs(cuadratico.prediccion(3) - 9)).toBeLessThan(1e-10);
    });
  });

  describe('parámetros inválidos, mal condicionamiento y no convergencia / desbordamiento', () => {
    test('rechaza parámetros inválidos o insuficientes en regresionLineal y regresionPolinomial', () => {
      expect(() => regresionLineal([1, 1, 1], [2, 4, 6])).toThrow(ErrorParametros);
      expect(() => regresionLineal([1, NaN], [2, 4])).toThrow(ErrorParametros);
      expect(() => regresionLineal([1, 2], [2, Infinity])).toThrow(ErrorParametros);

      expect(() => regresionPolinomial([0, 1, 2], [1, 2, 3], 0)).toThrow(ErrorParametros);
      expect(() => regresionPolinomial([0, 1, 2], [1, 2, 3], 1.5)).toThrow(ErrorParametros);
      expect(() => regresionPolinomial([0, 1], [1, 2], 2)).toThrow(ErrorParametros);
      expect(() => regresionPolinomial([1, 1, 2], [1, 2, 3], 2)).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros cuando los cálculos exceden el rango numérico representable', () => {
      const xsGrandes = [1e200, 2e200, 3e200];
      const ysGrandes = [1e200, 2e200, 3e200];

      expect(() => regresionLineal(xsGrandes, ysGrandes)).toThrow(ErrorParametros);
      expect(() => regresionPolinomial(xsGrandes, ysGrandes, 2)).toThrow(ErrorParametros);
    });

    test('detecta pérdida de precisión / mal condicionamiento en ecuaciones normales de grado alto', () => {
      // Puntos muy agrupados en un intervalo pequeño con grado 4 mal condicionan XᵀX
      const xs = [1000, 1000.0001, 1000.0002, 1000.0003, 1000.0004, 1000.0005];
      const ys = xs.map((x) => 1 + 2 * (x - 1000));

      const res = regresionPolinomial(xs, ys, 4);
      const errorRelativoPrediccion =
        Math.abs(res.prediccion(1000.001) - (1 + 2 * 0.001)) / (1 + 2 * 0.001);

      // Con mal condicionamiento en ecuaciones normales, el error relativo supera la precisión de máquina
      expect(errorRelativoPrediccion).toBeGreaterThan(1e-8);
    });
  });
});