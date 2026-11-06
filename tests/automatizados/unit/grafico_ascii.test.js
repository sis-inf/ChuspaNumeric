import { generarGraficoAscii } from '../../../src/cli/grafico_ascii.js';

describe('generarGraficoAscii - gráfico ASCII de convergencia', () => {
  test('genera el gráfico con título y barras para las iteraciones', () => {
    const datos = {
      iteraciones: [
        { n: 1, error: 1 },
        { n: 2, error: 0.5 },
      ],
    };

    const resultado = generarGraficoAscii(datos);

    expect(resultado).toContain('Gráfico ASCII de convergencia');
    expect(resultado).toContain('█');
  });

  test('devuelve un mensaje cuando no hay datos de error disponibles', () => {
    const resultado = generarGraficoAscii({ iteraciones: [] });

    expect(resultado).toBe(
      'No hay datos de error disponibles para graficar.'
    );
  });

  test('acepta directamente un arreglo de iteraciones', () => {
    const iteraciones = [
      { n: 1, error: 1 },
      { n: 2, error: 0.5 },
    ];

    const resultado = generarGraficoAscii(iteraciones);

    expect(resultado).toContain('Gráfico ASCII de convergencia');
    expect(resultado).toContain('█');
    expect(resultado).toContain('        1');
    expect(resultado).toContain('        2');
  });

  test('reconoce los campos alternativos de error', () => {
    const datos = {
      iteraciones: [
        { n: 1, errorAbsoluto: 1 },
        { n: 2, error_relativo: 0.8 },
        { n: 3, ea: 0.6 },
        { n: 4, er: 0.4 },
      ],
    };

    const resultado = generarGraficoAscii(datos);
    const barras = resultado
      .split('\n')
      .filter((linea) => linea.includes('█'));

    expect(barras).toHaveLength(4);
  });

  test('respeta el ancho disponible cuando se establece ancho en 60', () => {
    const datos = {
      iteraciones: [
        { n: 1, error: 1 },
        { n: 2, error: 0.5 },
        { n: 3, error: 0.25 },
      ],
    };

    const resultado = generarGraficoAscii(datos, { ancho: 60 });
    const barras = resultado
      .split('\n')
      .filter((linea) => linea.includes('█'))
      .map((linea) => linea.split('|').pop().trim());

    const barraMasLarga = Math.max(
      ...barras.map((barra) => barra.length)
    );

    expect(barraMasLarga).toBeLessThanOrEqual(36);
  });

  test('dibuja una sola barra cuando el error es igual a cero', () => {
    const datos = {
      iteraciones: [{ n: 1, error: 0 }],
    };

    const resultado = generarGraficoAscii(datos);
    const linea = resultado
      .split('\n')
      .find((linea) => linea.includes('█'));

    const barra = linea.split('|').pop().trim();

    expect(barra).toBe('█');
  });
});