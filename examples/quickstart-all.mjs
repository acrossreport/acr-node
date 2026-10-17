// quickstart-all.mjs — one step: template + data -> PDF + ZIP, then opens the ZIP
// in the ACR PNG Viewer automatically (no drag & drop, no second command).
//
//   準備: acr-samples の zip を展開し、このファイルと同じフォルダに置く
//         (acr-slip-list-en.* でも acr-slip-list-ja.* でもよい、自動で探す)
//   実行: node quickstart-all.mjs
import { readFileSync } from "node:fs";
import { readdirSync } from "node:fs";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { exec } from "node:child_process";
import { renderPdf, renderPngZip, licenseStatus } from "@acrossreport/acr-node";

const templateFile = readdirSync(".").find((f) => /^acr-slip-list-\w+\.template\.json$/.test(f));
if (!templateFile) {
  console.error("No acr-slip-list-*.template.json found in this folder.");
  process.exit(1);
}
const dataFile = templateFile.replace(".template.json", ".data.json");
const sampleLang = templateFile.match(/^acr-slip-list-(\w+)\.template\.json$/)[1]; // en / ja / ...

const template = readFileSync(templateFile, "utf8");
const data = readFileSync(dataFile, "utf8");

const pages = renderPdf(template, data, "slip-list.pdf");
console.log(`slip-list.pdf (${pages} pages)`);
if (!licenseStatus().licensed) console.log("(no license key activated -> output is watermarked)");

renderPngZip(template, data, "slip-list.zip", "0.5.0");
console.log("slip-list.zip");

const MIME = { ".html": "text/html; charset=utf-8", ".zip": "application/zip" };
const server = createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split("?")[0]) || "/acr-zip-viewer.html";
  try {
    const bytes = await readFile("." + (path === "/" ? "/acr-zip-viewer.html" : path));
    res.writeHead(200, { "Content-Type": MIME[extname(path)] || "application/octet-stream" });
    res.end(bytes);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});
// Port 0 = let the OS pick a free port, so this never collides with
// anything else already listening (e.g. a previous run you forgot to close).
server.listen(Number(process.env.PORT) || 0, "127.0.0.1", () => {
  const port = server.address().port;
  const url = `http://localhost:${port}/acr-zip-viewer.html?zip=slip-list.zip&lang=${sampleLang}`;
  const opener = process.platform === "win32" ? "start \"\"" : process.platform === "darwin" ? "open" : "xdg-open";
  exec(`${opener} "${url}"`, { shell: true });
  console.log(`opened ${url}`);
});
