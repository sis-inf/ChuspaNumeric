import { crearResultado } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarFuncion, validarIntervalo } from "../utils/validaciones.js";

/**
 * Regla de Simpson 1/3 para aproximacion de integrales.
 *
 * @param {Object} params Parametros del metodo.
 * @param {Function} params.f Funcion a integrar.
 * @param {number} params.a Extremo inferior.
 * @param {number} params.b Extremo superior.
 * @param {number} [params.n=100] Numero de subintervalos (par).
 * @returns {Object} Resultado siguiendo el contrato definido por crearResultado.
 * @throws {ErrorParametros} Si f no es funcion, [a, b] es invalido o n no es entero positivo y par.
 */
function simpson13({ f, a, b, n = 100 }) {
  validarFuncion(f, "f");
  try {
    validarIntervalo(a, b);
  } catch (error) {
    // Se conserva el texto histórico "Intervalo inválido" del mensaje.
    throw new ErrorParametros(`Intervalo inválido. ${error.message}`);
  }

  if (!Number.isInteger(n) || n <= 0 || n % 2 !== 0) {
    throw new ErrorParametros(
      `Trazo: n debe ser un entero positivo y par. Se recibió: ${n}.`
    );
  }

  const h = (b - a) / n;

  let suma = 0;

  const iteraciones = [];

  for (let i = 0; i <= n; i++) {
    const xi = a + i * h;
    const fxi = f(xi);

    let coeficiente;

    if (i === 0 || i === n) {
      coeficiente = 1;
    } else if (i % 2 === 0) {
      coeficiente = 2;
    } else {
      coeficiente = 4;
    }

    suma += coeficiente * fxi;

    iteraciones.push({
      i,
      xi,
      fxi,
      coeficiente,
    });
  }

  const resultado = (h / 3) * suma;

    return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Simpson 1/3 completado con ${n} subintervalos.`,
    meta: {
      metodo: "Regla de Simpson 1/3",
      parametros: { a, b, n },
      tiempo_ms: 0,
    },
  });
}

export { simpson13 };

export default simpson13;
