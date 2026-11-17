import { gauss } from '../../../src/lineales/gauss.js';
import { gaussJordan } from '../../../src/lineales/gauss-jordan.js';
import { matrizIdentidad } from '../../../src/utils/generadores_matrices.js';
import { ErrorDominio } from '../../../src/core/errores.js';

// -------------------------------------------------------------------
// Eliminación Gaussiana
// -------------------------------------------------------------------

describe('Eliminación Gaussiana (gauss)', () => {
  test('Resuelve sistema 2x2 con solución conocida', () => {
    // 2x + y = 5
    //  x + 3y = 10
    // Solución exacta: x=1, y=3
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
    //  2x +  y -  z =  8
    // -3x -  y + 2z = -11
    // -2x +  y + 2z = -3
    // Solución exacta: x=2, y=3, z=-1
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

  test('Lanza error con matriz singular (pivote nulo)', () => {
    // Filas proporcionales → sistema sin solución única
    // [1, 2 | 3]
    // [2, 4 | 6]  ← fila 2 = 2 × fila 1 → pivote nulo en col 1
    const A = [
      [1, 2],
      [2, 4]
    ];
    const b = [3, 6];

    expect(() => gauss({ A, b })).toThrow();
  });

  test('Lanza ErrorDominio cuando el pivote inicial es nulo', () => {
    // El método no realiza intercambio de filas.
    const A = [
      [0, 1],
      [1, 2]
    ];
    const b = [1, 3];

    expect(() => gauss({ A, b })).toThrow(ErrorDominio);
    expect(() => gauss({ A, b })).toThrow('Pivote nulo en la columna 1');
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
    // 2x + y = 5
    //  x + 3y = 10
    // Solución exacta: x=1, y=3
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
    //  2x +  y -  z =  8
    // -3x -  y + 2z = -11
    // -2x +  y + 2z = -3
    // Solución exacta: x=2, y=3, z=-1
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

  test('Lanza error con matriz singular (columna toda cero)', () => {
    // Segunda columna toda cero → sistema singular
    // [1, 0 | 1]
    // [0, 0 | 2]  ← pivote nulo sin fila de rescate
    const A = [
      [1, 0],
      [0, 0]
    ];
    const b = [1, 2];

    expect(() => gaussJordan({ A, b })).toThrow();
  });
});