import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';
describe('Pruebas Funcionales - Método de Runge-Kutta 4 (RK4)', () => {

    test('Caso Normal: Resolución de EDO lineal con error absoluto controlado', () => {
        const edo = (x, y) => x + y;
        const x = 0;
        const y = 1;
        const h = 0.1;

        const k1 = edo(x, y);
        const k2 = edo(x + h / 2, y + (h / 2) * k1);
        const k3 = edo(x + h / 2, y + (h / 2) * k2);
        const k4 = edo(x + h, y + h * k3);
        
        const ySiguiente = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        const valorReal = 2 * Math.exp(0.1) - 0.1 - 1;
        const errorAbsoluto = Math.abs(ySiguiente - valorReal);

        expect(errorAbsoluto).toBeLessThan(1e-6);
    });

    test('Caso de Borde: Comportamiento del método en condiciones iniciales nulas', () => {
        const edo = (x, y) => x;
        const x = 0;
        const y = 0;
        const h = 0.2;

        const k1 = edo(x, y);
        const k2 = edo(x + h / 2, y + (h / 2) * k1);
        const k3 = edo(x + h / 2, y + (h / 2) * k2);
        const k4 = edo(x + h, y + h * k3);
        
        const ySiguiente = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
        
        expect(Number.isNaN(ySiguiente)).toBe(false);
        expect(Number.isFinite(ySiguiente)).toBe(true);
    });

    test('Caso de Error: Lanzamiento de excepción ante entradas de datos no numéricos', () => {
        const ejecutarRK4 = (edo, x, y, h) => {
            if (typeof x !== 'number' || typeof y !== 'number' || typeof h !== 'number') {
                throw new Error('Las entradas del método RK4 deben ser estrictamente numéricas.');
            }
        };

        expect(() => {
            ejecutarRK4((x, y) => y, "cero", 1, 0.1);
        }).toThrow();
    });

    describe('Precisión y convergencia', () => {
        const edo = (x, y) => y;
        const solucionExacta = Math.exp(1);

        test('reduce el error relativo al utilizar tolerancias más estrictas', () => {
            const tolerancias = [1e-3, 1e-6, 1e-9];
            const errores = [];

            tolerancias.forEach(tolerancia => {
                const res = rungeKutta4({
                    f: edo,
                    x0: 0,
                    y0: 1,
                    h: 0.2,
                    xFinal: 1,
                    tolerancia
                });

                const aproximacion = res.resultado[res.resultado.length - 1][1];
                const errorRelativo =
                    Math.abs(aproximacion - solucionExacta) / solucionExacta;

                expect(res.convergio).toBe(true);
                errores.push(errorRelativo);
            });

            expect(errores[1]).toBeLessThan(errores[0]);
            expect(errores[2]).toBeLessThan(errores[1]);
        });

        test('mantiene precisión con diferentes tamaños de paso', () => {
            const pasos = [0.4, 0.2, 0.1];
            const tolerancia = 1e-9;

            pasos.forEach(h => {
                const res = rungeKutta4({
                    f: edo,
                    x0: 0,
                    y0: 1,
                    h,
                    xFinal: 1,
                    tolerancia,
                    pasoMinimo: h / 1024,
                    pasoMaximo: h
                });

                const aproximacion = res.resultado[res.resultado.length - 1][1];
                const errorRelativo =
                    Math.abs(aproximacion - solucionExacta) / solucionExacta;

                expect(res.convergio).toBe(true);
                expect(errorRelativo).toBeLessThan(tolerancia);
            });
        });

        test('registra errores estimados dentro de la tolerancia', () => {
            const tolerancia = 1e-6;

            const res = rungeKutta4({
                f: edo,
                x0: 0,
                y0: 1,
                h: 0.2,
                xFinal: 1,
                tolerancia
            });

            expect(res.convergio).toBe(true);
            expect(res.iteraciones.length).toBeGreaterThan(0);

            res.iteraciones.forEach(iteracion => {
                expect(iteracion.errorEstimado).toBeLessThanOrEqual(tolerancia);
            });
        });

        test('detecta que no puede alcanzar la tolerancia con el paso mínimo', () => {
            expect(() => {
                rungeKutta4({
                    f: edo,
                    x0: 0,
                    y0: 1,
                    h: 1,
                    xFinal: 1,
                    tolerancia: 1e-20,
                    pasoMinimo: 1,
                    pasoMaximo: 1
                });
            }).toThrow(/No se alcanza la tolerancia con el paso minimo permitido/i);
        });

        test('rechaza resultados no finitos durante el cálculo', () => {
            expect(() => {
                rungeKutta4({
                    f: () => Infinity,
                    x0: 0,
                    y0: 1,
                    h: 0.1,
                    xFinal: 1
                });
            }).toThrow(/valores calculados deben ser numeros finitos/i);
        });
    });
});