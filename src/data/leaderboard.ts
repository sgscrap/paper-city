export interface LeaderboardEntry {
    id: string;
    name: string;
    worth: number;
    combatWins: number;
    xp: number;
    timePlayed: number; // in minutes
    isPlayer: boolean;
    title: string;
}

export const RIVAL_DATA: LeaderboardEntry[] = [
    { id: 'rival_1', name: 'Victor Thorne', worth: 1000000000, combatWins: 0, xp: 500000, timePlayed: 14400, isPlayer: false, title: 'The Architect' },
    { id: 'rival_2', name: 'Saito Zero', worth: 50000000, combatWins: 450, xp: 250000, timePlayed: 10080, isPlayer: false, title: 'Ronin Prime' },
    { id: 'rival_3', name: 'Madame Onyx', worth: 15000000, combatWins: 12, xp: 120000, timePlayed: 7200, isPlayer: false, title: 'Queen of Hearts' },
    { id: 'rival_4', name: 'Brutus', worth: 5000, combatWins: 300, xp: 45000, timePlayed: 4320, isPlayer: false, title: 'The Pitbull' },
    { id: 'rival_5', name: 'Neon Ghost', worth: 1000000, combatWins: 85, xp: 85000, timePlayed: 2880, isPlayer: false, title: 'Phantom Trader' },
    { id: 'rival_6', name: 'Silicon Sam', worth: 2500000, combatWins: 5, xp: 30000, timePlayed: 1440, isPlayer: false, title: 'Code Breaker' },
    { id: 'rival_7', name: 'Street Rat Steve', worth: 150, combatWins: 40, xp: 1200, timePlayed: 600, isPlayer: false, title: 'Survivor' },
    { id: 'rival_8', name: 'Corp Sec Unit 9', worth: 0, combatWins: 1000, xp: 150000, timePlayed: 20000, isPlayer: false, title: 'Enforcer' },
    { id: 'rival_9', name: 'Zoe Zenith', worth: 800000, combatWins: 200, xp: 95000, timePlayed: 5000, isPlayer: false, title: 'The Fixer' },
];

