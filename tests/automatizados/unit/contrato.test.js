import { crearResultado, medirTiempo } from '../../../src/core/contrato.js';

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
