import { FactionId, GameState } from '@/types';

// --- HOUSING & SAFEHOUSE UPGRADES ---
export interface HousingUpgrade {
    id: string;
    name: string;
    description: string;
    cost: number;
    effect: string;
    isSafehouseOnly?: boolean;
}

export const HOUSING_UPGRADES: HousingUpgrade[] = [
    {
        id: 'better_mattress',
        name: 'Real Mattress',
        description: 'Sleep like a person instead of a survivor.',
        cost: 300,
        effect: 'Wake with +10 bonus energy each morning.'
    },
    {
        id: 'stash_liners',
        name: 'Stash Liners',
        description: 'Extra insulation under the mattress and floorboards.',
        cost: 500,
        effect: 'Stash withdrawals cost nothing extra; deposit cap raised by $1,000.'
    },
    {
        id: 'coffee_station',
        name: 'Coffee Station',
        description: 'A battered machine that still pulls a real espresso.',
        cost: 750,
        effect: 'One free energy drink worth of willpower every morning.'
    },
    {
        id: 'security_locks',
        name: 'Security Locks',
        description: 'Reinforced door, two deadbolts, and a paper-wedge alarm.',
        cost: 1200,
        effect: 'Street events that steal cash are less likely while home.'
    },
    {
        id: 'intel_scanner',
        name: 'Police Scanner',
        description: 'Salvaged radio tuned to the frequencies that matter.',
        cost: 2000,
        effect: 'Market intel tips refresh with higher accuracy.',
        isSafehouseOnly: true
    },
    {
        id: 'floor_scales',
        name: 'Training Corner',
        description: 'Used weights, a heavy bag, and a doorframe pull-up bar.',
        cost: 2500,
        effect: 'Training sessions cost 5 less energy.',
        isSafehouseOnly: true
    }
];

// --- FACTION VENDORS ---
export interface VendorStockEntry {
    itemId: string;
    price: number;
}

export interface FactionVendor {
    id: string;
    name: string;
    location: string;
    faction: FactionId;
    requiredReputation: number;
    description: string;
    stock: VendorStockEntry[];
}

export const FACTION_VENDORS: FactionVendor[] = [
    {
        id: 'vendor_coalition_depot',
        name: 'Coalition Supply Depot',
        location: 'political_offices',
        faction: 'angel',
        requiredReputation: 8,
        description: 'Surplus civic gear at below-retail pricing for trusted citizens.',
        stock: [
            { itemId: 'energy_drink', price: 6 },
            { itemId: 'focus_pill', price: 30 },
            { itemId: 'gym_shoes', price: 50 }
        ]
    },
    {
        id: 'vendor_signal_room',
        name: 'The Signal Room',
        location: 'corporate_towers',
        faction: 'ghost',
        requiredReputation: 8,
        description: 'Quiet hardware for people who move information quietly.',
        stock: [
            { itemId: 'focus_pill', price: 25 },
            { itemId: 'lucky_charm', price: 18 },
            { itemId: 'smartphone', price: 380 }
        ]
    },
    {
        id: 'vendor_pit_counter',
        name: 'Pit Counter',
        location: 'underground_markets',
        faction: 'demon',
        requiredReputation: 8,
        description: 'Fight-night essentials sold out of a gym bag. No receipts.',
        stock: [
            { itemId: 'protein_shake', price: 15 },
            { itemId: 'broken_bottle', price: 8 },
            { itemId: 'switchblade', price: 90 }
        ]
    }
];

export const isVendorAvailable = (state: GameState, vendor: FactionVendor): boolean =>
    (state.factionReputation[vendor.faction] || 0) >= vendor.requiredReputation
    || state.factionIdentity.primaryFaction === vendor.faction;

export const getVendorPrice = (state: GameState, vendor: FactionVendor, itemId: string): number => {
    const entry = vendor.stock.find((stock) => stock.itemId === itemId);
    if (!entry) return 0;
    const relationshipNpcId: Record<FactionId, string> = {
        angel: 'npc_ace',
        ghost: 'npc_ghost',
        demon: 'npc_rook'
    };
    const npcState = state.npcs[relationshipNpcId[vendor.faction]];
    const relationshipDiscount = npcState ? Math.min(10, Math.max(0, npcState.relationship / 10)) : 0;
    return Math.max(1, Math.floor(entry.price * (1 - relationshipDiscount / 100)));
};

// --- MARKET INTELLIGENCE SOURCES ---
export interface IntelSource {
    id: string;
    name: string;
    cost: number;
    accuracy: number;
    description: string;
}

export const INTEL_SOURCES: IntelSource[] = [
    {
        id: 'intel_street_kid',
        name: 'Street Kid Rumor',
        cost: 15,
        accuracy: 55,
        description: 'Cheap, fast, and frequently wrong.'
    },
    {
        id: 'intel_ticker_tess',
        name: 'Ticker Tess Tip',
        cost: 80,
        accuracy: 70,
        description: 'A floor trader with a good ear and a better filter.'
    },
    {
        id: 'intel_ghost_channel',
        name: 'Ghost Channel Brief',
        cost: 200,
        accuracy: 85,
        description: 'Information moved through the club sound system. Almost never wrong.'
    }
];

// --- DAILY CITY ACTIVITIES ---
export type DailyActivityKind = 'social' | 'economy' | 'combat' | 'work' | 'travel';

export interface DailyActivity {
    id: string;
    title: string;
    description: string;
    kind: DailyActivityKind;
    energyCost: number;
    timeCost: number;
    cashCost: number;
    rewards: { cash?: number; xp?: number; relationshipNpcId?: string; relationship?: number; reputationFaction?: FactionId; reputation?: number };
    factions?: FactionId[];
    dayBucket: 0 | 1 | 2;
}

const FACTION_FILTER: Array<{ factions?: FactionId[] }> = [{}];

export const DAILY_ACTIVITIES: DailyActivity[] = [
    {
        id: 'activity_block_breakfast', title: 'Corner Breakfast Run', description: 'Buy coffee for the whole stoop. The Block remembers who feeds it.',
        kind: 'social', energyCost: 5, timeCost: 60, cashCost: 20,
        rewards: { xp: 10, relationshipNpcId: 'npc_old_man_jenkins', relationship: 2, reputationFaction: 'angel', reputation: 1 },
        dayBucket: 0
    },
    {
        id: 'activity_pawn_run', title: 'Pawn Circuit Sweep', description: 'Hit three shops before lunch and read what the neighborhood is selling.',
        kind: 'economy', energyCost: 10, timeCost: 120, cashCost: 0,
        rewards: { cash: 55, xp: 15 }, dayBucket: 0
    },
    {
        id: 'activity_open_mat', title: 'Open Mat Session', description: 'The gym opens its mats to anyone bold enough to show up.',
        kind: 'combat', energyCost: 15, timeCost: 90, cashCost: 0,
        rewards: { xp: 25, reputationFaction: 'demon', reputation: 1 }, dayBucket: 0
    },
    {
        id: 'activity_bike_messenger', title: 'Messenger Split Shift', description: 'Half day on the bike. Tips depend on how fast you are.',
        kind: 'work', energyCost: 20, timeCost: 240, cashCost: 0,
        rewards: { cash: 95, xp: 20 }, dayBucket: 1
    },
    {
        id: 'activity_market_flea', title: 'Flea Market Flip', description: 'Buy low at the flea stalls, sell to the office crowd.',
        kind: 'economy', energyCost: 8, timeCost: 150, cashCost: 60,
        rewards: { cash: 140, xp: 20 }, dayBucket: 1
    },
    {
        id: 'activity_park_hustle', title: 'Pickup Game', description: 'Court is full and the trash talk is free.',
        kind: 'social', energyCost: 12, timeCost: 90, cashCost: 0,
        rewards: { xp: 20, relationshipNpcId: 'npc_tommy', relationship: 2 }, dayBucket: 1
    },
    {
        id: 'activity_civic_volunteer', title: 'Civic Volunteer Shift', description: 'Hand out flyers, fix a sign, and stand next to something official.',
        kind: 'social', energyCost: 10, timeCost: 120, cashCost: 0,
        rewards: { xp: 20, reputationFaction: 'angel', reputation: 2 },
        factions: ['angel'], dayBucket: 2
    },
    {
        id: 'activity_signal_relay', title: 'Signal Relay Run', description: 'Carry a sealed word-of-mouth packet through the towers.',
        kind: 'economy', energyCost: 12, timeCost: 120, cashCost: 0,
        rewards: { cash: 120, xp: 25, reputationFaction: 'ghost', reputation: 2 },
        factions: ['ghost'], dayBucket: 2
    },
    {
        id: 'activity_pit_cleanup', title: 'Pit Cleanup Detail', description: 'Bleach, mop, and everyone pretends the back room is a kitchen.',
        kind: 'combat', energyCost: 18, timeCost: 150, cashCost: 0,
        rewards: { cash: 110, xp: 30, reputationFaction: 'demon', reputation: 2 },
        factions: ['demon'], dayBucket: 2
    }
];

const getDayBucket = (day: number): 0 | 1 | 2 => (day % 3) as 0 | 1 | 2;

export const getDailyActivities = (state: GameState): DailyActivity[] => {
    const bucket = getDayBucket(state.world.day);
    return DAILY_ACTIVITIES.filter((activity) => {
        if (activity.dayBucket !== bucket) return false;
        if (activity.factions && !activity.factions.some((faction) => state.factionIdentity.primaryFaction === faction || (state.factionReputation[faction] || 0) >= 8)) return false;
        return true;
    });
};

export const performDailyActivity = (state: GameState, activity: DailyActivity): { patch: Partial<GameState>; toast: { title: string; description: string } } => {
    const npcs = { ...state.npcs };
    if (activity.rewards.relationshipNpcId) {
        const npcId = activity.rewards.relationshipNpcId;
        const npcState = npcs[npcId] || { relationship: 0, trust: 0, fear: 0, debt: 0, loyalty: 0, lastInteraction: 0, lastDailyEffectDay: 0, serviceUses: {}, activeQuests: [], history: [] };
        npcs[npcId] = {
            ...npcState,
            relationship: Math.min(100, npcState.relationship + (activity.rewards.relationship || 0)),
            trust: Math.min(100, npcState.trust + 1),
            history: [...npcState.history.slice(-7), `activity:${activity.id}`]
        };
    }
    const factionReputation = { ...state.factionReputation };
    if (activity.rewards.reputationFaction && activity.rewards.reputation) {
        const faction = activity.rewards.reputationFaction;
        factionReputation[faction] = Math.max(-100, Math.min(100, (factionReputation[faction] || 0) + activity.rewards.reputation));
    }
    return {
        patch: {
            player: {
                ...state.player,
                energy: Math.max(0, state.player.energy - activity.energyCost),
                stats: {
                    ...state.player.stats,
                    worth: Math.max(0, state.player.stats.worth - activity.cashCost + (activity.rewards.cash || 0))
                },
                xp: state.player.xp + (activity.rewards.xp || 0)
            },
            npcs,
            factionReputation
        },
        toast: {
            title: activity.title.toUpperCase(),
            description: `${activity.description}${activity.rewards.cash ? ` Earned $${activity.rewards.cash}.` : ''}${activity.rewards.reputation ? ` +${activity.rewards.reputation} ${activity.rewards.reputationFaction?.toUpperCase()} rep.` : ''}`
        }
    };
};

// The empty filter list above is intentionally kept minimal; FACTION_FILTER is a placeholder
// for future per-day weighting hooks.
void FACTION_FILTER;
