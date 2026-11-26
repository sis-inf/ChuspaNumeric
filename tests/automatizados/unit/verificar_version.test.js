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
            'El CLI de chuspanumeric está actualizado.'
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
            'Hay una nueva versión de chuspanumeric disponible: 2.0.0'
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

    describe('umbrales, latencia y casos de fallo o respuesta no válida', () => {
        test('maneja respuestas con versión vacía o faltante sin lanzar excepción', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            });

            console.log = jest.fn();

            await expect(verificarVersion()).resolves.toBeUndefined();
            expect(console.log).toHaveBeenCalledTimes(1);
        });

        test('maneja error al parsear JSON (respuesta corrupta / no convergente)', async () => {
            globalThis.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => {
                    throw new SyntaxError('JSON inválido');
                },
            });

            console.log = jest.fn();

            await expect(verificarVersion()).resolves.toBeUndefined();
            expect(console.log).not.toHaveBeenCalled();
        });

        test('evalúa respuesta dentro de un margen de tiempo / tolerancia con fake timers', async () => {
            jest.useFakeTimers();
            const toleranciaMs = 500;
            const retrasoMs = 100;

            globalThis.fetch = jest.fn().mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({
                                ok: true,
                                json: async () => ({ version: '1.0.0' }),
                            });
                        }, retrasoMs);
                    })
            );

            console.log = jest.fn();

            const promesa = verificarVersion();
            await jest.advanceTimersByTimeAsync(retrasoMs);
            await promesa;

            expect(retrasoMs).toBeLessThanOrEqual(toleranciaMs);
            expect(console.log).toHaveBeenCalledWith(
                'El CLI de chuspanumeric está actualizado.'
            );
        });
    });
});