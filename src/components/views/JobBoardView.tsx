import { useEffect } from 'react';
import clsx from 'clsx';
import { CAREERS } from '@/data/careers';
import { useGameStore } from '@/stores/gameStore';
import { CareerSystem } from '@/lib/CareerSystem';
import { canAccessCareer } from '@/lib/AccessSystem';

interface JobBoardViewProps {
    onBack: () => void;
}

export const JobBoardView = ({ onBack }: JobBoardViewProps) => {
    const locationId = useGameStore((state) => state.world.locationId);
    const currentCareerId = useGameStore((state) => state.career.currentId);
    const stats = useGameStore((state) => state.player.stats);
    const cash = useGameStore((state) => state.player.stats.worth);
    const energy = useGameStore((state) => state.player.energy);
    const dispatchAction = useGameStore((state) => state.dispatchAction);
    const applyJob = useGameStore((state) => state.applyJob);
    const workJob = useGameStore((state) => state.workJob);
    const contracts = useGameStore((state) => state.contracts);
    const world = useGameStore((state) => state.world);
    const acceptContract = useGameStore((state) => state.acceptContract);
    const abandonContract = useGameStore((state) => state.abandonContract);
    const refreshContracts = useGameStore((state) => state.refreshContracts);
    const gameState = useGameStore();

    useEffect(() => {
        refreshContracts();
    }, [refreshContracts, world.day]);

    const localOpenings = Object.values(CAREERS)
        .filter((career) => career.location === locationId)
        .sort((left, right) => left.dailyPay - right.dailyPay);

    const currentCareer = CAREERS[currentCareerId];
    const quickGigResult = ActionResolverPreview('WORK_SHIFT', stats);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white p-6 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-bold mb-2">Block Service Network</div>
                    <h1 className="text-3xl font-black tracking-tight">JOB BOARD</h1>
                    <p className="text-sm text-zinc-400 mt-2">
                        Quick money, long shifts, and a few ways to get the city watching.
                    </p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 border border-zinc-700 rounded-lg text-xs font-bold tracking-widest hover:bg-zinc-900 transition-all"
                >
                    EXIT
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
                <section className="space-y-6">
                    <div className="coalition-panel p-6 border-emerald-400/10">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-emerald-300/80 font-bold mb-2">Quick Gig</div>
                                <h2 className="text-2xl font-black text-white">Day Labor Shift</h2>
                                <p className="text-sm text-zinc-400 mt-2">
                                    No interview. No paperwork. Just six hours of hard work for immediate cash and tutorial progress.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold">Projected</div>
                                <div className="text-2xl font-black text-emerald-400">$60</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 text-xs">
                            <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                                <div className="text-zinc-500 uppercase tracking-[0.18em] text-[10px] mb-1">Cost</div>                                    <div className="font-bold text-white">30 Energy / 4 hours</div>
                            </div>
                            <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                                <div className="text-zinc-500 uppercase tracking-[0.18em] text-[10px] mb-1">Stat Check</div>
                                <div className="font-bold text-white">Power 5+</div>
                            </div>
                            <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                                <div className="text-zinc-500 uppercase tracking-[0.18em] text-[10px] mb-1">Reward</div>
                                <div className="font-bold text-white">Cash + XP + Power</div>
                            </div>
                        </div>

                        <button
                            onClick={() => dispatchAction('WORK_SHIFT')}
                            disabled={!quickGigResult.allowed}
                            className={clsx(
                                "w-full py-4 rounded-xl text-sm font-black uppercase tracking-[0.22em] transition-all",
                                quickGigResult.allowed
                                    ? "bg-emerald-400 text-black hover:bg-emerald-300"
                                    : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                            )}
                        >
                            {quickGigResult.allowed ? '[ TAKE SHIFT ]' : `[ ${quickGigResult.reason?.toUpperCase() || 'UNAVAILABLE'} ]`}
                        </button>
                    </div>

                    <div className="coalition-panel p-6 border-cyan-400/10">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-cyan-300/80 font-bold mb-2">Rotating Favors</div>
                                <h2 className="text-2xl font-black text-white">DAILY CONTRACTS</h2>
                            </div>
                            <div className="text-right text-xs text-zinc-500 uppercase tracking-[0.18em]">
                                <div>Day {world.day}</div>
                                {(contracts.expiredIds.length > 0 || contracts.failedIds.length > 0) && <div className="text-red-300/70 mt-1">{contracts.expiredIds.length} expired · {contracts.failedIds.length} failed</div>}
                            </div>
                        </div>
                        <div className="space-y-3 mb-8">
                            {contracts.offers.map((contract) => {
                                const done = contracts.completedIds.includes(contract.id) || contracts.statuses[contract.id] === 'completed';
                                const accepted = contracts.acceptedIds.includes(contract.id);
                                const status = contracts.statuses[contract.id] || 'available';
                                return (
                                    <div key={contract.id} className="rounded-xl border border-zinc-800 bg-black/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{contract.title}</span>
                                                <span className="text-[9px] px-2 py-1 rounded-full border border-cyan-400/20 text-cyan-200 uppercase tracking-widest">{contract.faction}</span>
                                            </div>
                                            <p className="text-xs text-zinc-400 mt-1">{contract.description}</p>
                                            <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Reward: ${contract.reward.cash} + {contract.reward.reputation} REP</div>
                                            <div className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Status: {status}</div>
                                        </div>
                                        <button
                                            disabled={done}
                                            onClick={() => accepted ? abandonContract(contract.id) : acceptContract(contract.id)}
                                            className={clsx("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest", done ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20" : accepted ? "bg-red-400/10 text-red-300 border border-red-400/20 hover:bg-red-400/20" : "bg-cyan-300 text-black hover:bg-cyan-200")}
                                        >
                                            {done ? 'PAID' : accepted ? 'ABANDON' : 'ACCEPT'}
                                        </button>
                                    </div>
                                );
                            })}
                            {contracts.offers.length === 0 && <div className="text-sm text-zinc-500 italic">No contracts generated yet. Return after sunrise.</div>}
                        </div>
                    </div>

                    <div className="coalition-panel p-6">
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-2">Open Contracts</div>
                                <h2 className="text-2xl font-black text-white">Career Track</h2>
                            </div>
                            <div className="text-xs text-zinc-500 uppercase tracking-[0.18em]">
                                {localOpenings.length} local posting{localOpenings.length === 1 ? '' : 's'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {localOpenings.map((career) => {
                                const factionAccess = canAccessCareer(gameState, career);
                                const eligibility = factionAccess
                                    ? CareerSystem.canApply(career.id, stats)
                                    : { allowed: false, reason: `Requires ${career.requiredReputation || 8} ${career.requiredFaction?.toUpperCase()} reputation.` };
                                const isCurrentCareer = currentCareerId === career.id;

                                return (
                                    <div key={career.id} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                                        <div className="flex items-start justify-between gap-4 mb-3">
                                            <div>
                                                <div className="font-bold text-lg text-white">{career.title}</div>
                                                <p className="text-sm text-zinc-400 mt-1">{career.description}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-bold">Daily Pay</div>
                                                <div className="text-xl font-black text-coalition-gold">${career.dailyPay}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-4 text-[10px] uppercase tracking-[0.18em]">
                                            {Object.entries(career.statReqs).length === 0 && (
                                                <span className="px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">No stat gate</span>
                                            )}
                                            {Object.entries(career.statReqs).map(([stat, requirement]) => (
                                                <span
                                                    key={stat}
                                                    className={clsx(
                                                        "px-2 py-1 rounded-full border",
                                                        stats[stat as keyof typeof stats] >= (requirement || 0)
                                                            ? "border-emerald-400/30 text-emerald-300"
                                                            : "border-red-400/20 text-red-300"
                                                    )}
                                                >
                                                    {stat} {requirement}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                                            <div className="text-xs text-zinc-500">
                                                {isCurrentCareer
                                                    ? 'This is your active role. Punch in when you are ready.'
                                                    : eligibility.allowed
                                                        ? 'You qualify for this posting.'
                                                        : eligibility.reason}
                                            </div>

                                            {isCurrentCareer ? (
                                                <button
                                                    onClick={workJob}
                                                    className="px-4 py-2 rounded-lg bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all"
                                                >
                                                    [ WORK SHIFT ]
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => applyJob(career.id)}
                                                    disabled={!eligibility.allowed}
                                                    className={clsx(
                                                        "px-4 py-2 rounded-lg text-xs font-black uppercase tracking-[0.2em] transition-all",
                                                        eligibility.allowed
                                                            ? "bg-zinc-100 text-black hover:bg-white"
                                                            : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                                                    )}
                                                >
                                                    [ APPLY ]
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <aside className="space-y-6">
                    <div className="coalition-panel p-6">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-2">Current Status</div>
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-zinc-500 uppercase tracking-[0.18em] mb-1">Role</div>
                                <div className="text-xl font-black text-white">
                                    {currentCareer ? currentCareer.title : 'Unemployed'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-bold mb-1">Cash</div>
                                    <div className="font-bold text-emerald-400">${cash}</div>
                                </div>
                                <div className="rounded-lg border border-zinc-800 bg-black/20 p-3">
                                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-bold mb-1">Will</div>
                                    <div className="font-bold text-cyan-300">{energy}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="coalition-panel p-6">
                        <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 font-bold mb-3">Starter Advice</div>
                        <ul className="space-y-3 text-sm text-zinc-400">
                            <li>Take one quick shift if you need money and want to advance the intro arc immediately.</li>
                            <li>Apply for a local contract once your stats line up so you can work full shifts from here.</li>
                            <li>Use gym and university sessions to unlock stronger roles instead of grinding random cash forever.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const ActionResolverPreview = (actionId: string, stats: ReturnType<typeof useGameStore.getState>['player']['stats']) => {
    if (actionId === 'WORK_SHIFT') {
        if (stats.power < 5) {
            return { allowed: false, reason: 'need power 5' };
        }

        if (useGameStore.getState().player.energy < 30) {
            return { allowed: false, reason: 'need energy 30' };
        }
    }

    return { allowed: true, reason: '' };
};
