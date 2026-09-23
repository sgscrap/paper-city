import React from 'react';
import { ToastItem } from '@/stores/uiStore';
import clsx from 'clsx';
import { useUIStore } from '@/stores/uiStore';

interface ToastProps {
    item: ToastItem;
}

export const Toast = ({ item }: ToastProps) => {
    const dismissToast = useUIStore(state => state.dismissToast);

    // Variant Styles
    const getVariantStyles = (v: ToastItem['variant']) => {
        switch (v) {
            case 'success': return 'border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            case 'warning': return 'border-amber-500/50 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]';
            case 'danger': return 'border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]';
            case 'ghost': return 'border-ghost/50 text-ghost shadow-ghost';
            case 'demon': return 'border-demon/50 text-demon shadow-demon';
            case 'angel': return 'border-angel/50 text-angel shadow-angel';
            case 'neutral':
            default: return 'border-border-soft text-text-main hover:border-white/20';
        }
    };

    return (
        <div
            onClick={() => dismissToast(item.id)}
            className={clsx(
                "coalition-panel mb-2 p-3 min-w-[300px] max-w-sm cursor-pointer transition-all animate-in slide-in-from-right-full fade-in duration-300",
                getVariantStyles(item.variant)
            )}
        >
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <h4 className="font-bold text-sm tracking-wide uppercase">{item.title}</h4>
                    {item.description && (
                        <p className="text-xs opacity-80 mt-1 leading-relaxed font-mono">{item.description}</p>
                    )}
                </div>
                <button className="text-xs opacity-50 hover:opacity-100">&times;</button>
            </div>

            {/* Countdown / Progress Bar (Optional visual flair) */}
            <div className="w-full h-0.5 bg-white/10 mt-2 rounded-full overflow-hidden">
                <div
                    ref={(el) => {
                        if (el) {
                            el.style.setProperty('animation-duration', `${item.durationMs || 2800}ms`);
                            el.style.setProperty('animation-timing-function', 'linear');
                        }
                    }}
                    className="h-full bg-current opacity-50 animate-shrink origin-left"
                />
            </div>
        </div>
    );
};
