import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";

/**
 * Describe un valor de forma segura para los mensajes de error (uso interno).
 *
 * Nunca lanza: un Symbol, un objeto sin prototipo o un objeto cuyo toString falle
 * no se convierten a texto con plantillas, porque esa conversión lanzaría un TypeError.
 *
 * @param {*} valor - Valor a describir.
 * @returns {string} Descripción corta del valor y su tipo.
 */
function _describirValor(valor) {
  try {
    if (valor === null) {
      return "null";
    }
    if (valor === undefined) {
      return "undefined";
    }
    if (Array.isArray(valor)) {
      return "array";
    }

    const tipo = typeof valor;
    if (tipo === "object" || tipo === "function") {
      return tipo;
    }

    return `${String(valor)} (${tipo})`;
  } catch {
    return "valor no descriptible";
  }
}

/**
 * Verifica que un valor sea un número finito (uso interno).
 *
 * A diferencia de `validarNumero`, el mensaje se arma con `_describirValor`, de modo que
 * siempre se lanza `ErrorParametros`, incluso con valores Symbol u objetos inválidos.
 *
 * @param {*}      valor  - Valor a verificar.
 * @param {string} nombre - Nombre del parámetro para el mensaje de error.
 * @throws {ErrorParametros} Si el valor no es un número finito.
 */
function _validarNumeroFinito(valor, nombre) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.newtonDD: '${nombre}' debe ser un número finito. Se recibió: ${_describirValor(valor)}.`
    );
  }
}

/**
 * Crea el error que se lanza cuando un cálculo intermedio o final no es finito (uso interno).
 *
 * @param {string} contexto - Dónde ocurrió el desborde (nivel, posición, paso).
 * @returns {ErrorParametros}
 */
function _errorDesborde(contexto) {
  return new ErrorParametros(
    `ChuspaNumeric.newtonDD: los cálculos exceden el rango numérico representable para los datos recibidos (${contexto}).`
  );
}

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
    _validarNumeroFinito(puntos[i][0], `puntos[${i}][0]`);
    _validarNumeroFinito(puntos[i][1], `puntos[${i}][1]`);
  }

  const xsUnicos = new Set(puntos.map((p) => p[0]));
  if (xsUnicos.size !== puntos.length) {
    throw new ErrorParametros(
      "ChuspaNumeric.newtonDD: existen dos o más puntos con el mismo valor de x. Los x deben ser únicos."
    );
  }

  _validarNumeroFinito(x, "x");
}

/**
 * Construye la tabla de diferencias divididas y evalúa el polinomio de Newton en x
 * (uso interno).
 *
 * @param {number[]} xs - Nodos (ya validados y únicos).
 * @param {number[]} ys - Valores en los nodos (ya validados).
 * @param {number}   x  - Punto de evaluación (ya validado).
 * @returns {{ resultado: number, tabla: number[][], iteraciones: Object[], coeficientes: number[] }}
 * @throws {ErrorParametros} Si una diferencia dividida o la evaluación exceden el rango numérico.
 */
function _calcularNewton(xs, ys, x) {
  const n = xs.length;
  const tabla = [ys.slice()]; // nivel 0: los valores yi originales
  const iteraciones = [{ nivel: 0, valores: ys.slice() }];

  for (let nivel = 1; nivel < n; nivel++) {
    const anterior = tabla[nivel - 1];
    const actual = [];

    for (let i = 0; i < anterior.length - 1; i++) {
      const numerador = anterior[i + 1] - anterior[i];
      const denominador = xs[i + nivel] - xs[i];

      // Se valida antes de dividir: la resta puede desbordar aunque los datos sean finitos.
      if (!Number.isFinite(numerador) || !Number.isFinite(denominador)) {
        throw _errorDesborde(
          `diferencia dividida de nivel ${nivel}, posición ${i}: numerador = ${numerador}, denominador = ${denominador}`
        );
      }
      if (denominador === 0) {
        throw new ErrorParametros(
          `ChuspaNumeric.newtonDD: los nodos xs[${i}] y xs[${i + nivel}] no son distinguibles (denominador nulo en el nivel ${nivel}).`
        );
      }

      const diferencia = numerador / denominador;
      if (!Number.isFinite(diferencia)) {
        throw _errorDesborde(
          `diferencia dividida de nivel ${nivel}, posición ${i}: ${numerador} / ${denominador}`
        );
      }

      actual.push(diferencia);
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

    if (!Number.isFinite(productorio) || !Number.isFinite(resultado)) {
      throw _errorDesborde(`evaluación del polinomio en x = ${x}, término ${i}`);
    }
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
 *     esquema anidado de Horner; en los nodos originales devuelve exactamente su yi y lanza
 *     ErrorParametros si x no es un número finito o si la evaluación desborda.
 *   Si x está fuera de [min(xi), max(xi)] se extrapola y se agrega una advertencia en `warnings`.
 * @throws {ErrorParametros} Si opciones no es un objeto (los arreglos se rechazan), si puntos no
 *   es válido (menos de dos puntos, un punto que no es un par, valores no finitos, Symbol u
 *   objetos como coordenadas, o x's repetidos), si x no es un número finito o si una diferencia
 *   dividida o la evaluación exceden el rango numérico representable.
 */
function newtonDD(opciones) {
  if (
    opciones === null ||
    typeof opciones !== "object" ||
    Array.isArray(opciones)
  ) {
    throw new ErrorParametros(
      `ChuspaNumeric.newtonDD: se requiere un objeto con { puntos, x }. Se recibió: ${_describirValor(opciones)}.`
    );
  }

  const { puntos, x } = opciones;
  _validarEntradas(puntos, x);

  const xs = puntos.map((p) => p[0]);
  const ys = puntos.map((p) => p[1]);
  const n = xs.length;

  const { valor, tiempo_ms } = medirTiempo(() => _calcularNewton(xs, ys, x));
  const { resultado, tabla, iteraciones, coeficientes } = valor;

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
    _validarNumeroFinito(valorX, "x");

    // En un nodo original se devuelve su y exacto para evitar errores de redondeo.
    const indiceNodo = xs.indexOf(valorX);
    if (indiceNodo !== -1) {
      return ys[indiceNodo];
    }

    let suma = coeficientes[n - 1];
    for (let i = n - 2; i >= 0; i--) {
      suma = suma * (valorX - xs[i]) + coeficientes[i];

      if (!Number.isFinite(suma)) {
        throw _errorDesborde(`evaluar(${valorX}), paso ${i}`);
      }
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
