import { GameState, INITIAL_STATE } from '@/types';

const SAVE_KEY = 'coalition_paper_city_v1';
const DEBOUNCE_MS = 1000;

class SaveManager {
    private saveTimeout: NodeJS.Timeout | null = null;

    /**
     * Saves the game state to LocalStorage with debouncing.
     */
    save(state: GameState): void {
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        this.saveTimeout = setTimeout(() => {
            try {
                const serialized = JSON.stringify(state);
                localStorage.setItem(SAVE_KEY, serialized);
                // metrics/logging could go here
            } catch (err) {
                console.error('SaveManager: Failed to save game.', err);
            }
        }, DEBOUNCE_MS);
    }

    /**
     * Forces an immediate save (bypassing debounce).
     * Useful for important events or closing the app.
     */
    forceSave(state: GameState): boolean {
        try {
            if (this.saveTimeout) clearTimeout(this.saveTimeout);
            const serialized = JSON.stringify(state);
            localStorage.setItem(SAVE_KEY, serialized);
            return true;
        } catch (err) {
            console.error('SaveManager: Failed to force save.', err);
            return false;
        }
    }

    /**
     * Loads the game state from LocalStorage.
     * Returns null if no save exists or load fails.
     */
    load(): GameState | null {
        try {
            const serialized = localStorage.getItem(SAVE_KEY);
            if (!serialized) return null;

            const state = JSON.parse(serialized) as GameState;

            // version check or migration could happen here if not handled by store
            if (state.version !== INITIAL_STATE.version) {
                console.warn(`Save version mismatch: ${state.version} vs ${INITIAL_STATE.version}`);
                // In a real scenario, we might return null or attempt migration here
                // For now, we return it and let the Store's migrate logic handle it if used there
            }

            return state;
        } catch (err) {
            console.error('SaveManager: Failed to load save.', err);
            return null;
        }
    }

    /**
     * Resets the save data.
     */
    reset(): void {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (err) {
            console.error('SaveManager: Failed to reset save.', err);
        }
    }

    /**
     * Exports the current save as a JSON string.
     */
    exportJSON(): string | null {
        try {
            const serialized = localStorage.getItem(SAVE_KEY);
            if (!serialized) return null;
            // distinct formatting for export?
            return serialized; // Raw JSON
        } catch (err) {
            console.error('SaveManager: Failed to export save.', err);
            return null;
        }
    }

    /**
     * Imports a JSON string and overwrites the current save.
     * Returns true if successful.
     */
    importJSON(json: string): boolean {
        try {
            // Validate basic structure
            const parsed = JSON.parse(json);
            if (!parsed || typeof parsed !== 'object' || !parsed.version) {
                throw new Error('Invalid save file format');
            }

            // Write to storage
            localStorage.setItem(SAVE_KEY, json);
            return true;
        } catch (err) {
            console.error('SaveManager: Failed to import save.', err);
            return false;
        }
    }

    /**
     * Simple check if a save exists
     */
    hasSave(): boolean {
        return !!localStorage.getItem(SAVE_KEY);
    }
}

export const saveManager = new SaveManager();
