/**
 * Índice de utilidades.
 *
 * Re-exporta funciones de estadística descriptiva (issue #659)
 * y generadores de matrices de prueba (issue #651).
 */
export {
  media,
  varianza,
  desviacionEstandar,
  mediana
} from './estadistica.js';

export {
  matrizIdentidad,
  matrizHilbert,
  matrizDiagonalDominante,
  matrizSimetricaDefinidaPositiva,
  esDiagonalDominante,
  esSimetrica,
} from './generadores_matrices.js';

export {
  sumaComplejos,
  productoComplejos,
  moduloComplejo,
  conjugadoComplejo,
  divisionComplejos,
} from './numeros_complejos.js';

export {
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
  escalarPorVector,
} from './algebra_vectores.js';
