import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

const METODO_GRADO1 = 'diferenciasAtrasGrado1';
const METODO_ORDEN2 = 'derivadaAtrasOrden2';

function describir(valor) {
  if (typeof valor === 'number') return String(valor);
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  return typeof valor;
}

function validarFuncionLocal(f, prefijo) {
  if (typeof f !== 'function') {
    throw new ErrorParametros(
      `${prefijo} "f" debe ser una función (esperado: function, recibido: ${describir(f)}).`
    );
  }
}

function validarNumeroFinito(valor, nombre, prefijo) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `${prefijo} "${nombre}" debe ser un número finito (esperado: número finito, recibido: ${describir(valor)}).`
    );
  }
}

/**
 * Calcula la primera derivada de una función usando diferencias finitas hacia atrás
 * de orden O(h):
 * f'(x) ≈ (f(x) - f(x - h)) / h
 *
 * @param {Function} f Función objetivo a derivar.
 * @param {number} x Punto en el cual se evalúa la derivada.
 * @param {number} h Tamaño del paso (finito y distinto de 0).
 * @returns {number} Valor aproximado de la derivada en x.
 * @throws {ErrorParametros} Si f no es función, x o h no son números finitos, o h es 0.
 */
function diferenciasAtrasGrado1(f, x, h) {
  const prefijo = `ChuspaNumeric.${METODO_GRADO1}:`;
  validarFuncionLocal(f, prefijo);
  validarNumeroFinito(x, 'x', prefijo);
  validarNumeroFinito(h, 'h', prefijo);

  if (h === 0) {
    throw new ErrorParametros(
      `${prefijo} el tamaño del paso "h" no puede ser 0 (esperado: número finito distinto de 0, recibido: 0).`
    );
  }

  const inicio = performance.now();
  const valor = (f(x) - f(x - h)) / h;
  const finita = Number.isFinite(valor);

  const contrato = crearResultado({
    resultado: valor,
    convergio: finita,
    mensaje: finita
      ? 'Diferencia finita hacia atrás de grado 1 calculada.'
      : 'La aproximación produjo un valor no finito.',
    meta: {
      metodo: METODO_GRADO1,
      parametros: { x, h },
      tiempo_ms: performance.now() - inicio,
    },
  });

  // Se retorna el valor numérico manteniendo el contrato estructurado como propiedad adjunta
  const resultado = new Number(valor);
  resultado.valueOf = () => valor;
  resultado.contrato = contrato;
  resultado.convergio = contrato.convergio;
  resultado.mensaje = contrato.mensaje;
  resultado.meta = contrato.meta;

  return valor;
}

/**
 * Calcula la primera derivada de una función usando la fórmula de tres puntos
 * de diferencias finitas hacia atrás, con error de orden O(h²):
 * f'(x) ≈ (3·f(x) - 4·f(x - h) + f(x - 2h)) / (2h)
 *
 * @param {Function} f Función objetivo a derivar.
 * @param {number} x Punto en el cual se evalúa la derivada.
 * @param {number} h Tamaño del paso (finito y positivo).
 * @returns {number} Valor aproximado de la derivada en x.
 * @throws {ErrorParametros} Si f no es función, x o h no son números finitos, o h <= 0.
 */
function derivadaAtrasOrden2(f, x, h) {
  const prefijo = `ChuspaNumeric.${METODO_ORDEN2}:`;
  validarFuncionLocal(f, prefijo);
  validarNumeroFinito(x, 'x', prefijo);
  validarNumeroFinito(h, 'h', prefijo);

  if (h <= 0) {
    throw new ErrorParametros(
      `${prefijo} el parámetro "h" debe ser positivo (esperado: número finito > 0, recibido: ${h}).`
    );
  }

  const inicio = performance.now();
  const valor = (3 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / (2 * h);
  const finita = Number.isFinite(valor);

  crearResultado({
    resultado: valor,
    convergio: finita,
    mensaje: finita
      ? 'Diferencia finita hacia atrás de orden 2 calculada.'
      : 'La aproximación produjo un valor no finito.',
    meta: {
      metodo: METODO_ORDEN2,
      parametros: { x, h },
      tiempo_ms: performance.now() - inicio,
    },
  });

  return valor;
}

export { diferenciasAtrasGrado1, derivadaAtrasOrden2 };