import { exportarJSON } from '../../../src/io/exportar_json.js';
import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';
import { errorRelativo } from '../../../src/utils/error_relativo.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

describe('exportarJSON', () => {
  test('exporta correctamente un resultado válido con sus metadatos', () => {
    const resultado = {
      x: 2,
      raiz: 1.4142,
    };

    const metadatos = {
      metodo: 'Newton-Raphson',
      parametros: {
        x0: 1,
        tolerancia: 0.001,
      },
      iteraciones: 5,
    };

    const resultadoJSON = exportarJSON(resultado, metadatos);

    expect(resultadoJSON.metodo).toBe('Newton-Raphson');
    expect(resultadoJSON.parametros).toEqual({
      x0: 1,
      tolerancia: 0.001,
    });
      expect(resultadoJSON.resultado).toEqual(resultado);
      expect(resultadoJSON.iteraciones).toBe(5);
      expect(resultadoJSON.timestamp).toEqual(expect.any(String));
    });

    test('exporta resultados con diferentes tolerancias y conserva los errores relativos', () => {
      const funcion = (x) => x ** 2 - 2;
      const derivada = (x) => 2 * x;

    const resultadoToleranciaAmplia = newtonRaphson({
      f: funcion,
      df: derivada,
      x0: 1,
      tolerancia: 1e-5,
    });

    const resultadoToleranciaEstricta = newtonRaphson({
      f: funcion,
      df: derivada,
      x0: 1,
      tolerancia: 1e-10,
    });

    const errorAmplio = errorRelativo(
      Math.SQRT2,
      resultadoToleranciaAmplia.resultado
    );

    const errorEstricto = errorRelativo(
      Math.SQRT2,
      resultadoToleranciaEstricta.resultado
    );

    const exportacion = exportarJSON(
      resultadoToleranciaEstricta.resultado,
      {
        metodo: resultadoToleranciaEstricta.meta.metodo,
        parametros: resultadoToleranciaEstricta.meta.parametros,
        iteraciones: resultadoToleranciaEstricta.iteraciones,
      }
    );

    expect(resultadoToleranciaAmplia.convergio).toBe(true);
    expect(resultadoToleranciaEstricta.convergio).toBe(true);
    expect(errorEstricto).toBeLessThanOrEqual(errorAmplio);
    expect(exportacion.resultado).toBe(resultadoToleranciaEstricta.resultado);
    expect(exportacion.iteraciones).toEqual(
      resultadoToleranciaEstricta.iteraciones
    );
    expect(exportacion.parametros.tolerancia).toBe(1e-10);
  });

  test('conserva los tamaños de paso de diferentes valores iniciales', () => {
    const funcion = (x) => x ** 2 - 2;
    const derivada = (x) => 2 * x;

    const resultadoInicialUno = newtonRaphson({
      f: funcion,
      df: derivada,
      x0: 1,
      tolerancia: 1e-10,
    });

    const resultadoInicialTres = newtonRaphson({
      f: funcion,
      df: derivada,
      x0: 3,
      tolerancia: 1e-10,
    });

    const pasosUno = resultadoInicialUno.iteraciones.map(
      (iteracion) => iteracion.error
    );

    const pasosTres = resultadoInicialTres.iteraciones.map(
      (iteracion) => iteracion.error
    );

    const exportacionUno = exportarJSON(resultadoInicialUno.resultado, {
      metodo: resultadoInicialUno.meta.metodo,
      parametros: resultadoInicialUno.meta.parametros,
      iteraciones: resultadoInicialUno.iteraciones,
    });

    const exportacionTres = exportarJSON(resultadoInicialTres.resultado, {
      metodo: resultadoInicialTres.meta.metodo,
      parametros: resultadoInicialTres.meta.parametros,
      iteraciones: resultadoInicialTres.iteraciones,
    });

    expect(pasosUno.length).toBeGreaterThan(0);
    expect(pasosTres.length).toBeGreaterThan(0);
    expect(pasosUno[0]).not.toBe(pasosTres[0]);
    expect(exportacionUno.iteraciones).toEqual(resultadoInicialUno.iteraciones);
    expect(exportacionTres.iteraciones).toEqual(resultadoInicialTres.iteraciones);
  });

  test('exporta resultados y conserva el orden de convergencia cuadratica', () => {
    const resultado = newtonRaphson({
      f: (x) => x ** 2 - 2,
      df: (x) => 2 * x,
      x0: 1,
      tolerancia: 1e-10,
    });

    const exportacion = exportarJSON(resultado.resultado, {
      metodo: resultado.meta.metodo,
      parametros: resultado.meta.parametros,
      iteraciones: resultado.iteraciones,
    });

    const aproximaciones = [
      ...exportacion.iteraciones.map((iteracion) => iteracion.x),
      exportacion.resultado,
    ];

    const errores = aproximaciones.map(
      (x) => Math.abs(x - Math.SQRT2)
    );

    expect(resultado.convergio).toBe(true);

    for (let i = 1; i < 3; i++) {
      const ordenCuadratico = errores[i + 1] / errores[i] ** 2;

      expect(ordenCuadratico).toBeGreaterThan(0.3);
      expect(ordenCuadratico).toBeLessThan(0.6);
    }
  });

  test('exporta correctamente un resultado cuando el método no converge', () => {
    const resultado = newtonRaphson({
      f: (x) => x ** 2 - 2,
      df: (x) => 2 * x,
      x0: 100,
      tolerancia: 1e-12,
      maxIter: 1,
    });

    const exportacion = exportarJSON(resultado.resultado, {
      metodo: resultado.meta.metodo,
      parametros: resultado.meta.parametros,
      iteraciones: resultado.iteraciones,
    });

    expect(resultado.convergio).toBe(false);
    expect(resultado.iteraciones).toHaveLength(1);
    expect(exportacion.resultado).toBe(resultado.resultado);
    expect(exportacion.iteraciones).toEqual(resultado.iteraciones);
    expect(exportacion.parametros.maxIter).toBe(1);
  });

  test('detecta la divergencia antes de intentar exportar el resultado', () => {
    expect(() => {
      const resultado = newtonRaphson({
        f: () => Infinity,
        df: () => 1,
        x0: 1,
        tolerancia: 1e-5,
      });

      return exportarJSON(resultado.resultado, {
        metodo: resultado.meta.metodo,
        parametros: resultado.meta.parametros,
        iteraciones: resultado.iteraciones,
      });
    }).toThrow(ErrorDivergencia);
  });

  test('usa valores por defecto cuando no se proporcionan metadatos', () => {
    const resultado = {
      x: 3,
    };

    const resultadoJSON = exportarJSON(resultado);

    expect(resultadoJSON.metodo).toBeNull();
    expect(resultadoJSON.parametros).toEqual({});
    expect(resultadoJSON.resultado).toEqual(resultado);
    expect(resultadoJSON.iteraciones).toBeNull();
    expect(resultadoJSON.timestamp).toEqual(expect.any(String));
  });

  test('maneja correctamente un resultado vacío', () => {
    const resultadoJSON = exportarJSON({});

    expect(resultadoJSON.resultado).toEqual({});
    expect(resultadoJSON.metodo).toBeNull();
    expect(resultadoJSON.parametros).toEqual({});
    expect(resultadoJSON.iteraciones).toBeNull();
    expect(resultadoJSON.timestamp).toEqual(expect.any(String));
  });

  test('mantiene correctamente un resultado null', () => {
    const resultadoJSON = exportarJSON(null);

    expect(resultadoJSON.resultado).toBeNull();
    expect(resultadoJSON.metodo).toBeNull();
    expect(resultadoJSON.parametros).toEqual({});
    expect(resultadoJSON.iteraciones).toBeNull();
    expect(resultadoJSON.timestamp).toEqual(expect.any(String));
  });

  test('genera una estructura JSON con el contenido esperado', () => {
    const resultado = {
      x: 1.5,
      error: 0.25,
    };

    const metadatos = {
      metodo: 'Bisección',
      parametros: {
        a: 1,
        b: 2,
      },
      iteraciones: 4,
    };

    const resultadoJSON = exportarJSON(resultado, metadatos);
    const textoJSON = JSON.stringify(resultadoJSON, null, 2);

    expect(textoJSON).toContain('"metodo": "Bisección"');
    expect(textoJSON).toContain('"a": 1');
    expect(textoJSON).toContain('"b": 2');
    expect(textoJSON).toContain('"x": 1.5');
    expect(textoJSON).toContain('"error": 0.25');
    expect(textoJSON).toContain('"iteraciones": 4');
  });
});