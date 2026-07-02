// GET estático (raiz do projeto) + POST /save?name=... grava bytes em case-behance/captures
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = '/Users/luizfelipesilvacorreia/Downloads/nothing';
const SAVE_DIR = path.join(ROOT, 'case-behance/captures');
const PORT = 9225;

const TYPES = { '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((req, res) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': '*' };
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }

  if (req.method === 'POST' && req.url.startsWith('/save')) {
    const name = new URL(req.url, 'http://x').searchParams.get('name') || 'upload.png';
    const safe = name.replace(/[^a-zA-Z0-9._-]/g, '');
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const buf = Buffer.concat(chunks);
      fs.writeFileSync(path.join(SAVE_DIR, safe), buf);
      console.log('saved', safe, buf.length + 'B');
      res.writeHead(200, { ...cors, 'Content-Type': 'text/plain' });
      res.end('ok ' + buf.length);
    });
    return;
  }

  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403, cors); return res.end('forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, cors); return res.end('not found'); }
    res.writeHead(200, { ...cors, 'Content-Type': TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('bridge on :' + PORT));
