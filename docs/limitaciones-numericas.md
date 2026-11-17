# Limitaciones numéricas por método

Este documento complementa `docs/limitaciones.md`, que describe las limitaciones **de implementación** de la librería (precisión IEEE 754, rendimiento en JavaScript, manejo de errores). El alcance de este documento es diferente: cubre las **limitaciones matemáticas** propias de cada método — es decir, los casos en que un método puede divergir, producir resultados incorrectos o simplemente no ser aplicable, independientemente de la implementación concreta en JavaScript.

Conocer estas limitaciones antes de elegir un método es parte del trabajo de cualquier persona que use ChuspaNumeric para resolver un problema numérico real.

---

## 1. Sistemas de ecuaciones lineales

### Eliminación de Gauss (`gauss`)

- **Requiere pivote no nulo**: si en algún paso de la eliminación el elemento diagonal (pivote) es cero o numéricamente muy pequeño (menor a `1e-12` en la implementación actual), el método lanza `ErrorDominio` y se detiene. Esto ocurre cuando el sistema es singular o casi-singular.
- **Sin pivoteo parcial**: la implementación actual **no reordena filas** para maximizar el valor absoluto del pivote. Esto significa que sistemas numéricamente bien condicionados pueden fallar si un pivote pequeño aparece antes que uno grande en la misma columna. Comparar con Gauss-Jordan si el sistema falla con pivotes pequeños.
- **No escala para sistemas grandes**: como se documenta en `docs/rendimiento-comparativo.md`, la implementación guarda una copia de la matriz en cada iteración del historial. Para n ≥ 150 esto puede agotar la memoria disponible antes de completar la eliminación.

### Gauss-Jordan (`gaussJordan`)

- Comparte todas las limitaciones de Gauss respecto a pivotes nulos y ausencia de pivoteo parcial.
- Produce la matriz identidad reducida, lo que implica aproximadamente el doble de operaciones que Gauss. No es la opción más eficiente para resolver un solo sistema lineal.

### Jacobi (`jacobi`) y Gauss-Seidel (`gaussSeidel`)

- **Convergencia no garantizada sin diagonal dominante**: ambos métodos convergen si la matriz es **estrictamente diagonalmente dominante** (cada elemento diagonal es mayor en valor absoluto que la suma del resto de su fila). Si esta condición no se cumple, el método puede diverger o oscilar sin converger. La implementación lanza `ErrorDominio` si algún elemento diagonal es exactamente cero, pero **no verifica** la dominancia diagonal completa antes de iterar.
- **Convergencia lenta en sistemas mal condicionados**: incluso cuando convergen, pueden requerir cientos de iteraciones si el radio espectral de la matriz de iteración es cercano a 1.
- **Jacobi vs. Gauss-Seidel**: Gauss-Seidel usa los valores ya actualizados en la misma iteración y converge en menos iteraciones que Jacobi para la misma matriz, pero no siempre es más rápido en tiempo absoluto (ver `docs/rendimiento-comparativo.md`).
- **No detectan divergencia automáticamente**: si los valores divergen, la implementación simplemente alcanza `maxIter` y devuelve `convergio: false`, sin advertir que los valores intermedios crecieron sin control.

### Descomposición LU (`lu`)

- **Requiere pivote no nulo**: igual que Gauss, lanza `ErrorDominio` si aparece un pivote nulo durante la factorización.
- **Sin pivoteo**: misma limitación que Gauss — matrices con pivotes pequeños pueden producir resultados numéricamente incorrectos aunque no sean singulares.
- **Solo matrices cuadradas**: no resuelve sistemas sobredeterminados ni subdeterminados.

### Cholesky (`descomposicionCholesky`, `resolverCholesky`)

- **Solo matrices simétricas definidas positivas**: la implementación verifica simetría y lanza `ErrorParametros` si no se cumple, y lanza `ErrorDominio` si aparece un valor negativo en la diagonal durante la factorización (señal de que la matriz no es definida positiva). Intentar usar Cholesky con matrices no simétricas o indefinidas falla con error.
- **Sensible al mal condicionamiento**: matrices simétricas definidas positivas pero mal condicionadas (como la matriz de Hilbert para n grande) pueden producir soluciones con error acumulado, aunque la factorización técnicamente tenga éxito.

---

## 2. Ecuaciones no lineales

### Bisección (`biseccion`)

- **Requiere cambio de signo en el intervalo**: si `f(a)` y `f(b)` tienen el mismo signo, el método no puede garantizar la existencia de una raíz en `[a, b]` y lanza `ErrorParametros`. Esto excluye raíces de multiplicidad par (donde la función toca el eje sin cruzarlo).
- **Convergencia lenta**: la bisección reduce el intervalo a la mitad en cada iteración, lo que equivale a ganar un bit de precisión por paso. Para alcanzar una tolerancia de `1e-12` desde un intervalo de longitud 1 se necesitan aproximadamente 40 iteraciones. Es el método más robusto pero el más lento de los disponibles.
- **No detecta raíces múltiples en el interior**: si hay más de una raíz en `[a, b]`, bisección encontrará una de ellas (la que el proceso de reducción alcance primero), sin advertir que existen otras.

### Newton-Raphson (`newtonRaphson`)

- **Requiere la derivada `df`**: el método exige que el usuario proporcione la función y su derivada analítica. Si la derivada se aproxima numéricamente, el error de la aproximación puede afectar la convergencia cerca de la raíz.
- **Diverge si la derivada se anula cerca de la raíz**: si `f'(x) ≈ 0` en algún punto del proceso iterativo, se produce una división por cero. La implementación lanza `ErrorDominio` en ese caso, pero si `f'(x)` es pequeño sin ser exactamente cero, el paso se vuelve muy grande y el método puede saltar lejos de la raíz.
- **Sensible al punto inicial `x0`**: con una mala aproximación inicial, Newton-Raphson puede diverger, entrar en un ciclo, o converger a una raíz diferente a la buscada. No hay garantía de convergencia global — solo convergencia cuadrática **local** (cuando `x0` ya está suficientemente cerca de la raíz).
- **No funciona bien con raíces de multiplicidad > 1**: la convergencia cuadrática se degrada a convergencia lineal para raíces múltiples.

### Secante (`secante`)

- **Requiere dos puntos iniciales `x0` y `x1`**: si `f(x0) ≈ f(x1)`, la diferencia en el denominador se aproxima a cero y el método puede producir un paso muy grande o lanzar `ErrorDominio`.
- **Convergencia superlineal pero no cuadrática**: la secante converge con orden ≈ 1.618 (número áureo), más rápido que bisección pero más lento que Newton-Raphson.
- **Sin garantía de convergencia global**: igual que Newton-Raphson, puede diverger con malos puntos iniciales.

### Punto fijo (`puntoFijo`)

- **Convergencia solo si `|g'(x)| < 1` cerca de la raíz**: el teorema del punto fijo garantiza convergencia cuando la función de iteración `g` es una contracción en el entorno de la raíz. Si `|g'(x)| ≥ 1`, el método diverge. La elección de `g` es responsabilidad del usuario — ChuspaNumeric no verifica esta condición.
- **Convergencia lineal**: más lenta que Newton-Raphson y secante en general.
- **La reformulación `f(x) = 0` → `x = g(x)` no es única**: distintas formas de reformular el mismo problema pueden converger o diverger según el caso.

### Müller (`muller`)

- **Requiere tres puntos iniciales distintos**: si cualquier par de los tres puntos iniciales (`x0`, `x1`, `x2`) coincide, la implementación lanza `ErrorParametros`.
- **Puede encontrar raíces complejas**: Müller trabaja con polinomios de grado 2, cuyo discriminante puede ser negativo. La implementación lanza `ErrorDominio` en ese caso, ya que ChuspaNumeric no soporta aritmética de números complejos.
- **El denominador puede ser cero**: si en alguna iteración la diferencia entre denominadores es cero (caso degenerado), se lanza `ErrorDominio`.

---

## 3. Interpolación

### Lagrange (`lagrange`) y diferencias divididas de Newton (`newtonDD`)

- **Los nodos `xi` deben ser distintos**: si dos puntos comparten la misma coordenada `x`, la implementación lanza `ErrorParametros` (división por cero en la fórmula de Lagrange o en las diferencias divididas).
- **Oscilación de Runge para muchos nodos equiespaciados**: usar muchos puntos de interpolación equiespaciados puede producir oscilaciones grandes en los extremos del intervalo (fenómeno de Runge). Con datos equiespaciados, usar splines cúbicos en lugar de un polinomio de grado alto.
- **El grado del polinomio crece con el número de puntos**: con `n` puntos se obtiene un polinomio de grado `n-1`. Para `n` grande, el polinomio de alto grado puede ser numéricamente inestable.
- **No extrapola de forma confiable**: el valor interpolado fuera del rango `[x_mín, x_máx]` de los nodos puede diverger rápidamente.

### Splines cúbicos (`splines`)

- **Requiere al menos 3 puntos**: la implementación lanza `ErrorParametros` si se pasan menos de 3 pares `[xi, yi]`.
- **Los puntos deben estar ordenados por `x`**: si los nodos no están en orden ascendente de `x`, la implementación lanza `ErrorParametros`.
- **El valor `x` a interpolar debe estar dentro del rango de los nodos**: la implementación lanza `ErrorParametros` para extrapolación fuera del rango `[x_mín, x_máx]`.
- **Condiciones de frontera naturales**: la implementación usa condiciones de frontera naturales (`S''(x_0) = S''(x_n) = 0`), lo que es apropiado en la mayoría de casos pero puede no ser el más preciso si se conocen las derivadas en los extremos.

---

## 4. Integración numérica

### Regla del trapecio (`trapecio`)

- **Error de orden 2**: el error de truncamiento es proporcional a `h²·f''(ξ)`. Si la segunda derivada de la función es grande en el intervalo, se necesitan muchos subintervalos para obtener buena precisión.
- **No detecta funciones con discontinuidades**: si `f` tiene una discontinuidad dentro de `[a, b]`, el resultado puede ser arbitrariamente incorrecto sin ningún error o advertencia.

### Simpson 1/3 (`simpson13`)

- **`n` debe ser par**: la regla de Simpson 1/3 compuesta requiere un número par de subintervalos. La implementación ajusta `n` automáticamente si es impar (lo incrementa en 1), lo que puede resultar en un número de evaluaciones distinto al solicitado.
- **Error de orden 4**: más preciso que el trapecio para funciones suaves, pero igual de sensible a discontinuidades o singularidades dentro del intervalo.

### Simpson 3/8 (`simpson38`)

- **`n` debe ser múltiplo de 3**: la regla de Simpson 3/8 compuesta requiere que el número de subintervalos sea múltiplo de 3. La implementación usa `n = 99` como valor por defecto precisamente para cumplir esta condición. Si se pasa un `n` que no sea múltiplo de 3, la implementación lanza `ErrorParametros`.
- **Misma precisión teórica que Simpson 1/3** (orden 4), por lo que en la práctica Simpson 1/3 es más flexible.

---

## 5. Ecuaciones diferenciales ordinarias (EDO)

### Euler (`euler`), Euler mejorado/Heun (`eulerMejorado`) y Runge-Kutta 4 (`rungeKutta4`)

- **El paso `h` debe ser positivo y `xFinal > x0`**: la implementación lanza error si `h ≤ 0` o `xFinal ≤ x0`.
- **Métodos de paso fijo**: los tres métodos usan un paso `h` constante. No se adaptan automáticamente cuando la solución varía rápidamente en algunas regiones y lentamente en otras. Para funciones con comportamiento muy variable, se necesitaría un método de paso adaptativo (no disponible actualmente en ChuspaNumeric).
- **Euler diverge en ecuaciones rígidas (stiff)**: para ecuaciones donde la solución decae rápidamente (coeficiente negativo grande, como `y' = -ky` con `k` grande), Euler requiere un paso `h` muy pequeño para no diverger. Como se muestra en `docs/rendimiento-comparativo.md` (escenario 1), con `y' = -5y` y `h = 0.1`, el error de Euler es 215 veces mayor que el de RK4.
- **RK4 no es siempre la mejor opción**: aunque RK4 es más preciso que Euler y Euler mejorado, evalúa la función `f(x, y)` 4 veces por paso (frente a 1 de Euler y 2 de Euler mejorado). Si `f` es computacionalmente costosa, esto puede ser relevante.
- **Acumulación de error global**: todos los métodos acumulan error en cada paso. El error global crece aproximadamente como `O(h^p)` donde `p` es el orden del método (1 para Euler, 2 para Euler mejorado, 4 para RK4). Para intervalos largos o tolerancias muy estrictas, reducir `h` es la única opción disponible en ChuspaNumeric.
- **No detectan inestabilidad numérica**: si la solución diverge por un `h` demasiado grande para la ecuación dada, los métodos simplemente producen valores cada vez más grandes sin advertir que la solución numérica se ha separado de la solución real.
