/**
 * Regresión lineal por mínimos cuadrados.
 * Ajusta una recta y = pendiente*x + intercepto a los datos (xs, ys).
 *
 * @param {number[]} xs - Array de valores independientes (al menos 2).
 * @param {number[]} ys - Array de valores dependientes (misma longitud que xs).
 * @returns {{ pendiente: number, intercepto: number, r2: number, prediccion: Function }}
 * @throws {Error} Si xs tiene menos de 2 puntos o las longitudes no coinciden.
 *
 * @example
 * const { pendiente, intercepto, r2, prediccion } = regresionLineal([1,2,3], [2,4,6]);
 * // pendiente=2, intercepto=0, r2=1.0
 * prediccion(4); // 8
 */
function regresionLineal(xs, ys) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) {
    throw new Error('ChuspaNumeric.regresionLineal: xs e ys deben ser arrays.');
  }

  if (xs.length < 2) {
    throw new Error(
      `ChuspaNumeric.regresionLineal: se necesitan al menos 2 puntos. Se recibió: ${xs.length}.`
    );
  }

  if (xs.length !== ys.length) {
    throw new Error(
      `ChuspaNumeric.regresionLineal: xs e ys deben tener la misma longitud. ` +
      `xs.length=${xs.length}, ys.length=${ys.length}.`
    );
  }

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

  // Función de predicción
  const prediccion = (x) => pendiente * x + intercepto;

  return { pendiente, intercepto, r2, prediccion };
}

/**
 * Regresión polinomial por mínimos cuadrados de grado k.
 * Ajusta un polinomio de grado k a los datos (xs, ys) usando el método de
 * ecuaciones normales.
 *
 * @param {number[]} xs    - Array de valores independientes (al menos grado+1 puntos).
 * @param {number[]} ys    - Array de valores dependientes (misma longitud que xs).
 * @param {number}   grado - Grado del polinomio (entero >= 1).
 * @returns {{ coeficientes: number[], r2: number, prediccion: Function }}
 *   - `coeficientes`: [a0, a1, ..., ak] donde y = a0 + a1*x + a2*x² + ...
 *   - `r2`: coeficiente de determinación.
 *   - `prediccion`: función (x) que evalúa el polinomio en x.
 * @throws {Error} Si los datos son insuficientes o el grado no es válido.
 *
 * @example
 * const { coeficientes, prediccion } = regresionPolinomial([0,1,2,3], [1,3,9,19], 2);
 * prediccion(4); // valor estimado en x=4
 */
function regresionPolinomial(xs, ys, grado) {
  if (!Array.isArray(xs) || !Array.isArray(ys)) {
    throw new Error('ChuspaNumeric.regresionPolinomial: xs e ys deben ser arrays.');
  }

  if (!Number.isInteger(grado) || grado < 1) {
    throw new Error(
      `ChuspaNumeric.regresionPolinomial: 'grado' debe ser un entero >= 1. Se recibió: ${grado}.`
    );
  }

  if (xs.length < grado + 1) {
    throw new Error(
      `ChuspaNumeric.regresionPolinomial: se necesitan al menos ${grado + 1} puntos para grado ${grado}. ` +
      `Se recibió: ${xs.length}.`
    );
  }

  if (xs.length !== ys.length) {
    throw new Error(
      `ChuspaNumeric.regresionPolinomial: xs e ys deben tener la misma longitud.`
    );
  }

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

  // Resolver XᵀX·a = Xᵀy mediante eliminación de Gauss con sustitución regresiva
  const coeficientes = _resolverSistema(XtX, Xty);

  // Función de predicción
  const prediccion = (x) =>
    coeficientes.reduce((suma, a, p) => suma + a * Math.pow(x, p), 0);

  // Coeficiente de determinación r²
  const mediaY = ys.reduce((a, y) => a + y, 0) / n;
  const ssTot  = ys.reduce((a, y) => a + (y - mediaY) ** 2, 0);
  const ssRes  = ys.reduce((a, y, i) => a + (y - prediccion(xs[i])) ** 2, 0);
  const r2     = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { coeficientes, r2, prediccion };
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