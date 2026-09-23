import { ActionDefinition, ACTIONS } from '@/data/actions';
import { Stats } from '@/types';

export interface ActionResult {
    success: boolean;
    log: string;
    rewards?: {
        money?: number;
        xp?: number;
        stats?: Partial<Stats>;
        energy?: number;
        karma?: number;
    };
    cost?: {
        time?: number;
        will?: number;
        money?: number;
    };
}

export class ActionResolver {

    /**
     * Resolves a standard stat check action.
     * Formula: (PlayerStat) - (Difficulty) >= 0 OR Probability check.
     */
    static resolveCheck(playerStat: number, difficulty: number): boolean {
        // Base check
        if (playerStat >= difficulty) return true;
        return false;
    }

    /**
     * Resolves an action by its ID from the catalog.
     */
    static resolveId(
        actionId: string,
        playerStats: Stats,
        traits: string[] = [],
        currentEnergy: number,
        currentCash: number
    ): ActionResult {
        const action = ACTIONS[actionId];
        if (!action) {
            return {
                success: false,
                log: `Action "${actionId}" not found in catalog.`
            };
        }

        return this.processAction(action, playerStats, traits, currentEnergy, currentCash);
    }

    /**
     * Processes a fully defined action object.
     */
    private static processAction(
        action: ActionDefinition,
        playerStats: Stats,
        traits: string[],
        currentEnergy: number,
        currentCash: number
    ): ActionResult {

        // 1. Check Requirements
        if (action.reqs?.stats) {
            for (const [stat, reqVal] of Object.entries(action.reqs.stats)) {
                const statKey = stat as keyof Stats;
                // Trait modifiers could go here (e.g. "Natural" reduces reqs)
                if (playerStats[statKey] < (reqVal || 0)) {
                    return {
                        success: false,
                        log: `Requires ${reqVal} ${stat.charAt(0).toUpperCase() + stat.slice(1)}.`
                    };
                }
            }
        }

        // 2. Check Costs
        if (action.cost.money && currentCash < action.cost.money) {
            return { success: false, log: `Not enough cash. Need $${action.cost.money}.` };
        }
        if (action.cost.will && currentEnergy < action.cost.will) {
            return { success: false, log: `Too tired. Need ${action.cost.will} Energy.` };
        }

        // 3. Calculate Rewards (Traits can boost here)
        const finalRewards = { ...action.rewards };

        // Example Trait Bonus
        if (action.id.includes('TRAIN') && traits.includes('Fast Learner')) {
            if (finalRewards.xp) {
                finalRewards.xp = Math.floor(finalRewards.xp * 1.2);
            }
        }

        // 4. Success
        return {
            success: true,
            log: action.description || `Completed ${action.label}.`,
            rewards: finalRewards,
            cost: action.cost
        };
    }
}
