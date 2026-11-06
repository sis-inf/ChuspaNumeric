/**
 * Índice de métodos de integración numérica.
 *
 * Re-exporta los métodos de integración numérica de esta carpeta:
 * trapecio, Simpson (1/3, 3/8, compuesto y adaptativo), Romberg,
 * Gauss-Legendre, derivada numérica e integración Monte Carlo con error
 * estándar (issue #659).
 */
export { integracionMonteCarlo } from './monte_carlo.js';
export { trapecio } from './trapecio.js';
export { simpson13 } from './simpson-13.js';
export { simpson38 } from './simpson-38.js';
export { simpsonCompuesto } from './simpson_compuesto.js';
export { simpsonAdaptativo } from './simpson_adaptativo.js';
export { romberg } from './romberg.js';
export { default as gaussLegendre } from './gauss_legendre.js';
export { derivative } from './derivative.js';
