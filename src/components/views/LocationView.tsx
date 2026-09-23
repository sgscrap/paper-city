'use client';

import { useGameStore } from '@/stores/gameStore';
import { LOCATIONS } from '@/data/locations';
import { CAREERS } from '@/data/careers';
import { NPCS } from '@/data/npcs';
import { getNpcVenue, getVenueName } from '@/lib/NpcCityAI';
import { useUIStore } from '@/stores/uiStore';

export const LocationView = () => {
    const locationId = useGameStore((state) => state.world.locationId);
    const setLocation = useGameStore((state) => state.setLocation);
    const canAccess = useGameStore((state) => state.canAccess);
    const getAccessReason = useGameStore((state) => state.getAccessReason);
    const applyJob = useGameStore((state) => state.applyJob);
    const interactNPC = useGameStore((state) => state.interactNPC);
    const currentLocationId = locationId; // Alias for compatibility with existing code
    const worldTime = useGameStore((state) => state.world.time);
    const advanceTime = useGameStore((state) => state.advanceTime);
    const toast = useUIStore((state) => state.toast);

    // Fallback if location ID is invalid/legacy
    const currentLocation = LOCATIONS[currentLocationId] || LOCATIONS['the_block'];

    const handleTravel = (targetId: string) => {
        const target = LOCATIONS[targetId];
        if (!target) return;

        // Travel Cost: 15 minutes (GDD Standard)
        if (!setLocation(targetId)) return;
        advanceTime(15, 'travel', targetId);

        toast({
            title: 'Traveled',
            description: `Arrived at ${target.name}. (-15 min)`,
            variant: 'neutral'
        });
    };

    return (
        <div className="flex flex-col h-full p-6 text-zinc-100 overflow-y-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-neon-blue mb-2">
                    {currentLocation.name.toUpperCase()}
                </h2>
                <div className="mb-6 p-4 bg-zinc-800 border-l-4 border-neon-blue">
                    <p className="text-zinc-300 italic">
                        &quot;{currentLocation.description}&quot;
                    </p>
                </div>
            </div>

            {/* Actions / Interactive Layer */}
            <div className="flex-1 bg-zinc-900 border-t-2 border-zinc-700 p-4 overflow-y-auto">
                {/* CAREERS AVAILABLE */}
                <h3 className="text-neon-blue font-bold mb-2">OPPORTUNITIES</h3>
                <div className="grid grid-cols-1 gap-2 mb-6">
                    {/* Render jobs available in this location */}
                    {Object.values(CAREERS).filter(c => c.location === currentLocation.id && c.tier === 1).map(career => (
                        <div key={career.id} className="bg-zinc-800 p-2 border border-zinc-600 flex justify-between items-center hover:bg-zinc-700 transition-colors">
                            <div>
                                <div className="font-bold text-white">{career.title}</div>
                                <div className="text-xs text-zinc-400">${career.dailyPay}/day • {career.description}</div>
                            </div>
                            <button
                                onClick={() => applyJob(career.id)}
                                className="bg-green-600 text-white px-3 py-1 text-xs font-bold uppercase hover:bg-green-500"
                            >
                                Apply
                            </button>
                        </div>
                    ))}
                    {Object.values(CAREERS).filter(c => c.location === currentLocation.id && c.tier === 1).length === 0 && (
                        <div className="text-zinc-500 text-sm italic">No entry-level jobs here.</div>
                    )}
                </div>

                {/* NPCS */}
                <h3 className="text-neon-pink font-bold mb-2">PEOPLE</h3>
                <div className="grid grid-cols-1 gap-2">
                    {Object.values(NPCS).filter(chat => getNpcVenue(chat.id, worldTime) === currentLocation.id).map(npc => (
                        <div key={npc.id} className="bg-zinc-800 p-2 border border-zinc-600 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-white">{npc.name}</div>
                                {(npc.service || npc.specialService) && (
                                    <div className="text-[10px] uppercase tracking-widest text-coalition-gold">
                                        {npc.specialService || npc.service} · {getVenueName(getNpcVenue(npc.id, worldTime))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => interactNPC(npc.id, 'chat')}
                                    className="bg-zinc-600 text-white px-2 py-1 text-xs hover:bg-zinc-500"
                                >
                                    Chat
                                </button>
                                <button
                                    onClick={() => interactNPC(npc.id, 'gift')}
                                    className="bg-yellow-600 text-black px-2 py-1 text-xs hover:bg-yellow-500"
                                >
                                    Gift
                                </button>
                            </div>
                        </div>
                    ))}
                    {Object.values(NPCS).filter(c => getNpcVenue(c.id, worldTime) === currentLocation.id).length === 0 && (
                        <div className="text-zinc-500 text-sm italic">Just generic paper people passing by...</div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="mt-auto pt-8 border-t border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                    Travel Connections
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentLocation.connectedTo.map((targetId) => {
                        const target = LOCATIONS[targetId];
                        if (!target) return null;

                        const accessId = `location:${targetId}`;
                        const available = canAccess(accessId);
                        return (
                            <button
                                key={targetId}
                                onClick={() => handleTravel(targetId)}
                                title={available ? `Travel to ${target.name}` : getAccessReason(accessId) || 'Location locked'}
                                className={`flex flex-col items-center justify-center p-4 border rounded bg-zinc-900/50 transition-all ${available ? 'border-zinc-700 hover:border-neon-blue hover:bg-zinc-800' : 'border-red-400/20 text-zinc-600 opacity-70'}`}
                            >
                                <span className="font-bold text-sm mb-1">{available ? target.name : `🔒 ${target.name}`}</span>
                                <span className="text-xs text-zinc-500">{available ? '15 min' : 'Faction access required'}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
