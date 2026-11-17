import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorDivergencia, ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero, verificarDivergencia } from '../utils/validaciones.js';

// El arreglo de resultados contiene un punto adicional para la condición inicial.
const MAX_PASOS = 2 ** 32 - 2;

/**
 * Resuelve una EDO dy/dx = f(x, y) usando el método de Euler mejorado (Heun).
 * Promedia la pendiente al inicio y al final de cada paso para mayor precisión.
 *
 * @param {Object}   opciones        - Configuración del método.
 * @param {Function} opciones.f      - Función f(x, y) que devuelve una derivada finita.
 * @param {number}   opciones.x0     - Valor inicial de x.
 * @param {number}   opciones.y0     - Valor inicial de y.
 * @param {number}   opciones.h      - Paso nominal positivo. El último se ajusta a xFinal.
 * @param {number}   opciones.xFinal - Valor final de x (debe ser > x0).
 * @returns {Object} Objeto con la forma uniforme de resultados de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros son inválidos o el paso no permite recorrer el intervalo.
 * @throws {ErrorDivergencia} Si la derivada o algún valor calculado no es finito.
 */
function eulerMejorado(opciones) {
  // ── Validaciones ────────────────────────────────────────────
  if (opciones === null || typeof opciones !== 'object' || Array.isArray(opciones)) {
    throw new ErrorParametros(
      'ChuspaNumeric.eulerMejorado: se esperaba un objeto con f, x0, y0, h y xFinal.',
    );
  }
  const { f, x0, y0, h, xFinal } = opciones;
  validarFuncion(f, 'f');
  for (const [nombre, valor] of Object.entries({ x0, y0, h, xFinal })) {
    // Evita la conversión implícita de símbolos y objetos en el mensaje del validador.
    if (typeof valor !== 'number') {
      throw new ErrorParametros(
        `ChuspaNumeric.eulerMejorado: '${nombre}' debe ser un número finito.`,
      );
    }
    validarNumero(valor, nombre);
  }
  if (h <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.eulerMejorado: 'h' debe ser mayor a cero. Se recibió: ${h}.`,
    );
  }
  if (xFinal <= x0) {
    throw new ErrorParametros(
      `ChuspaNumeric.eulerMejorado: 'xFinal' (${xFinal}) debe ser mayor que 'x0' (${x0}).`,
    );
  }

  // Absorbe el redondeo de un múltiplo de h sin añadir un paso residual.
  const cociente = (xFinal - x0) / h;
  const redondeado = Math.round(cociente);
  const intervaloMultiplo =
    redondeado > 0 && Math.abs(cociente - redondeado) <= 4 * Number.EPSILON * cociente;
  const pasos = intervaloMultiplo ? redondeado : Math.max(1, Math.ceil(cociente));
  if (!Number.isSafeInteger(pasos) || pasos > MAX_PASOS) {
    throw new ErrorParametros(
      "ChuspaNumeric.eulerMejorado: el intervalo y 'h' producen una cantidad de pasos fuera de rango.",
    );
  }

  // ── Cálculo ─────────────────────────────────────────────────
  const iteraciones = [];
  const erroresEstimados = [];
  let errorEstimadoMaximo = 0;

  // Extraemos tanto el resultado del cálculo como el tiempo medido
  const { valor: puntos, tiempo_ms } = medirTiempo(() => {
    const listaPuntos = [[x0, y0]];
    let xActual = x0;
    let y = y0;

    for (let n = 1; n <= pasos && xActual < xFinal; n++) {
      const xCalculado = n === pasos ? xFinal : x0 + n * h;
      verificarDivergencia(xCalculado, 'eulerMejorado (xSiguiente)', n);
      const xSiguiente = Math.min(xCalculado, xFinal);
      if (xSiguiente <= xActual) {
        throw new ErrorParametros(
          `ChuspaNumeric.eulerMejorado: 'h' no permite avanzar desde x = ${xActual} en el paso ${n}.`,
        );
      }
      const pasoCompleto = n === pasos ? intervaloMultiplo : xCalculado <= xFinal;
      const hPaso = pasoCompleto ? h : xSiguiente - xActual;

      const k1 = evaluarDerivada(f, xActual, y, n, 'k1');
      const yEstrella = y + hPaso * k1;
      verificarDivergencia(yEstrella, 'eulerMejorado (predictor)', n);

      const k2 = evaluarDerivada(f, xSiguiente, yEstrella, n, 'k2');
      y = y + (hPaso / 2) * (k1 + k2);
      verificarDivergencia(y, 'eulerMejorado (corrector)', n);

      const errorEstimado = Math.abs(y - yEstrella);
      verificarDivergencia(errorEstimado, 'eulerMejorado (errorEstimado)', n);
      erroresEstimados.push(errorEstimado);
      errorEstimadoMaximo = Math.max(errorEstimadoMaximo, errorEstimado);
      // Registrar la auditoría interna con la estructura exacta exigida por el issue
      iteraciones.push({
        n,
        x: xSiguiente,
        y,
        k1,
        k2,
        predictor: yEstrella,
        corrector: y,
        errorEstimado,
      });
      listaPuntos.push([xSiguiente, y]);
      xActual = xSiguiente;
    }
    return listaPuntos;
  });
  const resultado = crearResultado({
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
  return { ...resultado, erroresEstimados, errorEstimadoMaximo };
}

function evaluarDerivada(f, x, y, n, pendiente) {
  const valor = f(x, y);
  if (typeof valor !== 'number') {
    throw new ErrorDivergencia(
      `ChuspaNumeric.eulerMejorado: f(x, y) debe devolver un número finito para ${pendiente} en el paso ${n}.`,
    );
  }
  verificarDivergencia(valor, `eulerMejorado (${pendiente})`, n);
  return valor;
}

export { eulerMejorado };
