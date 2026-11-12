import {
  sumaComplejos,
  productoComplejos,
  moduloComplejo,
  conjugadoComplejo,
  divisionComplejos,
} from '../../../src/utils/numeros_complejos.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('numeros_complejos', () => {
  test('sumaComplejos suma parte real e imaginaria', () => {
    expect(sumaComplejos({ re: 1, im: 2 }, { re: 3, im: 4 })).toEqual({ re: 4, im: 6 });
  });

  test('productoComplejos: (1+2i)(3+4i) = -5+10i', () => {
    expect(productoComplejos({ re: 1, im: 2 }, { re: 3, im: 4 })).toEqual({ re: -5, im: 10 });
  });

  test('moduloComplejo({ re: 3, im: 4 }) es 5', () => {
    expect(moduloComplejo({ re: 3, im: 4 })).toBe(5);
  });

  test('conjugadoComplejo cambia el signo de la parte imaginaria', () => {
    expect(conjugadoComplejo({ re: 3, im: 4 })).toEqual({ re: 3, im: -4 });
  });

  test('divisionComplejos: (1+2i)/(3+4i) = 0.44+0.08i', () => {
    const r = divisionComplejos({ re: 1, im: 2 }, { re: 3, im: 4 });
    expect(r.re).toBeCloseTo(0.44);
    expect(r.im).toBeCloseTo(0.08);
  });

  test('divisionComplejos lanza ErrorParametros al dividir por cero', () => {
    expect(() => divisionComplejos({ re: 1, im: 2 }, { re: 0, im: 0 })).toThrow(ErrorParametros);
  });

  test.each([
    ['re no numérico', { re: 'a', im: 1 }],
    ['im no numérico', { re: 1, im: null }],
    ['sin propiedades', {}],
  ])('lanza ErrorParametros con un complejo inválido (%s)', (_nombre, invalido) => {
    expect(() => sumaComplejos(invalido, { re: 1, im: 1 })).toThrow(ErrorParametros);
  });
});