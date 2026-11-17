import { calcularInversa } from '../../../src/lineales/inversa.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

describe('calcularInversa', () => {

  test('calcula correctamente la inversa de una matriz 2x2', () => {
    const A = [
      [4, 7],
      [2, 6]
    ];

    const res = calcularInversa(A);

    expect(res.resultado[0][0]).toBeCloseTo(0.6, 10);
    expect(res.resultado[0][1]).toBeCloseTo(-0.7, 10);
    expect(res.resultado[1][0]).toBeCloseTo(-0.2, 10);
    expect(res.resultado[1][1]).toBeCloseTo(0.4, 10);
  });

  test('acepta una matriz directamente o mediante el objeto { A }', () => {
    const A = [
      [4, 7],
      [2, 6]
    ];

    const resDirecto = calcularInversa(A);
    const resObjeto = calcularInversa({ A });

    expect(resObjeto.resultado).toEqual(resDirecto.resultado);
  });

  test('el producto de la matriz por su inversa es la identidad', () => {
    const A = [
      [4, 7],
      [2, 6]
    ];

    const inversa = calcularInversa(A).resultado;

    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A.length; j++) {
        const producto = A[i].reduce(
          (suma, valor, k) => suma + valor * inversa[k][j],
          0
        );

        expect(producto).toBeCloseTo(i === j ? 1 : 0, 10);
      }
    }
  });

  test('lanza ErrorDominio cuando la matriz es singular', () => {
    const A = [
      [1, 2],
      [2, 4]
    ];

    expect(() => calcularInversa(A)).toThrow(ErrorDominio);
    expect(() => calcularInversa(A)).toThrow(/singular/i);
  });

  test('lanza ErrorParametros para matrices no cuadradas o elementos no numéricos', () => {
    const matrizNoCuadrada = [
      [1, 2, 3],
      [4, 5, 6]
    ];

    const matrizNoNumerica = [
      [1, 2],
      [3, 'a']
    ];

    expect(() => calcularInversa(matrizNoCuadrada)).toThrow(ErrorParametros);
    expect(() => calcularInversa(matrizNoNumerica)).toThrow(ErrorParametros);
  });

  test('devuelve convergio en true y una iteración por columna', () => {
    const A = [
      [4, 7],
      [2, 6]
    ];

    const res = calcularInversa(A);

    expect(res.convergio).toBe(true);
    expect(res.iteraciones).toHaveLength(A.length);
  });

});