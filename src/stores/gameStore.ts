import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, INITIAL_STATE, Stats } from '@/types';
import { StatEngine } from '@/lib/StatEngine';
import { KarmaSystem } from '@/lib/KarmaSystem';
import { CareerSystem } from '@/lib/CareerSystem';
import { CAREERS } from '@/data/careers';
import { NPCS } from '@/data/npcs';
import { NPCSystem } from '@/lib/NPCSystem';
import { InventorySystem } from '@/lib/InventorySystem';
import { ITEMS } from '@/data/items';
import { useUIStore } from '@/stores/uiStore';
import { CombatState, CombatActionType } from '@/types/combat';
import { CombatSystem } from '@/lib/CombatSystem';
import { ENEMIES } from '@/data/enemies';
import { CRYPTO } from '@/data/crypto';
import { STOCKS } from '@/data/stocks';
import { MARKET_EVENTS } from '@/data/marketEvents';
import { QUESTS } from '@/data/quests';
import { ActionResolver } from '@/lib/ActionResolver';
import { QuestState } from '@/types/quests';
import { RANDOM_EVENTS, RandomEventContext } from '@/data/randomEvents';
import { STREET_ENCOUNTERS, pickStreetEncounter } from '@/data/streetEncounters';
import { ACHIEVEMENTS } from '@/data/achievements';
import { generateDailyContracts } from '@/data/contracts';
import { canChooseQuest, questIsComplete } from '@/lib/QuestSystem';
import { FactionId, AllegianceStatus, ContractOffer } from '@/types';
import { canAccess as canAccessContent, accessReason, locationAccessId, canAccessCareer, canAccessContract } from '@/lib/AccessSystem';
import { LOCATIONS } from '@/data/locations';
import { MAP_DEFINITIONS } from '@/data/maps';
import { CLUB_EVENTS, isClubEventAvailable } from '@/data/club';
import { getCombatEncounter, isCombatEncounterAvailable, ConflictResolution } from '@/data/combatProgression';
import { HOUSING_UPGRADES, FACTION_VENDORS, INTEL_SOURCES, getVendorPrice, getDailyActivities, performDailyActivity } from '@/data/economy';
import { FINANCE_CONTRACTS, canAccessFinanceContract } from '@/data/financeContracts';

export interface RemotePlayer {
    id: string;
    x: number;
    y: number;
    mapId: string;
}

export type ClubActivityId = 'CLUB_SOCIAL' | 'CLUB_NETWORK' | 'CLUB_BACKROOM';

interface GameActions {
    // Stat Modifiers
    modifyStat: (stat: keyof Stats, amount: number) => void;
    modifyKarma: (amount: number) => void;
    gainXp: (amount: number) => void;
    spendSkillPoint: (stat: keyof Stats) => void;
    dispatchAction: (actionId: string) => void;
    performClubActivity: (activity: ClubActivityId) => void;
    performClubEvent: (eventId: string) => void;
    advanceTutorial: () => void;
    skipTutorial: () => void;
    replayTutorial: () => void;

    // Time & Progress
    advanceTime: (minutes: number, context?: RandomEventContext, activity?: string) => void;
    newDay: () => void;

    // Core Actions
    setLocation: (locationId: string) => boolean;
    canAccess: (accessId: string) => boolean;
    getAccessReason: (accessId: string) => string | null;

    // Market Actions
    initMarket: () => void;
    updateMarket: () => void;
    buyCrypto: (symbol: string, quantity: number) => void;
    sellCrypto: (symbol: string, quantity: number) => void;
    buyStock: (symbol: string, quantity: number) => void;
    sellStock: (symbol: string, quantity: number) => void;

    // Price Service
    fetchPrices: () => Promise<void>;
    startPricePolling: () => void;
    stopPricePolling: () => void;
    pricePollingId: NodeJS.Timeout | null;

    // Career Actions
    applyJob: (careerId: string) => void;
    workJob: () => void;

    // NPC Actions
    interactNPC: (npcId: string, action: 'chat' | 'gift' | 'insult') => void;
    useNPCService: (npcId: string) => void;

    // Street Encounters (NPC-initiated approaches)
    maybeApproachPlayer: (npcId: string) => void;
    resolveStreetEncounter: (choice: 'accept' | 'dismiss') => void;

    // Quests
    startQuest: (questId: string) => void;
    checkQuestObjectives: (trigger: 'buy_item' | 'stat_change' | 'interact_npc' | 'action_complete' | 'travel' | 'combat_result' | 'contract_complete', data?: string) => void;
    updateQuestObjective: (questId: string, objectiveId: string, completed: boolean) => void;
    completeQuest: (questId: string) => void;
    chooseQuest: (questId: string, choiceId: string) => void;
    modifyFactionReputation: (faction: FactionId, amount: number) => void;
    defectFaction: (faction: FactionId) => void;
    recordFactionMilestone: (milestone: string) => void;
    refreshContracts: () => void;
    acceptContract: (contractId: string) => void;
    abandonContract: (contractId: string) => void;        completeContract: (contractId: string) => void;
        completeFinanceContract: (contractId: string) => void;

    // Inventory


    buyItem: (itemId: string) => void;
    sellItem: (itemId: string) => void;
    useItem: (itemId: string) => void;
    equipWeapon: (itemId: string | null) => void;

    // Combat
    combatState: CombatState | null;
    startCombat: (enemyId: string, encounterId?: string) => void;
    startCombatEncounter: (encounterId: string) => void;
    resolveCombatEncounter: (encounterId: string, method: ConflictResolution) => void;
    applyCombatEncounterRewards: (encounterId: string) => void;
    combatAction: (action: CombatActionType) => void;
    endCombat: () => void;

    // Safehouse Actions
    depositStash: (amount: number) => void;
    withdrawStash: (amount: number) => void;
    setOutfit: (itemId: string) => void;

    // Economy Actions
    takeLoan: (amount: number) => void;
    repayLoan: (amount: number) => void;
    buyIntel: (sourceId: string) => void;
    buyFromVendor: (vendorId: string, itemId: string) => void;
    buyHousingUpgrade: (upgradeId: string) => void;
    performCityActivity: (activityId: string) => void;
    getFinanceContracts: () => ContractOffer[];

    // Helpers
    getNetWorth: () => number;
    getItemPrice: (itemId: string) => number;

    // System
    initializeCharacter: (name: string, stats: Stats, traits: string[]) => void;
    incrementPlayTime: (ms: number) => void;
    setGameMode: (mode: 'fun' | 'real') => void;
    resetGame: () => void;

    // Multiplayer
    remotePlayers: Record<string, RemotePlayer>;
    getEffectiveStats: () => Stats;
    updateRemotePlayer: (id: string, data: Partial<RemotePlayer>) => void;
    removeRemotePlayer: (id: string) => void;
    exportSave: () => void;
    importSave: (json: string) => void;
    unlockAchievement: (id: string) => void;
}

export type GameStore = Omit<GameState, 'combatState' | 'remotePlayers'> & GameActions;

type LegacyStats = Partial<Stats> & {
    xp?: number;
    level?: number;
    skillPoints?: number;
    health?: number;
    maxHealth?: number;
};

type LegacyPersistedState = {
    stats?: LegacyStats;
    playerName?: string;
    traits?: string[];
    housing?: GameState['player']['housing'];
    day?: number;
    time?: number;
    location?: string;
    gameMode?: GameState['gameMode'];
    introSeen?: boolean;
    inventory?: GameState['inventory'];
    quests?: GameState['quests'];
    market?: Partial<GameState['market']> & {
        stocks?: Partial<GameState['market']['stocks']>;
    };
};

const createQuestState = (questId: string): QuestState | null => {
    const quest = QUESTS[questId];
    if (!quest) return null;

    return {
        id: questId,
        status: 'active',
        objectives: Object.fromEntries(quest.objectives.map((objective) => [objective.id, false]))
    };
};

export const normalizeLocationId = (locationId?: string): string =>
    locationId && (LOCATIONS[locationId] || MAP_DEFINITIONS[locationId]) ? locationId : 'the_block';

const normalizeFinanceState = (finance?: Partial<GameState['finance']>): GameState['finance'] => ({
    ...INITIAL_STATE.finance,
    ...(finance || {}),
    debtNpcIds: Array.isArray(finance?.debtNpcIds) ? finance.debtNpcIds : []
});

// Daily loan upkeep: countdown days, charge penalties, escalate defaults.
const applyLoanDailyTick = (finance: GameState['finance'], cash: number, housingUpgrades: string[]): GameState['finance'] => {
    if (finance.loanBalance <= 0) return { ...finance, loanDaysRemaining: 0 };
    const hasStashLiners = housingUpgrades.includes('stash_liners');
    const daysRemaining = Math.max(0, finance.loanDaysRemaining - 1);
    if (daysRemaining > 0) return { ...finance, loanDaysRemaining: daysRemaining };

    // Missed the deadline: penalty payment from cash, then default escalation.
    const penalty = Math.ceil(finance.loanBalance * 0.1);
    const paid = Math.min(penalty, Math.max(0, cash - (hasStashLiners ? 0 : 0)));
    const remainingBalance = finance.loanBalance - paid;
    const defaulted = remainingBalance > 0;
    return {
        ...finance,
        loanBalance: defaulted ? remainingBalance : 0,
        loanDaysRemaining: defaulted ? 3 : 0,
        interestRate: Math.min(0.5, finance.interestRate + (defaulted ? 0.1 : 0)),
        defaults: defaulted ? finance.defaults + 1 : finance.defaults
    };
};

const normalizeCombatRecord = (record?: Partial<GameState['combatRecord']>): GameState['combatRecord'] => ({
    ...INITIAL_STATE.combatRecord,
    ...(record || {}),
    rivalWins: { ...INITIAL_STATE.combatRecord.rivalWins, ...(record?.rivalWins || {}) },
    factionWins: { ...INITIAL_STATE.combatRecord.factionWins, ...(record?.factionWins || {}) },
    completedEncounterIds: Array.isArray(record?.completedEncounterIds) ? record.completedEncounterIds : [],
    nonCombatResolutions: { ...INITIAL_STATE.combatRecord.nonCombatResolutions, ...(record?.nonCombatResolutions || {}) }
});

const normalizePlayerState = (player?: Partial<GameState['player']>): GameState['player'] => ({
    ...INITIAL_STATE.player,
    ...(player || {}),
    stats: { ...INITIAL_STATE.player.stats, ...(player?.stats || {}) },
    housing: { ...INITIAL_STATE.player.housing, ...(player?.housing || {}) },
    energy: typeof player?.energy === 'number' ? player.energy : INITIAL_STATE.player.energy,
    maxEnergy: typeof player?.maxEnergy === 'number' ? player.maxEnergy : INITIAL_STATE.player.maxEnergy
});

const normalizeWorldState = (world?: Partial<GameState['world']>): GameState['world'] => ({
    ...INITIAL_STATE.world,
    ...(world || {}),
    locationId: normalizeLocationId(world?.locationId)
});

const normalizeClubState = (club?: Partial<GameState['club']>): GameState['club'] => ({
    ...INITIAL_STATE.club,
    ...(club || {}),
    factionTrust: { ...INITIAL_STATE.club.factionTrust, ...(club?.factionTrust || {}) },
    eventUses: { ...(club?.eventUses || {}) }
});

const normalizeTutorialState = (tutorial?: Partial<GameState['tutorial']>): GameState['tutorial'] => ({
    ...INITIAL_STATE.tutorial,
    ...(tutorial || {}),
    step: typeof tutorial?.step === 'number' ? Math.max(0, Math.min(5, tutorial.step)) : INITIAL_STATE.tutorial.step
});

const normalizeRandomEventsState = (randomEvents?: Partial<GameState['randomEvents']>): GameState['randomEvents'] => ({
    ...INITIAL_STATE.randomEvents,
    ...(randomEvents || {}),
    lastTriggeredAt: { ...INITIAL_STATE.randomEvents.lastTriggeredAt, ...(randomEvents?.lastTriggeredAt || {}) },
    eventCountsToday: { ...INITIAL_STATE.randomEvents.eventCountsToday, ...(randomEvents?.eventCountsToday || {}) }
});

const normalizeStreetEncountersState = (street?: Partial<GameState['streetEncounters']>): GameState['streetEncounters'] => ({
    ...INITIAL_STATE.streetEncounters,
    ...(street || {}),
    encounteredIds: { ...INITIAL_STATE.streetEncounters.encounteredIds, ...(street?.encounteredIds || {}) },
    resolved: { ...INITIAL_STATE.streetEncounters.resolved, ...(street?.resolved || {}) },
    active: null // Pending encounters are session-only and never restored from saves
});

const normalizeContractState = (contracts?: Partial<GameState['contracts']>): GameState['contracts'] => {
    const source = contracts || {};
    return {
        ...INITIAL_STATE.contracts,
        ...source,
        offers: Array.isArray(source.offers) ? source.offers : [],
        acceptedIds: Array.isArray(source.acceptedIds) ? source.acceptedIds : [],
        statuses: source.statuses && typeof source.statuses === 'object' ? source.statuses : {},
        completedIds: Array.isArray(source.completedIds) ? source.completedIds : [],
        expiredIds: Array.isArray(source.expiredIds) ? source.expiredIds : [],
        failedIds: Array.isArray(source.failedIds) ? source.failedIds : []
    };
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...INITIAL_STATE,
            combatState: null,
            outfit: 'street_clothes', // Default outfit
            remotePlayers: {}, // Multiplayer
            pricePollingId: null,

            // --- ACTIONS ---

            getEffectiveStats: () => {
                const s = get();
                const base = s.player.stats;
                const equippedId = s.inventory.equippedWeapon;
                if (!equippedId) return base;
                const item = ITEMS[equippedId];
                if (!item || !item.effects) return base;

                const effective = { ...base };
                item.effects.forEach(eff => {
                    const key = eff.stat as keyof Stats;
                    if (key in effective) {
                        (effective[key] as number) += eff.value;
                    }
                });
                return effective;
            },

            updateRemotePlayer: (id: string, data: Partial<RemotePlayer>) => {
                set((state: GameStore) => ({
                    remotePlayers: {
                        ...state.remotePlayers,
                        [id]: { ...state.remotePlayers[id], ...data }
                    }
                }));
            },

            removeRemotePlayer: (id: string) => {
                const newPlayers = { ...get().remotePlayers };
                delete newPlayers[id];
                set({ remotePlayers: newPlayers });
            },

            unlockAchievement: (id: string) => {
                const s = get();
                if (s.achievements[id]) return; // Already unlocked

                set((state: GameStore) => ({
                    achievements: {
                        ...state.achievements,
                        [id]: Date.now()
                    }
                }));

                const achievement = ACHIEVEMENTS[id];
                if (achievement) {
                    useUIStore.getState().toast({
                        title: 'ACHIEVEMENT UNLOCKED',
                        description: achievement.title,
                        variant: 'success'
                    });
                }
            },

            depositStash: (amount) => {
                const state = get();
                if (state.player.stats.worth >= amount) {
                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth - amount },
                            housing: { ...s.player.housing, stash: (s.player.housing.stash || 0) + amount }
                        }
                    }));
                    useUIStore.getState().addNotification(`Stashed $${amount}.`);
                } else {
                    useUIStore.getState().addNotification("Not enough cash!");
                }
            },

            withdrawStash: (amount) => {
                const state = get();
                if ((state.player.housing.stash || 0) >= amount) {
                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth + amount },
                            housing: { ...s.player.housing, stash: s.player.housing.stash - amount }
                        }
                    }));
                    useUIStore.getState().addNotification(`Withdrew $${amount}.`);
                } else {
                    useUIStore.getState().addNotification("Not enough in stash!");
                }
            },

            fetchPrices: async () => {
                try {
                    const res = await fetch('/api/market/prices');
                    if (!res.ok) throw new Error('API Error');

                    const data = await res.json();

                    // Update Prices (using new response shape)
                    // Server returns: { prices: { BTC: { usd: 123, change24h: 1 }, ... }, asOf: 12345 }
                    const newPrices: Record<string, number> = {};
                    const newTrends: Record<string, 'bull' | 'bear' | 'flat'> = {};

                    if (data.prices) {
                        const prices = data.prices as Record<string, { usd: number, change24h: number }>;
                        Object.entries(prices).forEach(([symbol, val]) => {
                            newPrices[symbol] = val.usd;
                            newTrends[symbol] = val.change24h > 2 ? 'bull' : val.change24h < -2 ? 'bear' : 'flat';
                        });
                    }

                    set((state) => ({
                        market: {
                            ...state.market,
                            prices: { ...state.market.prices, ...newPrices },
                            trends: { ...state.market.trends, ...newTrends },
                            lastUpdate: data.asOf
                        }
                    }));
                } catch (e) {
                    console.error('Failed to fetch prices', e);
                }
            },

            startPricePolling: () => {
                const state = get();
                if (state.pricePollingId) return; // Already polling

                // Initial fetch
                get().fetchPrices();

                const id = setInterval(() => {
                    get().fetchPrices();
                }, 15000); // Poll 15s

                set({ pricePollingId: id });
            },

            stopPricePolling: () => {
                const state = get();
                if (state.pricePollingId) {
                    clearInterval(state.pricePollingId);
                    set({ pricePollingId: null });
                }
            },

            setOutfit: (itemId) => {
                const state = get();
                if (InventorySystem.hasItem(state.inventory, itemId)) {
                    set({ outfit: itemId });
                    useUIStore.getState().addNotification(`Changed into ${ITEMS[itemId]?.name || 'new clothes'}.`);
                } else {
                    // Fallback/Error (should be handled by UI)
                    set({ outfit: itemId }); // Allow setting default/custom even if not in inventory? Strict for now.
                }
            },

            getItemPrice: (itemId) => {
                const item = ITEMS[itemId];
                if (!item) return 0;
                const state = get();
                const discount = Math.max(...(item.discountFlags || [])
                    .filter((entry) => state.contentFlags[entry.flag])
                    .map((entry) => entry.percent), 0);
                return Math.floor(item.cost * (1 - discount / 100));
            },

            getNetWorth: () => {
                const s = get();
                const cash = s.player.stats.worth;
                const stash = s.player.housing.stash || 0;
                let cryptoValue = 0;

                Object.entries(s.market.portfolio).forEach(([symbol, qty]) => {
                    const price = s.market.prices[symbol] || 0;
                    cryptoValue += (price * qty);
                });

                return Math.floor(cash + stash + cryptoValue);
            },


            modifyStat: (stat, amount) => {
                const store = get();
                if (stat === 'karma') {
                    store.modifyKarma(amount);
                    return;
                }
                if (stat === 'worth') {
                    set((state) => ({
                        player: {
                            ...state.player,
                            stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth + amount) }
                        }
                    }));
                    get().checkQuestObjectives('stat_change', undefined);
                    return;
                }

                set((state) => ({
                    player: {
                        ...state.player,
                        stats: {
                            ...state.player.stats,
                            [stat]: StatEngine.calculateChange(state.player.stats[stat], amount)
                        }
                    }
                }));
                get().checkQuestObjectives('stat_change', undefined);
            },

            modifyKarma: (amount) => {
                set((state) => ({
                    player: {
                        ...state.player,
                        stats: {
                            ...state.player.stats,
                            karma: KarmaSystem.update(state.player.stats.karma, amount)
                        }
                    }
                }));
            },

            gainXp: (amount) => {
                const state = get();
                const p = state.player;
                let newXp = p.xp + amount;
                let newLevel = p.level;
                let newSp = p.skillPoints;
                let newMaxHealth = p.maxHealth;

                // useUIStore.getState().addNotification(`+${amount} XP`); // Too spammy for toasts? Maybe keep or remove. Removing to reduce noise.

                // Level Up Logic (Simple while loop for multi-level)
                while (true) {
                    let xpNeeded = newLevel * 100;
                    if (newLevel === 1) xpNeeded = 50;
                    else if (newLevel === 2) xpNeeded = 100;
                    else if (newLevel === 3) xpNeeded = 200;
                    if (newXp >= xpNeeded) {
                        newXp -= xpNeeded;
                        newLevel++;
                        newSp += 5;
                        newMaxHealth += 10;
                        useUIStore.getState().toast({
                            title: 'LEVEL UP!',
                            description: `You are now level ${newLevel}. Skill Points +5, Max Health +10.`,
                            variant: 'success' // or 'angel'
                        });
                    } else {
                        break;
                    }
                }

                set(s => ({
                    player: {
                        ...s.player,
                        xp: newXp,
                        level: newLevel,
                        skillPoints: newSp,
                        maxHealth: newMaxHealth
                    }
                }));
            },
            spendSkillPoint: (stat) => {
                const state = get();
                if (state.player.skillPoints > 0) {
                    set(s => ({
                        player: {
                            ...s.player,
                            stats: {
                                ...s.player.stats,
                                [stat]: s.player.stats[stat] + 1
                            },
                            skillPoints: s.player.skillPoints - 1
                        }
                    }));
                    useUIStore.getState().addNotification(`Upgraded ${stat.toUpperCase()}!`);
                }
            },

            performClubActivity: (activity) => {
                const activities: Record<ClubActivityId, { label: string; faction: FactionId; npcId: string; energy: number; time: number; money: number; stat: keyof Stats; statAmount: number; heat: number }> = {
                    CLUB_SOCIAL: { label: 'Community Mixer', faction: 'angel', npcId: 'npc_club_host_aria', energy: 10, time: 45, money: 0, stat: 'charisma', statAmount: 1, heat: 1 },
                    CLUB_NETWORK: { label: 'Signal Exchange', faction: 'ghost', npcId: 'npc_club_dj_echo', energy: 12, time: 60, money: 20, stat: 'intelligence', statAmount: 1, heat: 2 },
                    CLUB_BACKROOM: { label: 'Backroom Negotiation', faction: 'demon', npcId: 'npc_club_bouncer_kane', energy: 18, time: 75, money: 35, stat: 'power', statAmount: 1, heat: 4 }
                };
                const selected = activities[activity];
                const state = get();
                if (!selected) return;
                if (state.player.energy < selected.energy) {
                    useUIStore.getState().addNotification(`Too tired for ${selected.label}. Need ${selected.energy} Energy.`);
                    return;
                }
                if (state.player.stats.worth < selected.money) {
                    useUIStore.getState().addNotification(`You need $${selected.money} for ${selected.label}.`);
                    return;
                }

                const npcState = NPCSystem.getOrInitState(selected.npcId, state.npcs);
                set((current) => ({
                    player: {
                        ...current.player,
                        energy: current.player.energy - selected.energy,
                        stats: {
                            ...current.player.stats,
                            worth: current.player.stats.worth - selected.money,
                            [selected.stat]: current.player.stats[selected.stat] + selected.statAmount
                        }
                    },
                    club: {
                        ...current.club,
                        reputation: Math.min(100, current.club.reputation + 1),
                        heat: Math.min(100, Math.max(0, current.club.heat + selected.heat)),
                        lastActivityDay: current.world.day,
                        factionTrust: {
                            ...current.club.factionTrust,
                            [selected.faction]: Math.min(100, current.club.factionTrust[selected.faction] + 1)
                        }
                    },
                    npcs: {
                        ...current.npcs,
                        [selected.npcId]: {
                            ...npcState,
                            relationship: Math.min(100, npcState.relationship + 2),
                            trust: Math.min(100, npcState.trust + 1),
                            loyalty: Math.min(100, npcState.loyalty + (selected.faction === 'demon' ? 1 : 0)),
                            lastInteraction: Date.now(),
                            history: [...npcState.history.slice(-7), `club:${activity}`]
                        }
                    }
                }));
                get().advanceTime(selected.time);
                get().checkQuestObjectives('action_complete', activity);
                useUIStore.getState().toast({
                    title: 'CLUB ACTIVITY COMPLETE',
                    description: `${selected.label}: -${selected.energy} Energy, +${selected.statAmount} ${selected.stat}. Heat is now ${get().club.heat}.`,
                    variant: activity === 'CLUB_BACKROOM' ? 'demon' : activity === 'CLUB_NETWORK' ? 'ghost' : 'angel'
                });
            },

            performClubEvent: (eventId) => {
                const state = get();
                const event = CLUB_EVENTS.find((candidate) => candidate.id === eventId);
                if (!event || !isClubEventAvailable(event, state.club)) {
                    useUIStore.getState().addNotification('That Club event is not available to your current reputation or heat.');
                    return;
                }
                if (state.club.eventUses[eventId] === state.world.day) {
                    useUIStore.getState().addNotification('You have already handled this Club event tonight.');
                    return;
                }
                if (state.player.energy < event.energyCost) {
                    useUIStore.getState().addNotification(`Too tired for ${event.title}. Need ${event.energyCost} Energy.`);
                    return;
                }
                if (state.player.stats.worth < event.cashCost) {
                    useUIStore.getState().addNotification(`You need $${event.cashCost} for ${event.title}.`);
                    return;
                }

                set((current) => ({
                    player: {
                        ...current.player,
                        energy: current.player.energy - event.energyCost,
                        stats: { ...current.player.stats, worth: current.player.stats.worth - event.cashCost }
                    },
                    club: {
                        ...current.club,
                        reputation: Math.min(100, current.club.reputation + event.rewards.reputation),
                        heat: Math.min(100, Math.max(0, current.club.heat + event.rewards.heat)),
                        lastActivityDay: current.world.day,
                        eventUses: { ...current.club.eventUses, [eventId]: current.world.day },
                        factionTrust: Object.entries(event.rewards.factionTrust || {}).reduce(
                            (trust, [faction, amount]) => ({ ...trust, [faction]: Math.min(100, (trust[faction as FactionId] || 0) + (amount || 0)) }),
                            current.club.factionTrust
                        )
                    }
                }));
                if (event.rewards.cash) get().modifyStat('worth', event.rewards.cash);
                if (event.rewards.xp) get().gainXp(event.rewards.xp);
                get().advanceTime(event.timeCost);
                useUIStore.getState().toast({
                    title: 'NIGHTLIFE EVENT RESOLVED',
                    description: `${event.title}: +${event.rewards.reputation} Club reputation, heat ${get().club.heat}.`,
                    variant: event.faction
                });
            },

            advanceTutorial: () => {
                set((state) => state.tutorial.step >= 5
                    ? { tutorial: { ...state.tutorial, completed: true } }
                    : { tutorial: { ...state.tutorial, step: state.tutorial.step + 1 } });
            },

            skipTutorial: () => {
                set((state) => ({ tutorial: { ...state.tutorial, completed: true, skipped: true } }));
                useUIStore.getState().addNotification('Tutorial skipped. You can replay it from the system menu.');
            },

            replayTutorial: () => {
                set({ tutorial: { step: 0, completed: false, skipped: false } });
                useUIStore.getState().addNotification('World tutorial restarted.');
            },

            dispatchAction: (actionId) => {
                const state = get();
                // Map 'will' to energy for checks, per ActionResolver logic
                const result = ActionResolver.resolveId(
                    actionId,
                    state.player.stats,
                    state.player.traits,
                    state.player.energy,
                    state.player.stats.worth
                );

                if (result.success) {
                    const actions = get();

                    // 1. Pay Costs
                    if (result.cost) {
                        const { money, will, time } = result.cost;

                        if (money) actions.modifyStat('worth', -money);

                        // ActionResolver maps 'will' cost to Energy
                        if (will) {
                            set(s => ({
                                player: {
                                    ...s.player,
                                    energy: Math.max(0, s.player.energy - will)
                                }
                            }));
                        }

                        if (time) actions.advanceTime(time, actionId.startsWith('TRAIN_') ? 'train' : actionId.startsWith('STUDY_') ? 'study' : 'any', actionId);
                    }

                    // 2. Apply Rewards
                    if (result.rewards) {
                        const { money, xp, energy, stats } = result.rewards;

                        if (money) actions.modifyStat('worth', money);
                        if (xp) actions.gainXp(xp);

                        if (energy) {
                            set(s => ({
                                player: {
                                    ...s.player,
                                    energy: Math.min(s.player.maxEnergy, s.player.energy + energy)
                                }
                            }));
                        }

                        if (stats) {
                            Object.entries(stats).forEach(([stat, val]) => {
                                actions.modifyStat(stat as keyof Stats, val || 0);
                            });
                        }
                    }

                    useUIStore.getState().toast({
                        title: 'Action Complete',
                        description: result.log,
                        variant: 'success'
                    });

                    actions.checkQuestObjectives('action_complete', actionId);
                } else {
                    useUIStore.getState().toast({
                        title: 'Action Failed',
                        description: result.log,
                        variant: 'danger'
                    });
                }
            },

            sellItem: (itemId) => {
                const item = ITEMS[itemId];
                if (!item) return;

                const { inventory } = get();
                const count = inventory.items[itemId] || 0;

                if (count > 0) {
                    const sellPrice = Math.floor(item.cost * 0.5);
                    const newItems = { ...inventory.items, [itemId]: count - 1 };

                    let newEquipped = inventory.equippedWeapon;
                    if (newEquipped === itemId && newItems[itemId] === 0) {
                        newEquipped = null;
                    }

                    set((s) => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth + sellPrice }
                        },
                        inventory: {
                            ...s.inventory,
                            items: newItems,
                            equippedWeapon: newEquipped
                        }
                    }));

                    useUIStore.getState().toast({
                        title: 'Asset Liquidated',
                        description: `Sold ${item.name} for $${sellPrice}`,
                        variant: 'neutral'
                    });
                }
            },

            advanceTime: (minutes, context = 'any', activity) => {
                const state = get();
                const current = state.world.time;
                const newTime = Math.min(1560, current + minutes);
                const randomState = { ...state.randomEvents, lastOutcome: undefined };
                let eventTriggered = false;

                // Long actions create ordinary opportunities; named activities also
                // create a smaller, targeted chance so the city can react immediately.
                let baseChance = 0;
                if (minutes >= 360) baseChance = 0.08;
                else if (minutes >= 180) baseChance = 0.04;
                else if (context !== 'any') baseChance = 0.07;
                if (context === 'travel' && minutes >= 15) baseChance = Math.max(baseChance, 0.05);

                if (baseChance > 0 && randomState.triggeredToday < 3 && Math.random() < baseChance + randomState.consecutiveMisses * 0.02) {
                    const totalMinutesCurrent = state.world.day * 1440 + current;
                    const validEvents = RANDOM_EVENTS.filter((event) => {
                        if (event.requirements && !event.requirements(state)) return false;
                        if (!event.contexts.includes('any') && !event.contexts.includes(context)) return false;
                        if (event.locations && !event.locations.includes(state.world.locationId)) return false;
                        if (event.activities && (!activity || !event.activities.includes(activity))) return false;
                        if (event.timeRange && (current < event.timeRange[0] || current > event.timeRange[1])) return false;
                        if ((randomState.eventCountsToday[event.id] || 0) >= event.maxPerDay) return false;
                        const lastRun = randomState.lastTriggeredAt[event.id] || -999999;
                        return totalMinutesCurrent - lastRun >= event.cooldownBlocks * 360;
                    });

                    if (validEvents.length > 0) {
                        const totalWeight = validEvents.reduce((sum, event) => sum + event.weight, 0);
                        let roll = Math.random() * totalWeight;
                        let selectedEvent = validEvents[0];
                        for (const event of validEvents) {
                            roll -= event.weight;
                            if (roll <= 0) {
                                selectedEvent = event;
                                break;
                            }
                        }
                        const result = selectedEvent.apply(state);
                        set((currentState) => ({
                            ...currentState,
                            ...(result.patch as Partial<GameStore>),
                            randomEvents: {
                                ...currentState.randomEvents,
                                triggeredToday: currentState.randomEvents.triggeredToday + 1,
                                consecutiveMisses: 0,
                                lastOutcome: selectedEvent.id,
                                lastTriggeredAt: { ...currentState.randomEvents.lastTriggeredAt, [selectedEvent.id]: totalMinutesCurrent },
                                eventCountsToday: { ...currentState.randomEvents.eventCountsToday, [selectedEvent.id]: (currentState.randomEvents.eventCountsToday[selectedEvent.id] || 0) + 1 }
                            },
                            world: { ...currentState.world, time: newTime }
                        }));
                        useUIStore.getState().toast({ title: `EVENT: ${result.toast.title}`, description: result.toast.description, variant: 'warning' });
                        eventTriggered = true;
                    }
                }

                if (!eventTriggered) {
                    set((currentState) => ({
                        world: { ...currentState.world, time: newTime },
                        randomEvents: {
                            ...currentState.randomEvents,
                            lastOutcome: undefined,
                            consecutiveMisses: baseChance > 0 ? currentState.randomEvents.consecutiveMisses + 1 : currentState.randomEvents.consecutiveMisses
                        }
                    }));
                }
            },

            newDay: () => {
                let defaulted = false;
                set((state) => {
                    const mattressBonus = state.player.housing.upgrades.includes('better_mattress') ? 10 : 0;
                    const financePatch = applyLoanDailyTick(state.finance, state.player.stats.worth, state.player.housing.upgrades);
                    defaulted = financePatch.defaults > state.finance.defaults;
                    return {
                    world: {
                        ...state.world,
                        day: state.world.day + 1,
                        time: 360 // 6:00 AM
                    },
                    player: {
                        ...state.player,
                        stats: {
                            ...state.player.stats,
                            will: 100, // Restore Will
                            worth: defaulted
                                ? Math.max(0, state.player.stats.worth - Math.ceil(state.finance.loanBalance * 0.1))
                                : state.player.stats.worth
                        },
                        energy: 100 + mattressBonus // Restore Energy (new prop)
                    },
                    club: {
                        ...state.club,
                        heat: Math.max(0, state.club.heat - 2),
                        lastActivityDay: state.world.day + 1,
                        eventUses: {}
                    },
                    randomEvents: {
                        ...state.randomEvents,
                        triggeredToday: 0,
                        lastDay: state.world.day,
                        eventCountsToday: {},
                        lastOutcome: undefined
                    },
                    finance: financePatch
                };
                });
                if (defaulted) {
                    useUIStore.getState().toast({
                        title: 'LOAN DEFAULT',
                        description: 'You missed a payment. Cash was seized and lenders raised your rate.',
                        variant: 'danger'
                    });
                    get().modifyFactionReputation('demon', -2);
                }
                get().refreshContracts();
            },

            canAccess: (accessId) => {
                return canAccessContent(get(), accessId as Parameters<typeof canAccessContent>[1]);
            },

            getAccessReason: (accessId) => {
                return accessReason(get(), accessId as Parameters<typeof accessReason>[1]);
            },

            setLocation: (locationId) => {
                const state = get();
                const accessId = locationAccessId(locationId);
                if (accessId && !canAccessContent(state, accessId)) {
                    useUIStore.getState().toast({
                        title: 'ACCESS DENIED',
                        description: accessReason(state, accessId) || 'This location is not available yet.',
                        variant: 'warning'
                    });
                    return false;
                }
                if (state.world.locationId === 'trading_floor' && locationId !== 'trading_floor') {
                    // Leaving trading floor
                }
                if (locationId === 'trading_floor') {
                    get().initMarket();
                }
                set(s => ({
                    world: { ...s.world, locationId: locationId }
                }));
                get().checkQuestObjectives('travel', locationId);
                // Finance travel contracts (e.g. Courier Brief) complete on arrival.
                const travelFinanceContract = get().getFinanceContracts().find((offer) =>
                    offer.objective.trigger === 'travel' && offer.objective.target === locationId
                );
                if (travelFinanceContract) {
                    get().completeFinanceContract(travelFinanceContract.id);
                }
                get().refreshContracts();
                return true;
            },

            initMarket: () => {
                let state = get();

                // MIGRATION: Ensure stocks object exists if loading old save
                if (!state.market.stocks) {
                    set(s => ({
                        market: {
                            ...s.market,
                            stocks: {
                                prices: {},
                                trends: {},
                                portfolio: {},
                                history: {}
                            }
                        }
                    }));
                    state = get(); // Refresh local reference
                }

                // MIGRATION: Ensure priceHistory exists and has data
                if (!state.market.priceHistory || Object.keys(state.market.priceHistory).length === 0) {
                    const now = Date.now();
                    const dummyHistory: Record<string, { t: number, usd: number }[]> = {};

                    // hydration from existing prices
                    if (Object.keys(state.market.prices).length > 0) {
                        Object.entries(state.market.prices).forEach(([sym, price]) => {
                            dummyHistory[sym] = [
                                { t: now - 60000, usd: price },
                                { t: now, usd: price }
                            ];
                        });

                        set(s => ({
                            market: { ...s.market, priceHistory: dummyHistory }
                        }));
                        state = get(); // Refresh
                    }
                }

                // If prices empty, init base prices
                if (Object.keys(state.market.prices).length === 0) {
                    const initialPrices: Record<string, number> = {};
                    const initialTrends: Record<string, 'bull' | 'bear' | 'flat'> = {};
                    const initialHistory: Record<string, number[]> = {};
                    const initialPriceHistory: Record<string, { t: number, usd: number }[]> = {};

                    const now = Date.now();
                    Object.values(CRYPTO).forEach(asset => {
                        initialPrices[asset.symbol] = asset.basePrice;
                        initialTrends[asset.symbol] = 'flat';
                        initialHistory[asset.symbol] = [asset.basePrice];
                        // Pre-fill history to avoid "Building Data..."
                        initialPriceHistory[asset.symbol] = [
                            { t: now - 60000, usd: asset.basePrice },
                            { t: now, usd: asset.basePrice }
                        ];
                    });

                    set(s => ({
                        market: {
                            ...s.market,
                            prices: initialPrices,
                            trends: initialTrends,
                            history: initialHistory,
                            priceHistory: initialPriceHistory,
                            stocks: {
                                prices: {},
                                trends: {},
                                portfolio: {},
                                history: {}
                            },
                            lastUpdate: s.world.day
                        }
                    }));
                }

                // Stocks Init (Separate check)
                if (Object.keys(state.market.stocks.prices).length === 0) {
                    const initialStockPrices: Record<string, number> = {};
                    const initialStockTrends: Record<string, 'bull' | 'bear' | 'flat'> = {};
                    const initialStockHistory: Record<string, number[]> = {};

                    Object.values(STOCKS).forEach(asset => {
                        initialStockPrices[asset.symbol] = asset.basePrice;
                        initialStockTrends[asset.symbol] = 'flat';
                        initialStockHistory[asset.symbol] = [asset.basePrice];
                    });

                    set(s => ({
                        market: {
                            ...s.market,
                            stocks: {
                                prices: initialStockPrices,
                                trends: initialStockTrends,
                                history: initialStockHistory,
                                portfolio: s.market.stocks.portfolio // keep existing portfolio
                            }
                        }
                    }));
                }
            },

            updateMarket: () => {
                const state = get();
                const newPrices = { ...state.market.prices };
                const newTrends = { ...state.market.trends };
                const newHistory = { ...state.market.history };

                // 1. Handle Events (Random chance for a new event)
                let currentEvent = state.market.activeEvent;
                if (Math.random() > 0.7) {
                    currentEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
                } else if (Math.random() > 0.8) {
                    currentEvent = undefined; // Event ends
                }

                Object.values(CRYPTO).forEach(asset => {
                    const currentPrice = newPrices[asset.symbol] || asset.basePrice;

                    // 2. Base fluctuation
                    const baseChange = (Math.random() - 0.5) * 2 * asset.volatility;

                    // 3. Event Impact
                    let eventMultiplier = 1;
                    if (currentEvent && currentEvent.impacts[asset.symbol]) {
                        eventMultiplier = currentEvent.impacts[asset.symbol];
                        // If it's a pump ( > 1), add extra volatility
                        if (eventMultiplier > 1) eventMultiplier += (Math.random() * 0.1);
                        // If it's a dump ( < 1), add extra panic
                        if (eventMultiplier < 1) eventMultiplier -= (Math.random() * 0.05);
                    }

                    let newPrice = currentPrice * (1 + baseChange) * eventMultiplier;

                    // Cap/Floor
                    newPrice = Math.max(0.01, newPrice);

                    const finalPrice = parseFloat(newPrice.toFixed(2));
                    newPrices[asset.symbol] = finalPrice;
                    newTrends[asset.symbol] = newPrice > currentPrice ? 'bull' : newPrice < currentPrice ? 'bear' : 'flat';

                    // Update History
                    const history = [...(newHistory[asset.symbol] || [])];
                    history.push(finalPrice);
                    if (history.length > 20) history.shift();
                    newHistory[asset.symbol] = history;
                });

                // --- UPDATE STOCKS ---
                const newStockPrices = { ...state.market.stocks.prices };
                const newStockTrends = { ...state.market.stocks.trends };
                const newStockHistory = { ...state.market.stocks.history };

                Object.values(STOCKS).forEach(asset => {
                    const currentPrice = newStockPrices[asset.symbol] || asset.basePrice;
                    const baseChange = (Math.random() - 0.5) * 2 * asset.volatility;

                    // Event impact could be added here too

                    let newPrice = currentPrice * (1 + baseChange);
                    newPrice = Math.max(1.0, newPrice); // Stocks usually don't go to 0.01 like meme coins

                    const finalPrice = parseFloat(newPrice.toFixed(2));
                    newStockPrices[asset.symbol] = finalPrice;
                    newStockTrends[asset.symbol] = newPrice > currentPrice ? 'bull' : newPrice < currentPrice ? 'bear' : 'flat';

                    const history = [...(newStockHistory[asset.symbol] || [])];
                    history.push(finalPrice);
                    if (history.length > 20) history.shift();
                    newStockHistory[asset.symbol] = history;
                });

                set(s => ({
                    market: {
                        ...s.market,
                        prices: newPrices,
                        trends: newTrends,
                        history: newHistory,
                        stocks: {
                            ...s.market.stocks,
                            prices: newStockPrices,
                            trends: newStockTrends,
                            history: newStockHistory
                        },
                        lastUpdate: s.world.day,
                        activeEvent: currentEvent
                    }
                }));

                if (currentEvent) {
                    useUIStore.getState().toast({
                        title: 'Market Update',
                        description: `${currentEvent.title}!`,
                        variant: 'warning'
                    });
                }
            },

            buyCrypto: (symbol, quantity) => {
                const state = get();
                const price = state.market.prices[symbol];
                if (!price) return;

                // Trade Fee Logic
                let feePercent = 0.02; // Base 2%
                if (state.player.traits.includes('Wall Street Wizard')) feePercent = 0.005; // 0.5% for wizards

                // PHONE MODE FEE? (If implemented later, maybe higher fee)

                const baseCost = price * quantity;
                const fee = baseCost * feePercent;
                const totalCost = baseCost + fee;

                if (state.player.stats.worth >= totalCost) {
                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth - totalCost }
                        },
                        market: {
                            ...s.market,
                            portfolio: {
                                ...s.market.portfolio,
                                [symbol]: (s.market.portfolio[symbol] || 0) + quantity
                            }
                        }
                    }));
                    useUIStore.getState().addNotification(`Bought ${quantity} ${symbol} for $${baseCost.toFixed(2)} ($${fee.toFixed(2)} fee)`);
                    get().advanceTime(0, 'economy', 'MARKET_TRADE');
                    get().checkQuestObjectives('action_complete', 'MARKET_TRADE');
                } else {
                    useUIStore.getState().addNotification("Insufficient funds (incl. fees)!");
                }
            },

            buyStock: (symbol, quantity) => {
                const state = get();
                // Check License
                if (state.quests['stock_license']?.status !== 'completed') {
                    useUIStore.getState().addNotification("Access Denied: Broker License Required.");
                    return;
                }

                const price = state.market.stocks.prices[symbol];
                if (!price) return;

                const baseCost = price * quantity;
                const fee = 10; // Flat fee for stocks? Or Commission. Let's say $10 per trade.
                const totalCost = baseCost + fee;

                if (state.player.stats.worth >= totalCost) {
                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth - totalCost }
                        },
                        market: {
                            ...s.market,
                            stocks: {
                                ...s.market.stocks,
                                portfolio: {
                                    ...s.market.stocks.portfolio,
                                    [symbol]: (s.market.stocks.portfolio[symbol] || 0) + quantity
                                }
                            }
                        }
                    }));
                    useUIStore.getState().addNotification(`Bought ${quantity} ${symbol} for $${baseCost.toFixed(2)} (+$10 fee)`);
                    get().checkQuestObjectives('action_complete', 'MARKET_TRADE');
                } else {
                    useUIStore.getState().addNotification("Insufficient funds!");
                }
            },

            sellCrypto: (symbol, quantity) => {
                const state = get();
                const price = state.market.prices[symbol];
                const owned = state.market.portfolio[symbol] || 0;

                if (owned >= quantity) {
                    // Trade Fee Logic
                    let feePercent = 0.02; // Base 2%
                    if (state.player.traits.includes('Wall Street Wizard')) feePercent = 0.005;

                    const baseRevenue = price * quantity;
                    const fee = baseRevenue * feePercent;
                    const netRevenue = baseRevenue - fee;

                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth + netRevenue }
                        },
                        market: {
                            ...s.market,
                            portfolio: {
                                ...s.market.portfolio,
                                [symbol]: owned - quantity
                            }
                        }
                    }));
                    useUIStore.getState().addNotification(`Sold ${quantity} ${symbol} for $${baseRevenue.toFixed(2)} (-$${fee.toFixed(2)} fee)`);
                    get().advanceTime(0, 'economy', 'MARKET_TRADE');
                    get().checkQuestObjectives('action_complete', 'MARKET_TRADE');
                } else {
                    useUIStore.getState().addNotification("You don't own enough shares!");
                }
            },

            sellStock: (symbol, quantity) => {
                const state = get();
                const price = state.market.stocks.prices[symbol];
                const owned = state.market.stocks.portfolio[symbol] || 0;

                if (owned >= quantity) {
                    const baseRevenue = price * quantity;
                    const fee = 10; // Flat fee
                    const netRevenue = baseRevenue - fee;

                    set(s => ({
                        player: {
                            ...s.player,
                            stats: { ...s.player.stats, worth: s.player.stats.worth + netRevenue }
                        },
                        market: {
                            ...s.market,
                            stocks: {
                                ...s.market.stocks,
                                portfolio: {
                                    ...s.market.stocks.portfolio,
                                    [symbol]: owned - quantity
                                }
                            }
                        }
                    }));
                    useUIStore.getState().addNotification(`Sold ${quantity} ${symbol} for $${baseRevenue.toFixed(2)} (-$10 fee)`);
                    get().advanceTime(0, 'economy', 'MARKET_TRADE');
                    get().checkQuestObjectives('action_complete', 'MARKET_TRADE');
                } else {
                    useUIStore.getState().addNotification("You don't own enough shares!");
                }
            },

            applyJob: (careerId) => {
                const state = get();
                const career = CAREERS[careerId];
                if (career && !canAccessCareer(state, career)) {
                    useUIStore.getState().addNotification(`Faction access required for ${career.title}.`);
                    return;
                }
                const result = CareerSystem.canApply(careerId, state.player.stats);

                if (result.allowed) {
                    set((state) => ({
                        career: {
                            ...state.career,
                            currentId: careerId,
                            tier: 1
                        }
                    }));
                    useUIStore.getState().addNotification(`Hired as ${careerId}!`);
                } else {
                    useUIStore.getState().addNotification(result.reason || "Not qualified.");
                }
            },

            workJob: () => {
                const state = get();
                const { currentId } = state.career;

                if (currentId === 'unemployed') {
                    useUIStore.getState().addNotification("You don't have a job!");
                    return;
                }

                const result = CareerSystem.workShift(currentId, state.player.stats, state.player.traits, state.player.energy);

                if (result.success && result.rewards) {
                    const actions = get();

                    if (result.rewards.cash) {
                        actions.modifyStat('worth', result.rewards.cash);
                    }

                    // ... existing stats logic ...
                    if (result.rewards.stats) {
                        Object.entries(result.rewards.stats).forEach(([stat, val]) => {
                            if (stat === 'xp') {
                                actions.gainXp(val || 0);
                            } else {
                                actions.modifyStat(stat as keyof Stats, val || 0);
                            }
                        });
                    }

                    if (result.cost) {
                        if (result.cost.will) {
                            set((s) => ({
                                player: {
                                    ...s.player,
                                    energy: Math.max(0, s.player.energy - result.cost!.will)
                                }
                            }));
                        }
                        if (result.cost.time) actions.advanceTime(result.cost.time, 'work', 'WORK_SHIFT');
                    }

                    useUIStore.getState().addNotification(result.log);
                    get().checkQuestObjectives('action_complete', 'WORK_SHIFT');
                    // Finance contracts that pay out on completed work shifts (e.g. Career Referral).
                    const workFinanceContract = get().getFinanceContracts().find((offer) => offer.objective.trigger === 'work_shift' || (offer.objective.trigger === 'action_complete' && offer.objective.target === 'WORK_SHIFT'));
                    if (workFinanceContract && get().contracts.acceptedIds.includes(workFinanceContract.id)) {
                        get().completeFinanceContract(workFinanceContract.id);
                    }

                    // --- PROMOTION CHECK ---
                    // Must get fresh state after stat updates
                    const freshState = get();
                    const nextJobId = CareerSystem.checkPromotion(freshState.career, freshState.player.stats);

                    if (nextJobId) {
                        set((state) => ({
                            career: {
                                ...state.career,
                                currentId: nextJobId,
                                tier: state.career.tier + 1 // Assumes simple +1 tier step
                            }
                        }));
                        useUIStore.getState().addNotification(`PROMOTED! You are now a ${nextJobId.replace(/_/g, ' ').toUpperCase()}!`);
                    }
                } else {
                    useUIStore.getState().addNotification(result.log);
                }
            },

            interactNPC: (npcId, action) => {
                const npc = NPCS[npcId];
                if (!npc) return;

                // Offering a favor hands over a real item. Without one the gesture fails.
                let giftItemId: string | null = null;
                if (action === 'gift') {
                    giftItemId = NPCSystem.selectGiftItem(get().inventory);
                    if (!giftItemId) {
                        useUIStore.getState().addNotification('You have nothing to offer. Buy a consumable first.');
                        return;
                    }
                }

                get().refreshContracts();
                const { relChange, karmaChange, trustChange, fearChange, log } = NPCSystem.interact(action);
                const current = NPCSystem.getOrInitState(npcId, get().npcs);
                const day = get().world.day;
                const socialEffect = NPCSystem.getSocialEffect(npcId, action, current, day);
                const dialogue = NPCSystem.getDialogue(
                    npcId,
                    current.relationship,
                    current.fear,
                    get().factionIdentity.primaryFaction || undefined,
                    get().contentFlags,
                    get().world.time
                );

                if (npcId === 'npc_ace' && action === 'chat' && !get().npcs[npcId]) {
                    const sequence = [
                        "You're finally awake. The Coalition doesn't like loose ends.",
                        "This city is built on paper, but the ink is blood. Remember that.",
                        "Here's some starting credits. Don't spend them all at the bar. Actually, never mind. It's your life."
                    ];
                    useUIStore.getState().openDialogue(npcId, sequence, action);
                } else {
                    useUIStore.getState().openDialogue(npcId, dialogue, action);
                }

                if (action === 'chat') {
                    get().checkQuestObjectives('interact_npc', npcId);
                }

                const contract = get().contracts.offers.find((offer) =>
                    offer.objective.trigger === 'interact_npc' && offer.objective.target === npcId
                );

                let workingInventory = giftItemId
                    ? InventorySystem.removeItem(get().inventory, giftItemId).newState
                    : get().inventory;

                set(state => ({
                    npcs: {
                        ...state.npcs,
                        [npcId]: {
                            ...current,
                            relationship: Math.max(-100, Math.min(100, current.relationship + relChange + (socialEffect?.relationship || 0))),
                            trust: Math.max(-100, Math.min(100, current.trust + trustChange + (socialEffect?.trust || 0))),
                            fear: Math.max(0, Math.min(100, current.fear + fearChange + (socialEffect?.fear || 0))),
                            loyalty: Math.max(-100, Math.min(100, current.loyalty + (action === 'chat' ? 1 : 0) + (socialEffect?.loyalty || 0))),
                            lastInteraction: Date.now(),
                            lastDailyEffectDay: socialEffect ? day : current.lastDailyEffectDay,
                            history: [...current.history.slice(-7), giftItemId ? `gift:${ITEMS[giftItemId]?.name || giftItemId}` : `${action}:${relChange}`]
                        }
                    },
                    inventory: socialEffect?.itemId
                        ? InventorySystem.addItem(workingInventory, socialEffect.itemId)
                        : workingInventory
                }));
                workingInventory = get().inventory;

                if (giftItemId) {
                    const giftName = ITEMS[giftItemId]?.name || giftItemId;
                    useUIStore.getState().toast({
                        title: 'FAVOR OFFERED',
                        description: `${npc.name} accepted the ${giftName}. It was removed from your inventory.`,
                        variant: 'success'
                    });
                }

                const totalKarmaChange = karmaChange + (socialEffect?.karma || 0);
                if (totalKarmaChange !== 0) get().modifyKarma(totalKarmaChange);
                if (socialEffect?.luck) get().modifyStat('luck', socialEffect.luck);
                if (current.relationship + relChange >= 30) get().unlockAchievement('trusted_contact');
                if (log) useUIStore.getState().addNotification(log);
                if (socialEffect?.itemId) useUIStore.getState().addNotification(`Daily favor received: ${ITEMS[socialEffect.itemId]?.name || socialEffect.itemId}.`);
                if (socialEffect?.karma || socialEffect?.luck) {
                    useUIStore.getState().toast({
                        title: 'SOCIAL EFFECT',
                        description: `${socialEffect.karma ? `${socialEffect.karma > 0 ? '+' : ''}${socialEffect.karma} karma` : ''}${socialEffect.luck ? ` ${socialEffect.luck > 0 ? '+' : ''}${socialEffect.luck} luck` : ''}`.trim(),
                        variant: socialEffect.karma && socialEffect.karma < 0 ? 'danger' : 'success'
                    });
                }
                get().advanceTime(0, 'social', npcId);
                if (contract) get().completeContract(contract.id);
            },

            useNPCService: (npcId) => {
                const state = get();
                const npc = NPCS[npcId];
                if (!npc?.specialService || !npc.specialServiceFlags?.some((flag) => state.contentFlags[flag])) {
                    useUIStore.getState().addNotification('This NPC service is not unlocked for your current arc.');
                    return;
                }

                const current = NPCSystem.getOrInitState(npcId, state.npcs);
                if (current.serviceUses[npc.specialService] === state.world.day) {
                    useUIStore.getState().addNotification(`${npc.specialService} has already been used today.`);
                    return;
                }

                set((store) => ({
                    npcs: {
                        ...store.npcs,
                        [npcId]: {
                            ...current,
                            serviceUses: { ...current.serviceUses, [npc.specialService!]: state.world.day },
                            history: [...current.history.slice(-7), `service:${npc.specialService}`]
                        }
                    }
                }));

                switch (npc.specialService) {
                    case 'Civic endorsement':
                        get().modifyStat('charisma', 2);
                        get().modifyFactionReputation('angel', 3);
                        break;
                    case 'Broker rates':
                        get().modifyStat('intelligence', 2);
                        get().modifyFactionReputation('ghost', 3);
                        set((store) => ({ contentFlags: { ...store.contentFlags, broker_rates_active: true } }));
                        break;
                    case 'Underworld protection':
                        set((store) => ({ player: { ...store.player, health: Math.min(store.player.maxHealth, store.player.health + 15) } }));
                        get().modifyFactionReputation('demon', 3);
                        set((store) => ({ contentFlags: { ...store.contentFlags, underworld_protection_active: true } }));
                        break;
                    case 'Enforcer contracts':
                        get().modifyStat('power', 2);
                        get().modifyFactionReputation('demon', 3);
                        get().refreshContracts();
                        break;
                    default:
                        break;
                }

                useUIStore.getState().toast({
                    title: 'SERVICE ACTIVATED',
                    description: `${npc.name}: ${npc.specialService}`,
                    variant: npc.serviceFaction || 'neutral'
                });
            },

            maybeApproachPlayer: (npcId) => {
                const state = get();
                // Never interrupt an active conversation, combat, or pending encounter.
                if (
                    useUIStore.getState().activeDialogue ||
                    state.combatState ||
                    state.streetEncounters.active
                ) return;
                if (state.world.locationId === 'safehouse') return; // Safehouse stays quiet

                const picked = pickStreetEncounter(state, npcId);
                if (!picked) return;

                // Approach chance scales with relationship for offers; feared NPCs warn more.
                const npcState = NPCSystem.getOrInitState(picked.encounter.npcId, state.npcs);
                const relBonus = Math.min(0.25, Math.max(0, npcState.relationship) * 0.005);
                if (Math.random() > 0.35 + relBonus) return;

                set((current) => ({
                    streetEncounters: {
                        ...current.streetEncounters,
                        active: {
                            npcId: picked.encounter.npcId,
                            encounterId: picked.encounter.id,
                            line: picked.line
                        }
                    }
                }));
            },

            resolveStreetEncounter: (choice) => {
                const state = get();
                const active = state.streetEncounters.active;
                if (!active) return;
                const encounter = STREET_ENCOUNTERS.find((e) => e.id === active.encounterId);
                if (!encounter) {
                    set((current) => ({ streetEncounters: { ...current.streetEncounters, active: null } }));
                    return;
                }

                const accept = choice === 'accept';
                const resolver = accept ? encounter.apply : (encounter.dismiss || (() => ({ patch: {}, toast: { title: 'WALKED AWAY', description: 'You keep moving. The city shrugs.' } })));
                const result = resolver(state);

                const npcState = NPCSystem.getOrInitState(encounter.npcId, state.npcs);
                const rel = encounter.relReward && accept
                    ? encounter.relReward
                    : accept ? undefined : encounter.relReward;

                set((current) => ({
                    ...(result.patch as Partial<GameStore>),
                    npcs: rel ? {
                        ...current.npcs,
                        [encounter.npcId]: {
                            ...npcState,
                            relationship: Math.max(-100, Math.min(100, npcState.relationship + (rel.relationship || 0))),
                            trust: Math.max(-100, Math.min(100, npcState.trust + (rel.trust || 0))),
                            fear: Math.max(-100, Math.min(100, npcState.fear + (rel.fear || 0))),
                            history: [...npcState.history.slice(-7), `street:${encounter.id}:${accept ? 'yes' : 'no'}`]
                        }
                    } : current.npcs,
                    streetEncounters: {
                        ...current.streetEncounters,
                        active: null,
                        encounteredIds: {
                            ...current.streetEncounters.encounteredIds,
                            [encounter.npcId]: (current.streetEncounters.encounteredIds[encounter.npcId] || 0) + 1
                        },
                        lastEncounterDay: current.world.day,
                        lastEncounterAt: current.world.day * 1440 + current.world.time,
                        resolved: { ...current.streetEncounters.resolved, [encounter.id]: (current.streetEncounters.resolved[encounter.id] || 0) + 1 }
                    }
                }));

                useUIStore.getState().toast({
                    title: result.toast.title,
                    description: result.toast.description,
                    variant: encounter.kind === 'offer' ? 'neutral' : 'warning'
                });
            },

            buyItem: (itemId) => {
                const state = get();
                const item = ITEMS[itemId];

                if (!item) return;
                const price = get().getItemPrice(itemId);
                if (state.player.stats.worth < price) {
                    useUIStore.getState().addNotification("Not enough cash!");
                    return;
                }

                // Deduct Cash
                get().modifyStat('worth', -price);

                // Add Item
                set((state) => ({
                    inventory: InventorySystem.addItem(state.inventory, itemId)
                }));

                useUIStore.getState().addNotification(`Bought ${item.name} for $${price}.`);

                // Check Quests
                get().checkQuestObjectives('buy_item', itemId);
            },

            useItem: (itemId) => {
                const state = get();

                // 1. Check if we have it
                if (!InventorySystem.hasItem(state.inventory, itemId)) {
                    useUIStore.getState().addNotification("You don't have that.");
                    return;
                }

                // 2. Try to use it (logic check)
                const result = InventorySystem.consumeItem(itemId);

                if (result.success) {
                    // 3. Apply Effects
                    result.effects?.forEach(eff => {
                        // Special case: if stat is not in Stats (unlikely), ignore
                        // We cast because we know our items are valid
                        get().modifyStat(eff.stat as keyof Stats, eff.value);
                    });

                    // 4. Remove Item
                    const removeResult = InventorySystem.removeItem(state.inventory, itemId);
                    if (removeResult.success) {
                        set({ inventory: removeResult.newState });
                    }

                    useUIStore.getState().addNotification(result.log);
                } else {
                    useUIStore.getState().addNotification(result.log);
                }
            },

            equipWeapon: (itemId) => {
                const state = get();
                if (itemId === null) {
                    set(s => ({ inventory: { ...s.inventory, equippedWeapon: null } }));
                    useUIStore.getState().addNotification("Unequipped weapon.");
                    return;
                }

                if (InventorySystem.hasItem(state.inventory, itemId)) {
                    const item = ITEMS[itemId];
                    if (item && item.type === 'weapon') {
                        set(s => ({ inventory: { ...s.inventory, equippedWeapon: itemId } }));
                        useUIStore.getState().addNotification(`Equipped ${item.name}.`);
                    } else {
                        useUIStore.getState().addNotification("That is not a weapon.");
                    }
                } else {
                    useUIStore.getState().addNotification("You don't own that.");
                }
            },

            startCombat: (enemyId, encounterId) => {
                let state = get();
                const enemy = ENEMIES[enemyId];
                if (!enemy) return;

                // Context-sensitive leverage can resolve a confrontation before combat starts.
                state.advanceTime(0, 'combat', enemyId);
                state = get();
                if (state.randomEvents.lastOutcome === 'LEVERAGE_ESCAPE') return;

                // Energy Cost Logic
                const energyCost = 5 + (enemy.level * 2);
                // Use player.energy instead of stats.will
                if (state.player.energy < energyCost) {
                    useUIStore.getState().addNotification(`Too tired! Need ${energyCost} Energy to fight.`);
                    return;
                }

                // Deduct Energy
                set(s => ({
                    player: {
                        ...s.player,
                        energy: s.player.energy - energyCost
                    }
                }));

                const combatState = CombatSystem.initialize(state.player, enemy);
                set({ combatState: { ...combatState, encounterId } });
            },

            startCombatEncounter: (encounterId) => {
                const state = get();
                const encounter = getCombatEncounter(encounterId);
                if (!encounter || !isCombatEncounterAvailable(state, encounter)) {
                    useUIStore.getState().addNotification('That combat encounter is not available yet.');
                    return;
                }
                get().startCombat(encounter.enemyId, encounter.id);
            },

            resolveCombatEncounter: (encounterId, method) => {
                const state = get();
                const encounter = getCombatEncounter(encounterId);
                if (!encounter || !encounter.nonCombat || encounter.nonCombat.method !== method || !isCombatEncounterAvailable(state, encounter)) {
                    useUIStore.getState().addNotification('That non-combat resolution is not available.');
                    return;
                }
                const requirement = encounter.nonCombat;
                if (state.player.stats[requirement.stat] < requirement.requirement) {
                    useUIStore.getState().addNotification(`Need ${requirement.requirement} ${requirement.stat.toUpperCase()} to resolve this without fighting.`);
                    return;
                }
                if (requirement.cashCost && state.player.stats.worth < requirement.cashCost) {
                    useUIStore.getState().addNotification(`Need $${requirement.cashCost} to resolve this conflict.`);
                    return;
                }
                set((current) => ({
                    player: { ...current.player, stats: { ...current.player.stats, worth: current.player.stats.worth - (requirement.cashCost || 0) } },
                    combatRecord: {
                        ...current.combatRecord,
                        reputation: current.combatRecord.reputation + encounter.rewards.reputation,
                        completedEncounterIds: [...current.combatRecord.completedEncounterIds, encounter.id],
                        nonCombatResolutions: { ...current.combatRecord.nonCombatResolutions, [encounter.id]: method },
                        ladderTier: encounter.kind === 'ladder' ? current.combatRecord.ladderTier + 1 : current.combatRecord.ladderTier
                    }
                }));
                get().applyCombatEncounterRewards(encounter.id);
                useUIStore.getState().toast({ title: 'CONFLICT RESOLVED', description: `${encounter.title}: ${requirement.description}`, variant: encounter.faction || 'success' });
            },

            applyCombatEncounterRewards: (encounterId) => {
                const encounter = getCombatEncounter(encounterId);
                if (!encounter) return;
                const rewards = encounter.rewards;
                if (rewards.cash) get().modifyStat('worth', rewards.cash);
                if (rewards.xp) get().gainXp(rewards.xp);
                if (rewards.itemId) {
                    set((current) => ({ inventory: InventorySystem.addItem(current.inventory, rewards.itemId!) }));
                }
                if (rewards.factionReputation) {
                    Object.entries(rewards.factionReputation).forEach(([faction, amount]) => get().modifyFactionReputation(faction as FactionId, amount || 0));
                }
                if (rewards.relationshipNpcId && rewards.relationship) {
                    const npcState = NPCSystem.getOrInitState(rewards.relationshipNpcId, get().npcs);
                    set((current) => ({
                        npcs: {
                            ...current.npcs,
                            [rewards.relationshipNpcId!]: {
                                ...npcState,
                                relationship: Math.max(-100, Math.min(100, npcState.relationship + rewards.relationship!)),
                                trust: Math.max(-100, Math.min(100, npcState.trust + rewards.relationship!)),
                                history: [...npcState.history.slice(-7), `combat:${encounter.id}`]
                            }
                        }
                    }));
                }
            },

            combatAction: (action) => {
                const state = get();
                if (!state.combatState) return;

                const equippedWeapon = state.inventory.equippedWeapon || 'fists'; // Default to fists if null
                const newState = CombatSystem.playerTurn(
                    state.combatState,
                    action,
                    state.player,
                    equippedWeapon
                );

                set({ combatState: newState });

                // Handle End of Combat
                if (newState.isOver) {
                    const currentRecord = get().combatRecord || { wins: 0, losses: 0, rankTitle: 'Fresh Meat' };
                    let newWins = currentRecord.wins;
                    let newLosses = currentRecord.losses;
                    let newTitle = currentRecord.rankTitle;

                    if (newState.result === 'win') {
                        newWins++;
                        const enemy = state.combatState.enemy!;

                        // Rank Logic
                        if (newWins >= 50) newTitle = 'Kingpin';
                        else if (newWins >= 20) newTitle = 'Boss';
                        else if (newWins >= 10) newTitle = 'Enforcer';
                        else if (newWins >= 5) newTitle = 'Brawler';
                        else if (newWins >= 1) newTitle = 'Street Rat';

                        // Rewards
                        get().modifyStat('worth', enemy.cashReward);
                        useUIStore.getState().addNotification(`Victory! Found $${enemy.cashReward}. Rank: ${newTitle}`);
                    } else if (newState.result === 'loss') {
                        newLosses++;
                        // Penalty
                        get().newDay();
                        get().modifyStat('worth', -Math.floor(state.player.stats.worth * 0.1));
                        useUIStore.getState().addNotification(`Knocked out! Woke up the next day...`);
                        set({ combatState: null });
                    }

                    // Save fighter progression and encounter-specific consequences.
                    const encounterId = state.combatState.encounterId;
                    const encounter = encounterId ? getCombatEncounter(encounterId) : undefined;
                    if (newState.result === 'win') {
                        set((current) => ({
                            combatRecord: {
                                ...current.combatRecord,
                                wins: newWins,
                                losses: newLosses,
                                rankTitle: newTitle,
                                reputation: current.combatRecord.reputation + (encounter?.rewards.reputation || 2),
                                ladderWins: current.combatRecord.ladderWins + (encounter?.kind === 'ladder' ? 1 : 0),
                                ladderTier: encounter?.kind === 'ladder' ? current.combatRecord.ladderTier + 1 : current.combatRecord.ladderTier,
                                rivalWins: encounter?.kind === 'rival' ? { ...current.combatRecord.rivalWins, [encounter.id]: (current.combatRecord.rivalWins[encounter.id] || 0) + 1 } : current.combatRecord.rivalWins,
                                factionWins: encounter?.faction ? { ...current.combatRecord.factionWins, [encounter.faction]: current.combatRecord.factionWins[encounter.faction] + 1 } : current.combatRecord.factionWins,
                                completedEncounterIds: encounter ? [...new Set([...current.combatRecord.completedEncounterIds, encounter.id])] : current.combatRecord.completedEncounterIds
                            }
                        }));
                        if (encounter) get().applyCombatEncounterRewards(encounter.id);
                        else get().modifyFactionReputation('demon', 2);
                    } else {
                        set((current) => ({ combatRecord: { ...current.combatRecord, wins: newWins, losses: newLosses, rankTitle: newTitle } }));
                    }
                    get().checkQuestObjectives('combat_result', newState.result || '');
                }
            },

            endCombat: () => {
                const state = get();
                if (state.combatState?.result === 'loss') {
                    // Ensure penalties applied if they closed early? 
                    // Or just cleanup
                }
                set({ combatState: null });
            },

            // --- ECONOMY ACTIONS ---

            takeLoan: (amount) => {
                const state = get();
                if (amount <= 0) return;
                if (state.finance.loanBalance > 0) {
                    useUIStore.getState().addNotification('Pay off your current loan before taking another.');
                    return;
                }
                if (state.finance.defaults >= 3) {
                    useUIStore.getState().addNotification('No lender in Paper City will front you money anymore.');
                    return;
                }
                const totalDebt = Math.ceil(amount * (1 + state.finance.interestRate));
                set((current) => ({
                    player: { ...current.player, stats: { ...current.player.stats, worth: current.player.stats.worth + amount } },
                    finance: {
                        ...current.finance,
                        loanBalance: current.finance.loanBalance + totalDebt,
                        loanDaysRemaining: 3,
                        loansTaken: current.finance.loansTaken + 1
                    }
                }));
                useUIStore.getState().toast({
                    title: 'LOAN TAKEN',
                    description: `$${amount} received. Repay $${totalDebt} within 3 days or your contacts start collecting.`,
                    variant: 'warning'
                });
            },

            repayLoan: (amount) => {
                const state = get();
                if (state.finance.loanBalance <= 0) {
                    useUIStore.getState().addNotification('You have no outstanding loan.');
                    return;
                }
                const payment = Math.min(amount, state.finance.loanBalance, state.player.stats.worth);
                if (payment <= 0) {
                    useUIStore.getState().addNotification('Not enough cash to make a payment.');
                    return;
                }
                set((current) => ({
                    player: { ...current.player, stats: { ...current.player.stats, worth: current.player.stats.worth - payment } },
                    finance: {
                        ...current.finance,
                        loanBalance: current.finance.loanBalance - payment,
                        loanDaysRemaining: current.finance.loanBalance - payment <= 0 ? 0 : current.finance.loanDaysRemaining
                    }
                }));
                const cleared = get().finance.loanBalance <= 0;
                useUIStore.getState().toast({
                    title: cleared ? 'LOAN CLEARED' : 'PAYMENT MADE',
                    description: cleared ? 'Your ledger is clean again. Lenders noticed.' : `Paid $${payment}. Remaining debt: $${get().finance.loanBalance}.`,
                    variant: cleared ? 'success' : 'neutral'
                });
            },

            buyIntel: (sourceId) => {
                const state = get();
                const source = INTEL_SOURCES.find((candidate) => candidate.id === sourceId);
                if (!source) return;
                if (state.player.stats.worth < source.cost) {
                    useUIStore.getState().addNotification(`Need $${source.cost} for ${source.name}.`);
                    return;
                }
                const symbols = Object.keys(CRYPTO);
                const symbol = symbols[Math.floor(Math.random() * symbols.length)];
                const currentPrice = state.market.prices[symbol];
                if (!currentPrice) {
                    useUIStore.getState().addNotification('The market feed is offline. Try again later.');
                    return;
                }
                const roll = Math.random() * 100;
                const accurate = roll < source.accuracy;
                const trend = state.market.trends[symbol] || 'flat';
                const direction = accurate ? trend : (trend === 'bull' ? 'bear' : trend === 'bear' ? 'bull' : (Math.random() > 0.5 ? 'bull' : 'bear'));
                set((current) => ({
                    player: { ...current.player, stats: { ...current.player.stats, worth: current.player.stats.worth - source.cost } },
                    market: {
                        ...current.market,
                        intelTips: { ...current.market.intelTips, [symbol]: { day: current.world.day, direction, accuracy: source.accuracy } }
                    }
                }));
                useUIStore.getState().toast({
                    title: 'INTEL PURCHASED',
                    description: `${source.name}: ${symbol} reads ${direction.toUpperCase()} for today. (${source.accuracy}% source accuracy)`,
                    variant: 'ghost'
                });
            },

            buyFromVendor: (vendorId, itemId) => {
                const state = get();
                const vendor = FACTION_VENDORS.find((candidate) => candidate.id === vendorId);
                if (!vendor) return;
                if (state.world.locationId !== vendor.location) {
                    useUIStore.getState().addNotification(`${vendor.name} operates out of ${vendor.location.replace(/_/g, ' ')}.`);
                    return;
                }
                if ((state.factionReputation[vendor.faction] || 0) < vendor.requiredReputation && state.factionIdentity.primaryFaction !== vendor.faction) {
                    useUIStore.getState().addNotification(`Requires ${vendor.requiredReputation} ${vendor.faction.toUpperCase()} reputation.`);
                    return;
                }
                const price = getVendorPrice(state, vendor, itemId);
                if (state.player.stats.worth < price) {
                    useUIStore.getState().addNotification('Not enough cash.');
                    return;
                }
                set((current) => ({
                    player: { ...current.player, stats: { ...current.player.stats, worth: current.player.stats.worth - price } },
                    inventory: InventorySystem.addItem(current.inventory, itemId)
                }));
                useUIStore.getState().addNotification(`Bought ${ITEMS[itemId]?.name || itemId} from ${vendor.name} for $${price}.`);
            },

            buyHousingUpgrade: (upgradeId) => {
                const state = get();
                const upgrade = HOUSING_UPGRADES.find((candidate) => candidate.id === upgradeId);
                if (!upgrade) return;
                if (state.player.housing.upgrades.includes(upgradeId)) {
                    useUIStore.getState().addNotification('That upgrade is already installed.');
                    return;
                }
                if (upgrade.isSafehouseOnly && state.world.locationId !== 'the_block') {
                    useUIStore.getState().addNotification('This upgrade must be installed at your home on The Block.');
                    return;
                }
                if (state.player.stats.worth < upgrade.cost) {
                    useUIStore.getState().addNotification(`Need $${upgrade.cost} for ${upgrade.name}.`);
                    return;
                }
                set((current) => ({
                    player: {
                        ...current.player,
                        stats: { ...current.player.stats, worth: current.player.stats.worth - upgrade.cost },
                        housing: { ...current.player.housing, upgrades: [...current.player.housing.upgrades, upgradeId] }
                    }
                }));
                useUIStore.getState().toast({ title: 'UPGRADE INSTALLED', description: `${upgrade.name}: ${upgrade.effect}`, variant: 'success' });
            },

            performCityActivity: (activityId) => {
                const state = get();
                const activity = getDailyActivities(state).find((candidate) => candidate.id === activityId);
                if (!activity) {
                    useUIStore.getState().addNotification('That activity is not happening today.');
                    return;
                }
                if (state.player.energy < activity.energyCost) {
                    useUIStore.getState().addNotification(`Too tired. ${activity.title} needs ${activity.energyCost} Energy.`);
                    return;
                }
                if (state.player.stats.worth < activity.cashCost) {
                    useUIStore.getState().addNotification(`You need $${activity.cashCost} for ${activity.title}.`);
                    return;
                }
                const result = performDailyActivity(state, activity);
                set((current) => ({ ...current, ...result.patch } as GameStore));
                get().advanceTime(activity.timeCost, activity.kind === 'work' ? 'work' : activity.kind === 'economy' ? 'economy' : activity.kind === 'combat' ? 'train' : 'social', activity.id);
                if (activity.rewards.reputationFaction && activity.rewards.reputation) get().refreshContracts();
                useUIStore.getState().toast({ title: result.toast.title, description: result.toast.description, variant: 'neutral' });
            },

            completeFinanceContract: (contractId) => {
                const state = get();
                const offer = get().getFinanceContracts().find((candidate) => candidate.id === contractId);
                if (!offer) return;
                if (state.finance.completedFinanceContractIds?.includes(contractId)) return;
                const def = FINANCE_CONTRACTS.find((candidate) => candidate.id === contractId);
                set((current) => ({
                    finance: {
                        ...current.finance,
                        completedFinanceContractIds: [...(current.finance.completedFinanceContractIds || []), contractId]
                    }
                }));
                get().modifyStat('worth', offer.reward.cash);
                get().gainXp(offer.reward.xp);
                get().modifyFactionReputation(offer.faction, offer.reward.reputation);
                if (def?.cashStake) {
                    // Risk-linked contracts pay a bonus when the stake requirement was met through normal play.
                    const bonus = Math.ceil(def.cashStake * 0.5);
                    get().modifyStat('worth', bonus);
                    useUIStore.getState().toast({ title: 'STAKE BONUS', description: `Your covered stake paid out an extra $${bonus}.`, variant: 'success' });
                }
                useUIStore.getState().toast({
                    title: 'CONTRACT COMPLETE',
                    description: `${offer.title}: +$${offer.reward.cash}, +${offer.reward.reputation} ${offer.faction.toUpperCase()} reputation.`,
                    variant: 'success'
                });
                get().advanceTime(0, 'contract', contractId);
            },

            getFinanceContracts: () => {
                const state = get();
                return FINANCE_CONTRACTS
                    .filter((contract) => canAccessFinanceContract(state, contract))
                    .map((contract): ContractOffer => ({
                        id: contract.id,
                        title: contract.title,
                        description: contract.description,
                        faction: contract.faction,
                        sourceNpcId: contract.sourceNpcId,
                        kind: contract.kind,
                        objective: contract.objective,
                        reward: contract.reward,
                        expiresDay: state.world.day
                    }));
            },

            initializeCharacter: (name, stats, traits) => {
                set(s => ({
                    player: {
                        ...s.player,
                        name: name,
                        stats: stats,
                        traits: traits
                    },
                    flags: { ...get().flags, character_created: true }
                }));
                useUIStore.getState().addNotification(`ID Card Issued: ${name}. Welcome to Paper City.`);
            },

            incrementPlayTime: (ms) => {
                set(s => ({ playTime: s.playTime + ms }));
            },

            setGameMode: (mode) => {
                set({ gameMode: mode });
            },

            resetGame: () => {
                set(INITIAL_STATE as unknown as GameStore);
            },

            startQuest: (questId) => {
                const state = get();
                if (state.quests[questId]) return;

                const quest = QUESTS[questId];
                const newQuestState = createQuestState(questId);
                if (!quest || !newQuestState) return;

                set(s => ({
                    quests: { ...s.quests, [questId]: newQuestState }
                }));

                useUIStore.getState().addNotification(`New Quest: ${quest.title}`);
            },

            modifyFactionReputation: (faction, amount) => {
                set((state) => ({
                    factionReputation: {
                        ...state.factionReputation,
                        [faction]: Math.max(-100, Math.min(100, (state.factionReputation[faction] || 0) + amount))
                    }
                }));
                get().refreshContracts();
            },

            defectFaction: (faction) => {
                const state = get();
                const currentFaction = state.factionIdentity.primaryFaction;
                if (!currentFaction || currentFaction === faction || state.factionIdentity.betrayals.includes(faction)) return;
                if ((state.factionReputation[faction] || 0) < 15) {
                    useUIStore.getState().addNotification(`You need 15 ${faction.toUpperCase()} reputation to defect here.`);
                    return;
                }

                set((current) => ({
                    factionIdentity: {
                        ...current.factionIdentity,
                        primaryFaction: faction,
                        status: 'defected' as AllegianceStatus,
                        betrayals: [...current.factionIdentity.betrayals, currentFaction],
                        milestones: [...current.factionIdentity.milestones, `defected_to_${faction}`]
                    },
                    contentFlags: {
                        ...current.contentFlags,
                        [`betrayed_${currentFaction}`]: true,
                        [`faction_${faction}`]: true
                    }
                }));
                get().modifyFactionReputation(currentFaction, -25);
                get().modifyFactionReputation(faction, 10);
                useUIStore.getState().toast({
                    title: 'ALLEGIANCE CHANGED',
                    description: `You left ${currentFaction.toUpperCase()} for ${faction.toUpperCase()}. Old allies will remember.`,
                    variant: faction
                });
            },

            recordFactionMilestone: (milestone) => {
                if (get().factionIdentity.milestones.includes(milestone)) return;
                set((state) => ({
                    factionIdentity: {
                        ...state.factionIdentity,
                        milestones: [...state.factionIdentity.milestones, milestone]
                    }
                }));
            },

            refreshContracts: () => {
                const state = get();
                const day = state.world.day;
                const current = state.contracts;
                const poolKey = `${state.factionIdentity.primaryFaction || 'uncommitted'}:${state.factionReputation.angel >= 8 ? 'a' : '-'}${state.factionReputation.ghost >= 8 ? 'g' : '-'}${state.factionReputation.demon >= 8 ? 'd' : '-'}`;
                if (current.generatedDay === day && current.poolKey === poolKey && current.offers.length > 0) return;
                const offers = generateDailyContracts(day, state);
                const sameDay = current.generatedDay === day;
                const offerIds = new Set(offers.map((offer) => offer.id));
                set({
                    contracts: {
                        generatedDay: day,
                        poolKey,
                        offers,
                        acceptedIds: sameDay ? current.acceptedIds.filter((id) => offerIds.has(id)) : [],
                        statuses: Object.fromEntries(offers.map((offer) => [offer.id, sameDay ? (current.statuses[offer.id] || 'available') : 'available'])),
                        completedIds: sameDay ? current.completedIds.filter((id) => offerIds.has(id)) : [],
                        expiredIds: sameDay ? (current.expiredIds || []) : [...(current.expiredIds || []), ...current.acceptedIds.filter((id) => !current.completedIds.includes(id))],
                        failedIds: current.failedIds || []
                    }
                });
            },

            acceptContract: (contractId) => {
                const state = get();
                const contract = state.contracts.offers.find((offer) => offer.id === contractId);
                if (!contract || contract.expiresDay !== state.world.day) return;
                if (state.contracts.acceptedIds.includes(contractId)) return;
                if (state.contracts.acceptedIds.length >= 3) {
                    useUIStore.getState().addNotification('You can only carry three accepted contracts per day.');
                    return;
                }
                if (!canAccessContract(state, contract)) {
                    useUIStore.getState().addNotification('This contract is not available to your current faction standing.');
                    return;
                }
                set((current) => ({
                    contracts: {
                        ...current.contracts,
                        acceptedIds: [...current.contracts.acceptedIds, contractId],
                        statuses: { ...current.contracts.statuses, [contractId]: 'accepted' }
                    }
                }));
                useUIStore.getState().toast({ title: 'CONTRACT ACCEPTED', description: contract.title, variant: 'success' });
            },

            abandonContract: (contractId) => {
                const state = get();
                if (!state.contracts.acceptedIds.includes(contractId)) return;
                set((current) => ({
                    contracts: {
                        ...current.contracts,
                        acceptedIds: current.contracts.acceptedIds.filter((id) => id !== contractId),
                        statuses: { ...current.contracts.statuses, [contractId]: 'failed' },
                        failedIds: [...(current.contracts.failedIds || []), contractId]
                    }
                }));
                useUIStore.getState().addNotification('Contract abandoned. The contact will remember.');
            },

            completeContract: (contractId) => {
                const state = get();
                const contract = state.contracts.offers.find((offer) => offer.id === contractId);
                if (!contract || !state.contracts.acceptedIds.includes(contractId) || state.contracts.completedIds.includes(contractId) || contract.expiresDay !== state.world.day) return;
                if (!canAccessContract(state, contract)) {
                    useUIStore.getState().addNotification('This contract is no longer available to your current faction standing.');
                    return;
                }

                set((current) => ({
                    contracts: {
                        ...current.contracts,
                        acceptedIds: current.contracts.acceptedIds.filter((id) => id !== contractId),
                        statuses: { ...current.contracts.statuses, [contractId]: 'completed' },
                        completedIds: [...current.contracts.completedIds, contractId]
                    }
                }));
                get().modifyStat('worth', contract.reward.cash);
                get().gainXp(contract.reward.xp);
                get().modifyFactionReputation(contract.faction, contract.reward.reputation);
                if (contract.crossFactionReputation) {
                    Object.entries(contract.crossFactionReputation).forEach(([faction, amount]) => {
                        get().modifyFactionReputation(faction as FactionId, amount || 0);
                    });
                    const primaryFaction = get().factionIdentity.primaryFaction;
                    const summary = primaryFaction ? get().arcSummaries[primaryFaction] : undefined;
                    if (primaryFaction && summary) {
                        set((current) => ({
                            arcSummaries: {
                                ...current.arcSummaries,
                                [primaryFaction]: {
                                    ...summary,
                                    crossFactionConsequences: {
                                        ...summary.crossFactionConsequences,
                                        ...contract.crossFactionReputation
                                    }
                                }
                            }
                        }));
                    }
                }
                get().unlockAchievement('contract_runner');
                useUIStore.getState().toast({
                    title: 'CONTRACT COMPLETE',
                    description: `${contract.title}: +$${contract.reward.cash}, +${contract.reward.reputation} ${contract.faction.toUpperCase()} reputation.`,
                    variant: 'success'
                });
                get().advanceTime(0, 'contract', contractId);
                get().checkQuestObjectives('contract_complete', contractId);
            },

            chooseQuest: (questId, choiceId) => {
                const state = get();
                const quest = QUESTS[questId];
                const questState = state.quests[questId];
                const choice = quest?.choices?.find((candidate) => candidate.id === choiceId);
                if (!quest || !questState || questState.status !== 'active' || !choice || !canChooseQuest(state, choice)) return;

                set((current) => ({
                    quests: {
                        ...current.quests,
                        [questId]: { ...current.quests[questId], choiceId }
                    }
                }));

                if (choice.rewards?.cash) get().modifyStat('worth', choice.rewards.cash);
                if (choice.rewards?.xp) get().gainXp(choice.rewards.xp);
                if (choice.rewards?.reputation) {
                    Object.entries(choice.rewards.reputation).forEach(([faction, amount]) => {
                        get().modifyFactionReputation(faction as FactionId, amount || 0);
                    });
                }
                if (choice.rewards?.relationships) {
                    Object.entries(choice.rewards.relationships).forEach(([npcId, amount]) => {
                    const npc = NPCSystem.getOrInitState(npcId, get().npcs);
                    set((current) => ({
                        npcs: {
                            ...current.npcs,
                            [npcId]: { ...npc, relationship: Math.max(-100, Math.min(100, npc.relationship + (amount || 0))), trust: npc.trust + (amount || 0) }
                        }
                    }));
                    });
                }
                if (choice.rewards?.flags?.length) {
                    set((current) => ({ contentFlags: { ...current.contentFlags, ...Object.fromEntries(choice.rewards!.flags!.map((flag) => [flag, true])) } }));
                }
                if (questId === 'pick_a_lane' && choice.faction) {
                    const currentIdentity = get().factionIdentity;
                    if (currentIdentity.primaryFaction && currentIdentity.primaryFaction !== choice.faction) return;
                    set((current) => ({
                        factionIdentity: {
                            ...current.factionIdentity,
                            primaryFaction: choice.faction || null,
                            status: 'committed',
                            committedAtDay: current.world.day,
                            milestones: [...new Set([...current.factionIdentity.milestones, `committed_to_${choice.faction}`])]
                        }
                    }));
                }
                if (choice.nextQuest) get().startQuest(choice.nextQuest);
                const chosenQuest = get().quests[questId];
                if (chosenQuest && questIsComplete(chosenQuest)) get().completeQuest(questId);
                get().recordFactionMilestone(`${questId}:${choiceId}`);
                get().unlockAchievement('faction_aligned');
                useUIStore.getState().toast({ title: 'CHOICE RECORDED', description: choice.label, variant: 'success' });
            },

            checkQuestObjectives: (trigger, data) => {
                const state = get();
                const matchingContract = state.contracts.offers.find((offer) =>
                    state.contracts.acceptedIds.includes(offer.id)
                    && offer.objective.trigger === trigger
                    && (!offer.objective.target || offer.objective.target === data)
                    && offer.expiresDay === state.world.day
                );
                if (matchingContract) get().completeContract(matchingContract.id);

                Object.values(QUESTS).forEach((definition) => {
                    const progress = state.quests[definition.id];
                    if (!progress || progress.status !== 'active') return;
                    definition.objectives.forEach((objective) => {
                        if (progress.objectives[objective.id]) return;
                        const matchesTrigger = objective.trigger === trigger;
                        const matchesTarget = !objective.target || objective.target === data;
                        if (matchesTrigger && matchesTarget) {
                            get().updateQuestObjective(definition.id, objective.id, true);
                            const updated = get().quests[definition.id];
                            if (updated && questIsComplete(updated) && (!definition.choices || updated.choiceId)) get().completeQuest(definition.id);
                        }
                    });
                });

                // --- TUTORIAL: TRUST YOURSELF ---
                if (state.quests['trust_yourself_intro']?.status === 'active') {
                    if (trigger === 'interact_npc' && data === 'npc_ace') {
                        get().updateQuestObjective('trust_yourself_intro', 'meet_ace', true);
                        get().completeQuest('trust_yourself_intro');
                        get().startQuest('get_moving');
                    }
                }

                // --- TUTORIAL: GET MOVING ---
                if (state.quests['get_moving']?.status === 'active') {
                    const starterActions = new Set(['WORK_SHIFT', 'TRAIN_POWER', 'TRAIN_CARDIO', 'TRAIN_INT', 'TRAIN_CHA']);
                    if (trigger === 'action_complete' && data && starterActions.has(data)) {
                        get().updateQuestObjective('get_moving', 'do_any_action', true);
                        get().completeQuest('get_moving');
                    }
                }

                // --- GYM QUEST LOGIC ---
                if (state.quests['gym_initiation']?.status === 'active') {
                    const q = { ...state.quests['gym_initiation'] }; // copy
                    let changed = false;
                    const inventory = state.inventory;

                    if (trigger === 'buy_item') {
                        // Obj 1: Membership
                        if (!q.objectives['buy_membership'] && InventorySystem.hasItem(inventory, 'gym_membership')) {
                            q.objectives['buy_membership'] = true;
                            changed = true;
                            useUIStore.getState().toast({ title: 'Objective Complete', description: 'Bought Membership', variant: 'success' });
                        }
                    }

                    // Obj 2: Gear
                    if (!q.objectives['buy_gear']) {
                        const hasShirt = InventorySystem.hasItem(inventory, 'gym_shirt');
                        const hasShorts = InventorySystem.hasItem(inventory, 'gym_shorts');
                        const hasShoes = InventorySystem.hasItem(inventory, 'gym_shoes');

                        if (hasShirt && hasShorts && hasShoes) {
                            q.objectives['buy_gear'] = true;
                            changed = true;
                            useUIStore.getState().toast({ title: 'Objective Complete', description: 'Got the Gear', variant: 'success' });
                        }
                    }

                    if (changed) {
                        set(s => ({
                            quests: { ...s.quests, ['gym_initiation']: q }
                        }));

                        // Check Completion
                        const allDone = Object.values(q.objectives).every(v => v);
                        if (allDone) {
                            get().completeQuest('gym_initiation');
                        }
                    }
                }

                // --- FIRST BAG LOGIC ---
                if (state.quests['first_bag']?.status === 'active') {
                    if (!state.quests['first_bag'].objectives['earn_300']) {
                        const netWorth = get().getNetWorth();
                        if (netWorth >= 300) {
                            get().updateQuestObjective('first_bag', 'earn_300', true);
                            get().completeQuest('first_bag');
                        }
                    }
                }

                // --- PICK A LANE FOLLOW-UP ---
                if (state.quests['mind_or_muscle']?.status === 'active') {
                    const growthActions = new Set(['TRAIN_POWER', 'TRAIN_INT']);
                    if (trigger === 'action_complete' && data && growthActions.has(data)) {
                        get().updateQuestObjective('mind_or_muscle', 'improve_self', true);
                        get().completeQuest('mind_or_muscle');
                    }
                }
            },

            updateQuestObjective: (questId, objectiveId, completed) => {
                const state = get();
                const quest = state.quests[questId];
                if (!quest) return;

                if (quest.objectives[objectiveId] !== completed) {
                    set(s => ({
                        quests: {
                            ...s.quests,
                            [questId]: {
                                ...s.quests[questId],
                                objectives: {
                                    ...s.quests[questId].objectives,
                                    [objectiveId]: completed
                                }
                            }
                        }
                    }));
                }
            },

            completeQuest: (questId) => {
                const state = get();
                const quest = state.quests[questId];
                if (!quest || quest.status === 'completed' || quest.rewardClaimed) return;

                const questDefinition = QUESTS[questId];

                set(s => ({
                    quests: {
                        ...s.quests,
                        [questId]: { ...s.quests[questId], status: 'completed', rewardClaimed: true }
                    }
                }));

                if (questDefinition?.rewards.cash) {
                    get().modifyStat('worth', questDefinition.rewards.cash);
                }

                if (questDefinition?.rewards.xp) {
                    get().gainXp(questDefinition.rewards.xp);
                }

                if (questDefinition?.rewards.stats) {
                    Object.entries(questDefinition.rewards.stats).forEach(([stat, amount]) => {
                        get().modifyStat(stat as keyof Stats, amount);
                    });
                }

                if (questDefinition?.rewards.reputation) {
                    Object.entries(questDefinition.rewards.reputation).forEach(([faction, amount]) => {
                        get().modifyFactionReputation(faction as FactionId, amount || 0);
                    });
                }

                if (questDefinition?.rewards.flags?.length) {
                    set((store) => ({
                        contentFlags: { ...store.contentFlags, ...Object.fromEntries(questDefinition.rewards.flags!.map((flag) => [flag, true])) }
                    }));
                }

                if (questDefinition?.rewards.items?.length) {
                    set((store) => ({
                        inventory: questDefinition.rewards.items!.reduce(
                            (inventoryState, itemId) => InventorySystem.addItem(inventoryState, itemId),
                            store.inventory
                        )
                    }));
                }

                useUIStore.getState().addNotification(`Quest Completed: ${questDefinition?.title || questId}!`);

                if (questDefinition?.arcConclusion) {
                    const faction = questDefinition.arcConclusion as FactionId;
                    const endingChoice = get().quests[questId]?.choiceId || 'completed';
                    const questIds = Object.values(QUESTS)
                        .filter((definition) => definition.arcId === faction || definition.faction === faction)
                        .map((definition) => definition.id);
                    const choiceIds = Object.values(get().quests)
                        .filter((progress) => questIds.includes(progress.id) && progress.choiceId)
                        .map((progress) => progress.choiceId as string);
                    const relationshipSnapshot = Object.fromEntries(
                        Object.entries(get().npcs)
                            .filter(([npcId]) => ['npc_ace', 'npc_ghost', 'npc_lena', 'npc_mayor', 'npc_rook', 'npc_mara'].includes(npcId))
                            .map(([npcId, npc]) => [npcId, npc.relationship])
                    );
                    set((store) => ({
                        arcSummaries: {
                            ...store.arcSummaries,
                            [faction]: {
                                faction,
                                endingId: endingChoice,
                                completedAtDay: store.world.day,
                                questIds,
                                choiceIds,
                                relationshipSnapshot,
                                crossFactionConsequences: {}
                            }
                        }
                    }));
                    get().recordFactionMilestone(`arc_complete_${questDefinition.arcConclusion}`);
                    get().unlockAchievement(`${questDefinition.arcConclusion}_arc_complete`);
                    useUIStore.getState().toast({
                        title: `${questDefinition.arcConclusion.toUpperCase()} ARC COMPLETE`,
                        description: 'Your ending signal has been recorded for future runs.',
                        variant: questDefinition.arcConclusion as 'angel' | 'ghost' | 'demon'
                    });
                }

                if (questDefinition?.nextQuest) {
                    get().startQuest(questDefinition.nextQuest);
                }
            },
            exportSave: () => {
                const state = get();
                // JSON.stringify automatically removes functions
                const saveObj = JSON.parse(JSON.stringify(state));

                delete saveObj.combatState;
                delete saveObj.remotePlayers;
                delete saveObj.pricePollingId;

                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveObj));
                const downloadAnchorNode = document.createElement('a');
                downloadAnchorNode.setAttribute("href", dataStr);
                downloadAnchorNode.setAttribute("download", `paper_city_save_${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(downloadAnchorNode);
                downloadAnchorNode.click();
                downloadAnchorNode.remove();
                useUIStore.getState().toast({ title: 'Export Successful', description: 'Save file downloaded.', variant: 'success' });
            },
            importSave: (json: string) => {
                try {
                    const data = JSON.parse(json) as Partial<GameState>;
                    // Basic validation
                    if (data.version !== 1 || !data.player || !data.world) {
                        throw new Error('Invalid save format');
                    }
                    // Apply
                    set({
                        ...INITIAL_STATE,
                        ...data,
                        player: normalizePlayerState(data.player),
                        world: normalizeWorldState(data.world),
                        factionReputation: { ...INITIAL_STATE.factionReputation, ...(data.factionReputation || {}) },
                        combatRecord: normalizeCombatRecord(data.combatRecord),
                        factionIdentity: { ...INITIAL_STATE.factionIdentity, ...(data.factionIdentity || {}) },
                        club: normalizeClubState(data.club),
                        tutorial: normalizeTutorialState(data.tutorial),
                        arcSummaries: { ...INITIAL_STATE.arcSummaries, ...(data.arcSummaries || {}) },
                        contentFlags: { ...INITIAL_STATE.contentFlags, ...(data.contentFlags || {}) },
                        contracts: normalizeContractState(data.contracts),
                        randomEvents: normalizeRandomEventsState(data.randomEvents),
                        streetEncounters: normalizeStreetEncountersState(data.streetEncounters),
                        finance: normalizeFinanceState(data.finance),
                        market: { ...INITIAL_STATE.market, ...(data.market || {}), intelTips: { ...(data.market?.intelTips || {}) } },
                        combatState: null,
                        remotePlayers: {},
                        pricePollingId: null
                    });
                    useUIStore.getState().toast({ title: 'Import Successful', description: 'Save data restored.', variant: 'success' });
                } catch (err) {
                    console.error('Import error:', err);
                    useUIStore.getState().toast({ title: 'Import Failed', description: 'Invalid or corrupt save file.', variant: 'danger' });
                }
            }
        }),
        {
            name: 'coalition-paper-city-save',
            storage: createJSONStorage(() => localStorage),
            version: 2,
            migrate: (persistedState: unknown, version: number) => {
                if (version === 0) {
                    // Migrate from v0 (flat stats) to v1 (nested player/world)
                    const ps = (persistedState as LegacyPersistedState | undefined) ?? {};
                    const oldStats = ps.stats || {};

                    const migratedState = {
                        ...INITIAL_STATE,
                        ...ps,
                        // Move legacy root fields to Player
                        player: {
                            ...INITIAL_STATE.player,
                            name: ps.playerName || INITIAL_STATE.player.name,
                            xp: oldStats.xp || 0,
                            level: oldStats.level || 1,
                            skillPoints: oldStats.skillPoints || 0,
                            health: oldStats.health || 100,
                            maxHealth: oldStats.maxHealth || 100,
                            energy: 100, // New field, default
                            maxEnergy: 100,
                            traits: ps.traits || [],
                            housing: ps.housing || INITIAL_STATE.player.housing,
                            stats: {
                                power: oldStats.power || 1,
                                intelligence: oldStats.intelligence || 1,
                                charisma: oldStats.charisma || 1,
                                luck: oldStats.luck || 1,
                                karma: oldStats.karma || 0,
                                worth: oldStats.worth || 0,
                                will: oldStats.will || 100
                            }
                        },
                        // Move legacy root fields to World
                        world: {
                            ...INITIAL_STATE.world,
                            day: ps.day || 1,
                            time: ps.time || 360,
                            locationId: normalizeLocationId(ps.location)
                        },
                        // Keep top level
                        gameMode: ps.gameMode || 'fun',
                        introSeen: ps.introSeen || false,
                        inventory: ps.inventory || INITIAL_STATE.inventory,
                        quests: ps.quests || INITIAL_STATE.quests,
                        contracts: normalizeContractState((ps as Partial<GameState>).contracts),
                        finance: normalizeFinanceState((ps as Partial<GameState>).finance),
                        market: {
                            ...INITIAL_STATE.market,
                            ...(ps.market || {}),
                            intelTips: { ...((ps as Partial<GameState>).market?.intelTips || {}) },
                            stocks: {
                                ...INITIAL_STATE.market.stocks,
                                ...(ps.market?.stocks || {})
                            }
                        }
                    };

                    return migratedState as unknown as GameStore;
                }                const persisted = (persistedState as Partial<GameStore>) || {};
                return {
                    ...INITIAL_STATE,
                    ...persisted,
                    player: normalizePlayerState(persisted.player),
                    world: normalizeWorldState(persisted.world),
                    factionReputation: { ...INITIAL_STATE.factionReputation, ...(persisted.factionReputation || {}) },
                    combatRecord: normalizeCombatRecord(persisted.combatRecord),
                    factionIdentity: { ...INITIAL_STATE.factionIdentity, ...(persisted.factionIdentity || {}) },
                    club: normalizeClubState(persisted.club),
                    tutorial: normalizeTutorialState(persisted.tutorial),
                    arcSummaries: { ...INITIAL_STATE.arcSummaries, ...(persisted.arcSummaries || {}) },
                    contentFlags: { ...INITIAL_STATE.contentFlags, ...(persisted.contentFlags || {}) },
                    contracts: normalizeContractState(persisted.contracts),
                    randomEvents: normalizeRandomEventsState(persisted.randomEvents),
                    streetEncounters: normalizeStreetEncountersState(persisted.streetEncounters),
                    npcs: Object.fromEntries(Object.entries(persisted.npcs || {}).map(([id, npc]) => [id, NPCSystem.getOrInitState(id, { [id]: npc as GameState['npcs'][string] })]))
                } as GameStore;

            },
        }
    )
);
