import { ErrorDominio, ErrorParametros } from '../../../src/core/errores.js';
import { descomposicionCholesky, resolverCholesky } from '../../../src/lineales/cholesky.js';

// Helper function to multiply matrices
function multiplicarMatrices(A, B) {
  const n = A.length;
  const m = B[0].length;
  const p = B.length;
  const C = Array.from({ length: n }, () => new Array(m).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      for (let k = 0; k < p; k++) {
        C[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  
  return C;
}

// Helper function to transpose a matrix
function transponerMatriz(A) {
  const n = A.length;
  const AT = Array.from({ length: n }, () => new Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      AT[i][j] = A[j][i];
    }
  }
  
  return AT;
}

// -------------------------------------------------------------------
// Descomposición de Cholesky
// -------------------------------------------------------------------

describe('descomposicionCholesky', () => {
  test('Factoriza matriz simétrica definida positiva 3x3 conocida', () => {
    // Matriz del ejemplo: [[4,12,-16],[12,37,-43],[-16,-43,98]]
    const A = [
      [4, 12, -16],
      [12, 37, -43],
      [-16, -43, 98]
    ];

    const res = descomposicionCholesky(A);
    
    expect(res.convergio).toBe(true);
    expect(res.resultado).toHaveProperty('L');
    
    const L = res.resultado.L;
    
    // Verificar que L es triangular inferior
    for (let i = 0; i < L.length; i++) {
      for (let j = i + 1; j < L.length; j++) {
        expect(L[i][j]).toBeCloseTo(0, 10);
      }
    }
    
    // Verificar que L * L^T = A (reconstrucción de la matriz original)
    const LT = transponerMatriz(L);
    const A_reconstruida = multiplicarMatrices(L, LT);
    
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A.length; j++) {
        expect(A_reconstruida[i][j]).toBeCloseTo(A[i][j], 6);
      }
    }
  });

  test('Factoriza matriz 2x2 simple', () => {
    const A = [
      [4, 2],
      [2, 3]
    ];

    const res = descomposicionCholesky(A);
    
    expect(res.convergio).toBe(true);
    
    const L = res.resultado.L;
    const LT = transponerMatriz(L);
    const A_reconstruida = multiplicarMatrices(L, LT);
    
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < A.length; j++) {
        expect(A_reconstruida[i][j]).toBeCloseTo(A[i][j], 6);
      }
    }
  });

  test('Lanza ErrorParametros con matriz no simétrica', () => {
    const A = [
      [4, 2],
      [3, 3]  // No simétrica: A[1][0] = 3 ≠ A[0][1] = 2
    ];

    expect(() => descomposicionCholesky(A)).toThrow();
  });

  test('Lanza ErrorDominio con matriz no definida positiva', () => {
    // Matriz simétrica pero no definida positiva (determinante negativo)
    const A = [
      [1, 2],
      [2, 1]
    ];

    expect(() => descomposicionCholesky(A)).toThrow();
  });

  test('Lanza error con matriz no cuadrada', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6]
    ];

    expect(() => descomposicionCholesky(A)).toThrow();
  });
});

// -------------------------------------------------------------------
// Resolver Cholesky
// -------------------------------------------------------------------

describe('resolverCholesky', () => {
  test('Resuelve sistema Ax=b con matriz conocida', () => {
    // Usar una matriz diagonal simple donde la solución es obvia
    // Sistema: 4x + 0y + 0z = 4
    //         0x + 9y + 0z = 18
    //         0x + 0y + 16z = 48
    // Solución esperada: x=1, y=2, z=3
    const A = [
      [4, 0, 0],
      [0, 9, 0],
      [0, 0, 16]
    ];
    const b = [4, 18, 48];

    // Primero obtener la factorización
    const decomp = descomposicionCholesky(A);
    const L = decomp.resultado.L;

    // Resolver usando L
    const res = resolverCholesky(L, b);
    
    expect(res.convergio).toBe(true);
    expect(res.resultado).toHaveProperty('x');
    
    const x = res.resultado.x;
    expect(x[0]).toBeCloseTo(1, 6);
    expect(x[1]).toBeCloseTo(2, 6);
    expect(x[2]).toBeCloseTo(3, 6);
  });

  test('Resuelve sistema 2x2 simple', () => {
    // Sistema: 4x + 2y = 8
    //         2x + 3y = 8
    // Solución: x=1, y=2
    const A = [
      [4, 2],
      [2, 3]
    ];
    const b = [8, 8];

    const decomp = descomposicionCholesky(A);
    const L = decomp.resultado.L;
    const res = resolverCholesky(L, b);
    
    expect(res.convergio).toBe(true);
    expect(res.resultado.x[0]).toBeCloseTo(1, 6);
    expect(res.resultado.x[1]).toBeCloseTo(2, 6);
  });

  test('El resultado tiene la misma cantidad de variables que el sistema', () => {
    const A = [
      [4, 2],
      [2, 3]
    ];
    const b = [8, 7];

    const decomp = descomposicionCholesky(A);
    const L = decomp.resultado.L;
    const res = resolverCholesky(L, b);
    
    expect(Array.isArray(res.resultado.x)).toBe(true);
    expect(res.resultado.x.length).toBe(2);
  });

  test('Lanza error con vector b de dimensión incorrecta', () => {
    const A = [
      [4, 2],
      [2, 3]
    ];
    const b = [8, 7, 10]; // Dimensión incorrecta

    const decomp = descomposicionCholesky(A);
    const L = decomp.resultado.L;

    expect(() => resolverCholesky(L, b)).toThrow();
  });
});


describe('Cholesky: precisión relativa y límites de factorización', () => {
  test.each([1e-8, 1, 1e8])(
    'reconstruye la matriz y resuelve el sistema con escala %p',
    (escala) => {
      const matriz = [[4, 2], [2, 3]].map((fila) =>
        fila.map((valor) => valor * escala)
      );
      const copia = matriz.map((fila) => [...fila]);
      const independientes = [8 * escala, 8 * escala];
      const { resultado, convergio } = descomposicionCholesky(matriz);
      const reconstruida = multiplicarMatrices(
        resultado.L,
        transponerMatriz(resultado.L)
      );
      const solucion = resolverCholesky(resultado.L, independientes);

      expect(convergio).toBe(true);
      expect(solucion.convergio).toBe(true);
      matriz.forEach((fila, i) => {
        fila.forEach((valor, j) => {
          expect(Math.abs(reconstruida[i][j] - valor) / Math.abs(valor)).toBeLessThan(
            1e-14
          );
        });
      });
      [1, 2].forEach((exacto, indice) => {
        expect(
          Math.abs(solucion.resultado.x[indice] - exacto) / Math.abs(exacto)
        ).toBeLessThan(1e-14);
      });
      expect(matriz).toEqual(copia);
      expect(independientes).toEqual([8 * escala, 8 * escala]);
    }
  );

  test.each([1e-6, 1e-10, 1e-14])(
    'cumple el umbral de error relativo %p en un sistema no diagonal',
    (tolerancia) => {
      const matriz = [[6, 2, 1], [2, 5, 2], [1, 2, 4]];
      const exacta = [1.25, -2.5, 3.75];
      const independientes = matriz.map((fila) =>
        fila.reduce((suma, valor, indice) => suma + valor * exacta[indice], 0)
      );
      const { resultado: { L } } = descomposicionCholesky(matriz);
      const res = resolverCholesky(L, independientes);
      const norma = Math.hypot(...exacta);
      const error = Math.hypot(
        ...res.resultado.x.map((valor, indice) => valor - exacta[indice])
      ) / norma;
      const residuo = Math.hypot(...matriz.map((fila, i) =>
        fila.reduce((suma, valor, j) => suma + valor * res.resultado.x[j], 0)
          - independientes[i]
      )) / Math.hypot(...independientes);

      expect(res.convergio).toBe(true);
      expect(error).toBeLessThan(tolerancia);
      expect(residuo).toBeLessThan(tolerancia);
    }
  );

  test.each([1e-4, 1e-8, 1e-12])(
    'admite un pivote positivo pequeño al perturbar la diagonal en %p',
    (paso) => {
      const matriz = [[1, 1], [1, 1 + paso]];
      const res = descomposicionCholesky(matriz);
      const reconstruida = multiplicarMatrices(
        res.resultado.L,
        transponerMatriz(res.resultado.L)
      );

      expect(res.convergio).toBe(true);
      expect(res.resultado.L[1][1]).toBeGreaterThan(0);
      expect(Number.isFinite(res.resultado.L[1][1])).toBe(true);
      expect(Math.abs(reconstruida[1][1] - matriz[1][1]) / matriz[1][1]).toBeLessThan(
        1e-14
      );
    }
  );

  test.each([0, -1e-4, -1e-8])(
    'rechaza la pérdida de positividad con perturbación %p',
    (paso) => {
      expect(() => descomposicionCholesky([[1, 1], [1, 1 + paso]])).toThrow(
        ErrorDominio
      );
    }
  );

  test.each([NaN, Infinity, -Infinity])(
    'rechaza coeficientes no finitos: %p',
    (valor) => {
      expect(() => descomposicionCholesky([[valor, 0], [0, 1]])).toThrow(
        ErrorParametros
      );
      expect(() => resolverCholesky([[1, 0], [0, 1]], [1, valor])).toThrow(
        ErrorParametros
      );
    }
  );

  test('la solución preserva el factor triangular recibido', () => {
    const factor = [[2, 0], [1, Math.sqrt(2)]];
    const copia = factor.map((fila) => [...fila]);

    resolverCholesky(factor, [8, 8]);

    expect(factor).toEqual(copia);
  });
});
