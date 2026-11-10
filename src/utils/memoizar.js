import { ErrorParametros } from '../core/errores.js';
import { validarFuncion } from './validaciones.js';

/**
 * Envuelve una función en un caché simple basado en Map para evitar
 * reevaluaciones cuando se recibe exactamente el mismo valor de x.
 *
 * Esta utilidad está pensada para funciones costosas, por ejemplo simulaciones
 * numéricas o cálculos pesados que se evalúan varias veces en métodos como
 * bisección, falsa posición o Newton-Raphson.
 *
 * Importante:
 * - Solo debe usarse con funciones deterministas, es decir, funciones que
 *   siempre devuelven el mismo resultado para el mismo valor de x.
 * - El beneficio depende de cuántas veces el método vuelva a evaluar
 *   exactamente el mismo punto x. No es una optimización universal.
 * - El caché usa igualdad exacta de Map para la clave x, por lo que valores
 *   numéricamente cercanos pero distintos se almacenan como entradas diferentes.
 *
 * Ejemplo verificable contando invocaciones reales:
 *
 * let llamadas = 0;
 * const f = x => {
 *   llamadas++;
 *   return x * x;
 * };
 *
 * const fMemo = memoizarFuncion(f);
 *
 * fMemo(2); // llamadas = 1
 * fMemo(2); // llamadas sigue siendo 1 porque usa caché
 * fMemo(3); // llamadas = 2
 *
 * @param {Function} f - Función original a memoizar.
 * @returns {Function} Función memoizada con métodos auxiliares:
 *   - limpiarCache(): limpia las entradas almacenadas.
 *   - estadisticas(): retorna entradas y evaluaciones reales.
 * @throws {ErrorParametros} Si f no es una función válida.
 */
export function memoizarFuncion(f) {
  try {
    validarFuncion(f, 'f');
  } catch (error) {
    throw new ErrorParametros(
      `ChuspaNumeric.memoizarFuncion: 'f' debe ser una función válida. ${error.message}`
    );
  }

  const cache = new Map();
  let evaluacionesReales = 0;

  const funcionMemoizada = (x) => {
    if (cache.has(x)) {
      return cache.get(x);
    }

    const resultado = f(x);
    evaluacionesReales++;
    cache.set(x, resultado);

    return resultado;
  };

  funcionMemoizada.limpiarCache = () => {
    cache.clear();
  };

  funcionMemoizada.estadisticas = () => ({
    entradas: cache.size,
    evaluacionesReales
  });

  return funcionMemoizada;
}