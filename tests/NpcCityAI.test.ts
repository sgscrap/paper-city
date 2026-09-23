import { describe, it, expect } from 'vitest';
import { NpcCityAI, getNpcVenue, getVenueName, getDaypart, NpcWorldPosition } from '../src/lib/NpcCityAI';
import { NPCS } from '../src/data/npcs';
import { NPC_SCHEDULES } from '../src/data/npcSchedules';
import { MAP_DEFINITIONS } from '../src/data/maps';

describe('NPC city schedules', () => {
    it('should keep scheduled NPCs on their morning venue', () => {
        // 6:00 AM - Ace is on The Block
        expect(getNpcVenue('npc_ace', 360)).toBe('the_block');
    });

    it('should move NPCs to their scheduled daytime venue', () => {
        // Noon - Ace handles Coalition business downtown
        expect(getNpcVenue('npc_ace', 720)).toBe('dt_bmore');
        // 8:00 PM - Tommy heads underground
        expect(getNpcVenue('npc_tommy', 1200)).toBe('underground_markets');
        // 8:00 PM - Ticker Tess gambles after the markets close
        expect(getNpcVenue('npc_ticker_tess', 1200)).toBe('casino');
    });

    it('should fall back to the static location for unscheduled or off-hours NPCs', () => {
        expect(getNpcVenue('npc_keeper_nox', 1200)).toBe('safehouse'); // No schedule
        expect(getNpcVenue('npc_foreman_dex', 1400)).toBe('job_board'); // Off-hours fallback
    });

    it('should never leave a scheduled NPC without a venue', () => {
        for (const npcId of Object.keys(NPC_SCHEDULES)) {
            expect(NPCS[npcId], `${npcId} missing from NPCS`).toBeDefined();
            for (let time = 0; time <= 1560; time += 30) {
                const venue = getNpcVenue(npcId, time);
                expect(typeof venue).toBe('string');
                expect(venue.length).toBeGreaterThan(0);
            }
        }
    });

    it('should compute presence per map', () => {
        const allIds = Object.keys(NPCS);
        // 6:00 AM on the block should include Ace, Tommy, Ghost, Rook
        const morning = NpcCityAI.getPresence(allIds, 'the_block', 360);
        expect(morning).toContain('npc_ace');
        expect(morning).toContain('npc_tommy');
        expect(morning).not.toContain('npc_croupier_ivy'); // Casino opens at noon

        // Noon at the casino should include Ivy
        const noon = NpcCityAI.getPresence(allIds, 'casino', 720);
        expect(noon).toContain('npc_croupier_ivy');

        // Evening at the casino should include Ivy and Tess
        const evening = NpcCityAI.getPresence(allIds, 'casino', 1200);
        expect(evening).toContain('npc_croupier_ivy');
        expect(evening).toContain('npc_ticker_tess');
    });
});

describe('NPC movement AI', () => {
    it('should spawn NPCs at a collision-free position inside the map', () => {
        const pos = NpcCityAI.spawnFor('npc_ace', 'the_block');
        expect(pos.x).toBeGreaterThan(0);
        expect(pos.x).toBeLessThan(MAP_DEFINITIONS['the_block'].width);
        expect(pos.y).toBeGreaterThan(0);
        expect(pos.y).toBeLessThan(MAP_DEFINITIONS['the_block'].height);
        expect(pos.venue).toBe('the_block');
        expect(pos.name).toBe('Ace');
    });

    it('should not spawn NPCs inside buildings', () => {
        for (const mapId of Object.keys(MAP_DEFINITIONS)) {
            const map = MAP_DEFINITIONS[mapId];
            for (const npcId of ['npc_ace', 'npc_tommy', 'npc_ghost', 'npc_mara']) {
                const pos = NpcCityAI.spawnFor(npcId, mapId);
                const insideBuilding = map.buildings.some(
                    (b) => b.type !== 'exit' && pos.x < b.x + b.w && pos.x + 20 > b.x && pos.y < b.y + b.h && pos.y + 20 > b.y
                );
                expect(insideBuilding, `${npcId} spawned inside a building on ${mapId}`).toBe(false);
            }
        }
    });

    it('should move NPCs toward their wander target when updated', () => {
        const spawned = NpcCityAI.spawnFor('npc_ghost', 'the_block');
        const withTarget: Record<string, NpcWorldPosition> = {
            [spawned.id]: { ...spawned, targetX: spawned.x + 100, targetY: spawned.y, moving: true }
        };
        const updated = NpcCityAI.update(withTarget, 'the_block', 0.5);
        expect(updated[spawned.id].x).toBeGreaterThan(spawned.x);
        expect(updated[spawned.id].moving).toBe(true);
    });

    it('should keep NPCs within map bounds after many ticks', () => {
        const map = MAP_DEFINITIONS['the_block'];
        let pos: Record<string, NpcWorldPosition> = {
            npc_ghost: NpcCityAI.spawnFor('npc_ghost', 'the_block')
        };
        for (let i = 0; i < 200; i++) {
            pos = NpcCityAI.update(pos, 'the_block', 0.1);
        }
        const npc = pos['npc_ghost'];
        expect(npc.x).toBeGreaterThanOrEqual(0);
        expect(npc.x).toBeLessThanOrEqual(map.width);
        expect(npc.y).toBeGreaterThanOrEqual(0);
        expect(npc.y).toBeLessThanOrEqual(map.height);
    });

    it('should return positions unchanged for unknown maps', () => {
        const pos = { npc_ace: NpcCityAI.spawnFor('npc_ace', 'the_block') };
        expect(NpcCityAI.update(pos, 'unknown_map', 0.1)).toBe(pos);
    });
});

describe('Portable NPC services', () => {
    it('should include every service NPC in the roster with a resolved venue', () => {
        const roster = NpcCityAI.getServiceRoster(720);
        const tess = roster.find((entry) => entry.npcId === 'npc_ticker_tess');
        expect(tess).toBeDefined();
        expect(tess!.service).toBe('market');
        expect(tess!.specialService).toBe('Broker rates');
        expect(tess!.venue).toBe('trading_floor'); // Noon: trading floor
        expect(tess!.venueName).toBe('Trading Floor');
    });

    it('should move Tess\'s broker rates with her to the casino at night', () => {
        const roster = NpcCityAI.getServiceRoster(1200);
        const tess = roster.find((entry) => entry.npcId === 'npc_ticker_tess');
        expect(tess!.venue).toBe('casino');
        expect(tess!.venueName).toBe('Horseshoe Baltimore');
    });

    it('should exclude non-service NPCs from the roster', () => {
        const roster = NpcCityAI.getServiceRoster(720);
        expect(roster.some((entry) => entry.npcId === 'npc_tommy')).toBe(false);
        expect(roster.some((entry) => entry.npcId === 'npc_ticker_tess')).toBe(true);
        expect(roster.some((entry) => entry.npcId === 'npc_keeper_nox')).toBe(true); // safehouse service
    });

    it('should give every roster entry a known venue name', () => {
        for (const entry of NpcCityAI.getServiceRoster(600)) {
            expect(getVenueName(entry.venue)).not.toBe(entry.venue); // every venue has a friendly name
        }
    });
});

describe('Daypart greetings', () => {
    it('should map the world clock onto four dayparts', () => {
        expect(getDaypart(0)).toBe('night');
        expect(getDaypart(360)).toBe('morning');   // 6 AM
        expect(getDaypart(800)).toBe('afternoon'); // ~13:20
        expect(getDaypart(1100)).toBe('evening');  // ~18:20
        expect(getDaypart(1300)).toBe('night');    // ~21:40
        expect(getDaypart(1500)).toBe('night');    // wraps past midnight cap
    });

    it('should return daypart lines for NPCs that define them', () => {
        const greeting = NpcCityAI.getGreeting('npc_ace', 360); // 6 AM
        expect(greeting).not.toBeNull();
        expect(greeting).toMatch(/morning|coffee|sidewalks/i);
    });

    it('should change greetings as the day advances', () => {
        const morning = NpcCityAI.getGreeting('npc_ticker_tess', 480);  // 8 AM floor
        const night = NpcCityAI.getGreeting('npc_ticker_tess', 1300);   // ~9:40 PM tables
        expect(morning).not.toBeNull();
        expect(night).not.toBeNull();
        expect(morning).not.toBe(night);
        expect(morning).toMatch(/bell|edge|tape|coffee/i);
        expect(night).toMatch(/casino|table|chip|midnight/i);
    });

    it('should return null for unknown NPCs', () => {
        expect(NpcCityAI.getGreeting('npc_does_not_exist', 360)).toBeNull();
    });

    it('should give every scheduled NPC with daypart lines valid pools', () => {
        // No empty pools: a defined daypart must contain at least one line.
        for (const npc of Object.values(NPCS)) {
            if (!npc.daypartDialogue) continue;
            for (const [dp, pool] of Object.entries(npc.daypartDialogue)) {
                expect(pool!.length, `${npc.id} has empty ${dp} pool`).toBeGreaterThan(0);
            }
        }
    });

    it('should resolve a greeting for every NPC with daypart lines at every hour', () => {
        const withPools = Object.values(NPCS).filter((npc) => npc.daypartDialogue);
        expect(withPools.length).toBeGreaterThan(10);
        for (const npc of withPools) {
            for (let time = 0; time < 1440; time += 60) {
                const greeting = NpcCityAI.getGreeting(npc.id, time);
                expect(greeting, `${npc.id} has no greeting at ${time}`).not.toBeNull();
            }
        }
    });
});
