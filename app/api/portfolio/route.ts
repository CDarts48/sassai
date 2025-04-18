import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_KEY_SECRET) {
            return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 });
        }

        const options = {
            method: 'GET',
            url: `${process.env.APCA_TRADE_API_BASE_URL}/v2/portfolio`,
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
                'APCA-API-SECRET-KEY': process.env.APCA_API_KEY_SECRET,
            },
        };

        const response = await axios.request(options);

        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        return NextResponse.json({ error: 'Failed to fetch portfolio', details: error.message }, { status: 500 });
    }
}