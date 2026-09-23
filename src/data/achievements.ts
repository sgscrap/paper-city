import { Achievement } from '@/types';

export const ACHIEVEMENTS: Record<string, Achievement> = {
    'first_action': {
        id: 'first_action',
        title: 'STREET_INIT',
        description: 'Take your first action in the city.',
        icon: '🏙️'
    },
    'earn_500': {
        id: 'earn_500',
        title: 'BLOCK_HUSTLER',
        description: 'Earn your first $500.',
        icon: '💵'
    },
    'first_trade': {
        id: 'first_trade',
        title: 'MARKET_ENTRY',
        description: 'Execute your first stock or crypto trade.',
        icon: '📈'
    },
    'first_combat_win': {
        id: 'first_combat_win',
        title: 'STREET_FORCE',
        description: 'Win your first combat encounter.',
        icon: '🥊'
    },
    'first_combat_loss': {
        id: 'first_combat_loss',
        title: 'HARD_KNOCKS',
        description: 'Recover from your first combat loss.',
        icon: '🤕'
    },
    'first_equip': {
        id: 'first_equip',
        title: 'ARMED_LENT',
        description: 'Equip your first piece of gear or weapon.',
        icon: '⚔️'
    },
    'level_up': {
        id: 'level_up',
        title: 'EVOLUTION_01',
        description: 'Reach Level 2.',
        icon: '⚡'
    },
    'casino_spin': {
        id: 'casino_spin',
        title: 'HIGH_ROLLER_JR',
        description: 'Try your luck at the casino for the first time.',
        icon: '🎰'
    },
    'worth_1000': {
        id: 'worth_1000',
        title: 'FOUR_DIGITS',
        description: 'Reach a net worth of $1,000.',
        icon: '💰'
    },
    'visit_all': {
        id: 'visit_all',
        title: 'CITY_WALKER',
        description: 'Visit every key location in the Downtown district.',
        icon: '🗺️'
    },
    'tutorial_complete': {
        id: 'tutorial_complete',
        title: 'TRUST_YOURSELF',
        description: 'Complete the initial tutorial sequence.',
        icon: '📜'
    },
    'faction_aligned': {
        id: 'faction_aligned',
        title: 'CHOOSE YOUR SIGNAL',
        description: 'Commit to Angel, Ghost, or Demon and unlock a faction arc.',
        icon: '🛰️'
    },
    'contract_runner': {
        id: 'contract_runner',
        title: 'CONTRACT RUNNER',
        description: 'Complete your first rotating city contract.',
        icon: '📟'
    },
    'trusted_contact': {
        id: 'trusted_contact',
        title: 'TRUSTED CONTACT',
        description: 'Build a meaningful relationship with a city resident.',
        icon: '🤝'
    },
    'angel_arc_complete': {
        id: 'angel_arc_complete',
        title: 'CIVIC STEWARD',
        description: 'Complete the Angel arc and leave a public mark on Paper City.',
        icon: '🛡️'
    },
    'ghost_arc_complete': {
        id: 'ghost_arc_complete',
        title: 'QUIET BROKER',
        description: 'Complete the Ghost arc and control the city’s information flow.',
        icon: '📡'
    },
    'demon_arc_complete': {
        id: 'demon_arc_complete',
        title: 'SEAT BELOW',
        description: 'Complete the Demon arc and claim your place in the underworld.',
        icon: '🔥'
    }
};
