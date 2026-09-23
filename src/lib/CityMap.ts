import { FactionId, GameState } from '@/types';
import { LOCATIONS } from '@/data/locations';
import { NPCS } from '@/data/npcs';
import { getNpcVenue } from '@/lib/NpcCityAI';
import { accessReason, locationAccessId, canAccess } from '@/lib/AccessSystem';


/**
 * City map overview data — derived, never hand-maintained.
 *
 * Every field is computed from the registries the asset procedure already
 * governs (LOCATIONS, NPCS, schedules, ACCESS_RULES), so a new district or
 * resident shows up on the map automatically. If this module and the data
 * drift apart, the build is wrong — not the data.
 */

export type DistrictFlavor = 'contested' | FactionId;

export interface DistrictSummary {
    id: string;
    name: string;
    description: string;
    /** Faction leaning derived from who works here (scheduled, live). */
    flavor: DistrictFlavor;
    /** Current residents as { npc, faction } pairs, sorted by name. */
    presentNpcs: Array<{ id: string; name: string; faction?: FactionId; specialService?: string }>;
    /** Travel connections with per-edge lock state for the player. */
    connections: Array<{ id: string; name: string; locked: boolean }>;
    /** True when the player is standing here right now. */
    isCurrent: boolean;
    /** True when the player cannot travel here (gate or unlisted destination). */
    locked: boolean;
    /** Human gate explanation when locked. */
    lockReason: string | null;
}

/** Majority faction across a set of counts; 'contested' on ties or empties. */
const flavorFromCounts = (counts: Record<FactionId, number>): DistrictFlavor => {
    const entries = (Object.entries(counts) as Array<[FactionId, number]>).filter(([, n]) => n > 0);
    if (entries.length === 0) return 'contested';
    entries.sort((a, b) => b[1] - a[1]);
    return entries.length > 1 && entries[0][1] === entries[1][1] ? 'contested' : entries[0][0];
};

export const getDistrictSummaries = (state: GameState, worldTime: number): DistrictSummary[] =>
    Object.values(LOCATIONS).map((location) => {
        const presentNpcs = Object.values(NPCS)
            .filter((npc) => getNpcVenue(npc.id, worldTime) === location.id)
            .map((npc) => ({ id: npc.id, name: npc.name, faction: npc.faction, specialService: npc.specialService }))
            .sort((a, b) => a.name.localeCompare(b.name));

        const counts: Record<FactionId, number> = { angel: 0, ghost: 0, demon: 0 };
        for (const npc of presentNpcs) {
            if (npc.faction) counts[npc.faction] += 1;
        }
        const flavor = flavorFromCounts(counts);

        const accessId = locationAccessId(location.id);
        const isCurrent = state.world.locationId === location.id;
        // Lock state mirrors the store's real rule: setLocation checks access
        // gates only (adjacency is a LocationView UI concern; some districts
        // are also reachable via map exits without being in connectedTo).
        const locked = Boolean(accessId && !canAccess(state, accessId));
        const lockReason = locked && accessId ? accessReason(state, accessId) : null;

        return {
            id: location.id,
            name: location.name,
            description: location.description,
            flavor,
            presentNpcs,
            connections: location.connectedTo
                .filter((id) => id !== location.id)
                .map((id) => ({
                    id,
                    name: LOCATIONS[id]?.name ?? id,
                    locked: Boolean((() => {
                        const targetAccess = locationAccessId(id);
                        return targetAccess ? !canAccess(state, targetAccess) : false;
                    })())
                })),
            isCurrent,
            locked,
            lockReason
        };
    });


export const districtFlavorColor: Record<DistrictFlavor, string> = {
    angel: '#4ade80',
    ghost: '#a78bfa',
    demon: '#f87171',
    contested: '#e4e4e7'
};

export const districtFlavorLabel: Record<DistrictFlavor, string> = {
    angel: 'ANGEL LEANING',
    ghost: 'GHOST LEANING',
    demon: 'DEMON LEANING',
    contested: 'CONTESTED / NEUTRAL'
};
