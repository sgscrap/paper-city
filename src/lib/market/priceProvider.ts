import { MARKET_ASSETS } from '@/data/marketAssets';

interface PriceData {
    usd: number;
    change24h: number;
}

interface PriceResponse {
    asOf: number;
    source: 'coingecko' | 'cache' | 'fallback';
    stale: boolean;
    ttlSeconds: number;
    prices: Record<string, PriceData>;
}

// Simple in-memory cache
let cache: {
    data: Record<string, PriceData> | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

// Config
const CACHE_TTL_MS = 20 * 1000; // 20s validity
// const STALE_THRESHOLD_MS = 60 * 1000; // Data older than 60s is critically stale (optional logic)

export const PriceProvider = {
    async getPrices(): Promise<PriceResponse> {
        const now = Date.now();

        // 1. Check Cache Validity
        // If we have data and it's fresh enough (< TTL)
        if (cache.data && (now - cache.timestamp < CACHE_TTL_MS)) {
            return {
                asOf: cache.timestamp,
                source: 'cache',
                stale: false,
                ttlSeconds: Math.floor((CACHE_TTL_MS - (now - cache.timestamp)) / 1000),
                prices: cache.data
            };
        }

        // 2. Fetch from CoinGecko
        try {
            const ids = Object.values(MARKET_ASSETS).map(a => a.coingeckoId).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

            const res = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 15 } // Hints for Next.js fetch cache
            });

            if (!res.ok) throw new Error(`CoinGecko API Error: ${res.status}`);

            const data = await res.json();
            const normalized: Record<string, PriceData> = {};

            // Map response back to internal symbols
            Object.values(MARKET_ASSETS).forEach(asset => {
                const cgData = data[asset.coingeckoId];
                if (cgData) {
                    normalized[asset.id] = {
                        usd: cgData.usd,
                        change24h: cgData.usd_24h_change || 0
                    };
                }
            });

            // Update Cache
            cache = {
                data: normalized,
                timestamp: now
            };

            return {
                asOf: now,
                source: 'coingecko',
                stale: false,
                ttlSeconds: CACHE_TTL_MS / 1000,
                prices: normalized
            };

        } catch (error) {
            console.error('PriceProvider Error:', error);

            // 3. Fallback to Stale Cache
            if (cache.data) {
                return {
                    asOf: cache.timestamp,
                    source: 'cache',
                    stale: true, // It is explicitly stale because fetch failed
                    ttlSeconds: 0,
                    prices: cache.data
                };
            }

            // 4. Critical Failure (No cache, API down) -> Fallback Generator
            // In a real app, maybe throw 503, but for game continuity we return sim data
            return {
                asOf: now,
                source: 'fallback',
                stale: true,
                ttlSeconds: 0,
                prices: generateFallbackPrices()
            };
        }
    }
};

function generateFallbackPrices(): Record<string, PriceData> {
    const prices: Record<string, PriceData> = {};
    // Base prices roughly based on marketAssets or hardcoded "safe" values
    // Using a simple map here for demonstration if import fails, or re-import base prices
    Object.values(MARKET_ASSETS).forEach(asset => {
        prices[asset.id] = {
            usd: 100, // Safe dummy default
            change24h: 0
        };
    });
    return prices;
}
