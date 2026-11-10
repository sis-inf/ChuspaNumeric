function formatearTablaIteraciones(tabla, opciones = {}) {
  const {
    anchoColumna = 12,
    precision = 6,
    cabecera = true,
  } = opciones;

  if (!Array.isArray(tabla) || tabla.length === 0) {
    return '';
  }

  const columnas = Object.keys(tabla[0]);
  const resultado = [];

  if (cabecera) {
    resultado.push(
      columnas
        .map(col => col.padEnd(anchoColumna))
        .join(' ')
    );
  }

  tabla.forEach((fila) => {
    resultado.push(
      columnas
        .map((col) => {
          const valor = fila[col];

          if (typeof valor === 'number') {
            return valor
              .toFixed(precision)
              .padStart(anchoColumna);
          }

          return String(valor ?? '')
            .padEnd(anchoColumna);
        })
        .join(' ')
    );
  });

  return resultado.join('\n');
}

export { formatearTablaIteraciones };