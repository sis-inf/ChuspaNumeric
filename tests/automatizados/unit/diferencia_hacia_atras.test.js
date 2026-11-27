import {
  diferenciasAtrasGrado1,
  derivadaAtrasOrden2,
} from '../../../src/diferencias/diferencia_hacia_atras.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('diferenciasAtrasGrado1 - diferencias finitas hacia atrás (orden O(h))', () => {
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

  test('reduce el error relativo linealmente O(h) al reducir el tamaño de paso', () => {
    const f = (x) => Math.exp(x);
    const x0 = 1;
    const exacta = Math.exp(x0);

    const errH1 = Math.abs(diferenciasAtrasGrado1(f, x0, 0.1) - exacta) / exacta;
    const errH2 = Math.abs(diferenciasAtrasGrado1(f, x0, 0.01) - exacta) / exacta;
    const errH3 = Math.abs(diferenciasAtrasGrado1(f, x0, 0.0001) - exacta) / exacta;

    expect(errH1).toBeLessThan(0.1);
    expect(errH2).toBeLessThan(0.01);
    expect(errH3).toBeLessThan(1e-4);
    expect(errH2).toBeLessThan(errH1);
    expect(errH3).toBeLessThan(errH2);
  });
});

describe('derivadaAtrasOrden2 - diferencias finitas hacia atrás de 3 puntos (orden O(h²))', () => {
  test('calcula exactamente la derivada de polinomios cuadráticos f(x) = 2x² - 3x + 5', () => {
    const f = (x) => 2 * x * x - 3 * x + 5;
    // f'(x) = 4x - 3 => f'(3) = 9
    const resultado = derivadaAtrasOrden2(f, 3, 0.05);

    expect(resultado).toBeCloseTo(9, 12);
  });

  test('evalúa diferentes tamaños de paso y tolerancias estrictas en f(x) = sin(x)', () => {
    const f = (x) => Math.sin(x);
    const x0 = Math.PI / 4;
    const exacta = Math.cos(x0);

    const resPasoGrande = derivadaAtrasOrden2(f, x0, 0.1);
    const resPasoMedio = derivadaAtrasOrden2(f, x0, 0.01);
    const resPasoFino = derivadaAtrasOrden2(f, x0, 0.001);

    const errGrande = Math.abs(resPasoGrande - exacta) / exacta;
    const errMedio = Math.abs(resPasoMedio - exacta) / exacta;
    const errFino = Math.abs(resPasoFino - exacta) / exacta;

    expect(errGrande).toBeLessThan(1e-2);
    expect(errMedio).toBeLessThan(1e-4);
    expect(errFino).toBeLessThan(1e-6);
  });

  test('verifica convergencia cuadrática O(h²) frente a convergencia lineal O(h)', () => {
    const f = (x) => x ** 4;
    const x0 = 2;
    const exacta = 32; // f'(2) = 4 * 2³ = 32
    const h = 0.01;

    const errOrden1 = Math.abs(diferenciasAtrasGrado1(f, x0, h) - exacta) / exacta;
    const errOrden2 = Math.abs(derivadaAtrasOrden2(f, x0, h) - exacta) / exacta;

    // Para el mismo paso h, el método de orden 2 debe ser significativamente más preciso
    expect(errOrden2).toBeLessThan(errOrden1);
    expect(errOrden2).toBeLessThan(1e-4);

    // Al dividir h entre 2 en orden 2, el error se reduce ~4 veces
    const errOrden2Mitad = Math.abs(derivadaAtrasOrden2(f, x0, h / 2) - exacta) / exacta;
    const razonConvergencia = errOrden2 / errOrden2Mitad;
    expect(razonConvergencia).toBeGreaterThan(3.8);
    expect(razonConvergencia).toBeLessThan(4.2);
  });

  describe('validación de parámetros y detección de no convergencia / divergencia', () => {
    test('lanza ErrorParametros cuando h <= 0 o cuando los parámetros son inválidos', () => {
      const f = (x) => x ** 3;

      expect(() => derivadaAtrasOrden2(f, 2, 0)).toThrow(ErrorParametros);
      expect(() => derivadaAtrasOrden2(f, 2, 0)).toThrow('El parámetro h debe ser positivo.');
      expect(() => derivadaAtrasOrden2(f, 2, -0.01)).toThrow(ErrorParametros);
      expect(() => derivadaAtrasOrden2('no_es_funcion', 2, 0.01)).toThrow(ErrorParametros);
      expect(() => derivadaAtrasOrden2(f, NaN, 0.01)).toThrow(ErrorParametros);
      expect(() => derivadaAtrasOrden2(f, 2, Infinity)).toThrow(ErrorParametros);
    });

    test('detecta divergencia / valores no finitos en puntos singulares o fuera de dominio', () => {
      // Singularidad en x = 2: f(x) = 1 / (x - 2)
      const singular = (x) => 1 / (x - 2);
      const resSingular = derivadaAtrasOrden2(singular, 2, 0.01);
      expect(Number.isFinite(resSingular)).toBe(false);

      // Fuera de dominio real (raíz cuadrada de números negativos)
      const dominioNegativo = (x) => Math.sqrt(x);
      const resNaN = derivadaAtrasOrden2(dominioNegativo, 0.005, 0.01);
      expect(Number.isNaN(resNaN)).toBe(true);
    });

    test('detecta pérdida de convergencia por error de redondeo cuando h es extremadamente pequeño', () => {
      const f = (x) => Math.exp(x);
      const x0 = 1;
      const exacta = Math.exp(x0);

      // Con h = 1e-16 (por debajo de precisión de máquina), f(x) - f(x - h) colapsa a 0
      const resColapsado = derivadaAtrasOrden2(f, x0, 1e-16);
      const errorRelativo = Math.abs(resColapsado - exacta) / exacta;

      expect(errorRelativo).toBeGreaterThan(0.5);
    });
  });
});