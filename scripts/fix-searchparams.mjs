import fs from 'fs';
import path from 'path';

function fixSearchParams(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixSearchParams(filePath);
    } else if (file === 'page.tsx' || file === 'page.ts') {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Buscar funciones que usen searchParams
      if (content.includes('searchParams') && content.includes('export default async function')) {
        // Si ya tiene await searchParams, skip
        if (content.includes('await searchParams')) return;
        
        // Agregar await despuÃ©s de la declaraciÃ³n de la funciÃ³n
        content = content.replace(
          /(export default async function \w+\([^)]*\)\s*{)/,
          '$1\n    const params = await searchParams;'
        );
        
        // Reemplazar searchParams.X por params.X
        content = content.replace(/searchParams\.(\w+)/g, 'params.$1');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing searchParams in all pages...');
fixSearchParams('./src/app');
console.log('í¾‰ Done!');
