/**
 * @file regresion_no_lineal.js
 * @description Regresión no lineal por mínimos cuadrados mediante el método
 * iterativo de Gauss-Newton.
 *
 * A diferencia de regresionLineal y regresionPolinomial (que solo cubren modelos
 * lineales en los parámetros), este método ajusta cualquier modelo no lineal
 * de la forma y = modelo(x, θ) donde θ es el vector de parámetros a estimar.
 *
 * El paso de actualización de parámetros en cada iteración resuelve el sistema
 * lineal J^T·J·Δθ = J^T·r usando `gauss` del módulo lineales/, en cumplimiento
 * con el criterio de reutilización de métodos existentes del proyecto.
 */

import { crearResultado } from '../core/contrato.js';
import { ErrorParametros, ErrorDominio } from '../core/errores.js';
import { gauss } from '../lineales/gauss.js';

/**
 * Ajusta un modelo no lineal a datos mediante el método de Gauss-Newton.
 *
 * El método resuelve el problema de mínimos cuadrados no lineales:
 *   min_θ Σ [yi - modelo(xi, θ)]²
 *
 * En cada iteración k:
 *  1. Calcula el residuo r = y - f(x, θ_k)
 *  2. Construye el Jacobiano J (matriz de derivadas parciales)
 *  3. Resuelve el sistema lineal (J^T·J)·Δθ = J^T·r usando gauss()
 *  4. Actualiza θ_{k+1} = θ_k + Δθ
 *
 * @param {Object}   params
 * @param {number[][]} params.puntos - Array de pares [[x0,y0],[x1,y1],...].
 *   Debe tener al menos tantos puntos como parámetros.
 * @param {Function} params.modelo - Función (x, parametros) → y predicho.
 *   Recibe el valor escalar x y el array de parámetros actuales, devuelve el
 *   valor predicho del modelo en x.
 * @param {Function} params.jacobianoModelo - Función (x, parametros) → número[].
 *   Recibe el valor escalar x y el array de parámetros actuales; devuelve el
 *   array de derivadas parciales [∂f/∂θ₀, ∂f/∂θ₁, ...] evaluadas en (x, θ).
 * @param {number[]} params.parametrosIniciales - Estimación inicial del vector
 *   de parámetros θ₀. Su longitud determina el número de parámetros a ajustar.
 * @param {number}   [params.tolerancia=1e-6] - Criterio de parada: el método
 *   converge cuando la norma euclideana de Δθ cae por debajo de este valor.
 * @param {number}   [params.maxIter=100] - Número máximo de iteraciones.
 *
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric:
 *   - `resultado`: array de parámetros ajustados θ*, o null si no convergió.
 *   - `iteraciones`: historial con { n, parametros, normaResiduo, normaDelta } por paso.
 *   - `convergio`: true si la norma de Δθ cayó por debajo de tolerancia.
 *   - `mensaje`: descripción del resultado.
 *   - `meta.metodo`: 'gauss-newton'.
 *
 * @throws {ErrorParametros} Si los datos de entrada son inválidos.
 * @throws {ErrorDominio} Si el sistema J^T·J es singular (Jacobiano rank-deficiente).
 *
 * @example
 * // Ajustar y = a·e^(b·x) a datos de crecimiento exponencial
 * import { regresionNoLineal } from 'chuspanumeric/src/analisis/regresion_no_lineal.js';
 *
 * const puntos = [[0,2.1],[1,4.9],[2,10.8],[3,22.1],[4,47.3]];
 *
 * const modelo = (x, [a, b]) => a * Math.exp(b * x);
 * const jacobiano = (x, [a, b]) => [
 *   Math.exp(b * x),       // ∂f/∂a
 *   a * x * Math.exp(b * x), // ∂f/∂b
 * ];
 *
 * const resultado = regresionNoLineal({
 *   puntos,
 *   modelo,
 *   jacobianoModelo: jacobiano,
 *   parametrosIniciales: [1, 1],
 *   tolerancia: 1e-8,
 * });
 *
 * console.log(resultado.resultado); // [~2.0, ~0.776]
 * console.log(resultado.convergio); // true
 */
export function regresionNoLineal({
  puntos,
  modelo,
  jacobianoModelo,
  parametrosIniciales,
  tolerancia = 1e-6,
  maxIter = 100,
}) {
  // --- Validación de parámetros ---
  if (!Array.isArray(puntos) || puntos.length === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.regresionNoLineal: "puntos" debe ser un array no vacío de pares [x, y].'
    );
  }

  if (typeof modelo !== 'function') {
    throw new ErrorParametros(
      'ChuspaNumeric.regresionNoLineal: "modelo" debe ser una función (x, parametros) => y.'
    );
  }

  if (typeof jacobianoModelo !== 'function') {
    throw new ErrorParametros(
      'ChuspaNumeric.regresionNoLineal: "jacobianoModelo" debe ser una función (x, parametros) => number[].'
    );
  }

  if (!Array.isArray(parametrosIniciales) || parametrosIniciales.length === 0) {
    throw new ErrorParametros(
      'ChuspaNumeric.regresionNoLineal: "parametrosIniciales" debe ser un array no vacío.'
    );
  }

  const m = puntos.length;        // número de observaciones
  const p = parametrosIniciales.length; // número de parámetros

  if (m < p) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionNoLineal: se necesitan al menos ${p} puntos para ajustar ${p} parámetros. ` +
      `Se recibió: ${m}.`
    );
  }

  if (typeof tolerancia !== 'number' || tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionNoLineal: "tolerancia" debe ser un número positivo. Se recibió: ${tolerancia}.`
    );
  }

  if (!Number.isInteger(maxIter) || maxIter < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionNoLineal: "maxIter" debe ser un entero positivo. Se recibió: ${maxIter}.`
    );
  }

  // --- Algoritmo de Gauss-Newton ---
  let theta = [...parametrosIniciales]; // copia del vector de parámetros actual
  const iteraciones = [];
  const inicio = performance.now();

  for (let iter = 1; iter <= maxIter; iter++) {

    // 1. Calcular el vector de residuos r (m × 1)
    //    r_i = y_i - modelo(x_i, theta)
    const r = puntos.map(([xi, yi]) => yi - modelo(xi, theta));

    // 2. Construir el Jacobiano J (m × p)
    //    J_ij = ∂modelo(x_i, theta) / ∂theta_j
    const J = puntos.map(([xi]) => jacobianoModelo(xi, theta));

    // 3. Calcular la norma del residuo actual (para el historial)
    const normaResiduo = Math.sqrt(r.reduce((acc, ri) => acc + ri * ri, 0));

    // 4. Construir las ecuaciones normales: A = J^T·J (p × p), b_vec = J^T·r (p × 1)
    //    Reutilizamos gauss() del módulo lineales/ para resolver A·Δθ = b_vec
    const A = Array.from({ length: p }, (_, i) =>
      Array.from({ length: p }, (_, j) =>
        J.reduce((acc, Ji) => acc + Ji[i] * Ji[j], 0)
      )
    );

    const b_vec = Array.from({ length: p }, (_, i) =>
      J.reduce((acc, Ji, k) => acc + Ji[i] * r[k], 0)
    );

    // 5. Resolver el sistema lineal usando gauss() de src/lineales/gauss.js
    let resGauss;
    try {
      resGauss = gauss({ A, b: b_vec });
    } catch (e) {
      throw new ErrorDominio(
        `ChuspaNumeric.regresionNoLineal: el sistema de ecuaciones normales J^T·J es singular ` +
        `en la iteración ${iter}. El Jacobiano puede ser rank-deficiente para los ` +
        `parámetros actuales θ = [${theta.map(v => v.toFixed(6)).join(', ')}]. ` +
        `Causa: ${e.message}`
      );
    }

    const delta = resGauss.resultado;

    // 6. Actualizar los parámetros: θ_{k+1} = θ_k + Δθ
    const normaDelta = Math.sqrt(delta.reduce((acc, d) => acc + d * d, 0));
    theta = theta.map((t, i) => t + delta[i]);

    // 7. Registrar la iteración
    iteraciones.push({
      n: iter,
      parametros: [...theta],
      normaResiduo,
      normaDelta,
    });

    // 8. Criterio de convergencia: ||Δθ|| < tolerancia
    if (normaDelta < tolerancia) {
      const tiempo_ms = performance.now() - inicio;
      return crearResultado({
        resultado: theta,
        iteraciones,
        convergio: true,
        mensaje: `Gauss-Newton convergió en ${iter} iteración(es). ||Δθ|| = ${normaDelta.toExponential(3)}.`,
        meta: {
          metodo: 'gauss-newton',
          parametros: { m, p, tolerancia, maxIter },
          tiempo_ms,
        },
      });
    }
  }

  // No convergió dentro del límite de iteraciones
  const tiempo_ms = performance.now() - inicio;
  return crearResultado({
    resultado: null,
    iteraciones,
    convergio: false,
    mensaje: `Gauss-Newton no convergió en ${maxIter} iteraciones. Última ||Δθ|| = ` +
      `${iteraciones.at(-1).normaDelta.toExponential(3)}. ` +
      `Intente con mejores parámetros iniciales o aumente maxIter.`,
    meta: {
      metodo: 'gauss-newton',
      parametros: { m, p, tolerancia, maxIter },
      tiempo_ms,
    },
  });
}