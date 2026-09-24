import { GameState, FactionId } from '@/types';

export type RandomEventContext = 'work' | 'train' | 'study' | 'travel' | 'contract' | 'social' | 'economy' | 'combat' | 'any';

export interface RandomEvent {
    id: string;
    name: string;
    weight: number;
    cooldownBlocks: number;
    maxPerDay: number;
    contexts: RandomEventContext[];
    locations?: string[];
    activities?: string[];
    timeRange?: [number, number];
    requirements?: (state: GameState) => boolean;
    cancelAction?: 'combat';
    apply: (state: GameState) => { patch: Partial<GameState>; toast: { title: string; description: string } };
}

const withFactionRep = (state: GameState, faction: FactionId, amount: number) => ({
    ...state.factionReputation,
    [faction]: Math.max(-100, Math.min(100, state.factionReputation[faction] + amount))
});

export const RANDOM_EVENTS: RandomEvent[] = [
    {
        id: 'RIVAL_INTERRUPTS_CONTRACT', name: 'Rival Interruption', weight: 24, cooldownBlocks: 2, maxPerDay: 1,
        contexts: ['contract'],
        requirements: (state) => state.contracts.acceptedIds.length > 0,
        apply: (state) => ({
            patch: {
                player: { ...state.player, energy: Math.max(0, state.player.energy - 5), stats: { ...state.player.stats, karma: Math.max(-100, state.player.stats.karma - 1) } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'RIVAL_INTERRUPTS_CONTRACT' }
            },
            toast: { title: 'RIVAL INTERRUPTS', description: 'A competing crew tries to take your accepted work. You lose time and energy keeping the contract.' }
        })
    },
    {
        id: 'NPC_DEBT_CALL', name: 'A Debt Comes Due', weight: 18, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['social'],
        requirements: (state) => Object.values(state.npcs).some((npc) => npc.debt > 0 || npc.relationship >= 8),
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth - 25) } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'NPC_DEBT_CALL' }
            },
            toast: { title: 'A DEBT COMES DUE', description: 'A contact calls in an old favor. Pay $25 now, or let the relationship sour.' }
        })
    },
    {
        id: 'FACTION_RECRUITER', name: 'Shortcut Offer', weight: 16, cooldownBlocks: 8, maxPerDay: 1,
        contexts: ['travel', 'social'],
        requirements: (state) => !state.factionIdentity.primaryFaction,
        apply: (state) => ({
            patch: {
                contentFlags: { ...state.contentFlags, recruiter_offer_seen: true },
                factionReputation: withFactionRep(state, state.player.stats.karma >= 10 ? 'angel' : state.player.stats.karma <= -10 ? 'demon' : 'ghost', 2),
                randomEvents: { ...state.randomEvents, lastOutcome: 'FACTION_RECRUITER' }
            },
            toast: { title: 'RECRUITER IN THE CROWD', description: 'A faction offers a shortcut. Your reputation shifts slightly toward the identity your recent choices suggest.' }
        })
    },
    {
        id: 'MARKET_OPPORTUNITY', name: 'Market Opportunity', weight: 22, cooldownBlocks: 2, maxPerDay: 1,
        contexts: ['economy'], locations: ['trading_floor', 'underground_markets'], timeRange: [360, 1080],
        requirements: (state) => state.player.stats.worth >= 40,
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 35, luck: state.player.stats.luck + 1 } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'MARKET_OPPORTUNITY' }
            },
            toast: { title: 'MARKET OPPORTUNITY', description: 'A trusted tip lands at the right moment. You make $35 and gain +1 Luck.' }
        })
    },
    {
        id: 'PUBLIC_ACTION', name: 'Public Consequence', weight: 18, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['social', 'travel'], locations: ['political_offices', 'the_block'],
        requirements: (state) => state.player.stats.karma >= 5,
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, karma: Math.min(100, state.player.stats.karma + 2) } },
                factionReputation: withFactionRep(state, 'angel', 2),
                randomEvents: { ...state.randomEvents, lastOutcome: 'PUBLIC_ACTION' }
            },
            toast: { title: 'THE CITY NOTICES', description: 'A public act of decency spreads through the neighborhood. Angel reputation +2.' }
        })
    },
    {
        id: 'TRUSTED_CONTACT_REQUEST', name: 'Trusted Contact Request', weight: 20, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['social'], timeRange: [1080, 1560],
        requirements: (state) => Object.values(state.npcs).some((npc) => npc.trust >= 3) || state.contracts.completedIds.length > 0,
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 45, karma: Math.min(100, state.player.stats.karma + 1) } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'TRUSTED_CONTACT_REQUEST' }
            },
            toast: { title: 'TRUSTED CONTACT', description: 'Someone who remembers your help asks for a small favor. You earn $45 and +1 Karma.' }
        })
    },
    {
        id: 'FAILED_RELATIONSHIP_THREAT', name: 'Old Grudge', weight: 20, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['social'],
        requirements: (state) => Object.values(state.npcs).some((npc) => npc.relationship <= -10),
        apply: (state) => ({
            patch: {
                player: { ...state.player, health: Math.max(1, state.player.health - 8), stats: { ...state.player.stats, karma: Math.max(-100, state.player.stats.karma - 1) } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'FAILED_RELATIONSHIP_THREAT' }
            },
            toast: { title: 'OLD GRUDGE', description: 'A damaged relationship creates a new threat. You lose 8 Health and -1 Karma.' }
        })
    },
    {
        id: 'LEVERAGE_ESCAPE', name: 'Leverage Beats Violence', weight: 30, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['combat'],
        requirements: (state) => state.player.stats.charisma >= 14 || state.player.stats.intelligence >= 14 || state.player.stats.worth >= 250,
        cancelAction: 'combat',
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth >= 250 ? state.player.stats.worth - 50 : state.player.stats.worth } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'LEVERAGE_ESCAPE' }
            },
            toast: { title: 'VIOLENCE AVOIDED', description: 'Social or economic leverage ends the confrontation before it becomes a fight.' }
        })
    },
    {
        id: 'LUCKY_FIND', name: 'Lucky Find', weight: 50, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['travel', 'any'],
        apply: (state) => {
            const gain = Math.floor(Math.random() * 151) + 50;
            return { patch: { player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + gain } }, randomEvents: { ...state.randomEvents, lastOutcome: 'LUCKY_FIND' } }, toast: { title: 'LUCKY PENNY!', description: `You found $${gain} on the ground.` } };
        }
    },
    {
        id: 'PICKPOCKET', name: 'Pickpocket', weight: 30, cooldownBlocks: 8, maxPerDay: 1,
        contexts: ['travel', 'any'], requirements: (state) => state.player.stats.worth >= 20,
        apply: (state) => { const loss = Math.floor(Math.random() * 101) + 20; const actualLoss = Math.min(loss, state.player.stats.worth); return { patch: { player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth - actualLoss } }, randomEvents: { ...state.randomEvents, lastOutcome: 'PICKPOCKET' } }, toast: { title: 'PICKPOCKET!', description: `Someone bumped into you. You lost $${actualLoss}.` } }; }
    },
    {
        id: 'INSPIRATION', name: 'Sudden Inspiration', weight: 40, cooldownBlocks: 2, maxPerDay: 2,
        contexts: ['work', 'train', 'study', 'any'],
        apply: (state) => { const xp = Math.floor(Math.random() * 13) + 8; return { patch: { player: { ...state.player, xp: state.player.xp + xp }, randomEvents: { ...state.randomEvents, lastOutcome: 'INSPIRATION' } }, toast: { title: 'INSPIRATION!', description: `Everything clicks. +${xp} XP.` } }; }
    },
    {
        id: 'SECOND_WIND', name: 'Second Wind', weight: 40, cooldownBlocks: 4, maxPerDay: 1, contexts: ['work', 'train', 'any'], requirements: (state) => state.player.energy < 80,
        apply: (state) => { const gain = Math.floor(Math.random() * 16) + 10; return { patch: { player: { ...state.player, energy: Math.min(state.player.maxEnergy, state.player.energy + gain) }, randomEvents: { ...state.randomEvents, lastOutcome: 'SECOND_WIND' } }, toast: { title: 'SECOND WIND', description: `You feel a burst of energy. +${gain} Energy.` } }; }
    },
    {
        id: 'BAD_VIBES', name: 'Bad Vibes', weight: 20, cooldownBlocks: 4, maxPerDay: 1, contexts: ['any'],
        apply: (state) => { const loss = Math.floor(Math.random() * 5) + 2; return { patch: { player: { ...state.player, stats: { ...state.player.stats, will: Math.max(0, state.player.stats.will - loss) }, }, randomEvents: { ...state.randomEvents, lastOutcome: 'BAD_VIBES' } }, toast: { title: 'BAD VIBES', description: `Just not feeling it today. -${loss} Will.` } }; }
    },
    {
        id: 'FOUNDRY_SCRAP_SURPLUS', name: 'Foundry Scrap Surplus', weight: 20, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['work', 'travel', 'economy'], locations: ['foundry_row'],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 40 } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'FOUNDRY_SCRAP_SURPLUS' }
            },
            toast: { title: 'SURPLUS STAMP', description: 'Foundry Row presses ran hot today. You pick up $40 in stamped scrap dividend.' }
        })
    },
    {
        id: 'WATERFRONT_NIGHT_FOG', name: 'Waterfront Night Cargo', weight: 20, cooldownBlocks: 4, maxPerDay: 1,
        contexts: ['travel', 'contract', 'social'], locations: ['the_waterfront'], timeRange: [1080, 1560],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, luck: state.player.stats.luck + 1 } },
                randomEvents: { ...state.randomEvents, lastOutcome: 'WATERFRONT_NIGHT_FOG' }
            },
            toast: { title: 'HARBOR MIST', description: 'Dense fog shields the docks. Pier runners give you a free pass. +1 Luck.' }
        })
    }
];
