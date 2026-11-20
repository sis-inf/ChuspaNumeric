import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
    ErrorParametros,
    ErrorDominio,
    ErrorDivergencia,
    ErrorConvergencia,
} from "../core/errores.js";

const METODO = "falsaPosicion";

/**
 * Valida que `valor` sea una función.
 * @param {*} valor
 * @param {string} nombre
 */
function validarFuncionLocal(valor, nombre) {
    if (typeof valor !== "function") {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: '${nombre}' debe ser una función, se recibió ${typeof valor}.`
        );
    }
}

/**
 * Valida que `valor` sea un número finito.
 * @param {*} valor
 * @param {string} nombre
 */
function validarNumeroFinito(valor, nombre) {
    if (typeof valor !== "number" || !Number.isFinite(valor)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito, se recibió ${String(valor)} (${typeof valor}).`
        );
    }
}

/**
 * Valida que la tolerancia sea un número finito estrictamente positivo.
 * @param {*} valor
 */
function validarToleranciaLocal(valor) {
    if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: 'tolerancia' debe ser un número finito mayor que 0, se recibió ${String(valor)} (${typeof valor}).`
        );
    }
}

/**
 * Valida que maxIter sea un entero positivo.
 * @param {*} valor
 */
function validarMaxIter(valor) {
    if (typeof valor !== "number" || !Number.isInteger(valor) || valor < 1) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor o igual a 1, se recibió ${String(valor)} (${typeof valor}).`
        );
    }
}

/**
 * Verifica la finitud del resultado y arma el resultado estructurado.
 */
function finalizar({ raiz, iteraciones, parametros, tiempo_ms }) {
    if (!Number.isFinite(raiz)) {
        throw new ErrorDivergencia(
            `ChuspaNumeric.${METODO}: el resultado no es un número finito (${String(raiz)}).`
        );
    }
    return crearResultado({
        resultado: raiz,
        iteraciones,
        convergio: true,
        mensaje: "El método de falsa posición convergió con éxito.",
        meta: {
            metodo: "Falsa Posición",
            parametros,
            tiempo_ms,
        },
    });
}

/**
 * Encuentra la raíz de una función en un intervalo utilizando el método de falsa posición.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f - Función no lineal a evaluar
 * @param {number} opciones.a - Extremo izquierdo del intervalo (finito)
 * @param {number} opciones.b - Extremo derecho del intervalo (finito)
 * @param {number} [opciones.tolerancia=1e-6] - Criterio de parada (finito, > 0)
 * @param {number} [opciones.maxIter=100] - Máximo de iteraciones (entero >= 1)
 * @returns {Object} Resultado uniforme según el contrato de ChuspaNumeric
 * @throws {ErrorParametros} Si opciones no es un objeto, si f no es función, si a, b o
 *   tolerancia no son números finitos válidos, si maxIter no es entero >= 1 o si
 *   f(a) * f(b) >= 0
 * @throws {ErrorDominio} Si f(a) o f(b) no son números finitos
 * @throws {ErrorConvergencia} Si se alcanza maxIter sin lograr la convergencia
 * @throws {ErrorDivergencia} Si el resultado no es finito
 */
export function falsaPosicion(opciones) {
    if (opciones === null || typeof opciones !== "object" || Array.isArray(opciones)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, a, b, tolerancia, maxIter }, se recibió ${opciones === null ? "null" : Array.isArray(opciones) ? "array" : typeof opciones}.`
        );
    }

    const { f, a: a0, b: b0, tolerancia = 1e-6, maxIter = 100 } = opciones;

    validarFuncionLocal(f, "f");
    validarNumeroFinito(a0, "a");
    validarNumeroFinito(b0, "b");
    validarToleranciaLocal(tolerancia);
    validarMaxIter(maxIter);

    const { valor: calculo, tiempo_ms } = medirTiempo(() => {
        let a = a0;
        let b = b0;
        let fa = f(a);
        let fb = f(b);

        if (!Number.isFinite(fa) || !Number.isFinite(fb)) {
            throw new ErrorDominio(
                `ChuspaNumeric.${METODO}: f(a) y f(b) deben ser finitos, se obtuvo f(${a}) = ${fa} y f(${b}) = ${fb}.`
            );
        }

        if (fa * fb >= 0) {
            throw new ErrorParametros(
                `ChuspaNumeric.${METODO}: el intervalo [${a}, ${b}] no contiene una raíz válida (f(a) y f(b) deben tener signos opuestos).`
            );
        }

        const iteraciones = [];
        let cAnterior = null;

        for (let n = 1; n <= maxIter; n++) {
            const c = (a * fb - b * fa) / (fb - fa);
            const fc = f(c);

            let error = null;
            if (cAnterior !== null) {
                error = Math.abs(c - cAnterior);
            }

            iteraciones.push({ n, a, b, c, fa, fb, fc, error });

            if (Math.abs(fc) < tolerancia || (error !== null && error < tolerancia)) {
                return { raiz: c, iteraciones };
            }

            if (fa * fc < 0) {
                b = c;
                fb = fc;
            } else {
                a = c;
                fa = fc;
            }

            cAnterior = c;
        }

        throw new ErrorConvergencia(
            `ChuspaNumeric.${METODO}: se alcanzó el máximo de iteraciones (${maxIter}) sin lograr la convergencia.`
        );
    });

    return finalizar({
        raiz: calculo.raiz,
        iteraciones: calculo.iteraciones,
        parametros: { a: a0, b: b0, tolerancia, maxIter },
        tiempo_ms,
    });
}
