import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism, cpus } from 'node:os';

function serializarError(error) {
  return {
    name: error && error.name ? error.name : 'Error',
    message: error && error.message ? error.message : String(error),
    stack: error && error.stack ? error.stack : null
  };
}

async function ejecutarLoteEnWorker() {
  const ejecutarTarea = new Function(`return (${workerData.ejecutarTarea});`)();
  const resultados = [];

  for (const item of workerData.tareas) {
    try {
      const resultado = await ejecutarTarea(item.tarea);

      resultados.push({
        index: item.index,
        ok: true,
        resultado
      });
    } catch (error) {
      resultados.push({
        index: item.index,
        ok: false,
        error: serializarError(error)
      });
    }
  }

  parentPort.postMessage({ resultados });
}

if (!isMainThread && workerData && workerData.tipo === 'chuspanumeric-ejecutar-paralelo') {
  ejecutarLoteEnWorker();
}

function obtenerNumeroWorkers(maxWorkers, totalTareas) {
  const totalCpus =
    typeof availableParallelism === 'function'
      ? availableParallelism()
      : cpus().length;

  if (maxWorkers !== undefined) {
    if (!Number.isInteger(maxWorkers) || maxWorkers < 1) {
      throw new Error(`'maxWorkers' debe ser un entero mayor o igual a 1. Se recibió: ${maxWorkers}.`);
    }

    return Math.min(maxWorkers, totalTareas);
  }

  return Math.max(1, Math.min(totalCpus, totalTareas));
}

function dividirTareas(tareas, cantidadWorkers) {
  const lotes = Array.from({ length: cantidadWorkers }, () => []);

  tareas.forEach((tarea, index) => {
    lotes[index % cantidadWorkers].push({ index, tarea });
  });

  return lotes.filter((lote) => lote.length > 0);
}

function ejecutarWorker(lote, ejecutarTarea) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(import.meta.url), {
      type: 'module',
      workerData: {
        tipo: 'chuspanumeric-ejecutar-paralelo',
        ejecutarTarea: ejecutarTarea.toString(),
        tareas: lote
      }
    });

    worker.once('message', (mensaje) => {
      resolve(mensaje.resultados);
    });

    worker.once('error', reject);

    worker.once('exit', (codigo) => {
      if (codigo !== 0) {
        reject(new Error(`Worker finalizó con código ${codigo}.`));
      }
    });
  });
}

/**
 * Ejecuta tareas independientes usando Worker Threads de Node.js.
 *
 * Cada tarea debe ser serializable, y la función `ejecutarTarea` no debe
 * depender de closures externos porque se serializa y se evalúa dentro del
 * worker. Esta utilidad está pensada para casos como evaluar bisección en
 * múltiples subintervalos independientes.
 *
 * Benchmark documentado:
 * para medir la mejora real, `buscarTodasLasRaices` puede ejecutarse con
 * `paralelo: true` y `benchmark: true`; en ese caso se informa en `meta`
 * el tiempo secuencial, el tiempo paralelo y el factor de mejora observado
 * para el mismo conjunto de subintervalos.
 *
 * @param {Array} tareas - Lista de tareas independientes.
 * @param {Function} ejecutarTarea - Función que procesa una tarea.
 * @param {Object} opciones - Opciones de ejecución.
 * @param {number} [opciones.maxWorkers] - Número máximo de workers.
 * @returns {Promise<Array>} Resultados en el mismo orden de las tareas.
 */
export async function ejecutarParalelo(tareas, ejecutarTarea, opciones = {}) {
  if (!Array.isArray(tareas)) {
    throw new Error("'tareas' debe ser un array.");
  }

  if (typeof ejecutarTarea !== 'function') {
    throw new Error("'ejecutarTarea' debe ser una función.");
  }

  if (tareas.length === 0) {
    return [];
  }

  const cantidadWorkers = obtenerNumeroWorkers(opciones.maxWorkers, tareas.length);
  const lotes = dividirTareas(tareas, cantidadWorkers);
  const resultados = new Array(tareas.length);

  const respuestas = await Promise.all(
    lotes.map((lote) => ejecutarWorker(lote, ejecutarTarea))
  );

  for (const loteResultado of respuestas) {
    for (const item of loteResultado) {
      if (!item.ok) {
        const error = new Error(item.error.message);
        error.name = item.error.name;
        error.stack = item.error.stack;
        throw error;
      }

      resultados[item.index] = item.resultado;
    }
  }

  return resultados;
}