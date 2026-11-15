import { writeFileSync } from 'node:fs';

/**
 * Metadatos opcionales que acompañan al resultado exportado.
 *
 * @typedef {Object} MetadatosJSON
 * @property {string} [metodo] - Nombre del método numérico ejecutado.
 * @property {Object} [parametros] - Parámetros de entrada usados.
 * @property {Array} [iteraciones] - Registro paso a paso del proceso.
 */

/**
 * Estructura JSON generada por la exportación.
 *
 * @typedef {Object} ResultadoJSON
 * @property {string} timestamp - Fecha y hora de generación en formato ISO 8601.
 * @property {string|null} metodo - Nombre del método, o `null` si no se indicó.
 * @property {Object} parametros - Parámetros usados (`{}` si no se indicaron).
 * @property {*} resultado - Resultado del método numérico.
 * @property {Array|null} iteraciones - Iteraciones registradas, o `null` si no hay.
 */

/**
 * Genera una estructura JSON exportable a partir de un resultado.
 *
 * @param {*} resultado - Resultado del método numérico.
 * @param {MetadatosJSON} [metadatos={}] - Información adicional del método.
 * @returns {ResultadoJSON} Objeto listo para serializar como JSON.
 *
 * @example
 * exportarJSON(2, { metodo: 'biseccion', parametros: { a: 0, b: 3 } });
 * // { timestamp: '...', metodo: 'biseccion', parametros: { a: 0, b: 3 },
 * //   resultado: 2, iteraciones: null }
 */
export function exportarJSON(resultado, metadatos = {}) {
  return {
    timestamp: new Date().toISOString(),
    metodo: metadatos.metodo || null,
    parametros: metadatos.parametros || {},
    resultado,
    iteraciones: metadatos.iteraciones || null,
  };
}

/**
 * Exporta un resultado a un archivo JSON.
 *
 * Compatibilidad con Deno:
 * este módulo utiliza el especificador `node:fs`, compatible con Node.js y con
 * la capa de compatibilidad de Deno. No requiere import map, pero en Deno la
 * escritura de archivos requiere ejecutar con permisos, por ejemplo:
 * `deno run --allow-write archivo.js`.
 *
 * @param {*} resultado - Resultado del método numérico.
 * @param {MetadatosJSON} [metadatos={}] - Información adicional del método.
 * @param {string} ruta - Ruta del archivo destino.
 * @returns {ResultadoJSON} Objeto JSON generado.
 * @throws {Error} Si `ruta` no es una cadena no vacía.
 *
 * @example
 * exportarJSONArchivo(2, { metodo: 'biseccion' }, './resultado.json');
 */
export function exportarJSONArchivo(resultado, metadatos = {}, ruta) {
  if (typeof ruta !== 'string' || ruta.length === 0) {
    throw new Error('La ruta del archivo JSON debe ser una cadena no vacía');
  }

  const contenido = exportarJSON(resultado, metadatos);

  writeFileSync(ruta, JSON.stringify(contenido, null, 2), 'utf8');

  return contenido;
}
