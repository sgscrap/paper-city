'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import { useGameStore, ClubActivityId } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { NPCS } from '@/data/npcs';
import { CLUB_EVENTS, isClubEventAvailable } from '@/data/club';
import { getNpcVenue, getVenueName } from '@/lib/NpcCityAI';

interface ClubViewProps {
    onBack: () => void;
}

const ACTIVITIES: Array<{
    id: ClubActivityId;
    title: string;
    description: string;
    faction: 'angel' | 'ghost' | 'demon';
    cost: string;
    reward: string;
}> = [
    {
        id: 'CLUB_SOCIAL',
        title: 'Community Mixer',
        description: 'Meet residents, build trust, and keep the night welcoming instead of predatory.',
        faction: 'angel',
        cost: '10 Energy · 45 min',
        reward: '+1 Charisma'
    },
    {
        id: 'CLUB_NETWORK',
        title: 'Signal Exchange',
        description: 'Trade a quiet message through the DJ booth and leave with a sharper read on the city.',
        faction: 'ghost',
        cost: '$20 · 12 Energy · 60 min',
        reward: '+1 Intelligence'
    },
    {
        id: 'CLUB_BACKROOM',
        title: 'Backroom Negotiation',
        description: 'Handle a private dispute with pressure, restraint, and no public spectacle.',
        faction: 'demon',
        cost: '$35 · 18 Energy · 75 min',
        reward: '+1 Power'
    }
];

const CLUB_NPCS = ['npc_club_host_aria', 'npc_club_dj_echo', 'npc_club_bouncer_kane'];

export const ClubView = ({ onBack }: ClubViewProps) => {
    const day = useGameStore((state) => state.world.day);
    const time = useGameStore((state) => state.world.time);
    const energy = useGameStore((state) => state.player.energy);
    const cash = useGameStore((state) => state.player.stats.worth);
    const factionIdentity = useGameStore((state) => state.factionIdentity.primaryFaction);
    const club = useGameStore((state) => state.club);
    const contracts = useGameStore((state) => state.contracts);
    const refreshContracts = useGameStore((state) => state.refreshContracts);
    const performClubActivity = useGameStore((state) => state.performClubActivity);
    const acceptContract = useGameStore((state) => state.acceptContract);
    const abandonContract = useGameStore((state) => state.abandonContract);
    const interactNPC = useGameStore((state) => state.interactNPC);
    const setActiveTab = useUIStore((state) => state.setActiveTab);

    useEffect(() => {
        refreshContracts();
    }, [refreshContracts, day]);

    const clubContracts = contracts.offers.filter((contract) => contract.venue === 'club_lust');

    return (
        <div className="flex flex-col h-full bg-[#130d18] text-white p-4 md:p-8 overflow-y-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-fuchsia-500/20 pb-5">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/70 font-bold mb-2">Downtown Baltimore · Nightlife Sector</div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-fuchsia-100">CLUB LUST</h1>
                    <p className="text-sm text-fuchsia-100/60 mt-2 max-w-2xl">
                        The city loosens its tie here. Social capital, private information, and underworld pressure all share the same dance floor.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-fuchsia-400/20 bg-black/20 px-4 py-3 text-right text-xs font-mono">
                        <div className="text-fuchsia-200/50 uppercase tracking-widest">Day {day} · Club Rep {club.reputation}</div>
                        <div className="text-white">{Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')} · {energy} Energy · ${cash}</div>
                        <div className={clsx('mt-1 uppercase tracking-widest', club.heat >= 8 ? 'text-red-300' : club.heat >= 4 ? 'text-amber-200' : 'text-emerald-300')}>Nightlife Heat {club.heat}/100</div>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-4 py-3 border border-fuchsia-300/30 rounded-xl text-xs font-black tracking-widest hover:bg-fuchsia-400/10 transition-all"
                    >
                        EXIT
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6 max-w-7xl w-full mx-auto">
                <section className="space-y-6">
                    <div className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5 md:p-6">
                        <div className="grid grid-cols-3 gap-2 mb-5 text-[10px] uppercase tracking-widest">
                            {(['angel', 'ghost', 'demon'] as const).map((faction) => (
                                <div key={faction} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                    <div className="text-zinc-500">{faction} trust</div>
                                    <div className="text-white text-lg font-black mt-1">{club.factionTrust[faction]}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70 font-bold mb-2">Choose your night</div>
                                <h2 className="text-2xl font-black text-white">SOCIAL FLOOR ACTIVITIES</h2>
                            </div>
                            {factionIdentity && <div className="text-[10px] uppercase tracking-widest text-fuchsia-200/60">Identity signal: {factionIdentity}</div>}
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {ACTIVITIES.map((activity) => (
                                <div key={activity.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white">{activity.title}</h3>
                                            <span className={clsx(
                                                'text-[9px] px-2 py-1 rounded-full border uppercase tracking-widest',
                                                activity.faction === 'angel' && 'border-amber-300/30 text-amber-200',
                                                activity.faction === 'ghost' && 'border-cyan-300/30 text-cyan-200',
                                                activity.faction === 'demon' && 'border-red-300/30 text-red-200'
                                            )}>{activity.faction}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 max-w-xl">{activity.description}</p>
                                        <div className="flex flex-wrap gap-3 mt-3 text-[10px] uppercase tracking-widest">
                                            <span className="text-zinc-500">{activity.cost}</span>
                                            <span className="text-emerald-300">{activity.reward}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => performClubActivity(activity.id)}
                                        className="shrink-0 px-4 py-3 rounded-lg bg-fuchsia-300 text-black text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-200 transition-all"
                                    >
                                        Start Activity
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70 font-bold mb-2">Your reputation changes the room</div>
                                <h2 className="text-2xl font-black text-white">NIGHTLIFE EVENTS</h2>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500">{CLUB_EVENTS.filter((event) => isClubEventAvailable(event, club)).length} unlocked</div>
                        </div>
                        <div className="space-y-3">
                            {CLUB_EVENTS.filter((event) => isClubEventAvailable(event, club)).map((event) => {
                                const used = club.eventUses[event.id] === day;
                                return (
                                    <div key={event.id} className="rounded-xl border border-amber-300/20 bg-amber-300/[0.03] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2"><span className="font-bold text-white">{event.title}</span><span className="text-[9px] uppercase tracking-widest text-amber-200">{event.faction}</span></div>
                                            <p className="text-xs text-zinc-400 mt-1">{event.description}</p>
                                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">${event.cashCost} · {event.energyCost} Energy · {event.timeCost} min · heat {event.rewards.heat >= 0 ? '+' : ''}{event.rewards.heat}</div>
                                        </div>
                                        <button disabled={used} onClick={() => useGameStore.getState().performClubEvent(event.id)} className={clsx('px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest', used ? 'border border-zinc-700 text-zinc-600' : 'bg-amber-200 text-black hover:bg-amber-100')}>
                                            {used ? 'DONE TONIGHT' : 'HANDLE EVENT'}
                                        </button>
                                    </div>
                                );
                            })}
                            {CLUB_EVENTS.every((event) => !isClubEventAvailable(event, club)) && <div className="text-sm text-zinc-500 italic">The room has not decided what to trust you with yet. Keep showing up.</div>}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5 md:p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70 font-bold mb-2">Rotating nightlife work</div>
                                <h2 className="text-2xl font-black text-white">CLUB CONTRACTS</h2>
                            </div>
                            <button onClick={() => setActiveTab('jobs')} className="text-[10px] uppercase tracking-widest text-fuchsia-200/70 hover:text-white">Open full board →</button>
                        </div>

                        <div className="space-y-3">
                            {clubContracts.map((contract) => {
                                const accepted = contracts.acceptedIds.includes(contract.id);
                                const completed = contracts.completedIds.includes(contract.id) || contracts.statuses[contract.id] === 'completed';
                                const status = contracts.statuses[contract.id] || 'available';
                                return (
                                    <div key={contract.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{contract.title}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-fuchsia-200 border border-fuchsia-300/20 rounded-full px-2 py-1">{contract.faction}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1">{contract.description}</p>
                                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">${contract.reward.cash} · {contract.reward.xp} XP · {contract.reward.reputation} REP · {status}</div>
                                        </div>
                                        <button
                                            disabled={completed}
                                            onClick={() => accepted ? abandonContract(contract.id) : acceptContract(contract.id)}
                                            className={clsx(
                                                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest',
                                                completed && 'border border-emerald-300/20 text-emerald-200 bg-emerald-400/10',
                                                !completed && accepted && 'border border-red-300/20 text-red-200 bg-red-400/10 hover:bg-red-400/20',
                                                !completed && !accepted && 'bg-fuchsia-300 text-black hover:bg-fuchsia-200'
                                            )}
                                        >
                                            {completed ? 'PAID' : accepted ? 'ABANDON' : 'ACCEPT'}
                                        </button>
                                    </div>
                                );
                            })}
                            {clubContracts.length === 0 && <div className="text-sm text-zinc-500 italic">No club contracts are circulating tonight. Check again after the next daily refresh.</div>}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="rounded-2xl border border-fuchsia-400/20 bg-black/20 p-5">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/70 font-bold mb-3">People worth knowing</div>
                        <div className="space-y-3">
                            {CLUB_NPCS.map((npcId) => {
                                const npc = NPCS[npcId];
                                if (!npc) return null;
                                const isHere = getNpcVenue(npcId, time) === 'club';
                                return (
                                    <div key={npcId} className={clsx(
                                        "rounded-xl border p-4",
                                        isHere ? "border-white/10 bg-white/[0.03]" : "border-white/5 bg-black/30 opacity-60"
                                    )}>
                                        <div className="flex items-center justify-between gap-3 mb-2">
                                            <div className="font-bold text-white">{npc.name}</div>
                                            <div className="text-[9px] uppercase tracking-widest text-zinc-500">{npc.faction}</div>
                                        </div>
                                        {!isHere && (
                                            <div className="text-[9px] uppercase tracking-widest text-amber-300/70 mb-2">
                                                Elsewhere — {getVenueName(getNpcVenue(npcId, time))}
                                            </div>
                                        )}
                                        <p className="text-xs text-zinc-400 leading-relaxed mb-3">{npc.baseDialogue[0]}</p>
                                        <button
                                            onClick={() => interactNPC(npcId, 'chat')}
                                            className="w-full py-2 rounded-lg border border-fuchsia-300/25 text-fuchsia-100 text-[10px] font-black uppercase tracking-widest hover:bg-fuchsia-300/10"
                                        >
                                            Talk to {npc.name}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-3">Night protocol</div>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Activities consume Energy and advance city time.</li>
                            <li>Contract progress only counts after you accept the opportunity.</li>
                            <li>Social effects follow the same daily reward rules as the rest of the city.</li>
                            <li>Return tomorrow for a new faction signal and a different contract.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};
