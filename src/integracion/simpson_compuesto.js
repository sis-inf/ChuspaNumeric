import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorDivergencia, ErrorParametros } from '../core/errores.js';
import {
  validarFuncion,
  validarIntervalo,
  validarNumero,
  verificarDivergencia,
} from '../utils/validaciones.js';

function valorParaValidacion(valor) {
  // Los validadores interpolan el valor en sus mensajes de error.
  const tipo = typeof valor;
  if (tipo === 'symbol' || tipo === 'function' || (tipo === 'object' && valor !== null)) {
    return `[${tipo}]`;
  }
  return valor;
}

/**
 * Aproxima una integral definida usando la regla de Simpson 1/3 compuesta.
 * Aplica el método a n subintervalos para mayor precisión.
 * La fórmula es: h/3 * [f(x0) + 4f(x1) + 2f(x2) + ... + 4f(x_{n-1}) + f(xn)]
 *
 * @param {(x: number) => number} f - Función a integrar, con valores reales finitos.
 * @param {number} a - Extremo inferior finito del intervalo.
 * @param {number} b - Extremo superior finito, estrictamente mayor que a.
 * @param {number} n - Número de subintervalos (entero seguro, par y >= 2).
 * @returns {Object} Objeto con la forma definida en contrato.js.
 * @throws {ErrorParametros} Si alguno de los argumentos es inválido.
 * @throws {ErrorDivergencia} Si el paso es cero o el cálculo produce un valor no finito o no numérico.
 *
 * @example
 * const res = simpsonCompuesto(x => x**4, 0, 1, 4);
 * // res.resultado ≈ 0.2
 */
export function simpsonCompuesto(f, a, b, n) {
  validarFuncion(f, 'f');
  validarIntervalo(valorParaValidacion(a), valorParaValidacion(b));
  validarNumero(valorParaValidacion(n), 'n');

  if (!Number.isSafeInteger(n) || n < 2 || n % 2 !== 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.simpsonCompuesto: 'n' debe ser un entero seguro, par y mayor o igual a 2. Se recibió: ${n}.`,
    );
  }

  const metodo = 'simpsonCompuesto';
  const { valor, tiempo_ms } = medirTiempo(() => {
    const h = (b - a) / n;
    verificarDivergencia(h, metodo, 0);
    if (h === 0) {
      throw new ErrorDivergencia('ChuspaNumeric.simpsonCompuesto: el paso h se redondeó a cero.');
    }

    const iteraciones = [];
    let suma = 0;

    for (let i = 0; i <= n; i++) {
      const xi = a + i * h;
      verificarDivergencia(xi, metodo, i);
      const fxi = f(xi);
      verificarDivergencia(valorParaValidacion(fxi), metodo, i);

      let coeficiente;
      if (i === 0 || i === n) {
        coeficiente = 1;
      } else if (i % 2 !== 0) {
        coeficiente = 4;
      } else {
        coeficiente = 2;
      }

      const contribucion = coeficiente * fxi;
      verificarDivergencia(contribucion, metodo, i);
      suma += contribucion;
      verificarDivergencia(suma, metodo, i);
      iteraciones.push({ i, xi, fxi, coeficiente });
    }

    const resultado = (h / 3) * suma;
    verificarDivergencia(resultado, metodo, n);
    return { resultado, iteraciones };
  });

  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Simpson 1/3 compuesto completado con ${n} subintervalos.`,
    meta: {
      metodo: 'Simpson 1/3 Compuesto',
      parametros: { a, b, n },
      tiempo_ms,
    },
  });
}
