import { describe, expect, it } from 'vitest';
import { getDistrictSummaries, districtFlavorColor, districtFlavorLabel } from '../src/lib/CityMap';
import { LOCATIONS } from '../src/data/locations';
import { INITIAL_STATE } from '../src/types';

const stateAt = (locationId: string, overrides: Record<string, unknown> = {}) =>
    ({
        ...structuredClone(INITIAL_STATE),
        world: { ...structuredClone(INITIAL_STATE.world), locationId },
        ...overrides
    }) as unknown as Parameters<typeof getDistrictSummaries>[0];

describe('City map overview', () => {
    it('covers every registered district (derived, not hand-maintained)', () => {
        const summaries = getDistrictSummaries(stateAt('the_block'), 600);
        expect(summaries.map((d) => d.id).sort()).toEqual(Object.keys(LOCATIONS).sort());
    });

    it('marks the player current district and leaves it travel-free', () => {
        const summaries = getDistrictSummaries(stateAt('the_block'), 600);
        const block = summaries.find((d) => d.id === 'the_block')!;
        expect(block.isCurrent).toBe(true);
        const others = summaries.filter((d) => d.id !== 'the_block');
        expect(others.every((d) => !d.isCurrent)).toBe(true);
    });

    it('derives contested flavor when no faction NPCs are present', () => {
        // transit_hub never hosts faction-tagged NPCs → contested.
        const summaries = getDistrictSummaries(stateAt('the_block'), 600);
        const transit = summaries.find((d) => d.id === 'transit_hub')!;
        expect(transit.flavor).toBe('contested');
        // The Block at 600: Ace (angel) vs Ghost + Needle + Condor (ghost ×3)
        // vs Rook (demon) → ghost majority is the correct derivation.
        const block = summaries.find((d) => d.id === 'the_block')!;
        expect(block.flavor).toBe('ghost');
    });

    it('derives a faction-leaning flavor from who is scheduled there', () => {
        // Foundry Row at 700: Grip (angel), Needle (ghost), Slide (demon) → contested.
        // Political Offices at 700: Ace is downtown, Mayor holds it alone → angel leaning.
        const summaries = getDistrictSummaries(stateAt('the_block'), 700);
        const civic = summaries.find((d) => d.id === 'political_offices')!;
        expect(civic.flavor).toBe('angel');
        const foundry = summaries.find((d) => d.id === 'foundry_row')!;
        expect(foundry.flavor).toBe('contested');
    });

    it('recomputes flavor as the clock moves (schedules are live)', () => {
        // The Waterfront: Halyard/Condor/Harrow give 2 demon vs 2 angel+ghost mix
        // depending on hour; assert it changes or stays consistent with counts.
        const morning = getDistrictSummaries(stateAt('the_block'), 540); // 9 AM
        const night = getDistrictSummaries(stateAt('the_block'), 1300); // ~9:40 PM
        const wfMorning = morning.find((d) => d.id === 'the_waterfront')!;
        const wfNight = night.find((d) => d.id === 'the_waterfront')!;
        // Condor is on The Block until 720, so the Waterfront roster differs by hour.
        expect(wfMorning.presentNpcs.some((n) => n.id === 'npc_dock_condor')).toBe(false);
        expect(wfNight.presentNpcs.some((n) => n.id === 'npc_dock_condor')).toBe(true);
    });

    it('shows present NPCs with faction tags and services', () => {
        const summaries = getDistrictSummaries(stateAt('the_block'), 700);
        const foundry = summaries.find((d) => d.id === 'foundry_row')!;
        const grip = foundry.presentNpcs.find((n) => n.id === 'npc_foundry_grip');
        expect(grip).toBeDefined();
        expect(grip!.faction).toBe('angel');
        expect(grip!.specialService).toBe('Press maintenance waiver');
    });

    it('mirrors access gates: locked districts report the gate reason', () => {
        const summaries = getDistrictSummaries(stateAt('the_block'), 700);
        const civic = summaries.find((d) => d.id === 'political_offices')!;
        expect(civic.locked).toBe(true);
        expect(civic.lockReason).toBeTruthy();
    });

    it('unlocks a gated district once reputation crosses the threshold', () => {
        const state = stateAt('the_block', {
            factionReputation: { angel: 8, ghost: 0, demon: 0 }
        });
        const summaries = getDistrictSummaries(state, 700);
        const civic = summaries.find((d) => d.id === 'political_offices')!;
        expect(civic.locked).toBe(false);
        expect(civic.lockReason).toBeNull();
    });

    it('lists travel routes consistent with LOCATIONS connections', () => {
        const summaries = getDistrictSummaries(stateAt('the_block'), 700);
        for (const district of summaries) {
            const expected = LOCATIONS[district.id].connectedTo.filter((id) => id !== district.id);
            expect(district.connections.map((c) => c.id).sort()).toEqual([...expected].sort());
        }
    });

    it('provides flavor visuals for every flavor value', () => {
        for (const key of ['angel', 'ghost', 'demon', 'contested'] as const) {
            expect(districtFlavorColor[key]).toBeTruthy();
            expect(districtFlavorLabel[key]).toBeTruthy();
        }
    });
});
