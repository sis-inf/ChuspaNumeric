import { derivadaRichardson } from '../../../src/diferencias/richardson.js';
import { diferenciaCentrada } from '../../../src/diferencias/diferencia_centrada.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('derivadaRichardson', () => {
  test('mejora a la diferencia centrada inicial en sen(x)', () => {
    // d/dx sen(x) = cos(x)
    const exacta = Math.cos(1);
    const h = 0.1;
    const centrada = diferenciaCentrada(Math.sin, 1, h);

    const res = derivadaRichardson({ f: Math.sin, x: 1, h });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - exacta)).toBeLessThan(
      Math.abs(centrada - exacta)
    );
    expect(res.resultado).toBeCloseTo(exacta, 8);
  });

  test('es exacta en un polinomio cúbico', () => {
    // f(x) = x³, f'(2) = 12; el error centrado es h², y Richardson lo cancela
    const res = derivadaRichardson({ f: (x) => x ** 3, x: 2 });

    expect(res.resultado).toBeCloseTo(12, 8);
  });

  test('reduce el paso a la mitad en cada refinamiento', () => {
    const res = derivadaRichardson({
      f: Math.exp,
      x: 0,
      h: 0.4,
      tolerancia: 1e-10,
    });

    expect(res.iteraciones.length).toBeGreaterThan(1);
    res.iteraciones.forEach((iteracion, indice) => {
      expect(iteracion.h).toBeCloseTo(0.4 / 2 ** (indice + 1), 12);
    });
  });

  test('se detiene al alcanzar el máximo sin converger', () => {
    const res = derivadaRichardson({
      f: Math.exp,
      x: 0,
      h: 0.4,
      tolerancia: 1e-14,
      maxIter: 2,
    });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(2);
  });

  test.each([[undefined], [null], [5], ['x']])(
    'rechaza f no válida: %p',
    (f) => {
      expect(() => derivadaRichardson({ f, x: 1 })).toThrow(ErrorParametros);
    }
  );

  test.each([[undefined], [NaN], [Infinity], ['1']])(
    'rechaza x no válido: %p',
    (x) => {
      expect(() => derivadaRichardson({ f: Math.sin, x })).toThrow(
        ErrorParametros
      );
    }
  );

  test.each([[0], [NaN], [Infinity], ['0.1']])(
    'rechaza h no válido: %p',
    (h) => {
      expect(() => derivadaRichardson({ f: Math.sin, x: 1, h })).toThrow(
        ErrorParametros
      );
    }
  );

  test.each([[0], [-1e-6], [NaN], ['1e-6']])(
    'rechaza tolerancia no válida: %p',
    (tolerancia) => {
      expect(() =>
        derivadaRichardson({ f: Math.sin, x: 1, tolerancia })
      ).toThrow(ErrorParametros);
    }
  );

  test.each([[0], [-1], [1.5], ['10']])(
    'rechaza maxIter no válido: %p',
    (maxIter) => {
      expect(() => derivadaRichardson({ f: Math.sin, x: 1, maxIter })).toThrow(
        ErrorParametros
      );
    }
  );
});


describe('Richardson: precisión relativa y orden de convergencia', () => {
  test.each([0.4, 0.1, 0.025])(
    'aproxima exp(1) con paso inicial %p y tolerancia estricta',
    (h) => {
      const tolerancia = 1e-10;
      const res = derivadaRichardson({
        f: Math.exp,
        x: 1,
        h,
        tolerancia,
        maxIter: 20,
      });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado - Math.E) / Math.E).toBeLessThan(1e-10);
      expect(res.iteraciones.at(-1).error).toBeLessThan(tolerancia);
    }
  );

  test('la extrapolación presenta orden cuatro frente al orden dos centrado', () => {
    const pasos = [0.4, 0.2, 0.1];
    const erroresCentrados = pasos.map((h) =>
      Math.abs((Math.exp(h) - Math.exp(-h)) / (2 * h) - 1)
    );
    const erroresExtrapolados = pasos.map((h) => {
      const res = derivadaRichardson({
        f: Math.exp,
        x: 0,
        h,
        tolerancia: 1e-14,
        maxIter: 1,
      });
      expect(res.convergio).toBe(false);
      return Math.abs(res.resultado - 1);
    });

    for (let indice = 0; indice < pasos.length - 1; indice++) {
      const ordenCentrado = Math.log2(
        erroresCentrados[indice] / erroresCentrados[indice + 1]
      );
      const ordenExtrapolado = Math.log2(
        erroresExtrapolados[indice] / erroresExtrapolados[indice + 1]
      );
      expect(ordenCentrado).toBeGreaterThan(1.9);
      expect(ordenCentrado).toBeLessThan(2.1);
      expect(ordenExtrapolado).toBeGreaterThan(3.9);
      expect(ordenExtrapolado).toBeLessThan(4.1);
    }
  });

  test('una tolerancia menor exige más refinamientos y reduce el error real', () => {
    const resultados = [1e-4, 1e-8, 1e-12].map((tolerancia) =>
      derivadaRichardson({ f: Math.exp, x: 0, h: 0.4, tolerancia, maxIter: 20 })
    );

    resultados.forEach((res) => expect(res.convergio).toBe(true));
    for (let indice = 1; indice < resultados.length; indice++) {
      expect(resultados[indice].iteraciones.length).toBeGreaterThan(
        resultados[indice - 1].iteraciones.length
      );
      expect(Math.abs(resultados[indice].resultado - 1)).toBeLessThan(
        Math.abs(resultados[indice - 1].resultado - 1)
      );
    }
  });

  test.each([1, 2, 3])(
    'informa no convergencia al agotar %p refinamientos',
    (maxIter) => {
      const res = derivadaRichardson({
        f: Math.exp,
        x: 0,
        h: 0.8,
        tolerancia: 1e-14,
        maxIter,
      });
      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(maxIter);
      expect(Number.isFinite(res.resultado)).toBe(true);
      expect(res.iteraciones.at(-1).error).toBeGreaterThanOrEqual(1e-14);
    }
  );
});
