# Guía para Contribuidores

Esta guía explica paso a paso cómo realizar una contribución al proyecto utilizando JavaScript y Node.js.

## 1. Realizar un Fork del repositorio

Primero crea un fork del repositorio desde GitHub utilizando el botón *Fork*.

## 2. Clonar el repositorio

bash
git clone https://github.com/TU-USUARIO/ChuspaNumeric.git
cd ChuspaNumeric


## 3. Instalar dependencias

bash
npm install


## 4. Instalar pre-commit

bash
npm install
npx pre-commit install


## 5. Crear una rama de trabajo

bash
git checkout dev
git pull origin dev
git checkout -b nombre-de-tu-rama


Ejemplo:

bash
git checkout -b docs/guia-primer-pr


## 6. Implementar cambios

Realiza los cambios necesarios siguiendo las convenciones del proyecto.

Todas las funciones deben incluir documentación JSDoc.

Ejemplo:

javascript
/**
 * Suma dos números.
 * @param {number} a Primer número.
 * @param {number} b Segundo número.
 * @returns {number} Resultado de la suma.
 */
function suma(a, b) {
  return a + b;
}


## 7. Escribir pruebas con Jest

Crear o actualizar los archivos de prueba correspondientes.

Ejemplo:

javascript
test('suma dos números correctamente', () => {
  expect(suma(2, 3)).toBe(5);
});


## 8. Ejecutar las pruebas

bash
npm test


## 9. Formatear el código

bash
npx prettier --write .


## 10. Verificar reglas de estilo

bash
npx eslint .


## 11. Realizar commit

bash
git add .
git commit -m "docs: agregar guia para contribuidores"


## 12. Enviar cambios al repositorio remoto

bash
git push origin nombre-de-tu-rama


Ejemplo:

bash
git push origin docs/guia-primer-pr


## 13. Crear Pull Request

1. Ingresar al repositorio en GitHub.
2. Seleccionar *Compare & Pull Request*.
3. Verificar que la rama destino sea *dev*.
4. Completar la descripción del Pull Request.
5. Enviar el Pull Request para revisión.

## Recomendaciones

- Mantener los cambios pequeños y claros.
- Escribir documentación cuando sea necesario.
- Ejecutar las pruebas antes de enviar cambios.
- Seguir las convenciones establecidas por el proyecto.
