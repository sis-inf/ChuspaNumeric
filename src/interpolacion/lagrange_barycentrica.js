import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorDivergencia } from '../core/errores.js';

const METODO = 'lagrangeBaricentrica';
const PREFIJO = `ChuspaNumeric.${METODO}:`;

/**
 * Describe un valor recibido para los mensajes de error.
 * @param {*} valor
 * @returns {string}
 */
function describir(valor) {
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return `arreglo (longitud ${valor.length})`;
  if (typeof valor === 'number') return String(valor);
  return typeof valor;
}

function validarOpciones(opciones) {
  if (
    typeof opciones !== 'object' ||
    opciones === null ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `${PREFIJO} los parámetros deben ser un objeto { nodos, valores, x } ` +
        `(esperado: objeto no nulo, recibido: ${describir(opciones)}).`
    );
  }
}

function validarNodos(nodos) {
  if (!Array.isArray(nodos) || nodos.length < 2) {
    throw new ErrorParametros(
      `${PREFIJO} 'nodos' debe ser un array con al menos dos elementos ` +
        `(esperado: arreglo de longitud >= 2, recibido: ${describir(nodos)}).`
    );
  }
}

function validarValores(valores, nodos) {
  if (!Array.isArray(valores) || valores.length !== nodos.length) {
    throw new ErrorParametros(
      `${PREFIJO} 'valores' debe ser un array de la misma longitud que 'nodos' ` +
        `(esperado: arreglo de longitud ${nodos.length}, recibido: ${describir(valores)}).`
    );
  }
}

function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `${PREFIJO} '${nombre}' debe ser un número finito ` +
        `(esperado: número finito, recibido: ${describir(valor)}).`
    );
  }
}

function validarArregloFinito(arreglo, nombre) {
  for (let i = 0; i < arreglo.length; i++) {
    validarNumeroFinito(arreglo[i], `${nombre}[${i}]`);
  }
}

function validarNodosUnicos(nodos) {
  const vistos = new Map();
  for (let i = 0; i < nodos.length; i++) {
    if (vistos.has(nodos[i])) {
      throw new ErrorParametros(
        `${PREFIJO} los valores de 'nodos' deben ser únicos ` +
          `(esperado: nodos distintos, recibido: ${nodos[i]} repetido en las posiciones ` +
          `${vistos.get(nodos[i])} y ${i}).`
      );
    }
    vistos.set(nodos[i], i);
  }
}

function ejecutarAlgoritmo({ nodos, valores, x }) {
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

  return { resultado, iteraciones };
}

function finalizar({ resultado, iteraciones, nodos, valores, x, tiempo_ms }) {
  if (!Number.isFinite(resultado)) {
    throw new ErrorDivergencia(
      `${PREFIJO} el interpolante produjo un valor no finito en x = ${x} ` +
        `(esperado: número finito, recibido: ${resultado}).`
    );
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Interpolante de Lagrange baricéntrico evaluado en x = ${x}.`,
    meta: {
      metodo: METODO,
      parametros: { nodos, valores, x },
      tiempo_ms,
    },
    warnings: [],
  });
}

/**
 * Evalúa el interpolante de Lagrange con la forma baricéntrica.
 *
 * Fórmula:
 * wᵢ = 1 / Πⱼ≠ᵢ (xᵢ − xⱼ)
 * P(x) = Σ (wᵢ · yᵢ / (x − xᵢ)) / Σ (wᵢ / (x − xᵢ))
 *
 * Si x coincide con un nodo se devuelve directamente su valor.
 *
 * @param {Object} opciones - Parámetros de configuración.
 * @param {number[]} opciones.nodos - Abscisas xᵢ finitas, distintas entre sí (al menos dos).
 * @param {number[]} opciones.valores - Ordenadas yᵢ finitas, de la misma longitud que nodos.
 * @param {number} opciones.x - Punto finito donde se evalúa el interpolante.
 * @returns {Object} Resultado del contrato de ChuspaNumeric. `iteraciones` es un
 *   arreglo con un registro por nodo: `{ i, xi, yi, peso }`.
 * @throws {ErrorParametros} Si los parámetros no son válidos, las longitudes no
 *   coinciden o hay nodos repetidos.
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 *
 * @example
 * const res = lagrangeBaricentrica({ nodos: [0, 1, 2], valores: [0, 1, 4], x: 1.5 });
 * console.log(res.resultado); // 2.25
 */
export function lagrangeBaricentrica(opciones) {
  validarOpciones(opciones);
  const { nodos, valores, x } = opciones;
  validarNodos(nodos);
  validarValores(valores, nodos);
  validarArregloFinito(nodos, 'nodos');
  validarArregloFinito(valores, 'valores');
  validarNumeroFinito(x, 'x');
  validarNodosUnicos(nodos);

  const { valor: calculo, tiempo_ms } = medirTiempo(() =>
    ejecutarAlgoritmo({ nodos, valores, x })
  );
  return finalizar({ ...calculo, nodos, valores, x, tiempo_ms });
}
