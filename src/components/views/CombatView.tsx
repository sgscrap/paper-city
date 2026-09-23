import { useGameStore } from '@/stores/gameStore';
import { CombatLog } from '@/types/combat';
import { clsx } from 'clsx';
import { useEffect, useRef } from 'react';

export const CombatView = () => {
    const combatState = useGameStore((state) => state.combatState);
    const combatAction = useGameStore((state) => state.combatAction);
    const endCombat = useGameStore((state) => state.endCombat);
    const logContainerRef = useRef<HTMLDivElement>(null);
    const playerBarRef = useRef<HTMLDivElement>(null);
    const enemyBarRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [combatState?.logs]);

    // Update HP Bars directly to avoid linter warnings about inline styles
    useEffect(() => {
        if (!combatState || !combatState.enemy) return;
        const playerHpPercent = Math.max(0, (combatState.playerHp / combatState.playerMaxHp) * 100);
        const enemyMaxHp = combatState.enemy.hp || 100;
        const enemyHpPercent = Math.max(0, (combatState.enemyHp / enemyMaxHp) * 100);

        if (playerBarRef.current) {
            playerBarRef.current.style.setProperty('--hp-width', `${playerHpPercent}%`);
        }
        if (enemyBarRef.current) {
            enemyBarRef.current.style.setProperty('--hp-width', `${enemyHpPercent}%`);
        }
    }, [combatState]);

    if (!combatState || !combatState.isActive) {
        if (!combatState) return null; // No combat at all
        // If inactive but state exists (win/loss screen), we show it
    }

    const { enemy, playerHp, playerMaxHp, enemyHp, logs } = combatState;
    if (!enemy) return null;


    const enemyMaxHp = enemy.hp || 100; // Fallback

    return (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
            {/* BACKGROUND EFFECTS */}
            <div className="absolute inset-0 bg-red-900/10 animate-pulse pointer-events-none"></div>

            {/* HEADER / VS */}
            <div className="w-full max-w-md flex justify-between items-end mb-8 relative z-10">
                <div className="text-left">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">YOU</h2>
                    <div className="w-32 h-4 bg-zinc-800 border border-zinc-700 relative mt-1">
                        <div
                            ref={playerBarRef}
                            className="absolute top-0 left-0 h-full bg-neon-blue transition-all duration-300 w-[var(--hp-width)]"
                        />
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">{playerHp} / {playerMaxHp} HP</span>
                </div>

                <div className="text-4xl font-black text-red-500 italic px-4">VS</div>

                <div className="text-right">
                    <h2 className="text-2xl font-black text-red-500 uppercase tracking-tighter">{enemy.name}</h2>
                    <div className="w-32 h-4 bg-zinc-800 border border-zinc-700 relative mt-1 ml-auto">
                        <div
                            ref={enemyBarRef}
                            className="absolute top-0 right-0 h-full bg-red-600 transition-all duration-300 w-[var(--hp-width)]"
                        />
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">{enemyHp} / {enemyMaxHp} HP</span>
                </div>
            </div>

            {/* COMBAT LOG */}
            <div
                ref={logContainerRef}
                className="w-full max-w-md bg-zinc-900/80 border border-zinc-700 h-64 overflow-y-auto mb-6 p-4 font-mono text-sm space-y-2 shadow-2xl"
            >
                {logs.map((log: CombatLog) => (
                    <div key={log.id} className={clsx(
                        "transition-all duration-300 animate-slide-in",
                        log.type === 'player' ? 'text-neon-blue' :
                            log.type === 'enemy' ? 'text-red-400' :
                                log.type === 'win' ? 'text-green-400 font-bold text-lg' :
                                    log.type === 'loss' ? 'text-red-600 font-bold text-lg' :
                                        'text-zinc-400'
                    )}>
                        <span className="opacity-50 mr-2">[{log.type.toUpperCase()}]</span>
                        {log.text}
                    </div>
                ))}
                {combatState.isOver && (
                    <div className="text-center py-4 border-t border-zinc-700 mt-4">
                        <p className="text-white font-bold mb-2">COMBAT ENDED</p>
                        <button
                            onClick={() => endCombat()}
                            className="bg-white text-black font-black uppercase py-2 px-8 hover:bg-zinc-200"
                        >
                            Return to City
                        </button>
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            {!combatState.isOver && (
                <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
                    <button
                        onClick={() => combatAction('attack')}
                        className="bg-red-600 border-2 border-red-500 text-white p-6 font-black text-xl uppercase hover:bg-red-700 active:scale-95 transition-all shadow-[0_0_15px_rgba(220,38,38,0.5)]"
                    >
                        ATTACK
                    </button>
                    <div className="grid grid-rows-2 gap-2">
                        <button
                            onClick={() => combatAction('defend')}
                            className="bg-zinc-800 border border-zinc-600 text-zinc-300 font-bold uppercase hover:bg-zinc-700"
                        >
                            Defend
                        </button>
                        <button
                            onClick={() => combatAction('item')}
                            className="bg-zinc-800 border border-zinc-600 text-zinc-300 font-bold uppercase hover:bg-zinc-700"
                        >
                            Item
                        </button>
                    </div>
                    <button
                        onClick={() => combatAction('flee')}
                        className="col-span-2 bg-transparent border border-zinc-600 text-zinc-500 text-xs uppercase py-2 hover:bg-zinc-900 hover:text-white transition-colors"
                    >
                        Attempt to Flee
                    </button>
                </div>
            )}
        </div>
    );
};
