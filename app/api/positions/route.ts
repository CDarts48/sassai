import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const url = 'https://paper-api.alpaca.markets/v2/positions';
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'APCA-API-KEY-ID': process.env.APCA_API_KEY_ID || '',
        'APCA-API-SECRET-KEY': process.env.APCA_API_KEY_SECRET || ''
      }
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      console.error('Alpaca API error:', data);
      return NextResponse.json({ error: 'Failed to fetch positions' }, { status: response.status });
    }

    console.log('Positions data from Alpaca:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}