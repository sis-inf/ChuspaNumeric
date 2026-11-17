/**
 * @file funciones-personalizadas.gs
 * @description Funciones personalizadas de Google Sheets que implementan
 * métodos numéricos de ChuspaNumeric sin depender de npm.
 *
 * Apps Script ejecuta JavaScript en el servidor de Google y NO soporta
 * `import` ni `require` de paquetes npm. Por eso este archivo contiene
 * implementaciones standalone (autocontenidas) de los métodos de ChuspaNumeric,
 * copiadas y adaptadas del código fuente del repositorio.
 *
 * Para usar estas funciones en una hoja de cálculo:
 * 1. Abre tu hoja de cálculo en Google Sheets.
 * 2. Ve a Extensiones → Apps Script.
 * 3. Pega el contenido de este archivo en el editor.
 * 4. Guarda (Ctrl+S) y vuelve a la hoja.
 * 5. Usa las funciones como cualquier función de Sheets: =CHUSPANUMERIC_BISECCION(...)
 *
 * Consulta README.md para instrucciones detalladas y limitaciones.
 */

// =============================================================================
// IMPLEMENTACIONES STANDALONE DE LOS MÉTODOS NUMÉRICOS
// (Adaptadas de chuspanumeric/src/ para funcionar sin módulos ES)
// =============================================================================

/**
 * Implementación standalone de bisección.
 * @param {Function} f - Función a evaluar
 * @param {number} a - Extremo izquierdo del intervalo
 * @param {number} b - Extremo derecho del intervalo
 * @param {number} tolerancia
 * @param {number} maxIter
 * @returns {{ resultado: number, iteraciones: number, convergio: boolean, mensaje: string }}
 */
function _biseccion(f, a, b, tolerancia, maxIter) {
  var fa = f(a);
  var fb = f(b);

  if (fa * fb > 0) {
    throw new Error(
      'Bisección: f(a) y f(b) deben tener signos opuestos. ' +
      'f(' + a + ')=' + fa.toFixed(6) + ', f(' + b + ')=' + fb.toFixed(6)
    );
  }

  var iteraciones = 0;
  var c, fc;

  for (var i = 0; i < maxIter; i++) {
    c = (a + b) / 2;
    fc = f(c);
    iteraciones++;

    if (Math.abs(fc) < tolerancia || (b - a) / 2 < tolerancia) {
      return { resultado: c, iteraciones: iteraciones, convergio: true, mensaje: 'Convergió en ' + iteraciones + ' iteraciones.' };
    }

    if (fa * fc < 0) {
      b = c;
      fb = fc;
    } else {
      a = c;
      fa = fc;
    }
  }

  return { resultado: c, iteraciones: iteraciones, convergio: false, mensaje: 'No convergió en ' + maxIter + ' iteraciones.' };
}

/**
 * Implementación standalone de Newton-Raphson con derivada numérica.
 * Como Apps Script no puede evaluar expresiones matemáticas dinámicamente,
 * se usa diferencia centrada para aproximar la derivada.
 * @param {Function} f
 * @param {number} x0 - Punto inicial
 * @param {number} tolerancia
 * @param {number} maxIter
 */
function _newtonRaphsonNumerico(f, x0, tolerancia, maxIter) {
  var h = 1e-7;
  var x = x0;

  for (var i = 0; i < maxIter; i++) {
    var fx = f(x);
    var dfx = (f(x + h) - f(x - h)) / (2 * h);

    if (Math.abs(dfx) < 1e-14) {
      throw new Error('Newton-Raphson: derivada numérica cercana a cero en x=' + x);
    }

    var xNuevo = x - fx / dfx;

    if (Math.abs(xNuevo - x) < tolerancia) {
      return { resultado: xNuevo, iteraciones: i + 1, convergio: true, mensaje: 'Convergió en ' + (i + 1) + ' iteraciones.' };
    }

    x = xNuevo;
  }

  return { resultado: x, iteraciones: maxIter, convergio: false, mensaje: 'No convergió en ' + maxIter + ' iteraciones.' };
}

/**
 * Implementación standalone de la regla del trapecio compuesta.
 * @param {Function} f
 * @param {number} a
 * @param {number} b
 * @param {number} n - Número de subintervalos (debe ser ≥ 1)
 */
function _trapecio(f, a, b, n) {
  var h = (b - a) / n;
  var suma = f(a) + f(b);

  for (var i = 1; i < n; i++) {
    suma += 2 * f(a + i * h);
  }

  return (h / 2) * suma;
}

// =============================================================================
// FUNCIONES PERSONALIZADAS PARA GOOGLE SHEETS
// Prefijo CHUSPANUMERIC_ para evitar conflictos con funciones nativas de Sheets.
// =============================================================================

/**
 * Encuentra una raíz de una expresión matemática en [a, b] usando bisección.
 *
 * IMPORTANTE: Google Apps Script no puede evaluar expresiones arbitrarias como
 * strings. La columna "formula" debe contener el NOMBRE de una función
 * predefinida en este script (ver sección "FUNCIONES MATEMÁTICAS DISPONIBLES"
 * más abajo), o el número de identificador de función (1-5).
 *
 * @param {string|number} funcionId - Nombre o ID de la función matemática (ver tabla).
 * @param {number} a - Extremo izquierdo del intervalo.
 * @param {number} b - Extremo derecho del intervalo.
 * @param {number} [tolerancia=0.000001] - Tolerancia de convergencia.
 * @param {number} [maxIter=100] - Máximo de iteraciones.
 * @returns {number} Raíz aproximada de la función en [a, b].
 *
 * @customfunction
 *
 * Ejemplo en Sheets:
 *   =CHUSPANUMERIC_BISECCION("x2_menos_4", 0, 3)          → 2
 *   =CHUSPANUMERIC_BISECCION("x3_menos_2x_menos_5", 2, 3)  → 2.0946
 *   =CHUSPANUMERIC_BISECCION(1, 0, 3)                       → 2  (usando ID numérico)
 */
function CHUSPANUMERIC_BISECCION(funcionId, a, b, tolerancia, maxIter) {
  tolerancia = tolerancia || 1e-6;
  maxIter = maxIter || 100;

  var f = _obtenerFuncion(funcionId);
  var resultado = _biseccion(f, a, b, tolerancia, maxIter);
  return resultado.resultado;
}

/**
 * Encuentra una raíz de una expresión usando Newton-Raphson con derivada numérica.
 *
 * @param {string|number} funcionId - Nombre o ID de la función matemática.
 * @param {number} x0 - Punto inicial de la iteración.
 * @param {number} [tolerancia=0.000001] - Tolerancia de convergencia.
 * @param {number} [maxIter=50] - Máximo de iteraciones.
 * @returns {number} Raíz aproximada.
 *
 * @customfunction
 *
 * Ejemplo en Sheets:
 *   =CHUSPANUMERIC_NEWTON("x2_menos_4", 3)       → 2
 *   =CHUSPANUMERIC_NEWTON("cos_menos_x", 1)      → 0.7391
 */
function CHUSPANUMERIC_NEWTON(funcionId, x0, tolerancia, maxIter) {
  tolerancia = tolerancia || 1e-6;
  maxIter = maxIter || 50;

  var f = _obtenerFuncion(funcionId);
  var resultado = _newtonRaphsonNumerico(f, x0, tolerancia, maxIter);
  return resultado.resultado;
}

/**
 * Calcula la integral de una función en [a, b] usando la regla del trapecio.
 *
 * @param {string|number} funcionId - Nombre o ID de la función matemática.
 * @param {number} a - Límite inferior de integración.
 * @param {number} b - Límite superior de integración.
 * @param {number} [n=100] - Número de subintervalos.
 * @returns {number} Aproximación de la integral.
 *
 * @customfunction
 *
 * Ejemplo en Sheets:
 *   =CHUSPANUMERIC_TRAPECIO("x2", 0, 1, 100)    → 0.3333 (≈ 1/3)
 *   =CHUSPANUMERIC_TRAPECIO("sin_x", 0, 3.14159, 200)  → 2.0000
 */
function CHUSPANUMERIC_TRAPECIO(funcionId, a, b, n) {
  n = n || 100;
  var f = _obtenerFuncion(funcionId);
  return _trapecio(f, a, b, n);
}

/**
 * Devuelve información sobre el número de iteraciones de la última bisección.
 * Útil para estudiar convergencia en una celda separada.
 *
 * @param {string|number} funcionId
 * @param {number} a
 * @param {number} b
 * @param {number} [tolerancia=0.000001]
 * @param {number} [maxIter=100]
 * @returns {number} Número de iteraciones usadas.
 *
 * @customfunction
 */
function CHUSPANUMERIC_BISECCION_ITERS(funcionId, a, b, tolerancia, maxIter) {
  tolerancia = tolerancia || 1e-6;
  maxIter = maxIter || 100;
  var f = _obtenerFuncion(funcionId);
  var resultado = _biseccion(f, a, b, tolerancia, maxIter);
  return resultado.iteraciones;
}

// =============================================================================
// FUNCIONES MATEMÁTICAS DISPONIBLES
//
// Apps Script no puede evaluar strings como "x^2 - 4" en tiempo de ejecución
// con eval() de forma segura, y las funciones personalizadas de Sheets no
// pueden recibir referencias a celdas con lambdas.
//
// Solución: catálogo de funciones predefinidas, referenciadas por nombre o ID.
// Para agregar una nueva función: añadir una entrada al objeto CATALOGO y
// proporcionar la implementación JavaScript correspondiente.
// =============================================================================

/**
 * Catálogo de funciones matemáticas disponibles.
 * Clave: nombre legible que el usuario escribe en la celda.
 * Valor: función JavaScript correspondiente.
 */
var CATALOGO = {
  // Polinomios
  'x2':               function(x) { return x * x; },               // f(x) = x²
  'x2_menos_4':       function(x) { return x * x - 4; },           // f(x) = x² - 4, raíz: 2
  'x3_menos_2x_menos_5': function(x) { return x*x*x - 2*x - 5; }, // f(x) = x³-2x-5, raíz: ≈2.0946
  'x3_menos_x':       function(x) { return x*x*x - x; },           // f(x) = x³-x, raíces: 0, ±1
  'x2_menos_x_menos_2': function(x) { return x*x - x - 2; },       // f(x) = x²-x-2, raíces: -1, 2

  // Trigonométricas e hiperbólicas
  'sin_x':            function(x) { return Math.sin(x); },
  'cos_x':            function(x) { return Math.cos(x); },
  'cos_menos_x':      function(x) { return Math.cos(x) - x; },     // f(x) = cos(x)-x, raíz: ≈0.7391
  'sin_menos_x_sobre_2': function(x) { return Math.sin(x) - x/2; }, // raíces: 0, ±π/3

  // Exponenciales y logarítmicas
  'exp_menos_x':      function(x) { return Math.exp(-x); },
  'exp_x_menos_2':    function(x) { return Math.exp(x) - 2; },     // raíz: ln(2) ≈ 0.6931
  'log_x':            function(x) { return Math.log(x); },         // logaritmo natural

  // Combinadas
  'x_por_exp_x_menos_1': function(x) { return x * Math.exp(x) - 1; }, // raíz: ≈0.5671
};

// Alias numéricos (ID entero → nombre de función)
var ALIAS_NUMERICOS = [
  'x2_menos_4',          // 1
  'x3_menos_2x_menos_5', // 2
  'cos_menos_x',         // 3
  'sin_x',               // 4
  'exp_x_menos_2',       // 5
];

/**
 * Resuelve el ID o nombre de función y devuelve la función JavaScript.
 * @param {string|number} funcionId
 * @returns {Function}
 */
function _obtenerFuncion(funcionId) {
  // ID numérico
  if (typeof funcionId === 'number') {
    var idx = Math.round(funcionId) - 1;
    if (idx < 0 || idx >= ALIAS_NUMERICOS.length) {
      throw new Error(
        'CHUSPANUMERIC: ID de función ' + funcionId + ' no válido. ' +
        'IDs disponibles: 1-' + ALIAS_NUMERICOS.length + '. ' +
        'Ver ALIAS_NUMERICOS en el script.'
      );
    }
    return CATALOGO[ALIAS_NUMERICOS[idx]];
  }

  // Nombre de función (string)
  var nombre = String(funcionId).trim().toLowerCase().replace(/ /g, '_');
  if (!CATALOGO[nombre]) {
    throw new Error(
      'CHUSPANUMERIC: función "' + funcionId + '" no encontrada en el catálogo. ' +
      'Funciones disponibles: ' + Object.keys(CATALOGO).join(', ') + '. ' +
      'Para agregar una nueva función, edita CATALOGO en el script.'
    );
  }
  return CATALOGO[nombre];
}

// =============================================================================
// FUNCIÓN DE AYUDA EN SHEETS
// =============================================================================

/**
 * Devuelve la lista de funciones matemáticas disponibles en el catálogo.
 * Útil para consultar desde una celda qué funciones se pueden usar.
 *
 * @returns {string[][]} Lista de nombres de funciones, una por fila.
 *
 * @customfunction
 *
 * Ejemplo: =CHUSPANUMERIC_LISTA_FUNCIONES()
 */
function CHUSPANUMERIC_LISTA_FUNCIONES() {
  var nombres = Object.keys(CATALOGO);
  return nombres.map(function(nombre, idx) {
    return [String(idx + 1 <= ALIAS_NUMERICOS.length ? idx + 1 : '-'), nombre];
  });
}