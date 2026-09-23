export interface CombatState {
    isActive: boolean;
    turn: number;
    playerHp: number; // Current Will
    playerMaxHp: number; // Max Will
    enemy: Enemy | null;
    enemyHp: number;
    logs: CombatLog[];
    isOver: boolean;
    result?: 'win' | 'loss' | 'flee';
    encounterId?: string;
}

export interface Enemy {
    id: string;
    name: string;
    level: number;
    hp: number;
    power: number; // Attack stat
    xpReward: number;
    cashReward: number;
    drops: string[]; // Item IDs
    taunts: string[];
}

export interface CombatLog {
    id: string;
    text: string;
    type: 'info' | 'player' | 'enemy' | 'system' | 'win' | 'loss';
}

export type CombatActionType = 'attack' | 'defend' | 'item' | 'flee';

export interface CombatTurnResult {
    damageDealt: number;
    damageTaken: number;
    isCritical: boolean;
    log: string[];
    newState: CombatState;
}
