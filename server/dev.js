import http from 'node:http';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FRONTEND = path.join(ROOT, 'frontend');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'gift.db');
const PORT = process.env.PORT || 8080;
const SINCE = '2023-06-10'; // 与 api/stats.js 保持一致

// ---------- 初始化本地 SQLite 数据库 ----------
mkdirSync(DATA_DIR, { recursive: true });
const db = new DatabaseSync(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS stats (
    id INTEGER PRIMARY KEY,
    visits INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);
db.exec(`INSERT OR IGNORE INTO stats (id, visits) VALUES (1, 0);`);
db.exec(`INSERT OR IGNORE INTO meta (key, value) VALUES ('since', '${SINCE}');`);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);

  // ---------- API ----------
  if (pathname === '/api/stats') {
    try {
      db.exec(`UPDATE stats SET visits = visits + 1 WHERE id = 1;`);
      const row = db.prepare(`SELECT visits FROM stats WHERE id = 1;`).get();
      const meta = db.prepare(`SELECT value FROM meta WHERE key = 'since';`).get();
      const body = JSON.stringify({ visits: row?.visits ?? 0, since: meta?.value ?? SINCE });
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
      });
      res.end(body);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'db_error' }));
    }
    return;
  }

  // ---------- 静态文件 ----------
  const rel = pathname === '/' ? '/index.html' : pathname;
  const fullPath = path.normalize(path.join(FRONTEND, rel));
  if (!fullPath.startsWith(FRONTEND)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ✨ 生日祝福网站已启动（本地预览）');
  console.log(`  ➜  页面:  http://localhost:${PORT}`);
  console.log(`  ➜  接口:  http://localhost:${PORT}/api/stats`);
  console.log('  （按 Ctrl+C 停止）');
  console.log('');
});
