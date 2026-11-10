# Exportación de resultados a Markdown

## Introducción

Este documento describe cómo exportar los resultados de los métodos
numéricos de ChuspaNumeric a formato Markdown, útil para incluir en entregas
académicas, Pull Requests o reportes técnicos.

> **Nota:** Al momento de escribir este documento, la función
> `exportarMarkdown` no está implementada en el código del proyecto.
> Este documento describe la propuesta de diseño para su futura
> implementación y muestra ejemplos del formato de salida esperado.

---

## ¿Para qué sirve exportarMarkdown?

Cuando resuelves un problema numérico con ChuspaNumeric, el resultado incluye
no solo el valor final sino también la tabla completa de iteraciones
(`resultado.iteraciones`). `exportarMarkdown` convierte esa información
en un reporte legible que puedes pegar directamente en:

* Un archivo `.md` de entrega académica.
* La descripción de un Pull Request en GitHub.
* Un documento de informe técnico.

---

## Uso básico (API propuesta)

```js
import { biseccion } from 'chuspanumeric/src/no-lineales/biseccion.js';
import { exportarMarkdown } from 'chuspanumeric/src/io/exportar_markdown.js';

// Resolver el problema
const resultado = biseccion({
    f: x => x**3 - 2*x - 5,
    a: 0,
    b: 3,
    tolerancia: 1e-6
});

// Exportar a Markdown
const reporte = exportarMarkdown(resultado, {
    titulo: 'Solución por Bisección',
    descripcion: 'Raíz de f(x) = x³ - 2x - 5 en el intervalo [0, 3]'
});

console.log(reporte);
// También puedes guardar en archivo:
// fs.writeFileSync('reporte.md', reporte);
```

---

## Ejemplo de reporte generado

El siguiente es un ejemplo del formato Markdown que `exportarMarkdown`
debe generar para el problema anterior:

```markdown
# Solución por Bisección

**Descripción:** Raíz de f(x) = x³ - 2x - 5 en el intervalo [0, 3]

## Resultado

| Campo | Valor |
|-------|-------|
| Resultado | 2.0945514815 |
| Convergió | ✅ Sí |
| Iteraciones | 20 |
| Mensaje | Convergió en 20 iteraciones. |

## Parámetros de entrada

| Parámetro | Valor |
|-----------|-------|
| a | 0 |
| b | 3 |
| tolerancia | 1e-6 |
| maxIter | 100 |

## Tabla de iteraciones

| n | a | b | c | f(c) | Error |
|---|---|---|---|------|-------|
| 1 | 0.000000 | 3.000000 | 1.500000 | -5.1250 | 1.5000e+0 |
| 2 | 1.500000 | 3.000000 | 2.250000 | 1.8906 | 7.5000e-1 |
| 3 | 1.500000 | 2.250000 | 1.875000 | -2.3965 | 3.7500e-1 |
| ... | ... | ... | ... | ... | ... |
| 20 | 2.094551 | 2.094552 | 2.094552 | -8.88e-16 | 4.77e-7 |
```

---

## Parámetros de exportarMarkdown

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `resultado` | `Object` | Objeto retornado por cualquier método de ChuspaNumeric (debe seguir el contrato de `crearResultado`). |
| `opciones.titulo` | `string` | Título del reporte. Por defecto usa `meta.metodo` del resultado. |
| `opciones.descripcion` | `string \| null` | Descripción opcional del problema resuelto. |
| `opciones.maxIteraciones` | `number` | Número máximo de filas a mostrar en la tabla (por defecto: todas). |

---

## Casos de uso típicos

### Entrega académica

```js
import { gaussSeidel } from 'chuspanumeric/src/lineales/gauss-seidel.js';
import { exportarMarkdown } from 'chuspanumeric/src/io/exportar_markdown.js';

const resultado = gaussSeidel({
    A: [[4, -1, 0], [-1, 4, -1], [0, -1, 4]],
    b: [1, 5, 0],
    tolerancia: 1e-8
});

const reporte = exportarMarkdown(resultado, {
    titulo: 'Tarea 3 — Método de Gauss-Seidel',
    descripcion: 'Sistema de 3 ecuaciones con matriz tridiagonal'
});

// Guardar en archivo para entregar
import { writeFileSync } from 'fs';
writeFileSync('tarea3.md', reporte);
```

### Reporte en Pull Request

Pega el contenido de `reporte` directamente en la descripción de tu
Pull Request en GitHub. Las tablas Markdown se renderizan
automáticamente en la interfaz de GitHub.

---

## Relación con otros exportadores

ChuspaNumeric prevé múltiples formatos de exportación para el mismo resultado:

| Función | Formato | Uso típico |
|---------|---------|-----------|
| `exportarMarkdown` | `.md` | Entregas académicas, PRs, reportes |
| `exportarJSON` | `.json` | Integración con otras aplicaciones |
| `exportarCSV` | `.csv` | Análisis en hojas de cálculo |

Todos reciben el mismo objeto `resultado` como primer argumento,
lo que permite cambiar el formato de exportación con mínimos cambios
en el código.

---

## Referencias

* `docs/api.md` — referencia de los métodos disponibles.
* `docs/casos-de-uso-avanzados.md` — ejemplos end-to-end que incluyen
  exportación de resultados.
* `src/core/contrato.js` — definición del contrato de resultado que
  todos los métodos devuelven.