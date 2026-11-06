/**
 * Módulo de estadística descriptiva básica.
 *
 * Proporciona funciones para análisis de dispersión de resultados,
 * útil tanto de forma independiente como para métodos estocásticos
 * (ej. Monte Carlo).
 */

/**
 * Valida que los datos sean un array no vacío de números.
 * @param {number[]} datos - Array de números
 * @throws {Error} Si los datos no son válidos
 */
function validarDatos(datos) {
  if (!Array.isArray(datos)) {
    throw new Error('Los datos deben ser un array');
  }
  if (datos.length === 0) {
    throw new Error('El array de datos no puede estar vacío');
  }
  if (!datos.every(d => typeof d === 'number' && !isNaN(d) && isFinite(d))) {
    throw new Error('Todos los elementos deben ser números finitos');
  }
}

/**
 * Calcula la media aritmética de un conjunto de datos.
 *
 * @param {number[]} datos - Array de números
 * @returns {number} La media aritmética
 * @throws {Error} Si los datos no son válidos
 *
 * @example
 * media([1, 2, 3, 4, 5]) // 3
 * media([10, 20, 30]) // 20
 */
export function media(datos) {
  validarDatos(datos);
  const suma = datos.reduce((acc, val) => acc + val, 0);
  return suma / datos.length;
}

/**
 * Calcula la varianza de un conjunto de datos.
 *
 * @param {number[]} datos - Array de números
 * @param {boolean} [poblacional=false] - Si true, calcula varianza poblacional (divisor n).
 *                                        Si false, calcula varianza muestral (divisor n-1).
 * @returns {number} La varianza
 * @throws {Error} Si los datos no son válidos o hay menos de 2 elementos para muestral
 *
 * @example
 * varianza([1, 2, 3, 4, 5]) // 2.5 (muestral)
 * varianza([1, 2, 3, 4, 5], true) // 2 (poblacional)
 */
export function varianza(datos, poblacional = false) {
  validarDatos(datos);

  if (!poblacional && datos.length < 2) {
    throw new Error('Se necesitan al menos 2 datos para calcular la varianza muestral');
  }

  const mediaVal = media(datos);
  const sumaCuadrados = datos.reduce((acc, val) => acc + Math.pow(val - mediaVal, 2), 0);
  const divisor = poblacional ? datos.length : datos.length - 1;

  return sumaCuadrados / divisor;
}

/**
 * Calcula la desviación estándar de un conjunto de datos.
 *
 * @param {number[]} datos - Array de números
 * @param {boolean} [poblacional=false] - Si true, desviación estándar poblacional.
 *                                        Si false, desviación estándar muestral.
 * @returns {number} La desviación estándar
 * @throws {Error} Si los datos no son válidos
 *
 * @example
 * desviacionEstandar([1, 2, 3, 4, 5]) // ≈ 1.581 (muestral)
 * desviacionEstandar([1, 2, 3, 4, 5], true) // ≈ 1.414 (poblacional)
 */
export function desviacionEstandar(datos, poblacional = false) {
  return Math.sqrt(varianza(datos, poblacional));
}

/**
 * Calcula la mediana de un conjunto de datos.
 *
 * Para arrays con longitud par, devuelve el promedio de los dos valores centrales.
 *
 * @param {number[]} datos - Array de números
 * @returns {number} La mediana
 * @throws {Error} Si los datos no son válidos
 *
 * @example
 * mediana([1, 2, 3, 4, 5]) // 3
 * mediana([1, 2, 3, 4]) // 2.5
 * mediana([5, 2, 1, 3, 4]) // 3 (ordena internamente)
 */
export function mediana(datos) {
  validarDatos(datos);

  const ordenados = [...datos].sort((a, b) => a - b);
  const n = ordenados.length;
  const mitad = Math.floor(n / 2);

  if (n % 2 === 0) {
    return (ordenados[mitad - 1] + ordenados[mitad]) / 2;
  } else {
    return ordenados[mitad];
  }
}

/**
 * Calcula la moda de un conjunto de datos.
 *
 * Devuelve un array con los valores de mayor frecuencia, en orden ascendente.
 * Si todos los valores son únicos (ninguno se repite), devuelve un array vacío.
 *
 * @param {number[]} datos - Array de números
 * @returns {number[]} Valores más frecuentes, o [] si todos son únicos
 * @throws {Error} Si los datos no son válidos
 *
 * @example
 * moda([1, 2, 2, 3]) // [2]
 * moda([1, 1, 2, 2, 3]) // [1, 2]
 * moda([1, 2, 3]) // []
 */
export function moda(datos) {
  validarDatos(datos);

  const frecuencias = new Map();
  for (const valor of datos) {
    frecuencias.set(valor, (frecuencias.get(valor) || 0) + 1);
  }

  const maxFrecuencia = Math.max(...frecuencias.values());
  if (maxFrecuencia === 1) {
    return [];
  }

  return [...frecuencias.entries()]
    .filter(([, frecuencia]) => frecuencia === maxFrecuencia)
    .map(([valor]) => valor)
    .sort((a, b) => a - b);
}

/**
 * Calcula el rango intercuartílico (IQR = Q3 - Q1) de un conjunto de datos.
 *
 * Los datos se ordenan internamente. Q1 es la mediana de la mitad inferior y
 * Q3 la mediana de la mitad superior; si la cantidad de datos es impar, la
 * mediana global no se incluye en ninguna de las dos mitades. Con un solo
 * dato el rango es 0.
 *
 * @param {number[]} datos - Array de números
 * @returns {number} El rango intercuartílico
 * @throws {Error} Si los datos no son válidos
 *
 * @example
 * rangoIntercuartilico([1, 2, 3, 4, 5, 6, 7]) // 4 (Q1 = 2, Q3 = 6)
 * rangoIntercuartilico([1, 2, 3, 4]) // 2 (Q1 = 1.5, Q3 = 3.5)
 */
export function rangoIntercuartilico(datos) {
  validarDatos(datos);

  const ordenados = [...datos].sort((a, b) => a - b);
  const n = ordenados.length;
  if (n === 1) {
    return 0;
  }

  const mitad = Math.floor(n / 2);
  const inferior = ordenados.slice(0, mitad);
  const superior = ordenados.slice(n % 2 === 0 ? mitad : mitad + 1);

  return mediana(superior) - mediana(inferior);
}
