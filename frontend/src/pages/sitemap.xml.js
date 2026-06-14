import { getEvents } from "../lib/api";

const EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://eventa.in';

function generateSiteMap(events) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- We manually set the two URLs we know already-->
     <url>
       <loc>${EXTERNAL_DATA_URL}</loc>
     </url>
     ${events
       .map(({ id, date }) => {
         return `
       <url>
           <loc>${EXTERNAL_DATA_URL}/event/${id}</loc>
           <lastmod>${new Date(date).toISOString()}</lastmod>
       </url>
     `;
       })
       .join('')}
   </urlset>
 `;
}

export async function getServerSideProps({ res }) {
  try {
    // Fetch top 1000 events to keep sitemap manageable, or you can implement pagination/sitemap index
    const data = await getEvents({ limit: 1000 });
    const events = data.events || [];

    // We generate the XML sitemap with the events data
    const sitemap = generateSiteMap(events);

    res.setHeader('Content-Type', 'text/xml');
    // we send the XML to the browser
    res.write(sitemap);
    res.end();
  } catch (e) {
    console.error("Failed to generate sitemap", e);
    res.statusCode = 500;
    res.end();
  }

  return {
    props: {},
  };
}

export default function SiteMap() {
  // getServerSideProps will do the heavy lifting
}
