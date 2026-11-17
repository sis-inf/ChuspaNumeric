/**
 * @fileoverview Implementación de la regla del trapecio para integración numérica.
 * Aproxima la integral definida de una función dividiendo el intervalo [a, b]
 * en n subintervalos iguales y sumando el área de los trapecios formados.
 */

import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorNumerico, ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero } from '../utils/validaciones.js';

function verificarValorFinito(valor, descripcion) {
  if (!Number.isFinite(valor)) {
    throw new ErrorNumerico(`ChuspaNumeric.trapecio: ${descripcion} debe ser un número finito.`);
  }
}

/**
 * Calcula la integral definida de una función usando la regla del trapecio compuesta.
 *
 * Fórmula:
 * I ≈ (h / 2) · (f(x₀) + 2 · Σᵢ₌₁ⁿ⁻¹ f(xᵢ) + f(xₙ))
 * donde h = (b − a) / n
 *
 * Casos especiales:
 * - Si a === b, retorna 0.
 * - Si b < a, calcula la integral en [b, a] e invierte el signo.
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {(x: number) => number} params.f - Función a integrar, con valores finitos.
 * @param {number} params.a - Límite de integración inicial, finito.
 * @param {number} params.b - Límite de integración final, finito.
 * @param {number} [params.n=100] - Número de subintervalos (entero >= 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 * @throws {ErrorNumerico} Si una evaluación o un valor del cálculo no es un número finito.
 *
 * @example
 * const res = trapecio({ f: x => x ** 2, a: 0, b: 1, n: 100 });
 * console.log(res.resultado); // ≈ 0.3333
 */
function trapecio(params) {
  if (params === null || typeof params !== 'object' || Array.isArray(params)) {
    throw new ErrorParametros('ChuspaNumeric.trapecio: se requiere un objeto de parámetros.');
  }

  const { f, a, b, n = 100 } = params;
  validarFuncion(f, 'f');

  for (const [nombre, limite] of Object.entries({ a, b })) {
    if (typeof limite !== 'number') {
      throw new ErrorParametros(`ChuspaNumeric.trapecio: '${nombre}' debe ser un número finito.`);
    }
    validarNumero(limite, nombre);
  }

  if (!Number.isInteger(n) || n < 1) {
    throw new ErrorParametros('ChuspaNumeric.trapecio: n debe ser un entero mayor o igual a 1.');
  }

  // Límites iguales: la integral es 0
  if (a === b) {
    return crearResultado({
      resultado: 0,
      iteraciones: [],
      convergio: true,
      mensaje: 'Los límites de integración coinciden; la integral es 0.',
      meta: {
        metodo: 'trapecio',
        parametros: { f, a, b, n },
        tiempo_ms: 0,
      },
    });
  }

  // Límite inferior mayor: se calcula en [b, a] y se invierte el signo
  const invertido = b < a;
  const inferior = invertido ? b : a;
  const superior = invertido ? a : b;

  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (superior - inferior) / n;
    verificarValorFinito(h, 'el paso h');

    const iteraciones = [];
    let resultado = 0;

    const evaluar = (x) => {
      const fx = f(x);
      verificarValorFinito(fx, `f(${x})`);
      return fx;
    };

    const fx0 = evaluar(inferior);
    const fxn = evaluar(superior);

    for (let i = 1; i <= n; i++) {
      const xi = inferior + i * h;
      verificarValorFinito(xi, `el punto x de la iteración ${i}`);
      const fxi = i === n ? fxn : evaluar(xi);
      const fxiAnterior = i === 1 ? fx0 : iteraciones[i - 2].fxi;

      const area = (h / 2) * (fxiAnterior + fxi);
      verificarValorFinito(area, `el área del subintervalo ${i}`);
      resultado += area;
      verificarValorFinito(resultado, `el resultado acumulado en la iteración ${i}`);
      iteraciones.push({ i, xi, fxi, area });
    }

    return { resultado, iteraciones };
  });

  return crearResultado({
    resultado: invertido ? -valor.resultado : valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Integración por regla del trapecio con ${n} subintervalos.`,
    meta: {
      metodo: 'trapecio',
      parametros: { f, a, b, n },
      tiempo_ms,
    },
  });
}

export { trapecio };
