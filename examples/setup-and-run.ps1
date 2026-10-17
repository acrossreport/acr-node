# setup-and-run.ps1 — one command, start to finish:
#   creates a fresh folder, installs the package, downloads the sample
#   data, renders a PDF + ZIP, and opens the ZIP in the viewer.
#
#   irm https://raw.githubusercontent.com/acrossreport/acr-node/main/examples/setup-and-run.ps1 | iex
$ErrorActionPreference = "Stop"

$dir = Join-Path $PWD ("acr-node-quickstart-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory $dir | Out-Null
Set-Location $dir
Write-Host "Working in $dir"

npm init -y | Out-Null
npm install @acrossreport/acr-node

curl.exe -LO https://github.com/acrossreport/acr-samples/raw/main/acr-slip-list-ja.zip
tar -xf acr-slip-list-ja.zip

curl.exe -LO https://github.com/acrossreport/acr-node/raw/main/examples/quickstart-all.mjs
node quickstart-all.mjs
