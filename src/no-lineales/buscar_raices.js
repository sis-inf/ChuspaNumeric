import { crearResultado, medirTiempo } from '../core/contrato.js';
import { ErrorParametros, ErrorDivergencia } from '../core/errores.js';
import { ejecutarParalelo } from '../utils/ejecutar_paralelo.js';

const METODO = 'buscarTodasLasRaices';

function ahora() {
  return globalThis.performance && typeof globalThis.performance.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
}

function describir(valor) {
  if (typeof valor === 'string') return `"${valor}" (string)`;
  if (valor === null) return 'null';
  if (Array.isArray(valor)) return 'array';
  if (typeof valor === 'object') return 'object';
  if (typeof valor === 'function') return 'function';
  return `${String(valor)} (${typeof valor})`;
}

function validarOpciones(opciones) {
  if (typeof opciones !== 'object' || opciones === null || Array.isArray(opciones)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: se esperaba un objeto de opciones { f, inicio, fin, paso, ... }. Se recibió: ${describir(opciones)}.`
    );
  }
}

function validarFuncionLocal(f) {
  if (typeof f !== 'function') {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'f' debe ser una función. Se recibió: ${describir(f)}.`
    );
  }
}

function validarNumeroFinito(valor, nombre) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un número finito. Se recibió: ${describir(valor)}.`
    );
  }
}

function validarIntervaloLocal(inicio, fin) {
  validarNumeroFinito(inicio, 'inicio');
  validarNumeroFinito(fin, 'fin');

  if (inicio >= fin) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: el intervalo es inválido, 'inicio' debe ser menor que 'fin'. Se recibió: inicio=${inicio}, fin=${fin}.`
    );
  }
}

function validarPaso(paso) {
  if (typeof paso !== 'number' || !Number.isFinite(paso) || paso <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'paso' debe ser un número finito mayor a cero. Se recibió: ${describir(paso)}.`
    );
  }
}

function validarTolerancia(tolerancia) {
  if (typeof tolerancia !== 'number' || !Number.isFinite(tolerancia) || tolerancia <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'tolerancia' debe ser un número finito mayor a cero. Se recibió: ${describir(tolerancia)}.`
    );
  }
}

function validarIteraciones(maxIter) {
  if (!Number.isInteger(maxIter) || maxIter <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxIter' debe ser un entero mayor a cero. Se recibió: ${describir(maxIter)}.`
    );
  }
}

function validarBooleano(valor, nombre) {
  if (typeof valor !== 'boolean') {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: '${nombre}' debe ser un booleano. Se recibió: ${describir(valor)}.`
    );
  }
}

function validarMaxWorkers(maxWorkers) {
  if (maxWorkers === undefined) return;

  if (!Number.isInteger(maxWorkers) || maxWorkers < 1) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: 'maxWorkers' debe ser un entero mayor o igual a 1. Se recibió: ${describir(maxWorkers)}.`
    );
  }
}

function validarValorFuncion(valor, x) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.${METODO}: la función debe devolver un número finito. En x=${x} devolvió ${valor}.`
    );
  }
}

function construirSubintervalos(f, inicio, fin, paso) {
  const tareas = [];
  const raicesExactas = [];
  const vistos = new Set();

  const agregarRaizExacta = (x) => {
    const clave = x.toFixed(12);

    if (!vistos.has(clave)) {
      vistos.add(clave);
      raicesExactas.push({
        raiz: x,
        intervalo: [x, x],
        convergio: true,
        iteraciones: [],
        exacta: true
      });
    }
  };

  for (let a = inicio; a < fin; a += paso) {
    const b = Math.min(a + paso, fin);
    const fa = f(a);
    const fb = f(b);

    validarValorFuncion(fa, a);
    validarValorFuncion(fb, b);

    if (fa === 0) {
      agregarRaizExacta(a);
      continue;
    }

    if (fb === 0) {
      agregarRaizExacta(b);
      continue;
    }

    if (fa * fb < 0) {
      tareas.push({ a, b });
    }
  }

  return { tareas, raicesExactas };
}

function resolverBiseccionLocal({ f, a, b, tolerancia, maxIter }) {
  let izq = a;
  let der = b;
  let c = izq;
  const iteraciones = [];
  let convergio = false;

  for (let n = 0; n < maxIter; n++) {
    c = (izq + der) / 2;

    const fa = f(izq);
    const fb = f(der);
    const fc = f(c);
    const error = Math.abs(der - izq) / 2;

    iteraciones.push({ n: n + 1, a: izq, b: der, c, fa, fb, fc, error });

    if (error < tolerancia || fc === 0) {
      convergio = true;
      break;
    }

    if (fa * fc < 0) {
      der = c;
    } else {
      izq = c;
    }
  }

  return {
    raiz: c,
    intervalo: [a, b],
    convergio,
    iteraciones,
    exacta: false
  };
}

function resolverBiseccionWorker(tarea) {
  const f = new Function(`return (${tarea.fuenteFuncion});`)();
  let izq = tarea.a;
  let der = tarea.b;
  let c = izq;
  const iteraciones = [];
  let convergio = false;

  for (let n = 0; n < tarea.maxIter; n++) {
    c = (izq + der) / 2;

    const fa = f(izq);
    const fb = f(der);
    const fc = f(c);
    const error = Math.abs(der - izq) / 2;

    iteraciones.push({ n: n + 1, a: izq, b: der, c, fa, fb, fc, error });

    if (error < tarea.tolerancia || fc === 0) {
      convergio = true;
      break;
    }

    if (fa * fc < 0) {
      der = c;
    } else {
      izq = c;
    }
  }

  return {
    raiz: c,
    intervalo: [tarea.a, tarea.b],
    convergio,
    iteraciones,
    exacta: false,
    workerThread: true
  };
}

function ordenarResultados(resultados) {
  return resultados.slice().sort((a, b) => a.raiz - b.raiz);
}

function finalizar({
  resultados,
  inicio,
  fin,
  paso,
  tolerancia,
  maxIter,
  paralelo,
  maxWorkers,
  tiempo_ms,
  benchmark = null
}) {
  const ordenados = ordenarResultados(resultados);
  const raices = ordenados.map((item) => item.raiz);

  if (!raices.every((r) => Number.isFinite(r))) {
    throw new ErrorDivergencia(
      `ChuspaNumeric.${METODO}: se obtuvo una raíz no finita (NaN o Infinity); el método divergió.`
    );
  }

  return crearResultado({
    resultado: raices,
    iteraciones: ordenados,
    convergio: ordenados.every((item) => item.convergio),
    mensaje: `Se encontraron ${raices.length} raíz(es) en el intervalo [${inicio}, ${fin}].`,
    meta: {
      metodo: METODO,
      parametros: {
        inicio,
        fin,
        paso,
        tolerancia,
        maxIter,
        paralelo,
        maxWorkers
      },
      tiempo_ms,
      benchmark
    }
  });
}

function ejecutarSecuencial({ f, tareas, raicesExactas, tolerancia, maxIter }) {
  const calculadas = tareas.map((tarea) =>
    resolverBiseccionLocal({
      f,
      a: tarea.a,
      b: tarea.b,
      tolerancia,
      maxIter
    })
  );

  return [...raicesExactas, ...calculadas];
}

async function ejecutarEnParalelo({
  f,
  tareas,
  raicesExactas,
  tolerancia,
  maxIter,
  maxWorkers
}) {
  const fuenteFuncion = f.toString();

  const tareasSerializadas = tareas.map((tarea) => ({
    ...tarea,
    fuenteFuncion,
    tolerancia,
    maxIter
  }));

  const calculadas = await ejecutarParalelo(
    tareasSerializadas,
    resolverBiseccionWorker,
    { maxWorkers }
  );

  return [...raicesExactas, ...calculadas];
}

/**
 * Busca todas las raíces detectables por cambio de signo dentro de un intervalo.
 *
 * El intervalo [inicio, fin] se divide en subintervalos de tamaño `paso`.
 * Cada subintervalo con cambio de signo se resuelve mediante bisección.
 *
 * Con `paralelo: false` se ejecuta secuencialmente, sin overhead de threads.
 * Con `paralelo: true`, cada subintervalo independiente se distribuye entre
 * Worker Threads de Node.js usando `ejecutarParalelo`.
 *
 * Importante: para usar `paralelo: true`, la función `f` debe ser serializable
 * mediante `f.toString()` y no depender de variables externas por closure.
 *
 * Benchmark documentado:
 *
 * ```js
 * const f = x => Math.sin(50 * x);
 * const secuencial = buscarTodasLasRaices({ f, inicio: 0, fin: 100, paso: 0.01 });
 * const paralelo = await buscarTodasLasRaices({
 *   f,
 *   inicio: 0,
 *   fin: 100,
 *   paso: 0.01,
 *   paralelo: true,
 *   benchmark: true
 * });
 *
 * console.log(paralelo.meta.benchmark);
 * ```
 *
 * El campo `meta.benchmark` reporta `secuencial_ms`, `paralelo_ms` y
 * `factorMejora` medidos sobre el mismo conjunto de subintervalos.
 *
 * @param {Object} opciones
 * @param {Function} opciones.f - Función continua a evaluar.
 * @param {number} opciones.inicio - Extremo inferior del intervalo de búsqueda (finito).
 * @param {number} opciones.fin - Extremo superior del intervalo de búsqueda (finito, mayor que `inicio`).
 * @param {number} opciones.paso - Tamaño de cada subintervalo (finito, mayor a cero).
 * @param {number} [opciones.tolerancia=1e-6] - Tolerancia de bisección (finita, mayor a cero).
 * @param {number} [opciones.maxIter=100] - Iteraciones máximas por subintervalo (entero positivo).
 * @param {boolean} [opciones.paralelo=false] - Activa Worker Threads.
 * @param {number} [opciones.maxWorkers] - Número máximo de workers (entero mayor o igual a 1). Solo se valida con `paralelo: true`.
 * @param {boolean} [opciones.benchmark=false] - Mide secuencial vs paralelo.
 * @returns {Object|Promise<Object>} Resultado del contrato ChuspaNumeric. Con `paralelo:true` retorna Promise.
 * @throws {ErrorParametros} Si `opciones` no es un objeto, o algún parámetro tiene tipo/valor inválido,
 *   o `f` devuelve un valor no finito. Con `paralelo: true`, un `maxWorkers` inválido rechaza la promesa
 *   con `ErrorParametros` en lugar de lanzarlo de forma síncrona.
 * @throws {ErrorDivergencia} Si alguna raíz calculada no es finita.
 */
export function buscarTodasLasRaices(opciones) {
  validarOpciones(opciones);

  const {
    f,
    inicio,
    fin,
    paso,
    tolerancia = 1e-6,
    maxIter = 100,
    paralelo = false,
    maxWorkers,
    benchmark = false
  } = opciones;

  validarFuncionLocal(f);
  validarIntervaloLocal(inicio, fin);
  validarPaso(paso);
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);
  validarBooleano(paralelo, 'paralelo');
  validarBooleano(benchmark, 'benchmark');

  const { tareas, raicesExactas } = construirSubintervalos(f, inicio, fin, paso);

  if (!paralelo) {
    const { valor: resultados, tiempo_ms } = medirTiempo(() =>
      ejecutarSecuencial({ f, tareas, raicesExactas, tolerancia, maxIter })
    );

    return finalizar({
      resultados,
      inicio,
      fin,
      paso,
      tolerancia,
      maxIter,
      paralelo,
      maxWorkers,
      tiempo_ms
    });
  }

  return (async () => {
    // Dentro del async: un maxWorkers inválido rechaza la promesa (no lanza de forma síncrona).
    validarMaxWorkers(maxWorkers);

    let benchmarkInfo = null;

    if (benchmark) {
      const { tiempo_ms: secuencialMs } = medirTiempo(() =>
        ejecutarSecuencial({ f, tareas, raicesExactas, tolerancia, maxIter })
      );

      benchmarkInfo = {
        secuencial_ms: secuencialMs,
        paralelo_ms: null,
        factorMejora: null
      };
    }

    // El algoritmo paralelo es asíncrono: medirTiempo es síncrono, por eso se mide con ahora().
    const inicioParalelo = ahora();
    const resultados = await ejecutarEnParalelo({
      f,
      tareas,
      raicesExactas,
      tolerancia,
      maxIter,
      maxWorkers
    });
    const paraleloMs = ahora() - inicioParalelo;

    if (benchmarkInfo) {
      benchmarkInfo.paralelo_ms = paraleloMs;
      benchmarkInfo.factorMejora =
        paraleloMs > 0 ? benchmarkInfo.secuencial_ms / paraleloMs : null;
    }

    return finalizar({
      resultados,
      inicio,
      fin,
      paso,
      tolerancia,
      maxIter,
      paralelo,
      maxWorkers,
      tiempo_ms: paraleloMs,
      benchmark: benchmarkInfo
    });
  })();
}
