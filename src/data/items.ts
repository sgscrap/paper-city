export interface Item {
    id: string;
    name: string;
    shopDistrict?: 'corporate_towers' | 'underground_markets' | 'political_offices';
    discountFlags?: { flag: string; percent: number }[];
    type: 'consumable' | 'weapon' | 'misc' | 'electronics' | 'luxury' | 'gym';
    description: string;
    cost: number;
    effects?: {
        stat: string; // 'will', 'power', 'intelligence', 'charisma', 'worth'
        value: number;
    }[];
    weaponStats?: {
        damage: number;
        accuracy: number; // Percentage (0-100)
        critChance: number; // Percentage (0-100)
    };
}

export const ITEMS: Record<string, Item> = {
    // --- CONSUMABLES (PHARMACY / GENERAL) ---
    'donut': {
        id: 'donut',
        name: 'Coalition Donut',
        type: 'consumable',
        description: 'A paper-wrapped reward for surviving another conversation. Restores a little Will.',
        cost: 5,
        effects: [{ stat: 'will', value: 8 }]
    },
    'energy_drink': {
        id: 'energy_drink',
        name: 'Neon Rush',
        type: 'consumable',
        description: 'Cheap synthetic energy. Restores Will.',
        cost: 10,
        effects: [{ stat: 'will', value: 20 }]
    },
    'synthetic_burger': {
        id: 'synthetic_burger',
        name: 'Synth-Burger',
        type: 'consumable',
        description: 'Tastes like cardboard, feels like fullness.',
        cost: 15,
        effects: [{ stat: 'will', value: 30 }, { stat: 'power', value: 1 }]
    },
    'focus_pill': {
        id: 'focus_pill',
        name: 'Focus Stick',
        type: 'consumable',
        description: 'Illegal focus enhancer. Boosts Intelligence temporarily.',
        cost: 50,
        effects: [{ stat: 'intelligence', value: 5 }, { stat: 'will', value: -10 }]
    },
    'cheap_coffee': {
        id: 'cheap_coffee',
        name: 'Diner Sludge',
        type: 'consumable',
        description: 'Lukewarm, bitter, but it works. Restores a bit of Will.',
        cost: 4,
        effects: [{ stat: 'will', value: 8 }]
    },
    'broken_bottle': {
        id: 'broken_bottle',
        name: 'Jagged Bottle',
        type: 'weapon',
        description: 'An improvised tool for desperate times.',
        cost: 15,
        weaponStats: {
            damage: 4,
            accuracy: 75,
            critChance: 20
        },
        effects: [{ stat: 'luck', value: -1 }]
    },
    'lucky_charm': {
        id: 'lucky_charm',
        name: 'Cracked Rabbit Foot',
        type: 'misc',
        description: 'A grim token that might bring good fortune.',
        cost: 30,
        effects: [{ stat: 'luck', value: 2 }]
    },

    // --- THE WATERFRONT (parity set: one utility item per faction playstyle) ---
    'harbor_seal': {
        id: 'harbor_seal',
        name: 'Harbor Seal',
        type: 'misc',
        description: 'An unbroken customs seal, valid anywhere paperwork matters. Official-adjacent.',
        cost: 45,
        effects: [{ stat: 'charisma', value: 2 }]
    },
    'redrafted_manifest': {
        id: 'redrafted_manifest',
        name: 'Redrafted Manifest',
        type: 'misc',
        description: 'The true cargo list, corrected in a hand that was never there.',
        cost: 45,
        effects: [{ stat: 'intelligence', value: 2 }]
    },
    'crane_hook': {
        id: 'crane_hook',
        name: 'Crane Hook',
        type: 'weapon',
        description: 'A mooring hook that left the dock the honest way: inside a coat.',
        cost: 45,
        weaponStats: {
            damage: 7,
            accuracy: 70,
            critChance: 10
        },
        effects: [{ stat: 'power', value: 1 }]
    },

    // --- FOUNDRY ROW (parity set: one utility item per faction playstyle) ---
    'pressed_crest': {
        id: 'pressed_crest',
        name: 'Pressed Crest',
        type: 'misc',
        description: 'A coalition medallion struck off the old presses. Civic doors open a little easier for the visibly affiliated.',
        cost: 45,
        effects: [{ stat: 'charisma', value: 2 }]
    },
    'counterfeit_ledger': {
        id: 'counterfeit_ledger',
        name: 'Counterfeit Ledger',
        type: 'misc',
        description: 'Numbers that were true once, twice removed. Useful for people who trade on information.',
        cost: 45,
        effects: [{ stat: 'intelligence', value: 2 }]
    },
    'weighted_knuckles': {
        id: 'weighted_knuckles',
        name: 'Weighted Knuckles',
        type: 'weapon',
        description: 'Press bearings in a glove. Slow, heavy, final.',
        cost: 45,
        weaponStats: {
            damage: 7,
            accuracy: 70,
            critChance: 10
        },
        effects: [{ stat: 'power', value: 1 }]
    },

    // --- GYM / HEALTH ---
    'protein_shake': {
        id: 'protein_shake',
        name: 'Titan Whey',
        type: 'gym',
        description: 'Mass gainer. +Power.',
        cost: 25,
        effects: [{ stat: 'power', value: 2 }, { stat: 'will', value: 10 }]
    },
    'dumbbells': {
        id: 'dumbbells',
        name: 'Heavy Iron',
        type: 'gym',
        description: 'Home workout gear. Small consistent gains.',
        cost: 150,
        // Logic for "Permanent" items needing usage is complex, treating as consumable boost for MVP or just inventory check later
        effects: [{ stat: 'power', value: 5 }]
    },
    'gym_membership': {
        id: 'gym_membership',
        name: 'SG Fitness Membership',
        type: 'gym',
        description: 'Standard access card. Required for entry.',
        cost: 200,
        effects: []
    },
    'gym_shirt': {
        id: 'gym_shirt',
        name: 'Compression Shirt',
        type: 'gym',
        description: 'Shows off the gains. Required for gym.',
        cost: 40,
        effects: [{ stat: 'charisma', value: 1 }]
    },
    'gym_shorts': {
        id: 'gym_shorts',
        name: 'Tech Shorts',
        type: 'gym',
        description: 'Breathable fabric. Required for gym.',
        cost: 35,
        effects: [{ stat: 'power', value: 0 }]
    },
    'gym_shoes': {
        id: 'gym_shoes',
        name: 'Cross-Trainers',
        type: 'gym',
        description: 'For traction. Required for gym.',
        cost: 80,
        effects: [{ stat: 'luck', value: 1 }]
    },

    // --- ELECTRONICS ---
    'smartphone': {
        id: 'smartphone',
        name: 'CyberPhone X',
        type: 'electronics',
        description: 'Stay connected. Required for some gigs.',
        cost: 500,
        effects: [{ stat: 'intelligence', value: 2 }]
    },
    'laptop': {
        id: 'laptop',
        name: 'Deck-9 Laptop',
        type: 'electronics',
        description: 'High performance rig. Essential for Tech jobs.',
        cost: 1200,
        effects: [{ stat: 'intelligence', value: 10 }]
    },
    'server_blade': {
        id: 'server_blade',
        name: 'Server Unit',
        shopDistrict: 'corporate_towers',
        discountFlags: [{ flag: 'ghost_ending_broker', percent: 20 }, { flag: 'ghost_ending_channel', percent: 10 }],
        type: 'electronics',
        description: 'Heavy duty computing. For the serious netrunner.',
        cost: 3000,
        effects: [{ stat: 'intelligence', value: 25 }]
    },

    // --- LUXURY ---
    'suit_cheap': {
        id: 'suit_cheap',
        name: 'Polyester Suit',
        type: 'luxury',
        description: 'Itches, but looks professional... from a distance.',
        cost: 200,
        effects: [{ stat: 'charisma', value: 5 }]
    },
    'suit_nice': {
        id: 'suit_nice',
        name: 'Silk Suit',
        type: 'luxury',
        description: 'Smooth. Sharp. Corporate ready.',
        cost: 1000,
        effects: [{ stat: 'charisma', value: 15 }]
    },
    'gold_watch': {
        id: 'gold_watch',
        name: 'Gold Chrono',
        type: 'luxury',
        description: 'Tells time and your net worth.',
        cost: 5000,
        effects: [{ stat: 'charisma', value: 30 }, { stat: 'worth', value: 0 }] // Doesn't add worth directly, but implies it
    },

    // --- WEAPONS ---
    'fists': {
        id: 'fists',
        name: 'Bare Hands',
        type: 'weapon',
        description: 'Old reliable. Good for brawls.',
        cost: 0,
        weaponStats: {
            damage: 2,
            accuracy: 90,
            critChance: 5
        }
    },
    'switchblade': {
        id: 'switchblade',
        name: 'Rusty Switchblade',
        type: 'weapon',
        description: 'Fast and nasty. Better than nothing.',
        cost: 120,
        weaponStats: {
            damage: 8,
            accuracy: 85,
            critChance: 15
        },
        effects: [{ stat: 'power', value: 5 }]
    },
    'glock': {
        id: 'glock',
        name: 'Standard Glock',
        shopDistrict: 'political_offices',
        discountFlags: [{ flag: 'angel_ending_steward', percent: 20 }, { flag: 'angel_ending_authority', percent: 15 }],
        type: 'weapon',
        description: 'Coalition standard issue. Loud.',
        cost: 500,
        weaponStats: {
            damage: 25,
            accuracy: 80,
            critChance: 10
        },
        effects: [{ stat: 'power', value: 20 }]
    },
    'plasma_rifle': {
        id: 'plasma_rifle',
        name: 'Plasma Rifle',
        shopDistrict: 'underground_markets',
        discountFlags: [{ flag: 'demon_ending_enforcer', percent: 20 }, { flag: 'demon_ending_monster', percent: 10 }],
        type: 'weapon',
        description: 'Illegal military tech. Melts faces.',
        cost: 4500,
        weaponStats: {
            damage: 60,
            accuracy: 95,
            critChance: 25
        },
        effects: [{ stat: 'power', value: 50 }]
    },

    // --- MISC / QUEST ---
    'mystery_package': {
        id: 'mystery_package',
        name: 'Sealed Package',
        type: 'misc',
        description: 'Do not open. Deliver to Shadow HQ.',
        cost: 0
    }
};
