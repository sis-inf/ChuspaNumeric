/**
 * @fileoverview Implementación de la regla compuesta del punto medio.
 * Aproxima la integral definida dividiendo el intervalo en n subintervalos
 * iguales y sumando el área de los rectángulos de altura f(punto medio).
 */

import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion } from '../utils/validaciones.js';

/**
 * Calcula la integral definida de una función con la regla compuesta del punto medio.
 *
 * Fórmula:
 * I ≈ h · Σᵢ₌₁ⁿ f(a + (i − 1/2) · h)
 * donde h = (b − a) / n
 *
 * Si a > b, h es negativo y el resultado cambia de signo.
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {Function} params.f - Función a integrar.
 * @param {number} params.a - Límite de integración inicial.
 * @param {number} params.b - Límite de integración final (distinto de a).
 * @param {number} [params.n=100] - Número de subintervalos.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 *
 * @example
 * const res = puntoMedio({ f: x => x ** 2, a: 0, b: 1, n: 100 });
 * console.log(res.resultado); // ≈ 0.3333
 */
function puntoMedio({ f, a, b, n = 100 }) {
  validarFuncion(f, 'f');

  // No se usa validarIntervalo porque rechaza a > b, y aquí es válido.
  for (const [nombre, valor] of Object.entries({ a, b })) {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      throw new ErrorParametros(
        `ChuspaNumeric.puntoMedio: '${nombre}' debe ser un número finito. Se recibió: ${valor}.`
      );
    }
  }

  if (a === b) {
    throw new ErrorParametros(
      `ChuspaNumeric.puntoMedio: los límites 'a' y 'b' deben ser distintos. Se recibió: ${a}.`
    );
  }

  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.puntoMedio: 'n' debe ser un entero positivo. Se recibió: ${n}.`
    );
  }

  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (b - a) / n;
    const iteraciones = [];
    let resultado = 0;
    for (let i = 1; i <= n; i++) {
      const xi = a + (i - 0.5) * h;
      const fxi = f(xi);

      if (typeof fxi !== 'number' || !Number.isFinite(fxi)) {
        throw new ErrorParametros(`ChuspaNumeric.puntoMedio: evaluación inválida en x=${xi}. Se recibió: ${String(fxi)}.`);
      }
      const area = h * fxi;
      iteraciones.push({ i, xi, fxi, area });
      resultado += area;
    }
    return { resultado, iteraciones };
  });

  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Integración por regla del punto medio con ${n} subintervalos.`,
    meta: {
      metodo: 'puntoMedio',
      parametros: { f, a, b, n },
      tiempo_ms,
    },
  });
}

export { puntoMedio };
