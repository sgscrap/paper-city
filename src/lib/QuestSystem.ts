import { Quest, QuestChoice, QuestState } from '@/types/quests';
import { FactionId, GameState } from '@/types';

export const canChooseQuest = (state: GameState, choice: QuestChoice): boolean => {
    const requirements = choice.requirements;
    if (!requirements) return true;

    if (requirements.karmaAtLeast !== undefined && state.player.stats.karma < requirements.karmaAtLeast) return false;
    if (requirements.karmaAtMost !== undefined && state.player.stats.karma > requirements.karmaAtMost) return false;

    for (const [faction, minimum] of Object.entries(requirements.reputation || {})) {
        if ((state.factionReputation[faction as FactionId] || 0) < (minimum || 0)) return false;
    }

    for (const [npcId, minimum] of Object.entries(requirements.relationships || {})) {
        if ((state.npcs[npcId]?.relationship || 0) < (minimum || 0)) return false;
    }

    return true;
};

export const questIsComplete = (questState: QuestState): boolean =>
    Object.values(questState.objectives).every(Boolean);

export const choiceReward = (quest: Quest, choiceId: string) => {
    return quest.choices?.find((choice) => choice.id === choiceId)?.rewards;
};
