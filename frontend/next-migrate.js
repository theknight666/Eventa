const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function migrateFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Link replacement
  // Replace <Link to="/path"> with <Link href="/path">
  content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
  
  // 2. Import replacements
  // Remove react-router-dom imports and replace with Next.js equivalents
  const rrdImportRegex = /import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];/g;
  let match;
  while ((match = rrdImportRegex.exec(content)) !== null) {
    const importedHooks = match[1].split(',').map(s => s.trim());
    let newImports = [];
    
    if (importedHooks.includes('Link')) {
      newImports.push(`import Link from "next/link";`);
    }
    
    const routerHooks = [];
    if (importedHooks.includes('useNavigate')) routerHooks.push('useRouter');
    if (importedHooks.includes('useLocation')) routerHooks.push('useRouter');
    if (importedHooks.includes('useParams')) routerHooks.push('useRouter');
    
    // De-duplicate router hooks
    const uniqueRouterHooks = [...new Set(routerHooks)];
    if (uniqueRouterHooks.length > 0) {
      newImports.push(`import { ${uniqueRouterHooks.join(', ')} } from "next/router";`);
    }
    
    content = content.replace(match[0], newImports.join('\n'));
  }

  // 3. Hook replacements in component bodies
  // useNavigate() -> useRouter()
  // useLocation() -> useRouter()
  // useParams() -> useRouter()
  // const navigate = useNavigate() -> const router = useRouter()
  // const location = useLocation() -> const router = useRouter()
  // const { id } = useParams() -> const router = useRouter(); const { id } = router.query;
  
  content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\)/g, 'const router = useRouter()');
  // replace navigate(...) with router.push(...)
  content = content.replace(/navigate\(/g, 'router.push(');
  
  // location
  content = content.replace(/const\s+(\w+)\s*=\s*useLocation\(\)/g, 'const router = useRouter()');
  // replace location.pathname with router.pathname
  content = content.replace(/location\.pathname/g, 'router.pathname');
  // replace location.state with window.history.state? Next.js doesn't have location.state easily.
  // We will let manual fixes handle location.state if it exists.
  
  // useParams
  content = content.replace(/const\s+{([^}]+)}\s*=\s*useParams\(\)/g, 'const router = useRouter();\n  const { $1 } = router.query');
  content = content.replace(/const\s+(\w+)\s*=\s*useParams\(\)/g, 'const router = useRouter();\n  const $1 = router.query');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Migrated: ${filePath}`);
  }
}

walkDir(path.join(__dirname, 'src'), migrateFile);
console.log('Migration complete.');
