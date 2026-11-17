import { lu } from '../../../src/lineales/lu.js';

describe('Método lineales - Factorización LU', () => {
    test('L y U reconstruyen la matriz original', () => {
        const A = [
            [4, 3],
            [6, 3]
        ];
        const b = [10, 12];

        const result = lu({ A, b });

        const L = result.resultado.L;
        const U = result.resultado.U;

        // Multiplicar L por U para reconstruir A.
        const reconstruida = L.map((fila, i) =>
            fila.map((_, j) =>
                L[i].reduce((suma, valor, k) => suma + valor * U[k][j], 0)
            )
        );

        expect(reconstruida[0][0]).toBeCloseTo(A[0][0], 10);
        expect(reconstruida[0][1]).toBeCloseTo(A[0][1], 10);
        expect(reconstruida[1][0]).toBeCloseTo(A[1][0], 10);
        expect(reconstruida[1][1]).toBeCloseTo(A[1][1], 10);
    });

    test('resuelve correctamente un sistema con solución conocida', () => {
        const A = [
            [4, 3],
            [6, 3]
        ];
        const b = [10, 12];

        const result = lu({ A, b });

        expect(result.resultado.x[0]).toBeCloseTo(1, 10);
        expect(result.resultado.x[1]).toBeCloseTo(2, 10);
        expect(result.convergio).toBe(true);
    });

    test('lanza error cuando la matriz es singular', () => {
        const A = [
            [1, 2],
            [2, 4]
        ];
        const b = [3, 6];

        expect(() => lu({ A, b }))
            .toThrow('pivote nulo');
    });

    test('lanza error cuando el vector tiene una dimensión incorrecta', () => {
        const A = [
            [4, 3],
            [6, 3]
        ];
        const b = [10];

        expect(() => lu({ A, b }))
            .toThrow('el vector debe tener longitud 2');
    });
});
