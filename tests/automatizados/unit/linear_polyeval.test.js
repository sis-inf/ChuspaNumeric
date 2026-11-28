
import { linearInterpolation } from '../../../src/interpolacion/linear.js';
import { polyEval } from '../../../src/interpolacion/polyEval.js';
import {
  ErrorParametros,
  ErrorNumerico
} from '../../../src/core/errores.js';

describe('linearInterpolation', () => {
  test('interpola correctamente entre dos puntos conocidos', () => {
    const resultado = linearInterpolation(2, 4, 6, 12, 4);

    expect(resultado).toBeCloseTo(8, 10);
  });

  test('devuelve y0 al evaluar en x0', () => {
    expect(linearInterpolation(2, 4, 6, 12, 2))
      .toBeCloseTo(4, 10);
  });

  test('devuelve y1 al evaluar en x1', () => {
    expect(linearInterpolation(2, 4, 6, 12, 6))
      .toBeCloseTo(12, 10);
  });

  test('rechaza x0 igual a x1 con ErrorParametros', () => {
    expect(() => linearInterpolation(3, 4, 3, 12, 3))
      .toThrow(ErrorParametros);
  });

  test.each([0, 1, 2, 3, 4])(
    'rechaza valores no finitos en el argumento de posición %i',
    (posicion) => {
      for (const valor of [NaN, Infinity, -Infinity]) {
        const argumentos = [2, 4, 6, 12, 4];
        argumentos[posicion] = valor;

        expect(() => linearInterpolation(...argumentos))
          .toThrow(ErrorParametros);
      }
    }
  );
});

describe('polyEval', () => {
  test('evalúa correctamente un polinomio cuadrático mediante Horner', () => {
    const coeficientes = [2, 3, 1];

    const resultado = polyEval(coeficientes, 2);

    expect(resultado.resultado).toBeCloseTo(15, 10);
  });

  test('evalúa correctamente un polinomio constante', () => {
    const resultado = polyEval([5], 3);

    expect(resultado.resultado).toBeCloseTo(5, 10);
  });

  test('evalúa correctamente un polinomio lineal', () => {
    const resultado = polyEval([3, 2], 4);

    expect(resultado.resultado).toBeCloseTo(14, 10);
  });

  test('evalúa correctamente un polinomio en x igual a cero', () => {
    const resultado = polyEval([2, 3, 1], 0);

    expect(resultado.resultado).toBeCloseTo(1, 10);
  });

  test('rechaza una lista vacía de coeficientes', () => {
    expect(() => polyEval([], 2))
      .toThrow(ErrorParametros);
  });
});

describe('polyEval - validacion de parametros y contrato', () => {
  test.each([
    null,
    undefined,
    5,
    '123',
    {}
  ])('rechaza coeficientes que no sean arreglos: %p', (valor) => {
    expect(() => polyEval(valor, 2))
      .toThrow(ErrorParametros);
  });

  test.each([
    NaN,
    Infinity,
    -Infinity,
    '5',
    null,
    undefined,
    true
  ])('rechaza coeficientes invalidos: %p', (valor) => {
    expect(() => polyEval([2, valor, 1], 2))
      .toThrow(ErrorParametros);
  });

  test.each([
    NaN,
    Infinity,
    -Infinity,
    '2',
    null,
    undefined,
    true
  ])('rechaza valores invalidos de x: %p', (valor) => {
    expect(() => polyEval([2, 3, 1], valor))
      .toThrow(ErrorParametros);
  });

  test('rechaza arreglos con posiciones vacias', () => {
    const coeficientes = new Array(3);

    expect(() => polyEval(coeficientes, 2))
      .toThrow(ErrorParametros);
  });

  test('retorna el contrato estructurado de ChuspaNumeric', () => {
    const resultado = polyEval([2, 3, 1], 2);

    expect(resultado).toMatchObject({
      resultado: 15,
      iteraciones: [],
      convergio: true,
      mensaje: expect.any(String),
      meta: {
        metodo: 'polyEval',
        parametros: {
          coefficients: [2, 3, 1],
          x: 2
        },
        tiempo_ms: expect.any(Number)
      }
    });

    expect(resultado.meta.tiempo_ms)
      .toBeGreaterThanOrEqual(0);
  });

  test('no modifica el arreglo original de coeficientes', () => {
    const coeficientes = [2, 3, 1];

    polyEval(coeficientes, 2);

    expect(coeficientes).toEqual([2, 3, 1]);
  });

  test('evalua correctamente un polinomio con coeficientes negativos', () => {
    const resultado = polyEval([-2, 3, -1], 2);

    expect(resultado.resultado).toBeCloseTo(-3, 10);
  });

  test('evalua correctamente un polinomio en x negativo', () => {
    const resultado = polyEval([2, 3, 1], -2);

    expect(resultado.resultado).toBeCloseTo(3, 10);
  });

  test('evalua correctamente el polinomio cero', () => {
    const resultado = polyEval([0, 0, 0], 5);

    expect(resultado.resultado).toBe(0);
  });
});

describe('linearInterpolation - precision y orden de error', () => {
  test.each([0.4, 0.04, 0.004])(
    'reproduce una funcion lineal con paso h=%p',
    (h) => {
      const f = (x) => 3 * x + 2;

      const resultado = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      const errorAbsoluto = Math.abs(resultado - f(0));

      expect(errorAbsoluto).toBeLessThan(1e-12);
    }
  );

  test('presenta error de primer orden para f(x) = |x|', () => {
    const f = (x) => Math.abs(x);
    const pasos = [0.4, 0.2, 0.1];

    const errores = pasos.map((h) => {
      const aproximacion = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      return Math.abs(aproximacion - f(0));
    });

    expect(errores[1]).toBeLessThan(errores[0]);
    expect(errores[2]).toBeLessThan(errores[1]);

    expect(errores[1] / errores[0]).toBeCloseTo(0.5, 10);
    expect(errores[2] / errores[1]).toBeCloseTo(0.5, 10);
  });

  test('presenta error de segundo orden para f(x) = x^2', () => {
    const f = (x) => x * x;
    const pasos = [0.4, 0.2, 0.1];

    const errores = pasos.map((h) => {
      const aproximacion = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      return Math.abs(aproximacion - f(0));
    });

    expect(errores[1]).toBeLessThan(errores[0]);
    expect(errores[2]).toBeLessThan(errores[1]);

    expect(errores[1] / errores[0]).toBeCloseTo(0.25, 10);
    expect(errores[2] / errores[1]).toBeCloseTo(0.25, 10);
  });

  test.each([0.4, 0.2, 0.1])(
    'calcula el error relativo para un paso h=%p',
    (h) => {
      const f = (x) => 1 + x * x;
      const esperado = f(0);

      const aproximacion = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      const errorRelativo =
        Math.abs(aproximacion - esperado) / Math.abs(esperado);

      expect(errorRelativo).toBeCloseTo(h * h, 10);
    }
  );

  test('una malla gruesa no alcanza la tolerancia y una fina si', () => {
    const f = (x) => 1 + x * x;
    const tolerancia = 1e-3;

    const calcularError = (h) => {
      const aproximacion = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      return Math.abs(aproximacion - f(0));
    };

    const errorGrueso = calcularError(0.2);
    const errorFino = calcularError(0.02);

    expect(errorGrueso).toBeGreaterThan(tolerancia);
    expect(errorFino).toBeLessThan(tolerancia);
  });
});

describe('polyEval - precision y comportamiento numerico', () => {
  test.each([
    [0.1, 1.01],
    [0.01, 1.0001],
    [0.001, 1.000001],
  ])(
    'evalua x^2 + 1 con x=%p y error relativo estricto',
    (x, esperado) => {
      const resultado = polyEval([1, 0, 1], x).resultado;

      const errorRelativo =
        Math.abs(resultado - esperado) / Math.abs(esperado);

      expect(errorRelativo).toBeLessThan(1e-12);
    }
  );

  test('un polinomio sin raices reales no se aproxima a cero', () => {
    const pasos = [0.1, 0.01, 0.001];

    const valores = pasos.map((h) =>
      polyEval([1, 0, 1], h).resultado
    );

    valores.forEach((valor) => {
      expect(valor).toBeGreaterThanOrEqual(1);
    });

    expect(valores[2]).toBeCloseTo(1, 5);
  });
});

describe('linearInterpolation y polyEval - no convergencia y desbordamiento', () => {
  test('el error no disminuye al interpolar una discontinuidad', () => {
    const f = (x) => (x < 0 ? -1 : 1);
    const pasos = [0.4, 0.2, 0.1, 0.05];
    const tolerancia = 1e-6;

    const errores = pasos.map((h) => {
      const aproximacion = linearInterpolation(
        -h, f(-h),
        h, f(h),
        0
      );

      return Math.abs(aproximacion - f(0));
    });

    errores.forEach((error) => {
      expect(error).toBeGreaterThan(tolerancia);
      expect(error).toBeCloseTo(1, 10);
    });

    expect(errores[3]).toBeCloseTo(errores[0], 10);
  });

  test('rechaza un resultado no finito por desbordamiento numerico', () => {
    expect(() => polyEval([1, 0, 0], 1e200))
      .toThrow(ErrorNumerico);
  });
});
