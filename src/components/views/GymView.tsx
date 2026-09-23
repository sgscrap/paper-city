import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { ITEMS } from '@/data/items';
import { InventorySystem } from '@/lib/InventorySystem';

interface GymViewProps {
    onBack: () => void;
}

export const GymView = ({ onBack }: GymViewProps) => {
    const stats = useGameStore(state => state.player.stats);
    const energy = useGameStore(state => state.player.energy);
    const dispatchAction = useGameStore(state => state.dispatchAction);
    const buyItem = useGameStore(state => state.buyItem);
    const addNotification = useUIStore(state => state.addNotification);

    // Quest & Inventory Checks
    const inventory = useGameStore(state => state.inventory);
    const serverQuests = useGameStore(state => state.quests);
    const startQuest = useGameStore(state => state.startQuest);
    const checkQuestObjectives = useGameStore(state => state.checkQuestObjectives);

    const hasMembership = InventorySystem.hasItem(inventory, 'gym_membership');
    const hasGear = InventorySystem.hasItem(inventory, 'gym_shirt') &&
        InventorySystem.hasItem(inventory, 'gym_shorts') &&
        InventorySystem.hasItem(inventory, 'gym_shoes');

    // Trigger check on mount in case we just bought items but didn't trigger logic (redundancy)
    useEffect(() => {
        checkQuestObjectives('buy_item', undefined);
    }, [checkQuestObjectives]);

    const [workingOut, setWorkingOut] = useState(false);

    const workout = (type: 'power' | 'will') => {
        // --- GATE: MEMBERSHIP & GEAR ---
        if (!hasMembership || !hasGear) {
            // Trigger Quest if not started
            if (!serverQuests['gym_initiation']) {
                startQuest('gym_initiation');
                addNotification('Talk to the manager! You need gear.');
            } else if (serverQuests['gym_initiation'].status !== 'completed') {
                addNotification('Manager: "Get your gear and membership first, kid."');
            }
            return;
        }

        // const cost = 0; // Free with membership logic default
        // Let's make it free per session if you have membership, maybe? Or reduced.
        // User didn't specify, but "Membership" usually implies free entry.

        // if (cash < cost) ...

        setWorkingOut(true);

        // Visual delay for "working out"
        setTimeout(() => {
            if (type === 'power') {
                dispatchAction('TRAIN_POWER');
            } else {
                dispatchAction('TRAIN_CARDIO');
            }
            setWorkingOut(false);
        }, 1500);
    };

    const proteinItems = Object.values(ITEMS).filter(i => i.type === 'gym');

    const powerBarRef = useRef<HTMLDivElement>(null);
    const willBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (powerBarRef.current) {
            powerBarRef.current.style.width = `${Math.min(100, stats.power)}%`;
        }
        if (willBarRef.current) {
            willBarRef.current.style.width = `${Math.min(100, energy)}%`;
        }
    }, [stats.power, energy]);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white p-6 overflow-y-auto">
            <header className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">💪</div>
                    <div>
                        <h1 className="text-3xl font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500">SG FITNESS</h1>
                        <p className="text-zinc-500 text-xs tracking-widest uppercase">PAIN IS WEAKNESS LEAVING THE BODY</p>
                    </div>
                </div>
                <button onClick={onBack} className="border border-zinc-700 px-4 py-2 rounded hover:bg-zinc-800 text-xs">
                    LEAVE GYM
                </button>
            </header>

            {/* Quest Notification / Status */}
            {(!hasMembership || !hasGear) && (
                <div className="mb-6 bg-red-900/40 border border-red-500/50 p-4 rounded-lg flex items-start gap-4">
                    <div className="text-2xl">🛑</div>
                    <div>
                        <h3 className="font-bold text-red-100">ACCESS DENIED</h3>
                        <p className="text-sm text-red-200">
                            The massive bouncer blocks your path. <br />
                            <span className="italic">&quot;We have standards here. Go to the Mall. Get a **Membership**. Buy a **Shirt, Shorts, and Shoes**. Then you can lift.&quot;</span>
                        </p>
                        <div className="mt-2 text-xs text-red-400 uppercase tracking-widest">Quest: Iron Pumping Initiation</div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Workout Section */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🏋️ WORKOUT <span className="text-xs font-normal text-zinc-500">(Requires Membership)</span></h2>

                    <div className="space-y-4">
                        <button
                            onClick={() => workout('power')}
                            disabled={workingOut}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded-lg flex items-center justify-between group transition-all"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🛑</span>
                            <div className="text-left flex-1 ml-4">
                                <div className="font-bold">HEAVY LIFTING</div>
                                <div className="text-xs text-zinc-500">+Power, -Will (Fatigue)</div>
                            </div>
                            <div className="text-orange-500 font-bold">START</div>
                        </button>

                        <button
                            onClick={() => workout('will')}
                            disabled={workingOut}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 p-4 rounded-lg flex items-center justify-between group transition-all"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">🏃</span>
                            <div className="text-left flex-1 ml-4">
                                <div className="font-bold">CARDIO</div>
                                <div className="text-xs text-zinc-500">+Will, -Power (Fatigue)</div>
                            </div>
                            <div className="text-blue-500 font-bold">START</div>
                        </button>
                    </div>

                    {workingOut && (
                        <div className="mt-4 bg-black rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-orange-500 animate-[progress_1.5s_ease-in-out_infinite] w-full"></div>
                        </div>
                    )}
                </div>

                {/* Status Section */}
                <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
                    <h2 className="text-xl font-bold mb-4">YOUR STATS</h2>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-orange-400">POWER</span>
                                <span className="text-sm">{stats.power}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    ref={powerBarRef}
                                    className="h-full bg-orange-500"
                                ></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-bold text-blue-400">ENERGY</span>
                                <span className="text-sm">{energy}</span>
                            </div>
                            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    ref={willBarRef}
                                    className="h-full bg-blue-500"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Protein Bar Shop */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">🥤 PROTEIN BAR <span className="text-xs font-normal text-zinc-500">(Open to Public)</span></h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {proteinItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => buyItem(item.id)}
                            className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex justify-between items-center hover:bg-zinc-800 transition-colors text-left"
                        >
                            <div>
                                <div className="font-bold">{item.name}</div>
                                <div className="text-xs text-zinc-500">{item.description}</div>
                            </div>
                            <div className="text-green-500 font-bold ml-4">${item.cost}</div>
                        </button>
                    ))}
                    {proteinItems.length === 0 && <div className="text-zinc-500 italic">Sold out.</div>}
                </div>
            </div>
        </div>
    );
};
