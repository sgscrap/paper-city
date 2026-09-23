'use client';

import { useEffect, useRef } from 'react';

import { useGameStore } from '@/stores/gameStore';
import { KarmaSystem } from '@/lib/KarmaSystem';
import { CoalitionModal } from '@/components/ui/CoalitionModal';
import { useState } from 'react';
import clsx from 'clsx';
import { useUIStore } from '@/stores/uiStore';

export const Sidebar = () => {
    const {
        getEffectiveStats,
        world,
        exportSave,
        importSave,
    } = useGameStore();
    const setActiveTab = useUIStore(state => state.setActiveTab);
    const replayTutorial = useGameStore((state) => state.replayTutorial);
    const stats = getEffectiveStats();
    const factionReputation = useGameStore((state) => state.factionReputation);
    const energy = useGameStore((state) => state.player.energy);
    const debt = useGameStore((state) => state.finance?.loanBalance || 0);
    const loanDays = useGameStore((state) => state.finance?.loanDaysRemaining || 0);
    const day = world.day;
    const time = world.time;
    const karmaColor = KarmaSystem.getColor(stats.karma);
    const karmaRef = useRef<HTMLDivElement>(null);
    const [showResetModal, setShowResetModal] = useState(false);

    useEffect(() => {
        if (karmaRef.current) {
            karmaRef.current.style.left = `${((stats.karma + 100) / 200) * 100}%`;
        }
    }, [stats.karma]);

    return (
        <aside className="w-64 bg-bg-panel border-r border-border-soft p-4 flex flex-col h-full font-mono">
            {/* Header */}
            <div className="mb-4 pb-3 border-b border-border-soft">
                <h1 className="text-xl font-extrabold text-white tracking-[0.06em] mb-1 font-sans">PAPER CITY OS</h1>
                <div className="text-[10px] text-zinc-500 font-bold tracking-widest">v1.0.0 // COALITION_NET</div>
            </div>

            {/* Time & Wealth Indicator */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="coalition-panel p-2 flex justify-between items-center px-3">
                    <div className="text-[10px] text-text-muted font-bold tracking-wider">STAMP</div>
                    <div className="text-sm font-bold text-white font-mono">
                        DAY {day} <span className="text-zinc-600 px-1">·</span> {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
                    </div>
                </div>

                <div className="coalition-panel p-3 border-coalition-gold/20 shadow-gold">
                    <div className="text-[10px] text-coalition-gold font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-coalition-gold rounded-full animate-pulse" />
                        NET WORTH
                    </div>
                    <div className="text-xl font-black text-white font-mono flex items-center gap-1">
                        <span className="text-xs text-zinc-600">$</span>
                        {useGameStore.getState().getNetWorth().toLocaleString()}
                    </div>
                </div>

                <div className="coalition-panel p-2 flex justify-between items-center px-3">
                    <div className="text-[10px] text-text-muted tracking-wider">CASH</div>
                    <div className="text-sm font-bold text-white font-mono">${stats.worth.toLocaleString()}</div>
                </div>

                <button
                    onClick={() => setActiveTab('economy')}
                    className="coalition-panel p-2 flex justify-between items-center px-3 hover:border-coalition-gold/40 transition-colors group"
                >
                    <div className="text-[10px] text-text-muted tracking-wider group-hover:text-coalition-gold">DEBT</div>
                    <div className={`text-sm font-bold font-mono ${debt > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {debt > 0 ? `-$${debt.toLocaleString()} · ${loanDays}d` : 'CLEAR'}
                    </div>
                </button>
            </div>

            {/* Combat Record */}
            <div className="mb-4">
                <CombatRecordDisplay />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-2 mb-4">
                <StatBar label="POWER" value={stats.power} color="bg-demon shadow-demon" />
                <StatBar label="INTEL" value={stats.intelligence} color="bg-ghost shadow-ghost" />
                <StatBar label="CHARM" value={stats.charisma} color="bg-coalition-gold shadow-gold" />
                <StatBar label="LUCK" value={stats.luck} color="bg-white/80" />
                <StatBar label="ENERGY" value={energy} color="bg-zinc-500" />
            </div>

            {/* Karma Meter */}
            <div className="mb-auto">
                <div className="coalition-panel p-3">
                    <div className="flex justify-between text-xs mb-2">
                        <span className="font-bold tracking-wider text-text-muted">KARMA</span>
                        <span className={clsx("font-mono font-bold", {
                            'text-ghost drop-shadow-[0_0_5px_rgba(109,220,255,0.5)]': karmaColor === '#00f0ff',
                            'text-demon drop-shadow-[0_0_5px_rgba(255,59,59,0.5)]': karmaColor === '#ff0055',
                            'text-white': karmaColor === '#e0e0e0',
                        })}>{stats.karma}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 w-full relative rounded-full overflow-hidden">
                        <div
                            ref={karmaRef}
                            className={clsx(
                                "absolute h-full transition-all duration-500 w-[2px] shadow-[0_0_10px_currentColor]",
                                {
                                    'bg-ghost': karmaColor === '#00f0ff',
                                    'bg-demon': karmaColor === '#ff0055',
                                    'bg-white': karmaColor === '#e0e0e0',
                                }
                            )}
                        />
                    </div>
                </div>
            </div>

            <div className="coalition-panel p-3 mb-4">
                <div className="text-[10px] font-bold tracking-widest text-text-muted mb-2">FACTION SIGNAL</div>
                <div className="space-y-2">
                    {(['angel', 'ghost', 'demon'] as const).map((faction) => (
                        <div key={faction} className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                            <span className={faction === 'angel' ? 'text-ghost' : faction === 'ghost' ? 'text-coalition-blue' : 'text-demon'}>{faction}</span>
                            <span className="font-mono text-white">{factionReputation[faction] >= 0 ? '+' : ''}{factionReputation[faction]}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="text-[10px] text-zinc-600 border-t border-zinc-800 pt-2 flex justify-between items-end">
                <div>
                    USER: PLAYER_1<br />
                    STATUS: ONLINE
                </div>
                <button
                    onClick={() => setShowResetModal(true)}
                    className="text-red-900 hover:text-red-500 underline cursor-pointer"
                >
                    RESET
                </button>
            </div>

            {/* System Actions */}
            <div className="coalition-panel p-2 flex gap-2 mt-2">
                <button
                    onClick={() => exportSave()}
                    className="flex-1 text-[10px] font-mono py-1 border border-coalition-blue/30 text-coalition-blue hover:bg-coalition-blue/10 transition-colors"
                >
                    [ EXPORT SAVE ]
                </button>
                <label className="flex-1 text-[10px] font-mono py-1 border border-angel-500/30 text-angel-500 hover:bg-angel-500/10 transition-colors text-center cursor-pointer">
                    [ IMPORT SAVE ]
                    <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (re) => {
                                    const content = re.target?.result as string;
                                    if (content) importSave(content);
                                };
                                reader.readAsText(file);
                            }
                        }}
                    />
                </label>
            </div>

            <div className="coalition-panel p-2 mt-4 space-y-2">
                <button
                    onClick={replayTutorial}
                    className="w-full text-[10px] font-black tracking-widest py-2 border border-coalition-blue/30 text-coalition-blue hover:bg-coalition-blue/10 transition-all uppercase"
                >
                    [ REPLAY_FIELD_GUIDE ]
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className="w-full text-[10px] font-black tracking-widest py-2 border border-ghost/30 text-ghost hover:bg-ghost/10 transition-all uppercase"
                >
                    [ OS_MILESTONES ]
                </button>
            </div>

            <CoalitionModal
                isOpen={showResetModal}
                onClose={() => setShowResetModal(false)}
                onConfirm={() => {
                    useGameStore.getState().resetGame();
                    window.location.reload();
                }}
                title="Wipe Kernel?"
                message="This will permanently delete all save data, wealth, and identity markers from the local buffer. This action is irreversible."
                confirmText="Erase Data"
                type="warning"
            />
        </aside>
    );
};

const StatBar = ({ label, value, color }: { label: string, value: number, color: string }) => {
    const barRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (barRef.current) {
            barRef.current.style.width = `${Math.min(100, Math.max(0, value))}%`;
        }
    }, [value]);

    return (
        <div className="group">
            <div className="flex justify-between text-[10px] mb-1">
                <span className="font-bold text-zinc-500 tracking-wider group-hover:text-white transition-colors">{label}</span>
                <span className="font-mono text-zinc-400">{isNaN(value) ? 0 : value}</span>
            </div>
            <div className="h-1.5 bg-black/50 w-full rounded-full overflow-hidden border border-white/5">
                <div
                    ref={barRef}
                    className={`h-full ${color} transition-all duration-500 ease-out`}
                />
            </div>
        </div>
    );
};

const CombatRecordDisplay = () => {
    const record = useGameStore((state) => state.combatRecord || { wins: 0, losses: 0, rankTitle: 'Fresh Meat' });

    return (
        <div className="coalition-panel p-3">
            <div className="text-[10px] text-text-muted mb-2 font-bold tracking-wider">STREET CRED</div>
            <div className="flex justify-between items-center">
                <div className="font-black text-white text-sm tracking-widest">{record.rankTitle.toUpperCase()}</div>
                <div className="text-[10px] text-zinc-500 font-mono flex gap-2">
                    <span className="text-red-200">{record.reputation || 0} REP</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-white">{record.wins} W</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-500">{record.losses} L</span>
                </div>
            </div>
        </div>
    );
};
