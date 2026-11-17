import {
  redondear,
  errorAbsoluto,
  errorRelativo,
  errorPorcentual,
  aproximadamenteIgual,
} from '../../../src/utils/formato.js';

describe('Pruebas unitarias de formato.js', () => {
  test('redondear(3.14159, 2) devuelve 3.14', () => {
    expect(redondear(3.14159, 2)).toBe(3.14);
  });

  test('errorAbsoluto(5, 3) devuelve 2', () => {
    expect(errorAbsoluto(5, 3)).toBe(2);
  });

  test('errorRelativo(4, 3) devuelve 0.25', () => {
    expect(errorRelativo(4, 3)).toBe(0.25);
  });

  test('errorRelativo(0, 1) devuelve Infinity', () => {
    expect(errorRelativo(0, 1)).toBe(Infinity);
  });

  test('errorPorcentual(4, 3) devuelve 25', () => {
    expect(errorPorcentual(4, 3)).toBe(25);
  });

  test('aproximadamenteIgual(1, 1.0001, 0.001) devuelve true', () => {
    expect(
      aproximadamenteIgual(1, 1.0001, 0.001)
    ).toBe(true);
  });

  test('aproximadamenteIgual(1, 1.0001, 1e-5) devuelve false', () => {
    expect(
      aproximadamenteIgual(1, 1.0001, 1e-5)
    ).toBe(false);
  });
});
