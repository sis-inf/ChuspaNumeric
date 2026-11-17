import { ErrorParametros } from '../core/errores.js';
import { validarFuncion } from './validaciones.js';

/**
 * Estadísticas del caché de una función memoizada.
 *
 * @typedef {Object} EstadisticasMemoizacion
 * @property {number} entradas - Cantidad de valores de x almacenados en el caché.
 * @property {number} evaluacionesReales - Veces que se llamó realmente a la función original.
 */

/**
 * Función memoizada devuelta por memoizarFuncion. Se llama igual que la original
 * y además expone limpiarCache() y estadisticas().
 *
 * @typedef {((x: *) => *) & { limpiarCache: () => void, estadisticas: () => EstadisticasMemoizacion }} FuncionMemoizada
 */

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
 * @param {(x: *) => *} f - Función original a memoizar. Recibe un valor x y devuelve su resultado.
 * @returns {FuncionMemoizada} Función memoizada con métodos auxiliares:
 *   - limpiarCache(): limpia las entradas almacenadas y no devuelve nada.
 *   - estadisticas(): retorna un objeto {entradas, evaluacionesReales} (EstadisticasMemoizacion).
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