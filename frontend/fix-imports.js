const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function fixImports(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace relative imports that point to src folders with alias @/
  content = content.replace(/from\s+["']\.\.\/\.\.\/(components|lib|data|context|assets|pages)(.*?)["']/g, 'from "@/$1$2"');
  content = content.replace(/from\s+["']\.\.\/(components|lib|data|context|assets|pages)(.*?)["']/g, 'from "@/$1$2"');
  content = content.replace(/from\s+["']\.\/(components|lib|data|context|assets|pages)(.*?)["']/g, 'from "@/$1$2"');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), fixImports);
console.log('Import fix complete.');
