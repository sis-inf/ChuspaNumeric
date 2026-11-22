import { secante } from '../../../src/no-lineales/secante.js';

describe('secante', () => {
  const f = (x) => x ** 3 - x - 2;

  test('encuentra raíz de x^3 - x - 2 desde x0=1, x1=2 con tolerancia 1e-5', () => {
    const res = secante({ f, x0: 1, x1: 2, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(1.5214, 4);
    expect(res.iteraciones).toBeInstanceOf(Array);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.meta.metodo).toBe('secante');
  });

  test('lanza error con parámetros inválidos', () => {
    expect(() => secante(null)).toThrow();
    expect(() => secante({})).toThrow();
    expect(() => secante({ f: null, x0: 1, x1: 2 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const res = secante({ f, x0: 1, x1: 2, tolerancia: 1e-12, maxIter: 1 });
    expect(res.convergio).toBe(false);
  });

  test('encuentra raíz en caso exitoso adicional (x^2 - 4 = 0)', () => {
    const f2 = (x) => x ** 2 - 4;
    const res = secante({ f: f2, x0: 0, x1: 3, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 4);
  });

  describe('precisión y convergencia', () => {
    test('mejora la precisión al utilizar tolerancias más estrictas', () => {
      const tolerancias = [1e-2, 1e-5, 1e-10];
      const resultados = [];

      tolerancias.forEach(tolerancia => {
        const res = secante({
          f,
          x0: 1,
          x1: 2,
          tolerancia,
          maxIter: 100
        });

        expect(res.convergio).toBe(true);
        resultados.push(Math.abs(f(res.resultado)));
      });

      expect(resultados[1]).toBeLessThan(resultados[0]);
      expect(resultados[2]).toBeLessThan(resultados[1]);
    });

    test('mantiene un error relativo pequeño respecto a la raíz conocida', () => {
      const raizExacta = 1.5213797068045676;

      const res = secante({
        f,
        x0: 1,
        x1: 2,
        tolerancia: 1e-12,
        maxIter: 100
      });

      const errorRelativo =
        Math.abs(res.resultado - raizExacta) / Math.abs(raizExacta);

      expect(res.convergio).toBe(true);
      expect(errorRelativo).toBeLessThan(1e-10);
    });

    test('reduce el error entre iteraciones durante la convergencia', () => {
      const res = secante({
        f,
        x0: 1,
        x1: 2,
        tolerancia: 1e-12,
        maxIter: 100
      });

      expect(res.convergio).toBe(true);

      const errores = res.iteraciones.map(iteracion => iteracion.error);

      expect(errores.length).toBeGreaterThan(1);
      expect(errores[errores.length - 1]).toBeLessThan(errores[0]);
    });

    test('no converge cuando el máximo de iteraciones es insuficiente', () => {
      const res = secante({
        f,
        x0: 1,
        x1: 2,
        tolerancia: 1e-15,
        maxIter: 1
      });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(1);
    });

    test('detecta división por cero cuando las evaluaciones iniciales coinciden', () => {
      const funcionConstante = () => 5;

      expect(() => {
        secante({
          f: funcionConstante,
          x0: 1,
          x1: 2
        });
      }).toThrow(/división por cero/i);
    });

    test('detecta resultados no finitos durante el cálculo', () => {
      const funcionExtrema = (x) => x === 0 ? -1e200 : 1e200;

      expect(() => {
        secante({
          f: funcionExtrema,
          x0: 0,
          x1: 1e200,
          tolerancia: 1e-10,
          maxIter: 1
        });
      }).toThrow(/resultado no es finito|divergió/i);
    });
  });
});