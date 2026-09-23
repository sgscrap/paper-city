export interface CryptoAsset {
    symbol: string;
    name: string;
    description: string;
    logoUrl: string;
    basePrice: number;
    volatility: number;
    color: string;
}

export const CRYPTO: Record<string, CryptoAsset> = {
    'BTC': {
        symbol: 'BTC',
        name: 'Bitcoin',
        description: 'The King. Digital Gold. Peer-to-peer electronic cash.',
        logoUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=032',
        basePrice: 5000, // Scaled for game economy
        volatility: 0.1,
        color: 'text-orange-500'
    },
    'ETH': {
        symbol: 'ETH',
        name: 'Ethereum',
        description: 'Smart contracts and decentralized applications.',
        logoUrl: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032',
        basePrice: 350,
        volatility: 0.15,
        color: 'text-purple-400'
    },
    'BNB': {
        symbol: 'BNB',
        name: 'BNB',
        description: 'The fuel of the Binance ecosystem.',
        logoUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032',
        basePrice: 60,
        volatility: 0.12,
        color: 'text-yellow-500'
    },
    'SOL': {
        symbol: 'SOL',
        name: 'Solana',
        description: 'Hyperscale blockchain. Fast and cheap.',
        logoUrl: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032',
        basePrice: 40,
        volatility: 0.25,
        color: 'text-cyan-400'
    },
    'XRP': {
        symbol: 'XRP',
        name: 'XRP',
        description: 'Banking liquidity and cross-border payments.',
        logoUrl: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=032',
        basePrice: 2,
        volatility: 0.2,
        color: 'text-blue-500'
    },
    'DOGE': {
        symbol: 'DOGE',
        name: 'Dogecoin',
        description: 'Much wow. Such doge. Very money.',
        logoUrl: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=032',
        basePrice: 0.15,
        volatility: 0.4,
        color: 'text-yellow-600'
    },
    'TRX': {
        symbol: 'TRX',
        name: 'TRON',
        description: 'Decentralizing the web. Sun-powered.',
        logoUrl: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=032',
        basePrice: 0.12,
        volatility: 0.15,
        color: 'text-red-500'
    },
    'ADA': {
        symbol: 'ADA',
        name: 'Cardano',
        description: 'Scientific philosophy and mathematical proof.',
        logoUrl: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=032',
        basePrice: 0.4,
        volatility: 0.18,
        color: 'text-blue-600'
    },
    'LINK': {
        symbol: 'LINK',
        name: 'Chainlink',
        description: 'Decentralized Oracle network.',
        logoUrl: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=032',
        basePrice: 15,
        volatility: 0.22,
        color: 'text-blue-400'
    },
    'XMR': {
        symbol: 'XMR',
        name: 'Monero',
        description: 'Private. Untraceable. Anonymous.',
        logoUrl: 'https://cryptologos.cc/logos/monero-xmr-logo.svg?v=032',
        basePrice: 160,
        volatility: 0.15,
        color: 'text-orange-600'
    }
};
