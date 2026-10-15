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

Actuellement précompilé pour **Windows x64** et **Linux x64 (glibc)**. Les versions macOS
sont prévues — voir [Plateformes prises en charge](#plateformes-prises-en-charge) ci-dessous.

## Utilisation

```ts
import { renderPreview, renderPdf, renderPngZip, listDataFields, licenseStatus, activate } from "@acrossreport/acr-node";
import { readFileSync } from "node:fs";

const templateJson = readFileSync("invoice.template.json", "utf8");
const dataJson = readFileSync("invoice.data.json", "utf8");

// Aperçu à l'écran : un PNG (Buffer) par page, 96dpi.
const pages = renderPreview(templateJson, dataJson);
console.log(pages.length, pages[0].widthPx, pages[0].heightPx, pages[0].png.length);

// Fichier PDF, 72dpi. Retourne le nombre de pages.
const pageCount = renderPdf(templateJson, dataJson, "invoice.pdf");

// ZIP au format ACR-PNG-PACKAGE (manifest.json + pages/001.png, ...), 96dpi.
renderPngZip(templateJson, dataJson, "invoice.zip", "0.1.0");

// Inspecter les noms de DataField attendus par un modèle, et où chacun est utilisé.
console.log(JSON.parse(listDataFields(templateJson)));
```

`dataJson` peut être une chaîne vide, traitée comme aucune ligne
(`{"Parameters":{"Data":[]}}`).

### Licence

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
| Linux x64 (glibc) | Disponible |
| macOS (Intel / Apple Silicon) | Prévu |
| Linux ARM64 | Prévu |

## Licence

Voir [LICENSE.txt](LICENSE.txt). Distribution binaire ; le code source n'est pas publié.
Utilisation gratuite, y compris l'intégration dans votre propre application Node.js/
Electron et sa distribution à vos propres utilisateurs finaux. Un rendu sans clé de
licence activée ajoute un filigrane à la sortie.
