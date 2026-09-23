import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateDailyContracts } from '../src/data/contracts';
import { INITIAL_STATE } from '../src/types';
import { useGameStore } from '../src/stores/gameStore';
import { useUIStore } from '../src/stores/uiStore';
import { NPCSystem } from '../src/lib/NPCSystem';
import { CAREERS } from '../src/data/careers';
import { NPCS } from '../src/data/npcs';
import { canAccessCareer, canAccessContract, canAccessNpcService } from '../src/lib/AccessSystem';
import { isBalancedFactionMatrix } from '../src/data/factionContentMatrix';
import { MAP_DEFINITIONS } from '../src/data/maps';
import { normalizeLocationId } from '../src/stores/gameStore';
import { CLUB_EVENTS, isClubEventAvailable } from '../src/data/club';
import { getDailyActivities } from '../src/data/economy';

const resetStores = () => {
    localStorage.clear();
    useUIStore.setState({
        uiMode: 'boot', bootOpacity: 1, liveOpacity: 0, activeTab: 'location', toasts: [], shake: false, activeDialogue: null
    });
    // Deep-clone: a shallow spread shares every nested object with INITIAL_STATE,
    // so any in-place mutation in game code corrupts the constant for later tests
    // (manifested as cross-test worth drift like 20 -> 40 -> 0).
    useGameStore.setState({
        ...structuredClone(INITIAL_STATE),
        combatState: null,
        outfit: 'street_clothes',
        remotePlayers: {},
        pricePollingId: null,
        // Pin random events off by default: advanceTime rolls a 7% event chance
        // whose cash effects pollute assertions. Tests that exercise the event
        // engine re-enable it explicitly.
        randomEvents: { ...structuredClone(INITIAL_STATE.randomEvents), triggeredToday: 99 }
    });
};

describe('Content systems', () => {
    beforeEach(resetStores);
    afterEach(resetStores);

    it('guarantees a reachable starter home and routes all map activities', () => {
        expect(INITIAL_STATE.world.locationId).toBe('the_block');
        expect(MAP_DEFINITIONS.the_block.buildings.some((building) => building.action === 'open_home')).toBe(true);
        expect(MAP_DEFINITIONS.dt_bmore.buildings.some((building) => building.action === 'open_casino')).toBe(true);
        expect(MAP_DEFINITIONS.dt_bmore.buildings.some((building) => building.action === 'open_club')).toBe(true);
    });

    it('restores energy when sleeping at the starter home', () => {
        useGameStore.setState({
            world: { ...INITIAL_STATE.world, locationId: 'the_block' },
            player: { ...INITIAL_STATE.player, energy: 12 }
        });

        useGameStore.getState().newDay();
        const state = useGameStore.getState();
        expect(state.world.day).toBe(2);
        expect(state.player.energy).toBe(100);
        expect(state.player.stats.will).toBe(100);
    });

    it('charges work shifts against energy instead of the legacy will display stat', () => {
        useGameStore.setState({
            career: { ...INITIAL_STATE.career, currentId: 'street_hustler', tier: 1 },
            player: { ...INITIAL_STATE.player, energy: 50 }
        });

        useGameStore.getState().workJob();
        const state = useGameStore.getState();
        expect(state.player.energy).toBe(30);
        expect(state.player.stats.will).toBe(INITIAL_STATE.player.stats.will);
    });

    it('recovers invalid saved locations to The Block without losing player data', () => {
        expect(normalizeLocationId('slums_that_no_longer_exist')).toBe('the_block');
        useGameStore.getState().importSave(JSON.stringify({
            ...INITIAL_STATE,
            player: { ...INITIAL_STATE.player, name: 'Recovered Citizen', energy: 4 },
            world: { ...INITIAL_STATE.world, locationId: 'legacy_apartment' }
        }));

        const state = useGameStore.getState();
        expect(state.world.locationId).toBe('the_block');
        expect(state.player.name).toBe('Recovered Citizen');
        expect(state.player.energy).toBe(4);
    });

    it('rotates a faction-specific Club opportunity and pays only after activity', () => {
        useGameStore.getState().refreshContracts();
        const clubContract = useGameStore.getState().contracts.offers.find((offer) => offer.venue === 'club_lust');
        expect(clubContract).toBeDefined();
        expect(clubContract?.faction).toMatch(/angel|ghost|demon/);

        useGameStore.getState().acceptContract(clubContract!.id);
        const before = useGameStore.getState();
        const activity = clubContract!.objective.target as 'CLUB_SOCIAL' | 'CLUB_NETWORK' | 'CLUB_BACKROOM';
        useGameStore.getState().performClubActivity(activity);

        const after = useGameStore.getState();
        expect(after.contracts.completedIds).toContain(clubContract!.id);
        expect(after.player.energy).toBeLessThan(before.player.energy);
        expect(after.player.stats.worth).toBeGreaterThan(before.player.stats.worth - 40);
    });

    it('builds Club trust and heat, then unlocks reputation-gated nightlife events', () => {
        useGameStore.setState({
            player: { ...INITIAL_STATE.player, energy: 100, stats: { ...INITIAL_STATE.player.stats, worth: 200 } }
        });

        useGameStore.getState().performClubActivity('CLUB_SOCIAL');
        useGameStore.getState().performClubActivity('CLUB_SOCIAL');
        let state = useGameStore.getState();
        expect(state.club.reputation).toBe(2);
        expect(state.club.heat).toBe(2);
        expect(state.club.factionTrust.angel).toBe(2);
        expect(state.npcs.npc_club_host_aria.trust).toBe(2);

        const civicEvent = CLUB_EVENTS.find((event) => event.id === 'club_civic_watch')!;
        expect(isClubEventAvailable(civicEvent, state.club)).toBe(true);
        useGameStore.getState().performClubEvent(civicEvent.id);
        state = useGameStore.getState();
        expect(state.club.eventUses[civicEvent.id]).toBe(state.world.day);
        expect(state.club.reputation).toBe(4);
        expect(state.club.factionTrust.angel).toBe(4);
        expect(state.club.heat).toBe(1);

        useGameStore.getState().newDay();
        expect(useGameStore.getState().club.heat).toBe(0);
    });

    it('reacts to combat context by allowing strong social or economic leverage to avoid violence', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        // This test exercises the event engine itself — re-enable rolls pinned off in resetStores.
        useGameStore.setState({
            randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 0 },
            player: { ...INITIAL_STATE.player, stats: { ...INITIAL_STATE.player.stats, charisma: 14 }, energy: 100 }
        });

        useGameStore.getState().startCombat('street_thug');
        const state = useGameStore.getState();
        expect(state.combatState).toBeNull();
        expect(state.randomEvents.lastOutcome).toBe('LEVERAGE_ESCAPE');
        vi.restoreAllMocks();
    });

    it('filters contextual events by venue and time of day', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        // This test exercises the event engine itself — re-enable rolls pinned off in resetStores.
        useGameStore.setState({
            randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 0 },
            world: { ...INITIAL_STATE.world, locationId: 'trading_floor', time: 600 },
            player: { ...INITIAL_STATE.player, stats: { ...INITIAL_STATE.player.stats, worth: 100 } }
        });

        useGameStore.getState().advanceTime(0, 'economy', 'MARKET_TRADE');
        expect(useGameStore.getState().randomEvents.lastOutcome).toBe('MARKET_OPPORTUNITY');
        expect(useGameStore.getState().player.stats.worth).toBe(135);
        vi.restoreAllMocks();
    });

    it('does not trigger the night contact event during daytime', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        useGameStore.setState({
            world: { ...INITIAL_STATE.world, time: 600 },
            contracts: { ...INITIAL_STATE.contracts, completedIds: ['previous_contract'] },
            npcs: { npc_ace: { relationship: 0, trust: 5, fear: 0, debt: 0, loyalty: 0, lastInteraction: 0, lastDailyEffectDay: 0, serviceUses: {}, activeQuests: [], history: [] } }
        });

        useGameStore.getState().advanceTime(0, 'social', 'npc_ace');
        expect(useGameStore.getState().randomEvents.lastOutcome).not.toBe('TRUSTED_CONTACT_REQUEST');
        vi.restoreAllMocks();
    });

    it('advances the fight ladder and awards fighter reputation from a completed encounter', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        useGameStore.setState({
            player: { ...INITIAL_STATE.player, stats: { ...INITIAL_STATE.player.stats, power: 100, charisma: 1 }, energy: 100 },
            inventory: { items: { glock: 1 }, equippedWeapon: 'glock' }
        });

        useGameStore.getState().startCombatEncounter('ladder_1');
        expect(useGameStore.getState().combatState?.encounterId).toBe('ladder_1');
        useGameStore.getState().combatAction('attack');
        const state = useGameStore.getState();
        expect(state.combatRecord.wins).toBe(1);
        expect(state.combatRecord.reputation).toBe(4);
        expect(state.combatRecord.ladderTier).toBe(2);
        expect(state.combatRecord.completedEncounterIds).toContain('ladder_1');
        vi.restoreAllMocks();
    });

    it('resolves an eligible rival through social leverage and records the relationship consequence', () => {
        useGameStore.setState({
            player: { ...INITIAL_STATE.player, stats: { ...INITIAL_STATE.player.stats, charisma: 14 } },
            factionReputation: { ...INITIAL_STATE.factionReputation, demon: 8 },
            combatRecord: { ...INITIAL_STATE.combatRecord, reputation: 6 }
        });

        useGameStore.getState().resolveCombatEncounter('rival_rook', 'social');
        const state = useGameStore.getState();
        expect(state.combatRecord.completedEncounterIds).toContain('rival_rook');
        expect(state.combatRecord.nonCombatResolutions.rival_rook).toBe('social');
        expect(state.npcs.npc_rook.relationship).toBe(5);
        expect(state.factionReputation.demon).toBe(13);
    });

    it('keeps the faction content matrix structurally balanced', () => {
        expect(isBalancedFactionMatrix()).toBe(true);
    });

    it('generates the same daily contracts for the same day', () => {
        expect(generateDailyContracts(4)).toEqual(generateDailyContracts(4));
        expect(generateDailyContracts(4)).not.toEqual(generateDailyContracts(5));
        expect(generateDailyContracts(4)).toHaveLength(3);
    });

    it('records a faction choice and starts the selected arc', () => {
        useGameStore.setState({
            quests: {
                ...INITIAL_STATE.quests,
                pick_a_lane: { id: 'pick_a_lane', status: 'active', objectives: { choose_path: false } }
            }
        });

        useGameStore.getState().chooseQuest('pick_a_lane', 'ghost');
        useGameStore.getState().updateQuestObjective('pick_a_lane', 'choose_path', true);
        useGameStore.getState().completeQuest('pick_a_lane');

        const state = useGameStore.getState();
        expect(state.factionReputation.ghost).toBe(12);
        expect(state.contentFlags.faction_ghost).toBe(true);
        expect(state.quests.pick_a_lane.choiceId).toBe('ghost');
        expect(state.quests.ghost_first_signal?.status).toBe('active');
    });

    it('persists richer NPC relationship consequences', () => {
        // Offering a favor without an item fails and changes nothing.
        useGameStore.getState().interactNPC('npc_ace', 'gift');
        expect(useGameStore.getState().npcs.npc_ace).toBeUndefined();

        // With a donut in hand, the favor consumes the item and logs the exchange.
        useGameStore.setState({ inventory: { items: { donut: 1 }, equippedWeapon: null } });
        useGameStore.getState().interactNPC('npc_ace', 'gift');
        let state = useGameStore.getState();
        expect(state.npcs.npc_ace.trust).toBe(5);
        expect(state.npcs.npc_ace.history).toContain('gift:Coalition Donut');
        expect(state.inventory.items.donut).toBeUndefined();

        useGameStore.getState().interactNPC('npc_ace', 'insult');
        state = useGameStore.getState();
        expect(state.npcs.npc_ace.fear).toBe(5);
        expect(state.npcs.npc_ace.relationship).toBe(-5);
    });

    it('limits ordinary NPC social effects to once per day', () => {
        const startingKarma = useGameStore.getState().player.stats.karma;
        useGameStore.getState().interactNPC('npc_old_man_jenkins', 'chat');
        let state = useGameStore.getState();
        expect(state.player.stats.karma).toBe(startingKarma + 1);
        expect(state.inventory.items.donut).toBe(1);
        expect(state.npcs.npc_old_man_jenkins.lastDailyEffectDay).toBe(state.world.day);

        useGameStore.getState().interactNPC('npc_old_man_jenkins', 'chat');
        state = useGameStore.getState();
        expect(state.player.stats.karma).toBe(startingKarma + 1);
        expect(state.inventory.items.donut).toBe(1);
    });

    it('keeps ordinary NPC conversations separate from task rewards', () => {
        useGameStore.getState().interactNPC('npc_ghost', 'chat');
        const state = useGameStore.getState();
        expect(state.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth);
        expect(state.player.xp).toBe(INITIAL_STATE.player.xp);
    });

    it('pays a matching NPC contract immediately and only once', () => {
        const contract = {
            id: 'tommy_test_contract',
            title: 'Tommy Test Run',
            description: 'A test contract.',
            faction: 'demon' as const,
            sourceNpcId: 'npc_tommy',
            kind: 'social' as const,
            objective: { trigger: 'interact_npc', target: 'npc_tommy' },
            reward: { cash: 25, xp: 10, reputation: 3 },
            expiresDay: INITIAL_STATE.world.day
        };
        useGameStore.setState({
            contracts: { generatedDay: 1, poolKey: 'uncommitted:---', offers: [contract], acceptedIds: [], statuses: { tommy_test_contract: 'available' }, completedIds: [], expiredIds: [], failedIds: [] },
            randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 3 }
        });

        useGameStore.getState().acceptContract('tommy_test_contract');
        useGameStore.getState().interactNPC('npc_tommy', 'chat');
        let state = useGameStore.getState();
        expect(state.contracts.completedIds).toContain('tommy_test_contract');
        expect(state.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth + 25);
        expect(state.player.xp).toBe(10);

        useGameStore.getState().completeContract('tommy_test_contract');
        state = useGameStore.getState();
        expect(state.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth + 25);
    });

    it('records a committed faction identity and supports a costly defection', () => {
        useGameStore.setState({
            quests: {
                ...INITIAL_STATE.quests,
                pick_a_lane: { id: 'pick_a_lane', status: 'active', objectives: { choose_path: false } }
            }
        });

        useGameStore.getState().chooseQuest('pick_a_lane', 'angel');
        useGameStore.getState().updateQuestObjective('pick_a_lane', 'choose_path', true);
        useGameStore.getState().completeQuest('pick_a_lane');
        useGameStore.getState().modifyFactionReputation('ghost', 20);
        useGameStore.getState().defectFaction('ghost');

        const state = useGameStore.getState();
        expect(state.factionIdentity.primaryFaction).toBe('ghost');
        expect(state.factionIdentity.status).toBe('defected');
        expect(state.factionIdentity.betrayals).toContain('angel');
        expect(state.contentFlags.betrayed_angel).toBe(true);
        expect(state.factionReputation.angel).toBe(-13);
    });

    it('holds a completed objective until a branch decision is made', () => {
        useGameStore.setState({
            factionIdentity: { primaryFaction: 'angel', status: 'committed', committedAtDay: 1, betrayals: [], milestones: [] },
            quests: {
                ...INITIAL_STATE.quests,
                angel_public_record: { id: 'angel_public_record', status: 'active', objectives: { reach_civic_center: false } }
            }
        });

        useGameStore.getState().checkQuestObjectives('travel', 'political_offices');
        expect(useGameStore.getState().quests.angel_public_record.status).toBe('active');
        useGameStore.getState().chooseQuest('angel_public_record', 'protect_publicly');

        const state = useGameStore.getState();
        expect(state.quests.angel_public_record.status).toBe('completed');
        expect(state.contentFlags.angel_public_record).toBe(true);
        expect(state.factionIdentity.milestones).toContain('angel_public_record:protect_publicly');
    });

    it('changes NPC dialogue when the player has crossed factions', () => {
        const dialogue = NPCSystem.getDialogue('npc_ace', 0, 0, 'ghost', { betrayed_angel: true });
        expect(dialogue).toContain('chose against us once');
    });

    it('enforces faction access for locations and services', () => {
        expect(useGameStore.getState().canAccess('location:political_offices')).toBe(false);
        expect(useGameStore.getState().setLocation('political_offices')).toBe(false);

        useGameStore.getState().modifyFactionReputation('angel', 8);
        expect(useGameStore.getState().canAccess('location:political_offices')).toBe(true);
        expect(useGameStore.getState().canAccess('service:trading_floor')).toBe(false);
        useGameStore.getState().modifyFactionReputation('ghost', 8);
        expect(useGameStore.getState().canAccess('service:trading_floor')).toBe(true);
    });

    it('applies catalog action karma rewards to the player (no-op regression)', () => {
        // dispatchAction used to drop rewards.karma entirely — moral standing
        // declared by an action silently did nothing.
        useGameStore.setState({
            player: {
                ...INITIAL_STATE.player,
                energy: 100,
                stats: { ...INITIAL_STATE.player.stats, charisma: 20 }
            }
        });
        const before = useGameStore.getState().player.stats.karma;
        useGameStore.getState().dispatchAction('FOUNDRY_COUNCIL_CHECK');
        const after = useGameStore.getState();
        expect(after.player.stats.karma).toBe(before + 1);
        // The action still paid its stat reward alongside the karma.
        expect(after.player.stats.charisma).toBe(21);
    });

    it('changes district content pools when a faction is unlocked', () => {
        const state = useGameStore.getState();
        expect(canAccessCareer(state, CAREERS.data_entry_intern)).toBe(false);
        expect(canAccessNpcService(state, NPCS.npc_ghost)).toBe(false);

        useGameStore.getState().modifyFactionReputation('ghost', 8);
        const unlocked = useGameStore.getState();
        expect(canAccessCareer(unlocked, CAREERS.data_entry_intern)).toBe(true);
        expect(canAccessNpcService(unlocked, NPCS.npc_ghost)).toBe(true);
        // The reputation-gated ghost offer rotates through the seeded daily pool,
        // so scan a window of days (as a player would experience across a week)
        // instead of pinning day 1's exact three offers.
        let sawGatedGhostOffer = false;
        for (let day = 1; day <= 30 && !sawGatedGhostOffer; day++) {
            const offers = generateDailyContracts(day, unlocked);
            sawGatedGhostOffer = offers.some((offer) => offer.requiredReputation === 8 && offer.faction === 'ghost');
        }
        expect(sawGatedGhostOffer).toBe(true);
    });

    it('shows the correct persistent NPC reaction for each faction ending', () => {
        const angelReaction = NPCSystem.getDialogue('npc_ace', 0, 0, 'angel', { angel_ending_steward: true });
        const ghostReaction = NPCSystem.getDialogue('npc_lena', 0, 0, 'ghost', { ghost_ending_broker: true });
        const demonReaction = NPCSystem.getDialogue('npc_rook', 0, 0, 'demon', { demon_ending_monster: true });

        expect(angelReaction).toContain('Coalition answer in public');
        expect(ghostReaction).toContain('market position');
        expect(demonReaction).toContain('Mercy is only power');
    });

    it('supports equal faction arc conclusions and replay markers', () => {
        useGameStore.setState({
            quests: {
                ...INITIAL_STATE.quests,
                angel_coalition_line: { id: 'angel_coalition_line', status: 'active', objectives: { reach_civic_center_again: true } },
                ghost_price_of_knowing: { id: 'ghost_price_of_knowing', status: 'active', objectives: { reach_corporate_towers: true } },
                demon_seat_below: { id: 'demon_seat_below', status: 'active', objectives: { reach_underground: true } }
            }
        });

        useGameStore.getState().chooseQuest('angel_coalition_line', 'coalition_steward');
        useGameStore.getState().chooseQuest('ghost_price_of_knowing', 'open_channel');
        useGameStore.getState().chooseQuest('demon_seat_below', 'enforcer');

        const state = useGameStore.getState();
        expect(state.contentFlags.arc_complete_angel).toBe(true);
        expect(state.contentFlags.arc_complete_ghost).toBe(true);
        expect(state.contentFlags.arc_complete_demon).toBe(true);
        expect(state.achievements.angel_arc_complete).toBeTruthy();
        expect(state.achievements.ghost_arc_complete).toBeTruthy();
        expect(state.achievements.demon_arc_complete).toBeTruthy();
    });

    it('unlocks ending services, discounts, and post-arc contracts', () => {
        const state = useGameStore.getState();
        const postArcContract = {
            id: 'ending_contract_test', title: 'Ending Contract', description: 'A post-arc test.', faction: 'angel' as const,
            requiredContentFlag: 'angel_ending_steward', kind: 'social' as const,
            objective: { trigger: 'interact_npc', target: 'npc_old_man_jenkins' },
            reward: { cash: 100, xp: 20, reputation: 4 }, expiresDay: 1
        };

        expect(canAccessContract(state, postArcContract)).toBe(false);
        expect(state.getItemPrice('glock')).toBe(500);
        useGameStore.setState({ contentFlags: { angel_ending_steward: true } });
        const unlocked = useGameStore.getState();
        expect(canAccessContract(unlocked, postArcContract)).toBe(true);
        expect(unlocked.getItemPrice('glock')).toBe(400);
        expect(unlocked.npcs.npc_ace?.history || []).toEqual([]);
        expect(unlocked.contentFlags.angel_ending_steward).toBe(true);

        useGameStore.getState().useNPCService('npc_ace');
        let afterService = useGameStore.getState();
        expect(afterService.player.stats.charisma).toBe(INITIAL_STATE.player.stats.charisma + 2);
        expect(afterService.factionReputation.angel).toBe(3);
        expect(afterService.npcs.npc_ace.serviceUses['Civic endorsement']).toBe(afterService.world.day);

        useGameStore.getState().useNPCService('npc_ace');
        afterService = useGameStore.getState();
        expect(afterService.player.stats.charisma).toBe(INITIAL_STATE.player.stats.charisma + 2);
    });

    it('pays an eligible contract once and awards faction reputation', () => {
        // Disable the random-event engine so cash assertions stay deterministic.
        useGameStore.setState({ randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 99 } });
        useGameStore.getState().modifyFactionReputation('angel', 8);
        useGameStore.getState().refreshContracts();
        useGameStore.getState().setLocation('political_offices');
        const contract = useGameStore.getState().contracts.offers.find((offer) => offer.faction === 'angel');
        expect(contract).toBeDefined();

        useGameStore.getState().acceptContract(contract!.id);
        useGameStore.getState().completeContract(contract!.id);
        const afterFirstClaim = useGameStore.getState();
        expect(afterFirstClaim.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth + contract!.reward.cash);
        expect(afterFirstClaim.factionReputation.angel).toBe(8 + contract!.reward.reputation);

        useGameStore.getState().completeContract(contract!.id);
        expect(useGameStore.getState().player.stats.worth).toBe(afterFirstClaim.player.stats.worth);
    });

    it('issues and repays a loan, and escalates defaults on missed payments', () => {
        useGameStore.getState().takeLoan(200);
        let state = useGameStore.getState();
        expect(state.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth + 200);
        expect(state.finance.loanBalance).toBe(Math.ceil(200 * (1 + state.finance.interestRate)));
        expect(state.finance.loanDaysRemaining).toBe(3);

        // A second loan while in debt is refused.
        useGameStore.getState().takeLoan(100);
        expect(useGameStore.getState().finance.loanBalance).toBe(state.finance.loanBalance);

        useGameStore.getState().repayLoan(state.finance.loanBalance);
        state = useGameStore.getState();
        expect(state.finance.loanBalance).toBe(0);

        // Default path: take a loan and let three days pass with no cash to cover penalties.
        useGameStore.getState().takeLoan(500);
        useGameStore.getState().repayLoan(0);
        for (let day = 0; day < 4; day += 1) {
            useGameStore.getState().newDay();
        }
        const defaulted = useGameStore.getState();
        expect(defaulted.finance.defaults).toBeGreaterThan(0);
        expect(defaulted.finance.interestRate).toBeGreaterThan(INITIAL_STATE.finance.interestRate);
    });

    it('sells market intel tips that persist for the current day', () => {
        useGameStore.setState({
            market: {
                ...INITIAL_STATE.market,
                prices: { BTC: 5000, ETH: 300, BNB: 200, SOL: 100, XRP: 50, DOGE: 1, TRX: 1, ADA: 1, LINK: 10, XMR: 100 },
                trends: { BTC: 'bull', ETH: 'bull', BNB: 'bull', SOL: 'bull', XRP: 'bull', DOGE: 'bull', TRX: 'bull', ADA: 'bull', LINK: 'bull', XMR: 'bull' }
            }
        });
        const startingCash = useGameStore.getState().player.stats.worth;
        useGameStore.getState().buyIntel('intel_street_kid');
        const state = useGameStore.getState();
        expect(state.player.stats.worth).toBe(startingCash - 15);
        expect(Object.keys(state.market.intelTips).length).toBeGreaterThan(0);
    });

    it('gates faction vendors by reputation and applies relationship discounts', () => {
        useGameStore.setState({ world: { ...INITIAL_STATE.world, locationId: 'political_offices' } });

        // Below required reputation: purchase is refused.
        useGameStore.getState().buyFromVendor('vendor_coalition_depot', 'energy_drink');
        expect(useGameStore.getState().inventory.items['energy_drink']).toBeUndefined();

        useGameStore.getState().modifyFactionReputation('angel', 10);
        const before = useGameStore.getState().player.stats.worth;
        useGameStore.getState().buyFromVendor('vendor_coalition_depot', 'energy_drink');
        const after = useGameStore.getState();
        expect(after.inventory.items['energy_drink']).toBeDefined();
        expect(after.player.stats.worth).toBeLessThan(before);
        expect(after.player.stats.worth).toBeGreaterThan(before - 10);
    });

    it('installs housing upgrades once and applies the mattress energy bonus', () => {
        useGameStore.setState({ player: { ...INITIAL_STATE.player, stats: { ...INITIAL_STATE.player.stats, worth: 5000 } } });

        useGameStore.getState().buyHousingUpgrade('better_mattress');
        const state = useGameStore.getState();
        expect(state.player.housing.upgrades).toContain('better_mattress');
        expect(state.player.stats.worth).toBe(5000 - 300);

        // Second purchase attempt is refused and costs nothing.
        useGameStore.getState().buyHousingUpgrade('better_mattress');
        expect(useGameStore.getState().player.stats.worth).toBe(5000 - 300);

        useGameStore.getState().newDay();
        expect(useGameStore.getState().player.energy).toBe(110);
    });

    it('completes the courier finance contract on arrival and never pays twice', () => {
        // Disable the random-event engine so cash assertions stay deterministic.
        useGameStore.setState({ randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 99 } });
        useGameStore.getState().modifyFactionReputation('ghost', 5);
        const courier = useGameStore.getState().getFinanceContracts().find((offer) => offer.id === 'market_courier_brief');
        expect(courier).toBeDefined();
        expect(useGameStore.getState().acceptContract(courier!.id)).toBeUndefined();

        // Not accepted in the normal pool: simulate acceptance by completing directly.
        const cashBefore = useGameStore.getState().player.stats.worth;
        useGameStore.getState().completeFinanceContract('market_courier_brief');
        let after = useGameStore.getState();
        expect(after.finance.completedFinanceContractIds).toContain('market_courier_brief');
        expect(after.player.stats.worth).toBe(cashBefore + courier!.reward.cash);

        // Arrival completes silently only once; repeat completion is blocked.
        const afterCash = after.player.stats.worth;
        useGameStore.getState().completeFinanceContract('market_courier_brief');
        after = useGameStore.getState();
        expect(after.player.stats.worth).toBe(afterCash);
    });

    it('performs a daily city activity and applies its costs and rewards', () => {
        useGameStore.setState({
            world: { ...INITIAL_STATE.world, day: 1, time: 400 },
            player: { ...INITIAL_STATE.player, energy: 100 }
        });
        useGameStore.setState({ world: { ...useGameStore.getState().world, day: 3 } });
        // advanceTime inside the activity rolls random events; pin them off so the
        // cash assertion measures only the activity's own cost (same guard as above).
        useGameStore.setState({ randomEvents: { ...INITIAL_STATE.randomEvents, triggeredToday: 99 } });
        const activities = useGameStore.getState();
        // Day 3 % 3 === 0 bucket includes Corner Breakfast Run.
        const breakfast = getDailyActivities(useGameStore.getState()).find((activity) => activity.id === 'activity_block_breakfast');
        expect(breakfast).toBeDefined();

        const energyBefore = activities.player.energy;
        const jenkinsBefore = useGameStore.getState().npcs.npc_old_man_jenkins?.relationship || 0;
        activities.performCityActivity('activity_block_breakfast');
        const after = useGameStore.getState();
        expect(after.player.energy).toBe(energyBefore - breakfast!.energyCost);
        expect(after.player.stats.worth).toBe(INITIAL_STATE.player.stats.worth - breakfast!.cashCost);
        expect((after.npcs.npc_old_man_jenkins?.relationship || 0)).toBeGreaterThan(jenkinsBefore);
    });
});
