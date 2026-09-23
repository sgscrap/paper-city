import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/stores/gameStore';

const lines = [
    "Paper City doesn't care who you are.",
    "It only cares what you do.",
    "Every choice leaves a mark. Some make you money. Some make you enemies.",
    "Trust Yourself."
];

export const IntroOverlay = () => {
    const [step, setStep] = useState(0);
    const [fadingOut, setFadingOut] = useState(false);

    // Finish sequence logic (Memoized to stay stable for useEffect)
    const finish = useCallback(() => {
        setFadingOut(true);
        // Wait for fade out animation before updating state
        setTimeout(() => {
            useGameStore.setState((state) => ({
                flags: { ...state.flags, intro_seen: true }
            }));
        }, 1000);
    }, []);

    // Auto-advance logic
    useEffect(() => {
        if (fadingOut) return;

        // Determine timing based on line length, longer needed for 3rd line
        const duration = step === 2 ? 6000 : 4000;

        const timer = setTimeout(() => {
            if (step < lines.length - 1) {
                setStep(s => s + 1);
            } else {
                finish();
            }
        }, duration);

        return () => clearTimeout(timer);
    }, [step, fadingOut, finish]); // Added finish and lines (lines is now external const)


    // Skip Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' || e.code === 'Escape') {
                finish();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [finish]); // Added finish

    // Also support click to skip
    const handleClick = () => {
        finish();
    };

    return (
        <div
            onClick={handleClick}
            className={`fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-8 cursor-pointer transition-opacity duration-1000 ${fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
            <div className="max-w-2xl text-center space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-8 animate-fade-in-down">
                    PAPER <span className="text-neon-blue">CITY</span>
                </h1>

                {/* 
                  Key prop forces re-mount (and re-trigger of animations) 
                  when step changes. 
                */}
                <p key={step} className="text-xl md:text-2xl text-zinc-300 font-mono animate-fade-in-up">
                    {lines[step]}
                </p>

                <div className="fixed bottom-12 flex flex-col items-center gap-4">
                    <button
                        onClick={(e) => { e.stopPropagation(); finish(); }}
                        className="coalition-panel px-6 py-2 text-[10px] font-black tracking-widest text-text-muted hover:text-text-main hover:bg-bg-main active:scale-95 transition-all uppercase"
                    >
                        [ SKIP_INTRO_CORE ]
                    </button>
                    <div className="text-[10px] text-zinc-600 uppercase tracking-widest animate-pulse">
                        [Press Space to Skip]
                    </div>
                </div>
            </div>
        </div>
    );
};
