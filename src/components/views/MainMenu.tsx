'use client';

import { useUIStore } from '@/stores/uiStore';
import { useGameStore } from '@/stores/gameStore';
import pkg from '../../../package.json';

/** Build stamp, inlined from package.json at compile time. */
const BUILD_VERSION = `v${pkg.version}`;

export function MainMenu() {
    const flags = useGameStore((state) => state.flags);
    const { uiMode, bootOpacity, startSession } = useUIStore();
    const resetGame = useGameStore((state) => state.resetGame);

    if (uiMode === 'live') return null;

    const handleNewGame = () => {
        if (flags.character_created && !confirm("Erase all current progress and start fresh?")) return;
        resetGame();
        startSession();
    };

    return (
        <div
            className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 font-sans transition-opacity duration-[280ms] ease-out ${bootOpacity === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
        >
            {/* BACKDROP */}
            <div className="absolute inset-0 bg-bg-main" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 pointer-events-none"></div>

            {/* MENU CARD */}
            <div className="relative w-full max-w-[560px] px-6 z-10">
                <div className="coalition-panel p-10 text-center animate-in fade-in zoom-in-95 duration-700">
                    <div className="text-4xl md:text-6xl font-black tracking-[0.08em] uppercase text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        PAPER CITY
                    </div>
                    <div className="mt-4 text-xs tracking-[0.28em] text-coalition-blue uppercase font-mono">
                        Phase 6.7 // Release Candidate
                    </div>

                    <div className="mt-12 space-y-4">
                        {flags.character_created && (
                            <button
                                onClick={startSession}
                                className="w-full rounded-xl bg-white text-black font-extrabold tracking-[0.12em] uppercase py-4 active:scale-[0.98] transition hover:bg-coalition-blue hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                            >
                                [ CONTINUE_SESSION ]
                            </button>
                        )}

                        <button
                            onClick={handleNewGame}
                            className="w-full rounded-xl border border-zinc-700 text-zinc-500 hover:border-demon hover:text-demon hover:bg-demon/10 font-extrabold tracking-[0.12em] uppercase py-4 active:scale-[0.98] transition"
                        >
                            [ NEW_CORE_IDENTITY ]
                        </button>
                    </div>

                    <div className="mt-8 text-[10px] tracking-[0.22em] text-zinc-600 uppercase font-mono">
                        coalitionos kernel v1.0.0-rc1
                    </div>
                    <div className="mt-2 text-[10px] tracking-[0.22em] text-coalition-blue/60 uppercase font-mono">
                        build {BUILD_VERSION}
                    </div>
                </div>
            </div>
        </div>
    );
}
