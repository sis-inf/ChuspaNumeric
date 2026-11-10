import {
  media,
  varianza,
  desviacionEstandar,
  mediana,
  moda,
  rangoIntercuartilico,
} from '../../../src/utils/estadistica.js';

describe('media', () => {
  test('calcula la media de un conjunto conocido', () => {
    expect(media([1, 2, 3, 4, 5])).toBe(3);
  });

  test('admite datos negativos', () => {
    expect(media([-2, -1, 0, 1, 2])).toBe(0);
    expect(media([-4, -6])).toBe(-5);
  });

  test('admite datos repetidos', () => {
    expect(media([2, 2, 2, 2])).toBe(2);
  });
});

describe('varianza', () => {
  test('calcula la varianza muestral por defecto', () => {
    expect(varianza([1, 2, 3, 4, 5])).toBe(2.5);
  });

  test('calcula la varianza poblacional', () => {
    expect(varianza([1, 2, 3, 4, 5], true)).toBe(2);
    expect(varianza([2, 4, 4, 4, 5, 5, 7, 9], true)).toBe(4);
  });

  test('admite datos negativos', () => {
    expect(varianza([-1, 1])).toBe(2);
    expect(varianza([-1, 1], true)).toBe(1);
  });

  test('devuelve 0 con datos repetidos', () => {
    expect(varianza([3, 3, 3])).toBe(0);
  });

  test('la varianza poblacional de un solo dato es 0', () => {
    expect(varianza([7], true)).toBe(0);
  });

  test('la varianza muestral exige al menos 2 datos', () => {
    expect(() => varianza([7])).toThrow(
      'Se necesitan al menos 2 datos para calcular la varianza muestral'
    );
  });
});

describe('desviacionEstandar', () => {
  test('calcula la desviacion estandar poblacional', () => {
    expect(desviacionEstandar([2, 4, 4, 4, 5, 5, 7, 9], true)).toBe(2);
  });

  test('calcula la desviacion estandar muestral por defecto', () => {
    expect(desviacionEstandar([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7), 12);
  });

  test('admite datos negativos y repetidos', () => {
    expect(desviacionEstandar([-1, 1], true)).toBe(1);
    expect(desviacionEstandar([5, 5, 5])).toBe(0);
  });

  test('la desviacion muestral exige al menos 2 datos', () => {
    expect(() => desviacionEstandar([7])).toThrow(
      'Se necesitan al menos 2 datos para calcular la varianza muestral'
    );
  });
});

describe('mediana', () => {
  test('devuelve el valor central con cantidad impar', () => {
    expect(mediana([5, 2, 1, 3, 4])).toBe(3);
  });

  test('promedia los dos valores centrales con cantidad par', () => {
    expect(mediana([1, 2, 3, 4])).toBe(2.5);
  });

  test('admite datos negativos y repetidos', () => {
    expect(mediana([-3, -1, -2])).toBe(-2);
    expect(mediana([4, 1, 4, 2])).toBe(3);
  });

  test('no modifica el array original', () => {
    const datos = [3, 1, 2];
    mediana(datos);
    expect(datos).toEqual([3, 1, 2]);
  });
});

describe('moda', () => {
  test('devuelve el valor mas frecuente', () => {
    expect(moda([1, 2, 2, 3])).toEqual([2]);
  });

  test('devuelve todos los valores empatados en orden ascendente', () => {
    expect(moda([1, 1, 2, 2, 3])).toEqual([1, 2]);
    expect(moda([3, -2, 3, -2])).toEqual([-2, 3]);
  });

  test('admite datos negativos', () => {
    expect(moda([-1, -1, 5])).toEqual([-1]);
  });

  test('devuelve un array vacio si ningun valor se repite', () => {
    expect(moda([1, 2, 3])).toEqual([]);
  });
});

describe('rangoIntercuartilico', () => {
  test('calcula el IQR con cantidad impar sin incluir la mediana', () => {
    expect(rangoIntercuartilico([1, 2, 3, 4, 5, 6, 7])).toBe(4);
  });

  test('calcula el IQR con cantidad par', () => {
    expect(rangoIntercuartilico([1, 2, 3, 4])).toBe(2);
    expect(rangoIntercuartilico([7, 1, 3, 5])).toBe(4);
  });

  test('admite datos negativos', () => {
    expect(rangoIntercuartilico([-4, -3, -2, -1])).toBe(2);
  });

  test('devuelve 0 con un solo dato o datos repetidos', () => {
    expect(rangoIntercuartilico([5])).toBe(0);
    expect(rangoIntercuartilico([2, 2, 2, 2])).toBe(0);
  });
});

describe('entradas invalidas', () => {
  const funciones = [
    ['media', media],
    ['varianza', varianza],
    ['desviacionEstandar', desviacionEstandar],
    ['mediana', mediana],
    ['moda', moda],
    ['rangoIntercuartilico', rangoIntercuartilico],
  ];

  test.each(funciones)('%s rechaza un array vacio', (_nombre, funcion) => {
    expect(() => funcion([])).toThrow('El array de datos no puede estar vacío');
  });

  test.each(funciones)('%s rechaza datos que no son un array', (_nombre, funcion) => {
    expect(() => funcion('1,2,3')).toThrow('Los datos deben ser un array');
    expect(() => funcion(null)).toThrow('Los datos deben ser un array');
  });

  test.each(funciones)('%s rechaza elementos no numericos o no finitos', (_nombre, funcion) => {
    for (const datos of [[1, NaN], [1, Infinity], [1, -Infinity], [1, '2']]) {
      expect(() => funcion(datos)).toThrow('Todos los elementos deben ser números finitos');
    }
  });
});
