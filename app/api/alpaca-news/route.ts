import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request) {
    try {
        console.log('Request received:', request.url);
        console.log('Environment Variables:', {
            APCA_API_KEY_ID: process.env.APCA_API_KEY_ID || 'MISSING',
            APCA_API_KEY_SECRET: process.env.APCA_API_KEY_SECRET || 'MISSING',
        });

        if (!process.env.APCA_API_KEY_ID || !process.env.APCA_API_KEY_SECRET) {
            console.error('Missing Alpaca API credentials');
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
        // console.log('News:', response.data);
        return NextResponse.json(response.data);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news', details: error.message }, { status: 500 });
    }
}