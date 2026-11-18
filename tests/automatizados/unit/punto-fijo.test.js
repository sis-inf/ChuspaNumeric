import { puntoFijo } from '../../../src/no-lineales/punto-fijo.js';
import { ErrorConvergencia } from '../../../src/core/errores.js';

describe('puntoFijo', () => {

 test('encuentra la raíz usando una función de punto fijo convergente', () => {
  const g = (x) => (x + 2 / x) / 2;

  const res = puntoFijo({
    g,
    x0: 1,
    tolerancia: 1e-8
  });

  expect(res.convergio).toBe(true);
  expect(res.resultado).toBeCloseTo(Math.sqrt(2), 6);

  expect(res.iteraciones.length).toBeGreaterThan(0);
  expect(res.meta.metodo).toBe('Punto Fijo');
  });

  test('lanza ErrorConvergencia cuando no converge', () => {

    const g = (x) => x + 1;

    expect(() =>
      puntoFijo({
        g,
        x0: 1,
        maxIter: 5
      })
    ).toThrow(ErrorConvergencia);

  });

});


describe('punto fijo: precisión y orden de convergencia', () => {
  test.each([1e-4, 1e-8, 1e-12])(
    'cumple el error relativo y el criterio de parada con tolerancia %p',
    (tolerancia) => {
      const res = puntoFijo({
        g: (x) => (x + 3) / 2,
        x0: 0,
        tolerancia,
        maxIter: 100,
      });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado - 3) / 3).toBeLessThan(tolerancia);
      expect(res.iteraciones.at(-1).error).toBeLessThan(tolerancia);
      res.iteraciones.slice(0, -1).forEach((iteracion) => {
        expect(iteracion.error).toBeGreaterThanOrEqual(tolerancia);
      });
    }
  );

  test.each([-3, 0, 9])('converge desde la aproximación inicial %p', (x0) => {
    const res = puntoFijo({
      g: (x) => (x + 3) / 2,
      x0,
      tolerancia: 1e-10,
    });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - 3) / 3).toBeLessThan(1e-10);
  });

  test('la contracción afín reduce a la mitad el error de cada paso', () => {
    const res = puntoFijo({ g: (x) => (x + 3) / 2, x0: 0, tolerancia: 1e-8 });
    const errores = res.iteraciones.map(({ gx }) => Math.abs(gx - 3));

    for (let indice = 1; indice < errores.length; indice++) {
      expect(errores[indice] / errores[indice - 1]).toBeCloseTo(0.5, 12);
    }
  });

  test('la iteración para raíz cuadrada presenta convergencia cuadrática', () => {
    const res = puntoFijo({
      g: (x) => (x + 2 / x) / 2,
      x0: 1,
      tolerancia: 1e-12,
    });
    const errores = res.iteraciones.map(({ gx }) => Math.abs(gx - Math.SQRT2));

    expect(res.convergio).toBe(true);
    for (let indice = 0; indice < 2; indice++) {
      const razon = errores[indice + 1] / errores[indice] ** 2;
      expect(razon).toBeGreaterThan(0.3);
      expect(razon).toBeLessThan(0.4);
    }
  });

  test('una tolerancia menor requiere más iteraciones de la contracción', () => {
    const resultados = [1e-4, 1e-8, 1e-12].map((tolerancia) =>
      puntoFijo({ g: (x) => (x + 3) / 2, x0: 0, tolerancia })
    );

    for (let indice = 1; indice < resultados.length; indice++) {
      expect(resultados[indice].iteraciones.length).toBeGreaterThan(
        resultados[indice - 1].iteraciones.length
      );
      expect(Math.abs(resultados[indice].resultado - 3)).toBeLessThan(
        Math.abs(resultados[indice - 1].resultado - 3)
      );
    }
  });

  test.each([
    ['oscilación', (x) => -x],
    ['divergencia', (x) => 2 * x],
  ])('rechaza la %s al agotar las iteraciones', (_caso, g) => {
    let evaluaciones = 0;
    expect(() =>
      puntoFijo({
        g: (x) => {
          evaluaciones++;
          return g(x);
        },
        x0: 1,
        tolerancia: 1e-12,
        maxIter: 8,
      })
    ).toThrow(ErrorConvergencia);
    expect(evaluaciones).toBe(8);
  });

  test('informa no convergencia si el presupuesto no alcanza para una contracción', () => {
    expect(() =>
      puntoFijo({
        g: (x) => (x + 3) / 2,
        x0: 0,
        tolerancia: 1e-12,
        maxIter: 2,
      })
    ).toThrow(ErrorConvergencia);
  });
});
