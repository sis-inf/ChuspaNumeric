# Tipos de Retorno de los Métodos de ChuspaNumeric

## Introducción

Los métodos de ChuspaNumeric pueden retornar distintos tipos de resultados dependiendo de la categoría y del algoritmo utilizado. Esta guía describe la estructura de retorno esperada para cada método.

---

## Métodos y tipos de retorno

| Método              | Tipo de retorno | Campos principales                      | Tipo de error  |
| ------------------- | --------------- | --------------------------------------- | -------------- |
| biseccion           | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| newtonRaphson       | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| gauss               | Array           | solución del sistema                    | Error nativo   |
| jacobi              | Objeto          | solucion, iteraciones, convergio, tabla | NumericalError |
| det2x2              | Número          | valor numérico                          | Error nativo   |
| det3x3              | Número          | valor numérico                          | Error nativo   |
| lagrange            | Número          | valor interpolado                       | Error nativo   |
| linearInterpolation | Número          | valor interpolado                       | Error nativo   |
| polyEval            | Número          | resultado de evaluación                 | Error nativo   |
| derivative          | Número          | derivada calculada                      | Error nativo   |
| simpson13           | Número          | resultado de integración                | Error nativo   |
| simpson38           | Número          | resultado de integración                | Error nativo   |
| gauss-jordan        | Array           | solución del sistema                    | Error nativo   |
| lu                  | Objeto          | solucion, iteraciones, convergio, tabla | Error nativo   |
| falsa-posicion      | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| muller              | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| punto-fijo          | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| secante             | Objeto          | raiz, iteraciones, convergio, tabla     | NumericalError |
| euler               | Objeto          | solucion, tabla                         | Error nativo   |
| euler-mejorado      | Objeto          | solucion, tabla                         | Error nativo   |
| trapezoidal         | Número          | resultado de integración                | Error nativo   |
| newton-dd           | Número          | valor interpolado                       | Error nativo   |
| splines             | Objeto          | solucion, tabla                         | Error nativo   |
---

## Estructura estándar de retorno

Muchos métodos numéricos retornan un objeto con la siguiente estructura:

javascript
{
  raiz: 1.234,
  iteraciones: 8,
  convergio: true,
  tabla: []
}


### Campos

* raiz: valor encontrado por el método.
* iteraciones: cantidad de iteraciones realizadas.
* convergio: indica si el método alcanzó convergencia.
* tabla: historial de iteraciones.

---

## Ejemplo de destructuring para métodos no lineales

javascript
const resultado = biseccion(funcion, a, b);

const {
  raiz,
  iteraciones,
  convergio,
  tabla
} = resultado;


---

## Ejemplo de destructuring para sistemas lineales

javascript
const resultado = jacobi(A, b);

const {
  solucion,
  iteraciones,
  convergio,
  tabla
} = resultado;


---

## Ejemplo para métodos que retornan números

javascript
const resultado = det2x2(matriz);

console.log(resultado);


---

## Ejemplo para métodos que retornan arrays

javascript
const solucion = gauss(A, b);

console.log(solucion);


---

## Tipos de errores

### NumericalError

Se produce cuando un método numérico no converge o no puede encontrar una solución válida.

### Error nativo

Se produce cuando existen parámetros inválidos, tipos incorrectos o condiciones de entrada no válidas.

---

## Recomendaciones

* Verificar siempre el tipo de retorno esperado antes de utilizar un método.
* Utilizar destructuring cuando el método retorna objetos.
* Controlar errores mediante bloques try/catch.
* Consultar la documentación específica de cada método para detalles adicionales.
*
