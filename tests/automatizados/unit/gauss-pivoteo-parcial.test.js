import { gaussPivoteoParcial } from '../../../src/lineales/gauss-pivoteo-parcial.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('gaussPivoteoParcial - validación del vector b', () => {
  const A = [
    [2, 1],
    [1, 3]
  ];

  test.each([
    ['undefined', undefined],
    ['un número', 5],
    ['un string', '5,10'],
    ['un objeto', { 0: 5, 1: 10 }]
  ])('lanza ErrorParametros si b es %s', (_descripcion, b) => {
    expect(() => gaussPivoteoParcial({ A, b })).toThrow(ErrorParametros);
  });

  test.each([
    ['menor', [5]],
    ['mayor', [5, 10, 1]]
  ])('lanza ErrorParametros si b tiene dimensión %s que A', (_descripcion, b) => {
    expect(() => gaussPivoteoParcial({ A, b })).toThrow(ErrorParametros);
  });

  test.each([
    ['NaN', [5, NaN]],
    ['Infinity', [Infinity, 10]],
    ['-Infinity', [5, -Infinity]],
    ['un string', [5, '10']],
    ['null', [null, 10]]
  ])('lanza ErrorParametros si un elemento de b es %s', (_descripcion, b) => {
    expect(() => gaussPivoteoParcial({ A, b })).toThrow(ErrorParametros);
  });
});
