import { muller } from '../../../src/no-lineales/muller.js';
import {
  ErrorParametros,
  ErrorDominio,
  ErrorConvergencia,
} from '../../../src/core/errores.js';

// f(x) = x² - 4, raíz conocida en x = 2
const cuadratica = (x) => x * x - 4;
// f(x) = x³ - 2x - 5, raíz real conocida en x ≈ 2.0945514815
const cubica = (x) => x ** 3 - 2 * x - 5;

describe('muller - convergencia', () => {
  test('encuentra la raíz de x² - 4 dentro de la tolerancia', () => {
    const res = muller({ f: cuadratica, x0: 0, x1: 1, x2: 3, tolerancia: 1e-8 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2, 6);
  });

  test('encuentra la raíz real de x³ - 2x - 5', () => {
    const res = muller({ f: cubica, x0: 1, x1: 2, x2: 3, tolerancia: 1e-8 });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toBeCloseTo(2.0945514815, 6);
  });

  test('el último punto iterado coincide con el resultado', () => {
    const res = muller({ f: cuadratica, x0: 0, x1: 1, x2: 3 });
    const ultima = res.iteraciones[res.iteraciones.length - 1];

    expect(ultima.xNuevo).toBe(res.resultado);
    expect(ultima.fxNuevo).toBeCloseTo(0, 6);
  });

  test('lanza ErrorConvergencia si se agotan las iteraciones', () => {
    expect(() =>
      muller({ f: cuadratica, x0: 0, x1: 1, x2: 3, tolerancia: 1e-6, maxIter: 1 })
    ).toThrow(ErrorConvergencia);
  });

  test('lanza ErrorConvergencia con maxIter bajo en la cúbica', () => {
    expect(() =>
      muller({ f: cubica, x0: 1, x1: 2, x2: 3, tolerancia: 1e-12, maxIter: 1 })
    ).toThrow(ErrorConvergencia);
  });
});

describe('muller - puntos iniciales repetidos', () => {
  test.each([
    ['x0 === x1', { x0: 1, x1: 1, x2: 3 }],
    ['x1 === x2', { x0: 0, x1: 2, x2: 2 }],
    ['x0 === x2', { x0: 1, x1: 2, x2: 1 }],
    ['los tres iguales', { x0: 2, x1: 2, x2: 2 }],
  ])('lanza ErrorParametros si %s', (_caso, puntos) => {
    expect(() => muller({ f: cuadratica, ...puntos })).toThrow(ErrorParametros);
  });
});

describe('muller - denominador nulo', () => {
  test('lanza ErrorDominio con f(x) = 0 (A = B = C = 0)', () => {
    expect(() => muller({ f: () => 0, x0: 0, x1: 1, x2: 2 })).toThrow(ErrorDominio);
  });
});

describe('muller - validaciones de entrada', () => {
  const base = { f: cuadratica, x0: 0, x1: 1, x2: 3 };

  test('f no es una función', () => {
    expect(() => muller({ ...base, f: 42 })).toThrow(ErrorParametros);
  });

  test.each([
    ['x0', { x0: NaN }],
    ['x1', { x1: 'a' }],
    ['x2', { x2: Infinity }],
  ])('%s no es un número finito', (_nombre, cambio) => {
    expect(() => muller({ ...base, ...cambio })).toThrow(ErrorParametros);
  });

  test.each([0, -1e-6, NaN])('tolerancia inválida (%p)', (tolerancia) => {
    expect(() => muller({ ...base, tolerancia })).toThrow(ErrorParametros);
  });

  test.each([0, -5, 1.5])('maxIter inválido (%p)', (maxIter) => {
    expect(() => muller({ ...base, maxIter })).toThrow(ErrorParametros);
  });
});

describe('muller - estructura del resultado', () => {
  const res = muller({ f: cuadratica, x0: 0, x1: 1, x2: 3 });

  test('contiene los campos del contrato', () => {
    expect(res).toHaveProperty('resultado');
    expect(res).toHaveProperty('iteraciones');
    expect(res).toHaveProperty('convergio');
    expect(res).toHaveProperty('mensaje');
    expect(res).toHaveProperty('meta');
  });

  test('tipos de los campos principales', () => {
    expect(typeof res.resultado).toBe('number');
    expect(Array.isArray(res.iteraciones)).toBe(true);
    expect(res.iteraciones.length).toBeGreaterThan(0);
    expect(res.convergio).toBe(true);
    expect(typeof res.mensaje).toBe('string');
    expect(res.mensaje).toContain('Convergencia');
  });

  test('cada iteración registra n, x0, x1, x2, xNuevo, fxNuevo y error', () => {
    const it = res.iteraciones[0];

    expect(it.n).toBe(1);
    ['x0', 'x1', 'x2', 'xNuevo', 'fxNuevo', 'error'].forEach((campo) => {
      expect(it).toHaveProperty(campo);
      expect(typeof it[campo]).toBe('number');
    });
  });

  test('meta incluye método, parámetros y tiempo_ms', () => {
    expect(res.meta.metodo).toBe('Müller');
    expect(typeof res.meta.tiempo_ms).toBe('number');
    expect(res.meta.tiempo_ms).toBeGreaterThanOrEqual(0);
  });

  test('meta.parametros refleja los valores por defecto', () => {
    expect(res.meta.parametros).toEqual({
      x0: 0,
      x1: 1,
      x2: 3,
      tolerancia: 1e-6,
      maxIter: 100,
    });
  });
});