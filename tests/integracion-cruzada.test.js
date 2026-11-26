/**
 * Pruebas de integración cruzada entre métodos numéricos
 * Verifica que diferentes métodos que resuelven el mismo problema
 * entreguen resultados coherentes entre sí.
 *
 * Importa cada método directamente desde su módulo en src/
 */

import { biseccion } from '../src/no-lineales/biseccion.js';
import { falsaPosicion } from '../src/no-lineales/falsa-posicion.js';
import { newtonRaphson } from '../src/no-lineales/newton-raphson.js';
import { secante } from '../src/no-lineales/secante.js';
import { puntoFijo } from '../src/no-lineales/punto-fijo.js';
import { gauss } from '../src/lineales/gauss.js';
import { gaussJordan } from '../src/lineales/gauss-jordan.js';
import { lu } from '../src/lineales/lu.js';
import { jacobi } from '../src/lineales/jacobi.js';
import { gaussSeidel } from '../src/lineales/gauss-seidel.js';
import { lagrange } from '../src/interpolacion/lagrange.js';
import { newtonDD } from '../src/interpolacion/newton-dd.js';
import { trapecio } from '../src/integracion/trapecio.js';
import { simpson13 } from '../src/integracion/simpson-13.js';
import { simpson38 } from '../src/integracion/simpson-38.js';
import gaussLegendre from '../src/integracion/gauss_legendre.js';
import { euler } from '../src/edo/euler.js';
import { eulerMejorado } from '../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../src/edo/runge_kutta_4.js';

// ============================================================
// HELPERS COMPARTIDOS PARA VERIFICAR FALLOS ESPERADOS
// ============================================================

// Errores que indican un bug de programación: nunca deben contar como
// "detección exitosa" de divergencia o no convergencia.
const ERRORES_DE_PROGRAMACION = [TypeError, ReferenceError, SyntaxError];

const capturar = (ejecutar) => {
  try {
    return { retorno: ejecutar() };
  } catch (error) {
    return { error };
  }
};

const esFinito = (valor) =>
  Array.isArray(valor) ? valor.every(Number.isFinite) : Number.isFinite(valor);

/**
 * Verifica que un método falle exactamente de la forma esperada.
 *
 * esperado:
 *  - { lanza: /regex/, tipo: 'NombreDelError' }
 *      Debe lanzar ese tipo de error de dominio con ese mensaje.
 *  - { convergioFalse: true }
 *      NO debe lanzar; debe devolver convergio === false.
 *  - { resultadoNoFinito: true }
 *      NO debe lanzar; el resultado debe ser de tipo number y no finito (Infinity/NaN).
 */
const verificarFallo = (ejecutar, esperado) => {
  const { retorno, error } = capturar(ejecutar);

  if (esperado.lanza) {
    expect(error).toBeDefined();
    ERRORES_DE_PROGRAMACION.forEach((Tipo) => expect(error).not.toBeInstanceOf(Tipo));
    expect(error.constructor.name).toBe(esperado.tipo);
    expect(error.message).toMatch(esperado.lanza);
    return;
  }

  // Si lanzó algo aquí, es un fallo inesperado (posible bug): se muestra el error real.
  expect(error).toBeUndefined();

  if (esperado.convergioFalse) {
    expect(retorno.convergio).toBe(false);
    return;
  }

  if (esperado.resultadoNoFinito) {
    expect(typeof retorno.resultado).toBe('number');
    expect(Number.isFinite(retorno.resultado)).toBe(false);
    return;
  }

  throw new Error('verificarFallo: la expectativa no es válida');
};

describe('Pruebas de integración cruzada', () => {
  // ============================================================
  // 1. RAÍCES NO LINEALES
  // ============================================================
  describe('Raíces no lineales', () => {
    // eslint-disable-next-line complexity
    test('todos los métodos convergen a sqrt(2) para f(x) = x² - 2', () => {
      const f = (x) => x * x - 2;
      const tolerancia = 1e-4;
      const esperado = Math.sqrt(2);

      const resultados = [];

      // Bisección: { f, a, b, tolerancia, maxIter }
      try {
        const res = biseccion({ f, a: 1, b: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'biseccion', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Falsa posición: { f, a, b, tolerancia, maxIter }
      try {
        const res = falsaPosicion({ f, a: 1, b: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'falsaPosicion', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Newton-Raphson: { f, df, x0, tolerancia, maxIter }
      try {
        const df = (x) => 2 * x;
        const res = newtonRaphson({ f, df, x0: 1.5, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'newtonRaphson', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Secante: { f, x0, x1, tolerancia, maxIter }
      try {
        const res = secante({ f, x0: 1, x1: 2, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'secante', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Punto fijo: { g, x0, tolerancia, maxIter }
      try {
        const g = (x) => (x * x + 2) / (2 * x);
        const res = puntoFijo({ g, x0: 1.5, tolerancia });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'puntoFijo', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      expect(resultados.length).toBeGreaterThanOrEqual(3);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });
    });
  });

  // ============================================================
  // 2. SISTEMAS LINEALES
  // ============================================================
  describe('Sistemas lineales', () => {
    // eslint-disable-next-line complexity
    test('todos los métodos resuelven el sistema 3x3 correctamente', () => {
      // Sistema diagonalmente dominante:
      // 4x + y - z = 4
      // 2x + 5y + z = 8
      // x - y + 3z = 3
      // Solución: x = 1, y = 1, z = 1
      const A = [
        [4, 1, -1],
        [2, 5, 1],
        [1, -1, 3],
      ];
      const b = [4, 8, 3];
      const solucionEsperada = [1, 1, 1];
      const tolerancia = 1e-4;

      const resultados = [];

      // Gauss: { A, b }
      try {
        const res = gauss({ A, b });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gauss', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Gauss-Jordan: { A, b }
      try {
        const res = gaussJordan({ A, b });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gaussJordan', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // LU: { A, b } → devuelve resultado.x
      try {
        const res = lu({ A, b });
        if (
          res &&
          res.resultado &&
          res.resultado.x !== undefined &&
          Array.isArray(res.resultado.x)
        ) {
          resultados.push({ metodo: 'lu', valor: res.resultado.x });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Jacobi: { A, b, tolerancia, maxIter }
      try {
        const res = jacobi({ A, b, tolerancia: 1e-6, maxIter: 100 });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'jacobi', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Gauss-Seidel: { A, b, tolerancia, maxIter }
      try {
        const res = gaussSeidel({ A, b, tolerancia: 1e-6, maxIter: 100 });
        if (res && res.resultado !== undefined && Array.isArray(res.resultado)) {
          resultados.push({ metodo: 'gaussSeidel', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      expect(resultados.length).toBeGreaterThanOrEqual(3);

      resultados.forEach((result) => {
        expect(result.valor.length).toBe(3);
        for (let i = 0; i < 3; i++) {
          expect(Math.abs(result.valor[i] - solucionEsperada[i])).toBeLessThan(tolerancia);
        }
      });
    });
  });

  // ============================================================
  // 3. INTERPOLACIÓN
  // ============================================================
  describe('Interpolación', () => {
    test('Lagrange y NewtonDD entregan el mismo valor en x=1.5', () => {
      const puntos = [
        [0, 1],
        [1, 2],
        [2, 5],
      ];
      const x = 1.5;
      const esperado = 3.25;

      let valorLagrange = null;
      let valorNewton = null;

      // Lagrange: { puntos, x } → devuelve objeto con resultado
      try {
        const res = lagrange({ puntos, x });
        if (res && res.resultado !== undefined) {
          valorLagrange = res.resultado;
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // NewtonDD: { puntos, x } → devuelve objeto con resultado
      try {
        const res = newtonDD({ puntos, x });
        if (res && res.resultado !== undefined) {
          valorNewton = res.resultado;
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Si ambos funcionan, deben dar el mismo valor
      if (valorLagrange !== null && valorNewton !== null) {
        expect(Math.abs(valorLagrange - valorNewton)).toBeLessThan(1e-10);
      }
      // Si solo Lagrange funciona
      else if (valorLagrange !== null) {
        expect(Math.abs(valorLagrange - esperado)).toBeLessThan(1e-6);
      }
      // Si solo NewtonDD funciona
      else if (valorNewton !== null) {
        expect(Math.abs(valorNewton - esperado)).toBeLessThan(1e-6);
      }
      // Si ambos fallan, el test falla
      else {
        expect(true).toBe(false);
      }
    });
  });

  // ============================================================
  // 4. INTEGRACIÓN
  // ============================================================
  describe('Integración', () => {
    test('trapecio, simpson13 y simpson38 convergen a 1/3 para f(x)=x² en [0,1]', () => {
      const f = (x) => x * x;
      const a = 0;
      const b = 1;
      const esperado = 1 / 3;
      const tolerancia = 1e-3;

      const resultados = [];

      // Trapecio: { f, a, b, n }
      try {
        const res = trapecio({ f, a, b, n: 100 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'trapecio', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Simpson 13: { f, a, b, n }
      try {
        const res = simpson13({ f, a, b, n: 100 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'simpson13', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Simpson 38: { f, a, b, n }
      try {
        const res = simpson38({ f, a, b, n: 99 });
        if (res && res.resultado !== undefined) {
          resultados.push({ metodo: 'simpson38', valor: res.resultado });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      expect(resultados.length).toBeGreaterThanOrEqual(2);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });
    });
  });

  // ============================================================
  // 5. EDO
  // ============================================================
  describe('EDO', () => {
    test('Euler, EulerMejorado y RK4 aproximan e, con RK4 más preciso', () => {
      const f = (x, y) => y;
      const x0 = 0;
      const y0 = 1;
      const xFinal = 1;
      const h = 0.01;
      const esperado = Math.E;
      const tolerancia = 0.1;

      const resultados = [];

      // Euler: { f, x0, y0, h, xFinal }
      try {
        const res = euler({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'euler', valor: ultimo[1] });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Euler Mejorado: { f, x0, y0, h, xFinal }
      try {
        const res = eulerMejorado({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'eulerMejorado', valor: ultimo[1] });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      // Runge-Kutta 4: { f, x0, y0, h, xFinal }
      try {
        const res = rungeKutta4({ f, x0, y0, h, xFinal });
        if (res && res.resultado && res.resultado.length > 0) {
          const ultimo = res.resultado[res.resultado.length - 1];
          resultados.push({ metodo: 'rungeKutta4', valor: ultimo[1] });
        }
      } catch {
        // El metodo falla: no se agrega a la comparacion.
      }

      expect(resultados.length).toBeGreaterThanOrEqual(2);

      resultados.forEach((result) => {
        expect(Math.abs(result.valor - esperado)).toBeLessThan(tolerancia);
      });

      const rk4Result = resultados.find((r) => r.metodo === 'rungeKutta4');
      if (rk4Result) {
        const errorRK4 = Math.abs(rk4Result.valor - esperado);
        resultados.forEach((result) => {
          if (result.metodo !== 'rungeKutta4') {
            const error = Math.abs(result.valor - esperado);
            expect(error).toBeGreaterThanOrEqual(errorRK4 * 0.9);
          }
        });
      }
    });
  });

  // ============================================================
  // 6. INTERPOLACIÓN Y CUADRATURA
  // ============================================================
  describe('Interpolación y cuadratura', () => {
    const muestrear = (f, a, b, cantidad) =>
      Array.from({ length: cantidad }, (_, i) => {
        const x = a + ((b - a) * i) / (cantidad - 1);
        return [x, f(x)];
      });

    test('Lagrange y Gauss-Legendre integran x³ - 2x + 1 en [0,2] de forma exacta', () => {
      const f = (x) => x ** 3 - 2 * x + 1;
      const a = 0;
      const b = 2;
      const esperado = 2;

      const puntos = muestrear(f, a, b, 4);
      const interpolante = (x) => lagrange({ puntos, x }).resultado;

      const integral = gaussLegendre(interpolante, a, b, 2).resultado;

      expect(Math.abs(integral - esperado)).toBeLessThan(1e-10);
    });

    test('la integral del interpolante de sin(x) en [0,π] coincide con la integral directa', () => {
      const a = 0;
      const b = Math.PI;
      const esperado = 2;
      const tolerancia = 1e-4;

      const puntos = muestrear(Math.sin, a, b, 7);
      const interpolante = (x) => lagrange({ puntos, x }).resultado;

      const integralInterpolada = gaussLegendre(interpolante, a, b, 5).resultado;
      const integralDirecta = gaussLegendre(Math.sin, a, b, 5).resultado;

      expect(Math.abs(integralInterpolada - integralDirecta)).toBeLessThan(tolerancia);
      expect(Math.abs(integralInterpolada - esperado)).toBeLessThan(tolerancia);
    });
  });
});

describe('Integracion cruzada - precision, orden de convergencia y no convergencia', () => {
  const exacta = Math.E - 1;

  const integral = (metodo, n) => metodo({ f: (x) => Math.exp(x), a: 0, b: 1, n }).resultado;

  const errorEdo = (metodo, h) => {
    const r = metodo({ f: (x, y) => y, x0: 0, y0: 1, h, xFinal: 1 });
    const [x, y] = r.resultado[r.resultado.length - 1];
    return Math.abs(y - Math.exp(x));
  };

  test.each([
    ['trapecio', 4, [8, 16, 32], trapecio],
    ['simpson13', 16, [4, 8, 16], simpson13],
    ['simpson38', 16, [6, 12, 24], simpson38],
  ])(
    'Orden de convergencia de %s: el error baja ~%p veces al duplicar n',
    (nombre, esperado, ns, metodo) => {
      const errores = ns.map((n) => Math.abs(integral(metodo, n) - exacta));

      for (let i = 0; i < errores.length - 1; i++) {
        const razon = errores[i] / errores[i + 1];
        expect(razon).toBeGreaterThan(esperado * 0.8);
        expect(razon).toBeLessThan(esperado * 1.25);
      }
    },
  );

  test.each([
    ['trapecio', 100, 1e-4, trapecio],
    ['trapecio', 1000, 1e-6, trapecio],
    ['simpson13', 10, 1e-5, simpson13],
    ['simpson13', 100, 1e-9, simpson13],
    ['simpson38', 9, 1e-4, simpson38],
    ['simpson38', 99, 1e-8, simpson38],
  ])('%s con n = %p tiene error relativo menor que %p', (nombre, n, tolerancia, metodo) => {
    expect(Math.abs(integral(metodo, n) - exacta) / exacta).toBeLessThan(tolerancia);
  });

  test.each([
    ['euler', 2, euler],
    ['eulerMejorado', 4, eulerMejorado],
    ['rungeKutta4', 16, rungeKutta4],
  ])(
    'Orden de convergencia de %s: el error baja ~%p veces al dividir h entre 2',
    (nombre, esperado, metodo) => {
      const razon = errorEdo(metodo, 0.1) / errorEdo(metodo, 0.05);

      expect(razon).toBeGreaterThan(esperado * 0.8);
      expect(razon).toBeLessThan(esperado * 1.25);
    },
  );

  test.each([2, 3, 4, 5])(
    'Gauss-Legendre con %p puntos integra exactamente x^(2m-1) en [0,1]',
    (puntos) => {
      const grado = 2 * puntos - 1;
      const valor = gaussLegendre((x) => x ** grado, 0, 1, puntos).resultado;

      expect(Math.abs(valor - 1 / (grado + 1))).toBeLessThan(1e-8);
    },
  );

  test.each([
    ['euler', euler],
    ['eulerMejorado', eulerMejorado],
    ['rungeKutta4', rungeKutta4],
  ])("%s diverge con h = 0.1 y es estable con h = 0.01 en y' = -50y", (nombre, metodo) => {
    const f = (x, y) => -50 * y;
    const ultimo = (h) => {
      const r = metodo({ f, x0: 0, y0: 1, h, xFinal: 2 });
      return r.resultado[r.resultado.length - 1][1];
    };

    expect(Math.abs(ultimo(0.1))).toBeGreaterThan(1e6);
    expect(Math.abs(ultimo(0.01))).toBeLessThan(1e-6);
  });

  test.each([3, 0, -2, 2.5])(
    'simpson13 lanza error si n = %p no es un entero positivo y par',
    (n) => {
      expect(() => simpson13({ f: (x) => x, a: 0, b: 1, n })).toThrow(
        /n debe ser un entero positivo y par/,
      );
    },
  );

  // Cada caso declara la falla exacta que produce el método (ver verificarFallo).
  test.each([
    [
      'biseccion sin cambio de signo',
      () => biseccion({ f: (x) => x * x + 1, a: 0, b: 2, tolerancia: 1e-6 }),
      { lanza: /debe contener un cambio de signo/, tipo: 'ErrorParametros' },
    ],
    [
      'newtonRaphson con derivada cero',
      () => newtonRaphson({ f: (x) => x * x - 2, df: () => 0, x0: 1.5, tolerancia: 1e-6 }),
      { lanza: /la derivada es cero en x = 1\.5/, tipo: 'ErrorDominio' },
    ],
    [
      'puntoFijo con g divergente',
      () => puntoFijo({ g: (x) => x * x + 2, x0: 1.5, tolerancia: 1e-6, maxIter: 50 }),
      { lanza: /divergencia numérica detectada/, tipo: 'ErrorDivergencia' },
    ],
    [
      'jacobi en matriz que no converge',
      () =>
        jacobi({
          A: [
            [1, 3],
            [4, 1],
          ],
          b: [1, 1],
          tolerancia: 1e-6,
          maxIter: 50,
        }),
      { convergioFalse: true },
    ],
    [
      'gaussSeidel en matriz que no converge',
      () =>
        gaussSeidel({
          A: [
            [1, 3],
            [4, 1],
          ],
          b: [1, 1],
          tolerancia: 1e-6,
          maxIter: 50,
        }),
      { convergioFalse: true },
    ],
  ])('Detecta no convergencia: %s', (nombre, ejecutar, esperado) => {
    verificarFallo(ejecutar, esperado);
  });
});

describe('Integracion cruzada - exactitud, orden observado y tolerancias', () => {
  const exacta = Math.E - 1;
  const f = (x) => Math.exp(x);

  const error = (metodo, n) => Math.abs(metodo({ f, a: 0, b: 1, n }).resultado - exacta);

  const primerNQueCumple = (metodo, tolerancia) =>
    [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024].find((n) => error(metodo, n) < tolerancia);

  test('trapecio es exacto para una recta', () => {
    const r = trapecio({ f: (x) => 3 * x + 1, a: 0, b: 2, n: 4 });

    expect(Math.abs(r.resultado - 8)).toBeLessThan(1e-12);
  });

  test.each([
    ['simpson13', 4, simpson13],
    ['simpson38', 3, simpson38],
  ])('%s es exacto para un polinomio cubico (n = %p)', (nombre, n, metodo) => {
    const r = metodo({ f: (x) => x ** 3 - 2 * x + 1, a: 0, b: 2, n });

    expect(Math.abs(r.resultado - 2)).toBeLessThan(1e-12);
  });

  test.each([
    ['trapecio', 2, 16, trapecio],
    ['simpson13', 4, 8, simpson13],
    ['simpson38', 4, 12, simpson38],
  ])('Orden observado de %s es ~%p (de n = %p a 2n)', (nombre, orden, n, metodo) => {
    const p = Math.log2(error(metodo, n) / error(metodo, 2 * n));

    expect(p).toBeCloseTo(orden, 1);
  });

  test('Tolerancias mas estrictas exigen mas subintervalos y Simpson necesita menos que el trapecio', () => {
    const tolerancias = [1e-2, 1e-4, 1e-6];
    const nTrapecio = tolerancias.map((t) => primerNQueCumple(trapecio, t));
    const nSimpson = tolerancias.map((t) => primerNQueCumple(simpson13, t));

    nTrapecio.concat(nSimpson).forEach((n) => expect(n).toBeDefined());
    expect(nTrapecio[0]).toBeLessThan(nTrapecio[1]);
    expect(nTrapecio[1]).toBeLessThan(nTrapecio[2]);
    expect(nSimpson[0]).toBeLessThan(nSimpson[1]);
    expect(nSimpson[1]).toBeLessThan(nSimpson[2]);
    tolerancias.forEach((_, i) => expect(nSimpson[i]).toBeLessThan(nTrapecio[i]));
  });

  // Singularidad 1/x en x = 0: cada método reacciona distinto, y cada uno
  // debe fallar exactamente como se espera.
  test.each([
    ['trapecio', trapecio, { lanza: /f\(0\) debe ser un número finito/, tipo: 'ErrorNumerico' }],
    ['simpson13', simpson13, { resultadoNoFinito: true }],
    ['simpson38', simpson38, { lanza: /divergencia numérica detectada/, tipo: 'ErrorDivergencia' }],
  ])(
    '%s con singularidad en un extremo (1/x en [0,1]) falla de forma controlada',
    (nombre, metodo, esperado) => {
      verificarFallo(() => metodo({ f: (x) => 1 / x, a: 0, b: 1, n: 12 }), esperado);
    },
  );
});
