
import { det2x2, det3x3 } from '../../../src/lineales/determinant.js';
import { ErrorParametros, ErrorDivergencia } from '../../../src/core/errores.js';

// -------------------------------------------------------------------
// Determinantes
// -------------------------------------------------------------------

describe('Funciones de Determinante', () => {
  test('Calcula correctamente el determinante de una matriz 2x2', () => {
    // | 3  8 |
    // | 4  6 |
    //
    // Cálculo manual:
    // det = (3 × 6) − (8 × 4)
    // det = 18 − 32
    // det = -14

    const matriz = [
      [3, 8],
      [4, 6]
    ];

    expect(det2x2(matriz).resultado).toBe(-14);
  });

  test('Calcula correctamente el determinante de una matriz 3x3', () => {
    // | 1  2  3 |
    // | 0  4  5 |
    // | 1  0  6 |
    //
    // Regla de Sarrus:
    //
    // Diagonales principales:
    // (1×4×6) + (2×5×1) + (3×0×0)
    // = 24 + 10 + 0 = 34
    //
    // Diagonales secundarias:
    // (3×4×1) + (2×0×6) + (1×5×0)
    // = 12 + 0 + 0 = 12
    //
    // det = 34 − 12 = 22

    const matriz = [
      [1, 2, 3],
      [0, 4, 5],
      [1, 0, 6]
    ];

    expect(det3x3(matriz).resultado).toBe(22);
  });

  test('Lanza error si se pasa una matriz de dimensión incorrecta a det2x2', () => {
    const matriz = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ];

    expect(() => det2x2(matriz)).toThrow(Error);
    expect(() => det2x2(matriz)).toThrow('dimensión incorrecta');
  });
});

// -------------------------------------------------------------------
// Precision numerica
// -------------------------------------------------------------------

describe('Determinantes - precision numerica', () => {
  test('calcula el determinante de una matriz identidad 2x2', () => {
    const matriz = [
      [1, 0],
      [0, 1]
    ];

    expect(det2x2(matriz).resultado).toBe(1);
  });

  test('calcula el determinante de una matriz identidad 3x3', () => {
    const matriz = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    expect(det3x3(matriz).resultado).toBe(1);
  });

  test('detecta una matriz singular 2x2', () => {
    const matriz = [
      [2, 4],
      [3, 6]
    ];

    expect(det2x2(matriz).resultado).toBe(0);
  });

  test('detecta una matriz singular 3x3', () => {
    const matriz = [
      [1, 2, 3],
      [2, 4, 6],
      [3, 6, 9]
    ];

    expect(det3x3(matriz).resultado).toBe(0);
  });

  test('calcula el determinante con valores decimales', () => {
    const matriz = [
      [0.1, 0.2],
      [0.3, 0.4]
    ];

    expect(det2x2(matriz).resultado).toBeCloseTo(-0.02, 12);
  });

  test.each([1e-4, 1e-8, 1e-12])(
    'verifica el error relativo con tolerancia %s',
    (tolerancia) => {
      const matriz = [
        [0.1, 0.2],
        [0.3, 0.4]
      ];

      const exacto = -0.02;
      const calculado = det2x2(matriz).resultado;

      const errorRelativo = Math.abs(
        (exacto - calculado) / exacto
      );

      expect(errorRelativo).toBeLessThan(tolerancia);
    }
  );
});

// -------------------------------------------------------------------
// Tolerancias y escalas numericas
// -------------------------------------------------------------------

describe('Determinantes - tolerancias numericas', () => {
  test.each([1e-4, 1e-8, 1e-12])(
    'precision del determinante 3x3 con tolerancia %s',
    (tolerancia) => {
      const matriz = [
        [0.1, 0.2, 0.3],
        [0, 0.4, 0.5],
        [0, 0, 0.6]
      ];

      const exacto = 0.024;
      const calculado = det3x3(matriz).resultado;

      const errorRelativo = Math.abs(
        (exacto - calculado) / exacto
      );

      expect(errorRelativo).toBeLessThan(tolerancia);
    }
  );

  test.each([1e-6, 1, 1e6])(
    'precision con diferentes escalas %s',
    (escala) => {
      const matriz = [
        [3 * escala, 8 * escala],
        [4 * escala, 6 * escala]
      ];

      const exacto = -14 * escala * escala;
      const calculado = det2x2(matriz).resultado;

      const errorRelativo = Math.abs(
        (exacto - calculado) / exacto
      );

      expect(errorRelativo).toBeLessThan(1e-12);
    }
  );
});

// -------------------------------------------------------------------
// Divergencia numerica y parametros incorrectos
// -------------------------------------------------------------------

describe('Determinantes - divergencia numerica', () => {
  test('detecta desbordamiento numerico en det2x2', () => {
    const matriz = [
      [1e308, 0],
      [0, 1e308]
    ];

    expect(() => det2x2(matriz))
      .toThrow(ErrorDivergencia);
  });

  test('detecta desbordamiento numerico en det3x3', () => {
    const matriz = [
      [1e200, 0, 0],
      [0, 1e200, 0],
      [0, 0, 1e200]
    ];

    expect(() => det3x3(matriz))
      .toThrow(ErrorDivergencia);
  });

  test('rechaza valores NaN', () => {
    const matriz = [
      [NaN, 2],
      [3, 4]
    ];

    expect(() => det2x2(matriz))
      .toThrow(ErrorParametros);
  });

  test('rechaza valores infinitos', () => {
    const matriz = [
      [Infinity, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    expect(() => det3x3(matriz))
      .toThrow(ErrorParametros);
  });
});

// -------------------------------------------------------------------
// Contrato del resultado
// -------------------------------------------------------------------

describe('Determinantes - contrato del resultado', () => {
  test('det2x2 completa una operacion directa', () => {
    const matriz = [
      [3, 8],
      [4, 6]
    ];

    const res = det2x2(matriz);

    expect(res.resultado).toBe(-14);
    expect(res.convergio).toBe(true);
    expect(res.iteraciones).toEqual([]);
    expect(res.meta.metodo).toBe('determinante-2x2');
  });

  test('det3x3 completa una operacion directa', () => {
    const matriz = [
      [2, 0, 0],
      [0, 3, 0],
      [0, 0, 4]
    ];

    const res = det3x3(matriz);

    expect(res.resultado).toBe(24);
    expect(res.convergio).toBe(true);
    expect(res.iteraciones).toEqual([]);
    expect(res.meta.metodo).toBe('determinante-3x3');
  });
});
