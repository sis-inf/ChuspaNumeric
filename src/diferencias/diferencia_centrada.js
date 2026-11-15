import { crearResultado, medirTiempo } from "../core/contrato.js";
import { ErrorParametros } from "../core/errores.js";
import { validarFuncion, validarNumero } from "../utils/validaciones.js";

function validarEntrada(f, x, h, metodo) {
    validarFuncion(f, "f");
    validarNumero(x, "x");
    validarNumero(h, "h");

    if (h === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: 'h' debe ser distinto de cero.`
        );
    }

    const xMasH = x + h;
    const xMenosH = x - h;

    if (!Number.isFinite(xMasH) || !Number.isFinite(xMenosH)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: los puntos de evaluación deben ser números finitos.`
        );
    }

    return { xMasH, xMenosH };
}

function evaluarFuncion(f, punto, metodo) {
    const valor = f(punto);

    if (typeof valor !== "number" || !Number.isFinite(valor)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: la función debe devolver un número finito en x=${punto}.`
        );
    }

    return valor;
}

function calcularResultado(f, x, h, metodo, calcular) {
    const { valor, tiempo_ms } = medirTiempo(calcular);

    if (!Number.isFinite(valor)) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: el resultado calculado no es finito.`
        );
    }

    return crearResultado({
        resultado: valor,
        iteraciones: [],
        convergio: true,
        mensaje: `${metodo}: cálculo completado correctamente.`,
        meta: {
            metodo,
            parametros: { f, x, h },
            tiempo_ms,
        },
    });
}

export function diferenciaCentrada(f, x, h = 1e-5) {
    const metodo = "diferenciaCentrada";
    const { xMasH, xMenosH } = validarEntrada(f, x, h, metodo);

    const denominador = 2 * h;

    if (!Number.isFinite(denominador) || denominador === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: el denominador debe ser finito y distinto de cero.`
        );
    }

    return calcularResultado(f, x, h, metodo, () => {
        const superior = evaluarFuncion(f, xMasH, metodo);
        const inferior = evaluarFuncion(f, xMenosH, metodo);

        return (superior - inferior) / denominador;
    });
}

export function diferenciaCentradaSegundaDerivada(f, x, h = 1e-5) {
    const metodo = "diferenciaCentradaSegundaDerivada";
    const { xMasH, xMenosH } = validarEntrada(f, x, h, metodo);

    const denominador = h ** 2;

    if (!Number.isFinite(denominador) || denominador === 0) {
        throw new ErrorParametros(
            `ChuspaNumeric.${metodo}: h² debe ser finito y distinto de cero.`
        );
    }

    return calcularResultado(f, x, h, metodo, () => {
        const superior = evaluarFuncion(f, xMasH, metodo);
        const central = evaluarFuncion(f, x, metodo);
        const inferior = evaluarFuncion(f, xMenosH, metodo);

        return (superior - 2 * central + inferior) / denominador;
    });
}
