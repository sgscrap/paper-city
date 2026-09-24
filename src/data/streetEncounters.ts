import { GameState, FactionId } from '@/types';
import { NpcCityAI } from '@/lib/NpcCityAI';

export type StreetEncounterKind = 'offer' | 'warning';

export interface EncounterResolution {
    patch: Partial<GameState>;
    toast: { title: string; description: string };
}

export interface StreetEncounter {
    id: string;
    npcId: string;
    kind: StreetEncounterKind;
    /** Higher weights are picked more often when an NPC qualifies for several. */
    weight: number;
    lines: string[];
    /** Restrict to specific maps; defaults to anywhere the NPC currently is. */
    venues?: string[];
    /** In-game minutes window [from, to). */
    timeRange?: [number, number];
    requirements?: (state: GameState) => boolean;
    /** Positive relationship/trust/fear granted to the NPC when the player listens. */
    relReward?: { relationship?: number; trust?: number; fear?: number };
    /** Offers: reward for accepting. Warnings: reward for heeding. */
    apply: (state: GameState) => EncounterResolution;
    /** Warnings only: what happens when the player shrugs it off. Offers ignore this. */
    dismiss?: (state: GameState) => EncounterResolution;
}

const withFactionRep = (state: GameState, faction: FactionId, amount: number) => ({
    ...state.factionReputation,
    [faction]: Math.max(-100, Math.min(100, state.factionReputation[faction] + amount))
});

export const STREET_ENCOUNTERS: StreetEncounter[] = [
    // --- OFFERS ---
    {
        id: 'TOMMY_SIDE_HUSTLE', npcId: 'npc_tommy', kind: 'offer', weight: 20,
        venues: ['the_block', 'underground_markets'],
        lines: [
            "Psst, buddy! Quick delivery, easy forty. No questions, no receipts, no take-backs!",
            "You look trustworthy-ish! Carry this small package two blocks and this forty is yours."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 40, karma: state.player.stats.karma - 1 } }
            },
            toast: { title: 'PACKAGE DELIVERED', description: "Tommy's package reaches its corner. +$40, and the city's ledger notes the favor: -1 Karma." }
        }),
        relReward: { relationship: 2 }
    },
    {
        id: 'JENKINS_CAT_SEARCH', npcId: 'npc_old_man_jenkins', kind: 'offer', weight: 18,
        venues: ['the_block'],
        lines: [
            "My cat's gone flat AGAIN. Help an old man look, would you?",
            "You there! Young knees! My 2D cat slipped under the paper fence again."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, karma: state.player.stats.karma + 2, luck: state.player.stats.luck + 1 } }
            },
            toast: { title: 'CAT RECOVERED', description: 'You flatten the fence and un-flatten the cat. +2 Karma, +1 Luck.' }
        }),
        relReward: { relationship: 3 }
    },
    {
        id: 'GHOST_STREET_WHISPER', npcId: 'npc_ghost', kind: 'offer', weight: 16,
        venues: ['underground_markets', 'dt_bmore'],
        lines: [
            "Walk with me. Two sentences, then we never had this conversation.",
            "You're being watched less than most. Here's your refund on attention."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, luck: state.player.stats.luck + 1 } },
                factionReputation: withFactionRep(state, 'ghost', 1)
            },
            toast: { title: 'WHISPER RECEIVED', description: 'Ghost hands you a fragment of tomorrow. +1 Luck, +1 Ghost reputation.' }
        }),
        relReward: { trust: 1 }
    },
    {
        id: 'TESS_TABLE_TELL', npcId: 'npc_ticker_tess', kind: 'offer', weight: 16,
        venues: ['casino'], timeRange: [1020, 1440],
        lines: [
            "Floor's closed, my book isn't. $20 says I can teach you one table tell.",
            "The dealer checks his watch before every fifth hand. Worth twenty to you?"
        ],
        requirements: (state) => state.player.stats.worth >= 20,
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 25, luck: state.player.stats.luck + 1 } }
            },
            toast: { title: 'TELL LEARNED', description: 'The stake pays for itself. +$25 net, +1 Luck.' }
        }),
        relReward: { relationship: 2 }
    },
    {
        id: 'ROOK_COLLECTION_RUN', npcId: 'npc_rook', kind: 'offer', weight: 14,
        venues: ['underground_markets'],
        lines: [
            "One collection run. Small account, big attitude. Sixty when it's done.",
            "Rook: Somebody's late on a payment. Collect it my way and keep sixty."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: state.player.stats.worth + 60, karma: state.player.stats.karma - 3 } },
                factionReputation: withFactionRep(state, 'demon', 2)
            },
            toast: { title: 'DEBT COLLECTED', description: 'The account settles. +$60, -3 Karma, +2 Demon reputation.' }
        }),
        relReward: { trust: 2 }
    },
    {
        id: 'ARIA_FLYER_SHIFT', npcId: 'npc_club_host_aria', kind: 'offer', weight: 14,
        venues: ['dt_bmore'], timeRange: [720, 1080],
        lines: [
            "Help me hand out flyers before my shift and I'll put in a word with the door.",
            "A hundred flyers, two hours of smiling. It builds character. And connections."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, karma: state.player.stats.karma + 1 } },
                factionReputation: withFactionRep(state, 'angel', 1)
            },
            toast: { title: 'FLYERS DISTRIBUTED', description: 'Half downtown has Club Lust in its pocket now. +1 Angel reputation.' }
        }),
        relReward: { relationship: 2 }
    },
    {
        id: 'MARA_QUICK_SPAR', npcId: 'npc_mara', kind: 'offer', weight: 14,
        venues: ['gym'],
        lines: [
            "Three rounds, light contact. You'll thank me tomorrow or hate me tonight.",
            "You've been walking soft. Ten minutes on the mats fixes that."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, energy: Math.max(0, state.player.energy - 10) }
            },
            toast: { title: 'SPAR COMPLETE', description: 'You keep up for three rounds. -10 Energy, +1 Power.' }
        }),
        relReward: { relationship: 1 }
    },
    {
        id: 'KANE_DOOR_SHIFT', npcId: 'npc_club_bouncer_kane', kind: 'offer', weight: 12,
        venues: ['club'], timeRange: [1020, 1440],
        lines: [
            "Door needs a second set of hands. Fifty, and you handle the loud ones.",
            "Kane: One shift on the rope. Keep your nerve, keep the fifty."
        ],
        apply: (state) => ({
            patch: {
                player: {
                    ...state.player,
                    energy: Math.max(0, state.player.energy - 12),
                    stats: { ...state.player.stats, worth: state.player.stats.worth + 50, karma: state.player.stats.karma - 1 }
                },
                factionReputation: withFactionRep(state, 'demon', 1)
            },
            toast: { title: 'SHIFT COVERED', description: 'The loud ones get handled. +$50, -12 Energy, +1 Demon reputation.' }
        }),
        relReward: { trust: 1 }
    },
    {
        id: 'GRIP_FURNACE_HAUL', npcId: 'npc_foundry_grip', kind: 'offer', weight: 16,
        venues: ['foundry_row'], timeRange: [360, 1020],
        lines: [
            "Need a sturdy back on the scrap hopper for twenty minutes. $45 and a good word with the Row.",
            "Grip: Coal run just landed. Help shovel before the morning press heats up."
        ],
        apply: (state) => ({
            patch: {
                player: {
                    ...state.player,
                    energy: Math.max(0, state.player.energy - 8),
                    stats: { ...state.player.stats, worth: state.player.stats.worth + 45, power: state.player.stats.power + 1, karma: state.player.stats.karma + 1 }
                },
                factionReputation: withFactionRep(state, 'angel', 1)
            },
            toast: { title: 'HOPPER HAULED', description: 'Grip nods respectfully. +$45, +1 Power, +1 Karma, +1 Angel reputation.' }
        }),
        relReward: { relationship: 2, trust: 1 }
    },
    {
        id: 'NEEDLE_SECOND_LEDGER', npcId: 'npc_foundry_needle', kind: 'offer', weight: 15,
        venues: ['foundry_row', 'the_block'], timeRange: [360, 1260],
        lines: [
            "I have an invoice that needs to disappear into a pocket. $35 says you have a pocket.",
            "Needle: Quiet courier work across the tracks. Don't look at the seal, just deliver it."
        ],
        apply: (state) => ({
            patch: {
                player: {
                    ...state.player,
                    stats: { ...state.player.stats, worth: state.player.stats.worth + 35, luck: state.player.stats.luck + 1 }
                },
                factionReputation: withFactionRep(state, 'ghost', 1)
            },
            toast: { title: 'INVOICE MOVED', description: 'Needle crosses out a line on the second ledger. +$35, +1 Luck, +1 Ghost reputation.' }
        }),
        relReward: { relationship: 2, trust: 1 }
    },
    {
        id: 'SLIDE_PIT_STAKE', npcId: 'npc_foundry_slide', kind: 'offer', weight: 14,
        venues: ['foundry_row'], timeRange: [1020, 1440],
        lines: [
            "Block 8 pit needs a challenger warmed up. Step in or stake twenty on the heavy.",
            "Slide: Midnight crowd is getting restless. Make it interesting or back my fighter."
        ],
        requirements: (state) => state.player.stats.worth >= 20,
        apply: (state) => ({
            patch: {
                player: {
                    ...state.player,
                    stats: { ...state.player.stats, worth: state.player.stats.worth + 30, power: state.player.stats.power + 1, karma: state.player.stats.karma - 1 }
                },
                factionReputation: withFactionRep(state, 'demon', 1)
            },
            toast: { title: 'PIT STAKE WON', description: 'Slide watches you pocket the payout. +$30 net, +1 Power, +1 Demon reputation.' }
        }),
        relReward: { fear: 1, relationship: 1 }
    },
    {
        id: 'HALYARD_CONTRABAND_TAG', npcId: 'npc_dock_halyard', kind: 'warning', weight: 15,
        venues: ['the_waterfront'], timeRange: [720, 1440],
        lines: [
            "Customs is checking coats on Pier 31. Ditch any hot goods before crossing the gate.",
            "Halyard: Harbor seals are being inspected. Walk clean or pay the dock tax."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, karma: state.player.stats.karma + 1 } },
                factionReputation: withFactionRep(state, 'angel', 1)
            },
            toast: { title: 'INSPECTION AVOIDED', description: 'You skirt the customs checkpoint safely. +1 Karma, +1 Angel reputation.' }
        }),
        relReward: { relationship: 2, trust: 1 },
        dismiss: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth - 35) } }
            },
            toast: { title: 'CUSTOMS FINE', description: 'The inspector tags you at Pier 31. -$35 harbor tariff.' }
        })
    },
    {
        id: 'CONDOR_MANIFEST_DRAFT', npcId: 'npc_dock_condor', kind: 'offer', weight: 15,
        venues: ['the_waterfront', 'the_block'], timeRange: [360, 1020],
        lines: [
            "Morning cargo draft came off the wire early. Worth $25 for a glimpse of incoming freight?",
            "Condor: I know what docks in container six. Trade you the tip for lunch money."
        ],
        requirements: (state) => state.player.stats.worth >= 25,
        apply: (state) => ({
            patch: {
                player: {
                    ...state.player,
                    stats: { ...state.player.stats, worth: state.player.stats.worth + 25, luck: state.player.stats.luck + 2 }
                },
                factionReputation: withFactionRep(state, 'ghost', 1)
            },
            toast: { title: 'DRAFT READ', description: 'Condor lets you scan the freight manifest. +$25 net, +2 Luck, +1 Ghost reputation.' }
        }),
        relReward: { trust: 2 }
    },
    {
        id: 'HARROW_DOCK_SHAKEDOWN', npcId: 'npc_dock_harrow', kind: 'warning', weight: 14,
        venues: ['the_waterfront'], timeRange: [1020, 1440],
        lines: [
            "Pier 31 charges toll after ten. Hand over a cut or carry your own bruises.",
            "Harrow: Dockside belongs to my crew tonight. Don't wander into the cranes alone."
        ],
        apply: () => ({
            patch: {},
            toast: { title: 'CRANES CLEARED', description: 'You heed Harrow and keep to the lighted gangways.' }
        }),
        relReward: { fear: 1 },
        dismiss: (state) => ({
            patch: {
                player: { ...state.player, energy: Math.max(0, state.player.energy - 15), stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth - 20) } }
            },
            toast: { title: 'PIER SHAKEDOWN', description: 'Harrows muscle catches you between containers. -15 Energy, -$20.' }
        })
    },

    // --- WARNINGS ---
    {
        id: 'ACE_STREET_WARNING', npcId: 'npc_ace', kind: 'warning', weight: 18,
        venues: ['the_block'],
        lines: [
            "Take the long way tonight. The short way has eyes on it.",
            "Coalition flagged a crew working your block. Walk smart today."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, karma: state.player.stats.karma + 1 } },
                factionReputation: withFactionRep(state, 'angel', 1)
            },
            toast: { title: 'HEEDED THE WARNING', description: 'You take the long way. Nothing happens — which was the point. +1 Karma, +1 Angel reputation.' }
        }),
        relReward: { relationship: 2 },
        dismiss: () => ({
            patch: {},
            toast: { title: 'WARNING IGNORED', description: 'You take the short way anyway. Ace sees everything.' }
        })
    },
    {
        id: 'TOMMY_PICKPOCKET_ALERT', npcId: 'npc_tommy', kind: 'warning', weight: 16,
        venues: ['underground_markets'], timeRange: [1020, 1440],
        lines: [
            "Crew working the crowd tonight. Button your pockets, buddy, button them!",
            "Not every guy I know is a good guy. Watch your coat down here."
        ],
        apply: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, luck: state.player.stats.luck + 1 } }
            },
            toast: { title: 'POCKETS SECURED', description: "Tommy's tip keeps your cash yours. +1 Luck." }
        }),
        relReward: { relationship: 1 },
        dismiss: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth - 30) } }
            },
            toast: { title: 'LIGHTER POCKETS', description: 'Two blocks later your coat feels thin. -$30.' }
        })
    },
    {
        id: 'SHADY_TAIL_ALERT', npcId: 'npc_shady_dealer', kind: 'warning', weight: 14,
        venues: ['underground_markets'],
        lines: [
            "You've had the same shadow for three corners. Not mine, before you ask.",
            "Somebody's pricing you. I'd move differently tonight."
        ],
        apply: () => ({
            patch: {},
            toast: { title: 'TAIL SHAKEN', description: 'You change your route twice and lose the shadow. Nothing is taken from you tonight.' }
        }),
        relReward: { trust: 1 },
        dismiss: (state) => ({
            patch: {
                player: { ...state.player, stats: { ...state.player.stats, worth: Math.max(0, state.player.stats.worth - 25) } }
            },
            toast: { title: 'FOLLOWED HOME', description: 'The shadow picks a pocket on the way. -$25.' }
        })
    }
];

/**
 * Pick an encounter the given NPC can start right now. Pure: filters by
 * schedule venue, optional venue list, time window, requirements, and the
 * per-NPC daily approach guard, then weights the survivors.
 */
export const pickStreetEncounter = (
    state: GameState,
    npcId: string
): { encounter: StreetEncounter; line: string } | null => {
    const worldTime = state.world.time;
    const npcVenue = NpcCityAI.getVenue(npcId, worldTime);
    if (npcVenue !== state.world.locationId) return null;

    const lastDay = state.streetEncounters.lastEncounterDay;
    const approachesToday =
        lastDay === state.world.day ? state.streetEncounters.encounteredIds[npcId] || 0 : 0;
    if (approachesToday >= 1) return null;

    const totalMinutes = state.world.day * 1440 + worldTime;
    const lastAt = state.streetEncounters.lastEncounterAt;
    if (lastAt > 0 && totalMinutes - lastAt < 60) return null; // Max one approach per in-game hour

    const candidates = STREET_ENCOUNTERS.filter((encounter) => {
        if (encounter.npcId !== npcId) return false;
        if (encounter.venues && !encounter.venues.includes(state.world.locationId)) return false;
        if (encounter.timeRange && (worldTime < encounter.timeRange[0] || worldTime >= encounter.timeRange[1])) return false;
        if (encounter.requirements && !encounter.requirements(state)) return false;
        return true;
    });
    if (candidates.length === 0) return null;

    const totalWeight = candidates.reduce((sum, encounter) => sum + encounter.weight, 0);
    let roll = Math.random() * totalWeight;
    let selected = candidates[0];
    for (const encounter of candidates) {
        roll -= encounter.weight;
        if (roll <= 0) {
            selected = encounter;
            break;
        }
    }

    const lineIndex = NpcCityAI.hashCode(`${selected.id}:${state.world.day}`) % selected.lines.length;
    return { encounter: selected, line: selected.lines[lineIndex] };
};
