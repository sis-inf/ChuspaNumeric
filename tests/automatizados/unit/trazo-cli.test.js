import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.resolve(__dirname, '../../../src/cli/trazo-cli.js');

const runCli = (args) => {
  return spawnSync('node', [cliPath, ...args], { encoding: 'utf-8' });
};

const obtenerResultado = (stdout) => {
  const inicio = stdout.indexOf('{');
  const fin = stdout.lastIndexOf('}');

  if (inicio === -1 || fin === -1) {
    throw new Error(`No se encontró un resultado JSON:\n${stdout}`);
  }

  return JSON.parse(stdout.slice(inicio, fin + 1));
};

describe('ChuspaNumeric CLI', () => {
  test('ejecucion exitosa del comando biseccion con argumentos validos', () => {
    const result = runCli(['biseccion', '--f', 'x^2-4', '--a', '0', '--b', '3']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('resultado');
    expect(result.stdout).toContain('"convergio": true');
  });

  test('ejecucion exitosa del comando newtonRaphson con argumentos validos', () => {
    const result = runCli(['newtonRaphson', '--f', 'x^2-4', '--df', '2*x', '--x0', '3']);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('resultado');
    expect(result.stdout).toContain('"convergio": true');
  });

  test.each([
    { a: '0', b: '3', tolerancia: '1e-4' },
    { a: '1.5', b: '3', tolerancia: '1e-8' },
  ])(
    'biseccion alcanza la precision solicitada con tolerancia $tolerancia',
    ({ a, b, tolerancia }) => {
      const result = runCli([
        'biseccion',
        '--f', 'x^2-4',
        '--a', a,
        '--b', b,
        '--tolerancia', tolerancia,
      ]);

      expect(result.status).toBe(0);

      const datos = obtenerResultado(result.stdout);
      const errorRelativo = Math.abs(datos.resultado - 2) / 2;

      expect(datos.convergio).toBe(true);
      expect(Math.abs(datos.resultado - 2)).toBeLessThan(Number(tolerancia));
      expect(errorRelativo).toBeLessThan(Number(tolerancia));
    }
  );

  test.each([
    { x0: '3', tolerancia: '1e-4' },
    { x0: '1', tolerancia: '1e-8' },
  ])(
    'newtonRaphson alcanza la precision solicitada con tolerancia $tolerancia',
    ({ x0, tolerancia }) => {
      const result = runCli([
        'newtonRaphson',
        '--f', 'x^2-4',
        '--df', '2*x',
        '--x0', x0,
        '--tolerancia', tolerancia,
      ]);

      expect(result.status).toBe(0);

      const datos = obtenerResultado(result.stdout);
      const errorRelativo = Math.abs(datos.resultado - 2) / 2;

      expect(datos.convergio).toBe(true);
      expect(Math.abs(datos.resultado - 2)).toBeLessThan(Number(tolerancia));
      expect(errorRelativo).toBeLessThan(Number(tolerancia));
    }
  );

  test('biseccion presenta convergencia lineal', () => {
    const result = runCli([
      'biseccion',
      '--f', 'x^2-4',
      '--a', '0',
      '--b', '3',
      '--tolerancia', '1e-8',
    ]);

    expect(result.status).toBe(0);

    const datos = obtenerResultado(result.stdout);
    const errores = datos.iteraciones.map(
      (iteracion) => Math.abs(iteracion.c - 2)
    );

    expect(datos.convergio).toBe(true);
    expect(errores.length).toBeGreaterThan(2);

    const ultimo = errores.length - 1;
    const razon = errores[ultimo] / errores[ultimo - 1];

    expect(razon).toBeCloseTo(0.5, 10);
  });

  test('newtonRaphson presenta convergencia cuadratica', () => {
    const result = runCli([
      'newtonRaphson',
      '--f', 'x^2-4',
      '--df', '2*x',
      '--x0', '3',
      '--tolerancia', '1e-8',
    ]);

    expect(result.status).toBe(0);

    const datos = obtenerResultado(result.stdout);
    const errores = datos.iteraciones.map(
      (iteracion) => Math.abs(iteracion.x - 2)
    );

    expect(datos.convergio).toBe(true);
    expect(errores.length).toBeGreaterThan(2);

    const ultimo = errores.length - 1;
    const razon = errores[ultimo] / (errores[ultimo - 1] ** 2);

    expect(razon).toBeCloseTo(0.25, 2);
  });

  test('newtonRaphson requiere menos iteraciones que biseccion para la misma precision', () => {
    const tolerancia = '1e-8';

    const resultadoBiseccion = runCli([
      'biseccion',
      '--f', 'x^2-4',
      '--a', '0',
      '--b', '3',
      '--tolerancia', tolerancia,
    ]);

    const resultadoNewton = runCli([
      'newtonRaphson',
      '--f', 'x^2-4',
      '--df', '2*x',
      '--x0', '3',
      '--tolerancia', tolerancia,
    ]);

    expect(resultadoBiseccion.status).toBe(0);
    expect(resultadoNewton.status).toBe(0);

    const biseccion = obtenerResultado(resultadoBiseccion.stdout);
    const newton = obtenerResultado(resultadoNewton.stdout);

    expect(biseccion.convergio).toBe(true);
    expect(newton.convergio).toBe(true);
    expect(newton.iteraciones.length).toBeLessThan(
      biseccion.iteraciones.length
    );
  });

  test('biseccion informa que no converge cuando alcanza el maximo de iteraciones', () => {
    const result = runCli([
      'biseccion',
      '--f', 'x^2-4',
      '--a', '0',
      '--b', '3',
      '--tolerancia', '1e-12',
      '--maxIter', '1',
    ]);

    expect(result.status).toBe(0);

    const datos = obtenerResultado(result.stdout);

    expect(datos.convergio).toBe(false);
    expect(datos.iteraciones).toHaveLength(1);
    expect(datos.mensaje).toContain('sin converger');
  });

  test('newtonRaphson informa que no converge cuando alcanza el maximo de iteraciones', () => {
    const result = runCli([
      'newtonRaphson',
      '--f', 'x^2-4',
      '--df', '2*x',
      '--x0', '3',
      '--tolerancia', '1e-12',
      '--maxIter', '1',
    ]);

    expect(result.status).toBe(0);

    const datos = obtenerResultado(result.stdout);

    expect(datos.convergio).toBe(false);
    expect(datos.iteraciones).toHaveLength(1);
    expect(datos.mensaje).toContain('sin converger');
  });

  test('newtonRaphson detecta divergencia numerica', () => {
    const result = runCli([
      'newtonRaphson',
      '--f', '1e308',
      '--df', '1e-308',
      '--x0', '1',
    ]);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('newtonRaphson');
    expect(result.stderr).toContain('Infinity');
  });

  test('comando desconocido muestra mensaje de ayuda sin lanzar excepcion no controlada', () => {
    const result = runCli(['metodoInventado']);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Método "metodoInventado" no soportado');
    expect(result.stdout).toContain('ChuspaNumeric CLI');
    expect(result.stdout).toContain('Uso:');
  });
});
