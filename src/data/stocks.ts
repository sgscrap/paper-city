export interface StockAsset {
    symbol: string;
    name: string;
    description: string;
    basePrice: number;
    volatility: number; // 0.01 to 0.10
    logoUrl: string; // Placeholder or path
    color: string; // Tailwind class
}

export const STOCKS: Record<string, StockAsset> = {
    'CORP': {
        symbol: 'CORP',
        name: 'MegaCorp Ind.',
        description: 'Owns everything you see.',
        basePrice: 120.50,
        volatility: 0.02,
        logoUrl: '/icons/corp.png',
        color: 'text-blue-500'
    },
    'TECH': {
        symbol: 'TECH',
        name: 'Future Systems',
        description: 'Building the matrix, one chip at a time.',
        basePrice: 340.00,
        volatility: 0.04,
        logoUrl: '/icons/tech.png',
        color: 'text-purple-500'
    },
    'MED': {
        symbol: 'MED',
        name: 'LifeGen Pharma',
        description: 'They cure you, then bill you.',
        basePrice: 85.20,
        volatility: 0.015,
        logoUrl: '/icons/med.png',
        color: 'text-red-500'
    },
    'ARMS': {
        symbol: 'ARMS',
        name: 'Iron Defense',
        description: 'Peace through superior firepower.',
        basePrice: 210.75,
        volatility: 0.03,
        logoUrl: '/icons/arms.png',
        color: 'text-orange-500'
    }
};
