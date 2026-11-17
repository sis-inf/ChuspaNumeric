# Preguntas Frecuentes — Dudas Matemáticas

## Introducción

Este documento responde dudas **matemáticas** sobre el uso de los métodos numéricos de ChuspaNumeric: por qué un método no converge, cómo elegir buenos parámetros de entrada, o qué significan ciertos resultados.

> **Diferencia con `preguntas-frecuentes.md`:** ese otro documento está orientado a **contribución de código** (cómo hacer fork, por qué falla mi Pull Request, errores de Git). Este documento, en cambio, está pensado para quien **usa** la librería para resolver problemas matemáticos reales y tiene dudas sobre el comportamiento de los métodos numéricos en sí.

---

## 1. ¿Por qué mi sistema con Jacobi no converge?

El método de Jacobi solo garantiza convergencia si la matriz `A` es **diagonalmente dominante** (o simétrica definida positiva, en algunos casos). Si tu matriz no cumple esta condición, las iteraciones pueden oscilar o divergir en vez de acercarse a la solución.

**Qué hacer:**
* Verifica si reordenando las ecuaciones puedes lograr dominancia diagonal.
* Si no es posible, prueba con un método directo como Gauss o Gauss-Jordan en vez de uno iterativo.

---

## 2. ¿Qué significa que mi matriz no sea diagonalmente dominante?

Una matriz es diagonalmente dominante si, en cada fila, el valor absoluto del elemento de la diagonal es mayor o igual a la suma de los valores absolutos del resto de elementos de esa fila:

```
|a_ii| >= Σ |a_ij|   para todo j ≠ i
```

Si esto no se cumple en al menos una fila, los métodos iterativos como Jacobi o Gauss-Seidel pueden no converger, aunque a veces sí lo hacen en la práctica dependiendo del sistema.

---

## 3. ¿Por qué Gauss-Seidel converge más rápido que Jacobi en mi caso?

Gauss-Seidel usa los valores **ya actualizados** en la misma iteración (en lugar de esperar a la siguiente, como Jacobi). Esto suele acelerar la convergencia en sistemas diagonalmente dominantes, aunque ambos métodos requieren la misma condición teórica para garantizar que converjan.

---

## 4. ¿Qué hago si Newton-Raphson diverge?

Newton-Raphson puede divergir si:

* El valor inicial `x0` está lejos de la raíz real.
* La derivada `f'(x)` es cercana a cero cerca del punto evaluado (tangente casi horizontal).
* La función tiene múltiples raíces o puntos de inflexión cercanos que confunden al método.

**Qué hacer:**
* Grafica la función (mentalmente o con una herramienta) para elegir un `x0` más cercano a la raíz esperada.
* Si la derivada se anula, considera usar el método de la secante o bisección en su lugar.
* Reduce el rango de búsqueda usando primero bisección para acercarte, y luego refina con Newton-Raphson.

---

## 5. ¿Cómo elijo un intervalo inicial válido para bisección?

El método de bisección requiere que `f(a)` y `f(b)` tengan **signos opuestos** (`f(a) * f(b) < 0`). Esto garantiza, por el teorema de Bolzano, que existe al menos una raíz dentro del intervalo `[a, b]`.

**Qué hacer:**
* Evalúa la función en varios puntos para detectar un cambio de signo.
* Si tienes una gráfica aproximada de la función, identifica visualmente dónde cruza el eje X.
* Si el intervalo es muy amplio, divídelo en sub-intervalos más pequeños y prueba cada uno.

---

## 6. ¿Qué significa un número de condición alto en mi sistema?

El número de condición mide cuán sensible es la solución de un sistema `Ax = b` a pequeños errores en los datos de entrada. Un número de condición alto (matriz "mal condicionada") significa que **pequeños errores de redondeo** pueden producir **grandes errores** en la solución final.

**Qué hacer:**
* Ten especial cuidado con tolerancias muy ajustadas en sistemas mal condicionados.
* Considera técnicas de pivoteo parcial (ya usadas internamente por ChuspaNumeric en Gauss) para mejorar la estabilidad numérica.
* Si es posible, reescala las variables del sistema para reducir la disparidad de magnitudes entre filas/columnas.

---

## 7. ¿Por qué mi resultado de Simpson o Trapecio no coincide con el valor exacto de la integral?

Los métodos de integración numérica (Trapecio, Simpson 1/3, Simpson 3/8) son **aproximaciones**. El error depende del número de subintervalos (`n`) usados: a mayor `n`, mayor precisión, pero también más cálculos.

**Qué hacer:**
* Aumenta el valor de `n` para reducir el error de aproximación.
* Si la función es muy oscilante, Simpson suele dar mejores resultados que Trapecio con el mismo `n`.
* Recuerda que el valor "exacto" de una integral solo se conoce si existe una antiderivada cerrada; en muchos casos reales no la hay y la aproximación numérica es la única opción.

---

## 8. ¿Por qué mi método iterativo se detiene antes de alcanzar la tolerancia que pedí?

Si el método alcanza `maxIteraciones` antes de que el error sea menor que la `tolerancia` solicitada, el resultado se marca con `convergio: false`. Esto no significa que el código falló — significa que el método numérico no logró la precisión pedida en el número de pasos permitido.

**Qué hacer:**
* Aumenta `maxIteraciones` si tienes margen computacional.
* Revisa si el sistema/función cumple las condiciones de convergencia del método (dominancia diagonal, derivada no nula, etc.).
* Considera cambiar de método si el actual no es adecuado para tu problema particular.

---

## 9. ¿Cómo interpreto la tabla de iteraciones que devuelven los métodos?

Cada objeto de resultado en ChuspaNumeric incluye un arreglo `iteraciones` con el detalle paso a paso del cálculo (valores de `x`, `error`, etc. según el método). Esto te permite:

* Verificar manualmente cómo evolucionó la aproximación.
* Detectar en qué iteración el error dejó de disminuir (señal de posible divergencia o estancamiento).
* Graficar la convergencia del método si necesitas un análisis visual.

---

## Referencias

* `docs/preguntas-frecuentes.md` — FAQ orientado a contribución de código.
* `docs/limitaciones.md` — limitaciones conocidas de la librería.
* `docs/api.md` — referencia de cada función con ejemplos de uso.