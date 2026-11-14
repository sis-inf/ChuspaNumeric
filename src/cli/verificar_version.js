
const VERSION_ACTUAL = "1.0.0";
const NOMBRE_PAQUETE = "chuspanumeric";
const TIMEOUT = 2000;
export async function verificarVersion() {
    const versionNode = Number(process.versions.node.split('.')[0]);

    if (versionNode < 16) {
        console.error(
            `Error: El CLI de ${NOMBRE_PAQUETE} requiere Node.js 16 o superior. Versión detectada: ${process.versions.node}`
        );
        process.exit(1);
        return;
    }

    const controller = new AbortController();

    const tiempo = setTimeout(() => {
        controller.abort();
    }, TIMEOUT);

    try {
        const respuesta = await fetch(
            `https://registry.npmjs.org/${NOMBRE_PAQUETE}/latest`,
            {
                signal: controller.signal,
            }
        );

        if (!respuesta.ok) {
            return;
        }

        const datos = await respuesta.json();

        if (datos.version !== VERSION_ACTUAL) {
            console.log(
                `Hay una nueva versión de ${NOMBRE_PAQUETE} disponible: ${datos.version}`
            );
        } else {
            console.log(
                `El CLI de ${NOMBRE_PAQUETE} está actualizado.`
            );
        }
    } catch {
        return;
    } finally {
        clearTimeout(tiempo);
    }
}
