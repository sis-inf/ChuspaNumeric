import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorConvergencia } from '../core/errores.js';
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
export function rungeKutta4({ f, x0, y0, h, xFinal, tolerancia, pasoMinimo, pasoMaximo }) {
  validarFuncion(f, 'f');
  for (const [nombre, valor] of Object.entries({ x0, y0, h, xFinal })) {
    validarNumero(valor, nombre);
  }
  if (h <= 0) {
    throw new ErrorParametros('El paso h debe ser mayor que cero.');
  }
  if (xFinal <= x0) {
    throw new ErrorParametros('xFinal debe ser mayor que x0.');
  }
  const adaptativo = tolerancia !== undefined;
  const limites = adaptativo
    ? validarLimitesAdaptativos(tolerancia, pasoMinimo, pasoMaximo, h)
    : null;
  const { valor, tiempo_ms } = medirTiempo(() =>
    adaptativo
      ? resolverAdaptativo(f, x0, y0, h, xFinal, tolerancia, limites)
      : resolverPasoFijo(f, x0, y0, h, xFinal),
  );
  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Metodo RK4 completado con ${valor.iteraciones.length} iteraciones.`,
    meta: {
      metodo: 'Runge-Kutta 4',
      parametros: adaptativo
        ? { x0, y0, h, xFinal, tolerancia, ...limites }
        : { x0, y0, h, xFinal },
      tiempo_ms,
    },
  });
}

function calcularPasoRK4(f, x, y, h) {
  const k1 = f(x, y);
  const k2 = f(x + h / 2, y + (h * k1) / 2);
  const k3 = f(x + h / 2, y + (h * k2) / 2);
  const k4 = f(x + h, y + h * k3);
  const siguiente = y + (h / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
  if (![k1, k2, k3, k4, siguiente].every(Number.isFinite)) {
    throw new ErrorParametros('La derivada y los valores calculados deben ser numeros finitos.');
  }
  return { siguiente, k1, k2, k3, k4 };
}

function resolverPasoFijo(f, x0, y0, h, xFinal) {
  const iteraciones = [];
  const resultado = [];
  let x = x0;
  let y = y0;
  let n = 0;
  while (x <= xFinal + 1e-10) {
    if (x + h === x || n >= 100000) {
      throw new ErrorConvergencia(
        'El paso fijo no permite avanzar dentro del limite de iteraciones.',
      );
    }
    const { siguiente, k1, k2, k3, k4 } = calcularPasoRK4(f, x, y, h);
    iteraciones.push({ n, x, y, k1, k2, k3, k4 });
    resultado.push([x, y]);
    y = siguiente;
    x += h;
    n++;
  }
  return { resultado, iteraciones };
}

function validarLimitesAdaptativos(tolerancia, pasoMinimo, pasoMaximo, h) {
  const limites = {
    pasoMinimo: pasoMinimo ?? Math.min(h, pasoMaximo ?? h) / 1024,
    pasoMaximo: pasoMaximo ?? h,
  };
  for (const [nombre, valor] of Object.entries({ tolerancia, ...limites })) {
    validarNumero(valor, nombre);
    if (valor <= 0) {
      throw new ErrorParametros(`${nombre} debe ser positivo.`);
    }
  }
  if (limites.pasoMinimo > limites.pasoMaximo) {
    throw new ErrorParametros('pasoMinimo no puede ser mayor que pasoMaximo.');
  }
  return limites;
}

function elegirPaso(paso, restante, pasoMinimo, pasoMaximo) {
  if (!Number.isFinite(restante)) {
    return Math.max(pasoMinimo, Math.min(paso, pasoMaximo));
  }
  const margen = 4 * Number.EPSILON * Math.max(restante, pasoMinimo);
  const minimoPasos = Math.max(1, Math.ceil((restante - margen) / pasoMaximo));
  const maximoPasos = Math.min(100000, Math.floor((restante + margen) / pasoMinimo));
  if (minimoPasos > maximoPasos) {
    throw new ErrorConvergencia('El intervalo restante no admite pasos dentro de los limites.');
  }
  const sugerido = Math.max(pasoMinimo, Math.min(paso, pasoMaximo, restante));
  const cantidad = Math.max(minimoPasos, Math.min(maximoPasos, Math.ceil(restante / sugerido)));
  const inferior = Math.max(pasoMinimo, restante - (cantidad - 1) * pasoMaximo);
  const superior = Math.min(pasoMaximo, restante - (cantidad - 1) * pasoMinimo);
  return Math.max(pasoMinimo, Math.min(superior, Math.max(inferior, sugerido)));
}

function resolverAdaptativo(f, x0, y0, h, xFinal, tolerancia, { pasoMinimo, pasoMaximo }) {
  const resultado = [[x0, y0]];
  const iteraciones = [];
  let x = x0;
  let y = y0;
  let paso = Math.max(pasoMinimo, Math.min(h, pasoMaximo));
  let intentos = 0;
  while (x < xFinal) {
    if (++intentos > 100000) {
      throw new ErrorConvergencia('Se alcanzo el limite de intentos del metodo adaptativo.');
    }
    const restante = xFinal - x;
    paso = elegirPaso(paso, restante, pasoMinimo, pasoMaximo);
    if (x + paso === x) {
      throw new ErrorConvergencia('El paso no permite avanzar con la precision disponible.');
    }
    const completo = calcularPasoRK4(f, x, y, paso).siguiente;
    const mitad = calcularPasoRK4(f, x, y, paso / 2).siguiente;
    const dosMitades = calcularPasoRK4(f, x + paso / 2, mitad, paso / 2).siguiente;
    const errorEstimado = Math.abs(dosMitades - completo);
    if (errorEstimado > tolerancia) {
      const reducido = Math.max(pasoMinimo, paso / 2);
      if (elegirPaso(reducido, restante, pasoMinimo, pasoMaximo) >= paso) {
        throw new ErrorConvergencia('No se alcanza la tolerancia con el paso minimo permitido.');
      }
      paso = reducido;
      continue;
    }
    const margen = 4 * Number.EPSILON * Math.max(restante, pasoMinimo);
    x = paso >= restante || restante - paso <= margen ? xFinal : x + paso;
    y = dosMitades;
    iteraciones.push({ n: iteraciones.length + 1, x, y, h: paso, errorEstimado });
    resultado.push([x, y]);
    if (errorEstimado < tolerancia / 32) {
      paso = Math.min(pasoMaximo, paso * 2);
    }
  }
  return { resultado, iteraciones };
}
