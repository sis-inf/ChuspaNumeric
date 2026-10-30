/**
 * exportar_markdown.js
 * ChuspaNumeric — Librería de Métodos Numéricos
 *
 * Genera un reporte en formato Markdown a partir del resultado
 * de cualquier método numérico de ChuspaNumeric, listo para pegar en
 * un PR, informe o entrega académica.
 */

/**
 * Genera una tabla Markdown a partir del array de iteraciones.
 *
 * @param {Object[]} iteraciones - Array de objetos con los datos de cada iteración.
 * @returns {string} Tabla en formato Markdown.
 */
function _generarTablaMarkdown(iteraciones) {
  if (!Array.isArray(iteraciones) || iteraciones.length === 0) {
    return '_No hay iteraciones registradas._';
  }

  const columnas = Object.keys(iteraciones[0]);

  const encabezado = '| ' + columnas.join(' | ') + ' |';
  const separador  = '| ' + columnas.map(() => '---').join(' | ') + ' |';

  const filas = iteraciones.map((iter) => {
    const valores = columnas.map((col) => {
      const val = iter[col];
      if (typeof val === 'number') return val.toFixed(6);
      if (val === null || val === undefined) return '—';
      if (Array.isArray(val)) return `[${val.map(v => typeof v === 'number' ? v.toFixed(4) : v).join(', ')}]`;
      return String(val);
    });
    return '| ' + valores.join(' | ') + ' |';
  });

  return [encabezado, separador, ...filas].join('\n');
}

/**
 * Formatea el resultado final para mostrarlo en el reporte.
 *
 * @param {*} resultado - Resultado del método (número, array u objeto).
 * @returns {string} Resultado formateado.
 */
function _formatearResultado(resultado) {
  if (resultado === null || resultado === undefined) return '—';

  if (typeof resultado === 'number') {
    return resultado.toFixed(10);
  }

  if (Array.isArray(resultado)) {
    return resultado
      .map((v, i) => `- x[${i}] = ${typeof v === 'number' ? v.toFixed(10) : v}`)
      .join('\n');
  }

  if (typeof resultado === 'object') {
    return Object.entries(resultado)
      .map(([k, v]) => `- **${k}**: ${typeof v === 'number' ? v.toFixed(10) : JSON.stringify(v)}`)
      .join('\n');
  }

  return String(resultado);
}

/**
 * Genera un reporte Markdown estructurado a partir del resultado
 * de un método numérico de ChuspaNumeric.
 *
 * @param {Object} resultado              - Objeto resultado siguiendo el contrato de ChuspaNumeric.
 * @param {*}      resultado.resultado    - Valor o vector solución.
 * @param {Array}  resultado.iteraciones  - Historial de iteraciones.
 * @param {boolean} resultado.convergio   - Indica si el método convergió.
 * @param {string}  resultado.mensaje     - Mensaje informativo.
 * @param {Object}  resultado.meta        - Metadatos (metodo, parametros, tiempo_ms).
 * @param {Object}  [opciones={}]         - Opciones de configuración.
 * @param {string}  [opciones.titulo]     - Título del reporte. Por defecto usa meta.metodo.
 * @returns {string} Documento Markdown completo.
 *
 * @example
 * import { biseccion } from 'chuspanumeric';
 * import { exportarMarkdown } from 'chuspanumeric';
 *
 * const res = biseccion({ f: x => x**2 - 4, a: 0, b: 3 });
 * const md  = exportarMarkdown(res, { titulo: 'Reporte Bisección' });
 * console.log(md);
 */
function exportarMarkdown(resultado, opciones = {}) {
  if (!resultado || typeof resultado !== 'object') {
    throw new Error('exportarMarkdown: resultado debe ser un objeto válido de ChuspaNumeric.');
  }

  const {
    resultado: valor,
    iteraciones = [],
    convergio   = false,
    mensaje     = '',
    meta        = {},
  } = resultado;

  const {
    metodo     = 'método',
    parametros = {},
    tiempo_ms  = 0,
  } = meta;

  const titulo = opciones.titulo || `Reporte — ${metodo}`;

  // Sección de parámetros de entrada
  const seccionParametros = Object.keys(parametros).length > 0
    ? Object.entries(parametros)
        .map(([k, v]) => {
          if (typeof v === 'function') return `| \`${k}\` | _(función)_ |`;
          if (Array.isArray(v)) return `| \`${k}\` | \`[${v}]\` |`;
          return `| \`${k}\` | \`${v}\` |`;
        })
        .join('\n')
    : '| — | — |';

  // Construir el documento Markdown
  const lineas = [
    `# ${titulo}`,
    '',
    '## Información general',
    '',
    `| Campo | Valor |`,
    `| --- | --- |`,
    `| **Método** | \`${metodo}\` |`,
    `| **Convergió** | ${convergio ? '✅ Sí' : '❌ No'} |`,
    `| **Iteraciones realizadas** | ${iteraciones.length} |`,
    `| **Tiempo de ejecución** | ${tiempo_ms.toFixed(3)} ms |`,
    '',
    '## Parámetros de entrada',
    '',
    '| Parámetro | Valor |',
    '| --- | --- |',
    seccionParametros,
    '',
    '## Resultado',
    '',
    _formatearResultado(valor),
    '',
  ];

  if (mensaje) {
    lineas.push('## Mensaje', '', `> ${mensaje}`, '');
  }

  lineas.push(
    '## Tabla de iteraciones',
    '',
    _generarTablaMarkdown(iteraciones),
    '',
    '---',
    '',
    `_Reporte generado por ChuspaNumeric — ${new Date().toISOString()}_`,
  );

  return lineas.join('\n');
}

export { exportarMarkdown };