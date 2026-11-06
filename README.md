# ChuspaNumeric

> ChuspaNumeric es una librería de métodos numéricos en JavaScript para resolver sistemas de ecuaciones, interpolar datos, integrar funciones y resolver ecuaciones diferenciales mediante métodos de aproximación.

## ¿Qué es?

ChuspaNumeric es una librería de métodos numéricos escrita en JavaScript que implementa 20 algoritmos clásicos agrupados en cinco categorías: sistemas de ecuaciones lineales, ecuaciones no lineales, interpolación, integración numérica y ecuaciones diferenciales ordinarias (EDO). Todos los métodos siguen un contrato de retorno uniforme, lo que permite combinarlos y consumirlos de forma predecible sin importar la categoría a la que pertenezcan.

## ¿Para quién es?

Este proyecto está dirigido a:

- Estudiantes de ingeniería y ciencias que cursan métodos numéricos.
- Docentes que necesitan ejemplos reproducibles para sus clases.
- Desarrolladores que requieren cálculos de aproximación numérica dentro de aplicaciones JavaScript, sin reimplementar los algoritmos desde cero.

## ¿Qué problema resuelve?

Implementar métodos numéricos correctamente (control de tolerancia, manejo de errores de convergencia, registro de iteraciones) toma tiempo y es propenso a errores sutiles. ChuspaNumeric resuelve esto ofreciendo implementaciones ya probadas, con validación de parámetros y un formato de resultado consistente, para que el desarrollador pueda enfocarse en su aplicación en lugar de en los detalles del algoritmo.

## Instalación

Una vez publicado en npm:

```bash
npm install trazo
```

Para clonar el repositorio y trabajar directamente con el código fuente:

```bash
git clone https://github.com/sis-inf/ChuspaNumeric.git
cd ChuspaNumeric
npm install
```

> 👉 Mientras el paquete no esté publicado en npm, los ejemplos de esta guía que usan métodos no expuestos todavía en el punto de entrada (`src/index.js`) deben importarse directamente desde su archivo fuente, como se muestra en la sección "Uso rápido".

## Uso rápido

### Resolver una raíz con bisección

```js
import { biseccion } from 'trazo';

const resultado = biseccion({
  f: (x) => x * x - 4,
  a: 0,
  b: 3,
  tolerancia: 0.001,
  maxIter: 100,
});

console.log('Raíz aproximada:', resultado.resultado);
// Raíz aproximada: 2.000...
```

### Resolver un sistema lineal con Gauss

```js
import { gauss } from 'trazo';

const A = [
  [2, 1, -1],
  [-3, -1, 2],
  [-2, 1, 2],
];
const b = [8, -11, -3];

const resultado = gauss({ A, b });

console.log('Solución:', resultado.resultado);
// Solución: [2, 3, -1]
```

### Calcular una integral con la regla del trapecio

```js
// `trapecio` aún no se reexporta desde src/index.js, por lo que se importa
// directamente desde su archivo fuente al trabajar con el repositorio clonado.
import { trapecio } from './src/integracion/trapecio.js';

const resultado = trapecio({
  f: (x) => x * x,
  a: 0,
  b: 1,
  n: 100,
});

console.log('Integral aproximada:', resultado.resultado);
// Integral aproximada: 0.333...
```

## Estructura del retorno

Todos los métodos de ChuspaNumeric devuelven un objeto con la misma forma, generado internamente mediante `crearResultado()`:

```js
{
  resultado,      // number | Array | null — el valor o vector solución
  iteraciones,    // Array — registro paso a paso del proceso (vacío si el método no itera)
  convergio,      // boolean — true si el método alcanzó el criterio de parada
  mensaje,        // string — mensaje descriptivo del resultado o del error
  meta: {
    metodo,       // string — nombre del método ejecutado
    parametros,   // Object — parámetros de entrada usados
    tiempo_ms,    // number — tiempo de ejecución en milisegundos (si se midió)
  },
}
```

Este contrato uniforme permite procesar el resultado de cualquier método de la misma manera, sin necesidad de conocer su implementación interna.

## Métodos disponibles

| Categoría | Método | Función |
|---|---|---|
| Sistemas lineales | Eliminación de Gauss | `gauss` |
| Sistemas lineales | Gauss-Jordan | `gaussJordan` |
| Sistemas lineales | Jacobi | `jacobi` |
| Sistemas lineales | Gauss-Seidel | `gaussSeidel` |
| Sistemas lineales | Descomposición LU | `lu` |
| Ecuaciones no lineales | Bisección | `biseccion` |
| Ecuaciones no lineales | Falsa posición | `falsaPosicion` |
| Ecuaciones no lineales | Newton-Raphson | `newtonRaphson` |
| Ecuaciones no lineales | Secante | `secante` |
| Ecuaciones no lineales | Punto fijo | `puntoFijo` |
| Ecuaciones no lineales | Müller | `muller` |
| Interpolación | Lagrange | `lagrange` |
| Interpolación | Diferencias divididas de Newton | `newtonDD` |
| Interpolación | Splines cúbicos | `splines` |
| Integración numérica | Regla del trapecio | `trapecio` |
| Integración numérica | Simpson 1/3 | `simpson13` |
| Integración numérica | Simpson 3/8 | `simpson38` |
| Ecuaciones diferenciales (EDO) | Euler | `euler` |
| Ecuaciones diferenciales (EDO) | Euler mejorado (Heun) | `eulerMejorado` |
| Ecuaciones diferenciales (EDO) | Runge-Kutta 4 | `rungeKutta4` |

> 👉 La columna "Función" indica el nombre exportado por cada módulo. El punto de entrada `src/index.js` está en proceso de reexportar progresivamente todos los métodos; mientras eso ocurre, cualquier método aquí listado puede importarse directamente desde su archivo fuente dentro de `src/<categoria>/`.

## Documentación

La documentación del proyecto se encuentra organizada en la carpeta [docs/](docs/).

Para facilitar la navegación entre todas las guías y referencias disponibles, consulta el **[Índice General de Documentación](docs/indice-general.md)**.

Además del índice, encontrarás documentación sobre arquitectura, métodos numéricos, ejemplos de uso, API, contribución, integración continua y despliegue.

## Contribuir

¿Quieres contribuir? Revisa la guía en [CONTRIBUTING.md](CONTRIBUTING.md) para conocer el flujo de trabajo, la convención de ramas y commits, y cómo abrir tu primer Pull Request.

## Licencia

MIT — ver [LICENSE](LICENSE)
