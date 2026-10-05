/**
 * Pruebas de integración - Verifica que los módulos se importen correctamente
 */

describe('Pruebas de integración', () => {
    test('debería importar error_relativo.js correctamente', async () => {
        const module = await import('../../../src/utils/error_relativo.js');
        expect(module).toBeDefined();
        expect(typeof module.errorAbsoluto).toBe('function');
        expect(typeof module.errorRelativo).toBe('function');
        expect(typeof module.errorPorcentual).toBe('function');
        expect(typeof module.errorRelativoAproximado).toBe('function');
    });

    test('errorAbsoluto(3.14159, 3.14) debería ser ~0.00159', async () => {
        const { errorAbsoluto } = await import('../../../src/utils/error_relativo.js');
        const result = errorAbsoluto(3.14159, 3.14);
        expect(result).toBeCloseTo(0.00159, 4);
    });

    test('errorRelativo(1, 0.9) debería ser 0.1', async () => {
        const { errorRelativo } = await import('../../../src/utils/error_relativo.js');
        const result = errorRelativo(1, 0.9);
        expect(result).toBeCloseTo(0.1, 4);
    });

    test('errorPorcentual(100, 95) debería ser 5', async () => {
        const { errorPorcentual } = await import('../../../src/utils/error_relativo.js');
        const result = errorPorcentual(100, 95);
        expect(result).toBe(5);
    });

    test('errorRelativo(0, 5) debería lanzar error', async () => {
        const { errorRelativo } = await import('../../../src/utils/error_relativo.js');
        expect(() => errorRelativo(0, 5)).toThrow('El valor verdadero no puede ser 0');
    });

    test('debería cargar src/index.js completo sin lanzar excepciones y contener todas las categorías esperadas', async () => {
        const module = await import('../../../src/index.js');
        expect(module).toBeDefined();
        expect(module.default).toBeDefined();
        const categoriasEsperadas = [
            'lineales',
            'noLineales',
            'interpolacion',
            'integracion',
            'edo',
            'analisis',
            'diferencias',
            'matricial',
            'polinomios',
            'estadistica'
        ];
        const claves = Object.keys(module.default);
        expect(claves).toEqual(expect.arrayContaining(categoriasEsperadas));
        expect(new Set(claves).size).toBe(claves.length);
    });
});
