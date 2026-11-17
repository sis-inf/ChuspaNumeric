import { euler } from '../../../src/edo/euler.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('euler - método explícito', () => {

  test('resuelve una EDO con solución analítica conocida', () => {
    // EDO: y' = y, con condición inicial y(0) = 1.
    const res = euler({
      f: (x, y) => y,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    });

    // La solución exacta es y(1) = e.
    expect(res.convergio).toBe(true);
    expect(res.resultado[10][0]).toBeCloseTo(1, 10);
    expect(res.resultado[10][1]).toBeCloseTo(2.5937, 4);
    expect(res.resultado[10][1]).not.toBeCloseTo(Math.E, 3);
  });

  test('un paso menor produce una aproximación más precisa', () => {
    const f = (x, y) => y;

    const resPasoGrande = euler({
      f,
      x0: 0,
      y0: 1,
      h: 0.2,
      xFinal: 1
    });

    const resPasoPequeno = euler({
      f,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    });

    const errorPasoGrande = Math.abs(
      resPasoGrande.resultado[5][1] - Math.E
    );

    const errorPasoPequeno = Math.abs(
      resPasoPequeno.resultado[10][1] - Math.E
    );

    expect(errorPasoPequeno).toBeLessThan(errorPasoGrande);
  });

  test('registra correctamente los valores de las iteraciones', () => {
    // EDO: y' = x + y, con x0 = 0, y0 = 1 y h = 0.5.
    const res = euler({
      f: (x, y) => x + y,
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.iteraciones).toHaveLength(3);

    expect(res.iteraciones[0]).toEqual({
      n: 0,
      x: 0,
      y: 1,
      fxy: 1
    });

    expect(res.iteraciones[1]).toEqual({
      n: 1,
      x: 0.5,
      y: 1.5,
      fxy: 2
    });

    expect(res.iteraciones[2]).toEqual({
      n: 2,
      x: 1,
      y: 2.5,
      fxy: 3.5
    });
  });

  test('rechaza una función inválida', () => {
    expect(() => euler({
      f: 5,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza valores iniciales no numéricos o no finitos', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: '0',
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: NaN,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: Infinity,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza un paso igual o menor que cero', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: 0,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: -0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza xFinal menor o igual que x0', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: 1,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 2,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('devuelve los metadatos del método y sus parámetros', () => {
    const res = euler({
      f: (x, y) => y,
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.meta.metodo).toBe('Euler');
    expect(res.meta.parametros).toEqual({
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toHaveLength(3);
  });

});