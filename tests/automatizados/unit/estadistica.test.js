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
// ============================================================
// Casos agregados para el issue #1601
// Tolerancias, tamaños de paso, órdenes de convergencia,
// errores relativos y detección de no convergencia / divergencia.
// ============================================================

// --- Utilidades de generación de datos ---------------------------------

// Malla equiespaciada de n puntos en [0, 1] con paso h = 1/(n-1)
const mallaEquiespaciada = (n) => Array.from({ length: n }, (_, i) => i / (n - 1));

// Serie alternante a_k = 1 + (-1)^k / k  ->  converge a 1 con orden O(1/n)
const serieAlternante = (n) => Array.from({ length: n }, (_, i) => 1 + (-1) ** (i + 1) / (i + 1));

// Error relativo entre el valor obtenido y el esperado
const errorRelativo = (obtenido, esperado) => Math.abs(obtenido / esperado - 1);

describe('tolerancias y errores relativos', () => {
  test('la media respeta una tolerancia estricta con decimales periodicos', () => {
    // 0.1 + 0.2 + 0.3 no es exacto en punto flotante: se exige tolerancia, no igualdad
    expect(media([0.1, 0.2, 0.3])).toBeCloseTo(0.2, 15);
  });

  test('la varianza mantiene el error relativo acotado al escalar los datos', () => {
    const base = [1, 2, 3, 4, 5];
    const escalas = [1e-6, 1e-3, 1, 1e3, 1e6];

    for (const k of escalas) {
      const datos = base.map((x) => x * k);
      // Var(kX) = k^2 Var(X), con Var(base) = 2.5
      expect(errorRelativo(varianza(datos), 2.5 * k ** 2)).toBeLessThan(1e-12);
    }
  });

  test('la varianza es invariante a traslaciones grandes', () => {
    const base = [1, 2, 3, 4, 5];

    for (const c of [1e2, 1e4, 1e6]) {
      expect(varianza(base.map((x) => x + c))).toBeCloseTo(2.5, 9);
      expect(varianza(base.map((x) => x + c), true)).toBeCloseTo(2, 9);
    }
  });

  test('la desviacion estandar al cuadrado reproduce la varianza dentro de tolerancia', () => {
    const conjuntos = [
      [2, 4, 4, 4, 5, 5, 7, 9],
      [-3, -1, 0, 1, 3],
      [0.25, 0.5, 0.75, 1],
    ];

    for (const datos of conjuntos) {
      expect(desviacionEstandar(datos) ** 2).toBeCloseTo(varianza(datos), 10);
      expect(desviacionEstandar(datos, true) ** 2).toBeCloseTo(varianza(datos, true), 10);
    }
  });
});

describe('tamanos de paso en mallas equiespaciadas', () => {
  test('la media es exactamente el centro de la malla para distintos pasos', () => {
    for (const n of [3, 5, 9, 17, 33]) {
      expect(media(mallaEquiespaciada(n))).toBeCloseTo(0.5, 12);
    }
  });

  test('la varianza poblacional sigue la formula cerrada (n+1)/(12(n-1))', () => {
    for (const n of [3, 5, 9, 17, 33]) {
      const esperado = (n + 1) / (12 * (n - 1));
      expect(varianza(mallaEquiespaciada(n), true)).toBeCloseTo(esperado, 12);
    }
  });

  test('la varianza muestral sigue la formula n(n+1)/(12(n-1)^2)', () => {
    for (const n of [3, 5, 9, 17, 33]) {
      const esperado = (n * (n + 1)) / (12 * (n - 1) ** 2);
      expect(varianza(mallaEquiespaciada(n))).toBeCloseTo(esperado, 12);
    }
  });

  test('al refinar el paso la varianza poblacional tiende a 1/12', () => {
    const errores = [5, 50, 500, 5000].map((n) =>
      Math.abs(varianza(mallaEquiespaciada(n), true) - 1 / 12)
    );

    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
    expect(errores[errores.length - 1]).toBeLessThan(1e-4);
  });
});

describe('orden de convergencia', () => {
  test('la media de la serie alternante converge a 1 bajo tolerancias crecientes', () => {
    const casos = [
      [10, 1e-1],
      [100, 1e-2],
      [1000, 1e-3],
      [10000, 1e-4],
    ];

    for (const [n, tolerancia] of casos) {
      expect(Math.abs(media(serieAlternante(n)) - 1)).toBeLessThan(tolerancia);
    }
  });

  test('el error decrece con orden aproximado 1 al multiplicar n por 10', () => {
    const error = (n) => Math.abs(media(serieAlternante(n)) - 1);
    const razones = [
      error(100) / error(1000),
      error(1000) / error(10000),
    ];

    for (const razon of razones) {
      expect(razon).toBeGreaterThan(8);
      expect(razon).toBeLessThan(12);
    }
  });

  test('los errores sucesivos forman una sucesion estrictamente decreciente', () => {
    const errores = [10, 100, 1000, 10000].map((n) => Math.abs(media(serieAlternante(n)) - 1));

    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
  });

  test('la dispersion de la serie tiende a 0 al aumentar n', () => {
    const d10 = desviacionEstandar(serieAlternante(10));
    const d1000 = desviacionEstandar(serieAlternante(1000));

    expect(d1000).toBeLessThan(d10);
    expect(d1000).toBeLessThan(5e-2);
  });
});

// Divergencia matematica: la sucesion no converge aunque todos los datos siguen
// siendo representables. estadistica.js no detecta esta situacion: calcula con
// normalidad y es la prueba la que la verifica.
describe('divergencia matematica sin desbordamiento', () => {
  test('la media de 1..n crece sin limite con todos los datos finitos', () => {
    const medias = [10, 100, 1000, 10000].map((n) =>
      media(Array.from({ length: n }, (_, i) => i + 1))
    );

    expect(medias.every(Number.isFinite)).toBe(true);
    for (let i = 1; i < medias.length; i += 1) {
      expect(medias[i]).toBeGreaterThan(medias[i - 1]);
    }
    // media(1..n) = (n+1)/2, no tiende a ningun limite
    expect(medias[medias.length - 1]).toBeCloseTo(5000.5, 9);
  });

  test('la varianza crece sin limite al ampliar el rango de los datos', () => {
    const varianzas = [10, 100, 1000, 10000].map((n) =>
      varianza(Array.from({ length: n }, (_, i) => i + 1))
    );

    expect(varianzas.every(Number.isFinite)).toBe(true);
    for (let i = 1; i < varianzas.length; i += 1) {
      expect(varianzas[i]).toBeGreaterThan(varianzas[i - 1]);
    }
    // varianza muestral de 1..n = n(n+1)/12
    expect(varianzas[0]).toBeCloseTo((10 * 11) / 12, 9);
  });

  test('una muestra oscilante no reduce su dispersion al crecer n', () => {
    for (const n of [10, 100, 1000]) {
      const oscilante = Array.from({ length: n }, (_, i) => (-1) ** i);

      // La media se estabiliza en 0 pero los datos nunca se acercan entre si
      expect(media(oscilante)).toBeCloseTo(0, 12);
      expect(varianza(oscilante)).toBeGreaterThan(0.99);
      expect(desviacionEstandar(oscilante)).toBeGreaterThan(0.99);
    }
  });

  test('incrementos que tienden a cero no estabilizan la suma acumulada', () => {
    // Sumas parciales de la serie armonica: el incremento 1/k tiende a 0 y la
    // suma diverge, de modo que la media de las sumas tambien crece
    const sumasParciales = (n) => {
      let suma = 0;
      return Array.from({ length: n }, (_, k) => {
        suma += 1 / (k + 1);
        return suma;
      });
    };

    const medias = [10, 100, 1000].map((n) => media(sumasParciales(n)));

    for (let i = 1; i < medias.length; i += 1) {
      expect(medias[i]).toBeGreaterThan(medias[i - 1]);
    }
    expect(medias.every(Number.isFinite)).toBe(true);
  });
});

// Desbordamiento y subdesbordamiento: limites de representacion de la doble
// precision, no divergencia del metodo. El modulo no los senala: devuelve
// Infinity o 0 sin lanzar error.
describe('limites de representacion: desbordamiento y subdesbordamiento', () => {
  test('la media se desborda a infinito sin lanzar error', () => {
    const resultado = media([1e308, 1e308]);

    expect(Number.isFinite(resultado)).toBe(false);
    expect(resultado).toBe(Infinity);
  });

  test('el resultado depende del orden de los datos cuando hay desbordamiento', () => {
    // La suma se acumula de izquierda a derecha: el mismo conjunto da Infinity
    // o el valor correcto segun como esten ordenados los datos
    expect(media([1e308, 1e308, -1e308])).toBe(Infinity);

    const ordenEstable = media([1e308, -1e308, 1e308]);
    expect(Number.isFinite(ordenEstable)).toBe(true);
    expect(Math.abs(ordenEstable / (1e308 / 3) - 1)).toBeLessThan(1e-15);
  });

  test('la varianza y la desviacion se desbordan a infinito', () => {
    expect(varianza([1e200, -1e200])).toBe(Infinity);
    expect(desviacionEstandar([1e200, -1e200])).toBe(Infinity);
    expect(varianza([1e200, -1e200], true)).toBe(Infinity);
  });

  test('una muestra diminuta subdesborda y reporta dispersion nula', () => {
    // La varianza exacta ronda 5e-401, que no es representable y se redondea a 0
    expect(varianza([1e-200, 2e-200])).toBe(0);
    expect(desviacionEstandar([1e-200, 2e-200])).toBe(0);
    // Los datos no son iguales entre si: la dispersion nula es un artefacto
    expect(1e-200).not.toBe(2e-200);
  });
});

describe('validacion de entradas no finitas', () => {
  // El modulo no detecta divergencia: rechaza en la validacion de entrada
  // cualquier dato que ya sea Infinity o NaN, venga de donde venga.
  const noFinitos = [
    ['division por cero', [1, 2, 1 / 0]],
    ['division negativa por cero', [1, 2, -1 / 0]],
    ['indeterminacion 0/0', [1, 2, 0 / 0]],
    ['logaritmo de cero', [1, Math.log(0)]],
    ['desbordamiento por exponencial', [1, Math.exp(1000)]],
  ];

  test.each(noFinitos)('rechaza una serie con %s', (_nombre, datos) => {
    expect(() => media(datos)).toThrow('Todos los elementos deben ser números finitos');
    expect(() => varianza(datos)).toThrow('Todos los elementos deben ser números finitos');
    expect(() => desviacionEstandar(datos)).toThrow('Todos los elementos deben ser números finitos');
    expect(() => mediana(datos)).toThrow('Todos los elementos deben ser números finitos');
    expect(() => moda(datos)).toThrow('Todos los elementos deben ser números finitos');
    expect(() => rangoIntercuartilico(datos)).toThrow('Todos los elementos deben ser números finitos');
  });

  test('una sucesion con singularidad llega con valores no finitos y es rechazada', () => {
    const sucesion = Array.from({ length: 5 }, (_, i) => 1 / (2 - i));

    expect(sucesion.some((x) => !Number.isFinite(x))).toBe(true);
    expect(() => media(sucesion)).toThrow('Todos los elementos deben ser números finitos');
  });

  test('una muestra de un solo paso no permite estimar la varianza muestral', () => {
    expect(() => varianza([0.5])).toThrow(
      'Se necesitan al menos 2 datos para calcular la varianza muestral'
    );
    expect(varianza([0.5], true)).toBe(0);
  });

  test('una sucesion estacionaria converge con dispersion nula', () => {
    const estacionaria = Array.from({ length: 50 }, () => 2.5);

    expect(media(estacionaria)).toBeCloseTo(2.5, 12);
    expect(varianza(estacionaria)).toBeCloseTo(0, 12);
    expect(desviacionEstandar(estacionaria)).toBeCloseTo(0, 12);
    expect(rangoIntercuartilico(estacionaria)).toBe(0);
  });
});

describe('estabilidad frente a valores atipicos', () => {
  test('la mediana es estable mientras la media se desplaza', () => {
    const conAtipico = [1, 2, 3, 4, 1000];

    expect(mediana(conAtipico)).toBe(3);
    expect(media(conAtipico)).toBeCloseTo(202, 12);
  });

  test('el rango intercuartilico es invariante a traslaciones', () => {
    const base = [1, 2, 3, 4, 5, 6, 7];

    for (const c of [100, -100, 1e6]) {
      expect(rangoIntercuartilico(base.map((x) => x + c))).toBeCloseTo(4, 9);
    }
  });

  test('el rango intercuartilico escala linealmente con los datos', () => {
    const base = [1, 2, 3, 4, 5, 6, 7];

    for (const k of [2, 10, 0.5]) {
      expect(rangoIntercuartilico(base.map((x) => x * k))).toBeCloseTo(4 * k, 9);
    }
  });
});
