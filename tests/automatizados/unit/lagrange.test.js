import { lagrange } from '../../../src/interpolacion/lagrange.js';
import { ErrorNumerico } from '../../../src/core/errores.js';

describe('Interpolación de Lagrange', () => {
    test('el polinomio pasa exactamente por todos los puntos de entrada', () => {
        const puntos = [
            [0, 1],
            [1, 3],
            [2, 5]
        ];

        puntos.forEach(([x, y]) => {
            const resultado = lagrange({ puntos, x });

            expect(resultado.resultado)
                .toBeCloseTo(y, 10);
        });
    });

    test('calcula correctamente un valor interpolado entre puntos conocidos', () => {
        const puntos = [
            [0, 1],
            [1, 3],
            [2, 5]
        ];

        /*
         * Cálculo manual:
         *
         * Los puntos pertenecen al polinomio:
         * P(x) = 2x + 1
         *
         * Para x = 0.5:
         *
         * P(0.5) = 2(0.5) + 1
         * P(0.5) = 2
         */

        const resultado = lagrange({
            puntos,
            x: 0.5
        });

        expect(resultado.resultado)
            .toBeCloseTo(2, 10);
    });
});

describe('Interpolación de Lagrange - precisión y convergencia', () => {
    test('interpola correctamente un polinomio cuadrático', () => {
        // P(x) = x² + 2x + 1
        const puntos = [
            [0, 1],
            [1, 4],
            [2, 9]
        ];

        const resultado = lagrange({
            puntos,
            x: 0.5
        });

        expect(resultado.resultado).toBeCloseTo(2.25, 12);
    });

    test('interpola correctamente un polinomio cúbico', () => {
        // P(x) = x³ - 2x² + x + 4
        const puntos = [
            [0, 4],
            [1, 4],
            [2, 6],
            [3, 16]
        ];

        const resultado = lagrange({
            puntos,
            x: 1.5
        });

        expect(resultado.resultado).toBeCloseTo(4.375, 12);
    });

    test('mantiene la precisión con diferentes separaciones entre puntos', () => {
        const puntosH1 = [
            [0, 1],
            [1, 4],
            [2, 9]
        ];

        const puntosH05 = [
            [0, 1],
            [0.5, 2.25],
            [1, 4]
        ];

        const resultadoH1 = lagrange({
            puntos: puntosH1,
            x: 0.75
        });

        const resultadoH05 = lagrange({
            puntos: puntosH05,
            x: 0.75
        });

        expect(resultadoH1.resultado).toBeCloseTo(3.0625, 12);
        expect(resultadoH05.resultado).toBeCloseTo(3.0625, 12);
    });

    test('mantiene un error relativo inferior a la tolerancia establecida', () => {
        // P(x) = x³ - 2x² + x + 4
        const puntos = [
            [0, 4],
            [1, 4],
            [2, 6],
            [3, 16]
        ];

        const valorExacto = 4.375;

        const resultado = lagrange({
            puntos,
            x: 1.5
        });

        const errorRelativo = Math.abs(
            (resultado.resultado - valorExacto) / valorExacto
        );

        expect(errorRelativo).toBeLessThan(1e-12);
    });

    test('mantiene la precisión con una tolerancia más estricta', () => {
        const puntos = [
            [0, 1],
            [1, 3],
            [2, 5]
        ];

        const resultado = lagrange({
            puntos,
            x: 0.25
        });

        expect(resultado.resultado).toBeCloseTo(1.5, 14);
    });
});

describe('Interpolación de Lagrange - divergencia numérica', () => {
    test('detecta desbordamiento al calcular diferencias entre coordenadas', () => {
        const puntos = [
            [-1e308, 1],
            [1e308, 2]
        ];

        expect(() => lagrange({
            puntos,
            x: 0
        })).toThrow(ErrorNumerico);
    });

    test('detecta desbordamiento durante la suma de contribuciones', () => {
        const puntos = [
            [0, Number.MAX_VALUE],
            [1, Number.MAX_VALUE]
        ];

        expect(() => lagrange({
            puntos,
            x: 2
        })).toThrow(ErrorNumerico);
    });
});