# Plan de Pruebas

## 1. Objetivo

Validar la exactitud, estabilidad y correcto funcionamiento de la librería matemática ChuspaNumeric, asegurando resultados confiables en cálculos numéricos.

## 2. Alcance

### En alcance

- Métodos numéricos implementados
- Operaciones matemáticas básicas
- Manejo de errores y validación de entradas

### Fuera de alcance

- Interfaces gráficas
- Integraciones externas no relacionadas con cálculos

## 3. Tipos de prueba

- [x] Unitarias
- [x] Integración
- [x] Funcionales manuales
- [x] Rendimiento
- [x] Seguridad
- [x] Regresión

## 4. Entornos

| Entorno | SO            | Versión    |
| ------- | ------------- | ---------- |
| Local   | Windows       | 10/11      |
| CI      | Ubuntu latest | Python 3.x |

## 5. Casos de Prueba - Métodos Numéricos del Sprint Actual

### 5.1. Método de Diferencias Finitas

- **Caso Normal:** Verificación del cálculo de la primera y segunda derivada en funciones polinómicas y trigonométricas continuas utilizando un tamaño de paso $h$ óptimo (ej. $h = 0.01$), validando que el error absoluto respecto al valor analítico cumpla con los criterios de aceptación del proyecto.
- **Caso de Borde:** \* Evaluación del comportamiento del algoritmo cuando el tamaño de paso tiende a los límites de precisión de la máquina (ej. $h = 10^{-16}$) para analizar el error de redondeo.
  - Validación del cálculo explícito de la **segunda derivada** en los extremos del dominio interpolado de forma estable.
- **Caso de Error:** Control de excepciones y detención del proceso cuando el tamaño de paso es estrictamente cero ($h = 0$), asegurando el lanzamiento de una excepción de división por cero o argumento inválido.

### 5.2. Método de Runge-Kutta de Orden 4 (RK4)

- **Caso Normal:** Resolución de una Ecuación Diferencial Ordinaria (EDO) de primer orden con una **solución analítica conocida** (ej. $y' = y, y(0)=1$). El caso se considera exitoso si los valores calculados en cada paso coinciden con la solución exacta ($y = e^x$) bajo un error global acotado por $\mathcal{O}(h^4)$.
- **Caso de Borde:** Evaluación en el límite del tamaño de paso (pasos máximos permitidos que pongan a prueba la estabilidad absoluta del método numérico).
- **Caso de Error:** Validación del rechazo inmediato y lanzamiento de excepción si el tamaño de paso es menor o igual a cero ($h \le 0$).

### 5.3. Interpolación por Splines

- **Caso Normal:** Construcción de curvas de interpolación sobre un conjunto válido de puntos. Se verifica que en los **nodos de entrada**, el spline devuelva el **valor exacto** de la ordenada ($S(x_i) = y_i$), garantizando continuidad y suavidad en las derivadas.
- **Caso de Borde:** Interpolación utilizando el número mínimo funcional de puntos de control (ej. exactamente 3 puntos para splines cúbicos) y evaluación en nodos extremadamente juntos.
- **Caso de Error:** Verificación del sistema de seguridad que debe lanzar una excepción controlada si se intenta inicializar el algoritmo con **menos de 3 puntos de datos**.

### 5.4. Método Iterativo de Gauss-Seidel

- **Caso Normal (Convergencia):** Resolución de un sistema de ecuaciones lineales $Ax = b$ donde la matriz $A$ es **estrictamente diagonal dominante**. Se verifica que el método converja a la solución exacta dentro del número máximo de iteraciones configurado y con la tolerancia especificada ($e < 10^{-6}$).
- **Caso de Borde (Matriz no diagonal dominante):** Evaluación del comportamiento con matrices que no son diagonal dominantes pero que aun así cumplen condiciones de convergencia (matrices simétricas definidas positivas), validando que el algoritmo logre estabilizarse.
- **Caso de Error (Divergencia):** Verificación de que el sistema detecte la divergencia o bucles infinitos cuando se introduce una matriz mal condicionada, interrumpiendo la ejecución de forma segura al alcanzar el límite de iteraciones y notificando el fallo de convergencia.

## 6. Responsables

| Rol              | Responsable |
| ---------------- | ----------- |
| Diseño de casos  | Equipo      |
| Ejecución manual | Equipo      |
| Automatización   | Equipo      |
| Reporte          | Equipo      |

## 7. Criterios de salida

- [x] Cobertura mínima de 80%
- [x] Cero bugs críticos abiertos
- [x] Todos los casos ejecutados
- [x] Error absoluto menor a 1e-6 en métodos numéricos

## 8. Riesgos

| Riesgo                 | Probabilidad | Impacto | Mitigación                       |
| ---------------------- | ------------ | ------- | -------------------------------- |
| Errores de precisión   | Alta         | Alta    | Validar con resultados conocidos |
| Entradas inválidas     | Media        | Media   | Validación de datos              |
| Inestabilidad numérica | Media        | Alta    | Pruebas con casos límite         |
