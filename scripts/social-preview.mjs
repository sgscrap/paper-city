#!/usr/bin/env node
/**
 * Social preview automation.
 *
 *   node scripts/social-preview.mjs <version> [--upload] [--check] [--quiet]
 *
 * GitHub has no public API for a repository's social preview image (the
 * settings-only endpoint returns 404; tracked in GitHub community discussions
 * #172072 and #32166). This script automates everything around that gap:
 *
 *   1. Renders docs/social-banner.html with the version injected into the
 *      template's __VERSION__ placeholder (via an offscreen Electron capture)
 *   2. Validates the PNG (exists, exactly 1280x640, non-trivial size)
 *   3. Attempts the unofficial upload endpoint anyway — if GitHub ever ships
 *      it, automation becomes fully hands-off. A 404 is expected and handled.
 *   4. On 404, prints the exact assisted fallback (one settings page + a
 *      pre-computed curl command to fetch the fresh PNG) and exits 0 so the
 *      release pipeline continues. Use --check to make it exit 1 instead,
 *      suitable for strict CI.
 *
 * Flags:
 *   --upload   actually attempt the (currently 404) API upload
 *   --check    exit non-zero when the upload is not confirmed automated
 *   --quiet    suppress the fallback instructions (for embedding)
 */
import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

const version = args.find((a) => /^\d+\.\d+\.\d+/.test(a));
const doUpload = args.includes('--upload');
const checkMode = args.includes('--check');
const quiet = args.includes('--quiet');

const REPO = 'sgscrap/paper-city';
const TEMPLATE = path.join(projectRoot, 'docs', 'social-banner.html');
const PNG = path.join(projectRoot, 'docs', 'social-banner.png');
const VERSIONED_PNG = path.join(projectRoot, 'docs', `social-banner-${version}.png`);
const API_URL = `https://api.github.com/repos/${REPO}/social-preview`;

const step = (msg) => process.stdout.write(`▶ ${msg}\n`);
const die = (msg) => {
    process.stderr.write(`✗ social-preview: ${msg}\n`);
    process.exit(1);
};

if (!version) {
    process.stderr.write('Usage: node scripts/social-preview.mjs <version> [--upload] [--check] [--quiet]\n');
    process.exit(1);
}

// --- 1. Render: inject version into the template, capture via Electron ---
step(`Render banner for v${version}`);
const html = fs.readFileSync(TEMPLATE, 'utf8');
if (!html.includes('__VERSION__')) {
    die('docs/social-banner.html is missing the __VERSION__ placeholder.');
}
const stagedHtml = TEMPLATE.replace(/\.html$/, '.render.html');
fs.writeFileSync(stagedHtml, html.replace(/__VERSION__/g, `v${version}`));

// Write a temporary capture script ("electron -e" hangs on Windows).
// NOTE: Electron+shell:true on Windows fails with absolute backslash paths —
// always pass relative paths with cwd set to the project root.
const captureScript = path.join(projectRoot, 'docs', '.banner-capture.cjs');
const stagedRel = path.relative(projectRoot, stagedHtml).split(path.sep).join('/');
const pngRel = path.relative(projectRoot, PNG).split(path.sep).join('/');
fs.writeFileSync(captureScript, `const { app, BrowserWindow } = require('electron');
const path = require('node:path');
app.whenReady().then(async () => {
    const win = new BrowserWindow({ width: 1280, height: 640, show: false, webPreferences: { offscreen: true } });
    await win.loadFile(path.resolve(${JSON.stringify(stagedRel)}));
    await new Promise((r) => setTimeout(r, 600));
    const img = await win.webContents.capturePage();
    require('node:fs').writeFileSync(path.resolve(${JSON.stringify(pngRel)}), img.toPNG());
    console.log('CAPTURE_OK');
    app.quit();
});`);

const capture = spawnSync('npx', ['electron', path.relative(projectRoot, captureScript).split(path.sep).join('/')], {
    cwd: projectRoot,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 120_000
});

fs.rmSync(stagedHtml, { force: true });
fs.rmSync(captureScript, { force: true });
const pngFresh = fs.existsSync(PNG) && Date.now() - fs.statSync(PNG).mtimeMs < 120_000;
const captureOk = capture.status === 0
    && String(capture.stdout).includes('CAPTURE_OK')
    && pngFresh;
if (!captureOk) {
    die(`banner capture failed (status=${capture.status}).\nstdout: ${String(capture.stdout).slice(0, 300)}\nstderr: ${String(capture.stderr).slice(0, 300)}`);
}
fs.copyFileSync(PNG, VERSIONED_PNG);
const size = fs.statSync(PNG).size;
process.stdout.write(`  captured docs/social-banner.png (${Math.round(size / 1024)} KB)\n`);

// --- 2. Validate ---
step('Validate banner');
if (size < 20_000) die(`banner suspiciously small (${size} bytes) — capture likely blank.`);

// PNG header check: 8-byte magic, then IHDR chunk (len@8, type@12, w@16, h@20).
const buf = fs.readFileSync(PNG);
if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') die('file is not a PNG.');
if (buf.toString('ascii', 12, 16) !== 'IHDR') die('PNG has no IHDR chunk.');
const pngWidth = buf.readUInt32BE(16);
const pngHeight = buf.readUInt32BE(20);
if (pngWidth !== 1280 || pngHeight !== 640) {
    die(`banner is ${pngWidth}x${pngHeight}, GitHub social preview requires exactly 1280x640.`);
}
process.stdout.write(`  dimensions OK (${pngWidth}x${pngHeight})\n`);

// --- 3. Attempt the upload endpoint (currently unofficial/nonexistent) ---
if (!doUpload) {
    step('Upload skipped (--upload not set)');
} else {
    step('Attempt API upload');
    const b64 = fs.readFileSync(PNG).toString('base64');
    const payload = path.join(projectRoot, 'docs', '.social-preview-payload.json');
    fs.writeFileSync(payload, JSON.stringify({ image: `data:image/png;base64,${b64}` }));
    let status = 0;
    try {
        const res = execSync(
            `curl -s -o /dev/null -w "%{http_code}" -X PUT -H "Authorization: Bearer ${execSync('gh auth token', { encoding: 'utf8' }).trim()}" -H "Content-Type: application/json" --data-binary @${JSON.stringify(payload)} ${JSON.stringify(API_URL)}`,
            { encoding: 'utf8' }
        );
        status = parseInt(res.trim(), 10);
    } catch (error) {
        status = error.status || 0;
    } finally {
        fs.rmSync(payload, { force: true });
    }

    if (status === 200 || status === 201 || status === 204) {
        process.stdout.write(`  ✓ social preview uploaded automatically (HTTP ${status})\n`);
        process.stdout.write(`  GitHub shipped the endpoint — the assisted step is obsolete.\n`);
        process.exit(0);
    }
    process.stdout.write(`  endpoint responded HTTP ${status} (expected 404 — no public API yet)\n`);
}

// --- 4. Assisted fallback ---
if (!quiet) {
    step('Assisted fallback (manual, ~30 seconds)');
    process.stdout.write(`
  GitHub has no public API for social previews (settings-only, see
  github.com/orgs/community/discussions/172072). Set it once:

    1. Open:  https://github.com/${REPO}/settings
    2. General tab → "Social preview" → Edit → Upload an image
    3. Pick:  docs\\social-banner.png  (already rendered for v${version})

  When GitHub ships the endpoint, re-run with --upload and this
  script will switch to fully automatic.
`);
}

if (checkMode) {
    process.stderr.write('✗ social-preview: upload not confirmed automated (--check)\n');
    process.exit(1);
}
process.stdout.write(`\n✓ social preview ready for v${version}\n`);
