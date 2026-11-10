# Arquitectura de la librería ChuspaNumeric

## Visión general

**ChuspaNumeric** es una librería de métodos numéricos en JavaScript (ES6+) diseñada para resolver problemas matemáticos mediante algoritmos de aproximación como integración, interpolación y resolución de sistemas de ecuaciones.

La arquitectura está organizada de forma modular, separando cada tipo de método en carpetas independientes dentro de `src/`. Esto permite mantener el código limpio, reutilizable y fácil de escalar.

Cada módulo cumple una responsabilidad específica, facilitando el mantenimiento del proyecto y permitiendo que los usuarios importen únicamente las funcionalidades que necesitan.

---

## Componentes principales

- **Sistemas de ecuaciones lineales:** Gauss, Gauss-Jordan, LU, Jacobi y Gauss-Seidel.
- **Sistemas no lineales:** Bisección, secante, Newton-Raphson, falsa posición.
- **Interpolación:** Lagrange y Newton.
- **Integración numérica:** Trapecio, Simpson, cuadratura de Gauss.
- **Core:** Punto de entrada (`index.js`) que organiza los módulos.

---

## Diagrama de arquitectura

```
ChuspaNumeric/
│
├── sistemas/
│   ├── lineales/
│   └── no-lineales/
├── interpolacion/
└── integracion/
```
---

## Tecnologías utilizadas

| Componente | Tecnología | Versión | Justificación |
|-----------|------------|--------|--------------|
| Núcleo | JavaScript | ES6+ | Lenguaje principal |
| Entorno | Node.js | 16+ | Ejecución del proyecto |
| Dependencias | npm | 8+ | Gestión de paquetes |

---

## Decisiones de diseño

### Decisión 1
**Contexto:** Se requiere modularidad.  
**Decisión:** Separar la librería en módulos independientes.  
**Consecuencias:** Facilita mantenimiento y escalabilidad.

### Decisión 2
**Contexto:** Facilidad de uso.  
**Decisión:** Exportar funciones desde `index.js`.  
**Consecuencias:** Uso sencillo en otros proyectos.

---

## Flujo de datos

1. El usuario importa un método desde la librería.
2. Define los parámetros necesarios.
3. El sistema ejecuta el algoritmo correspondiente.
4. Se retorna el resultado al usuario.

---

## Flujo detallado de datos

```text
┌─────────┐
│ Usuario │
└────┬────┘
     │
     ▼
┌──────────────┐
│ src/index.js │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Módulo específico│
│ (bisección,      │
│ integración, etc)│
└──────┬───────────┘
       │
       ▼
┌─────────────────────────┐
│ src/utils/validaciones.js│
└──────┬──────────────────┘
       │
       ▼
┌────────────────────┐
│ convergence.js     │
└──────┬─────────────┘
       │
       ▼
┌────────────────────┐
│ Resultado final    │
└────────────────────┘
```

### Flujo de errores

Los módulos utilizan las utilidades de validación y convergencia para verificar que los datos de entrada y el proceso numérico sean correctos.

Cuando ocurre una condición inválida, se genera una excepción `NumericalError`, la cual se propaga hasta el usuario.

```text
validaciones.js / convergence.js
                │
                ▼
         NumericalError
                │
                ▼
          src/index.js
                │
                ▼
             Usuario
```

## Capa de utilidades

La carpeta de utilidades concentra funcionalidades compartidas por todos los métodos numéricos de la librería.

### validaciones.js

Responsable de:

- Verificar tipos de datos.
- Validar parámetros obligatorios.
- Comprobar rangos válidos.
- Detectar entradas inconsistentes.

### convergence.js

Responsable de:

- Evaluar criterios de convergencia.
- Controlar tolerancias numéricas.
- Verificar el número máximo de iteraciones.
- Detectar casos donde un método no converge.

### Redondeo

Las funciones de redondeo permiten mantener consistencia en la presentación de resultados numéricos y reducir diferencias provocadas por la representación de números en punto flotante.