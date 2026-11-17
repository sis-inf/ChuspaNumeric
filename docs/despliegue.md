
# Guía de Despliegue

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- Node.js versión 16 o superior.
- npm instalado.
- Git instalado para trabajar desde el repositorio.

Verificar:

```bash
node -v
npm -v
git --version
```

---

## Entorno local: instalación desde el código fuente

Esta opción permite descargar el repositorio, instalar sus dependencias y ejecutar las pruebas de desarrollo. No requiere que el paquete esté publicado en npm.

1. Clonar el repositorio oficial:

```bash
git clone https://github.com/sis-inf/ChuspaNumeric.git
cd ChuspaNumeric
```

2. Instalar las dependencias:

```bash
npm install
```

3. Ejecutar las pruebas:

```bash
npm test
```

4. Generar el build de distribución:

```bash
npm run build
```

El comando `build` está definido en `package.json` y utiliza Rollup. Los archivos de distribución se generan según la configuración del proyecto.

La instalación desde el código fuente es independiente de la publicación del paquete en el registro de npm.

---

## Uso en otro proyecto: consumo como dependencia npm

El identificador del paquete declarado en `package.json` es `chuspanumeric`.

Si existe una versión publicada y disponible en el registro de npm, se puede instalar en otro proyecto mediante:

```bash
npm install chuspanumeric
```

Este comando requiere que el paquete esté disponible en el registro configurado de npm. La presencia de un nombre y una versión en `package.json` no confirma que exista una publicación.

Antes de utilizarlo como dependencia, verificar su disponibilidad:

```bash
npm view chuspanumeric version
```

Si el paquete no está publicado, debe utilizarse la instalación desde el código fuente o esperar a que se complete una publicación autorizada.

### Ejemplo de importación

El archivo `src/index.js` exporta públicamente funciones como `sumaMatrices` y `simpson13`.

Ejemplo utilizando una función pública de la biblioteca:

```javascript
import { sumaMatrices } from 'chuspanumeric';

const A = [
  [1, 2],
  [3, 4]
];

const B = [
  [5, 6],
  [7, 8]
];

const resultado = sumaMatrices(A, B);

console.log(resultado);
```

Este ejemplo supone que el paquete está instalado correctamente y que sus archivos de distribución se generaron y publicaron con las exportaciones correspondientes.

---

## Variables de entorno

Actualmente no se requieren variables de entorno obligatorias para los procedimientos descritos.

Las siguientes variables son ejemplos generales de configuración y no representan requisitos del paquete:

```bash
NODE_ENV=development
API_URL=http://localhost:3000
```

No es necesario definirlas para clonar, instalar dependencias, ejecutar pruebas o generar el build de ChuspaNumeric.

---

## Producción: publicación del paquete npm

La publicación oficial de una versión debe realizarse únicamente por personas autorizadas, después de completar las verificaciones del código, las pruebas y la preparación del paquete.

Los pasos siguientes describen el procedimiento de publicación. Su inclusión en esta guía no significa que el paquete ya esté publicado.

### 1. Iniciar sesión en npm

Verificar que se dispone de una cuenta con permisos para publicar el paquete:

```bash
npm login
```

La sesión debe corresponder a una cuenta autorizada para publicar `chuspanumeric`.

### 2. Validar el código y las pruebas

Instalar las dependencias y ejecutar las verificaciones disponibles en `package.json`:

```bash
npm install
npm test
npm run lint
npm run typecheck
```

Revisar los resultados y resolver los errores antes de continuar. No se debe publicar una versión si las validaciones obligatorias están fallando.

También deben revisarse los resultados correspondientes de CI en GitHub Actions, cuando estén disponibles.

### 3. Preparar el release y actualizar la versión

Antes de publicar:

- Actualizar el `CHANGELOG` con los cambios de la versión.
- Confirmar qué funcionalidades y correcciones se incluirán.
- Comprobar que las validaciones requeridas hayan terminado correctamente.
- Seleccionar el incremento de versión según Semantic Versioning.

Ejecutar solo una de las siguientes alternativas, según el tipo de cambio:

Para una corrección compatible:

```bash
npm version patch
```

Para una funcionalidad compatible:

```bash
npm version minor
```

Para cambios incompatibles:

```bash
npm version major
```

El comando `npm version` actualiza la versión del paquete y, en un repositorio Git, normalmente crea un commit y una etiqueta de versión, salvo que se haya configurado otro comportamiento.

No deben ejecutarse las tres alternativas para un mismo lanzamiento.

### 4. Generar el build

Compilar el código para preparar los archivos de distribución:

```bash
npm run build
```

El script utiliza Rollup según la configuración de `package.json`.

Comprobar que se generen los archivos de distribución esperados, incluidos los puntos de entrada definidos para el paquete:

- `dist/chuspanumeric.cjs.js`
- `dist/chuspanumeric.esm.js`

No continuar con la publicación si el build falla o faltan archivos necesarios.

### 5. Verificar el paquete antes de publicarlo

Simular el empaquetado sin publicar en el registro:

```bash
npm pack --dry-run
```

Revisar la lista de archivos que formarían parte del paquete y confirmar que contiene los archivos de distribución y la documentación necesaria.

Comprobar que no se incluyan accidentalmente archivos privados, temporales o dependencias de desarrollo.

Esta validación no publica el paquete.

### 6. Publicar en npm

Una vez completadas satisfactoriamente las validaciones, el build y la revisión del paquete, una persona autorizada puede ejecutar:

```bash
npm publish
```

La publicación puede requerir autenticación adicional y está sujeta a los permisos y políticas del registro de npm.

No ejecutar este comando durante una revisión de documentación o una prueba local.

Después de una publicación autorizada, verificar que la versión esté disponible en el registro:

```bash
npm view chuspanumeric version
```

Solo se debe comunicar que una versión está publicada cuando su disponibilidad haya sido comprobada.

### 7. Crear o sincronizar la etiqueta de release en GitHub

El procedimiento de versionado debe mantenerse sincronizado con el historial de Git.

Si `npm version` ya generó la etiqueta correspondiente, comprobarla:

```bash
git tag
```

Después de revisar que el commit y la etiqueta pertenecen a la versión correcta, la persona responsable puede subirlos al repositorio remoto autorizado:

```bash
git push origin --follow-tags
```

Si la versión se preparó mediante un procedimiento que no genera etiquetas automáticamente, se debe crear la etiqueta correspondiente según las convenciones del proyecto antes de publicarla en el repositorio remoto.

No se debe crear una segunda etiqueta cuando `npm version` ya haya generado la correcta.

---

## Solución de problemas comunes

### npm no reconocido

Comprobar que Node.js y npm estén instalados correctamente:

```bash
node -v
npm -v
```

Si alguno de los comandos no está disponible, revisar la instalación de Node.js y la configuración de las variables de entorno del sistema.

### Error "Cannot find module"

Desde la carpeta del repositorio, instalar las dependencias:

```bash
npm install
```

Si el error corresponde a un archivo de distribución no generado, ejecutar:

```bash
npm run build
```

### Fallo en tests

Ejecutar:

```bash
npm test
```

Revisar el mensaje de error y corregir la causa antes de intentar preparar una publicación.

### Error al generar el build

Ejecutar:

```bash
npm run build
```

Verificar que las dependencias estén instaladas y revisar los errores reportados por Rollup.

### El paquete no está disponible en npm

Consultar el registro:

```bash
npm view chuspanumeric version
```

Si no existe una publicación disponible, utilizar el repositorio desde el código fuente para desarrollo. No asumir que una versión declarada en `package.json` ya se encuentra publicada.
