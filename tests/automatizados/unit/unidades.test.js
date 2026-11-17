import {
  convertirLongitud,
  convertirTemperatura,
  convertirPresion,
  convertirEnergia,
  unidadesDisponibles,
} from '../../../src/utils/unidades.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('unidades - conversiones conocidas', () => {
  test.each([
    [1, 'km', 'm', 1000],
    [1, 'ft', 'm', 0.3048],
    [100, 'cm', 'm', 1],
    [1, 'mi', 'km', 1.609344],
    [1, 'in', 'cm', 2.54],
    [1, 'yd', 'ft', 3],
  ])('longitud: %p %s -> %s = %p', (valor, desde, hasta, esperado) => {
    expect(convertirLongitud(valor, desde, hasta)).toBeCloseTo(esperado, 9);
  });

  test.each([
    [100, 'C', 'F', 212],
    [32, 'F', 'C', 0],
    [0, 'C', 'K', 273.15],
    [300, 'K', 'C', 26.85],
    [-40, 'C', 'F', -40],
    [212, 'F', 'K', 373.15],
  ])('temperatura: %p %s -> %s = %p', (valor, desde, hasta, esperado) => {
    expect(convertirTemperatura(valor, desde, hasta)).toBeCloseTo(esperado, 9);
  });

  test.each([
    [1, 'atm', 'Pa', 101325],
    [1, 'bar', 'kPa', 100],
    [1, 'MPa', 'bar', 10],
    [1, 'atm', 'psi', 14.695949],
    [1, 'mmHg', 'torr', 1],
  ])('presión: %p %s -> %s = %p', (valor, desde, hasta, esperado) => {
    expect(convertirPresion(valor, desde, hasta)).toBeCloseTo(esperado, 5);
  });

  test.each([
    [1, 'kWh', 'J', 3600000],
    [1, 'kcal', 'J', 4184],
    [1, 'cal', 'J', 4.184],
    [1, 'Wh', 'kJ', 3.6],
    [1, 'BTU', 'kJ', 1.05505585262],
  ])('energía: %p %s -> %s = %p', (valor, desde, hasta, esperado) => {
    expect(convertirEnergia(valor, desde, hasta)).toBeCloseTo(esperado, 9);
  });

  test('energía: 1 eV equivale a 1.602176634e-19 J', () => {
    expect(convertirEnergia(1, 'eV', 'J') / 1.602176634e-19).toBeCloseTo(1, 10);
  });

  test('convertir a la misma unidad devuelve el mismo valor', () => {
    expect(convertirLongitud(7.5, 'm', 'm')).toBeCloseTo(7.5, 9);
    expect(convertirTemperatura(25, 'C', 'C')).toBeCloseTo(25, 9);
    expect(convertirPresion(3, 'Pa', 'Pa')).toBeCloseTo(3, 9);
    expect(convertirEnergia(2, 'J', 'J')).toBeCloseTo(2, 9);
  });
});

describe('unidades - ida y vuelta', () => {
  test.each([
    ['m', 'mi'], ['km', 'in'], ['cm', 'yd'], ['ft', 'mm'],
  ])('longitud: %s <-> %s', (a, b) => {
    const ida = convertirLongitud(123.456, a, b);
    expect(convertirLongitud(ida, b, a)).toBeCloseTo(123.456, 9);
  });

  test.each([
    ['C', 'F'], ['C', 'K'], ['F', 'K'],
  ])('temperatura: %s <-> %s', (a, b) => {
    const ida = convertirTemperatura(25.5, a, b);
    expect(convertirTemperatura(ida, b, a)).toBeCloseTo(25.5, 9);
  });

  test.each([
    ['Pa', 'atm'], ['bar', 'psi'], ['kPa', 'mmHg'], ['MPa', 'torr'],
  ])('presión: %s <-> %s', (a, b) => {
    const ida = convertirPresion(50, a, b);
    expect(convertirPresion(ida, b, a)).toBeCloseTo(50, 9);
  });

  test.each([
    ['J', 'kWh'], ['kcal', 'BTU'], ['MJ', 'cal'], ['Wh', 'eV'],
  ])('energía: %s <-> %s', (a, b) => {
    const ida = convertirEnergia(42, a, b);
    expect(convertirEnergia(ida, b, a)).toBeCloseTo(42, 9);
  });
});

describe('unidades - rechazo de entradas inválidas', () => {
  test.each([
    ['longitud', () => convertirLongitud(1, 'km', 'liga')],
    ['longitud (origen)', () => convertirLongitud(1, 'liga', 'm')],
    ['longitud (mayúsculas)', () => convertirLongitud(1, 'KM', 'm')],
    ['temperatura', () => convertirTemperatura(1, 'C', 'X')],
    ['temperatura (minúscula)', () => convertirTemperatura(1, 'c', 'F')],
    ['presión', () => convertirPresion(1, 'atm', 'libra')],
    ['energía', () => convertirEnergia(1, 'J', 'watt')],
  ])('unidad no soportada en %s lanza ErrorParametros', (_caso, fn) => {
    expect(fn).toThrow(ErrorParametros);
  });

  test.each([
    ['longitud <- presión', () => convertirLongitud(1, 'm', 'Pa')],
    ['presión <- energía', () => convertirPresion(1, 'Pa', 'J')],
    ['energía <- temperatura', () => convertirEnergia(1, 'J', 'C')],
    ['temperatura <- longitud', () => convertirTemperatura(1, 'C', 'm')],
  ])('magnitudes incompatibles (%s) lanzan ErrorParametros', (_caso, fn) => {
    expect(fn).toThrow(ErrorParametros);
  });

  test.each(['5', NaN, Infinity, -Infinity, undefined, null])(
    'valor no numérico o no finito (%p) lanza ErrorParametros',
    (valor) => {
      expect(() => convertirLongitud(valor, 'm', 'km')).toThrow(ErrorParametros);
      expect(() => convertirTemperatura(valor, 'C', 'F')).toThrow(ErrorParametros);
      expect(() => convertirPresion(valor, 'Pa', 'kPa')).toThrow(ErrorParametros);
      expect(() => convertirEnergia(valor, 'J', 'kJ')).toThrow(ErrorParametros);
    }
  );

  test('el error indica la unidad rechazada', () => {
    expect(() => convertirLongitud(1, 'km', 'liga')).toThrow(/liga/);
  });

  test('el error tiene el nombre ErrorParametros', () => {
    try {
      convertirPresion(1, 'atm', 'libra');
    } catch (e) {
      expect(e.name).toBe('ErrorParametros');
    }
    expect.assertions(1);
  });
});

describe('unidades - temperatura y cero absoluto', () => {
  test('0 K equivale a -273.15 °C (límite permitido)', () => {
    expect(convertirTemperatura(0, 'K', 'C')).toBeCloseTo(-273.15, 9);
  });

  test.each([
    [-1, 'K'],
    [-300, 'C'],
    [-500, 'F'],
  ])('%p %s por debajo del cero absoluto lanza ErrorParametros', (valor, escala) => {
    expect(() => convertirTemperatura(valor, escala, 'C')).toThrow(ErrorParametros);
  });
});

describe('unidades - unidadesDisponibles', () => {
  const disponibles = unidadesDisponibles();

  test('devuelve las cuatro categorías', () => {
    expect(Object.keys(disponibles)).toEqual(
      expect.arrayContaining(['longitud', 'temperatura', 'presion', 'energia'])
    );
  });

  test('todas las unidades listadas son aceptadas por su conversor', () => {
    disponibles.longitud.forEach((u) =>
      expect(() => convertirLongitud(1, u, 'm')).not.toThrow()
    );
    disponibles.temperatura.forEach((u) =>
      expect(() => convertirTemperatura(1, u, 'K')).not.toThrow()
    );
    disponibles.presion.forEach((u) =>
      expect(() => convertirPresion(1, u, 'Pa')).not.toThrow()
    );
    disponibles.energia.forEach((u) =>
      expect(() => convertirEnergia(1, u, 'J')).not.toThrow()
    );
  });

  test('temperatura expone C, F y K', () => {
    expect(disponibles.temperatura).toEqual(['C', 'F', 'K']);
  });
});