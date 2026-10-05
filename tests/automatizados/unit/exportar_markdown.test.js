import { exportarMarkdown } from '../../../src/io/exportar_markdown.js';

describe('exportarMarkdown', () => {
  test('genera correctamente un reporte Markdown con un resultado válido', () => {
    const resultado = {
      resultado: 2.5,
      iteraciones: [
        {
          iteracion: 1,
          x: 1,
          error: 0.5,
        },
        {
          iteracion: 2,
          x: 2.5,
          error: 0,
        },
      ],
      convergio: true,
      mensaje: 'El método convergió correctamente.',
      meta: {
        metodo: 'Bisección',
        parametros: {
          a: 1,
          b: 3,
          tolerancia: 0.001,
        },
        tiempo_ms: 15,
      },
    };

    const texto = exportarMarkdown(resultado);

    expect(texto).toContain('# Reporte');
    expect(texto).toContain('## Información general');
    expect(texto).toContain('Bisección');
    expect(texto).toContain('Convergió');
    expect(texto).toContain('Sí');
    expect(texto).toContain('2');
    expect(texto).toContain('15.000 ms');
    expect(texto).toContain('## Parámetros de entrada');
    expect(texto).toContain('tolerancia');
    expect(texto).toContain('0.001');
    expect(texto).toContain('## Resultado');
    expect(texto).toContain('2.5000000000');
    expect(texto).toContain('## Mensaje');
    expect(texto).toContain('El método convergió correctamente.');
    expect(texto).toContain('## Tabla de iteraciones');
  });

  test('usa los valores por defecto cuando no se proporcionan opciones adicionales', () => {
    const resultado = {
      resultado: 10,
    };

    const texto = exportarMarkdown(resultado);

    expect(texto).toContain('# Reporte');
    expect(texto).toContain('método');
    expect(texto).toContain('No');
    expect(texto).toContain('0.000 ms');
    expect(texto).toContain('10.0000000000');
    expect(texto).toContain('No hay iteraciones registradas.');
  });

  test('usa un título personalizado cuando se proporciona', () => {
    const resultado = {
      resultado: 5,
    };

    const texto = exportarMarkdown(resultado, {
      titulo: 'Mi reporte numérico',
    });

    expect(texto).toContain('# Mi reporte numérico');
  });

  test('formatea correctamente un resultado en forma de arreglo', () => {
    const resultado = {
      resultado: [1.23456789, 2.34567891, 3.45678912],
    };

    const texto = exportarMarkdown(resultado);

    expect(texto).toContain('x[0]');
    expect(texto).toContain('1.23456789');
    expect(texto).toContain('x[1]');
    expect(texto).toContain('2.34567891');
    expect(texto).toContain('x[2]');
    expect(texto).toContain('3.45678912');
  });

  test('maneja correctamente un resultado con valores null o undefined', () => {
    const resultado = {
      resultado: {
        x: null,
        y: undefined,
      },
    };

    const texto = exportarMarkdown(resultado);

    expect(texto).toContain('x');
    expect(texto).toContain('y');
    expect(texto).toContain('—');
  });

  test('rechaza un resultado que no sea un objeto válido', () => {
    expect(() => exportarMarkdown(null)).toThrow(
      'exportarMarkdown: resultado debe ser un objeto válido de Trazo.'
    );

    expect(() => exportarMarkdown(undefined)).toThrow(
      'exportarMarkdown: resultado debe ser un objeto válido de Trazo.'
    );

    expect(() => exportarMarkdown('resultado inválido')).toThrow(
      'exportarMarkdown: resultado debe ser un objeto válido de Trazo.'
    );
  });

  test('genera correctamente la tabla de iteraciones', () => {
    const resultado = {
      resultado: 4,
      iteraciones: [
        {
          iteracion: 1,
          x: 2,
          error: 0.5,
        },
        {
          iteracion: 2,
          x: 4,
          error: 0.125,
        },
      ],
    };

    const texto = exportarMarkdown(resultado);

    expect(texto).toContain('## Tabla de iteraciones');
    expect(texto).toContain('1.000000');
    expect(texto).toContain('2.000000');
    expect(texto).toContain('0.500000');
    expect(texto).toContain('2.000000');
    expect(texto).toContain('4.000000');
    expect(texto).toContain('0.125000');
  });
});