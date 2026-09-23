'use client';

import React, { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useGameStore, GameStore } from '@/stores/gameStore';
import { NPCS } from '@/data/npcs';
import clsx from 'clsx';

// Local paper-fiber texture for the dialogue card: survives offline play.
const PAPER_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.38 0 0 0 0 0.34 0 0 0 0.35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`;

export const NpcDialogue = () => {
    const activeDialogue = useUIStore(state => state.activeDialogue);
    const closeDialogue = useUIStore(state => state.closeDialogue);
    const startQuest = useGameStore((state: GameStore) => state.startQuest);
    const quests = useGameStore((state: GameStore) => state.quests);
    const applyJob = useGameStore((state: GameStore) => state.applyJob);
    const interactNPC = useGameStore((state: GameStore) => state.interactNPC);
    const activateNPCService = useGameStore((state: GameStore) => state.useNPCService);
    const npcState = useGameStore((state: GameStore) => state.npcs);
    const worldDay = useGameStore((state: GameStore) => state.world.day);
    const contentFlags = useGameStore((state: GameStore) => state.contentFlags);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    const sequence = Array.isArray(activeDialogue?.text)
        ? activeDialogue?.text || []
        : [activeDialogue?.text || ''];

    const currentLine = sequence[currentIndex] || '';
    const isLastLine = currentIndex === sequence.length - 1;
    const dialogueNpc = activeDialogue ? NPCS[activeDialogue.npcId] : undefined;
    const hasManualAction = Boolean(
        dialogueNpc && ((dialogueNpc.questId && !quests[dialogueNpc.questId]) || dialogueNpc.jobId)
    );

    useEffect(() => {
        if (!activeDialogue) {
            setDisplayedText('');
            setIsFinished(false);
            setCurrentIndex(0);
            return;
        }

        let i = 0;
        setDisplayedText('');
        setIsFinished(false);

        let closeTimer: number | undefined;
        const timer = setInterval(() => {
            setDisplayedText(currentLine.slice(0, i + 1));
            i++;
            if (i >= currentLine.length) {
                clearInterval(timer);
                setIsFinished(true);
                if (currentIndex === sequence.length - 1 && !hasManualAction) {
                    closeTimer = window.setTimeout(closeDialogue, 800);
                }
            }
        }, 30);

        return () => {
            clearInterval(timer);
            if (closeTimer) window.clearTimeout(closeTimer);
        };
    }, [activeDialogue, currentIndex, currentLine, closeDialogue, hasManualAction, sequence.length]);

    if (!activeDialogue) return null;

    const npc = dialogueNpc;
    if (!npc) return null;

    // Hook Logic - Only show on last line
    const showQuestButton = isLastLine && npc.questId && !quests[npc.questId];
    const showJobButton = isLastLine && npc.jobId;
    const relationship = npcState[npc.id]?.relationship ?? 0;
    const specialServiceAvailable = Boolean(npc.specialServiceFlags?.some((flag) => contentFlags[flag]));
    const serviceUsedToday = Boolean(npc.specialService && npcState[npc.id]?.serviceUses?.[npc.specialService] === worldDay);

    const handleProceed = () => {
        if (!isFinished) {
            setDisplayedText(currentLine);
            setIsFinished(true);
        } else if (currentIndex < sequence.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            closeDialogue();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500">
            {/* PAPER CARD CONTAINER */}
            <div className="relative max-w-lg w-full">

                {/* DECORATIVE STAMP / LABEL */}
                <div className="absolute -top-6 -left-2 z-20 bg-white text-black font-black px-4 py-2 transform -rotate-2 shadow-lg border-2 border-black/10 flex flex-col">
                    <span className="text-[10px] tracking-[0.3em] opacity-40 leading-none mb-1">IDENT_VERIFIED</span>
                    <span className="text-xl tracking-tighter uppercase font-sans italic">{npc.name}</span>
                </div>

                {/* THE CARD */}
                <div className="coalition-panel bg-white/95 text-zinc-900 p-10 pt-16 shadow-[20px_20px_0_rgba(0,0,0,0.4)] border-none relative overflow-hidden">

                    {/* PAPER TEXTURE OVERLAY */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none mix-blend-multiply" style={{ backgroundImage: PAPER_TEXTURE }}></div>

                    {/* WATERMARK */}
                    <div className="absolute top-4 right-4 opacity-5 pointer-events-none select-none">
                        <span className="text-4xl font-black italic tracking-tighter">COALITION_APPROVED</span>
                    </div>

                    {/* CONTENT */}
                    <div className="relative z-10 min-h-[120px]">
                        <p className="text-xl font-medium font-serif leading-relaxed italic text-zinc-800">
                            &quot;{displayedText}&quot;
                            {!isFinished && <span className="inline-block w-2 h-5 bg-zinc-900 ml-1 animate-pulse align-middle"></span>}
                        </p>
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-10 flex flex-wrap justify-end gap-3 relative z-10">
                        {isFinished && (
                            <>
                                {showQuestButton && (
                                    <button
                                        onClick={() => {
                                            startQuest(npc.questId!);
                                            closeDialogue();
                                        }}
                                        className="px-6 py-3 bg-ghost text-black font-black text-xs tracking-widest uppercase hover:bg-zinc-800 hover:text-white transition-all btn-snap"
                                    >
                                        [ ACCEPT INTEL ]
                                    </button>
                                )}
                                {npc.specialService && specialServiceAvailable && (
                                    <button
                                        onClick={() => activateNPCService(npc.id)}
                                        disabled={serviceUsedToday}
                                        className={clsx(
                                            "px-4 py-3 border font-black text-[10px] tracking-widest uppercase transition-all btn-snap",
                                            serviceUsedToday
                                                ? "border-zinc-300/20 text-zinc-400 cursor-not-allowed"
                                                : "border-coalition-gold/40 text-coalition-gold hover:bg-coalition-gold/10"
                                        )}
                                    >
                                        {serviceUsedToday ? '[ SERVICE USED TODAY ]' : `[ ${npc.specialService.toUpperCase()} ]`}
                                    </button>
                                )}
                                {relationship < 70 && (
                                    <button
                                        onClick={() => interactNPC(npc.id, 'gift')}
                                        className="px-4 py-3 border border-emerald-400/30 text-emerald-300 font-black text-[10px] tracking-widest uppercase hover:bg-emerald-400/10 transition-all btn-snap"
                                    >
                                        [ OFFER FAVOR ]
                                    </button>
                                )}
                                {relationship > -70 && (
                                    <button
                                        onClick={() => interactNPC(npc.id, 'insult')}
                                        className="px-4 py-3 border border-red-400/30 text-red-300 font-black text-[10px] tracking-widest uppercase hover:bg-red-400/10 transition-all btn-snap"
                                    >
                                        [ BURN BRIDGE ]
                                    </button>
                                )}
                                {showJobButton && (
                                    <button
                                        onClick={() => {
                                            applyJob(npc.jobId!);
                                            closeDialogue();
                                        }}
                                        className="px-6 py-3 bg-coalition-gold text-black font-black text-xs tracking-widest uppercase hover:bg-zinc-800 hover:text-white transition-all btn-snap"
                                    >
                                        [ SIGN CONTRACT ]
                                    </button>
                                )}
                            </>
                        )}

                        <button
                            onClick={handleProceed}
                            className={clsx(
                                "group relative px-8 py-3 font-black text-sm tracking-widest uppercase transition-all overflow-hidden btn-snap",
                                isFinished
                                    ? "bg-black text-white hover:bg-zinc-800"
                                    : "bg-zinc-200 text-zinc-500 hover:text-black"
                            )}
                        >
                            <span className="relative z-10">
                                {!isFinished ? 'SKIP_INTEL' : isLastLine ? 'PROCEED' : 'NEXT_INTEL'}
                            </span>
                            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </div>

                {/* DECORATIVE SHADOW LAYER */}
                <div className="absolute -bottom-2 -right-2 w-full h-full bg-black/20 -z-10 blur-sm"></div>
            </div>
        </div>
    );
};
