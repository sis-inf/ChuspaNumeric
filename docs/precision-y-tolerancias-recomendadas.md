# Precisión y tolerancias recomendadas

## Introducción

Todos los métodos iterativos de ChuspaNumeric exponen un parámetro `tolerancia`
configurable que controla cuándo el método considera que ha convergido.
Sin embargo, elegir un valor adecuado depende del contexto: un cálculo
educativo de verificación rápida y un cálculo de ingeniería con
implicaciones de seguridad tienen necesidades de precisión muy distintas.

Este documento proporciona recomendaciones prácticas para elegir
`tolerancia` y `maxIter` según el tipo de aplicación.

---

## Tabla de tolerancias recomendadas por contexto

| Contexto | Tolerancia recomendada | `maxIter` recomendado | Justificación |
|----------|----------------------|----------------------|---------------|
| Verificación rápida / exploración | `1e-3` | 50 | Suficiente para confirmar que el método converge y el resultado es plausible. |
| Fines educativos (trabajos, tareas) | `1e-4` a `1e-6` | 100 | Muestra claramente la convergencia en la tabla de iteraciones sin exceso de pasos. |
| Ingeniería general | `1e-8` a `1e-10` | 200 | Apropiado para cálculos estructurales, eléctricos y térmicos de rutina. |
| Cálculo de alta precisión | `1e-12` a `1e-14` | 500 | Cerca del límite del tipo `Number` de JavaScript (~15-17 dígitos significativos). |
| Máxima precisión posible | `Number.EPSILON` ≈ `2.2e-16` | 1000 | Límite teórico del tipo `Number`. Pedir más precisión que esta es imposible en JavaScript. |

> **Importante:** pedir una tolerancia menor que `Number.EPSILON`
> (`≈ 2.2e-16`) es inútil — JavaScript no puede representar diferencias
> menores que esta cantidad con números de punto flotante de 64 bits.
> En la práctica, `1e-12` suele ser el límite razonable antes de
> encontrar problemas de redondeo.

---

## Relación entre tolerancia, maxIter y ErrorConvergencia

### El riesgo de combinar tolerancia estricta con maxIter bajo

Si pides una tolerancia muy estricta pero limitas demasiado el número
de iteraciones, el método puede no alcanzar la precisión pedida antes
de agotar los intentos. En ese caso, ChuspaNumeric devuelve el resultado con
`convergio: false` y el mensaje indica que se alcanzó `maxIter`.

**Ejemplo problemático:**
```js
// Tolerancia muy estricta + maxIter muy bajo = probable no convergencia
const resultado = biseccion({
    f: x => x**3 - 2*x - 5,
    a: 0,
    b: 3,
    tolerancia: 1e-12,  // muy estricta
    maxIter: 10          // muy poco — bisección necesita ~40 iter para 1e-12
});

console.log(resultado.convergio); // false — no alcanzó la tolerancia
```

**Versión correcta:**
```js
// Para tolerancia 1e-12, bisección necesita ≈ log2(3/1e-12) ≈ 42 iteraciones
const resultado = biseccion({
    f: x => x**3 - 2*x - 5,
    a: 0,
    b: 3,
    tolerancia: 1e-12,
    maxIter: 100  // suficiente margen
});

console.log(resultado.convergio); // true
```

---

## Estimación del número de iteraciones necesarias

### Bisección

Bisección necesita exactamente `⌈log₂((b-a)/tolerancia)⌉` iteraciones
para alcanzar la tolerancia pedida. Puedes estimarlo con:

```js
const iteracionesNecesarias = Math.ceil(
    Math.log2((b - a) / tolerancia)
);
```

**Ejemplos:**

| Intervalo | Tolerancia | Iteraciones necesarias |
|-----------|-----------|----------------------|
| [0, 3] | 1e-4 | 15 |
| [0, 3] | 1e-6 | 22 |
| [0, 3] | 1e-10 | 35 |
| [0, 3] | 1e-12 | 42 |

### Newton-Raphson y métodos de convergencia cuadrática

Para métodos con convergencia cuadrática (Newton-Raphson), el número
de iteraciones necesarias crece mucho más lentamente con la tolerancia:

| Tolerancia | Iteraciones típicas |
|-----------|-------------------|
| 1e-6 | 4-6 |
| 1e-10 | 5-7 |
| 1e-14 | 6-8 |

Con `maxIter: 50` es más que suficiente para Newton-Raphson en
prácticamente cualquier caso de uso real.

### Métodos iterativos lineales (Jacobi, Gauss-Seidel)

La convergencia depende fuertemente de las propiedades de la matriz.
Para sistemas bien condicionados y diagonalmente dominantes:

| Tolerancia | `maxIter` recomendado |
|-----------|----------------------|
| 1e-4 | 50 |
| 1e-8 | 200 |
| 1e-12 | 500 |

Para sistemas mal condicionados, puede ser necesario aumentar
`maxIter` significativamente o cambiar a un método directo (Gauss).

---

## Cómo detectar que la tolerancia es demasiado estricta

Después de ejecutar cualquier método, verifica siempre:

```js
const resultado = newtonRaphson({ f, df, x0, tolerancia, maxIter });

if (!resultado.convergio) {
    console.warn(
        `El método no convergió en ${maxIter} iteraciones. ` +
        `Error final: ${resultado.iteraciones.at(-1)?.error}. ` +
        `Considera aumentar maxIter o relajar la tolerancia.`
    );
}
```

Si el error final (`resultado.iteraciones.at(-1).error`) es mucho
menor que la tolerancia pedida pero `convergio` es `false`, el
problema es `maxIter` insuficiente. Si el error final es grande
y no disminuye entre iteraciones, el problema es el método o los
parámetros de entrada (ver `docs/limitaciones-numericas.md`).

---

## Recomendaciones por método

| Método | Tolerancia por defecto | Tolerancia educativa | Tolerancia ingeniería |
|--------|----------------------|---------------------|----------------------|
| `biseccion` | `1e-6` | `1e-4` a `1e-6` | `1e-10` |
| `newtonRaphson` | `1e-6` | `1e-6` | `1e-12` |
| `secante` | `1e-6` | `1e-6` | `1e-12` |
| `puntoFijo` | `1e-6` | `1e-6` | `1e-10` |
| `jacobi` | `1e-6` | `1e-4` | `1e-8` |
| `gaussSeidel` | `1e-6` | `1e-4` | `1e-8` |
| `euler` (EDO, paso h) | `h=0.1` | `h=0.1` | `h=0.01` |
| `rungeKutta4` (EDO, paso h) | `h=0.1` | `h=0.1` | `h=0.001` |

> **Nota:** para los métodos de EDO, el parámetro de precisión es el
> paso `h`, no una tolerancia en sentido estricto. Reducir `h` a la
> mitad reduce el error en un factor de `2^orden` (16x para RK4).

---

## Referencias

* `docs/limitaciones-numericas.md` — por qué ciertos métodos no
  convergen incluso con una tolerancia razonable.
* `docs/preguntas-frecuentes-matematicas.md` — qué hacer cuando un
  método iterativo no converge.
* `src/core/contrato.js` — campo `convergio` en el objeto de resultado.