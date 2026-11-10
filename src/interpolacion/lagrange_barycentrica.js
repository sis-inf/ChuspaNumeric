import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarNumero } from '../utils/validaciones.js';

/**
 * Evalúa el interpolante de Lagrange con la forma baricéntrica.
 *
 * Fórmula:
 * wᵢ = 1 / Πⱼ≠ᵢ (xᵢ − xⱼ)
 * P(x) = Σ (wᵢ · yᵢ / (x − xᵢ)) / Σ (wᵢ / (x − xᵢ))
 *
 * Si x coincide con un nodo se devuelve directamente su valor.
 *
 * @param {Object} params - Parámetros de configuración.
 * @param {number[]} params.nodos - Abscisas xᵢ, distintas entre sí (al menos dos).
 * @param {number[]} params.valores - Ordenadas yᵢ, de la misma longitud que nodos.
 * @param {number} params.x - Punto donde se evalúa el interpolante.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros no son válidos o hay nodos repetidos.
 *
 * @example
 * const res = lagrangeBaricentrica({ nodos: [0, 1, 2], valores: [0, 1, 4], x: 1.5 });
 * console.log(res.resultado); // 2.25
 */
function lagrangeBaricentrica({ nodos, valores, x }) {
  if (!Array.isArray(nodos) || nodos.length < 2) {
    throw new ErrorParametros(
      "ChuspaNumeric.lagrangeBaricentrica: 'nodos' debe ser un array con al menos dos elementos."
    );
  }

  if (!Array.isArray(valores) || valores.length !== nodos.length) {
    throw new ErrorParametros(
      "ChuspaNumeric.lagrangeBaricentrica: 'valores' debe ser un array de la misma longitud que 'nodos'."
    );
  }

  nodos.forEach((nodo, i) => validarNumero(nodo, `nodos[${i}]`));
  valores.forEach((valor, i) => validarNumero(valor, `valores[${i}]`));
  validarNumero(x, 'x');

  if (new Set(nodos).size !== nodos.length) {
    throw new ErrorParametros(
      "ChuspaNumeric.lagrangeBaricentrica: los valores de 'nodos' deben ser únicos."
    );
  }

  const pesos = nodos.map((xi, i) =>
    nodos.reduce((peso, xj, j) => (i === j ? peso : peso / (xi - xj)), 1)
  );
  const iteraciones = nodos.map((xi, i) => ({
    i,
    xi,
    yi: valores[i],
    peso: pesos[i],
  }));

  const indiceNodo = nodos.indexOf(x);
  let resultado;

  if (indiceNodo !== -1) {
    resultado = valores[indiceNodo];
  } else {
    let numerador = 0;
    let denominador = 0;

    for (let i = 0; i < nodos.length; i++) {
      const termino = pesos[i] / (x - nodos[i]);
      numerador += termino * valores[i];
      denominador += termino;
    }

    resultado = numerador / denominador;
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Interpolante de Lagrange baricéntrico evaluado en x = ${x}.`,
    meta: {
      metodo: 'lagrangeBaricentrica',
      parametros: { nodos, valores, x },
      tiempo_ms: 0,
    },
  });
}

export { lagrangeBaricentrica };
