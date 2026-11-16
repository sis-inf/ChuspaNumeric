import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorDominio, ErrorConvergencia, ErrorParametros } from '../core/errores.js';
import {
  validarFuncion,
  validarTolerancia,
  validarIteraciones,
  verificarDivergencia,
} from '../utils/validaciones.js';
import { errorAbsoluto } from '../utils/formato.js';

function validarFinito(valor, nombre) {
  if (!Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.muller: '${nombre}' debe ser un número finito. Tipo recibido: ${typeof valor}.`,
    );
  }
}

function validarPuntosIniciales(x0, x1, x2) {
  validarFinito(x0, 'x0');
  validarFinito(x1, 'x1');
  validarFinito(x2, 'x2');

  if (x0 === x1 || x1 === x2 || x0 === x2) {
    throw new ErrorParametros(
      'ChuspaNumeric.muller: Los puntos iniciales x0, x1 y x2 deben ser valores distintos entre sí.',
    );
  }

  if (![x1 - x0, x2 - x1, x2 - x0].every(Number.isFinite)) {
    throw new ErrorParametros(
      'ChuspaNumeric.muller: Las distancias entre los puntos iniciales deben ser finitas.',
    );
  }
}

function siguientePunto(a, b, c, fa, fb, fc, iteracion) {
  const h1 = b - a;
  const h2 = c - b;
  const hTotal = c - a;
  if (h1 === 0 || h2 === 0 || hTotal === 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.muller: Se repitió un punto de interpolación en la iteración ${iteracion}.`,
    );
  }

  const d1 = (fb - fa) / h1;
  const d2 = (fc - fb) / h2;
  const A = (d2 - d1) / hTotal;
  const B = A * h2 + d2;
  const discriminante = B * B - 4 * A * fc;
  verificarDivergencia(discriminante, 'muller', iteracion);
  if (discriminante < 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.muller: La parábola tiene discriminante negativo en la iteración ${iteracion}.`,
    );
  }

  const raiz = Math.sqrt(discriminante);
  const denominador = Math.abs(B + raiz) >= Math.abs(B - raiz) ? B + raiz : B - raiz;
  if (denominador === 0) {
    throw new ErrorDominio(
      `ChuspaNumeric.muller: División por cero en la iteración ${iteracion} por denominador nulo.`,
    );
  }

  const xNuevo = c - (2 * fc) / denominador;
  verificarDivergencia(xNuevo, 'muller', iteracion);
  return xNuevo;
}

/**
 * Encuentra una raíz real de f usando el método de Müller.
 * Ajusta una parábola por tres puntos y toma la raíz más cercana
 * al último punto como nueva aproximación.
 *
 * @param {Object} opciones - Configuración del método.
 * @param {Function} opciones.f - Función a evaluar.
 * @param {number} opciones.x0 - Primera aproximación inicial.
 * @param {number} opciones.x1 - Segunda aproximación inicial.
 * @param {number} opciones.x2 - Tercera aproximación inicial.
 * @param {number} [opciones.tolerancia=1e-6] - Criterio de parada por convergencia.
 * @param {number} [opciones.maxIter=100] - Máximo de iteraciones permitidas.
 * @returns {Object} Objeto con la forma uniforme de resultados de ChuspaNumeric.
 * @throws {ErrorParametros} Si las opciones o los valores de f no son válidos.
 * @throws {ErrorDominio} Si el discriminante es negativo o hay división por cero.
 * @throws {ErrorDivergencia} Si el cálculo produce un valor no finito.
 * @throws {ErrorConvergencia} Si no converge en maxIter iteraciones.
 */
function muller(opciones) {
  if (!opciones || typeof opciones !== 'object' || Array.isArray(opciones)) {
    throw new ErrorParametros('ChuspaNumeric.muller: Se requiere un objeto de opciones.');
  }

  const { f, x0, x1, x2, tolerancia = 1e-6, maxIter = 100 } = opciones;
  validarFuncion(f, 'f');
  validarPuntosIniciales(x0, x1, x2);
  validarFinito(tolerancia, 'tolerancia');
  validarTolerancia(tolerancia);
  validarFinito(maxIter, 'maxIter');
  if (!Number.isSafeInteger(maxIter)) {
    throw new ErrorParametros(
      'ChuspaNumeric.muller: maxIter debe ser un entero positivo seguro.',
    );
  }
  validarIteraciones(maxIter);

  const iteraciones = [];
  const evaluar = (x) => {
    const fx = f(x);
    validarFinito(fx, `f(${x})`);
    return fx;
  };

  const { valor: resultadoRaiz, tiempo_ms } = medirTiempo(() => {
    let a = x0;
    let b = x1;
    let c = x2;

    for (let n = 1; n <= maxIter; n++) {
      const fc = evaluar(c);
      const xNuevo = fc === 0 ? c : siguientePunto(a, b, c, evaluar(a), evaluar(b), fc, n);
      const fxNuevo = xNuevo === c ? fc : evaluar(xNuevo);
      const error = errorAbsoluto(xNuevo, c);
      verificarDivergencia(error, 'muller', n);

      iteraciones.push({ n, x0: a, x1: b, x2: c, xNuevo, fxNuevo, error });
      if (error === 0 && Math.abs(fxNuevo) >= tolerancia) {
        throw new ErrorConvergencia(
          `ChuspaNumeric.muller: La aproximación se estancó sin alcanzar la tolerancia en la iteración ${n}.`,
        );
      }
      if (error < tolerancia) {
        return xNuevo;
      }

      a = b;
      b = c;
      c = xNuevo;
    }

    throw new ErrorConvergencia(
      `ChuspaNumeric.muller: no convergió en ${maxIter} iteraciones con tolerancia ${tolerancia}.`
    );
  });

  return crearResultado({
    resultado: resultadoRaiz,
    iteraciones,
    convergio: true,
    mensaje: `Convergencia alcanzada en ${iteraciones.length} iteraciones.`,
    meta: {
      metodo: 'Müller',
      parametros: { x0, x1, x2, tolerancia, maxIter },
      tiempo_ms
    }
  });
}

export { muller };
