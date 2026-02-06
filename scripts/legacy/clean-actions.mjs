import fs from 'fs';
import path from 'path';

const DESTINO = './src/actions';

// 1. Crear la carpeta de destino si no existe
if (!fs.existsSync(DESTINO)) {
    fs.mkdirSync(DESTINO, { recursive: true });
}

function procesarDirectorio(directorioActual) {
    const archivos = fs.readdirSync(directorioActual);

    archivos.forEach(archivo => {
        const rutaCompleta = path.join(directorioActual, archivo);
        const stats = fs.statSync(rutaCompleta);

        if (stats.isDirectory()) {
            // No entrar en node_modules ni .git
            if (archivo !== 'node_modules' && archivo !== '.git' && archivo !== 'actions') {
                procesarDirectorio(rutaCompleta);
                // 3. Borrar carpeta si quedó vacía después de mover archivos
                if (fs.readdirSync(rutaCompleta).length === 0) {
                    fs.rmdirSync(rutaCompleta);
                }
            }
        } else {
            // 2. Si el archivo incluye "action" y no está ya en el destino
            if (archivo.toLowerCase().includes('action') && !directorioActual.includes('src/actions')) {
                const rutaDestino = path.join(DESTINO, archivo);
                console.log(`Moviendo: ${archivo} -> ${DESTINO}`);
                fs.renameSync(rutaCompleta, rutaDestino);
            }
        }
    });
}

console.log("Iniciando limpieza de Actions...");
procesarDirectorio('./src'); // O puedes poner './' para barrer todo
console.log("¡Limpieza terminada, jefa!");