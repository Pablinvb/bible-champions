/*
 * A tiny static server for local testing: `node serve.mjs` then open http://localhost:8099.
 *
 * Opening index.html straight from the file system works too, but a server keeps the
 * browser's storage rules the same as on GitHub Pages, so saved matches behave identically.
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8099;
const TYPES = {
  ".html": "text/html;charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg", ".json": "application/json"
};

createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0]);
  if (p === "/") p = "/index.html";
  const file = join(root, normalize(p));
  if (!file.startsWith(root)) { res.writeHead(403); res.end("forbidden"); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch { res.writeHead(404); res.end("not found"); }
}).listen(PORT, () => console.log(`Bible Champions on http://localhost:${PORT}`));
