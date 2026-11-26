import { biseccion } from '../../../src/no-lineales/biseccion.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';
describe('biseccion - casos de borde', () => {
  test('encuentra la raíz de x² - 4 en [0,3]', () => {
    const f = (x) => x * x - 4;

    const res = biseccion({
      f,
      a: 0,
      b: 3,
      tolerancia: 1e-6
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 5);
  });

  test('intervalo sin cambio de signo lanza error', () => {
    const f = (x) => x * x + 1;

    expect(() =>
      biseccion({
        f,
        a: 0,
        b: 3
      })
    ).toThrow();
  });

  test('tolerancia 1e-10 produce resultado preciso', () => {
    const f = (x) => x * x - 4;

    const res = biseccion({
      f,
      a: 0,
      b: 3,
      tolerancia: 1e-10
    });

    expect(res.resultado).toBeCloseTo(2, 9);
  });

  test('las iteraciones contienen a, b, c y fc', () => {
    const f = (x) => x * x - 4;

    const res = biseccion({
      f,
      a: 0,
      b: 3
    });

    const iteracion = res.iteraciones[0];

    expect(iteracion).toHaveProperty('a');
    expect(iteracion).toHaveProperty('b');
    expect(iteracion).toHaveProperty('c');
    expect(iteracion).toHaveProperty('fc');
  });
});

describe('biseccion - precision y error relativo', () => {
  test.each([1e-2, 1e-4, 1e-6, 1e-10])(
    'calcula la raiz con tolerancia %s',
    (tolerancia) => {
      const f = (x) => x * x - 2;
      const raizExacta = Math.sqrt(2);

      const res = biseccion({
        f,
        a: 1,
        b: 2,
        tolerancia
      });

      const errorRelativo = Math.abs(
        (raizExacta - res.resultado) / raizExacta
      );

      expect(res.convergio).toBe(true);
      expect(errorRelativo).toBeLessThanOrEqual(tolerancia);
    }
  );
});

describe('biseccion - diferentes intervalos', () => {
  test.each([
    [1, 2],
    [0, 4],
    [0, 10],
    [1.4, 1.5]
  ])(
    'converge en el intervalo [%s, %s]',
    (a, b) => {
      const tolerancia = 1e-6;

      const res = biseccion({
        f: (x) => x * x - 2,
        a,
        b,
        tolerancia
      });

      const error = Math.abs(
        Math.sqrt(2) - res.resultado
      );

      expect(res.convergio).toBe(true);
      expect(error).toBeLessThan(tolerancia);
    }
  );
});

describe('biseccion - convergencia', () => {
  test('el error se reduce a la mitad en cada iteracion', () => {
    const res = biseccion({
      f: (x) => x * x - 2,
      a: 1,
      b: 2,
      tolerancia: 1e-8
    });

    expect(res.convergio).toBe(true);
    expect(res.iteraciones.length).toBeGreaterThan(1);

    for (let i = 1; i < res.iteraciones.length; i++) {
      const anterior = res.iteraciones[i - 1].error;
      const actual = res.iteraciones[i].error;

      expect(actual / anterior).toBeCloseTo(0.5, 12);
    }
  });

  test('una tolerancia menor requiere mas iteraciones', () => {
    const f = (x) => x * x - 2;

    const res1 = biseccion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-3
    });

    const res2 = biseccion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-10
    });

    expect(res1.convergio).toBe(true);
    expect(res2.convergio).toBe(true);

    expect(res2.iteraciones.length).toBeGreaterThan(
      res1.iteraciones.length
    );
  });

  test('el error final es menor que la tolerancia', () => {
    const tolerancia = 1e-8;

    const res = biseccion({
      f: (x) => x * x - 2,
      a: 1,
      b: 2,
      tolerancia
    });

    const ultima =
      res.iteraciones[res.iteraciones.length - 1];

    expect(res.convergio).toBe(true);
    expect(ultima.error).toBeLessThan(tolerancia);
  });
});

describe('biseccion - no convergencia y divergencia', () => {
  test.each([1, 3, 5])(
    'detecta no convergencia con maxIter igual a %s',
    (maxIter) => {
      const res = biseccion({
        f: (x) => x * x - 2,
        a: 1,
        b: 2,
        tolerancia: 1e-12,
        maxIter
      });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones.length).toBe(maxIter);
      expect(res.mensaje).toContain('sin converger');

      const ultima =
        res.iteraciones[res.iteraciones.length - 1];

      expect(ultima.error).toBeGreaterThanOrEqual(1e-12);
    }
  );

  test('con suficientes iteraciones logra converger', () => {
    const res = biseccion({
      f: (x) => x * x - 2,
      a: 1,
      b: 2,
      tolerancia: 1e-12,
      maxIter: 100
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.sqrt(2), 11);
  });

  test('detecta un resultado no finito', () => {
    const f = (x) => x < 1.5e308 ? -1 : 1;

    expect(() =>
      biseccion({
        f,
        a: 1e308,
        b: 1.7e308,
        maxIter: 1
      })
    ).toThrow(ErrorDivergencia);
  });
});
