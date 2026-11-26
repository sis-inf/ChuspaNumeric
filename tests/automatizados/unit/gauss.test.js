import { gauss } from '../../../src/lineales/gauss.js';
import { gaussJordan } from '../../../src/lineales/gauss-jordan.js';
import { matrizIdentidad } from '../../../src/utils/generadores_matrices.js';
import {
  ErrorDominio,
  ErrorParametros,
  ErrorDivergencia
} from '../../../src/core/errores.js';

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

const normaInf = (v) => Math.max(...v.map((x) => Math.abs(x)));
const multiplicar = (A, x) =>
  A.map((fila) => fila.reduce((s, v, j) => s + v * x[j], 0));
const hilbert = (n) =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => 1 / (i + j + 1))
  );
// Matriz con diagonal n+1 y resto 1 (estrictamente diagonal dominante)
const diagDominante = (n) =>
  Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? n + 1 : 1))
  );

// -------------------------------------------------------------------
// Eliminación Gaussiana
// -------------------------------------------------------------------

describe('Eliminación Gaussiana (gauss)', () => {
  test('Resuelve sistema 2x2 con solución conocida', () => {
    // 2x + y = 5
    //  x + 3y = 10
    // Solución exacta: x=1, y=3
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [5, 10];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(1, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
  });

  test('Resuelve sistema 3x3 con solución conocida', () => {
    //  2x +  y -  z =  8
    // -3x -  y + 2z = -11
    // -2x +  y + 2z = -3
    // Solución exacta: x=2, y=3, z=-1
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];
    const b = [8, -11, -3];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(2, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
    expect(res.resultado[2]).toBeCloseTo(-1, 10);
  });

  test('El resultado tiene la misma cantidad de variables que el sistema', () => {
    const A = [
      [4, 1],
      [2, 3]
    ];
    const b = [9, 8];

    const res = gauss({ A, b });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(res.resultado.length).toBe(2);
  });

  test('Lanza error con matriz singular (pivote nulo)', () => {
    // Filas proporcionales → sistema sin solución única
    // [1, 2 | 3]
    // [2, 4 | 6]  ← fila 2 = 2 × fila 1 → tras eliminar, el pivote de la col 2 es 0
    const A = [
      [1, 2],
      [2, 4]
    ];
    const b = [3, 6];

    expect(() => gauss({ A, b })).toThrow();
  });

  test('Lanza ErrorDominio cuando el pivote inicial es nulo', () => {
    // El método no realiza intercambio de filas.
    const A = [
      [0, 1],
      [1, 2]
    ];
    const b = [1, 3];

    expect(() => gauss({ A, b })).toThrow(ErrorDominio);
    expect(() => gauss({ A, b })).toThrow(
      'ChuspaNumeric.gauss: pivote nulo en la columna 1'
    );
  });

  test('Registra una advertencia cuando el pivote es pequeño respecto a la matriz', () => {
    const A = [
      [1e-11, 1],
      [0, 1]
    ];
    const b = [1 + 1e-11, 1];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.warnings).toHaveLength(1);
    expect(res.warnings[0]).toContain('Pivote pequeño detectado en columna 1');
    expect(res.warnings[0]).toContain('Posible inestabilidad numérica');
  });

  test('Resuelve sistema con matriz identidad (solución igual a b)', () => {
    const A = matrizIdentidad(3);
    const b = [5, -2, 7];

    const res = gauss({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(5, 10);
    expect(res.resultado[1]).toBeCloseTo(-2, 10);
    expect(res.resultado[2]).toBeCloseTo(7, 10);
  });
});

// -------------------------------------------------------------------
// Gauss: precisión y error relativo
// -------------------------------------------------------------------

describe('gauss - precisión y errores relativos', () => {
  test.each([2, 3, 4, 5, 10])(
    'Matriz diagonal dominante n=%i: error relativo <= 1e-13',
    (n) => {
      // A[i][i] = n+1, resto 1; solución exacta x_i = i+1
      const A = diagDominante(n);
      const exacta = Array.from({ length: n }, (_, i) => i + 1);
      const b = multiplicar(A, exacta);

      const res = gauss({ A, b });

      const errRel =
        normaInf(res.resultado.map((v, i) => v - exacta[i])) /
        normaInf(exacta);
      expect(res.convergio).toBe(true);
      expect(errRel).toBeLessThanOrEqual(1e-13);
    }
  );

  test.each([
    [3, 1e-12],
    [4, 1e-10],
    [5, 1e-9],
    [6, 1e-7]
  ])(
    'Hilbert n=%i (mal condicionada): error relativo <= %s y residuo pequeño',
    (n, cota) => {
      // b = A * (1,...,1) → solución exacta: vector de unos
      const A = hilbert(n);
      const exacta = Array(n).fill(1);
      const b = multiplicar(A, exacta);

      const res = gauss({ A, b });

      const errRel = normaInf(res.resultado.map((v) => v - 1));
      const residuo = normaInf(
        multiplicar(A, res.resultado).map((v, i) => v - b[i])
      );
      expect(errRel).toBeLessThanOrEqual(cota);
      // El residuo se mantiene al nivel del epsilon de máquina aunque el error crezca
      expect(residuo).toBeLessThanOrEqual(1e-13);
    }
  );

  test('El error crece con el mal condicionamiento (Hilbert n=3 < 4 < 5 < 6)', () => {
    const errores = [3, 4, 5, 6].map((n) => {
      const A = hilbert(n);
      const b = multiplicar(A, Array(n).fill(1));
      const res = gauss({ A, b });
      return normaInf(res.resultado.map((v) => v - 1));
    });

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeGreaterThan(errores[i - 1]);
    }
  });

  test('El sistema bien condicionado es más preciso que el mal condicionado (n=5)', () => {
    const exacta = Array(5).fill(1);
    const A1 = diagDominante(5);
    const A2 = hilbert(5);

    const r1 = gauss({ A: A1, b: multiplicar(A1, exacta) });
    const r2 = gauss({ A: A2, b: multiplicar(A2, exacta) });

    const e1 = normaInf(r1.resultado.map((v) => v - 1));
    const e2 = normaInf(r2.resultado.map((v) => v - 1));
    expect(e1).toBeLessThan(e2);
  });

  test.each([
    [1e-3, 1e-12],
    [1e-6, 1e-9],
    [1e-8, 1e-7],
    [1e-9, 1e-5]
  ])(
    'Pivote pequeño %s: error en x[0] <= %s',
    (eps, cota) => {
      // eps*x + y = 1 + eps ; x + y = 2 → solución exacta x=1, y=1
      const A = [
        [eps, 1],
        [1, 1]
      ];
      const b = [1 + eps, 2];

      const res = gauss({ A, b });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado[0] - 1)).toBeLessThanOrEqual(cota);
      expect(Math.abs(res.resultado[1] - 1)).toBeLessThanOrEqual(cota);
    }
  );

  test('La pérdida de precisión crece al reducir el pivote (1e-3 → 1e-6 → 1e-8 → 1e-9)', () => {
    const errores = [1e-3, 1e-6, 1e-8, 1e-9].map((eps) => {
      const res = gauss({
        A: [
          [eps, 1],
          [1, 1]
        ],
        b: [1 + eps, 2]
      });
      return Math.abs(res.resultado[0] - 1);
    });

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeGreaterThan(errores[i - 1]);
    }
  });

  test('Escalar A y b por un mismo factor no cambia la solución', () => {
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];
    const b = [8, -11, -3];
    const k = 1e6;

    const base = gauss({ A, b });
    const escalado = gauss({
      A: A.map((f) => f.map((v) => v * k)),
      b: b.map((v) => v * k)
    });

    escalado.resultado.forEach((v, i) =>
      expect(v).toBeCloseTo(base.resultado[i], 9)
    );
  });
});

// -------------------------------------------------------------------
// Gauss: traza de pasos (iteraciones)
// -------------------------------------------------------------------

describe('gauss - traza de pasos', () => {
  const A3 = [
    [2, 1, -1],
    [-3, -1, 2],
    [-2, 1, 2]
  ];
  const b3 = [8, -11, -3];

  test.each([2, 3, 4, 5, 10])(
    'n=%i: cantidad de pasos = 1 + n(n-1)/2 eliminaciones + n sustituciones',
    (n) => {
      const A = diagDominante(n);
      const b = multiplicar(
        A,
        Array.from({ length: n }, (_, i) => i + 1)
      );

      const res = gauss({ A, b });

      expect(res.iteraciones).toHaveLength(1 + (n * (n - 1)) / 2 + n);
    }
  );

  test('El contador n de iteraciones es secuencial desde 1', () => {
    const res = gauss({ A: A3, b: b3 });

    res.iteraciones.forEach((it, idx) => expect(it.n).toBe(idx + 1));
  });

  test('Las fases son: eliminación (1 + 3 pasos) y luego sustitución (3 pasos)', () => {
    const res = gauss({ A: A3, b: b3 });

    const fases = res.iteraciones.map((it) => it.paso);
    expect(fases).toEqual([
      'eliminacion',
      'eliminacion',
      'eliminacion',
      'eliminacion',
      'sustitucion',
      'sustitucion',
      'sustitucion'
    ]);
  });

  test('El primer paso guarda el estado inicial del sistema', () => {
    const res = gauss({ A: A3, b: b3 });

    expect(res.iteraciones[0].matriz).toEqual(A3);
    expect(res.iteraciones[0].vector).toEqual(b3);
  });

  test('Tras eliminar la fila 2 con la columna pivote 1 queda [0, 0.5, 0.5 | 1]', () => {
    // factor = -3/2 = -1.5
    // fila2 = [-3, -1, 2 | -11] + 1.5*[2, 1, -1 | 8] = [0, 0.5, 0.5 | 1]
    const res = gauss({ A: A3, b: b3 });

    const paso = res.iteraciones[1];
    expect(paso.descripcion).toContain('fila 2');
    expect(paso.matriz[1][0]).toBeCloseTo(0, 12);
    expect(paso.matriz[1][1]).toBeCloseTo(0.5, 12);
    expect(paso.matriz[1][2]).toBeCloseTo(0.5, 12);
    expect(paso.vector[1]).toBeCloseTo(1, 12);
  });

  test('Al terminar la eliminación la matriz es triangular superior', () => {
    const res = gauss({ A: A3, b: b3 });

    // iteraciones[3] es el último paso de eliminación
    const U = res.iteraciones[3].matriz;
    expect(U[1][0]).toBeCloseTo(0, 12);
    expect(U[2][0]).toBeCloseTo(0, 12);
    expect(U[2][1]).toBeCloseTo(0, 12);
    expect(U[2][2]).toBeCloseTo(-1, 12);
    expect(res.iteraciones[3].vector[2]).toBeCloseTo(1, 12);
  });

  test('Los pasos guardan copias: no comparten referencia entre sí ni con A', () => {
    const res = gauss({ A: A3, b: b3 });

    expect(res.iteraciones[0].matriz).not.toBe(A3);
    expect(res.iteraciones[0].matriz).not.toBe(res.iteraciones[1].matriz);
    expect(res.iteraciones[0].matriz[0]).not.toBe(A3[0]);
  });

  test('No modifica A ni b de entrada', () => {
    const A = A3.map((f) => [...f]);
    const b = [...b3];

    gauss({ A, b });

    expect(A).toEqual(A3);
    expect(b).toEqual(b3);
  });

  test('Llamar dos veces con los mismos datos da el mismo resultado', () => {
    const A = A3.map((f) => [...f]);
    const b = [...b3];

    const r1 = gauss({ A, b });
    const r2 = gauss({ A, b });

    expect(r2.resultado).toEqual(r1.resultado);
    expect(r2.iteraciones).toHaveLength(r1.iteraciones.length);
  });
});

// -------------------------------------------------------------------
// Gauss: contrato del resultado
// -------------------------------------------------------------------

describe('gauss - contrato del resultado', () => {
  test('Devuelve resultado, iteraciones, convergio, mensaje y meta', () => {
    const res = gauss({
      A: [
        [2, 1],
        [1, 3]
      ],
      b: [5, 10]
    });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(Array.isArray(res.iteraciones)).toBe(true);
    expect(res.convergio).toBe(true);
    expect(res.mensaje).toBe('El sistema de ecuaciones se resolvió con éxito.');
  });

  test('meta incluye metodo, parametros.n y tiempo_ms numérico', () => {
    const res = gauss({
      A: [
        [2, 1],
        [1, 3]
      ],
      b: [5, 10]
    });

    expect(res.meta.metodo).toBe('Eliminación Gaussiana');
    expect(res.meta.parametros).toEqual({ n: 2 });
    expect(typeof res.meta.tiempo_ms).toBe('number');
  });

  test('Sin pivotes pequeños no hay propiedad warnings', () => {
    const res = gauss({
      A: [
        [2, 1],
        [1, 3]
      ],
      b: [5, 10]
    });

    expect(res.warnings).toBeUndefined();
  });

  test('Con pivote pequeño el mensaje indica la advertencia de inestabilidad', () => {
    const res = gauss({
      A: [
        [1e-11, 1],
        [0, 1]
      ],
      b: [1 + 1e-11, 1]
    });

    expect(res.mensaje).toContain('1 advertencia(s) de inestabilidad numérica');
  });

  test('El umbral de advertencia es relativo a la norma de A', () => {
    // Pivote 1e-9 con ||A||inf ~ 1  → 1e-9 > 1e-10 → sin advertencia
    const sinAviso = gauss({
      A: [
        [1e-9, 1],
        [1, 1]
      ],
      b: [1 + 1e-9, 2]
    });
    // Pivote 1e-11 con ||A||inf ~ 2 → < 1e-10 → con advertencia
    const conAviso = gauss({
      A: [
        [1e-11, 1],
        [1, 1]
      ],
      b: [1 + 1e-11, 2]
    });

    expect(sinAviso.warnings).toBeUndefined();
    expect(conAviso.warnings).toHaveLength(1);
  });
});

// -------------------------------------------------------------------
// Gauss: no convergencia (pivote nulo, singularidad, divergencia)
// -------------------------------------------------------------------

describe('gauss - casos de falla (no hay solución por este método)', () => {
  test('Matriz singular lanza ErrorDominio en la columna 2', () => {
    // fila2 - 2*fila1 = [0, 0 | 0] → pivote nulo en la columna 2
    const error = capturar(() =>
      gauss({
        A: [
          [1, 2],
          [2, 4]
        ],
        b: [3, 6]
      })
    );

    expect(error).toBeInstanceOf(ErrorDominio);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toContain('ChuspaNumeric.gauss: pivote nulo');
    expect(error.message).toContain('columna 2');
  });

  test('Fila de ceros lanza ErrorDominio', () => {
    const error = capturar(() =>
      gauss({
        A: [
          [1, 2],
          [0, 0]
        ],
        b: [1, 1]
      })
    );

    expect(error).toBeInstanceOf(ErrorDominio);
    expect(error.message).toContain('columna 2');
  });

  test('Pivote por debajo de 1e-12 se trata como nulo', () => {
    const error = capturar(() =>
      gauss({
        A: [
          [1e-14, 1],
          [1, 1]
        ],
        b: [1, 2]
      })
    );

    expect(error).toBeInstanceOf(ErrorDominio);
    expect(error.message).toContain('columna 1');
  });

  test('Sistema 3x3 singular (fila 3 = fila 1 + fila 2) lanza ErrorDominio', () => {
    const error = capturar(() =>
      gauss({
        A: [
          [1, 1, 1],
          [0, 1, 2],
          [1, 2, 3]
        ],
        b: [1, 2, 3]
      })
    );

    expect(error).toBeInstanceOf(ErrorDominio);
    expect(error.message).toContain('columna 3');
  });

  test('Solución que desborda a Infinity lanza ErrorDivergencia', () => {
    // x[0] = 1e300 / 1e-11 = 1e311 → Infinity
    const error = capturar(() =>
      gauss({
        A: [
          [1e-11, 0],
          [0, 1]
        ],
        b: [1e300, 1]
      })
    );

    expect(error).toBeInstanceOf(ErrorDivergencia);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toContain('valor no finito en x[1]');
  });
});

// -------------------------------------------------------------------
// Gauss: validación de entradas
// -------------------------------------------------------------------

describe('gauss - validación de entradas', () => {
  const Aok = [
    [1, 0],
    [0, 1]
  ];
  const bok = [1, 1];

  test.each([
    ['sin argumento', undefined, /se esperaba un objeto de opciones/],
    ['null', null, /se recibió null/],
    ['arreglo en lugar de objeto', [], /se recibió arreglo/],
    ['string en lugar de objeto', 'x', /se recibió string/],
    ['A ausente', { b: bok }, /"A" debe ser una matriz/],
    ['A no es arreglo', { A: 'x', b: [1] }, /"A" debe ser una matriz/],
    ['A vacía', { A: [], b: [] }, /no vacía/],
    ['fila de A no es arreglo', { A: [1, 2], b: [1, 2] }, /la fila 1 de "A"/],
    [
      'A no cuadrada',
      {
        A: [
          [1, 2, 3],
          [4, 5, 6]
        ],
        b: [1, 2]
      },
      /debe ser cuadrada \(2x2\)/
    ],
    ['A con NaN', { A: [[NaN, 0], [0, 1]], b: bok }, /"A\[0\]\[0\]".*NaN/],
    [
      'A con Infinity',
      { A: [[1, Infinity], [0, 1]], b: bok },
      /"A\[0\]\[1\]".*Infinity/
    ],
    ['A con string', { A: [[1, '2'], [0, 1]], b: bok }, /"A\[0\]\[1\]"/],
    ['b ausente', { A: Aok }, /"b" debe ser un arreglo/],
    ['b no es arreglo', { A: Aok, b: 5 }, /"b" debe ser un arreglo.*number/],
    ['b con longitud distinta', { A: Aok, b: [1] }, /"b" debe tener 2 elementos/],
    ['b con NaN', { A: Aok, b: [1, NaN] }, /"b\[1\]".*NaN/],
    ['b con Infinity', { A: Aok, b: [Infinity, 1] }, /"b\[0\]".*Infinity/],
    ['b con string', { A: Aok, b: ['1', 1] }, /"b\[0\]"/]
  ])('%s -> ErrorParametros con prefijo ChuspaNumeric.gauss:', (_d, entrada, regex) => {
    const error = capturar(() => gauss(entrada));

    expect(error).toBeInstanceOf(ErrorParametros);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(/^ChuspaNumeric\.gauss:/);
    expect(error.message).toMatch(regex);
  });
});

// -------------------------------------------------------------------
// Gauss-Jordan
// -------------------------------------------------------------------

describe('Eliminación Gauss-Jordan', () => {
  test('Resuelve sistema 2x2 con solución conocida', () => {
    // 2x + y = 5
    //  x + 3y = 10
    // Solución exacta: x=1, y=3
    const A = [
      [2, 1],
      [1, 3]
    ];
    const b = [5, 10];

    const res = gaussJordan({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(1, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
  });

  test('Resuelve sistema 3x3 con solución conocida', () => {
    //  2x +  y -  z =  8
    // -3x -  y + 2z = -11
    // -2x +  y + 2z = -3
    // Solución exacta: x=2, y=3, z=-1
    const A = [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2]
    ];
    const b = [8, -11, -3];

    const res = gaussJordan({ A, b });

    expect(res.convergio).toBe(true);
    expect(res.resultado[0]).toBeCloseTo(2, 10);
    expect(res.resultado[1]).toBeCloseTo(3, 10);
    expect(res.resultado[2]).toBeCloseTo(-1, 10);
  });

  test('El resultado tiene la misma cantidad de variables que el sistema', () => {
    const A = [
      [4, 1],
      [2, 3]
    ];
    const b = [9, 8];

    const res = gaussJordan({ A, b });

    expect(Array.isArray(res.resultado)).toBe(true);
    expect(res.resultado.length).toBe(2);
  });

  test('Lanza error con matriz singular (columna toda cero)', () => {
    // Segunda columna toda cero → sistema singular
    // [1, 0 | 1]
    // [0, 0 | 2]  ← pivote nulo sin fila de rescate
    const A = [
      [1, 0],
      [0, 0]
    ];
    const b = [1, 2];

    expect(() => gaussJordan({ A, b })).toThrow();
  });
});
