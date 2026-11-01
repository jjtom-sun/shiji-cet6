/* Zero-dependency local static server: node serve.js [port] [--lan] */
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = __dirname;
const args = process.argv.slice(2);
const lan = args.includes('--lan');
const portArg = args.find(arg => /^\d+$/.test(arg));
const port = Number(portArg) || 5173;
const host = lan ? '0.0.0.0' : '127.0.0.1';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  } catch (e) {
    res.writeHead(400); res.end('Bad request'); return;
  }
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(root, urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found: ' + urlPath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': types[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}).listen(port, host, () => {
  console.log('Server started: http://127.0.0.1:' + port);
  if (!lan) return;
  const addresses = [];
  const nets = os.networkInterfaces();
  Object.keys(nets).forEach(name => {
    (nets[name] || []).forEach(net => {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    });
  });
  if (addresses.length) {
    console.log('LAN URLs (same Wi-Fi):');
    addresses.forEach(addr => console.log('  http://' + addr + ':' + port));
    console.log('If Windows Firewall prompts, allow Private networks.');
  } else {
    console.log('No LAN IPv4 address found. Connect to Wi-Fi first.');
  }
});
