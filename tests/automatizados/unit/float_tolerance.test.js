describe("Pruebas con tolerancia flotante", () => {

    test("Newton - resultado con tolerancia flotante", () => {
        const actual = 1.4142135623730951; // raíz de 2
        const expected = 1.41421356237;
        expect(actual).toBeCloseTo(expected, 5);
    });

    test("Bisección - resultado con tolerancia flotante", () => {
        const actual = 1.3247179572;
        const expected = 1.32471795724;
        expect(actual).toBeCloseTo(expected, 5);
    });

    test("acepta aproximaciones con diferentes tolerancias", () => {
        const referencia = Math.sqrt(2);
        const aproximacion = 1.41421356237;

        expect(aproximacion).toBeCloseTo(referencia, 5);
        expect(aproximacion).toBeCloseTo(referencia, 10);
    });

    test("distingue tolerancias amplias y estrictas", () => {
        const referencia = Math.sqrt(2);
        const aproximacion = 1.4142;

        expect(aproximacion).toBeCloseTo(referencia, 3);
        expect(aproximacion).not.toBeCloseTo(referencia, 5);
    });

    test("el error absoluto disminuye con pasos h menores en convergencia de orden uno", () => {
        const referencia = 2;
        const pasos = [0.1, 0.01, 0.001];
        const aproximaciones = pasos.map((h) => referencia + h);

        const errores = aproximaciones.map((valor) =>
            Math.abs(valor - referencia)
        );

        expect(errores[1]).toBeLessThan(errores[0]);
        expect(errores[2]).toBeLessThan(errores[1]);

        expect(errores[0] / errores[1]).toBeCloseTo(10, 5);
        expect(errores[1] / errores[2]).toBeCloseTo(10, 5);
    });

    test("la convergencia de orden dos reduce mas rapido el error al disminuir h", () => {
        const referencia = 2;
        const pasos = [0.1, 0.01, 0.001];

        const erroresOrdenUno = pasos.map((h) =>
            Math.abs((referencia + h) - referencia)
        );

        const erroresOrdenDos = pasos.map((h) =>
            Math.abs((referencia + h * h) - referencia)
        );

        expect(erroresOrdenDos[0]).toBeLessThan(erroresOrdenUno[0]);
        expect(erroresOrdenDos[1]).toBeLessThan(erroresOrdenUno[1]);
        expect(erroresOrdenDos[2]).toBeLessThan(erroresOrdenUno[2]);

        expect(erroresOrdenDos[0] / erroresOrdenDos[1]).toBeCloseTo(100, 4);
        expect(erroresOrdenDos[1] / erroresOrdenDos[2]).toBeCloseTo(100, 4);
    });

    test("el error relativo disminuye cuando las aproximaciones convergen", () => {
        const referencia = 2;
        const pasos = [0.1, 0.01, 0.001];

        const erroresRelativos = pasos.map((h) => {
            const aproximacion = referencia + h * h;
            return Math.abs((aproximacion - referencia) / referencia);
        });

        expect(erroresRelativos[1]).toBeLessThan(erroresRelativos[0]);
        expect(erroresRelativos[2]).toBeLessThan(erroresRelativos[1]);

        expect(erroresRelativos[0]).toBeCloseTo(0.005, 8);
        expect(erroresRelativos[1]).toBeCloseTo(0.00005, 8);
        expect(erroresRelativos[2]).toBeCloseTo(0.0000005, 8);
    });

    test("detecta falta de convergencia cuando el error permanece constante", () => {
        const referencia = 2;
        const pasos = [0.1, 0.01, 0.001];

        const errores = pasos.map(() => {
            const aproximacion = referencia + 0.1;
            return Math.abs(aproximacion - referencia);
        });

        expect(errores[1]).toBeCloseTo(errores[0], 10);
        expect(errores[2]).toBeCloseTo(errores[1], 10);
        expect(errores[2]).toBeGreaterThan(0.01);
    });

    test("detecta divergencia cuando el error aumenta al reducir el paso", () => {
        const referencia = 2;
        const pasos = [0.1, 0.01, 0.001];

        const errores = pasos.map((h) => {
            const aproximacion = referencia + 0.01 / h;
            return Math.abs(aproximacion - referencia);
        });

        expect(errores[1]).toBeGreaterThan(errores[0]);
        expect(errores[2]).toBeGreaterThan(errores[1]);
    });

});
