'use client';

import { useGameStore } from '@/stores/gameStore';

const EVENT_LABELS: Record<string, string> = {
    RIVAL_INTERRUPTS_CONTRACT: 'Rival interruption',
    NPC_DEBT_CALL: 'Debt called in',
    FACTION_RECRUITER: 'Faction shortcut offered',
    MARKET_OPPORTUNITY: 'Market opportunity',
    PUBLIC_ACTION: 'Public consequence',
    TRUSTED_CONTACT_REQUEST: 'Trusted contact request',
    FAILED_RELATIONSHIP_THREAT: 'Relationship threat',
    LEVERAGE_ESCAPE: 'Violence avoided',
    LUCKY_FIND: 'Lucky find',
    PICKPOCKET: 'Pickpocket',
    INSPIRATION: 'Sudden inspiration',
    SECOND_WIND: 'Second wind',
    BAD_VIBES: 'Bad vibes'
};

export const ReactiveEventOverlay = () => {
    const lastOutcome = useGameStore((state) => state.randomEvents.lastOutcome);
    if (!lastOutcome) return null;

    return (
        <div className="fixed left-4 bottom-16 md:bottom-4 z-40 max-w-xs rounded-lg border border-amber-300/20 bg-black/80 px-3 py-2 text-[10px] uppercase tracking-widest text-amber-100 shadow-lg backdrop-blur">
            <span className="text-amber-300">CITY REACTS</span>
            <span className="mx-2 text-zinc-600">·</span>
            {EVENT_LABELS[lastOutcome] || lastOutcome.replace(/_/g, ' ')}
        </div>
    );
};
