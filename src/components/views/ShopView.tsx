import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { ITEMS } from '@/data/items';

interface ShopViewProps {
    onBack: () => void;
    initialCategory?: Category;
}

type Category = 'all' | 'consumable' | 'weapon' | 'electronics' | 'luxury' | 'gym';

export const ShopView = ({ onBack, initialCategory = 'all' }: ShopViewProps) => {
    const buyItem = useGameStore((state) => state.buyItem);
    const toast = useUIStore((state) => state.toast);
    const cash = useGameStore((state) => state.player.stats.worth);
    const locationId = useGameStore((state) => state.world.locationId);
    const getItemPrice = useGameStore((state) => state.getItemPrice);

    const [activeCategory, setActiveCategory] = useState<Category>(initialCategory);

    // Filter Items
    const shopItems = Object.values(ITEMS).filter(item => {
        if (item.cost <= 0 || item.type === 'misc') return false;
        if (item.shopDistrict && item.shopDistrict !== locationId) return false;
        if (activeCategory === 'all') return true;
        // Map 'gym' to 'consumable' tab? No, let's keep tabs distinct or group them.
        // For now, exact mapping.
        return item.type === activeCategory;
    });

    const categories: { id: Category; label: string }[] = [
        { id: 'all', label: 'ALL' },
        { id: 'consumable', label: 'PHARMACY' },
        { id: 'weapon', label: 'ARMORY' },
        { id: 'electronics', label: 'TECH' },
        { id: 'luxury', label: 'LUXURY' },
        { id: 'gym', label: 'GYM' },
    ];

    const handleBuy = (item: (typeof ITEMS)[keyof typeof ITEMS]) => {
        buyItem(item.id);
        toast({
            title: 'Purchase Successful',
            description: `You bought ${item.name} for $${getItemPrice(item.id)}`,
            variant: 'success'
        });
    };

    return (
        <div className="flex flex-col h-full p-6 text-text-main overflow-y-auto bg-bg-main font-mono">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-border-soft pb-4">
                <button
                    onClick={onBack}
                    className="button-secondary px-4 py-2 text-xs uppercase font-bold tracking-widest"
                >
                    &larr; ESC
                </button>
                <div className="text-text-muted font-mono text-sm font-bold">
                    CREDIT: <span className="text-coalition-gold">${cash.toLocaleString()}</span>
                </div>
            </div>

            <div className="text-center mb-8">
                <div className="flex items-center gap-4 justify-center">
                    <div className="text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                        {activeCategory === 'electronics' ? '📱' :
                            activeCategory === 'luxury' ? '💎' :
                                activeCategory === 'gym' ? '💊' :
                                    activeCategory === 'weapon' ? '🔫' : '🛍️'}
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-white uppercase tracking-[0.06em] font-sans">
                            {activeCategory === 'electronics' ? 'TECH HAVEN' :
                                activeCategory === 'luxury' ? 'RUNWAY FASHION' :
                                    activeCategory === 'gym' ? 'GNC PROTOCOL' :
                                        activeCategory === 'weapon' ? 'UNDERGROUND ARMORY' :
                                            locationId === 'underground_markets' ? 'BLACK MARKET' :
                                                locationId === 'corporate_towers' ? 'CORPORATE EXCHANGE' :
                                                    locationId === 'political_offices' ? 'CIVIC ARMORY' :
                                                        'TOWSON MALL'}
                        </h1>
                        <p className="text-demon text-xs tracking-[0.2em] uppercase font-bold mt-1">
                            {activeCategory === 'electronics' ? 'THE FUTURE IS NOW.' :
                                activeCategory === 'luxury' ? 'DRESS TO KILL.' :
                                    activeCategory === 'gym' ? 'FUEL YOUR AMBITION.' :
                                        'CONSUME.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Department Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-border-soft">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all uppercase tracking-wider btn-snap ${activeCategory === cat.id
                            ? 'bg-white/10 text-white border-b-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                            : 'text-text-muted hover:text-white hover:bg-white/5 border-b-2 border-transparent'
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Shop List */}
            <div className="grid grid-cols-1 gap-4">
                {shopItems.length === 0 && (
                    <div className="text-center text-text-muted py-10 italic">
                        No items in stock for this department.
                    </div>
                )}

                {shopItems.map((item) => {
                    const price = getItemPrice(item.id);
                    const canAfford = cash >= price;
                    const hasDiscount = price < item.cost;

                    // Dynamic Border Colors
                    let borderClass = 'border-border-soft';
                    let glowClass = '';
                    if (item.type === 'luxury') { borderClass = 'border-coalition-gold/30'; glowClass = 'group-hover:shadow-gold'; }
                    if (item.type === 'electronics') { borderClass = 'border-ghost/30'; glowClass = 'group-hover:shadow-ghost'; }
                    if (item.type === 'weapon') { borderClass = 'border-demon/30'; glowClass = 'group-hover:shadow-demon'; }

                    return (
                        <div key={item.id} className={`coalition-panel p-4 ${borderClass} flex justify-between items-center transition-all group relative overflow-hidden ${glowClass} hover:bg-white/5`}>

                            <div className="flex-1 mr-4 z-10">
                                <div className="font-bold text-white flex items-center gap-2 mb-1">
                                    {item.name}
                                    {item.type === 'luxury' && <span className="text-[10px] bg-coalition-gold text-black px-1.5 rounded font-black">$</span>}
                                    {item.type === 'weapon' && <span className="text-[10px] bg-demon text-black px-1.5 rounded font-black">DMG</span>}
                                </div>
                                <div className="text-xs text-text-muted">{item.description}</div>                                    {hasDiscount && <div className="text-[10px] text-emerald-300 uppercase tracking-widest mt-2">Ending discount applied: ${item.cost - price} off</div>}
                                    {item.effects && (

                                    <div className="text-[10px] text-zinc-400 mt-2 flex gap-2">
                                        {item.effects.map((e, idx) => (
                                            <span key={idx} className="bg-black/50 px-2 py-0.5 rounded border border-white/10 text-zinc-300">
                                                {e.value > 0 ? '+' : ''}{e.value} <span className="uppercase text-zinc-500 font-bold">{e.stat}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleBuy(item)}
                                disabled={!canAfford}
                                className={`px-4 py-2 text-xs font-bold rounded-lg flex flex-col items-center min-w-[80px] z-10 transition-transform btn-snap ${canAfford
                                    ? 'bg-white text-black hover:bg-zinc-200'
                                    : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/5'
                                    }`}
                            >
                                <span className="uppercase tracking-widest">{canAfford ? 'BUY' : 'FUNDS'}</span>
                                <span className={canAfford ? 'text-black font-black' : 'text-zinc-600'}>${price}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
