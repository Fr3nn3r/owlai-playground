import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://owlai.fr';

// Add your routes here
const routes = [
  {
    path: '/',
    priority: 1.0,
    changefreq: 'weekly'
  },
  {
    path: '/chat',
    priority: 0.9,
    changefreq: 'weekly'
  }
];

async function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map(route => `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  try {
    // Write sitemap to public directory
    const publicDir = path.join(__dirname, '../../public');
    await fs.promises.writeFile(path.join(publicDir, 'sitemap.xml'), sitemapContent);
    console.log('✅ Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

// Generate sitemap when this script is run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateSitemap();
}

export default generateSitemap; 