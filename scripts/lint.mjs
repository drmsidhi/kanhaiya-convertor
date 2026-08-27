import { readFile } from 'node:fs/promises';
const files = ['src/main.js', 'src/processors/imageMath.js', 'config/site.js', 'presets/index.js', 'index.html', 'public/sitemap.xml'];
for (const file of files) { const source = await readFile(file, 'utf8'); if (!source.trim()) throw Error(`${file} is empty`); if (/example\.(com|github\.io)/.test(source)) throw Error(`${file} contains a placeholder production URL`); }
const config = await readFile('config/site.js', 'utf8');
for (const property of ['name:', 'url:', 'description:', 'contactEmail:', 'analyticsId:']) if (!config.includes(property)) throw Error(`config/site.js is missing ${property}`);
console.log(`Static source and production configuration checks passed for ${files.length} files.`);
