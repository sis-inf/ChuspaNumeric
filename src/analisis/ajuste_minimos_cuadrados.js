import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';

/**
 * Regresión lineal por mínimos cuadrados.
 * Ajusta una recta y = pendiente*x + intercepto a los datos (xs, ys).
 *
 * @param {number[]} xs - Array de valores independientes (al menos 2, números finitos, no todos iguales).
 * @param {number[]} ys - Array de valores dependientes (misma longitud que xs, números finitos).
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric:
 *   - `resultado`: { pendiente, intercepto, r2 }.
 *   - `convergio`: true (es un cálculo directo, sin iteraciones).
 *   - `mensaje`: descripción del resultado.
 *   - `meta`: { metodo: 'regresion-lineal', parametros: { n }, tiempo_ms }.
 *   Además conserva en el primer nivel los campos de siempre: m, b, pendiente,
 *   intercepto, r2, residuos, desviacionError y prediccion (función x => y).
 * @throws {ErrorParametros} Si xs o ys no son arrays, si hay menos de 2 puntos, si las
 *   longitudes no coinciden, si hay valores no finitos, si todos los xs son iguales o si
 *   el ajuste excede el rango numérico representable.
 *
 * @example
 * const { pendiente, intercepto, r2, prediccion } = regresionLineal([1,2,3], [2,4,6]);
 * // pendiente=2, intercepto=0, r2=1.0
 * prediccion(4); // 8
 */
function regresionLineal(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) {
    throw new ErrorParametros('ChuspaNumeric.regresionLineal: xs e ys deben ser arrays.');
  }

  if (xs.length < 2) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionLineal: se necesitan al menos 2 puntos. Se recibió: ${xs.length}.`
    );
  }

  if (xs.length !== ys.length) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionLineal: xs e ys deben tener la misma longitud. ` +
      `xs.length=${xs.length}, ys.length=${ys.length}.`
    );
  }

  _validarFinitos('regresionLineal', xs, ys);

  if (xs.every((x) => x === xs[0])) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionLineal: xs debe tener al menos 2 valores distintos; ` +
      `con todos los xs iguales a ${xs[0]} la recta no está definida.`
    );
  }

  const inicio = performance.now();
  const n = xs.length;

  // Sumas necesarias para las fórmulas de mínimos cuadrados
  const sumaX  = xs.reduce((a, x) => a + x, 0);
  const sumaY  = ys.reduce((a, y) => a + y, 0);
  const sumaXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumaX2 = xs.reduce((a, x) => a + x * x, 0);

  // Pendiente e intercepto
  const pendiente   = (n * sumaXY - sumaX * sumaY) / (n * sumaX2 - sumaX * sumaX);
  const intercepto  = (sumaY - pendiente * sumaX) / n;

  // Coeficiente de determinación r²
  const mediaY   = sumaY / n;
  const ssTot    = ys.reduce((a, y) => a + (y - mediaY) ** 2, 0);
  const ssRes    = ys.reduce((a, y, i) => a + (y - (pendiente * xs[i] + intercepto)) ** 2, 0);
  const r2       = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  // Si alguna suma intermedia desborda, el ajuste no es confiable aunque sea finito
  _validarAjusteFinito('regresionLineal', [sumaXY, sumaX2, pendiente, intercepto, ssTot, r2]);

  // Residuos (y observada - y ajustada) y desviación estándar del error
  const residuos = ys.map((y, i) => y - (pendiente * xs[i] + intercepto));
  const desviacionError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  // Función de predicción
  const prediccion = (x) => pendiente * x + intercepto;

  return {
    ...crearResultado({
      resultado: { pendiente, intercepto, r2 },
      convergio: true,
      mensaje: 'Regresión lineal completada.',
      meta: {
        metodo: 'regresion-lineal',
        parametros: { n },
        tiempo_ms: performance.now() - inicio,
      },
    }),
    m: pendiente,
    b: intercepto,
    pendiente,
    intercepto,
    r2,
    residuos,
    desviacionError,
    prediccion,
  };
}

/**
 * Regresión polinomial por mínimos cuadrados de grado k.
 * Ajusta un polinomio de grado k a los datos (xs, ys) usando el método de
 * ecuaciones normales.
 *
 * @param {number[]} xs    - Array de valores independientes (números finitos, al menos grado+1 valores distintos).
 * @param {number[]} ys    - Array de valores dependientes (misma longitud que xs, números finitos).
 * @param {number}   grado - Grado del polinomio (entero >= 1).
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric:
 *   - `resultado`: { coeficientes, r2 }.
 *   - `convergio`: true (es un cálculo directo, sin iteraciones).
 *   - `mensaje`: descripción del resultado.
 *   - `meta`: { metodo: 'regresion-polinomial', parametros: { n, grado }, tiempo_ms }.
 *   Además conserva en el primer nivel los campos de siempre:
 *   - `coeficientes`: [a0, a1, ..., ak] donde y = a0 + a1*x + a2*x² + ...
 *   - `r2`: coeficiente de determinación.
 *   - `prediccion`: función (x) que evalúa el polinomio en x.
 * @throws {ErrorParametros} Si xs o ys no son arrays, si el grado no es válido, si los
 *   datos son insuficientes, si las longitudes no coinciden, si hay valores no finitos,
 *   si hay menos de grado+1 valores distintos en xs o si el ajuste excede el rango
 *   numérico representable.
 *
 * @example
 * const { coeficientes, prediccion } = regresionPolinomial([0,1,2,3], [1,3,9,19], 2);
 * prediccion(4); // valor estimado en x=4
 */
function regresionPolinomial(xs, ys, grado) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) {
    throw new ErrorParametros('ChuspaNumeric.regresionPolinomial: xs e ys deben ser arrays.');
  }

  if (!Number.isInteger(grado) || grado < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionPolinomial: 'grado' debe ser un entero >= 1. Se recibió: ${grado}.`
    );
  }

  if (xs.length < grado + 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionPolinomial: se necesitan al menos ${grado + 1} puntos para grado ${grado}. ` +
      `Se recibió: ${xs.length}.`
    );
  }

  if (xs.length !== ys.length) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionPolinomial: xs e ys deben tener la misma longitud. ` +
      `xs.length=${xs.length}, ys.length=${ys.length}.`
    );
  }

  _validarFinitos('regresionPolinomial', xs, ys);

  const distintos = new Set(xs).size;
  if (distintos < grado + 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.regresionPolinomial: se necesitan al menos ${grado + 1} valores distintos en xs ` +
      `para grado ${grado}. Se recibió: ${distintos}.`
    );
  }

  const inicio = performance.now();
  const n = xs.length;
  const k = grado + 1; // número de coeficientes

  // Construir matriz de Vandermonde X (n × k) y resolver sistema normal XᵀX·a = Xᵀy
  // Ecuaciones normales: A = XᵀX, b = Xᵀy

  // Construir XᵀX (k×k) y Xᵀy (k×1)
  const XtX = Array.from({ length: k }, () => new Array(k).fill(0));
  const Xty = new Array(k).fill(0);

  for (let i = 0; i < n; i++) {
    const potencias = Array.from({ length: k }, (_, p) => Math.pow(xs[i], p));
    for (let r = 0; r < k; r++) {
      Xty[r] += potencias[r] * ys[i];
      for (let c = 0; c < k; c++) {
        XtX[r][c] += potencias[r] * potencias[c];
      }
    }
  }

  // Si las ecuaciones normales desbordan, el ajuste no es confiable aunque sea finito
  _validarAjusteFinito('regresionPolinomial', [...XtX.flat(), ...Xty]);

  // Resolver XᵀX·a = Xᵀy mediante eliminación de Gauss con sustitución regresiva
  const coeficientes = _resolverSistema(XtX, Xty);

  _validarAjusteFinito('regresionPolinomial', coeficientes);

  // Función de predicción
  const prediccion = (x) =>
    coeficientes.reduce((suma, a, p) => suma + a * Math.pow(x, p), 0);

  // Coeficiente de determinación r²
  const mediaY = ys.reduce((a, y) => a + y, 0) / n;
  const ssTot  = ys.reduce((a, y) => a + (y - mediaY) ** 2, 0);
  const ssRes  = ys.reduce((a, y, i) => a + (y - prediccion(xs[i])) ** 2, 0);
  const r2     = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  _validarAjusteFinito('regresionPolinomial', [ssTot, r2]);

  return {
    ...crearResultado({
      resultado: { coeficientes, r2 },
      convergio: true,
      mensaje: `Regresión polinomial de grado ${grado} completada.`,
      meta: {
        metodo: 'regresion-polinomial',
        parametros: { n, grado },
        tiempo_ms: performance.now() - inicio,
      },
    }),
    coeficientes,
    r2,
    prediccion,
  };
}

/**
 * Comprueba que xs e ys contengan solamente números finitos (uso interno).
 *
 * @param {string}   nombre - Nombre de la función pública, para el mensaje de error.
 * @param {number[]} xs - Valores independientes.
 * @param {number[]} ys - Valores dependientes.
 * @throws {ErrorParametros} Si algún elemento no es un número finito.
 */
function _validarFinitos(nombre, xs, ys) {
  for (let i = 0; i < xs.length; i++) {
    if (!Number.isFinite(xs[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${nombre}: xs debe contener solamente números finitos. xs[${i}] es ${xs[i]}.`
      );
    }
    if (!Number.isFinite(ys[i])) {
      throw new ErrorParametros(
        `ChuspaNumeric.${nombre}: ys debe contener solamente números finitos. ys[${i}] es ${ys[i]}.`
      );
    }
  }
}

/**
 * Comprueba que los valores calculados por el ajuste (sumas intermedias,
 * parámetros y r²) sean números finitos (uso interno).
 *
 * @param {string}   nombre - Nombre de la función pública, para el mensaje de error.
 * @param {number[]} valores - Valores calculados por el ajuste.
 * @throws {ErrorParametros} Si algún valor no es finito.
 */
function _validarAjusteFinito(nombre, valores) {
  if (!valores.every((valor) => Number.isFinite(valor))) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombre}: los cálculos del ajuste exceden el rango numérico representable ` +
      `para los datos recibidos.`
    );
  }
}

/**
 * Resuelve un sistema lineal A·x = b por eliminación de Gauss (uso interno).
 *
 * @param {number[][]} A - Matriz de coeficientes.
 * @param {number[]}   b - Vector de términos independientes.
 * @returns {number[]} Vector solución.
 */
function _resolverSistema(A, b) {
  const n = A.length;
  const M = A.map((fila, i) => [...fila, b[i]]);

  for (let k = 0; k < n; k++) {
    for (let i = k + 1; i < n; i++) {
      const factor = M[i][k] / M[k][k];
      for (let j = k; j <= n; j++) {
        M[i][j] -= factor * M[k][j];
      }
    }
  }

  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    let suma = 0;
    for (let j = i + 1; j < n; j++) suma += M[i][j] * x[j];
    x[i] = (M[i][n] - suma) / M[i][i];
  }

  return x;
}

export { regresionLineal, regresionPolinomial };