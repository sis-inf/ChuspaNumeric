import { euler } from '../../../src/edo/euler.js';
import { eulerMejorado } from '../../../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../../../src/edo/runge_kutta_4.js';
import { ErrorDivergencia, ErrorParametros } from '../../../src/core/errores.js';

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
    test('Lanza ErrorDivergencia cuando f tiene una singularidad en el intervalo', () => {
        // f(x) = 1/(x - 0.2) se indefine en x = 0.2, que se alcanza exactamente en el paso 2
        // (los x se calculan como x0 + n*h, sin deriva acumulada).
        const opciones = {
            f: (x) => 1 / (x - 0.2),
            x0: 0,
            y0: 1,
            h: 0.1,
            xFinal: 0.5,
        };

        expect(() => eulerMejorado(opciones)).toThrow(ErrorDivergencia);
        expect(() => eulerMejorado(opciones)).toThrow(/iteración 2/);
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

describe('Euler mejorado - precisión y convergencia', () => {
    const exacta = Math.exp(1);
    const ultimoY = (r) => r.resultado[r.resultado.length - 1][1];
    const resolver = (h, xFinal = 1) =>
        eulerMejorado({ f: (x, y) => y, x0: 0, y0: 1, h, xFinal });

    test('el error global baja por un factor cercano a 4 al dividir h entre 2 (orden 2)', () => {
        const pasos = [0.1, 0.05, 0.025, 0.0125];
        const errores = pasos.map((h) => Math.abs(ultimoY(resolver(h)) - exacta));

        for (let i = 1; i < errores.length; i++) {
            const razon = errores[i - 1] / errores[i];
            expect(razon).toBeGreaterThan(3.5);
            expect(razon).toBeLessThan(4.5);
        }
    });

    test.each([
        [0.1, 5e-3],
        [0.05, 1e-3],
        [0.01, 5e-5],
        [0.001, 5e-7],
    ])('el error relativo con h = %p es menor que la tolerancia %p', (h, tolerancia) => {
        const errorRelativo = Math.abs(ultimoY(resolver(h)) - exacta) / Math.abs(exacta);

        expect(errorRelativo).toBeLessThan(tolerancia);
    });

    test('resuelve dy/dx = -2y con error relativo menor a 1e-3 usando h = 0.01', () => {
        const r = eulerMejorado({ f: (x, y) => -2 * y, x0: 0, y0: 1, h: 0.01, xFinal: 1 });
        const exacto = Math.exp(-2);

        expect(Math.abs(ultimoY(r) - exacto) / exacto).toBeLessThan(1e-3);
    });

    test('el error estimado por paso es finito y disminuye al reducir h', () => {
        const gruesa = resolver(0.1);
        const fina = resolver(0.05);

        expect(gruesa.erroresEstimados).toHaveLength(gruesa.iteraciones.length);
        expect(Number.isFinite(gruesa.errorEstimadoMaximo)).toBe(true);
        expect(gruesa.errorEstimadoMaximo).toBe(Math.max(...gruesa.erroresEstimados));
        expect(fina.errorEstimadoMaximo).toBeLessThan(gruesa.errorEstimadoMaximo);
    });

    test('ajusta el último paso para terminar exactamente en xFinal cuando h no divide el intervalo', () => {
        const r = resolver(0.3);

        expect(r.resultado).toHaveLength(5);
        expect(r.resultado[r.resultado.length - 1][0]).toBe(1);
        expect(Number.isFinite(ultimoY(r))).toBe(true);
    });
});

describe('Euler mejorado - divergencia y no convergencia', () => {
    const base = { x0: 0, y0: 1, h: 0.1, xFinal: 1 };
    const ultimoY = (r) => r.resultado[r.resultado.length - 1][1];

    test('lanza ErrorDivergencia si f devuelve NaN', () => {
        expect(() => eulerMejorado({ ...base, f: () => NaN })).toThrow(ErrorDivergencia);
    });

    test('lanza ErrorDivergencia si f devuelve Infinity', () => {
        expect(() => eulerMejorado({ ...base, f: () => Infinity })).toThrow(ErrorDivergencia);
    });

    test('lanza ErrorDivergencia si f no devuelve un número', () => {
        expect(() => eulerMejorado({ ...base, f: () => '1' })).toThrow(ErrorDivergencia);
        expect(() => eulerMejorado({ ...base, f: () => undefined })).toThrow(ErrorDivergencia);
    });

    test('detecta la explosión de dy/dx = y^2 (solución con singularidad en x = 1)', () => {
        expect(() =>
            eulerMejorado({ ...base, f: (x, y) => y * y, xFinal: 5 }),
        ).toThrow(ErrorDivergencia);
    });

    test('con dy/dx = -50y es estable con h pequeño e inestable con h grande', () => {
        const f = (x, y) => -50 * y;

        const estable = eulerMejorado({ f, x0: 0, y0: 1, h: 0.01, xFinal: 1 });
        expect(estable.convergio).toBe(true);
        expect(Math.abs(ultimoY(estable))).toBeLessThan(1e-10);

        expect(() =>
            eulerMejorado({ f, x0: 0, y0: 1, h: 0.1, xFinal: 40 }),
        ).toThrow(ErrorDivergencia);
    });

    test('lanza ErrorParametros si h produce una cantidad de pasos fuera de rango', () => {
        expect(() =>
            eulerMejorado({ f: (x, y) => y, x0: 0, y0: 1, h: 1e-10, xFinal: 1 }),
        ).toThrow(ErrorParametros);
    });
});

describe('Órdenes de convergencia - Euler (1), Euler mejorado (2) y Runge-Kutta 4 (4)', () => {
    const ultimoY = (r) => r.resultado[r.resultado.length - 1][1];

    const problemas = [
        { nombre: "y' = y, y(0) = 1", f: (x, y) => y, exacta: Math.exp(1) },
        { nombre: "y' = -2y, y(0) = 1", f: (x, y) => -2 * y, exacta: Math.exp(-2) },
    ];

    // RK4 usa pasos mayores para que su error no llegue al límite de la precisión de máquina.
    const metodos = [
        { nombre: 'Euler', resolver: euler, orden: 1, pasos: [0.1, 0.05, 0.025, 0.0125] },
        { nombre: 'Euler mejorado', resolver: eulerMejorado, orden: 2, pasos: [0.1, 0.05, 0.025, 0.0125] },
        { nombre: 'Runge-Kutta 4', resolver: rungeKutta4, orden: 4, pasos: [0.2, 0.1, 0.05, 0.025] },
    ];

    const errorGlobal = (resolver, f, h, exacta) =>
        Math.abs(ultimoY(resolver({ f, x0: 0, y0: 1, h, xFinal: 1 })) - exacta);

    // Orden observado: pendiente de la recta de mínimos cuadrados de ln(error) frente a ln(h).
    const ordenObservado = (pasos, errores) => {
        const xs = pasos.map((h) => Math.log(h));
        const ys = errores.map((e) => Math.log(e));
        const mediaX = xs.reduce((a, b) => a + b, 0) / xs.length;
        const mediaY = ys.reduce((a, b) => a + b, 0) / ys.length;
        const sxy = xs.reduce((acc, x, i) => acc + (x - mediaX) * (ys[i] - mediaY), 0);
        const sxx = xs.reduce((acc, x) => acc + (x - mediaX) ** 2, 0);

        return sxy / sxx;
    };

    metodos.forEach(({ nombre, resolver, orden, pasos }) => {
        problemas.forEach(({ nombre: problema, f, exacta }) => {
            test(`${nombre}: el error disminuye con orden observado cercano a ${orden} en ${problema}`, () => {
                const errores = pasos.map((h) => errorGlobal(resolver, f, h, exacta));

                for (let i = 1; i < errores.length; i++) {
                    expect(errores[i]).toBeLessThan(errores[i - 1]);
                }
                expect(Math.abs(ordenObservado(pasos, errores) - orden)).toBeLessThan(0.2);
            });

            test(`${nombre}: el error se divide por cerca de 2^${orden} al dividir h entre 2 en ${problema}`, () => {
                const errores = pasos.map((h) => errorGlobal(resolver, f, h, exacta));
                const esperada = 2 ** orden;

                for (let i = 1; i < errores.length; i++) {
                    const razon = errores[i - 1] / errores[i];
                    expect(razon).toBeGreaterThan(0.8 * esperada);
                    expect(razon).toBeLessThan(1.25 * esperada);
                }
            });
        });
    });

    test.each([0.1, 0.05])(
        'con h = %p, a mayor orden menor error: Euler > Euler mejorado > RK4',
        (h) => {
            const { f, exacta } = problemas[0];
            const errorEuler = errorGlobal(euler, f, h, exacta);
            const errorEulerMejorado = errorGlobal(eulerMejorado, f, h, exacta);
            const errorRK4 = errorGlobal(rungeKutta4, f, h, exacta);

            expect(errorEuler).toBeGreaterThan(10 * errorEulerMejorado);
            expect(errorEulerMejorado).toBeGreaterThan(500 * errorRK4);
        },
    );

    test.each([
        [0.1, 6e-2],
        [0.05, 3e-2],
        [0.01, 6e-3],
        [0.001, 6e-4],
    ])('Euler (orden 1): el error relativo con h = %p es menor que %p', (h, tolerancia) => {
        const { f, exacta } = problemas[0];

        expect(errorGlobal(euler, f, h, exacta) / exacta).toBeLessThan(tolerancia);
    });

    test.each([
        [0.2, 5e-5],
        [0.1, 2e-6],
        [0.05, 2e-7],
        [0.025, 1e-8],
    ])('Runge-Kutta 4 (orden 4): el error relativo con h = %p es menor que %p', (h, tolerancia) => {
        const { f, exacta } = problemas[0];

        expect(errorGlobal(rungeKutta4, f, h, exacta) / exacta).toBeLessThan(tolerancia);
    });

    test('RK4 con h = 0.2 es mucho más preciso que Euler con h = 0.001', () => {
        const { f, exacta } = problemas[0];
        const errorRK4 = errorGlobal(rungeKutta4, f, 0.2, exacta);
        const errorEuler = errorGlobal(euler, f, 0.001, exacta);

        expect(errorRK4).toBeLessThan(errorEuler / 10);
    });
});
