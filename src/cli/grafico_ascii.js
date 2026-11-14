import { ErrorDominio, ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarIntervalo } from '../utils/validaciones.js';

/**
 * Obtiene las iteraciones de un resultado numérico.
 *
 * Acepta directamente un arreglo o un objeto que contenga
 * una propiedad iteraciones con un arreglo.
 *
 * @param {Object|Array} datos - Resultado del método numérico.
 * @returns {Array} Lista de iteraciones o un arreglo vacío.
 */
function obtenerIteraciones(datos) {
  if (Array.isArray(datos)) {
    return datos;
  }

  if (datos && Array.isArray(datos.iteraciones)) {
    return datos.iteraciones;
  }

  return [];
}

/**
 * Obtiene el primer valor de error numérico y finito disponible
 * en una iteración.
 *
 * Busca entre diferentes nombres de propiedades utilizados
 * por los métodos numéricos.
 *
 * @param {Object} iteracion - Datos de una iteración.
 * @returns {?number} Valor absoluto del error o null si no existe.
 */
function obtenerError(iteracion) {
  const posiblesCampos = [
    'error',
    'errorAbsoluto',
    'error_relativo',
    'errorRelativo',
    'ea',
    'er',
  ];

  for (const campo of posiblesCampos) {
    const valor = iteracion[campo];

    if (typeof valor === 'number' && Number.isFinite(valor)) {
      return Math.abs(valor);
    }
  }

  return null;
}

/**
 * Formatea un número para mostrarlo de manera legible en el gráfico.
 *
 * Utiliza notación científica para valores muy pequeños o grandes,
 * y precisión de cuatro dígitos para los demás valores.
 *
 * @param {number} valor - Número que se desea formatear.
 * @returns {string} Representación textual del número.
 */
function formatearNumero(valor) {
  if (valor === 0) {
    return '0';
  }

  const absoluto = Math.abs(valor);

  if (absoluto < 0.001 || absoluto >= 1000) {
    return valor.toExponential(2);
  }

  return valor.toPrecision(4);
}

/**
 * Genera un gráfico ASCII simple para visualizar la convergencia del error.
 *
 * El gráfico usa caracteres de bloque Unicode y escala automáticamente el
 * ancho disponible según la terminal. Está pensado para resultados de métodos
 * iterativos que devuelven un arreglo `iteraciones` con un campo de error.
 *
 * @param {Object|Array} datos - Resultado del método o arreglo de iteraciones.
 * @param {Object} [opciones={}] - Opciones de visualización.
 * @param {number} [opciones.ancho] - Resolución horizontal máxima en columnas.
 * Si no se especifica, utiliza las columnas de la terminal o 80 por defecto.
 * @returns {string} Gráfico ASCII listo para imprimir en terminal.
 */
export function generarGraficoAscii(datos, opciones = {}) {
  const iteraciones = obtenerIteraciones(datos);
  const puntos = iteraciones
    .map((iteracion, indice) => ({
      iteracion: iteracion.n ?? indice + 1,
      error: obtenerError(iteracion),
    }))
    .filter((punto) => punto.error !== null);

  if (puntos.length === 0) {
    return 'No hay datos de error disponibles para graficar.';
  }

  const anchoTerminal =
    opciones.ancho ??
    process.stdout.columns ??
    80;

  const anchoEtiqueta = 24;
  const anchoGrafico = Math.max(10, anchoTerminal - anchoEtiqueta);
  const maxError = Math.max(...puntos.map((punto) => punto.error));

  const lineas = [
    'Gráfico ASCII de convergencia',
    'Iteración | Error        | Gráfico',
    '-'.repeat(Math.min(anchoTerminal, anchoEtiqueta + anchoGrafico)),
  ];

 for (const punto of puntos) {
  const proporcion = maxError === 0 ? 0 : punto.error / maxError;
  const longitud = punto.error === 0 ? 1 : Math.max(1, Math.round(proporcion * anchoGrafico));
  const barra = '\u2588'.repeat(longitud);

  const iteracionTexto = String(punto.iteracion).padStart(9, ' ');
  const errorTexto = formatearNumero(punto.error).padStart(12, ' ');

  lineas.push(`${iteracionTexto} | ${errorTexto} | ${barra}`);
}
  return lineas.join('\n');
}

/**
 * Valida los parámetros de graficarFuncion y devuelve [xMin, xMax].
 *
 * @param {*} f - Función a graficar.
 * @param {*} intervalo - Intervalo [xMin, xMax].
 * @param {*} ancho - Columnas de la zona de dibujo.
 * @param {*} alto - Filas de la zona de dibujo.
 * @returns {number[]} [xMin, xMax] ya validados.
 * @throws {ErrorParametros} Si algún parámetro no es válido.
 */
function validarEntradasGrafico(f, intervalo, ancho, alto) {
  validarFuncion(f, 'f');

  if (!Array.isArray(intervalo) || intervalo.length !== 2) {
    throw new ErrorParametros(
      `ChuspaNumeric: el intervalo debe ser un arreglo [xMin, xMax]. Se recibió: ${intervalo}.`
    );
  }

  const [xMin, xMax] = intervalo;
  validarIntervalo(xMin, xMax);

  if (!Number.isInteger(ancho) || ancho < 10) {
    throw new ErrorParametros(
      `ChuspaNumeric: 'ancho' debe ser un entero mayor o igual que 10. Se recibió: ${ancho}.`
    );
  }

  if (!Number.isInteger(alto) || alto < 5) {
    throw new ErrorParametros(
      `ChuspaNumeric: 'alto' debe ser un entero mayor o igual que 5. Se recibió: ${alto}.`
    );
  }

  return [xMin, xMax];
}

/**
 * Evalúa f en `ancho` valores de x equiespaciados y omite los no finitos.
 *
 * @param {Function} f - Función a evaluar.
 * @param {number} xMin - Límite inferior.
 * @param {number} xMax - Límite superior.
 * @param {number} ancho - Número de muestras (una por columna).
 * @returns {{ col: number, y: number }[]} Puntos con valor finito.
 */
function evaluarPuntos(f, xMin, xMax, ancho) {
  const puntos = [];

  for (let col = 0; col < ancho; col++) {
    const x = xMin + ((xMax - xMin) * col) / (ancho - 1);
    let y;
    try {
      y = f(x);
    } catch {
      y = NaN;
    }
    if (typeof y === 'number' && Number.isFinite(y)) {
      puntos.push({ col, y });
    }
  }

  return puntos;
}

/**
 * Calcula y valida los límites verticales a partir de los puntos evaluados.
 *
 * @param {{ col: number, y: number }[]} puntos - Puntos finitos de la gráfica.
 * @returns {{ yMin: number, yMax: number }} Límites verticales validados.
 * @throws {ErrorParametros} Si los límites verticales son iguales o no finitos.
 */
function rangoVertical(puntos) {
  const yMin = Math.min(...puntos.map((p) => p.y));
  const yMax = Math.max(...puntos.map((p) => p.y));

  if (!Number.isFinite(yMin) || !Number.isFinite(yMax) || yMin === yMax) {
    throw new ErrorParametros(
      `ChuspaNumeric: el rango vertical debe tener límites finitos y diferentes. Se recibió: [${yMin}, ${yMax}].`
    );
  }

  return { yMin, yMax };
}

/**
 * Calcula la fila de la cuadrícula correspondiente a un valor y.
 *
 * @param {number} y - Coordenada vertical del punto.
 * @param {Object} escala - Límites y dimensiones del gráfico.
 * @returns {number} Índice de la fila en la cuadrícula.
 */
function filaDe(y, escala) {
  return Math.round(((escala.yMax - y) / (escala.yMax - escala.yMin)) * (escala.alto - 1));
}

/**
 * Calcula la columna de la cuadrícula correspondiente a un valor x.
 *
 * @param {number} x - Coordenada horizontal del punto.
 * @param {Object} escala - Límites y dimensiones del gráfico.
 * @returns {number} Índice de la columna en la cuadrícula.
 */
function colDe(x, escala) {
  return Math.round(((x - escala.xMin) / (escala.xMax - escala.xMin)) * (escala.ancho - 1));
}

/**
 * Dibuja los ejes x = 0 e y = 0 en la cuadrícula, solo si caen dentro del rango.
 *
 * @param {string[][]} cuadricula - Cuadrícula de caracteres (se modifica).
 * @param {Object} escala - Rango y tamaño del gráfico.
 */
function dibujarEjes(cuadricula, escala) {
  if (escala.yMin <= 0 && escala.yMax >= 0) {
    const fila = filaDe(0, escala);
    for (let c = 0; c < escala.ancho; c++) {
      cuadricula[fila][c] = '-';
    }
  }

  if (escala.xMin <= 0 && escala.xMax >= 0) {
    const columna = colDe(0, escala);
    for (let r = 0; r < escala.alto; r++) {
      cuadricula[r][columna] = cuadricula[r][columna] === '-' ? '+' : '|';
    }
  }
}

/**
 * Convierte la cuadrícula en texto, con las etiquetas de los extremos de cada eje.
 *
 * @param {string[][]} cuadricula - Cuadrícula de caracteres.
 * @param {Object} escala - Rango y tamaño del gráfico.
 * @returns {string} Gráfico en texto plano.
 */
function componerGrafico(cuadricula, escala) {
  const etiquetaMax = formatearNumero(escala.yMax);
  const etiquetaMin = formatearNumero(escala.yMin);
  const margen = Math.max(etiquetaMax.length, etiquetaMin.length);

  const lineas = cuadricula.map((fila, r) => {
    let etiqueta = '';
    if (r === 0) {
      etiqueta = etiquetaMax;
    } else if (r === escala.alto - 1) {
      etiqueta = etiquetaMin;
    }
    return `${etiqueta.padStart(margen)} ${fila.join('')}`;
  });

  const izquierda = formatearNumero(escala.xMin);
  const derecha = formatearNumero(escala.xMax);
  const hueco = Math.max(1, escala.ancho - izquierda.length - derecha.length);
  lineas.push(`${' '.repeat(margen)} ${izquierda}${' '.repeat(hueco)}${derecha}`);

  return lineas.join('\n');
}

/**
 * Dibuja en texto plano la curva de una función y = f(x) en un intervalo.
 *
 * Evalúa f en `ancho` valores de x equiespaciados, escala automáticamente los ejes
 * (el horizontal con el intervalo y el vertical con el mínimo y el máximo de los
 * valores calculados), dibuja los ejes x = 0 e y = 0 cuando caen dentro del rango y marca
 * los puntos de la curva con '*'. Los puntos donde f no da un número finito (o lanza
 * un error) se omiten.
 *
 * @param {Function} f - Función matemática que recibe x y devuelve y.
 * @param {number[]} intervalo - Límites horizontales [xMin, xMax], con xMin < xMax.
 * @param {number} [ancho=60] - Resolución horizontal: número de columnas de la gráfica (entero >= 10).
 * @param {number} [alto=20] - Resolución vertical: número de filas de la gráfica (entero >= 5).
 * @returns {string} Gráfico en texto plano listo para imprimir en la terminal.
 * @throws {ErrorParametros} Si f no es una función, el intervalo es inválido o ancho/alto no son válidos.
 * @throws {ErrorDominio} Si f no produce ningún valor finito en el intervalo.
 *
 * @example
 * console.log(graficarFuncion((x) => x * x, [-2, 2], 40, 12));
 */
export function graficarFuncion(f, intervalo, ancho = 60, alto = 20) {
  const [xMin, xMax] = validarEntradasGrafico(f, intervalo, ancho, alto);
  const puntos = evaluarPuntos(f, xMin, xMax, ancho);

  if (puntos.length === 0) {
    throw new ErrorDominio(
      `ChuspaNumeric: f no produjo valores finitos en el intervalo [${xMin}, ${xMax}].`
    );
  }

  const escala = { xMin, xMax, ...rangoVertical(puntos), ancho, alto };
  const cuadricula = Array.from({ length: alto }, () => new Array(ancho).fill(' '));

  dibujarEjes(cuadricula, escala);
  for (const p of puntos) {
    cuadricula[filaDe(p.y, escala)][p.col] = '*';
  }

  return componerGrafico(cuadricula, escala);
}
