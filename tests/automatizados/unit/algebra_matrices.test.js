import {
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar
} from '../../../src/matricial/algebra_matrices.js';

// Las operaciones devuelven el objeto de contrato; el valor calculado va en .resultado
const valor = (respuesta) => respuesta.resultado;

describe('algebra_matrices', () => {

  test('suma y resta dos matrices del mismo tamaño', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[5, 6], [7, 8]];

    expect(valor(sumaMatrices(A, B))).toEqual([[6, 8], [10, 12]]);
    expect(valor(restaMatrices(B, A))).toEqual([[4, 4], [4, 4]]);
  });

  test('multiplica dos matrices compatibles', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[2, 0], [1, 2]];

    expect(valor(multiplicarMatrices(A, B))).toEqual([[4, 4], [10, 8]]);
  });

  test('calcula la transpuesta de una matriz rectangular', () => {
    const A = [[1, 2, 3], [4, 5, 6]];

    expect(valor(transpuesta(A))).toEqual([[1, 4], [2, 5], [3, 6]]);
  });

  test('multiplica una matriz por un escalar', () => {
    const A = [[1, 2], [3, 4]];

    expect(valor(multiplicarEscalar(2, A))).toEqual([[2, 4], [6, 8]]);
  });

  test('lanza Error cuando las dimensiones son incompatibles', () => {
    const A = [[1, 2], [3, 4]];
    const B = [[1, 2, 3]];

    expect(() => sumaMatrices(A, B))
      .toThrow(/dimensiones incompatibles/i);

    expect(() => restaMatrices(A, B))
      .toThrow(/dimensiones incompatibles/i);

    expect(() => multiplicarMatrices(A, B))
      .toThrow(/dimensiones incompatibles/i);
  });

  test('lanza Error cuando una matriz no es rectangular, está vacía o contiene NaN', () => {
    const noRectangular = [[1, 2], [3]];
    const vacia = [];
    const conNaN = [[1, NaN], [3, 4]];

    expect(() => transpuesta(noRectangular)).toThrow(Error);
    expect(() => transpuesta(vacia)).toThrow(Error);
    expect(() => transpuesta(conNaN)).toThrow(Error);
  });

  test('lanza Error cuando el escalar no es finito', () => {
    const A = [[1, 2], [3, 4]];

    expect(() => multiplicarEscalar(Infinity, A)).toThrow(Error);
    expect(() => multiplicarEscalar(NaN, A)).toThrow(Error);
  });

});

// ============================================================
// Casos agregados para el issue #1589
// Tolerancias, tamaños de paso, órdenes de convergencia,
// errores relativos y detección de no convergencia / divergencia.
// ============================================================

import {
  trazaMatriz,
  potenciaMatriz,
  MAX_EXPONENTE,
} from '../../../src/matricial/algebra_matrices.js';

// Error relativo maximo elemento a elemento entre dos matrices
const errorRelativoMaximo = (A, B) => {
  let maximo = 0;
  for (let i = 0; i < A.length; i += 1) {
    for (let j = 0; j < A[i].length; j += 1) {
      const escala = Math.max(1, Math.abs(B[i][j]));
      maximo = Math.max(maximo, Math.abs(A[i][j] - B[i][j]) / escala);
    }
  }
  return maximo;
};

const identidad = (n) =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

describe('tolerancias y errores relativos', () => {
  test('el producto de una matriz por su inversa recupera la identidad dentro de tolerancia', () => {
    const A = [[4, 7], [2, 6]];
    const inversa = [[0.6, -0.7], [-0.2, 0.4]];
    const producto = valor(multiplicarMatrices(A, inversa));

    expect(errorRelativoMaximo(producto, identidad(2))).toBeLessThan(1e-12);
    expect(producto[0][0]).toBeCloseTo(1, 12);
    expect(producto[0][1]).toBeCloseTo(0, 12);
    expect(producto[1][0]).toBeCloseTo(0, 12);
    expect(producto[1][1]).toBeCloseTo(1, 12);
  });

  test('la propiedad distributiva se cumple dentro de tolerancia pero no bit a bit', () => {
    const X = [[0.1, 0.2], [0.3, 0.4]];
    const Y = [[0.5, 0.6], [0.7, 0.8]];
    const Z = [[0.9, 1.1], [1.3, 1.7]];

    const izquierda = valor(multiplicarMatrices(X, valor(sumaMatrices(Y, Z))));
    const derecha = valor(
      sumaMatrices(valor(multiplicarMatrices(X, Y)), valor(multiplicarMatrices(X, Z)))
    );

    // A(B+C) = AB+AC es exacto en aritmetica real, no en punto flotante
    expect(errorRelativoMaximo(izquierda, derecha)).toBeLessThan(1e-15);
    expect(izquierda).not.toEqual(derecha);
  });

  test('la transpuesta doble devuelve la matriz original de forma exacta', () => {
    const A = [[1.5, -2.25, 3.125], [0.5, 4.75, -6.0]];

    expect(valor(transpuesta(valor(transpuesta(A))))).toEqual(A);
  });

  test('la transpuesta del producto invierte el orden de los factores', () => {
    const A = [[1, 2, 3], [4, 5, 6]];
    const B = [[7, 8], [9, 10], [11, 12]];

    const izquierda = valor(transpuesta(valor(multiplicarMatrices(A, B))));
    const derecha = valor(multiplicarMatrices(valor(transpuesta(B)), valor(transpuesta(A))));

    expect(errorRelativoMaximo(izquierda, derecha)).toBeLessThan(1e-15);
  });

  test('la traza es lineal dentro de tolerancia', () => {
    const A = [[1.25, 2], [3, 4.75]];
    const B = [[0.5, 1], [1, 0.25]];
    const k = 3.5;

    const izquierda = valor(trazaMatriz(valor(multiplicarEscalar(k, valor(sumaMatrices(A, B))))));
    const derecha = k * (valor(trazaMatriz(A)) + valor(trazaMatriz(B)));

    expect(izquierda).toBeCloseTo(derecha, 12);
  });
});

describe('tamanos de paso en el escalado de matrices', () => {
  const A = [[1, 2], [3, 4]];

  test('la traza escala linealmente con el paso h', () => {
    for (const h of [1e-1, 1e-2, 1e-4, 1e-8]) {
      const escalada = valor(multiplicarEscalar(h, A));
      expect(valor(trazaMatriz(escalada))).toBeCloseTo(h * 5, 12);
    }
  });

  test('escalar por h y luego por 1/h recupera la matriz original', () => {
    for (const h of [1e-1, 1e-2, 1e-4, 1e-8]) {
      const ida = valor(multiplicarEscalar(h, A));
      const vuelta = valor(multiplicarEscalar(1 / h, ida));

      expect(errorRelativoMaximo(vuelta, A)).toBeLessThan(1e-12);
    }
  });

  test('al refinar el paso la matriz escalada tiende a la matriz nula', () => {
    const normas = [1e-1, 1e-2, 1e-3, 1e-4].map((h) =>
      errorRelativoMaximo(valor(multiplicarEscalar(h, A)), [[0, 0], [0, 0]])
    );

    for (let i = 1; i < normas.length; i += 1) {
      expect(normas[i]).toBeLessThan(normas[i - 1]);
    }
    expect(normas[normas.length - 1]).toBeLessThan(1e-3);
  });
});

describe('orden de convergencia', () => {
  test('las potencias de una matriz contractiva tienden a la matriz nula', () => {
    const C = [[0.5, 0.25], [0, 0.5]];
    const nula = [[0, 0], [0, 0]];
    const errores = [2, 4, 8, 16].map((n) =>
      errorRelativoMaximo(valor(potenciaMatriz(C, n)), nula)
    );

    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
    }
    expect(errores[errores.length - 1]).toBeLessThan(1e-3);
  });

  test('la serie de Neumann converge a (I - A)^-1 con razon lineal 1/2', () => {
    const A = [[0.5, 0], [0, 0.5]];
    let suma = [[0, 0], [0, 0]];
    const errores = [];

    for (let n = 0; n <= 8; n += 1) {
      suma = valor(sumaMatrices(suma, valor(potenciaMatriz(A, n))));
      // (I - 0.5 I)^-1 = 2 I
      errores.push(errorRelativoMaximo(suma, [[2, 0], [0, 2]]));
    }

    // Convergencia lineal: cada termino divide el error exactamente por 2
    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i - 1] / errores[i]).toBeCloseTo(2, 10);
    }
    expect(errores[errores.length - 1]).toBeLessThan(1e-2);
  });

  test('la traza de las potencias reproduce la suma de autovalores elevados a n', () => {
    const C = [[0.5, 0.25], [0, 0.5]];

    // Matriz triangular con autovalores 0.5 y 0.5: traza(C^n) = 2 (0.5)^n
    for (const n of [1, 2, 3, 10]) {
      expect(valor(trazaMatriz(valor(potenciaMatriz(C, n))))).toBeCloseTo(2 * 0.5 ** n, 12);
    }
  });

  test('la potencia cero devuelve la identidad y no registra iteraciones', () => {
    const respuesta = potenciaMatriz([[1, 2], [3, 4]], 0);

    expect(valor(respuesta)).toEqual(identidad(2));
    expect(respuesta.iteraciones).toEqual([]);
  });

  test('el numero de iteraciones registradas coincide con el exponente', () => {
    const A = [[1, 1], [0, 1]];

    for (const n of [1, 3, 7]) {
      expect(potenciaMatriz(A, n).iteraciones).toHaveLength(n);
    }
  });

  test('una matriz con radio espectral mayor que 1 crece sin tender a un limite', () => {
    const A = [[1.1, 0], [0, 1.1]];
    const crecimiento = [10, 50, 100].map((n) => valor(potenciaMatriz(A, n))[0][0]);

    for (let i = 1; i < crecimiento.length; i += 1) {
      expect(crecimiento[i]).toBeGreaterThan(crecimiento[i - 1]);
    }
    expect(crecimiento[2]).toBeCloseTo(1.1 ** 100, 6);
  });
});

describe('deteccion de no convergencia y divergencia', () => {
  test('detecta desbordamiento numerico al elevar una matriz de entradas enormes', () => {
    expect(() => potenciaMatriz([[1e200, 0], [0, 1e200]], 5)).toThrow(/divergencia numérica/i);
  });

  test('informa la iteracion exacta en la que aparece la divergencia', () => {
    expect(() => potenciaMatriz([[1e200, 0], [0, 1e200]], 5)).toThrow(/iteración 2/);
    expect(() => potenciaMatriz([[1e40, 1], [0, 1e40]], 20)).toThrow(/iteración 8/);
  });

  test('rechaza exponentes no validos antes de iterar', () => {
    const A = [[1, 2], [3, 4]];

    expect(() => potenciaMatriz(A, -1)).toThrow(/entero mayor o igual a 0/);
    expect(() => potenciaMatriz(A, 1.5)).toThrow(/entero mayor o igual a 0/);
    expect(() => potenciaMatriz(A, MAX_EXPONENTE + 1)).toThrow(/excede el máximo permitido/);
  });

  test('rechaza la potencia y la traza de matrices no cuadradas', () => {
    const rectangular = [[1, 2, 3], [4, 5, 6]];

    expect(() => potenciaMatriz(rectangular, 2)).toThrow(/requiere una matriz cuadrada/);
    expect(() => trazaMatriz(rectangular)).toThrow(/requiere una matriz cuadrada/);
  });

  test('rechaza entradas no finitas en todas las operaciones', () => {
    const noFinitas = [
      [[1, NaN], [3, 4]],
      [[1, 2], [Infinity, 4]],
      [[-Infinity, 2], [3, 4]],
    ];

    for (const M of noFinitas) {
      const B = [[1, 0], [0, 1]];

      expect(() => sumaMatrices(M, B)).toThrow(/no es un número finito/);
      expect(() => restaMatrices(M, B)).toThrow(/no es un número finito/);
      expect(() => multiplicarMatrices(M, B)).toThrow(/no es un número finito/);
      expect(() => transpuesta(M)).toThrow(/no es un número finito/);
      expect(() => multiplicarEscalar(2, M)).toThrow(/no es un número finito/);
      expect(() => trazaMatriz(M)).toThrow(/no es un número finito/);
      expect(() => potenciaMatriz(M, 2)).toThrow(/no es un número finito/);
    }
  });

  test('una matriz estable permanece acotada tras muchas potencias', () => {
    const estable = [[0.9, 0], [0, 0.9]];
    const resultado = valor(potenciaMatriz(estable, 200));

    expect(Number.isFinite(resultado[0][0])).toBe(true);
    expect(resultado[0][0]).toBeLessThan(1e-9);
  });
});
