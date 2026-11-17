# Registro de decisiones arquitectónicas (ADR)

Este documento registra las decisiones de diseño significativas del proyecto ChuspaNumeric. Cada entrada sigue el formato **Título / Estado / Contexto / Decisión / Consecuencias**, inspirado en la práctica de Architecture Decision Records (ADR) popularizada por Michael Nygard.

El propósito de este registro no es justificar las decisiones tomadas, sino dejar constancia de por qué se tomaron, qué alternativas se consideraron y qué compromisos (trade-offs) implican, para que futuros contribuidores puedan entender el proyecto sin tener que reconstruir esa historia a partir del código o del historial de commits.

---

## ADR-001 — Parámetros como objeto en lugar de argumentos posicionales para todos los métodos públicos

**Estado**: Aceptado

### Contexto

Al diseñar la API pública de los métodos numéricos, la primera implementación de cada categoría (visible en `src/root/bisection.js`, que representa el paradigma original) usaba argumentos posicionales:

```js
// Paradigma anterior — argumentos posicionales
function bisection(expression, a, b, tolerance = 0.001, maxIterations = 100)
```

Este estilo es habitual en librerías numéricas tradicionales (NumPy, SciPy, MATLAB), pero genera varios problemas en JavaScript moderno: el orden de los argumentos es difícil de recordar sin consultar la documentación, los parámetros opcionales solo pueden omitirse si están al final, y llamar con el orden equivocado es un error silencioso (JavaScript no lanza error por tipo incorrecto en tiempo de llamada).

### Decisión

Todos los métodos del módulo `src/` fuera de `root/` usan un único argumento de tipo objeto con desestructuración:

```js
// Paradigma actual — objeto con desestructuración
function biseccion({ f, a, b, tolerancia = 1e-6, maxIter = 100 })
```

Este estilo es consistente en los **24 archivos** que actualmente implementan métodos en el proyecto (verificado en `src/lineales/`, `src/no-lineales/`, `src/edo/`, `src/integracion/`, `src/interpolacion/`, `src/analisis/`).

### Consecuencias

**Positivas:**
- El sitio de llamada es autodocumentado: `biseccion({ f, a: 0, b: 3 })` es legible sin consultar la firma.
- Los parámetros opcionales pueden omitirse en cualquier orden, no solo al final.
- Agregar nuevos parámetros opcionales en el futuro es retrocompatible (no rompe llamadas existentes que no los usan).
- Es más fácil construir objetos de configuración dinámicamente antes de pasarlos al método.

**Negativas / compromisos:**
- Las llamadas son más verbosas que en el paradigma posicional.
- La desestructuración añade una capa de indirección que puede resultar menos familiar para usuarios acostumbrados a MATLAB o NumPy.
- El directorio `src/root/` (paradigma anterior) quedó en el repositorio como código legado no eliminado, lo que puede generar confusión al ver dos implementaciones del mismo método con firmas distintas.

---

## ADR-002 — Contrato de resultado uniforme a través de `crearResultado`

**Estado**: Aceptado

### Contexto

Sin una estructura de retorno estándar, cada método puede devolver su resultado de una forma distinta: algunos devuelven el valor escalar directamente, otros un objeto con campos propios, otros `null` en caso de no convergencia. Esto obliga al consumidor a leer la documentación de cada método por separado y a escribir código de manejo de errores diferente para cada uno.

### Decisión

Se introdujo la función `crearResultado` en `src/core/contrato.js`, que todos los métodos deben usar para construir su valor de retorno:

```js
crearResultado({
  resultado,      // number | Array | null — el valor solución
  iteraciones,    // Array — historial de pasos
  convergio,      // boolean
  mensaje,        // string — descripción del resultado o del error
  meta: {
    metodo,       // string — nombre del método
    parametros,   // Object — parámetros de entrada
    tiempo_ms,    // number — tiempo de ejecución
  },
})
```

Al momento de escribir este documento, `crearResultado` es importada y usada en **24 archivos** del proyecto, lo que representa una adopción casi total en el conjunto de métodos implementados.

### Consecuencias

**Positivas:**
- El consumidor puede procesar el resultado de cualquier método con el mismo código, sin ramificaciones por método.
- El campo `convergio` permite detectar fallas de convergencia de forma uniforme, sin depender de que el campo `resultado` sea `null`.
- El array `iteraciones` es consistente entre todos los métodos, habilitando comparaciones directas (como la tabla de convergencia del Escenario 4 en `docs/casos-de-uso-avanzados.md`).
- `meta.tiempo_ms` es la fuente de verdad para benchmarking, usada por `medirTiempo` en `src/core/contrato.js`.

**Negativas / compromisos:**
- El contrato añade overhead en métodos directos (como `lu` o `cholesky`) que no tienen iteraciones que reportar — esos métodos devuelven `iteraciones: []` o con pasos de sustitución, lo cual es correcto pero menos intuitivo que devolver solo el vector solución.
- Algunos métodos en `src/root/` y `src/errors/` no siguen este contrato (son código legado), lo que introduce una inconsistencia visible para quien explora el repositorio.

---

## ADR-003 — ES Modules puro con verificación de tipos por JSDoc en lugar de TypeScript nativo

**Estado**: Aceptado

### Contexto

El ecosistema JavaScript moderno ofrece dos caminos para tener verificación de tipos en tiempo de desarrollo: TypeScript (archivos `.ts` compilados a `.js`) y JSDoc con verificación mediante `tsc --checkJs` sobre archivos `.js` nativos. Ambas opciones tienen soporte en VS Code y en el pipeline de CI.

TypeScript nativo ofrece la experiencia de tipos más completa, pero introduce una capa de compilación obligatoria, requiere que todos los contribuidores entiendan la sintaxis de TypeScript, y genera fricción en un proyecto donde muchos contribuidores son estudiantes que aprenden JavaScript por primera vez.

### Decisión

ChuspaNumeric usa **ES Modules puros** (`"type": "module"` en `package.json`) con **verificación de tipos mediante JSDoc** y `jsconfig.json`:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": true,
    "noEmit": true,
    "noImplicitAny": false
  }
}
```

La opción `"noImplicitAny": false` es deliberada: permite usar el verificador de tipos en modo progresivo, donde el código sin anotaciones JSDoc no genera errores, y solo los archivos que sí tienen `@param` y `@returns` son verificados.

El script `"typecheck": "tsc -p jsconfig.json --noEmit"` en `package.json` permite ejecutar la verificación en CI sin compilar nada.

### Consecuencias

**Positivas:**
- Los archivos fuente son JavaScript puro — no hay paso de compilación obligatorio para ejecutar o contribuir al proyecto.
- Los contribuidores nuevos pueden trabajar con o sin anotaciones JSDoc; la verificación de tipos es opt-in por archivo.
- La distribución (`dist/`) generada por Rollup no necesita un paso de transpilación de TypeScript.
- El proyecto es compatible con cualquier editor sin configuración adicional de plugins de TypeScript.

**Negativas / compromisos:**
- La verificación de tipos es menos exhaustiva que TypeScript nativo en archivos sin anotaciones JSDoc completas.
- Refactorizaciones que afectan tipos (cambiar la firma de `crearResultado`, por ejemplo) no generan errores automáticos en todos los sitios de llamada si no están anotados.
- `jsconfig.json` excluye actualmente la carpeta `src/` del chequeo (`"exclude": ["node_modules", "src", "test.js"]`), lo que significa que la verificación de tipos no se aplica al código de producción — solo a los archivos raíz. Esto es una limitación del estado actual de la configuración, no una decisión intencional.

---

## ADR-004 — Descarte del paradigma de evaluación de expresión-string con mathjs

**Estado**: Descartado (reemplazado por funciones JavaScript nativas)

### Contexto

La primera generación de métodos de ChuspaNumeric (visible en `src/root/bisection.js` y `src/root/newtonRaphson.js`) recibía la función matemática como una **cadena de texto** que se evaluaba en tiempo de ejecución usando la librería `mathjs`:

```js
import { create, all } from 'mathjs';
const math = create(all);

function bisection(expression, a, b, tolerance = 0.001, maxIterations = 100) {
  const f = (x) => math.evaluate(expression, { x });
  // ...
}
```

El argumento `expression` era un string como `"x^3 - 2*x - 5"`. Este paradigma tiene una ventaja real: es accesible para usuarios no programadores que solo quieren evaluar una expresión matemática sin saber JavaScript.

Sin embargo, el paradigma de expresión-string introduce problemas serios:

1. **Seguridad**: `math.evaluate` ejecuta código arbitrario si se acepta input no confiable.
2. **Rendimiento**: parsear y evaluar un string en cada iteración es significativamente más lento que llamar una función JavaScript nativa.
3. **Depuración**: los errores dentro de la expresión evaluada no tienen stack trace legible.
4. **Tipado**: es imposible verificar el tipo de `expression` estáticamente con JSDoc o TypeScript.
5. **Dependencia externa**: `mathjs` es una dependencia de ~2 MB que se incluiría en el bundle de todos los usuarios de la librería, aunque solo un subconjunto de métodos la use.

### Decisión

El paradigma de expresión-string se **descartó para los métodos de la librería principal**. Todos los métodos nuevos reciben la función como una **función JavaScript nativa**:

```js
// Paradigma actual — función nativa
biseccion({
  f: (x) => x**3 - 2*x - 5,
  a: 0,
  b: 3,
})
```

`mathjs` fue eliminada de las dependencias de producción de `package.json` (no aparece en `"dependencies"` ni en `"devDependencies"` en la versión actual).

Los archivos `src/root/bisection.js` y `src/root/newtonRaphson.js` permanecen en el repositorio como **evidencia histórica del paradigma descartado**, no como código en uso. No son exportados por `src/index.js` y no forman parte de la API pública.

> **Nota**: el issue de origen de este ADR menciona que mathjs fue "reintroducida de forma acotada solo para CLI/playground en el lote de feat". Al momento de escribir este documento, ese CLI y playground no existen en el repositorio. Si se implementan en el futuro, este ADR deberá actualizarse para reflejar las condiciones exactas en las que mathjs es aceptable (solo en capas de presentación, nunca en la librería principal).

### Consecuencias

**Positivas:**
- Sin dependencias de producción: el bundle final de ChuspaNumeric contiene solo código propio.
- Las funciones JavaScript nativas tienen soporte nativo de closures, lo que permite parametrizar comportamiento de forma idiomática.
- El rendimiento de evaluación es el de una llamada de función JavaScript normal (compilada por el motor V8), no el de un intérprete de expresiones.

**Negativas / compromisos:**
- El umbral de entrada aumenta para usuarios no programadores: necesitan saber JavaScript para definir `f` como función.
- No existe actualmente una forma de usar ChuspaNumeric desde una interfaz de usuario donde el usuario escriba la expresión matemática como texto — esta funcionalidad requeriría una capa de presentación que encapsule `mathjs` o similar, separada de la librería.

---

## ADR-005 — Estructura de directorios por categoría matemática

**Estado**: Aceptado

### Contexto

Al organizar los métodos numéricos en el directorio `src/`, existen varias opciones de agrupación: por tipo de retorno, por complejidad algorítmica, por orden de implementación, o por la **categoría matemática** a la que pertenece cada método. Los proyectos de referencia en la organización `sis-inf` (como `estante` y `escuadra`) usan estructuras por dominio de problema.

### Decisión

Los métodos se organizan en subdirectorios de `src/` que corresponden a **categorías matemáticas canónicas**:

```
src/
├── core/          # Infraestructura compartida (contrato, errores, validaciones)
├── utils/         # Utilidades transversales (formato, redondeo, convergencia)
├── io/            # Exportación de resultados (JSON, CSV)
├── lineales/      # Sistemas de ecuaciones lineales (Gauss, LU, Jacobi, Cholesky...)
├── no-lineales/   # Ecuaciones no lineales (bisección, Newton-Raphson, secante...)
├── edo/           # Ecuaciones diferenciales ordinarias (Euler, RK2, RK4...)
├── integracion/   # Integración numérica (trapecio, Simpson, Gauss-Legendre...)
├── interpolacion/ # Interpolación (Lagrange, Newton DD, splines...)
├── analisis/      # Análisis de datos (regresión lineal, regresión polinomial)
├── matricial/     # Operaciones matriciales (normas, determinantes...)
├── diferencias/   # Diferencias finitas (diferencia hacia adelante, centrada)
├── polinomios/    # Evaluación de polinomios (Horner)
└── root/          # [Legado] Paradigma descartado de expresión-string con mathjs
```

Cada archivo dentro de un subdirectorio implementa **un solo método** (un archivo = una función exportada principal), con el nombre del archivo en `kebab-case` coincidiendo con el nombre de la función exportada en `camelCase`.

### Consecuencias

**Positivas:**
- La ubicación de un método es predecible: un contribuidor que busca "bisección" sabe que está en `src/no-lineales/biseccion.js` sin consultar un índice.
- Las categorías corresponden exactamente a los capítulos estándar de los libros de métodos numéricos usados en la carrera (Burden & Faires, Chapra & Canale), reduciendo la curva de aprendizaje para estudiantes.
- Es fácil agregar una categoría nueva creando un subdirectorio, sin reestructurar lo existente.
- Los imports en los tests y en `src/index.js` son explícitos sobre de qué categoría viene cada método.

**Negativas / compromisos:**
- La clasificación de algunos métodos es ambigua: `ajuste_minimos_cuadrados.js` podría estar en `lineales/` (resuelve un sistema lineal internamente) o en `analisis/` (su propósito es análisis de datos). La decisión actual de ponerlo en `analisis/` prioriza el propósito sobre la implementación.
- El directorio `root/` (legado) rompe la coherencia semántica de la estructura: no es una categoría matemática sino un artefacto histórico. Mantenerlo documentado en este ADR es la forma de evitar que un contribuidor futuro lo confunda con código activo.
- A medida que el proyecto crezca, algunas categorías (especialmente `lineales/`) pueden volverse muy grandes. En ese punto se podría considerar una subdivisión adicional (por ejemplo, `lineales/directos/` y `lineales/iterativos/`), lo cual requeriría una actualización de este ADR.
