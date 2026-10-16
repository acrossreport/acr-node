// 01-quickstart.mjs — 帳票テンプレート + データ → PDF を作る、いちばん短い例
//
//   準備: npm install @acrossreport/acr-node
//         acr-samples の acr-slip-list-ja.zip を展開し、このファイルと同じフォルダに置く
//   実行: node 01-quickstart.mjs            （全件 12,982 行 → 1,394 ページ）
//         LIMIT=50 node 01-quickstart.mjs   （先頭 50 行だけで試す。macOS/Linux/Git Bash）
//         $env:LIMIT=50; node 01-quickstart.mjs   （同上。Windows PowerShell）
import { readFileSync } from "node:fs";
import { renderPdf, licenseStatus } from "@acrossreport/acr-node";

// 1) 帳票の定義（ACR Designer で作るファイル）
const template = readFileSync("acr-slip-list-ja.template.json", "utf8");

// 2) 差し込むデータ。形は { "Parameters": { "Data": [ {列名: 値, ...}, ... ] } }
const data = JSON.parse(readFileSync("acr-slip-list-ja.data.json", "utf8"));
if (process.env.LIMIT) data.Parameters.Data = data.Parameters.Data.slice(0, Number(process.env.LIMIT));

// 3) PDF を作る（戻り値はページ数）
const t0 = performance.now();
const pages = renderPdf(template, JSON.stringify(data), "slip-list.pdf");
const ms = Math.round(performance.now() - t0);

console.log(`データ ${data.Parameters.Data.length} 行 → slip-list.pdf（${pages} ページ、${ms} ms）`);
if (!licenseStatus().licensed) console.log("※ ライセンス未登録のため、PDF には透かしが入っています");
