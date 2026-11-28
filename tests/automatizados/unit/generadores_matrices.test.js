import {
  matrizIdentidad,
  matrizHilbert,
  matrizDiagonalDominante,
  matrizSimetricaDefinidaPositiva,
  esDiagonalDominante,
  esSimetrica,
} from '../../../src/utils/generadores_matrices.js';
import { ErrorDominio } from '../../../src/core/errores.js';

// -------------------------------------------------------------------
// Helpers numericos (solo para los tests; no tocan src/)
// -------------------------------------------------------------------

const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

const normaInf = (v) => Math.max(...v.map(Math.abs));

const multiplicar = (A, x) =>
  A.map((fila) => fila.reduce((s, v, j) => s + v * x[j], 0));

const xExacto = (n) => Array.from({ length: n }, (_, i) => i + 1);

// Cota ||M||_inf de la iteracion de Jacobi: max_i sum_{j!=i}|a_ij| / |a_ii|.
// Si q < 1 el metodo converge y los incrementos se contraen con factor q.
const normaJacobi = (A) =>
  Math.max(
    ...A.map(
      (fila, i) =>
        fila.reduce((s, v, j) => s + (i !== j ? Math.abs(v) : 0), 0) /
        Math.abs(fila[i])
    )
  );

// Jacobi con criterio de parada |x_k+1 - x_k|_inf < tol.
function jacobi(A, b, { tol, maxIter, x0 }) {
  const n = A.length;
  let x = x0 ? [...x0] : new Array(n).fill(0);
  const incrementos = [];
  for (let k = 1; k <= maxIter; k++) {
    const xNuevo = x.map((_, i) => {
      let s = b[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) s -= A[i][j] * x[j];
      }
      return s / A[i][i];
    });
    const inc = normaInf(xNuevo.map((v, i) => v - x[i]));
    incrementos.push(inc);
    x = xNuevo;
    if (!Number.isFinite(inc)) {
      return { x, iteraciones: k, convergio: false, incrementos };
    }
    if (inc < tol) {
      return { x, iteraciones: k, convergio: true, incrementos };
    }
  }
  return { x, iteraciones: maxIter, convergio: false, incrementos };
}

// Gauss-Seidel con criterio de parada ||b - A x||_inf < tol.
function gaussSeidel(A, b, { tol, maxIter }) {
  const n = A.length;
  const x = new Array(n).fill(0);
  for (let k = 1; k <= maxIter; k++) {
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let j = 0; j < n; j++) {
        if (j !== i) s -= A[i][j] * x[j];
      }
      x[i] = s / A[i][i];
    }
    const residuo = normaInf(multiplicar(A, x).map((v, i) => b[i] - v));
    if (residuo < tol) return { x, iteraciones: k, convergio: true };
  }
  return { x, iteraciones: maxIter, convergio: false };
}

// Cholesky A = L L^T. Devuelve los pivotes (L[i][i]^2) para analizar el
// condicionamiento; ok=false si algun pivote no es positivo.
function cholesky(A) {
  const n = A.length;
  const L = Array.from({ length: n }, () => new Array(n).fill(0));
  const pivotes = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let s = A[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      if (i === j) {
        if (!(s > 0)) return { ok: false, L, pivotes };
        pivotes.push(s);
        L[i][i] = Math.sqrt(s);
      } else {
        L[i][j] = s / L[j][j];
      }
    }
  }
  return { ok: true, L, pivotes };
}

const tolerancias = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12];
const casosDD = [
  [3, 1],
  [4, 12345],
  [5, 42],
  [6, 7],
  [8, 99],
];
const casosSPD = [
  [2, 1],
  [3, 42],
  [4, 12345],
  [6, 7],
  [8, 99],
];

// -------------------------------------------------------------------
// matrizIdentidad
// -------------------------------------------------------------------

describe('matrizIdentidad', () => {
  test('Crea matriz identidad 2x2 correctamente', () => {
    const I = matrizIdentidad(2);
    expect(I).toEqual([
      [1, 0],
      [0, 1],
    ]);
  });

  test('Crea matriz identidad 3x3 correctamente', () => {
    const I = matrizIdentidad(3);
    expect(I).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });

  test('Lanza ErrorDominio con n no entero', () => {
    expect(() => matrizIdentidad(2.5)).toThrow();
  });

  test('Lanza ErrorDominio con n negativo', () => {
    expect(() => matrizIdentidad(-1)).toThrow();
  });

  test('n = 1 devuelve [[1]]', () => {
    expect(matrizIdentidad(1)).toEqual([[1]]);
  });

  test.each([1, 2, 5, 10, 25])('n=%i: cuadrada con unos solo en la diagonal', (n) => {
    const I = matrizIdentidad(n);
    expect(I).toHaveLength(n);
    for (let i = 0; i < n; i++) {
      expect(I[i]).toHaveLength(n);
      for (let j = 0; j < n; j++) {
        expect(I[i][j]).toBe(i === j ? 1 : 0);
      }
    }
  });

  test('I * x = x (elemento neutro) sin error de redondeo', () => {
    const x = [3.5, -2, 0.125, 7];
    expect(multiplicar(matrizIdentidad(4), x)).toEqual(x);
  });

  test('Cada llamada devuelve una matriz independiente (sin referencias compartidas)', () => {
    const A = matrizIdentidad(3);
    const B = matrizIdentidad(3);
    A[0][0] = 99;
    expect(B[0][0]).toBe(1);
    expect(A[1][0]).toBe(0);
    expect(A[0]).not.toBe(A[1]);
  });

  test('Jacobi sobre la identidad converge en 2 iteraciones y devuelve b exacto', () => {
    const b = [1.5, -2, 3];
    for (const tol of tolerancias) {
      const r = jacobi(matrizIdentidad(3), b, { tol, maxIter: 100 });
      expect(r.convergio).toBe(true);
      expect(r.iteraciones).toBe(2);
      expect(r.x).toEqual(b);
    }
  });
});

// -------------------------------------------------------------------
// matrizHilbert
// -------------------------------------------------------------------

describe('matrizHilbert', () => {
  test('Crea matriz de Hilbert 2x2 correctamente', () => {
    const H = matrizHilbert(2);
    expect(H[0][0]).toBeCloseTo(1, 10);
    expect(H[0][1]).toBeCloseTo(1 / 2, 10);
    expect(H[1][0]).toBeCloseTo(1 / 2, 10);
    expect(H[1][1]).toBeCloseTo(1 / 3, 10);
  });

  test('Crea matriz de Hilbert 3x3 correctamente', () => {
    const H = matrizHilbert(3);
    expect(H[0][2]).toBeCloseTo(1 / 3, 10);
    expect(H[2][0]).toBeCloseTo(1 / 3, 10);
    expect(H[2][2]).toBeCloseTo(1 / 5, 10);
  });

  test('Lanza ErrorDominio con n no entero', () => {
    expect(() => matrizHilbert(2.5)).toThrow();
  });

  test('n = 1 devuelve [[1]]', () => {
    expect(matrizHilbert(1)).toEqual([[1]]);
  });

  test.each([1, 2, 4, 7, 10])('n=%i: cumple H[i][j] = 1/(i+j+1)', (n) => {
    const H = matrizHilbert(n);
    expect(H).toHaveLength(n);
    for (let i = 0; i < n; i++) {
      expect(H[i]).toHaveLength(n);
      for (let j = 0; j < n; j++) {
        expect(H[i][j]).toBeCloseTo(1 / (i + j + 1), 14);
      }
    }
  });

  test('Es simetrica y sus entradas son positivas y decrecen al alejarse de la esquina', () => {
    const H = matrizHilbert(6);
    expect(esSimetrica(H)).toBe(true);
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        expect(H[i][j]).toBeGreaterThan(0);
        if (j > 0) expect(H[i][j]).toBeLessThan(H[i][j - 1]);
      }
    }
  });

  test.each([2, 3, 4, 5, 6, 7, 8])('n=%i: no es diagonal dominante', (n) => {
    expect(esDiagonalDominante(matrizHilbert(n))).toBe(false);
  });

  // Determinantes exactos conocidos: det(H2)=1/12, det(H3)=1/2160, det(H4)=1/6048000.
  // El determinante es el producto de los pivotes de Cholesky.
  test.each([
    [2, 1 / 12],
    [3, 1 / 2160],
    [4, 1 / 6048000],
  ])('n=%i: el producto de pivotes de Cholesky coincide con el determinante exacto', (n, det) => {
    const { ok, pivotes } = cholesky(matrizHilbert(n));
    expect(ok).toBe(true);
    const producto = pivotes.reduce((a, b) => a * b, 1);
    expect(Math.abs(producto / det - 1)).toBeLessThan(1e-8);
  });

  test('Mal condicionamiento: el ultimo pivote de Cholesky decrece estrictamente con n', () => {
    let previo = Infinity;
    for (let n = 1; n <= 10; n++) {
      const { ok, pivotes } = cholesky(matrizHilbert(n));
      expect(ok).toBe(true);
      const ultimo = pivotes[n - 1];
      expect(ultimo).toBeLessThan(previo);
      previo = ultimo;
    }
    // Para n=10 el pivote ya es del orden de 1e-11 (casi singular)
    expect(previo).toBeLessThan(1e-9);
  });

  test('Jacobi converge en Hilbert 2x2 (radio espectral ~0.866 < 1)', () => {
    const H = matrizHilbert(2);
    const xe = xExacto(2);
    const r = jacobi(H, multiplicar(H, xe), { tol: 1e-8, maxIter: 1000 });
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toBeLessThan(1000);
    expect(normaInf(r.x.map((v, i) => v - xe[i])) / normaInf(xe)).toBeLessThan(1e-6);
  });

  // Hilbert 3x3: el radio espectral de la matriz de Jacobi es ~1.7 > 1 -> diverge.
  test.each([3, 4])('n=%i: Jacobi no converge (agota maxIter y los incrementos crecen)', (n) => {
    const H = matrizHilbert(n);
    const maxIter = 50;
    const r = jacobi(H, multiplicar(H, xExacto(n)), { tol: 1e-8, maxIter });
    expect(normaJacobi(H)).toBeGreaterThanOrEqual(1);
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(maxIter);
    expect(r.incrementos).toHaveLength(maxIter);
    expect(r.incrementos[maxIter - 1]).toBeGreaterThan(1e6 * r.incrementos[0]);
  });
});

// -------------------------------------------------------------------
// matrizDiagonalDominante
// -------------------------------------------------------------------

describe('matrizDiagonalDominante', () => {
  test('Produce matriz realmente diagonal dominante', () => {
    const A = matrizDiagonalDominante(4, 12345);
    expect(esDiagonalDominante(A)).toBe(true);
  });

  test('Es reproducible con la misma semilla', () => {
    const A1 = matrizDiagonalDominante(3, 42);
    const A2 = matrizDiagonalDominante(3, 42);
    expect(JSON.stringify(A1)).toBe(JSON.stringify(A2));
  });

  test('Matrices con semillas diferentes son diferentes', () => {
    const A1 = matrizDiagonalDominante(3, 1);
    const A2 = matrizDiagonalDominante(3, 2);
    expect(JSON.stringify(A1)).not.toBe(JSON.stringify(A2));
  });

  test('Lanza ErrorDominio con n no entero', () => {
    expect(() => matrizDiagonalDominante(2.5)).toThrow();
  });

  test.each([1, 2, 5, 10, 20])('n=%i: cuadrada, finita, diagonal positiva y margen de dominancia >= 1', (n) => {
    const A = matrizDiagonalDominante(n, 2024);
    expect(A).toHaveLength(n);
    A.forEach((fila, i) => {
      expect(fila).toHaveLength(n);
      fila.forEach((v) => expect(Number.isFinite(v)).toBe(true));
      const sumaResto = fila.reduce((s, v, j) => s + (i !== j ? Math.abs(v) : 0), 0);
      // fila[i] = sumaResto + random()*5 + 1  ->  margen en [1, 6)
      expect(fila[i]).toBeGreaterThan(0);
      expect(fila[i] - sumaResto).toBeGreaterThanOrEqual(1 - 1e-12);
      expect(fila[i] - sumaResto).toBeLessThanOrEqual(6 + 1e-12);
    });
    expect(esDiagonalDominante(A)).toBe(true);
  });

  test('Los elementos fuera de la diagonal estan en [-5, 5]', () => {
    const A = matrizDiagonalDominante(12, 31337);
    A.forEach((fila, i) =>
      fila.forEach((v, j) => {
        if (i !== j) {
          expect(v).toBeGreaterThanOrEqual(-5);
          expect(v).toBeLessThanOrEqual(5);
        }
      })
    );
  });

  test.each([1, 42, 12345, 99999])('Semilla %i: reproducible entre llamadas', (semilla) => {
    expect(matrizDiagonalDominante(6, semilla)).toEqual(matrizDiagonalDominante(6, semilla));
  });

  test('Una llamada intermedia con otra semilla no altera la reproducibilidad (sin estado global)', () => {
    const primera = matrizDiagonalDominante(4, 42);
    matrizDiagonalDominante(4, 7);
    const segunda = matrizDiagonalDominante(4, 42);
    expect(segunda).toEqual(primera);
  });

  test('Sin semilla (null) tambien produce una matriz diagonal dominante valida', () => {
    const A = matrizDiagonalDominante(5, null);
    expect(A).toHaveLength(5);
    expect(esDiagonalDominante(A)).toBe(true);
  });

  test('Dominancia garantiza q < 1 en la iteracion de Jacobi', () => {
    for (const [n, semilla] of casosDD) {
      expect(normaJacobi(matrizDiagonalDominante(n, semilla))).toBeLessThan(1);
    }
  });
});

// -------------------------------------------------------------------
// Convergencia de Jacobi sobre matrizDiagonalDominante
// (precision segun tolerancia, orden de convergencia, no convergencia)
// -------------------------------------------------------------------

describe('Jacobi sobre matrizDiagonalDominante: precision y convergencia', () => {
  const armar = (n, semilla) => {
    const A = matrizDiagonalDominante(n, semilla);
    const xe = xExacto(n);
    return { A, xe, b: multiplicar(A, xe), q: normaJacobi(A) };
  };

  const combinaciones = casosDD.flatMap(([n, s]) => tolerancias.map((t) => [n, s, t]));

  // Cota rigurosa: |x_k - x*|_inf <= q/(1-q) * |x_k - x_k-1|_inf < q/(1-q) * tol
  test.each(combinaciones)('n=%i semilla=%i tol=%s: converge y el error relativo respeta la cota teorica', (n, semilla, tol) => {
    const { A, xe, b, q } = armar(n, semilla);
    const r = jacobi(A, b, { tol, maxIter: 20000 });
    expect(r.convergio).toBe(true);
    expect(r.incrementos[r.iteraciones - 1]).toBeLessThan(tol);
    const errorRelativo = normaInf(r.x.map((v, i) => v - xe[i])) / normaInf(xe);
    const cota = ((q / (1 - q)) * tol + 1e-12) / normaInf(xe);
    expect(errorRelativo).toBeLessThanOrEqual(cota);
  });

  test.each(casosDD)('n=%i semilla=%i: iteraciones no decrecientes al endurecer la tolerancia', (n, semilla) => {
    const { A, b } = armar(n, semilla);
    const iteraciones = tolerancias.map((tol) => jacobi(A, b, { tol, maxIter: 20000 }).iteraciones);
    for (let i = 1; i < iteraciones.length; i++) {
      expect(iteraciones[i]).toBeGreaterThanOrEqual(iteraciones[i - 1]);
    }
    expect(iteraciones[iteraciones.length - 1]).toBeGreaterThan(iteraciones[0]);
  });

  test.each(casosDD)('n=%i semilla=%i: iteraciones dentro de la cota teorica k <= log(tol/inc1)/log(q) + 2', (n, semilla) => {
    const { A, b, q } = armar(n, semilla);
    for (const tol of tolerancias) {
      const r = jacobi(A, b, { tol, maxIter: 20000 });
      const cota = Math.floor(Math.log(tol / r.incrementos[0]) / Math.log(q)) + 2;
      expect(r.iteraciones).toBeLessThanOrEqual(Math.max(cota, 2));
    }
  });

  test.each(casosDD)('n=%i semilla=%i: los incrementos se contraen con factor <= q (convergencia lineal)', (n, semilla) => {
    const { A, b, q } = armar(n, semilla);
    const { incrementos } = jacobi(A, b, { tol: 1e-12, maxIter: 20000 });
    for (let k = 1; k < incrementos.length; k++) {
      if (incrementos[k - 1] < 1e-10) break; // ruido de redondeo
      expect(incrementos[k]).toBeLessThanOrEqual(q * incrementos[k - 1] * (1 + 1e-9) + 1e-15);
    }
  });

  test.each(casosDD)('n=%i semilla=%i: tasa media de reduccion (media geometrica) <= q < 1', (n, semilla) => {
    const { A, b, q } = armar(n, semilla);
    const { incrementos, iteraciones } = jacobi(A, b, { tol: 1e-12, maxIter: 20000 });
    const tasa = Math.pow(incrementos[iteraciones - 1] / incrementos[0], 1 / (iteraciones - 1));
    expect(tasa).toBeLessThanOrEqual(q * (1 + 1e-9));
    expect(tasa).toBeLessThan(1);
  });

  test.each(casosDD)('n=%i semilla=%i: valor inicial exacto converge en 1 iteracion', (n, semilla) => {
    const { A, xe, b } = armar(n, semilla);
    const r = jacobi(A, b, { tol: 1e-8, maxIter: 100, x0: xe });
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toBe(1);
  });

  test.each(casosDD.filter(([n]) => n >= 3))('n=%i semilla=%i: valor inicial lejano (1e6) exige mas iteraciones pero converge', (n, semilla) => {
    const { A, xe, b } = armar(n, semilla);
    const lejano = xe.map((v) => v + 1e6);
    const r = jacobi(A, b, { tol: 1e-8, maxIter: 20000, x0: lejano });
    expect(r.convergio).toBe(true);
    expect(r.iteraciones).toBeGreaterThan(1);
  });

  test('maxIter insuficiente: convergio=false y agota exactamente maxIter', () => {
    const { A, b } = armar(5, 42);
    for (const maxIter of [1, 3, 5]) {
      const r = jacobi(A, b, { tol: 1e-12, maxIter });
      expect(r.convergio).toBe(false);
      expect(r.iteraciones).toBe(maxIter);
      expect(r.incrementos).toHaveLength(maxIter);
    }
  });

  test('Tolerancia inalcanzable (0): no converge y agota maxIter', () => {
    const { A, b } = armar(5, 42);
    const r = jacobi(A, b, { tol: 0, maxIter: 500 });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(500);
  });

  test('Matriz diagonal dominante converge, Hilbert 3x3 no: contraste directo', () => {
    const { A, b } = armar(3, 1);
    const H = matrizHilbert(3);
    const bH = multiplicar(H, xExacto(3));
    expect(jacobi(A, b, { tol: 1e-8, maxIter: 200 }).convergio).toBe(true);
    expect(jacobi(H, bH, { tol: 1e-8, maxIter: 200 }).convergio).toBe(false);
  });

  test('No modifica la matriz generada al usarla (entrada intacta)', () => {
    const { A, b } = armar(4, 12345);
    const copia = JSON.parse(JSON.stringify(A));
    jacobi(A, b, { tol: 1e-10, maxIter: 20000 });
    expect(A).toEqual(copia);
  });
});

// -------------------------------------------------------------------
// matrizSimetricaDefinidaPositiva
// -------------------------------------------------------------------

describe('matrizSimetricaDefinidaPositiva', () => {
  test('Produce matriz simetrica', () => {
    const A = matrizSimetricaDefinidaPositiva(4, 12345);
    expect(esSimetrica(A)).toBe(true);
  });

  test('Es reproducible con la misma semilla', () => {
    const A1 = matrizSimetricaDefinidaPositiva(3, 42);
    const A2 = matrizSimetricaDefinidaPositiva(3, 42);
    expect(JSON.stringify(A1)).toBe(JSON.stringify(A2));
  });

  test('Lanza ErrorDominio con n no entero', () => {
    expect(() => matrizSimetricaDefinidaPositiva(2.5)).toThrow();
  });

  test('Semillas diferentes producen matrices diferentes', () => {
    expect(matrizSimetricaDefinidaPositiva(4, 1)).not.toEqual(matrizSimetricaDefinidaPositiva(4, 2));
  });

  test('Sin semilla (null) produce una matriz simetrica valida', () => {
    const A = matrizSimetricaDefinidaPositiva(5, null);
    expect(A).toHaveLength(5);
    expect(esSimetrica(A)).toBe(true);
    expect(cholesky(A).ok).toBe(true);
  });

  test.each([1, 2, 5, 10, 20])('n=%i: cuadrada, finita, simetrica y diagonal >= n', (n) => {
    const A = matrizSimetricaDefinidaPositiva(n, 2024);
    expect(A).toHaveLength(n);
    A.forEach((fila, i) => {
      expect(fila).toHaveLength(n);
      fila.forEach((v) => expect(Number.isFinite(v)).toBe(true));
      // A = B^T B + n I  ->  A[i][i] = suma de cuadrados + n >= n
      expect(fila[i]).toBeGreaterThanOrEqual(n);
    });
    expect(esSimetrica(A)).toBe(true);
  });

  test.each(casosSPD)('n=%i semilla=%i: definida positiva (Cholesky con pivotes >= n)', (n, semilla) => {
    const { ok, pivotes } = cholesky(matrizSimetricaDefinidaPositiva(n, semilla));
    expect(ok).toBe(true);
    // lambda_min(A) >= n, y cada pivote es una entrada diagonal de un complemento de Schur
    pivotes.forEach((p) => expect(p).toBeGreaterThanOrEqual(n * (1 - 1e-9)));
  });

  test.each(casosSPD)('n=%i semilla=%i: x^T A x >= n * x^T x para vectores de prueba', (n, semilla) => {
    const A = matrizSimetricaDefinidaPositiva(n, semilla);
    const vectores = [
      new Array(n).fill(1),
      xExacto(n),
      Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : -1)),
      ...Array.from({ length: n }, (_, k) => Array.from({ length: n }, (_, i) => (i === k ? 1 : 0))),
    ];
    for (const x of vectores) {
      const Ax = multiplicar(A, x);
      const forma = x.reduce((s, v, i) => s + v * Ax[i], 0);
      const xtx = x.reduce((s, v) => s + v * v, 0);
      expect(forma).toBeGreaterThanOrEqual(n * xtx * (1 - 1e-12));
    }
  });

  test.each(casosSPD)('n=%i semilla=%i: L L^T reconstruye A con error relativo <= 1e-12', (n, semilla) => {
    const A = matrizSimetricaDefinidaPositiva(n, semilla);
    const { L } = cholesky(A);
    let maxErr = 0;
    let maxA = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < n; k++) s += L[i][k] * L[j][k];
        maxErr = Math.max(maxErr, Math.abs(s - A[i][j]));
        maxA = Math.max(maxA, Math.abs(A[i][j]));
      }
    }
    expect(maxErr / maxA).toBeLessThanOrEqual(1e-12);
  });

  test.each(casosSPD)('n=%i semilla=%i: el sistema A x = b se resuelve por Cholesky con error relativo <= 1e-9', (n, semilla) => {
    const A = matrizSimetricaDefinidaPositiva(n, semilla);
    const xe = xExacto(n);
    const b = multiplicar(A, xe);
    const { L } = cholesky(A);
    const y = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let s = b[i];
      for (let k = 0; k < i; k++) s -= L[i][k] * y[k];
      y[i] = s / L[i][i];
    }
    const x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      let s = y[i];
      for (let k = i + 1; k < n; k++) s -= L[k][i] * x[k];
      x[i] = s / L[i][i];
    }
    expect(normaInf(x.map((v, i) => v - xe[i])) / normaInf(xe)).toBeLessThanOrEqual(1e-9);
  });
});

// -------------------------------------------------------------------
// Convergencia de Gauss-Seidel sobre matrizSimetricaDefinidaPositiva
// (Gauss-Seidel converge siempre para matrices simetricas definidas positivas)
// -------------------------------------------------------------------

describe('Gauss-Seidel sobre matrizSimetricaDefinidaPositiva: precision y convergencia', () => {
  const tolsGS = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10];
  const combinaciones = casosSPD.flatMap(([n, s]) => tolsGS.map((t) => [n, s, t]));

  // Con parada por residuo y lambda_min >= n:  |x_k - x*|_inf <= tol / sqrt(n) <= tol
  test.each(combinaciones)('n=%i semilla=%i tol=%s: converge y el error absoluto es <= tol', (n, semilla, tol) => {
    const A = matrizSimetricaDefinidaPositiva(n, semilla);
    const xe = xExacto(n);
    const r = gaussSeidel(A, multiplicar(A, xe), { tol, maxIter: 200000 });
    expect(r.convergio).toBe(true);
    const error = normaInf(r.x.map((v, i) => v - xe[i]));
    expect(error).toBeLessThanOrEqual(tol * (1 + 1e-6) + 1e-12);
  });

  test.each(casosSPD)('n=%i semilla=%i: iteraciones no decrecientes al endurecer la tolerancia', (n, semilla) => {
    const A = matrizSimetricaDefinidaPositiva(n, semilla);
    const b = multiplicar(A, xExacto(n));
    const iteraciones = tolsGS.map((tol) => gaussSeidel(A, b, { tol, maxIter: 200000 }).iteraciones);
    for (let i = 1; i < iteraciones.length; i++) {
      expect(iteraciones[i]).toBeGreaterThanOrEqual(iteraciones[i - 1]);
    }
  });

  test('maxIter insuficiente: convergio=false y agota exactamente maxIter', () => {
    const A = matrizSimetricaDefinidaPositiva(6, 7);
    const b = multiplicar(A, xExacto(6));
    const r = gaussSeidel(A, b, { tol: 1e-12, maxIter: 2 });
    expect(r.convergio).toBe(false);
    expect(r.iteraciones).toBe(2);
  });
});

// -------------------------------------------------------------------
// Verificadores
// -------------------------------------------------------------------

describe('esDiagonalDominante', () => {
  test('Identidad es diagonal dominante', () => {
    expect(esDiagonalDominante(matrizIdentidad(3))).toBe(true);
  });

  test('Matriz no diagonal dominante', () => {
    const A = [
      [1, 10],
      [1, 1],
    ];
    expect(esDiagonalDominante(A)).toBe(false);
  });

  test('La dominancia es estricta: igualdad diagonal = suma del resto NO cuenta', () => {
    expect(
      esDiagonalDominante([
        [2, 2],
        [2, 2],
      ])
    ).toBe(false);
    expect(esDiagonalDominante([[0]])).toBe(false);
  });

  test('Matriz 1x1 con diagonal no nula es dominante', () => {
    expect(esDiagonalDominante([[5]])).toBe(true);
    expect(esDiagonalDominante([[-5]])).toBe(true);
  });

  test('Usa el valor absoluto (diagonal y fuera de diagonal negativos)', () => {
    expect(
      esDiagonalDominante([
        [-5, 1, -2],
        [1, -5, 2],
        [-1, -1, 3],
      ])
    ).toBe(true);
  });

  test('Basta que una sola fila falle para devolver false', () => {
    expect(
      esDiagonalDominante([
        [10, 1, 1],
        [1, 10, 1],
        [5, 5, 4],
      ])
    ).toBe(false);
  });

  test('No modifica la matriz de entrada', () => {
    const A = [
      [4, 1],
      [2, 5],
    ];
    const copia = JSON.parse(JSON.stringify(A));
    esDiagonalDominante(A);
    expect(A).toEqual(copia);
  });
});

describe('esSimetrica', () => {
  test('Identidad es simetrica', () => {
    expect(esSimetrica(matrizIdentidad(3))).toBe(true);
  });

  test('Matriz no simetrica', () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    expect(esSimetrica(A)).toBe(false);
  });

  test('Matriz 1x1 es simetrica', () => {
    expect(esSimetrica([[7]])).toBe(true);
  });

  test('Tolerancia interna 1e-12: diferencia 1e-13 se acepta y 1e-11 se rechaza', () => {
    expect(
      esSimetrica([
        [1, 1],
        [1 + 1e-13, 1],
      ])
    ).toBe(true);
    expect(
      esSimetrica([
        [1, 1],
        [1 + 1e-11, 1],
      ])
    ).toBe(false);
  });

  test('Detecta una sola asimetria en matriz grande', () => {
    const A = matrizSimetricaDefinidaPositiva(8, 5);
    expect(esSimetrica(A)).toBe(true);
    A[2][6] += 1e-3;
    expect(esSimetrica(A)).toBe(false);
  });

  test('Hilbert es simetrica; diagonal dominante aleatoria generalmente no', () => {
    expect(esSimetrica(matrizHilbert(5))).toBe(true);
    expect(esSimetrica(matrizDiagonalDominante(5, 42))).toBe(false);
  });

  test('No modifica la matriz de entrada', () => {
    const A = [
      [1, 2],
      [2, 1],
    ];
    const copia = JSON.parse(JSON.stringify(A));
    esSimetrica(A);
    expect(A).toEqual(copia);
  });
});

// -------------------------------------------------------------------
// Validacion de n: clase y prefijo del mensaje en los 4 generadores
// -------------------------------------------------------------------

describe.each([
  ['matrizIdentidad', matrizIdentidad],
  ['matrizHilbert', matrizHilbert],
  ['matrizDiagonalDominante', matrizDiagonalDominante],
  ['matrizSimetricaDefinidaPositiva', matrizSimetricaDefinidaPositiva],
])('Validacion de n en %s', (nombre, funcion) => {
  test.each([
    ['decimal', 2.5],
    ['negativo', -1],
    ['cero', 0],
    ['NaN', NaN],
    ['Infinity', Infinity],
    ['-Infinity', -Infinity],
    ['string numerico', '3'],
    ['null', null],
    ['undefined', undefined],
    ['arreglo', [3]],
    ['objeto', {}],
    ['booleano', true],
  ])('n %s lanza ErrorDominio (no TypeError) con prefijo y descripcion', (_desc, n) => {
    const error = capturar(() => funcion(n));
    expect(error).not.toBeNull();
    expect(error).toBeInstanceOf(ErrorDominio);
    expect(error).not.toBeInstanceOf(TypeError);
    expect(error.message).toMatch(new RegExp(`^ChuspaNumeric\\.${nombre}: n debe ser un entero positivo`));
  });

  test('El mensaje incluye el valor recibido', () => {
    expect(capturar(() => funcion(-1)).message).toMatch(/Recibido: -1/);
    expect(capturar(() => funcion(2.5)).message).toMatch(/Recibido: 2\.5/);
  });

  test('n = 1 (minimo valido) no lanza error', () => {
    expect(capturar(() => funcion(1))).toBeNull();
  });
});
