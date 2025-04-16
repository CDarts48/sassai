import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_KEY_SECRET) {
            return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 });
        }

        const options = {
            method: 'GET',
            url: `${process.env.APCA_API_BASE_URL}?sort=desc`,
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
                'APCA-API-SECRET-KEY': process.env.APCA_API_KEY_SECRET,
            },
        };

        const response = await axios.request(options);
        const news = response.data && Array.isArray(response.data.news) ? response.data.news : [];
        return NextResponse.json({ news });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news', details: error.message }, { status: 500 });
    }
}