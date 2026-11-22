import { gaussJordan } from '../../../src/lineales/gauss-jordan.js';
import { ErrorDominio } from '../../../src/core/errores.js';

// ---------- Helpers ----------
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

const norma = (v) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
const multiplicar = (A, x) => A.map((fila) => fila.reduce((s, a, j) => s + a * x[j], 0));
const errorRelativo = (x, exacta) => norma(x.map((xi, i) => xi - exacta[i])) / norma(exacta);
const residuo = (A, x, b) => norma(multiplicar(A, x).map((v, i) => v - b[i]));

// Matriz n x n diagonalmente dominante: n+1 en la diagonal y 1 fuera de ella
const diagDominante = (n) =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? n + 1 : 1)));

// Matriz de Hilbert n x n (mal condicionada)
const hilbert = (n) =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => 1 / (i + j + 1)));

describe('gaussJordan', () => {
  // ===== Tests originales (se conservan) =====
  test('resuelve un sistema lineal 3x3 con solución única', () => {
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];

    const b = [8, -11, -3];

    const res = gaussJordan({ A, b });

    const [x, y, z] = res.resultado;

    expect(x).toBeCloseTo(2, 10);
    expect(y).toBeCloseTo(3, 10);
    expect(z).toBeCloseTo(-1, 10);
  });

  test('lanza ErrorDominio para una matriz singular', () => {
    const A = [
      [1, 2],
      [2, 4]
    ];

    const b = [3, 6];

    expect(() => gaussJordan({ A, b })).toThrow(ErrorDominio);
  });

  // ===== Contrato del resultado =====
  describe('contrato del resultado', () => {
    // A = [[2,1],[1,3]], b = [3,5] -> det = 5
    // x = (3*3 - 1*5)/5 = 0.8 ; y = (2*5 - 1*3)/5 = 1.4
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [3, 5];

    test('devuelve resultado, convergio, mensaje y meta coherentes', () => {
      const res = gaussJordan({ A, b });

      expect(res.resultado).toHaveLength(2);
      expect(res.resultado[0]).toBeCloseTo(0.8, 12);
      expect(res.resultado[1]).toBeCloseTo(1.4, 12);
      expect(res.convergio).toBe(true);
      expect(res.mensaje).toMatch(/Sistema resuelto en 4 pasos de reducci/);
      expect(res.meta.metodo).toBe('gaussJordan');
      expect(res.meta.parametros).toEqual({ A, b });
      expect(typeof res.meta.tiempo_ms).toBe('number');
    });

    test('las iteraciones tienen n secuencial desde 1 y estructura completa', () => {
      const res = gaussJordan({ A, b });

      expect(res.iteraciones.length).toBeGreaterThan(0);
      res.iteraciones.forEach((it, i) => {
        expect(it.n).toBe(i + 1);
        expect(['intercambio', 'normalizacion', 'eliminacion']).toContain(it.paso);
        expect(typeof it.descripcion).toBe('string');
        expect(it.matriz).toHaveLength(2);
        expect(it.vector).toHaveLength(2);
      });
    });

    test('la última iteración deja la identidad y el vector igual al resultado', () => {
      const res = gaussJordan({ A, b });
      const ultima = res.iteraciones[res.iteraciones.length - 1];

      expect(ultima.matriz[0][0]).toBeCloseTo(1, 12);
      expect(ultima.matriz[0][1]).toBeCloseTo(0, 12);
      expect(ultima.matriz[1][0]).toBeCloseTo(0, 12);
      expect(ultima.matriz[1][1]).toBeCloseTo(1, 12);
      expect(ultima.vector[0]).toBeCloseTo(res.resultado[0], 12);
      expect(ultima.vector[1]).toBeCloseTo(res.resultado[1], 12);
    });

    test('no modifica A ni b de entrada', () => {
      const Acopia = A.map((fila) => [...fila]);
      const bcopia = [...b];

      gaussJordan({ A, b });

      expect(A).toEqual(Acopia);
      expect(b).toEqual(bcopia);
    });

    test('dos llamadas con los mismos datos dan el mismo resultado', () => {
      const r1 = gaussJordan({ A, b });
      const r2 = gaussJordan({ A, b });

      expect(r1.resultado).toEqual(r2.resultado);
      expect(r1.iteraciones.length).toBe(r2.iteraciones.length);
    });
  });

  // ===== Precisión según tolerancia =====
  // Sistema diagonalmente dominante 10x10 con solución exacta x = [1, 2, ..., 10]
  describe('precisión frente a tolerancias de 1e-2 a 1e-12', () => {
    const n = 10;
    const A = diagDominante(n);
    const exacta = Array.from({ length: n }, (_, i) => i + 1);
    const b = multiplicar(A, exacta);

    test.each([1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12])(
      'el error relativo y el residuo son <= %p',
      (tolerancia) => {
        const res = gaussJordan({ A, b });

        expect(res.convergio).toBe(true);
        expect(errorRelativo(res.resultado, exacta)).toBeLessThanOrEqual(tolerancia);
        expect(residuo(A, res.resultado, b)).toBeLessThanOrEqual(tolerancia);
      }
    );

    test('el error relativo queda varios órdenes por debajo de 1e-12', () => {
      const res = gaussJordan({ A, b });

      expect(errorRelativo(res.resultado, exacta)).toBeLessThan(1e-13);
    });
  });

  // ===== Tamaño del sistema y cantidad de pasos =====
  // Sin intercambios: n normalizaciones + n*(n-1) eliminaciones = n^2 pasos
  describe('tamaño del sistema y número de pasos', () => {
    test.each([1, 2, 3, 5, 10, 20])('sistema de orden %p usa n^2 pasos sin intercambios', (n) => {
      const A = diagDominante(n);
      const exacta = Array.from({ length: n }, (_, i) => i + 1);
      const b = multiplicar(A, exacta);

      const res = gaussJordan({ A, b });
      const conteo = (tipo) => res.iteraciones.filter((it) => it.paso === tipo).length;

      expect(res.iteraciones).toHaveLength(n * n);
      expect(conteo('normalizacion')).toBe(n);
      expect(conteo('eliminacion')).toBe(n * (n - 1));
      expect(conteo('intercambio')).toBe(0);
      expect(res.mensaje).toContain(`Sistema resuelto en ${n * n} pasos`);
      expect(errorRelativo(res.resultado, exacta)).toBeLessThan(1e-12);
    });

    test('la cantidad de pasos crece al aumentar el tamaño del sistema', () => {
      const pasos = [2, 4, 8, 16].map((n) => {
        const A = diagDominante(n);
        const b = multiplicar(A, Array(n).fill(1));
        return gaussJordan({ A, b }).iteraciones.length;
      });

      expect(pasos).toEqual([4, 16, 64, 256]);
    });
  });

  // ===== Pivoteo: pivote cero que sí se puede resolver =====
  describe('intercambio de filas cuando el pivote es cero', () => {
    test('2x2 con A[0][0] = 0 -> x = [1, 2] en 5 pasos (1 intercambio)', () => {
      // 0*1 + 2*2 = 4 ; 3*1 + 1*2 = 5
      const res = gaussJordan({
        A: [
          [0, 2],
          [3, 1]
        ],
        b: [4, 5]
      });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(1, 12);
      expect(res.resultado[1]).toBeCloseTo(2, 12);
      expect(res.iteraciones).toHaveLength(5);
      expect(res.iteraciones[0].paso).toBe('intercambio');
      expect(res.iteraciones[0].descripcion).toContain('fila 0 con fila 1');
      expect(res.iteraciones.map((it) => it.n)).toEqual([1, 2, 3, 4, 5]);
    });

    test('3x3 con diagonal nula -> x = [1, 2, 3] en 10 pasos', () => {
      // 0+2+3 = 5 ; 1+0+3 = 4 ; 1+2+0 = 3
      const res = gaussJordan({
        A: [
          [0, 1, 1],
          [1, 0, 1],
          [1, 1, 0]
        ],
        b: [5, 4, 3]
      });

      expect(res.resultado[0]).toBeCloseTo(1, 12);
      expect(res.resultado[1]).toBeCloseTo(2, 12);
      expect(res.resultado[2]).toBeCloseTo(3, 12);
      expect(res.iteraciones).toHaveLength(10);
      expect(res.iteraciones.filter((it) => it.paso === 'intercambio')).toHaveLength(1);
    });
  });

  // ===== Casos borde =====
  describe('casos borde', () => {
    test('sistema 1x1', () => {
      const res = gaussJordan({ A: [[4]], b: [8] });

      expect(res.resultado[0]).toBeCloseTo(2, 12);
      expect(res.iteraciones).toHaveLength(1);
      expect(res.iteraciones[0].paso).toBe('normalizacion');
    });

    test('matriz identidad devuelve directamente b', () => {
      const res = gaussJordan({
        A: [
          [1, 0],
          [0, 1]
        ],
        b: [7, -3]
      });

      expect(res.resultado).toEqual([7, -3]);
    });

    test('vector b nulo con A invertible da la solución trivial', () => {
      const res = gaussJordan({
        A: [
          [2, 1],
          [1, 3]
        ],
        b: [0, 0]
      });

      expect(res.resultado[0]).toBeCloseTo(0, 12);
      expect(res.resultado[1]).toBeCloseTo(0, 12);
    });

    test('sistema 3x3 general con solución entera', () => {
      // 1+4+9 = 14 ; 4+10+18 = 32 ; 7+16+30 = 53
      const res = gaussJordan({
        A: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 10]
        ],
        b: [14, 32, 53]
      });

      expect(res.resultado[0]).toBeCloseTo(1, 10);
      expect(res.resultado[1]).toBeCloseTo(2, 10);
      expect(res.resultado[2]).toBeCloseTo(3, 10);
    });
  });

  // ===== Orden de convergencia / error según condicionamiento =====
  // Método directo: no hay iteraciones de convergencia; el análogo es cómo
  // crece el error relativo al empeorar el condicionamiento (matrices de Hilbert).
  describe('error relativo según el condicionamiento', () => {
    const calcular = (A) => {
      const exacta = Array(A.length).fill(1);
      const b = multiplicar(A, exacta);
      const res = gaussJordan({ A, b });
      return { res, b, error: errorRelativo(res.resultado, exacta) };
    };

    test.each([
      [2, 1e-13],
      [3, 1e-12],
      [4, 1e-10],
      [6, 1e-8],
      [8, 1e-5],
      [10, 1e-2]
    ])('Hilbert de orden %p: error relativo < %p', (n, cota) => {
      const { error } = calcular(hilbert(n));

      expect(error).toBeLessThan(cota);
    });

    test('el error relativo crece con el tamaño de la matriz de Hilbert', () => {
      const errores = [2, 3, 4, 6, 8, 10, 12].map((n) => calcular(hilbert(n)).error);

      for (let i = 1; i < errores.length; i++) {
        expect(errores[i]).toBeGreaterThan(errores[i - 1]);
      }
    });

    test('el sistema bien condicionado es mucho más preciso que Hilbert 10x10', () => {
      const bueno = calcular(diagDominante(10)).error;
      const malo = calcular(hilbert(10)).error;

      expect(malo).toBeGreaterThan(bueno * 1e6);
    });

    test('aun mal condicionado, el residuo es pequeño (Hilbert 8x8 y 12x12)', () => {
      [8, 12].forEach((n) => {
        const A = hilbert(n);
        const { res, b } = calcular(A);

        expect(res.convergio).toBe(true);
        expect(residuo(A, res.resultado, b)).toBeLessThan(1e-12);
      });
    });

    test('Hilbert 12x12: resuelve sin lanzar error pero el error relativo supera 1e-3', () => {
      const { res, error } = calcular(hilbert(12));

      expect(res.convergio).toBe(true);
      expect(error).toBeGreaterThan(1e-3);
    });

    test('matriz casi singular (epsilon = 1e-4) sigue resolviéndose con buena precisión', () => {
      // [[1,1],[1,1+e]] x = [2, 2+e] -> x = [1, 1]
      const e = 1e-4;
      const res = gaussJordan({
        A: [
          [1, 1],
          [1, 1 + e]
        ],
        b: [2, 2 + e]
      });

      expect(res.resultado[0]).toBeCloseTo(1, 8);
      expect(res.resultado[1]).toBeCloseTo(1, 8);
    });
  });

  // ===== No convergencia: sistemas sin solución única =====
  describe('detección de sistemas sin solución única (pivote nulo)', () => {
    test.each([
      ['matriz 1x1 nula', [[0]], 0],
      ['matriz 2x2 nula', [[0, 0], [0, 0]], 0],
      ['filas proporcionales 2x2', [[1, 1], [1, 1]], 1],
      ['columna nula en 2x2', [[0, 1], [0, 2]], 0],
      ['filas proporcionales 2x2 (1,2)/(2,4)', [[1, 2], [2, 4]], 1]
    ])('%s lanza ErrorDominio con el prefijo y la columna del pivote', (_desc, A, columna) => {
      const b = A.map(() => 1);
      const error = capturar(() => gaussJordan({ A, b }));

      expect(error).toBeInstanceOf(ErrorDominio);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/^ChuspaNumeric\.gaussJordan:/);
      expect(error.message).toContain(`pivote nulo en la columna ${columna}`);
    });

    test('el mensaje de error indica que el sistema puede ser singular', () => {
      const error = capturar(() =>
        gaussJordan({
          A: [
            [1, 2],
            [2, 4]
          ],
          b: [3, 6]
        })
      );

      expect(error.message).toMatch(/singular|soluci/);
    });
  });
});
