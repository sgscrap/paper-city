'use client';

import clsx from 'clsx';
import { NPCS } from '@/data/npcs';
import { useGameStore } from '@/stores/gameStore';

export const StreetEncounterOverlay = () => {
    const active = useGameStore((state) => state.streetEncounters.active);
    const resolveStreetEncounter = useGameStore((state) => state.resolveStreetEncounter);

    if (!active) return null;

    const npc = NPCS[active.npcId];
    if (!npc) return null;

    return (
        <div className="fixed inset-x-0 bottom-24 md:bottom-8 z-[55] flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md rounded-xl border border-amber-300/25 bg-black/90 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.6)] backdrop-blur animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-300">
                        STREET ENCOUNTER
                    </div>
                    <div className="text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                        {npc.name}
                    </div>
                </div>

                <p className="font-serif text-sm italic leading-relaxed text-zinc-200 mb-4">
                    &ldquo;{active.line}&rdquo;
                </p>

                <div className="flex gap-2">
                    <button
                        onClick={() => resolveStreetEncounter('accept')}
                        className={clsx(
                            'flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all',
                            'border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10'
                        )}
                    >
                        [ Take the offer ]
                    </button>
                    <button
                        onClick={() => resolveStreetEncounter('dismiss')}
                        className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 transition-all"
                    >
                        [ Walk away ]
                    </button>
                </div>
            </div>
        </div>
    );
};
