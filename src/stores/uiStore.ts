import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export type ToastVariant = "neutral" | "success" | "warning" | "danger" | "ghost" | "angel" | "demon";

export interface ToastItem {
    id: string;
    title: string;
    description?: string;
    variant?: ToastVariant;
    createdAt: number;
    durationMs?: number;
    dedupeKey?: string;
}

interface UIState {
    uiMode: 'boot' | 'transition' | 'live';
    bootOpacity: number;
    liveOpacity: number;
    activeTab: 'location' | 'inventory' | 'shop' | 'university' | 'casino' | 'gym' | 'jobs' | 'trading' | 'safehouse' | 'club' | 'combat' | 'economy' | 'leaderboard' | 'achievements';
    toasts: ToastItem[];
    shake: boolean;
    activeDialogue: {
        npcId: string;
        text: string | string[];
        type: 'chat' | 'gift' | 'insult';
    } | null;

    // Actions
    setUiMode: (mode: 'boot' | 'transition' | 'live') => void;
    startSession: () => void;
    setActiveTab: (tab: 'location' | 'inventory' | 'shop' | 'university' | 'casino' | 'gym' | 'jobs' | 'trading' | 'safehouse' | 'club' | 'combat' | 'economy' | 'leaderboard' | 'achievements') => void;

    // Dialogue System
    openDialogue: (npcId: string, text: string | string[], type: 'chat' | 'gift' | 'insult') => void;
    closeDialogue: () => void;

    // Toast System
    toast: (payload: Omit<ToastItem, 'id' | 'createdAt'>) => void;
    dismissToast: (id: string) => void;
    clearToasts: () => void;

    // Legacy (keep for compatibility until refactor complete)
    addNotification: (message: string) => void;

    triggerShake: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    uiMode: 'boot',
    bootOpacity: 1,
    liveOpacity: 0,
    activeTab: 'location',
    toasts: [],
    shake: false,
    activeDialogue: null,

    setUiMode: (mode) => set({ uiMode: mode }),

    startSession: () => {
        const { uiMode } = get();
        if (uiMode !== 'boot') return;

        // 1. Begin transition state
        set({ uiMode: 'transition' });

        // 2. Trigger cross-fade via CSS transitions in next frame
        requestAnimationFrame(() => {
            set({ bootOpacity: 0, liveOpacity: 1 });
        });

        // 3. Finalize to 'live' after transitions complete (matching GameShell 360ms)
        window.setTimeout(() => {
            set({ uiMode: 'live' });
        }, 400);
    },

    setActiveTab: (tab) => set({ activeTab: tab }),

    openDialogue: (npcId, text, type) => set({ activeDialogue: { npcId, text, type } }),
    closeDialogue: () => set({ activeDialogue: null }),

    toast: (payload) => {
        const { toasts } = get();
        const now = Date.now();

        // Deduplication Logic
        if (payload.dedupeKey) {
            const existingIndex = toasts.findIndex(t => t.dedupeKey === payload.dedupeKey);
            if (existingIndex !== -1) {
                const existing = toasts[existingIndex];
                // If it's recent (< 2s), update it instead of adding new
                if (now - existing.createdAt < 2000) {
                    const updatedToasts = [...toasts];
                    updatedToasts[existingIndex] = {
                        ...existing,
                        ...payload,
                        createdAt: now, // Reset timer
                        id: uuidv4() // Refresh ID to trigger animation/reactivity if needed
                    };
                    set({ toasts: updatedToasts });
                    return;
                }
            }
        }

        // New Toast
        const newToast: ToastItem = {
            id: uuidv4(),
            createdAt: now,
            durationMs: 2800,
            variant: 'neutral',
            ...payload
        };

        // Queue Logic: Add to front, keep max 10 in state (though only 3 visible in UI)
        let updatedToasts = [newToast, ...toasts];
        if (updatedToasts.length > 10) {
            updatedToasts = updatedToasts.slice(0, 10);
        }

        set({ toasts: updatedToasts });

        // Auto-dismiss
        setTimeout(() => {
            get().dismissToast(newToast.id);
        }, newToast.durationMs || 2800);
    },

    dismissToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter(t => t.id !== id)
        }));
    },

    clearToasts: () => set({ toasts: [] }),

    // Legacy Support (wraps toast)
    addNotification: (message) => {
        get().toast({
            title: 'Notification',
            description: message,
            variant: 'neutral'
        });
    },

    triggerShake: () => {
        set({ shake: true });
        setTimeout(() => set({ shake: false }), 500);
    }
}));
