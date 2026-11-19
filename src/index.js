/**
 * @module src/index
 * Punto de entrada principal de la librería numérica ChuspaNumeric.
 * Agrupa los módulos por categoría y re-exporta todas las utilidades y métodos
 * numéricos en formato ESM (con compatibilidad auxiliar para CommonJS si aplica).
 */

import { regresionLineal, regresionPolinomial } from './analisis/ajuste_minimos_cuadrados.js';

import {
  diferenciaCentrada,
  diferenciaCentradaSegundaDerivada
} from './diferencias/diferencia_centrada.js';
import { diferenciasAdelanteGrado1 } from './diferencias/diferencia_hacia_adelante.js';
import { derivadaRichardson } from './diferencias/richardson.js';

import { euler } from './edo/euler.js';
import { eulerMejorado } from './edo/euler-mejorado.js';
import { metodHeun, metodoPuntoMedio } from './edo/runge_kutta_2.js';
import { rungeKutta4 } from './edo/runge_kutta_4.js';

import { derivative } from './integracion/derivative.js';
import { simpson13 } from './integracion/simpson-13.js';
import { simpson38 } from './integracion/simpson-38.js';
import { simpsonCompuesto } from './integracion/simpson_compuesto.js';
import { trapecio } from './integracion/trapecio.js';
import { puntoMedio } from './integracion/punto_medio.js';
import { integracionMonteCarlo } from './integracion/monte_carlo.js';

import { lagrange } from './interpolacion/lagrange.js';
import { lagrangeBaricentrica } from './interpolacion/lagrange_barycentrica.js';
import { linearInterpolation } from './interpolacion/linear.js';
import { newtonDD } from './interpolacion/newton-dd.js';
import { polyEval } from './interpolacion/polyEval.js';
import { splines } from './interpolacion/splines.js';
import { splineCubicoNatural } from './interpolacion/spline_cubico.js';

import { descomposicionCholesky, resolverCholesky } from './lineales/cholesky.js';
import { det2x2, det3x3 } from './lineales/determinant.js';
import { gauss } from './lineales/gauss.js';
import { gaussPivoteoParcial } from './lineales/gauss-pivoteo-parcial.js';
import { gaussJordan } from './lineales/gauss-jordan.js';
import { gaussSeidel } from './lineales/gauss-seidel.js';
import { jacobi } from './lineales/jacobi.js';
import { lu } from './lineales/lu.js';
import { sor } from './lineales/sor.js';

import { determinanteSarrus } from './matricial/determinante_sarrus.js';
import {
  normaEuclideana,
  normaInfinita,
  normaFrobenius
} from './matricial/norma_matriz.js';

import { calcularNumeroCondicion } from './matricial/numero_condicion.js';
import {
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar
} from './matricial/algebra_matrices.js';

import { biseccion } from './no-lineales/biseccion.js';
import { falsaPosicion } from './no-lineales/falsa-posicion.js';
import { muller } from './no-lineales/muller.js';
import { halley } from './no-lineales/halley.js';
import { newtonRaphson } from './no-lineales/newton-raphson.js';
import { puntoFijo } from './no-lineales/punto-fijo.js';
import { secante } from './no-lineales/secante.js';

import { evaluarHorner } from './polinomios/horner.js';

// Importaciones de estadística descriptiva (issue #659)
import {
  media,
  varianza,
  desviacionEstandar,
  mediana
} from './utils/estadistica.js';

// Importaciones de generadores de matrices de prueba (issue #651)
import {
  matrizIdentidad,
  matrizHilbert,
  matrizDiagonalDominante,
  matrizSimetricaDefinidaPositiva,
  esDiagonalDominante,
  esSimetrica,
} from './utils/generadores_matrices.js';

/**
 * Re-exporta el método de regresión no lineal por Gauss-Newton.
 */
import { regresionNoLineal } from './analisis/regresion_no_lineal.js';

/**
 * Re-exporta las utilidades de conversión de unidades físicas.
 */
import {
  convertirLongitud,
  convertirTemperatura,
  convertirPresion,
  convertirEnergia,
  unidadesDisponibles,
} from './utils/unidades.js';

/**
 * Re-exporta las utilidades de números complejos.
 */
import {
  sumaComplejos,
  productoComplejos,
  moduloComplejo,
  conjugadoComplejo,
  divisionComplejos,
} from './utils/numeros_complejos.js';

/**
 * Re-exporta la función de exportación a Markdown.
 */
import { exportarMarkdown } from './io/exportar_markdown.js';

/**
 * Re-exporta el generador de números pseudoaleatorios con semilla reproducible.
 */
import { crearGeneradorAleatorio } from './utils/prng.js';

/**
 * Re-exporta las utilidades básicas de álgebra de vectores.
 */
import {
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
  escalarPorVector,
} from './utils/algebra_vectores.js';

/**
 * Re-exporta el cálculo de matriz inversa mediante Gauss-Jordan.
 */
import { calcularInversa } from './lineales/inversa.js';

/**
 * Re-exporta el método de integración por cuadratura de Gauss-Legendre.
 */
import gaussLegendre from './integracion/gauss_legendre.js';

/**
 * @typedef {Object} LibreriaChuspaNumeric
 * @property {Record<string, Function>} lineales Métodos para sistemas lineales y determinantes.
 * @property {Record<string, Function>} noLineales Métodos para ecuaciones no lineales.
 * @property {Record<string, Function>} interpolacion Métodos de interpolación numérica.
 * @property {Record<string, Function>} integracion Métodos de integración numérica y derivación.
 * @property {Record<string, Function>} edo Métodos numéricos para ecuaciones diferenciales ordinarias.
 * @property {Record<string, Function>} analisis Métodos de ajuste y análisis numérico.
 * @property {Record<string, Function>} diferencias Métodos de diferencias finitas y Richardson.
 * @property {Record<string, Function>} matricial Operaciones y normas matriciales.
 * @property {Record<string, Function>} polinomios Evaluación de polinomios.
 * @property {Record<string, Function>} estadistica Estadística descriptiva básica.
 * @property {Record<string, Function>} generadoresMatrices Generadores y validadores de matrices de prueba.
 */

/** @type {Record<string, Function>} */
const lineales = {
  gauss,
  gaussPivoteoParcial,
  gaussJordan,
  jacobi,
  gaussSeidel,
  sor,
  lu,
  det2x2,
  det3x3,
  descomposicionCholesky,
  resolverCholesky,
  calcularInversa
};

/** @type {Record<string, Function>} */
const noLineales = {
  biseccion,
  falsaPosicion,
  newtonRaphson,
  secante,
  puntoFijo,
  muller,
  halley
};

/** @type {Record<string, Function>} */
const interpolacion = {
  lagrange,
  newtonDD,
  splines,
  linearInterpolation,
  polyEval,
  splineCubicoNatural,
  lagrangeBaricentrica
};

/** @type {Record<string, Function>} */
const integracion = {
  trapecio,
  simpson13,
  simpson38,
  derivative,
  simpsonCompuesto,
  integracionMonteCarlo,
  puntoMedio,
  gaussLegendre
};

/** @type {Record<string, Function>} */
const edo = {
  euler,
  eulerMejorado,
  rungeKutta4,
  metodHeun,
  metodoPuntoMedio
};

/** @type {Record<string, Function>} */
const analisis = {
  regresionLineal,
  regresionPolinomial,
  regresionNoLineal
};

/** @type {Record<string, Function>} */
const diferencias = {
  diferenciaCentrada,
  diferenciaCentradaSegundaDerivada,
  diferenciasAdelanteGrado1,
  derivadaRichardson
};

/** @type {Record<string, Function>} */
const matricial = {
  determinanteSarrus,
  normaEuclideana,
  normaInfinita,
  normaFrobenius,
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar,
  calcularNumeroCondicion
};

/** @type {Record<string, Function>} */
const polinomios = {
  evaluarHorner
};

/** @type {Record<string, Function>} */
const estadistica = {
  media,
  varianza,
  desviacionEstandar,
  mediana
};

/** @type {Record<string, Function>} */
const generadoresMatrices = {
  matrizIdentidad,
  matrizHilbert,
  matrizDiagonalDominante,
  matrizSimetricaDefinidaPositiva,
  esDiagonalDominante,
  esSimetrica,
};

/**
 * Construye el objeto agrupado de namespaces de ChuspaNumeric.
 *
 * @returns {LibreriaChuspaNumeric} Objeto con todos los namespaces de la librería.
 */
function crearNamespacesChuspaNumeric() {
  return {
    lineales,
    noLineales,
    interpolacion,
    integracion,
    edo,
    analisis,
    diferencias,
    matricial,
    polinomios,
    estadistica,
    generadoresMatrices,
  };
}

/** @type {LibreriaChuspaNumeric} */
const namespaces = crearNamespacesChuspaNumeric();

/** @type {Record<string, unknown>} */
const apiPublica = {
  ...namespaces,

  // exportaciones planas para acceso directo
  ...lineales,
  ...noLineales,
  ...interpolacion,
  ...integracion,
  ...edo,
  ...analisis,
  ...diferencias,
  ...matricial,
  ...polinomios,
  ...estadistica,
  ...generadoresMatrices,

  // utilidades adicionales re-exportadas
  convertirLongitud,
  convertirTemperatura,
  convertirPresion,
  convertirEnergia,
  unidadesDisponibles,
  sumaComplejos,
  productoComplejos,
  moduloComplejo,
  conjugadoComplejo,
  divisionComplejos,
  exportarMarkdown,
  crearGeneradorAleatorio,
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
  escalarPorVector,
};

export {
  lineales,
  noLineales,
  interpolacion,
  integracion,
  edo,
  analisis,
  diferencias,
  matricial,
  polinomios,
  estadistica,
  generadoresMatrices,
  crearNamespacesChuspaNumeric,

  // lineales
  gauss,
  gaussPivoteoParcial,
  gaussJordan,
  jacobi,
  gaussSeidel,
  sor,
  lu,
  det2x2,
  det3x3,
  descomposicionCholesky,
  resolverCholesky,
  calcularInversa,

  // no lineales
  biseccion,
  falsaPosicion,
  newtonRaphson,
  secante,
  puntoFijo,
  muller,
  halley,

  // interpolacion
  lagrange,
  newtonDD,
  splines,
  linearInterpolation,
  polyEval,
  splineCubicoNatural,
  lagrangeBaricentrica,

  // integracion
  trapecio,
  simpson13,
  simpson38,
  derivative,
  simpsonCompuesto,
  integracionMonteCarlo,
  puntoMedio,
  gaussLegendre,

  // edo
  euler,
  eulerMejorado,
  rungeKutta4,
  metodHeun,
  metodoPuntoMedio,

  // analisis
  regresionLineal,
  regresionPolinomial,
  regresionNoLineal,

  // diferencias
  diferenciaCentrada,
  diferenciaCentradaSegundaDerivada,
  diferenciasAdelanteGrado1,
  derivadaRichardson,

  // matricial
  determinanteSarrus,
  normaEuclideana,
  normaInfinita,
  normaFrobenius,
  sumaMatrices,
  restaMatrices,
  multiplicarMatrices,
  transpuesta,
  multiplicarEscalar,
  calcularNumeroCondicion,

  // polinomios
  evaluarHorner,

  // estadistica (issue #659)
  media,
  varianza,
  desviacionEstandar,
  mediana,

  // generadores de matrices (issue #651)
  matrizIdentidad,
  matrizHilbert,
  matrizDiagonalDominante,
  matrizSimetricaDefinidaPositiva,
  esDiagonalDominante,
  esSimetrica,

  // utilidades adicionales
  convertirLongitud,
  convertirTemperatura,
  convertirPresion,
  convertirEnergia,
  unidadesDisponibles,
  sumaComplejos,
  productoComplejos,
  moduloComplejo,
  conjugadoComplejo,
  divisionComplejos,
  exportarMarkdown,
  crearGeneradorAleatorio,
  sumaVectores,
  restaVectores,
  productoPunto,
  productoCruz,
  magnitudVector,
  normalizarVector,
  escalarPorVector,
};

export default apiPublica;

if (typeof globalThis.module !== 'undefined' && globalThis.module.exports) {
  globalThis.module.exports = {
    default: apiPublica,
    ...apiPublica,
  };
}