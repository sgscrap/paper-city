import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { ITEMS } from '@/data/items';

interface SafehouseViewProps {
    onBack: () => void;
    isHome?: boolean;
}

export const SafehouseView = ({ onBack, isHome = false }: SafehouseViewProps) => {
    const stats = useGameStore(state => state.player.stats);
    const energy = useGameStore(state => state.player.energy);
    const housing = useGameStore(state => state.player.housing);
    const inventory = useGameStore(state => state.inventory);
    const outfit = useGameStore(state => state.outfit);

    const newDay = useGameStore(state => state.newDay);
    const depositStash = useGameStore(state => state.depositStash);
    const withdrawStash = useGameStore(state => state.withdrawStash);
    const setOutfit = useGameStore(state => state.setOutfit);
    const addNotification = useUIStore(state => state.addNotification);

    const [stashAmount, setStashAmount] = useState<number>(0);

    const handleSleep = () => {
        newDay();
        addNotification("You slept like a rock. Energy restored to 100 and a new day begins.");
    };

    const handleSave = () => {
        useGameStore.persist.rehydrate();
        addNotification("Game Saved to Local Storage.");
    };

    // Filter for clothing/luxury items in inventory
    const ownedClothing = Object.keys(inventory.items)
        .filter(itemId => ITEMS[itemId]?.type === 'luxury' && inventory.items[itemId] > 0);

    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white p-8 overflow-y-auto">
            <header className="mb-8 border-b border-zinc-700 pb-4 flex items-center justify-between">
                <div>                        <h1 className="text-3xl font-bold text-zinc-400">{isHome ? 'HOME' : 'SAFEHOUSE'}</h1>
                        <p className="text-zinc-600">{isHome ? 'Your place in The Block. Rest is always available here.' : 'Home sweet... hole in the wall.'}</p>
                </div>
                <button
                    onClick={onBack}
                    className="px-4 py-2 border border-zinc-600 rounded hover:bg-zinc-800 text-sm font-mono"
                >
                    {isHome ? 'EXIT_TO_BLOCK' : 'EXIT_TO_SLUMS'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full">
                {/* Left Column: Stats & Sleep */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4 text-zinc-300">STATUS</h2>
                        <div className="space-y-3 text-zinc-400 font-mono">
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span>ENERGY:</span>
                                <span className="text-white">{energy} / 100</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-800 pb-2">
                                <span>CASH_ON_HAND:</span>
                                <span className="text-green-400">${stats.worth}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>CURRENT_LOOK:</span>
                                <span className="text-neon-blue">{ITEMS[outfit]?.name || 'STREET CLOTHES'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleSleep}
                            className="bg-blue-900/20 hover:bg-blue-900/40 border border-blue-800/50 p-6 rounded-lg text-left transition-all"
                        >
                            <h3 className="text-lg font-bold text-blue-400">SLEEP</h3>
                            <p className="text-xs text-zinc-500 mt-1">Restore energy / Next day</p>
                        </button>

                        <button
                            onClick={handleSave}
                            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 p-6 rounded-lg text-left transition-all"
                        >
                            <h3 className="text-lg font-bold text-zinc-300">SAVE</h3>
                            <p className="text-xs text-zinc-500 mt-1">System backup</p>
                        </button>
                    </div>

                    {/* Wardrobe Section */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                        <h2 className="text-xl font-bold mb-4 text-zinc-300">WARDROBE</h2>
                        <div className="space-y-2">
                            <div
                                onClick={() => setOutfit('street_clothes')}
                                className={`p-3 border cursor-pointer transition-all ${outfit === 'street_clothes' ? 'border-neon-blue bg-blue-900/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                            >
                                <div className="text-sm font-bold">Street Clothes</div>
                                <div className="text-[10px] text-zinc-500 italic text-right">Standard Issue</div>
                            </div>

                            {ownedClothing.length === 0 && (
                                <div className="text-xs text-zinc-600 italic p-4 text-center">
                                    No designer clothes found. Check the Mall.
                                </div>
                            )}

                            {ownedClothing.map(itemId => (
                                <div
                                    key={itemId}
                                    onClick={() => setOutfit(itemId)}
                                    className={`p-3 border cursor-pointer transition-all ${outfit === itemId ? 'border-neon-blue bg-blue-900/10' : 'border-zinc-800 hover:border-zinc-700'}`}
                                >
                                    <div className="text-sm font-bold">{ITEMS[itemId].name}</div>
                                    <div className="text-[10px] text-zinc-500 italic text-right">Luxury Wear</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: The Mattress (Stash) */}
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-zinc-300">THE MATTRESS</h2>
                        <p className="text-xs text-zinc-500 mt-1 italic">Hide your stash where nobody looks (hopefully).</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-zinc-950/50 border border-zinc-800 rounded-lg mb-6">
                        <div className="text-zinc-500 text-xs mb-2 uppercase font-mono tracking-widest">Stashed Funds</div>
                        <div className="text-5xl font-bold text-green-500 font-mono">
                            ${housing.stash || 0}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs text-zinc-500 font-mono">AMOUNT_TO_MOVE:</label>
                            <input
                                type="number"
                                value={stashAmount}
                                onChange={(e) => setStashAmount(parseInt(e.target.value) || 0)}
                                className="bg-zinc-800 border border-zinc-700 p-3 rounded text-white font-mono focus:outline-none focus:border-green-500"
                                placeholder="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => depositStash(stashAmount)}
                                className="bg-zinc-100 hover:bg-white text-black font-bold p-3 rounded transition-all"
                            >
                                DEPOSIT
                            </button>
                            <button
                                onClick={() => withdrawStash(stashAmount)}
                                className="border border-zinc-700 hover:bg-zinc-800 font-bold p-3 rounded transition-all"
                            >
                                WITHDRAW
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={() => setStashAmount(100)} className="flex-1 text-[10px] bg-zinc-800 p-1 rounded hover:bg-zinc-700">$100</button>
                            <button onClick={() => setStashAmount(1000)} className="flex-1 text-[10px] bg-zinc-800 p-1 rounded hover:bg-zinc-700">$1,000</button>
                            <button onClick={() => setStashAmount(stats.worth)} className="flex-1 text-[10px] bg-zinc-800 p-1 rounded hover:bg-zinc-700">MAX</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
