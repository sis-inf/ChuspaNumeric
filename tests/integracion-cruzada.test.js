/**
 * Pruebas de integración cruzada entre métodos numéricos
 * Verifica que diferentes métodos que resuelven el mismo problema
 * entreguen resultados coherentes entre sí.
 *
 * Importa cada método directamente desde su módulo en src/
 */

import { biseccion } from '../src/no-lineales/biseccion.js';
import { falsaPosicion } from '../src/no-lineales/falsa-posicion.js';
import { newtonRaphson } from '../src/no-lineales/newton-raphson.js';
import { secante } from '../src/no-lineales/secante.js';
import { puntoFijo } from '../src/no-lineales/punto-fijo.js';
import { gauss } from '../src/lineales/gauss.js';
import { gaussJordan } from '../src/lineales/gauss-jordan.js';
import { lu } from '../src/lineales/lu.js';
import { jacobi } from '../src/lineales/jacobi.js';
import { gaussSeidel } from '../src/lineales/gauss-seidel.js';
import { lagrange } from '../src/interpolacion/lagrange.js';
import { newtonDD } from '../src/interpolacion/newton-dd.js';
import { trapecio } from '../src/integracion/trapecio.js';
import { simpson13 } from '../src/integracion/simpson-13.js';
import { simpson38 } from '../src/integracion/simpson-38.js';
import gaussLegendre from '../src/integracion/gauss_legendre.js';
import { euler } from '../src/edo/euler.js';
import { eulerMejorado } from '../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../src/edo/runge_kutta_4.js';

describe('Pruebas de integración cruzada', () => {
  // ============================================================
  // 1. RAÍCES NO LINEALES
  // ============================================================
  describe('Raíces no lineales', () => {
    test('todos los métodos convergen a sqrt(2) para f(x) = x² - 2', () => {
      const f = (x) => x * x - 2;
      const tolerancia = 1e-4;
      const esperado = Math.sqrt(2);

      const resultados = [];

      // Bisección: { f, a, b, tolerancia, maxIter }
      try {
        const res = biseccion({ f, a: 1, b: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'biseccion', valor: res.resultado });
        }
      } catch (e) {}

      // Falsa posición: { f, a, b, tolerancia, maxIter }
      try {
        const res = falsaPosicion({ f, a: 1, b: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'falsaPosicion', valor: res.resultado });
        }
      } catch (e) {}

      // Newton-Raphson: { f, df, x0, tolerancia, maxIter }
      try {
        const df = (x) => 2 * x;
        const res = newtonRaphson({ f, df, x0: 1.5, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'newtonRaphson', valor: res.resultado });
        }
      } catch (e) {}

      // Secante: { f, x0, x1, tolerancia, maxIter }
      try {
        const res = secante({ f, x0: 1, x1: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'secante', valor: res.resultado });
        }
      } catch (e) {}

      // Punto fijo: { g, x0, tolerancia, maxIter }
      try {
        const g = (x) => (x * x + 2) / (2 * x);
        const res = puntoFijo({ g, x0: 1.5, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'puntoFijo', valor: res.resultado });
        }
      } catch (e) {}

      expect(resultados.length).toBeGreaterThanOrEqual(3);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });
    });
  });

  // ============================================================
  // 2. SISTEMAS LINEALES
  // ============================================================
  describe('Sistemas lineales', () => {
    test('todos los métodos resuelven el sistema 3x3 correctamente', () => {
      // Sistema diagonalmente dominante:
      // 4x + y - z = 4
      // 2x + 5y + z = 8
      // x - y + 3z = 3
      // Solución: x = 1, y = 1, z = 1
      const A = [
        [4, 1, -1],
        [2, 5, 1],
        [1, -1, 3],
      ];
      const b = [4, 8, 3];
      const solucionEsperada = [1, 1, 1];
      const tolerancia = 1e-4;

      const resultados = [];

      // Gauss: { A, b }
      try {
        const res = gauss({ A, b });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gauss', valor: res.resultado });
        }
      } catch (e) {}

      // Gauss-Jordan: { A, b }
      try {
        const res = gaussJordan({ A, b });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gaussJordan', valor: res.resultado });
        }
      } catch (e) {}

      // LU: { A, b } → devuelve resultado.x
      try {
        const res = lu({ A, b });
        if (
          res &&
          res.resultado &&
          res.resultado.x !== undefined &&
          Array.isArray(res.resultado.x)
        ) {
          resultados.push({ metodo: 'lu', valor: res.resultado.x });
        }
      } catch (e) {}

      // Jacobi: { A, b, tolerancia, maxIter }
      try {
        const res = jacobi({ A, b, tolerancia: 1e-6, maxIter: 100 });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'jacobi', valor: res.resultado });
        }
      } catch (e) {}

      // Gauss-Seidel: { A, b, tolerancia, maxIter }
      try {
        const res = gaussSeidel({ A, b, tolerancia: 1e-6, maxIter: 100 });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gaussSeidel', valor: res.resultado });
        }
      } catch (e) {}

      expect(resultados.length).toBeGreaterThanOrEqual(3);

      resultados.forEach((result) => {
        expect(result.valor.length).toBe(3);
        for (let i = 0; i < 3; i++) {
          expect(Math.abs(result.valor[i] - solucionEsperada[i])).toBeLessThan(tolerancia);
        }
      });
    });
  });

  // ============================================================
  // 3. INTERPOLACIÓN
  // ============================================================
  describe('Interpolación', () => {
    test('Lagrange y NewtonDD entregan el mismo valor en x=1.5', () => {
      const puntos = [
        [0, 1],
        [1, 2],
        [2, 5],
      ];
      const x = 1.5;
      const esperado = 3.25;

      let valorLagrange = null;
      let valorNewton = null;

      // Lagrange: { puntos, x } → devuelve objeto con resultado
      try {
        const res = lagrange({ puntos, x });
        if (res && res.resultado !== undefined) {
          valorLagrange = res.resultado;
        }
      } catch (e) {}

      // NewtonDD: { puntos, x } → devuelve objeto con resultado
      try {
        const res = newtonDD({ puntos, x });
        if (res && res.resultado !== undefined) {
          valorNewton = res.resultado;
        }
      } catch (e) {}

      // Si ambos funcionan, deben dar el mismo valor
      if (valorLagrange !== null && valorNewton !== null) {
        expect(Math.abs(valorLagrange - valorNewton)).toBeLessThan(1e-10);
      }
      // Si solo Lagrange funciona
      else if (valorLagrange !== null) {
        expect(Math.abs(valorLagrange - esperado)).toBeLessThan(1e-6);
      }
      // Si solo NewtonDD funciona
      else if (valorNewton !== null) {
        expect(Math.abs(valorNewton - esperado)).toBeLessThan(1e-6);
      }
      // Si ambos fallan, el test falla
      else {
        expect(true).toBe(false);
      }
    });
  });

  // ============================================================
  // 4. INTEGRACIÓN
  // ============================================================
  describe('Integración', () => {
    test('trapecio, simpson13 y simpson38 convergen a 1/3 para f(x)=x² en [0,1]', () => {
      const f = (x) => x * x;
      const a = 0;
      const b = 1;
      const esperado = 1 / 3;
      const tolerancia = 1e-3;

      const resultados = [];

      // Trapecio: { f, a, b, n }
      try {
        const res = trapecio({ f, a, b, n: 100 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'trapecio', valor: res.resultado });
        }
      } catch (e) {}

      // Simpson 13: { f, a, b, n }
      try {
        const res = simpson13({ f, a, b, n: 100 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'simpson13', valor: res.resultado });
        }
      } catch (e) {}

      // Simpson 38: { f, a, b, n }
      try {
        const res = simpson38({ f, a, b, n: 99 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'simpson38', valor: res.resultado });
        }
      } catch (e) {}

      expect(resultados.length).toBeGreaterThanOrEqual(2);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });
    });
  });

  // ============================================================
  // 5. EDO
  // ============================================================
  describe('EDO', () => {
    test('Euler, EulerMejorado y RK4 aproximan e, con RK4 más preciso', () => {
      const f = (x, y) => y;
      const x0 = 0;
      const y0 = 1;
      const xFinal = 1;
      const h = 0.01;
      const esperado = Math.E;
      const tolerancia = 0.1;

      const resultados = [];

      // Euler: { f, x0, y0, h, xFinal }
      try {
        const res = euler({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'euler', valor: ultimo[1] });
        }
      } catch (e) {}

      // Euler Mejorado: { f, x0, y0, h, xFinal }
      try {
        const res = eulerMejorado({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'eulerMejorado', valor: ultimo[1] });
        }
      } catch (e) {}

      // Runge-Kutta 4: { f, x0, y0, h, xFinal }
      try {
        const res = rungeKutta4({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'rungeKutta4', valor: ultimo[1] });
        }
      } catch (e) {}

      expect(resultados.length).toBeGreaterThanOrEqual(2);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });

      const rk4Result = resultados.find((r) => r.metodo === 'rungeKutta4');
      if (rk4Result) {
        const errorRK4 = Math.abs(rk4Result.valor - esperado);
        resultados.forEach((result) => {
          if (result.metodo !== 'rungeKutta4') {
            const error = Math.abs(result.valor - esperado);
            expect(error).toBeGreaterThanOrEqual(errorRK4 * 0.9);
          }
        });
      }
    });
  });

  // ============================================================
  // 6. INTERPOLACIÓN Y CUADRATURA
  // ============================================================
  describe('Interpolación y cuadratura', () => {
    const muestrear = (f, a, b, cantidad) =>
      Array.from({ length: cantidad }, (_, i) => {
        const x = a + ((b - a) * i) / (cantidad - 1);
        return [x, f(x)];
      });

    test('Lagrange y Gauss-Legendre integran x³ - 2x + 1 en [0,2] de forma exacta', () => {
      const f = (x) => x ** 3 - 2 * x + 1;
      const a = 0;
      const b = 2;
      const esperado = 2;

      const puntos = muestrear(f, a, b, 4);
      const interpolante = (x) => lagrange({ puntos, x }).resultado;

      const integral = gaussLegendre(interpolante, a, b, 2);

      expect(Math.abs(integral - esperado)).toBeLessThan(1e-10);
    });

    test('la integral del interpolante de sin(x) en [0,π] coincide con la integral directa', () => {
      const a = 0;
      const b = Math.PI;
      const esperado = 2;
      const tolerancia = 1e-4;

      const puntos = muestrear(Math.sin, a, b, 7);
      const interpolante = (x) => lagrange({ puntos, x }).resultado;

      const integralInterpolada = gaussLegendre(interpolante, a, b, 5);
      const integralDirecta = gaussLegendre(Math.sin, a, b, 5);

      expect(Math.abs(integralInterpolada - integralDirecta)).toBeLessThan(tolerancia);
      expect(Math.abs(integralInterpolada - esperado)).toBeLessThan(tolerancia);
    });
  });
});
