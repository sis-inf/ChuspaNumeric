import { crearResultado } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarNumero } from "../utils/validaciones.js";

/**
 * Interpolación de Lagrange para estimar el valor de un polinomio en x.
 *
 * @param {Array}  puntos - Array de pares [xi, yi] con al menos dos puntos.
 * @param {number} x      - Valor donde se evalúa el polinomio interpolante.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si puntos no es válido o hay x's repetidos.
 */
function lagrange({ puntos, x }) {
  // Validaciones 

  if (!Array.isArray(puntos) || puntos.length < 2) {
    throw new ErrorParametros(
      "ChuspaNumeric.lagrange: 'puntos' debe ser un array con al menos dos pares [xi, yi]."
    );
  }

  for (let i = 0; i < puntos.length; i++) {
    if (!Array.isArray(puntos[i]) || puntos[i].length < 2) {
      throw new ErrorParametros(
        `ChuspaNumeric.lagrange: puntos[${i}] debe ser un par [xi, yi].`
      );
    }
  }

  for (let i = 0; i < puntos.length; i++) {
    for (let j = i + 1; j < puntos.length; j++) {
      if (puntos[i][0] === puntos[j][0]) {
        throw new ErrorParametros(
          `ChuspaNumeric.lagrange: los puntos[${i}] y puntos[${j}] tienen el mismo valor de x (${puntos[i][0]}). Los x deben ser únicos.`
        );
      }
    }
  }

  validarNumero(x, "x");

  // Calcular polinomio de Lagrange 

  const n = puntos.length;
  const iteraciones = [];
  let resultado = 0;

  for (let i = 0; i < n; i++) {
    const xi = puntos[i][0];
    const yi = puntos[i][1];

    let Li = 1;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        Li *= (x - puntos[j][0]) / (xi - puntos[j][0]);
      }
    }

    const contribucion = yi * Li;
    resultado += contribucion;

    iteraciones.push({ i, xi, yi, Li, contribucion });
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Polinomio de Lagrange evaluado en x = ${x}.`,
    meta: {
      metodo: "lagrange",
      parametros: { puntos, x },
      tiempo_ms: 0,
    },
  });
}

export { lagrange };