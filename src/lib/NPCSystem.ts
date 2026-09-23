import { NPCS } from '@/data/npcs';
import { NpcCityAI } from '@/lib/NpcCityAI';
import { getFactionEndingDialogue } from '@/data/factionScenes';
import { InventoryState, NPCInteractionType, NPCSocialEffect, NPCState } from '@/types';

export type NPCInteraction = 'chat' | 'gift' | 'insult';

// Items the player can hand over when offering a favor, in spending priority order.
export const GIFT_ITEM_IDS = ['donut', 'cheap_coffee', 'lucky_charm'] as const;

export class NPCSystem {
    static getOrInitState(npcId: string, currentNpcState: Record<string, NPCState>): NPCState {
        const existing = currentNpcState[npcId] as Partial<NPCState> | undefined;
        return {
            relationship: existing?.relationship ?? 0,
            trust: existing?.trust ?? 0,
            fear: existing?.fear ?? 0,
            debt: existing?.debt ?? 0,
            loyalty: existing?.loyalty ?? 0,
            lastInteraction: existing?.lastInteraction ?? 0,
            lastDailyEffectDay: existing?.lastDailyEffectDay ?? 0,
            serviceUses: existing?.serviceUses ?? {},
            activeQuests: existing?.activeQuests ?? [],
            history: existing?.history ?? []
        };
    }

    static getDialogue(npcId: string, relationship = 0, fear = 0, playerFaction?: string, contentFlags: Record<string, boolean> = {}, worldTime?: number): string {
        const npc = NPCS[npcId];
        if (!npc) return '...';
        const endingDialogue = getFactionEndingDialogue(npcId, contentFlags);
        if (endingDialogue) return endingDialogue;
        if (npc.faction && playerFaction && npc.faction !== playerFaction) {
            if (contentFlags[`betrayed_${npc.faction}`]) return `${npc.name} keeps the door half-closed. "You already chose against us once. Give me a reason not to remember."`;
            return `${npc.name} studies your faction mark. "We do not usually share favors with ${playerFaction.toUpperCase()} people."`;
        }
        if (fear >= 25) return `${npc.name} watches you carefully. The room gets quiet when you arrive.`;
        if (relationship >= 30) return `${npc.name} lowers their voice. "I knew you would come back. I saved something for you."`;
        if (relationship <= -30) return `${npc.name} folds their arms. "We are not friends. Say what you came to say."`;
        // Neutral chatter is time-aware: daypart greetings replace the static pool.
        if (typeof worldTime === 'number') {
            const greeting = NpcCityAI.getGreeting(npcId, worldTime);
            if (greeting) return greeting;
        }
        const idx = Math.floor(Math.random() * npc.baseDialogue.length);
        return npc.baseDialogue[idx];
    }

    static getSocialEffect(npcId: string, type: NPCInteractionType, state: NPCState, currentDay: number): NPCSocialEffect | null {
        const npc = NPCS[npcId];
        if (!npc?.socialEffects || state.lastDailyEffectDay === currentDay) return null;
        return npc.socialEffects[type] || null;
    }

    /**
     * Picks the first owned gift item for the player to hand over when offering a favor.
     */
    static selectGiftItem(inventory: InventoryState): string | null {
        return GIFT_ITEM_IDS.find((itemId) => (inventory.items[itemId] || 0) > 0) || null;
    }

    static interact(type: NPCInteraction): { relChange: number; karmaChange: number; trustChange: number; fearChange: number; log: string } {
        switch (type) {
            case 'chat':
                return { relChange: 2, karmaChange: 0, trustChange: 2, fearChange: 0, log: 'Small talk. Trust increases slightly.' };
            case 'gift':
                return { relChange: 10, karmaChange: 1, trustChange: 5, fearChange: 0, log: 'They loved the gift. The favor is remembered.' };
            case 'insult':
                return { relChange: -15, karmaChange: -2, trustChange: -8, fearChange: 5, log: 'You insulted them. The debt is now personal.' };
            default:
                return { relChange: 0, karmaChange: 0, trustChange: 0, fearChange: 0, log: '' };
        }
    }
}
