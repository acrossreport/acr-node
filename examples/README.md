# Examples

English | [日本語](README.ja.md)

Each example is self-contained and runs on its own — pick the one you need, don't
run them all in sequence. All of them render a sample purchase-slip-list report
(12,982 rows / 1,394 pages) from [acr-samples](https://github.com/acrossreport/acr-samples).

## Setup (once, for any example below)

```bash
npm install @acrossreport/acr-node
curl -LO https://github.com/acrossreport/acr-samples/raw/main/acr-slip-list-ja.zip
unzip acr-slip-list-ja.zip
```

This gives you `acr-slip-list-ja.template.json` and `acr-slip-list-ja.data.json` in
the current folder — every example below expects them there. The data JSON has the
shape `{"Parameters":{"Data":[{column: value, ...}, ...]}}`; run
`listDataFields(template)` (shown in `03-typescript.ts`) to see which column names a
given template expects.

## 01-quickstart.mjs

The shortest possible example: template + data in, one PDF out.

```bash
node 01-quickstart.mjs             # all 12,982 rows -> 1,394 pages
LIMIT=50 node 01-quickstart.mjs    # try with the first 50 rows only
```

## 02-server.mjs (+ render-worker.mjs)

Serves PDFs over HTTP. Rendering runs in a worker thread (`render-worker.mjs`) so the
server keeps answering other requests (e.g. a health check) while a large report is
still being drawn. `ACR_CONCURRENCY` caps how many renders run at once (default 2).

```bash
node 02-server.mjs
curl -o out.pdf "http://localhost:3000/pdf?limit=50"
curl http://localhost:3000/health     # responds immediately, even mid-render
```

## 03-typescript.ts

The same workflow as 01, but typed and exercising more of the API in one script:
`licenseStatus`, `listDataFields`, `renderPreview` (PNG per page), `renderPdf`, and
optionally `renderPngZip`. Useful as a reference for the full surface of the package.

Needs Node.js 22.18+ / 23.6+ to run `.ts` files directly; on an older Node, run it
through [tsx](https://github.com/privatenumber/tsx) instead:

```bash
node 03-typescript.ts                        # Node 22.18+/23.6+
npx tsx 03-typescript.ts                     # older Node

LIMIT=100 PREVIEW_PAGES=all node 03-typescript.ts   # save every page as PNG
ZIP=1 node 03-typescript.ts                         # also write an ACR-PNG-PACKAGE zip
```

## Licensing

All three examples work without a license key — output just carries a watermark.
See the [Licensing section](../README.md#licensing) of the main README for how to
activate a key.
