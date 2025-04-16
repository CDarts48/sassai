import { NextResponse } from 'next/server';
import { createClient } from '@alpacahq/typescript-sdk';

export async function GET() {
    try {
        const client = createClient({
            key: process.env.NEXT_PUBLIC_ALPACA_API_KEY_ID,
            secret: process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY,
        });

        const news = await client.getNews({
            symbols: 'AAPL,TSLA',
            limit: 10,
        });

        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}