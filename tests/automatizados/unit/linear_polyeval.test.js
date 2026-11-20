import { linearInterpolation } from '../../../src/interpolacion/linear.js';
import { polyEval } from '../../../src/interpolacion/polyEval.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('linearInterpolation', () => {
  test('interpola correctamente entre dos puntos conocidos', () => {
    // Puntos: (2, 4) y (6, 12)
    // y = 4 + (4 - 2) * (12 - 4) / (6 - 2) = 8

    const resultado = linearInterpolation(2, 4, 6, 12, 4);

    expect(resultado).toBeCloseTo(8, 10);
  });

  test('devuelve y0 al evaluar en x0', () => {
    expect(linearInterpolation(2, 4, 6, 12, 2)).toBeCloseTo(4, 10);
  });

  test('devuelve y1 al evaluar en x1', () => {
    expect(linearInterpolation(2, 4, 6, 12, 6)).toBeCloseTo(12, 10);
  });

  test('rechaza x0 igual a x1 con ErrorParametros', () => {
    expect(() => linearInterpolation(3, 4, 3, 12, 3)).toThrow(ErrorParametros);
  });

  test.each([0, 1, 2, 3, 4])(
    'rechaza valores no finitos en el argumento de posición %i',
    (posicion) => {
      for (const valor of [NaN, Infinity, -Infinity]) {
        const argumentos = [2, 4, 6, 12, 4];
        argumentos[posicion] = valor;

        expect(() => linearInterpolation(...argumentos)).toThrow(
          ErrorParametros
        );
      }
    }
  );
});

describe('polyEval', () => {
  test('evalúa correctamente un polinomio cuadrático mediante Horner', () => {
    // P(x) = 2x² + 3x + 1
    // P(2) = 15
    const coeficientes = [2, 3, 1];

    const resultado = polyEval(coeficientes, 2).resultado;

    expect(resultado).toBeCloseTo(15, 10);
  });

  test('evalúa correctamente un polinomio constante', () => {
    // P(x) = 5
    const resultado = polyEval([5], 3).resultado;

    expect(resultado).toBeCloseTo(5, 10);
  });

  test('evalúa correctamente un polinomio lineal', () => {
    // P(x) = 3x + 2
    // P(4) = 14
    const resultado = polyEval([3, 2], 4).resultado;

    expect(resultado).toBeCloseTo(14, 10);
  });

  test('evalúa correctamente un polinomio en x igual a cero', () => {
    // P(x) = 2x² + 3x + 1
    // P(0) = 1
    const resultado = polyEval([2, 3, 1], 0).resultado;

    expect(resultado).toBeCloseTo(1, 10);
  });

  test('rechaza una lista vacía de coeficientes', () => {
    expect(() => polyEval([], 2)).toThrow(
      'El array de coeficientes no puede estar vacío'
    );
  });
});

describe('polyEval - resultado estructurado y validaciones', () => {
  const capturar = (fn) => {
    try {
      fn();
    } catch (e) {
      return e;
    }
    return null;
  };

  test('devuelve el resultado estructurado de la evaluación', () => {
    const res = polyEval([2, 3, 1], 2);

    expect(res.resultado).toBeCloseTo(15, 10);
    expect(res.iteraciones).toBe(2);
    expect(res.convergencia).toEqual({
      aplica: false,
      motivo: 'Método de evaluación directa'
    });
    expect(res.exito).toBe(true);
    expect(res.metodo).toBe('Horner');
  });

  test('evalúa un polinomio constante', () => {
    expect(polyEval([5], 3).resultado).toBe(5);
    expect(polyEval([5], 3).iteraciones).toBe(0);
  });

  test('evalúa un polinomio lineal', () => {
    expect(polyEval([3, 2], 4).resultado).toBe(14);
  });

  test('rechaza arreglos vacíos con ErrorParametros', () => {
    expect(capturar(() => polyEval([], 2)).name).toBe('ErrorParametros');
  });

  test('rechaza coeficientes que no son un arreglo', () => {
    const error = capturar(() => polyEval('no', 2));

    expect(error.name).toBe('ErrorParametros');
    expect(error.message).toMatch(/arreglo/);
  });

  test('rechaza coeficientes no finitos indicando la posición', () => {
    const error = capturar(() => polyEval([2, NaN, 1], 2));

    expect(error.name).toBe('ErrorParametros');
    expect(error.message).toMatch(/posición 1/);
  });

  test('rechaza x no finito', () => {
    const error = capturar(() => polyEval([2, 3, 1], Infinity));

    expect(error.name).toBe('ErrorParametros');
    expect(error.message).toMatch(/x debe ser un número finito/);
  });

  test('rechaza el desbordamiento numérico', () => {
    const error = capturar(() => polyEval([1e308, 1e308], 10));

    expect(error.name).toBe('ErrorParametros');
    expect(error.message).toMatch(/Desbordamiento/);
  });
});
