import { evaluarHorner } from '../../../src/polinomios/horner.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('evaluarHorner', () => {
    test('evalúa el polinomio [2, -6, 2, -1] en x = 3 y devuelve 5', () => {
        expect(evaluarHorner([2, -6, 2, -1], 3)).toBe(5);
    });

    test('evalúa un polinomio constante y devuelve 7', () => {
        expect(evaluarHorner([7], 100)).toBe(7);
    });

    test('evalúa el polinomio [1, 0, 0] en x = 2 y devuelve 4', () => {
        expect(evaluarHorner([1, 0, 0], 2)).toBe(4);
    });

    test('lanza ErrorParametros cuando el arreglo está vacío', () => {
        expect(() => evaluarHorner([], 2)).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros cuando el valor no es un arreglo', () => {
        expect(() => evaluarHorner(null, 2)).toThrow(ErrorParametros);
    });
});
