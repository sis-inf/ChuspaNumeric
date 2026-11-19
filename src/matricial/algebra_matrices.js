// ALGEBRA DE MATRICES

import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros, ErrorDivergencia } from "../core/errores.js";
import { validarNumero, verificarDivergencia } from "../utils/validaciones.js";

export const MAX_DIMENSION = 1000;
export const MAX_EXPONENTE = 1000;

function validarMatriz(matriz, nombre, funcion) {
  const p = `ChuspaNumeric.${funcion}`;
  if (!Array.isArray(matriz) || matriz.length === 0) {
    throw new ErrorParametros(
      `${p}: '${nombre}' debe ser una matriz no vacía (arreglo de arreglos). Se recibió: ${typeof matriz}.`
    );
  }
  if (matriz.length > MAX_DIMENSION) {
    throw new ErrorParametros(
      `${p}: '${nombre}' excede el máximo de ${MAX_DIMENSION} filas. Tiene ${matriz.length}.`
    );
  }
  if (!Array.isArray(matriz[0])) {
    throw new ErrorParametros(`${p}: '${nombre}[0]' no es un arreglo.`);
  }
  const numColumnas = matriz[0].length;
  if (numColumnas === 0) {
    throw new ErrorParametros(`${p}: '${nombre}' no puede tener filas vacías.`);
  }
  if (numColumnas > MAX_DIMENSION) {
    throw new ErrorParametros(
      `${p}: '${nombre}' excede el máximo de ${MAX_DIMENSION} columnas. Tiene ${numColumnas}.`
    );
  }
  for (let i = 0; i < matriz.length; i++) {
    if (!Array.isArray(matriz[i])) {
      throw new ErrorParametros(`${p}: '${nombre}[${i}]' no es un arreglo.`);
    }
    if (matriz[i].length !== numColumnas) {
      throw new ErrorParametros(
        `${p}: '${nombre}' no es rectangular: la fila 0 tiene ${numColumnas} columnas, pero la fila ${i} tiene ${matriz[i].length}.`
      );
    }
    for (let j = 0; j < numColumnas; j++) {
      if (typeof matriz[i][j] !== "number" || !Number.isFinite(matriz[i][j])) {
        throw new ErrorParametros(
          `${p}: '${nombre}[${i}][${j}]' no es un número finito. Se recibió: ${matriz[i][j]}.`
        );
      }
    }
  }
}

function dimensiones(matriz) {
  return [matriz.length, matriz[0].length];
}

function verificarResultadoFinito(resultado, funcion) {
  const filas = Array.isArray(resultado) ? resultado : [[resultado]];
  for (let i = 0; i < filas.length; i++) {
    for (let j = 0; j < filas[i].length; j++) {
      if (!Number.isFinite(filas[i][j])) {
        throw new ErrorDivergencia(
          `ChuspaNumeric.${funcion}: el resultado no es finito (desbordamiento numérico) en [${i}][${j}].`
        );
      }
    }
  }
}

/**
 * Ejecuta el cálculo midiendo tiempo y arma el resultado según el contrato.
 * `calculo` debe devolver { resultado, iteraciones }.
 */
function finalizar(funcion, metodo, parametros, calculo) {
  const { valor, tiempo_ms } = medirTiempo(calculo);
  verificarResultadoFinito(valor.resultado, funcion);
  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: "Operación directa completada correctamente (no iterativa).",
    meta: { metodo, parametros, tiempo_ms },
  });
}

function multiplicarRaw(A, B) {
  const filasA = A.length, colsA = A[0].length, colsB = B[0].length;
  const resultado = [];
  for (let i = 0; i < filasA; i++) {
    const fila = [];
    for (let j = 0; j < colsB; j++) {
      let suma = 0;
      for (let k = 0; k < colsA; k++) suma += A[i][k] * B[k][j];
      fila.push(suma);
    }
    resultado.push(fila);
  }
  return resultado;
}

function sumarORestar(A, B, signo, funcion, metodo, etiqueta) {
  validarMatriz(A, "A", funcion);
  validarMatriz(B, "B", funcion);
  const [filasA, colsA] = dimensiones(A);
  const [filasB, colsB] = dimensiones(B);
  if (filasA !== filasB || colsA !== colsB) {
    throw new ErrorParametros(
      `ChuspaNumeric.${funcion}: dimensiones incompatibles para ${etiqueta}: A es ${filasA}x${colsA}, B es ${filasB}x${colsB}. Ambas deben ser del mismo tamaño.`
    );
  }
  return finalizar(funcion, metodo, { dimensionesA: [filasA, colsA], dimensionesB: [filasB, colsB] }, () => {
    const resultado = [];
    for (let i = 0; i < filasA; i++) {
      const fila = [];
      for (let j = 0; j < colsA; j++) fila.push(A[i][j] + signo * B[i][j]);
      resultado.push(fila);
    }
    return { resultado, iteraciones: [] };
  });
}

export function sumaMatrices(A, B) {
  return sumarORestar(A, B, 1, "sumaMatrices", "suma-matrices", "suma");
}

export function restaMatrices(A, B) {
  return sumarORestar(A, B, -1, "restaMatrices", "resta-matrices", "resta");
}

export function multiplicarMatrices(A, B) {
  const f = "multiplicarMatrices";
  validarMatriz(A, "A", f);
  validarMatriz(B, "B", f);
  const [filasA, colsA] = dimensiones(A);
  const [filasB, colsB] = dimensiones(B);
  if (colsA !== filasB) {
    throw new ErrorParametros(
      `ChuspaNumeric.${f}: dimensiones incompatibles para multiplicación: A es ${filasA}x${colsA}, B es ${filasB}x${colsB}. Las columnas de A (${colsA}) deben igualar las filas de B (${filasB}).`
    );
  }
  return finalizar(f, "multiplicacion-matrices", { dimensionesA: [filasA, colsA], dimensionesB: [filasB, colsB] }, () => ({
    resultado: multiplicarRaw(A, B),
    iteraciones: [],
  }));
}

export function transpuesta(A) {
  const f = "transpuesta";
  validarMatriz(A, "A", f);
  const [filas, cols] = dimensiones(A);
  return finalizar(f, "transpuesta", { dimensionesA: [filas, cols] }, () => {
    const resultado = [];
    for (let j = 0; j < cols; j++) {
      const fila = [];
      for (let i = 0; i < filas; i++) fila.push(A[i][j]);
      resultado.push(fila);
    }
    return { resultado, iteraciones: [] };
  });
}

export function multiplicarEscalar(escalar, A) {
  const f = "multiplicarEscalar";
  validarNumero(escalar, "escalar");
  validarMatriz(A, "A", f);
  const [filas, cols] = dimensiones(A);
  return finalizar(f, "multiplicacion-escalar", { escalar, dimensionesA: [filas, cols] }, () => {
    const resultado = [];
    for (let i = 0; i < filas; i++) {
      const fila = [];
      for (let j = 0; j < cols; j++) fila.push(escalar * A[i][j]);
      resultado.push(fila);
    }
    return { resultado, iteraciones: [] };
  });
}

export function trazaMatriz(A) {
  const f = "trazaMatriz";
  validarMatriz(A, "A", f);
  const [filas, cols] = dimensiones(A);
  if (filas !== cols) {
    throw new ErrorParametros(
      `ChuspaNumeric.${f}: la traza requiere una matriz cuadrada: A es ${filas}x${cols}.`
    );
  }
  return finalizar(f, "traza", { dimensionesA: [filas, cols] }, () => {
    let traza = 0;
    for (let i = 0; i < filas; i++) traza += A[i][i];
    return { resultado: traza, iteraciones: [] };
  });
}

export function potenciaMatriz(A, n) {
  const f = "potenciaMatriz";
  validarMatriz(A, "A", f);
  const [filas, cols] = dimensiones(A);
  if (filas !== cols) {
    throw new ErrorParametros(
      `ChuspaNumeric.${f}: la potencia requiere una matriz cuadrada: A es ${filas}x${cols}.`
    );
  }
  if (!Number.isInteger(n) || n < 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${f}: el exponente debe ser un entero mayor o igual a 0. Se recibió: ${n}.`
    );
  }
  if (n > MAX_EXPONENTE) {
    throw new ErrorParametros(
      `ChuspaNumeric.${f}: el exponente excede el máximo permitido (${MAX_EXPONENTE}). Se recibió: ${n}.`
    );
  }
  return finalizar(f, "potencia-matriz", { dimensionesA: [filas, cols], exponente: n }, () => {
    let resultado = [];
    for (let i = 0; i < filas; i++) {
      const fila = [];
      for (let j = 0; j < filas; j++) fila.push(i === j ? 1 : 0);
      resultado.push(fila);
    }
    const iteraciones = [];
    for (let k = 1; k <= n; k++) {
      resultado = multiplicarRaw(resultado, A);
      for (const fila of resultado) {
        for (const v of fila) verificarDivergencia(v, f, k);
      }
      iteraciones.push({ n: k });
    }
    return { resultado, iteraciones };
  });
}
