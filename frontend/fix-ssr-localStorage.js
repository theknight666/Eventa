const fs = require('fs');
const path = require('path');

function replaceContext(filename, defaultVal) {
  let filepath = path.join(__dirname, 'src', 'context', filename);
  if (!fs.existsSync(filepath)) return;
  
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Quick fix: if typeof window !== 'undefined'
  content = content.replace(/localStorage\.getItem/g, "(typeof window !== 'undefined' ? localStorage.getItem : () => null)");
  content = content.replace(/localStorage\.setItem/g, "if (typeof window !== 'undefined') localStorage.setItem");
  content = content.replace(/localStorage\.removeItem/g, "if (typeof window !== 'undefined') localStorage.removeItem");

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed', filename);
}

replaceContext('ThemeContext.jsx');
replaceContext('UserContext.jsx');
replaceContext('SavedContext.jsx');
replaceContext('OrganizerContext.jsx');
