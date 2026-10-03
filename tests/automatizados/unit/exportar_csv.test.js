import { exportarCSV } from '../../../src/io/exportar_csv.js';

describe('exportarCSV', () => {
  test('exporta una tabla válida con encabezados correctamente', () => {
    const tabla = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];

    const resultado = exportarCSV(tabla);

    expect(resultado).toBe('x,y\n1,2\n3,4');
  });

  test('exporta una tabla sin encabezados cuando encabezado es false', () => {
    const tabla = [
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ];

    const resultado = exportarCSV(tabla, { encabezado: false });

    expect(resultado).toBe('1,2\n3,4');
  });

  test('redondea los valores numéricos según la precisión indicada', () => {
    const tabla = [
      { x: 1.23456789, y: 2.98765432 },
    ];

    const resultado = exportarCSV(tabla, { precision: 2 });

    expect(resultado).toBe('x,y\n1.23,2.99');
  });

  test('devuelve una cadena vacía cuando la tabla está vacía', () => {
    const resultado = exportarCSV([]);

    expect(resultado).toBe('');
  });

  test('devuelve una cadena vacía cuando los datos no son un arreglo', () => {
    const resultado = exportarCSV(null);

    expect(resultado).toBe('');
  });

  test('maneja valores null y undefined como campos vacíos', () => {
    const tabla = [
      { x: null, y: undefined },
    ];

    const resultado = exportarCSV(tabla);

    expect(resultado).toBe('x,y\n,');
  });

  test('escapa correctamente un valor que contiene el separador', () => {
    const tabla = [
      { nombre: 'Juan, Pérez', edad: 20 },
    ];

    const resultado = exportarCSV(tabla);

    expect(resultado).toBe('nombre,edad\n"Juan, Pérez",20');
  });
});