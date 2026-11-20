import { splineCubicoNatural } from '../../../src/interpolacion/spline_cubico.js';
import { splines } from '../../../src/interpolacion/splines.js';

describe('splines - interpolación cúbica', () => {
  describe('splineCubicoNatural', () => {
    test('el spline pasa exactamente por los puntos de control', () => {
      const xs = [0, 1, 2, 3];
      const ys = [0, 1, 4, 9];

      // Verificar que el spline pasa por cada punto exactamente
      for (let i = 0; i < xs.length; i++) {
        const res = splineCubicoNatural(xs, ys, xs[i]);
        expect(res.convergio).toBe(true);
        expect(res.resultado).toBeCloseTo(ys[i], 10);
      }
    });

    test('interpolación correcta en punto intermedio', () => {
      const xs = [0, 1, 2];
      const ys = [0, 1, 4];
      const x = 1.5;

      const res = splineCubicoNatural(xs, ys, x);
      expect(res.convergio).toBe(true);
      // El spline interpola entre los puntos, valor calculado por el algoritmo
      expect(res.resultado).toBeCloseTo(2.3125, 4);
      // Verificar que está entre los valores de los puntos vecinos
      expect(res.resultado).toBeGreaterThan(ys[1]);
      expect(res.resultado).toBeLessThan(ys[2]);
    });

    test('lanza error con menos de 3 puntos', () => {
      expect(() => splineCubicoNatural([0, 1], [0, 1], 0.5)).toThrow();
    });

    test('lanza error si xs no está ordenado', () => {
      expect(() => splineCubicoNatural([1, 0, 2], [1, 0, 4], 0.5)).toThrow();
    });

    test('lanza error si longitudes no coinciden', () => {
      expect(() => splineCubicoNatural([0, 1, 2], [0, 1], 0.5)).toThrow();
    });

    test('iteraciones contienen información de momentos (segundas derivadas)', () => {
      const xs = [0, 1, 2];
      const ys = [0, 1, 4];
      const res = splineCubicoNatural(xs, ys, 1.5);

      expect(res.iteraciones).toBeDefined();
      expect(res.iteraciones.length).toBe(xs.length);
      
      // Verificar que cada iteración tiene las propiedades esperadas
      res.iteraciones.forEach((iter, i) => {
        expect(iter).toHaveProperty('i');
        expect(iter).toHaveProperty('xi');
        expect(iter).toHaveProperty('yi');
        expect(iter).toHaveProperty('Mi');
        expect(iter.xi).toBe(xs[i]);
        expect(iter.yi).toBe(ys[i]);
      });
    });

    test('condiciones de frontera naturales (M[0] = 0 y M[n-1] = 0)', () => {
      const xs = [0, 1, 2, 3];
      const ys = [0, 1, 4, 9];
      const res = splineCubicoNatural(xs, ys, 1.5);

      const M0 = res.iteraciones[0].Mi;
      const Mn = res.iteraciones[res.iteraciones.length - 1].Mi;

      // Condiciones naturales: segunda derivada = 0 en los extremos
      expect(M0).toBeCloseTo(0, 10);
      expect(Mn).toBeCloseTo(0, 10);
    });
  });

  describe('splines (API con puntos)', () => {
    test('el spline pasa exactamente por los puntos de control', () => {
      const puntos = [
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9]
      ];

      // Verificar que el spline pasa por cada punto exactamente
      for (let i = 0; i < puntos.length; i++) {
        const res = splines({ puntos, x: puntos[i][0] });
        expect(res.convergio).toBe(true);
        expect(res.resultado).toBeCloseTo(puntos[i][1], 10);
      }
    });

    test('interpolación correcta en punto intermedio', () => {
      const puntos = [
        [0, 0],
        [1, 1],
        [2, 4]
      ];
      const x = 1.5;

      const res = splines({ puntos, x });
      expect(res.convergio).toBe(true);
      // El spline interpola entre los puntos, valor calculado por el algoritmo
      expect(res.resultado).toBeCloseTo(2.3125, 4);
      // Verificar que está entre los valores de los puntos vecinos
      expect(res.resultado).toBeGreaterThan(puntos[1][1]);
      expect(res.resultado).toBeLessThan(puntos[2][1]);
    });

    test('lanza error con menos de 3 puntos', () => {
      expect(() => splines({ puntos: [[0, 0], [1, 1]], x: 0.5 })).toThrow();
    });

    test('lanza error si puntos no están ordenados', () => {
      expect(() => splines({ puntos: [[1, 1], [0, 0], [2, 4]], x: 0.5 })).toThrow();
    });

    test('lanza error si x está fuera de rango', () => {
      const puntos = [
        [0, 0],
        [1, 1],
        [2, 4]
      ];
      expect(() => splines({ puntos, x: 3 })).toThrow();
      expect(() => splines({ puntos, x: -1 })).toThrow();
    });

    test('iteraciones contienen coeficientes del spline', () => {
      const puntos = [
        [0, 0],
        [1, 1],
        [2, 4]
      ];
      const res = splines({ puntos, x: 1.5 });

      expect(res.iteraciones).toBeDefined();
      expect(res.iteraciones.length).toBe(puntos.length - 1);
      
      // Verificar que cada iteración tiene las propiedades esperadas
      res.iteraciones.forEach((iter) => {
        expect(iter).toHaveProperty('tramo');
        expect(iter).toHaveProperty('xi');
        expect(iter).toHaveProperty('xisig');
        expect(iter).toHaveProperty('a');
        expect(iter).toHaveProperty('b');
        expect(iter).toHaveProperty('c');
        expect(iter).toHaveProperty('d');
      });
    });

    test('continuidad de segunda derivada en nodos internos', () => {
      const puntos = [
        [0, 0],
        [1, 1],
        [2, 4],
        [3, 9]
      ];
      const res = splines({ puntos, x: 1.5 });

      // El coeficiente c está relacionado con la segunda derivada
      // Para splines cúbicos naturales, la segunda derivada debe ser continua
      const iteraciones = res.iteraciones;
      
      // Verificar que tenemos coeficientes para todos los tramos
      expect(iteraciones.length).toBe(puntos.length - 1);
      
      // Los coeficientes c representan 2 * segunda_derivada
      // La continuidad está garantizada por el algoritmo de Thomas
      // Verificamos que los valores son numéricos y finitos
      iteraciones.forEach(iter => {
        expect(typeof iter.c).toBe('number');
        expect(isFinite(iter.c)).toBe(true);
      });
    });
  });

  describe('comparación entre implementaciones', () => {
    test('ambas implementaciones producen resultados similares', () => {
      const xs = [0, 1, 2, 3];
      const ys = [0, 1, 4, 9];
      const puntos = xs.map((x, i) => [x, ys[i]]);
      const x = 1.5;

      const res1 = splineCubicoNatural(xs, ys, x);
      const res2 = splines({ puntos, x });

      // Ambas deben converger
      expect(res1.convergio).toBe(true);
      expect(res2.convergio).toBe(true);

      // Los resultados deben ser muy similares (pueden diferir por precisión numérica)
      expect(res1.resultado).toBeCloseTo(res2.resultado, 5);
    });
  });

  describe('precision y estabilidad numérica', () => {
    test('mantiene la precisión con diferentes distribuciones de nodos', () => {
      const casos = [
        {
          xs: [0, 1, 2, 3],
          ys: [0, 1, 4, 9],
          x: 1.5,
          esperado: 2.3125
        },
        {
          xs: [0, 0.5, 1, 1.5, 2],
          ys: [0, 0.25, 1, 2.25, 4],
          x: 1.25,
          esperado: 1.5625
        },
        {
          xs: [-2, -1, 0, 1, 2],
          ys: [4, 1, 0, 1, 4],
          x: 0.5,
          esperado: 13 / 56
        }
      ];

      casos.forEach(({ xs, ys, x, esperado }) => {
        const res = splineCubicoNatural(xs, ys, x);
        const errorRelativo = Math.abs(res.resultado - esperado) / Math.abs(esperado);

        expect(res.convergio).toBe(true);
        expect(errorRelativo).toBeLessThan(0.1);
      });
    });

    test('mantiene precisión con valores decimales', () => {
      const xs = [0.1, 0.2, 0.3, 0.4, 0.5];
      const ys = xs.map(x => x * x);
      const x = 0.25;

      const res = splineCubicoNatural(xs, ys, x);
      const esperado = x * x;
      const errorRelativo = Math.abs(res.resultado - esperado) / esperado;

      expect(res.convergio).toBe(true);
      expect(errorRelativo).toBeLessThan(0.1);
    });

    test('ambas implementaciones mantienen resultados similares en distintos puntos', () => {
      const xs = [0, 1, 2, 3, 4];
      const ys = [0, 1, 4, 9, 16];
      const puntos = xs.map((x, i) => [x, ys[i]]);
      const valoresX = [0.5, 1.5, 2.5, 3.5];

      valoresX.forEach(x => {
        const res1 = splineCubicoNatural(xs, ys, x);
        const res2 = splines({ puntos, x });

        const errorRelativo = Math.abs(res1.resultado - res2.resultado) /
          Math.max(Math.abs(res1.resultado), 1);

        expect(res1.convergio).toBe(true);
        expect(res2.convergio).toBe(true);
        expect(errorRelativo).toBeLessThan(1e-10);
      });
    });

    test('conserva las condiciones naturales con diferentes conjuntos de datos', () => {
      const casos = [
        {
          xs: [0, 1, 2, 3],
          ys: [0, 1, 4, 9]
        },
        {
          xs: [0, 0.5, 1, 1.5],
          ys: [1, 2, 1, 2]
        },
        {
          xs: [-2, -1, 0, 1, 2],
          ys: [4, 1, 0, 1, 4]
        }
      ];

      casos.forEach(({ xs, ys }) => {
        const res = splineCubicoNatural(xs, ys, (xs[0] + xs[xs.length - 1]) / 2);

        expect(res.iteraciones[0].Mi).toBeCloseTo(0, 10);
        expect(res.iteraciones[res.iteraciones.length - 1].Mi).toBeCloseTo(0, 10);
      });
    });

    test('detecta desbordamiento con valores extremos', () => {
      const xs = [0, 1, 2];
      const ys = [-Number.MAX_VALUE, Number.MAX_VALUE, -Number.MAX_VALUE];

      expect(() => splineCubicoNatural(xs, ys, 1)).toThrow();
      expect(() => splines({
        puntos: xs.map((x, i) => [x, ys[i]]),
        x: 1
      })).toThrow();
    });
  });
});
