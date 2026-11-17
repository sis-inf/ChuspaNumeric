# Conversion de Unidades Fisicas

Documentacion de las utilidades de conversion de unidades fisicas disponibles en ChuspaNumeric.

## Categorias y unidades soportadas

### Longitud

Unidad base: metro (m)

| Unidad | Simbolo | Equivalencia en metros |
|---|---|---|
| Metro | m | 1 |
| Kilometro | km | 1000 |
| Centimetro | cm | 0.01 |
| Milimetro | mm | 0.001 |
| Pie | ft | 0.3048 |
| Pulgada | in | 0.0254 |
| Yarda | yd | 0.9144 |
| Milla | mi | 1609.344 |

### Temperatura

Las conversiones de temperatura no son lineales, se manejan con formulas especificas.

| Unidad | Simbolo |
|---|---|
| Celsius | C |
| Fahrenheit | F |
| Kelvin | K |

### Presion

Unidad base: pascal (Pa)

| Unidad | Simbolo | Equivalencia en Pa |
|---|---|---|
| Pascal | Pa | 1 |
| Kilopascal | kPa | 1000 |
| Megapascal | MPa | 1000000 |
| Bar | bar | 100000 |
| Atmosfera | atm | 101325 |

### Energia

Unidad base: julio (J)

| Unidad | Simbolo |
|---|---|
| Julio | J |
| Kilojulio | kJ |
| Megajulio | MJ |
| Caloria | cal |
| Kilocaloria | kcal |
| Kilovatio-hora | kWh |
| Vatio-hora | Wh |
| Electronvoltio | eV |
| BTU | BTU |

## Ejemplos de uso

### Conversion de longitud

    import { convertirLongitud } from 'ChuspaNumeric';

    convertirLongitud(1, 'km', 'm');   // 1000
    convertirLongitud(1, 'ft', 'm');   // 0.3048
    convertirLongitud(100, 'cm', 'm'); // 1

### Conversion de temperatura

    import { convertirTemperatura } from 'ChuspaNumeric';

    convertirTemperatura(100, 'C', 'F'); // 212
    convertirTemperatura(0, 'C', 'K');   // 273.15
    convertirTemperatura(32, 'F', 'C');  // 0

### Conversion de presion

    import { convertirPresion } from 'ChuspaNumeric';

    convertirPresion(1, 'atm', 'Pa');  // 101325
    convertirPresion(1, 'bar', 'kPa'); // 100
    convertirPresion(1, 'MPa', 'bar'); // 10

### Conversion de energia

    import { convertirEnergia } from 'ChuspaNumeric';

    convertirEnergia(1, 'kWh', 'J');   // 3600000
    convertirEnergia(1, 'kcal', 'J');  // 4184
    convertirEnergia(1, 'BTU', 'kJ');  // 1.05505585262

## Consultar unidades disponibles

    import { unidadesDisponibles } from 'ChuspaNumeric';

    const { longitud, temperatura, presion, energia } = unidadesDisponibles();
    console.log(longitud);
    // ['m', 'km', 'cm', 'mm', 'ft', 'in', 'yd', 'mi']

## Manejo de errores

Si se pasa una unidad no soportada o un valor no numerico, se lanza ErrorParametros:

    import { convertirLongitud, ErrorParametros } from 'ChuspaNumeric';

    try {
      convertirLongitud(1, 'km', 'liga');
    } catch (e) {
      if (e instanceof ErrorParametros) {
        console.error(e.message);
        // unidad "liga" no soportada para longitud
      }
    }

## Agregar nuevas unidades

Para agregar una unidad a una categoria existente, editar el archivo src/utils/unidades.js
y agregar una entrada en la tabla de factores correspondiente con su equivalencia a la unidad base.
