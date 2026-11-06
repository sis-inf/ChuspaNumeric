/**
 * Índice de operaciones matriciales.
 *
 * Re-exporta operaciones básicas de álgebra de matrices (issue #650).
 */
export {
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar
} from './algebra_matrices.js';

export { normaEuclideana, normaInfinita, normaFrobenius } from './norma_matriz.js';
export { determinanteSarrus } from './determinante_sarrus.js';
export { calcularRango } from './rango.js';
export { calcularNumeroCondicion } from './numero_condicion.js';
