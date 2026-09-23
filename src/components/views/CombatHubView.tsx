'use client';

import { useMemo } from 'react';
import clsx from 'clsx';
import { COMBAT_ENCOUNTERS, getNextLadderEncounter, isCombatEncounterAvailable } from '@/data/combatProgression';
import { ITEMS } from '@/data/items';
import { useGameStore } from '@/stores/gameStore';

interface CombatHubViewProps {
    onBack: () => void;
}

export const CombatHubView = ({ onBack }: CombatHubViewProps) => {
    const gameState = useGameStore();
    const record = gameState.combatRecord;
    const equippedWeapon = gameState.inventory.equippedWeapon;
    const weapon = equippedWeapon ? ITEMS[equippedWeapon] : ITEMS.fists;
    const nextLadder = getNextLadderEncounter(gameState);
    const availableEncounters = useMemo(() => COMBAT_ENCOUNTERS.filter((encounter) => isCombatEncounterAvailable(gameState, encounter)), [gameState]);
    const rivals = availableEncounters.filter((encounter) => encounter.kind === 'rival');
    const factionChallenges = availableEncounters.filter((encounter) => encounter.kind === 'faction');

    return (
        <div className="flex flex-col h-full bg-[#120b0d] text-white p-4 md:p-8 overflow-y-auto">
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-red-400/20 pb-5">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-red-200/60 font-bold mb-2">Combat Network · Optional Progression</div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-red-100">FIGHT CIRCUIT</h1>
                    <p className="text-sm text-red-100/60 mt-2 max-w-2xl">Build a reputation as a fighter without locking yourself out of social, economic, or faction storylines.</p>
                </div>
                <button onClick={onBack} className="px-4 py-3 border border-red-300/30 rounded-xl text-xs font-black tracking-widest hover:bg-red-400/10">EXIT</button>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 max-w-6xl w-full mx-auto">
                <Stat label="Fighter Rep" value={record.reputation} />
                <Stat label="Wins" value={record.wins} />
                <Stat label="Losses" value={record.losses} />
                <Stat label="Ladder" value={`Tier ${record.ladderTier}`} />
            </div>

            <div className="max-w-6xl w-full mx-auto grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-6">
                <section className="space-y-6">
                    <div className="rounded-2xl border border-red-400/20 bg-black/20 p-5 md:p-6">
                        <div className="flex items-start justify-between gap-4 mb-5">
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.25em] text-red-200/60 font-bold mb-2">Fight ladder</div>
                                <h2 className="text-2xl font-black">NEXT RUNG</h2>
                            </div>
                            <div className="text-right text-[10px] uppercase tracking-widest text-zinc-500">{record.ladderWins} ladder wins</div>
                        </div>
                        {nextLadder ? <EncounterCard encounter={nextLadder} onFight={() => gameState.startCombatEncounter(nextLadder.id)} onResolve={gameState.resolveCombatEncounter} /> : <div className="text-sm text-emerald-300">The ladder is complete. The city knows your name.</div>}
                    </div>

                    <EncounterSection title="RIVALS" subtitle="Personal grudges become repeatable milestones." encounters={rivals} onFight={gameState.startCombatEncounter} onResolve={gameState.resolveCombatEncounter} empty="No rival has called you out yet." />
                    <EncounterSection title="FACTION CHALLENGES" subtitle="Each route rewards a different kind of victory." encounters={factionChallenges} onFight={gameState.startCombatEncounter} onResolve={gameState.resolveCombatEncounter} empty="Raise faction reputation to unlock faction combat challenges." />
                </section>

                <aside className="space-y-6">
                    <div className="rounded-2xl border border-red-400/20 bg-black/20 p-5">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-red-200/60 font-bold mb-3">Current build</div>
                        <div className="text-2xl font-black text-white">{weapon?.name || 'Bare Hands'}</div>
                        <p className="text-xs text-zinc-400 mt-2">{weapon?.description}</p>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-center text-[10px] uppercase tracking-widest">
                            <BuildStat label="Damage" value={weapon?.weaponStats?.damage || 0} />
                            <BuildStat label="Accuracy" value={`${weapon?.weaponStats?.accuracy || 0}%`} />
                            <BuildStat label="Crit" value={`${weapon?.weaponStats?.critChance || 0}%`} />
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-4">Equipment changes how you approach the ladder. High damage is not the only build: accuracy, crit chance, Charisma, Intelligence, and cash can all open alternate outcomes.</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-3">Combat rules</div>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>Combat costs Energy and can be avoided in major encounters.</li>
                            <li>Wins build fighter reputation and faction-specific consequences.</li>
                            <li>Losses advance the day, but do not end the wider story.</li>
                            <li>Accepted combat contracts still pay only after their objective is met.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const EncounterSection = ({ title, subtitle, encounters, onFight, onResolve, empty }: { title: string; subtitle: string; encounters: typeof COMBAT_ENCOUNTERS; onFight: (id: string) => void; onResolve: (id: string, method: 'social' | 'economic') => void; empty: string }) => (
    <div className="rounded-2xl border border-red-400/20 bg-black/20 p-5 md:p-6">
        <div className="mb-5"><div className="text-[10px] uppercase tracking-[0.25em] text-red-200/60 font-bold mb-2">{title}</div><p className="text-sm text-zinc-400">{subtitle}</p></div>
        <div className="space-y-3">{encounters.map((encounter) => <EncounterCard key={encounter.id} encounter={encounter} onFight={() => onFight(encounter.id)} onResolve={onResolve} />)}{encounters.length === 0 && <div className="text-sm text-zinc-500 italic">{empty}</div>}</div>
    </div>
);

const EncounterCard = ({ encounter, onFight, onResolve }: { encounter: typeof COMBAT_ENCOUNTERS[number]; onFight: () => void; onResolve: (id: string, method: 'social' | 'economic') => void }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div><div className="flex items-center gap-2"><h3 className="font-bold text-white">{encounter.title}</h3>{encounter.faction && <span className="text-[9px] uppercase tracking-widest text-red-200 border border-red-300/20 rounded-full px-2 py-1">{encounter.faction}</span>}</div><p className="text-xs text-zinc-400 mt-1">{encounter.description}</p><div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">+{encounter.rewards.reputation} fighter rep · ${encounter.rewards.cash} · {encounter.rewards.xp} XP{encounter.rewards.itemId ? ` · ${ITEMS[encounter.rewards.itemId]?.name || encounter.rewards.itemId}` : ''}</div></div>
            <div className="flex flex-wrap gap-2 shrink-0"><button onClick={onFight} className="px-3 py-2 rounded-lg bg-red-300 text-black text-[10px] font-black uppercase tracking-widest hover:bg-red-200">Fight</button>{encounter.nonCombat && <button onClick={() => onResolve(encounter.id, encounter.nonCombat!.method)} className={clsx('px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest', encounter.nonCombat.method === 'social' ? 'border-amber-300/30 text-amber-200' : 'border-cyan-300/30 text-cyan-200')}>{encounter.nonCombat.method === 'social' ? 'Resolve Socially' : 'Buy Leverage'}</button>}</div>
        </div>
    </div>
);

const Stat = ({ label, value }: { label: string; value: string | number }) => <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><div className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</div><div className="text-xl font-black text-white mt-1">{value}</div></div>;
const BuildStat = ({ label, value }: { label: string; value: string | number }) => <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2"><div className="text-zinc-500">{label}</div><div className="text-white font-bold mt-1">{value}</div></div>;
