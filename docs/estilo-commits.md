# Estilo de Commits para ChuspaNumeric

## Introducción

El proyecto ChuspaNumeric utiliza la convención *Conventional Commits* para mantener un historial claro y consistente.

## Formato

text
tipo(ambito): descripción breve 


### Ejemplos

text
feat(no-lineales): agregar método de secante
fix(lineales): corregir validación de matrices
docs(interpolacion): actualizar documentación


---

## Tipos de commit

| Tipo     | Descripción                                 |
| -------- | ------------------------------------------- |
| feat     | Nueva funcionalidad                         |
| fix      | Corrección de errores                       |
| docs     | Cambios en documentación                    |
| test     | Agregar o modificar pruebas                 |
| refactor | Mejoras internas sin cambiar comportamiento |
| chore    | Tareas de mantenimiento                     |
| ci       | Configuración de integración continua       |

---

## Ámbitos recomendados

| Ámbito        | Uso                                 |
| ------------- | ----------------------------------- |
| no-lineales   | Métodos no lineales                 |
| lineales      | Métodos lineales                    |
| integracion   | Métodos de integración numérica     |
| interpolacion | Métodos de interpolación            |
| edo           | Ecuaciones diferenciales ordinarias |
| utils         | Utilidades y validaciones           |
| io            | Entrada y salida de datos           |
| docs          | Documentación                       |
| ci            | Integración continua                |
| tests         | Pruebas automatizadas               |

---

## Ejemplos correctos

- feat(no-lineales): implementar método de bisección
- feat(lineales): agregar método LU
- fix(interpolacion): corregir cálculo de splines
- fix(integracion): validar número de intervalos
- docs(docs): agregar guía de contribución
- test(no-lineales): añadir pruebas para secante
- refactor(utils): simplificar validaciones
- ci(ci): actualizar flujo de GitHub Actions


---

## Ejemplos incorrectos

### Incorrecto

text
arreglos varios


### Correcto

text
fix(utils): corregir validaciones


### Incorrecto

text
nuevo metodo


### Correcto

text
feat(no-lineales): implementar método de Müller


### Incorrecto

text
documentacion


### Correcto

text
docs(docs): actualizar manual de usuario


### Incorrecto

text
cambios


### Correcto

text
refactor(lineales): mejorar estructura interna


### Incorrecto

text
test


### Correcto

text
test(interpolacion): agregar pruebas para Lagrange


---

## Recomendaciones

* Utilizar siempre el formato Conventional Commits.
* Mantener descripciones breves y claras.
* Seleccionar el ámbito adecuado.
* Evitar mensajes genéricos.
* Escribir los mensajes en infinitivo.
*
