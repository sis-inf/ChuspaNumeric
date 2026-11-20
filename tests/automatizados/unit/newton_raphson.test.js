import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';
import {
  ErrorDivergencia,
  ErrorDominio,
  ErrorParametros,
  ErrorTimeout,
} from '../../../src/core/errores.js';

// f(x) = x² - 2, raíz conocida √2
const f = (x) => x * x - 2;
const df = (x) => 2 * x;

describe('newtonRaphson - convergencia a una raíz conocida', () => {
  test('encuentra √2 dentro de la tolerancia solicitada', () => {
    const tolerancia = 1e-10;

    const res = newtonRaphson({ f, df, x0: 1, tolerancia });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(tolerancia);
    expect(res.mensaje).toBe('Método convergió correctamente.');
  });

  test('encuentra la raíz de cos(x) - x', () => {
    const res = newtonRaphson({
      f: (x) => Math.cos(x) - x,
      df: (x) => -Math.sin(x) - 1,
      x0: 1,
      tolerancia: 1e-12,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(0.7390851332151607, 11);
  });

  test('devuelve la metadata del contrato', () => {
    const res = newtonRaphson({ f, df, x0: 1 });

    expect(res.meta.metodo).toBe('newton-raphson');
    expect(res.meta.parametros).toEqual({
      x0: 1,
      tolerancia: 1e-6,
      maxIter: 100,
      timeoutMs: null,
    });
  });
});

describe('newtonRaphson - criterio de parada y máximo de iteraciones', () => {
  test('se detiene en la primera iteración con error menor a la tolerancia', () => {
    const tolerancia = 1e-8;

    const res = newtonRaphson({ f, df, x0: 1, tolerancia });
    const { iteraciones } = res;
    const ultima = iteraciones[iteraciones.length - 1];

    expect(ultima.error).toBeLessThan(tolerancia);
    for (const it of iteraciones.slice(0, -1)) {
      expect(it.error).toBeGreaterThanOrEqual(tolerancia);
    }
    expect(iteraciones.map((it) => it.n)).toEqual(
      iteraciones.map((_, i) => i + 1)
    );
  });

  test('cada iteración registra n, x, fx, dfx y error', () => {
    const res = newtonRaphson({ f, df, x0: 1 });
    const primera = res.iteraciones[0];

    expect(primera).toEqual({ n: 1, x: 1, fx: -1, dfx: 2, error: 0.5 });
  });

  test('si x0 ya es la raíz converge en una iteración', () => {
    const res = newtonRaphson({
      f: (x) => x - 3,
      df: () => 1,
      x0: 3,
    });

    expect(res.convergio).toBe(true);
    expect(res.iteraciones).toHaveLength(1);
    expect(res.resultado).toBe(3);
  });

  test('se detiene con ErrorTimeout si supera timeoutMs', () => {
    // Cada evaluación de f tarda ~5 ms; desde x0 = 1000 hacen falta más de
    // 5 iteraciones, así que el chequeo de la iteración 6 ya superó 1 ms.
    const fLenta = (x) => {
      const fin = performance.now() + 5;
      while (performance.now() < fin) {
        // espera activa
      }
      return f(x);
    };

    expect(() =>
      newtonRaphson({ f: fLenta, df, x0: 1000, timeoutMs: 1 })
    ).toThrow(ErrorTimeout);
  });

  test('con timeoutMs holgado converge normalmente', () => {
    const res = newtonRaphson({ f, df, x0: 1, timeoutMs: 10000 });

    expect(res.convergio).toBe(true);
    expect(res.meta.parametros.timeoutMs).toBe(10000);
  });

  test('respeta maxIter y avisa que no convergió', () => {
    const res = newtonRaphson({ f, df, x0: 1000, maxIter: 3 });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(3);
    expect(res.mensaje).toBe(
      'Se alcanzó el máximo de iteraciones sin converger.'
    );
  });
});

describe('newtonRaphson - derivada nula y entradas inválidas', () => {
  test('derivada cero lanza ErrorDominio', () => {
    expect(() =>
      newtonRaphson({ f: (x) => x * x - 1, df: (x) => 2 * x, x0: 0 })
    ).toThrow(ErrorDominio);
    expect(() =>
      newtonRaphson({ f: (x) => x * x - 1, df: (x) => 2 * x, x0: 0 })
    ).toThrow('la derivada es cero en x = 0');
  });

  test('un valor NaN durante la iteración lanza ErrorDivergencia', () => {
    expect(() =>
      newtonRaphson({ f: () => NaN, df: () => 1, x0: 1 })
    ).toThrow(ErrorDivergencia);
  });

  test.each([
    ['f no es función', { f: 5, df, x0: 1 }],
    ['df no es función', { f, df: undefined, x0: 1 }],
    ['x0 no numérico', { f, df, x0: '1' }],
    ['x0 NaN', { f, df, x0: NaN }],
    ['tolerancia cero', { f, df, x0: 1, tolerancia: 0 }],
    ['tolerancia negativa', { f, df, x0: 1, tolerancia: -1e-6 }],
    ['maxIter cero', { f, df, x0: 1, maxIter: 0 }],
    ['maxIter no entero', { f, df, x0: 1, maxIter: 2.5 }],
    ['timeoutMs negativo', { f, df, x0: 1, timeoutMs: -10 }],
  ])('%s lanza ErrorParametros', (_caso, opciones) => {
    expect(() => newtonRaphson(opciones)).toThrow(ErrorParametros);
  });
});


describe('Newton-Raphson: precisión, orden y ciclos', () => {
  test.each([1e-4, 1e-8, 1e-12])(
    'calcula la raíz negativa con error relativo menor que %p',
    (tolerancia) => {
      const res = newtonRaphson({ f, df, x0: -3, tolerancia });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado + Math.SQRT2) / Math.SQRT2).toBeLessThan(
        tolerancia
      );
      expect(res.iteraciones.at(-1).error).toBeLessThan(tolerancia);
    }
  );

  test.each([0.5, 2, 10])('converge desde la aproximación inicial %p', (x0) => {
    const res = newtonRaphson({ f, df, x0, tolerancia: 1e-12 });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2) / Math.SQRT2).toBeLessThan(1e-12);
  });

  test('una raíz simple presenta convergencia cuadrática', () => {
    const res = newtonRaphson({ f, df, x0: 2, tolerancia: 1e-12 });
    const errores = res.iteraciones.map(({ x }) => Math.abs(x - Math.SQRT2));

    expect(res.convergio).toBe(true);
    for (let indice = 1; indice < 3; indice++) {
      const razon = errores[indice + 1] / errores[indice] ** 2;
      expect(razon).toBeGreaterThan(0.3);
      expect(razon).toBeLessThan(0.4);
    }
  });

  test('una raíz doble reduce el error linealmente', () => {
    const res = newtonRaphson({
      f: (x) => (x - 2) ** 2,
      df: (x) => 2 * (x - 2),
      x0: 3,
      tolerancia: 1e-10,
    });
    const errores = res.iteraciones.map(({ x }) => Math.abs(x - 2));

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - 2) / 2).toBeLessThan(1e-10);
    for (let indice = 1; indice < errores.length; indice++) {
      expect(errores[indice] / errores[indice - 1]).toBeCloseTo(0.5, 12);
    }
  });

  test.each([2, 6])('un ciclo de dos puntos no converge en %p pasos', (maxIter) => {
    const res = newtonRaphson({
      f: (x) => x ** 3 - 2 * x + 2,
      df: (x) => 3 * x ** 2 - 2,
      x0: 0,
      tolerancia: 1e-12,
      maxIter,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(maxIter);
    res.iteraciones.forEach((iteracion, indice) => {
      expect(iteracion.x).toBe(indice % 2);
      expect(iteracion.error).toBe(1);
    });
  });

  test('detecta divergencia cuando el siguiente paso desborda', () => {
    expect(() =>
      newtonRaphson({ f: () => 1, df: () => Number.MIN_VALUE, x0: 1 })
    ).toThrow(ErrorDivergencia);
  });
});
