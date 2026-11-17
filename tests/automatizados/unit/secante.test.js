import { secante } from '../../../src/no-lineales/secante.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

// f(x) = x² - 2, raíz conocida √2
const f = (x) => x * x - 2;

describe('secante - convergencia a una raíz conocida', () => {
  test('encuentra √2 dentro de la tolerancia configurada', () => {
    const tolerancia = 1e-10;

    const res = secante({ f, x0: 1, x1: 2, tolerancia });

    expect(res.convergio).toBe(true);
    expect(Math.abs(res.resultado - Math.SQRT2)).toBeLessThan(tolerancia);
    expect(res.mensaje).toBe('Método convergió correctamente.');
  });

  test('encuentra la raíz de cos(x) - x', () => {
    const res = secante({
      f: (x) => Math.cos(x) - x,
      x0: 0,
      x1: 1,
      tolerancia: 1e-12,
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(0.7390851332151607, 11);
  });

  test('converge aunque las aproximaciones iniciales estén invertidas', () => {
    const res = secante({ f, x0: 2, x1: 1, tolerancia: 1e-10 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(Math.SQRT2, 9);
  });

  test('devuelve la metadata del contrato', () => {
    const res = secante({ f, x0: 1, x1: 2 });

    expect(res.meta.metodo).toBe('secante');
    expect(res.meta.parametros).toEqual({
      x0: 1,
      x1: 2,
      tolerancia: 1e-6,
      maxIter: 100,
    });
  });
});

describe('secante - convergencia y agotamiento de iteraciones', () => {
  test('se detiene en la primera iteración con error menor a la tolerancia', () => {
    const tolerancia = 1e-8;

    const { iteraciones } = secante({ f, x0: 1, x1: 2, tolerancia });
    const ultima = iteraciones[iteraciones.length - 1];

    expect(ultima.error).toBeLessThan(tolerancia);
    for (const it of iteraciones.slice(0, -1)) {
      expect(it.error).toBeGreaterThanOrEqual(tolerancia);
    }
    expect(iteraciones.map((it) => it.n)).toEqual(
      iteraciones.map((_, i) => i + 1)
    );
  });

  test('cada iteración registra los valores del paso', () => {
    const res = secante({ f, x0: 1, x1: 2 });

    // x2 = 2 - f(2)*(2-1)/(f(2)-f(1)) = 2 - 2/3 = 4/3
    const primera = res.iteraciones[0];

    expect(primera).toMatchObject({
      n: 1,
      xPrev: 1,
      xActual: 2,
      fxPrev: -1,
      fxActual: 2,
    });
    expect(primera.xNuevo).toBeCloseTo(4 / 3, 12);
    expect(primera.error).toBeCloseTo(2 / 3, 12);
  });

  test('cada paso usa como anterior el valor actual del paso previo', () => {
    const { iteraciones } = secante({ f, x0: 1, x1: 2 });

    for (let i = 1; i < iteraciones.length; i++) {
      expect(iteraciones[i].xPrev).toBe(iteraciones[i - 1].xActual);
      expect(iteraciones[i].xActual).toBe(iteraciones[i - 1].xNuevo);
    }
  });

  test('agota maxIter y avisa que no convergió', () => {
    const res = secante({ f, x0: 1000, x1: 999, maxIter: 3 });

    expect(res.convergio).toBe(false);
    expect(res.iteraciones).toHaveLength(3);
    expect(res.mensaje).toBe(
      'Se alcanzó el máximo de iteraciones sin converger.'
    );
  });
});

describe('secante - denominador nulo y parámetros inválidos', () => {
  test('f(x0) igual a f(x1) lanza ErrorDominio por división por cero', () => {
    // f(-1) = f(1) = -3, así que el denominador es 0
    const g = (x) => x * x - 4;

    expect(() => secante({ f: g, x0: -1, x1: 1 })).toThrow(ErrorDominio);
    expect(() => secante({ f: g, x0: -1, x1: 1 })).toThrow(
      'división por cero en la iteración 1'
    );
  });

  test('x0 igual a x1 lanza ErrorDominio', () => {
    expect(() => secante({ f, x0: 1, x1: 1 })).toThrow(ErrorDominio);
  });

  test.each([
    ['f no es función', { f: 'x*x', x0: 1, x1: 2 }],
    ['x0 no numérico', { f, x0: '1', x1: 2 }],
    ['x1 NaN', { f, x0: 1, x1: NaN }],
    ['x1 infinito', { f, x0: 1, x1: Infinity }],
    ['tolerancia cero', { f, x0: 1, x1: 2, tolerancia: 0 }],
    ['tolerancia negativa', { f, x0: 1, x1: 2, tolerancia: -1e-6 }],
    ['maxIter cero', { f, x0: 1, x1: 2, maxIter: 0 }],
    ['maxIter no entero', { f, x0: 1, x1: 2, maxIter: 1.5 }],
  ])('%s lanza ErrorParametros', (_caso, opciones) => {
    expect(() => secante(opciones)).toThrow(ErrorParametros);
  });
});
