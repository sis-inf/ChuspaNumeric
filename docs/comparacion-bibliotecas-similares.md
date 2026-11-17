# Comparación de ChuspaNumeric frente a bibliotecas similares

## Introducción

Este documento compara ChuspaNumeric con otras bibliotecas JavaScript de
cálculo numérico ya establecidas: **math.js**, **numeric.js** y
**ml-matrix**. El objetivo es ayudar a los usuarios a elegir la
herramienta más adecuada para su caso de uso, y posicionar a ChuspaNumeric
de forma honesta dentro del ecosistema.

---

## Tabla comparativa general

| Característica | ChuspaNumeric | math.js | numeric.js | ml-matrix |
|---|---|---|---|---|
| **Enfoque principal** | Métodos numéricos educativos con tablas de iteraciones paso a paso | Calculadora simbólica y numérica de propósito general | Álgebra lineal de bajo nivel y métodos numéricos generales | Álgebra lineal de alto rendimiento (matrices densas y dispersas) |
| **Idioma de la API** | Español (nombres de funciones y campos en español) | Inglés | Inglés | Inglés |
| **Tablas de iteraciones** | ✅ Sí — todos los métodos devuelven el historial paso a paso | ❌ No | ❌ No | ❌ No |
| **Evaluación de expresiones** | ❌ No (funciones JavaScript nativas) | ✅ Sí (`math.evaluate("x^2 + 1")`) | ❌ No | ❌ No |
| **Álgebra simbólica** | ❌ No | ✅ Sí (simplificación, derivación simbólica) | ❌ No | ❌ No |
| **Sistemas de ecuaciones lineales** | ✅ Gauss, LU, Jacobi, Gauss-Seidel, Cholesky | ✅ Sí | ✅ Sí | ✅ Sí (optimizado) |
| **Ecuaciones no lineales** | ✅ Bisección, Newton-Raphson, secante, punto fijo, Müller | ✅ Sí | ✅ Parcial | ❌ No |
| **EDOs** | ✅ Euler, Euler mejorado, RK4 | ❌ No | ✅ Parcial | ❌ No |
| **Integración numérica** | ✅ Trapecio, Simpson 1/3, Simpson 3/8, Gauss-Legendre | ✅ Parcial | ✅ Sí | ❌ No |
| **Interpolación** | ✅ Lagrange, Newton DD, splines cúbicos | ✅ Parcial | ✅ Parcial | ❌ No |
| **Tamaño de bundle (aprox.)** | < 50 KB (sin dependencias de producción) | ~2 MB | ~200 KB | ~500 KB |
| **Dependencias de producción** | Ninguna | Ninguna (autocontenida) | Ninguna | Ninguna |
| **Licencia** | MIT | Apache 2.0 | MIT | MIT |
| **Mantenimiento activo** | ✅ Sí (proyecto académico en desarrollo) | ✅ Sí | ⚠️ Mantenimiento mínimo | ✅ Sí |

---

## Descripción de cada biblioteca

### ChuspaNumeric

ChuspaNumeric es una biblioteca de **métodos numéricos educativos** para
JavaScript, desarrollada en el contexto académico de la carrera de
Sistemas e Informática. Su característica diferenciadora es que todos
los métodos devuelven no solo el resultado final, sino también la
**tabla completa de iteraciones** (`resultado.iteraciones`), lo que
permite al estudiante entender paso a paso cómo el algoritmo converge
a la solución.

**Ideal para:**
* Estudiantes de ingeniería que necesitan ver el proceso iterativo,
  no solo el resultado final.
* Proyectos académicos donde la trazabilidad del cálculo es tan
  importante como el resultado.
* Docentes que quieren mostrar la convergencia de un método numérico
  de forma interactiva.

**No es ideal para:**
* Producción de alto rendimiento con matrices de gran tamaño.
* Evaluación de expresiones matemáticas escritas por el usuario
  (no tiene parser de expresiones).
* Álgebra simbólica (derivación o integración simbólica).

---

### math.js

math.js es una **calculadora matemática de propósito general** para
JavaScript y Node.js. Su punto fuerte es la evaluación de expresiones
matemáticas escritas como texto (`math.evaluate("sqrt(3^2 + 4^2)")`),
lo que la hace muy accesible para usuarios no programadores. También
soporta álgebra simbólica básica (simplificación de expresiones,
derivación simbólica).

**Ideal para:**
* Aplicaciones donde el usuario escribe expresiones matemáticas como
  texto (calculadoras, editores de fórmulas).
* Proyectos que necesitan un ecosistema matemático completo en un solo
  paquete: fracciones, números complejos, unidades de medida,
  probabilidad, matrices.
* Prototipado rápido de cálculos matemáticos variados.

**No es ideal para:**
* Cuando se necesita ver las iteraciones intermedias de un método
  numérico (no las expone).
* Proyectos con restricciones de tamaño de bundle (~2 MB es grande
  para aplicaciones web ligeras).
* Métodos numéricos avanzados como EDOs o interpolación por splines.

---

### numeric.js

numeric.js es una biblioteca orientada a **álgebra lineal y métodos
numéricos de propósito general** para JavaScript. Tiene una API de
bajo nivel orientada al rendimiento, similar en espíritu a NumPy de
Python pero sin la optimización de arrays tipados que ofrece
`ml-matrix`.

**Ideal para:**
* Proyectos que necesitan operaciones de álgebra lineal (producto
  matricial, descomposición LU, valores propios) con una API compacta.
* Usuarios con experiencia en NumPy que buscan algo familiar en JavaScript.

**No es ideal para:**
* Proyectos nuevos — numeric.js tiene mantenimiento mínimo y no
  recibe actualizaciones regulares.
* Educación — no expone tablas de iteraciones ni mensajes explicativos.
* Métodos numéricos avanzados como EDOs o integración por cuadratura.

---

### ml-matrix

ml-matrix es una biblioteca especializada en **operaciones con matrices
densas y dispersas** de alto rendimiento, desarrollada por la comunidad
`mljs`. Usa arrays tipados (`Float64Array`) para maximizar el
rendimiento en operaciones matriciales de gran escala.

**Ideal para:**
* Machine learning y procesamiento de datos donde el rendimiento de
  operaciones matriciales es crítico.
* Proyectos que ya usan el ecosistema `mljs` (ml-regression,
  ml-stat, etc.).
* Operaciones con matrices grandes (cientos o miles de filas/columnas).

**No es ideal para:**
* Métodos numéricos generales (ecuaciones no lineales, EDOs,
  integración, interpolación — no están incluidos).
* Educación — la API está orientada al rendimiento, no a la
  comprensión del algoritmo.
* Proyectos pequeños donde la complejidad de la API no se justifica.

---

## ¿Cuándo usar ChuspaNumeric en lugar de las otras?

| Si necesitas... | Usa |
|---|---|
| Ver las iteraciones paso a paso de un método numérico | **ChuspaNumeric** |
| Resolver un sistema de ecuaciones para un trabajo académico | **ChuspaNumeric** |
| Evaluar una expresión matemática escrita por el usuario | **math.js** |
| Álgebra simbólica (derivar, simplificar) | **math.js** |
| Operaciones matriciales de alto rendimiento | **ml-matrix** |
| API similar a NumPy en JavaScript | **numeric.js** (con precaución por el mantenimiento mínimo) |
| Bundle pequeño sin dependencias externas | **ChuspaNumeric** o **numeric.js** |

---

## Referencias

* [math.js](https://mathjs.org) — documentación oficial.
* [numeric.js](http://numericjs.com) — repositorio y documentación.
* [ml-matrix](https://github.com/mljs/matrix) — repositorio GitHub.
* `docs/limitaciones.md` — limitaciones conocidas de ChuspaNumeric.
* `docs/arquitectura-decisiones.md` — por qué ChuspaNumeric descartó math.js
  como dependencia (ADR-004).