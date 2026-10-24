import { calcularNumeroCondicion } from '../../../src/matricial/numero_condicion.js';


describe('calcularNumeroCondicion', () => {

    test('cond(I) = n para la matriz identidad', () => {
        /*
         * Matriz identidad 3x3:
         *
         * | 1 0 0 |
         * | 0 1 0 |
         * | 0 0 1 |
         *
         * I^-1 = I
         *
         * ||I||F = sqrt(3) (tres unos en la diagonal)
         * cond(I) = ||I||F * ||I^-1||F = sqrt(3) * sqrt(3) = 3
         */

        const identidad = [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1]
        ];

        expect(calcularNumeroCondicion(identidad, identidad))
            .toBeCloseTo(3, 10);
    });


    test('calcula correctamente el número de condición de una matriz diagonal conocida', () => {
        /*
         * Matriz:
         *
         * | 2 0 |
         * | 0 1 |
         *
         * Inversa:
         *
         * | 0.5 0 |
         * | 0   1 |
         *
         * ||A||F = sqrt(2² + 1²) = sqrt(5)
         * ||A^-1||F = sqrt(0.5² + 1²) = sqrt(1.25)
         * cond(A) = sqrt(5) * sqrt(1.25) = sqrt(6.25) = 2.5
         */

        const matriz = [
            [2, 0],
            [0, 1]
        ];

        const inversa = [
            [0.5, 0],
            [0, 1]
        ];

        expect(calcularNumeroCondicion(matriz, inversa))
            .toBeCloseTo(2.5, 10);
    });


    test('arroja Error si A no es una matriz', () => {
        const inversa = [
            [1, 0],
            [0, 1]
        ];

        expect(() => calcularNumeroCondicion('no es matriz', inversa))
            .toThrow('Las entradas deben ser matrices');
    });


    test('arroja Error si inversaA no es una matriz', () => {
        const matriz = [
            [1, 0],
            [0, 1]
        ];

        expect(() => calcularNumeroCondicion(matriz, null))
            .toThrow('Las entradas deben ser matrices');
    });

});
