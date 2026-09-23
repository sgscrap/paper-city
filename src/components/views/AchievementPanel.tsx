import { ACHIEVEMENTS } from '@/data/achievements';
import { QUESTS } from '@/data/quests';
import { useGameStore } from '@/stores/gameStore';
import clsx from 'clsx';

interface AchievementPanelProps {
    onBack: () => void;
}

export const AchievementPanel = ({ onBack }: AchievementPanelProps) => {
    const unlockedAchievements = useGameStore(state => state.achievements);
    const factionReputation = useGameStore(state => state.factionReputation);
    const contentFlags = useGameStore(state => state.contentFlags);
    const factionIdentity = useGameStore(state => state.factionIdentity);
    const quests = useGameStore(state => state.quests);
    const arcSummaries = useGameStore(state => state.arcSummaries);
    const defectFaction = useGameStore(state => state.defectFaction);
    const completedArcs = Object.values(quests)
        .filter((quest) => quest.status === 'completed' && QUESTS[quest.id]?.arcConclusion)
        .map((quest) => QUESTS[quest.id]);
    const achievementList = Object.values(ACHIEVEMENTS);

    return (
        <div className="flex flex-col h-full bg-bg-dark p-6 overflow-y-auto">
            <header className="mb-8 flex items-center justify-between border-b border-border-main pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tighter text-text-main">MILESTONES</h1>
                    <p className="text-text-muted text-xs uppercase tracking-widest">Vertical Slice Progress</p>
                </div>
                <button
                    onClick={onBack}
                    className="coalition-panel px-4 py-2 text-xs hover:bg-bg-main active:scale-95 transition-all text-text-muted hover:text-text-main"
                >
                    [ RETURN_TO_CITY ]
                </button>
            </header>

            <section className="coalition-panel p-5 mb-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.22em] mb-1">Faction Identity</div>
                        <div className="text-xl font-black text-white uppercase tracking-tight">
                            {factionIdentity.primaryFaction ? factionIdentity.primaryFaction : 'Uncommitted'}
                        </div>
                        <p className="text-xs text-text-muted mt-1">
                            {factionIdentity.status === 'defected'
                                ? 'You crossed a line. Former allies will remember the betrayal.'
                                : factionIdentity.primaryFaction
                                    ? 'Your primary identity shapes access, dialogue, and rewards.'
                                    : 'Choose a signal when the city offers you a real stake.'}
                        </p>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-coalition-blue border border-coalition-blue/30 px-2 py-1 rounded">
                        {factionIdentity.status}
                    </div>
                </div>
                {factionIdentity.primaryFaction && (
                    <div className="mb-5 flex flex-wrap gap-2">
                        {(['angel', 'ghost', 'demon'] as const)
                            .filter((faction) => faction !== factionIdentity.primaryFaction)
                            .map((faction) => (
                                <button
                                    key={faction}
                                    onClick={() => defectFaction(faction)}
                                    disabled={factionIdentity.betrayals.includes(faction) || factionReputation[faction] < 15}
                                    className="px-3 py-2 rounded border border-border-main text-[10px] uppercase tracking-widest text-text-muted disabled:opacity-40 hover:border-red-400 hover:text-red-300 transition-colors"
                                >
                                    {factionReputation[faction] >= 15 ? `Defect to ${faction}` : `${faction}: need 15 rep`}
                                </button>
                            ))}
                    </div>
                )}
                <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.22em] mb-3">Arc Signal</div>
                <div className="grid grid-cols-3 gap-3">
                    {(['angel', 'ghost', 'demon'] as const).map((faction) => (
                        <div key={faction} className="rounded-lg border border-border-main bg-bg-main p-3 text-center">
                            <div className={clsx("text-xs font-black uppercase tracking-widest", faction === 'angel' ? 'text-ghost' : faction === 'ghost' ? 'text-coalition-blue' : 'text-demon')}>{faction}</div>
                            <div className="text-xl font-mono text-white mt-1">{factionReputation[faction] >= 0 ? '+' : ''}{factionReputation[faction]}</div>
                            <div className="text-[9px] text-text-muted uppercase mt-1">{contentFlags[`faction_${faction}`] ? 'Aligned' : 'Uncommitted'}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="coalition-panel p-5 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.22em]">Arc Summary</div>
                        <p className="text-xs text-text-muted mt-1">Short-term endings recorded for replay.</p>
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-text-muted">{completedArcs.length} / 3 complete</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {(['angel', 'ghost', 'demon'] as const).map((faction) => {
                        const arc = completedArcs.find((quest) => quest.arcConclusion === faction);
                        const milestoneCount = factionIdentity.milestones.filter((milestone) => milestone.includes(faction)).length;
                        return (
                            <div key={faction} className="rounded-lg border border-border-main bg-bg-main p-3">
                                <div className="text-xs font-black uppercase tracking-widest text-white">{faction}</div>
                                <div className="text-[10px] text-text-muted mt-2">{arc ? arc.title : 'Arc not concluded'}</div>
                                {arcSummaries[faction] && (
                                    <div className="text-[9px] text-coalition-gold uppercase tracking-widest mt-2">
                                        Ending: {arcSummaries[faction]!.endingId.replace(/_/g, ' ')} · {arcSummaries[faction]!.choiceIds.length} choice{arcSummaries[faction]!.choiceIds.length === 1 ? '' : 's'}
                                    </div>
                                )}
                                <div className="text-[9px] uppercase tracking-widest text-coalition-blue mt-2">{milestoneCount} signal{milestoneCount === 1 ? '' : 's'}</div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementList.map((ach) => {
                    const isUnlocked = !!unlockedAchievements[ach.id];
                    return (
                        <div
                            key={ach.id}
                            className={clsx(
                                "coalition-panel p-4 flex gap-4 items-center transition-all duration-500",
                                isUnlocked
                                    ? "bg-bg-main border-coalition-blue shadow-glow-blue"
                                    : "bg-bg-dark border-border-main opacity-40 grayscale"
                            )}
                        >
                            <div className={clsx(
                                "text-3xl w-12 h-12 flex items-center justify-center rounded-sm",
                                isUnlocked ? "bg-coalition-blue/10" : "bg-bg-dark"
                            )}>
                                {ach.icon || '🏆'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={clsx(
                                    "font-black tracking-tighter text-sm uppercase",
                                    isUnlocked ? "text-coalition-blue" : "text-text-muted"
                                )}>
                                    {ach.title}
                                </div>
                                <div className="text-xs text-text-muted truncate">
                                    {ach.description}
                                </div>
                                {isUnlocked && (
                                    <div className="text-[10px] text-coalition-blue/50 font-mono mt-1 italic">
                                        UNLOCKED: {new Date(unlockedAchievements[ach.id]).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <footer className="mt-12 p-4 border-t border-border-main text-center">
                <p className="text-[10px] text-text-muted font-mono tracking-widest uppercase">
                    Collected {Object.keys(unlockedAchievements).length} / {achievementList.length} Milestones
                </p>
            </footer>
        </div>
    );
};
