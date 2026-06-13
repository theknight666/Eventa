const fs = require('fs');
const path = require('path');
const dir = 'src/context';
fs.readdirSync(dir).forEach(file => {
  const p = path.join(dir, file);
  if(p.endsWith('.jsx')) {
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/\(typeof window !== 'undefined' \? localStorage\.getItem : \(\) => null\)/g, "(typeof window !== 'undefined' ? localStorage.getItem.bind(localStorage) : () => null)");
    fs.writeFileSync(p, content, 'utf8');
  }
});
