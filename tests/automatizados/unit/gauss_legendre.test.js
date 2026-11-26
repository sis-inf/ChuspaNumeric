import gaussLegendre from '../../../src/integracion/gauss_legendre.js';
import {
  ErrorParametros,
  ErrorDominio,
  ErrorDivergencia
} from '../../../src/core/errores.js';

// Helpers
const capturar = (fn) => {
  try {
    fn();
    return null;
  } catch (e) {
    return e;
  }
};

// Integral exacta de x^k en [a, b]
const integralMonomio = (k, a, b) => (b ** (k + 1) - a ** (k + 1)) / (k + 1);

const errorRelativo = (aprox, exacto) => Math.abs(aprox - exacto) / Math.abs(exacto);

// Cuadratura compuesta: m subintervalos iguales con Gauss-Legendre de n puntos
const compuesta = (f, a, b, m, n) => {
  const h = (b - a) / m;
  let total = 0;
  for (let i = 0; i < m; i++) {
    total += gaussLegendre(f, a + i * h, a + (i + 1) * h, n).resultado;
  }
  return total;
};

const PREFIJO = 'ChuspaNumeric.gaussLegendre:';

describe('gaussLegendre - cuadratura de Gauss-Legendre', () => {
  // Propiedad: Gauss-Legendre con n puntos es exacta para polinomios de grado <= 2n-1

  describe('con 2 puntos (exacto para polinomios grado <= 3)', () => {
    test('integra f(x) = x (grado 1) exactamente en [-1, 1]', () => {
      const f = (x) => x;
      const valorExacto = 0; // ∫₋₁¹ x dx = 0
      const { resultado } = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x² (grado 2) exactamente en [-1, 1]', () => {
      const f = (x) => x * x;
      const valorExacto = 2 / 3; // ∫₋₁¹ x² dx = 2/3
      const { resultado } = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x³ (grado 3) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 3;
      const valorExacto = 0; // ∫₋₁¹ x³ dx = 0
      const { resultado } = gaussLegendre(f, -1, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x² en [0, 1] (transformación de intervalo)', () => {
      const f = (x) => x * x;
      const valorExacto = 1 / 3; // ∫₀¹ x² dx = 1/3
      const { resultado } = gaussLegendre(f, 0, 1, 2);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });
  });

  describe('con 3 puntos (exacto para polinomios grado <= 5)', () => {
    test('integra f(x) = x⁴ (grado 4) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 4;
      const valorExacto = 2 / 5; // ∫₋₁¹ x⁴ dx = 2/5
      const { resultado } = gaussLegendre(f, -1, 1, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra f(x) = x⁵ (grado 5) exactamente en [-1, 1]', () => {
      const f = (x) => x ** 5;
      const valorExacto = 0; // ∫₋₁¹ x⁵ dx = 0
      const { resultado } = gaussLegendre(f, -1, 1, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });

    test('integra polinomio mixto en [0, 2]', () => {
      // f(x) = x³ + 2x² + x + 1
      const f = (x) => x ** 3 + 2 * x ** 2 + x + 1;
      // ∫₀² (x³ + 2x² + x + 1) dx = [x⁴/4 + 2x³/3 + x²/2 + x]₀²
      // = 16/4 + 16/3 + 4/2 + 2 = 4 + 5.333... + 2 + 2 = 13.333...
      const valorExacto = 40 / 3;
      const { resultado } = gaussLegendre(f, 0, 2, 3);

      expect(resultado).toBeCloseTo(valorExacto, 14);
    });
  });

  test('puntos inválido lanza error', () => {
    const f = (x) => x * x;

    // 4 y 5 puntos SÍ son válidos en la versión actual; los inválidos son 1 y 6
    for (const puntos of [1, 6]) {
      const error = capturar(() => gaussLegendre(f, 0, 1, puntos));

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error.message).toMatch("'puntos' debe ser 2, 3, 4 o 5");
    }
  });

  test('más puntos dan mejor precisión para polinomios de alto grado', () => {
    // f(x) = x⁶ (grado 6) - fuera del rango de exactitud para 2 y 3 puntos
    const f = (x) => x ** 6;
    const valorExacto = 2 / 7; // ∫₋₁¹ x⁶ dx = 2/7

    const resultado2Puntos = gaussLegendre(f, -1, 1, 2).resultado;
    const resultado3Puntos = gaussLegendre(f, -1, 1, 3).resultado;

    const error2Puntos = Math.abs(resultado2Puntos - valorExacto);
    const error3Puntos = Math.abs(resultado3Puntos - valorExacto);

    // 3 puntos deben ser más precisos que 2 puntos para polinomios de alto grado
    expect(error3Puntos).toBeLessThan(error2Puntos);
  });

  describe('exactitud para 4 y 5 puntos y grado máximo 2n-1', () => {
    // Todos los monomios x^k con k = 0..2n-1 en [-1, 2] (integral exacta no nula)
    const casos = [2, 3, 4, 5].flatMap((n) =>
      Array.from({ length: 2 * n }, (_, k) => [n, k])
    );

    test.each(casos)('con %i puntos integra x^%i en [-1, 2] con error relativo <= 1e-13', (n, k) => {
      // Valor exacto: (2^(k+1) - (-1)^(k+1)) / (k+1)
      const exacto = integralMonomio(k, -1, 2);
      const { resultado } = gaussLegendre((x) => x ** k, -1, 2, n);

      expect(errorRelativo(resultado, exacto)).toBeLessThanOrEqual(1e-13);
    });

    test.each([2, 3, 4, 5])('con %i puntos NO es exacta en grado 2n (error apreciable)', (n) => {
      // ∫₋₁¹ x^(2n) dx = 2/(2n+1); el error de truncamiento es mayor que el redondeo
      // Valores verificados con script: n=2 -> 0.2222, n=3 -> 0.24, n=4 -> 0.2106, n=5 -> 0.1789
      const k = 2 * n;
      const exacto = 2 / (k + 1);
      const { resultado } = gaussLegendre((x) => x ** k, -1, 1, n);

      expect(resultado).toBeLessThan(exacto);
      expect(errorRelativo(resultado, exacto)).toBeGreaterThan(1e-3);
    });

    test('con 2 puntos x⁴ en [-1, 1] da 2/9 (cálculo manual: 2 * (1/√3)⁴ = 2/9)', () => {
      const { resultado } = gaussLegendre((x) => x ** 4, -1, 1, 2);

      expect(resultado).toBeCloseTo(2 / 9, 14);
    });
  });

  describe('estructura del resultado (contrato)', () => {
    test.each([2, 3, 4, 5])('con %i puntos devuelve el contrato completo', (n) => {
      const r = gaussLegendre((x) => x * x, 0, 1, n);

      expect(r.convergio).toBe(true);
      expect(typeof r.resultado).toBe('number');
      expect(r.mensaje).toBe(
        `Integral aproximada con cuadratura de Gauss-Legendre de ${n} puntos`
      );
      expect(r.meta.metodo).toBe('gaussLegendre');
      expect(r.meta.parametros).toEqual({ a: 0, b: 1, puntos: n });
      expect(typeof r.meta.tiempo_ms).toBe('number');
      expect(r.iteraciones).toHaveLength(n);
    });

    test('cada iteración tiene nodo, peso, x, fx y aporte numéricos y coherentes', () => {
      const a = 1;
      const b = 4;
      const f = (x) => x * x;
      const r = gaussLegendre(f, a, b, 5);

      for (const it of r.iteraciones) {
        for (const campo of ['nodo', 'peso', 'x', 'fx', 'aporte']) {
          expect(typeof it[campo]).toBe('number');
          expect(Number.isFinite(it[campo])).toBe(true);
        }
        // x está dentro del intervalo abierto y es la transformación afín del nodo
        expect(it.x).toBeGreaterThan(a);
        expect(it.x).toBeLessThan(b);
        expect(it.x).toBeCloseTo(((b - a) / 2) * it.nodo + (a + b) / 2, 12);
        expect(it.fx).toBeCloseTo(f(it.x), 12);
        expect(it.aporte).toBeCloseTo(it.peso * it.fx, 12);
      }

      // resultado = (b-a)/2 * suma de aportes
      const suma = r.iteraciones.reduce((s, it) => s + it.aporte, 0);
      expect(r.resultado).toBeCloseTo(((b - a) / 2) * suma, 12);
    });

    test.each([2, 3, 4, 5])('con %i puntos los pesos suman 2 y los nodos son simétricos', (n) => {
      const r = gaussLegendre(() => 1, 0, 1, n);
      const sumaPesos = r.iteraciones.reduce((s, it) => s + it.peso, 0);

      expect(sumaPesos).toBeCloseTo(2, 14);
      for (let i = 0; i < n; i++) {
        expect(r.iteraciones[i].nodo).toBeCloseTo(-r.iteraciones[n - 1 - i].nodo, 14);
        expect(r.iteraciones[i].peso).toBeCloseTo(r.iteraciones[n - 1 - i].peso, 14);
      }
    });

    test('evalúa f exactamente "puntos" veces y no depende de llamadas previas', () => {
      let llamadas = 0;
      const f = (x) => {
        llamadas++;
        return x;
      };

      gaussLegendre(f, 0, 1, 4);
      expect(llamadas).toBe(4);

      const r1 = gaussLegendre((x) => x ** 2, 0, 1, 3);
      const r2 = gaussLegendre((x) => x ** 2, 0, 1, 3);
      expect(r1.resultado).toBe(r2.resultado);
    });
  });

  describe('precisión: errores relativos con tolerancias de 1e-2 a 1e-12', () => {
    // ∫₀¹ eˣ dx = e - 1. Errores relativos verificados con script:
    // n=2: 2.24e-4, n=3: 4.80e-7, n=4: 5.43e-10, n=5: 3.80e-13
    const exacto = Math.E - 1;

    test.each([
      [1e-2, 2],
      [1e-4, 3],
      [1e-6, 3],
      [1e-8, 4],
      [1e-10, 5],
      [1e-12, 5]
    ])(
      'para eˣ en [0, 1] con tolerancia %p se alcanza con %i puntos y no con uno menos',
      (tolerancia, nMinimo) => {
        const conMinimo = gaussLegendre(Math.exp, 0, 1, nMinimo).resultado;
        expect(errorRelativo(conMinimo, exacto)).toBeLessThanOrEqual(tolerancia);

        if (nMinimo > 2) {
          const conMenos = gaussLegendre(Math.exp, 0, 1, nMinimo - 1).resultado;
          expect(errorRelativo(conMenos, exacto)).toBeGreaterThan(tolerancia);
        }
      }
    );

    test('para sen(x) en [0, π] las tolerancias 1e-2, 1e-4 y 1e-6 exigen 3, 4 y 5 puntos', () => {
      // Errores relativos verificados: n=2: 3.2e-2, n=3: 6.9e-4, n=4: 7.9e-6, n=5: 5.5e-8
      const casos = [
        [1e-2, 3],
        [1e-4, 4],
        [1e-6, 5]
      ];

      for (const [tolerancia, nMinimo] of casos) {
        const ok = gaussLegendre(Math.sin, 0, Math.PI, nMinimo).resultado;
        const menos = gaussLegendre(Math.sin, 0, Math.PI, nMinimo - 1).resultado;

        expect(errorRelativo(ok, 2)).toBeLessThanOrEqual(tolerancia);
        expect(errorRelativo(menos, 2)).toBeGreaterThan(tolerancia);
      }
    });

    test('tolerancia inalcanzable: sen(x) en [0, π] no llega a 1e-8 con 5 puntos', () => {
      const { resultado, convergio } = gaussLegendre(Math.sin, 0, Math.PI, 5);

      expect(convergio).toBe(true); // el método no es iterativo: siempre "termina"
      expect(errorRelativo(resultado, 2)).toBeGreaterThan(1e-8);
      expect(errorRelativo(resultado, 2)).toBeLessThan(1e-6);
    });

    test('1/(1+x²) en [0, 1] se acerca a π/4 con error relativo < 1e-8 con 5 puntos', () => {
      const f = (x) => 1 / (1 + x * x);
      const { resultado } = gaussLegendre(f, 0, 1, 5);

      expect(errorRelativo(resultado, Math.PI / 4)).toBeLessThan(1e-8);
    });
  });

  describe('orden de convergencia al aumentar los puntos', () => {
    const funciones = [
      ['eˣ en [0, 1]', Math.exp, 0, 1, Math.E - 1],
      ['sen(x) en [0, π]', Math.sin, 0, Math.PI, 2],
      ['1/(1+x²) en [0, 1]', (x) => 1 / (1 + x * x), 0, 1, Math.PI / 4]
    ];

    test.each(funciones)('el error decrece estrictamente de 2 a 5 puntos: %s', (_n, f, a, b, exacto) => {
      const errores = [2, 3, 4, 5].map((n) => Math.abs(gaussLegendre(f, a, b, n).resultado - exacto));

      for (let i = 1; i < errores.length; i++) {
        expect(errores[i]).toBeLessThan(errores[i - 1]);
      }
    });

    test.each(funciones.slice(0, 2))(
      'tasa media de reducción por punto adicional < 0.05 (convergencia rápida): %s',
      (_n, f, a, b, exacto) => {
        // Tasas verificadas: eˣ ≈ 0.0012, sen ≈ 0.012
        const e2 = Math.abs(gaussLegendre(f, a, b, 2).resultado - exacto);
        const e5 = Math.abs(gaussLegendre(f, a, b, 5).resultado - exacto);
        const tasa = (e5 / e2) ** (1 / 3);

        expect(tasa).toBeLessThan(0.05);
      }
    );

    test('función suave converge mucho más rápido que una con raíz en el extremo (√x)', () => {
      // √x en [0, 1] tiene derivada infinita en 0: error de 2 a 5 puntos 7.2e-3 -> 6.3e-4
      const eSuave = Math.abs(gaussLegendre(Math.exp, 0, 1, 5).resultado - (Math.E - 1));
      const e2 = Math.abs(gaussLegendre(Math.sqrt, 0, 1, 2).resultado - 2 / 3);
      const e5 = Math.abs(gaussLegendre(Math.sqrt, 0, 1, 5).resultado - 2 / 3);
      const tasaSqrt = (e5 / e2) ** (1 / 3);

      expect(e5).toBeLessThan(e2);
      expect(tasaSqrt).toBeGreaterThan(0.3);
      expect(e5).toBeGreaterThan(1e-4);
      expect(eSuave).toBeLessThan(1e-10);
    });

    test('el error al subdividir el intervalo baja con orden ≈ 2n (h⁴ para 2 puntos)', () => {
      // Cuadratura compuesta de sen(x) en [0, π] con 2 puntos y m subintervalos
      const errores = [1, 2, 4, 8].map((m) =>
        Math.abs(compuesta(Math.sin, 0, Math.PI, m, 2) - 2)
      );

      for (let i = 1; i < errores.length; i++) {
        expect(errores[i]).toBeLessThan(errores[i - 1]);
        // Al duplicar m, el error cae ≈ 16 veces; se exige al menos 8 como margen
        expect(errores[i - 1] / errores[i]).toBeGreaterThan(8);
      }
    });
  });

  describe('tamaño de paso (longitud del intervalo)', () => {
    test('intervalo muy pequeño [1e-3, 2e-3]: x² con 2 puntos mantiene error relativo <= 1e-13', () => {
      // ∫ x² = (8e-9 - 1e-9)/3
      const exacto = integralMonomio(2, 1e-3, 2e-3);
      const { resultado } = gaussLegendre((x) => x * x, 1e-3, 2e-3, 2);

      expect(errorRelativo(resultado, exacto)).toBeLessThanOrEqual(1e-13);
    });

    test('intervalo muy pequeño: x⁵ con 3 puntos mantiene error relativo <= 1e-13', () => {
      const exacto = integralMonomio(5, 1e-3, 2e-3);
      const { resultado } = gaussLegendre((x) => x ** 5, 1e-3, 2e-3, 3);

      expect(errorRelativo(resultado, exacto)).toBeLessThanOrEqual(1e-13);
    });

    test('intervalo grande [-100, 100]: x² con 2 puntos da 2·10⁶/3', () => {
      const exacto = 2e6 / 3;
      const { resultado } = gaussLegendre((x) => x * x, -100, 100, 2);

      expect(errorRelativo(resultado, exacto)).toBeLessThanOrEqual(1e-13);
    });

    test('intervalo grande simétrico: x³ en [-100, 100] da 0', () => {
      const { resultado } = gaussLegendre((x) => x ** 3, -100, 100, 2);

      expect(resultado).toBeCloseTo(0, 6);
    });

    test('intervalo desplazado lejos del origen [100, 101]: x² con 2 puntos', () => {
      const exacto = integralMonomio(2, 100, 101);
      const { resultado } = gaussLegendre((x) => x * x, 100, 101, 2);

      expect(errorRelativo(resultado, exacto)).toBeLessThanOrEqual(1e-13);
    });

    test('aditividad: ∫[0,3] = ∫[0,1] + ∫[1,3] para un polinomio de grado <= 2n-1', () => {
      const f = (x) => x ** 3 - 2 * x + 1;
      const total = gaussLegendre(f, 0, 3, 2).resultado;
      const partes = gaussLegendre(f, 0, 1, 2).resultado + gaussLegendre(f, 1, 3, 2).resultado;

      expect(partes).toBeCloseTo(total, 12);
    });

    test('a === b da integral 0', () => {
      const { resultado } = gaussLegendre((x) => x * x, 1, 1, 2);

      expect(resultado).toBeCloseTo(0, 14);
    });

    test('intercambiar los límites invierte el signo (∫ᵇₐ = -∫ₐᵇ)', () => {
      const f = (x) => x * x;
      const directo = gaussLegendre(f, 0, 1, 3).resultado;
      const inverso = gaussLegendre(f, 1, 0, 3).resultado;

      expect(inverso).toBeCloseTo(-directo, 14);
      expect(inverso).toBeCloseTo(-1 / 3, 14);
    });

    test('intervalo grande para función oscilante: sen(x) en [0, 100] no es precisa con 5 puntos', () => {
      // Exacto: 1 - cos(100). Errores absolutos verificados: n=2: 21.6, n=3: 19.3, n=4: 0.90, n=5: 6.36
      const exacto = 1 - Math.cos(100);

      for (const n of [2, 3, 4, 5]) {
        const { resultado } = gaussLegendre(Math.sin, 0, 100, n);

        expect(Math.abs(resultado - exacto)).toBeGreaterThan(0.1);
      }
    });
  });

  describe('casos no favorables, divergencia y no convergencia', () => {
    test('integrando casi singular 1/(0.01+x²) en [-1, 1]: error no baja de forma monótona', () => {
      // Exacto: 20·atan(10) ≈ 29.4226. Resultados verificados:
      // n=2: 5.83, n=3: 90.71, n=4: 11.31, n=5: 60.65 (oscila, no converge)
      const f = (x) => 1 / (0.01 + x * x);
      const exacto = 20 * Math.atan(10);
      const errores = [2, 3, 4, 5].map((n) => Math.abs(gaussLegendre(f, -1, 1, n).resultado - exacto));

      expect(errores[1]).toBeGreaterThan(errores[0]);
      expect(errores[3]).toBeGreaterThan(errores[2]);
      expect(errores[3]).toBeGreaterThan(0.5 * exacto);
    });

    test('integral divergente 1/x en [0, 1]: el resultado crece con los puntos sin estabilizarse', () => {
      // Resultados verificados: 3.0, 3.667, 4.167, 4.567 (crecen, la integral real es +∞)
      const resultados = [2, 3, 4, 5].map((n) => gaussLegendre((x) => 1 / x, 0, 1, n).resultado);

      for (let i = 1; i < resultados.length; i++) {
        expect(resultados[i]).toBeGreaterThan(resultados[i - 1]);
      }
      expect(resultados[3] - resultados[2]).toBeGreaterThan(0.3);
    });

    test('1/x en [1e-3, 1] queda lejos de ln(1000) incluso con 5 puntos', () => {
      // Resultados verificados: 2.99, 3.64, 4.13, 4.51 frente a ln(1000) ≈ 6.9078
      const exacto = Math.log(1000);
      const { resultado } = gaussLegendre((x) => 1 / x, 1e-3, 1, 5);

      expect(resultado).toBeLessThan(exacto);
      expect(errorRelativo(resultado, exacto)).toBeGreaterThan(0.3);
    });

    test('f(x) = 1e308 desborda la suma y lanza ErrorDivergencia', () => {
      const error = capturar(() => gaussLegendre(() => 1e308, 0, 1, 2));

      expect(error).toBeInstanceOf(ErrorDivergencia);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(PREFIJO);
      expect(error.message).toMatch('no es finito');
    });

    test('singularidad exactamente en un nodo (1/x en [-1, 1] con 3 puntos) lanza ErrorDominio', () => {
      const error = capturar(() => gaussLegendre((x) => 1 / x, -1, 1, 3));

      expect(error).toBeInstanceOf(ErrorDominio);
      expect(error.message).toMatch(PREFIJO);
      expect(error.message).toMatch('f(0)');
    });
  });

  describe('validación de entradas', () => {
    const f = (x) => x * x;

    test.each([
      ['sin argumentos', () => gaussLegendre(), "'f' debe ser una función"],
      ['f número', () => gaussLegendre(5, 0, 1, 2), "'f' debe ser una función"],
      ['f string', () => gaussLegendre('x', 0, 1, 2), "'f' debe ser una función"],
      ['f null', () => gaussLegendre(null, 0, 1, 2), "'f' debe ser una función"],
      ['a string', () => gaussLegendre(f, '0', 1, 2), "'a' debe ser un número finito"],
      ['a NaN', () => gaussLegendre(f, NaN, 1, 2), "'a' debe ser un número finito"],
      ['a Infinity', () => gaussLegendre(f, -Infinity, 1, 2), "'a' debe ser un número finito"],
      ['a undefined', () => gaussLegendre(f, undefined, 1, 2), "'a' debe ser un número finito"],
      ['b string', () => gaussLegendre(f, 0, '1', 2), "'b' debe ser un número finito"],
      ['b NaN', () => gaussLegendre(f, 0, NaN, 2), "'b' debe ser un número finito"],
      ['b Infinity', () => gaussLegendre(f, 0, Infinity, 2), "'b' debe ser un número finito"],
      ['puntos 0', () => gaussLegendre(f, 0, 1, 0), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos 1', () => gaussLegendre(f, 0, 1, 1), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos 6', () => gaussLegendre(f, 0, 1, 6), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos negativo', () => gaussLegendre(f, 0, 1, -2), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos 2.5', () => gaussLegendre(f, 0, 1, 2.5), "'puntos' debe ser 2, 3, 4 o 5"],
      ["puntos '3'", () => gaussLegendre(f, 0, 1, '3'), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos NaN', () => gaussLegendre(f, 0, 1, NaN), "'puntos' debe ser 2, 3, 4 o 5"],
      ['puntos undefined', () => gaussLegendre(f, 0, 1), "'puntos' debe ser 2, 3, 4 o 5"]
    ])('%s -> ErrorParametros con prefijo y sin TypeError', (_d, llamada, fragmento) => {
      const error = capturar(llamada);

      expect(error).toBeInstanceOf(ErrorParametros);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(PREFIJO);
      expect(error.message).toMatch(fragmento);
    });

    test.each([
      ['NaN', () => NaN, 'NaN'],
      ['Infinity', () => Infinity, 'Infinity'],
      ['-Infinity', () => -Infinity, '-Infinity'],
      ['undefined', () => undefined, 'undefined'],
      ['null', () => null, 'null'],
      ['string', () => '1', '1']
    ])('f devuelve %s -> ErrorDominio con prefijo', (_d, g) => {
      const error = capturar(() => gaussLegendre(g, 0, 1, 3));

      expect(error).toBeInstanceOf(ErrorDominio);
      expect(error).not.toBeInstanceOf(TypeError);
      expect(error.message).toMatch(PREFIJO);
      expect(error.message).toMatch('devolvió un valor no finito o no numérico');
    });

    test('si f lanza un error propio, se propaga sin envolver', () => {
      const error = capturar(() =>
        gaussLegendre(() => {
          throw new Error('boom');
        }, 0, 1, 3)
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(ErrorParametros);
      expect(error.message).toBe('boom');
    });

    test('puntos 4 y 5 son válidos (no lanzan error)', () => {
      expect(capturar(() => gaussLegendre(f, 0, 1, 4))).toBeNull();
      expect(capturar(() => gaussLegendre(f, 0, 1, 5))).toBeNull();
    });
  });
});
