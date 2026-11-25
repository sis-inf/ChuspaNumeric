import { ErrorParametros } from "../core/errores.js";

const METODO = "derivative";
const PREFIJO = `ChuspaNumeric.${METODO}:`;

/**
 * Describe de forma segura el valor recibido para los mensajes de error.
 * @param {*} valor - Valor a describir.
 * @returns {string} Tipo y valor, por ejemplo "string (abc)".
 */
function recibido(valor) {
  try {
    return `${typeof valor} (${String(valor)})`;
  } catch {
    return typeof valor;
  }
}

/**
 * Valida que f sea una función.
 * @param {*} f - Valor a validar.
 * @throws {ErrorParametros} Si f no es una función.
 */
function validarFuncionLocal(f) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      `${PREFIJO} El parámetro 'f' debe ser una función. Se esperaba: function. Se recibió: ${recibido(f)}`
    );
  }
}

/**
 * Valida que x sea un número finito.
 * @param {*} x - Valor a validar.
 * @throws {ErrorParametros} Si x no es un número finito.
 */
function validarPunto(x) {
  if (typeof x !== "number" || !Number.isFinite(x)) {
    throw new ErrorParametros(
      `${PREFIJO} El parámetro 'x' debe ser un número válido (finito). Se recibió: ${recibido(x)}`
    );
  }
}

/**
 * Valida que h sea un número finito y positivo.
 * @param {*} h - Valor a validar.
 * @throws {ErrorParametros} Si h no es un número finito mayor que 0.
 */
function validarPaso(h) {
  if (typeof h !== "number" || !Number.isFinite(h) || h <= 0) {
    throw new ErrorParametros(
      `${PREFIJO} El parámetro 'h' debe ser un número positivo (finito). Se recibió: ${recibido(h)}`
    );
  }
}

/**
 * Derivada numérica por diferencias finitas centradas:
 * f'(x) ≈ (f(x + h) - f(x - h)) / (2h).
 *
 * @param {Function} f - Función a derivar.
 * @param {number} x - Punto de evaluación (número finito).
 * @param {number} [h=1e-5] - Paso (número finito > 0).
 * @returns {number} Aproximación de f'(x). Se conserva el retorno numérico
 *   porque los tests existentes lo comprueban con toBeCloseTo (ver PR).
 * @throws {ErrorParametros} Si f no es función, x no es finito o h no es
 *   finito y positivo.
 */
export function derivative(f, x, h = 1e-5) {
  validarFuncionLocal(f);
  validarPunto(x);
  validarPaso(h);

  return (f(x + h) - f(x - h)) / (2 * h);
}
