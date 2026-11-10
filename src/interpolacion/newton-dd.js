import { crearResultado } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarNumero } from "../utils/validaciones.js";

/**
 * Interpolación de Newton mediante diferencias divididas.
 *
 * @param {Array}  puntos - Array de pares [xi, yi] con al menos dos puntos.
 * @param {number} x      - Valor donde se evalúa el polinomio interpolante.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si puntos no es válido o hay x's repetidos.
 */
function newtonDD({ puntos, x }) {
  // Validaciones 

  if (!Array.isArray(puntos) || puntos.length < 2) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: 'puntos' debe ser un array con al menos dos pares [xi, yi]."
    );
  }

  for (let i = 0; i < puntos.length; i++) {
    if (!Array.isArray(puntos[i]) || puntos[i].length < 2) {
      throw new ErrorParametros(
        `ChuspaNumeric.newtonDD: puntos[${i}] debe ser un par [xi, yi].`
      );
    }
  }

  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);

  const xsUnicos = new Set(xs);
  if (xsUnicos.size !== xs.length) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: existen dos o más puntos con el mismo valor de x. Los x deben ser únicos."
    );
  }

  validarNumero(x, "x");

  // Construir tabla de diferencias divididas 

  const n = puntos.length;
  const tabla = [ys.slice()]; // nivel 0: los valores yi originales
  const iteraciones = [{ nivel: 0, valores: ys.slice() }];

  for (let nivel = 1; nivel < n; nivel++) {
    const anterior = tabla[nivel - 1];
    const actual = [];

    for (let i = 0; i < anterior.length - 1; i++) {
      actual.push(
        (anterior[i + 1] - anterior[i]) / (xs[i + nivel] - xs[i])
      );
    }

    tabla.push(actual);
    iteraciones.push({ nivel, valores: actual.slice() });
  }

  // Los coeficientes de Newton son el primer elemento de cada nivel
  const coeficientes = tabla.map((nivel) => nivel[0]);

  // Evaluar el polinomio en x (forma de Newton) 

  let resultado = coeficientes[0];
  let productorio = 1;

  for (let i = 1; i < n; i++) {
    productorio *= (x - xs[i - 1]);
    resultado += coeficientes[i] * productorio;
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Polinomio de Newton evaluado en x = ${x}.`,
    meta: {
      metodo: "newtonDD",
      parametros: { puntos, x, coeficientes },
      tiempo_ms: 0,
    },
  });
}

export { newtonDD };