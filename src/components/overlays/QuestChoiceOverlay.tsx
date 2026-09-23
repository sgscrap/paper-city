import { QUESTS } from '@/data/quests';
import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';

const factionStyles = {
    angel: 'border-coalition-gold/40 hover:border-coalition-gold text-coalition-gold',
    ghost: 'border-neon-blue/40 hover:border-neon-blue text-neon-blue',
    demon: 'border-demon/40 hover:border-demon text-demon'
};

export const QuestChoiceOverlay = () => {
    const quests = useGameStore((state) => state.quests);
    const updateQuestObjective = useGameStore((state) => state.updateQuestObjective);
    const completeQuest = useGameStore((state) => state.completeQuest);
    const chooseQuest = useGameStore((state) => state.chooseQuest);
    const factionIdentity = useGameStore((state) => state.factionIdentity);

    const activeChoiceQuestId = Object.keys(quests).find((questId) => {
        const progress = quests[questId];
        return progress?.status === 'active' && Boolean(QUESTS[questId]?.choices?.length) && !progress.choiceId;
    });
    const quest = activeChoiceQuestId ? QUESTS[activeChoiceQuestId] : null;
    if (!activeChoiceQuestId || !quest?.choices) return null;

    const isFactionChoice = activeChoiceQuestId === 'pick_a_lane';
    const handleChoice = (choiceId: string) => {
        chooseQuest(activeChoiceQuestId, choiceId);
        if (isFactionChoice) {
            updateQuestObjective(activeChoiceQuestId, 'choose_path', true);
            completeQuest(activeChoiceQuestId);
            useUIStore.getState().toast({
                title: `FACTION CHOSEN: ${choiceId.toUpperCase()}`,
                description: 'Your future contracts, allies, and access will reflect this choice.',
                variant: 'success'
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500 font-mono overflow-y-auto">
            <div className="max-w-5xl w-full text-center space-y-8">
                <div className="relative">
                    <div className="absolute inset-x-0 -top-16 flex justify-center opacity-10 pointer-events-none">
                        <span className="text-7xl md:text-[120px] font-black uppercase text-white tracking-widest whitespace-nowrap">CROSSROADS</span>
                    </div>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mb-3 relative z-10">{quest.title}</div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter relative z-10">
                        {isFactionChoice ? 'PICK A LANE' : 'MAKE THE CALL'}
                    </h1>
                    <p className="text-zinc-400 text-sm md:text-lg max-w-2xl mx-auto relative z-10">{quest.description}</p>
                    {isFactionChoice && (
                        <p className="text-amber-300/80 text-xs uppercase tracking-widest mt-3 relative z-10">
                            Choose a primary identity. You can cross the line later, but every faction remembers who left.
                        </p>
                    )}
                </div>

                {factionIdentity.primaryFaction && isFactionChoice && (
                    <div className="text-xs uppercase tracking-widest text-amber-300 border border-amber-400/20 bg-amber-400/5 rounded p-3">
                        Identity already recorded as {factionIdentity.primaryFaction}. This choice cannot be rewritten from the crossroads.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                    {quest.choices.map((choice) => {
                        const factionClass = choice.faction ? factionStyles[choice.faction] : 'border-zinc-700 hover:border-white text-white';
                        const rewardParts = [
                            choice.rewards?.cash ? `$${choice.rewards.cash}` : '',
                            choice.rewards?.xp ? `${choice.rewards.xp} XP` : '',
                            ...Object.entries(choice.rewards?.reputation || {}).map(([faction, amount]) => `${faction} ${amount >= 0 ? '+' : ''}${amount}`)
                        ].filter(Boolean);

                        return (
                            <button
                                key={choice.id}
                                onClick={() => handleChoice(choice.id)}
                                className={`group relative coalition-panel min-h-64 flex flex-col p-6 transition-all hover:-translate-y-1 overflow-hidden border ${factionClass}`}
                            >
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500 mb-3">{choice.faction || 'Decision'}</div>
                                <h3 className="text-xl font-black uppercase tracking-widest mb-3">{choice.label}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed flex-1">{choice.description}</p>
                                {rewardParts.length > 0 && (
                                    <div className="mt-5 pt-3 border-t border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-500">
                                        Result: {rewardParts.join(' · ')}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
