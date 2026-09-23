'use client';

import React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { Toast } from './Toast';

export const ToastContainer = () => {
    const toasts = useUIStore(state => state.toasts);

    // Rule: Max 3 visible at once
    const visibleToasts = toasts.slice(0, 3);

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col items-end pointer-events-none">
            {/* Wrapper for pointer events so clicks pass through empty space */}
            <div className="pointer-events-auto">
                {visibleToasts.map((toast) => (
                    <Toast key={toast.id} item={toast} />
                ))}
            </div>
        </div>
    );
};
