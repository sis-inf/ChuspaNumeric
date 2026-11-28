
import { ErrorParametros, ErrorNumerico } from "../core/errores.js";
import { crearResultado, medirTiempo } from "../core/contrato.js";

/**
 * Evalúa un polinomio usando el algoritmo de Horner.
 *
 * @param {number[]} coefficients - Coeficientes del polinomio.
 * @param {number} x - Valor donde evaluar.
 * @returns {Object} Resultado según el contrato de ChuspaNumeric.
 * @throws {ErrorParametros} Si los parámetros son inválidos.
 * @throws {ErrorNumerico} Si el cálculo produce un valor no finito.
 */
export function polyEval(coefficients, x) {
    if (!Array.isArray(coefficients) || coefficients.length === 0) {
        throw new ErrorParametros(
            "El array de coeficientes no puede estar vacío"
        );
    }

    for (let i = 0; i < coefficients.length; i++) {
        if (
            typeof coefficients[i] !== "number" ||
            !Number.isFinite(coefficients[i])
        ) {
            throw new ErrorParametros(
                `El coeficiente de posición ${i} debe ser un número finito`
            );
        }
    }

    if (typeof x !== "number" || !Number.isFinite(x)) {
        throw new ErrorParametros(
            "x debe ser un número finito"
        );
    }

    const { valor, tiempo_ms } = medirTiempo(() => {
        let result = coefficients[0];

        for (let i = 1; i < coefficients.length; i++) {
            result = result * x + coefficients[i];

            if (!Number.isFinite(result)) {
                throw new ErrorNumerico(
                    `Resultado no finito durante el cálculo en la posición ${i}`
                );
            }
        }

        return result;
    });

    return crearResultado({
        resultado: valor,
        iteraciones: [],
        convergio: true,
        mensaje: "Polinomio evaluado correctamente mediante Horner.",
        meta: {
            metodo: "polyEval",
            parametros: {
                coefficients,
                x
            },
            tiempo_ms
        }
    });
}
