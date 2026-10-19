# @acrossreport/acr-node

[English](README.md) | [日本語](README.ja.md) | Français

Génère des modèles de rapport [ACR (Across Report)](https://acrossreport.com)
directement depuis Node.js ou Electron — sans Chromium, sans processus enfant, sans
pilote d'imprimante. Le moteur de rendu est le même cœur Rust/Skia que celui utilisé par
[ACR CLI](https://github.com/acrossreport/acr-cli),
[ACR Viewer](https://github.com/acrossreport/acr-viewer) et
[ACR Designer](https://github.com/acrossreport/acr-designer), chargé dans le même
processus en tant qu'addon natif ([napi-rs](https://napi.rs/)).

## Pourquoi

La génération de rapports dans les applications Node passe souvent par un Chromium
headless (Puppeteer) qui imprime une page HTML, ou par un outil externe appelé en
sous-processus. Les deux ajoutent une surcharge réelle et des points de défaillance.
`acr-node` relie directement le même moteur de rendu ACR, précis au pixel près, à votre
processus :

```ts
import { renderPdf } from "@acrossreport/acr-node";

const pageCount = renderPdf(templateJson, dataJson, "invoice.pdf");
```

- Les modèles JSON ACR existants (créés avec
  [ACR Designer](https://github.com/acrossreport/acr-designer) ou convertis depuis
  d'anciens rapports ActiveReports/RDL via
  [ACR Migrate](https://github.com/acrossreport/acr-migrate)) fonctionnent tels quels —
  aucune réécriture nécessaire.
- Fonctionne aussi bien sur un serveur Node nu (Express, routes API Next.js, etc.) que
  dans un processus principal Electron.
- Aucune dépendance à Chromium, aucun sous-processus lancé, aucune imprimante ni pilote
  requis.

## Installation

```bash
npm install @acrossreport/acr-node
```

Précompilé pour les six principales combinaisons plateforme/architecture :
**Windows x64/ARM64**, **Linux x64/ARM64 (glibc)**, et **macOS (Apple Silicon/Intel)**
— voir [Plateformes prises en charge](#plateformes-prises-en-charge) ci-dessous.

## Utilisation

### Essayer en une commande (Windows)

Collez ceci dans PowerShell — ça crée un dossier de travail, installe le paquet,
télécharge un exemple, génère un PDF + un ZIP, et ouvre le résultat dans votre
navigateur :

```powershell
irm https://raw.githubusercontent.com/acrossreport/acr-node/main/examples/setup-and-run-en.ps1 | iex
```

(Utilise l'exemple anglais ci-dessous. Pour l'exemple japonais, utilisez
`setup-and-run.ps1`.)

### Étape par étape

Démarrage rapide — génère un PDF à partir d'un exemple réel tiré de
[acr-samples](https://github.com/acrossreport/acr-data-samples). Créez d'abord un dossier
de travail vide et placez-vous-y (il faudra refaire `npm install` ici aussi) :

```bash
mkdir acr-node-demo
cd acr-node-demo
npm init -y
npm install @acrossreport/acr-node
curl -LO https://github.com/acrossreport/acr-data-samples/raw/main/acr-slip-list-en.zip
tar -xf acr-slip-list-en.zip
```

```js
import { readFileSync } from "node:fs";
import { renderPdf } from "@acrossreport/acr-node";

const template = readFileSync("acr-slip-list-en.template.json", "utf8"); // créé avec ACR Designer
const data = readFileSync("acr-slip-list-en.data.json", "utf8");         // forme ci-dessous

const pageCount = renderPdf(template, data, "slip-list.pdf");
console.log(`slip-list.pdf créé (${pageCount} pages)`); // 1394
```

Forme du JSON de données : `{"Parameters":{"Data":[{colonne: valeur, ...}, ...]}}`
(une chaîne vide est traitée comme aucune ligne). Utilisez `listDataFields(template)`
pour voir les noms de colonnes attendus par un modèle donné.

Pour utiliser votre propre modèle, remplacez simplement les chemins `.template.json` /
`.data.json` — rien d'autre ne change.

D'autres exemples — servir des PDF via HTTP avec un rendu concurrent dans des worker
threads, et une version typée utilisant `renderPreview` (un PNG par page),
`renderPngZip` et `listDataFields` — se trouvent dans [examples/](examples/).

### Activation de la licence

Un rendu sans clé de licence activée produit une sortie avec un filigrane (même politique
que ACR CLI / ACR Designer / ACR Viewer — voir [LICENSE.txt](LICENSE.txt)). Si une licence
a déjà été activée sur cette machine par l'un de ces outils, `acr-node` la reprend
automatiquement ; sinon, activez-en une directement :

```ts
import { activate, licenseStatus } from "@acrossreport/acr-node";

console.log(licenseStatus()); // { licensed: false } avant activation

await activate("you@example.com", "ACR-XXXX-XXXX-XXXX-XXXX"); // lève une erreur en cas d'échec
console.log(licenseStatus()); // { licensed: true, tier: "..." }
```

`activate()` effectue une requête HTTP bloquante vers le serveur de licences ; appelez-la
depuis un contexte d'arrière-plan/worker dans Electron si cela importe pour votre
application. Le résultat de l'activation est mis en cache dans
`%APPDATA%/AcrEngine/license.json` (ou l'équivalent du système d'exploitation) et partagé
avec ACR CLI / ACR Designer / ACR Viewer sur la même machine.

## Plateformes prises en charge

| Plateforme | Statut |
|----------|--------|
| Windows x64 | Disponible |
| Windows ARM64 | Disponible |
| Linux x64 (glibc) | Disponible |
| Linux ARM64 (glibc) | Disponible |
| macOS (Apple Silicon) | Disponible |
| macOS (Intel) | Disponible |

## Licence

Voir [LICENSE.txt](LICENSE.txt). Distribution binaire ; le code source n'est pas publié.
Utilisation gratuite, y compris l'intégration dans votre propre application Node.js/
Electron et sa distribution à vos propres utilisateurs finaux. Un rendu sans clé de
licence activée ajoute un filigrane à la sortie.
