import { halley } from '../../../src/no-lineales/halley.js';
import {
  ErrorDivergencia,
  ErrorDominio,
  ErrorParametros,
} from '../../../src/core/errores.js';

describe('halley', () => {
  const cuadratica = {
    f: (x) => x * x - 2,
    df: (x) => 2 * x,
    d2f: () => 2,
  };

  test('converge a la raíz de x² − 2', () => {
    const res = halley({ ...cuadratica, x0: 1, tolerancia: 1e-10 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.SQRT2, 10);
  });

  test('converge a la raíz de x³ − 8', () => {
    const res = halley({
      f: (x) => x ** 3 - 8,
      df: (x) => 3 * x * x,
      d2f: (x) => 6 * x,
      x0: 3,
      tolerancia: 1e-10,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 10);
  });

  test('converge a la raíz de eˣ − 2', () => {
    const res = halley({
      f: (x) => Math.exp(x) - 2,
      df: Math.exp,
      d2f: Math.exp,
      x0: 1,
      tolerancia: 1e-10,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.LN2, 10);
  });

  test('informa que no convergió al agotar maxIter', () => {
    const res = halley({
      ...cuadratica,
      x0: 10,
      tolerancia: 1e-12,
      maxIter: 1,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(1);
  });

  test('lanza ErrorDominio si el denominador es cero', () => {
    // f(x) = 1/x en x = 1: 2·f′² − f·f″ = 2 − 2 = 0
    expect(() =>
      halley({
        f: (x) => 1 / x,
        df: (x) => -1 / (x * x),
        d2f: (x) => 2 / x ** 3,
        x0: 1,
      })
    ).toThrow(ErrorDominio);
  });

  test.each([
    ['f', NaN],
    ['df', NaN],
    ['df', Infinity],
    ['d2f', NaN],
    ['d2f', -Infinity],
  ])('lanza ErrorDivergencia si %s devuelve %p', (nombre, valor) => {
    expect(() =>
      halley({ ...cuadratica, [nombre]: () => valor, x0: 1 })
    ).toThrow(ErrorDivergencia);
  });

  test.each([
    ['f', 5],
    ['df', undefined],
    ['d2f', null],
    ['x0', NaN],
    ['x0', '1'],
    ['tolerancia', 0],
    ['tolerancia', -1e-6],
    ['maxIter', 0],
    ['maxIter', 1.5],
  ])('rechaza %s = %p', (nombre, valor) => {
    expect(() => halley({ ...cuadratica, x0: 1, [nombre]: valor })).toThrow(
      ErrorParametros
    );
  });
});


describe('Halley: precisión relativa y orden de convergencia', () => {
  const opciones = {
    f: (x) => x * x - 2,
    df: (x) => 2 * x,
    d2f: () => 2,
  };

  test.each([1e-4, 1e-8, 1e-12])(
    'obtiene la raíz negativa con tolerancia %p',
    (tolerancia) => {
      const res = halley({ ...opciones, x0: -3, tolerancia });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado + Math.SQRT2) / Math.SQRT2).toBeLessThan(
        tolerancia
      );
      expect(res.iteraciones.at(-1).error).toBeLessThan(tolerancia);
      res.iteraciones.slice(0, -1).forEach((iteracion) => {
        expect(iteracion.error).toBeGreaterThanOrEqual(tolerancia);
      });
    }
  );

  test.each([0.5, 2, 10])('converge desde la aproximación inicial %p', (x0) => {
    const res = halley({ ...opciones, x0, tolerancia: 1e-12 });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2) / Math.SQRT2).toBeLessThan(1e-12);
  });

  test('reducir a la mitad el error inicial muestra orden cúbico en un paso', () => {
    const errores = [0.2, 0.1, 0.05].map((paso) => {
      const res = halley({
        ...opciones,
        x0: Math.SQRT2 + paso,
        tolerancia: 1e-14,
        maxIter: 1,
      });
      expect(res.convergio).toBe(false);
      return Math.abs(res.resultado - Math.SQRT2);
    });

    for (let indice = 0; indice < errores.length - 1; indice++) {
      const orden = Math.log2(errores[indice] / errores[indice + 1]);
      expect(orden).toBeGreaterThan(2.8);
      expect(orden).toBeLessThan(3.1);
    }
  });

  test('una raíz doble presenta convergencia lineal con razón un tercio', () => {
    const res = halley({
      f: (x) => (x - 2) ** 2,
      df: (x) => 2 * (x - 2),
      d2f: () => 2,
      x0: 3,
      tolerancia: 1e-10,
    });
    const errores = res.iteraciones.map(({ x }) => Math.abs(x - 2));

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - 2) / 2).toBeLessThan(1e-10);
    for (let indice = 1; indice < 8; indice++) {
      expect(errores[indice] / errores[indice - 1]).toBeCloseTo(1 / 3, 10);
    }
  });

  test.each([1, 2])(
    'no anuncia convergencia si agota un presupuesto de %p pasos',
    (maxIter) => {
      const res = halley({
        ...opciones,
        x0: 10,
        tolerancia: 1e-14,
        maxIter,
      });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(maxIter);
      expect(res.iteraciones.at(-1).error).toBeGreaterThanOrEqual(1e-14);
      expect(Math.abs(res.resultado - Math.SQRT2)).toBeGreaterThan(1e-14);
    }
  );

  test('detecta que una actualización abandona el dominio del logaritmo', () => {
    expect(() => halley({
      f: Math.log,
      df: (x) => 1 / x,
      d2f: (x) => -1 / (x * x),
      x0: 0.1,
      maxIter: 5,
    })).toThrow(ErrorDivergencia);
  });
});
