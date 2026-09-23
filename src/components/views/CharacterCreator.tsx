import React, { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { TRAITS } from '@/data/traits';
import clsx from 'clsx';

export const CharacterCreator = () => {
    const initializeCharacter = useGameStore(state => state.initializeCharacter);

    const [name, setName] = useState('New Passenger');
    const [stats, setStats] = useState({
        power: 10,
        intelligence: 10,
        charisma: 10,
        luck: 10,
        will: 100,
        health: 100,
        maxHealth: 100,
        level: 1,
        xp: 0,
        xpToNext: 100,
        skillPoints: 0,
        karma: 0,
        worth: 100
    });
    const [selectedTrait, setSelectedTrait] = useState<string>('photographic_memory');
    const [rolling, setRolling] = useState(false);

    const handleRoll = () => {
        setRolling(true);
        setTimeout(() => {
            const newStats = {
                ...stats,
                power: Math.floor(Math.random() * 15) + 5,
                intelligence: Math.floor(Math.random() * 15) + 5,
                charisma: Math.floor(Math.random() * 15) + 5,
                luck: Math.floor(Math.random() * 20) + 1
            };
            setStats(newStats);
            setRolling(false);
        }, 600);
    };

    const handleComplete = () => {
        // Apply trait bonuses if any
        const finalStats = { ...stats };
        if (selectedTrait === 'too_cool_for_school') finalStats.charisma += 10;
        if (selectedTrait === 'beef_cake') finalStats.power += 15;
        if (selectedTrait === 'warped_mind') {
            finalStats.intelligence += 20;
            finalStats.luck -= 5;
        }
        if (selectedTrait === 'interpretive_dancer') finalStats.luck += 30;

        let initialWorth = 100;
        if (selectedTrait === 'wall_street_wizard') initialWorth = 600;

        initializeCharacter(name, { ...finalStats, worth: initialWorth }, [selectedTrait]);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 font-mono">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>

            <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col md:flex-row">
                {/* Left Side: Photo & Identity */}
                <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 border-r border-zinc-800 flex flex-col items-center">
                    <div className="w-48 h-64 bg-black border-2 border-zinc-800 rounded-lg relative overflow-hidden group mb-6">
                        {/* Stick Figure Silhouette / Avatar */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
                            <svg viewBox="0 0 100 100" className="w-32 h-32 text-neon-blue animate-pulse">
                                <circle cx="50" cy="30" r="15" fill="none" stroke="currentColor" strokeWidth="2" />
                                <line x1="50" y1="45" x2="50" y2="75" stroke="currentColor" strokeWidth="2" />
                                <line x1="50" y1="55" x2="30" y2="65" stroke="currentColor" strokeWidth="2" />
                                <line x1="50" y1="55" x2="70" y2="65" stroke="currentColor" strokeWidth="2" />
                                <line x1="50" y1="75" x2="35" y2="95" stroke="currentColor" strokeWidth="2" />
                                <line x1="50" y1="75" x2="65" y2="95" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-2 left-0 right-0 text-[8px] text-center text-zinc-500 tracking-[0.5em] uppercase">Visual_ID: Pending</div>

                        {/* Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] animate-scan"></div>
                    </div>

                    <div className="w-full space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="char_name" className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Registration Name</label>
                            <input
                                id="char_name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-950 border border-zinc-700 p-3 rounded text-neon-blue focus:outline-none focus:border-neon-blue transition-all font-bold"
                            />
                        </div>
                        <div className="p-4 bg-zinc-800/30 rounded border border-zinc-800">
                            <div className="text-[10px] text-zinc-500 mb-1">DESTINATION:</div>
                            <div className="text-sm font-bold text-white tracking-tight">PAPER THIN CITY</div>
                            <div className="text-[10px] text-zinc-500 mt-2">TRANSPORT:</div>
                            <div className="text-sm font-bold text-white tracking-tight">SS LINEAGE_OS</div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Stats & Traits */}
                <div className="flex-1 p-8 flex flex-col bg-zinc-950/80">
                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter leading-none mb-1">CITIZEN_REGISTRATION</h2>
                        <div className="text-[10px] text-neon-blue tracking-[0.3em] font-bold uppercase opacity-80">Federal Coalition immigration Protocol</div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Stats Panel */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                <h3 className="text-sm font-bold text-zinc-400">BIOMETRIC_DATA</h3>
                                <button
                                    onClick={handleRoll}
                                    disabled={rolling}
                                    className={clsx(
                                        "px-3 py-1 rounded-full text-[10px] bg-neon-blue/10 border border-neon-blue/20 text-neon-blue hover:bg-neon-blue hover:text-black transition-all font-black",
                                        rolling && "animate-bounce opacity-50"
                                    )}
                                >
                                    {rolling ? 'ROLLING...' : 'RE_CALIBRATE'}
                                </button>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: 'POWER', val: stats.power, color: 'text-red-500' },
                                    { label: 'INTELLIGENCE', val: stats.intelligence, color: 'text-neon-blue' },
                                    { label: 'CHARISMA', val: stats.charisma, color: 'text-yellow-500' },
                                    { label: 'LUCK', val: stats.luck, color: 'text-green-500' }
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 font-bold tracking-widest">{s.label}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="w-32 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-zinc-900 rounded-full overflow-hidden">
                                                    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                                                        <rect
                                                            width={(s.val / 20) * 100}
                                                            height="100"
                                                            className={clsx("transition-all duration-500", s.color.replace('text-', 'fill-'))}
                                                        />
                                                    </svg>
                                                </div>
                                            </div>
                                            <span className={clsx("font-bold text-lg min-w-[2ch] text-right", s.color)}>{s.val}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Special Abilities Area */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-zinc-400 border-b border-zinc-800 pb-2">SPECIAL_ABILITY</h3>
                            <div className="space-y-1 h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                                {Object.values(TRAITS).map(trait => (
                                    <div
                                        key={trait.id}
                                        onClick={() => setSelectedTrait(trait.id)}
                                        className={clsx(
                                            "p-3 rounded border cursor-pointer transition-all",
                                            selectedTrait === trait.id
                                                ? "bg-neon-blue/10 border-neon-blue"
                                                : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={clsx(
                                                "w-4 h-4 border flex items-center justify-center rounded-sm",
                                                selectedTrait === trait.id ? "border-neon-blue bg-neon-blue" : "border-zinc-700"
                                            )}>
                                                {selectedTrait === trait.id && <div className="w-1.5 h-1.5 bg-black" />}
                                            </div>
                                            <div>
                                                <div className={clsx("text-[10px] font-black tracking-widest", selectedTrait === trait.id ? "text-neon-blue" : "text-zinc-500")}>
                                                    {trait.name}
                                                </div>
                                                <div className="text-[9px] text-zinc-600 italic leading-tight mt-0.5">
                                                    {trait.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-zinc-800 flex items-center justify-between">
                        <div className="text-xs text-zinc-600 italic">
                            By clicking GO you agree to the <span className="text-zinc-400">Coalition Labor Act</span>.
                        </div>
                        <button
                            onClick={handleComplete}
                            className="bg-white text-black hover:bg-neon-blue hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] font-black px-12 py-4 rounded-xl transition-all active:scale-95 group flex items-center gap-3"
                        >
                            INITIALIZE_SESSION
                            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
