import { afterEach, describe, expect, jest, test } from '@jest/globals';
import { verificarVersion } from '../../../src/cli/verificar_version.js';

const fetchOriginal = globalThis.fetch;
const consoleLogOriginal = console.log;

function restaurarGlobales() {
    globalThis.fetch = fetchOriginal;
    console.log = consoleLogOriginal;
}

afterEach(() => {
    restaurarGlobales();
    jest.clearAllTimers();
    jest.useRealTimers();
});

describe('verificarVersion', () => {
    test('imprime un mensaje cuando el CLI está actualizado', async () => {
        globalThis.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ version: '1.0.0' }),
        });

        console.log = jest.fn();

        await verificarVersion();

        expect(console.log).toHaveBeenCalledWith(
            'El CLI está actualizado.'
        );
    });

    test('imprime un mensaje cuando existe una nueva versión', async () => {
        globalThis.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ version: '2.0.0' }),
        });

        console.log = jest.fn();

        await verificarVersion();

        expect(console.log).toHaveBeenCalledWith(
            'Hay una nueva versión disponible: 2.0.0'
        );
    });

    test('no imprime nada cuando la respuesta no es correcta', async () => {
        globalThis.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ version: '2.0.0' }),
        });

        console.log = jest.fn();

        await verificarVersion();

        expect(console.log).not.toHaveBeenCalled();
    });

    test('no lanza una excepción cuando fetch rechaza la promesa', async () => {
        jest.useFakeTimers();

        globalThis.fetch = jest.fn().mockRejectedValue(
            new Error('Error de conexión')
        );

        console.log = jest.fn();

        await expect(verificarVersion()).resolves.toBeUndefined();

        expect(console.log).not.toHaveBeenCalled();
    });

    test('restaura fetch y console.log', () => {
        globalThis.fetch = jest.fn();
        console.log = jest.fn();

        restaurarGlobales();

        expect(globalThis.fetch).toBe(fetchOriginal);
        expect(console.log).toBe(consoleLogOriginal);
    });
});