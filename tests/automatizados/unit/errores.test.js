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

import { newtonRaphson } from '../../../src/no-lineales/newton-raphson.js';

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

// Pruebas nuevas con ejecuciones reales de Newton-Raphson
describe('errores - precision y convergencia numerica', () => {
  const f = (x) => x * x - 2;
  const df = (x) => 2 * x;

  test.each([1e-3, 1e-6, 1e-10])(
    'Newton-Raphson alcanza la tolerancia %p',
    (tolerancia) => {
      const resultado = newtonRaphson({
        f,
        df,
        x0: 1,
        tolerancia,
        maxIter: 100,
      });

      const errorAbsoluto = Math.abs(resultado.resultado - Math.SQRT2);

      expect(resultado.convergio).toBe(true);
      expect(errorAbsoluto).toBeLessThan(tolerancia);
    }
  );

  test('Newton-Raphson muestra convergencia de primer orden para una raiz multiple', () => {
    // Para f(x) = x^3, Newton-Raphson converge linealmente a x = 0.
    const resultado = newtonRaphson({
      f: (x) => x ** 3,
      df: (x) => 3 * x ** 2,
      x0: 1,
      tolerancia: 1e-12,
      maxIter: 5,
    });

    const errores = resultado.iteraciones.map(
      (iteracion) => Math.abs(iteracion.x)
    );

    expect(errores).toHaveLength(5);

    for (let i = 1; i < errores.length; i++) {
      expect(errores[i]).toBeLessThan(errores[i - 1]);
      expect(errores[i] / errores[i - 1]).toBeCloseTo(2 / 3, 8);
    }
  });

  test('Newton-Raphson muestra convergencia de segundo orden para una raiz simple', () => {
    const resultado = newtonRaphson({
      f,
      df,
      x0: 1.5,
      tolerancia: 1e-12,
      maxIter: 20,
    });

    const errores = resultado.iteraciones.map(
      (iteracion) => Math.abs(iteracion.x - Math.SQRT2)
    );

    expect(resultado.convergio).toBe(true);
    expect(errores.length).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < 2; i++) {
      expect(errores[i + 1]).toBeLessThan(errores[i]);

      const razonCuadratica =
        errores[i + 1] / (errores[i] ** 2);

      expect(razonCuadratica).toBeGreaterThan(0.2);
      expect(razonCuadratica).toBeLessThan(0.5);
    }
  });

  test('el error relativo disminuye durante la convergencia real', () => {
    const resultado = newtonRaphson({
      f,
      df,
      x0: 1,
      tolerancia: 1e-12,
      maxIter: 20,
    });

    const erroresRelativos = resultado.iteraciones.map(
      (iteracion) =>
        Math.abs(iteracion.x - Math.SQRT2) / Math.SQRT2
    );

    expect(resultado.convergio).toBe(true);
    expect(erroresRelativos.length).toBeGreaterThan(2);

    for (let i = 1; i < erroresRelativos.length; i++) {
      expect(erroresRelativos[i]).toBeLessThan(erroresRelativos[i - 1]);
    }
  });

  test.each([1, 3])(
    'Newton-Raphson informa no convergencia con maxIter=%p',
    (maxIter) => {
      const tolerancia = 1e-12;

      const resultado = newtonRaphson({
        f,
        df,
        x0: 1000,
        tolerancia,
        maxIter,
      });

      expect(resultado.convergio).toBe(false);
      expect(resultado.iteraciones).toHaveLength(maxIter);
      expect(resultado.mensaje).toBe(
        'Se alcanzó el máximo de iteraciones sin converger.'
      );

      const ultima =
        resultado.iteraciones[resultado.iteraciones.length - 1];

      expect(ultima.error).toBeGreaterThan(tolerancia);
    }
  );

  test('Newton-Raphson detecta divergencia y lanza ErrorDivergencia', () => {
    const ejecutar = () =>
      newtonRaphson({
        f,
        df,
        x0: 1e200,
        tolerancia: 1e-12,
        maxIter: 10,
      });

    expect(ejecutar).toThrow(ErrorDivergencia);
    expect(ejecutar).toThrow(/divergencia numérica detectada/);
  });
});
