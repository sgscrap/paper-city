'use client';

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/uiStore';

export function LiveBootToast() {
    const uiMode = useUIStore((s) => s.uiMode);
    const did = useRef(false);
    const toast = useUIStore((s) => s.toast);

    useEffect(() => {
        if (uiMode === 'live' && !did.current) {
            did.current = true;
            toast({
                title: 'WELCOME BACK',
                description: 'PAPER CITY IS OPEN.',
                variant: 'success',
                dedupeKey: 'boot_open'
            });
        }
    }, [uiMode, toast]);

    return null;
}
