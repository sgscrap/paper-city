import { FactionId } from '@/types';

export interface FactionContentMatrixEntry {
    faction: FactionId;
    primaryQuests: number;
    decisionPoints: number;
    factionContracts: number;
    alternateRewards: number;
    reactiveNpcIds: string[];
    endings: string[];
    crossFactionContractCount: number;
}

export const FACTION_CONTENT_MATRIX: Record<FactionId, FactionContentMatrixEntry> = {
    angel: {
        faction: 'angel', primaryQuests: 3, decisionPoints: 2, factionContracts: 4, alternateRewards: 2,
        reactiveNpcIds: ['npc_ace', 'npc_mayor', 'npc_ghost'],
        endings: ['angel_ending_steward', 'angel_ending_authority'], crossFactionContractCount: 1
    },
    ghost: {
        faction: 'ghost', primaryQuests: 3, decisionPoints: 2, factionContracts: 4, alternateRewards: 2,
        reactiveNpcIds: ['npc_ghost', 'npc_lena', 'npc_ace'],
        endings: ['ghost_ending_channel', 'ghost_ending_broker'], crossFactionContractCount: 1
    },
    demon: {
        faction: 'demon', primaryQuests: 3, decisionPoints: 2, factionContracts: 4, alternateRewards: 2,
        reactiveNpcIds: ['npc_rook', 'npc_mara', 'npc_ace'],
        endings: ['demon_ending_enforcer', 'demon_ending_monster'], crossFactionContractCount: 1
    }
};

export const isBalancedFactionMatrix = (): boolean => {
    const entries = Object.values(FACTION_CONTENT_MATRIX);
    return entries.every((entry) =>
        entry.primaryQuests === 3 && entry.decisionPoints === 2 && entry.alternateRewards === 2 && entry.endings.length === 2
    );
};
