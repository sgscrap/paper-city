import { NPCS } from '@/data/npcs';
import { NPCDaypart } from '@/types';
import { NPC_SCHEDULES } from '@/data/npcSchedules';
import { MAP_DEFINITIONS } from '@/data/maps';

/** Player-facing names for NPC venues, used by schedule-aware UI everywhere. */
export const VENUE_NAMES: Record<string, string> = {
    the_block: 'The Block',
    foundry_row: 'Foundry Row',
    the_waterfront: 'The Waterfront',
    dt_bmore: 'Downtown Baltimore',
    corporate_towers: 'Corporate Towers',
    underground_markets: 'Underground Markets',
    political_offices: 'Civic Center',
    transit_hub: 'Transit Hub',
    towson_mall: 'Towson Town Center',
    gym: 'SG Fitness',
    university: 'Morgan University',
    job_board: 'Job Board',
    trading_floor: 'Trading Floor',
    safehouse: 'Safehouse',
    casino: 'Horseshoe Baltimore',
    club: 'Club Lust'
};

export const getVenueName = (venue: string): string => VENUE_NAMES[venue] ?? venue;

export interface NpcWorldPosition {
    id: string;
    name: string;
    faction?: string;
    x: number;
    y: number;
    /** Wander target; the NPC drifts toward this while idle. */
    targetX: number;
    targetY: number;
    speed: number;
    direction: 0 | 1 | 2 | 3;
    moving: boolean;
    venue: string;
    /** True while the NPC walks between its scheduled venues. */
    inTransit: boolean;
}

const NPC_SIZE = 20;
const EDGE_MARGIN = 24;

export const getNpcVenue = (npcId: string, hourAngle: number): string =>
    NpcCityAI.getVenue(npcId, hourAngle);

/**
 * Map the world clock (minutes since midnight; the day clock caps at 1560,
 * then wraps) onto four narrative dayparts.
 */
export const getDaypart = (worldTime: number): NPCDaypart => {
    const t = ((worldTime % 1440) + 1440) % 1440;
    if (t < 300) return 'night';      // 00:00–04:59
    if (t < 720) return 'morning';    // 05:00–11:59
    if (t < 1020) return 'afternoon'; // 12:00–16:59
    if (t < 1260) return 'evening';   // 17:00–20:59
    return 'night';                   // 21:00–23:59
};

export const NpcCityAI = {
    /**
     * Which map should this NPC currently be rendered on?
     * Falls back to the static location from npcs.ts.
     */
    getVenue(npcId: string, worldTime: number): string {
        const npc = NPCS[npcId];
        const schedule = NPC_SCHEDULES[npcId];
        if (!npc) return 'the_block';
        if (!schedule || schedule.length === 0) return npc.location;

        for (const block of schedule) {
            if (worldTime >= block.from && worldTime < block.to) return block.location;
        }
        return npc.location;
    },

    /** Get every NPC that should be present on the given map right now. */
    getPresence(npcIds: string[], mapId: string, worldTime: number): string[] {
        return npcIds.filter((id) => NpcCityAI.getVenue(id, worldTime) === mapId);
    },

    /**
     * Full roster of NPCs whose services travel with them, tagged with their
     * current scheduled venue. Services are faction-gated, not venue-gated:
     * Ticker Tess offers broker rates from the casino at night exactly the
     * same as from the trading floor by day.
     */
    getServiceRoster(worldTime: number): Array<{
        npcId: string;
        name: string;
        service?: string;
        specialService?: string;
        venue: string;
        venueName: string;
    }> {
        return Object.values(NPCS)
            .filter((npc) => npc.service || npc.specialService)
            .map((npc) => {
                const venue = NpcCityAI.getVenue(npc.id, worldTime);
                return {
                    npcId: npc.id,
                    name: npc.name,
                    service: npc.service,
                    specialService: npc.specialService,
                    venue,
                    venueName: getVenueName(venue)
                };
            });
    },

    /**
     * Advance one AI tick for every NPC on this map. Movement is deterministic
     * per NPC (seeded from its id) so the same world state always produces the
     * same paths — important for tests and for save/load consistency.
     */
    update(
        positions: Record<string, NpcWorldPosition>,
        mapId: string,
        dt: number
    ): Record<string, NpcWorldPosition> {
        const map = MAP_DEFINITIONS[mapId];
        if (!map) return positions;

        const buildings = map.buildings;
        const next: Record<string, NpcWorldPosition> = { ...positions };

        for (const [id, npc] of Object.entries(positions)) {
            // Arrival check
            const dx = npc.targetX - npc.x;
            const dy = npc.targetY - npc.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 4) {
                // Reached target: idle, pick a new wander goal on a seeded delay
                const seed = (this.hashCode(id + Math.floor(npc.x) + Math.floor(npc.y)) % 1000) / 1000;
                if (seed < dt * 0.4) {
                    const spot = this.findWanderSpot(mapId, buildings, id);
                    next[id] = { ...npc, targetX: spot.x, targetY: spot.y, moving: true };
                } else {
                    next[id] = { ...npc, moving: false };
                }
                continue;
            }

            // Walk toward target with building collision
            const speed = npc.speed * dt;
            const stepX = (dx / dist) * speed;
            const stepY = (dy / dist) * speed;
            const nx = npc.x + stepX;
            const ny = npc.y + stepY;

            let blocked = false;
            for (const b of buildings) {
                if (b.type === 'exit') continue;
                if (
                    nx < b.x + b.w && nx + NPC_SIZE > b.x &&
                    ny < b.y + b.h && ny + NPC_SIZE > b.y
                ) {
                    blocked = true;
                    break;
                }
            }

            if (blocked) {
                // Slide along the obstacle: try axis-separated movement
                const slidX = npc.x + stepX;
                let blockedX = false;
                for (const b of buildings) {
                    if (b.type === 'exit') continue;
                    if (slidX < b.x + b.w && slidX + NPC_SIZE > b.x && npc.y < b.y + b.h && npc.y + NPC_SIZE > b.y) {
                        blockedX = true;
                        break;
                    }
                }
                if (!blockedX) {
                    next[id] = { ...npc, x: slidX, direction: stepX >= 0 ? 3 : 2, moving: true };
                } else {
                    // Give up and pick a fresh goal
                    const spot = this.findWanderSpot(mapId, buildings, id);
                    next[id] = { ...npc, targetX: spot.x, targetY: spot.y, moving: true };
                }
            } else {
                next[id] = {
                    ...npc,
                    x: nx,
                    y: ny,
                    direction: Math.abs(stepX) > Math.abs(stepY) ? (stepX >= 0 ? 3 : 2) : (stepY >= 0 ? 0 : 1),
                    moving: true
                };
            }
        }

        return next;
    },

    /**
     * Produce the initial world position for an NPC that just appeared on
     * this map. Deterministic spawn near a seeded open spot.
     */
    spawnFor(npcId: string, mapId: string): NpcWorldPosition {
        const npc = NPCS[npcId];
        const map = MAP_DEFINITIONS[mapId];
        const spot = this.findWanderSpot(mapId, map?.buildings ?? [], npcId);

        return {
            id: npcId,
            name: npc?.name ?? npcId,
            faction: npc?.faction,
            x: spot.x,
            y: spot.y,
            targetX: spot.x,
            targetY: spot.y,
            speed: 22 + (this.hashCode(npcId) % 18), // 22–39 px/s: slower than the player
            direction: 0,
            moving: false,
            venue: mapId,
            inTransit: false
        };
    },

    /** Find a seeded, collision-free open spot to wander toward. */
    findWanderSpot(
        mapId: string,
        buildings: { x: number; y: number; w: number; h: number; type: string }[],
        npcId: string
    ): { x: number; y: number } {
        const map = MAP_DEFINITIONS[mapId];
        const width = map?.width ?? 800;
        const height = map?.height ?? 600;

        for (let attempt = 0; attempt < 24; attempt++) {
            const seedSource = `${npcId}:${attempt}`;
            const h1 = (this.hashCode(seedSource) % 1000) / 1000;
            const h2 = (this.hashCode(seedSource + 'y') % 1000) / 1000;
            const x = EDGE_MARGIN + h1 * (width - EDGE_MARGIN * 2 - NPC_SIZE);
            const y = EDGE_MARGIN + h2 * (height - EDGE_MARGIN * 2 - NPC_SIZE);

            const collides = buildings.some(
                (b) => b.type !== 'exit' && x < b.x + b.w && x + NPC_SIZE > b.x && y < b.y + b.h && y + NPC_SIZE > b.y
            );
            if (!collides) return { x, y };
        }
        // Fallback: map spawn area
        return { x: (map?.spawn?.x ?? 400) + NPC_SIZE, y: (map?.spawn?.y ?? 300) + NPC_SIZE };
    },

    /**
     * Resolve a time-of-day greeting: pick deterministically from the NPC's
     * pool for the current daypart, falling back to other dayparts when a
     * pool is missing or empty. Returns null when the NPC has no daypart lines.
     */
    getGreeting(npcId: string, worldTime: number): string | null {
        const npc = NPCS[npcId];
        if (!npc?.daypartDialogue) return null;
        const pools = npc.daypartDialogue;

        const daypart = getDaypart(worldTime);
        const order: NPCDaypart[] =
            daypart === 'night'
                ? ['night', 'evening', 'afternoon', 'morning']
                : daypart === 'evening'
                    ? ['evening', 'night', 'afternoon', 'morning']
                    : daypart === 'afternoon'
                        ? ['afternoon', 'evening', 'morning', 'night']
                        : ['morning', 'afternoon', 'evening', 'night'];

        for (const dp of order) {
            const pool = pools[dp];
            if (pool && pool.length > 0) {
                const seed = this.hashCode(`${npcId}:${dp}:${Math.floor(worldTime / 30)}`);
                return pool[seed % pool.length];
            }
        }
        return null;
    },

    hashCode(str: string): number {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    }
};
