import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { ITEMS } from '@/data/items';
import { InventorySystem } from '@/lib/InventorySystem';
import clsx from 'clsx';

export const InventoryView = () => {
    const inventory = useGameStore((state) => state.inventory);
    const handleUseItem = useGameStore((state) => state.useItem);
    const handleEquip = useGameStore((state) => state.equipWeapon);
    const handleSell = useGameStore((state) => state.sellItem);
    const cash = useGameStore((state) => state.player.stats.worth);

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const ownedItems = Object.entries(inventory.items).filter(([, count]) => count > 0);
    const selectedItem = selectedItemId ? ITEMS[selectedItemId] : null;
    const selectedItemCount = selectedItemId ? inventory.items[selectedItemId] || 0 : 0;

    return (
        <div className="flex flex-col h-full bg-bg-main font-mono overflow-hidden relative">
            {/* Header */}
            <div className="p-8 border-b border-border-soft bg-black/40 relative z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-end">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter text-white font-sans italic">CARGO // HOLD</h2>
                        <div className="text-[10px] text-text-muted font-bold tracking-[0.3em] uppercase mt-1">Personal Assets & Equipment</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-1">Available Funds</div>
                        <div className="text-2xl font-black text-coalition-gold drop-shadow-gold">
                            ${cash.toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 relative scrollbar-hide">
                <div className="max-w-6xl mx-auto space-y-12 pb-24">

                    {/* Consumables Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-[10px] font-black text-ghost tracking-[0.2em] uppercase">Misceallaneous / Consumables</span>
                            <div className="h-px bg-ghost/20 flex-1"></div>
                        </div>

                        {ownedItems.length === 0 ? (
                            <div className="coalition-panel border-dashed border-border-soft p-12 text-center text-text-muted italic text-sm">
                                Empty sectors detected in personal storage.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {ownedItems.filter(([id]) => ITEMS[id]?.type === 'consumable' || ITEMS[id]?.type === 'misc').map(([itemId, count]) => {
                                    const item = ITEMS[itemId];
                                    if (!item) return null;

                                    return (
                                        <div
                                            key={itemId}
                                            onClick={() => setSelectedItemId(itemId)}
                                            className="group coalition-panel p-4 flex flex-col h-40 hover:bg-white/5 transition-all hover:-translate-y-1 cursor-pointer border-transparent hover:border-ghost/30"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="text-2xl">{item.name.includes('Drink') ? '🥤' : item.name.includes('Food') ? '🍔' : '📦'}</div>
                                                <span className="text-[10px] font-black bg-white/10 px-2 py-0.5 rounded-full border border-white/10">x{count}</span>
                                            </div>

                                            <h3 className="font-black text-white text-sm uppercase leading-tight mb-1 truncate">{item.name}</h3>
                                            <p className="text-[10px] text-text-muted line-clamp-2 leading-relaxed mb-auto">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* Weapons Section */}
                    {InventorySystem.getOwnedWeapons(inventory).length > 0 && (
                        <section>
                            <div className="flex items-center gap-4 mb-6">
                                <span className="text-[10px] font-black text-demon tracking-[0.2em] uppercase">Offensive Hardware / Armory</span>
                                <div className="h-px bg-demon/20 flex-1"></div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {InventorySystem.getOwnedWeapons(inventory).map((weaponId) => {
                                    const item = ITEMS[weaponId];
                                    if (!item) return null;
                                    const isEquipped = inventory.equippedWeapon === weaponId;

                                    return (
                                        <div
                                            key={weaponId}
                                            onClick={() => setSelectedItemId(weaponId)}
                                            className={clsx(
                                                "group coalition-panel p-4 flex flex-col h-48 transition-all hover:-translate-y-1 relative overflow-hidden cursor-pointer",
                                                isEquipped ? "border-demon shadow-demon bg-demon/10 ring-1 ring-demon/40" : "hover:bg-white/5 border-transparent hover:border-demon/30"
                                            )}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="text-3xl transform group-hover:scale-110 transition-transform duration-300">🔪</div>
                                                {isEquipped && (
                                                    <span className="bg-demon text-black text-[8px] font-black px-2 py-0.5 rounded tracking-widest italic uppercase">EQUIPPED</span>
                                                )}
                                            </div>

                                            <h3 className={clsx(
                                                "font-black text-sm uppercase mb-1",
                                                isEquipped ? "text-demon" : "text-white"
                                            )}>
                                                {item.name}
                                            </h3>
                                            <p className="text-[10px] text-text-muted mb-auto leading-relaxed line-clamp-2">{item.description}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* ITEM DETAIL DRAWER */}
            {selectedItemId && selectedItem && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setSelectedItemId(null)}
                    />
                    <div className="w-full max-w-md bg-bg-panel border-l border-border-soft h-full shadow-2xl relative animate-in slide-in-from-right duration-500 overflow-y-auto">
                        <div className="p-8 space-y-8">
                            {/* Drawer Header */}
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-5xl">{selectedItem.name.includes('Drink') ? '🥤' : selectedItem.name.includes('Food') ? '🍔' : '🔪'}</div>
                                </div>
                                <button
                                    onClick={() => setSelectedItemId(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <span className="text-2xl text-text-muted">×</span>
                                </button>
                            </div>

                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={clsx(
                                        "text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase",
                                        selectedItem.type === 'weapon' ? "bg-demon text-black" : "bg-ghost text-black"
                                    )}>
                                        {selectedItem.type}
                                    </span>
                                    <span className="text-text-muted font-bold text-xs uppercase tracking-widest">Quantity: {selectedItemCount}</span>
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">{selectedItem.name}</h2>
                                <p className="text-sm text-text-muted mt-4 leading-relaxed font-serif italic text-zinc-400">
                                    &quot;{selectedItem.description}&quot;
                                </p>
                            </div>

                            {/* Effects */}
                            {selectedItem.effects && (
                                <div className="space-y-4">
                                    <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Hardware Specifications</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedItem.effects.map((e, i) => (
                                            <div key={i} className="flex flex-col p-3 bg-black/40 border border-border-soft rounded-lg">
                                                <span className="text-[10px] text-text-muted uppercase font-bold">{e.stat}</span>
                                                <span className={clsx(
                                                    "text-lg font-black",
                                                    e.value > 0 ? "text-green-400" : "text-red-400"
                                                )}>
                                                    {e.value > 0 ? '+' : ''}{e.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Control */}
                            <div className="pt-8 border-t border-border-soft space-y-3">
                                {selectedItem.type === 'consumable' && (
                                    <button
                                        onClick={() => {
                                            handleUseItem(selectedItemId);
                                            if (selectedItemCount <= 1) setSelectedItemId(null);
                                        }}
                                        className="w-full bg-ghost text-black py-4 font-black uppercase text-sm tracking-widest btn-snap flex items-center justify-center gap-3"
                                    >
                                        <span>EXECUTE_INTAKE</span>
                                        <span className="text-[10px] opacity-60 font-medium">CONSUME // ONE</span>
                                    </button>
                                )}

                                {selectedItem.type === 'weapon' && (
                                    <button
                                        onClick={() => handleEquip(inventory.equippedWeapon === selectedItemId ? null : selectedItemId)}
                                        className={clsx(
                                            "w-full py-4 font-black uppercase text-sm tracking-widest btn-snap flex items-center justify-center gap-3",
                                            inventory.equippedWeapon === selectedItemId
                                                ? "bg-transparent border-2 border-demon text-demon hover:bg-demon hover:text-black"
                                                : "bg-demon text-black"
                                        )}
                                    >
                                        <span>{inventory.equippedWeapon === selectedItemId ? 'STOW_ARMAMENT' : 'EQUIP_ARMAMENT'}</span>
                                    </button>
                                )}

                                <button
                                    onClick={() => {
                                        handleSell(selectedItemId);
                                        if (selectedItemCount <= 1) setSelectedItemId(null);
                                    }}
                                    className="w-full bg-zinc-900 border border-zinc-700 text-zinc-500 hover:text-white hover:border-zinc-500 py-3 font-black uppercase text-xs tracking-widest btn-snap"
                                >
                                    LIQUIDATE_ASSET // ${Math.floor(selectedItem.cost * 0.5)}
                                </button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute bottom-4 left-0 w-full px-8 opacity-10 pointer-events-none select-none">
                            <div className="text-[8px] font-mono leading-tight uppercase whitespace-pre">
                                AUTHENTICITY_GUARANTEED_BY_COALITION_LOGISTICS<br />
                                SER_NO_{selectedItemId.toUpperCase()}_49X9_FF<br />
                                {'//'} SECTOR_7_HOLDING_FACILITY
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
