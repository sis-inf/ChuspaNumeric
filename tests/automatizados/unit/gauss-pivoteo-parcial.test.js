import { gaussPivoteoParcial } from '../../../src/lineales/gauss-pivoteo-parcial.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

const TOLERANCIA = 1e-10;

describe('Eliminación Gaussiana con Pivoteo Parcial (gaussPivoteoParcial)', () => {
  test('Resuelve sistema con solución analítica conocida', () => {
    //  2x +  y -  z =  8
    // -3x -  y + 2z = -11
    // -2x +  y + 2z = -3
    // Solución exacta: x=2, y=3, z=-1
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];
    const b = [8, -11, -3];

    const res = gaussPivoteoParcial({ A, b });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado[0] - 2)).toBeLessThan(TOLERANCIA);
    expect(Math.abs(res.resultado[1] - 3)).toBeLessThan(TOLERANCIA);
    expect(Math.abs(res.resultado[2] + 1)).toBeLessThan(TOLERANCIA);
  });

  test('Resuelve sistema con A[0][0] = 0 que requiere pivoteo', () => {
    // 2y = 4
    // x + y = 3
    // Solución exacta: x=1, y=2
    const A = [
      [0, 2],
      [1, 1]
    ];
    const b = [4, 3];

    const res = gaussPivoteoParcial({ A, b });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado[0] - 1)).toBeLessThan(TOLERANCIA);
    expect(Math.abs(res.resultado[1] - 2)).toBeLessThan(TOLERANCIA);
  });

  test('El historial registra los pasos de pivoteo y sustitución', () => {
    const A = [
      [0, 2],
      [1, 1]
    ];
    const b = [4, 3];

    const res = gaussPivoteoParcial({ A, b });
    const pasoPivoteo = res.iteraciones.find((it) => it.paso === 'pivoteo');
    const pasosSustitucion = res.iteraciones.filter((it) => it.paso === 'sustitucion');

    expect(pasoPivoteo).toBeDefined();
    expect(pasoPivoteo.matriz).toEqual([
      [1, 1],
      [0, 2]
    ]);
    expect(pasoPivoteo.vector).toEqual([3, 4]);
    expect(pasosSustitucion).toHaveLength(2);
  });

  test('Lanza ErrorParametros si la matriz no es cuadrada', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6]
    ];
    const b = [1, 2];

    expect(() => gaussPivoteoParcial({ A, b })).toThrow(ErrorParametros);
  });

  test('Lanza error si b tiene dimensión incompatible con A', () => {
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [5, 10, 1];

    expect(() => gaussPivoteoParcial({ A, b })).toThrow();
  });

  test('Lanza ErrorDominio si hay pivote nulo', () => {
    const A = [
      [1, 2],
      [2, 4]
    ];
    const b = [3, 6];

    expect(() => gaussPivoteoParcial({ A, b })).toThrow(ErrorDominio);
  });
});
