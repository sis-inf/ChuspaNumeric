import { biseccion } from '../../../src/no-lineales/biseccion.js';
import {
  ErrorParametros,
  ErrorDivergencia
} from '../../../src/core/errores.js';

describe('biseccion - intervalo inválido', () => {
  test('lanza ErrorParametros cuando f(a)·f(b) >= 0 (x^2+1 no tiene raíz real)', () => {
    const f = (x) => x ** 2 + 1; // siempre positiva, sin cambio de signo

    expect(() => biseccion({ f, a: 0, b: 1, tolerancia: 1e-5 }))
      .toThrow(ErrorParametros);
  });

  test('el mensaje de error menciona el problema de signo', () => {
    const f = (x) => x ** 2 + 1;

    expect(() => biseccion({ f, a: 0, b: 1 }))
      .toThrow(/f\(a\) · f\(b\) >= 0/);
  });

  describe('Precisión y convergencia', () => {
    const f = x => x ** 2 - 2;
    const raizExacta = Math.sqrt(2);

    test('reduce el error relativo con tolerancias más estrictas', () => {
      const tolerancias = [1e-2, 1e-4, 1e-6];
      const erroresRelativos = [];

      tolerancias.forEach(tolerancia => {
        const res = biseccion({
          f,
          a: 1,
          b: 2,
          tolerancia
        });

        const errorRelativo =
          Math.abs(res.resultado - raizExacta) / Math.abs(raizExacta);

        expect(res.convergio).toBe(true);
        erroresRelativos.push(errorRelativo);
      });

      expect(erroresRelativos[1]).toBeLessThan(erroresRelativos[0]);
      expect(erroresRelativos[2]).toBeLessThan(erroresRelativos[1]);
    });

    test('mantiene la precisión con diferentes anchos de intervalo inicial', () => {
      const intervalos = [
        { a: 1, b: 2 },
        { a: 0, b: 2 },
        { a: 1, b: 3 }
      ];

      intervalos.forEach(({ a, b }) => {
        const res = biseccion({
          f,
          a,
          b,
          tolerancia: 1e-7
        });

        const errorAbsoluto = Math.abs(res.resultado - raizExacta);

        expect(res.convergio).toBe(true);
        expect(errorAbsoluto).toBeLessThan(1e-7);
      });
    });

    test('registra errores estimados decrecientes hasta alcanzar la tolerancia', () => {
      const tolerancia = 1e-6;

      const res = biseccion({
        f,
        a: 1,
        b: 2,
        tolerancia
      });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones.length).toBeGreaterThan(1);

      for (let i = 1; i < res.iteraciones.length; i++) {
        expect(res.iteraciones[i].error)
          .toBeLessThan(res.iteraciones[i - 1].error);
      }

      const ultimoError =
        res.iteraciones[res.iteraciones.length - 1].error;

      expect(ultimoError).toBeLessThan(tolerancia);
    });

    test('detecta la no convergencia al alcanzar el máximo de iteraciones', () => {
      const res = biseccion({
        f,
        a: 1,
        b: 2,
        tolerancia: 1e-12,
        maxIter: 1
      });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(1);
    });

    test('detecta divergencia cuando el resultado no es finito', () => {
      const funcion = x => x - 1.2e308;

      expect(() => {
        biseccion({
          f: funcion,
          a: 1e308,
          b: 1.7e308,
          tolerancia: 1e-6
        });
      }).toThrow(ErrorDivergencia);
    });
  });
});