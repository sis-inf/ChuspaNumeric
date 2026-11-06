/**
 * @fileoverview Implementación de la regla del trapecio para integración numérica.
 * Aproxima la integral definida de una función dividiendo el intervalo [a, b]
 * en n subintervalos iguales y sumando el área de los trapecios formados.
 */

import { crearResultado, medirTiempo } from "../core/contrato.js";
import { validarFuncion, validarIntervalo } from "../utils/validaciones.js";

/**
 * Calcula la integral definida de una función usando la regla del trapecio compuesta.
 *
 * Fórmula:
 * I ≈ (h / 2) · (f(x₀) + 2 · Σᵢ₌₁ⁿ⁻¹ f(xᵢ) + f(xₙ))
 * donde h = (b − a) / n
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {Function} params.f - Función a integrar.
 * @param {number} params.a - Extremo inferior del intervalo.
 * @param {number} params.b - Extremo superior del intervalo.
 * @param {number} [params.n=100] - Número de subintervalos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {Error} Si los parámetros no son válidos.
 *
 * @example
 * const res = trapecio({ f: x => x ** 2, a: 0, b: 1, n: 100 });
 * console.log(res.resultado); // ≈ 0.3333
 */
function trapecio({ f, a, b, n = 100 }) {
  // ── 1. VALIDACIONES ─────────────────────────────────────────
  validarFuncion(f, "f");
  validarIntervalo(a, b);

  if (!Number.isInteger(n) || n <= 0) {
    throw new Error(
      `ChuspaNumeric.trapecio: n debe ser un entero positivo. Se recibió: ${n}`
    );
  }

  // ── 2. CÁLCULO (medido con medirTiempo) ─────────────────────
  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (b - a) / n;
    const iteraciones = [];
    let resultado = 0;

    // Evaluar extremos una sola vez
    const fx0 = f(a);
    const fxn = f(b);

    // Recorremos cada subintervalo [x_{i-1}, x_i]
    for (let i = 1; i <= n; i++) {
      const xi = a + i * h;
      const fxi = i === n ? fxn : f(xi);
      const fxiAnterior = i === 1 ? fx0 : iteraciones[i - 2].fxi;

      // Área del trapecio del subintervalo [x_{i-1}, x_i]
      const area = (h / 2) * (fxiAnterior + fxi);

      iteraciones.push({ i, xi, fxi, area });
      resultado += area;
    }

    return { resultado, iteraciones };
  });

  // ── 3. RETORNAR usando el contrato de ChuspaNumeric ─────────────────
  return crearResultado({
    resultado: valor.resultado,
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