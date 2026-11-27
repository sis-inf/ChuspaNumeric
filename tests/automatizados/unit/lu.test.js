import { lu } from '../../../src/lineales/lu.js';
import { ErrorDivergencia } from '../../../src/core/errores.js';

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

    test('resuelve un sistema de 3x3 con alta precisión', () => {
        const A = [
            [4, 1, 2],
            [2, 5, 1],
            [1, 1, 3]
        ];
        const b = [12, 15, 12];

        const result = lu({ A, b });

        expect(result.resultado.x[0]).toBeCloseTo(1, 12);
        expect(result.resultado.x[1]).toBeCloseTo(2, 12);
        expect(result.resultado.x[2]).toBeCloseTo(3, 12);
        expect(result.convergio).toBe(true);
    });

    test('mantiene un error relativo pequeño al resolver un sistema', () => {
        const A = [
            [4, 1, 2],
            [2, 5, 1],
            [1, 1, 3]
        ];
        const b = [12, 15, 12];

        const result = lu({ A, b });
        const x = result.resultado.x;

        // Calcular el residuo A*x - b.
        const residuos = A.map((fila, i) =>
            fila.reduce((suma, valor, j) => suma + valor * x[j], 0) - b[i]
        );

        const errorAbsoluto = Math.max(
            ...residuos.map(valor => Math.abs(valor))
        );

        const normaB = Math.max(...b.map(valor => Math.abs(valor)));
        const errorRelativo = errorAbsoluto / normaB;

        expect(errorRelativo).toBeLessThan(1e-12);
    });

    test('mantiene la precisión con una matriz de coeficientes de distinta escala', () => {
        const A = [
            [4000, 3000],
            [6000, 3000]
        ];
        const b = [10000, 12000];

        const result = lu({ A, b });

        expect(result.resultado.x[0]).toBeCloseTo(1, 12);
        expect(result.resultado.x[1]).toBeCloseTo(2, 12);
    });

    test('detecta divergencia cuando la solución no es finita', () => {
        const A = [
            [1e-308, 0],
            [0, 1]
        ];
        const b = [1e308, 1];

        expect(() => lu({ A, b }))
            .toThrow(ErrorDivergencia);
    });
});
