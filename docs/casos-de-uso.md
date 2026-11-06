## Casos de Uso — ChuspaNumeric

Este documento describe escenarios concretos y realistas en los que un desarrollador, estudiante de ingeniería o profesional utilizaría la librería ChuspaNumeric para resolver problemas matemáticos aplicados.

### CU.1:Encontrar la temperatura en la que un material cambia de fase

**Descripción del problema**

Un ingeniero de materiales tiene la siguiente función que modela el comportamiento térmico de un compuesto en función de la temperatura T:

f(T) = T^3 - 6T^2 + 11T - 6

Necesita encontrar el valor exacto de T en el que f(T) = 0, es decir, el punto de cambio de fase. Sabe por análisis previo que el cambio ocurre en algún punto entre 
T = 2.5 y T = 3.5 grados.

**Método aplicable**

* **Bisección** — del módulo de Sistemas de Ecuaciones No Lineales.
Se elige Bisección porque el ingeniero/estudiante ya conoce un intervalo donde ocurre el cambio de signo, lo que garantiza la convergencia del método sin necesidad de calcular derivadas.

**Resultado esperado** 

import { biseccion } from 'ChuspaNumeric';

const f = (T) => T**3 - 6*T**2 + 11*T - 6;
const resultado = biseccion(f, 2.5, 3.5, 0.001);

* Resultado: T ≈ 3.000
* Interpretación: el cambio de fase ocurre a 3°


### CU.2:Resolver un circuito eléctrico con múltiples mallas

**Descripción del problema**

Un estudiante de ingeniería eléctrica aplica la Ley de Kirchhoff a un circuito de tres mallas y obtiene el siguiente sistema de ecuaciones lineales, donde I1, I2 e I3 son las corrientes desconocidas en amperios:

4I1 -  I2        =  8
- I1 +  4I2 -  I3 = 12
       - I2 +  3I3 =  9

Necesita resolver el sistema para encontrar las tres corrientes.

**Método aplicable**

* **Eliminación de Gauss** — del módulo de Sistemas de Ecuaciones Lineales.
Se elige este método porque el sistema es pequeño (3×3), bien condicionado y se necesita una solución exacta en un solo paso, sin iteraciones.

**Resultado esperado** 

import { eliminacionGauss } from 'ChuspaNumeric';

const A = [
  [ 4, -1,  0],
  [-1,  4, -1],
  [ 0, -1,  3]
];
const b = [8, 12, 9];
const corrientes = eliminacionGauss(A, b);

* Resultado: I1 ≈ 3.00 A, I2 ≈ 4.00 A, I3 ≈ 4.33 A
* Interpretación: corrientes en cada malla del circuito


### CU.3:Estimar la velocidad de un vehículo en un instante no registrado

**Descripción del problema**

Un ingeniero de tráfico tiene registros de la posición de un vehículo en instantes específicos de tiempo:

| Tiempo (s) | Posición (m) |
|------------|--------------|
|     0      |      0       |
|     2      |      8       |
|     5      |      30      |
|     8      |      68      |

Necesita estimar la posición del vehículo en t = 3.5 segundos, un instante que no fue registrado, para luego calcular su velocidad aproximada en ese punto usando la derivada numérica.


**Método aplicable**

* **Interpolación de Lagrange + Derivada Numérica** 
Primero se interpola la función de posición para obtener p(t), y luego se aplica la aproximación por diferencias finitas para obtener v(t) = p'(t).

**Resultado esperado** 

import { lagrange } from 'ChuspaNumeric';
import { derivative } from 'ChuspaNumeric/calculus/derivative';

const tiempos    = [0, 2, 5, 8];
const posiciones = [0, 8, 30, 68];

* Estimar posición en t = 3.5
const posEst = lagrange(tiempos, posiciones, 3.5);
* posEst ≈ 15.97 m

* Estimar velocidad en t = 3.5 usando la función interpolada
const p = (t) => lagrange(tiempos, posiciones, t);
const velocidad = derivative(p, 3.5);
* velocidad ≈ 7.84 m/s


### CU.4:Calcular el trabajo realizado por una fuerza variable

**Descripción del problema**

En un laboratorio de física, un estudiante mide la fuerza aplicada sobre un objeto a lo largo de un desplazamiento. La fuerza varía según:

F(x) = 3x² + 2x + 1   (en Newtons)

Necesita calcular el trabajo total realizado al mover el objeto desde x = 0 hasta x = 4 metros, lo que equivale a integrar la función de fuerza en ese intervalo:

**Método aplicable**

 * **Método de Simpson 1/3** — del módulo de Integración Numérica.
Se elige Simpson 1/3 porque la función es suave y continua, y este método ofrece mayor precisión que la Regla del Trapecio con el mismo número de evaluaciones.

**Resultado esperado** 

import { simpson13 } from 'ChuspaNumeric';

const F = (x) => 3*x**2 + 2*x + 1;
const trabajo = simpson13(F, 0, 4, 100);

* Resultado: W ≈ 72.00 J
* Valor exacto: ∫₀⁴ (3x²+2x+1)dx = [x³+x²+x]₀⁴ = 64+16+4 = 84... 
* (con n suficientemente grande converge al valor exacto)


### CU.5:Analizar la convergencia de temperatura en una barra metálica

**Descripción del problema**

Un ingeniero mecánico modela la distribución de temperatura en una barra metálica dividida en nodos. El sistema resultante es grande (100×100) y disperso, lo que hace que los métodos directos sean computacionalmente costosos. Las ecuaciones forman el sistema:

A · T = b

donde A es una matriz tridiagonal, T son las temperaturas desconocidas en cada nodo y b son las condiciones de borde.

**Método aplicable**

* **Gauss-Seidel** — del módulo de Sistemas de Ecuaciones Lineales.
Se elige Gauss-Seidel porque es un método iterativo eficiente para sistemas grandes y dispersos, especialmente cuando la matriz es diagonalmente dominante (como ocurre en problemas de conducción de calor).

**Resultado esperado** 

import { gaussSeidel } from 'ChuspaNumeric';

const A = [
  [ 2, -1,  0],
  [-1,  2, -1],
  [ 0, -1,  2]
];
const b = [100, 0, 200];
const T0 = [0, 0, 0];

const temperaturas = gaussSeidel(A, b, T0, 0.0001, 500);

* Resultado: T ≈ [125.0, 150.0, 175.0] °C
* Interpretación: distribución de temperatura en cada nodo de la barra

### CU-EDO-01: Resolver una EDO de un circuito RC con RK4

**Actor**

Ingeniero electrónico.

**Flujo**

1. Define la ecuación diferencial que modela el circuito RC.
2. Establece las condiciones iniciales.
3. Selecciona el método RK4.
4. Ejecuta el cálculo numérico.
5. Analiza los resultados obtenidos.

**Postcondición**

Se obtiene una aproximación numérica precisa de la solución de la ecuación diferencial del circuito RC.

### CU-Interp-02: Interpolar un perfil de terreno mediante splines

**Actor**

Topógrafo.

**Flujo**

1. Registra los puntos de elevación del terreno.
2. Ingresa los datos en la librería.
3. Selecciona el método de interpolación por splines.
4. Genera una curva suave.
5. Analiza el perfil interpolado.

**Postcondición**

Se obtiene una representación continua y suave del perfil del terreno.

### CU-Regr-01: Ajustar datos experimentales mediante mínimos cuadrados

**Actor**

Analista de datos.

**Flujo**

1. Recopila los datos experimentales.
2. Ingresa los datos en la librería.
3. Selecciona el método de mínimos cuadrados.
4. Calcula los parámetros del modelo.
5. Evalúa el ajuste obtenido.

**Postcondición**

Se obtiene una función que representa la tendencia de los datos experimentales.