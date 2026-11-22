import { gauss } from '../../../src/lineales/gauss.js';
import { gaussJordan } from '../../../src/lineales/gauss-jordan.js';
import { matrizIdentidad } from '../../../src/utils/generadores_matrices.js';
import { ErrorDominio } from '../../../src/core/errores.js';

function errorRelativoMaximo(estimado, esperado) {
  let maxErr = 0;
  for (let i = 0; i < esperado.length; i++) {
    const denom = Math.abs(esperado[i]) > 0 ? Math.abs(esperado[i]) : 1;
    const err = Math.abs(estimado[i] - esperado[i]) / denom;
    if (err > maxErr) {
      maxErr = err;
    }
  }
  return maxErr;
}

// -------------------------------------------------------------------
// Eliminación Gaussiana
// -------------------------------------------------------------------

describe('Eliminación Gaussiana (gauss)', () => {
  test('Resuelve sistema 2x2 con solución conocida', () => {
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [5, 10];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(1, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
  });

  test('Resuelve sistema 3x3 con solución conocida', () => {
    const A = [
      [ 2,  1, -1],
      [-3, -1,  2],
      [-2,  1,  2]
    ];
    const b = [8, -11, -3];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(2, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
    expect(res.resultado[2]).toBeCloseTo(-1, 10);
  });

  test('El resultado tiene la misma cantidad de variables que el sistema', () => {
    const A = [
      [4, 1],
      [2, 3]
    ];
    const b = [9, 8];

    const res = gauss({ A, b });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(res.resultado.length).toBe(2);
  });

  test('Evalúa precisión y error relativo en distintos órdenes de escala', () => {
    const escalas = [1e-4, 1, 1e4];
    const esperado = [1.5, -2.5];

    for (const s of escalas) {
      const A = [
        [2 * s, 4 * s],
        [3 * s, -1 * s]
      ];
      // 2*(1.5) + 4*(-2.5) = -7 ; 3*(1.5) - 1*(-2.5) = 7
      const b = [-7 * s, 7 * s];
      const res = gauss({ A, b });

      expect(res.convergio).toBe(true);
      expect(errorRelativoMaximo(res.resultado, esperado)).toBeLessThan(1e-9);
    }
  });

  test('Lanza error con matriz singular (pivote nulo)', () => {
    const A = [
      [1, 2],
      [2, 4]
    ];
    const b = [3, 6];

    expect(() => gauss({ A, b })).toThrow();
  });

  test('Lanza ErrorDominio cuando el pivote inicial es nulo', () => {
    const A = [
      [0, 1],
      [1, 2]
    ];
    const b = [1, 3];

    expect(() => gauss({ A, b })).toThrow(ErrorDominio);
    expect(() => gauss({ A, b })).toThrow('ChuspaNumeric.gauss: pivote nulo en la columna 1. El sistema no puede resolverse con este metodo sin SecurityPolicyViolationEvent.'
    );
  });

  test('Detecta sistema inconsistente / singular o sin convergencia válida', () => {
    const A = [
      [1, 1],
      [1, 1]
    ];
    const b = [2, 5];

    let threw = false;
    let res;
    try {
      res = gauss({ A, b });
    } catch {
      threw = true;
    }

    if (!threw) {
      expect(res.convergio).toBe(false);
    } else {
      expect(threw).toBe(true);
    }
  });

  test('Registra una advertencia cuando el pivote es pequeño respecto a la matriz', () => {
    const A = [
      [1e-11, 1],
      [0, 1]
    ];
    const b = [1 + 1e-11, 1];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.warnings).toHaveLength(1);
    expect(res.warnings[0]).toContain('Pivote pequeño detectado en columna 1');
    expect(res.warnings[0]).toContain('Posible inestabilidad numérica');
  });

  test('Resuelve sistema con matriz identidad (solución igual a b)', () => {
    const A = matrizIdentidad(3);
    const b = [5, -2, 7];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(5, 10);
    expect(res.resultado[1]).toBeCloseTo(-2, 10);
    expect(res.resultado[2]).toBeCloseTo(7, 10);
  });
});

// -------------------------------------------------------------------
// Gauss-Jordan
// -------------------------------------------------------------------

describe('Eliminación Gauss-Jordan', () => {
  test('Resuelve sistema 2x2 con solución conocida', () => {
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [5, 10];

    const res = gaussJordan({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(1, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
  });

  test('Resuelve sistema 3x3 con solución conocida', () => {
    const A = [
      [ 2,  1, -1],
      [-3, -1,  2],
      [-2,  1,  2]
    ];
    const b = [8, -11, -3];

    const res = gaussJordan({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(2, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
    expect(res.resultado[2]).toBeCloseTo(-1, 10);
  });

  test('El resultado tiene la misma cantidad de variables que el sistema', () => {
    const A = [
      [4, 1],
      [2, 3]
    ];
    const b = [9, 8];

    const res = gaussJordan({ A, b });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(res.resultado.length).toBe(2);
  });

  test('Mantiene bajo error relativo en distintos órdenes de magnitud', () => {
    const escalas = [1e-3, 1, 1e3];
    const esperado = [2, -1];

    for (const s of escalas) {
      const A = [
        [1 * s, 2 * s],
        [4 * s, 3 * s]
      ];
      // 2 - 2 = 0 ; 8 - 3 = 5
      const b = [0 * s, 5 * s];
      const res = gaussJordan({ A, b });

      expect(res.convergio).toBe(true);
      expect(errorRelativoMaximo(res.resultado, esperado)).toBeLessThan(1e-9);
    }
  });

  test('Lanza error con matriz singular (columna toda cero)', () => {
    const A = [
      [1, 0],
      [0, 0]
    ];
    const b = [1, 2];

    expect(() => gaussJordan({ A, b })).toThrow();
  });
});