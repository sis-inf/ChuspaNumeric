import { calcularRango } from '../../../src/matricial/rango.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('calcularRango', () => {
  describe('matrices válidas', () => {
    test('la matriz identidad 3x3 tiene rango 3', () => {
      const identidad = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ];
      expect(calcularRango({ A: identidad }).resultado).toBe(3);
    });

    test('una matriz con filas linealmente dependientes tiene rango 1', () => {
      expect(calcularRango({ A: [[1, 2], [2, 4]] }).resultado).toBe(1);
    });

    test('la matriz nula tiene rango 0', () => {
      const nula = [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(calcularRango({ A: nula }).resultado).toBe(0);
    });

    test('una matriz 1x1 con valor no nulo tiene rango 1', () => {
      expect(calcularRango({ A: [[5]] }).resultado).toBe(1);
    });

    test('una matriz 1x1 con valor nulo tiene rango 0', () => {
      expect(calcularRango({ A: [[0]] }).resultado).toBe(0);
    });
    test('devuelve el resultado estructurado con sus metadatos', () => {
      const salida = calcularRango({ A: [[1, 2, 3], [4, 5, 6]] });
      expect(salida.resultado).toBe(2);
      expect(salida.convergio).toBe(true);
      expect(salida.iteraciones).toEqual([]);
      expect(salida.meta.metodo).toBe('eliminacion-gaussiana');
      expect(salida.meta.parametros).toBeDefined();
      expect(typeof salida.meta.tiempo_ms).toBe('number');
    });
  });

  describe('entradas inválidas', () => {
    test('lanza ErrorParametros si las filas tienen distinta longitud', () => {
      expect(() => calcularRango({ A: [[1, 2, 3], [4, 5]] })).toThrow(ErrorParametros);
    });

    test.each([
      ['una cadena', 'abc'],
      ['un número', 42],
      ['null', null],
      ['un objeto', {}],
    ])('lanza ErrorParametros si A no es un array (%s)', (_nombre, entrada) => {
      expect(() => calcularRango({ A: entrada })).toThrow(ErrorParametros);
    });
  });
});