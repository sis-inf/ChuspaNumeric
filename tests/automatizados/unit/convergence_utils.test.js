
import {
  checkConvergence,
  ConvergenceHistory,
} from '../../../src/utils/convergence.js';

describe('Utilidades de convergencia', () => {
  test('detecta convergencia cuando la diferencia es menor que la tolerancia', () => {
    const resultado = checkConvergence(1.0001, 1, 0.001);

    expect(resultado.converged).toBe(true);
    expect(resultado.lastDiff).toBeCloseTo(0.0001);
  });

  test('detecta que no hay convergencia cuando la diferencia supera la tolerancia', () => {
    const resultado = checkConvergence(2, 1, 0.5);

    expect(resultado.converged).toBe(false);
    expect(resultado.lastDiff).toBe(1);
  });

  test('ConvergenceHistory conserva solo los ultimos dos valores', () => {
    const historial = new ConvergenceHistory();

    historial.addValue(1);
    historial.addValue(2);
    historial.addValue(3);

    expect(historial.values).toEqual([2, 3]);
  });

  test('checkLastTwo devuelve false y null si hay menos de dos valores', () => {
    const historial = new ConvergenceHistory();

    expect(historial.checkLastTwo(0.01)).toEqual({
      converged: false,
      lastDiff: null,
    });

    historial.addValue(1);

    expect(historial.checkLastTwo(0.01)).toEqual({
      converged: false,
      lastDiff: null,
    });
  });

  test('reset vacia el historial y getLastValue devuelve undefined', () => {
    const historial = new ConvergenceHistory();

    historial.addValue(1);
    historial.addValue(2);

    historial.reset();

    expect(historial.values).toEqual([]);
    expect(historial.getLastValue()).toBeUndefined();
  });
});
