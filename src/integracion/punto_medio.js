/**
 * @fileoverview Implementación de la regla compuesta del punto medio.
 * Aproxima la integral definida dividiendo el intervalo en n subintervalos
 * iguales y sumando el área de los rectángulos de altura f(punto medio).
 */

import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorDominio, ErrorDivergencia } from '../core/errores.js';

const METODO = 'puntoMedio';
const PREFIJO = `ChuspaNumeric.${METODO}:`;

/**
 * Verifica que los parámetros sean un objeto no nulo y no arreglo.
 * @param {*} params
 * @throws {ErrorParametros}
 */
function validarObjetoOpciones(params) {
  if (typeof params !== 'object' || params === null || Array.isArray(params)) {
    throw new ErrorParametros(
      `${PREFIJO} los parámetros deben ser un objeto { f, a, b, n }. Se recibió: ${
        Array.isArray(params) ? 'arreglo' : String(params)
      }.`
    );
  }
}

/**
 * @param {*} f
 * @throws {ErrorParametros}
 */
function validarFuncionLocal(f) {
  if (typeof f !== 'function') {
    throw new ErrorParametros(
      `${PREFIJO} 'f' debe ser una función. Se recibió: ${typeof f}.`
    );
  }
}

/**
 * @param {*} valor
 * @param {string} nombre
 * @throws {ErrorParametros}
 */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `${PREFIJO} '${nombre}' debe ser un número finito. Se recibió: ${String(valor)}.`
    );
  }
}

/**
 * Valida los límites. No se exige a < b: a > b es válido (integral negativa).
 * @param {*} a
 * @param {*} b
 * @throws {ErrorParametros}
 */
function validarLimites(a, b) {
  validarNumeroFinito(a, 'a');
  validarNumeroFinito(b, 'b');
  if (a === b) {
    throw new ErrorParametros(
      `${PREFIJO} los límites 'a' y 'b' deben ser distintos. Se recibió: ${a}.`
    );
  }
}

/**
 * @param {*} n
 * @throws {ErrorParametros}
 */
function validarSubintervalos(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new ErrorParametros(
      `${PREFIJO} 'n' debe ser un entero positivo. Se recibió: ${String(n)}.`
    );
  }
}

/**
 * Evalúa f en x y verifica que el resultado sea un número finito.
 * @param {Function} f
 * @param {number} x
 * @returns {number}
 * @throws {ErrorDominio}
 */
function evaluar(f, x) {
  const fx = f(x);
  if (typeof fx !== 'number' || !Number.isFinite(fx)) {
    throw new ErrorDominio(
      `${PREFIJO} evaluación inválida en x=${x}. Se recibió: ${String(fx)}.`
    );
  }
  return fx;
}

/**
 * Verifica que un valor calculado sea finito (detecta desbordamiento numérico).
 * @param {number} valor
 * @param {string} descripcion - Qué se estaba calculando.
 * @throws {ErrorDivergencia}
 */
function verificarFinito(valor, descripcion) {
  if (!Number.isFinite(valor)) {
    throw new ErrorDivergencia(
      `${PREFIJO} desbordamiento numérico: ${descripcion} no es finito. Se obtuvo: ${String(valor)}.`
    );
  }
}

/**
 * Verifica la finitud del resultado y arma el objeto del contrato.
 * No mide tiempo: recibe `tiempo_ms` ya medido.
 * @param {Object} datos
 * @returns {Object}
 * @throws {ErrorDivergencia}
 */
function finalizar({ resultado, iteraciones, a, b, n, tiempo_ms }) {
  verificarFinito(resultado, 'el resultado de la integral');
  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Integración por regla del punto medio con ${n} subintervalos.`,
    meta: {
      metodo: METODO,
      parametros: { a, b, n },
      tiempo_ms,
    },
  });
}

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
 * @returns {Object} Resultado del contrato de ChuspaNumeric. `iteraciones` es un
 *   arreglo con un registro por subintervalo: `{ i, xi, fxi, area }`.
 * @throws {ErrorParametros} Si los parámetros no son válidos.
 * @throws {ErrorDominio} Si f devuelve un valor no numérico o no finito.
 * @throws {ErrorDivergencia} Si el cálculo desborda (área o resultado no finitos).
 *
 * @example
 * const res = puntoMedio({ f: x => x ** 2, a: 0, b: 1, n: 100 });
 * console.log(res.resultado); // ≈ 0.3333
 */
function puntoMedio(params) {
  validarObjetoOpciones(params);
  const { f, a, b, n = 100 } = params;
  validarFuncionLocal(f);
  validarLimites(a, b);
  validarSubintervalos(n);

  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (b - a) / n;
    const iteraciones = [];
    let resultado = 0;
    for (let i = 1; i <= n; i++) {
      const xi = a + (i - 0.5) * h;
      const fxi = evaluar(f, xi);
      const area = h * fxi;
      verificarFinito(area, `el área del subintervalo ${i} (x=${xi})`);
      iteraciones.push({ i, xi, fxi, area });
      resultado += area;
    }
    return { resultado, iteraciones };
  });

  return finalizar({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    a,
    b,
    n,
    tiempo_ms,
  });
}

export { puntoMedio };
