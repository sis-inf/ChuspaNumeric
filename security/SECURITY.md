# Política de Seguridad

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad:

1. **No** crees un issue público
2. Reporta la vulnerabilidad de forma privada a través de [GitHub Security Advisories](https://github.com/sis-inf/ChuspaNumeric/security/advisories)
3. Incluye descripción detallada del problema, pasos para reproducir y impacto potencial
4. Espera confirmación de recepción

### Línea de tiempo de divulgación

| Fase                          | Plazo              |
|-------------------------------|--------------------|
| Confirmación de recepción     | 48–72 horas        |
| Evaluación inicial            | 7 días             |
| Fecha límite de divulgación   | 90 días (por defecto) |

**Divulgación anticipada coordinada:** si se requiere una resolución antes de los 90 días, podemos coordinar una divulgación anticipada acordada mutuamente. Likewise, el plazo de 90 días puede extenderse si la vulnerabilidad requiere más tiempo para resolver o si hay circunstancias excepcionales.

## Análisis de seguridad

Este proyecto ejecuta análisis automático de seguridad en cada PR dirigido a `main` y en cada push a `dev` mediante **CodeQL** (GitHub Actions).

## Versiones soportadas

| Versión | Soportada |
|---|---|
| latest | ✅ |