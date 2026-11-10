# Preguntas Frecuentes (FAQ) - ChuspaNumeric

## ¿Qué es ChuspaNumeric?

ChuspaNumeric es una librería de métodos numéricos en JavaScript diseñada para resolver problemas matemáticos mediante métodos de aproximación. Está pensada para estudiantes, ingenieros y profesionales que necesitan realizar cálculos numéricos sin tener que implementar los algoritmos desde cero.

## ¿Qué métodos numéricos están disponibles?

ChuspaNumeric actualmente incluye los siguientes métodos:

- **Sistemas de ecuaciones lineales:** Eliminación de Gauss, Gauss-Jordan, Descomposición LU, Jacobi, Gauss-Seidel
- **Sistemas de ecuaciones no lineales:** Bisección, Secante, Newton-Raphson, Falsa Posición, Punto Fijo
- **Interpolación:** Lagrange, Newton
- **Integración numérica:** Regla del Trapecio, Simpson (1/3 y 3/8), Cuadratura de Gauss

> **Nota:** La librería está en desarrollo activo y se irán agregando más métodos.

## ¿Cómo instalo e integro ChuspaNumeric en mi proyecto?

```bash
git clone https://github.com/sis-inf/ChuspaNumeric.git
cd ChuspaNumeric
npm install
```

## Preguntas Frecuentes sobre JavaScript y Node.js

## ¿Cuál es la diferencia entre `import` y `require` en ChuspaNumeric?

`import` pertenece al sistema de módulos ES (ESM) y `require` al sistema CommonJS.

Ejemplo con ESM:

```js
import { suma } from "./suma.js";
```

Ejemplo con CommonJS:

```js
const { suma } = require("./suma");
```

---

## ¿Por qué Jest no encuentra mi test?

Verifica que el archivo siga alguno de los patrones reconocidos por Jest:

```text
archivo.test.js
archivo.spec.js
```

También puedes ejecutar:

```bash
npm test
```

para ver los detalles del error.

---

## ¿Cómo ejecuto solo un test específico con Jest?

Puedes usar la opción `-t`:

```bash
npx jest -t "nombre del test"
```

O marcar un test con `.only`:

```js
test.only("mi prueba", () => {
  // código
});
```

---

## ¿Puedo usar ChuspaNumeric en el navegador?

ChuspaNumeric está diseñado principalmente para ejecutarse en Node.js. Si deseas utilizarlo en un navegador, revisa primero la documentación del proyecto y verifica que las dependencias sean compatibles.

---

## ¿Cómo interpreto el reporte de cobertura?

Genera el reporte ejecutando:

```bash
npm test -- --coverage
```

Los porcentajes indican cuánto código fue ejecutado por los tests:

- Statements: instrucciones ejecutadas.
- Branches: ramas cubiertas.
- Functions: funciones probadas.
- Lines: líneas ejecutadas.

---

## ¿Qué hace `npm run build`?

Ejecuta el script `build` definido en el archivo `package.json`.

Por ejemplo:

```bash
npm run build
```

Normalmente se utiliza para generar una versión lista para producción.

---

## ¿Por qué Prettier cambió mi código?

Prettier aplica reglas automáticas de formato para mantener un estilo consistente.

Puedes ejecutarlo manualmente con:

```bash
npx prettier --write .
```

---

## ¿Cómo instalo nuevamente las dependencias del proyecto?

Si existe algún problema con los paquetes, elimina `node_modules` e instala nuevamente:

```bash
rm -rf node_modules
npm install
```

En Windows:

```powershell
rmdir /s node_modules
npm install
```
