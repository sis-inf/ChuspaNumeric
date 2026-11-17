import { crearResultado } from '../core/contrato.js';
import { ErrorDivergencia, ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarIntervalo, verificarDivergencia } from '../utils/validaciones.js';

// Los validadores interpolan el valor en sus mensajes. Usar el tipo evita conversiones de entrada.
function valorParaValidacion(valor) {
  return typeof valor === 'number' ? valor : `un valor de tipo ${typeof valor}`;
}

/**
 * Aproxima una integral definida usando la regla de Simpson 3/8.
 * Requiere que el número de subintervalos sea múltiplo de 3.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f - Función que devuelve un número finito.
 * @param {number} opciones.a - Límite inferior finito.
 * @param {number} opciones.b - Límite superior finito, mayor que a.
 * @param {number} [opciones.n=99] - Entero positivo seguro y múltiplo de 3.
 * @returns {Object} Resultado estructurado de la integración.
 * @throws {ErrorParametros} Si los parámetros son inválidos.
 * @throws {ErrorDivergencia} Si el paso es cero o el cálculo produce un valor que no es un número finito.
 *
 * @example
 * const res = simpson38({ f: (x) => x ** 2, a: 0, b: 1, n: 9 });
 * // res.resultado ≈ 0.3333
 */
export function simpson38(opciones) {
  if (opciones === null || typeof opciones !== 'object' || Array.isArray(opciones)) {
    throw new ErrorParametros("ChuspaNumeric: 'opciones' debe ser un objeto con f, a y b.");
  }

  const { f, a, b, n = 99 } = opciones;
  validarFuncion(f, 'f');
  validarIntervalo(valorParaValidacion(a), valorParaValidacion(b));

  if (!Number.isSafeInteger(n) || n <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric: 'n' debe ser un entero positivo seguro. Se recibió: ${valorParaValidacion(n)}.`
    );
  }

  if (n % 3 !== 0) {
    throw new ErrorParametros(`ChuspaNumeric: 'n' debe ser múltiplo de 3. Se recibió: ${n}.`);
  }

  const h = (b - a) / n;
  verificarDivergencia(h, 'simpson38 (paso h)', 0);
  if (h === 0) {
    throw new ErrorDivergencia('ChuspaNumeric.simpson38: el paso h se redondeó a cero.');
  }

  const iteraciones = [];
  let suma = 0;

  for (let i = 0; i <= n; i++) {
    const xi = a + i * h;
    verificarDivergencia(xi, 'simpson38 (xi)', i);
    const fxi = f(xi);
    verificarDivergencia(valorParaValidacion(fxi), 'simpson38 (f(xi))', i);

    let coeficiente;
    if (i === 0 || i === n) {
      coeficiente = 1;
    } else if (i % 3 === 0) {
      coeficiente = 2;
    } else {
      coeficiente = 3;
    }

    const termino = coeficiente * fxi;
    verificarDivergencia(termino, 'simpson38 (producto ponderado)', i);
    suma += termino;
    verificarDivergencia(suma, 'simpson38 (suma acumulada)', i);
    iteraciones.push({ i, xi, fxi, coeficiente });
  }

  const resultado = ((3 * h) / 8) * suma;
  verificarDivergencia(resultado, 'simpson38 (resultado final)', n);

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Simpson 3/8 completado con ${n} subintervalos.`,
    meta: {
      metodo: 'Simpson 3/8',
      parametros: { a, b, n },
      tiempo_ms: 0,
    },
  });
}
