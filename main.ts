// HouseLedger entry program (Node 22, standard library only).
//
// The site is app/: plain static files — index.html plus its own CSS and JS,
// no build step, nothing loaded over the network. This program hands it in:
// it copies app/ and screenshots/ from beside this file into /output and
// writes /output/dossier.json, the summary the judge reads (the screenshots,
// the first load's files and bytes, and the site's source), using the vendored
// make.fun library. Leave vendor/makefun-frontend.ts untouched: the scorer
// rebuilds the dossier with its own copy and requires a byte-for-byte match.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory holding this file; /output is the
// grader's writable directory, or MAKEFUN_OUTPUT_DIR when run locally.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file from an earlier run
// can never ride along into the entry.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

// The whole site, as shipped.
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

// The maker's own screenshots of the site running, first by name the cover.
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The dossier the gate and the judge read. The caps mirror the gate's own
// (reference/gate.json): at most 4 screenshots of 256 KiB each, app/ within
// 993 files and 16 MiB, and the dossier text capped at 160 KiB.
const dossierPath = join(outputDir, 'dossier.json');
writeFileSync(
  dossierPath,
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);

// Fail loudly instead of handing in an empty dossier: the grader runs this
// program twice and both runs must write the same bytes, so a truncated or
// missing dossier here is a broken entry, not a quiet one.
const dossierBytes = readFileSync(dossierPath).length;
if (dossierBytes === 0) throw new Error('dossier.json came out empty');
console.log('wrote ' + outputDir + ' (dossier.json ' + dossierBytes + ' bytes)');
