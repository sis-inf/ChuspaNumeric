import js from '@eslint/js';
import globals from 'globals';

/**
 * Configuración de ESLint para el proyecto ChuspaNumeric.
 *
 * Define las reglas de análisis estático, las opciones
 * del lenguaje y las variables globales del proyecto.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  // Configuración recomendada de JavaScript.
  js.configs.recommended,

  {
    /**
     * Archivos a los que se aplica esta configuración.
     *
     * @type {string[]}
     */
    files: ['src/**/*.js', 'tests/**/*.js'],

    /**
     * Opciones del lenguaje JavaScript.
     */
    languageOptions: {
      /**
       * Versión de ECMAScript utilizada.
       *
       * @type {number}
       */
      ecmaVersion: 2022,

      /**
       * Sistema de módulos utilizado.
       *
       * @type {string}
       */
      sourceType: 'module',

      /**
       * Variables globales disponibles en Node.js.
       */
      globals: {
        ...globals.node
      }
    },

    /**
     * Reglas de análisis estático del proyecto.
     */
    rules: {
      semi: ['error', 'always'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-vars': 'warn',
      eqeqeq: 'error',
      'prefer-arrow-callback': 'error',
      complexity: ['error', 15]
    }
  },

  {
    /**
     * Archivos de pruebas a los que se aplica esta configuración.
     *
     * @type {string[]}
     */
    files: ['tests/**/*.js'],

    /**
     * Variables globales proporcionadas por Jest.
     */
    languageOptions: {
      globals: {
        ...globals.jest
      }
    }
  }
];
