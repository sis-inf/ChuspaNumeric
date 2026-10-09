import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cliPath = path.resolve(__dirname, '../../../src/cli/trazo-cli.js');

const runCli = (args) => {
  return spawnSync('node', [cliPath, ...args], { encoding: 'utf-8' });
};

describe('Trazo CLI', () => {
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

  test('comando desconocido muestra mensaje de ayuda sin lanzar excepcion no controlada', () => {
    const result = runCli(['metodoInventado']);
    
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Método "metodoInventado" no soportado');
    expect(result.stdout).toContain('Trazo CLI');
    expect(result.stdout).toContain('Uso:');
  });
});