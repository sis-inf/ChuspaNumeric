# Checklist de Produccion

Lista de verificacion antes de usar ChuspaNumeric en una aplicacion real.

## Manejo de errores

- [ ] Estas capturando ErrorConvergencia en todos los metodos iterativos?
- [ ] Estas capturando ErrorDivergencia para detectar cuando el metodo no converge?
- [ ] Estas capturando ErrorTimeout para limitar el tiempo de ejecucion?
- [ ] Tienes un bloque try/catch global para errores inesperados?

Ejemplo:

    try {
      const resultado = ChuspaNumeric.biseccion(f, a, b);
    } catch (e) {
      if (e instanceof ChuspaNumeric.ErrorConvergencia) {
        console.error('No convergio:', e.message);
      } else if (e instanceof ChuspaNumeric.ErrorDivergencia) {
        console.error('Divergio:', e.message);
      } else if (e instanceof ChuspaNumeric.ErrorTimeout) {
        console.error('Tiempo excedido:', e.message);
      }
    }

## Sistemas lineales

- [ ] Validaste el numero de condicion de tu matriz antes de resolver?
- [ ] El numero de condicion es menor a 1e10? Si es mayor, los resultados pueden ser imprecisos
- [ ] Usaste el metodo adecuado segun el tipo de matriz?

Verificar numero de condicion:

    const cond = ChuspaNumeric.numeroCondicion(matriz);
    if (cond > 1e10) {
      console.warn('Matriz mal condicionada, precision puede ser baja');
    }

## Version del paquete

- [ ] Fijaste la version exacta de ChuspaNumeric en package.json?
- [ ] Evitaste rangos amplios como ^1.0.0 o ~1.0.0?
- [ ] La API es estable en la version que estas usando?

Ejemplo correcto en package.json:

    {
      "dependencies": {
        "ChuspaNumeric": "1.0.0"
      }
    }

Ejemplo incorrecto:

    {
      "dependencies": {
        "ChuspaNumeric": "^1.0.0"
      }
    }

## Rendimiento

- [ ] Corriste los benchmarks del CLI para tu tamano de problema tipico?
- [ ] El tiempo de ejecucion es aceptable para tu caso de uso?
- [ ] Probaste con los datos reales de produccion, no solo datos de prueba?

Correr benchmarks:

    npx ChuspaNumeric benchmark --size grande

## Tolerancias y precision

- [ ] Configuraste tolerancias adecuadas para tu dominio?
- [ ] Verificaste que los resultados tienen la precision requerida?
- [ ] Documentaste las tolerancias usadas en tu proyecto?

## Tests

- [ ] Tienes tests que cubren los casos limite de tu aplicacion?
- [ ] Probaste con valores en los bordes del dominio valido?
- [ ] Tienes tests de regresion para resultados conocidos?
