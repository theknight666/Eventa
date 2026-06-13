const fs = require('fs');

function fixNavigate(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Add import { useRouter } if missing
  if (!content.includes('useRouter')) {
    content = content.replace(/import React/, 'import { useRouter } from "next/router";\nimport React');
  }

  // Find the component start to insert useRouter
  if (content.includes('export default function SavedEvents() {')) {
    content = content.replace('export default function SavedEvents() {', 'export default function SavedEvents() {\n  const router = useRouter();');
  }
  if (content.includes('export default function Dashboard() {')) {
    content = content.replace('export default function Dashboard() {', 'export default function Dashboard() {\n  const router = useRouter();');
  }

  // Add the redirect effect before the return
  const effect = `
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);
`;
  
  if (content.includes('return <Navigate to="/" />;')) {
    content = content.replace('return <Navigate to="/" />;', 'return null;');
    content = content.replace('if (!user) {', effect + '\n  if (!user) {');
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Fixed Navigate in', filepath);
}

fixNavigate('src/pages/saved.jsx');
fixNavigate('src/pages/dashboard.jsx');
