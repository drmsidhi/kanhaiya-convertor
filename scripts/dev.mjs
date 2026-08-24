import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { execSync } from 'node:child_process';
execSync('node scripts/build.mjs', { stdio: 'inherit' });
const root = join(process.cwd(), 'dist');
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.webmanifest':'application/manifest+json', '.xml':'application/xml', '.txt':'text/plain' };
createServer(async (req, res) => { try { const url = decodeURIComponent(req.url.split('?')[0]); const path = normalize(join(root, url, extname(url) ? '' : 'index.html')); if (!path.startsWith(root)) throw Error('unsafe path'); await stat(path); res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream'); res.end(await readFile(path)); } catch { res.writeHead(404); res.end('Not found'); } }).listen(5173, () => console.log('http://localhost:5173'));
