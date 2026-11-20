
import {
  construirTablaAdelante,
  construirTablaAtras,
  generarTablaDiferencias,
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

  test('las diferencias de segundo orden son exactas para una función cuadrática', () => {
    const ys = [0, 1, 4, 9, 16, 25];
    const tabla = construirTablaAdelante(ys);

    expect(tabla[1]).toEqual([1, 3, 5, 7, 9]);
    expect(tabla[2]).toEqual([2, 2, 2, 2]);
    expect(tabla[3]).toEqual([0, 0, 0]);
  });

  test('las diferencias de tercer orden son constantes para una función cúbica', () => {
    const ys = [0, 1, 8, 27, 64, 125];
    const tabla = construirTablaAdelante(ys);

    expect(tabla[3]).toEqual([6, 6, 6]);
    expect(tabla[4]).toEqual([0, 0]);
  });

  test('las diferencias hacia adelante y atrás coinciden para datos equiespaciados', () => {
    const ys = [2, 5, 10, 17, 26];

    const adelante = construirTablaAdelante(ys);
    const atras = construirTablaAtras(ys);

    expect(adelante).toEqual(atras);
  });

  test('generarTablaDiferencias conserva la precisión para valores decimales', () => {
    const ys = [0.1, 0.2, 0.3, 0.4];
    const res = generarTablaDiferencias(ys);

    expect(res.convergio).toBe(true);
    expect(res.resultado[1][0]).toBeCloseTo(0.1, 14);
    expect(res.resultado[2][0]).toBeCloseTo(0, 14);
  });

  test('generarTablaDiferencias detecta diferencias fuera del rango numérico', () => {
    const ys = [-Number.MAX_VALUE, Number.MAX_VALUE];

    expect(() => generarTablaDiferencias(ys)).toThrow(
      /exceden el rango numérico representable/
    );
  });
});
