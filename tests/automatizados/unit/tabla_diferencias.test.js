
import {
  construirTablaAdelante,
  construirTablaAtras,
  formatearTabla,
} from '../../../src/analisis/tabla_diferencias.js';

describe('Tabla de diferencias', () => {
  const tablaEsperada = [
    [1, 4, 9, 16],
    [3, 5, 7],
    [2, 2],
    [0],
  ];

  test('construirTablaAdelante genera la tabla esperada', () => {
    expect(construirTablaAdelante([1, 4, 9, 16])).toEqual(tablaEsperada);
  });

  test('construirTablaAtras genera la tabla esperada', () => {
    expect(construirTablaAtras([1, 4, 9, 16])).toEqual(tablaEsperada);
  });

  test('construirTablaAdelante rechaza arreglos con menos de dos elementos', () => {
    expect(() => construirTablaAdelante([1])).toThrow(Error);
  });

  test('construirTablaAtras rechaza arreglos con menos de dos elementos', () => {
    expect(() => construirTablaAtras([1])).toThrow(Error);
  });

  test('ambas funciones rechazan entradas que no son arreglos', () => {
    expect(() => construirTablaAdelante('texto')).toThrow(Error);
    expect(() => construirTablaAtras('texto')).toThrow(Error);
  });

  test('formatearTabla separa columnas y filas correctamente', () => {
    expect(formatearTabla([[1, 2], [3]])).toBe('1\t2\n3');
  });

  test('construirTablaAdelante no modifica el arreglo original', () => {
    const datos = [1, 4, 9, 16];

    construirTablaAdelante(datos);

    expect(datos).toEqual([1, 4, 9, 16]);
  });

  test('construirTablaAtras no modifica el arreglo original', () => {
    const datos = [1, 4, 9, 16];

    construirTablaAtras(datos);

    expect(datos).toEqual([1, 4, 9, 16]);
  });
});
