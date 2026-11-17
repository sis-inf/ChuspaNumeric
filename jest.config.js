/**
 * Configuración de Jest para ejecutar las pruebas automatizadas
 * del proyecto ChuspaNumeric.
 *
 * Define el entorno de ejecución, los patrones de búsqueda
 * de pruebas y los parámetros para recopilar y evaluar
 * la cobertura del código.
 *
 * @type {import('jest').Config}
 */
export default {
  /**
   * Entorno donde se ejecutan las pruebas.
   *
   * @type {string}
   */
  testEnvironment: 'node',

  /**
   * Patrón para localizar los archivos de pruebas.
   *
   * @type {string[]}
   */
  testMatch: ['**/tests/**/*.test.js'],

  /**
   * Configuración de transformación de archivos.
   *
   * Se mantiene vacío para no aplicar transformaciones adicionales.
   *
   * @type {Object}
   */
  transform: {},

  /**
   * Activa la recopilación de cobertura del código.
   *
   * @type {boolean}
   */
  collectCoverage: true,

  /**
   * Directorio donde se almacenan los informes de cobertura.
   *
   * @type {string}
   */
  coverageDirectory: 'coverage/',

  /**
   * Archivos incluidos y excluidos en el análisis de cobertura.
   *
   * @type {string[]}
   */
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
  ],

  /**
   * Establece los porcentajes mínimos de cobertura requeridos.
   *
   * @type {Object}
   * @property {Object} global - Umbrales globales de cobertura.
   * @property {number} global.branches - Cobertura mínima de ramas.
   * @property {number} global.functions - Cobertura mínima de funciones.
   * @property {number} global.lines - Cobertura mínima de líneas.
   * @property {number} global.statements - Cobertura mínima de instrucciones.
   */
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};