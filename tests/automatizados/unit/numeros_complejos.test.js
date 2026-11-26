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

describe('numeros_complejos - precisión', () => {
  test.each([4, 8, 12])(
    'mantiene la precisión de la división con %i decimales',
    (decimales) => {
      const resultado = divisionComplejos(
        { re: 1, im: 2 },
        { re: 3, im: 4 }
      );

      expect(resultado.re).toBeCloseTo(0.44, decimales);
      expect(resultado.im).toBeCloseTo(0.08, decimales);
    }
  );

  test.each([4, 8, 12])(
    'calcula el módulo de un complejo con %i decimales de precisión',
    (decimales) => {
      const resultado = moduloComplejo({ re: 1, im: 1 });

      expect(resultado).toBeCloseTo(Math.sqrt(2), decimales);
    }
  );

  test('mantiene la precisión al operar con valores decimales', () => {
    const resultado = sumaComplejos(
      { re: 0.1, im: 0.2 },
      { re: 0.2, im: 0.3 }
    );

    expect(resultado.re).toBeCloseTo(0.3, 14);
    expect(resultado.im).toBeCloseTo(0.5, 14);
  });
});

describe('numeros_complejos - error relativo', () => {
  test('el error relativo de la parte real de una división es pequeño', () => {
    const esperado = 0.44;

    const resultado = divisionComplejos(
      { re: 1, im: 2 },
      { re: 3, im: 4 }
    );

    const errorRelativo = Math.abs(
      (resultado.re - esperado) / esperado
    );

    expect(errorRelativo).toBeLessThan(1e-14);
  });

  test('el error relativo de la parte imaginaria de una división es pequeño', () => {
    const esperado = 0.08;

    const resultado = divisionComplejos(
      { re: 1, im: 2 },
      { re: 3, im: 4 }
    );

    const errorRelativo = Math.abs(
      (resultado.im - esperado) / esperado
    );

    expect(errorRelativo).toBeLessThan(1e-14);
  });

  test('el error relativo del módulo calculado es pequeño', () => {
    const esperado = Math.sqrt(2);
    const resultado = moduloComplejo({ re: 1, im: 1 });

    const errorRelativo = Math.abs(
      (resultado - esperado) / esperado
    );

    expect(errorRelativo).toBeLessThan(1e-14);
  });
});

describe('numeros_complejos - casos límite y validación', () => {
  test('el módulo del complejo cero es cero', () => {
    expect(moduloComplejo({ re: 0, im: 0 })).toBe(0);
  });

  test('el conjugado de un número real conserva su valor', () => {
    expect(conjugadoComplejo({ re: 5, im: 0 })).toEqual({
      re: 5,
      im: -0,
    });
  });

  test('la división entre complejos con denominador imaginario puro es correcta', () => {
    const resultado = divisionComplejos(
      { re: 1, im: 0 },
      { re: 0, im: 1 }
    );

    expect(resultado.re).toBeCloseTo(0, 12);
    expect(resultado.im).toBeCloseTo(-1, 12);
  });

  test.each([
    [{ re: NaN, im: 1 }],
    [{ re: 1, im: NaN }],
    [{ re: Infinity, im: 1 }],
    [{ re: 1, im: -Infinity }],
  ])('rechaza componentes no finitos: %p', (invalido) => {
    expect(() => moduloComplejo(invalido)).toThrow(ErrorParametros);
  });

  test('rechaza un denominador complejo nulo', () => {
    expect(() =>
      divisionComplejos(
        { re: 5, im: 3 },
        { re: 0, im: 0 }
      )
    ).toThrow(ErrorParametros);
  });
});