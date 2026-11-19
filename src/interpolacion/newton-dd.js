import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarNumero } from "../utils/validaciones.js";

/**
 * Valida los parámetros de entrada de newtonDD (uso interno).
 *
 * @param {Array}  puntos - Pares [xi, yi].
 * @param {number} x      - Punto de evaluación.
 * @throws {ErrorParametros} Si puntos o x no cumplen los requisitos.
 */
function _validarEntradas(puntos, x) {
  if (!Array.isArray(puntos) || puntos.length < 2) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: 'puntos' debe ser un array con al menos dos pares [xi, yi]."
    );
  }

  for (let i = 0; i < puntos.length; i++) {
    if (!Array.isArray(puntos[i]) || puntos[i].length !== 2) {
      throw new ErrorParametros(
        `ChuspaNumeric.newtonDD: puntos[${i}] debe ser un par [xi, yi].`
      );
    }
    validarNumero(puntos[i][0], `puntos[${i}][0]`);
    validarNumero(puntos[i][1], `puntos[${i}][1]`);
  }

  const xsUnicos = new Set(puntos.map((p) => p[0]));
  if (xsUnicos.size !== puntos.length) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: existen dos o más puntos con el mismo valor de x. Los x deben ser únicos."
    );
  }

  validarNumero(x, "x");
}

/**
 * Construye la tabla de diferencias divididas y evalúa el polinomio de Newton en x
 * (uso interno).
 *
 * @param {number[]} xs - Nodos (ya validados y únicos).
 * @param {number[]} ys - Valores en los nodos (ya validados).
 * @param {number}   x  - Punto de evaluación (ya validado).
 * @returns {{ resultado: number, tabla: number[][], iteraciones: Object[], coeficientes: number[] }}
 */
function _calcularNewton(xs, ys, x) {
  const n = xs.length;
  const tabla = [ys.slice()]; // nivel 0: los valores yi originales
  const iteraciones = [{ nivel: 0, valores: ys.slice() }];

  for (let nivel = 1; nivel < n; nivel++) {
    const anterior = tabla[nivel - 1];
    const actual = [];

    for (let i = 0; i < anterior.length - 1; i++) {
      actual.push((anterior[i + 1] - anterior[i]) / (xs[i + nivel] - xs[i]));
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
    productorio *= x - xs[i - 1];
    resultado += coeficientes[i] * productorio;
  }

  return { resultado, tabla, iteraciones, coeficientes };
}

/**
 * Interpolación de Newton mediante diferencias divididas.
 *
 * @param {Object} opciones
 * @param {Array}  opciones.puntos - Array de pares [xi, yi] finitos, con al menos dos puntos
 *   y xi únicos.
 * @param {number} opciones.x      - Valor finito donde se evalúa el polinomio interpolante.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric, con dos campos adicionales:
 *   - `tabla`: tabla de diferencias divididas (un arreglo por nivel; el nivel 0 son los yi).
 *   - `evaluar(x)`: función que evalúa el polinomio interpolante en cualquier x con el
 *     esquema anidado de Horner; en los nodos originales devuelve exactamente su yi.
 *   Si x está fuera de [min(xi), max(xi)] se extrapola y se agrega una advertencia en `warnings`.
 * @throws {ErrorParametros} Si opciones no es un objeto, si puntos no es válido (menos de dos
 *   puntos, un punto que no es un par, valores no finitos o x's repetidos), si x no es
 *   un número finito o si el cálculo excede el rango numérico representable.
 */
function newtonDD(opciones) {
  if (opciones === null || typeof opciones !== "object") {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: se requiere un objeto con { puntos, x }."
    );
  }

  const { puntos, x } = opciones;
  _validarEntradas(puntos, x);

  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const n = xs.length;

  const { valor, tiempo_ms } = medirTiempo(() => _calcularNewton(xs, ys, x));
  const { resultado, tabla, iteraciones, coeficientes } = valor;

  // Con datos muy grandes las diferencias divididas pueden desbordar: el resultado no sería confiable.
  const todoFinito = tabla.every((nivel) => nivel.every((v) => Number.isFinite(v)));
  if (!todoFinito || !Number.isFinite(resultado)) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: los cálculos exceden el rango numérico representable para los datos recibidos."
    );
  }

  const warnings = [];
  const xMin = xs.reduce((a, b) => Math.min(a, b));
  const xMax = xs.reduce((a, b) => Math.max(a, b));
  if (x < xMin || x > xMax) {
    warnings.push(
      `x=${x} está fuera del rango de los nodos [${xMin}, ${xMax}]: ` +
        "se extrapola con el polinomio interpolante y el resultado puede ser poco fiable."
    );
  }

  // Evaluador del polinomio de Newton con el esquema anidado de Horner:
  // P(x) = c0 + (x - x0) * (c1 + (x - x1) * (c2 + ...))
  const evaluar = (valorX) => {
    validarNumero(valorX, "x");

    // En un nodo original se devuelve su y exacto para evitar errores de redondeo.
    const indiceNodo = xs.indexOf(valorX);
    if (indiceNodo !== -1) {
      return ys[indiceNodo];
    }

    let suma = coeficientes[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      suma = suma * (valorX - xs[i]) + coeficientes[i];
    }

    return suma;
  };

  const salida = crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Polinomio de Newton evaluado en x = ${x}.`,
    meta: {
      metodo: "newtonDD",
      parametros: { puntos, x, coeficientes },
      tiempo_ms,
    },
    warnings,
  });

  // crearResultado solo copia los campos del contrato: la tabla y el evaluador se agregan aquí.
  salida.tabla = tabla.map((nivel) => nivel.slice());
  salida.evaluar = evaluar;

  return salida;
}

export { newtonDD };
