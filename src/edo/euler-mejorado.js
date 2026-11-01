import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero } from '../utils/validaciones.js';
/**
 * Resuelve una EDO dy/dx = f(x, y) usando el método de Euler mejorado (Heun).
 * Promedia la pendiente al inicio y al final de cada paso para mayor precisión.
 *
 * @param {Object}   opciones        - Configuración del método.
 * @param {Function} opciones.f      - Función f(x, y) que define la EDO.
 * @param {number}   opciones.x0     - Valor inicial de x.
 * @param {number}   opciones.y0     - Valor inicial de y.
 * @param {number}   opciones.h      - Tamaño del paso (debe ser > 0).
 * @param {number}   opciones.xFinal - Valor final de x (debe ser > x0).
 * @returns {Object} Objeto con la forma uniforme de resultados de ChuspaNumeric.
 * @throws {ErrorParametros} Si h <= 0 o xFinal <= x0.
 */
function eulerMejorado({ f, x0, y0, h, xFinal }) {
  // ── Validaciones ────────────────────────────────────────────
  validarFuncion(f, 'f');
  validarNumero(x0, 'x0');
  validarNumero(y0, 'y0');
  validarNumero(h, 'h');
  validarNumero(xFinal, 'xFinal');
  if (h <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.eulerMejorado: 'h' debe ser mayor a cero. Se recibió: ${h}.`
    );
  }
  if (xFinal <= x0) {
    throw new ErrorParametros(
      `ChuspaNumeric.eulerMejorado: 'xFinal' (${xFinal}) debe ser mayor que 'x0' (${x0}).`
    );
  }
  // ── Cálculo ─────────────────────────────────────────────────
  const iteraciones = [];
  
  // Extraemos tanto el resultado del cálculo como el tiempo medido
  const { valor: puntos, tiempo_ms } = medirTiempo(() => {
    const listaPuntos = [[x0, y0]];
    let y = y0;
    
    // Determinar la cantidad exacta de pasos para evitar imprecisiones de coma flotante
    const pasos = Math.round((xFinal - x0) / h);
    for (let n = 1; n <= pasos; n++) {
      // x actual corresponde al inicio del paso
      const xActual = x0 + (n - 1) * h;
      
      const k1 = f(xActual, y);
      const yEstrella = y + h * k1;
      
      // x Siguiente corresponde al final del paso
      const xSiguiente = x0 + n * h;
      const k2 = f(xSiguiente, yEstrella);
      // Corrección de la variable dependiente
      y = y + (h / 2) * (k1 + k2);
      // Registrar la auditoría interna con la estructura exacta exigida por el issue
      iteraciones.push({ n, x: xSiguiente, y, k1, k2 });
      listaPuntos.push([xSiguiente, y]);
    }
    return listaPuntos;
  });
  return crearResultado({
    resultado: puntos,
    iteraciones,
    convergio: true,
    mensaje: `Método de Euler mejorado completado en ${iteraciones.length} pasos.`,
    meta: {
      metodo: 'Euler mejorado (Heun)',
      parametros: { x0, y0, h, xFinal },
      tiempo_ms,
    },
  });
}
export { eulerMejorado };