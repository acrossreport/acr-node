# @acrossreport/acr-node

[English](README.md) | 日本語 | [Français](README.fr.md)

[ACR (Across Report)](https://acrossreport.com) の帳票テンプレートを、Node.jsや
Electronから直接描画できるパッケージです。Chromiumも、子プロセスも、プリンタドライバも
不要です。描画エンジンは[ACR CLI](https://github.com/acrossreport/acr-cli)、
[ACR Viewer](https://github.com/acrossreport/acr-viewer)、
[ACR Designer](https://github.com/acrossreport/acr-designer)と同じRust/Skia製コアで、
ネイティブアドオン（[napi-rs](https://napi.rs/)）としてプロセス内に直接ロードされます。

## なぜ

Node製アプリでの帳票生成は、Headless Chromium（Puppeteer）でHTMLを印刷する方式か、
別ツールを子プロセスで呼ぶ方式が多く、どちらも無視できないオーバーヘッドと失敗要因を
抱えます。`acr-node`は、同じピクセル精度のACR描画エンジンをプロセスに直接リンクします。

```ts
import { renderPdf } from "@acrossreport/acr-node";

const pageCount = renderPdf(templateJson, dataJson, "invoice.pdf");
```

- [ACR Designer](https://github.com/acrossreport/acr-designer)で作った既存のテンプレート
  JSON（または[ACR Migrate](https://github.com/acrossreport/acr-migrate)で旧
  ActiveReports/RDLから変換したもの）がそのまま使えます。作り直しは不要です。
- 素のNodeサーバー（Express、Next.jsのAPI route等）でも、Electronのメインプロセス内でも
  同じように動きます。
- Chromium依存なし、子プロセスの起動なし、プリンタ・ドライバ不要です。

## インストール

```bash
npm install @acrossreport/acr-node
```

主要な6つのプラットフォーム/アーキテクチャ組み合わせ全てでビルド済みです：
**Windows x64/ARM64**・**Linux x64/ARM64（glibc）**・**macOS（Apple Silicon/Intel）**
（下記[対応プラットフォーム](#対応プラットフォーム)参照）。

## 使い方

```ts
import { renderPreview, renderPdf, renderPngZip, listDataFields, licenseStatus, activate } from "@acrossreport/acr-node";
import { readFileSync } from "node:fs";

const templateJson = readFileSync("invoice.template.json", "utf8");
const dataJson = readFileSync("invoice.data.json", "utf8");

// 画面プレビュー: ページごとにPNG(Buffer)、96dpi。
const pages = renderPreview(templateJson, dataJson);
console.log(pages.length, pages[0].widthPx, pages[0].heightPx, pages[0].png.length);

// PDFファイル、72dpi。戻り値はページ数。
const pageCount = renderPdf(templateJson, dataJson, "invoice.pdf");

// ACR-PNG-PACKAGE形式のZIP（manifest.json + pages/001.png, ...）、96dpi。
renderPngZip(templateJson, dataJson, "invoice.zip", "0.1.0");

// テンプレートが期待するDataField名と使用箇所の一覧を取得。
console.log(JSON.parse(listDataFields(templateJson)));
```

`dataJson`は空文字でもよく、その場合は行なし（`{"Parameters":{"Data":[]}}`）として
扱われます。

### ライセンス

ライセンスキーが未登録の状態で描画すると、出力にウォーターマークが入ります
（ACR CLI / ACR Designer / ACR Viewerと同じ方針。[LICENSE.txt](LICENSE.txt)参照）。
同じマシンでこれらのツールのいずれかが既にアクティベート済みであれば、`acr-node`は
自動的にそのライセンスを使います。未登録の場合は直接アクティベートできます。

```ts
import { activate, licenseStatus } from "@acrossreport/acr-node";

console.log(licenseStatus()); // アクティベート前は { licensed: false }

await activate("you@example.com", "ACR-XXXX-XXXX-XXXX-XXXX"); // 失敗時は例外
console.log(licenseStatus()); // { licensed: true, tier: "..." }
```

`activate()`はライセンスサーバーへの同期HTTPリクエストを行います。Electronアプリで
ブロッキングが問題になる場合は、バックグラウンド/ワーカー側から呼び出してください。
アクティベーション結果は`%APPDATA%/AcrEngine/license.json`（またはOS相当の場所）に
キャッシュされ、同じマシン上のACR CLI / ACR Designer / ACR Viewerとも共有されます。

## 対応プラットフォーム

| プラットフォーム | 状況 |
|----------|--------|
| Windows x64 | 対応済み |
| Windows ARM64 | 対応済み |
| Linux x64（glibc） | 対応済み |
| Linux ARM64（glibc） | 対応済み |
| macOS（Apple Silicon） | 対応済み |
| macOS（Intel） | 対応済み |

## ライセンス

[LICENSE.txt](LICENSE.txt)をご覧ください。バイナリ配布で、ソースは非公開です。
無償で利用でき、あなた自身のNode.js/Electronアプリケーションに組み込んで、そのアプリを
エンドユーザーへ配布することも可能です。ライセンスキー未登録での描画には、出力に
ウォーターマークが入ります。
