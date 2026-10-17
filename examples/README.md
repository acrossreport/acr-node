# Examples

English | [日本語](README.ja.md)

Each example is self-contained and runs on its own — pick the one you need, don't
run them all in sequence. All of them render a sample purchase-slip-list report
(12,982 rows / 1,394 pages) from [acr-samples](https://github.com/acrossreport/acr-samples).

## Just want to try it in one command? (Windows)

```powershell
irm https://raw.githubusercontent.com/acrossreport/acr-node/main/examples/setup-and-run-en.ps1 | iex
```

Does setup, renders the PDF + ZIP, and opens a preview in your browser, all in one go.
It's just [setup-and-run-en.ps1](setup-and-run-en.ps1), which is the same as the setup
below plus `quickstart-all.mjs`. (For the Japanese sample, use `setup-and-run.ps1`.)

## Setup (once, for any example below)

First create an empty working folder and move into it — the commands below extract
files into whatever folder you're in:

```bash
mkdir acr-node-examples
cd acr-node-examples
npm init -y
npm install @acrossreport/acr-node
curl -LO https://github.com/acrossreport/acr-samples/raw/main/acr-slip-list-ja.zip
tar -xf acr-slip-list-ja.zip
```

(`npm init -y` creates a `package.json` for this folder, so `npm install` always installs into
*this* folder's `node_modules`. Without it, if a `package.json` exists in a parent folder, npm
may install there instead.)

This gives you `acr-slip-list-ja.template.json` and `acr-slip-list-ja.data.json` in
the current folder — every example below expects them there. The data JSON has the
shape `{"Parameters":{"Data":[{column: value, ...}, ...]}}`; run
`listDataFields(template)` (shown in `03-typescript.ts`) to see which column names a
given template expects.

## 01-quickstart.mjs

The shortest possible example: template + data in, one PDF out.

```bash
node 01-quickstart.mjs                   # all 12,982 rows -> 1,394 pages
LIMIT=50 node 01-quickstart.mjs          # try with the first 50 rows only (macOS/Linux/Git Bash)
```

```powershell
$env:LIMIT=50; node 01-quickstart.mjs    # same, Windows PowerShell
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

LIMIT=100 PREVIEW_PAGES=all node 03-typescript.ts   # save every page as PNG (macOS/Linux/Git Bash)
ZIP=1 node 03-typescript.ts                         # also write an ACR-PNG-PACKAGE zip (same)
```

```powershell
$env:LIMIT=100; $env:PREVIEW_PAGES="all"; node 03-typescript.ts   # save every page as PNG (Windows PowerShell)
$env:ZIP=1; node 03-typescript.ts                                  # also write an ACR-PNG-PACKAGE zip (same)
```

## quickstart-all.mjs — PDF + ZIP + viewer, in one command

Auto-detects whichever `acr-slip-list-en.*` / `acr-slip-list-ja.*` pair is in the
folder, renders both the PDF and the ZIP (ACR-PNG-PACKAGE), then serves the folder
and opens your browser straight to the result, no drag & drop needed. If you've
done the setup above, this is all you need:

```bash
node quickstart-all.mjs
```

## open-in-viewer.mjs — open a ZIP you already have in the viewer

For when you already have a `slip-list.zip` and just want to view it (use
`quickstart-all.mjs` instead if you want to render + view in one step).

```bash
node open-in-viewer.mjs                # opens slip-list.zip
node open-in-viewer.mjs other-name.zip  # opens a differently-named zip
```

## Licensing

All three examples work without a license key — output just carries a watermark.
See the [Licensing section](../README.md#licensing) of the main README for how to
activate a key.
