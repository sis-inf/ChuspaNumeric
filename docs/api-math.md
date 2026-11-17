# API de Funciones Matemáticas - ChuspaNumeric

## Métodos de Sistemas Lineales

| Función | Parámetros | Retorno | Ejemplo |
|--------|-----------|--------|--------|
| gauss(matriz, vector) | matriz: number[][], vector: number[] | number[] | gauss(A, b) |
| gaussJordan(matriz, vector) | matriz: number[][], vector: number[] | number[] | gaussJordan(A, b) |
| jacobi(matriz, vector, tol, iter) | matriz, vector, tolerancia, iteraciones | number[] | jacobi(A, b, 0.001, 100) |

---

## Métodos No Lineales

| Función | Parámetros | Retorno | Ejemplo |
|--------|-----------|--------|--------|
| biseccion(f, a, b, tol) | función, intervalo, tolerancia | number | biseccion(f, 0, 2, 0.001) |
| newtonRaphson(f, df, x0, tol) | función, derivada, valor inicial | number | newtonRaphson(f, df, 1, 0.001) |
| secante(f, x0, x1, tol) | función, valores iniciales | number | secante(f, 1, 2, 0.001) |

---

## Interpolación

| Función | Parámetros | Retorno | Ejemplo |
|--------|-----------|--------|--------|
| lagrange(x, y, valor) | puntos x, puntos y, valor | number | lagrange([1,2], [3,4], 1.5) |

---

## Integración

| Función | Parámetros | Retorno | Ejemplo |
|--------|-----------|--------|--------|
| trapecio(f, a, b, n) | función, intervalo, subdivisiones | number | trapecio(f, 0, 1, 10) |
| simpson(f, a, b, n) | función, intervalo, subdivisiones | number | simpson(f, 0, 1, 10) |

---

## Diferencias Finitas

### diferenciasAdelanteGrado1(f, x, h)

Calcula la derivada numérica usando diferencias finitas hacia adelante.

**Parámetros:**
- `f` (Function): Función a derivar
- `x` (number): Punto donde se evalúa la derivada
- `h` (number): Paso de aproximación

**Retorno:** (number) Aproximación de la derivada

**Ejemplo:**
```javascript
const resultado = diferenciasAdelanteGrado1(x => x ** 2, 2, 0.001);
console.log(resultado); // ≈ 4.002
```

### diferenciaCentrada(f, x, h)

Calcula la derivada numérica usando diferencias finitas centradas.

**Parámetros:**
- `f` (Function): Función a derivar
- `x` (number): Punto donde se evalúa la derivada
- `h` (number): Paso de aproximación

**Retorno:** (number) Aproximación de la derivada

**Ejemplo:**
```javascript
const resultado = diferenciaCentrada(x => x ** 2, 2, 0.001);
console.log(resultado); // ≈ 4.0
```

---

## Integración Numérica Avanzada

### gaussLegendre(f, a, b, puntos)

Integración numérica usando cuadratura de Gauss-Legendre.

**Parámetros:**
- `f` (Function): Función a integrar
- `a` (number): Límite inferior del intervalo
- `b` (number): Límite superior del intervalo
- `puntos` (number): Número de puntos (2 o 3)

**Retorno:** (number) Valor aproximado de la integral

**Ejemplo:**
```javascript
const resultado = gaussLegendre(x => x ** 2, 0, 1, 2);
console.log(resultado); // ≈ 0.3333
```

---

## Interpolación Avanzada

### newtonDD({ puntos, x })

Interpolación de Newton mediante diferencias divididas.

**Parámetros:**
- `puntos` (Array): Array de pares [xi, yi] con al menos dos puntos
- `x` (number): Valor donde se evalúa el polinomio interpolante

**Retorno:** (Object) Resultado con propiedades: resultado, iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado } = newtonDD({ 
  puntos: [[0, 1], [1, 2], [2, 5]], 
  x: 1.5 
});
console.log(resultado); // ≈ 3.25
```

### splineCubicoNatural(xs, ys, x)

Interpolación por splines cúbicos naturales.

**Parámetros:**
- `xs` (number[]): Arreglo de valores x (nodos), ordenado ascendentemente
- `ys` (number[]): Arreglo de valores y correspondientes
- `x` (number): Punto donde se desea interpolar

**Retorno:** (Object) Resultado con propiedades: resultado, iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado } = splineCubicoNatural([0, 1, 2], [0, 1, 4], 1.5);
console.log(resultado); // ≈ 2.25
```

---

## Sistemas Lineales Avanzados

### descomponerLU(A)

Descompone una matriz cuadrada A en matrices L y U (A = LU).

**Parámetros:**
- `A` (number[][]): Matriz de coeficientes (array de arrays)

**Retorno:** (Object) Objeto con propiedades L y U (matrices triangulares)

**Ejemplo:**
```javascript
const { L, U } = descomponerLU([[4, 3], [6, 3]]);
console.log(L); // [[1, 0], [1.5, 1]]
console.log(U); // [[4, 3], [0, -1.5]]
```

### resolverLU(L, U, b)

Resuelve el sistema Ax = b mediante sustitución usando L y U.

**Parámetros:**
- `L` (number[][]): Matriz triangular inferior
- `U` (number[][]): Matriz triangular superior
- `b` (number[]): Vector de términos independientes

**Retorno:** (number[]) Vector solución x

**Ejemplo:**
```javascript
const { L, U } = descomponerLU([[4, 3], [6, 3]]);
const x = resolverLU(L, U, [10, 14]);
console.log(x); // [1, 2]
```

### gaussSeidel({ A, b, x0, tolerancia, maxIter })

Resuelve un sistema lineal A·x = b mediante el método iterativo de Gauss-Seidel.

**Parámetros:**
- `A` (number[][]): Matriz de coeficientes
- `b` (number[]): Vector de términos independientes
- `x0` (number[], opcional): Valor inicial del vector solución
- `tolerancia` (number, opcional): Tolerancia de convergencia (default: 1e-6)
- `maxIter` (number, opcional): Máximo de iteraciones (default: 100)

**Retorno:** (Object) Resultado con propiedades: resultado, iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado } = gaussSeidel({ 
  A: [[4, 1], [1, 3]], 
  b: [5, 5],
  tolerancia: 0.001 
});
console.log(resultado); // ≈ [1, 1.33]
```

### descomposicionCholesky(A)

Factoriza una matriz simétrica definida positiva A = L·Lᵀ usando la descomposición de Cholesky.

**Parámetros:**
- `A` (number[][]): Matriz simétrica definida positiva (n×n)

**Retorno:** (Object) Resultado con propiedades: resultado (contiene L), iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado } = descomposicionCholesky([[4, 2], [2, 3]]);
console.log(resultado.L); // ≈ [[2, 0], [1, 1.414]]
```

### resolverCholesky(L, b)

Resuelve el sistema A·x = b dado la factorización A = L·Lᵀ.

**Parámetros:**
- `L` (number[][]): Matriz triangular inferior de Cholesky (n×n)
- `b` (number[]): Vector de términos independientes (longitud n)

**Retorno:** (Object) Resultado con propiedades: resultado (contiene x), iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado: { L } } = descomposicionCholesky([[4, 2], [2, 3]]);
const { resultado: { x } } = resolverCholesky(L, [8, 7]);
console.log(x); // ≈ [1, 2]
```

---

## Ecuaciones Diferenciales Ordinarias

### rungeKutta4({ f, x0, y0, h, xFinal })

Resuelve una EDO de primer orden usando Runge-Kutta de orden 4 (RK4).

**Parámetros:**
- `f` (Function): Función f(x, y)
- `x0` (number): Valor inicial de x
- `y0` (number): Valor inicial de y
- `h` (number): Tamaño del paso
- `xFinal` (number): Valor final de x

**Retorno:** (Object) Resultado con propiedades: resultado (array de pares [x, y]), iteraciones, convergio, mensaje, meta

**Ejemplo:**
```javascript
const { resultado } = rungeKutta4({
  f: (x, y) => y,
  x0: 0,
  y0: 1,
  h: 0.1,
  xFinal: 1
});
console.log(resultado); // Array de puntos [x, y]
```

---

## Análisis y Ajuste

### regresionLineal(xs, ys)

Regresión lineal por mínimos cuadrados. Ajusta una recta y = pendiente*x + intercepto.

**Parámetros:**
- `xs` (number[]): Array de valores independientes (al menos 2)
- `ys` (number[]): Array de valores dependientes (misma longitud que xs)

**Retorno:** (Object) Objeto con propiedades: pendiente, intercepto, r2, prediccion (función)

**Ejemplo:**
```javascript
const { pendiente, intercepto, r2, prediccion } = regresionLineal([1, 2, 3], [2, 4, 6]);
console.log(pendiente); // 2
console.log(intercepto); // 0
console.log(r2); // 1.0
console.log(prediccion(4)); // 8
```

### regresionPolinomial(xs, ys, grado)

Regresión polinomial por mínimos cuadrados de grado k.

**Parámetros:**
- `xs` (number[]): Array de valores independientes (al menos grado+1 puntos)
- `ys` (number[]): Array de valores dependientes (misma longitud que xs)
- `grado` (number): Grado del polinomio (entero >= 1)

**Retorno:** (Object) Objeto con propiedades: coeficientes ([a0, a1, ..., ak]), r2, prediccion (función)

**Ejemplo:**
```javascript
const { coeficientes, prediccion } = regresionPolinomial([0, 1, 2, 3], [1, 3, 9, 19], 2);
console.log(coeficientes); // [a0, a1, a2] donde y = a0 + a1*x + a2*x²
console.log(prediccion(4)); // valor estimado en x=4
```
