import { ErrorDivergencia } from '../../../src/core/errores.js';
import { jacobi } from '../../../src/lineales/jacobi.js';
import { gaussSeidel } from '../../../src/lineales/gauss-seidel.js';

describe('Método de Jacobi', () => {
  test('Resuelve un sistema diagonalmente dominante conocido', () => {
    // Sistema:
    // 4x +  y +  z =  9
    //  x + 5y +  z = 14
    //  x +  y + 4z = 15
    //
    // Solución exacta:
    // x = 1
    // y = 2
    // z = 3

    const A = [
      [4, 1, 1],
      [1, 5, 1],
      [1, 1, 4]
    ];

    const b = [9, 14, 15];

    const res = jacobi({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(1, 5);
    expect(res.resultado[1]).toBeCloseTo(2, 5);
    expect(res.resultado[2]).toBeCloseTo(3, 5);
  });

  test('Jacobi requiere igual o más iteraciones que Gauss-Seidel para el mismo sistema', () => {
    const A = [
      [4, 1, 1],
      [1, 5, 1],
      [1, 1, 4]
    ];

    const b = [9, 14, 15];

    const resJacobi = jacobi({ A, b });
    const resGaussSeidel = gaussSeidel({ A, b });

    expect(resJacobi.iteraciones.length)
      .toBeGreaterThanOrEqual(resGaussSeidel.iteraciones.length);
  });

  test('Lanza error cuando existe un elemento diagonal igual a cero', () => {
    const A = [
      [0, 1, 1],
      [1, 5, 1],
      [1, 1, 4]
    ];

    const b = [9, 14, 15];

    expect(() => jacobi({ A, b })).toThrow();
  });
});


describe('Jacobi: tolerancias, precisión y divergencia', () => {
  const matriz = [[4, 1], [2, 3]];
  const independientes = [6, 8];

  test.each([1e-4, 1e-8, 1e-12])(
    'resuelve con error relativo y residuo menores que %p',
    (tolerancia) => {
      const res = jacobi({
        A: matriz,
        b: independientes,
        tolerancia,
        maxIter: 200,
      });
      const error = Math.hypot(res.resultado[0] - 1, res.resultado[1] - 2)
        / Math.sqrt(5);
      const residuo = Math.hypot(...matriz.map((fila, indice) =>
        fila.reduce((suma, valor, j) => suma + valor * res.resultado[j], 0)
          - independientes[indice]
      )) / Math.hypot(...independientes);

      expect(res.convergio).toBe(true);
      expect(error).toBeLessThan(tolerancia);
      expect(residuo).toBeLessThan(tolerancia);
      expect(res.iteraciones.at(-1).error).toBeLessThan(tolerancia);
    }
  );

  test.each([[0, 0], [10, -10], [-2, 3]])(
    'converge desde el vector inicial %p, %p',
    (primero, segundo) => {
      const inicial = [primero, segundo];
      const res = jacobi({
        A: matriz,
        b: independientes,
        x0: inicial,
        tolerancia: 1e-10,
        maxIter: 200,
      });

      expect(res.convergio).toBe(true);
      expect(Math.hypot(res.resultado[0] - 1, res.resultado[1] - 2) / Math.sqrt(5))
        .toBeLessThan(1e-10);
      expect(inicial).toEqual([primero, segundo]);
    }
  );

  test('la matriz simétrica de dos variables presenta convergencia lineal', () => {
    const res = jacobi({
      A: [[4, 1], [1, 4]],
      b: [5, 5],
      tolerancia: 1e-10,
    });
    const errores = res.iteraciones.map(({ x }) => Math.hypot(x[0] - 1, x[1] - 1));

    expect(res.convergio).toBe(true);
    for (let indice = 1; indice < 8; indice++) {
      expect(errores[indice] / errores[indice - 1]).toBeCloseTo(0.25, 12);
    }
  });

  test('una tolerancia menor exige más iteraciones y reduce el error', () => {
    const resultados = [1e-4, 1e-8, 1e-12].map((tolerancia) =>
      jacobi({ A: matriz, b: independientes, tolerancia, maxIter: 200 })
    );

    for (let indice = 1; indice < resultados.length; indice++) {
      expect(resultados[indice].iteraciones.length).toBeGreaterThan(
        resultados[indice - 1].iteraciones.length
      );
      const error = (res) => Math.hypot(res.resultado[0] - 1, res.resultado[1] - 2);
      expect(error(resultados[indice])).toBeLessThan(error(resultados[indice - 1]));
    }
  });

  test.each([2, 4])('informa no convergencia tras %p pasos insuficientes', (maxIter) => {
    const res = jacobi({
      A: matriz,
      b: independientes,
      tolerancia: 1e-12,
      maxIter,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(maxIter);
    expect(res.iteraciones.at(-1).error).toBeGreaterThan(1e-12);
  });

  test('registra el aumento del error de un sistema divergente finito', () => {
    const res = jacobi({
      A: [[1, 2], [2, 1]],
      b: [1, 1],
      maxIter: 8,
      tolerancia: 1e-12,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(8);
    res.iteraciones.forEach(({ x }) => x.forEach((valor) =>
      expect(Number.isFinite(valor)).toBe(true)
    ));
    for (let indice = 1; indice < res.iteraciones.length; indice++) {
      expect(res.iteraciones[indice].error).toBeGreaterThan(
        res.iteraciones[indice - 1].error
      );
    }
  });

  test('lanza ErrorDivergencia si una actualización desborda', () => {
    expect(() => jacobi({
      A: [[Number.MIN_VALUE, 0], [0, 1]],
      b: [1, 1],
      maxIter: 1,
    })).toThrow(ErrorDivergencia);
  });

  test('preserva la matriz y el vector de términos independientes', () => {
    const coeficientes = matriz.map((fila) => [...fila]);
    const vector = [...independientes];

    jacobi({ A: coeficientes, b: vector });

    expect(coeficientes).toEqual(matriz);
    expect(vector).toEqual(independientes);
  });
});
