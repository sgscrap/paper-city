import { FactionId, GameState } from '@/types';

export type CombatEncounterKind = 'ladder' | 'rival' | 'faction';
export type ConflictResolution = 'social' | 'economic';

export interface CombatEncounter {
    id: string;
    title: string;
    description: string;
    enemyId: string;
    kind: CombatEncounterKind;
    faction?: FactionId;
    tier?: number;
    requiredReputation?: number;
    requiredCombatReputation?: number;
    requiredFlag?: string;
    nonCombat?: {
        method: ConflictResolution;
        stat: 'charisma' | 'intelligence';
        requirement: number;
        cashCost?: number;
        description: string;
    };
    rewards: {
        reputation: number;
        cash: number;
        xp: number;
        itemId?: string;
        factionReputation?: Partial<Record<FactionId, number>>;
        relationshipNpcId?: string;
        relationship?: number;
    };
}

export const COMBAT_ENCOUNTERS: CombatEncounter[] = [
    {
        id: 'ladder_1', title: 'Open-Mat Initiation', description: 'The first rung is a clean street fight. Win and the neighborhood learns your name.',
        enemyId: 'street_thug', kind: 'ladder', tier: 1, rewards: { reputation: 4, cash: 35, xp: 25 }
    },
    {
        id: 'ladder_2', title: 'Alley Main Event', description: 'A tougher opponent, a bigger crowd, and no easy exit.',
        enemyId: 'mugger', kind: 'ladder', tier: 2, requiredCombatReputation: 4, rewards: { reputation: 7, cash: 75, xp: 45, itemId: 'switchblade' }
    },
    {
        id: 'ladder_3', title: 'Corporate Blacksite', description: 'Security has been paid to make an example of you.',
        enemyId: 'corporate_security', kind: 'ladder', tier: 3, requiredCombatReputation: 11, rewards: { reputation: 12, cash: 180, xp: 90, itemId: 'glock' }
    },
    {
        id: 'ladder_4', title: 'The Red Circuit', description: 'The city only remembers the people who survive the final bracket.',
        enemyId: 'cyber_psycho', kind: 'ladder', tier: 4, requiredCombatReputation: 23, rewards: { reputation: 20, cash: 450, xp: 180, itemId: 'plasma_rifle' }
    },
    {
        id: 'rival_rook', title: 'Rook’s Test', description: 'The underworld wants proof that your reputation is more than paperwork.',
        enemyId: 'mugger', kind: 'rival', faction: 'demon', requiredReputation: 8, requiredCombatReputation: 6,
        nonCombat: { method: 'social', stat: 'charisma', requirement: 14, description: 'Talk Rook down by proving you can command a room without throwing a punch.' },
        rewards: { reputation: 9, cash: 120, xp: 55, factionReputation: { demon: 5 }, relationshipNpcId: 'npc_rook', relationship: 5 }
    },
    {
        id: 'rival_lena', title: 'Lena’s Extraction', description: 'A corporate rival has cornered a source. Get them out—or outsmart the perimeter.',
        enemyId: 'corporate_security', kind: 'rival', faction: 'ghost', requiredReputation: 8, requiredCombatReputation: 10,
        nonCombat: { method: 'economic', stat: 'intelligence', requirement: 15, cashCost: 100, description: 'Buy the access logs and turn the security grid against itself.' },
        rewards: { reputation: 11, cash: 210, xp: 75, factionReputation: { ghost: 5 }, relationshipNpcId: 'npc_lena', relationship: 6 }
    },
    {
        id: 'challenge_angel_watch', title: 'Coalition Protection Drill', description: 'Protect a resident through a controlled threat assessment.',
        enemyId: 'street_thug', kind: 'faction', faction: 'angel', tier: 1, requiredReputation: 8,
        nonCombat: { method: 'social', stat: 'charisma', requirement: 12, description: 'De-escalate the threat and earn public trust without violence.' },
        rewards: { reputation: 6, cash: 90, xp: 45, factionReputation: { angel: 5 }, relationshipNpcId: 'npc_ace', relationship: 4 }
    },
    {
        id: 'challenge_ghost_signal', title: 'Ghost Signal Run', description: 'A rival courier is guarding an information route through Corporate Towers.',
        enemyId: 'corporate_security', kind: 'faction', faction: 'ghost', tier: 2, requiredReputation: 8,
        nonCombat: { method: 'economic', stat: 'intelligence', requirement: 14, cashCost: 75, description: 'Purchase a clean route and complete the extraction without a fight.' },
        rewards: { reputation: 8, cash: 140, xp: 65, factionReputation: { ghost: 5 }, relationshipNpcId: 'npc_ghost', relationship: 4 }
    },
    {
        id: 'challenge_demon_pit', title: 'Underworld Pit', description: 'The back room wants a spectacle before it grants you a seat.',
        enemyId: 'cyber_psycho', kind: 'faction', faction: 'demon', tier: 3, requiredReputation: 8,
        rewards: { reputation: 14, cash: 260, xp: 110, factionReputation: { demon: 6 }, relationshipNpcId: 'npc_rook', relationship: 6 }
    }
];

export const getCombatEncounter = (id: string): CombatEncounter | undefined => COMBAT_ENCOUNTERS.find((encounter) => encounter.id === id);

export const isCombatEncounterAvailable = (state: GameState, encounter: CombatEncounter): boolean => {
    if (encounter.requiredFlag && !state.contentFlags[encounter.requiredFlag]) return false;
    if (encounter.requiredReputation && encounter.faction && state.factionReputation[encounter.faction] < encounter.requiredReputation) return false;
    if (encounter.requiredCombatReputation && state.combatRecord.reputation < encounter.requiredCombatReputation) return false;
    if (encounter.kind === 'ladder' && state.combatRecord.ladderTier !== encounter.tier) return false;
    if (state.combatRecord.completedEncounterIds.includes(encounter.id)) return false;
    return true;
};

export const getNextLadderEncounter = (state: GameState): CombatEncounter | undefined =>
    COMBAT_ENCOUNTERS.find((encounter) => encounter.kind === 'ladder' && encounter.tier === state.combatRecord.ladderTier && isCombatEncounterAvailable(state, encounter));
