// render-worker.mjs — 別スレッドで PDF を作る（02-server.mjs から呼ばれる）
import { parentPort, workerData } from "node:worker_threads";
import { readFileSync, rmSync } from "node:fs";
import { renderPdf } from "@acrossreport/acr-node";

const { template, data, tmpPath } = workerData;
const pages = renderPdf(template, data, tmpPath);
const pdf = readFileSync(tmpPath);   // 今の acr-node はファイル出力のみなので、読み戻して返す
rmSync(tmpPath, { force: true });
parentPort.postMessage({ pages, pdf }, [pdf.buffer]);
