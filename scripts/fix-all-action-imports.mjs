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
      let modified = false;
      
      // PatrÃ³n 1: import X from '@/app/actions/Y'
      let newContent = content.replace(
        /from ['"]@\/app\/actions\/([^'"]+)['"]/g,
        (match, filename) => {
          modified = true;
          return `from '@/actions/${filename}'`;
        }
      );
      
      // PatrÃ³n 2: await import('@/app/actions/Y')
      newContent = newContent.replace(
        /import\(['"]@\/app\/actions\/([^'"]+)['"]\)/g,
        (match, filename) => {
          modified = true;
          return `import('@/actions/${filename}')`;
        }
      );
      
      if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing ALL action imports...');
fixActionImports('./src');
console.log('í¾‰ Done!');
