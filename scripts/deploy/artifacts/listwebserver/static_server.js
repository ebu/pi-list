const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const rootDir = process.argv[2] || '/app/gui';
const port = Number(process.argv[3] || 8080);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'public, max-age=60'
  });
  fs.createReadStream(filePath).pipe(res);
}

function resolvePath(requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const normalized = path.normalize(decoded).replace(/^\.\.(\/|\\|$)/, '');
  const relativePath = normalized === '/' ? '/index.html' : normalized;
  return path.join(rootDir, relativePath);
}

const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname || '/';
  const requestedPath = resolvePath(pathname);

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, requestedPath);
      return;
    }

    const fallback = path.join(rootDir, 'index.html');
    fs.stat(fallback, (fallbackErr, fallbackStats) => {
      if (fallbackErr || !fallbackStats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
        return;
      }
      sendFile(res, fallback);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Static server listening on 0.0.0.0:${port} serving ${rootDir}`);
});
