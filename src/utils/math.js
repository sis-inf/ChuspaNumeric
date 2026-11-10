function calcularErrorRelativo(valorActual, valorAnterior) {
  if (valorAnterior === 0) return 0;

  return Math.abs((valorActual - valorAnterior) / valorAnterior) * 100;
}

function redondear(numero, decimales) {
  const factor = Math.pow(10, decimales);
  return Math.round(numero * factor) / factor;
}

export { calcularErrorRelativo, redondear };