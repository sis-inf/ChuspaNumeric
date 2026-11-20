import { crearResultado } from '../core/contrato.js';
import { ErrorParametros, ErrorDivergencia } from '../core/errores.js';

/**
 * Aproxima la primera derivada mediante
 * diferencias finitas centradas.
 *
 * @param {Function} f - Función a derivar.
 * @param {number} x - Punto de evaluación.
 * @param {number} h - Paso positivo y finito.
 * @returns {Object} Resultado estructurado.
 * @throws {ErrorParametros}
 * @throws {ErrorDivergencia}
 */
export function derivative(f, x, h = 1e-5) {
  if (typeof f !== "function") {
    throw new ErrorParametros(
      "El parámetro 'f' debe ser una función"
    );
  }

  if (!Number.isFinite(x)) {
    throw new ErrorParametros(
      "El parámetro 'x' debe ser un número válido y finito"
    );
  }
 
  if (h <= 0 || !Number.isFinite(h)) {
    throw new ErrorParametros(
      "El parámetro 'h' debe ser un número positivo y finito"
    );
  }
  
  const xAdelante = x + h;
  const xAtras = x - h;
  const denominador = 2 * h;
  
  if (
        !Number.isFinite(xAdelante) ||
        !Number.isFinite(xAtras) ||
        !Number.isFinite(denominador)
    ) {
    throw new ErrorParametros(
      "Los parámetros exceden el rango numérico representable"
    );
  }
  if (
        xAdelante === x ||
        xAtras === x ||
        xAdelante === xAtras
    ) {
    throw new ErrorParametros(
      "El paso h es demasiado pequeño respecto a x"
    );
  }


    const { valor: resultado, tiempo_ms } =
      medirTiempo(() => {
          const fAdelante = f(xAdelante);
          const fAtras = f(xAtras);

          if (
              !Number.isFinite(fAdelante) ||
              !Number.isFinite(fAtras)
          ) {
              throw new ErrorDivergencia(
                  "La función debe devolver valores numéricos finitos"
              );
          }

          const numerador = fAdelante - fAtras;

          if (!Number.isFinite(numerador)) {
              throw new ErrorDivergencia(
                  "Desbordamiento numérico en el numerador"
              );
          }
          const valor = numerador / denominador;
          
          if (!Number.isFinite(valor)) {
              throw new ErrorDivergencia(
                  "El resultado de la derivada no es finito"
              );
          }

          return valor;
       });

    return crearResultado({
      resultado,
      iteraciones: [],
      convergio: true,
      mensaje: "Derivada calculada correctamente",
      meta: {
          metodo: "derivative",
          parametros: { x, h },
          tiempo_ms
        }
    });
}