import {
  ErrorParametros,
  ErrorConvergencia,
  ErrorDominio,
  ErrorTamano,
  ErrorTimeout,
  ErrorDivergencia,
  ErrorNumerico,
  ErrorNoConvergencia,
  ErrorMatrizSingular,
} from '../../../src/core/errores.js';

// Clases que heredan directamente de Error
const erroresDirectos = [
  ['ErrorParametros', ErrorParametros],
  ['ErrorConvergencia', ErrorConvergencia],
  ['ErrorDominio', ErrorDominio],
  ['ErrorTamano', ErrorTamano],
  ['ErrorTimeout', ErrorTimeout],
  ['ErrorDivergencia', ErrorDivergencia],
  ['ErrorNumerico', ErrorNumerico],
];

// Clases que heredan de ErrorNumerico
const erroresNumericos = [
  ['ErrorNoConvergencia', ErrorNoConvergencia],
  ['ErrorMatrizSingular', ErrorMatrizSingular],
];

const todosLosErrores = [...erroresDirectos, ...erroresNumericos];

describe('errores - construcción, nombre y mensaje', () => {
  test.each(todosLosErrores)('%s es una instancia de Error', (_nombre, Clase) => {
    expect(new Clase('mensaje de prueba')).toBeInstanceOf(Error);
  });

  test.each(todosLosErrores)('%s tiene el nombre de su clase', (nombre, Clase) => {
    const error = new Clase('mensaje de prueba');

    expect(error.name).toBe(nombre);
    expect(error.constructor.name).toBe(nombre);
  });

  test.each(todosLosErrores)('%s conserva el mensaje recibido al construirse', (_nombre, Clase) => {
    const mensaje = `Fallo en la iteración 5 con x = ${Math.PI}`;

    expect(new Clase(mensaje).message).toBe(mensaje);
  });

  test.each(todosLosErrores)('%s incluye el nombre y el mensaje en toString()', (nombre, Clase) => {
    expect(new Clase('detalle').toString()).toBe(`${nombre}: detalle`);
  });

  test.each(todosLosErrores)('%s se puede lanzar y capturar con su tipo', (_nombre, Clase) => {
    expect(() => {
      throw new Clase('lanzado');
    }).toThrow(Clase);
  });
});

describe('errores - mensajes por defecto', () => {
  test('ErrorNoConvergencia usa un mensaje por defecto si se construye sin argumentos', () => {
    expect(new ErrorNoConvergencia().message).toBe(
      'ChuspaNumeric: el método no convergió dentro del número máximo de iteraciones permitido.'
    );
  });

  test('ErrorMatrizSingular usa un mensaje por defecto si se construye sin argumentos', () => {
    expect(new ErrorMatrizSingular().message).toBe(
      'ChuspaNumeric: la matriz es singular (su determinante es cero) y no se puede resolver ni invertir.'
    );
  });

  test.each(erroresDirectos)('%s sin argumentos queda con un mensaje vacío', (_nombre, Clase) => {
    expect(new Clase().message).toBe('');
  });
});

describe('errores - jerarquía de herencia', () => {
  test.each(erroresDirectos)('%s hereda directamente de Error', (_nombre, Clase) => {
    expect(Object.getPrototypeOf(Clase)).toBe(Error);
  });

  test.each(erroresNumericos)('%s hereda de ErrorNumerico', (_nombre, Clase) => {
    expect(Object.getPrototypeOf(Clase)).toBe(ErrorNumerico);

    const error = new Clase();

    expect(error).toBeInstanceOf(ErrorNumerico);
    expect(error).toBeInstanceOf(Error);
  });

  test.each(erroresDirectos.filter(([nombre]) => nombre !== 'ErrorNumerico'))(
    '%s no es un ErrorNumerico',
    (_nombre, Clase) => {
      expect(new Clase('x')).not.toBeInstanceOf(ErrorNumerico);
    }
  );

  test('un ErrorNumerico genérico no es ninguna de sus subclases', () => {
    const error = new ErrorNumerico('genérico');

    expect(error).not.toBeInstanceOf(ErrorNoConvergencia);
    expect(error).not.toBeInstanceOf(ErrorMatrizSingular);
  });
});

describe('errores - distinguir tipos con instanceof', () => {
  test.each(todosLosErrores)('%s solo es instancia de su propia clase y de sus ancestros', (nombre, Clase) => {
    const error = new Clase('x');
    const ancestros = erroresNumericos.some(([n]) => n === nombre) ? ['ErrorNumerico'] : [];

    for (const [otroNombre, OtraClase] of todosLosErrores) {
      const esperado = otroNombre === nombre || ancestros.includes(otroNombre);

      expect(error instanceof OtraClase).toBe(esperado);
    }
  });

  test('ErrorConvergencia y ErrorNoConvergencia son tipos distintos', () => {
    expect(new ErrorConvergencia('x')).not.toBeInstanceOf(ErrorNoConvergencia);
    expect(new ErrorNoConvergencia()).not.toBeInstanceOf(ErrorConvergencia);
  });

  test('un solo instanceof ErrorNumerico captura sus subclases y deja pasar los demás errores', () => {
    const capturar = (error) => {
      try {
        throw error;
      } catch (e) {
        return e instanceof ErrorNumerico ? 'numerico' : 'otro';
      }
    };

    expect(capturar(new ErrorNoConvergencia())).toBe('numerico');
    expect(capturar(new ErrorMatrizSingular())).toBe('numerico');
    expect(capturar(new ErrorParametros('x'))).toBe('otro');
    expect(capturar(new ErrorDominio('x'))).toBe('otro');
  });
});

describe('errores - precision y convergencia numerica', () => {
  test.each([
    [1e-3, 1e-2],
    [1e-6, 1e-5],
    [1e-9, 1e-8],
  ])(
    'ErrorNoConvergencia conserva el detalle cuando el error relativo supera la tolerancia %s',
    (tolerancia, errorRelativo) => {
      expect(errorRelativo).toBeGreaterThan(tolerancia);

      const mensaje = `No convergio: error relativo ${errorRelativo}, tolerancia ${tolerancia}`;
      const error = new ErrorNoConvergencia(mensaje);

      expect(error).toBeInstanceOf(ErrorNoConvergencia);
      expect(error).toBeInstanceOf(ErrorNumerico);
      expect(error.message).toBe(mensaje);
    }
  );

  test.each([
    [0.1, 0.01],
    [0.01, 0.0001],
    [0.001, 0.000001],
  ])(
    'ErrorConvergencia conserva el paso h=%s y el error asociado',
    (paso, errorAbsoluto) => {
      const mensaje = `Paso h=${paso}; error absoluto=${errorAbsoluto}`;
      const error = new ErrorConvergencia(mensaje);

      expect(error).toBeInstanceOf(ErrorConvergencia);
      expect(error.message).toBe(mensaje);
      expect(error.toString()).toBe(`ErrorConvergencia: ${mensaje}`);
    }
  );

  test('ErrorNoConvergencia representa un error que no disminuye al reducir h', () => {
    const pasos = [0.1, 0.01, 0.001];
    const erroresRelativos = [0.05, 0.05, 0.05];
    const tolerancia = 1e-6;

    expect(erroresRelativos.every((error) => error > tolerancia)).toBe(true);

    const mensaje = `Sin convergencia para pasos ${pasos.join(', ')}`;
    const error = new ErrorNoConvergencia(mensaje);

    expect(error).toBeInstanceOf(ErrorNoConvergencia);
    expect(error.message).toBe(mensaje);
  });

  test('ErrorDivergencia conserva el contexto de errores relativos crecientes', () => {
    const pasos = [0.1, 0.01, 0.001];
    const erroresRelativos = [0.1, 0.5, 2];

    expect(erroresRelativos[1]).toBeGreaterThan(erroresRelativos[0]);
    expect(erroresRelativos[2]).toBeGreaterThan(erroresRelativos[1]);

    const mensaje = `Divergencia con pasos ${pasos.join(', ')}`;
    const error = new ErrorDivergencia(mensaje);

    expect(error).toBeInstanceOf(ErrorDivergencia);
    expect(error.message).toBe(mensaje);
  });

  test('distingue errores de no convergencia y divergencia', () => {
    const noConvergencia = new ErrorNoConvergencia('Tolerancia no alcanzada');
    const divergencia = new ErrorDivergencia('Error creciente');

    expect(noConvergencia).toBeInstanceOf(ErrorNumerico);
    expect(noConvergencia).not.toBeInstanceOf(ErrorDivergencia);

    expect(divergencia).toBeInstanceOf(ErrorDivergencia);
    expect(divergencia).not.toBeInstanceOf(ErrorNoConvergencia);
  });
});
