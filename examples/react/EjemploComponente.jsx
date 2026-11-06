import React from "react";
import { useTrazo } from "./useTrazo";

export default function EjemploComponente() {
  const { resultado, loading, error, ejecutarMetodo } = useTrazo();

  const calcularRaiz = () => {
    const funcion = (x) => x * x - 4;
    ejecutarMetodo(funcion, 0, 5);
  };

  return (
    <div>
      <h2>Ejemplo de integración de ChuspaNumeric con React</h2>

      <button onClick={calcularRaiz}>
        Ejecutar método de bisección
      </button>

      {loading && <p>Calculando resultado...</p>}

      {error && <p>Error: {error}</p>}

      {resultado && (
        <div>
          <h3>Resultado</h3>
          <pre>{JSON.stringify(resultado, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
