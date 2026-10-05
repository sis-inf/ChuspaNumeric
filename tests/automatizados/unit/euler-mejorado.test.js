import { euler } from '../../../src/edo/euler.js';
import { eulerMejorado } from '../../../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';

describe('Métodos EDO - Euler mejorado', () => {
    test('Euler mejorado tiene precisión intermedia entre Euler y RK4', () => {
        const f = (x, y) => -y;

        const opciones = {
            f,
            x0: 0,
            y0: 1,
            h: 0.1,
            xFinal: 0.1,
        };

        const resultadoEuler = euler(opciones);
        const resultadoEulerMejorado = eulerMejorado(opciones);
        const resultadoRK4 = rungeKutta4(opciones);

        const valorExacto = Math.exp(-0.1);

        const yEuler =
            resultadoEuler.resultado[resultadoEuler.resultado.length - 1][1];

        const yEulerMejorado =
            resultadoEulerMejorado.resultado[
                resultadoEulerMejorado.resultado.length - 1
            ][1];

        const yRK4 =
            resultadoRK4.resultado[
                resultadoRK4.resultado.length - 1
            ][1];

        const errorEuler = Math.abs(yEuler - valorExacto);
        const errorEulerMejorado = Math.abs(yEulerMejorado - valorExacto);
        const errorRK4 = Math.abs(yRK4 - valorExacto);

        expect(errorEulerMejorado).toBeLessThan(errorEuler);
        expect(errorEulerMejorado).toBeGreaterThanOrEqual(errorRK4);
    });

    test('Lanza error si los parámetros son inválidos', () => {
        expect(() => eulerMejorado(null)).toThrow();
        expect(() => eulerMejorado({})).toThrow();
        expect(() => eulerMejorado({ f: 'no es funcion', x0: 0, y0: 1, h: 0.1, xFinal: 1 })).toThrow();
        expect(() => eulerMejorado({ f: (x, y) => y, x0: 0, y0: 1, h: -0.1, xFinal: 1 })).toThrow();
    });

    test('Maneja o lanza error cuando los parámetros conducen a no convergencia / paso inválido', () => {
        expect(() => eulerMejorado({
            f: (x, y) => y,
            x0: 0,
            y0: 1,
            h: 0,
            xFinal: 1
        })).toThrow();
    });

    test('Calcula correctamente la convergencia en un caso exitoso adicional (y\' = y, y(0) = 1)', () => {
        const resultado = eulerMejorado({
            f: (x, y) => y,
            x0: 0,
            y0: 1,
            h: 0.05,
            xFinal: 0.5,
        });

        expect(resultado).toBeDefined();
        const ultimoPunto = resultado.resultado[resultado.resultado.length - 1];
        const yCalculado = ultimoPunto[1];
        const yEsperado = Math.exp(0.5);

        // Tolerancia razonable para Euler mejorado con paso 0.05
        expect(Math.abs(yCalculado - yEsperado)).toBeLessThan(0.01);
    });
});