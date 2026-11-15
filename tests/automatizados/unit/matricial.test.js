import { determinanteSarrus } from '../../../src/matricial/determinante_sarrus.js';
import {
    normaEuclideana,
    normaInfinita,
    normaFrobenius
} from '../../../src/matricial/norma_matriz.js';
import { det3x3 } from '../../../src/lineales/determinant.js';


describe('Funciones matriciales', () => {

    test('determinanteSarrus coincide con det3x3 para una matriz 3x3 conocida', () => {
        /*
         * Matriz:
         *
         * | 1  2  3 |
         * | 0  4  5 |
         * | 1  0  6 |
         *
         * Ambos métodos calculan el mismo determinante:
         *
         * det = 22
         */

        const matriz = [
            [1, 2, 3],
            [0, 4, 5],
            [1, 0, 6]
        ];

        const resultadoSarrus = determinanteSarrus(matriz);
        const resultadoDet3x3 = det3x3(matriz);

        expect(resultadoSarrus.resultado)
            .toBe(resultadoDet3x3);

        expect(resultadoSarrus.resultado)
            .toBe(22);

        expect(resultadoSarrus.convergio)
            .toBe(true);

        expect(resultadoSarrus.iteraciones)
            .toEqual([]);

        expect(resultadoSarrus.meta.metodo)
            .toBe('sarrus');
    });


    test('normaEuclideana calcula correctamente la norma de un vector', () => {
        /*
         * Vector:
         *
         * v = [3,4]
         *
         * ||v|| = sqrt(3² + 4²)
         * ||v|| = sqrt(9 + 16)
         * ||v|| = 5
         */

        const vector = [3, 4];

        const resultado = normaEuclideana(vector);

        expect(resultado.resultado)
            .toBe(5);

        expect(resultado.convergio)
            .toBe(true);

        expect(resultado.meta.metodo)
            .toBe('norma-euclideana');

        expect(resultado.meta.parametros)
            .toEqual({ longitud: 2 });
    });


    test('normaInfinita calcula correctamente el máximo valor absoluto', () => {
        /*
         * Vector:
         *
         * v = [-3,4,2]
         *
         * ||v||∞ = max(|-3|,|4|,|2|)
         * ||v||∞ = 4
         */

        const vector = [-3, 4, 2];

        const resultado = normaInfinita(vector);

        expect(resultado.resultado)
            .toBe(4);

        expect(resultado.convergio)
            .toBe(true);

        expect(resultado.meta.metodo)
            .toBe('norma-infinita');

        expect(resultado.meta.parametros)
            .toEqual({ longitud: 3 });
    });


    test('normaFrobenius calcula correctamente la norma de una matriz', () => {
        /*
         * Matriz:
         *
         * | 1 2 |
         * | 3 4 |
         *
         * ||A||F = sqrt(1² + 2² + 3² + 4²)
         * ||A||F = sqrt(30)
         */

        const matriz = [
            [1, 2],
            [3, 4]
        ];

        const resultado = normaFrobenius(matriz);

        expect(resultado.resultado)
            .toBeCloseTo(Math.sqrt(30), 10);

        expect(resultado.convergio)
            .toBe(true);

        expect(resultado.meta.metodo)
            .toBe('norma-frobenius');

        expect(resultado.meta.parametros)
            .toEqual({ filas: 2, columnas: 2 });
    });

});
