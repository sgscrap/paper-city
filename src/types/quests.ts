import type { FactionId } from './index';

export type QuestTrigger = 'buy_item' | 'stat_change' | 'interact_npc' | 'action_complete' | 'travel' | 'combat_result' | 'contract_complete';

export interface QuestObjective {
    id: string;
    description: string;
    completed: boolean;
    targetAmount?: number;
    currentAmount?: number;
    trigger?: QuestTrigger;
    target?: string;
}

export interface QuestChoice {
    id: string;
    label: string;
    description: string;
    faction?: FactionId;
    requirements?: {
        karmaAtLeast?: number;
        karmaAtMost?: number;
        reputation?: Partial<Record<FactionId, number>>;
        relationships?: Record<string, number>;
    };
    branchGroup?: string;
    excludesFlags?: string[];
    rewards?: {
        cash?: number;
        xp?: number;
        reputation?: Partial<Record<FactionId, number>>;
        relationships?: Record<string, number>;
        flags?: string[];
    };
    nextQuest?: string;
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    objectives: QuestObjective[];
    rewards: {
        cash?: number;
        xp?: number;
        items?: string[];
        stats?: Record<string, number>;
        reputation?: Partial<Record<FactionId, number>>;
        flags?: string[];
    };
    status: 'locked' | 'active' | 'completed';
    nextQuest?: string;
    faction?: FactionId;
    arcId?: FactionId;
    arcStage?: number;
    arcConclusion?: string;
    alternateObjectives?: QuestObjective[];
    choices?: QuestChoice[];
}

export interface QuestState {
    id: string;
    status: 'active' | 'completed';
    objectives: Record<string, boolean>;
    choiceId?: string;
    rewardClaimed?: boolean;
}
