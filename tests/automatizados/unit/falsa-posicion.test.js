import { falsaPosicion } from '../../../src/no-lineales/falsa-posicion.js';
import { ErrorParametros, ErrorConvergencia } from '../../../src/core/errores.js';

describe('falsaPosicion', () => {

  test('encuentra la raíz de x² - 2 en el intervalo [1, 2]', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(1e-4);
  });

  test('la primera iteración tiene n igual a 1 y error igual a null', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.iteraciones[0].n).toBe(1);
    expect(res.iteraciones[0].error).toBeNull();
  });

  test('lanza ErrorParametros cuando el intervalo no tiene cambio de signo', () => {
    const f = (x) => x * x + 1;

    expect(() =>
      falsaPosicion({
        f,
        a: 0,
        b: 1
      })
    ).toThrow(ErrorParametros);
  });

  test('lanza ErrorConvergencia cuando se alcanza el máximo de iteraciones', () => {
    const f = (x) => x * x - 2;

    expect(() =>
      falsaPosicion({
        f,
        a: 1,
        b: 2,
        tolerancia: 1e-12,
        maxIter: 1
      })
    ).toThrow(ErrorConvergencia);
  });

  test('el resultado incluye el nombre del método en meta', () => {
    const f = (x) => x * x - 2;

    const res = falsaPosicion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-6,
      maxIter: 100
    });

    expect(res.meta.metodo).toBe('Falsa Posición');
  });

});


describe('falsa posición: precisión relativa y convergencia', () => {
  test.each([1e-4, 1e-8, 1e-12])(
    'obtiene la raíz cúbica con tolerancia %p',
    (tolerancia) => {
      const exacta = Math.cbrt(2);
      const res = falsaPosicion({
        f: (x) => x ** 3 - 2,
        a: 1,
        b: 2,
        tolerancia,
        maxIter: 200,
      });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado - exacta) / exacta).toBeLessThan(tolerancia);
      const ultima = res.iteraciones.at(-1);
      expect(
        Math.abs(ultima.fc) < tolerancia || ultima.error < tolerancia
      ).toBe(true);
    }
  );

  test.each([
    [-2, -1, -Math.SQRT2],
    [0, 3, Math.SQRT2],
  ])('converge dentro del intervalo [%p, %p]', (a, b, exacta) => {
    const res = falsaPosicion({
      f: (x) => x * x - 2,
      a,
      b,
      tolerancia: 1e-10,
      maxIter: 200,
    });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - exacta) / Math.abs(exacta)).toBeLessThan(1e-10);
    res.iteraciones.forEach((iteracion) => {
      expect(iteracion.fa * iteracion.fb).toBeLessThan(0);
      expect(iteracion.c).toBeGreaterThanOrEqual(iteracion.a);
      expect(iteracion.c).toBeLessThanOrEqual(iteracion.b);
    });
  });

  test('reduce el error linealmente para una raíz simple', () => {
    const res = falsaPosicion({
      f: (x) => x * x - 2,
      a: 1,
      b: 2,
      tolerancia: 1e-12,
    });
    const errores = res.iteraciones.map(({ c }) => Math.abs(c - Math.SQRT2));

    expect(res.convergio).toBe(true);
    for (let indice = 2; indice < 6; indice++) {
      const razon = errores[indice] / errores[indice - 1];
      expect(razon).toBeGreaterThan(0.1);
      expect(razon).toBeLessThan(0.25);
    }
  });

  test('la tolerancia estricta requiere más iteraciones y mejora la precisión', () => {
    const resultados = [1e-4, 1e-8, 1e-12].map((tolerancia) =>
      falsaPosicion({ f: (x) => x * x - 2, a: 1, b: 2, tolerancia })
    );

    for (let indice = 1; indice < resultados.length; indice++) {
      expect(resultados[indice].iteraciones.length).toBeGreaterThan(
        resultados[indice - 1].iteraciones.length
      );
      expect(Math.abs(resultados[indice].resultado - Math.SQRT2)).toBeLessThan(
        Math.abs(resultados[indice - 1].resultado - Math.SQRT2)
      );
    }
  });

  test.each([2, 5])(
    'el estancamiento de x elevado a diez no se acepta como convergencia en %p pasos',
    (maxIter) => {
      let evaluaciones = 0;
      expect(() =>
        falsaPosicion({
          f: (x) => {
            evaluaciones++;
            return x ** 10 - 1;
          },
          a: 0,
          b: 2,
          tolerancia: 1e-12,
          maxIter,
        })
      ).toThrow(ErrorConvergencia);
      expect(evaluaciones).toBe(maxIter + 2);
    }
  );
});
