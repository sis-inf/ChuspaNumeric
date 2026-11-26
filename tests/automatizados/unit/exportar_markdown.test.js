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
      'exportarMarkdown: resultado debe ser un objeto válido de ChuspaNumeric.'
    );

    expect(() => exportarMarkdown(undefined)).toThrow(
      'exportarMarkdown: resultado debe ser un objeto válido de ChuspaNumeric.'
    );

    expect(() => exportarMarkdown('resultado inválido')).toThrow(
      'exportarMarkdown: resultado debe ser un objeto válido de ChuspaNumeric.'
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

// ---------------------------------------------------------------------------
// Helpers de los tests nuevos
// ---------------------------------------------------------------------------

const MSG_INVALIDO =
  'exportarMarkdown: resultado debe ser un objeto válido de ChuspaNumeric.';

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

// Devuelve el contenido de una sección "## <titulo>" (sin el encabezado).
const seccion = (texto, titulo) => {
  const inicio = texto.indexOf(`## ${titulo}\n\n`);
  const resto = texto.slice(inicio + titulo.length + 5);
  const fin = resto.search(/\n\n(## |---)/);
  return fin === -1 ? resto : resto.slice(0, fin);
};

const celdas = (fila) =>
  fila
    .split('|')
    .slice(1, -1)
    .map((c) => c.trim());

// Filas de datos de la tabla de iteraciones (sin encabezado ni separador).
const filasDatos = (texto) =>
  seccion(texto, 'Tabla de iteraciones').split('\n').slice(2).map(celdas);

const columna = (texto, indice) =>
  filasDatos(texto).map((fila) => Number(fila[indice]));

// Historial tipo bisección: error de paso = 0.5^n, se detiene al bajar de tol.
const generarLineal = (tol, maxIter = 100) => {
  const iteraciones = [];
  for (let n = 1; n <= maxIter; n++) {
    const error = 0.5 ** n;
    iteraciones.push({ n, x: Math.SQRT2 + error, error });
    if (error < tol) break;
  }
  return iteraciones;
};

// Historial de convergencia cuadrática: e_{n+1} = e_n^2, partiendo de 0.5.
const generarCuadratico = (tol, maxIter = 20) => {
  const iteraciones = [];
  let error = 0.5;
  for (let n = 1; n <= maxIter; n++) {
    iteraciones.push({ n, x: Math.SQRT2 + error, error });
    if (error < tol) break;
    error = error * error;
  }
  return iteraciones;
};

const reporteDe = (iteraciones, extra = {}) =>
  exportarMarkdown({
    resultado: Math.SQRT2,
    iteraciones,
    convergio: true,
    mensaje: 'ok',
    meta: { metodo: 'Bisección', parametros: {}, tiempo_ms: 1 },
    ...extra,
  });

// ---------------------------------------------------------------------------
// Precisión y tolerancias
// ---------------------------------------------------------------------------

describe('exportarMarkdown - precisión según tolerancia', () => {
  const tolerancias = [1e-2, 1e-3, 1e-4, 1e-6, 1e-8, 1e-12];

  // Cálculo manual: con error de paso 0.5^n, se detiene en el primer n
  // con 0.5^n < tol. El helper replica esa regla y el reporte debe
  // reflejar exactamente ese número de iteraciones.
  test.each(tolerancias)(
    'refleja tolerancia %p, número de iteraciones y último paso < tol',
    (tol) => {
      const iteraciones = generarLineal(tol);
      const texto = exportarMarkdown({
        resultado: Math.SQRT2 + 0.5 ** iteraciones.length,
        iteraciones,
        convergio: true,
        mensaje: 'Convergió',
        meta: {
          metodo: 'Bisección',
          parametros: { a: 1, b: 2, tolerancia: tol, maxIter: 100 },
          tiempo_ms: 2.5
        }
      });

      // La tolerancia se imprime tal cual la convierte JS (1e-8 -> "1e-8").
      expect(texto).toContain(`| \`tolerancia\` | \`${tol}\` |`);
      expect(texto).toContain(
        `| **Iteraciones realizadas** | ${iteraciones.length} |`
      );
      expect(filasDatos(texto)).toHaveLength(iteraciones.length);

      // Último paso mostrado: la tabla redondea a 6 decimales (error <= 5e-7).
      const errores = columna(texto, 2);
      expect(errores[errores.length - 1]).toBeLessThanOrEqual(tol + 5e-7);

      // Error del resultado respecto a la solución exacta (10 decimales).
      const mostrado = Number(seccion(texto, 'Resultado'));
      expect(Math.abs(mostrado - Math.SQRT2)).toBeLessThanOrEqual(tol + 5e-11);
    }
  );

  test('endurecer la tolerancia no reduce las iteraciones reportadas', () => {
    const conteos = tolerancias.map((tol) => {
      const texto = reporteDe(generarLineal(tol));
      return filasDatos(texto).length;
    });

    for (let i = 1; i < conteos.length; i++) {
      expect(conteos[i]).toBeGreaterThanOrEqual(conteos[i - 1]);
    }
    expect(conteos[conteos.length - 1]).toBeGreaterThan(conteos[0]);
  });

  test.each([
    [1e-2, '0.01'],
    [1e-3, '0.001'],
    [1e-6, '0.000001'],
    [1e-7, '1e-7'],
    [1e-12, '1e-12']
  ])('imprime la tolerancia %p como %p en los parámetros', (tol, esperado) => {
    const texto = exportarMarkdown({
      resultado: 1,
      meta: { parametros: { tolerancia: tol } }
    });

    expect(texto).toContain(`| \`tolerancia\` | \`${esperado}\` |`);
  });

  test.each([
    Math.SQRT2,
    Math.PI,
    Math.E,
    1 / 3,
    123456.789012345,
    -0.1,
    0
  ])('el resultado %p se muestra con 10 decimales y error < 5e-11', (valor) => {
    const texto = exportarMarkdown({ resultado: valor });
    const mostrado = seccion(texto, 'Resultado');

    expect(mostrado).toMatch(/^-?\d+\.\d{10}$/);
    expect(Math.abs(Number(mostrado) - valor)).toBeLessThanOrEqual(5e-11);
  });

  test('valores concretos del resultado con 10 decimales', () => {
    // sqrt(2) = 1.41421356237... -> 1.4142135624
    // pi      = 3.14159265358... -> 3.1415926536
    expect(seccion(exportarMarkdown({ resultado: Math.SQRT2 }), 'Resultado')).toBe(
      '1.4142135624'
    );
    expect(seccion(exportarMarkdown({ resultado: Math.PI }), 'Resultado')).toBe(
      '3.1415926536'
    );
    expect(seccion(exportarMarkdown({ resultado: -2.5 }), 'Resultado')).toBe(
      '-2.5000000000'
    );
  });

  test('la tabla tiene resolución de 6 decimales: errores < 5e-7 se muestran como 0', () => {
    // 4e-7 y 1e-12 caen por debajo de la resolución de toFixed(6).
    const texto = reporteDe([
      { n: 1, x: 1, error: 1e-6 },
      { n: 2, x: 1, error: 4e-7 },
      { n: 3, x: 1, error: 1e-12 }
    ]);

    const errores = filasDatos(texto).map((fila) => fila[2]);
    expect(errores).toEqual(['0.000001', '0.000000', '0.000000']);
  });
});

// ---------------------------------------------------------------------------
// Tamaño de paso, criterio de parada y orden de convergencia
// ---------------------------------------------------------------------------

describe('exportarMarkdown - tabla de iteraciones y orden de convergencia', () => {
  test('el encabezado de la tabla sale de la primera iteración', () => {
    const texto = reporteDe([
      { n: 1, x: 1.5, error: 0.5 },
      { n: 2, x: 1.25, error: 0.25 }
    ]);
    const lineas = seccion(texto, 'Tabla de iteraciones').split('\n');

    expect(lineas[0]).toBe('| n | x | error |');
    expect(lineas[1]).toBe('| --- | --- | --- |');
    expect(lineas).toHaveLength(4);
  });

  test('la columna n es secuencial desde 1 y los valores usan 6 decimales', () => {
    const iteraciones = generarLineal(1e-3);
    const texto = reporteDe(iteraciones);

    const ns = columna(texto, 0);
    expect(ns).toEqual(iteraciones.map((_, i) => i + 1));

    for (const fila of filasDatos(texto)) {
      expect(fila[0]).toMatch(/^\d+\.\d{6}$/);
      expect(fila[1]).toMatch(/^\d+\.\d{6}$/);
      expect(fila[2]).toMatch(/^\d+\.\d{6}$/);
    }
  });

  test('convergencia lineal: los errores decrecen con tasa media ~0.5', () => {
    // Cálculo manual: e_n = 0.5^n -> e_{n+1} / e_n = 0.5.
    // Se usan solo las 8 primeras filas (0.5^8 ≈ 0.0039 >> 5e-7 de redondeo).
    const errores = columna(reporteDe(generarLineal(1e-6)), 2).slice(0, 8);

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
      expect(errores[i] / errores[i - 1]).toBeCloseTo(0.5, 2);
    }
  });

  test('convergencia cuadrática: e_{n+1} ≈ e_n^2', () => {
    // Cálculo manual: 0.5 -> 0.25 -> 0.0625 -> 0.00390625 -> 1.5e-5
    const errores = columna(reporteDe(generarCuadratico(1e-4)), 2);

    expect(errores.slice(0, 4)).toEqual([0.5, 0.25, 0.0625, 0.003906]);
    for (let i = 0; i < 3; i++) {
      expect(errores[i + 1] / errores[i] ** 2).toBeCloseTo(1, 3);
    }
  });

  test('un orden mayor de convergencia reporta menos iteraciones', () => {
    const lineal = filasDatos(reporteDe(generarLineal(1e-4))).length;
    const cuadratico = filasDatos(reporteDe(generarCuadratico(1e-4))).length;

    expect(cuadratico).toBeLessThan(lineal);
  });

  test('formatea x vectorial (estilo Gauss-Seidel) con 4 decimales', () => {
    const texto = reporteDe([
      { n: 1, x: [0.5, 0.25], error: 0.5 },
      { n: 2, x: [0.9, 0.45], error: 0.25 }
    ]);
    const filas = filasDatos(texto);

    expect(filas[0][1]).toBe('[0.5000, 0.2500]');
    expect(filas[1][1]).toBe('[0.9000, 0.4500]');
  });

  test('campos faltantes o null en una iteración se muestran como —', () => {
    const texto = reporteDe([
      { n: 1, x: 1, error: 0.5 },
      { n: 2, x: 2 },
      { n: 3, x: 3, error: null }
    ]);
    const filas = filasDatos(texto);

    expect(filas[1]).toEqual(['2.000000', '2.000000', '—']);
    expect(filas[2]).toEqual(['3.000000', '3.000000', '—']);
  });
});

// ---------------------------------------------------------------------------
// No convergencia, divergencia y agotamiento de maxIter
// ---------------------------------------------------------------------------

describe('exportarMarkdown - no convergencia y divergencia', () => {
  test('convergio=false se reporta como ❌ No junto con el mensaje', () => {
    const texto = exportarMarkdown({
      resultado: 1.4,
      iteraciones: generarLineal(1e-12, 5),
      convergio: false,
      mensaje: 'Sin converger en 5 iteraciones.',
      meta: { metodo: 'Bisección', parametros: { maxIter: 5 }, tiempo_ms: 1 }
    });

    expect(texto).toContain('| **Convergió** | ❌ No |');
    expect(texto).not.toContain('✅ Sí');
    expect(seccion(texto, 'Mensaje')).toBe('> Sin converger en 5 iteraciones.');
  });

  test('convergio=true se reporta como ✅ Sí', () => {
    const texto = reporteDe(generarLineal(1e-2));

    expect(texto).toContain('| **Convergió** | ✅ Sí |');
    expect(texto).not.toContain('❌ No');
  });

  test('agotar maxIter: iteraciones realizadas = maxIter y último paso > tolerancia', () => {
    const maxIter = 5;
    const tol = 1e-12;
    // Cálculo manual: 0.5^5 = 0.03125 > 1e-12 -> no alcanza la tolerancia.
    const iteraciones = generarLineal(tol, maxIter);
    const texto = exportarMarkdown({
      resultado: Math.SQRT2,
      iteraciones,
      convergio: false,
      mensaje: 'Sin converger.',
      meta: {
        metodo: 'Bisección',
        parametros: { tolerancia: tol, maxIter },
        tiempo_ms: 1
      }
    });

    expect(iteraciones).toHaveLength(maxIter);
    expect(texto).toContain(`| **Iteraciones realizadas** | ${maxIter} |`);
    expect(texto).toContain(`| \`maxIter\` | \`${maxIter}\` |`);
    expect(filasDatos(texto)).toHaveLength(maxIter);

    const errores = columna(texto, 2);
    expect(errores[errores.length - 1]).toBeGreaterThan(tol);
    expect(errores[errores.length - 1]).toBeCloseTo(0.03125, 6);
  });

  test('divergencia: el error mostrado crece en cada iteración', () => {
    // Errores 1, 2, 4, 8, 16: razón 2 > 1 (divergente).
    const iteraciones = [1, 2, 3, 4, 5].map((n) => ({
      n,
      x: 2 ** n,
      error: 2 ** (n - 1)
    }));
    const texto = exportarMarkdown({
      resultado: 32,
      iteraciones,
      convergio: false,
      mensaje: 'El método diverge.',
      meta: { metodo: 'Punto fijo', parametros: {}, tiempo_ms: 1 }
    });

    const errores = columna(texto, 2);
    expect(errores).toEqual([1, 2, 4, 8, 16]);
    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeGreaterThan(errores[i - 1]);
      expect(errores[i] / errores[i - 1]).toBeCloseTo(2, 6);
    }
    expect(texto).toContain('| **Convergió** | ❌ No |');
    expect(seccion(texto, 'Mensaje')).toBe('> El método diverge.');
  });

  test.each([
    [Infinity, 'Infinity'],
    [-Infinity, '-Infinity'],
    [NaN, 'NaN']
  ])('resultado no finito %p se muestra como %p', (valor, esperado) => {
    const texto = exportarMarkdown({ resultado: valor, convergio: false });

    expect(seccion(texto, 'Resultado')).toBe(esperado);
    expect(texto).toContain('| **Convergió** | ❌ No |');
  });

  test('error NaN o Infinity en una iteración no rompe la tabla', () => {
    const texto = reporteDe([
      { n: 1, x: 1, error: NaN },
      { n: 2, x: 2, error: Infinity }
    ]);
    const filas = filasDatos(texto);

    expect(filas[0][2]).toBe('NaN');
    expect(filas[1][2]).toBe('Infinity');
  });

  test('sin mensaje no se genera la sección Mensaje', () => {
    const texto = exportarMarkdown({ resultado: 1, mensaje: '' });

    expect(texto).not.toContain('## Mensaje');
  });
});

// ---------------------------------------------------------------------------
// Parámetros, tiempo y estructura general
// ---------------------------------------------------------------------------

describe('exportarMarkdown - parámetros, tiempo y estructura', () => {
  test('formatea parámetros de tipo función, arreglo y número', () => {
    const texto = exportarMarkdown({
      resultado: 1,
      meta: {
        metodo: 'Newton',
        parametros: { f: (x) => x * x - 2, x0: [1, 2, 3], tolerancia: 1e-6 },
        tiempo_ms: 1
      }
    });

    expect(texto).toContain('| `f` | _(función)_ |');
    expect(texto).toContain('| `x0` | `[1,2,3]` |');
    expect(texto).toContain('| `tolerancia` | `0.000001` |');
  });

  test('sin parámetros se muestra la fila vacía | — | — |', () => {
    const texto = exportarMarkdown({ resultado: 1 });

    expect(seccion(texto, 'Parámetros de entrada')).toBe(
      '| Parámetro | Valor |\n| --- | --- |\n| — | — |'
    );
  });

  test.each([
    [0, '0.000'],
    [15, '15.000'],
    [2.5, '2.500'],
    [0.1234, '0.123'],
    [1234.5678, '1234.568']
  ])('tiempo_ms %p se muestra como %p ms', (tiempo, esperado) => {
    const texto = exportarMarkdown({
      resultado: 1,
      meta: { tiempo_ms: tiempo }
    });

    expect(texto).toContain(`| **Tiempo de ejecución** | ${esperado} ms |`);
  });

  test('un título vacío usa el título por defecto con el método', () => {
    const texto = exportarMarkdown(
      { resultado: 1, meta: { metodo: 'Secante' } },
      { titulo: '' }
    );

    expect(texto.startsWith('# Reporte — Secante\n')).toBe(true);
  });

  test('formatea un resultado objeto: números a 10 decimales, el resto en JSON', () => {
    const texto = exportarMarkdown({
      resultado: { raiz: Math.SQRT2, ok: true, nota: 'a' }
    });
    const lineas = seccion(texto, 'Resultado').split('\n');

    expect(lineas).toEqual([
      '- **raiz**: 1.4142135624',
      '- **ok**: true',
      '- **nota**: "a"'
    ]);
  });

  test('las secciones aparecen en el orden esperado', () => {
    const texto = reporteDe(generarLineal(1e-2));
    const orden = [
      '# Reporte',
      '## Información general',
      '## Parámetros de entrada',
      '## Resultado',
      '## Mensaje',
      '## Tabla de iteraciones'
    ].map((titulo) => texto.indexOf(titulo));

    for (const indice of orden) {
      expect(indice).toBeGreaterThanOrEqual(0);
    }
    for (let i = 1; i < orden.length; i++) {
      expect(orden[i]).toBeGreaterThan(orden[i - 1]);
    }
  });

  test('termina con el pie de generación y una marca de tiempo ISO', () => {
    const texto = exportarMarkdown({ resultado: 1 });
    const ultima = texto.split('\n').pop();

    expect(ultima).toMatch(
      /^_Reporte generado por ChuspaNumeric — \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z_$/
    );
  });

  test('no muta el objeto de entrada y es determinista salvo el pie', () => {
    const entrada = {
      resultado: 2.5,
      iteraciones: generarLineal(1e-2),
      convergio: true,
      mensaje: 'ok',
      meta: { metodo: 'Bisección', parametros: { a: 1, b: 3 }, tiempo_ms: 3 }
    };
    const copia = JSON.parse(JSON.stringify(entrada));

    const quitarPie = (t) => t.split('\n').slice(0, -1).join('\n');
    const primero = quitarPie(exportarMarkdown(entrada));
    const segundo = quitarPie(exportarMarkdown(entrada));

    expect(entrada).toEqual(copia);
    expect(primero).toBe(segundo);
  });
});

// ---------------------------------------------------------------------------
// Validación de entrada
// ---------------------------------------------------------------------------

describe('exportarMarkdown - validación de entrada', () => {
  // Este archivo no está refactorizado: lanza Error genérico con el prefijo
  // "exportarMarkdown:" (sin "ChuspaNumeric."). Se fija ese contrato actual.
  test.each([
    ['null', null],
    ['undefined', undefined],
    ['string', 'texto'],
    ['string vacío', ''],
    ['número', 42],
    ['cero', 0],
    ['true', true],
    ['false', false]
  ])('rechaza %s con Error y mensaje descriptivo', (_desc, entrada) => {
    const error = capturar(() => exportarMarkdown(entrada));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(MSG_INVALIDO);
  });

  test('llamar sin argumentos lanza el Error de validación, no un TypeError', () => {
    const error = capturar(() => exportarMarkdown());

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(/^exportarMarkdown:/);
  });
});
