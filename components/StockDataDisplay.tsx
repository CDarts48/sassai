import React from 'react';

interface StockData {
    date: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
}

interface StockResponse {
    "Meta Data": {
        "1. Information": string;
        "2. Symbol": string;
        "3. Last Refreshed": string;
        "4. Output Size": string;
        "5. Time Zone": string;
    };
    stockData: StockData[];
}

interface StockDataDisplayProps {
    data: StockResponse;
}

// Add a helper function to format dates to MM-DD-YYYY
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
}

const StockDataDisplay: React.FC<StockDataDisplayProps> = ({ data }) => {
    return (
        <div className="p-6 bg-black text-white-800 shadow rounded-lg">
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">
                    Stock Information for {data["Meta Data"]["2. Symbol"]}
                </h2>
                <p className="text-sm mb-1">
                    Last Refreshed: {formatDate(data["Meta Data"]["3. Last Refreshed"])}
                </p>
                <p className="text-sm">
                    Time Zone: {data["Meta Data"]["5. Time Zone"]}
                </p>
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-4">Recent Trading Days</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.stockData.map((day) => (
                        <div key={day.date} className="border p-4 rounded-md">
                            <h4 className="font-bold">{formatDate(day.date)}</h4>
                            <p>
                                <span className="font-medium">Open:</span> ${day.open}
                            </p>
                            <p>
                                <span className="font-medium">High:</span> ${day.high}
                            </p>
                            <p>
                                <span className="font-medium">Low:</span> ${day.low}
                            </p>
                            <p>
                                <span className="font-medium">Close:</span> ${day.close}
                            </p>
                            <p>
                                <span className="font-medium">Volume:</span> {day.volume}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StockDataDisplay;
