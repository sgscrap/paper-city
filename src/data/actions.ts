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
    },

    // --- FOUNDRY ROW (parity set: same energy/time band, faction-flavored outcomes) ---
    FOUNDRY_PRESS_WORK: {
        id: 'FOUNDRY_PRESS_WORK',
        label: 'Press Work',
        description: 'Strike a run of plates on the old foundry press. Honest, loud, reliable.',
        cost: {
            time: 120,
            will: 20
        },
        reqs: {
            stats: { power: 10 }
        },
        rewards: {
            money: 85,
            xp: 30,
            stats: { power: 1 }
        }
    },
    FOUNDRY_SCRAP_SORT: {
        id: 'FOUNDRY_SCRAP_SORT',
        label: 'Scrap & Sort',
        description: 'Sort the day\'s scrap into resale grades. Quiet eyes find quiet value.',
        cost: {
            time: 90,
            will: 15
        },
        reqs: {
            stats: { intelligence: 10 }
        },
        rewards: {
            money: 60,
            xp: 28,
            stats: { intelligence: 1 }
        }
    },
    FOUNDRY_COUNCIL_CHECK: {
        id: 'FOUNDRY_COUNCIL_CHECK',
        label: 'Council Hearing',
        description: 'Sit in on the neutral council and hear who is bidding for the Row.',
        cost: {
            time: 30,
            will: 5
        },
        reqs: {
            stats: { charisma: 10 }
        },
        rewards: {
            xp: 18,
            karma: 1,
            stats: { charisma: 1 }
        }
    },

    // --- THE WATERFRONT (parity set: same energy/time band, faction-flavored outcomes) ---
    DOCK_MANIFEST_AUDIT: {
        id: 'DOCK_MANIFEST_AUDIT',
        label: 'Manifest Audit',
        description: 'Check arriving cargo against the stamped manifests. Lead seals do not lie; people do.',
        cost: {
            time: 120,
            will: 20
        },
        reqs: {
            stats: { intelligence: 10 }
        },
        rewards: {
            money: 85,
            xp: 30,
            stats: { intelligence: 1 }
        }
    },
    DOCK_CONTAINER_SORT: {
        id: 'DOCK_CONTAINER_SORT',
        label: 'Container Sort',
        description: 'Break down mixed lots at the stevedore shed and grade what the cranes dropped.',
        cost: {
            time: 90,
            will: 15
        },
        reqs: {
            stats: { power: 10 }
        },
        rewards: {
            money: 60,
            xp: 28,
            stats: { power: 1 }
        }
    },
    CUSTOMS_HOUSE_REVIEW: {
        id: 'CUSTOMS_HOUSE_REVIEW',
        label: 'Customs Review',
        description: 'Sit in on the customs docket and learn which ships the city is watching.',
        cost: {
            time: 30,
            will: 5
        },
        reqs: {
            stats: { charisma: 10 }
        },
        rewards: {
            xp: 18,
            karma: 1,
            stats: { charisma: 1 }
        }
    }
};
