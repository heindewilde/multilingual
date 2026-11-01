#!/usr/bin/env node
/**
 * Serves a static build the way production static hosts do: an exact file first, then
 * <path>.html, then <path>/index.html, and a 404 otherwise. Many preview servers fall
 * back to the homepage for every unknown path, which makes every page hydrate against
 * the wrong HTML and look broken.
 *
 *   node serve-static.mjs <dir> [--port 4173] [--spa]
 *
 * --spa  serve <dir>/index.html for unknown non-asset paths (only for real SPAs).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const root = path.resolve(args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--port') ?? 'out');
const port = Number(option('--port', 4173));
const spa = flag('--spa');

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

if (!fs.existsSync(root)) {
  console.error(`No such directory: ${root}`);
  process.exit(1);
}

const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const target = path.join(root, urlPath);
    if (!target.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    let file = [target, `${target.replace(/\/$/, '')}.html`, path.join(target, 'index.html')].find(isFile);
    let status = 200;
    if (!file) {
      const looksLikeAsset = path.extname(urlPath) !== '';
      if (spa && !looksLikeAsset) file = path.join(root, 'index.html');
      else if (isFile(path.join(root, '404.html'))) {
        file = path.join(root, '404.html');
        status = 404;
      } else {
        res.writeHead(404, { 'content-type': 'text/plain' });
        return res.end('404');
      }
    }
    res.writeHead(status, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));
