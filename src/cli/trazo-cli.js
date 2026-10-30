#!/usr/bin/env node

import { compile } from 'mathjs';
import { biseccion } from '../no-lineales/biseccion.js';
import { newtonRaphson } from '../no-lineales/newton-raphson.js';
import { generarGraficoAscii } from './grafico_ascii.js';
import { verificarVersion } from './verificar_version.js';

function parseArgs(argv) {
  const positional = [];
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const nombre = arg.slice(2);
      const siguiente = argv[i + 1];

      if (siguiente !== undefined && !siguiente.startsWith('--')) {
        args[nombre] = siguiente;
        i++;
      } else {
        args[nombre] = true;
      }
    } else {
      positional.push(arg);
    }
  }

  const command = positional[0] ? positional[0].replace(/\.$/, '') : undefined;

  return { command, args };
}

function parseFunction(expression, nombre = 'f') {
  if (!expression) {
    throw new Error(`Debe proporcionar una expresión con --${nombre}.`);
  }

  try {
    const compiled = compile(expression);
    return (x) => compiled.evaluate({ x });
  } catch {
    throw new Error(`Expresión matemática inválida en --${nombre}.`);
  }
}

function parseNumber(value, nombre) {
  const numero = Number(value);

  if (!Number.isFinite(numero)) {
    throw new Error(`El parámetro --${nombre} debe ser un número válido.`);
  }

  return numero;
}

function mostrarResultado(resultado, args) {
  console.log(JSON.stringify(resultado, null, 2));

  if (args.grafico) {
    console.log('');
    console.log(generarGraficoAscii(resultado));
  }
}

function showHelp() {
  console.log(`
Trazo CLI
---------

Uso:
  chuspanumeric <metodo> [opciones]

Métodos disponibles:
  biseccion
  newtonRaphson

Opciones generales:
  --grafico       Muestra un gráfico ASCII del error por iteración

Opciones para biseccion:
  --f             Función, ejemplo: "x^2-4"
  --a             Extremo izquierdo
  --b             Extremo derecho
  --tolerancia    Tolerancia opcional
  --maxIter       Máximo de iteraciones opcional

Ejemplo:
  chuspanumeric biseccion --f "x^2-4" --a 0 --b 3 --grafico

Opciones para newtonRaphson:
  --f             Función, ejemplo: "x^2-4"
  --df            Derivada, ejemplo: "2*x"
  --x0            Valor inicial
  --tolerancia    Tolerancia opcional
  --maxIter       Máximo de iteraciones opcional

Ejemplo:
  chuspanumeric newtonRaphson --f "x^2-4" --df "2*x" --x0 3 --grafico
`);
}

await verificarVersion();

const { command, args } = parseArgs(process.argv.slice(2));

if (
  !command ||
  process.argv.includes('--help') ||
  process.argv.includes('-h')
) {
  showHelp();
  process.exit(0);
}

try {
  switch (command) {
    case 'biseccion': {
      if (
        args.f === undefined ||
        args.a === undefined ||
        args.b === undefined
      ) {
        throw new Error('Debe proporcionar --f, --a y --b.');
      }

      const resultado = biseccion({
        f: parseFunction(args.f, 'f'),
        a: parseNumber(args.a, 'a'),
        b: parseNumber(args.b, 'b'),
        tolerancia:
          args.tolerancia !== undefined
            ? parseNumber(args.tolerancia, 'tolerancia')
            : undefined,
        maxIter:
          args.maxIter !== undefined
            ? parseNumber(args.maxIter, 'maxIter')
            : undefined,
      });

      mostrarResultado(resultado, args);
      break;
    }

    case 'newtonRaphson':
    case 'newton-raphson': {
      const x0 = args.x0 ?? args.xInicial;

      if (
        args.f === undefined ||
        args.df === undefined ||
        x0 === undefined
      ) {
        throw new Error('Debe proporcionar --f, --df y --x0.');
      }

      const derivada = parseFunction(args.df, 'df');

      const resultado = newtonRaphson({
        f: parseFunction(args.f, 'f'),
        df: derivada,
        derivada,
        fDerivada: derivada,
        x0: parseNumber(x0, 'x0'),
        xInicial: parseNumber(x0, 'x0'),
        tolerancia:
          args.tolerancia !== undefined
            ? parseNumber(args.tolerancia, 'tolerancia')
            : undefined,
        maxIter:
          args.maxIter !== undefined
            ? parseNumber(args.maxIter, 'maxIter')
            : undefined,
      });

      mostrarResultado(resultado, args);
      break;
    }

    default:
      console.error(`Método "${command}" no soportado.\n`);
      showHelp();
      process.exit(1);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}