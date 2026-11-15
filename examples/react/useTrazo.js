/**
 * @file Hook de React de ejemplo para usar ChuspaNumeric desde un componente.
 *
 * Se puede importar de las dos formas (ESM):
 *   import { useChuspaNumeric } from "./useTrazo.js";
 *   import useChuspaNumeric from "./useTrazo.js";
 */
import { useState, useCallback } from "react";
import { biseccion } from "chuspanumeric";

/**
 * Resultado que devuelve `biseccion` de ChuspaNumeric.
 *
 * @typedef {Object} ResultadoBiseccion
 * @property {number} resultado - Aproximación de la raíz encontrada.
 * @property {Array<Object>} iteraciones - Detalle de cada iteración.
 * @property {boolean} convergio - `true` si se alcanzó la tolerancia.
 * @property {string} mensaje - Descripción del resultado.
 * @property {Object} meta - Método y parámetros usados.
 */

/**
 * Estado y acción que expone el hook.
 *
 * @typedef {Object} EstadoChuspaNumeric
 * @property {ResultadoBiseccion|null} resultado - Último resultado, o `null` si todavía no se ejecutó o falló.
 * @property {boolean} loading - `true` mientras se ejecuta el método.
 * @property {string|null} error - Mensaje del último error, o `null` si no hubo.
 * @property {(funcion: (x: number) => number, a: number, b: number) => Promise<void>} ejecutarMetodo -
 *   Ejecuta la bisección de `funcion` en el intervalo [a, b] y actualiza el estado.
 */

/**
 * Hook que ejecuta el método de bisección de ChuspaNumeric y guarda
 * el resultado, el estado de carga y el error en el estado del componente.
 *
 * @returns {EstadoChuspaNumeric} Estado actual y la función `ejecutarMetodo`.
 */
export function useChuspaNumeric() {
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta la bisección y actualiza resultado, loading y error.
   *
   * @param {(x: number) => number} funcion - Función continua cuya raíz se busca.
   * @param {number} a - Extremo izquierdo del intervalo.
   * @param {number} b - Extremo derecho del intervalo.
   * @returns {Promise<void>}
   */
  const ejecutarMetodo = useCallback(async (funcion, a, b) => {
    setLoading(true);
    setError(null);

    try {
      const respuesta = biseccion({ f: funcion, a, b });
      setResultado(respuesta);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resultado,
    loading,
    error,
    ejecutarMetodo,
  };
}

export default useChuspaNumeric;
