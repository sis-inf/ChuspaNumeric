import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { exportarCSV, exportarCSVArchivo } from '../../../src/io/exportar_csv.js';

// Helpers
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

// Devuelve el valor (número) de la única celda de una tabla { v } exportada
const celda = (valor, precision) =>
  exportarCSV([{ v: valor }], { precision }).split('\n')[1];

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

describe('exportarCSV - precisión y error relativo de redondeo', () => {
  // La "tolerancia" del exportador es la precisión: el redondeo a p decimales
  // garantiza un error absoluto <= 0.5 * 10^-p (más un margen de flotante).
  const cota = (p) => 0.5 * 10 ** -p * (1 + 1e-9) + 1e-15;

  const valores = [
    ['pi', Math.PI],
    ['e', Math.E],
    ['raíz de 2', Math.SQRT2],
    ['2/3', 2 / 3],
  ];

  const precisiones = [0, 1, 2, 3, 4, 6, 8, 10, 12];

  describe.each(valores)('valor %s', (_nombre, x) => {
    test.each(precisiones)(
      'precisión %i: error absoluto <= 0.5 * 10^-p y error relativo acotado',
      (p) => {
        // Cálculo manual: |redondeo(x, p) - x| <= 0.5 * 10^-p
        const exportado = Number(celda(x, p));
        const errorAbs = Math.abs(exportado - x);
        const errorRel = errorAbs / Math.abs(x);

        expect(Number.isFinite(exportado)).toBe(true);
        expect(errorAbs).toBeLessThanOrEqual(cota(p));
        expect(errorRel).toBeLessThanOrEqual(cota(p) / Math.abs(x));
      }
    );
  });

  test('pi con precisiones conocidas produce el texto esperado', () => {
    // pi = 3.14159265358979...
    expect(celda(Math.PI, 0)).toBe('3');
    expect(celda(Math.PI, 1)).toBe('3.1');
    expect(celda(Math.PI, 2)).toBe('3.14');
    expect(celda(Math.PI, 4)).toBe('3.1416');
    expect(celda(Math.PI, 6)).toBe('3.141593');
    expect(celda(Math.PI, 8)).toBe('3.14159265');
    expect(celda(Math.PI, 10)).toBe('3.1415926536');
  });

  test('usa precisión 6 por defecto', () => {
    expect(celda(Math.PI, undefined)).toBe('3.141593');
  });

  test('el error de redondeo no crece al endurecer la precisión (2/3)', () => {
    const x = 2 / 3;
    const errores = [];

    for (let p = 1; p <= 12; p++) {
      errores.push(Math.abs(Number(celda(x, p)) - x));
    }

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThanOrEqual(errores[i - 1]);
    }
  });

  test('orden de convergencia: el error se reduce ~10 veces por cada decimal', () => {
    // Verificado con código: error(p=1) = 3.3e-2, error(p=12) = 3.3e-13
    // tasa media = (e1 / e12)^(1/11) ~ 10
    const x = 2 / 3;
    const e1 = Math.abs(Number(celda(x, 1)) - x);
    const e12 = Math.abs(Number(celda(x, 12)) - x);
    const tasa = (e1 / e12) ** (1 / 11);

    expect(tasa).toBeGreaterThan(5);
    expect(tasa).toBeLessThan(20);
  });

  test('la cota teórica de error decrece exactamente 10 veces por decimal', () => {
    const cotaTeorica = (p) => 0.5 * 10 ** -p;

    for (let p = 0; p < 12; p++) {
      expect(cotaTeorica(p) / cotaTeorica(p + 1)).toBeCloseTo(10, 8);
    }
  });

  test('con la precisión mínima (0) el resultado es un entero', () => {
    // Cálculo manual: 3.5 -> 4, 0.4 -> 0, 2.9 -> 3
    expect(exportarCSV([{ a: 3.5, b: 0.4, c: 2.9 }], { precision: 0 })).toBe(
      'a,b,c\n4,0,3'
    );
  });

  test('elimina los ceros finales tras el redondeo', () => {
    // 1.5 con precisión 3 -> "1.500" -> Number -> 1.5
    expect(exportarCSV([{ v: 1.5, w: 2 }], { precision: 3 })).toBe('v,w\n1.5,2');
  });

  test('absorbe el ruido de flotante (0.1 + 0.2 con precisión 3)', () => {
    // 0.1 + 0.2 = 0.30000000000000004
    expect(celda(0.1 + 0.2, 3)).toBe('0.3');
  });

  test('un valor entero se exporta exacto con cualquier precisión', () => {
    for (const p of [0, 2, 6, 12]) {
      expect(celda(42, p)).toBe('42');
    }
  });

  test('un valor inicial lejano (magnitud grande) mantiene el error acotado', () => {
    const x = 123456789.1234567;
    const exportado = Number(celda(x, 2));

    expect(Math.abs(exportado - x)).toBeLessThanOrEqual(cota(2));
    expect(celda(x, 2)).toBe('123456789.12');
  });

  test('valores negativos se redondean con su signo', () => {
    // -2.5678 con precisión 2 -> -2.57
    expect(celda(-2.5678, 2)).toBe('-2.57');
  });

  test('un valor negativo que redondea a cero no produce "-0"', () => {
    expect(celda(-0.001, 2)).toBe('0');
  });

  test('valores menores que la tolerancia (0.5 * 10^-p) se exportan como 0', () => {
    // 4e-7 < 5e-7 -> 0 ; 6e-7 >= 5e-7 -> 0.000001
    expect(celda(4e-7, 6)).toBe('0');
    expect(celda(6e-7, 6)).toBe('0.000001');
  });

  test('exporta una secuencia de pasos con precisión fija', () => {
    const tabla = Array.from({ length: 5 }, (_, i) => ({
      n: i + 1,
      x: 0.1 * (i + 1),
    }));

    expect(exportarCSV(tabla, { precision: 2 })).toBe(
      'n,x\n1,0.1\n2,0.2\n3,0.3\n4,0.4\n5,0.5'
    );
  });

  test('una tabla grande (1000 filas) conserva el número de filas y el redondeo', () => {
    const tabla = Array.from({ length: 1000 }, (_, i) => ({ i, v: i / 3 }));
    const lineas = exportarCSV(tabla, { precision: 4 }).split('\n');

    // 1 encabezado + 1000 filas; fila 999 -> 999/3 = 333
    expect(lineas).toHaveLength(1001);
    expect(lineas[1000]).toBe('999,333');
    expect(lineas[2]).toBe('1,0.3333');
  });

  test('no modifica los datos de entrada al redondear', () => {
    const tabla = [{ x: 1.23456789 }];
    const copia = JSON.parse(JSON.stringify(tabla));

    exportarCSV(tabla, { precision: 2 });

    expect(tabla).toEqual(copia);
  });
});

describe('exportarCSV - valores no finitos y límites (detección de divergencia)', () => {
  test('exporta Infinity, -Infinity y NaN como texto sin lanzar error', () => {
    const resultado = exportarCSV([{ a: Infinity, b: -Infinity, c: NaN }]);

    expect(resultado).toBe('a,b,c\nInfinity,-Infinity,NaN');
  });

  test('los valores divergentes quedan visibles en el CSV', () => {
    // Una iteración que diverge a Infinity debe poder detectarse en la salida
    const iteraciones = [
      { n: 1, error: 0.5 },
      { n: 2, error: 50 },
      { n: 3, error: Infinity },
    ];
    const lineas = exportarCSV(iteraciones).split('\n');

    expect(lineas[3]).toBe('3,Infinity');
  });

  test('un número muy grande (>= 1e21) se exporta en notación exponencial', () => {
    expect(celda(1e21, 6)).toBe('1e+21');
  });

  test('un número muy pequeño con precisión baja se exporta como 0', () => {
    expect(celda(1e-7, 6)).toBe('0');
  });

  test.each([
    ['undefined', undefined],
    ['null', null],
    ['cadena', 'abc'],
    ['número', 5],
    ['objeto', { x: 1 }],
    ['booleano', true],
  ])('entrada no arreglo (%s) devuelve cadena vacía sin lanzar error', (_d, entrada) => {
    const error = capturar(() => exportarCSV(entrada));

    expect(error).toBeNull();
    expect(exportarCSV(entrada)).toBe('');
  });

  test('una tabla vacía sin encabezado también devuelve cadena vacía', () => {
    expect(exportarCSV([], { encabezado: false })).toBe('');
  });

  test('una fila sin columnas produce solo el salto de línea del encabezado vacío', () => {
    expect(exportarCSV([{}])).toBe('\n');
    expect(exportarCSV([{}], { encabezado: false })).toBe('');
  });
});

describe('exportarCSV - separadores, escapes y filas irregulares', () => {
  test('usa un separador personalizado', () => {
    expect(exportarCSV([{ a: 1, b: 2 }], { separador: ';' })).toBe('a;b\n1;2');
  });

  test('con separador ";" solo escapa los valores que contienen ";"', () => {
    const resultado = exportarCSV([{ a: 'x;y', b: '1,5', c: 1.25 }], {
      separador: ';',
    });

    expect(resultado).toBe('a;b;c\n"x;y";1,5;1.25');
  });

  test('duplica las comillas dobles internas y encierra el valor', () => {
    expect(exportarCSV([{ a: 'dice "hola"' }])).toBe('a\n"dice ""hola"""');
  });

  test('encierra entre comillas los valores con salto de línea', () => {
    expect(exportarCSV([{ a: 'l1\nl2' }])).toBe('a\n"l1\nl2"');
    expect(exportarCSV([{ a: 'a\rb' }])).toBe('a\n"a\rb"');
  });

  test('las columnas se toman de la primera fila; faltantes quedan vacías y extras se ignoran', () => {
    const tabla = [{ x: 1, y: 2 }, { x: 3 }, { y: 9, x: 5, z: 7 }];

    expect(exportarCSV(tabla)).toBe('x,y\n1,2\n3,\n5,9');
  });

  test('exporta booleanos y cadenas tal cual, sin redondear cadenas numéricas', () => {
    expect(exportarCSV([{ a: true, b: false, c: 'texto', d: 0 }])).toBe(
      'a,b,c,d\ntrue,false,texto,0'
    );
    expect(exportarCSV([{ a: '1.23456789' }], { precision: 2 })).toBe(
      'a\n1.23456789'
    );
  });

  test('usa los valores por defecto cuando opciones se omite o es vacío', () => {
    const tabla = [{ x: 1.23456789 }];

    expect(exportarCSV(tabla, {})).toBe(exportarCSV(tabla));
    expect(exportarCSV(tabla)).toBe('x\n1.234568');
  });
});

describe('exportarCSVArchivo', () => {
  let carpeta;

  beforeAll(() => {
    carpeta = mkdtempSync(join(tmpdir(), 'chuspa-csv-'));
  });

  afterAll(() => {
    rmSync(carpeta, { recursive: true, force: true });
  });

  test('escribe el archivo y devuelve el mismo contenido generado', () => {
    const ruta = join(carpeta, 'salida.csv');
    const tabla = [
      { n: 1, x: 0.123456789 },
      { n: 2, x: 0.5 },
    ];

    const contenido = exportarCSVArchivo(tabla, ruta, { precision: 3 });

    expect(contenido).toBe('n,x\n1,0.123\n2,0.5');
    expect(readFileSync(ruta, 'utf8')).toBe(contenido);
  });

  test('el contenido del archivo coincide con exportarCSV usando las mismas opciones', () => {
    const ruta = join(carpeta, 'igual.csv');
    const tabla = [{ a: 'x;y', b: Math.PI }];
    const opciones = { separador: ';', encabezado: false, precision: 4 };

    exportarCSVArchivo(tabla, ruta, opciones);

    expect(readFileSync(ruta, 'utf8')).toBe(exportarCSV(tabla, opciones));
  });

  test('una tabla vacía genera un archivo vacío', () => {
    const ruta = join(carpeta, 'vacio.csv');

    expect(exportarCSVArchivo([], ruta)).toBe('');
    expect(readFileSync(ruta, 'utf8')).toBe('');
  });

  test('sobrescribe un archivo existente', () => {
    const ruta = join(carpeta, 'sobrescribe.csv');

    exportarCSVArchivo([{ a: 1 }], ruta);
    exportarCSVArchivo([{ b: 2 }], ruta);

    expect(readFileSync(ruta, 'utf8')).toBe('b\n2');
  });

  test.each([
    ['cadena vacía', ''],
    ['undefined', undefined],
    ['null', null],
    ['número', 123],
    ['objeto', {}],
  ])('ruta inválida (%s) lanza un Error con mensaje claro', (_d, ruta) => {
    const error = capturar(() => exportarCSVArchivo([{ x: 1 }], ruta));

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(/ruta del archivo CSV/);
  });

  test('si la ruta es inválida no se escribe nada ni se modifica la tabla', () => {
    const tabla = [{ x: 1.23456789 }];
    const copia = JSON.parse(JSON.stringify(tabla));

    capturar(() => exportarCSVArchivo(tabla, ''));

    expect(tabla).toEqual(copia);
  });
});
