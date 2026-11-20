import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros, ErrorDivergencia } from "../core/errores.js";

const METODO = "romberg";

/** Describe lo recibido para los mensajes de error. */
function describir(valor) {
  if (typeof valor === "string") return `"${valor}" (string)`;
  if (valor === null) return "null";
  if (Array.isArray(valor)) return "un arreglo";
  if (typeof valor === "object") return "un objeto";
  return `${String(valor)} (${typeof valor})`;
}

/** Valida que `valor` sea un número finito. */
function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito, se recibió ${describir(valor)}.`
    );
  }
}

/** Valida que `f` sea una función. */
function validarFuncion(f) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'f' debe ser una función, se recibió ${describir(f)}.`
    );
  }
}

/** Valida el intervalo [a, b]: extremos finitos y a < b. */
function validarLimites(a, b) {
  validarNumeroFinito(a, "a");
  validarNumeroFinito(b, "b");
  if (a >= b) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: el intervalo es inválido, se requiere a < b (se recibió a = ${a}, b = ${b}).`
    );
  }
}

/** Valida nMax: entero >= 1. */
function validarNMax(nMax) {
  validarNumeroFinito(nMax, "nMax");
  if (!Number.isInteger(nMax) || nMax < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'nMax' debe ser un entero mayor o igual a 1, se recibió ${nMax}.`
    );
  }
}

/** Valida tolerancia: número finito > 0. */
function validarToleranciaLocal(tolerancia) {
  validarNumeroFinito(tolerancia, "tolerancia");
  if (tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser mayor que 0, se recibió ${tolerancia}.`
    );
  }
}

/** Verifica finitud del resultado y arma el resultado estructurado. */
function finalizar({ resultado, tabla, filas, convergio, a, b, nMax, tolerancia, tiempo_ms }) {
  if (!Number.isFinite(resultado)) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: el resultado no es finito (${resultado}); la función evaluada produjo valores no finitos en [${a}, ${b}].`
    );
  }

  return crearResultado({
    resultado,
    iteraciones: tabla,
    convergio,
    mensaje: convergio
      ? `Integración mediante Romberg completada: convergió en ${filas} filas (tolerancia ${tolerancia}).`
      : `Integración mediante Romberg completada: no alcanzó la tolerancia ${tolerancia} tras ${filas} filas (nMax = ${nMax}).`,
    meta: {
      metodo: METODO,
      parametros: { a, b, nMax, tolerancia },
      tiempo_ms
    }
  });
}

/**
 * Integración numérica por el método de Romberg.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f - Función a integrar (number -> number).
 * @param {number} opciones.a - Límite inferior (finito).
 * @param {number} opciones.b - Límite superior (finito, b > a).
 * @param {number} [opciones.nMax=10] - Máximo de filas de la tabla (entero >= 1).
 * @param {number} [opciones.tolerancia=1e-8] - Tolerancia de convergencia (> 0).
 * @returns {Object} Resultado estructurado (ver crearResultado).
 * @throws {ErrorParametros} Si opciones no es un objeto o algún parámetro es inválido.
 * @throws {ErrorDivergencia} Si el resultado no es finito.
 */
function romberg(opciones) {
  if (opciones === null || typeof opciones !== "object" || Array.isArray(opciones)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, a, b, nMax, tolerancia }, se recibió ${describir(opciones)}.`
    );
  }

  const { f, a, b, nMax = 10, tolerancia = 1e-8 } = opciones;

  validarFuncion(f);
  validarLimites(a, b);
  validarNMax(nMax);
  validarToleranciaLocal(tolerancia);

  const { valor: calculo, tiempo_ms } = medirTiempo(() => {
    const tabla = [];

    let h = b - a;
    tabla[0] = [];
    tabla[0][0] = (h / 2) * (f(a) + f(b));

    for (let i = 1; i < nMax; i++) {
      h /= 2;

      let suma = 0;
      const puntosNuevos = 2 ** (i - 1);

      for (let k = 1; k <= puntosNuevos; k++) {
        suma += f(a + (2 * k - 1) * h);
      }

      tabla[i] = [];
      tabla[i][0] = 0.5 * tabla[i - 1][0] + h * suma;

      for (let j = 1; j <= i; j++) {
        tabla[i][j] =
          tabla[i][j - 1] +
          (tabla[i][j - 1] - tabla[i - 1][j - 1]) / (4 ** j - 1);
      }

      if (Math.abs(tabla[i][i] - tabla[i - 1][i - 1]) < tolerancia) {
        return {
          resultado: tabla[i][i],
          tabla,
          filas: tabla.length,
          convergio: true
        };
      }
    }

    return {
      resultado: tabla[nMax - 1][nMax - 1],
      tabla,
      filas: tabla.length,
      convergio: false
    };
  });

  return finalizar({ ...calculo, a, b, nMax, tolerancia, tiempo_ms });
}

export { romberg };
