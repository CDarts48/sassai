import axios from 'axios';

async function fetchNews() {
    const options = {
        method: 'GET',
        url: 'https://data.alpaca.markets/v1beta1/news?sort=desc',
        headers: {
            accept: 'application/json',
            'APCA-API-KEY-ID': process.env.NEXT_PUBLIC_ALPACA_API_KEY_ID,
            'APCA-API-SECRET-KEY': process.env.NEXT_PUBLIC_ALPACA_SECRET_KEY,
        },
    };

    try {
        const response = await axios.request(options);
        console.log('News:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching news:', error);
        throw error;
    }
}

export default fetchNews;