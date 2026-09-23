'use client';

// Inline fractal-noise texture: no external asset, works offline, no 404s.
const NOISE_TEXTURE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export const ScreenEffects = () => {
    return (
        <div className="pointer-events-none absolute inset-0 z-[9999] overflow-hidden">
            {/* CRT Scanlines */}
            <div className="absolute inset-0 scanlines opacity-30 mix-blend-overlay"></div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

            {/* Subtle Noise (improves 'film' look) */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: NOISE_TEXTURE }}></div>
        </div>
    );
};
