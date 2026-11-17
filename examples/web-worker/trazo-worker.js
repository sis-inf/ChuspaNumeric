/**
 * @file Web Worker de ejemplo que ejecuta métodos de ChuspaNumeric fuera del
 * hilo principal. Se carga como módulo:
 *   new Worker(url, { type: 'module' })
 *
 * Mensaje de entrada: { metodo: 'biseccion', parametros: { funcion, a, b } }.
 * Respuesta: el resultado de biseccion, enviado con postMessage.
 *
 * procesarMensaje también se puede importar desde otro módulo ESM (por
 * ejemplo, para probarlo sin un Worker).
 */
/* global self */
import { biseccion } from '../../src/no-lineales/biseccion.js';

/**
 * Parámetros del método de bisección tal como llegan en el mensaje.
 *
 * @typedef {Object} ParametrosBiseccion
 * @property {string} funcion - Expresión en x, por ejemplo 'x*x-4'.
 * @property {number} a - Extremo izquierdo del intervalo.
 * @property {number} b - Extremo derecho del intervalo.
 */

/**
 * Mensaje que recibe el worker.
 *
 * @typedef {Object} MensajeWorker
 * @property {string} metodo - Método a ejecutar. Hoy solo 'biseccion'.
 * @property {ParametrosBiseccion} parametros - Parámetros del método.
 */

/**
 * Ejecuta el método pedido en el mensaje.
 *
 * @param {MensajeWorker} datos - Mensaje recibido por el worker.
 * @returns {Object|null} Resultado de biseccion (resultado, iteraciones,
 *   convergio, mensaje, meta), o null si el método no está soportado.
 */
export function procesarMensaje(datos) {
  const { metodo, parametros } = datos;

  if (metodo === 'biseccion') {
    const funcion = new Function('x', `return ${parametros.funcion}`);

    return biseccion({
      f: funcion,
      a: parametros.a,
      b: parametros.b,
    });
  }

  return null;
}

// Solo dentro de un Worker existe self: al importar el módulo desde otro
// entorno no se registra el listener.
if (typeof self !== 'undefined') {
  self.onmessage = (event) => {
    const resultado = procesarMensaje(event.data);

    if (resultado !== null) {
      self.postMessage(resultado);
    }
  };
}
