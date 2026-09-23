export interface Course {
    id: string;
    name: string;
    description: string;
    cost: number;
    duration: number; // Days or Time Units
    statGain: {
        intelligence?: number;
        charisma?: number;
        strength?: number;
        karma?: number;
    };
    minIntelligence?: number;
}

export const COURSES: Course[] = [
    {
        id: 'ged',
        name: 'GED Preparation',
        description: 'Basic high school equivalency. Essential for most jobs.',
        cost: 150,
        duration: 5,
        statGain: { intelligence: 5 }
    },
    {
        id: 'comm_101',
        name: 'Public Speaking 101',
        description: 'Learn to speak without sweating. +Charisma.',
        cost: 300,
        duration: 3,
        statGain: { charisma: 5 }
    },
    {
        id: 'econ_101',
        name: 'Intro to Economics',
        description: 'Understand the market. +Intelligence.',
        cost: 500,
        duration: 7,
        statGain: { intelligence: 10 }
    },
    {
        id: 'mba',
        name: 'Mini-MBA',
        description: 'Fast track to management. Requires some smarts.',
        cost: 2000,
        duration: 14,
        statGain: { intelligence: 20, charisma: 10 },
        minIntelligence: 30
    }
];
