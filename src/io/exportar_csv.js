import { writeFileSync } from 'node:fs';

/**
 * Opciones de exportación a CSV.
 *
 * @typedef {Object} OpcionesCSV
 * @property {string} [separador=','] - Separador de columnas.
 * @property {boolean} [encabezado=true] - Indica si se incluye la fila de encabezado.
 * @property {number} [precision=6] - Decimales para valores numéricos.
 */

/**
 * Formatea un valor individual como celda CSV. Los valores `null` y
 * `undefined` se convierten en cadena vacía; los números se redondean a
 * `precision` decimales; y el texto que contiene el separador, comillas o
 * saltos de línea se encierra entre comillas dobles (escapando las internas).
 *
 * @private
 * @param {*} valor - Valor a formatear.
 * @param {string} separador - Separador de columnas en uso.
 * @param {number} precision - Decimales para valores numéricos.
 * @returns {string} Texto listo para insertarse como celda CSV.
 */
function formatearValorCSV(valor, separador, precision) {
  if (valor === null || valor === undefined) {
    return '';
  }

  const valorFormateado =
    typeof valor === 'number' ? Number(valor.toFixed(precision)) : valor;

  const texto = String(valorFormateado);
  const requiereEscape =
    texto.includes(separador) ||
    texto.includes('"') ||
    texto.includes('\n') ||
    texto.includes('\r');

  if (!requiereEscape) {
    return texto;
  }

  return `"${texto.replace(/"/g, '""')}"`;
}

/**
 * Convierte una tabla de objetos a formato CSV.
 *
 * Las columnas se toman de las claves de la primera fila. Si `tabla` no es un
 * arreglo o está vacío, devuelve una cadena vacía.
 *
 * @param {Object[]} tabla - Filas a exportar.
 * @param {OpcionesCSV} [opciones={}] - Opciones de exportación.
 * @returns {string} Contenido CSV generado (filas separadas por `\n`).
 *
 * @example
 * exportarCSV([{ x: 1, y: 2.5 }, { x: 2, y: 3.5 }]);
 * // 'x,y\n1,2.5\n2,3.5'
 */
export function exportarCSV(tabla, opciones = {}) {
  const { separador = ',', encabezado = true, precision = 6 } = opciones;

  if (!Array.isArray(tabla) || tabla.length === 0) {
    return '';
  }

  const columnas = Object.keys(tabla[0]);
  const lineas = [];

  if (encabezado) {
    lineas.push(columnas.join(separador));
  }

  for (const fila of tabla) {
    const valores = columnas.map((columna) =>
      formatearValorCSV(fila[columna], separador, precision)
    );

    lineas.push(valores.join(separador));
  }

  return lineas.join('\n');
}

/**
 * Exporta una tabla a un archivo CSV.
 *
 * Compatibilidad con Deno:
 * este módulo utiliza el especificador `node:fs`, compatible con Node.js y con
 * la capa de compatibilidad de Deno. No requiere import map, pero en Deno la
 * escritura de archivos requiere ejecutar con permisos, por ejemplo:
 * `deno run --allow-write archivo.js`.
 *
 * @param {Object[]} tabla - Filas a exportar.
 * @param {string} ruta - Ruta del archivo destino.
 * @param {OpcionesCSV} [opciones={}] - Opciones de exportación.
 * @returns {string} Contenido CSV generado.
 * @throws {Error} Si `ruta` no es una cadena no vacía.
 *
 * @example
 * exportarCSVArchivo([{ x: 1, y: 2 }], './salida.csv', { separador: ';' });
 */
export function exportarCSVArchivo(tabla, ruta, opciones = {}) {
  if (typeof ruta !== 'string' || ruta.length === 0) {
    throw new Error('La ruta del archivo CSV debe ser una cadena no vacía');
  }

  const contenido = exportarCSV(tabla, opciones);

  writeFileSync(ruta, contenido, 'utf8');

  return contenido;
}
