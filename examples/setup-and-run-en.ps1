# setup-and-run-en.ps1 — same as setup-and-run.ps1, but uses the English sample
# data and opens the viewer with English labels.
#
#   irm https://raw.githubusercontent.com/acrossreport/acr-node/main/examples/setup-and-run-en.ps1 | iex
$ErrorActionPreference = "Stop"

$dir = Join-Path $PWD ("acr-node-quickstart-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory $dir | Out-Null
Set-Location $dir
Write-Host "Working in $dir"

npm init -y | Out-Null
npm install @acrossreport/acr-node

curl.exe -LO https://github.com/acrossreport/acr-data-samples/raw/main/acr-slip-list-en.zip
tar -xf acr-slip-list-en.zip

curl.exe -LO https://github.com/acrossreport/acr-node/raw/main/examples/quickstart-all.mjs
node quickstart-all.mjs
