
import { memoizarFuncion } from '../../../src/utils/memoizar.js';
import { ErrorParametros } from '../../../src/core/errores.js';

describe('memoizarFuncion', () => {
  test('ejecuta la funcion una sola vez para el mismo valor', () => {
    let llamadas = 0;
    const funcion = (x) => {
      llamadas++;
      return x * 2;
    };

    const memoizada = memoizarFuncion(funcion);

    expect(memoizada(5)).toBe(10);
    expect(memoizada(5)).toBe(10);
    expect(llamadas).toBe(1);
  });

  test('muestra las estadisticas de dos valores diferentes', () => {
    const memoizada = memoizarFuncion((x) => x * x);

    memoizada(2);
    memoizada(3);

    expect(memoizada.estadisticas()).toEqual({
      entradas: 2,
      evaluacionesReales: 2,
    });
  });

  test('limpiarCache vacia la cache y permite volver a evaluar', () => {
    let llamadas = 0;
    const memoizada = memoizarFuncion((x) => {
      llamadas++;
      return x + 1;
    });

    memoizada(4);
    expect(llamadas).toBe(1);

    memoizada.limpiarCache();
    expect(memoizada.estadisticas().entradas).toBe(0);

    expect(memoizada(4)).toBe(5);
    expect(llamadas).toBe(2);
  });

  test('lanza ErrorParametros si recibe algo que no es una funcion', () => {
    expect(() => memoizarFuncion(123)).toThrow(ErrorParametros);
  });

  test('devuelve el mismo resultado que la funcion original', () => {
    const funcion = (x) => x * 3;
    const memoizada = memoizarFuncion(funcion);

    expect(memoizada(7)).toBe(funcion(7));
  });
});
