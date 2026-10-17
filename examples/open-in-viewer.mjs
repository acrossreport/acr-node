// open-in-viewer.mjs — serve the current folder and open a rendered ZIP in
// the ACR PNG Viewer, with the ZIP already loaded (no drag & drop needed).
//
//   準備: 03-typescript.ts を ZIP=1 付きで実行し、slip-list.zip を作っておく
//   実行: node open-in-viewer.mjs                  (slip-list.zip を開く)
//         node open-in-viewer.mjs other-name.zip   (別名のZIPを開く)
//
// acr-zip-viewer.html は file:// から開くと ?zip= の自動読み込みができない
// (fetchがブロックされる) ため、この小さなHTTPサーバー経由で開く。
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { exec } from "node:child_process";

const zipName = process.argv[2] || "slip-list.zip";

const MIME = { ".html": "text/html; charset=utf-8", ".zip": "application/zip" };

const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]) || "/acr-zip-viewer.html";
  try {
    const data = await readFile("." + (path === "/" ? "/acr-zip-viewer.html" : path));
    res.writeHead(200, { "Content-Type": MIME[extname(path)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

// Port 0 = let the OS pick a free port, so this never collides with
// anything else already listening (e.g. a previous run you forgot to close).
server.listen(Number(process.env.PORT) || 0, "127.0.0.1", () => {
  const port = server.address().port;
  const url = `http://localhost:${port}/acr-zip-viewer.html?zip=${encodeURIComponent(zipName)}`;
  console.log(`serving . -> ${url}`);
  const opener = process.platform === "win32" ? "start" : process.platform === "darwin" ? "open" : "xdg-open";
  exec(`${opener} "${url}"`, { shell: true });
});
