
import { diferenciasAtrasGrado1 } from '../../../src/diferencias/diferencia_hacia_atras.js';

describe('diferenciasAtrasGrado1 - diferencias finitas hacia atrás', () => {
  test('aproxima la derivada de f(x) = x² en x=2', () => {
    const resultado = diferenciasAtrasGrado1((x) => x * x, 2, 0.001);

    expect(Math.abs(resultado - 4)).toBeLessThan(0.01);
  });

  test('calcula la derivada de una función lineal y devuelve 3', () => {
    const f = (x) => 3 * x + 1;
    const resultado = diferenciasAtrasGrado1(f, 5, 1);

    expect(resultado).toBe(3);
  });

  test('lanza un error cuando h es cero', () => {
    const f = (x) => x * x;

    expect(() => diferenciasAtrasGrado1(f, 2, 0)).toThrow(
      new Error('El tamaño del paso h no puede ser cero.')
    );
  });

  test('acepta un valor negativo de h y calcula la diferencia hacia adelante', () => {
    const f = (x) => x * x;
    const resultado = diferenciasAtrasGrado1(f, 2, -0.001);

    expect(resultado).toBeCloseTo(4, 2);
  });
});