/**
 * Utilidades para verificar la convergencia de métodos numéricos.
 *
 * Permite comprobar si dos iteraciones consecutivas cumplen
 * una tolerancia establecida y mantener un historial limitado
 * de valores para evaluar la convergencia.
 */

/**
 * Comprueba si dos valores consecutivos cumplen la tolerancia
 * establecida para considerar que un método numérico converge.
 *
 * @param {number} xNew - Valor actual de la iteración.
 * @param {number} xOld - Valor de la iteración anterior.
 * @param {number} tol - Tolerancia máxima permitida para la diferencia.
 * @returns {{ converged: boolean, lastDiff: number }} Objeto que indica
 * si existe convergencia y la diferencia absoluta entre ambos valores.
 *
 * @example
 * checkConvergence(2.001, 2, 0.01);
 * // Retorna: { converged: true, lastDiff: 0.0009999999999998899 }
 */
export function checkConvergence(xNew, xOld, tol) {
    // Calcular la diferencia absoluta
    const lastDiff = Math.abs(xNew - xOld);

    // Verificar si la diferencia es menor que la tolerancia
    const converged = lastDiff < tol;

    // Retornar objeto con los resultados
    return {
        converged: converged,
        lastDiff: lastDiff
    };
}

/**
 * Clase para mantener un historial limitado de valores numéricos.
 *
 * Almacena únicamente los dos últimos valores, lo que permite
 * comprobar la convergencia en métodos iterativos como Newton
 * y bisección.
 *
 * @class
 */
export class ConvergenceHistory {
    /**
     * Inicializa un historial vacío de valores.
     *
     * @constructor
     */
    constructor() {
        this.values = [];
    }

    /**
     * Agrega un nuevo valor al historial y conserva únicamente
     * los dos valores más recientes.
     *
     * @param {number} value - Nuevo valor que se agregará al historial.
     * @returns {void}
     */
    addValue(value) {
        this.values.push(value);
        // Limitar historial a 2 valores
        if (this.values.length > 2) {
            this.values.shift();
        }
    }

    /**
     * Comprueba la convergencia utilizando los dos últimos valores
     * almacenados en el historial.
     *
     * Si todavía no existen dos valores, indica que no hay convergencia
     * y devuelve null como última diferencia.
     *
     * @param {number} tol - Tolerancia máxima permitida para la diferencia.
     * @returns {{ converged: boolean, lastDiff: number | null }} Objeto
     * con el estado de convergencia y la última diferencia calculada.
     *
     * @example
     * const history = new ConvergenceHistory();
     * history.addValue(2);
     * history.addValue(2.001);
     * history.checkLastTwo(0.01);
     * // Retorna: { converged: true, lastDiff: 0.0009999999999998899 }
     */
    checkLastTwo(tol) {
        if (this.values.length < 2) {
            return {
                converged: false,
                lastDiff: null
            };
        }

        const xOld = this.values[0];
        const xNew = this.values[1];
        const lastDiff = Math.abs(xNew - xOld);

        return {
            converged: lastDiff < tol,
            lastDiff: lastDiff
        };
    }

    /**
     * Elimina todos los valores almacenados en el historial.
     *
     * @returns {void}
     */
    reset() {
        this.values = [];
    }

    /**
     * Obtiene el último valor almacenado en el historial.
     *
     * @returns {number | undefined} Último valor almacenado,
     * o undefined si el historial está vacío.
     */
    getLastValue() {
        return this.values[this.values.length - 1];
    }
}
