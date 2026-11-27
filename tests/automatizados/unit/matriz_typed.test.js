import {
    crearMatrizTyped,
    desdeArreglo,
    aArreglo,
    obtener,
    asignar,
} from '../../../src/utils/matriz_typed.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('matriz_typed', () => {
    test('crearMatrizTyped(2, 3) crea una matriz de 2 filas y 3 columnas llena de ceros', () => {
        const M = crearMatrizTyped(2, 3);
        expect(M.filas).toBe(2);
        expect(M.columnas).toBe(3);
        expect(M.datos.length).toBe(6);
        expect(obtener(M, 1, 2)).toBe(0);
    });

    test('desdeArreglo([[1, 2], [3, 4]]) permite leer obtener(M, 1, 0) y devuelve 3', () => {
        const M = desdeArreglo([
            [1, 2],
            [3, 4],
        ]);
        expect(obtener(M, 1, 0)).toBe(3);
    });

    test('aArreglo(M) devuelve [[1, 2], [3, 4]] (conversión de ida y vuelta)', () => {
        const M = desdeArreglo([
            [1, 2],
            [3, 4],
        ]);
        expect(aArreglo(M)).toEqual([
            [1, 2],
            [3, 4],
        ]);
    });

    test('asignar(M, 0, 2, 7) hace que obtener(M, 0, 2) devuelva 7', () => {
        const M = crearMatrizTyped(2, 3);
        asignar(M, 0, 2, 7);
        expect(obtener(M, 0, 2)).toBe(7);
    });

    test('lanza ErrorParametros con crearMatrizTyped(0, 3)', () => {
        expect(() => crearMatrizTyped(0, 3)).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros con desdeArreglo([[1, 2], [3]])', () => {
        expect(() => desdeArreglo([[1, 2], [3]])).toThrow(ErrorParametros);
    });

    test('lanza ErrorParametros con obtener(crearMatrizTyped(2, 2), 2, 0)', () => {
        expect(() => obtener(crearMatrizTyped(2, 2), 2, 0)).toThrow(
            ErrorParametros
        );
    });
});