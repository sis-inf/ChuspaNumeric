import {
    validarNumero,
    validarFuncion,
    validarTolerancia,
    validarIteraciones,
    verificarDivergencia,
} from '../../../src/utils/validaciones.js';

describe('validarNumero', () => {
    test('acepta un número válido', () => {
        expect(() => validarNumero(5)).not.toThrow();
        expect(() => validarNumero(3.14)).not.toThrow();
        expect(() => validarNumero(-2)).not.toThrow();
    });

    test('rechaza valores no numéricos', () => {
        expect(() => validarNumero('5')).toThrow();
        expect(() => validarNumero(null)).toThrow();
        expect(() => validarNumero(undefined)).toThrow();
        expect(() => validarNumero(NaN)).toThrow();
    });
});

describe('validarFuncion', () => {
    test('acepta una función', () => {
        expect(() => validarFuncion(() => {})).not.toThrow();
        expect(() => validarFuncion(() => {})).not.toThrow();
        expect(() => validarFuncion(x => x * 2)).not.toThrow();
    });

    test('rechaza valores que no son funciones', () => {
        expect(() => validarFuncion(5)).toThrow();
        expect(() => validarFuncion('function')).toThrow();
        expect(() => validarFuncion(null)).toThrow();
        expect(() => validarFuncion({})).toThrow();
    });
});

describe('validarTolerancia', () => {
    test('acepta diferentes tolerancias positivas y estrictas', () => {
        expect(() => validarTolerancia(1e-3)).not.toThrow();
        expect(() => validarTolerancia(1e-6)).not.toThrow();
        expect(() => validarTolerancia(1e-12)).not.toThrow();
    });

    test('rechaza tolerancias invalidas o fuera de dominio', () => {
        expect(() => validarTolerancia(0)).toThrow();
        expect(() => validarTolerancia(-1e-6)).toThrow();
        expect(() => validarTolerancia(NaN)).toThrow();
        expect(() => validarTolerancia(Infinity)).toThrow();
    });
});

describe('validarNumero con tamanos de paso', () => {
    test('acepta pasos finitos de diferentes magnitudes', () => {
        expect(() => validarNumero(0.1, 'h')).not.toThrow();
        expect(() => validarNumero(0.01, 'h')).not.toThrow();
        expect(() => validarNumero(1e-8, 'h')).not.toThrow();
    });

    test('rechaza pasos no finitos', () => {
        expect(() => validarNumero(NaN, 'h')).toThrow();
        expect(() => validarNumero(Infinity, 'h')).toThrow();
        expect(() => validarNumero(-Infinity, 'h')).toThrow();
    });
});

describe('validarIteraciones', () => {
    test('acepta cantidades enteras positivas', () => {
        expect(() => validarIteraciones(1)).not.toThrow();
        expect(() => validarIteraciones(10)).not.toThrow();
        expect(() => validarIteraciones(100)).not.toThrow();
    });

    test('rechaza limites de iteracion invalidos', () => {
        expect(() => validarIteraciones(0)).toThrow();
        expect(() => validarIteraciones(-5)).toThrow();
        expect(() => validarIteraciones(1.5)).toThrow();
        expect(() => validarIteraciones(Infinity)).toThrow();
    });
});

describe('verificarDivergencia', () => {
    test('acepta valores finitos en distintas iteraciones', () => {
        expect(() =>
            verificarDivergencia(1.5, 'metodoNumerico', 1)
        ).not.toThrow();

        expect(() =>
            verificarDivergencia(1.05, 'metodoNumerico', 2)
        ).not.toThrow();

        expect(() =>
            verificarDivergencia(1.005, 'metodoNumerico', 3)
        ).not.toThrow();
    });

    test('detecta divergencia numerica con NaN e infinitos', () => {
        expect(() =>
            verificarDivergencia(NaN, 'metodoNumerico', 4)
        ).toThrow(/divergencia numérica detectada/);

        expect(() =>
            verificarDivergencia(Infinity, 'metodoNumerico', 5)
        ).toThrow(/divergencia numérica detectada/);

        expect(() =>
            verificarDivergencia(-Infinity, 'metodoNumerico', 6)
        ).toThrow(/divergencia numérica detectada/);
    });
});
