# @acrossreport/acr-node

English | [日本語](README.ja.md) | [Français](README.fr.md)

Render [ACR (Across Report)](https://acrossreport.com) report templates directly from
Node.js or Electron — no Chromium, no child process, no printer driver. The rendering
engine is the same Rust/Skia core used by [ACR CLI](https://github.com/acrossreport/acr-cli),
[ACR Viewer](https://github.com/acrossreport/acr-viewer) and
[ACR Designer](https://github.com/acrossreport/acr-designer), loaded in-process as a
native addon ([napi-rs](https://napi.rs/)).

## Why

Most report generation in Node apps goes through a headless Chromium (Puppeteer) printing
an HTML page, or shells out to a separate tool. Both add real overhead and failure modes.
`acr-node` links the same pixel-accurate ACR renderer straight into your process:

```ts
import { renderPdf } from "@acrossreport/acr-node";

const pageCount = renderPdf(templateJson, dataJson, "invoice.pdf");
```

- Existing ACR template JSON (from [ACR Designer](https://github.com/acrossreport/acr-designer)
  or converted from legacy ActiveReports/RDL via [ACR Migrate](https://github.com/acrossreport/acr-migrate))
  works as-is — no re-authoring.
- Runs on a bare Node server (Express, Next.js API routes, etc.) just as well as inside
  an Electron main process.
- No Chromium dependency, no spawned subprocess, no printer or driver required.

## Install

```bash
npm install @acrossreport/acr-node
```

Prebuilt for all six major platform/architecture combinations: **Windows x64/ARM64**,
**Linux x64/ARM64 (glibc)**, and **macOS (Apple Silicon/Intel)** — see
[Platform support](#platform-support) below.

## Usage

Quickstart — renders a real sample from
[acr-samples](https://github.com/acrossreport/acr-samples) to a PDF. Create an empty
working folder and move into it first (you'll need to re-run `npm install` here too):

```bash
mkdir acr-node-demo
cd acr-node-demo
npm init -y
npm install @acrossreport/acr-node
curl -LO https://github.com/acrossreport/acr-samples/raw/main/acr-slip-list-en.zip
tar -xf acr-slip-list-en.zip
```

```js
import { readFileSync } from "node:fs";
import { renderPdf } from "@acrossreport/acr-node";

const template = readFileSync("acr-slip-list-en.template.json", "utf8"); // made in ACR Designer
const data = readFileSync("acr-slip-list-en.data.json", "utf8");         // shape below

const pageCount = renderPdf(template, data, "slip-list.pdf");
console.log(`slip-list.pdf created (${pageCount} pages)`); // 1394
```

Data JSON shape: `{"Parameters":{"Data":[{column: value, ...}, ...]}}` (an empty
string is treated as no rows). Use `listDataFields(template)` to see which column
names a given template expects.

Using your own template instead? Swap in its `.template.json` / `.data.json` paths —
nothing else changes.

More examples — serving PDFs over HTTP with worker-thread concurrency so rendering
doesn't block other requests, and a typed version exercising `renderPreview` (PNG per
page), `renderPngZip`, and `listDataFields` — are in [examples/](examples/).

### Licensing

Rendering without an activated license key produces output with a watermark (same policy
as ACR CLI / ACR Designer / ACR Viewer — see [LICENSE.txt](LICENSE.txt)). If a license was
already activated on this machine by one of those tools, `acr-node` picks it up
automatically; otherwise, activate one directly:

```ts
import { activate, licenseStatus } from "@acrossreport/acr-node";

console.log(licenseStatus()); // { licensed: false } before activation

await activate("you@example.com", "ACR-XXXX-XXXX-XXXX-XXXX"); // throws on failure
console.log(licenseStatus()); // { licensed: true, tier: "..." }
```

`activate()` makes a blocking HTTP request to the license server; call it from a
background/worker context in Electron if that matters for your app. The resulting
activation is cached at `%APPDATA%/AcrEngine/license.json` (or the OS equivalent) and
shared with ACR CLI / ACR Designer / ACR Viewer on the same machine.

## Platform support

| Platform | Status |
|----------|--------|
| Windows x64 | Available |
| Windows ARM64 | Available |
| Linux x64 (glibc) | Available |
| Linux ARM64 (glibc) | Available |
| macOS (Apple Silicon) | Available |
| macOS (Intel) | Available |

## License

See [LICENSE.txt](LICENSE.txt). Binary distribution; source is not published. Free to use
and to embed in your own Node.js/Electron application, including distributing that
application to your own end users. Rendering without an activated license key adds a
watermark to the output.
