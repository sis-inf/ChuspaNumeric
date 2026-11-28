import { derivative } from '../../../src/integracion/derivative.js';
import { ErrorParametros } from '../../../src/core/errores.js';

// Helper: captura el error lanzado (o null si no lanza)
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe('derivative - derivada numérica por diferencias finitas centradas', () => {
  test('calcula derivada de f(x) = x² en x=2', () => {
    const f = (x) => x * x;
    const x = 2;
    const valorExacto = 4; // f'(x) = 2x, f'(2) = 4
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('calcula derivada de f(x) = x² en x=0', () => {
    const f = (x) => x * x;
    const x = 0;
    const valorExacto = 0; // f'(x) = 2x, f'(0) = 0
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('calcula derivada de f(x) = x³ en x=3', () => {
    const f = (x) => x ** 3;
    const x = 3;
    const valorExacto = 27; // f'(x) = 3x², f'(3) = 27
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('calcula derivada de f(x) = sin(x) en x=0', () => {
    const f = (x) => Math.sin(x);
    const x = 0;
    const valorExacto = 1; // f'(x) = cos(x), f'(0) = 1
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('calcula derivada de f(x) = e^x en x=1', () => {
    const f = (x) => Math.exp(x);
    const x = 1;
    const valorExacto = Math.E; // f'(x) = e^x, f'(1) = e
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('calcula derivada de f(x) = ln(x) en x=1', () => {
    const f = (x) => Math.log(x);
    const x = 1;
    const valorExacto = 1; // f'(x) = 1/x, f'(1) = 1
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(valorExacto, 5);
  });

  test('usa valor por defecto de h=1e-5', () => {
    const f = (x) => x * x;
    const x = 2;
    const resultado = derivative(f, x);

    expect(resultado).toBeCloseTo(4, 5);
  });

  test('usa valor personalizado de h', () => {
    const f = (x) => x * x;
    const x = 2;
    const h = 1e-3;
    const resultado = derivative(f, x, h);

    expect(resultado).toBeCloseTo(4, 3);
  });

  test('f no función lanza error', () => {
    expect(() => derivative('not a function', 2)).toThrow(
      "El parámetro 'f' debe ser una función"
    );
    expect(() => derivative(123, 2)).toThrow(
      "El parámetro 'f' debe ser una función"
    );
    expect(() => derivative(null, 2)).toThrow(
      "El parámetro 'f' debe ser una función"
    );
  });

  test('x no número válido lanza error', () => {
    const f = (x) => x * x;

    expect(() => derivative(f, 'not a number')).toThrow(
      "El parámetro 'x' debe ser un número válido"
    );
    expect(() => derivative(f, NaN)).toThrow(
      "El parámetro 'x' debe ser un número válido"
    );
    expect(() => derivative(f, null)).toThrow(
      "El parámetro 'x' debe ser un número válido"
    );
  });

  test('h no positivo lanza error', () => {
    const f = (x) => x * x;

    expect(() => derivative(f, 2, 0)).toThrow(
      "El parámetro 'h' debe ser un número positivo"
    );
    expect(() => derivative(f, 2, -1e-5)).toThrow(
      "El parámetro 'h' debe ser un número positivo"
    );
    expect(() => derivative(f, 2, -0.001)).toThrow(
      "El parámetro 'h' debe ser un número positivo"
    );
  });
});

describe('derivative - precisión según el tamaño de paso h', () => {
  // Para f = e^x en x=1: error de truncación ≈ (h²/6)·f'''(1) = (h²/6)·e
  // => error / h² ≈ e/6 ≈ 0.45305 (verificado numéricamente para h entre 1e-1 y 1e-4)
  test.each([1e-1, 5e-2, 1e-2, 1e-3, 1e-4])(
    'e^x en x=1 con h=%p: error ≈ (e/6)·h²',
    (h) => {
      const error = Math.abs(derivative(Math.exp, 1, h) - Math.E);

      expect(error / (h * h)).toBeCloseTo(Math.E / 6, 2);
    }
  );

  // Para f = sin(x) en x=1: error ≈ (h²/6)·|cos(1)| ≈ 0.09·h²
  test.each([1e-1, 1e-2, 1e-3, 1e-4])(
    'sin(x) en x=1 con h=%p: error absoluto <= h²',
    (h) => {
      const error = Math.abs(derivative(Math.sin, 1, h) - Math.cos(1));

      expect(error).toBeLessThanOrEqual(h * h);
    }
  );

  test('el error de truncación disminuye al reducir h (h grande -> h moderado)', () => {
    const errores = [1e-1, 1e-2, 1e-3, 1e-4].map((h) =>
      Math.abs(derivative(Math.exp, 1, h) - Math.E)
    );

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
  });

  // (x+h)³ - (x-h)³ = 6x²h + 2h³  =>  D(h) = 3x² + h²
  // Con x=3: D(h) = 27 + h² (el error es exactamente h²)
  test.each([
    [1, 28],
    [0.1, 27.01],
    [0.01, 27.0001]
  ])('x³ en x=3 con h=%p da 27 + h² = %p', (h, esperado) => {
    expect(derivative((x) => x ** 3, 3, h)).toBeCloseTo(esperado, 6);
  });

  // (x+h)² - (x-h)² = 4xh  =>  D(h) = 2x exacto para cualquier h
  test.each([10, 1, 0.5, 1e-3])(
    'x² en x=2 es exacta (=4) incluso con h=%p',
    (h) => {
      expect(derivative((x) => x * x, 2, h)).toBeCloseTo(4, 8);
    }
  );

  test('funciones lineales y constantes se derivan sin error de truncación', () => {
    expect(derivative(() => 5, 3)).toBe(0);
    expect(derivative((x) => 3 * x + 7, 2)).toBeCloseTo(3, 6);
    expect(derivative((x) => 3 * x + 7, 2, 1)).toBeCloseTo(3, 10);
  });

  // Error relativo con el h por defecto (verificado: todos < 1e-10, margen 1e-8)
  test.each([
    ['sin(x) en x=1', Math.sin, 1, Math.cos(1)],
    ['e^x en x=2', Math.exp, 2, Math.exp(2)],
    ['ln(x) en x=2', Math.log, 2, 0.5],
    ['sqrt(x) en x=4', Math.sqrt, 4, 0.25],
    ['atan(x) en x=1', Math.atan, 1, 0.5],
    ['tan(x) en x=0.5', Math.tan, 0.5, 1 / Math.cos(0.5) ** 2],
    ['x⁴ en x=2', (x) => x ** 4, 2, 32],
    ['1/x en x=2', (x) => 1 / x, 2, -0.25]
  ])('error relativo < 1e-8 con h por defecto: %s', (_desc, f, x, exacto) => {
    const relativo = Math.abs(derivative(f, x) - exacto) / Math.abs(exacto);

    expect(relativo).toBeLessThan(1e-8);
  });
});

describe('derivative - orden de convergencia', () => {
  // Diferencias centradas: orden 2 => al dividir h entre 2 el error se divide ≈ entre 4
  // Verificado: razones 4.0015 (0.1 -> 0.05) y 4.0004 (0.05 -> 0.025)
  test('el error se reduce ≈ 4 veces al dividir h entre 2 (orden 2)', () => {
    const hs = [0.1, 0.05, 0.025];
    const errores = hs.map((h) =>
      Math.abs(derivative(Math.exp, 1, h) - Math.E)
    );

    for (let i = 1; i < errores.length; i++) {
      const razon = errores[i - 1] / errores[i];

      expect(razon).toBeGreaterThan(3.9);
      expect(razon).toBeLessThan(4.1);
    }
  });

  test('el error se reduce ≈ 100 veces al dividir h entre 10 (orden 2)', () => {
    const e1 = Math.abs(derivative(Math.exp, 1, 1e-2) - Math.E);
    const e2 = Math.abs(derivative(Math.exp, 1, 1e-3) - Math.E);

    expect(e1 / e2).toBeGreaterThan(90);
    expect(e1 / e2).toBeLessThan(110);
  });

  test('la pendiente log-log del error frente a h es ≈ 2', () => {
    const h1 = 1e-1;
    const h2 = 1e-3;
    const e1 = Math.abs(derivative(Math.sin, 1, h1) - Math.cos(1));
    const e2 = Math.abs(derivative(Math.sin, 1, h2) - Math.cos(1));
    const orden = Math.log(e1 / e2) / Math.log(h1 / h2);

    expect(orden).toBeGreaterThan(1.95);
    expect(orden).toBeLessThan(2.05);
  });

  test('la diferencia centrada es más precisa que la adelantada con el mismo h', () => {
    const h = 1e-4;
    const centrada = Math.abs(derivative(Math.exp, 1, h) - Math.E);
    // Diferencia adelantada (orden 1): (f(x+h) - f(x)) / h
    const adelantada = Math.abs((Math.exp(1 + h) - Math.exp(1)) / h - Math.E);

    // Verificado: centrada ≈ 4.5e-9, adelantada ≈ 1.4e-4
    expect(centrada).toBeLessThan(adelantada);
    expect(centrada * 1000).toBeLessThan(adelantada);
  });
});

describe('derivative - pérdida de precisión (no convergencia por redondeo)', () => {
  // Con h muy pequeño domina el error de redondeo (cancelación en f(x+h) - f(x-h)).
  // Verificado para e^x en x=1: error(1e-5) ≈ 5.9e-11, error(1e-8) ≈ 6.6e-9,
  // error(1e-10) ≈ 6.7e-7, error(1e-12) ≈ 2.1e-4, error(1e-14) ≈ 9.3e-3
  test('reducir h por debajo del óptimo empeora el error (e^x en x=1)', () => {
    const err = (h) => Math.abs(derivative(Math.exp, 1, h) - Math.E);

    expect(err(1e-8)).toBeGreaterThan(err(1e-5));
    expect(err(1e-10)).toBeGreaterThan(err(1e-8));
    expect(err(1e-12)).toBeGreaterThan(1000 * err(1e-5));
  });

  test('h = 1e-5 (por defecto) es mejor que un h demasiado grande y que uno demasiado pequeño', () => {
    const err = (h) => Math.abs(derivative(Math.sin, 1, h) - Math.cos(1));

    expect(err(1e-5)).toBeLessThan(err(1e-1));
    expect(err(1e-5)).toBeLessThan(err(1e-12));
  });

  test('con h = 1e-12 el resultado ya no cumple 8 decimales de precisión', () => {
    const resultado = derivative(Math.sin, 1, 1e-12);

    // Verificado: error ≈ 1.2e-5
    expect(Math.abs(resultado - Math.cos(1))).toBeGreaterThan(1e-8);
    expect(Math.abs(resultado - Math.cos(1))).toBeLessThan(1e-2);
  });

  test('x grande con f(x) = x² pierde precisión relativa frente a x pequeño', () => {
    const f = (x) => x * x;
    const relativo = (x) => Math.abs(derivative(f, x) - 2 * x) / (2 * x);

    // Verificado: relativo(1e3) ≈ 2e-9, relativo(1e6) ≈ 6e-6
    expect(relativo(1e6)).toBeGreaterThan(relativo(1e3));
    expect(relativo(1e6)).toBeLessThan(1e-4);
  });
});

describe('derivative - funciones no derivables o fuera de dominio (divergencia)', () => {
  // Heaviside en x=0: f(h)=1, f(-h)=0 => D(h) = 1/(2h), que diverge al reducir h
  test('salto (Heaviside) en x=0: D(h) = 1/(2h) crece sin límite al reducir h', () => {
    const heaviside = (x) => (x >= 0 ? 1 : 0);
    const hs = [1e-1, 1e-3, 1e-5];
    const valores = hs.map((h) => derivative(heaviside, 0, h));

    // Verificado: 5, 500, 50000
    hs.forEach((h, i) => {
      expect(valores[i]).toBeCloseTo(1 / (2 * h), 4);
    });
    expect(valores[1]).toBeGreaterThan(valores[0]);
    expect(valores[2]).toBeGreaterThan(valores[1]);
    expect(valores[2]).toBeGreaterThan(1e4);
  });

  // 1/x en x=0: (1/h - 1/(-h)) / (2h) = 1/h², diverge
  test('f(x) = 1/x en x=0: D(h) = 1/h² crece sin límite al reducir h', () => {
    const f = (x) => 1 / x;
    const hs = [1e-1, 1e-2, 1e-3];
    const valores = hs.map((h) => derivative(f, 0, h));

    // Verificado: 100, 10000, 1000000
    hs.forEach((h, i) => {
      expect(Math.abs(valores[i] - 1 / (h * h)) / (1 / (h * h))).toBeLessThan(
        1e-9
      );
    });
    expect(valores[0]).toBeLessThan(valores[1]);
    expect(valores[1]).toBeLessThan(valores[2]);
  });

  test('sqrt(x) en x=0 da NaN (f(-h) fuera de dominio)', () => {
    expect(Number.isNaN(derivative(Math.sqrt, 0))).toBe(true);
  });

  test('ln(x) con h mayor que x da NaN (x - h < 0)', () => {
    // x = 1e-6 < h = 1e-5 por defecto
    expect(Number.isNaN(derivative(Math.log, 1e-6))).toBe(true);
    // Con h menor que x sí es finito y cercano a 1/x = 100
    expect(derivative(Math.log, 1e-2, 1e-6)).toBeCloseTo(100, 3);
  });

  test('si f devuelve NaN el resultado es NaN (no se enmascara)', () => {
    expect(Number.isNaN(derivative(() => NaN, 1))).toBe(true);
  });

  test('|x| en x=0 da 0 por simetría (la derivada no existe: advertencia de uso)', () => {
    expect(derivative(Math.abs, 0)).toBe(0);
    // En un punto regular sí detecta la pendiente correcta
    expect(derivative(Math.abs, 2)).toBeCloseTo(1, 6);
    expect(derivative(Math.abs, -2)).toBeCloseTo(-1, 6);
  });
});

describe('derivative - propiedades y comportamiento general', () => {
  test('llama a f exactamente dos veces, con x+h y x-h', () => {
    const llamadas = [];
    const f = (v) => {
      llamadas.push(v);
      return v * v;
    };
    const x = 2;
    const h = 0.25; // potencia de 2: x+h y x-h exactos

    derivative(f, x, h);

    expect(llamadas).toEqual([2.25, 1.75]);
  });

  test('función par: la derivada es impar (cos en x=0.7 y x=-0.7)', () => {
    const a = derivative(Math.cos, 0.7);
    const b = derivative(Math.cos, -0.7);

    expect(a).toBeCloseTo(-Math.sin(0.7), 8);
    expect(a).toBeCloseTo(-b, 10);
    expect(derivative(Math.cos, 0)).toBeCloseTo(0, 8);
  });

  test('es lineal: (a·f + b·g)\' = a·f\' + b·g\'', () => {
    const f = Math.sin;
    const g = Math.exp;
    const combinada = (x) => 3 * f(x) - 2 * g(x);
    const esperado = 3 * derivative(f, 1) - 2 * derivative(g, 1);

    expect(derivative(combinada, 1)).toBeCloseTo(esperado, 8);
  });

  test('es determinista: mismos argumentos dan el mismo resultado', () => {
    const r1 = derivative(Math.exp, 1, 1e-4);
    const r2 = derivative(Math.exp, 1, 1e-4);

    expect(r1).toBe(r2);
  });

  test('devuelve un número finito para entradas válidas', () => {
    const r = derivative(Math.sin, 1);

    expect(typeof r).toBe('number');
    expect(Number.isFinite(r)).toBe(true);
  });

  test('h undefined usa el valor por defecto (1e-5)', () => {
    expect(derivative(Math.exp, 1, undefined)).toBe(derivative(Math.exp, 1));
    expect(derivative(Math.exp, 1)).toBe(derivative(Math.exp, 1, 1e-5));
  });
});

describe('derivative - validación de parámetros (clase y mensaje reales)', () => {
  const f = (x) => x * x;
  const P = 'ChuspaNumeric.derivative:';
  const msgF = (recibido) =>
    `${P} El parámetro 'f' debe ser una función. Se esperaba: function. Se recibió: ${recibido}`;
  const msgX = (recibido) =>
    `${P} El parámetro 'x' debe ser un número válido (finito). Se recibió: ${recibido}`;
  const msgH = (recibido) =>
    `${P} El parámetro 'h' debe ser un número positivo (finito). Se recibió: ${recibido}`;

  // Mensajes verificados con prueba.mjs sobre el src actual
  test.each([
    ['cadena', 'abc', msgF('string (abc)')],
    ['número', 123, msgF('number (123)')],
    ['null', null, msgF('object (null)')],
    ['undefined', undefined, msgF('undefined (undefined)')]
  ])('f inválida (%s) lanza ErrorParametros con mensaje exacto', (_d, v, msg) => {
    const error = capturar(() => derivative(v, 2));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(msg);
  });

  test('f inválida (objeto) lanza ErrorParametros con prefijo y parámetro', () => {
    const error = capturar(() => derivative({}, 2));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /^ChuspaNumeric\.derivative: El parámetro 'f' debe ser una función/
    );
  });

  test.each([
    ['cadena', 'abc', msgX('string (abc)')],
    ['NaN', NaN, msgX('number (NaN)')],
    ['null', null, msgX('object (null)')],
    ['cadena numérica', '2', msgX('string (2)')],
    ['Infinity', Infinity, msgX('number (Infinity)')],
    ['-Infinity', -Infinity, msgX('number (-Infinity)')]
  ])('x inválida (%s) lanza ErrorParametros con mensaje exacto', (_d, v, msg) => {
    const error = capturar(() => derivative(f, v));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(msg);
  });

  test('x inválida (undefined) lanza ErrorParametros con prefijo y parámetro', () => {
    const error = capturar(() => derivative(f, undefined));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(
      /^ChuspaNumeric\.derivative: El parámetro 'x' debe ser un número válido/
    );
  });

  test.each([
    ['cero', 0, msgH('number (0)')],
    ['negativo', -0.5, msgH('number (-0.5)')],
    ['cadena', '1e-5', msgH('string (1e-5)')],
    ['null', null, msgH('object (null)')],
    ['-Infinity', -Infinity, msgH('number (-Infinity)')],
    ['NaN', NaN, msgH('number (NaN)')],
    ['Infinity', Infinity, msgH('number (Infinity)')]
  ])('h inválido (%s) lanza ErrorParametros con mensaje exacto', (_d, v, msg) => {
    const error = capturar(() => derivative(f, 2, v));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(msg);
  });

  test('h negativo pequeño (-1e-5) lanza ErrorParametros', () => {
    const error = capturar(() => derivative(f, 2, -1e-5));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error.message).toMatch(
      /^ChuspaNumeric\.derivative: El parámetro 'h' debe ser un número positivo/
    );
  });

  test('sin argumentos lanza el error de validación de f (no un error interno)', () => {
    const error = capturar(() => derivative());

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toBe(msgF('undefined (undefined)'));
  });

  test('el orden de validación es f, luego x, luego h', () => {
    const e1 = capturar(() => derivative('no', 'no', 'no'));
    const e2 = capturar(() => derivative(f, 'no', 'no'));
    const e3 = capturar(() => derivative(f, 2, 'no'));

    expect(e1.message).toMatch(/'f'/);
    expect(e2.message).toMatch(/'x'/);
    expect(e3.message).toMatch(/'h'/);
  });

  test('con entradas inválidas f nunca llega a evaluarse', () => {
    let llamadas = 0;
    const espia = (v) => {
      llamadas++;
      return v;
    };

    capturar(() => derivative(espia, NaN));
    capturar(() => derivative(espia, 2, 0));
    capturar(() => derivative(espia, 2, NaN));
    capturar(() => derivative(espia, Infinity));
    capturar(() => derivative(espia, 2, Infinity));

    expect(llamadas).toBe(0);
  });
});
