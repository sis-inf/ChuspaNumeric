import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorDivergencia } from '../core/errores.js';

const METODO = 'simpsonAdaptativo';
const PREFIJO = `ChuspaNumeric.${METODO}:`;

/**
 * Verifica que las opciones sean un objeto no nulo y no arreglo.
 * @param {*} opciones - Valor recibido como objeto de opciones.
 * @throws {ErrorParametros} Si no es un objeto válido.
 */
function validarOpciones(opciones) {
    if (opciones === null || typeof opciones !== 'object' || Array.isArray(opciones)) {
        const recibido = opciones === null ? 'null' : Array.isArray(opciones) ? 'array' : typeof opciones;
        throw new ErrorParametros(
            `${PREFIJO} se esperaba un objeto de opciones { f, a, b, ... }. Se recibió: ${recibido}.`
        );
    }
}

/**
 * Verifica que f sea una función.
 * @param {*} f - Valor a verificar.
 * @throws {ErrorParametros} Si no es una función.
 */
function validarFuncionLocal(f) {
    if (typeof f !== 'function') {
        throw new ErrorParametros(
            `${PREFIJO} 'f' debe ser una función. Se recibió: ${typeof f}.`
        );
    }
}

/**
 * Verifica que un valor sea un número finito.
 * @param {*} valor - Valor a verificar.
 * @param {string} nombre - Nombre del parámetro.
 * @throws {ErrorParametros} Si no es un número finito.
 */
function validarNumeroFinito(valor, nombre) {
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
        throw new ErrorParametros(
            `${PREFIJO} '${nombre}' debe ser un número finito. Se recibió: ${valor} (${typeof valor}).`
        );
    }
}

/**
 * Verifica el intervalo [a, b]: finitos y a < b (restricción original).
 * @param {*} a - Extremo inferior.
 * @param {*} b - Extremo superior.
 * @throws {ErrorParametros} Si a o b no son finitos o si a >= b.
 */
function validarLimites(a, b) {
    validarNumeroFinito(a, 'a');
    validarNumeroFinito(b, 'b');
    if (a >= b) {
        throw new ErrorParametros(
            `${PREFIJO} el límite inferior 'a' debe ser estrictamente menor que 'b' (recibido: a=${a}, b=${b}).`
        );
    }
}

/**
 * Verifica que la tolerancia sea un número finito positivo.
 * @param {*} tolerancia - Valor a verificar.
 * @throws {ErrorParametros} Si no es un número finito mayor que cero.
 */
function validarToleranciaLocal(tolerancia) {
    if (typeof tolerancia !== 'number' || !Number.isFinite(tolerancia) || tolerancia <= 0) {
        throw new ErrorParametros(
            `${PREFIJO} 'tolerancia' debe ser un número positivo. Se recibió: ${tolerancia}.`
        );
    }
}

/**
 * Verifica que una profundidad máxima sea un entero >= 0.
 * Se usa tanto para 'profundidadMaxima' como para su alias 'maxProfundidad'.
 * @param {*} valor - Valor a verificar.
 * @param {string} nombre - Nombre del parámetro (para el mensaje de error).
 * @throws {ErrorParametros} Si no es un entero mayor o igual a 0.
 */
function validarProfundidadMaxima(valor, nombre) {
    if (!Number.isInteger(valor) || valor < 0) {
        throw new ErrorParametros(
            `${PREFIJO} '${nombre}' debe ser un entero mayor o igual a 0. Se recibió: ${valor}.`
        );
    }
}

/**
 * Regla de Simpson sobre un subintervalo.
 */
function simpson(inicio, fin, fInicio, fMedio, fFin) {
    return ((fin - inicio) / 6) * (fInicio + 4 * fMedio + fFin);
}

/**
 * Ejecuta la cuadratura adaptativa de Simpson (algoritmo original, sin cambios de lógica).
 * Los errores propios (f no finita) se propagan desde aquí.
 */
function ejecutarAlgoritmo({ f, a, b, tolerancia, maxProfundidad }) {
    const iteraciones = [];
    const warnings = [];
    let evaluaciones = 0;

    const evaluar = (x) => {
        const valor = f(x);
        evaluaciones++;

        if (typeof valor !== 'number' || !Number.isFinite(valor)) {
            throw new ErrorParametros(
                `${PREFIJO} la función debe devolver un número finito. En x=${x} devolvió ${valor}.`
            );
        }

        return valor;
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

        const aproximacionIzquierda = simpson(inicio, medio, fInicio, fCuartoIzquierdo, fMedio);
        const aproximacionDerecha = simpson(medio, fin, fMedio, fCuartoDerecho, fFin);

        const aproximacionSubdividida = aproximacionIzquierda + aproximacionDerecha;
        const diferencia = aproximacionSubdividida - aproximacionCompleta;
        const errorEstimado = Math.abs(diferencia) / 15;
        const aceptado = Math.abs(diferencia) <= 15 * toleranciaLocal;
        const alcanzoProfundidadMaxima = profundidad >= maxProfundidad;
        const terminoPorProfundidad = !aceptado && alcanzoProfundidadMaxima;

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
            aceptado,
            terminoPorProfundidad
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

    const resultado = integrarRecursivo(a, b, fA, fMedio, fB, aproximacionInicial, tolerancia, 0);

    return { resultado, iteraciones, warnings, evaluaciones };
}

/**
 * Verifica la finitud del resultado y arma el objeto de contrato.
 * No llama a medirTiempo.
 */
function finalizar({ resultado, iteraciones, warnings, evaluaciones, a, b, tolerancia, maxProfundidad, tiempo_ms }) {
    if (!Number.isFinite(resultado)) {
        throw new ErrorDivergencia(
            `${PREFIJO} el resultado calculado no es finito (${resultado}).`
        );
    }

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
            tiempo_ms
        },
        warnings
    });
}

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
 * @param {Object} opciones
 * @param {Function} opciones.f - Función a integrar.
 * @param {number} opciones.a - Extremo inferior del intervalo (finito, a < b).
 * @param {number} opciones.b - Extremo superior del intervalo (finito).
 * @param {number} [opciones.tolerancia=1e-6] - Tolerancia de error aceptada (finita y > 0).
 * @param {number} [opciones.profundidadMaxima=20] - Profundidad máxima de recursión (entero >= 0).
 * @param {number} [opciones.maxProfundidad] - Alias de profundidadMaxima, se mantiene por compatibilidad.
 *   Si se indican ambos, los dos se validan y maxProfundidad tiene prioridad.
 * @returns {Object} Objeto de crearResultado (contrato.js). `iteraciones` es un arreglo con un
 *   registro por subintervalo evaluado: { profundidad, a, b, medio, simpsonCompleto,
 *   simpsonIzquierdo, simpsonDerecho, errorEstimado, tolerancia, aceptado, terminoPorProfundidad }.
 *   `aceptado` es true solo si el subintervalo cumplió la tolerancia; `terminoPorProfundidad` es true
 *   si se detuvo por alcanzar la profundidad máxima sin cumplirla.
 *   `convergio` es false si se alcanzó la profundidad máxima (se agregan `warnings`).
 * @throws {ErrorParametros} Si las opciones, f, a, b, tolerancia, profundidadMaxima o maxProfundidad
 *   no son válidos, o si f devuelve un valor no numérico o no finito.
 * @throws {ErrorDivergencia} Si el resultado final no es finito.
 */
export function simpsonAdaptativo(opciones) {
    validarOpciones(opciones);

    const {
        f,
        a,
        b,
        tolerancia = 1e-6,
        profundidadMaxima = 20,
        maxProfundidad = profundidadMaxima
    } = opciones;

    validarFuncionLocal(f);
    validarLimites(a, b);
    validarToleranciaLocal(tolerancia);
    validarProfundidadMaxima(profundidadMaxima, 'profundidadMaxima');
    validarProfundidadMaxima(maxProfundidad, 'maxProfundidad');

    const { valor: calculo, tiempo_ms } = medirTiempo(() =>
        ejecutarAlgoritmo({ f, a, b, tolerancia, maxProfundidad })
    );

    return finalizar({ ...calculo, a, b, tolerancia, maxProfundidad, tiempo_ms });
}
