import { ErrorParametros, ErrorDominio, ErrorDivergencia } from "../core/errores.js";
import { crearResultado, medirTiempo } from "../core/contrato.js";

const METODO = "gaussLegendre";
const PUNTOS_VALIDOS = [2, 3, 4, 5];

function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito, se recibió ${String(valor)} (${typeof valor})`
    );
  }
}

function validarEntradas(opciones) {
  if (opciones === null || typeof opciones !== "object" || Array.isArray(opciones)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, a, b, puntos }, se recibió ${
        opciones === null ? "null" : Array.isArray(opciones) ? "array" : typeof opciones
      }`
    );
  }

  const { f, a, b, puntos } = opciones;

  if (typeof f !== "function") {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'f' debe ser una función, se recibió ${typeof f}`
    );
  }
  validarNumeroFinito(a, "a");
  validarNumeroFinito(b, "b");

  if (!PUNTOS_VALIDOS.includes(puntos)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'puntos' debe ser 2, 3, 4 o 5, se recibió ${String(puntos)}`
    );
  }
}

function obtenerNodosYPesos(puntos) {
  let nodos;
  let pesos;

  if (puntos === 2) {
    nodos = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)];
    pesos = [1, 1];
  } else if (puntos === 3) {
    nodos = [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)];
    pesos = [5 / 9, 8 / 9, 5 / 9];
  } else if (puntos === 4) {
    const raiz6sobre5 = Math.sqrt(6 / 5);
    const nodoExterno4 = Math.sqrt((3 + 2 * raiz6sobre5) / 7);
    const nodoInterno4 = Math.sqrt((3 - 2 * raiz6sobre5) / 7);
    nodos = [-nodoExterno4, -nodoInterno4, nodoInterno4, nodoExterno4];
    pesos = [
      (18 - Math.sqrt(30)) / 36,
      (18 + Math.sqrt(30)) / 36,
      (18 + Math.sqrt(30)) / 36,
      (18 - Math.sqrt(30)) / 36,
    ];
  } else {
    const raiz10sobre7 = Math.sqrt(10 / 7);
    const nodoExterno5 = Math.sqrt(5 + 2 * raiz10sobre7) / 3;
    const nodoInterno5 = Math.sqrt(5 - 2 * raiz10sobre7) / 3;
    nodos = [-nodoExterno5, -nodoInterno5, 0, nodoInterno5, nodoExterno5];
    pesos = [
      (322 - 13 * Math.sqrt(70)) / 900,
      (322 + 13 * Math.sqrt(70)) / 900,
      128 / 225,
      (322 + 13 * Math.sqrt(70)) / 900,
      (322 - 13 * Math.sqrt(70)) / 900,
    ];
  }

  return { nodos, pesos };
}

function finalizar({ resultado, puntos, a, b, tiempo_ms }) {
  if (!Number.isFinite(resultado)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el resultado de la integral no es finito (${resultado})`
    );
  }

  return crearResultado({
    resultado,
    iteraciones: puntos,
    convergio: true,
    mensaje: `Integral aproximada con cuadratura de Gauss-Legendre de ${puntos} puntos`,
    meta: {
      metodo: METODO,
      parametros: { a, b, puntos },
      tiempo_ms,
    },
  });
}

/**
 * Aproxima la integral de f en [a, b] con cuadratura de Gauss-Legendre.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f - Función a integrar (recibe un número y devuelve un número finito).
 * @param {number} opciones.a - Límite inferior (finito).
 * @param {number} opciones.b - Límite superior (finito).
 * @param {number} opciones.puntos - Número de nodos: 2, 3, 4 o 5.
 * @returns {Object} Resultado estructurado creado con crearResultado.
 * @throws {ErrorParametros} Si opciones, f, a, b o puntos no son válidos.
 * @throws {ErrorDominio} Si f devuelve un valor no numérico o no finito en algún nodo.
 * @throws {ErrorDivergencia} Si el resultado final no es finito.
 */
function gaussLegendre(opciones) {
  validarEntradas(opciones);
  const { f, a, b, puntos } = opciones;

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    const { nodos, pesos } = obtenerNodosYPesos(puntos);

    let suma = 0;

    for (let i = 0; i < nodos.length; i++) {
      const x = ((b - a) / 2) * nodos[i] + (a + b) / 2;
      const fx = f(x);

      if (typeof fx !== "number" || !Number.isFinite(fx)) {
        throw new ErrorDominio(
          `ChuspaNumeric.${METODO}: f(${x}) devolvió un valor no finito o no numérico (${String(fx)})`
        );
      }

      suma += pesos[i] * fx;
    }

    return { resultado: ((b - a) / 2) * suma };
  });

  return finalizar({ resultado: calculo.resultado, puntos, a, b, tiempo_ms });
}

export default gaussLegendre;
