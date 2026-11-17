# Manejo de Errores en ChuspaNumeric

## Introducción

La biblioteca ChuspaNumeric utiliza distintos tipos de errores para informar problemas durante la ejecución de los métodos numéricos. Conocer estos errores permite identificar correctamente la causa de un problema y aplicar un manejo adecuado mediante bloques try/catch.

---

## Tipos de errores

### NumericalError

Se utiliza cuando un método numérico no puede completar el cálculo correctamente debido a problemas de convergencia o condiciones matemáticas que impiden obtener una solución válida.

### RangeError

Se utiliza cuando un parámetro se encuentra fuera del rango permitido por el método.

### TypeError

Se utiliza cuando un parámetro tiene un tipo de dato incorrecto.

---

## Cuándo se lanza cada tipo

| Tipo de error  | Cuándo ocurre                                        |
| -------------- | ---------------------------------------------------- |
| NumericalError | El método no converge o no encuentra solución válida |
| RangeError     | Un parámetro está fuera del rango permitido          |
| TypeError      | Un argumento tiene un tipo de dato incorrecto        |

---

## Cómo hacer catch correctamente

javascript
try {
  const resultado = metodoNumerico(datos);
  console.log(resultado);
} catch (error) {
  if (error.name === 'NumericalError') {
    console.error('Error numérico:', error.message);
  } else if (error instanceof RangeError) {
    console.error('Parámetro fuera de rango:', error.message);
  } else if (error instanceof TypeError) {
    console.error('Tipo de dato incorrecto:', error.message);
  } else {
    console.error('Error desconocido:', error.message);
  }
}


---

## Mensajes de error estándar

Los siguientes mensajes pueden aparecer durante la ejecución:

* El método no convergió.
* No existe solución dentro del intervalo especificado.
* El valor proporcionado está fuera del rango permitido.
* Se esperaba un número como parámetro.
* Se recibió un argumento inválido.
* División por cero detectada.
* Número máximo de iteraciones alcanzado.

---

## Uso incorrecto vs errores numéricos

### Errores por uso incorrecto

Son causados por parámetros inválidos o tipos de datos incorrectos.

Ejemplos:

* Pasar texto donde se espera un número.
* Enviar valores fuera del rango permitido.
* Omitir parámetros obligatorios.

Estos errores generalmente generan TypeError o RangeError.

### Errores numéricos

Son causados por las características matemáticas del problema.

Ejemplos:

* Falta de convergencia.
* Intervalos sin raíz.
* Iteraciones insuficientes.
* Problemas de estabilidad numérica.

Estos errores generalmente generan NumericalError.

---

## Recomendaciones

* Validar siempre los parámetros antes de ejecutar un método.
* Utilizar bloques try/catch para controlar errores.
* Revisar el mensaje asociado al error para identificar la causa exacta.
* Diferenciar entre errores de uso y errores numéricos para aplicar la solución adecuada.
*
