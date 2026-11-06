# Flujo de trabajo con Git para ChuspaNumeric

## Introducción

Este documento describe el flujo de trabajo estándar para contribuir al proyecto ChuspaNumeric usando Git.

## Estructura de ramas

- `main` - Rama principal y estable. Contiene la versión en producción.
- `dev` - Rama de desarrollo. Integración de features antes de pasar a main.
- `feat/*` - Ramas para nuevas funcionalidades (ej: `feat/convergence-checker`)
- `fix/*` - Ramas para corrección de errores (ej: `fix/newton-bug`)
- `docs/*` - Ramas para documentación (ej: `docs/faq`)
- `test/*` - Ramas para pruebas (ej: `test/vitest-setup`)
- `chore/*` - Ramas para tareas de configuración (ej: `chore/github-actions-js`)

## Flujo de trabajo paso a paso

### 1. Mantener el fork actualizado 

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Verificación obligatoria antes del Commit / PR

Antes de realizar tu commit y abrir un Pull Request hacia la rama `dev`, es obligatorio ejecutar localmente los siguientes comandos en el orden de los pasos indicado para asegurar la calidad del código:

Paso 1. **`npm run lint`**
   - **Propósito:**  Revisa el estilo del código y busca errores estáticos.
   - **Si falla:**  Ejecuta `npm run lint:fix` para corregir errores automáticos o arregla manualmente los archivos indicados en la terminal.

Paso 2. **`npm run format:check`**
   - **Propósito:**  Verifica que el formato cumpla con las reglas del proyecto.
   - **Si falla:**  Ejecuta el comando de formateo correspondiente (ej. `npm run format`) antes de reintentar.

Paso 3. **`npm test`**
   - **Propósito:**  Ejecuta las pruebas unitarias.
   - **Si falla:**  Revisa los reportes de error en la consola y corrige la lógica de tu código o de los tests antes de continuar.

Paso 4. **`npm run test:cov`**
   - **Propósito:**  Genera y verifica el reporte de cobertura de pruebas.
   - **Si falla:**  Asegúrate de escribir las pruebas necesarias para cubrir las nuevas líneas de código implementadas.

>  ***Importante:*** Si cualquiera de estos pasos falla, debes resolver el problema antes de proceder con el commit o el push.
---

## Ubicación de nuevos archivos

Al crear nuevos métodos, asegúrate de colocarlos en los directorios correctos según su categoría:

- Métodos de ecuaciones no lineales:
  src/no-lineales/metodo.js

- Métodos de integración numérica:
   src/integracion/metodo.js

- Métodos de sistemas de ecuaciones lineales:
   src/lineales/metodo.js

>  ***Importante:*** No utilizar rutas antiguas como src/root/, src/integration/ o src/linearAlgebra/.
---
