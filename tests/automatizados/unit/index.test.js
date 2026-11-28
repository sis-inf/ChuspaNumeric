/**
 * Pruebas de integración - Verifica que los módulos se importen correctamente
 * y que las utilidades de error (error_relativo.js) sean precisas y se comporten
 * bien como criterio de parada de métodos iterativos (tolerancias, tamaño de paso,
 * orden de convergencia, no convergencia y divergencia).
 *
 * Las sucesiones iterativas se generan con helpers locales (Newton, bisección y
 * secante sobre f(x) = x^2 - 2, raíz exacta √2) para no depender de otros módulos.
 */
import {
  errorAbsoluto,
  errorRelativo,
  errorPorcentual,
  errorRelativoAproximado
} from '../../../src/utils/error_relativo.js';

const RAIZ_2 = Math.SQRT2;

/**
 * Newton sobre f(x) = x^2 - 2. Para cuando el error relativo aproximado < tol.
 * @returns {{ resultado: number, iteraciones: Array, convergio: boolean }}
 */
const newton = (x0, tol, maxIter = 50) => {
  let x = x0;
  const iteraciones = [];
  for (let n = 1; n <= maxIter; n++) {
    const xNuevo = x - (x * x - 2) / (2 * x);
    const error = errorRelativoAproximado(xNuevo, x);
    iteraciones.push({ n, x: xNuevo, error });
    x = xNuevo;
    if (error < tol) return { resultado: x, iteraciones, convergio: true };
  }
  return { resultado: x, iteraciones, convergio: false };
};

/** Bisección sobre [1, 2] para f(x) = x^2 - 2 (punto medio como aproximación). */
const biseccion = (tol, maxIter = 100) => {
  let a = 1;
  let b = 2;
  let anterior = null;
  const iteraciones = [];
  for (let n = 1; n <= maxIter; n++) {
    const m = (a + b) / 2;
    if (m * m - 2 > 0) b = m;
    else a = m;
    const error = anterior === null ? Infinity : errorRelativoAproximado(m, anterior);
    iteraciones.push({ n, x: m, error });
    anterior = m;
    if (error < tol) return { resultado: m, iteraciones, convergio: true };
  }
  return { resultado: anterior, iteraciones, convergio: false };
};

/** Secante con x0 = 1 y x1 = 2 sobre f(x) = x^2 - 2. */
const secante = (tol, maxIter = 50) => {
  let a = 1;
  let b = 2;
  const iteraciones = [];
  for (let n = 1; n <= maxIter; n++) {
    const fa = a * a - 2;
    const fb = b * b - 2;
    const c = b - (fb * (b - a)) / (fb - fa);
    const error = errorRelativoAproximado(c, b);
    iteraciones.push({ n, x: c, error });
    a = b;
    b = c;
    if (error < tol) return { resultado: c, iteraciones, convergio: true };
  }
  return { resultado: b, iteraciones, convergio: false };
};

/** Captura el error lanzado por fn (o null si no lanza). */
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe('Pruebas de integración', () => {
  test('debería importar error_relativo.js correctamente', async () => {
    const module = await import('../../../src/utils/error_relativo.js');
    expect(module).toBeDefined();
    expect(typeof module.errorAbsoluto).toBe('function');
    expect(typeof module.errorRelativo).toBe('function');
    expect(typeof module.errorPorcentual).toBe('function');
    expect(typeof module.errorRelativoAproximado).toBe('function');
  });

  test('errorAbsoluto(3.14159, 3.14) debería ser ~0.00159', async () => {
    const { errorAbsoluto } = await import('../../../src/utils/error_relativo.js');
    const result = errorAbsoluto(3.14159, 3.14);
    expect(result).toBeCloseTo(0.00159, 4);
  });

  test('errorRelativo(1, 0.9) debería ser 0.1', async () => {
    const { errorRelativo } = await import('../../../src/utils/error_relativo.js');
    const result = errorRelativo(1, 0.9);
    expect(result).toBeCloseTo(0.1, 4);
  });

  test('errorPorcentual(100, 95) debería ser 5', async () => {
    const { errorPorcentual } = await import('../../../src/utils/error_relativo.js');
    const result = errorPorcentual(100, 95);
    expect(result).toBe(5);
  });

  test('errorRelativo(0, 5) debería lanzar error', async () => {
    const { errorRelativo } = await import('../../../src/utils/error_relativo.js');
    expect(() => errorRelativo(0, 5)).toThrow('El valor verdadero no puede ser 0');
  });

  test('debería cargar src/index.js completo sin lanzar excepciones y contener todas las categorías esperadas', async () => {
    const module = await import('../../../src/index.js');
    expect(module).toBeDefined();
    expect(module.default).toBeDefined();
    const categoriasEsperadas = [
      'lineales',
      'noLineales',
      'interpolacion',
      'integracion',
      'edo',
      'analisis',
      'diferencias',
      'matricial',
      'polinomios',
      'estadistica'
    ];
    expect(new Set(categoriasEsperadas).size).toBe(categoriasEsperadas.length);
    const claves = Object.keys(module.default);
    expect(claves).toEqual(expect.arrayContaining(categoriasEsperadas));
  });
});

describe('Precisión de las funciones de error', () => {
  test.each([
    ['errorAbsoluto', errorAbsoluto, 10, 8, 2],
    ['errorRelativo', errorRelativo, 10, 8, 0.2],
    ['errorPorcentual', errorPorcentual, 10, 8, 20],
    ['errorRelativoAproximado', errorRelativoAproximado, 10, 8, 0.2]
  ])('%s(%d, %d) debería ser %d', (_nombre, fn, a, b, esperado) => {
    expect(fn(a, b)).toBeCloseTo(esperado, 12);
  });

  test('errorAbsoluto es simétrico, errorRelativo no lo es (depende del valor verdadero)', () => {
    // |10 - 8| = |8 - 10| = 2
    expect(errorAbsoluto(10, 8)).toBe(errorAbsoluto(8, 10));
    // 2/10 = 0.2  vs  2/8 = 0.25
    expect(errorRelativo(10, 8)).toBeCloseTo(0.2, 12);
    expect(errorRelativo(8, 10)).toBeCloseTo(0.25, 12);
  });

  test('error nulo cuando el valor aproximado coincide con el verdadero', () => {
    expect(errorAbsoluto(5, 5)).toBe(0);
    expect(errorRelativo(5, 5)).toBe(0);
    expect(errorPorcentual(5, 5)).toBe(0);
    expect(errorRelativoAproximado(5, 5)).toBe(0);
  });

  test.each([
    [100, 95],
    [3.14159265, 3.14],
    [-4, -3.9],
    [1e-10, 1.1e-10],
    [1e6, 1e6 + 1]
  ])('errorPorcentual(%d, %d) = 100 * errorRelativo', (verdadero, aproximado) => {
    const rel = errorRelativo(verdadero, aproximado);
    expect(errorPorcentual(verdadero, aproximado)).toBeCloseTo(100 * rel, 10);
  });

  test('valores negativos: errorRelativo(-4, -3.9) = 0.1 / 4 = 0.025', () => {
    expect(errorRelativo(-4, -3.9)).toBeCloseTo(0.025, 12);
    expect(errorAbsoluto(-4, -3.9)).toBeCloseTo(0.1, 12);
  });

  test('magnitudes muy pequeñas y muy grandes mantienen el error relativo', () => {
    // |1e-10 - 1.1e-10| / 1e-10 = 0.1
    expect(errorRelativo(1e-10, 1.1e-10)).toBeCloseTo(0.1, 8);
    // 1 / 1e6 = 1e-6
    expect(errorRelativo(1e6, 1e6 + 1)).toBeCloseTo(1e-6, 12);
  });

  test('errorRelativoAproximado usa el valor nuevo como denominador', () => {
    // |2 - 1| / 2 = 0.5  (y no 1/1 = 1)
    expect(errorRelativoAproximado(2, 1)).toBeCloseTo(0.5, 12);
    // el valor anterior puede ser 0: |1 - 0| / 1 = 1
    expect(errorRelativoAproximado(1, 0)).toBe(1);
  });
});

describe('Tolerancias y tamaños de paso: Newton sobre x^2 - 2 (x0 = 1)', () => {
  // Iteraciones verificadas replicando el algoritmo en un script de Node.
  // x1 = 1.5, x2 = 1.41666..., x3 = 1.4142156..., x4 = 1.41421356237469, ...
  test.each([
    [1e-2, 3],
    [1e-4, 4],
    [1e-6, 5]
  ])('tolerancia %d se alcanza en %d iteraciones', (tol, iteracionesEsperadas) => {
    const r = newton(1, tol);
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toHaveLength(iteracionesEsperadas);
  });

  test.each([1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12])(
    'tolerancia %d: último paso < tol y error relativo real <= 10 * tol',
    (tol) => {
      const r = newton(1, tol);
      const ultimo = r.iteraciones[r.iteraciones.length - 1];
      expect(r.convergio).toBe(true);
      expect(ultimo.error).toBeLessThan(tol);
      expect(errorRelativo(RAIZ_2, r.resultado)).toBeLessThanOrEqual(10 * tol);
    }
  );

  test('endurecer la tolerancia no reduce las iteraciones necesarias', () => {
    const tolerancias = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12];
    const cantidades = tolerancias.map((tol) => newton(1, tol).iteraciones.length);
    for (let i = 1; i < cantidades.length; i++) {
      expect(cantidades[i]).toBeGreaterThanOrEqual(cantidades[i - 1]);
    }
    expect(cantidades[cantidades.length - 1]).toBeGreaterThan(cantidades[0]);
  });

  test('iteraciones: n secuencial desde 1, x finito y error numérico', () => {
    const r = newton(1, 1e-10);
    r.iteraciones.forEach((it, i) => {
      expect(it.n).toBe(i + 1);
      expect(Number.isFinite(it.x)).toBe(true);
      expect(typeof it.error).toBe('number');
    });
  });

  test('valor inicial exacto (x0 = √2) converge en 1 iteración', () => {
    // x1 = x0 - (x0^2 - 2) / (2 x0) ~ x0, paso relativo ~ 1.6e-16 < 1e-10
    const r = newton(RAIZ_2, 1e-10);
    expect(r.iteraciones).toHaveLength(1);
    expect(r.iteraciones[0].error).toBeLessThan(1e-10);
  });

  test('cuanto más lejos el valor inicial, más iteraciones (x0 = √2 < 1 < 100)', () => {
    const cerca = newton(RAIZ_2, 1e-10).iteraciones.length; // 1
    const medio = newton(1, 1e-10).iteraciones.length; // 5
    const lejos = newton(100, 1e-10).iteraciones.length; // 11
    expect(cerca).toBeLessThan(medio);
    expect(medio).toBeLessThan(lejos);
    expect(newton(100, 1e-10).convergio).toBe(true);
  });
});

describe('Tolerancias y tamaños de paso: bisección sobre [1, 2]', () => {
  test.each([
    [1e-2, 7],
    [1e-4, 13],
    [1e-6, 20],
    [1e-8, 27],
    [1e-10, 33],
    [1e-12, 40]
  ])('tolerancia %d se alcanza en %d iteraciones', (tol, iteracionesEsperadas) => {
    const r = biseccion(tol);
    const ultimo = r.iteraciones[r.iteraciones.length - 1];
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toHaveLength(iteracionesEsperadas);
    expect(ultimo.error).toBeLessThan(tol);
    expect(errorRelativo(RAIZ_2, r.resultado)).toBeLessThanOrEqual(10 * tol);
  });

  test('el tamaño de paso absoluto se reduce exactamente a la mitad: |m_n - m_(n-1)| = 2^-n', () => {
    // m1 = 1.5, m2 = 1.25 (paso 0.25), m3 = 1.375 (paso 0.125), ...
    const { iteraciones } = biseccion(1e-12);
    for (let n = 2; n <= iteraciones.length; n++) {
      const paso = errorAbsoluto(iteraciones[n - 1].x, iteraciones[n - 2].x);
      expect(paso).toBeCloseTo(Math.pow(2, -n), 12);
    }
  });

  test('error absoluto real acotado por 2^-n en cada iteración', () => {
    const { iteraciones } = biseccion(1e-12);
    iteraciones.forEach((it) => {
      expect(errorAbsoluto(RAIZ_2, it.x)).toBeLessThanOrEqual(Math.pow(2, -it.n));
    });
  });
});

describe('Orden de convergencia', () => {
  test('Newton es cuadrática: el orden estimado p = ln(e_(n+1)/e_n) / ln(e_n/e_(n-1)) ~ 2', () => {
    const errores = newton(1, 1e-12).iteraciones.map((it) => errorAbsoluto(RAIZ_2, it.x));
    // e1 = 8.6e-2, e2 = 2.5e-3, e3 = 2.1e-6, e4 = 1.6e-12 (calculados con script)
    const p = [1, 2].map(
      (i) => Math.log(errores[i + 1] / errores[i]) / Math.log(errores[i] / errores[i - 1])
    );
    p.forEach((orden) => {
      expect(orden).toBeGreaterThan(1.9);
      expect(orden).toBeLessThan(2.1);
    });
  });

  test('Newton: cada error es menor que el anterior hasta alcanzar la precisión de máquina', () => {
    const errores = newton(1, 1e-12).iteraciones.map((it) => errorAbsoluto(RAIZ_2, it.x));
    for (let i = 1; i <= 3; i++) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
    expect(errores[3]).toBeLessThan(1e-11);
  });

  test('bisección es lineal: razón constante 0.5 entre pasos absolutos consecutivos', () => {
    const { iteraciones } = biseccion(1e-12);
    for (let n = 3; n <= iteraciones.length; n++) {
      const paso = errorAbsoluto(iteraciones[n - 1].x, iteraciones[n - 2].x);
      const anterior = errorAbsoluto(iteraciones[n - 2].x, iteraciones[n - 3].x);
      expect(paso / anterior).toBeCloseTo(0.5, 8);
    }
  });

  test('a igual tolerancia 1e-12: Newton <= secante < bisección en iteraciones', () => {
    const iterNewton = newton(1, 1e-12).iteraciones.length; // 6
    const iterSecante = secante(1e-12).iteraciones.length; // 7
    const iterBiseccion = biseccion(1e-12).iteraciones.length; // 40
    expect(iterNewton).toBeLessThanOrEqual(iterSecante);
    expect(iterSecante).toBeLessThan(iterBiseccion);
  });

  test('la secante converge con error relativo real <= 10 * tol', () => {
    const r = secante(1e-10);
    expect(r.convergio).toBe(true);
    expect(errorRelativo(RAIZ_2, r.resultado)).toBeLessThanOrEqual(1e-9);
  });
});

describe('No convergencia y divergencia', () => {
  test('agotar maxIter exacto: Newton con maxIter = 3 y tol = 1e-12 no converge', () => {
    const r = newton(1, 1e-12, 3);
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toHaveLength(3);
    // el paso final (1.7e-3) sigue muy por encima de la tolerancia
    expect(r.iteraciones[2].error).toBeGreaterThan(1e-12);
  });

  test('bisección con maxIter = 10 y tol = 1e-12 no converge', () => {
    const r = biseccion(1e-12, 10);
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toHaveLength(10);
    expect(r.iteraciones[9].error).toBeGreaterThan(1e-12);
  });

  test('tolerancia inalcanzable (0): nunca se cumple error < 0 y se agota maxIter', () => {
    const r = newton(1, 0, 20);
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toHaveLength(20);
  });

  test('sucesión divergente x_(n+1) = 2 x_n + 1: los pasos absolutos crecen', () => {
    // x: 1 -> 3 -> 7 -> 15 -> 31 -> 63 -> 127; paso n = 2^n
    let x = 1;
    const pasos = [];
    const relativos = [];
    for (let n = 1; n <= 6; n++) {
      const xNuevo = 2 * x + 1;
      pasos.push(errorAbsoluto(xNuevo, x));
      relativos.push(errorRelativoAproximado(xNuevo, x));
      x = xNuevo;
    }
    for (let i = 1; i < pasos.length; i++) {
      expect(pasos[i]).toBeGreaterThan(pasos[i - 1]);
    }
    expect(pasos[5]).toBe(64);
    // el error relativo aproximado nunca baja de 0.5: jamás cumpliría una tolerancia pequeña
    relativos.forEach((r) => expect(r).toBeGreaterThan(0.5));
  });

  test('sucesión oscilante x_(n+1) = -x_n: el error relativo aproximado es siempre 2', () => {
    let x = 1;
    for (let n = 1; n <= 4; n++) {
      const xNuevo = -x;
      expect(errorRelativoAproximado(xNuevo, x)).toBe(2);
      x = xNuevo;
    }
  });

  test('un cero en la sucesión (x_nuevo = 0) se señala como error, no como infinito', () => {
    expect(() => errorRelativoAproximado(0, 1)).toThrow(
      'El valor nuevo no puede ser 0 para calcular error relativo aproximado'
    );
  });
});

describe('Validación de entradas', () => {
  const funciones = [
    ['errorAbsoluto', errorAbsoluto],
    ['errorRelativo', errorRelativo],
    ['errorPorcentual', errorPorcentual],
    ['errorRelativoAproximado', errorRelativoAproximado]
  ];

  describe.each(funciones)('%s', (_nombre, fn) => {
    test.each([
      ['string como primer argumento', ['1', 1]],
      ['string como segundo argumento', [1, '1']],
      ['null', [null, 1]],
      ['undefined', [undefined, 1]],
      ['array', [[1], 1]],
      ['objeto', [{}, 1]],
      ['booleano', [true, 1]],
      ['sin argumentos', []]
    ])('%s lanza TypeError', (_desc, args) => {
      const error = capturar(() => fn(...args));
      expect(error).toBeInstanceOf(TypeError);
      expect(error.message).toBe('Ambos argumentos deben ser números');
    });

    test.each([
      ['NaN como primer argumento', [NaN, 1]],
      ['NaN como segundo argumento', [1, NaN]],
      ['NaN en ambos', [NaN, NaN]]
    ])('%s lanza Error (no TypeError)', (_desc, args) => {
      const error = capturar(() => fn(...args));
      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toBe('Los valores no pueden ser NaN');
    });
  });

  test.each([
    ['errorRelativo', errorRelativo, 'El valor verdadero no puede ser 0 para calcular error relativo'],
    [
      'errorPorcentual',
      errorPorcentual,
      'El valor verdadero no puede ser 0 para calcular error porcentual'
    ]
  ])('%s con valor verdadero 0 lanza Error con mensaje específico', (_nombre, fn, mensaje) => {
    const error = capturar(() => fn(0, 5));
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(mensaje);
  });

  test('errorAbsoluto admite cero en cualquiera de los argumentos', () => {
    expect(errorAbsoluto(0, 5)).toBe(5);
    expect(errorAbsoluto(5, 0)).toBe(5);
    expect(errorAbsoluto(0, 0)).toBe(0);
  });

  test('errorRelativo con valor aproximado 0 es 1 (error del 100 %)', () => {
    expect(errorRelativo(5, 0)).toBe(1);
    expect(errorPorcentual(5, 0)).toBe(100);
  });
});
