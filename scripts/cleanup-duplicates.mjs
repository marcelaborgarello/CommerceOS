import fs from 'fs';
import path from 'path';

console.log('Ì¥ç Buscando duplicados y hooks mal ubicados...\n');

// 1. Borrar carpetas actions duplicadas
const carpetasABorrar = [
  './src/app/actions',
  './src/app/(dashboard)/cash-audit/actions'
];

carpetasABorrar.forEach(carpeta => {
  if (fs.existsSync(carpeta)) {
    console.log(`Ì∑ëÔ∏è  Borrando: ${carpeta}`);
    fs.rmSync(carpeta, { recursive: true, force: true });
    console.log(`‚úÖ Borrado: ${carpeta}\n`);
  } else {
    console.log(`‚è≠Ô∏è  No existe: ${carpeta} (ya est√° limpio)\n`);
  }
});

// 2. Verificar si el hook est√° mal ubicado
const hookOrigen = './src/actions/useArqueoActions.ts';
const hookDestino = './src/components/HistoryView/hooks/useArqueoActions.ts';

if (fs.existsSync(hookOrigen)) {
  console.log(`Ì¥Ñ Moviendo hook: ${hookOrigen} -> ${hookDestino}`);
  
  // Crear directorio si no existe
  const dirDestino = path.dirname(hookDestino);
  if (!fs.existsSync(dirDestino)) {
    fs.mkdirSync(dirDestino, { recursive: true });
  }
  
  fs.renameSync(hookOrigen, hookDestino);
  console.log(`‚úÖ Hook movido correctamente\n`);
} else {
  console.log(`‚è≠Ô∏è  Hook ya est√° en su lugar correcto\n`);
}

console.log('Ìæâ Limpieza completa!\n');
console.log('Ì≥ã Resumen:');
console.log('  - Carpetas duplicadas borradas');
console.log('  - Hooks en su lugar correcto');
console.log('  - Solo queda /src/actions/ con las actions centralizadas');
