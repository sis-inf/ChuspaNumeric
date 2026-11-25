import { ErrorParametros } from "../core/errores.js";

const METODO_GRADO1 = "diferenciasAdelanteGrado1";
const METODO_ORDEN2 = "derivadaAdelanteOrden2";

/**
 * Describe de forma breve el valor recibido para los mensajes de error.
 * @param {*} valor Valor recibido.
 * @returns {string} Descripción del valor.
 */
function describir(valor) {
  if (typeof valor === "number") return String(valor);
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "array";
  return typeof valor;
}

function validarFuncionLocal(f, prefijo) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      `${prefijo} "f" debe ser una función (esperado: function, recibido: ${describir(f)}).`,
    );
  }
}

function validarNumeroFinito(valor, nombre, prefijo) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `${prefijo} "${nombre}" debe ser un número finito (esperado: número finito, recibido: ${describir(valor)}).`,
    );
  }
}

function validarPaso(h, prefijo) {
  validarNumeroFinito(h, "h", prefijo);
  if (h === 0) {
    throw new ErrorParametros(
      `${prefijo} el parámetro "h" no puede ser 0 (esperado: número finito distinto de 0, recibido: 0).`,
    );
  }
}

function validarEntradas(f, x, h, metodo) {
  const prefijo = `ChuspaNumeric.${metodo}:`;
  validarFuncionLocal(f, prefijo);
  validarNumeroFinito(x, "x", prefijo);
  validarPaso(h, prefijo);
}

/**
 * Calcula la derivada numérica usando diferencias finitas hacia adelante.
 *
 * Fórmula:
 * f'(x) ≈ (f(x + h) - f(x)) / h
 *
 * @param {Function} f Función a derivar.
 * @param {number} x Punto donde se evalúa la derivada.
 * @param {number} h Paso de aproximación (finito y distinto de 0).
 * @returns {number} Aproximación de la derivada. Si f produce un desbordamiento,
 * se devuelve Infinity o NaN sin lanzar error (comportamiento original conservado).
 *
 * @throws {ErrorParametros} Si f no es una función, si x o h no son números
 * finitos, o si h es igual a 0. Los mensajes llevan el prefijo
 * "ChuspaNumeric.diferenciasAdelanteGrado1:" e indican esperado y recibido.
 *
 * @example
 * const resultado = diferenciasAdelanteGrado1(x => x ** 2, 2, 0.001);
 * console.log(resultado);
 */
function diferenciasAdelanteGrado1(f, x, h) {
  validarEntradas(f, x, h, METODO_GRADO1);

  return (f(x + h) - f(x)) / h;
}

/**
 * Calcula la derivada numérica usando la fórmula de tres puntos de
 * diferencias finitas hacia adelante, con error de orden O(h²).
 *
 * Fórmula:
 * f'(x) ≈ (-3·f(x) + 4·f(x + h) - f(x + 2h)) / (2h)
 *
 * @param {Function} f Función a derivar.
 * @param {number} x Punto donde se evalúa la derivada.
 * @param {number} h Paso de aproximación (finito y distinto de 0).
 * @returns {number} Aproximación de la derivada. Si f produce un desbordamiento,
 * se devuelve Infinity o NaN sin lanzar error (comportamiento original conservado).
 *
 * @throws {ErrorParametros} Si f no es una función, si x o h no son números
 * finitos, o si h es igual a 0. Los mensajes llevan el prefijo
 * "ChuspaNumeric.derivadaAdelanteOrden2:" e indican esperado y recibido.
 *
 * @example
 * const resultado = derivadaAdelanteOrden2(x => x ** 3, 2, 0.001);
 * console.log(resultado); // ≈ 12
 */
function derivadaAdelanteOrden2(f, x, h) {
  validarEntradas(f, x, h, METODO_ORDEN2);

  return (-3 * f(x) + 4 * f(x + h) - f(x + 2 * h)) / (2 * h);
}

export { diferenciasAdelanteGrado1, derivadaAdelanteOrden2 };
