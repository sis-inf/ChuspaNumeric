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
    nodos = [
      -0.8611363115940526,
      -0.3399810435848563,
      0.3399810435848563,
      0.8611363115940526,
    ];
    pesos = [
      0.3478548451374538,
      0.6521451548625461,
      0.6521451548625461,
      0.3478548451374538,
    ];
  } else if (puntos === 5) {
    nodos = [
      -0.906179845938664,
      -0.5384693101056831,
      0,
      0.5384693101056831,
      0.906179845938664,
    ];
    pesos = [
      0.2369268850561891,
      0.4786286704993665,
      0.5688888888888889,
      0.4786286704993665,
      0.2369268850561891,
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