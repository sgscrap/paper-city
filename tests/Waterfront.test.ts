import { describe, expect, it } from 'vitest';
import { MAP_DEFINITIONS } from '@/data/maps';
import { LOCATIONS } from '@/data/locations';
import { NPCS } from '@/data/npcs';
import { NPC_SCHEDULES } from '@/data/npcSchedules';
import { VENUE_NAMES, getNpcVenue } from '@/lib/NpcCityAI';
import { ENEMIES } from '@/data/enemies';
import { FACTION_VENDORS } from '@/data/economy';
import { ITEMS } from '@/data/items';
import { ACTIONS } from '@/data/actions';
import { CONTRACTS_TRIGGER_TARGETS } from './helpers/contractTargets';

const WATERFRONT = MAP_DEFINITIONS['the_waterfront'];

describe('The Waterfront — map & placement gate', () => {
    it('registers the district as a first-class venue', () => {
        expect(WATERFRONT).toBeDefined();
        expect(LOCATIONS['the_waterfront']).toBeDefined();
        expect(VENUE_NAMES['the_waterfront']).toBe('The Waterfront');
    });

    it('keeps all building rects in bounds and non-overlapping', () => {
        const rects = WATERFRONT.buildings;
        for (const r of rects) {
            expect(r.x).toBeGreaterThanOrEqual(0);
            expect(r.y).toBeGreaterThanOrEqual(0);
            expect(r.x + r.w).toBeLessThanOrEqual(WATERFRONT.width);
            expect(r.y + r.h).toBeLessThanOrEqual(WATERFRONT.height);
        }
        for (let i = 0; i < rects.length; i++) {
            for (let j = i + 1; j < rects.length; j++) {
                const a = rects[i], b = rects[j];
                const overlaps = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
                expect(overlaps, `rects ${i} and ${j} overlap`).toBe(false);
            }
        }
    });

    it('never blocks the spawn point with a non-exit rect', () => {
        const box = { x: WATERFRONT.spawn.x, y: WATERFRONT.spawn.y, w: 20, h: 20 };
        for (const r of WATERFRONT.buildings) {
            if (r.type === 'exit') continue;
            const hits = box.x < r.x + r.w && r.x < box.x + box.w && box.y < r.y + r.h && r.y < box.y + box.h;
            expect(hits, `non-exit rect at (${r.x},${r.y}) intersects spawn`).toBe(false);
        }
    });

    it('connects bidirectionally to The Block', () => {
        expect(LOCATIONS['the_waterfront'].connectedTo).toContain('the_block');
        const blockMap = MAP_DEFINITIONS['the_block'];
        expect(
            blockMap.buildings.some((b) => b.type === 'exit' && b.target === 'the_waterfront'),
            'the_block map must have an exit targeting the_waterfront'
        ).toBe(true);
        expect(
            WATERFRONT.buildings.some((b) => b.type === 'exit' && b.target === 'the_block'),
            'the_waterfront map must have an exit targeting the_block'
        ).toBe(true);
    });

    it('routes every building action through the page router', async () => {
        const fs = await import('fs');
        const path = await import('path');
        const routerSrc =
            fs.readFileSync(path.join(__dirname, '../src/app/page.tsx'), 'utf8') +
            fs.readFileSync(path.join(__dirname, '../src/lib/ActionResolver.ts'), 'utf8');
        for (const b of WATERFRONT.buildings) {
            if (b.type === 'exit' || !b.action) continue;
            expect(routerSrc).toContain(`'${b.action}'`);
        }
    });
});

describe('Every map — fight targets resolve (regression: foundry_skulk)', () => {
    it('defines an ENEMIES entry for every fight building target', () => {
        for (const [mapId, map] of Object.entries(MAP_DEFINITIONS)) {
            for (const b of map.buildings) {
                if (b.action === 'fight' && b.target) {
                    expect(ENEMIES[b.target], `${mapId}: fight target "${b.target}" has no enemy`).toBeDefined();
                }
            }
        }
    });
});

describe('The Waterfront — NPC gate', () => {
    const trio = ['npc_dock_halyard', 'npc_dock_condor', 'npc_dock_harrow'];

    it('has one NPC per faction, all calling the Waterfront home', () => {
        const factions = trio.map((id) => NPCS[id].faction).sort();
        expect(factions).toEqual(['angel', 'demon', 'ghost']);
        for (const id of trio) expect(NPCS[id].location).toBe('the_waterfront');
    });

    it('resolves a venue for every NPC at every in-game minute', () => {
        for (const id of trio) {
            for (let time = 0; time < 1560; time += 15) {
                const venue = getNpcVenue(id, time);
                expect(venue, `${id} unresolved at minute ${time}`).toBeTruthy();
            }
        }
    });

    it('keeps full daypart dialogue coverage (morning through night)', () => {
        for (const id of trio) {
            const pools = NPCS[id].daypartDialogue;
            expect(pools, `${id} missing daypartDialogue`).toBeDefined();
            for (const part of ['morning', 'afternoon', 'evening', 'night'] as const) {
                expect(pools![part]?.length, `${id} missing ${part} pool`).toBeGreaterThan(0);
            }
        }
    });

    it('gives each a gated service plus a special service with ending flags', () => {
        const flags: Record<string, string[]> = {
            npc_dock_halyard: ['angel_ending_steward', 'angel_ending_authority'],
            npc_dock_condor: ['ghost_ending_channel', 'ghost_ending_broker'],
            npc_dock_harrow: ['demon_ending_enforcer', 'demon_ending_monster']
        };
        for (const id of trio) {
            expect(NPCS[id].service).toBeTruthy();
            expect(NPCS[id].serviceFaction).toBe(NPCS[id].faction);
            expect(NPCS[id].specialService).toBeTruthy();
            for (const flag of flags[id]) {
                expect(NPCS[id].specialServiceFlags).toContain(flag);
            }
        }
    });

    it('leaves no orphan schedules', () => {
        for (const id of Object.keys(NPC_SCHEDULES)) {
            expect(NPCS[id], `schedule for unknown NPC ${id}`).toBeDefined();
        }
    });
});

describe('The Waterfront — parity gate', () => {
    it('sells the three parity items from the shared Dockmaster House', () => {
        const dock = FACTION_VENDORS.find((v) => v.id === 'vendor_dockmaster_house');
        expect(dock).toBeDefined();
        expect(dock!.location).toBe('the_waterfront');
        const stockIds = dock!.stock.map((s) => s.itemId);
        expect(stockIds).toEqual(
            expect.arrayContaining(['harbor_seal', 'redrafted_manifest', 'crane_hook'])
        );
        for (const id of stockIds) {
            expect(ITEMS[id], `vendor stock references missing item ${id}`).toBeDefined();
        }
        const prices = dock!.stock.map((s) => s.price);
        expect(new Set(prices).size).toBe(1);
    });

    it('exposes one catalog action per faction within the parity band', () => {
        const trio = [ACTIONS['DOCK_MANIFEST_AUDIT'], ACTIONS['DOCK_CONTAINER_SORT'], ACTIONS['CUSTOMS_HOUSE_REVIEW']];
        for (const action of trio) expect(action).toBeDefined();
        const times = [trio[0].cost.time ?? 0, trio[1].cost.time ?? 0, trio[2].cost.time ?? 0];
        expect(times[0]).toBe(120);
        expect(times[1]).toBeLessThanOrEqual(times[0]);
        expect(times[2]).toBeLessThanOrEqual(times[1]);
        const payouts = [trio[0].rewards.money ?? 0, trio[1].rewards.money ?? 0, trio[2].rewards.money ?? 0];
        expect(payouts[0]! / (payouts[1] || 1)).toBeLessThanOrEqual(2);
        for (const action of trio) {
            expect((action.rewards.stats?.power || 0) + (action.rewards.stats?.intelligence || 0) + (action.rewards.stats?.charisma || 0)).toBeLessThanOrEqual(1);
        }
    });

    it('wires one daily contract per faction to a real trigger target', () => {
        const foundryTargets = CONTRACTS_TRIGGER_TARGETS.filter(([id]) => id.startsWith('waterfront_'));
        expect(foundryTargets.map(([, t]) => t).sort()).toEqual(
            ['DOCK_CONTAINER_SORT', 'DOCK_MANIFEST_AUDIT', 'win']
        );
        for (const [id, target] of foundryTargets) {
            if (target && target.startsWith('DOCK_')) expect(ACTIONS[target], `${id} targets unknown action`).toBeDefined();
        }
    });
});
