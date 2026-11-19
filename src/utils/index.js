/**
 * Índice central de utilidades de ChuspaNumeric.
 *
 * Reexporta las funciones públicas de estadística descriptiva,
 * generación de matrices, aritmética compleja y álgebra vectorial.
 *
 * Permite acceder a estas funciones desde un único módulo.
 *
 * @module utils
 */

// ============================================================
// ESTADÍSTICA DESCRIPTIVA
// ============================================================

/**
 * Calcula la media aritmética de un conjunto de datos.
 *
 * @param {number[]} datos - Array no vacío de números finitos.
 * @returns {number} Media aritmética de los datos.
 */
export { media } from './estadistica.js';

/**
 * Calcula la varianza muestral o poblacional.
 *
 * @param {number[]} datos - Array no vacío de números finitos.
 * @param {boolean} [poblacional=false] - Si es true, calcula la varianza poblacional.
 * @returns {number} Varianza del conjunto de datos.
 */
export { varianza } from './estadistica.js';

/**
 * Calcula la desviación estándar muestral o poblacional.
 *
 * @param {number[]} datos - Array no vacío de números finitos.
 * @param {boolean} [poblacional=false] - Si es true, calcula la desviación poblacional.
 * @returns {number} Desviación estándar de los datos.
 */
export { desviacionEstandar } from './estadistica.js';

/**
 * Calcula la mediana de un conjunto de datos.
 *
 * @param {number[]} datos - Array no vacío de números finitos.
 * @returns {number} Mediana de los datos.
 */
export { mediana } from './estadistica.js';

// ============================================================
// GENERADORES DE MATRICES
// ============================================================

/**
 * Genera una matriz identidad de dimensión n × n.
 *
 * @param {number} n - Dimensión positiva de la matriz.
 * @returns {number[][]} Matriz identidad.
 */
export { matrizIdentidad } from './generadores_matrices.js';

/**
 * Genera una matriz de Hilbert de dimensión n × n.
 *
 * @param {number} n - Dimensión positiva de la matriz.
 * @returns {number[][]} Matriz de Hilbert.
 */
export { matrizHilbert } from './generadores_matrices.js';

/**
 * Genera una matriz aleatoria diagonalmente dominante.
 *
 * @param {number} n - Dimensión positiva de la matriz.
 * @param {number|null} [semilla=null] - Semilla opcional para reproducibilidad.
 * @returns {number[][]} Matriz diagonalmente dominante.
 */
export { matrizDiagonalDominante } from './generadores_matrices.js';

/**
 * Genera una matriz simétrica definida positiva.
 *
 * @param {number} n - Dimensión positiva de la matriz.
 * @param {number|null} [semilla=null] - Semilla opcional para reproducibilidad.
 * @returns {number[][]} Matriz simétrica definida positiva.
 */
export { matrizSimetricaDefinidaPositiva } from './generadores_matrices.js';

/**
 * Comprueba si una matriz es diagonalmente dominante.
 *
 * @param {number[][]} A - Matriz que se desea verificar.
 * @returns {boolean} true si es diagonalmente dominante; false en caso contrario.
 */
export { esDiagonalDominante } from './generadores_matrices.js';

/**
 * Comprueba si una matriz es simétrica.
 *
 * @param {number[][]} A - Matriz que se desea verificar.
 * @returns {boolean} true si es simétrica; false en caso contrario.
 */
export { esSimetrica } from './generadores_matrices.js';

// ============================================================
// NÚMEROS COMPLEJOS
// ============================================================

/**
 * Suma dos números complejos.
 *
 * @param {{re: number, im: number}} z1 - Primer número complejo.
 * @param {{re: number, im: number}} z2 - Segundo número complejo.
 * @returns {{re: number, im: number}} Resultado de la suma.
 */
export { sumaComplejos } from './numeros_complejos.js';

/**
 * Multiplica dos números complejos.
 *
 * @param {{re: number, im: number}} z1 - Primer número complejo.
 * @param {{re: number, im: number}} z2 - Segundo número complejo.
 * @returns {{re: number, im: number}} Resultado del producto.
 */
export { productoComplejos } from './numeros_complejos.js';

/**
 * Calcula el módulo de un número complejo.
 *
 * @param {{re: number, im: number}} z - Número complejo.
 * @returns {number} Módulo del número complejo.
 */
export { moduloComplejo } from './numeros_complejos.js';

/**
 * Calcula el conjugado de un número complejo.
 *
 * @param {{re: number, im: number}} z - Número complejo.
 * @returns {{re: number, im: number}} Conjugado del número complejo.
 */
export { conjugadoComplejo } from './numeros_complejos.js';

/**
 * Divide dos números complejos.
 *
 * @param {{re: number, im: number}} z1 - Numerador.
 * @param {{re: number, im: number}} z2 - Denominador.
 * @returns {{re: number, im: number}} Resultado de la división.
 */
export { divisionComplejos } from './numeros_complejos.js';

// ============================================================
// ÁLGEBRA VECTORIAL
// ============================================================

/**
 * Suma dos vectores de la misma dimensión.
 *
 * @param {number[]} v1 - Primer vector.
 * @param {number[]} v2 - Segundo vector.
 * @returns {number[]} Vector resultante de la suma.
 */
export { sumaVectores } from './algebra_vectores.js';

/**
 * Resta dos vectores de la misma dimensión.
 *
 * @param {number[]} v1 - Vector minuendo.
 * @param {number[]} v2 - Vector sustraendo.
 * @returns {number[]} Vector resultante de la resta.
 */
export { restaVectores } from './algebra_vectores.js';

/**
 * Calcula el producto punto de dos vectores.
 *
 * @param {number[]} v1 - Primer vector.
 * @param {number[]} v2 - Segundo vector.
 * @returns {number} Resultado del producto punto.
 */
export { productoPunto } from './algebra_vectores.js';

/**
 * Calcula el producto cruz de dos vectores de dimensión 3.
 *
 * @param {number[]} v1 - Primer vector de dimensión 3.
 * @param {number[]} v2 - Segundo vector de dimensión 3.
 * @returns {number[]} Vector resultante del producto cruz.
 */
export { productoCruz } from './algebra_vectores.js';

/**
 * Calcula la magnitud o norma euclidiana de un vector.
 *
 * @param {number[]} v - Vector cuyos elementos son números finitos.
 * @returns {number} Magnitud del vector.
 */
export { magnitudVector } from './algebra_vectores.js';

/**
 * Normaliza un vector dividiéndolo entre su magnitud.
 *
 * @param {number[]} v - Vector no nulo que se desea normalizar.
 * @returns {number[]} Vector unitario en la dirección original.
 */
export { normalizarVector } from './algebra_vectores.js';

/**
 * Multiplica un vector por un escalar.
 *
 * @param {number} escalar - Número finito por el que se multiplica el vector.
 * @param {number[]} v - Vector que se desea multiplicar.
 * @returns {number[]} Vector resultante de la multiplicación.
 */
export { escalarPorVector } from './algebra_vectores.js';
