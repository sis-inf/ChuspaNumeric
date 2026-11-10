# Política de Versionado Semántico

## Introducción

Este documento define la política de versionado semántico que seguirá el proyecto **ChuspaNumeric** en sus próximas publicaciones. El objetivo es establecer criterios claros para decidir cuándo incrementar la versión `MAJOR`, `MINOR` o `PATCH`, especialmente ahora que el proyecto cuenta con un flujo real de publicación a npm y una API pública en proceso de consolidación.

La política se basa en el formato `MAJOR.MINOR.PATCH`, donde cada número comunica el impacto del cambio sobre los usuarios de la librería.

---

## Esquema de versionado

ChuspaNumeric seguirá el esquema de versionado semántico:

`MAJOR.MINOR.PATCH`

Donde `MAJOR` representa cambios incompatibles con versiones anteriores, `MINOR` representa nuevas funcionalidades compatibles con versiones anteriores y `PATCH` representa correcciones o mejoras menores compatibles con versiones anteriores.

---

## Incremento de versión MAJOR

Se debe incrementar la versión `MAJOR` cuando se introduzcan cambios incompatibles en la API pública del proyecto. Un cambio se considera incompatible cuando obliga a los usuarios a modificar su código para seguir utilizando la librería correctamente.

Algunos ejemplos de cambios que ameritan un incremento `MAJOR` son cambiar la firma de un método ya exportado, renombrar o eliminar funciones públicas, modificar el formato de entrada esperado por una función, cambiar el formato de retorno documentado, eliminar rutas de importación disponibles o alterar el comportamiento documentado de una función de forma incompatible.

Por ejemplo, si un método público que actualmente recibe un objeto de parámetros pasa a recibir parámetros posicionales, ese cambio debe considerarse incompatible y requiere un incremento `MAJOR`.

---

## Incremento de versión MINOR

Se debe incrementar la versión `MINOR` cuando se agreguen nuevas funcionalidades compatibles con versiones anteriores. Estos cambios amplían las capacidades del proyecto sin romper el código existente de los usuarios.

Algunos ejemplos de cambios que ameritan un incremento `MINOR` son agregar nuevos métodos numéricos, exportar nuevas funciones públicas sin modificar las existentes, incorporar nuevas opciones compatibles en métodos ya disponibles, añadir soporte para nuevos tipos de entrada sin eliminar los anteriores o agregar nuevos módulos documentados.

Por ejemplo, incorporar nuevos métodos de integración, interpolación, ecuaciones diferenciales o métodos no lineales debe considerarse un cambio `MINOR`, siempre que no modifique de forma incompatible la API pública existente.

---

## Incremento de versión PATCH

Se debe incrementar la versión `PATCH` cuando se realicen correcciones, ajustes internos o mejoras que no cambien la API pública ni introduzcan nuevas funcionalidades principales.

Algunos ejemplos de cambios que ameritan un incremento `PATCH` son corregir errores en métodos existentes, ajustar precisión numérica sin cambiar la firma pública, mejorar el rendimiento interno, refactorizar código sin alterar el comportamiento externo, corregir validaciones compatibles, mejorar mensajes de error sin romper contratos existentes, actualizar documentación o ajustar pruebas y configuración del proyecto.

Por ejemplo, corregir un caso borde en un método ya exportado sin cambiar su forma de uso debe considerarse un cambio `PATCH`.

---

## API pública del proyecto

Para aplicar esta política, se considera API pública todo elemento que pueda ser utilizado directamente por usuarios externos del paquete. Esto incluye funciones exportadas desde los puntos de entrada públicos, métodos documentados en la referencia de API, módulos disponibles para importación, estructuras de entrada y salida documentadas, tipos de retorno, objetos de resultado, errores públicos y comportamientos descritos en la documentación oficial.

Los cambios realizados únicamente en archivos internos, pruebas, scripts o documentación no deben considerarse incompatibles, salvo que alteren de forma observable la API pública o el comportamiento documentado de la librería.

---

## Evaluación de la versión actual 1.0.0

El archivo `package.json` declara actualmente la versión `1.0.0`. Sin embargo, al evaluar el estado real del proyecto antes de los lotes recientes de corrección, pruebas y exportación de métodos, esta versión no parecía reflejar completamente una API pública estable, accesible y validada para uso externo.

En versionado semántico, una versión `1.0.0` normalmente comunica que la API pública ya se considera estable. En el caso de ChuspaNumeric, el proyecto seguía en desarrollo activo y una parte importante de la API pública, incluyendo aproximadamente 41 métodos recientemente exportados, todavía no había sido realmente accesible ni probada en uso real antes de estos cambios.

Por este motivo, desde una interpretación estricta de versionado semántico, el proyecto pudo haber estado mejor representado por una versión `0.x.y` durante esa etapa previa. Las versiones `0.x` suelen utilizarse cuando la API pública aún está en desarrollo, puede cambiar con mayor frecuencia y todavía no existe una garantía fuerte de compatibilidad hacia atrás.

No obstante, este documento no modifica la versión actual declarada en `package.json`. En su lugar, deja documentada la evaluación técnica sobre la versión `1.0.0` y establece que, de aquí en adelante, las futuras publicaciones deberán aplicar de forma explícita la política de versionado semántico descrita en este documento.

---

## Recomendación para futuras publicaciones

Antes de publicar una nueva versión en npm, se recomienda revisar el impacto real de los cambios incluidos. La decisión debe considerar si el cambio rompe compatibilidad con usuarios existentes, si agrega nuevas funcionalidades sin romper compatibilidad, si solo corrige errores, si modifica contratos públicos documentados o si afecta los puntos de entrada exportados por el paquete.

También se recomienda revisar la documentación de API, los métodos exportados, las pruebas existentes y el changelog correspondiente antes de decidir el incremento de versión. Esto permite justificar claramente si corresponde publicar una versión `MAJOR`, `MINOR` o `PATCH`.

---

## Resumen de criterios

| Tipo de cambio | Cuándo aplicarlo | Ejemplo |
|---|---|---|
| `MAJOR` | Cambios incompatibles en la API pública | Cambiar la firma de un método exportado |
| `MINOR` | Nuevas funcionalidades compatibles | Agregar un nuevo método numérico |
| `PATCH` | Correcciones compatibles | Corregir un bug sin cambiar la API pública |

---

## Conclusión

ChuspaNumeric seguirá una política de versionado semántico para ordenar sus futuras publicaciones y comunicar con claridad el impacto de cada cambio. La versión `1.0.0` actual queda documentada como una versión que pudo no haber representado completamente el estado real de madurez de la API antes de los lotes recientes de corrección, pruebas y exportación de métodos.

Desde este punto en adelante, los cambios incompatibles deberán incrementar `MAJOR`, las nuevas funcionalidades compatibles deberán incrementar `MINOR` y las correcciones compatibles deberán incrementar `PATCH`.