# Convenciones de nombres de funciones y parámetros

Este documento formaliza las reglas de nomenclatura que el proyecto **ChuspaNumeric** sigue de manera consistente en toda su API pública y código interno. Su objetivo es que cualquier colaborador pueda escribir o leer código del proyecto sin necesidad de adivinar los nombres correctos.

---

# 1. camelCase para funciones y parámetros

Todos los nombres de funciones y parámetros usan **camelCase**: la primera palabra en minúscula y cada palabra siguiente con la primera letra en mayúscula, sin guiones ni guiones bajos.

## Correcto

```js
function gaussSeidel({ A, b, x0, tolerancia, maxIter }) { ... }

function crearResultado({
  resultado,
  iteraciones,
  convergio
}) { ... }

function validarMatrizCuadrada(A) { ... }
```

## Incorrecto

```js
function gauss_seidel(...)      // snake_case — prohibido
function GaussSeidel(...)       // PascalCase — reservado para clases
function validar_matriz(...)    // snake_case — prohibido
```

La única excepción son los nombres de archivo, que pueden usar guión bajo (`gauss_seidel.js`) por convención del sistema de archivos del proyecto.

---

# 2. Español como idioma de nombres

Todos los nombres de funciones, parámetros y variables usan español, con las excepciones listadas en `docs/glosario-ingles-espanol.md`.

## Correcto

```js
let tolerancia = 1e-6;
let iteraciones = [];
let convergio = false;
let resultado = [];
```

## Incorrecto

```js
let tolerance = 1e-6; // inglés — prohibido salvo excepciones documentadas
let iterations = [];
let converged = false;
```

## Excepciones documentadas

Ciertos términos técnicos de álgebra lineal y matemáticas se mantienen en su forma estándar internacional porque traducirlos generaría confusión.

| Término en el código | Por qué no se traduce |
|----------------------|-----------------------|
| `A`, `b`, `x`, `x0` | Notación matricial universal |
| `L`, `U` | Factores de la descomposición LU |
| `maxIter` | Híbrido establecido; ver sección 3 |
| `n` | Dimensión de la matriz, convención matemática |

Consulta `docs/glosario-ingles-espanol.md` para la lista completa.

---

# 3. Parámetros estándar para métodos iterativos

Todo método iterativo del proyecto (Jacobi, Gauss-Seidel y futuros métodos similares) debe usar exactamente estos nombres y valores por defecto, sin variación.

| Parámetro | Tipo | Valor por defecto | Descripción |
|-----------|------|------------------|-------------|
| `tolerancia` | `number` | `1e-6` | Umbral de convergencia: el método se detiene cuando el error es menor que este valor. |
| `maxIter` | `number` | `100` | Número máximo de iteraciones permitidas antes de declarar no convergencia. |
| `x0` | `number[]` | `Array(n).fill(0)` | Vector de solución inicial; si no se provee, se usa el vector cero. |

## Ejemplo canónico

```js
function jacobi({
  A,
  b,
  x0,
  tolerancia = 1e-6,
  maxIter = 100
}) { ... }

function gaussSeidel({
  A,
  b,
  x0,
  tolerancia = 1e-6,
  maxIter = 100
}) { ... }
```

## Reglas adicionales

- `tolerancia` siempre en español completo; nunca `tol`, `epsilon` ni `eps`.
- `maxIter` es el único híbrido aceptado: `max` en inglés + `Iter` (abreviatura de iteraciones).
- No usar:
  - `maxIteraciones`
  - `iteracionesMaximas`
  - `maxI`
- Si un método no usa alguno de estos parámetros (por ejemplo, un método directo que no itera), simplemente no se declara; no se inventa un nombre alternativo.

---

# 4. Convención de prefijos

Los módulos del proyecto usan prefijos consistentes que indican la responsabilidad de cada función. Respetar estos prefijos es obligatorio al agregar nuevas funciones.

## `validar`

Funciones que comprueban que los datos de entrada sean correctos y lanzan `ErrorDominio` si no lo son.

No retornan valores útiles: su único propósito es fallar rápido ante datos inválidos.

```js
validarMatrizCuadrada(A)   // lanza si A no es cuadrada
validarVector(b, n)        // lanza si b no tiene longitud n
validarTolerancia(tol)     // lanza si tol no es un número positivo
validarIteraciones(maxIter)// lanza si maxIter no es un entero positivo
```

**Ubicación**

```
src/utils/validaciones.js
```

---

## `calcular`

Funciones que ejecutan un cómputo matemático y retornan un resultado numérico o estructurado.

```js
calcularError(xNuevo, xViejo)      // norma euclidiana entre dos vectores
calcularDeterminante(A)            // determinante de una matriz
```

---

## `crear`

Funciones que construyen y retornan un objeto estructurado siguiendo el contrato del proyecto.

```js
crearResultado({
  resultado,
  iteraciones,
  convergio,
  mensaje,
  meta
})
```

**Ubicación**

```
src/core/contrato.js
```

---

## `exportar`

Funciones que transforman datos internos a un formato externo (texto, tabla o archivo). No realizan cómputo matemático.

```js
exportarCSV(iteraciones)
exportarTabla(iteraciones, opciones)
```

---

# 5. Estructura de parámetros: objeto desestructurado

Las funciones públicas de ChuspaNumeric reciben sus argumentos como un único objeto desestructurado, no como parámetros posicionales separados.

Esto permite:

- llamar a la función con cualquier orden;
- omitir parámetros opcionales;
- agregar nuevos parámetros sin romper compatibilidad.

## Correcto

```js
// Definición
function gaussSeidel({
  A,
  b,
  x0,
  tolerancia = 1e-6,
  maxIter = 100
}) { ... }

// Uso
gaussSeidel({
  A: miMatriz,
  b: miVector,
  tolerancia: 1e-4
});
```

## Incorrecto

```js
// Definición posicional — prohibida en API pública
function gaussSeidel(A, b, x0, tolerancia, maxIter) {
  ...
}
```

Las funciones internas de utilidad (`validarMatrizCuadrada`, `calcularError`, etc.) pueden usar parámetros posicionales cuando son simples y su firma no va a crecer.

---

# 6. Nombres del objeto de retorno

Todos los métodos públicos retornan el objeto producido por `crearResultado`, que garantiza esta estructura fija.

| Campo | Descripción |
|-------|-------------|
| `resultado` | El valor principal calculado (vector solución, número, etc.). |
| `iteraciones` | Array con el historial paso a paso. |
| `convergio` | `true` si el método convergió antes de `maxIter` (solo iterativos). |
| `mensaje` | Texto descriptivo del resultado. |
| `meta` | Objeto con `metodo`, `parametros` y `tiempo_ms`. |

No se deben agregar campos fuera de esta estructura sin actualizar `src/core/contrato.js`.

---

# Resumen rápido

| Regla | Ejemplo correcto | Ejemplo incorrecto |
|--------|------------------|--------------------|
| camelCase | `gaussSeidel`, `tolerancia` | `gauss_seidel`, `Tolerancia` |
| Español | `convergio`, `iteraciones` | `converged`, `iterations` |
| Parámetro de tolerancia | `tolerancia = 1e-6` | `tol`, `epsilon`, `eps` |
| Parámetro de iteraciones | `maxIter = 100` | `maxIteraciones`, `nMax` |
| Prefijo validación | `validarVector` | `checkVector`, `verificarVector` |
| Prefijo construcción | `crearResultado` | `makeResult`, `buildOutput` |
| Firma de función pública | `f({ A, b, x0 })` | `f(A, b, x0)` |