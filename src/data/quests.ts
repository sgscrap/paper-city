import { Quest } from '@/types/quests';

export const QUESTS: Record<string, Quest> = {
    // --- TUTORIAL ARC ---
    'trust_yourself_intro': {
        id: 'trust_yourself_intro',
        title: 'Trust Yourself',
        description: 'Paper City only cares what you do. Take your first step.',
        status: 'active', // Starts active
        objectives: [
            { id: 'meet_ace', description: 'Talk to Ace at The Block', completed: false }
        ],
        rewards: { xp: 0, cash: 0 }
    },
    'get_moving': {
        id: 'get_moving',
        title: 'Get Moving',
        description: 'Ace says you need to start somewhere. Work, Train, or Study.',
        status: 'locked',
        objectives: [
            // Generic "Do Action" objective - requires logic check
            { id: 'do_any_action', description: 'Complete any action (Work, Train, Study)', completed: false }
        ],
        rewards: { xp: 10, cash: 50 },
        nextQuest: 'first_bag'
    },
    'first_bag': {
        id: 'first_bag',
        title: 'First Bag',
        description: 'You need resources to survive. Earn a total net worth of $300.',
        status: 'locked',
        objectives: [
            { id: 'earn_300', description: 'Reach $300 Net Worth (Cash + Stash + Stocks)', completed: false, targetAmount: 300, currentAmount: 0 }
        ],
        rewards: { xp: 50 },
        nextQuest: 'pick_a_lane'
    },
    'pick_a_lane': {
        id: 'pick_a_lane',
        title: 'Pick a Lane',
        description: 'The city is watching. Decide how you want to be known.',
        status: 'locked',
        objectives: [
            { id: 'choose_path', description: 'Choose a Path: Body, Mind, or Aura', completed: false }
        ],
        rewards: { xp: 100 },
        choices: [
            { id: 'angel', label: 'Stand with the Coalition', description: 'Order, protection, and legitimacy.', faction: 'angel', rewards: { reputation: { angel: 12 }, flags: ['faction_angel'] }, nextQuest: 'angel_first_watch' },
            { id: 'ghost', label: 'Keep Your Own Files', description: 'Information, leverage, and quiet alliances.', faction: 'ghost', rewards: { reputation: { ghost: 12 }, flags: ['faction_ghost'] }, nextQuest: 'ghost_first_signal' },
            { id: 'demon', label: 'Make Them Remember You', description: 'Fear, influence, and high-risk rewards.', faction: 'demon', rewards: { reputation: { demon: 12 }, flags: ['faction_demon'] }, nextQuest: 'demon_first_debt' }
        ]
    },
    'mind_or_muscle': {
        id: 'mind_or_muscle',
        title: 'Mind or Muscle',
        description: 'Mara looks tough. Maybe she has a point about getting stronger.',
        status: 'locked',
        objectives: [
            { id: 'improve_self', description: 'Train Power OR Study Mind', completed: false }
        ],
        rewards: { xp: 0, stats: { power: 1 } }
    },
    'first_conflict': {
        id: 'first_conflict',
        title: 'First Conflict',
        description: 'Rook mentioned the city keeps score. Be ready for trouble.',
        status: 'locked',
        objectives: [
            { id: 'resolve_conflict', description: 'Win a bar fight OR Walk away from trouble', completed: false }
        ],
        rewards: { xp: 50 }
    },
    'prove_yourself': {
        id: 'prove_yourself',
        title: 'Prove You\'re Serious',
        description: 'Lena controls the keys to the market. You need to pass the exam.',
        status: 'locked',
        objectives: [
            { id: 'pass_series7', description: 'Pass the Series 7 Exam at University', completed: false }
        ],
        rewards: { xp: 100, cash: 0 }
    },

    'gym_initiation': {
        id: 'gym_initiation',
        title: 'Iron Pumping Initiation',
        description: 'The gym manager kicked you out. "No gear, no lift," he said. You need to look the part.',
        status: 'locked',
        objectives: [
            {
                id: 'buy_membership',
                description: 'Buy an SG Fitness Membership',
                completed: false
            },
            {
                id: 'buy_gear',
                description: 'Buy Gym Gear (Shirt, Shorts, Shoes) from Towson Mall',
                completed: false
            }
        ],
        rewards: {
            xp: 50,
            cash: 0
        }
    },
    'stock_license': {
        id: 'stock_license',
        title: 'Stock Broker License',
        description: 'The Trading Floor is restricted. Go to Morgan University and pass the Series 7 Exam to trade stocks.',
        status: 'locked',
        objectives: [
            {
                id: 'visit_university',
                description: 'Go to Morgan University',
                completed: false
            },
            {
                id: 'pass_exam',
                description: 'Pass the Series 7 Exam',
                completed: false
            }
        ],
        rewards: {
            xp: 100,
            cash: 0,
            items: [] // Could give a physical license item
        }
    },
    'angel_first_watch': {
        id: 'angel_first_watch', title: 'First Watch', description: 'Ace wants proof that your protection is more than talk.', status: 'locked', faction: 'angel', arcId: 'angel', arcStage: 1,
        objectives: [{ id: 'help_neighbor', description: 'Complete the Neighborhood Watch contract', completed: false, trigger: 'contract_complete', target: 'angel_neighborhood_watch' }],
        rewards: { cash: 100, xp: 60, reputation: { angel: 8 }, flags: ['angel_trusted'] }, nextQuest: 'angel_public_record'
    },
    'angel_public_record': {
        id: 'angel_public_record', title: 'Public Record', description: 'Use the Civic Center to turn a private favor into public protection.', status: 'locked', faction: 'angel', arcId: 'angel',
        objectives: [{ id: 'reach_civic_center', description: 'Travel to the Civic Center', completed: false, trigger: 'travel', target: 'political_offices' }],
        rewards: { xp: 80, reputation: { angel: 10 } }, nextQuest: 'angel_coalition_line', arcStage: 2,
        choices: [
            { id: 'protect_publicly', label: 'Publish the report', description: 'Make the Coalition answer in public. Gain trust, lose quiet leverage.', rewards: { reputation: { angel: 6 }, relationships: { npc_mayor: 4 }, flags: ['angel_public_record'] } },
            { id: 'bury_quietly', label: 'Bury the report', description: 'Protect the institution and keep the information private.', rewards: { reputation: { angel: 3, ghost: 2 }, flags: ['angel_buried_record'] } }
        ]
    },
    'ghost_first_signal': {
        id: 'ghost_first_signal', title: 'First Signal', description: 'Ghost has a rumor that could open the lower city.', status: 'locked', faction: 'ghost', arcId: 'ghost',
        objectives: [{ id: 'find_signal', description: 'Complete the Quiet Information contract', completed: false, trigger: 'contract_complete', target: 'ghost_market_tip' }],
        rewards: { cash: 120, xp: 70, reputation: { ghost: 8 }, flags: ['ghost_trusted'] }, nextQuest: 'ghost_open_channel'
    },
    'ghost_open_channel': {
        id: 'ghost_open_channel', title: 'Open Channel', description: 'A market tip is only useful if you act on it.', status: 'locked', faction: 'ghost', arcId: 'ghost',
        objectives: [{ id: 'make_trade', description: 'Make a market trade', completed: false, trigger: 'action_complete', target: 'MARKET_TRADE' }],
        rewards: { xp: 90, reputation: { ghost: 10 } }, nextQuest: 'ghost_price_of_knowing', arcStage: 2,
        choices: [
            { id: 'share_tip', label: 'Share the tip', description: 'Let the neighborhood profit. Build trust, reduce your edge.', rewards: { reputation: { ghost: 5, angel: 2 }, relationships: { npc_ghost: 5 }, flags: ['ghost_shared_tip'] } },
            { id: 'sell_tip', label: 'Sell the tip', description: 'Keep the advantage for yourself. Ghost respects the result, not the method.', rewards: { cash: 75, reputation: { ghost: 2, demon: 3 }, flags: ['ghost_sold_tip'] } }
        ]
    },
    'demon_first_debt': {
        id: 'demon_first_debt', title: 'First Debt', description: 'Rook wants a result, not an apology.', status: 'locked', faction: 'demon', arcId: 'demon',
        objectives: [{ id: 'collect_debt', description: 'Complete the debt collection contract', completed: false, trigger: 'contract_complete', target: 'demon_collection' }],
        rewards: { cash: 150, xp: 70, reputation: { demon: 8 }, flags: ['demon_trusted'] }, nextQuest: 'demon_fight_night'
    },
    'demon_fight_night': {
        id: 'demon_fight_night', title: 'Fight Night', description: 'The underworld has a seat with your name on it.', status: 'locked', faction: 'demon', arcId: 'demon',
        objectives: [{ id: 'win_fight', description: 'Win a combat encounter', completed: false, trigger: 'combat_result', target: 'win' }],
        rewards: { xp: 100, reputation: { demon: 12 } }, nextQuest: 'demon_seat_below', arcStage: 2,
        choices: [
            { id: 'finish_them', label: 'Finish the fight', description: 'Make the result unforgettable. Fear rises, and so does your reputation.', rewards: { reputation: { demon: 7 }, flags: ['demon_unforgiving'] } },
            { id: 'spare_them', label: 'Spare the opponent', description: 'Show restraint in a world that expects cruelty.', rewards: { reputation: { demon: 3, angel: 2 }, relationships: { npc_rook: 3 }, flags: ['demon_showed_mercy'] } }
        ]
    },
    'angel_coalition_line': {
        id: 'angel_coalition_line', title: 'The Coalition Line', description: 'A public order demands a private sacrifice. Decide who protection is really for.', status: 'locked', faction: 'angel', arcId: 'angel', arcStage: 3, arcConclusion: 'angel',
        objectives: [{ id: 'reach_civic_center_again', description: 'Return to the Civic Center', completed: false, trigger: 'travel', target: 'political_offices' }],
        rewards: { xp: 120, reputation: { angel: 12 } },
        choices: [
            { id: 'coalition_steward', branchGroup: 'angel_ending', label: 'Protect the public record', description: 'Choose accountability over convenience and become a trusted civic steward.', rewards: { reputation: { angel: 8 }, relationships: { npc_mayor: 6 }, flags: ['angel_ending_steward', 'arc_complete_angel'] } },
            { id: 'paper_authority', branchGroup: 'angel_ending', label: 'Protect the institution', description: 'Keep the Coalition stable, even if the truth stays buried.', rewards: { cash: 180, reputation: { angel: 5 }, flags: ['angel_ending_authority', 'arc_complete_angel'] } }
        ]
    },
    'ghost_price_of_knowing': {
        id: 'ghost_price_of_knowing', title: 'The Price of Knowing', description: 'You have the information everyone wants. Decide who gets burned by it.', status: 'locked', faction: 'ghost', arcId: 'ghost', arcStage: 3, arcConclusion: 'ghost',
        objectives: [{ id: 'reach_corporate_towers', description: 'Reach Corporate Towers', completed: false, trigger: 'travel', target: 'corporate_towers' }],
        rewards: { xp: 120, reputation: { ghost: 12 } },
        choices: [
            { id: 'open_channel', branchGroup: 'ghost_ending', label: 'Open the channel', description: 'Share the information widely and give the city a chance to respond.', rewards: { reputation: { ghost: 8, angel: 2 }, relationships: { npc_ghost: 6 }, flags: ['ghost_ending_channel', 'arc_complete_ghost'] } },
            { id: 'quiet_broker', branchGroup: 'ghost_ending', label: 'Keep the leverage', description: 'Sell access one secret at a time and become the city’s quiet broker.', rewards: { cash: 220, reputation: { ghost: 5 }, flags: ['ghost_ending_broker', 'arc_complete_ghost'] } }
        ]
    },
    'demon_seat_below': {
        id: 'demon_seat_below', title: 'The Seat Below', description: 'Rook offers you a place at the table. Rule through fear, loyalty, or controlled mercy.', status: 'locked', faction: 'demon', arcId: 'demon', arcStage: 3, arcConclusion: 'demon',
        objectives: [{ id: 'reach_underground', description: 'Return to the Underground Markets', completed: false, trigger: 'travel', target: 'underground_markets' }],
        rewards: { xp: 120, reputation: { demon: 12 } },
        choices: [
            { id: 'enforcer', branchGroup: 'demon_ending', label: 'Rule through fear', description: 'Make the underworld remember exactly who owns the room.', rewards: { reputation: { demon: 8 }, relationships: { npc_rook: 6 }, flags: ['demon_ending_enforcer', 'arc_complete_demon'] } },
            { id: 'necessary_monster', branchGroup: 'demon_ending', label: 'Choose controlled mercy', description: 'Use violence selectively and become feared for what you refuse to do.', rewards: { reputation: { demon: 5, angel: 2 }, relationships: { npc_rook: 3 }, flags: ['demon_ending_monster', 'arc_complete_demon'] } }
        ]
    }
};
