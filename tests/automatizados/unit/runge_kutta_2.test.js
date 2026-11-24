import {
    metodHeun,
    metodoPuntoMedio
} from '../../../src/edo/runge_kutta_2.js';

describe('Métodos EDO - Runge-Kutta 2', () => {
    const f = (t, y) => -y;
    const valorEsperado = Math.exp(-0.1);

    test('Método de Heun aproxima correctamente y(0.1)', () => {
        const resultado = metodHeun(f, 1, 0, 0.1, 0.1);

        expect(resultado).toBeDefined();
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBe(2);

        expect(resultado[0]).toEqual({
            t: 0,
            y: 1
        });

        expect(resultado[1].t).toBeCloseTo(0.1);
        expect(resultado[1].y).toBeCloseTo(valorEsperado, 2);
    });

    test('Método del Punto Medio aproxima correctamente y(0.1)', () => {
        const resultado = metodoPuntoMedio(f, 1, 0, 0.1, 0.1);

        expect(resultado).toBeDefined();
        expect(Array.isArray(resultado)).toBe(true);
        expect(resultado.length).toBe(2);

        expect(resultado[0]).toEqual({
            t: 0,
            y: 1
        });

        expect(resultado[1].t).toBeCloseTo(0.1);
        expect(resultado[1].y).toBeCloseTo(valorEsperado, 2);
    });

    test('Heun y Punto Medio tienen una precisión similar para y(0.1)', () => {
        const resultadoHeun = metodHeun(f, 1, 0, 0.1, 0.1);
        const resultadoPuntoMedio = metodoPuntoMedio(f, 1, 0, 0.1, 0.1);

        const errorHeun = Math.abs(resultadoHeun[1].y - valorEsperado);
        const errorPuntoMedio = Math.abs(resultadoPuntoMedio[1].y - valorEsperado);

        expect(errorHeun).toBeLessThan(0.01);
        expect(errorPuntoMedio).toBeLessThan(0.01);
        expect(errorHeun).toBeCloseTo(errorPuntoMedio, 3);
    });

    test('Heun reduce el error al disminuir el tamaño de paso', () => {
        const solucionExacta = Math.exp(-1);

        const resultadoH1 = metodHeun(f, 1, 0, 1, 0.1);
        const resultadoH2 = metodHeun(f, 1, 0, 1, 0.05);
        const resultadoH3 = metodHeun(f, 1, 0, 1, 0.025);

        const errorH1 = Math.abs(resultadoH1.at(-1).y - solucionExacta);
        const errorH2 = Math.abs(resultadoH2.at(-1).y - solucionExacta);
        const errorH3 = Math.abs(resultadoH3.at(-1).y - solucionExacta);

        expect(errorH2).toBeLessThan(errorH1);
        expect(errorH3).toBeLessThan(errorH2);
    });

    test('Punto Medio reduce el error al disminuir el tamaño de paso', () => {
        const solucionExacta = Math.exp(-1);

        const resultadoH1 = metodoPuntoMedio(f, 1, 0, 1, 0.1);
        const resultadoH2 = metodoPuntoMedio(f, 1, 0, 1, 0.05);
        const resultadoH3 = metodoPuntoMedio(f, 1, 0, 1, 0.025);

        const errorH1 = Math.abs(resultadoH1.at(-1).y - solucionExacta);
        const errorH2 = Math.abs(resultadoH2.at(-1).y - solucionExacta);
        const errorH3 = Math.abs(resultadoH3.at(-1).y - solucionExacta);

        expect(errorH2).toBeLessThan(errorH1);
        expect(errorH3).toBeLessThan(errorH2);
    });

    test('Heun y Punto Medio mantienen errores relativos decrecientes', () => {
        const solucionExacta = Math.exp(-1);
        const pasos = [0.1, 0.05, 0.025];

        const erroresRelativosHeun = pasos.map(h => {
            const resultado = metodHeun(f, 1, 0, 1, h);
            return Math.abs((resultado.at(-1).y - solucionExacta) / solucionExacta);
        });

        const erroresRelativosPuntoMedio = pasos.map(h => {
            const resultado = metodoPuntoMedio(f, 1, 0, 1, h);
            return Math.abs((resultado.at(-1).y - solucionExacta) / solucionExacta);
        });

        expect(erroresRelativosHeun[1]).toBeLessThan(erroresRelativosHeun[0]);
        expect(erroresRelativosHeun[2]).toBeLessThan(erroresRelativosHeun[1]);

        expect(erroresRelativosPuntoMedio[1]).toBeLessThan(erroresRelativosPuntoMedio[0]);
        expect(erroresRelativosPuntoMedio[2]).toBeLessThan(erroresRelativosPuntoMedio[1]);
    });
});
