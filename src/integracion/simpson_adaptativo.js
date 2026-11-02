import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import { validarFuncion, validarIntervalo } from '../utils/validaciones.js';

/**
 * Aproxima una integral definida usando cuadratura adaptativa de Simpson.
 *
 * A diferencia de Simpson compuesto, este método no usa un número fijo de
 * subintervalos. En su lugar, compara la aproximación de Simpson sobre el
 * intervalo completo con la suma de las aproximaciones en las dos mitades.
 * Si la diferencia excede la tolerancia, subdivide recursivamente solo esa
 * región.
 *
 * Esto es útil para funciones con comportamiento no uniforme, como picos
 * localizados. Por ejemplo, para una gaussiana estrecha:
 *
 * const f = x => Math.exp(-1000 * (x - 0.5) ** 2);
 * const res = simpsonAdaptativo({ f, a: 0, b: 1, tolerancia: 1e-6 });
 *
 * En ese caso, el método concentra subdivisiones cerca del pico, logrando
 * mayor precisión que Simpson compuesto con un número similar de evaluaciones.
 *
 * @param {Object} params
 * @param {Function} params.f - Función a integrar.
 * @param {number} params.a - Extremo inferior del intervalo.
 * @param {number} params.b - Extremo superior del intervalo.
 * @param {number} [params.tolerancia=1e-6] - Tolerancia de error aceptada.
 * @param {number} [params.maxProfundidad=20] - Profundidad máxima de recursión.
 * @returns {Object} Objeto con la forma definida en contrato.js.
 * @throws {ErrorParametros} Si los parámetros de tolerancia o profundidad no son válidos.
 */
export function simpsonAdaptativo({
    f,
    a,
    b,
    tolerancia = 1e-6,
    maxProfundidad = 20
}) {
    validarFuncion(f, 'f');
    validarIntervalo(a, b);

    if (typeof tolerancia !== 'number' || !Number.isFinite(tolerancia) || tolerancia <= 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'tolerancia' debe ser un número positivo. Se recibió: ${tolerancia}.`
        );
    }

    if (!Number.isInteger(maxProfundidad) || maxProfundidad < 0) {
        throw new ErrorParametros(
            `ChuspaNumeric: 'maxProfundidad' debe ser un entero mayor o igual a 0. Se recibió: ${maxProfundidad}.`
        );
    }

    const iteraciones = [];
    const warnings = [];
    let evaluaciones = 0;

    const evaluar = (x) => {
        const valor = f(x);
        evaluaciones++;

        if (typeof valor !== 'number' || !Number.isFinite(valor)) {
            throw new ErrorParametros(
                `ChuspaNumeric: la función debe devolver un número finito. En x=${x} devolvió ${valor}.`
            );
        }

        return valor;
    };

    const simpson = (inicio, fin, fInicio, fMedio, fFin) => {
        return ((fin - inicio) / 6) * (fInicio + 4 * fMedio + fFin);
    };

    const integrarRecursivo = (
        inicio,
        fin,
        fInicio,
        fMedio,
        fFin,
        aproximacionCompleta,
        toleranciaLocal,
        profundidad
    ) => {
        const medio = (inicio + fin) / 2;
        const cuartoIzquierdo = (inicio + medio) / 2;
        const cuartoDerecho = (medio + fin) / 2;

        const fCuartoIzquierdo = evaluar(cuartoIzquierdo);
        const fCuartoDerecho = evaluar(cuartoDerecho);

        const aproximacionIzquierda = simpson(
            inicio,
            medio,
            fInicio,
            fCuartoIzquierdo,
            fMedio
        );

        const aproximacionDerecha = simpson(
            medio,
            fin,
            fMedio,
            fCuartoDerecho,
            fFin
        );

        const aproximacionSubdividida = aproximacionIzquierda + aproximacionDerecha;
        const diferencia = aproximacionSubdividida - aproximacionCompleta;
        const errorEstimado = Math.abs(diferencia) / 15;
        const aceptado = Math.abs(diferencia) <= 15 * toleranciaLocal;
        const alcanzoProfundidadMaxima = profundidad >= maxProfundidad;

        iteraciones.push({
            profundidad,
            a: inicio,
            b: fin,
            medio,
            simpsonCompleto: aproximacionCompleta,
            simpsonIzquierdo: aproximacionIzquierda,
            simpsonDerecho: aproximacionDerecha,
            errorEstimado,
            tolerancia: toleranciaLocal,
            aceptado: aceptado || alcanzoProfundidadMaxima
        });

        if (aceptado) {
            return aproximacionSubdividida + diferencia / 15;
        }

        if (alcanzoProfundidadMaxima) {
            warnings.push(
                `Se alcanzó maxProfundidad=${maxProfundidad} en el intervalo [${inicio}, ${fin}].`
            );

            return aproximacionSubdividida + diferencia / 15;
        }

        return (
            integrarRecursivo(
                inicio,
                medio,
                fInicio,
                fCuartoIzquierdo,
                fMedio,
                aproximacionIzquierda,
                toleranciaLocal / 2,
                profundidad + 1
            ) +
            integrarRecursivo(
                medio,
                fin,
                fMedio,
                fCuartoDerecho,
                fFin,
                aproximacionDerecha,
                toleranciaLocal / 2,
                profundidad + 1
            )
        );
    };

    const medioInicial = (a + b) / 2;
    const fA = evaluar(a);
    const fMedio = evaluar(medioInicial);
    const fB = evaluar(b);
    const aproximacionInicial = simpson(a, b, fA, fMedio, fB);

    const resultado = integrarRecursivo(
        a,
        b,
        fA,
        fMedio,
        fB,
        aproximacionInicial,
        tolerancia,
        0
    );

    return crearResultado({
        resultado,
        iteraciones,
        convergio: warnings.length === 0,
        mensaje: warnings.length > 0
            ? `Simpson adaptativo completado con ${warnings.length} advertencia(s) de profundidad máxima.`
            : 'Simpson adaptativo completado dentro de la tolerancia indicada.',
        meta: {
            metodo: 'Simpson Adaptativo',
            parametros: {
                a,
                b,
                tolerancia,
                maxProfundidad,
                evaluaciones
            },
            tiempo_ms: 0
        },
        warnings
    });
}