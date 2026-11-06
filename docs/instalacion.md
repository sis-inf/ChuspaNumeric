# Guía de instalación de ChuspaNumeric

## Descripción

ChuspaNumeric es una librería de métodos numéricos.

---

## Requisitos previos

Antes de utilizar la librería, asegúrese de tener instalado:

- Node.js 18 o superior
- npm 9 o superior
- Git

Verificar instalación:
### Instalar Node.js con nvm (recomendado)

Se recomienda utilizar nvm (Node Version Manager) para administrar versiones de Node.js.

```bash
nvm install 20
nvm use 20

```bash
node --version
npm --version
git --version
```

---

## Clonar el repositorio

Ejecute el siguiente comando en la terminal:

```bash
git clone https://github.com/sis-inf/ChuspaNumeric.git
```

Luego ingrese al proyecto:

```bash
cd ChuspaNumeric
```
---

## Instalar dependencias

Instale las dependencias del proyecto:

```bash
npm install
```
---
### Dependencias para contribuidores

Para instalar herramientas de desarrollo adicionales:

```bash
npm install --save-dev
```
---

## Uso de la librería en un proyecto

Puede importar las funciones de la librería desde la carpeta `src`.

Ejemplo:

```javascript
import { simpson } from "./src/integration/simpson.js";
```

---

## Ejemplo mínimo de uso

```javascript
import { simpson } from "./src/integration/simpson.js";

function f(x) {
    return x * x;
}

const resultado = simpson(f, 0, 2, 4);

console.log(resultado);
```

Salida esperada:

```javascript
{
  value: 2.6666666666666665,
  errorEstimate: 0.00390625
}
```

---

## Ejecutar el proyecto

Para ejecutar pruebas o scripts del proyecto:

```bash
npm test
```