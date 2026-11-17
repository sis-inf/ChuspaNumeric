import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorDominio, ErrorDivergencia } from '../core/errores.js';

const METODO = 'gauss';

/**
 * Umbral relativo para advertir sobre pivotes pequeños que indican
 * posible inestabilidad numérica.
 */
const UMBRAL_PIVOTE_ADVERTENCIA = 1e-10;

/**
 * Valida el sistema Ax = b: tipos, valores finitos y dimensiones compatibles.
 * @param {*} A
 * @param {*} b
 * @throws {ErrorParametros}
 */
function validarSistema(A, b) {
    if (!Array.isArray(A) || A.length === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: "A" debe ser una matriz (arreglo de arreglos) no vacía, se recibió ${typeof A}.`
        );
    }

    const n = A.length;

    for (let i = 0; i < n; i++) {
        if (!Array.isArray(A[i])) {
            throw new ErrorParametros(
                `ChuspaNumeric.${METODO}: la fila ${i + 1} de "A" debe ser un arreglo, se recibió ${typeof A[i]}.`
            );
        }
        if (A[i].length !== n) {
            throw new ErrorParametros(
                `ChuspaNumeric.${METODO}: "A" debe ser cuadrada (${n}x${n}), pero la fila ${i + 1} tiene ${A[i].length} elementos.`
            );
        }
        for (let j = 0; j < n; j++) {
            if (typeof A[i][j] !== 'number' || !Number.isFinite(A[i][j])) {
                throw new ErrorParametros(
                    `ChuspaNumeric.${METODO}: "A[${i}][${j}]" debe ser un número finito, se recibió ${String(A[i][j])}.`
                );
            }
        }
    }

    if (!Array.isArray(b)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: "b" debe ser un arreglo de números, se recibió ${typeof b}.`
        );
    }
    if (b.length !== n) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: "b" debe tener ${n} elementos (igual a la dimensión de "A"), pero tiene ${b.length}.`
        );
    }
    for (let i = 0; i < n; i++) {
        if (typeof b[i] !== 'number' || !Number.isFinite(b[i])) {
            throw new ErrorParametros(
                `ChuspaNumeric.${METODO}: "b[${i}]" debe ser un número finito, se recibió ${String(b[i])}.`
            );
        }
    }
}

/**
 * Verifica la finitud de la solución y arma el resultado según el contrato.
 * @throws {ErrorDivergencia} Si algún componente de la solución no es finito
 */
function finalizar({ x, iteraciones, warnings, n, tiempo_ms }) {
    const idxInvalido = x.findIndex((v) => !Number.isFinite(v));
    if (idxInvalido !== -1) {
        throw new ErrorDivergencia(
            `ChuspaNumeric.${METODO}: la solución contiene un valor no finito en x[${idxInvalido + 1}] (${x[idxInvalido]}).`
        );
    }

    return crearResultado({
        resultado: x,
        iteraciones,
        convergio: true,
        mensaje: warnings.length > 0
            ? `El sistema se resolvió con ${warnings.length} advertencia(s) de inestabilidad numérica.`
            : 'El sistema de ecuaciones se resolvió con éxito.',
        meta: {
            metodo: 'Eliminación Gaussiana',
            parametros: { n },
            tiempo_ms
        },
        warnings
    });
}

/**
 * Resolución de sistemas de ecuaciones lineales Ax = b
 * mediante eliminación gaussiana con sustitución hacia atrás.
 *
 * @param {Object} opciones
 * @param {number[][]} opciones.A - Matriz de coeficientes cuadrada (n x n), con valores finitos
 * @param {number[]}   opciones.b - Vector de términos independientes (n), con valores finitos
 * @returns {Object} Objeto de resultado uniforme según el contrato de ChuspaNumeric
 * @throws {ErrorParametros} Si opciones no es un objeto, o A/b tienen tipos inválidos,
 *   valores no finitos o dimensiones incompatibles
 * @throws {ErrorDominio} Si se detecta un pivote nulo que impide la operación
 * @throws {ErrorDivergencia} Si la solución contiene valores no finitos
 */
export function gauss(opciones) {
    if (opciones === null || typeof opciones !== 'object' || Array.isArray(opciones)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { A, b }, se recibió ${
                opciones === null ? 'null' : Array.isArray(opciones) ? 'arreglo' : typeof opciones
            }.`
        );
    }

    const { A, b } = opciones;
    validarSistema(A, b);
    const n = A.length;

    const { valor: calculo, tiempo_ms } = medirTiempo(() => {
        const M = A.map((fila, i) => [...fila, b[i]]);
        const iteraciones = [];
        const warnings = [];
        let contadorIteracion = 1;

        const registrarPaso = (paso, descripcion) => {
            const matrizActual = M.map((fila) => fila.slice(0, n));
            const vectorActual = M.map((fila) => fila[n]);

            iteraciones.push({
                n: contadorIteracion++,
                paso,
                descripcion,
                matriz: matrizActual,
                vector: vectorActual
            });
        };

        registrarPaso('eliminacion', 'Estado inicial del sistema aumentado');

        // Calcular la norma infinito de la matriz para el umbral relativo
        const normaInf = Math.max(...A.map((fila) =>
            fila.reduce((sum, val) => sum + Math.abs(val), 0)
        ));

        for (let col = 0; col < n; col++) {
            const pivote = M[col][col];

            if (Math.abs(pivote) < 1e-12) {
                throw new ErrorDominio(
                    `ChuspaNumeric.${METODO}: pivote nulo en la columna ${col + 1}. El sistema no puede resolverse con este método sin pivoteo.`
                );
            }

            // Advertir si el pivote es pequeño en relación a la escala de la matriz
            if (normaInf > 0 && Math.abs(pivote) / normaInf < UMBRAL_PIVOTE_ADVERTENCIA) {
                warnings.push(
                    `Pivote pequeño detectado en columna ${col + 1} ` +
                    `(|pivote|/||A||∞ = ${(Math.abs(pivote) / normaInf).toExponential(2)}). ` +
                    `Posible inestabilidad numérica en el resultado.`
                );
            }

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

        return { x, iteraciones, warnings };
    });

    return finalizar({ ...calculo, n, tiempo_ms });
}
