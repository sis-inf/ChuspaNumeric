# Manejo avanzado de errores

## Introducción

ChuspaNumeric incorpora un sistema extendido para el manejo de errores y advertencias durante la ejecución de métodos numéricos. Además de los errores generales descritos en `docs/manejo-errores.md`, la biblioteca dispone de mecanismos específicos para detectar divergencias numéricas, limitar el tiempo de ejecución de métodos iterativos y reportar advertencias que no impiden obtener un resultado.

Este documento complementa la guía general de manejo de errores y describe el uso de `ErrorDivergencia`, `ErrorTimeout` y del sistema de *warnings* no bloqueantes.

> **Nota:** Para una introducción al manejo general de errores de la biblioteca consulte `docs/manejo-errores.md`.

---

# ErrorDivergencia

## ¿Qué es?

`ErrorDivergencia` es un error que indica que un método iterativo produjo valores no numéricos (`NaN`) o infinitos (`Infinity`) durante su ejecución.

Cuando esto ocurre, el método no puede continuar porque el cálculo ha perdido estabilidad numérica.

## ¿Cuándo ocurre?

Este error puede producirse cuando:

- Una iteración genera un valor `NaN`.
- Una iteración produce `Infinity`.
- Los parámetros iniciales hacen que el método diverja.
- La función evaluada deja de producir valores numéricos válidos.

## Diferencia con ErrorConvergencia

Aunque ambos errores están relacionados con métodos iterativos, representan situaciones distintas.

| Error | Significado |
|-------|-------------|
| `ErrorConvergencia` | El método alcanzó el número máximo de iteraciones sin cumplir la tolerancia solicitada. |
| `ErrorDivergencia` | El método produjo valores `NaN` o `Infinity`, indicando una divergencia numérica durante la ejecución. |

En otras palabras, un método puede no converger sin divergir. La divergencia representa una condición más severa porque el cálculo deja de producir valores numéricos válidos.

---

# ErrorTimeout

## ¿Qué es?

`ErrorTimeout` indica que un método iterativo superó el tiempo máximo de ejecución configurado.

En lugar de continuar ejecutándose indefinidamente, el método interrumpe su ejecución y lanza esta excepción.

## ¿Cuándo ocurre?

Puede ocurrir cuando:

- El método requiere demasiado tiempo para converger.
- Se configura un tiempo máximo de ejecución demasiado pequeño.
- El problema requiere muchas iteraciones para resolverse.

## Documentación relacionada

El uso del parámetro `timeoutMs` y ejemplos adicionales se encuentran documentados en `docs/memoizacion-y-timeout.md`.

---

# Warnings no bloqueantes

## ¿Qué son?

Los *warnings* son advertencias que informan situaciones potencialmente problemáticas sin detener la ejecución del método.

A diferencia de una excepción, un *warning* no interrumpe el cálculo ni impide obtener un resultado.

Cuando existen advertencias, estas se incluyen dentro de la propiedad `warnings` del objeto retornado.

Las advertencias forman parte del objeto de resultado devuelto por los métodos y solo se incluyen cuando existe al menos una advertencia que informar.
## ¿Cuándo aparecen?

Un ejemplo implementado actualmente ocurre durante la eliminación gaussiana.

Si se detecta un pivote demasiado pequeño respecto a la escala de la matriz, el método informa una advertencia de posible inestabilidad numérica.

En este caso:

- el algoritmo continúa ejecutándose;
- calcula la solución;
- devuelve el resultado normalmente;
- agrega la advertencia en el arreglo `warnings`.

Esto permite que la aplicación decida cómo tratar estas situaciones sin detener el cálculo.

---

# Ejemplo de uso
### Revisar advertencias (*warnings*)

Los *warnings* no detienen la ejecución del método. Cuando existen, se incluyen en la propiedad `warnings` del objeto de resultado.

```javascript
import { gauss } from "ChuspaNumeric";

const resultado = gauss({
  A: [
    [1e-12, 1],
    [1, 2]
  ],
  b: [1, 3]
});

console.log(resultado.resultado);

if (resultado.warnings) {
  console.log("Advertencias:");

  for (const warning of resultado.warnings) {
    console.log("-", warning);
  }
}
```

En este ejemplo, el método puede devolver una solución válida junto con advertencias sobre una posible inestabilidad numérica, permitiendo que la aplicación decida cómo tratarlas.


### Capturar errores avanzados

Los métodos que implementan `ErrorTimeout` o `ErrorDivergencia` deben ejecutarse dentro de un bloque `try/catch` para manejar estas situaciones de forma controlada.

```javascript
import {
  biseccion,
  ErrorTimeout,
  ErrorDivergencia
} from "ChuspaNumeric";

try {

  const resultado = biseccion({
    f: x => Math.cos(x) - x,
    a: 0,
    b: 1,
    tolerancia: 1e-10,
    maxIter: 10000,
    timeoutMs: 500
  });

  console.log(resultado.resultado);

} catch (error) {

  if (error instanceof ErrorTimeout) {
    console.error("El cálculo superó el tiempo máximo permitido.");

  } else if (error instanceof ErrorDivergencia) {
    console.error("El método produjo una divergencia numérica.");

  } else {
    console.error(error.message);
  }

}
```

Este patrón permite distinguir entre un tiempo de ejecución excesivo, una divergencia numérica y cualquier otra excepción que pueda producirse durante la ejecución del método.
---

# Buenas prácticas

- Utilizar bloques `try/catch` para controlar las excepciones.
- Revisar siempre el contenido de `warnings` antes de utilizar el resultado obtenido.
- Diferenciar entre una falta de convergencia y una divergencia numérica.
- Configurar tiempos de ejecución adecuados para métodos iterativos cuando sea necesario.
- Consultar `docs/manejo-errores.md` para conocer el manejo general de errores de la biblioteca.
- Consultar `docs/memoizacion-y-timeout.md` para más información sobre el uso de `timeoutMs`.

---

# Resumen

El sistema avanzado de manejo de errores de ChuspaNumeric incorpora mecanismos para informar distintos tipos de situaciones durante la ejecución de métodos numéricos:

- `ErrorDivergencia` detecta cuando un método produce valores no numéricos.
- `ErrorTimeout` evita ejecuciones excesivamente largas.
- Los *warnings* permiten informar posibles problemas sin interrumpir el cálculo.

Estos mecanismos ayudan a desarrollar aplicaciones más robustas al distinguir claramente entre errores que deben detener la ejecución y advertencias que pueden ser tratadas por la aplicación.