
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

// ---------------------------------------------------------------------------
// Tolerancias y tamanos de paso
// ---------------------------------------------------------------------------

function muestraDe(generador, n) {
  return Array.from({ length: n }, () => generador());
}

function autocorrelacionRetardo1(muestra) {
  const m = media(muestra);
  let numerador = 0;
  let denominador = 0;

  for (let i = 0; i < muestra.length - 1; i += 1) {
    numerador += (muestra[i] - m) * (muestra[i + 1] - m);
  }
  muestra.forEach((valor) => {
    denominador += (valor - m) ** 2;
  });

  return numerador / denominador;
}

function chiCuadrado(muestra, clases) {
  const frecuencias = new Array(clases).fill(0);
  muestra.forEach((valor) => {
    frecuencias[Math.floor(valor * clases)] += 1;
  });
  const esperada = muestra.length / clases;

  return frecuencias.reduce(
    (acumulado, observada) => acumulado + (observada - esperada) ** 2 / esperada,
    0
  );
}

function errorMedia(generador, n) {
  return Math.abs(media(muestraDe(generador, n)) - 0.5);
}

// Orden observado p en error ~ N^(-p) entre dos tamanos de muestra.
function ordenObservado(errorPequeno, errorGrande, nPequeno, nGrande) {
  return Math.log(errorPequeno / errorGrande) / Math.log(nGrande / nPequeno);
}

describe('crearGeneradorAleatorio - tolerancias y tamanos de paso', () => {
  test.each([[5e-2], [1e-2], [3e-3], [1e-3]])(
    'la media alcanza la tolerancia %p con el N minimo que exigen 4 desviaciones tipicas',
    (tolerancia) => {
      const n = Math.ceil((4 / tolerancia) ** 2 / 12);

      SEMILLAS.forEach((semilla) => {
        const error = Math.abs(media(generarMuestra(semilla, n)) - 0.5);
        expect(error).toBeLessThan(tolerancia);
      });
    }
  );

  test.each([100, 1000, 10000])(
    'con paso de muestreo h = %i la media acumulada se mantiene dentro de 5 desviaciones tipicas',
    (h) => {
      const total = 1e5;

      SEMILLAS.forEach((semilla) => {
        const generador = crearGeneradorAleatorio(semilla);
        let suma = 0;

        for (let i = 1; i <= total; i += 1) {
          suma += generador();
          if (i % h === 0) {
            expect(Math.abs(suma / i - 0.5)).toBeLessThan(5 / Math.sqrt(12 * i));
          }
        }
      });
    }
  );

  test('el error cuadratico medio de la media baja en cada paso de una decada de N', () => {
    const semillas = Array.from({ length: 20 }, (_, i) => i + 1);
    const rms = (n) =>
      Math.sqrt(
        semillas.reduce(
          (acumulado, semilla) =>
            acumulado + (media(generarMuestra(semilla, n)) - 0.5) ** 2,
          0
        ) / semillas.length
      );

    const errores = [1e2, 1e3, 1e4, 1e5].map(rms);

    for (let i = 0; i < errores.length - 1; i += 1) {
      expect(errores[i + 1]).toBeLessThan(errores[i]);
    }
  });

  test.each([
    ['p = 0.01', 21.67],
    ['p = 0.001', 27.88],
    ['p = 0.0001', 33.72],
  ])(
    'el chi-cuadrado con 10 clases queda bajo el valor critico (%s)',
    (_nivel, valorCritico) => {
      SEMILLAS.forEach((semilla) => {
        expect(chiCuadrado(generarMuestra(semilla, 1e5), 10)).toBeLessThan(valorCritico);
      });
    }
  );

  test.each([
    [5, 18.47],
    [10, 27.88],
    [20, 43.82],
    [50, 85.35],
  ])(
    'el chi-cuadrado con %i clases (p = 0.001) queda bajo el valor critico %p',
    (clases, valorCritico) => {
      SEMILLAS.forEach((semilla) => {
        expect(chiCuadrado(generarMuestra(semilla, 1e5), clases)).toBeLessThan(valorCritico);
      });
    }
  );
});

// ---------------------------------------------------------------------------
// No convergencia y divergencia
// ---------------------------------------------------------------------------

describe('crearGeneradorAleatorio - deteccion de no convergencia y divergencia', () => {
  // Generadores defectuosos usados como contraejemplo: las mismas pruebas que aprueba el PRNG
  // real deben rechazarlos.
  const constante = () => () => 0.3;
  const sesgado = (semilla) => {
    const generador = crearGeneradorAleatorio(semilla);
    return () => generador() ** 2; // media 1/3, no 1/2
  };
  const alternante = () => {
    let i = 0;
    return () => {
      i += 1;
      return i % 2 === 0 ? 0.1 : 0.9; // media 0.5 pero totalmente correlacionado
    };
  };
  const mediaCorrecta = () => {
    let i = 0;
    return () => {
      i += 1;
      return i % 2 === 0 ? 0.4 : 0.6; // media 0.5 pero varianza 0.01 en vez de 1/12
    };
  };
  const rampa = (n) => {
    let i = 0;
    return () => {
      const valor = i / n;
      i += 1;
      return valor; // media ~0.5 pero con tendencia creciente
    };
  };
  const periodoCorto = () => {
    let estado = 1;
    return () => {
      estado = (5 * estado + 3) % 16;
      return estado / 16;
    };
  };

  test.each([1e3, 1e4, 1e5])(
    'una tolerancia 100 veces menor que la desviacion tipica no se alcanza con N = %i',
    (n) => {
      const toleranciaImposible = 0.01 / Math.sqrt(12 * n);

      SEMILLAS.forEach((semilla) => {
        const error = Math.abs(media(generarMuestra(semilla, n)) - 0.5);
        expect(error).toBeGreaterThanOrEqual(toleranciaImposible);
      });
    }
  );

  test('el error de la media NO converge con orden 1: decrece como N^(-1/2)', () => {
    const semillas = Array.from({ length: 10 }, (_, i) => i + 1);
    const errorCuadratico = (n) =>
      Math.sqrt(
        semillas.reduce(
          (acumulado, semilla) =>
            acumulado + (media(generarMuestra(semilla, n)) - 0.5) ** 2,
          0
        ) / semillas.length
      );

    const orden = ordenObservado(errorCuadratico(1e3), errorCuadratico(1e5), 1e3, 1e5);

    expect(orden).toBeLessThan(0.9);
  });

  test('un generador constante no converge: su error de la media no baja al crecer N', () => {
    const errorPequeno = errorMedia(constante(), 1e3);
    const errorGrande = errorMedia(constante(), 1e5);

    expect(errorGrande).toBeGreaterThan(4 / Math.sqrt(12 * 1e5));
    expect(errorGrande).toBeCloseTo(0.2, 10);
    expect(Math.abs(ordenObservado(errorPequeno, errorGrande, 1e3, 1e5))).toBeLessThan(0.05);
  });

  test.each([1e3, 1e4, 1e5])(
    'un generador sesgado converge a 1/3 y no a 0.5 con N = %i',
    (n) => {
      const muestra = muestraDe(sesgado(42), n);
      const tolerancia = 4 / Math.sqrt(12 * n);

      expect(Math.abs(media(muestra) - 0.5)).toBeGreaterThan(tolerancia);
      expect(Math.abs(media(muestra) - 1 / 3)).toBeLessThan(0.02);
    }
  );

  test('la suma centrada del PRNG crece como raiz de N y no linealmente (sin divergencia)', () => {
    [1e3, 1e4, 1e5, 1e6].forEach((n) => {
      SEMILLAS.forEach((semilla) => {
        const suma = generarMuestra(semilla, n).reduce(
          (acumulado, valor) => acumulado + (valor - 0.5),
          0
        );
        expect(Math.abs(suma)).toBeLessThan(4 * Math.sqrt(n / 12));
      });
    });
  });

  test('la suma centrada de un generador sesgado o constante diverge linealmente con N', () => {
    const n = 1e5;
    const sumaCentrada = (generador) =>
      muestraDe(generador, n).reduce((acumulado, valor) => acumulado + (valor - 0.5), 0);

    expect(Math.abs(sumaCentrada(sesgado(42)))).toBeGreaterThan(0.1 * n);
    expect(Math.abs(sumaCentrada(constante()))).toBeGreaterThan(0.1 * n);
  });

  test('la varianza de un generador con media correcta pero poca dispersion no converge a 1/12', () => {
    [1e3, 1e4, 1e5].forEach((n) => {
      const errorRelativo =
        Math.abs(varianza(muestraDe(mediaCorrecta(), n)) - 1 / 12) / (1 / 12);

      expect(Math.abs(media(muestraDe(mediaCorrecta(), n)) - 0.5)).toBeLessThan(1e-3);
      expect(errorRelativo).toBeGreaterThan(3.6 / Math.sqrt(n));
    });
  });

  test('el chi-cuadrado rechaza generadores no uniformes y acepta el PRNG', () => {
    const valorCritico = 27.88; // 9 grados de libertad, p = 0.001

    expect(chiCuadrado(muestraDe(constante(), 1e5), 10)).toBeGreaterThan(valorCritico);
    expect(chiCuadrado(muestraDe(mediaCorrecta(), 1e5), 10)).toBeGreaterThan(valorCritico);
    expect(chiCuadrado(muestraDe(sesgado(42), 1e5), 10)).toBeGreaterThan(valorCritico);
    expect(chiCuadrado(generarMuestra(42, 1e5), 10)).toBeLessThan(valorCritico);
  });

  test('la autocorrelacion detecta secuencias alternantes y con tendencia', () => {
    const n = 1e5;
    const limite = 4 / Math.sqrt(n);

    expect(autocorrelacionRetardo1(muestraDe(alternante(), n))).toBeLessThan(-0.99);
    expect(autocorrelacionRetardo1(muestraDe(rampa(n), n))).toBeGreaterThan(0.99);
    expect(Math.abs(autocorrelacionRetardo1(generarMuestra(42, n)))).toBeLessThan(limite);
  });

  test('un generador de periodo corto repite valores mientras el PRNG no lo hace', () => {
    const n = 1e4;

    expect(new Set(muestraDe(periodoCorto(), n)).size).toBeLessThanOrEqual(16);
    expect(new Set(generarMuestra(42, n)).size).toBe(n);
  });

  test.each([1, 42, 2 ** 32 - 1, Number.MAX_VALUE])(
    'no hay divergencia numerica (NaN o Infinity) en 1e6 valores con semilla %p',
    (semilla) => {
      const generador = crearGeneradorAleatorio(semilla);
      let invalidos = 0;
      let fueraDeRango = 0;

      for (let i = 0; i < 1e6; i += 1) {
        const valor = generador();
        if (!Number.isFinite(valor)) {
          invalidos += 1;
        }
        if (valor < 0 || valor >= 1) {
          fueraDeRango += 1;
        }
      }

      expect(invalidos).toBe(0);
      expect(fueraDeRango).toBe(0);
    }
  );

  test('el generador no se estanca: dos valores consecutivos nunca son iguales en 1e5 pasos', () => {
    const generador = crearGeneradorAleatorio(42);
    let anterior = generador();
    let repetidos = 0;

    for (let i = 0; i < 1e5; i += 1) {
      const actual = generador();
      if (actual === anterior) {
        repetidos += 1;
      }
      anterior = actual;
    }

    expect(repetidos).toBe(0);
  });
});
