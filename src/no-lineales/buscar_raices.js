import { crearResultado } from '../core/contrato.js';
import { ErrorParametros } from '../core/errores.js';
import {
  validarFuncion,
  validarIntervalo,
  validarTolerancia,
  validarIteraciones,
} from '../utils/validaciones.js';
import { ejecutarParalelo } from '../utils/ejecutar_paralelo.js';

function ahora() {
  return globalThis.performance && typeof globalThis.performance.now === 'function'
    ? globalThis.performance.now()
    : Date.now();
}

function validarPaso(paso) {
  if (typeof paso !== 'number' || !Number.isFinite(paso) || paso <= 0) {
    throw new ErrorParametros(
      `ChuspaNumeric.buscarTodasLasRaices: 'paso' debe ser un número finito mayor a cero. Se recibió: ${paso}.`
    );
  }
}

function validarValorFuncion(valor, x) {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametros(
      `ChuspaNumeric.buscarTodasLasRaices: la función debe devolver un número finito. En x=${x} devolvió ${valor}.`
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

function crearRespuesta({
  resultados,
  inicio,
  fin,
  paso,
  tolerancia,
  maxIter,
  paralelo,
  maxWorkers,
  tiempoMs,
  benchmark = null
}) {
  const ordenados = ordenarResultados(resultados);
  const raices = ordenados.map((item) => item.raiz);

  return crearResultado({
    resultado: raices,
    iteraciones: ordenados,
    convergio: ordenados.every((item) => item.convergio),
    mensaje: `Se encontraron ${raices.length} raíz(es) en el intervalo [${inicio}, ${fin}].`,
    meta: {
      metodo: 'buscarTodasLasRaices',
      parametros: {
        inicio,
        fin,
        paso,
        tolerancia,
        maxIter,
        paralelo,
        maxWorkers
      },
      tiempo_ms: tiempoMs,
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
 * @param {Object} params
 * @param {Function} params.f - Función continua a evaluar.
 * @param {number} params.inicio - Extremo inferior del intervalo de búsqueda.
 * @param {number} params.fin - Extremo superior del intervalo de búsqueda.
 * @param {number} params.paso - Tamaño de cada subintervalo.
 * @param {number} [params.tolerancia=1e-6] - Tolerancia de bisección.
 * @param {number} [params.maxIter=100] - Iteraciones máximas por subintervalo.
 * @param {boolean} [params.paralelo=false] - Activa Worker Threads.
 * @param {number} [params.maxWorkers] - Número máximo de workers.
 * @param {boolean} [params.benchmark=false] - Mide secuencial vs paralelo.
 * @returns {Object|Promise<Object>} Resultado del contrato ChuspaNumeric. Con `paralelo:true` retorna Promise.
 */
export function buscarTodasLasRaices({
  f,
  inicio,
  fin,
  paso,
  tolerancia = 1e-6,
  maxIter = 100,
  paralelo = false,
  maxWorkers,
  benchmark = false
}) {
  validarFuncion(f, 'f');
  validarIntervalo(inicio, fin);
  validarPaso(paso);
  validarTolerancia(tolerancia);
  validarIteraciones(maxIter);

  const { tareas, raicesExactas } = construirSubintervalos(f, inicio, fin, paso);

  if (!paralelo) {
    const inicioTiempo = ahora();
    const resultados = ejecutarSecuencial({ f, tareas, raicesExactas, tolerancia, maxIter });
    const tiempoMs = ahora() - inicioTiempo;

    return crearRespuesta({
      resultados,
      inicio,
      fin,
      paso,
      tolerancia,
      maxIter,
      paralelo,
      maxWorkers,
      tiempoMs
    });
  }

  return (async () => {
    let benchmarkInfo = null;

    if (benchmark) {
      const inicioSecuencial = ahora();
      ejecutarSecuencial({ f, tareas, raicesExactas, tolerancia, maxIter });
      const secuencialMs = ahora() - inicioSecuencial;

      benchmarkInfo = {
        secuencial_ms: secuencialMs,
        paralelo_ms: null,
        factorMejora: null
      };
    }

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

    return crearRespuesta({
      resultados,
      inicio,
      fin,
      paso,
      tolerancia,
      maxIter,
      paralelo,
      maxWorkers,
      tiempoMs: paraleloMs,
      benchmark: benchmarkInfo
    });
  })();
}