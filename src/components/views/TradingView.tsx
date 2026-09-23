import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useGameStore, GameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';
import { CRYPTO } from '@/data/crypto';
import { STOCKS } from '@/data/stocks';
import clsx from 'clsx';

interface TradingViewProps {
    onBack: () => void;
}

export const TradingView = ({ onBack }: TradingViewProps) => {
    const market = useGameStore((state: GameStore) => state.market);
    const cash = useGameStore((state: GameStore) => state.player.stats.worth);
    const initMarket = useGameStore((state: GameStore) => state.initMarket);
    const startPricePolling = useGameStore((state: GameStore) => state.startPricePolling);
    const stopPricePolling = useGameStore((state: GameStore) => state.stopPricePolling);
    const quests = useGameStore((state: GameStore) => state.quests);

    // Tab State
    const [activeTab, setActiveTab] = useState<'crypto' | 'stocks'>('crypto');
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

    // Local state for 'tick' to force re-render of stale timer
    const [now, setNow] = useState(0);
    const [isEntering, setIsEntering] = useState(true);

    const hasStockLicense = quests['stock_license']?.status === 'completed';

    // Ensure market is initialized & Poll for prices
    useEffect(() => {
        initMarket();
        startPricePolling();

        const tickInterval = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        // Drama timeout
        const dramaTimeout = setTimeout(() => {
            setIsEntering(false);
        }, 1200);

        return () => {
            stopPricePolling();
            clearInterval(tickInterval);
            clearTimeout(dramaTimeout);
        };
    }, [initMarket, startPricePolling, stopPricePolling]);

    // Calculate Data Freshness
    const lastUpdate = market.lastUpdate || 0;
    const secondsAgo = Math.floor((now - lastUpdate) / 1000);
    const isStale = secondsAgo > 30; // Considered stale if older than 30s

    return (
        <div className={clsx(
            "flex flex-col h-full bg-bg-main text-text-main p-4 md:p-6 overflow-hidden font-mono transition-colors duration-1000",
            isEntering && "drama-entry"
        )}>
            {isEntering && <div className="fixed inset-0 z-[100] pointer-events-none drama-dim" />}
            {/* Header & News Ticker */}
            <header className="mb-4 md:mb-6 flex flex-col gap-4 border-b border-border-soft pb-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-coalition-gold/10 rounded-lg flex items-center justify-center border border-coalition-gold/30 shadow-gold">
                            <span className="text-2xl drop-shadow-[0_0_8px_rgba(245,199,122,0.5)]">🏛️</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold tracking-[0.06em] text-white font-sans uppercase">Decentralized_Bourse</h1>
                            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold">
                                <span className="text-text-muted">Federal Coalition Trading Floor</span>
                                <span className="text-zinc-700">|</span>
                                <span className={clsx("flex items-center gap-1", isStale ? "text-demon" : "text-coalition-gold")}>
                                    <span className={clsx("w-1.5 h-1.5 rounded-full", isStale ? "bg-demon shadow-demon" : "bg-coalition-gold shadow-gold animate-pulse")}></span>
                                    {isStale ? `DISCONNECTED (${secondsAgo}s ago)` : 'LIVE FEED'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <div className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Available Liquidity</div>
                            <div className={clsx(
                                "text-2xl font-mono font-bold transition-all duration-300",
                                "text-green-400"
                            )}>
                                ${cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </div>
                        <button
                            onClick={onBack}
                            className="bg-zinc-900 border border-border-soft px-6 py-2 rounded-full hover:bg-zinc-800 text-xs font-bold transition-all hover:border-zinc-500"
                        >
                            ESC_LOCATION
                        </button>
                    </div>
                </div>

                {/* News Ticker */}
                <div className="h-10 md:h-12 bg-bg-panel border border-border-soft rounded flex items-center px-4 overflow-hidden relative">
                    <div className="absolute left-0 h-full w-20 md:w-24 bg-bg-panel z-10 flex items-center px-3 md:px-4 border-r border-border-soft">
                        <span className="text-[9px] md:text-[10px] font-black text-ghost uppercase tracking-widest animate-pulse whitespace-nowrap">LIVE NEWS</span>
                    </div>
                    <div className="flex-1 pl-20 md:pl-24 overflow-hidden">
                        {market.activeEvent ? (
                            <div className="flex gap-4 items-center animate-ticker whitespace-nowrap">
                                <span className="text-sm font-bold text-white">{market.activeEvent?.title}:</span>
                                <span className="text-sm text-zinc-400">{market.activeEvent?.description}</span>
                                <span className="text-xs text-ghost">[ IMPACT DETECTED ]</span>
                            </div>
                        ) : (
                            <div className="text-sm text-zinc-600 italic">No major market events detected. Standard volatility in effect.</div>
                        )}
                    </div>
                </div>
            </header>

            {/* TABS */}
            <div className="flex gap-4 mb-4 border-b border-border-soft">
                <button
                    onClick={() => { setActiveTab('crypto'); setSelectedSymbol(null); }}
                    className={clsx(
                        "px-6 py-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all",
                        activeTab === 'crypto' ? "border-ghost text-ghost shadow-ghost" : "border-transparent text-text-muted hover:text-zinc-300"
                    )}
                >
                    Crypto Market (Open)
                </button>
                <button
                    onClick={() => { setActiveTab('stocks'); setSelectedSymbol(null); }}
                    className={clsx(
                        "px-6 py-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2",
                        activeTab === 'stocks' ? "border-coalition-gold text-coalition-gold shadow-gold" : "border-transparent text-text-muted hover:text-zinc-300"
                    )}
                >
                    <span>Stock Exchange</span>
                    {!hasStockLicense && <span className="text-[10px] bg-demon/10 text-demon border border-demon/20 px-1 rounded">LOCKED</span>}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden relative">
                {/* LOCKED OVERLAY FOR STOCKS */}
                {activeTab === 'stocks' && !hasStockLicense && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 animate-in fade-in">
                        <div className="text-6xl mb-6">🔒</div>
                        <h2 className="text-3xl font-bold text-red-500 mb-2">ACCESS RESTRICTED</h2>
                        <p className="text-zinc-400 max-w-md mb-8">
                            Federal regulations require a <span className="text-white font-bold">Series 7 License</span> to trade on the Stock Exchange.
                        </p>
                        <div className="bg-zinc-900 border border-zinc-700 p-6 rounded-xl max-w-lg">
                            <h3 className="font-bold text-neon-blue mb-2">QUEST: STOCK BROKER LICENSE</h3>
                            <ul className="text-left space-y-2 text-sm text-zinc-300">
                                <li className="flex gap-2">
                                    <span>📍</span> Go to <span className="text-white">Morgan University</span>
                                </li>
                                <li className="flex gap-2">
                                    <span>📝</span> Pass the <span className="text-white">Series 7 Exam</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Asset List */}
                <div className="flex-1 overflow-y-auto pr-2 space-y-2 custom-scrollbar pb-24 md:pb-0">
                    {activeTab === 'crypto' ? (
                        // CRYPTO LIST
                        Object.values(CRYPTO).map(asset => {
                            const price = market?.prices?.[asset.symbol] ?? asset.basePrice;
                            const trend = market?.trends?.[asset.symbol] ?? 'flat';
                            const history = market?.priceHistory?.[asset.symbol] ?? [];
                            const isSelected = selectedSymbol === asset.symbol;
                            const owned = market?.portfolio?.[asset.symbol] ?? 0;

                            return (
                                <AssetRow
                                    key={asset.symbol}
                                    asset={asset}
                                    price={price}
                                    trend={trend}
                                    historyData={history}
                                    owned={owned}
                                    isSelected={isSelected}
                                    onSelect={() => setSelectedSymbol(asset.symbol)}
                                />
                            );
                        })) : (
                        // STOCK LIST
                        Object.values(STOCKS).map(asset => {
                            const price = market?.stocks?.prices?.[asset.symbol] ?? asset.basePrice;
                            const trend = market?.stocks?.trends?.[asset.symbol] ?? 'flat';
                            const history = market?.stocks?.history?.[asset.symbol] ?? [price];
                            const isSelected = selectedSymbol === asset.symbol;
                            const owned = market?.stocks?.portfolio?.[asset.symbol] ?? 0;

                            return (
                                <AssetRow
                                    key={asset.symbol}
                                    asset={asset}
                                    price={price}
                                    trend={trend}
                                    history={history}
                                    owned={owned}
                                    isSelected={isSelected}
                                    onSelect={() => setSelectedSymbol(asset.symbol)}
                                />
                            );
                        })
                    )}
                </div>

                {/* Trade Interaction Panel */}
                <div className={clsx(
                    "w-full md:w-96 shrink-0 bg-[#161a1e] border-t md:border-t-0 md:border-l border-zinc-800 flex flex-col items-stretch overflow-hidden shadow-2xl transition-all duration-300",
                    selectedSymbol ? "h-[60vh] md:h-full opacity-100" : "h-0 md:h-full md:opacity-100 opacity-0 pointer-events-none md:pointer-events-auto"
                )}>
                    {selectedSymbol ? (
                        <div className="flex flex-col h-full relative">
                            {/* Mobile Close Button for Panel */}
                            <button
                                onClick={() => setSelectedSymbol(null)}
                                className="md:hidden absolute top-4 right-4 z-50 text-text-muted hover:text-white"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                            <CryptoTradePanel symbol={selectedSymbol} type={activeTab} />
                        </div>
                    ) : (
                        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-8 text-center text-zinc-500">
                            <div className="text-5xl mb-4 opacity-20">📊</div>
                            <h3 className="text-white font-bold mb-1">MARKET_IDLE</h3>
                            <p className="text-xs">Select an asset from the bourse to initialize trade protocol.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface AssetRowProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    asset: any;
    price: number;
    trend: 'bull' | 'bear' | 'flat';
    historyData?: { t: number; usd: number }[]; // New Prop
    history?: number[]; // Legacy Fallback
    owned: number;
    isSelected: boolean;
    onSelect: () => void;
}

const AssetRow = ({ asset, price, trend, historyData, history, owned, isSelected, onSelect }: AssetRowProps) => {

    // Normalize Data for Chart
    let chartPoints: number[] = [];
    if (historyData && historyData.length > 0) {
        chartPoints = historyData.map(p => p.usd);
    } else if (history) {
        chartPoints = history;
    }

    // Fallback if empty
    if (chartPoints.length === 0) chartPoints = [price];

    return (
        <div
            onClick={onSelect}
            className={clsx(
                "p-3 md:p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 md:gap-6 group relative overflow-hidden",
                isSelected
                    ? "coalition-panel border-ghost shadow-ghost"
                    : "bg-transparent border-border-soft hover:bg-white/5 hover:border-white/10"
            )}
        >
            {/* Asset Info */}
            <div className="flex items-center gap-3 md:gap-4 w-32 md:w-48 shrink-0">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 flex items-center justify-center border border-zinc-800 overflow-hidden shrink-0 relative">
                    <Image
                        src={asset.logoUrl}
                        alt={asset.name}
                        width={20}
                        height={20}
                        className="w-5 h-5 md:w-6 md:h-6 object-contain"
                    />
                </div>
                <div className="overflow-hidden">
                    <div className="font-bold text-xs md:text-sm truncate">{asset.name}</div>
                    <div className="text-[9px] md:text-[10px] text-zinc-500 font-mono uppercase truncate">{asset.symbol}</div>
                </div>
            </div>

            {/* Price & Trend */}
            <div className="w-24 md:w-32 shrink-0">
                <div className={clsx(
                    "font-mono font-bold text-sm md:text-lg",
                    trend === 'bull' ? "text-green-400" : trend === 'bear' ? "text-red-400" : "text-zinc-300"
                )}>
                    ${price < 1 ? price.toFixed(4) : price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className={clsx(
                    "text-[9px] md:text-[10px] font-bold uppercase",
                    trend === 'bull' ? "text-green-600" : trend === 'bear' ? "text-red-600" : "text-zinc-600"
                )}>
                    {trend === 'bull' ? '▲ Bullish' : trend === 'bear' ? '▼ Bearish' : '— Flat'}
                </div>
            </div>

            {/* Mini Sparkline - Hidden on tiny screens */}
            <div className="hidden sm:flex flex-1 h-8 md:h-10 px-2 md:px-4 items-center justify-center">
                {chartPoints.length < 2 ? (
                    <div className="text-[9px] text-zinc-600 font-mono tracking-widest uppercase animate-pulse">Building Data...</div>
                ) : (
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <polyline
                            ref={(el) => {
                                if (el) {
                                    el.style.setProperty('filter', trend === 'bull' ? 'drop-shadow(0 0 4px rgba(74,222,128,0.5))' : trend === 'bear' ? 'drop-shadow(0 0 4px rgba(248,113,113,0.5))' : 'none');
                                }
                            }}
                            fill="none"
                            stroke={trend === 'bull' ? "#4ade80" : trend === 'bear' ? "#f87171" : "#a1a1aa"}
                            strokeWidth="2"
                            points={chartPoints.map((v, i) => {
                                const min = Math.min(...chartPoints);
                                const max = Math.max(...chartPoints);
                                const range = max - min || 1;
                                const x = (i / (chartPoints.length - 1)) * 100;
                                const y = 100 - ((v - min) / range) * 90 - 5;
                                return `${x},${y}`;
                            }).join(' ')}
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                )}
            </div>

            {/* Ownership Status */}
            <div className="text-right w-24 shrink-0">
                {owned > 0 ? (
                    <>
                        <div className="text-[10px] text-zinc-500 uppercase font-bold">Stash</div>
                        <div className="font-mono text-white text-sm">{owned.toLocaleString()}</div>
                    </>
                ) : (
                    <div className="text-[10px] text-zinc-700 uppercase font-bold group-hover:text-zinc-600 transition-colors">No Position</div>
                )}
            </div>
        </div>
    );
}

const CryptoTradePanel = ({ symbol, type }: { symbol: string, type: 'crypto' | 'stocks' }) => {
    const asset = type === 'crypto' ? CRYPTO[symbol] : STOCKS[symbol];
    const market = useGameStore((state: GameStore) => state.market);
    const cash = useGameStore((state: GameStore) => state.player.stats.worth);
    const buyCrypto = useGameStore((state: GameStore) => state.buyCrypto);
    const sellCrypto = useGameStore((state: GameStore) => state.sellCrypto);
    const buyStock = useGameStore((state: GameStore) => state.buyStock);
    const sellStock = useGameStore((state: GameStore) => state.sellStock);

    // NEW: UI Store for Toasts
    const toast = useUIStore((state) => state.toast);

    // Get correct price reference based on type
    const price = type === 'crypto'
        ? (market.prices[symbol] || asset?.basePrice)
        : (market.stocks?.prices[symbol] || asset?.basePrice);

    const owned = type === 'crypto'
        ? (market.portfolio[symbol] || 0)
        : (market.stocks?.portfolio[symbol] || 0);

    const [amt, setAmt] = useState(1);

    const totalCost = price * amt;
    const canAfford = cash >= totalCost;
    const canSell = owned >= amt;

    const handleTransaction = (action: 'buy' | 'sell') => {
        if (action === 'buy') {
            if (type === 'crypto') buyCrypto(symbol, amt);
            else buyStock(symbol, amt);

            toast({
                title: 'Order Executed',
                description: `BOUGHT ${amt}x ${asset.symbol} @ $${price.toFixed(2)}`,
                variant: 'success'
            });
        } else {
            if (type === 'crypto') sellCrypto(symbol, amt);
            else sellStock(symbol, amt);

            toast({
                title: 'Position Closed',
                description: `SOLD ${amt}x ${asset.symbol} @ $${price.toFixed(2)}`,
                variant: 'warning' // or neutral
            });
        }
    };

    if (!asset) return null;

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Asset Header */}
            <div className="p-6 bg-gradient-to-b from-white/[0.03] to-transparent border-b border-zinc-800/50">
                <div className="flex items-center gap-4 mb-4">
                    <Image
                        src={asset.logoUrl}
                        alt={asset.name}
                        width={48}
                        height={48}
                        className="w-12 h-12"
                    />
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">{asset.name}</h2>
                        <span className={clsx("text-xs font-mono font-bold uppercase", asset.color)}>{asset.symbol} NETWORK</span>
                    </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed italic">
                    &quot;{asset.description}&quot;
                </p>
            </div>

            {/* Price Stats */}
            <div className="p-6 space-y-4 flex-1">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Index Price</div>
                        <div className="text-xl font-mono font-bold text-white">${price.toLocaleString()}</div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/80">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Held Position</div>
                        <div className="text-xl font-mono font-bold text-white">{owned}</div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2 pt-4">
                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1" htmlFor="order-qty">Order Quantity</label>
                    <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-neon-blue transition-colors">
                        <button
                            onClick={() => setAmt(Math.max(1, amt - 1))}
                            className="w-12 h-12 text-xl hover:bg-zinc-900 transition-colors"
                        >-</button>
                        <input
                            id="order-qty"
                            type="number"
                            value={amt}
                            onChange={(e) => setAmt(Number(e.target.value))}
                            className="bg-transparent border-none text-center flex-1 font-mono text-xl focus:ring-0 appearance-none"
                            aria-label="Crypto quantity"
                        />
                        <button
                            onClick={() => setAmt(amt + 1)}
                            className="w-12 h-12 text-xl hover:bg-zinc-900 transition-colors"
                        >+</button>
                    </div>
                    <div className="flex gap-2 pt-1">
                        {[5, 10, 50, 100].map(v => (
                            <button
                                key={v}
                                onClick={() => setAmt(v)}
                                className="flex-1 py-1 text-[9px] font-bold bg-zinc-900/50 text-zinc-500 rounded border border-zinc-800 hover:text-white hover:border-zinc-700 transition-all uppercase"
                            >
                                x{v}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-6 border-t border-zinc-800/50">
                    <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Calculated Subtotal</span>
                        <span className={clsx("text-xs font-mono font-bold", canAfford ? "text-zinc-300" : "text-red-500")}>
                            {canAfford ? 'VALID' : 'INS_FUNDS'}
                        </span>
                    </div>
                    <div className="text-3xl font-mono font-bold text-white px-1">
                        ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="p-6 bg-black/20 border-t border-zinc-800/50 grid grid-cols-2 gap-4">
                <button
                    onClick={() => handleTransaction('buy')}
                    disabled={!canAfford}
                    className="flex flex-col items-center justify-center gap-1 bg-green-500 hover:bg-green-400 disabled:opacity-30 disabled:grayscale text-black font-black py-4 rounded-xl transition-all active:scale-[0.98]"
                >
                    <span className="text-sm">EXECUTE_BUY</span>
                </button>
                <button
                    onClick={() => handleTransaction('sell')}
                    disabled={!canSell}
                    className="flex flex-col items-center justify-center gap-1 bg-red-500 hover:bg-red-400 disabled:opacity-30 disabled:grayscale text-black font-black py-4 rounded-xl transition-all active:scale-[0.98]"
                >
                    <span className="text-sm">EXECUTE_SELL</span>
                </button>
            </div>

            {/* SEND BUTTON (CRYPTO ONLY) */}
            {type === 'crypto' && (
                <div className="px-6 pb-6">
                    <button className="w-full py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-zinc-400 text-xs font-bold uppercase hover:bg-zinc-800 hover:text-white transition-all">
                        📤 Transfer Asset (P2P)
                    </button>
                </div>
            )}
        </div>
    );
};
