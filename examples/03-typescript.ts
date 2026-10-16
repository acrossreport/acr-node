// render-slip.ts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import {
  renderPreview,
  renderPdf,
  renderPngZip,
  listDataFields,
  licenseStatus,
} from "@acrossreport/acr-node";

interface SlipData {
  Parameters: { Data: unknown[] };
}

const templateJson = readFileSync("acr-slip-list-ja.template.json", "utf8");
const data = JSON.parse(
  readFileSync("acr-slip-list-ja.data.json", "utf8"),
) as SlipData;

const limit = Number(process.env.LIMIT ?? 0);
if (limit > 0) {
  data.Parameters.Data = data.Parameters.Data.slice(0, limit);
  console.log(`LIMIT=${limit} -> ${data.Parameters.Data.length} rows`);
} else {
  console.log(`rows: ${data.Parameters.Data.length}`);
}
const dataJson = JSON.stringify(data);

console.log("license:", licenseStatus());
const fields = JSON.parse(listDataFields(templateJson)) as unknown[];
console.log("fields count:", fields.length);

const t0 = Date.now();
const pages = renderPreview(templateJson, dataJson);
const first = pages[0];
if (!first) {
  console.error("preview: 0 pages");
  process.exit(1);
}
console.log(
  `preview: ${pages.length} page(s), ${first.widthPx}x${first.heightPx}, ${Date.now() - t0}ms`,
);

// How many preview PNGs to save:
//   PREVIEW_PAGES=10   -> first 10
//   PREVIEW_PAGES=all  -> every page under slip-pages/
const previewOpt = process.env.PREVIEW_PAGES ?? "10";
const nSave =
  previewOpt === "all"
    ? pages.length
    : Math.min(pages.length, Number(previewOpt) || 10);

if (previewOpt === "all" || nSave > 20) {
  mkdirSync("slip-pages", { recursive: true });
  pages.slice(0, nSave).forEach((page, i) => {
    writeFileSync(`slip-pages/${String(i + 1).padStart(4, "0")}.png`, page.png);
  });
  console.log(`saved ${nSave} PNGs -> slip-pages/`);
} else {
  pages.slice(0, nSave).forEach((page, i) => {
    writeFileSync(`slip-preview-page${i + 1}.png`, page.png);
  });
  console.log(`saved ${nSave} PNGs -> slip-preview-page*.png`);
}

const t1 = Date.now();
const pageCount = renderPdf(templateJson, dataJson, "slip-list.pdf");
console.log(`pdf: ${pageCount} page(s) -> slip-list.pdf (${Date.now() - t1}ms)`);

if (process.env.ZIP === "1") {
  const t2 = Date.now();
  renderPngZip(templateJson, dataJson, "slip-list.zip", "0.5.0");
  console.log(`zip -> slip-list.zip (${Date.now() - t2}ms)`);
}
