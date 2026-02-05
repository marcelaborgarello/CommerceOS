import fs from 'fs';
import path from 'path';

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      const newContent = content.replace(
        /from ['"](\.\.[\/\\])+([^'"]+)['"]/g,
        (match, dots, importPath) => {
          modified = true;
          const cleanPath = importPath.replace(/\\/g, '/');
          return `from '@/${cleanPath}'`;
        }
      );
      
      if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing imports...');
fixImports('./src');
console.log('í¾‰ Done!');
