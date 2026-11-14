/**
 * @file Comparación lado a lado de dos métodos de búsqueda de raíces del playground.
 *
 * Se carga como script clásico (playground.js lo agrega con un elemento script),
 * por eso no usa export de ESM. Las funciones puras se publican así:
 *   - En el navegador: window.ChuspaNumericComparacion
 *   - En entornos CommonJS (bundlers que definen module): module.exports
 * La interfaz (panel, tabla y gráfica) solo se inicializa si existe document.
 */
/* global window, document, module */
(function () {
  'use strict';

  /**
   * Método de ChuspaNumeric que se puede comparar.
   *
   * @typedef {Object} MetodoComparable
   * @property {string} id - Identificador interno, por ejemplo 'biseccion'.
   * @property {string} label - Nombre que se muestra en la interfaz.
   * @property {string[]} exports - Nombres con los que se busca la función en la librería.
   */

  /**
   * Punto de la serie de error que se grafica.
   *
   * @typedef {Object} PuntoError
   * @property {number} iteracion - Número de iteración, empezando en 1.
   * @property {number} error - Error absoluto en esa iteración.
   */

  /**
   * Parámetros comunes con los que se ejecutan ambos métodos.
   *
   * @typedef {Object} ParametrosComparacion
   * @property {(x: number) => number} f - Función cuya raíz se busca.
   * @property {number} a - Extremo izquierdo del intervalo.
   * @property {number} b - Extremo derecho del intervalo.
   * @property {number} tolerancia - Tolerancia de parada.
   * @property {number} maxIteraciones - Máximo de iteraciones.
   */

  /** @type {MetodoComparable[]} */
  const metodosCompatibles = [
    {
      id: 'biseccion',
      label: 'Bisección',
      exports: ['biseccion', 'bisection', 'metodoBiseccion', 'resolverBiseccion']
    },
    {
      id: 'falsaPosicion',
      label: 'Falsa posición',
      exports: ['falsaPosicion', 'regulaFalsi', 'metodoFalsaPosicion', 'reglaFalsaPosicion']
    }
  ];

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
      if (lowerNames.includes(key.toLowerCase()) && typeof obj[key] === 'function') {
        return obj[key];
      }
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (value && typeof value === 'object') {
        const found = findInObject(value, lowerNames, visited, depth + 1);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Convierte la notación de potencia ^ en el operador ** de JavaScript.
   *
   * @param {string} expression - Expresión escrita por el usuario.
   * @returns {string} Expresión normalizada.
   */
  function normalizeExpression(expression) {
    return String(expression).replace(/\^/g, '**');
  }

  /**
   * Compila una expresión en x a una función, con sin, cos, exp, log, sqrt, pi, e, etc.
   *
   * @param {string} expression - Expresión en x, por ejemplo 'x^3 - x - 2'.
   * @returns {(x: number) => number} Función que evalúa la expresión.
   */
  function compileExpression(expression) {
    const normalized = normalizeExpression(expression);

    return new Function(
      'x',
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
   * Ejecuta un método de la librería probando las dos firmas habituales
   * (objeto de parámetros o argumentos posicionales).
   *
   * @param {MetodoComparable} metodo - Método a ejecutar.
   * @param {ParametrosComparacion} params - Parámetros de entrada.
   * @returns {*} Lo que devuelve el método de la librería.
   * @throws {Error} Si el método no está cargado o ninguna firma funciona.
   */
  function ejecutarMetodo(metodo, params) {
    const fn = findExport(metodo.exports);

    if (!fn) {
      throw new Error(`No se encontró el método exportado: ${metodo.label}`);
    }

    const intentos = [
      () => fn({
        f: params.f,
        funcion: params.f,
        a: params.a,
        b: params.b,
        tolerancia: params.tolerancia,
        maxIteraciones: params.maxIteraciones
      }),
      () => fn(params.f, params.a, params.b, params.tolerancia, params.maxIteraciones)
    ];

    let ultimoError = null;

    for (const intento of intentos) {
      try {
        return intento();
      } catch (error) {
        ultimoError = error;
      }
    }

    throw ultimoError || new Error(`No se pudo ejecutar ${metodo.label}`);
  }

  /**
   * Obtiene la tabla de iteraciones de un resultado, sea cual sea su forma.
   *
   * @param {*} resultado - Resultado devuelto por un método.
   * @returns {Object[]} Lista de iteraciones, o [] si no hay.
   */
  function extraerIteraciones(resultado) {
    if (Array.isArray(resultado)) return resultado;

    const claves = [
      'iteraciones',
      'iterations',
      'tabla',
      'table',
      'historial',
      'pasos',
      'steps'
    ];

    for (const clave of claves) {
      if (resultado && Array.isArray(resultado[clave])) return resultado[clave];
    }

    if (resultado && resultado.resultado) {
      for (const clave of claves) {
        if (Array.isArray(resultado.resultado[clave])) return resultado.resultado[clave];
      }
    }

    return [];
  }

  /**
   * Devuelve el primer valor numérico finito del objeto entre las claves dadas.
   *
   * @param {Object} obj - Objeto donde buscar.
   * @param {string[]} claves - Claves a probar, en orden.
   * @returns {number|null} El valor encontrado, o null.
   */
  function obtenerNumeroDesdeObjeto(obj, claves) {
    if (!obj || typeof obj !== 'object') return null;

    for (const clave of claves) {
      const valor = obj[clave];

      if (typeof valor === 'number' && Number.isFinite(valor)) {
        return valor;
      }
    }

    return null;
  }

  /**
   * Obtiene la aproximación de la raíz en una iteración.
   *
   * @param {Object} iteracion - Fila de la tabla de iteraciones.
   * @returns {number|null} La aproximación, o null si no se encuentra.
   */
  function extraerAproximacion(iteracion) {
    return obtenerNumeroDesdeObjeto(iteracion, [
      'x',
      'xr',
      'xm',
      'c',
      'raiz',
      'aproximacion',
      'aprox',
      'valor',
      'xNuevo',
      'xActual'
    ]);
  }

  /**
   * Obtiene el error reportado en una iteración.
   *
   * @param {Object} iteracion - Fila de la tabla de iteraciones.
   * @returns {number|null} El error, o null si la iteración no lo trae.
   */
  function extraerError(iteracion) {
    return obtenerNumeroDesdeObjeto(iteracion, [
      'error',
      'errorAbsoluto',
      'errorRelativo',
      'errorAproximado',
      'errorEstimado',
      'ea',
      'er'
    ]);
  }

  /**
   * Obtiene el valor final (la raíz) de un resultado, sea cual sea su forma.
   *
   * @param {*} resultado - Resultado devuelto por un método.
   * @returns {number|null} La raíz, o null si no se encuentra.
   */
  function extraerResultadoNumerico(resultado) {
    if (typeof resultado === 'number' && Number.isFinite(resultado)) {
      return resultado;
    }

    if (resultado && typeof resultado.resultado === 'number') {
      return resultado.resultado;
    }

    if (resultado && typeof resultado.raiz === 'number') {
      return resultado.raiz;
    }

    if (resultado && resultado.resultado && typeof resultado.resultado === 'object') {
      return obtenerNumeroDesdeObjeto(resultado.resultado, [
        'x',
        'xr',
        'raiz',
        'aproximacion',
        'valor'
      ]);
    }

    return null;
  }

  /**
   * Arma la serie de error por iteración. Si una iteración no trae el error,
   * lo calcula como |aproximación - valor final|.
   *
   * @param {*} resultado - Resultado devuelto por un método.
   * @returns {PuntoError[]} Serie de puntos (iteración, error absoluto).
   */
  function construirSerieError(resultado) {
    const iteraciones = extraerIteraciones(resultado);
    const valorFinal = extraerResultadoNumerico(resultado);
    const serie = [];

    iteraciones.forEach((iteracion, index) => {
      let error = extraerError(iteracion);

      if (error === null) {
        const aproximacion = extraerAproximacion(iteracion);

        if (aproximacion !== null && valorFinal !== null) {
          error = Math.abs(aproximacion - valorFinal);
        }
      }

      if (typeof error === 'number' && Number.isFinite(error)) {
        serie.push({
          iteracion: index + 1,
          error: Math.abs(error)
        });
      }
    });

    return serie;
  }

  /**
   * Dibuja en el contenedor la tabla de iteraciones de un resultado.
   *
   * @param {HTMLElement} contenedor - Elemento donde se dibuja la tabla.
   * @param {string} titulo - Título que se muestra arriba de la tabla.
   * @param {*} resultado - Resultado devuelto por un método.
   * @returns {void}
   */
  function renderizarTabla(contenedor, titulo, resultado) {
    const iteraciones = extraerIteraciones(resultado);

    contenedor.innerHTML = '';

    const heading = document.createElement('h3');
    heading.textContent = titulo;
    contenedor.appendChild(heading);

    if (!iteraciones.length) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'El resultado no incluye tabla de iteraciones.';
      contenedor.appendChild(mensaje);
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'comparison-table-wrapper';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const columnas = Object.keys(iteraciones[0]);
    const headerRow = document.createElement('tr');

    columnas.forEach((columna) => {
      const th = document.createElement('th');
      th.textContent = columna;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    iteraciones.forEach((item) => {
      const row = document.createElement('tr');

      columnas.forEach((columna) => {
        const cell = document.createElement('td');
        const valor = item[columna];

        cell.textContent =
          valor && typeof valor === 'object' ? JSON.stringify(valor) : String(valor);

        row.appendChild(cell);
      });

      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(table);
    contenedor.appendChild(wrapper);
  }

  /**
   * Dibuja en el canvas las dos series de error superpuestas.
   *
   * @param {HTMLCanvasElement} canvas - Canvas donde se dibuja.
   * @param {PuntoError[]} serieA - Serie del método A (azul).
   * @param {PuntoError[]} serieB - Serie del método B (rojo).
   * @param {string} etiquetaA - Nombre del método A.
   * @param {string} etiquetaB - Nombre del método B.
   * @returns {void}
   */
  function dibujarGrafica(canvas, serieA, serieB, etiquetaA, etiquetaB) {
    const ctx = canvas.getContext('2d');
    const width = canvas.clientWidth || 760;
    const height = 320;
    const padding = 48;

    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '13px Arial';

    const puntos = [...serieA, ...serieB];

    if (!puntos.length) {
      ctx.fillText('No se encontraron datos de error para graficar.', 24, 40);
      return;
    }

    const maxIteracion = Math.max(...puntos.map((punto) => punto.iteracion), 1);
    const maxError = Math.max(...puntos.map((punto) => punto.error), 1);

    /**
     * @param {number} iteracion - Número de iteración.
     * @returns {number} Coordenada x en el canvas.
     */
    function escalarX(iteracion) {
      if (maxIteracion === 1) return padding;
      return padding + ((iteracion - 1) / (maxIteracion - 1)) * (width - padding * 2);
    }

    /**
     * @param {number} error - Valor de error.
     * @returns {number} Coordenada y en el canvas.
     */
    function escalarY(error) {
      return height - padding - (error / maxError) * (height - padding * 2);
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.fillText('Error', 12, padding - 12);
    ctx.fillText('Iteración', width - padding - 50, height - 14);
    ctx.fillText(`Máx. error: ${maxError.toExponential(2)}`, padding, padding - 12);

    dibujarLinea(ctx, serieA, escalarX, escalarY, '#2563eb');
    dibujarLinea(ctx, serieB, escalarX, escalarY, '#dc2626');

    ctx.fillStyle = '#2563eb';
    ctx.fillText(etiquetaA, padding + 10, height - 18);

    ctx.fillStyle = '#dc2626';
    ctx.fillText(etiquetaB, padding + 180, height - 18);
  }

  /**
   * Dibuja una serie como línea con puntos.
   *
   * @param {CanvasRenderingContext2D} ctx - Contexto 2D del canvas.
   * @param {PuntoError[]} serie - Puntos a dibujar.
   * @param {(iteracion: number) => number} escalarX - Convierte iteración a coordenada x.
   * @param {(error: number) => number} escalarY - Convierte error a coordenada y.
   * @param {string} color - Color de la línea y los puntos.
   * @returns {void}
   */
  function dibujarLinea(ctx, serie, escalarX, escalarY, color) {
    if (!serie.length) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    serie.forEach((punto, index) => {
      const x = escalarX(punto.iteracion);
      const y = escalarY(punto.error);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    serie.forEach((punto) => {
      const x = escalarX(punto.iteracion);
      const y = escalarY(punto.error);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Agrega al documento los estilos del panel de comparación.
   *
   * @returns {void}
   */
  function inyectarEstilos() {
    const style = document.createElement('style');
    style.textContent = `
      .comparison-panel {
        margin-top: 20px;
      }

      .comparison-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
      }

      .comparison-grid .wide {
        grid-column: 1 / -1;
      }

      .comparison-actions {
        margin-top: 18px;
      }

      .comparison-status {
        margin-top: 12px;
        font-weight: 700;
      }

      .comparison-chart {
        width: 100%;
        height: 320px;
        border: 1px solid #d9deea;
        border-radius: 12px;
        background: #ffffff;
        margin-top: 16px;
      }

      .comparison-tables {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 16px;
        margin-top: 20px;
      }

      .comparison-table-wrapper {
        overflow: auto;
        max-height: 360px;
      }

      @media (max-width: 720px) {
        .comparison-grid,
        .comparison-tables {
          grid-template-columns: 1fr;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Agrega un método como opción de un select.
   *
   * @param {HTMLSelectElement} select - Select donde se agrega la opción.
   * @param {MetodoComparable} metodo - Método a agregar.
   * @returns {void}
   */
  function crearOpcionMetodo(select, metodo) {
    const option = document.createElement('option');
    option.value = metodo.id;
    option.textContent = metodo.label;
    select.appendChild(option);
  }

  /**
   * Busca un método compatible por su id.
   *
   * @param {string} id - Id del método, por ejemplo 'falsaPosicion'.
   * @returns {MetodoComparable|undefined} El método, o undefined si no existe.
   */
  function obtenerMetodo(id) {
    return metodosCompatibles.find((metodo) => metodo.id === id);
  }

  /**
   * Crea el panel de comparación en la página y conecta el botón.
   *
   * @returns {void}
   */
  function inicializarComparacion() {
    inyectarEstilos();

    const app = document.querySelector('.app') || document.body;
    const panel = document.createElement('section');

    panel.className = 'panel comparison-panel';
    panel.innerHTML = `
      <h2>Comparación lado a lado</h2>
      <p class="description">
        Selecciona dos métodos compatibles de búsqueda de raíces, usa los mismos parámetros
        de entrada y compara la velocidad de convergencia mediante sus tablas de iteraciones
        y una gráfica superpuesta del error.
      </p>

      <div class="comparison-grid">
        <div class="field">
          <label for="comparison-method-a">Método A</label>
          <select id="comparison-method-a"></select>
        </div>

        <div class="field">
          <label for="comparison-method-b">Método B</label>
          <select id="comparison-method-b"></select>
        </div>

        <div class="field wide">
          <label for="comparison-function">f(x)</label>
          <input id="comparison-function" type="text" value="x^3 - x - 2" />
        </div>

        <div class="field">
          <label for="comparison-a">a</label>
          <input id="comparison-a" type="number" step="any" value="1" />
        </div>

        <div class="field">
          <label for="comparison-b">b</label>
          <input id="comparison-b" type="number" step="any" value="2" />
        </div>

        <div class="field">
          <label for="comparison-tolerance">Tolerancia</label>
          <input id="comparison-tolerance" type="number" step="any" value="0.0001" />
        </div>

        <div class="field">
          <label for="comparison-max">Máx. iteraciones</label>
          <input id="comparison-max" type="number" step="1" value="50" />
        </div>
      </div>

      <div class="comparison-actions">
        <button id="comparison-run-button" type="button">Comparar métodos</button>
      </div>

      <p id="comparison-status" class="comparison-status"></p>

      <canvas id="comparison-chart" class="comparison-chart"></canvas>

      <div class="comparison-tables">
        <div id="comparison-table-a"></div>
        <div id="comparison-table-b"></div>
      </div>
    `;

    app.appendChild(panel);

    const selectA = document.getElementById('comparison-method-a');
    const selectB = document.getElementById('comparison-method-b');

    metodosCompatibles.forEach((metodo) => {
      crearOpcionMetodo(selectA, metodo);
      crearOpcionMetodo(selectB, metodo);
    });

    selectB.value = 'falsaPosicion';

    document
      .getElementById('comparison-run-button')
      .addEventListener('click', ejecutarComparacion);
  }

  /**
   * Lee el formulario, ejecuta los dos métodos y muestra tablas y gráfica.
   * Si algo falla, muestra el mensaje de error en el estado.
   *
   * @returns {void}
   */
  function ejecutarComparacion() {
    const status = document.getElementById('comparison-status');
    const canvas = document.getElementById('comparison-chart');
    const tableA = document.getElementById('comparison-table-a');
    const tableB = document.getElementById('comparison-table-b');

    try {
      const metodoA = obtenerMetodo(document.getElementById('comparison-method-a').value);
      const metodoB = obtenerMetodo(document.getElementById('comparison-method-b').value);

      if (!metodoA || !metodoB) {
        throw new Error('Selecciona dos métodos válidos.');
      }

      if (metodoA.id === metodoB.id) {
        throw new Error('Selecciona dos métodos distintos para comparar.');
      }

      const params = {
        f: compileExpression(document.getElementById('comparison-function').value),
        a: Number(document.getElementById('comparison-a').value),
        b: Number(document.getElementById('comparison-b').value),
        tolerancia: Number(document.getElementById('comparison-tolerance').value),
        maxIteraciones: Number(document.getElementById('comparison-max').value)
      };

      const resultadoA = ejecutarMetodo(metodoA, params);
      const resultadoB = ejecutarMetodo(metodoB, params);

      const serieA = construirSerieError(resultadoA);
      const serieB = construirSerieError(resultadoB);

      renderizarTabla(tableA, metodoA.label, resultadoA);
      renderizarTabla(tableB, metodoB.label, resultadoB);
      dibujarGrafica(canvas, serieA, serieB, metodoA.label, metodoB.label);

      status.textContent = `Comparación ejecutada: ${metodoA.label} vs ${metodoB.label}.`;
    } catch (error) {
      status.textContent = error && error.message ? error.message : String(error);
      tableA.innerHTML = '';
      tableB.innerHTML = '';
      dibujarGrafica(canvas, [], [], '', '');
    }
  }

  /**
   * Funciones que no dependen del DOM, publicadas para usarlas desde otros scripts.
   */
  const api = {
    metodosCompatibles,
    normalizeExpression,
    compileExpression,
    ejecutarMetodo,
    extraerIteraciones,
    extraerAproximacion,
    extraerError,
    extraerResultadoNumerico,
    construirSerieError,
    obtenerMetodo
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }

  if (typeof window !== 'undefined') {
    window.ChuspaNumericComparacion = api;
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', inicializarComparacion);
    } else {
      inicializarComparacion();
    }
  }
})();
