import { sor } from '../../../src/lineales/sor.js';
import { gaussSeidel } from '../../../src/lineales/gauss-seidel.js';
import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';

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
const SOLUCION = [1, 2, 3];

// Sistema simétrico definido positivo (tridiagonal) con solución (1, 1, 1):
//  2x1 -  x2       = 1
// -x1  + 2x2 -  x3 = 0
//       - x2 + 2x3 = 1
const A_TRIDIAGONAL = [
  [2, -1, 0],
  [-1, 2, -1],
  [0, -1, 2]
];
const B_TRIDIAGONAL = [1, 0, 1];

// Sistema NO diagonalmente dominante, con solución (1, 1):
//  x1 + 2x2 = 3
// 3x1 +  x2 = 4
// Su matriz de iteración tiene radio espectral > 1: SOR diverge.
const A_DIVERGE = [
  [1, 2],
  [3, 1]
];
const B_DIVERGE = [3, 4];

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

const norma = (v) => Math.sqrt(v.reduce((acum, val) => acum + val ** 2, 0));
const errorRelativo = (x, exacto) => norma(x.map((val, i) => val - exacto[i])) / norma(exacto);
const errores = (res) => res.iteraciones.map((it) => it.error);

describe('sor - sobre-relajación sucesiva para sistemas lineales', () => {
  describe('convergencia', () => {
    test('resuelve sistema 3x3 con solución analítica conocida', () => {
      const tolerancia = 1e-8;

      const res = sor({ A, b, omega: 1.1, tolerancia });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado[0] - 1)).toBeLessThan(1e-6);
      expect(Math.abs(res.resultado[1] - 2)).toBeLessThan(1e-6);
      expect(Math.abs(res.resultado[2] - 3)).toBeLessThan(1e-6);
    });

    test('con omega = 1 reproduce el comportamiento de Gauss-Seidel', () => {
      const resSor = sor({ A, b, omega: 1 });
      const resGs = gaussSeidel({ A, b });

      expect(resSor.convergio).toBe(resGs.convergio);
      expect(resSor.iteraciones).toHaveLength(resGs.iteraciones.length);
      resSor.iteraciones.forEach((it, k) => {
        expect(it.x).toEqual(resGs.iteraciones[k].x);
        expect(it.error).toBe(resGs.iteraciones[k].error);
      });
      expect(resSor.resultado).toEqual(resGs.resultado);
    });

    test('informa no convergencia al alcanzar maxIter', () => {
      const res = sor({ A, b, omega: 1.2, tolerancia: 1e-15, maxIter: 2 });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(2);
    });
  });

  describe('contrato de resultado', () => {
    test('devuelve la forma uniforme del contrato', () => {
      const res = sor({ A, b, omega: 1.1 });

      expect(res).toHaveProperty('resultado');
      expect(res).toHaveProperty('iteraciones');
      expect(res).toHaveProperty('convergio');
      expect(res).toHaveProperty('mensaje');
      expect(res).toHaveProperty('meta');
      expect(res.meta.metodo).toBe('sor');
      expect(res.meta.parametros.omega).toBe(1.1);
    });

    test('cada iteración registra n, x y error', () => {
      const res = sor({ A, b, omega: 1.1 });

      res.iteraciones.forEach((it, i) => {
        expect(it.n).toBe(i + 1);
        expect(it.x).toHaveLength(3);
        expect(typeof it.error).toBe('number');
      });
    });

    test('meta.parametros refleja los valores recibidos y el tiempo es numérico', () => {
      const res = sor({ A, b, x0: [1, 1, 1], omega: 1.3, tolerancia: 1e-4, maxIter: 50 });

      expect(res.meta.parametros.x0).toEqual([1, 1, 1]);
      expect(res.meta.parametros.omega).toBe(1.3);
      expect(res.meta.parametros.tolerancia).toBe(1e-4);
      expect(res.meta.parametros.maxIter).toBe(50);
      expect(typeof res.meta.tiempo_ms).toBe('number');
    });

    test('aplica los valores por defecto: omega 1, x0 nulo, tolerancia 1e-6 y maxIter 100', () => {
      const res = sor({ A, b });

      expect(res.meta.parametros.omega).toBe(1);
      expect(res.meta.parametros.x0).toEqual([0, 0, 0]);
      expect(res.meta.parametros.tolerancia).toBe(1e-6);
      expect(res.meta.parametros.maxIter).toBe(100);
    });

    test('el resultado coincide con la x de la última iteración', () => {
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-8 });

      expect(res.resultado).toEqual(res.iteraciones[res.iteraciones.length - 1].x);
    });

    test('no modifica los argumentos de entrada', () => {
      const Acopia = A.map((fila) => [...fila]);
      const bCopia = [...b];
      const x0 = [5, -5, 5];
      const x0Copia = [...x0];

      sor({ A: Acopia, b: bCopia, x0, omega: 1.2, tolerancia: 1e-8 });

      expect(Acopia).toEqual(A);
      expect(bCopia).toEqual(b);
      expect(x0).toEqual(x0Copia);
    });
  });

  describe('precisión según la tolerancia', () => {
    // Iteraciones obtenidas replicando el algoritmo (omega = 1.1, x0 = 0).
    test.each([
      [1e-2, 5],
      [1e-4, 8],
      [1e-6, 10],
      [1e-8, 13],
      [1e-10, 15],
      [1e-12, 18]
    ])('tolerancia %p: último paso menor que la tolerancia y error relativo acotado', (tolerancia, esperadas) => {
      const res = sor({ A, b, omega: 1.1, tolerancia, maxIter: 500 });
      const ultimo = res.iteraciones[res.iteraciones.length - 1];

      expect(res.convergio).toBe(true);
      expect(ultimo.error).toBeLessThan(tolerancia);
      expect(errorRelativo(res.resultado, SOLUCION)).toBeLessThanOrEqual(10 * tolerancia);
      // Margen de ±1 iteración para no depender del redondeo exacto.
      expect(res.iteraciones.length).toBeGreaterThanOrEqual(esperadas - 1);
      expect(res.iteraciones.length).toBeLessThanOrEqual(esperadas + 1);
    });

    test('endurecer la tolerancia nunca reduce el número de iteraciones', () => {
      const tolerancias = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12];
      const cantidades = tolerancias.map(
        (tolerancia) => sor({ A, b, omega: 1.1, tolerancia, maxIter: 500 }).iteraciones.length
      );

      for (let k = 1; k < cantidades.length; k++) {
        expect(cantidades[k]).toBeGreaterThanOrEqual(cantidades[k - 1]);
      }
      expect(cantidades[cantidades.length - 1]).toBeGreaterThan(cantidades[0]);
    });

    test('con tolerancia más estricta el error relativo final es menor', () => {
      const floja = sor({ A, b, omega: 1.1, tolerancia: 1e-2, maxIter: 500 });
      const estricta = sor({ A, b, omega: 1.1, tolerancia: 1e-10, maxIter: 500 });

      expect(errorRelativo(estricta.resultado, SOLUCION)).toBeLessThan(
        errorRelativo(floja.resultado, SOLUCION)
      );
    });

    test('tolerancia 1e-6 con omega 1.1: se detiene en la iteración 10 y lo informa', () => {
      // Replicado con script: error(9) = 2.86e-6 >= 1e-6 y error(10) = 5.16e-7 < 1e-6.
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-6 });
      const errs = errores(res);

      expect(res.iteraciones).toHaveLength(10);
      expect(errs[8]).toBeGreaterThanOrEqual(1e-6);
      expect(errs[9]).toBeLessThan(1e-6);
      expect(res.mensaje).toMatch(/Convergió en 10 iteraciones/);
    });

    test('todos los pasos previos al último son mayores o iguales a la tolerancia', () => {
      const tolerancia = 1e-8;
      const res = sor({ A, b, omega: 1.1, tolerancia, maxIter: 500 });
      const previos = errores(res).slice(0, -1);

      previos.forEach((error) => {
        expect(error).toBeGreaterThanOrEqual(tolerancia);
      });
    });
  });

  describe('criterio de parada y tamaño de paso', () => {
    test('primera iteración calculada a mano (2x2, omega = 1.5, x0 = 0)', () => {
      // A = [[4, 1], [1, 3]], b = [1, 2]
      // x1 = (1 - 1.5) * 0 + 1.5 * (1 / 4)           = 0.375
      // x2 = (1 - 1.5) * 0 + 1.5 * ((2 - 0.375) / 3) = 0.8125
      // error = sqrt(0.375^2 + 0.8125^2) = sqrt(0.80078125)
      const res = sor({
        A: [
          [4, 1],
          [1, 3]
        ],
        b: [1, 2],
        omega: 1.5,
        tolerancia: 1e-6,
        maxIter: 1
      });

      expect(res.iteraciones).toHaveLength(1);
      expect(res.iteraciones[0].x[0]).toBeCloseTo(0.375, 12);
      expect(res.iteraciones[0].x[1]).toBeCloseTo(0.8125, 12);
      expect(res.iteraciones[0].error).toBeCloseTo(Math.sqrt(0.80078125), 12);
    });

    test('el error de cada iteración es la norma euclidiana del paso', () => {
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-8 });
      let anterior = [0, 0, 0];

      res.iteraciones.forEach((it) => {
        const paso = norma(it.x.map((val, i) => val - anterior[i]));

        expect(it.error).toBeCloseTo(paso, 12);
        anterior = it.x;
      });
    });

    test('con x0 igual a la solución exacta se detiene en una iteración con paso casi nulo', () => {
      const res = sor({ A, b, x0: [1, 2, 3], omega: 1.1, tolerancia: 1e-6 });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones).toHaveLength(1);
      expect(res.iteraciones[0].error).toBeLessThan(1e-12);
      res.resultado.forEach((val, i) => {
        expect(val).toBeCloseTo(SOLUCION[i], 10);
      });
    });

    test('con x0 lejano converge a la misma solución, pero con más iteraciones', () => {
      const cercano = sor({ A, b, omega: 1.1, tolerancia: 1e-8, maxIter: 500 });
      const lejano = sor({ A, b, x0: [1e4, -1e4, 1e4], omega: 1.1, tolerancia: 1e-8, maxIter: 500 });

      expect(lejano.convergio).toBe(true);
      expect(errorRelativo(lejano.resultado, SOLUCION)).toBeLessThanOrEqual(1e-7);
      expect(lejano.iteraciones.length).toBeGreaterThan(cercano.iteraciones.length);
    });

    test('un x0 distinto de cero no cambia la solución alcanzada', () => {
      const res = sor({ A, b, x0: [10, 10, 10], omega: 1.2, tolerancia: 1e-10, maxIter: 500 });

      expect(res.convergio).toBe(true);
      res.resultado.forEach((val, i) => {
        expect(val).toBeCloseTo(SOLUCION[i], 8);
      });
    });
  });

  describe('orden de convergencia y efecto de omega', () => {
    test('el error de paso decrece en las primeras 8 iteraciones (omega = 1.1)', () => {
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-12, maxIter: 500 });
      const errs = errores(res).slice(0, 8);

      for (let k = 1; k < errs.length; k++) {
        expect(errs[k]).toBeLessThan(errs[k - 1]);
      }
    });

    test('la tasa media de reducción del error es menor que 0.5 (convergencia lineal)', () => {
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-12, maxIter: 500 });
      const errs = errores(res);
      const pasos = errs.length - 1;
      const tasa = Math.pow(errs[errs.length - 1] / errs[0], 1 / pasos);

      expect(tasa).toBeGreaterThan(0);
      expect(tasa).toBeLessThan(0.5);
    });

    test('con omega = 1.9 el sistema favorable converge mucho más lento que con omega = 1', () => {
      const cantidad = (omega) =>
        sor({ A, b, omega, tolerancia: 1e-10, maxIter: 1000 }).iteraciones.length;

      // Replicado con script (tolerancia 1e-10): omega 1 -> 13, 1.5 -> 42, 1.9 -> 261.
      expect(cantidad(1)).toBeLessThan(cantidad(1.5));
      expect(cantidad(1.5)).toBeLessThan(cantidad(1.9));
    });

    test('sub-relajar demasiado (omega = 0.5) necesita más iteraciones que Gauss-Seidel', () => {
      const cantidad = (omega) =>
        sor({ A, b, omega, tolerancia: 1e-10, maxIter: 1000 }).iteraciones.length;

      // omega 0.5 -> 46 iteraciones, omega 1 -> 13.
      expect(cantidad(0.5)).toBeGreaterThan(cantidad(1));
    });

    test('en un sistema simétrico definido positivo, omega ≈ 1.17 acelera frente a Gauss-Seidel', () => {
      const ejecutar = (omega) =>
        sor({
          A: A_TRIDIAGONAL,
          b: B_TRIDIAGONAL,
          omega,
          tolerancia: 1e-10,
          maxIter: 1000
        });

      const gs = ejecutar(1);
      const sobre = ejecutar(1.17);

      // Replicado con script: omega 1 -> 35 iteraciones, omega 1.17 -> 17.
      expect(gs.convergio).toBe(true);
      expect(sobre.convergio).toBe(true);
      expect(sobre.iteraciones.length).toBeLessThan(gs.iteraciones.length);
      sobre.resultado.forEach((val) => {
        expect(val).toBeCloseTo(1, 8);
      });
    });

    test.each([0.5, 0.8, 1, 1.1, 1.5, 1.9])(
      'converge a la solución exacta para omega = %p dentro de (0, 2)',
      (omega) => {
        const res = sor({ A, b, omega, tolerancia: 1e-10, maxIter: 1000 });

        expect(res.convergio).toBe(true);
        expect(errorRelativo(res.resultado, SOLUCION)).toBeLessThanOrEqual(1e-8);
      }
    );
  });

  describe('no convergencia y divergencia', () => {
    test.each([1, 1.2, 0.5])(
      'sistema no favorable (omega = %p): no converge y el error de paso crece',
      (omega) => {
        const res = sor({ A: A_DIVERGE, b: B_DIVERGE, omega, tolerancia: 1e-6, maxIter: 15 });
        const errs = errores(res);

        expect(res.convergio).toBe(false);
        expect(res.iteraciones).toHaveLength(15);
        expect(res.mensaje).toMatch(/sin converger/);
        for (let k = 1; k < errs.length; k++) {
          expect(errs[k]).toBeGreaterThan(errs[k - 1]);
        }
        expect(errs[errs.length - 1]).toBeGreaterThan(1e3 * errs[0]);
      }
    );

    test('en divergencia el resultado sigue siendo finito y está lejos de la solución', () => {
      const res = sor({ A: A_DIVERGE, b: B_DIVERGE, omega: 1, tolerancia: 1e-6, maxIter: 15 });

      res.resultado.forEach((val) => {
        expect(Number.isFinite(val)).toBe(true);
      });
      expect(errorRelativo(res.resultado, [1, 1])).toBeGreaterThan(1e3);
    });

    test.each([1, 3, 7])('agota exactamente maxIter = %p con tolerancia inalcanzable en ese tope', (maxIter) => {
      const res = sor({ A, b, omega: 1.1, tolerancia: 1e-15, maxIter });

      expect(res.convergio).toBe(false);
      expect(res.iteraciones).toHaveLength(maxIter);
      expect(res.iteraciones[maxIter - 1].n).toBe(maxIter);
      expect(res.mensaje).toMatch(new RegExp(`máximo de ${maxIter} iteraciones sin converger`));
    });

    test('un maxIter insuficiente no converge pero con el mismo sistema y más iteraciones sí', () => {
      const corto = sor({ A, b, omega: 1.1, tolerancia: 1e-10, maxIter: 5 });
      const largo = sor({ A, b, omega: 1.1, tolerancia: 1e-10, maxIter: 100 });

      expect(corto.convergio).toBe(false);
      expect(largo.convergio).toBe(true);
    });

    test('con omega muy pequeño (0.05) la convergencia es lenta: el error baja pero poco a poco', () => {
      const res = sor({ A, b, omega: 0.05, tolerancia: 1e-6, maxIter: 5 });
      const errs = errores(res);
      const tasa = Math.pow(errs[errs.length - 1] / errs[0], 1 / (errs.length - 1));

      expect(res.convergio).toBe(false);
      for (let k = 1; k < errs.length; k++) {
        expect(errs[k]).toBeLessThan(errs[k - 1]);
      }
      expect(tasa).toBeGreaterThan(0.9);
      expect(tasa).toBeLessThan(1);
    });
  });

  describe('casos borde', () => {
    test('sistema 1x1 con omega = 1 se resuelve en 2 iteraciones', () => {
      // 2x = 6 -> x = 3. Iteración 1: paso de 3; iteración 2: paso nulo.
      const res = sor({ A: [[2]], b: [6], omega: 1, tolerancia: 1e-10 });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones).toHaveLength(2);
      expect(res.resultado[0]).toBeCloseTo(3, 12);
      expect(res.iteraciones[0].error).toBeCloseTo(3, 12);
    });

    test('sistema 1x1 con omega = 1.5 también converge a 3', () => {
      // Cada paso reduce el error en un factor |1 - omega| = 0.5.
      const res = sor({ A: [[2]], b: [6], omega: 1.5, tolerancia: 1e-10, maxIter: 200 });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(3, 8);
    });

    test('matriz diagonal: con omega = 1 resuelve en 2 iteraciones', () => {
      // 2x1 = 2, 4x2 = 8 -> (1, 2)
      const res = sor({
        A: [
          [2, 0],
          [0, 4]
        ],
        b: [2, 8],
        omega: 1,
        tolerancia: 1e-10
      });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones).toHaveLength(2);
      expect(res.resultado[0]).toBeCloseTo(1, 12);
      expect(res.resultado[1]).toBeCloseTo(2, 12);
    });

    test('diagonal negativa: converge a la solución analítica (5/11, 9/11)', () => {
      // -4x + y = -1 ; x - 3y = -2 -> y = 4x - 1 ; x - 12x + 3 = -2 -> x = 5/11
      const res = sor({
        A: [
          [-4, 1],
          [1, -3]
        ],
        b: [-1, -2],
        omega: 1.1,
        tolerancia: 1e-10,
        maxIter: 200
      });

      expect(res.convergio).toBe(true);
      expect(res.resultado[0]).toBeCloseTo(5 / 11, 8);
      expect(res.resultado[1]).toBeCloseTo(9 / 11, 8);
    });

    test('b igual a cero con x0 = 0 devuelve el vector nulo en una iteración', () => {
      const res = sor({ A, b: [0, 0, 0], omega: 1.1, tolerancia: 1e-6 });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones).toHaveLength(1);
      expect(res.resultado).toEqual([0, 0, 0]);
    });
  });

  describe('validaciones', () => {
    test('lanza ErrorParametros si la matriz no es cuadrada', () => {
      expect(() =>
        sor({
          A: [
            [1, 2, 3],
            [4, 5, 6]
          ],
          b: [1, 2],
          omega: 1.1
        })
      ).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si b tiene dimensión incompatible', () => {
      expect(() => sor({ A, b: [1, 2], omega: 1.1 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si x0 tiene dimensión incompatible', () => {
      expect(() => sor({ A, b, x0: [0, 0], omega: 1.1 })).toThrow(ErrorParametros);
    });

    test.each([0, 2, -0.5, 2.5])('lanza ErrorParametros si omega = %p está fuera de (0, 2)', (omega) => {
      expect(() => sor({ A, b, omega })).toThrow(ErrorParametros);
    });

    test.each([0, 2, -0.5, 2.5])(
      'el mensaje de omega = %p identifica la función, el intervalo y el valor recibido',
      (omega) => {
        const error = capturar(() => sor({ A, b, omega }));

        expect(error).toBeInstanceOf(ErrorParametros);
        expect(error).not.toBeInstanceOf(TypeError);
        expect(error.message).toMatch(/^ChuspaNumeric\.sor: /);
        expect(error.message).toMatch(/omega/);
        expect(error.message).toMatch(/\(0, 2\)/);
        expect(error.message).toContain(`Se recibió: ${omega}`);
      }
    );

    test('lanza ErrorParametros si omega no es un número', () => {
      expect(() => sor({ A, b, omega: '1.2' })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si la tolerancia no es válida', () => {
      expect(() => sor({ A, b, omega: 1.1, tolerancia: -1 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros si maxIter no es válido', () => {
      expect(() => sor({ A, b, omega: 1.1, maxIter: 0 })).toThrow(ErrorParametros);
    });

    test('lanza ErrorDominio si hay un cero en la diagonal', () => {
      expect(() =>
        sor({
          A: [
            [0, 1],
            [1, 2]
          ],
          b: [1, 3],
          omega: 1.1
        })
      ).toThrow(ErrorDominio);
    });

    test.each([
      [
        'primer elemento',
        [
          [0, 1],
          [1, 2]
        ],
        /A\[0\]\[0\]/
      ],
      [
        'último elemento',
        [
          [1, 2],
          [3, 0]
        ],
        /A\[1\]\[1\]/
      ]
    ])('ErrorDominio por cero en la diagonal (%s) indica la posición y no es TypeError', (_desc, M, posicion) => {
      const error = capturar(() => sor({ A: M, b: [1, 1], omega: 1.1 }));

      expect(error).toBeInstanceOf(ErrorDominio);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/^ChuspaNumeric\.sor: /);
      expect(error.message).toMatch(posicion);
    });

    test('los errores de validación se lanzan antes de iterar (sin resultado parcial)', () => {
      const error = capturar(() => sor({ A, b, omega: 2 }));

      expect(error).toBeInstanceOf(ErrorParametros);
    });
  });

  describe('validaciones: mensajes reales por tipo de entrada', () => {
    // Mensajes confirmados con prueba.mjs (el validador usa el prefijo ChuspaNumeric.sor:).
    const entradasInvalidas = [
      ['A no cuadrada', { A: [[1, 2, 3], [4, 5, 6]], b: [1, 2], omega: 1.1 }, /"A" debe ser cuadrada/],
      ['A vacía', { A: [], b: [], omega: 1.1 }, /"A" debe ser una matriz cuadrada no vacía/],
      ['A no es un arreglo', { A: 'hola', b, omega: 1.1 }, /"A" debe ser una matriz cuadrada no vacía/],
      ['A con una cadena', { A: [[4, '1', 1], [1, 5, 1], [1, 1, 4]], b, omega: 1.1 }, /"A\[0\]\[1\]" debe ser un número finito/],
      ['A con Infinity', { A: [[4, Infinity, 1], [1, 5, 1], [1, 1, 4]], b, omega: 1.1 }, /"A\[0\]\[1\]" debe ser un número finito/],
      ['b con longitud incompatible', { A, b: [1, 2], omega: 1.1 }, /"b" debe tener longitud 3/],
      ['b no es un arreglo', { A, b: 'hola', omega: 1.1 }, /"b" debe ser un arreglo de números/],
      ['b con NaN', { A, b: [9, NaN, 15], omega: 1.1 }, /"b\[1\]" debe ser un número finito/],
      ['x0 con longitud incompatible', { A, b, x0: [0, 0], omega: 1.1 }, /"x0" debe tener longitud 3/],
      ['omega NaN', { A, b, omega: NaN }, /"omega" debe ser un número finito/],
      ['omega Infinity', { A, b, omega: Infinity }, /"omega" debe ser un número finito/],
      ['omega cadena', { A, b, omega: '1.2' }, /"omega" debe ser un número finito/],
      ['tolerancia 0', { A, b, omega: 1.1, tolerancia: 0 }, /"tolerancia" debe ser mayor que 0/],
      ['tolerancia negativa', { A, b, omega: 1.1, tolerancia: -1 }, /"tolerancia" debe ser mayor que 0/],
      ['tolerancia NaN', { A, b, omega: 1.1, tolerancia: NaN }, /"tolerancia" debe ser un número finito/],
      ['tolerancia cadena', { A, b, omega: 1.1, tolerancia: '1e-6' }, /"tolerancia" debe ser un número finito/],
      ['maxIter 0', { A, b, omega: 1.1, maxIter: 0 }, /"maxIter" debe ser un entero mayor o igual a 1/],
      ['maxIter negativo', { A, b, omega: 1.1, maxIter: -3 }, /"maxIter" debe ser un entero mayor o igual a 1/],
      ['maxIter no entero', { A, b, omega: 1.1, maxIter: 1.5 }, /"maxIter" debe ser un entero mayor o igual a 1/],
      ['maxIter NaN', { A, b, omega: 1.1, maxIter: NaN }, /"maxIter" debe ser un entero mayor o igual a 1/]
    ];

    test.each(entradasInvalidas)('%s lanza ErrorParametros con mensaje descriptivo', (_desc, entrada, patron) => {
      const error = capturar(() => sor(entrada));

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/^ChuspaNumeric\.sor: /);
      expect(error.message).toMatch(patron);
    });
  });

  describe('exportación', () => {
    test('la función se exporta desde el punto de entrada principal', async () => {
      const { sor: sorDesdeIndex } = await import('../../../src/index.js');

      expect(sorDesdeIndex).toBe(sor);
    });
  });
});
