import { exportarJSON } from '../../../src/io/exportar_json.js';

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