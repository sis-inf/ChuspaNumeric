import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';
import { ErrorConvergencia } from '../../../src/core/errores.js';

describe('Métodos EDO - Runge-Kutta 4', () => {
    test('RK4 funciona correctamente con función válida', () => {
        const f = (x, y) => -y;
        const result = rungeKutta4({ f, x0: 0, y0: 1, h: 0.1, xFinal: 1 });
        
        expect(result).toBeDefined();
        expect(result).toHaveProperty('resultado');
        expect(Array.isArray(result.resultado)).toBe(true);
        expect(result.resultado.length).toBe(11);
        expect(result.resultado[0][0]).toBe(0);
        expect(result.resultado[0][1]).toBe(1);
        expect(result.resultado[10][1]).toBeCloseTo(Math.exp(-1), 2);
    });

    test('RK4 retorna pares [x, y]', () => {
        const f = (x, y) => -y;
        const result = rungeKutta4({ f, x0: 0, y0: 1, h: 0.1, xFinal: 0.5 });
        
        expect(result).toHaveProperty('resultado');
        expect(Array.isArray(result.resultado)).toBe(true);
        expect(result.resultado[0]).toEqual([0, 1]);
        expect(result.resultado[1][0]).toBe(0.1);
        expect(result.resultado[1][1]).toBeCloseTo(0.9048, 2);
    });

    test('h <= 0 lanza error', () => {
        const f = (x, y) => -y;
        expect(() => rungeKutta4({ f, x0: 0, y0: 1, h: 0, xFinal: 1 }))
            .toThrow('El paso h debe ser mayor que cero.');
        expect(() => rungeKutta4({ f, x0: 0, y0: 1, h: -1, xFinal: 1 }))
            .toThrow('El paso h debe ser mayor que cero.');
    });

    test('xFinal debe ser mayor que x0', () => {
        const f = (x, y) => -y;
        expect(() => rungeKutta4({ f, x0: 0, y0: 1, h: 0.1, xFinal: -1 }))
            .toThrow('xFinal debe ser mayor que x0.');
        expect(() => rungeKutta4({ f, x0: 0, y0: 1, h: 0.1, xFinal: 0 }))
            .toThrow('xFinal debe ser mayor que x0.');
    });

    test('valida que f sea una función', () => {
        expect(() => rungeKutta4({ f: 'not a function', x0: 0, y0: 1, h: 0.1, xFinal: 1 }))
            .toThrow('El argumento debe ser una función');
    });

    test('valida que x0 y y0 sean números', () => {
        const f = (x, y) => -y;
        expect(() => rungeKutta4({ f, x0: '0', y0: 1, h: 0.1, xFinal: 1 }))
            .toThrow();
        expect(() => rungeKutta4({ f, x0: 0, y0: '1', h: 0.1, xFinal: 1 }))
            .toThrow();
    });

    test('un paso menor produce un error final menor o igual', () => {
        const f = (x, y) => -y;
        const solucionExacta = Math.exp(-1);

        const resultadoPasoGrande = rungeKutta4({
            f,
            x0: 0,
            y0: 1,
            h: 0.2,
            xFinal: 1
        });

        const resultadoPasoPequeno = rungeKutta4({
            f,
            x0: 0,
            y0: 1,
            h: 0.1,
            xFinal: 1
        });

        const valorPasoGrande = resultadoPasoGrande.resultado[5][1];
        const valorPasoPequeno = resultadoPasoPequeno.resultado[10][1];

        const errorPasoGrande = Math.abs(valorPasoGrande - solucionExacta);
        const errorPasoPequeno = Math.abs(valorPasoPequeno - solucionExacta);

        expect(resultadoPasoGrande.resultado[5][0]).toBeCloseTo(1, 10);
        expect(resultadoPasoPequeno.resultado[10][0]).toBeCloseTo(1, 10);

        expect(errorPasoPequeno).toBeLessThanOrEqual(errorPasoGrande);
    });
});

describe('Runge-Kutta 4 - precisión y convergencia', () => {
    const f = (x, y) => -y;
    const solucionExacta = Math.exp(-1);

    const obtenerErrorRelativo = (resultado) => {
        const puntoFinal = resultado.resultado.find(
            ([x]) => Math.abs(x - 1) < 1e-10
        );

        expect(puntoFinal).toBeDefined();

        return Math.abs((puntoFinal[1] - solucionExacta) / solucionExacta);
    };

    test('presenta convergencia de orden cuatro al reducir el paso', () => {
        const resH025 = rungeKutta4({
            f, x0: 0, y0: 1, h: 0.25, xFinal: 1
        });

        const resH0125 = rungeKutta4({
            f, x0: 0, y0: 1, h: 0.125, xFinal: 1
        });

        const resH00625 = rungeKutta4({
            f, x0: 0, y0: 1, h: 0.0625, xFinal: 1
        });

        const error025 = obtenerErrorRelativo(resH025);
        const error0125 = obtenerErrorRelativo(resH0125);
        const error00625 = obtenerErrorRelativo(resH00625);

        const orden1 = error025 / error0125;
        const orden2 = error0125 / error00625;

        expect(error0125).toBeLessThan(error025);
        expect(error00625).toBeLessThan(error0125);

        expect(orden1).toBeGreaterThan(14);
        expect(orden1).toBeLessThan(18);

        expect(orden2).toBeGreaterThan(14);
        expect(orden2).toBeLessThan(18);
    });

    test.each([1e-3, 1e-5, 1e-7])(
        'resuelve la EDO con tolerancia adaptativa %s',
        (tolerancia) => {
            const res = rungeKutta4({
                f,
                x0: 0,
                y0: 1,
                h: 0.5,
                xFinal: 1,
                tolerancia,
                pasoMinimo: 1e-5,
                pasoMaximo: 0.5
            });

            expect(res.convergio).toBe(true);
            expect(res.meta.parametros.tolerancia).toBe(tolerancia);
            expect(obtenerErrorRelativo(res)).toBeLessThan(1e-3);
        }
    );

    test('una tolerancia más estricta produce menor error relativo', () => {
        const tolerancias = [1e-3, 1e-5, 1e-7];

        const errores = tolerancias.map((tolerancia) => {
            const res = rungeKutta4({
                f,
                x0: 0,
                y0: 1,
                h: 0.5,
                xFinal: 1,
                tolerancia,
                pasoMinimo: 1e-5,
                pasoMaximo: 0.5
            });

            return obtenerErrorRelativo(res);
        });

        expect(errores[1]).toBeLessThan(errores[0]);
        expect(errores[2]).toBeLessThan(errores[1]);
    });
});

describe('Runge-Kutta 4 - detección de no convergencia', () => {
    test('lanza ErrorConvergencia cuando el paso mínimo impide alcanzar la tolerancia', () => {
        const f = (x, y) => -y;

        expect(() => rungeKutta4({
            f,
            x0: 0,
            y0: 1,
            h: 0.5,
            xFinal: 1,
            tolerancia: 1e-20,
            pasoMinimo: 0.5,
            pasoMaximo: 0.5
        })).toThrow(ErrorConvergencia);
    });
});