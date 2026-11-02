# Subpath Imports por Categoria

Documentacion de los subpath imports disponibles en chuspanumeric y cuando usarlos.

## Que son los subpath imports

Los subpath imports permiten importar solo una categoria especifica de chuspanumeric en lugar del paquete completo. Esto reduce el tamano del bundle en aplicaciones que solo usan una parte de la libreria.

## Sintaxis

En lugar de importar todo el paquete:

    import { biseccion, euler, simpson } from 'chuspanumeric';

Puedes importar solo la categoria que necesitas:

    import { euler } from 'chuspanumeric/edo';
    import { biseccion } from 'chuspanumeric/no-lineales';
    import { simpson } from 'chuspanumeric/integracion';

## Categorias disponibles

| Subpath | Categoria | Metodos principales |
|---|---|---|
| chuspanumeric/no-lineales | Ecuaciones no lineales | biseccion, newtonRaphson, secante, puntoFijo |
| chuspanumeric/lineales | Sistemas lineales | gaussJordan, gaussSeidel, jacobi |
| chuspanumeric/interpolacion | Interpolacion | lagrange, newtonInterpolacion, splineCubico |
| chuspanumeric/edo | Ecuaciones diferenciales | euler, eulerMejorado, rungeKutta4 |
| chuspanumeric/integracion | Integracion numerica | trapecio, simpson13, simpson38, gaussLegendre |
| chuspanumeric/diferencias | Diferencias finitas | diferenciaProgresiva, diferenciaRegresiva, diferenciaCentral |
| chuspanumeric/matricial | Algebra matricial | determinante, inversa, descomposicionLU |
| chuspanumeric/polinomios | Operaciones con polinomios | evaluarPolinomio, sumarPolinomios |
| chuspanumeric/analisis | Analisis numerico | regresionLineal, regresionNoLineal |
| chuspanumeric/utils | Utilidades | convertirLongitud, convertirTemperatura, memoizar |

## Ejemplos de uso

### Importar solo metodos de EDO

    import { euler, rungeKutta4 } from 'chuspanumeric/edo';

    const f = (t, y) => -2 * y;

    const resultado = rungeKutta4({ f, t0: 0, y0: 1, h: 0.1, n: 10 });
    console.log(resultado);

### Importar solo integracion numerica

    import { simpson13, trapecio } from 'chuspanumeric/integracion';

    const f = (x) => Math.sin(x);

    const r1 = simpson13({ f, a: 0, b: Math.PI, n: 100 });
    const r2 = trapecio({ f, a: 0, b: Math.PI, n: 100 });

    console.log(r1.resultado); // ~2
    console.log(r2.resultado); // ~2

### Importar solo conversion de unidades

    import { convertirLongitud, convertirTemperatura } from 'chuspanumeric/utils';

    convertirLongitud(1, 'km', 'm');      // 1000
    convertirTemperatura(100, 'C', 'F');  // 212

## Cuando usar subpath imports vs paquete completo

### Usar subpath imports cuando:

- Tu aplicacion usa solo una o dos categorias de chuspanumeric
- El tamano del bundle es importante (aplicaciones web, moviles)
- Quieres dejar claro en el codigo que dependencias usa cada modulo
- Usas tree-shaking y quieres asegurarte de no incluir codigo innecesario

### Usar el paquete completo cuando:

- Tu aplicacion usa metodos de muchas categorias distintas
- Estas en un entorno Node.js donde el tamano del bundle no importa
- Prefieres un solo import centralizado para facilitar el mantenimiento

## Diferencia con tree-shaking

Los subpath imports y el tree-shaking son complementarios:

- Tree-shaking elimina automaticamente el codigo no usado durante el build
- Los subpath imports hacen explicito que categorias se importan

Si tu bundler soporta tree-shaking correctamente, el resultado final puede ser similar. Los subpath imports son utiles cuando el bundler no soporta tree-shaking o cuando quieres hacer el codigo mas legible.
