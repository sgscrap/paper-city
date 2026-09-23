'use client';

import { useUIStore } from '@/stores/uiStore';

export function GameShell({ children }: { children: React.ReactNode }) {
    const { uiMode, liveOpacity } = useUIStore();

    return (
        <div
            className={`h-screen w-screen overflow-hidden flex flex-col md:flex-row transition-opacity duration-[360ms] ease-linear ${(uiMode === 'boot' || liveOpacity === 0) ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            {children}
        </div>
    );
}
