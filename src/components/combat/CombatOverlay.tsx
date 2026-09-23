import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import clsx from 'clsx';

export const CombatOverlay = () => {
    const combatState = useGameStore(state => state.combatState);
    const combatAction = useGameStore(state => state.combatAction);
    const endCombat = useGameStore(state => state.endCombat);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [combatState?.logs]);

    if (!combatState) return null;

    const { playerHp, playerMaxHp, enemyHp, enemy, logs, isOver, result } = combatState;
    if (!enemy) return null;

    const playerPct = Math.min(100, Math.max(0, (playerHp / playerMaxHp) * 100));
    const enemyPct = Math.min(100, Math.max(0, (enemyHp / enemy.hp) * 100));

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 font-mono">
            <div className="coalition-panel border-demon/50 w-full max-w-2xl h-[650px] flex flex-col shadow-[0_0_100px_rgba(239,68,68,0.2)] overflow-hidden relative">

                {/* IDLE BACKGROUND TEXT */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                    <span className="text-[200px] font-black uppercase whitespace-nowrap">COMBAT PROTOCOL</span>
                </div>

                {/* HEADERS / HP BARS */}
                <div className="p-6 grid grid-cols-2 gap-12 border-b border-border-soft bg-black/20 z-10">
                    {/* PLAYER */}
                    <div className="relative">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-white font-bold text-lg tracking-widest">OPERATOR</span>
                            <span className="text-ghost font-bold text-xs">{playerHp} / {playerMaxHp} HP</span>
                        </div>
                        <div className="h-2 bg-zinc-900/50 rounded-full overflow-hidden border border-white/5">
                            <div
                                ref={(el) => {
                                    if (el) el.style.setProperty('width', `${playerPct}%`);
                                }}
                                className="h-full bg-ghost shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
                            />
                        </div>
                    </div>

                    {/* ENEMY */}
                    <div className="text-right relative">
                        <div className="flex justify-between items-end mb-2 flex-row-reverse">
                            <span className="text-demon font-black text-lg uppercase tracking-widest">{enemy.name}</span>
                            <span className="text-demon/60 font-bold text-xs">{enemyHp} / {enemy.hp} HP</span>
                        </div>
                        <div className="h-2 bg-zinc-900/50 rounded-full overflow-hidden border border-demon/20 transform rotate-180">
                            <div
                                ref={(el) => {
                                    if (el) el.style.setProperty('width', `${enemyPct}%`);
                                }}
                                className="h-full bg-demon shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-300 ease-out"
                            />
                        </div>
                    </div>
                </div>

                {/* BATTLE ARENA / VISUALS */}
                <div className="flex-1 relative bg-grid-pattern bg-[length:40px_40px] flex items-center justify-between px-20 z-10">

                    {/* Player Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 bg-zinc-900 border border-ghost/50 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.1)] flex items-center justify-center relative overflow-hidden">
                            <span className="text-4xl">👤</span>
                            <div className="absolute inset-0 bg-ghost/10 animate-pulse"></div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-ghost tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                            YOU
                        </div>
                    </div>

                    <div className="text-2xl font-black text-white/10 mx-auto absolute inset-0 flex items-center justify-center pointer-events-none tracking-[1em]">
                        VERSUS
                    </div>

                    {/* Enemy Avatar */}
                    <div className="relative group">
                        <div className="w-24 h-24 bg-zinc-900 border border-demon/50 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center relative overflow-hidden animate-shake">
                            <span className="text-4xl">💀</span>
                            <div className="absolute inset-0 bg-demon/10 animate-pulse"></div>
                        </div>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-demon tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                            TARGET
                        </div>
                    </div>
                </div>

                {/* LOGS */}
                <div
                    ref={scrollRef}
                    className="h-48 overflow-y-auto bg-black/40 border-t border-border-soft p-4 font-mono text-xs space-y-1.5 scrollbar-hide z-10"
                >
                    {logs.map((log) => (
                        <div key={log.id} className={clsx(
                            "py-1 px-2 rounded border-l-2",
                            log.type === 'player' && "border-ghost bg-ghost/5 text-zinc-300",
                            log.type === 'enemy' && "border-demon bg-demon/5 text-zinc-300",
                            log.type === 'info' && "border-transparent text-zinc-500 italic",
                            log.type === 'win' && "border-green-500 bg-green-500/10 text-green-400 font-bold text-sm py-2",
                            log.type === 'loss' && "border-red-600 bg-red-600/10 text-red-500 font-bold text-sm py-2"
                        )}>
                            <span className={clsx("uppercase text-[10px] font-bold mr-2 opacity-50",
                                log.type === 'player' && "text-ghost",
                                log.type === 'enemy' && "text-demon"
                            )}>
                                {log.type === 'player' ? '>>' : log.type === 'enemy' ? '<<' : '--'}
                            </span>
                            {log.text}
                        </div>
                    ))}

                    {isOver && (
                        <div className="sticky bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-black to-transparent pt-8">
                            <button
                                onClick={() => endCombat()}
                                className={clsx(
                                    "px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg flex items-center gap-2",
                                    result === 'win' ? "bg-white text-black hover:bg-zinc-200 shadow-white/20" : "bg-red-600 text-black hover:bg-red-500 shadow-red-500/20"
                                )}
                            >
                                {result === 'win' ? 'VICTORY SECURED // EXIT' : 'CRITICAL FAILURE // RESPAWN'}
                            </button>
                        </div>
                    )}
                </div>

                {/* ACTIONS */}
                {!isOver && (
                    <div className="p-4 bg-zinc-950/80 backdrop-blur border-t border-border-soft grid grid-cols-4 gap-4 z-20">
                        <button
                            onClick={() => combatAction('attack')}
                            className="group relative bg-demon/10 border border-demon/30 text-demon hover:bg-demon hover:text-black py-4 rounded-xl font-bold transition-all overflow-hidden btn-snap"
                        >
                            <span className="relative z-10 text-sm tracking-widest">ATTACK</span>
                            <div className="absolute inset-0 bg-demon/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                        <button
                            onClick={() => combatAction('defend')}
                            className="group relative bg-ghost/10 border border-ghost/30 text-ghost hover:bg-ghost hover:text-black py-4 rounded-xl font-bold transition-all overflow-hidden btn-snap"
                        >
                            <span className="relative z-10 text-sm tracking-widest">DEFEND</span>
                            <div className="absolute inset-0 bg-ghost/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        </button>
                        <button
                            disabled
                            className="bg-black border border-zinc-800 text-zinc-600 cursor-not-allowed py-4 rounded-xl font-bold opacity-50 flex flex-col items-center justify-center gap-1"
                        >
                            <span className="text-sm tracking-widest">ITEM</span>
                            <span className="text-[9px] uppercase">Empty</span>
                        </button>
                        <button
                            onClick={() => combatAction('flee')}
                            className="bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-white hover:text-black py-4 rounded-xl font-bold transition-all text-sm tracking-widest"
                        >
                            FLEE
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
