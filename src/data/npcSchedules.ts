/**
 * NPC daily schedules.
 *
 * Times are in normalized in-game minutes (0 = midnight, 360 = 6:00 AM,
 * 1440+ wraps back into the early morning because the day clock caps at 1560).
 *
 * - If the current time falls inside a block, the NPC is at that venue.
 * - If no block matches, the NPC falls back to its static `location` from
 *   npcs.ts so nobody is ever completely unreachable.
 * - Quest-critical NPCs keep long morning blocks on The Block so the intro
 *   flow can never stall.
 */
export interface NPCScheduleBlock {
    from: number;
    to: number;
    location: string;
}

export const NPC_SCHEDULES: Record<string, NPCScheduleBlock[]> = {
    // --- THE BLOCK ---
    npc_ace: [
        { from: 360, to: 720, location: 'the_block' },
        { from: 720, to: 1020, location: 'dt_bmore' }, // Coalition business downtown
        { from: 1020, to: 1440, location: 'the_block' }
    ],
    npc_tommy: [
        { from: 360, to: 1140, location: 'the_block' },
        { from: 1140, to: 1440, location: 'underground_markets' } // "knows a guy" down below
    ],
    npc_ghost: [
        { from: 360, to: 780, location: 'the_block' },
        { from: 780, to: 1200, location: 'underground_markets' },
        { from: 1200, to: 1440, location: 'dt_bmore' }
    ],

    // --- VENUE STAFF & REGULARS ---
    npc_mara: [
        { from: 360, to: 1320, location: 'gym' },
        { from: 1320, to: 1440, location: 'underground_markets' }
    ],
    npc_lena: [
        { from: 360, to: 1020, location: 'university' },
        { from: 1020, to: 1440, location: 'trading_floor' }
    ],
    npc_foreman_dex: [
        { from: 360, to: 1080, location: 'job_board' }
    ],
    npc_ticker_tess: [
        { from: 360, to: 1140, location: 'trading_floor' },
        { from: 1140, to: 1440, location: 'casino' }
    ],
    npc_croupier_ivy: [
        { from: 720, to: 1440, location: 'casino' }
    ],
    npc_club_host_aria: [
        { from: 360, to: 900, location: 'dt_bmore' },
        { from: 900, to: 1440, location: 'club' }
    ],
    npc_club_dj_echo: [
        { from: 780, to: 1440, location: 'club' }
    ],
    npc_club_bouncer_kane: [
        { from: 600, to: 1440, location: 'club' }
    ],
    npc_keeper_nox: [], // Always in the safehouse
    npc_rook: [
        { from: 360, to: 840, location: 'the_block' },
        { from: 840, to: 1440, location: 'underground_markets' }
    ],
    npc_ceo_sarah: [
        { from: 540, to: 1140, location: 'corporate_towers' }
    ],
    npc_shady_dealer: [
        { from: 900, to: 1440, location: 'underground_markets' }
    ],
    npc_mayor: [
        { from: 480, to: 1200, location: 'political_offices' },
        { from: 1200, to: 1440, location: 'dt_bmore' } // Evening walkabouts
    ]
};

/** Faction accent colors used when rendering NPCs in the world. */
export const NPC_FACTION_COLORS: Record<string, string> = {
    angel: '#4ade80',
    ghost: '#a78bfa',
    demon: '#f87171'
};

export const NEUTRAL_NPC_COLOR = '#e4e4e7';
