import { ErrorParametros } from "../core/errores.js";

export function diferenciaCentrada(f, x, h = 1e-5) {
    if (typeof f !== "function") {
        throw new ErrorParametros("f debe ser una función");
    }
    if (!Number.isFinite(x)) {
        throw new ErrorParametros("x debe ser un número finito");
    }
    if (!Number.isFinite(h) || h === 0) {
        throw new ErrorParametros("h debe ser un número finito distinto de cero");
    }

    return (f(x + h) - f(x - h)) / (2 * h);
}

export function diferenciaCentradaSegundaDerivada(f, x, h = 1e-5) {
    if (typeof f !== "function") {
        throw new ErrorParametros("f debe ser una función");
    }
    if (!Number.isFinite(x)) {
        throw new ErrorParametros("x debe ser un número finito");
    }
    if (!Number.isFinite(h) || h === 0) {
        throw new ErrorParametros("h debe ser un número finito distinto de cero");
    }

    return (f(x + h) - 2 * f(x) + f(x - h)) / (h ** 2);
}