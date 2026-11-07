# CLI Benchmark — Subcomando bench

> [!WARNING]
> El subcomando `chuspanumeric bench` todavía no está implementado ni disponible en el CLI. Este documento conserva la especificación prevista para una futura implementación. Los comandos y ejemplos descritos a continuación no deben considerarse funcionales actualmente.

Documentacion del subcomando bench para medir el rendimiento de los metodos numericos de ChuspaNumeric.

## Comando

    node scripts/benchmark.js

O si ChuspaNumeric esta instalado globalmente:

    chuspanumeric bench

## Que mide

El benchmark ejecuta cada metodo numerico con un caso de prueba representativo y mide su tiempo de ejecucion. Para obtener resultados estables, cada metodo se ejecuta 1000 veces y se calcula el promedio (excluyendo las primeras 5 iteraciones de calentamiento para evitar medir la compilacion JIT).

## Ejemplo de salida

    # Resultados de benchmark (Node v20.0.0)
    categoria,metodo,tiempo_promedio_ms,iteraciones_por_segundo,repeticiones,error

    Ecuaciones no lineales,biseccion,0.0023,434782,1000,
    Ecuaciones no lineales,newtonRaphson,0.0011,909090,1000,
    Ecuaciones no lineales,secante,0.0015,666666,1000,
    Sistemas lineales,gauss,0.0045,222222,1000,
    Sistemas lineales,jacobi,0.0098,102040,1000,
    Interpolacion,lagrange,0.0031,322580,1000,
    Integracion numerica,trapecio,0.0089,112359,1000,
    EDO,euler,0.1234,8103,1000,
    EDO,rungeKutta4,0.4521,2212,1000,

## Como interpretar la tabla

### tiempo_promedio_ms

Tiempo promedio de ejecucion de una llamada al metodo en milisegundos. Cuanto menor, mas rapido el metodo.

### iteraciones_por_segundo

Cuantas veces puede ejecutarse el metodo en un segundo. Util para estimar cuantos calculos puede manejar tu aplicacion.

    iteraciones_por_segundo = 1000 / tiempo_promedio_ms

### repeticiones

Numero de veces que se ejecuto el metodo para calcular el promedio. Siempre es 1000 en este benchmark.

### error

Si el metodo fallo durante el benchmark, aqui aparece el mensaje de error. Vacio si el metodo funciono correctamente.

## Como usar los resultados

### Elegir el metodo mas rapido para tu caso

Si necesitas resolver muchas raices de ecuaciones, compara biseccion vs newtonRaphson:

- biseccion: mas lento pero siempre converge si hay cambio de signo
- newtonRaphson: mas rapido pero requiere la derivada y puede divergir

### Estimar el tiempo total de un calculo masivo

Si tu aplicacion necesita resolver 10000 sistemas lineales con gauss (0.0045ms cada uno):

    tiempo_total = 10000 * 0.0045ms = 45ms

### Identificar cuellos de botella

Si un metodo tarda 10x mas que los demas, considera:
- Reducir el numero de iteraciones (maxIter)
- Aumentar la tolerancia si la precision exacta no es critica
- Usar un metodo alternativo mas rapido para tu caso especifico

## Salida JSON

Al final del benchmark se imprime un JSON con todos los resultados, util para procesar los datos programaticamente:

    # JSON
    [
      {
        "categoria": "Ecuaciones no lineales",
        "nombre": "biseccion",
        "promedio": 0.0023,
        "iteracionesPorSegundo": 434782
      },
      ...
    ]

## Ejecutar solo una categoria

Para comparar solo los metodos de EDO:

    node scripts/benchmark.js | grep EDO
