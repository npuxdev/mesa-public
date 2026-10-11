import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import {handleApi,startAutomation} from './backend/api.mjs';

try {process.loadEnvFile(resolve(import.meta.dirname,'.env.local'));} catch(error) {if(error.code!=='ENOENT')throw error;}

const root = resolve(import.meta.dirname);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    if(url.pathname.startsWith('/api/')) {await handleApi(req,res,url.pathname);return;}
    const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    let file = resolve(root, relative || 'index.html');
    const publicAsset=/^(dist\/[a-z0-9-]+\.js|assets\/[a-z0-9_./-]+\.(svg|png|jpg|webp|woff2)|[a-z0-9-]+\.(html|css|js|svg|png))$/i.test(relative);
    if (!file.startsWith(root + sep) || relative.startsWith('.') || relative.includes('..') || (extname(relative)&&!publicAsset)) {
      res.writeHead(404); res.end('Unavailable'); return;
    }
    if (!extname(relative)) file = resolve(root, 'index.html');
    if (!(await stat(file)).isFile()) throw new Error('unavailable');
    res.writeHead(200, { 'Content-Type': `${types[extname(file)] || 'text/plain'}; charset=utf-8`, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' });
    res.end(await readFile(file));
  } catch { res.writeHead(404); res.end('Unavailable'); }
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => {console.log(`STRATA local UI: http://127.0.0.1:${process.env.PORT||4173}`);startAutomation();});
