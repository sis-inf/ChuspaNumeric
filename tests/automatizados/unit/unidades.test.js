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
    ['m', 'mi'],
    ['km', 'in'],
    ['cm', 'yd'],
    ['ft', 'mm'],
  ])('longitud: %s <-> %s', (a, b) => {
    const ida = convertirLongitud(123.456, a, b);
    expect(convertirLongitud(ida, b, a)).toBeCloseTo(123.456, 9);
  });

  test.each([
    ['C', 'F'],
    ['C', 'K'],
    ['F', 'K'],
  ])('temperatura: %s <-> %s', (a, b) => {
    const ida = convertirTemperatura(25.5, a, b);
    expect(convertirTemperatura(ida, b, a)).toBeCloseTo(25.5, 9);
  });

  test.each([
    ['Pa', 'atm'],
    ['bar', 'psi'],
    ['kPa', 'mmHg'],
    ['MPa', 'torr'],
  ])('presión: %s <-> %s', (a, b) => {
    const ida = convertirPresion(50, a, b);
    expect(convertirPresion(ida, b, a)).toBeCloseTo(50, 9);
  });

  test.each([
    ['J', 'kWh'],
    ['kcal', 'BTU'],
    ['MJ', 'cal'],
    ['Wh', 'eV'],
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

// ===========================================================================
// Ampliación del issue #1652: precisión, error relativo/absoluto y redondeo.
// Tolerancias explícitas (en doble precisión: épsilon de máquina ~2.2e-16).
// ===========================================================================

// Error relativo máximo aceptado en conversiones multiplicativas
// (longitud, presión, energía): unas pocas unidades de redondeo (ulp).
const TOL_REL = 1e-14;
// Error absoluto máximo aceptado en ida y vuelta de temperatura. El
// desplazamiento de 273.15 limita la precisión absoluta a ~1e-13.
const TOL_ABS_TEMP = 1e-9;

const errorRelativo = (obtenido, esperado) =>
  Math.abs(obtenido - esperado) / Math.abs(esperado);

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe('unidades - valores muy pequeños y muy grandes (error relativo)', () => {
  // Cálculo manual: 1e-9 m * 1 / 0.001 = 1e-6 mm; 1e12 m / 1000 = 1e9 km, etc.
  test.each([
    ['longitud', convertirLongitud, 1e-9, 'm', 'mm', 1e-6],
    ['longitud', convertirLongitud, 1e-12, 'km', 'm', 1e-9],
    ['longitud', convertirLongitud, 1e12, 'm', 'km', 1e9],
    ['longitud', convertirLongitud, 5e15, 'mm', 'km', 5e9],
    ['presión', convertirPresion, 1e-6, 'Pa', 'MPa', 1e-12],
    ['presión', convertirPresion, 1e9, 'Pa', 'MPa', 1e3],
    ['presión', convertirPresion, 1e12, 'bar', 'Pa', 1e17],
    ['energía', convertirEnergia, 1e15, 'kWh', 'J', 3.6e21],
    // 1e-3 eV * 1.602176634e-19 = 1.602176634e-22 J
    ['energía', convertirEnergia, 1e-3, 'eV', 'J', 1.602176634e-22],
    // 1e-19 J / 1.602176634e-19 J/eV
    ['energía', convertirEnergia, 1e-19, 'J', 'eV', 1e-19 / 1.602176634e-19],
  ])('%s: %p %s -> %s', (_cat, fn, valor, desde, hasta, esperado) => {
    const obtenido = fn(valor, desde, hasta);
    expect(Number.isFinite(obtenido)).toBe(true);
    expect(obtenido).not.toBe(0);
    expect(errorRelativo(obtenido, esperado)).toBeLessThanOrEqual(TOL_REL);
  });

  // Cálculo manual: 1e6 K - 273.15 = 999726.85 C; 1e9 C * 9/5 + 32 = 1.8e9 + 32;
  // 1e4 F -> (1e4 - 32) * 5/9 = 5537.7777... C -> + 273.15 = 5810.9277... K
  test.each([
    [1e6, 'K', 'C', 999726.85],
    [1e9, 'C', 'F', 1.8e9 + 32],
    [1e4, 'F', 'K', ((1e4 - 32) * 5) / 9 + 273.15],
    [1e-9, 'C', 'K', 273.150000001],
  ])('temperatura: %p %s -> %s', (valor, desde, hasta, esperado) => {
    const obtenido = convertirTemperatura(valor, desde, hasta);
    expect(errorRelativo(obtenido, esperado)).toBeLessThanOrEqual(TOL_REL);
  });

  test('el valor cero se conserva en las conversiones multiplicativas', () => {
    expect(convertirLongitud(0, 'm', 'km')).toBe(0);
    expect(convertirPresion(0, 'Pa', 'atm')).toBe(0);
    expect(convertirEnergia(0, 'J', 'eV')).toBe(0);
  });

  test('el valor cero en temperatura respeta el desplazamiento de escala', () => {
    expect(convertirTemperatura(0, 'C', 'K')).toBeCloseTo(273.15, 12);
    expect(convertirTemperatura(0, 'K', 'C')).toBeCloseTo(-273.15, 12);
    expect(convertirTemperatura(0, 'C', 'F')).toBeCloseTo(32, 12);
  });

  test('los valores negativos se convierten con signo (excepto cero absoluto)', () => {
    expect(convertirLongitud(-5, 'km', 'm')).toBeCloseTo(-5000, 9);
    expect(convertirPresion(-2, 'bar', 'kPa')).toBeCloseTo(-200, 9);
    expect(convertirEnergia(-1, 'kWh', 'J')).toBeCloseTo(-3.6e6, 6);
    expect(convertirTemperatura(-40, 'F', 'C')).toBeCloseTo(-40, 9);
  });
});

describe('unidades - ida y vuelta: error absoluto y relativo', () => {
  const valores = [1e-12, 1e-6, 0.1, 1, 123.456, 1e6, 1e12];

  test.each([
    [
      'longitud',
      convertirLongitud,
      [['m', 'mi'], ['km', 'in'], ['cm', 'yd'], ['ft', 'mm']],
    ],
    [
      'presión',
      convertirPresion,
      [['Pa', 'atm'], ['bar', 'psi'], ['kPa', 'mmHg'], ['MPa', 'torr']],
    ],
    [
      'energía',
      convertirEnergia,
      [['J', 'kWh'], ['kcal', 'BTU'], ['MJ', 'cal'], ['Wh', 'eV'], ['J', 'eV']],
    ],
  ])('%s: error relativo de ida y vuelta <= TOL_REL en todo el rango', (_cat, fn, pares) => {
    for (const [a, b] of pares) {
      for (const valor of valores) {
        const vuelta = fn(fn(valor, a, b), b, a);
        const relativo = errorRelativo(vuelta, valor);
        const absoluto = Math.abs(vuelta - valor);
        // El error absoluto es proporcional a la magnitud: nunca mayor que
        // TOL_REL * |valor|.
        expect(relativo).toBeLessThanOrEqual(TOL_REL);
        expect(absoluto).toBeLessThanOrEqual(TOL_REL * Math.abs(valor));
      }
    }
  });

  test.each([
    ['C', 'F'],
    ['C', 'K'],
    ['F', 'K'],
  ])('temperatura %s <-> %s: error absoluto <= TOL_ABS_TEMP', (a, b) => {
    for (const valor of [1e-12, 1e-6, 0.1, 25.5, 1000, 1e6]) {
      const vuelta = convertirTemperatura(convertirTemperatura(valor, a, b), b, a);
      expect(Math.abs(vuelta - valor)).toBeLessThanOrEqual(TOL_ABS_TEMP);
    }
  });

  test('temperatura: con valores muy pequeños el error absoluto es mínimo pero el relativo no', () => {
    // 1e-12 C -> K suma 273.15, y el redondeo de 273.15 (~5.7e-14) es mayor
    // que una fracción apreciable de 1e-12: se pierde precisión relativa.
    const valor = 1e-12;
    const vuelta = convertirTemperatura(
      convertirTemperatura(valor, 'C', 'K'),
      'K',
      'C'
    );
    expect(Math.abs(vuelta - valor)).toBeLessThanOrEqual(1e-12);
    expect(errorRelativo(vuelta, valor)).toBeGreaterThan(1e-6);
  });

  test('longitud con el mismo valor pequeño conserva la precisión relativa', () => {
    const valor = 1e-12;
    const vuelta = convertirLongitud(convertirLongitud(valor, 'm', 'mi'), 'mi', 'm');
    expect(errorRelativo(vuelta, valor)).toBeLessThanOrEqual(TOL_REL);
  });
});

describe('unidades - pérdida de precisión por redondeo', () => {
  test('3 ft y 1 yd coinciden salvo redondeo (no se compara con igualdad exacta)', () => {
    // 3 * 0.3048 = 0.9144000000000001 (binario) vs 0.9144 exacto
    const porPies = convertirLongitud(3, 'ft', 'm');
    const porYardas = convertirLongitud(1, 'yd', 'm');
    expect(porPies).toBeCloseTo(0.9144, 12);
    expect(errorRelativo(porPies, porYardas)).toBeLessThanOrEqual(1e-15);
  });

  test('37 °C <-> 98.6 °F coinciden salvo redondeo', () => {
    expect(convertirTemperatura(37, 'C', 'F')).toBeCloseTo(98.6, 12);
    expect(convertirTemperatura(98.6, 'F', 'C')).toBeCloseTo(37, 12);
  });

  test('conversiones con factores no representables en binario (0.001, 0.01)', () => {
    expect(convertirLongitud(1, 'mm', 'm')).toBeCloseTo(0.001, 15);
    expect(convertirLongitud(0.1, 'm', 'mm')).toBeCloseTo(100, 12);
    expect(convertirLongitud(1, 'cm', 'm')).toBeCloseTo(0.01, 15);
  });

  test.each([
    ['longitud', convertirLongitud, 7.5, ['m', 'ft', 'in', 'yd', 'mi', 'km', 'cm', 'mm']],
    ['presión', convertirPresion, 101325, ['Pa', 'atm', 'psi', 'bar', 'mmHg', 'kPa', 'torr', 'MPa']],
    ['energía', convertirEnergia, 3.3, ['J', 'kWh', 'BTU', 'cal', 'kcal', 'eV', 'Wh', 'MJ']],
  ])('%s: una cadena de conversiones equivale a la conversión directa', (_cat, fn, valor, cadena) => {
    let acumulado = valor;
    for (let i = 0; i < cadena.length - 1; i++) {
      acumulado = fn(acumulado, cadena[i], cadena[i + 1]);
    }
    const directo = fn(valor, cadena[0], cadena[cadena.length - 1]);
    expect(errorRelativo(acumulado, directo)).toBeLessThanOrEqual(TOL_REL);
  });

  test.each([
    ['longitud', convertirLongitud, 'm', 'yd'],
    ['presión', convertirPresion, 'Pa', 'atm'],
    ['energía', convertirEnergia, 'J', 'BTU'],
  ])('%s: el error no se acumula tras 1000 ida y vuelta', (_cat, fn, a, b) => {
    const inicial = 12.345;
    let valor = inicial;
    for (let i = 0; i < 1000; i++) {
      valor = fn(fn(valor, a, b), b, a);
    }
    // Cota holgada: 1000 repeticiones * 1e-14 = 1e-11 en el peor caso teórico.
    expect(errorRelativo(valor, inicial)).toBeLessThanOrEqual(1e-11);
  });

  test('transitividad: A->B->C equivale a A->C', () => {
    const viaPsi = convertirPresion(convertirPresion(1, 'atm', 'psi'), 'psi', 'bar');
    expect(errorRelativo(viaPsi, convertirPresion(1, 'atm', 'bar'))).toBeLessThanOrEqual(TOL_REL);

    const viaPies = convertirLongitud(convertirLongitud(1, 'mi', 'ft'), 'ft', 'cm');
    expect(errorRelativo(viaPies, convertirLongitud(1, 'mi', 'cm'))).toBeLessThanOrEqual(TOL_REL);
  });

  test('linealidad: convertir k*x equivale a k*convertir(x)', () => {
    for (const k of [1e-6, 1e-3, 2, 1e3, 1e6]) {
      for (const x of [0.37, 1, 12.5]) {
        expect(
          errorRelativo(convertirLongitud(k * x, 'ft', 'm'), k * convertirLongitud(x, 'ft', 'm'))
        ).toBeLessThanOrEqual(TOL_REL);
        expect(
          errorRelativo(convertirPresion(k * x, 'psi', 'Pa'), k * convertirPresion(x, 'psi', 'Pa'))
        ).toBeLessThanOrEqual(TOL_REL);
        expect(
          errorRelativo(convertirEnergia(k * x, 'BTU', 'J'), k * convertirEnergia(x, 'BTU', 'J'))
        ).toBeLessThanOrEqual(TOL_REL);
      }
    }
  });

  test('presión: mmHg y torr comparten factor, la conversión entre ambos es 1 con redondeo mínimo', () => {
    expect(errorRelativo(convertirPresion(760, 'mmHg', 'torr'), 760)).toBeLessThanOrEqual(TOL_REL);
  });

  test('energía: 1 J en eV coincide con el inverso de la carga elemental', () => {
    // 1 / 1.602176634e-19 = 6.241509074460763e18 eV
    const esperado = 1 / 1.602176634e-19;
    expect(errorRelativo(convertirEnergia(1, 'J', 'eV'), esperado)).toBeLessThanOrEqual(TOL_REL);
  });
});

describe('unidades - cero absoluto y tolerancia de redondeo', () => {
  test('0 K equivale a -459.67 °F', () => {
    expect(convertirTemperatura(0, 'K', 'F')).toBeCloseTo(-459.67, 9);
  });

  test('-459.67 °F (cero absoluto) no lanza error pese al redondeo y da ~0 K', () => {
    // (-459.67 - 32) * 5/9 = -273.15000000000003 en binario: queda dentro de la
    // tolerancia de 1e-9 que usa la validación.
    expect(() => convertirTemperatura(-459.67, 'F', 'K')).not.toThrow();
    expect(convertirTemperatura(-459.67, 'F', 'K')).toBeCloseTo(0, 9);
  });

  test('-273.15 °C se acepta y da 0 K y -459.67 °F', () => {
    expect(convertirTemperatura(-273.15, 'C', 'K')).toBeCloseTo(0, 9);
    expect(convertirTemperatura(-273.15, 'C', 'F')).toBeCloseTo(-459.67, 9);
  });

  test('un valor apenas por debajo del cero absoluto (1e-12) se tolera por redondeo', () => {
    expect(() => convertirTemperatura(-273.15 - 1e-12, 'C', 'K')).not.toThrow();
  });

  test.each([
    [-273.16, 'C'],
    [-459.68, 'F'],
    [-0.01, 'K'],
  ])('%p %s (más allá de la tolerancia) lanza ErrorParametros con el mensaje de cero absoluto', (valor, escala) => {
    const error = capturar(() => convertirTemperatura(valor, escala, 'C'));
    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(/^ChuspaNumeric\.convertirTemperatura:/);
    expect(error.message).toMatch(/cero absoluto/);
  });

  test('el cero absoluto se valida también cuando origen y destino son la misma escala', () => {
    expect(() => convertirTemperatura(-300, 'C', 'C')).toThrow(ErrorParametros);
  });
});

describe('unidades - validación detallada de valores y unidades', () => {
  const conversores = [
    ['convertirLongitud', (v) => convertirLongitud(v, 'm', 'km')],
    ['convertirTemperatura', (v) => convertirTemperatura(v, 'C', 'F')],
    ['convertirPresion', (v) => convertirPresion(v, 'Pa', 'kPa')],
    ['convertirEnergia', (v) => convertirEnergia(v, 'J', 'kJ')],
  ];

  test.each([
    ['booleano', true],
    ['objeto', {}],
    ['arreglo vacío', []],
    ['arreglo [5]', [5]],
    ['bigint', 10n],
    ['Number envuelto', new Number(5)],
    ['string numérico', '1e3'],
    ['string vacío', ''],
  ])('valor de tipo no numérico (%s) lanza ErrorParametros en las cuatro funciones', (_desc, valor) => {
    for (const [nombre, fn] of conversores) {
      const error = capturar(() => fn(valor));
      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(new RegExp(`^ChuspaNumeric\\.${nombre}:`));
      expect(error.message).toMatch(/número finito/);
    }
  });

  test.each([
    ['NaN', NaN, /NaN/],
    ['Infinity', Infinity, /Infinity/],
    ['-Infinity', -Infinity, /-Infinity/],
  ])('valor %s: el mensaje incluye el valor recibido', (_desc, valor, regex) => {
    for (const [, fn] of conversores) {
      const error = capturar(() => fn(valor));
      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error.message).toMatch(regex);
    }
  });

  test('desbordamiento: un valor finito enorme convertido a una unidad pequeña no es NaN', () => {
    // 1e308 km -> m = Infinity (resultado fuera de rango), nunca NaN
    const resultado = convertirLongitud(1e308, 'km', 'm');
    expect(Number.isNaN(resultado)).toBe(false);
  });

  test.each([
    ['convertirLongitud', () => convertirLongitud(1, 'km', 'liga'), /unidad "liga" no soportada para longitud/],
    ['convertirLongitud', () => convertirLongitud(1, 'liga', 'm'), /unidad "liga" no soportada para longitud/],
    ['convertirPresion', () => convertirPresion(1, 'atm', 'libra'), /unidad "libra" no soportada para presión/],
    ['convertirEnergia', () => convertirEnergia(1, 'J', 'watt'), /unidad "watt" no soportada para energía/],
  ])('%s: unidad no soportada indica la unidad y la categoría', (nombre, fn, regex) => {
    const error = capturar(fn);
    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(new RegExp(`^ChuspaNumeric\\.${nombre}:`));
    expect(error.message).toMatch(regex);
    expect(error.message).toMatch(/Unidades disponibles/);
  });

  test('temperatura distingue la escala de origen de la de destino en el mensaje', () => {
    const origen = capturar(() => convertirTemperatura(1, 'x', 'C'));
    const destino = capturar(() => convertirTemperatura(1, 'C', 'X'));
    expect(origen).toBeInstanceOf(ErrorParametros);
    expect(origen.message).toMatch(/^ChuspaNumeric\.convertirTemperatura:/);
    expect(origen.message).toMatch(/unidad de origen "x"/);
    expect(destino).toBeInstanceOf(ErrorParametros);
    expect(destino.message).toMatch(/unidad de destino "X"/);
    expect(destino.message).toMatch(/C, F, K/);
  });

  test.each([
    ['undefined', undefined],
    ['null', null],
    ['número', 5],
    ['objeto', {}],
    ['string vacío', ''],
    ['espacio inicial', ' m'],
    ['espacio final', 'm '],
  ])('unidad de tipo o formato inválido (%s) lanza ErrorParametros', (_desc, unidad) => {
    const origen = capturar(() => convertirLongitud(1, unidad, 'm'));
    const destino = capturar(() => convertirLongitud(1, 'm', unidad));
    expect(origen).toBeInstanceOf(ErrorParametros);
    expect(origen).not.toBeInstanceOf(TypeError);
    expect(destino).toBeInstanceOf(ErrorParametros);
    expect(destino).not.toBeInstanceOf(TypeError);
  });

  test('las unidades distinguen mayúsculas y minúsculas (mmHg, MPa, kWh)', () => {
    expect(() => convertirPresion(1, 'mmhg', 'Pa')).toThrow(ErrorParametros);
    expect(() => convertirPresion(1, 'mpa', 'Pa')).toThrow(ErrorParametros);
    expect(() => convertirEnergia(1, 'kwh', 'J')).toThrow(ErrorParametros);
  });

  test('el valor se valida antes que las unidades', () => {
    const error = capturar(() => convertirLongitud(NaN, 'liga', 'm'));
    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error.message).toMatch(/número finito/);
  });

  test('una conversión fallida no impide que la siguiente sea correcta', () => {
    expect(() => convertirLongitud(1, 'km', 'liga')).toThrow(ErrorParametros);
    expect(convertirLongitud(1, 'km', 'm')).toBeCloseTo(1000, 9);
  });
});

describe('unidades - unidadesDisponibles (ampliación)', () => {
  test('cada llamada devuelve listas nuevas: mutarlas no afecta llamadas posteriores', () => {
    const primera = unidadesDisponibles();
    primera.longitud.push('liga');
    primera.temperatura.length = 0;
    const segunda = unidadesDisponibles();
    expect(segunda.longitud).not.toContain('liga');
    expect(segunda.temperatura).toEqual(['C', 'F', 'K']);
    expect(() => convertirLongitud(1, 'km', 'liga')).toThrow(ErrorParametros);
  });

  test('no hay unidades duplicadas en ninguna categoría', () => {
    const disponibles = unidadesDisponibles();
    for (const unidades of Object.values(disponibles)) {
      expect(new Set(unidades).size).toBe(unidades.length);
    }
  });

  test.each([
    ['longitud', ['m', 'km', 'cm', 'mm', 'ft', 'in', 'yd', 'mi']],
    ['presion', ['Pa', 'kPa', 'MPa', 'bar', 'atm', 'psi', 'mmHg', 'torr']],
    ['energia', ['J', 'kJ', 'MJ', 'cal', 'kcal', 'kWh', 'Wh', 'eV', 'BTU']],
  ])('%s expone exactamente las unidades documentadas', (categoria, esperadas) => {
    const unidades = unidadesDisponibles()[categoria];
    expect(unidades).toHaveLength(esperadas.length);
    expect(unidades).toEqual(expect.arrayContaining(esperadas));
  });

  test('toda unidad listada se convierte a sí misma sin pérdida (identidad)', () => {
    const disponibles = unidadesDisponibles();
    disponibles.longitud.forEach((u) =>
      expect(errorRelativo(convertirLongitud(2.5, u, u), 2.5)).toBeLessThanOrEqual(TOL_REL)
    );
    disponibles.presion.forEach((u) =>
      expect(errorRelativo(convertirPresion(2.5, u, u), 2.5)).toBeLessThanOrEqual(TOL_REL)
    );
    disponibles.energia.forEach((u) =>
      expect(errorRelativo(convertirEnergia(2.5, u, u), 2.5)).toBeLessThanOrEqual(TOL_REL)
    );
  });
});
