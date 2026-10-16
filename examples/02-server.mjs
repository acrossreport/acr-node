// 02-server.mjs — Web サーバから PDF を返す例（描画中も他のリクエストに応答できる）
//
//   実行: node 02-server.mjs
//   確認: curl -o out.pdf "http://localhost:3000/pdf?limit=50"
//         curl http://localhost:3000/health     ← 描画中でもすぐ返る
//   同時に描画する件数は環境変数 ACR_CONCURRENCY で指定（既定 2）
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";

const template = readFileSync("acr-slip-list-ja.template.json", "utf8");
const allData = JSON.parse(readFileSync("acr-slip-list-ja.data.json", "utf8"));
const CONCURRENCY = Number(process.env.ACR_CONCURRENCY ?? 2);

// 同時実行数を制限する簡単な待ち行列
let running = 0;
const waiting = [];
async function withSlot(fn) {
  if (running >= CONCURRENCY) await new Promise((r) => waiting.push(r));
  running++;
  try { return await fn(); } finally { running--; waiting.shift()?.(); }
}

// 別スレッド（render-worker.mjs）で PDF を作り、Buffer で受け取る
function renderPdfInWorker(data) {
  return withSlot(() => new Promise((resolve, reject) => {
    const tmpPath = join(tmpdir(), `acr-${randomUUID()}.pdf`);   // 同時実行でも名前がぶつからない
    const w = new Worker(new URL("./render-worker.mjs", import.meta.url), { workerData: { template, data, tmpPath } });
    w.once("message", (m) => resolve({ pages: m.pages, pdf: Buffer.from(m.pdf) }));
    w.once("error", reject);
  }));
}

createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname === "/health") return res.end(`ok (描画中 ${running} 件、待ち ${waiting.length} 件)\n`);
  if (url.pathname !== "/pdf") return res.writeHead(404).end();

  const limit = Number(url.searchParams.get("limit") ?? 50);
  const data = JSON.stringify({ Parameters: { Data: allData.Parameters.Data.slice(0, limit) } });
  try {
    const t0 = performance.now();
    const { pages, pdf } = await renderPdfInWorker(data);
    console.log(`limit=${limit}: ${pages} ページ, ${Math.round(performance.now() - t0)} ms`);
    res.writeHead(200, { "Content-Type": "application/pdf" }).end(pdf);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
}).listen(3000, () => console.log(`http://localhost:3000  （同時実行数 ${CONCURRENCY}）`));
