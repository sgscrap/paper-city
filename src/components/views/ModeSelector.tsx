'use client';

import React from 'react';
import { useGameStore } from '@/stores/gameStore';

export const ModeSelector = () => {
    const setGameMode = useGameStore(state => state.setGameMode);

    const handleSelect = (mode: 'fun' | 'real') => {
        if (mode === 'real') {
            alert('CRYPTO_CONNECT: Blockchain integration is currently in development. Please select "PLAY_FOR_FUN" to enter the simulation.');
            return;
        }
        setGameMode(mode);
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center p-4 font-mono overflow-hidden">
            {/* Background Grid and Effects */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-neon-blue/5 via-transparent to-transparent"></div>

            <div className="relative w-full max-w-4xl text-center">
                <div className="mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <h1 className="text-6xl font-black text-white italic tracking-tighter mb-4">
                        PROTOCOL_ENTRY
                    </h1>
                    <p className="text-zinc-500 uppercase tracking-[0.5em] text-sm">
                        Select Simulation Parameters
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                    {/* Play for Fun */}
                    <button
                        onClick={() => handleSelect('fun')}
                        className="group relative bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl transition-all hover:bg-zinc-900 hover:border-neon-blue hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] text-left flex flex-col items-start gap-4 animate-in fade-in slide-in-from-left-8 duration-700"
                    >
                        <div className="w-12 h-12 rounded-lg bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="text-2xl text-neon-blue italic font-black">F</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight group-hover:text-neon-blue transition-colors">PLAY_FOR_FUN</h2>
                            <p className="text-sm text-zinc-500 leading-relaxed font-mono">
                                Standard simulation. All assets are local to the Paper City OS. No external wallet connection required.
                            </p>
                        </div>
                        <div className="mt-4 text-[10px] text-zinc-600 font-bold uppercase tracking-widest bg-zinc-950 px-3 py-1 rounded border border-zinc-800">
                            Status: ACTIVE_STABLE
                        </div>
                    </button>

                    {/* Play for Real */}
                    <button
                        onClick={() => handleSelect('real')}
                        className="group relative bg-zinc-900/20 border border-zinc-900 p-8 rounded-2xl transition-all cursor-not-allowed text-left flex flex-col items-start gap-4 grayscale opacity-60 animate-in fade-in slide-in-from-right-8 duration-700 delay-150"
                    >
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                            <span className="text-2xl text-zinc-500 italic font-black">R</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-400 mb-2 tracking-tight">PLAY_FOR_REAL</h2>
                            <p className="text-sm text-zinc-600 leading-relaxed font-mono">
                                High-stakes blockchain integration. Persistent on-chain assets, cross-simulation trading, and verified identity.
                            </p>
                        </div>
                        <div className="mt-4 text-[10px] text-neon-gold font-bold uppercase tracking-widest bg-zinc-950 px-3 py-1 rounded border border-neon-gold/20 animate-pulse">
                            Status: COMING_SOON
                        </div>

                        {/* "Restricted" Overlay for visual hint */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-black/80 backdrop-blur-sm border border-neon-gold/30 px-6 py-2 rounded text-neon-gold font-bold text-xs uppercase tracking-[0.2em] shadow-2xl">
                                Access_Denied // Future_Protocol
                            </div>
                        </div>
                    </button>
                </div>

                <div className="mt-16 text-[10px] text-zinc-700 font-mono tracking-widest animate-pulse">
                    COALITION_OS // ENCRYPTED_HANDSHAKE_PENDING...
                </div>
            </div>
        </div>
    );
};
