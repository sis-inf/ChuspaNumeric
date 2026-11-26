import { jest } from '@jest/globals';
import { euler } from '../../../src/edo/euler.js';
import { ErrorParametros } from '../../../src/core/errores.js';

// Helper: captura el error lanzado (o null si no lanza nada).
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe('euler - método explícito', () => {

  test('resuelve una EDO con solución analítica conocida', () => {
    // EDO: y' = y, con condición inicial y(0) = 1.
    const res = euler({
      f: (x, y) => y,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    });

    // La solución exacta es y(1) = e.
    expect(res.convergio).toBe(true);
    expect(res.resultado[10][0]).toBeCloseTo(1, 10);
    expect(res.resultado[10][1]).toBeCloseTo(2.5937, 4);
    expect(res.resultado[10][1]).not.toBeCloseTo(Math.E, 3);
  });

  test('un paso menor produce una aproximación más precisa', () => {
    const f = (x, y) => y;

    const resPasoGrande = euler({
      f,
      x0: 0,
      y0: 1,
      h: 0.2,
      xFinal: 1
    });

    const resPasoPequeno = euler({
      f,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    });

    const errorPasoGrande = Math.abs(
      resPasoGrande.resultado[5][1] - Math.E
    );

    const errorPasoPequeno = Math.abs(
      resPasoPequeno.resultado[10][1] - Math.E
    );

    expect(errorPasoPequeno).toBeLessThan(errorPasoGrande);
  });

  test('registra correctamente los valores de las iteraciones', () => {
    // EDO: y' = x + y, con x0 = 0, y0 = 1 y h = 0.5.
    const res = euler({
      f: (x, y) => x + y,
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.iteraciones).toHaveLength(3);

    expect(res.iteraciones[0]).toEqual({
      n: 0,
      x: 0,
      y: 1,
      fxy: 1
    });

    expect(res.iteraciones[1]).toEqual({
      n: 1,
      x: 0.5,
      y: 1.5,
      fxy: 2
    });

    expect(res.iteraciones[2]).toEqual({
      n: 2,
      x: 1,
      y: 2.5,
      fxy: 3.5
    });
  });

  test('rechaza una función inválida', () => {
    expect(() => euler({
      f: 5,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza valores iniciales no numéricos o no finitos', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: '0',
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: NaN,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: Infinity,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza un paso igual o menor que cero', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: 0,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 0,
      y0: 1,
      h: -0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('rechaza xFinal menor o igual que x0', () => {
    const f = (x, y) => y;

    expect(() => euler({
      f,
      x0: 1,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);

    expect(() => euler({
      f,
      x0: 2,
      y0: 1,
      h: 0.1,
      xFinal: 1
    })).toThrow(ErrorParametros);
  });

  test('devuelve los metadatos del método y sus parámetros', () => {
    const res = euler({
      f: (x, y) => y,
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.meta.metodo).toBe('Euler');
    expect(res.meta.parametros).toEqual({
      x0: 0,
      y0: 1,
      h: 0.5,
      xFinal: 1
    });

    expect(res.convergio).toBe(true);
    expect(res.resultado).toHaveLength(3);
  });

});

// ---------------------------------------------------------------------------
// Ampliación: precisión, orden de convergencia, estabilidad y validación
// ---------------------------------------------------------------------------

describe('euler - precisión según el tamaño de paso (y\' = y)', () => {
  const f = (x, y) => y;
  const errorRelativoEnX1 = (h) => {
    const res = euler({ f, x0: 0, y0: 1, h, xFinal: 1 });
    const ultimo = res.resultado[res.resultado.length - 1];
    return Math.abs(ultimo[1] - Math.E) / Math.E;
  };

  // Valores de error relativo verificados con un script (≈ h/2).
  // h = 0.1 -> 4.58e-2, h = 0.01 -> 4.95e-3, h = 0.001 -> 4.995e-4,
  // h = 0.0001 -> 5.0e-5.
  test.each([
    [1e-1, 0.1],
    [5e-2, 0.1],
    [1e-2, 0.01],
    [1e-3, 0.001],
    [1e-4, 0.0001]
  ])('error relativo <= %p con h = %p', (tolerancia, h) => {
    expect(errorRelativoEnX1(h)).toBeLessThanOrEqual(tolerancia);
  });

  test.each([0.1, 0.05, 0.01, 0.001])(
    'el error relativo es del orden de h/2 con h = %p',
    (h) => {
      // Error global de Euler para y' = y en x = 1: ≈ (h/2) * e -> relativo ≈ h/2.
      const rel = errorRelativoEnX1(h);
      expect(rel).toBeGreaterThan(0.4 * h);
      expect(rel).toBeLessThan(0.5 * h);
    }
  );

  test('el error decrece de forma monótona al reducir h', () => {
    const pasos = [0.5, 0.2, 0.1, 0.05, 0.025, 0.0125, 0.01, 0.001];
    const errores = pasos.map(errorRelativoEnX1);

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
  });

  test('con h muy pequeño converge a la solución exacta e', () => {
    const res = euler({ f, x0: 0, y0: 1, h: 0.0001, xFinal: 1 });
    expect(res.resultado).toHaveLength(10001);
    expect(res.resultado[10000][1]).toBeCloseTo(Math.E, 3);
  });

  test('la aproximación de Euler para y\' = y siempre subestima a e', () => {
    for (const h of [0.5, 0.1, 0.01]) {
      const res = euler({ f, x0: 0, y0: 1, h, xFinal: 1 });
      expect(res.resultado[res.resultado.length - 1][1]).toBeLessThan(Math.E);
    }
  });
});

describe('euler - orden de convergencia', () => {
  const f = (x, y) => y;
  const error = (h) => {
    const res = euler({ f, x0: 0, y0: 1, h, xFinal: 1 });
    return Math.abs(res.resultado[res.resultado.length - 1][1] - Math.E);
  };

  test('al dividir h entre 2 el error se reduce aproximadamente a la mitad (orden 1)', () => {
    // Razones verificadas: 1.916, 1.956, 1.978, 1.989 -> tienden a 2.
    const hs = [0.1, 0.05, 0.025, 0.0125, 0.00625];
    const errores = hs.map(error);

    for (let i = 1; i < errores.length; i++) {
      const razon = errores[i - 1] / errores[i];
      expect(razon).toBeGreaterThan(1.9);
      expect(razon).toBeLessThan(2.1);
    }
  });

  test('las razones de error se acercan a 2 al refinar el paso', () => {
    const r1 = error(0.1) / error(0.05);
    const r2 = error(0.0125) / error(0.00625);
    expect(Math.abs(r2 - 2)).toBeLessThan(Math.abs(r1 - 2));
  });

  test('reducir h por 16 reduce el error aproximadamente 16 veces', () => {
    // 0.1 / 0.00625 = 16. Razón verificada: ≈ 14.74.
    const razon = error(0.1) / error(0.00625);
    expect(razon).toBeGreaterThan(14);
    expect(razon).toBeLessThan(16.5);
  });

  test('para y\' = x el error global es exactamente h * (xFinal - x0) / 2', () => {
    // Cálculo manual: y_n = h * sum(x_i) = h^2 * n(n-1)/2.
    // Con h = 0.1, n = 10: y = 0.45 (exacto 0.5). Con h = 0.05: 0.475.
    const f2 = (x) => x;
    for (const h of [0.1, 0.05]) {
      const res = euler({ f: f2, x0: 0, y0: 0, h, xFinal: 1 });
      const y = res.resultado[res.resultado.length - 1][1];
      expect(0.5 - y).toBeCloseTo(h / 2, 10);
    }
  });

  test('el error global crece a lo largo de la integración (y\' = y)', () => {
    const res = euler({ f: (x, y) => y, x0: 0, y0: 1, h: 0.1, xFinal: 1 });
    const errores = res.resultado.map(([x, y]) => Math.abs(y - Math.exp(x)));

    expect(errores[0]).toBeCloseTo(0, 12);
    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeGreaterThan(errores[i - 1]);
    }
  });

  test('para y\' = -y el error también decrece con h (error <= 0.25 * h)', () => {
    // Errores verificados: h=0.1 -> 0.0192, h=0.05 -> 0.0094, h=0.01 -> 0.00185.
    for (const h of [0.1, 0.05, 0.01]) {
      const res = euler({ f: (x, y) => -y, x0: 0, y0: 1, h, xFinal: 1 });
      const y = res.resultado[res.resultado.length - 1][1];
      expect(Math.abs(y - Math.exp(-1))).toBeLessThanOrEqual(0.25 * h);
    }
  });
});

describe('euler - estabilidad y divergencia numérica', () => {
  // y' = -50 y, y(0) = 1. Solución exacta e^(-50x) -> 0.
  // Euler: y_{n+1} = (1 - 50h) y_n. Es estable solo si |1 - 50h| < 1 (h < 0.04).
  const f = (x, y) => -50 * y;
  const correr = (h) => euler({ f, x0: 0, y0: 1, h, xFinal: 1 });

  test('con h = 0.1 el factor es -4: oscila y diverge', () => {
    // Cálculo manual: y = 1, -4, 16, -64, ...
    const res = correr(0.1);
    const ys = res.resultado.map((p) => p[1]);

    expect(ys[0]).toBeCloseTo(1, 10);
    expect(ys[1]).toBeCloseTo(-4, 10);
    expect(ys[2]).toBeCloseTo(16, 10);
    expect(ys[3]).toBeCloseTo(-64, 10);

    for (let i = 1; i < ys.length; i++) {
      expect(Math.abs(ys[i])).toBeGreaterThan(Math.abs(ys[i - 1]));
      expect(Math.sign(ys[i])).toBe(-Math.sign(ys[i - 1]));
    }

    // |y(1)| = 4^10 = 1048576, mientras la solución exacta es ~1.9e-22.
    expect(Math.abs(ys[ys.length - 1])).toBeCloseTo(1048576, 3);
    expect(Math.abs(ys[ys.length - 1] - Math.exp(-50))).toBeGreaterThan(1e5);
  });

  test('con h = 0.05 el factor es -1.5: sigue divergiendo con oscilación', () => {
    const res = correr(0.05);
    const ys = res.resultado.map((p) => p[1]);

    expect(ys[1]).toBeCloseTo(-1.5, 10);
    expect(ys[2]).toBeCloseTo(2.25, 10);
    expect(Math.abs(ys[ys.length - 1])).toBeGreaterThan(3000);
  });

  test('con h = 0.01 el factor es 0.5: la solución decae sin oscilar', () => {
    const res = correr(0.01);
    const ys = res.resultado.map((p) => p[1]);

    expect(ys[1]).toBeCloseTo(0.5, 10);
    for (let i = 1; i < ys.length; i++) {
      expect(ys[i]).toBeGreaterThan(0);
      expect(ys[i]).toBeLessThan(ys[i - 1]);
    }
    expect(ys[ys.length - 1]).toBeLessThan(1e-20);
  });

  test('reducir h por debajo del umbral 0.04 estabiliza el método', () => {
    const magnitudFinal = (h) => {
      const ys = correr(h).resultado;
      return Math.abs(ys[ys.length - 1][1]);
    };

    expect(magnitudFinal(0.1)).toBeGreaterThan(1);
    expect(magnitudFinal(0.05)).toBeGreaterThan(1);
    expect(magnitudFinal(0.01)).toBeLessThan(1);
    expect(magnitudFinal(0.001)).toBeLessThan(1);
  });

  test('y\' = y^2 con y(0) = 1: crece sin cota cerca de la singularidad x = 1', () => {
    // La solución exacta 1/(1 - x) explota en x = 1. Euler (h = 0.1) crece
    // de forma monótona y supera cualquier valor razonable (≈ 5.6e103 en x = 2).
    const res = euler({
      f: (x, y) => y * y,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 2
    });
    const ys = res.resultado.map((p) => p[1]);

    // Cálculo manual: y1 = 1 + 0.1 * 1 = 1.1; y2 = 1.1 + 0.1 * 1.21 = 1.221.
    expect(ys[1]).toBeCloseTo(1.1, 10);
    expect(ys[2]).toBeCloseTo(1.221, 10);

    for (let i = 1; i < ys.length; i++) {
      expect(Number.isFinite(ys[i])).toBe(true);
      expect(ys[i]).toBeGreaterThan(ys[i - 1]);
    }
    expect(ys[ys.length - 1]).toBeGreaterThan(1e50);
  });
});

describe('euler - criterio de parada y número de puntos', () => {
  const f = (x, y) => y;

  test.each([
    [0.5, 3],
    [0.25, 5],
    [0.1, 11],
    [0.05, 21],
    [0.01, 101],
    [0.001, 1001]
  ])('con h = %p genera %p puntos entre 0 y 1', (h, puntos) => {
    const res = euler({ f, x0: 0, y0: 1, h, xFinal: 1 });
    expect(res.resultado).toHaveLength(puntos);
    expect(res.iteraciones).toHaveLength(puntos);
  });

  test('el último x alcanza xFinal pese al error de redondeo (h = 0.1)', () => {
    const res = euler({ f, x0: 0, y0: 1, h: 0.1, xFinal: 1 });
    const xs = res.resultado.map((p) => p[0]);

    expect(xs[xs.length - 1]).toBeCloseTo(1, 10);
    for (let i = 1; i < xs.length; i++) {
      expect(xs[i] - xs[i - 1]).toBeCloseTo(0.1, 10);
    }
  });

  test('si h no divide el intervalo, se detiene en el último x <= xFinal', () => {
    // h = 0.3: x = 0, 0.3, 0.6, 0.9 (el siguiente, 1.2, supera xFinal = 1).
    // y = 1.3^3 = 2.197.
    const res = euler({ f, x0: 0, y0: 1, h: 0.3, xFinal: 1 });

    expect(res.resultado).toHaveLength(4);
    expect(res.resultado[3][0]).toBeCloseTo(0.9, 10);
    expect(res.resultado[3][1]).toBeCloseTo(2.197, 10);
  });

  test('si h es mayor que el intervalo solo se registra el punto inicial', () => {
    const res = euler({ f, x0: 0, y0: 1, h: 2, xFinal: 1 });

    expect(res.resultado).toEqual([[0, 1]]);
    expect(res.iteraciones).toHaveLength(1);
    expect(res.iteraciones[0]).toEqual({ n: 0, x: 0, y: 1, fxy: 1 });
  });

  test('si h es igual al intervalo se registran exactamente dos puntos', () => {
    // y1 = 1 + 1 * 1 = 2.
    const res = euler({ f, x0: 0, y0: 1, h: 1, xFinal: 1 });

    expect(res.resultado).toHaveLength(2);
    expect(res.resultado[1][0]).toBeCloseTo(1, 10);
    expect(res.resultado[1][1]).toBeCloseTo(2, 10);
  });

  test('las iteraciones son coherentes con el resultado', () => {
    const res = euler({ f, x0: 0, y0: 1, h: 0.1, xFinal: 1 });

    res.iteraciones.forEach((it, i) => {
      expect(it.n).toBe(i);
      expect(it.x).toBe(res.resultado[i][0]);
      expect(it.y).toBe(res.resultado[i][1]);
      expect(it.fxy).toBeCloseTo(it.y, 12);
      expect(typeof it.fxy).toBe('number');
    });
  });

  test('cada paso cumple y_{n+1} = y_n + h * f(x_n, y_n)', () => {
    const h = 0.1;
    const res = euler({ f: (x, y) => x + y, x0: 0, y0: 1, h, xFinal: 1 });

    for (let i = 0; i < res.iteraciones.length - 1; i++) {
      const { x, y, fxy } = res.iteraciones[i];
      expect(fxy).toBeCloseTo(x + y, 12);
      expect(res.iteraciones[i + 1].y).toBeCloseTo(y + h * fxy, 12);
    }
  });

  test('evalúa f una vez por punto, empezando en (x0, y0)', () => {
    const fMock = jest.fn((x, y) => y);
    const res = euler({ f: fMock, x0: 0, y0: 1, h: 0.5, xFinal: 1 });

    expect(fMock).toHaveBeenCalledTimes(res.resultado.length);
    expect(fMock.mock.calls[0]).toEqual([0, 1]);
  });
});

describe('euler - casos con solución conocida', () => {
  test('y\' = 2 (derivada constante) es exacta: y(1) = 3', () => {
    // Cálculo manual: y_n = 1 + 2 * 0.25 * n -> y_4 = 3.
    const res = euler({ f: () => 2, x0: 0, y0: 1, h: 0.25, xFinal: 1 });

    expect(res.resultado).toHaveLength(5);
    expect(res.resultado[4][0]).toBeCloseTo(1, 12);
    expect(res.resultado[4][1]).toBeCloseTo(3, 12);
  });

  test('y\' = y con y(0) = 0 permanece en cero (solución trivial)', () => {
    const res = euler({ f: (x, y) => y, x0: 0, y0: 0, h: 0.1, xFinal: 1 });
    res.resultado.forEach(([, y]) => expect(y).toBe(0));
  });

  test('y\' = y es lineal en y0: y0 = -1 da el opuesto de y0 = 1', () => {
    const f = (x, y) => y;
    const pos = euler({ f, x0: 0, y0: 1, h: 0.1, xFinal: 1 });
    const neg = euler({ f, x0: 0, y0: -1, h: 0.1, xFinal: 1 });

    expect(neg.resultado[10][1]).toBeCloseTo(-pos.resultado[10][1], 10);
  });

  test('admite x0 negativo (y\' = y, h = 0.5 desde x0 = -1)', () => {
    // Factor por paso 1.5: 1, 1.5, 2.25, 3.375, 5.0625.
    const res = euler({ f: (x, y) => y, x0: -1, y0: 1, h: 0.5, xFinal: 1 });
    const ys = res.resultado.map((p) => p[1]);

    expect(res.resultado[0][0]).toBe(-1);
    expect(ys).toHaveLength(5);
    [1, 1.5, 2.25, 3.375, 5.0625].forEach((esperado, i) => {
      expect(ys[i]).toBeCloseTo(esperado, 10);
    });
  });

  test('es invariante a la traslación de x0 (y\' = y desde x0 = 1)', () => {
    // Factor por paso 1.1^10 = 2.5937424601 sin importar x0.
    const res = euler({
      f: (x, y) => y,
      x0: 1,
      y0: Math.E,
      h: 0.1,
      xFinal: 2
    });
    const ultimo = res.resultado[res.resultado.length - 1];

    expect(ultimo[0]).toBeCloseTo(2, 10);
    expect(ultimo[1] / Math.E).toBeCloseTo(2.5937424601, 8);
  });

  test('y\' = cos(x), y(0) = 0 aproxima sen(x) con error < 0.01 (h = 0.01)', () => {
    // Error verificado en x = 1.57: ≈ 0.005.
    const res = euler({
      f: (x) => Math.cos(x),
      x0: 0,
      y0: 0,
      h: 0.01,
      xFinal: Math.PI / 2
    });
    const [x, y] = res.resultado[res.resultado.length - 1];

    expect(res.resultado).toHaveLength(158);
    expect(Math.abs(y - Math.sin(x))).toBeLessThan(0.01);
  });
});

describe('euler - contrato del resultado', () => {
  test('devuelve la estructura esperada', () => {
    const res = euler({ f: (x, y) => y, x0: 0, y0: 1, h: 0.1, xFinal: 1 });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(Array.isArray(res.iteraciones)).toBe(true);
    expect(typeof res.convergio).toBe('boolean');
    expect(res.meta.metodo).toBe('Euler');
    expect(typeof res.meta.tiempo_ms).toBe('number');
    res.resultado.forEach((par) => {
      expect(par).toHaveLength(2);
      expect(Number.isFinite(par[0])).toBe(true);
      expect(Number.isFinite(par[1])).toBe(true);
    });
  });

  test('meta.parametros refleja exactamente los argumentos recibidos', () => {
    const res = euler({ f: (x, y) => y, x0: 0.5, y0: 2, h: 0.25, xFinal: 2 });

    expect(res.meta.parametros).toEqual({
      x0: 0.5,
      y0: 2,
      h: 0.25,
      xFinal: 2
    });
  });

  test('no modifica el objeto de opciones recibido', () => {
    const opciones = Object.freeze({
      f: (x, y) => y,
      x0: 0,
      y0: 1,
      h: 0.1,
      xFinal: 1
    });

    expect(() => euler(opciones)).not.toThrow();
    expect(opciones.h).toBe(0.1);
  });

  test('llamadas repetidas con los mismos datos dan el mismo resultado', () => {
    const args = { f: (x, y) => y, x0: 0, y0: 1, h: 0.1, xFinal: 1 };
    const a = euler(args);
    const b = euler(args);

    expect(b.resultado).toEqual(a.resultado);
    expect(b.iteraciones).toEqual(a.iteraciones);
  });
});

describe('euler - validación de parámetros (ampliada)', () => {
  const base = { f: (x, y) => y, x0: 0, y0: 1, h: 0.1, xFinal: 1 };

  test.each([
    ['f es null', { f: null }],
    ['f es una cadena', { f: 'x + y' }],
    ['f es un objeto', { f: {} }],
    ['x0 es una cadena', { x0: '0' }],
    ['x0 es NaN', { x0: NaN }],
    ['x0 es Infinity', { x0: Infinity }],
    ['y0 es una cadena', { y0: '1' }],
    ['y0 es NaN', { y0: NaN }],
    ['y0 es Infinity', { y0: Infinity }],
    ['y0 es -Infinity', { y0: -Infinity }],
    ['h es una cadena', { h: '0.1' }],
    ['h es NaN', { h: NaN }],
    ['h es Infinity', { h: Infinity }],
    ['xFinal es una cadena', { xFinal: '1' }],
    ['xFinal es NaN', { xFinal: NaN }],
    ['xFinal es Infinity', { xFinal: Infinity }]
  ])('rechaza con ErrorParametros cuando %s', (descripcion, cambio) => {
    const error = capturar(() => euler({ ...base, ...cambio }));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(/ChuspaNumeric/);
  });

  test.each([0, -0.1, -5])('h = %p lanza ErrorParametros con el mensaje del paso', (h) => {
    const error = capturar(() => euler({ ...base, h }));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: el paso 'h' debe ser mayor que cero/
    );
  });

  test.each([
    [1, 1],
    [2, 1],
    [0, -1]
  ])('x0 = %p y xFinal = %p lanza ErrorParametros con el mensaje del intervalo', (x0, xFinal) => {
    const error = capturar(() => euler({ ...base, x0, xFinal }));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: 'xFinal' debe ser mayor que 'x0'/
    );
  });

  test('una entrada inválida no llega a evaluar f', () => {
    const fMock = jest.fn((x, y) => y);

    expect(() => euler({ ...base, f: fMock, h: -1 })).toThrow(ErrorParametros);
    expect(fMock).not.toHaveBeenCalled();
  });
});

describe('euler - validación de las opciones', () => {
  test.each([
    ['null', null],
    ['un número', 5],
    ['una cadena', 'opciones'],
    ['un arreglo', []]
  ])('rechaza opciones que son %s', (descripcion, opciones) => {
    const error = capturar(() => euler(opciones));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: las opciones deben ser un objeto válido/
    );
  });

  test('un objeto vacío o sin argumentos lanza ErrorParametros (no TypeError)', () => {
    for (const llamada of [() => euler({}), () => euler()]) {
      const error = capturar(llamada);

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
    }
  });
});

describe('euler - divergencia y valores no finitos detectados', () => {
  const base = { x0: 0, y0: 1, h: 0.5, xFinal: 1 };

  test('y\' = y^2 con xFinal = 3 desborda y lanza ErrorParametros en la iteración 21', () => {
    // Verificado: hasta la iteración 20 los valores son finitos (y ≈ 5.6e103);
    // en la 21 y ≈ 3e206 y f(x, y) = y^2 = Infinity.
    const error = capturar(() =>
      euler({ f: (x, y) => y * y, x0: 0, y0: 1, h: 0.1, xFinal: 3 })
    );

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: f\(x, y\) debe devolver un número finito en la iteración 21/
    );
  });

  test('con xFinal = 2 el mismo problema termina antes del desborde', () => {
    const res = euler({ f: (x, y) => y * y, x0: 0, y0: 1, h: 0.1, xFinal: 2 });

    expect(res.resultado).toHaveLength(21);
    expect(res.convergio).toBe(true);
    expect(Number.isFinite(res.resultado[20][1])).toBe(true);
  });

  test.each([
    ['NaN', () => NaN],
    ['Infinity', () => Infinity],
    ['-Infinity', () => -Infinity],
    ['undefined', () => {}],
    ['una cadena', () => 'a']
  ])('f que devuelve %s lanza ErrorParametros en la iteración 0', (descripcion, f) => {
    const error = capturar(() => euler({ ...base, f }));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: f\(x, y\) debe devolver un número finito en la iteración 0/
    );
  });

  test('indica la iteración correcta cuando f falla a mitad del cálculo', () => {
    // h = 0.25: x = 0, 0.25 (f = 1) y x = 0.5 (f = NaN) -> iteración 2, 3 llamadas.
    const f = jest.fn((x) => (x >= 0.5 ? NaN : 1));
    const error = capturar(() => euler({ f, x0: 0, y0: 1, h: 0.25, xFinal: 2 }));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error.message).toMatch(/en la iteración 2\./);
    expect(f).toHaveBeenCalledTimes(3);
  });

  test('detecta un avance y + h * f no finito aunque f sea finita', () => {
    // f = 1.7e308 y h = 10 -> h * f = Infinity.
    const error = capturar(() =>
      euler({ f: () => 1.7e308, x0: 0, y0: 1, h: 10, xFinal: 100 })
    );

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: resultado no finito en la iteración 0/
    );
  });

  test('detecta un paso tan pequeño que x + h no avanza (x0 = 1, h = 1e-20)', () => {
    // 1 + 1e-20 === 1 en doble precisión: se evitaría un bucle infinito.
    const error = capturar(() =>
      euler({ f: (x, y) => y, x0: 1, y0: 1, h: 1e-20, xFinal: 2 })
    );

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error.message).toMatch(
      /ChuspaNumeric\.euler: el paso h no permite avanzar numéricamente/
    );
  });
});
