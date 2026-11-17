# Guía de migración entre versiones major

## Introducción

Este documento es una **plantilla viva** para documentar migraciones
entre versiones major de ChuspaNumeric (por ejemplo, de 1.x a 2.0). Su
propósito es definir el proceso y la estructura de una guía de
migración **antes** de que sea necesaria, para que cuando llegue
un cambio incompatible real, el equipo solo tenga que rellenar los
campos en lugar de diseñar el proceso desde cero.

> **Estado actual:** ChuspaNumeric está en versión `0.x`. Este documento
> describe el proceso para cuando se publique la versión `1.0` y
> eventualmente una versión `2.0` con breaking changes. Hasta entonces,
> este archivo sirve como referencia de proceso, no como guía activa.

---

## Cuándo crear una guía de migración

Crear una guía de migración es **obligatorio** cuando una nueva versión
incluye alguno de los siguientes cambios incompatibles (breaking changes):

* Cambio en el nombre de una función exportada públicamente.
* Cambio en los parámetros de entrada de una función (nombre, tipo u orden).
* Cambio en la estructura del objeto de retorno (campos renombrados, eliminados o con tipo distinto).
* Eliminación de una función que antes existía en la API pública.
* Cambio en el comportamiento por defecto de un parámetro opcional.
* Cambio en el tipo de error lanzado por una función.

Si el cambio es solo interno (refactorización sin cambio de API) o
agrega funcionalidad nueva sin romper la existente, **no se requiere**
guía de migración.

---

## Plantilla de guía de migración

Cuando llegue una versión 2.0 real, copiar esta sección y completarla:

---

### Migración de ChuspaNumeric `[VERSIÓN ANTERIOR]` a `[VERSIÓN NUEVA]`

**Fecha de publicación:** `[FECHA]`
**Versión anterior:** `[X.Y.Z]`
**Versión nueva:** `[X+1.0.0]`

#### Resumen de breaking changes

Lista breve de todos los cambios incompatibles incluidos en esta versión:

1. `[nombre de la función]` — `[descripción breve del cambio]`
2. `[nombre de la función]` — `[descripción breve del cambio]`
3. `[nombre del campo]` en el objeto de retorno — `[descripción breve]`

#### Tabla de antes/después por función afectada

| Función / Campo | Antes (v`[X.Y.Z]`) | Después (v`[X+1.0.0]`) | Motivo del cambio |
|---|---|---|---|
| `biseccion` | `biseccion(f, a, b, tol)` | `biseccion({ f, a, b, tolerancia })` | Consistencia con el resto de la API |
| `resultado.raiz` | `{ raiz: number }` | `{ resultado: number }` | Uniformidad con `crearResultado` |
| `ErrorRaiz` | clase exportada | eliminada, reemplazada por `ErrorConvergencia` | Simplificación de jerarquía de errores |

#### Instrucciones de migración paso a paso

Para cada breaking change, incluir:

**1. `[nombre del cambio]`**

*Antes:*
```js
// Código que funcionaba en la versión anterior
biseccion(x => x**2 - 4, 0, 3, 1e-6);
```

*Después:*
```js
// Código equivalente en la nueva versión
biseccion({ f: x => x**2 - 4, a: 0, b: 3, tolerancia: 1e-6 });
```

*Pasos:*
1. Busca todas las llamadas a `biseccion` en tu código.
2. Reemplaza los argumentos posicionales por un objeto con las claves `f`, `a`, `b`, `tolerancia`.
3. Verifica que el resultado sigue siendo correcto con tus tests.

---

#### Script de codemod (si aplica)

Si el volumen de cambios es grande, incluir un script de migración
automática basado en `jscodeshift` u otra herramienta:

```bash
# Instalar jscodeshift
npm install -g jscodeshift

# Ejecutar el codemod de migración
jscodeshift -t scripts/migrar-v2.js src/
```

> **Nota:** los codemods automáticos cubren los casos más comunes pero
> pueden no manejar todos los patrones de