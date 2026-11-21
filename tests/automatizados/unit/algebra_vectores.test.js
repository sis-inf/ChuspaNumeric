import { describe, expect, test } from '@jest/globals';
import {
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
} from '../../../src/utils/algebra_vectores.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('Operaciones de álgebra de vectores', () => {
  test('suma las componentes de dos vectores', () => {
    expect(sumaVectores([1, 2], [3, 4])).toEqual([4, 6]);
  });

  test('resta las componentes de dos vectores', () => {
    expect(restaVectores([5, 5], [2, 3])).toEqual([3, 2]);
  });

  test('calcula el producto punto de dos vectores', () => {
    expect(productoPunto([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  test('calcula el producto cruz de dos vectores ortogonales', () => {
    expect(productoCruz([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  test('calcula la magnitud de un vector', () => {
    expect(magnitudVector([3, 4])).toBe(5);
  });

  test('normaliza un vector no nulo', () => {
    expect(normalizarVector([3, 4])).toEqual([0.6, 0.8]);
  });

  test('rechaza la normalización del vector cero', () => {
    expect(() => normalizarVector([0, 0])).toThrow(ErrorParametros);
  });

  test.each([
    { nombre: 'suma', ejecutar: sumaVectores },
    { nombre: 'resta', ejecutar: restaVectores },
    { nombre: 'producto punto', ejecutar: productoPunto },
  ])('$nombre rechaza dimensiones diferentes', ({ ejecutar }) => {
    expect(() => ejecutar([1, 2], [3, 4, 5])).toThrow(ErrorParametros);
  });

  test.each([
    { caso: 'ambos vectores de dimensión dos', primero: [1, 0], segundo: [0, 1] },
    { caso: 'primer vector de dimensión dos', primero: [1, 0], segundo: [0, 1, 0] },
    { caso: 'segundo vector de dimensión dos', primero: [1, 0, 0], segundo: [0, 1] },
  ])('producto cruz rechaza $caso', ({ primero, segundo }) => {
    expect(() => productoCruz(primero, segundo)).toThrow(ErrorParametros);
  });

  test('las operaciones conservan los vectores originales', () => {
    const primero = Object.freeze([1, 2, 3]);
    const segundo = Object.freeze([4, 5, 6]);

    sumaVectores(primero, segundo);
    restaVectores(primero, segundo);
    productoPunto(primero, segundo);
    productoCruz(primero, segundo);
    magnitudVector(primero);
    normalizarVector(primero);

    expect(primero).toEqual([1, 2, 3]);
    expect(segundo).toEqual([4, 5, 6]);
  });
});

const operaciones = [
  { nombre: 'suma', ejecutar: (vector) => sumaVectores(vector, [1, 2, 3]) },
  { nombre: 'resta', ejecutar: (vector) => restaVectores(vector, [1, 2, 3]) },
  { nombre: 'producto punto', ejecutar: (vector) => productoPunto(vector, [1, 2, 3]) },
  { nombre: 'producto cruz', ejecutar: (vector) => productoCruz(vector, [1, 2, 3]) },
  { nombre: 'magnitud', ejecutar: magnitudVector },
  { nombre: 'normalización', ejecutar: normalizarVector },
];

describe.each(operaciones)('Validación de $nombre', ({ ejecutar }) => {
  test.each([
    { caso: 'un vector vacío', vector: [] },
    { caso: 'una componente NaN', vector: [1, NaN] },
    { caso: 'una componente infinita', vector: [1, Infinity] },
    { caso: 'una componente de texto', vector: [1, '2'] },
  ])('rechaza $caso', ({ vector }) => {
    expect(() => ejecutar(vector)).toThrow(ErrorParametros);
  });

  test('rechaza una entrada que no es un arreglo', () => {
    expect(() => ejecutar(null)).toThrow(ErrorParametros);
  });
});

test.each([
  { nombre: 'suma', ejecutar: sumaVectores },
  { nombre: 'resta', ejecutar: restaVectores },
  { nombre: 'producto punto', ejecutar: productoPunto },
  { nombre: 'producto cruz', ejecutar: productoCruz },
])('$nombre valida también las componentes del segundo vector', ({ ejecutar }) => {
  expect(() => ejecutar([1, 2, 3], [1, NaN, 3])).toThrow(ErrorParametros);
});

// ============================================================
// Casos agregados para el issue #1590
// Tolerancias, tamaños de paso, órdenes de convergencia,
// errores relativos y detección de no convergencia / divergencia.
// ============================================================

import {
  escalarPorVector,
  distanciaEuclidiana,
  anguloEntreVectores,
} from '../../../src/utils/algebra_vectores.js';

// Error relativo entre un valor obtenido y el esperado
const errorRelativo = (obtenido, esperado) => Math.abs(obtenido / esperado - 1);

describe('tolerancias y errores relativos', () => {
  test('el vector normalizado tiene magnitud 1 dentro de tolerancia', () => {
    const vectores = [[3, 4], [1, 1, 1], [0.1, 0.2, 0.3], [-5, 12], [1e-3, 2e-3]];

    for (const v of vectores) {
      expect(magnitudVector(normalizarVector(v))).toBeCloseTo(1, 15);
    }
  });

  test('se cumple la identidad de Lagrange para el producto cruz', () => {
    const a = [1.5, -2, 3];
    const b = [0.5, 4, -1];

    // |a x b|^2 + (a . b)^2 = |a|^2 |b|^2
    const izquierda = magnitudVector(productoCruz(a, b)) ** 2 + productoPunto(a, b) ** 2;
    const derecha = magnitudVector(a) ** 2 * magnitudVector(b) ** 2;

    expect(izquierda).toBeCloseTo(derecha, 10);
    expect(errorRelativo(izquierda, derecha)).toBeLessThan(1e-14);
  });

  test('el producto cruz es ortogonal a ambos factores dentro de tolerancia', () => {
    const a = [1.5, -2, 3];
    const b = [0.5, 4, -1];
    const cruz = productoCruz(a, b);

    expect(productoPunto(cruz, a)).toBeCloseTo(0, 10);
    expect(productoPunto(cruz, b)).toBeCloseTo(0, 10);
  });

  test('se cumple la ley del paralelogramo dentro de tolerancia', () => {
    const u = [1.1, 2.2, 3.3];
    const w = [0.4, -0.5, 0.6];

    // |u+w|^2 + |u-w|^2 = 2(|u|^2 + |w|^2)
    const izquierda =
      magnitudVector(sumaVectores(u, w)) ** 2 + magnitudVector(restaVectores(u, w)) ** 2;
    const derecha = 2 * (magnitudVector(u) ** 2 + magnitudVector(w) ** 2);

    expect(izquierda).toBeCloseTo(derecha, 10);
  });

  test('se cumple la desigualdad de Cauchy-Schwarz', () => {
    const pares = [
      [[1, 2, 3], [4, 5, 6]],
      [[0.1, 0.2], [0.3, 0.4]],
      [[-2, 7], [7, 2]],
    ];

    for (const [a, b] of pares) {
      const cota = magnitudVector(a) * magnitudVector(b);
      expect(Math.abs(productoPunto(a, b))).toBeLessThan(cota * (1 + 1e-12));
    }
  });

  test('la distancia euclidiana coincide con la norma de la diferencia', () => {
    expect(distanciaEuclidiana([1, 2], [4, 6])).toBe(5);
    expect(distanciaEuclidiana([0, 0, 0], [1, 2, 2])).toBe(3);

    const a = [1.25, -3.5, 2];
    const b = [0.75, 1.5, -4];
    expect(distanciaEuclidiana(a, b)).toBeCloseTo(magnitudVector(restaVectores(a, b)), 15);
  });

  test('el angulo entre vectores conocidos cae dentro de tolerancia', () => {
    expect(anguloEntreVectores([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2, 15);
    expect(anguloEntreVectores([1, 0], [-1, 0])).toBeCloseTo(Math.PI, 15);
    expect(anguloEntreVectores([1, 0], [1, 1])).toBeCloseTo(Math.PI / 4, 15);
  });

  test('el angulo entre vectores paralelos pierde precision cerca de cero', () => {
    // acos es muy sensible cuando el coseno se acerca a 1: el resultado no llega a 1e-15
    expect(anguloEntreVectores([1, 1], [1, 1])).toBeLessThan(1e-7);
    expect(anguloEntreVectores([1, 2, 3], [2, 4, 6])).toBeLessThan(1e-7);
  });
});

describe('tamanos de paso en la perturbacion de un vector', () => {
  const u = [1.1, 2.2, 3.3];
  const w = [0.4, -0.5, 0.6];

  test('la distancia a la perturbacion vale h veces la norma del incremento', () => {
    const casos = [
      [1e-1, 1e-14],
      [1e-2, 1e-13],
      [1e-3, 1e-12],
      [1e-4, 1e-11],
      [1e-6, 1e-9],
      [1e-8, 1e-7],
    ];

    for (const [h, tolerancia] of casos) {
      const perturbado = sumaVectores(u, escalarPorVector(h, w));
      const esperado = h * magnitudVector(w);

      expect(errorRelativo(distanciaEuclidiana(perturbado, u), esperado)).toBeLessThan(tolerancia);
    }
  });

  test('el error relativo empeora al achicar demasiado el paso', () => {
    const errorPara = (h) => {
      const perturbado = sumaVectores(u, escalarPorVector(h, w));
      return errorRelativo(distanciaEuclidiana(perturbado, u), h * magnitudVector(w));
    };

    // Cancelacion catastrofica: restar vectores casi iguales pierde cifras significativas
    expect(errorPara(1e-1)).toBeLessThan(errorPara(1e-12));
    expect(errorPara(1e-12)).toBeGreaterThan(1e-7);
  });

  test('el angulo con la perturbacion decrece con el paso hasta colapsar a cero', () => {
    const angulo = (h) => anguloEntreVectores(u, sumaVectores(u, escalarPorVector(h, w)));
    const angulos = [1e-1, 1e-2, 1e-3, 1e-4].map(angulo);

    for (let i = 1; i < angulos.length; i += 1) {
      expect(angulos[i]).toBeLessThan(angulos[i - 1]);
    }
    // Por debajo de cierto paso la perturbacion ya no se distingue en punto flotante
    expect(angulo(1e-8)).toBe(0);
    expect(angulo(1e-10)).toBe(0);
  });

  test('la normalizacion es invariante a la escala del vector', () => {
    const v = [3, 4];
    const referencia = normalizarVector(v);

    for (const h of [1e-5, 1e-2, 1, 1e2, 1e5]) {
      const escalado = normalizarVector(escalarPorVector(h, v));

      expect(escalado[0]).toBeCloseTo(referencia[0], 15);
      expect(escalado[1]).toBeCloseTo(referencia[1], 15);
    }
  });
});

describe('orden de convergencia', () => {
  test('la iteracion de punto fijo converge linealmente con razon 2', () => {
    const b = [1, 2, 3];
    let x = [0, 0, 0];
    const errores = [];

    // x_{n+1} = 0.5 (x_n + b) tiene punto fijo x = b
    for (let n = 0; n < 10; n += 1) {
      x = escalarPorVector(0.5, sumaVectores(x, b));
      errores.push(distanciaEuclidiana(x, b));
    }

    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
      expect(errores[i - 1] / errores[i]).toBeCloseTo(2, 10);
    }
    expect(errores[errores.length - 1]).toBeLessThan(1e-2);
  });

  test('los iterados mantienen la direccion del punto fijo', () => {
    const b = [1, 2, 3];
    let x = [0, 0, 0];

    for (let n = 0; n < 5; n += 1) {
      x = escalarPorVector(0.5, sumaVectores(x, b));
      expect(anguloEntreVectores(x, b)).toBeLessThan(1e-7);
    }
  });

  test('la serie geometrica vectorial converge a 2v con razon lineal', () => {
    const v = [1, 2];
    let suma = [0, 0];
    const errores = [];

    // sum_{k>=0} (1/2)^k v = 2v
    for (let n = 0; n <= 8; n += 1) {
      suma = sumaVectores(suma, escalarPorVector(0.5 ** n, v));
      errores.push(distanciaEuclidiana(suma, escalarPorVector(2, v)));
    }

    for (let i = 1; i < errores.length; i += 1) {
      expect(errores[i - 1] / errores[i]).toBeCloseTo(2, 10);
    }
    expect(errores[errores.length - 1]).toBeLessThan(1e-2);
  });

  test('una contraccion lleva la magnitud a cero de forma monotona', () => {
    let v = [3, 4];
    const magnitudes = [];

    for (let n = 0; n < 40; n += 1) {
      v = escalarPorVector(0.5, v);
      magnitudes.push(magnitudVector(v));
    }

    for (let i = 1; i < magnitudes.length; i += 1) {
      expect(magnitudes[i]).toBeLessThan(magnitudes[i - 1]);
    }
    expect(magnitudes[magnitudes.length - 1]).toBeLessThan(1e-11);
  });
});

describe('deteccion de no convergencia y divergencia', () => {
  test('detecta el subdesbordamiento al normalizar un vector diminuto', () => {
    // |v|^2 cae por debajo del minimo representable y la magnitud se vuelve 0
    expect(magnitudVector([1e-200, 1e-200])).toBe(0);
    expect(() => normalizarVector([1e-200, 1e-200])).toThrow(/no se puede normalizar el vector cero/);
  });

  test('la magnitud se desborda a infinito con componentes enormes', () => {
    const magnitud = magnitudVector([1e200, 1e200]);

    expect(Number.isFinite(magnitud)).toBe(false);
    expect(productoPunto([1e200, 1e200], [1e200, 1e200])).toBe(Infinity);
  });

  test('una iteracion divergente es rechazada al desbordarse', () => {
    let v = [1e300, 0];
    let paso = 0;

    expect(() => {
      for (paso = 1; paso <= 40; paso += 1) {
        v = escalarPorVector(2, v);
      }
    }).toThrow(/solo debe contener números finitos/);

    // El desbordamiento aparece antes de agotar las 40 duplicaciones
    expect(paso).toBeLessThan(40);
  });

  test('la suma repetida de un vector enorme tambien diverge', () => {
    let v = [1e308, 0];

    expect(() => {
      for (let n = 0; n < 5; n += 1) {
        v = sumaVectores(v, v);
      }
    }).toThrow(/solo debe contener números finitos/);
  });

  test('rechaza el angulo cuando alguno de los vectores es nulo', () => {
    expect(() => anguloEntreVectores([0, 0], [1, 1])).toThrow(/magnitud cero/);
    expect(() => anguloEntreVectores([1, 1], [0, 0])).toThrow(/magnitud cero/);
  });

  test('rechaza componentes no finitas en las operaciones agregadas', () => {
    const noFinitos = [[1, NaN], [1, Infinity], [1, -Infinity]];

    for (const v of noFinitos) {
      expect(() => escalarPorVector(2, v)).toThrow(/solo debe contener números finitos/);
      expect(() => distanciaEuclidiana(v, [1, 2])).toThrow(/solo debe contener números finitos/);
      expect(() => anguloEntreVectores(v, [1, 2])).toThrow(/solo debe contener números finitos/);
    }
  });

  test('rechaza un escalar no finito y dimensiones distintas', () => {
    expect(() => escalarPorVector(Infinity, [1, 2])).toThrow(/debe ser un número finito/);
    expect(() => escalarPorVector(NaN, [1, 2])).toThrow(/debe ser un número finito/);
    expect(() => distanciaEuclidiana([1, 2], [1, 2, 3])).toThrow(/misma dimensión/);
    expect(() => anguloEntreVectores([1, 2], [1, 2, 3])).toThrow(/misma dimensión/);
  });
});
