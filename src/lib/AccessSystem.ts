import { Career, ContractOffer, FactionId, GameState, NPC } from '@/types';

export type AccessId =
    | 'location:corporate_towers'
    | 'location:underground_markets'
    | 'location:political_offices'
    | 'service:trading_floor'
    | 'service:safehouse'
    | 'service:jobs'
    | 'service:university'
    | 'service:gym'
    | 'service:casino'
    | 'service:black_market';

interface AccessRule {
    label: string;
    faction?: FactionId;
    reputation: number;
    flag?: string;
    alternative?: string;
}

export const ACCESS_RULES: Record<AccessId, AccessRule> = {
    'location:corporate_towers': {
        label: 'Corporate Towers',
        faction: 'ghost',
        reputation: 8,
        flag: 'ghost_open_channel',
        alternative: 'Complete a Ghost information arc milestone.'
    },
    'location:underground_markets': {
        label: 'Underground Markets',
        faction: 'demon',
        reputation: 8,
        flag: 'demon_trusted',
        alternative: 'Earn Demon reputation through underworld contracts.'
    },
    'location:political_offices': {
        label: 'Civic Center',
        faction: 'angel',
        reputation: 8,
        flag: 'angel_trusted',
        alternative: 'Earn Angel reputation through protection contracts.'
    },
    'service:trading_floor': {
        label: 'Trading Floor',
        faction: 'ghost',
        reputation: 8,
        flag: 'ghost_trusted',
        alternative: 'Pass the broker license and build Ghost credibility.'
    },
    'service:safehouse': {
        label: 'Safehouse',
        faction: 'demon',
        reputation: 8,
        flag: 'demon_trusted',
        alternative: 'Earn trust with an underworld contact.'
    },
    'service:jobs': {
        label: 'Faction Job Board',
        reputation: 0
    },
    'service:university': {
        label: 'University',
        reputation: 0
    },
    'service:gym': {
        label: 'Gym',
        reputation: 0
    },
    'service:casino': {
        label: 'Casino',
        reputation: 0
    },
    'service:black_market': {
        label: 'Black Market',
        faction: 'demon',
        reputation: 8,
        flag: 'demon_trusted',
        alternative: 'Build Demon standing or complete an underworld contract.'
    }
};

const hasFactionAccess = (state: GameState, rule: AccessRule): boolean => {
    if (!rule.faction || rule.reputation <= 0) return true;
    return (state.factionReputation[rule.faction] || 0) >= rule.reputation
        || state.factionIdentity.primaryFaction === rule.faction
        || Boolean(rule.flag && state.contentFlags[rule.flag]);
};

export const canAccess = (state: GameState, accessId: AccessId): boolean => {
    const rule = ACCESS_RULES[accessId];
    return Boolean(rule) && hasFactionAccess(state, rule);
};

export const accessReason = (state: GameState, accessId: AccessId): string | null => {
    const rule = ACCESS_RULES[accessId];
    if (!rule || hasFactionAccess(state, rule)) return null;
    return `${rule.label} requires ${rule.reputation} ${rule.faction?.toUpperCase()} reputation. ${rule.alternative || ''}`.trim();
};

export const locationAccessId = (locationId: string): AccessId | null => {
    const accessId = `location:${locationId}` as AccessId;
    return ACCESS_RULES[accessId] ? accessId : null;
};

export const isFactionUnlocked = (state: GameState, faction: FactionId, reputation = 8): boolean =>
    (state.factionReputation[faction] || 0) >= reputation
    || state.factionIdentity.primaryFaction === faction
    || Boolean(state.contentFlags[`faction_${faction}`] || state.contentFlags[`${faction}_trusted`]);

export const canAccessCareer = (state: GameState, career: Career): boolean =>
    !career.requiredFaction || isFactionUnlocked(state, career.requiredFaction, career.requiredReputation || 8);

export const canAccessContract = (state: GameState, contract: ContractOffer): boolean =>
    (!contract.requiredContentFlag || Boolean(state.contentFlags[contract.requiredContentFlag]))
    && (!contract.requiredReputation || isFactionUnlocked(state, contract.faction, contract.requiredReputation));

export const canAccessNpcService = (state: GameState, npc: NPC): boolean =>
    !npc.serviceFaction || isFactionUnlocked(state, npc.serviceFaction, 8);

export const serviceAccessId = (service: string): AccessId | null => {
    const accessId = `service:${service}` as AccessId;
    return ACCESS_RULES[accessId] ? accessId : null;
};
