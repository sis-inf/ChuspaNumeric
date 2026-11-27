import { parsearExpresion } from '../../../src/utils/parser_expresiones.js';

describe('parsearExpresion', () => {
    test('evalúa x^2 - 4 en x = 2 y devuelve 0', () => {
        const f = parsearExpresion('x^2 - 4');
        expect(f(2)).toBe(0);
    });

    test('evalúa x^2 - 4 en x = 3 y devuelve 5', () => {
        const f = parsearExpresion('x^2 - 4');
        expect(f(3)).toBe(5);
    });

    test('lanza Error cuando la expresión es una cadena vacía', () => {
        expect(() => parsearExpresion('')).toThrow(Error);
    });

    test('lanza Error cuando la expresión no es un string', () => {
        expect(() => parsearExpresion(5)).toThrow(Error);
    });

    test('lanza Error cuando la sintaxis es inválida', () => {
        expect(() => parsearExpresion('x +')).toThrow(Error);
    });

    test('lanza Error cuando el resultado no es finito (1/x en x = 0)', () => {
        const f = parsearExpresion('1/x');
        expect(() => f(0)).toThrow(Error);
    });

    test('lanza Error cuando x es NaN', () => {
        const f = parsearExpresion('x');
        expect(() => f(NaN)).toThrow(Error);
    });
});