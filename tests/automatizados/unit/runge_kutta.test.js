import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';

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
