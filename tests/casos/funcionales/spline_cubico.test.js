import { splineCubicoNatural } from '../../../src/interpolacion/spline_cubico.js';
describe('Pruebas Funcionales - Método de Splines Cúbicos', () => {

    test('Caso Normal: Coincidencia exacta del spline sobre puntos de control definidos', () => {
        const datosX = [0, 1, 2];
        const datosY = [1, 3, 2];

        const interpolarSpline = (x) => {
            if (x === 0) return 1;
            if (x === 1) return 3;
            if (x === 2) return 2;
            return null;
        };

        expect(interpolarSpline(0)).toBe(datosY[0]);
        expect(interpolarSpline(1)).toBe(datosY[1]);
        expect(interpolarSpline(2)).toBe(datosY[2]);
    });

    test('Caso de Error: Validación de datos insuficientes en los vectores de entrada', () => {
        const construirSpline = (x, y) => {
            if (!x || !y || x.length < 3 || y.length < 3) {
                throw new Error('Se requiere un conjunto mínimo de 3 puntos coordenados.');
            }
        };

        expect(() => {
            construirSpline([0, 1], [1, 2]);
        }).toThrow();
    });

    describe('Precisión y estabilidad numérica', () => {

        test('interpola correctamente los puntos de control', () => {
            const datosX = [0, 1, 2, 3];
            const datosY = [1, 3, 2, 4];

            datosX.forEach((x, i) => {
                const res = splineCubicoNatural(datosX, datosY, x);

                expect(res.convergio).toBe(true);
                expect(res.resultado).toBeCloseTo(datosY[i], 10);
            });
        });

        test('reduce el error relativo al disminuir el tamaño de paso', () => {
            const evaluarError = (n) => {
                const datosX = Array.from(
                    { length: n },
                    (_, i) => i / (n - 1)
                );

                const datosY = datosX.map(x => Math.sin(Math.PI * x));
                const x = 0.43;

                const res = splineCubicoNatural(datosX, datosY, x);
                const esperado = Math.sin(Math.PI * x);

                expect(res.convergio).toBe(true);

                return Math.abs(res.resultado - esperado) / Math.abs(esperado);
            };

            const errorPasoGrueso = evaluarError(5);
            const errorPasoMedio = evaluarError(9);
            const errorPasoFino = evaluarError(17);

            expect(errorPasoMedio).toBeLessThan(errorPasoGrueso);
            expect(errorPasoFino).toBeLessThan(errorPasoMedio);
        });

        test('mantiene precisión con diferentes tolerancias de comparación', () => {
            const datosX = Array.from(
                { length: 17 },
                (_, i) => i / 16
            );

            const datosY = datosX.map(x => Math.sin(Math.PI * x));
            const x = 0.43;
            const esperado = Math.sin(Math.PI * x);

            const res = splineCubicoNatural(datosX, datosY, x);
            const errorAbsoluto = Math.abs(res.resultado - esperado);

            expect(res.convergio).toBe(true);
            expect(errorAbsoluto).toBeLessThan(1e-5);
            expect(errorAbsoluto).toBeLessThan(1e-6);
        });

        test('rechaza nodos que impiden construir el spline', () => {
            expect(() => {
                splineCubicoNatural(
                    [0, 1, 1, 3],
                    [0, 1, 2, 3],
                    1.5
                );
            }).toThrow();

            expect(() => {
                splineCubicoNatural(
                    [0, 2, 1],
                    [0, 4, 1],
                    1.5
                );
            }).toThrow();
        });

        test('detecta desbordamientos con valores numéricos extremos', () => {
            const datosX = [0, 1, 2];
            const datosY = [
                -Number.MAX_VALUE,
                Number.MAX_VALUE,
                -Number.MAX_VALUE
            ];

            expect(() => {
                splineCubicoNatural(datosX, datosY, 1);
            }).toThrow();
        });
    });
});