'use client';

import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import {
    getDistrictSummaries,
    districtFlavorColor,
    districtFlavorLabel
} from '@/lib/CityMap';

/**
 * City map overview — every district, its live faction flavor, who is
 * present right now, and the travel graph. All data derives from
 * CityMap.ts; this component is presentation only.
 */
export const CityMapView = ({ onBack }: { onBack?: () => void }) => {
    const worldTime = useGameStore((state) => state.world.time);
    const currentDistrict = useGameStore((state) => state.world.locationId);
    const setLocation = useGameStore((state) => state.setLocation);
    const advanceTime = useGameStore((state) => state.advanceTime);
    const setActiveTab = useUIStore((state) => state.setActiveTab);

    const districts = getDistrictSummaries(useGameStore.getState(), worldTime);

    const handleTravel = (targetId: string) => {
        if (!setLocation(targetId)) return;
        advanceTime(15, 'travel', targetId);
        setActiveTab('location');
    };

    return (
        <div className="flex flex-col h-full p-6 text-zinc-100 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-neon-blue">CITY MAP</h2>
                    <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">
                        {districts.length} districts · faction presence is live and follows NPC schedules
                    </p>
                </div>
                {onBack && (
                    <button
                        onClick={onBack}
                        className="border border-zinc-600 px-3 py-1 text-xs font-bold uppercase tracking-widest hover:bg-zinc-800"
                    >
                        Back
                    </button>
                )}
            </div>

            {/* District grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {districts.map((district) => {
                    const current = district.id === currentDistrict;
                    const reachable = current || (!district.locked && district.connections.some((c) => c.id === currentDistrict));
                    const color = districtFlavorColor[district.flavor];

                    return (
                        <div
                            key={district.id}
                            className={`relative border p-4 transition-colors ${
                                current
                                    ? 'border-neon-blue bg-zinc-800/80'
                                    : district.locked
                                        ? 'border-zinc-800 bg-zinc-900/60 opacity-60'
                                        : 'border-zinc-700 bg-zinc-900/80 hover:bg-zinc-800/60'
                            }`}
                        >
                            {/* Flavor accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />

                            <div className="flex items-start justify-between gap-2 pl-2">
                                <div>
                                    <h3 className="font-bold text-white tracking-wide">
                                        {district.name.toUpperCase()}
                                        {current && <span className="ml-2 text-[10px] text-neon-blue">YOU ARE HERE</span>}
                                    </h3>
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-widest"
                                        style={{ color }}
                                    >
                                        {districtFlavorLabel[district.flavor]}
                                    </span>
                                </div>
                                {district.locked ? (
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border border-zinc-700 px-2 py-1 whitespace-nowrap"
                                        title={district.lockReason ?? undefined}
                                    >
                                        Locked
                                    </span>
                                ) : current ? null : (
                                    <button
                                        onClick={() => handleTravel(district.id)}
                                        disabled={!reachable}
                                        className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 whitespace-nowrap ${
                                            reachable
                                                ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue hover:bg-neon-blue/40'
                                                : 'text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                        }`}
                                    >
                                        {reachable ? 'Travel (15m)' : 'No route'}
                                    </button>
                                )}
                            </div>

                            <p className="text-xs text-zinc-400 italic mt-2 pl-2">{district.description}</p>

                            {/* Who is here right now */}
                            <div className="mt-3 pl-2">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                    Present now
                                </div>
                                {district.presentNpcs.length === 0 ? (
                                    <div className="text-xs text-zinc-600 italic">Nobody you know is around.</div>
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {district.presentNpcs.map((npc) => (
                                            <span
                                                key={npc.id}
                                                className="text-[10px] px-1.5 py-0.5 border border-zinc-700 bg-zinc-800 text-zinc-300"
                                                style={{ borderLeft: `3px solid ${npc.faction ? districtFlavorColor[npc.faction] : '#71717a'}` }}
                                                title={npc.specialService ?? npc.name}
                                            >
                                                {npc.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Travel routes */}
                            <div className="mt-3 pl-2">
                                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                                    Routes
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {district.connections.map((conn) => (
                                        <span
                                            key={conn.id}
                                            className={`text-[10px] px-1.5 py-0.5 border ${
                                                conn.locked
                                                    ? 'border-zinc-800 text-zinc-600'
                                                    : 'border-zinc-600 text-zinc-300'
                                            }`}
                                        >
                                            {conn.name}
                                            {conn.locked ? ' · locked' : ''}
                                        </span>
                                    ))}
                                    {district.connections.length === 0 && (
                                        <span className="text-[10px] text-zinc-600 italic">No mapped routes.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 pl-2 text-[10px] uppercase tracking-widest text-zinc-500">
                {Object.entries(districtFlavorLabel).map(([key, label]) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 inline-block" style={{ backgroundColor: districtFlavorColor[key as keyof typeof districtFlavorColor] }} />
                        {label}
                    </span>
                ))}
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 inline-block bg-zinc-700" />
                    Faction-locked district
                </span>
            </div>
        </div>
    );
};
