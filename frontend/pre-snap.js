const fs = require('fs');

async function main() {
  const pkgPath = './package.json';
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  
  if (!pkg.reactSnap) {
    pkg.reactSnap = { include: [] };
  }
  
  const staticRoutes = [
    "/", "/about", "/contact", "/organizer", "/partnerships",
    "/blog", 
    "/blog/best-tech-events-in-bangalore-2026",
    "/blog/startup-networking-events-india",
    "/blog/ai-conferences-india-2026",
    "/events/technology", "/events/startup", "/events/ai",
    "/events/bangalore", "/events/mumbai", "/events/delhi"
  ];
  let eventRoutes = [];

  try {
    const res = await fetch('https://eventa-backend.onrender.com/api/events?featured=true');
    if (res.ok) {
      const data = await res.json();
      eventRoutes = data.events.slice(0, 10).map(e => `/event/${e.slug || e.id}`);
      console.log(`[pre-snap] Successfully fetched ${eventRoutes.length} event routes.`);
    } else {
      console.warn(`[pre-snap] Backend returned ${res.status}. Using fallback routes.`);
    }
  } catch (err) {
    console.warn('[pre-snap] Failed to fetch events (backend may be asleep):', err.message);
  }

  // Combine and deduplicate routes
  pkg.reactSnap.include = Array.from(new Set([...staticRoutes, ...eventRoutes]));
  
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`[pre-snap] Injected total ${pkg.reactSnap.include.length} routes into package.json`);
}

main();
