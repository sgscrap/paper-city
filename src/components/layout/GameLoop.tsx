'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';

export const GameLoop = () => {
    const advanceTime = useGameStore((state) => state.advanceTime);
    const incrementPlayTime = useGameStore((state) => state.incrementPlayTime);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Game Loop: 1 second = 1 minute game time
    // This can be paused or accelerated later
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            advanceTime(1);
            incrementPlayTime(1000);
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [advanceTime, incrementPlayTime]);

    return null; // Logic only
};
