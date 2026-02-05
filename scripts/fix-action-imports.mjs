import fs from 'fs';
import path from 'path';

function fixActionImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixActionImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Cambiar @/app/actions/ por @/actions/
      const newContent = content.replace(
        /from ['"]@\/app\/actions\//g,
        'from \'@/actions/'
      );
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing action imports...');
fixActionImports('./src');
console.log('í¾‰ Done!');
