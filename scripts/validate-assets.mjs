#!/usr/bin/env node
/**
 * Asset & content validator — the mechanical gates from docs/ASSET_PROCEDURE.md.
 *
 *   node scripts/validate-assets.mjs        # human report
 *   node scripts/validate-assets.mjs --json # machine report (CI)
 *
 * Exits 1 when any ERROR-level rule fails. WARN lines are advisory.
 */
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const jsonMode = process.argv.includes('--json');

const errors = [];
const warns = [];
const ok = [];
const err = (rule, msg) => errors.push({ rule, msg });
const warn = (rule, msg) => warns.push({ rule, msg });
const pass = (msg) => ok.push(msg);

// --- Compile the data layer with the TS API so we get real values ---
const srcFiles = [
    'src/data/maps.ts',
    'src/data/npcs.ts',
    'src/data/npcSchedules.ts',
    'src/data/items.ts',
    'src/data/streetEncounters.ts',
    'src/data/randomEvents.ts',
    'src/types/index.ts'
].map((f) => path.join(projectRoot, f));

const cfgPath = ts.findConfigFile(projectRoot, ts.sys.fileExists, 'tsconfig.json');
const cfg = ts.parseJsonConfigFileContent(
    ts.readConfigFile(cfgPath, ts.sys.readFile).config,
    ts.sys,
    projectRoot
);
const compiled = ts.createProgram([...new Set([...cfg.fileNames, ...srcFiles])], {
    ...cfg.options,
    noEmit: true
});
const checker = compiled.getTypeChecker();
const getExports = (file) => {
    const sf = compiled.getSourceFile(file);
    if (!sf) die(`source not found: ${file}`);
    const mod = checker.getSymbolAtLocation(sf);
    return checker.getExportsOfModule(mod);
};
const pick = (exports, name) => exports.find((e) => e.getName() === name);
function literalOf(init) {
    if (!init) return undefined;
    if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init)) return init.text;
    if (ts.isNumericLiteral(init)) return Number(init.text);
    if (init.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (init.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (ts.isObjectLiteralExpression(init)) {
        const out = {};
        for (const p of init.properties) {
            if (ts.isPropertyAssignment(p)) out[p.name.getText()] = literalOf(p.initializer);
        }
        return out;
    }
    if (ts.isArrayLiteralExpression(init)) return init.elements.map(literalOf);
    if (ts.isPrefixUnaryExpression(init)) return literalOf(init.operand);
    return init.getText(); // identifier/computed — surface as text
}
const die = (msg) => {
    process.stderr.write(`validator: ${msg}\n`);
    process.exit(2);
};

let MAPS, NPCS, SCHEDULES, ITEMS, ENCOUNTERS, EVENTS;
try {
    const mapExports = getExports(srcFiles[0]);
    MAPS = extractRecord(pick(mapExports, 'MAP_DEFINITIONS'));

    const npcExports = getExports(srcFiles[1]);
    NPCS = extractRecord(pick(npcExports, 'NPCS'));

    const schedExports = getExports(srcFiles[2]);
    SCHEDULES = extractRecord(pick(schedExports, 'NPC_SCHEDULES'));

    const itemExports = getExports(srcFiles[3]);
    ITEMS = extractRecord(pick(itemExports, 'ITEMS'));

    const encExports = getExports(srcFiles[4]);
    ENCOUNTERS = extractArray(pick(encExports, 'STREET_ENCOUNTERS'));

    const evtExports = getExports(srcFiles[5]);
    EVENTS = extractArray(pick(evtExports, 'RANDOM_EVENTS'));
} catch (e) {
    die(`failed to compile data layer: ${e.message}`);
}

/** Turn a Record<string, {...}> initializer into a plain object of literals. */
function extractRecord(symbol) {
    const out = {};
    const decl = symbol?.declarations?.[0];
    if (!decl) die('registry symbol has no declaration');
    const init = decl.initializer; // ObjectLiteralExpression
    for (const prop of init.properties) {
        if (!ts.isPropertyAssignment(prop)) continue;
        const key = prop.name.getText().replace(/^['"]|['"]$/g, '');
        out[key] = literalOf(prop.initializer);
    }
    return out;
}
function extractArray(symbol) {
    const decl = symbol?.declarations?.[0];
    if (!decl) die('array symbol has no declaration');
    return decl.initializer.elements.map(literalOf);
}

// --- Real venue ids from maps + known fallback venues ---
const venueIds = new Set(Object.keys(MAPS));
// Scene-only venues (no standalone map): derived from NPC locations & exits
for (const npc of Object.values(NPCS)) if (npc.location) venueIds.add(npc.location);
for (const map of Object.values(MAPS)) {
    for (const b of map.buildings || []) if (b.type === 'exit' && b.target) venueIds.add(b.target);
}
const FACTIONS = new Set(['angel', 'ghost', 'demon']);
const STATS = new Set(['will', 'power', 'intelligence', 'charisma', 'luck', 'karma', 'worth', 'energy', 'health']);
const NPC_ID_RE = /^npc_[a-z0-9_]+$/;
const DAYPARTS = ['morning', 'afternoon', 'evening', 'night'];

// ============ RULE: registry key === id ============
for (const [registryName, registry] of [['NPCS', NPCS], ['ITEMS', ITEMS], ['MAP_DEFINITIONS', MAPS]]) {
    for (const [key, value] of Object.entries(registry)) {
        if (value && typeof value === 'object' && value.id !== undefined && value.id !== key) {
            err('ID_KEY_MATCH', `${registryName}: key "${key}" != id "${value.id}"`);
        }
    }
}
pass(`key===id verified across NPCS (${Object.keys(NPCS).length}), ITEMS (${Object.keys(ITEMS).length}), MAPS (${Object.keys(MAPS).length})`);

// ============ RULE: NPC id naming + required fields ============
for (const [id, npc] of Object.entries(NPCS)) {
    if (!NPC_ID_RE.test(id)) err('NPC_ID_FORMAT', `NPC "${id}" does not match npc_<snake_case>`);
    if (!npc.name) err('NPC_FIELDS', `${id}: missing name`);
    if (!npc.location) err('NPC_FIELDS', `${id}: missing location`);
    else if (!venueIds.has(npc.location)) err('NPC_REF', `${id}: location "${npc.location}" is not a known venue`);

    const base = npc.baseDialogue;
    if (!Array.isArray(base) || base.length < 2) err('NPC_DIALOGUE', `${id}: baseDialogue needs >= 2 lines`);

    const dp = npc.daypartDialogue;
    if (dp && typeof dp === 'object') {
        for (const [daypart, pool] of Object.entries(dp)) {
            if (!DAYPARTS.includes(daypart)) err('NPC_DAYPART', `${id}: unknown daypart "${daypart}"`);
            if (!Array.isArray(pool) || pool.length === 0) err('NPC_DAYPART', `${id}: empty pool for "${daypart}"`);
        }
        if ((!dp.morning || dp.morning.length === 0) || (!dp.night || dp.night.length === 0)) {
            warn('NPC_DAYPART', `${id}: missing morning/night pools (procedure §3.4)`);
        }
    } else {
        warn('NPC_DAYPART', `${id}: no daypartDialogue (procedure §3.4)`);
    }

    if (npc.faction && !FACTIONS.has(npc.faction)) err('NPC_FACTION', `${id}: unknown faction "${npc.faction}"`);
    if (npc.serviceFaction && !FACTIONS.has(npc.serviceFaction)) err('NPC_FACTION', `${id}: unknown serviceFaction`);
    if (npc.specialService && (!npc.specialServiceFlags || npc.specialServiceFlags.length === 0)) {
        err('NPC_SERVICE', `${id}: specialService "${npc.specialService}" has no specialServiceFlags`);
    }
    if (npc.questId && !npc.questId) err('NPC_REF', `${id}: empty questId`);
}
pass(`NPC field/reference checks complete (${Object.keys(NPCS).length} NPCs)`);

// ============ RULE: schedule integrity ============
for (const [npcId, blocks] of Object.entries(SCHEDULES)) {
    if (!NPCS[npcId]) err('SCHED_ORPHAN', `NPC_SCHEDULES has "${npcId}" but no such NPC exists`);
    if (!Array.isArray(blocks)) continue;
    let covered = 0;
    for (const b of blocks) {
        if (typeof b.from !== 'number' || typeof b.to !== 'number') err('SCHED_SHAPE', `${npcId}: block missing from/to`);
        else {
            if (b.from >= b.to) err('SCHED_SHAPE', `${npcId}: block ${b.from}-${b.to} is inverted`);
            if (b.from < 0 || b.to > 1440) err('SCHED_SHAPE', `${npcId}: block ${b.from}-${b.to} outside 0-1440`);
            covered += b.to - b.from;
        }
        if (b.location && !venueIds.has(b.location)) err('SCHED_REF', `${npcId}: scheduled venue "${b.location}" is not a known venue`);
    }
    if (Array.isArray(blocks) && covered > 0 && covered < 360) {
        warn('SCHED_COVERAGE', `${npcId}: schedule covers only ${covered} min (procedure §3.5 suggests >= 360)`);
    }
}
pass(`schedule integrity checked (${Object.keys(SCHEDULES).length} schedules)`);

// ============ RULE: map geometry ============
for (const [mapId, map] of Object.entries(MAPS)) {
    const W = map.width, H = map.height;
    if (map.spawn) {
        const s = map.spawn;
        if (s.x < 0 || s.y < 0 || s.x > W - 20 || s.y > H - 20) err('MAP_SPAWN', `${mapId}: spawn outside map bounds`);
    } else {
        err('MAP_SPAWN', `${mapId}: missing spawn`);
    }
    const rects = (map.buildings || []).filter((b) => b.type !== 'exit');
    for (const b of map.buildings || []) {
        if (b.x < 0 || b.y < 0 || b.x + b.w > W || b.y + b.h > H) {
            err('MAP_BOUNDS', `${mapId}: rect (${b.x},${b.y},${b.w},${b.h}) outside map`);
        }
        if (b.type !== 'exit' && !b.action) warn('MAP_ACTION', `${mapId}: non-exit rect without action at (${b.x},${b.y})`);
    }
    for (let i = 0; i < rects.length; i++) {
        const a = rects[i];
        if (map.spawn && !(map.spawn.x + 20 < a.x || map.spawn.x > a.x + a.w || map.spawn.y + 20 < a.y || map.spawn.y > a.y + a.h)) {
            err('MAP_SPAWN', `${mapId}: spawn point intersects a building rect`);
        }
        for (let j = i + 1; j < rects.length; j++) {
            const c = rects[j];
            if (a.x < c.x + c.w && a.x + a.w > c.x && a.y < c.y + c.h && a.y + a.h > c.y) {
                err('MAP_OVERLAP', `${mapId}: buildings overlap at (${a.x},${a.y}) and (${c.x},${c.y})`);
            }
        }
    }
}
pass(`map geometry checked (${Object.keys(MAPS).length} maps)`);

// ============ RULE: action routing ============
const resolverSrc = fs.readFileSync(path.join(projectRoot, 'src/lib/ActionResolver.ts'), 'utf8');
const pageSrc = fs.readFileSync(path.join(projectRoot, 'src/app/page.tsx'), 'utf8');
const actionRouter = resolverSrc + pageSrc;
for (const [mapId, map] of Object.entries(MAPS)) {
    for (const b of map.buildings || []) {
        if (b.type === 'exit') continue;
        if (b.action && !actionRouter.includes(`'${b.action}'`) && !actionRouter.includes(`"${b.action}"`)) {
            err('ACTION_ROUTE', `${mapId}: action "${b.action}" is never handled in ActionResolver/page`);
        }
    }
}
pass('building actions routed');

// ============ RULE: item integrity ============
const ITEM_TYPES = new Set(['consumable', 'weapon', 'misc', 'electronics', 'luxury', 'gym']);
for (const [id, item] of Object.entries(ITEMS)) {
    if (!/^[a-z0-9_]+$/.test(id)) err('ITEM_ID_FORMAT', `item "${id}" is not snake_case`);
    if (!ITEM_TYPES.has(item.type)) err('ITEM_TYPE', `${id}: unknown type "${item.type}"`);
    if (typeof item.cost !== 'number' || item.cost < 0) err('ITEM_COST', `${id}: invalid cost`);
    if (item.type === 'weapon' && !item.weaponStats) err('ITEM_WEAPON', `${id}: weapon without weaponStats`);
    for (const fx of item.effects || []) {
        if (!STATS.has(fx.stat)) err('ITEM_EFFECT', `${id}: effect targets unknown stat "${fx.stat}"`);
    }
    if (item.shopDistrict && !venueIds.has(item.shopDistrict)) err('ITEM_REF', `${id}: shopDistrict "${item.shopDistrict}" is not a venue`);
}
pass(`item integrity checked (${Object.keys(ITEMS).length} items)`);

// ============ RULE: encounters & events reference the real world ============
for (const enc of ENCOUNTERS) {
    if (!NPCS[enc.npcId]) err('ENC_REF', `street encounter ${enc.id}: unknown NPC "${enc.npcId}"`);
    for (const v of enc.venues || []) {
        if (!venueIds.has(v)) err('ENC_REF', `street encounter ${enc.id}: unknown venue "${v}"`);
    }
    if (enc.kind === 'warning' && !enc.dismiss) {
        err('ENC_SHAPE', `street encounter ${enc.id}: warning without dismiss handler`);
    }
    if (!Array.isArray(enc.lines) || enc.lines.length === 0) {
        err('ENC_SHAPE', `street encounter ${enc.id}: no lines`);
    }
}
for (const evt of EVENTS) {
    if (!Array.isArray(evt.contexts) || evt.contexts.length === 0) err('EVENT_SHAPE', `event ${evt.id}: no contexts`);
    if (typeof evt.weight !== 'number' || evt.weight <= 0) err('EVENT_SHAPE', `event ${evt.id}: invalid weight`);
    for (const loc of evt.locations || []) {
        if (!venueIds.has(loc)) err('EVENT_REF', `event ${evt.id}: unknown location "${loc}"`);
    }
}
pass(`encounters (${ENCOUNTERS.length}) and events (${EVENTS.length}) referenced correctly`);

// ============ REPORT ============
const report = { ok: errors.length === 0, errors, warnings: warns, passed: ok };
if (jsonMode) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} else {
    process.stdout.write('\n=== ASSET VALIDATION ===\n\n');
    for (const line of ok) process.stdout.write(`  ✔ ${line}\n`);
    for (const w of warns) process.stdout.write(`  ⚠ [${w.rule}] ${w.msg}\n`);
    for (const e of errors) process.stdout.write(`  ✗ [${e.rule}] ${e.msg}\n`);
    process.stdout.write(`\n${ok.length} checks passed, ${warns.length} warnings, ${errors.length} errors\n`);
    if (errors.length > 0) process.stdout.write('\nRules: docs/ASSET_PROCEDURE.md\n');
}
process.exit(errors.length === 0 ? 0 : 1);
