import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import test from 'node:test';

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