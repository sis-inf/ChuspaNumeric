# Cómo contribuir a este proyecto

Gracias por tu interés en contribuir. Este proyecto usa
el **Forking Workflow**. Lee este documento antes de empezar.

---

## Flujo de trabajo

### 1. Haz fork del repositorio
Botón **Fork** en la esquina superior derecha de GitHub.

Asegúrate que el **owner** sea tu cuenta de GithHub, luego click al botón de color verde: "**Create Fork**".
Ahora deberías tener un repositorio en tu **cuenta personal** de GitHub llamado **tu_nombre_usuario/nombre_repositorio**. 

*Ejemplo.-* **Atoxny/ChuspaNumeric**

### 2. Clona tu fork
Desde el apartado **Code** del repositorio en tu cuenta personal realiza la clonación con los siguientes pasos:
1.   Click al botón de color verde **"<> Code"**.
2.   Selecciona Local -> HTTPS.
3.   Copia la URL.
4.   Desde tu computadora (portátil o de escritorio), en la carpeta donde quieres clonar el repositorio, abre la terminal de GitBash haciendo click derecho dentro la carpeta.
5.   En la terminal de GitBash escribe los siguientes comandos:

```bash
# Clonar el repositorio
# Recuerda PEGAR la URL que copiaste en lugar del URL de ejemplo :D
git clone https://github.com/TU-USUARIO/ChuspaNumeric.git

# Moverte dentro la carpeta donde se clonó el repositorio
cd ChuspaNumeric
```

### 3. Agrega el repo original como upstream
Para estar al tanto de las modificaciones que se realicen en el **repositorio original (sis-inf/ChuspaNumeric)** debes agregar el repositorio original como un upstream de la siguiente manera en la terminal de GitBash, puedes **copiar** el siguiente comando:

```bash
git remote add upstream https://github.com/sis-inf/ChuspaNumeric.git
```
Revisa si se agregó de manera exitosa el repositorio como upstream.

```bash
git remote -v
# Deberia salirte como resultado, luego de ingresar ese comando, lo siguiente:
origin https://github.com/TU-USUARIO/ChuspaNumeric.git (fetch)
origin https://github.com/TU-USUARIO/ChuspaNumeric.git (push)
upstream https://github.com/sis-inf/ChuspaNumeric.git (fetch)
upstream https://github.com/sis-inf/ChuspaNumeric.git (push)
```
Asegúrate de que te aparezca en **origin** tu nombre de usuario en el apartado ***TU-USUARIO***, mientras que en **upstream** el nombre de ***sis-inf***. 

En caso de existir algún error revisar el apartado [Errores comunes](#errores-comunes).

### 4. Sincroniza antes de trabajar
**Realiza** este paso **SIEMPRE ANTES** de empezar a trabajar en un nuevo Issue para tener tu repositorio al dia :D

```bash
# Moverte a la rama dev
git checkout dev
# Trae los cambios del repositorio original a tu repositorio local
git pull upstream dev
```

### 5. Crea tu rama de trabajo
Recuerda trabajar con ramas. El nombre de la rama que debes utilizar para tu Issue esta siempre en la descripcion del mismo, ya sea en el apartado **"Rama sugerida"** o simplemente **"Rama"**.

***tipo/descripcion-corta = el nombre de la Rama sugerida***

```bash
# Crear y moverte a la rama que crearás
git checkout -b tipo/descripcion-corta
```


Ejemplos de nombres de rama:

feat/endpoint-metricas-cpu
docs/readme-instalacion
fix/calculo-ram-incorrecto
test/pruebas-unitarias-cpu
chore/configurar-github-actions
security/analisis-dependencias

### 6. Trabaja y haz commits pequeños
*"Un cambio, un commit".*

Trabajar con commits permite tener "Checkpoints" y mantener un historial del trabajo que haz realizado. Normalmente llevan una descripcion corta tal y como se muestra en el ejemplo de abajo. 

La descripcion del commit debe ser de forma imperativa y concisa: *"docs: actualizar guía de instalación", "fix: corregir error en validación de usuario"*, entre otros.

El commit debe responder a la pregunta: *"¿Qué hace este cambio?"*

```bash
git add .
git commit -m "tipo: descripción corta en presente"
```
Para saber de que *tipo* debes realizar el commit revisa el apartado de [convención de commits](#convención-de-commits).

### 7. Antes de hacer commit

Antes de realizar un commit, asegúrate de ejecutar los siguientes comandos para verificar que el código cumple con los estándares del proyecto:

```bash
npm test
npm run format:check
npm run lint
```
Los hooks de pre-commit se instalan automáticamente al ejecutar:
```bash 
npm install
```

gracias al script `prepare` de npm.

Antes de cada commit, el hook de pre-commit ejecutará automáticamente `eslint --fix` y `prettier --write` sobre los archivos preparados (*staged*). Si encuentra errores que no puedan corregirse automáticamente, el commit se detendrá para que puedas revisarlos.
---
### 8. Sube tu rama a tu fork

***tipo/descripcion-corta = el nombre de la rama donde trabajaste.***

```bash
git push origin tipo/descripcion-corta
```

### 9. Abre un Pull Request
1. Ve a tu Fork en GitHub, aquel repositorio que está en tu cuenta personal.
2. Click en el banner de color amarillo: "Compare & pull request"
   En caso de que no aparezca: 
     * Dirígete a la pestaña `Pull Requests`-> `New Pull Request`
3. Verifica el  destino del PR
   - Base repository: `sis-inf/ChuspaNumeric` → base `dev`
   - Head repository: `TU-USUARIO/ChuspaNumeric` → compare `tu-rama`
4. Edita la descripción y el título del PR según los cambios que hayas realizado sin olvidarte de agregar al `Closes #` el numero del Issue que realizaste.
---

## Contrato de retorno de los métodos numéricos

Todo método numérico del proyecto debe devolver su resultado con la **misma estructura**. Así, cualquier archivo, prueba o herramienta (CLI, exportación) puede leer los resultados sin conocer los detalles de cada método.

Para lograrlo, usa las dos funciones de `src/core/contrato.js`:

| Función | Qué hace |
|---|---|
| `crearResultado({ ... })` | Construye el objeto de resultado uniforme |
| `medirTiempo(fn)` | Ejecuta `fn` y devuelve `{ valor, tiempo_ms }` |

> ⚠️ **Es obligatorio** para todo método numérico nuevo: debe retornar con `crearResultado` y medir su tiempo con `medirTiempo`. No retornes números, arreglos u objetos con una estructura propia.

### Estructura del objeto devuelto

| Campo | Tipo | Descripción |
|---|---|---|
| `resultado` | `number`, `Array` o `null` | Valor calculado por el método |
| `iteraciones` | `Array` (por defecto `[]`) | Detalle de cada paso del método |
| `convergio` | `boolean` (por defecto `false`) | Indica si el método alcanzó su criterio de parada |
| `mensaje` | `string` (por defecto `""`) | Descripción legible del resultado |
| `meta.metodo` | `string` | Nombre del método (ej. `"trapecio"`) |
| `meta.parametros` | `Object` | Parámetros con los que se ejecutó el método |
| `meta.tiempo_ms` | `number` | Tiempo de ejecución en milisegundos (lo entrega `medirTiempo`) |
| `warnings` | `string[]` (opcional) | Advertencias no bloqueantes. Solo aparece si hay alguna |

### Ejemplo mínimo

Versión simplificada de `src/integracion/trapecio.js`, que sigue el contrato completo:

```js
import { crearResultado, medirTiempo } from "../core/contrato.js";

function trapecio({ f, a, b, n = 100 }) {
  // 1. Validaciones (validarFuncion, validarIntervalo, ...)

  // 2. Cálculo, medido con medirTiempo
  const { valor, tiempo_ms } = medirTiempo(() => {
    // ... calcular `resultado` e `iteraciones` ...
    return { resultado, iteraciones };
  });

  // 3. Retornar usando el contrato de Trazo
  return crearResultado({
    resultado: valor.resultado,
    iteraciones: valor.iteraciones,
    convergio: true,
    mensaje: `Integración por regla del trapecio con ${n} subintervalos.`,
    meta: {
      metodo: "trapecio",
      parametros: { f, a, b, n },
      tiempo_ms,
    },
  });
}
```

Puntos clave:
- Importa ambas funciones desde `core/contrato.js` (ajusta la ruta relativa según la carpeta de tu método).
- Envuelve **solo el cálculo** en `medirTiempo` y pasa el `tiempo_ms` obtenido a `meta`.
- Siempre llena `meta.metodo` y `meta.parametros`.
- Retorna **siempre** con `crearResultado`, nunca una estructura distinta.

---

## Convención de commits

| Tipo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de error |
| `docs:` | Documentación |
| `test:` | Pruebas |
| `chore:` | Configuración o CI/CD |
| `refactor:` | Mejora sin cambiar comportamiento |
| `security:` | Mejora de seguridad |
| `data:` | Análisis de datos |

### Ejemplos

feat: agregar endpoint /metrics para CPU
fix: corregir cálculo de porcentaje de RAM
docs: agregar guía de instalación en Windows
test: agregar pruebas unitarias para módulo de disco
chore: configurar GitHub Actions para CI


## Nomenclatura de directorios y archivos

Este proyecto usa español como idioma estándar para la estructura de carpetas. Crear directorios con nombres en inglés (como integration, linearAlgebra o math) es un error frecuente que será rechazado en el PR.

### Convención para nombres de archivos en `src/`

Al crear un archivo nuevo dentro de `src/`, usa **kebab-case**: escribe el nombre en minúsculas y separa las palabras con guiones medios (`-`).

Ejemplos:

- ✅ `punto-fijo.js`
- ✅ `gauss-seidel.js`
- ❌ `punto_fijo.js`
- ❌ `gaussSeidel.js`

Antes de agregar un método nuevo, revisa si ya existe una implementación en `src/`. Busca también nombres parecidos o escritos con otra convención. Si el método ya existe, trabaja sobre ese archivo en lugar de crear otro duplicado.

Esta regla se aplica únicamente a los nombres de archivo. Las funciones y los parámetros deben seguir usando **camelCase**, como se explica en `docs/convenciones-nombres-funciones.md`.

No es necesario renombrar los archivos existentes que todavía usan guion bajo; esos casos pueden corregirse por separado.

**Directorios canónicos bajo src/**

| Directorio | Contenido |
|---|---|
| `src/analisis/` | Métodos de análisis numérico y ajuste de datos |
| `src/cli/` | Interfaz de línea de comandos y herramientas CLI |
| `src/core/` | Componentes base, contrato de resultados y errores compartidos |
| `src/diferencias/` | Métodos de derivación numérica |
| `src/edo/` | Métodos para ecuaciones diferenciales ordinarias |
| `src/integracion/` | Métodos de integración numérica |
| `src/interpolacion/` | Métodos de interpolación |
| `src/io/` | Exportación y manejo de entrada/salida de datos |
| `src/lineales/` | Métodos para sistemas de ecuaciones lineales |
| `src/matricial/` | Operaciones y métodos de álgebra matricial |
| `src/no-lineales/` | Métodos para encontrar raíces de ecuaciones no lineales |
| `src/polinomios/` | Métodos y operaciones con polinomios |
| `src/utils/` | Utilidades y validaciones compartidas |


## Reglas importantes

- ❌ Nunca hagas push directo a `main` o `dev`
- ❌ Nunca trabajes directamente en `main` o `dev`
- ✅ Un issue = una rama = un PR
- ✅ Todo PR debe referenciar su issue con `Closes #N`
- ✅ El PR debe pasar el CI antes de ser mergeado
- ✅ Todo PR necesita al menos una revisión

---
## Ramas del proyecto

| Rama | Propósito |
|---|---|
| `main` | Versión estable — solo recibe merges desde `dev` |
| `dev` | Rama de desarrollo principal |
| `feat/*` | Nuevas funcionalidades |
| `fix/*` | Correcciones |
| `docs/*` | Documentación |
| `test/*` | Pruebas |
| `chore/*` | Configuración |


### Ejemplos 

✅ Correcto              ❌ Incorrecto
src/lineales/            src/linearAlgebra/
src/no-lineales/         src/nonLinear/
src/interpolacion/       src/interpolation/
src/integracion/         src/integration/
src/utils/               src/helpers/

---

## ¿No sabes por dónde empezar?

1. Revisa los issues abiertos con la etiqueta `good first issue`
2. Comenta en el issue que quieres trabajarlo
3. Espera confirmación antes de empezar
4. Sigue los pasos de este documento

## Errores comunes

**1. Crear directorios con nombres en inglés**

**Problema:** Se crea una carpeta como src/integration/, src/linearAlgebra/ o src/math/.
**Solucion:** Usa siempre los nombres en español definidos en la sección Nomenclatura de directorios y archivos.

 ✅ src/integracion/
 ❌ src/integration/

**2. Hacer push directo a main o dev**

**Problema:** Se abre un Pull Request sin vincular el issue correspondiente, lo que dificulta el seguimiento del proyecto
**Solucion:** Siempre incluye Closes #N en la descripción del PR, donde N es el número del issue que resolviste.

  ✅ Closes #153

  **3. No sincronizar con upstream antes de empezar**

  **Problema:** Se trabaja sobre una versión desactualizada del repositorio, lo que genera conflictos al abrir el PR.
  **Solucion:** Ejecuta siempre estos comandos antes de crear tu rama de trabajo.

    git checkout dev
    git pull upstream dev

**4. Nombre de rama incorrecto**
  
  **Problema:** Se usa un nombre de rama que no sigue la convención del proyecto (ej: mi-rama, cambios, arreglo).
  **Solucion:** El nombre de la rama siempre está indicado en el issue. Sigue el formato tipo/descripcion-corta.

  ✅ feat/metodo-jacobi
  ✅ fix/error-pivote-nulo
  ✅ docs/guia-instalacion
  ❌ mi-rama
  ❌ cambios 
---

## Idioma del proyecto

El **español** es el idioma oficial del proyecto. Tras la consolidación de directorios, todo el contenido nuevo o modificado debe escribirse en español, salvo las palabras reservadas propias del lenguaje de programación.

Esto aplica a:
- **Nombres de archivos:** Deben estar redactados en español (ej. `metodo_jacobi.py`).
- **Nombres de funciones y métodos:** En español y de carácter descriptivo (ej. `calcularErrorRelativo()`).
- **Nombres de variables:** En español, utilizando rigurosamente la convención **camelCase** (ej. `errorTolerancia`, `matrizIdentidad`).
- **Documentación y comentarios:** Todo comentario dentro del código fuente y guías técnicas en Markdown deben redactarse exclusivamente en español.
- **Mensajes de error:** En español, garantizando que sean claros y comprensibles para todo el equipo de desarrollo.

### Ejemplos de nomenclatura

| Elemento | ❌ Incorrecto (Inglés / Mezclado) |  Correcto (Español oficial) |
| :--- | :--- | :--- |
| **Archivo** | `bisectionMethod.py` | `src/lineales/jacobi.js` |
| **Función** | `public void getConvergence()` | `public void obtenerConvergencia()` |
| **Variable** | `double max_error;` / `int iterCount;` | `double errorMaximo;` / `int contadorIteraciones;` |
| **Comentario** | `// Check if matrix is diagonally dominant` | `// Verificar si la matriz es diagonalmente dominante` |
| **Mensaje de Error** | `"Matrix is singular"` | `"Error: La matriz es singular y no tiene solución única"` |