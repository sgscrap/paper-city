import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../src/types';
import { useGameStore } from '../src/stores/gameStore';
import { useUIStore } from '../src/stores/uiStore';
import { STREET_ENCOUNTERS, pickStreetEncounter } from '../src/data/streetEncounters';
import { NPCS } from '../src/data/npcs';

const resetStores = () => {
    localStorage.clear();

    useUIStore.setState({
        uiMode: 'live',
        bootOpacity: 0,
        liveOpacity: 1,
        activeTab: 'location',
        toasts: [],
        shake: false,
        activeDialogue: null
    });

    useGameStore.setState({
        ...structuredClone(INITIAL_STATE),
        combatState: null,
        outfit: 'street_clothes',
        remotePlayers: {},
        pricePollingId: null,
        // Pin random events off by default (7% advanceTime roll pollutes
        // assertions); event-engine tests re-enable rolls explicitly.
        randomEvents: { ...structuredClone(INITIAL_STATE.randomEvents), triggeredToday: 99 }
    });
};

describe('Street encounter data', () => {
    it('should include both offers and warnings', () => {
        expect(STREET_ENCOUNTERS.some((e) => e.kind === 'offer')).toBe(true);
        expect(STREET_ENCOUNTERS.some((e) => e.kind === 'warning')).toBe(true);
    });

    it('should reference known NPCs with at least one line each', () => {
        for (const encounter of STREET_ENCOUNTERS) {
            expect(NPCS[encounter.npcId], `${encounter.id} references unknown NPC`).toBeDefined();
            expect(encounter.lines.length, `${encounter.id} has no lines`).toBeGreaterThan(0);
            expect(encounter.weight).toBeGreaterThan(0);
        }
    });

    it('should never define warnings without dismiss handlers', () => {
        for (const encounter of STREET_ENCOUNTERS) {
            if (encounter.kind === 'warning') {
                expect(encounter.dismiss, `${encounter.id} warning lacks dismissal`).toBeDefined();
            }
        }
    });
});

describe('pickStreetEncounter', () => {
    beforeEach(resetStores);
    afterEach(resetStores);

    it('returns null when the NPC is scheduled elsewhere', () => {
        const state = useGameStore.getState();
        // Default time is morning: Ticker Tess is on the trading floor, not the block.
        expect(pickStreetEncounter(state, 'npc_ticker_tess')).toBeNull();
    });

    it('returns Tommy\'s block encounter during the day on The Block', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'the_block', time: 600 }
        });
        const state = useGameStore.getState();
        const picked = pickStreetEncounter(state, 'npc_tommy');
        expect(picked).not.toBeNull();
        expect(picked!.encounter.npcId).toBe('npc_tommy');
        expect(picked!.encounter.venues).toContain('the_block');
    });

    it('blocks a second approach from the same NPC on the same day', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'the_block', time: 600 }
        });
        useGameStore.setState({
            streetEncounters: {
                ...useGameStore.getState().streetEncounters,
                lastEncounterDay: useGameStore.getState().world.day,
                encounteredIds: { npc_tommy: 1 }
            }
        });
        const state = useGameStore.getState();
        expect(pickStreetEncounter(state, 'npc_tommy')).toBeNull();
    });

    it('enforces the one-approach-per-hour city guard', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'the_block', time: 600 }
        });
        const day = useGameStore.getState().world.day;
        useGameStore.setState({
            streetEncounters: {
                ...useGameStore.getState().streetEncounters,
                lastEncounterDay: day,
                lastEncounterAt: day * 1440 + 570 // 30 minutes ago
            }
        });
        const state = useGameStore.getState();
        expect(pickStreetEncounter(state, 'npc_tommy')).toBeNull();
    });

    it('respects time-restricted encounters', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'casino', time: 480 } // 8 AM
        });
        const state = useGameStore.getState();
        // Tess's table tell only runs in the evening window.
        expect(pickStreetEncounter(state, 'npc_ticker_tess')).toBeNull();
    });

    it('respects cash requirements', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'casino', time: 1200 },
            player: { ...useGameStore.getState().player, stats: { ...useGameStore.getState().player.stats, worth: 5 } }
        });
        const state = useGameStore.getState();
        expect(pickStreetEncounter(state, 'npc_ticker_tess')).toBeNull();
    });
});

describe('Street encounter resolution', () => {
    beforeEach(resetStores);
    afterEach(resetStores);

    it('applies offer rewards and logs the resolution', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'the_block', time: 600 },
            streetEncounters: {
                ...useGameStore.getState().streetEncounters,
                active: { npcId: 'npc_tommy', encounterId: 'TOMMY_SIDE_HUSTLE', line: 'Psst, buddy!' }
            }
        });

        const before = useGameStore.getState().player.stats.worth;
        useGameStore.getState().resolveStreetEncounter('accept');

        const after = useGameStore.getState();
        expect(after.player.stats.worth).toBe(before + 40);
        expect(after.streetEncounters.active).toBeNull();
        expect(after.streetEncounters.resolved['TOMMY_SIDE_HUSTLE']).toBe(1);
        expect(after.streetEncounters.encounteredIds['npc_tommy']).toBe(1);
        expect(after.npcs['npc_tommy'].history.some((h) => h.startsWith('street:TOMMY_SIDE_HUSTLE:yes'))).toBe(true);
    });

    it('applies warning dismissal penalties', () => {
        useGameStore.setState({
            world: { ...useGameStore.getState().world, locationId: 'underground_markets', time: 1200 },
            streetEncounters: {
                ...useGameStore.getState().streetEncounters,
                active: { npcId: 'npc_tommy', encounterId: 'TOMMY_PICKPOCKET_ALERT', line: 'Watch your coat.' }
            }
        });

        const before = useGameStore.getState().player.stats.worth;
        useGameStore.getState().resolveStreetEncounter('dismiss');

        const after = useGameStore.getState();
        expect(after.player.stats.worth).toBe(Math.max(0, before - 30));
        expect(after.npcs['npc_tommy'].history.some((h) => h.startsWith('street:TOMMY_PICKPOCKET_ALERT:no'))).toBe(true);
    });

    it('does nothing without an active encounter', () => {
        const before = useGameStore.getState().player.stats.worth;
        useGameStore.getState().resolveStreetEncounter('accept');
        expect(useGameStore.getState().player.stats.worth).toBe(before);
    });
});
