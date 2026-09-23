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
        ...structuredClone(INITIAL_STATE),
        combatState: null,
        outfit: 'street_clothes',
        remotePlayers: {},
        pricePollingId: null,
        // Pin random events off by default (7% advanceTime roll pollutes cash
        // assertions); event-engine tests re-enable rolls explicitly.
        randomEvents: { ...structuredClone(INITIAL_STATE.randomEvents), triggeredToday: 99 }
    });
};

describe('GameStore quest progression', () => {
    beforeEach(resetStores);
    afterEach(resetStores);

    it('walks through and can replay the persistent world tutorial', () => {
        expect(useGameStore.getState().tutorial).toEqual({ step: 0, completed: false, skipped: false });

        useGameStore.getState().advanceTutorial();
        expect(useGameStore.getState().tutorial.step).toBe(1);

        useGameStore.getState().skipTutorial();
        expect(useGameStore.getState().tutorial.completed).toBe(true);
        expect(useGameStore.getState().tutorial.skipped).toBe(true);

        useGameStore.getState().replayTutorial();
        expect(useGameStore.getState().tutorial).toEqual({ step: 0, completed: false, skipped: false });

        for (let step = 0; step < 6; step += 1) useGameStore.getState().advanceTutorial();
        expect(useGameStore.getState().tutorial.completed).toBe(true);
        expect(useGameStore.getState().tutorial.step).toBe(5);
    });

    it('pays quest rewards and chains to the next quest on completion', () => {
        const store = useGameStore.getState();

        store.startQuest('get_moving');
        store.completeQuest('get_moving');

        const state = useGameStore.getState();

        expect(state.quests['get_moving']?.status).toBe('completed');
        expect(state.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth + 50);
        expect(state.player.xp).toBe(10);
        expect(state.quests['first_bag']?.status).toBe('active');
    });

    it('lets the work action complete the intro path and unlock the next quest', () => {
        const store = useGameStore.getState();

        store.startQuest('get_moving');
        store.dispatchAction('WORK_SHIFT');

        const state = useGameStore.getState();

        expect(state.quests['get_moving']?.status).toBe('completed');
        expect(state.quests['first_bag']?.status).toBe('active');
        expect(state.player.stats.worth).toBe(150);
        expect(state.player.xp).toBe(30);
    });
});
