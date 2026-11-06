import { crearResultado } from '../core/contrato.js';
import { ErrorDominio } from '../core/errores.js';
import { validarMatrizCuadrada } from '../utils/validaciones.js';

/**
 * Umbral absoluto para detectar pivotes nulos o numéricamente inservibles.
 */
const UMBRAL_PIVOTE_NULO = 1e-12;

/**
 * Resuelve sistemas de ecuaciones lineales Ax = b mediante eliminación
 * gaussiana con pivoteo parcial.
 *
 * En cada columna se selecciona como pivote la fila con el elemento de mayor
 * magnitud absoluta disponible, intercambiando filas antes de eliminar. Esto
 * mejora la estabilidad numérica y permite resolver casos donde la eliminación
 * gaussiana simple falla por encontrar un pivote cero.
 *
 * Ejemplo de caso donde `gauss.js` simple falla por pivote cero:
 *
 * A = [
 *   [0, 2],
 *   [1, 1]
 * ]
 *
 * b = [4, 3]
 *
 * En la eliminación gaussiana simple, el primer pivote sería A[0][0] = 0,
 * por lo que el método falla. Con pivoteo parcial, se intercambian las filas
 * y el sistema se resuelve correctamente con resultado aproximado [1, 2].
 *
 * @param {Object} params
 * @param {number[][]} params.A - Matriz de coeficientes cuadrada (n x n)
 * @param {number[]} params.b - Vector de términos independientes (n)
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric
 * @throws {ErrorDominio} Si el sistema no puede resolverse por pivote nulo
 */
export function gaussPivoteoParcial({ A, b }) {
    validarMatrizCuadrada(A);
    const n = A.length;

    if (!Array.isArray(b) || b.length !== n) {
        throw new Error('El vector b debe tener la misma dimensión que la matriz de coeficientes');
    }

    const M = A.map((fila, i) => [...fila, b[i]]);
    const iteraciones = [];
    let contadorIteracion = 1;

    const registrarPaso = (paso, descripcion) => {
        const matrizActual = M.map(fila => fila.slice(0, n));
        const vectorActual = M.map(fila => fila[n]);

        iteraciones.push({
            n: contadorIteracion++,
            paso,
            descripcion,
            matriz: matrizActual,
            vector: vectorActual
        });
    };

    registrarPaso('inicio', 'Estado inicial del sistema aumentado');

    for (let col = 0; col < n; col++) {
        let filaPivote = col;
        let mayorMagnitud = Math.abs(M[col][col]);

        for (let fila = col + 1; fila < n; fila++) {
            const magnitud = Math.abs(M[fila][col]);

            if (magnitud > mayorMagnitud) {
                mayorMagnitud = magnitud;
                filaPivote = fila;
            }
        }

        if (mayorMagnitud < UMBRAL_PIVOTE_NULO) {
            throw new ErrorDominio(
                `Pivote nulo en la columna ${col + 1}. El sistema no puede resolverse con eliminación gaussiana.`
            );
        }

        if (filaPivote !== col) {
            [M[col], M[filaPivote]] = [M[filaPivote], M[col]];

            registrarPaso(
                'pivoteo',
                `Intercambio de la fila ${col + 1} con la fila ${filaPivote + 1} para usar el mayor pivote absoluto`
            );
        }

        const pivote = M[col][col];

        for (let fila = col + 1; fila < n; fila++) {
            const factor = M[fila][col] / pivote;

            for (let k = col; k <= n; k++) {
                M[fila][k] -= factor * M[col][k];
            }

            registrarPaso(
                'eliminacion',
                `Eliminación de la fila ${fila + 1} usando la columna pivote ${col + 1}`
            );
        }
    }

    const x = new Array(n).fill(0);

    for (let i = n - 1; i >= 0; i--) {
        let suma = 0;

        for (let j = i + 1; j < n; j++) {
            suma += M[i][j] * x[j];
        }

        x[i] = (M[i][n] - suma) / M[i][i];

        registrarPaso(
            'sustitucion',
            `Cálculo de la variable x[${i + 1}] mediante sustitución hacia atrás`
        );
    }

    return crearResultado({
        resultado: x,
        iteraciones,
        convergio: true,
        mensaje: 'El sistema de ecuaciones se resolvió con éxito usando pivoteo parcial.',
        meta: {
            metodo: 'Eliminación Gaussiana con Pivoteo Parcial',
            parametros: { n }
        }
    });
}