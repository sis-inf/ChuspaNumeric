import { crearResultado } from '../core/contrato.js';
import { ErrorNumerico, ErrorParametros } from '../core/errores.js';
import { validarNumero } from '../utils/validaciones.js';

function validarCoordenada(valor, nombre) {
  // El validador compartido convierte el valor a texto en el mensaje de error.
  if (typeof valor !== 'number') {
    throw new ErrorParametros(
      `ChuspaNumeric.lagrange: '${nombre}' debe ser un número finito. Tipo recibido: ${typeof valor}.`
    );
  }

  validarNumero(valor, nombre);
}

function validarPuntos(puntos) {
  if (!Array.isArray(puntos) || puntos.length < 2) {
    throw new ErrorParametros(
      "ChuspaNumeric.lagrange: 'puntos' debe ser un array con al menos dos pares [xi, yi]."
    );
  }

  const indicesPorXi = new Map();
  for (let i = 0; i < puntos.length; i++) {
    const punto = puntos[i];
    if (!Array.isArray(punto) || punto.length !== 2) {
      throw new ErrorParametros(
        `ChuspaNumeric.lagrange: puntos[${i}] debe ser un par [xi, yi].`
      );
    }

    const xi = punto[0];
    validarCoordenada(xi, `puntos[${i}][0]`);
    validarCoordenada(punto[1], `puntos[${i}][1]`);

    const indiceAnterior = indicesPorXi.get(xi);
    if (indiceAnterior !== undefined) {
      throw new ErrorParametros(
        `ChuspaNumeric.lagrange: puntos[${indiceAnterior}] y puntos[${i}] tienen el mismo valor de xi (${xi}).`
      );
    }
    indicesPorXi.set(xi, i);
  }
}

/**
 * Interpolación de Lagrange para estimar el valor de un polinomio en x.
 *
 * @param {Object} parametros - Parámetros de la interpolación.
 * @param {Array<[number, number]>} parametros.puntos - Al menos dos pares finitos [xi, yi] con xi únicos.
 * @param {number} parametros.x - Valor finito donde se evalúa el polinomio interpolante.
 * @returns {Object} Resultado siguiendo el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros son inválidos o hay valores de xi repetidos.
 * @throws {ErrorNumerico} Si el cálculo produce un valor no finito.
 */
function lagrange(parametros) {
  if (parametros === null || typeof parametros !== 'object' || Array.isArray(parametros)) {
    throw new ErrorParametros('ChuspaNumeric.lagrange: se requiere un objeto con { puntos, x }.');
  }

  const { puntos, x } = parametros;
  validarPuntos(puntos);
  validarCoordenada(x, 'x');

  const n = puntos.length;
  const iteraciones = [];
  let resultado = 0;

  for (let i = 0; i < n; i++) {
    const xi = puntos[i][0];
    const yi = puntos[i][1];

    let Li = 1;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const xj = puntos[j][0];
        const numerador = x - xj;
        const denominador = xi - xj;
        if (!Number.isFinite(numerador) || !Number.isFinite(denominador)) {
          throw new ErrorNumerico(
            `ChuspaNumeric.lagrange: diferencia no finita al calcular L[${i}] con puntos[${j}].`
          );
        }
        Li *= numerador / denominador;
      }
    }

    const contribucion = yi * Li;
    resultado += contribucion;
    if (!Number.isFinite(resultado)) {
      throw new ErrorNumerico(
        `ChuspaNumeric.lagrange: resultado parcial no finito al sumar la contribución de puntos[${i}].`
      );
    }

    iteraciones.push({ i, xi, yi, Li, contribucion });
  }

  return crearResultado({
    resultado,
    iteraciones,
    convergio: true,
    mensaje: `Polinomio de Lagrange evaluado en x = ${x}.`,
    meta: {
      metodo: 'lagrange',
      parametros: { puntos, x },
      tiempo_ms: 0,
    },
  });
}

export { lagrange };
