import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("keywords");
  if (!symbol) {
    return NextResponse.json({ error: "Missing keywords" }, { status: 400 });
  }

  // Optional parameters with defaults:
  const outputsize = searchParams.get("outputsize") || "compact";
  const datatype = searchParams.get("datatype") || "json";

  const apikey = process.env.ALPHA_VANTAGE_API_KEY;
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(symbol)}&outputsize=${outputsize}&datatype=${datatype}&apikey=${apikey}`;

  const res = await fetch(url);
  if (!res.ok) {
    return NextResponse.json(
      { error: `Alpha Vantage API error: ${res.status}` },
      { status: res.status }
    );
  }

  const data = await res.json();
  console.log("TIME_SERIES_DAILY response:", data);

  const timeSeriesKey = "Time Series (Daily)";

  if (data[timeSeriesKey]) {
    // Create an array of entries from the time series data
    const dates = Object.keys(data[timeSeriesKey]).sort((a, b) => (a < b ? 1 : -1));
    const stockData = dates.map(date => {
      const dayData = data[timeSeriesKey][date];
      return {
        date,
        open: dayData["1. open"],
        high: dayData["2. high"],
        low: dayData["3. low"],
        close: dayData["4. close"],
        volume: dayData["5. volume"]
      };
    });
    // Optionally limit the result to the 4 most recent days
    data.stockData = stockData.slice(0, 4);
    // Remove original time series key if you prefer cleaner output
    delete data[timeSeriesKey];
  }

  return NextResponse.json(data);
}