import { evaluarHorner } from '../../../src/polinomios/horner.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('evaluarHorner', () => {
    test('evalúa el polinomio [2, -6, 2, -1] en x = 3 y devuelve 5', () => {
        expect(evaluarHorner([2, -6, 2, -1], 3)).toBe(5);
    });

    test('evalúa un polinomio constante y devuelve 7', () => {
        expect(evaluarHorner([7], 100)).toBe(7);
    });

    test('evalúa el polinomio [1, 0, 0] en x = 2 y devuelve 4', () => {
        expect(evaluarHorner([1, 0, 0], 2)).toBe(4);
    });

    test('lanza ErrorParametros cuando el arreglo está vacío', () => {
        expect(() => evaluarHorner([], 2)).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros cuando el valor no es un arreglo', () => {
        expect(() => evaluarHorner(null, 2)).toThrow(ErrorParametros);
    });
});

describe('evaluarHorner - precision y comportamiento numerico', () => {
  test.each([
    [0.2, 0.04],
    [0.1, 0.01],
    [0.05, 0.0025],
  ])(
    'evalua (x - 1)^2 cerca de la raiz con h=%p',
    (h, esperado) => {
      const resultado = evaluarHorner([1, -2, 1], 1 + h);

      expect(resultado).toBeCloseTo(esperado, 10);
    }
  );

  test('presenta comportamiento de primer orden cerca de una raiz simple', () => {
    const pasos = [0.2, 0.1, 0.05];

    const valores = pasos.map((h) =>
      Math.abs(evaluarHorner([1, -1], 1 + h))
    );

    expect(valores[1]).toBeLessThan(valores[0]);
    expect(valores[2]).toBeLessThan(valores[1]);

    expect(valores[1] / valores[0]).toBeCloseTo(0.5, 10);
    expect(valores[2] / valores[1]).toBeCloseTo(0.5, 10);
  });

  test('presenta comportamiento de segundo orden cerca de una raiz doble', () => {
    const pasos = [0.2, 0.1, 0.05];

    const valores = pasos.map((h) =>
      Math.abs(evaluarHorner([1, -2, 1], 1 + h))
    );

    expect(valores[1]).toBeLessThan(valores[0]);
    expect(valores[2]).toBeLessThan(valores[1]);

    expect(valores[1] / valores[0]).toBeCloseTo(0.25, 8);
    expect(valores[2] / valores[1]).toBeCloseTo(0.25, 8);
  });

  test('mantiene un error relativo pequeno al evaluar un polinomio', () => {
    const pasos = [0.2, 0.1, 0.05];

    const erroresRelativos = pasos.map((h) => {
      const esperado = h * h;
      const resultado = evaluarHorner([1, -2, 1], 1 + h);

      return Math.abs(resultado - esperado) / esperado;
    });

    erroresRelativos.forEach((error) => {
      expect(error).toBeLessThan(1e-10);
    });
  });

  test.each([1e-6, 1e-8, 1e-10])(
    'respeta la tolerancia %p al evaluar un polinomio cuadratico',
    (tolerancia) => {
      const resultado = evaluarHorner([1, -2, 1], 1.1);
      const esperado = 0.01;

      expect(Math.abs(resultado - esperado)).toBeLessThan(tolerancia);
    }
  );

  test('el valor no se aproxima a cero si el polinomio no tiene esa raiz', () => {
    const pasos = [0.2, 0.1, 0.05];
    const tolerancia = 1e-6;

    const valores = pasos.map((h) =>
      evaluarHorner([1], 1 + h)
    );

    valores.forEach((valor) => {
      expect(Math.abs(valor)).toBeGreaterThan(tolerancia);
      expect(valor).toBe(1);
    });
  });

  test('devuelve Infinity cuando la evaluacion desborda el rango numerico', () => {
    const resultado = evaluarHorner([1, 0, 0], 1e200);

    expect(resultado).toBe(Infinity);
    expect(Number.isFinite(resultado)).toBe(false);
  });

  test.each([NaN, Infinity, -Infinity])(
    'rechaza un punto de evaluacion no finito: %p',
    (x) => {
      expect(() => evaluarHorner([1, -2, 1], x))
        .toThrow(ErrorParametros);
    }
  );
});
