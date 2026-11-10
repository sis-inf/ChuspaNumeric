/**
 * @file unidades.js
 * @description Utilidades de conversión de unidades físicas para aplicaciones
 * de ingeniería. Cubre 4 categorías iniciales: longitud, temperatura, presión
 * y energía.
 *
 * El diseño usa una tabla de factores de conversión hacia una unidad base por
 * categoría (metro, kelvin, pascal, julio), lo que permite agregar nuevas
 * unidades fácilmente sin tocar la función de conversión.
 *
 * Para agregar una nueva unidad a una categoría existente, agregar una entrada
 * al objeto correspondiente en FACTORES con su factor de conversión a la unidad
 * base. Para agregar una nueva categoría, agregar una nueva función conversora
 * siguiendo el mismo patrón.
 */

import { ErrorParametros } from '../core/errores.js';

// ---------------------------------------------------------------------------
// Tablas de factores de conversión
// Cada valor representa cuántas unidades base equivalen a 1 unidad de esa clave.
// Unidad base por categoría: metro (m), pascal (Pa), julio (J).
// (Temperatura se maneja aparte porque sus conversiones no son lineales simples.)
// ---------------------------------------------------------------------------

/**
 * Factores de conversión de longitud a metros (m).
 * @type {Record<string, number>}
 */
const LONGITUD_A_METROS = {
  m:    1,
  km:   1000,
  cm:   0.01,
  mm:   0.001,
  ft:   0.3048,
  in:   0.0254,
  yd:   0.9144,
  mi:   1609.344,
};

/**
 * Factores de conversión de presión a pascales (Pa).
 * @type {Record<string, number>}
 */
const PRESION_A_PA = {
  Pa:   1,
  kPa:  1000,
  MPa:  1e6,
  bar:  1e5,
  atm:  101325,
  psi:  6894.757293168,
  mmHg: 133.322387415,
  torr: 133.322387415,
};

/**
 * Factores de conversión de energía a julios (J).
 * @type {Record<string, number>}
 */
const ENERGIA_A_J = {
  J:   1,
  kJ:  1000,
  MJ:  1e6,
  cal: 4.184,
  kcal: 4184,
  kWh: 3.6e6,
  Wh:  3600,
  eV:  1.602176634e-19,
  BTU: 1055.05585262,
};

// ---------------------------------------------------------------------------
// Funciones de conversión
// ---------------------------------------------------------------------------

/**
 * Convierte una longitud de una unidad a otra.
 *
 * Unidades soportadas: `m`, `km`, `cm`, `mm`, `ft`, `in`, `yd`, `mi`.
 *
 * @param {number} valor - Valor numérico a convertir.
 * @param {string} desde - Unidad de origen.
 * @param {string} hasta - Unidad de destino.
 * @returns {number} Valor convertido en las unidades de destino.
 * @throws {ErrorParametros} Si el valor no es un número finito o las unidades
 *   no están soportadas.
 *
 * @example
 * convertirLongitud(1, 'ft', 'm');   // 0.3048
 * convertirLongitud(1, 'm', 'ft');   // 3.2808398950131235
 * convertirLongitud(1, 'mi', 'km');  // 1.609344
 */
export function convertirLongitud(valor, desde, hasta) {
  _validarValor(valor, 'convertirLongitud');
  _validarUnidad(desde, LONGITUD_A_METROS, 'convertirLongitud', 'longitud');
  _validarUnidad(hasta, LONGITUD_A_METROS, 'convertirLongitud', 'longitud');
  return (valor * LONGITUD_A_METROS[desde]) / LONGITUD_A_METROS[hasta];
}

/**
 * Convierte una temperatura de una escala a otra.
 *
 * Escalas soportadas: `C` (Celsius), `F` (Fahrenheit), `K` (Kelvin).
 *
 * Las conversiones de temperatura no son lineales simples (involucran un
 * desplazamiento además del factor), por lo que se implementan explícitamente
 * en lugar de usar la tabla de factores.
 *
 * @param {number} valor - Valor numérico a convertir.
 * @param {string} desde - Escala de origen: `'C'`, `'F'` o `'K'`.
 * @param {string} hasta - Escala de destino: `'C'`, `'F'` o `'K'`.
 * @returns {number} Valor convertido en la escala de destino.
 * @throws {ErrorParametros} Si el valor no es un número finito, las escalas no
 *   están soportadas, o el valor resulta en una temperatura por debajo del
 *   cero absoluto en la escala de destino.
 *
 * @example
 * convertirTemperatura(100, 'C', 'F');  // 212
 * convertirTemperatura(32, 'F', 'C');   //   0
 * convertirTemperatura(0, 'C', 'K');    // 273.15
 * convertirTemperatura(300, 'K', 'C'); //  26.85
 */
export function convertirTemperatura(valor, desde, hasta) {
  _validarValor(valor, 'convertirTemperatura');

  const escalas = ['C', 'F', 'K'];
  if (!escalas.includes(desde)) {
    throw new ErrorParametros(
      `ChuspaNumeric.convertirTemperatura: unidad de origen "${desde}" no soportada. ` +
      `Escalas disponibles: ${escalas.join(', ')}.`
    );
  }
  if (!escalas.includes(hasta)) {
    throw new ErrorParametros(
      `ChuspaNumeric.convertirTemperatura: unidad de destino "${hasta}" no soportada. ` +
      `Escalas disponibles: ${escalas.join(', ')}.`
    );
  }

  // Convertir primero a Celsius como escala intermedia
  let celsius;
  if (desde === 'C') {
    celsius = valor;
  } else if (desde === 'F') {
    celsius = (valor - 32) * (5 / 9);
  } else {
    // desde === 'K'
    celsius = valor - 273.15;
  }

  // Validar que la temperatura en Celsius no esté por debajo del cero absoluto
  const CERO_ABSOLUTO_C = -273.15;
  if (celsius < CERO_ABSOLUTO_C - 1e-9) {
    throw new ErrorParametros(
      `ChuspaNumeric.convertirTemperatura: el valor ${valor} ${desde} corresponde a ` +
      `${celsius.toFixed(4)} °C, que está por debajo del cero absoluto (-273.15 °C).`
    );
  }

  // Convertir desde Celsius a la escala de destino
  if (hasta === 'C') return celsius;
  if (hasta === 'F') return celsius * (9 / 5) + 32;
  return celsius + 273.15; // hasta === 'K'
}

/**
 * Convierte una presión de una unidad a otra.
 *
 * Unidades soportadas: `Pa`, `kPa`, `MPa`, `bar`, `atm`, `psi`, `mmHg`, `torr`.
 *
 * @param {number} valor - Valor numérico a convertir. Debe ser ≥ 0 (no existe
 *   presión negativa en términos absolutos, aunque se acepta para presiones
 *   manométricas relativas).
 * @param {string} desde - Unidad de origen.
 * @param {string} hasta - Unidad de destino.
 * @returns {number} Valor convertido en las unidades de destino.
 * @throws {ErrorParametros} Si el valor no es un número finito o las unidades
 *   no están soportadas.
 *
 * @example
 * convertirPresion(1, 'atm', 'Pa');   // 101325
 * convertirPresion(1, 'atm', 'psi');  // 14.695948775513449
 * convertirPresion(101325, 'Pa', 'bar'); // 1.01325
 */
export function convertirPresion(valor, desde, hasta) {
  _validarValor(valor, 'convertirPresion');
  _validarUnidad(desde, PRESION_A_PA, 'convertirPresion', 'presión');
  _validarUnidad(hasta, PRESION_A_PA, 'convertirPresion', 'presión');
  return (valor * PRESION_A_PA[desde]) / PRESION_A_PA[hasta];
}

/**
 * Convierte una energía de una unidad a otra.
 *
 * Unidades soportadas: `J`, `kJ`, `MJ`, `cal`, `kcal`, `kWh`, `Wh`, `eV`, `BTU`.
 *
 * @param {number} valor - Valor numérico a convertir.
 * @param {string} desde - Unidad de origen.
 * @param {string} hasta - Unidad de destino.
 * @returns {number} Valor convertido en las unidades de destino.
 * @throws {ErrorParametros} Si el valor no es un número finito o las unidades
 *   no están soportadas.
 *
 * @example
 * convertirEnergia(1, 'kWh', 'J');    // 3600000
 * convertirEnergia(1, 'kcal', 'J');   // 4184
 * convertirEnergia(1, 'BTU', 'kJ');   // 1.05505585262
 */
export function convertirEnergia(valor, desde, hasta) {
  _validarValor(valor, 'convertirEnergia');
  _validarUnidad(desde, ENERGIA_A_J, 'convertirEnergia', 'energía');
  _validarUnidad(hasta, ENERGIA_A_J, 'convertirEnergia', 'energía');
  return (valor * ENERGIA_A_J[desde]) / ENERGIA_A_J[hasta];
}

/**
 * Devuelve las unidades disponibles para cada categoría.
 *
 * Útil para validar dinámicamente qué unidades acepta cada función antes
 * de llamarla, o para construir menús de selección en una interfaz de usuario.
 *
 * @returns {{ longitud: string[], temperatura: string[], presion: string[], energia: string[] }}
 *
 * @example
 * const { longitud } = unidadesDisponibles();
 * console.log(longitud); // ['m', 'km', 'cm', 'mm', 'ft', 'in', 'yd', 'mi']
 */
export function unidadesDisponibles() {
  return {
    longitud:     Object.keys(LONGITUD_A_METROS),
    temperatura:  ['C', 'F', 'K'],
    presion:      Object.keys(PRESION_A_PA),
    energia:      Object.keys(ENERGIA_A_J),
  };
}

// ---------------------------------------------------------------------------
// Helpers internos (no exportados)
// ---------------------------------------------------------------------------

/**
 * Valida que el valor sea un número finito.
 * @param {*} valor
 * @param {string} nombreFuncion
 */
function _validarValor(valor, nombreFuncion) {
  if (typeof valor !== 'number' || !isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombreFuncion}: el valor debe ser un número finito. ` +
      `Se recibió: ${valor} (${typeof valor}).`
    );
  }
}

/**
 * Valida que la unidad esté en la tabla de factores.
 * @param {string} unidad
 * @param {Record<string, number>} tabla
 * @param {string} nombreFuncion
 * @param {string} categoria
 */
function _validarUnidad(unidad, tabla, nombreFuncion, categoria) {
  if (!(unidad in tabla)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${nombreFuncion}: unidad "${unidad}" no soportada para ${categoria}. ` +
      `Unidades disponibles: ${Object.keys(tabla).join(', ')}.`
    );
  }
}