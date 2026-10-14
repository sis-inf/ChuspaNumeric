import { euler } from '../../../src/edo/euler.js';
import { eulerMejorado } from '../../../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';
import { ErrorParametros } from '../../../src/core/errores.js';

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
        expect(() => eulerMejorado({ f: (x, y) => y, x0: 0, y0: 1, h: 0, xFinal: 1 })).toThrow();
    });

    // ── Divergencia numérica / comportamiento ante maxIter ──────
    test('Produce un valor no finito cuando f tiene una singularidad en el intervalo', () => {
        // f(x) = 1/(x - 0.2) se indefine en x = 0.2, que se alcanza exactamente en el paso 2
        // (los x se calculan como x0 + n*h, sin deriva acumulada).
        const r = eulerMejorado({
            f: (x) => 1 / (x - 0.2),
            x0: 0,
            y0: 1,
            h: 0.1,
            xFinal: 0.5,
        });

        expect(Number.isFinite(r.resultado[r.resultado.length - 1][1])).toBe(false);
    });

    test('Ignora maxIter: al ser explícito siempre realiza round((xFinal - x0) / h) pasos', () => {
        // El método no tiene bucle de corrección ni criterio de convergencia,
        // por lo que maxIter no limita nada y el resultado siempre reporta convergio: true.
        const r = eulerMejorado({
            f: (x, y) => y,
            x0: 0,
            y0: 1,
            h: 0.1,
            xFinal: 1,
            maxIter: 2,
        });

        expect(r.iteraciones).toHaveLength(10);
        expect(r.resultado).toHaveLength(11);
        expect(r.convergio).toBe(true);
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

        expect(Math.abs(yCalculado - yEsperado)).toBeLessThan(0.01);
    });

    test('Lanza ErrorParametros si xFinal <= x0', () => {
        const base = { f: (x, y) => y, x0: 1, y0: 1, h: 0.1 };
        expect(() => eulerMejorado({ ...base, xFinal: 1 })).toThrow(ErrorParametros);
        expect(() => eulerMejorado({ ...base, xFinal: 0 })).toThrow(/mayor que 'x0'/);
    });

    test('Lanza error si x0, y0, h o xFinal no son números válidos', () => {
        const base = { f: (x, y) => y, x0: 0, y0: 1, h: 0.1, xFinal: 1 };
        expect(() => eulerMejorado({ ...base, x0: 'a' })).toThrow();
        expect(() => eulerMejorado({ ...base, y0: undefined })).toThrow();
        expect(() => eulerMejorado({ ...base, h: '0.1' })).toThrow();
        expect(() => eulerMejorado({ ...base, xFinal: NaN })).toThrow();
    });
});