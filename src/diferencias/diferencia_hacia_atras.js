import { ErrorParametros } from "../core/errores.js";
import { validarFuncion, validarNumero } from "../utils/validaciones.js";

/**
 * Calcula la primera derivada de una función usando el método de diferencias finitas atrasadas.
 * * @param {function} f - La función objetivo a derivar.
 * @param {number} x - El punto en el cual se evalúa la derivada.
 * @param {number} h - El tamaño del paso (incremento). No debe ser 0.
 * @returns {number} El valor aproximado de la derivada en el punto x.
 * @throws {Error} Si el tamaño del paso h es igual a cero.
 */
export function diferenciasAtrasGrado1(f, x, h) {
    if (h === 0) {
        throw new Error("El tamaño del paso h no puede ser cero.");
    }
    
    return (f(x) - f(x - h)) / h;
}

/**
 * Calcula la primera derivada de una función usando la fórmula de tres puntos
 * de diferencias finitas hacia atrás, con error de orden O(h²).
 *
 * Fórmula:
 * f'(x) ≈ (3·f(x) - 4·f(x - h) + f(x - 2h)) / (2h)
 *
 * @param {function} f - La función objetivo a derivar.
 * @param {number} x - El punto en el cual se evalúa la derivada.
 * @param {number} h - El tamaño del paso (incremento). Debe ser positivo.
 * @returns {number} El valor aproximado de la derivada en el punto x.
 * @throws {ErrorParametros} Si f no es una función, si x o h no son números
 * finitos, o si h no es positivo.
 *
 * @example
 * const resultado = derivadaAtrasOrden2(x => x ** 3, 2, 0.001);
 * console.log(resultado); // ≈ 12
 */
export function derivadaAtrasOrden2(f, x, h) {
    validarFuncion(f, "f");
    validarNumero(x, "x");
    validarNumero(h, "h");

    if (h <= 0) {
        throw new ErrorParametros("El parámetro h debe ser positivo.");
    }

    return (3 * f(x) - 4 * f(x - h) + f(x - 2 * h)) / (2 * h);
}