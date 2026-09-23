import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NPCS } from '../src/data/npcs';
import { NPC_SCHEDULES } from '../src/data/npcSchedules';
import { ITEMS } from '../src/data/items';
import { STREET_ENCOUNTERS } from '../src/data/streetEncounters';
import { VENUE_NAMES } from '../src/lib/NpcCityAI';

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
});
