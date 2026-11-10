# Guía de Despliegue

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

- Node.js versión 16 o superior
- npm instalado

Verificar:

```bash
node -v
npm -v
```

---

## Entorno local

1. Clonar repositorio:

```bash
git clone [https://github.com/sis-inf/ChuspaNumeric.git](https://github.com/sis-inf/ChuspaNumeric.git)
cd ChuspaNumeric
```

2. Instalar dependencias:

```bash
npm install
```

3. Ejecutar pruebas:

```bash
npm test
```

---

## Uso en otro proyecto

Instalar paquete:

```bash
npm install ChuspaNumeric
```

Importar en tu proyecto:

```javascript
import { funcionEjemplo } from 'ChuspaNumeric';

funcionEjemplo();
```

---

## Variables de entorno

Actualmente no se requieren variables obligatorias.

Ejemplo:

```bash
NODE_ENV=development
API_URL=http://localhost:3000
```

---

## Producción

Para publicar oficialmente una nueva versión de la librería en el registro de npm, se debe iniciar sesión en la plataforma y seguir estrictamente el flujo secuencial de empaquetado y versionado:

### 1. Iniciar sesión en npm

```bash
npm login
```

### 2. Preparar el release

Antes de subir los cambios, es obligatorio actualizar el historial y el identificador del paquete:

* **Actualizar el CHANGELOG:** Registrar de forma clara todos los cambios, correcciones y nuevas funcionalidades añadidas en este ciclo de desarrollo.
* **Incrementar la versión:** Utilizar el comando de npm para actualizar el archivo `package.json` siguiendo el versionado semántico (Semantic Versioning):

```bash
npm version [patch | minor | major]
```

### 3. Generar el build

Compilar el código fuente para generar los archivos de distribución finales listos para producción:

```bash
npm run build
```

### 4. Verificar el paquete (Simulación)

Para garantizar que solo los archivos necesarios sean incluidos en la distribución final (evitando subir dependencias de desarrollo o archivos de configuración local), simule el empaquetado ejecutando:

```bash
npm pack --dry-run
```

### 5. Publicar en npm

Una vez verificado el paquete simulado, proceda con la publicación oficial en el registro público:

```bash
npm publish
```

### 6. Crear tag de release en GitHub

Para mantener sincronizado el historial de Git con las versiones distribuidas, genere una etiqueta de lanzamiento apuntando al estado actual de la rama y súbala al repositorio remoto:

```bash
git tag v0.x.x && git push --tags
```

---

## Solución de problemas comunes

### npm no reconocido
- Instalar Node.js correctamente

### Error "Cannot find module"

```bash
npm install
```

### Fallo en tests

```bash
npm test
```
