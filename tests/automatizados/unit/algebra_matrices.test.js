import {
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar
} from '../../../src/matricial/algebra_matrices.js';

describe('algebra_matrices', () => {

  test('suma y resta dos matrices del mismo tamaño', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];

    expect(sumaMatrices(A, B)).toEqual([[6, 8], [10, 12]]);
    expect(restaMatrices(B, A)).toEqual([[4, 4], [4, 4]]);
  });

  test('multiplica dos matrices compatibles', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[2, 0], [1, 2]];

    expect(multiplicarMatrices(A, B)).toEqual([[4, 4], [10, 8]]);
  });

  test('calcula la transpuesta de una matriz rectangular', () => {
    const A = [[1, 2, 3], [4, 5, 6]];

    expect(transpuesta(A)).toEqual([[1, 4], [2, 5], [3, 6]]);
  });

  test('multiplica una matriz por un escalar', () => {
    const A = [[1, 2], [3, 4]];

    expect(multiplicarEscalar(2, A)).toEqual([[2, 4], [6, 8]]);
  });

  test('lanza Error cuando las dimensiones son incompatibles', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[1, 2, 3]];

    expect(() => sumaMatrices(A, B))
      .toThrow(/Dimensiones incompatibles/);

    expect(() => restaMatrices(A, B))
      .toThrow(/Dimensiones incompatibles/);

    expect(() => multiplicarMatrices(A, B))
      .toThrow(/Dimensiones incompatibles/);
  });

  test('lanza Error cuando una matriz no es rectangular, está vacía o contiene NaN', () => {
    const noRectangular = [[1, 2], [3]];
    const vacia = [];
    const conNaN = [[1, NaN], [3, 4]];

    expect(() => transpuesta(noRectangular)).toThrow(Error);
    expect(() => transpuesta(vacia)).toThrow(Error);
    expect(() => transpuesta(conNaN)).toThrow(Error);
  });

  test('lanza Error cuando el escalar no es finito', () => {
    const A = [[1, 2], [3, 4]];

    expect(() => multiplicarEscalar(Infinity, A)).toThrow(Error);
    expect(() => multiplicarEscalar(NaN, A)).toThrow(Error);
  });

});