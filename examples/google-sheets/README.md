# ChuspaNumeric en Google Sheets — Funciones personalizadas

Este directorio contiene un script de Google Apps Script que permite usar métodos numéricos de ChuspaNumeric directamente como funciones de hoja de cálculo en Google Sheets.

## Funciones disponibles

| Función en Sheets | Método de ChuspaNumeric | Descripción |
|---|---|---|
| `=CHUSPANUMERIC_BISECCION(func, a, b)` | `biseccion` | Raíz de f en [a, b] |
| `=CHUSPANUMERIC_NEWTON(func, x0)` | `newtonRaphson` | Raíz de f a partir de x0 |
| `=CHUSPANUMERIC_TRAPECIO(func, a, b, n)` | `trapecio` | Integral de f en [a, b] con n subintervalos |
| `=CHUSPANUMERIC_BISECCION_ITERS(func, a, b)` | `biseccion` | Número de iteraciones usadas |
| `=CHUSPANUMERIC_LISTA_FUNCIONES()` | — | Lista las funciones matemáticas disponibles |

---

## Instalación paso a paso

### 1. Abrir el editor de Apps Script

1. Abre tu hoja de cálculo en [Google Sheets](https://sheets.google.com).
2. Ve a **Extensiones** → **Apps Script**.
3. Se abrirá el editor de código en una pestaña nueva.

### 2. Pegar el script

1. Borra todo el contenido que haya en el editor (generalmente `function myFunction() {}`).
2. Copia el contenido de `funciones-personalizadas.gs` de este directorio.
3. Pega todo el contenido en el editor.
4. Haz clic en **Guardar** (ícono de disquete o `Ctrl+S`).

### 3. Autorizar el script

La primera vez que uses una función `CHUSPANUMERIC_*`, Google pedirá autorización:

1. Aparecerá un mensaje en la celda: *"Se está calculando..."* seguido de un diálogo de autorización.
2. Haz clic en **Revisar permisos**.
3. Selecciona tu cuenta de Google.
4. Si aparece "Google no ha verificado esta aplicación", haz clic en **Avanzado** → **Ir a [nombre del proyecto] (no seguro)**.
5. Haz clic en **Permitir**.

> ⚠️ El aviso de "aplicación no verificada" es normal para scripts propios — significa que tu script no ha pasado por el proceso de verificación de Google (solo necesario para add-ins publicados en el Marketplace). Un script en tu propia hoja de cálculo es de tu propiedad y puedes confiar en él.

### 4. Usar las funciones

Ahora puedes usar las funciones en cualquier celda:

```
=CHUSPANUMERIC_BISECCION("x2_menos_4", 0, 3)
```

---

## Ejemplos de uso

### Encontrar raíces

```
# Raíz de x² - 4 en [0, 3] → resultado: 2
=CHUSPANUMERIC_BISECCION("x2_menos_4", 0, 3)

# Raíz de x³ - 2x - 5 en [2, 3] → resultado: ≈ 2.0946
=CHUSPANUMERIC_BISECCION("x3_menos_2x_menos_5", 2, 3)

# Raíz de cos(x) - x con punto inicial 1 → resultado: ≈ 0.7391
=CHUSPANUMERIC_NEWTON("cos_menos_x", 1)

# Usando ID numérico en lugar del nombre
=CHUSPANUMERIC_BISECCION(1, 0, 3)    → raíz de x² - 4

# Con tolerancia personalizada
=CHUSPANUMERIC_BISECCION("x2_menos_4", 0, 3, 0.0001)
```

### Integración numérica

```
# ∫₀¹ x² dx = 1/3 ≈ 0.3333
=CHUSPANUMERIC_TRAPECIO("x2", 0, 1, 100)

# ∫₀^π sin(x) dx = 2
=CHUSPANUMERIC_TRAPECIO("sin_x", 0, 3.14159, 200)
```

### Ver cuántas iteraciones usó bisección

```
=CHUSPANUMERIC_BISECCION_ITERS("x2_menos_4", 0, 3, 0.000001)
```

### Ver qué funciones están disponibles

```
=CHUSPANUMERIC_LISTA_FUNCIONES()
```

---

## Funciones matemáticas disponibles

El catálogo incluye las siguientes funciones. Úsalas por nombre (string) o por ID (número):

| ID | Nombre | Función | Raíz(es) conocida(s) |
|---|---|---|---|
| 1 | `x2_menos_4` | x² - 4 | ±2 |
| 2 | `x3_menos_2x_menos_5` | x³ - 2x - 5 | ≈ 2.0946 |
| 3 | `cos_menos_x` | cos(x) - x | ≈ 0.7391 |
| 4 | `sin_x` | sin(x) | 0, π, 2π, ... |
| 5 | `exp_x_menos_2` | eˣ - 2 | ln(2) ≈ 0.6931 |
| — | `x2` | x² | — (para integración) |
| — | `log_x` | ln(x) | 1 |
| — | `exp_menos_x` | e⁻ˣ | — (para integración) |

Para ver la lista completa desde la hoja: `=CHUSPANUMERIC_LISTA_FUNCIONES()`

### Agregar una función nueva

Edita el objeto `CATALOGO` en el script y agrega una entrada:

```js
var CATALOGO = {
  // ... funciones existentes ...
  'mi_funcion': function(x) { return x * x * x - x - 2; }, // x³ - x - 2
};
```

Luego puedes usar `=CHUSPANUMERIC_BISECCION("mi_funcion", 1, 2)` inmediatamente.

---

## Limitaciones de Google Apps Script

Estas son las limitaciones técnicas que afectan la integración de ChuspaNumeric con Google Sheets:

### 1. Sin soporte para módulos ES ni npm

Apps Script ejecuta JavaScript en el servidor de Google usando el motor V8, pero **no soporta `import`/`export` ni el ecosistema de paquetes npm**. No es posible hacer `import { biseccion } from 'chuspanumeric'` directamente.

**Consecuencia**: las implementaciones de los métodos numéricos están copiadas directamente en `funciones-personalizadas.gs` como código standalone. Si la librería ChuspaNumeric se actualiza, este script debe actualizarse manualmente.

**Alternativa avanzada**: publicar un Apps Script Web App separado que use Node.js con ChuspaNumeric instalado y exponga los métodos como endpoints HTTP. El script de Sheets llamaría a ese endpoint vía `UrlFetchApp.fetch()`. Esto requiere un servidor propio o un despliegue en Cloud Run/App Engine.

### 2. Sin `eval()` dinámico para expresiones matemáticas

Apps Script tiene `eval()` disponible, pero las [políticas de seguridad de funciones personalizadas](https://developers.google.com/apps-script/guides/sheets/functions#using_apps_script_services) desaconsejan su uso con input del usuario por riesgo de inyección de código.

**Consecuencia**: las funciones matemáticas deben estar predefinidas en el catálogo `CATALOGO` del script, no pueden escribirse directamente como `"x^2 - 4"` en la celda.

### 3. Timeout de ejecución

Las funciones personalizadas de Google Sheets tienen un límite de **30 segundos** de ejecución. Métodos con muchas iteraciones (ej. bisección con tolerancia `1e-15`, o trapecio con `n = 1,000,000`) pueden alcanzar este límite.

**Recomendación**: usar tolerancias de `1e-6` a `1e-10` y `n ≤ 10,000` para integración.

### 4. Sin acceso a otras hojas o variables globales entre llamadas

Cada invocación de una función personalizada es independiente — no puede leer el estado de invocaciones anteriores ni compartir datos entre celdas de forma persistente (solo puede leer los argumentos que se le pasan).

### 5. Cuotas de ejecución

Las cuentas gratuitas de Google tienen un límite de 6 minutos de tiempo de ejecución de scripts por día. Cuentas de Google Workspace tienen límites más generosos.

---

## Comparación con la versión npm de ChuspaNumeric

| Característica | ChuspaNumeric (npm / Node.js) | Este script (Apps Script) |
|---|---|---|
| Instalación | `npm install chuspanumeric` | Copiar y pegar en Apps Script |
| Uso | `import { biseccion } from 'chuspanumeric'` | `=CHUSPANUMERIC_BISECCION(...)` en celda |
| Funciones disponibles | Todas (20+ métodos) | Las del catálogo (ampliable) |
| Agregar función matemática | Pasar función JS | Editar `CATALOGO` en el script |
| Actualización | `npm update chuspanumeric` | Actualización manual del script |
| Rendimiento | Proceso local | Servidor de Google (30s timeout) |
| Visualización | Terminal / código | Directamente en celdas y gráficas |

---

## Recursos adicionales

- [Documentación de funciones personalizadas de Apps Script](https://developers.google.com/apps-script/guides/sheets/functions)
- [Repositorio de ChuspaNumeric](https://github.com/sis-inf/chuspanumeric)
- [Ejemplo de bisección en Observable](../observable/ejemplo-biseccion.md)