import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorDominio, ErrorConvergencia, ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarNumero, validarTolerancia, validarIteraciones } from '../utils/validaciones.js';
import { errorAbsoluto } from '../utils/formato.js';

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
 * @throws {ErrorParametros} Si las aproximaciones iniciales no son distintas.
 * @throws {ErrorDominio} Si el discriminante es negativo o hay división por cero.
 * @throws {ErrorConvergencia} Si no converge en maxIter iteraciones.
 */
function muller({ f, x0, x1, x2, tolerancia = 1e-6, maxIter = 100 }) {
  // Validaciones de Entrada 
  validarFuncion(f, 'f');
  validarNumero(x0, 'x0');
  validarNumero(x1, 'x1');
  validarNumero(x2, 'x2');
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  if (x0 === x1 || x1 === x2 || x0 === x2) {
    throw new ErrorParametros(
      `ChuspaNumeric.muller: Los puntos iniciales x0, x1 y x2 deben ser valores distintos entre sí. Se recibió: x0=${x0}, x1=${x1}, x2=${x2}`
    );
  }

  const iteraciones = [];
  let convergio = false;
  let mensaje = '';

  // Medición de tiempo usando el estándar oficial del repositorio
  const { valor: resultadoRaiz, tiempo_ms } = medirTiempo(() => {
    let a = x0, b = x1, c = x2;

    for (let n = 1; n <= maxIter; n++) {
      const fa = f(a);
      const fb = f(b);
      const fc = f(c);

      // Diferencias divididas para la parábola
      const h1 = b - a;
      const h2 = c - b;

      const d1 = (fb - fa) / h1;
      const d2 = (fc - fb) / h2;

      const A = (d2 - d1) / (h2 + h1);
      const B = A * h2 + d2;
      const C = fc;

      // Evaluación del discriminante real
      const discriminante = B * B - 4 * A * C;

      // Para discriminante negativo (raíces complejas) se usa |discriminante|
      // y se retorna la parte real de la raíz compleja

      const sqrtDisc = Math.sqrt(Math.abs(discriminante));

      // Determinación del denominador de mayor magnitud para estabilidad
      const denominador = Math.abs(B + sqrtDisc) >= Math.abs(B - sqrtDisc)
        ? B + sqrtDisc
        : B - sqrtDisc;

      if (denominador === 0) {
        throw new ErrorDominio(
          `ChuspaNumeric.muller: División por cero detectada en la iteración ${n} por denominador nulo.`
        );
      }

      const xNuevo = c - (2 * C) / denominador;
      const fxNuevo = f(xNuevo);
      const error = errorAbsoluto(xNuevo, c);

      // Registro de iteración requerido por el issue
      iteraciones.push({ n, x0: a, x1: b, x2: c, xNuevo, fxNuevo, error });

      // Evaluación del criterio de convergencia
      if (error < tolerancia) {
        convergio = true;
        mensaje = `Convergencia alcanzada en ${n} iteraciones.`;
        return xNuevo;
      }

      // Desplazamiento de la ventana
      a = b;
      b = c;
      c = xNuevo;
    }

    throw new ErrorConvergencia(
      `ChuspaNumeric.muller: no convergió en ${maxIter} iteraciones con tolerancia ${tolerancia}.`
    );
  });

  // Retorno del resultado usando la fábrica del contrato
  return crearResultado({
    resultado: resultadoRaiz,
    iteraciones,
    convergio,
    mensaje,
    meta: {
      metodo: 'Müller',
      parametros: { x0, x1, x2, tolerancia, maxIter },
      tiempo_ms
    }
  });
}

export { muller };