
import { crearGeneradorAleatorio } from '../../../src/utils/prng.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('crearGeneradorAleatorio', () => {
  test('dos generadores con la misma semilla producen la misma secuencia', () => {
    const generador1 = crearGeneradorAleatorio(42);
    const generador2 = crearGeneradorAleatorio(42);

    const secuencia1 = Array.from({ length: 5 }, () => generador1());
    const secuencia2 = Array.from({ length: 5 }, () => generador2());

    expect(secuencia1).toEqual(secuencia2);
  });

  test('semillas diferentes producen secuencias diferentes', () => {
    const generador1 = crearGeneradorAleatorio(42);
    const generador2 = crearGeneradorAleatorio(99);

    const secuencia1 = Array.from({ length: 5 }, () => generador1());
    const secuencia2 = Array.from({ length: 5 }, () => generador2());

    expect(secuencia1).not.toEqual(secuencia2);
  });

  test('todos los valores generados estan entre 0 y 1 sin incluir 1', () => {
    const generador = crearGeneradorAleatorio(42);
    const valores = Array.from({ length: 100 }, () => generador());

    valores.forEach((valor) => {
      expect(valor).toBeGreaterThanOrEqual(0);
      expect(valor).toBeLessThan(1);
    });
  });

  test('una semilla null permite crear un generador valido', () => {
    const generador = crearGeneradorAleatorio(null);

    expect(typeof generador).toBe('function');

    const valor = generador();
    expect(valor).toBeGreaterThanOrEqual(0);
    expect(valor).toBeLessThan(1);
  });

  test('una semilla no numerica lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio('abc')).toThrow(ErrorParametros);
  });

  test('una semilla NaN lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio(NaN)).toThrow(ErrorParametros);
  });

  test('una semilla Infinity lanza ErrorParametros', () => {
    expect(() => crearGeneradorAleatorio(Infinity)).toThrow(ErrorParametros);
  });
});

// ---------------------------------------------------------------------------
// Precision y convergencia
// ---------------------------------------------------------------------------

const SEMILLAS = [1, 42, 2024, 12345];

function generarMuestra(semilla, n) {
  const generador = crearGeneradorAleatorio(semilla);
  return Array.from({ length: n }, () => generador());
}

function media(valores) {
  return valores.reduce((acumulado, valor) => acumulado + valor, 0) / valores.length;
}

function varianza(valores) {
  const m = media(valores);
  return (
    valores.reduce((acumulado, valor) => acumulado + (valor - m) ** 2, 0) /
    valores.length
  );
}

describe('crearGeneradorAleatorio - precision y convergencia', () => {
  const tamanos = [1e3, 1e4, 1e5, 1e6];

  test.each(tamanos)(
    'la media converge a 0.5 con N = %i (tolerancia de 4 desviaciones tipicas)',
    (n) => {
      // Desviacion tipica de la media de N uniformes: 1 / sqrt(12 N)
      const tolerancia = 4 / Math.sqrt(12 * n);

      SEMILLAS.forEach((semilla) => {
        const error = Math.abs(media(generarMuestra(semilla, n)) - 0.5);
        expect(error).toBeLessThan(tolerancia);
      });
    }
  );

  test.each(tamanos)(
    'la varianza converge a 1/12 con N = %i (error relativo menor a 3.6 / sqrt(N))',
    (n) => {
      const tolerancia = 3.6 / Math.sqrt(n);

      SEMILLAS.forEach((semilla) => {
        const errorRelativo =
          Math.abs(varianza(generarMuestra(semilla, n)) - 1 / 12) / (1 / 12);
        expect(errorRelativo).toBeLessThan(tolerancia);
      });
    }
  );

  test.each(tamanos)(
    'la estimacion Monte Carlo de pi con N = %i pares tiene error relativo menor a 2.1 / sqrt(N)',
    (n) => {
      const tolerancia = 2.1 / Math.sqrt(n);

      SEMILLAS.forEach((semilla) => {
        const generador = crearGeneradorAleatorio(semilla);
        let dentro = 0;

        for (let i = 0; i < n; i += 1) {
          const x = generador();
          const y = generador();
          if (x * x + y * y <= 1) {
            dentro += 1;
          }
        }

        const estimacion = (4 * dentro) / n;
        const errorRelativo = Math.abs(estimacion - Math.PI) / Math.PI;
        expect(errorRelativo).toBeLessThan(tolerancia);
      });
    }
  );

  test('el error de la media decrece con orden de convergencia cercano a 1/2', () => {
    const semillas = Array.from({ length: 10 }, (_, i) => i + 1);
    const errorCuadratico = (n) =>
      Math.sqrt(
        semillas.reduce(
          (acumulado, semilla) =>
            acumulado + (media(generarMuestra(semilla, n)) - 0.5) ** 2,
          0
        ) / semillas.length
      );

    const errorPequeno = errorCuadratico(1e3);
    const errorGrande = errorCuadratico(1e5);
    const orden = Math.log(errorPequeno / errorGrande) / Math.log(1e5 / 1e3);

    expect(errorGrande).toBeLessThan(errorPequeno);
    expect(orden).toBeGreaterThan(0.3);
    expect(orden).toBeLessThan(0.7);
  });

  test('la prueba chi-cuadrado con 10 clases queda bajo el valor critico (p = 0.001)', () => {
    const n = 1e5;
    const clases = 10;
    const valorCritico = 27.88; // chi-cuadrado, 9 grados de libertad, p = 0.001

    SEMILLAS.forEach((semilla) => {
      const frecuencias = new Array(clases).fill(0);
      generarMuestra(semilla, n).forEach((valor) => {
        frecuencias[Math.floor(valor * clases)] += 1;
      });

      const esperada = n / clases;
      const chiCuadrado = frecuencias.reduce(
        (acumulado, observada) => acumulado + (observada - esperada) ** 2 / esperada,
        0
      );

      expect(chiCuadrado).toBeLessThan(valorCritico);
    });
  });

  test('la autocorrelacion de retardo 1 es compatible con cero', () => {
    const n = 1e5;
    const limite = 4 / Math.sqrt(n);

    SEMILLAS.forEach((semilla) => {
      const muestra = generarMuestra(semilla, n);
      const m = media(muestra);
      let numerador = 0;
      let denominador = 0;

      for (let i = 0; i < n - 1; i += 1) {
        numerador += (muestra[i] - m) * (muestra[i + 1] - m);
      }
      muestra.forEach((valor) => {
        denominador += (valor - m) ** 2;
      });

      expect(Math.abs(numerador / denominador)).toBeLessThan(limite);
    });
  });

  test('cubre todo el intervalo [0, 1) sin salirse de el en 1e6 valores', () => {
    const generador = crearGeneradorAleatorio(42);
    let minimo = Infinity;
    let maximo = -Infinity;

    for (let i = 0; i < 1e6; i += 1) {
      const valor = generador();
      minimo = Math.min(minimo, valor);
      maximo = Math.max(maximo, valor);
    }

    expect(minimo).toBeGreaterThanOrEqual(0);
    expect(maximo).toBeLessThan(1);
    expect(minimo).toBeLessThan(1e-4);
    expect(maximo).toBeGreaterThan(1 - 1e-4);
  });

  test('el LCG tiene periodo completo: 1e5 valores consecutivos son todos distintos', () => {
    const muestra = generarMuestra(42, 1e5);

    expect(new Set(muestra).size).toBe(muestra.length);
  });

  test('el primer valor con semilla 42 coincide exactamente con la formula del LCG', () => {
    const esperado = (1664525 * 42 + 1013904223) / 2 ** 32;

    expect(crearGeneradorAleatorio(42)()).toBe(esperado);
  });

  test('la aritmetica en coma flotante es exacta: coincide con la recurrencia entera de 32 bits', () => {
    const generador = crearGeneradorAleatorio(42);
    let estado = 42;

    for (let i = 0; i < 1e5; i += 1) {
      estado = (Math.imul(1664525, estado) + 1013904223) >>> 0;
      expect(generador()).toBe(estado / 2 ** 32);
    }
  });
});

describe('crearGeneradorAleatorio - entradas invalidas y estabilidad numerica', () => {
  test.each([
    ['cadena numerica', '42'],
    ['-Infinity', -Infinity],
    ['booleano true', true],
    ['booleano false', false],
    ['objeto', {}],
    ['arreglo', [42]],
    ['funcion', () => 42],
  ])('lanza ErrorParametros con semilla de tipo %s', (_nombre, semilla) => {
    expect(() => crearGeneradorAleatorio(semilla)).toThrow(ErrorParametros);
  });

  test('el mensaje de error identifica la semilla y el tipo recibido', () => {
    expect(() => crearGeneradorAleatorio('abc')).toThrow(/semilla/);
    expect(() => crearGeneradorAleatorio('abc')).toThrow(/string/);
  });

  test('una semilla undefined usa el valor por defecto y crea un generador valido', () => {
    const generador = crearGeneradorAleatorio(undefined);
    const valor = generador();

    expect(typeof generador).toBe('function');
    expect(valor).toBeGreaterThanOrEqual(0);
    expect(valor).toBeLessThan(1);
  });

  test.each([
    0,
    -1,
    0.5,
    2 ** 31,
    2 ** 32 - 1,
    Number.MAX_SAFE_INTEGER,
    Number.MAX_VALUE,
  ])(
    'la semilla extrema %p produce valores finitos en [0, 1) sin degenerar',
    (semilla) => {
      const muestra = generarMuestra(semilla, 1e4);

      muestra.forEach((valor) => {
        expect(Number.isFinite(valor)).toBe(true);
        expect(valor).toBeGreaterThanOrEqual(0);
        expect(valor).toBeLessThan(1);
      });
      expect(new Set(muestra).size).toBe(muestra.length);
    }
  );

  test('los generadores no comparten estado: intercalar llamadas no altera las secuencias', () => {
    const generadorA = crearGeneradorAleatorio(7);
    const generadorB = crearGeneradorAleatorio(8);
    const intercaladaA = [];
    const intercaladaB = [];

    for (let i = 0; i < 50; i += 1) {
      intercaladaA.push(generadorA());
      intercaladaB.push(generadorB());
    }

    expect(intercaladaA).toEqual(generarMuestra(7, 50));
    expect(intercaladaB).toEqual(generarMuestra(8, 50));
  });
});
