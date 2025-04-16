import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        console.log('Request received:', request.url);
        console.log('Environment Variables:', {
            APCA_KEY_ID: process.env.APCA_KEY_ID || 'MISSING',
            APCA_KEY_SECRET: process.env.APCA_KEY_SECRET || 'MISSING',
        });

        if (!process.env.APCA_KEY_ID || !process.env.APCA_KEY_SECRET) {
            console.error('Missing Alpaca API credentials');
            return NextResponse.json({ error: 'Missing Alpaca API credentials' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const symbols = searchParams.get('symbols') || '*';
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const mode = searchParams.get('mode') || 'realtime';

        if (mode === 'historical') {
            console.log('Fetching historical news for symbols:', symbols);
            const response = await fetch(
                `https://data.alpaca.markets/v1beta1/news?symbols=${symbols}&limit=${limit}`,
                {
                    headers: {
                        'APCA-API-KEY-ID': process.env.APCA_KEY_ID,
                        'APCA-API-SECRET-KEY': process.env.APCA_KEY_SECRET,
                    },
                }
            );

            console.log('Alpaca API response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response from Alpaca API:', errorText);
                return NextResponse.json({ error: 'Failed to fetch historical news', details: errorText }, { status: response.status });
            }

            const news = await response.json();
            console.log('Historical news fetched successfully:', news);
            return NextResponse.json(news);
        } else {
            console.log('Connecting to Alpaca WebSocket for real-time news...');
            const news = await new Promise((resolve, reject) => {
                const ws = new WebSocket(process.env.NEXT_PUBLIC_ALPACA_NEWS_WS_URL);

                const newsItems = [];

                ws.onopen = () => {
                    console.log('WebSocket connection opened');
                    ws.send(
                        JSON.stringify({
                            action: 'subscribe',
                            news: symbols === '*' ? ['*'] : symbols.split(','),
                        })
                    );
                };

                ws.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);
                    if (message.T === 'n') {
                        newsItems.push(message);
                        if (newsItems.length >= limit) {
                            ws.close();
                            resolve(newsItems);
                        }
                    }
                };

                ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    ws.close();
                    reject(error);
                };

                ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    if (newsItems.length === 0) {
                        reject(new Error('No news received'));
                    }
                };
            });

            console.log('Real-time news fetched successfully:', news);
            return NextResponse.json(news);
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}