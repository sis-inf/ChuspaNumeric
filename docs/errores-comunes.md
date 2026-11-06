# Errores Comunes y Soluciones en ChuspaNumeric

## Introducción

Esta guía recopila errores frecuentes al utilizar los métodos numéricos de ChuspaNumeric, junto con sus causas y posibles soluciones.

---

## 1. Intervalo inválido en Bisección

*Mensaje:* NumericalError: El intervalo no contiene una raíz.

*Causa:* Los extremos del intervalo tienen el mismo signo.

*Solución:* Verificar que f(a) y f(b) tengan signos opuestos.

---

## 2. Derivada cero en Newton-Raphson

*Mensaje:* NaN o división por cero.

*Causa:* La derivada evaluada es cero.

*Solución:* Elegir otro punto inicial o utilizar otro método.

---

## 3. Divergencia en Jacobi

*Mensaje:* El método no converge.

*Causa:* La matriz no es diagonalmente dominante.

*Solución:* Reordenar la matriz o utilizar otro método.

---

## 4. Tolerancia demasiado pequeña

*Mensaje:* Máximo número de iteraciones alcanzado.

*Causa:* Se exige una precisión excesiva.

*Solución:* Utilizar una tolerancia razonable.

---

## 5. Cancelación catastrófica en Secante

*Mensaje:* Resultados inestables.

*Causa:* Valores muy cercanos generan pérdida de precisión.

*Solución:* Elegir aproximaciones iniciales más separadas.

---

## 6. Matriz singular

*Mensaje:* No se puede resolver el sistema.

*Causa:* Determinante igual a cero.

*Solución:* Verificar los datos de entrada.

---

## 7. Datos no numéricos

*Mensaje:* TypeError.

*Causa:* Se ingresan cadenas o valores inválidos.

*Solución:* Utilizar únicamente valores numéricos.

---

## 8. Número insuficiente de iteraciones

*Mensaje:* No converge.

*Causa:* El límite de iteraciones es muy pequeño.

*Solución:* Incrementar el número máximo de iteraciones.

---

## 9. División por cero en métodos iterativos

*Mensaje:* Infinity o NaN.

*Causa:* Alguna operación genera denominador cero.

*Solución:* Revisar parámetros y valores iniciales.

---

## 10. Error en interpolación

*Mensaje:* Resultado incorrecto.

*Causa:* Puntos repetidos en los datos.

*Solución:* Eliminar valores duplicados.

---

## Recomendaciones

* Validar siempre las entradas.
* Revisar intervalos y condiciones iniciales.
* Utilizar tolerancias adecuadas.
* Controlar excepciones mediante try/catch.
* Consultar la documentación de cada método.
*
