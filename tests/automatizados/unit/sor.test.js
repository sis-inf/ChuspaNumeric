import { sor } from '../../../src/lineales/sor.js';
import { gaussSeidel } from '../../../src/lineales/gauss-seidel.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

// Sistema diagonalmente dominante con solución (1, 2, 3):
// 4x1 +  x2 +  x3 = 9
//  x1 + 5x2 +  x3 = 14
//  x1 +  x2 + 4x3 = 15
const A = [
  [4, 1, 1],
  [1, 5, 1],
  [1, 1, 4]
];
const b = [9, 14, 15];

describe('sor - sobre-relajación sucesiva para sistemas lineales', () => {
  describe('convergencia', () => {
    test('resuelve sistema 3x3 con solución analítica conocida', () => {
      const tolerancia = 1e-8;

      const res = sor({ A, b, omega: 1.1, tolerancia });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado[0] - 1)).toBeLessThan(1e-6);
      expect(Math.abs(res.resultado[1] - 2)).toBeLessThan(1e-6);
      expect(Math.abs(res.resultado[2] - 3)).toBeLessThan(1e-6);
    });

    test('con omega = 1 reproduce el comportamiento de Gauss-Seidel', () => {
      const resSor = sor({ A, b, omega: 1 });
      const resGs = gaussSeidel({ A, b });

      expect(resSor.convergio).toBe(resGs.convergio);
      expect(resSor.iteraciones).toHaveLength(resGs.iteraciones.length);
      resSor.iteraciones.forEach((it, k) => {
        expect(it.x).toEqual(resGs.iteraciones[k].x);
        expect(it.error).toBe(resGs.iteraciones[k].error);
      });
      expect(resSor.resultado).toEqual(resGs.resultado);
    });

    test('informa no convergencia al alcanzar maxIter', () => {
      const res = sor({ A, b, omega: 1.2, tolerancia: 1e-15, maxIter: 2 });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(2);
    });
  });

  describe('contrato de resultado', () => {
    test('devuelve la forma uniforme del contrato', () => {
      const res = sor({ A, b, omega: 1.1 });

      expect(res).toHaveProperty('resultado');
      expect(res).toHaveProperty('iteraciones');
      expect(res).toHaveProperty('convergio');
      expect(res).toHaveProperty('mensaje');
      expect(res).toHaveProperty('meta');
      expect(res.meta.metodo).toBe('sor');
      expect(res.meta.parametros.omega).toBe(1.1);
    });

    test('cada iteración registra n, x y error', () => {
      const res = sor({ A, b, omega: 1.1 });

      res.iteraciones.forEach((it, i) => {
        expect(it.n).toBe(i + 1);
        expect(it.x).toHaveLength(3);
        expect(typeof it.error).toBe('number');
      });
    });
  });

  describe('validaciones', () => {
    test('lanza ErrorParametros si la matriz no es cuadrada', () => {
      expect(() =>
        sor({
          A: [
            [1, 2, 3],
            [4, 5, 6]
          ],
          b: [1, 2],
          omega: 1.1
        })
      ).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si b tiene dimensión incompatible', () => {
      expect(() => sor({ A, b: [1, 2], omega: 1.1 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si x0 tiene dimensión incompatible', () => {
      expect(() => sor({ A, b, x0: [0, 0], omega: 1.1 })).toThrow(ErrorParametros);
    });

    test.each([0, 2, -0.5, 2.5])('lanza ErrorParametros si omega = %p está fuera de (0, 2)', (omega) => {
      expect(() => sor({ A, b, omega })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si omega no es un número', () => {
      expect(() => sor({ A, b, omega: '1.2' })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si la tolerancia no es válida', () => {
      expect(() => sor({ A, b, omega: 1.1, tolerancia: -1 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si maxIter no es válido', () => {
      expect(() => sor({ A, b, omega: 1.1, maxIter: 0 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorDominio si hay un cero en la diagonal', () => {
      expect(() =>
        sor({
          A: [
            [0, 1],
            [1, 2]
          ],
          b: [1, 3],
          omega: 1.1
        })
      ).toThrow(ErrorDominio);
    });
  });

  describe('exportación', () => {
    test('la función se exporta desde el punto de entrada principal', async () => {
      const { sor: sorDesdeIndex } = await import('../../../src/index.js');

      expect(sorDesdeIndex).toBe(sor);
    });
  });
});
