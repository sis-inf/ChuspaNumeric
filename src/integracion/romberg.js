import { crearResultado, medirTiempo } from "../core/contrato.js";
import {
  validarFuncion,
  validarIntervalo,
  validarTolerancia,
  validarIteraciones
} from "../utils/validaciones.js";

function romberg({
  f,
  a,
  b,
  nMax = 10,
  tolerancia = 1e-8
}) {
  validarFuncion(f, "f");
  validarIntervalo(a, b);
  validarIteraciones(nMax);
  validarTolerancia(tolerancia);

  const { valor, tiempo_ms } = medirTiempo(() => {

    const tabla = [];

    let h = b - a;
    tabla[0] = [];
    tabla[0][0] = (h / 2) * (f(a) + f(b));

    for (let i = 1; i < nMax; i++) {

      h /= 2;

      let suma = 0;

      const puntosNuevos = 2 ** (i - 1);

      for (let k = 1; k <= puntosNuevos; k++) {
        suma += f(a + (2 * k - 1) * h);
      }

      tabla[i] = [];

      tabla[i][0] = 0.5 * tabla[i - 1][0] + h * suma;

      for (let j = 1; j <= i; j++) {
        tabla[i][j] =
          tabla[i][j - 1] +
          (tabla[i][j - 1] - tabla[i - 1][j - 1]) /
            (4 ** j - 1);
      }

      if (
        Math.abs(tabla[i][i] - tabla[i - 1][i - 1]) <
        tolerancia
      ) {
        return {
          resultado: tabla[i][i],
          tabla,
          filas: tabla.length,
          convergio: true
        };
      }
    }

    return {
      resultado: tabla[nMax - 1][nMax - 1],
      tabla,
      filas: tabla.length,
      convergio: false
    };
  });

  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.tabla,
    convergio: valor.convergio,
    mensaje: valor.convergio
      ? `Integración mediante Romberg completada: convergió en ${valor.filas} filas (tolerancia ${tolerancia}).`
      : `Integración mediante Romberg completada: no alcanzó la tolerancia ${tolerancia} tras ${valor.filas} filas (nMax = ${nMax}).`,
    meta: {
      metodo: "romberg",
      parametros: {
        a,
        b,
        nMax,
        tolerancia
      },
      tiempo_ms
    }
  });
}

export { romberg };
