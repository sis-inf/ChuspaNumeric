import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero } from '../utils/validaciones.js';

// Margen relativo para absorber el error de redondeo al acumular pasos.
const TOLERANCIA_PASO = 1e-12;

/**
 * Valida los parámetros comunes de los métodos RK2.
 */
function validarEntradas(f, y0, t0, tFinal, h) {
  validarFuncion(f, 'f');
  validarNumero(y0, 'y0');
  validarNumero(t0, 't0');
  validarNumero(tFinal, 'tFinal');
  validarNumero(h, 'h');

  if (tFinal <= t0) {
    throw new ErrorParametros(
      `Trazo: 'tFinal' (${tFinal}) debe ser mayor que 't0' (${t0}).`
    );
  }
  if (h <= 0) {
    throw new Error('h debe ser mayor que 0');
  }
}

/**
 * Calcula el paso a dar desde t sin pasarse de tFinal: min(h, tFinal - t).
 * Si lo que falta es h salvo error de redondeo, ese es el último paso.
 */
function calcularPaso(t, tFinal, h) {
  const restante = tFinal - t;
  const ultimo = restante <= h * (1 + TOLERANCIA_PASO);
  return { hPaso: ultimo ? restante : h, ultimo };
}

/**
 * Método de Heun (RK2 predictor-corrector)
 */
export function metodHeun(f, y0, t0, tFinal, h) {
  validarEntradas(f, y0, t0, tFinal, h);

  const resultados = [];
  let t = t0;
  let y = y0;

  resultados.push({ t, y });

  while (t < tFinal) {
    const { hPaso, ultimo } = calcularPaso(t, tFinal, h);

    const k1 = f(t, y);
    const predictor = y + hPaso * k1;

    const k2 = f(t + hPaso, predictor);

    y = y + (hPaso / 2) * (k1 + k2);
    t = ultimo ? tFinal : t + hPaso;

    resultados.push({ t, y });
  }

  return resultados;
}

/**
 * Método del Punto Medio (RK2)
 */
export function metodoPuntoMedio(f, y0, t0, tFinal, h) {
  validarEntradas(f, y0, t0, tFinal, h);

  const resultados = [];
  let t = t0;
  let y = y0;

  resultados.push({ t, y });

  while (t < tFinal) {
    const { hPaso, ultimo } = calcularPaso(t, tFinal, h);

    const k1 = f(t, y);

    const k2 = f(
      t + hPaso / 2,
      y + (hPaso / 2) * k1
    );

    y = y + hPaso * k2;
    t = ultimo ? tFinal : t + hPaso;

    resultados.push({ t, y });
  }

  return resultados;
}