/**
 * @fileoverview Implementación de la regla del trapecio para integración numérica.
 * Aproxima la integral definida de una función dividiendo el intervalo [a, b]
 * en n subintervalos iguales y sumando el área de los trapecios formados.
 */

import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarFuncion, validarIntervalo } from "../utils/validaciones.js";

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
 * @param {Function} params.f - Función a integrar.
 * @param {number} params.a - Extremo inferior del intervalo.
 * @param {number} params.b - Extremo superior del intervalo.
 * @param {number} [params.n=100] - Número de subintervalos (entero >= 1).
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si n no es un entero mayor o igual a 1.
 *
 * @example
 * const res = trapecio({ f: x => x ** 2, a: 0, b: 1, n: 100 });
 * console.log(res.resultado); // ≈ 0.3333
 */
function trapecio({ f, a, b, n = 100 }) {
  // ── 1. VALIDACIONES ─────────────────────────────────────────
  validarFuncion(f, "f");

  if (!Number.isInteger(n) || n < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.trapecio: n debe ser un entero mayor o igual a 1. Se recibió: ${n}`
    );
  }

  // Límites iguales: la integral es 0
  if (a === b) {
    return crearResultado({
      resultado: 0,
      iteraciones: [],
      convergio: true,
      mensaje: "Los límites de integración coinciden; la integral es 0.",
      meta: {
        metodo: "trapecio",
        parametros: { f, a, b, n },
        tiempo_ms: 0,
      },
    });
  }

  // Límite inferior mayor: se calcula en [b, a] y se invierte el signo
  const invertido = b < a;
  const inferior = invertido ? b : a;
  const superior = invertido ? a : b;

  validarIntervalo(inferior, superior);

  // ── 2. CÁLCULO (medido con medirTiempo) ─────────────────────
  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (superior - inferior) / n;
    const iteraciones = [];
    let resultado = 0;

    const fx0 = f(inferior);
    const fxn = f(superior);

    for (let i = 1; i <= n; i++) {
      const xi = inferior + i * h;
      const fxi = i === n ? fxn : f(xi);
      const fxiAnterior = i === 1 ? fx0 : iteraciones[i - 2].fxi;

      const area = (h / 2) * (fxiAnterior + fxi);

      iteraciones.push({ i, xi, fxi, area });
      resultado += area;
    }

    return { resultado, iteraciones };
  });

  // ── 3. RETORNO ──────────────────────────────────────────────
  return crearResultado({
    resultado: invertido ? -valor.resultado : valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Integración por regla del trapecio con ${n} subintervalos.`,
    meta: {
      metodo: "trapecio",
      parametros: { f, a, b, n },
      tiempo_ms,
    },
  });
}

export { trapecio };