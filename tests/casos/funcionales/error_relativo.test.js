
import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';
import {
  errorRelativo,
  errorPorcentual,
  errorRelativoAproximado,
} from '../../../src/utils/error_relativo.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

describe('error relativo - newton-raphson', () => {
  test('el error en cada iteracion decrece hasta ser menor a tolerancia', () => {
    const f = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;
    const tolerancia = 1e-5;

    const res = newtonRaphson({ f, df, x0: 1, tolerancia });

    expect(res.convergio).toBe(true);

    const ultimaIter = res.iteraciones.at(-1);
    expect(ultimaIter.error).toBeLessThan(tolerancia);

    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(tolerancia);
  });

  test('lanza error con parametros invalidos', () => {
    expect(() => newtonRaphson(null)).toThrow();
    expect(() => newtonRaphson({})).toThrow();
    expect(() =>
      newtonRaphson({ f: (x) => x, df: 'no es funcion', x0: 1 })
    ).toThrow();
  });

  test('maneja no convergencia cuando maxIter es demasiado pequeno', () => {
    const f = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;
    const res = newtonRaphson({
      f,
      df,
      x0: 100,
      tolerancia: 1e-12,
      maxIter: 1,
    });

    expect(res.convergio).toBe(false);
  });

  test('evalua error relativo en un caso exitoso adicional (x^3 - 8 = 0)', () => {
    const f = (x) => x ** 3 - 8;
    const df = (x) => 3 * x ** 2;
    const tolerancia = 1e-5;

    const res = newtonRaphson({ f, df, x0: 3, tolerancia });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 4);

    const ultimaIter = res.iteraciones.at(-1);
    expect(ultimaIter.error).toBeLessThan(tolerancia);
  });

  test('compara la precision con diferentes tolerancias', () => {
    const f = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;

    const resultadoMenosEstricto = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-5,
    });

    const resultadoMasEstricto = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-10,
    });

    const errorMenosEstricto = Math.abs(
      resultadoMenosEstricto.resultado - Math.SQRT2
    );

    const errorMasEstricto = Math.abs(
      resultadoMasEstricto.resultado - Math.SQRT2
    );

    expect(resultadoMenosEstricto.convergio).toBe(true);
    expect(resultadoMasEstricto.convergio).toBe(true);
    expect(errorMasEstricto).toBeLessThanOrEqual(errorMenosEstricto);
    expect(resultadoMasEstricto.iteraciones.length).toBeGreaterThanOrEqual(
      resultadoMenosEstricto.iteraciones.length
    );
  });

  test('detecta la divergencia cuando una iteracion produce Infinity', () => {
    expect(() =>
      newtonRaphson({
        f: () => Infinity,
        df: () => 1,
        x0: 1,
        tolerancia: 1e-5,
      })
    ).toThrow(ErrorDivergencia);
  });

  test('comprueba que el error de las iteraciones disminuye', () => {
    const resultado = newtonRaphson({
      f: (x) => x ** 2 - 2,
      df: (x) => 2 * x,
      x0: 1,
      tolerancia: 1e-10,
    });

    const errores = resultado.iteraciones.map(
      (iteracion) => iteracion.error
    );

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThanOrEqual(errores[i - 1]);
    }
  });

  test('evalua diferentes tamanos de paso entre aproximaciones sucesivas', () => {
    const f = (x) => x ** 2 - 2;
    const df = (x) => 2 * x;

    const calcularTamanosPaso = (x0) => {
      const resultado = newtonRaphson({
        f,
        df,
        x0,
        tolerancia: 1e-10,
      });

      const aproximaciones = [
        ...resultado.iteraciones.map((iteracion) => iteracion.x),
        resultado.resultado,
      ];

      const tamanosPaso = aproximaciones.slice(1).map(
        (aproximacion, indice) =>
          Math.abs(aproximacion - aproximaciones[indice])
      );

      return { resultado, tamanosPaso };
    };

    const desdeUno = calcularTamanosPaso(1);
    const desdeTres = calcularTamanosPaso(3);

    expect(desdeUno.resultado.convergio).toBe(true);
    expect(desdeTres.resultado.convergio).toBe(true);

    expect(desdeUno.tamanosPaso.length).toBeGreaterThan(1);
    expect(desdeTres.tamanosPaso.length).toBeGreaterThan(1);

    expect(desdeUno.tamanosPaso[0]).not.toBeCloseTo(
      desdeTres.tamanosPaso[0],
      8
    );

    for (const { resultado, tamanosPaso } of [desdeUno, desdeTres]) {
      expect(tamanosPaso).toHaveLength(resultado.iteraciones.length);

      for (let i = 0; i < tamanosPaso.length; i++) {
        expect(tamanosPaso[i]).toBeCloseTo(
          resultado.iteraciones[i].error,
          12
        );

        if (i > 0) {
          expect(tamanosPaso[i]).toBeLessThan(tamanosPaso[i - 1]);
        }
      }
    }
  });

  test('comprueba el orden de convergencia cuadratica de Newton-Raphson', () => {
    const resultado = newtonRaphson({
      f: (x) => x ** 2 - 2,
      df: (x) => 2 * x,
      x0: 1,
      tolerancia: 1e-10,
    });

    const aproximaciones = [
      ...resultado.iteraciones.map((iteracion) => iteracion.x),
      resultado.resultado,
    ];

    const errores = aproximaciones.map((x) => Math.abs(x - Math.SQRT2));

    for (let i = 1; i < 3; i++) {
      const ordenCuadratico = errores[i + 1] / errores[i] ** 2;

      expect(ordenCuadratico).toBeGreaterThan(0.3);
      expect(ordenCuadratico).toBeLessThan(0.6);
    }
  });
});

describe('error relativo y porcentual - calculo y bordes', () => {
  test('calcula el error relativo y porcentual', () => {
    expect(errorRelativo(4, 3)).toBe(0.25);
    expect(errorPorcentual(4, 3)).toBe(25);
  });

  test('devuelve un error positivo cuando el valor verdadero es negativo', () => {
    expect(errorRelativo(-4, -3)).toBe(0.25);
    expect(errorPorcentual(-4, -3)).toBe(25);
  });

  test('lanza error cuando el valor verdadero es exactamente cero', () => {
    expect(() => errorRelativo(0, 1)).toThrow(
      'El valor verdadero no puede ser 0 para calcular error relativo'
    );

    expect(() => errorPorcentual(0, 1)).toThrow(
      'El valor verdadero no puede ser 0 para calcular error porcentual'
    );
  });

  test('trata -0 igual que cero', () => {
    expect(() => errorRelativo(-0, 1)).toThrow();
    expect(() => errorPorcentual(-0, 1)).toThrow();
  });

  test('calcula un resultado finito cuando el valor verdadero es muy cercano a cero', () => {
    expect(errorRelativo(1e-300, 2e-300)).toBeCloseTo(1, 10);
    expect(errorPorcentual(1e-300, 2e-300)).toBeCloseTo(100, 10);
    expect(Number.isFinite(errorRelativo(1e-300, 1))).toBe(true);
  });

  test('calcula errores con valores pequenos sin producir Infinity', () => {
    const resultado = errorRelativo(1e-10, 0.9e-10);

    expect(Number.isFinite(resultado)).toBe(true);
    expect(resultado).toBeCloseTo(0.1);
  });
});

describe('error relativo aproximado', () => {
  test('calcula el error relativo aproximado para diferentes aproximaciones', () => {
    expect(errorRelativoAproximado(10, 8)).toBeCloseTo(0.2);

    expect(errorRelativoAproximado(5.1, 5)).toBeCloseTo(
      0.0196078431
    );

    expect(errorRelativoAproximado(2.01, 2)).toBeCloseTo(
      0.0049751244
    );
  });
});