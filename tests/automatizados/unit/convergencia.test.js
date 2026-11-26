import {
    checkConvergence,
    ConvergenceHistory
} from '../../../src/utils/convergence.js';

// ---------------------------------------------------------------
// Helpers: cada test arma sus propios datos (sin estado compartido)
// ---------------------------------------------------------------
// Newton para f(x) = x^2 - 2  ->  x - f/f' = x - (x^2 - 2) / (2x)
const pasoNewton = (x) => x - (x * x - 2) / (2 * x);
// Punto fijo x = cos(x) (convergencia lineal, razon ~0.67)
const pasoPuntoFijo = (x) => Math.cos(x);
const PUNTO_FIJO = 0.7390851332151607;

// Itera usando checkConvergence como criterio de parada
const iterar = (paso, x0, tol, maxIter = 200) => {
    let x = x0;
    const pasos = [];
    for (let n = 1; n <= maxIter; n++) {
        const xNuevo = paso(x);
        const r = checkConvergence(xNuevo, x, tol);
        pasos.push(r.lastDiff);
        x = xNuevo;
        if (r.converged) {
            return { n, x, pasos, convergio: true };
        }
    }
    return { n: maxIter, x, pasos, convergio: false };
};

// ---------------------------------------------------------------
// Tests originales (se conservan)
// ---------------------------------------------------------------
describe('checkConvergence', () => {
    test('retorna converged=true cuando xNew - xOld < tol', () => {
        const result = checkConvergence(1.001, 1.0, 0.01);
        expect(result.converged).toBe(true);
        expect(result.lastDiff).toBeCloseTo(0.001, 4);
    });

    test('retorna converged=false cuando xNew - xOld >= tol', () => {
        const result = checkConvergence(1.02, 1.0, 0.01);
        expect(result.converged).toBe(false);
        expect(result.lastDiff).toBeCloseTo(0.02, 4);
    });
});

describe('ConvergenceHistory', () => {
    test('almacena historial de valores', () => {
        const history = new ConvergenceHistory();
        history.addValue(1.0);
        history.addValue(1.5);
        history.addValue(1.8);

        expect(history.getLastValue()).toBe(1.8);
    });

    test('checkLastTwo verifica convergencia', () => {
        const history = new ConvergenceHistory();
        history.addValue(1.0);
        history.addValue(1.001);

        const result = history.checkLastTwo(0.01);
        expect(result.converged).toBe(true);
        expect(result.lastDiff).toBeCloseTo(0.001, 4);
    });

    test('reset limpia el historial', () => {
        const history = new ConvergenceHistory();
        history.addValue(1.0);
        history.addValue(1.5);
        history.reset();
        expect(history.getLastValue()).toBeUndefined();
    });
});

// ---------------------------------------------------------------
// checkConvergence: tolerancia y tamano de paso
// ---------------------------------------------------------------
describe('checkConvergence - tolerancias y tamanos de paso', () => {
    test('el criterio es estricto: diferencia == tol NO converge', () => {
        // |3 - 2| = 1 y tol = 1 -> 1 < 1 es false
        const r = checkConvergence(3, 2, 1);
        expect(r.lastDiff).toBe(1);
        expect(r.converged).toBe(false);
    });

    test('una tolerancia apenas mayor al paso si converge', () => {
        // |1.375 - 1.25| = 0.125 (exacto en binario)
        expect(checkConvergence(1.375, 1.25, 0.125).converged).toBe(false);
        expect(checkConvergence(1.375, 1.25, 0.126).converged).toBe(true);
    });

    test.each([
        [1e-2, 0.005, true],
        [1e-2, 0.05, false],
        [1e-4, 5e-5, true],
        [1e-4, 5e-4, false],
        [1e-8, 5e-9, true],
        [1e-8, 5e-8, false],
        [1e-12, 5e-13, true],
        [1e-12, 5e-12, false]
    ])('tol=%p, paso=%p -> converged=%p', (tol, paso, esperado) => {
        const r = checkConvergence(1 + paso, 1, tol);
        expect(r.converged).toBe(esperado);
        expect(r.lastDiff).toBeCloseTo(paso, 15);
    });

    test('la diferencia es un valor absoluto: simetrica y no negativa', () => {
        const a = checkConvergence(2, 5, 10);
        const b = checkConvergence(5, 2, 10);
        expect(a.lastDiff).toBe(3);
        expect(b.lastDiff).toBe(3);
        expect(a.converged).toBe(true);
        expect(b.converged).toBe(true);
    });

    test('funciona con valores negativos y cruces por cero', () => {
        expect(checkConvergence(-1, -1.5, 1).lastDiff).toBe(0.5);
        expect(checkConvergence(0.25, -0.25, 1).lastDiff).toBe(0.5);
        expect(checkConvergence(0.25, -0.25, 1).converged).toBe(true);
    });

    test('valores iguales dan lastDiff=0 y convergen con tol > 0', () => {
        const r = checkConvergence(1.4142135623, 1.4142135623, 1e-12);
        expect(r.lastDiff).toBe(0);
        expect(r.converged).toBe(true);
    });

    test('la diferencia es absoluta (no relativa)', () => {
        // Con magnitudes grandes el mismo paso absoluto sigue siendo 0.5
        const r = checkConvergence(1e6 + 0.5, 1e6, 1);
        expect(r.lastDiff).toBeCloseTo(0.5, 6);
        expect(r.converged).toBe(true);
    });

    test('tol = 0 o negativa nunca converge, ni con valores iguales', () => {
        expect(checkConvergence(1, 1, 0).converged).toBe(false);
        expect(checkConvergence(1, 1, -1e-3).converged).toBe(false);
        expect(checkConvergence(1, 2, 0).converged).toBe(false);
    });

    test('siempre retorna un objeto con converged (boolean) y lastDiff (number)', () => {
        const r = checkConvergence(1.2, 1.0, 0.5);
        expect(typeof r.converged).toBe('boolean');
        expect(typeof r.lastDiff).toBe('number');
        expect(Object.keys(r).sort()).toEqual(['converged', 'lastDiff']);
    });
});

// ---------------------------------------------------------------
// Precision segun tolerancia (Newton, convergencia cuadratica)
// ---------------------------------------------------------------
describe('checkConvergence - precision y criterio de parada (Newton sqrt(2))', () => {
    // Pasos verificados con script: |x_n - x_{n-1}| desde x0 = 1
    //   0.5, 0.0833..., 2.45e-3, 2.12e-6, 1.59e-12, 2.2e-16
    test.each([
        [1e-2, 3],
        [1e-4, 4],
        [1e-6, 5],
        [1e-8, 5],
        [1e-10, 5]
    ])('tol=%p -> se detiene en la iteracion %p', (tol, iterEsperadas) => {
        const r = iterar(pasoNewton, 1, tol);
        expect(r.convergio).toBe(true);
        expect(r.n).toBe(iterEsperadas);
    });

    test.each([1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12])(
        'tol=%p: ultimo paso < tol, paso previo >= tol y error relativo <= 10*tol',
        (tol) => {
            const r = iterar(pasoNewton, 1, tol);
            expect(r.convergio).toBe(true);
            // ultimo paso por debajo de la tolerancia
            expect(r.pasos[r.pasos.length - 1]).toBeLessThan(tol);
            // se paro en la primera iteracion que cumple (el paso previo no cumplia)
            if (r.pasos.length > 1) {
                expect(r.pasos[r.pasos.length - 2]).toBeGreaterThanOrEqual(tol);
            }
            // error relativo respecto a la solucion exacta
            const errRel = Math.abs(r.x - Math.SQRT2) / Math.SQRT2;
            expect(errRel).toBeLessThanOrEqual(10 * tol);
        }
    );

    test('tol=1e-12 requiere al menos 5 iteraciones y converge', () => {
        const r = iterar(pasoNewton, 1, 1e-12);
        expect(r.convergio).toBe(true);
        expect(r.n).toBeGreaterThanOrEqual(5);
        expect(r.n).toBeLessThanOrEqual(7);
    });

    test('las iteraciones no decrecen al endurecer la tolerancia', () => {
        const tols = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10, 1e-12];
        const iters = tols.map((t) => iterar(pasoNewton, 1, t).n);
        for (let i = 1; i < iters.length; i++) {
            expect(iters[i]).toBeGreaterThanOrEqual(iters[i - 1]);
        }
        // y una tolerancia mucho mas estricta necesita estrictamente mas
        expect(iters[iters.length - 1]).toBeGreaterThan(iters[0]);
    });

    test('valor inicial exacto: converge en la primera iteracion', () => {
        const r = iterar(pasoNewton, Math.SQRT2, 1e-12);
        expect(r.convergio).toBe(true);
        expect(r.n).toBe(1);
        expect(r.pasos[0]).toBeLessThan(1e-12);
    });

    test('valor inicial lejano necesita mas iteraciones que uno cercano', () => {
        const cerca = iterar(pasoNewton, 1, 1e-10);
        const lejos = iterar(pasoNewton, 100, 1e-10);
        expect(lejos.convergio).toBe(true);
        expect(lejos.n).toBe(11);
        expect(lejos.n).toBeGreaterThan(cerca.n);
        expect(Math.abs(lejos.x - Math.SQRT2)).toBeLessThan(1e-9);
    });
});

// ---------------------------------------------------------------
// Orden de convergencia
// ---------------------------------------------------------------
describe('checkConvergence - orden de convergencia', () => {
    test('Newton (cuadratica): e_{n+1} / e_n^2 queda acotado (~1/(2*sqrt2) = 0.354)', () => {
        // Errores reales: e1 = 8.6e-2, e2 = 2.45e-3, e3 = 2.12e-6
        const errores = [];
        let x = 1;
        for (let i = 0; i < 3; i++) {
            x = pasoNewton(x);
            errores.push(Math.abs(x - Math.SQRT2));
        }
        const c1 = errores[1] / errores[0] ** 2;
        const c2 = errores[2] / errores[1] ** 2;
        expect(c1).toBeGreaterThan(0.2);
        expect(c1).toBeLessThan(0.5);
        expect(c2).toBeGreaterThan(0.2);
        expect(c2).toBeLessThan(0.5);
    });

    test('Newton: los pasos decrecen cada vez mas rapido (supralineal)', () => {
        const r = iterar(pasoNewton, 1, 1e-12);
        // cociente d_{n+1}/d_n se hace cada vez mas pequeno
        const cocientes = [];
        for (let i = 1; i < 4; i++) {
            cocientes.push(r.pasos[i] / r.pasos[i - 1]);
        }
        expect(cocientes[1]).toBeLessThan(cocientes[0]);
        expect(cocientes[2]).toBeLessThan(cocientes[1]);
    });

    test('punto fijo cos(x) (lineal): razon de pasos casi constante ~0.67', () => {
        const r = iterar(pasoPuntoFijo, 1, 1e-6);
        expect(r.convergio).toBe(true);
        for (let i = 1; i < r.pasos.length; i++) {
            const razon = r.pasos[i] / r.pasos[i - 1];
            expect(razon).toBeGreaterThan(0.5);
            expect(razon).toBeLessThan(0.8);
        }
    });

    test('punto fijo cos(x): los pasos decrecen monotonamente', () => {
        const r = iterar(pasoPuntoFijo, 1, 1e-8);
        for (let i = 1; i < r.pasos.length; i++) {
            expect(r.pasos[i]).toBeLessThan(r.pasos[i - 1]);
        }
    });

    test('punto fijo cos(x): iteraciones estrictamente crecientes con la tolerancia', () => {
        const tols = [1e-2, 1e-4, 1e-6, 1e-8, 1e-10];
        const iters = tols.map((t) => iterar(pasoPuntoFijo, 1, t).n);
        for (let i = 1; i < iters.length; i++) {
            expect(iters[i]).toBeGreaterThan(iters[i - 1]);
        }
    });

    test.each([1e-2, 1e-4, 1e-6, 1e-8, 1e-10])(
        'punto fijo cos(x), tol=%p: ultimo paso < tol y error relativo <= 10*tol',
        (tol) => {
            const r = iterar(pasoPuntoFijo, 1, tol);
            expect(r.convergio).toBe(true);
            expect(r.pasos[r.pasos.length - 1]).toBeLessThan(tol);
            const errRel = Math.abs(r.x - PUNTO_FIJO) / PUNTO_FIJO;
            expect(errRel).toBeLessThanOrEqual(10 * tol);
        }
    );

    test('Newton converge en muchas menos iteraciones que el punto fijo (misma tol)', () => {
        const newton = iterar(pasoNewton, 1, 1e-10);
        const fijo = iterar(pasoPuntoFijo, 1, 1e-10);
        expect(newton.n).toBeLessThan(fijo.n);
        expect(fijo.n / newton.n).toBeGreaterThan(5);
    });

    test('biseccion: los pasos entre puntos medios se reducen a la mitad', () => {
        // [1, 2] para x^2 - 2 -> puntos medios: 1.5, 1.25, 1.375, 1.4375, 1.40625, 1.421875
        const medios = [1.5, 1.25, 1.375, 1.4375, 1.40625, 1.421875];
        const pasos = [];
        for (let i = 1; i < medios.length; i++) {
            pasos.push(checkConvergence(medios[i], medios[i - 1], 1).lastDiff);
        }
        expect(pasos).toEqual([0.25, 0.125, 0.0625, 0.03125, 0.015625]);
        for (let i = 1; i < pasos.length; i++) {
            expect(pasos[i] / pasos[i - 1]).toBe(0.5);
        }
    });

    test('biseccion: con tol=0.05 la parada ocurre en el cuarto paso', () => {
        const medios = [1.5, 1.25, 1.375, 1.4375, 1.40625, 1.421875];
        let parada = null;
        for (let i = 1; i < medios.length; i++) {
            if (checkConvergence(medios[i], medios[i - 1], 0.05).converged) {
                parada = i;
                break;
            }
        }
        // pasos: 0.25, 0.125, 0.0625, 0.03125 -> el primero < 0.05 es el cuarto
        expect(parada).toBe(4);
    });
});

// ---------------------------------------------------------------
// No convergencia y divergencia
// ---------------------------------------------------------------
describe('checkConvergence - no convergencia y divergencia', () => {
    test('divergencia x -> 2x: nunca converge y el paso crece', () => {
        // pasos: 1, 2, 4, 8, ..., 512
        const r = iterar((x) => 2 * x, 1, 1e-6, 10);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(10);
        expect(r.pasos).toEqual([1, 2, 4, 8, 16, 32, 64, 128, 256, 512]);
        for (let i = 1; i < r.pasos.length; i++) {
            expect(r.pasos[i]).toBeGreaterThan(r.pasos[i - 1]);
        }
    });

    test('oscilacion x -> -x: paso constante 2, nunca converge', () => {
        const r = iterar((x) => -x, 1, 1e-6, 20);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(20);
        expect(r.pasos.every((p) => p === 2)).toBe(true);
    });

    test('Newton con x0 en el punto estacionario: x -> infinito/NaN no converge', () => {
        // f(x) = x^3 - 2x + 2 desde x0 = 0 oscila 0 <-> 1: ciclo de pasos 1
        const paso = (x) => x - (x ** 3 - 2 * x + 2) / (3 * x ** 2 - 2);
        const r = iterar(paso, 0, 1e-6, 30);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(30);
        expect(r.pasos.every((p) => p === 1)).toBe(true);
    });

    test('agotar maxIter: convergio=false, n === maxIter y ultimo paso >= tol', () => {
        // cos(x) con tol=1e-10 necesita ~58 iteraciones; con 10 no alcanza
        const r = iterar(pasoPuntoFijo, 1, 1e-10, 10);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(10);
        expect(r.pasos).toHaveLength(10);
        expect(r.pasos[9]).toBeGreaterThanOrEqual(1e-10);
    });

     test('punto fijo cos(x) con tol=1e-2 necesita 11 iteraciones: con maxIter=10 no alcanza, con 11 si', () => {
        const corto = iterar(pasoPuntoFijo, 1, 1e-2, 10);
        expect(corto.convergio).toBe(false);
        expect(corto.n).toBe(10);

        const justo = iterar(pasoPuntoFijo, 1, 1e-2, 11);
        expect(justo.convergio).toBe(true);
        expect(justo.n).toBe(11);
    });

    test('tolerancia inalcanzable (tol=0): nunca converge aunque x este en el punto fijo', () => {
        const r = iterar(pasoNewton, 1, 0, 50);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(50);
        // el metodo se estanca en el limite de precision de maquina
        expect(r.pasos[49]).toBeLessThan(1e-15);
    });

    test('tolerancia por debajo de la precision de maquina en una secuencia constante', () => {
        // paso identidad: diff = 0, 0 < 0 es false
        const r = iterar((x) => x, 3, 0, 5);
        expect(r.convergio).toBe(false);
        expect(r.pasos).toEqual([0, 0, 0, 0, 0]);
    });
});

// ---------------------------------------------------------------
// ConvergenceHistory: casos adicionales
// ---------------------------------------------------------------
describe('ConvergenceHistory - ventana y casos borde', () => {
    test('historial vacio: getLastValue undefined y checkLastTwo sin convergencia', () => {
        const history = new ConvergenceHistory();
        expect(history.getLastValue()).toBeUndefined();
        expect(history.checkLastTwo(0.01)).toEqual({
            converged: false,
            lastDiff: null
        });
    });

    test('con un solo valor no hay convergencia ni diferencia', () => {
        const history = new ConvergenceHistory();
        history.addValue(1.0);
        expect(history.getLastValue()).toBe(1.0);
        expect(history.checkLastTwo(100)).toEqual({
            converged: false,
            lastDiff: null
        });
    });

    test('mantiene como maximo los ultimos 2 valores', () => {
        const history = new ConvergenceHistory();
        [1, 2, 3, 4, 5].forEach((v) => history.addValue(v));
        expect(history.values).toEqual([4, 5]);
        expect(history.getLastValue()).toBe(5);
    });

    test('checkLastTwo usa solo los 2 ultimos valores (ignora los anteriores)', () => {
        const history = new ConvergenceHistory();
        history.addValue(0);
        history.addValue(100);
        history.addValue(100.001);
        const r = history.checkLastTwo(0.01);
        expect(r.converged).toBe(true);
        expect(r.lastDiff).toBeCloseTo(0.001, 6);
    });

    test('criterio estricto tambien en el historial: diferencia == tol no converge', () => {
        const history = new ConvergenceHistory();
        history.addValue(2);
        history.addValue(3);
        const r = history.checkLastTwo(1);
        expect(r.lastDiff).toBe(1);
        expect(r.converged).toBe(false);
    });

    test('checkLastTwo no modifica el historial', () => {
        const history = new ConvergenceHistory();
        history.addValue(1);
        history.addValue(2);
        history.checkLastTwo(0.5);
        history.checkLastTwo(0.5);
        expect(history.values).toEqual([1, 2]);
    });

    test('reset permite reutilizar el historial desde cero', () => {
        const history = new ConvergenceHistory();
        history.addValue(1);
        history.addValue(1.0001);
        expect(history.checkLastTwo(0.01).converged).toBe(true);

        history.reset();
        expect(history.checkLastTwo(0.01)).toEqual({
            converged: false,
            lastDiff: null
        });

        history.addValue(10);
        history.addValue(20);
        const r = history.checkLastTwo(0.01);
        expect(r.converged).toBe(false);
        expect(r.lastDiff).toBe(10);
    });

    test('dos instancias son independientes', () => {
        const a = new ConvergenceHistory();
        const b = new ConvergenceHistory();
        a.addValue(1);
        a.addValue(2);
        b.addValue(5);
        expect(a.getLastValue()).toBe(2);
        expect(b.getLastValue()).toBe(5);
        expect(b.values).toHaveLength(1);
    });
});

describe('ConvergenceHistory - uso dentro de un metodo iterativo', () => {
    const iterarConHistorial = (paso, x0, tol, maxIter = 200) => {
        const history = new ConvergenceHistory();
        history.addValue(x0);
        let x = x0;
        for (let n = 1; n <= maxIter; n++) {
            x = paso(x);
            history.addValue(x);
            const r = history.checkLastTwo(tol);
            if (r.converged) {
                return { n, x, lastDiff: r.lastDiff, convergio: true };
            }
        }
        return { n: maxIter, x, lastDiff: null, convergio: false };
    };

    test.each([
        [1e-2, 3],
        [1e-4, 4],
        [1e-6, 5],
        [1e-10, 5]
    ])('Newton sqrt(2), tol=%p: parada en la iteracion %p', (tol, esperadas) => {
        const r = iterarConHistorial(pasoNewton, 1, tol);
        expect(r.convergio).toBe(true);
        expect(r.n).toBe(esperadas);
        expect(r.lastDiff).toBeLessThan(tol);
        expect(Math.abs(r.x - Math.SQRT2) / Math.SQRT2).toBeLessThanOrEqual(
            10 * tol
        );
    });

    test('da el mismo resultado que usar checkConvergence directamente', () => {
        const conHistorial = iterarConHistorial(pasoNewton, 1, 1e-8);
        const directo = iterar(pasoNewton, 1, 1e-8);
        expect(conHistorial.n).toBe(directo.n);
        expect(conHistorial.x).toBe(directo.x);
    });

    test('punto fijo cos(x) con tol=1e-6 converge y el error es pequeno', () => {
        const r = iterarConHistorial(pasoPuntoFijo, 1, 1e-6);
        expect(r.convergio).toBe(true);
        expect(Math.abs(r.x - PUNTO_FIJO)).toBeLessThan(1e-5);
    });

    test('divergencia: el historial nunca reporta convergencia y la diferencia crece', () => {
        const history = new ConvergenceHistory();
        history.addValue(1);
        let x = 1;
        let diffAnterior = 0;
        for (let i = 0; i < 10; i++) {
            x = 2 * x;
            history.addValue(x);
            const r = history.checkLastTwo(1e-6);
            expect(r.converged).toBe(false);
            expect(r.lastDiff).toBeGreaterThan(diffAnterior);
            diffAnterior = r.lastDiff;
        }
        expect(history.values).toHaveLength(2);
    });

    test('agotar maxIter con el historial: convergio=false', () => {
        const r = iterarConHistorial(pasoPuntoFijo, 1, 1e-10, 10);
        expect(r.convergio).toBe(false);
        expect(r.n).toBe(10);
    });
});
