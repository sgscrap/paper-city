import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_STATE } from '../src/types';
import { useGameStore } from '../src/stores/gameStore';
import { useUIStore } from '../src/stores/uiStore';

const resetStores = () => {
    localStorage.clear();

    useUIStore.setState({
        uiMode: 'boot',
        bootOpacity: 1,
        liveOpacity: 0,
        activeTab: 'location',
        toasts: [],
        shake: false,
        activeDialogue: null
    });

    useGameStore.setState({
        ...INITIAL_STATE,
        combatState: null,
        outfit: 'street_clothes',
        remotePlayers: {},
        pricePollingId: null
    });
};

describe('GameStore save import', () => {
    beforeEach(resetStores);
    afterEach(resetStores);

    it('clears transient runtime fields when importing a save', () => {
        const importedSave = JSON.stringify({
            ...INITIAL_STATE,
            player: {
                ...INITIAL_STATE.player,
                stats: {
                    ...INITIAL_STATE.player.stats,
                    worth: 275
                }
            },
            combatState: { enemyId: 'street_thug' },
            remotePlayers: {
                rival: { id: 'rival', x: 1, y: 2, mapId: 'downtown' }
            },
            pricePollingId: 123
        });

        useGameStore.getState().importSave(importedSave);

        const state = useGameStore.getState();

        expect(state.player.stats.worth).toBe(275);
        expect(state.combatState).toBeNull();
        expect(state.remotePlayers).toEqual({});
        expect(state.pricePollingId).toBeNull();
    });
});
