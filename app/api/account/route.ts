import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
    try {
        if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_KEY_SECRET) {
            return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 });
        }

        const options = {
            method: 'GET',
            url: `https://paper-api.alpaca.markets/v2/account`,
            headers: {
                accept: 'application/json',
                'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID,
                'APCA-API-SECRET-KEY': process.env.APCA_API_KEY_SECRET,
            },
        };

        const response = await axios.request(options);
        console.log('Raw API Response:', response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching account information:', error);
        console.error('Error details:', error.response ? error.response.data : error.message);
        return NextResponse.json({ error: 'Failed to fetch account information', details: error.message }, { status: 500 });
    }
}