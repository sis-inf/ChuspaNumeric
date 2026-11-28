import { generarGraficoAscii } from '../../../src/cli/grafico_ascii.js';

// Utilidades de lectura del gráfico generado.
const lineasConBarra = (texto) =>
  texto.split('\n').filter((linea) => linea.includes('█'));

const longitudesBarras = (texto) =>
  lineasConBarra(texto).map((linea) => linea.split('|').pop().trim().length);

const iteracionesMostradas = (texto) =>
  lineasConBarra(texto).map((linea) => linea.split('|')[0].trim());

const etiquetasError = (texto) =>
  lineasConBarra(texto).map((linea) => linea.split('|')[1].trim());

const crearDatos = (errores) => ({
  iteraciones: errores.map((error, indice) => ({ n: indice + 1, error }))
});

const MENSAJE_SIN_DATOS = 'No hay datos de error disponibles para graficar.';

describe('generarGraficoAscii - gráfico ASCII de convergencia', () => {
  test('genera el gráfico con título y barras para las iteraciones', () => {
    const datos = {
      iteraciones: [
        { n: 1, error: 1 },
        { n: 2, error: 0.5 }
      ]
    };

    const resultado = generarGraficoAscii(datos);

    expect(resultado).toContain('Gráfico ASCII de convergencia');
    expect(resultado).toContain('█');
  });

  test('devuelve un mensaje cuando no hay datos de error disponibles', () => {
    const resultado = generarGraficoAscii({ iteraciones: [] });

    expect(resultado).toBe('No hay datos de error disponibles para graficar.');
  });

  test('acepta directamente un arreglo de iteraciones', () => {
    const iteraciones = [
      { n: 1, error: 1 },
      { n: 2, error: 0.5 }
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
        { n: 4, er: 0.4 }
      ]
    };

    const resultado = generarGraficoAscii(datos);
    const barras = resultado.split('\n').filter((linea) => linea.includes('█'));

    expect(barras).toHaveLength(4);
  });

  test('respeta el ancho disponible cuando se establece ancho en 60', () => {
    const datos = {
      iteraciones: [
        { n: 1, error: 1 },
        { n: 2, error: 0.5 },
        { n: 3, error: 0.25 }
      ]
    };

    const resultado = generarGraficoAscii(datos, { ancho: 60 });
    const barras = resultado
      .split('\n')
      .filter((linea) => linea.includes('█'))
      .map((linea) => linea.split('|').pop().trim());

    const barraMasLarga = Math.max(...barras.map((barra) => barra.length));

    expect(barraMasLarga).toBeLessThanOrEqual(36);
  });

  test('dibuja una sola barra cuando el error es igual a cero', () => {
    const datos = {
      iteraciones: [{ n: 1, error: 0 }]
    };

    const resultado = generarGraficoAscii(datos);
    const linea = resultado.split('\n').find((linea) => linea.includes('█'));

    const barra = linea.split('|').pop().trim();

    expect(barra).toBe('█');
  });
});

describe('generarGraficoAscii - tamaño de paso (ancho y escala de las barras)', () => {
  // Ancho de barra = max(10, ancho - 24). La barra del error máximo lo ocupa completo.
  test.each([5, 10, 24, 30, 60, 80, 124])(
    'la barra del error máximo ocupa max(10, ancho - 24) columnas (ancho %i)',
    (ancho) => {
      const resultado = generarGraficoAscii(crearDatos([1, 0.5, 0.25]), {
        ancho
      });
      const longitudes = longitudesBarras(resultado);

      expect(longitudes[0]).toBe(Math.max(10, ancho - 24));
      expect(Math.max(...longitudes)).toBe(Math.max(10, ancho - 24));
    }
  );

  // La línea separadora mide min(ancho, 24 + anchoGrafico), que equivale a `ancho`.
  test.each([5, 10, 30, 60, 80, 124])(
    'la línea separadora mide exactamente el ancho indicado (ancho %i)',
    (ancho) => {
      const resultado = generarGraficoAscii(crearDatos([1, 0.5, 0.25]), {
        ancho
      });

      expect(resultado.split('\n')[2]).toBe('-'.repeat(ancho));
    }
  );

  // Con ancho 124 el área de barras mide 100: 1 -> 100, 0.5 -> 50, 0.25 -> 25.
  test('las barras son proporcionales al error (ancho 124)', () => {
    const resultado = generarGraficoAscii(crearDatos([1, 0.5, 0.25]), {
      ancho: 124
    });

    expect(longitudesBarras(resultado)).toEqual([100, 50, 25]);
  });

  test('un ancho mayor produce barras más largas para los mismos datos', () => {
    const datos = crearDatos([1, 0.5, 0.25]);
    const angosto = longitudesBarras(generarGraficoAscii(datos, { ancho: 40 }));
    const ancho = longitudesBarras(generarGraficoAscii(datos, { ancho: 100 }));

    expect(Math.max(...ancho)).toBeGreaterThan(Math.max(...angosto));
  });

  // Solo importa la proporción respecto al error máximo, no su magnitud.
  test.each([1000, 1e-6])(
    'la longitud de las barras no depende de la escala del error (factor %p)',
    (factor) => {
      const base = longitudesBarras(
        generarGraficoAscii(crearDatos([1, 0.5, 0.25]), { ancho: 60 })
      );
      const escalado = longitudesBarras(
        generarGraficoAscii(crearDatos([1, 0.5, 0.25].map((e) => e * factor)), {
          ancho: 60
        })
      );

      expect(base).toEqual([36, 18, 9]);
      expect(escalado).toEqual(base);
    }
  );
});

describe('generarGraficoAscii - precisión y tolerancias', () => {
  // Cada tolerancia se muestra con el formato numérico del gráfico.
  test.each([
    [1e-2, '0.01000'],
    [1e-3, '0.001000'],
    [1e-4, '1.00e-4'],
    [1e-8, '1.00e-8'],
    [1e-12, '1.00e-12'],
    [1e-15, '1.00e-15']
  ])('muestra con formato legible un error de %p', (error, esperado) => {
    const resultado = generarGraficoAscii(
      [{ n: 1, error: 1 }, { n: 2, error }],
      { ancho: 60 }
    );

    expect(etiquetasError(resultado)).toEqual(['1.000', esperado]);
  });

  test.each([
    [1, '1.000'],
    [0.5, '0.5000'],
    [999.9, '999.9'],
    [1000, '1.00e+3'],
    [0, '0']
  ])('formatea el error %p como %s', (error, esperado) => {
    const resultado = generarGraficoAscii([{ n: 1, error }], { ancho: 60 });

    expect(etiquetasError(resultado)).toEqual([esperado]);
  });

  // Se necesitan 3, 7 y 13 iteraciones para bajar de 5e-3, 5e-7 y 5e-13
  // con e_n = 10^-n; a menor tolerancia, más filas en el gráfico.
  test('tolerancias más estrictas generan más iteraciones en el gráfico', () => {
    const filasPorTolerancia = [5e-3, 5e-7, 5e-13].map((tolerancia) => {
      const errores = [];
      let n = 1;
      while (10 ** -n > tolerancia) {
        errores.push(10 ** -n);
        n += 1;
      }
      errores.push(10 ** -n);

      return lineasConBarra(
        generarGraficoAscii(crearDatos(errores), { ancho: 60 })
      ).length;
    });

    expect(filasPorTolerancia).toEqual([3, 7, 13]);
  });

  test('usa el error absoluto cuando el error viene con signo negativo', () => {
    const resultado = generarGraficoAscii(crearDatos([-1, 0.5]), { ancho: 60 });

    expect(etiquetasError(resultado)).toEqual(['1.000', '0.5000']);
    expect(longitudesBarras(resultado)).toEqual([36, 18]);
  });

  test('prioriza el campo error y salta los campos no finitos', () => {
    const resultado = generarGraficoAscii(
      [
        { n: 1, error: NaN, ea: 0.3 },
        { n: 2, error: 1, ea: 0.1 }
      ],
      { ancho: 60 }
    );

    // La primera iteración usa `ea` (error es NaN); la segunda usa `error`.
    expect(etiquetasError(resultado)).toEqual(['0.3000', '1.000']);
  });

  test('todos los errores en cero producen barras mínimas de una columna', () => {
    const resultado = generarGraficoAscii(crearDatos([0, 0, 0]), { ancho: 60 });

    expect(longitudesBarras(resultado)).toEqual([1, 1, 1]);
  });

  test('un error cero junto a errores positivos conserva una barra mínima', () => {
    const resultado = generarGraficoAscii(crearDatos([1, 0]), { ancho: 60 });

    expect(longitudesBarras(resultado)).toEqual([36, 1]);
  });
});

describe('generarGraficoAscii - orden de convergencia', () => {
  // e_n = 0.5^n (orden 1): barras 36, 18, 9, 5, 2, 1 con ancho 60.
  test('convergencia lineal: las barras decrecen de forma monótona', () => {
    const errores = [1, 2, 3, 4, 5, 6].map((n) => 0.5 ** n);
    const longitudes = longitudesBarras(
      generarGraficoAscii(crearDatos(errores), { ancho: 60 })
    );

    expect(longitudes).toEqual([36, 18, 9, 5, 2, 1]);
    for (let i = 1; i < longitudes.length; i += 1) {
      expect(longitudes[i]).toBeLessThanOrEqual(longitudes[i - 1]);
    }
  });

  // e_{n+1} = e_n^2 (orden 2): barras 36, 18, 5, 1, 1, 1 con ancho 60.
  test('convergencia cuadrática: las barras caen más rápido que en la lineal', () => {
    const lineal = [1, 2, 3, 4, 5, 6].map((n) => 0.5 ** n);
    const cuadratica = [0.5];
    for (let i = 1; i < 6; i += 1) {
      cuadratica.push(cuadratica[i - 1] ** 2);
    }

    const barrasLineal = longitudesBarras(
      generarGraficoAscii(crearDatos(lineal), { ancho: 60 })
    );
    const barrasCuadratica = longitudesBarras(
      generarGraficoAscii(crearDatos(cuadratica), { ancho: 60 })
    );

    const largas = (longitudes) => longitudes.filter((l) => l > 1).length;

    expect(barrasCuadratica).toEqual([36, 18, 5, 1, 1, 1]);
    expect(largas(barrasCuadratica)).toBeLessThan(largas(barrasLineal));
  });

  // Newton para x^2 - 2 desde x0 = 1 con error relativo respecto a sqrt(2):
  // 6.07e-2, 1.73e-3, 1.50e-6, 1.13e-12, 1.57e-16.
  test('error relativo de Newton: converge rápidamente y se muestra por iteración', () => {
    const iteraciones = [];
    let x = 1;
    for (let n = 1; n <= 5; n += 1) {
      x = (x + 2 / x) / 2;
      iteraciones.push({
        n,
        errorRelativo: Math.abs(x - Math.SQRT2) / Math.SQRT2
      });
    }

    const resultado = generarGraficoAscii(iteraciones, { ancho: 60 });
    const longitudes = longitudesBarras(resultado);

    expect(longitudes).toHaveLength(5);
    expect(longitudes[0]).toBe(36);
    expect(longitudes.slice(1)).toEqual([1, 1, 1, 1]);
    expect(etiquetasError(resultado)[0]).toBe('0.06066');
    // Cada error relativo es menor que el anterior.
    for (let i = 1; i < iteraciones.length; i += 1) {
      expect(iteraciones[i].errorRelativo).toBeLessThan(
        iteraciones[i - 1].errorRelativo
      );
    }
  });
});

describe('generarGraficoAscii - no convergencia y divergencia', () => {
  // Errores que se duplican: barras 2, 5, 9, 18, 36 con ancho 60.
  test('divergencia: las barras crecen y la última ocupa todo el ancho', () => {
    const resultado = generarGraficoAscii(crearDatos([0.1, 0.2, 0.4, 0.8, 1.6]), {
      ancho: 60
    });
    const longitudes = longitudesBarras(resultado);

    expect(longitudes).toEqual([2, 5, 9, 18, 36]);
    expect(longitudes[longitudes.length - 1]).toBeGreaterThan(longitudes[0]);
  });

  test('una sucesión convergente termina con barra menor y una divergente con barra mayor', () => {
    const convergente = longitudesBarras(
      generarGraficoAscii(crearDatos([1, 0.5, 0.25, 0.125]), { ancho: 60 })
    );
    const divergente = longitudesBarras(
      generarGraficoAscii(crearDatos([0.125, 0.25, 0.5, 1]), { ancho: 60 })
    );

    expect(convergente[convergente.length - 1]).toBeLessThan(convergente[0]);
    expect(divergente[divergente.length - 1]).toBeGreaterThan(divergente[0]);
  });

  test('estancamiento: error constante produce barras de igual longitud', () => {
    const longitudes = longitudesBarras(
      generarGraficoAscii(crearDatos([0.5, 0.5, 0.5, 0.5, 0.5]), { ancho: 60 })
    );

    expect(longitudes).toEqual([36, 36, 36, 36, 36]);
  });

  // Oscilación 1, 0.9, 1, 0.9...: el error no baja, todas las barras >= 32.
  test('oscilación: el error no decrece y ninguna barra se reduce de forma notable', () => {
    const longitudes = longitudesBarras(
      generarGraficoAscii(crearDatos([1, 0.9, 1, 0.9, 1, 0.9]), { ancho: 60 })
    );

    expect(longitudes).toEqual([36, 32, 36, 32, 36, 32]);
    expect(Math.min(...longitudes)).toBeGreaterThanOrEqual(32);
  });

  test('ignora errores infinitos o NaN de una divergencia numérica', () => {
    const resultado = generarGraficoAscii(
      crearDatos([1, 10, 100, Infinity, NaN]),
      { ancho: 60 }
    );

    expect(longitudesBarras(resultado)).toEqual([1, 4, 36]);
    expect(resultado).not.toContain('Infinity');
    expect(resultado).not.toContain('NaN');
  });

  test('devuelve el mensaje cuando todos los errores son NaN o infinitos', () => {
    const resultado = generarGraficoAscii([
      { error: NaN },
      { error: Infinity },
      { error: -Infinity }
    ]);

    expect(resultado).toBe(MENSAJE_SIN_DATOS);
  });

  test.each([
    ['undefined', undefined],
    ['null', null],
    ['objeto vacío', {}],
    ['cadena de texto', 'texto'],
    ['número', 42],
    ['iteraciones no es un arreglo', { iteraciones: 'abc' }],
    ['error como cadena', [{ n: 1, error: '0.5' }]],
    ['iteración sin campo de error', [{ n: 1, x: 3 }]]
  ])('devuelve el mensaje sin lanzar error para entrada inválida: %s', (_, datos) => {
    expect(generarGraficoAscii(datos)).toBe(MENSAJE_SIN_DATOS);
  });
});

describe('generarGraficoAscii - numeración, formato y efectos secundarios', () => {
  test('usa el índice + 1 cuando la iteración no trae n', () => {
    const resultado = generarGraficoAscii([{ error: 1 }, { error: 0.5 }, { error: 0.25 }], {
      ancho: 60
    });

    expect(iteracionesMostradas(resultado)).toEqual(['1', '2', '3']);
  });

  test('respeta el valor de n cuando se proporciona', () => {
    const resultado = generarGraficoAscii(
      [
        { n: 5, error: 1 },
        { n: 6, error: 0.5 }
      ],
      { ancho: 60 }
    );

    expect(iteracionesMostradas(resultado)).toEqual(['5', '6']);
  });

  test('respeta n = 0 y no lo reemplaza por el índice', () => {
    const resultado = generarGraficoAscii([{ n: 0, error: 1 }], { ancho: 60 });

    expect(iteracionesMostradas(resultado)).toEqual(['0']);
  });

  test('omite iteraciones sin error pero conserva la numeración original', () => {
    const resultado = generarGraficoAscii(
      [{ x: 1 }, { error: 1 }, { x: 2 }, { error: 0.5 }],
      { ancho: 60 }
    );

    expect(iteracionesMostradas(resultado)).toEqual(['2', '4']);
  });

  test('el encabezado tiene tres líneas y luego una fila por punto', () => {
    const resultado = generarGraficoAscii(crearDatos([1, 0.5, 0.25]), {
      ancho: 60
    });
    const lineas = resultado.split('\n');

    expect(typeof resultado).toBe('string');
    expect(lineas[0]).toBe('Gráfico ASCII de convergencia');
    expect(lineas[1]).toBe('Iteración | Error        | Gráfico');
    expect(lineas).toHaveLength(3 + 3);
  });

  test('no modifica los datos de entrada', () => {
    const datos = {
      iteraciones: [
        { n: 1, error: 1, extra: 'a' },
        { n: 2, error: 0.5 },
        { n: 3, error: NaN }
      ]
    };
    const copia = JSON.parse(JSON.stringify(datos));

    generarGraficoAscii(datos, { ancho: 60 });

    expect(JSON.parse(JSON.stringify(datos))).toEqual(copia);
  });

  test('es determinista: la misma entrada produce el mismo gráfico', () => {
    const datos = crearDatos([1, 0.5, 0.25, 0.125]);

    expect(generarGraficoAscii(datos, { ancho: 60 })).toBe(
      generarGraficoAscii(datos, { ancho: 60 })
    );
  });
});
