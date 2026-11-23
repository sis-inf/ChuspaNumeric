import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';

describe('newton-raphson', () => {
  const f  = (x) => x ** 2 - 2;
  const df = (x) => 2 * x;

  test('encuentra raíz de x^2 - 2 desde x0=1 con tolerancia 1e-5', () => {
    const res = newtonRaphson({ f, df, x0: 1, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(1.4142, 4);
    expect(res.iteraciones).toBeInstanceOf(Array);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.meta.metodo).toBe('newton-raphson');
  });

  test('lanza error si los parámetros son inválidos', () => {
    expect(() => newtonRaphson(null)).toThrow();
    expect(() => newtonRaphson({})).toThrow();
    expect(() => newtonRaphson({ f, df: null, x0: 1 })).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeño', () => {
    const res = newtonRaphson({ f, df, x0: 10, tolerancia: 1e-12, maxIter: 1 });
    expect(res.convergio).toBe(false);
  });

  test('encuentra raíz en caso exitoso adicional (x^3 - 27 = 0)', () => {
    const f3 = (x) => x ** 3 - 27;
    const df3 = (x) => 3 * (x ** 2);

    const res = newtonRaphson({ f: f3, df: df3, x0: 5, tolerancia: 1e-5 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(3, 4);
  });

  describe('Precisión y órdenes de convergencia', () => {
      test('reduce el error relativo con tolerancias más estrictas', () => {
      const raizExacta = Math.sqrt(2);
      const tolerancias = [1e-2, 1e-4, 1e-8];
      const erroresRelativos = [];

      tolerancias.forEach(tolerancia => {
        const res = newtonRaphson({
          f,
          df,
          x0: 1,
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

    test('presenta convergencia cuadrática para una raíz simple', () => {
      const raizExacta = Math.sqrt(2);

      const res = newtonRaphson({
        f,
        df,
        x0: 1,
        tolerancia: 1e-12
      });

      const errores = res.iteraciones.map(iteracion =>
        Math.abs(iteracion.x - raizExacta)
      );

      expect(res.convergio).toBe(true);
      expect(errores.length).toBeGreaterThan(2);

      // En convergencia cuadrática, el error disminuye aproximadamente
      // en proporción al cuadrado del error de la iteración anterior.
      expect(errores[2]).toBeLessThan(errores[1] ** 2);
    });

    test('presenta convergencia lineal para una raíz múltiple', () => {
      const fMultiple = x => (x - 2) ** 2;
      const dfMultiple = x => 2 * (x - 2);

      const res = newtonRaphson({
        f: fMultiple,
        df: dfMultiple,
        x0: 3,
        tolerancia: 1e-8
      });

      const errores = res.iteraciones.map(iteracion =>
        Math.abs(iteracion.x - 2)
      );

      const razonConvergencia =
        errores[errores.length - 1] / errores[errores.length - 2];

      expect(res.convergio).toBe(true);
      expect(razonConvergencia).toBeCloseTo(0.5, 6);
    });

    test('detecta resultados no finitos durante las iteraciones', () => {
      expect(() => {
        newtonRaphson({
          f: () => Infinity,
          df: () => 1,
          x0: 1
        });
      }).toThrow();
    });

    test('detecta una derivada nula durante el cálculo', () => {
      expect(() => {
        newtonRaphson({
          f: x => x ** 2 + 1,
          df: x => 2 * x,
          x0: 0
        });
      }).toThrow(/derivada es cero/i);
    });
  });
});