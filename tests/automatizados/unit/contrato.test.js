import { crearResultado, medirTiempo } from '../../../src/core/contrato.js';
import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';
import { biseccion } from '../../../src/no-lineales/biseccion.js';
import { secante } from '../../../src/no-lineales/secante.js';
import { errorRelativo } from '../../../src/utils/error_relativo.js';

describe('crearResultado', () => {
  test('devuelve el resultado con los valores predeterminados', () => {
    const resultado = crearResultado({ resultado: 5 });

    expect(resultado).toStrictEqual({
      resultado: 5,
      iteraciones: [],
      convergio: false,
      mensaje: '',
      meta: {
        metodo: '',
        parametros: {},
        tiempo_ms: 0,
      },
    });
  });

  test('omite la propiedad warnings cuando no se pasan advertencias', () => {
    const resultado = crearResultado({ resultado: 5 });

    expect(resultado).not.toHaveProperty('warnings');
  });

  test('incluye la propiedad warnings con las advertencias recibidas', () => {
    const resultado = crearResultado({ resultado: 5, warnings: ['x'] });

    expect(resultado).toHaveProperty('warnings', ['x']);
  });
});

describe('medirTiempo', () => {
  test('devuelve el valor de la función y un tiempo numérico no negativo', () => {
    const resultado = medirTiempo(() => 42);

    expect(resultado.valor).toBe(42);
    expect(typeof resultado.tiempo_ms).toBe('number');
    expect(resultado.tiempo_ms).toBeGreaterThanOrEqual(0);
  });

  test('lanza TypeError cuando el argumento no es una función', () => {
    expect(() => medirTiempo(5)).toThrow(TypeError);
  });
});

describe('contrato - precision y convergencia', () => {
  const f = (x) => x * x - 2;
  const df = (x) => 2 * x;
  const raizExacta = Math.SQRT2;

  test.each([1e-3, 1e-6, 1e-10])(
    'Newton-Raphson respeta la tolerancia %p',
    (tolerancia) => {
      const resultado = newtonRaphson({
        f,
        df,
        x0: 1,
        tolerancia,
        maxIter: 100,
      });

      expect(resultado.convergio).toBe(true);
      expect(resultado.resultado).toBeCloseTo(raizExacta, 8);
      expect(resultado.meta.metodo).toBe('newton-raphson');
      expect(resultado.meta.parametros.tolerancia).toBe(tolerancia);
      expect(resultado.meta.tiempo_ms).toBeGreaterThanOrEqual(0);
    }
  );

  test('una tolerancia más estricta mejora la precisión de Newton-Raphson', () => {
    const aproximacionMenosPrecisa = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-3,
    });

    const aproximacionMasPrecisa = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-10,
    });

    const errorMenosPreciso = Math.abs(
      aproximacionMenosPrecisa.resultado - raizExacta
    );

    const errorMasPreciso = Math.abs(
      aproximacionMasPrecisa.resultado - raizExacta
    );

    expect(errorMasPreciso).toBeLessThan(errorMenosPreciso);
  });

  test.each([1e-2, 1e-5, 1e-8])(
    'bisección alcanza la convergencia con tolerancia %p',
    (tolerancia) => {
      const resultado = biseccion({
        f,
        a: 1,
        b: 2,
        tolerancia,
        maxIter: 200,
      });

      expect(resultado.convergio).toBe(true);
      expect(Math.abs(resultado.resultado - raizExacta)).toBeLessThan(tolerancia);
      expect(resultado.meta.metodo).toBe('biseccion');
      expect(resultado.iteraciones.length).toBeGreaterThan(0);
      expect(resultado.iteraciones.at(-1).error).toBeLessThan(tolerancia);
    }
  );

  test('bisección mejora la precisión al reducir el tamaño del intervalo', () => {
    const intervaloAmplio = biseccion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-5,
    });

    const intervaloReducido = biseccion({
      f,
      a: 1.4,
      b: 1.5,
      tolerancia: 1e-5,
    });

    const errorAmplio = Math.abs(intervaloAmplio.resultado - raizExacta);
    const errorReducido = Math.abs(intervaloReducido.resultado - raizExacta);

    expect(errorReducido).toBeLessThan(errorAmplio);
  });

  test('secante converge y conserva los datos de sus iteraciones', () => {
    const resultado = secante({
      f,
      x0: 1,
      x1: 2,
      tolerancia: 1e-10,
      maxIter: 100,
    });

    expect(resultado.convergio).toBe(true);
    expect(resultado.resultado).toBeCloseTo(raizExacta, 8);
    expect(resultado.meta.metodo).toBe('secante');
    expect(resultado.iteraciones.length).toBeGreaterThan(0);
    expect(resultado.iteraciones.at(-1).error).toBeLessThan(1e-10);
  });

  test('el error relativo refleja la precisión de la aproximación', () => {
    const resultado = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-10,
    });

    const error = errorRelativo(raizExacta, resultado.resultado);

    expect(error).toBeGreaterThanOrEqual(0);
    expect(error).toBeLessThan(1e-10);
  });

  test('el contrato informa cuando se alcanza el máximo de iteraciones', () => {
    const resultado = biseccion({
      f,
      a: 1,
      b: 2,
      tolerancia: 1e-15,
      maxIter: 2,
    });

    expect(resultado.convergio).toBe(false);
    expect(resultado.iteraciones).toHaveLength(2);
    expect(resultado.mensaje).toMatch(/sin converger/);
    expect(resultado.meta.parametros.maxIter).toBe(2);
  });
  test('Newton-Raphson presenta convergencia cuadrática para una raíz simple', () => {
    const resultado = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-15,
      maxIter: 100,
    });

    const aproximaciones = [
      ...resultado.iteraciones.map((iteracion) => iteracion.x),
      resultado.resultado,
    ];

    const errores = aproximaciones.map((x) => Math.abs(x - raizExacta));

    const ordenEstimado =
      Math.log(errores[3] / errores[2]) /
      Math.log(errores[2] / errores[1]);

    expect(resultado.convergio).toBe(true);
    expect(ordenEstimado).toBeCloseTo(2, 0);
  });

  test('Newton-Raphson presenta convergencia lineal para una raíz múltiple', () => {
    const resultado = newtonRaphson({
      f: (x) => (x - 1) ** 3,
      df: (x) => 3 * (x - 1) ** 2,
      x0: 2,
      tolerancia: 1e-10,
      maxIter: 100,
    });

    const aproximaciones = [
      ...resultado.iteraciones.map((iteracion) => iteracion.x),
      resultado.resultado,
    ];

    const errores = aproximaciones.map((x) => Math.abs(x - 1));

    const ordenEstimado =
      Math.log(errores[3] / errores[2]) /
      Math.log(errores[2] / errores[1]);

    expect(resultado.convergio).toBe(true);
    expect(ordenEstimado).toBeCloseTo(1, 0);
  });
});
