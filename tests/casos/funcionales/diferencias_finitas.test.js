
import {
    diferenciaCentrada,
    diferenciaCentradaSegundaDerivada
} from '../../../src/diferencias/diferencia_centrada.js';

import {
    diferenciasAdelanteGrado1,
    derivadaAdelanteOrden2
} from '../../../src/diferencias/diferencia_hacia_adelante.js';

import {
    diferenciasAtrasGrado1,
    derivadaAtrasOrden2
} from '../../../src/diferencias/diferencia_hacia_atras.js';

describe('Diferencia centrada de primera derivada', () => {
    test('calcula correctamente la derivada de una función cúbica', () => {
        const f = x => x ** 3;
        const resultado = diferenciaCentrada(f, 2, 0.01);

        expect(resultado).toBeCloseTo(12.0001, 8);
    });

    test('el error disminuye al reducir el tamaño del paso', () => {
        const f = Math.sin;
        const valorReal = Math.cos(1);

        const errorGrande = Math.abs(
            diferenciaCentrada(f, 1, 0.2) - valorReal
        );

        const errorPequeno = Math.abs(
            diferenciaCentrada(f, 1, 0.1) - valorReal
        );

        expect(errorPequeno).toBeLessThan(errorGrande);
    });

    test('presenta convergencia de orden dos', () => {
        const f = Math.sin;
        const valorReal = Math.cos(1);

        const errorH = Math.abs(
            diferenciaCentrada(f, 1, 0.2) - valorReal
        );

        const errorH2 = Math.abs(
            diferenciaCentrada(f, 1, 0.1) - valorReal
        );

        expect(errorH / errorH2).toBeGreaterThan(3.5);
    });

    test('rechaza un paso igual a cero', () => {
        expect(() => diferenciaCentrada(Math.sin, 1, 0)).toThrow();
    });

    test('rechaza un paso infinito', () => {
        expect(() => diferenciaCentrada(Math.sin, 1, Infinity)).toThrow();
    });

    test('rechaza una función inválida', () => {
        expect(() => diferenciaCentrada(5, 1, 0.1)).toThrow();
    });

    test('rechaza una posición no numérica', () => {
        expect(() => diferenciaCentrada(Math.sin, NaN, 0.1)).toThrow();
    });
});

describe('Diferencia centrada de segunda derivada', () => {
    test('calcula correctamente la segunda derivada de una función cúbica', () => {
        const f = x => x ** 3;
        const resultado = diferenciaCentradaSegundaDerivada(f, 2, 0.1);

        expect(resultado).toBeCloseTo(12, 8);
    });

    test('el error disminuye al reducir el tamaño del paso', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const errorGrande = Math.abs(
            diferenciaCentradaSegundaDerivada(f, 1, 0.2) - valorReal
        );

        const errorPequeno = Math.abs(
            diferenciaCentradaSegundaDerivada(f, 1, 0.1) - valorReal
        );

        expect(errorPequeno).toBeLessThan(errorGrande);
    });

    test('presenta convergencia de orden dos', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const errorH = Math.abs(
            diferenciaCentradaSegundaDerivada(f, 1, 0.2) - valorReal
        );

        const errorH2 = Math.abs(
            diferenciaCentradaSegundaDerivada(f, 1, 0.1) - valorReal
        );

        expect(errorH / errorH2).toBeGreaterThan(3.5);
    });

    test('rechaza un paso igual a cero', () => {
        expect(() =>
            diferenciaCentradaSegundaDerivada(Math.exp, 1, 0)
        ).toThrow();
    });

    test('rechaza una función inválida', () => {
        expect(() =>
            diferenciaCentradaSegundaDerivada(5, 1, 0.1)
        ).toThrow();
    });
});

describe('Diferencias hacia adelante de primer orden', () => {
    test('calcula correctamente la derivada de una función cúbica', () => {
        const f = x => x ** 3;
        const resultado = diferenciasAdelanteGrado1(f, 2, 0.001);

        expect(resultado).toBeCloseTo(12.006001, 8);
    });

    test('el error relativo disminuye al reducir el paso', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const resultadoGrande = diferenciasAdelanteGrado1(f, 1, 0.1);
        const resultadoPequeno = diferenciasAdelanteGrado1(f, 1, 0.01);

        const errorGrande = Math.abs(
            (resultadoGrande - valorReal) / valorReal
        );

        const errorPequeno = Math.abs(
            (resultadoPequeno - valorReal) / valorReal
        );

        expect(errorPequeno).toBeLessThan(errorGrande);
    });

    test('presenta convergencia de primer orden', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const errorH = Math.abs(
            diferenciasAdelanteGrado1(f, 1, 0.2) - valorReal
        );

        const errorH2 = Math.abs(
            diferenciasAdelanteGrado1(f, 1, 0.1) - valorReal
        );

        expect(errorH / errorH2).toBeGreaterThan(1.8);
    });

    test('rechaza un paso igual a cero', () => {
        expect(() =>
            diferenciasAdelanteGrado1(Math.sin, 1, 0)
        ).toThrow();
    });

    test('rechaza una función inválida', () => {
        expect(() =>
            diferenciasAdelanteGrado1(5, 1, 0.1)
        ).toThrow();
    });

    test('rechaza una posición infinita', () => {
        expect(() =>
            diferenciasAdelanteGrado1(Math.sin, Infinity, 0.1)
        ).toThrow();
    });
});

describe('Diferencias hacia atrás de primer orden', () => {
    test('calcula correctamente la derivada de una función cúbica', () => {
        const f = x => x ** 3;
        const resultado = diferenciasAtrasGrado1(f, 2, 0.001);

        expect(resultado).toBeCloseTo(11.994001, 8);
    });

    test('el error relativo disminuye al reducir el paso', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const resultadoGrande = diferenciasAtrasGrado1(f, 1, 0.1);
        const resultadoPequeno = diferenciasAtrasGrado1(f, 1, 0.01);

        const errorGrande = Math.abs(
            (resultadoGrande - valorReal) / valorReal
        );

        const errorPequeno = Math.abs(
            (resultadoPequeno - valorReal) / valorReal
        );

        expect(errorPequeno).toBeLessThan(errorGrande);
    });

    test('presenta convergencia de primer orden', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const errorH = Math.abs(
            diferenciasAtrasGrado1(f, 1, 0.2) - valorReal
        );

        const errorH2 = Math.abs(
            diferenciasAtrasGrado1(f, 1, 0.1) - valorReal
        );

        expect(errorH / errorH2).toBeGreaterThan(1.8);
    });

    test('rechaza un paso igual a cero', () => {
        expect(() =>
            diferenciasAtrasGrado1(Math.sin, 1, 0)
        ).toThrow();
    });
});

describe('Diferencias de tres puntos', () => {
    test.each([
        ['adelante', derivadaAdelanteOrden2],
        ['atrás', derivadaAtrasOrden2]
    ])('calcula correctamente la derivada usando tres puntos hacia %s', (_, metodo) => {
        const f = x => x ** 3;
        const resultado = metodo(f, 2, 0.1);

        expect(resultado).toBeCloseTo(11.98, 8);
    });

    test.each([
        ['adelante', derivadaAdelanteOrden2],
        ['atrás', derivadaAtrasOrden2]
    ])('presenta convergencia de orden dos hacia %s', (_, metodo) => {
        const f = Math.exp;
        const valorReal = Math.exp(1);

        const errorH = Math.abs(metodo(f, 1, 0.2) - valorReal);
        const errorH2 = Math.abs(metodo(f, 1, 0.1) - valorReal);

        expect(errorH / errorH2).toBeGreaterThan(3.5);
    });

    test.each([
        ['adelante', derivadaAdelanteOrden2],
        ['atrás', derivadaAtrasOrden2]
    ])('rechaza un paso igual a cero hacia %s', (_, metodo) => {
        expect(() => metodo(Math.sin, 1, 0)).toThrow();
    });
});

describe('Precisión y errores numéricos', () => {
    test('identifica una aproximación con paso demasiado grande', () => {
        const f = Math.exp;
        const valorReal = Math.exp(1);
        const resultado = diferenciasAdelanteGrado1(f, 1, 1);

        const error = Math.abs(resultado - valorReal);

        expect(error).toBeGreaterThan(0.01);
    });
});
