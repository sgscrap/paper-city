#!/usr/bin/env node
/**
 * Paper City one-command release.
 *
 *   node scripts/release.mjs <version> [release-notes-file]
 *
 * Example:
 *   node scripts/release.mjs 0.1.3 docs/PATCH_NOTES_0.1.3.md
 *
 * Steps:
 *   1. Bump package.json version
 *   2. Run validation: typecheck, lint, unit tests
 *   3. Production build + desktop packaging (electron-builder NSIS)
 *   4. Packaged-app smoke test against the freshly built exe
 *   5. Commit (version bump + any pending changes), tag vX.Y.Z, push
 *   6. Create the GitHub release with the installer attached
 *
 * Flags:
 *   --skip-smoke    skip the packaged-app smoke test (not recommended)
 *   --dry-run       do everything except commit/push/tag/release
 *   --notes <file>  release notes file (alternative to positional arg)
 *
 * Requires: gh CLI authenticated (gh auth status), clean-enough git tree.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const skipSmoke = args.includes('--skip-smoke');
const notesFlagIdx = args.indexOf('--notes');
const notesFile = notesFlagIdx >= 0 ? args[notesFlagIdx + 1] : args.find((a, i) => !a.startsWith('--') && i !== (notesFlagIdx >= 0 ? notesFlagIdx + 1 : -1) && /^\d+\.\d+\.\d+/.test(a) === false && fs.existsSync(path.resolve(projectRoot, a)));

const versionArg = args.find((a) => /^\d+\.\d+\.\d+(-[\w.]+)?$/.test(a));
const VERSION = versionArg;
const TAG = `v${VERSION}`;
const INSTALLER = path.join(projectRoot, 'release', `Paper-City-Setup-${VERSION}.exe`);

const step = (msg) => process.stdout.write(`\n▶ ${msg}\n`);
const die = (msg) => {
    process.stderr.write(`\n✗ RELEASE FAILED: ${msg}\n`);
    process.exit(1);
};
/**
 * Run a command. In dry-run mode NOTHING executes except commands explicitly
 * marked as side-effect-free via `readOnly: true` (e.g. the smoke test, which
 * only boots the app on an isolated port and reads HTTP responses).
 */
const run = (cmd, opts = {}) => {
    if (dryRun && !opts.readOnly) {
        process.stdout.write(`  [dry-run] ${cmd}\n`);
        return '';
    }
    try {
        return execSync(cmd, { cwd: projectRoot, stdio: opts.quiet ? 'pipe' : 'inherit', encoding: 'utf8' });
    } catch (error) {
        if (opts.continueOnError) {
            process.stdout.write(`  (non-fatal) ${cmd} failed\n`);
            return '';
        }
        die(`command failed: ${cmd}\n${error.stderr || error.message}`);
        return '';
    }
};

if (!VERSION) {
    process.stderr.write('Usage: npm run desktop:release -- <version> [notes-file] [--dry-run] [--skip-smoke]\n');
    process.stderr.write('Example: npm run desktop:release -- 0.1.3 docs/PATCH_NOTES_0.1.3.md\n');
    process.exit(1);
}

// --- Preflight ---
step(`Release ${TAG} starting${dryRun ? ' (DRY RUN)' : ''}`);

const pkgPath = path.join(projectRoot, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
if (pkg.version === VERSION) {
    die(`package.json is already ${VERSION}. Bump the version first.`);
}

step('Preflight: gh auth, git state');
try {
    execSync('gh auth status', { stdio: 'pipe' });
} catch {
    die('gh CLI is not authenticated. Run: gh auth login');
}
const gitStatus = execSync('git status --porcelain', { cwd: projectRoot, encoding: 'utf8' }).trim();
if (gitStatus && !dryRun) {
    process.stdout.write(`  Uncommitted changes will be included in the release commit:\n${gitStatus.split('\n').map((l) => `    ${l}`).join('\n')}\n`);
}

// --- 1. Bump version ---
step(`Bump version ${pkg.version} → ${VERSION}`);
pkg.version = VERSION;
if (!dryRun) fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
process.stdout.write(`  package.json → ${VERSION}\n`);

// --- 2. Validate ---
step('Typecheck');
run('npx tsc --noEmit', { quiet: true });

step('Lint');
run('npm run lint', { quiet: true });

step('Unit tests');
run('npx vitest run', { quiet: true });

step('Asset validation');
run('npm run assets:check', { quiet: true });

// --- 3. Build & package ---
step('Production build');
run('npm run build');

step('Desktop packaging (electron-builder NSIS)');
// Kill a running packaged app first — it locks win-unpacked DLLs (EPERM).
if (process.platform === 'win32') {
    try { execSync('taskkill /IM "Paper City.exe" /F /T', { stdio: 'ignore' }); } catch { /* not running */ }
}
run('npx electron-builder --win nsis');

if (!fs.existsSync(INSTALLER)) {
    if (dryRun) {
        process.stdout.write(`  [dry-run] installer ${path.basename(INSTALLER)} will be created by packaging\n`);
    } else {
        die(`Installer not found at ${INSTALLER} — packaging output missing.`);
    }
} else {
    process.stdout.write(`  Installer ready: ${path.basename(INSTALLER)}\n`);
}

// --- 4. Social preview banner ---
step(`Render social preview banner (v${VERSION})`);
run(`node scripts/social-preview.mjs ${VERSION}`, { quiet: true });
process.stdout.write(`  banner refreshed: docs/social-banner.png\n`);

// --- 5. Smoke test ---
if (skipSmoke) {
    step('Skipping smoke test (--skip-smoke)');
} else {
    step('Packaged-app smoke test');
    run('npm run desktop:smoke', { readOnly: true });
}

// --- 6. Commit, tag, push ---
step('Commit release changes');
run(`git add -A .`);
const commitMsg = `Release ${TAG}\\n\\nVersion bump and release artifacts for Update ${VERSION}.\\n\\n🤖 Generated with Codebuff\\nCo-Authored-By: Codebuff <noreply@codebuff.com>`;
run(`git commit -m "${commitMsg}"`);

step(`Tag ${TAG}`);
run(`git tag -a ${TAG} -m "Update ${VERSION}"`);

step('Push master + tag');
run('git push origin master');
run(`git push origin ${TAG}`);

// --- 7. GitHub release ---
step('Publish GitHub release');
const notesArgs = notesFile ? ` --notes-file "${path.resolve(projectRoot, notesFile)}"` : ' --generate-notes';
run(`gh release create ${TAG} "${INSTALLER}" --title "Update ${VERSION}"${notesArgs}`);

process.stdout.write(`\n✓ Release ${TAG} published${dryRun ? ' (DRY RUN — nothing was pushed)' : ''}\n`);
if (notesFile) {
    process.stdout.write(`  Notes: ${notesFile}\n`);
} else {
    process.stdout.write('  Notes: auto-generated from commits. Pass a notes file next time for full patch notes.\n');
}
process.stdout.write(`  URL: https://github.com/sgscrap/paper-city/releases/tag/${TAG}\n`);
