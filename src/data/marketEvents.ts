import { MarketEvent } from '@/types';

export const MARKET_EVENTS: MarketEvent[] = [
    {
        id: 'sec_crackdown',
        title: 'SEC Crackdown',
        description: 'Regulatory pressure mounting on privacy coins including XMR.',
        impacts: { XMR: 0.7, BTC: 0.95 },
        duration: 1
    },
    {
        id: 'elon_tweet',
        title: 'The Musk Effect',
        description: 'A dog-related meme was posted by a billionaire.',
        impacts: { DOGE: 2.0, BTC: 1.05 },
        duration: 1
    },
    {
        id: 'goldman_entry',
        title: 'Institutional Inflow',
        description: 'Major banks are opening crypto custody desks.',
        impacts: { BTC: 1.2, ETH: 1.15, SOL: 1.1 },
        duration: 1
    },
    {
        id: 'solana_outage',
        title: 'Network Outage',
        description: 'Mainnet-beta is experiencing consensus issues.',
        impacts: { SOL: 0.8, ETH: 1.05 },
        duration: 1
    },
    {
        id: 'etf_approval',
        title: 'ETF Approved',
        description: 'The spot Bitcoin ETF has been officially approved.',
        impacts: { BTC: 1.5, ETH: 1.3, SOL: 1.2 },
        duration: 2
    }
];
