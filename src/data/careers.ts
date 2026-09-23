import { Career } from '@/types';

export const CAREERS: Record<string, Career> = {
    // --- TIER 0 (UNSKILLED) ---
    manual_laborer: {
        id: 'manual_laborer',
        title: 'Manual Laborer',
        location: 'the_block',
        tier: 1, // Treating as Tier 1 for now but with 0 reqs
        statReqs: {},
        dailyPay: 80,
        description: 'Hard work for low pay. No questions asked.',
        karmaAlignment: 'ghost',
        nextTier: 'street_hustler'
    },
    data_entry_intern: {
        id: 'data_entry_intern',
        title: 'Data Entry Intern',
        location: 'corporate_towers',
        tier: 1,
        statReqs: {},
        dailyPay: 90,
        description: 'Inputting junk data. Mind-numbing but pays the bills.',
        karmaAlignment: 'ghost',
        requiredFaction: 'ghost',
        requiredReputation: 8,
        nextTier: 'lab_assistant'
    },
    // --- TIER 1 (ENTRY LEVEL) ---
    street_hustler: {
        id: 'street_hustler',
        title: 'Street Hustler',
        location: 'the_block',
        tier: 1,
        statReqs: { power: 20, charisma: 30 },
        dailyPay: 150,
        description: 'Make quick cash on the streets. Watch your back.',
        karmaAlignment: 'demon',
        nextTier: 'gang_member'
    },
    creative_director: { // Entry level is actually "Creative Intern" usually, but following GDD naming/flow
        id: 'creative_director_junior',
        title: 'Creative Freelancer',
        location: 'corporate_towers',
        tier: 1,
        statReqs: { intelligence: 40, charisma: 35 },
        dailyPay: 200,
        description: 'Design campaigns, launch brands. Hype is currency.',
        karmaAlignment: 'angel',
        requiredFaction: 'angel',
        requiredReputation: 8,
        nextTier: 'media_icon'
    },
    stock_trader: {
        id: 'stock_trader',
        title: 'Day Trader',
        location: 'corporate_towers',
        tier: 1,
        statReqs: { intelligence: 50 },
        dailyPay: 300, // Volatile in logic
        description: 'Buy low, sell high. The market waits for no one.',
        karmaAlignment: 'ghost',
        nextTier: 'corporate_climber'
    },
    gym_instructor: {
        id: 'gym_instructor',
        title: 'Gym Instructor',
        location: 'the_block',
        tier: 1,
        statReqs: { power: 45, will: 40 },
        dailyPay: 180,
        description: 'Train others, build rep. Gains for days.',
        karmaAlignment: 'angel',
        nextTier: 'fitness_mogul'
    },
    // Adding more to flush out the world
    lab_assistant: {
        id: 'lab_assistant',
        title: 'Lab Rat',
        location: 'corporate_towers',
        tier: 1,
        statReqs: { intelligence: 30 },
        dailyPay: 160,
        description: 'Test mysterious substances. Hope for superpowers.',
        karmaAlignment: 'ghost',
        nextTier: 'tech_architect'
    },
    black_market_runner: {
        id: 'black_market_runner',
        title: 'Market Runner',
        location: 'underground_markets',
        tier: 1,
        statReqs: { power: 30, charisma: 20 },
        dailyPay: 180,
        description: 'Deliver unmarked packages. Don\'t ask what\'s inside.',
        karmaAlignment: 'demon',
        nextTier: 'gang_member'
    },
    script_kiddie: {
        id: 'script_kiddie',
        title: 'Script Kiddie',
        location: 'underground_markets',
        tier: 1,
        statReqs: { intelligence: 45 },
        dailyPay: 220,
        description: 'Harvesting data for the darkweb. Low risk, medium reward.',
        karmaAlignment: 'demon',
        requiredFaction: 'demon',
        requiredReputation: 8,
        nextTier: 'tech_architect' // Alternate path to tech
    },

    // --- TIER 2 (MID LEVEL) ---
    gang_member: {
        id: 'gang_member',
        title: 'Gang Lieutenant',
        location: 'underground_markets',
        tier: 2,
        statReqs: { power: 50, charisma: 40 },
        dailyPay: 400,
        description: 'Run the block. Intimidate the weak.',
        karmaAlignment: 'demon',
        requiredFaction: 'demon',
        requiredReputation: 15,
        nextTier: 'dark_lord'
    },
    media_icon: {
        id: 'media_icon',
        title: 'Media Superstar',
        location: 'corporate_towers',
        tier: 2,
        statReqs: { charisma: 70, intelligence: 50 },
        dailyPay: 800,
        description: 'Your face is everywhere. Influence the masses.',
        karmaAlignment: 'angel',
        nextTier: 'legend'
    },
    tech_architect: {
        id: 'tech_architect',
        title: 'Tech Architect',
        location: 'corporate_towers',
        tier: 2,
        statReqs: { intelligence: 70, power: 35 },
        dailyPay: 600,
        description: 'Build the systems that control the city.',
        karmaAlignment: 'ghost',
        nextTier: 'shadow_investor'
    },
    political_operative: {
        id: 'political_operative',
        title: 'Political Fixer',
        location: 'political_offices',
        tier: 2,
        statReqs: { intelligence: 55, charisma: 50 },
        dailyPay: 450,
        description: 'Spin narratives, bury scandals.',
        karmaAlignment: 'angel',
        requiredFaction: 'angel',
        requiredReputation: 15,
        nextTier: 'coalition_enforcer'
    },

    // --- MISSING TIER 2 ---
    corporate_climber: {
        id: 'corporate_climber',
        title: 'Corporate Climber',
        location: 'corporate_towers',
        tier: 2,
        statReqs: { intelligence: 60, charisma: 40 },
        dailyPay: 550,
        description: 'Climbing the ladder, one backstab at a time.',
        karmaAlignment: 'ghost',
        nextTier: 'shadow_investor'
    },
    fitness_mogul: {
        id: 'fitness_mogul',
        title: 'Fitness Mogul',
        location: 'the_block',
        tier: 2,
        statReqs: { power: 65, charisma: 50 },
        dailyPay: 500,
        description: 'Your brand is strength. Sell the dream.',
        karmaAlignment: 'angel',
        nextTier: 'legend'
    },

    // --- TIER 3 (END GAME) ---
    dark_lord: {
        id: 'dark_lord',
        title: 'Dark Lord',
        location: 'underground_markets',
        tier: 3,
        statReqs: { power: 80, intelligence: 60 },
        dailyPay: 1500,
        description: 'Rule through fear. The city is your playground.',
        karmaAlignment: 'demon'
    },
    light_knight: {
        id: 'light_knight',
        title: 'Light Knight',
        location: 'political_offices',
        tier: 3,
        statReqs: { power: 75, will: 80 },
        dailyPay: 1200,
        description: 'Protector of the innocent. A beacon of hope.',
        karmaAlignment: 'angel'
    },
    shadow_investor: {
        id: 'shadow_investor',
        title: 'Shadow Investor',
        location: 'corporate_towers',
        tier: 3,
        statReqs: { intelligence: 85, worth: 10000 },
        dailyPay: 2000,
        description: 'You own the banks. You own the debt. You own the city.',
        karmaAlignment: 'ghost'
    },
    legend: {
        id: 'legend',
        title: 'City Legend',
        location: 'corporate_towers',
        tier: 3,
        statReqs: { charisma: 90, worth: 5000 },
        dailyPay: 1800,
        description: 'Your name is written in neon across the skyline.',
        karmaAlignment: 'angel'
    },
    coalition_enforcer: {
        id: 'coalition_enforcer',
        title: 'Coalition Enforcer',
        location: 'political_offices',
        tier: 3,
        statReqs: { power: 85, intelligence: 50 },
        dailyPay: 1600,
        description: 'The law is what you say it is.',
        karmaAlignment: 'ghost'
    }
};
