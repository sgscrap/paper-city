import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NPCS } from '../src/data/npcs';
import { NPC_SCHEDULES } from '../src/data/npcSchedules';
import { ITEMS } from '../src/data/items';
import { STREET_ENCOUNTERS } from '../src/data/streetEncounters';
import { VENUE_NAMES } from '../src/lib/NpcCityAI';
import { generateDailyContracts } from '../src/data/contracts';
import { FACTION_VENDORS } from '../src/data/economy';

const projectRoot = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(projectRoot, p), 'utf8');

describe('Asset & Content Authoring Procedure', () => {
    it('procedure document exists and covers all asset classes', () => {
        const doc = read('docs/ASSET_PROCEDURE.md');
        for (const section of ['Buildings & Maps', 'NPCs', 'Items', 'Wiring', 'Art Assets', 'Definition of Done']) {
            expect(doc).toContain(section);
        }
    });

    it('validator exists and is wired into the release pipeline', () => {
        expect(fs.existsSync(path.join(projectRoot, 'scripts', 'validate-assets.mjs'))).toBe(true);
        expect(read('scripts/release.mjs')).toContain('assets:check');
        expect(read('package.json')).toContain('assets:check');
    });

    it('registry keys match their id fields (IDs are forever, key===id)', () => {
        for (const [key, npc] of Object.entries(NPCS)) expect(npc.id).toBe(key);
        for (const mapId of Object.keys(VENUE_NAMES)) expect(typeof mapId).toBe('string');
    });

    it('every NPC id follows the npc_ prefix convention', () => {
        for (const id of Object.keys(NPCS)) expect(id).toMatch(/^npc_[a-z0-9_]+$/);
    });

    it('every scheduled NPC exists in the NPC registry (no orphan schedules)', () => {
        for (const npcId of Object.keys(NPC_SCHEDULES)) {
            expect(NPCS[npcId], `orphan schedule for ${npcId}`).toBeDefined();
        }
    });

    it('every declared daypart pool is non-empty (no dead greetings)', () => {
        for (const npc of Object.values(NPCS)) {
            if (!npc.daypartDialogue) continue;
            for (const [daypart, pool] of Object.entries(npc.daypartDialogue)) {
                expect(pool!.length, `${npc.id} ${daypart} pool empty`).toBeGreaterThan(0);
            }
        }
    });

    it('items reference known stat names in their effects', () => {
        const knownStats = new Set(['will', 'power', 'intelligence', 'charisma', 'luck', 'karma', 'worth', 'energy', 'health']);
        for (const [id, item] of Object.entries(ITEMS)) {
            for (const fx of item.effects ?? []) {
                expect(knownStats.has(fx.stat), `${id} targets unknown stat ${fx.stat}`).toBe(true);
            }
        }
    });

    it('street encounters reference real NPCs and venues', () => {
        const venues = new Set(Object.keys(VENUE_NAMES));
        for (const enc of STREET_ENCOUNTERS) {
            expect(NPCS[enc.npcId], `${enc.id}: unknown NPC`).toBeDefined();
            for (const venue of enc.venues ?? []) {
                expect(venues.has(venue), `${enc.id}: unknown venue ${venue}`).toBe(true);
            }
        }
    });

    it('validator enforces faction parity from the content matrix (matrix rules present)', () => {
        const validator = read('scripts/validate-assets.mjs');
        for (const rule of ['MATRIX_PARITY', 'MATRIX_MISSING', 'MATRIX_SHAPE', 'MATRIX_DRIFT', 'CONTRACT_BALANCE', 'VENDOR_PARITY', 'SERVICE_PARITY']) {
            expect(validator).toContain(rule);
        }
        expect(read('src/data/factionContentMatrix.ts')).toContain('FACTION_CONTENT_MATRIX');
    });

    it('validator hard-fails on degraded contract extraction instead of false-green', () => {
        const validator = read('scripts/validate-assets.mjs');
        expect(validator).toContain('extraction degraded');
    });

    it('contract pool keeps factions within the 2x balance band', () => {
        // Mirrors the validator's CONTRACT_BALANCE rule from the public generator.
        const seen = new Map<string, string>();
        for (let day = 0; day < 400 && seen.size < 300; day++) {
            for (const offer of generateDailyContracts(day)) seen.set(offer.id, offer.faction);
        }
        const counts: Record<string, number> = { angel: 0, ghost: 0, demon: 0 };
        for (const faction of seen.values()) counts[faction] = (counts[faction] || 0) + 1;
        const max = Math.max(...Object.values(counts));
        const min = Math.min(...Object.values(counts));
        expect(max / Math.max(min, 1)).toBeLessThanOrEqual(2);
    });

    it('gated faction vendors exist for every faction (vendor parity)', () => {
        const gated: Record<string, number> = { angel: 0, ghost: 0, demon: 0 };
        for (const vendor of FACTION_VENDORS) {
            if ((vendor.requiredReputation ?? 0) > 0) gated[vendor.faction] += 1;
        }
        for (const faction of ['angel', 'ghost', 'demon'] as const) {
            expect(gated[faction], `no gated vendor for ${faction}`).toBeGreaterThan(0);
        }
    });

    it('neutral vendors are intentionally ungated (requiredReputation 0)', () => {
        const counter = FACTION_VENDORS.find((v) => v.id === 'vendor_all_factions_counter');
        expect(counter).toBeDefined();
        expect(counter!.requiredReputation ?? 0).toBe(0);
    });
});
