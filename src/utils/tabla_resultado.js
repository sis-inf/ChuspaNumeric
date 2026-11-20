/**
 * @module src/utils/tabla_resultado
 * Utilidades para formatear tablas de iteraciones de métodos numéricos en texto plano.
 */

/**
 * @typedef {Object} OpcionesTablaIteraciones
 * @property {number} [anchoColumna=12] Ancho mínimo de cada columna en caracteres.
 * @property {number} [precision=6] Cantidad de decimales para valores numéricos.
 * @property {boolean} [cabecera=true] Indica si se debe incluir la fila de encabezados.
 */

/**
 * Formatea la fila de encabezados de una tabla de iteraciones.
 *
 * @param {string[]} columnas Nombres de las columnas a mostrar.
 * @param {number} anchoColumna Ancho mínimo de cada columna.
 * @returns {string} Línea formateada con los nombres de columna.
 */
function formatearCabeceraTabla(columnas, anchoColumna) {
  return columnas
    .map((col) => col.padEnd(anchoColumna))
    .join(' ');
}

/**
 * Formatea una celda individual según su tipo de dato.
 *
 * @param {unknown} valor Valor contenido en la celda.
 * @param {number} anchoColumna Ancho mínimo de la columna.
 * @param {number} precision Cantidad de decimales si el valor es numérico.
 * @returns {string} Celda formateada y alineada.
 */
function formatearCeldaTabla(valor, anchoColumna, precision) {
  if (typeof valor === 'number') {
    return valor
      .toFixed(precision)
      .padStart(anchoColumna);
  }

  return String(valor ?? '')
    .padEnd(anchoColumna);
}

/**
 * Formatea una fila completa de datos a partir de las columnas definidas.
 *
 * @param {Record<string, unknown>} fila Registro con los valores de cada columna.
 * @param {string[]} columnas Lista ordenada de nombres de columna.
 * @param {number} anchoColumna Ancho mínimo de cada columna.
 * @param {number} precision Cantidad de decimales para valores numéricos.
 * @returns {string} Fila formateada en una sola línea.
 */
function formatearFilaTabla(fila, columnas, anchoColumna, precision) {
  return columnas
    .map((col) => formatearCeldaTabla(fila[col], anchoColumna, precision))
    .join(' ');
}

/**
 * Convierte un arreglo de filas de iteración en una tabla de texto alineada.
 *
 * @param {Array<Record<string, unknown>>} tabla Arreglo de objetos que representan las iteraciones.
 * @param {OpcionesTablaIteraciones} [opciones={}] Opciones de formato de la tabla.
 * @returns {string} Tabla formateada separada por saltos de línea, o cadena vacía si no hay datos.
 */
function formatearTablaIteraciones(tabla, opciones = {}) {
  const {
    anchoColumna = 12,
    precision = 6,
    cabecera = true,
  } = opciones;

  if (!Array.isArray(tabla) || tabla.length === 0) {
    return '';
  }

  const columnas = Object.keys(tabla[0]);
  const resultado = [];

  if (cabecera) {
    resultado.push(formatearCabeceraTabla(columnas, anchoColumna));
  }

  tabla.forEach((fila) => {
    resultado.push(formatearFilaTabla(fila, columnas, anchoColumna, precision));
  });

  return resultado.join('\n');
}

export { formatearTablaIteraciones };

if (typeof globalThis.module !== 'undefined' && globalThis.module.exports) {
  globalThis.module.exports = {
    default: formatearTablaIteraciones,
    formatearTablaIteraciones,
  };
}