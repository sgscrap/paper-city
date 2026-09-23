'use client';

import { useGameStore } from '@/stores/gameStore';
import { useUIStore } from '@/stores/uiStore';

const STEPS = [
    {
        eyebrow: '01 · ARRIVAL',
        title: 'Welcome to Paper City',
        body: 'This is a living urban RPG. Your time, Energy, money, relationships, and reputation determine which opportunities the city gives back.',
        hint: 'You can pause this guide at any time and replay it from the system panel.'
    },
    {
        eyebrow: '02 · THE MAP',
        title: 'Move through The Block',
        body: 'The map is your main navigation layer. Use WASD or the mobile joystick to move, then press E or tap ACTION near a building or exit.',
        hint: 'Your home is always available on The Block, even when faction districts are locked.'
    },
    {
        eyebrow: '03 · PEOPLE',
        title: 'Talk before you commit',
        body: 'NPCs remember conversations, gifts, insults, trust, fear, and faction choices. Some conversations create quests; others change karma, luck, or relationships.',
        hint: 'Start by finding Ace on The Block, then explore the other contacts around the city.'
    },
    {
        eyebrow: '04 · YOUR DAY',
        title: 'Spend Energy with intention',
        body: 'Work, train, study, fight, and nightlife activities compete for Energy, time, and cash. Sleep at home to begin a new day and restore Energy.',
        hint: 'The Job Board shows rotating contracts. You must accept a contract before activity can complete it.'
    },
    {
        eyebrow: '05 · IDENTITY',
        title: 'Choose how the city knows you',
        body: 'Angel represents order and legitimacy. Ghost represents information and leverage. Demon represents power and fear. Your identity changes access, contracts, careers, services, and reactions.',
        hint: 'There is no single correct route. Crossing factions creates consequences instead of erasing your history.'
    },
    {
        eyebrow: '06 · RETURN LOOP',
        title: 'Come back tomorrow',
        body: 'Paper City is built around return visits. Daily contracts rotate, NPC effects refresh, Club Lust develops its own reputation and heat, and the city remembers what you ignored.',
        hint: 'Use the map, accept one opportunity, meet someone, and return home. That is the core loop.'
    }
];

export const WorldTutorialOverlay = () => {
    const characterCreated = useGameStore((state) => state.flags.character_created);
    const introSeen = useGameStore((state) => state.flags.intro_seen);
    const tutorial = useGameStore((state) => state.tutorial);
    const advanceTutorial = useGameStore((state) => state.advanceTutorial);
    const skipTutorial = useGameStore((state) => state.skipTutorial);
    const setActiveTab = useUIStore((state) => state.setActiveTab);

    if (!characterCreated || !introSeen || tutorial.completed) return null;

    const step = STEPS[Math.min(tutorial.step, STEPS.length - 1)];
    const isLast = tutorial.step === STEPS.length - 1;

    const openRelevantView = () => {
        if (tutorial.step === 1 || tutorial.step === 2) setActiveTab('location');
        if (tutorial.step === 3) setActiveTab('jobs');
        if (tutorial.step === 5) setActiveTab('club');
    };

    return (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-mono">
            <div className="w-full max-w-2xl coalition-panel border border-coalition-blue/30 shadow-[0_0_50px_rgba(0,240,255,0.14)] p-6 md:p-8">
                <div className="flex items-center justify-between gap-4 mb-8">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-coalition-blue font-bold">PAPER CITY FIELD GUIDE</div>
                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">{tutorial.step + 1} / {STEPS.length}</div>
                </div>

                <div className="h-1 bg-zinc-900 rounded-full overflow-hidden mb-8">
                    <div className="h-full bg-coalition-blue transition-all duration-300" style={{ width: `${((tutorial.step + 1) / STEPS.length) * 100}%` }} />
                </div>

                <div className="mb-8">
                    <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-3">{step.eyebrow}</div>
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-4">{step.title}</h1>
                    <p className="text-base md:text-lg leading-relaxed text-zinc-300">{step.body}</p>
                    <div className="mt-5 border-l-2 border-coalition-blue/50 pl-4 text-sm leading-relaxed text-zinc-500">{step.hint}</div>
                </div>

                <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-3 border-t border-zinc-800 pt-5">
                    <button onClick={skipTutorial} className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-zinc-300 text-left">Skip field guide</button>
                    <div className="flex gap-3">
                        {(tutorial.step === 1 || tutorial.step === 2 || tutorial.step === 3 || tutorial.step === 5) && (
                            <button onClick={openRelevantView} className="px-4 py-3 border border-coalition-blue/30 text-coalition-blue rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-coalition-blue/10">Open View</button>
                        )}
                        <button onClick={advanceTutorial} className="px-5 py-3 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-coalition-blue hover:text-white transition-all">{isLast ? 'Enter the city' : 'Next briefing'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
