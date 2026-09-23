'use client';

import clsx from 'clsx';
import { NPCS } from '@/data/npcs';
import { QUESTS } from '@/data/quests';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { canAccessNpcService } from '@/lib/AccessSystem';
import { getNpcVenue, VENUE_NAMES, NpcCityAI } from '@/lib/NpcCityAI';

const sceneNames = VENUE_NAMES;

export const NPCList = () => {
    const activeTab = useUIStore((state) => state.activeTab);
    const worldLocationId = useGameStore((state) => state.world.locationId);
    const questState = useGameStore((state) => state.quests);
    const npcState = useGameStore((state) => state.npcs);
    const contracts = useGameStore((state) => state.contracts);
    const interactNPC = useGameStore((state) => state.interactNPC);
    const worldTime = useGameStore((state) => state.world.time);
    const gameState = useGameStore();

    const sceneLocation =
        activeTab === 'location'
            ? worldLocationId
            : activeTab === 'gym'
                ? 'gym'
                : activeTab === 'university'
                    ? 'university'
                    : activeTab === 'jobs'
                        ? 'job_board'
                        : activeTab === 'trading'
                            ? 'trading_floor'
                            : activeTab === 'safehouse'
                                ? 'safehouse'
                                : activeTab === 'casino'
                                    ? 'casino'
                                    : activeTab === 'club'
                                        ? 'club'
                    : worldLocationId;

    const nearbyResidents = Object.values(NPCS).filter((npc) => getNpcVenue(npc.id, worldTime) === sceneLocation);
    const serviceRoster = NpcCityAI.getServiceRoster(worldTime);
    const activeQuests = Object.values(questState)
        .filter((quest) => quest.status === 'active')
        .map((quest) => ({
            progress: quest,
            definition: QUESTS[quest.id]
        }))
        .filter((entry): entry is { progress: typeof questState[string]; definition: typeof QUESTS[string] } => Boolean(entry.definition));

    const completedQuestCount = Object.values(questState).filter((quest) => quest.status === 'completed').length;

    return (
        <aside className="w-80 border-l border-zinc-800 bg-zinc-950/70 backdrop-blur-sm p-6 flex flex-col gap-6">
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Nearby Residents</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.18em] mt-1">
                            {sceneNames[sceneLocation] || sceneLocation}
                        </p>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">
                        {nearbyResidents.length} signal{nearbyResidents.length === 1 ? '' : 's'}
                    </div>
                </div>

                <div className="space-y-3">
                    {nearbyResidents.length === 0 && (
                        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-sm text-zinc-500 font-mono">
                            No local chatter is coming through in this sector.
                        </div>
                    )}

                    {nearbyResidents.map((npc) => {
                        const relationship = npcState[npc.id]?.relationship ?? 0;
                        const trust = npcState[npc.id]?.trust ?? 0;
                        const fear = npcState[npc.id]?.fear ?? 0;
                        const hasQuestHook = Boolean(npc.questId && !questState[npc.questId]);
                        const serviceAvailable = canAccessNpcService(gameState, npc);
                        const specialServiceAvailable = Boolean(npc.specialServiceFlags?.some((flag) => gameState.contentFlags[flag]));

                        return (
                            <div key={npc.id} className="coalition-panel p-4">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <div className="font-bold text-white text-sm tracking-wide">{npc.name}</div>
                                        <div
                                            className={clsx(
                                                "text-[10px] uppercase tracking-[0.18em] mt-1",
                                                relationship > 15 && "text-emerald-300",
                                                relationship < -15 && "text-red-300",
                                                relationship >= -15 && relationship <= 15 && "text-zinc-500"
                                            )}
                                        >
                                            Rel {relationship >= 0 ? `+${relationship}` : relationship} · Trust {trust >= 0 ? `+${trust}` : trust}
                                        </div>
                                        {fear > 0 && <div className="text-[9px] uppercase tracking-widest text-red-300 mt-1">Fear +{fear}</div>}
                                    </div>
                                    {(hasQuestHook || npc.service) && (
                                        <div className={clsx(
                                            "text-[10px] px-2 py-1 rounded-full border uppercase tracking-[0.18em]",
                                            serviceAvailable ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300" : "bg-red-500/5 border-red-400/20 text-red-300"
                                        )}>
                                            {npc.service && !serviceAvailable ? 'Locked' : npc.service || 'Intel'}
                                        </div>
                                    )}
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed mb-2">
                                    {NpcCityAI.getGreeting(npc.id, worldTime) ?? npc.baseDialogue[0]}
                                </p>
                                {npc.service && (
                                    <p className={clsx("text-[10px] uppercase tracking-widest mb-2", serviceAvailable ? "text-emerald-300" : "text-red-300")}>
                                        {serviceAvailable ? `${npc.service} service available` : `Requires ${npc.serviceFaction?.toUpperCase()} standing`}
                                    </p>
                                )}
                                {npc.specialService && (
                                    <p className={clsx("text-[10px] uppercase tracking-widest mb-4", specialServiceAvailable ? "text-coalition-gold" : "text-zinc-600")}>
                                        {specialServiceAvailable ? `Unlocked: ${npc.specialService}` : 'Post-arc service locked'}
                                    </p>
                                )}

                                <button
                                    onClick={() => interactNPC(npc.id, 'chat')}
                                    className={clsx(
                                        "w-full py-2 text-[10px] font-black tracking-[0.2em] uppercase border rounded-lg transition-all",
                                        hasQuestHook
                                            ? "border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10"
                                            : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                                    )}
                                >
                                    {hasQuestHook ? '[ OPEN INTEL ]' : '[ TALK ]'}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Service Contacts</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.18em] mt-1">Where services are right now</p>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">
                        {serviceRoster.length}
                    </div>
                </div>
                <div className="space-y-2">
                    {serviceRoster.map((contact) => {
                        const isHere = contact.venue === sceneLocation;
                        return (
                            <div key={contact.npcId} className={clsx(
                                "rounded-lg border px-3 py-2",
                                isHere ? "border-cyan-400/25 bg-cyan-500/5" : "border-zinc-800 bg-black/20"
                            )}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-white">{contact.name}</span>
                                    <span className={clsx(
                                        "text-[9px] uppercase tracking-widest",
                                        isHere ? "text-cyan-300" : "text-zinc-500"
                                    )}>
                                        {isHere ? 'Here' : contact.venueName}
                                    </span>
                                </div>
                                <div className="text-[9px] uppercase tracking-widest text-coalition-gold mt-1">
                                    {contact.specialService || contact.service}
                                    {contact.service && contact.specialService ? ' · ' + contact.service : ''}
                                </div>
                            </div>
                        );
                    })}
                    {serviceRoster.length === 0 && (
                        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-sm text-zinc-500 font-mono">
                            No service contacts in the city yet.
                        </div>
                    )}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Daily Tasks</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.18em] mt-1">Conversation-linked work</p>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">{contracts.offers.length}</div>
                </div>
                <div className="space-y-2">
                    {contracts.offers.map((contract) => {
                        const completed = contracts.completedIds.includes(contract.id) || contracts.statuses[contract.id] === 'completed';
                        const accepted = contracts.acceptedIds.includes(contract.id);
                        return (
                            <div key={contract.id} className={clsx("rounded-lg border px-3 py-2", completed ? "border-emerald-400/20 bg-emerald-500/5" : "border-zinc-800 bg-black/20")}>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-bold text-white">{contract.title}</span>
                                    <span className={clsx("text-[9px] uppercase tracking-widest", completed ? "text-emerald-300" : accepted ? "text-cyan-300" : "text-amber-300")}>{completed ? 'Paid' : accepted ? 'Accepted' : 'Available'}</span>
                                </div>
                                <div className="text-[10px] text-zinc-500 mt-1">{contract.objective.trigger === 'interact_npc' ? `Talk to ${NPCS[contract.objective.target || '']?.name || 'contact'}` : contract.description}</div>
                                <div className="text-[9px] text-zinc-600 uppercase tracking-widest mt-1">${contract.reward.cash} · {contract.reward.xp} XP · {contract.faction} rep</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="flex-1 min-h-0">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Active Quests</h3>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-[0.18em] mt-1">
                            {completedQuestCount} completed
                        </p>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">
                        {activeQuests.length} live
                    </div>
                </div>

                <div className="space-y-3 overflow-y-auto pr-1 max-h-full">
                    {activeQuests.length === 0 && (
                        <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 text-sm text-zinc-500 font-mono">
                            City is quiet for now. Keep moving and somebody will notice.
                        </div>
                    )}

                    {activeQuests.map(({ progress, definition }) => {
                        const completedObjectives = definition.objectives.filter((objective) => Boolean(progress.objectives?.[objective.id])).length;

                        return (
                            <div key={definition.id} className="coalition-panel p-4">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <div>
                                        <div className="font-bold text-sm text-white">{definition.title}</div>
                                        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mt-1">
                                            {completedObjectives}/{definition.objectives.length} objectives
                                        </div>
                                    </div>
                                    <div className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-200 uppercase tracking-[0.18em]">
                                        Active
                                    </div>
                                </div>

                                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                                    {definition.description}
                                </p>

                                <div className="space-y-2">
                                    {definition.objectives.map((objective) => {
                                        const completed = Boolean(progress.objectives?.[objective.id]);

                                        return (
                                            <div
                                                key={objective.id}
                                                className={clsx(
                                                    "rounded-lg border px-3 py-2 text-xs",
                                                    completed
                                                        ? "border-emerald-400/20 bg-emerald-500/5 text-emerald-200"
                                                        : "border-zinc-800 bg-black/20 text-zinc-400"
                                                )}
                                            >
                                                <div className="font-mono uppercase tracking-[0.18em] text-[10px] mb-1">
                                                    {completed ? 'Done' : 'Pending'}
                                                </div>
                                                <div>{objective.description}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </aside>
    );
};
