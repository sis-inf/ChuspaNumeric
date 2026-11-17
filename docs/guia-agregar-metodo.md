# Guía para Agregar un Nuevo Método Numérico

## Introducción

Esta guía describe el proceso estándar para agregar un nuevo método numérico al proyecto ChuspaNumeric.

---

## Paso 1: Crear el archivo en el directorio correcto

Ubicar el método en la categoría correspondiente dentro de src/.

Ejemplos:

* src/lineales/
* src/no-lineales/
* src/interpolacion/
* src/integracion/
* src/edo/

---

## Paso 2: Implementar la función con JSDoc completo

Todo método debe incluir documentación JSDoc.

### Template de módulo

javascript
/**
 * Descripción del método.
 *
 * @param {number} x Valor de entrada.
 * @returns {Object} Resultado del método.
 */
export function metodoEjemplo(x) {
  return {
    solucion: x,
    iteraciones: 1,
    convergio: true,
    tabla: []
  };
}


---

## Paso 3: Validar entradas usando validaciones.js

Antes de ejecutar cálculos se deben validar los parámetros de entrada.

Ejemplos de validaciones:

* Valores nulos
* Tipos incorrectos
* Rangos inválidos
* Parámetros obligatorios faltantes

---

## Paso 4: Retornar el formato estándar

Todos los métodos deben retornar un objeto con la estructura estándar:

javascript
{
  raiz: valor,
  solucion: valor,
  iteraciones: numero,
  convergio: true,
  tabla: []
}


Campos principales:

* raiz o solucion
* iteraciones
* convergio
* tabla

---

## Paso 5: Agregar export en src/index.js

Registrar el método para que esté disponible públicamente.

Ejemplo:

javascript
export { metodoEjemplo } from './categoria/metodoEjemplo.js';


---

## Paso 6: Crear pruebas con Jest

Cada método debe incluir pruebas automatizadas.

Ejemplo:

javascript
describe('metodoEjemplo', () => {
  test('debe retornar un resultado válido', () => {
    expect(true).toBe(true);
  });
});


---

## Paso 7: Actualizar docs/roadmap.md

Una vez implementado el método, registrar la funcionalidad como completada dentro del roadmap del proyecto.

---

## Recomendaciones

* Mantener consistencia con el resto del código.
* Utilizar nombres descriptivos.
* Documentar parámetros y valores de retorno.
* Agregar pruebas para casos válidos e inválidos.
* Verificar que el método sea exportado correctamente.
*
