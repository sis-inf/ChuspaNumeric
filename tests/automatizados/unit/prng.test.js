
import { crearGeneradorAleatorio } from '../../../src/utils/prng.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('crearGeneradorAleatorio', () => {
  test('dos generadores con la misma semilla producen la misma secuencia', () => {
    const generador1 = crearGeneradorAleatorio(42);
    const generador2 = crearGeneradorAleatorio(42);

    const secuencia1 = Array.from({ length: 5 }, () => generador1());
    const secuencia2 = Array.from({ length: 5 }, () => generador2());

    expect(secuencia1).toEqual(secuencia2);
  });

  test('semillas diferentes producen secuencias diferentes', () => {
    const generador1 = crearGeneradorAleatorio(42);
    const generador2 = crearGeneradorAleatorio(99);

    const secuencia1 = Array.from({ length: 5 }, () => generador1());
    const secuencia2 = Array.from({ length: 5 }, () => generador2());

    expect(secuencia1).not.toEqual(secuencia2);
  });

  test('todos los valores generados estan entre 0 y 1 sin incluir 1', () => {
    const generador = crearGeneradorAleatorio(42);
    const valores = Array.from({ length: 100 }, () => generador());

    valores.forEach((valor) => {
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    });
  });

  test('una semilla null permite crear un generador valido', () => {
    const generador = crearGeneradorAleatorio(null);

    expect(typeof generador).toBe('function');

    const valor = generador();
    expect(valor).toBeGreaterThanOrEqual(0);
    expect(valor).toBeLessThan(1);
  });

  test('una semilla no numerica lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio('abc')).toThrow(ErrorParametros);
  });

  test('una semilla NaN lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio(NaN)).toThrow(ErrorParametros);
  });

  test('una semilla Infinity lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio(Infinity)).toThrow(ErrorParametros);
  });
});
