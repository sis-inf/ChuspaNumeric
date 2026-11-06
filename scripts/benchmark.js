/**
 * Script de benchmark para los métodos numéricos de ChuspaNumeric.
 *
 * Ejecuta cada método con un caso de prueba representativo y mide su
 * tiempo de ejecución usando `medirTiempo` del propio contrato de ChuspaNumeric,
 * repitiendo cada caso varias veces para obtener un tiempo promedio estable.
 *
 * Uso: node scripts/benchmark.js
 */

import { medirTiempo } from '../src/core/contrato.js';

import { gauss } from '../src/lineales/gauss.js';
import { gaussJordan } from '../src/lineales/gauss-jordan.js';
import { jacobi } from '../src/lineales/jacobi.js';
import { gaussSeidel } from '../src/lineales/gauss-seidel.js';
import { lu } from '../src/lineales/lu.js';

import { biseccion } from '../src/no-lineales/biseccion.js';
import { falsaPosicion } from '../src/no-lineales/falsa-posicion.js';
import { newtonRaphson } from '../src/no-lineales/newton-raphson.js';
import { secante } from '../src/no-lineales/secante.js';
import { puntoFijo } from '../src/no-lineales/punto-fijo.js';
import { muller } from '../src/no-lineales/muller.js';

import { lagrange } from '../src/interpolacion/lagrange.js';
import { newtonDD } from '../src/interpolacion/newton-dd.js';
import { splines } from '../src/interpolacion/splines.js';

import { trapecio } from '../src/integracion/trapecio.js';
import { simpson13 } from '../src/integracion/simpson-13.js';
import { simpson38 } from '../src/integracion/simpson-38.js';

import { euler } from '../src/edo/euler.js';
import { eulerMejorado } from '../src/edo/euler-mejorado.js';
import { rungeKutta4 } from '../src/edo/runge_kutta_4.js';

const REPETICIONES = 1000;

const A3 = [
  [2, 1, -1],
  [-3, -1, 2],
  [-2, 1, 2],
];
const b3 = [8, -11, -3];

const Adiag = [
  [10, -1, 2],
  [-1, 11, -1],
  [2, -1, 10],
];
const bdiag = [6, 25, -11];

const puntosInterp = [
  [0, 1],
  [1, 2.7183],
  [2, 7.3891],
  [3, 20.0855],
];

const casos = [
  { categoria: 'Sistemas lineales', nombre: 'gauss', fn: () => gauss({ A: A3, b: b3 }) },
  { categoria: 'Sistemas lineales', nombre: 'gaussJordan', fn: () => gaussJordan({ A: A3, b: b3 }) },
  { categoria: 'Sistemas lineales', nombre: 'jacobi', fn: () => jacobi({ A: Adiag, b: bdiag, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Sistemas lineales', nombre: 'gaussSeidel', fn: () => gaussSeidel({ A: Adiag, b: bdiag, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Sistemas lineales', nombre: 'lu', fn: () => lu({ A: A3, b: b3 }) },

  { categoria: 'Ecuaciones no lineales', nombre: 'biseccion', fn: () => biseccion({ f: (x) => x * x - 4, a: 0, b: 3, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Ecuaciones no lineales', nombre: 'falsaPosicion', fn: () => falsaPosicion({ f: (x) => x * x - 4, a: 0, b: 3, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Ecuaciones no lineales', nombre: 'newtonRaphson', fn: () => newtonRaphson({ f: (x) => x * x - 4, df: (x) => 2 * x, x0: 3, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Ecuaciones no lineales', nombre: 'secante', fn: () => secante({ f: (x) => x * x - 4, x0: 0, x1: 3, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Ecuaciones no lineales', nombre: 'puntoFijo', fn: () => puntoFijo({ g: (x) => (x + 4 / x) / 2, x0: 3, tolerancia: 1e-6, maxIter: 100 }) },
  { categoria: 'Ecuaciones no lineales', nombre: 'muller', fn: () => muller({ f: (x) => x * x - 4, x0: 0, x1: 1.5, x2: 3, tolerancia: 1e-6, maxIter: 100 }) },

  { categoria: 'Interpolación', nombre: 'lagrange', fn: () => lagrange({ puntos: puntosInterp, x: 1.5 }) },
  { categoria: 'Interpolación', nombre: 'newtonDD', fn: () => newtonDD({ puntos: puntosInterp, x: 1.5 }) },
  { categoria: 'Interpolación', nombre: 'splines', fn: () => splines({ puntos: puntosInterp, x: 1.5 }) },

  { categoria: 'Integración numérica', nombre: 'trapecio', fn: () => trapecio({ f: (x) => x * x, a: 0, b: 1, n: 100 }) },
  { categoria: 'Integración numérica', nombre: 'simpson13', fn: () => simpson13({ f: (x) => x * x, a: 0, b: 1, n: 100 }) },
  { categoria: 'Integración numérica', nombre: 'simpson38', fn: () => simpson38({ f: (x) => x * x, a: 0, b: 1, n: 99 }) },

  { categoria: 'EDO', nombre: 'euler', fn: () => euler({ f: (x, y) => y, x0: 0, y0: 1, h: 0.01, xFinal: 1 }) },
  { categoria: 'EDO', nombre: 'eulerMejorado', fn: () => eulerMejorado({ f: (x, y) => y, x0: 0, y0: 1, h: 0.01, xFinal: 1 }) },
  { categoria: 'EDO', nombre: 'rungeKutta4', fn: () => rungeKutta4({ f: (x, y) => y, x0: 0, y0: 1, h: 0.01, xFinal: 1 }) },
];

console.log('# Resultados de benchmark (Node', process.version, ')');
console.log('categoria,metodo,tiempo_promedio_ms,iteraciones_por_segundo,repeticiones,error');
console.log('');

const resultados = [];

for (const caso of casos) {
  let tiempos = [];
  let error = null;

  try {
    // Calentamiento (evita medir la compilación JIT inicial)
    for (let i = 0; i < 5; i++) caso.fn();

    for (let i = 0; i < REPETICIONES; i++) {
      const { tiempo_ms } = medirTiempo(caso.fn);
      tiempos.push(tiempo_ms);
    }
  } catch (e) {
    error = e.message;
  }

  if (error) {
    console.log(`${caso.categoria},${caso.nombre},ERROR,,,${error}`);
    resultados.push({ ...caso, error });
    continue;
  }

  const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
  const iteracionesPorSegundo = promedio > 0 ? 1000 / promedio : Infinity;

  console.log(
    `${caso.categoria},${caso.nombre},${promedio.toFixed(4)},${iteracionesPorSegundo.toFixed(0)},${REPETICIONES},`
  );

  resultados.push({ ...caso, promedio, iteracionesPorSegundo });
}

console.log('');
console.log('# JSON');
console.log(JSON.stringify(resultados.map(({ fn, ...rest }) => rest), null, 2));
