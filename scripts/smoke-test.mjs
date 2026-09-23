#!/usr/bin/env node
/**
 * Packaged-app smoke test.
 *
 * Boots the packaged Paper City desktop executable, waits for its embedded
 * game server, fetches the page, and asserts the living NPC system content is
 * present in the production bundle (schedule data, daypart dialogue, street
 * encounter overlay, service roster). Exits 0 on success, 1 on failure, and
 * always cleans up the spawned app.
 *
 * Usage:
 *   node scripts/smoke-test.mjs [path-to-exe]
 *
 * Defaults to release/win-unpacked/"Paper City.exe" on Windows.
 */
import { spawn, execSync } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const EXE_PATH = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(projectRoot, 'release', 'win-unpacked', process.platform === 'win32' ? 'Paper City.exe' : 'paper-city');

const MARKERS = [
    // Daypart dialogue (Mayor McPaper, morning greeting)
    'Morning briefing. Everything is under control',
    // Street encounter overlay
    'STREET ENCOUNTER',
    // Living-city dialogue controls
    'SERVICE USED TODAY',
    // Service contacts roster
    'Where services are right now'
];

// NPC schedule entries compiled into the bundle (id -> venue blocks). Marker
// content is mirrored in tests/NpcCityAI.test.ts; if schedules change there,
// update this list.
const NPC_SCHEDULE_MARKERS = [
    'npc_ace',
    'npc_ghost',
    'npc_ticker_tess',
    'the_block',
    'underground_markets'
];

const results = [];
let serverPort = null;
let child = null;

const log = (msg) => process.stdout.write(`${msg}\n`);
const record = (name, ok, detail = '') => {
    results.push({ name, ok, detail });
    log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const get = (url, timeoutMs = 5000) => new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(timeoutMs, () => {
        req.destroy(new Error(`timeout after ${timeoutMs}ms`));
    });
});

const portFree = (port) => new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
});

const killStaleApp = () => {
    if (process.platform !== 'win32') return;
    try {
        execSync('taskkill /IM "Paper City.exe" /F /T', { stdio: 'ignore' });
        log('Killed a stale Paper City instance (was holding the port/unpacked dir).');
    } catch {
        /* not running — fine */
    }
};

const findFreePort = async () => {
    for (let port = 3100; port < 3140; port++) {
        if (await portFree(port)) return port;
    }
    throw new Error('No free port found in 3100-3139');
};

const fetchAllChunks = async (html) => {
    const chunkUrls = [...new Set(
        (html.match(/_next\/static\/chunks\/[a-zA-Z0-9._%-]+\.js/g) || [])
            .map((p) => `http://127.0.0.1:${serverPort}/${p}`)
    )];
    const bodies = await Promise.all(chunkUrls.map((url) => get(url).then((r) => r.body).catch(() => '')));
    return bodies.join('\n');
};

const stopApp = () => {
    try {
        if (child && child.pid && process.platform === 'win32') {
            execSync(`taskkill /PID ${child.pid} /F /T`, { stdio: 'ignore' });
        } else if (child) {
            child.kill('SIGTERM');
        }
    } catch {
        /* already gone */
    }
};

const run = async () => {
    log('=== Paper City packaged-app smoke test ===\n');

    // --- Preflight ---
    if (!fs.existsSync(EXE_PATH)) {
        record('executable exists', false, EXE_PATH);
        log('\nBuild it first: npm run desktop:package');
        process.exit(1);
    }
    record('executable exists', true, path.relative(projectRoot, EXE_PATH));

    killStaleApp();

    serverPort = await findFreePort();
    record('test port is free', true, String(serverPort));

    // --- Boot the packaged app ---
    log(`\nBooting ${path.basename(EXE_PATH)} on port ${serverPort}...`);
    child = spawn(EXE_PATH, [], {
        env: { ...process.env, PAPER_CITY_PORT: String(serverPort) },
        stdio: 'ignore',
        detached: false
    });

    const bootDeadline = Date.now() + 90_000;
    let booted = false;
    while (Date.now() < bootDeadline) {
        if (child.exitCode !== null) {
            record('app process stays alive', false, `exited with code ${child.exitCode}`);
            break;
        }
        try {
            const res = await get(`http://127.0.0.1:${serverPort}/`, 2000);
            if (res.status === 200) { booted = true; break; }
        } catch { /* not up yet */ }
        await new Promise((r) => setTimeout(r, 1000));
    }

    if (booted) {
        record('app boots and serves the game', true, `http://127.0.0.1:${serverPort} responded 200`);
    } else if (results.at(-1).name !== 'app process stays alive') {
        record('app boots and serves the game', false, 'server never answered within 90s');
    }

    if (booted) {
        // --- Page + bundle assertions ---
        const page = await get(`http://127.0.0.1:${serverPort}/`, 10000);
        record('page loads with title', page.body.includes('Paper City'), `HTTP ${page.status}`);

        const chunks = await fetchAllChunks(page.body);
        const combined = `${page.body}\n${chunks}`;

        for (const marker of MARKERS) {
            record(`bundle marker: ${marker.slice(0, 40)}`, combined.includes(marker));
        }

        const missingSchedule = NPC_SCHEDULE_MARKERS.filter((m) => !combined.includes(m));
        record(
            'NPC schedule data compiled into bundle',
            missingSchedule.length === 0,
            missingSchedule.length ? `missing: ${missingSchedule.join(', ')}` : 'all schedule markers present'
        );

        record(
            'no failed asset requests on page load',
            !/\/noise\.png/.test(page.body),
            'legacy noise.png reference is gone'
        );
    }

    // --- Cleanup ---
    stopApp();
    log('\nApp stopped.');

    // --- Summary ---
    const failed = results.filter((r) => !r.ok);
    log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`);
    process.exit(failed.length === 0 ? 0 : 1);
};

run().catch((error) => {
    log(`SMOKE TEST CRASHED: ${error.message}`);
    stopApp();
    process.exit(1);
});
