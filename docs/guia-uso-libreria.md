# Guía de uso de ChuspaNumeric como dependencia

## Introducción

ChuspaNumeric es una librería para métodos numéricos implementada en JavaScript. Proporciona funciones para integración numérica, interpolación, sistemas lineales y métodos no lineales.

Esta guía explica cómo instalar y utilizar la librería en proyectos Node.js y en el navegador.

---

## Instalación

### Opción 1: Instalar mediante npm

```bash
npm install ChuspaNumeric
```

### Opción 2: Clonar el repositorio

```bash
git clone https://github.com/sis-inf/ChuspaNumeric.git
cd ChuspaNumeric
npm install
```

---

## Uso en Node.js (ES Modules)

Si tu proyecto utiliza módulos ES (ESM), puedes importar los métodos directamente:

```js
import { newtonRaphson } from "ChuspaNumeric";

const f = x => x * x - 2;
const df = x => 2 * x;

const raiz = newtonRaphson(
  f,
  df,
  1,
  1e-6,
  100
);

console.log(raiz);
```

Asegúrate de que tu archivo `package.json` incluya:

```json
{
  "type": "module"
}
```

---

## Uso en Node.js (CommonJS)

Si utilizas CommonJS, puedes importar la librería mediante `require`.

```js
const { newtonRaphson } = require("ChuspaNumeric");

const f = x => x * x - 2;
const df = x => 2 * x;

const raiz = newtonRaphson(
  f,
  df,
  1,
  1e-6,
  100
);

console.log(raiz);
```

---

## Uso en navegador

También es posible utilizar ChuspaNumeric directamente desde un navegador mediante módulos JavaScript.

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Ejemplo ChuspaNumeric</title>
</head>
<body>

<script type="module">
  import { newtonRaphson } from "./ChuspaNumeric.js";

  const f = x => x * x - 2;
  const df = x => 2 * x;

  const raiz = newtonRaphson(
    f,
    df,
    1,
    1e-6,
    100
  );

  console.log(raiz);
</script>

</body>
</html>
```

---

## Ejemplo completo de proyecto

El siguiente ejemplo utiliza el método de Newton-Raphson para aproximar la raíz de la ecuación:

```text
x² - 2 = 0
```

```js
import { newtonRaphson } from "ChuspaNumeric";

const f = x => x * x - 2;
const df = x => 2 * x;

const tolerancia = 1e-6;
const maxIteraciones = 100;
const aproximacionInicial = 1;

const resultado = newtonRaphson(
  f,
  df,
  aproximacionInicial,
  tolerancia,
  maxIteraciones
);

console.log("Raíz aproximada:");
console.log(resultado);
```

Este programa calcula una aproximación numérica de la raíz cuadrada de 2 utilizando el método de Newton-Raphson.

---

## Métodos disponibles

Actualmente la librería exporta los siguientes métodos:

- `derivative`
- `simpson13`
- `simpson38`
- `lagrange`
- `linearInterpolation`
- `gauss`
- `jacobi`
- `det2x2`
- `det3x3`
- `polyEval`
- `newtonRaphson`
- `biseccion`

---

## Recomendaciones

- Verificar que la versión de Node.js sea compatible con módulos ES.
- Utilizar ESM para nuevos proyectos cuando sea posible.
- Revisar la documentación de cada método antes de utilizarlo en producción.
- Validar los parámetros de entrada para obtener resultados correctos.
