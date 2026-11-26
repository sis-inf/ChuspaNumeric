import { memoizarFuncion } from '../../../src/utils/memoizar.js';
import { ErrorParametros } from '../../../src/core/errores.js';

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

// Envuelve f y cuenta cuantas veces se invoca realmente.
const conContador = (f) => {
  const envuelta = (x) => {
    envuelta.llamadas++;
    return f(x);
  };
  envuelta.llamadas = 0;
  return envuelta;
};

// Biseccion de referencia (vive en el test para no depender de otros src/).
// En cada iteracion evalua f(c) y f(a): al hacer a = c, el siguiente f(a)
// repite un punto ya evaluado, que es justo lo que la cache aprovecha.
// error_n = (b - a) / 2 = (b0 - a0) / 2^n
function biseccion(f, a, b, tolerancia, maxIter) {
  const iteraciones = [];
  let convergio = false;
  let c = a;

  for (let n = 1; n <= maxIter; n++) {
    c = (a + b) / 2;
    const fc = f(c);
    const fa = f(a);
    const error = (b - a) / 2;
    iteraciones.push({ n, x: c, error });

    if (fc === 0 || error < tolerancia) {
      convergio = true;
      break;
    }
    if (fa * fc < 0) b = c;
    else a = c;
  }

  return { raiz: c, iteraciones, convergio };
}

// Punto fijo de referencia: x_{n+1} = g(x_n), error = |x_{n+1} - x_n|
function puntoFijo(g, x0, tolerancia, maxIter) {
  const iteraciones = [];
  let convergio = false;
  let x = x0;

  for (let n = 1; n <= maxIter; n++) {
    const siguiente = g(x);
    const error = Math.abs(siguiente - x);
    iteraciones.push({ n, x: siguiente, error });
    x = siguiente;

    if (error < tolerancia) {
      convergio = true;
      break;
    }
  }

  return { raiz: x, iteraciones, convergio };
}

const f = (x) => x * x - 2; // raiz exacta: sqrt(2)
const newtonRaiz2 = (x) => (x + 2 / x) / 2; // convergencia cuadratica
const RAIZ2 = Math.SQRT2;

describe('memoizarFuncion', () => {
  test('ejecuta la funcion una sola vez para el mismo valor', () => {
    let llamadas = 0;
    const funcion = (x) => {
      llamadas++;
      return x * 2;
    };

    const memoizada = memoizarFuncion(funcion);

    expect(memoizada(5)).toBe(10);
    expect(memoizada(5)).toBe(10);
    expect(llamadas).toBe(1);
  });

  test('muestra las estadisticas de dos valores diferentes', () => {
    const memoizada = memoizarFuncion((x) => x * x);

    memoizada(2);
    memoizada(3);

    expect(memoizada.estadisticas()).toEqual({
      entradas: 2,
      evaluacionesReales: 2
    });
  });

  test('limpiarCache vacia la cache y permite volver a evaluar', () => {
    let llamadas = 0;
    const memoizada = memoizarFuncion((x) => {
      llamadas++;
      return x + 1;
    });

    memoizada(4);
    expect(llamadas).toBe(1);

    memoizada.limpiarCache();
    expect(memoizada.estadisticas().entradas).toBe(0);

    expect(memoizada(4)).toBe(5);
    expect(llamadas).toBe(2);
  });

  test('lanza ErrorParametros si recibe algo que no es una funcion', () => {
    expect(() => memoizarFuncion(123)).toThrow(ErrorParametros);
  });

  test('devuelve el mismo resultado que la funcion original', () => {
    const funcion = (x) => x * 3;
    const memoizada = memoizarFuncion(funcion);

    expect(memoizada(7)).toBe(funcion(7));
  });

  describe('precision segun tolerancia (biseccion sobre x^2 - 2 en [1, 2])', () => {
    // Tras n iteraciones error_n = 1 / 2^n. Se para cuando 1 / 2^n < tol.
    // Ej. tol = 1e-2: 1/64 = 0.0156 (no) y 1/128 = 0.0078 (si) -> n = 7.
    // Las iteraciones esperadas se verificaron ejecutando el algoritmo.
    const casos = [
      [1e-2, 7],
      [1e-4, 14],
      [1e-6, 20],
      [1e-8, 27],
      [1e-10, 34],
      [1e-12, 40]
    ];

    test.each(casos)(
      'tolerancia %s -> %i iteraciones y resultado igual con y sin memoizar',
      (tol, esperadas) => {
        const sinMemo = biseccion(f, 1, 2, tol, 100);
        const conMemo = biseccion(memoizarFuncion(f), 1, 2, tol, 100);

        expect(conMemo.convergio).toBe(true);
        expect(conMemo.iteraciones).toHaveLength(esperadas);
        expect(conMemo.raiz).toBe(sinMemo.raiz);
        expect(conMemo.iteraciones).toEqual(sinMemo.iteraciones);

        const ultimo = conMemo.iteraciones[conMemo.iteraciones.length - 1];
        expect(ultimo.error).toBeLessThan(tol);
        expect(typeof ultimo.error).toBe('number');

        const errorRelativo = Math.abs(conMemo.raiz - RAIZ2) / RAIZ2;
        expect(errorRelativo).toBeLessThanOrEqual(10 * tol);

        conMemo.iteraciones.forEach((it, i) => {
          expect(it.n).toBe(i + 1);
        });
      }
    );

    test('las iteraciones no decrecen al endurecer la tolerancia', () => {
      const conteos = casos.map(
        ([tol]) =>
          biseccion(memoizarFuncion(f), 1, 2, tol, 100).iteraciones.length
      );

      for (let i = 1; i < conteos.length; i++) {
        expect(conteos[i]).toBeGreaterThanOrEqual(conteos[i - 1]);
      }
      expect(conteos[conteos.length - 1]).toBeGreaterThan(conteos[0]);
    });

    test.each(casos)(
      'tolerancia %s: evaluaciones reales n + 1 frente a 2n llamadas',
      (tol, esperadas) => {
        // Cada iteracion pide f(c) y f(a). Como a siempre es un c anterior
        // (o el extremo inicial), solo hay n + 1 puntos distintos.
        const real = conContador(f);
        const memoizada = memoizarFuncion(real);
        const solicitada = conContador(memoizada);

        biseccion(solicitada, 1, 2, tol, 100);

        expect(solicitada.llamadas).toBe(2 * esperadas);
        expect(real.llamadas).toBe(esperadas + 1);
        expect(memoizada.estadisticas()).toEqual({
          entradas: esperadas + 1,
          evaluacionesReales: esperadas + 1
        });
        expect(real.llamadas).toBeLessThan(solicitada.llamadas);
      }
    );
  });

  describe('criterio de parada y tamano de paso', () => {
    test('valor inicial exacto: f(x) = x - 1 en [0, 2] para en la iteracion 1', () => {
      // c = (0 + 2) / 2 = 1 y f(1) = 0 -> converge de inmediato.
      const real = conContador((x) => x - 1);
      const memoizada = memoizarFuncion(real);

      const r = biseccion(memoizada, 0, 2, 1e-6, 50);

      expect(r.convergio).toBe(true);
      expect(r.iteraciones).toHaveLength(1);
      expect(r.raiz).toBe(1);
      expect(r.iteraciones[0].error).toBe(1);
      expect(memoizada.estadisticas()).toEqual({
        entradas: 2,
        evaluacionesReales: 2
      });
    });

    test('intervalo lejano [1, 1000] necesita mas iteraciones que [1, 2]', () => {
      // error_n = 999 / 2^n < 1e-6 -> n = 30 (verificado ejecutando).
      const cercano = biseccion(memoizarFuncion(f), 1, 2, 1e-6, 100);
      const memoizada = memoizarFuncion(f);
      const lejano = biseccion(memoizada, 1, 1000, 1e-6, 100);

      expect(lejano.convergio).toBe(true);
      expect(lejano.iteraciones).toHaveLength(30);
      expect(lejano.iteraciones.length).toBeGreaterThan(
        cercano.iteraciones.length
      );
      expect(Math.abs(lejano.raiz - RAIZ2)).toBeLessThan(1e-6);
      expect(memoizada.estadisticas().evaluacionesReales).toBe(31);
    });

    test('el tamano de paso se reduce a la mitad en cada iteracion', () => {
      const r = biseccion(memoizarFuncion(f), 1, 2, 1e-6, 100);

      r.iteraciones.forEach((it) => {
        expect(it.error).toBeCloseTo(1 / 2 ** it.n, 12);
      });
    });
  });

  describe('orden de convergencia', () => {
    test('biseccion: error estrictamente decreciente con tasa media 1/2', () => {
      const { iteraciones } = biseccion(memoizarFuncion(f), 1, 2, 1e-12, 100);
      const errores = iteraciones.map((it) => it.error);

      for (let i = 1; i < errores.length; i++) {
        expect(errores[i]).toBeLessThan(errores[i - 1]);
      }

      const tasaMedia =
        (errores[errores.length - 1] / errores[0]) **
        (1 / (errores.length - 1));
      expect(tasaMedia).toBeCloseTo(0.5, 6);
    });

    test('punto fijo con cos(x): convergencia lineal con tasa cercana a |g\'(x*)| = sin(0.739) ~ 0.674', () => {
      const r = puntoFijo(memoizarFuncion(Math.cos), 1, 1e-12, 500);
      const errores = r.iteraciones.map((it) => it.error);

      expect(r.convergio).toBe(true);
      expect(r.raiz).toBeCloseTo(0.7390851332151607, 9);

      const tasaFinal =
        errores[errores.length - 1] / errores[errores.length - 2];
      expect(tasaFinal).toBeGreaterThan(0.6);
      expect(tasaFinal).toBeLessThan(0.75);
    });

    test('punto fijo tipo Newton: convergencia cuadratica (e_{n+1} / e_n^2 casi constante)', () => {
      // Errores verificados: 0.5, 0.0833, 0.00245, 2.12e-6, 1.59e-12
      // Cocientes e_{n+1} / e_n^2: 0.333, 0.353, 0.354
      const r = puntoFijo(memoizarFuncion(newtonRaiz2), 1, 1e-12, 50);
      const e = r.iteraciones.map((it) => it.error);

      expect(r.convergio).toBe(true);
      for (let i = 0; i < 3; i++) {
        const cociente = e[i + 1] / e[i] ** 2;
        expect(cociente).toBeGreaterThan(0.3);
        expect(cociente).toBeLessThan(0.4);
      }
    });

    test('la iteracion cuadratica necesita muchas menos iteraciones que la lineal', () => {
      const lineal = puntoFijo(memoizarFuncion(Math.cos), 1, 1e-12, 500);
      const cuadratica = puntoFijo(
        memoizarFuncion(newtonRaiz2),
        1,
        1e-12,
        500
      );

      expect(lineal.convergio).toBe(true);
      expect(cuadratica.convergio).toBe(true);
      expect(cuadratica.iteraciones.length).toBeLessThanOrEqual(8);
      expect(lineal.iteraciones.length).toBeGreaterThan(40);
      expect(cuadratica.iteraciones.length).toBeLessThan(
        lineal.iteraciones.length
      );
    });

    test.each([1e-2, 1e-6, 1e-12])(
      'con tolerancia %s la raiz de Newton memoizada tiene error relativo <= 10 * tol',
      (tol) => {
        const r = puntoFijo(memoizarFuncion(newtonRaiz2), 1, tol, 50);

        expect(r.convergio).toBe(true);
        expect(Math.abs(r.raiz - RAIZ2) / RAIZ2).toBeLessThanOrEqual(10 * tol);
      }
    );
  });

  describe('no convergencia y divergencia', () => {
    test('g(x) = 2x diverge: convergio false, agota maxIter y el error crece', () => {
      // x0 = 1 -> pasos 1, 2, 4, 8, ... (error_n = 2^(n-1))
      const maxIter = 20;
      const memoizada = memoizarFuncion((x) => 2 * x);
      const r = puntoFijo(memoizada, 1, 1e-6, maxIter);

      expect(r.convergio).toBe(false);
      expect(r.iteraciones).toHaveLength(maxIter);

      r.iteraciones.forEach((it, i) => {
        expect(it.error).toBe(2 ** i);
      });
      for (let i = 1; i < r.iteraciones.length; i++) {
        expect(r.iteraciones[i].error).toBeGreaterThan(
          r.iteraciones[i - 1].error
        );
      }

      // Todos los puntos son distintos: no hay ahorro, pero la cache es coherente
      expect(memoizada.estadisticas()).toEqual({
        entradas: maxIter,
        evaluacionesReales: maxIter
      });
    });

    test('tolerancia inalcanzable en biseccion agota exactamente maxIter', () => {
      // error_30 = 1 / 2^30 ~ 9.3e-10 > 1e-300
      const maxIter = 30;
      const memoizada = memoizarFuncion(f);
      const r = biseccion(memoizada, 1, 2, 1e-300, maxIter);

      expect(r.convergio).toBe(false);
      expect(r.iteraciones).toHaveLength(maxIter);

      const ultimo = r.iteraciones[maxIter - 1];
      expect(ultimo.error).toBeGreaterThan(1e-300);
      expect(ultimo.error).toBeCloseTo(1 / 2 ** maxIter, 15);
      expect(memoizada.estadisticas().evaluacionesReales).toBe(maxIter + 1);
    });

    test('maxIter = 1 corta tras una sola iteracion sin converger', () => {
      const r = biseccion(memoizarFuncion(f), 1, 2, 1e-6, 1);

      expect(r.convergio).toBe(false);
      expect(r.iteraciones).toHaveLength(1);
      expect(r.iteraciones[0].error).toBe(0.5);
    });

    test('reutilizar la funcion memoizada en una segunda corrida no vuelve a evaluar', () => {
      const real = conContador(Math.cos);
      const memoizada = memoizarFuncion(real);

      const primera = puntoFijo(memoizada, 1, 1e-8, 500);
      const evaluacionesPrimera = real.llamadas;
      const segunda = puntoFijo(memoizada, 1, 1e-8, 500);

      expect(primera.convergio).toBe(true);
      expect(segunda.raiz).toBe(primera.raiz);
      expect(segunda.iteraciones).toEqual(primera.iteraciones);
      expect(real.llamadas).toBe(evaluacionesPrimera);
      expect(memoizada.estadisticas().evaluacionesReales).toBe(
        evaluacionesPrimera
      );
    });
  });

  describe('igualdad exacta de la clave (Map)', () => {
    test('0.1 + 0.2 y 0.3 son claves distintas', () => {
      const memoizada = memoizarFuncion((x) => x);

      memoizada(0.1 + 0.2);
      memoizada(0.3);

      expect(0.1 + 0.2).not.toBe(0.3);
      expect(memoizada.estadisticas()).toEqual({
        entradas: 2,
        evaluacionesReales: 2
      });
    });

    test('NaN se trata como una sola clave', () => {
      const real = conContador(() => 42);
      const memoizada = memoizarFuncion(real);

      expect(memoizada(NaN)).toBe(42);
      expect(memoizada(NaN)).toBe(42);
      expect(real.llamadas).toBe(1);
      expect(memoizada.estadisticas().entradas).toBe(1);
    });

    test('0 y -0 comparten entrada (Map usa SameValueZero)', () => {
      const real = conContador((x) => x + 5);
      const memoizada = memoizarFuncion(real);

      memoizada(0);
      memoizada(-0);

      expect(real.llamadas).toBe(1);
      expect(memoizada.estadisticas().entradas).toBe(1);
    });

    test('un string y un numero con el mismo aspecto son claves distintas', () => {
      const memoizada = memoizarFuncion((x) => x);

      memoizada(1);
      memoizada('1');

      expect(memoizada.estadisticas().entradas).toBe(2);
    });

    test('objetos: misma referencia usa cache, referencias distintas no', () => {
      const real = conContador((o) => o.valor * 2);
      const memoizada = memoizarFuncion(real);
      const a = { valor: 3 };
      const copia = { valor: 3 };

      expect(memoizada(a)).toBe(6);
      expect(memoizada(a)).toBe(6);
      expect(memoizada(copia)).toBe(6);
      expect(real.llamadas).toBe(2);
    });
  });

  describe('resultados y errores de la funcion original', () => {
    test.each([
      ['undefined', undefined],
      ['null', null],
      ['NaN', NaN],
      ['Infinity', Infinity],
      ['0', 0]
    ])('cachea el resultado %s sin reevaluar', (_nombre, valor) => {
      const real = conContador(() => valor);
      const memoizada = memoizarFuncion(real);

      const a = memoizada(1);
      const b = memoizada(1);

      expect(Object.is(a, valor)).toBe(true);
      expect(Object.is(b, valor)).toBe(true);
      expect(real.llamadas).toBe(1);
    });

    test('un error lanzado por f se propaga y no se cachea', () => {
      let llamadas = 0;
      const memoizada = memoizarFuncion((x) => {
        llamadas++;
        if (llamadas === 1) throw new Error('fallo temporal');
        return x * 10;
      });

      expect(() => memoizada(2)).toThrow('fallo temporal');
      expect(memoizada.estadisticas()).toEqual({
        entradas: 0,
        evaluacionesReales: 0
      });

      expect(memoizada(2)).toBe(20);
      expect(memoizada.estadisticas()).toEqual({
        entradas: 1,
        evaluacionesReales: 1
      });
    });

    test('devuelve la misma referencia para resultados que son objetos', () => {
      const memoizada = memoizarFuncion((x) => ({ x }));

      expect(memoizada(1)).toBe(memoizada(1));
      expect(memoizada(1)).not.toBe(memoizada(2));
    });
  });

  describe('metodos auxiliares', () => {
    test('estadisticas iniciales: sin entradas ni evaluaciones', () => {
      const memoizada = memoizarFuncion((x) => x);

      expect(memoizada.estadisticas()).toEqual({
        entradas: 0,
        evaluacionesReales: 0
      });
    });

    test('uso mixto: aciertos de cache no suman evaluaciones reales', () => {
      const memoizada = memoizarFuncion((x) => x * x);

      [1, 2, 1, 3, 2, 1].forEach((x) => memoizada(x));

      expect(memoizada.estadisticas()).toEqual({
        entradas: 3,
        evaluacionesReales: 3
      });
    });

    test('limpiarCache vacia entradas pero conserva evaluacionesReales acumuladas', () => {
      const memoizada = memoizarFuncion((x) => x);

      memoizada(1);
      memoizada(2);
      memoizada.limpiarCache();
      expect(memoizada.estadisticas()).toEqual({
        entradas: 0,
        evaluacionesReales: 2
      });

      memoizada(1);
      expect(memoizada.estadisticas()).toEqual({
        entradas: 1,
        evaluacionesReales: 3
      });
    });

    test('limpiarCache sobre una cache vacia no falla', () => {
      const memoizada = memoizarFuncion((x) => x);

      expect(() => memoizada.limpiarCache()).not.toThrow();
      expect(memoizada.estadisticas().entradas).toBe(0);
    });

    test('dos memoizadas de la misma funcion tienen caches independientes', () => {
      const real = conContador((x) => x + 1);
      const m1 = memoizarFuncion(real);
      const m2 = memoizarFuncion(real);

      m1(5);
      m2(5);

      expect(real.llamadas).toBe(2);
      expect(m1.estadisticas().entradas).toBe(1);
      expect(m2.estadisticas().entradas).toBe(1);

      m1.limpiarCache();
      expect(m1.estadisticas().entradas).toBe(0);
      expect(m2.estadisticas().entradas).toBe(1);
    });

    test('estadisticas devuelve un objeto nuevo: modificarlo no altera el estado', () => {
      const memoizada = memoizarFuncion((x) => x);
      memoizada(1);

      const copia = memoizada.estadisticas();
      copia.entradas = 999;
      copia.evaluacionesReales = 999;

      expect(memoizada.estadisticas()).toEqual({
        entradas: 1,
        evaluacionesReales: 1
      });
    });
  });

  describe('validacion de parametros', () => {
    test.each([
      ['null', null],
      ['undefined', undefined],
      ['numero', 123],
      ['NaN', NaN],
      ['string', 'x => x'],
      ['objeto', {}],
      ['arreglo', []],
      ['booleano', true]
    ])('rechaza %s con ErrorParametros y mensaje con prefijo', (_nombre, valor) => {
      const error = capturar(() => memoizarFuncion(valor));

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/^ChuspaNumeric\.memoizarFuncion:/);
      expect(error.message).toMatch(/'f' debe ser una función válida/);
    });

    test('llamar sin argumentos lanza ErrorParametros y no TypeError', () => {
      const error = capturar(() => memoizarFuncion());

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(/Se recibió: undefined/);
    });

    test('el mensaje indica el tipo recibido', () => {
      const error = capturar(() => memoizarFuncion(123));

      expect(error.message).toMatch(/Se recibió: number/);
    });

    test.each([
      ['funcion flecha', (x) => x],
      ['function clasica', function (x) {
        return x;
      }],
      ['funcion nativa', Math.cos]
    ])('acepta %s sin lanzar error', (_nombre, funcion) => {
      expect(capturar(() => memoizarFuncion(funcion))).toBeNull();
      expect(typeof memoizarFuncion(funcion)).toBe('function');
    });
  });
});
