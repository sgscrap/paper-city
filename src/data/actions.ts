import { Stats } from '@/types';

export interface ActionDefinition {
    id: string;
    label: string;
    description: string;
    cost: {
        time?: number; // Minutes
        will?: number;
        money?: number;
    };
    reqs?: {
        stats?: Partial<Stats>; // Minimum stats needed
    };
    rewards: {
        money?: number;
        xp?: number;
        stats?: Partial<Stats>; // Direct stat gain
        karma?: number;
        energy?: number; // Restore energy
    };
}

export const ACTIONS: Record<string, ActionDefinition> = {
    // --- BASIC SURVIVAL ---
    RELAX: {
        id: 'RELAX',
        label: 'Relax in Park',
        description: 'Take a break to recover some energy.',
        cost: {
            time: 45, // 45 mins
            // No money cost
        },
        rewards: {
            energy: 30,
            xp: 5
        }
    },

    // --- JOBS (Generic / Day Labor) ---
    WORK_SHIFT: {
        id: 'WORK_SHIFT',
        label: 'Day Labor',
        description: 'Manual labor for quick cash.',
        cost: {
            time: 240, // 4 hours
            will: 30
        },
        reqs: {
            stats: { power: 5 } // Basic fitness
        },
        rewards: {
            money: 60,
            stats: { power: 1 },
            xp: 20
        }
    },

    // --- TRAINING ---
    TRAIN_POWER: {
        id: 'TRAIN_POWER',
        label: 'Hit the Gym',
        description: 'Lift weights to build strength.',
        cost: {
            time: 90,
            will: 25,
            money: 10
        },
        rewards: {
            stats: { power: 2 },
            xp: 20
        }
    },
    TRAIN_CARDIO: {
        id: 'TRAIN_CARDIO',
        label: 'Cardio',
        description: 'Run on the treadmill.',
        cost: {
            time: 60,
            will: 15
        },
        rewards: {
            stats: { will: 1 },
            xp: 15
        }
    },
    TRAIN_INT: {
        id: 'TRAIN_INT',
        label: 'Study at Library',
        description: 'Read books to improve intelligence.',
        cost: {
            time: 120,
            will: 20,
            money: 5 // Printing/Access fee
        },
        rewards: {
            stats: { intelligence: 2 },
            xp: 20
        }
    },
    TRAIN_CHA: {
        id: 'TRAIN_CHA',
        label: 'Socialize at Bar',
        description: 'Talk to strangers to improve charisma.',
        cost: {
            time: 120,
            will: 15,
            money: 25
        },
        rewards: {
            stats: { charisma: 2 },
            xp: 20
        }
    },

    // --- LUCK ---
    BUY_LOTTO: {
        id: 'BUY_LOTTO',
        label: 'Buy Lotto Ticket',
        description: 'Feeling lucky?',
        cost: {
            money: 5,
            time: 5
        },
        rewards: {
            stats: { luck: 1 },
            xp: 5
            // Actual money win handled by logic, but baseline stats here
        }
    }
};
