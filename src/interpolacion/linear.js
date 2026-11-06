import { ErrorParametros } from "../core/errores.js";

export function linearInterpolation(x0, y0, x1, y1, x) {
    const parametros = { x0, y0, x1, y1, x };

    for (const [nombre, valor] of Object.entries(parametros)) {
        if (typeof valor !== "number" || !Number.isFinite(valor)) {
            throw new ErrorParametros(`${nombre} debe ser un número finito`);
        }
    }

    if (x0 === x1) {
        throw new ErrorParametros("x0 y x1 no pueden ser iguales");
    }

    return y0 + ((y1 - y0) / (x1 - x0)) * (x - x0);
}
