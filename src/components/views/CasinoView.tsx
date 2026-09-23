import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';

interface CasinoViewProps {
    onBack: () => void;
}

type GameMode = 'menu' | 'slots' | 'blackjack';

export const CasinoView = ({ onBack }: CasinoViewProps) => {
    const [mode, setMode] = useState<GameMode>('menu');
    const cash = useGameStore(state => state.player.stats.worth);
    const modifyStat = useGameStore(state => state.modifyStat);
    const completeFinanceContract = useGameStore(state => state.completeFinanceContract);
    const addNotification = useUIStore(state => state.addNotification);

    // --- FINANCE CONTRACT TRIGGER ---
    const triggerCasinoWin = (game: 'blackjack' | 'slots') => {
        const financeContract = useGameStore.getState().getFinanceContracts().find(
            (offer) => offer.objective.trigger === 'casino_win' && (!offer.objective.target || offer.objective.target === game)
        );
        if (financeContract && useGameStore.getState().contracts.acceptedIds.includes(financeContract.id)) {
            completeFinanceContract(financeContract.id);
        }
    };

    // --- SLOTS LOGIC ---
    const [slotsResult, setSlotsResult] = useState<string[]>(['🍒', '🍒', '🍒']);
    const [spinning, setSpinning] = useState(false);

    const spinSlots = () => {
        const cost = 50;
        if (cash < cost) {
            addNotification('Not enough cash to spin!');
            return;
        }

        modifyStat('worth', -cost);
        setSpinning(true);

        const toast = useUIStore.getState().toast;
        setTimeout(() => {
            const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
            const r1 = symbols[Math.floor(Math.random() * symbols.length)];
            const r2 = symbols[Math.floor(Math.random() * symbols.length)];
            const r3 = symbols[Math.floor(Math.random() * symbols.length)];

            setSlotsResult([r1, r2, r3]);
            setSpinning(false);

            // Payouts
            if (r1 === r2 && r2 === r3) {
                if (r1 === '7️⃣') {
                    const win = cost * 100;
                    modifyStat('worth', win);
                    toast({ title: 'JACKPOT', description: `You won $${win}!`, variant: 'success' });
                } else if (r1 === '💎') {
                    const win = cost * 20;
                    modifyStat('worth', win);
                    toast({ title: 'BIG WIN', description: `You won $${win}!`, variant: 'success' });
                } else {
                    const win = cost * 10;
                    modifyStat('worth', win);
                    toast({ title: 'WIN', description: `You won $${win}!`, variant: 'success' });
                }
                triggerCasinoWin('slots');
            } else if (r1 === r2 || r2 === r3 || r1 === r3) {
                const win = cost * 2;
                modifyStat('worth', win);
                toast({ title: 'SMALL WIN', description: `You won $${win}.`, variant: 'neutral' });
            }

        }, 500);
    };


    // --- BLACKJACK LOGIC ---
    const [bjState, setBjState] = useState<'betting' | 'playing' | 'dealer_turn' | 'end'>('betting');
    const [bet, setBet] = useState(100);
    const [playerHand, setPlayerHand] = useState<number[]>([]);
    const [dealerHand, setDealerHand] = useState<number[]>([]);

    // actually cards: 2-11. 11 is Ace. 10 is J/Q/K. 
    // Let's do simple value generator: 2,3,4,5,6,7,8,9,10,10,10,10,11
    const getCard = () => {
        const deck = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
        return deck[Math.floor(Math.random() * deck.length)];
    }

    const startBlackjack = () => {
        if (cash < bet) {
            addNotification("Can't cover that bet.");
            return;
        }
        modifyStat('worth', -bet);
        setPlayerHand([getCard(), getCard()]);
        setDealerHand([getCard()]); // Only show one for now, or deal 2 and hide one
        setBjState('playing');
    };

    const hit = () => {
        const newHand = [...playerHand, getCard()];
        setPlayerHand(newHand);
        const sum = newHand.reduce((a, b) => a + b, 0);
        if (sum > 21) {
            endBlackjack(newHand, dealerHand, 'bust');
        }
    };

    const stand = () => {
        setBjState('dealer_turn');
        // Dealer plays
        const currentDealer = [...dealerHand];
        let sum = currentDealer.reduce((a, b) => a + b, 0);

        // Simple delay loop emulation or instant
        while (sum < 17) {
            const card = getCard();
            currentDealer.push(card);
            sum += card;
        }
        setDealerHand(currentDealer);
        endBlackjack(playerHand, currentDealer, 'compare');
    };

    const endBlackjack = (pHand: number[], dHand: number[], reason: 'bust' | 'compare') => {
        const pSum = pHand.reduce((a, b) => a + b, 0);
        const dSum = dHand.reduce((a, b) => a + b, 0);
        setBjState('end');

        if (reason === 'bust') {
            toast({ title: 'BUST', description: 'House wins.', variant: 'demon' });
        } else {
            // Compare
            if (dSum > 21) {
                toast({ title: 'WIN', description: 'Dealer Busts! You win!', variant: 'success' });
                modifyStat('worth', bet * 2);
                triggerCasinoWin('blackjack');
            } else if (pSum > dSum) {
                toast({ title: 'WIN', description: 'You win!', variant: 'success' });
                modifyStat('worth', bet * 2);
                triggerCasinoWin('blackjack');
            } else if (pSum === dSum) {
                toast({ title: 'PUSH', description: 'Money back.', variant: 'neutral' });
                modifyStat('worth', bet);
            } else {
                toast({ title: 'LOSS', description: 'House wins.', variant: 'demon' });
            }
        }
        setTimeout(() => setBjState('betting'), 2000);
    };

    const toast = useUIStore(state => state.toast);

    return (
        <div className="w-full h-full bg-bg-main text-text-main p-4 md:p-6 overflow-y-auto">
            <header className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-border-soft pb-4 gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl drop-shadow-glow-gold">🎰</div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-white uppercase italic">Grand_Bazaar_Casino</h1>
                        <p className="text-text-muted text-[10px] tracking-widest uppercase font-bold">Protocol: High Stakes . High Rewards</p>
                    </div>
                </div>
                <div className="text-left md:text-right w-full md:w-auto p-3 bg-bg-panel/50 rounded-xl border border-border-soft">
                    <div className="text-[10px] text-text-muted uppercase font-black mb-1">Available Credits</div>
                    <div className="text-2xl font-mono text-coalition-gold font-black transition-all shadow-gold">${cash.toLocaleString()}</div>
                </div>
            </header>

            {mode === 'menu' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <button onClick={() => setMode('slots')} className="coalition-panel bg-ghost/5 border-ghost/30 p-6 md:p-10 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-4 group">
                        <div className="text-6xl group-hover:animate-bounce drop-shadow-glow-ghost">🍒</div>
                        <div className="text-2xl font-black uppercase text-ghost tracking-tighter">LUCKY_SLOTS</div>
                        <div className="text-[10px] text-ghost/60 font-mono tracking-widest">MIN_ENTRY: $50</div>
                    </button>
                    <button onClick={() => setMode('blackjack')} className="coalition-panel bg-demon/5 border-demon/30 p-6 md:p-10 hover:scale-[1.02] transition-all flex flex-col items-center justify-center gap-4 group">
                        <div className="text-6xl group-hover:rotate-12 transition-transform drop-shadow-glow-demon">♠️</div>
                        <div className="text-2xl font-black uppercase text-demon tracking-tighter">BLACKJACK</div>
                        <div className="text-[10px] text-demon/60 font-mono tracking-widest">PROTOCOL: SKILL/LUCK</div>
                    </button>
                    <button onClick={onBack} className="md:col-span-2 border border-border-soft rounded-xl p-4 hover:bg-bg-panel text-text-muted hover:text-white transition-all font-bold uppercase text-xs tracking-widest">
                        DISCONNECT_CASINO
                    </button>
                </div>
            )}

            {mode === 'slots' && (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <div className="bg-zinc-900 p-8 rounded-2xl border-4 border-yellow-500/50 shadow-[0_0_50px_rgba(234,179,8,0.2)] mb-8">
                        <div className="flex gap-4 text-6xl font-mono bg-black px-8 py-6 rounded-xl border border-zinc-800 shadow-inner">
                            {slotsResult.map((s, i) => (
                                <div key={i} className={`${spinning ? 'animate-pulse blur-sm' : ''} w-20 text-center`}>{s}</div>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={spinSlots} disabled={spinning} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold text-xl px-12 py-4 rounded-full shadow-lg active:translate-y-1 disabled:opacity-50">
                            SPIN ($50)
                        </button>
                        <button onClick={() => setMode('menu')} className="border border-zinc-700 px-6 py-4 rounded-full hover:bg-zinc-800">
                            Back
                        </button>
                    </div>
                </div>
            )}

            {mode === 'blackjack' && (
                <div className="max-w-md mx-auto h-full flex flex-col">
                    <div className="flex-1 bg-green-900/20 border border-green-900 rounded-xl p-4 relative mb-4">
                        <div className="text-center text-green-700/50 font-bold text-4xl absolute inset-0 flex items-center justify-center pointer-events-none">TABLE 1</div>

                        {/* Dealer */}
                        <div className="mb-8 text-center">
                            <div className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">Dealer</div>
                            <div className="flex justify-center gap-2">
                                {dealerHand.map((c, i) => (
                                    <div key={i} className="w-16 h-24 bg-white text-black rounded shadow-xl flex items-center justify-center font-bold text-2xl border border-zinc-300">
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Player */}
                        <div className="text-center mt-auto">
                            <div className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">You ({playerHand.reduce((a, b) => a + b, 0)})</div>
                            <div className="flex justify-center gap-2">
                                {playerHand.map((c, i) => (
                                    <div key={i} className="w-16 h-24 bg-white text-black rounded shadow-xl flex items-center justify-center font-bold text-2xl border border-zinc-300">
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {bjState === 'betting' && (
                        <div className="flex gap-4 items-center justify-center p-4 bg-zinc-900 rounded-xl">
                            <button onClick={() => setBet(Math.max(10, bet - 10))} className="p-2 bg-zinc-800 rounded">-</button>
                            <div className="text-xl font-mono text-green-400">${bet}</div>
                            <button onClick={() => setBet(bet + 10)} className="p-2 bg-zinc-800 rounded">+</button>
                            <button onClick={startBlackjack} className="ml-4 bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded font-bold">DEAL</button>
                        </div>
                    )}

                    {bjState === 'playing' && (
                        <div className="grid grid-cols-2 gap-4">
                            <button onClick={hit} className="bg-zinc-800 hover:bg-zinc-700 p-4 rounded-xl font-bold border border-zinc-600">HIT</button>
                            <button onClick={stand} className="bg-red-900/50 hover:bg-red-900/80 p-4 rounded-xl font-bold border border-red-900 text-red-200">STAND</button>
                        </div>
                    )}

                    <button onClick={() => setMode('menu')} className="mt-4 w-full py-2 text-zinc-500 text-xs hover:text-white">Exit Table</button>
                </div>
            )}
        </div>
    );
};
