
# Informe de Pruebas — Sprint [N]

**Fecha:** [AAAA-MM-DD]
**Versión probada:** [Versión o etiqueta]
**Commit evaluado:** [SHA del commit]
**Rama evaluada:** [Nombre de la rama]
**Responsable QA:** [Nombre]
**Entorno evaluado:** [Sistema operativo, versión de Node.js, dependencias y configuración]

---

## Resumen ejecutivo

[Describir el alcance de las pruebas, los resultados principales, los riesgos identificados y el estado general del sprint.]

## Métricas

| Métrica | Valor |
|---|---|
| Casos diseñados | [Cantidad] |
| Casos ejecutados | [Cantidad] |
| Casos pasados | [Cantidad] |
| Casos fallidos | [Cantidad] |
| Casos pendientes | [Cantidad] |
| Casos no ejecutados | [Cantidad] |
| Bugs encontrados | [Cantidad] |
| Bugs resueltos | [Cantidad] |
| Cobertura de código | [Porcentaje o N/D] |

**Estados de las pruebas:**

- **Aprobada:** ejecutada y con resultado esperado.
- **Fallida:** ejecutada y con resultado distinto del esperado.
- **Pendiente:** planificada y en espera de ejecución o evaluación.
- **No ejecutada:** no se realizó durante el período evaluado.

## Resultados por módulo

| Módulo | Casos | Pasaron | Fallaron | Pendientes | No ejecutados | Cobertura |
|---|---|---|---|---|---|---|
| [Módulo] | [Cantidad] | [Cantidad] | [Cantidad] | [Cantidad] | [Cantidad] | [% o N/D] |

## Evidencias de ejecución de pruebas

### Jest

| Campo | Resultado |
|---|---|
| Comando ejecutado | [Comando] |
| Fecha de ejecución | [Fecha y hora] |
| Versión de Jest | [Versión] |
| Suites aprobadas | [Cantidad] |
| Suites fallidas | [Cantidad] |
| Tests aprobados | [Cantidad] |
| Tests fallidos | [Cantidad] |
| Tests pendientes | [Cantidad] |
| Tests no ejecutados | [Cantidad] |
| Resultado general | [Aprobado / Fallido / Pendiente / No ejecutado] |
| Evidencia | [Enlace o ruta del reporte] |

### GitHub Actions — CI

| Campo | Resultado |
|---|---|
| Workflow | [Nombre del workflow] |
| Ejecución | [URL de GitHub Actions] |
| Rama | [Nombre de la rama] |
| Commit | [SHA] |
| Fecha de ejecución | [Fecha y hora] |
| Jobs y comprobaciones | [Nombres y resultados] |
| Estado final | [Success / Failure / Cancelled / Pending / No ejecutado] |
| Evidencia adicional | [URL de logs o artefactos] |
| Observaciones | [Errores, advertencias o limitaciones] |

**Nota:** Registrar únicamente resultados verificables. Una ejecución pendiente, cancelada o no realizada no debe registrarse como aprobada.

## Evidencias de precisión numérica

**Método numérico evaluado:** [Nombre del método]
**Módulo o función:** [Nombre]
**Caso de prueba:** [Identificador]
**Datos de entrada:** [Parámetros y valores]
**Fuente de referencia:** [Cálculo analítico, documentación o fuente verificable]
**Criterio de comparación:** [Error absoluto, relativo u otro]

| Caso | Valor esperado | Valor obtenido | Error calculado | Tolerancia admisible | Resultado |
|---|---|---|---|---|---|
| [Identificador] | [Valor] | [Valor] | [Error] | [Tolerancia] | [Aprobada / Fallida / Pendiente / No ejecutada] |

**Fórmula de error utilizada:** [Indicar fórmula y unidades].

Error absoluto:

`Error absoluto = |valor obtenido - valor esperado|`

Error relativo, cuando el valor esperado es distinto de cero:

`Error relativo = |valor obtenido - valor esperado| / |valor esperado|`

**Justificación de la tolerancia:** [Explicar la tolerancia definida y su relación con el método numérico].

**Observaciones:** [Describir desviaciones, casos límite, precisión y estabilidad numérica].

**Evidencia del cálculo:** [URL, archivo de prueba o referencia].

## Bugs críticos abiertos

| Issue | Descripción | Severidad | Estado | Evidencia |
|---|---|---|---|---|
| [Número o enlace] | [Descripción] | [Severidad] | [Estado] | [Enlace] |

## Defectos encontrados durante las pruebas

| ID / Issue | Módulo | Resultado esperado | Resultado observado | Severidad | Estado |
|---|---|---|---|---|---|
| [Identificador] | [Módulo] | [Esperado] | [Observado] | [Severidad] | [Abierto / Resuelto / En revisión] |

**Impacto de los defectos pendientes:** [Describir su efecto sobre las funcionalidades, la precisión numérica o la aceptación de la versión].

## Conclusión

[Resumir los resultados de las pruebas, las evidencias de precisión numérica, el estado del CI, la cobertura y los defectos relevantes.]

## ¿Listo para siguiente sprint?

- [ ] Sí
- [ ] No

**Razón:** [Justificación basada en los resultados registrados].

## Decisión formal de aceptación del MVP

**Versión evaluada:** [Versión o commit]

**Decisión:**

- [ ] Aceptado
- [ ] Rechazado
- [ ] Pendiente de evaluación

**Criterios considerados:**

| Criterio | Evaluación | Evidencia |
|---|---|---|
| Resultados de las pruebas generales | [Evaluación] | [Referencia] |
| Precisión numérica y tolerancias | [Evaluación] | [Referencia] |
| Resultados de Jest | [Evaluación] | [Referencia] |
| Resultados de GitHub Actions | [Evaluación] | [Referencia] |
| Defectos críticos pendientes | [Evaluación] | [Referencia] |
| Cobertura y alcance de las pruebas | [Evaluación] | [Referencia] |

**Justificación de la decisión:** [Fundamentar la aceptación o el rechazo con las evidencias registradas].

**Responsable de la decisión:** [Nombre y rol]
**Fecha de decisión:** [AAAA-MM-DD]

**Estado de aprobación:** [Sin evaluar / Evaluación completada]

La decisión debe registrarse únicamente después de revisar las evidencias. Ninguna opción se encuentra aprobada por defecto.
