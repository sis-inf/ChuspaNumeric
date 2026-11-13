import { muller } from '../../../src/no-lineales/muller.js';
import { ErrorParametros } from '../../../src/core/errores.js';

const f = (x) => x * x - 4;
const TOL = 1e-8;

describe('muller', () => {
  test.each([
    [0, 1, 3],
    [-1, 0, 1],
    [3, 4, 5],
  ])('converge a una raíz de x^2 - 4 con x0=%p, x1=%p, x2=%p', (x0, x1, x2) => {
    const r = muller({ f, x0, x1, x2, tolerancia: TOL });

    expect(r.convergio).toBe(true);
    expect(Math.abs(Math.abs(r.resultado) - 2)).toBeLessThan(1e-6);
  });

  test('el error final está por debajo de la tolerancia', () => {
    const r = muller({ f, x0: 0, x1: 1, x2: 3, tolerancia: TOL });
    const ultima = r.iteraciones[r.iteraciones.length - 1];

    expect(r.convergio).toBe(true);
    expect(ultima.error).toBeLessThan(TOL);
  });

  test('lanza ErrorParametros si x0 === x1', () => {
    expect(() => muller({ f, x0: 1, x1: 1, x2: 3 })).toThrow(ErrorParametros);
  });

  test('lanza ErrorParametros si f no es función', () => {
    expect(() => muller({ f: 'no soy funcion', x0: 0, x1: 1, x2: 3 })).toThrow(ErrorParametros);
  });
});