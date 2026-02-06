import fs from 'fs';
import path from 'path';

function fixDynamicImports(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !['node_modules', '.next', '.git'].includes(file)) {
      fixDynamicImports(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix: await import('../../../app/actions/X')
      const newContent = content.replace(
        /import\(['"](\.\.\/)+app\/actions\/([^'"]+)['"]\)/g,
        (match, dots, filename) => {
          return `import('@/actions/${filename}')`;
        }
      );
      
      if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`âœ… Fixed: ${filePath}`);
      }
    }
  });
}

console.log('í´§ Fixing dynamic imports...');
fixDynamicImports('./src');
console.log('í¾‰ Done!');
