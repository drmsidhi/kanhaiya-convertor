import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
const owner = process.env.GITHUB_REPOSITORY_OWNER || process.env.SITE_OWNER || 'kanhaiya-convertor';
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.SITE_REPOSITORY || 'kanhaiya-convertor';
const siteUrl = process.env.SITE_URL || `https://${owner}.github.io/${repository}/`;
const routes = ['', 'tools', 'photo-resizer', 'photo-compressor', 'photo-cropper', 'passport-photo-maker', 'pan-photo-resizer', 'aadhaar-photo-resizer', 'visa-photo-maker', 'signature-resizer', 'signature-compressor', 'pan-signature-resizer', 'jpg-to-png', 'png-to-jpg', 'jpg-to-webp', 'image-resize', 'image-compressor', 'jpg-to-pdf', 'image-to-pdf', 'document-image-compressor', 'about', 'privacy', 'terms', 'contact', 'disclaimer'];
await rm('dist', { recursive: true, force: true }); await mkdir('dist');
await cp('src', 'dist/src', { recursive: true }); await cp('config', 'dist/config', { recursive: true }); await cp('presets', 'dist/presets', { recursive: true }); await cp('public', 'dist', { recursive: true });
const template = await readFile('index.html', 'utf8');
const titles = { 'photo-resizer':'Photo Resizer', 'photo-compressor':'Photo Compressor', 'signature-resizer':'Signature Resizer', 'jpg-to-pdf':'JPG to PDF' };
for (const route of routes) {
  const path = route ? `dist/${route}` : 'dist'; await mkdir(path, { recursive: true });
  const url = `${siteUrl}${route ? `${route}/` : ''}`;
  const title = titles[route] ? `${titles[route]} — FileMango` : 'FileMango — Free photo and document tools';
  const base = route ? '../' : './';
  const page = template.replaceAll('https://kanhaiya-convertor.github.io/kanhaiya-convertor/', siteUrl).replace('<head>', `<head><base href="${base}">`).replace(/<link rel="canonical" href="[^"]+"\/>/, `<link rel="canonical" href="${url}"/>`).replace(/<meta property="og:url" content="[^"]+"\/>/, `<meta property="og:url" content="${url}"/>`).replace(/<title>[^<]+<\/title>/, `<title>${title}</title>`);
  await writeFile(`${path}/index.html`, page);
}
const configPath = 'dist/config/site.js'; await writeFile(configPath, (await readFile(configPath, 'utf8')).replace('https://kanhaiya-convertor.github.io/kanhaiya-convertor/', siteUrl));
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${siteUrl}${route ? `${route}/` : ''}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile('dist/sitemap.xml', sitemap);
console.log(`Built ${routes.length} crawlable static pages for ${siteUrl}`);
