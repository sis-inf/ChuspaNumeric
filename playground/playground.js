/**
 * @file Playground de ChuspaNumeric: formulario para elegir un método, cargar
 * parámetros y ver el resultado y la tabla de iteraciones.
 *
 * Se carga como script clásico desde index.html, por eso no usa export de ESM.
 * Las funciones que no dependen del DOM se publican así:
 *   - En el navegador: window.ChuspaNumericPlayground
 *   - En entornos CommonJS (bundlers que definen module): module.exports
 * La interfaz solo se arma si existe document.
 */
/* global window, document, module */
(function () {
  "use strict";

  /**
   * Campo del formulario de un método.
   *
   * @typedef {Object} CampoMetodo
   * @property {string} name - Nombre del parámetro (también id del input).
   * @property {string} label - Texto de la etiqueta.
   * @property {"number"|"expression"|"json"} type - Cómo se lee el valor.
   * @property {string} value - Valor de ejemplo.
   * @property {boolean} [wide] - Si ocupa todo el ancho del formulario.
   */

  /**
   * Método disponible en el playground.
   *
   * @typedef {Object} MetodoPlayground
   * @property {string} id - Identificador interno, por ejemplo 'biseccion'.
   * @property {string} label - Nombre que se muestra.
   * @property {string} category - Categoría del método.
   * @property {string[]} exports - Nombres con los que se busca la función en la librería.
   * @property {string} description - Descripción breve.
   * @property {CampoMetodo[]} fields - Campos del formulario.
   */

  /** @type {MetodoPlayground[]} */
  const methods = [
    {
      id: "biseccion",
      label: "Bisección",
      category: "Ecuaciones no lineales",
      exports: ["biseccion"],
      description: "Método de intervalo para encontrar una raíz de f(x).",
      fields: [
        { name: "f", label: "f(x)", type: "expression", value: "x^3 - x - 2" },
        { name: "a", label: "a", type: "number", value: "1" },
        { name: "b", label: "b", type: "number", value: "2" },
        { name: "tolerancia", label: "Tolerancia", type: "number", value: "0.0001" },
        { name: "maxIteraciones", label: "Máx. iteraciones", type: "number", value: "50" }
      ]
    },
    {
      id: "newton",
      label: "Newton-Raphson",
      category: "Ecuaciones no lineales",
      exports: ["newtonRaphson"],
      description: "Método abierto que usa f(x), su derivada y un valor inicial.",
      fields: [
        { name: "f", label: "f(x)", type: "expression", value: "x^2 - 2" },
        { name: "df", label: "f'(x)", type: "expression", value: "2*x" },
        { name: "x0", label: "x0", type: "number", value: "1" },
        { name: "tolerancia", label: "Tolerancia", type: "number", value: "0.0001" },
        { name: "maxIteraciones", label: "Máx. iteraciones", type: "number", value: "50" }
      ]
    },
    {
      id: "secante",
      label: "Secante",
      category: "Ecuaciones no lineales",
      exports: ["secante"],
      description: "Método abierto que aproxima la raíz usando dos valores iniciales.",
      fields: [
        { name: "f", label: "f(x)", type: "expression", value: "x^3 - x - 2" },
        { name: "x0", label: "x0", type: "number", value: "1" },
        { name: "x1", label: "x1", type: "number", value: "2" },
        { name: "tolerancia", label: "Tolerancia", type: "number", value: "0.0001" },
        { name: "maxIteraciones", label: "Máx. iteraciones", type: "number", value: "50" }
      ]
    },
    {
      id: "gauss",
      label: "Eliminación Gaussiana",
      category: "Sistemas lineales",
      exports: ["gauss"],
      description: "Resuelve un sistema lineal Ax = b.",
      fields: [
        { name: "matriz", label: "Matriz A", type: "json", wide: true, value: "[[2,1,-1],[-3,-1,2],[-2,1,2]]" },
        { name: "vector", label: "Vector b", type: "json", wide: true, value: "[8,-11,-3]" }
      ]
    },
    {
      id: "horner",
      label: "Horner",
      category: "Polinomios",
      exports: ["evaluarHorner"],
      description: "Evalúa un polinomio en un punto usando el esquema de Horner.",
      fields: [
        { name: "coeficientes", label: "Coeficientes", type: "json", wide: true, value: "[2,-6,2,-1]" },
        { name: "x", label: "x", type: "number", value: "3" }
      ]
    },
    {
      id: "trapecio",
      label: "Regla del Trapecio",
      category: "Integración numérica",
      exports: ["trapecio"],
      description: "Aproxima una integral definida con la regla del trapecio.",
      fields: [
        { name: "f", label: "f(x)", type: "expression", value: "x^2" },
        { name: "a", label: "a", type: "number", value: "0" },
        { name: "b", label: "b", type: "number", value: "2" },
        { name: "n", label: "Subintervalos", type: "number", value: "10" }
      ]
    },
    {
      id: "eulerMejorado",
      label: "Euler mejorado",
      category: "Ecuaciones diferenciales",
      exports: ["eulerMejorado"],
      description: "Aproxima la solución de una EDO de primer orden y' = f(x, y).",
      fields: [
        { name: "f", label: "f(x, y)", type: "expression", value: "x + y" },
        { name: "x0", label: "x0", type: "number", value: "0" },
        { name: "y0", label: "y0", type: "number", value: "1" },
        { name: "h", label: "Paso h", type: "number", value: "0.1" },
        { name: "n", label: "Pasos", type: "number", value: "10" }
      ]
    }
  ];

  /**
   * Funciones que no dependen del DOM, publicadas para usarlas desde otros scripts.
   */
  const api = {
    methods,
    normalizeExpression,
    compileExpression,
    callWithFallbacks,
    extractIterations
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (typeof window !== "undefined") {
    window.ChuspaNumericPlayground = api;
  }

  // Sin document (por ejemplo, al importarlo fuera del navegador) no se arma la interfaz.
  if (typeof document === "undefined") return;

  const methodSelect = document.getElementById("method-select");
  const methodDescription = document.getElementById("method-description");
  const paramForm = document.getElementById("param-form");
  const runButton = document.getElementById("run-button");
  const exampleButton = document.getElementById("example-button");
  const rawOutput = document.getElementById("raw-output");
  const table = document.getElementById("result-table");
  const bundleStatus = document.getElementById("bundle-status");

  /**
   * Devuelve los objetos globales donde puede estar cargada la librería.
   *
   * @returns {Object[]} Objetos de window que existen (ChuspaNumeric y variantes).
   */
  function getLibraryRoots() {
    return [
      window.ChuspaNumeric,
      window.chuspanumeric,
      window.ChuspaNumericMath,
      window.chuspanumericMath,
      window.ChuspaNumericJS,
      window.chuspanumericjs
    ].filter(Boolean);
  }

  /**
   * Muestra si el bundle UMD de la librería está cargado.
   *
   * @returns {void}
   */
  function updateBundleStatus() {
    const roots = getLibraryRoots();

    if (roots.length > 0) {
      bundleStatus.textContent = "Bundle UMD cargado correctamente desde ../dist/chuspanumeric.umd.js.";
      bundleStatus.className = "status ok";
    } else {
      bundleStatus.textContent = "No se detectó el bundle UMD. Verifica que exista dist/chuspanumeric.umd.js.";
      bundleStatus.className = "status error";
    }
  }

  /**
   * Convierte la notación de potencia ^ en el operador ** de JavaScript.
   *
   * @param {string} expression - Expresión escrita por el usuario.
   * @returns {string} Expresión normalizada.
   */
  function normalizeExpression(expression) {
    return String(expression).replace(/\^/g, "**");
  }

  /**
   * Compila una expresión en x e y a una función, con sin, cos, exp, log, sqrt, pi, e, etc.
   *
   * @param {string} expression - Expresión, por ejemplo 'x^2 - 2' o 'x + y'.
   * @returns {(x: number, y?: number) => number} Función que evalúa la expresión.
   */
  function compileExpression(expression) {
    const normalized = normalizeExpression(expression);

    return new Function(
      "x",
      "y",
      `
      "use strict";
      const sin = Math.sin;
      const cos = Math.cos;
      const tan = Math.tan;
      const exp = Math.exp;
      const log = Math.log;
      const sqrt = Math.sqrt;
      const abs = Math.abs;
      const pow = Math.pow;
      const pi = Math.PI;
      const e = Math.E;
      return (${normalized});
      `
    );
  }

  /**
   * Busca en la librería cargada una función con alguno de los nombres dados.
   *
   * @param {string[]} names - Nombres posibles de la función (sin distinguir mayúsculas).
   * @returns {Function|null} La primera función encontrada, o null.
   */
  function findExport(names) {
    const roots = getLibraryRoots();
    const lowerNames = names.map((name) => name.toLowerCase());

    for (const root of roots) {
      const found = findInObject(root, lowerNames, new Set(), 0);
      if (found) return found;
    }

    return null;
  }

  /**
   * Búsqueda recursiva de una función por nombre dentro de un objeto.
   *
   * @param {Object} obj - Objeto donde buscar.
   * @param {string[]} lowerNames - Nombres buscados, en minúsculas.
   * @param {Set<Object>} visited - Objetos ya visitados (evita ciclos).
   * @param {number} depth - Profundidad actual; se corta pasando 4.
   * @returns {Function|null} La función encontrada, o null.
   */
  function findInObject(obj, lowerNames, visited, depth) {
    if (!obj || visited.has(obj) || depth > 4) return null;
    visited.add(obj);

    for (const key of Object.keys(obj)) {
      if (lowerNames.includes(key.toLowerCase()) && typeof obj[key] === "function") {
        return obj[key];
      }
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (value && typeof value === "object") {
        const found = findInObject(value, lowerNames, visited, depth + 1);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Llena el select con los métodos disponibles.
   *
   * @returns {void}
   */
  function populateMethods() {
    methods.forEach((method) => {
      const option = document.createElement("option");
      option.value = method.id;
      option.textContent = `${method.label} — ${method.category}`;
      methodSelect.appendChild(option);
    });
  }

  /**
   * Devuelve el método elegido en el select.
   *
   * @returns {MetodoPlayground|undefined} El método, o undefined si no hay ninguno.
   */
  function currentMethod() {
    return methods.find((method) => method.id === methodSelect.value);
  }

  /**
   * Dibuja los campos del formulario del método elegido, con sus valores de ejemplo.
   *
   * @returns {void}
   */
  function renderFields() {
    const method = currentMethod();
    methodDescription.textContent = method.description;
    paramForm.innerHTML = "";

    method.fields.forEach((field) => {
      const wrapper = document.createElement("div");
      wrapper.className = field.wide ? "field wide" : "field";

      const label = document.createElement("label");
      label.setAttribute("for", field.name);
      label.textContent = field.label;

      const input = field.type === "json"
        ? document.createElement("textarea")
        : document.createElement("input");

      input.id = field.name;
      input.name = field.name;
      input.value = field.value;

      if (field.type === "number") {
        input.type = "number";
        input.step = "any";
      } else if (field.type === "expression") {
        input.type = "text";
      }

      wrapper.appendChild(label);
      wrapper.appendChild(input);
      paramForm.appendChild(wrapper);
    });
  }

  /**
   * Lee los valores del formulario según el tipo de cada campo: number como número,
   * json parseado y expression compilada a función (más el texto en nombreTexto).
   *
   * @param {MetodoPlayground} method - Método cuyos campos se leen.
   * @returns {Object} Valores por nombre de campo.
   * @throws {SyntaxError} Si un campo json no es JSON válido.
   */
  function readValues(method) {
    const values = {};

    method.fields.forEach((field) => {
      const element = document.getElementById(field.name);
      const value = element.value.trim();

      if (field.type === "number") {
        values[field.name] = Number(value);
      } else if (field.type === "json") {
        values[field.name] = JSON.parse(value);
      } else if (field.type === "expression") {
        values[field.name] = compileExpression(value);
        values[`${field.name}Texto`] = value;
      } else {
        values[field.name] = value;
      }
    });

    return values;
  }

  /**
   * Ejecuta el método de la librería probando las firmas habituales
   * (objeto de parámetros o argumentos posicionales) hasta que una funcione.
   *
   * @param {MetodoPlayground} method - Método elegido.
   * @param {Function} fn - Función de la librería.
   * @param {Object} p - Valores leídos del formulario.
   * @returns {*} Lo que devuelve la función de la librería.
   * @throws {Error} Si ninguna firma funciona.
   */
  function callWithFallbacks(method, fn, p) {
    const max = p.maxIteraciones;
    const tol = p.tolerancia;

    const attempts = {
      biseccion: [
        () => fn({ f: p.f, funcion: p.f, a: p.a, b: p.b, tolerancia: tol, maxIteraciones: max }),
        () => fn(p.f, p.a, p.b, tol, max)
      ],
      newton: [
        () => fn({ f: p.f, funcion: p.f, df: p.df, derivada: p.df, x0: p.x0, tolerancia: tol, maxIteraciones: max }),
        () => fn(p.f, p.df, p.x0, tol, max)
      ],
      secante: [
        () => fn({ f: p.f, funcion: p.f, x0: p.x0, x1: p.x1, tolerancia: tol, maxIteraciones: max }),
        () => fn(p.f, p.x0, p.x1, tol, max)
      ],
      gauss: [
        () => fn({ matriz: p.matriz, vector: p.vector, A: p.matriz, b: p.vector }),
        () => fn(p.matriz, p.vector)
      ],
      horner: [
        () => fn({ coeficientes: p.coeficientes, coefficients: p.coeficientes, x: p.x }),
        () => fn(p.coeficientes, p.x)
      ],
      trapecio: [
        () => fn({ f: p.f, funcion: p.f, a: p.a, b: p.b, n: p.n, subintervalos: p.n }),
        () => fn(p.f, p.a, p.b, p.n)
      ],
      eulerMejorado: [
        () => fn({ f: p.f, funcion: p.f, x0: p.x0, y0: p.y0, h: p.h, n: p.n, pasos: p.n }),
        () => fn(p.f, p.x0, p.y0, p.h, p.n)
      ]
    };

    let lastError = null;

    for (const attempt of attempts[method.id] || []) {
      try {
        return attempt();
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("No se pudo ejecutar el método seleccionado.");
  }

  /**
   * Obtiene la tabla de iteraciones de un resultado, sea cual sea su forma.
   *
   * @param {*} result - Resultado devuelto por un método.
   * @returns {Object[]} Lista de iteraciones, o [] si no hay.
   */
  function extractIterations(result) {
    if (Array.isArray(result)) return result;

    const keys = [
      "iteraciones",
      "iterations",
      "tabla",
      "table",
      "historial",
      "pasos",
      "steps"
    ];

    for (const key of keys) {
      if (result && Array.isArray(result[key])) return result[key];
    }

    if (result && result.resultado) {
      for (const key of keys) {
        if (Array.isArray(result.resultado[key])) return result.resultado[key];
      }
    }

    return [];
  }

  /**
   * Muestra el resultado completo como JSON (las funciones aparecen como [Function]).
   *
   * @param {*} result - Resultado a mostrar.
   * @returns {void}
   */
  function renderRaw(result) {
    rawOutput.textContent = JSON.stringify(
      result,
      function (_key, value) {
        if (typeof value === "function") return "[Function]";
        return value;
      },
      2
    );
  }

  /**
   * Dibuja la tabla de iteraciones (una columna por clave de la primera fila).
   *
   * @param {Object[]} iterations - Filas de la tabla.
   * @returns {void}
   */
  function renderTable(iterations) {
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");

    thead.innerHTML = "";
    tbody.innerHTML = "";

    if (!iterations.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");

      cell.textContent = "El resultado no incluye una tabla de iteraciones.";
      row.appendChild(cell);
      tbody.appendChild(row);

      return;
    }

    const columns = Object.keys(iterations[0]);
    const headerRow = document.createElement("tr");

    columns.forEach((column) => {
      const th = document.createElement("th");
      th.textContent = column;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    iterations.forEach((item) => {
      const row = document.createElement("tr");

      columns.forEach((column) => {
        const cell = document.createElement("td");
        const value = item[column];

        cell.textContent = typeof value === "object"
          ? JSON.stringify(value)
          : String(value);

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });
  }

  /**
   * Ejecuta el método elegido con los valores del formulario y muestra el resultado.
   * Si algo falla, muestra el error en la salida.
   *
   * @returns {void}
   */
  function runSelectedMethod() {
    const method = currentMethod();
    const fn = findExport(method.exports);

    if (!fn) {
      const names = method.exports.join(", ");
      rawOutput.textContent = `No se encontró el método exportado para "${method.label}". Nombres buscados: ${names}.`;
      renderTable([]);
      return;
    }

    try {
      const values = readValues(method);
      const result = callWithFallbacks(method, fn, values);

      renderRaw(result);
      renderTable(extractIterations(result));
    } catch (error) {
      rawOutput.textContent = error && error.stack ? error.stack : String(error);
      renderTable([]);
    }
  }

  /**
   * Vuelve a cargar los valores de ejemplo del método elegido y limpia la salida.
   *
   * @returns {void}
   */
  function loadExample() {
    renderFields();
    rawOutput.textContent = "Ejemplo cargado. Presiona Ejecutar.";
    renderTable([]);
  }

  methodSelect.addEventListener("change", loadExample);
  runButton.addEventListener("click", runSelectedMethod);
  exampleButton.addEventListener("click", loadExample);

  populateMethods();
  renderFields();
  updateBundleStatus();
})();

/**
 * Carga comparacion.js, que agrega el panel de comparación lado a lado.
 * Solo corre en el navegador.
 *
 * @returns {void}
 */
(function cargarComparacionLadoALado() {
  if (typeof document === "undefined") return;

  const script = document.createElement('script');
  script.src = './comparacion.js';
  script.defer = true;
  document.body.appendChild(script);
})();
