# サンプル

[English](README.md) | 日本語

各サンプルはそれぞれ単独で動作します — 必要なものを1つ選んで実行してください(順番に全部実行する必要はありません)。いずれも[acr-samples](https://github.com/acrossreport/acr-samples)の仕入伝票一覧サンプル(12,982行 / 1,394ページ)を描画します。

## とにかく1コマンドで試したい場合(Windows)

```powershell
irm https://raw.githubusercontent.com/acrossreport/acr-node/main/examples/setup-and-run.ps1 | iex
```

準備からPDF・ZIP生成、ブラウザでのプレビュー表示まで全部やります。中身は
[setup-and-run.ps1](setup-and-run.ps1)で、以下の「準備」+`quickstart-all.mjs`と同じです。
(英語サンプルなら`setup-and-run-en.ps1`。)

## 準備(どのサンプルを動かす場合も最初に1回)

まず空の作業用フォルダを作り、そこに移動します(以下のコマンドはこのフォルダにファイルを展開します):

```bash
mkdir acr-node-examples
cd acr-node-examples
npm init -y
npm install @acrossreport/acr-node
curl -LO https://github.com/acrossreport/acr-samples/raw/main/acr-slip-list-ja.zip
tar -xf acr-slip-list-ja.zip
```

(`npm init -y` でこのフォルダ用の `package.json` を作っておくと、`npm install` が必ずこのフォルダの `node_modules` に入ります。これがないと、上位フォルダに別の `package.json` があった場合、そちらにインストールされてしまうことがあります。)

これで `acr-slip-list-ja.template.json` と `acr-slip-list-ja.data.json` がカレントフォルダに展開されます。以下のサンプルはすべて、この2ファイルが同じフォルダにあることを前提にしています。データJSONの形は `{"Parameters":{"Data":[{列名: 値, ...}, ...]}}` です。テンプレートが必要とする列名は `listDataFields(template)` (`03-typescript.ts` で使用例あり) で確認できます。

## 01-quickstart.mjs

最短の例:テンプレート+データを渡してPDFを1つ作るだけです。

```bash
node 01-quickstart.mjs                   # 全件 12,982 行 → 1,394 ページ
LIMIT=50 node 01-quickstart.mjs          # 先頭 50 行だけで試す（macOS/Linux/Git Bash）
```

```powershell
$env:LIMIT=50; node 01-quickstart.mjs    # 同上（Windows PowerShell）
```

## 02-server.mjs (+ render-worker.mjs)

PDFをHTTPで返すサーバです。描画は別スレッド(`render-worker.mjs`)で行うため、大きな帳票を描画している間もサーバは他のリクエスト(ヘルスチェックなど)に応答できます。同時に描画する件数は `ACR_CONCURRENCY` で指定します(既定2)。

```bash
node 02-server.mjs
curl -o out.pdf "http://localhost:3000/pdf?limit=50"
curl http://localhost:3000/health     # 描画中でもすぐ返る
```

## 03-typescript.ts

01と同じ処理をTypeScriptで書き、`licenseStatus`・`listDataFields`・`renderPreview`(ページごとのPNG)・`renderPdf`・(任意で)`renderPngZip` と、APIの広い範囲を1本で確認できるようにしたものです。パッケージ全体の使い方のリファレンスとしても使えます。

`.ts` ファイルを直接実行するには Node.js 22.18以降 / 23.6以降が必要です。それより古いNodeでは [tsx](https://github.com/privatenumber/tsx) を使ってください。

```bash
node 03-typescript.ts                        # Node 22.18+/23.6+
npx tsx 03-typescript.ts                     # 古いNode

LIMIT=100 PREVIEW_PAGES=all node 03-typescript.ts   # 全ページをPNGとして保存（macOS/Linux/Git Bash）
ZIP=1 node 03-typescript.ts                         # ACR-PNG-PACKAGE形式のzipも作成（同上）
```

```powershell
$env:LIMIT=100; $env:PREVIEW_PAGES="all"; node 03-typescript.ts   # 全ページをPNGとして保存（Windows PowerShell）
$env:ZIP=1; node 03-typescript.ts                                  # ACR-PNG-PACKAGE形式のzipも作成（同上）
```

## quickstart-all.mjs — PDF・ZIP生成からビューア表示まで1コマンド

フォルダにある `acr-slip-list-en.*` / `acr-slip-list-ja.*` を自動で見つけて、PDFと
ZIP(ACR-PNG-PACKAGE)を両方作り、小さなローカルサーバー経由でブラウザを自動で開いて
ZIPをそのまま表示します(ドラッグ&ドロップ不要)。上記の「準備」が終わっていれば、これ1つで完結します。

```bash
node quickstart-all.mjs
```

## open-in-viewer.mjs — 既に作ったZIPをビューアで開く

`slip-list.zip` をすでに持っている場合に、それだけをビューアで開きます
(`quickstart-all.mjs` はPDF・ZIPの生成からまとめてやりたいときに使ってください)。

```bash
node open-in-viewer.mjs                # slip-list.zip を開く
node open-in-viewer.mjs other-name.zip # 別名のZIPを開く
```

## ライセンス

3つのサンプルとも、ライセンスキーなしでそのまま動作します(出力に透かしが入るだけです)。キーの登録方法はメインREADMEの[ライセンスの節](../README.ja.md#ライセンスの有効化)を参照してください。
