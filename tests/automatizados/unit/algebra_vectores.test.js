import { describe, expect, test } from '@jest/globals';
import {
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
} from '../../../src/utils/algebra_vectores.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('Operaciones de álgebra de vectores', () => {
  test('suma las componentes de dos vectores', () => {
    expect(sumaVectores([1, 2], [3, 4])).toEqual([4, 6]);
  });

  test('resta las componentes de dos vectores', () => {
    expect(restaVectores([5, 5], [2, 3])).toEqual([3, 2]);
  });

  test('calcula el producto punto de dos vectores', () => {
    expect(productoPunto([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  test('calcula el producto cruz de dos vectores ortogonales', () => {
    expect(productoCruz([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  test('calcula la magnitud de un vector', () => {
    expect(magnitudVector([3, 4])).toBe(5);
  });

  test('normaliza un vector no nulo', () => {
    expect(normalizarVector([3, 4])).toEqual([0.6, 0.8]);
  });

  test('rechaza la normalización del vector cero', () => {
    expect(() => normalizarVector([0, 0])).toThrow(ErrorParametros);
  });

  test.each([
    { nombre: 'suma', ejecutar: sumaVectores },
    { nombre: 'resta', ejecutar: restaVectores },
    { nombre: 'producto punto', ejecutar: productoPunto },
  ])('$nombre rechaza dimensiones diferentes', ({ ejecutar }) => {
    expect(() => ejecutar([1, 2], [3, 4, 5])).toThrow(ErrorParametros);
  });

  test.each([
    { caso: 'ambos vectores de dimensión dos', primero: [1, 0], segundo: [0, 1] },
    { caso: 'primer vector de dimensión dos', primero: [1, 0], segundo: [0, 1, 0] },
    { caso: 'segundo vector de dimensión dos', primero: [1, 0, 0], segundo: [0, 1] },
  ])('producto cruz rechaza $caso', ({ primero, segundo }) => {
    expect(() => productoCruz(primero, segundo)).toThrow(ErrorParametros);
  });

  test('las operaciones conservan los vectores originales', () => {
    const primero = Object.freeze([1, 2, 3]);
    const segundo = Object.freeze([4, 5, 6]);

    sumaVectores(primero, segundo);
    restaVectores(primero, segundo);
    productoPunto(primero, segundo);
    productoCruz(primero, segundo);
    magnitudVector(primero);
    normalizarVector(primero);

    expect(primero).toEqual([1, 2, 3]);
    expect(segundo).toEqual([4, 5, 6]);
  });
});

const operaciones = [
  { nombre: 'suma', ejecutar: (vector) => sumaVectores(vector, [1, 2, 3]) },
  { nombre: 'resta', ejecutar: (vector) => restaVectores(vector, [1, 2, 3]) },
  { nombre: 'producto punto', ejecutar: (vector) => productoPunto(vector, [1, 2, 3]) },
  { nombre: 'producto cruz', ejecutar: (vector) => productoCruz(vector, [1, 2, 3]) },
  { nombre: 'magnitud', ejecutar: magnitudVector },
  { nombre: 'normalización', ejecutar: normalizarVector },
];

describe.each(operaciones)('Validación de $nombre', ({ ejecutar }) => {
  test.each([
    { caso: 'un vector vacío', vector: [] },
    { caso: 'una componente NaN', vector: [1, NaN] },
    { caso: 'una componente infinita', vector: [1, Infinity] },
    { caso: 'una componente de texto', vector: [1, '2'] },
  ])('rechaza $caso', ({ vector }) => {
    expect(() => ejecutar(vector)).toThrow(ErrorParametros);
  });

  test('rechaza una entrada que no es un arreglo', () => {
    expect(() => ejecutar(null)).toThrow(ErrorParametros);
  });
});

test.each([
  { nombre: 'suma', ejecutar: sumaVectores },
  { nombre: 'resta', ejecutar: restaVectores },
  { nombre: 'producto punto', ejecutar: productoPunto },
  { nombre: 'producto cruz', ejecutar: productoCruz },
])('$nombre valida también las componentes del segundo vector', ({ ejecutar }) => {
  expect(() => ejecutar([1, 2, 3], [1, NaN, 3])).toThrow(ErrorParametros);
});
