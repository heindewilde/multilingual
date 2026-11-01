#!/usr/bin/env node
/**
 * Positive control for the hydration check. Proxies a running production server but
 * changes one piece of text in its HTML responses, so the server markup no longer matches
 * what React renders in the browser. Loading a page through it must produce a hydration
 * error (React #418) in the console capture; if it doesn't, the capture can't see
 * hydration errors and a clean result proves nothing.
 *
 *   node mismatch-proxy.mjs --target http://localhost:3000 --find "Welcome" --replace "WELCOME" [--port 3299]
 *
 * Pick --find text that appears on the page you load through the proxy.
 */
import http from 'node:http';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : fallback;
};
const target = option('--target')?.replace(/\/$/, '');
const find = option('--find');
const replace = option('--replace');
const port = Number(option('--port', 3299));
if (!target || !find || replace === undefined) {
  console.error('usage: mismatch-proxy.mjs --target <url> --find <text> --replace <text> [--port 3299]');
  process.exit(2);
}

http
  .createServer(async (req, res) => {
    try {
      const upstream = await fetch(target + req.url, {
        method: req.method,
        headers: { accept: req.headers.accept ?? '*/*', 'accept-language': req.headers['accept-language'] ?? '' },
        redirect: 'manual',
      });
      const type = upstream.headers.get('content-type') ?? '';
      let body = Buffer.from(await upstream.arrayBuffer());
      if (type.includes('text/html')) {
        const html = body.toString('utf8');
        if (!html.includes(find)) console.warn(`warning: "${find}" not found in ${req.url}; this page will not mismatch`);
        body = Buffer.from(html.replace(find, replace));
      }
      const headers = { 'content-type': type };
      const location = upstream.headers.get('location');
      if (location) headers.location = location;
      res.writeHead(upstream.status, headers);
      res.end(body);
    } catch (e) {
      res.writeHead(502, { 'content-type': 'text/plain' });
      res.end(`proxy error: ${e.message}`);
    }
  })
  .listen(port, () => console.log(`mismatch proxy on http://localhost:${port} → ${target} ("${find}" → "${replace}")`));
