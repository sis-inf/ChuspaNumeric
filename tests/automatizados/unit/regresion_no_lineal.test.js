import {
  regresionNoLineal,
  ajusteExponencial,
  ajustePotencial,
} from '../../../src/analisis/regresion_no_lineal.js';
import { ErrorParametros, ErrorDominio } from '../../../src/core/errores.js';

// Modelo conocido: y = a · e^(b·x) con a = 2 y b = 0.5
const A_REAL = 2;
const B_REAL = 0.5;
const modelo = (x, [a, b]) => a * Math.exp(b * x);
const jacobianoModelo = (x, [a, b]) => [Math.exp(b * x), a * x * Math.exp(b * x)];
const puntos = [0, 1, 2, 3, 4, 5].map((x) => [x, A_REAL * Math.exp(B_REAL * x)]);

describe('regresionNoLineal - Gauss-Newton', () => {
  describe('ajuste de datos sinteticos', () => {
    test('recupera los parametros del modelo exponencial conocido', () => {
      const res = regresionNoLineal({
        puntos,
        modelo,
        jacobianoModelo,
        parametrosIniciales: [1.5, 0.4],
        tolerancia: 1e-10,
      });

      expect(res.convergio).toBe(true);
      expect(Math.abs(res.resultado[0] - A_REAL)).toBeLessThan(1e-6);
      expect(Math.abs(res.resultado[1] - B_REAL)).toBeLessThan(1e-6);
      expect(res.meta.metodo).toBe('gauss-newton');
    });

    test('las predicciones con los parametros ajustados coinciden con los datos', () => {
      const res = regresionNoLineal({
        puntos,
        modelo,
        jacobianoModelo,
        parametrosIniciales: [1.5, 0.4],
        tolerancia: 1e-10,
      });

      for (const [x, y] of puntos) {
        expect(Math.abs(modelo(x, res.resultado) - y)).toBeLessThan(1e-6);
      }
    });

    test('no modifica los parametros iniciales recibidos', () => {
      const parametrosIniciales = [1.5, 0.4];
      regresionNoLineal({ puntos, modelo, jacobianoModelo, parametrosIniciales });

      expect(parametrosIniciales).toEqual([1.5, 0.4]);
    });
  });

  describe('convergencia y no convergencia', () => {
    test('al converger registra el historial y el ultimo paso queda bajo la tolerancia', () => {
      const tolerancia = 1e-8;
      const res = regresionNoLineal({
        puntos,
        modelo,
        jacobianoModelo,
        parametrosIniciales: [1.5, 0.4],
        tolerancia,
      });

      expect(res.convergio).toBe(true);
      expect(res.iteraciones.length).toBeGreaterThan(1);
      expect(res.iteraciones.at(-1).normaDelta).toBeLessThan(tolerancia);
      expect(res.iteraciones.at(-1).parametros).toEqual(res.resultado);
      expect(res.mensaje).toContain('convergió');
    });

    test('si no alcanza la tolerancia en maxIter devuelve resultado null y convergio false', () => {
      const res = regresionNoLineal({
        puntos,
        modelo,
        jacobianoModelo,
        parametrosIniciales: [1.5, 0.4],
        tolerancia: 1e-12,
        maxIter: 1,
      });

      expect(res.convergio).toBe(false);
      expect(res.resultado).toBeNull();
      expect(res.iteraciones).toHaveLength(1);
      expect(res.mensaje).toContain('no convergió en 1 iteraciones');
    });

    test('lanza ErrorDominio si el Jacobiano deja el sistema singular', () => {
      expect(() =>
        regresionNoLineal({
          puntos,
          modelo: (x, [a, b]) => a + b,
          jacobianoModelo: () => [1, 1],
          parametrosIniciales: [1, 1],
        })
      ).toThrow(ErrorDominio);
    });
  });

  describe('entradas insuficientes o incompatibles', () => {
    const base = { puntos, modelo, jacobianoModelo, parametrosIniciales: [1, 1] };

    test.each([
      ['puntos vacio', { puntos: [] }],
      ['puntos que no es un array', { puntos: 'datos' }],
      ['modelo que no es una funcion', { modelo: 3 }],
      ['jacobiano que no es una funcion', { jacobianoModelo: null }],
      ['parametros iniciales vacios', { parametrosIniciales: [] }],
      ['menos puntos que parametros', { puntos: [[0, 2]] }],
      ['tolerancia no positiva', { tolerancia: 0 }],
      ['tolerancia no numerica', { tolerancia: '1e-6' }],
      ['maxIter cero', { maxIter: 0 }],
      ['maxIter no entero', { maxIter: 2.5 }],
    ])('rechaza %s', (_caso, cambio) => {
      expect(() => regresionNoLineal({ ...base, ...cambio })).toThrow(ErrorParametros);
    });
  });
});

describe('ajusteExponencial', () => {
  test('recupera a y b de datos y = 2·e^(0.5·x)', () => {
    const x = [0, 1, 2, 3, 4];
    const y = x.map((xi) => 2 * Math.exp(0.5 * xi));
    const { resultado, convergio } = ajusteExponencial(x, y);

    expect(convergio).toBe(true);
    expect(resultado.a).toBeCloseTo(2, 10);
    expect(resultado.b).toBeCloseTo(0.5, 10);
  });

  test.each([
    ['longitudes distintas', [0, 1, 2], [1, 2]],
    ['un solo punto', [1], [2]],
    ['valores no finitos', [0, NaN], [1, 2]],
    ['y no positivo', [0, 1], [1, 0]],
    ['abscisas iguales', [1, 1, 1], [2, 3, 4]],
  ])('rechaza %s', (_caso, x, y) => {
    expect(() => ajusteExponencial(x, y)).toThrow(ErrorParametros);
  });
});

describe('ajustePotencial', () => {
  test('recupera a y b de datos y = 3·x^2', () => {
    const x = [1, 2, 3, 4];
    const y = x.map((xi) => 3 * xi ** 2);
    const { resultado, convergio } = ajustePotencial(x, y);

    expect(convergio).toBe(true);
    expect(resultado.a).toBeCloseTo(3, 10);
    expect(resultado.b).toBeCloseTo(2, 10);
  });

  test('rechaza x no positivo', () => {
    expect(() => ajustePotencial([0, 1, 2], [1, 2, 3])).toThrow(ErrorParametros);
  });
});
