export interface Trait {
    id: string;
    name: string;
    description: string;
    effects?: {
        stat?: string;
        value?: number;
    }[];
}

export const TRAITS: Record<string, Trait> = {
    'photographic_memory': {
        id: 'photographic_memory',
        name: 'PHOTOGRAPHIC_MEMORY',
        description: 'Passive XP gain increased by 15%.',
    },
    'too_cool_for_school': {
        id: 'too_cool_for_school',
        name: 'TOO_COOL_FOR_SCHOOL',
        description: '+10 starting Charisma. NPCs more likely to trust you.',
    },
    'beef_cake': {
        id: 'beef_cake',
        name: 'BEEF_CAKE',
        description: '+15 starting Power. Combat damage increased.',
    },
    'wall_street_wizard': {
        id: 'wall_street_wizard',
        name: 'WALL_STREET_WIZARD',
        description: '+10% Stock Market returns. Start with $500 extra.',
    },
    'workaholic': {
        id: 'workaholic',
        name: 'WORKAHOLIC',
        description: 'Physical fatigue from jobs reduced by 20%.',
    },
    'warped_mind': {
        id: 'warped_mind',
        name: 'WARPED_MIND',
        description: '+20 Intelligence, but -5 Luck. Unlocks unique dialogue.',
    },
    'interpretive_dancer': {
        id: 'interpretive_dancer',
        name: 'INTERPRETIVE_DANCER',
        description: '+30 Luck. You move in mysterious ways.',
    }
};
