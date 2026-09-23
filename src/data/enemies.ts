export interface EnemyDef {
    id: string;
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    power: number;
    defense: number;
    xpReward: number;
    cashReward: number;
    drops: string[];
    taunts: string[];
}

export const ENEMIES: Record<string, EnemyDef> = {
    'street_thug': {
        id: 'street_thug',
        name: 'Street Thug',
        level: 1,
        hp: 20,
        maxHp: 20,
        power: 3,
        defense: 0,
        xpReward: 15,
        cashReward: 10,
        drops: [],
        taunts: [
            "Empty your pockets!",
            "You lost, kid?",
            "Easy money."
        ]
    },
    'mugger': {
        id: 'mugger',
        name: 'Alley Mugger',
        level: 2,
        hp: 35,
        maxHp: 35,
        power: 6,
        defense: 1,
        xpReward: 25,
        cashReward: 25,
        drops: [],
        taunts: [
            "This won't take long.",
            "Nice watch.",
            "Hold still!"
        ]
    },
    'corporate_security': {
        id: 'corporate_security',
        name: 'Corp Sec Guard',
        level: 5,
        hp: 100,
        maxHp: 100,
        power: 12,
        defense: 5,
        xpReward: 60,
        cashReward: 100,
        drops: [],
        taunts: [
            "Clear the area.",
            "Restricted access.",
            "Hostile detected."
        ]
    },
    'cyber_psycho': {
        id: 'cyber_psycho',
        name: 'Cyber Psycho',
        level: 8,
        hp: 250,
        maxHp: 250,
        power: 20,
        defense: 10,
        xpReward: 150,
        cashReward: 300,
        drops: [],
        taunts: [
            "THE NOISE!!",
            "MAKE IT STOP!",
            "FLESH IS WEAK!"
        ]
    }
};
