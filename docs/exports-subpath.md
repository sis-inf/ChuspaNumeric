# Subpath Imports por Categoria

Documentacion de los subpath imports disponibles en ChuspaNumeric y cuando usarlos.

## Que son los subpath imports

Los subpath imports permiten importar solo una categoria especifica de ChuspaNumeric en lugar del paquete completo. Esto reduce el tamano del bundle en aplicaciones que solo usan una parte de la libreria.

Para que una categoria pueda importarse mediante un subpath, su punto de entrada debe estar declarado en la propiedad `exports` del archivo `package.json`.

Actualmente, el paquete solo tiene configurado el punto de entrada principal (`.`). Por lo tanto, las importaciones independientes por categoria todavia no estan disponibles.

## Sintaxis

En lugar de importar todo el paquete:

    import { biseccion, euler, simpson } from 'chuspanumeric';

Actualmente, las importaciones deben realizarse desde el punto de entrada principal del paquete. No se deben utilizar rutas por categoria porque no estan configuradas en `package.json`.

## Categorias disponibles

La siguiente tabla describe las categorias y sus metodos principales. Se presentan como una clasificacion de las funcionalidades de la biblioteca, no como subpaths disponibles para importacion.

| Categoria | Metodos principales |
|---|---|
| Ecuaciones no lineales | biseccion, newtonRaphson, secante, puntoFijo |
| Sistemas lineales | gaussJordan, gaussSeidel, jacobi |
| Interpolacion | lagrange, newtonInterpolacion, splineCubico |
| Ecuaciones diferenciales | euler, eulerMejorado, rungeKutta4 |
| Integracion numerica | trapecio, simpson13, simpson38, gaussLegendre |
| Diferencias finitas | diferenciaProgresiva, diferenciaRegresiva, diferenciaCentral |
| Algebra matricial | determinante, inversa, descomposicionLU |
| Operaciones con polinomios | evaluarPolinomio, sumarPolinomios |
| Analisis numerico | regresionLineal, regresionNoLineal |
| Utilidades | convertirLongitud, convertirTemperatura, memoizar |

## Ejemplos de uso

Los siguientes ejemplos muestran las operaciones de distintas categorias. Son ilustrativos y no incluyen importaciones por categoria, ya que los subpaths correspondientes todavia no estan configurados.

### Ejemplo de metodos de EDO

    const f = (t, y) => -2 * y;

    const resultado = rungeKutta4({ f, t0: 0, y0: 1, h: 0.1, n: 10 });
    console.log(resultado);

### Ejemplo de integracion numerica

    const f = (x) => Math.sin(x);

    const r1 = simpson13({ f, a: 0, b: Math.PI, n: 100 });
    const r2 = trapecio({ f, a: 0, b: Math.PI, n: 100 });

    console.log(r1.resultado); // ~2
    console.log(r2.resultado); // ~2

### Ejemplo de conversion de unidades

    convertirLongitud(1, 'km', 'm');      // 1000
    convertirTemperatura(100, 'C', 'F');  // 212

Para ejecutar estos ejemplos, las funciones utilizadas deben estar disponibles desde el punto de entrada principal del paquete.

## Cuando usar subpath imports vs paquete completo

### Usar subpath imports cuando:

- Tu aplicacion usa solo una o dos categorias de ChuspaNumeric.
- El tamano del bundle es importante (aplicaciones web, moviles).
- Quieres dejar claro en el codigo que dependencias usa cada modulo.
- Usas tree-shaking y quieres asegurarte de no incluir codigo innecesario.

Estas ventajas corresponden al uso general de los subpath imports. Actualmente, las rutas por categoria no estan configuradas en el paquete.

### Usar el paquete completo cuando:

- Tu aplicacion usa metodos de muchas categorias distintas.
- Estas en un entorno Node.js donde el tamano del bundle no importa.
- Prefieres un solo import centralizado para facilitar el mantenimiento.

## Diferencia con tree-shaking

Los subpath imports y el tree-shaking son complementarios:

- Tree-shaking elimina automaticamente el codigo no usado durante el build.
- Los subpath imports hacen explicito que categorias se importan desde puntos de entrada independientes configurados por el paquete.

Si tu bundler soporta tree-shaking correctamente, el resultado final puede ser similar. Los subpath imports son utiles cuando el bundler no soporta tree-shaking o cuando quieres hacer el codigo mas legible.