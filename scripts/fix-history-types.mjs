import fs from 'fs';
import path from 'path';

function fixHistoryTypes(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixHistoryTypes(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Quitar import de types.ts local
      let newContent = content.replace(
        /import .* from ['"](\.\/|\.\.\/)types['"];?\n/g,
        ''
      );
      
      // Asegurar que importa de @/types si usa esos tipos
      if (newContent.includes('EditArqueoState') || 
          newContent.includes('HistoryFilters') || 
          newContent.includes('TypedCashAudit')) {
        if (!newContent.includes("from '@/types'")) {
          // Agregar import si no existe
          const firstImport = newContent.indexOf('import');
          if (firstImport !== -1) {
            newContent = newContent.slice(0, firstImport) + 
                        "import type { EditArqueoState, HistoryFilters, TypedCashAudit, HistoryStats, CashAuditData } from '@/types';\n" +
                        newContent.slice(firstImport);
          }
        }
      }
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing HistoryView type imports...');
fixHistoryTypes('./src/components/HistoryView');
console.log('í¾‰ Done!');
