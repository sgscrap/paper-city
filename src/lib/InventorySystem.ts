import { InventoryState } from '@/types';
import { ITEMS } from '@/data/items';

export class InventorySystem {

    /**
     * Adds an item to the inventory.
     */
    static addItem(inventory: InventoryState, itemId: string, amount: number = 1): InventoryState {
        const newInventory = { ...inventory, items: { ...inventory.items } };

        if (!newInventory.items[itemId]) {
            newInventory.items[itemId] = 0;
        }
        newInventory.items[itemId] += amount;

        return newInventory;
    }

    /**
     * Removes an item from the inventory. Returns updated state and success boolean.
     */
    static removeItem(inventory: InventoryState, itemId: string, amount: number = 1): { newState: InventoryState, success: boolean } {
        if (!inventory.items[itemId] || inventory.items[itemId] < amount) {
            return { newState: inventory, success: false };
        }

        const newInventory = { ...inventory, items: { ...inventory.items } };
        newInventory.items[itemId] -= amount;

        if (newInventory.items[itemId] <= 0) {
            delete newInventory.items[itemId];
        }

        return { newState: newInventory, success: true };
    }

    /**
     * Checks if player owns an item.
     */
    static hasItem(inventory: InventoryState, itemId: string, amount: number = 1): boolean {
        return (inventory.items[itemId] || 0) >= amount;
    }

    /**
     * Consumes an item, applying its effects.
     * Returns the effects to handle in the store.
     */
    static consumeItem(itemId: string): { success: boolean, effects?: { stat: string, value: number }[], log: string } {
        const item = ITEMS[itemId];
        if (!item) return { success: false, log: 'Unknown item.' };

        if (item.type !== 'consumable') {
            return { success: false, log: 'You cannot use that.' };
        }

        return {
            success: true,
            effects: item.effects,
            log: `Used ${item.name}.`
        };
    }

    /**
     * Returns a list of item IDs that are weapons and currently owned.
     */
    static getOwnedWeapons(inventory: InventoryState): string[] {
        return Object.keys(inventory.items).filter(id => {
            const item = ITEMS[id];
            return item && item.type === 'weapon';
        });
    }
}
