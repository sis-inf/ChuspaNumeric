function gaussLegendre(f, a, b, puntos) {
  let nodos;
  let pesos;

  if (puntos === 2) {
    nodos = [-1 / Math.sqrt(3), 1 / Math.sqrt(3)];
    pesos = [1, 1];
  } else if (puntos === 3) {
    nodos = [-Math.sqrt(3 / 5), 0, Math.sqrt(3 / 5)];
    pesos = [5 / 9, 8 / 9, 5 / 9];
  } else if (puntos === 4) {
    const raiz6sobre5 = Math.sqrt(6 / 5);
    const nodoExterno4 = Math.sqrt((3 + 2 * raiz6sobre5) / 7);
    const nodoInterno4 = Math.sqrt((3 - 2 * raiz6sobre5) / 7);
    nodos = [-nodoExterno4, -nodoInterno4, nodoInterno4, nodoExterno4];
    pesos = [
      (18 - Math.sqrt(30)) / 36,
      (18 + Math.sqrt(30)) / 36,
      (18 + Math.sqrt(30)) / 36,
      (18 - Math.sqrt(30)) / 36,
    ];
  } else if (puntos === 5) {
    const raiz10sobre7 = Math.sqrt(10 / 7);
    const nodoExterno5 = Math.sqrt(5 + 2 * raiz10sobre7) / 3;
    const nodoInterno5 = Math.sqrt(5 - 2 * raiz10sobre7) / 3;
    nodos = [-nodoExterno5, -nodoInterno5, 0, nodoInterno5, nodoExterno5];
    pesos = [
      (322 - 13 * Math.sqrt(70)) / 900,
      (322 + 13 * Math.sqrt(70)) / 900,
      128 / 225,
      (322 + 13 * Math.sqrt(70)) / 900,
      (322 - 13 * Math.sqrt(70)) / 900,
    ];
  } else {
    throw new Error("puntos debe ser 2, 3, 4 o 5");
  }

  let suma = 0;

  for (let i = 0; i < nodos.length; i++) {
    const x =
      ((b - a) / 2) * nodos[i] +
      ((a + b) / 2);

    suma += pesos[i] * f(x);
  }

  return ((b - a) / 2) * suma;
}

export default gaussLegendre;