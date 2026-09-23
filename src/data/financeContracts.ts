import { FactionId, GameState } from '@/types';
import { canAccessContract } from '@/lib/AccessSystem';

export interface FinanceContractDef {
    id: string;
    title: string;
    description: string;
    faction: FactionId;
    sourceNpcId?: string;
    kind: 'economy' | 'work' | 'social' | 'travel';
    requiredReputation?: number;
    objective: { trigger: string; target?: string; amount?: number };
    reward: { cash: number; xp: number; reputation: number };
    risk: 'low' | 'medium' | 'high';
    cashStake?: number;
}

export const FINANCE_CONTRACTS: FinanceContractDef[] = [
    {
        id: 'casino_marker_run', title: 'Casino Marker Run', description: 'Cover a high-roller marker at the Bazaar before the pit boss notices it bounced.',
        faction: 'ghost', sourceNpcId: 'npc_croupier_ivy', kind: 'economy', requiredReputation: 8,
        objective: { trigger: 'casino_win', target: 'blackjack' }, reward: { cash: 220, xp: 55, reputation: 6 }, risk: 'high', cashStake: 100
    },
    {
        id: 'casino_heat_play', title: 'Heat Play', description: 'Turn a hot streak into cover for a quiet cash movement.',
        faction: 'demon', sourceNpcId: 'npc_croupier_ivy', kind: 'economy', requiredReputation: 8,
        objective: { trigger: 'casino_win', target: 'slots' }, reward: { cash: 180, xp: 45, reputation: 5 }, risk: 'medium', cashStake: 50
    },
    {
        id: 'market_courier_brief', title: 'Courier Brief', description: 'Deliver a sealed market brief before the opening bell.',
        faction: 'ghost', sourceNpcId: 'npc_ticker_tess', kind: 'travel',
        objective: { trigger: 'travel', target: 'corporate_towers' }, reward: { cash: 130, xp: 35, reputation: 5 }, risk: 'low'
    },
    {
        id: 'career_referral', title: 'Career Referral', description: 'Vouch for a friend at your workplace. Your name is on the line.',
        faction: 'angel', sourceNpcId: 'npc_ace', kind: 'social',
        objective: { trigger: 'work_shift', target: 'WORK_SHIFT' }, reward: { cash: 85, xp: 30, reputation: 4 }, risk: 'low'
    }
];

export const canAccessFinanceContract = (state: GameState, contract: FinanceContractDef): boolean => {
    if (contract.requiredReputation && contract.requiredReputation > 0) {
        const factionOk = (state.factionReputation[contract.faction] || 0) >= contract.requiredReputation
            || state.factionIdentity.primaryFaction === contract.faction;
        if (!factionOk) return false;
    }
    return canAccessContract(state, {
        id: contract.id,
        title: contract.title,
        description: contract.description,
        faction: contract.faction,
        sourceNpcId: contract.sourceNpcId,
        kind: contract.kind,
        objective: contract.objective,
        reward: contract.reward,
        expiresDay: state.world.day
    });
};
