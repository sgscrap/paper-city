import { ContractOffer, FactionId, GameState } from '@/types';
import { canAccessContract } from '@/lib/AccessSystem';

const CONTRACTS: Omit<ContractOffer, 'expiresDay'>[] = [
    {
        id: 'angel_neighborhood_watch',
        title: 'Neighborhood Watch',
        description: 'Patrol the Block and keep a vulnerable resident safe.',
        faction: 'angel',
        sourceNpcId: 'npc_ace',
        kind: 'social',
        objective: { trigger: 'interact_npc', target: 'npc_old_man_jenkins' },
        reward: { cash: 80, xp: 30, reputation: 5 }
    },
    {
        id: 'angel_civic_errand',
        title: 'Civic Errand',
        description: 'Travel to the Civic Center and deliver a sealed report.',
        faction: 'angel',
        sourceNpcId: 'npc_mayor',
        kind: 'travel',
        objective: { trigger: 'travel', target: 'political_offices' },
        reward: { cash: 65, xp: 20, reputation: 4 }
    },
    {
        id: 'ghost_market_tip',
        title: 'Quiet Information',
        description: 'Visit the Underground Markets and collect a rumor without starting a fight.',
        faction: 'ghost',
        sourceNpcId: 'npc_ghost',
        kind: 'economy',
        objective: { trigger: 'travel', target: 'underground_markets' },
        reward: { cash: 110, xp: 35, reputation: 6 }
    },
    {
        id: 'ghost_ticker_tip',
        title: 'Read the Tape',
        description: 'Make one market trade after speaking with Ticker Tess.',
        faction: 'ghost',
        sourceNpcId: 'npc_ticker_tess',
        kind: 'economy',
        objective: { trigger: 'action_complete', target: 'MARKET_TRADE' },
        reward: { cash: 90, xp: 40, reputation: 5 }
    },
    {
        id: 'demon_fight_night',
        title: 'Fight Night',
        description: 'Win a street fight and prove you can handle pressure.',
        faction: 'demon',
        sourceNpcId: 'npc_rook',
        kind: 'combat',
        objective: { trigger: 'combat_result', target: 'win' },
        combatEncounterId: 'challenge_demon_pit',
        reward: { cash: 140, xp: 55, reputation: 7 }
    },
    {
        id: 'foundry_press_run',
        title: 'Foundry Press Run',
        description: 'Work a shift on the old presses at Foundry Row.',
        faction: 'angel',
        sourceNpcId: 'npc_foundry_grip',
        kind: 'work',
        objective: { trigger: 'action_complete', target: 'FOUNDRY_PRESS_WORK' },
        reward: { cash: 85, xp: 30, reputation: 4 }
    },
    {
        id: 'foundry_scrap_audit',
        title: 'Scrap Audit',
        description: 'Needle needs an extra pair of hands sorting the day\'s scrap at Foundry Row.',
        faction: 'ghost',
        sourceNpcId: 'npc_foundry_needle',
        kind: 'economy',
        objective: { trigger: 'action_complete', target: 'FOUNDRY_SCRAP_SORT' },
        reward: { cash: 80, xp: 32, reputation: 4 }
    },
    {
        id: 'foundry_block_eight',
        title: 'Block Eight Collection',
        description: 'Slide wants the Block 8 rent collected. One way or another.',
        faction: 'demon',
        sourceNpcId: 'npc_foundry_slide',
        kind: 'combat',
        objective: { trigger: 'combat_result', target: 'win' },
        combatEncounterId: 'challenge_demon_pit',
        reward: { cash: 120, xp: 45, reputation: 5 }
    },
    {
        id: 'club_angel_outreach',
        title: 'Open Door Outreach',
        description: 'Welcome a vulnerable resident into a safer night at Club Lust.',
        faction: 'angel',
        sourceNpcId: 'npc_club_host_aria',
        kind: 'social',
        objective: { trigger: 'action_complete', target: 'CLUB_SOCIAL' },
        reward: { cash: 85, xp: 35, reputation: 5 },
        venue: 'club_lust'
    },
    {
        id: 'club_ghost_signal',
        title: 'Signal Between Songs',
        description: 'Trade a quiet signal through the club sound system.',
        faction: 'ghost',
        sourceNpcId: 'npc_club_dj_echo',
        kind: 'economy',
        objective: { trigger: 'action_complete', target: 'CLUB_NETWORK' },
        reward: { cash: 105, xp: 40, reputation: 5 },
        venue: 'club_lust'
    },
    {
        id: 'club_demon_backroom',
        title: 'Backroom Pressure',
        description: 'Make your presence felt in the club back room without starting a public scene.',
        faction: 'demon',
        sourceNpcId: 'npc_club_bouncer_kane',
        kind: 'social',
        objective: { trigger: 'action_complete', target: 'CLUB_BACKROOM' },
        reward: { cash: 130, xp: 45, reputation: 6 },
        venue: 'club_lust'
    },
    {
        id: 'demon_collection',
        title: 'Collect a Debt',
        description: 'Lean on a contact who has been dodging the underworld.',
        faction: 'demon',
        sourceNpcId: 'npc_shady_dealer',
        kind: 'social',
        objective: { trigger: 'interact_npc', target: 'npc_tommy' },
        reward: { cash: 125, xp: 30, reputation: 6 }
    },
    {
        id: 'angel_civic_review',
        title: 'Civic Review',
        description: 'Audit a neighborhood complaint before it becomes a public scandal.',
        faction: 'angel',
        requiredReputation: 8,
        sourceNpcId: 'npc_mayor',
        kind: 'social',
        objective: { trigger: 'interact_npc', target: 'npc_old_man_jenkins' },
        reward: { cash: 105, xp: 45, reputation: 7 }
    },
    {
        id: 'ghost_private_channel',
        title: 'Private Channel',
        description: 'Move a sensitive file through Corporate Towers without leaving a trace.',
        faction: 'ghost',
        requiredReputation: 8,
        sourceNpcId: 'npc_ghost',
        kind: 'travel',
        objective: { trigger: 'travel', target: 'corporate_towers' },
        reward: { cash: 145, xp: 50, reputation: 7 }
    },
    {
        id: 'demon_enforcer_shift',
        title: 'Enforcer Shift',
        description: 'Collect protection money from a rival crew and return with proof.',
        faction: 'demon',
        requiredReputation: 8,
        sourceNpcId: 'npc_rook',
        kind: 'combat',
        objective: { trigger: 'combat_result', target: 'win' },
        combatEncounterId: 'rival_rook',
        reward: { cash: 175, xp: 60, reputation: 8 }
    },
    {
        id: 'angel_steward_review', title: 'Steward Review', description: 'Resolve a civic complaint with the authority you earned.', faction: 'angel', requiredContentFlag: 'angel_ending_steward', sourceNpcId: 'npc_mayor', kind: 'social', objective: { trigger: 'interact_npc', target: 'npc_old_man_jenkins' }, reward: { cash: 150, xp: 55, reputation: 8 }, crossFactionReputation: { ghost: -2 }
    },
    {
        id: 'angel_authority_pass', title: 'Authority Pass', description: 'Deliver a Coalition credential through the Civic Center.', faction: 'angel', requiredContentFlag: 'angel_ending_authority', sourceNpcId: 'npc_ace', kind: 'travel', objective: { trigger: 'travel', target: 'political_offices' }, reward: { cash: 190, xp: 60, reputation: 7 }
    },
    {
        id: 'ghost_channel_release', title: 'Channel Release', description: 'Open a protected information channel for a waiting contact.', faction: 'ghost', requiredContentFlag: 'ghost_ending_channel', sourceNpcId: 'npc_ghost', kind: 'economy', objective: { trigger: 'action_complete', target: 'MARKET_TRADE' }, reward: { cash: 160, xp: 60, reputation: 8 }, crossFactionReputation: { angel: 2 }
    },
    {
        id: 'ghost_broker_deal', title: 'Broker Deal', description: 'Move a private market position before the city notices.', faction: 'ghost', requiredContentFlag: 'ghost_ending_broker', sourceNpcId: 'npc_lena', kind: 'economy', objective: { trigger: 'action_complete', target: 'MARKET_TRADE' }, reward: { cash: 220, xp: 70, reputation: 7 }
    },
    {
        id: 'demon_enforcer_collection', title: 'Enforcer Collection', description: 'Collect a larger debt now that your name carries weight.', faction: 'demon', requiredContentFlag: 'demon_ending_enforcer', sourceNpcId: 'npc_rook', kind: 'social', objective: { trigger: 'interact_npc', target: 'npc_tommy' }, reward: { cash: 210, xp: 65, reputation: 8 }, crossFactionReputation: { angel: -2 }
    },
    {
        id: 'demon_mercy_deal', title: 'Mercy with Teeth', description: 'Settle a dispute without starting a war.', faction: 'demon', requiredContentFlag: 'demon_ending_monster', sourceNpcId: 'npc_rook', kind: 'combat', objective: { trigger: 'combat_result', target: 'win' }, combatEncounterId: 'rival_rook', reward: { cash: 180, xp: 75, reputation: 7 }
    }
];

const seededIndex = (day: number, offset: number, length = CONTRACTS.length) => Math.abs((day * 17 + offset * 31) % length);

export const generateDailyContracts = (day: number, state?: GameState): ContractOffer[] => {
    const pool = state ? CONTRACTS.filter((contract) => canAccessContract(state, { ...contract, expiresDay: day })) : CONTRACTS;
    const selected: Omit<ContractOffer, 'expiresDay'>[] = [];
    const clubPool = pool.filter((contract) => contract.venue === 'club_lust');
    const standardPool = pool.filter((contract) => contract.venue !== 'club_lust');

    const pick = (source: Omit<ContractOffer, 'expiresDay'>[], count: number, offset: number) => {
        const used = new Set<number>();
        while (selected.length < 3 && count > 0 && used.size < source.length) {
            const index = seededIndex(day, offset + used.size, source.length);
            if (!used.has(index)) {
                used.add(index);
                selected.push(source[index]);
                count -= 1;
            }
        }
    };

    // Club Lust always has one rotating faction opportunity, while the remaining
    // slots preserve the broader city's daily variety.
    pick(clubPool, 1, 0);
    pick(standardPool, 2, 1);

    // Fallback keeps the board populated if a future filter removes one pool.
    pick(pool.filter((contract) => !selected.includes(contract)), 3 - selected.length, 17);

    return selected.map((contract) => ({ ...contract, expiresDay: day }));
};

export const factionForContract = (id: string): FactionId | null => {
    return CONTRACTS.find((contract) => contract.id === id)?.faction || null;
};
