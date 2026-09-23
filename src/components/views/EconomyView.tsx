'use client';

import { useMemo, useState } from 'react';
import { clsx } from 'clsx';
import { FACTION_VENDORS, INTEL_SOURCES, HOUSING_UPGRADES, isVendorAvailable, getVendorPrice, getDailyActivities } from '@/data/economy';
import { ITEMS } from '@/data/items';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';

interface EconomyViewProps {
    onBack: () => void;
}

type Section = 'overview' | 'loans' | 'intel' | 'vendors' | 'housing' | 'activities';

const SECTIONS: Array<{ id: Section; label: string; hint: string }> = [
    { id: 'overview', label: 'CITY LEDGER', hint: 'Money, debt, and today\u2019s opportunities' },
    { id: 'loans', label: 'LOANS', hint: 'Fast cash with real consequences' },
    { id: 'intel', label: 'INTEL', hint: 'Buy market direction before you trade' },
    { id: 'vendors', label: 'FACTION VENDORS', hint: 'Reputation-gated discount gear' },
    { id: 'housing', label: 'UPGRADES', hint: 'Permanent home and safehouse improvements' },
    { id: 'activities', label: 'DAILY SCENE', hint: 'Rotating city activities that change by day and faction' }
];

export const EconomyView = ({ onBack }: EconomyViewProps) => {
    const [section, setSection] = useState<Section>('overview');
    const gameState = useGameStore();
    const cash = gameState.player.stats.worth;
    const finance = gameState.finance;
    const market = gameState.market;
    const completedFinance = finance.completedFinanceContractIds || [];
    const financeContracts = useMemo(() => gameState.getFinanceContracts(), [gameState]);
    const dailyActivities = useMemo(() => getDailyActivities(gameState), [gameState]);
    const addNotification = useUIStore((state) => state.addNotification);

    const vendors = FACTION_VENDORS.filter((vendor) => isVendorAvailable(gameState, vendor));

    return (
        <div className="flex flex-col h-full bg-[#0d120f] text-white p-4 md:p-8 overflow-y-auto">
            <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-300/20 pb-5">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-200/60 font-bold mb-2">Economy Network · Paper City Ledger</div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-emerald-50">THE EXCHANGE</h1>
                    <p className="text-sm text-emerald-100/60 mt-2 max-w-2xl">Loans, intel, faction vendors, home upgrades, and the daily scene. Money is a tool &mdash; spend it like one.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-emerald-200/60 font-bold">Cash</div>
                        <div className="text-3xl font-black font-mono text-amber-300">${cash.toLocaleString()}</div>
                    </div>
                    <button onClick={onBack} className="px-4 py-3 border border-emerald-300/30 rounded-xl text-xs font-black tracking-widest hover:bg-emerald-400/10">EXIT</button>
                </div>
            </header>

            <nav className="flex flex-wrap gap-2 mb-6">
                {SECTIONS.map((candidate) => (
                    <button
                        key={candidate.id}
                        onClick={() => setSection(candidate.id)}
                        className={clsx(
                            'px-3 py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest',
                            section === candidate.id
                                ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100'
                                : 'border-white/10 text-zinc-400 hover:bg-white/5'
                        )}
                    >
                        {candidate.label}
                    </button>
                ))}
            </nav>

            {section === 'overview' && (
                <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6 max-w-6xl w-full mx-auto">
                    <section className="space-y-6">
                        <div className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 md:p-6">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/60 font-bold mb-4">Finance contracts</div>
                            {financeContracts.length === 0 && <p className="text-sm text-zinc-500 italic">No finance contracts available. Build faction reputation to unlock casino, market, and career work.</p>}
                            <div className="space-y-3">
                                {financeContracts.map((offer) => {
                                    const completed = completedFinance.includes(offer.id);
                                    return (
                                        <div key={offer.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-white">{offer.title}</h3>
                                                        <span className="text-[9px] uppercase tracking-widest border border-white/20 rounded-full px-2 py-1 text-zinc-300">{offer.faction}</span>
                                                        {completed && <span className="text-[9px] uppercase tracking-widest text-emerald-300">completed</span>}
                                                    </div>
                                                    <p className="text-xs text-zinc-400 mt-1">{offer.description}</p>
                                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">
                                                        +${offer.reward.cash} · {offer.reward.xp} XP · +{offer.reward.reputation} {offer.faction} rep
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (completed) { addNotification('You already handled that one.'); return; }
                                                        gameState.acceptContract(offer.id);
                                                    }}
                                                    disabled={completed}
                                                    className={clsx('px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shrink-0', completed ? 'bg-white/5 text-zinc-600' : 'bg-emerald-300 text-black hover:bg-emerald-200')}
                                                >
                                                    {completed ? 'Done' : 'Accept'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-4">Accept here, then complete the objective through normal play: win the listed casino game, arrive at the target location, or finish a work shift.</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 md:p-6">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/60 font-bold mb-4">Today&rsquo;s scene · Day {gameState.world.day}</div>
                            {dailyActivities.length === 0 && <p className="text-sm text-zinc-500 italic">Nothing is happening today. Rest or check back tomorrow.</p>}
                            <div className="space-y-3">
                                {dailyActivities.map((activity) => (
                                    <ActivityRow key={activity.id} activity={activity} onPerform={() => gameState.performCityActivity(activity.id)} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-3">Debt ledger</div>
                            {finance.loanBalance > 0 ? (
                                <div className="space-y-2">
                                    <div className="text-2xl font-black text-red-300">${finance.loanBalance.toLocaleString()} owed</div>
                                    <div className="text-xs text-zinc-400">Payment due in {finance.loanDaysRemaining} day{finance.loanDaysRemaining === 1 ? '' : 's'} · {(finance.interestRate * 100).toFixed(0)}% rate</div>
                                    <div className="text-xs text-zinc-500">Defaults: {finance.defaults}/3 — at 3 defaults no one in Paper City will lend to you again.</div>
                                </div>
                            ) : (
                                <div className="text-sm text-emerald-300">No outstanding debt. Your ledger is clean.</div>
                            )}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-400">
                            <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-3">Market intel feed</div>
                            {Object.keys(market.intelTips || {}).length === 0 && <div className="text-zinc-500 italic">No purchased intel. Tips expire after the day they are issued.</div>}
                            {Object.entries(market.intelTips || {}).map(([symbol, tip]) => (
                                <div key={symbol} className="flex items-center justify-between py-1">
                                    <span className="font-mono text-white">{symbol}</span>
                                    <span className={clsx('text-xs font-bold uppercase', tip.direction === 'bull' ? 'text-emerald-300' : tip.direction === 'bear' ? 'text-red-300' : 'text-zinc-400')}>{tip.direction} · {tip.accuracy}% source</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            )}

            {section === 'loans' && (
                <LoanSection />
            )}

            {section === 'intel' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl w-full mx-auto">
                    {INTEL_SOURCES.map((source) => (
                        <div key={source.id} className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 flex flex-col">
                            <h3 className="font-bold text-white">{source.name}</h3>
                            <p className="text-xs text-zinc-400 mt-2 flex-1">{source.description}</p>
                            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-3">{source.accuracy}% accuracy</div>
                            <button onClick={() => gameState.buyIntel(source.id)} disabled={cash < source.cost} className={clsx('mt-4 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest', cash < source.cost ? 'bg-white/5 text-zinc-600' : 'bg-emerald-300 text-black hover:bg-emerald-200')}>Buy tip · ${source.cost}</button>
                        </div>
                    ))}
                </div>
            )}

            {section === 'vendors' && (
                <div className="space-y-6 max-w-6xl w-full mx-auto">
                    {vendors.length === 0 && <p className="text-sm text-zinc-500 italic">No faction vendors trust you yet. Reach 8+ reputation with a faction, or commit to one, to open their supply lines.</p>}
                    {vendors.map((vendor) => (
                        <div key={vendor.id} className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 md:p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-white">{vendor.name}</h3>
                                    <p className="text-xs text-zinc-400 mt-1">{vendor.description}</p>
                                </div>
                                <span className="text-[9px] uppercase tracking-widest border border-white/20 rounded-full px-2 py-1 text-zinc-300">{vendor.faction}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {vendor.stock.map((entry) => {
                                    const price = getVendorPrice(gameState, vendor, entry.itemId);
                                    const item = ITEMS[entry.itemId];
                                    return (
                                        <div key={entry.itemId} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 flex flex-col">
                                            <div className="text-sm font-bold text-white">{item?.name || entry.itemId}</div>
                                            <div className="text-[11px] text-zinc-500 mt-1 flex-1">{item?.description}</div>
                                            <button onClick={() => gameState.buyFromVendor(vendor.id, entry.itemId)} disabled={cash < price} className={clsx('mt-3 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest', cash < price ? 'bg-white/5 text-zinc-600' : 'bg-emerald-300 text-black hover:bg-emerald-200')}>
                                                Buy · ${price}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {section === 'housing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-6xl w-full mx-auto">
                    {HOUSING_UPGRADES.map((upgrade) => {
                        const owned = gameState.player.housing.upgrades.includes(upgrade.id);
                        return (
                            <div key={upgrade.id} className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 flex flex-col">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="font-bold text-white">{upgrade.name}</h3>
                                    {upgrade.isSafehouseOnly && <span className="text-[9px] uppercase tracking-widest text-amber-300 border border-amber-300/30 rounded-full px-2 py-1">home install</span>}
                                </div>
                                <p className="text-xs text-zinc-400 mt-2 flex-1">{upgrade.description}</p>
                                <div className="text-[11px] text-emerald-200/80 mt-2">{upgrade.effect}</div>
                                <button
                                    onClick={() => gameState.buyHousingUpgrade(upgrade.id)}
                                    disabled={owned || cash < upgrade.cost}
                                    className={clsx('mt-4 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest', owned ? 'bg-white/5 text-emerald-300' : cash < upgrade.cost ? 'bg-white/5 text-zinc-600' : 'bg-emerald-300 text-black hover:bg-emerald-200')}
                                >
                                    {owned ? 'Installed' : `Install · $${upgrade.cost}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {section === 'activities' && (
                <div className="space-y-3 max-w-6xl w-full mx-auto">
                    <p className="text-sm text-zinc-400 mb-4">The city rotates its scene every three days. Faction-specific activities appear once you are committed or trusted. Activities cost Energy and time.</p>
                    {dailyActivities.length === 0 && <p className="text-sm text-zinc-500 italic">Quiet day. Tomorrow brings new opportunities.</p>}
                    {dailyActivities.map((activity) => (
                        <ActivityRow key={activity.id} activity={activity} onPerform={() => gameState.performCityActivity(activity.id)} />
                    ))}
                </div>
            )}
        </div>
    );
};

const ActivityRow = ({ activity, onPerform }: { activity: ReturnType<typeof getDailyActivities>[number]; onPerform: () => void }) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
            <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{activity.title}</h3>
                {activity.factions && <span className="text-[9px] uppercase tracking-widest border border-white/20 rounded-full px-2 py-1 text-zinc-300">{activity.factions.join('/')}</span>}
            </div>
            <p className="text-xs text-zinc-400 mt-1">{activity.description}</p>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-2">
                {activity.energyCost} energy · {activity.timeCost} min{activity.cashCost > 0 ? ` · $${activity.cashCost} stake` : ''}
                {activity.rewards.cash ? ` · pays $${activity.rewards.cash}` : ''}
                {activity.rewards.relationshipNpcId ? ' · social bond' : ''}
                {activity.rewards.reputation ? ` · +${activity.rewards.reputation} ${activity.rewards.reputationFaction} rep` : ''}
            </div>
        </div>
        <button onClick={onPerform} className="px-3 py-2 rounded-lg bg-emerald-300 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 shrink-0">Take part</button>
    </div>
);

const LoanSection = () => {
    const finance = useGameStore((state) => state.finance);
    const cash = useGameStore((state) => state.player.stats.worth);
    const takeLoan = useGameStore((state) => state.takeLoan);
    const repayLoan = useGameStore((state) => state.repayLoan);
    const [amount, setAmount] = useState(200);

    const offerAmounts = [100, 300, 800, 1500];
    const maxLoan = 2000;
    const blocked = finance.defaults >= 3;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-6xl w-full mx-auto">
            <div className="rounded-2xl border border-emerald-300/20 bg-black/20 p-5 md:p-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-200/60 font-bold mb-4">Take a loan</div>
                {blocked ? (
                    <p className="text-sm text-red-300 font-bold">You have defaulted 3 times. No lender in Paper City will front you money anymore.</p>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2">
                            {offerAmounts.map((offer) => (
                                <button key={offer} onClick={() => setAmount(offer)} className={clsx('px-3 py-2 rounded-lg border text-xs font-black', amount === offer ? 'border-emerald-300/60 bg-emerald-400/15 text-emerald-100' : 'border-white/10 text-zinc-400 hover:bg-white/5')}>${offer}</button>
                            ))}
                        </div>
                        <button onClick={() => takeLoan(Math.min(amount, maxLoan))} disabled={finance.loanBalance > 0} className={clsx('mt-4 w-full px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest', finance.loanBalance > 0 ? 'bg-white/5 text-zinc-600' : 'bg-emerald-300 text-black hover:bg-emerald-200')}>
                            Borrow ${amount} · repay ${Math.ceil(amount * (1 + finance.interestRate))} in 3 days
                        </button>
                        <p className="text-[11px] text-zinc-500 mt-3">One loan at a time. Missed payments seize 10% of the balance from your cash, raise your rate, and count toward default. Lenders talk — every default costs Demon standing.</p>
                    </>
                )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 md:p-6">
                <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 font-bold mb-4">Repay</div>
                {finance.loanBalance > 0 ? (
                    <>
                        <div className="text-3xl font-black text-red-300">${finance.loanBalance.toLocaleString()}</div>
                        <div className="text-xs text-zinc-400 mt-1 mb-4">Due in {finance.loanDaysRemaining} day{finance.loanDaysRemaining === 1 ? '' : 's'}</div>
                        <div className="flex flex-wrap gap-2">
                            <button onClick={() => repayLoan(Math.min(100, finance.loanBalance))} disabled={cash < 1} className="px-3 py-2 rounded-lg border border-white/20 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/5">Pay $100</button>
                            <button onClick={() => repayLoan(finance.loanBalance)} disabled={cash < 1} className="px-3 py-2 rounded-lg bg-emerald-300 text-black text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200">Pay in full</button>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-emerald-300">No outstanding debt.</p>
                )}
            </div>
        </div>
    );
};
