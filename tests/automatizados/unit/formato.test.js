import {
  redondear,
  errorAbsoluto,
  errorRelativo,
  errorPorcentual,
  aproximadamenteIgual,
} from '../../../src/utils/formato.js';

describe('Pruebas unitarias de formato.js', () => {
  test('redondear(3.14159, 2) devuelve 3.14', () => {
    expect(redondear(3.14159, 2)).toBe(3.14);
  });

  test('errorAbsoluto(5, 3) devuelve 2', () => {
    expect(errorAbsoluto(5, 3)).toBe(2);
  });

  test('errorRelativo(4, 3) devuelve 0.25', () => {
    expect(errorRelativo(4, 3)).toBe(0.25);
  });

  test('errorRelativo(0, 1) devuelve Infinity', () => {
    expect(errorRelativo(0, 1)).toBe(Infinity);
  });

  test('errorPorcentual(4, 3) devuelve 25', () => {
    expect(errorPorcentual(4, 3)).toBe(25);
  });

  test('aproximadamenteIgual(1, 1.0001, 0.001) devuelve true', () => {
    expect(
      aproximadamenteIgual(1, 1.0001, 0.001)
    ).toBe(true);
  });

  test('aproximadamenteIgual(1, 1.0001, 1e-5) devuelve false', () => {
    expect(
      aproximadamenteIgual(1, 1.0001, 1e-5)
    ).toBe(false);
  });

  test('redondear mantiene la precisión solicitada', () => {
    expect(redondear(3.14159265, 4)).toBe(3.1416);
    expect(redondear(3.14159265, 6)).toBe(3.141593);
  });

  test('aproximadamenteIgual acepta diferencias con tolerancia amplia', () => {
    expect(aproximadamenteIgual(1, 1.00001, 1e-4)).toBe(true);
  });

  test('aproximadamenteIgual rechaza diferencias con tolerancia estricta', () => {
    expect(aproximadamenteIgual(1, 1.00001, 1e-6)).toBe(false);
  });

  test('errorAbsoluto disminuye cuando las aproximaciones convergen', () => {
    const referencia = 2;
    const aproximaciones = [2.1, 2.01, 2.001];

    const errores = aproximaciones.map((valor) =>
      errorAbsoluto(valor, referencia)
    );

    expect(errores[1]).toBeLessThan(errores[0]);
    expect(errores[2]).toBeLessThan(errores[1]);
  });

  test('detecta falta de convergencia mediante errores que aumentan', () => {
    const referencia = 2;
    const aproximaciones = [2.001, 2.01, 2.1];

    const errores = aproximaciones.map((valor) =>
      errorAbsoluto(valor, referencia)
    );

    expect(errores[1]).toBeGreaterThan(errores[0]);
    expect(errores[2]).toBeGreaterThan(errores[1]);
    expect(aproximadamenteIgual(aproximaciones[2], referencia, 1e-3))
      .toBe(false);
  });

  test('el error absoluto disminuye al reducir el tamaño de paso h', () => {
    const referencia = 2;
    const pasos = [0.1, 0.01, 0.001];

    const aproximaciones = pasos.map((h) => referencia + h * h);
    const errores = aproximaciones.map((valor) =>
      errorAbsoluto(valor, referencia)
    );

    expect(errores[1]).toBeLessThan(errores[0]);
    expect(errores[2]).toBeLessThan(errores[1]);
    expect(errores[2]).toBeLessThan(1e-5);
  });

  test('el error relativo disminuye al reducir el tamaño de paso h', () => {
    const referencia = 2;
    const pasos = [0.1, 0.01, 0.001];

    const erroresRelativos = pasos.map((h) => {
      const aproximacion = referencia + h * h;
      return errorRelativo(referencia, aproximacion);
    });

    expect(erroresRelativos[0]).toBeCloseTo(0.005, 8);
    expect(erroresRelativos[1]).toBeCloseTo(0.00005, 8);
    expect(erroresRelativos[2]).toBeCloseTo(0.0000005, 8);

    expect(erroresRelativos[1]).toBeLessThan(erroresRelativos[0]);
    expect(erroresRelativos[2]).toBeLessThan(erroresRelativos[1]);
  });

  test('detecta cuando el error relativo aumenta con pasos menores', () => {
    const referencia = 2;
    const pasos = [0.1, 0.01, 0.001];

    const erroresRelativos = pasos.map((h) => {
      const aproximacion = referencia + 0.01 / h;
      return errorRelativo(referencia, aproximacion);
    });

    expect(erroresRelativos[1]).toBeGreaterThan(erroresRelativos[0]);
    expect(erroresRelativos[2]).toBeGreaterThan(erroresRelativos[1]);
  });
});
