import { gaussSeidel } from '../../../src/lineales/gauss-seidel.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

// ---------------------------------------------------------------------
// Utilidades y sistemas de referencia usados por los casos nuevos
// ---------------------------------------------------------------------

// Sistema 3x3 estrictamente diagonalmente dominante, solución exacta (1, 2, 3)
const A_DOM = [
  [4, 1, 1],
  [1, 5, 1],
  [1, 1, 4]
];
const B_DOM = [9, 14, 15];
const SOL_DOM = [1, 2, 3];

const norma = (v) => Math.sqrt(v.reduce((acum, val) => acum + val ** 2, 0));

// Error relativo ||x - x*|| / ||x*|| en norma euclidiana
const errorRelativo = (x, exacta) =>
  norma(x.map((val, i) => val - exacta[i])) / norma(exacta);

// Ejecuta fn y devuelve el error lanzado (o null si no lanzó nada)
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

describe('gauss-seidel - método iterativo para sistemas lineales', () => {
  describe('convergencia con sistema diagonalmente dominante', () => {
    test('resuelve sistema 3x3 diagonalmente dominante', () => {
      // Sistema diagonalmente dominante con solución (1, 2, 3):
      // 4x1 +  x2 +  x3 = 9
      //  x1 + 5x2 +  x3 = 14
      //  x1 +  x2 + 4x3 = 15
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(1, 5);
      expect(res.resultado[1]).toBeCloseTo(2, 5);
      expect(res.resultado[2]).toBeCloseTo(3, 5);
    });

    test('resuelve sistema 4x4 diagonalmente dominante', () => {
      // Sistema diagonalmente dominante con solución (1, 1, 1, 1):
      // 4x1 +  x2 +  x3 +  x4 = 7
      //  x1 + 4x2 +  x3 +  x4 = 7
      //  x1 +  x2 + 4x3 +  x4 = 7
      //  x1 +  x2 +  x3 + 4x4 = 7
      const A = [
        [4, 1, 1, 1],
        [1, 4, 1, 1],
        [1, 1, 4, 1],
        [1, 1, 1, 4]
      ];
      const b = [7, 7, 7, 7];

      const res = gaussSeidel({ A, b });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(1, 5);
      expect(res.resultado[1]).toBeCloseTo(1, 5);
      expect(res.resultado[2]).toBeCloseTo(1, 5);
      expect(res.resultado[3]).toBeCloseTo(1, 5);
    });

    test('converge con vector inicial personalizado', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];
      const x0 = [0, 0, 0];

      const res = gaussSeidel({ A, b, x0 });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(1, 5);
      expect(res.resultado[1]).toBeCloseTo(2, 5);
      expect(res.resultado[2]).toBeCloseTo(3, 5);
    });

    test('converge con tolerancia personalizada', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b, tolerancia: 1e-10 });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(1, 9);
      expect(res.resultado[1]).toBeCloseTo(2, 9);
      expect(res.resultado[2]).toBeCloseTo(3, 9);
    });
  });

  describe('el error decrece con más iteraciones', () => {
    test('error disminuye monotónicamente en cada iteración', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      expect(res.iteraciones.length).toBeGreaterThan(1);

      // Verificar que el error decrece o se mantiene igual
      for (let i = 1; i < res.iteraciones.length; i++) {
        const errorActual = res.iteraciones[i].error;
        const errorAnterior = res.iteraciones[i - 1].error;
        expect(errorActual).toBeLessThanOrEqual(errorAnterior);
      }
    });

    test('error final es menor que error inicial', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      const errorInicial = res.iteraciones[0].error;
      const errorFinal = res.iteraciones[res.iteraciones.length - 1].error;

      expect(errorFinal).toBeLessThan(errorInicial);
    });

    test('más iteraciones producen mejor resultado', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      // Ejecutar con pocas iteraciones
      const res1 = gaussSeidel({ A, b, maxIter: 2 });

      // Ejecutar con más iteraciones
      const res2 = gaussSeidel({ A, b, maxIter: 10 });

      // El resultado con más iteraciones debe estar más cerca de la solución exacta
      const solucionExacta = [1, 2, 3];

      const error1 = Math.sqrt(
        res1.resultado.reduce((acc, val, i) => acc + (val - solucionExacta[i]) ** 2, 0)
      );

      const error2 = Math.sqrt(
        res2.resultado.reduce((acc, val, i) => acc + (val - solucionExacta[i]) ** 2, 0)
      );

      expect(error2).toBeLessThan(error1);
    });
  });

  describe('manejo de elemento diagonal cero', () => {
    test('lanza error si elemento diagonal A[0][0] es cero', () => {
      const A = [
        [0, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      expect(() => gaussSeidel({ A, b })).toThrow();
    });

    test('lanza error si elemento diagonal A[1][1] es cero', () => {
      const A = [
        [4, 1, 1],
        [1, 0, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      expect(() => gaussSeidel({ A, b })).toThrow();
    });

    test('lanza error si elemento diagonal A[2][2] es cero', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 0]
      ];
      const b = [9, 14, 15];

      expect(() => gaussSeidel({ A, b })).toThrow();
    });

    test('mensaje de error incluye índice del elemento diagonal cero', () => {
      const A = [
        [4, 1, 1],
        [1, 0, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      expect(() => gaussSeidel({ A, b })).toThrow(/A\[1\]\[1\]/);
    });

    test('mensaje de error sugiere reordenar filas', () => {
      const A = [
        [0, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      expect(() => gaussSeidel({ A, b })).toThrow(/reordenar/);
    });
  });

  describe('validación de parámetros', () => {
    test('iteraciones contienen número de iteración, vector x y error', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      expect(res.iteraciones.length).toBeGreaterThan(0);

      res.iteraciones.forEach((iter) => {
        expect(iter).toHaveProperty('n');
        expect(iter).toHaveProperty('x');
        expect(iter).toHaveProperty('error');
        expect(Array.isArray(iter.x)).toBe(true);
        expect(typeof iter.error).toBe('number');
      });
    });

    test('número de iteración es secuencial empezando desde 1', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      res.iteraciones.forEach((iter, index) => {
        expect(iter.n).toBe(index + 1);
      });
    });

    test('vector x en iteraciones tiene longitud correcta', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b });

      res.iteraciones.forEach((iter) => {
        expect(iter.x.length).toBe(A.length);
      });
    });
  });

  describe('casos de borde', () => {
    test('no converge si maxIter es muy pequeño', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b, maxIter: 1 });

      expect(res.convergio).toBe(false);
    });

    test('converge con maxIter suficiente', () => {
      const A = [
        [4, 1, 1],
        [1, 5, 1],
        [1, 1, 4]
      ];
      const b = [9, 14, 15];

      const res = gaussSeidel({ A, b, maxIter: 100 });

      expect(res.convergio).toBe(true);
    });
  });

  // =====================================================================
  // Casos nuevos (issue #1612): precisión, tolerancias, tamaños de paso,
  // orden de convergencia y detección de no convergencia / divergencia
  // =====================================================================

  describe('precisión con diferentes tolerancias', () => {
    // Cada tolerancia más estricta exige más iteraciones y, al converger,
    // el tamaño del último paso (res.iteraciones[último].error) es < tolerancia.
    const tolerancias = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12];

    test.each(tolerancias)(
      'tolerancia %p: converge y el último paso es menor que la tolerancia',
      (tolerancia) => {
        const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia, maxIter: 200 });

        const ultimo = res.iteraciones[res.iteraciones.length - 1];

        expect(res.convergio).toBe(true);
        expect(ultimo.error).toBeLessThan(tolerancia);
      }
    );

    test.each(tolerancias)(
      'tolerancia %p: el error relativo respecto a la solución exacta es <= 10 * tolerancia',
      (tolerancia) => {
        const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia, maxIter: 200 });

        expect(errorRelativo(res.resultado, SOL_DOM)).toBeLessThanOrEqual(10 * tolerancia);
      }
    );

    test('tolerancias más estrictas nunca usan menos iteraciones', () => {
      const conteos = tolerancias.map(
        (tolerancia) =>
          gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia, maxIter: 200 }).iteraciones.length
      );

      for (let i = 1; i < conteos.length; i++) {
        expect(conteos[i]).toBeGreaterThanOrEqual(conteos[i - 1]);
      }
      expect(conteos[conteos.length - 1]).toBeGreaterThan(conteos[0]);
    });

    test('la precisión de la solución mejora al reducir la tolerancia', () => {
      const errorGrueso = errorRelativo(
        gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-2 }).resultado,
        SOL_DOM
      );
      const errorFino = errorRelativo(
        gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-10 }).resultado,
        SOL_DOM
      );

      expect(errorFino).toBeLessThan(errorGrueso);
      expect(errorFino).toBeLessThan(1e-9);
    });
  });

  describe('tamaño de paso y criterio de parada', () => {
    // Pasos calculados a mano con x0 = 0:
    //   iteración 1: x = (2.25, 2.35, 2.6)           -> ||dx|| ≈ 4.165
    //   iteración 2: x = (1.0125, 2.0775, 2.9775)    -> ||dx|| ≈ 1.322
    //   iteración 3: x = (0.98625, 2.00725, 3.001625)-> ||dx|| ≈ 0.0788
    test.each([
      [5, 1],
      [1, 3],
      [0.1, 3]
    ])(
      'tolerancia %p detiene el método en la iteración %p',
      (tolerancia, iteracionesEsperadas) => {
        const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia });

        expect(res.convergio).toBe(true);
        expect(res.iteraciones.length).toBe(iteracionesEsperadas);
      }
    );

    test('el primer paso desde x0 = 0 coincide con el cálculo manual', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, maxIter: 1 });

      expect(res.iteraciones[0].x[0]).toBeCloseTo(2.25, 12);
      expect(res.iteraciones[0].x[1]).toBeCloseTo(2.35, 12);
      expect(res.iteraciones[0].x[2]).toBeCloseTo(2.6, 12);
      expect(res.iteraciones[0].error).toBeCloseTo(Math.sqrt(17.345), 12);
    });

    test('si x0 es la solución exacta, converge en una sola iteración con paso nulo', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, x0: [1, 2, 3] });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones.length).toBe(1);
      expect(res.iteraciones[0].error).toBe(0);
      expect(res.resultado).toEqual([1, 2, 3]);
    });

    test('converge a la misma solución desde un vector inicial lejano', () => {
      const res = gaussSeidel({
        A: A_DOM,
        b: B_DOM,
        x0: [100, -100, 50],
        tolerancia: 1e-8,
        maxIter: 200
      });

      expect(res.convergio).toBe(true);
      expect(errorRelativo(res.resultado, SOL_DOM)).toBeLessThan(1e-8);
    });

    test('un vector inicial lejano requiere más iteraciones que x0 = 0', () => {
      const cerca = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-8 });
      const lejos = gaussSeidel({
        A: A_DOM,
        b: B_DOM,
        x0: [100, -100, 50],
        tolerancia: 1e-8,
        maxIter: 200
      });

      expect(lejos.iteraciones.length).toBeGreaterThan(cerca.iteraciones.length);
    });

    test('no modifica el vector inicial x0 recibido', () => {
      const x0 = [100, -100, 50];

      gaussSeidel({ A: A_DOM, b: B_DOM, x0 });

      expect(x0).toEqual([100, -100, 50]);
    });
  });

  describe('orden de convergencia', () => {
    test('el error de paso decrece estrictamente en cada iteración (convergencia lineal)', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM });

      for (let k = 1; k < res.iteraciones.length; k++) {
        expect(res.iteraciones[k].error).toBeLessThan(res.iteraciones[k - 1].error);
      }
    });

    test('la razón media de reducción del error es menor que 0.5', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-10 });
      const errores = res.iteraciones.map((it) => it.error);
      const pasos = errores.length - 1;

      // Tasa geométrica media: (e_final / e_inicial)^(1 / pasos)
      const tasaMedia = (errores[pasos] / errores[0]) ** (1 / pasos);

      expect(tasaMedia).toBeGreaterThan(0);
      expect(tasaMedia).toBeLessThan(0.5);
    });

    test('Gauss-Seidel converge más rápido en un sistema más dominante', () => {
      // Misma estructura, pero con diagonal 20 en lugar de 4/5
      const A = [
        [20, 1, 1],
        [1, 20, 1],
        [1, 1, 20]
      ];
      const b = [22, 22, 22];

      const dominante = gaussSeidel({ A, b, tolerancia: 1e-10 });
      const referencia = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-10 });

      expect(dominante.convergio).toBe(true);
      expect(dominante.iteraciones.length).toBeLessThan(referencia.iteraciones.length);
    });

    test('converge en un sistema 10x10 con error relativo muy pequeño', () => {
      // A = 20 en la diagonal y 1 fuera de ella; b = suma de cada fila,
      // de modo que la solución exacta es el vector de unos.
      const n = 10;
      const A = Array.from({ length: n }, (_, i) =>
        Array.from({ length: n }, (_, j) => (i === j ? 20 : 1))
      );
      const b = A.map((fila) => fila.reduce((acum, val) => acum + val, 0));
      const exacta = new Array(n).fill(1);

      const res = gaussSeidel({ A, b, tolerancia: 1e-10, maxIter: 200 });

      expect(res.convergio).toBe(true);
      expect(res.resultado).toHaveLength(n);
      expect(errorRelativo(res.resultado, exacta)).toBeLessThan(1e-9);
    });

    test('converge lentamente en un sistema SPD débilmente dominante', () => {
      // Matriz tridiagonal (2, -1) simétrica definida positiva, solución (1, 1, 1).
      // Radio espectral de Gauss-Seidel = 0.5, así que necesita más iteraciones
      // que el sistema estrictamente dominante, pero converge.
      const A = [
        [2, -1, 0],
        [-1, 2, -1],
        [0, -1, 2]
      ];
      const b = [1, 0, 1];

      const res = gaussSeidel({ A, b, maxIter: 200 });
      const referencia = gaussSeidel({ A: A_DOM, b: B_DOM });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones.length).toBeGreaterThan(referencia.iteraciones.length);
      expect(errorRelativo(res.resultado, [1, 1, 1])).toBeLessThan(1e-5);
    });
  });

  describe('detección de no convergencia y divergencia', () => {
    // Sistema no diagonalmente dominante: x + 2y = 3, 3x + y = 4 (solución (1, 1)).
    // La iteración de Gauss-Seidel resulta y_{k+1} = -5 + 6 y_k, con radio
    // espectral 6 > 1, por lo que el método diverge.
    const A_DIVERGE = [
      [1, 2],
      [3, 1]
    ];
    const B_DIVERGE = [3, 4];

    test('detecta divergencia: convergio es false y el mensaje lo indica', () => {
      const res = gaussSeidel({ A: A_DIVERGE, b: B_DIVERGE, maxIter: 20 });

      expect(res.convergio).toBe(false);
      expect(res.mensaje).toMatch(/sin converger/);
      expect(res.mensaje).toMatch(/20/);
    });

    test('en divergencia el error de paso crece en cada iteración', () => {
      const res = gaussSeidel({ A: A_DIVERGE, b: B_DIVERGE, maxIter: 20 });

      for (let k = 1; k < res.iteraciones.length; k++) {
        expect(res.iteraciones[k].error).toBeGreaterThan(res.iteraciones[k - 1].error);
      }
    });

    test('en divergencia el error final es mucho mayor que el inicial', () => {
      const res = gaussSeidel({ A: A_DIVERGE, b: B_DIVERGE, maxIter: 20 });

      const errorInicial = res.iteraciones[0].error;
      const errorFinal = res.iteraciones[res.iteraciones.length - 1].error;

      expect(errorFinal).toBeGreaterThan(1000 * errorInicial);
    });

    test('en divergencia la solución se aleja de la solución exacta', () => {
      const res = gaussSeidel({ A: A_DIVERGE, b: B_DIVERGE, maxIter: 20 });

      expect(errorRelativo(res.resultado, [1, 1])).toBeGreaterThan(1e3);
    });

    test('en divergencia se agotan exactamente maxIter iteraciones', () => {
      const res = gaussSeidel({ A: A_DIVERGE, b: B_DIVERGE, maxIter: 15 });

      expect(res.iteraciones.length).toBe(15);
      expect(res.iteraciones[14].n).toBe(15);
    });

    test('no converge si la tolerancia es inalcanzable con pocas iteraciones', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-12, maxIter: 5 });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones.length).toBe(5);
      expect(res.mensaje).toMatch(/sin converger/);
    });

    test('nunca ejecuta más iteraciones que maxIter', () => {
      const A = [
        [2, -1, 0],
        [-1, 2, -1],
        [0, -1, 2]
      ];
      const b = [1, 0, 1];

      const res = gaussSeidel({ A, b, maxIter: 3 });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones.length).toBe(3);
    });

    test('con maxIter agotado el resultado devuelto es la última iteración', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, maxIter: 3, tolerancia: 1e-12 });

      expect(res.resultado).toEqual(res.iteraciones[2].x);
    });

    test('al converger el mensaje indica el número de iteraciones', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-6 });

      expect(res.convergio).toBe(true);
      expect(res.mensaje).toContain(String(res.iteraciones.length));
    });
  });

  describe('contrato del resultado y errores de entrada', () => {
    test('el resultado sigue el contrato de ChuspaNumeric', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM, tolerancia: 1e-8, maxIter: 50 });

      expect(res).toHaveProperty('resultado');
      expect(res).toHaveProperty('iteraciones');
      expect(res).toHaveProperty('convergio');
      expect(res).toHaveProperty('mensaje');
      expect(res.meta.metodo).toBe('gauss-seidel');
      expect(res.meta.parametros.tolerancia).toBe(1e-8);
      expect(res.meta.parametros.maxIter).toBe(50);
      expect(typeof res.meta.tiempo_ms).toBe('number');
    });

    test('el resultado de un sistema convergente es finito', () => {
      const res = gaussSeidel({ A: A_DOM, b: B_DOM });

      res.resultado.forEach((valor) => {
        expect(Number.isFinite(valor)).toBe(true);
      });
    });

    test('el elemento diagonal cero lanza ErrorDominio con prefijo de la función', () => {
      const A = [
        [4, 1, 1],
        [1, 0, 1],
        [1, 1, 4]
      ];

      expect(() => gaussSeidel({ A, b: B_DOM })).toThrow(ErrorDominio);
      expect(() => gaussSeidel({ A, b: B_DOM })).toThrow(/^ChuspaNumeric\.gaussSeidel:/);
    });

    test.each([
      ['A no es un array', { A: 'hola', b: [1, 2] }],
      ['A vacía', { A: [], b: [] }],
      ['A no cuadrada', { A: [[1, 2, 3], [4, 5, 6]], b: [1, 2] }],
      ['b con longitud incorrecta', { A: A_DOM, b: [9, 14] }],
      ['b con NaN', { A: A_DOM, b: [9, NaN, 15] }],
      ['b con string', { A: A_DOM, b: [9, '14', 15] }],
      ['x0 con longitud incorrecta', { A: A_DOM, b: B_DOM, x0: [0, 0] }],
      ['x0 con Infinity', { A: A_DOM, b: B_DOM, x0: [0, Infinity, 0] }],
      ['tolerancia cero', { A: A_DOM, b: B_DOM, tolerancia: 0 }],
      ['tolerancia negativa', { A: A_DOM, b: B_DOM, tolerancia: -1e-6 }],
      ['tolerancia NaN', { A: A_DOM, b: B_DOM, tolerancia: NaN }],
      ['maxIter cero', { A: A_DOM, b: B_DOM, maxIter: 0 }],
      ['maxIter negativo', { A: A_DOM, b: B_DOM, maxIter: -5 }],
      ['maxIter no entero', { A: A_DOM, b: B_DOM, maxIter: 1.5 }]
    ])('rechaza entrada inválida (%s) con ErrorParametros', (_desc, entrada) => {
      const error = capturar(() => gaussSeidel(entrada));

      expect(error).toBeInstanceOf(ErrorParametros);
      // Un TypeError indicaría un fallo no controlado, no una validación
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/^ChuspaNumeric\.gaussSeidel:/);
    });
  });
});
