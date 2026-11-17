import { buscarTodasLasRaices } from '../../../src/no-lineales/buscar_raices.js';
import { ErrorParametros } from '../../../src/core/errores.js';

// f(x) = x² - 4, raíces conocidas en -2 y 2
const cuadratica = (x) => x * x - 4;

describe('buscarTodasLasRaices - raíces conocidas', () => {
  test('localiza las raíces de x² - 4 dentro de la tolerancia configurada', () => {
    const tolerancia = 1e-8;

    const res = buscarTodasLasRaices({ f: cuadratica, inicio: -5, fin: 5, paso: 0.3, tolerancia });

    expect(res.resultado).toHaveLength(2);
    expect(Math.abs(res.resultado[0] + 2)).toBeLessThan(tolerancia);
    expect(Math.abs(res.resultado[1] - 2)).toBeLessThan(tolerancia);
    expect(res.convergio).toBe(true);
  });

  test('localiza las raíces de sin(x) en [0.5, 10]', () => {
    const tolerancia = 1e-6;

    const res = buscarTodasLasRaices({ f: Math.sin, inicio: 0.5, fin: 10, paso: 0.5, tolerancia });

    expect(res.resultado).toHaveLength(3);
    expect(Math.abs(res.resultado[0] - Math.PI)).toBeLessThan(tolerancia);
    expect(Math.abs(res.resultado[1] - 2 * Math.PI)).toBeLessThan(tolerancia);
    expect(Math.abs(res.resultado[2] - 3 * Math.PI)).toBeLessThan(tolerancia);
  });

  test('marca como exacta una raíz que cae justo en un extremo de la malla', () => {
    const res = buscarTodasLasRaices({ f: (x) => x, inicio: -1, fin: 1, paso: 0.5 });

    expect(res.resultado).toEqual([0]);
    expect(res.iteraciones[0]).toEqual({
      raiz: 0,
      intervalo: [0, 0],
      convergio: true,
      iteraciones: [],
      exacta: true,
    });
  });

  test('con pocas iteraciones informa que la bisección no convergió', () => {
    const res = buscarTodasLasRaices({ f: (x) => x * x - 2, inicio: 0, fin: 3, paso: 1, maxIter: 2 });

    expect(res.resultado).toHaveLength(1);
    expect(res.convergio).toBe(false);
    expect(res.iteraciones[0].iteraciones).toHaveLength(2);
  });
});

describe('buscarTodasLasRaices - sin cambio de signo', () => {
  test('devuelve una lista vacía si ningún subintervalo cambia de signo', () => {
    const res = buscarTodasLasRaices({ f: (x) => x * x + 1, inicio: -3, fin: 3, paso: 0.5 });

    expect(res.resultado).toEqual([]);
    expect(res.iteraciones).toEqual([]);
    expect(res.convergio).toBe(true);
    expect(res.mensaje).toBe('Se encontraron 0 raíz(es) en el intervalo [-3, 3].');
  });

  test('no detecta una raíz donde la función toca el eje X sin cruzarlo', () => {
    // (x - 1)² tiene raíz en x = 1 pero no cambia de signo; la malla no pasa por 1
    const res = buscarTodasLasRaices({ f: (x) => (x - 1) ** 2, inicio: 0.05, fin: 2, paso: 0.3 });

    expect(res.resultado).toEqual([]);
  });

  test('solo detecta esa raíz si cae exactamente en un punto de la malla', () => {
    const res = buscarTodasLasRaices({ f: (x) => (x - 1) ** 2, inicio: 0, fin: 2, paso: 0.5 });

    expect(res.resultado).toEqual([1]);
    expect(res.iteraciones[0].exacta).toBe(true);
  });
});

describe('buscarTodasLasRaices - estructura del resultado', () => {
  test('sigue el contrato de ChuspaNumeric con las raíces ordenadas', () => {
    const res = buscarTodasLasRaices({ f: cuadratica, inicio: -5, fin: 5, paso: 0.3, tolerancia: 1e-8 });

    expect(Object.keys(res).sort()).toEqual(['convergio', 'iteraciones', 'mensaje', 'meta', 'resultado']);
    expect(res.resultado).toEqual([...res.resultado].sort((a, b) => a - b));
    expect(res.mensaje).toBe('Se encontraron 2 raíz(es) en el intervalo [-5, 5].');
    expect(res.meta.metodo).toBe('buscarTodasLasRaices');
    expect(res.meta.parametros).toEqual({
      inicio: -5,
      fin: 5,
      paso: 0.3,
      tolerancia: 1e-8,
      maxIter: 100,
      paralelo: false,
      maxWorkers: undefined,
    });
    expect(typeof res.meta.tiempo_ms).toBe('number');
  });

  test('cada elemento de iteraciones describe el subintervalo resuelto', () => {
    const res = buscarTodasLasRaices({ f: cuadratica, inicio: -5, fin: 5, paso: 0.3 });

    for (const item of res.iteraciones) {
      expect(Object.keys(item).sort()).toEqual(['convergio', 'exacta', 'intervalo', 'iteraciones', 'raiz']);
      expect(item.exacta).toBe(false);
      expect(item.intervalo[0]).toBeLessThan(item.raiz);
      expect(item.intervalo[1]).toBeGreaterThan(item.raiz);
      expect(item.iteraciones.length).toBeGreaterThan(0);
      expect(Object.keys(item.iteraciones[0]).sort()).toEqual(['a', 'b', 'c', 'error', 'fa', 'fb', 'fc', 'n']);
    }
  });
});

describe('buscarTodasLasRaices - parámetros inválidos', () => {
  const base = { f: Math.sin, inicio: 0, fin: 1, paso: 0.1 };

  test.each([
    ['f no es función', { f: 5 }],
    ['inicio no es un número finito', { inicio: NaN }],
    ['inicio mayor que fin', { inicio: 2, fin: 1 }],
    ['inicio igual a fin', { inicio: 1, fin: 1 }],
    ['paso igual a cero', { paso: 0 }],
    ['paso negativo', { paso: -1 }],
    ['paso infinito', { paso: Infinity }],
    ['tolerancia igual a cero', { tolerancia: 0 }],
    ['maxIter no entero', { maxIter: 1.5 }],
  ])('lanza ErrorParametros cuando %s', (_caso, cambios) => {
    expect(() => buscarTodasLasRaices({ ...base, ...cambios })).toThrow(ErrorParametros);
  });

  test('lanza ErrorParametros si la función devuelve un valor no finito', () => {
    expect(() => buscarTodasLasRaices({ ...base, f: () => NaN })).toThrow(ErrorParametros);
  });

  test('valida los parámetros antes de lanzar la búsqueda paralela', () => {
    expect(() => buscarTodasLasRaices({ ...base, paso: 0, paralelo: true })).toThrow(ErrorParametros);
  });
});

describe('buscarTodasLasRaices - búsqueda secuencial y paralela', () => {
  // En modo paralelo la función se serializa con toString(): no puede usar closures.
  const seno = (x) => Math.sin(x);

  test('el modo secuencial devuelve el resultado directamente', () => {
    const res = buscarTodasLasRaices({ f: seno, inicio: 0.5, fin: 10, paso: 0.5 });

    expect(res).not.toBeInstanceOf(Promise);
    expect(res.meta.parametros.paralelo).toBe(false);
  });

  test('el modo paralelo devuelve una Promise con las mismas raíces que el secuencial', async () => {
    const secuencial = buscarTodasLasRaices({ f: seno, inicio: 0.5, fin: 10, paso: 0.5 });
    const promesa = buscarTodasLasRaices({ f: seno, inicio: 0.5, fin: 10, paso: 0.5, paralelo: true, maxWorkers: 2 });

    expect(promesa).toBeInstanceOf(Promise);

    const paralelo = await promesa;

    expect(paralelo.resultado).toEqual(secuencial.resultado);
    expect(paralelo.meta.parametros.paralelo).toBe(true);
    expect(paralelo.meta.parametros.maxWorkers).toBe(2);
    expect(paralelo.iteraciones.every((item) => item.workerThread === true)).toBe(true);
  });

  test('el modo paralelo conserva las raíces exactas y la lista vacía', async () => {
    const exacta = await buscarTodasLasRaices({ f: (x) => x, inicio: -1, fin: 1, paso: 0.5, paralelo: true });
    const vacia = await buscarTodasLasRaices({ f: (x) => x * x + 1, inicio: -1, fin: 1, paso: 0.5, paralelo: true });

    expect(exacta.resultado).toEqual([0]);
    expect(exacta.iteraciones[0].exacta).toBe(true);
    expect(vacia.resultado).toEqual([]);
  });

  test('el modo paralelo rechaza un maxWorkers inválido', async () => {
    await expect(
      buscarTodasLasRaices({ f: seno, inicio: 0.5, fin: 10, paso: 0.5, paralelo: true, maxWorkers: 0 })
    ).rejects.toThrow("'maxWorkers' debe ser un entero mayor o igual a 1");
  });
});
