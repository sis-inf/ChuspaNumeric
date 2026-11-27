
import {
  checkConvergence,
  ConvergenceHistory,
} from '../../../src/utils/convergence.js';

import {
  errorRelativo,
  errorRelativoAproximado,
} from '../../../src/utils/error_relativo.js';

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

  test('detecta convergencia con una tolerancia estricta', () => {
    const resultado = checkConvergence(1.000001, 1, 0.00001);

    expect(resultado.converged).toBe(true);
    expect(resultado.lastDiff).toBeCloseTo(0.000001);
  });

  test('detecta convergencia con una tolerancia flexible', () => {
    const resultado = checkConvergence(1.05, 1, 0.1);

    expect(resultado.converged).toBe(true);
    expect(resultado.lastDiff).toBeCloseTo(0.05);
  });

  test('no considera convergencia cuando la diferencia es igual a la tolerancia', () => {
    const resultado = checkConvergence(1.5, 1, 0.5);

    expect(resultado.converged).toBe(false);
    expect(resultado.lastDiff).toBe(0.5);
  });

  test('checkLastTwo detecta convergencia cuando la diferencia es menor que la tolerancia', () => {
    const historial = new ConvergenceHistory();

    historial.addValue(1.1);
    historial.addValue(1.01);

    const resultado = historial.checkLastTwo(0.1);

    expect(resultado.converged).toBe(true);
    expect(resultado.lastDiff).toBeCloseTo(0.09);
  });

  test('checkLastTwo no detecta convergencia cuando la diferencia supera la tolerancia', () => {
    const historial = new ConvergenceHistory();

    historial.addValue(1);
    historial.addValue(2);

    const resultado = historial.checkLastTwo(0.1);

    expect(resultado.converged).toBe(false);
    expect(resultado.lastDiff).toBe(1);
  });

  test('evalua correctamente la convergencia con valores negativos', () => {
    const resultado = checkConvergence(-2.001, -2, 0.01);

    expect(resultado.converged).toBe(true);
    expect(resultado.lastDiff).toBeCloseTo(0.001);
  });

  test('calcula correctamente el error relativo', () => {
    const resultado = errorRelativo(100, 95);

    expect(resultado).toBeCloseTo(0.05);
  });

  test('calcula correctamente el error relativo aproximado', () => {
    const resultado = errorRelativoAproximado(10.5, 10);

    expect(resultado).toBeCloseTo(0.047619);
  });

  test('evalua el orden cuadratico de convergencia del metodo de Newton', () => {
    const raiz = Math.sqrt(2);
    let x = 1.5;
    const errores = [];

    for (let i = 0; i < 3; i++) {
      x = (x + 2 / x) / 2;
      errores.push(Math.abs(raiz - x));
    }

    const orden = Math.log(errores[1] / errores[2]) /
      Math.log(errores[0] / errores[1]);

    expect(orden).toBeCloseTo(2, 1);
  });

  test('detecta una sucesion divergente que no alcanza la convergencia', () => {
    let x = 1;
    const tolerancia = 0.001;
    const historial = new ConvergenceHistory();

    historial.addValue(x);

    for (let i = 0; i < 5; i++) {
      x = x * 2;
      historial.addValue(x);
    }

    const resultado = historial.checkLastTwo(tolerancia);

    expect(resultado.converged).toBe(false);
    expect(resultado.lastDiff).toBe(16);
    expect(historial.getLastValue()).toBe(32);
  });

  test('evalua el orden lineal de convergencia de una sucesion', () => {
    const errores = [1, 0.5, 0.25, 0.125];

    const orden = Math.log(errores[2] / errores[3]) /
      Math.log(errores[1] / errores[2]);

    expect(orden).toBeCloseTo(1, 5);
  });
});
