import { NextResponse } from 'next/server';
import { PriceProvider } from '@/lib/market/priceProvider';

export async function GET() {
    try {
        const data = await PriceProvider.getPrices();

        // Return with appropriate cache headers for CDN/Browser
        // Max-age 15s to match our polling interval
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30'
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prices' },
            { status: 500 }
        );
    }
}
