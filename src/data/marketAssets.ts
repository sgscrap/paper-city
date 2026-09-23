export interface MarketAssetDef {
    id: string; // Internal Symbol (BTC)
    coingeckoId: string;
    decimals: number;
    name: string;
}

export const MARKET_ASSETS: Record<string, MarketAssetDef> = {
    BTC: { id: 'BTC', coingeckoId: "bitcoin", decimals: 2, name: 'Bitcoin' },
    ETH: { id: 'ETH', coingeckoId: "ethereum", decimals: 2, name: 'Ethereum' },
    SOL: { id: 'SOL', coingeckoId: "solana", decimals: 2, name: 'Solana' },
    BNB: { id: 'BNB', coingeckoId: "binancecoin", decimals: 2, name: 'BNB' },
    XRP: { id: 'XRP', coingeckoId: "ripple", decimals: 4, name: 'XRP' },
    ADA: { id: 'ADA', coingeckoId: "cardano", decimals: 4, name: 'Cardano' },
    DOGE: { id: 'DOGE', coingeckoId: "dogecoin", decimals: 4, name: 'Dogecoin' },
    TRX: { id: 'TRX', coingeckoId: "tron", decimals: 4, name: 'TRON' },
    LINK: { id: 'LINK', coingeckoId: "chainlink", decimals: 2, name: 'Chainlink' },
    XMR: { id: 'XMR', coingeckoId: "monero", decimals: 2, name: 'Monero' }
};
