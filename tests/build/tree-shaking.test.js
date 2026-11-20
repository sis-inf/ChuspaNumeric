import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { test } from '@jest/globals';
import { biseccion } from '../../src/no-lineales/biseccion.js';
import { gauss } from '../../src/lineales/gauss.js';
import { trapecio } from '../../src/integracion/trapecio.js';

const raizProyecto = process.cwd();

function leerJson(ruta) {
  return JSON.parse(readFileSync(ruta, 'utf8'));
}

function listarArchivosJs(directorio) {
  const archivos = [];

  for (const entrada of readdirSync(directorio)) {
    const ruta = join(directorio, entrada);
    const estado = statSync(ruta);

    if (estado.isDirectory()) {
      archivos.push(...listarArchivosJs(ruta));
    } else if (entrada.endsWith('.js')) {
      archivos.push(ruta);
    }
  }

  return archivos;
}

function limpiarComentarios(contenido) {
  return contenido
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');
}

test('package.json declara sideEffects: false', () => {
  const packageJson = leerJson(join(raizProyecto, 'package.json'));

  assert.equal(packageJson.sideEffects, false);
});

test('los módulos de src no tienen efectos secundarios evidentes a nivel de módulo', () => {
  const archivos = listarArchivosJs(join(raizProyecto, 'src'))
    .map((ruta) => relative(raizProyecto, ruta).replaceAll('\\', '/'))
    .filter((ruta) => !ruta.startsWith('src/cli/'));

  const sospechosos = [];

  for (const archivo of archivos) {
    const contenido = limpiarComentarios(readFileSync(join(raizProyecto, archivo), 'utf8'));
    const lineas = contenido.split('\n');

    lineas.forEach((linea, indice) => {
      const texto = linea.trim();

      if (
        texto.startsWith('console.') ||
        texto.startsWith('process.exit') ||
        texto.startsWith('setTimeout(') ||
        texto.startsWith('setInterval(') ||
        texto.startsWith('await ')
      ) {
        sospechosos.push(`${archivo}:${indice + 1} -> ${texto}`);
      }
    });
  }

  assert.deepEqual(sospechosos, []);
});

const submodulos = [
  { archivo: 'src/no-lineales/biseccion.js', exportacion: 'biseccion' },
  { archivo: 'src/lineales/gauss.js', exportacion: 'gauss' },
  { archivo: 'src/integracion/trapecio.js', exportacion: 'trapecio' }
];

for (const { archivo, exportacion } of submodulos) {
  test(`${archivo} se importa de forma aislada y exporta ${exportacion} como función`, async () => {
    const ruta = join(raizProyecto, archivo);
    const modulo = await import(pathToFileURL(ruta).href);

    assert.ok(exportacion in modulo, `${archivo} no exporta ${exportacion}`);
    assert.equal(typeof modulo[exportacion], 'function');
  });
}

test('bisección mejora el error relativo al reducir la tolerancia', () => {
  const f = x => x ** 3 - x - 2;

  const resultadoMenosPreciso = biseccion({
    f,
    a: 1,
    b: 2,
    tolerancia: 1e-3
  });

  const resultadoMasPreciso = biseccion({
    f,
    a: 1,
    b: 2,
    tolerancia: 1e-8
  });

  const raizAproximada = 1.5213797068045676;

  const errorRelativoMenosPreciso =
    Math.abs(resultadoMenosPreciso.resultado - raizAproximada) /
    Math.abs(raizAproximada);

  const errorRelativoMasPreciso =
    Math.abs(resultadoMasPreciso.resultado - raizAproximada) /
    Math.abs(raizAproximada);

  assert.ok(resultadoMenosPreciso.convergio);
  assert.ok(resultadoMasPreciso.convergio);
  assert.ok(resultadoMasPreciso.iteraciones.length >
    resultadoMenosPreciso.iteraciones.length);
  assert.ok(errorRelativoMasPreciso < errorRelativoMenosPreciso);
});

test('bisección presenta convergencia lineal', () => {
  const resultado = biseccion({
    f: x => x ** 2 - 2,
    a: 1,
    b: 2,
    tolerancia: 1e-12,
    maxIter: 6
  });

  const errores = resultado.iteraciones.map(iteracion => iteracion.error);

  const ordenConvergencia =
    Math.log(errores[0] / errores[1]) /
    Math.log(errores[1] / errores[2]);

  assert.equal(resultado.convergio, false);
  assert.ok(Math.abs(ordenConvergencia - 1) < 1e-10);
});

test('bisección identifica cuando las iteraciones son insuficientes', () => {
  const resultado = biseccion({
    f: x => x ** 2 - 2,
    a: 1,
    b: 2,
    tolerancia: 1e-12,
    maxIter: 2
  });

  assert.equal(resultado.convergio, false);
  assert.equal(resultado.iteraciones.length, 2);
  assert.ok(resultado.iteraciones.at(-1).error > 1e-12);
  assert.match(resultado.mensaje, /sin converger/i);
});

test('trapecio reduce el error relativo al aumentar los subintervalos', () => {
  const integralExacta = 1 / 3;

  const resultado10 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 10
  });

  const resultado20 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 20
  });

  const resultado40 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 40
  });

  const errorRelativo10 =
    Math.abs(resultado10.resultado - integralExacta) / integralExacta;

  const errorRelativo20 =
    Math.abs(resultado20.resultado - integralExacta) / integralExacta;

  const errorRelativo40 =
    Math.abs(resultado40.resultado - integralExacta) / integralExacta;

  assert.ok(errorRelativo20 < errorRelativo10);
  assert.ok(errorRelativo40 < errorRelativo20);
});

test('trapecio presenta convergencia de segundo orden', () => {
  const integralExacta = 1 / 3;

  const resultado10 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 10
  });

  const resultado20 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 20
  });

  const resultado40 = trapecio({
    f: x => x ** 2,
    a: 0,
    b: 1,
    n: 40
  });

  const error10 = Math.abs(resultado10.resultado - integralExacta);
  const error20 = Math.abs(resultado20.resultado - integralExacta);
  const error40 = Math.abs(resultado40.resultado - integralExacta);

  const ordenConvergencia =
    Math.log(error10 / error20) / Math.log(2);

  const ordenConvergenciaSiguiente =
    Math.log(error20 / error40) / Math.log(2);

  assert.ok(Math.abs(ordenConvergencia - 2) < 1e-10);
  assert.ok(Math.abs(ordenConvergenciaSiguiente - 2) < 1e-10);
});

test('gauss obtiene una solución con error relativo reducido', () => {
  const resultado = gauss({
    A: [
      [3, 1],
      [1, 2]
    ],
    b: [9, 8]
  });

  const solucionExacta = [2, 3];

  resultado.resultado.forEach((valor, indice) => {
    const errorRelativo =
      Math.abs(valor - solucionExacta[indice]) /
      Math.abs(solucionExacta[indice]);

    assert.ok(errorRelativo < 1e-12);
  });
});

test('gauss detecta una solución que produce divergencia numérica', () => {
  assert.throws(() => {
    gauss({
      A: [[2e-12]],
      b: [Number.MAX_VALUE]
    });
  });
});