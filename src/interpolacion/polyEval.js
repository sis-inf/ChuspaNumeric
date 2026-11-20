import { ErrorParametros } from "../core/errores.js";

/**
 * Evalúa un polinomio mediante el algoritmo de Horner.
 *
 * @param {number[]} coefficients - Coeficientes ordenados
 * desde el mayor grado hasta el término independiente.
 * @param {number} x - Punto de evaluación.
 * @returns {Object} Resultado estructurado de la evaluación.
 * @throws {ErrorParametros} Cuando los parámetros son inválidos
 * o se produce un desbordamiento numérico.
 */
export function polyEval(coefficients, x) {
    if (!Array.isArray(coefficients)) {
        throw new ErrorParametros(
            "Los coeficientes deben ser un arreglo"
        );
    }

    if (coefficients.length === 0) {
        throw new ErrorParametros(
            "El array de coeficientes no puede estar vacío"
        );
    }

    for (let i = 0; i < coefficients.length; i++) {
        if (!Number.isFinite(coefficients[i])) {
            throw new ErrorParametros(
                `El coeficiente en la posición ${i} debe ser un número finito`
            );
        }
    }

    if (!Number.isFinite(x)) {
        throw new ErrorParametros(
            "El parámetro x debe ser un número finito"
        );
    }

    let result = coefficients[0];
    let iteraciones = 0;

    for (let i = 1; i < coefficients.length; i++) {
        result = result * x + coefficients[i];

        iteraciones++;

        if (!Number.isFinite(result)) {
            throw new ErrorParametros(
                "Desbordamiento numérico durante la evaluación"
            );
        }
    }

    return {
        resultado: result,
        iteraciones: iteraciones,
        convergencia: {
            aplica: false,
            motivo: "Método de evaluación directa"
        },
        exito: true,
        metodo: "Horner"
    };
}
