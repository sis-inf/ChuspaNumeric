# Memoizacion y Timeout en Metodos Iterativos

## Timeout configurable

### Que es

El parametro timeoutMs permite limitar el tiempo maximo de ejecucion de un metodo iterativo. Si el calculo supera ese tiempo, se lanza ErrorTimeout en lugar de esperar indefinidamente.

### Cuando usarlo

- Cuando no puedes garantizar que el metodo converja en tiempo razonable
- En aplicaciones interactivas donde el usuario espera una respuesta rapida
- En servidores donde un calculo infinito bloquearia otros procesos

### Ejemplo con biseccion

    import { biseccion, ErrorTimeout, ErrorConvergencia } from 'chuspanumeric';

    const f = (x) => Math.cos(x) - x;

    try {
      const resultado = biseccion({
        f,
        a: 0,
        b: 1,
        tolerancia: 1e-10,
        maxIter: 10000,
        timeoutMs: 500
      });
      console.log(resultado.resultado); // 0.7390851332151607
    } catch (e) {
      if (e instanceof ErrorTimeout) {
        console.error('Calculo cancelado: supero 500ms');
      } else if (e instanceof ErrorConvergencia) {
        console.error('No convergio en el numero de iteraciones dado');
      }
    }

### Ejemplo con Newton-Raphson

    import { newtonRaphson, ErrorTimeout } from 'chuspanumeric';

    const f  = (x) => x * x - 2;
    const df = (x) => 2 * x;

    try {
      const resultado = newtonRaphson({
        f,
        df,
        x0: 1,
        tolerancia: 1e-12,
        maxIter: 1000,
        timeoutMs: 100
      });
      console.log(resultado.resultado); // 1.4142135623730951
    } catch (e) {
      if (e instanceof ErrorTimeout) {
        console.error('Supero el tiempo limite de 100ms');
      }
    }

### Cuando NO usar timeoutMs

- En scripts de procesamiento por lotes donde el tiempo no es critico
- Cuando el metodo converge rapido y agregar timeout solo suma complejidad
- En calculos donde necesitas el resultado exacto sin importar el tiempo

## Memoizacion

### Que es

La memoizacion es una tecnica de optimizacion que almacena los resultados de llamadas a funciones para evitar recalcularlos cuando se llama con los mismos argumentos.

### Cuando es util en metodos numericos

Algunos metodos numericos evaluan la misma funcion multiples veces con los mismos argumentos. Si la funcion es costosa de calcular, memoizarla puede reducir el tiempo total.

### Ejemplo manual de memoizacion

    function memoizar(f) {
      const cache = new Map();
      return function(x) {
        if (cache.has(x)) return cache.get(x);
        const resultado = f(x);
        cache.set(x, resultado);
        return resultado;
      };
    }

    const fCostosa = (x) => {
      // Simulacion de calculo costoso
      let suma = 0;
      for (let i = 0; i < 1e6; i++) suma += Math.sin(x + i);
      return suma - x;
    };

    const fMemo = memoizar(fCostosa);

    import { biseccion } from 'chuspanumeric';

    const resultado = biseccion({ f: fMemo, a: 0, b: 10, tolerancia: 1e-6 });

### Cuando NO usar memoizacion

- Funciones no deterministas: si f(x) devuelve valores distintos cada vez (por ejemplo, funciones con ruido aleatorio), la memoizacion dara resultados incorrectos
- Funciones con estado mutable: si la funcion depende de variables externas que cambian, el cache quedara desactualizado
- Funciones rapidas: si la funcion es simple (como x*x - 2), el overhead del cache es mayor que el ahorro
