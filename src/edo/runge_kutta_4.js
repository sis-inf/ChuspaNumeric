import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero } from '../utils/validaciones.js';

/**
 * Resuelve una EDO de primer orden usando Runge-Kutta de orden 4 (RK4).
 *
 * @param {Object} opciones
 * @param {Function} opciones.f Función f(x, y)
 * @param {number} opciones.x0 Valor inicial de x
 * @param {number} opciones.y0 Valor inicial de y
 * @param {number} opciones.h Tamaño del paso
 * @param {number} opciones.xFinal Valor final de x
 * @returns {Object} Resultado siguiendo el contrato definido por crearResultado
 *
 * @example
 * const res = rungeKutta4({
 *   f: (x, y) => y,
 *   x0: 0,
 *   y0: 1,
 *   h: 0.1,
 *   xFinal: 1
 * });
 */
export function rungeKutta4({ f, x0, y0, h, xFinal }) {
  validarFuncion(f, 'f');

  validarNumero(x0, 'x0');
  validarNumero(y0, 'y0');
  validarNumero(h, 'h');
  validarNumero(xFinal, 'xFinal');

  if (h <= 0) {
    throw new ErrorParametros('El paso h debe ser mayor que cero.');
  }

  if (xFinal <= x0) {
    throw new ErrorParametros('xFinal debe ser mayor que x0.');
  }

  const iteraciones = [];
  const resultado = [];

  let x = x0;
  let y = y0;
  let n = 0;

  while (x <= xFinal + 1e-10  ) {
    const k1 = f(x, y);
    const k2 = f(x + h / 2, y + (h * k1) / 2);
    const k3 = f(x + h / 2, y + (h * k2) / 2);
    const k4 = f(x + h, y + h * k3);

    iteraciones.push({
      n,
      x,
      y,
      k1,
      k2,
      k3,
      k4
    });

    resultado.push([x, y]);

    y =
      y +
      (h / 6) *
        (k1 + 2 * k2 + 2 * k3 + k4);

    x += h;
    n++;
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Método RK4 completado con ${n} iteraciones.`,
    meta: {
      metodo: 'Runge-Kutta 4',
      parametros: {
        x0,
        y0,
        h,
        xFinal
      }
    }
  });
} 
