const VERSION_ACTUAL = "1.0.0";
const TIMEOUT = 2000;

export async function verificarVersion() {
    const versionNode = Number(process.versions.node.split('.')[0]);

    if (versionNode < 16) {
        console.error(
            `Error: ChuspaNumeric CLI requiere Node.js 16 o superior. Versión detectada: ${process.versions.node}`
        );
        process.exit(1);
        return;
    }

    try {
        const controller = new AbortController();

        const tiempo = setTimeout(() => {
            controller.abort();
        }, TIMEOUT);

        const respuesta = await fetch(
            "https://registry.npmjs.org/chuspanumeric/latest",
            {
                signal: controller.signal,
            }
        );

        clearTimeout(tiempo);

        if (!respuesta.ok) {
            return;
        }

        const datos = await respuesta.json();

        if (datos.version !== VERSION_ACTUAL) {
            console.log(
                `Hay una nueva versión disponible: ${datos.version}`
            );
        } else {
            console.log("El CLI está actualizado.");
        }
    } catch {
        return;
    }
}