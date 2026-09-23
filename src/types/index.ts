// --- STATS & ATTRIBUTES ---
export interface Stats {
    power: number;
    intelligence: number;
    charisma: number;
    luck: number;
    karma: number; // -100 to +100
    worth: number; // Cash
    will: number; // Mental Stamina for Work
}

export type Attribute = keyof Omit<Stats, 'karma' | 'worth'>;
export type FactionId = 'angel' | 'ghost' | 'demon';
export const FACTIONS: FactionId[] = ['angel', 'ghost', 'demon'];

export type AllegianceStatus = 'uncommitted' | 'committed' | 'defected';

export interface FactionIdentity {
    primaryFaction: FactionId | null;
    status: AllegianceStatus;
    committedAtDay: number | null;
    betrayals: FactionId[];
    milestones: string[];
}

// --- FUTURE: OWNERSHIP & REAL ESTATE (L0) ---
export interface Parcel {
    id: string;
    districtId: string;
    bounds: { x: number; y: number; w: number; h: number };
    ownerId: string | null;
    slots: number;
    state: "locked" | "owned" | "listed";
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon?: string;
    secret?: boolean;
}

export interface PlaceableAsset {
    id: string;
    name: string;
    category: "building" | "decor" | "utility";
    footprint: { w: number; h: number };
    rarity: "common" | "rare" | "legendary";
    creatorId: string;
}

// --- CAREERS ---
export interface Career {
    id: string;
    title: string;
    location: string;
    tier: 1 | 2 | 3;
    statReqs: Partial<Stats>;
    dailyPay: number;
    description: string;
    nextTier?: string;
    karmaAlignment?: 'angel' | 'ghost' | 'demon';
    requiredFaction?: FactionId;
    requiredReputation?: number;
}

export interface CareerState {
    currentId: string;
    tier: number;
    xp: number; // Job XP
    prestigeLevel: number;
    history: string[];
}

// --- WORLD & LOCATIONS ---
export interface Location {
    id: string;
    name: string;
    description: string;
    connectedTo: string[];
    neighbors?: {
        north?: string;
        south?: string;
        east?: string;
        west?: string;
    };
    actions: string[];
}

export interface Housing {
    type: 'studio' | 'penthouse' | 'mansion' | 'hideout';
    upgrades: string[];
    stash: number;
}

export interface FinanceState {
    loanBalance: number;
    loanDaysRemaining: number;
    loansTaken: number;
    defaults: number;
    debtNpcIds: string[];
    interestRate: number;
    completedFinanceContractIds?: string[];
}

// --- NPCs & RELATIONSHIPS ---
export type NPCAlignment = 'good' | 'neutral' | 'opportunistic' | 'dangerous';
export type NPCInteractionType = 'chat' | 'gift' | 'insult';

export interface NPCSocialEffect {
    karma?: number;
    luck?: number;
    itemId?: string;
    relationship?: number;
    trust?: number;
    fear?: number;
    loyalty?: number;
}

export interface NPCState {
    relationship: number;
    trust: number;
    fear: number;
    debt: number;
    loyalty: number;
    lastInteraction: number;
    lastDailyEffectDay: number;
    serviceUses: Record<string, number>;
    activeQuests: string[];
    history: string[];
}

import { QuestState } from './quests';

/** In-game daypart buckets derived from the world clock (minutes since midnight). */
export type NPCDaypart = 'morning' | 'afternoon' | 'evening' | 'night';

export interface NPC {
    id: string;
    name: string;
    location: string;
    baseDialogue: string[];
    /** Optional time-of-day greeting pools; fall back to baseDialogue when absent or empty. */
    daypartDialogue?: Partial<Record<NPCDaypart, string[]>>;
    faction?: FactionId;
    questId?: string;
    jobId?: string;
    infoId?: string;
    alignment?: NPCAlignment;
    socialEffects?: Partial<Record<NPCInteractionType, NPCSocialEffect>>;
    service?: 'contracts' | 'discounts' | 'intel' | 'safehouse' | 'market';
    serviceFaction?: FactionId;
    specialService?: string;
    specialServiceFlags?: string[];
}

export interface ArcSummary {
    faction: FactionId;
    endingId: string;
    completedAtDay: number;
    questIds: string[];
    choiceIds: string[];
    relationshipSnapshot: Record<string, number>;
    crossFactionConsequences: Partial<Record<FactionId, number>>;
}

export interface ContractOffer {
    id: string;
    title: string;
    description: string;
    faction: FactionId;
    sourceNpcId?: string;
    requiredReputation?: number;
    requiredContentFlag?: string;
    kind: 'travel' | 'social' | 'combat' | 'economy' | 'work';
    objective: { trigger: string; target?: string; amount?: number };
    reward: { cash: number; xp: number; reputation: number };
    crossFactionReputation?: Partial<Record<FactionId, number>>;
    combatEncounterId?: string;
    venue?: 'club_lust';
    expiresDay: number;
}

export type ContractStatus = 'available' | 'accepted' | 'in_progress' | 'ready' | 'completed' | 'expired' | 'failed';

export interface ContractState {
    generatedDay: number;
    poolKey?: string;
    offers: ContractOffer[];
    acceptedIds: string[];
    statuses: Record<string, ContractStatus>;
    completedIds: string[];
    expiredIds: string[];
    failedIds: string[];
}

export interface ClubState {
    reputation: number;
    heat: number;
    factionTrust: Record<FactionId, number>;
    lastActivityDay: number;
    eventUses: Record<string, number>;
}

export interface TutorialState {
    step: number;
    completed: boolean;
    skipped: boolean;
}

export interface ClubEvent {
    id: string;
    title: string;
    description: string;
    faction: FactionId;
    minReputation?: number;
    minHeat?: number;
    maxHeat?: number;
    minFactionTrust?: Partial<Record<FactionId, number>>;
    energyCost: number;
    cashCost: number;
    timeCost: number;
    rewards: {
        reputation: number;
        heat: number;
        cash?: number;
        xp?: number;
        factionTrust?: Partial<Record<FactionId, number>>;
    };
}

// --- INVENTORY ---
export interface InventoryState {
    items: Record<string, number>;
    equippedWeapon: string | null;
}

// --- STOCK MARKET ---
export interface MarketEvent {
    id: string;
    title: string;
    description: string;
    impacts: Record<string, number>;
    duration: number;
}

export interface MarketState {
    prices: Record<string, number>;
    trends: Record<string, 'bull' | 'bear' | 'flat'>;
    portfolio: Record<string, number>;
    todayHigh?: Record<string, number>;
    todayLow?: Record<string, number>;
    // New Price History
    priceHistory: Record<string, { t: number; usd: number }[]>;
    history: Record<string, number[]>; // Deprecated/Legacy
    lastUpdate: number;
    activeEvent?: MarketEvent;
    intelTips: Record<string, { day: number; direction: 'bull' | 'bear' | 'flat'; accuracy: number }>;
    stocks: {
        prices: Record<string, number>;
        trends: Record<string, 'bull' | 'bear' | 'flat'>;
        portfolio: Record<string, number>;
        history: Record<string, number[]>;
    };
}

// --- COMBAT STATS ---
export interface CombatRecord {
    wins: number;
    losses: number;
    rankTitle: string;
    reputation: number;
    ladderTier: number;
    ladderWins: number;
    rivalWins: Record<string, number>;
    factionWins: Record<FactionId, number>;
    completedEncounterIds: string[];
    nonCombatResolutions: Record<string, 'social' | 'economic'>;
}

// --- RANDOM EVENTS ---
export interface RandomEventsState {
    triggeredToday: number;
    lastDay: number;
    lastTriggeredAt: Record<string, number>; // eventId -> totalMinutes
    consecutiveMisses: number; // Pity timer
    eventCountsToday: Record<string, number>;
    lastOutcome?: string;
}

// --- STREET ENCOUNTERS (NPC-initiated approaches) ---
export interface StreetEncountersState {
    /** NPC id -> number of approaches made today. */
    encounteredIds: Record<string, number>;
    lastEncounterDay: number;
    /** Total-minutes timestamp of the last approach (global 1/hour guard). */
    lastEncounterAt: number;
    /** Currently pending encounter (drives the overlay). */
    active: {
        npcId: string;
        encounterId: string;
        line: string;
    } | null;
    /** Encounter ids the player has resolved, for flavor gating. */
    resolved: Record<string, number>;
}

// --- GAME STATE V1 ---
export interface GameState {
    version: 1;
    contentVersion: 3;
    playerId: string; // Keep for internal tracking

    player: {
        name: string;
        stats: Stats;
        xp: number;
        level: number;
        skillPoints: number;
        health: number;
        maxHealth: number; // Added to match logic needs
        energy: number; // Replaces 'will'
        maxEnergy: number; // Added for completeness
        housing: Housing;
        traits: string[];
    };

    world: {
        locationId: string;
        day: number;
        time: number;
    };

    inventory: InventoryState;
    quests: Record<string, QuestState>;
    factionReputation: Record<FactionId, number>;
    factionIdentity: FactionIdentity;
    arcSummaries: Partial<Record<FactionId, ArcSummary>>;
    contentFlags: Record<string, boolean>;
    contracts: ContractState;
    club: ClubState;
    tutorial: TutorialState;
    career: CareerState;
    flags: Record<string, boolean>;
    featureFlags: {
        landSystemEnabled: boolean;
        walletEnabled: boolean;
        multiplayerEnabled: boolean;
        vfxEnabled: boolean;
    };

    // Extras not in user snippet but needed for game
    market: MarketState;
    npcs: Record<string, NPCState>;
    combatRecord: CombatRecord;
    randomEvents: RandomEventsState;
    streetEncounters: StreetEncountersState;
    finance: FinanceState;
    achievements: Record<string, number>; // achievementId -> unlockedAt
    outfit: string;
    combatState: unknown; // using unknown to avoid circular dep with store/types
    remotePlayers: Record<string, unknown>; // Multiplayer placeholder
    playTime: number;
    gameMode: 'fun' | 'real' | null;
    lastSaved: number;
}

export const INITIAL_STATE: GameState = {
    version: 1,
    contentVersion: 3,
    playerId: 'player_1',
    player: {
        name: 'New Citizen',
        stats: {
            power: 10,
            intelligence: 10,
            charisma: 10,
            luck: 10,
            karma: 0,
            worth: 40, // Tutorial Start
            will: 100
        },
        xp: 0,
        level: 1,
        skillPoints: 0,
        health: 100,
        maxHealth: 100,
        energy: 100,
        maxEnergy: 100,
        housing: {
            type: 'studio',
            upgrades: [],
            stash: 0
        },
        traits: []
    },
    world: {
        locationId: 'the_block',
        day: 1,
        time: 360 // 6:00 AM
    },
    inventory: {
        items: {},
        equippedWeapon: null
    },
    quests: {
        'trust_yourself_intro': { id: 'trust_yourself_intro', status: 'active', objectives: { 'meet_ace': false } }
    },
    factionReputation: {
        angel: 0,
        ghost: 0,
        demon: 0
    },
    factionIdentity: {
        primaryFaction: null,
        status: 'uncommitted',
        committedAtDay: null,
        betrayals: [],
        milestones: []
    },
    arcSummaries: {},
    contentFlags: {},
    contracts: {
        generatedDay: 0,
        offers: [],
        acceptedIds: [],
        statuses: {},
        completedIds: [],
        expiredIds: [],
        failedIds: []
    },
    club: {
        reputation: 0,
        heat: 0,
        factionTrust: {
            angel: 0,
            ghost: 0,
            demon: 0
        },
        lastActivityDay: 1,
        eventUses: {}
    },
    tutorial: {
        step: 0,
        completed: false,
        skipped: false
    },
    career: {
        currentId: 'unemployed',
        tier: 0,
        xp: 0,
        prestigeLevel: 0,
        history: []
    },
    flags: {
        tutorial_complete: false,
        character_created: false,
        intro_seen: false
    },
    featureFlags: {
        landSystemEnabled: false,
        walletEnabled: false,
        multiplayerEnabled: true, // Internal testing
        vfxEnabled: true
    },
    market: {
        prices: {},
        trends: {},
        portfolio: {},
        history: {},
        priceHistory: {}, // New history
        lastUpdate: 0,
        intelTips: {},
        stocks: {
            prices: {},
            trends: {},
            portfolio: {},
            history: {}
        }
    },
    npcs: {},
    combatRecord: {
        wins: 0,
        losses: 0,
        rankTitle: 'Fresh Meat',
        reputation: 0,
        ladderTier: 1,
        ladderWins: 0,
        rivalWins: {},
        factionWins: { angel: 0, ghost: 0, demon: 0 },
        completedEncounterIds: [],
        nonCombatResolutions: {}
    },
    finance: {
        loanBalance: 0,
        loanDaysRemaining: 0,
        loansTaken: 0,
        defaults: 0,
        debtNpcIds: [],
        interestRate: 0.15
    },
    randomEvents: {
        triggeredToday: 0,
        lastDay: 1,
        lastTriggeredAt: {},
        consecutiveMisses: 0,
        eventCountsToday: {},
        lastOutcome: undefined
    },
    streetEncounters: {
        encounteredIds: {},
        lastEncounterDay: 1,
        lastEncounterAt: 0,
        active: null,
        resolved: {}
    },
    achievements: {},
    outfit: 'street_clothes',
    combatState: null,
    remotePlayers: {},
    playTime: 0,
    gameMode: null,
    lastSaved: Date.now()
};
